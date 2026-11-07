import { defineStyle, n, safe } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const ACTIVITIES = ['coding', 'thinking', 'debugging', 'solved', 'coffee', 'reviewing', 'shipping', 'stuck'] as const
const HAIRS = ['short', 'long', 'curly', 'bun', 'buzz', 'beanie'] as const
type Activity = (typeof ACTIVITIES)[number]

export interface DevOptions {
  /** What the developer is up to. */
  activity?: Activity | 'random'
  hair?: (typeof HAIRS)[number] | 'random'
  skin?: string
  hairColor?: string
  /** Hoodie color. */
  hoodie?: string
  glasses?: boolean | 'random'
  headphones?: boolean | 'random'
}

const INK = '#2a1f2d'
const OL = '#1f2a44'
const SKIN = ['#ffe0c4', '#f3c29b', '#d99a6c', '#a86b42', '#6b4226']
const HAIR = ['#2b1d17', '#5a3825', '#b8763c', '#e0b45c', '#c43c2a', '#3b3f8f']
const HOODIE = ['#5b7cfa', '#2ec4b6', '#ff6b8b', '#8e6cf0', '#ff9f43', '#3d4a66', '#4cc38a']

const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const E = (cx: number, cy: number, rx: number, ry: number, fill: string, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
const R = (x: number, y: number, w: number, h: number, rx: number, fill: string, extra = '') =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(rx)}" fill="${fill}"${extra}/>`
const ol = (w = 2.4) => ` stroke="${OL}" stroke-width="${w}" stroke-linejoin="round"`
const float = (svg: string) => `<g data-lv-float="">${svg}</g>`

/** A cute developer at work: coding, debugging, shipping… */
export const dev = defineStyle<DevOptions>({
  name: 'dev',
  colors: ['#dff1ff', '#e8f7e4', '#efe6ff', '#fff4c7', '#ffe0ea', '#d9f3f1', '#ffe9d6', '#e6ebf5'],
  defaults: { activity: 'random', hair: 'random', glasses: 'random', headphones: 'random' },
  variants: { activity: ACTIVITIES, hair: HAIRS, skin: SKIN, hairColor: HAIR, hoodie: HOODIE, glasses: [true, false], headphones: [true, false] },
  render({ rand, pick, id, mood, options: o }) {
    const activity = pick('activity', ACTIVITIES)
    const hair = pick('hair', HAIRS)
    const skin = safe(o.skin && o.skin !== 'random' ? o.skin : rand.pick(SKIN))
    const hairC = safe(o.hairColor && o.hairColor !== 'random' ? o.hairColor : rand.pick(HAIR))
    const hood = safe(o.hoodie && o.hoodie !== 'random' ? o.hoodie : rand.pick(HOODIE))
    const glasses = activity === 'reviewing' || pick('glasses', [true, false, false])
    const phones = pick('headphones', [true, false, false])
    const beanieC = rand.pick(['#ff6b6b', '#ffd23f', '#2ec4b6', '#8e6cf0'])
    const shade = 'rgba(0,0,0,.13)'

    /* ---------- head (drawn in buddy coordinates, then scaled) ---------- */
    const H = (d: string) => `<path d="${d}" fill="${hairC}"${ol(2.6)}/>`
    let hBack = ''
    let hFront = ''
    switch (hair) {
      case 'short':
        hFront = H('M28 48C25 28 37 21 51 21C65 21 76 29 72 48C70 39 64 34 57 33C50 37 40 37 33 38C30 41 29 44 28 48Z')
        break
      case 'long':
        hBack = H('M27 48C24 24 40 19 50 19C62 19 77 25 74 48L76 78C68 82 32 82 24 78Z')
        hFront = H('M28 47C27 28 38 21 50 21C63 21 73 28 72 47C66 36 58 31 46 33C40 36 33 40 28 47Z')
        break
      case 'curly': {
        let c = ''
        for (let i = 0; i <= 8; i++) {
          const a = Math.PI * (1.05 + (i / 8) * 0.9)
          c += C(50 + Math.cos(a) * 22, 40 + Math.sin(a) * 17, 6.5 + rand.float(-0.6, 0.6), hairC, ol(2.6))
        }
        hFront = c + E(50, 33, 21, 10, hairC)
        for (let i = 1; i < 8; i++) {
          const a = Math.PI * (1.05 + (i / 8) * 0.9)
          hFront += C(50 + Math.cos(a) * 22, 40 + Math.sin(a) * 17, 5, hairC)
        }
        break
      }
      case 'bun':
        hFront = C(50, 17, 8, hairC, ol(2.6)) + H('M28 47C27 27 38 22 50 22C62 22 73 27 72 47C68 35 60 30 50 30C40 30 32 35 28 47Z')
        break
      case 'buzz':
        hFront = `<path d="M29.5 44C29 29 39 24 50 24C61 24 71 29 70.5 44C67 37 60 34 50 34C40 34 33 37 29.5 44Z" fill="${hairC}" opacity=".85"/>`
        break
      case 'beanie':
        hFront =
          `<path d="M27 44C27 24 38 16 50 16C62 16 73 24 73 44Z" fill="${beanieC}"${ol(2.6)}/>` +
          S('M38 22V38M44 19V38M50 18V38M56 19V38M62 22V38', shade, 1.6) +
          R(25, 37, 50, 9, 4.5, beanieC, ol(2.6)) +
          R(25, 37, 50, 9, 4.5, shade) +
          C(50, 14, 5, beanieC, ol(2.6))
        break
    }
    const eye = (x: number, y: number) =>
      E(x, y, 4.2, 4.6, '#fff') +
      `<g data-lv-depth=".45">${C(x, y + 0.3, 2.5, INK)}${C(x - 0.8, y - 0.6, 0.85, '#fff')}</g>`
    const F: FaceSpec = { x: 50, ey: 50, gap: 9, my: 60, ink: INK, eye, extra: ['thinking', 'solved', 'shipping', 'stuck'].includes(activity) ? [28, 30] : [72, 30] }
    const neutralMouth = S('M44.5 61Q50 66 55.5 61', INK, 2.1)
    const brows =
      faceBrows(F, mood) || S('M37 42.5Q41 40.5 45 42.5M55 42.5Q59 40.5 63 42.5', hair === 'buzz' || hair === 'beanie' ? INK : hairC, 2.1, ' opacity=".85"')
    const lens = glasses
      ? `<g fill="rgba(255,255,255,.18)" stroke="${INK}" stroke-width="1.8"><circle cx="41" cy="50" r="6.6"/><circle cx="59" cy="50" r="6.6"/><path d="M47.6 50Q50 48.4 52.4 50" fill="none"/></g>` +
        S('M37.5 47L39.5 45.5M55.5 47L57.5 45.5', '#fff', 1.2, ' opacity=".8"')
      : ''
    const phonesBack = phones ? S('M25 50C22 26 35 15 50 15C65 15 78 26 75 50', OL, 6) + S('M25 50C22 26 35 15 50 15C65 15 78 26 75 50', '#56607a', 3) : ''
    const phonesFront = phones
      ? R(20, 43, 10, 16, 4.5, hood, ol(2.6)) + R(70, 43, 10, 16, 4.5, hood, ol(2.6)) + R(22, 46, 3, 9, 1.5, '#fff', ' opacity=".4"')
      : ''
    const sweat =
      activity === 'stuck'
        ? `<path d="M72 30C72 30 66 37 66 40.5C66 43.5 68.7 45.5 72 45.5C75.3 45.5 78 43.5 78 40.5C78 37 72 30 72 30Z" fill="#8fd3ff"${ol(2)}/>` +
          E(70.3, 40, 1.2, 2, '#fff', ' opacity=".8"')
        : ''

    const head =
      `<g transform="translate(50 41) scale(.78) translate(-50 -50)">` +
      hBack +
      phonesBack +
      E(29, 52, 4, 5.5, skin, ol(2.6)) +
      E(71, 52, 4, 5.5, skin, ol(2.6)) +
      E(50, 50, 21, 24, skin, ol(2.8)) +
      E(56, 62, 14, 10, shade, ' opacity=".35"') +
      hFront +
      phonesFront +
      `<g data-lv-depth=".5">` +
      `<g data-lv-depth=".3">${brows}</g>` +
      faceEyes(F, mood) +
      S('M50 52Q48 56 51 57', INK, 1.4, ' opacity=".35"') +
      (mood === 'happy' ? '' : E(36, 58, 3.6, 2, '#ff6b8a', ' opacity=".32"') + E(64, 58, 3.6, 2, '#ff6b8a', ' opacity=".32"')) +
      `<g data-lv-mouth="1">${mood === 'neutral' ? neutralMouth : faceMouth(F, mood)}</g>` +
      lens +
      faceExtras(F, mood) +
      sweat +
      `</g></g>`

    /* ---------- torso ---------- */
    const torso =
      `<rect x="44" y="56" width="12" height="12" fill="${skin}"${ol(2.4)}/><rect x="44" y="56" width="12" height="12" fill="${shade}"/>` +
      `<path d="M12 104C12 80 28 68 50 68C72 68 88 80 88 104Z" fill="${hood}"${ol(2.8)}/>` +
      `<path d="M12 104C12 80 28 68 50 68C72 68 88 80 88 104Z" fill="url(#${id}-h)"/>` +
      `<path d="M33 70C36 82 64 82 67 70C62 74 56 76 50 76C44 76 38 74 33 70Z" fill="${shade}"/>` +
      S('M45 78V88M55 78V88', '#fff', 1.6, ' opacity=".85"') +
      C(45, 89, 1.3, '#fff') +
      C(55, 89, 1.3, '#fff')

    /* ---------- props ---------- */
    const hand = (x: number, y: number, r = 5) => C(x, y, r, skin, ol(2.2)) + C(x - r * 0.3, y - r * 0.35, r * 0.35, '#fff', ' opacity=".35"')
    const sleeve = (d: string) => S(d, OL, 11.5) + S(d, hood, 7)
    let back = '' // behind the body (props up high)
    let fore = '' // in front of the body
    switch (activity) {
      case 'coding': {
        const glow = '#8ff0ff'
        const cols = ['#ff7eb6', '#7ee787', '#79c0ff', '#ffd866', '#d2a8ff']
        let code = ''
        const rows = [[0, 18], [6, 14], [6, 20], [12, 10], [6, 16], [0, 8]]
        rows.forEach(([ind, w], i) => {
          const y = 68.5 + i * 3
          const c = cols[(i + rand.int(0, 4)) % cols.length]
          code +=
            `<rect x="${31 + ind}" y="${n(y)}" width="${w}" height="1.8" rx=".9" fill="${c}">` +
            `<animate attributeName="width" values="0;${w};${w};${w}" keyTimes="0;.35;.9;1" dur="3s" begin="${n(i * 0.25)}s" repeatCount="indefinite"/></rect>`
        })
        code += `<rect x="31" y="85.5" width="1.6" height="2.4" fill="${glow}"><animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/></rect>`
        fore =
          E(50, 76, 30, 16, glow, ' opacity=".25"') +
          R(26, 64, 48, 26, 4, '#262c48', ol(2.8)) +
          R(29, 66.5, 42, 21, 2.5, '#1a1f36') +
          code +
          P('M64 67H70V73Z', '#fff', ' opacity=".08"') +
          R(16, 88, 68, 6, 3, '#cfd8e6', ol(2.6)) +
          hand(24, 87, 4.6) +
          hand(76, 87, 4.6)
        break
      }
      case 'thinking': {
        fore = sleeve('M72 100C72 86 68 74 60 64') + hand(59, 61, 5) + S('M56 58.5Q59 57 62 58.5', 'rgba(0,0,0,.18)', 1.2)
        back = float(
          C(70, 30, 2, '#fff', ol(2)) +
            C(75, 23, 3, '#fff', ol(2)) +
            `<path d="M70 15C70 9 76 6 81 8C84 4 92 5 93 11C96 14 95 21 90 22C89 26 82 27 79 24C74 26 69 22 70 15Z" fill="#fff"${ol(2.4)}/>` +
            C(76, 15.5, 1.6, OL) +
            C(81.5, 15.5, 1.6, OL) +
            C(87, 15.5, 1.6, OL),
        )
        break
      }
      case 'debugging': {
        const bug =
          S('M63.0 71.0L59.0 69.0M63.0 75.0H58.5M63.0 79.0L59.0 81.0M73.0 71.0L77.0 69.0M73.0 75.0H77.5M73.0 79.0L77.0 81.0', OL, 1.6) +
          E(68.0, 76.0, 6, 7, '#7ee787', ol(2)) +
          S('M68.0 69.5V82.5', OL, 1.4) +
          C(68.0, 68.5, 3.4, '#3d4a66', ol(1.8)) +
          C(66.8, 68.0, 0.8, '#fff') +
          C(69.2, 68.0, 0.8, '#fff') +
          C(65.5, 74.0, 1.2, '#2a8f4a') +
          C(70.5, 78.0, 1.2, '#2a8f4a')
        fore =
          sleeve('M24 100C24 94 30 90 38 88') +
          S('M44 86L60 80', OL, 7) +
          S('M44 86L60 80', '#8a5230', 3.6) +
          hand(42, 87, 5) +
          `<circle cx="68" cy="76" r="10" fill="#eaf7ff"/>` +
          float(`<g transform="translate(68 76.5) scale(.68) translate(-68 -76)">${bug}</g>`) +
          `<circle cx="68" cy="76" r="10" fill="#cfefff" opacity=".3"/>` +
          `<circle cx="68" cy="76" r="10" fill="none" stroke="${OL}" stroke-width="5.5"/>` +
          `<circle cx="68" cy="76" r="10" fill="none" stroke="#c0c9d9" stroke-width="2.6"/>` +
          S('M62 72Q64 69 67 68.5', '#fff', 1.6, ' opacity=".9"')
        break
      }
      case 'solved': {
        let rays = ''
        for (let i = 0; i < 7; i++) {
          const a = Math.PI * (1.05 + (i / 6) * 0.9)
          rays += S(`M${n(80 + Math.cos(a) * 11)} ${n(19 + Math.sin(a) * 11)}L${n(80 + Math.cos(a) * 14.5)} ${n(19 + Math.sin(a) * 14.5)}`, '#ffb703', 2)
        }
        back = float(
          C(80, 19, 13, '#ffe066', ' opacity=".35"') +
            rays +
            `<path d="M80 9C74.5 9 71 13 71 17.5C71 21 73 23 75 25V28H85V25C87 23 89 21 89 17.5C89 13 85.5 9 80 9Z" fill="#ffe066"${ol(2.4)}/>` +
            R(75, 28, 10, 5, 2, '#cfd8e6', ol(2.2)) +
            S('M77.5 24Q80 19 82.5 24', '#ff9f1c', 1.4) +
            E(76.5, 15, 1.8, 3, '#fff', ' opacity=".8"'),
        )
        fore = `<path d="M18 84L20 80L22 84L26 86L22 88L20 92L18 88L14 86Z" fill="#ffd23f"${ol(1.4)}/>`
        break
      }
      case 'coffee': {
        const steam = (x: number, d: number) =>
          `<path d="M${x} 66C${x - 3} 62 ${x + 3} 59 ${x} 55" stroke="#9aa9c2" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".9">` +
          `<animate attributeName="opacity" values="0;.9;0" dur="2.4s" begin="${d}s" repeatCount="indefinite"/></path>`
        fore =
          float(steam(63, 0) + steam(69, 0.8)) +
          sleeve('M30 100C30 92 46 86 56 84') +
          `<path d="M76 74Q83 74 83 79.5Q83 85 76 85" stroke="${OL}" stroke-width="6" fill="none"/>` +
          `<path d="M76 74Q83 74 83 79.5Q83 85 76 85" stroke="#fff" stroke-width="2.4" fill="none"/>` +
          `<path d="M57 69H77V87Q77 93 71 93H63Q57 93 57 87Z" fill="#fff"${ol(2.6)}/>` +
          E(67, 69, 10, 2.2, '#7a4a2a', ol(2)) +
          C(67, 81, 3.2, hood) +
          hand(58, 84, 5)
        break
      }
      case 'reviewing': {
        const check = (y: number, ok: boolean) =>
          (ok ? S(`M21 ${y}L23 ${y + 2}L26.5 ${y - 2}`, '#2ea44f', 1.8) : S(`M21.5 ${y - 1.5}L25.5 ${y + 2.5}M25.5 ${y - 1.5}L21.5 ${y + 2.5}`, '#e5534b', 1.6)) +
          R(29, y - 0.8, 12, 1.8, 0.9, '#c6d1e3')
        fore =
          `<g transform="rotate(-8 30 80)">` +
          R(15, 64, 31, 33, 3, '#fff', ol(2.6)) +
          R(15, 64, 31, 7, 3, '#8e6cf0') +
          R(15, 68, 31, 3, 0, '#8e6cf0') +
          S('M19 67.5H30', '#fff', 1.4) +
          check(76, true) +
          check(82, true) +
          check(88, mood !== 'happy' && rand.bool(0.4) ? false : true) +
          `</g>` +
          hand(44, 84, 5)
        break
      }
      case 'shipping': {
        const rocket =
          `<g transform="rotate(40 80 22)">` +
          `<path d="M77 34Q80 44 83 34Z" fill="#ff9f1c"><animate attributeName="d" values="M77 34Q80 44 83 34Z;M77 34Q80 40 83 34Z;M77 34Q80 44 83 34Z" dur=".4s" repeatCount="indefinite"/></path>` +
          `<path d="M74 28L70 34L75 33ZM86 28L90 34L85 33Z" fill="#ff6b6b"${ol(2)}/>` +
          `<path d="M80 8C74 13 74 22 75 34H85C86 22 86 13 80 8Z" fill="#fff"${ol(2.4)}/>` +
          C(80, 20, 3, '#79c0ff', ol(1.8)) +
          `<path d="M80 8C77.5 10 76.3 12 76 14H84C83.7 12 82.5 10 80 8Z" fill="#ff6b6b"/>` +
          `</g>`
        back = float(rocket + C(66, 34, 1.8, '#fff', ' opacity=".8"') + C(62, 39, 1.2, '#fff', ' opacity=".6"'))
        fore = `<g transform="translate(21 84)">${R(-2, -6, 18, 12, 3, '#c98a4f', ol(2.2))}${S('M7 -6V6', '#8a5230', 1.6)}${S('M-2 -1H16', '#8a5230', 1.2, ' opacity=".5"')}</g>`
        break
      }
      case 'stuck': {
        const scribble =
          'M73 14C80 6 92 12 86 18C80 24 72 14 80 10C88 6 94 20 84 22C76 24 70 18 76 14C84 10 90 18 82 20C76 21 76 16 80 15'
        back = float(
          `<path d="M68 18C66 10 74 5 80 8C84 3 94 5 94 12C97 16 95 24 89 25C87 29 79 29 76 26C70 28 66 24 68 18Z" fill="#fff"${ol(2.4)}/>` +
            S(scribble, '#e5534b', 1.6),
        )
        break
      }
    }

    return (
      `<defs><linearGradient id="${id}-h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient></defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".12">${torso}</g>` +
      `<g data-lv-depth=".45" data-lv-tilt="5">${head}</g>` +
      `<g data-lv-depth=".2">${fore}</g>` +
      (back ? `<g data-lv-depth=".3"><g transform="translate(75 22) scale(.75) translate(-80 -17)">${back}</g></g>` : '') +
      `<g data-lv-shy="" opacity="0">` +
      sleeve('M36 100C36 80 38 64 41 52') +
      hand(41, 46, 7) +
      sleeve('M64 100C64 80 62 64 59 52') +
      hand(59, 46, 7) +
      `</g></g>`
    )
  },
})
