import { defineStyle, n, safe } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'
import { C, HAIR_COLORS, M, P, S, SKINS, opt, shade } from './_people'

const HAIRS = ['bob', 'afro', 'quiff', 'long', 'bun', 'bald'] as const
const PATTERNS = ['none', 'dots', 'stripes', 'zigzag'] as const
const SKIN = [...SKINS, '#8f7cf8', '#5fb4ff']
const SHIRT = ['#ff5a5f', '#ffb400', '#00a699', '#3d5afe', '#7b61ff', '#1e1e2f', '#ff8a3d']

export interface FlatOptions {
  hair?: (typeof HAIRS)[number] | 'random'
  pattern?: (typeof PATTERNS)[number] | 'random'
  skin?: string
  hairColor?: string
  shirt?: string
}

const INK = '#1e1e2f'

/** Flat geometric people in the corporate-illustration style: solid shapes, no outlines. */
export const flat = defineStyle<FlatOptions>({
  name: 'flat',
  colors: ['#ffd6c9', '#c9e4ff', '#fff1b8', '#d4f5e1', '#e5dbff', '#ffe0f0', '#d0f0f7', '#f2efe8'],
  defaults: { hair: 'random', pattern: 'random' },
  variants: { hair: HAIRS, pattern: PATTERNS, skin: SKIN, hairColor: HAIR_COLORS, shirt: SHIRT },
  render({ rand, pick, id, mood, options: o }) {
    const hair = pick('hair', HAIRS)
    const pattern = pick('pattern', PATTERNS)
    const skin = safe(opt(o.skin, () => rand.pick(SKIN)))
    const hc = safe(opt(o.hairColor, () => rand.pick(HAIR_COLORS)))
    const shirt = safe(opt(o.shirt, () => rand.pick(SHIRT)))
    const fg = shade(shirt, 1.45)
    const dk = shade(skin, 0.82)

    const pat =
      pattern === 'dots'
        ? `<pattern id="${id}-p" width="7" height="7" patternUnits="userSpaceOnUse">${C(3.5, 3.5, 1.4, fg)}</pattern>`
        : pattern === 'stripes'
          ? `<pattern id="${id}-p" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="3" fill="${fg}"/></pattern>`
          : pattern === 'zigzag'
            ? `<pattern id="${id}-p" width="10" height="8" patternUnits="userSpaceOnUse">${S('M0 5L5 2L10 5', fg, 1.6)}</pattern>`
            : ''
    const BODY = 'M10 108C10 88 26 78 50 78C74 78 90 88 90 108Z'

    let back = ''
    let top = ''
    switch (hair) {
      case 'bob':
        back = `<rect x="24" y="22" width="52" height="50" rx="20" fill="${hc}"/>`
        top = P('M27 42C27 26 37 19 50 19C63 19 73 26 73 42H50C46 36 42 34 38 34C33 36 30 39 27 42Z', hc)
        break
      case 'afro':
        back = C(50, 34, 27, hc)
        break
      case 'quiff':
        top = P('M29 40C27 26 36 16 52 14C64 12 76 20 72 34C70 30 64 28 58 30C50 32 38 32 29 40Z', hc)
        break
      case 'long':
        back = P('M26 40C26 24 37 18 50 18C63 18 74 24 74 40V86H26Z', hc)
        top = P('M28 40C28 26 38 19 50 19C62 19 72 26 72 40C62 38 54 32 50 26C46 32 38 38 28 40Z', hc)
        break
      case 'bun':
        back = C(50, 14, 9, hc)
        top = P('M28 40C28 26 38 20 50 20C62 20 72 26 72 40C66 32 58 29 50 29C42 29 34 32 28 40Z', hc)
        break
    }

    const ey = 47
    const gap = 9
    const my = 60
    const eye = (x: number, y: number) => C(x, y, 2.2, INK)
    const F: FaceSpec = { x: 50, ey, gap, my, ink: INK, s: 0.85, eye }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${eye(50 - gap, ey)}</g><g data-lv-eye="">${eye(50 + gap, ey)}</g>` : faceEyes(F, mood)
    const mouth = mood === 'neutral' ? P(`M44 ${my}H56Q56 ${my + 5} 50 ${my + 5}Q44 ${my + 5} 44 ${my}Z`, '#fff') : faceMouth(F, mood)

    return (
      `<defs>${pat}</defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".12">` +
      P(BODY, shirt) +
      (pat ? P(BODY, `url(#${id}-p)`) : '') +
      `<rect x="42" y="60" width="16" height="24" rx="2" fill="${dk}"/>` +
      P('M40 79L50 90L60 79Z', skin) +
      `</g>` +
      `<g data-lv-depth=".45" data-lv-tilt="4">` +
      back +
      M(C(28, 47, 4.4, dk)) +
      `<rect x="28" y="22" width="44" height="48" rx="22" fill="${skin}"/>` +
      top +
      `<g data-lv-depth=".6">` +
      eyes +
      faceBrows(F, mood) +
      P(`M50 ${n(ey + 1)}L${n(55)} ${n(ey + 8)}H50Z`, dk) +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g></g></g>`
    )
  },
})
