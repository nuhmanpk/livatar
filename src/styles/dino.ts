import { defineStyle, n } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['trex', 'triceratops', 'stego', 'bronto', 'ptero', 'dragon'] as const
const HATS = ['none', 'party', 'crown', 'cap'] as const
type Kind = (typeof KINDS)[number]
type Hat = (typeof HATS)[number]

export interface DinoOptions {
  kind?: Kind | 'random'
  spots?: boolean | 'random'
  hat?: Hat | 'random'
}

const INK = '#2a1f2d'
const OL = '#1f2a44'
const BELLY = '#fff1cf'
const HORN = '#fff4dc'
const SKIN = ['#7bd389', '#5cc9a7', '#9b8cf2', '#f6a55c', '#6cc3f0', '#f48fb1', '#a8d65a', '#4fb3a5']
const ACCENT = ['#ffd23f', '#ff8c61', '#ff6f91', '#7f5af0', '#2ec4b6', '#ffb703']

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
/** Draw the left half and its mirror image. */
const M = (svg: string) => svg + `<g transform="matrix(-1 0 0 1 100 0)">${svg}</g>`

/** Cute dinosaurs and dragons — t-rex, triceratops, stegosaurus… */
export const dino = defineStyle<DinoOptions>({
  name: 'dino',
  colors: ['#fff1b8', '#d8f5c4', '#cde7ff', '#ffd6e0', '#e4d7ff', '#ffe0c2', '#c9f2e7', '#f6f6f6'],
  defaults: { kind: 'random', spots: 'random', hat: 'random' },
  variants: { kind: KINDS, spots: [true, false], hat: HATS },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const spots = pick('spots', [true, false])
    const hat = pick('hat', ['none', 'none', 'none', 'party', 'crown', 'cap'])
    const skin = rand.pick(SKIN)
    const accent = rand.pick(ACCENT)

    let out = ''
    const L = (svg: string) => (out += `<g stroke="${OL}" stroke-width="5.5" stroke-linejoin="round">${svg}</g>` + svg)
    const D = (svg: string) => (out += svg)
    const thin = ` stroke="${OL}" stroke-width="2.2"`

    // head: centre, radii; face
    let [hx, hy, rx, ry] = [50, 50, 28, 26]
    let [ey, gap, my, s] = [47, 11, 62, 1]
    let head = ''
    let snout = true
    let nostrils = true
    let teeth = false
    let beak = false
    let arms = ''
    let chest = 'M15 108C15 86 31 77 50 77C69 77 85 86 85 108Z'

    switch (kind) {
      case 'trex':
        head = P('M50 21C67 21 77 31 78 45C80 60 75 75 50 77C25 75 20 60 22 45C23 31 33 21 50 21Z', skin)
        ;[ry] = [28]
        teeth = true
        arms = M(`<path d="M37 85Q31 86 30 91Q32 94 35 91" stroke="${OL}" stroke-width="7.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M37 85Q31 86 30 91Q32 94 35 91" stroke="${skin}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`)
        break
      case 'triceratops': {
        const pts: [number, number][] = []
        for (let i = 0; i < 22; i++) {
          const a = (i / 22) * Math.PI * 2
          const r = i % 2 ? 40 : 35.5
          pts.push([50 + Math.cos(a) * r, 44 + Math.sin(a) * r * 0.92])
        }
        let d = ''
        pts.forEach(([x, y], i) => (d += `${i ? 'L' : 'M'}${n(x)} ${n(y)}`))
        L(P(d + 'Z', accent))
        D(E(50, 44, 29, 26.5, 'rgba(255,255,255,.3)'))
        D([-62, -38, -14, 14, 38, 62].map((a) => C(50 + Math.sin((a * Math.PI) / 180) * 33, 44 - Math.cos((a * Math.PI) / 180) * 30, 2, 'rgba(255,255,255,.7)')).join(''))
        ;[hy, ry] = [53, 25]
        ;[ey, my] = [51, 66]
        nostrils = false
        break
      }
      case 'stego': {
        let plates = ''
        const angs = [-75, -45, -15, 15, 45, 75]
        angs.forEach((a, i) => {
          const r = (a * Math.PI) / 180
          const x = 50 + Math.sin(r) * 27
          const y = 50 - Math.cos(r) * 25
          const k = i === 2 || i === 3 ? 1.15 : 1
          plates += `<path d="M-7 4L-6.5-6L0-15L6.5-6L7 4Z" fill="${i % 2 ? accent : '#ff8c61'}" transform="translate(${n(x)} ${n(y)}) rotate(${a}) scale(${k})"/>`
        })
        L(plates.replace(/#ff8c61/g, accent === '#ff8c61' ? '#ffd23f' : '#ff8c61'))
        break
      }
      case 'bronto':
        ;[hx, hy, rx, ry] = [50, 35, 23, 19]
        ;[ey, gap, my, s] = [34, 9.5, 44, 0.9]
        chest = 'M8 112C8 92 28 86 38 86L39 48H61L62 86C72 86 92 92 92 112Z'
        nostrils = false
        break
      case 'ptero':
        L(P('M44 26L60 1Q64 0 62 5L57 27Z', accent))
        L(M('<path d="M32 84Q20 70 3 66Q8 78 6 92Q12 88 18 92Q20 98 30 98Z" fill="' + skin + '"/>'))
        D(M(S('M27 85Q15 76 6 72M25 90Q16 86 10 88', 'rgba(0,0,0,.15)', 1.2)))
        ;[ey, my] = [46, 60]
        snout = false
        nostrils = false
        beak = true
        break
      case 'dragon':
        L(M(P('M30 86Q16 70 4 66Q12 74 10 84Q16 80 20 88Q24 84 32 94Z', accent)))
        L(M(P('M33 32Q25 20 30 8Q33 20 42 27Z', HORN)))
        L(P('M44 25L47 16L50 22L53 16L56 25Z', accent))
        break
    }

    const headEl = head || E(hx, hy, rx, ry, skin)
    L(P(chest, skin))
    D(E(50, kind === 'bronto' ? 100 : 98, 13, 15, BELLY) + S(`M40 ${kind === 'bronto' ? 92 : 90}h20M38 ${kind === 'bronto' ? 98 : 96}h24`, 'rgba(0,0,0,.08)', 1.6))
    if (kind === 'bronto' && spots) D(C(45, 60, 2.6, 'rgba(0,0,0,.12)') + C(55, 70, 2.2, 'rgba(0,0,0,.12)'))
    if (arms) D(arms)
    L(headEl)
    if (kind === 'triceratops') L(M(P('M37 33Q30 20 31 9Q36 20 43 30Z', HORN)) + P('M46 58Q50 49 54 58Z', HORN))

    // face markings clipped to the head
    let marks = ''
    if (snout && !beak) marks += E(hx, my + 1, kind === 'bronto' ? 14 : 17, kind === 'bronto' ? 8 : 10.5, 'rgba(255,255,255,.28)')
    if (spots) {
      const top = hy - ry
      marks += C(hx - rx * 0.62, top + ry * 0.45, 4.2, 'rgba(0,0,0,.12)') + C(hx - rx * 0.4, top + ry * 0.2, 2.6, 'rgba(0,0,0,.12)')
      marks += C(hx + rx * 0.55, top + ry * 0.3, 3.4, 'rgba(0,0,0,.12)') + C(hx + rx * 0.8, top + ry * 0.75, 2.4, 'rgba(0,0,0,.12)')
    }
    D(`<defs><clipPath id="${id}-h">${headEl}</clipPath></defs><g clip-path="url(#${id}-h)">${marks}</g>`)
    if (nostrils) D(E(hx - 4, my - 4.5, 1.2, 0.9, 'rgba(0,0,0,.35)') + E(hx + 4, my - 4.5, 1.2, 0.9, 'rgba(0,0,0,.35)'))
    if (kind === 'bronto') D(E(46, 23, 1, 0.8, 'rgba(0,0,0,.3)') + E(54, 23, 1, 0.8, 'rgba(0,0,0,.3)'))
    D(E(hx - rx * 0.5, hy - ry * 0.62, rx * 0.22, ry * 0.11, '#fff', -30, ' opacity=".5"'))

    // hat
    const top = kind === 'trex' ? 21 : hy - ry
    const hw = kind === 'bronto' ? 0.8 : 1
    const hatSvg = (() => {
      const k = hw
      const t = (x: number, y: number) => `${n(hx + x * k)} ${n(top + y * k)}`
      switch (hat) {
        case 'party':
          return (
            `<g transform="rotate(12 ${hx} ${top})">` +
            `<path d="M${t(-10, 3)}L${t(0, -22)}L${t(10, 3)}Z" fill="${accent}"${thin} stroke-linejoin="round"/>` +
            S(`M${t(-6.5, -6)}L${t(5, -1)}M${t(-3, -14)}L${t(3.5, -11)}`, '#fff', 2.2, ' opacity=".8"') +
            C(hx, top - 23 * k, 3.4 * k, '#ff6f91', thin) +
            `</g>`
          )
        case 'crown':
          return (
            `<path d="M${t(-11, 4)}L${t(-13, -10)}L${t(-5.5, -4)}L${t(0, -13)}L${t(5.5, -4)}L${t(13, -10)}L${t(11, 4)}Z" fill="#ffd23f"${thin} stroke-linejoin="round"/>` +
            C(hx, top - 3 * k, 1.8 * k, '#ff4d6d') + C(hx - 7 * k, top, 1.3 * k, '#3ec1d3') + C(hx + 7 * k, top, 1.3 * k, '#3ec1d3')
          )
        case 'cap':
          return (
            `<path d="M${t(-17, 6)}C${t(-17, -10)} ${t(17, -10)} ${t(17, 6)}Z" fill="${accent}"${thin} stroke-linejoin="round"/>` +
            `<path d="M${t(4, 4)}Q${t(22, 1)} ${t(27, 7)}Q${t(18, 9)} ${t(4, 8)}Z" fill="${accent}"${thin} stroke-linejoin="round"/>` +
            C(hx, top - 6 * k, 1.8 * k, '#fff') +
            S(`M${t(-6, -4)}Q${t(-9, 0)} ${t(-9, 4)}`, 'rgba(255,255,255,.5)', 1.6)
          )
        default:
          return ''
      }
    })()

    // face
    const eyeK = rand.pick(['dot', 'round', 'sparkle'] as const)
    const eye = (x: number, y: number) => `<g data-lv-depth=".45">${E(x, y, 3.1 * s, 3.8 * s, INK)}${C(x - 1 * s, y - 1.4 * s, 1.2 * s, '#fff')}</g>`
    const neutralEye = (x: number, y: number) =>
      eyeK === 'round'
        ? C(x, y, 5 * s, '#fff', thin) + `<g data-lv-depth=".45">${C(x, y + 0.4, 2.8 * s, INK)}${C(x - 0.9 * s, y - 0.8 * s, 0.9 * s, '#fff')}</g>`
        : eyeK === 'sparkle'
          ? `<g data-lv-depth=".45">${E(x, y, 3.9 * s, 4.6 * s, INK)}${C(x - 1.3 * s, y - 1.7 * s, 1.6 * s, '#fff')}${C(x + 1.4 * s, y + 1.7 * s, 0.7 * s, '#fff')}</g>`
          : eye(x, y)
    const F: FaceSpec = { x: hx, ey, gap, my, ink: INK, s, eye }
    const MF: FaceSpec = beak ? { ...F, my: my + 3, s: 0.8 } : F
    const eyes = mood === 'neutral' ? `<g data-lv-eye="">${neutralEye(hx - gap, ey)}</g><g data-lv-eye="">${neutralEye(hx + gap, ey)}</g>` : faceEyes(F, mood)
    const nm = rand.pick(['smile', 'grin', 'open'] as const)
    const toothy = (y: number, w: number) => P(`M${n(hx - w)} ${n(y)}h3l-1.5 3.2zM${n(hx + w - 3)} ${n(y)}h3l-1.5 3.2z`, '#fff')
    let mouth =
      mood !== 'neutral'
        ? faceMouth(MF, mood)
        : nm === 'grin' || teeth
          ? P(`M${n(hx - 9)} ${my}Q${hx} ${my + 11} ${n(hx + 9)} ${my}Z`, INK, ` stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"`) + E(hx, my + 5.4, 4, 2, '#ff7a93')
          : nm === 'open'
            ? P(`M${n(hx - 5)} ${my}Q${hx} ${my + 9} ${n(hx + 5)} ${my}Z`, INK, ` stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"`) + E(hx, my + 4, 2.6, 1.5, '#ff7a93')
            : S(`M${n(hx - 8)} ${my}Q${hx} ${my + 6} ${n(hx + 8)} ${my}`, INK, 2.2)
    if (teeth && (mood === 'neutral' || mood === 'happy')) mouth += toothy(my, mood === 'happy' ? 6 : 8.5)
    if (beak) {
      const b = `M${n(hx - 7)} ${my - 5}Q${hx} ${my - 8} ${n(hx + 7)} ${my - 5}L${hx} ${my + 14}Z`
      mouth = `<path d="${b}" fill="${OL}" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/><path d="${b}" fill="#ffc95c"/>` + S(`M${hx} ${my - 4}V${my + 8}`, 'rgba(0,0,0,.15)', 1) + mouth
    }
    const blush = mood === 'happy' ? '' : E(hx - gap - 4 * s, ey + 7 * s, 3.8 * s, 2.1 * s, '#ff5c8a', 0, ' opacity=".4"') + E(hx + gap + 4 * s, ey + 7 * s, 3.8 * s, 2.1 * s, '#ff5c8a', 0, ' opacity=".4"')

    const claw = (x: number, side: 1 | -1) =>
      `<g transform="rotate(${side * 12} ${n(x)} ${n(ey + 2)})">` +
      `<rect x="${n(x - 6)}" y="${n(ey + 6)}" width="12" height="50" rx="6" fill="${skin}" stroke="${OL}" stroke-width="2.4"/>` +
      `<rect x="${n(x - 9)}" y="${n(ey - 9)}" width="18" height="20" rx="8.5" fill="${skin}" stroke="${OL}" stroke-width="2.4"/>` +
      P(`M${n(x - 6.5)} ${n(ey - 8)}l1.6-4.2 1.6 4.2zM${n(x - 1.6)} ${n(ey - 9)}l1.6-4.4 1.6 4.4zM${n(x + 3.4)} ${n(ey - 8)}l1.6-4.2 1.6 4.2z`, HORN, ` stroke="${OL}" stroke-width="1.2" stroke-linejoin="round"`) +
      `</g>`

    return (
      `<g data-lv-body="">` +
      `<g data-lv-depth=".4" data-lv-tilt="5">` +
      out +
      hatSvg +
      `<g data-lv-depth=".6">` +
      eyes +
      faceBrows(F, mood) +
      blush +
      `<g data-lv-mouth="1">${mouth}</g>` +
      faceExtras(F, mood) +
      `</g>` +
      `<g data-lv-shy="" opacity="0">${claw(hx - gap + 1, -1)}${claw(hx + gap - 1, 1)}</g>` +
      `</g></g>`
    )
  },
})
