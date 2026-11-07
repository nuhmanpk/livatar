/**
 * Ready-made palettes. Pass one as `colors` (or `palette` in a livatar code).
 * The order of this object is part of the code format: append, never reorder.
 */
export const palettes = {
  pastel: ['#ffd6a5', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#fdffb6', '#ffadad'],
  vivid: ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff924c', '#52a675', '#4267ac'],
  candy: ['#ff8fab', '#ffb3c6', '#fb6f92', '#c77dff', '#80ffdb', '#ffd6ff', '#ffe5ec', '#a2d2ff'],
  ocean: ['#03045e', '#0077b6', '#00b4d8', '#90e0ef', '#caf0f8', '#48cae4', '#0096c7', '#ade8f4'],
  forest: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc', '#1b4332'],
  sunset: ['#ff7b00', '#ff8800', '#ff9500', '#ffa200', '#ffaa00', '#ff5d8f', '#ff3c38', '#ffb703'],
  mono: ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#6c757d', '#495057', '#343a40'],
  neon: ['#f72585', '#b5179e', '#7209b7', '#560bad', '#4361ee', '#4cc9f0', '#3bf4fb', '#caff8a'],
  retro: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#f1faee', '#a8dadc', '#e63946'],
  earth: ['#7f5539', '#9c6644', '#b08968', '#ddb892', '#e6ccb2', '#ede0d4', '#606c38', '#283618'],
} as const satisfies Record<string, readonly string[]>

export type PaletteName = keyof typeof palettes
