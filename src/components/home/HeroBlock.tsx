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
      : `WELCOME BACK · DAY ${Math.max(daysIn, 1)}`;

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
        Time to <br />
        <span className="marker on-ink">push off.</span>
      </>,
      "Your first drill is cued up below. Twenty minutes, no commitment beyond that. The hardest session is always session one — it gets easier.",
    ];
  }
  if (landed === 0) {
    return [
      <>
        {sessions} session{sessions === 1 ? "" : "s"} in.
        <br />
        <span className="marker on-ink">First landing's coming.</span>
      </>,
      "You're putting in the reps. Landed tricks aren't what matter yet — the foundation is. Keep showing up.",
    ];
  }
  if (streak >= 3) {
    return [
      <>
        {streak}-session streak.
        <br />
        <span className="marker on-ink">Keep it rolling.</span>
      </>,
      `${landed} landed, ${sessions} sessions logged. That's better than 80% of adult beginners ever manage. ${nextTrickName ? `Next up: ${nextTrickName}.` : "Check the path to see what's next."}`,
    ];
  }
  return [
    <>
      Day {Math.max(daysIn, 1)} in.
      <br />
      <span className="marker on-ink">Back for more.</span>
    </>,
    `${landed} landed, ${sessions} sessions logged. ${nextTrickName ? `Your next trick is ${nextTrickName}.` : "Check the path to see what's next."}`,
  ];
}
