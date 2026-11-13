import { defineStyle, n, safe } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'
import { C, E, HAIR_COLORS, M, P, S, SHIRTS, SKINS, opt, shade } from './_people'

const HAIRS = ['fluffy', 'bowl', 'tuft', 'pigtails', 'long'] as const
const HATS = ['none', 'beanie', 'cat', 'bow', 'flower'] as const

export interface ChibiOptions {
  hair?: (typeof HAIRS)[number] | 'random'
  hat?: (typeof HATS)[number] | 'random'
  skin?: string
  hairColor?: string
  outfit?: string
}

const INK = '#3a2622'
const HEAD = 'M50 15C70 15 81 28 81 46C81 64 68 76 50 76C32 76 19 64 19 46C19 28 30 15 50 15Z'

/** Super-deformed cute people: a huge round head on a tiny body, rosy cheeks, sparkly eyes. */
export const chibi = defineStyle<ChibiOptions>({
  name: 'chibi',
  colors: ['#ffe4ef', '#e4f0ff', '#fff3d1', '#e6ffe9', '#efe4ff', '#ffe8dc', '#dcf6ff', '#fbe7ff'],
  defaults: { hair: 'random', hat: 'random' },
  variants: { hair: HAIRS, hat: HATS, skin: SKINS, hairColor: HAIR_COLORS, outfit: SHIRTS },
  render({ rand, pick, id, mood, options: o }) {
    const hair = pick('hair', HAIRS)
    const hat = pick('hat', ['none', 'none', 'none', 'beanie', 'cat', 'bow', 'flower'])
    const skin = safe(opt(o.skin, () => rand.pick(SKINS)))
    const hc = safe(opt(o.hairColor, () => rand.pick(HAIR_COLORS)))
    const outfit = safe(opt(o.outfit, () => rand.pick(SHIRTS)))
    const hatC = rand.pick(['#ff6b8a', '#5b7cfa', '#ffb347', '#2ec4b6', '#8f6bf2'])

    const g = (k: string, c: string) =>
      `<radialGradient id="${id}-${k}" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="${shade(c, 1.15)}"/><stop offset="1" stop-color="${shade(c, 0.86)}"/></radialGradient>`
    const defs = g('s', skin) + g('h', hc)
    const hu = `url(#${id}-h)`

    let back = ''
    let top = ''
    const bangs = 'M19 48C17 26 32 14 50 14C68 14 83 26 81 48C78 39 72 33 65 31C61 37 53 38 47 34C41 39 30 40 19 48Z'
    switch (hair) {
      case 'bowl':
        top = P('M18 46C17 25 32 13 50 13C68 13 83 25 82 46C76 40 68 37 50 37C32 37 24 40 18 46Z', hu)
        break
      case 'tuft':
        top = P(bangs, hu) + S('M50 15C48 8 54 4 58 8', hc, 3)
        break
      case 'pigtails':
        back = M(C(17, 36, 9, hu) + C(23, 40, 2.6, hatC))
        top = P(bangs, hu)
        break
      case 'long':
        back = P('M17 48C15 24 32 12 50 12C68 12 85 24 83 48L86 86Q74 92 66 84L34 84Q26 92 14 86Z', hu)
        top = P(bangs, hu)
        break
      default:
        top = P(bangs, hu) + M(C(24, 36, 6, hu))
    }

    let hatSvg = ''
    if (hat === 'beanie')
      hatSvg = P('M18 36C18 18 32 9 50 9C68 9 82 18 82 36Z', hatC) + `<rect x="16" y="31" width="68" height="9" rx="4.5" fill="${shade(hatC, 0.85)}"/>` + C(50, 8, 5, '#fff')
    else if (hat === 'cat') hatSvg = M(P('M24 30L22 8L40 19Z', hc) + P('M26 26L25 13L35 20Z', '#ffb3c4'))
    else if (hat === 'bow') hatSvg = `<g transform="rotate(-15 70 20)">${P('M70 20L58 12V28Z', hatC)}${P('M70 20L82 12V28Z', hatC)}${C(70, 20, 3.4, shade(hatC, 0.8))}</g>`
    else if (hat === 'flower') {
      let f = ''
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        f += C(28 + Math.cos(a) * 4, 22 + Math.sin(a) * 4, 3.4, '#fff')
      }
      hatSvg = f + C(28, 22, 2.6, '#ffc93c')
    }

    const ey = 52
    const gap = 12
    const my = 62
    const eye = (x: number, y: number) =>
      E(x, y, 3.6, 4.8, INK) + `<g data-lv-depth=".4">${C(x - 1.2, y - 1.8, 1.5, '#fff')}${C(x + 1.2, y + 1.8, 0.7, '#fff')}</g>`
    const F: FaceSpec = { x: 50, ey, gap, my, ink: INK, s: 0.9, eye }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${eye(50 - gap, ey)}</g><g data-lv-eye="">${eye(50 + gap, ey)}</g>` : faceEyes(F, mood)
    const mouth = mood === 'neutral' ? S(`M46.5 ${my}q1.75 2 3.5 0q1.75 2 3.5 0`, INK, 1.5) : faceMouth(F, mood)

    return (
      `<defs>${defs}</defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".1">` +
      P('M31 104C31 86 39 76 50 76C61 76 69 86 69 104Z', outfit) +
      P('M44 77L50 83L56 77Z', shade(outfit, 0.8)) +
      M(C(32, 92, 4.6, skin)) +
      `</g>` +
      `<g data-lv-depth=".5" data-lv-tilt="7">` +
      back +
      `<path d="${HEAD}" fill="url(#${id}-s)"/>` +
      top +
      hatSvg +
      `<g data-lv-depth=".6">` +
      eyes +
      faceBrows(F, mood) +
      M(E(33, 61, 5, 2.8, '#ff8fa3', ' opacity=".55"')) +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g>` +
      `<g data-lv-shy="" opacity="0">${M(C(n(50 - gap), ey + 4, 6, skin, ` stroke="${shade(skin, 0.8)}" stroke-width="1"`))}</g>` +
      `</g></g>`
    )
  },
})
