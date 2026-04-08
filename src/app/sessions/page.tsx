"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { getUserSessions } from "@/lib/sources/firestore";
import { Session } from "@/lib/types";
import { getTrickById } from "@/lib/curriculum";
import CoachResponse from "@/components/sessions/CoachResponse";
import Link from "next/link";

export default function SessionsPage() {
  const { profile } = useAuthContext();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    getUserSessions(profile.uid)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, [profile]);

  const totalHours = (
    sessions.reduce((acc, s) => acc + s.duration, 0) / 60
  ).toFixed(1);

  const bodyFeelEmoji = (feel: string) => {
    if (feel === "fine") return "🟢";
    if (feel === "sore") return "🟡";
    return "🔴";
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Sessions
          </h1>
          <p className="text-sm text-concrete-400 mt-1">
            {sessions.length} sessions &middot; {totalHours} hours total
          </p>
        </div>
        <Link
          href="/sessions/new"
          className="px-4 py-2 rounded-lg bg-skate-lime text-concrete-950 font-bold text-sm hover:bg-skate-lime/90 transition-colors"
        >
          + Log Session
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-concrete-900 border border-concrete-700 rounded-lg p-4 animate-pulse"
            >
              <div className="h-4 bg-concrete-800 rounded w-1/3 mb-2" />
              <div className="h-3 bg-concrete-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-concrete-500 text-lg mb-2">No sessions yet</p>
          <p className="text-concrete-600 text-sm mb-6">
            Get out there and log your first session.
          </p>
          <Link
            href="/sessions/new"
            className="inline-block px-6 py-2 rounded-lg bg-skate-lime text-concrete-950 font-bold text-sm"
          >
            Log Your First Session
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const isExpanded = expandedId === session.id;
            return (
              <div
                key={session.id}
                className="bg-concrete-900 border border-concrete-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : session.id)
                  }
                  className="w-full text-left p-4 hover:bg-concrete-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {session.date}
                        <span className="font-normal text-concrete-400 ml-2">
                          {session.duration} min
                        </span>
                      </p>
                      <p className="text-xs text-concrete-400 mt-1">
                        {session.tricksPracticed
                          .map((id) => getTrickById(id)?.name ?? id)
                          .join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span title={session.bodyFeel}>
                        {bodyFeelEmoji(session.bodyFeel)}
                      </span>
                      <span className="text-concrete-500 text-sm">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-concrete-800">
                    {session.location && (
                      <p className="text-xs text-concrete-400 pt-3">
                        📍 {session.location}
                      </p>
                    )}
                    {session.whatClicked && (
                      <div>
                        <p className="text-[10px] font-bold text-concrete-500 uppercase">
                          Clicked
                        </p>
                        <p className="text-sm text-concrete-200">
                          {session.whatClicked}
                        </p>
                      </div>
                    )}
                    {session.whatDidnt && (
                      <div>
                        <p className="text-[10px] font-bold text-concrete-500 uppercase">
                          Didn&apos;t Click
                        </p>
                        <p className="text-sm text-concrete-200">
                          {session.whatDidnt}
                        </p>
                      </div>
                    )}
                    {session.injuryNotes && (
                      <div>
                        <p className="text-[10px] font-bold text-skate-red uppercase">
                          Injury Notes
                        </p>
                        <p className="text-sm text-concrete-200">
                          {session.injuryNotes}
                        </p>
                      </div>
                    )}
                    {session.coachResponse && (
                      <CoachResponse response={session.coachResponse} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
