import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['clipboard', 'calendar', 'note', 'paperclip', 'folder', 'stapler', 'pencil', 'briefcase'] as const
type Kind = (typeof KINDS)[number]

export interface OfficeOptions {
  kind?: Kind | 'random'
  /** Ruled / text lines on paper items. */
  lines?: boolean | 'random'
}

const INK = '#1f1a2e'
const OL = '#1f2a44'

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
const R = (x: number, y: number, w: number, h: number, rx: number, fill: string, extra = '') =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(rx)}" fill="${fill}"${extra}/>`
/** Rounded-rect as a path (so it can be the body / clip path). */
const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`
const outlined = (svg: string) => `<g stroke="${OL}" stroke-width="2.6" stroke-linejoin="round">${svg}</g>`

/** Cute office supplies — clipboards, sticky notes, staplers and friends. */
export const office = defineStyle<OfficeOptions>({
  name: 'office',
  scale: 0.84,
  colors: ['#dff1ff', '#ffe9d6', '#e8f7e4', '#efe6ff', '#fff4c7', '#ffe0ea', '#d9f3f1', '#e6ebf5'],
  defaults: { kind: 'random', lines: 'random' },
  variants: { kind: KINDS, lines: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const lines = pick('lines', [true, true, false])

    let body = ''
    let [c1, c2] = ['#ffffff', '#dfe6f2']
    let back = '' // behind the body
    let surface = '' // clipped to the body
    let front = '' // over the body, under the face
    let custom = '' // replaces the default body drawing
    let [fx, ey, gap, my, s] = [50, 50, 10, 59, 0.95]
    let tilt = 0
    const ruled = (x1: number, x2: number, ys: number[], ink = '#9fb3d1') =>
      lines ? ys.map((y, i) => S(`M${x1} ${y}H${i === ys.length - 1 ? x2 - (x2 - x1) * 0.35 : x2}`, ink, 1.8, ' opacity=".7"')).join('') : ''

    switch (kind) {
      case 'clipboard': {
        // brown board, paper, metal clip
        back = outlined(R(20, 14, 60, 78, 8, '#c98a4f')) + R(23, 17, 54, 72, 6, '#e0a466', ' opacity=".6"')
        body = rr(27, 24, 46, 62, 4)
        surface = ruled(33, 67, [68, 74, 80])
        front =
          outlined(R(38, 10, 24, 14, 5, '#cfd8e6') + R(43, 6, 14, 8, 4, '#aebcd1')) +
          R(40, 12, 20, 3, 1.5, '#fff', ' opacity=".7"') +
          C(50, 10, 1.6, OL)
        ;[ey, gap, my, s] = [44, 9, 53, 0.9]
        break
      }
      case 'calendar': {
        body = rr(17, 22, 66, 66, 10)
        surface =
          `<rect x="10" y="10" width="80" height="22" fill="#ff6b6b"/>` +
          `<rect x="10" y="32" width="80" height="2.5" fill="#d94b4b" opacity=".5"/>` +
          (lines
            ? [0, 1, 2, 3, 4, 5].map((i) => R(25 + i * 9, 76, 5, 4, 1.2, i === 3 ? '#ff6b6b' : '#c6d1e3')).join('') +
              [0, 1, 2, 3, 4, 5].map((i) => R(25 + i * 9, 82, 5, 3, 1.2, '#c6d1e3', ' opacity=".7"')).join('')
            : '')
        front = [34, 66]
          .map((x) => outlined(R(x - 3, 13, 6, 15, 3, '#cfd8e6')) + R(x - 1.4, 15, 1.6, 9, 0.8, '#fff', ' opacity=".7"'))
          .join('')
        ;[ey, gap, my, s] = [52, 10, 62, 0.95]
        break
      }
      case 'note': {
        ;[c1, c2] = ['#fff7a8', '#ffd43b']
        tilt = -5
        body = 'M20 18H80V66L64 82H20Z'
        surface = ruled(28, 72, [70, 76]) + `<rect x="10" y="10" width="80" height="9" fill="#ffc21a" opacity=".55"/>`
        front =
          outlined(P('M80 66L64 82V70Q64 66 68 66Z', '#ffc21a')) +
          // a bit of tape
          `<rect x="40" y="12" width="20" height="9" rx="1.5" fill="#cfe8ff" opacity=".8" transform="rotate(4 50 16)"/>`
        ;[ey, gap, my, s] = [42, 10, 52, 0.95]
        break
      }
      case 'paperclip': {
        ;[c1, c2] = ['#eef3fb', '#9fb0c8']
        const d = 'M64 40V66A14 10 0 0 1 36 66V34A21 14 0 0 1 78 34V70A28 18 0 0 1 22 70V36'
        custom =
          P('M36 40Q36 30 50 30Q64 30 64 40V68Q64 78 50 78Q36 78 36 68Z', '#f4f7fd') +
          S(d, OL, 14.5) +
          S(d, `url(#${id}-g)`, 8.5) +
          S('M24 66V40M76 36V66', '#fff', 2, ' opacity=".7"')
        body = rr(36, 30, 28, 50, 12)
        ;[ey, gap, my, s] = [52, 5.8, 61, 0.75]
        break
      }
      case 'folder': {
        ;[c1, c2] = ['#ffd98a', '#f5a524']
        back =
          outlined(P('M14 30Q14 24 20 24H38Q42 24 44 28L46 32H80Q86 32 86 38V82H14Z', '#e0901a')) +
          (lines ? outlined(R(24, 18, 46, 34, 3, '#fff') ) + S('M30 26H62M30 32H56', '#9fb3d1', 1.8, ' opacity=".7"') : '')
        body = 'M12 42Q12 38 16 38H84Q88 38 88 42L85 82Q85 88 79 88H21Q15 88 15 82Z'
        surface = `<rect x="10" y="38" width="80" height="4" fill="#fff" opacity=".35"/>`
        ;[ey, gap, my, s] = [58, 10, 68, 0.95]
        break
      }
      case 'stapler': {
        ;[c1, c2] = ['#ff8a8a', '#e23d4f']
        // base
        back =
          outlined(R(10, 72, 80, 12, 6, '#3d4a66')) +
          R(14, 74, 60, 3, 1.5, '#fff', ' opacity=".25"') +
          outlined(R(12, 62, 18, 14, 5, '#2b3550'))
        body = 'M14 60C14 42 26 34 42 34H78Q90 34 90 46V52Q90 64 78 66H20Q14 66 14 60Z'
        surface = `<rect x="10" y="58" width="82" height="10" fill="#b8243a" opacity=".45"/>`
        front = C(22, 64, 2.4, '#cfd8e6', ` stroke="${OL}" stroke-width="1.6"`)
        ;[fx, ey, gap, my, s] = [58, 46, 9, 55, 0.9]
        break
      }
      case 'pencil': {
        ;[c1, c2] = ['#ffe066', '#f7a81b']
        tilt = 12
        back =
          // tip: wood cone + graphite
          outlined(P('M34 72H66L52.5 92Q50 95 47.5 92Z', '#f5cf9f')) +
          P('M45.5 86.5H54.5L52 90.5Q50 93 48 90.5Z', '#3d4a66') +
          // eraser + ferrule
          outlined(P('M35 14Q35 6 43 6H57Q65 6 65 14V20H35Z', '#ff8fab')) +
          outlined(R(33, 18, 34, 10, 2, '#cfd8e6')) +
          S('M33 21.5H67M33 24.5H67', '#9aa9c2', 1.2)
        body = rr(34, 27, 32, 46, 2)
        surface = `<rect x="55" y="20" width="12" height="60" fill="#e08a00" opacity=".35"/><rect x="34" y="20" width="5" height="60" fill="#fff" opacity=".35"/>`
        ;[ey, gap, my, s] = [45, 7.5, 54, 0.8]
        break
      }
      case 'briefcase': {
        ;[c1, c2] = ['#c98a5a', '#8a5230']
        back = S('M38 34V26Q38 20 44 20H56Q62 20 62 26V34', OL, 9) + S('M38 34V26Q38 20 44 20H56Q62 20 62 26V34', '#6b3e22', 4.5)
        body = rr(12, 32, 76, 54, 10)
        surface = `<rect x="10" y="54" width="80" height="3" fill="#5c331a" opacity=".45"/>`
        front =
          outlined(R(26, 29, 9, 9, 2.5, '#ffd23f') + R(65, 29, 9, 9, 2.5, '#ffd23f'))
        ;[ey, gap, my, s] = [64, 10, 73, 0.95]
        break
      }
    }

    const eyeK = rand.pick(['dot', 'sparkle'] as const)
    const eye = (x: number, y: number) => `<g data-lv-depth=".45">${E(x, y, 3 * s, 3.6 * s, INK)}${C(x - 1 * s, y - 1.3 * s, 1.15 * s, '#fff')}</g>`
    const neutralEye = (x: number, y: number) =>
      eyeK === 'sparkle'
        ? `<g data-lv-depth=".45">${E(x, y, 3.8 * s, 4.4 * s, INK)}${C(x - 1.3 * s, y - 1.6 * s, 1.5 * s, '#fff')}${C(x + 1.4 * s, y + 1.6 * s, 0.7 * s, '#fff')}</g>`
        : eye(x, y)
    const F: FaceSpec = { x: fx, ey, gap, my, ink: INK, s, eye, extra: [Math.min(fx + gap + 8, 86), Math.max(ey - 13, 12)] }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${neutralEye(fx - gap, ey)}</g><g data-lv-eye="">${neutralEye(fx + gap, ey)}</g>` : faceEyes(F, mood)
    const mouth =
      mood === 'neutral'
        ? rand.bool(0.5)
          ? S(`M${n(fx - 4.5 * s)} ${my}Q${fx} ${n(my + 4.5 * s)} ${n(fx + 4.5 * s)} ${my}`, INK, 2.1 * s)
          : P(`M${n(fx - 5 * s)} ${my}Q${fx} ${n(my + 9 * s)} ${n(fx + 5 * s)} ${my}Z`, INK, ` stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"`) + E(fx, my + 4 * s, 2.6 * s, 1.5 * s, '#ff7a93')
        : faceMouth(F, mood)
    const blush = mood === 'happy' ? '' : E(fx - gap - 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ' opacity=".4"') + E(fx + gap + 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ' opacity=".4"')

    const hand = (x: number, side: 1 | -1) =>
      `<g transform="rotate(${side * 12} ${n(x)} ${n(ey + 2)})">` +
      `<rect x="${n(x - 5.5)}" y="${n(ey + 6)}" width="11" height="50" rx="5.5" fill="${c2}" stroke="${OL}" stroke-width="2.4"/>` +
      `<rect x="${n(x - 8.5)}" y="${n(ey - 8)}" width="17" height="19" rx="8" fill="${c1}" stroke="${OL}" stroke-width="2.4"/>` +
      `</g>`

    const drawn = custom
      ? custom
      : `<path d="${body}" fill="${OL}" stroke="${OL}" stroke-width="5.5" stroke-linejoin="round"/>` +
        `<path d="${body}" fill="url(#${id}-g)"/>` +
        `<g clip-path="url(#${id}-p)">${surface}${C(78, 84, 30, 'rgba(0,0,0,.05)')}</g>`

    return (
      `<defs><linearGradient id="${id}-g" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` +
      `<clipPath id="${id}-p"><path d="${body}"/></clipPath></defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".3" data-lv-tilt="4"${tilt ? ` transform="rotate(${tilt} 50 50)"` : ''}>` +
      back +
      drawn +
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
