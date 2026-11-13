import { defineStyle, n, safe } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'
import { C, E, HAIR_COLORS, M, P, S, SHIRTS, SKINS, opt } from './_people'

const HAIRS = ['quiff', 'spikes', 'pigtails', 'cap', 'curly', 'bald'] as const

export interface ToonOptions {
  hair?: (typeof HAIRS)[number] | 'random'
  skin?: string
  hairColor?: string
  shirt?: string
}

const INK = '#141414'
const W = 3
const ol = ` stroke="${INK}" stroke-width="${W}" stroke-linejoin="round"`
const HEAD = 'M50 20C67 20 76 32 76 48C76 66 65 78 50 78C35 78 24 66 24 48C24 32 33 20 50 20Z'

/** Saturday-morning cartoon people: thick outlines, giant eyes and a big, expressive mouth. */
export const toon = defineStyle<ToonOptions>({
  name: 'toon',
  colors: ['#ffd23f', '#3bceac', '#ee4266', '#5c7aff', '#ff9f1c', '#a0e426', '#c77dff', '#4cc9f0'],
  defaults: { hair: 'random' },
  variants: { hair: HAIRS, skin: SKINS, hairColor: HAIR_COLORS, shirt: SHIRTS },
  render({ rand, pick, mood, options: o }) {
    const hair = pick('hair', HAIRS)
    const skin = safe(opt(o.skin, () => rand.pick(SKINS)))
    const hc = safe(opt(o.hairColor, () => rand.pick(HAIR_COLORS)))
    const shirt = safe(opt(o.shirt, () => rand.pick(SHIRTS)))

    let back = ''
    let top = ''
    switch (hair) {
      case 'quiff':
        top = P('M26 42C24 26 34 18 46 18C46 10 56 6 64 10C58 12 58 16 62 20C72 24 77 32 74 42C68 34 58 30 48 30C38 30 30 34 26 42Z', hc, ol)
        break
      case 'spikes':
        top = P('M25 44L22 28L32 30L30 16L42 22L46 8L54 20L64 10L66 24L78 22L74 36L76 44C68 34 58 30 50 30C42 30 32 34 25 44Z', hc, ol)
        break
      case 'pigtails':
        back = M(`<g transform="rotate(-25 20 44)">${E(16, 44, 8, 13, hc, ol)}</g>`)
        top = P('M25 44C24 27 35 18 50 18C65 18 76 27 75 44C70 36 60 30 50 34C40 30 30 36 25 44Z', hc, ol)
        break
      case 'cap':
        top = P('M24 40C24 24 36 15 50 15C64 15 76 24 76 40Z', shirt, ol) + P('M60 36Q82 33 88 40L74 42Z', shirt, ol) + C(50, 15, 2.6, shirt, ol)
        break
      case 'curly': {
        let c = ''
        for (const [x, y, r] of [[30, 34, 7], [36, 24, 8], [47, 18, 8.5], [58, 18, 8.5], [67, 25, 8], [71, 35, 7]] as const) c += C(x, y, r, hc, ol)
        top = c + P('M28 36Q50 26 72 36L72 40Q50 32 28 40Z', hc)
        break
      }
    }

    const ey = 46
    const gap = 8
    const my = 61
    const eye = (x: number, y: number) =>
      E(x, y, 7.4, 9, '#fff', ol) + `<g data-lv-depth=".55">${C(x + (x < 50 ? 2 : -2), y + 1.5, 3, INK)}${C(x + (x < 50 ? 1 : -3), y, 1, '#fff')}</g>`
    const F: FaceSpec = { x: 50, ey, gap, my, ink: INK, s: 1.25, eye, extra: [74, 26] }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${eye(50 - gap, ey)}</g><g data-lv-eye="">${eye(50 + gap, ey)}</g>` : faceEyes(F, mood)
    const grin =
      P(`M37 ${my}Q50 ${my + 2} 63 ${my}Q62 ${my + 13} 50 ${my + 13}Q38 ${my + 13} 37 ${my}Z`, '#6b1a1a', ol) +
      P(`M39 ${my + 1}Q50 ${my + 3} 61 ${my + 1}L60.5 ${my + 4}Q50 ${my + 6} 39.5 ${my + 4}Z`, '#fff') +
      E(50, my + 10, 6, 3, '#ff6b81')
    const mouth = mood === 'neutral' ? grin : faceMouth(F, mood)

    return (
      `<g data-lv-body="">` +
      `<g data-lv-depth=".12">` +
      P('M14 110C14 90 30 80 50 80C70 80 86 90 86 110Z', shirt, ol) +
      `<rect x="43" y="70" width="14" height="13" fill="${skin}" stroke="${INK}" stroke-width="${W}"/>` +
      `</g>` +
      `<g data-lv-depth=".45" data-lv-tilt="7">` +
      back +
      M(C(25, 52, 6, skin, ol)) +
      `<path d="${HEAD}" fill="${skin}"${ol}/>` +
      top +
      `<g data-lv-depth=".6">` +
      eyes +
      faceBrows(F, mood) +
      E(50, 56, 4.6, 3.6, skin, ol) +
      `<g data-lv-mouth="1">${mouth}</g>` +
      (mood === 'neutral' ? S(`M${n(34)} ${my - 2}l-2 -2M66 ${my - 2}l2 -2`, INK, 2.4) : '') +
      faceExtras(F, mood) +
      `</g></g></g>`
    )
  },
})
