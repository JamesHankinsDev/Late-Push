import { MOCK_MEETUPS } from "@/lib/social/mock";
import { Button } from "@/components/ui/primitives";

export default function MeetupsPreview() {
  return (
    <div className="meetups-list">
      {MOCK_MEETUPS.map((m) => (
        <div key={m.id} className="meetup-card">
          <div className="meetup-date">
            <div className="mo">{m.mo}</div>
            <div className="day">{m.day}</div>
            <div className="time">{m.time}</div>
          </div>
          <div className="meetup-info">
            <h5>{m.title}</h5>
            <div className="loc">◉ {m.loc}</div>
            <div className="focus">{m.focus}</div>
          </div>
          <div className="meetup-go">
            <Button variant="primary" size="sm" disabled>
              I&apos;m in
            </Button>
            <span className="rsvp-count">
              {m.going} GOING · {m.crew}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
