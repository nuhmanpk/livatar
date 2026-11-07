import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

export interface GhostOptions {
  accessory?: 'none' | 'bow' | 'hat' | 'crown' | 'halo' | 'random'
  blush?: boolean | 'random'
}

const INK = '#2b2440'
const SHEET = ['#ffffff', '#f3f0ff', '#eafaff', '#fff2f7', '#f0fff5']
// the sheet: a dome that widens into a wavy hem
const BODY = 'M26 46C26 29 37 19 50 19C63 19 74 29 74 46L77 80q-3.4 6-6.8 0t-6.8 0t-6.8 0t-6.8 0t-6.7 0t-6.7 0t-6.7 0t-6.7 0L26 46Z'

/** Floaty sheet ghosts — boo, but cute. */
export const ghost = defineStyle<GhostOptions>({
  name: 'ghost',
  colors: ['#6c5ce7', '#2d3561', '#5f7adb', '#3d405b', '#e56b9f', '#00a896', '#e17055', '#8e7dbe'],
  defaults: { accessory: 'random', blush: 'random' },
  variants: { accessory: ['none', 'bow', 'hat', 'crown', 'halo'], blush: [true, false] },
  render({ rand, pick, color, id, mood }) {
    const sheet = rand.pick(SHEET)
    const acc = pick('accessory', ['none', 'none', 'bow', 'hat', 'crown', 'halo'])
    const blush = pick('blush', [true, false])
    const tint = color(sheet)

    const eye = (x: number, y: number) =>
      `<g data-lv-depth=".45"><ellipse cx="${n(x)}" cy="${n(y)}" rx="3.3" ry="4.6" fill="${INK}"/><circle cx="${n(x - 1)}" cy="${n(y - 1.7)}" r="1.2" fill="#fff"/></g>`
    const F: FaceSpec = { x: 50, ey: 44, gap: 9, my: 54, ink: INK, s: 1, eye }
    const variant = rand.pick(['oval', 'round', 'dot'] as const)
    const neutralEye = (x: number) =>
      variant === 'oval'
        ? eye(x, 44)
        : variant === 'round'
          ? `<circle cx="${x}" cy="44" r="4.6" fill="#fff" stroke="${INK}" stroke-width="1.2"/><g data-lv-depth=".45"><circle cx="${x}" cy="44.4" r="2.6" fill="${INK}"/></g>`
          : `<g data-lv-depth=".45"><circle cx="${x}" cy="44" r="2.8" fill="${INK}"/></g>`
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${neutralEye(41)}</g><g data-lv-eye="">${neutralEye(59)}</g>` : faceEyes(F, mood)
    const mouth =
      mood === 'neutral'
        ? rand.pick([
            `<ellipse cx="50" cy="56.5" rx="3.2" ry="4" fill="${INK}"/><ellipse cx="50" cy="58" rx="2" ry="1.4" fill="#ff7a93"/>`,
            `<path d="M45 54Q50 59 55 54" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
            `<path d="M44.5 54q2.75 3 5.5 0q2.75 3 5.5 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
          ])
        : faceMouth(F, mood)

    const accSvg =
      acc === 'bow'
        ? `<g transform="rotate(-20 35 25)"><path d="M35 25L26 19V31ZM35 25L44 19V31Z" fill="${tint}" stroke="${tint}" stroke-width="2" stroke-linejoin="round"/><circle cx="35" cy="25" r="2.8" fill="${tint}"/><circle cx="35" cy="25" r="2.8" fill="rgba(0,0,0,.15)"/></g>`
        : acc === 'hat'
          ? `<g transform="rotate(8 50 22)"><ellipse cx="50" cy="24" rx="20" ry="4.5" fill="${INK}"/><path d="M38 23Q44 15 47 4Q51 2 54 6L62 23Z" fill="${INK}"/><path d="M38.8 21.5L61.2 21.5L60.6 19L39.6 19Z" fill="${tint}"/></g>`
          : acc === 'crown'
            ? `<path d="M38 22L36 10L43 16L50 7L57 16L64 10L62 22Z" fill="#ffd23f" stroke="#f0a500" stroke-width="1.2" stroke-linejoin="round"/><circle cx="50" cy="17" r="1.8" fill="#ff4d6d"/>`
            : acc === 'halo'
              ? `<g data-lv-depth=".9"><ellipse cx="50" cy="11" rx="13" ry="3.6" fill="none" stroke="#ffd23f" stroke-width="2.8"/></g>`
              : ''

    return (
      `<defs><linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2=".3"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient></defs>` +
      `<ellipse cx="50" cy="93" rx="17" ry="3.2" fill="rgba(0,0,0,.18)"/>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".3" data-lv-tilt="4">` +
      `<ellipse cx="24.5" cy="62" rx="4.5" ry="7" fill="${sheet}" transform="rotate(35 24.5 62)"/><ellipse cx="75.5" cy="62" rx="4.5" ry="7" fill="${sheet}" transform="rotate(-35 75.5 62)"/>` +
      `<path d="${BODY}" fill="${sheet}"/><path d="${BODY}" fill="url(#${id}-g)"/>` +
      `<ellipse cx="38" cy="29" rx="5" ry="2.6" fill="#fff" opacity=".8" transform="rotate(-35 38 29)"/>` +
      accSvg +
      `<g data-lv-depth=".75">` +
      eyes + faceBrows(F, mood) +
      (blush && mood !== 'happy' ? `<ellipse cx="35" cy="51" rx="3.6" ry="2" fill="#ff5c8a" opacity=".35"/><ellipse cx="65" cy="51" rx="3.6" ry="2" fill="#ff5c8a" opacity=".35"/>` : '') +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g></g></g>`
    )
  },
})
