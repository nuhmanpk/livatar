import { defineStyle, n, safe, type Rand } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'
import { HAIR_COLORS, M, P, SHIRTS, SKINS, opt, shade } from './_people'

const HAIRS = ['crop', 'spiky', 'long', 'bald'] as const

export interface LowpolyOptions {
  hair?: (typeof HAIRS)[number] | 'random'
  skin?: string
  hairColor?: string
  shirt?: string
}

type Pt = [number, number]
const INK = '#1d1820'

/** Head outline, clockwise from the crown. */
const OUT: Pt[] = [
  [50, 20], [63, 22.5], [72, 31], [75, 45], [72, 59], [63, 71], [50, 77], [37, 71], [28, 59], [25, 45], [28, 31], [37, 22.5],
]
const CEN: Pt = [50, 48]

const tri = (a: Pt, b: Pt, c: Pt, fill: string) =>
  `<path d="M${n(a[0])} ${n(a[1])}L${n(b[0])} ${n(b[1])}L${n(c[0])} ${n(c[1])}Z" fill="${fill}" stroke="${fill}" stroke-width=".4" stroke-linejoin="round"/>`

/** Shade a facet by its centroid: lit from the top left, with a little seeded jitter. */
const facet = (rand: Rand, base: string, pts: Pt[]) => {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
  const k = 1.14 - ((cx - 25) / 50) * 0.22 - ((cy - 20) / 60) * 0.16 + rand.float(-0.035, 0.035)
  return shade(base, k)
}

/** Triangulate a polygon fan around `hub`. */
const fan = (rand: Rand, base: string, hub: Pt, ring: Pt[], closed = true) => {
  let s = ''
  const m = closed ? ring.length : ring.length - 1
  for (let i = 0; i < m; i++) {
    const a = ring[i]
    const b = ring[(i + 1) % ring.length]
    s += tri(a, b, hub, facet(rand, base, [a, b, hub]))
  }
  return s
}

/** Faceted low-poly people: every surface built from flat-shaded triangles, like a cut gem. */
export const lowpoly = defineStyle<LowpolyOptions>({
  name: 'lowpoly',
  colors: ['#e3ecf7', '#f7e3ea', '#e9e3f7', '#e1f4ee', '#f7efe1', '#dfeef7', '#f0f0f0', '#efe7df'],
  defaults: { hair: 'random' },
  variants: { hair: HAIRS, skin: SKINS, hairColor: HAIR_COLORS, shirt: SHIRTS },
  render({ rand, pick, mood, options: o }) {
    const hair = pick('hair', HAIRS)
    const skin = safe(opt(o.skin, () => rand.pick(SKINS)))
    const hc = safe(opt(o.hairColor, () => rand.pick(HAIR_COLORS)))
    const shirt = safe(opt(o.shirt, () => rand.pick(SHIRTS)))

    // head: outer ring of 12, inner ring of 6, centre
    const IN: Pt[] = []
    for (let j = 0; j < 6; j++) {
      const o2 = OUT[2 * j + 1]
      IN.push([CEN[0] + (o2[0] - CEN[0]) * 0.55 + rand.float(-1.2, 1.2), CEN[1] + (o2[1] - CEN[1]) * 0.55 + rand.float(-1.2, 1.2)])
    }
    let head = ''
    for (let j = 0; j < 6; j++) {
      const a = OUT[2 * j]
      const b = OUT[2 * j + 1]
      const c = OUT[(2 * j + 2) % 12]
      const i0 = IN[j]
      const i1 = IN[(j + 1) % 6]
      for (const t of [[a, b, i0], [b, c, i0], [i0, c, i1], [i0, i1, CEN]] as Pt[][]) head += tri(t[0], t[1], t[2], facet(rand, skin, t))
    }

    let back = ''
    let top = ''
    if (hair === 'crop') top = fan(rand, hc, [50, 27], [[25, 44], [26, 30], [36, 18], [50, 15], [64, 18], [74, 30], [75, 44], [66, 33], [56, 30], [44, 30], [34, 33]])
    else if (hair === 'spiky')
      top = fan(rand, hc, [50, 28], [[25, 44], [22, 24], [34, 22], [36, 9], [46, 16], [52, 5], [58, 16], [68, 10], [67, 22], [79, 24], [75, 44], [64, 32], [50, 34], [36, 32]])
    else if (hair === 'long') {
      back = fan(rand, hc, [50, 50], [[22, 40], [30, 18], [50, 13], [70, 18], [78, 40], [80, 82], [66, 86], [50, 82], [34, 86], [20, 82]])
      top = fan(rand, hc, [50, 26], [[26, 44], [28, 28], [38, 18], [50, 16], [62, 18], [72, 28], [74, 44], [64, 34], [52, 28], [40, 36]])
    }

    const body =
      fan(rand, shirt, [50, 92], [[10, 108], [14, 90], [30, 80], [44, 78], [50, 84], [56, 78], [70, 80], [86, 90], [90, 108]], false) +
      tri([10, 108], [90, 108], [50, 92], facet(rand, shirt, [[50, 100]])) +
      tri([42, 66], [58, 66], [50, 84], shade(skin, 0.8)) +
      tri([42, 66], [50, 84], [44, 78], shade(skin, 0.72)) +
      tri([58, 66], [56, 78], [50, 84], shade(skin, 0.86))

    const ey = 48
    const gap = 10
    const my = 63
    const eye = (x: number, y: number) =>
      P(`M${n(x - 4.4)} ${n(y)}L${n(x)} ${n(y - 3.2)}L${n(x + 4.4)} ${n(y)}L${n(x)} ${n(y + 3.2)}Z`, '#fff') +
      `<g data-lv-depth=".4">${P(`M${n(x - 2.4)} ${n(y)}L${n(x)} ${n(y - 2.6)}L${n(x + 2.4)} ${n(y)}L${n(x)} ${n(y + 2.6)}Z`, INK)}${P(`M${n(x - 1.4)} ${n(y - 0.6)}L${n(x - 0.4)} ${n(y - 1.8)}L${n(x + 0.2)} ${n(y - 0.6)}Z`, '#fff')}</g>`
    const F: FaceSpec = { x: 50, ey, gap, my, ink: INK, s: 0.9, eye }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${eye(50 - gap, ey)}</g><g data-lv-eye="">${eye(50 + gap, ey)}</g>` : faceEyes(F, mood)
    const mouth = mood === 'neutral' ? P(`M44 ${my}L50 ${my + 1}L56 ${my}L50 ${my + 3.4}Z`, '#7a2c34') : faceMouth(F, mood)

    return (
      `<g data-lv-body="">` +
      `<g data-lv-depth=".12">${body}</g>` +
      `<g data-lv-depth=".45" data-lv-tilt="5">` +
      back +
      M(tri([25.5, 41], [21, 50], [27, 56], shade(skin, 0.85))) +
      head +
      top +
      `<g data-lv-depth=".6">` +
      eyes +
      faceBrows(F, mood) +
      tri([50, 50], [47.5, 57.5], [52.5, 57.5], shade(skin, 0.8)) +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g></g></g>`
    )
  },
})
