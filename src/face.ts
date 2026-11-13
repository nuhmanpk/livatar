/* ------------------------------------------------------------------ *
 *  Shared facial expressions. Every built-in style describes where its
 *  face sits and how it draws an open eye; this module draws the mood
 *  variants (eyes, brows, mouth, floating extras) on top of that.
 * ------------------------------------------------------------------ */
import { n, type Mood } from './core'

export interface FaceSpec {
  /** Face centre x. */
  x: number
  /** Eye line y. */
  ey: number
  /** Half the distance between the eyes. */
  gap: number
  /** Mouth y (the top of the mouth). */
  my: number
  /** Stroke / fill color for features. */
  ink: string
  /** Feature scale; 1 suits eyes about 7 units wide. */
  s?: number
  /** The style's own open eye at (x, y), without a data-lv-eye wrapper. */
  eye: (x: number, y: number) => string
  /** Where floating extras (zzz, hearts, ?) go. Default: above the right eye. */
  extra?: [number, number]
}

const TONGUE = '#ff7a93'
const HEART = '#ff4d6d'

const stroke = (d: string, ink: string, w: number) =>
  `<path d="${d}" stroke="${ink}" stroke-width="${n(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`

export const heart = (x: number, y: number, r: number, fill = HEART) =>
  `<path d="M${n(x)} ${n(y + r * 0.8)}C${n(x - r * 1.6)} ${n(y - r * 0.3)} ${n(x - r * 0.8)} ${n(y - r * 1.5)} ${n(x)} ${n(y - r * 0.55)}` +
  `C${n(x + r * 0.8)} ${n(y - r * 1.5)} ${n(x + r * 1.6)} ${n(y - r * 0.3)} ${n(x)} ${n(y + r * 0.8)}Z" fill="${fill}"/>`

/** Five-point star centred on (x, y). */
export const star = (x: number, y: number, r: number, fill = '#ffc93c') => {
  let d = ''
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const k = i % 2 ? r * 0.45 : r
    d += `${i ? 'L' : 'M'}${n(x + Math.cos(a) * k)} ${n(y + Math.sin(a) * k)}`
  }
  return `<path d="${d}Z" fill="${fill}" stroke="#e0a100" stroke-width="${n(r * 0.12)}" stroke-linejoin="round"/>`
}

const scaled = (svg: string, x: number, y: number, k: number) =>
  `<g transform="translate(${n(x)} ${n(y)}) scale(${k}) translate(${n(-x)} ${n(-y)})">${svg}</g>`

/** Both eyes for a mood, each wrapped in data-lv-eye so they blink and track. */
export function faceEyes(f: FaceSpec, mood: Mood): string {
  const s = f.s ?? 1
  const L = f.x - f.gap
  const R = f.x + f.gap
  const y = f.ey
  const w = 2.4 * s
  const arcUp = (x: number) => stroke(`M${n(x - 3.6 * s)} ${n(y + 1.5 * s)}Q${n(x)} ${n(y - 4 * s)} ${n(x + 3.6 * s)} ${n(y + 1.5 * s)}`, f.ink, w)
  const arcDown = (x: number) => stroke(`M${n(x - 3.6 * s)} ${n(y)}Q${n(x)} ${n(y + 3.2 * s)} ${n(x + 3.6 * s)} ${n(y)}`, f.ink, w)
  const wrap = (svg: string, blink = true) => (blink ? `<g data-lv-eye="">${svg}</g>` : `<g>${svg}</g>`)
  switch (mood) {
    case 'happy':
      return wrap(arcUp(L), false) + wrap(arcUp(R), false)
    case 'sleepy':
      return wrap(arcDown(L), false) + wrap(arcDown(R), false)
    case 'love':
      return [L, R].map((x) => wrap(`<g data-lv-depth=".35">${heart(x, y, 3.6 * s)}</g>`)).join('')
    case 'wink':
      return wrap(f.eye(L, y)) + wrap(arcUp(R), false)
    case 'surprised':
      return wrap(scaled(f.eye(L, y), L, y, 1.3)) + wrap(scaled(f.eye(R, y), R, y, 1.3))
    case 'confused':
      return wrap(scaled(f.eye(L, y), L, y, 1.15)) + wrap(scaled(f.eye(R, y), R, y, 0.75))
    case 'laugh':
      // squeezed shut: > <
      return [L, R].map((x) => wrap(stroke(`M${n(x - (x < f.x ? 3.4 : -3.4) * s)} ${n(y - 3 * s)}L${n(x + (x < f.x ? 2.6 : -2.6) * s)} ${n(y)}L${n(x - (x < f.x ? 3.4 : -3.4) * s)} ${n(y + 3 * s)}`, f.ink, w), false)).join('')
    case 'cool': {
      // shades: two lenses and a bridge
      const lens = (x: number) => `<path d="M${n(x - 5.4 * s)} ${n(y - 3 * s)}H${n(x + 5.4 * s)}V${n(y + 0.5 * s)}Q${n(x + 5 * s)} ${n(y + 4.6 * s)} ${n(x)} ${n(y + 4.6 * s)}Q${n(x - 5 * s)} ${n(y + 4.6 * s)} ${n(x - 5.4 * s)} ${n(y + 0.5 * s)}Z" fill="#141414"/>`
      return (
        wrap(lens(L) + lens(R) + stroke(`M${n(L + 5 * s)} ${n(y - 2.4 * s)}H${n(R - 5 * s)}`, '#141414', 1.6 * s), false) +
        stroke(`M${n(L - 3 * s)} ${n(y - 1.6 * s)}l${n(2 * s)} ${n(-1 * s)}`, '#fff', 1 * s)
      )
    }
    case 'cry':
      return wrap(arcDown(L), false) + wrap(arcDown(R), false)
    case 'scared':
      return [L, R].map((x) => wrap(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(3.6 * s)}" fill="#fff" stroke="${f.ink}" stroke-width="${n(1.4 * s)}"/><circle cx="${n(x)}" cy="${n(y)}" r="${n(1.1 * s)}" fill="${f.ink}"/>`)).join('')
    case 'smug':
      // half-lidded: eye with a flat lid over the top
      return [L, R].map((x) => wrap(stroke(`M${n(x - 4 * s)} ${n(y - 0.4 * s)}H${n(x + 4 * s)}`, f.ink, w) + `<path d="M${n(x - 3.2 * s)} ${n(y)}A${n(2.6 * s)} ${n(2.6 * s)} 0 0 0 ${n(x + 1.6 * s)} ${n(y)}Z" fill="${f.ink}"/>`, false)).join('')
    case 'starstruck':
      return [L, R].map((x) => wrap(`<g data-lv-depth=".35">${star(x, y, 4.4 * s)}</g>`)).join('')
    case 'silly':
      return wrap(scaled(f.eye(L, y), L, y, 1.2)) + wrap(scaled(f.eye(R, y), R, y, 0.85))
    default:
      return wrap(f.eye(L, y)) + wrap(f.eye(R, y))
  }
}

/** Brows that sell the mood. Empty for moods that read fine without them. */
export function faceBrows(f: FaceSpec, mood: Mood): string {
  const s = f.s ?? 1
  const y = f.ey
  const w = 2.2 * s
  const brow = (x: number, side: -1 | 1, inner: number, outer: number) =>
    stroke(`M${n(x - side * 4 * s)} ${n(y - outer * s)}L${n(x + side * 4 * s)} ${n(y - inner * s)}`, f.ink, w)
  const L = f.x - f.gap
  const R = f.x + f.gap
  switch (mood) {
    case 'angry':
      return brow(L, 1, 4.6, 8) + brow(R, -1, 4.6, 8)
    case 'sad':
      return brow(L, 1, 8.2, 5.6) + brow(R, -1, 8.2, 5.6)
    case 'surprised':
      return [L, R].map((x) => stroke(`M${n(x - 4 * s)} ${n(y - 8.5 * s)}Q${n(x)} ${n(y - 12 * s)} ${n(x + 4 * s)} ${n(y - 8.5 * s)}`, f.ink, w)).join('')
    case 'confused':
      return brow(L, 1, 9, 8) + brow(R, -1, 5.5, 6.5)
    case 'cry':
    case 'scared':
      return brow(L, 1, 9, 6) + brow(R, -1, 9, 6)
    case 'smug':
      return brow(L, 1, 7, 7) + brow(R, -1, 6, 9.5)
    default:
      return ''
  }
}

/** Mouth for a mood. Wrap the result in your style's data-lv-mouth group. */
export function faceMouth(f: FaceSpec, mood: Mood): string {
  const s = f.s ?? 1
  const x = f.x
  const y = f.my
  const ink = f.ink
  const w = 2.3 * s
  switch (mood) {
    case 'happy':
      return (
        `<path d="M${n(x - 6.5 * s)} ${n(y)}Q${n(x)} ${n(y + 10 * s)} ${n(x + 6.5 * s)} ${n(y)}Z" fill="${ink}" stroke="${ink}" stroke-width="${n(1.4 * s)}" stroke-linejoin="round"/>` +
        `<ellipse cx="${n(x)}" cy="${n(y + 4.6 * s)}" rx="${n(3.2 * s)}" ry="${n(1.8 * s)}" fill="${TONGUE}"/>`
      )
    case 'sad':
      return stroke(`M${n(x - 5 * s)} ${n(y + 4 * s)}Q${n(x)} ${n(y - 1.5 * s)} ${n(x + 5 * s)} ${n(y + 4 * s)}`, ink, w)
    case 'angry':
      return (
        `<rect x="${n(x - 6 * s)}" y="${n(y)}" width="${n(12 * s)}" height="${n(5 * s)}" rx="${n(1.6 * s)}" fill="#fff" stroke="${ink}" stroke-width="${n(1.5 * s)}"/>` +
        stroke(`M${n(x - 6 * s)} ${n(y + 2.5 * s)}H${n(x + 6 * s)}M${n(x - 2 * s)} ${n(y)}V${n(y + 5 * s)}M${n(x + 2 * s)} ${n(y)}V${n(y + 5 * s)}`, ink, 1 * s)
      )
    case 'surprised':
      return `<ellipse cx="${n(x)}" cy="${n(y + 2.5 * s)}" rx="${n(3 * s)}" ry="${n(4 * s)}" fill="${ink}"/>`
    case 'sleepy':
      return `<ellipse cx="${n(x)}" cy="${n(y + 2 * s)}" rx="${n(1.8 * s)}" ry="${n(2.2 * s)}" fill="${ink}"/>`
    case 'love':
      return stroke(`M${n(x - 5 * s)} ${n(y)}Q${n(x)} ${n(y + 6 * s)} ${n(x + 5 * s)} ${n(y)}`, ink, w)
    case 'wink':
      return stroke(`M${n(x - 5 * s)} ${n(y + 1 * s)}Q${n(x + 1 * s)} ${n(y + 6 * s)} ${n(x + 5.5 * s)} ${n(y - 1 * s)}`, ink, w)
    case 'silly':
      return (
        `<path d="M${n(x - 1 * s)} ${n(y + 2 * s)}h${n(6 * s)}v${n(3.5 * s)}a${n(3 * s)} ${n(3 * s)} 0 0 1 ${n(-6 * s)} 0z" fill="${TONGUE}" stroke="${ink}" stroke-width="${n(1.2 * s)}"/>` +
        stroke(`M${n(x - 6 * s)} ${n(y)}Q${n(x)} ${n(y + 5 * s)} ${n(x + 6 * s)} ${n(y)}`, ink, w)
      )
    case 'confused':
      return stroke(`M${n(x - 5.5 * s)} ${n(y + 2 * s)}q${n(2.75 * s)} ${n(-3 * s)} ${n(5.5 * s)} 0t${n(5.5 * s)} 0`, ink, w)
    case 'laugh':
    case 'starstruck':
      return (
        `<path d="M${n(x - 8 * s)} ${n(y - 1 * s)}Q${n(x)} ${n(y + 1 * s)} ${n(x + 8 * s)} ${n(y - 1 * s)}Q${n(x + 7 * s)} ${n(y + 11 * s)} ${n(x)} ${n(y + 11 * s)}Q${n(x - 7 * s)} ${n(y + 11 * s)} ${n(x - 8 * s)} ${n(y - 1 * s)}Z" fill="${ink}" stroke="${ink}" stroke-width="${n(1.2 * s)}" stroke-linejoin="round"/>` +
        `<path d="M${n(x - 6.6 * s)} ${n(y + 0.4 * s)}Q${n(x)} ${n(y + 2.2 * s)} ${n(x + 6.6 * s)} ${n(y + 0.4 * s)}L${n(x + 6 * s)} ${n(y + 2.8 * s)}Q${n(x)} ${n(y + 4.4 * s)} ${n(x - 6 * s)} ${n(y + 2.8 * s)}Z" fill="#fff"/>` +
        `<ellipse cx="${n(x)}" cy="${n(y + 8.2 * s)}" rx="${n(4 * s)}" ry="${n(2.2 * s)}" fill="${TONGUE}"/>`
      )
    case 'cool':
    case 'smug':
      return stroke(`M${n(x - 5 * s)} ${n(y + 2 * s)}Q${n(x + 1 * s)} ${n(y + 3.5 * s)} ${n(x + 6 * s)} ${n(y - 1 * s)}`, ink, w)
    case 'cry':
      return (
        `<path d="M${n(x - 6 * s)} ${n(y + 5 * s)}Q${n(x)} ${n(y - 2 * s)} ${n(x + 6 * s)} ${n(y + 5 * s)}Z" fill="${ink}" stroke="${ink}" stroke-width="${n(1.4 * s)}" stroke-linejoin="round"/>`
      )
    case 'scared':
      return (
        `<rect x="${n(x - 6 * s)}" y="${n(y)}" width="${n(12 * s)}" height="${n(5 * s)}" rx="${n(2.5 * s)}" fill="#fff" stroke="${ink}" stroke-width="${n(1.5 * s)}"/>` +
        stroke(`M${n(x - 5 * s)} ${n(y + 2.5 * s)}l${n(2.5 * s)} ${n(-1.5 * s)}l${n(2.5 * s)} ${n(3 * s)}l${n(2.5 * s)} ${n(-3 * s)}l${n(2.5 * s)} ${n(1.5 * s)}`, ink, 1 * s)
      )
    default:
      return ''
  }
}

/** Little floating extras: zzz, hearts, a tear, an anger mark, a question mark. */
export function faceExtras(f: FaceSpec, mood: Mood): string {
  const s = f.s ?? 1
  const [ax, ay] = f.extra ?? [f.x + f.gap + 9 * s, f.ey - 15 * s]
  const fl = (svg: string, kind = '') => `<g data-lv-float="${kind}">${svg}</g>`
  switch (mood) {
    case 'sleepy': {
      const z = (x: number, y: number, k: number) => stroke(`M${n(x)} ${n(y)}h${n(4 * k)}l${n(-4 * k)} ${n(4.5 * k)}h${n(4 * k)}`, f.ink, 1.6 * k)
      return fl(z(ax - 3, ay + 4, 0.8 * s) + z(ax + 2, ay - 3, 1.1 * s))
    }
    case 'love':
      return fl(heart(ax, ay, 3 * s) + heart(ax + 7 * s, ay + 7 * s, 2 * s))
    case 'sad': {
      const x = f.x - f.gap - 1.5 * s
      const y = f.ey + 4 * s
      return fl(
        `<path d="M${n(x)} ${n(y)}C${n(x - 2.4 * s)} ${n(y + 3.6 * s)} ${n(x - 2.4 * s)} ${n(y + 6 * s)} ${n(x)} ${n(y + 6 * s)}C${n(x + 2.4 * s)} ${n(y + 6 * s)} ${n(x + 2.4 * s)} ${n(y + 3.6 * s)} ${n(x)} ${n(y)}Z" fill="#5ec5ff"/>`,
        'drip',
      )
    }
    case 'angry': {
      const k = 1.1 * s
      return fl(
        stroke(
          `M${n(ax - 4 * k)} ${n(ay - 1 * k)}q${n(3 * k)} 0 ${n(3 * k)} ${n(-3 * k)}M${n(ax + 1 * k)} ${n(ay - 4 * k)}q0 ${n(3 * k)} ${n(3 * k)} ${n(3 * k)}` +
            `M${n(ax + 4 * k)} ${n(ay + 1 * k)}q${n(-3 * k)} 0 ${n(-3 * k)} ${n(3 * k)}M${n(ax - 1 * k)} ${n(ay + 4 * k)}q0 ${n(-3 * k)} ${n(-3 * k)} ${n(-3 * k)}`,
          '#ff3b3b',
          2 * k,
        ),
      )
    }
    case 'confused':
      return fl(
        stroke(`M${n(ax - 2.5 * s)} ${n(ay - 2 * s)}a${n(2.6 * s)} ${n(2.6 * s)} 0 1 1 ${n(2.6 * s)} ${n(2.6 * s)}v${n(1.8 * s)}`, '#7f5af0', 1.8 * s) +
          `<circle cx="${n(ax + 0.1 * s)}" cy="${n(ay + 5.4 * s)}" r="${n(1.1 * s)}" fill="#7f5af0"/>`,
      )
    case 'wink': {
      const x = ax, y = ay + 6 * s, r = 3.2 * s, q = 0.8 * s
      return fl(`<path d="M${n(x)} ${n(y - r)}L${n(x + q)} ${n(y - q)}L${n(x + r)} ${n(y)}L${n(x + q)} ${n(y + q)}L${n(x)} ${n(y + r)}L${n(x - q)} ${n(y + q)}L${n(x - r)} ${n(y)}L${n(x - q)} ${n(y - q)}Z" fill="#ffd23f"/>`)
    }
    case 'surprised':
      return fl(stroke(`M${n(ax)} ${n(ay - 3 * s)}v${n(5 * s)}M${n(ax + 4 * s)} ${n(ay - 1 * s)}l${n(2 * s)} ${n(-3 * s)}M${n(ax - 4 * s)} ${n(ay - 1 * s)}l${n(-2 * s)} ${n(-3 * s)}`, f.ink, 1.6 * s))
    case 'laugh':
      return fl(
        `<path d="M${n(f.x - f.gap - 6 * s)} ${n(f.ey + 1 * s)}q${n(-2 * s)} ${n(3 * s)} 0 ${n(4.5 * s)}q${n(2 * s)} ${n(-1.5 * s)} 0 ${n(-4.5 * s)}Z" fill="#5ec5ff"/>` +
          `<path d="M${n(f.x + f.gap + 6 * s)} ${n(f.ey + 1 * s)}q${n(2 * s)} ${n(3 * s)} 0 ${n(4.5 * s)}q${n(-2 * s)} ${n(-1.5 * s)} 0 ${n(-4.5 * s)}Z" fill="#5ec5ff"/>`,
        'drip',
      )
    case 'cry':
      return fl(
        [f.x - f.gap, f.x + f.gap]
          .map((x) => `<path d="M${n(x - 1.6 * s)} ${n(f.ey + 2 * s)}Q${n(x - 2.6 * s)} ${n(f.ey + 9 * s)} ${n(x - 1 * s)} ${n(f.ey + 14 * s)}L${n(x + 1.6 * s)} ${n(f.ey + 14 * s)}Q${n(x + 0.4 * s)} ${n(f.ey + 9 * s)} ${n(x + 1.6 * s)} ${n(f.ey + 2 * s)}Z" fill="#5ec5ff" opacity=".9"/>`)
          .join(''),
        'drip',
      )
    case 'scared':
      return fl(`<path d="M${n(ax - 2 * s)} ${n(ay)}C${n(ax - 4.4 * s)} ${n(ay + 3.6 * s)} ${n(ax - 4.4 * s)} ${n(ay + 6 * s)} ${n(ax - 2 * s)} ${n(ay + 6 * s)}C${n(ax + 0.4 * s)} ${n(ay + 6 * s)} ${n(ax + 0.4 * s)} ${n(ay + 3.6 * s)} ${n(ax - 2 * s)} ${n(ay)}Z" fill="#9fdcff"/>`, 'drip') +
        stroke(`M${n(f.x - f.gap - 4 * s)} ${n(f.ey - 12 * s)}v${n(-3 * s)}M${n(f.x)} ${n(f.ey - 14 * s)}v${n(-3 * s)}M${n(f.x + f.gap + 4 * s)} ${n(f.ey - 12 * s)}v${n(-3 * s)}`, '#7f8ea3', 1.2 * s)
    case 'starstruck':
      return fl(star(ax, ay, 3 * s) + star(ax - 2 * f.gap - 16 * s, ay + 2 * s, 2.2 * s))
    case 'cool':
      return ''
    case 'happy':
      return (
        `<ellipse cx="${n(f.x - f.gap - 3 * s)}" cy="${n(f.ey + 6 * s)}" rx="${n(3.6 * s)}" ry="${n(2 * s)}" fill="#ff5c8a" opacity=".35"/>` +
        `<ellipse cx="${n(f.x + f.gap + 3 * s)}" cy="${n(f.ey + 6 * s)}" rx="${n(3.6 * s)}" ry="${n(2 * s)}" fill="#ff5c8a" opacity=".35"/>`
      )
    default:
      return ''
  }
}
