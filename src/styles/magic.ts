import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['crystalball', 'potion', 'hat', 'spellbook', 'wand', 'crystal', 'cauldron', 'scroll'] as const
type Kind = (typeof KINDS)[number]

export interface MagicOptions {
  kind?: Kind | 'random'
  /** Twinkling sparkles around the object. */
  sparkles?: boolean | 'random'
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
const star4 = (x: number, y: number, r: number) =>
  `M${n(x)} ${n(y - r)}Q${n(x + r * 0.2)} ${n(y - r * 0.2)} ${n(x + r)} ${n(y)}Q${n(x + r * 0.2)} ${n(y + r * 0.2)} ${n(x)} ${n(y + r)}Q${n(x - r * 0.2)} ${n(y + r * 0.2)} ${n(x - r)} ${n(y)}Q${n(x - r * 0.2)} ${n(y - r * 0.2)} ${n(x)} ${n(y - r)}Z`
const star5 = (x: number, y: number, R: number, r: number) => {
  const p: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const k = i % 2 ? r : R
    p.push(`${n(x + Math.cos(a) * k)} ${n(y + Math.sin(a) * k)}`)
  }
  return `M${p.join('L')}Z`
}

/** Enchanted objects — crystal balls, potions, wizard hats, spellbooks… */
export const magic = defineStyle<MagicOptions>({
  name: 'magic',
  scale: 0.84,
  colors: ['#efe2ff', '#dcecff', '#fbe7ff', '#e2e0ff', '#c9f0ea', '#fff1c9', '#ffe0e6', '#d6f1ff'],
  defaults: { kind: 'random', sparkles: 'random' },
  variants: { kind: KINDS, sparkles: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const sparkles = pick('sparkles', [true, true, false])

    let [cx, cy, r] = [50, 56, 30]
    let [c1, c2] = ['#c9a2ff', '#7b3fc4']
    let body = ''
    let back = ''
    let surface = ''
    let front = ''
    let [ey, gap, my, s] = [54, 10, 63, 0.95]
    let fx = 50
    let spk: [number, number, number][] = [[16, 22, 6], [86, 30, 5], [82, 12, 3.5]]

    switch (kind) {
      case 'crystalball': {
        ;[c1, c2] = rand.pick([['#d9c4ff', '#7a4fe0'], ['#bdf0ff', '#3a8fe0'], ['#ffc4ec', '#c94fa8']])
        back = ''
        body = ell(50, 46, 29, 29)
        surface = C(36, 58, 1.6, '#fff', ' opacity=".7"') + C(66, 36, 1.2, '#fff', ' opacity=".7"') + P(star4(64, 60, 4), '#fff', ' opacity=".7"') +
          E(50, 66, 26, 10, '#fff', 0, ' opacity=".15"')
        front = O('M28 76L72 76L78 90L22 90Z', '#c98a4a') + O('M24 72H76V80H24Z', '#e8b06a', 4.5)
        ;[cx, cy, r] = [50, 46, 29]
        ;[ey, my] = [44, 53]
        break
      }
      case 'potion': {
        ;[c1, c2] = rand.pick([['#9effc4', '#22b86a'], ['#ffa3d0', '#e0457b'], ['#a3c4ff', '#4a5ae0']])
        back = O('M42 16H58V36H42Z', '#eaf6ff', 5) + O('M40 8H60Q62 8 62 12V16H38V12Q38 8 40 8Z', '#b07a4a', 4.5)
        body = 'M42 34H58V40C74 46 82 56 82 66C82 82 68 92 50 92C32 92 18 82 18 66C18 56 26 46 42 40Z'
        surface = P('M10 60Q30 54 50 60T90 60V100H10Z', `url(#${id}-g)`) + P('M0 0H100V60Q70 54 50 60T0 60Z', '#eaf6ff', ' opacity=".85"') +
          C(40, 76, 2.4, '#fff', ' opacity=".6"') + C(60, 82, 1.6, '#fff', ' opacity=".6"') + C(56, 70, 1.2, '#fff', ' opacity=".6"')
        ;[cx, cy, r] = [50, 66, 30]
        ;[ey, gap, my, s] = [68, 9.5, 77, 0.92]
        break
      }
      case 'hat': {
        ;[c1, c2] = rand.pick([['#8a7aff', '#3d2fa8'], ['#c97aff', '#6a2fa8'], ['#7ac4ff', '#2f5aa8']])
        front = O('M8 82C8 74 30 72 50 72C70 72 92 74 92 82C92 88 70 90 50 90C30 90 8 88 8 82Z', c2)
        body = 'M24 80C30 60 36 40 44 26C48 18 54 10 66 8C60 16 58 24 60 34C66 50 72 66 76 80C66 84 34 84 24 80Z'
        surface = P('M10 66H90V76H10Z', '#ffd84d') + P(star5(50, 44, 5, 2.2), '#ffd84d') + P(star4(62, 22, 3), '#ffd84d')
        ;[cx, cy, r] = [50, 50, 28]
        ;[ey, gap, my, s] = [52, 8, 60, 0.85]
        break
      }
      case 'spellbook': {
        ;[c1, c2] = rand.pick([['#c98aff', '#6a2fa8'], ['#ff8a8a', '#a82f3d'], ['#7ad6a8', '#2f8a5a']])
        back = O('M24 24H80V86H24Z', '#fff7e0', 5)
        body = 'M18 20Q18 14 24 14H76Q80 14 80 18V80Q80 84 76 84H24Q18 84 18 78Z'
        surface = P('M18 14H30V90H18Z', 'rgba(0,0,0,.18)') + S('M38 22H72V76H38Z', '#ffd84d', 2, ' opacity=".8"') + P(star4(55, 30, 5), '#ffd84d')
        front = O('M24 84H78V90H24Z', '#fff7e0', 4) + O('M48 78H56V96L52 92L48 96Z', '#ffd84d', 3.5)
        ;[cx, cy, r] = [50, 50, 30]
        fx = 55
        ;[ey, gap, my, s] = [48, 8.5, 57, 0.88]
        break
      }
      case 'wand': {
        ;[c1, c2] = ['#fff09a', '#f7b81f']
        back = `<g transform="rotate(-35 50 50)">${O('M46 52H54V96H46Z', '#3d2f5a', 5)}${P('M46 52H54V58H46Z', '#ffd84d')}${P('M46 86H54V92H46Z', '#ffd84d')}</g>`
        body = star5(54, 42, 34, 16)
        ;[cx, cy, r] = [54, 44, 24]
        fx = 54
        ;[ey, gap, my, s] = [42, 7.5, 50, 0.82]
        spk = [[14, 30, 5], [86, 80, 5], [80, 92, 3]]
        break
      }
      case 'crystal': {
        ;[c1, c2] = rand.pick([['#d9c4ff', '#8a4fe0'], ['#bdf0ff', '#2f9ad6'], ['#ffc4dc', '#e0457b']])
        body = 'M50 10L76 34L66 88H34L24 34Z'
        surface = P('M50 10L60 34L50 88L40 34Z', '#fff', ' opacity=".25"') + P('M24 34H76', 'none') + S('M24 34L40 34L50 10M60 34L76 34M40 34L34 88M60 34L66 88', '#fff', 1.6, ' opacity=".55"')
        ;[cx, cy, r] = [50, 50, 28]
        ;[ey, gap, my, s] = [52, 9, 61, 0.9]
        break
      }
      case 'cauldron': {
        ;[c1, c2] = ['#6a6a8a', '#2b2b40']
        const brew = rand.pick(['#7af07a', '#c97aff', '#ff8ad6'])
        back = O(ell(50, 40, 34, 8), brew, 5) + O(ell(40, 30, 6, 6), brew, 4) + O(ell(58, 24, 4, 4), brew, 3.5) + O(ell(48, 16, 3, 3), brew, 3) +
          O('M26 84L20 94H30Z', '#2b2b40', 4) + O('M74 84L80 94H70Z', '#2b2b40', 4)
        body = 'M14 44H86C88 70 74 88 50 88C26 88 12 70 14 44Z'
        front = O('M10 40C10 36 90 36 90 40C90 46 10 46 10 40Z', '#4a4a66', 5)
        ;[cx, cy, r] = [50, 64, 26]
        ;[ey, gap, my, s] = [60, 10, 69, 0.95]
        spk = [[14, 18, 5], [86, 20, 5], [80, 8, 3]]
        break
      }
      case 'scroll': {
        ;[c1, c2] = ['#fff4d6', '#f0cf8a']
        body = 'M20 22H80V78H20Z'
        back = ''
        surface = S('M30 66H70M30 72H58', '#c99a5a', 2, ' opacity=".7"') + P('M70 26Q76 50 70 74H80V26Z', 'rgba(0,0,0,.08)')
        front = O('M12 18C12 12 16 10 20 10H82C86 10 90 12 90 18C90 24 86 26 82 26H20C16 26 12 24 12 18Z', '#e8c27a', 5) +
          O('M12 82C12 76 16 74 20 74H82C86 74 90 76 90 82C90 88 86 90 82 90H20C16 90 12 88 12 82Z', '#e8c27a', 5) +
          C(14, 18, 3, '#c98a4a') + C(88, 18, 3, '#c98a4a') + C(14, 82, 3, '#c98a4a') + C(88, 82, 3, '#c98a4a')
        ;[cx, cy, r] = [50, 50, 28]
        ;[ey, gap, my, s] = [46, 9.5, 55, 0.92]
        break
      }
    }
    if (!body) body = ell(cx, cy, r, r)

    const eyeK = rand.pick(['dot', 'sparkle'] as const)
    const dark = kind === 'cauldron' || (kind === 'hat' && c1 !== '#7ac4ff')
    const ink = dark ? '#ffffff' : INK
    const eye = (x: number, y: number) =>
      dark
        ? `<g data-lv-depth=".45">${E(x, y, 3.4 * s, 3.9 * s, '#fff')}${E(x, y + 0.6 * s, 2 * s, 2.5 * s, INK)}${C(x - 0.7 * s, y - 0.4 * s, 0.8 * s, '#fff')}</g>`
        : `<g data-lv-depth=".45">${E(x, y, 3 * s, 3.6 * s, INK)}${C(x - 1 * s, y - 1.3 * s, 1.15 * s, '#fff')}</g>`
    const neutralEye = (x: number, y: number) =>
      eyeK === 'sparkle' && !dark
        ? `<g data-lv-depth=".45">${E(x, y, 3.8 * s, 4.4 * s, INK)}${C(x - 1.3 * s, y - 1.6 * s, 1.5 * s, '#fff')}${C(x + 1.4 * s, y + 1.6 * s, 0.7 * s, '#fff')}</g>`
        : eye(x, y)
    const F: FaceSpec = { x: fx, ey, gap, my, ink, s, eye, extra: [fx + gap + 8, ey - 13] }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${neutralEye(fx - gap, ey)}</g><g data-lv-eye="">${neutralEye(fx + gap, ey)}</g>` : faceEyes(F, mood)
    const mouth =
      mood === 'neutral'
        ? rand.bool(0.5) || dark
          ? S(`M${n(fx - 4.5 * s)} ${my}Q${fx} ${n(my + 4.5 * s)} ${n(fx + 4.5 * s)} ${my}`, ink, 2.1 * s)
          : P(`M${n(fx - 5 * s)} ${my}Q${fx} ${n(my + 9 * s)} ${n(fx + 5 * s)} ${my}Z`, INK, ` stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"`) + E(fx, my + 4 * s, 2.6 * s, 1.5 * s, '#ff7a93')
        : faceMouth(F, mood)
    const bo = mood === 'happy' ? '.3' : '.45'
    const blush = E(fx - gap - 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ` opacity="${bo}"`) + E(fx + gap + 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ` opacity="${bo}"`)
    const twinkle = sparkles ? `<g data-lv-depth=".1">${spk.map(([x, y, k]) => O(star4(x, y, k), '#ffd84d', 3)).join('')}</g>` : ''

    return (
      `<defs><radialGradient id="${id}-g" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>` +
      `<clipPath id="${id}-p"><path d="${body}"/></clipPath></defs>` +
      twinkle +
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
      `</g></g>`
    )
  },
})
