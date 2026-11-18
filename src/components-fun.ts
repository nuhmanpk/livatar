'use client'
/* Playful, creative livatar components: toys, games and delighters. Zero dependencies, inline styles,
 * every motion honours prefers-reduced-motion. Re-exported from livatar/components. */
import { createElement as h, useEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import { Livatar, type LivatarProps } from './react'
import type { Mood } from './core'

type AvatarProps = Omit<LivatarProps, 'ref'>
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const line = 'var(--lv-line, rgba(127,127,127,.28))'
const surface = 'var(--lv-surface, rgba(127,127,127,.08))'
const accent = 'var(--lv-accent, #5b6cff)'
const btn: CSSProperties = { font: 'inherit', cursor: 'pointer', borderRadius: 10, border: `1px solid ${line}`, background: 'transparent', color: 'inherit', padding: '6px 12px' }
const still = { sleepAfter: 0, idle: false } as const
const f = (seed: string, size: number, mood?: Mood, avatar?: AvatarProps) => h(Livatar, { seed, size, mood, alive: still, ...avatar })

/** Track the pointer inside an element (container-relative). */
function usePointer() {
  const [p, setP] = useState<{ x: number; y: number } | null>(null)
  return [p, {
    onPointerMove: (e: { clientX: number; clientY: number; currentTarget: HTMLElement }) => { const r = e.currentTarget.getBoundingClientRect(); setP({ x: e.clientX - r.left, y: e.clientY - r.top }) },
    onPointerLeave: () => setP(null),
  }] as const
}

/* ---------------- Magnetic ---------------- */
export interface MagneticProps extends Omit<AvatarProps, 'title'> { children?: ReactNode; strength?: number; onClick?: () => void; className?: string; style?: CSSProperties }
/** A button-face that drifts toward the cursor and grins when close. */
export function LivatarMagnetic({ children, strength = 0.35, onClick, className, style, ...av }: MagneticProps): ReactElement {
  const [o, setO] = useState<{ x: number; y: number } | null>(null)
  return h('button', { type: 'button', onClick, className,
    onPointerMove: (e: { clientX: number; clientY: number; currentTarget: HTMLElement }) => { if (reduced()) return; const r = e.currentTarget.getBoundingClientRect(); setO({ x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength }) },
    onPointerLeave: () => setO(null),
    style: { ...btn, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 99, transition: o ? 'transform .08s' : 'transform .45s cubic-bezier(.2,1.6,.4,1)', transform: o ? `translate(${o.x}px,${o.y}px)` : 'none', ...style } },
    h(Livatar, { size: 34, mood: o ? 'happy' : 'neutral', alive: still, ...av }), children)
}

/* ---------------- CursorTrail ---------------- */
export interface TrailProps { seeds?: string[]; length?: number; size?: number; avatar?: AvatarProps; children?: ReactNode; className?: string; style?: CSSProperties }
/** A conga line of faces trailing the pointer inside the area. */
export function LivatarCursorTrail({ seeds = ['ada', 'bob', 'cy', 'dee', 'eli'], length = 5, size = 28, avatar, children, className, style }: TrailProps): ReactElement {
  const box = useRef<HTMLDivElement>(null)
  const pts = useRef<{ x: number; y: number }[]>(Array.from({ length }, () => ({ x: -99, y: -99 })))
  const [, tick] = useState(0)
  const target = useRef<{ x: number; y: number } | null>(null)
  useEffect(() => {
    if (reduced()) return
    let raf = 0
    const loop = () => {
      const t = target.current
      if (t) pts.current.forEach((p, i) => { const prev = i ? pts.current[i - 1] : t; p.x += (prev.x - p.x) * .3; p.y += (prev.y - p.y) * .3 })
      tick((n) => n + 1); raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return h('div', { ref: box, className, onPointerMove: (e: { clientX: number; clientY: number; currentTarget: HTMLElement }) => { const r = e.currentTarget.getBoundingClientRect(); target.current = { x: e.clientX - r.left, y: e.clientY - r.top } }, onPointerLeave: () => { target.current = null; pts.current.forEach((p) => { p.x = -99; p.y = -99 }) },
    style: { position: 'relative', overflow: 'hidden', ...style } },
    children,
    pts.current.map((p, i) => h('span', { key: i, 'aria-hidden': true, style: { position: 'absolute', left: p.x - size / 2, top: p.y - size / 2, lineHeight: 0, pointerEvents: 'none', opacity: 1 - i / (length + 1), transform: `scale(${1 - i * .08})` } }, f(seeds[i % seeds.length], size, 'happy', avatar))))
}

/* ---------------- FlipCard ---------------- */
export interface FlipCardProps extends Omit<AvatarProps, 'title'> { front?: ReactNode; back: ReactNode; width?: number; height?: number; className?: string; style?: CSSProperties }
/** A 3D flip card: face on the front, details on the back. Click or press Enter to flip. */
export function LivatarFlipCard({ front, back, width = 200, height = 240, className, style, ...av }: FlipCardProps): ReactElement {
  const [on, setOn] = useState(false)
  const side: CSSProperties = { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: 16, border: `1px solid ${line}`, background: surface, display: 'grid', placeItems: 'center', alignContent: 'center', gap: 8, padding: 14, textAlign: 'center', boxSizing: 'border-box' }
  return h('button', { type: 'button', 'aria-pressed': on, onClick: () => setOn(!on), className, style: { all: 'unset', cursor: 'pointer', perspective: 900, width, height, display: 'block', ...style } },
    h('span', { style: { position: 'relative', display: 'block', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: reduced() ? 'none' : 'transform .6s', transform: on ? 'rotateY(180deg)' : 'none' } },
      h('span', { style: side }, h(Livatar, { size: 96, mood: 'happy', alive: still, ...av }), front),
      h('span', { style: { ...side, transform: 'rotateY(180deg)' } }, back)))
}

/* ---------------- Carousel3D ---------------- */
export interface Carousel3DProps { people: { id: string; name?: string }[]; size?: number; radius?: number; autoplay?: boolean; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Faces on a rotating 3D ring. Drag the slider or let it spin; the front face smiles. */
export function LivatarCarousel3D({ people, size = 70, radius = 130, autoplay = true, avatar, className, style }: Carousel3DProps): ReactElement {
  const [a, setA] = useState(0)
  useEffect(() => { if (!autoplay || reduced()) return; const t = setInterval(() => setA((v) => (v + .6) % 360), 30); return () => clearInterval(t) }, [autoplay])
  const step = 360 / people.length
  return h('div', { className, role: 'group', 'aria-label': `${people.length} people`, style: { width: radius * 2 + size, height: size + 40, position: 'relative', perspective: 800, ...style } },
    h('div', { style: { position: 'absolute', left: '50%', top: 10, width: 0, height: 0, transformStyle: 'preserve-3d', transform: `translateZ(-${radius}px) rotateY(${-a}deg)` } },
      people.map((p, i) => { const ang = i * step, front = Math.abs(((ang - a + 540) % 360) - 180) > 160
        return h('span', { key: p.id, title: p.name ?? p.id, style: { position: 'absolute', left: -size / 2, top: 0, lineHeight: 0, transform: `rotateY(${ang}deg) translateZ(${radius}px)`, backfaceVisibility: 'visible' } }, f(p.id, size, front ? 'happy' : undefined, avatar)) })))
}

/* ---------------- Rain ---------------- */
export interface RainProps { seeds?: string[]; count?: number; size?: number; height?: number; avatar?: AvatarProps; children?: ReactNode; className?: string; style?: CSSProperties }
/** Faces rain down behind your content. Pure CSS animation. */
export function LivatarRain({ seeds = ['ada', 'bob', 'cy', 'dee', 'eli', 'fay'], count = 14, size = 30, height = 220, avatar, children, className, style }: RainProps): ReactElement {
  return h('div', { className, style: { position: 'relative', overflow: 'hidden', height, ...style } },
    h('style', null, '@keyframes lv-rain{from{transform:translateY(-60px) rotate(-10deg)}to{transform:translateY(var(--h)) rotate(10deg)}}@media (prefers-reduced-motion:reduce){.lv-rain{animation:none!important}}'),
    Array.from({ length: count }, (_, i) => h('span', { key: i, className: 'lv-rain', 'aria-hidden': true, style: { position: 'absolute', top: 0, left: `${(i * 97) % 100}%`, lineHeight: 0, opacity: .75, ['--h' as string]: `${height + 60}px`, animation: `lv-rain ${3 + (i % 5) * .7}s linear ${-(i * 1.3) % 6}s infinite` } }, f(seeds[i % seeds.length] + (i > seeds.length ? i : ''), size, undefined, avatar))),
    h('div', { style: { position: 'relative', height: '100%', display: 'grid', placeItems: 'center' } }, children))
}

/* ---------------- Memory game ---------------- */
export interface MemoryProps { pairs?: number; seeds?: string[]; onWin?: (moves: number) => void; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Face-matching memory game. Winning makes everyone cheer. */
export function LivatarMemory({ pairs = 6, seeds, onWin, avatar, className, style }: MemoryProps): ReactElement {
  const pool = seeds ?? ['ada', 'bob', 'cy', 'dee', 'eli', 'fay', 'gus', 'hal', 'ivy', 'jo']
  const deck = useRef<string[]>([])
  if (!deck.current.length) { const a = pool.slice(0, pairs); const d = [...a, ...a]; for (let i = d.length - 1; i > 0; i--) { const j = (i * 7 + 3) % (i + 1); [d[i], d[j]] = [d[j], d[i]] } deck.current = d }
  const [open, setOpen] = useState<number[]>([]); const [done, setDone] = useState<string[]>([]); const [moves, setMoves] = useState(0)
  const won = done.length === pairs
  useEffect(() => { if (won) onWin?.(moves) }, [won]) // eslint-disable-line react-hooks/exhaustive-deps
  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || done.includes(deck.current[i])) return
    const next = [...open, i]; setOpen(next)
    if (next.length === 2) { setMoves(moves + 1); const [a, b] = next; if (deck.current[a] === deck.current[b]) { setDone([...done, deck.current[a]]); setOpen([]) } else setTimeout(() => setOpen([]), 800) }
  }
  return h('div', { className, style },
    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,64px)', gap: 8 } },
      deck.current.map((s, i) => { const up = open.includes(i) || done.includes(s)
        return h('button', { key: i, type: 'button', 'aria-label': up ? s : 'Hidden card', onClick: () => flip(i), style: { ...btn, width: 64, height: 64, padding: 0, display: 'grid', placeItems: 'center', background: up ? 'var(--lv-bg,#fff)' : accent, lineHeight: 0 } }, up ? f(s, 52, won ? 'starstruck' : 'happy', avatar) : h('span', { style: { color: '#fff', fontSize: 22 } }, '?')) })),
    h('small', { style: { opacity: .65 } }, won ? `Solved in ${moves} moves!` : `Moves: ${moves}`))
}

/* ---------------- SpinWheel ---------------- */
export interface SpinWheelProps { people: { id: string; name?: string }[]; onPick?: (id: string) => void; size?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Spin to pick a random person. The winner celebrates. */
export function LivatarSpinWheel({ people, onPick, size = 240, avatar, className, style }: SpinWheelProps): ReactElement {
  const [rot, setRot] = useState(0); const [win, setWin] = useState<string | null>(null); const [spin, setSpin] = useState(false)
  const n = people.length, seg = 360 / n
  const go = () => {
    if (spin) return
    const idx = Math.floor(Math.random() * n), turn = 360 * 5 + (360 - (idx * seg + seg / 2))
    setSpin(true); setWin(null); setRot((r) => r - (r % 360) + turn)
    setTimeout(() => { setSpin(false); setWin(people[idx].id); onPick?.(people[idx].id) }, reduced() ? 50 : 3200)
  }
  const R = size / 2 - 26
  return h('div', { className, style: { display: 'grid', justifyItems: 'center', gap: 10, ...style } },
    h('div', { style: { position: 'relative', width: size, height: size } },
      h('span', { 'aria-hidden': true, style: { position: 'absolute', left: '50%', top: -6, transform: 'translateX(-50%)', zIndex: 2, color: accent, fontSize: 22 } }, '▼'),
      h('div', { style: { width: size, height: size, borderRadius: '50%', border: `3px solid ${accent}`, position: 'relative', transition: reduced() ? 'none' : 'transform 3s cubic-bezier(.2,.8,.1,1)', transform: `rotate(${rot}deg)`, background: `conic-gradient(${people.map((_, i) => `${i % 2 ? 'rgba(127,127,127,.18)' : 'rgba(127,127,127,.06)'} ${i * seg}deg ${(i + 1) * seg}deg`).join(',')})` } },
        people.map((p, i) => { const a = (i * seg + seg / 2 - 90) * Math.PI / 180
          return h('span', { key: p.id, style: { position: 'absolute', left: size / 2 + Math.cos(a) * R - 22, top: size / 2 + Math.sin(a) * R - 22, lineHeight: 0, transform: `rotate(${-rot}deg)`, transition: reduced() ? 'none' : 'transform 3s cubic-bezier(.2,.8,.1,1)' } }, f(p.id, 44, win === p.id ? 'starstruck' : undefined, avatar)) }))),
    h('button', { type: 'button', onClick: go, disabled: spin, style: { ...btn, background: accent, color: '#fff', borderColor: accent } }, spin ? 'Spinning…' : 'Spin'),
    h('div', { role: 'status', style: { minHeight: 22 } }, win && `🎉 ${people.find((p) => p.id === win)?.name ?? win}`))
}

/* ---------------- Peek ---------------- */
export interface PeekProps extends Omit<AvatarProps, 'title'> { side?: 'top' | 'bottom' | 'left' | 'right'; children?: ReactNode; className?: string; style?: CSSProperties }
/** A face peeking over the edge of a box. Hover and it pops out and smiles. */
export function LivatarPeek({ side = 'top', children, className, style, ...av }: PeekProps): ReactElement {
  const [on, setOn] = useState(false)
  const sz = 56, hide = on ? 4 : sz * .62
  const pos: CSSProperties = side === 'top' ? { top: -sz + (sz - hide + 4), left: '50%', marginLeft: -sz / 2 } : side === 'bottom' ? { bottom: -sz + (sz - hide + 4), left: '50%', marginLeft: -sz / 2, transform: 'rotate(180deg)' } : side === 'left' ? { left: -sz + (sz - hide + 4), top: '50%', marginTop: -sz / 2, transform: 'rotate(-90deg)' } : { right: -sz + (sz - hide + 4), top: '50%', marginTop: -sz / 2, transform: 'rotate(90deg)' }
  return h('div', { className, onPointerEnter: () => setOn(true), onPointerLeave: () => setOn(false), style: { position: 'relative', border: `1px solid ${line}`, borderRadius: 14, padding: 16, background: surface, ...style } },
    h('span', { 'aria-hidden': true, style: { position: 'absolute', lineHeight: 0, transition: 'all .25s', ...pos } }, h(Livatar, { size: sz, mood: on ? 'happy' : 'neutral', alive: still, ...av })), children)
}

/* ---------------- Swarm ---------------- */
export interface SwarmProps { seeds?: string[]; size?: number; height?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Faces flock toward the pointer and scatter when it leaves. */
export function LivatarSwarm({ seeds = ['ada', 'bob', 'cy', 'dee', 'eli', 'fay', 'gus', 'hal'], size = 30, height = 200, avatar, className, style }: SwarmProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null); const tgt = useRef<{ x: number; y: number } | null>(null)
  const pts = useRef(seeds.map((_, i) => ({ x: 40 + i * 30, y: 40 + (i % 3) * 40, vx: 0, vy: 0 })))
  const [, tick] = useState(0)
  useEffect(() => {
    if (reduced()) return
    let raf = 0
    const loop = () => { const r = ref.current?.getBoundingClientRect(), W = r?.width ?? 300
      pts.current.forEach((p, i) => { const t = tgt.current ?? { x: W / 2 + Math.cos(Date.now() / 1500 + i) * 80, y: height / 2 + Math.sin(Date.now() / 1700 + i * 2) * 50 }
        p.vx = (p.vx + (t.x - p.x) * .004 + Math.sin(Date.now() / 300 + i) * .05) * .96; p.vy = (p.vy + (t.y - p.y) * .004 + Math.cos(Date.now() / 350 + i) * .05) * .96; p.x += p.vx; p.y += p.vy })
      tick((n) => n + 1); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf)
  }, [height])
  return h('div', { ref, className, onPointerMove: (e: { clientX: number; clientY: number; currentTarget: HTMLElement }) => { const r = e.currentTarget.getBoundingClientRect(); tgt.current = { x: e.clientX - r.left, y: e.clientY - r.top } }, onPointerLeave: () => { tgt.current = null }, style: { position: 'relative', overflow: 'hidden', height, ...style } },
    pts.current.map((p, i) => h('span', { key: i, 'aria-hidden': true, style: { position: 'absolute', left: p.x - size / 2, top: p.y - size / 2, lineHeight: 0 } }, f(seeds[i], size, tgt.current ? 'happy' : undefined, avatar))))
}

/* ---------------- SwipeCards ---------------- */
export interface SwipeCardsProps { people: { id: string; name?: string; bio?: string }[]; onSwipe?: (id: string, dir: 'left' | 'right') => void; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Tinder-style stack: drag a card or use the buttons. Right = loves it, left = nope. */
export function LivatarSwipeCards({ people, onSwipe, avatar, className, style }: SwipeCardsProps): ReactElement {
  const [i, setI] = useState(0); const [dx, setDx] = useState(0); const start = useRef<number | null>(null)
  const p = people[i]
  const decide = (dir: 'left' | 'right') => { if (!p) return; onSwipe?.(p.id, dir); setDx(0); setI(i + 1) }
  const mood: Mood = dx > 40 ? 'love' : dx < -40 ? 'sad' : 'neutral'
  return h('div', { className, style: { width: 240, display: 'grid', gap: 10, justifyItems: 'center', ...style } },
    h('div', { style: { position: 'relative', width: 240, height: 260 } },
      !p && h('div', { style: { position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: .6 } }, 'No more cards'),
      p && people[i + 1] && h('div', { 'aria-hidden': true, style: { position: 'absolute', inset: 0, borderRadius: 18, border: `1px solid ${line}`, background: surface, transform: 'scale(.94) translateY(10px)' } }),
      p && h('div', { onPointerDown: (e: { clientX: number; currentTarget: HTMLElement; pointerId: number }) => { start.current = e.clientX; e.currentTarget.setPointerCapture(e.pointerId) }, onPointerMove: (e: { clientX: number }) => { if (start.current !== null) setDx(e.clientX - start.current) },
        onPointerUp: () => { start.current = null; if (dx > 90) decide('right'); else if (dx < -90) decide('left'); else setDx(0) },
        style: { position: 'absolute', inset: 0, borderRadius: 18, border: `1px solid ${line}`, background: 'var(--lv-bg,#fff)', color: 'var(--lv-fg,#1f1a2e)', display: 'grid', placeItems: 'center', alignContent: 'center', gap: 6, touchAction: 'none', cursor: 'grab', userSelect: 'none', transform: `translateX(${dx}px) rotate(${dx / 14}deg)`, transition: start.current === null ? 'transform .25s' : 'none', boxShadow: dx > 40 ? '0 0 0 3px #22c55e' : dx < -40 ? '0 0 0 3px #ef4444' : '0 6px 20px rgba(0,0,0,.12)' } },
        h(Livatar, { seed: p.id, size: 130, mood, alive: still, ...avatar }), h('b', { style: { fontSize: 18 } }, p.name ?? p.id), p.bio && h('small', { style: { opacity: .65, padding: '0 14px', textAlign: 'center' } }, p.bio))),
    h('div', { style: { display: 'flex', gap: 10 } }, h('button', { type: 'button', style: btn, disabled: !p, onClick: () => decide('left'), 'aria-label': 'Nope' }, '✕'), h('button', { type: 'button', style: btn, disabled: !p, onClick: () => decide('right'), 'aria-label': 'Like' }, '♥')))
}

/* ---------------- MoodPicker ---------------- */
export interface MoodPickerProps extends Omit<AvatarProps, 'title'> { value?: Mood; onChange?: (m: Mood) => void; moods?: readonly Mood[]; size?: number; className?: string; style?: CSSProperties }
/** Pick how you feel: a row of the same face in different moods. */
export function LivatarMoodPicker({ value, onChange, moods = ['sad', 'confused', 'neutral', 'happy', 'laugh'], size = 44, className, style, ...av }: MoodPickerProps): ReactElement {
  const [own, setOwn] = useState<Mood | undefined>(value)
  const cur = value ?? own
  return h('div', { role: 'radiogroup', 'aria-label': 'Mood', className, style: { display: 'inline-flex', gap: 6, ...style } },
    moods.map((m) => h('button', { key: m, type: 'button', role: 'radio', 'aria-checked': m === cur, 'aria-label': m, title: m, onClick: () => { setOwn(m); onChange?.(m) },
      style: { all: 'unset', cursor: 'pointer', lineHeight: 0, borderRadius: '50%', padding: 3, transition: 'transform .15s', transform: m === cur ? 'scale(1.18)' : 'none', boxShadow: m === cur ? `0 0 0 3px ${accent}` : 'none', opacity: cur && m !== cur ? .55 : 1 } }, h(Livatar, { size, mood: m, alive: still, ...av }))))
}

/* ---------------- Speech ---------------- */
export interface SpeechProps extends Omit<AvatarProps, 'title'> { text: string; speed?: number; loop?: boolean; className?: string; style?: CSSProperties }
/** A face with a speech bubble that types out the text while it talks. */
export function LivatarSpeech({ text, speed = 32, loop = false, className, style, ...av }: SpeechProps): ReactElement {
  const [n, setN] = useState(reduced() ? text.length : 0)
  useEffect(() => { setN(reduced() ? text.length : 0) }, [text])
  useEffect(() => {
    if (reduced()) return
    if (n >= text.length) { if (!loop) return; const t = setTimeout(() => setN(0), 1800); return () => clearTimeout(t) }
    const t = setTimeout(() => setN(n + 1), speed); return () => clearTimeout(t)
  }, [n, text, speed, loop])
  const talking = n < text.length
  return h('div', { className, style: { display: 'flex', alignItems: 'flex-end', gap: 10, ...style } },
    h(Livatar, { size: 72, mood: talking ? 'happy' : 'neutral', alive: still, ...av }),
    h('div', { role: 'status', 'aria-label': text, style: { position: 'relative', maxWidth: 260, background: surface, border: `1px solid ${line}`, borderRadius: '16px 16px 16px 4px', padding: '10px 14px', minHeight: 24 } },
      h('span', { 'aria-hidden': true }, text.slice(0, n), talking && h('span', { style: { opacity: .5 } }, '▍'))))
}

/* ---------------- Leaderboard ---------------- */
export interface LeaderboardProps { rows: { id: string; name?: string; score: number }[]; avatar?: AvatarProps; className?: string; style?: CSSProperties }
const MEDAL = ['🥇', '🥈', '🥉']
/** Ranked leaderboard with score bars; first place is thrilled, last is glum. */
export function LivatarLeaderboard({ rows, avatar, className, style }: LeaderboardProps): ReactElement {
  const sorted = [...rows].sort((a, b) => b.score - a.score), max = sorted[0]?.score || 1
  return h('ol', { className, style: { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8, ...style } },
    sorted.map((r, i) => h('li', { key: r.id, style: { display: 'flex', alignItems: 'center', gap: 10 } },
      h('span', { style: { width: 26, textAlign: 'center' } }, MEDAL[i] ?? i + 1), f(r.id, 40, i === 0 ? 'starstruck' : i === sorted.length - 1 && sorted.length > 3 ? 'sad' : i < 3 ? 'happy' : undefined, avatar),
      h('div', { style: { flex: 1 } }, h('div', { style: { display: 'flex', justifyContent: 'space-between' } }, h('b', null, r.name ?? r.id), h('span', null, r.score.toLocaleString('en'))),
        h('div', { style: { height: 6, borderRadius: 4, background: surface, overflow: 'hidden', marginTop: 4 } }, h('div', { style: { width: `${(r.score / max) * 100}%`, height: '100%', background: accent, transition: 'width .6s' } }))))))
}

/* ---------------- SlotMachine ---------------- */
export interface SlotMachineProps { seeds?: string[]; reels?: number; onResult?: (seeds: string[], jackpot: boolean) => void; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Pull the lever: three faces spin; match them all for a jackpot. */
export function LivatarSlotMachine({ seeds = ['ada', 'bob', 'cy', 'dee', 'eli'], reels = 3, onResult, avatar, className, style }: SlotMachineProps): ReactElement {
  const [cur, setCur] = useState<string[]>(() => Array.from({ length: reels }, (_, i) => seeds[i % seeds.length])); const [spin, setSpin] = useState(false); const [jp, setJp] = useState(false)
  const pull = () => {
    if (spin) return; setSpin(true); setJp(false)
    const iv = setInterval(() => setCur(Array.from({ length: reels }, () => seeds[Math.floor(Math.random() * seeds.length)])), 90)
    setTimeout(() => { clearInterval(iv); const res = Array.from({ length: reels }, () => seeds[Math.floor(Math.random() * seeds.length)]); const win = res.every((x) => x === res[0]); setCur(res); setJp(win); setSpin(false); onResult?.(res, win) }, reduced() ? 50 : 1200)
  }
  return h('div', { className, style: { display: 'inline-grid', gap: 10, justifyItems: 'center', padding: 14, borderRadius: 16, border: `2px solid ${accent}`, background: surface, ...style } },
    h('div', { style: { display: 'flex', gap: 8 } }, cur.map((s, i) => h('span', { key: i, style: { lineHeight: 0, padding: 6, borderRadius: 12, background: 'var(--lv-bg,#fff)', border: `1px solid ${line}`, filter: spin ? 'blur(1.5px)' : 'none' } }, f(s, 64, jp ? 'starstruck' : spin ? 'surprised' : undefined, avatar)))),
    h('button', { type: 'button', onClick: pull, disabled: spin, style: { ...btn, background: accent, color: '#fff', borderColor: accent } }, spin ? '…' : 'Pull'),
    h('div', { role: 'status', style: { minHeight: 20 } }, jp ? '🎰 JACKPOT!' : ''))
}

/* ---------------- Wave ---------------- */
export interface WaveProps { seeds: string[]; size?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** A row of faces; hover one and the wave ripples out to its neighbours. */
export function LivatarWave({ seeds, size = 44, avatar, className, style }: WaveProps): ReactElement {
  const [at, setAt] = useState<number | null>(null)
  return h('div', { className, onPointerLeave: () => setAt(null), style: { display: 'flex', alignItems: 'flex-end', gap: 4, height: size * 1.8, ...style } },
    seeds.map((s, i) => { const d = at === null ? 9 : Math.abs(i - at), up = reduced() ? 0 : Math.max(0, 1 - d * .3)
      return h('span', { key: s + i, onPointerEnter: () => setAt(i), style: { lineHeight: 0, transition: 'transform .18s', transform: `translateY(${-up * size * .7}px) scale(${1 + up * .2})` } }, f(s, size, up > .5 ? 'happy' : undefined, avatar)) }))
}

/* ---------------- Buddy (chaser) ---------------- */
export interface BuddyProps extends Omit<AvatarProps, 'title'> { children?: ReactNode; lag?: number; className?: string; style?: CSSProperties }
/** A little buddy that chases your pointer around the area, always a step behind, and looks tired when it catches up. */
export function LivatarBuddy({ children, lag = .06, className, style, ...av }: BuddyProps): ReactElement {
  const [p, ptrProps] = usePointer()
  const pos = useRef({ x: 40, y: 40 }); const [, tick] = useState(0); const tgt = useRef<{ x: number; y: number } | null>(null)
  tgt.current = p
  useEffect(() => { if (reduced()) return; let raf = 0; const loop = () => { const t = tgt.current; if (t) { pos.current.x += (t.x - pos.current.x) * lag; pos.current.y += (t.y - pos.current.y) * lag } tick((n) => n + 1); raf = requestAnimationFrame(loop) }; raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf) }, [lag])
  const near = !!p && Math.hypot(p.x - pos.current.x, p.y - pos.current.y) < 40
  return h('div', { className, ...ptrProps, style: { position: 'relative', overflow: 'hidden', ...style } }, children,
    h('span', { 'aria-hidden': true, style: { position: 'absolute', left: pos.current.x - 24, top: pos.current.y - 24, lineHeight: 0, pointerEvents: 'none' } }, h(Livatar, { size: 48, mood: !p ? 'sleepy' : near ? 'happy' : 'surprised', alive: still, ...av })))
}

/* ---------------- PhotoBooth ---------------- */
export interface PhotoBoothProps extends Omit<AvatarProps, 'title'> { moods?: readonly Mood[]; size?: number; className?: string; style?: CSSProperties }
/** A photo-booth strip: four frames with four moods. Click "Snap" for a fresh seed. */
export function LivatarPhotoBooth({ moods = ['happy', 'surprised', 'wink', 'laugh'], size = 84, seed = 'booth', className, style, ...av }: PhotoBoothProps): ReactElement {
  const [n, setN] = useState(0)
  return h('div', { className, style: { display: 'inline-grid', gap: 6, padding: 10, background: '#111', borderRadius: 8, justifyItems: 'center', ...style } },
    moods.map((m, i) => h('span', { key: m + i, style: { lineHeight: 0, background: '#fff', padding: 4 } }, h(Livatar, { ...av, seed: `${seed}${n}`, size, mood: m, alive: still }))),
    h('button', { type: 'button', onClick: () => setN(n + 1), style: { ...btn, color: '#fff', borderColor: '#555', fontSize: 12 } }, 'Snap'))
}

/* ---------------- Ripple ---------------- */
export interface RippleProps { seeds?: string[]; size?: number; avatar?: AvatarProps; children?: ReactNode; className?: string; style?: CSSProperties }
/** Click anywhere and a ring of faces ripples outward from the spot. */
export function LivatarRipple({ seeds = ['ada', 'bob', 'cy', 'dee', 'eli', 'fay'], size = 26, avatar, children, className, style }: RippleProps): ReactElement {
  const [rings, setRings] = useState<{ id: number; x: number; y: number }[]>([])
  return h('div', { className, onClick: (e: { clientX: number; clientY: number; currentTarget: HTMLElement }) => { const r = e.currentTarget.getBoundingClientRect(), id = Date.now(); setRings((a) => [...a, { id, x: e.clientX - r.left, y: e.clientY - r.top }]); setTimeout(() => setRings((a) => a.filter((q) => q.id !== id)), 1100) },
    style: { position: 'relative', overflow: 'hidden', cursor: 'pointer', ...style } },
    h('style', null, '@keyframes lv-rip{from{transform:translate(var(--x),var(--y)) scale(.2);opacity:1}to{transform:translate(calc(var(--x)*3.2),calc(var(--y)*3.2)) scale(1);opacity:0}}@media (prefers-reduced-motion:reduce){.lv-rip{display:none}}'),
    children,
    rings.map((r) => seeds.map((s, i) => { const a = (i / seeds.length) * Math.PI * 2
      return h('span', { key: r.id + s, className: 'lv-rip', 'aria-hidden': true, style: { position: 'absolute', left: r.x - size / 2, top: r.y - size / 2, lineHeight: 0, pointerEvents: 'none', ['--x' as string]: `${Math.cos(a) * 40}px`, ['--y' as string]: `${Math.sin(a) * 40}px`, animation: 'lv-rip 1s ease-out forwards' } }, f(s, size, 'happy', avatar)) })))
}
