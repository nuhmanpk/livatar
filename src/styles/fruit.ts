import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['apple', 'banana', 'cherry', 'lemon', 'peach', 'grape', 'orange', 'pear', 'pineapple', 'kiwi'] as const
type Kind = (typeof KINDS)[number]

export interface FruitOptions {
  kind?: Kind | 'random'
  /** A little green leaf by the stem (ignored on banana, pineapple and kiwi slices). */
  leaf?: boolean | 'random'
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
const stem = (d: string) => S(d, OL, 7) + S(d, '#8a5a3b', 3)
const leafAt = (x: number, y: number, rot: number, sz = 1) => {
  const d = `M${n(x)} ${n(y)}C${n(x + 4 * sz)} ${n(y - 9 * sz)} ${n(x + 14 * sz)} ${n(y - 11 * sz)} ${n(x + 20 * sz)} ${n(y - 8 * sz)}C${n(x + 16 * sz)} ${n(y + 1 * sz)} ${n(x + 7 * sz)} ${n(y + 4 * sz)} ${n(x)} ${n(y)}Z`
  return `<g transform="rotate(${n(rot)} ${n(x)} ${n(y)})">${O(d, '#6fd36b', 4.5)}${S(`M${n(x + 2 * sz)} ${n(y - 1 * sz)}Q${n(x + 10 * sz)} ${n(y - 6 * sz)} ${n(x + 17 * sz)} ${n(y - 7.5 * sz)}`, '#3fa34d', 1.4)}</g>`
}

/** Cheerful fruit — apples, bananas, cherries, pineapples, kiwi slices… */
export const fruit = defineStyle<FruitOptions>({
  name: 'fruit',
  scale: 0.84,
  colors: ['#fff1c9', '#ffe0e6', '#d9f7d6', '#dcecff', '#efe2ff', '#ffe6cc', '#c9f0ea', '#fbe7ff'],
  defaults: { kind: 'random', leaf: 'random' },
  variants: { kind: KINDS, leaf: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const leaf = pick('leaf', [true, true, false])

    let [cx, cy, r] = [50, 56, 30]
    let [c1, c2] = ['#ff8a8a', '#e63946']
    let body = ''
    let back = ''
    let surface = ''
    let front = ''
    let [ey, gap, my, s] = [54, 10, 63, 0.95]
    let fx = 50

    switch (kind) {
      case 'apple': {
        body = 'M50 32C42 24 18 24 15 50C12 74 32 92 50 86C68 92 88 74 85 50C82 24 58 24 50 32Z'
        ;[c1, c2] = rand.pick([['#ff8f8f', '#e0303f'], ['#c8f27a', '#5fb33a']])
        back = stem('M50 34Q49 24 54 15')
        if (leaf) back += leafAt(54, 22, -10, 0.95)
        surface = S('M44 34Q50 38 56 34', 'rgba(0,0,0,.18)', 2.4)
        ;[cx, cy, r] = [50, 58, 33]
        ;[ey, my] = [56, 65]
        break
      }
      case 'banana': {
        body = 'M14 30C12 64 40 90 76 80C86 77 92 70 90 62C86 58 82 62 76 63C54 66 34 52 28 28C26 20 14 20 14 30Z'
        ;[c1, c2] = ['#fff3a3', '#f7c531']
        back = O('M17 26L14 16Q18 12 23 15L26 25Z', '#8a5a3b', 4.5)
        front = O('M88 62Q92 66 89 70L85 68Z', '#6b4a2e', 3.5)
        surface = S('M22 34C26 58 44 74 74 74', '#e3a91f', 2.2, ' opacity=".55"')
        ;[cx, cy, r] = [44, 58, 30]
        fx = 44
        ;[ey, gap, my, s] = [60, 8, 68, 0.78]
        break
      }
      case 'cherry': {
        ;[cx, cy, r] = [58, 64, 24]
        ;[c1, c2] = ['#ff7a8a', '#c9184a']
        const twin = `<defs><radialGradient id="${id}-t" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#ff7a8a"/><stop offset="1" stop-color="#a4133c"/></radialGradient></defs>`
        back =
          twin +
          stem('M26 64Q30 34 52 12') +
          stem('M56 42Q56 26 52 12') +
          (leaf ? leafAt(52, 13, 10, 0.95) : '') +
          `<g data-lv-depth=".15">${O(ell(24, 72, 15, 15), `url(#${id}-t)`)}${E(19, 66, 4, 2.2, '#fff', -35, ' opacity=".6"')}</g>`
        ;[ey, gap, my, s] = [63, 8.5, 71, 0.85]
        fx = 58
        break
      }
      case 'lemon': {
        body = 'M8 56C8 52 12 50 16 48C22 32 35 26 50 26C65 26 78 32 84 48C88 50 92 52 92 56C92 60 88 62 84 64C78 78 65 84 50 84C35 84 22 78 16 64C12 62 8 60 8 56Z'
        ;[c1, c2] = ['#fff7a8', '#f6d02f']
        surface = [[28, 40], [70, 38], [76, 68], [26, 70], [42, 78], [62, 32]].map(([x, y]) => C(x, y, 1.3, '#d9b21f', ' opacity=".6"')).join('')
        if (leaf) back = leafAt(56, 28, -25, 0.9)
        ;[cx, cy, r] = [50, 55, 32]
        ;[ey, my] = [53, 62]
        break
      }
      case 'peach': {
        body = 'M50 30C40 22 16 28 16 54C16 76 32 88 50 88C68 88 84 76 84 54C84 28 60 22 50 30Z'
        ;[c1, c2] = ['#ffd3a8', '#ff8c7a']
        surface = S('M50 32C40 46 40 70 48 88', '#e8645a', 2.4, ' opacity=".45"') + E(68, 70, 14, 12, '#ff6b81', 0, ' opacity=".35"')
        back = stem('M50 33Q50 26 48 20')
        if (leaf) back += leafAt(49, 26, -20, 1)
        ;[cx, cy, r] = [50, 58, 32]
        ;[ey, my] = [58, 67]
        fx = 52
        break
      }
      case 'grape': {
        ;[cx, cy, r] = [50, 64, 22]
        ;[c1, c2] = ['#c9a2ff', '#7b3fc4']
        const g = `<defs><radialGradient id="${id}-t" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#b48cf2"/><stop offset="1" stop-color="#5e2ea3"/></radialGradient></defs>`
        const grape = (x: number, y: number, rr: number) => O(ell(x, y, rr, rr), `url(#${id}-t)`, 4.5) + E(x - rr * 0.35, y - rr * 0.4, rr * 0.3, rr * 0.16, '#fff', -35, ' opacity=".55"')
        back =
          g +
          stem('M50 30Q50 22 54 15') +
          (leaf ? leafAt(52, 21, -15, 0.85) : '') +
          `<g data-lv-depth=".15">` +
          grape(36, 30, 10) + grape(64, 30, 10) + grape(50, 28, 10) +
          grape(24, 46, 11) + grape(76, 46, 11) + grape(36, 44, 11) + grape(64, 44, 11) +
          grape(24, 72, 9) + grape(76, 72, 9) +
          `</g>`
        ;[ey, gap, my, s] = [62, 8.5, 71, 0.85]
        break
      }
      case 'orange': {
        ;[c1, c2] = ['#ffcf7a', '#ff8c1a']
        ;[cx, cy, r] = [50, 56, 31]
        const dots: string[] = []
        for (let i = 0; i < 14; i++) dots.push(C(rand.float(24, 78), rand.float(30, 84), 1.1, '#e8730f', ' opacity=".5"'))
        surface = dots.join('') + C(50, 28, 2, '#c96a10', ' opacity=".7"')
        back = stem('M50 27Q50 22 51 20')
        if (leaf) back += leafAt(51, 24, -15, 0.95)
        ;[ey, my] = [55, 64]
        break
      }
      case 'pear': {
        body = 'M50 22C58 22 62 30 62 38C62 46 82 52 82 70C82 84 68 92 50 92C32 92 18 84 18 70C18 52 38 46 38 38C38 30 42 22 50 22Z'
        ;[c1, c2] = ['#e6f59a', '#a8cf3a']
        back = stem('M50 24Q50 16 54 10')
        if (leaf) back += leafAt(53, 16, -15, 0.85)
        surface = [[34, 62], [66, 76], [44, 82], [60, 54]].map(([x, y]) => C(x, y, 1.2, '#7e9e22', ' opacity=".5"')).join('')
        ;[cx, cy, r] = [50, 66, 28]
        ;[ey, gap, my, s] = [66, 9.5, 75, 0.92]
        break
      }
      case 'pineapple': {
        ;[cx, cy, r] = [50, 65, 25]
        body = ell(50, 65, 27, 25)
        ;[c1, c2] = ['#ffe17a', '#f2a51a']
        const blade = (rot: number, len: number) => `<path d="M45 42Q50 ${42 - len} 55 42Z" transform="rotate(${rot} 50 42)"/>`
        const crown = [-56, -32, -10, 10, 32, 56].map((a, i) => blade(a, i === 2 || i === 3 ? 62 : 48)).join('')
        back =
          `<g data-lv-tilt="8"><g fill="${OL}" stroke="${OL}" stroke-width="5" stroke-linejoin="round">${crown}</g>` +
          `<g fill="#5cc85a" stroke="#5cc85a" stroke-width="1" stroke-linejoin="round">${crown}</g>` +
          `</g>`
        let lat = ''
        for (let k = -4; k <= 4; k++) lat += S(`M${20 + k * 12} 36L${80 + k * 12} 96`, '#d98a12', 1.6, ' opacity=".5"') + S(`M${80 + k * 12} 36L${20 + k * 12} 96`, '#d98a12', 1.6, ' opacity=".5"')
        surface = lat
        ;[ey, gap, my, s] = [64, 9.5, 73, 0.9]
        break
      }
      case 'kiwi': {
        ;[cx, cy, r] = [50, 54, 34]
        ;[c1, c2] = ['#b98a5a', '#7a5230']
        let seeds = ''
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * Math.PI * 2
          seeds += E(50 + Math.cos(a) * 22, 54 + Math.sin(a) * 22, 1.1, 2.1, '#2b2018', (a * 180) / Math.PI + 90)
        }
        surface =
          C(50, 54, 30, '#9edb5a') + C(50, 54, 25, '#7cc443', ' opacity=".5"') +
          seeds + E(50, 56, 14, 11, '#f3ffd9', 0, ' opacity=".9"')
        ;[ey, gap, my, s] = [53, 9, 61, 0.9]
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
    const F: FaceSpec = { x: fx, ey, gap, my, ink: INK, s, eye, extra: [fx + gap + 8, ey - 13] }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${neutralEye(fx - gap, ey)}</g><g data-lv-eye="">${neutralEye(fx + gap, ey)}</g>` : faceEyes(F, mood)
    const mouth =
      mood === 'neutral'
        ? rand.bool(0.5)
          ? S(`M${n(fx - 4.5 * s)} ${my}Q${fx} ${n(my + 4.5 * s)} ${n(fx + 4.5 * s)} ${my}`, INK, 2.1 * s)
          : P(`M${n(fx - 5 * s)} ${my}Q${fx} ${n(my + 9 * s)} ${n(fx + 5 * s)} ${my}Z`, INK, ` stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"`) + E(fx, my + 4 * s, 2.6 * s, 1.5 * s, '#ff7a93')
        : faceMouth(F, mood)
    const blush = E(fx - gap - 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ` opacity="${mood === 'happy' ? '.3' : '.45'}"`) + E(fx + gap + 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ` opacity="${mood === 'happy' ? '.3' : '.45'}"`)

    const hand = (x: number, side: 1 | -1) =>
      `<g transform="rotate(${side * 12} ${n(x)} ${n(ey + 2)})">` +
      `<rect x="${n(x - 5.5)}" y="${n(ey + 6)}" width="11" height="40" rx="5.5" fill="${c2}" stroke="${OL}" stroke-width="2.4"/>` +
      `<rect x="${n(x - 8.5)}" y="${n(ey - 8)}" width="17" height="19" rx="8" fill="${c1}" stroke="${OL}" stroke-width="2.4"/>` +
      `</g>`

    return (
      `<defs><radialGradient id="${id}-g" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>` +
      `<clipPath id="${id}-p"><path d="${body}"/></clipPath></defs>` +
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
      `<g data-lv-shy="" opacity="0">${hand(fx - gap + 1, -1)}${hand(fx + gap - 1, 1)}</g>` +
      `</g></g>`
    )
  },
})
