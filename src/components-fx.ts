'use client'
/* More Magic UI / Aceternity style effects with livatar faces: beams, meteors, particles, clouds, lenses.
 * Zero dependencies, inline styles, every motion honours prefers-reduced-motion. Re-exported from livatar/components. */
import { createElement as h, useEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import { Livatar, type LivatarProps } from './react'
import type { Mood } from './core'

type AvatarProps = Omit<LivatarProps, 'ref'>
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const still = { sleepAfter: 0, idle: false } as const
const f = (seed: string, size: number, mood?: Mood, avatar?: AvatarProps) => h(Livatar, { seed, size, mood, alive: still, ...avatar })
const line = 'var(--lv-line, rgba(127,127,127,.28))'
const surface = 'var(--lv-surface, rgba(127,127,127,.08))'
const SEEDS = ['ada', 'bob', 'cy', 'dee', 'eli', 'fay', 'gus', 'hal', 'ivy', 'jo']

/** Rolling animation clock (ms) for rAF-driven effects; frozen under reduced motion. */
function useClock(): number {
  const [t, setT] = useState(0)
  useEffect(() => { if (reduced()) return; let raf = 0; const loop = (n: number) => { setT(n); raf = requestAnimationFrame(loop) }; raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf) }, [])
  return t
}

/* ---------------- BeamNetwork ---------------- */
export interface BeamNetworkProps { center: string; people: string[]; width?: number; height?: number; size?: number; color?: string; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Hub and spokes: beams of light travel from many faces into one (Magic UI "animated beam" with several sources). */
export function LivatarBeamNetwork({ center, people, width = 340, height = 260, size = 44, color = '#7c8cff', avatar, className, style }: BeamNetworkProps): ReactElement {
  const cx = width / 2, cy = height / 2, n = people.length
  const pos = people.map((_, i) => { const side = i % 2, row = Math.floor(i / 2), rows = Math.ceil(n / 2); return { x: side ? width - size / 2 : size / 2, y: rows === 1 ? cy : size / 2 + (row / (rows - 1)) * (height - size) } })
  return h('div', { className, role: 'group', 'aria-label': `${n} sources into ${center}`, style: { position: 'relative', width, height, ...style } },
    h('style', null, '@keyframes lv-bn{from{stroke-dashoffset:90}to{stroke-dashoffset:-90}}@media (prefers-reduced-motion:reduce){.lv-bn{animation:none!important}}'),
    h('svg', { 'aria-hidden': true, width, height, style: { position: 'absolute', inset: 0 } },
      pos.map((p, i) => { const d = `M${p.x} ${p.y}Q${(p.x + cx) / 2} ${cy + (p.y < cy ? -30 : 30)} ${cx} ${cy}`
        return [h('path', { key: 'b' + i, d, fill: 'none', stroke: 'rgba(127,127,127,.3)', strokeWidth: 2 }), h('path', { key: 'a' + i, className: 'lv-bn', d, fill: 'none', stroke: color, strokeWidth: 3, strokeLinecap: 'round', strokeDasharray: '30 150', style: { animation: `lv-bn ${2 + (i % 3) * .5}s linear ${i * .3}s infinite` } })] })),
    pos.map((p, i) => h('span', { key: people[i], style: { position: 'absolute', left: p.x - size / 2, top: p.y - size / 2, lineHeight: 0 } }, f(people[i], size, undefined, avatar))),
    h('span', { style: { position: 'absolute', left: cx - size * .8, top: cy - size * .8, lineHeight: 0, borderRadius: '50%', boxShadow: `0 0 0 4px ${color}55` } }, f(center, size * 1.6, 'happy', avatar)))
}

/* ---------------- BorderBeam ---------------- */
export interface BorderBeamProps extends Omit<AvatarProps, 'title'> { title?: ReactNode; children?: ReactNode; duration?: number; color?: string; className?: string; style?: CSSProperties }
/** A card with a spot of light racing around its border. */
export function LivatarBorderBeam({ title, children, duration = 5, color = '#7c8cff', className, style, ...av }: BorderBeamProps): ReactElement {
  return h('div', { className, style: { position: 'relative', borderRadius: 18, padding: 2, overflow: 'hidden', ...style } },
    h('style', null, '@property --lv-a{syntax:"<angle>";inherits:false;initial-value:0deg}@keyframes lv-bb{to{--lv-a:360deg}}@media (prefers-reduced-motion:reduce){.lv-bb{animation:none!important}}'),
    h('span', { 'aria-hidden': true, className: 'lv-bb', style: { position: 'absolute', inset: 0, background: `conic-gradient(from var(--lv-a), transparent 0 70%, ${color} 90%, transparent)`, animation: `lv-bb ${duration}s linear infinite` } }),
    h('div', { style: { position: 'relative', borderRadius: 16, background: 'var(--lv-bg,#fff)', color: 'var(--lv-fg,#1f1a2e)', padding: 20, display: 'grid', justifyItems: 'center', gap: 8, textAlign: 'center' } },
      h(Livatar, { size: 80, mood: 'happy', alive: still, ...av }), title && h('b', null, title), children))
}

/* ---------------- Meteors ---------------- */
export interface MeteorsProps { seeds?: string[]; count?: number; size?: number; height?: number; avatar?: AvatarProps; children?: ReactNode; className?: string; style?: CSSProperties }
/** Faces streak diagonally across a panel like meteors, with a glowing tail. */
export function LivatarMeteors({ seeds = SEEDS, count = 10, size = 26, height = 220, avatar, children, className, style }: MeteorsProps): ReactElement {
  return h('div', { className, style: { position: 'relative', overflow: 'hidden', height, borderRadius: 14, background: '#0c1024', color: '#fff', ...style } },
    h('style', null, '@keyframes lv-met{from{transform:translate(0,0);opacity:0}10%{opacity:1}to{transform:translate(-420px,420px);opacity:0}}@media (prefers-reduced-motion:reduce){.lv-met{animation:none!important;opacity:.6}}'),
    Array.from({ length: count }, (_, i) => h('span', { key: i, className: 'lv-met', 'aria-hidden': true, style: { position: 'absolute', top: -size, left: `${20 + ((i * 53) % 90)}%`, lineHeight: 0, animation: `lv-met ${2.4 + (i % 4) * .6}s linear ${-(i * 0.9) % 5}s infinite` } },
      h('span', { style: { position: 'absolute', right: size / 2, top: -size * 2.4, width: 2, height: size * 3, background: 'linear-gradient(to top, rgba(255,255,255,.7), transparent)', transform: 'rotate(45deg)', transformOrigin: 'bottom' } }), f(seeds[i % seeds.length] + (i >= seeds.length ? i : ''), size, 'surprised', avatar))),
    h('div', { style: { position: 'relative', height: '100%', display: 'grid', placeItems: 'center' } }, children))
}

/* ---------------- Pulse (concentric ripples) ---------------- */
export interface PulseProps { center: string; people?: string[]; rings?: number; gap?: number; size?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Magic UI style ripple: concentric rings pulse out from a central face, with faces riding the rings. */
export function LivatarPulse({ center, people = SEEDS.slice(0, 6), rings = 3, gap = 52, size = 30, avatar, className, style }: PulseProps): ReactElement {
  const box = (rings + 1) * gap * 2
  return h('div', { className, style: { position: 'relative', width: box, height: box, ...style } },
    h('style', null, '@keyframes lv-pulse{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.06)}}@media (prefers-reduced-motion:reduce){.lv-pulse{animation:none!important}}'),
    Array.from({ length: rings }, (_, r) => h('span', { key: r, className: 'lv-pulse', 'aria-hidden': true, style: { position: 'absolute', left: '50%', top: '50%', width: (r + 1) * gap * 2, height: (r + 1) * gap * 2, borderRadius: '50%', border: `1px solid ${line}`, background: `rgba(127,127,127,${.07 - r * .018})`, transform: 'translate(-50%,-50%)', animation: `lv-pulse 3.2s ease-in-out ${-r * .35}s infinite both` } })), // negative delay + base transform: rings are centred from the very first frame
    people.map((p, i) => { const r = (i % rings) + 1, a = (i / people.length) * Math.PI * 2 + r; return h('span', { key: p, style: { position: 'absolute', left: box / 2 + Math.cos(a) * r * gap - size / 2, top: box / 2 + Math.sin(a) * r * gap - size / 2, lineHeight: 0 } }, f(p, size, undefined, avatar)) }),
    h('span', { style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', lineHeight: 0 } }, f(center, gap * .9, 'happy', avatar)))
}

/* ---------------- Particles ---------------- */
export interface ParticlesProps { seeds?: string[]; count?: number; size?: number; height?: number; repel?: number; avatar?: AvatarProps; children?: ReactNode; className?: string; style?: CSSProperties }
/** Small faces drift around and get pushed away by the pointer. */
export function LivatarParticles({ seeds = SEEDS, count = 16, size = 26, height = 220, repel = 70, avatar, children, className, style }: ParticlesProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null); const ptr = useRef<{ x: number; y: number } | null>(null)
  const ps = useRef(Array.from({ length: count }, (_, i) => ({ x: (i * 67) % 320, y: (i * 41) % height, vx: ((i % 5) - 2) * .15, vy: ((i % 3) - 1) * .15 })))
  const t = useClock()
  const W = ref.current?.clientWidth ?? 340
  ps.current.forEach((p) => {
    if (reduced()) return
    if (ptr.current) { const dx = p.x - ptr.current.x, dy = p.y - ptr.current.y, d = Math.hypot(dx, dy); if (d < repel && d > 0) { p.vx += (dx / d) * .6; p.vy += (dy / d) * .6 } }
    p.vx *= .97; p.vy *= .97; p.x += p.vx + Math.sin(t / 900 + p.y) * .1; p.y += p.vy + Math.cos(t / 1100 + p.x) * .1
    if (p.x < 0 || p.x > W - size) p.vx *= -1, p.x = Math.min(W - size, Math.max(0, p.x)); if (p.y < 0 || p.y > height - size) p.vy *= -1, p.y = Math.min(height - size, Math.max(0, p.y))
  })
  return h('div', { ref, className, onPointerMove: (e: { clientX: number; clientY: number; currentTarget: HTMLElement }) => { const r = e.currentTarget.getBoundingClientRect(); ptr.current = { x: e.clientX - r.left, y: e.clientY - r.top } }, onPointerLeave: () => { ptr.current = null },
    style: { position: 'relative', overflow: 'hidden', height, border: `1px solid ${line}`, borderRadius: 14, background: surface, ...style } },
    ps.current.map((p, i) => h('span', { key: i, 'aria-hidden': true, style: { position: 'absolute', left: p.x, top: p.y, lineHeight: 0, opacity: .85 } }, f(seeds[i % seeds.length] + (i >= seeds.length ? i : ''), size, undefined, avatar))),
    h('div', { style: { position: 'relative', height: '100%', display: 'grid', placeItems: 'center', pointerEvents: 'none' } }, children))
}

/* ---------------- Aura ---------------- */
export interface AuraProps extends Omit<AvatarProps, 'title'> { colors?: string[]; spin?: number; className?: string; style?: CSSProperties }
/** A face with a spinning rainbow aura ring, brighter on hover. */
export function LivatarAura({ colors = ['#ff6b9a', '#ffd23f', '#3ec1ff', '#a66bff', '#ff6b9a'], spin = 4, size = 96, className, style, ...av }: AuraProps): ReactElement {
  const [on, setOn] = useState(false)
  const px = typeof size === 'number' ? size : 96
  return h('span', { className, onPointerEnter: () => setOn(true), onPointerLeave: () => setOn(false), style: { position: 'relative', display: 'inline-grid', placeItems: 'center', width: px + 24, height: px + 24, ...style } },
    h('style', null, '@keyframes lv-aura{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.lv-aura{animation:none!important}}'),
    h('span', { 'aria-hidden': true, className: 'lv-aura', style: { position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(${colors.join(',')})`, filter: `blur(${on ? 10 : 6}px)`, opacity: on ? 1 : .7, transition: 'filter .3s, opacity .3s', animation: `lv-aura ${spin}s linear infinite` } }),
    h('span', { style: { position: 'relative', lineHeight: 0, borderRadius: '50%', boxShadow: '0 0 0 4px var(--lv-bg,#fff)' } }, h(Livatar, { size: px, mood: on ? 'starstruck' : 'happy', alive: still, ...av })))
}

/* ---------------- Marquee3D ---------------- */
export interface Marquee3DProps { seeds?: string[]; columns?: number; size?: number; height?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Columns of faces scrolling in opposite directions on a tilted 3D plane. */
export function LivatarMarquee3D({ seeds = SEEDS, columns = 4, size = 52, height = 240, avatar, className, style }: Marquee3DProps): ReactElement {
  return h('div', { className, style: { height, overflow: 'hidden', perspective: 600, display: 'flex', justifyContent: 'center', ...style } },
    h('style', null, '@keyframes lv-m3{to{transform:translateY(-50%)}}@keyframes lv-m3r{from{transform:translateY(-50%)}to{transform:translateY(0)}}@media (prefers-reduced-motion:reduce){.lv-m3{animation:none!important}}'),
    h('div', { style: { display: 'flex', gap: 12, transform: 'rotateX(35deg) rotateZ(-18deg) scale(1.15)', transformStyle: 'preserve-3d' } },
      Array.from({ length: columns }, (_, c) => h('div', { key: c, className: 'lv-m3', style: { display: 'flex', flexDirection: 'column', gap: 12, animation: `${c % 2 ? 'lv-m3r' : 'lv-m3'} ${16 + c * 3}s linear infinite` } },
        [0, 1].map((k) => h('div', { key: k, 'aria-hidden': k === 1 || undefined, style: { display: 'flex', flexDirection: 'column', gap: 12 } }, seeds.map((s, i) => h('span', { key: s + i, style: { lineHeight: 0 } }, f(s + c, size, undefined, avatar)))))))))
}

/* ---------------- SphereCloud ---------------- */
export interface SphereCloudProps { seeds?: string[]; size?: number; radius?: number; speed?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Faces spread over a slowly rotating 3D sphere (a tag cloud). Move the pointer to steer it. */
export function LivatarSphereCloud({ seeds = SEEDS.concat(SEEDS.map((s) => s + '2')), size = 40, radius = 110, speed = 1, avatar, className, style }: SphereCloudProps): ReactElement {
  const t = useClock(); const [d, setD] = useState({ x: 0, y: 0 })
  const n = seeds.length, rotY = (t / 40) * speed + d.x * 90, rotX = d.y * 40
  const R = radius + size / 2
  return h('div', { className, onPointerMove: (e: { clientX: number; clientY: number; currentTarget: HTMLElement }) => { const r = e.currentTarget.getBoundingClientRect(); setD({ x: (e.clientX - r.left) / r.width - .5, y: (e.clientY - r.top) / r.height - .5 }) }, onPointerLeave: () => setD({ x: 0, y: 0 }), role: 'group', 'aria-label': `${n} people`,
    style: { position: 'relative', width: R * 2, height: R * 2, ...style } },
    seeds.map((s, i) => {
      const phi = Math.acos(1 - (2 * (i + .5)) / n), th = Math.PI * (1 + Math.sqrt(5)) * (i + .5)
      let x = Math.cos(th) * Math.sin(phi), y = Math.cos(phi), z = Math.sin(th) * Math.sin(phi)
      const ay = (rotY * Math.PI) / 180, ax = (rotX * Math.PI) / 180
      const x1 = x * Math.cos(ay) + z * Math.sin(ay), z1 = -x * Math.sin(ay) + z * Math.cos(ay), y2 = y * Math.cos(ax) - z1 * Math.sin(ax), z2 = y * Math.sin(ax) + z1 * Math.cos(ax)
      return h('span', { key: s, style: { position: 'absolute', left: R + x1 * radius - size / 2, top: R + y2 * radius - size / 2, lineHeight: 0, transform: `scale(${.55 + (z2 + 1) * .3})`, opacity: .35 + (z2 + 1) * .33, zIndex: Math.round((z2 + 1) * 10) } }, f(s, size, z2 > .6 ? 'happy' : undefined, avatar))
    }))
}

/* ---------------- Lens ---------------- */
export interface LensProps { seeds?: string[]; size?: number; zoom?: number; lens?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** A magnifying lens follows the pointer over a field of small faces and reveals them large. */
export function LivatarLens({ seeds = SEEDS, size = 28, zoom = 2.4, lens = 90, avatar, className, style }: LensProps): ReactElement {
  const [p, setP] = useState<{ x: number; y: number } | null>(null)
  const field = (s: number) => h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(6, ${size * s}px)`, gap: 8 * s, padding: 12 * s, width: 'max-content' } }, Array.from({ length: 24 }, (_, i) => h('span', { key: i, style: { lineHeight: 0 } }, f(seeds[i % seeds.length] + (i >= seeds.length ? i : ''), size * s, undefined, avatar))))
  return h('div', { className, onPointerMove: (e: { clientX: number; clientY: number; currentTarget: HTMLElement }) => { const r = e.currentTarget.getBoundingClientRect(); setP({ x: e.clientX - r.left, y: e.clientY - r.top }) }, onPointerLeave: () => setP(null),
    style: { position: 'relative', overflow: 'hidden', cursor: p ? 'none' : 'default', width: 'max-content', border: `1px solid ${line}`, borderRadius: 14, background: surface, ...style } },
    field(1),
    p && h('div', { 'aria-hidden': true, style: { position: 'absolute', left: p.x - lens / 2, top: p.y - lens / 2, width: lens, height: lens, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 0 3px #fff, 0 6px 20px rgba(0,0,0,.35)', background: 'var(--lv-bg,#fff)', pointerEvents: 'none' } },
      h('div', { style: { position: 'absolute', left: -p.x * zoom + lens / 2, top: -p.y * zoom + lens / 2 } }, field(zoom))))
}

/* ---------------- ProximityGrid ---------------- */
export interface ProximityGridProps { seeds?: string[]; columns?: number; rows?: number; size?: number; reach?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** A grid of faces that swell and smile as the pointer approaches. */
export function LivatarProximityGrid({ seeds = SEEDS, columns = 8, rows = 4, size = 34, reach = 110, avatar, className, style }: ProximityGridProps): ReactElement {
  const [p, setP] = useState<{ x: number; y: number } | null>(null); const gap = 10, cell = size + gap
  return h('div', { className, onPointerMove: (e: { clientX: number; clientY: number; currentTarget: HTMLElement }) => { const r = e.currentTarget.getBoundingClientRect(); setP({ x: e.clientX - r.left, y: e.clientY - r.top }) }, onPointerLeave: () => setP(null),
    style: { position: 'relative', width: columns * cell + gap, height: rows * cell + gap, ...style } },
    Array.from({ length: columns * rows }, (_, i) => { const c = i % columns, r = Math.floor(i / columns), cx = gap + c * cell + size / 2, cy = gap + r * cell + size / 2
      const near = !p || reduced() ? 0 : Math.max(0, 1 - Math.hypot(p.x - cx, p.y - cy) / reach)
      return h('span', { key: i, style: { position: 'absolute', left: gap + c * cell, top: gap + r * cell, lineHeight: 0, transition: 'transform .12s', transform: `scale(${1 + near * .9})`, zIndex: Math.round(near * 10), opacity: p ? .45 + near * .55 : .85 } }, f(seeds[i % seeds.length] + (i >= seeds.length ? i : ''), size, near > .55 ? 'happy' : undefined, avatar)) }))
}

/* ---------------- TracingBeam ---------------- */
export interface TracingBeamProps { items: { id: string; title: ReactNode; body?: ReactNode }[]; size?: number; color?: string; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** A vertical story where a beam fills down the line as you scroll, lighting up each face it passes. */
export function LivatarTracingBeam({ items, size = 40, color = '#7c8cff', avatar, className, style }: TracingBeamProps): ReactElement {
  const ref = useRef<HTMLOListElement>(null); const [pct, setPct] = useState(0)
  useEffect(() => {
    const on = () => { const el = ref.current; if (!el) return; const r = el.getBoundingClientRect(), vh = innerHeight; setPct(Math.max(0, Math.min(1, (vh * .7 - r.top) / (r.height * .8)))) }
    on(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])
  return h('ol', { ref, className, style: { listStyle: 'none', margin: 0, padding: 0, position: 'relative', ...style } },
    h('span', { 'aria-hidden': true, style: { position: 'absolute', left: size / 2 - 1.5, top: size / 2, bottom: size / 2, width: 3, background: line, borderRadius: 2 } }),
    h('span', { 'aria-hidden': true, style: { position: 'absolute', left: size / 2 - 1.5, top: size / 2, height: `calc((100% - ${size}px) * ${pct})`, width: 3, background: color, borderRadius: 2, boxShadow: `0 0 8px ${color}` } }),
    items.map((it, i) => { const lit = pct >= i / Math.max(1, items.length - 1) - .02
      return h('li', { key: it.id, style: { display: 'flex', gap: 14, paddingBottom: 30, position: 'relative' } },
        h('span', { style: { display: 'grid', placeItems: 'center', width: size, height: size, lineHeight: 0, flex: 'none', borderRadius: '50%', overflow: 'hidden', background: 'var(--lv-bg,#fff)', transition: 'transform .3s, filter .3s, box-shadow .3s', transform: lit ? 'scale(1)' : 'scale(.88)', filter: lit ? 'none' : 'grayscale(1) opacity(.6)', boxShadow: lit ? `0 0 0 3px ${color}, 0 0 14px ${color}88` : `0 0 0 2px ${line}` } }, f(it.id, size, lit ? 'happy' : 'sleepy', avatar)),
        h('div', { style: { opacity: lit ? 1 : .5, transition: 'opacity .3s' } }, h('b', null, it.title), it.body && h('div', { style: { opacity: .75, fontSize: 14 } }, it.body))) }))
}

/* ---------------- Parallax ---------------- */
export interface ParallaxProps { seeds?: string[]; height?: number; strength?: number; avatar?: AvatarProps; children?: ReactNode; className?: string; style?: CSSProperties }
/** Floating faces at different depths that shift against each other as the pointer moves (parallax hero). */
export function LivatarParallax({ seeds = SEEDS.slice(0, 8), height = 240, strength = 28, avatar, children, className, style }: ParallaxProps): ReactElement {
  const [d, setD] = useState({ x: 0, y: 0 })
  return h('div', { className, onPointerMove: (e: { clientX: number; clientY: number; currentTarget: HTMLElement }) => { if (reduced()) return; const r = e.currentTarget.getBoundingClientRect(); setD({ x: (e.clientX - r.left) / r.width - .5, y: (e.clientY - r.top) / r.height - .5 }) }, onPointerLeave: () => setD({ x: 0, y: 0 }),
    style: { position: 'relative', overflow: 'hidden', height, border: `1px solid ${line}`, borderRadius: 14, background: surface, ...style } },
    seeds.map((s, i) => { const depth = .4 + (i % 4) * .35, sz = 24 + depth * 26
      return h('span', { key: s, 'aria-hidden': true, style: { position: 'absolute', left: `${8 + ((i * 37) % 82)}%`, top: `${6 + ((i * 53) % 78)}%`, lineHeight: 0, opacity: .5 + depth * .35, filter: depth < .8 ? 'blur(1px)' : 'none', transition: 'transform .15s', transform: `translate(${-d.x * strength * depth * 2}px, ${-d.y * strength * depth * 2}px)` } }, f(s, sz, undefined, avatar)) }),
    h('div', { style: { position: 'relative', height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center', pointerEvents: 'none' } }, children))
}
