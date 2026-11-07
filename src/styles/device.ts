import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['phone', 'laptop', 'watch', 'camera', 'headphones', 'tv', 'tablet', 'gamepad'] as const
type Kind = (typeof KINDS)[number]

export interface DeviceOptions {
  kind?: Kind | 'random'
  /** A glowing, switched-on screen (the face lives on it). */
  screen?: boolean | 'random'
}

const INK = '#1f1a2e'
const OL = '#1f2a44'

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
const RR = (x: number, y: number, w: number, h: number, r: number) =>
  `M${n(x + r)} ${n(y)}H${n(x + w - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + w)} ${n(y + r)}V${n(y + h - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + w - r)} ${n(y + h)}` +
  `H${n(x + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y + h - r)}V${n(y + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)}Z`
const piece = (d: string, fill: string, w = 5.5) =>
  `<path d="${d}" fill="${OL}" stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="${fill}"/>`
const circ = (cx: number, cy: number, r: number) => `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0Z`

/** Cute gadgets — phones, laptops, retro TVs, gamepads… */
export const device = defineStyle<DeviceOptions>({
  name: 'device',
  scale: 0.84,
  colors: ['#e8f0ff', '#fff1e0', '#e9fbf1', '#f3e8ff', '#ffe8ef', '#e0f4ff', '#fffbe0', '#eef0f6'],
  defaults: { kind: 'random', screen: 'random' },
  variants: { kind: KINDS, screen: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const screen = pick('screen', [true, true, false])

    const shell = rand.pick([
      ['#cfd6e6', '#7d89a8'],
      ['#ffc2d6', '#e8628f'],
      ['#b9e4ff', '#3d8fd9'],
      ['#d6c8ff', '#7d5ce0'],
      ['#c4f0d4', '#3fae73'],
    ])
    let [c1, c2] = shell
    let body = ''
    let back = ''
    let surface = ''
    let front = ''
    let scr = '' // the screen path (face sits on it)
    let after = '' // over the screen, under the face
    let [fx, ey, gap, my, s] = [50, 50, 10, 60, 0.95]
    let hl: [number, number, number, number] = [30, 30, 6, 3]

    switch (kind) {
      case 'phone':
        body = RR(26, 8, 48, 84, 11)
        scr = RR(31, 16, 38, 66, 6)
        after = P(RR(43, 18, 14, 4, 2), OL)
        front = E(50, 87, 6, 1.6, '#fff', 0, ' opacity=".5"')
        ;[fx, ey, gap, my, s] = [50, 46, 8.5, 56, 0.9]
        hl = [30, 12, 3, 1.4]
        break
      case 'laptop':
        body = RR(15, 16, 70, 50, 6)
        scr = RR(20, 21, 60, 40, 3)
        front = piece('M10 68H90L94 78C94.5 81 93 83 90 83H10C7 83 5.5 81 6 78Z', c1) + P(RR(42, 70, 16, 3, 1.5), c2, ' opacity=".6"') + C(50, 18.5, 0.9, OL)
        ;[fx, ey, gap, my, s] = [50, 39, 10, 49, 0.95]
        hl = [18, 18, 3, 1.2]
        break
      case 'watch': {
        back =
          piece(RR(36, 6, 28, 30, 6), c2) + piece(RR(36, 64, 28, 30, 6), c2) +
          S('M40 14H60M40 86H60', OL, 1.6, ' opacity=".35"')
        body = RR(24, 24, 52, 52, 16)
        scr = RR(30, 30, 40, 40, 11)
        front = piece(RR(77, 44, 6, 12, 3), c1, 3.5)
        ;[fx, ey, gap, my, s] = [50, 47, 8, 57, 0.85]
        hl = [32, 27, 4, 1.6]
        break
      }
      case 'camera':
        back = piece(RR(30, 22, 26, 14, 4), c2) + piece(RR(66, 24, 14, 8, 3), '#ff6b6b', 4)
        body = RR(10, 30, 80, 56, 12)
        surface = P('M10 44H90V72H10Z', OL, ' opacity=".12"')
        scr = circ(50, 58, 23)
        after = `<circle cx="50" cy="58" r="23" fill="none" stroke="${c2}" stroke-width="4" opacity=".7"/>` + C(78, 38, 3.2, '#fff4b0', ` stroke="${OL}" stroke-width="2"`)
        ;[fx, ey, gap, my, s] = [50, 55, 8.5, 64, 0.88]
        hl = [20, 36, 5, 2]
        break
      case 'headphones': {
        // a round buddy wearing headphones
        ;[c1, c2] = ['#ffe9c7', '#ffb877']
        body = circ(50, 54, 30)
        const band = 'M17 56C17 30 31 14 50 14C69 14 83 30 83 56'
        front =
          `<g data-lv-depth=".15"><path d="${band}" stroke="${OL}" stroke-width="13" fill="none" stroke-linecap="round"/>` +
          `<path d="${band}" stroke="${shell[1]}" stroke-width="6" fill="none" stroke-linecap="round"/>` +
          piece(RR(8, 44, 18, 28, 8), shell[1]) + piece(RR(74, 44, 18, 28, 8), shell[1]) +
          E(14, 52, 2, 5, '#fff', 0, ' opacity=".5"') + E(80, 52, 2, 5, '#fff', 0, ' opacity=".5"') + `</g>`
        ;[fx, ey, gap, my, s] = [50, 55, 10, 65, 0.95]
        hl = [38, 34, 5, 2.5]
        break
      }
      case 'tv':
        back = `<g data-lv-depth=".1" data-lv-tilt="8">${S('M50 26L34 8M50 26L68 10', OL, 5)}${S('M50 26L34 8M50 26L68 10', '#c4cbe0', 2)}${C(34, 8, 3, '#ff6b6b', ` stroke="${OL}" stroke-width="2"`)}${C(68, 10, 3, '#ff6b6b', ` stroke="${OL}" stroke-width="2"`)}</g>` +
          piece(RR(22, 82, 10, 8, 2), c2, 4) + piece(RR(68, 82, 10, 8, 2), c2, 4)
        body = RR(8, 24, 84, 62, 12)
        scr = RR(14, 30, 58, 50, 9)
        after = C(82, 42, 4, '#fff', ` stroke="${OL}" stroke-width="2"`) + C(82, 56, 4, '#fff', ` stroke="${OL}" stroke-width="2"`) + S('M78 68H86M78 72H86M78 76H86', OL, 1.6, ' opacity=".5"')
        ;[fx, ey, gap, my, s] = [43, 52, 9.5, 62, 0.92]
        hl = [16, 27, 4, 1.4]
        break
      case 'tablet':
        body = RR(10, 18, 80, 64, 10)
        scr = RR(17, 24, 66, 52, 5)
        front = C(86.5, 50, 1.6, OL, ' opacity=".5"')
        ;[fx, ey, gap, my, s] = [50, 46, 10, 57, 0.95]
        hl = [14, 22, 3, 1.4]
        break
      case 'gamepad': {
        body = 'M28 30H72C84 30 92 42 93 58C94 72 88 82 80 82C72 82 68 72 62 70H38C32 72 28 82 20 82C12 82 6 72 7 58C8 42 16 30 28 30Z'
        surface = E(20, 76, 8, 4, OL, 0, ' opacity=".12"') + E(80, 76, 8, 4, OL, 0, ' opacity=".12"')
        front =
          piece('M20 44h6v6h6v6h-6v6h-6v-6h-6v-6h6Z', '#3b4566', 2.5) +
          C(78, 46, 3.2, '#ff6b6b', ` stroke="${OL}" stroke-width="2"`) + C(85, 53, 3.2, '#4cc9f0', ` stroke="${OL}" stroke-width="2"`) +
          C(71, 53, 3.2, '#ffd23f', ` stroke="${OL}" stroke-width="2"`) + C(78, 60, 3.2, '#7ae582', ` stroke="${OL}" stroke-width="2"`)
        ;[fx, ey, gap, my, s] = [50, 47, 7, 56, 0.78]
        hl = [24, 35, 6, 2.2]
        break
      }
    }

    const glow = screen && scr ? `<path d="${scr}" fill="#9ff3ff" opacity=".55" stroke="#9ff3ff" stroke-width="10" stroke-linejoin="round" filter="url(#${id}-b)"/>` : ''
    const scan = screen ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<rect x="0" y="${8 + i * 9}" width="100" height="1.6" fill="#fff" opacity=".25"/>`).join('') : ''
    const scrSvg = scr
      ? `<path d="${scr}" fill="${OL}" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/><path d="${scr}" fill="url(#${id}-s)"/>` +
        `<g clip-path="url(#${id}-q)">${scan}${P('M0 0H60L20 100H0Z', '#fff', ' opacity=".18"')}</g>`
      : ''

    const eyeK = rand.pick(['dot', 'sparkle'] as const)
    const eye = (x: number, y: number) => `<g data-lv-depth=".45">${E(x, y, 3 * s, 3.6 * s, INK)}${C(x - 1 * s, y - 1.3 * s, 1.15 * s, '#fff')}</g>`
    const neutralEye = (x: number, y: number) =>
      eyeK === 'sparkle'
        ? `<g data-lv-depth=".45">${E(x, y, 3.8 * s, 4.4 * s, INK)}${C(x - 1.3 * s, y - 1.6 * s, 1.5 * s, '#fff')}${C(x + 1.4 * s, y + 1.6 * s, 0.7 * s, '#fff')}</g>`
        : eye(x, y)
    const F: FaceSpec = { x: fx, ey, gap, my, ink: INK, s, eye, extra: [Math.min(fx + gap + 8 * s, 86), Math.max(ey - 13 * s, 10)] }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${neutralEye(fx - gap, ey)}</g><g data-lv-eye="">${neutralEye(fx + gap, ey)}</g>` : faceEyes(F, mood)
    const mouth =
      mood === 'neutral'
        ? rand.bool(0.5)
          ? S(`M${n(fx - 4.5 * s)} ${n(my)}Q${n(fx)} ${n(my + 4.5 * s)} ${n(fx + 4.5 * s)} ${n(my)}`, INK, 2.1 * s)
          : P(`M${n(fx - 5 * s)} ${n(my)}Q${n(fx)} ${n(my + 9 * s)} ${n(fx + 5 * s)} ${n(my)}Z`, INK, ` stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"`) + E(fx, my + 4 * s, 2.6 * s, 1.5 * s, '#ff7a93')
        : faceMouth(F, mood)
    const blush = mood === 'happy' ? '' : E(fx - gap - 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ' opacity=".4"') + E(fx + gap + 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ' opacity=".4"')

    const hand = (x: number, side: 1 | -1) =>
      `<g transform="rotate(${side * 12} ${n(x)} ${n(ey + 2)})">` +
      `<rect x="${n(x - 5.5)}" y="${n(ey + 6)}" width="11" height="50" rx="5.5" fill="${c2}" stroke="${OL}" stroke-width="2.4"/>` +
      `<rect x="${n(x - 8.5)}" y="${n(ey - 8)}" width="17" height="19" rx="8" fill="${c1}" stroke="${OL}" stroke-width="2.4"/>` +
      `</g>`

    return (
      `<defs><radialGradient id="${id}-g" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>` +
      `<radialGradient id="${id}-s" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="${screen ? '#f2fffd' : '#e9edf5'}"/><stop offset="1" stop-color="${screen ? '#8de8f2' : '#b4bdd0'}"/></radialGradient>` +
      `<filter id="${id}-b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>` +
      `<clipPath id="${id}-p"><path d="${body}"/></clipPath><clipPath id="${id}-q"><path d="${scr || body}"/></clipPath></defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".3" data-lv-tilt="4">` +
      back +
      `<path d="${body}" fill="${OL}" stroke="${OL}" stroke-width="5.5" stroke-linejoin="round"/>` +
      `<path d="${body}" fill="url(#${id}-g)"/>` +
      `<g clip-path="url(#${id}-p)">${surface}${C(70, 78, 34, 'rgba(0,0,0,.08)')}</g>` +
      E(hl[0], hl[1], hl[2], hl[3], '#fff', -30, ' opacity=".6"') +
      glow +
      scrSvg +
      after +
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
