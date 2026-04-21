"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";
import { getFirebaseAuth } from "../firebase";
import {
  getUserProfile,
  createUserProfile,
  getUserSessions,
} from "../sources/firestore";
import { Session, UserProfile } from "../types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true); // auth state unknown
  const [profileLoading, setProfileLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Track which uid the cached sessions/profile belong to so we don't
  // surface stale state during sign-out/sign-in transitions.
  const currentUidRef = useRef<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), (firebaseUser) => {
      setUser(firebaseUser);
      // Settle the auth-loading gate immediately so the app can render
      // its shell without waiting for the profile doc to come back.
      setLoading(false);

      if (!firebaseUser) {
        currentUidRef.current = null;
        setProfile(null);
        setSessions([]);
        setProfileLoading(false);
        setSessionsLoading(false);
        return;
      }

      const uid = firebaseUser.uid;
      currentUidRef.current = uid;

      // Profile fetch (runs in parallel with sessions fetch below).
      setProfileLoading(true);
      (async () => {
        try {
          const existing = await getUserProfile(uid);
          if (currentUidRef.current !== uid) return;
          if (existing) {
            setProfile(existing);
          } else {
            const newProfile: UserProfile = {
              uid,
              email: firebaseUser.email ?? "",
              displayName:
                firebaseUser.displayName ??
                firebaseUser.email?.split("@")[0] ??
                "Skater",
              createdAt: new Date().toISOString(),
              currentTier: 0,
              trickProgress: {},
              badges: [],
            };
            await createUserProfile(newProfile);
            if (currentUidRef.current !== uid) return;
            setProfile(newProfile);
          }
        } finally {
          if (currentUidRef.current === uid) setProfileLoading(false);
        }
      })();

      // Sessions fetch — independent of the profile call so both land in parallel.
      setSessionsLoading(true);
      (async () => {
        try {
          const s = await getUserSessions(uid);
          if (currentUidRef.current !== uid) return;
          setSessions(s);
        } finally {
          if (currentUidRef.current === uid) setSessionsLoading(false);
        }
      })();
    });
    return unsub;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    return createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(getFirebaseAuth(), provider);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(getFirebaseAuth());
    setProfile(null);
    setSessions([]);
  }, []);

  const refreshProfile = useCallback(async () => {
    const uid = currentUidRef.current;
    if (!uid) return;
    const p = await getUserProfile(uid);
    if (currentUidRef.current === uid) setProfile(p);
  }, []);

  const refreshSessions = useCallback(async () => {
    const uid = currentUidRef.current;
    if (!uid) return;
    setSessionsLoading(true);
    try {
      const s = await getUserSessions(uid);
      if (currentUidRef.current === uid) setSessions(s);
    } finally {
      if (currentUidRef.current === uid) setSessionsLoading(false);
    }
  }, []);

  return {
    user,
    profile,
    sessions,
    loading,
    profileLoading,
    sessionsLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshProfile,
    refreshSessions,
  };
}
