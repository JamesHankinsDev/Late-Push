import { Eyebrow } from "@/components/ui/primitives";

interface HeroBlockProps {
  landed: number;
  sessions: number;
  streak: number;
  daysIn: number;
  nextTrickName?: string;
}

export default function HeroBlock({
  landed,
  sessions,
  streak,
  daysIn,
  nextTrickName,
}: HeroBlockProps) {
  const [heading, body] = buildCopy({
    landed,
    sessions,
    streak,
    daysIn,
    nextTrickName,
  });

  const eyebrow =
    sessions === 0
      ? "WELCOME TO LATE PUSH"
      : streak >= 3
      ? "WELCOME BACK · ON STREAK"
      : "WELCOME BACK";

  return (
    <div className="home-hero">
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="huge">{heading}</h1>
      <div className="home-hero-row">
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.55,
            maxWidth: "50ch",
            color: "var(--ink)",
          }}
        >
          {body}
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="num">{landed}</span>
            <span className="lbl">LANDED</span>
          </div>
          <div className="hero-stat">
            <span className="num">{sessions}</span>
            <span className="lbl">SESSIONS</span>
          </div>
          <div className="hero-stat">
            <span className="num">{streak}</span>
            <span className="lbl">STREAK</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildCopy({
  landed,
  sessions,
  streak,
  daysIn,
  nextTrickName,
}: {
  landed: number;
  sessions: number;
  streak: number;
  daysIn: number;
  nextTrickName?: string;
}): [React.ReactNode, string] {
  if (sessions === 0) {
    return [
      <>
        Time to <span className="marker on-ink">push off.</span>
      </>,
      "Your first drill is cued up below. Twenty minutes, no commitment beyond that — the hardest session is always session one.",
    ];
  }
  if (landed === 0) {
    return [
      <>
        Reps now, <span className="marker on-ink">landings soon.</span>
      </>,
      `${sessions} session${sessions === 1 ? "" : "s"} in. Landed tricks aren't what matter yet — the foundation is. Keep showing up.`,
    ];
  }
  if (streak >= 3) {
    return [
      <>
        Streak of {streak}.{" "}
        <span className="marker on-ink">Keep it rolling.</span>
      </>,
      `${landed} landed, ${sessions} sessions logged. That's better than 80% of adult beginners ever manage.${nextTrickName ? ` Next up: ${nextTrickName}.` : ""}`,
    ];
  }
  return [
    <>
      Day {Math.max(daysIn, 1)}.{" "}
      <span className="marker on-ink">What&apos;s next?</span>
    </>,
    `${landed} landed, ${sessions} sessions logged.${nextTrickName ? ` Your next trick is ${nextTrickName}.` : " Head to the path to see what's next."}`,
  ];
}
