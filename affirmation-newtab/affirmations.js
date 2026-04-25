const AFFIRMATIONS = [
  // ── Confidence ────────────────────────────────────────────────────
  { text: "Stop waiting to feel ready. Begin.", category: "Confidence" },
  { text: "The mountain does not apologize for its height. Neither should you.", category: "Confidence" },
  { text: "Some people wait for the wind. You are learning to be the wind.", category: "Confidence" },
  { text: "Confidence is not certainty. It is choosing to move without it.", category: "Confidence" },
  { text: "The only thing standing between you and the goal is the next action.", category: "Confidence" },
  { text: "One decision. Right now. Forward.", category: "Confidence" },
  { text: "You have survived every hard day so far. You will survive this one too.", category: "Confidence" },
  { text: "Your instincts are sharper than your doubts. Trust them.", category: "Confidence" },
  { text: "You do not have to roar to be powerful. Quiet strength builds empires.", category: "Confidence" },

  // ── Growth ────────────────────────────────────────────────────────
  { text: "Even rivers carve canyons — not by force, but by persistence.", category: "Growth" },
  { text: "Be the version of yourself you keep promising.", category: "Growth" },
  { text: "Progress is not linear. Doubt it, and you will miss the exponential.", category: "Growth" },
  { text: "Every expert you admire was once a beginner who refused to be embarrassed by the gap.", category: "Growth" },
  { text: "You don't have to have it all figured out. You just have to take one step.", category: "Growth" },
  { text: "The life you want is on the other side of the discomfort you keep avoiding.", category: "Growth" },
  { text: "You cannot pour from an empty vessel — but you also cannot fill one that refuses to open.", category: "Growth" },
  { text: "Small acts done daily are the architecture of extraordinary lives.", category: "Growth" },
  { text: "Grow at the pace your roots require. What is deep takes time.", category: "Growth" },

  // ── Self-Worth ────────────────────────────────────────────────────
  { text: "You are not a rough draft. You are the final version, still being written.", category: "Self-Worth" },
  { text: "You are allowed to want things. Wanting is not weakness.", category: "Self-Worth" },
  { text: "Being a work in progress does not mean being broken.", category: "Self-Worth" },
  { text: "Quit shrinking to fit spaces you've outgrown.", category: "Self-Worth" },
  { text: "You are already enough. Becoming more is a bonus, not a requirement.", category: "Self-Worth" },
  { text: "Ask for help. Asking is strength, not surrender.", category: "Self-Worth" },
  { text: "You are allowed to change your mind, your path, your plan.", category: "Self-Worth" },
  { text: "You do not need to earn rest. You are not a machine.", category: "Self-Worth" },
  { text: "Your worth does not fluctuate with your productivity.", category: "Self-Worth" },

  // ── Resilience ────────────────────────────────────────────────────
  { text: "Let the fire in you outlast every storm that tries to drown it.", category: "Resilience" },
  { text: "You bloom in the places others said were too dark to grow.", category: "Resilience" },
  { text: "Hard is not the same as impossible.", category: "Resilience" },
  { text: "Your excuses cannot outlast your ability.", category: "Resilience" },
  { text: "Every version of you that ever doubted itself was still brave enough to keep going.", category: "Resilience" },
  { text: "What you call a setback, the future may call a foundation.", category: "Resilience" },
  { text: "Not every day will feel like progress. Some days, surviving is the work.", category: "Resilience" },
  { text: "You don't have to be fearless. You just have to move one inch past the fear.", category: "Resilience" },
  { text: "The bend in the road is not the end of the road — unless you refuse to turn.", category: "Resilience" },

  // ── Focus ─────────────────────────────────────────────────────────
  { text: "Do the work. Everything else is noise.", category: "Focus" },
  { text: "Think less. Move more. Trust more.", category: "Focus" },
  { text: "You know what to do. Now do it.", category: "Focus" },
  { text: "The quietest rooms often hold the loudest thinking.", category: "Focus" },
  { text: "Time does not run out. Priorities do.", category: "Focus" },
  { text: "One task. Full presence. That is enough.", category: "Focus" },
  { text: "Discipline is just choosing the version of you that shows up.", category: "Focus" },
  { text: "What you repeat becomes who you are. Repeat intentionally.", category: "Focus" },
  { text: "The task in front of you is the whole world right now. Nothing else exists.", category: "Focus" },

  // ── Peace ─────────────────────────────────────────────────────────
  { text: "You are the lighthouse in your own storm.", category: "Peace" },
  { text: "To rest is not to fall behind. It is to remember why you are running.", category: "Peace" },
  { text: "It's okay to be tired. Rest is not giving up.", category: "Peace" },
  { text: "Your pace is not your problem. Comparison is.", category: "Peace" },
  { text: "You are not behind. You are on a different road, headed somewhere real.", category: "Peace" },
  { text: "Still water runs deep. So do you.", category: "Peace" },
  { text: "The world keeps moving whether you panic or breathe. Choose breath.", category: "Peace" },
  { text: "Let go of what was supposed to happen and meet what is.", category: "Peace" },
  { text: "Peace is not the absence of noise. It is the decision not to be moved by it.", category: "Peace" },

  // ── Vision ────────────────────────────────────────────────────────
  { text: "You were not built to shrink. You were built to expand into every room you enter.", category: "Vision" },
  { text: "Carry your dreams the way the ocean carries ships — with everything you have.", category: "Vision" },
  { text: "Most regrets are not about what you tried. They are about what you didn't.", category: "Vision" },
  { text: "The seeds you plant in silence will flower when the world least expects it.", category: "Vision" },
  { text: "The life you are building is bigger than the day you are having.", category: "Vision" },
  { text: "Where you are going requires a version of you that does not exist yet. Build them.", category: "Vision" },
  { text: "Stop editing your ambition to fit other people's imagination.", category: "Vision" },
  { text: "The future belongs to those who work for it before it arrives.", category: "Vision" },
  { text: "You are not waiting for your life to begin. It already has. Steer.", category: "Vision" },

  // ── Purpose ───────────────────────────────────────────────────────
  { text: "Get up. The world is waiting for what only you can give.", category: "Purpose" },
  { text: "Today is not a rehearsal. Show up.", category: "Purpose" },
  { text: "Your life is a canvas and every choice is a brushstroke. Make it deliberate.", category: "Purpose" },
  { text: "It is enough to do a little good today, even if it goes unseen.", category: "Purpose" },
  { text: "You were made to contribute something only you can contribute.", category: "Purpose" },
  { text: "Work like it matters. Because it does.", category: "Purpose" },
  { text: "The world does not need a copy of someone else. It needs the unedited you.", category: "Purpose" },
  { text: "Meaning is not found. It is made, decision by decision.", category: "Purpose" },

  // ── Abundance ─────────────────────────────────────────────────────
  { text: "You are not in competition with anyone. You are in collaboration with your potential.", category: "Abundance" },
  { text: "What flows through open hands always exceeds what is hoarded in fists.", category: "Abundance" },
  { text: "There is enough room at the top for everyone who climbs with integrity.", category: "Abundance" },
  { text: "Generosity is a form of power. Use it freely.", category: "Abundance" },
  { text: "Your success is not borrowed from someone else's share.", category: "Abundance" },
  { text: "Abundance begins the moment you stop believing there is not enough.", category: "Abundance" },
  { text: "Give first. The return has never failed those who lead with open hands.", category: "Abundance" },
  { text: "You attract what you believe you deserve. Start deserving more.", category: "Abundance" },
  { text: "Celebrate others fiercely. Joy shared multiplies.", category: "Abundance" },
];
