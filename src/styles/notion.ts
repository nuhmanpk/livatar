import { defineStyle, n, safe } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'
import { C, M, P, S } from './_people'

const HAIRS = ['short', 'curly', 'long', 'bun', 'mohawk', 'side', 'bald'] as const
const ACCESSORIES = ['none', 'glasses', 'earring', 'cap', 'headphones'] as const
const BEARDS = ['none', 'stubble', 'full', 'mustache'] as const

export interface NotionOptions {
  hair?: (typeof HAIRS)[number] | 'random'
  accessory?: (typeof ACCESSORIES)[number] | 'random'
  beard?: (typeof BEARDS)[number] | 'random'
  /** Line color. Default near-black. */
  ink?: string
  /** Face / shirt fill. Default white. */
  paper?: string
}

const HEAD = 'M50 22C64 22 72 32 72 47C72 64 62 76 50 76C38 76 28 64 28 47C28 32 36 22 50 22Z'

/** Minimal black-ink line portraits in the style of hand-drawn product illustrations. */
export const notion = defineStyle<NotionOptions>({
  name: 'notion',
  colors: ['#f6f5f4', '#fbe4e4', '#fdecc8', '#dbeddb', '#d3e5ef', '#e8deee', '#fadec9', '#eeeeee'],
  defaults: { hair: 'random', accessory: 'random', beard: 'random' },
  variants: { hair: HAIRS, accessory: ACCESSORIES, beard: BEARDS },
  render({ pick, mood, options: o }) {
    const hair = pick('hair', HAIRS)
    const acc = pick('accessory', ['none', 'none', 'glasses', 'glasses', 'earring', 'cap', 'headphones'])
    const beard = pick('beard', ['none', 'none', 'none', 'stubble', 'full', 'mustache'])
    const ink = safe(o.ink && o.ink !== 'random' ? o.ink : '#191919')
    const paper = safe(o.paper && o.paper !== 'random' ? o.paper : '#ffffff')
    const L = (d: string, w = 2.2) => S(d, ink, w)
    const F_ = (d: string) => P(d, ink)

    let back = ''
    let top = ''
    switch (hair) {
      case 'short':
        top = F_('M28 44C26 28 37 19 51 19C64 19 74 27 72 44C70 36 66 32 62 31C56 34 44 34 36 31C32 34 29 38 28 44Z')
        break
      case 'curly': {
        let c = ''
        for (const [x, y, r] of [[32, 34, 6], [37, 25, 7], [46, 19, 7.5], [56, 19, 7.5], [64, 25, 7], [69, 34, 6], [42, 29, 5], [58, 29, 5]] as const)
          c += C(x, y, r, ink)
        top = c
        break
      }
      case 'long':
        back = F_('M26 46C24 26 37 17 50 17C64 17 77 26 74 46L77 82Q66 86 60 80L40 80Q34 86 23 82Z')
        top = F_('M28 46C27 28 38 19 50 19C63 19 73 28 72 46C64 40 56 32 52 26C48 34 38 41 28 46Z')
        break
      case 'bun':
        back = C(50, 15, 8, ink)
        top = F_('M28.5 44C28 29 38 21 50 21C62 21 72 29 71.5 44C66 34 59 29 50 29C41 29 34 34 28.5 44Z')
        break
      case 'mohawk':
        top = F_('M44 30C42 20 45 11 50 8C55 11 58 20 56 30Z') + L('M31 40L33 36M69 40L67 36', 1.6)
        break
      case 'side':
        top = F_('M27 46C25 27 37 18 52 18C66 18 76 28 72 44C66 33 52 30 40 33C34 35 30 40 27 46Z')
        break
    }

    const ey = 48
    const gap = 9
    const my = 63
    const eye = (x: number, y: number) => C(x, y, 1.9, ink)
    const F: FaceSpec = { x: 50, ey, gap, my, ink, s: 0.85, eye }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${eye(50 - gap, ey)}</g><g data-lv-eye="">${eye(50 + gap, ey)}</g>` : faceEyes(F, mood)
    const mouth = mood === 'neutral' ? L(`M45 ${my}Q50 ${my + 3.5} 55 ${my}`, 1.9) : faceMouth(F, mood)
    const brows = mood === 'neutral' || mood === 'happy' ? M(L('M38 41.5Q41 40 44 41', 1.8)) : faceBrows(F, mood)

    const beardSvg =
      beard === 'full'
        ? F_('M29 52C29 68 38 80 50 80C62 80 71 68 71 52C68 60 64 60 60 59C56 57 44 57 40 59C36 60 32 60 29 52Z')
        : beard === 'stubble'
          ? (() => {
              let d = ''
              for (let i = 0; i < 14; i++) {
                const a = (i / 13) * Math.PI
                d += `M${n(50 - Math.cos(a) * 16)} ${n(66 + Math.sin(a) * 8)}h.1`
              }
              return L(d, 1.6)
            })()
          : beard === 'mustache'
            ? F_('M42 60Q46 56 50 58.5Q54 56 58 60Q54 61 50 60Q46 61 42 60Z')
            : ''
    const extra =
      acc === 'glasses'
        ? M(`<circle cx="41" cy="48" r="6" fill="none" stroke="${ink}" stroke-width="1.8"/>`) + L('M47 47.5Q50 46 53 47.5M35 47L29 45M65 47L71 45', 1.8)
        : acc === 'earring'
          ? C(28.5, 59, 1.8, 'none', ` stroke="${ink}" stroke-width="1.4"`)
          : acc === 'cap'
            ? F_('M27 38C27 24 37 17 50 17C63 17 73 24 73 38Z') + F_('M66 34Q80 34 84 39L70 40Z') + C(50, 17, 1.6, paper)
            : acc === 'headphones'
              ? L('M27 46C25 20 75 20 73 46', 3.2) + `<rect x="22" y="42" width="8" height="14" rx="3.5" fill="${ink}"/><rect x="70" y="42" width="8" height="14" rx="3.5" fill="${ink}"/>`
              : ''

    return (
      `<g data-lv-body="">` +
      `<g data-lv-depth=".12">` +
      P('M16 108C16 88 31 79 50 79C69 79 84 88 84 108Z', paper, ` stroke="${ink}" stroke-width="2.2"`) +
      L('M42 80Q50 88 58 80M50 87V108', 1.8) +
      `<rect x="44" y="70" width="12" height="9" fill="${paper}"/>` +
      `<path d="M44 70V80M56 70V80" stroke="${ink}" stroke-width="2.2"/>` +
      `</g>` +
      `<g data-lv-depth=".45" data-lv-tilt="5">` +
      back +
      M(P('M29 45C24 44 23 53 29.5 55', paper, ` stroke="${ink}" stroke-width="2"`)) +
      `<path d="${HEAD}" fill="${paper}" stroke="${ink}" stroke-width="2.4"/>` +
      top +
      beardSvg +
      `<g data-lv-depth=".6">` +
      eyes +
      brows +
      L('M50 50Q48 56 51 57', 1.6) +
      `<g data-lv-mouth="1">${beard === 'full' ? `<g>${mouth.split(ink).join(paper)}</g>` : mouth}</g>` +
      extra +
      faceExtras(F, mood) +
      `</g></g></g>`
    )
  },
})
