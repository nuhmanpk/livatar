import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['raincloud', 'snowflake', 'lightning', 'rainbow', 'umbrella', 'tornado', 'snowman', 'droplet'] as const
type Kind = (typeof KINDS)[number]

export interface WeatherOptions {
  kind?: Kind | 'random'
  /** Little twinkling sparkles floating around the character. */
  sparkles?: boolean | 'random'
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
const drop = (x: number, y: number, sz: number, fill: string) =>
  O(`M${n(x)} ${n(y - sz * 1.6)}C${n(x + sz * 0.4)} ${n(y - sz * 0.6)} ${n(x + sz)} ${n(y - sz * 0.2)} ${n(x + sz)} ${n(y + sz * 0.4)}A${n(sz)} ${n(sz)} 0 0 1 ${n(x - sz)} ${n(y + sz * 0.4)}C${n(x - sz)} ${n(y - sz * 0.2)} ${n(x - sz * 0.4)} ${n(y - sz * 0.6)} ${n(x)} ${n(y - sz * 1.6)}Z`, fill, 3.5)
const sparkle = (x: number, y: number, r: number, fill = '#ffd84d') =>
  O(`M${n(x)} ${n(y - r)}Q${n(x + r * 0.2)} ${n(y - r * 0.2)} ${n(x + r)} ${n(y)}Q${n(x + r * 0.2)} ${n(y + r * 0.2)} ${n(x)} ${n(y + r)}Q${n(x - r * 0.2)} ${n(y + r * 0.2)} ${n(x - r)} ${n(y)}Q${n(x - r * 0.2)} ${n(y - r * 0.2)} ${n(x)} ${n(y - r)}Z`, fill, 3)

/** Cheerful weather — rain clouds, snowflakes, lightning bolts, rainbows, snowmen… */
export const weather = defineStyle<WeatherOptions>({
  name: 'weather',
  scale: 0.84,
  colors: ['#dcecff', '#e6f4ff', '#efe2ff', '#fff1c9', '#d9f7d6', '#c9f0ea', '#ffe0e6', '#eef0ff'],
  defaults: { kind: 'random', sparkles: 'random' },
  variants: { kind: KINDS, sparkles: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const sparkles = pick('sparkles', [true, false, false])

    let [cx, cy, r] = [50, 54, 30]
    let [c1, c2] = ['#ffffff', '#cfe0f5']
    let body = ''
    let back = ''
    let surface = ''
    let front = ''
    let [ey, gap, my, s] = [54, 10, 63, 0.95]
    let fx = 50
    let spots: [number, number, number][] = [[14, 22, 6], [86, 26, 5], [84, 80, 4]]

    switch (kind) {
      case 'raincloud': {
        body = 'M26 72C12 72 8 56 20 50C18 34 36 26 46 36C52 20 78 22 78 42C92 42 94 72 76 72Z'
        ;[c1, c2] = rand.pick([['#ffffff', '#c9d8ee'], ['#eef1f8', '#a9b6cc']])
        back = drop(30, 84, 4.5, '#5aa9ff') + drop(50, 88, 4.5, '#5aa9ff') + drop(70, 84, 4.5, '#5aa9ff')
        ;[cx, cy, r] = [52, 52, 28]
        ;[ey, my] = [52, 61]
        fx = 52
        spots = [[12, 22, 6], [90, 22, 5]]
        break
      }
      case 'snowflake': {
        ;[cx, cy, r] = [50, 50, 17]
        ;[c1, c2] = ['#ffffff', '#bfe3ff']
        let arms = ''
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2
          const X = (d: number, o = 0) => n(50 + Math.cos(a) * d - Math.sin(a) * o)
          const Y = (d: number, o = 0) => n(50 + Math.sin(a) * d + Math.cos(a) * o)
          arms += `M${X(0)} ${Y(0)}L${X(40)} ${Y(40)}M${X(28)} ${Y(0)}L${X(36)} ${Y(-8)}M${X(28)} ${Y(0)}L${X(36)} ${Y(8)}`
        }
        back = S(arms, OL, 11) + S(arms, '#9fd4ff', 6) + S(arms, '#ffffff', 2, ' opacity=".7"')
        ;[ey, gap, my, s] = [48, 7, 55, 0.75]
        spots = [[14, 86, 5], [88, 84, 4]]
        break
      }
      case 'lightning': {
        body = 'M60 8L22 56H46L36 92L82 40H58L70 8Z'
        ;[c1, c2] = ['#fff38a', '#ffb81c']
        surface = P('M60 8L22 56H30L64 14Z', '#fff', ' opacity=".35"')
        ;[cx, cy, r] = [52, 46, 24]
        ;[ey, gap, my, s] = [44, 8, 52, 0.8]
        fx = 52
        spots = [[16, 24, 6], [84, 74, 5]]
        break
      }
      case 'rainbow': {
        const bands = ['#ff5d6c', '#ff9f43', '#ffd93d', '#5fd068', '#4fa3ff', '#9b6bff']
        const arc = (rr: number) => `M${50 - rr} 70A${rr} ${rr} 0 0 1 ${50 + rr} 70`
        back = S(arc(26.2), OL, 33, ' stroke-linecap="butt"') + bands.map((b, i) => S(arc(40 - i * 4.6 - 2.3), b, 4.8, ' stroke-linecap="butt"')).join('')
        body = 'M30 84C18 84 16 70 26 66C26 54 40 50 48 58C56 48 74 52 74 64C86 64 86 84 74 84Z'
        ;[c1, c2] = ['#ffffff', '#d6e2f3']
        ;[cx, cy, r] = [52, 70, 20]
        ;[ey, gap, my, s] = [70, 8, 77, 0.8]
        fx = 52
        spots = [[14, 24, 6], [86, 22, 5]]
        break
      }
      case 'umbrella': {
        body = 'M10 56C10 30 30 14 50 14C70 14 90 30 90 56C84 50 76 50 70 56C64 50 56 50 50 56C44 50 36 50 30 56C24 50 16 50 10 56Z'
        ;[c1, c2] = rand.pick([['#ff8fa3', '#e63950'], ['#8fd0ff', '#2f86e0'], ['#c9a2ff', '#7b3fc4']])
        back = L('M50 54V82Q50 90 42 90Q36 90 36 84', '#8a5a3b', 4) + L('M50 14V8', '#8a5a3b', 4)
        surface = S('M30 56Q34 30 50 14Q66 30 70 56', 'rgba(0,0,0,.18)', 2.2)
        ;[cx, cy, r] = [50, 36, 26]
        ;[ey, my] = [36, 45]
        spots = [[14, 80, 5], [88, 76, 4]]
        break
      }
      case 'tornado': {
        body = 'M8 22C8 12 92 12 92 22C92 30 82 34 76 40C72 50 64 58 58 66C54 74 58 84 52 92C44 86 46 76 42 68C34 60 26 50 22 40C14 34 8 30 8 22Z'
        ;[c1, c2] = ['#e9eef6', '#9aa8bd']
        surface = [S('M10 26Q50 36 90 26', '#7d8ba3', 2.4, ' opacity=".55"'), S('M20 40Q50 50 78 40', '#7d8ba3', 2.4, ' opacity=".55"'), S('M34 58Q50 64 64 56', '#7d8ba3', 2.2, ' opacity=".55"'), S('M44 74Q52 78 58 72', '#7d8ba3', 2, ' opacity=".55"')].join('')
        ;[cx, cy, r] = [50, 32, 26]
        ;[ey, gap, my, s] = [32, 9, 41, 0.85]
        spots = [[16, 78, 5], [84, 66, 5]]
        break
      }
      case 'snowman': {
        back = O(ell(50, 72, 25, 21), 'url(#' + id + '-g)') + C(50, 64, 2.4, OL) + C(50, 74, 2.4, OL) + C(50, 84, 2.4, OL)
        body = ell(50, 40, 19, 18)
        ;[c1, c2] = ['#ffffff', '#cfe3f5']
        front =
          O('M30 24H70V28H30Z', '#2b2d42', 4) + O('M37 26V8H63V26Z', '#2b2d42', 4) + P('M37 20H63V24H37Z', '#e63946') +
          O('M33 56Q50 64 67 56L67 60Q50 68 33 60Z', '#ff5d6c', 4) + O('M58 60L66 76L72 72L64 60Z', '#ff5d6c', 3.5)
        ;[cx, cy, r] = [50, 40, 18]
        ;[ey, gap, my, s] = [39, 7.5, 47, 0.75]
        spots = [[14, 30, 6], [86, 40, 5]]
        break
      }
      case 'droplet': {
        body = 'M50 8C56 22 80 42 80 64C80 80 66 90 50 90C34 90 20 80 20 64C20 42 44 22 50 8Z'
        ;[c1, c2] = rand.pick([['#a8dcff', '#2f8fe8'], ['#9ff0e6', '#18b3a4']])
        ;[cx, cy, r] = [50, 62, 28]
        ;[ey, my] = [60, 69]
        spots = [[18, 24, 6], [82, 30, 5]]
        break
      }
    }
    if (!body) body = ell(cx, cy, r, r)
    if (sparkles) back = spots.map(([x, y, rr]) => sparkle(x, y, rr)).join('') + back

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
