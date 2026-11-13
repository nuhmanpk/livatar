/* Shared SVG primitives and palettes for the human-character styles. */
import { n } from '../core'

export const SKINS = ['#ffe0c7', '#f6c9a4', '#e2a87e', '#c68658', '#9c6440', '#6e4630']
export const HAIR_COLORS = ['#1e1a1d', '#3b2a22', '#6b4429', '#b07a45', '#e2bf7a', '#b8462e', '#9a9aa6']
export const SHIRTS = ['#5b7cfa', '#ff7a8a', '#2ec4b6', '#ffb347', '#8f6bf2', '#3d405b', '#f4f1ea']

export const shade = (c: string, k: number) => {
  const m = /^#([\da-f]{6})$/i.exec(c)
  if (!m) return c
  const v = parseInt(m[1], 16)
  const f = (x: number) =>
    Math.max(0, Math.min(255, Math.round(k > 1 ? x + (255 - x) * (k - 1) : x * k)))
      .toString(16)
      .padStart(2, '0')
  return `#${f(v >> 16)}${f((v >> 8) & 255)}${f(v & 255)}`
}

export const E = (cx: number, cy: number, rx: number, ry: number, fill: string, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${extra}/>`
export const C = (cx: number, cy: number, r: number, fill: string, extra = '') =>
  `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
export const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
export const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
/** Draw `svg` plus its mirror around x = 50. */
export const M = (svg: string) => svg + `<g transform="matrix(-1 0 0 1 100 0)">${svg}</g>`

/** Resolve a color option: explicit value, else a seeded pick. */
export const opt = (v: string | undefined, pickFrom: () => string) => (v && v !== 'random' ? v : pickFrom())
