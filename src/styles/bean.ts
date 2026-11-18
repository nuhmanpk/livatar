import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, star, type FaceSpec } from '../face'

const KINDS = ['classic', 'astro', 'ninja', 'knight', 'wizard', 'detective', 'hero'] as const
const PATTERNS = ['plain', 'spots', 'stripes', 'zigzag', 'hearts', 'split'] as const
type Kind = (typeof KINDS)[number]
type Pattern = (typeof PATTERNS)[number]

export interface BeanOptions {
  kind?: Kind | 'random'
  /** Body pattern; seeded by default so every user gets a unique bean. */
  pattern?: Pattern | 'random'
}

const INK = '#1f1a2e'
const OL = '#1f2a44'
const SKINS: [string, string][] = [
  ['#ff9ec4', '#e85a96'], ['#ffd66b', '#f2a81d'], ['#8fd8ff', '#2f97e0'], ['#a8f08f', '#45b334'],
  ['#c9a6ff', '#7d45d6'], ['#ffb27a', '#ee6a2c'], ['#7ff0dc', '#1fb59a'], ['#ff8f8f', '#e03c4c'],
]
const ACCENT = ['#ffffff', '#ffe066', '#ff5c8a', '#3ec1ff', '#1f2a44', '#7bdc6a']

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
/** Chunky outlined shape: dark stroke behind, fill on top. */
const O = (d: string, fill: string, w = 5) => `<path d="${d}" fill="${OL}" stroke="${OL}" stroke-width="${w}" stroke-linejoin="round"/><path d="${d}" fill="${fill}"/>`
/** Outlined limb stroke. */
const L = (d: string, fill: string, w = 7) => S(d, OL, w + 3.5) + S(d, fill, w)

const BODY = 'M50 16C66 16 71 30 71 48V70C71 83 62 89 50 89C38 89 29 83 29 70V48C29 30 34 16 50 16Z'

function pattern(kind: Pattern, col: string, rand: { float(a: number, b: number): number }): string {
  switch (kind) {
    case 'spots': {
      let s = ''
      const at: [number, number][] = [[36, 26], [62, 30], [33, 62], [60, 58], [46, 78], [68, 76], [40, 44]]
      for (const [x, y] of at) s += C(x + rand.float(-2, 2), y + rand.float(-2, 2), rand.float(3, 5.5), col, ' opacity=".85"')
      return s
    }
    case 'stripes':
      return [30, 58, 74].map((y) => P(`M20 ${y}H80V${y + 6}H20Z`, col, ' opacity=".85"')).join('')
    case 'zigzag':
      return S('M24 64L32 58L40 64L48 58L56 64L64 58L72 64L80 58', col, 4.5, ' opacity=".9"') + S('M24 76L32 70L40 76L48 70L56 76L64 70L72 76', col, 4.5, ' opacity=".9"')
    case 'hearts': {
      const h = (x: number, y: number, r: number) => P(`M${x} ${y + r * 0.8}C${x - r * 1.6} ${y - r * 0.3} ${x - r * 0.8} ${y - r * 1.5} ${x} ${y - r * 0.55}C${x + r * 0.8} ${y - r * 1.5} ${x + r * 1.6} ${y - r * 0.3} ${x} ${y + r * 0.8}Z`, col, ' opacity=".85"')
      return h(36, 64, 4) + h(62, 70, 4.5) + h(48, 80, 3.5) + h(64, 26, 3.5)
    }
    case 'split':
      return P('M50 0H100V100H50Z', col, ' opacity=".55"')
    default:
      return ''
  }
}

/** Wobbly jelly-bean party characters with costumes, seeded patterns and arms that go up when happy. */
export const bean = defineStyle<BeanOptions>({
  name: 'bean',
  scale: 0.86,
  colors: ['#e6f4ff', '#fff1c9', '#ffe0ec', '#e6ffe0', '#efe2ff', '#ffe9d6', '#d6fbf4', '#f5f5f5'],
  defaults: { kind: 'random', pattern: 'random' },
  variants: { kind: KINDS, pattern: PATTERNS },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const pat = pick('pattern', PATTERNS)
    let [c1, c2] = rand.pick(SKINS)
    let patCol = rand.pick(ACCENT.filter((a) => a !== c1))
    const up = mood === 'happy' || mood === 'laugh' || mood === 'starstruck' || mood === 'love'

    let back = ''
    let surface = ''
    let front = ''
    let face = ''
    const [fx, ey, gap, my, s] = [50, 42, 8.5, 52, 0.95]
    let showMouth = true
    let handR = ''

    switch (kind) {
      case 'astro': {
        back = S('M50 12V2', OL, 2.4) + `<g data-lv-float="">${C(50, 2, 3.4, '#ff5c8a', ` stroke="${OL}" stroke-width="2"`)}</g>`
        front = C(50, 41, 25, '#cfeaff', ` opacity=".28" stroke="${OL}" stroke-width="2.6"`) + E(39, 28, 6, 3, '#fff', -35, ' opacity=".8"') +
          O('M27 58Q50 66 73 58V64Q50 72 27 64Z', '#e8eef7', 4)
        break
      }
      case 'ninja': {
        ;[c1, c2] = rand.pick([['#3a3f5c', '#1d2033'], ['#3c2a4f', '#1b1326'], ['#2f4a3a', '#16261c']])
        const band = rand.pick(['#e8344e', '#3ec1ff', '#ffd23f'])
        surface = E(fx, ey, 20, 9.5, '#ffd9b8')
        back = `<g data-lv-tilt="10">${L('M68 30Q80 26 86 34', band, 4) + L('M68 32Q78 36 82 44', band, 4)}</g>`
        front = O('M29 28Q50 22 71 28V33Q50 27 29 33Z', band, 3.5)
        showMouth = false
        patCol = '#4a5072'
        break
      }
      case 'knight': {
        const steel = '#c9d1df'
        surface = P('M0 0H100V30H0Z', steel) + S('M50 16V30', '#9aa4b8', 2)
        back = `<g data-lv-tilt="8">${O('M50 18Q46 4 58 2Q54 10 62 8Q56 14 54 20Z', rand.pick(['#e8344e', '#3ec1ff', '#ffd23f']), 3.5)}</g>`
        front = up
          ? O('M32 22L68 18L68 24L32 28Z', steel, 3.5) + S('M40 23L60 21', OL, 1.6)
          : O('M30 29Q50 26 70 29V34Q50 31 30 34Z', steel, 3.5) + S('M36 31.5H64', OL, 1.4, ' stroke-dasharray="2 2"')
        handR = O('M78 50L80 20L83 20L85 50Z', '#e8eef7', 3) + O('M74 50H89V54H74Z', '#8a6a3a', 3)
        break
      }
      case 'wizard': {
        const hat = rand.pick(['#5b3fc4', '#2f6fd6', '#1f8a6e', '#b03a8a'])
        front = O('M32 20Q46 -6 64 2Q56 6 62 20Z', hat, 4.5) + O('M24 21Q50 12 76 21Q50 28 24 21Z', hat, 4.5) +
          star(48, 10, 2.6) + star(56, 15, 1.8)
        handR = L('M80 66L90 46', '#8a5a2b', 3.2) + `<g data-lv-float="">${star(91, 42, 4.2)}</g>`
        break
      }
      case 'detective': {
        const tw = rand.pick(['#b8875a', '#8f9f6a', '#a3784f'])
        front = O('M28 26Q30 10 50 10Q70 10 72 26Z', tw, 4.5) + S('M34 22L44 12M44 25L58 11M56 25L68 15', '#6b4a2b', 1.6, ' opacity=".7"') +
          O('M24 26Q50 20 76 26Q72 30 50 29Q28 30 24 26Z', tw, 4) + C(50, 10, 2.6, OL)
        handR = L('M80 70L86 62', '#5a3d22', 3.4) + C(90, 55, 7, '#cfeaff', ` opacity=".55" stroke="${OL}" stroke-width="2.8"`) + E(88, 53, 2, 1.2, '#fff', -35)
        break
      }
      case 'hero': {
        const cape = rand.pick(['#e8344e', '#2f6fd6', '#7d45d6', '#1fb59a'])
        back = `<g data-lv-tilt="6">${O('M32 54Q20 76 18 94Q50 86 82 94Q80 76 68 54Z', cape, 4.5)}</g>`
        face = O(`M${fx - 18} ${ey - 3}Q${fx} ${ey - 9} ${fx + 18} ${ey - 3}Q${fx + 19} ${ey + 6} ${fx + 10} ${ey + 6}Q${fx} ${ey + 2} ${fx - 10} ${ey + 6}Q${fx - 19} ${ey + 6} ${fx - 18} ${ey - 3}Z`, OL, 1)
        front = O('M44 63L56 63L58 70L50 76L42 70Z', '#ffd23f', 3.5) + star(50, 69, 3.6, '#e8344e')
        break
      }
      default:
        break
    }

    const tone = mood === 'happy' ? '.3' : '.45'
    const eye = (x: number, y: number) =>
      `<g data-lv-depth=".45">${E(x, y, 3.2 * s, 4 * s, kind === 'hero' ? '#fff' : INK)}${kind === 'hero' ? C(x, y + 0.4, 1.9 * s, INK) : ''}${C(x - 1 * s, y - 1.4 * s, 1.2 * s, kind === 'hero' ? INK : '#fff')}</g>`
    const F: FaceSpec = { x: fx, ey, gap, my, ink: kind === 'hero' ? '#fff' : INK, s, eye, extra: [fx + gap + 10, ey - 14] }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${eye(fx - gap, ey)}</g><g data-lv-eye="">${eye(fx + gap, ey)}</g>` : faceEyes(F, mood)
    const Fm: FaceSpec = { ...F, ink: INK }
    const mouth = !showMouth ? '' : mood === 'neutral' ? S(`M${n(fx - 4.5)} ${my}Q${fx} ${n(my + 4.5)} ${n(fx + 4.5)} ${my}`, INK, 2.1) : faceMouth(Fm, mood)
    const blush = kind === 'ninja' ? '' : E(fx - gap - 4, ey + 6, 3.4, 1.9, '#ff5c8a', 0, ` opacity="${tone}"`) + E(fx + gap + 4, ey + 6, 3.4, 1.9, '#ff5c8a', 0, ` opacity="${tone}"`)

    const arms = up
      ? L('M31 56Q22 48 18 36', c2) + C(18, 34, 4.4, c1, ` stroke="${OL}" stroke-width="2.6"`) + L('M69 56Q78 48 82 36', c2) + C(82, 34, 4.4, c1, ` stroke="${OL}" stroke-width="2.6"`)
      : L('M31 58Q23 64 21 72', c2) + C(21, 73, 4.4, c1, ` stroke="${OL}" stroke-width="2.6"`) + L('M69 58Q77 64 79 72', c2) + C(79, 73, 4.4, c1, ` stroke="${OL}" stroke-width="2.6"`)
    const feet = O('M36 86Q36 95 43 95Q48 95 48 88Z', c2, 4) + O('M64 86Q64 95 57 95Q52 95 52 88Z', c2, 4)

    return (
      `<defs><radialGradient id="${id}-g" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>` +
      `<clipPath id="${id}-p"><path d="${BODY}"/></clipPath></defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".3" data-lv-tilt="5">` +
      back +
      feet +
      `<path d="${BODY}" fill="${OL}" stroke="${OL}" stroke-width="5.5" stroke-linejoin="round"/>` +
      `<path d="${BODY}" fill="url(#${id}-g)"/>` +
      `<g clip-path="url(#${id}-p)">${pattern(pat, patCol, rand)}${surface}${C(62, 70, 26, 'rgba(0,0,0,.08)')}</g>` +
      E(39, 26, 5, 2.6, '#fff', -35, ' opacity=".6"') +
      arms +
      handR +
      front +
      `<g data-lv-depth=".6">` +
      face +
      eyes +
      faceBrows(Fm, mood) +
      blush +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(Fm, mood) +
      `</g>` +
      `</g></g>`
    )
  },
})
