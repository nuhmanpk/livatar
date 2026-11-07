import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['toggle', 'bell', 'folder', 'trash', 'lock', 'gear', 'cart', 'chat'] as const
type Kind = (typeof KINDS)[number]

export interface UiOptions {
  kind?: Kind | 'random'
  /** A little red notification dot in the top-right corner. */
  badge?: boolean | 'random'
}

const INK = '#1f1a2e'
const OL = '#1f2a44'

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
/** Rounded rectangle as a path. */
const RR = (x: number, y: number, w: number, h: number, r: number) =>
  `M${n(x + r)} ${n(y)}H${n(x + w - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + w)} ${n(y + r)}V${n(y + h - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + w - r)} ${n(y + h)}` +
  `H${n(x + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y + h - r)}V${n(y + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)}Z`
/** A chunky outlined piece (outline behind the fill). */
const piece = (d: string, fill: string, w = 5.5) =>
  `<path d="${d}" fill="${OL}" stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="${fill}"/>`

/** Living UI icons — a toggle, a bell, a folder, a trash can… */
export const ui = defineStyle<UiOptions>({
  name: 'ui',
  scale: 0.84,
  colors: ['#e8f0ff', '#fff1e0', '#e9fbf1', '#f3e8ff', '#ffe8ef', '#e0f4ff', '#fffbe0', '#eef0f6'],
  defaults: { kind: 'random', badge: 'random' },
  variants: { kind: KINDS, badge: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const badge = pick('badge', [true, false, false])

    let body = ''
    let [c1, c2] = ['#8fc1ff', '#3a86ff']
    let back = ''
    let surface = ''
    let front = ''
    let [fx, ey, gap, my, s] = [50, 52, 10, 61, 0.95]
    let [bx, by] = [80, 22] // badge position
    let hl: [number, number, number, number] = [30, 34, 7, 3.5] // highlight

    switch (kind) {
      case 'toggle': {
        // pill track + a big round knob that holds the face
        ;[c1, c2] = ['#9ff0b8', '#2fbf71']
        body = RR(8, 30, 84, 42, 21)
        surface = E(30, 51, 8, 4, '#fff', 0, ' opacity=".35"') + C(30, 51, 5, 'none', ' stroke="#fff" stroke-width="2.5" opacity=".7"')
        const knob = 'M66 51m-19 0a19 19 0 1 0 38 0a19 19 0 1 0 -38 0Z'
        front = `<g data-lv-depth=".15">${piece(knob, `url(#${id}-k)`, 4.5)}${E(59, 42, 5, 2.6, '#fff', -30, ' opacity=".8"')}</g>`
        ;[fx, ey, gap, my, s] = [66, 49, 7, 56, 0.72]
        ;[bx, by] = [86, 30]
        hl = [22, 37, 6, 2.6]
        break
      }
      case 'bell': {
        ;[c1, c2] = ['#ffe58a', '#f5a524']
        body = 'M50 14C54 14 56 16 56 19C70 22 76 34 76 48V62C76 68 82 71 86 74C88 76 87 80 84 80H16C13 80 12 76 14 74C18 71 24 68 24 62V48C24 34 30 22 44 19C44 16 46 14 50 14Z'
        back = `<g data-lv-depth=".1">${piece('M42 80a8 8 0 0 0 16 0Z', '#f5a524', 5)}</g>`
        surface = S('M18 74H82', '#c97a10', 3, ' opacity=".35"') + E(68, 50, 4, 14, '#fff', 0, ' opacity=".18"')
        ;[fx, ey, gap, my, s] = [50, 46, 9.5, 56, 0.92]
        ;[bx, by] = [76, 22]
        hl = [36, 30, 6, 3]
        break
      }
      case 'folder': {
        ;[c1, c2] = ['#ffd98a', '#f4a63a']
        back = piece('M12 30C12 25 15 22 20 22H38C41 22 43 23 45 26L48 30H80C85 30 88 33 88 38V50H12Z', '#e48d25')
        body = RR(10, 36, 80, 50, 8)
        surface = P('M10 36H90V42H10Z', '#fff', ' opacity=".35"') + E(70, 78, 30, 8, '#c97a10', 0, ' opacity=".2"')
        ;[fx, ey, gap, my, s] = [50, 58, 10, 68, 0.95]
        ;[bx, by] = [84, 26]
        hl = [22, 47, 6, 2.6]
        break
      }
      case 'trash': {
        ;[c1, c2] = ['#c9d4e8', '#7f8fb0']
        body = 'M24 36H76L71 84C70.5 88 68 90 64 90H36C32 90 29.5 88 29 84Z'
        surface = S('M38 74V84M50 74V86M62 74V84', '#56627e', 3, ' opacity=".45"') + E(66, 60, 4, 16, '#fff', 0, ' opacity=".18"')
        front = `<g data-lv-depth=".2" data-lv-tilt="6">${piece(RR(42, 15, 16, 10, 4), '#a8b6d2', 4.5)}${piece(RR(17, 22, 66, 12, 6), '#a8b6d2')}${E(30, 26, 6, 1.8, '#fff', 0, ' opacity=".7"')}</g>`
        ;[fx, ey, gap, my, s] = [50, 52, 9, 62, 0.9]
        ;[bx, by] = [80, 16]
        hl = [31, 44, 3, 6]
        break
      }
      case 'lock': {
        ;[c1, c2] = ['#ffd27a', '#f29a2e']
        back = `<path d="M30 46V34C30 22 39 14 50 14C61 14 70 22 70 34V46" stroke="${OL}" stroke-width="15" fill="none" stroke-linecap="round"/>` +
          `<path d="M30 46V34C30 22 39 14 50 14C61 14 70 22 70 34V46" stroke="#c4cbe0" stroke-width="7" fill="none" stroke-linecap="round"/>` +
          S('M35 30C37 24 41 21 45 20', '#fff', 2, ' opacity=".7"')
        body = RR(18, 42, 64, 46, 12)
        surface = P('M18 80H82V88H18Z', '#c97a10', ' opacity=".2"') + C(72, 80, 2, '#fff', ' opacity=".5"')
        ;[fx, ey, gap, my, s] = [50, 61, 10, 71, 0.95]
        ;[bx, by] = [80, 40]
        hl = [28, 50, 6, 2.6]
        break
      }
      case 'gear': {
        ;[c1, c2] = ['#c8d3ff', '#6d7fe0']
        const pts: string[] = []
        const T = 8
        for (let i = 0; i < T; i++) {
          const a = (i / T) * Math.PI * 2 - Math.PI / 2
          const w = Math.PI / T
          const at = (ang: number, rr: number) => `${n(50 + Math.cos(ang) * rr)} ${n(52 + Math.sin(ang) * rr)}`
          pts.push(`${i ? 'L' : 'M'}${at(a - w * 0.55, 31)}L${at(a - w * 0.38, 40)}L${at(a + w * 0.38, 40)}L${at(a + w * 0.55, 31)}A31 31 0 0 1 ${at(a + w * 1.45, 31)}`)
        }
        body = pts.join('') + 'Z'
        surface = C(50, 52, 24, 'none', ` stroke="#4a5bc0" stroke-width="2.5" opacity=".3"`)
        ;[fx, ey, gap, my, s] = [50, 49, 9, 59, 0.9]
        ;[bx, by] = [82, 18]
        hl = [36, 33, 6, 3]
        break
      }
      case 'cart': {
        ;[c1, c2] = ['#9fe3ff', '#2fa6e0']
        back = S('M6 22H16L20 34', OL, 9) + S('M6 22H16L20 34', '#c4cbe0', 4) +
          `<g data-lv-depth=".1">${C(34, 84, 6.5, '#c4cbe0', ` stroke="${OL}" stroke-width="4"`)}${C(70, 84, 6.5, '#c4cbe0', ` stroke="${OL}" stroke-width="4"`)}</g>`
        body = 'M16 30H90C93 30 94 33 93 36L85 68C84 72 81 74 77 74H30C26 74 23 72 22 68Z'
        surface = S('M30 30L33 74M72 30L69 74', '#1c7fb5', 2.5, ' opacity=".3"') + P('M16 30H94V37H16Z', '#fff', ' opacity=".3"')
        ;[fx, ey, gap, my, s] = [53, 48, 9.5, 58, 0.9]
        ;[bx, by] = [88, 24]
        hl = [28, 41, 4, 2]
        break
      }
      case 'chat': {
        ;[c1, c2] = ['#d9c8ff', '#8b5cf6']
        body = 'M24 16H76C84 16 90 22 90 30V58C90 66 84 72 76 72H44L28 86C26 88 24 87 24 84V72C16 72 10 66 10 58V30C10 22 16 16 24 16Z'
        surface = C(72, 64, 1.8, '#fff', ' opacity=".5"') + C(79, 61, 1.3, '#fff', ' opacity=".5"')
        ;[fx, ey, gap, my, s] = [50, 40, 10, 51, 0.95]
        ;[bx, by] = [86, 18]
        hl = [24, 25, 7, 3]
        break
      }
    }

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

    const badgeSvg = badge
      ? `<g data-lv-float=""><g data-lv-depth=".8">${C(bx, by, 7, '#ff3b5c', ` stroke="${OL}" stroke-width="3"`)}${E(bx - 2, by - 2.4, 2.4, 1.3, '#fff', -30, ' opacity=".8"')}</g></g>`
      : ''

    return (
      `<defs><radialGradient id="${id}-g" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>` +
      `<radialGradient id="${id}-k" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe6f3"/></radialGradient>` +
      `<clipPath id="${id}-p"><path d="${body}"/></clipPath></defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".3" data-lv-tilt="4">` +
      back +
      `<path d="${body}" fill="${OL}" stroke="${OL}" stroke-width="5.5" stroke-linejoin="round"/>` +
      `<path d="${body}" fill="url(#${id}-g)"/>` +
      `<g clip-path="url(#${id}-p)">${surface}${C(70, 78, 34, 'rgba(0,0,0,.08)')}</g>` +
      E(hl[0], hl[1], hl[2], hl[3], '#fff', -30, ' opacity=".6"') +
      front +
      `<g data-lv-depth=".6">` +
      eyes +
      faceBrows(F, mood) +
      blush +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g>` +
      badgeSvg +
      `<g data-lv-shy="" opacity="0">${hand(fx - gap + 1, -1)}${hand(fx + gap - 1, 1)}</g>` +
      `</g></g>`
    )
  },
})
