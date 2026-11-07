/* ------------------------------------------------------------------ *
 *  livatar/server — your own avatar API in one line, on any runtime
 *  with web-standard Request/Response: Cloudflare Workers, Vercel/Next.js
 *  route handlers, Deno, Bun, Netlify, Node 18+.
 *
 *    export default { fetch: avatarHandler() }                 // Cloudflare / Bun / Deno
 *    export const GET = avatarHandler({ basePath: '/api/avatar' }) // Next.js app/api/avatar/[...slug]/route.ts
 *
 *  URLs:  /<style>/<seed>.svg?mood=happy&size=64&species=owl&palette=ocean
 *         /lvAQQ….svg                     (a livatar code)
 * ------------------------------------------------------------------ */
import { MOODS, type Mood } from './core'
import { decode, isCode, render, type LivatarConfig } from './code'
import { describe } from './describe'
import { palettes, type PaletteName } from './palettes'
import { styles } from './registry'

export interface HandlerOptions {
  /** Path prefix to strip, e.g. '/api/avatar'. */
  basePath?: string
  /** Cache-Control header. Avatars are deterministic, so cache hard by default. */
  cacheControl?: string
  /** Largest size allowed. Default 1024. */
  maxSize?: number
}

const TOP = new Set(['mood', 'size', 'shape', 'radius', 'palette', 'background', 'flip', 'gradient', 'border', 'scale', 'rotate', 'title'])
const val = (v: string) => (v === 'true' ? true : v === 'false' ? false : /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v)

/** Parse a request URL into a config + render size. Exported for custom servers. */
export function parseAvatarUrl(url: URL, basePath = ''): { cfg: LivatarConfig & { title?: string }; size?: number } | null {
  let path = decodeURIComponent(url.pathname)
  if (basePath && path.startsWith(basePath)) path = path.slice(basePath.length)
  const parts = path.replace(/\.svg$/, '').split('/').filter(Boolean)
  let cfg: LivatarConfig & { title?: string }
  if (parts.length === 1 && isCode(parts[0])) cfg = decode(parts[0])
  else if (parts.length >= 1 && styles[parts[0]]) cfg = { style: parts[0], seed: parts.slice(1).join('/') || undefined }
  else return null
  const q = url.searchParams
  const options: Record<string, unknown> = { ...cfg.options }
  for (const [k, v] of q) {
    if (!TOP.has(k)) options[k] = val(v)
  }
  if (q.get('mood') && MOODS.includes(q.get('mood') as Mood)) cfg.mood = q.get('mood') as Mood
  for (const k of ['shape', 'background', 'title'] as const) if (q.has(k)) (cfg as any)[k] = q.get(k) === 'none' ? false : q.get(k)
  for (const k of ['radius', 'scale', 'rotate'] as const) if (q.has(k)) cfg[k] = Number(q.get(k))
  for (const k of ['flip', 'gradient', 'border'] as const) if (q.has(k)) (cfg as any)[k] = q.get(k) !== 'false'
  const p = q.get('palette')
  if (p && p in palettes) cfg.palette = p as PaletteName
  cfg.options = options
  const size = q.has('size') ? Number(q.get('size')) : undefined
  return { cfg, size }
}

/** A fetch handler: (Request) => Response with an SVG avatar. */
export function avatarHandler(opts: HandlerOptions = {}): (req: Request) => Response {
  const max = opts.maxSize ?? 1024
  return (req) => {
    try {
      const parsed = parseAvatarUrl(new URL(req.url), opts.basePath)
      if (!parsed) return new Response('Not found. Try /<style>/<seed>.svg — styles: ' + Object.keys(styles).join(', '), { status: 404 })
      const size = parsed.size && isFinite(parsed.size) ? Math.max(8, Math.min(max, parsed.size)) : undefined
      const svg = render(parsed.cfg, { size, title: parsed.cfg.title ?? describe(parsed.cfg) })
      return new Response(svg, {
        headers: {
          'content-type': 'image/svg+xml; charset=utf-8',
          'cache-control': opts.cacheControl ?? 'public, max-age=31536000, immutable',
          'access-control-allow-origin': '*',
          'x-content-type-options': 'nosniff',
          'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'",
        },
      })
    } catch (e) {
      return new Response(String((e as Error).message), { status: 400 })
    }
  }
}
