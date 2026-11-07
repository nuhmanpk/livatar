import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['coin', 'wallet', 'piggy', 'card', 'receipt', 'gem', 'bag', 'bill'] as const
type Kind = (typeof KINDS)[number]

export interface MoneyOptions {
  kind?: Kind | 'random'
  /** Twinkling sparkles around the avatar. */
  sparkle?: boolean | 'random'
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
const twinkle = (x: number, y: number, r: number, fill: string) =>
  P(`M${n(x)} ${n(y - r)}Q${n(x + r * 0.2)} ${n(y - r * 0.2)} ${n(x + r)} ${n(y)}Q${n(x + r * 0.2)} ${n(y + r * 0.2)} ${n(x)} ${n(y + r)}Q${n(x - r * 0.2)} ${n(y + r * 0.2)} ${n(x - r)} ${n(y)}Q${n(x - r * 0.2)} ${n(y - r * 0.2)} ${n(x)} ${n(y - r)}Z`, fill)

/** Cute money & fintech things — coins, wallets, piggy banks, cards, gems… */
export const money = defineStyle<MoneyOptions>({
  name: 'money',
  scale: 0.84,
  colors: ['#e8f8ee', '#fff4d6', '#e5f0ff', '#f3e8ff', '#d6f5ee', '#ffe8e0', '#1d3b34', '#22304f'],
  defaults: { kind: 'random', sparkle: 'random' },
  variants: { kind: KINDS, sparkle: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const sparkle = pick('sparkle', [true, false])

    let [cx, cy, r] = [50, 52, 28]
    let [c1, c2] = ['#ffe58a', '#f2b233']
    let back = ''
    let surface = ''
    let front = ''
    let body = ''
    let [ey, gap, my, s] = [50, 10, 59, 0.95]

    switch (kind) {
      case 'coin': {
        ;[c1, c2] = ['#fff1a8', '#f4b52c']
        // thick edge behind the face
        back = O(`M22 56a28 28 0 1 0 56 0a28 28 0 1 0 -56 0Z`, '#d98f1a', 5.5)
        surface =
          `<circle cx="50" cy="52" r="22.5" fill="none" stroke="#d99a22" stroke-width="2.4" opacity=".7"/>` +
          twinkle(50, 34, 4, '#e09a1c') +
          [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="49" y="25" width="2" height="2.6" rx="1" fill="#e09a1c" opacity=".5" transform="rotate(${i * 45 + 22.5} 50 52)"/>`).join('')
        ;[ey, my] = [50, 59]
        break
      }
      case 'wallet': {
        ;[c1, c2] = ['#a8e6b8', '#3fae6a']
        body = R(14, 32, 72, 52, 10)
        ;[cx, cy, r] = [50, 58, 30]
        back = `<g transform="rotate(-8 48 30)">${O(R(22, 20, 50, 24, 3), '#b9f0c8')}${C(47, 30, 5, '#8fd9a6')}</g>`
        surface = `<rect x="10" y="32" width="80" height="9" fill="#2f8f55" opacity=".45"/>`
        front = O(R(64, 50, 26, 20, 7), '#58c27f', 4.5) + C(72, 60, 3, '#ffd23f', ` stroke="${OL}" stroke-width="1.8"`)
        ;[ey, gap, my, s] = [57, 9, 66, 0.9]
        cx = 42
        break
      }
      case 'piggy': {
        ;[c1, c2] = ['#ffd3e0', '#ff8fb1']
        body = 'M50 30C72 30 86 42 86 58C86 72 72 80 50 80C28 80 14 72 14 58C14 42 28 30 50 30Z'
        ;[cx, cy, r] = [50, 56, 30]
        const leg = (x: number) => O(R(x, 70, 11, 16, 4), '#ff8fb1', 4.5)
        const ear = (x: number, k: number) => O(`M${x - 8 * k} 38L${x - 2 * k} 20L${x + 9 * k} 33Z`, '#ff9fbd', 5)
        back = leg(22) + leg(38) + leg(54) + leg(68) + ear(32, 1) + ear(68, -1) + S('M86 56q8 -4 4 -9t-1 -4', OL, 3)
        surface = `<rect x="42" y="34" width="16" height="3.4" rx="1.7" fill="#c9557d" opacity=".75"/>`
        front = E(50, 63, 8, 5.5, '#ffb3c9', 0, ` stroke="${OL}" stroke-width="2.4"`) + E(47.2, 63, 1.4, 2, '#c9557d') + E(52.8, 63, 1.4, 2, '#c9557d')
        ;[ey, gap, my, s] = [52, 13, 71, 0.9]
        break
      }
      case 'card': {
        ;[c1, c2] = rand.pick([['#b9c8ff', '#5b6cff'], ['#d4b8ff', '#8a4fd1'], ['#9ff0dc', '#22a88a']])
        body = R(8, 26, 84, 54, 9)
        ;[cx, cy, r] = [50, 53, 32]
        surface = `<rect x="4" y="34" width="92" height="8" fill="${OL}" opacity=".55"/>` +
          `<rect x="16" y="66" width="22" height="3" rx="1.5" fill="#fff" opacity=".55"/><rect x="16" y="72" width="14" height="3" rx="1.5" fill="#fff" opacity=".4"/>` +
          C(76, 70, 4.5, '#ff6b6b', ' opacity=".8"') + C(82, 70, 4.5, '#ffc233', ' opacity=".8"')
        front = `<rect x="15" y="47" width="14" height="11" rx="2.5" fill="#ffd66b" stroke="${OL}" stroke-width="2"/>` + S('M15 52.5H29M22 47V58', '#c99a2a', 1.2)
        ;[ey, gap, my, s] = [53, 8.5, 61, 0.85]
        cx = 56
        break
      }
      case 'receipt': {
        ;[c1, c2] = ['#ffffff', '#dfe6f2']
        let zz = 'M24 12H76V84'
        for (let i = 0; i < 6; i++) zz += `L${n(76 - (i + 0.5) * (52 / 6))} 90L${n(76 - (i + 1) * (52 / 6))} 84`
        body = zz + 'Z'
        ;[cx, cy, r] = [50, 48, 30]
        surface = [22, 28].map((y, i) => `<rect x="32" y="${y}" width="${i ? 22 : 36}" height="2.6" rx="1.3" fill="#9aa8c4" opacity=".7"/>`).join('') +
          `<rect x="32" y="72" width="36" height="1.6" fill="#9aa8c4" opacity=".7"/><rect x="32" y="76" width="14" height="3" rx="1.5" fill="#3fae6a"/><rect x="56" y="76" width="12" height="3" rx="1.5" fill="#3fae6a"/>`
        ;[ey, gap, my, s] = [45, 9, 54, 0.9]
        break
      }
      case 'gem': {
        ;[c1, c2] = rand.pick([['#b8f3ff', '#36b4e5'], ['#ffc2e2', '#e64f9b'], ['#c9ffcf', '#2fbf71']])
        body = 'M30 24H70L88 44L50 88L12 44Z'
        ;[cx, cy, r] = [50, 52, 30]
        surface = P('M30 24L40 44H12Z', '#fff', ' opacity=".35"') + P('M70 24L60 44H88Z', '#000', ' opacity=".08"') + P('M40 44L50 24L60 44Z', '#fff', ' opacity=".2"') +
          P('M12 44H88L50 88Z', '#fff', ' opacity=".1"') + S('M12 44H88', '#fff', 1.4, ' opacity=".6"')
        ;[ey, gap, my, s] = [52, 9, 61, 0.85]
        break
      }
      case 'bag': {
        ;[c1, c2] = ['#f6dcae', '#c99556']
        body = 'M40 34C24 42 14 56 16 70C18 82 32 88 50 88C68 88 82 82 84 70C86 56 76 42 60 34Z'
        ;[cx, cy, r] = [50, 62, 30]
        back = O('M40 34C34 26 34 16 42 14Q50 20 58 14C66 16 66 26 60 34Z', '#d9a865')
        front = O('M37 34Q50 39 63 34L64 39Q50 44 36 39Z', '#e85d75', 4) + twinkle(70, 78, 4, '#a8733a')
        ;[ey, gap, my, s] = [62, 10, 71, 0.95]
        break
      }
      case 'bill': {
        ;[c1, c2] = ['#c8f2c2', '#5cbf73']
        body = R(8, 28, 84, 48, 6)
        ;[cx, cy, r] = [50, 52, 30]
        back = `<g transform="rotate(-7 50 50)">${O(R(10, 24, 80, 44, 6), '#8fd99a')}</g>`
        surface = `<rect x="13" y="33" width="74" height="38" rx="3" fill="none" stroke="#2f8f55" stroke-width="1.6" opacity=".55"/>` +
          C(50, 52, 15, '#e6fbe3', ' opacity=".55"') +
          [[18, 39], [82, 39], [18, 65], [82, 65]].map(([x, y]) => C(x, y, 2.8, '#2f8f55', ' opacity=".5"')).join('')
        ;[ey, gap, my, s] = [49, 8.5, 57, 0.85]
        break
      }
    }
    if (!body) body = `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`
    const [hx, hy] = kind === 'gem' ? [30, 34] : kind === 'receipt' ? [32, 18] : [cx - r * 0.42, cy - r * 0.5]

    let sky = ''
    if (sparkle)
      for (let i = 0; i < 5; i++) {
        const a = rand.float(0, Math.PI * 2)
        const d = rand.float(38, 44)
        sky += `<g data-lv-float="">${twinkle(50 + Math.cos(a) * d, 50 + Math.sin(a) * d, rand.float(1.6, 2.8), rand.pick(['#ffd23f', '#ffffff', '#8fe3b0']))}</g>`
      }
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
