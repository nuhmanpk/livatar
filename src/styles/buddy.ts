import { defineStyle, n, safe } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

export interface BuddyOptions {
  hair?: 'short' | 'curly' | 'bun' | 'spiky' | 'long' | 'beanie' | 'bald' | 'afro' | 'mohawk' | 'ponytail' | 'random'
  mouth?: 'smile' | 'grin' | 'o' | 'smirk' | 'flat' | 'random'
  /** `true` means round frames. */
  glasses?: boolean | 'round' | 'square' | 'sun' | 'random'
  facialHair?: 'none' | 'beard' | 'mustache' | 'stubble' | 'goatee' | 'random'
  accessory?: 'none' | 'earrings' | 'headphones' | 'cap' | 'bow' | 'random'
  clothes?: 'tee' | 'hoodie' | 'collar' | 'vneck' | 'random'
  freckles?: boolean | 'random'
  skin?: string
  hairColor?: string
}

const INK = '#2a1f2d'
const SKIN = ['#ffe0c4', '#f7c9a2', '#e8ad7f', '#c98a5a', '#9b6337', '#6b4226']
const HAIR = ['#2b1d17', '#4a312c', '#8a4b26', '#b8763c', '#e0b45c', '#e9e2dc', '#c43c2a', '#3b3f8f']
const HAIRS = ['short', 'curly', 'bun', 'spiky', 'long', 'beanie', 'bald', 'afro', 'mohawk', 'ponytail'] as const

/** Friendly cartoon humans — avataaars / multiavatar vibes. */
export const buddy = defineStyle<BuddyOptions>({
  name: 'buddy',
  colors: ['#ffd6a5', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#fdffb6', '#ffadad'],
  defaults: { hair: 'random', mouth: 'random', glasses: 'random', facialHair: 'random', accessory: 'random', clothes: 'random', freckles: 'random' },
  variants: {
    hair: HAIRS,
    mouth: ['smile', 'grin', 'o', 'smirk', 'flat'],
    glasses: [false, 'round', 'square', 'sun'],
    facialHair: ['none', 'beard', 'mustache', 'stubble', 'goatee'],
    accessory: ['none', 'earrings', 'headphones', 'cap', 'bow'],
    clothes: ['tee', 'hoodie', 'collar', 'vneck'],
    freckles: [false, true],
    skin: SKIN,
    hairColor: HAIR,
  },
  render({ rand, color, background, mood, pick, options: o }) {
    const skin = safe(o.skin ?? rand.pick(SKIN))
    const hairC = safe(o.hairColor ?? rand.pick(HAIR))
    const shirt = color(background)
    const hat = color()
    const hair = pick('hair', [...HAIRS, 'short', 'curly'])
    const mouth = pick('mouth', ['smile', 'grin', 'o', 'smirk', 'flat', 'smile'])
    const g = o.glasses
    const glasses = g === 'random' || g == null ? (rand.bool(0.25) ? rand.pick(['round', 'square', 'round', 'sun'] as const) : false) : g === true ? 'round' : g
    const facial = pick('facialHair', ['none', 'none', 'none', 'none', 'beard', 'mustache', 'stubble', 'goatee'])
    const acc = pick('accessory', ['none', 'none', 'none', 'earrings', 'headphones', 'cap', 'bow'])
    const clothes = pick('clothes', ['tee', 'hoodie', 'collar', 'vneck'])
    const freckles = o.freckles === 'random' || o.freckles == null ? rand.bool(0.2) : o.freckles
    const shade = 'rgba(0,0,0,.12)'

    let back = ''
    let front = ''
    const H = (d: string) => `<path d="${d}" fill="${hairC}"/>`
    switch (hair) {
      case 'short':
        front = H('M28 48C25 28 37 21 51 21C65 21 76 29 72 48C70 39 64 34 57 33C50 37 40 37 33 38C30 41 29 44 28 48Z')
        break
      case 'curly': {
        let c = `<ellipse cx="50" cy="33" rx="22" ry="11" fill="${hairC}"/>`
        for (let i = 0; i <= 8; i++) {
          const a = Math.PI * (1.05 + (i / 8) * 0.9)
          c += `<circle cx="${n(50 + Math.cos(a) * 22)}" cy="${n(40 + Math.sin(a) * 17)}" r="${n(6.5 + rand.float(-0.8, 0.8))}" fill="${hairC}"/>`
        }
        front = c
        break
      }
      case 'bun':
        front = `<circle cx="50" cy="17" r="8" fill="${hairC}"/>` + H('M28 47C27 27 38 22 50 22C62 22 73 27 72 47C68 35 60 30 50 30C40 30 32 35 28 47Z')
        break
      case 'spiky':
        front = `<path d="M28 47L27 30L33 33L35 20L42 28L47 16L52 27L59 17L61 29L67 22L67 33L73 30L72 47C68 36 60 32 50 32C40 32 32 36 28 47Z" fill="${hairC}" stroke="${hairC}" stroke-width="1.5" stroke-linejoin="round"/>`
        break
      case 'long':
        back = H('M27 48C24 24 40 19 50 19C62 19 77 25 74 48L77 84C70 88 30 88 23 84Z')
        front = H('M28 47C27 28 38 21 50 21C63 21 73 28 72 47C66 36 58 31 46 33C40 36 33 40 28 47Z')
        break
      case 'beanie':
        front =
          `<path d="M27 44C27 24 38 17 50 17C62 17 73 24 73 44Z" fill="${hat}"/>` +
          `<rect x="25" y="37" width="50" height="9" rx="4.5" fill="${hat}"/><rect x="25" y="37" width="50" height="9" rx="4.5" fill="${shade}"/>` +
          `<circle cx="50" cy="16" r="5" fill="${hat}"/>`
        break
      case 'afro': {
        let c = ''
        for (let i = 0; i < 14; i++) {
          const a = Math.PI * (0.92 + (i / 13) * 1.16)
          c += `<circle cx="${n(50 + Math.cos(a) * 27)}" cy="${n(42 + Math.sin(a) * 24)}" r="${n(9 + rand.float(-1, 1))}" fill="${hairC}"/>`
        }
        back = c + `<ellipse cx="50" cy="36" rx="27" ry="20" fill="${hairC}"/>`
        front = H('M29 44C30 33 39 29 50 30C61 29 70 33 71 44C66 38 58 36 50 36C42 36 34 38 29 44Z')
        break
      }
      case 'mohawk':
        front = `<path d="M44 34C43 22 46 12 50 9C54 12 57 22 56 34Z" fill="${hairC}"/>` + `<path d="M29 46C29 38 31 34 34 32M71 46C71 38 69 34 66 32" stroke="${hairC}" stroke-width="3" opacity=".45" stroke-linecap="round" fill="none"/>`
        break
      case 'ponytail':
        back = `<path d="M66 30C80 30 84 46 80 62C78 70 74 74 72 72C76 60 74 44 64 38Z" fill="${hairC}"/>`
        front = H('M28 47C26 28 38 21 50 21C63 21 74 28 72 47C68 36 60 31 50 31C40 31 32 36 28 47Z') + `<circle cx="67" cy="33" r="3.5" fill="${hat}"/>`
        break
    }

    const eye = (x: number, y: number) =>
      `<ellipse cx="${n(x)}" cy="${n(y)}" rx="4.2" ry="4.6" fill="#fff"/>` +
      `<g data-lv-depth=".45"><circle cx="${n(x)}" cy="${n(y + 0.3)}" r="2.4" fill="${INK}"/><circle cx="${n(x - 0.8)}" cy="${n(y - 0.6)}" r=".8" fill="#fff"/></g>`
    const F: FaceSpec = { x: 50, ey: 50, gap: 9, my: 60, ink: INK, eye, extra: [72, 30] }

    const mouths = {
      smile: `<path d="M44.5 61Q50 66 55.5 61" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      grin: `<path d="M43.5 60Q50 69 56.5 60Z" fill="${INK}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/><path d="M45 60.6H55" stroke="#fff" stroke-width="1.6"/>`,
      o: `<ellipse cx="50" cy="62" rx="2.3" ry="2.8" fill="${INK}"/>`,
      smirk: `<path d="M45 62Q51 65 56 60" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      flat: `<path d="M46 62H54" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,
    }

    const beard = hairC
    const facialSvg =
      facial === 'beard'
        ? `<path d="M29 52C29 70 38 76 50 76C62 76 71 70 71 52C68 60 63 64 57 64C54 61 46 61 43 64C37 64 32 60 29 52Z" fill="${beard}"/>`
        : facial === 'mustache'
          ? `<path d="M50 58C46 56 41 57 40 61C44 60 47 61 50 60C53 61 56 60 60 61C59 57 54 56 50 58Z" fill="${beard}"/>`
          : facial === 'stubble'
            ? `<path d="M31 56C33 70 41 74 50 74C59 74 67 70 69 56C64 64 57 66 50 66C43 66 36 64 31 56Z" fill="${beard}" opacity=".22"/>`
            : facial === 'goatee'
              ? `<path d="M45 66C45 71 47 74 50 74C53 74 55 71 55 66C53 67 47 67 45 66Z" fill="${beard}"/>`
              : ''

    const lens =
      glasses === 'sun'
        ? `<g fill="${INK}"><rect x="33.5" y="45" width="14" height="10" rx="4"/><rect x="52.5" y="45" width="14" height="10" rx="4"/><path d="M47.5 49Q50 47.5 52.5 49" stroke="${INK}" stroke-width="1.6" fill="none"/></g><path d="M36 47.5L39 46.5" stroke="#fff" stroke-width="1.2" opacity=".6"/>`
        : glasses === 'square'
          ? `<g fill="rgba(255,255,255,.15)" stroke="${INK}" stroke-width="1.6"><rect x="34" y="44.5" width="13.5" height="11" rx="2"/><rect x="52.5" y="44.5" width="13.5" height="11" rx="2"/><path d="M47.5 50Q50 48.5 52.5 50" fill="none"/></g>`
          : glasses
            ? `<g fill="rgba(255,255,255,.15)" stroke="${INK}" stroke-width="1.6"><circle cx="41" cy="50" r="6.5"/><circle cx="59" cy="50" r="6.5"/><path d="M47.5 50Q50 48.5 52.5 50" fill="none"/></g>`
            : ''

    const accBack = acc === 'headphones' ? `<path d="M26 50C24 28 36 18 50 18C64 18 76 28 74 50" stroke="${INK}" stroke-width="3.5" fill="none"/>` : ''
    const accFront =
      acc === 'earrings'
        ? `<circle cx="29" cy="59" r="1.8" fill="#ffd23f"/><circle cx="71" cy="59" r="1.8" fill="#ffd23f"/>`
        : acc === 'headphones'
          ? `<rect x="22" y="44" width="9" height="15" rx="4" fill="${hat}"/><rect x="69" y="44" width="9" height="15" rx="4" fill="${hat}"/>`
          : acc === 'cap'
            ? `<path d="M28 38C28 22 38 17 50 17C62 17 72 22 72 38Z" fill="${hat}"/><path d="M50 36H86C84 41 76 42 66 41H50Z" fill="${hat}"/><path d="M50 36H86C84 41 76 42 66 41H50Z" fill="${shade}"/><circle cx="50" cy="17" r="2" fill="${shade}"/>`
            : acc === 'bow'
              ? `<g transform="rotate(-15 33 27)"><path d="M33 27L24 21V33ZM33 27L42 21V33Z" fill="${hat}"/><circle cx="33" cy="27" r="2.6" fill="${hat}"/><circle cx="33" cy="27" r="2.6" fill="${shade}"/></g>`
              : ''

    const neck = `<rect x="44" y="64" width="12" height="16" fill="${skin}"/><rect x="44" y="64" width="12" height="16" fill="${shade}"/>`
    const torso = `<path d="M15 104C15 84 30 76 50 76C70 76 85 84 85 104Z" fill="${shirt}"/>`
    const collarSvg =
      clothes === 'hoodie'
        ? `<path d="M33 78C36 90 64 90 67 78C62 82 56 84 50 84C44 84 38 82 33 78Z" fill="${shade}"/><path d="M45 86V96M55 86V96" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`
        : clothes === 'collar'
          ? `<path d="M41 76L50 86L59 76L57 74L50 80L43 74Z" fill="#fff"/><path d="M50 86V104" stroke="${shade}" stroke-width="1.2"/>`
          : clothes === 'vneck'
            ? `<path d="M42 76L50 88L58 76Z" fill="${skin}"/><path d="M42 76L50 88L58 76" stroke="${shade}" stroke-width="1.5" fill="none"/>`
            : `<path d="M43 76Q50 83 57 76" fill="${skin}"/>`

    const hand = (x: number, side: 1 | -1) =>
      `<g transform="rotate(${side * 10} ${x} 52)">` +
      `<rect x="${x - 7}" y="58" width="14" height="50" rx="6" fill="${shirt}"/>` +
      `<rect x="${x - 9.5}" y="39" width="19" height="25" rx="8.5" fill="${skin}" stroke="rgba(0,0,0,.18)" stroke-width="1"/>` +
      `<path d="M${x - 4} 41.5v9M${x} 40.5v10M${x + 4} 41.5v9" stroke="rgba(0,0,0,.16)" stroke-width="1.2" stroke-linecap="round"/>` +
      `</g>`

    const neutral = mood === 'neutral'
    const brows = faceBrows(F, mood) ||
      `<path d="M37 42.5Q41 40.5 45 42.5M55 42.5Q59 40.5 63 42.5" stroke="${hair === 'bald' ? INK : hairC}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".85"/>`
    const freckleSvg = freckles
      ? `<g fill="#a0522d" opacity=".35"><circle cx="36" cy="56" r=".9"/><circle cx="39" cy="57.5" r=".9"/><circle cx="34" cy="58.5" r=".9"/><circle cx="64" cy="56" r=".9"/><circle cx="61" cy="57.5" r=".9"/><circle cx="66" cy="58.5" r=".9"/></g>`
      : ''

    return (
      `<g data-lv-body="">` +
      `<g data-lv-depth=".12">${neck}${torso}${collarSvg}</g>` +
      `<g data-lv-depth=".45" data-lv-tilt="5">` +
      back +
      accBack +
      `<ellipse cx="29" cy="52" rx="4" ry="5.5" fill="${skin}"/><ellipse cx="71" cy="52" rx="4" ry="5.5" fill="${skin}"/>` +
      `<ellipse cx="50" cy="50" rx="21" ry="24" fill="${skin}"/>` +
      (facial === 'mustache' ? '' : facialSvg) +
      front +
      accFront +
      `<g data-lv-depth=".5">` +
      `<g data-lv-depth=".3">${brows}</g>` +
      faceEyes(F, mood) +
      `<path d="M50 52Q48 56 51 57" stroke="${INK}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".35"/>` +
      (mood === 'happy' ? '' : `<ellipse cx="36" cy="58" rx="3.6" ry="2" fill="#ff6b8a" opacity=".28"/><ellipse cx="64" cy="58" rx="3.6" ry="2" fill="#ff6b8a" opacity=".28"/>`) +
      freckleSvg +
      `<g data-lv-mouth="1">${neutral ? mouths[mouth] : faceMouth(F, mood)}</g>` +
      (facial === 'mustache' ? facialSvg : '') +
      lens +
      faceExtras(F, mood) +
      `</g>` +
      // hands that cover the eyes on password fields (hidden unless shy)
      `<g data-lv-shy="" opacity="0">` +
      hand(39, -1) + hand(61, 1) +
      `</g></g></g>`
    )
  },
})
