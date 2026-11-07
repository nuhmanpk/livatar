import { defineStyle, luma, safe } from '../core'
import { faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

export interface InitialsOptions {
  /** Text to take initials from. Default: the seed ("Ada Lovelace" → "AL"). */
  name?: string
  /** 1–3 letters. Default 2. */
  chars?: number
  /** Show the little face. Default true. */
  face?: boolean | 'random'
  weight?: 'bold' | 'medium' | 'random'
}

/** Initials, inspired by DiceBear's "initials" (MIT), but with a tiny face that blinks and follows the cursor. */
export const initials = defineStyle<InitialsOptions>({
  name: 'initials',
  colors: ['#7f5af0', '#2cb67d', '#ef4565', '#3da9fc', '#ff8906', '#e45858', '#00a6a6', '#6246ea'],
  defaults: { chars: 2, face: true, weight: 'random' },
  variants: { chars: [1, 2, 3], face: [true, false], weight: ['bold', 'medium'] },
  render({ seed, background, mood, pick, options: o }) {
    const src = (o.name ?? seed).trim()
    const words = src.split(/[\s._@-]+/).filter(Boolean)
    const n = Math.max(1, Math.min(3, Number(o.chars) || 2))
    let text = (words.length >= n ? words.slice(0, n).map((w) => [...w][0]) : [...(words[0] ?? '?')].slice(0, n)).join('').toUpperCase()
    text = text.replace(/[&<>"']/g, '')
    const ink = (luma(background) ?? 0) > 0.6 ? '#1f1a2e' : '#ffffff'
    const face = o.face === 'random' ? true : o.face !== false
    const weight = pick('weight', ['bold', 'medium']) === 'bold' ? 800 : 600
    const size = n === 3 ? 30 : n === 2 ? 38 : 46
    const F: FaceSpec = {
      x: 50, ey: 27, gap: 9, my: 80, ink: safe(ink), s: 0.75, extra: [70, 16],
      eye: (x, y) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${ink}"/><g data-lv-depth=".5"><circle cx="${x}" cy="${y}" r="1.6" fill="${background === 'none' ? '#1f1a2e' : safe(background)}"/></g>`,
    }
    return (
      `<g data-lv-body="">` +
      `<g data-lv-depth=".35" data-lv-tilt="3"><text x="50" y="${n === 1 ? 70 : 66}" text-anchor="middle" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Helvetica,Arial,sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="-1" fill="${ink}">${text}</text></g>` +
      (face
        ? `<g data-lv-depth=".7">${faceEyes(F, mood)}<g data-lv-mouth="1">${mood === 'neutral' ? '' : faceMouth(F, mood)}</g>${faceExtras(F, mood)}</g>`
        : `<g data-lv-eye=""></g><g data-lv-mouth="1"></g>`) +
      `</g>`
    )
  },
})
