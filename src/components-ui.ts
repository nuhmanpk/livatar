'use client'
/* shadcn / HeroUI / Ant Design style primitives, each with a livatar face reacting to state.
 * Zero dependencies, inline styles, keyboard accessible. Re-exported from livatar/components. */
import { createElement as h, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import { Livatar, type LivatarProps } from './react'
import type { Mood } from './core'

type AvatarProps = Omit<LivatarProps, 'ref'>
const line = 'var(--lv-line, rgba(127,127,127,.28))'
const surface = 'var(--lv-surface, rgba(127,127,127,.08))'
const accent = 'var(--lv-accent, #5b6cff)'
const card: CSSProperties = { borderRadius: 14, border: `1px solid ${line}`, background: surface, color: 'inherit' }
const btn: CSSProperties = { font: 'inherit', cursor: 'pointer', borderRadius: 10, border: `1px solid ${line}`, background: 'transparent', color: 'inherit', padding: '6px 12px' }
const bare: CSSProperties = { all: 'unset', cursor: 'pointer' }
const DOT: Record<string, string> = { online: '#22c55e', away: '#f59e0b', busy: '#ef4444', offline: '#9ca3af' }

/* ---------------- Avatar (shadcn) ---------------- */
export interface AvatarPrimitiveProps extends AvatarProps { src?: string; alt?: string; name?: string; status?: keyof typeof DOT; badge?: ReactNode; ring?: boolean }
/** shadcn-style Avatar: photo with a livatar fallback (broken or missing src), status dot and corner badge. */
export function LivatarAvatar({ src, alt, name, status, badge, ring, size = 40, className, style, ...av }: AvatarPrimitiveProps): ReactElement {
  const [bad, setBad] = useState(false)
  const px = typeof size === 'number' ? size : 40
  return h('span', { className, style: { position: 'relative', display: 'inline-block', lineHeight: 0, width: px, height: px, borderRadius: '50%', boxShadow: ring ? `0 0 0 2px ${accent}` : undefined, ...style } },
    src && !bad
      ? h('img', { src, alt: alt ?? name ?? '', width: px, height: px, onError: () => setBad(true), style: { width: px, height: px, borderRadius: '50%', objectFit: 'cover' } })
      : h(Livatar, { seed: name ?? alt ?? 'livatar', size: px, title: alt ?? name, ...av }),
    status && h('span', { role: 'img', 'aria-label': status, style: { position: 'absolute', right: 0, bottom: 0, width: px * .28, height: px * .28, borderRadius: '50%', background: DOT[status], boxShadow: '0 0 0 2px var(--lv-ring,#fff)' } }),
    badge != null && h('span', { style: { position: 'absolute', right: -4, top: -4, minWidth: px * .38, height: px * .38, padding: '0 4px', borderRadius: 99, background: '#ef4444', color: '#fff', fontSize: Math.max(9, px * .24), lineHeight: `${px * .38}px`, textAlign: 'center', fontWeight: 700, boxSizing: 'border-box' } }, badge))
}

/* ---------------- Tabs ---------------- */
export interface TabItem { id: string; label: ReactNode; content: ReactNode; mood?: Mood }
export interface TabsProps { tabs: TabItem[]; value?: string; onChange?: (id: string) => void; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Accessible tabs (arrow keys) with a face that reacts as you switch. */
export function LivatarTabs({ tabs, value, onChange, avatar, className, style }: TabsProps): ReactElement {
  const [own, setOwn] = useState(tabs[0]?.id)
  const cur = value ?? own
  const [flash, setFlash] = useState<Mood | undefined>()
  const pick = (id: string) => { setOwn(id); onChange?.(id); setFlash('surprised'); setTimeout(() => setFlash(undefined), 700) }
  const active = tabs.find((t) => t.id === cur) ?? tabs[0]
  return h('div', { className, style },
    h('div', { role: 'tablist', style: { display: 'flex', alignItems: 'center', gap: 4, borderBottom: `1px solid ${line}` },
      onKeyDown: (e: { key: string; preventDefault(): void }) => { const i = tabs.findIndex((t) => t.id === cur); const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length].id) } } },
      h(Livatar, { size: 30, mood: flash ?? active?.mood, alive: { sleepAfter: 0 }, ...avatar }),
      tabs.map((t) => h('button', { key: t.id, type: 'button', role: 'tab', 'aria-selected': t.id === cur, tabIndex: t.id === cur ? 0 : -1, onClick: () => pick(t.id),
        style: { ...bare, padding: '8px 12px', fontWeight: t.id === cur ? 700 : 400, borderBottom: `2px solid ${t.id === cur ? accent : 'transparent'}`, marginBottom: -1 } }, t.label))),
    h('div', { role: 'tabpanel', style: { padding: '14px 4px' } }, active?.content))
}

/* ---------------- Dialog ---------------- */
export interface DialogProps extends Omit<AvatarProps, 'title'> { open: boolean; onClose: () => void; title: ReactNode; children?: ReactNode; actions?: ReactNode; tone?: 'info' | 'danger' | 'success'; className?: string; style?: CSSProperties }
const TONE_MOOD: Record<string, Mood> = { info: 'happy', danger: 'scared', success: 'starstruck' }
/** Modal dialog (Esc and backdrop close) with a face whose mood matches the tone. */
export function LivatarDialog({ open, onClose, title, children, actions, tone = 'info', className, style, ...av }: DialogProps): ReactElement | null {
  const id = useId()
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [open, onClose])
  if (!open) return null
  return h('div', { onClick: onClose, style: { position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,.45)', padding: 16 } },
    h('div', { role: 'dialog', 'aria-modal': true, 'aria-labelledby': id, className, onClick: (e: { stopPropagation(): void }) => e.stopPropagation(),
      style: { ...card, background: 'var(--lv-bg, #fff)', color: 'var(--lv-fg, #1f1a2e)', width: 'min(420px,100%)', padding: 22, display: 'grid', gap: 12, justifyItems: 'center', textAlign: 'center', ...style } },
      h(Livatar, { size: 84, mood: TONE_MOOD[tone], ...av }), h('strong', { id, style: { fontSize: 18 } }, title), children && h('div', { style: { opacity: .75 } }, children),
      h('div', { style: { display: 'flex', gap: 8 } }, actions ?? h('button', { type: 'button', style: btn, onClick: onClose, autoFocus: true }, 'Close'))))
}

/* ---------------- Tooltip / Popover ---------------- */
export interface TooltipProps extends Omit<AvatarProps, 'title'> { content: ReactNode; children: ReactNode; side?: 'top' | 'bottom'; className?: string }
/** Hover/focus tooltip with a small face beside the message. */
export function LivatarTooltip({ content, children, side = 'top', className, ...av }: TooltipProps): ReactElement {
  const [on, setOn] = useState(false)
  const id = useId()
  return h('span', { className, onPointerEnter: () => setOn(true), onPointerLeave: () => setOn(false), onFocus: () => setOn(true), onBlur: () => setOn(false), 'aria-describedby': on ? id : undefined, style: { position: 'relative', display: 'inline-block' } },
    children,
    on && h('span', { id, role: 'tooltip', style: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', [side === 'top' ? 'bottom' : 'top']: '120%', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', background: '#111', color: '#fff', borderRadius: 10, padding: '6px 10px', fontSize: 13, zIndex: 60 } },
      h(Livatar, { size: 26, mood: 'happy', alive: { sleepAfter: 0 }, ...av }), content))
}
export interface PopoverProps extends Omit<AvatarProps, 'title'> { trigger: ReactNode; children: ReactNode; className?: string }
/** Click popover with a face header. Esc or outside click closes. */
export function LivatarPopover({ trigger, children, className, ...av }: PopoverProps): ReactElement {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const out = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('pointerdown', out); addEventListener('keydown', k)
    return () => { removeEventListener('pointerdown', out); removeEventListener('keydown', k) }
  }, [open])
  return h('span', { ref, className, style: { position: 'relative', display: 'inline-block' } },
    h('button', { type: 'button', 'aria-expanded': open, onClick: () => setOpen(!open), style: bare }, trigger),
    open && h('div', { role: 'dialog', style: { ...card, background: 'var(--lv-bg,#fff)', color: 'var(--lv-fg,#1f1a2e)', position: 'absolute', top: '110%', left: 0, zIndex: 60, padding: 14, minWidth: 200, display: 'flex', gap: 10, alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,.18)' } },
      h(Livatar, { size: 44, mood: 'happy', ...av }), h('div', null, children)))
}

/* ---------------- Switch ---------------- */
export interface SwitchProps extends Omit<AvatarProps, 'title'> { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; disabled?: boolean; className?: string }
/** Toggle whose thumb is a face: happy when on, sleepy when off. */
export function LivatarSwitch({ checked, onChange, label, disabled, className, ...av }: SwitchProps): ReactElement {
  return h('button', { type: 'button', role: 'switch', 'aria-checked': checked, disabled, className, onClick: () => onChange(!checked), style: { ...bare, display: 'inline-flex', alignItems: 'center', gap: 10, opacity: disabled ? .5 : 1 } },
    h('span', { style: { position: 'relative', width: 64, height: 32, borderRadius: 99, background: checked ? accent : 'rgba(127,127,127,.35)', transition: 'background .2s', flex: 'none' } },
      h('span', { style: { position: 'absolute', top: -2, left: checked ? 34 : -2, transition: 'left .2s', lineHeight: 0 } }, h(Livatar, { size: 36, mood: checked ? 'happy' : 'sleepy', alive: { sleepAfter: 0 }, ...av }))),
    label)
}

/* ---------------- Slider ---------------- */
export interface SliderProps extends Omit<AvatarProps, 'title'> { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; moods?: Mood[]; label?: string; className?: string; style?: CSSProperties }
/** Range slider with a face above the thumb; the mood follows the value (low → high). */
export function LivatarSlider({ value, onChange, min = 0, max = 100, step = 1, moods = ['sad', 'neutral', 'happy', 'laugh'], label = 'Value', className, style, ...av }: SliderProps): ReactElement {
  const pct = (value - min) / (max - min || 1)
  const mood = moods[Math.min(moods.length - 1, Math.floor(pct * moods.length))]
  return h('div', { className, style: { position: 'relative', paddingTop: 48, ...style } },
    h('span', { 'aria-hidden': true, style: { position: 'absolute', top: 0, left: `calc(${pct * 100}% - ${pct * 40}px)`, lineHeight: 0, transition: 'left .05s' } }, h(Livatar, { size: 40, mood, alive: { sleepAfter: 0 }, ...av })),
    h('input', { type: 'range', min, max, step, value, 'aria-label': label, onChange: (e: { target: { value: string } }) => onChange(+e.target.value), style: { width: '100%', accentColor: 'var(--lv-accent,#5b6cff)' } }))
}

/* ---------------- Command / Combobox ---------------- */
export interface CommandItem { id: string; label: string; hint?: string; onSelect?: () => void; avatar?: AvatarProps }
export interface CommandProps { items: CommandItem[]; placeholder?: string; onSelect?: (item: CommandItem) => void; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Command palette / combobox: filter as you type, arrows + Enter, a face next to every result and searching. */
export function LivatarCommand({ items, placeholder = 'Type a command or search…', onSelect, avatar, className, style }: CommandProps): ReactElement {
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const list = useMemo(() => items.filter((x) => (x.label + ' ' + (x.hint ?? '')).toLowerCase().includes(q.toLowerCase())), [items, q])
  const go = (x?: CommandItem) => { if (x) { x.onSelect?.(); onSelect?.(x) } }
  return h('div', { className, style: { ...card, width: 'min(440px,100%)', overflow: 'hidden', ...style } },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderBottom: `1px solid ${line}` } },
      h(Livatar, { size: 32, mood: q ? (list.length ? 'happy' : 'confused') : 'neutral', alive: { sleepAfter: 0 }, ...avatar }),
      h('input', { value: q, placeholder, role: 'combobox', 'aria-expanded': true, 'aria-controls': 'lv-cmd', 'aria-label': placeholder, onChange: (e: { target: { value: string } }) => { setQ(e.target.value); setI(0) },
        onKeyDown: (e: { key: string; preventDefault(): void }) => { if (e.key === 'ArrowDown') { e.preventDefault(); setI((i + 1) % Math.max(1, list.length)) } else if (e.key === 'ArrowUp') { e.preventDefault(); setI((i - 1 + list.length) % Math.max(1, list.length)) } else if (e.key === 'Enter') go(list[i]) },
        style: { all: 'unset', flex: 1, font: 'inherit' } })),
    h('ul', { id: 'lv-cmd', role: 'listbox', style: { listStyle: 'none', margin: 0, padding: 6, maxHeight: 260, overflow: 'auto' } },
      list.length === 0 && h('li', { style: { padding: 14, textAlign: 'center', opacity: .6 } }, 'Nothing found'),
      list.map((x, n) => h('li', { key: x.id, role: 'option', 'aria-selected': n === i, onPointerEnter: () => setI(n), onClick: () => go(x),
        style: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8, cursor: 'pointer', background: n === i ? 'rgba(127,127,127,.18)' : 'transparent' } },
        h(Livatar, { seed: x.id, size: 28, alive: false, ...avatar, ...x.avatar }), h('span', { style: { flex: 1 } }, x.label), x.hint && h('small', { style: { opacity: .55 } }, x.hint)))))
}

/* ---------------- Calendar ---------------- */
export interface CalendarProps { month?: Date; value?: Date; onChange?: (d: Date) => void; marks?: Record<string, string[]>; /** `true` floods every day with its own face. Default `false`: faces only on marked days, today and the selected day. */ fill?: boolean; /** Face size in px (default 30). */ size?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const DAY_MOOD: Mood[] = ['sleepy', 'sad', 'neutral', 'happy', 'wink', 'laugh', 'love']
/** Month calendar. Faces appear only where they matter: marked days (stacked), today and the selected day. Pass `fill` to flood every day with its own seeded character (Mondays grumpy, Fridays thrilled). `marks` maps 'YYYY-MM-DD' to seeds shown stacked on that day. */
export function LivatarCalendar({ month, value, onChange, marks = {}, fill = false, size = 26, avatar, className, style }: CalendarProps): ReactElement {
  const [view, setView] = useState(() => { const d = month ?? value ?? new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const first = view.getDay(), days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((first + days) / 7) * 7 }, (_, n) => (n >= first && n < first + days ? n - first + 1 : 0))
  const shift = (d: number) => setView(new Date(view.getFullYear(), view.getMonth() + d, 1))
  const today = key(new Date())
  return h('div', { className, style: { ...card, padding: 12, width: 'min(400px,100%)', ...style } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
      h('button', { type: 'button', style: btn, 'aria-label': 'Previous month', onClick: () => shift(-1) }, '‹'), h('b', null, view.toLocaleString('en', { month: 'long', year: 'numeric' })), h('button', { type: 'button', style: btn, 'aria-label': 'Next month', onClick: () => shift(1) }, '›')),
    h('div', { role: 'grid', style: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, textAlign: 'center', fontSize: 12 } },
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, n) => h('small', { key: 'h' + n, style: { opacity: .55 } }, d)),
      cells.map((d, n) => {
        if (!d) return h('span', { key: n })
        const date = new Date(view.getFullYear(), view.getMonth(), d), k = key(date), sel = !!value && key(value) === k, m = marks[k], isToday = k === today
        const faces = m?.length ? m.slice(0, 3) : fill || sel || isToday ? [k] : []
        return h('button', { key: n, type: 'button', role: 'gridcell', 'aria-selected': sel, 'aria-label': date.toDateString(), 'aria-current': isToday ? 'date' : undefined, onClick: () => onChange?.(date),
          style: { ...bare, display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 1, padding: '3px 0', borderRadius: 10, minHeight: size + 22, background: sel ? accent : 'transparent', color: sel ? '#fff' : 'inherit', boxShadow: isToday && !sel ? `inset 0 0 0 2px ${accent}` : 'none', transition: 'transform .12s' } },
          faces.length ? h('span', { style: { display: 'flex', lineHeight: 0 } }, faces.map((sd, j) => h('span', { key: sd + j, style: { marginLeft: j ? -size * .35 : 0 } }, h(Livatar, { seed: sd, size, mood: sel ? 'starstruck' : isToday ? 'happy' : m?.length ? 'happy' : DAY_MOOD[date.getDay()], alive: false, ...avatar })))) : null,
          h('span', { style: { fontSize: 11, fontWeight: sel || isToday ? 800 : 500, opacity: sel ? 1 : .75 } }, d))
      })))
}

/* ---------------- WeekStrip ---------------- */
export interface WeekStripProps { value?: Date; onChange?: (d: Date) => void; marks?: Record<string, string[]>; size?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
/** One-week date strip (like a mobile planner). Faces sit on marked days; today is ringed; the selected day beams. */
export function LivatarWeekStrip({ value, onChange, marks = {}, size = 30, avatar, className, style }: WeekStripProps): ReactElement {
  const [anchor, setAnchor] = useState(() => value ?? new Date())
  const start = addDays(anchor, -anchor.getDay()), today = key(new Date())
  return h('div', { className, style: { ...card, padding: 10, width: 'min(420px,100%)', ...style } },
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 } },
      h('button', { type: 'button', style: btn, 'aria-label': 'Previous week', onClick: () => setAnchor(addDays(anchor, -7)) }, '‹'),
      h('b', null, `${start.toLocaleString('en', { month: 'short', day: 'numeric' })} – ${addDays(start, 6).toLocaleString('en', { month: 'short', day: 'numeric' })}`),
      h('button', { type: 'button', style: btn, 'aria-label': 'Next week', onClick: () => setAnchor(addDays(anchor, 7)) }, '›')),
    h('div', { role: 'group', 'aria-label': 'Week', style: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 } },
      Array.from({ length: 7 }, (_, n) => { const d = addDays(start, n), k = key(d), sel = !!value && key(value) === k, m = marks[k]
        return h('button', { key: k, type: 'button', 'aria-pressed': sel, 'aria-label': d.toDateString(), onClick: () => onChange?.(d), style: { ...bare, display: 'grid', justifyItems: 'center', gap: 2, padding: '6px 0', borderRadius: 12, background: sel ? accent : 'transparent', color: sel ? '#fff' : 'inherit', boxShadow: k === today && !sel ? `inset 0 0 0 2px ${accent}` : 'none' } },
          h('small', { style: { opacity: .7, fontSize: 11 } }, d.toLocaleString('en', { weekday: 'short' })), h('b', null, d.getDate()),
          h('span', { style: { height: size, display: 'flex', alignItems: 'center', lineHeight: 0 } }, m?.length ? m.slice(0, 2).map((sd, j) => h('span', { key: sd, style: { marginLeft: j ? -size * .35 : 0 } }, h(Livatar, { seed: sd, size, mood: sel ? 'starstruck' : 'happy', alive: false, ...avatar }))) : null)) })))
}

/* ---------------- Agenda ---------------- */
export interface AgendaEvent { id: string; date: Date | string; title: ReactNode; time?: ReactNode; who?: string[] }
export interface AgendaProps { events: AgendaEvent[]; empty?: ReactNode; size?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Agenda list: events grouped by day, each with the faces of who is invited. Today is highlighted. */
export function LivatarAgenda({ events, empty = 'Nothing planned', size = 28, avatar, className, style }: AgendaProps): ReactElement {
  const groups = useMemo(() => { const m = new Map<string, AgendaEvent[]>(); for (const e of events) { const d = typeof e.date === 'string' ? new Date(e.date + 'T00:00') : e.date, k = key(d); m.set(k, [...(m.get(k) ?? []), e]) } return [...m.entries()].sort(([a], [b]) => (a < b ? -1 : 1)) }, [events])
  const today = key(new Date())
  if (!groups.length) return h('div', { className, style: { ...card, padding: 24, textAlign: 'center', display: 'grid', justifyItems: 'center', gap: 6, ...style } }, h(Livatar, { seed: 'agenda', size: 64, mood: 'sleepy', ...avatar }), h('span', { style: { opacity: .7 } }, empty))
  return h('div', { className, style: { display: 'grid', gap: 14, width: 'min(440px,100%)', ...style } },
    groups.map(([k, list]) => { const d = new Date(k + 'T00:00')
      return h('section', { key: k, style: { display: 'grid', gridTemplateColumns: '54px 1fr', gap: 10 } },
        h('div', { style: { textAlign: 'center', padding: '6px 0', borderRadius: 12, background: k === today ? accent : surface, color: k === today ? '#fff' : 'inherit', alignSelf: 'start' } }, h('small', { style: { display: 'block', opacity: .75 } }, d.toLocaleString('en', { weekday: 'short' })), h('b', { style: { fontSize: 20 } }, d.getDate())),
        h('div', { style: { display: 'grid', gap: 8 } }, list.map((e) => h('div', { key: e.id, style: { ...card, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 } },
          h('div', { style: { flex: 1 } }, h('b', null, e.title), e.time && h('div', { style: { opacity: .65, fontSize: 13 } }, e.time)),
          h('span', { style: { display: 'flex', lineHeight: 0 } }, (e.who ?? []).slice(0, 3).map((w, j) => h('span', { key: w, style: { marginLeft: j ? -size * .3 : 0, boxShadow: '0 0 0 2px var(--lv-ring,#fff)', borderRadius: '50%' } }, h(Livatar, { seed: w, size, alive: false, ...avatar })))))))) }))
}

/* ---------------- YearCalendar ---------------- */
export interface YearCalendarProps { year?: number; marks?: Record<string, string[]>; value?: Date; onChange?: (d: Date) => void; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Twelve mini months at a glance. Marked days are filled dots; hover a month to meet the faces booked in it. */
export function LivatarYearCalendar({ year, marks = {}, value, onChange, avatar, className, style }: YearCalendarProps): ReactElement {
  const [y, setY] = useState(year ?? new Date().getFullYear()); const [hot, setHot] = useState<number | null>(null), today = key(new Date())
  return h('div', { className, style: { ...card, padding: 12, width: 'min(560px,100%)', ...style } },
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 } },
      h('button', { type: 'button', style: btn, 'aria-label': 'Previous year', onClick: () => setY(y - 1) }, '‹'), h('b', null, y), h('button', { type: 'button', style: btn, 'aria-label': 'Next year', onClick: () => setY(y + 1) }, '›')),
    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 10 } },
      Array.from({ length: 12 }, (_, mo) => {
        const first = new Date(y, mo, 1).getDay(), days = new Date(y, mo + 1, 0).getDate(), seeds = new Set<string>()
        const cells = Array.from({ length: first + days }, (_, n) => (n < first ? 0 : n - first + 1))
        for (let d = 1; d <= days; d++) (marks[key(new Date(y, mo, d))] ?? []).forEach((x) => seeds.add(x))
        return h('div', { key: mo, onPointerEnter: () => setHot(mo), onPointerLeave: () => setHot(null), style: { padding: 6, borderRadius: 10, background: hot === mo ? 'rgba(127,127,127,.12)' : 'transparent', position: 'relative' } },
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 3 } }, new Date(y, mo, 1).toLocaleString('en', { month: 'short' }),
            hot === mo && seeds.size > 0 && h('span', { style: { display: 'flex', lineHeight: 0 } }, [...seeds].slice(0, 3).map((sd, j) => h('span', { key: sd, style: { marginLeft: j ? -6 : 0 } }, h(Livatar, { seed: sd, size: 18, mood: 'happy', alive: false, ...avatar }))))),
          h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 } }, cells.map((d, n) => { if (!d) return h('span', { key: n }); const dt = new Date(y, mo, d), k = key(dt), on = !!marks[k]?.length, sel = !!value && key(value) === k
            return h('button', { key: n, type: 'button', 'aria-label': dt.toDateString(), onClick: () => onChange?.(dt), style: { ...bare, width: '100%', aspectRatio: '1', borderRadius: '50%', fontSize: 0, background: sel ? '#111' : on ? accent : k === today ? '#f59e0b' : 'rgba(127,127,127,.18)', opacity: on || sel || k === today ? 1 : .7 } }, d) })))
      })))
}

/* ---------------- Heatmap ---------------- */
export interface HeatmapProps { data: Record<string, number>; weeks?: number; label?: string; levels?: number; color?: string; avatar?: AvatarProps; className?: string; style?: CSSProperties }
const HEAT_MOOD: Mood[] = ['sleepy', 'neutral', 'happy', 'laugh', 'starstruck']
/** GitHub-style activity heatmap. A face in the corner reads the hovered day: sleepy for none, starstruck for a big one. */
export function LivatarHeatmap({ data, weeks = 24, label = 'contributions', levels = 5, color = '#22c55e', avatar, className, style }: HeatmapProps): ReactElement {
  const [hover, setHover] = useState<{ k: string; v: number } | null>(null)
  const end = new Date(), start = addDays(end, -(weeks * 7 - 1) - end.getDay() + 6), max = Math.max(1, ...Object.values(data))
  const lvl = (v: number) => (v <= 0 ? 0 : Math.max(1, Math.ceil((v / max) * (levels - 1))))
  const total = Object.values(data).reduce((a, b) => a + b, 0)
  return h('div', { className, style: { ...card, padding: 12, width: 'max-content', maxWidth: '100%', ...style } },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 } }, h(Livatar, { seed: 'heat', size: 34, mood: hover ? HEAT_MOOD[Math.min(4, lvl(hover.v))] : 'neutral', alive: false, ...avatar }),
      h('div', { role: 'status', style: { fontSize: 13 } }, hover ? `${hover.v} ${label} on ${new Date(hover.k + 'T00:00').toDateString()}` : `${total.toLocaleString('en')} ${label} in the last ${weeks} weeks`)),
    h('div', { style: { display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(7,12px)', gap: 3, overflowX: 'auto' }, onPointerLeave: () => setHover(null) },
      Array.from({ length: weeks * 7 }, (_, n) => { const d = addDays(start, n); if (d > end) return h('span', { key: n }); const k = key(d), v = data[k] ?? 0, l = lvl(v)
        return h('span', { key: n, role: 'img', 'aria-label': `${v} ${label} on ${d.toDateString()}`, onPointerEnter: () => setHover({ k, v }), style: { width: 12, height: 12, borderRadius: 3, background: l ? color : 'rgba(127,127,127,.18)', opacity: l ? .25 + (l / (levels - 1)) * .75 : 1 } }) })))
}

/* ---------------- DatePicker ---------------- */
export interface DatePickerProps { value?: Date; onChange?: (d: Date) => void; placeholder?: string; marks?: Record<string, string[]>; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Date input: a button that opens a calendar popover. The face on the button smiles once a date is chosen. */
export function LivatarDatePicker({ value, onChange, placeholder = 'Pick a date', marks, avatar, className, style }: DatePickerProps): ReactElement {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => { if (!open) return; const out = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }; const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false); addEventListener('pointerdown', out); addEventListener('keydown', k); return () => { removeEventListener('pointerdown', out); removeEventListener('keydown', k) } }, [open])
  return h('span', { ref, className, style: { position: 'relative', display: 'inline-block', ...style } },
    h('button', { type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': open, onClick: () => setOpen(!open), style: { ...btn, display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 180 } },
      h(Livatar, { seed: 'picker', size: 24, mood: value ? 'happy' : 'sleepy', alive: false, ...avatar }), value ? value.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : h('span', { style: { opacity: .6 } }, placeholder)),
    open && h('div', { style: { position: 'absolute', top: '110%', left: 0, zIndex: 70, boxShadow: '0 12px 34px rgba(0,0,0,.2)', borderRadius: 14 } }, h(LivatarCalendar, { value, marks, avatar, onChange: (d: Date) => { onChange?.(d); setOpen(false) }, style: { background: 'var(--lv-bg,#fff)', color: 'var(--lv-fg,#1f1a2e)' } })))
}


/* ---------------- Pagination ---------------- */
export interface PaginationProps extends Omit<AvatarProps, 'title'> { page: number; pages: number; onChange: (p: number) => void; className?: string; style?: CSSProperties }
/** Pagination with a face that looks forward or back as you page, and gets sleepy on the last page. */
export function LivatarPagination({ page, pages, onChange, className, style, ...av }: PaginationProps): ReactElement {
  const nums = Array.from({ length: pages }, (_, n) => n + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
  return h('nav', { className, 'aria-label': 'Pagination', style: { display: 'flex', alignItems: 'center', gap: 6, ...style } },
    h(Livatar, { size: 34, mood: page === pages ? 'sleepy' : 'happy', alive: { sleepAfter: 0 }, ...av }),
    h('button', { type: 'button', style: btn, disabled: page <= 1, onClick: () => onChange(page - 1), 'aria-label': 'Previous page' }, '‹'),
    nums.map((n, j) => [j && n - nums[j - 1] > 1 ? h('span', { key: 'e' + n }, '…') : null, h('button', { key: n, type: 'button', 'aria-current': n === page ? 'page' : undefined, onClick: () => onChange(n), style: { ...btn, background: n === page ? accent : 'transparent', color: n === page ? '#fff' : 'inherit' } }, n)]),
    h('button', { type: 'button', style: btn, disabled: page >= pages, onClick: () => onChange(page + 1), 'aria-label': 'Next page' }, '›'))
}

/* ---------------- Alert ---------------- */
export interface AlertProps extends Omit<AvatarProps, 'title'> { type?: 'info' | 'success' | 'warning' | 'error'; title: ReactNode; children?: ReactNode; onClose?: () => void; className?: string; style?: CSSProperties }
const ALERT: Record<string, { mood: Mood; color: string }> = { info: { mood: 'happy', color: '#3b82f6' }, success: { mood: 'starstruck', color: '#22c55e' }, warning: { mood: 'surprised', color: '#f59e0b' }, error: { mood: 'cry', color: '#ef4444' } }
/** Inline alert (Ant/shadcn Alert) with a face whose mood matches the severity. */
export function LivatarAlert({ type = 'info', title, children, onClose, className, style, ...av }: AlertProps): ReactElement {
  const t = ALERT[type]
  return h('div', { role: type === 'error' || type === 'warning' ? 'alert' : 'status', className, style: { ...card, display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderColor: t.color, background: `color-mix(in srgb, ${t.color} 10%, transparent)`, ...style } },
    h(Livatar, { size: 44, mood: t.mood, ...av }), h('div', { style: { flex: 1 } }, h('b', null, title), children && h('div', { style: { opacity: .8, fontSize: 14 } }, children)),
    onClose && h('button', { type: 'button', 'aria-label': 'Dismiss', onClick: onClose, style: bare }, '✕'))
}

/* ---------------- Timeline ---------------- */
export interface TimelineItem { id: string; title: ReactNode; time?: ReactNode; body?: ReactNode; avatar?: AvatarProps }
export interface TimelineProps { items: TimelineItem[]; avatar?: AvatarProps; size?: number; className?: string; style?: CSSProperties }
/** Vertical timeline; each event gets a face on the line. */
export function LivatarTimeline({ items, avatar, size = 36, className, style }: TimelineProps): ReactElement {
  return h('ol', { className, style: { listStyle: 'none', margin: 0, padding: 0, ...style } },
    items.map((it, n) => h('li', { key: it.id, style: { display: 'flex', gap: 12, paddingBottom: n < items.length - 1 ? 18 : 0, position: 'relative' } },
      n < items.length - 1 && h('span', { 'aria-hidden': true, style: { position: 'absolute', left: size / 2 - 1, top: size, bottom: 0, width: 2, background: line } }),
      h('span', { style: { lineHeight: 0, flex: 'none' } }, h(Livatar, { seed: it.id, size, alive: false, ...avatar, ...it.avatar })),
      h('div', null, h('b', null, it.title), it.time && h('small', { style: { opacity: .55, marginLeft: 8 } }, it.time), it.body && h('div', { style: { opacity: .8, fontSize: 14 } }, it.body)))))
}

/* ---------------- Comment ---------------- */
export interface CommentData { id: string; author: string; body: ReactNode; time?: ReactNode; replies?: CommentData[]; avatar?: AvatarProps }
export interface CommentProps { comments: CommentData[]; onReply?: (c: CommentData) => void; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Ant-style threaded comments, faces seeded from the author. */
export function LivatarComment({ comments, onReply, avatar, className, style }: CommentProps): ReactElement {
  const one = (c: CommentData, depth: number): ReactElement =>
    h('li', { key: c.id, style: { display: 'flex', gap: 10, marginTop: depth ? 12 : 0, paddingBottom: 12 } },
      h('span', { style: { lineHeight: 0, flex: 'none' } }, h(Livatar, { seed: c.author, size: depth ? 28 : 36, alive: false, ...avatar, ...c.avatar })),
      h('div', { style: { flex: 1 } }, h('b', null, c.author), c.time && h('small', { style: { opacity: .55, marginLeft: 8 } }, c.time), h('div', null, c.body),
        onReply && h('button', { type: 'button', onClick: () => onReply(c), style: { ...bare, fontSize: 12, opacity: .65 } }, 'Reply'),
        c.replies?.length ? h('ul', { style: { listStyle: 'none', margin: 0, padding: 0 } }, c.replies.map((r) => one(r, depth + 1))) : null))
  return h('ul', { className, style: { listStyle: 'none', margin: 0, padding: 0, ...style } }, comments.map((c) => one(c, 0)))
}

/* ---------------- Result ---------------- */
export interface ResultProps extends Omit<AvatarProps, 'title'> { status: 'success' | 'error' | '404' | '403' | '500' | 'info' | 'warning'; title?: ReactNode; description?: ReactNode; extra?: ReactNode; className?: string; style?: CSSProperties }
const RESULT: Record<string, { mood: Mood; title: string; desc: string }> = {
  success: { mood: 'starstruck', title: 'Success', desc: 'The operation completed.' }, error: { mood: 'cry', title: 'Something went wrong', desc: 'Please try again.' },
  '404': { mood: 'confused', title: 'Page not found', desc: "We looked everywhere." }, '403': { mood: 'angry', title: 'No access', desc: "You don't have permission." },
  '500': { mood: 'scared', title: 'Server error', desc: 'Our side broke. Sorry.' }, info: { mood: 'happy', title: 'Heads up', desc: '' }, warning: { mood: 'surprised', title: 'Careful', desc: '' },
}
/** Ant-style Result page for success, error, 403, 404, 500, info and warning. */
export function LivatarResult({ status, title, description, extra, className, style, ...av }: ResultProps): ReactElement {
  const r = RESULT[status]
  return h('div', { className, role: status === 'success' || status === 'info' ? 'status' : 'alert', style: { textAlign: 'center', padding: 24, display: 'grid', justifyItems: 'center', gap: 8, ...style } },
    h(Livatar, { size: 120, mood: r.mood, ...av }), h('strong', { style: { fontSize: 20 } }, title ?? r.title), (description ?? r.desc) && h('span', { style: { opacity: .7 } }, description ?? r.desc), extra)
}

/* ---------------- Segmented ---------------- */
export interface SegmentedProps { options: { value: string; label: ReactNode; seed?: string }[]; value: string; onChange: (v: string) => void; size?: number; avatar?: AvatarProps; className?: string; style?: CSSProperties }
/** Segmented control where each option has a face; the selected one is happy, the rest doze. */
export function LivatarSegmented({ options, value, onChange, size = 24, avatar, className, style }: SegmentedProps): ReactElement {
  return h('div', { role: 'radiogroup', className, style: { display: 'inline-flex', padding: 3, gap: 2, borderRadius: 12, background: surface, border: `1px solid ${line}`, ...style } },
    options.map((o) => h('button', { key: o.value, type: 'button', role: 'radio', 'aria-checked': o.value === value, onClick: () => onChange(o.value),
      style: { ...bare, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 9, background: o.value === value ? 'var(--lv-bg,#fff)' : 'transparent', color: o.value === value ? 'var(--lv-fg,#1f1a2e)' : 'inherit', boxShadow: o.value === value ? '0 1px 3px rgba(0,0,0,.18)' : 'none', fontWeight: o.value === value ? 700 : 400 } },
      h(Livatar, { seed: o.seed ?? o.value, size, mood: o.value === value ? 'happy' : 'sleepy', alive: false, ...avatar }), o.label)))
}

/* ---------------- Statistic ---------------- */
export interface StatisticProps extends Omit<AvatarProps, 'title'> { title: ReactNode; value: number | string; prefix?: ReactNode; suffix?: ReactNode; trend?: number; className?: string; style?: CSSProperties }
/** KPI card: the face is happy when the trend is up, worried when down. */
export function LivatarStatistic({ title, value, prefix, suffix, trend, className, style, ...av }: StatisticProps): ReactElement {
  const mood: Mood = trend === undefined ? 'neutral' : trend > 0 ? 'happy' : trend < 0 ? 'sad' : 'neutral'
  return h('div', { className, style: { ...card, padding: 16, display: 'flex', alignItems: 'center', gap: 14, ...style } },
    h(Livatar, { size: 56, mood, ...av }),
    h('div', null, h('small', { style: { opacity: .65 } }, title), h('div', { style: { fontSize: 26, fontWeight: 800 } }, prefix, typeof value === 'number' ? value.toLocaleString('en') : value, suffix),
      trend !== undefined && h('small', { style: { color: trend > 0 ? '#22c55e' : trend < 0 ? '#ef4444' : 'inherit' } }, `${trend > 0 ? '▲' : trend < 0 ? '▼' : '–'} ${Math.abs(trend)}%`)))
}

/* ---------------- Tour ---------------- */
export interface TourStep { title: ReactNode; body?: ReactNode }
export interface TourProps extends Omit<AvatarProps, 'title'> { steps: TourStep[]; open: boolean; onClose: () => void; onFinish?: () => void; className?: string; style?: CSSProperties }
/** Onboarding tour: a face guides the user through steps; last step celebrates. */
export function LivatarTour({ steps, open, onClose, onFinish, className, style, ...av }: TourProps): ReactElement | null {
  const [n, setN] = useState(0)
  useEffect(() => { if (open) setN(0) }, [open])
  if (!open || !steps.length) return null
  const s = steps[n], last = n === steps.length - 1
  return h('div', { role: 'dialog', 'aria-label': 'Tour', className, style: { ...card, background: 'var(--lv-bg,#fff)', color: 'var(--lv-fg,#1f1a2e)', width: 'min(340px,100%)', padding: 16, display: 'grid', gap: 10, boxShadow: '0 12px 36px rgba(0,0,0,.2)', ...style } },
    h('div', { style: { display: 'flex', gap: 10, alignItems: 'center' } }, h(Livatar, { size: 56, mood: last ? 'starstruck' : n === 0 ? 'happy' : 'wink', ...av }), h('b', null, s.title)),
    s.body && h('div', { style: { opacity: .8, fontSize: 14 } }, s.body),
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      h('small', { style: { opacity: .55 } }, `${n + 1} / ${steps.length}`),
      h('span', { style: { display: 'flex', gap: 6 } }, h('button', { type: 'button', style: btn, onClick: onClose }, 'Skip'), n > 0 && h('button', { type: 'button', style: btn, onClick: () => setN(n - 1) }, 'Back'),
        h('button', { type: 'button', style: { ...btn, background: accent, color: '#fff', borderColor: accent }, onClick: () => (last ? (onFinish?.(), onClose()) : setN(n + 1)) }, last ? 'Done' : 'Next'))))
}
