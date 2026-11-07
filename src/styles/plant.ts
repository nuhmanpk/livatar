import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['cactus', 'succulent', 'monstera', 'sprout', 'sunflower', 'tulip', 'bonsai', 'mushroom'] as const
const POTS = ['terracotta', 'round', 'square', 'hanging'] as const
type Kind = (typeof KINDS)[number]
type Pot = (typeof POTS)[number]

export interface PlantOptions {
  kind?: Kind | 'random'
  pot?: Pot | 'random'
  /** A tiny bloom (cactus, succulent, sprout). */
  flower?: boolean | 'random'
}

const INK = '#2a1f2d'
const OL = '#1f2a44'
const TERRA = ['#e07a4f', '#d86c45', '#e98b5d']
const GLAZE = ['#f4efe6', '#9cc9e8', '#f6a8c0', '#ffd27a', '#b9a6e8', '#8fd3b6', '#ffb38a']
const GREEN = ['#5cb85c', '#4fb37f', '#6cc56b', '#45a876']
const BLOOM = ['#ff5d8f', '#ffb03b', '#ff8fc8', '#b48cff', '#ff6b6b']

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
const shade = (c: string, k: number) => {
  const m = /^#([\da-f]{6})$/i.exec(c)
  if (!m) return c
  const v = parseInt(m[1], 16)
  const f = (x: number) => Math.max(0, Math.min(255, Math.round(x * k))).toString(16).padStart(2, '0')
  return `#${f(v >> 16)}${f((v >> 8) & 255)}${f(v & 255)}`
}

/** Potted plants with tiny faces — cacti, monsteras, sunflowers… */
export const plant = defineStyle<PlantOptions>({
  name: 'plant',
  colors: ['#d8f3dc', '#fff1c1', '#ffd6e0', '#cfe8ff', '#e7dcff', '#ffe5cc', '#c9f2e7', '#f1f7b5'],
  defaults: { kind: 'random', pot: 'random', flower: 'random' },
  variants: { kind: KINDS, pot: POTS, flower: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const pot = pick('pot', POTS)
    const flower = pick('flower', [true, false])
    const green = rand.pick(GREEN)
    const potC = pot === 'terracotta' ? rand.pick(TERRA) : rand.pick(GLAZE)
    const bloom = rand.pick(BLOOM)
    
    let out = ''
    const L = (svg: string) => (out += `<g stroke="${OL}" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round">${svg}</g>` + svg)
    const D = (svg: string) => (out += svg)
    const thin = ` stroke="${OL}" stroke-width="2.2"`
    const gloss = (x: number, y: number, rx: number, ry: number, rot: number) => E(x, y, rx, ry, '#fff', rot, ' opacity=".5"')
    const stem = (d: string, c = green, w = 3) =>
      `<path d="${d}" stroke="${OL}" stroke-width="${n(w + 5)}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${c}" stroke-width="${n(w)}" fill="none" stroke-linecap="round"/>`
    const blossom = (x: number, y: number, r: number) => {
      let p = ''
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2
        p += C(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, r * 0.75, bloom)
      }
      return `<g stroke="${OL}" stroke-width="4.4">${p}</g>` + p + C(x, y, r * 0.55, '#ffd23f')
    }

    // pot geometry: body path, rim, face spot
    const potBody =
      pot === 'terracotta'
        ? 'M28 64H72L67.5 92Q67 95 63.5 95H36.5Q33 95 32.5 92Z'
        : pot === 'square'
          ? 'M26 60H74V90Q74 95 69 95H31Q26 95 26 90Z'
          : 'M23 60H77C78 80 67 95 50 95C33 95 22 80 23 60Z'
    const rim =
      pot === 'terracotta'
        ? `<rect x="23" y="55" width="54" height="11" rx="3" fill="${potC}"/>`
        : pot === 'square'
          ? `<rect x="23" y="55" width="54" height="7" rx="2.5" fill="${potC}"/>`
          : `<rect x="20" y="55" width="60" height="7" rx="3.5" fill="${potC}"/>`

    // plant drawing
    let faceOnPot = true
    let [ey, gap, my, s] = [77, 9.5, 83, 0.8]
    const plantSvg = (): void => {
      switch (kind) {
        case 'cactus': {
          faceOnPot = false
          ;[ey, gap, my, s] = [35, 7.5, 41.5, 0.78]
          const body =
            P('M34 64V32C34 20 41 14 50 14C59 14 66 20 66 32V64Z', green) +
            P('M36 50H28C24 50 21 47 21 43V33C21 28 29 28 29 33V42H36Z', green) +
            P('M64 44H71V28C71 23 79 23 79 28V39C79 44 76 48 72 48H64Z', green)
          L(body)
          D(S('M42 22V60M58 22V60M25 34V44M75 30V40', shade(green, 0.82), 1.6, ' opacity=".8"'))
          let spines = ''
          for (const [x, y] of [[38, 26], [62, 26], [38, 52], [62, 52], [46, 56], [54, 56], [25, 40], [75, 35], [43, 18], [57, 18]])
            spines += S(`M${x - 1.2} ${y - 1.2}l2.4 2.4M${x + 1.2} ${y - 1.2}l-2.4 2.4`, '#fff', 0.9, ' opacity=".9"')
          D(spines)
          if (flower) D(blossom(50, 14, 4))
          D(gloss(40, 22, 3, 1.6, -60))
          break
        }
        case 'succulent': {
          const leaf = (a: number, len: number, w: number, c: string, tip: string) =>
            `<g transform="translate(50 62) rotate(${a})">` +
            `<path d="M0 0Q${w} ${n(-len * 0.55)} 0 ${-len}Q${-w} ${n(-len * 0.55)} 0 0Z" fill="${c}"/>` +
            `<path d="M${n(-w * 0.32)} ${n(-len * 0.8)}Q0 ${n(-len * 0.86)} ${n(w * 0.32)} ${n(-len * 0.8)}L0 ${-len}Z" fill="${tip}"/>` +
            `</g>`
          const outer = [-70, -47, -24, 0, 24, 47, 70].map((a) => leaf(a, 35, 11, green === '#5cb85c' ? '#86c6a6' : '#8cc7b0', '#f28fa8')).join('')
          const inner = [-48, -16, 16, 48].map((a) => leaf(a, 25, 9.5, '#a8dcc0', '#f6a5b8')).join('')
          L(outer)
          L(inner + leaf(0, 16, 7.5, '#c4ecd4', '#f6a5b8'))
          if (flower) D(stem('M50 50Q49 34 53 24', '#7cbf86', 2) + blossom(53, 22, 3.4))
          break
        }
        case 'monstera': {
          const LEAF = 'M0 -1C-7 3-21 0-22-15C-23-29-11-39 0-41C11-39 23-29 22-15C21 0 7 3 0-1Z'
          D(
            `<defs><mask id="${id}-s" maskUnits="userSpaceOnUse" x="-40" y="-60" width="80" height="80"><rect x="-40" y="-60" width="80" height="80" fill="#fff"/>` +
              S('M-5 -9L-27 -5M-5 -20L-27 -22M-4 -30L-18 -42M5 -9L27 -5M5 -20L27 -22M4 -30L18 -42', '#000', 2.8) +
              E(-9, -14, 1.6, 2.6, '#000', -20) + E(9, -14, 1.6, 2.6, '#000', 20) +
              `</mask></defs>`,
          )
          const leaf = (x: number, y: number, r: number, k: number) =>
            `<g transform="translate(${x} ${y}) rotate(${r}) scale(${k})"><g mask="url(#${id}-s)">` +
            `<g stroke="${OL}" stroke-width="${n(5.5 / k)}" stroke-linejoin="round">${P(LEAF, green)}</g>` +
            P(LEAF, green) +
            S('M0 -2V-38', shade(green, 0.8), 1.4 / k) +
            `</g></g>`
          D(stem('M48 64Q44 58 37 56', green, 2.5) + stem('M52 64Q56 58 63 56', green, 2.5) + stem('M50 64V46', green, 2.5))
          D(leaf(36, 57, -50, 0.8) + leaf(64, 57, 50, 0.8) + leaf(50, 48, 0, 0.9))
          D(gloss(42, 20, 3.4, 1.6, -50))
          break
        }
        case 'sprout': {
          D(stem('M50 64C50 52 49 44 50 36', green, 3.2))
          L(E(36, 32, 14, 8, green, -22) + E(64, 28, 14, 8, green, 22))
          D(S('M27 36Q37 31 48 33M73 32Q63 27 52 30', shade(green, 0.78), 1.4))
          D(gloss(31, 28, 3.4, 1.4, -22) + gloss(60, 24, 3.4, 1.4, 22))
          if (flower) D(blossom(50, 24, 4.2))
          break
        }
        case 'sunflower': {
          faceOnPot = false
          ;[ey, gap, my, s] = [33, 6.8, 38.5, 0.72]
          D(stem('M50 64V44', green, 3.4))
          L(P('M50 58Q38 46 30 52Q38 60 50 58Z', green) + P('M50 52Q62 40 71 46Q63 55 50 52Z', green))
          let petals = ''
          for (let i = 0; i < 13; i++) {
            const a = (i / 13) * 360
            petals += E(50, 34 - 19, 5.6, 9.5, '#ffcf33', 0, ` transform="rotate(${n(a)} 50 34)"`)
          }
          L(petals)
          D(petals.replace(/#ffcf33/g, '#ffe066').replace(/rx="5.6" ry="9.5"/g, 'rx="2.6" ry="6.5"'))
          L(C(50, 34, 14, '#b9824f'))
          D(`<g opacity=".35">${[[-8, -6], [8, -6], [-10, 3], [10, 3], [0, 10], [-5, 10], [5, 10], [0, -10]].map(([x, y]) => C(50 + x, 34 + y, 0.9, '#5a3a20')).join('')}</g>`)
          D(gloss(43, 26, 3, 1.5, -40))
          break
        }
        case 'tulip': {
          const cup = (x: number, y: number, r: number, k: number) =>
            `<g transform="translate(${x} ${y}) rotate(${r}) scale(${k})">` +
            `<g stroke="${OL}" stroke-width="${n(5.5 / k)}" stroke-linejoin="round">${P('M-9-7C-10 6-5 10 0 10C5 10 10 6 9-7L4.5-2L0-10L-4.5-2Z', bloom)}</g>` +
            P('M-9-7C-10 6-5 10 0 10C5 10 10 6 9-7L4.5-2L0-10L-4.5-2Z', bloom) +
            P('M0-10L-4.5-2L0 10L4.5-2Z', shade(bloom, 0.85)) +
            E(-5, 1, 1.6, 3.4, '#fff', 10, ' opacity=".5"') +
            `</g>`
          D(stem('M47 64Q44 46 34 36', green, 2.4) + stem('M53 64Q56 46 66 36', green, 2.4) + stem('M50 64V28', green, 2.4))
          L(P('M42 63Q26 52 26 34Q36 46 47 58Z', green) + P('M58 63Q74 52 74 34Q64 46 53 58Z', green))
          D(cup(33, 32, -18, 0.9) + cup(67, 32, 18, 0.9) + cup(50, 22, 0, 1.05))
          break
        }
        case 'bonsai': {
          D(stem('M50 64C50 54 40 52 42 44C44 36 56 38 56 28', '#8a5a3c', 6))
          D(stem('M44 46Q36 44 32 40', '#8a5a3c', 3.6) + stem('M54 34Q62 32 66 28', '#8a5a3c', 3.4))
          const pad = (x: number, y: number, k: number) =>
            C(x - 8 * k, y + 1 * k, 6 * k, green) + C(x, y - 3 * k, 8 * k, green) + C(x + 8 * k, y + 1 * k, 6 * k, green) + E(x, y + 3 * k, 13 * k, 5 * k, green)
          L(pad(30, 38, 0.95) + pad(68, 26, 0.95) + pad(50, 18, 0.9))
          D(gloss(25, 33, 3.4, 1.5, -25) + gloss(46, 12, 3.4, 1.5, -25) + gloss(64, 20, 3.4, 1.5, -25))
          break
        }
        case 'mushroom': {
          faceOnPot = false
          ;[ey, gap, my, s] = [27, 9, 33.5, 0.82]
          const cap = rand.pick(['#ff5a5f', '#ff5a5f', '#c98552', '#a77bf0', '#ff8fb8'])
          L(`<rect x="37" y="30" width="26" height="36" rx="10" fill="#fff4e0"/>`)
          D(`<rect x="37" y="38" width="26" height="6" fill="rgba(0,0,0,.1)"/>`)
          L(P('M16 39C15 18 31 6 50 6C69 6 85 18 84 39C84 43 80 44 76 43C62 40 38 40 24 43C20 44 16 43 16 39Z', cap))
          D(C(24, 30, 3.4, '#fff') + C(76, 30, 3.4, '#fff') + C(33, 15, 3, '#fff') + C(67, 15, 3, '#fff') + E(50, 10.5, 4.2, 2.2, '#fff') + C(20, 38, 1.6, '#fff') + C(80, 38, 1.6, '#fff'))
          D(gloss(41, 13, 3.6, 1.6, -20))
          break
        }
      }
    }

    if (pot === 'hanging') D(S('M23 59L50 -4L77 59M50 -4V20', '#b88b5c', 1.6))
    plantSvg()
    // pot
    L(P(potBody, potC) + rim)
    D(`<defs><clipPath id="${id}-p"><path d="${potBody}"/></clipPath></defs>`)
    D(`<g clip-path="url(#${id}-p)"><path d="M62 55H90V100H58Z" fill="rgba(0,0,0,.08)"/>${!faceOnPot ? `<rect x="10" y="75" width="80" height="5" fill="rgba(255,255,255,.4)"/>` : ''}</g>`)
    if (pot === 'terracotta') D(`<rect x="23" y="63.5" width="54" height="2.5" fill="rgba(0,0,0,.12)"/>`)
    if (pot === 'hanging') D(C(50, 58.5, 1.8, '#b88b5c') + C(27, 58.5, 1.4, '#b88b5c') + C(73, 58.5, 1.4, '#b88b5c'))
    D(gloss(pot === 'square' ? 31 : 32, 70, 1.8, 4.5, pot === 'terracotta' ? 10 : pot === 'square' ? 0 : 18))

    const ink = INK
    const eyeK = rand.pick(['dot', 'sparkle', 'oval'] as const)
    const mouthK = rand.pick(['w', 'smile', 'open', 'tiny'] as const)
    const eye = (x: number, y: number) => `<g data-lv-depth=".45">${E(x, y, 2.9 * s, 3.5 * s, ink)}${C(x - 1 * s, y - 1.3 * s, 1.15 * s, '#fff')}</g>`
    const neutralEye = (x: number, y: number) =>
      eyeK === 'dot'
        ? `<g data-lv-depth=".45">${C(x, y, 3 * s, ink)}${C(x - 1 * s, y - 1.1 * s, 1 * s, '#fff')}</g>`
        : eyeK === 'sparkle'
          ? `<g data-lv-depth=".45">${E(x, y, 3.8 * s, 4.4 * s, ink)}${C(x - 1.3 * s, y - 1.6 * s, 1.5 * s, '#fff')}${C(x + 1.4 * s, y + 1.6 * s, 0.7 * s, '#fff')}</g>`
          : eye(x, y)
    const F: FaceSpec = { x: 50, ey, gap, my, ink, s, eye }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${neutralEye(50 - gap, ey)}</g><g data-lv-eye="">${neutralEye(50 + gap, ey)}</g>` : faceEyes(F, mood)
    const neutralMouth =
      mouthK === 'w'
        ? S(`M${n(50 - 5 * s)} ${n(my)}q${n(2.5 * s)} ${n(3 * s)} ${n(5 * s)} 0q${n(2.5 * s)} ${n(3 * s)} ${n(5 * s)} 0`, ink, 1.9 * s)
        : mouthK === 'smile'
          ? S(`M${n(50 - 4.5 * s)} ${n(my)}Q50 ${n(my + 4.5 * s)} ${n(50 + 4.5 * s)} ${n(my)}`, ink, 2.1 * s)
          : mouthK === 'open'
            ? P(`M${n(50 - 5 * s)} ${n(my)}Q50 ${n(my + 9 * s)} ${n(50 + 5 * s)} ${n(my)}Z`, ink, ` stroke="${ink}" stroke-width="${n(1.2 * s)}" stroke-linejoin="round"`) +
              E(50, my + 4 * s, 2.6 * s, 1.5 * s, '#ff7a93')
            : E(50, my + 1.5 * s, 1.8 * s, 1.4 * s, ink)
    const mouth = mood === 'neutral' ? neutralMouth : faceMouth(F, mood)
    const blush =
      mood === 'happy' ? '' : E(50 - gap - 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ' opacity=".4"') + E(50 + gap + 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ' opacity=".4"')

    // shy: two leaves fold over the eyes
    const leafHand = (x: number, side: 1 | -1) =>
      `<g transform="translate(${n(x)} ${n(ey)}) rotate(${side * 28})">` +
      `<path d="M${side * 4} 9Q${side * 10} 16 ${side * 18} 18" stroke="${OL}" stroke-width="6.5" fill="none" stroke-linecap="round"/>` +
      `<path d="M${side * 4} 9Q${side * 10} 16 ${side * 18} 18" stroke="${green}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
      `<path d="M0 11C-9 5-9-6 0-12C9-6 9 5 0 11Z" fill="${green}" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/>` +
      S('M0 9V-9', shade(green, 0.78), 1.2) +
      `</g>`

    const faceDepth = faceOnPot ? '.55' : '.7'
    return (
      `<ellipse cx="50" cy="96" rx="24" ry="3.2" fill="rgba(0,0,0,.12)"/>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".25" data-lv-tilt="3">` +
      out +
      `<g data-lv-depth="${faceDepth}">` +
      eyes +
      faceBrows(F, mood) +
      blush +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g>` +
      `<g data-lv-shy="" opacity="0">${leafHand(50 - gap, -1)}${leafHand(50 + gap, 1)}</g>` +
      `</g></g>`
    )
  },
})
