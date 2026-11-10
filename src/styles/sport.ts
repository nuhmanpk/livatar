import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['soccer', 'basketball', 'tennis', 'baseball', 'football', 'bowling', 'trophy', 'volleyball'] as const
type Kind = (typeof KINDS)[number]

export interface SportOptions {
  kind?: Kind | 'random'
  /** Little speed lines whooshing behind it. */
  motion?: boolean | 'random'
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

/** Sporty gear — soccer balls, basketballs, bowling pins, trophies… */
export const sport = defineStyle<SportOptions>({
  name: 'sport',
  scale: 0.84,
  colors: ['#d9f7d6', '#dcecff', '#fff1c9', '#ffe6cc', '#ffe0e6', '#c9f0ea', '#efe2ff', '#eef0ff'],
  defaults: { kind: 'random', motion: 'random' },
  variants: { kind: KINDS, motion: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const motion = pick('motion', [true, false, false])

    let [cx, cy, r] = [52, 52, 34]
    let [c1, c2] = ['#ffffff', '#d4dbe6']
    let body = ''
    let back = ''
    let surface = ''
    let front = ''
    let [ey, gap, my, s] = [52, 10, 61, 0.95]
    let fx = 52
    let lines: number[] = [36, 52, 68]

    switch (kind) {
      case 'soccer': {
        const pent = (x: number, y: number, rr: number, rot: number) => {
          let d = ''
          for (let i = 0; i < 5; i++) {
            const a = ((i * 72 + rot) * Math.PI) / 180
            d += `${i ? 'L' : 'M'}${n(x + Math.cos(a) * rr)} ${n(y + Math.sin(a) * rr)}`
          }
          return P(d + 'Z', '#2b2d42', ` stroke="#2b2d42" stroke-width="2" stroke-linejoin="round"`)
        }
        surface = pent(52, 22, 8, -90) + pent(22, 44, 8, 0) + pent(82, 44, 8, 180) + pent(32, 80, 8, 30) + pent(72, 80, 8, 150) +
          S('M52 30L52 22M28 48L22 44M76 48L82 44M36 74L32 80M68 74L72 80', '#2b2d42', 2)
        break
      }
      case 'basketball': {
        ;[c1, c2] = ['#ffb36b', '#f0731a']
        surface = S('M52 18V86M18 52H86M28 26Q44 52 28 78M76 26Q60 52 76 78', '#5a2a0c', 2.6)
        ;[ey, gap, my] = [46, 11, 58]
        break
      }
      case 'tennis': {
        ;[c1, c2] = ['#f2ff7a', '#b5d61c']
        surface = S('M24 26Q42 52 24 78M80 26Q62 52 80 78', '#ffffff', 4.5)
        break
      }
      case 'baseball': {
        surface = S('M28 24Q42 52 28 80M76 24Q62 52 76 80', '#e63946', 2.2)
        let st = ''
        for (let i = 0; i < 6; i++) {
          const t = 0.12 + i * 0.15
          const y = 24 + 56 * t
          const xl = 28 + 2 * (1 - t) * t * 14 * 2
          st += `M${n(xl - 3)} ${n(y - 2)}L${n(xl + 3)} ${n(y + 1)}M${n(104 - xl - 3)} ${n(y + 1)}L${n(104 - xl + 3)} ${n(y - 2)}`
        }
        surface += S(st, '#e63946', 1.8)
        break
      }
      case 'football': {
        body = 'M8 54C18 28 86 28 96 54C86 80 18 80 8 54Z'
        ;[c1, c2] = ['#c8845a', '#8a4a26']
        surface = S('M22 38Q22 54 22 70M82 38Q82 54 82 70', '#ffffff', 2.8) + S('M38 40H66', '#ffffff', 3) + S('M42 36V44M48 36V44M54 36V44M60 36V44', '#ffffff', 2.4)
        ;[cx, cy, r] = [52, 54, 30]
        ;[ey, gap, my, s] = [56, 9, 64, 0.85]
        lines = [44, 54, 64]
        break
      }
      case 'bowling': {
        body = 'M50 8C58 8 61 16 59 26C57 32 55 35 57 40C65 50 71 62 69 76C67 88 58 92 50 92C42 92 33 88 31 76C29 62 35 50 43 40C45 35 43 32 41 26C39 16 42 8 50 8Z'
        surface = P('M30 28H70V32H30ZM30 35H70V38H30Z', '#e63946')
        ;[cx, cy, r] = [50, 66, 22]
        ;[ey, gap, my, s] = [62, 8, 71, 0.85]
        fx = 50
        lines = [48, 62, 76]
        break
      }
      case 'trophy': {
        body = 'M26 14H74V40C74 56 63 64 50 64C37 64 26 56 26 40Z'
        ;[c1, c2] = ['#ffe37a', '#f0a81a']
        back = S('M28 22H18Q12 22 14 32Q16 44 30 48M72 22H82Q88 22 86 32Q84 44 70 48', OL, 10) + S('M28 22H18Q12 22 14 32Q16 44 30 48M72 22H82Q88 22 86 32Q84 44 70 48', '#f5b82a', 5)
        front = O('M44 62H56V76H44Z', '#f0a81a', 4.5) + O('M30 76H70V90H30Z', '#8a5a3b', 4.5) + P('M40 81H60V85H40Z', '#ffe37a')
        ;[cx, cy, r] = [50, 38, 24]
        ;[ey, gap, my, s] = [34, 9, 43, 0.85]
        fx = 50
        lines = [24, 38, 52]
        break
      }
      case 'volleyball': {
        surface = P('M52 52C40 40 38 26 46 18C30 20 20 30 18 42C28 40 42 44 52 52Z', '#ffd93d') +
          P('M52 52C68 50 80 58 82 70C88 56 86 42 80 34C76 44 64 52 52 52Z', '#4fa3ff') +
          P('M52 52C48 66 38 76 26 76C38 86 54 88 66 84C58 78 52 66 52 52Z', '#ffd93d') +
          S('M52 52C40 40 38 26 46 18M52 52C68 50 80 58 82 70M52 52C48 66 38 76 26 76M18 42C28 40 42 44 52 52M80 34C76 44 64 52 52 52M66 84C58 78 52 66 52 52', OL, 2)
        break
      }
    }
    if (!body) body = ell(cx, cy, r, r)
    if (motion) back = S(lines.map((y, i) => `M${4 + (i % 2) * 3} ${y}H${16 + (i % 2) * 3}`).join(''), OL, 3.5, ' opacity=".55"') + back

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
