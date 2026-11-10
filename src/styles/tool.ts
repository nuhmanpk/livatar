import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['hammer', 'wrench', 'screwdriver', 'saw', 'drill', 'toolbox', 'roller', 'tape'] as const
type Kind = (typeof KINDS)[number]

export interface ToolOptions {
  kind?: Kind | 'random'
  /** 'classic' workshop colors or soft 'candy' pastels. */
  finish?: 'classic' | 'candy' | 'random'
}

const INK = '#1f1a2e'
const OL = '#1f2a44'
const STEEL: [string, string] = ['#eef2f8', '#8c97ad']
const WOOD = '#d9a066'
const CANDY: [string, string][] = [['#ffd1e0', '#f48fb1'], ['#d4ecff', '#7fb8ec'], ['#dcf7d2', '#8fd17c'], ['#ece0ff', '#b597ea'], ['#fff1c2', '#f2cf5a']]

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
const ell = (cx: number, cy: number, rx: number, ry: number) => `M${n(cx - rx)} ${n(cy)}a${n(rx)} ${n(ry)} 0 1 0 ${n(2 * rx)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-2 * rx)} 0Z`
const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`
/** Chunky outlined shape: dark stroke behind, fill on top. */
const O = (d: string, fill: string, w = 5.5, extra = '') =>
  `<path d="${d}" fill="${OL}" stroke="${OL}" stroke-width="${w}" stroke-linejoin="round"${extra}/><path d="${d}" fill="${fill}"${extra}/>`

/** Handy tools — hammers, wrenches, saws, drills, paint rollers and tape measures. */
export const tool = defineStyle<ToolOptions>({
  name: 'tool',
  scale: 0.84,
  colors: ['#fff1c9', '#dcecff', '#ffe6cc', '#e6ebf5', '#d9f7d6', '#ffe0e6', '#efe2ff', '#c9f0ea'],
  defaults: { kind: 'random', finish: 'random' },
  variants: { kind: KINDS, finish: ['classic', 'candy'] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const finish = pick('finish', ['classic', 'classic', 'candy'])
    const candy = rand.pick(CANDY)
    const paint = (classic: [string, string][]): [string, string] => (finish === 'candy' ? candy : rand.pick(classic))
    const grip = finish === 'candy' ? candy[1] : '#ff7043'

    let [cx, cy, r] = [50, 56, 30]
    let [c1, c2] = STEEL
    let body = ''
    let back = ''
    let surface = ''
    let front = ''
    let [ey, gap, my, s] = [54, 10, 63, 0.95]
    let fx = 50

    switch (kind) {
      case 'hammer': {
        body = 'M13 20H62Q78 20 90 8Q95 32 87 42Q79 52 62 52H13Q8 52 8 47V25Q8 20 13 20Z'
        ;[c1, c2] = finish === 'candy' ? candy : STEEL
        back = O(rr(41, 48, 16, 46, 6), finish === 'candy' ? '#fff3d6' : WOOD) + O(rr(41, 70, 16, 24, 6), grip, 0.1)
        surface = P('M0 20H20V52H0Z', 'rgba(0,0,0,.1)')
        ;[cx, cy, r] = [44, 36, 18]
        ;[ey, gap, my, s] = [33, 10, 41, 0.8]
        fx = 44
        break
      }
      case 'wrench': {
        body = 'M35 8V19Q35 25 41 25H59Q65 25 65 19V8Q79 14 79 31Q79 46 61 52V84Q61 95 50 95Q39 95 39 84V52Q21 46 21 31Q21 14 35 8Z'
        ;[c1, c2] = paint([STEEL])
        front = C(50, 84, 5, OL) + C(50, 84, 2.6, '#eef2f8')
        surface = P('M0 58H100V100H0Z', 'rgba(0,0,0,.06)')
        ;[cx, cy, r] = [50, 38, 22]
        ;[ey, gap, my, s] = [35, 10, 43, 0.82]
        break
      }
      case 'screwdriver': {
        body = rr(31, 8, 38, 54, 13)
        ;[c1, c2] = paint([['#ff9a8a', '#e0402f'], ['#ffe27a', '#f2a51a'], ['#8fd3ff', '#2f8fe0']])
        back = O('M46 62H54V84L52 94H48L46 84Z', '#c9d1df', 5)
        surface = S('M40 14V56M60 14V56', '#ffffff', 3, ' opacity=".35"')
        front = O(rr(38, 60, 24, 7, 2), '#c9d1df', 4.5)
        ;[cx, cy, r] = [50, 34, 20]
        ;[ey, gap, my, s] = [31, 9, 40, 0.86]
        break
      }
      case 'saw': {
        let d = 'M8 48L66 30V72'
        for (let x = 66; x > 10; x -= 7) d += `L${x - 3.5} 78L${x - 7} 72`
        d += 'Z'
        body = d
        ;[c1, c2] = finish === 'candy' ? candy : STEEL
        const h = 'M60 26Q60 20 68 20H84Q94 20 94 30V72Q94 82 84 82H60ZM69 34Q69 31 72 31H82Q85 31 85 34V64Q85 67 82 67H72Q69 67 69 64Z'
        front = O(h, finish === 'candy' ? candy[1] : WOOD, 5.5, ' fill-rule="evenodd"') + C(64, 40, 1.8, OL) + C(64, 62, 1.8, OL)
        ;[cx, cy, r] = [34, 56, 22]
        ;[ey, gap, my, s] = [54, 8.5, 62, 0.82]
        fx = 34
        break
      }
      case 'drill': {
        body = 'M24 24H70Q84 24 84 40Q84 56 70 56H64L68 82H44L46 56H24Q20 56 20 52V28Q20 24 24 24Z'
        ;[c1, c2] = paint([['#ffd36b', '#f29a1a'], ['#8fd3ff', '#2f8fe0'], ['#ff9a8a', '#e0402f']])
        back = S('M4 40H14', OL, 6) + S('M4 40H14', '#c9d1df', 2.6) + O(rr(10, 32, 12, 16, 3), '#4a5270', 5)
        surface = P('M0 56H100V100H0Z', 'rgba(0,0,0,.1)') + S('M74 32V48M78 34V46', 'rgba(0,0,0,.25)', 1.8)
        front = O(rr(38, 80, 36, 13, 4), '#3a3f55', 5) + S('M46 58Q43 63 47 67', OL, 3.4)
        ;[cx, cy, r] = [50, 40, 18]
        ;[ey, gap, my, s] = [37, 9.5, 45, 0.8]
        fx = 50
        break
      }
      case 'toolbox': {
        body = rr(12, 40, 76, 50, 6)
        ;[c1, c2] = paint([['#ff8f8f', '#d8343e'], ['#8fc8ff', '#2f7fd0'], ['#ffd36b', '#f29a1a']])
        back = O('M33 42V25Q33 18 40 18H60Q67 18 67 25V42H59V27H41V42Z', '#4a5270', 5)
        surface = P('M0 50H100V53H0Z', 'rgba(0,0,0,.18)')
        front = O(rr(44, 46, 12, 9, 2), '#ffd23f', 4)
        ;[cx, cy, r] = [50, 68, 26]
        ;[ey, gap, my, s] = [66, 11, 75, 0.95]
        break
      }
      case 'roller': {
        body = rr(12, 14, 66, 34, 12)
        ;[c1, c2] = paint([['#ff9aa8', '#e8344e'], ['#8fd3ff', '#2f8fe0'], ['#b6f09a', '#4fb33a'], ['#ffe27a', '#f2b31a']])
        const frame = 'M78 31H86V60H50V68'
        back = S(frame, OL, 7) + S(frame, '#c9d1df', 3) + O(rr(42, 66, 16, 30, 7), grip, 5)
        surface = S('M18 22Q20 30 18 40', '#fff', 2.4, ' opacity=".35"')
        front = P(`M30 48Q30 56 33 56Q36 56 36 48Z`, c2, ` stroke="${OL}" stroke-width="2.2"`)
        ;[cx, cy, r] = [45, 31, 17]
        ;[ey, gap, my, s] = [28, 10, 36, 0.8]
        fx = 45
        break
      }
      case 'tape': {
        body = 'M24 18H66Q82 18 82 34V70Q82 84 68 84H30Q16 84 16 70V26Q16 18 24 18Z'
        ;[c1, c2] = paint([['#ffe27a', '#f2a51a'], ['#ff9a8a', '#e0402f']])
        let ticks = ''
        for (let x = 80; x < 96; x += 3) ticks += S(`M${x} 74V${x % 2 ? 77 : 79}`, OL, 1)
        back = O('M72 72H94V82H72Z', '#fff3b0', 4.5) + ticks + O('M93 70H97V84H93Z', '#c9d1df', 3.5)
        surface = C(49, 51, 27, 'rgba(255,255,255,.22)')
        front = O(rr(12, 36, 7, 16, 2), '#3a3f55', 3.5)
        ;[cx, cy, r] = [49, 51, 30]
        ;[ey, gap, my, s] = [47, 10.5, 57, 0.95]
        fx = 49
        break
      }
    }
    if (!body) body = ell(cx, cy, r, r)
    const bits = ''

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

    return (
      `<defs><radialGradient id="${id}-g" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>` +
      `<clipPath id="${id}-p"><path d="${body}"/></clipPath></defs>` +
      bits +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".3" data-lv-tilt="4">` +
      back +
      `<path d="${body}" fill="${OL}" stroke="${OL}" stroke-width="5.5" stroke-linejoin="round"/>` +
      `<path d="${body}" fill="url(#${id}-g)"/>` +
      `<g clip-path="url(#${id}-p)">${surface}${C(cx + r * 0.35, cy + r * 0.45, r * 0.9, 'rgba(0,0,0,.08)')}</g>` +
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
