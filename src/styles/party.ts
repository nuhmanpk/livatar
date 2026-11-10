import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['balloon', 'gift', 'cake', 'partyhat', 'popper', 'candle', 'pinata', 'disco'] as const
type Kind = (typeof KINDS)[number]

export interface PartyOptions {
  kind?: Kind | 'random'
  /** A sprinkle of confetti around the object. */
  confetti?: boolean | 'random'
}

const INK = '#1f1a2e'
const OL = '#1f2a44'
const BRIGHT = ['#ff5c8a', '#ffd23f', '#3ec1ff', '#7bdc6a', '#b88cff', '#ff9f43']

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
const flame = (x: number, y: number, k = 1) =>
  O(`M${x} ${n(y - 12 * k)}C${n(x + 6 * k)} ${n(y - 4 * k)} ${n(x + 8 * k)} ${n(y + 1 * k)} ${n(x + 5 * k)} ${n(y + 5 * k)}Q${x} ${n(y + 9 * k)} ${n(x - 5 * k)} ${n(y + 5 * k)}C${n(x - 8 * k)} ${n(y + 1 * k)} ${n(x - 6 * k)} ${n(y - 4 * k)} ${x} ${n(y - 12 * k)}Z`, '#ffa630', 4) +
  E(x, y + 2 * k, 2.6 * k, 4 * k, '#ffe66d')
const star = (cx: number, cy: number, ro: number, ri: number) => {
  let d = ''
  for (let i = 0; i < 10; i++) {
    const a = ((-90 + i * 36) * Math.PI) / 180
    const r = i % 2 ? ri : ro
    d += `${i ? 'L' : 'M'}${n(cx + Math.cos(a) * r)} ${n(cy + Math.sin(a) * r)}`
  }
  return d + 'Z'
}

/** Party things — balloons, gifts, cakes, party hats, piñatas and disco balls. */
export const party = defineStyle<PartyOptions>({
  name: 'party',
  scale: 0.84,
  colors: ['#ffe0ec', '#fff1c9', '#dcecff', '#efe2ff', '#d9f7d6', '#ffe6cc', '#c9f0ea', '#fbe7ff'],
  defaults: { kind: 'random', confetti: 'random' },
  variants: { kind: KINDS, confetti: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const confetti = pick('confetti', [true, false])

    let [cx, cy, r] = [50, 56, 30]
    let [c1, c2] = ['#ff8fb1', '#e63973']
    let body = ''
    let back = ''
    let surface = ''
    let front = ''
    let [ey, gap, my, s] = [54, 10, 63, 0.95]
    let fx = 50

    switch (kind) {
      case 'balloon': {
        body = 'M50 10C71 10 83 27 81 45C79 63 63 76 50 76C37 76 21 63 19 45C17 27 29 10 50 10Z'
        ;[c1, c2] = rand.pick([['#ff9aa8', '#e8344e'], ['#8fd3ff', '#2f8fe0'], ['#ffe27a', '#f2b31a'], ['#c9a2ff', '#7b3fc4']])
        back = S('M50 80Q42 86 50 91T50 98', OL, 2.2)
        front = O('M44 82L50 75L56 82Z', c2, 4)
        ;[cx, cy, r] = [50, 43, 31]
        ;[ey, my] = [41, 50]
        break
      }
      case 'gift': {
        body = rr(22, 46, 56, 42, 3)
        ;[c1, c2] = rand.pick([['#8fd3ff', '#3d8fe0'], ['#ff9aa8', '#e8344e'], ['#b6f09a', '#4fb33a'], ['#d2b4ff', '#8a52d6']])
        const rib = rand.pick(['#ffd23f', '#ff5c8a', '#ffffff'])
        back = O('M50 36C40 20 24 24 30 34C33 39 44 39 50 36Z', rib, 4.5) + O('M50 36C60 20 76 24 70 34C67 39 56 39 50 36Z', rib, 4.5)
        surface = P('M45 40H55V92H45Z', rib)
        front = O(rr(17, 34, 66, 14, 3), c1, 5) + P('M45 34H55V48H45Z', rib) + C(50, 36, 4.5, rib, ` stroke="${OL}" stroke-width="2.4"`)
        ;[cx, cy, r] = [50, 67, 24]
        ;[ey, gap, my, s] = [63, 11, 72, 0.9]
        break
      }
      case 'cake': {
        body = rr(18, 50, 64, 38, 6)
        ;[c1, c2] = rand.pick([['#ffd9a8', '#e8a35f'], ['#f3c1ff', '#c77ae6'], ['#c49070', '#8a5636']])
        const icing = rand.pick(['#ffffff', '#ffc2d6', '#fff2a8'])
        const xs = [84, 74, 64, 54, 44, 34, 24, 16]
        let d = 'M16 55Q16 45 26 45H74Q84 45 84 55V58'
        for (let i = 0; i < xs.length - 1; i++) d += `Q${(xs[i] + xs[i + 1]) / 2} ${i % 2 ? 72 : 64} ${xs[i + 1]} 58`
        d += 'Z'
        back = O(rr(45.5, 24, 9, 24, 2), '#7fd3ff', 4.5) + S('M46 30L54 34M46 38L54 42', '#ffffff', 2) + S('M50 24V20', OL, 2) + flame(50, 14, 0.85)
        front = O(d, icing, 5) + [[30, 50, 0], [42, 52, 1], [58, 50, 2], [70, 53, 3], [36, 56, 4], [64, 56, 5]].map(([x, y, i]) => `<rect x="${x - 2}" y="${y - 0.8}" width="4" height="1.8" rx=".9" fill="${BRIGHT[i]}" transform="rotate(${i * 50} ${x} ${y})"/>`).join('')
        surface = P('M10 82H90V96H10Z', 'rgba(0,0,0,.1)')
        ;[cx, cy, r] = [50, 70, 22]
        ;[ey, gap, my, s] = [74, 10, 81, 0.78]
        break
      }
      case 'partyhat': {
        body = 'M50 14L79 84Q50 93 21 84Z'
        ;[c1, c2] = rand.pick([['#8fd3ff', '#3d8fe0'], ['#ff9aa8', '#e8344e'], ['#c9a2ff', '#7b3fc4'], ['#b6f09a', '#4fb33a']])
        const band = rand.pick(['#ffd23f', '#ffffff', '#ff5c8a'])
        surface = [30, 50, 70, 90].map((y) => P(`M0 ${y}L100 ${y - 22}V${y - 14}L0 ${y + 8}Z`, band, ' opacity=".75"')).join('')
        front = C(50, 12, 8, OL) + C(50, 12, 5.6, band) + C(48, 10, 1.8, '#fff', ' opacity=".7"') + O('M20 84Q50 94 80 84L82 88Q50 99 18 88Z', band, 4.5)
        ;[cx, cy, r] = [50, 62, 20]
        ;[ey, gap, my, s] = [62, 8.5, 71, 0.82]
        break
      }
      case 'popper': {
        body = 'M29 44H71L65 88Q50 93 35 88Z'
        ;[c1, c2] = rand.pick([['#ffe27a', '#f2a51a'], ['#ff9aa8', '#e8344e'], ['#8fd3ff', '#3d8fe0']])
        let burst = ''
        const bits: [number, number, number][] = [[30, 24, 0], [42, 14, 1], [58, 12, 2], [70, 22, 3], [22, 34, 4], [80, 34, 5], [50, 22, 0], [36, 30, 2]]
        for (const [x, y, i] of bits) burst += `<rect x="${x - 3}" y="${y - 1.6}" width="6" height="3.2" rx="1" fill="${BRIGHT[i]}" stroke="${OL}" stroke-width="1.4" transform="rotate(${i * 37 - 40} ${x} ${y})"/>`
        back = `<g data-lv-float="">${S('M44 40Q36 30 40 20Q44 12 36 6', '#ff5c8a', 2.6) + S('M56 40Q64 30 60 20Q57 12 66 6', '#3ec1ff', 2.6) + burst}</g>`
        surface = [54, 70].map((y) => P(`M0 ${y}H100V${y + 6}H0Z`, '#fff', ' opacity=".55"')).join('')
        front = O(ell(50, 44, 21, 5.5), '#fff3c4', 4.5) + E(50, 44, 15, 3, OL, 0, ' opacity=".85"') + S('M50 91Q52 95 56 96', OL, 2.4)
        ;[cx, cy, r] = [50, 68, 20]
        ;[ey, gap, my, s] = [64, 9, 73, 0.85]
        break
      }
      case 'candle': {
        body = rr(34, 38, 32, 52, 6)
        ;[c1, c2] = rand.pick([['#ffb3c9', '#f06292'], ['#a8e0ff', '#3fa0e0'], ['#fff1a8', '#f2c01a'], ['#c8f2b0', '#5fbf4a']])
        back = S('M50 38V30', OL, 2.4) + `<g data-lv-tilt="6">${flame(50, 20, 1.05)}</g>`
        surface = P('M30 30H70V46Q66 52 63 46Q60 58 56 46Q52 50 48 46Q44 60 40 46Q37 51 34 46Z', '#fff', ' opacity=".7"')
        front = O(ell(50, 90, 26, 5), '#ffd166', 4.5)
        ;[cx, cy, r] = [50, 64, 16]
        ;[ey, gap, my, s] = [61, 8, 70, 0.8]
        break
      }
      case 'pinata': {
        body = star(50, 56, 42, 22)
        ;[c1, c2] = ['#ffffff', '#f2e6ff']
        let st = ''
        for (let i = 0; i < 12; i++) st += P(`M0 ${10 + i * 7.5}H100V${17.5 + i * 7.5}H0Z`, BRIGHT[i % BRIGHT.length])
        surface = st
        for (let i = 0; i < 12; i++) surface += S(`M0 ${17.5 + i * 7.5}H100`, '#ffffff', 1.4, ' opacity=".6" stroke-dasharray="2 2"')
        const tip = (a: number) => {
          const rad = ((-90 + a) * Math.PI) / 180
          const x = 50 + Math.cos(rad) * 42
          const y = 56 + Math.sin(rad) * 42
          return S(`M${n(x)} ${n(y)}q-3 6 0 10`, BRIGHT[(a / 72) % 6], 2.4) + S(`M${n(x)} ${n(y)}q3 6 1 11`, BRIGHT[(a / 72 + 2) % 6], 2.4)
        }
        front = `<g data-lv-float="">${tip(144) + tip(216)}</g>`
        ;[cx, cy, r] = [50, 56, 22]
        ;[ey, gap, my, s] = [54, 8, 62, 0.82]
        break
      }
      case 'disco': {
        ;[cx, cy, r] = [50, 54, 32]
        ;[c1, c2] = ['#f4f7ff', '#8a94b8']
        let tiles = ''
        for (let y = 24; y < 88; y += 7) tiles += S(`M14 ${y}H86`, '#5d6789', 1.1, ' opacity=".4"')
        for (let k = -3; k <= 3; k++) tiles += S(`M${50 + k * 9} 20Q${50 + k * 13} 54 ${50 + k * 9} 88`, '#5d6789', 1.1, ' opacity=".4"')
        for (let i = 0; i < 7; i++) {
          const x = 22 + Math.floor(rand.float(0, 8)) * 7
          const y = 26 + Math.floor(rand.float(0, 8)) * 7
          tiles += P(`M${x} ${y}h6v6h-6z`, rand.pick(['#ffffff', '#c5e8ff', '#ffd6f0', '#fff3b0']), ' opacity=".9"')
        }
        surface = tiles
        back = S('M50 22V4', OL, 2.4) + O(rr(43, 18, 14, 7, 2), '#c9d1df', 4)
        const spark = (x: number, y: number, k: number) => P(`M${x} ${y - 5 * k}L${x + 1.2 * k} ${y - 1.2 * k}L${x + 5 * k} ${y}L${x + 1.2 * k} ${y + 1.2 * k}L${x} ${y + 5 * k}L${x - 1.2 * k} ${y + 1.2 * k}L${x - 5 * k} ${y}L${x - 1.2 * k} ${y - 1.2 * k}Z`, '#ffffff')
        front = spark(30, 36, 1.1) + spark(72, 72, 0.8)
        ;[ey, my] = [52, 61]
        break
      }
    }
    if (!body) body = ell(cx, cy, r, r)

    let bits = ''
    if (confetti) {
      const spots: [number, number][] = [[10, 12], [90, 14], [8, 46], [92, 50], [12, 88], [88, 86], [28, 6], [74, 94]]
      for (const [x, y] of spots) {
        const jx = x + rand.float(-3, 3), jy = y + rand.float(-3, 3)
        bits += `<rect x="${n(jx - 2.6)}" y="${n(jy - 1.3)}" width="5.2" height="2.6" rx="1" fill="${rand.pick(BRIGHT)}" transform="rotate(${n(rand.float(0, 180))} ${n(jx)} ${n(jy)})"/>`
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
