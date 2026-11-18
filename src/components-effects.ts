'use client'
/* Aceternity / Magic UI style effects, powered by livatar avatars. Zero dependencies, inline styles,
 * every animation honours prefers-reduced-motion. Re-exported from livatar/components. */
import { createElement as h, useEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import { Livatar, type LivatarProps } from './react'
import type { Mood } from './core'

type AvatarProps = Omit<LivatarProps, 'ref'>
export interface Person { id: string; name?: string; role?: string; avatar?: AvatarProps }
const name = (p: Person) => p.name ?? p.id
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const still = { sleepAfter: 0, idle: false } as const
const face = (p: Person, size: number, avatar?: AvatarProps, mood?: Mood) =>
  h(Livatar, { seed: p.id, size, mood, ...avatar, ...p.avatar })
const card: CSSProperties = { borderRadius: 16, border: '1px solid var(--lv-line, rgba(127,127,127,.25))', background: 'var(--lv-surface, rgba(127,127,127,.08))', color: 'inherit' }

/* ---------------- AnimatedTooltip ---------------- */
export interface AnimatedTooltipProps { people: Person[]; size?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Overlapping faces; hovering one lifts it and shows a name/role tooltip. Hovered face smiles. */
export function LivatarAnimatedTooltip({ people, size = 48, avatar, className, style }: AnimatedTooltipProps): ReactElement {
  const [on, setOn] = useState<string | null>(null)
  return h('div', { className, role: 'group', style: { display: 'flex', alignItems: 'center', ...style } },
    people.map((p, i) => h('button', {
      key: p.id, type: 'button', 'aria-label': name(p) + (p.role ? `, ${p.role}` : ''),
      onPointerEnter: () => setOn(p.id), onPointerLeave: () => setOn(null), onFocus: () => setOn(p.id), onBlur: () => setOn(null),
      style: { all: 'unset', cursor: 'pointer', position: 'relative', marginLeft: i ? -size * 0.22 : 0, zIndex: on === p.id ? 99 : people.length - i, transition: 'transform .2s', transform: on === p.id ? 'translateY(-6px) scale(1.12) rotate(-4deg)' : 'none', lineHeight: 0, borderRadius: '50%', boxShadow: '0 0 0 2px var(--lv-ring, #fff)' },
    },
      on === p.id && h('span', { role: 'tooltip', style: { position: 'absolute', bottom: '115%', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', background: '#111', color: '#fff', borderRadius: 8, padding: '6px 10px', fontSize: 12, lineHeight: 1.3, textAlign: 'center', pointerEvents: 'none' } },
        h('b', { style: { display: 'block' } }, name(p)), p.role && h('span', { style: { opacity: .7 } }, p.role)),
      face(p, size, avatar, on === p.id ? 'happy' : undefined))))
}

/* ---------------- Dock ---------------- */
export interface DockProps { items: (Person & { onClick?: () => void })[]; size?: number; magnify?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** macOS-style floating dock: faces grow as the pointer approaches. */
export function LivatarDock({ items, size = 44, magnify = 1.7, avatar, className, style }: DockProps): ReactElement {
  const [x, setX] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const scaleOf = (i: number) => {
    if (x === null || !ref.current) return 1
    const slot = ref.current.children[i] as HTMLElement | undefined
    if (!slot) return 1
    const r = slot.getBoundingClientRect()
    const d = Math.abs(x - (r.left + r.width / 2))
    return 1 + (magnify - 1) * Math.max(0, 1 - d / (size * 2.5))
  }
  return h('div', { ref, className, role: 'toolbar', onPointerMove: (e: { clientX: number }) => setX(reduced() ? null : e.clientX), onPointerLeave: () => setX(null),
    style: { display: 'inline-flex', alignItems: 'flex-end', gap: 8, padding: '8px 12px', borderRadius: 20, ...card, backdropFilter: 'blur(10px)', ...style } },
    items.map((p, i) => h('button', { key: p.id, type: 'button', title: name(p), 'aria-label': name(p), onClick: p.onClick,
      style: { all: 'unset', cursor: 'pointer', lineHeight: 0, transformOrigin: 'bottom center', transition: 'transform .12s', transform: `scale(${scaleOf(i)})` } },
      face(p, size, avatar, x !== null && scaleOf(i) > 1.3 ? 'happy' : undefined))))
}

/* ---------------- TiltCard / SpotlightCard ---------------- */
export interface FxCardProps extends Omit<AvatarProps, 'title'> { title?: ReactNode; children?: ReactNode; className?: string; style?: CSSProperties }
/** 3D tilt card: tips toward the pointer, the avatar looks at you. */
export function LivatarTiltCard({ title, children, className, style, ...av }: FxCardProps): ReactElement {
  const [t, setT] = useState({ rx: 0, ry: 0 })
  return h('div', { className, style: { perspective: 800, ...style } },
    h('div', {
      onPointerMove: (e: { clientX: number; clientY: number; currentTarget: HTMLElement }) => { if (reduced()) return; const r = e.currentTarget.getBoundingClientRect(); setT({ ry: ((e.clientX - r.left) / r.width - .5) * 18, rx: -((e.clientY - r.top) / r.height - .5) * 18 }) },
      onPointerLeave: () => setT({ rx: 0, ry: 0 }),
      style: { ...card, padding: 20, display: 'grid', justifyItems: 'center', gap: 8, textAlign: 'center', transition: 'transform .15s', transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg)` } },
      h(Livatar, { size: 88, ...av }), title && h('strong', null, title), children))
}
/** Card with a radial spotlight that follows the pointer. */
export function LivatarSpotlightCard({ title, children, className, style, ...av }: FxCardProps): ReactElement {
  const [p, setP] = useState<{ x: number; y: number } | null>(null)
  return h('div', {
    className, onPointerMove: (e: { clientX: number; clientY: number; currentTarget: HTMLElement }) => { const r = e.currentTarget.getBoundingClientRect(); setP({ x: e.clientX - r.left, y: e.clientY - r.top }) }, onPointerLeave: () => setP(null),
    style: { ...card, position: 'relative', overflow: 'hidden', padding: 20, display: 'grid', justifyItems: 'center', gap: 8, textAlign: 'center', background: p ? `radial-gradient(180px circle at ${p.x}px ${p.y}px, rgba(120,140,255,.28), transparent 70%), var(--lv-surface, rgba(127,127,127,.08))` : card.background, ...style } },
    h(Livatar, { size: 80, mood: p ? 'happy' : undefined, ...av }), title && h('strong', null, title), children)
}

/* ---------------- Compare ---------------- */
export interface CompareProps { left: AvatarProps; right: AvatarProps; seed?: string; size?: number; initial?: number; className?: string; style?: CSSProperties }
/** Drag a divider to compare two looks (styles, moods, colours) of the same seed. */
export function LivatarCompare({ left, right, seed = 'livatar', size = 220, initial = 50, className, style }: CompareProps): ReactElement {
  const [v, setV] = useState(initial)
  return h('div', { className, style: { position: 'relative', width: size, height: size, borderRadius: 16, overflow: 'hidden', ...style } },
    h(Livatar, { seed, size, alive: still, ...right }),
    h('div', { style: { position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - v}% 0 0)` } }, h(Livatar, { seed, size, alive: still, ...left })),
    h('div', { 'aria-hidden': true, style: { position: 'absolute', top: 0, bottom: 0, left: `${v}%`, width: 3, marginLeft: -1.5, background: '#fff', boxShadow: '0 0 6px rgba(0,0,0,.4)', pointerEvents: 'none' } }),
    h('input', { type: 'range', min: 0, max: 100, value: v, 'aria-label': 'Compare', onChange: (e: { target: { value: string } }) => setV(+e.target.value), style: { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'ew-resize', margin: 0 } }))
}

/* ---------------- FocusCards ---------------- */
export interface FocusCardsProps { people: Person[]; size?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Hover one card and the rest blur out. */
export function LivatarFocusCards({ people, size = 84, avatar, className, style }: FocusCardsProps): ReactElement {
  const [on, setOn] = useState<string | null>(null)
  return h('div', { className, style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12, ...style } },
    people.map((p) => h('div', { key: p.id, tabIndex: 0, onPointerEnter: () => setOn(p.id), onPointerLeave: () => setOn(null), onFocus: () => setOn(p.id), onBlur: () => setOn(null),
      style: { ...card, padding: 16, display: 'grid', justifyItems: 'center', gap: 6, transition: 'filter .25s, transform .25s, opacity .25s', filter: on && on !== p.id ? 'blur(3px)' : 'none', opacity: on && on !== p.id ? .6 : 1, transform: on === p.id ? 'scale(1.04)' : 'none' } },
      face(p, size, avatar, on === p.id ? 'happy' : undefined), h('b', null, name(p)), p.role && h('small', { style: { opacity: .65 } }, p.role))))
}

/* ---------------- ExpandableCard ---------------- */
export interface ExpandableCardProps extends Omit<AvatarProps, 'title'> { title: ReactNode; subtitle?: ReactNode; children?: ReactNode; defaultOpen?: boolean; className?: string; style?: CSSProperties }
/** Click to expand; the avatar perks up when it opens. */
export function LivatarExpandableCard({ title, subtitle, children, defaultOpen = false, className, style, ...av }: ExpandableCardProps): ReactElement {
  const [open, setOpen] = useState(defaultOpen)
  return h('div', { className, style: { ...card, overflow: 'hidden', ...style } },
    h('button', { type: 'button', 'aria-expanded': open, onClick: () => setOpen(!open), style: { all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: 14, width: 'calc(100% - 28px)' } },
      h(Livatar, { size: 48, mood: open ? 'happy' : 'neutral', ...av }),
      h('span', { style: { display: 'grid', flex: 1 } }, h('b', null, title), subtitle && h('small', { style: { opacity: .65 } }, subtitle)),
      h('span', { 'aria-hidden': true, style: { transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' } }, '▾')),
    h('div', { style: { display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .25s' } }, h('div', { style: { overflow: 'hidden' } }, h('div', { style: { padding: '0 14px 14px' } }, children))))
}

/* ---------------- Bento ---------------- */
export interface BentoItem extends Person { span?: 1 | 2; body?: ReactNode }
export interface BentoProps { items: BentoItem[]; columns?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Bento grid: each tile has a face and wide tiles span two columns. */
export function LivatarBento({ items, columns = 3, avatar, className, style }: BentoProps): ReactElement {
  return h('div', { className, style: { display: 'grid', gridTemplateColumns: `repeat(${columns},1fr)`, gridAutoRows: 'minmax(130px,auto)', gap: 12, ...style } },
    items.map((p) => h('div', { key: p.id, style: { ...card, padding: 16, gridColumn: p.span === 2 ? 'span 2' : undefined, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8 } },
      face(p, 56, avatar), h('div', null, h('b', null, name(p)), p.body ? h('div', { style: { opacity: .7, fontSize: 13 } }, p.body) : p.role && h('div', { style: { opacity: .7, fontSize: 13 } }, p.role)))))
}

/* ---------------- Pointer ---------------- */
export interface PointerProps extends AvatarProps { children?: ReactNode; label?: string; className?: string; style?: CSSProperties }
/** A face that follows the cursor inside the area, with an optional name tag. Hides the native cursor. */
export function LivatarPointer({ children, label, className, style, ...av }: PointerProps): ReactElement {
  const [p, setP] = useState<{ x: number; y: number } | null>(null)
  return h('div', { className, onPointerMove: (e: { clientX: number; clientY: number; currentTarget: HTMLElement }) => { const r = e.currentTarget.getBoundingClientRect(); setP({ x: e.clientX - r.left, y: e.clientY - r.top }) }, onPointerLeave: () => setP(null),
    style: { position: 'relative', cursor: p ? 'none' : undefined, ...style } },
    children,
    p && h('span', { 'aria-hidden': true, style: { position: 'absolute', left: p.x, top: p.y, transform: 'translate(-30%,-30%)', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 4, zIndex: 50 } },
      h(Livatar, { size: 32, alive: still, mood: 'happy', ...av }), label && h('small', { style: { background: '#111', color: '#fff', borderRadius: 999, padding: '2px 8px' } }, label)))
}

/* ---------------- Orbit ---------------- */
export interface OrbitProps { center?: AvatarProps; people: Person[]; radius?: number; size?: number; duration?: number; reverse?: boolean; rings?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Faces orbiting a centre avatar across `rings` circles. The faces stay upright and fixed in themselves; only their position travels around the ring. */
export function LivatarOrbit({ center, people, radius = 90, size = 36, duration = 24, reverse = false, rings = 1, avatar, className, style }: OrbitProps): ReactElement {
  const R = radius * rings, box = R * 2 + size
  const ringOf = (i: number) => i % rings
  // shrink to fit narrow containers instead of being clipped
  const outer = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(1)
  useEffect(() => {
    const host = outer.current?.parentElement
    if (!host) return
    const on = () => setFit(Math.min(1, Math.max(0.2, host.clientWidth / box)))
    on()
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(on) : null
    ro?.observe(host)
    return () => ro?.disconnect()
  }, [box])
  return h('div', { ref: outer, className, style: { width: box * fit, height: box * fit, margin: '0 auto', ...style } }, h('div', { role: 'group', 'aria-label': `${people.length} people`, style: { position: 'relative', width: box, height: box, transform: `scale(${fit})`, transformOrigin: 'top left' } },
    // arm turns from --a to --a+360; the face counter-turns by exactly the same angle, so it never tilts
    h('style', null, '@keyframes lv-orb{from{transform:rotate(var(--a))}to{transform:rotate(calc(var(--a) + 360deg))}}@keyframes lv-orb-c{from{transform:rotate(calc(var(--a) * -1))}to{transform:rotate(calc(var(--a) * -1 - 360deg))}}@media (prefers-reduced-motion:reduce){.lv-orb,.lv-orb *{animation:none!important}}'),
    Array.from({ length: rings }, (_, r) => h('div', { key: 'ring' + r, 'aria-hidden': true, style: { position: 'absolute', left: '50%', top: '50%', width: radius * (r + 1) * 2, height: radius * (r + 1) * 2, transform: 'translate(-50%,-50%)', borderRadius: '50%', border: '1px dashed var(--lv-line, rgba(127,127,127,.3))' } })),
    h(Livatar, { size: size * 1.7, ...center, style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', ...(center?.style as object) } }),
    people.map((p, i) => {
      const k = ringOf(i), r = radius * (k + 1), idx = Math.floor(i / rings), per = Math.ceil(people.length / rings)
      const a = (idx / per) * 360 + k * 30 - 90
      const dur = duration * (1 + k * .5), dir = (k % 2 === 0) !== reverse ? 'normal' : 'reverse'
      return h('div', { key: p.id, className: 'lv-orb', style: { position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, ['--a' as string]: `${a}deg`, animation: `lv-orb ${dur}s linear infinite ${dir}` } },
        h('span', { style: { position: 'absolute', left: r - size / 2, top: -size / 2, display: 'block', lineHeight: 0 } },
          h('span', { className: 'lv-orb', style: { display: 'block', ['--a' as string]: `${a}deg`, animation: `lv-orb-c ${dur}s linear infinite ${dir}` } }, face(p, size, avatar))))
    })))
}

/* ---------------- Beam ---------------- */
export interface BeamProps { from: Person; to: Person; size?: number; width?: number; color?: string; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** An animated beam of light travelling between two avatars. The receiver lights up as it arrives. */
export function LivatarBeam({ from, to, size = 56, width = 260, color = '#7c8cff', avatar, className, style }: BeamProps): ReactElement {
  const [hit, setHit] = useState(false)
  useEffect(() => { if (reduced()) return; const t = setInterval(() => { setHit(true); setTimeout(() => setHit(false), 700) }, 2400); return () => clearInterval(t) }, [])
  const path = `M${size / 2} ${size / 2}Q${width / 2} ${size / 2 - 40} ${width - size / 2} ${size / 2}`
  return h('div', { className, style: { position: 'relative', width, height: size, ...style } },
    h('style', null, '@keyframes lv-beam{from{stroke-dashoffset:120}to{stroke-dashoffset:-240}}@media (prefers-reduced-motion:reduce){.lv-beam{animation:none!important}}'),
    h('svg', { 'aria-hidden': true, width, height: size, viewBox: `0 0 ${width} ${size}`, style: { position: 'absolute', inset: 0, overflow: 'visible' } },
      h('path', { d: path, fill: 'none', stroke: 'rgba(127,127,127,.3)', strokeWidth: 2 }),
      h('path', { className: 'lv-beam', d: path, fill: 'none', stroke: color, strokeWidth: 3, strokeLinecap: 'round', strokeDasharray: '40 320', style: { animation: 'lv-beam 2.4s linear infinite' } })),
    h('span', { style: { position: 'absolute', left: 0, top: 0, lineHeight: 0 } }, face(from, size, avatar)),
    h('span', { style: { position: 'absolute', right: 0, top: 0, lineHeight: 0 } }, face(to, size, avatar, hit ? 'starstruck' : undefined)))
}

/* ---------------- Globe ---------------- */
type LL = [number, number] // lon, lat
// coarse continent outlines (lon, lat): enough for a recognisable dotted world map
const LAND: LL[][] = [
  [[-168, 66], [-141, 70], [-95, 72], [-82, 69], [-80, 62], [-93, 59], [-82, 52], [-77, 57], [-65, 60], [-56, 52], [-66, 45], [-76, 38], [-81, 31], [-80, 25], [-90, 30], [-97, 27], [-97, 19], [-88, 21], [-88, 16], [-80, 8], [-86, 11], [-95, 16], [-106, 23], [-112, 29], [-115, 30], [-110, 23], [-117, 32], [-124, 40], [-124, 48], [-135, 58], [-152, 60], [-165, 55], [-158, 58]],
  [[-55, 60], [-45, 60], [-20, 70], [-20, 82], [-60, 82], [-73, 78]],
  [[-80, 8], [-72, 12], [-60, 10], [-50, 0], [-35, -5], [-38, -13], [-48, -26], [-58, -38], [-66, -46], [-69, -55], [-74, -50], [-72, -35], [-70, -18], [-81, -5]],
  [[-10, 36], [-9, 43], [-2, 44], [-4, 48], [2, 51], [8, 54], [10, 57], [5, 62], [15, 69], [30, 71], [40, 67], [40, 55], [30, 46], [28, 41], [22, 37], [12, 38], [8, 44], [3, 43], [-6, 36]],
  [[-17, 21], [-10, 30], [-6, 36], [10, 37], [32, 31], [35, 28], [43, 12], [51, 12], [40, -2], [40, -15], [33, -27], [20, -35], [12, -17], [9, -1], [9, 4], [-8, 4], [-17, 14]],
  [[28, 41], [40, 55], [40, 67], [60, 70], [80, 73], [110, 77], [140, 72], [170, 70], [180, 66], [160, 58], [142, 52], [135, 43], [122, 40], [121, 31], [109, 21], [106, 10], [100, 13], [98, 8], [104, 1], [98, 16], [92, 22], [80, 15], [77, 8], [73, 18], [67, 25], [57, 25], [48, 30], [56, 26], [60, 22], [52, 16], [43, 13], [35, 28], [32, 31], [34, 36]],
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [141, -38], [130, -32], [115, -34]],
  [[130, 31], [135, 34], [140, 36], [142, 42], [140, 45], [137, 38]], [[-5, 50], [1, 51], [-2, 56], [-5, 58], [-6, 55]], [[44, -25], [50, -15], [48, -13], [44, -17]],
  [[109, 1], [117, 7], [119, 1], [116, -4], [110, -3]], [[95, 5], [104, -2], [106, -6], [98, 2]], [[-180, -70], [180, -70], [180, -90], [-180, -90]],
]
const inPoly = (x: number, y: number, p: LL[]) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const [xi, yi] = p[i], [xj, yj] = p[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c } return c }
let DOTS: LL[] | null = null
const landDots = (): LL[] => {
  if (DOTS) return DOTS
  DOTS = []
  for (let lat = -84; lat <= 84; lat += 3.2) { const step = 3.2 / Math.max(.18, Math.cos((lat * Math.PI) / 180)); for (let lon = -180; lon < 180; lon += step) if (LAND.some((p) => inPoly(lon, lat, p))) DOTS.push([lon, lat]) }
  return DOTS
}
const CITIES: [number, number][] = [[40.7, -74], [51.5, 0], [35.7, 139.7], [-33.9, 151.2], [-23.5, -46.6], [28.6, 77.2], [1.3, 103.8], [-1.3, 36.8], [37.8, -122.4], [55.7, 37.6], [30, 31], [-34.6, -58.4]]
export interface GlobeProps { people: (Person & { lat?: number; lon?: number })[]; size?: number; pin?: number; speed?: number; ocean?: [string, string]; land?: string; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** A real rotating globe: dotted continents on a lit ocean sphere, with avatar pins standing on real city coordinates (override with `lat`/`lon`). Pins fade behind the horizon. */
export function LivatarGlobe({ people, size = 260, pin = 34, speed = 0.15, ocean = ['#4f8cff', '#0b1c55'], land = '#bfe0ff', avatar, className, style }: GlobeProps): ReactElement {
  const [rot, setRot] = useState(-20)
  const cv = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (reduced()) return
    let raf = 0, last = performance.now()
    const tick = (t: number) => { setRot((r) => (r + (t - last) * speed * 0.06) % 360); last = t; raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [speed])
  const R = size / 2
  const tilt = (20 * Math.PI) / 180
  // lon/lat (+ rotation) → screen x, y and depth z (z > 0 faces the viewer)
  const project = (lon: number, lat: number) => {
    const φ = (lat * Math.PI) / 180, λ = ((lon - rot) * Math.PI) / 180
    const x = Math.cos(φ) * Math.sin(λ), y0 = Math.sin(φ), z0 = Math.cos(φ) * Math.cos(λ)
    return { x, y: y0 * Math.cos(tilt) - z0 * Math.sin(tilt), z: y0 * Math.sin(tilt) + z0 * Math.cos(tilt) }
  }
  useEffect(() => {
    const c = cv.current, ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const dpr = Math.min(2, devicePixelRatio || 1)
    c.width = c.height = size * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, size, size)
    ctx.fillStyle = land
    for (const [lon, lat] of landDots()) { const p = project(lon, lat); if (p.z <= 0) continue; ctx.globalAlpha = .25 + p.z * .75; ctx.beginPath(); ctx.arc(R + p.x * R * .96, R - p.y * R * .96, 0.9 + p.z * 1.1, 0, 7); ctx.fill() }
    ctx.globalAlpha = .12; ctx.strokeStyle = '#fff'; ctx.lineWidth = .6 // graticule
    for (let lat = -60; lat <= 60; lat += 30) { ctx.beginPath(); let pen = false; for (let lon = -180; lon <= 180; lon += 6) { const p = project(lon, lat); if (p.z > 0) { const X = R + p.x * R * .96, Y = R - p.y * R * .96; pen ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); pen = true } else pen = false } ctx.stroke() }
    for (let lon = -180; lon < 180; lon += 30) { ctx.beginPath(); let pen = false; for (let lat = -90; lat <= 90; lat += 6) { const p = project(lon, lat); if (p.z > 0) { const X = R + p.x * R * .96, Y = R - p.y * R * .96; pen ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); pen = true } else pen = false } ctx.stroke() }
  }) // eslint-disable-line react-hooks/exhaustive-deps
  return h('div', { className, role: 'img', 'aria-label': `Globe with ${people.length} people`, style: { position: 'relative', width: size, height: size, margin: '0 auto', borderRadius: '50%', background: `radial-gradient(circle at 34% 28%, ${ocean[0]}, ${ocean[1]} 72%)`, boxShadow: `inset -${size * .08}px -${size * .08}px ${size * .2}px rgba(0,0,0,.5), 0 0 ${size * .12}px ${ocean[0]}66, 0 0 0 1px ${ocean[0]}55`, ...style } },
    h('canvas', { ref: cv, 'aria-hidden': true, style: { position: 'absolute', inset: 0, width: size, height: size, borderRadius: '50%' } }),
    h('span', { 'aria-hidden': true, style: { position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 30% 24%, rgba(255,255,255,.35), transparent 42%)', pointerEvents: 'none' } }),
    people.map((p, i) => {
      const [dlat, dlon] = CITIES[i % CITIES.length], g = project(p.lon ?? dlon, p.lat ?? dlat)
      return h('span', { key: p.id, title: name(p), style: { position: 'absolute', left: R + g.x * R * .96 - pin / 2, top: R - g.y * R * .96 - pin / 2, lineHeight: 0, opacity: g.z > .05 ? 1 : 0, transform: `scale(${.7 + g.z * .3})`, zIndex: g.z > 0 ? 2 : 0, pointerEvents: g.z > 0 ? 'auto' : 'none', borderRadius: '50%', boxShadow: '0 0 0 2px #fff, 0 3px 8px rgba(0,0,0,.4)' } }, face(p, pin, avatar, g.z > .7 ? 'happy' : undefined))
    }))
}
