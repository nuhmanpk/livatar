import { defineStyle, n, smoothPath } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['avocado', 'toast', 'donut', 'sushi', 'onigiri', 'cupcake', 'strawberry', 'watermelon', 'icecream', 'boba', 'taco', 'egg'] as const
type Kind = (typeof KINDS)[number]

export interface FoodOptions {
  kind?: Kind | 'random'
  /**
   * The little extra on top where it fits: sprinkles (donut), cherry and
   * sprinkles (cupcake, ice cream), butter (toast), roe (sushi), sesame
   * (onigiri), whipped cream (boba), cheese (taco), pepper (egg).
   */
  topping?: boolean | 'random'
  /** Sticker look: thick dark outline. */
  outline?: boolean | 'random'
}

const INK = '#2a1f2d'
const OL = '#1f2a44'
const SPRINKLES = ['#ff5d8f', '#ffd23f', '#3ec1d3', '#7bd389', '#a78bfa', '#ffffff', '#ff8c42']

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`

/** Kawaii food — avocados, donuts, sushi, boba… with a sticker outline. */
export const food = defineStyle<FoodOptions>({
  name: 'food',
  colors: ['#ffd6e0', '#c9f2e0', '#fff1b8', '#cde7ff', '#e4d7ff', '#ffe0c2', '#d8f5c4', '#ffc8c8'],
  defaults: { kind: 'random', topping: 'random', outline: true },
  variants: { kind: KINDS, topping: [true, false], outline: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const topping = pick('topping', [true, true, false])
    const outline = pick('outline', [true, false])

    // layers are painted in order; each outlined layer gets a union outline
    let out = ''
    const L = (svg: string) => (out += (outline ? `<g stroke="${OL}" stroke-width="5.5" stroke-linejoin="round">${svg}</g>` : '') + svg)
    const D = (svg: string) => (out += svg)
    const thin = outline ? ` stroke="${OL}" stroke-width="2"` : ''
    const gloss = (x: number, y: number, rx: number, ry: number, rot: number) => D(E(x, y, rx, ry, '#fff', rot, ' opacity=".55"'))

    // face placement
    let [ey, gap, my, s] = [52, 10, 59, 0.9]
    let hand = '#fff'
    let floor = 95
    let defs = ''
    const avoid = (x: number, y: number) => Math.abs(x - 50) < gap + 7 * s + 2 && y > ey - 9 && y < my + 10
    const sprinkle = (x: number, y: number) => {
      const a = rand.float(0, Math.PI)
      const dx = Math.cos(a) * 1.8
      const dy = Math.sin(a) * 1.8
      return S(`M${n(x - dx)} ${n(y - dy)}L${n(x + dx)} ${n(y + dy)}`, rand.pick(SPRINKLES), 1.9)
    }
    const scatter = (count: number, x0: number, x1: number, y0: number, y1: number, inside: (x: number, y: number) => boolean, draw: (x: number, y: number) => string) => {
      let svg = ''
      for (let i = 0, tries = 0; i < count && tries < 200; tries++) {
        const x = rand.float(x0, x1)
        const y = rand.float(y0, y1)
        if (!inside(x, y) || avoid(x, y)) continue
        svg += draw(x, y)
        i++
      }
      return svg
    }
    const cherry = (x: number, y: number) =>
      S(`M${x} ${y - 4}Q${x + 1} ${y - 10} ${x + 6} ${y - 12}`, '#5b3a29', 1.8) +
      C(x, y, 5.6, '#ff3b5c', outline ? ` stroke="${OL}" stroke-width="2.4"` : '') +
      E(x - 1.8, y - 2, 1.6, 1, '#fff', -35, ' opacity=".8"')

    switch (kind) {
      case 'avocado': {
        const skin = rand.pick(['#4f8a3a', '#5a9a3f', '#41803a'])
        const AV = 'M50 14C63 14 67 28 71 40C77 56 80 73 72 84C66 91 58 92 50 92C42 92 34 91 28 84C20 73 23 56 29 40C33 28 37 14 50 14Z'
        L(P(AV, skin))
        D(P(AV, '#d3ea8f', ' transform="translate(50 60) scale(.86) translate(-50 -60)"'))
        D(E(50, 62, 18, 22, '#eef8c4', 0, ' opacity=".7"'))
        D(C(50, 73, 11, '#9a5b34', thin) + E(46.5, 69, 3.4, 2.2, '#fff', -35, ' opacity=".45"'))
        gloss(41, 34, 3.4, 1.8, -60)
        ;[ey, gap, my, s] = [46, 8.5, 52, 0.82]
        hand = skin
        break
      }
      case 'toast': {
        const crust = rand.pick(['#c98a4b', '#b8763d', '#d39a5a'])
        L(P('M26 86V48C15 46 13 24 31 21H69C87 24 85 46 74 48V86Q74 91 69 91H31Q26 91 26 86Z', crust))
        D(P('M31 84V45C22 43 21 28 33 26.5H67C79 28 78 43 69 45V84Q69 86 67 86H33Q31 86 31 84Z', '#f8dda8'))
        ;[ey, gap, my, s] = [56, 10, 63, 0.95]
        D(scatter(7, 33, 67, 30, 82, () => true, (x, y) => E(x, y, 1.1, 0.7, '#e2b878', rand.float(-40, 40))))
        if (topping)
          D(
            `<g transform="rotate(-12 60 35)"><rect x="53" y="30" width="15" height="10" rx="2.4" fill="#ffe680"${thin}/>` +
              `<rect x="55" y="31.8" width="6" height="2" rx="1" fill="#fff" opacity=".7"/></g>`,
          )
        gloss(29, 29, 3.6, 1.8, -40)
        hand = crust
        break
      }
      case 'donut': {
        const icing = rand.pick(['#ff8fb8', '#b07a55', '#a8e6cf', '#c9a7ff', '#fff3e0', '#8ecdf5'])
        const ring = (cx: number, cy: number, rx: number, ry: number) => `M${n(cx - rx)} ${n(cy)}a${n(rx)} ${n(ry)} 0 1 0 ${n(2 * rx)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-2 * rx)} 0Z`
        L(P(ring(50, 55, 34, 31) + ring(50, 41, 8, 4.6), '#e7ad62', ' fill-rule="evenodd"'))
        const pts: [number, number][] = []
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2
          const drip = Math.sin(a) > 0.2 && i % 2 === 0 ? rand.float(2.5, 5) : rand.float(-0.8, 0.8)
          pts.push([50 + Math.cos(a) * (28 + drip * 0.3), 53 + Math.sin(a) * (24 + drip)])
        }
        L(P(smoothPath(pts) + ring(50, 41, 10.5, 6.5), icing, ' fill-rule="evenodd"'))
        ;[ey, gap, my, s] = [58, 10, 65, 0.9]
        if (topping)
          D(scatter(16, 24, 76, 30, 76, (x, y) => ((x - 50) / 25) ** 2 + ((y - 53) / 21) ** 2 < 1 && ((x - 50) / 13) ** 2 + ((y - 41) / 8.5) ** 2 > 1, sprinkle))
        gloss(31, 42, 4.6, 2.2, -45)
        hand = '#e7ad62'
        break
      }
      case 'sushi': {
        const fish = rand.pick(['salmon', 'salmon', 'tuna', 'shrimp'] as const)
        const [fc, sc] = fish === 'tuna' ? ['#ec5463', '#ff8a96'] : fish === 'shrimp' ? ['#ffc4a1', '#ff6a3d'] : ['#ff8e63', '#ffd3bc']
        L(`<rect x="17" y="50" width="66" height="40" rx="17" fill="#fdfcf7"/>`)
        ;[ey, gap, my, s] = [70, 10, 76, 0.85]
        D(scatter(6, 20, 80, 62, 88, (x, y) => (x > 24 && x < 76) || y < 82, (x, y) => E(x, y, 2, 1.1, '#e9e5d8', rand.float(-50, 50))))
        const FISH = 'M11 54C9 40 28 32 50 33C74 34 93 39 89 54C87 62 72 59 50 60C28 61 12 62 11 54Z'
        L(P(FISH, fc))
        defs += `<clipPath id="${id}-f"><path d="${FISH}"/></clipPath>`
        D(
          `<g clip-path="url(#${id}-f)">` +
            [24, 38, 52, 66, 80].map((x) => S(`M${x - 6} 64Q${x - 2} 46 ${x + 6} 32`, sc, fish === 'shrimp' ? 3.4 : 2.2, ' opacity=".9"')).join('') +
            `</g>`,
        )
        if (topping) D([44, 50, 56].map((x, i) => C(x, i === 1 ? 33 : 35, 3.4, '#ff7b2e', thin) + C(x - 1, (i === 1 ? 33 : 35) - 1.1, 1, '#fff', ' opacity=".85"')).join(''))
        gloss(29, 41, 5, 2, -15)
        hand = '#fdfcf7'
        break
      }
      case 'onigiri': {
        const TRI = 'M50 15C58 15 87 61 87 75C87 88 76 91 50 91C24 91 13 88 13 75C13 61 42 15 50 15Z'
        L(P(TRI, '#fdfdf8'))
        defs += `<clipPath id="${id}-o"><path d="${TRI}"/></clipPath>`
        D(`<g clip-path="url(#${id}-o)"><rect x="34" y="70" width="32" height="30" fill="#25332b"${thin}/>${S('M38 76H62M38 82H62', '#3b4d42', 1)}</g>`)
        ;[ey, gap, my, s] = [53, 9.5, 59, 0.85]
        if (topping) D(scatter(9, 30, 70, 26, 66, (x, y) => Math.abs(x - 50) < (y - 16) * 0.55, (x, y) => E(x, y, 1, 0.55, INK, rand.float(-60, 60))))
        gloss(41, 30, 4, 1.8, -58)
        hand = '#fdfdf8'
        break
      }
      case 'cupcake': {
        const wrap = rand.pick(['#7fc8f8', '#ff8fab', '#b8e986', '#c3a6ff', '#ffc75f'])
        const cream = rand.pick(['#fff1f6', '#ffc4dd', '#c9f2e0', '#fbe7b5', '#d9c2ff'])
        const WRAP = 'M22 56H78L70.5 90Q69.5 94 65.5 94H34.5Q30.5 94 29.5 90Z'
        L(P(WRAP, wrap))
        defs += `<clipPath id="${id}-w"><path d="${WRAP}"/></clipPath>`
        D(`<g clip-path="url(#${id}-w)" opacity=".16">${[-3, -2, -1, 1, 2, 3].map((k) => S(`M${50 + k * 9} 56L${50 + k * 6.6} 94`, '#000', 2)).join('')}</g>`)
        const top = 'M17 57C12 50 17 41 26 42C25 31 36 26 43 30C45 20 57 20 58 30C65 26 76 31 74 42C83 41 88 50 83 57C78 63 22 63 17 57Z'
        L(P(top, cream) + (topping ? '' : P('M42 26Q47 12 55 15Q52 21 58 27Z', cream)))
        D(S('M27 50Q40 56 52 50Q62 46 73 51', 'rgba(0,0,0,.08)', 2))
        ;[ey, gap, my, s] = [72, 9, 78, 0.8]
        if (topping) {
          D(scatter(10, 18, 82, 28, 58, (x, y) => ((x - 50) / 31) ** 2 + ((y - 47) / 14) ** 2 < 1 && y < 58, sprinkle))
          D(cherry(51, 22))
        }
        gloss(33, 38, 4.4, 2, -30)
        hand = wrap
        break
      }
      case 'strawberry': {
        const red = rand.pick(['#ff4d5e', '#f23b55', '#ff5f6b'])
        L(P('M50 92C34 90 15 72 15 51C15 34 30 26 50 29C70 26 85 34 85 51C85 72 66 90 50 92Z', red))
        ;[ey, gap, my, s] = [54, 11, 61, 0.95]
        D(scatter(14, 20, 80, 36, 86, (x, y) => Math.abs(x - 50) < 32 - Math.max(0, y - 66) * 1.1, (x, y) => E(x, y, 0.9, 1.5, '#ffe08a', rand.float(-25, 25))))
        let leaf = ''
        for (let i = 0; i < 5; i++) {
          const a = Math.PI + (i / 4) * Math.PI
          const tx = 50 + Math.cos(a) * 17
          const ty = 31 - Math.sin(a) * 9 + 2
          leaf += `M50 28Q${n(50 + Math.cos(a - 0.35) * 9)} ${n(27 - Math.sin(a - 0.35) * 5)} ${n(tx)} ${n(ty)}Q${n(50 + Math.cos(a + 0.35) * 9)} ${n(29 - Math.sin(a + 0.35) * 5)} 50 28Z`
        }
        L(P(leaf + 'M45 29Q50 22 55 29Q50 33 45 29Z', '#4cb050') + `<path d="M50 27Q50 18 55 14" stroke="#3d8b40" stroke-width="3.2" fill="none" stroke-linecap="round"/>`)
        gloss(29, 44, 4.6, 2.4, -50)
        hand = red
        break
      }
      case 'watermelon': {
        const flesh = rand.bool(0.85) ? '#ff5d73' : '#ffd84d'
        const W = 'M11 32Q50 6 89 32L55.5 87Q50 95 44.5 87Z'
        L(P(W, flesh))
        defs += `<clipPath id="${id}-m"><path d="${W}"/></clipPath>`
        D(`<g clip-path="url(#${id}-m)">` +
          P('M5 28Q50 -2 95 28L95 40Q50 13 5 40Z', '#3fa34d') + P('M5 40Q50 13 95 40L95 44Q50 18 5 44Z', '#e3f6c0') + `</g>`)
        ;[ey, gap, my, s] = [45, 10, 52, 0.9]
        const seed = (x: number, y: number, r: number) => E(x, y, 1.3, 2.2, '#2b2033', r)
        D(seed(42, 66, -20) + seed(58, 66, 20) + seed(50, 76, 0) + seed(26, 42, -35) + seed(74, 42, 35))
        gloss(31, 25, 4.4, 1.6, -28)
        hand = '#3fa34d'
        break
      }
      case 'icecream': {
        const scoop = rand.pick(['#ffb3c7', '#b5ead7', '#fff1c9', '#c7b3ff', '#c49a7e', '#a8dcff'])
        const CONE = 'M28 56L72 56L54 94Q50 100 46 94Z'
        L(P(CONE, '#eab463'))
        defs += `<clipPath id="${id}-k"><path d="${CONE}"/></clipPath>`
        D(`<g clip-path="url(#${id}-k)">${[0, 1, 2, 3, 4].map((k) => S(`M${22 + k * 10} 56L${42 + k * 10} 96M${78 - k * 10} 56L${58 - k * 10} 96`, '#c98a3d', 1.3)).join('')}</g>`)
        L(P('M25 49C23 33 35 20 50 20C65 20 77 33 75 49C77 56 73 61 68 58C66 64 60 63 58 59C55 65 46 65 43 59C40 63 34 63 32 58C27 61 23 55 25 49Z', scoop))
        ;[ey, gap, my, s] = [43, 9.5, 50, 0.85]
        if (topping) {
          D(scatter(9, 27, 73, 24, 56, (x, y) => ((x - 50) / 23) ** 2 + ((y - 44) / 22) ** 2 < 1, sprinkle))
          D(cherry(50, 19))
        }
        gloss(35, 30, 4.6, 2.2, -40)
        hand = '#eab463'
        break
      }
      case 'boba': {
        const tea = rand.pick(['#e2b48a', '#c7a6e6', '#b9dc8c', '#f8b6c6', '#d9b48f'])
        const straw = rand.pick(['#ff6fa3', '#4dc3ff', '#7bd389', '#ffb03b'])
        L(`<rect x="55" y="1" width="8" height="40" rx="2" fill="${straw}" transform="rotate(14 59 30)"/>`)
        const CUP = 'M24 37H76L70 88Q69.5 93 64.5 93H35.5Q30.5 93 30 88Z'
        L(P(CUP, tea))
        defs += `<clipPath id="${id}-b"><path d="${CUP}"/></clipPath>`
        let pearls = ''
        for (let i = 0; i < 7; i++) pearls += C(34 + i * 5.3, i % 2 ? 87.5 : 84, 2.7, '#3b2a2f') + C(33 + i * 5.3, (i % 2 ? 87.5 : 84) - 1, 0.8, '#fff', ' opacity=".5"')
        D(`<g clip-path="url(#${id}-b)">${pearls}${P('M24 37H76V43H24Z', 'rgba(255,255,255,.35)')}</g>`)
        L(
          (topping ? P('M27 34C26 22 36 15 44 18C46 12 56 12 58 18C66 15 75 22 73 34Z', '#fffaf0') : P('M27 34Q27 13 50 13Q73 13 73 34Z', 'rgba(255,255,255,.45)')) +
            `<rect x="21" y="31" width="58" height="7" rx="3.5" fill="#f4f7ff"/>`,
        )
        if (!topping) D(S('M33 29Q34 20 42 17', '#fff', 1.8, ' opacity=".8"'))
        ;[ey, gap, my, s] = [56, 10, 63, 0.9]
        D(`<rect x="31" y="44" width="3.6" height="32" rx="1.8" fill="#fff" opacity=".4"/>`)
        hand = tea
        break
      }
      case 'taco': {
        const pts: [number, number][] = []
        for (let i = 0; i <= 16; i++) {
          const a = Math.PI * (1.05 + (i / 16) * 0.9)
          const r = i % 2 ? 50 : 45.5
          pts.push([50 + Math.cos(a) * r, 77 + Math.sin(a) * r])
        }
        for (let i = 6; i >= 0; i--) {
          const a = Math.PI * (1.05 + (i / 6) * 0.9)
          pts.push([50 + Math.cos(a) * 36, 77 + Math.sin(a) * 36])
        }
        L(P(smoothPath(pts), '#7ed957'))
        let fill = ''
        for (let i = 0; i < 7; i++) {
          const a = Math.PI * (1.12 + (i / 6) * 0.76)
          fill += C(50 + Math.cos(a) * 42.5, 77 + Math.sin(a) * 42.5, 4.6, '#9a5b3c')
        }
        if (topping) {
          fill += [0.25, 0.62].map((t) => C(50 + Math.cos(Math.PI * (1 + t)) * 43.5, 77 + Math.sin(Math.PI * (1 + t)) * 43.5, 4.8, '#ff5a5a', thin)).join('')
          for (let i = 0; i < 6; i++) {
            const a = Math.PI * (1.15 + (i / 5) * 0.7)
            const [x, y] = [50 + Math.cos(a) * 45, 77 + Math.sin(a) * 45]
            fill += `<rect x="${n(x - 0.9)}" y="${n(y - 3.5)}" width="1.8" height="7" rx=".9" fill="#ffd84d" transform="rotate(${n((a * 180) / Math.PI + 90 + rand.float(-30, 30))} ${n(x)} ${n(y)})"/>`
          }
        }
        D(fill)
        L(P('M10 77A40 40 0 0 1 90 77Q90 83 84 83H16Q10 83 10 77Z', '#f7c65a'))
        ;[ey, gap, my, s] = [61, 11, 68, 0.95]
        D(scatter(6, 16, 84, 44, 80, (x, y) => (x - 50) ** 2 + (y - 77) ** 2 < 34 * 34, (x, y) => C(x, y, rand.float(1, 1.8), '#e0a83e')))
        gloss(29, 55, 5, 2.2, -45)
        hand = '#f7c65a'
        floor = 85
        break
      }
      case 'egg': {
        const pts: [number, number][] = []
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * Math.PI * 2 + 0.3
          const r = rand.float(31, 37)
          pts.push([50 + Math.cos(a) * r * 1.05, 54 + Math.sin(a) * r * 0.95])
        }
        L(P(smoothPath(pts), '#fffdf7'))
        L(C(50, 53, 21, '#ffc23d'))
        D(E(56, 60, 13, 10, '#ffa62b', 0, ' opacity=".35"'))
        ;[ey, gap, my, s] = [51, 8, 57, 0.78]
        if (topping) D(scatter(8, 20, 80, 24, 86, (x, y) => (x - 50) ** 2 + (y - 53) ** 2 > 26 * 26 && (x - 50) ** 2 + (y - 54) ** 2 < 29 * 29, (x, y) => C(x, y, 0.8, '#3a3540')))
        gloss(42, 42, 4.4, 2.2, -35)
        hand = '#fffdf7'
        break
      }
    }

    const eyeK = rand.pick(['dot', 'sparkle', 'oval'] as const)
    const mouthK = rand.pick(['w', 'smile', 'open', 'tiny'] as const)
    const eye = (x: number, y: number) =>
      `<g data-lv-depth=".45">${E(x, y, 2.9 * s, 3.5 * s, INK)}${C(x - 1 * s, y - 1.3 * s, 1.15 * s, '#fff')}</g>`
    const neutralEye = (x: number, y: number) =>
      eyeK === 'dot'
        ? `<g data-lv-depth=".45">${C(x, y, 3 * s, INK)}${C(x - 1 * s, y - 1.1 * s, 1 * s, '#fff')}</g>`
        : eyeK === 'sparkle'
          ? `<g data-lv-depth=".45">${E(x, y, 3.8 * s, 4.4 * s, INK)}${C(x - 1.3 * s, y - 1.6 * s, 1.5 * s, '#fff')}${C(x + 1.4 * s, y + 1.6 * s, 0.7 * s, '#fff')}</g>`
          : eye(x, y)
    const F: FaceSpec = { x: 50, ey, gap, my, ink: INK, s, eye }
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${neutralEye(50 - gap, ey)}</g><g data-lv-eye="">${neutralEye(50 + gap, ey)}</g>` : faceEyes(F, mood)
    const neutralMouth =
      mouthK === 'w'
        ? S(`M${n(50 - 5 * s)} ${n(my)}q${n(2.5 * s)} ${n(3 * s)} ${n(5 * s)} 0q${n(2.5 * s)} ${n(3 * s)} ${n(5 * s)} 0`, INK, 1.9 * s)
        : mouthK === 'smile'
          ? S(`M${n(50 - 4.5 * s)} ${n(my)}Q50 ${n(my + 4.5 * s)} ${n(50 + 4.5 * s)} ${n(my)}`, INK, 2.1 * s)
          : mouthK === 'open'
            ? P(`M${n(50 - 5 * s)} ${n(my)}Q50 ${n(my + 9 * s)} ${n(50 + 5 * s)} ${n(my)}Z`, INK, ` stroke="${INK}" stroke-width="${n(1.2 * s)}" stroke-linejoin="round"`) +
              E(50, my + 4 * s, 2.6 * s, 1.5 * s, '#ff7a93')
            : E(50, my + 1.5 * s, 1.8 * s, 1.4 * s, INK)
    const mouth = mood === 'neutral' ? neutralMouth : faceMouth(F, mood)
    const blush = mood === 'happy' ? '' : E(50 - gap - 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ' opacity=".4"') + E(50 + gap + 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ' opacity=".4"')

    const sw = outline ? 2.4 : 1
    const sc = outline ? OL : 'rgba(0,0,0,.2)'
    const mitt = (x: number, side: 1 | -1) =>
      `<g transform="rotate(${side * 12} ${n(x)} ${n(ey + 2)})">` +
      `<rect x="${n(x - 5.5)}" y="${n(ey + 6)}" width="11" height="50" rx="5.5" fill="${hand}" stroke="${sc}" stroke-width="${sw}"/>` +
      `<rect x="${n(x - 8.5)}" y="${n(ey - 8)}" width="17" height="19" rx="8" fill="${hand}" stroke="${sc}" stroke-width="${sw}"/>` +
      S(`M${n(x - 2.5)} ${n(ey - 7)}v4M${n(x + 2.5)} ${n(ey - 7)}v4`, 'rgba(0,0,0,.18)', 1.2) +
      `</g>`

    return (
      (defs ? `<defs>${defs}</defs>` : '') +
      `<ellipse cx="50" cy="${floor}" rx="24" ry="3.4" fill="rgba(0,0,0,.12)"/>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".25" data-lv-tilt="4">` +
      out +
      `<g data-lv-depth=".6">` +
      eyes +
      faceBrows(F, mood) +
      blush +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g>` +
      `<g data-lv-shy="" opacity="0">${mitt(50 - gap + 1, -1)}${mitt(50 + gap - 1, 1)}</g>` +
      `</g></g>`
    )
  },
})
