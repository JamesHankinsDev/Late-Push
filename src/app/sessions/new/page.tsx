"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";
import SessionForm from "@/components/sessions/SessionForm";
import CoachResponse from "@/components/sessions/CoachResponse";
import { createSession, getUserSessions, updateSession } from "@/lib/sources/firestore";
import { getTrickById } from "@/lib/curriculum";
import { BodyFeel, Session } from "@/lib/types";

type Outcome = "landed" | "close" | "bailed" | "injured";

const OUTCOME_TO_PREFILL: Record<
  Outcome,
  { whatClicked?: string; whatDidnt?: string; bodyFeel?: BodyFeel }
> = {
  landed: { whatClicked: "Landed it clean." },
  close: { whatClicked: "Got close — felt the pop." },
  bailed: { whatDidnt: "Bailed tonight. Going to sleep on it." },
  injured: { bodyFeel: "injured" },
};

export default function NewSessionPage() {
  const { profile, refreshSessions } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [coachResponse, setCoachResponse] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);

  const trickIdParam = searchParams.get("trickId");
  const outcomeParam = searchParams.get("outcome") as Outcome | null;
  const initialTricks =
    trickIdParam && getTrickById(trickIdParam) ? [trickIdParam] : [];
  const prefill = outcomeParam ? OUTCOME_TO_PREFILL[outcomeParam] ?? {} : {};

  const handleSubmit = async (
    sessionData: Omit<Session, "id" | "userId" | "createdAt" | "coachResponse">
  ) => {
    if (!profile) return;
    setLoading(true);

    try {
      // Save session
      const sessionId = await createSession({
        ...sessionData,
        userId: profile.uid,
        createdAt: new Date().toISOString(),
      });

      setSessionSaved(true);
      setLoading(false);
      setCoachLoading(true);

      // Fetch coach response
      const allSessions = await getUserSessions(profile.uid);
      const currentSession = { id: sessionId, ...sessionData, userId: profile.uid, createdAt: new Date().toISOString() };

      const coachRes = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "session",
          session: currentSession,
          profile,
          sessions: allSessions,
        }),
      });

      if (coachRes.ok) {
        const data = await coachRes.json();
        setCoachResponse(data.response);
        // Save coach response to session
        await updateSession(sessionId, { coachResponse: data.response });
      }

      // Invalidate the shared sessions cache so dashboard/profile reflect
      // the new session on their next render.
      await refreshSessions();
    } catch (error) {
      console.error("Error saving session:", error);
    } finally {
      setLoading(false);
      setCoachLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-white">
          Log Session
        </h1>
        <p className="text-sm text-concrete-400 mt-1">
          Track what you worked on. Your AI coach will review it.
        </p>
      </div>

      {!sessionSaved ? (
        <SessionForm
          onSubmit={handleSubmit}
          loading={loading}
          initialTricks={initialTricks}
          initialWhatClicked={prefill.whatClicked}
          initialWhatDidnt={prefill.whatDidnt}
          initialBodyFeel={prefill.bodyFeel}
        />
      ) : (
        <div className="space-y-6">
          <div className="bg-concrete-800 border border-skate-lime/30 rounded-lg p-4 text-center">
            <p className="text-skate-lime font-display font-bold text-lg">
              Session Logged!
            </p>
            <p className="text-sm text-concrete-400 mt-1">
              Nice work getting out there.
            </p>
          </div>

          <CoachResponse response={coachResponse} loading={coachLoading} />

          <div className="flex gap-3">
            <button
              onClick={() => {
                setSessionSaved(false);
                setCoachResponse("");
              }}
              className="flex-1 py-2 rounded-lg bg-concrete-800 border border-concrete-700 text-white text-sm hover:bg-concrete-700 transition-colors"
            >
              Log Another
            </button>
            <button
              onClick={() => router.push("/sessions")}
              className="flex-1 py-2 rounded-lg bg-concrete-800 border border-concrete-700 text-white text-sm hover:bg-concrete-700 transition-colors"
            >
              View Sessions
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 py-2 rounded-lg bg-skate-lime text-concrete-950 text-sm font-bold hover:bg-skate-lime/90 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
