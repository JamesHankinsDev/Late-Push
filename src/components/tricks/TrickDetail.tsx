"use client";

import { useState, useEffect } from "react";
import { Trick, TrickStatus, YouTubeVideo, STATUS_LABELS } from "@/lib/types";
import { getPrerequisiteTricks } from "@/lib/curriculum";

const STATUS_OPTIONS: TrickStatus[] = [
  "not_started",
  "practicing",
  "landed_once",
  "consistent",
  "mastered",
];

const STATUS_COLORS: Record<TrickStatus, string> = {
  locked: "bg-concrete-700 text-concrete-500",
  not_started: "bg-concrete-800 text-concrete-300 border-concrete-700",
  practicing: "bg-skate-orange/20 text-skate-orange border-skate-orange",
  landed_once: "bg-skate-cyan/20 text-skate-cyan border-skate-cyan",
  consistent: "bg-skate-lime/20 text-skate-lime border-skate-lime",
  mastered: "bg-skate-lime/40 text-white border-skate-lime",
};

interface TrickDetailProps {
  trick: Trick;
  status: TrickStatus;
  onClose: () => void;
  onStatusChange: (trickId: string, status: TrickStatus) => void;
}

export default function TrickDetail({
  trick,
  status,
  onClose,
  onStatusChange,
}: TrickDetailProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const prereqs = getPrerequisiteTricks(trick);

  useEffect(() => {
    setLoadingVideos(true);
    fetch(`/api/youtube?q=${encodeURIComponent(trick.searchQuery)}`)
      .then((r) => r.json())
      .then((data) => setVideos(data.videos ?? []))
      .catch(() => setVideos([]))
      .finally(() => setLoadingVideos(false));
  }, [trick.searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-concrete-900 border border-concrete-700 rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-concrete-900 border-b border-concrete-700 p-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              {trick.name}
            </h2>
            <div className="flex gap-3 text-xs mt-1 flex-wrap">
              <span className="text-concrete-400">
                Tier {trick.tier}
              </span>
              <span className="text-concrete-400">
                Difficulty: <span className="text-white">{trick.difficulty}/10</span>
              </span>
              <span className={`${
                trick.injuryRisk === "low"
                  ? "text-skate-lime"
                  : trick.injuryRisk === "medium"
                  ? "text-skate-orange"
                  : "text-skate-red"
              }`}>
                {trick.injuryRisk} risk
              </span>
              {trick.estimatedAdultLearningTime && (
                <span className="text-concrete-400">
                  ⏱ <span className="text-concrete-200">{trick.estimatedAdultLearningTime}</span>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-concrete-400 hover:text-white text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Description */}
          <p className="text-sm text-concrete-200 leading-relaxed">
            {trick.description}
          </p>

          {/* Prerequisites */}
          {prereqs.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-concrete-400 uppercase tracking-wider mb-2">
                Prerequisites
              </h3>
              <div className="flex flex-wrap gap-2">
                {prereqs.map((p) => (
                  <span
                    key={p.id}
                    className="text-xs px-2 py-1 rounded bg-concrete-800 text-concrete-300 border border-concrete-700"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div>
            <h3 className="text-xs font-bold text-concrete-400 uppercase tracking-wider mb-2">
              Tips
            </h3>
            <ul className="space-y-2">
              {trick.tips.map((tip, i) => (
                <li
                  key={i}
                  className="text-sm text-concrete-200 pl-4 border-l-2 border-skate-lime/30"
                >
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Status segmented control */}
          <div>
            <h3 className="text-xs font-bold text-concrete-400 uppercase tracking-wider mb-2">
              Where are you with this trick?
            </h3>
            <div className="grid grid-cols-5 gap-1">
              {STATUS_OPTIONS.map((opt) => {
                const isActive = status === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => onStatusChange(trick.id, opt)}
                    className={`text-[10px] sm:text-xs py-2 px-1 rounded border transition-all ${
                      isActive
                        ? STATUS_COLORS[opt] + " font-bold"
                        : "border-concrete-700 text-concrete-500 hover:border-concrete-500"
                    }`}
                  >
                    {STATUS_LABELS[opt]}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-concrete-500 mt-2">
              Self-reported. Trust yourself. Nobody&apos;s watching.
            </p>
          </div>

          {/* YouTube Videos */}
          <div>
            <h3 className="text-xs font-bold text-concrete-400 uppercase tracking-wider mb-2">
              Tutorial Videos
            </h3>
            {loadingVideos ? (
              <div className="flex items-center gap-2 text-sm text-concrete-400">
                <div className="w-4 h-4 border-2 border-concrete-500 border-t-skate-lime rounded-full animate-spin" />
                Loading videos...
              </div>
            ) : videos.length === 0 ? (
              <p className="text-sm text-concrete-500">
                No videos loaded. Set your YouTube API key to see tutorials.
              </p>
            ) : (
              <div className="space-y-3">
                {videos.map((v) => (
                  <a
                    key={v.videoId}
                    href={`https://www.youtube.com/watch?v=${v.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 p-2 rounded-lg bg-concrete-800 hover:bg-concrete-700 transition-colors"
                  >
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="w-28 h-20 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium line-clamp-2">
                        {v.title}
                      </p>
                      <p className="text-xs text-concrete-400 mt-1">
                        {v.channelTitle}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
