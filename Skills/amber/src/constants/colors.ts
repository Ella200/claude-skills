// ZUZU'S WORLD — Brand Color Palette
// These are LOCKED. Never change these across episodes.

export const COLORS = {
  // Characters
  zuzu: '#FF8C42',
  zuzuLight: '#FFB074',
  zuzuDark: '#E67530',

  pip: '#5BC0EB',
  pipLight: '#8DD6F2',
  pipDark: '#3AABDE',

  momo: '#9B89B3',
  momoLight: '#B8A8CC',
  momoDark: '#7E6D99',

  flicker: '#FFD700',
  flickerGlow: '#FFF8DC',

  // Environment
  sky: '#87CEEB',
  skyHorizon: '#B8E4F0',
  grassFront: '#7EC850',
  grassMid: '#6BB840',
  grassBack: '#5DA83A',
  treeTrunk: '#8B6D47',
  treeCanopy: '#4A8C3F',
  pond: '#6EC6E6',

  // Discovery colors (Episode specific)
  red: '#E53935',
  redLight: '#EF5350',

  // General
  white: '#FFFFFF',
  black: '#1a1a1a',
} as const;

// Video specs — LOCKED for all episodes
export const VIDEO = {
  WIDTH: 1920,
  HEIGHT: 1080,
  FPS: 30,
} as const;
