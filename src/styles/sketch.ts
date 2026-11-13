import { defineStyle, n, safe, type Rand } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'
import { C, M, S } from './_people'

const HAIRS = ['messy', 'slick', 'long', 'curly', 'bald'] as const
const PAPERS = ['#fbf8f1', '#f4efe3', '#ffffff', '#eef3f7']

export interface SketchOptions {
  hair?: (typeof HAIRS)[number] | 'random'
  /** Pencil color. */
  pencil?: string
  /** Paper / face fill. */
  paper?: string
  /** Animate the lines ("boiling" redraw). Default true. */
  boil?: boolean
}

type Pt = [number, number]

/** Wobbly closed curve through points (Catmull-Rom → cubic), with seeded jitter. */
const wobble = (rand: Rand, pts: Pt[], j: number, closed = true) => {
  const p = pts.map(([x, y]) => [x + rand.float(-j, j), y + rand.float(-j, j)] as Pt)
  const len = p.length
  const at = (i: number) => (closed ? p[(i + len) % len] : p[Math.max(0, Math.min(len - 1, i))])
  let d = `M${n(p[0][0])} ${n(p[0][1])}`
  const m = closed ? len : len - 1
  for (let i = 0; i < m; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2)
    d += `C${n(p1[0] + (p2[0] - p0[0]) / 6)} ${n(p1[1] + (p2[1] - p0[1]) / 6)} ${n(p2[0] - (p3[0] - p1[0]) / 6)} ${n(p2[1] - (p3[1] - p1[1]) / 6)} ${n(p2[0])} ${n(p2[1])}`
  }
  return d
}

const HEAD: Pt[] = [[50, 21], [65, 25], [73, 38], [73, 52], [66, 67], [50, 77], [34, 67], [27, 52], [27, 38], [35, 25]]
const SHOULDERS: Pt[] = [[12, 106], [16, 90], [32, 81], [50, 79], [68, 81], [84, 90], [88, 106]]

/** Pencil-sketch portraits with hatching and an optional jittery "boiling line" animation. */
export const sketch = defineStyle<SketchOptions>({
  name: 'sketch',
  colors: PAPERS,
  defaults: { hair: 'random', boil: true },
  variants: { hair: HAIRS, pencil: ['#3a3a3a', '#2b3a67', '#5a3d2b', '#7a2e2e'], paper: PAPERS },
  render({ rand, pick, id, mood, options: o }) {
    const hair = pick('hair', HAIRS)
    const ink = safe(o.pencil && o.pencil !== 'random' ? o.pencil : '#3a3a3a')
    const paper = safe(o.paper && o.paper !== 'random' ? o.paper : '#fbf8f1')
    const boil = o.boil !== false

    /** A stroke drawn twice, slightly off, that redraws itself every few frames. */
    const line = (pts: Pt[], w: number, closed = true, fill = 'none') => {
      const a = wobble(rand, pts, 0.9, closed)
      const b = wobble(rand, pts, 0.9, closed)
      const c = wobble(rand, pts, 0.9, closed)
      const anim = boil ? `<animate attributeName="d" values="${a};${b};${c}" dur=".45s" calcMode="discrete" repeatCount="indefinite"/>` : ''
      return (
        `<path d="${a}" fill="${fill}" stroke="${ink}" stroke-width="${n(w)}" stroke-linecap="round" stroke-linejoin="round">${anim}</path>` +
        `<path d="${wobble(rand, pts, 1.3, closed)}" fill="none" stroke="${ink}" stroke-width="${n(w * 0.45)}" opacity=".45" stroke-linecap="round"/>`
      )
    }

    let hatch = ''
    for (let i = 0; i < 9; i++) {
      const x = 58 + i * 2.4
      hatch += `M${n(x + rand.float(-0.4, 0.4))} ${n(30 + i)}L${n(x - 7)} ${n(74 - i * 0.5)}`
    }
    let bodyHatch = ''
    for (let i = 0; i < 8; i++) bodyHatch += `M${n(62 + i * 3.4)} 82L${n(54 + i * 3.4)} 108`

    let hairSvg = ''
    switch (hair) {
      case 'messy': {
        let d = ''
        for (let i = 0; i < 16; i++) {
          const x = 28 + i * 3 + rand.float(-1, 1)
          d += `M${n(x)} ${n(34 + rand.float(-2, 4))}Q${n(x + rand.float(-4, 4))} ${n(20)} ${n(x + rand.float(-6, 6))} ${n(14 + rand.float(-3, 3))}`
        }
        hairSvg = S(d, ink, 1.4)
        break
      }
      case 'slick':
        hairSvg = line([[27, 42], [30, 26], [44, 18], [60, 19], [72, 28], [73, 40], [62, 30], [42, 29]], 1.8, true, ink) + S('M34 26Q50 18 66 26M36 29Q50 22 64 29', paper, 0.8, ' opacity=".6"')
        break
      case 'long':
        hairSvg = S(wobble(rand, [[30, 30], [24, 50], [22, 74], [26, 88]], 0.5, false) + wobble(rand, [[70, 30], [76, 50], [78, 74], [74, 88]], 0.5, false), ink, 1.8) +
          line([[26, 46], [30, 26], [50, 17], [70, 26], [74, 46], [62, 32], [48, 28], [36, 36]], 1.8, true, ink)
        break
      case 'curly': {
        let d = ''
        for (let i = 0; i < 12; i++) {
          const a = Math.PI + (i / 11) * Math.PI
          const x = 50 + Math.cos(a) * 24
          const y = 38 + Math.sin(a) * 20
          d += `M${n(x - 3)} ${n(y)}a3 3 0 1 1 ${n(5)} ${n(1)}`
        }
        hairSvg = S(d, ink, 1.5)
        break
      }
    }

    const ey = 48
    const gap = 9.5
    const my = 63
    const eye = (x: number, y: number) =>
      S(`M${n(x - 4)} ${n(y)}Q${n(x)} ${n(y - 3.5)} ${n(x + 4)} ${n(y)}Q${n(x)} ${n(y + 2.6)} ${n(x - 4)} ${n(y)}`, ink, 1.1) + C(x, y - 0.2, 1.7, ink)
    const F: FaceSpec = { x: 50, ey, gap, my, ink, s: 0.85, eye }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${eye(50 - gap, ey)}</g><g data-lv-eye="">${eye(50 + gap, ey)}</g>` : faceEyes(F, mood)
    const mouth = mood === 'neutral' ? S(`M44 ${my}Q50 ${my + 3} 56 ${my}`, ink, 1.4) : faceMouth(F, mood)
    const brows = mood === 'neutral' ? M(S('M36 41Q40 39 44.5 40.5', ink, 1.6)) : faceBrows(F, mood)

    return (
      `<defs><clipPath id="${id}-c"><path d="${wobble(rand, HEAD, 0, true)}"/></clipPath></defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".12">` +
      line(SHOULDERS, 1.8, false, paper) +
      S(bodyHatch, ink, 0.7, ' opacity=".4"') +
      S('M43 66L43 80M57 66L57 80', ink, 1.6) +
      `</g>` +
      `<g data-lv-depth=".45" data-lv-tilt="5">` +
      line(HEAD, 1.9, true, paper) +
      `<g clip-path="url(#${id}-c)">${S(hatch, ink, 0.7, ' opacity=".35"')}</g>` +
      M(S('M27.5 44Q22 47 26 56', ink, 1.4)) +
      hairSvg +
      `<g data-lv-depth=".6">` +
      eyes +
      brows +
      S('M50 50L48 57Q50 58.5 52 57.5', ink, 1.2) +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g></g></g>`
    )
  },
})
