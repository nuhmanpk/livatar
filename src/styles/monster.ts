import { defineStyle, n, smoothPath } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

export interface MonsterOptions {
  eyes?: 1 | 2 | 3 | 'random'
  horns?: 'none' | 'small' | 'curly' | 'antenna' | 'random'
  teeth?: 'none' | 'fangs' | 'snaggle' | 'random'
  spots?: boolean | 'random'
}

const INK = '#1f1a2e'
const HORN = '#fff1d0'

/** Fuzzy, friendly monsters — one, two or three eyes. */
export const monster = defineStyle<MonsterOptions>({
  name: 'monster',
  colors: ['#7b2ff7', '#00c2a8', '#ff5d8f', '#ffb703', '#3a86ff', '#8ac926', '#ff6b35', '#9d4edd'],
  defaults: { eyes: 'random', horns: 'random', teeth: 'random', spots: 'random' },
  variants: { eyes: [1, 2, 3], horns: ['none', 'small', 'curly', 'antenna'], teeth: ['none', 'fangs', 'snaggle'], spots: [true, false] },
  render({ rand, pick, color, background, id, mood }) {
    const c = color(background)
    const accent = color(c)
    const count = pick('eyes', [1, 2, 2, 3])
    const horns = pick('horns', ['none', 'small', 'curly', 'antenna'])
    const teeth = pick('teeth', ['none', 'fangs', 'snaggle'])
    const spots = pick('spots', [true, false])

    // fuzzy body: a ring of points with alternating radius
    const pts: [number, number][] = []
    const N = 28
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2
      const r = 35 + (i % 2 ? 1.8 : -1.2) + rand.float(-0.6, 0.6)
      pts.push([50 + Math.cos(a) * r * 1.02, 66 + Math.sin(a) * r])
    }
    const body = smoothPath(pts)

    let sp = ''
    if (spots)
      for (let i = rand.int(3, 5); i > 0; i--) {
        const a = rand.float(0, Math.PI * 2)
        const d = rand.float(22, 32)
        sp += `<circle cx="${n(50 + Math.cos(a) * d)}" cy="${n(66 + Math.sin(a) * d)}" r="${n(rand.float(3, 6))}" fill="#fff" opacity=".2"/>`
      }

    const M = (svg: string) => svg + `<g transform="matrix(-1 0 0 1 100 0)">${svg}</g>`
    const hornSvg =
      horns === 'small'
        ? M(`<path d="M33 38Q27 27 30 19Q36 27 42 34Z" fill="${HORN}"/>`)
        : horns === 'curly'
          ? M(`<path d="M37 35C25 36 19 25 25 19C30 14 37 19 33 24" stroke="${HORN}" stroke-width="5" fill="none" stroke-linecap="round"/>`)
          : horns === 'antenna'
            ? M(`<path d="M43 33Q40 22 34 15" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="34" cy="14" r="4" fill="${accent}"/>`)
            : ''

    const eye = (x: number, y: number, k = 1) =>
      `<circle cx="${n(x)}" cy="${n(y)}" r="${n(5.6 * k)}" fill="#fff"/>` +
      `<g data-lv-depth=".45"><circle cx="${n(x)}" cy="${n(y)}" r="${n(3 * k)}" fill="${INK}"/><circle cx="${n(x - k)}" cy="${n(y - k)}" r="${n(1.1 * k)}" fill="#fff"/></g>`
    const F: FaceSpec = { x: 50, ey: 52, gap: 11.5, my: 65, ink: INK, s: 1.2, eye }
    const E = (x: number, y: number, k: number) => `<g data-lv-eye="">${eye(x, y, k)}</g>`
    const eyes =
      mood !== 'neutral'
        ? faceEyes(F, mood)
        : count === 1
          ? E(50, 50, 1.7)
          : count === 3
            ? E(38, 54, 0.85) + E(62, 54, 0.85) + E(50, 42, 1)
            : E(38.5, 52, 1) + E(61.5, 52, 1)

    const grin = mood === 'neutral' && (teeth !== 'none' || rand.bool(0.6))
    const tooth = (x: number, y: number, w: number, h: number) => `<path d="M${n(x)} ${n(y)}h${n(w)}l${n(-w / 2)} ${n(h)}z" fill="#fff" stroke="#fff" stroke-width=".8" stroke-linejoin="round"/>`
    const teethSvg = (top: number, half: number) =>
      teeth === 'fangs'
        ? tooth(50 - half + 1, top, 4, 5) + tooth(50 + half - 5, top, 4, 5)
        : teeth === 'snaggle'
          ? tooth(50 - half + 2.5, top, 4, 5.5) + `<rect x="${n(50 + half / 3)}" y="${n(top)}" width="3.6" height="3" rx=".8" fill="#fff"/>`
          : ''
    const mouth =
      mood === 'neutral'
        ? grin
          ? `<path d="M37 64Q50 79 63 64Z" fill="${INK}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="50" cy="70.5" rx="4.5" ry="2.2" fill="#ff7a93"/>` + teethSvg(64, 13)
          : rand.bool()
            ? `<path d="M39 65Q50 74 61 65" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
            : `<ellipse cx="50" cy="67" rx="3.4" ry="4" fill="${INK}"/>`
        : faceMouth(F, mood) + (mood === 'happy' ? teethSvg(65, 7.8) : '')

    const arm = (x: number, side: 1 | -1) =>
      `<g transform="rotate(${side * 12} ${x} 54)">` +
      `<rect x="${x - 7}" y="58" width="14" height="50" rx="7" fill="${c}"/><rect x="${x - 7}" y="58" width="14" height="50" rx="7" fill="rgba(0,0,0,.1)"/>` +
      `<rect x="${x - 9.5}" y="39" width="19" height="23" rx="9.5" fill="${c}" stroke="rgba(0,0,0,.2)" stroke-width="1"/>` +
      `<path d="M${x - 5} 39.5l1 -3l1 3M${x - 0.5} 39l1 -3l1 3M${x + 4} 39.5l1 -3l1 3" fill="${HORN}"/>` +
      `</g>`

    return (
      `<defs><clipPath id="${id}-m"><path d="${body}"/></clipPath>` +
      `<radialGradient id="${id}-s" cx=".35" cy=".3" r=".8"><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></radialGradient></defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".2" data-lv-tilt="3">` +
      `<g data-lv-depth=".25">${hornSvg}</g>` +
      `<path d="${body}" fill="${c}"/><g clip-path="url(#${id}-m)">${sp}<ellipse cx="50" cy="100" rx="22" ry="14" fill="#fff" opacity=".18"/></g>` +
      `<path d="${body}" fill="url(#${id}-s)"/>` +
      `<g data-lv-depth=".7" data-lv-tilt="5">` +
      eyes + faceBrows(F, mood) +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g>` +
      `<g data-lv-shy="" opacity="0">${arm(39, -1)}${arm(61, 1)}</g>` +
      `</g></g>`
    )
  },
})
