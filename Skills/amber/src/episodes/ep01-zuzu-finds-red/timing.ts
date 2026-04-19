// EPISODE 1 — Scene Timing Map
// Adjust these numbers to change scene pacing without touching animation logic.
// All values are frame numbers at 30fps.

export const EP01_TIMING = {
  // Scene boundaries
  SCENE_1_START: 0,
  SCENE_1_END: 360,

  SCENE_2_START: 360,
  SCENE_2_END: 600,

  SCENE_3_START: 600,
  SCENE_3_END: 1500,

  SCENE_4_START: 1500,
  SCENE_4_END: 2700,

  SCENE_5_START: 2700,
  SCENE_5_END: 3600,

  SCENE_6_START: 3600,
  SCENE_6_END: 4500,

  // Key moments within scenes
  APPLE_BONK: 390,         // Frame when apple hits Zuzu
  FIRST_BITE: 1700,         // Frame when Zuzu bites the apple
  APPLE_GONE: 2000,         // Frame when apple is fully eaten
  DISCOVERY_START: 2150,    // Frame when Zuzu starts finding red things
  ANTENNA_GLOW_START: 2940, // Frame when antenna begins glowing
  RED_TEXT_POP: 3150,       // Frame when "RED!" appears
  DANCE_START: 3600,        // Frame when celebration begins
  LOOP_TEASE: 4350,         // Frame when Zuzu spots the pond

  // Total episode
  TOTAL_FRAMES: 4500,       // 2 min 30 sec at 30fps
} as const;

// Helper: convert frames to seconds
export const framesToSeconds = (frames: number, fps = 30): number => {
  return Math.round((frames / fps) * 10) / 10;
};

// Helper: convert seconds to frames
export const secondsToFrames = (seconds: number, fps = 30): number => {
  return Math.round(seconds * fps);
};
