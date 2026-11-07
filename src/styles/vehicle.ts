import { defineStyle, n, type Mood } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['car', 'bus', 'rocket', 'plane', 'scooter', 'van', 'train', 'boat'] as const
type Kind = (typeof KINDS)[number]
const COLORS = ['red', 'blue', 'yellow', 'green', 'pink', 'orange', 'purple', 'teal'] as const
type Color = (typeof COLORS)[number]

export interface VehicleOptions {
  kind?: Kind | 'random'
  /** Paint color. */
  color?: Color | 'random'
}

const INK = '#1f1a2e'
const OL = '#1f2a44'
const GLASS = ['#e9f7ff', '#9fd4f5']
const PAINT: Record<Color, [string, string, string]> = {
  red: ['#ff8a80', '#e63946', '#b8232f'],
  blue: ['#8fd3ff', '#3a86ff', '#2563c9'],
  yellow: ['#fff1a0', '#ffc233', '#e09a00'],
  green: ['#a8f0b0', '#3fbf6a', '#2a9150'],
  pink: ['#ffc2dc', '#ff6fa5', '#e04585'],
  orange: ['#ffc58f', '#ff8c2e', '#de6a10'],
  purple: ['#d6c2ff', '#8e6cf0', '#6a48cf'],
  teal: ['#b7f0e4', '#2ec4b6', '#1f978b'],
}

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
/** Rounded-rect path. */
const RR = (x: number, y: number, w: number, h: number, r: number) =>
  `M${n(x + r)} ${n(y)}H${n(x + w - r)}Q${n(x + w)} ${n(y)} ${n(x + w)} ${n(y + r)}V${n(y + h - r)}Q${n(x + w)} ${n(y + h)} ${n(x + w - r)} ${n(y + h)}H${n(x + r)}Q${n(x)} ${n(y + h)} ${n(x)} ${n(y + h - r)}V${n(y + r)}Q${n(x)} ${n(y)} ${n(x + r)} ${n(y)}Z`
/** A chunky outlined shape. */
const O = (d: string, fill: string, w = 5) => P(d, fill, ` stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" paint-order="stroke"`)
const wheel = (x: number, y: number, r: number) => C(x, y, r, '#3a3f55', ` stroke="${OL}" stroke-width="4"`) + C(x, y, r * 0.45, '#d9dde8') + C(x, y, r * 0.15, '#3a3f55')
const glassPanel = (id: string, d: string) =>
  O(d, `url(#${id}-w)`, 3.5) + `<g clip-path="url(#${id}-wc)">${P('M0 0H40L10 100H0Z', '#fff', ' opacity=".35" transform="translate(20 0) skewX(-20)"')}</g>`

/** Cute little vehicles — cars, buses, rockets, boats… with faces on the windshield. */
export const vehicle = defineStyle<VehicleOptions>({
  name: 'vehicle',
  scale: 0.84,
  colors: ['#cfe3ff', '#ffe1f0', '#d6f5ee', '#fff1c9', '#e5dcff', '#ffd9c2', '#dff3ff', '#e8f7d4'],
  defaults: { kind: 'random', color: 'random' },
  variants: { kind: KINDS, color: COLORS },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const color = pick('color', COLORS)
    const [c1, c2, c3] = PAINT[color]

    let body = ''
    let back = '' // behind the body (wheels, wings, flames)
    let surface = '' // clipped to the body
    let front = '' // over the body, under the face
    let win = '' // windshield path (the face sits on it)
    let [ey, gap, my, s, fx] = [44, 9, 52, 0.85, 50]
    let hl: [number, number] = [36, 30] // highlight position

    switch (kind) {
      case 'car':
        body = 'M15 78Q8 78 8 70V62Q8 53 18 52L26 51Q30 30 42 28H58Q70 30 74 51L82 52Q92 53 92 62V70Q92 78 85 78Z'
        win = 'M33 50Q35 35 44 34H56Q65 35 67 50Z'
        back = wheel(28, 78, 9) + wheel(72, 78, 9)
        front = E(14, 62, 3, 3.5, '#fff6b0', 0, ` stroke="${OL}" stroke-width="2"`) + E(86, 62, 3, 3.5, '#fff6b0', 0, ` stroke="${OL}" stroke-width="2"`)
        surface = `<rect x="0" y="66" width="100" height="3" fill="${c3}" opacity=".5"/>`
        ;[ey, gap, my, s] = [62, 11, 69, 0.9]
        hl = [22, 57]
        break
      case 'van':
        body = RR(12, 24, 76, 54, 14)
        win = RR(20, 31, 60, 22, 7)
        back = wheel(30, 78, 9) + wheel(70, 78, 9)
        front = `<rect x="38" y="67" width="24" height="5" rx="2.5" fill="${c3}" stroke="${OL}" stroke-width="2"/>` +
          E(20, 66, 3.2, 3, '#fff6b0', 0, ` stroke="${OL}" stroke-width="2"`) + E(80, 66, 3.2, 3, '#fff6b0', 0, ` stroke="${OL}" stroke-width="2"`)
        surface = `<rect x="0" y="58" width="100" height="3" fill="#fff" opacity=".45"/>`
        ;[ey, gap, my, s] = [40, 10, 48, 0.85]
        hl = [22, 28]
        break
      case 'bus':
        body = RR(14, 12, 72, 66, 10)
        win = RR(20, 22, 60, 30, 6)
        back = wheel(28, 80, 8) + wheel(72, 80, 8)
        front = `<rect x="30" y="14" width="40" height="6" rx="3" fill="#1f2a44"/><rect x="33" y="15.5" width="34" height="3" rx="1.5" fill="#ffd23f"/>` +
          C(23, 66, 3.6, '#fff6b0', ` stroke="${OL}" stroke-width="2"`) + C(77, 66, 3.6, '#fff6b0', ` stroke="${OL}" stroke-width="2"`) +
          `<rect x="36" y="63" width="28" height="8" rx="3" fill="${c3}" stroke="${OL}" stroke-width="2"/>`
        surface = `<rect x="0" y="56" width="100" height="3" fill="#fff" opacity=".45"/>`
        ;[ey, gap, my, s] = [35, 11, 44, 0.95]
        hl = [22, 18]
        break
      case 'train':
        body = 'M18 78V36Q18 16 50 16Q82 16 82 36V78Z'
        win = RR(26, 26, 48, 24, 8)
        back = `<rect x="6" y="84" width="88" height="4" rx="2" fill="#8a8fa8" stroke="${OL}" stroke-width="2.5"/>` + wheel(30, 80, 7) + wheel(70, 80, 7) +
          `<rect x="44" y="6" width="12" height="12" rx="3" fill="#3a3f55" stroke="${OL}" stroke-width="3"/>`
        front = C(28, 64, 3.6, '#fff6b0', ` stroke="${OL}" stroke-width="2"`) + C(72, 64, 3.6, '#fff6b0', ` stroke="${OL}" stroke-width="2"`) +
          P('M30 78L36 70H64L70 78Z', '#3a3f55', ` stroke="${OL}" stroke-width="2.5" stroke-linejoin="round"`)
        surface = `<rect x="0" y="55" width="100" height="4" fill="${c3}" opacity=".6"/>`
        ;[ey, gap, my, s] = [37, 10, 45, 0.9]
        hl = [28, 24]
        break
      case 'rocket':
        body = 'M50 8C66 18 72 36 72 54V74Q72 78 68 78H32Q28 78 28 74V54C28 36 34 18 50 8Z'
        win = 'M35 45a15 15 0 1 0 30 0a15 15 0 1 0 -30 0Z'
        back =
          O('M30 52L16 68V82L30 76Z', c3) + O('M70 52L84 68V82L70 76Z', c3) +
          `<g data-lv-float="">${O('M38 80Q38 90 50 95Q62 90 62 80Z', '#ffb703', 4)}${P('M43 80Q44 88 50 91Q56 88 57 80Z', '#fff3a0')}</g>`
        surface = P('M0 0H100V20H0Z', c3, ' opacity=".9" transform="translate(0 -6)"') + `<rect x="0" y="66" width="100" height="4" fill="#fff" opacity=".5"/>`
        ;[ey, gap, my, s] = [43, 6.5, 49, 0.62]
        hl = [40, 26]
        break
      case 'plane':
        body = 'M50 22C64 22 70 34 70 50C70 66 62 78 50 78C38 78 30 66 30 50C30 34 36 22 50 22Z'
        win = 'M36 40Q38 28 50 28Q62 28 64 40Q50 44 36 40Z'
        back =
          O('M44 26L50 8L56 26Z', c3, 4.5) +
          O('M30 46L6 54V62L30 60Z', c1, 4.5) + O('M70 46L94 54V62L70 60Z', c1, 4.5) +
          `<rect x="13" y="61" width="7" height="8" rx="2" fill="#3a3f55" stroke="${OL}" stroke-width="2.5"/><rect x="80" y="61" width="7" height="8" rx="2" fill="#3a3f55" stroke="${OL}" stroke-width="2.5"/>` +
          wheel(42, 84, 5) + wheel(58, 84, 5)
        surface = `<rect x="0" y="44" width="100" height="3" fill="${c3}" opacity=".5"/>`
        ;[ey, gap, my, s] = [53, 8, 60, 0.8]
        hl = [38, 30]
        break
      case 'scooter':
        body = 'M36 82V44Q36 26 50 26Q64 26 64 44V82Q64 86 60 86H40Q36 86 36 82Z'
        back =
          S('M22 22Q34 26 50 26Q66 26 78 22', OL, 6) + S('M22 22Q34 26 50 26Q66 26 78 22', '#8a8fa8', 2.6) +
          `<rect x="16" y="16" width="9" height="9" rx="2" fill="#3a3f55" stroke="${OL}" stroke-width="2.5"/><rect x="75" y="16" width="9" height="9" rx="2" fill="#3a3f55" stroke="${OL}" stroke-width="2.5"/>` +
          `<rect x="43" y="78" width="14" height="16" rx="6" fill="#3a3f55" stroke="${OL}" stroke-width="3.5"/>`
        win = ''
        front = C(50, 30, 6, '#fff6b0', ` stroke="${OL}" stroke-width="3"`) + C(48, 28, 2, '#fff')
        surface = `<rect x="0" y="72" width="100" height="3" fill="#fff" opacity=".5"/>`
        ;[ey, gap, my, s] = [50, 7, 57, 0.7]
        hl = [42, 38]
        break
      case 'boat':
        body = 'M8 54H92L80 80Q78 82 74 82H26Q22 82 20 80Z'
        win = RR(30, 30, 40, 22, 7)
        back = O(RR(26, 26, 48, 30, 9), '#ffffff', 4.5) + O('M48 26V10H52L64 20H52', '#fff', 3) + `<rect x="47" y="8" width="4" height="20" rx="2" fill="#8a8fa8" stroke="${OL}" stroke-width="2"/>` + P('M52 11L64 19H52Z', c2, ` stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"`)
        front = `<g data-lv-float="">${S('M6 88Q14 83 22 88T38 88T54 88T70 88T86 88T94 87', '#4fb6ff', 3.4)}</g>` + C(24, 62, 3, '#fff', ` stroke="${OL}" stroke-width="2"`) + C(76, 62, 3, '#fff', ` stroke="${OL}" stroke-width="2"`)
        surface = `<rect x="0" y="68" width="100" height="4" fill="#fff" opacity=".6"/>`
        ;[ey, gap, my, s] = [39, 9, 46, 0.78]
        hl = [18, 58]
        break
    }

    const eye = (x: number, y: number) => `<g data-lv-depth=".45">${E(x, y, 3 * s, 3.6 * s, INK)}${C(x - 1 * s, y - 1.3 * s, 1.15 * s, '#fff')}</g>`
    const F: FaceSpec = { x: fx, ey, gap, my, ink: INK, s, eye, extra: [fx + gap + 7, ey - 11] }
    const face = buildFace(F, mood as Mood, rand.bool(0.5))
    const hand = (x: number, side: 1 | -1) =>
      `<g transform="rotate(${side * 12} ${n(x)} ${n(ey + 2)})">` +
      `<rect x="${n(x - 5.5)}" y="${n(ey + 6)}" width="11" height="50" rx="5.5" fill="${c2}" stroke="${OL}" stroke-width="2.4"/>` +
      `<rect x="${n(x - 8.5)}" y="${n(ey - 8)}" width="17" height="19" rx="8" fill="${c1}" stroke="${OL}" stroke-width="2.4"/>` +
      `</g>`

    return (
      `<defs><linearGradient id="${id}-g" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/></linearGradient>` +
      `<radialGradient id="${id}-w" cx=".3" cy=".25" r="1"><stop offset="0" stop-color="${GLASS[0]}"/><stop offset="1" stop-color="${GLASS[1]}"/></radialGradient>` +
      `<clipPath id="${id}-p"><path d="${body}"/></clipPath>${win ? `<clipPath id="${id}-wc"><path d="${win}"/></clipPath>` : ''}</defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".3" data-lv-tilt="3">` +
      back +
      `<path d="${body}" fill="${OL}" stroke="${OL}" stroke-width="5.5" stroke-linejoin="round"/>` +
      `<path d="${body}" fill="url(#${id}-g)"/>` +
      `<g clip-path="url(#${id}-p)">${surface}${C(76, 84, 40, 'rgba(0,0,0,.08)')}</g>` +
      (win ? glassPanel(id, win) : '') +
      E(hl[0], hl[1], 5, 2.4, '#fff', -30, ' opacity=".6"') +
      front +
      `<g data-lv-depth=".6">${face}</g>` +
      `<g data-lv-shy="" opacity="0">${hand(fx - gap + 1, -1)}${hand(fx + gap - 1, 1)}</g>` +
      `</g></g>`
    )
  },
})

function buildFace(F: FaceSpec, mood: Mood, open: boolean): string {
  const { x: fx, ey, gap, my } = F
  const s = F.s ?? 1
  const eyes = mood === 'neutral' ? `<g data-lv-eye="">${F.eye(fx - gap, ey)}</g><g data-lv-eye="">${F.eye(fx + gap, ey)}</g>` : faceEyes(F, mood)
  const mouth =
    mood === 'neutral'
      ? open
        ? P(`M${n(fx - 5 * s)} ${my}Q${fx} ${n(my + 9 * s)} ${n(fx + 5 * s)} ${my}Z`, INK, ` stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"`) + E(fx, my + 4 * s, 2.6 * s, 1.5 * s, '#ff7a93')
        : S(`M${n(fx - 4.5 * s)} ${my}Q${fx} ${n(my + 4.5 * s)} ${n(fx + 4.5 * s)} ${my}`, INK, 2.1 * s)
      : faceMouth(F, mood)
  const blush = mood === 'happy' ? '' : E(fx - gap - 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ' opacity=".45"') + E(fx + gap + 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ' opacity=".45"')
  return eyes + faceBrows(F, mood) + blush + `<g data-lv-mouth="1">${mouth}</g>` + faceExtras(F, mood)
}
