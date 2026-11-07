import { defineStyle, n, safe } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

export interface BotOptions {
  eyes?: 'round' | 'square' | 'visor' | 'happy' | 'random'
  antenna?: 'single' | 'double' | 'none' | 'random'
  glow?: string
}

const SCREEN = '#16142b'
const GLOWS = ['#5cf2ff', '#7cff9a', '#ffd65c', '#ff6b9a', '#b88cff']

/** Little robots — RoboHash spirit, with LED eyes that track you. */
export const bot = defineStyle<BotOptions>({
  name: 'bot',
  colors: ['#c3cfe2', '#f6d365', '#fda085', '#84fab0', '#8fd3f4', '#a18cd1', '#fbc2eb', '#ff9a9e'],
  defaults: { eyes: 'random', antenna: 'random' },
  variants: {
    eyes: ['round', 'square', 'visor', 'happy'],
    antenna: ['single', 'double', 'none'],
    glow: GLOWS,
  },
  render({ rand, color, background, id, mood, options: o }) {
    const metal = color(background)
    const accent = color()
    const glow = safe(o.glow ?? rand.pick(GLOWS))
    const eyes = o.eyes === 'random' ? rand.pick(['round', 'square', 'visor', 'happy', 'round'] as const) : o.eyes
    const antenna = o.antenna === 'random' ? rand.pick(['single', 'double', 'none', 'single'] as const) : o.antenna
    const rx = rand.int(7, 16)
    const shade = 'rgba(0,0,0,.14)'

    const ant =
      antenna === 'single'
        ? `<path d="M50 27V15" stroke="${accent}" stroke-width="2.5" stroke-linecap="round"/><circle cx="50" cy="13" r="4" fill="${glow}"/>`
        : antenna === 'double'
          ? `<path d="M40 27L35 15M60 27L65 15" stroke="${accent}" stroke-width="2.5" stroke-linecap="round"/><circle cx="35" cy="14" r="3.2" fill="${glow}"/><circle cx="65" cy="14" r="3.2" fill="${glow}"/>`
          : ''

    const eye = (x: number) => {
      switch (eyes) {
        case 'square':
          return `<rect x="${x - 3.6}" y="42.4" width="7.2" height="7.2" rx="1.6" fill="${glow}"/>`
        case 'happy':
          return `<path d="M${x - 3.6} 48Q${x} 41.5 ${x + 3.6} 48" stroke="${glow}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
        default:
          return `<circle cx="${x}" cy="46" r="6.5" fill="${glow}" opacity=".18"/><circle cx="${x}" cy="46" r="3.6" fill="${glow}"/>`
      }
    }
    const F: FaceSpec = {
      x: 50, ey: 46, gap: 8, my: 61.5, ink: glow, s: 0.85,
      eye: (x, y) => `<circle cx="${n(x)}" cy="${n(y)}" r="6.5" fill="${glow}" opacity=".18"/><circle cx="${n(x)}" cy="${n(y)}" r="3.6" fill="${glow}"/>`,
      extra: [74, 22],
    }
    const eyesSvg = mood !== 'neutral'
      ? faceEyes(F, mood) + faceBrows(F, mood)
      : eyes === 'visor'
        ? `<g data-lv-eye=""><rect x="38" y="43" width="24" height="6" rx="3" fill="${glow}" opacity=".25"/><g data-lv-depth="1.1"><rect x="45" y="43.5" width="10" height="5" rx="2.5" fill="${glow}"/></g></g>`
        : `<g data-lv-eye="">${eye(42)}</g><g data-lv-eye="">${eye(58)}</g>`

    let grill = ''
    for (let x = 43; x <= 57; x += 3.5) grill += `<path d="M${x} 62.5V66.5" stroke="${glow}" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>`

    return (
      `<defs><linearGradient id="${id}-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
      `<clipPath id="${id}-h"><rect x="28" y="26" width="44" height="47" rx="${rx}"/></clipPath></defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".1"><rect x="44" y="70" width="12" height="12" fill="#8e95ab"/>` +
      `<path d="M18 104C18 86 31 79 50 79C69 79 82 86 82 104Z" fill="${accent}"/><circle cx="50" cy="90" r="4" fill="${glow}" opacity=".85"/></g>` +
      `<g data-lv-depth=".45" data-lv-tilt="6">` +
      `<g data-lv-tilt="8">${ant}</g>` +
      `<rect x="22" y="40" width="8" height="16" rx="3" fill="${accent}"/><rect x="70" y="40" width="8" height="16" rx="3" fill="${accent}"/>` +
      `<rect x="28" y="26" width="44" height="47" rx="${rx}" fill="${metal}"/>` +
      `<rect x="28" y="26" width="44" height="47" rx="${rx}" fill="url(#${id}-m)"/>` +
      `<rect x="28" y="64" width="44" height="9" fill="${shade}" clip-path="url(#${id}-h)"/>` +
      `<g data-lv-depth=".35"><rect x="33" y="34" width="34" height="23" rx="${n(Math.min(rx, 9))}" fill="${SCREEN}"/>` +
      `<g data-lv-depth=".5">${eyesSvg}</g></g>` +
      `<g data-lv-depth=".3"><g data-lv-mouth="1"><rect x="40" y="60" width="20" height="9" rx="3.5" fill="${SCREEN}"/>${mood === 'neutral' ? grill : `<g transform="translate(50 64.5) scale(.62) translate(-50 -64.5)">${faceMouth({ ...F, my: 60.5, s: 1 }, mood)}</g>`}</g></g>` +
      faceExtras(F, mood) +
      `<circle cx="32.5" cy="30.5" r="1.3" fill="${shade}"/><circle cx="67.5" cy="30.5" r="1.3" fill="${shade}"/>` +
      `</g></g>`
    )
  },
})
