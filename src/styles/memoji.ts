import { defineStyle, n, safe } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const HAIRS = ['curlyTop', 'wavy', 'buzz', 'long', 'bun', 'bald'] as const
const BEARDS = ['none', 'stubble', 'full', 'goatee'] as const
const GLASSES = ['none', 'round', 'aviator', 'square'] as const
const SKINS = ['#ffe0c7', '#f6c9a4', '#e2a87e', '#c68658', '#9c6440', '#6e4630']
const HAIR_C = ['#1e1a1d', '#3b2a22', '#6b4429', '#b07a45', '#e2bf7a', '#b8462e', '#9a9aa6']
const SHIRT = ['#5b7cfa', '#ff7a8a', '#2ec4b6', '#ffb347', '#8f6bf2', '#3d405b', '#f4f1ea']

export interface MemojiOptions {
  hair?: (typeof HAIRS)[number] | 'random'
  beard?: (typeof BEARDS)[number] | 'random'
  glasses?: (typeof GLASSES)[number] | 'random'
  skin?: string
  hairColor?: string
  shirt?: string
}

const INK = '#2a1d1a'

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
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
const M = (svg: string) => svg + `<g transform="matrix(-1 0 0 1 100 0)">${svg}</g>`

const HEAD = 'M50 19C66.5 19 76 30.5 76 47C76 67 64.5 80 50 80C35.5 80 24 67 24 47C24 30.5 33.5 19 50 19Z'

/** Glossy 3D-ish cartoon heads with sculpted hair, beards and glasses (an original take on the genre). */
export const memoji = defineStyle<MemojiOptions>({
  name: 'memoji',
  colors: ['#cfe3ff', '#ffe0ec', '#e3dcff', '#d6f5e9', '#fff0c9', '#ffdccc', '#dff3ff', '#ece6dc'],
  defaults: { hair: 'random', beard: 'random', glasses: 'random' },
  variants: { hair: HAIRS, beard: BEARDS, glasses: GLASSES, skin: SKINS, hairColor: HAIR_C, shirt: SHIRT },
  render({ rand, pick, id, mood, options: o }) {
    const hair = pick('hair', HAIRS)
    const beard = pick('beard', ['none', 'none', 'stubble', 'full', 'goatee'])
    const glasses = pick('glasses', ['none', 'none', 'round', 'aviator', 'square'])
    const skin = safe(o.skin && o.skin !== 'random' ? o.skin : rand.pick(SKINS))
    const hairC = safe(o.hairColor && o.hairColor !== 'random' ? o.hairColor : rand.pick(HAIR_C))
    const shirt = safe(o.shirt && o.shirt !== 'random' ? o.shirt : rand.pick(SHIRT))
    const iris = rand.pick(['#5a3a24', '#3b6fa8', '#4f7a3a', '#2b2220'])

    const g = (k: string, c: string, cx = 0.38, cy = 0.3) =>
      `<radialGradient id="${id}-${k}" cx="${cx}" cy="${cy}" r=".8"><stop offset="0" stop-color="${shade(c, 1.2)}"/><stop offset=".6" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, 0.74)}"/></radialGradient>`
    const u = (k: string) => `url(#${id}-${k})`
    const defs =
      g('s', skin) + g('h', hairC, 0.4, 0.2) + g('o', shirt) +
      `<linearGradient id="${id}-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2735" stop-opacity=".92"/><stop offset=".6" stop-color="#3d5168" stop-opacity=".88"/><stop offset="1" stop-color="#8aa3b8" stop-opacity=".85"/></linearGradient>` +
      `<linearGradient id="${id}-f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${hairC}" stop-opacity=".75"/><stop offset="1" stop-color="${hairC}" stop-opacity="0"/></linearGradient>` +
      `<clipPath id="${id}-c"><path d="${HEAD}"/></clipPath>`

    // hair: `back` behind the head, `cap` clipped to the head, `top` over it
    let back = ''
    let cap = ''
    let top = ''
    switch (hair) {
      case 'curlyTop': {
        // short faded sides, a tall curly crown
        cap = M(`<path d="M23 30C26 26 31 24 35 24L35 54C30 54 26 52 23 50Z" fill="${u('f')}"/>`)
        let curls = ''
        const pts: [number, number, number][] = [
          [32, 30, 6.4], [38, 23.5, 7], [46, 19.5, 7.4], [55, 19.5, 7.4], [63, 23.5, 7], [68.5, 30, 6.4],
          [40, 30, 6.4], [50, 27, 7], [60, 30, 6.4], [44, 14.5, 5.8], [55, 14, 6], [35, 22, 5],
          [65, 22, 5], [50, 12.5, 5],
        ]
        for (const [x, y, r] of pts) curls += C(x, y, r, u('h'))
        let ring = ''
        for (const [x, y, r] of pts) ring += S(`M${n(x - r * 0.5)} ${n(y + r * 0.1)}a${n(r * 0.5)} ${n(r * 0.45)} 0 1 1 ${n(r * 0.75)} ${n(r * 0.4)}`, 'rgba(0,0,0,.25)', 1.1)
        top = curls + ring + C(44, 15, 2.2, '#fff', ' opacity=".18"')
        break
      }
      case 'wavy':
        top = P('M24 46C21 27 33 15 51 15C68 15 80 26 76 46C74 38 70 33 66 31C62 36 52 35 46 30C42 35 32 36 27 38C25.5 40 24.5 43 24 46Z', u('h')) +
          S('M36 22Q44 19 50 24M54 20Q62 20 68 26', 'rgba(255,255,255,.22)', 1.6)
        break
      case 'buzz':
        cap = P('M20 44C20 22 34 14 50 14C66 14 80 22 80 44C74 34 64 30 50 30C36 30 26 34 20 44Z', hairC, ' opacity=".82"')
        break
      case 'long':
        back = P('M22 46C20 26 34 15 50 15C66 15 80 26 78 46L82 84Q72 90 64 82L36 82Q28 90 18 84Z', u('h'))
        top = P('M24 47C22 27 35 16 50 16C65 16 78 27 76 47C70 37 58 31 49 28C44 36 32 40 24 47Z', u('h'))
        break
      case 'bun':
        back = C(50, 14, 9, u('h'))
        top = P('M24.5 45C23 28 35 18 50 18C65 18 77 28 75.5 45C72 35 63 29 50 29C37 29 28 35 24.5 45Z', u('h'))
        break
      default:
        top = E(42, 26, 7, 3.4, '#fff', ' opacity=".28" transform="rotate(-20 42 26)"')
    }

    const ey = 50
    const gap = 10.5
    const my = 67
    const beardSvg =
      beard === 'full'
        ? P('M23.5 46C23 66 34 85 50 85C66 85 77 66 76.5 46C75 56 71 61 67 63C61 60.5 55 60 50 61C45 60 39 60.5 33 63C29 61 25 56 23.5 46Z', u('h')) +
          S('M30 66Q34 74 40 78M70 66Q66 74 60 78M50 76V82', 'rgba(255,255,255,.12)', 1.2)
        : beard === 'goatee'
          ? P('M43 72Q50 70 57 72Q57 81 50 83Q43 81 43 72Z', u('h'))
          : beard === 'stubble'
            ? `<g clip-path="url(#${id}-c)">${P('M23 52C24 70 34 82 50 82C66 82 76 70 77 52C74 60 68 63 50 62C32 63 26 60 23 52Z', hairC, ' opacity=".22"')}</g>`
            : ''
    const stache =
      beard === 'full' || beard === 'goatee'
        ? P('M39.5 66C43 61.5 47.5 61.5 50 63.2C52.5 61.5 57 61.5 60.5 66C57 65 53 65.2 50 66C47 65.2 43 65 39.5 66Z', u('h'))
        : ''

    const eye = (x: number, y: number) =>
      E(x, y, 5.2, 5.8, '#fff') +
      `<g data-lv-depth=".45">${C(x, y + 0.4, 3.5, iris)}${C(x, y + 0.4, 1.8, '#140f0e')}${C(x - 1.3, y - 1.1, 1.2, '#fff')}</g>` +
      S(`M${n(x - 5.4)} ${n(y - 1.6)}Q${n(x)} ${n(y - 7.8)} ${n(x + 5.4)} ${n(y - 1.6)}`, INK, 1.4)
    const F: FaceSpec = { x: 50, ey, gap, my, ink: INK, s: 1, eye }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${eye(50 - gap, ey)}</g><g data-lv-eye="">${eye(50 + gap, ey)}</g>` : faceEyes(F, mood)
    const brows =
      (mood === 'neutral' || mood === 'happy' || mood === 'love' || mood === 'wink' || mood === 'silly' || mood === 'sleepy') && hair !== 'bald'
        ? M(S('M33.5 40.5Q38.5 37.5 44 39', shade(hairC, 0.9), 2.6))
        : faceBrows(F, mood)
    const mouth =
      mood === 'neutral'
        ? P(`M42.5 ${my - 0.5}Q50 ${my + 2} 57.5 ${my - 0.5}Q56 ${my + 7} 50 ${my + 7}Q44 ${my + 7} 42.5 ${my - 0.5}Z`, '#5a1f24') +
          P(`M43.6 ${my}Q50 ${my + 2.2} 56.4 ${my}L56 ${my + 2.2}Q50 ${my + 3.8} 44 ${my + 2.2}Z`, '#fff')
        : faceMouth(F, mood)

    const lens = glasses === 'aviator'
      ? M(`<path d="M30 45.5Q38 43.5 46 45.5Q47 53 43 57Q36 60 32 56Q28.5 51 30 45.5Z" fill="${u('a')}" stroke="#c9a35b" stroke-width="1.5"/>` + S('M32 47.5Q35 46.5 38 47', '#fff', 1.2, ' opacity=".55"')) +
        S('M46 46Q50 44 54 46', '#c9a35b', 1.5) + S('M30 45.5L24.5 44M70 45.5L75.5 44', '#c9a35b', 1.5)
      : glasses === 'round'
        ? M(C(39.5, 50, 7.4, 'rgba(255,255,255,.18)', ` stroke="${INK}" stroke-width="1.8"`)) + S('M46.9 49Q50 47 53.1 49M32 49L25 47M68 49L75 47', INK, 1.8)
        : glasses === 'square'
          ? M(`<rect x="31" y="44" width="17" height="12" rx="3" fill="rgba(255,255,255,.18)" stroke="${INK}" stroke-width="2"/>`) + S('M48 48.5H52M31 48L25 46.5M69 48L75 46.5', INK, 2)
          : ''

    const hand = (x: number, side: 1 | -1) =>
      `<g transform="rotate(${side * 12} ${n(x)} ${n(ey + 2)})">` +
      `<rect x="${n(x - 6)}" y="${n(ey + 8)}" width="12" height="50" rx="6" fill="${u('o')}"/>` +
      `<rect x="${n(x - 8.5)}" y="${n(ey - 9)}" width="17" height="21" rx="8.5" fill="${u('s')}"/>` +
      S(`M${n(x - 3)} ${n(ey - 8)}v5M${n(x + 1.5)} ${n(ey - 8.5)}v5`, 'rgba(0,0,0,.12)', 1.2) +
      `</g>`

    return (
      `<defs>${defs}</defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".12">` +
      P('M13 108C13 87 29 78 50 78C71 78 87 87 87 108Z', u('o')) +
      `<rect x="42" y="66" width="16" height="17" rx="7" fill="${u('s')}"/>` +
      P('M42 78Q50 84 58 78L58 81Q50 87 42 81Z', 'rgba(0,0,0,.15)') +
      `</g>` +
      `<g data-lv-depth=".45" data-lv-tilt="5">` +
      back +
      M(E(25, 51, 5, 7, u('s')) + E(25.5, 51.5, 2.4, 4, shade(skin, 0.82))) +
      `<path d="${HEAD}" fill="${u('s')}"/>` +
      `<g clip-path="url(#${id}-c)">${cap}${E(50, 86, 30, 12, 'rgba(0,0,0,.08)')}</g>` +
      E(41, 31, 9, 4.6, '#fff', ' opacity=".22" transform="rotate(-18 41 31)"') +
      top +
      beardSvg +
      `<g data-lv-depth=".6">` +
      P('M48 54Q47 59.5 50 60.2Q53 59.5 52 54', 'none', ` stroke="${shade(skin, 0.75)}" stroke-width="1.4" stroke-linecap="round"`) +
      E(50, 59.6, 2.8, 1.3, shade(skin, 0.86)) +
      eyes +
      brows +
      (mood === 'happy' || beard === 'full' ? '' : E(35, 60, 4.2, 2.4, '#ff7f8f', ' opacity=".28"') + E(65, 60, 4.2, 2.4, '#ff7f8f', ' opacity=".28"')) +
      (beard === 'full' || beard === 'goatee' ? E(50, my + 3, 8.5, 5.2, shade(skin, 0.92)) : '') +
      stache +
      `<g data-lv-mouth="1">${mouth}</g>` +
      lens +
      faceExtras(F, mood) +
      `</g>` +
      `<g data-lv-shy="" opacity="0">${hand(50 - gap + 1, -1)}${hand(50 + gap - 1, 1)}</g>` +
      `</g></g>`
    )
  },
})
