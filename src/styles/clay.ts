import { defineStyle, n, safe } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const HAIRS = ['short', 'curly', 'bun', 'bald', 'beanie'] as const
const SKINS = ['#ffd9c2', '#f5c3a0', '#e3a27a', '#c27f57', '#8f5a3c', '#b8e3c9', '#c9c2f5']
const HAIR_C = ['#4a3328', '#2e2430', '#a8673f', '#e8c37a', '#e98a8a', '#8a7bd6']
const OUTFIT = ['#9ad0f5', '#f5a8c0', '#b7e4a8', '#ffd28a', '#c3b2f5', '#f7b993']

export interface ClayOptions {
  skin?: string
  hair?: (typeof HAIRS)[number] | 'random'
  hairColor?: string
  /** Sweater color. */
  outfit?: string
}

const INK = '#3a2a33'

const shade = (c: string, k: number) => {
  const m = /^#([\da-f]{6})$/i.exec(c)
  if (!m) return c
  const v = parseInt(m[1], 16)
  const f = (x: number) => Math.max(0, Math.min(255, Math.round(k > 1 ? x + (255 - x) * (k - 1) : x * k))).toString(16).padStart(2, '0')
  return `#${f(v >> 16)}${f((v >> 8) & 255)}${f(v & 255)}`
}
const E = (cx: number, cy: number, rx: number, ry: number, fill: string, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`

/** Soft matte claymorphism people — gradients only, no outlines. */
export const clay = defineStyle<ClayOptions>({
  name: 'clay',
  colors: ['#f3e8ff', '#e0f2fe', '#fde2e4', '#e2f0cb', '#fff1d6', '#dfe7fd', '#fce1f4', '#d8f3ef'],
  defaults: { hair: 'random' },
  variants: { skin: SKINS, hair: HAIRS, hairColor: HAIR_C, outfit: OUTFIT },
  render({ rand, pick, id, mood, options: o }) {
    const skin = safe(o.skin && o.skin !== 'random' ? o.skin : rand.pick(SKINS))
    const hairC = safe(o.hairColor && o.hairColor !== 'random' ? o.hairColor : rand.pick(HAIR_C))
    const outfit = safe(o.outfit && o.outfit !== 'random' ? o.outfit : rand.pick(OUTFIT))
    const hair = pick('hair', HAIRS)
    const hat = rand.pick(OUTFIT.filter((c) => c !== outfit))

    // one radial "clay" gradient per material: lit top-left, soft dark rim
    const g = (k: string, c: string) =>
      `<radialGradient id="${id}-${k}" cx=".38" cy=".3" r=".78"><stop offset="0" stop-color="${shade(c, 1.22)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, 0.78)}"/></radialGradient>`
    const u = (k: string) => `url(#${id}-${k})`
    const defs =
      g('s', skin) + g('h', hairC) + g('o', outfit) + g('t', hat) +
      `<radialGradient id="${id}-d"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="${id}-l" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`
    const glow = (x: number, y: number, rx: number, ry: number) => E(x, y, rx, ry, u('l'))

    const head = E(50, 47, 22.5, 24.5, u('s'))
    let back = ''
    let front = ''
    switch (hair) {
      case 'short':
        front = P('M26.5 46C24 27 36 19.5 50 19.5C64 19.5 76 27 73.5 46C71 37 64 32.5 57 32C49 36.5 38 36 31.5 38.5C29 41 27.5 43 26.5 46Z', u('h'))
        break
      case 'curly': {
        let c = ''
        for (let i = 0; i < 11; i++) {
          const a = Math.PI * (1.02 + (i / 10) * 0.96)
          c += C(50 + Math.cos(a) * 21, 44 + Math.sin(a) * 22, 7.4, u('h'))
        }
        front = c + C(42, 25, 7, u('h')) + C(56, 24, 7, u('h'))
        break
      }
      case 'bun':
        back = C(50, 17, 9.5, u('h'))
        front = P('M27 45C25 28 36 21 50 21C64 21 75 28 73 45C70 35 62 30 50 30C38 30 30 35 27 45Z', u('h'))
        break
      case 'beanie':
        front =
          P('M25.5 42C25.5 25 36 17 50 17C64 17 74.5 25 74.5 42Z', u('t')) +
          `<rect x="23.5" y="36" width="53" height="10" rx="5" fill="${u('t')}"/>` +
          `<rect x="23.5" y="36" width="53" height="10" rx="5" fill="#000" opacity=".06"/>` +
          C(50, 15, 5.5, u('t'))
        break
      default:
        front = glow(42, 29, 6, 3)
    }

    const ey = 51
    const gap = 9
    const my = 62
    const eye = (x: number, y: number) =>
      `<g data-lv-depth=".45">${E(x, y, 3, 3.8, INK)}${C(x - 0.9, y - 1.4, 1.15, '#fff')}</g>`
    const F: FaceSpec = { x: 50, ey, gap, my, ink: INK, s: 0.95, eye }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${eye(50 - gap, ey)}</g><g data-lv-eye="">${eye(50 + gap, ey)}</g>` : faceEyes(F, mood)
    const nm = rand.pick(['smile', 'open', 'small'] as const)
    const mouth =
      mood !== 'neutral'
        ? faceMouth(F, mood)
        : nm === 'open'
          ? P(`M45.5 ${my}Q50 ${my + 7} 54.5 ${my}Z`, INK) + E(50, my + 3.2, 2.2, 1.2, '#ff8fa3')
          : `<path d="M${nm === 'small' ? 47 : 45} ${my}Q50 ${my + (nm === 'small' ? 2.6 : 4)} ${nm === 'small' ? 53 : 55} ${my}" stroke="${INK}" stroke-width="1.9" fill="none" stroke-linecap="round"/>`

    const hand = (x: number, side: 1 | -1) =>
      `<g transform="rotate(${side * 12} ${n(x)} ${n(ey + 2)})">` +
      `<rect x="${n(x - 6)}" y="${n(ey + 6)}" width="12" height="50" rx="6" fill="${u('o')}"/>` +
      `<rect x="${n(x - 8.5)}" y="${n(ey - 9)}" width="17" height="20" rx="8.5" fill="${u('s')}"/>` +
      glow(x - 2, ey - 4, 4, 2.5) +
      `</g>`

    return (
      `<defs>${defs}</defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".12">` +
      P('M15 108C15 86 30 77 50 77C70 77 85 86 85 108Z', u('o')) +
      glow(36, 86, 10, 4) +
      E(50, 78, 12, 4, u('d')) +
      `<rect x="43" y="66" width="14" height="14" rx="6" fill="${u('s')}"/>` +
      E(50, 79, 9, 3, shade(skin, 0.85), ' opacity=".5"') +
      `</g>` +
      `<g data-lv-depth=".45" data-lv-tilt="5">` +
      back +
      C(27.5, 50, 5, u('s')) + C(72.5, 50, 5, u('s')) +
      E(50, 70, 18, 5, u('d')) +
      head +
      glow(40, 38, 9, 6) +
      front +
      `<g data-lv-depth=".6">` +
      eyes +
      faceBrows(F, mood) +
      E(50, 56.5, 2, 1.5, shade(skin, 0.85)) +
      (mood === 'happy' ? '' : E(37, 58, 4, 2.4, '#ff8fa3', ' opacity=".45"') + E(63, 58, 4, 2.4, '#ff8fa3', ' opacity=".45"')) +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g>` +
      `<g data-lv-shy="" opacity="0">${hand(50 - gap + 1, -1)}${hand(50 + gap - 1, 1)}</g>` +
      `</g></g>`
    )
  },
})
