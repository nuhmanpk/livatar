import { defineStyle, n, type AvatarStyle } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, star, type FaceSpec } from '../face'

/** Shared engine for the chibi "cast" packs (fantasy, pirate, job, creature, spooky, kid, mascot, scifi, myth). */
export { star }
export const INK = '#2a1d1a'
export const OL = '#2a2440'
export const SKIN: [string, string][] = [['#ffe1cc', '#f2b89a'], ['#f6cfae', '#dda07a'], ['#e0aa80', '#b97a52'], ['#b77a52', '#8a5434'], ['#8a5a3c', '#62391f']]

export const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
export const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
export const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
export const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
export const O = (d: string, fill: string, w = 4) => `<path d="${d}" fill="${OL}" stroke="${OL}" stroke-width="${w}" stroke-linejoin="round"/><path d="${d}" fill="${fill}"/>`
export const L = (d: string, fill: string, w = 6.5) => S(d, OL, w + 3) + S(d, fill, w)

export interface Rnd { float(a: number, b: number): number; pick<T>(a: readonly T[]): T }

export interface Look {
  /** Skin/fur tones [light, dark]; a seeded human tone when omitted. */
  skin?: [string, string]
  /** Clothing/body colours [main, shade]. */
  suit: [string, string]
  /** Drawn behind the head (hair back, hat brim, wings, cape). */
  back?: string
  /** Drawn on top of the head (hair front, hat, horns, mask). */
  front?: string
  /** Drawn on top of the body (belt, apron, badge, chest plate). */
  chest?: string
  /** Extra prop held in the right hand. */
  prop?: string
  /** Long robe/dress skirt instead of legs. */
  robe?: boolean
  /** Glove / hand colour; defaults to skin. */
  glove?: string
  /** Drawn behind the whole body (tail, big wings). */
  tail?: string
  /** Hide the cheek blush. */
  noBlush?: boolean
  /** Eye colour override (e.g. glowing). */
  eye?: string
  /** Lower-face cover drawn over the mouth (mask, beard, bandage). */
  lower?: string
}

export interface CastSpec<K extends string> {
  name: string
  kinds: readonly K[]
  colors: string[]
  look: (kind: K, r: Rnd) => Look
}

export function cast<K extends string>(spec: CastSpec<K>): AvatarStyle<{ kind?: K | 'random' }> {
  return defineStyle<{ kind?: K | 'random' }>({
    name: spec.name,
    scale: 0.9,
    colors: spec.colors,
    defaults: { kind: 'random' },
    variants: { kind: spec.kinds as unknown as K[] },
    render({ rand, pick, id, mood }) {
      const asked = pick('kind', spec.kinds as unknown as never[]) as unknown as K
      const kind = spec.kinds.includes(asked) ? asked : rand.pick(spec.kinds) // unknown kinds (e.g. options from another style) fall back to a seeded one
      const lk = spec.look(kind, rand)
      const [sk1, sk2] = lk.skin ?? rand.pick(SKIN)
      const [c1, c2] = lk.suit
      const glove = lk.glove ?? sk1
      const up = mood === 'happy' || mood === 'laugh' || mood === 'starstruck' || mood === 'love'

      const torso = O('M37 60Q50 56 63 60L64 84H36Z', c1)
      const lower = lk.robe
        ? O('M36 78H64L70 96H30Z', c1, 4.5) + S('M40 84L38 94M50 84V95M60 84L62 94', 'rgba(0,0,0,.16)', 1.6)
        : O('M38 83H49V92H38Z', c2, 3) + O('M51 83H62V92H51Z', c2, 3) + O('M36 90H49Q50 97 44 97H36Z', c2, 3) + O('M51 90H64V97H56Q50 97 51 90Z', c2, 3)
      const arms = up
        ? L('M38 62Q28 54 24 42', c1) + C(24, 40, 4.4, glove, ` stroke="${OL}" stroke-width="2.4"`) + L('M62 62Q72 54 76 42', c1) + C(76, 40, 4.4, glove, ` stroke="${OL}" stroke-width="2.4"`)
        : L('M38 63Q30 68 30 76', c1) + C(31, 77, 4.4, glove, ` stroke="${OL}" stroke-width="2.4"`) + L('M62 63Q70 68 70 76', c1) + C(69, 77, 4.4, glove, ` stroke="${OL}" stroke-width="2.4"`)
      const head =
        E(29, 42, 3.4, 4.4, sk2, 0, ` stroke="${OL}" stroke-width="2.4"`) + E(71, 42, 3.4, 4.4, sk2, 0, ` stroke="${OL}" stroke-width="2.4"`) +
        `<circle cx="50" cy="40" r="21" fill="${OL}" stroke="${OL}" stroke-width="4.5"/><circle cx="50" cy="40" r="21" fill="url(#${id}-g)"/>`

      const [fx, ey, gap, my] = [50, 41, 8.5, 51]
      const eyeCol = lk.eye ?? '#3b2a24'
      const eye = (x: number, y: number) =>
        `<g data-lv-depth=".45">${E(x, y, 4.3, 4.9, '#fff', 0, ` stroke="${INK}" stroke-width=".8"`)}${C(x, y + 0.6, 3.1, eyeCol)}${C(x, y + 0.6, 1.5, '#120c0a')}${C(x - 1.3, y - 1, 1.2, '#fff')}</g>`
      const F: FaceSpec = { x: fx, ey, gap, my, ink: INK, s: 1, eye, extra: [fx + gap + 12, ey - 16] }
      const eyes = mood === 'neutral' ? `<g data-lv-eye="">${eye(fx - gap, ey)}</g><g data-lv-eye="">${eye(fx + gap, ey)}</g>` : faceEyes(F, mood)
      const mouth = mood === 'neutral' ? S(`M${fx - 4.5} ${my}Q${fx} ${my + 4.5} ${fx + 4.5} ${my}`, INK, 1.9) : faceMouth(F, mood)
      const tone = mood === 'happy' ? '.35' : '.5'
      const blush = lk.noBlush ? '' : E(fx - gap - 5, ey + 6.5, 3.5, 2, '#ff7a8a', 0, ` opacity="${tone}"`) + E(fx + gap + 5, ey + 6.5, 3.5, 2, '#ff7a8a', 0, ` opacity="${tone}"`)

      return (
        `<defs><radialGradient id="${id}-g" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="${sk1}"/><stop offset="1" stop-color="${sk2}"/></radialGradient></defs>` +
        `<g data-lv-body="">` +
        (lk.tail ? `<g data-lv-tilt="6">${lk.tail}</g>` : '') +
        lower + torso + (lk.chest ?? '') + arms + (lk.prop ?? '') +
        `<g data-lv-depth=".3" data-lv-tilt="4">` +
        (lk.back ?? '') + head + (lk.front ?? '') +
        `<g data-lv-depth=".6">` +
        eyes + faceBrows(F, mood) + blush + `<g data-lv-mouth="1">${mouth}</g>` + (lk.lower ?? '') + faceExtras(F, mood) +
        `</g></g></g>`
      )
    },
  })
}
