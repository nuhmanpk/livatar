import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

export interface EmojiOptions {
  tone?: 'yellow' | 'orange' | 'pink' | 'blue' | 'green' | 'random'
  eyes?: 'dot' | 'oval' | 'sparkle' | 'random'
  mouth?: 'smile' | 'grin' | 'flat' | 'o' | 'random'
  blush?: boolean | 'random'
}

const INK = '#3d2614'
const TONES = {
  yellow: ['#ffe873', '#f9b208'],
  orange: ['#ffcf80', '#f57c1f'],
  pink: ['#ffd0e0', '#f0648f'],
  blue: ['#b6e2ff', '#3d8bfd'],
  green: ['#d2f5a6', '#4cae4f'],
}

/** The classic round smiley — the showcase for moods. */
export const emoji = defineStyle<EmojiOptions>({
  name: 'emoji',
  colors: ['#a0c4ff', '#bdb2ff', '#ffc6ff', '#caffbf', '#9bf6ff', '#ffadad', '#fdffb6', '#ffd6a5'],
  defaults: { tone: 'random', eyes: 'random', mouth: 'random', blush: 'random' },
  variants: { tone: ['yellow', 'orange', 'pink', 'blue', 'green'], eyes: ['dot', 'oval', 'sparkle'], mouth: ['smile', 'grin', 'flat', 'o'], blush: [true, false] },
  render({ pick, id, mood }) {
    const tone = pick('tone', ['yellow', 'yellow', 'yellow', 'orange', 'pink', 'blue', 'green'])
    const eyesK = pick('eyes', ['dot', 'oval', 'sparkle'])
    const mouthK = pick('mouth', ['smile', 'grin', 'flat', 'o'])
    const blush = pick('blush', [true, false])
    const [c1, c2] = TONES[tone] ?? TONES.yellow

    const eye = (x: number, y: number) =>
      `<g data-lv-depth=".45"><ellipse cx="${n(x)}" cy="${n(y)}" rx="3.8" ry="5.6" fill="${INK}"/><circle cx="${n(x - 1.2)}" cy="${n(y - 2.2)}" r="1.4" fill="#fff"/></g>`
    const F: FaceSpec = { x: 50, ey: 44, gap: 13, my: 61, ink: INK, s: 1.5, eye }

    const neutralEye = (x: number) =>
      eyesK === 'dot'
        ? `<g data-lv-depth=".45"><circle cx="${x}" cy="44" r="4.4" fill="${INK}"/><circle cx="${x - 1.4}" cy="42.6" r="1.3" fill="#fff"/></g>`
        : eyesK === 'sparkle'
          ? `<circle cx="${x}" cy="44" r="7" fill="${INK}"/><g data-lv-depth=".45"><circle cx="${x - 2.2}" cy="41.6" r="2.4" fill="#fff"/><circle cx="${x + 2.4}" cy="47" r="1.2" fill="#fff"/></g>`
          : eye(x, 44)
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${neutralEye(37)}</g><g data-lv-eye="">${neutralEye(63)}</g>` : faceEyes(F, mood)

    const mouths = {
      smile: `<path d="M36 61Q50 74 64 61" stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
      grin:
        `<path d="M33 59Q50 82 67 59Z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>` +
        `<path d="M35.5 60.5H64.5L63 63.5H37Z" fill="#fff"/><ellipse cx="50" cy="70" rx="6" ry="2.8" fill="#ff7a93"/>`,
      flat: `<path d="M40 64H60" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`,
      o: `<ellipse cx="50" cy="65" rx="4.6" ry="5.6" fill="${INK}"/>`,
    }
    const mouth = mood === 'neutral' ? mouths[mouthK] : faceMouth(F, mood)

    return (
      `<defs><radialGradient id="${id}-f" cx=".4" cy=".32" r=".75"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".2" data-lv-tilt="4">` +
      `<circle cx="50" cy="52" r="40" fill="url(#${id}-f)"/>` +
      `<circle cx="50" cy="52" r="39.3" fill="none" stroke="rgba(0,0,0,.1)" stroke-width="1.4"/>` +
      `<ellipse cx="35" cy="26" rx="10" ry="5" fill="#fff" opacity=".4" transform="rotate(-30 35 26)"/>` +
      `<g data-lv-depth=".7" data-lv-tilt="6">` +
      eyes + faceBrows(F, mood) +
      (blush && mood !== 'happy' ? `<ellipse cx="29" cy="57" rx="5.4" ry="3" fill="#ff5c8a" opacity=".3"/><ellipse cx="71" cy="57" rx="5.4" ry="3" fill="#ff5c8a" opacity=".3"/>` : '') +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g></g></g>`
    )
  },
})
