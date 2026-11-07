import { defineStyle, n, type Mood } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

// Shapes inspired by well-known AI assistants (not their official logos).
const KINDS = ['gemini', 'claude', 'grok', 'chatgpt'] as const
type Kind = (typeof KINDS)[number]

export interface AiOptions {
  kind?: Kind | 'random'
  /** A soft glow ring that pulses. */
  glow?: boolean | 'random'
}

const OL = '#1f1a2e'
const E = (cx: number, cy: number, rx: number, ry: number, fill: string, extra = '') => `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') => `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`

/** A star polygon with `points` tips, alternating outer/inner radius. */
const star = (cx: number, cy: number, points: number, ro: number, ri: number, rot = -90) => {
  let d = ''
  for (let i = 0; i < points * 2; i++) {
    const a = ((rot + (i * 180) / points) * Math.PI) / 180
    const r = i % 2 ? ri : ro
    d += `${i ? 'L' : 'M'}${n(cx + Math.cos(a) * r)} ${n(cy + Math.sin(a) * r)}`
  }
  return d + 'Z'
}

/** AI assistant characters: a sparkle, a sunburst, a slash and a knot, each with a face. */
export const ai = defineStyle<AiOptions>({
  name: 'ai',
  scale: 0.86,
  colors: ['#f7f7f8', '#fdf0e8', '#eef2ff', '#f3ecff', '#fff4e5', '#eef7f3'],
  defaults: { kind: 'random', glow: true },
  variants: { kind: KINDS, glow: [true, false] },
  render({ pick, id, mood, rand }) {
    const kind = pick('kind', KINDS) as Kind
    const glow = pick('glow', [true, false])
    let defs = '', shape = '', ink = OL, eyeHi = '#fff'
    let [fx, ey, gap, my, s] = [50, 46, 9, 56, 1]
    let glowCol = '#7f5af0'

    switch (kind) {
      case 'gemini': {
        const d = 'M50 4C55 34 66 45 96 50C66 55 55 66 50 96C45 66 34 55 4 50C34 45 45 34 50 4Z'
        defs = `<linearGradient id="${id}-g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#4f8cff"/><stop offset=".55" stop-color="#9b72f2"/><stop offset="1" stop-color="#ff7ab6"/></linearGradient>`
        shape = `<path d="${d}" fill="url(#${id}-g)" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/>` + E(40, 36, 4, 2, '#fff', ' opacity=".5" transform="rotate(-40 40 36)"')
        ;[ey, gap, my, s] = [47, 6.5, 55, 0.8]
        glowCol = '#9b72f2'
        break
      }
      case 'claude': {
        // uneven blunt rays bursting from a round core
        const rays: [number, number][] = [[-100, 44], [-62, 40], [-28, 44], [8, 40], [34, 38], [62, 42], [96, 40], [124, 44], [152, 38], [178, 46], [214, 40], [244, 36]]
        let r = ''
        for (const [deg, len] of rays) {
          const a = ((deg + rand.float(-3, 3)) * Math.PI) / 180
          r += `M50 50L${n(50 + Math.cos(a) * len)} ${n(50 + Math.sin(a) * len)}`
        }
        shape = `<path d="${r}" stroke="#d97757" stroke-width="7.5" stroke-linecap="butt" fill="none"/>` + C(50, 50, 21, '#d97757')
        ;[ey, gap, my, s] = [47, 8, 56, 0.9]
        glowCol = '#d97757'
        break
      }
      case 'grok': {
        // an open ring with a sharp blade cutting through it
        shape = C(50, 50, 30, 'none', ` stroke="#111114" stroke-width="10" stroke-dasharray="62.8 15.7 78.5 15.7 15.7"`) +
          `<path d="M6 96L44 49L95 5L52 56Z" fill="#111114"/>` +
          C(50, 50, 18, '#f7f7f8')
        ink = '#111114'
        ;[ey, gap, my, s] = [47, 7, 55, 0.85]
        glowCol = '#9aa0b4'
        break
      }
      case 'chatgpt': {
        // six interlocking links around a hexagonal middle
        let links = ''
        for (let i = 0; i < 6; i++) links += `<rect x="39" y="10" width="22" height="50" rx="11" transform="rotate(${i * 60} 50 50)"/>`
        shape = `<g fill="none" stroke="#111114" stroke-width="6.5">${links}</g>` +
          `<g fill="none" stroke="#f7f7f8" stroke-width="2">${links}</g>` +
          C(50, 50, 21, '#f7f7f8')
        ink = '#111114'
        ;[ey, gap, my, s] = [47, 7.5, 56, 0.9]
        glowCol = '#10a37f'
        break
      }
    }

    const ring = glow
      ? `<circle cx="50" cy="50" r="46" fill="none" stroke="${glowCol}" stroke-width="3" opacity=".35"><animate attributeName="r" values="44;48;44" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".35;.08;.35" dur="2.4s" repeatCount="indefinite"/></circle>`
      : ''
    const eye = (x: number, y: number) => `<g data-lv-depth=".45">${E(x, y, 3 * s, 3.6 * s, ink)}${C(x - 1 * s, y - 1.3 * s, 1.15 * s, eyeHi)}</g>`
    const F: FaceSpec = { x: fx, ey, gap, my, ink, s, eye, extra: [fx + gap + 7, ey - 11] }
    const m = mood as Mood
    const eyes = m === 'neutral' ? `<g data-lv-eye="">${eye(fx - gap, ey)}</g><g data-lv-eye="">${eye(fx + gap, ey)}</g>` : faceEyes(F, m)
    const mouth = m === 'neutral' ? S(`M${n(fx - 4.5 * s)} ${my}Q${fx} ${n(my + 5 * s)} ${n(fx + 4.5 * s)} ${my}`, ink, 2.2 * s) : faceMouth(F, m)
    const blush = E(fx - gap - 4 * s, ey + 6 * s, 3.2 * s, 1.8 * s, '#ff5c8a', ' opacity=".4"') + E(fx + gap + 4 * s, ey + 6 * s, 3.2 * s, 1.8 * s, '#ff5c8a', ' opacity=".4"')
    const face = eyes + faceBrows(F, m) + blush + `<g data-lv-mouth="1">${mouth}</g>` + faceExtras(F, m)

    return (
      (defs ? `<defs>${defs}</defs>` : '') +
      ring +
      `<g data-lv-body=""><g data-lv-depth=".3" data-lv-tilt="4">${shape}<g data-lv-depth=".6">${face}</g></g></g>`
    )
  },
})
