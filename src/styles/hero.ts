import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, star, type FaceSpec } from '../face'

const KINDS = ['leaf', 'bolt', 'frost', 'blaze', 'comet', 'tide', 'stone', 'shadow'] as const
type Kind = (typeof KINDS)[number]

export interface HeroOptions {
  kind?: Kind | 'random'
  /** A domino mask around the eyes. */
  mask?: boolean | 'random'
}

const INK = '#2a1d1a'
const OL = '#2a2440'
const SKIN: [string, string][] = [['#ffe1cc', '#f2b89a'], ['#f6cfae', '#dda07a'], ['#e0aa80', '#b97a52'], ['#b77a52', '#8a5434'], ['#8a5a3c', '#62391f']]

interface Theme { suit: string; suit2: string; cape: string; trim: string; emblem: (x: number, y: number) => string }

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
const O = (d: string, fill: string, w = 4) => `<path d="${d}" fill="${OL}" stroke="${OL}" stroke-width="${w}" stroke-linejoin="round"/><path d="${d}" fill="${fill}"/>`
const L = (d: string, fill: string, w = 6.5) => S(d, OL, w + 3) + S(d, fill, w)

const bolt = (x: number, y: number) => O(`M${x + 1} ${y - 5}L${x - 3} ${y + 1}H${x}L${x - 1} ${y + 5}L${x + 3} ${y - 1}H${x}Z`, '#ffd23f', 2)
const flake = (x: number, y: number) => S(`M${x} ${y - 4}V${y + 4}M${x - 3.5} ${y - 2}L${x + 3.5} ${y + 2}M${x - 3.5} ${y + 2}L${x + 3.5} ${y - 2}`, '#ffffff', 1.6)
const flameMark = (x: number, y: number) => O(`M${x} ${y - 5}C${x + 4} ${y - 1} ${x + 4} ${y + 4} ${x} ${y + 4.5}C${x - 4} ${y + 4} ${x - 4} ${y - 1} ${x} ${y - 5}Z`, '#ffd23f', 2)
const wave = (x: number, y: number) => S(`M${x - 4.5} ${y + 1}Q${x - 2.5} ${y - 3} ${x} ${y + 1}T${x + 4.5} ${y + 1}`, '#ffffff', 1.8)
const moon = (x: number, y: number) => P(`M${x + 1} ${y - 4.5}A4.5 4.5 0 1 0 ${x + 1} ${y + 4.5}A3.4 3.4 0 1 1 ${x + 1} ${y - 4.5}Z`, '#ffe9a8')
const rock = (x: number, y: number) => O(`M${x - 4} ${y + 2}L${x - 2} ${y - 3}L${x + 3} ${y - 3}L${x + 4} ${y + 2}L${x} ${y + 4}Z`, '#e7c08a', 1.6)

const THEMES: Record<Kind, Theme> = {
  leaf: { suit: '#3d7be0', suit2: '#2a5cb8', cape: '#e8344e', trim: '#ffd23f', emblem: (x, y) => star(x, y, 4.2) },
  bolt: { suit: '#2d2f45', suit2: '#1c1d2e', cape: '#ffd23f', trim: '#ffd23f', emblem: bolt },
  frost: { suit: '#7fd0ff', suit2: '#3f9fe0', cape: '#e9f6ff', trim: '#ffffff', emblem: flake },
  blaze: { suit: '#f2602c', suit2: '#c43d17', cape: '#ffb030', trim: '#ffd23f', emblem: flameMark },
  comet: { suit: '#6b44c9', suit2: '#4a2a9a', cape: '#ff7ac8', trim: '#ffe066', emblem: (x, y) => star(x, y, 4.2, '#ffe066') },
  tide: { suit: '#1fb59a', suit2: '#13866f', cape: '#2f6fd6', trim: '#bff5ea', emblem: wave },
  stone: { suit: '#8a7f74', suit2: '#5f564e', cape: '#b04a2a', trim: '#e7c08a', emblem: rock },
  shadow: { suit: '#33304a', suit2: '#1d1b2c', cape: '#3e3a5c', trim: '#ffe9a8', emblem: moon },
}

/** Hair and headgear for each hero, drawn around a head at (50, 38) r 21. */
function hair(kind: Kind, rand: { float(a: number, b: number): number; pick<T>(a: readonly T[]): T }): { back: string; front: string } {
  switch (kind) {
    case 'leaf': {
      const leaf = (a: number, r: number, k: string) => {
        const rad = (a * Math.PI) / 180
        const x = 50 + Math.cos(rad) * 20
        const y = 36 + Math.sin(rad) * 20
        return O(`M${n(x - r)} ${n(y)}Q${n(x - r)} ${n(y - r)} ${n(x)} ${n(y - r)}Q${n(x + r * 1.1)} ${n(y - r * 0.9)} ${n(x + r)} ${n(y + r * 0.2)}Q${n(x)} ${n(y + r * 0.9)} ${n(x - r)} ${n(y)}Z`, k, 3) +
          S(`M${n(x - r * 0.5)} ${n(y)}Q${n(x)} ${n(y - r * 0.3)} ${n(x + r * 0.6)} ${n(y - r * 0.4)}`, '#2f7a24', 1.2, ' opacity=".7"')
      }
      let back = ''
      for (const a of [170, 195, 220, 245, 270, 295, 320, 345, 10]) back += leaf(a, rand.float(9, 11.5), a % 50 ? '#6cc24a' : '#4fae36')
      let front = ''
      for (const a of [215, 250, 285, 320]) front += leaf(a, rand.float(7, 9), '#8fdb5f')
      return { back, front: `<g data-lv-tilt="3">${front}</g>` }
    }
    case 'bolt': {
      const spikes = 'M28 34L24 18L36 24L40 8L50 20L60 6L64 22L76 16L72 34Q50 24 28 34Z'
      return { back: O(spikes, '#ffd23f'), front: O('M34 30Q44 20 58 24L50 30L42 28Z', '#ffe066', 3) }
    }
    case 'frost': {
      return { back: O('M28 32L30 16L38 24L44 6L50 20L56 6L62 24L70 16L72 32Q50 24 28 32Z', '#e9f6ff'), front: S('M44 10L50 20L56 10', '#9fd8ff', 1.6) }
    }
    case 'blaze': {
      const f = 'M28 36Q22 22 32 12Q32 22 38 22Q36 8 48 2Q46 16 54 18Q56 8 66 6Q62 16 68 20Q74 14 76 22Q80 30 72 36Q50 26 28 36Z'
      return { back: `<g data-lv-float="">${O(f, '#ff7a1f')}</g>`, front: P('M36 28Q40 18 46 16Q44 24 50 24Q54 16 60 14Q58 24 64 28Q50 22 36 28Z', '#ffd23f') }
    }
    case 'comet': {
      return {
        back: O('M28 36Q26 14 50 14Q70 14 74 26Q86 22 94 10Q90 30 72 36Q50 26 28 36Z', '#b48cff'),
        front: `<g data-lv-float="">${star(88, 14, 3) + star(80, 8, 2)}</g>` + O('M32 30Q44 18 62 24Q50 24 42 32Z', '#d4bcff', 3),
      }
    }
    case 'tide': {
      return {
        back: O('M28 36Q24 16 46 14Q66 12 74 26Q78 32 72 36Q50 26 28 36Z', '#1f8fb5'),
        front: O('M30 30Q34 20 44 22Q40 28 48 28Q46 20 58 20Q56 28 66 26Q62 32 70 32Q50 24 30 30Z', '#5fd6f0', 3),
      }
    }
    case 'stone': {
      return {
        back: O('M27 38L26 22L36 14L52 12L66 16L74 26L73 38Q50 30 27 38Z', '#9a8f84'),
        front: S('M36 16L40 26M56 13L54 24M68 22L62 28', '#5f564e', 1.6) + O('M30 30L50 26L70 30V34L50 31L30 34Z', '#b8aea3', 3),
      }
    }
    case 'shadow': {
      return {
        back: O('M24 50Q20 20 40 10Q50 0 60 10Q80 20 76 50Z', '#33304a'),
        front: O('M40 10L50 -2L60 10Q50 8 40 10Z', '#33304a', 3),
      }
    }
  }
}

/** Original chibi superheroes: big-eyed kids with themed hair, capes, suits and emblems. */
export const hero = defineStyle<HeroOptions>({
  name: 'hero',
  scale: 0.9,
  colors: ['#cfeff0', '#fff1c9', '#e6efff', '#ffe6dc', '#efe2ff', '#e1f7ef', '#f0ebe5', '#e3e1f0'],
  defaults: { kind: 'random', mask: 'random' },
  variants: { kind: KINDS, mask: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const mask = pick('mask', [true, false])
    const t = THEMES[kind]
    const [sk1, sk2] = kind === 'stone' ? (['#c9bfb4', '#9a8f84'] as [string, string]) : rand.pick(SKIN)
    const up = mood === 'happy' || mood === 'laugh' || mood === 'starstruck' || mood === 'love'
    const h = hair(kind, rand)

    const [fx, ey, gap, my, s] = [50, 41, 8.5, 51, 1]
    const cape = `<g data-lv-tilt="6">${O('M36 60Q22 78 16 97Q50 90 84 97Q78 78 64 60Z', t.cape, 4.5)}${S('M30 82Q50 78 70 82', 'rgba(0,0,0,.18)', 2)}</g>`
    const torso = O('M37 60Q50 56 63 60L64 84H36Z', t.suit)
    const belt = O('M36 76H64V81H36Z', t.trim, 2.5) + O('M47 75.5H53V81.5H47Z', t.trim === '#ffffff' ? '#cfe6f7' : '#e0a100', 2)
    const legs = O('M38 83H49V92H38Z', t.suit2, 3) + O('M51 83H62V92H51Z', t.suit2, 3) +
      O('M36 90H49Q50 97 44 97H36Z', t.cape === '#e9f6ff' ? '#3f9fe0' : t.cape, 3) + O('M51 90H64V97H56Q50 97 51 90Z', t.cape === '#e9f6ff' ? '#3f9fe0' : t.cape, 3)
    const glove = t.cape === '#e9f6ff' ? '#3f9fe0' : t.cape
    const arms = up
      ? L('M38 62Q28 54 24 42', t.suit) + C(24, 40, 4.6, glove, ` stroke="${OL}" stroke-width="2.4"`) + L('M62 62Q72 54 76 42', t.suit) + C(76, 40, 4.6, glove, ` stroke="${OL}" stroke-width="2.4"`)
      : L('M38 63Q30 68 30 76', t.suit) + C(31, 77, 4.6, glove, ` stroke="${OL}" stroke-width="2.4"`) + L('M62 63Q70 68 70 76', t.suit) + C(69, 77, 4.6, glove, ` stroke="${OL}" stroke-width="2.4"`)
    const emblem = C(50, 68, 6, t.suit2, ` stroke="${t.trim}" stroke-width="1.4"`) + t.emblem(50, 68)

    const head =
      E(29, 42, 3.6, 4.6, sk2, 0, ` stroke="${OL}" stroke-width="2.4"`) + E(71, 42, 3.6, 4.6, sk2, 0, ` stroke="${OL}" stroke-width="2.4"`) +
      `<circle cx="50" cy="40" r="21" fill="${OL}" stroke="${OL}" stroke-width="4.5"/><circle cx="50" cy="40" r="21" fill="url(#${id}-g)"/>`
    const domino = mask
      ? O(`M${fx - 17} ${ey - 2}Q${fx} ${ey - 8} ${fx + 17} ${ey - 2}Q${fx + 18} ${ey + 6} ${fx + 9} ${ey + 6}Q${fx} ${ey + 2} ${fx - 9} ${ey + 6}Q${fx - 18} ${ey + 6} ${fx - 17} ${ey - 2}Z`, kind === 'shadow' ? '#1d1b2c' : t.suit2, 2)
      : ''

    const eye = (x: number, y: number) =>
      `<g data-lv-depth=".45">${E(x, y, 4.4, 5, '#fff', 0, ` stroke="${INK}" stroke-width=".8"`)}${C(x, y + 0.6, 3.2, '#3b2a24')}${C(x, y + 0.6, 1.6, '#120c0a')}${C(x - 1.3, y - 1, 1.3, '#fff')}${C(x + 1.2, y + 2, 0.6, '#fff')}</g>`
    const F: FaceSpec = { x: fx, ey, gap, my, ink: INK, s, eye, extra: [fx + gap + 12, ey - 16] }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${eye(fx - gap, ey)}</g><g data-lv-eye="">${eye(fx + gap, ey)}</g>` : faceEyes(F, mood)
    const mouth = mood === 'neutral' ? S(`M${fx - 4.5} ${my}Q${fx} ${my + 4.5} ${fx + 4.5} ${my}`, INK, 1.9) + S(`M${fx - 1} ${my - 3.5}Q${fx} ${my - 2.6} ${fx + 1} ${my - 3.5}`, '#c27a62', 1.2) : faceMouth(F, mood)
    const tone = mood === 'happy' ? '.35' : '.5'
    const blush = E(fx - gap - 5, ey + 6.5, 3.6, 2, '#ff7a8a', 0, ` opacity="${tone}"`) + E(fx + gap + 5, ey + 6.5, 3.6, 2, '#ff7a8a', 0, ` opacity="${tone}"`)

    return (
      `<defs><radialGradient id="${id}-g" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="${sk1}"/><stop offset="1" stop-color="${sk2}"/></radialGradient></defs>` +
      `<g data-lv-body="">` +
      cape +
      legs +
      torso +
      belt +
      emblem +
      arms +
      `<g data-lv-depth=".3" data-lv-tilt="4">` +
      h.back +
      head +
      h.front +
      `<g data-lv-depth=".6">` +
      domino +
      eyes +
      faceBrows(F, mood) +
      blush +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g>` +
      `</g></g>`
    )
  },
})
