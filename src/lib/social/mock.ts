// Placeholder content for the Social surfaces until the real backend exists.
// Everything here is fake — treat it as design preview data, not truth.

export interface MockSkater {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  color: string;
  distance: string;
  tier: number;
  match: number;
  workingOn: string;
  live: boolean;
  spot?: string;
  vibe: string[];
}

export const MOCK_SKATERS: MockSkater[] = [
  {
    id: "maya",
    name: "Maya R.",
    handle: "@mayarolls",
    color: "#f5d400",
    avatar: "MR",
    distance: "0.4 mi",
    tier: 3,
    match: 94,
    workingOn: "Ollie",
    live: true,
    spot: "Verdugo Ledges",
    vibe: ["chill", "progression"],
  },
  {
    id: "dev",
    name: "Dev P.",
    handle: "@devpushes",
    color: "#ff5a3c",
    avatar: "DP",
    distance: "1.2 mi",
    tier: 3,
    match: 88,
    workingOn: "Pop Shuvit",
    live: true,
    spot: "Grover Park",
    vibe: ["street", "evenings"],
  },
  {
    id: "tasha",
    name: "Tasha K.",
    handle: "@tashaslides",
    color: "#78d19a",
    avatar: "TK",
    distance: "2.0 mi",
    tier: 2,
    match: 81,
    workingOn: "Fakie Riding",
    live: false,
    vibe: ["chill", "mornings"],
  },
  {
    id: "orin",
    name: "Orin B.",
    handle: "@orinbones",
    color: "#b38cff",
    avatar: "OB",
    distance: "2.8 mi",
    tier: 3,
    match: 79,
    workingOn: "No-Comply",
    live: false,
    vibe: ["progression", "park-rat"],
  },
  {
    id: "ines",
    name: "Inés G.",
    handle: "@inescarves",
    color: "#7ec7ff",
    avatar: "IG",
    distance: "3.4 mi",
    tier: 2,
    match: 75,
    workingOn: "Kickturns",
    live: true,
    spot: "Echo Plaza",
    vibe: ["chill"],
  },
];

export interface MockMeetup {
  id: string;
  title: string;
  mo: string;
  day: string;
  time: string;
  loc: string;
  focus: string;
  going: number;
  crew: string;
}

export const MOCK_MEETUPS: MockMeetup[] = [
  {
    id: "m1",
    title: "Tuesday Beginner Session",
    mo: "APR",
    day: "23",
    time: "6:30 PM",
    loc: "Grover Park — empty lot",
    focus: "Pushing, turning, rolling ollies. Slow vibes.",
    going: 7,
    crew: "The Push Club",
  },
  {
    id: "m2",
    title: "Sunday Push & Coffee",
    mo: "APR",
    day: "28",
    time: "9:00 AM",
    loc: "Echo Plaza → Java Cat",
    focus: "Cruise, push, get breakfast. All tiers welcome.",
    going: 12,
    crew: "The Push Club",
  },
];
