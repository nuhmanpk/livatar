import { defineStyle, luma, n, safe } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const SPECIES = ['cat', 'dog', 'bear', 'bunny', 'fox', 'panda', 'frog', 'mouse', 'shark', 'penguin', 'owl', 'chick', 'parrot', 'pig', 'koala', 'lion'] as const
type Species = (typeof SPECIES)[number]

export interface AnimalOptions {
  species?: Species | 'random'
  /** Fur / feather / skin color. Default: a seeded, species appropriate color. */
  fur?: string
  pattern?: 'none' | 'spots' | 'stripe' | 'random'
  whiskers?: boolean | 'random'
  /** Sticker look: thick dark outline plus a glossy highlight. */
  outline?: boolean | 'random'
}

const INK = '#2a1f2d'
const OL = '#1f2a44'
const PINK = '#ff9db5'
const CREAM = '#fbf3e4'
const BLK = '#2b2b33'
const BEAK = '#ffa62b'
const FUR: Record<Species, string[]> = {
  cat: ['#f4a259', '#a3a3a3', '#5a5560', '#efe2cf', '#d9895b'],
  dog: ['#c68b59', '#e9d3b0', '#8b5a3c', '#f3efe8', '#5c4438'],
  bear: ['#8b5a3c', '#a97142', '#6e4a35', '#d9b38c'],
  bunny: ['#f6f1ea', '#d8c3a5', '#c9c0b8', '#9a7b62'],
  fox: ['#f08a3c', '#e8743b', '#f59e4c'],
  panda: ['#ffffff', '#f7f4ef'],
  frog: ['#7ccf6b', '#5bb85d', '#9bd770', '#4fbf9a'],
  mouse: ['#b8b2ae', '#a39d98', '#d8d2cc', '#efe9e4'],
  shark: ['#7f9cc0', '#6d8fb5', '#8aa6c8', '#6f88a8'],
  penguin: ['#2f3b52', '#3b4256', '#2b3245'],
  owl: ['#9c6b4a', '#b5835a', '#8a6a55', '#9a9aa8'],
  chick: ['#ffd84d', '#ffe066', '#ffcf3f'],
  parrot: ['#3cb371', '#e63946', '#2a9df4', '#20b2aa'],
  pig: ['#ffb3c1', '#f9a8bb', '#ffc4d0'],
  koala: ['#9aa3ad', '#a8b0b8', '#8d96a1'],
  lion: ['#f4b860', '#e9a54b', '#f2c179'],
}

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0) =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${rot} ${n(cx)} ${n(cy)})"` : ''}/>`
const C = (cx: number, cy: number, r: number, fill: string) => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"/>`
const P = (d: string, fill: string) => `<path d="${d}" fill="${fill}"/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
/** Draw the left half and its mirror image. */
const M = (svg: string) => svg + `<g transform="matrix(-1 0 0 1 100 0)">${svg}</g>`

/** Cute animals and birds — cats, dogs, sharks, owls… with an optional sticker outline. */
export const animal = defineStyle<AnimalOptions>({
  name: 'animal',
  colors: ['#ffd6a5', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#fdffb6', '#ffadad'],
  defaults: { species: 'random', pattern: 'random', whiskers: 'random', outline: true },
  variants: {
    species: SPECIES,
    fur: ['#f4a259', '#c68b59', '#8b5a3c', '#a3a3a3', '#5a5560', '#efe2cf', '#7ccf6b', '#7f9cc0', '#ffd84d', '#ffb3c1'],
    pattern: ['none', 'spots', 'stripe'],
    whiskers: [true, false],
    outline: [true, false],
  },
  render({ rand, pick, id, mood, color, options: o }) {
    const sp = pick('species', SPECIES)
    const fur = o.fur && o.fur !== 'random' ? safe(o.fur) : rand.pick(FUR[sp])
    const pattern = pick('pattern', ['none', 'none', 'spots', 'stripe'])
    const whiskers = pick('whiskers', [true, false]) && 'cat fox mouse bunny lion dog'.includes(sp)
    const outline = pick('outline', [true, false])
    const accent = color(fur)
    const dk = (luma(fur) ?? 1) < 0.35

    // head ellipse, eye line, gap, nose y, mouth y, feature scale
    let [hx, hy, rx, ry] = [50, 52, 24, 22]
    let [ey, gap, ny, my, s] = [50, 10, 57, 61, 0.85]
    let back = '' // outlined shapes behind the head (ears, fins, tufts)
    let inner = '' // not outlined, painted over `back`
    let front = '' // outlined shapes over the head (floppy ears)
    let face = '' // markings on the head (clipped to it)
    let deco = '' // unclipped face details
    let nose = ''
    let eyeBg = fur
    let style: 'dot' | 'round' | 'owl' = rand.bool(0.6) ? 'dot' : 'round'
    let beak = 0 // 1 = small beak, 2 = hooked parrot beak
    let fangs = false
    let body = fur
    let belly = CREAM
    let wing = false

    const darkNose = (y: number, w = 4) => P(`M${n(50 - w)} ${n(y - 1.6)}h${n(2 * w)}q0 3.6-${w} 4.6q-${w}-1-${w}-4.6z`, INK) + E(49, y - 0.6, 1.3, 0.7, 'rgba(255,255,255,.5)')
    const pinkNose = (y: number) => P(`M47.4 ${n(y - 1.2)}h5.2q0 2.6-2.6 3.4q-2.6-.8-2.6-3.4z`, PINK)
    const lobes = (y: number, c = CREAM) => E(45, y, 6, 5, c) + E(55, y, 6, 5, c)

    switch (sp) {
      case 'cat':
        back = M(P('M29 42L30 20L46 32Z', fur))
        inner = M(P('M32.5 37L33 26L41.5 32Z', PINK))
        face = lobes(60)
        nose = pinkNose(57)
        break
      case 'dog':
        front = M(E(26, 53, 7.5, 14, fur, 16))
        deco = M(E(26, 53, 7.5, 14, 'rgba(0,0,0,.22)', 16))
        face = E(50, 61, 11, 8.5, CREAM)
        nose = darkNose(57)
        break
      case 'bear':
      case 'panda': {
        const ear = sp === 'panda' ? BLK : fur
        back = M(C(31, 33, 8.5, ear))
        inner = sp === 'bear' ? M(C(31, 33, 4.5, 'rgba(0,0,0,.2)')) : ''
        face = sp === 'panda' ? M(E(40.5, 51, 6.5, 8, BLK, 30)) : E(50, 61, 10, 8, CREAM)
        if (sp === 'panda') (eyeBg = BLK), (style = 'round'), (body = BLK)
        nose = darkNose(57)
        break
      }
      case 'bunny':
        hy = 54
        back = M(E(40, 19, 6.5, 16, fur, -10))
        inner = M(E(40, 20, 3, 11.5, PINK, -10))
        face = lobes(61)
        nose = pinkNose(58)
        my = 62
        break
      case 'fox':
        rx = 25
        back = M(P('M28 46L25 17L47 31Z', fur))
        inner = M(P('M30.5 40L29 25L41 32Z', CREAM))
        face = P('M26 54Q38 56 50 66Q62 56 74 54Q74 74 50 76Q26 74 26 54Z', CREAM)
        nose = darkNose(60, 3.2)
        my = 63.5
        break
      case 'frog':
        ;[hy, rx, ry, ey, gap, my] = [57, 28, 19, 41, 13, 61]
        back = M(C(37, 41, 9.5, fur))
        style = 'round'
        deco = C(47, 54, 1, INK) + C(53, 54, 1, INK) + M(E(30, 61, 4, 2.3, 'rgba(255,92,138,.35)'))
        break
      case 'mouse':
        ;[hy, rx, ry] = [54, 22, 20]
        back = M(C(28, 35, 12, fur))
        inner = M(C(28, 35, 7.5, PINK))
        nose = pinkNose(58)
        my = 62
        break
      case 'shark':
        ;[hy, rx, ry, ey, gap, my, s] = [54, 27, 22, 49, 11.5, 59, 1.15]
        back = P('M39 37Q46 12 64 9Q57 22 61 37Z', fur)
        face = P('M20 60Q50 51 80 60V80H20Z', CREAM) + M(S('M29 52v5M32 51.5v6', 'rgba(0,0,0,.18)', 1.2))
        fangs = true
        style = 'dot'
        wing = true
        break
      case 'penguin':
        ;[hy, ey, gap, my] = [53, 52, 9, 57.5]
        face = M(E(41, 56, 10, 13, '#fff')) + E(50, 66, 14, 9, '#fff')
        eyeBg = '#fff'
        style = 'dot'
        beak = 1
        belly = '#fff'
        wing = true
        break
      case 'owl':
        back = M(P('M29 41L25 20L42 31Z', fur))
        face = M(C(40, 50, 10.5, '#f3e3c3')) + P('M43 33Q50 40 57 33', 'rgba(0,0,0,.12)')
        eyeBg = '#f3e3c3'
        style = 'owl'
        ;[ey, my] = [50, 56.5]
        beak = 1
        wing = true
        break
      case 'chick':
        ;[hy, rx, ry, ey, my] = [54, 24, 23, 51, 58]
        back = P('M48 33Q42 23 48 21Q50 27 51 32Z', fur) + P('M51 32Q53 21 59 24Q54 27 53 33Z', fur)
        deco = M(E(35, 58, 4, 2.4, 'rgba(255,92,138,.4)'))
        style = 'dot'
        beak = 1
        belly = fur
        wing = true
        break
      case 'parrot': {
        const crest = color(fur)
        back = E(42, 27, 4, 11, crest, -30) + E(50, 23, 4.5, 12, crest) + E(58, 27, 4, 11, crest, 30)
        face = M(E(40, 50, 8.5, 7.5, '#fff'))
        eyeBg = '#fff'
        style = 'dot'
        ;[my] = [55]
        beak = 2
        belly = fur
        wing = true
        break
      }
      case 'pig':
        ;[ry, ey, my, s] = [21, 48, 65.5, 0.7]
        back = M(P('M28 40Q22 24 30 21Q38 25 42 33Z', fur))
        inner = M(P('M30 35Q27 27 31 25Q35 28 37 32Z', 'rgba(220,60,100,.25)'))
        face = E(50, 58.5, 8.5, 6, 'rgba(220,60,100,.22)') + E(47, 58.5, 1.4, 2.2, 'rgba(120,30,60,.55)') + E(53, 58.5, 1.4, 2.2, 'rgba(120,30,60,.55)')
        break
      case 'koala':
        ;[ey, gap, my] = [48, 11, 65]
        back = M(C(27, 38, 12.5, fur))
        inner = M(C(28, 39, 8, '#f4eef0'))
        nose = E(50, 57, 4.6, 6.5, '#3a3540') + E(48.8, 54.5, 1.4, 1.8, 'rgba(255,255,255,.4)')
        break
      case 'lion': {
        ;[hy, rx, ry] = [54, 22, 21]
        const mane = rand.pick(['#b5562a', '#8a4b26', '#d0702e', '#6b3a20'])
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2
          back += C(50 + Math.cos(a) * 25, 52 + Math.sin(a) * 24, 10, mane)
        }
        back += M(C(32, 36, 6.5, fur))
        inner = M(C(32, 36, 3.5, 'rgba(0,0,0,.18)'))
        face = lobes(61)
        nose = darkNose(57.5, 3.5)
        my = 62.5
        break
      }
    }

    if (pattern === 'spots')
      for (let i = rand.int(2, 3); i > 0; i--) face = C(rand.float(30, 70), rand.float(hy - ry, hy - 6), rand.float(3, 6), 'rgba(0,0,0,.15)') + face
    if (pattern === 'stripe') face = P(`M45 ${hy - ry}l2 9 1-9zM49 ${hy - ry}l1 11 1-11zM53 ${hy - ry}l2 9 1-9z`, 'rgba(0,0,0,.2)') + face

    const ink = (luma(eyeBg) ?? 1) < 0.35 ? '#fff' : INK
    const xink = dk ? '#fff' : INK
    const eye = (x: number, y: number) => {
      const k = sp === 'frog' ? 1.35 : 1
      const hl = `<circle cx="${n(x - 0.9 * k)}" cy="${n(y - 1 * k)}" r="${n(0.9 * k)}" fill="#fff"/>`
      if (style === 'owl') return C(x, y, 6, '#ffc93c') + `<g data-lv-depth=".45">${C(x, y, 3.4, INK)}${hl}</g>`
      if (style === 'round') return C(x, y, 4.2 * k, '#fff') + `<g data-lv-depth=".45">${C(x, y + 0.3, 2.5 * k, INK)}${hl}</g>`
      return `<g data-lv-depth=".45">${C(x, y, 3.2, ink)}${hl}</g>`
    }
    const F: FaceSpec = { x: 50, ey, gap, my, ink, s: style === 'owl' ? 1.1 : 0.9, eye }
    const MF: FaceSpec = { ...F, ink: INK, s }
    const XF: FaceSpec = { ...F, ink: xink }

    const teeth = (y: number, w: number) => P(`M${n(50 - w)} ${n(y)}h3l-1.5 3.2zM${n(50 + w - 3)} ${n(y)}h3l-1.5 3.2z`, '#fff')
    const open = 'happy surprised silly angry'.includes(mood)
    const beakSvg = () => {
      const y = my
      if (beak === 2)
        return (
          (open ? E(50, y + 7, 6, 5, INK) + (mood === 'silly' ? E(50, y + 10, 2.4, 1.8, '#ff7a93') : '') : '') +
          `<path d="M${n(42.5)} ${y}Q42.5 ${y - 5} 50 ${y - 5}Q57.5 ${y - 5} 57.5 ${y}Q57.5 ${y + 6} 50 ${y + 12}Q49 ${y + 8} 46 ${y + 5}Q42.5 ${y + 3} 42.5 ${y}Z" fill="#f6e7c8" stroke="${OL}" stroke-width="${outline ? 1.4 : 0}" stroke-linejoin="round"/>` +
          S(`M46 ${y - 1}Q50 ${y - 2.5} 54 ${y - 1}`, 'rgba(0,0,0,.25)', 1)
        )
      const up = `<path d="M44.5 ${y}Q50 ${y - 2} 55.5 ${y}L50 ${n(y + (open ? 4 : 5.5))}Z" fill="${BEAK}" stroke="${BEAK}" stroke-width="1.4" stroke-linejoin="round"/>`
      return open
        ? P(`M45 ${y + 1}L55 ${y + 1}L50 ${y + 9}Z`, INK) +
            `<path d="M46 ${y + 3.5}L54 ${y + 3.5}L50 ${y + 8.5}Z" fill="#f08c1a" stroke="#f08c1a" stroke-width="1.2" stroke-linejoin="round"/>` +
            (mood === 'silly' ? E(50, y + 4, 2, 1.5, '#ff7a93') : '') +
            up
        : up
    }

    const nm = rand.pick(['w', 'smile', 'open'] as const)
    const neutralMouth =
      sp === 'frog'
        ? S(`M38 ${my}Q50 ${my + 7} 62 ${my}`, INK, 2)
        : fangs || nm === 'open'
          ? P(`M${50 - 6 * s} ${my}Q50 ${n(my + 10 * s)} ${50 + 6 * s} ${my}Z`, INK) + E(50, my + 5 * s, 3 * s, 1.8 * s, '#ff7a93')
          : nm === 'w'
            ? S(`M50 ${my - 2.5}V${my}M44.5 ${my}q2.75 3 5.5 0q2.75 3 5.5 0`, INK, 1.8)
            : S(`M44.5 ${my}Q50 ${my + 5} 55.5 ${my}`, INK, 2)
    const mouth = beak
      ? beakSvg()
      : (mood === 'neutral' ? neutralMouth : faceMouth(MF, mood)) + (fangs && (mood === 'neutral' || mood === 'happy') ? teeth(my, 5.5 * s) : '')

    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${eye(50 - gap, ey)}</g><g data-lv-eye="">${eye(50 + gap, ey)}</g>` : faceEyes(F, mood)
    const head = E(hx, hy, rx, ry, fur)
    const ol = (svg: string) => (outline && svg ? `<g stroke="${OL}" stroke-width="5.5" stroke-linejoin="round">${svg}</g>` : '')
    const chest = `<path d="M18 106C18 85 32 77 50 77C68 77 82 85 82 106Z" fill="${body}"/>`
    const whisk = whiskers ? M(S('M38 59L27 57M38 62L27 63', dk ? '#fff' : INK, 0.9, ' opacity=".55"')) : ''

    const paw = (x: number, side: 1 | -1) =>
      `<g transform="rotate(${side * 10} ${x} ${ey + 2})">` +
      (wing
        ? `<path d="M${x - 8} ${ey + 60}C${x - 10} ${ey + 20} ${x - 8} ${ey - 10} ${x} ${ey - 12}C${x + 8} ${ey - 10} ${x + 10} ${ey + 20} ${x + 8} ${ey + 60}Z" fill="${sp === 'penguin' ? fur : sp === 'shark' ? fur : accent}" stroke="${OL}" stroke-width="${outline ? 2.5 : 0}"/>` +
          S(`M${x - 3} ${ey - 4}v8M${x + 3} ${ey - 4}v8`, 'rgba(0,0,0,.15)', 1.2)
        : `<rect x="${x - 7}" y="${ey + 8}" width="14" height="50" rx="6" fill="${body}"/>` +
          `<rect x="${x - 9.5}" y="${ey - 11}" width="19" height="23" rx="9" fill="${fur}" stroke="${outline ? OL : 'rgba(0,0,0,.18)'}" stroke-width="${outline ? 2.5 : 1}"/>` +
          E(x, ey + 4, 4, 3, PINK) + C(x - 4.5, ey - 3, 1.7, PINK) + C(x, ey - 5, 1.7, PINK) + C(x + 4.5, ey - 3, 1.7, PINK)) +
      `</g>`

    return (
      `<defs><clipPath id="${id}-h">${head}</clipPath></defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".12">${ol(chest)}${chest}${E(50, 98, 15, 16, belly)}</g>` +
      `<g data-lv-depth=".45" data-lv-tilt="5">` +
      ol(back + head) + back + inner + head +
      `<g clip-path="url(#${id}-h)">${face}</g>` +
      ol(front) + front + deco +
      (outline ? E(hx - rx * 0.5, hy - ry * 0.62, rx * 0.26, ry * 0.13, '#fff', -30).replace('/>', ' opacity=".45"/>') : '') +
      `<g data-lv-depth=".6">` +
      eyes + faceBrows(F, mood) + nose + whisk +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(XF, mood) +
      `</g>` +
      `<g data-lv-shy="" opacity="0">${paw(50 - gap + 1, -1)}${paw(50 + gap - 1, 1)}</g>` +
      `</g></g>`
    )
  },
})
