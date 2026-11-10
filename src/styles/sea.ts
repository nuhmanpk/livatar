import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['fish', 'octopus', 'crab', 'whale', 'jellyfish', 'starfish', 'puffer', 'turtle'] as const
type Kind = (typeof KINDS)[number]

export interface SeaOptions {
  kind?: Kind | 'random'
  /** A few rising bubbles beside the creature. */
  bubbles?: boolean | 'random'
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
/** Thick outlined line (tentacle, leg). */
const L = (d: string, fill: string, w: number) => S(d, OL, w + 5) + S(d, fill, w)
const bubble = (x: number, y: number, r: number) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="#ffffff" fill-opacity=".55" stroke="${OL}" stroke-width="2"/>` + C(x - r * 0.35, y - r * 0.35, r * 0.25, '#fff')

/** Friendly sea life — fish, octopuses, crabs, whales, jellyfish, turtles… */
export const sea = defineStyle<SeaOptions>({
  name: 'sea',
  scale: 0.84,
  colors: ['#d6f1ff', '#c9f0ea', '#dcecff', '#e6f7ff', '#efe2ff', '#d9f7d6', '#fff1c9', '#ffe0e6'],
  defaults: { kind: 'random', bubbles: 'random' },
  variants: { kind: KINDS, bubbles: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const bubbles = pick('bubbles', [true, false])

    let [cx, cy, r] = [50, 54, 30]
    let [c1, c2] = ['#8fd3ff', '#3a8fe0']
    let body = ''
    let back = ''
    let surface = ''
    let front = ''
    let [ey, gap, my, s] = [52, 10, 61, 0.95]
    let fx = 50
    let bub: [number, number][] = [[84, 30], [90, 18], [80, 12]]

    switch (kind) {
      case 'fish': {
        ;[c1, c2] = rand.pick([['#ffc56b', '#ff7a1a'], ['#9fe0ff', '#3a8fe0'], ['#ffa3c4', '#e0457b']])
        body = 'M18 54C18 36 34 28 50 28C66 28 76 40 78 54C76 68 66 80 50 80C34 80 18 72 18 54Z'
        back =
          O('M74 54L94 36Q98 54 94 72Z', c2) +
          O('M40 30Q48 14 62 30Z', c2, 5)
        front = O('M44 64Q52 74 56 64Q50 60 44 64Z', c2, 4)
        surface = S('M62 34Q56 54 62 76', 'rgba(0,0,0,.15)', 2.4)
        ;[cx, cy, r] = [46, 54, 30]
        fx = 40
        ;[ey, gap, my, s] = [50, 9, 59, 0.9]
        bub = [[16, 26], [10, 14], [22, 12]]
        break
      }
      case 'octopus': {
        ;[c1, c2] = rand.pick([['#ffb0c8', '#f0558a'], ['#d4b0ff', '#8a4fe0']])
        body = 'M22 54C22 30 34 16 50 16C66 16 78 30 78 54C78 64 70 68 50 68C30 68 22 64 22 54Z'
        const t = (d: string) => L(d, c2, 8)
        back = t('M28 62Q16 76 22 86') + t('M40 66Q36 82 42 90') + t('M60 66Q64 82 58 90') + t('M72 62Q84 76 78 86')
        surface = C(32, 30, 3, '#fff', ' opacity=".35"') + C(68, 34, 2.4, '#fff', ' opacity=".35"')
        ;[cx, cy, r] = [50, 42, 28]
        ;[ey, gap, my, s] = [44, 10, 54, 0.95]
        bub = [[86, 28], [90, 16], [82, 10]]
        break
      }
      case 'crab': {
        ;[c1, c2] = ['#ff9a8a', '#e0403a']
        body = 'M16 62C16 46 32 38 50 38C68 38 84 46 84 62C84 74 70 80 50 80C30 80 16 74 16 62Z'
        const claw = (x: number, m: 1 | -1) =>
          L(`M${50 + m * 26} 54Q${50 + m * 34} 40 ${x} 30`, c2, 5) +
          O(`M${x} 32C${x - 9 * m} 30 ${x - 10 * m} 18 ${x - 2 * m} 14L${x + 1 * m} 22L${x + 7 * m} 16C${x + 12 * m} 22 ${x + 8 * m} 32 ${x} 32Z`, c2, 5)
        const leg = (m: 1 | -1, y: number) => L(`M${50 + m * 28} ${y}L${50 + m * 40} ${y + 8}`, c2, 4)
        back = claw(86, 1) + claw(14, -1) + leg(1, 64) + leg(-1, 64) + leg(1, 72) + leg(-1, 72) +
          L('M40 42L36 28', c2, 3.5) + L('M60 42L64 28', c2, 3.5)
        ;[cx, cy, r] = [50, 60, 30]
        ;[ey, gap, my, s] = [56, 10, 66, 0.95]
        bub = [[50, 18], [44, 10], [56, 8]]
        break
      }
      case 'whale': {
        ;[c1, c2] = rand.pick([['#9cc8ff', '#4a74d6'], ['#a7e6e0', '#3aa39b']])
        body = 'M10 58C10 38 28 30 48 30C70 30 82 44 84 56C86 62 90 60 92 52C96 58 94 72 84 74C76 82 62 84 46 84C24 84 10 74 10 58Z'
        back = O('M84 56C86 44 80 36 90 32C92 40 98 40 96 50C94 56 88 58 84 56Z', c2, 5) +
          L('M30 30Q28 20 22 16', '#bfe6ff', 3) + L('M30 30Q32 20 38 16', '#bfe6ff', 3)
        surface = P('M10 64C24 72 48 76 76 74L76 90L10 90Z', '#e8f4ff', ' opacity=".85"') + S('M20 70Q40 78 64 78', 'rgba(0,0,0,.12)', 1.6)
        ;[cx, cy, r] = [46, 58, 32]
        fx = 40
        ;[ey, gap, my, s] = [54, 10, 63, 0.95]
        bub = [[60, 18], [68, 10], [54, 8]]
        break
      }
      case 'jellyfish': {
        ;[c1, c2] = rand.pick([['#e3c4ff', '#a06ae8'], ['#ffc4e0', '#e86aa8'], ['#bdf0ff', '#4ab8e0']])
        body = 'M18 54C18 30 32 16 50 16C68 16 82 30 82 54C76 58 70 54 64 58C58 54 50 58 50 58C50 58 42 54 36 58C30 54 24 58 18 54Z'
        const t = (d: string) => L(d, c1, 3.5)
        back = t('M28 56Q22 70 30 80Q36 88 28 94') + t('M42 58Q46 72 40 82Q36 90 42 96') + t('M58 58Q54 72 60 82Q64 90 58 96') + t('M72 56Q78 70 70 80Q64 88 72 94')
        surface = S('M24 48Q50 40 76 48', '#fff', 2.4, ' opacity=".4"') + C(38, 26, 2.6, '#fff', ' opacity=".5"')
        ;[cx, cy, r] = [50, 38, 30]
        ;[ey, gap, my, s] = [38, 10, 47, 0.95]
        bub = [[88, 26], [92, 14], [84, 10]]
        break
      }
      case 'starfish': {
        ;[c1, c2] = rand.pick([['#ffd06b', '#ff8a2a'], ['#ffa3a3', '#e8505a']])
        const pts: string[] = []
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (i * Math.PI) / 5
          const rr = i % 2 ? 17 : 40
          pts.push(`${n(50 + Math.cos(a) * rr)} ${n(55 + Math.sin(a) * rr)}`)
        }
        body = `M${pts.join('L')}Z`
        back = ''
        surface = [[50, 26], [76, 47], [67, 77], [33, 77], [24, 47], [50, 36], [64, 51], [36, 51]].map(([x, y]) => C(x, y, 1.8, '#fff', ' opacity=".5"')).join('')
        ;[cx, cy, r] = [50, 56, 26]
        ;[ey, gap, my, s] = [54, 8.5, 62, 0.85]
        bub = [[86, 18], [92, 8], [80, 8]]
        break
      }
      case 'puffer': {
        ;[c1, c2] = ['#fff0a0', '#f2b81f']
        body = ell(48, 55, 30, 29)
        let spikes = ''
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2 + 0.26
          const [x, y] = [48 + Math.cos(a) * 29, 55 + Math.sin(a) * 28]
          const [x2, y2] = [48 + Math.cos(a) * 37, 55 + Math.sin(a) * 36]
          const px = -Math.sin(a) * 4
          const py = Math.cos(a) * 4
          spikes += O(`M${n(x - px)} ${n(y - py)}L${n(x2)} ${n(y2)}L${n(x + px)} ${n(y + py)}Z`, '#f7d24a', 3.5)
        }
        back = spikes + O('M76 55L92 44Q94 55 92 66Z', '#f2b81f', 5)
        surface = P('M18 62C26 80 70 82 78 62C70 70 26 70 18 62Z', '#fffbe0', ' opacity=".8"') +
          [[30, 40], [58, 34], [66, 46], [36, 30]].map(([x, y]) => C(x, y, 2.2, '#c98a10', ' opacity=".45"')).join('')
        ;[cx, cy, r] = [48, 55, 29]
        fx = 46
        ;[ey, gap, my, s] = [52, 10, 61, 0.95]
        bub = [[14, 20], [8, 10], [20, 8]]
        break
      }
      case 'turtle': {
        ;[c1, c2] = ['#a8e07a', '#4fa83a']
        const skin = '#b6e8a0'
        back =
          O(ell(50, 25, 17, 15), skin) +
          O('M22 62Q10 66 10 76Q20 78 28 70Z', skin, 5) + O('M78 62Q90 66 90 76Q80 78 72 70Z', skin, 5) +
          O('M30 76Q24 88 32 90Q38 86 38 78Z', skin, 5) + O('M70 76Q76 88 68 90Q62 86 62 78Z', skin, 5)
        body = 'M16 64C16 44 32 34 50 34C68 34 84 44 84 64C84 72 70 78 50 78C30 78 16 72 16 64Z'
        surface =
          `<g fill="none" stroke="#2f7a2a" stroke-width="2" stroke-linejoin="round" opacity=".55">` +
          `<path d="M40 44L60 44L66 56L60 68L40 68L34 56Z"/><path d="M40 44L32 38M60 44L68 38M66 56L84 56M34 56L16 56M60 68L66 78M40 68L34 78"/></g>`
        // face sits on the head
        ;[cx, cy, r] = [50, 58, 30]
        ;[ey, gap, my, s] = [23, 7, 31, 0.78]
        bub = [[82, 26], [88, 14], [78, 10]]
        break
      }
    }
    if (!body) body = ell(cx, cy, r, r)

    const eyeK = rand.pick(['dot', 'sparkle'] as const)
    const eye = (x: number, y: number) => `<g data-lv-depth=".45">${E(x, y, 3 * s, 3.6 * s, INK)}${C(x - 1 * s, y - 1.3 * s, 1.15 * s, '#fff')}</g>`
    const neutralEye = (x: number, y: number) =>
      eyeK === 'sparkle'
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
    const bubs = bubbles ? `<g data-lv-depth=".1">${bub.map(([x, y], i) => bubble(x, y, [4, 2.8, 2][i])).join('')}</g>` : ''

    return (
      `<defs><radialGradient id="${id}-g" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>` +
      `<clipPath id="${id}-p"><path d="${body}"/></clipPath></defs>` +
      bubs +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".3" data-lv-tilt="4">` +
      back +
      `<path d="${body}" fill="${OL}" stroke="${OL}" stroke-width="5.5" stroke-linejoin="round"/>` +
      `<path d="${body}" fill="url(#${id}-g)"/>` +
      `<g clip-path="url(#${id}-p)">${surface}${C(cx + r * 0.35, cy + r * 0.45, r * 0.9, 'rgba(0,0,0,.08)')}</g>` +
      (kind === 'turtle' ? '' : E(cx - r * 0.42, cy - r * 0.5, r * 0.22, r * 0.11, '#fff', -35, ' opacity=".6"')) +
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
