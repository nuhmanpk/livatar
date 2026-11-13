import { defineStyle, n, safe } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'
import { C, E, M, P, S, SKINS, opt, shade } from './_people'

const HAIRS = ['afro', 'mullet', 'feathered', 'pompadour', 'bald'] as const
const ACCESSORIES = ['none', 'aviators', 'headband', 'mustache'] as const
const HAIR_C = ['#2b1a12', '#4a2a17', '#7a4a22', '#b5793a', '#e0b25c', '#9c3b1e']
const SHIRT = ['#e2583e', '#f2a541', '#3b8686', '#7b4b94', '#c94f7c', '#5c6b2e']

export interface RetroOptions {
  hair?: (typeof HAIRS)[number] | 'random'
  accessory?: (typeof ACCESSORIES)[number] | 'random'
  skin?: string
  hairColor?: string
  shirt?: string
  /** Sunset stripes behind the head. Default true. */
  sun?: boolean
}

const INK = '#3b2314'
const HEAD = 'M50 22C64 22 72 33 72 48C72 64 62 76 50 76C38 76 28 64 28 48C28 33 36 22 50 22Z'

/** 70s/80s retro people: halftone shading, warm sunset tones, big hair and aviators. */
export const retro = defineStyle<RetroOptions>({
  name: 'retro',
  colors: ['#f6e3c3', '#f3d2b3', '#efe0c8', '#f7d9c4', '#e9dcc0', '#f2e6d0'],
  defaults: { hair: 'random', accessory: 'random', sun: true },
  variants: { hair: HAIRS, accessory: ACCESSORIES, skin: SKINS, hairColor: HAIR_C, shirt: SHIRT },
  render({ rand, pick, id, mood, options: o }) {
    const hair = pick('hair', HAIRS)
    const acc = pick('accessory', ['none', 'aviators', 'aviators', 'headband', 'mustache'])
    const skin = safe(opt(o.skin, () => rand.pick(SKINS)))
    const hc = safe(opt(o.hairColor, () => rand.pick(HAIR_C)))
    const shirt = safe(opt(o.shirt, () => rand.pick(SHIRT)))

    const dot = (k: string, c: string, s = 3.2) =>
      `<pattern id="${id}-${k}" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">${C(s / 2, s / 2, s * 0.28, c)}</pattern>`
    const defs =
      dot('d', shade(skin, 0.72)) + dot('h', shade(hc, 0.6), 2.6) + dot('o', shade(shirt, 0.7)) +
      `<clipPath id="${id}-c"><path d="${HEAD}"/></clipPath>`
    const sun =
      o.sun === false
        ? ''
        : `<g opacity=".9">${C(50, 50, 34, '#f2a541')}${['#e2583e', '#c94f7c', '#7b4b94'].map((c, i) => `<rect x="14" y="${54 + i * 7}" width="72" height="${4 - i * 0.6}" fill="${c}"/>`).join('')}</g>`

    let back = ''
    let top = ''
    switch (hair) {
      case 'afro':
        back = C(50, 38, 29, hc) + C(50, 38, 29, `url(#${id}-h)`, ' opacity=".7"')
        break
      case 'mullet':
        back = P('M28 40L24 80Q34 86 40 76L60 76Q66 86 76 80L72 40Z', hc)
        top = P('M27 44C25 27 36 18 50 18C64 18 75 27 73 44C70 36 66 34 62 32L58 36L54 31L50 36L46 31L42 36L38 32C34 34 30 38 27 44Z', hc)
        break
      case 'feathered':
        back = P('M26 46C22 26 36 16 50 16C64 16 78 26 74 46L78 70Q66 74 62 66L38 66Q34 74 22 70Z', hc)
        top = P('M27 46C25 28 38 19 50 19C62 19 75 28 73 46C70 32 58 28 50 30C42 28 30 32 27 46Z', hc) + S('M34 28Q40 24 46 28M54 28Q60 24 66 28', shade(hc, 1.3), 1.2)
        break
      case 'pompadour':
        top = P('M28 42C26 26 36 14 52 12C66 10 78 20 72 36C68 30 60 28 50 30C40 30 32 34 28 42Z', hc) + S('M38 20Q52 12 66 18', shade(hc, 1.35), 1.4)
        break
    }

    const ey = 49
    const gap = 9.5
    const my = 64
    const eye = (x: number, y: number) =>
      E(x, y, 4.2, 3.4, '#fff', ` stroke="${INK}" stroke-width="1.3"`) + `<g data-lv-depth=".4">${C(x, y + 0.2, 2.1, INK)}${C(x - 0.7, y - 0.6, 0.6, '#fff')}</g>`
    const F: FaceSpec = { x: 50, ey, gap, my, ink: INK, s: 0.9, eye }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${eye(50 - gap, ey)}</g><g data-lv-eye="">${eye(50 + gap, ey)}</g>` : faceEyes(F, mood)
    const mouth = mood === 'neutral' ? P(`M43 ${my}Q50 ${my + 1.5} 57 ${my}Q55 ${my + 5} 50 ${my + 5}Q45 ${my + 5} 43 ${my}Z`, '#fff', ` stroke="${INK}" stroke-width="1.4"`) : faceMouth(F, mood)

    const extra =
      acc === 'aviators'
        ? M(`<path d="M31 45Q39 43 47 45Q47.5 53 43.5 56Q36 58 33 55Q30 51 31 45Z" fill="#e2583e" stroke="#d4a64a" stroke-width="1.4"/>` + `<path d="M33 46.5Q38 45.5 41 46" stroke="#ffd36e" stroke-width="1.4" fill="none" opacity=".8"/>`) +
          S('M47 46Q50 44.5 53 46M31 46L27 45M69 46L73 45', '#d4a64a', 1.4)
        : acc === 'headband'
          ? `<rect x="27" y="31" width="46" height="6" rx="3" fill="#e2583e"/><rect x="27" y="33" width="46" height="1.6" fill="#f2a541"/>`
          : acc === 'mustache'
            ? P('M40 62Q45 57 50 59.5Q55 57 60 62Q60 65 56 64Q52 61.5 50 62Q48 61.5 44 64Q40 65 40 62Z', hc)
            : ''

    return (
      `<defs>${defs}</defs>` +
      sun +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".12">` +
      P('M14 108C14 88 30 79 50 79C70 79 86 88 86 108Z', shirt, ` stroke="${INK}" stroke-width="1.6"`) +
      P('M60 82C76 86 86 96 86 108H64Z', `url(#${id}-o)`) +
      P('M38 80L50 96L62 80L56 78L50 86L44 78Z', '#fdf3e1', ` stroke="${INK}" stroke-width="1.4"`) +
      `<rect x="44" y="66" width="12" height="14" fill="${skin}" stroke="${INK}" stroke-width="1.4"/>` +
      `</g>` +
      `<g data-lv-depth=".45" data-lv-tilt="5">` +
      back +
      M(E(28.5, 50, 3.6, 5.6, skin, ` stroke="${INK}" stroke-width="1.4"`)) +
      `<path d="${HEAD}" fill="${skin}" stroke="${INK}" stroke-width="1.8"/>` +
      `<g clip-path="url(#${id}-c)">${P('M58 22C74 30 76 62 60 78L76 80V20Z', `url(#${id}-d)`)}</g>` +
      top +
      `<g data-lv-depth=".6">` +
      eyes +
      faceBrows(F, mood) +
      S(`M50 ${n(ey + 3)}Q47 57 50.5 58`, INK, 1.4) +
      `<g data-lv-mouth="1">${mouth}</g>` +
      extra +
      faceExtras(F, mood) +
      `</g></g></g>`
    )
  },
})
