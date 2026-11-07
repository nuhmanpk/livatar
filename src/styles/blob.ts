import { defineStyle, n, smoothPath } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

export interface BlobOptions {
  eyes?: 'dot' | 'round' | 'tall' | 'happy' | 'random'
  mouth?: 'smile' | 'grin' | 'o' | 'cat' | 'flat' | 'random'
  blush?: boolean | 'random'
  spots?: boolean
}

const INK = '#1f1a2e'

/** Abstract organic blob creatures — boring-avatars energy, but alive. */
export const blob = defineStyle<BlobOptions>({
  name: 'blob',
  colors: ['#ffb84c', '#f16767', '#a459d1', '#5ec5e8', '#6bcb77', '#ffd93d', '#ff8fab', '#4d96ff'],
  defaults: { eyes: 'random', mouth: 'random', blush: 'random', spots: true },
  variants: {
    eyes: ['dot', 'round', 'tall', 'happy'],
    mouth: ['smile', 'grin', 'o', 'cat', 'flat'],
    blush: [false, true],
    spots: [false, true],
  },
  render({ rand, color, background, id, mood, options: o }) {
    const c1 = color(background)
    const c2 = color()
    const c3 = color()

    const count = rand.int(6, 8)
    const pts: [number, number][] = []
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2 + rand.float(-0.25, 0.25)
      const r = 31 + rand.float(-5, 6)
      pts.push([50 + Math.cos(a) * r * 1.05, 58 + Math.sin(a) * r * 0.95])
    }
    const body = smoothPath(pts)

    let spots = ''
    if (o.spots) {
      for (let i = rand.int(1, 3); i > 0; i--)
        spots += `<circle cx="${n(rand.float(25, 75))}" cy="${n(rand.float(35, 90))}" r="${n(rand.float(6, 16))}" fill="${c3}" opacity=".55"/>`
    }

    const eyes = o.eyes === 'random' ? rand.pick(['dot', 'round', 'tall', 'happy'] as const) : o.eyes
    const mouth = o.mouth === 'random' ? rand.pick(['smile', 'grin', 'o', 'cat', 'flat'] as const) : o.mouth
    const blush = o.blush === 'random' ? rand.bool(0.6) : o.blush
    const gap = rand.float(9.5, 13)
    const ey = rand.float(50, 55)

    const eye = (x: number, kind = eyes) => {
      const hl = (dx: number, dy: number, r: number) =>
        `<circle cx="${n(x + dx)}" cy="${n(ey + dy)}" r="${r}" fill="#fff"/>`
      switch (kind) {
        case 'round':
          return (
            `<circle cx="${n(x)}" cy="${n(ey)}" r="6" fill="#fff"/>` +
            `<g data-lv-depth=".55"><circle cx="${n(x)}" cy="${n(ey)}" r="3.2" fill="${INK}"/>${hl(-1.1, -1.1, 1.1)}</g>`
          )
        case 'tall':
          return `<ellipse cx="${n(x)}" cy="${n(ey)}" rx="2.7" ry="4.2" fill="${INK}"/>${hl(-0.8, -1.6, 0.9)}`
        case 'happy':
          return `<path d="M${n(x - 3.6)} ${n(ey + 1.5)}Q${n(x)} ${n(ey - 4)} ${n(x + 3.6)} ${n(ey + 1.5)}" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
        default:
          return `<circle cx="${n(x)}" cy="${n(ey)}" r="3.4" fill="${INK}"/>${hl(-1, -1, 1)}`
      }
    }

    const my = ey + 10
    const F: FaceSpec = {
      x: 50, ey, gap, my, ink: INK,
      // reuse the seeded eye, but never the closed 'happy' arc for open-eyed moods
      eye: (x) => eye(x, eyes === 'happy' ? 'round' : eyes),
      extra: [50 + gap + 10, ey - 17],
    }
    const mouths = {
      smile: `<path d="M44 ${n(my)}Q50 ${n(my + 6)} 56 ${n(my)}" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
      grin: `<path d="M43 ${n(my - 1)}Q50 ${n(my + 9)} 57 ${n(my - 1)}Z" fill="${INK}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="50" cy="${n(my + 2.6)}" rx="3" ry="1.6" fill="#ff7a93"/>`,
      o: `<ellipse cx="50" cy="${n(my + 1)}" rx="2.6" ry="3.1" fill="${INK}"/>`,
      cat: `<path d="M43 ${n(my)}q3.5 4 7 0q3.5 4 7 0" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      flat: `<path d="M45 ${n(my + 1)}H55" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`,
    }

    return (
      `<defs><linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` +
      `<clipPath id="${id}-b"><path d="${body}"/></clipPath></defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".25" data-lv-tilt="3"><path d="${body}" fill="url(#${id}-g)"/><g clip-path="url(#${id}-b)">${spots}</g></g>` +
      `<g data-lv-depth=".95" data-lv-tilt="5">` +
      (mood === 'neutral' ? `<g data-lv-eye="">${eye(50 - gap)}</g><g data-lv-eye="">${eye(50 + gap)}</g>` : faceEyes(F, mood)) +
      faceBrows(F, mood) +
      (blush && mood !== 'happy'
        ? `<ellipse cx="${n(50 - gap - 5)}" cy="${n(ey + 6)}" rx="4" ry="2.3" fill="#ff5c8a" opacity=".35"/><ellipse cx="${n(50 + gap + 5)}" cy="${n(ey + 6)}" rx="4" ry="2.3" fill="#ff5c8a" opacity=".35"/>`
        : '') +
      `<g data-lv-mouth="1.1">${mood === 'neutral' ? mouths[mouth!] : faceMouth(F, mood)}</g>` +
      faceExtras(F, mood) +
      `</g></g>`
    )
  },
})
