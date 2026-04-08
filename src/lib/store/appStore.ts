"use client";

import { create } from "zustand";
import { UserProfile, Session } from "../types";

interface AppState {
  profile: UserProfile | null;
  sessions: Session[];
  setProfile: (profile: UserProfile | null) => void;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  sessions: [],
  setProfile: (profile) => set({ profile }),
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),
}));
