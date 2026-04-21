import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  runTransaction,
  increment,
  addDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "../firebase";
import {
  Post,
  PostComment,
  PostReaction,
  PostStamp,
  PostVisibility,
  ReactionType,
} from "../types";
import { detectHateSpeech } from "../moderation/patterns";

function postCol() {
  return collection(getFirebaseDb(), "posts");
}
function reactionCol() {
  return collection(getFirebaseDb(), "postReactions");
}
function commentsCol(postId: string) {
  return collection(getFirebaseDb(), "posts", postId, "comments");
}

function reactionDocId(postId: string, uid: string) {
  return `${postId}__${uid}`;
}

function generatePostId(): string {
  // Time-ordered-ish id so we can skip an orderBy index when reading by
  // document id as a secondary sort. Still unique via random suffix.
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `p-${ts}-${rand}`;
}

// =========================================================================
// Posts
// =========================================================================

export interface NewPostInput {
  body: string;
  visibility: PostVisibility;
  sessionRef?: string;
  trickRef?: string;
  trickName?: string;
  stamp?: PostStamp;
}

export class PostError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "PostError";
  }
}

export async function createPost(
  input: NewPostInput,
  author: { uid: string; alias: string; aliasColor: string }
): Promise<Post> {
  const body = input.body.trim();
  if (body.length < 1) throw new PostError("EMPTY", "Post can't be empty.");
  if (body.length > 2000)
    throw new PostError("TOO_LONG", "Posts top out at 2000 characters.");
  if (detectHateSpeech(body))
    throw new PostError(
      "BLOCKED",
      "That post contains language we can't allow. Late Push is for everyone."
    );

  const id = generatePostId();
  const post: Post = {
    id,
    authorUid: author.uid,
    authorAlias: author.alias,
    authorAliasColor: author.aliasColor,
    body,
    sessionRef: input.sessionRef,
    trickRef: input.trickRef,
    trickName: input.trickName,
    stamp: input.stamp,
    visibility: input.visibility,
    reactionCounts: { push: 0, same: 0, fire: 0 },
    commentCount: 0,
    createdAt: new Date().toISOString(),
  };

  await setDoc(
    doc(postCol(), id),
    stripUndefined(post as unknown as Record<string, unknown>)
  );
  return post;
}

export async function getPost(id: string): Promise<Post | null> {
  const snap = await getDoc(doc(postCol(), id));
  if (!snap.exists()) return null;
  return snap.data() as Post;
}

export async function deletePost(id: string): Promise<void> {
  // Remove reactions + comments subcollection first so orphans don't linger.
  const [reacts, comments] = await Promise.all([
    getDocs(query(reactionCol(), where("postId", "==", id))),
    getDocs(commentsCol(id)),
  ]);
  await Promise.all([
    ...reacts.docs.map((d) => deleteDoc(d.ref)),
    ...comments.docs.map((d) => deleteDoc(d.ref)),
  ]);
  await deleteDoc(doc(postCol(), id));
}

/**
 * Feed query — public posts, most recent first. We merge friends-visibility
 * posts client-side in the tab based on the viewer's friend list since
 * Firestore can't OR across queries cleanly.
 */
export async function listPublicFeed(max: number = 30): Promise<Post[]> {
  const q = query(
    postCol(),
    where("visibility", "==", "public"),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Post);
}

export async function listPostsByAuthor(
  authorUid: string,
  max: number = 30
): Promise<Post[]> {
  const q = query(
    postCol(),
    where("authorUid", "==", authorUid),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Post);
}

// =========================================================================
// Reactions
// =========================================================================

/**
 * Set (or switch) the viewer's reaction on a post. Handles every transition
 * atomically — idempotent same-reaction clicks no-op, same-user-different-
 * reaction swaps, and same-reaction toggles-off via clearReaction.
 */
export async function setReaction(
  post: Pick<Post, "id">,
  viewer: { uid: string; alias: string },
  next: ReactionType
): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(reactionCol(), reactionDocId(post.id, viewer.uid));
  const postRef = doc(postCol(), post.id);

  await runTransaction(db, async (tx) => {
    const existing = await tx.get(ref);
    const prior = existing.exists()
      ? (existing.data() as PostReaction).type
      : null;
    if (prior === next) return; // idempotent

    const payload: PostReaction = {
      id: reactionDocId(post.id, viewer.uid),
      postId: post.id,
      uid: viewer.uid,
      alias: viewer.alias,
      type: next,
      createdAt: existing.exists()
        ? (existing.data() as PostReaction).createdAt
        : new Date().toISOString(),
    };
    tx.set(ref, stripUndefined(payload as unknown as Record<string, unknown>));

    if (prior) {
      tx.update(postRef, {
        [`reactionCounts.${prior}`]: increment(-1),
      });
    }
    tx.update(postRef, {
      [`reactionCounts.${next}`]: increment(1),
    });
  });
}

export async function clearReaction(
  postId: string,
  uid: string
): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(reactionCol(), reactionDocId(postId, uid));
  const postRef = doc(postCol(), postId);
  await runTransaction(db, async (tx) => {
    const existing = await tx.get(ref);
    if (!existing.exists()) return;
    const prior = (existing.data() as PostReaction).type;
    tx.delete(ref);
    tx.update(postRef, {
      [`reactionCounts.${prior}`]: increment(-1),
    });
  });
}

export async function getMyReaction(
  postId: string,
  uid: string
): Promise<PostReaction | null> {
  const snap = await getDoc(doc(reactionCol(), reactionDocId(postId, uid)));
  if (!snap.exists()) return null;
  return snap.data() as PostReaction;
}

export async function getMyReactionsForPosts(
  uid: string,
  postIds: string[]
): Promise<Record<string, PostReaction>> {
  if (postIds.length === 0) return {};
  // Firestore doesn't support `where name in (...)`, so fan out. At MVP
  // scale this is fine (feed limit = 30).
  const snaps = await Promise.all(
    postIds.map((id) => getDoc(doc(reactionCol(), reactionDocId(id, uid))))
  );
  const result: Record<string, PostReaction> = {};
  for (const s of snaps) {
    if (s.exists()) {
      const r = s.data() as PostReaction;
      result[r.postId] = r;
    }
  }
  return result;
}

// =========================================================================
// Comments
// =========================================================================

export async function addComment(
  postId: string,
  author: { uid: string; alias: string; aliasColor: string },
  body: string
): Promise<PostComment> {
  const trimmed = body.trim();
  if (trimmed.length < 1)
    throw new PostError("EMPTY", "Comment can't be empty.");
  if (trimmed.length > 500)
    throw new PostError("TOO_LONG", "Comments max out at 500 chars.");
  if (detectHateSpeech(trimmed))
    throw new PostError(
      "BLOCKED",
      "That comment contains language we can't allow."
    );

  const db = getFirebaseDb();
  const postRef = doc(postCol(), postId);
  const now = new Date().toISOString();

  const docRef = await addDoc(commentsCol(postId), {
    postId,
    authorUid: author.uid,
    authorAlias: author.alias,
    authorAliasColor: author.aliasColor,
    body: trimmed,
    createdAt: now,
  });
  // Bump the denormalized count (separate write — atomic with the addDoc
  // would need a transaction, and the eventual-consistency gap here is
  // cosmetic).
  try {
    await runTransaction(db, async (tx) => {
      tx.update(postRef, { commentCount: increment(1) });
    });
  } catch {
    /* count drift is acceptable */
  }

  return {
    id: docRef.id,
    postId,
    authorUid: author.uid,
    authorAlias: author.alias,
    authorAliasColor: author.aliasColor,
    body: trimmed,
    createdAt: now,
  };
}

export async function listComments(
  postId: string,
  max: number = 100
): Promise<PostComment[]> {
  const q = query(
    commentsCol(postId),
    orderBy("createdAt", "asc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as Omit<PostComment, "id">) } as PostComment)
  );
}

export async function deleteComment(
  postId: string,
  commentId: string
): Promise<void> {
  await deleteDoc(doc(commentsCol(postId), commentId));
  try {
    const postRef = doc(postCol(), postId);
    await runTransaction(getFirebaseDb(), async (tx) => {
      tx.update(postRef, { commentCount: increment(-1) });
    });
  } catch {
    /* count drift acceptable */
  }
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}
