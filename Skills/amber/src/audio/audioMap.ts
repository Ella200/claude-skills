// ZUZU'S WORLD — Audio Asset Map
// Place all audio files in /public/audio/
// Reference them with staticFile('audio/filename.mp3') in Remotion

// ═══════════════════════════════════════
// MUSIC TRACKS
// ═══════════════════════════════════════
export const MUSIC = {
  // 5-second opening jingle (C major: do-mi-sol + sparkle)
  THEME_JINGLE: 'audio/music/theme-jingle.mp3',

  // Background tracks (generate with AI music tools using prompts from the sound bible)
  BG_GENTLE: 'audio/music/bg-gentle-meadow.mp3',       // Scenes 1, 2 — calm, curious
  BG_PLAYFUL: 'audio/music/bg-playful-comedy.mp3',     // Scene 3 — slapstick energy
  BG_WARM: 'audio/music/bg-warm-discovery.mp3',        // Scene 4 — wonder, treasure hunt
  BG_TRIUMPH: 'audio/music/bg-triumph-learning.mp3',   // Scene 5 — antenna glow moment
  BG_CELEBRATION: 'audio/music/bg-celebration.mp3',     // Scene 6 — dance party, winds down
};

// ═══════════════════════════════════════
// CHARACTER SOUNDS — ZUZU
// ═══════════════════════════════════════
export const ZUZU_SFX = {
  // Core expression sounds
  HMM: 'audio/zuzu/zuzu-hmm.mp3',             // Curious thinking
  EEP: 'audio/zuzu/zuzu-eep.mp3',             // Surprised / startled
  GIGGLE: 'audio/zuzu/zuzu-giggle.mp3',        // Happy laughter
  SQUEAL: 'audio/zuzu/zuzu-squeal.mp3',        // Excited / proud
  HUFF: 'audio/zuzu/zuzu-huff.mp3',            // Frustrated sigh
  YAWN: 'audio/zuzu/zuzu-yawn.mp3',            // Sleepy
  OOF: 'audio/zuzu/zuzu-oof.mp3',              // Impact / bonk reaction
  DA_DAA: 'audio/zuzu/zuzu-da-daa.mp3',        // Triumphant chirp
  AWW: 'audio/zuzu/zuzu-aww.mp3',              // Sad / pouty
  NOM_NOM: 'audio/zuzu/zuzu-nom-nom.mp3',      // Eating sounds
  EFFORT: 'audio/zuzu/zuzu-effort.mp3',         // Straining / trying
  GASP: 'audio/zuzu/zuzu-gasp.mp3',            // Realization
  SNORE: 'audio/zuzu/zuzu-snore.mp3',          // Sleeping

  // Movement sounds
  FOOTSTEP: 'audio/zuzu/zuzu-footstep.mp3',    // Waddle step (pizzicato)
  SLIDE: 'audio/zuzu/zuzu-slide.mp3',           // Sliding down tree
};

// ═══════════════════════════════════════
// CHARACTER SOUNDS — PIP
// ═══════════════════════════════════════
export const PIP_SFX = {
  BOING: 'audio/pip/pip-boing.mp3',            // Bounce sound
  SQUEAK: 'audio/pip/pip-squeak.mp3',          // General vocalization
  GIGGLE: 'audio/pip/pip-giggle.mp3',          // Tiny laugh
  CHIRP: 'audio/pip/pip-chirp.mp3',            // Happy chirp
};

// ═══════════════════════════════════════
// CHARACTER SOUNDS — MOMO
// ═══════════════════════════════════════
export const MOMO_SFX = {
  YAWN: 'audio/momo/momo-yawn.mp3',            // Deep yawn
  HUM: 'audio/momo/momo-hum.mp3',              // Low rumble
  OHHH: 'audio/momo/momo-ohhh.mp3',            // Slow surprise
};

// ═══════════════════════════════════════
// CHARACTER SOUNDS — FLICKER
// ═══════════════════════════════════════
export const FLICKER_SFX = {
  ARRIVE: 'audio/flicker/flicker-arrive.mp3',   // Chime on appearance
  DEPART: 'audio/flicker/flicker-depart.mp3',   // Harp sweep on vanish
  SPARKLE: 'audio/flicker/flicker-sparkle.mp3', // Gentle shimmer
};

// ═══════════════════════════════════════
// GENERAL SFX
// ═══════════════════════════════════════
export const SFX = {
  // Comedy
  BONK: 'audio/sfx/bonk.mp3',                  // Impact hit
  BOING: 'audio/sfx/boing.mp3',                // Bouncy spring
  SPLAT: 'audio/sfx/splat.mp3',                // Soft impact
  SLIDE_WHISTLE_DOWN: 'audio/sfx/slide-whistle-down.mp3',
  TROMBONE_WAH: 'audio/sfx/trombone-wah-wah.mp3',  // Comedy fail

  // Discovery / Learning
  QUESTION_BOING: 'audio/sfx/question-boing.mp3',   // "?" pop sound
  DING: 'audio/sfx/ding.mp3',                       // Discovery highlight
  SPARKLE_BURST: 'audio/sfx/sparkle-burst.mp3',     // Antenna full glow
  CHIME_ASCENDING: 'audio/sfx/chime-ascending.mp3', // 3 ascending chimes (do-mi-sol)
  TEXT_POP: 'audio/sfx/text-pop.mp3',               // "RED!" appearing

  // Environment
  POP: 'audio/sfx/pop.mp3',                    // Bubble pop / snore bubble
  WHOOSH: 'audio/sfx/whoosh.mp3',              // Fast movement
  APPLE_CRUNCH: 'audio/sfx/apple-crunch.mp3',  // Biting apple
  APPLE_FALL: 'audio/sfx/apple-fall.mp3',      // Apple dropping from tree
  ROCK_STACK: 'audio/sfx/rock-stack.mp3',      // Rocks being placed
  ROCK_TUMBLE: 'audio/sfx/rock-tumble.mp3',    // Rocks falling

  // Celebration
  CONFETTI_BURST: 'audio/sfx/confetti-burst.mp3',
  FINAL_SPARKLE: 'audio/sfx/final-sparkle-c.mp3',   // Final chime in C major
};

// ═══════════════════════════════════════
// AMBIENT
// ═══════════════════════════════════════
export const AMBIENT = {
  MEADOW: 'audio/ambient/meadow-birds-breeze.mp3',   // Soft birds + wind loop
  NIGHT: 'audio/ambient/night-crickets.mp3',          // For night episodes
};
