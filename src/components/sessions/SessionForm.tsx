"use client";

import { useState } from "react";
import { TRICKS } from "@/lib/curriculum";
import { BodyFeel, SurfaceQuality, Session } from "@/lib/types";
import { format } from "date-fns";

interface SessionFormProps {
  onSubmit: (session: Omit<Session, "id" | "userId" | "createdAt" | "coachResponse">) => void;
  loading: boolean;
}

export default function SessionForm({ onSubmit, loading }: SessionFormProps) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState("");
  const [tricksPracticed, setTricksPracticed] = useState<string[]>([]);
  const [whatClicked, setWhatClicked] = useState("");
  const [whatDidnt, setWhatDidnt] = useState("");
  const [bodyFeel, setBodyFeel] = useState<BodyFeel>("fine");
  const [injuryNotes, setInjuryNotes] = useState("");
  const [surfaceQuality, setSurfaceQuality] = useState<SurfaceQuality | "">("");
  const [showTrickPicker, setShowTrickPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      date,
      duration,
      location: location || undefined,
      tricksPracticed,
      whatClicked,
      whatDidnt,
      bodyFeel,
      injuryNotes: injuryNotes || undefined,
      surfaceQuality: (surfaceQuality as SurfaceQuality) || undefined,
    });
  };

  const toggleTrick = (id: string) => {
    setTricksPracticed((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const bodyFeelOptions: { value: BodyFeel; label: string; color: string }[] = [
    { value: "fine", label: "Feeling Good", color: "bg-skate-lime/20 text-skate-lime border-skate-lime" },
    { value: "sore", label: "Sore", color: "bg-skate-orange/20 text-skate-orange border-skate-orange" },
    { value: "injured", label: "Injured", color: "bg-skate-red/20 text-skate-red border-skate-red" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date + Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-concrete-400 uppercase tracking-wider mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-concrete-800 border border-concrete-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-skate-lime"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-concrete-400 uppercase tracking-wider mb-1">
            Duration (min)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            min={5}
            max={480}
            className="w-full bg-concrete-800 border border-concrete-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-skate-lime"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-bold text-concrete-400 uppercase tracking-wider mb-1">
          Location <span className="text-concrete-600">(optional)</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Lincoln Park, parking lot on 5th"
          className="w-full bg-concrete-800 border border-concrete-700 rounded-lg px-3 py-2 text-sm text-white placeholder-concrete-600 focus:outline-none focus:border-skate-lime"
        />
      </div>

      {/* Tricks practiced */}
      <div>
        <label className="block text-xs font-bold text-concrete-400 uppercase tracking-wider mb-2">
          Tricks Practiced
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tricksPracticed.map((id) => {
            const trick = TRICKS.find((t) => t.id === id);
            return (
              <span
                key={id}
                onClick={() => toggleTrick(id)}
                className="text-xs px-2 py-1 rounded-full bg-skate-lime/20 text-skate-lime border border-skate-lime/30 cursor-pointer hover:bg-skate-lime/30"
              >
                {trick?.name ?? id} &times;
              </span>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setShowTrickPicker(!showTrickPicker)}
          className="text-xs text-skate-cyan hover:text-skate-cyan/80 transition-colors"
        >
          {showTrickPicker ? "Hide tricks" : "+ Add tricks"}
        </button>
        {showTrickPicker && (
          <div className="mt-2 max-h-48 overflow-y-auto bg-concrete-800 border border-concrete-700 rounded-lg p-2 space-y-1">
            {[0, 1, 2, 3, 4].map((tier) => (
              <div key={tier}>
                <p className="text-[10px] font-bold text-concrete-500 uppercase tracking-wider px-2 py-1">
                  Tier {tier}
                </p>
                {TRICKS.filter((t) => t.tier === tier).map((trick) => (
                  <button
                    key={trick.id}
                    type="button"
                    onClick={() => toggleTrick(trick.id)}
                    className={`block w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${
                      tricksPracticed.includes(trick.id)
                        ? "bg-skate-lime/20 text-skate-lime"
                        : "text-concrete-300 hover:bg-concrete-700"
                    }`}
                  >
                    {trick.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* What clicked / didn't */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-concrete-400 uppercase tracking-wider mb-1">
            What clicked today?
          </label>
          <textarea
            value={whatClicked}
            onChange={(e) => setWhatClicked(e.target.value)}
            placeholder="Finally got the front foot slide on ollies..."
            rows={3}
            className="w-full bg-concrete-800 border border-concrete-700 rounded-lg px-3 py-2 text-sm text-white placeholder-concrete-600 focus:outline-none focus:border-skate-lime resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-concrete-400 uppercase tracking-wider mb-1">
            What didn&apos;t click?
          </label>
          <textarea
            value={whatDidnt}
            onChange={(e) => setWhatDidnt(e.target.value)}
            placeholder="Kept landing with my weight too far back..."
            rows={3}
            className="w-full bg-concrete-800 border border-concrete-700 rounded-lg px-3 py-2 text-sm text-white placeholder-concrete-600 focus:outline-none focus:border-skate-lime resize-none"
          />
        </div>
      </div>

      {/* Body feel */}
      <div>
        <label className="block text-xs font-bold text-concrete-400 uppercase tracking-wider mb-2">
          How does your body feel?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {bodyFeelOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setBodyFeel(opt.value)}
              className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                bodyFeel === opt.value
                  ? opt.color
                  : "border-concrete-700 text-concrete-400 hover:border-concrete-500"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {(bodyFeel === "sore" || bodyFeel === "injured") && (
          <textarea
            value={injuryNotes}
            onChange={(e) => setInjuryNotes(e.target.value)}
            placeholder={
              bodyFeel === "injured"
                ? "What's injured? Be specific so we can track it..."
                : "What's sore? Any specific areas?"
            }
            rows={2}
            className="mt-2 w-full bg-concrete-800 border border-concrete-700 rounded-lg px-3 py-2 text-sm text-white placeholder-concrete-600 focus:outline-none focus:border-skate-orange resize-none"
          />
        )}
      </div>

      {/* Surface quality */}
      <div>
        <label className="block text-xs font-bold text-concrete-400 uppercase tracking-wider mb-2">
          Surface Quality <span className="text-concrete-600">(optional)</span>
        </label>
        <div className="flex gap-2">
          {(["smooth", "rough", "cracked", "mixed"] as SurfaceQuality[]).map(
            (sq) => (
              <button
                key={sq}
                type="button"
                onClick={() =>
                  setSurfaceQuality(surfaceQuality === sq ? "" : sq)
                }
                className={`py-1.5 px-3 rounded-lg border text-xs transition-all ${
                  surfaceQuality === sq
                    ? "border-skate-cyan bg-skate-cyan/20 text-skate-cyan"
                    : "border-concrete-700 text-concrete-400 hover:border-concrete-500"
                }`}
              >
                {sq}
              </button>
            )
          )}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || tricksPracticed.length === 0}
        className="w-full py-3 rounded-lg bg-skate-lime text-concrete-950 font-display font-bold text-sm hover:bg-skate-lime/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-concrete-950 border-t-transparent rounded-full animate-spin" />
            Saving & Getting Coach Feedback...
          </span>
        ) : (
          "Log Session"
        )}
      </button>
    </form>
  );
}
