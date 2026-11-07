/* ------------------------------------------------------------------ *
 *  livatar/icons — animated brand icons and badges as standalone SVG.
 *  The animation is CSS inside the SVG, so it also plays in <img>,
 *  GitHub READMEs, and markdown anywhere.
 *
 *    icon('github', { animation: 'wiggle', size: 32 })
 *    icon('kaggle', { tile: 'circle' })                 // white glyph on a brand-colored tile
 *    badge('npm', 'livatar', { animation: 'bounce' })   // pill badge with label
 * ------------------------------------------------------------------ */
import { ICONS, ICON_GROUPS } from './icons-data'
import { doodle, type DoodleOptions } from './doodle'

export { doodle, type DoodleOptions }

export { ICONS, ICON_GROUPS }

export const ANIMATIONS = ['doodle', 'none', 'bounce', 'wiggle', 'pulse', 'float', 'tada', 'heartbeat', 'jelly', 'spin', 'shake', 'glow', 'draw', 'walk', 'peek', 'rocket'] as const
export type IconAnimation = (typeof ANIMATIONS)[number]

export interface IconOptions {
  /** Pixel size (square). Default 24. */
  size?: number
  /** 'brand' (default), 'currentColor', or any color. */
  color?: string
  /** Default 'doodle' (hand-drawn, different every render). */
  animation?: IconAnimation
  /** 'loop' (default) plays forever with a rest between moves; 'hover' only while hovered (inline SVG only). */
  trigger?: 'loop' | 'hover'
  /** Seconds per cycle. Default depends on the animation. */
  duration?: number
  /** Put the glyph on a brand-colored tile. */
  tile?: 'none' | 'circle' | 'rounded' | 'square'
  /** Accessible name. Default: the brand title. */
  title?: string
}

const SAFE = /^[#\w(),.%\s-]+$/
const clean = (v: string, d: string) => (SAFE.test(v) ? v : d)
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

/** Keyframes per animation: [css keyframes body, default duration, transform-origin]. */
const MOTION: Record<Exclude<IconAnimation, 'none' | 'draw' | 'glow' | 'doodle' | 'walk'>, [string, number, string]> = {
  bounce: ['0%,40%,100%{transform:translateY(0)}12%{transform:translateY(-18%)}24%{transform:translateY(0)}31%{transform:translateY(-6%)}', 2.4, '50% 100%'],
  wiggle: ['0%,50%,100%{transform:rotate(0)}8%{transform:rotate(-14deg)}16%{transform:rotate(12deg)}24%{transform:rotate(-8deg)}32%{transform:rotate(5deg)}40%{transform:rotate(0)}', 2.6, '50% 60%'],
  pulse: ['0%,60%,100%{transform:scale(1)}25%{transform:scale(1.14)}', 2, '50% 50%'],
  float: ['0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-10%) rotate(-4deg)}', 3.2, '50% 50%'],
  tada: ['0%,55%,100%{transform:scale(1) rotate(0)}6%,12%{transform:scale(.9) rotate(-6deg)}18%,30%,42%{transform:scale(1.12) rotate(6deg)}24%,36%{transform:scale(1.12) rotate(-6deg)}', 2.8, '50% 50%'],
  heartbeat: ['0%,45%,100%{transform:scale(1)}10%{transform:scale(1.16)}20%{transform:scale(1)}30%{transform:scale(1.12)}', 1.8, '50% 50%'],
  jelly: ['0%,50%,100%{transform:scale(1,1)}10%{transform:scale(1.2,.82)}20%{transform:scale(.86,1.14)}30%{transform:scale(1.08,.94)}40%{transform:scale(.98,1.02)}', 2.4, '50% 100%'],
  spin: ['0%{transform:rotate(0)}100%{transform:rotate(360deg)}', 6, '50% 50%'],
  // pops up from below, looks left and right, ducks back down
  peek: ['0%,100%{transform:translateY(110%)}15%,85%{transform:translateY(0) rotate(0)}30%{transform:translateY(0) rotate(-12deg)}50%{transform:translateY(0) rotate(12deg)}65%{transform:translateY(0) rotate(0)}', 4, '50% 100%'],
  // lifts off with a wobble and lands again
  rocket: ['0%,100%{transform:translate(0,0) rotate(0)}10%{transform:translate(-3%,2%) rotate(-4deg)}20%{transform:translate(3%,2%) rotate(4deg)}45%{transform:translate(0,-130%) rotate(0)}46%{transform:translate(0,130%)}70%{transform:translate(0,0)}78%{transform:translate(0,-6%)}', 3.6, '50% 50%'],
  shake: ['0%,50%,100%{transform:translateX(0)}8%,24%,40%{transform:translateX(-7%)}16%,32%{transform:translateX(7%)}', 2.6, '50% 50%'],
}

let uid = 0

/** One animated brand icon as an SVG string. Unknown names throw. */
export function icon(name: string, opts: IconOptions = {}): string {
  const ic = ICONS[name]
  if (!ic) throw new Error(`livatar/icons: unknown icon "${name}"`)
  const [title, hex, path] = ic
  const size = Math.max(8, Math.min(1024, Number(opts.size) || 24))
  const anim = opts.animation ?? 'doodle'
  // the doodle engine sketches the finished icon (tile included), randomly each time
  if (anim === 'doodle') return doodle(icon(name, { ...opts, animation: 'none' }), { duration: opts.duration, hover: opts.trigger === 'hover' })
  const tile = opts.tile ?? 'none'
  const brand = '#' + hex
  const fill = tile !== 'none' ? '#fff' : opts.color == null || opts.color === 'brand' ? brand : clean(opts.color, brand)
  const c = `lvi${(uid++).toString(36)}`
  const hover = opts.trigger === 'hover'
  const label = esc(opts.title ?? title)

  let css = ''
  let glyphAttrs = `fill="${fill}"`
  if (anim === 'draw') {
    const d = opts.duration ?? 3
    css =
      `@keyframes ${c}{0%{stroke-dashoffset:1;fill-opacity:0}45%{stroke-dashoffset:0;fill-opacity:0}60%,100%{stroke-dashoffset:0;fill-opacity:1}}` +
      `.${c}{stroke:${fill};stroke-width:.4;stroke-dasharray:1;animation:${c} ${d}s ease-in-out ${hover ? '1 both' : 'infinite alternate'}}`
    glyphAttrs += ` pathLength="1"`
  } else if (anim === 'walk') {
    // little legs walk it in from the left, it stops, hops, and waits
    const d = opts.duration ?? 5
    css =
      `@keyframes ${c}{0%{transform:translateX(-140%)}40%{transform:translateX(0)}46%{transform:translate(0,-12%)}52%,88%{transform:translate(0,0)}100%{transform:translateX(160%)}}` +
      `@keyframes ${c}b{0%,100%{transform:translateY(0)}50%{transform:translateY(-4%)}}` +
      `@keyframes ${c}l{0%,100%{transform:rotate(22deg)}50%{transform:rotate(-22deg)}}@keyframes ${c}r{0%,100%{transform:rotate(-22deg)}50%{transform:rotate(22deg)}}` +
      `.${c}m{animation:${c} ${d}s ease-in-out infinite}.${c}{transform-box:fill-box;animation:${c}b .32s ease-in-out infinite}` +
      `.${c}L,.${c}R{transform-box:fill-box;transform-origin:50% 0}.${c}L{animation:${c}l .32s ease-in-out infinite}.${c}R{animation:${c}r .32s ease-in-out infinite}`
  } else if (anim === 'glow') {
    const d = opts.duration ?? 2.4
    css = `@keyframes ${c}{0%,100%{filter:drop-shadow(0 0 0 ${fill})}50%{filter:drop-shadow(0 0 1.6px ${fill})}}.${c}{animation:${c} ${d}s ease-in-out infinite}`
  } else if (anim !== 'none') {
    const [kf, dur, origin] = MOTION[anim]
    css = `@keyframes ${c}{${kf}}.${c}{transform-box:fill-box;transform-origin:${origin};animation:${c} ${opts.duration ?? dur}s ${anim === 'spin' ? 'linear' : 'ease-in-out'} infinite}`
  }
  if (css && hover) css += `.${c}{animation-play-state:paused}svg:hover .${c}{animation-play-state:running}`
  if (css) css += `@media (prefers-reduced-motion:reduce){.${c}{animation:none}}`

  const legs = anim === 'walk'
  const pad = tile === 'none' ? (legs ? 3 : 0) : 5
  const vb = 24 + pad * 2
  const bg =
    tile === 'circle'
      ? `<circle cx="${vb / 2}" cy="${vb / 2}" r="${vb / 2}" fill="${brand}"/>`
      : tile === 'rounded'
        ? `<rect width="${vb}" height="${vb}" rx="8" fill="${brand}"/>`
        : tile === 'square'
          ? `<rect width="${vb}" height="${vb}" fill="${brand}"/>`
          : ''
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${vb} ${vb}" width="${size}" height="${size}" role="img" aria-label="${label}">` +
    `<title>${label}</title>` +
    (css ? `<style>${css}</style>` : '') +
    (bg ? `<g transform="translate(${-pad} ${-pad})">${bg}</g>` : '') +
    (legs
      ? `<g class="${c}m"><g class="${c}L"><path d="M8.5 22v4.5h-2" stroke="#1f1a2e" stroke-width="1.4" fill="none" stroke-linecap="round"/></g><g class="${c}R"><path d="M15.5 22v4.5h2" stroke="#1f1a2e" stroke-width="1.4" fill="none" stroke-linecap="round"/></g><g class="${c}"><path d="${path}" ${glyphAttrs}/></g></g></svg>`
      : `<g class="${c}"><path d="${path}" ${glyphAttrs}/></g></svg>`)
  )
}

export interface BadgeOptions extends Omit<IconOptions, 'tile' | 'size'> {
  /** Badge height in px. Default 28. */
  height?: number
  /** 'brand' (brand-colored), 'dark', or 'light'. Default 'brand'. */
  theme?: 'brand' | 'dark' | 'light'
}

/** Approximate text width for system UI fonts at 12px (good enough for a pill). */
const textWidth = (s: string) => [...s].reduce((w, ch) => w + (/[ilj.,:;|!'1]/.test(ch) ? 3.6 : /[mwMW@]/.test(ch) ? 10 : /[A-Z0-9#]/.test(ch) ? 8 : 6.8), 0)

/** A pill badge: animated icon + label. `badge('github', 'Star on GitHub')`. */
export function badge(name: string, label: string, opts: BadgeOptions = {}): string {
  const ic = ICONS[name]
  if (!ic) throw new Error(`livatar/icons: unknown icon "${name}"`)
  const [title, hex] = ic
  const theme = opts.theme ?? 'brand'
  const brand = '#' + hex
  const lum = (() => {
    const v = parseInt(hex, 16)
    return (0.2126 * ((v >> 16) & 255) + 0.7152 * ((v >> 8) & 255) + 0.0722 * (v & 255)) / 255
  })()
  const bg = theme === 'dark' ? '#1f1a2e' : theme === 'light' ? '#ffffff' : brand
  const fg = theme === 'light' ? '#1f1a2e' : theme === 'dark' ? '#ffffff' : lum > 0.6 ? '#1f1a2e' : '#ffffff'
  const iconColor = theme === 'brand' ? fg : theme === 'dark' && lum < 0.25 ? '#ffffff' : brand
  const H = 28
  const text = esc(label)
  const w = Math.ceil(10 + 16 + 7 + textWidth(label) + 12)
  const height = Math.max(12, Math.min(200, Number(opts.height) || H))
  const glyph = icon(name, { ...opts, size: 16, color: iconColor, title: opts.title ?? title })
    .replace('<svg ', `<svg x="10" y="6" `)
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${H}" width="${Math.round((w * height) / H)}" height="${height}" role="img" aria-label="${text}">` +
    `<title>${text}</title>` +
    `<rect width="${w}" height="${H}" rx="${H / 2}" fill="${bg}"${theme === 'light' ? ' stroke="#e3ddd3"' : ''}/>` +
    glyph +
    `<text x="33" y="18.5" fill="${fg}" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Helvetica,Arial,sans-serif" font-size="12" font-weight="600">${text}</text>` +
    `</svg>`
  )
}

/** Data URI for <img src>. */
export const iconUri = (name: string, opts?: IconOptions) => 'data:image/svg+xml;utf8,' + encodeURIComponent(icon(name, opts))
