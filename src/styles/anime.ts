import { defineStyle, n, safe } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'
import { C, E, HAIR_COLORS, M, P, S, SKINS, opt, shade } from './_people'

const HAIRS = ['spiky', 'fringe', 'bob', 'twintails', 'ponytail'] as const
const EYES = ['#3b6fd8', '#c0392b', '#2e9e6a', '#8e44ad', '#d68910', '#4a3426']
const HAIR_C = [...HAIR_COLORS, '#4a6cf7', '#ff7eb6', '#e8e8f0']
const SHIRT = ['#1f2a44', '#f4f1ea', '#c0392b', '#5b7cfa', '#2ec4b6', '#3d405b']

export interface AnimeOptions {
  hair?: (typeof HAIRS)[number] | 'random'
  eyeColor?: string
  skin?: string
  hairColor?: string
  shirt?: string
}

const INK = '#2a1a22'
const HEAD = 'M50 21C66 21 74 33 74 48C74 62 64 74 50 80C36 74 26 62 26 48C26 33 34 21 50 21Z'
const FRINGE =
  'M24 52C21 30 33 17 50 17C67 17 79 30 76 52C74 45 72 40 70 36L66 47L61 36L56 46L51 35L46 46L41 36L36 47L32 37C28 42 26 47 24 52Z'

/** Cel-shaded anime-style people: big glossy eyes, sharp hair, a tiny mouth. */
export const anime = defineStyle<AnimeOptions>({
  name: 'anime',
  colors: ['#ffe3ec', '#e3ecff', '#e8e0ff', '#dff7ef', '#fff2d6', '#ffe0d6', '#d8f1ff', '#f1e9ff'],
  defaults: { hair: 'random' },
  variants: { hair: HAIRS, eyeColor: EYES, skin: SKINS, hairColor: HAIR_C, shirt: SHIRT },
  render({ rand, pick, id, mood, options: o }) {
    const hair = pick('hair', HAIRS)
    const skin = safe(opt(o.skin, () => rand.pick(SKINS.slice(0, 4))))
    const hc = safe(opt(o.hairColor, () => rand.pick(HAIR_C)))
    const iris = safe(opt(o.eyeColor, () => rand.pick(EYES)))
    const shirt = safe(opt(o.shirt, () => rand.pick(SHIRT)))
    const dark = shade(hc, 0.72)

    const defs =
      `<linearGradient id="${id}-i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(iris, 0.55)}"/><stop offset=".55" stop-color="${iris}"/><stop offset="1" stop-color="${shade(iris, 1.45)}"/></linearGradient>` +
      `<clipPath id="${id}-c"><path d="${HEAD}"/></clipPath>`

    let back = ''
    let top = ''
    const shine = S('M38 24Q46 20 54 22', '#fff', 2.2, ' opacity=".35"')
    switch (hair) {
      case 'spiky':
        top = P('M24 52C19 36 25 24 33 19L30 9L41 15L45 4L53 14L62 6L63 17L75 13L71 25C78 31 79 42 76 52C73 44 69 39 66 35L61 44L56 33L50 43L44 33L38 44L33 35C29 40 26 46 24 52Z', hc)
        break
      case 'bob':
        back = P('M22 50C20 28 34 16 50 16C66 16 80 28 78 50L80 77Q70 81 64 75L36 75Q30 81 20 77Z', hc)
        top = P(FRINGE, hc)
        break
      case 'twintails':
        back = M(
          `<g transform="rotate(12 20 44)">${E(17, 62, 7.5, 19, hc)}${S('M14 50Q12 62 16 76', dark, 1.4)}</g>` +
            C(24, 40, 3.4, '#ff6b8a'),
        )
        top = P(FRINGE, hc)
        break
      case 'ponytail':
        back = P('M68 26Q92 32 86 74Q80 58 70 44Z', hc) + C(71, 30, 3.2, '#ff6b8a')
        top = P(FRINGE, hc)
        break
      default:
        top = P(FRINGE, hc)
    }

    const ey = 53
    const gap = 11
    const my = 69
    const eye = (x: number, y: number) =>
      E(x, y + 0.5, 4.8, 6.4, '#fff') +
      `<g data-lv-depth=".45">${E(x, y + 1, 3.8, 5.4, `url(#${id}-i)`)}${E(x, y + 1.8, 1.9, 2.8, '#160c14')}` +
      `${C(x - 1.5, y - 1.6, 1.5, '#fff')}${C(x + 1.4, y + 3.2, 0.7, '#fff')}</g>` +
      S(`M${n(x - 5.8)} ${n(y - 3.4)}Q${n(x)} ${n(y - 8.6)} ${n(x + 5.8)} ${n(y - 4.2)}l1.6 -1.4`, INK, 2.3)
    const F: FaceSpec = { x: 50, ey, gap, my, ink: INK, s: 0.95, eye }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${eye(50 - gap, ey)}</g><g data-lv-eye="">${eye(50 + gap, ey)}</g>` : faceEyes(F, mood)
    const mouth = mood === 'neutral' ? S(`M47 ${my}Q50 ${my + 2} 53 ${my}`, INK, 1.4) : faceMouth(F, mood)
    const blush = M(S('M33 61l2 -2.4M35.6 61l2 -2.4M38.2 61l2 -2.4', '#ff6b8a', 1, ' opacity=".7"'))

    return (
      `<defs>${defs}</defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".12">` +
      P('M14 108C14 88 30 80 50 80C70 80 86 88 86 108Z', shirt) +
      P('M38 81L50 94L62 81L58 79L50 86L42 79Z', '#fff', ' opacity=".9"') +
      `<rect x="44" y="70" width="12" height="13" rx="4" fill="${skin}"/>` +
      P('M44 74Q50 79 56 74L56 77Q50 82 44 77Z', shade(skin, 0.85)) +
      `</g>` +
      `<g data-lv-depth=".45" data-lv-tilt="5">` +
      back +
      M(E(26, 53, 3.6, 5.4, skin)) +
      `<path d="${HEAD}" fill="${skin}"/>` +
      `<g clip-path="url(#${id}-c)">${E(50, 38, 26, 9, shade(skin, 0.88))}${P('M50 80C62 74 72 63 74 50L76 82Z', shade(skin, 0.9))}</g>` +
      top +
      shine +
      `<g data-lv-depth=".6">` +
      eyes +
      faceBrows(F, mood) +
      S('M50.5 60l-1 2.4h1.6', shade(skin, 0.7), 1) +
      (mood === 'happy' || mood === 'love' || mood === 'neutral' ? blush : '') +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g></g></g>`
    )
  },
})
