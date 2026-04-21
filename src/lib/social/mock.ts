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
    title: "Ledge Wax + Grind Night",
    mo: "APR",
    day: "25",
    time: "7:00 PM",
    loc: "Verdugo Ledges",
    focus: "50-50s on the low ledge. Bring wax.",
    going: 4,
    crew: "Ledge Study Group",
  },
  {
    id: "m3",
    title: "Sunday Push & Coffee",
    mo: "APR",
    day: "28",
    time: "9:00 AM",
    loc: "Echo Plaza → Java Cat",
    focus: "Cruise, push, get breakfast. All tiers welcome.",
    going: 12,
    crew: "The Push Club",
  },
  {
    id: "m4",
    title: "Mini Ramp Open Session",
    mo: "MAY",
    day: "02",
    time: "7:30 PM",
    loc: "Westside DIY",
    focus: "Rock to fakies, kickturns. Knee pads mandatory.",
    going: 6,
    crew: "Mini Ramp Weirdos",
  },
];

export interface MockCrew {
  id: string;
  name: string;
  tag: string;
  color: string;
  desc: string;
  members: number;
  level: string;
  mtgs: string;
  avatars: string[];
}

export const MOCK_CREWS: MockCrew[] = [
  {
    id: "push-club",
    name: "The Push Club",
    tag: "PUSH",
    color: "#f5d400",
    desc:
      "Over-30 adult beginners. No egos. Slow progression, lots of snacks.",
    members: 28,
    level: "T1–T3",
    mtgs: "Sat 9am",
    avatars: ["MR", "JL", "DP", "EK", "TK"],
  },
  {
    id: "parking-ghosts",
    name: "Parking Lot Ghosts",
    tag: "GHST",
    color: "#ff5a3c",
    desc:
      "We skate empty office parks on Sundays. Perfect pavement, zero cars.",
    members: 14,
    level: "T2–T4",
    mtgs: "Sun 8am",
    avatars: ["OB", "RV", "IG", "DP"],
  },
  {
    id: "ledge-study",
    name: "Ledge Study Group",
    tag: "LEDG",
    color: "#78d19a",
    desc:
      "Obsessed with waxing curbs and landing our first 50-50. Join us.",
    members: 11,
    level: "T3–T4",
    mtgs: "Wed 6pm",
    avatars: ["RV", "OB", "DP"],
  },
  {
    id: "mini-ramp-mfs",
    name: "Mini Ramp Weirdos",
    tag: "RAMP",
    color: "#b38cff",
    desc:
      "Transition-only, we fall with pads on. Weekly rotation at three spots.",
    members: 9,
    level: "T3–T4",
    mtgs: "Thu 7pm",
    avatars: ["TK", "OB", "RV"],
  },
];

export type FeedStampTone = "ok" | "ko";

export interface MockFeedPost {
  id: string;
  user: string;
  avatar: string;
  color: string;
  handle: string;
  when: string;
  body: string;
  art: string;
  stamp: string;
  stampColor: FeedStampTone;
  reacts: { push: number; same: number; fire: number };
  comments: number;
}

export const MOCK_FEED: MockFeedPost[] = [
  {
    id: "p1",
    user: "Maya R.",
    avatar: "MR",
    color: "#f5d400",
    handle: "mayarolls",
    when: "12m",
    body:
      "FOURTH SESSION grinding the stationary ollie and I FINALLY felt the pop + slide connect tonight. Not landing them yet but the brain clicked. So stoked.",
    art: "POP + SLIDE",
    stamp: "PROGRESS",
    stampColor: "ok",
    reacts: { push: 24, same: 8, fire: 12 },
    comments: 5,
  },
  {
    id: "p2",
    user: "Orin B.",
    avatar: "OB",
    color: "#b38cff",
    handle: "orinbones",
    when: "1h",
    body:
      "Landed my first no-comply on flat. Adults — you do NOT have to learn the ollie first. This trick is way more fun than the time I spent sulking over bad ollies.",
    art: "NO-COMPLY",
    stamp: "LANDED",
    stampColor: "ok",
    reacts: { push: 41, same: 3, fire: 18 },
    comments: 11,
  },
  {
    id: "p3",
    user: "Dev P.",
    avatar: "DP",
    color: "#ff5a3c",
    handle: "devpushes",
    when: "3h",
    body:
      "Ate it hard on a curb drop today. Wrist guards did their job. Wrist guards did their job. Wrist guards did their job.",
    art: "WRIST GUARDS",
    stamp: "BAILED",
    stampColor: "ko",
    reacts: { push: 16, same: 12, fire: 4 },
    comments: 9,
  },
];

export interface MockLiveSkater {
  id: string;
  name: string;
  avatar: string;
  color: string;
  spot: string;
}

export const MOCK_LIVE_NOW: MockLiveSkater[] = [
  { id: "maya", name: "Maya R.", avatar: "MR", color: "#f5d400", spot: "Verdugo Ledges" },
  { id: "dev", name: "Dev P.", avatar: "DP", color: "#ff5a3c", spot: "Grover Park" },
  { id: "ines", name: "Inés G.", avatar: "IG", color: "#7ec7ff", spot: "Echo Plaza" },
  { id: "jl", name: "Jordan L.", avatar: "JL", color: "#78d19a", spot: "Westside DIY" },
];

export interface MockLeaderRow {
  r: number;
  name: string;
  avatar: string;
  color: string;
  xp: number;
  you?: boolean;
}

export const MOCK_LEADERBOARD: MockLeaderRow[] = [
  { r: 1, name: "Maya R.", avatar: "MR", color: "#f5d400", xp: 1240 },
  { r: 2, name: "Orin B.", avatar: "OB", color: "#b38cff", xp: 1105 },
  { r: 3, name: "You", avatar: "YO", color: "#ff5a3c", xp: 986, you: true },
  { r: 4, name: "Dev P.", avatar: "DP", color: "#7ec7ff", xp: 940 },
  { r: 5, name: "Inés G.", avatar: "IG", color: "#78d19a", xp: 822 },
];

export interface MockDM {
  nm: string;
  avatar: string;
  color: string;
  preview: string;
  unread: boolean;
}

export const MOCK_DMS: MockDM[] = [
  {
    nm: "Maya R.",
    avatar: "MR",
    color: "#f5d400",
    preview: "pulling up to verdugo in 20 — bring wax",
    unread: true,
  },
  {
    nm: "Push Club",
    avatar: "PC",
    color: "#78d19a",
    preview: "Jordan: is anyone free for sunday push?",
    unread: true,
  },
  {
    nm: "Orin B.",
    avatar: "OB",
    color: "#b38cff",
    preview: "you: haha nice. ok i'll try that",
    unread: false,
  },
];
