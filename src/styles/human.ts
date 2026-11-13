import { defineStyle, n, safe } from '../core'
import { faceExtras, heart, type FaceSpec } from '../face'

const AGES = ['baby', 'toddler', 'kid', 'teen', 'adult', 'senior'] as const
const GENDERS = ['boy', 'girl', 'neutral'] as const
const HAIRS = ['short', 'long', 'curly', 'coily', 'bun', 'braids', 'ponytail', 'bob', 'bald', 'buzz', 'hijab', 'turban', 'wavy'] as const
const FACIAL = ['none', 'stubble', 'beard', 'moustache'] as const
const GLASSES = ['none', 'round', 'square', 'sun'] as const
const ACCESSORIES = ['none', 'earrings', 'headband', 'cap', 'beanie', 'bow', 'flower', 'headphones'] as const
const CLOTHES = ['tee', 'hoodie', 'collar', 'sweater', 'dress', 'onesie', 'cardigan'] as const

const SKIN: Record<string, string> = { porcelain: '#fbe2d2', light: '#f2c7a5', medium: '#dba57c', tan: '#b97c52', brown: '#8a5636', deep: '#5e3a25' }
const HAIR_C: Record<string, string> = {
  black: '#1f1a1c', brown: '#4a3024', auburn: '#7a3424', blonde: '#e0b871', ginger: '#c8622e', grey: '#a6a3a6', white: '#ebe8e4',
  pink: '#f4a3c4', lilac: '#b7a0e8', mint: '#8fd8c4', blue: '#7fb2f0',
}
const EYE_C: Record<string, string> = { brown: '#5a3622', dark: '#2e211c', hazel: '#8a6a32', green: '#4f7d46', blue: '#4f84c4', grey: '#7d8a96' }
const CLOTH_C = ['#e9725f', '#f2b35b', '#5fa59a', '#5b7fd1', '#9a7bd6', '#3e4a63', '#e6dcc8', '#d9667f', '#6c9a5a', '#4a8fb8']

type Age = (typeof AGES)[number]
type Gender = (typeof GENDERS)[number]

export interface HumanOptions {
  /** Proportions follow age: round baby heads up to wrinkled seniors. */
  age?: Age | 'random'
  /** Drives hair and clothing defaults only (boy/girl/man/woman/grandpa/granny via age). */
  gender?: Gender | 'random'
  /** A tone name (porcelain, light, medium, tan, brown, deep) or any color. */
  skin?: string
  hair?: (typeof HAIRS)[number] | 'random'
  /** black, brown, auburn, blonde, ginger, grey, white, pink, lilac, mint, blue, or any color. */
  hairColor?: string
  /** brown, dark, hazel, green, blue, grey, or any color. */
  eyes?: string
  /** Adults and seniors only. */
  facialHair?: (typeof FACIAL)[number] | 'random'
  glasses?: (typeof GLASSES)[number] | 'random'
  accessory?: (typeof ACCESSORIES)[number] | 'random'
  clothes?: (typeof CLOTHES)[number] | 'random'
  clothesColor?: string
  freckles?: boolean | 'random'
  /** Babies only. */
  pacifier?: boolean | 'random'
}

interface AgeSpec { cy: number; rx: number; ry: number; jaw: number; eo: number; gap: number; ew: number; no: number; mo: number; W: number; neck: number }
const AGE: Record<Age, AgeSpec> = {
  baby: { cy: 51, rx: 20.5, ry: 20.5, jaw: 0.9, eo: 4.6, gap: 7.4, ew: 3.25, no: 9.4, mo: 13.2, W: 25, neck: 7 },
  toddler: { cy: 49, rx: 19.2, ry: 21, jaw: 0.84, eo: 3.6, gap: 7.1, ew: 3.15, no: 9.4, mo: 13.4, W: 26, neck: 8 },
  kid: { cy: 46, rx: 17.4, ry: 21.6, jaw: 0.8, eo: 2.2, gap: 6.8, ew: 3.05, no: 9.2, mo: 13.6, W: 28, neck: 8 },
  teen: { cy: 43.5, rx: 16.4, ry: 22.6, jaw: 0.74, eo: 0.8, gap: 6.7, ew: 2.95, no: 9.6, mo: 14.2, W: 31, neck: 8.5 },
  adult: { cy: 42.5, rx: 16.4, ry: 23, jaw: 0.76, eo: 0, gap: 6.7, ew: 2.95, no: 10, mo: 14.6, W: 35, neck: 9.5 },
  senior: { cy: 42.5, rx: 16.4, ry: 23, jaw: 0.8, eo: 0.3, gap: 6.7, ew: 2.85, no: 10.6, mo: 15.2, W: 34, neck: 9.5 },
}

const LIP = '#a8505a'
const INK = '#3a2422'

const shade = (c: string, k: number) => {
  const m = /^#([\da-f]{6})$/i.exec(c)
  if (!m) return c
  const v = parseInt(m[1], 16)
  const f = (x: number) => Math.max(0, Math.min(255, Math.round(k > 1 ? x + (255 - x) * (k - 1) : x * k))).toString(16).padStart(2, '0')
  return `#${f(v >> 16)}${f((v >> 8) & 255)}${f(v & 255)}`
}
const E = (cx: number, cy: number, rx: number, ry: number, fill: string, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
/** Mirror canonical (head-centred) markup around x = 0. */
const MX = (svg: string) => svg + `<g transform="scale(-1 1)">${svg}</g>`
const WM = (svg: string) => svg + `<g transform="matrix(-1 0 0 1 100 0)">${svg}</g>`
const mix = (a: string, b: string, t: number) => {
  const p = (c: string) => (/^#[\da-f]{6}$/i.test(c) ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : null)
  const x = p(a)
  const y = p(b)
  if (!x || !y) return a
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')
}
const col = (v: string | undefined, map: Record<string, string>, fallback: string) =>
  safe(v && v !== 'random' ? map[v] ?? v : fallback)

/** Warm, flat-illustrated people of every age, from babies to grandparents. */
export const human = defineStyle<HumanOptions>({
  name: 'human',
  colors: ['#f6e3d3', '#e3ecf5', '#e8e2f3', '#dcefe6', '#fbecc8', '#f7dcdc', '#dfeef0', '#efe7da'],
  defaults: { age: 'random', gender: 'random', hair: 'random', facialHair: 'random', glasses: 'random', accessory: 'random', clothes: 'random', freckles: 'random' },
  variants: {
    age: AGES, gender: GENDERS, hair: HAIRS, facialHair: FACIAL, glasses: GLASSES, accessory: ACCESSORIES, clothes: CLOTHES,
    skin: Object.keys(SKIN), hairColor: Object.keys(HAIR_C), eyes: Object.keys(EYE_C), clothesColor: CLOTH_C, freckles: [true, false], pacifier: [true, false],
  },
  render({ rand, id, mood, options: o }) {
    const want = <T extends string>(v: T | 'random' | undefined, list: readonly T[]): T => (v && v !== 'random' ? v : rand.pick(list))
    const age = want(o.age, ['baby', 'toddler', 'kid', 'kid', 'teen', 'teen', 'adult', 'adult', 'adult', 'senior', 'senior'] as Age[])
    const gender = want(o.gender, ['boy', 'boy', 'girl', 'girl', 'neutral'] as Gender[])
    const A = AGE[age]
    const little = age === 'baby' || age === 'toddler'
    const grown = age === 'adult' || age === 'senior'
    const skin = col(o.skin, SKIN, rand.pick(Object.values(SKIN)))

    // ---- hair (resolved for age) ----
    const HB: Record<Gender, string[]> = {
      boy: ['short', 'short', 'buzz', 'curly', 'coily', 'wavy', grown ? 'bald' : 'short', 'turban'],
      girl: ['long', 'long', 'bob', 'bun', 'ponytail', 'braids', 'curly', 'coily', 'wavy', age === 'kid' ? 'ponytail' : 'hijab'],
      neutral: ['short', 'curly', 'bob', 'wavy', 'coily', 'bun', 'buzz'],
    }
    let hair: string = want(o.hair, HB[gender] as (typeof HAIRS)[number][])
    if (age === 'baby') hair = hair === 'bald' || hair === 'buzz' ? 'fuzz' : hair === 'curly' || hair === 'coily' ? 'babycurl' : 'wisp'
    else if (age === 'toddler') {
      if (/^(long|braids|bob|wavy|ponytail|hijab)$/.test(hair)) hair = gender === 'boy' ? 'tuft' : 'pigtails'
      else if (/^(short|buzz|bald|turban|bun)$/.test(hair)) hair = gender === 'girl' ? 'pigtails' : 'tuft'
    } else if (!grown && hair === 'bald') hair = 'buzz'
    const covered = hair === 'hijab' || hair === 'turban'

    const greyish = age === 'senior' ? rand.pick(['grey', 'white', 'grey', 'white', 'grey']) : ''
    const natural = (age === 'teen' || age === 'adult') && rand.bool(0.08) ? rand.pick(['pink', 'lilac', 'mint', 'blue']) : rand.pick(['black', 'black', 'black', 'brown', 'brown', 'brown', 'auburn', 'blonde', 'ginger'])
    const hairC = col(o.hairColor, HAIR_C, HAIR_C[greyish || natural])
    const iris = col(o.eyes, EYE_C, rand.pick(['#5a3622', '#5a3622', '#2e211c', '#8a6a32', '#4f7d46', '#4f84c4', '#7d8a96']))
    const facial = grown ? want(o.facialHair, (gender === 'boy' ? ['none', 'stubble', 'beard', 'moustache', 'beard'] : ['none']) as (typeof FACIAL)[number][]) : 'none'
    let glasses = want(o.glasses, (age === 'senior' ? ['none', 'round', 'square', 'round'] : little ? ['none'] : ['none', 'none', 'none', 'round', 'square', 'sun']) as (typeof GLASSES)[number][])
    if (age === 'baby' && glasses !== 'sun') glasses = 'none'
    let acc: string = want(o.accessory, (age === 'baby' ? ['none', 'none', 'cap', 'bow'] : gender === 'girl' ? ['none', 'none', 'earrings', 'headband', 'bow', 'flower', 'headphones'] : ['none', 'none', 'none', 'cap', 'beanie', 'headphones', 'earrings']) as (typeof ACCESSORIES)[number][])
    if (little && acc === 'headphones') acc = 'none'
    if (age === 'baby' && (acc === 'cap' || acc === 'beanie')) acc = 'bonnet'
    if (covered && acc !== 'none' && acc !== 'headphones') acc = 'none'
    if (hair === 'hijab' && acc === 'headphones') acc = 'none'
    let clothes: string = want(o.clothes, (gender === 'girl' && !little ? ['tee', 'hoodie', 'sweater', 'dress', 'collar', age === 'senior' ? 'cardigan' : 'tee'] : age === 'senior' ? ['cardigan', 'cardigan', 'sweater', 'collar'] : ['tee', 'hoodie', 'collar', 'sweater', 'tee']) as (typeof CLOTHES)[number][])
    if (age === 'baby') clothes = 'onesie'
    else if (clothes === 'onesie') clothes = 'tee'
    const cloth = safe(o.clothesColor && o.clothesColor !== 'random' ? o.clothesColor : rand.pick(age === 'baby' ? ['#f6c6d0', '#bcd8f2', '#f7e1a0', '#c6e7cf', '#d9ccf2'] : CLOTH_C))
    const freckles = o.freckles === 'random' || o.freckles === undefined ? rand.bool(0.12) : !!o.freckles
    const pacifier = age === 'baby' && (o.pacifier === 'random' || o.pacifier === undefined ? rand.bool(0.2) : !!o.pacifier) && (mood === 'neutral' || mood === 'sleepy')

    const { cy, rx, ry, jaw, gap, ew } = A
    const cx = 50
    const k = ew / 3
    const ey = cy + A.eo
    const my = cy + A.mo
    const noseY = cy + A.no
    const brow = covered || hair === 'bald' ? (age === 'senior' ? '#8f8882' : '#3e2c24') : shade(hairC, hairC === HAIR_C.white || hairC === HAIR_C.blonde || hairC === HAIR_C.grey ? 0.72 : 0.9)
    const dark = shade(skin, 0.78)
    const lipC = mix(skin, '#b8505c', little ? 0.32 : gender === 'girl' && age !== 'kid' ? 0.55 : 0.36)
    const scarf = rand.pick(['#4d6a8f', '#a8566a', '#6f8f6a', '#c69a5a', '#7a6aa8', '#2f3b52', '#d9c7b0'])
    const T = `translate(${cx} ${cy}) scale(${n(rx / 18)} ${n(ry / 22)})`

    // ---- defs ----
    const u = (key: string) => `url(#${id}-${key})`
    const lin = (key: string, c: string, a = 1.12, b = 0.86) =>
      `<linearGradient id="${id}-${key}" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="${shade(c, a)}"/><stop offset="1" stop-color="${shade(c, b)}"/></linearGradient>`
    const HEAD =
      `M${n(cx - rx)} ${n(cy)}C${n(cx - rx)} ${n(cy - ry * 0.56)} ${n(cx - rx * 0.56)} ${n(cy - ry)} ${cx} ${n(cy - ry)}` +
      `C${n(cx + rx * 0.56)} ${n(cy - ry)} ${n(cx + rx)} ${n(cy - ry * 0.56)} ${n(cx + rx)} ${n(cy)}` +
      `C${n(cx + rx)} ${n(cy + ry * 0.32)} ${n(cx + rx * 0.97)} ${n(cy + ry * 0.5)} ${n(cx + rx * jaw)} ${n(cy + ry * 0.74)}` +
      `C${n(cx + rx * 0.55)} ${n(cy + ry * 0.95)} ${n(cx + rx * 0.36)} ${n(cy + ry)} ${cx} ${n(cy + ry)}` +
      `C${n(cx - rx * 0.36)} ${n(cy + ry)} ${n(cx - rx * 0.55)} ${n(cy + ry * 0.95)} ${n(cx - rx * jaw)} ${n(cy + ry * 0.74)}` +
      `C${n(cx - rx * 0.97)} ${n(cy + ry * 0.5)} ${n(cx - rx)} ${n(cy + ry * 0.32)} ${n(cx - rx)} ${n(cy)}Z`
    const defs =
      `<radialGradient id="${id}-s" cx=".42" cy=".4" r=".72"><stop offset="0" stop-color="${shade(skin, 1.09)}"/><stop offset=".5" stop-color="${skin}"/><stop offset=".85" stop-color="${shade(skin, 0.93)}"/><stop offset="1" stop-color="${shade(skin, 0.84)}"/></radialGradient>` +
      `<radialGradient id="${id}-i" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="${shade(iris, 1.35)}"/><stop offset=".45" stop-color="${shade(iris, 1.1)}"/><stop offset=".85" stop-color="${iris}"/><stop offset="1" stop-color="${shade(iris, 0.5)}"/></radialGradient>` +
      lin('h', hairC, 1.2, 0.78) + lin('o', cloth, 1.08, 0.82) + lin('f', scarf, 1.1, 0.8) +
      `<filter id="${id}-b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.3"/></filter>` +
      `<filter id="${id}-b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".45"/></filter>` +
      `<linearGradient id="${id}-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15202b" stop-opacity=".95"/><stop offset="1" stop-color="#40566e" stop-opacity=".9"/></linearGradient>` +
      `<clipPath id="${id}-hc"><path d="${HEAD}"/></clipPath>`
    const blur = (svg: string, f = 'b') => `<g filter="url(#${id}-${f})">${svg}</g>`


    // ---- hair, in canonical head space (head rx 18, ry 22, centred at 0,0) ----
    let back = ''
    let top = ''
    let ears = !/^(long|wavy|bob|hijab|braids)$/.test(hair)
    const H = u('h')
    const hl = (d: string) => S(d, '#fff', 1.4, ' opacity=".2"')
    const capFront = 'M-18.6 2C-20.5 -15 -11 -25 0 -25C11 -25 20.5 -15 18.6 2C17.5 -5 15 -10 10 -12.5C4 -9.5 -6 -9.5 -13 -9C-16 -6 -17.8 -2 -18.6 2Z'
    switch (hair) {
      case 'short':
        top = P('M-18.4 2C-20 -10 -17.5 -22 -6 -26C4 -29 16.5 -25.5 19 -15C20.5 -9 19.6 -3 18.6 2C17.8 -4 16.5 -8 14 -11C9 -10 2 -12.5 -3 -15.5C-6 -12 -11 -10.5 -15 -10C-17 -7 -18 -3 -18.4 2Z', H) +
          S('M-15 -11Q-11 -20 -3 -24.5M-9 -12Q-3 -20 7 -24M-1 -14.5Q7 -20 15 -18M6 -12Q12 -14 16.5 -9M-17 -4Q-17 -12 -12 -18', 'rgba(0,0,0,.28)', 0.6) + hl('M-7 -23Q2 -26.5 11 -23')
        break
      case 'buzz':
        top = P('M-18.4 -1C-19 -16 -10 -23.4 0 -23.4C10 -23.4 19 -16 18.4 -1C16 -9.5 10 -13.5 0 -13.5C-10 -13.5 -16 -9.5 -18.4 -1Z', hairC, ' opacity=".9"')
        break
      case 'curly': {
        let c = ''
        const pts = [[-16, -6, 5], [-15, -14, 6], [-9, -20, 6.5], [0, -22.5, 7], [9, -20, 6.5], [15, -14, 6], [16, -6, 5], [-5, -13, 5.5], [5, -13, 5.5]]
        for (const [x, y, r] of pts) c += C(x, y, r, H)
        let ring = ''
        for (const [x, y, r] of pts) ring += S(`M${n(x - r * 0.45)} ${n(y)}a${n(r * 0.45)} ${n(r * 0.4)} 0 1 1 ${n(r * 0.7)} ${n(r * 0.35)}`, 'rgba(0,0,0,.22)', 1)
        top = c + ring
        break
      }
      case 'coily': {
        let c = ''
        for (let i = 0; i < 14; i++) {
          const a = Math.PI * (1.02 + (i / 13) * 0.96)
          c += C(Math.cos(a) * 25, -9 + Math.sin(a) * 21, 6.5, H)
        }
        back = E(0, -10, 25, 20, H) + c
        top = P('M-18 -1C-19 -10 -15 -14 -10 -14.5C-4 -11 4 -11 10 -14.5C15 -14 19 -10 18 -1C21 -12 18 -24 0 -25C-18 -24 -21 -12 -18 -1Z', H)
        break
      }
      case 'bun':
        back = C(0, -27, 7.5, H) + S('M-5 -22.5Q0 -21 5 -22.5', 'rgba(0,0,0,.25)', 1.2)
        top = P('M-18.6 2C-20.5 -15 -11 -24.5 0 -24.5C11 -24.5 20.5 -15 18.6 2C17 -7 10 -13 0 -13C-10 -13 -17 -7 -18.6 2Z', H) + hl('M-10 -18Q0 -22 10 -18')
        break
      case 'ponytail':
        back = P('M8 -20C24 -24 29 -6 25 14C23 22 18 25 15 21C20 10 21 -5 9 -14Z', H) + E(13, -18, 3, 3.6, shade(cloth, 0.9))
        top = P('M-18.6 2C-20.5 -15 -11 -24.5 0 -24.5C11 -24.5 20.5 -15 18.6 2C17 -7 10 -13 0 -13C-10 -13 -17 -7 -18.6 2Z', H) + hl('M-10 -18Q0 -22 10 -18')
        break
      case 'braids': {
        let b = ''
        for (let i = 0; i < 6; i++) b += E(-18.5 - i * 0.3, 4 + i * 5.2, 3.8, 3.2, H) + S(`M${n(-21.5 - i * 0.3)} ${n(4 + i * 5.2)}Q${n(-18.5 - i * 0.3)} ${n(6 + i * 5.2)} ${n(-15.5 - i * 0.3)} ${n(4 + i * 5.2)}`, 'rgba(0,0,0,.2)', 0.9)
        back = MX(b + E(-20.2, 34.5, 2.6, 1.6, shade(cloth, 0.95)))
        top = MX(P('M0 -25C-11 -25 -20.5 -15 -18.6 4C-17.5 -5 -15 -10 -10 -12C-5 -12 -1 -13 0 -16Z', H)) + hl('M-10 -18Q-5 -22 -1 -22')
        break
      }
      case 'long':
        back = P('M-20 0C-22 -18 -12 -26 0 -26C12 -26 22 -18 20 0L22.5 32Q13 36 6 30L-6 30Q-13 36 -22.5 32Z', H)
        top = P('M-19.6 6C-21 -15 -11 -25 0 -25C11 -25 21 -15 19.6 6C18.5 -5 13 -12 3 -15C1.5 -12 0 -11 -1.5 -14C-9 -11 -17 -5 -19.6 6Z', H) + hl('M-9 -19Q-3 -22 1 -21')
        break
      case 'wavy':
        back = P('M-20 0C-22 -18 -12 -26 0 -26C12 -26 22 -18 20 0C23 6 19 11 22 16C23 20 18 22 16 19L-16 19C-18 22 -23 20 -22 16C-19 11 -23 6 -20 0Z', H)
        top = P('M-19.6 8C-21 -15 -11 -25 0 -25C11 -25 21 -15 19.6 8C19 -2 16 -9 9 -12C5 -10 2 -12 0 -15C-4 -10 -10 -9 -14 -9C-17 -5 -19 0 -19.6 8Z', H) + hl('M-9 -19Q-3 -22 1 -21M5 -21Q9 -20 12 -17')
        break
      case 'bob':
        back = P('M-21 0C-23 -18 -12 -27 0 -27C12 -27 23 -18 21 0L21.5 15Q16 18 12 15L-12 15Q-16 18 -21.5 15Z', H)
        top = P('M-20 8C-22 -16 -12 -26 0 -26C12 -26 22 -16 20 8L17 8C17 -1 15.5 -5 14 -7L-14 -7C-15.5 -5 -17 -1 -17 8Z', H) + hl('M-10 -18Q0 -22 10 -18')
        break
      case 'bald':
        top = E(-6, -17, 6, 2.6, '#fff', ' opacity=".22" transform="rotate(-18 -6 -17)"') +
          (age === 'senior' ? MX(P('M-18.8 4C-19.6 -3 -18.6 -8 -16 -10.5C-15.2 -6 -15 -1 -15.6 4Z', H)) : '')
        break
      case 'hijab':
        back = P('M-24 2C-26 -21 -13 -29.5 0 -29.5C13 -29.5 26 -21 24 2C24 16 21 24 30 34L32 62L-32 62L-30 34C-21 24 -24 16 -24 2Z', u('f'))
        break
      case 'turban':
        top = P('M-19.5 -1C-23 -21 -12 -33 0 -33C12 -33 23 -21 19.5 -1C15 -9 7 -11.5 0 -7.5C-7 -11.5 -15 -9 -19.5 -1Z', H) +
          S('M-18 -8Q-2 -24 14 -26M-12 -6Q2 -18 18 -14M-19 -16Q0 -30 10 -31', 'rgba(0,0,0,.18)', 1.3) + hl('M-10 -26Q-2 -31 6 -30')
        break
      case 'pigtails':
        back = MX(C(-22, -10, 6.5, H) + C(-25, -4, 5, H) + E(-17.5, -13, 2.4, 2.8, shade(cloth, 0.95)))
        top = P('M-18.6 2C-20.5 -15 -11 -24.5 0 -24.5C11 -24.5 20.5 -15 18.6 2C17 -7 9 -13 0 -14C-9 -13 -17 -7 -18.6 2Z', H) + hl('M-10 -18Q0 -22 10 -18')
        break
      case 'tuft':
        top = P('M-17.5 -6C-17 -18 -9 -23.5 0 -23.5C9 -23.5 17 -18 17.5 -6C14 -12 9 -15 3 -15C-2 -13 -9 -13 -17.5 -6Z', H) + P('M-2 -23C-4 -29 2 -31 4 -28C1 -28 1 -26 2 -23Z', H)
        break
      case 'fuzz':
        top = P('M-17 -8C-16 -18 -8 -22.5 0 -22.5C8 -22.5 16 -18 17 -8C13 -14 7 -16 0 -16C-7 -16 -13 -14 -17 -8Z', hairC, ' opacity=".35"')
        break
      case 'babycurl':
        top = P('M-15 -11C-12 -19 -6 -22.4 0 -22.4C6 -22.4 12 -19 15 -11C10 -15 5 -16 0 -16C-5 -16 -10 -15 -15 -11Z', hairC, ' opacity=".5"') +
          C(-4, -21.5, 3, H) + C(1.5, -23, 3.4, H) + C(6.5, -21, 2.8, H)
        break
      default: // wisp
        top = P('M-14 -12C-11 -19 -6 -22.3 0 -22.3C6 -22.3 11 -19 14 -12C9 -16 5 -17 0 -17C-5 -17 -9 -16 -14 -12Z', hairC, ' opacity=".35"') +
          S('M-4 -21.5Q-3 -25 0 -24.5M-1 -22Q1 -26.5 4 -25M2 -21.8Q5 -24.5 7 -22.5', hairC, 0.8, ' opacity=".85"')
    }

    const STR: Record<string, [string, string]> = {
      long: ['M-1.5 -14Q-9 -12 -16.5 0M3 -15Q12 -12 17.5 0M-5 -21Q-13 -17 -18 -6M6 -21Q14 -17 18.5 -6', 'M-19.5 6Q-21 18 -20 30M-15.5 8Q-16.5 20 -15.5 29M19.5 6Q21 18 20 30M15.5 8Q16.5 20 15.5 29'],
      wavy: ['M0 -15Q-6 -10 -14 -7M9 -12Q15 -9 18 2M-4 -21Q-12 -17 -18 -4M5 -22Q14 -18 18.5 -6', 'M-20 4Q-22 10 -19.5 16M20 4Q22 10 19.5 16M-17 6Q-19 12 -16 18M17 6Q19 12 16 18'],
      bob: ['M-6 -7Q-5 -16 -2 -22M2 -7Q3 -16 6 -22M10 -7Q10 -15 12 -19M-12 -7Q-12 -14 -10 -19M-17.5 4Q-18.5 -6 -14 -12M17.5 4Q18.5 -6 14 -12', 'M-20 2Q-21 10 -19 14M20 2Q21 10 19 14'],
      bun: ['M-12 -13Q-6 -20 0 -24M12 -13Q6 -20 0 -24M-16.5 -5Q-13 -15 -4 -22M16.5 -5Q13 -15 4 -22', ''],
      ponytail: ['M-12 -13Q-4 -20 9 -20M12 -13Q12 -18 10 -20M-16.5 -5Q-13 -15 0 -22M16.5 -5Q15 -14 9 -19', 'M12 -14Q22 -8 20 12M15 -16Q25 -6 22 14'],
      braids: ['M-1 -16Q-8 -14 -15 -6M1 -16Q8 -14 15 -6M-2 -21Q-10 -18 -17 -4M2 -21Q10 -18 17 -4', ''],
      pigtails: ['M-12 -13Q-6 -20 0 -24M12 -13Q6 -20 0 -24', ''],
    }
    const st = STR[hair]
    if (st) {
      top += S(st[0], 'rgba(0,0,0,.26)', 0.55) + S(st[0], 'rgba(255,255,255,.14)', 0.5, ' transform="translate(.9 .3)"')
      if (st[1]) back += S(st[1], 'rgba(0,0,0,.22)', 0.6)
    }

    // ---- head accessories (canonical space) ----
    let accBack = ''
    let accTop = ''
    let earring = ''
    switch (acc) {
      case 'headband':
        accTop = S('M-18 -6C-17 -19 -9 -24.5 0 -24.5C9 -24.5 17 -19 18 -6', shade(cloth, 1.05), 3.2)
        break
      case 'cap':
        if (hair === 'bun') back = ''
        if (hair === 'coily') back = ''
        top = top && hair !== 'coily' && hair !== 'bun' && hair !== 'tuft' ? `<g clip-path="url(#${id}-cc)">${top}</g>` : hair === 'coily' ? MX(E(-19, -2, 5, 7, H)) : ''
        accTop = P('M-20 -6C-21 -22 -10 -28.5 0 -28.5C10 -28.5 21 -22 20 -6Z', u('o')) + C(0, -28.5, 1.6, shade(cloth, 0.7)) +
          S('M0 -28.5V-8M-10 -26Q-12 -16 -12 -7M10 -26Q12 -16 12 -7', 'rgba(0,0,0,.15)', 0.9) +
          P('M-20.5 -7Q0 -12 21 -7Q24 -3 21 -1.5Q0 -6.5 -20.5 -3Z', shade(cloth, 0.8))
        break
      case 'beanie':
        if (hair === 'bun' || hair === 'coily') back = ''
        top = hair === 'coily' || hair === 'curly' ? MX(E(-18, -1, 4.5, 6, H)) : top ? `<g clip-path="url(#${id}-cc)">${top}</g>` : ''
        accTop = P('M-20 -5C-22 -24 -10 -30 0 -30C10 -30 22 -24 20 -5Z', u('o')) + C(0, -31, 4, shade(cloth, 1.15)) +
          P('M-21 -11Q0 -15 21 -11L21 -3Q0 -7 -21 -3Z', shade(cloth, 0.85)) +
          S('M-16 -11.5V-4M-10 -12.6V-5M-4 -13.2V-5.8M2 -13.2V-5.8M8 -12.8V-5.3M14 -12V-4.4', 'rgba(0,0,0,.14)', 0.9)
        break
      case 'bonnet':
        accBack = P('M-23 2C-25 -19 -13 -27 0 -27C13 -27 25 -19 23 2C23 10 21 15 17 19L-17 19C-21 15 -23 10 -23 2Z', u('o'))
        accTop = P('M-20 2C-21 -16 -11 -24.5 0 -24.5C11 -24.5 21 -16 20 2C18 -8 11 -14 0 -14C-11 -14 -18 -8 -20 2Z', u('o')) +
          S('M-20 2C-18 -8 -11 -14 0 -14C11 -14 18 -8 20 2', '#fff', 2, ' opacity=".7" stroke-dasharray="1.5 1.8"') +
          S('M-17 16Q-8 26 0 25Q8 26 17 16', shade(cloth, 0.9), 1.6) + MX(P('M-1 25L-5 29L-4 24Z', shade(cloth, 0.9)))
        top = ''
        break
      case 'bow': {
        const [bx, by] = little ? [10, -20] : [11, -19]
        accTop = `<g transform="rotate(20 ${bx} ${by})">` + P(`M${bx} ${by}L${bx - 7} ${by - 4.5}Q${bx - 8.5} ${by} ${bx - 7} ${by + 4.5}Z`, u('o')) +
          P(`M${bx} ${by}L${bx + 7} ${by - 4.5}Q${bx + 8.5} ${by} ${bx + 7} ${by + 4.5}Z`, u('o')) + C(bx, by, 2.1, shade(cloth, 0.8)) + `</g>`
        break
      }
      case 'flower': {
        let f = ''
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2
          f += C(-13 + Math.cos(a) * 2.8, -18 + Math.sin(a) * 2.8, 2.4, '#f7a8b8')
        }
        accTop = f + C(-13, -18, 1.8, '#ffd45e')
        break
      }
      case 'headphones':
        accTop = S('M-19.5 2C-21 -18 -11 -27 0 -27C11 -27 21 -18 19.5 2', '#3a3f4a', 2.6) +
          MX(`<rect x="-23.5" y="-4" width="7" height="12" rx="3.2" fill="${shade(cloth, 0.95)}" stroke="#3a3f4a" stroke-width="1.2"/>`)
        break
      case 'earrings':
        earring = 'x'
        break
    }
    if (acc === 'headphones') ears = false

    // ---- face: custom realistic features per mood ----
    let clip = 0
    const lash = gender === 'girl' && !little
    const hU = ew * (little ? 0.78 : 0.6)
    const hL = ew * (little ? 0.5 : 0.38)
    type EyeP = { hi: number; ho: number; lo: number; ir?: number; look?: [number, number]; closed?: boolean; heart?: boolean }
    const L = cx - gap
    const R = cx + gap
    const eye = (x: number, side: -1 | 1, p: EyeP) => {
      const w = ew
      const y = ey
      const xi = x - side * w
      const xo = x + side * w
      const dx = xo - xi
      const lidW = 0.75 * k + (lash ? 0.25 : 0)
      if (p.closed) {
        return S(`M${n(xi)} ${n(y)}Q${n(x)} ${n(y + hL * 1.6)} ${n(xo)} ${n(y - 0.3)}`, INK, lidW * 1.2) +
          S(`M${n(xo - side * 0.2)} ${n(y - 0.2)}l${n(side * 1.1 * k)} ${n(0.5 * k)}M${n(x + side * w * 0.45)} ${n(y + hL * 0.9)}l${n(side * 0.5 * k)} ${n(1 * k)}`, INK, 0.6 * k) +
          S(`M${n(xi + dx * 0.1)} ${n(y - hU * 0.9)}Q${n(x)} ${n(y - hU * 1.5)} ${n(xo - dx * 0.05)} ${n(y - hU * 0.7)}`, dark, 0.55, ' opacity=".6"')
      }
      const up = `M${n(xi)} ${n(y)}C${n(xi + dx * 0.22)} ${n(y - hU * p.hi * 1.75)} ${n(xi + dx * 0.72)} ${n(y - hU * p.ho * 1.75)} ${n(xo)} ${n(y + 0.15)}`
      const d = up + `C${n(xi + dx * 0.72)} ${n(y + hL * p.lo * 1.6)} ${n(xi + dx * 0.26)} ${n(y + hL * p.lo * 1.5)} ${n(xi)} ${n(y)}Z`
      const cid = `${id}-e${clip++}`
      const [lx, ly] = p.look ?? [0, 0]
      const ix = x + lx * k
      const iy = y - 0.15 * k + ly * k
      const ir = ew * (little ? 0.66 : 0.56) * (p.ir ?? 1)
      const crease = `M${n(xi + dx * 0.08)} ${n(y - hU * 0.55)}C${n(xi + dx * 0.25)} ${n(y - hU * Math.max(p.hi, 0.6) * 1.95 - 0.5)} ${n(xi + dx * 0.72)} ${n(y - hU * Math.max(p.ho, 0.6) * 1.95 - 0.6)} ${n(xo + side * 0.3)} ${n(y - hU * 0.3)}`
      return (
        `<clipPath id="${cid}"><path d="${d}"/></clipPath>` +
        P(d, '#f5efe9') +
        `<g clip-path="url(#${cid})">` +
        E(x, y + hL, w * 1.2, hL * 1.2, '#e9d9d2', ' opacity=".6"') +
        `<g data-lv-depth=".35">` +
        C(ix, iy, ir, u('i')) + C(ix, iy, ir, 'none', ` stroke="${shade(iris, 0.45)}" stroke-width="${n(0.35 * k)}"`) +
        C(ix, iy, ir * (p.heart ? 0.62 : 0.46), '#120c0b') +
        (p.heart
          ? heart(ix - ir * 0.35, iy - ir * 0.35, ir * 0.32, '#ff8fa8')
          : C(ix - ir * 0.38, iy - ir * 0.4, ir * 0.24, '#fff') + C(ix + ir * 0.4, iy + ir * 0.35, ir * 0.11, '#fff', ' opacity=".7"')) +
        `</g>` +
        S(up, 'rgba(40,20,15,.35)', 1.6 * k) +
        `</g>` +
        S(crease, dark, 0.55 * k, ' opacity=".75"') +
        S(up, INK, lidW) +
        S(`M${n(xo - side * dx * 0.12)} ${n(y - hU * p.ho * 0.75)}Q${n(xo + side * 0.4)} ${n(y - 0.4)} ${n(xo + side * (lash ? 1.3 : 0.5) * k)} ${n(y - (lash ? 1 : 0.2) * k)}`, INK, lidW * 0.9) +
        S(`M${n(xi + dx * 0.15)} ${n(y + hL * p.lo * 0.95)}Q${n(x)} ${n(y + hL * p.lo * 1.3)} ${n(xo - dx * 0.05)} ${n(y + 0.3)}`, dark, 0.45 * k, ' opacity=".55"') +
        (age === 'senior' ? S(`M${n(xi + dx * 0.1)} ${n(y + hL * 2.3)}Q${n(x)} ${n(y + hL * 3)} ${n(xo)} ${n(y + hL * 1.8)}`, dark, 0.5, ' opacity=".6"') : '') +
        (mood === 'happy' || mood === 'love' || mood === 'wink' ? S(`M${n(xi + dx * 0.05)} ${n(y + hL * 1.7)}Q${n(x)} ${n(y + hL * 2.6)} ${n(xo)} ${n(y + hL * 1.4)}`, dark, 0.5, ' opacity=".45"') : '')
      )
    }
    const EP: Record<string, [EyeP, EyeP]> = {
      neutral: [{ hi: 0.95, ho: 1, lo: 1 }, { hi: 0.95, ho: 1, lo: 1 }],
      happy: [{ hi: 0.78, ho: 0.82, lo: 0.3 }, { hi: 0.78, ho: 0.82, lo: 0.3 }],
      sad: [{ hi: 1.1, ho: 0.62, lo: 1, look: [0, 0.6] }, { hi: 1.1, ho: 0.62, lo: 1, look: [0, 0.6] }],
      angry: [{ hi: 0.42, ho: 0.85, lo: 0.75 }, { hi: 0.42, ho: 0.85, lo: 0.75 }],
      surprised: [{ hi: 1.45, ho: 1.45, lo: 1.3, ir: 0.82 }, { hi: 1.45, ho: 1.45, lo: 1.3, ir: 0.82 }],
      sleepy: [{ hi: 0.36, ho: 0.36, lo: 0.85, look: [0, 0.7] }, { hi: 0.36, ho: 0.36, lo: 0.85, look: [0, 0.7] }],
      love: [{ hi: 0.85, ho: 0.9, lo: 0.5, heart: true }, { hi: 0.85, ho: 0.9, lo: 0.5, heart: true }],
      wink: [{ hi: 0.85, ho: 0.9, lo: 0.4 }, { hi: 0, ho: 0, lo: 0, closed: true }],
      silly: [{ hi: 1.35, ho: 1.35, lo: 1.15, look: [0.6, 0] }, { hi: 0.5, ho: 0.5, lo: 0.4, look: [-0.6, 0] }],
      confused: [{ hi: 1.15, ho: 1.15, lo: 1, look: [0.9, -0.4] }, { hi: 0.7, ho: 0.7, lo: 0.9, look: [0.9, -0.4] }],
      laugh: [{ hi: 0, ho: 0, lo: 0, closed: true }, { hi: 0, ho: 0, lo: 0, closed: true }],
      cool: [{ hi: 0.55, ho: 0.6, lo: 0.6, look: [0.6, 0] }, { hi: 0.55, ho: 0.6, lo: 0.6, look: [0.6, 0] }],
      cry: [{ hi: 0.5, ho: 0.35, lo: 0.9, look: [0, 0.6] }, { hi: 0.5, ho: 0.35, lo: 0.9, look: [0, 0.6] }],
      scared: [{ hi: 1.5, ho: 1.5, lo: 1.35, ir: 0.6 }, { hi: 1.5, ho: 1.5, lo: 1.35, ir: 0.6 }],
      smug: [{ hi: 0.45, ho: 0.45, lo: 0.7, look: [-0.7, 0] }, { hi: 0.45, ho: 0.45, lo: 0.7, look: [-0.7, 0] }],
      starstruck: [{ hi: 1.2, ho: 1.2, lo: 1.1, ir: 0.9 }, { hi: 1.2, ho: 1.2, lo: 1.1, ir: 0.9 }],
    }
    const F: FaceSpec = { x: cx, ey, gap, my, ink: INK, s: k * 0.8, eye: () => '', extra: [cx + rx + 1, cy - ry * 0.5] }
    const [pl, pr] = EP[mood] ?? EP.neutral
    const eyes = `<g data-lv-eye="">${eye(L, -1, pl)}</g><g data-lv-eye="">${eye(R, 1, pr)}</g>`

    // brows: tapered, thick at the head, thin at the tail, a few strands
    const BP: Record<string, [number, number, number, number, number, number]> = {
      // lift, inner, arch for left / right
      neutral: [0, 0, 1.1, 0, 0, 1.1], happy: [0.4, 0.3, 1.3, 0.4, 0.3, 1.3], sad: [0.4, 2, 0.2, 0.4, 2, 0.2],
      angry: [-0.4, -1.8, 0.7, -0.4, -1.8, 0.7], surprised: [2, 0.6, 2, 2, 0.6, 2], sleepy: [-0.3, 0, 0.8, -0.3, 0, 0.8],
      love: [0.6, 0.6, 1.2, 0.6, 0.6, 1.2], wink: [0.3, 0, 1.2, -0.5, -0.4, 0.9], silly: [1.4, 0.4, 1.8, -0.3, 0, 0.9],
      confused: [1.8, 0.4, 1.9, -0.4, -0.9, 0.6],
      laugh: [1, 0.4, 1.5, 1, 0.4, 1.5], cool: [-0.2, -0.4, 0.9, -0.2, -0.4, 0.9], cry: [0.6, 2.4, 0.1, 0.6, 2.4, 0.1],
      scared: [2.2, 1.8, 1.2, 2.2, 1.8, 1.2], smug: [-0.3, -0.2, 0.9, 1.6, 0.3, 1.8], starstruck: [1.8, 0.5, 2, 1.8, 0.5, 2],
    }
    const bp = BP[mood] ?? BP.neutral
    const bt = (little ? 0.75 : gender === 'girl' ? 1.05 : 1.45) * k
    const browOne = (x: number, side: -1 | 1, lift: number, inner: number, arch: number) => {
      const bi = x - side * ew * 1.05
      const bo = x + side * ew * 1.3
      const by = ey - hU * 1.75 - 2.1 * k - lift
      const px = bi + (bo - bi) * 0.6
      const py = by - inner * 0.35 - arch
      return P(`M${n(bi)} ${n(by - inner + bt * 0.35)}Q${n(px)} ${n(py + bt * 0.75)} ${n(bo)} ${n(by + 0.5 - inner * 0.15)}Q${n(px)} ${n(py - bt * 0.55)} ${n(bi)} ${n(by - inner - bt * 0.8)}Z`, brow, ` stroke="${brow}" stroke-width=".35" stroke-linejoin="round"`) +
        S(`M${n(bi + side * 0.3)} ${n(by - inner + 0.2)}l${n(side * 0.7)} ${n(-1.1 * bt)}M${n(bi + side * 1.1)} ${n(by - inner + 0.1)}l${n(side * 0.9)} ${n(-1 * bt)}`, shade(brow, 0.8), 0.35, ' opacity=".7"')
    }
    const brows = browOne(L, -1, bp[0], bp[1], bp[2]) + browOne(R, 1, bp[3], bp[4], bp[5])

    // nose: bridge shading, tip highlight, alar wings and nostrils
    const nose = little
      ? blur(E(cx + 0.6, noseY + 1.6, 2.6 * k, 1 * k, dark, ' opacity=".45"')) +
        E(cx, noseY, 2.1 * k, 1.6 * k, shade(skin, 1.04)) + E(cx - 0.4, noseY - 0.5, 0.9, 0.6, '#fff', ' opacity=".4"') +
        E(cx - 0.9 * k, noseY + 1, 0.5 * k, 0.32 * k, shade(skin, 0.5), ' opacity=".7"') + E(cx + 0.9 * k, noseY + 1, 0.5 * k, 0.32 * k, shade(skin, 0.5), ' opacity=".7"')
      : blur(P(`M${n(cx + 1.1)} ${n(ey - 1.5)}Q${n(cx + 2.4)} ${n(noseY - 3)} ${n(cx + 2.6 * k)} ${n(noseY)}L${n(cx + 1.2)} ${n(noseY - 0.5)}Q${n(cx + 0.9)} ${n(noseY - 4)} ${n(cx + 0.2)} ${n(ey - 1.5)}Z`, dark, ' opacity=".55"'), 'b2') +
        blur(E(cx + 0.4, noseY + 1.9, 3 * k, 0.9 * k, dark, ' opacity=".5"')) +
        E(cx - 0.2, noseY - 0.9, 1.1 * k, 1.3 * k, '#fff', ' opacity=".2"') +
        S(`M${n(cx - 2.2 * k)} ${n(noseY - 0.6)}q${n(-1 * k)} ${n(1.4 * k)} ${n(0.5 * k)} ${n(2 * k)}M${n(cx + 2.2 * k)} ${n(noseY - 0.6)}q${n(1 * k)} ${n(1.4 * k)} ${n(-0.5 * k)} ${n(2 * k)}`, shade(skin, 0.68), 0.6 * k) +
        E(cx - 1.05 * k, noseY + 1.25 * k, 0.75 * k, 0.4 * k, shade(skin, 0.48), ` opacity=".85" transform="rotate(15 ${n(cx - 1.05 * k)} ${n(noseY + 1.25 * k)})"`) +
        E(cx + 1.05 * k, noseY + 1.25 * k, 0.75 * k, 0.4 * k, shade(skin, 0.48), ` opacity=".85" transform="rotate(-15 ${n(cx + 1.05 * k)} ${n(noseY + 1.25 * k)})"`)

    // mouth: realistic lips per mood
    const mw = (little ? 3.6 : gender === 'girl' ? 5.4 : 5.6) * k
    const upC = shade(lipC, 0.82)
    const lineC = shade(lipC, 0.45)
    const lipU = (x: number, w: number, cl: number, cr: number, t = 1) => {
      const y = my
      return `M${n(x - w)} ${n(y - cl)}C${n(x - w * 0.55)} ${n(y - 1.1 * k * t - cl * 0.5)} ${n(x - w * 0.3)} ${n(y - 1.9 * k * t)} ${n(x)} ${n(y - 1.2 * k * t)}` +
        `C${n(x + w * 0.3)} ${n(y - 1.9 * k * t)} ${n(x + w * 0.55)} ${n(y - 1.1 * k * t - cr * 0.5)} ${n(x + w)} ${n(y - cr)}`
    }
    const closed = (x: number, w: number, cl: number, cr: number, full = 1) => {
      const y = my
      const line = `Q${n(x)} ${n(y + 0.3 + (cl + cr) * 0.45)} ${n(x - w)} ${n(y - cl)}`
      const lineR = `M${n(x - w)} ${n(y - cl)}Q${n(x)} ${n(y + 0.3 + (cl + cr) * 0.45)} ${n(x + w)} ${n(y - cr)}`
      return P(lipU(x, w, cl, cr) + line + 'Z', upC) +
        P(lineR + `C${n(x + w * 0.6)} ${n(y + 2.6 * k * full + (cl + cr) * 0.3)} ${n(x - w * 0.6)} ${n(y + 2.6 * k * full + (cl + cr) * 0.3)} ${n(x - w)} ${n(y - cl)}Z`, lipC) +
        E(x, y + 1.3 * k * full + (cl + cr) * 0.3, w * 0.32, 0.45 * k, '#fff', ' opacity=".28"') +
        S(lineR, lineC, 0.6 * k) +
        S(`M${n(x - w - 0.4)} ${n(y - cl - 0.3)}q-.3 .6 .2 1M${n(x + w + 0.4)} ${n(y - cr - 0.3)}q.3 .6 -.2 1`, dark, 0.45, ' opacity=".6"')
    }
    const open = (x: number, w: number, c: number, depth: number, teeth: number, tongue: boolean, tongueOut = false) => {
      const y = my
      const hole = `M${n(x - w)} ${n(y - c)}Q${n(x)} ${n(y + 0.2)} ${n(x + w)} ${n(y - c)}C${n(x + w * 0.7)} ${n(y + depth)} ${n(x - w * 0.7)} ${n(y + depth)} ${n(x - w)} ${n(y - c)}Z`
      const cid = `${id}-m`
      return `<clipPath id="${cid}"><path d="${hole}"/></clipPath>` +
        P(hole, '#4e1a22') +
        `<g clip-path="url(#${cid})">` +
        (teeth ? P(`M${n(x - w)} ${n(y - c - 1)}H${n(x + w)}V${n(y + teeth * k)}Q${n(x)} ${n(y + teeth * k + 1)} ${n(x - w)} ${n(y + teeth * k)}Z`, '#f8f4ee') + S(`M${n(x)} ${n(y)}v${n(teeth * k)}`, '#d8d0c8', 0.3) : '') +
        (tongue ? E(x, y + depth * 0.8, w * 0.55, depth * 0.35, '#d9707e') : '') +
        `</g>` +
        P(lipU(x, w, c, c, 0.8) + `Q${n(x)} ${n(y + 0.2)} ${n(x - w)} ${n(y - c)}Z`, upC) +
        P(`M${n(x - w)} ${n(y - c)}C${n(x - w * 0.7)} ${n(y + depth)} ${n(x + w * 0.7)} ${n(y + depth)} ${n(x + w)} ${n(y - c)}C${n(x + w * 0.7)} ${n(y + depth + 2.2 * k)} ${n(x - w * 0.7)} ${n(y + depth + 2.2 * k)} ${n(x - w)} ${n(y - c)}Z`, lipC) +
        (tongueOut ? P(`M${n(x - w * 0.42)} ${n(y + depth * 0.7)}H${n(x + w * 0.42)}V${n(y + depth + 2.2 * k)}A${n(w * 0.42)} ${n(w * 0.45)} 0 0 1 ${n(x - w * 0.42)} ${n(y + depth + 2.2 * k)}Z`, '#e07a88') + S(`M${n(x)} ${n(y + depth + 0.5)}v${n(2.4 * k)}`, '#b9566a', 0.4) : '')
    }
    let mouth: string
    if (pacifier) mouth = E(cx, my + 1.2, 6 * k, 3.4 * k, '#8fc8ee') + C(cx, my + 1.2, 2.3 * k, '#fff', ' opacity=".9"') + C(cx, my + 1.2, 1.5 * k, '#f2a9c1')
    else
      switch (mood) {
        case 'happy': mouth = open(cx, mw * 1.18, 1.4 * k, 5 * k, little ? 0 : 1.9, true); break
        case 'sad': mouth = closed(cx, mw * 0.9, -1.4 * k, -1.4 * k, 1.15); break
        case 'angry': mouth = open(cx, mw * 0.95, -0.9 * k, 2.4 * k, 2.6, false); break
        case 'surprised': mouth = open(cx, mw * 0.62, -0.6 * k, 5.4 * k, little ? 0 : 1.2, true); break
        case 'sleepy': mouth = open(cx, mw * 0.5, 0, 1.6 * k, 0, false); break
        case 'love': mouth = closed(cx, mw * 0.78, 0.9 * k, 0.9 * k, 1.2); break
        case 'wink': mouth = closed(cx + 0.4, mw, 0.1 * k, 1.8 * k); break
        case 'silly': mouth = open(cx, mw * 1.1, 1.2 * k, 3.6 * k, little ? 0 : 1.7, false, true); break
        case 'confused': mouth = closed(cx + 0.8, mw * 0.85, -0.7 * k, 0.9 * k); break
        case 'laugh': mouth = open(cx, mw * 1.3, 1.6 * k, 6.4 * k, little ? 0 : 2.1, true); break
        case 'starstruck': mouth = open(cx, mw * 1.15, 1.3 * k, 5.4 * k, little ? 0 : 1.9, true); break
        case 'cool': mouth = closed(cx + 0.6, mw * 0.95, -0.1 * k, 1.4 * k); break
        case 'smug': mouth = closed(cx + 1, mw * 0.85, -0.4 * k, 1.9 * k); break
        case 'cry': mouth = open(cx, mw * 0.85, -1.6 * k, 3.2 * k, 0, false); break
        case 'scared': mouth = open(cx, mw * 0.95, -0.6 * k, 2.6 * k, 2.4, false); break
        default: mouth = closed(cx, mw, 0.35 * k, 0.35 * k)
      }
    const philtrum = little ? '' : S(`M${n(cx - 0.8 * k)} ${n(noseY + 2.3 * k)}L${n(cx - 1 * k)} ${n(my - 1.7 * k)}M${n(cx + 0.8 * k)} ${n(noseY + 2.3 * k)}L${n(cx + 1 * k)} ${n(my - 1.7 * k)}`, dark, 0.45, ' opacity=".35"')
    const chin = little ? '' : blur(S(`M${n(cx - 2.6 * k)} ${n(my + 4.6 * k)}Q${cx} ${n(my + 3.6 * k)} ${n(cx + 2.6 * k)} ${n(my + 4.6 * k)}`, dark, 0.9, ' opacity=".45"'), 'b2')

    const blushA = little ? 0.42 : mood === 'love' || mood === 'happy' ? 0.3 : 0.16
    const cheeks = blur(E(L - 1.5 * k, noseY + 0.5, (little ? 5 : 4) * k, (little ? 3.2 : 2.5) * k, '#e8706c', ` opacity="${blushA}"`) + E(R + 1.5 * k, noseY + 0.5, (little ? 5 : 4) * k, (little ? 3.2 : 2.5) * k, '#e8706c', ` opacity="${blushA}"`))
    const contour =
      `<g clip-path="url(#${id}-hc)">` +
      blur(
        P(`M${n(cx + rx * 0.35)} ${n(cy - ry)}Q${n(cx + rx * 1.05)} ${n(cy)} ${n(cx + rx * 0.25)} ${n(cy + ry)}H${n(cx + rx + 3)}V${n(cy - ry)}Z`, dark, ' opacity=".28"') +
          (little ? E(L - 2, noseY + 2, 4.5, 3.5, '#fff', ' opacity=".18"') + E(R + 2, noseY + 2, 4.5, 3.5, '#fff', ' opacity=".12"')
            : P(`M${n(cx - rx)} ${n(noseY - 1)}Q${n(L - 1)} ${n(noseY + 2.5)} ${n(cx - rx * 0.6)} ${n(my + 3)}L${n(cx - rx)} ${n(my + 3)}Z`, dark, ' opacity=".25"') +
              P(`M${n(cx + rx)} ${n(noseY - 1)}Q${n(R + 1)} ${n(noseY + 2.5)} ${n(cx + rx * 0.6)} ${n(my + 3)}L${n(cx + rx)} ${n(my + 3)}Z`, dark, ' opacity=".35"')) +
          E(cx - 2, cy - ry * 0.55, rx * 0.45, ry * 0.18, '#fff', ' opacity=".12"') +
          E(cx, ey - hU * 1.2, ew * 0.9, ew * 0.8, dark, ' opacity=".18"') +
          E(L, ey - hU * 0.8, ew * 1.2, hU * 1.2, dark, ' opacity=".14"') + E(R, ey - hU * 0.8, ew * 1.2, hU * 1.2, dark, ' opacity=".18"'),
      ) +
      `</g>`

    let fr = ''
    if (freckles) for (const [dx, dy] of [[-2, 0], [0, 1.4], [2, -0.2], [1, 2.6], [-1.4, 2.4], [0.6, -1.2]]) fr += C(L - 0.5 + dx, noseY - 1.8 + dy, 0.38, shade(skin, 0.6), ' opacity=".75"')
    const freck = fr ? WM(fr) : ''
    const wrinkles = age === 'senior'
      ? WM(
          S(`M${n(cx - 2.8 * k)} ${n(noseY + 0.2)}Q${n(cx - 6.2 * k)} ${n(my - 0.6)} ${n(cx - mw - 1.2)} ${n(my + 3.4)}`, dark, 0.8, ' opacity=".8"') +
            S(`M${n(L - ew - 0.8)} ${n(ey - 0.6)}l-1.8 -1M${n(L - ew - 0.8)} ${n(ey + 0.6)}l-2 .3M${n(L - ew - 0.6)} ${n(ey + 1.7)}l-1.6 1.2`, dark, 0.5, ' opacity=".75"') +
            S(`M${n(cx - rx * jaw - 0.5)} ${n(cy + ry * 0.6)}q2 3.4 5 3.4`, dark, 0.6, ' opacity=".5"'),
        ) +
        S(`M${n(cx - 7)} ${n(cy - ry * 0.5)}Q${cx} ${n(cy - ry * 0.56)} ${n(cx + 7)} ${n(cy - ry * 0.5)}M${n(cx - 5.5)} ${n(cy - ry * 0.41)}Q${cx} ${n(cy - ry * 0.46)} ${n(cx + 5.5)} ${n(cy - ry * 0.41)}M${n(cx - 4)} ${n(cy - ry * 0.32)}Q${cx} ${n(cy - ry * 0.36)} ${n(cx + 4)} ${n(cy - ry * 0.32)}`, dark, 0.45, ' opacity=".55"') +
        S(`M${n(cx - 0.8)} ${n(ey - hU * 1.8)}v-1.8M${n(cx + 0.9)} ${n(ey - hU * 1.8)}v-1.6`, dark, 0.4, ' opacity=".5"')
      : age === 'adult' ? WM(S(`M${n(cx - 2.8 * k)} ${n(noseY + 0.8)}Q${n(cx - 5.8 * k)} ${n(my - 0.4)} ${n(cx - mw - 0.8)} ${n(my + 2.2)}`, dark, 0.55, ' opacity=".4"')) : ''

    // facial hair (canonical; mouth sits a touch lower than in the base frame)
    const fh =
      facial === 'beard'
        ? `<g transform="translate(0 1.6)">` + P('M-17.8 -1C-18 15 -11 24 0 24C11 24 18 15 17.8 -1C16.5 8 13.5 12.5 10 13C6 11.5 3 11.2 0 11.6C-3 11.2 -6 11.5 -10 13C-13.5 12.5 -16.5 8 -17.8 -1Z', H) +
          S('M-14 6Q-12 14 -7 19M14 6Q12 14 7 19M-9 15Q-6 19 -3 20M9 15Q6 19 3 20M0 18V22', 'rgba(0,0,0,.2)', 0.6) + S('M-12 9Q-10 15 -6 17M12 9Q10 15 6 17', 'rgba(255,255,255,.18)', 0.6) +
          P('M-6.5 11.6C-3 8.6 -1 8.8 0 9.8C1 8.8 3 8.6 6.5 11.6C3.5 11 1.5 11.2 0 11.9C-1.5 11.2 -3.5 11 -6.5 11.6Z', H) + E(0, 15.4, 5.4, 2.6, shade(skin, 0.86)) + `</g>`
        : facial === 'moustache'
          ? `<g transform="translate(0 1.4)">` + P('M-7.5 12.2C-4 8.2 -1.2 8.4 0 9.6C1.2 8.4 4 8.2 7.5 12.2C4.5 11 2 11 0 11.8C-2 11 -4.5 11 -7.5 12.2Z', H) + S('M-5 10.4l.6 1M-3 9.6l.4 1.2M3 9.6l-.4 1.2M5 10.4l-.6 1', 'rgba(0,0,0,.25)', 0.4) + `</g>`
          : facial === 'stubble'
            ? `<g clip-path="url(#${id}-ch)">${blur(P('M-19 3C-18 18 -10 24 0 24C10 24 18 18 19 3C16 10 12 13.5 0 13.4C-12 13.5 -16 10 -19 3Z', hairC, ' opacity=".32"') + P('M-6 11.6Q0 9 6 11.6Q0 11 -6 11.6Z', hairC, ' opacity=".4"'), 'b2')}</g>`
            : ''

    // glasses (world)
    const gL = L
    const gR = R
    const gy = ey + 0.2
    const gr = ew * 1.42
    const frame = age === 'senior' ? '#8a6a4a' : '#2d2a33'
    const lens =
      glasses === 'round'
        ? C(gL, gy, gr, 'rgba(255,255,255,.12)', ` stroke="${frame}" stroke-width=".95"`) + C(gR, gy, gr, 'rgba(255,255,255,.12)', ` stroke="${frame}" stroke-width=".95"`) +
          S(`M${n(gL + gr)} ${n(gy - 0.6)}Q${cx} ${n(gy - 2)} ${n(gR - gr)} ${n(gy - 0.6)}M${n(gL - gr)} ${n(gy - 0.8)}L${n(cx - rx + 0.3)} ${n(gy - 1.6)}M${n(gR + gr)} ${n(gy - 0.8)}L${n(cx + rx - 0.3)} ${n(gy - 1.6)}`, frame, 0.9) +
          S(`M${n(gL - gr * 0.5)} ${n(gy - gr * 0.4)}l${n(gr * 0.5)} ${n(-gr * 0.3)}M${n(gR - gr * 0.5)} ${n(gy - gr * 0.4)}l${n(gr * 0.5)} ${n(-gr * 0.3)}`, '#fff', 0.5, ' opacity=".5"')
        : glasses === 'square'
          ? `<rect x="${n(gL - gr - 0.4)}" y="${n(gy - gr * 0.75)}" width="${n(gr * 2 + 0.8)}" height="${n(gr * 1.5)}" rx="1.4" fill="rgba(255,255,255,.12)" stroke="${frame}" stroke-width="1.2"/>` +
            `<rect x="${n(gR - gr - 0.4)}" y="${n(gy - gr * 0.75)}" width="${n(gr * 2 + 0.8)}" height="${n(gr * 1.5)}" rx="1.4" fill="rgba(255,255,255,.12)" stroke="${frame}" stroke-width="1.2"/>` +
            S(`M${n(gL + gr + 0.4)} ${n(gy - 1)}Q${cx} ${n(gy - 2)} ${n(gR - gr - 0.4)} ${n(gy - 1)}M${n(gL - gr - 0.4)} ${n(gy - 1.5)}L${n(cx - rx + 0.3)} ${n(gy - 2)}M${n(gR + gr + 0.4)} ${n(gy - 1.5)}L${n(cx + rx - 0.3)} ${n(gy - 2)}`, frame, 1.1)
          : glasses === 'sun'
            ? [gL, gR].map((x) => P(`M${n(x - gr - 0.6)} ${n(gy - gr * 0.7)}H${n(x + gr + 0.6)}Q${n(x + gr + 0.4)} ${n(gy + gr)} ${n(x)} ${n(gy + gr * 0.95)}Q${n(x - gr - 0.4)} ${n(gy + gr)} ${n(x - gr - 0.6)} ${n(gy - gr * 0.7)}Z`, u('g'), ` stroke="#1d1b20" stroke-width="1"`) + S(`M${n(x - gr * 0.5)} ${n(gy - gr * 0.3)}l${n(gr * 0.5)} ${n(gr * 0.5)}`, '#fff', 0.8, ' opacity=".45"')).join('') +
              S(`M${n(gL + gr)} ${n(gy - gr * 0.6)}H${n(gR - gr)}M${n(gL - gr)} ${n(gy - gr * 0.6)}L${n(cx - rx + 0.3)} ${n(gy - 2.2)}M${n(gR + gr)} ${n(gy - gr * 0.6)}L${n(cx + rx - 0.3)} ${n(gy - 2.2)}`, '#1d1b20', 1.1)
            : ''


    // ---- body ----
    const top0 = cy + ry + (little ? 4 : 6)
    const W = A.W
    const neckW = A.neck
    const sh = little ? 4 : 6
    const bodyPath = `M${n(cx - W)} 104L${n(cx - W)} ${n(top0 + 16)}C${n(cx - W)} ${n(top0 + 6)} ${n(cx - W + 3)} ${n(top0 + 3)} ${n(cx - W + 10)} ${n(top0 + 1.5)}C${n(cx - W / 2)} ${n(top0)} ${n(cx - neckW - 2)} ${n(top0 - sh * 0.4)} ${n(cx - neckW / 2 - 1)} ${n(top0 - sh * 0.6)}L${n(cx + neckW / 2 + 1)} ${n(top0 - sh * 0.6)}C${n(cx + neckW + 2)} ${n(top0 - sh * 0.4)} ${n(cx + W / 2)} ${n(top0)} ${n(cx + W - 10)} ${n(top0 + 1.5)}C${n(cx + W - 3)} ${n(top0 + 3)} ${n(cx + W)} ${n(top0 + 6)} ${n(cx + W)} ${n(top0 + 16)}L${n(cx + W)} 104Z`
    const neck =
      `<rect x="${n(cx - neckW / 2)}" y="${n(cy + ry * 0.5)}" width="${n(neckW)}" height="${n(top0 - cy - ry * 0.5 + 6)}" rx="${n(neckW / 2.4)}" fill="${skin}"/>` +
      P(`M${n(cx - neckW / 2)} ${n(cy + ry * 0.75)}Q${cx} ${n(cy + ry + 4)} ${n(cx + neckW / 2)} ${n(cy + ry * 0.75)}V${n(cy + ry + 2)}Q${cx} ${n(cy + ry + 5)} ${n(cx - neckW / 2)} ${n(cy + ry + 2)}Z`, dark, ' opacity=".55"')
    const ndip = top0 + (clothes === 'collar' ? 4 : 5)
    let body = ''
    switch (clothes) {
      case 'dress':
        body = P(bodyPath, u('s')) + P(`M${n(cx - W + 1)} 104V${n(top0 + 14)}Q${n(cx - W + 4)} ${n(top0 + 9)} ${n(cx - W + 12)} ${n(top0 + 8)}Q${cx} ${n(top0 + 13)} ${n(cx + W - 12)} ${n(top0 + 8)}Q${n(cx + W - 4)} ${n(top0 + 9)} ${n(cx + W - 1)} ${n(top0 + 14)}V104Z`, u('o')) +
          WM(`${S(`M${n(cx - W + 11)} ${n(top0 + 8.5)}L${n(cx - W + 13)} ${n(top0 - 1)}`, shade(cloth, 0.85), 2)}`)
        break
      case 'hoodie':
        body = P(bodyPath, u('o')) +
          P(`M${n(cx - neckW / 2 - 6)} ${n(top0 - 1)}Q${cx} ${n(top0 + 12)} ${n(cx + neckW / 2 + 6)} ${n(top0 - 1)}Q${n(cx + neckW / 2 + 2)} ${n(top0 + 7)} ${cx} ${n(top0 + 8)}Q${n(cx - neckW / 2 - 2)} ${n(top0 + 7)} ${n(cx - neckW / 2 - 6)} ${n(top0 - 1)}Z`, shade(cloth, 0.78)) +
          S(`M${n(cx - 3)} ${n(top0 + 8)}v8M${n(cx + 3)} ${n(top0 + 8)}v7`, '#f4efe8', 1.1) +
          S(`M${n(cx - W + 10)} 104Q${n(cx - W + 12)} ${n(top0 + 20)} ${n(cx - W + 9)} ${n(top0 + 14)}`, 'rgba(0,0,0,.12)', 1)
        break
      case 'collar':
        body = P(bodyPath, u('o')) +
          P(`M${n(cx - neckW / 2 - 1)} ${n(top0 - 1)}L${cx} ${n(ndip + 4)}L${n(cx + neckW / 2 + 1)} ${n(top0 - 1)}Z`, skin) +
          P(`M${n(cx - neckW / 2 - 1.5)} ${n(top0 - 2.5)}L${cx} ${n(ndip + 4)}L${n(cx - neckW / 2 - 6)} ${n(top0 + 6)}Z`, shade(cloth, 1.25)) +
          P(`M${n(cx + neckW / 2 + 1.5)} ${n(top0 - 2.5)}L${cx} ${n(ndip + 4)}L${n(cx + neckW / 2 + 6)} ${n(top0 + 6)}Z`, shade(cloth, 1.25)) +
          C(cx, ndip + 8, 0.8, shade(cloth, 0.6)) + C(cx, ndip + 13, 0.8, shade(cloth, 0.6))
        break
      case 'sweater':
        body = P(bodyPath, u('o')) +
          P(`M${n(cx - neckW / 2 - 2)} ${n(top0 - 1.5)}Q${cx} ${n(ndip + 3)} ${n(cx + neckW / 2 + 2)} ${n(top0 - 1.5)}`, 'none', ` stroke="${shade(cloth, 0.8)}" stroke-width="3"`) +
          S(`M${n(cx - 14)} ${n(top0 + 13)}l3 3 3 -3 3 3 3 -3 3 3 3 -3 3 3 3 -3`, shade(cloth, 1.3), 1.1)
        break
      case 'onesie':
        body = P(bodyPath, u('o')) +
          P(`M${n(cx - neckW / 2 - 2)} ${n(top0 - 1.5)}Q${cx} ${n(ndip + 3)} ${n(cx + neckW / 2 + 2)} ${n(top0 - 1.5)}`, 'none', ` stroke="#fff" stroke-width="2.2" opacity=".85"`) +
          C(cx, top0 + 10, 1, '#fff', ' opacity=".8"') + C(cx, top0 + 15, 1, '#fff', ' opacity=".8"') +
          C(cx - 14, top0 + 9, 1.3, '#fff', ' opacity=".5"') + C(cx + 13, top0 + 13, 1.3, '#fff', ' opacity=".5"') + C(cx - 9, top0 + 16, 1, '#fff', ' opacity=".5"')
        break
      case 'cardigan':
        body = P(bodyPath, '#f1ebe0') +
          P(`M${n(cx - neckW / 2 - 1)} ${n(top0 - 1)}Q${cx} ${n(ndip + 2)} ${n(cx + neckW / 2 + 1)} ${n(top0 - 1)}`, skin) +
          P(`M${n(cx - W)} 104L${n(cx - W)} ${n(top0 + 12)}Q${n(cx - W)} ${n(top0)} ${n(cx - W + 13)} ${n(top0 - 1)}L${n(cx - neckW / 2 - 1)} ${n(top0 - 1)}L${n(cx - 4)} 104Z`, u('o')) +
          P(`M${n(cx + W)} 104L${n(cx + W)} ${n(top0 + 12)}Q${n(cx + W)} ${n(top0)} ${n(cx + W - 13)} ${n(top0 - 1)}L${n(cx + neckW / 2 + 1)} ${n(top0 - 1)}L${n(cx + 4)} 104Z`, u('o')) +
          C(cx - 6, top0 + 12, 1, shade(cloth, 0.6)) + C(cx - 5, top0 + 18, 1, shade(cloth, 0.6))
        break
      default: // tee
        body = P(bodyPath, u('o')) +
          P(`M${n(cx - neckW / 2 - 1)} ${n(top0 - 1)}Q${cx} ${n(ndip + 2)} ${n(cx + neckW / 2 + 1)} ${n(top0 - 1)}`, skin) +
          S(`M${n(cx - neckW / 2 - 1.5)} ${n(top0 - 1)}Q${cx} ${n(ndip + 3)} ${n(cx + neckW / 2 + 1.5)} ${n(top0 - 1)}`, shade(cloth, 0.8), 1.4)
    }
    const hijabFront = hair === 'hijab'
      ? `<g transform="${T}">${P('M-24 2C-26 -21 -13 -29.5 0 -29.5C13 -29.5 26 -21 24 2C24 16 21 24 30 34L32 62L-32 62L-30 34C-21 24 -24 16 -24 2ZM-15.6 -1C-15.6 -14 -8.5 -19.8 0 -19.8C8.5 -19.8 15.6 -14 15.6 -1C15.6 12 9.5 20.4 0 21.2C-9.5 20.4 -15.6 12 -15.6 -1Z', u('f'), ' fill-rule="evenodd"')}` +
        S('M-15.6 -1C-15.6 -14 -8.5 -19.8 0 -19.8C8.5 -19.8 15.6 -14 15.6 -1', 'rgba(0,0,0,.14)', 1.2) + S('M10 22Q18 30 16 44M-20 18Q-24 30 -22 44', 'rgba(0,0,0,.12)', 1.2) + `</g>`
      : ''

    const earsSvg = ears
      ? WM(`${P(`M${n(cx - rx + 1)} ${n(ey - 2.6)}C${n(cx - rx - 2.4)} ${n(ey - 4.2)} ${n(cx - rx - 3.6)} ${n(ey + 1)} ${n(cx - rx - 1.6)} ${n(ey + 5.2)}C${n(cx - rx - 0.8)} ${n(ey + 7.4)} ${n(cx - rx + 0.6)} ${n(ey + 7.6)} ${n(cx - rx + 1.2)} ${n(ey + 6.4)}Z`, skin) + S(`M${n(cx - rx - 0.2)} ${n(ey - 1.6)}C${n(cx - rx - 2.2)} ${n(ey - 2)} ${n(cx - rx - 2.4)} ${n(ey + 1.8)} ${n(cx - rx - 1)} ${n(ey + 3.6)}Q${n(cx - rx - 0.2)} ${n(ey + 4.4)} ${n(cx - rx - 0.6)} ${n(ey + 5.6)}`, dark, 0.6, ' opacity=".8"') + E(cx - rx - 0.4, ey + 1.6, 0.9, 1.6, dark, ' opacity=".35"')}${earring ? C(cx - rx + 0.6, ey + 7.4, 1, '#f2c14e') : ''}`)
      : earring && !covered ? `${C(cx - rx + 1.2, ey + 7.4, 1, '#f2c14e')}${C(cx + rx - 1.2, ey + 7.4, 1, '#f2c14e')}` : ''

    const hand = (x: number, side: 1 | -1) =>
      `<g transform="rotate(${side * 10} ${n(x)} ${n(ey + 2)})">` +
      `<rect x="${n(x - 5.5)}" y="${n(ey + 7)}" width="11" height="50" rx="5.5" fill="${u('o')}"/>` +
      `<rect x="${n(x - 7)}" y="${n(ey - 8)}" width="14" height="18" rx="7" fill="${skin}"/>` +
      S(`M${n(x - 2.5)} ${n(ey - 7)}v5M${n(x + 1.5)} ${n(ey - 7.5)}v5`, 'rgba(0,0,0,.12)', 1) +
      `</g>`


    return (
      `<defs>${defs}<clipPath id="${id}-cc"><path d="M-30 -9H30V40H-30Z"/></clipPath><clipPath id="${id}-ch"><path d="M-18 0C-18 12 -10 22 0 22C10 22 18 12 18 0V30H-18Z"/></clipPath></defs>` +
      `<g transform="translate(50 100) scale(1.08) translate(-50 -100)"><g data-lv-body="">` +
      `<g data-lv-depth=".1">${neck}${body}</g>` +
      `<g data-lv-depth=".4" data-lv-tilt="4">` +
      `<g transform="${T}">${back}${accBack}</g>` +
      earsSvg +
      `<path d="${HEAD}" fill="${u('s')}"/>` +
      contour +
      `<g data-lv-depth=".55">` +
      cheeks + freck + wrinkles + chin + philtrum + nose +
      `<g transform="${T}">${fh}</g>` +
      eyes + brows +
      `<g data-lv-mouth="1">${mouth}</g>` +
      lens +
      `</g>` +
      `<g transform="${T}">${top}${accTop}</g>` +
      hijabFront +
      (mood === 'sleepy' || mood === 'love' || mood === 'sad' || mood === 'angry' ? `<g data-lv-depth=".55">${faceExtras(F, mood)}</g>` : '') +
      `<g data-lv-shy="" opacity="0">${hand(cx - gap - 1, -1)}${hand(cx + gap + 1, 1)}</g>` +
      `</g></g></g>`
    )
  },
})
