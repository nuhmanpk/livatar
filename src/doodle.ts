/* ------------------------------------------------------------------ *
 *  Doodle engine: make ANY svg look hand-drawn while it draws itself.
 *  Every call is different — stroke order jitter, pace, wobble seed, and
 *  "line boil" (the wiggle of hand-drawn animation) are randomized.
 *
 *    doodle('<svg viewBox="0 0 24 24"><path d="…" fill="#333"/></svg>')
 *    doodle(svg, { loop: false, roughness: 1.4, seed: 42 })
 *
 *  Pure string → string. Works in <img>, READMEs, SSR. No JS at runtime.
 * ------------------------------------------------------------------ */

export interface DoodleOptions {
  /** Seconds for the whole sketch to draw. Default ~1.6–2.4 (random). */
  duration?: number
  /** Draw → hold → erase → redraw forever. Default true. */
  loop?: boolean
  /** Wobble amount relative to the drawing size. Default 1. */
  roughness?: number
  /** Rest on the finished drawing and re-sketch it every time the SVG is hovered (inline SVG only). Implies `loop: false`. */
  hover?: boolean
  /** Hand-drawn "line boil" jitter. Default true. */
  boil?: boolean
  /** Color in shapes after the outline is drawn. Default true. */
  fill?: boolean
  /** Fix the randomness (same seed ⇒ same drawing). Default: random each call. */
  seed?: number
  /** Stroke width in viewBox units. Default: 2% of the drawing size. */
  strokeWidth?: number
}

const SHAPE = /<(path|circle|rect|ellipse|polygon|polyline|line)\b([^>]*?)(\/?)>/g
let uid = 0

export function doodle(svg: string, o: DoodleOptions = {}): string {
  // seeded PRNG so `seed` gives repeatable doodles
  let s = (o.seed ?? Math.floor(Math.random() * 2 ** 31)) >>> 0 || 1
  const rnd = () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296)
  const r = (a: number, b: number) => a + rnd() * (b - a)

  const vb = /viewBox="([-\d.\s,]+)"/.exec(svg)?.[1].split(/[\s,]+/).map(Number) ?? [0, 0, 24, 24]
  const span = Math.max(vb[2], vb[3]) || 24
  const sw = o.strokeWidth ?? span * 0.022
  const rough = (o.roughness ?? 1) * span * 0.03
  const c = `ld${(uid++).toString(36)}${Math.floor(rnd() * 1e4).toString(36)}`
  const hover = o.hover === true
  const loop = !hover && o.loop !== false
  const draw = o.duration ?? r(1.6, 2.4)
  const total = loop ? draw / 0.55 : draw

  // annotate every shape with its own (random) start time and pace
  let i = 0
  const shapes: string[] = []
  const body = svg.replace(SHAPE, (_m, tag: string, attrs: string, close: string) => {
    const fill = /\sfill="([^"]*)"/.exec(attrs)?.[1]
    const stroke = /\sstroke="([^"]*)"/.exec(attrs)?.[1]
    const ink = stroke && stroke !== 'none' ? stroke : fill && fill !== 'none' ? fill : 'currentColor'
    const k = i++
    shapes.push(`.${c}s${k}{animation-delay:${r(0, 0.35).toFixed(2)}s;animation-duration:${(total * r(0.92, 1.08)).toFixed(2)}s}`)
    const clean = attrs.replace(/\s(stroke|stroke-width|pathLength|class)="[^"]*"/g, '')
    return `<${tag}${clean} stroke="${ink}" stroke-width="${sw.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" class="${c} ${c}s${k}"${close}>`
  })

  const drawEnd = loop ? 48 : 70
  const kf = loop
    ? `0%{stroke-dashoffset:1;fill-opacity:0;opacity:1}${drawEnd}%{stroke-dashoffset:0;fill-opacity:0}62%,86%{stroke-dashoffset:0;fill-opacity:${o.fill === false ? 0 : 1};opacity:1}96%,100%{stroke-dashoffset:0;fill-opacity:0;opacity:0}`
    : `0%{stroke-dashoffset:1;fill-opacity:0}${drawEnd}%{stroke-dashoffset:0;fill-opacity:0}100%{stroke-dashoffset:0;fill-opacity:${o.fill === false ? 0 : 1}}`

  // three slightly different wobble filters, flipped quickly = line boil
  const filters = [0, 1, 2]
    .map((n) => `<filter id="${c}f${n}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="${r(0.6, 1.1).toFixed(2)}" numOctaves="2" seed="${Math.floor(r(1, 999))}"/><feDisplacementMap in="SourceGraphic" scale="${(rough * r(0.8, 1.2)).toFixed(2)}" xChannelSelector="R" yChannelSelector="G"/></filter>`)
    .join('')
  const boilAnim = `animation:${c}b .42s steps(1) infinite`
  const boil = o.boil !== false
    ? `@keyframes ${c}b{0%{filter:url(#${c}f0)}33%{filter:url(#${c}f1)}66%{filter:url(#${c}f2)}}` + (hover ? `.${c}g{filter:url(#${c}f0)}svg:hover .${c}g{${boilAnim}}` : `.${c}g{${boilAnim}}`)
    : `.${c}g{filter:url(#${c}f0)}`
  const finalFill = o.fill === false ? 0 : 1
  const css =
    `@keyframes ${c}{${kf}}` +
    (hover
      // at rest: the finished drawing. On hover the animation is attached, so it restarts every time.
      ? `.${c}{stroke-dasharray:1;stroke-dashoffset:0;fill-opacity:${finalFill};animation-timing-function:cubic-bezier(.45,.05,.35,1);animation-iteration-count:1;animation-fill-mode:both}svg:hover .${c}{animation-name:${c}}`
      : `.${c}{stroke-dasharray:1;animation-name:${c};animation-timing-function:cubic-bezier(.45,.05,.35,1);animation-iteration-count:${loop ? 'infinite' : 1};animation-fill-mode:both}`) +
    shapes.join('') + boil +
    `@media (prefers-reduced-motion:reduce){.${c},.${c}g{animation:none!important;stroke-dashoffset:0;fill-opacity:1}}`

  return body.replace(/<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/, (_m, attrs: string, inner: string) => {
    // keep <title>/<style> outside the wobble group
    const head = (inner.match(/^(\s*<title>[\s\S]*?<\/title>)?/)?.[0] ?? '')
    return `<svg${attrs}>${head}<style>${css}</style><defs>${filters}</defs><g class="${c}g">${inner.slice(head.length)}</g></svg>`
  })
}
