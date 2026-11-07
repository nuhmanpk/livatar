import { defineStyle, luma, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const HEADS = ['round', 'bulb', 'wide', 'jelly'] as const
const ANTENNAS = ['none', 'bobble', 'double', 'swirly'] as const

export interface AlienOptions {
  eyes?: 1 | 2 | 3 | 'random'
  antenna?: (typeof ANTENNAS)[number] | 'random'
  head?: (typeof HEADS)[number] | 'random'
  /** Glass space helmet bubble. */
  helmet?: boolean | 'random'
}

const INK = '#1f1a2e'
const OL = '#1f2a44'
const SKIN = ['#7ee081', '#5ad1a0', '#a78bfa', '#c084fc', '#4fd1c5', '#f9a8d4', '#7dd3fc', '#b4e05a']
const IRIS = ['#7f5af0', '#2ec4b6', '#ff6f91', '#ffb703', '#3a86ff']
const SUIT = ['#ececf6', '#ff8c61', '#3d4a7a', '#ffd23f', '#e4e4ee']

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`

/** Friendly aliens — one, two or three eyes, antennae and an optional glass helmet. */
export const alien = defineStyle<AlienOptions>({
  name: 'alien',
  colors: ['#2b2d6e', '#1f4e5f', '#3b1f5e', '#ffd6e8', '#c7f9cc', '#bde0fe', '#fff1a8', '#e0c3fc'],
  defaults: { eyes: 'random', antenna: 'random', head: 'random', helmet: 'random' },
  variants: { eyes: [1, 2, 3], antenna: ANTENNAS, head: HEADS, helmet: [true, false] },
  render({ rand, pick, id, mood, background }) {
    const count = pick('eyes', [1, 2, 2, 3])
    const antenna = pick('antenna', ANTENNAS)
    const headK = pick('head', HEADS)
    const helmet = pick('helmet', [true, false, false])
    const bl = luma(background)
    const start = rand.int(0, SKIN.length - 1)
    let skin = SKIN[start]
    for (let k = 0; k < SKIN.length && bl != null; k++) {
      const c = SKIN[(start + k) % SKIN.length]
      if (Math.abs((luma(c) ?? 0) - bl) > 0.15) {
        skin = c
        break
      }
    }
    const iris = rand.pick(IRIS)
    const suit = rand.pick(SUIT)
    const accent = rand.pick(['#ff6f91', '#ffd23f', '#3ec1d3', '#ff8c61', '#fff'])

    let out = ''
    const L = (svg: string) => (out += `<g stroke="${OL}" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round">${svg}</g>` + svg)
    const D = (svg: string) => (out += svg)
    const k = helmet ? 0.4 : 1

    let head = ''
    let top = 24
    let [ey, gap, my, s] = [49, 11, 63, 1]
    switch (headK) {
      case 'round':
        head = E(50, 51, 27, 26, skin)
        top = 25
        break
      case 'bulb':
        head = P('M50 17C73 17 81 33 79 46C77 62 63 78 50 78C37 78 23 62 21 46C19 33 27 17 50 17Z', skin)
        top = 17
        ;[ey, my] = [49, 63]
        break
      case 'wide':
        head = E(50, 55, 34, 22, skin)
        top = 33
        ;[ey, gap, my] = [52, 13, 64]
        break
      case 'jelly':
        head = P('M17 60C17 37 32 21 50 21C68 21 83 37 83 60Q77.5 66 72 60Q66.5 66 61 60Q55.5 66 50 60Q44.5 66 39 60Q33.5 66 28 60Q22.5 66 17 60Z', skin)
        top = 21
        ;[ey, my] = [43, 52]
        break
    }

    // antenna (behind the head)
    const at = top + 3
    const tip = (x: number, y: number) => C(x, y, 4, accent) + C(x - 1.2, y - 1.2, 1.2, '#fff', ' opacity=".8"')
    const stalk = (d: string) => `<path d="${d}" stroke="${OL}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${skin}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
    if (antenna === 'bobble') D(stalk(`M50 ${at}Q47 ${n(at - 9 * k)} 52 ${n(at - 15 * k)}`) + `<g data-lv-float="">${`<g stroke="${OL}" stroke-width="2.4">${tip(52, at - 17 * k)}</g>`}</g>`)
    if (antenna === 'double')
      D(stalk(`M42 ${at + 1}Q38 ${n(at - 8 * k)} 33 ${n(at - 12 * k)}M58 ${at + 1}Q62 ${n(at - 8 * k)} 67 ${n(at - 12 * k)}`) +
        `<g stroke="${OL}" stroke-width="2.4">${tip(32, at - 13 * k)}${tip(68, at - 13 * k)}</g>`)
    if (antenna === 'swirly') {
      const y = at - 15 * k
      D(stalk(`M50 ${at}Q53 ${n(at - 8 * k)} 50 ${n(y)}a4 4 0 1 1 5 4a2 2 0 1 1-2-3`))
    }
    if (headK === 'jelly') {
      let t = ''
      for (const x of [26, 38, 50, 62, 74]) t += `M${x} 60q-4 9 0 18t0 18`
      D(`<path d="${t}" stroke="${OL}" stroke-width="8.5" fill="none" stroke-linecap="round"/><path d="${t}" stroke="${skin}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`)
    } else {
      L(P('M17 108C17 86 32 77 50 77C68 77 83 86 83 108Z', suit))
      D(`<rect x="38" y="76" width="24" height="5" rx="2.5" fill="rgba(0,0,0,.15)"/>` + C(64, 90, 3.4, accent, ` stroke="${OL}" stroke-width="1.6"`))
    }
    L(head)
    D(`<defs><clipPath id="${id}-h">${head}</clipPath></defs><g clip-path="url(#${id}-h)">` +
      C(30, top + 14, 3, 'rgba(255,255,255,.25)') + C(72, top + 20, 2.2, 'rgba(255,255,255,.25)') +
      E(50, ey + 34, 34, 16, 'rgba(0,0,0,.1)') + `</g>`)
    D(E(36, top + 9, 6, 2.6, '#fff', -30, ' opacity=".5"'))

    // eyes
    const pupil = (x: number, y: number, r: number) => `<g data-lv-depth=".45">${C(x, y, r * 0.62, iris)}${C(x, y, r * 0.32, INK)}${C(x - r * 0.25, y - r * 0.28, r * 0.17, '#fff')}</g>`
    const ball = (x: number, y: number, r: number) => C(x, y, r, '#fff', ` stroke="${OL}" stroke-width="2"`) + pupil(x, y, r)
    const almond = (x: number, y: number, side: 1 | -1) =>
      `<g data-lv-depth=".45">${E(x, y, 7.6, 5.2, INK, side * 22)}${E(x - 2.2 * side, y - 1.6, 2.4, 1.5, '#fff', side * 22, ' opacity=".9"')}${C(x + 2 * side, y + 1.4, 0.8, '#fff')}</g>`
    const W = (svg: string) => `<g data-lv-eye="">${svg}</g>`
    const neutralEyes =
      count === 1
        ? W(ball(50, ey - 1, 9.5))
        : count === 3
          ? W(ball(50 - gap, ey + 1, 5.6)) + W(ball(50 + gap, ey + 1, 5.6)) + W(ball(50, ey - 10, 4.6))
          : W(almond(50 - gap, ey, -1)) + W(almond(50 + gap, ey, 1))
    const F: FaceSpec = { x: 50, ey, gap, my, ink: INK, s, eye: (x, y) => C(x, y, 4.6, '#fff') + pupil(x, y, 4.6) }
    const eyes = mood === 'neutral' ? neutralEyes : faceEyes(F, mood)
    const nm = rand.pick(['smile', 'o', 'grin'] as const)
    const mouth =
      mood !== 'neutral'
        ? faceMouth(F, mood)
        : nm === 'o'
          ? E(50, my + 2, 2.6, 3.2, INK)
          : nm === 'grin'
            ? P(`M43 ${my}Q50 ${my + 9} 57 ${my}Z`, INK, ` stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"`) + E(50, my + 4, 2.6, 1.5, '#ff7a93')
            : S(`M44 ${my}Q50 ${my + 5} 56 ${my}`, INK, 2.2)
    const blush = mood === 'happy' ? '' : E(50 - gap - 5, ey + 8, 3.6, 2, '#ff5c8a', 0, ' opacity=".35"') + E(50 + gap + 5, ey + 8, 3.6, 2, '#ff5c8a', 0, ' opacity=".35"')

    const glass = helmet
      ? `<circle cx="50" cy="49" r="40" fill="rgba(210,240,255,.16)" stroke="${OL}" stroke-width="2.6"/>` +
        `<circle cx="50" cy="49" r="38" fill="none" stroke="#dff6ff" stroke-width="1.6" opacity=".7"/>` +
        S('M20 40A31 31 0 0 1 40 17', '#fff', 3.4, ' opacity=".75"') + C(18, 49, 1.8, '#fff', ' opacity=".7"') +
        (headK === 'jelly' ? '' : `<rect x="20" y="82" width="60" height="9" rx="4.5" fill="#c9d3e6" stroke="${OL}" stroke-width="2.4"/>`)
      : ''

    const hand = (x: number, side: 1 | -1) =>
      `<g transform="rotate(${side * 12} ${n(x)} ${n(ey + 2)})">` +
      `<rect x="${n(x - 5.5)}" y="${n(ey + 6)}" width="11" height="50" rx="5.5" fill="${skin}" stroke="${OL}" stroke-width="2.4"/>` +
      [-5, 0, 5].map((dx) => `<rect x="${n(x + dx - 2.6)}" y="${n(ey - 12 + Math.abs(dx) * 0.5)}" width="5.2" height="14" rx="2.6" fill="${skin}" stroke="${OL}" stroke-width="2"/>`).join('') +
      `<rect x="${n(x - 8)}" y="${n(ey - 4)}" width="16" height="13" rx="6" fill="${skin}" stroke="${OL}" stroke-width="2.4"/>` +
      `</g>`

    return (
      `<g data-lv-body="">` +
      `<g data-lv-depth=".3" data-lv-tilt="4">` +
      out +
      `<g data-lv-depth=".65">` +
      eyes +
      faceBrows(F, mood) +
      blush +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g>` +
      glass +
      `<g data-lv-shy="" opacity="0">${hand(50 - gap + 1, -1)}${hand(50 + gap - 1, 1)}</g>` +
      `</g></g>`
    )
  },
})
