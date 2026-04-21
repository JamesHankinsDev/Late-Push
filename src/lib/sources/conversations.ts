import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  runTransaction,
  addDoc,
  increment,
} from "firebase/firestore";
import { getFirebaseDb } from "../firebase";
import {
  Conversation,
  DmMessage,
  MessageFlag,
  PublicProfile,
  TrustLevel,
} from "../types";
import {
  computeTrustLevel,
  pairId,
  sortedPair,
} from "../social/friendship";
import {
  classifyDmLocally,
  DmL1Decision,
} from "../moderation/dm";
import { getFriendship } from "./friendships";
import { getPublicProfile } from "./publicProfiles";

function convCol() {
  return collection(getFirebaseDb(), "conversations");
}
function msgCol(convId: string) {
  return collection(getFirebaseDb(), "conversations", convId, "messages");
}

// =========================================================================
// Conversations
// =========================================================================

/** Create (or fetch) a conversation. Gated by the recipient's dmsFrom setting. */
export async function openConversation(
  sender: { uid: string; alias: string; aliasColor: string },
  recipient: PublicProfile
): Promise<Conversation> {
  if (sender.uid === recipient.uid)
    throw new Error("Can't message yourself.");

  // Check dmsFrom on the recipient
  const setting = recipient.privacy.dmsFrom;
  if (setting === "none") {
    throw new Error(`${recipient.alias ? "@" + recipient.alias : "That user"} isn't accepting DMs.`);
  }
  if (setting === "friends") {
    const f = await getFriendship(sender.uid, recipient.uid);
    if (!f || f.status !== "accepted") {
      throw new Error(
        `${recipient.alias ? "@" + recipient.alias : "That user"} only accepts DMs from friends.`
      );
    }
  }

  const id = pairId(sender.uid, recipient.uid);
  const [userA, userB] = sortedPair(sender.uid, recipient.uid);
  const ref = doc(convCol(), id);
  const existing = await getDoc(ref);
  if (existing.exists()) return existing.data() as Conversation;

  const aliasA = userA === sender.uid ? sender.alias : recipient.alias;
  const aliasB = userB === sender.uid ? sender.alias : recipient.alias;
  const colorA =
    userA === sender.uid ? sender.aliasColor : recipient.aliasColor;
  const colorB =
    userB === sender.uid ? sender.aliasColor : recipient.aliasColor;

  const conv: Conversation = {
    id,
    userA,
    userB,
    aliasA,
    aliasB,
    aliasColorA: colorA,
    aliasColorB: colorB,
    messageCount: 0,
    createdAt: new Date().toISOString(),
  };
  await setDoc(ref, stripUndefined(conv as unknown as Record<string, unknown>));
  return conv;
}

export async function getConversation(
  id: string
): Promise<Conversation | null> {
  const snap = await getDoc(doc(convCol(), id));
  if (!snap.exists()) return null;
  return snap.data() as Conversation;
}

export async function listMyConversations(
  uid: string
): Promise<Conversation[]> {
  const [a, b] = await Promise.all([
    getDocs(query(convCol(), where("userA", "==", uid))),
    getDocs(query(convCol(), where("userB", "==", uid))),
  ]);
  const all = [...a.docs, ...b.docs].map((d) => d.data() as Conversation);
  const seen = new Set<string>();
  const deduped: Conversation[] = [];
  for (const c of all) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    deduped.push(c);
  }
  return deduped.sort((x, y) =>
    (y.lastMessageAt ?? y.createdAt).localeCompare(
      x.lastMessageAt ?? x.createdAt
    )
  );
}

// =========================================================================
// Messages
// =========================================================================

export async function listMessages(
  convId: string,
  max: number = 100
): Promise<DmMessage[]> {
  const q = query(msgCol(convId), orderBy("sentAt", "asc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as Omit<DmMessage, "id">) } as DmMessage)
  );
}

export interface SendMessageResult {
  message?: DmMessage;
  decision: DmL1Decision;
  flag?: MessageFlag;
}

/**
 * Send a message. Runs Layer 1 regex, Layer 2 LLM classification, writes
 * the message + updates the conversation's denormalized summary.
 *
 * If Layer 1 returns `block`, no write happens and the decision is returned.
 * If Layer 1 returns `warn`, the caller must re-invoke with `override=true`
 * to actually send (used for friend-tier soft warnings).
 * If Layer 2 classifies harassment/hate_speech/explicit, we also block and
 * log a moderation_queue entry.
 */
export async function sendMessage(args: {
  conversation: Conversation;
  sender: { uid: string; alias: string; aliasColor: string };
  recipientSpotNames?: string[];
  senderSpotNames?: string[];
  body: string;
  override?: boolean; // user confirmed a soft warning
}): Promise<SendMessageResult> {
  const {
    conversation,
    sender,
    body,
    override,
    recipientSpotNames = [],
    senderSpotNames = [],
  } = args;

  // --- Trust level computation ---
  const friendship = await getFriendship(
    conversation.userA,
    conversation.userB
  );
  // Reflect the denormalized message count so trust promotion only requires
  // a friendship + some back-and-forth.
  const synthetic = friendship
    ? { ...friendship, messageCount: conversation.messageCount }
    : null;
  const trust: TrustLevel = computeTrustLevel(synthetic);

  // --- Layer 1 ---
  const extraSpotNames = [...recipientSpotNames, ...senderSpotNames];
  const l1 = classifyDmLocally(body, { trust, extraSpotNames });
  if (l1.action === "block") {
    return { decision: l1 };
  }
  if (l1.action === "warn" && !override) {
    return { decision: l1 };
  }

  // --- Layer 2 ---
  let flag: MessageFlag = "safe";
  try {
    const res = await fetch("/api/moderation/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: body, trust }),
    });
    if (res.ok) {
      const data = (await res.json()) as { flag: MessageFlag };
      flag = data.flag;
    }
  } catch {
    // Fail open
    flag = "safe";
  }

  // Hard-block categories from Layer 2
  if (flag === "hate_speech" || flag === "harassment" || flag === "explicit") {
    // Log the attempted message to the moderation queue so repeat offenders
    // show up in aggregate.
    const recipientUid =
      conversation.userA === sender.uid
        ? conversation.userB
        : conversation.userA;
    try {
      await addDoc(collection(getFirebaseDb(), "moderation_queue"), {
        reporterUid: sender.uid, // self-reported because sender tried
        targetUid: sender.uid,
        conversationId: conversation.id,
        kind: "dm" as const,
        reason: `blocked_on_send:${flag}`,
        classification: flag,
        createdAt: new Date().toISOString(),
      });
    } catch {
      // non-fatal; the send still blocks
    }
    void recipientUid;
    return {
      decision: {
        action: "block",
        reason:
          flag === "hate_speech"
            ? "Message contains hate speech and can't be sent."
            : flag === "explicit"
            ? "Explicit content isn't allowed in DMs."
            : "That message reads as harassment and can't be sent.",
      },
      flag,
    };
  }

  // --- Write the message + update conversation summary ---
  const db = getFirebaseDb();
  const msgRef = doc(msgCol(conversation.id));
  const convRef = doc(convCol(), conversation.id);
  const sentAt = new Date().toISOString();

  const payload: DmMessage = {
    id: msgRef.id,
    conversationId: conversation.id,
    authorUid: sender.uid,
    authorAlias: sender.alias,
    authorAliasColor: sender.aliasColor,
    body: body.trim(),
    sentAt,
    flag: flag !== "safe" ? flag : undefined,
  };

  await runTransaction(db, async (tx) => {
    tx.set(msgRef, stripUndefined(payload as unknown as Record<string, unknown>));
    tx.update(convRef, {
      lastMessage: body.trim().slice(0, 200),
      lastMessageAt: sentAt,
      lastMessageBy: sender.uid,
      messageCount: increment(1),
    });
  });

  // If Layer 2 flagged (non-safe but not hard-blocked), queue for review.
  if (flag !== "safe") {
    try {
      await addDoc(collection(getFirebaseDb(), "moderation_queue"), {
        reporterUid: sender.uid,
        targetUid: sender.uid,
        messageId: msgRef.id,
        conversationId: conversation.id,
        kind: "dm" as const,
        reason: `auto_flag:${flag}`,
        classification: flag,
        createdAt: new Date().toISOString(),
      });
    } catch {
      /* non-fatal */
    }
  }

  return {
    decision: { action: "send" },
    message: payload,
    flag,
  };
}

// =========================================================================
// Reports (Layer 3)
// =========================================================================

export async function reportMessage(args: {
  reporterUid: string;
  message: DmMessage;
  reason?: string;
}): Promise<void> {
  const { reporterUid, message, reason } = args;
  await addDoc(collection(getFirebaseDb(), "moderation_queue"), {
    reporterUid,
    targetUid: message.authorUid,
    messageId: message.id,
    conversationId: message.conversationId,
    kind: "dm" as const,
    reason: reason ?? "user_report",
    createdAt: new Date().toISOString(),
  });
}

// Re-export so callers can probe recipient privacy before opening a conv.
export { getPublicProfile };

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}
