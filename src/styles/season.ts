import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['pumpkin', 'acorn', 'leaf', 'pinecone', 'chestnut', 'mitten', 'sandcastle', 'snowglobe'] as const
type Kind = (typeof KINDS)[number]

export interface SeasonOptions {
  kind?: Kind | 'random'
  /** Little falling leaves, snowflakes or sparkles around the object. */
  falling?: boolean | 'random'
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
const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`
/** Chunky outlined shape: dark stroke behind, fill on top. */
const O = (d: string, fill: string, w = 5.5) => `<path d="${d}" fill="${OL}" stroke="${OL}" stroke-width="${w}" stroke-linejoin="round"/><path d="${d}" fill="${fill}"/>`
const stem = (d: string, c = '#8a5a3b') => S(d, OL, 7) + S(d, c, 3)
const leafAt = (x: number, y: number, rot: number, sz = 1, fill = '#6fd36b') => {
  const d = `M${n(x)} ${n(y)}C${n(x + 4 * sz)} ${n(y - 9 * sz)} ${n(x + 14 * sz)} ${n(y - 11 * sz)} ${n(x + 20 * sz)} ${n(y - 8 * sz)}C${n(x + 16 * sz)} ${n(y + 1 * sz)} ${n(x + 7 * sz)} ${n(y + 4 * sz)} ${n(x)} ${n(y)}Z`
  return `<g transform="rotate(${n(rot)} ${n(x)} ${n(y)})">${O(d, fill, 4.5)}</g>`
}
const flake = (x: number, y: number, k: number, c = '#ffffff') =>
  S(`M${n(x)} ${n(y - 4 * k)}V${n(y + 4 * k)}M${n(x - 3.5 * k)} ${n(y - 2 * k)}L${n(x + 3.5 * k)} ${n(y + 2 * k)}M${n(x - 3.5 * k)} ${n(y + 2 * k)}L${n(x + 3.5 * k)} ${n(y - 2 * k)}`, c, 1.4 * k)

/** Seasonal friends — pumpkins, acorns, pinecones, mittens, sandcastles and snow globes. */
export const season = defineStyle<SeasonOptions>({
  name: 'season',
  scale: 0.84,
  colors: ['#ffe6cc', '#fff1c9', '#dcecff', '#e3f4ff', '#d9f7d6', '#ffe0e6', '#efe2ff', '#f3ead9'],
  defaults: { kind: 'random', falling: 'random' },
  variants: { kind: KINDS, falling: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const falling = pick('falling', [true, false])

    let [cx, cy, r] = [50, 56, 30]
    let [c1, c2] = ['#ffb35a', '#f2701d']
    let body = ''
    let back = ''
    let surface = ''
    let front = ''
    let [ey, gap, my, s] = [54, 10, 63, 0.95]
    let fx = 50
    let fall: 'leaf' | 'snow' | 'sun' = 'leaf'

    switch (kind) {
      case 'pumpkin': {
        body = ell(31, 62, 19, 25) + ell(69, 62, 19, 25) + ell(50, 61, 24, 28)
        ;[c1, c2] = rand.pick([['#ffbf66', '#f2701d'], ['#fff1d6', '#e8c9a0']])
        back = stem('M50 36Q49 26 55 18', '#6b8f2e') + leafAt(52, 28, -30, 0.8)
        surface = S('M36 38Q30 62 36 86M64 38Q70 62 64 86', 'rgba(0,0,0,.2)', 2.4)
        ;[cx, cy, r] = [50, 62, 30]
        ;[ey, gap, my] = [59, 11, 68]
        break
      }
      case 'acorn': {
        body = 'M27 48H73C73 70 63 86 50 94C37 86 27 70 27 48Z'
        ;[c1, c2] = ['#f0b47a', '#b8692e']
        const cap = 'M20 52Q20 28 50 26Q80 28 80 52Q50 60 20 52Z'
        let hatch = ''
        for (const [x, y] of [[34, 40], [44, 36], [56, 36], [66, 40], [28, 48], [39, 47], [50, 45], [61, 47], [72, 48]]) hatch += S(`M${x - 3} ${y - 2.5}L${x + 3} ${y + 2.5}M${x + 3} ${y - 2.5}L${x - 3} ${y + 2.5}`, '#6e4220', 1.5, ' opacity=".5"')
        back = stem('M50 28Q50 20 55 15', '#6e4220')
        front = O(cap, '#a06a3c') + hatch
        ;[cx, cy, r] = [50, 70, 20]
        ;[ey, gap, my, s] = [67, 9, 76, 0.85]
        break
      }
      case 'leaf': {
        body = 'M50 8C74 24 86 52 50 86C14 52 26 24 50 8Z'
        ;[c1, c2] = rand.pick([['#ffc36b', '#ee6a1f'], ['#ff9a7a', '#d8342a'], ['#ffe27a', '#e8a21a'], ['#b6f09a', '#4fae3a']])
        back = stem('M50 84Q49 92 44 97', '#8a5a3b')
        surface = S('M50 14V84M50 34L36 26M50 34L64 26M50 72L32 58M50 72L68 58', 'rgba(0,0,0,.18)', 2)
        ;[cx, cy, r] = [50, 46, 28]
        ;[ey, gap, my, s] = [46, 9.5, 55, 0.9]
        break
      }
      case 'pinecone': {
        body = 'M50 12C70 12 80 34 76 56C72 76 58 92 50 92C42 92 28 76 24 56C20 34 30 12 50 12Z'
        ;[c1, c2] = ['#d59a63', '#7d4a26']
        let sc = ''
        for (let row = 0; row < 8; row++) {
          const y = 22 + row * 9.5
          for (let k = -4; k <= 4; k++) {
            const x = 50 + k * 11 + (row % 2) * 5.5
            sc += S(`M${x - 5.5} ${y}Q${x} ${y + 7} ${x + 5.5} ${y}`, '#5a3216', 1.8, ' opacity=".5"')
          }
        }
        surface = sc
        back = leafAt(48, 14, -60, 0.7, '#4fae5a') + leafAt(52, 14, -120, 0.7, '#4fae5a')
        ;[cx, cy, r] = [50, 52, 28]
        ;[ey, gap, my, s] = [50, 9.5, 59, 0.9]
        fall = 'snow'
        break
      }
      case 'chestnut': {
        body = 'M50 16C62 26 84 36 84 60C84 80 68 88 50 88C32 88 16 80 16 60C16 36 38 26 50 16Z'
        ;[c1, c2] = ['#c8784a', '#6e3418']
        surface = E(50, 94, 42, 16, '#efd2a6') + S('M30 34Q40 30 44 26', '#fff', 2, ' opacity=".25"')
        front = O('M47 18L50 10L53 18Z', '#c9a27a', 3.5)
        ;[cx, cy, r] = [50, 56, 30]
        ;[ey, gap, my] = [54, 10.5, 63]
        break
      }
      case 'mitten': {
        body = 'M32 80V62Q20 60 17 48Q15 37 23 36Q30 36 32 44V30Q32 16 47 16H56Q71 16 71 31V80Z'
        ;[c1, c2] = rand.pick([['#ff8f8f', '#d8343e'], ['#8fc8ff', '#2f7fd0'], ['#a8e6a0', '#3f9e4a'], ['#d2b4ff', '#8a52d6']])
        let zig = 'M14 30'
        for (let x = 14; x < 86; x += 6) zig += `L${x + 3} 26L${x + 6} 30`
        surface = S(zig, '#fff', 2.4, ' opacity=".7"') + flake(24, 47, 1.2)
        let rib = ''
        for (let x = 33; x <= 70; x += 5) rib += S(`M${x} 79V91`, 'rgba(0,0,0,.12)', 1.8)
        front = O(rr(28, 76, 47, 17, 5), '#fbf6ee', 5) + rib
        ;[cx, cy, r] = [52, 50, 22]
        ;[ey, gap, my, s] = [47, 9, 57, 0.88]
        fx = 52
        fall = 'snow'
        break
      }
      case 'sandcastle': {
        body = 'M12 90V56H18V50H24V56H30V38H36V32H42V38H47V32H53V38H58V32H64V38H70V56H76V50H82V56H88V90Z'
        ;[c1, c2] = ['#ffe2a6', '#dca95a']
        const dots: string[] = []
        for (let i = 0; i < 14; i++) dots.push(C(rand.float(16, 84), rand.float(42, 88), 0.9, '#a57a36', ' opacity=".5"'))
        surface = dots.join('') + P('M42 90V80Q42 72 50 72Q58 72 58 80V90Z', '#a57a36', ' opacity=".55"')
        const flag = rand.pick(['#ff5c8a', '#3ec1ff', '#ffd23f'])
        back = S('M50 34V12', OL, 2.6) + O('M51 12L64 16L51 21Z', flag, 3.5)
        ;[cx, cy, r] = [50, 62, 26]
        ;[ey, gap, my, s] = [52, 10, 61, 0.9]
        fall = 'sun'
        break
      }
      case 'snowglobe': {
        ;[cx, cy, r] = [50, 44, 32]
        ;[c1, c2] = ['#f2fbff', '#9fd4f5']
        let sn = ''
        for (let i = 0; i < 12; i++) sn += C(rand.float(24, 76), rand.float(18, 64), rand.float(0.9, 1.7), '#fff')
        surface = sn + E(50, 80, 34, 12, '#ffffff') + O('M70 72L76 60L82 72Z', '#4fae5a', 2.5)
        front = O('M20 72Q50 80 80 72L86 92H14Z', rand.pick(['#c0743a', '#d8343e', '#6a5acd']), 5) + S('M24 84H76', '#ffd23f', 2.2, ' opacity=".8"')
        ;[ey, gap, my] = [42, 10, 51]
        fall = 'snow'
        break
      }
    }
    if (!body) body = ell(cx, cy, r, r)

    let bits = ''
    if (falling) {
      const spots: [number, number][] = [[10, 12], [90, 14], [8, 46], [92, 44], [12, 80], [90, 82], [30, 6], [72, 4]]
      for (const [x, y] of spots) {
        const jx = x + rand.float(-3, 3), jy = y + rand.float(-3, 3)
        bits +=
          fall === 'snow'
            ? flake(jx, jy, 0.9, '#8fb8e0')
            : fall === 'sun'
              ? C(jx, jy, 1.6, '#ffc94d')
              : E(jx, jy, 3.2, 1.7, rand.pick(['#f2701d', '#e8a21a', '#d8342a']), rand.float(0, 180))
      }
      bits = `<g data-lv-float="">${bits}</g>`
    }

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
