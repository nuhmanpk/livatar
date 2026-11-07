import { defineStyle, n, smoothPath } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['earth', 'saturn', 'mars', 'moon', 'sun', 'gas', 'comet', 'star', 'heart', 'cloud'] as const
type Kind = (typeof KINDS)[number]

export interface PlanetOptions {
  kind?: Kind | 'random'
  /** A tiny moon orbiting nearby. */
  satellite?: boolean | 'random'
  /** Twinkling background stars. */
  stars?: boolean | 'random'
}

const INK = '#1f1a2e'
const OL = '#1f2a44'

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
const twinkle = (x: number, y: number, r: number, fill: string) =>
  P(`M${n(x)} ${n(y - r)}Q${n(x + r * 0.2)} ${n(y - r * 0.2)} ${n(x + r)} ${n(y)}Q${n(x + r * 0.2)} ${n(y + r * 0.2)} ${n(x)} ${n(y + r)}Q${n(x - r * 0.2)} ${n(y + r * 0.2)} ${n(x - r)} ${n(y)}Q${n(x - r * 0.2)} ${n(y - r * 0.2)} ${n(x)} ${n(y - r)}Z`, fill)

/** Cute planets and space things — earth, ringed saturn, the sun, comets… */
export const planet = defineStyle<PlanetOptions>({
  name: 'planet',
  colors: ['#1d2150', '#2b1d4e', '#13314a', '#3a2363', '#cfe3ff', '#ffe1f0', '#e5dcff', '#d6f5ee'],
  defaults: { kind: 'random', satellite: 'random', stars: true },
  variants: { kind: KINDS, satellite: [true, false], stars: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const satellite = pick('satellite', [true, false, false])
    const stars = pick('stars', [true, false])

    let [cx, cy, r] = [50, 52, 28]
    let [c1, c2] = ['#7ec8ff', '#3a86ff']
    let back = '' // behind the body (rings, rays, tail)
    let surface = '' // clipped to the body
    let front = '' // over the body, under the face
    let body = ''
    let [ey, gap, my, s] = [50, 10, 59, 0.95]

    switch (kind) {
      case 'earth':
        ;[c1, c2] = ['#8fd3ff', '#2f7de1']
        surface =
          P('M18 40C24 30 34 30 38 36C42 42 36 48 30 50C26 52 28 60 22 62C16 56 14 46 18 40Z', '#5fcf7a') +
          P('M56 26C64 24 72 28 74 34C70 38 62 36 58 40C54 38 52 30 56 26Z', '#5fcf7a') +
          P('M60 66C66 62 76 62 78 68C74 76 64 80 58 76C56 72 56 68 60 66Z', '#5fcf7a') +
          E(48, 79, 12, 3, '#fff', 0, ' opacity=".85"')
        break
      case 'saturn': {
        ;[c1, c2] = ['#ffe3a3', '#f2a65a']
        surface = [36, 46, 66, 74].map((y, i) => `<rect x="10" y="${y}" width="80" height="${i % 2 ? 3 : 4.5}" fill="#d98a4a" opacity=".35"/>`).join('')
        const ring = (half: 'back' | 'front') =>
          `<g transform="rotate(-14 50 62)"><path d="${half === 'back' ? 'M4 62A46 11 0 0 1 96 62' : 'M96 62A46 11 0 0 1 4 62'}" stroke="${OL}" stroke-width="9.5" fill="none" stroke-linecap="round"/>` +
          `<path d="${half === 'back' ? 'M4 62A46 11 0 0 1 96 62' : 'M96 62A46 11 0 0 1 4 62'}" stroke="#c9b6ff" stroke-width="4.5" fill="none" stroke-linecap="round"/>` +
          `<path d="${half === 'back' ? 'M9 62A41 8.5 0 0 1 91 62' : 'M91 62A41 8.5 0 0 1 9 62'}" stroke="#fff" stroke-width="1" fill="none" opacity=".6"/></g>`
        back = ring('back')
        front = `<g data-lv-depth=".75">${ring('front')}</g>`
        ;[ey, my] = [47, 55]
        break
      }
      case 'mars':
        ;[c1, c2] = ['#ffab7a', '#e0563a']
        surface = C(36, 62, 4.5, 'rgba(120,30,20,.25)') + C(68, 44, 3.4, 'rgba(120,30,20,.25)') + C(62, 72, 2.6, 'rgba(120,30,20,.25)') + E(50, 25, 14, 4.5, '#fff', 0, ' opacity=".9"')
        break
      case 'moon':
        ;[c1, c2] = ['#f1f0ff', '#b9b3d9']
        surface = [[34, 40, 5], [68, 60, 6], [62, 34, 3], [36, 70, 3.5], [74, 44, 2.4]]
          .map(([x, y, rr]) => C(x, y, rr, '#a39cc8', ' opacity=".55"') + C(x + rr * 0.25, y + rr * 0.25, rr * 0.7, '#cfcae8', ' opacity=".6"'))
          .join('')
        break
      case 'sun': {
        // big warm body, soft rounded rays that sway with the gaze, and a glow halo
        ;[c1, c2] = ['#fff3a0', '#ffb703']
        ;[cx, cy, r] = [50, 51, 30]
        const ray = (i: number) => {
          const long = i % 2 === 0
          const tip = long ? 3 : 9
          return `<path d="M43 ${cy - r + 5}Q50 ${tip - 3} 57 ${cy - r + 5}Z" transform="rotate(${i * 30} ${cx} ${cy})"/>`
        }
        let rays = ''
        for (let i = 0; i < 12; i++) rays += ray(i)
        back =
          `<circle cx="${cx}" cy="${cy}" r="${r + 15}" fill="#ffd23f" opacity=".22"/>` +
          `<g data-lv-depth=".12" data-lv-tilt="10"><g fill="${OL}" stroke="${OL}" stroke-width="5" stroke-linejoin="round">${rays}</g>` +
          `<g fill="#ffb02e" stroke="#ffb02e" stroke-width="1.5" stroke-linejoin="round">${rays}</g></g>`
        surface = E(38, 34, 9, 5, '#fff', -30, ' opacity=".55"') + C(70, 66, 3, '#ff9f1c', ' opacity=".35"') + C(30, 62, 2.2, '#ff9f1c', ' opacity=".3"')
        ;[ey, gap, my, s] = [49, 10.5, 59, 1]
        break
      }
      case 'gas': {
        const pal = rand.pick([['#ffc8e8', '#b06ad9', '#8a4fd1'], ['#b7f0e4', '#3fb6a8', '#2a8f9e'], ['#ffe0b8', '#e58e5a', '#c4683f']])
        ;[c1, c2] = [pal[0], pal[1]]
        surface =
          S('M18 36Q34 32 50 36T82 36', pal[2], 3.2, ' opacity=".35"') +
          S('M16 44Q34 40 50 44T84 44', '#fff', 2.4, ' opacity=".35"') +
          S('M16 68Q34 64 50 68T84 68', pal[2], 4, ' opacity=".35"') +
          E(68, 72, 6, 3.4, pal[2], 0, ' opacity=".55"') +
          S('M22 76Q36 73 50 76', '#fff', 2, ' opacity=".35"')
        break
      }
      case 'comet': {
        ;[c1, c2] = ['#e6fbff', '#7fd3ff']
        ;[cx, cy, r] = [57, 57, 23]
        const tail = 'M40 40C30 22 14 10 2 6C14 20 18 26 20 30C10 24 4 24 -2 26C10 34 24 46 36 56Z'
        back = `<g data-lv-float=""><path d="${tail}" fill="${OL}" stroke="${OL}" stroke-width="5.5" stroke-linejoin="round"/><path d="${tail}" fill="#a8e6ff"/>` +
          P('M38 44C30 32 20 22 10 16C22 28 26 34 30 40Z', '#fff', ' opacity=".7"') + `</g>`
        ;[ey, gap, my, s] = [56, 8.5, 64, 0.85]
        break
      }
      case 'heart': {
        body = 'M50 86C34 74 14 60 14 40C14 26 24 18 34 18C42 18 47 23 50 29C53 23 58 18 66 18C76 18 86 26 86 40C86 60 66 74 50 86Z'
        ;[c1, c2] = ['#ffb3c7', '#ff4d7a']
        ;[cx, cy, r] = [50, 50, 30]
        ;[ey, gap, my, s] = [46, 10, 56, 0.95]
        break
      }
      case 'cloud': {
        body = 'M24 74C14 74 8 67 8 59C8 51 14 45 22 45C22 33 31 25 42 25C50 25 57 29 60 36C63 34 66 33 70 33C81 33 89 42 89 52C95 55 96 60 96 63C96 69 91 74 84 74Z'
        ;[c1, c2] = ['#ffffff', '#bcd7f5']
        ;[cx, cy, r] = [52, 52, 26]
        surface = E(36, 40, 10, 4, '#fff', -20, ' opacity=".8"')
        ;[ey, gap, my, s] = [54, 10, 63, 0.9]
        break
      }
      case 'star': {
        const pts: [number, number][] = []
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2
          const rr = i % 2 ? 19 : 38
          pts.push([50 + Math.cos(a) * rr, 55 + Math.sin(a) * rr])
        }
        body = smoothPath(pts)
        ;[c1, c2] = ['#fff3a0', '#ffc233']
        ;[ey, gap, my, s] = [53, 8.5, 61, 0.9]
        break
      }
    }
    if (!body) body = `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`
    if (kind === 'comet') {
      gap = 8.5
    }
    const fx = kind === 'comet' ? cx : 50

    let sky = ''
    if (stars)
      for (let i = 0; i < 6; i++) {
        const a = rand.float(0, Math.PI * 2)
        const d = rand.float(38, 46)
        sky += twinkle(50 + Math.cos(a) * d, 50 + Math.sin(a) * d, rand.float(1.4, 2.6), '#fff8d6')
      }
    const moonSvg = satellite
      ? `<g data-lv-float=""><g data-lv-depth=".9">${C(kind === 'comet' ? 80 : 82, 22, 6, '#e9e6ff', ` stroke="${OL}" stroke-width="2.4"`)}${C(80, 21, 1.5, '#b9b3d9')}${C(84, 24.5, 1, '#b9b3d9')}</g></g>`
      : ''

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
      E(cx - r * 0.42, cy - r * 0.5, r * 0.22, r * 0.11, '#fff', -35, ' opacity=".6"') +
      front +
      `<g data-lv-depth=".6">` +
      eyes +
      faceBrows(F, mood) +
      blush +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g>` +
      moonSvg +
      `<g data-lv-shy="" opacity="0">${hand(fx - gap + 1, -1)}${hand(fx + gap - 1, 1)}</g>` +
      `</g></g>`
    )
  },
})
