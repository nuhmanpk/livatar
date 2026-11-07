import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['house', 'lamp', 'sofa', 'door', 'key', 'mug', 'clock', 'bed'] as const
type Kind = (typeof KINDS)[number]

export interface HomeOptions {
  kind?: Kind | 'random'
  /** A smoke / steam wisp (house chimney, mug); ignored for other kinds. */
  smoke?: boolean | 'random'
}

const INK = '#1f1a2e'
const OL = '#1f2a44'

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
/** A chunky outlined piece (drawn outline-first like the body). */
const O = (d: string, fill: string, w = 5) => `<path d="${d}" fill="${OL}" stroke="${OL}" stroke-width="${w}" stroke-linejoin="round"/><path d="${d}" fill="${fill}"/>`
const R = (x: number, y: number, w: number, h: number, rx: number) =>
  `M${n(x + rx)} ${n(y)}H${n(x + w - rx)}Q${n(x + w)} ${n(y)} ${n(x + w)} ${n(y + rx)}V${n(y + h - rx)}Q${n(x + w)} ${n(y + h)} ${n(x + w - rx)} ${n(y + h)}H${n(x + rx)}Q${n(x)} ${n(y + h)} ${n(x)} ${n(y + h - rx)}V${n(y + rx)}Q${n(x)} ${n(y)} ${n(x + rx)} ${n(y)}Z`

/** Cozy home things — a little house, lamp, sofa, mug, alarm clock, bed… */
export const home = defineStyle<HomeOptions>({
  name: 'home',
  scale: 0.84,
  colors: ['#fff1dc', '#e8f4ff', '#f3ead8', '#ffe8ef', '#e6f5e1', '#efe6ff', '#2b2540', '#1f3346'],
  defaults: { kind: 'random', smoke: 'random' },
  variants: { kind: KINDS, smoke: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const smoke = pick('smoke', [true, false])

    let [cx, cy, r] = [50, 52, 28]
    let [c1, c2] = ['#ffe3b0', '#f2a65a']
    let back = ''
    let surface = ''
    let front = ''
    let body = ''
    let [ey, gap, my, s] = [50, 10, 59, 0.95]
    const wisp = (x: number, y: number) =>
      `<g data-lv-float="" opacity=".85">${S(`M${x} ${y}c-4 -3 4 -5 0 -8s4 -5 0 -7`, '#fff', 4.5)}${S(`M${x} ${y}c-4 -3 4 -5 0 -8s4 -5 0 -7`, '#c9d3e6', 1.6)}</g>`
    let sky = ''

    switch (kind) {
      case 'house': {
        ;[c1, c2] = ['#fff4dc', '#f5c98a']
        body = R(20, 44, 60, 44, 6)
        ;[cx, cy, r] = [50, 64, 28]
        const roofC = rand.pick(['#ff7b6b', '#6b8cff', '#4fbf8a'])
        back = O(R(62, 24, 11, 16, 2), '#c97a5a') + (smoke ? wisp(67.5, 22) : '')
        front = O('M50 14L88 46Q90 50 86 50H14Q10 50 12 46Z', roofC) + P('M50 20L80 46H70L50 28Z', '#fff', ' opacity=".2"') +
          O(R(43, 26, 14, 14, 7), '#bfe6ff', 3.5) + S('M50 26V40M43 33H57', OL, 1.6)
        surface = `<rect x="66" y="66" width="12" height="22" rx="5" fill="#c97a5a" opacity=".5"/>`
        ;[ey, gap, my, s] = [62, 9, 71, 0.9]
        cx = 46
        break
      }
      case 'lamp': {
        ;[c1, c2] = rand.pick([['#fff3b8', '#ffb84d'], ['#ffd6e4', '#ff7fa6'], ['#d8f3e6', '#5fc49a']])
        body = 'M32 14H68Q72 14 74 18L86 54Q88 60 82 60H18Q12 60 14 54L26 18Q28 14 32 14Z'
        ;[cx, cy, r] = [50, 38, 30]
        back = `<circle cx="50" cy="40" r="44" fill="#ffe27a" opacity=".18"/>` + O(R(46, 58, 8, 22, 3), '#c9a27a') + O('M30 90Q30 78 50 78Q70 78 70 90Z', '#a77b56') + S('M66 60V72', OL, 2.2) + C(66, 74, 2.6, '#ffd23f', ` stroke="${OL}" stroke-width="1.6"`)
        surface = `<rect x="0" y="48" width="100" height="5" fill="#fff" opacity=".35"/><rect x="0" y="20" width="100" height="3" fill="#fff" opacity=".3"/>`
        ;[ey, gap, my, s] = [35, 9, 44, 0.9]
        break
      }
      case 'sofa': {
        ;[c1, c2] = rand.pick([['#ffc9b0', '#ec7a5c'], ['#b9d6ff', '#5b8de8'], ['#cdeec0', '#6cbf5a']])
        body = R(20, 26, 60, 46, 10)
        ;[cx, cy, r] = [50, 48, 30]
        const arm = (x: number) => O(R(x, 46, 18, 32, 8), c2)
        back = O(R(20, 78, 6, 10, 2), '#8a5a3c') + O(R(74, 78, 6, 10, 2), '#8a5a3c')
        front = O(R(16, 62, 68, 18, 6), c1) + arm(8) + arm(74) + S('M50 64V78', OL, 1.6, ' opacity=".4"')
        surface = C(36, 40, 1.4, OL, ' opacity=".25"') + C(64, 40, 1.4, OL, ' opacity=".25"')
        ;[ey, gap, my, s] = [42, 9.5, 51, 0.9]
        break
      }
      case 'door': {
        ;[c1, c2] = rand.pick([['#ffd8a8', '#c97a3e'], ['#bfe4ff', '#4a8fd8'], ['#ffc2c2', '#d9534f']])
        body = 'M26 34Q26 10 50 10Q74 10 74 34V86H26Z'
        ;[cx, cy, r] = [50, 48, 30]
        back = O(R(22, 84, 56, 5, 2.5), '#9aa3b5', 4)
        surface = `<rect x="32" y="62" width="36" height="22" rx="3" fill="none" stroke="${OL}" stroke-width="1.6" opacity=".3"/>` +
          P('M36 28Q36 18 50 18Q64 18 64 28Z', '#fff', ' opacity=".35"')
        front = C(66, 56, 3.4, '#ffd23f', ` stroke="${OL}" stroke-width="2"`)
        ;[ey, gap, my, s] = [40, 8.5, 49, 0.85]
        break
      }
      case 'key': {
        ;[c1, c2] = ['#fff1a8', '#e8a92c']
        ;[cx, cy, r] = [50, 36, 25]
        back = O('M44 58H56V88Q56 92 52 92H48Q44 92 44 88Z M56 68H66V74H56Z M56 80H63V86H56Z', '#e8a92c', 5)
        front = C(50, 18, 3.5, '#f3e6c4', ` stroke="${OL}" stroke-width="2"`)
        ;[ey, gap, my, s] = [36, 9, 45, 0.9]
        break
      }
      case 'mug': {
        ;[c1, c2] = rand.pick([['#ffffff', '#cfd9ea'], ['#ffd6e4', '#ff8fb1'], ['#d4ecff', '#6fa8e8']])
        body = 'M18 36H72V76Q72 88 60 88H30Q18 88 18 76Z'
        ;[cx, cy, r] = [45, 62, 28]
        back = `<path d="M70 48H78Q88 48 88 60Q88 72 76 72H70" stroke="${OL}" stroke-width="12" fill="none"/><path d="M70 48H78Q88 48 88 60Q88 72 76 72H70" stroke="${c2}" stroke-width="5" fill="none"/>` +
          (smoke ? wisp(34, 30) + wisp(54, 28) : '')
        surface = `<rect x="10" y="36" width="70" height="7" fill='#8a5a3c'/>` + `<rect x="10" y="43" width="70" height="2.4" fill="${OL}" opacity=".15"/>`
        ;[ey, gap, my, s] = [60, 9, 69, 0.9]
        break
      }
      case 'clock': {
        ;[c1, c2] = rand.pick([['#ffd0c8', '#ff6b5b'], ['#c8e6ff', '#4a90e2'], ['#d4f5d0', '#4fbf6a']])
        ;[cx, cy, r] = [50, 54, 28]
        const bell = (x: number, k: number) => `<g transform="rotate(${k * 30} ${x} 26)">${O('M' + (x - 11) + ' 28Q' + (x - 11) + ' 16 ' + x + ' 16Q' + (x + 11) + ' 16 ' + (x + 11) + ' 28Z', '#ffd23f')}</g>`
        back = bell(28, -1) + bell(72, 1) + S('M30 80L22 90M70 80L78 90', OL, 5)
        surface = C(50, 54, 21, '#fff', ' opacity=".85"') + [0, 90, 180, 270].map((a) => `<rect x="49" y="35" width="2" height="4" rx="1" fill="${OL}" opacity=".6" transform="rotate(${a} 50 54)"/>`).join('')
        front = O('M47 23H53V28H47Z', '#ffd23f', 3)
        ;[ey, gap, my, s] = [52, 9, 61, 0.9]
        break
      }
      case 'bed': {
        ;[c1, c2] = rand.pick([['#ffe0c2', '#d99a6c'], ['#d8e2ff', '#7d95e0']])
        body = 'M26 16H74Q84 16 84 26V60H16V26Q16 16 26 16Z'
        ;[cx, cy, r] = [50, 38, 30]
        const sheet = rand.pick(['#8fd3ff', '#ffb3c7', '#a8e6b8'])
        back = O(R(18, 76, 6, 8, 2), '#8a5a3c') + O(R(76, 76, 6, 8, 2), '#8a5a3c')
        front = O(R(12, 56, 76, 24, 8), '#fff8ee') + O('M32 60H88V72Q88 80 80 80H32Z', sheet) + S('M32 66H88', '#fff', 2, ' opacity=".6"') + O(R(15, 59, 17, 10, 5), '#ffffff', 4)
        ;[ey, gap, my, s] = [36, 10, 46, 0.95]
        break
      }
    }
    if (!body) body = `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`
    const [hx, hy] = kind === 'house' ? [30, 54] : kind === 'mug' ? [28, 52] : kind === 'sofa' ? [30, 34] : [cx - r * 0.42, cy - r * 0.5]
    const fx = cx
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

    return (
      `<defs><radialGradient id="${id}-g" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>` +
      `<clipPath id="${id}-p"><path d="${body}"/></clipPath></defs>` +
      (sky ? `<g data-lv-depth=".05">${sky}</g>` : '') +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".3" data-lv-tilt="4">` +
      back +
      `<path d="${body}" fill="${OL}" stroke="${OL}" stroke-width="5.5" stroke-linejoin="round"/>` +
      `<path d="${body}" fill="url(#${id}-g)"/>` +
      `<g clip-path="url(#${id}-p)">${surface}${C(cx + r * 0.35, cy + r * 0.45, r * 0.9, 'rgba(0,0,0,.08)')}</g>` +
      E(hx, hy, r * 0.22, r * 0.11, '#fff', -35, ' opacity=".6"') +
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
