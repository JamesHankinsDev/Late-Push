import { Trick, TrickStatus, STATUS_RANK } from "./types";

export const TIERS = [
  {
    number: 0,
    name: "Pre-Board",
    description:
      "Before you push off, know what you're standing on and how to keep yourself in one piece. Optional in theory, smart in practice.",
  },
  {
    number: 1,
    name: "Foundations",
    description:
      "The boring-but-essential layer. Standing, pushing, riding, stopping, turning. Nobody skips this without paying for it later.",
  },
  {
    number: 2,
    name: "Basic Maneuvering",
    description:
      "Now you can move the board around — kickturns, manuals, fakie, pumping. The bridge from cruising to actual skateboarding.",
  },
  {
    number: 3,
    name: "First Tricks",
    description:
      "The ollie and friends. Plus low-impact alternatives like the no-comply and boneless — because adults don't have to learn the ollie first.",
  },
  {
    number: 4,
    name: "Intermediate",
    description:
      "Flips, grinds, transition. This is where the gateway opens to the rest of skateboarding. Take your time.",
  },
];

export const TRICKS: Trick[] = [
  // ===================== TIER 0: Pre-Board =====================
  {
    id: "board-anatomy",
    name: "Board Anatomy",
    tier: 0,
    description:
      "Before you can skate, you should know what you're standing on. Deck, trucks, wheels, bearings, bushings, kingpin, grip tape — none of this is rocket science. But knowing the parts means you can fix problems and not get talked down to at the skate shop.",
    difficulty: 1,
    prerequisites: [],
    injuryRisk: "low",
    searchQuery: "skateboard parts anatomy explained beginner adult",
    estimatedAdultLearningTime: "1 session",
    tips: [
      "The deck is the wood part. Top is grip tape, bottom is the graphic.",
      "Trucks are the metal axles. The kingpin nut adjusts how loose/tight your turns feel.",
      "Bushings are the rubber bits inside the trucks — softer = looser turns.",
      "Bearings live inside the wheels. ABEC ratings matter less than you think.",
      "Wheels: bigger and softer = better for rough pavement and beginners.",
    ],
  },
  {
    id: "choosing-setup",
    name: "Choosing Your Setup",
    tier: 0,
    description:
      "What size deck? What durometer wheels? Soft or hard? It depends on what you want to skate. Bigger decks (8.25–8.5\") are forgiving and stable for beginners. Softer wheels (78–87a) handle rough pavement and crap surfaces. Don't overthink it. Don't buy garbage Walmart boards either — they actively make learning harder.",
    difficulty: 1,
    prerequisites: ["board-anatomy"],
    injuryRisk: "low",
    searchQuery: "best skateboard setup for adult beginners size guide",
    estimatedAdultLearningTime: "1 session",
    tips: [
      "Deck width: 8.25\"–8.5\" is the sweet spot for adult beginners. Wider = more stable.",
      "Wheels: 54–58mm, 78a–87a (soft) for street and rough ground; 99a+ (hard) for park and smooth ledges.",
      "Get your board built at a real skate shop. They'll spec it to your style and skill level.",
      "Budget: $120–$180 gets you a solid complete setup that won't fight you.",
      "Walmart/Target boards are a trap. The wood is heavy, the wheels are plastic, and the trucks are brittle.",
    ],
  },
  {
    id: "gear-check",
    name: "Gear Check",
    tier: 0,
    description:
      "The unsexy stuff that keeps you out of urgent care. Helmet (always for transition, smart for street). Wrist guards (the single best investment — broken wrists destroy lives). Knee/elbow pads (especially while learning to drop in). Shoes with flat, grippy soles. Skip Vans Slip-Ons until you can stop better.",
    difficulty: 1,
    prerequisites: [],
    injuryRisk: "low",
    searchQuery: "skateboard safety gear adult beginner wrist guards helmet",
    estimatedAdultLearningTime: "1 session",
    tips: [
      "Wrist guards. Wrist guards. Wrist guards. Triple Eight Hired Hands or Pro-Tec.",
      "Helmet matters more on transition than street, but cheap insurance either way.",
      "Knee pads (187 Pro or Triple Eight Saver Series) make learning to drop in 10x less scary.",
      "Shoes: flat, grippy, low-profile. Vans Old Skool, Emerica, Lakai, Etnies — anything skate-specific.",
      "Pads aren't dorky. Casts are dorky.",
    ],
  },
  {
    id: "stance",
    name: "Finding Your Stance",
    tier: 0,
    description:
      "Regular or goofy? Push with your back foot, front foot near the bolts. There's no wrong answer — your body knows. Try both and see which feels less like you're about to die.",
    difficulty: 1,
    prerequisites: [],
    injuryRisk: "low",
    searchQuery: "how to find skateboard stance regular vs goofy adult beginner",
    estimatedAdultLearningTime: "1 session",
    tips: [
      "Have someone gently push you from behind — whichever foot you step forward with is probably your front foot",
      "Regular = left foot forward. Goofy = right foot forward. Neither is better.",
      "If both feel weird, you're normal. Pick one and commit for at least a week.",
    ],
  },
  {
    id: "falling",
    name: "Falling Safely",
    tier: 0,
    description:
      "You WILL fall. The difference between a funny story and an ER visit is knowing how. Roll with it — literally. Tuck your arms, roll onto your shoulder, slide it out. Never catch yourself with straight arms (hello, broken wrist). Wear pads. You're an adult with a job and responsibilities.",
    difficulty: 2,
    prerequisites: [],
    injuryRisk: "low",
    searchQuery: "how to fall safely skateboarding adult beginner avoid injury",
    estimatedAdultLearningTime: "2-3 sessions",
    tips: [
      "Wrist guards are the single best protective investment. Wear them.",
      "Practice falling on grass first — seriously, just practice the roll",
      "Knee pads let you slide on your knees instead of tumbling. Game changer on ramps.",
      "When you feel yourself going down, bend your knees and try to roll, don't brace",
      "If you're over 30, nobody will judge you for wearing pads. They'll judge you for the cast.",
    ],
  },

  // ===================== TIER 1: Foundations =====================
  {
    id: "standing",
    name: "Standing on the Board",
    tier: 1,
    description:
      "Step 1 of skating: just stand on the board without falling off. Sounds dumb, isn't. On grass or carpet (so it doesn't roll), plant your feet over the bolts and find your balance. Get used to how the board moves under you. Bend your knees. Eyes up. This is your office now.",
    difficulty: 1,
    prerequisites: ["stance"],
    injuryRisk: "low",
    searchQuery: "how to stand on skateboard balance beginner adult first time",
    estimatedAdultLearningTime: "1 session",
    tips: [
      "Practice on grass or carpet first — board can't roll out from under you",
      "Feet over the bolts (the screws holding the trucks on), shoulder-width apart",
      "Knees bent, weight slightly forward, eyes up",
      "Rock side-to-side and front-to-back to feel how the board responds",
    ],
  },
  {
    id: "pushing",
    name: "Pushing",
    tier: 1,
    description:
      "The most fundamental skill. Front foot on the board pointing forward, back foot pushes along the ground. Keep your weight centered over the board, not leaning back like you're afraid of it (even though you are).",
    difficulty: 2,
    prerequisites: ["standing"],
    injuryRisk: "low",
    searchQuery: "how to push on a skateboard for beginners adults step by step",
    estimatedAdultLearningTime: "1-2 sessions",
    tips: [
      "Point your front foot toward the nose while pushing, then angle it sideways once both feet are on",
      "Push with long, smooth strokes — not little frantic taps",
      "Practice in a parking lot with smooth ground, not on sidewalk cracks",
      "Bend your front knee slightly — stiff legs are how you eat pavement",
    ],
  },
  {
    id: "riding-straight",
    name: "Riding Straight",
    tier: 1,
    description:
      "You can push, but can both feet stay on the board while it rolls? That's the goal. Plant your front foot, push, then put your back foot on near the tail. Keep your weight centered. Don't look at your feet. Pick a target 20 feet ahead and just... go to it.",
    difficulty: 2,
    prerequisites: ["pushing"],
    injuryRisk: "low",
    searchQuery: "how to ride skateboard straight beginner adult both feet",
    estimatedAdultLearningTime: "1-2 sessions",
    tips: [
      "After pushing, rotate your front foot sideways as you place your back foot down",
      "Eyes up — looking at your feet is how you lose balance",
      "Knees bent, arms relaxed for balance",
      "Roll out a long straight line in an empty lot, push once, ride to the end",
    ],
  },
  {
    id: "turning",
    name: "Turning & Carving",
    tier: 1,
    description:
      "Lean to turn. Toe-side leans take you one way, heel-side the other. Loose trucks turn more but feel wobblier. Start with medium-tight trucks and loosen as you get comfortable. Carving is just turning back and forth — it builds balance and feels amazing.",
    difficulty: 3,
    prerequisites: ["riding-straight"],
    injuryRisk: "low",
    searchQuery: "how to turn and carve on skateboard beginner adult tutorial",
    estimatedAdultLearningTime: "2-4 sessions",
    tips: [
      "Your shoulders lead the turn — look where you want to go",
      "Toe-side turns feel more natural for most people. Heel-side takes practice.",
      "Practice big, sweeping turns in an empty parking lot before tight turns",
      "If your trucks feel too tight or loose, adjust the kingpin nut a quarter turn at a time",
    ],
  },
  {
    id: "stopping",
    name: "Stopping",
    tier: 1,
    description:
      "Three ways to stop: foot brake (drag your back foot), power slide (advanced, skip for now), or the bail-and-run (step off and let the board go). Master the foot brake first — it's the most controlled and least dramatic.",
    difficulty: 2,
    prerequisites: ["riding-straight"],
    injuryRisk: "low",
    searchQuery: "how to stop on a skateboard foot brake beginner adult",
    estimatedAdultLearningTime: "1-2 sessions",
    tips: [
      "Shift your weight to your front foot before dragging your back foot",
      "The sole of your shoe does the braking, not the toe — flat foot drag",
      "Practice at slow speeds first. Seriously. Slow speeds.",
      "Don't use your tail to brake — it destroys your board and looks bad",
    ],
  },
  {
    id: "riding-bumps",
    name: "Riding Over Cracks & Bumps",
    tier: 1,
    description:
      "Real ground isn't smooth. Cracks, pebbles, expansion joints — they'll buck you if you don't know how to handle them. The trick: shift your weight slightly back and lift your front wheels just before the bump. Same for cracks. Bend your knees to absorb. Stiff legs = you eat it.",
    difficulty: 3,
    prerequisites: ["riding-straight"],
    injuryRisk: "low",
    searchQuery: "how to ride over cracks bumps skateboard beginner adult tips",
    estimatedAdultLearningTime: "2-3 sessions",
    tips: [
      "Lean back slightly to lift the front wheels just before the crack",
      "Bend your knees to absorb impact — don't lock up",
      "Approach cracks at an angle when possible to reduce the jolt",
      "Softer wheels (78-87a) handle bumps way better than hard street wheels",
    ],
  },
  {
    id: "riding-comfort",
    name: "Comfortable Cruising",
    tier: 1,
    description:
      "Before you learn any tricks, you need to be able to just... ride. Push around for 20-30 minutes without thinking about balance. Go over small cracks. Step off and back on. This is boring but it's the foundation everything else is built on.",
    difficulty: 3,
    prerequisites: ["riding-straight", "turning", "stopping"],
    injuryRisk: "low",
    searchQuery: "skateboard cruising practice beginner comfortable riding tips",
    estimatedAdultLearningTime: "1-3 weeks",
    tips: [
      "Set a goal: ride for 30 minutes without stepping off (except to push)",
      "Practice riding over small cracks and bumps — lift your front wheels slightly",
      "Try riding in both directions, even your weak side",
      "Ride with music. It makes practice feel like fun instead of homework.",
    ],
  },

  // ===================== TIER 2: Basic Maneuvering =====================
  {
    id: "pivot",
    name: "Kickturns (Frontside & Backside)",
    tier: 2,
    description:
      "A pivot on your back two wheels to change direction. Frontside means your chest faces the direction of rotation, backside means your back does. The foundation for tic-tacs, transition skating, and feeling in control of where the board points.",
    difficulty: 4,
    prerequisites: ["riding-comfort"],
    injuryRisk: "low",
    searchQuery: "how to kickturn skateboard frontside backside beginner tutorial",
    estimatedAdultLearningTime: "1-2 weeks",
    tips: [
      "Wind up your shoulders before the pivot — they lead the rotation",
      "Keep the front wheels just barely off the ground",
      "Frontside is usually easier to learn first",
      "Practice both directions even if one feels terrible. Balance is everything.",
    ],
  },
  {
    id: "tick-tack",
    name: "Tic-Tacs",
    tier: 2,
    description:
      "Shift weight to your tail, lift the front wheels, and pivot left-right to generate momentum. It's goofy-looking but builds essential tail balance and is genuinely useful for navigating tight spaces. Plus it's your first taste of controlling the board beyond just riding it.",
    difficulty: 3,
    prerequisites: ["pivot"],
    injuryRisk: "low",
    searchQuery: "how to tic tac skateboard beginner tutorial step by step",
    estimatedAdultLearningTime: "1 week",
    tips: [
      "Light pressure on the tail — you only need the front wheels an inch off the ground",
      "Use your hips and shoulders to initiate the pivot, not just your feet",
      "Try to tic-tac uphill slightly — great balance builder",
    ],
  },
  {
    id: "fakie-riding",
    name: "Fakie Riding",
    tier: 2,
    description:
      "Riding backward — same stance, opposite direction. You're rolling with your nose as the back of the board. It feels weird at first because your weight distribution is flipped. Essential for learning fakie tricks later and just generally being comfortable on your board.",
    difficulty: 4,
    prerequisites: ["riding-comfort"],
    injuryRisk: "low",
    searchQuery: "how to ride fakie skateboard beginner tutorial switch riding",
    estimatedAdultLearningTime: "1-2 weeks",
    tips: [
      "Start by rolling forward, then let yourself roll backward on a slight incline",
      "Your weight should be slightly over the 'back' trucks (which are now in front)",
      "Practice pushing fakie — it feels awkward but builds great board sense",
      "Don't look at your feet. Look where you're going. Trust the board.",
    ],
  },
  {
    id: "manual",
    name: "Manual",
    tier: 2,
    description:
      "Ride on your back two wheels. It's a balance trick — shift your weight over the back trucks without popping the tail to the ground. Think of it like a wheelie. Start with 5-foot manuals and work your way up. Great for building board control. (Stretch goal for later: hold one for 10+ seconds.)",
    difficulty: 4,
    prerequisites: ["riding-comfort"],
    injuryRisk: "low",
    searchQuery: "how to manual skateboard beginner tutorial balance tips",
    estimatedAdultLearningTime: "2-4 weeks",
    tips: [
      "Arms out for balance. You'll look silly. It works.",
      "Find the balance point — it's further back than you think",
      "Set distance goals: manual from one crack to the next",
      "Keep your knees bent and your weight centered, not leaning back",
      "Long-term goal: 10+ second manuals. That's a Tier 4 milestone.",
    ],
  },
  {
    id: "riding-off-curb",
    name: "Riding Off a Curb",
    tier: 2,
    description:
      "Roll off a curb without bailing. Sounds trivial, isn't on day one. Approach perpendicular, shift your weight slightly back, let the front wheels drop, then the back. Bend your knees on the landing. Once this feels natural, you've crossed a real threshold — the world becomes more skateable.",
    difficulty: 4,
    prerequisites: ["riding-comfort"],
    injuryRisk: "medium",
    searchQuery: "how to ride off curb skateboard beginner adult tutorial",
    estimatedAdultLearningTime: "1-2 weeks",
    tips: [
      "Start with the lowest curb you can find — parking blocks work great",
      "Approach perpendicular at slow rolling speed",
      "Lean back slightly to lift the nose as you go off the edge",
      "Bend your knees on the landing to absorb the drop",
      "Don't try to ollie off — just roll off. That comes later.",
    ],
  },
  {
    id: "pumping",
    name: "Pumping",
    tier: 2,
    description:
      "Generating speed on transition without pushing. Compress your body going down, extend going up. Like pumping a swing. This is the key to flowing on ramps and the foundation of all transition skating.",
    difficulty: 5,
    prerequisites: ["riding-comfort"],
    injuryRisk: "low",
    searchQuery: "how to pump on mini ramp skateboard beginner tutorial",
    estimatedAdultLearningTime: "2-4 weeks",
    tips: [
      "Think of it like a squat: compress at the bottom of the transition, extend at the top",
      "Your arms help — pump them like you're doing a standing jump",
      "Start on a small quarter pipe, going back and forth",
      "The rhythm clicks suddenly — one session it'll just make sense",
    ],
  },
  {
    id: "powerslide-intro",
    name: "Powerslide (Intro)",
    tier: 2,
    description:
      "Slide your wheels sideways to scrub speed. The full powerslide is way down the road, but the intro version — kicking the back wheels out a bit while moving — is the foundation. You need momentum and some confidence. Start with very small slides on smooth ground.",
    difficulty: 5,
    prerequisites: ["riding-comfort", "stopping"],
    injuryRisk: "medium",
    searchQuery: "how to powerslide skateboard beginner tutorial scrub speed",
    estimatedAdultLearningTime: "2-6 weeks",
    tips: [
      "Hard wheels (99a+) slide easier than soft wheels — start there if you can",
      "Smooth ground is essential. Sticky ground will buck you.",
      "Twist your shoulders and hips to initiate the slide — feet follow",
      "Start at low speed and just kick the wheels out 30 degrees, then ride away",
      "This trick is hard. Don't expect it to click in one session.",
    ],
  },

  // ===================== TIER 3: First Tricks =====================
  {
    id: "ollie",
    name: "Ollie (Stationary)",
    tier: 3,
    description:
      "The ollie is THE fundamental trick. Pop the tail, slide your front foot up, level out in the air. It will take weeks to months to learn. That's normal. Every pro sucked at ollies for a long time. The sliding motion of the front foot is the hardest part — it needs to become muscle memory. Start stationary in grass.",
    difficulty: 5,
    prerequisites: ["riding-comfort", "tick-tack"],
    injuryRisk: "medium",
    searchQuery: "how to ollie skateboard step by step beginner adult tutorial",
    estimatedAdultLearningTime: "1-3 months",
    tips: [
      "Practice stationary first — in grass or on carpet to remove the rolling fear",
      "The pop comes from snapping your ankle, not stomping your whole leg",
      "Your front foot SLIDES up the board — it's not a jump, it's a drag",
      "Film yourself from the side. You're probably not sliding your front foot enough.",
      "Commit to doing 50 ollie attempts per session. Repetition is the only teacher.",
    ],
  },
  {
    id: "rolling-ollie",
    name: "Rolling Ollie",
    tier: 3,
    description:
      "Once your stationary ollie is solid, it's time to ollie while moving. This is where the fear kicks in because now gravity and momentum are both involved. Start slow — walking speed — and gradually build up. The technique is the same, your brain just needs to trust it while rolling.",
    difficulty: 6,
    prerequisites: ["ollie"],
    injuryRisk: "medium",
    searchQuery: "how to ollie while rolling moving skateboard beginner tips",
    estimatedAdultLearningTime: "2-8 weeks",
    tips: [
      "Start at walking speed. Literally walking speed.",
      "The motion is the same as stationary — don't overthink it",
      "Lean slightly forward. Most people lean back out of fear and the board shoots out.",
      "Set a small object to ollie over once you're consistent — a stick, a pencil",
    ],
  },
  {
    id: "shuvit",
    name: "Pop Shuvit",
    tier: 3,
    description:
      "The board rotates 180 degrees under you while you stay facing forward. Scoop the tail backward with your back foot. It's one of the first tricks that makes you feel like an actual skateboarder. Easier than a kickflip, almost as satisfying.",
    difficulty: 5,
    prerequisites: ["ollie"],
    injuryRisk: "medium",
    searchQuery: "how to pop shuvit skateboard beginner tutorial step by step adult",
    estimatedAdultLearningTime: "2-6 weeks",
    tips: [
      "The scoop is more of a flick backward with your toes, not a full kick",
      "Your front foot barely does anything — just lift it and let the board spin under you",
      "Keep your shoulders level and parallel to the board",
      "Commit to landing on it. Half-committing is how you get shinners.",
    ],
  },
  {
    id: "fs-180",
    name: "Frontside 180",
    tier: 3,
    description:
      "An ollie with a 180-degree frontside rotation. Your chest opens up toward the direction of travel. Wind up your shoulders before you pop. This is your gateway to landing fakie and eventually doing bigger rotations.",
    difficulty: 6,
    prerequisites: ["rolling-ollie", "pivot"],
    injuryRisk: "medium",
    searchQuery: "how to frontside 180 ollie skateboard beginner tutorial",
    estimatedAdultLearningTime: "2-8 weeks",
    tips: [
      "Wind up your shoulders BEFORE you pop — the rotation starts from the top down",
      "Your head and shoulders should be at 90 degrees before your feet leave the ground",
      "Commit to the full 180. Landing at 90 and pivoting the rest is fine at first.",
      "You'll land fakie — make sure you're comfortable riding fakie first",
    ],
  },
  {
    id: "bs-180",
    name: "Backside 180",
    tier: 3,
    description:
      "Same idea as frontside, opposite rotation — your back faces the direction of travel mid-rotation. Many people find this harder because you're essentially blind during the rotation. The trick is to lead with your head and look over your shoulder.",
    difficulty: 7,
    prerequisites: ["rolling-ollie", "pivot"],
    injuryRisk: "medium",
    searchQuery: "how to backside 180 ollie skateboard beginner tutorial",
    estimatedAdultLearningTime: "1-3 months",
    tips: [
      "Look over your back shoulder to initiate the rotation",
      "This one requires more commitment than frontside — you can't see where you're going mid-trick",
      "The scoop of the tail helps with the rotation",
      "Practice backside pivots extensively before attempting this",
    ],
  },
  {
    id: "ollie-up-curb",
    name: "Ollie Up a Curb",
    tier: 3,
    description:
      "Your first real street obstacle. Ride parallel to a curb and ollie up onto it. This is where your rolling ollie becomes functional. Start with low curbs — parking blocks are perfect practice.",
    difficulty: 6,
    prerequisites: ["rolling-ollie"],
    injuryRisk: "medium",
    searchQuery: "how to ollie up curb skateboard beginner street tutorial",
    estimatedAdultLearningTime: "2-6 weeks",
    tips: [
      "Approach parallel to the curb at a slight angle",
      "You need more speed than you think — momentum helps clear the height",
      "Pop the ollie slightly before the curb, not right at it",
      "Start with parking blocks or low ledges before real curbs",
    ],
  },
  {
    id: "no-comply",
    name: "No-Comply",
    tier: 3,
    description:
      "The adult ollie hack. Your front foot steps off, your back foot pops the tail with a scoop, the board pivots 180 (or doesn't), then you step back on. Lower-impact than an ollie and actually looks cool. If your ollie is taking forever to click, learn this — it'll keep you stoked while you grind on the ollie in the background.",
    difficulty: 4,
    prerequisites: ["riding-comfort", "fakie-riding"],
    injuryRisk: "low",
    searchQuery: "how to no comply skateboard beginner tutorial adult easy trick",
    estimatedAdultLearningTime: "1-3 weeks",
    tips: [
      "Front foot steps off TOWARD the toe side (in front of the board)",
      "Back foot scoops the tail like a backside shuvit",
      "Plant your front foot back on the board after the pop",
      "Don't overthink the rotation — let the board do its thing under your foot",
      "This trick is way less scary than the ollie. That's the point.",
    ],
  },
  {
    id: "boneless",
    name: "Boneless",
    tier: 3,
    description:
      "Grab the board with your hand, step off with your front foot, jump up while pulling the board with you, land back on. The most 80s trick ever and it's amazing. Adults love this because it doesn't require the fast-twitch foot speed of an ollie. Pure, dorky fun.",
    difficulty: 4,
    prerequisites: ["riding-comfort"],
    injuryRisk: "low",
    searchQuery: "how to boneless skateboard beginner tutorial easy 80s trick",
    estimatedAdultLearningTime: "1-3 weeks",
    tips: [
      "Reach down with your front hand and grab the toe-side edge of the board between your feet",
      "Front foot steps off and plants on the ground",
      "Jump off your planted foot while pulling the board up with your hand",
      "Land back on the board with both feet over the bolts",
      "This is the funnest trick on this whole list. Don't sleep on it.",
    ],
  },

  // ===================== TIER 4: Intermediate =====================
  {
    id: "kickflip",
    name: "Kickflip",
    tier: 4,
    description:
      "The iconic trick. Ollie, then flick your front foot off the heel edge of the nose to make the board flip. It will take hundreds of attempts. The flick is a subtle ankle motion — you're not kicking the board, you're sliding and flicking off the edge.",
    difficulty: 7,
    prerequisites: ["rolling-ollie"],
    injuryRisk: "medium",
    searchQuery: "how to kickflip skateboard beginner tutorial step by step adult",
    estimatedAdultLearningTime: "2-6 months",
    tips: [
      "Front foot angled slightly with toes hanging off the toe-side edge",
      "The flick goes off the corner of the nose — up AND out",
      "Practice the flick motion while sitting down to build muscle memory",
      "Landing with just your back foot first is normal. Work on catching it with both.",
      "This trick has a notorious learning curve. 2-3 months of focused practice is normal.",
    ],
  },
  {
    id: "heelflip",
    name: "Heelflip",
    tier: 4,
    description:
      "Like a kickflip but the board flips the opposite way because you're flicking with your heel off the toe side. Some people find heelflips more natural than kickflips. Try both and see which clicks — there's no rule that says kickflip has to come first.",
    difficulty: 7,
    prerequisites: ["rolling-ollie"],
    injuryRisk: "medium",
    searchQuery: "how to heelflip skateboard beginner tutorial step by step",
    estimatedAdultLearningTime: "2-6 months",
    tips: [
      "Front foot with heel hanging off the toe-side edge",
      "The flick is more of a forward kick off the nose corner",
      "Keep your shoulders square to the board — twisting is the most common mistake",
      "Some find heelflips easier than kickflips. If kickflips aren't clicking, try this.",
    ],
  },
  {
    id: "nose-manual",
    name: "Nose Manual",
    tier: 4,
    description:
      "Manual on the front two wheels. Shift your weight forward over the nose without letting it touch the ground. Harder than a regular manual because bailing forward is scarier than bailing backward. Build up slowly.",
    difficulty: 6,
    prerequisites: ["manual"],
    injuryRisk: "medium",
    searchQuery: "how to nose manual skateboard beginner tutorial balance",
    estimatedAdultLearningTime: "1-3 months",
    tips: [
      "Start with very short nose manuals — just a second or two",
      "Your weight needs to be over the front bolts, not the very tip of the nose",
      "Arms out for balance. Always arms out.",
      "If you feel yourself going over the front, step off to the side — don't try to save it",
    ],
  },
  {
    id: "50-50-grind",
    name: "50-50 Grind",
    tier: 4,
    description:
      "Ollie onto a ledge or curb and grind along it with both trucks. The most fundamental grind. Wax helps. A lot. Find a low, waxed curb and make it your best friend for a few weeks.",
    difficulty: 7,
    prerequisites: ["ollie-up-curb"],
    injuryRisk: "high",
    searchQuery: "how to 50-50 grind skateboard curb ledge beginner tutorial",
    estimatedAdultLearningTime: "1-4 months",
    tips: [
      "WAX THE LEDGE. Seriously. Skate wax or even a candle works.",
      "Approach at a slight angle, ollie on, and keep your weight centered",
      "Lean slightly toward the ledge — leaning away makes you slip off the back side",
      "Start with very short grinds. Even 6 inches counts.",
      "Come off the end by gently lifting your front wheels or doing a small ollie off",
    ],
  },
  {
    id: "boardslide",
    name: "Boardslide",
    tier: 4,
    description:
      "Ollie 90 degrees onto a rail or ledge so the middle of your board slides along it. Looks sick, feels scary, but on a low waxed ledge it's very doable. The ollie and 90-degree turn happen simultaneously.",
    difficulty: 8,
    prerequisites: ["ollie-up-curb", "fs-180"],
    injuryRisk: "high",
    searchQuery: "how to boardslide skateboard rail ledge beginner tutorial",
    estimatedAdultLearningTime: "2-6 months",
    tips: [
      "Start on a low, round rail or very well-waxed ledge",
      "Approach at a moderate angle — too perpendicular and you'll stick",
      "Turn your shoulders 90 degrees as you ollie — your board follows your upper body",
      "Look at the end of the rail/ledge, not at your feet",
      "Lean slightly forward over the obstacle. Leaning back = credit card. Don't Google that.",
    ],
  },
  {
    id: "dropping-in",
    name: "Dropping In",
    tier: 4,
    description:
      "Standing at the top of a ramp, tail on the coping, and committing your weight forward to roll down the transition. This is 95% mental. Your body will scream at you not to lean forward into a ramp. You have to override that instinct. Start on the smallest ramp you can find.",
    difficulty: 6,
    prerequisites: ["riding-comfort", "falling"],
    injuryRisk: "high",
    searchQuery: "how to drop in skateboard mini ramp beginner adult tutorial",
    estimatedAdultLearningTime: "1 session to 1 month (depends on courage)",
    tips: [
      "START SMALL. Find a 2-3 foot mini ramp, not a 6 foot halfpipe",
      "Stomp your front foot down and lean forward. Hesitation = falling backward.",
      "Wear knee pads. If you bail, slide on your knees. This is why knee pads exist.",
      "Have a friend hold your hand the first few times — no shame in that",
      "The commitment lean is the whole trick. Once you lean in, gravity does the rest.",
    ],
  },
  {
    id: "rock-to-fakie",
    name: "Rock to Fakie",
    tier: 4,
    description:
      "Roll up the transition, let your front wheels go over the coping, then rock back and roll down fakie. Your first coping trick. It teaches you to interact with the lip of the ramp without fully committing to going over it.",
    difficulty: 7,
    prerequisites: ["dropping-in", "fakie-riding"],
    injuryRisk: "high",
    searchQuery: "how to rock to fakie mini ramp skateboard beginner tutorial",
    estimatedAdultLearningTime: "2-8 weeks",
    tips: [
      "The key moment is when your front wheels are over the coping — shift weight back to rock the board",
      "Don't lean too far forward or your wheels will catch the coping on the way back",
      "Lift your front wheels slightly as you come back over the coping",
      "Commit to rolling away fakie. Hesitation here leads to hanging up on the coping.",
    ],
  },
  {
    id: "kick-turn",
    name: "Transition Kick Turn",
    tier: 4,
    description:
      "At the top of the ramp, pivot 180 on your back wheels to go back down. It's a kickturn on a ramp. The height you go up determines how scary it is. Start barely above the flat bottom and work your way up.",
    difficulty: 6,
    prerequisites: ["pumping", "tick-tack"],
    injuryRisk: "medium",
    searchQuery: "how to kick turn on ramp mini ramp skateboard beginner",
    estimatedAdultLearningTime: "2-6 weeks",
    tips: [
      "Start low on the transition — you don't need to go to the coping",
      "Shoulders lead the turn, always. Look where you want to go.",
      "Backside kick turns (facing the ramp) are easier to start with",
      "Keep your weight slightly forward — leaning back on transition means sliding out",
    ],
  },
  {
    id: "fakie-ollie",
    name: "Fakie Ollie",
    tier: 4,
    description:
      "An ollie, but rolling backward. Same motion, opposite direction, totally weird brain. You pop the tail (which is now in front of you), slide your back-now-front foot. It feels alien until it doesn't. Critical for switching directions and unlocking a whole second set of tricks.",
    difficulty: 6,
    prerequisites: ["rolling-ollie", "fakie-riding"],
    injuryRisk: "medium",
    searchQuery: "how to fakie ollie skateboard beginner tutorial",
    estimatedAdultLearningTime: "2-8 weeks",
    tips: [
      "Same mechanics as a regular ollie — just with the tail in front of you instead of behind",
      "Your back foot (now leading) does the slide; your front foot (now in back) pops",
      "Start very slow. Your brain needs to recalibrate.",
      "Once this clicks, half-cabs, switch ollies, and a ton of new tricks open up",
    ],
  },
  {
    id: "tre-flip",
    name: "Tre Flip (360 Flip)",
    tier: 4,
    description:
      "AKA the 360 flip. The board flips and rotates 360 degrees underneath you. This is a HARD trick. The intro version is just understanding the mechanics — scoop the tail like a backside shuvit while flicking like a kickflip. You're not landing this for months. Don't sweat it.",
    difficulty: 9,
    prerequisites: ["kickflip", "shuvit"],
    injuryRisk: "medium",
    searchQuery: "how to 360 flip tre flip skateboard beginner tutorial",
    estimatedAdultLearningTime: "6 months to 2 years",
    tips: [
      "Combine a backside shuvit scoop with a kickflip flick — at the same time",
      "Front foot is angled like a kickflip but flicks more diagonally",
      "Back foot scoops hard and back",
      "This is most adults' white whale trick. Be patient.",
      "Don't expect to land this in your first month. Or third. Just practice the motion.",
    ],
  },
];

// ===================== Helpers =====================

export function getTricksByTier(tier: number): Trick[] {
  return TRICKS.filter((t) => t.tier === tier);
}

export function getTrickById(id: string): Trick | undefined {
  return TRICKS.find((t) => t.id === id);
}

export function getPrerequisiteTricks(trick: Trick): Trick[] {
  return trick.prerequisites
    .map((id) => getTrickById(id))
    .filter((t): t is Trick => t !== undefined);
}

export function isTrickUnlockable(
  trickId: string,
  progress: Record<string, { status: TrickStatus }>
): boolean {
  const trick = getTrickById(trickId);
  if (!trick) return false;
  if (trick.prerequisites.length === 0) return true;
  return trick.prerequisites.every((preId) => {
    const status = progress[preId]?.status;
    if (!status) return false;
    return STATUS_RANK[status] >= STATUS_RANK.landed_once;
  });
}

export function getEffectiveStatus(
  trickId: string,
  progress: Record<string, { status: TrickStatus }>
): TrickStatus {
  const stored = progress[trickId]?.status;
  const unlockable = isTrickUnlockable(trickId, progress);
  if (!unlockable && (!stored || stored === "locked" || stored === "not_started")) {
    return "locked";
  }
  return stored ?? "not_started";
}

// Backward-compat aliases for any straggler imports
export const STAGES = TIERS;
export const getTricksByStage = getTricksByTier;
