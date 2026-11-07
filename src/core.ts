/* ------------------------------------------------------------------ *
 *  livatar core — deterministic, DOM-free SVG generation (SSR safe)
 * ------------------------------------------------------------------ */

export interface Rand {
  (): number
  int(min: number, max: number): number
  float(min: number, max: number): number
  pick<T>(list: readonly T[]): T
  bool(probability?: number): boolean
}

/** FNV-1a 32-bit string hash. */
export function hash(input: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Mulberry32 seeded PRNG with helpers. */
export function createRand(seed: number): Rand {
  let a = seed >>> 0
  const next = (() => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }) as Rand
  next.float = (min, max) => min + next() * (max - min)
  next.int = (min, max) => Math.floor(next.float(min, max + 1))
  next.pick = (list) => list[Math.floor(next() * list.length)]
  next.bool = (p = 0.5) => next() < p
  return next
}

/** Every built-in style can draw all of these. */
export const MOODS = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'sleepy', 'love', 'wink', 'silly', 'confused'] as const
export type Mood = (typeof MOODS)[number]

export interface StyleContext<O = Record<string, unknown>> {
  /** Seed as a string. */
  seed: string
  /** Seeded random generator — use it for every random decision. */
  rand: Rand
  /** Shuffled palette (seeded). */
  colors: string[]
  /** Background color chosen for this avatar ("none" when disabled). */
  background: string
  /**
   * Next palette color (cycles). Pass a color to get one that contrasts
   * with it (falls back to the next color when the palette is too uniform).
   */
  color(against?: string): string
  /** Unique, deterministic id prefix for <defs> (gradients, clip paths). */
  id: string
  /** Style specific options merged with defaults. */
  options: O
  /** Facial expression to draw. Styles draw their seeded default face for 'neutral'. */
  mood: Mood
  /**
   * Resolve a style option: returns `options[key]` unless it is missing or
   * 'random', in which case it picks from `choices` with the seeded rand.
   */
  pick<K extends keyof O>(key: K, choices: readonly Exclude<O[K], 'random' | undefined>[]): Exclude<O[K], 'random' | undefined>
}

export interface AvatarStyle<O = Record<string, unknown>> {
  name: string
  /** Default palette. */
  colors: string[]
  /** Default style options. */
  defaults?: O
  /**
   * The choices for each option, for building pickers and UIs.
   * Purely descriptive; `render` does not read it.
   */
  variants?: { [K in keyof O]?: readonly unknown[] }
  /** Default zoom (the `scale` option overrides it). Object-like styles use < 1 so they sit inside the circle. */
  scale?: number
  /** Return inner SVG markup for a 100×100 viewBox. */
  render(ctx: StyleContext<O>): string
}

export interface AvatarOptions<O = Record<string, unknown>> {
  /** Anything stable: user id, email, name… Same seed ⇒ same avatar. */
  seed?: string | number
  /** Pixel size or any CSS length. Omit for fluid (100% of container). */
  size?: number | string
  /** Override palette. */
  colors?: string[]
  /** `false` for transparent, a color string, or `true` (palette pick). */
  background?: boolean | string
  shape?: 'circle' | 'rounded' | 'square'
  /** Facial expression. Default 'neutral'. Change it live with `handle.emote()`. */
  mood?: Mood
  /** Mirror horizontally. */
  flip?: boolean
  /** Ring around the avatar: `true` (auto contrast) or a color. */
  border?: boolean | string
  /** Ring width in viewBox units (the avatar is 100 wide). Default 4. */
  borderWidth?: number
  /** Diagonal two-color gradient background instead of a flat one. */
  gradient?: boolean
  /** Corner radius 0…50 (overrides `shape`; 50 is a circle). */
  radius?: number
  /** Zoom the character, 0.5…1.5. Default 1. */
  scale?: number
  /** Rotate the character in degrees, -180…180. Default 0. */
  rotate?: number
  /** Accessible label. Without it the SVG is aria-hidden. */
  title?: string
  className?: string
  /** Style specific options. */
  options?: Partial<O>
}

/** Identity helper that gives you type inference when authoring a style. */
export function defineStyle<O = Record<string, unknown>>(style: AvatarStyle<O>): AvatarStyle<O> {
  return style
}

const SAFE = /^[#\w(),.%\s-]+$/
export const safe = (v: string, fallback = '#000') => (SAFE.test(v) ? v : fallback)
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

/** Relative luminance 0…1 of a #rgb / #rrggbb color, or null if unknown. */
export function luma(c: string): number | null {
  const m = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(c.trim())
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h.replace(/./g, '$&$&')
  const v = parseInt(h, 16)
  return (0.2126 * ((v >> 16) & 255) + 0.7152 * ((v >> 8) & 255) + 0.0722 * (v & 255)) / 255
}

/** Format a number for SVG output (1 decimal). */
export const n = (v: number) => Math.round(v * 10) / 10

export function createAvatar<O>(style: AvatarStyle<O>, opts: AvatarOptions<O> = {}): string {
  const seed = String(opts.seed ?? 'livatar')
  const h = hash(style.name + ':' + seed)
  const rand = createRand(h)

  const palette = (opts.colors?.length ? opts.colors : style.colors).map((c) => safe(c))
  const colors = palette.slice()
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[colors[i], colors[j]] = [colors[j], colors[i]]
  }

  const bg =
    opts.background === false
      ? 'none'
      : typeof opts.background === 'string'
        ? safe(opts.background)
        : colors[0]
  let ci = typeof opts.background === 'string' || opts.background === false ? 0 : 1
  const color = (against?: string) => {
    const L = against ? luma(against) : null
    if (L != null)
      for (let k = 0; k < colors.length; k++) {
        const l = luma(colors[(ci + k) % colors.length])
        if (l == null || Math.abs(l - L) > 0.2) {
          ci += k
          break
        }
      }
    return colors[ci++ % colors.length]
  }

  const id = 'lv' + h.toString(36)
  const options = { ...(style.defaults as O), ...(opts.options as O) } as O
  const mood: Mood = MOODS.includes(opts.mood as Mood) ? (opts.mood as Mood) : 'neutral'
  // second background stop is chosen before the style draws, so gradients don't shift the style's colors
  const bg2 = opts.gradient && bg !== 'none' ? colors[(colors.indexOf(bg) + Math.floor(colors.length / 2)) % colors.length] : ''
  const ctx: StyleContext<O> = {
    seed,
    rand,
    colors,
    background: bg,
    color,
    id,
    options,
    mood,
    pick: (key, choices) => {
      const v = options[key] as unknown
      return (v == null || v === 'random' ? rand.pick(choices) : v) as any
    },
  }

  const inner = style.render(ctx)
  const shape = opts.shape ?? 'circle'
  const radius = opts.radius != null && isFinite(opts.radius) ? Math.max(0, Math.min(50, opts.radius)) : shape === 'circle' ? 50 : shape === 'rounded' ? 22 : 0
  const shapeEl = (attrs: string) =>
    radius >= 50
      ? `<circle cx="50" cy="50" r="50"${attrs}/>`
      : `<rect width="100" height="100"${radius ? ` rx="${n(radius)}"` : ''}${attrs}/>`
  const clip = shapeEl('')

  const bw = Math.max(0.5, Math.min(20, Number(opts.borderWidth) || 4))
  const ring = opts.border
    ? (radius >= 50
        ? `<circle cx="50" cy="50" r="${n(50 - bw / 2)}"`
        : `<rect x="${n(bw / 2)}" y="${n(bw / 2)}" width="${n(100 - bw)}" height="${n(100 - bw)}"${radius > bw / 2 ? ` rx="${n(radius - bw / 2)}"` : ''}`) +
      ` fill="none" stroke="${typeof opts.border === 'string' ? safe(opts.border) : (luma(bg) ?? 1) > 0.5 ? '#1f1a2e' : '#ffffff'}" stroke-width="${bw}"/>`
    : ''
  const fill = bg2 ? `url(#${id}-bg)` : bg
  const grad = bg2
    ? `<linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${bg2}"/></linearGradient>`
    : ''
  const k = opts.scale != null && isFinite(opts.scale) ? Math.max(0.5, Math.min(1.5, opts.scale)) : style.scale ?? 1
  const rot = opts.rotate != null && isFinite(opts.rotate) ? Math.max(-180, Math.min(180, opts.rotate)) : 0
  let body = opts.flip ? `<g transform="matrix(-1 0 0 1 100 0)">${inner}</g>` : inner
  if (k !== 1 || rot) body = `<g transform="translate(50 50)${rot ? ` rotate(${n(rot)})` : ''}${k !== 1 ? ` scale(${n(k * 100) / 100})` : ''} translate(-50 -50)">${body}</g>`

  const size = opts.size == null ? '100%' : safe(String(opts.size), '100%')
  const a11y = opts.title
    ? `role="img" aria-label="${esc(opts.title)}"><title>${esc(opts.title)}</title`
    : 'aria-hidden="true"'
  const cls = opts.className ? ` class="${esc(opts.className)}"` : ''

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}"` +
    ` data-lv-root="${esc(style.name)}" data-lv-mood="${mood}"${opts.flip ? ' data-lv-flip=""' : ''}${cls} style="overflow:hidden;display:block" ${a11y}>` +
    `<defs><clipPath id="${id}-c">${clip}</clipPath>${grad}</defs>` +
    `<g clip-path="url(#${id}-c)">` +
    (bg !== 'none' ? `<rect width="100" height="100" fill="${fill}"/>` : '') +
    body +
    `</g>${ring}</svg>`
  )
}

/** Catmull-Rom → cubic Bézier closed path through points. Handy for organic shapes. */
export function smoothPath(p: [number, number][]): string {
  const len = p.length
  let d = `M${n(p[0][0])} ${n(p[0][1])}`
  for (let i = 0; i < len; i++) {
    const p0 = p[(i - 1 + len) % len]
    const p1 = p[i]
    const p2 = p[(i + 1) % len]
    const p3 = p[(i + 2) % len]
    d +=
      `C${n(p1[0] + (p2[0] - p0[0]) / 6)} ${n(p1[1] + (p2[1] - p0[1]) / 6)} ` +
      `${n(p2[0] - (p3[0] - p1[0]) / 6)} ${n(p2[1] - (p3[1] - p1[1]) / 6)} ` +
      `${n(p2[0])} ${n(p2[1])}`
  }
  return d + 'Z'
}
