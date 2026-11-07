import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['coffee', 'tea', 'juicebox', 'soda', 'milk', 'bottle', 'smoothie', 'cocoa'] as const
type Kind = (typeof KINDS)[number]
const HOT: readonly Kind[] = ['coffee', 'tea', 'cocoa']

export interface DrinkOptions {
  kind?: Kind | 'random'
  /** Rising steam wisps — only drawn on hot drinks (coffee, tea, cocoa). */
  steam?: boolean | 'random'
}

const INK = '#1f1a2e'
const OL = '#1f2a44'
const MUGS = [['#ffffff', '#d9e4f5'], ['#ffd6e0', '#f59ab4'], ['#cdeeff', '#7fbde8'], ['#fff1b8', '#f2c94c'], ['#d8f5c4', '#8fd17a']]

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
/** Chunky outlined shape: dark stroke behind, fill on top. */
const O = (d: string, fill: string, w = 5.5) => `<path d="${d}" fill="${OL}" stroke="${OL}" stroke-width="${w}" stroke-linejoin="round"/><path d="${d}" fill="${fill}"/>`
const OE = (cx: number, cy: number, rx: number, ry: number, fill: string, w = 5.5) =>
  E(cx, cy, rx, ry, OL, 0, ` stroke="${OL}" stroke-width="${w}"`) + E(cx, cy, rx, ry, fill)
/** Outlined tube (handles, straws). */
const T = (d: string, fill: string, w: number) => S(d, OL, w + 5) + S(d, fill, w)

/** Cozy drinks — coffee, tea, juice boxes, soda cans, smoothies… */
export const drink = defineStyle<DrinkOptions>({
  name: 'drink',
  scale: 0.84,
  colors: ['#ffe9d6', '#e3f2ff', '#ffe0ec', '#e6f7e0', '#efe6ff', '#fff4c7', '#d7f3f0', '#f6e1d3'],
  defaults: { kind: 'random', steam: 'random' },
  variants: { kind: KINDS, steam: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const steam = pick('steam', [true, true, false]) && HOT.includes(kind)

    let [cx, cy, r] = [50, 62, 28]
    let [c1, c2] = rand.pick(MUGS)
    let body = ''
    let back = ''
    let surface = ''
    let front = ''
    let rim = 38
    let [ey, gap, my, s] = [58, 10, 67, 0.95]

    switch (kind) {
      case 'coffee':
      case 'cocoa': {
        body = 'M20 38H80L77 80Q76 90 66 90H34Q24 90 23 80Z'
        if (kind === 'cocoa') [c1, c2] = rand.pick([['#ffd6e0', '#f08aa8'], ['#e4d7ff', '#a58be8'], ['#ffe2c4', '#f0a467']])
        back = T('M78 50C94 48 94 74 75 74', c2, 6)
        surface = `<rect x="10" y="80" width="80" height="12" fill="rgba(0,0,0,.08)"/>`
        front = OE(50, 38, 30, 6, c1, 5) + E(50, 38.8, 25.5, 4, kind === 'coffee' ? '#7a4a2a' : '#a0623a')
        if (kind === 'coffee') front += E(46, 38.6, 8, 1.6, '#c79a6a', 0, ' opacity=".8"')
        else
          front += [[40, 36, -12, '#fff'], [52, 35, 8, '#ffd1dc'], [61, 37, -6, '#fff']]
            .map(([x, y, rot, f]) => `<rect x="${n(+x - 4.5)}" y="${n(+y - 4)}" width="9" height="8" rx="2.5" fill="${f}" stroke="${OL}" stroke-width="2.2" transform="rotate(${rot} ${x} ${y})"/>`)
            .join('')
        ;[cx, cy, r] = [50, 64, 28]
        break
      }
      case 'tea': {
        body = 'M14 44H86Q86 76 64 86H36Q14 76 14 44Z'
        ;[c1, c2] = rand.pick([['#ffffff', '#cfe0f2'], ['#ffe3ee', '#f3a6c2'], ['#e6f7e0', '#a6d995']])
        back = OE(50, 87, 40, 6, c2, 5) + T('M82 54C96 52 94 70 78 70', c1, 5.5)
        surface = S('M20 76Q50 82 80 76', '#7fb6e6', 2.4, ' opacity=".55"') + [36, 64].map((x) => C(x, 72, 1.8, '#ff8fb1', ' opacity=".6"')).join('')
        front = OE(50, 44, 36, 6, c1, 5) + E(50, 44.8, 31, 4, '#d98a3a') + S('M34 44Q30 52 26 60', OL, 1.6) + `<rect x="20" y="59" width="10" height="11" rx="2" fill="#ffd166" stroke="${OL}" stroke-width="2.2" transform="rotate(-8 25 64)"/>`
        rim = 44
        ;[cx, cy, r] = [50, 64, 30]
        ;[ey, my] = [58, 68]
        break
      }
      case 'juicebox': {
        body = 'M24 28H76V86Q76 92 70 92H30Q24 92 24 86Z'
        ;[c1, c2] = rand.pick([['#ffd59e', '#ff9f43'], ['#c9f29b', '#6fcf4a'], ['#ffc2d6', '#ff6f9c']])
        back = T('M64 26L66 14L75 10', '#ff5d8f', 3.2) + O('M24 28L30 20H70L76 28Z', c2, 5)
        surface = `<rect x="10" y="76" width="90" height="20" fill="#fff" opacity=".55"/>` + C(64, 84, 4.5, '#ff7a3d') + P('M64 79.5Q67 75 71 76Q68 80 64 79.5Z', '#5cc85a')
        ;[cx, cy, r] = [50, 58, 28]
        ;[ey, my] = [52, 61]
        break
      }
      case 'soda': {
        body = 'M26 20Q26 12 34 12H66Q74 12 74 20V84Q74 92 66 92H34Q26 92 26 84Z'
        ;[c1, c2] = rand.pick([['#ff8a8a', '#e63946'], ['#8fd3ff', '#2f7de1'], ['#b7f0a0', '#3fb35a'], ['#d6b4ff', '#8a4fd1']])
        surface =
          `<rect x="10" y="8" width="80" height="12" fill="#dfe6f0"/><rect x="10" y="20" width="80" height="2" fill="#b5c0d0"/>` +
          `<rect x="10" y="84" width="80" height="12" fill="#dfe6f0"/>` +
          P('M20 74Q35 66 50 74T80 74V90H20Z', '#fff', ' opacity=".35"')
        front = `<rect x="44" y="9" width="12" height="5" rx="2.5" fill="#c9d2de" stroke="${OL}" stroke-width="2"/>`
        ;[cx, cy, r] = [50, 52, 26]
        ;[ey, gap, my, s] = [48, 9.5, 57, 0.92]
        break
      }
      case 'milk': {
        body = 'M24 42L34 22H66L76 42V86Q76 92 70 92H30Q24 92 24 86Z'
        ;[c1, c2] = ['#ffffff', '#dbe5f2']
        back = O('M34 12H66V23H34Z', '#ffffff', 5)
        surface = P('M10 42L34 22H66L90 42Z', 'rgba(60,90,140,.1)') + `<rect x="10" y="40" width="90" height="3" fill="${OL}" opacity=".15"/>` +
          P('M10 80Q30 74 50 80T90 80V96H10Z', rand.pick(['#7fbde8', '#f59ab4', '#a58be8']))
        ;[cx, cy, r] = [50, 62, 28]
        ;[ey, my] = [56, 65]
        break
      }
      case 'bottle': {
        body = 'M41 20H59V26C59 32 72 34 72 46V84Q72 92 64 92H36Q28 92 28 84V46C28 34 41 32 41 26Z'
        ;[c1, c2] = ['#e8f6ff', '#9fd2f5']
        back = O('M39 8H61V21H39Z', rand.pick(['#3a86ff', '#ff5d8f', '#3fb35a']), 5)
        surface = `<rect x="10" y="68" width="80" height="16" fill="#fff" opacity=".7"/>` + S('M28 80Q39 74 50 80T72 80', '#7fbde8', 2.4) + `<rect x="10" y="66" width="80" height="2" fill="#7fbde8" opacity=".5"/>`
        ;[cx, cy, r] = [50, 62, 24]
        ;[ey, gap, my, s] = [54, 9, 62, 0.9]
        break
      }
      case 'smoothie': {
        body = 'M24 40H76L70 88Q69 92 64 92H36Q31 92 30 88Z'
        ;[c1, c2] = rand.pick([['#ffc2d6', '#ff6f9c'], ['#ffe08a', '#ffad33'], ['#d9c2ff', '#9b6ef0'], ['#c9f29b', '#7fcf4a']])
        back = T('M56 36L63 11', rand.pick(['#3ec1d3', '#ff5d8f', '#ffd23f']), 5.5)
        surface = [[34, 80], [62, 52], [44, 86], [68, 76], [30, 56]].map(([x, y]) => C(x, y, 1.3, '#fff', ' opacity=".6"')).join('')
        front =
          `<path d="M20 40Q20 22 50 22Q80 22 80 40Z" fill="#fff" opacity=".45" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>` +
          `<rect x="18" y="37" width="64" height="7" rx="3.5" fill="#fff" stroke="${OL}" stroke-width="3.5"/>` +
          E(36, 30, 5, 2.4, '#fff', -25, ' opacity=".8"')
        ;[cx, cy, r] = [50, 66, 24]
        ;[ey, gap, my, s] = [62, 9.5, 71, 0.92]
        break
      }
    }

    let steamSvg = ''
    if (steam) {
      const wisp = (x: number, d: number) => {
        const p = `M${x} ${rim - 6}C${x - 5} ${rim - 12} ${x + 5} ${rim - 17} ${x} ${rim - 23 - d}`
        return S(p, OL, 5.5, ' opacity=".25"') + S(p, '#fff', 3)
      }
      steamSvg = `<g data-lv-float=""><g data-lv-depth=".2">${wisp(38, 0)}${wisp(50, 4)}${wisp(62, 0)}</g></g>`
    }

    const eyeK = rand.pick(['dot', 'sparkle'] as const)
    const eye = (x: number, y: number) => `<g data-lv-depth=".45">${E(x, y, 3 * s, 3.6 * s, INK)}${C(x - 1 * s, y - 1.3 * s, 1.15 * s, '#fff')}</g>`
    const neutralEye = (x: number, y: number) =>
      eyeK === 'sparkle'
        ? `<g data-lv-depth=".45">${E(x, y, 3.8 * s, 4.4 * s, INK)}${C(x - 1.3 * s, y - 1.6 * s, 1.5 * s, '#fff')}${C(x + 1.4 * s, y + 1.6 * s, 0.7 * s, '#fff')}</g>`
        : eye(x, y)
    const fx = 50
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

    const hand = (x: number, side: 1 | -1) =>
      `<g transform="rotate(${side * 12} ${n(x)} ${n(ey + 2)})">` +
      `<rect x="${n(x - 5.5)}" y="${n(ey + 6)}" width="11" height="40" rx="5.5" fill="${c2}" stroke="${OL}" stroke-width="2.4"/>` +
      `<rect x="${n(x - 8.5)}" y="${n(ey - 8)}" width="17" height="19" rx="8" fill="${c1}" stroke="${OL}" stroke-width="2.4"/>` +
      `</g>`

    return (
      `<defs><radialGradient id="${id}-g" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>` +
      `<clipPath id="${id}-p"><path d="${body}"/></clipPath></defs>` +
      steamSvg +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".3" data-lv-tilt="4">` +
      back +
      `<path d="${body}" fill="${OL}" stroke="${OL}" stroke-width="5.5" stroke-linejoin="round"/>` +
      `<path d="${body}" fill="url(#${id}-g)"/>` +
      `<g clip-path="url(#${id}-p)">${surface}${C(cx + r * 0.35, cy + r * 0.45, r * 0.9, 'rgba(0,0,0,.08)')}</g>` +
      E(cx - r * 0.55, cy - r * 0.35, r * 0.1, r * 0.22, '#fff', 10, ' opacity=".6"') +
      front +
      `<g data-lv-depth=".6">` +
      eyes +
      faceBrows(F, mood) +
      blush +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g>` +
      `<g data-lv-shy="" opacity="0">${hand(fx - gap + 1, -1)}${hand(fx + gap - 1, 1)}</g>` +
      `</g></g>`
    )
  },
})
