import { defineStyle, n, type Mood } from '../core'
import { faceBrows, faceEyes, faceExtras, faceMouth, type FaceSpec } from '../face'

const KINDS = ['server', 'database', 'cloud', 'chip', 'terminal', 'plug', 'router', 'drive'] as const
type Kind = (typeof KINDS)[number]

export interface TechOptions {
  kind?: Kind | 'random'
  /** Blinking status lights. */
  leds?: boolean | 'random'
}

const INK = '#1f1a2e'
const OL = '#1f2a44'
const LED = ['#3ddc84', '#ffd23f', '#4fb6ff', '#ff5c8a'] as const

const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${n(rot)} ${n(cx)} ${n(cy)})"` : ''}${extra}/>`
const C = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${extra}/>`
const P = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`
const S = (d: string, ink: string, w: number, extra = '') =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`
/** Rounded-rect path. */
const RR = (x: number, y: number, w: number, h: number, r: number) =>
  `M${n(x + r)} ${n(y)}H${n(x + w - r)}Q${n(x + w)} ${n(y)} ${n(x + w)} ${n(y + r)}V${n(y + h - r)}Q${n(x + w)} ${n(y + h)} ${n(x + w - r)} ${n(y + h)}H${n(x + r)}Q${n(x)} ${n(y + h)} ${n(x)} ${n(y + h - r)}V${n(y + r)}Q${n(x)} ${n(y)} ${n(x + r)} ${n(y)}Z`
/** A chunky outlined shape. */

/** Servers & dev infra — racks, databases, clouds, chips — for status pages and dev tools. */
export const tech = defineStyle<TechOptions>({
  name: 'tech',
  scale: 0.84,
  colors: ['#d6f5ee', '#cfe3ff', '#e5dcff', '#dff3ff', '#ffd9c2', '#fff1c9', '#ffe1f0', '#e8f7d4'],
  defaults: { kind: 'random', leds: true },
  variants: { kind: KINDS, leds: [true, false] },
  render({ rand, pick, id, mood }) {
    const kind = pick('kind', KINDS)
    const leds = pick('leds', [true, false])

    // a blinking light; deterministic timing from rand
    const led = (x: number, y: number, r = 1.8, col?: string) => {
      const c = col ?? LED[rand.int(0, 2)]
      const blink = leds ? `<animate attributeName="opacity" values="1;.25;1" dur="${n(rand.float(0.9, 2.2))}s" begin="${n(rand.float(0, 1.5))}s" repeatCount="indefinite"/>` : ''
      return `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${leds ? c : '#8a8fa8'}" stroke="${OL}" stroke-width="1.2">${blink}</circle>`
    }

    let body = ''
    let back = ''
    let surface = ''
    let front = ''
    let panel = '' // screen / label the face sits on
    let ink = INK
    let [c1, c2] = ['#e3e8f3', '#9aa6bf']
    let [ey, gap, my, s, fx] = [46, 10, 54, 0.95, 50]
    let hl: [number, number] = [32, 24]

    switch (kind) {
      case 'server':
        body = RR(22, 10, 56, 80, 9)
        ;[c1, c2] = ['#dfe6f5', '#8e9bb8']
        panel = RR(28, 16, 44, 32, 6)
        front = [56, 66, 76].map((y) => `<rect x="29" y="${y}" width="42" height="7" rx="3" fill="#5d6886" stroke="${OL}" stroke-width="2"/>` + S(`M33 ${y + 3.5}H50`, '#3a4360', 1.6) + led(60, y + 3.5, 1.6) + led(66, y + 3.5, 1.6)).join('')
        ;[ey, gap, my, s] = [30, 9, 37, 0.85]
        hl = [28, 13]
        break
      case 'database':
        body = 'M18 24A32 11 0 0 1 82 24V76A32 11 0 0 1 18 76Z'
        ;[c1, c2] = ['#b9e6ff', '#3a86ff']
        surface = S('M18 42A32 11 0 0 0 82 42', '#fff', 2.4, ' opacity=".55"') + S('M18 60A32 11 0 0 0 82 60', '#fff', 2.4, ' opacity=".55"')
        front = E(50, 24, 32, 11, '#cdeeff', 0, ` stroke="${OL}" stroke-width="3.5"`) + E(50, 24, 20, 5, '#fff', 0, ' opacity=".5"') + led(74, 52) + led(74, 70)
        ;[ey, gap, my, s] = [50, 10, 58, 0.95]
        hl = [26, 46]
        break
      case 'cloud':
        body = 'M24 76C14 76 8 69 8 61C8 53 14 47 22 47C22 35 31 27 42 27C50 27 57 31 60 38C63 36 66 35 70 35C81 35 89 44 89 54C95 57 96 62 96 65C96 71 91 76 84 76Z'
        ;[c1, c2] = ['#ffffff', '#b7d3f7']
        back = `<g data-lv-float="">${S('M50 22V6M43 13L50 6L57 13', OL, 6.5)}${S('M50 22V6M43 13L50 6L57 13', '#3ddc84', 3)}</g>`
        front = led(82, 66) + led(76, 70)
        ;[fx, ey, gap, my, s] = [52, 55, 10, 63, 0.95]
        hl = [36, 40]
        break
      case 'chip': {
        body = RR(24, 24, 52, 52, 8)
        ;[c1, c2] = ['#6b7896', '#2b3450']
        ink = '#e9fff3'
        let pins = ''
        for (const t of [33, 44, 56, 67]) {
          pins += `<rect x="${t - 2.5}" y="12" width="5" height="14" rx="2"/><rect x="${t - 2.5}" y="74" width="5" height="14" rx="2"/>`
          pins += `<rect x="12" y="${t - 2.5}" width="14" height="5" rx="2"/><rect x="74" y="${t - 2.5}" width="14" height="5" rx="2"/>`
        }
        back = `<g fill="#ffd23f" stroke="${OL}" stroke-width="2.5">${pins}</g>`
        surface = S('M30 70L40 60H48M70 30L62 38H54', '#3ddc84', 1.4, ' opacity=".55"')
        front = C(31, 31, 2, '#9aa6bf') + led(69, 69, 1.8, '#3ddc84')
        ;[ey, gap, my, s] = [47, 9, 55, 0.9]
        hl = [34, 30]
        break
      }
      case 'terminal':
        body = RR(10, 16, 80, 66, 9)
        ;[c1, c2] = ['#e3e8f3', '#a9b4cc']
        panel = RR(16, 28, 68, 48, 5)
        ink = '#7dffb0'
        front = C(18, 22, 2, '#ff5c5c') + C(24, 22, 2, '#ffd23f') + C(30, 22, 2, '#3ddc84') +
          S('M21 34L25 37L21 40', '#7dffb0', 1.6) + `<rect x="27" y="39" width="6" height="1.8" fill="#7dffb0">${leds ? '<animate attributeName="opacity" values="1;1;0;0" dur="1s" repeatCount="indefinite"/>' : ''}</rect>`
        ;[ey, gap, my, s] = [52, 10, 61, 0.9]
        hl = [18, 19]
        break
      case 'plug':
        body = RR(26, 28, 48, 50, 14)
        ;[c1, c2] = ['#fff1a0', '#ffb703']
        back =
          `<rect x="35" y="8" width="8" height="24" rx="3" fill="#d9dde8" stroke="${OL}" stroke-width="3"/><rect x="57" y="8" width="8" height="24" rx="3" fill="#d9dde8" stroke="${OL}" stroke-width="3"/>` +
          S('M50 78Q50 90 64 90Q78 90 82 80', OL, 7) + S('M50 78Q50 90 64 90Q78 90 82 80', '#5d6886', 3.4)
        front = led(66, 70, 1.8, '#3ddc84')
        ;[ey, gap, my, s] = [50, 10, 59, 0.95]
        hl = [34, 34]
        break
      case 'router': {
        body = RR(10, 46, 80, 38, 11)
        ;[c1, c2] = ['#d6c2ff', '#7b5ce0']
        const ant = (x: number, r: number) => `<g transform="rotate(${r} ${x} 50)"><rect x="${x - 3}" y="16" width="6" height="34" rx="3" fill="#3a3f55" stroke="${OL}" stroke-width="2.6"/></g>`
        back = ant(24, -14) + ant(76, 14) + `<g data-lv-float="">${S('M42 22Q50 14 58 22', OL, 4.6)}${S('M36 16Q50 4 64 16', OL, 4.6)}${S('M42 22Q50 14 58 22', '#3ddc84', 2)}${S('M36 16Q50 4 64 16', '#3ddc84', 2)}${C(50, 28, 2.6, '#3ddc84', ` stroke="${OL}" stroke-width="2"`)}</g>`
        front = led(22, 76) + led(29, 76) + led(71, 76) + led(78, 76)
        ;[ey, gap, my, s] = [60, 10, 68, 0.9]
        hl = [22, 52]
        break
      }
      case 'drive':
        body = RR(26, 32, 48, 58, 11)
        ;[c1, c2] = ['#b7f0e4', '#2ec4b6']
        back = `<rect x="35" y="10" width="30" height="26" rx="3" fill="#d9dde8" stroke="${OL}" stroke-width="3.5"/><rect x="40" y="17" width="6" height="5" rx="1" fill="${OL}"/><rect x="54" y="17" width="6" height="5" rx="1" fill="${OL}"/>`
        panel = RR(32, 66, 36, 16, 4)
        front = S('M38 74H48', '#9aa6bf', 2) + led(60, 74, 2)
        ;[ey, gap, my, s] = [49, 9, 57, 0.85]
        hl = [34, 38]
        break
    }

    const screenFill = kind === 'terminal' ? '#1f2a44' : kind === 'drive' ? '#ffffff' : '#25304d'
    if (kind === 'server') ink = '#7dffb0'
    const eye = (x: number, y: number) => `<g data-lv-depth=".45">${E(x, y, 3 * s, 3.6 * s, ink)}${C(x - 1 * s, y - 1.3 * s, 1.15 * s, ink === INK ? '#fff' : '#1f2a44')}</g>`
    const F: FaceSpec = { x: fx, ey, gap, my, ink, s, eye, extra: [fx + gap + 7, ey - 11] }
    const face = buildFace(F, mood as Mood, rand.bool(0.5))
    const hand = (x: number, side: 1 | -1) =>
      `<g transform="rotate(${side * 12} ${n(x)} ${n(ey + 2)})">` +
      `<rect x="${n(x - 5.5)}" y="${n(ey + 6)}" width="11" height="50" rx="5.5" fill="${c2}" stroke="${OL}" stroke-width="2.4"/>` +
      `<rect x="${n(x - 8.5)}" y="${n(ey - 8)}" width="17" height="19" rx="8" fill="${c1}" stroke="${OL}" stroke-width="2.4"/>` +
      `</g>`

    return (
      `<defs><radialGradient id="${id}-g" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>` +
      `<clipPath id="${id}-p"><path d="${body}"/></clipPath></defs>` +
      `<g data-lv-body="">` +
      `<g data-lv-depth=".3" data-lv-tilt="3">` +
      back +
      `<path d="${body}" fill="${OL}" stroke="${OL}" stroke-width="5.5" stroke-linejoin="round"/>` +
      `<path d="${body}" fill="url(#${id}-g)"/>` +
      `<g clip-path="url(#${id}-p)">${surface}${C(76, 84, 40, 'rgba(0,0,0,.08)')}</g>` +
      (panel ? P(panel, screenFill, ` stroke="${OL}" stroke-width="3"`) : '') +
      E(hl[0], hl[1], 5, 2.4, '#fff', -30, ' opacity=".6"') +
      front +
      `<g data-lv-depth=".6">${face}</g>` +
      `<g data-lv-shy="" opacity="0">${hand(fx - gap + 1, -1)}${hand(fx + gap - 1, 1)}</g>` +
      `</g></g>`
    )
  },
})

function buildFace(F: FaceSpec, mood: Mood, open: boolean): string {
  const { x: fx, ey, gap, my } = F
  const s = F.s ?? 1
  const eyes = mood === 'neutral' ? `<g data-lv-eye="">${F.eye(fx - gap, ey)}</g><g data-lv-eye="">${F.eye(fx + gap, ey)}</g>` : faceEyes(F, mood)
  const mouth =
    mood === 'neutral'
      ? open
        ? P(`M${n(fx - 5 * s)} ${my}Q${fx} ${n(my + 9 * s)} ${n(fx + 5 * s)} ${my}Z`, F.ink, ` stroke="${F.ink}" stroke-width="1.2" stroke-linejoin="round"`) + E(fx, my + 4 * s, 2.6 * s, 1.5 * s, '#ff7a93')
        : S(`M${n(fx - 4.5 * s)} ${my}Q${fx} ${n(my + 4.5 * s)} ${n(fx + 4.5 * s)} ${my}`, F.ink, 2.1 * s)
      : faceMouth(F, mood)
  const blush = mood === 'happy' ? '' : E(fx - gap - 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ' opacity=".45"') + E(fx + gap + 3.5 * s, ey + 5.5 * s, 3.4 * s, 1.9 * s, '#ff5c8a', 0, ' opacity=".45"')
  return eyes + faceBrows(F, mood) + blush + `<g data-lv-mouth="1">${mouth}</g>` + faceExtras(F, mood)
}
