import { Session, UserProfile } from "../types";
import { getTrickById, STAGES } from "../curriculum";

export function buildCoachPrompt(
  session: Session,
  profile: UserProfile,
  allSessions: Session[]
): string {
  const tricksPracticedNames = session.tricksPracticed
    .map((id) => getTrickById(id)?.name ?? id)
    .join(", ");

  const currentStageName =
    STAGES.find((s) => s.number === profile.currentStage)?.name ?? "Unknown";

  const recentSessions = allSessions
    .slice(-10)
    .map(
      (s) =>
        `- ${s.date}: ${s.duration}min, practiced ${s.tricksPracticed.map((id) => getTrickById(id)?.name ?? id).join(", ")}. Body: ${s.bodyFeel}${s.injuryNotes ? ` (${s.injuryNotes})` : ""}. Clicked: ${s.whatClicked || "nothing noted"}. Didn't click: ${s.whatDidnt || "nothing noted"}`
    )
    .join("\n");

  const bodyFeelHistory = allSessions.slice(-10).map((s) => s.bodyFeel);
  const soreCount = bodyFeelHistory.filter((f) => f === "sore").length;
  const injuredCount = bodyFeelHistory.filter((f) => f === "injured").length;

  const landedTricks = Object.entries(profile.trickProgress)
    .filter(([, p]) => p.status === "landed")
    .map(([id]) => getTrickById(id)?.name ?? id)
    .join(", ");

  const inProgressTricks = Object.entries(profile.trickProgress)
    .filter(([, p]) => p.status === "in_progress")
    .map(([id]) => getTrickById(id)?.name ?? id)
    .join(", ");

  return `You are a skate coach for Late Push, a skateboarding learning platform for adult beginners (ages 25-45). You're like a knowledgeable skate friend — encouraging, honest, slightly irreverent, never condescending. You understand that your user has a job, a body that doesn't heal like it used to, and limited time to skate.

IMPORTANT TONE GUIDELINES:
- Talk like a real skater friend, not a corporate wellness app
- Be specific with technical advice — generic "keep practicing!" is useless
- Acknowledge that learning to skate as an adult is genuinely hard and brave
- Light humor is welcome but don't force it
- If they're skating hurt, be direct about it — don't sugarcoat injury risk

USER PROFILE:
- Current Stage: ${profile.currentStage} (${currentStageName})
- Tricks Landed: ${landedTricks || "None yet"}
- Tricks In Progress: ${inProgressTricks || "None yet"}
- Total Sessions: ${allSessions.length}

TODAY'S SESSION:
- Date: ${session.date}
- Duration: ${session.duration} minutes
- Tricks Practiced: ${tricksPracticedNames}
- What Clicked: ${session.whatClicked || "Nothing noted"}
- What Didn't Click: ${session.whatDidnt || "Nothing noted"}
- Body Feel: ${session.bodyFeel}${session.injuryNotes ? ` — Notes: ${session.injuryNotes}` : ""}
- Location: ${session.location || "Not specified"}

RECENT SESSION HISTORY (last 10):
${recentSessions || "This is their first session!"}

BODY FEEL PATTERN (last 10 sessions):
- Sore: ${soreCount} times
- Injured: ${injuredCount} times
${soreCount >= 3 ? "⚠️ USER HAS BEEN SORE FREQUENTLY — address this directly" : ""}
${injuredCount >= 2 ? "🚨 USER HAS REPORTED INJURIES MULTIPLE TIMES — strongly recommend rest and caution" : ""}

Generate a coaching response (150-250 words) that:
1. Acknowledges what they worked on today with specificity
2. Gives ONE specific technical tip based on their notes about what clicked or didn't
3. Suggests what to focus on next session
4. If body feel pattern shows repeated soreness/injury, address it directly and honestly

Do NOT use bullet points or numbered lists. Write in conversational paragraphs. Do not start with "Hey!" or "Great job!" — start with something more natural.`;
}

export function buildMonthlySummaryPrompt(
  profile: UserProfile,
  sessions: Session[]
): string {
  const totalHours = sessions.reduce((acc, s) => acc + s.duration, 0) / 60;
  const tricksLanded = Object.entries(profile.trickProgress)
    .filter(([, p]) => p.status === "landed")
    .map(([id]) => getTrickById(id)?.name ?? id);

  const bodyFeels = sessions.map((s) => s.bodyFeel);
  const soreCount = bodyFeels.filter((f) => f === "sore").length;
  const injuredCount = bodyFeels.filter((f) => f === "injured").length;

  const sessionDates = sessions.map((s) => s.date).sort();
  const currentStageName =
    STAGES.find((s) => s.number === profile.currentStage)?.name ?? "Unknown";

  return `You are a skate coach writing a monthly progress summary for an adult skateboarding student. Same tone as before — encouraging skate friend, not corporate wellness.

MONTHLY STATS:
- Sessions this month: ${sessions.length}
- Total time: ${totalHours.toFixed(1)} hours
- Tricks landed: ${tricksLanded.join(", ") || "None this month"}
- Current stage: ${profile.currentStage} (${currentStageName})
- Session dates: ${sessionDates.join(", ")}
- Body: Sore ${soreCount}x, Injured ${injuredCount}x out of ${sessions.length} sessions

Write a 100-150 word monthly summary that:
1. Highlights progress and consistency (or lack thereof, gently)
2. Notes any tricks landed and what that unlocks
3. Comments on body health trend
4. Sets a loose goal for next month

Conversational tone. No bullet points.`;
}
