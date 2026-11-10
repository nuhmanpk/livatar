import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['guitar', 'drum', 'note', 'mic', 'trumpet', 'vinyl', 'piano', 'maraca'] as const
type Kind = (typeof KINDS)[number]

export interface MusicOptions {
  kind?: Kind | 'random'
  /** Tiny music notes floating around it. */
  notes?: boolean | 'random'
}

const INK = '#1f1a2e'
const OL = '#1f2a44'

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
const ell = (cx: number, cy: number, rx: number, ry: number) => `M${n(cx - rx)} ${n(cy)}a${n(rx)} ${n(ry)} 0 1 0 ${n(2 * rx)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-2 * rx)} 0Z`
/** Chunky outlined shape: dark stroke behind, fill on top. */
const O = (d: string, fill: string, w = 5.5) => `<path d="${d}" fill="${OL}" stroke="${OL}" stroke-width="${w}" stroke-linejoin="round"/><path d="${d}" fill="${fill}"/>`
/** Chunky outlined line: thick dark stroke behind, colored stroke on top. */
const L = (d: string, color: string, w: number) => S(d, OL, w + 4.5) + S(d, color, w)

const tinyNote = (x: number, y: number, sz: number) =>
  L(`M${n(x + 3 * sz)} ${n(y)}V${n(y - 11 * sz)}L${n(x + 9 * sz)} ${n(y - 8 * sz)}`, '#ff6fa0', 2.2 * sz) + O(ell(x, y, 3.6 * sz, 2.8 * sz), '#ff6fa0', 3.5)

/** Musical friends — guitars, drums, mics, vinyl records, pianos… */
export const music = defineStyle<MusicOptions>({
  name: 'music',
  scale: 0.84,
  colors: ['#efe2ff', '#ffe0e6', '#dcecff', '#fff1c9', '#d9f7d6', '#c9f0ea', '#ffe6cc', '#fbe7ff'],
  defaults: { kind: 'random', notes: 'random' },
  variants: { kind: KINDS, notes: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const notes = pick('notes', [true, false, false])

    let [cx, cy, r] = [50, 54, 30]
    let [c1, c2] = ['#ffb36b', '#d9701a']
    let body = ''
    let back = ''
    let surface = ''
    let front = ''
    let [ey, gap, my, s] = [54, 10, 63, 0.95]
    let fx = 50
    let spots: [number, number, number][] = [[12, 26, 1], [84, 18, 0.85]]

    switch (kind) {
      case 'guitar': {
        body = 'M50 36C62 36 66 44 64 52C76 56 80 66 78 76C76 88 64 94 50 94C36 94 24 88 22 76C20 66 24 56 36 52C34 44 38 36 50 36Z'
        ;[c1, c2] = rand.pick([['#ffb36b', '#d9701a'], ['#ff8fa3', '#d6334f'], ['#8fd0ff', '#2f86e0']])
        back = O('M45 8H55V40H45Z', '#8a5a3b', 4.5) + O('M42 4H58V14H42Z', '#6b4a2e', 4.5) + S('M45 20H55M45 27H55M45 34H55', '#d8c3a0', 1.4)
        surface = C(50, 76, 7, '#3a2414') + O('M40 85H60V89H40Z', '#5a3a1e', 2) + S('M48 36V85M52 36V85', '#f2e6cc', 0.8, ' opacity=".8"')
        ;[cx, cy, r] = [50, 66, 26]
        ;[ey, gap, my, s] = [54, 8, 62, 0.8]
        spots = [[14, 30, 1], [82, 24, 0.85]]
        break
      }
      case 'drum': {
        body = 'M16 40V74C16 88 84 88 84 74V40Z'
        ;[c1, c2] = rand.pick([['#ff8fa3', '#e63950'], ['#8fd0ff', '#2f86e0']])
        back = L('M28 6L50 32', '#d8a46a', 3.5) + L('M74 6L52 32', '#d8a46a', 3.5) + O(ell(27, 6, 3.5, 3.5), '#fff2dc', 3) + O(ell(75, 6, 3.5, 3.5), '#fff2dc', 3)
        surface = S('M16 46L27 76L38 46L49 76L60 46L71 76L84 46', '#fff', 2, ' opacity=".55"') + P('M14 40H86V45H14Z', '#f4d35e')
        front = O(ell(50, 40, 34, 11), '#fff6e8', 5) + E(50, 40, 26, 7, '#efe2cf')
        ;[cx, cy, r] = [50, 62, 30]
        ;[ey, gap, my, s] = [60, 10, 69, 0.9]
        spots = [[10, 30, 0.9], [90, 30, 0.9]]
        break
      }
      case 'note': {
        body = ell(40, 72, 21, 16)
        ;[c1, c2] = rand.pick([['#c9a2ff', '#7b3fc4'], ['#ff9fc0', '#e0457b'], ['#8fe0c0', '#1fa37a']])
        back = L('M57 70V12', '#5e2ea3', 6) + O('M54 10C66 14 80 22 82 40C76 32 68 28 57 28Z', '#7b3fc4', 5)
        ;[cx, cy, r] = [40, 72, 18]
        ;[ey, gap, my, s] = [70, 8, 78, 0.8]
        fx = 40
        spots = [[16, 30, 1], [86, 66, 0.8]]
        break
      }
      case 'mic': {
        body = ell(50, 34, 24, 24)
        ;[c1, c2] = ['#eef1f8', '#a9b6cc']
        back = O('M38 58H62L56 92H44Z', '#2b2d42', 5) + P('M42 64H58V68H42Z', '#ff6fa0')
        let mesh = ''
        for (let k = -4; k <= 4; k++) mesh += `M${30 + k * 8} 8L${70 + k * 8} 60M${70 + k * 8} 8L${30 + k * 8} 60`
        surface = S(mesh, '#7d8ba3', 1.2, ' opacity=".4"')
        front = O('M32 52H68V60H32Z', '#c3cbd8', 4.5)
        ;[cx, cy, r] = [50, 34, 24]
        ;[ey, gap, my] = [33, 9, 42]
        spots = [[14, 30, 1], [84, 70, 0.85]]
        break
      }
      case 'trumpet': {
        body = 'M8 48H44C58 48 70 34 90 24V84C70 74 58 60 44 60H8Z'
        ;[c1, c2] = ['#ffe37a', '#f0a81a']
        back = O('M18 32H24V48H18ZM28 32H34V48H28ZM38 32H44V48H38Z', '#f0a81a', 4.5) + O('M16 28H26V32H16ZM26 28H36V32H26ZM36 28H46V32H36Z', '#ffe37a', 3.5) + L('M12 60Q12 72 26 72H42Q50 72 50 60', '#f0a81a', 4)
        front = O('M88 22Q94 54 88 86L92 86Q98 54 92 22Z', '#ffd24d', 3.5)
        surface = S('M8 51H44', '#fff', 2, ' opacity=".5"')
        ;[cx, cy, r] = [70, 54, 20]
        ;[ey, gap, my, s] = [50, 6.5, 57, 0.7]
        fx = 71
        spots = [[12, 16, 0.9], [62, 14, 0.85]]
        break
      }
      case 'vinyl': {
        body = ell(50, 52, 38, 38)
        ;[c1, c2] = ['#4a4e63', '#15161f']
        surface = [30, 26, 22].map((rr) => S(ell(50, 52, rr, rr), '#6b7088', 1, ' opacity=".6"')).join('') + S('M24 30A36 36 0 0 1 46 18', '#fff', 2.4, ' opacity=".3"')
        front = O(ell(50, 52, 19, 19), `url(#${id}-l)`, 3) + C(50, 52, 1.6, OL) +
          `<defs><radialGradient id="${id}-l" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffb3c9"/><stop offset="1" stop-color="#ff5c8a"/></radialGradient></defs>`
        ;[cx, cy, r] = [50, 52, 38]
        ;[ey, gap, my, s] = [48, 7, 56, 0.7]
        spots = [[10, 14, 0.9], [88, 90, 0.8]]
        break
      }
      case 'piano': {
        body = 'M10 30Q10 18 22 18H78Q90 18 90 30V82Q90 88 84 88H16Q10 88 10 82Z'
        ;[c1, c2] = rand.pick([['#5a5f7a', '#23253a'], ['#ff8fa3', '#d6334f']])
        let keys = O('M14 58H86V84H14Z', '#ffffff', 3)
        for (let i = 1; i < 8; i++) keys += S(`M${n(14 + i * 9)} 58V84`, OL, 1.6)
        for (const i of [1, 2, 4, 5, 6]) keys += P(`M${n(14 + i * 9 - 3)} 58H${n(14 + i * 9 + 3)}V72H${n(14 + i * 9 - 3)}Z`, OL)
        front = keys
        ;[cx, cy, r] = [50, 40, 22]
        ;[ey, gap, my, s] = [34, 10, 43, 0.95]
        spots = [[10, 10, 0.85], [84, 10, 0.85]]
        break
      }
      case 'maraca': {
        body = ell(50, 40, 27, 29)
        ;[c1, c2] = rand.pick([['#ffd36b', '#f08a1a'], ['#9ff0a0', '#3fb34d'], ['#ff9fc0', '#e0457b']])
        back = O('M44 64H56V92Q50 96 44 92Z', '#8a5a3b', 5)
        surface = S('M22 58L30 52L38 58L46 52L54 58L62 52L70 58L78 52', '#fff', 3, ' opacity=".8"') + S('M22 22L30 16L38 22L46 16L54 22L62 16L70 22L78 16', '#fff', 3, ' opacity=".8"') + [[30, 36], [70, 36], [40, 64], [60, 64]].map(([x, y]) => C(x, y, 1.8, '#fff', ' opacity=".8"')).join('')
        ;[cx, cy, r] = [50, 40, 28]
        ;[ey, gap, my] = [38, 9.5, 47]
        spots = [[14, 26, 1], [84, 74, 0.85]]
        break
      }
    }
    if (!body) body = ell(cx, cy, r, r)
    if (notes) back = spots.map(([x, y, sz]) => tinyNote(x, y, sz)).join('') + back

    const eye = (x: number, y: number) => `<g data-lv-depth=".45">${E(x, y, 3 * s, 3.6 * s, INK)}${C(x - 1 * s, y - 1.3 * s, 1.15 * s, '#fff')}</g>`
    const sparkleEye = rand.bool(0.5)
    const neutralEye = (x: number, y: number) =>
      sparkleEye
        ? `<g data-lv-depth=".45">${E(x, y, 3.8 * s, 4.4 * s, INK)}${C(x - 1.3 * s, y - 1.6 * s, 1.5 * s, '#fff')}${C(x + 1.4 * s, y + 1.6 * s, 0.7 * s, '#fff')}</g>`
        : eye(x, y)
    const F: FaceSpec = { x: fx, ey, gap, my, ink: INK, s, eye, extra: [fx + gap + 8, ey - 13] }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${neutralEye(fx - gap, ey)}</g><g data-lv-eye="">${neutralEye(fx + gap, ey)}</g>` : faceEyes(F, mood)
    const mouth =
      mood === 'neutral'
        ? rand.bool(0.5)
          ? S(`M${n(fx - 4.5 * s)} ${my}Q${fx} ${n(my + 4.5 * s)} ${n(fx + 4.5 * s)} ${my}`, INK, 2.1 * s)
          : P(`M${n(fx - 5 * s)} ${my}Q${fx} ${n(my + 9 * s)} ${n(fx + 5 * s)} ${my}Z`, INK, ` stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"`) + E(fx, my + 4 * s, 2.6 * s, 1.5 * s, '#ff7a93')
        : faceMouth(F, mood)
    const bo = mood === 'happy' ? '.3' : '.45'
    const blush = E(fx - gap - 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ` opacity="${bo}"`) + E(fx + gap + 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ` opacity="${bo}"`)

    return (
      `<defs><radialGradient id="${id}-g" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>` +
      `<clipPath id="${id}-p"><path d="${body}"/></clipPath></defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".3" data-lv-tilt="4">` +
      back +
      `<path d="${body}" fill="${OL}" stroke="${OL}" stroke-width="5.5" stroke-linejoin="round"/>` +
      `<path d="${body}" fill="url(#${id}-g)"/>` +
      `<g clip-path="url(#${id}-p)">${surface}${C(cx + r * 0.35, cy + r * 0.45, r * 0.9, 'rgba(0,0,0,.06)')}</g>` +
      E(cx - r * 0.42, cy - r * 0.5, r * 0.22, r * 0.11, '#fff', -35, ' opacity=".6"') +
      front +
      `<g data-lv-depth=".6">` +
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
