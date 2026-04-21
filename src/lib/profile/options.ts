import { Stance } from "@/lib/types";

export const STANCE_OPTIONS: {
  id: Stance;
  hdr: string;
  dsc: string;
}[] = [
  {
    id: "regular",
    hdr: "REGULAR",
    dsc: "Left foot forward, right foot pushes. Most common stance.",
  },
  {
    id: "goofy",
    hdr: "GOOFY",
    dsc: "Right foot forward, left foot pushes. Not worse, not better.",
  },
  {
    id: "switch",
    hdr: "BOTH",
    dsc: "I can do both (rare for beginners — are you sure?)",
  },
  {
    id: "unsure",
    hdr: "HELP ME",
    dsc: "Show me a 30-second test to figure it out.",
  },
];

export const TIER_OPTIONS = [
  {
    id: 0,
    emo: "◉",
    hdr: "STILL SHOPPING",
    dsc: "I don't own a board yet, or I'm about to.",
  },
  {
    id: 1,
    emo: "→",
    hdr: "NEW TO IT",
    dsc: "I can push a bit. Turning is still weird. Haven't fallen off much.",
  },
  {
    id: 2,
    emo: "↻",
    hdr: "COMFORTABLE CRUISING",
    dsc: "I can ride, turn, stop. Ready to learn tricks.",
  },
  {
    id: 3,
    emo: "✦",
    hdr: "WORKING ON FIRST TRICKS",
    dsc: "Ollie in progress. Maybe a no-comply landed.",
  },
  {
    id: 4,
    emo: "✷",
    hdr: "TRICKS LANDING",
    dsc: "Kickflips, 50-50s, dropping in. Some combination of them.",
  },
];

export const GOAL_OPTIONS = [
  "Cruise comfortably",
  "Ollie",
  "Pop shuvit",
  "Kickflip",
  "Drop in",
  "Grinds",
  "Transition skating",
  "Stay in one piece",
  "Skate with my kid",
];

export const VIBE_OPTIONS = [
  "Chill pace",
  "Progression-focused",
  "Mornings",
  "Evenings",
  "Late night",
  "Weekends only",
  "Street",
  "Park/transition",
  "Mini ramp",
  "Alone is fine",
  "Prefer small groups",
  "Crew energy",
];

export const STANCE_LABEL: Record<Stance, string> = {
  regular: "REGULAR STANCE",
  goofy: "GOOFY STANCE",
  switch: "SWITCH STANCE",
  unsure: "STANCE UNSURE",
};
