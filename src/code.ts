/* ------------------------------------------------------------------ *
 *  livatar codes — one short, URL-safe string per avatar.
 *
 *    const code = encode({ style: 'buddy', seed: 'ada', mood: 'happy', options: { hair: 'afro' } })
 *    // → 'lvAQEB…'  store it in your DB, put it in a URL, share it
 *    render(code)  // → '<svg …>'   (same avatar, anywhere)
 *
 *  Layout (version 1), then base64url with an "lv" prefix:
 *    [ver][style][mood | shape<<4 | flip<<6 | gradient<<7][flags]
 *    [background?][border color?][border width?][palette?][colors?]
 *    [options: count, (key, value)…][seed utf-8 …rest]
 *  Option values are stored as indexes into the style's `variants`, so
 *  `variants` lists and the style/palette orders are append-only.
 * ------------------------------------------------------------------ */
import { createAvatar, MOODS, type AvatarOptions, type AvatarStyle, type Mood } from './core'
import { palettes, type PaletteName } from './palettes'
import { styles as builtin } from './registry'

export interface LivatarConfig {
  /** Style name, e.g. 'buddy'. */
  style: string
  seed?: string | number
  mood?: Mood
  shape?: 'circle' | 'rounded' | 'square'
  flip?: boolean
  gradient?: boolean
  background?: boolean | string
  border?: boolean | string
  borderWidth?: number
  radius?: number
  scale?: number
  rotate?: number
  /** A name from `palettes`. Ignored when `colors` is set. */
  palette?: PaletteName
  colors?: string[]
  /** Style options. Values left out (or 'random') stay picked by the seed. */
  options?: Record<string, unknown>
}

const VERSION = 1
const SHAPES = ['circle', 'rounded', 'square'] as const
const PREFIX = 'lv'
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

const utf8 = (s: string) => new TextEncoder().encode(s)
const fromUtf8 = (b: Uint8Array) => new TextDecoder().decode(b)

function toB64(bytes: number[]): string {
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const v = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0)
    const chars = Math.ceil(((Math.min(3, bytes.length - i)) * 8) / 6)
    for (let k = 0; k < chars; k++) out += B64[(v >> (18 - 6 * k)) & 63]
  }
  return out
}

function fromB64(s: string): Uint8Array {
  const out: number[] = []
  let v = 0
  let bits = 0
  for (const ch of s) {
    const d = B64.indexOf(ch)
    if (d < 0) throw new Error('livatar: invalid code')
    v = (v << 6) | d
    bits += 6
    if (bits >= 8) {
      bits -= 8
      out.push((v >> bits) & 255)
    }
  }
  return new Uint8Array(out)
}

/** True when `value` looks like a livatar code. */
export function isCode(value: unknown): value is string {
  return typeof value === 'string' && value.length > 5 && value.startsWith(PREFIX) && /^[\w-]+$/.test(value)
}

/** Pack a config into a short URL-safe code. */
export function encode(cfg: LivatarConfig, registry: Record<string, AvatarStyle<any>> = builtin): string {
  const names = Object.keys(registry)
  const style = registry[cfg.style]
  const b: number[] = [VERSION]
  const str = (s: string) => {
    const u = utf8(s).slice(0, 255)
    b.push(u.length, ...u)
  }

  const si = names.indexOf(cfg.style)
  if (si < 0 || si > 254) {
    b.push(255)
    str(cfg.style)
  } else b.push(si)

  const mi = Math.max(0, MOODS.indexOf(cfg.mood ?? 'neutral'))
  const sh = Math.max(0, SHAPES.indexOf(cfg.shape ?? 'circle'))
  b.push(mi | (sh << 4) | (cfg.flip ? 64 : 0) | (cfg.gradient ? 128 : 0))

  const bgMode = cfg.background === false ? 1 : typeof cfg.background === 'string' ? 2 : 0
  const pal = cfg.palette ? Object.keys(palettes).indexOf(cfg.palette) : -1
  // radius / scale / rotate ride along as escaped "$" options (no format change needed)
  const extras = (['radius', 'scale', 'rotate'] as const).filter((k) => cfg[k] != null).map((k) => ['$' + k, cfg[k]] as [string, unknown])
  const opts = [...Object.entries(cfg.options ?? {}).filter(([, v]) => v != null && v !== 'random'), ...extras]
  const flags =
    bgMode |
    (cfg.border ? 4 : 0) |
    (typeof cfg.border === 'string' ? 8 : 0) |
    (pal >= 0 && !cfg.colors?.length ? 16 : 0) |
    (cfg.colors?.length ? 32 : 0) |
    (cfg.borderWidth != null ? 64 : 0) |
    (opts.length ? 128 : 0)
  b.push(flags)

  if (bgMode === 2) str(cfg.background as string)
  if (flags & 8) str(cfg.border as string)
  if (flags & 64) b.push(Math.max(0, Math.min(255, Math.round(cfg.borderWidth! * 10))))
  if (flags & 16) b.push(pal)
  if (flags & 32) str(cfg.colors!.join(','))
  if (flags & 128) {
    const keys = Object.keys(style?.variants ?? {})
    b.push(opts.length)
    for (const [k, v] of opts) {
      const ki = k[0] === '$' ? -1 : keys.indexOf(k)
      const vi = ki < 0 ? -1 : (style!.variants![k] as unknown[]).indexOf(v)
      if (ki >= 0 && ki < 255 && vi >= 0 && vi < 253) b.push(ki, vi)
      else {
        // escape: key name + typed raw value
        b.push(255)
        str(k)
        b.push(typeof v === 'number' ? 254 : typeof v === 'boolean' ? 253 : 255)
        str(String(v))
      }
    }
  }
  b.push(...utf8(String(cfg.seed ?? 'livatar')))
  return PREFIX + toB64(b)
}

/** Unpack a code made by `encode()`. Throws on malformed input. */
export function decode(code: string, registry: Record<string, AvatarStyle<any>> = builtin): LivatarConfig {
  if (!isCode(code)) throw new Error('livatar: invalid code')
  const b = fromB64(code.slice(PREFIX.length))
  let i = 0
  const byte = () => {
    if (i >= b.length) throw new Error('livatar: truncated code')
    return b[i++]
  }
  const str = () => {
    const len = byte()
    if (i + len > b.length) throw new Error('livatar: truncated code')
    return fromUtf8(b.subarray(i, (i += len)))
  }
  if (byte() !== VERSION) throw new Error('livatar: unsupported code version')

  const names = Object.keys(registry)
  const si = byte()
  const name = si === 255 ? str() : names[si]
  if (!name) throw new Error('livatar: unknown style in code')
  const cfg: LivatarConfig = { style: name }

  const m = byte()
  if ((m & 15) < MOODS.length && m & 15) cfg.mood = MOODS[m & 15]
  if ((m >> 4) & 3) cfg.shape = SHAPES[(m >> 4) & 3] ?? 'circle'
  if (m & 64) cfg.flip = true
  if (m & 128) cfg.gradient = true

  const f = byte()
  if ((f & 3) === 1) cfg.background = false
  if ((f & 3) === 2) cfg.background = str()
  if (f & 4) cfg.border = f & 8 ? str() : true
  if (f & 64) cfg.borderWidth = byte() / 10
  if (f & 16) cfg.palette = Object.keys(palettes)[byte()] as PaletteName
  if (f & 32) cfg.colors = str().split(',')
  if (f & 128) {
    const variants = registry[name]?.variants ?? {}
    const keys = Object.keys(variants)
    const options: Record<string, unknown> = {}
    for (let n = byte(); n > 0; n--) {
      const ki = byte()
      if (ki === 255) {
        const k = str()
        const t = byte()
        const raw = str()
        const v = t === 254 ? Number(raw) : t === 253 ? raw === 'true' : raw
        if (k === '$radius' || k === '$scale' || k === '$rotate') cfg[k.slice(1) as 'radius'] = Number(v)
        else options[k] = v
      } else {
        const k = keys[ki]
        const vi = byte()
        if (k) options[k] = (variants[k] as unknown[])[vi]
      }
    }
    if (Object.keys(options).length) cfg.options = options
  }
  cfg.seed = fromUtf8(b.subarray(i))
  return cfg
}

/** Turn a code or config into `createAvatar` options for its style. */
export function resolve(
  input: string | LivatarConfig,
  registry: Record<string, AvatarStyle<any>> = builtin,
): { style: AvatarStyle<any>; options: AvatarOptions<any> } {
  // a string is either a code or a plain style name ('buddy')
  const cfg = typeof input === 'string' ? (isCode(input) ? decode(input, registry) : { style: input }) : input
  const style = registry[cfg.style]
  if (!style) throw new Error(`livatar: unknown style "${cfg.style}"`)
  const { style: _s, palette, colors, ...rest } = cfg
  return {
    style,
    options: { ...rest, colors: colors?.length ? colors : palette ? [...(palettes[palette] ?? [])] : undefined },
  }
}

/** Render a code (or config) to an SVG string. `extra` overrides, e.g. `{ size: 64, title: 'Ada' }`. */
export function render(input: string | LivatarConfig, extra: AvatarOptions<any> = {}, registry = builtin): string {
  const r = resolve(input, registry)
  return createAvatar(r.style, { ...r.options, ...extra })
}

/**
 * A random config: random seed, and a random concrete value for every
 * option of the style (or a random style). Great for a "shuffle" button.
 */
export function randomConfig(style?: string, registry: Record<string, AvatarStyle<any>> = builtin): LivatarConfig {
  const names = Object.keys(registry)
  const name = style ?? names[Math.floor(Math.random() * names.length)]
  const options: Record<string, unknown> = {}
  for (const [k, list] of Object.entries(registry[name]?.variants ?? {}) as [string, unknown[]][])
    if (list?.length) options[k] = list[Math.floor(Math.random() * list.length)]
  return { style: name, seed: Math.random().toString(36).slice(2, 10), options }
}
