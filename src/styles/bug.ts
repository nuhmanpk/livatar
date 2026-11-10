import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['bee', 'ladybug', 'butterfly', 'snail', 'caterpillar', 'ant', 'spider', 'firefly'] as const
type Kind = (typeof KINDS)[number]

export interface BugOptions {
  kind?: Kind | 'random'
  /** Little flower at the bug's feet. */
  flower?: boolean | 'random'
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
const L = (d: string, fill: string, w: number) => S(d, OL, w + 5) + S(d, fill, w)
const antenna = (x: number, y: number, x2: number, y2: number, tip = '#1f2a44') =>
  S(`M${x} ${y}Q${n((x + x2) / 2)} ${n(y2 + 4)} ${x2} ${y2}`, OL, 3) + O(ell(x2, y2, 3.2, 3.2), tip, 3)
const flowerAt = (x: number, y: number) => {
  let p = ''
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    p += O(ell(x + Math.cos(a) * 4.5, y + Math.sin(a) * 4.5, 3.6, 3.6), '#fff', 3)
  }
  return p + C(x, y, 3, '#ffc94d')
}

/** Cute little critters — bees, ladybugs, butterflies, snails, spiders… */
export const bug = defineStyle<BugOptions>({
  name: 'bug',
  scale: 0.84,
  colors: ['#d9f7d6', '#fff1c9', '#ffe0e6', '#dcecff', '#efe2ff', '#c9f0ea', '#ffe6cc', '#fbe7ff'],
  defaults: { kind: 'random', flower: 'random' },
  variants: { kind: KINDS, flower: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const flower = pick('flower', [true, false, false])

    let [cx, cy, r] = [50, 56, 28]
    let [c1, c2] = ['#ffe27a', '#f2b11f']
    let body = ''
    let back = ''
    let surface = ''
    let front = ''
    let [ey, gap, my, s] = [54, 10, 63, 0.95]
    let fx = 50
    let fl: [number, number] = [84, 84]
    let shine = true

    switch (kind) {
      case 'bee': {
        back =
          `<g data-lv-tilt="10">${O(ell(30, 30, 13, 9), '#eaf6ff', 4.5)}${O(ell(70, 30, 13, 9), '#eaf6ff', 4.5)}</g>` +
          antenna(42, 32, 36, 16) + antenna(58, 32, 64, 16) +
          O('M50 86L46 94L54 94Z', OL, 3)
        body = ell(50, 58, 30, 28)
        surface = P('M10 66H90V76H10Z', '#2b2440') + P('M10 82H90V92H10Z', '#2b2440')
        ;[cx, cy, r] = [50, 58, 29]
        ;[ey, my] = [50, 58]
        break
      }
      case 'ladybug': {
        ;[c1, c2] = ['#ff7a7a', '#d9232f']
        back = O(ell(50, 29, 20, 16), '#2b2440') + antenna(44, 22, 36, 10, '#2b2440') + antenna(56, 22, 64, 10, '#2b2440')
        body = ell(50, 60, 32, 30)
        surface =
          S('M50 30V92', '#1f1a2e', 2.6) +
          [[30, 52], [70, 52], [34, 76], [66, 76], [50, 88]].map(([x, y]) => C(x, y, 5, '#2b2440')).join('')
        ;[cx, cy, r] = [50, 60, 31]
        // face on the black head
        ;[ey, gap, my, s] = [27, 7.5, 35, 0.78]
        shine = false
        break
      }
      case 'butterfly': {
        const [w1, w2] = rand.pick([['#ffb0d6', '#b07aff'], ['#9fe0ff', '#ffd06b'], ['#ffc56b', '#ff7a8a']])
        back =
          `<g data-lv-tilt="10">` +
          O('M48 50C36 20 10 14 10 34C10 46 26 52 48 54Z', w1, 5) + O('M52 50C64 20 90 14 90 34C90 46 74 52 52 54Z', w1, 5) +
          O('M48 56C30 56 16 66 22 80C28 90 42 80 48 62Z', w2, 5) + O('M52 56C70 56 84 66 78 80C72 90 58 80 52 62Z', w2, 5) +
          C(26, 34, 5, '#fff', ' opacity=".6"') + C(74, 34, 5, '#fff', ' opacity=".6"') +
          `</g>` + antenna(46, 30, 38, 12) + antenna(54, 30, 62, 12)
        ;[c1, c2] = ['#8a7aa8', '#4a3d66']
        body = 'M50 26C58 26 60 34 58 44C58 60 56 82 50 86C44 82 42 60 42 44C40 34 42 26 50 26Z'
        ;[cx, cy, r] = [50, 40, 14]
        ;[ey, gap, my, s] = [38, 4.6, 44, 0.55]
        shine = false
        break
      }
      case 'snail': {
        ;[c1, c2] = ['#d8f0a0', '#9ac94a']
        back =
          antenna(22, 46, 14, 22, '#d8f0a0') + antenna(30, 46, 32, 20, '#d8f0a0') +
          O('M12 82C10 64 16 46 28 46C38 46 40 60 40 72L90 72Q94 82 86 84L18 86Q12 86 12 82Z', '#c9e89a')
        body = ell(62, 52, 26, 25)
        ;[c1, c2] = rand.pick([['#ffc98a', '#d9752f'], ['#ffb0c8', '#d95a8a']])
        surface = S('M62 52m0 -3a3 3 0 1 1 -3 3a7 7 0 1 1 7 7a12 12 0 1 1 -12 -12a17 17 0 1 1 17 17', '#8a3f1a', 2.6, ' opacity=".55"')
        ;[cx, cy, r] = [62, 52, 25]
        fx = 27
        ;[ey, gap, my, s] = [60, 5.5, 67, 0.62]
        fl = [82, 30]
        break
      }
      case 'caterpillar': {
        ;[c1, c2] = rand.pick([['#b6ee7a', '#5cb83a'], ['#ffd06b', '#f29a1f']])
        const g = `<defs><radialGradient id="${id}-s" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>`
        back = g + [[18, 72, 10], [32, 66, 11], [47, 70, 11]].map(([x, y, rr]) =>
          O(ell(x, y, rr, rr), `url(#${id}-s)`) + L(`M${x} ${y + rr}L${x} ${y + rr + 5}`, OL, 0.5)).join('') +
          antenna(60, 34, 56, 16, '#ff7a93') + antenna(74, 34, 80, 16, '#ff7a93')
        body = ell(67, 52, 20, 20)
        ;[cx, cy, r] = [67, 52, 20]
        fx = 67
        ;[ey, gap, my, s] = [50, 7.5, 58, 0.8]
        fl = [84, 84]
        break
      }
      case 'ant': {
        ;[c1, c2] = rand.pick([['#c97a5a', '#7a3a24'], ['#6a6a8a', '#33334d']])
        const legs = [-1, 1].map((m) => L(`M50 68L${50 + m * 22} 62L${50 + m * 28} 74`, '#5a3a2a', 2.5) + L(`M50 72L${50 + m * 20} 82L${50 + m * 24} 92`, '#5a3a2a', 2.5)).join('')
        const g = `<defs><radialGradient id="${id}-s" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>`
        back = g + legs + O(ell(50, 76, 13, 13), `url(#${id}-s)`) + O(ell(50, 62, 7, 6), `url(#${id}-s)`) +
          antenna(40, 26, 30, 10) + antenna(60, 26, 70, 10)
        body = ell(50, 42, 22, 20)
        ;[cx, cy, r] = [50, 42, 21]
        ;[ey, gap, my, s] = [40, 8.5, 49, 0.85]
        fl = [86, 86]
        break
      }
      case 'spider': {
        ;[c1, c2] = rand.pick([['#8a7aa8', '#3d3357'], ['#7a8aa8', '#2b3a57']])
        back = S('M50 0V32', '#fff', 1.5, ' opacity=".8"')
        for (const m of [-1, 1])
          for (let i = 0; i < 4; i++) {
            const y = 48 + i * 8
            back += L(`M50 ${y}Q${50 + m * 30} ${y - 18 + i * 4} ${50 + m * 40} ${y + 10 + i * 4}`, c2, 2.6)
          }
        body = ell(50, 58, 25, 24)
        surface = C(40, 76, 2, '#fff', ' opacity=".2"')
        ;[cx, cy, r] = [50, 58, 24]
        ;[ey, gap, my, s] = [54, 9, 63, 0.95]
        fl = [86, 88]
        break
      }
      case 'firefly': {
        ;[c1, c2] = ['#8aa0d6', '#4a5a99']
        const g = `<defs><radialGradient id="${id}-l" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff9b0"/><stop offset=".55" stop-color="#ffe94d" stop-opacity=".7"/><stop offset="1" stop-color="#ffe94d" stop-opacity="0"/></radialGradient></defs>`
        back = g + C(50, 76, 24, `url(#${id}-l)`) + O(ell(50, 74, 15, 14), '#fff36b') +
          `<g data-lv-tilt="10"><g transform="rotate(-25 28 40)">${O(ell(28, 40, 14, 9), '#eaf6ff', 4.5)}</g><g transform="rotate(25 72 40)">${O(ell(72, 40, 14, 9), '#eaf6ff', 4.5)}</g></g>` +
          antenna(42, 30, 34, 14) + antenna(58, 30, 66, 14)
        body = ell(50, 48, 22, 21)
        ;[cx, cy, r] = [50, 48, 22]
        ;[ey, gap, my, s] = [46, 8.5, 55, 0.85]
        fl = [86, 86]
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
    // dark-headed bugs get white eyes so the face still reads
    const dark = kind === 'ladybug' || kind === 'butterfly' || kind === 'spider' || kind === 'ant'
    const ink = dark ? '#ffffff' : INK
    const darkEye = (x: number, y: number) => `<g data-lv-depth=".45">${E(x, y, 3.4 * s, 3.9 * s, '#fff')}${E(x, y + 0.6 * s, 2 * s, 2.5 * s, INK)}${C(x - 0.7 * s, y - 0.4 * s, 0.8 * s, '#fff')}</g>`
    const F: FaceSpec = { x: fx, ey, gap, my, ink, s, eye: dark ? darkEye : eye, extra: [fx + gap + 8, ey - 13] }
    const eyes =
      mood === 'neutral'
        ? `<g data-lv-eye="">${dark ? darkEye(fx - gap, ey) : neutralEye(fx - gap, ey)}</g><g data-lv-eye="">${dark ? darkEye(fx + gap, ey) : neutralEye(fx + gap, ey)}</g>`
        : faceEyes(F, mood)
    const mouth =
      mood === 'neutral'
        ? rand.bool(0.5) || dark
          ? S(`M${n(fx - 4.5 * s)} ${my}Q${fx} ${n(my + 4.5 * s)} ${n(fx + 4.5 * s)} ${my}`, ink, 2.1 * s)
          : P(`M${n(fx - 5 * s)} ${my}Q${fx} ${n(my + 9 * s)} ${n(fx + 5 * s)} ${my}Z`, INK, ` stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"`) + E(fx, my + 4 * s, 2.6 * s, 1.5 * s, '#ff7a93')
        : faceMouth(F, mood)
    const bo = mood === 'happy' ? '.3' : '.45'
    const blush = E(fx - gap - 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ` opacity="${bo}"`) + E(fx + gap + 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ` opacity="${bo}"`)

    return (
      `<defs><radialGradient id="${id}-g" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>` +
      `<clipPath id="${id}-p"><path d="${body}"/></clipPath></defs>` +
      (flower ? `<g data-lv-depth=".1">${flowerAt(fl[0], fl[1])}</g>` : '') +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".3" data-lv-tilt="4">` +
      back +
      `<path d="${body}" fill="${OL}" stroke="${OL}" stroke-width="5.5" stroke-linejoin="round"/>` +
      `<path d="${body}" fill="url(#${id}-g)"/>` +
      `<g clip-path="url(#${id}-p)">${surface}${C(cx + r * 0.35, cy + r * 0.45, r * 0.9, 'rgba(0,0,0,.08)')}</g>` +
      (shine ? E(cx - r * 0.42, cy - r * 0.5, r * 0.22, r * 0.11, '#fff', -35, ' opacity=".6"') : '') +
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
