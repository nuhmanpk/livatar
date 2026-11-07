'use client'
/* ------------------------------------------------------------------ *
 *  livatar/components: ready-made React / Next.js components and hooks
 *  built on livatar/life. Server rendering outputs the static avatar;
 *  behavior starts in effects. Every component takes the normal
 *  <Livatar> props (variant, seed, size, shape, options, …).
 * ------------------------------------------------------------------ */
import { createElement as h, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type CSSProperties, type FormEvent, type FormHTMLAttributes, type ForwardRefExoticComponent, type ReactElement, type RefAttributes, type ReactNode, type RefObject, type KeyboardEvent as RKeyboardEvent, type DragEvent as RDragEvent, type ChangeEvent as RChangeEvent, type FocusEvent as RFocusEvent, type InputHTMLAttributes } from 'react'
import type { AliveHandle } from './alive'
import type { Mood } from './core'
import { bindForm, type FormBinding, type FormMoods } from './form'
import { Livatar, type LivatarProps } from './react'
import { money } from './styles/money'
import { ui } from './styles/ui'
import { planet } from './styles/planet'
import { office } from './styles/office'
import { tech } from './styles/tech'
import { emoji } from './styles/emoji'
import { animal } from './styles/animal'
import { home } from './styles/home'
import { plant } from './styles/plant'
import { food } from './styles/food'
import { vehicle } from './styles/vehicle'
import { bot } from './styles/bot'
import { personality, type Personality, type PersonalityInput } from './life/personality'
import { assistant, type Assistant, type AssistantState } from './life/assistant'
import { pet, type Pet, type PetOptions, type PetStats } from './life/pet'
import { group, type Group } from './life/group'
import { context, react, type ContextOptions, type LifeEvent } from './life/react'
import { feel } from './life/feel'

export type AvatarProps = Omit<LivatarProps, 'ref'>
type HandleRef = RefObject<AliveHandle | null>
/** Explicit component type: keeps the emitted .d.ts small instead of expanding every prop. */
type WithRef<P> = ForwardRefExoticComponent<P & RefAttributes<AliveHandle | null>>

const useLatest = <T,>(v: T) => {
  const r = useRef(v)
  r.current = v
  return r
}

/* ----------------------------- hooks ----------------------------- */

/** Give the avatar behind `ref` a personality. Returns it once mounted (null during SSR). */
export function usePersonality(ref: HandleRef, input: PersonalityInput = { seed: 'livatar' }): Personality | null {
  const [p, setP] = useState<Personality | null>(null)
  const key = JSON.stringify(input)
  useEffect(() => {
    if (!ref.current) return
    const me = personality(ref.current, input)
    setP(me)
    return () => me.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return p
}

/** Make the avatar aware of time of day, network, tab focus and scrolling. */
export function useContextAware(ref: HandleRef, opts: ContextOptions = {}): void {
  const o = useLatest(opts)
  useEffect(() => (ref.current ? context(ref.current, { ...o.current, onEvent: (e) => (o.current.onEvent ?? ((ev: LifeEvent) => ref.current && react(ref.current, ev)))(e) }) : undefined), [ref, o])
}

/** An assistant controller for the avatar behind `ref`, plus its current state. */
export function useAssistant(ref: HandleRef): [Assistant | null, AssistantState] {
  const [state, setState] = useState<AssistantState>('idle')
  const [ai, setAi] = useState<Assistant | null>(null)
  useEffect(() => {
    if (!ref.current) return
    const a = assistant(ref.current, { onState: setState })
    setAi(a)
    return () => a.destroy()
  }, [ref])
  return [ai, state]
}

/** A virtual pet for the avatar behind `ref`. Stats re-render the component as they change. */
export function usePet(ref: HandleRef, opts: Omit<PetOptions, 'onChange'> = {}): [Pet | null, PetStats | null] {
  const [stats, setStats] = useState<PetStats | null>(null)
  const [p, setP] = useState<Pet | null>(null)
  const o = useLatest(opts)
  const key = opts.key ?? 'livatar:pet'
  useEffect(() => {
    if (!ref.current) return
    const x = pet(ref.current, { ...o.current, onChange: (s) => setStats({ ...s }) })
    setP(x)
    return () => x.destroy()
  }, [ref, key, o])
  return [p, stats]
}

/* --------------------------- components -------------------------- */

const box = (style?: CSSProperties): CSSProperties => ({ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8, ...style })
const muted: CSSProperties = { fontSize: 14, opacity: 0.7 }

export interface LoaderProps extends AvatarProps {
  status?: 'idle' | 'loading' | 'success' | 'error'
  /** Text under the avatar. Default: none. */
  label?: ReactNode
}

/**
 * A loading state with a face: puzzled and glancing around while loading,
 * a happy nod on success, a sad shake on error.
 *
 *   <LivatarLoader status={isPending ? 'loading' : error ? 'error' : 'success'} label="Fetching…" />
 */
export const LivatarLoader: WithRef<LoaderProps> = forwardRef<AliveHandle | null, LoaderProps>(function LivatarLoader({ status = 'loading', label, className, style, ...av }, outer) {
  const ref = useRef<AliveHandle | null>(null)
  useImperativeHandle(outer, () => ref.current as AliveHandle, [])
  useEffect(() => {
    const a = ref.current
    if (!a) return
    if (status === 'loading') {
      a.emote('confused')
      let i = 0
      const glance = () => a.look(i++ % 2 ? -0.6 : 0.6, -0.6, 1100)
      glance()
      const id = setInterval(glance, 1000)
      return () => clearInterval(id)
    }
    if (status === 'success') react(a, 'success')
    if (status === 'error') react(a, 'error')
    if (status === 'idle') a.emote('neutral')
  }, [status])
  return h('div', { className, style: box(style), role: 'status', 'aria-live': 'polite', 'aria-busy': status === 'loading', 'data-status': status },
    h(Livatar, { size: 64, ...av, ref }),
    label != null && h('span', { style: muted }, label))
})

export interface Participant {
  id: string
  name?: string
  speaking?: boolean
  muted?: boolean
  /** Avatar overrides for this person (variant, seed, options…). Default seed: id. */
  avatar?: AvatarProps
}

export interface MeetProps {
  participants: Participant[]
  /** Latest chat message: everyone reacts to its mood. Change `id` to send a new one. */
  message?: { id: string | number; from: string; text: string }
  /** Defaults for every tile (variant, size, shape…). */
  avatar?: AvatarProps
  /** Tile size in px. Default 96. */
  size?: number
  className?: string
  style?: CSSProperties
  /** Render your own tile footer. Default: name + mic status. */
  renderLabel?: (p: Participant) => ReactNode
}

/**
 * A video-call style grid of avatars that notice each other: they greet
 * joiners, look at whoever is speaking and react to chat messages.
 * Drive it from your call SDK's participant list.
 *
 *   <LivatarMeet participants={people.map(p => ({ id: p.id, name: p.name, speaking: p.isSpeaking }))} />
 */
// shared room logic: joins, leaves, speaker, chat mood
function useRoom(participants: Participant[], message?: { id: string | number; from: string; text: string }): [Map<string, AliveHandle | null>, string, { g: Group | null }] {
  const room = useMemo<{ g: Group | null }>(() => ({ g: null }), [])
  const refs = useRef(new Map<string, AliveHandle | null>())
  useEffect(() => {
    room.g = group()
    return () => room.g?.destroy()
  }, [room])
  const ids = participants.map((p) => p.id).join('\u0000')
  useEffect(() => {
    const g = room.g
    if (!g) return
    for (const p of participants) {
      const hd = refs.current.get(p.id)
      if (hd && !g.members.has(p.id)) g.join(p.id, hd)
    }
    for (const id of [...g.members.keys()]) if (!participants.some((p) => p.id === id)) g.leave(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, room])
  const speaker = participants.find((p) => p.speaking && !p.muted)?.id ?? ''
  useEffect(() => {
    const g = room.g
    if (!g) return
    if (speaker) g.speaking(speaker, true)
    else for (const id of g.members.keys()) g.speaking(id, false)
  }, [speaker, room])
  useEffect(() => {
    if (message && room.g) room.g.message(message.from, message.text)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message?.id, room])
  return [refs.current, speaker, room]
}

export function LivatarMeet({ participants, message, avatar, size = 96, className, style, renderLabel }: MeetProps): ReactElement {
  const [refs, speaker] = useRoom(participants, message)
  const ref = (id: string) => (x: AliveHandle | null) => void refs.set(id, x)
  return h('div', { className, style: { display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', ...style }, role: 'list' },
    participants.map((p) =>
      h('div', { key: p.id, role: 'listitem', 'data-speaking': p.id === speaker || undefined, style: box() },
        h('div', { style: { borderRadius: '50%', lineHeight: 0, padding: 3, boxShadow: p.id === speaker ? '0 0 0 3px #7f5af0' : '0 0 0 3px transparent', transition: 'box-shadow .2s' } },
          h(Livatar, { seed: p.id, size, ...avatar, ...p.avatar, ref: ref(p.id) })),
        renderLabel ? renderLabel(p) : h('span', { style: { fontSize: 13, fontWeight: 600 } }, (p.name ?? p.id) + (p.muted ? ' 🔇' : p.id === speaker ? ' 🎙️' : '')),
      )))
}

export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  /** Return false or throw to show the error face; anything else shows success. */
  onSubmit?: (data: FormData, e: FormEvent<HTMLFormElement>) => unknown | Promise<unknown>
  avatar?: AvatarProps
  moods?: FormMoods
  /** Where the avatar sits. Default 'top'. */
  placement?: 'top' | 'left' | 'none'
  children?: ReactNode
}

/**
 * A form with a guardian: it watches the caret, covers its eyes on password
 * fields, reacts to native validation, and to your submit result.
 *
 *   <LivatarForm onSubmit={(data) => signIn(data)}>
 *     <input name="email" type="email" required />
 *     <input name="password" type="password" minLength={8} required />
 *     <button>Sign in</button>
 *   </LivatarForm>
 */
export function LivatarForm({ onSubmit, avatar, moods, placement = 'top', children, style, ...rest }: FormProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const form = useRef<HTMLFormElement>(null)
  const binding = useRef<FormBinding | null>(null)
  const submit = useLatest(onSubmit)
  useEffect(() => {
    if (!ref.current || !form.current) return
    binding.current = bindForm(ref.current, form.current, moods)
    return () => binding.current?.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const handle = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!e.currentTarget.checkValidity()) return
    try {
      const ok = await submit.current?.(new FormData(e.currentTarget), e)
      ok === false ? binding.current?.error() : binding.current?.success()
    } catch (err) {
      binding.current?.error()
      throw err
    }
  }
  const face = placement === 'none' ? null : h(Livatar, { size: 96, seed: 'guard', ...avatar, ref })
  return h('form', { ...rest, ref: form, noValidate: true, onSubmit: handle, style: { display: 'flex', flexDirection: placement === 'left' ? 'row' : 'column', gap: 16, alignItems: placement === 'left' ? 'flex-start' : 'center', ...style } },
    face, h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0, flex: 1, width: placement === 'left' ? undefined : '100%' } }, children))
}

export interface AssistantProps extends AvatarProps {
  /**
   * Current state. Also accepts the Vercel AI SDK `useChat().status`:
   * 'submitted' → thinking, 'streaming' → speaking, 'ready' → done, 'error' → error.
   */
  status?: AssistantState | 'submitted' | 'streaming' | 'ready'
  /** The reply so far. Each time it grows, the mouth moves; the final mood is guessed from it. */
  text?: string
  /** Show the state as a small tag under the avatar. Default false. */
  showState?: boolean
}

const AI_SDK: Record<string, AssistantState> = { submitted: 'thinking', streaming: 'speaking', ready: 'done' }

/**
 * The face of your AI chat. Controlled by props, so it plugs into any chat hook.
 *
 *   const { messages, status } = useChat()
 *   <LivatarAssistant variant={bot} seed="helper" status={status} text={lastAssistantText(messages)} />
 */
export const LivatarAssistant: WithRef<AssistantProps> = forwardRef<AliveHandle | null, AssistantProps>(function LivatarAssistant({ status = 'idle', text = '', showState, className, style, ...av }, outer) {
  const ref = useRef<AliveHandle | null>(null)
  useImperativeHandle(outer, () => ref.current as AliveHandle, [])
  const [ai, state] = useAssistant(ref)
  const want = AI_SDK[status] ?? (status as AssistantState)
  const seen = useRef(0)
  const lastText = useLatest(text)
  useEffect(() => {
    if (!ai) return
    if (want === 'done') {
      if (state === 'idle') return // first render with 'ready': stay idle
      ai.stream(lastText.current.slice(seen.current))
      seen.current = 0
      ai.done()
    } else if (want === 'speaking') {
      ai.set('speaking')
      seen.current = 0
    } else ai.set(want)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ai, want])
  useEffect(() => {
    if (!ai || want !== 'speaking' || text.length <= seen.current) return
    ai.stream(text.slice(seen.current))
    seen.current = text.length
  }, [ai, want, text])
  return h('div', { className, style: box(style), 'data-state': state },
    h(Livatar, { size: 64, ...av, ref }),
    showState && h('span', { style: { ...muted, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' } }, state))
})

export interface PetProps extends AvatarProps {
  /** Pet options (storage key, store, decay…). */
  pet?: Omit<PetOptions, 'onChange'>
  /** Show stat bars and Feed / Play / Sleep buttons. Default true. */
  controls?: boolean
  /** Render your own UI instead of the default controls. */
  children?: (pet: Pet, stats: PetStats) => ReactNode
}

/**
 * A virtual pet with stat bars and buttons, saved in the browser by default.
 *
 *   <LivatarPet variant={animal} seed="mochi" />
 *   <LivatarPet variant={animal} seed="mochi">{(pet, s) => <MyPetUI pet={pet} stats={s} />}</LivatarPet>
 */
export function LivatarPet({ pet: petOpts, controls = true, children, className, style, ...av }: PetProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const [p, s] = usePet(ref, petOpts)
  const bar = (k: string, v: number) =>
    h('div', { key: k, style: { display: 'grid', gridTemplateColumns: '80px 1fr 28px', gap: 8, alignItems: 'center', fontSize: 13 } },
      h('span', null, k),
      h('div', { role: 'meter', 'aria-label': k, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(v), style: { height: 8, borderRadius: 8, background: 'rgba(127,90,240,.15)', overflow: 'hidden' } },
        h('div', { style: { width: `${v}%`, height: '100%', background: '#7f5af0', transition: 'width .3s' } })),
      h('span', null, Math.round(v)))
  const btn = (label: string, fn: () => void) => h('button', { key: label, type: 'button', onClick: fn }, label)
  return h('div', { className, style: box({ alignItems: 'stretch', minWidth: 240, ...style }) },
    h('div', { style: { textAlign: 'center', lineHeight: 0 } }, h(Livatar, { size: 112, ...av, ref })),
    p && s && (children ? children(p, s) : controls && [
      h('div', { key: 'stage', style: { ...muted, textAlign: 'center', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' } }, `${s.asleep ? 'asleep · ' : ''}${s.stage} · level ${s.level}`),
      bar('hunger', s.hunger), bar('energy', s.energy), bar('happiness', s.happiness),
      h('div', { key: 'btns', style: { display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' } },
        btn('Feed', () => p.feed()), btn('Play', () => p.play()), s.asleep ? btn('Wake', () => p.wake()) : btn('Sleep', () => p.sleep())),
    ]))
}

export interface StackUser {
  id: string
  name?: string
  status?: 'online' | 'away' | 'busy' | 'offline'
  avatar?: AvatarProps
}

export interface StackProps {
  users: StackUser[]
  /** Show this many, then "+N". Default 5. */
  max?: number
  size?: number
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

const DOT: Record<string, string> = { online: '#22c55e', away: '#f59e0b', busy: '#ef4444', offline: '#9ca3af' }

/**
 * Overlapping avatars with presence dots and "+N more". Away users look sleepy.
 *
 *   <LivatarStack users={[{ id: 'ada', status: 'online' }, { id: 'bob', status: 'away' }]} />
 */
export function LivatarStack({ users, max = 5, size = 40, avatar, className, style }: StackProps): ReactElement {
  const shown = users.slice(0, max)
  const extra = users.length - shown.length
  const ring = { borderRadius: '50%', boxShadow: '0 0 0 2px var(--lv-ring, #fff)', lineHeight: 0, position: 'relative' as const }
  return h('div', { className, style: { display: 'flex', alignItems: 'center', ...style }, role: 'group', 'aria-label': `${users.length} people` },
    shown.map((u, i) =>
      h('span', { key: u.id, title: u.name ?? u.id, style: { ...ring, marginLeft: i ? -size * 0.28 : 0, zIndex: shown.length - i } },
        h(Livatar, { seed: u.id, size, mood: u.status === 'away' ? 'sleepy' : undefined, alive: { idle: false, sleepAfter: 0 }, ...avatar, ...u.avatar }),
        u.status && h('span', { 'aria-label': u.status, style: { position: 'absolute', right: 0, bottom: 0, width: size * 0.28, height: size * 0.28, borderRadius: '50%', background: DOT[u.status], boxShadow: '0 0 0 2px var(--lv-ring, #fff)' } }))),
    extra > 0 && h('span', { style: { ...ring, marginLeft: -size * 0.28, width: size, height: size, display: 'grid', placeItems: 'center', background: '#ece6dc', color: '#1f1a2e', fontSize: size * 0.32, fontWeight: 700, lineHeight: 1 } }, `+${extra}`))
}

export interface EmptyStateProps extends Omit<AvatarProps, 'title'> {
  title: ReactNode
  description?: ReactNode
  /** e.g. a "Try again" button. */
  action?: ReactNode
  className?: string
  style?: CSSProperties
}

/**
 * An empty state that feels alive: dozes off, wakes up surprised when you hover.
 *
 *   <LivatarEmptyState variant={animal} seed="koala" title="No messages yet" action={<button>Refresh</button>} />
 */
export function LivatarEmptyState({ title, description, action, className, style, ...av }: EmptyStateProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  return h('div', { className, style: { ...box(style), textAlign: 'center', padding: 24 }, onPointerEnter: () => ref.current?.emote('surprised', 900) },
    h(Livatar, { size: 96, mood: 'sleepy', alive: { sleepAfter: 8000 }, ...av, ref }),
    h('strong', { style: { fontSize: 17 } }, title),
    description != null && h('span', { style: muted }, description),
    action)
}

export interface ReactionProps extends AvatarProps {
  /** Text to react to (a comment, a review, the input value). */
  text: string
  /** Hold the mood instead of flashing it. Default false. */
  hold?: boolean
}

/**
 * An avatar that reacts to text as it changes, e.g. next to a comment box.
 *
 *   <LivatarReaction variant={emoji} text={draft} />
 */
export const LivatarReaction: WithRef<ReactionProps> = forwardRef<AliveHandle | null, ReactionProps>(function LivatarReaction({ text, hold, ...av }, outer) {
  const ref = useRef<AliveHandle | null>(null)
  useImperativeHandle(outer, () => ref.current as AliveHandle, [])
  const mood: Mood = feel(text)
  useEffect(() => {
    if (!ref.current) return
    hold ? ref.current.emote(mood) : mood !== 'neutral' && ref.current.emote(mood, 1600)
  }, [mood, hold])
  return h(Livatar, { size: 48, ...av, ref })
})

/* ----------------------------- more ------------------------------ */

export interface BackgroundProps {
  /** Avatar look for the wall. Default: varied per tile via `variants`. */
  avatar?: AvatarProps
  /** Cycle through these styles tile by tile, e.g. [buddy, animal, bot]. */
  variants?: AvatarProps['variant'][]
  /** Tile size in px. Default 56. */
  tile?: number
  /** Gap in px. Default 14. */
  gap?: number
  /** Number of tiles. Default 48. */
  count?: number
  /** Opacity of the wall. Default 0.35. */
  opacity?: number
  /** Seed prefix so the wall is the same on every visit. Default 'bg'. */
  seed?: string
  /** Content on top of the wall. */
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

/**
 * A wall of avatars behind your content, all following the cursor. For heroes,
 * auth pages and waitlists.
 *
 *   <LivatarBackground variants={[buddy, animal, bot]}><h1>Join the waitlist</h1></LivatarBackground>
 */
export function LivatarBackground({ avatar, variants, tile = 56, gap = 14, count = 48, opacity = 0.35, seed = 'bg', children, className, style }: BackgroundProps): ReactElement {
  return h('div', { className, style: { position: 'relative', overflow: 'hidden', isolation: 'isolate', ...style } },
    h('div', { 'aria-hidden': true, style: { position: 'absolute', inset: 0, zIndex: -1, display: 'flex', flexWrap: 'wrap', gap, padding: gap, alignContent: 'center', justifyContent: 'center', opacity, pointerEvents: 'none' } },
      Array.from({ length: count }, (_, i) =>
        h(Livatar, { key: i, seed: `${seed}-${i}`, size: tile, ...(variants?.length ? { variant: variants[i % variants.length] } : null), ...avatar, alive: { poke: false, range: 600 } }))),
    children)
}

export interface ChatMessage {
  id: string | number
  from: string
  text: string
  /** Your own messages sit on the right. */
  me?: boolean
}

export interface ChatProps {
  messages: ChatMessage[]
  /** Who is typing right now (their avatar talks). */
  typing?: string
  avatar?: AvatarProps
  /** Per-person avatar overrides. */
  people?: Record<string, AvatarProps>
  size?: number
  className?: string
  style?: CSSProperties
}

/**
 * A chat thread where every sender has a living avatar: the latest sender
 * talks and shows the mood of their message, and typing makes the mouth move.
 *
 *   <LivatarChat messages={messages} typing={isTyping ? 'bot' : undefined} people={{ bot: { variant: bot } }} />
 */
export function LivatarChat({ messages, typing, avatar, people = {}, size = 36, className, style }: ChatProps): ReactElement {
  const refs = useRef(new Map<string | number, AliveHandle | null>())
  const last = messages[messages.length - 1]
  useEffect(() => {
    if (!last) return
    const a = refs.current.get(last.id)
    if (!a) return
    a.talk(Math.min(2400, 300 + last.text.length * 35))
    const m = feel(last.text)
    if (m !== 'neutral') a.emote(m, 1800)
  }, [last?.id])
  const typer = useRef<AliveHandle | null>(null)
  useEffect(() => {
    if (!typing) return
    const id = setInterval(() => typer.current?.talk(500), 450)
    return () => clearInterval(id)
  }, [typing])
  const row = (key: string | number, from: string, me: boolean | undefined, body: ReactNode, ref?: (x: AliveHandle | null) => void) =>
    h('div', { key, style: { display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: me ? 'row-reverse' : 'row' } },
      h(Livatar, { seed: from, size, ...avatar, ...people[from], ref, alive: { poke: false } }),
      body)
  const bubble = (text: ReactNode, me?: boolean) =>
    h('div', { style: { maxWidth: '75%', padding: '8px 12px', borderRadius: 16, fontSize: 14, lineHeight: 1.45, background: me ? '#7f5af0' : 'rgba(127,127,127,.12)', color: me ? '#fff' : undefined, [me ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 4 } }, text)
  return h('div', { className, role: 'log', 'aria-live': 'polite', style: { display: 'flex', flexDirection: 'column', gap: 10, ...style } },
    messages.map((m) => row(m.id, m.from, m.me, bubble(m.text, m.me), (x) => void refs.current.set(m.id, x))),
    typing && row('typing', typing, false, bubble(h('span', { 'aria-label': `${typing} is typing` }, '•••')), (x) => void (typer.current = x)))
}

export interface ToastProps extends Omit<AvatarProps, 'title'> {
  open?: boolean
  type?: 'success' | 'error' | 'info' | 'warning'
  title: ReactNode
  description?: ReactNode
  onClose?: () => void
  /** Auto-close after ms (calls onClose). 0 = stay. Default 4000. */
  duration?: number
  className?: string
  style?: CSSProperties
}

const TOAST_EVENT: Record<string, LifeEvent> = { success: 'success', error: 'error', warning: 'warning', info: 'message' }

/**
 * A notification whose avatar reacts to it: a nod for success, a shake for errors.
 *
 *   <LivatarToast open={saved} type="success" title="Saved" onClose={() => setSaved(false)} />
 */
export function LivatarToast({ open = true, type = 'info', title, description, onClose, duration = 4000, className, style, ...av }: ToastProps): ReactElement | null {
  const ref = useRef<AliveHandle | null>(null)
  const close = useLatest(onClose)
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => ref.current && react(ref.current, TOAST_EVENT[type]), 120)
    const c = duration ? setTimeout(() => close.current?.(), duration) : undefined
    return () => (clearTimeout(t), clearTimeout(c))
  }, [open, type, duration, close])
  if (!open) return null
  return h('div', { className, role: type === 'error' ? 'alert' : 'status', style: { display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', borderRadius: 16, background: 'var(--lv-card, #fff)', color: 'var(--lv-fg, #1f1a2e)', boxShadow: '0 8px 30px rgba(0,0,0,.12)', border: '1px solid rgba(127,127,127,.18)', minWidth: 260, ...style } },
    h(Livatar, { seed: 'toast-' + type, size: 40, ...av, ref }),
    h('div', { style: { flex: 1, minWidth: 0 } }, h('div', { style: { fontWeight: 700, fontSize: 14 } }, title), description != null && h('div', { style: { ...muted, fontSize: 13 } }, description)),
    onClose && h('button', { type: 'button', onClick: onClose, 'aria-label': 'Close', style: { background: 'none', border: 0, cursor: 'pointer', fontSize: 18, color: 'inherit', opacity: 0.6 } }, '×'))
}

export interface NotFoundProps extends Omit<AvatarProps, 'title'> {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  /** The big code. Default '404'. */
  code?: ReactNode
  className?: string
  style?: CSSProperties
}

/**
 * A 404 / error page with a lost, confused character that looks around for the page.
 *
 *   <LivatarNotFound action={<a href="/">Take me home</a>} />
 */
export function LivatarNotFound({ title = 'This page wandered off', description = "We looked everywhere. It isn't here.", action, code = '404', className, style, ...av }: NotFoundProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  useEffect(() => {
    let i = 0
    const id = setInterval(() => ref.current?.look(i++ % 2 ? -0.8 : 0.8, 0.2, 1200), 1400)
    return () => clearInterval(id)
  }, [])
  return h('div', { className, style: { ...box(style), textAlign: 'center', padding: 32, gap: 12 } },
    h('div', { style: { fontSize: 64, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, opacity: 0.15 } }, code),
    h(Livatar, { seed: 'lost', size: 128, mood: 'confused', ...av, ref }),
    h('strong', { style: { fontSize: 20 } }, title),
    description != null && h('span', { style: muted }, description),
    action)
}

export interface TypingProps extends AvatarProps {
  /** Name shown as "<name> is typing". */
  name?: string
  className?: string
  style?: CSSProperties
}

/**
 * "Ada is typing…" with a mouth that moves.
 *
 *   {isTyping && <LivatarTyping seed="ada" name="Ada" />}
 */
export function LivatarTyping({ name, className, style, ...av }: TypingProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  useEffect(() => {
    const id = setInterval(() => ref.current?.talk(500), 450)
    return () => clearInterval(id)
  }, [])
  return h('div', { className, role: 'status', style: { display: 'inline-flex', gap: 8, alignItems: 'center', ...style } },
    h(Livatar, { size: 28, ...av, ref, alive: { poke: false } }),
    h('span', { style: muted }, name ? `${name} is typing…` : 'typing…'))
}

export interface ProfileCardProps extends AvatarProps {
  name: ReactNode
  role?: ReactNode
  status?: 'online' | 'away' | 'busy' | 'offline'
  /** Buttons or links (Follow, Message…). */
  action?: ReactNode
  className?: string
  style?: CSSProperties
}

/**
 * A profile card that waves hello (happy nod) when you hover it.
 *
 *   <LivatarProfileCard seed={user.id} name={user.name} role="Engineer" status="online" />
 */
export function LivatarProfileCard({ name, role, status, action, className, style, ...av }: ProfileCardProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  return h('div', { className, onPointerEnter: () => { ref.current?.emote('happy', 1400); ref.current?.nod() }, style: { ...box(style), padding: 20, borderRadius: 20, border: '1px solid rgba(127,127,127,.18)', minWidth: 200 } },
    h('div', { style: { position: 'relative', lineHeight: 0 } },
      h(Livatar, { size: 88, mood: status === 'away' ? 'sleepy' : undefined, ...av, ref }),
      status && h('span', { 'aria-label': status, style: { position: 'absolute', right: 4, bottom: 4, width: 16, height: 16, borderRadius: '50%', background: DOT[status], boxShadow: '0 0 0 3px var(--lv-card, #fff)' } })),
    h('strong', { style: { fontSize: 16 } }, name),
    role != null && h('span', { style: { ...muted, marginTop: -6 } }, role),
    action)
}

export interface TestimonialProps extends Omit<AvatarProps, 'title'> {
  quote: ReactNode
  name: ReactNode
  title?: ReactNode
  className?: string
  style?: CSSProperties
}

/**
 * A testimonial whose author reacts to their own words (loves a glowing review).
 *
 *   <LivatarTestimonial seed="ada" quote="Our signup page finally smiles back." name="Ada" title="Founder" />
 */
export function LivatarTestimonial({ quote, name, title, className, style, ...av }: TestimonialProps): ReactElement {
  const mood: Mood = typeof quote === 'string' ? feel(quote) : 'happy'
  return h('figure', { className, style: { margin: 0, padding: 20, borderRadius: 20, border: '1px solid rgba(127,127,127,.18)', display: 'flex', flexDirection: 'column', gap: 14, ...style } },
    h('blockquote', { style: { margin: 0, fontSize: 15, lineHeight: 1.55 } }, typeof quote === 'string' ? `“${quote}”` : quote),
    h('figcaption', { style: { display: 'flex', gap: 10, alignItems: 'center' } },
      h(Livatar, { size: 40, mood: mood === 'neutral' ? 'happy' : mood, ...av }),
      h('div', null, h('div', { style: { fontWeight: 700, fontSize: 14 } }, name), title != null && h('div', { style: { ...muted, fontSize: 13 } }, title))))
}

/* -------------------- themed: each with its own character -------------------- */

const field: CSSProperties = { font: 'inherit', fontSize: 15, padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(127,127,127,.3)', background: 'transparent', color: 'inherit', minWidth: 0, width: '100%', boxSizing: 'border-box' }
const primary: CSSProperties = { font: 'inherit', fontWeight: 700, padding: '11px 16px', borderRadius: 12, border: 0, background: '#7f5af0', color: '#fff', cursor: 'pointer' }

export interface CheckoutProps {
  /** e.g. "$24.00". */
  amount: ReactNode
  /** Charge the card. Return false or throw for a decline. */
  onPay?: (card: { number: string; expiry: string; cvc: string; name: string }) => unknown | Promise<unknown>
  /** The character. Default: the money style's card. */
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

/**
 * A checkout card that is the card: it watches you type its number, covers its
 * eyes for the CVC, looks nervous while charging, and is thrilled when paid.
 *
 *   <LivatarCheckout amount="$24.00" onPay={(card) => charge(card)} />
 */
export function LivatarCheckout({ amount, onPay, avatar, className, style }: CheckoutProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const [state, setState] = useState<'idle' | 'paying' | 'paid' | 'declined'>('idle')
  const pay = useLatest(onPay)
  const fmt = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})(?=.)/g, '$1 ')
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const card = { number: String(f.get('number') ?? '').replace(/\s/g, ''), expiry: String(f.get('expiry') ?? ''), cvc: String(f.get('cvc') ?? ''), name: String(f.get('name') ?? '') }
    if (card.number.length < 12 || card.cvc.length < 3) {
      ref.current?.emote('confused', 1500)
      ref.current?.shake()
      return
    }
    setState('paying')
    ref.current?.emote('surprised')
    try {
      const ok = await pay.current?.(card)
      if (ok === false) throw new Error('declined')
      setState('paid')
      ref.current?.emote('love', 3000)
      ref.current?.nod()
    } catch {
      setState('declined')
      ref.current?.emote('sad', 2500)
      ref.current?.shake()
    }
  }
  return h('form', { className, onSubmit: submit, noValidate: true, style: { display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340, ...style } },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
      h(Livatar, { variant: money, seed: 'checkout', options: { kind: 'card' }, size: 72, ...avatar, ref }),
      h('div', null, h('div', { style: { ...muted, fontSize: 13 } }, 'Total'), h('div', { style: { fontSize: 24, fontWeight: 800 } }, amount))),
    h('input', { name: 'name', placeholder: 'Name on card', autoComplete: 'cc-name', 'aria-label': 'Name on card', style: field }),
    h('input', { name: 'number', placeholder: '4242 4242 4242 4242', inputMode: 'numeric', autoComplete: 'cc-number', 'aria-label': 'Card number', style: field, onInput: (e: FormEvent<HTMLInputElement>) => (e.currentTarget.value = fmt(e.currentTarget.value)) }),
    h('div', { style: { display: 'flex', gap: 10 } },
      h('input', { name: 'expiry', placeholder: 'MM / YY', autoComplete: 'cc-exp', 'aria-label': 'Expiry', style: field }),
      // a password field, so the card covers its eyes while you type the CVC
      h('input', { name: 'cvc', type: 'password', placeholder: 'CVC', inputMode: 'numeric', maxLength: 4, autoComplete: 'cc-csc', 'aria-label': 'CVC', style: field })),
    h('button', { type: 'submit', disabled: state === 'paying', style: { ...primary, opacity: state === 'paying' ? 0.7 : 1 } },
      state === 'paying' ? 'Charging…' : state === 'paid' ? 'Paid ✓' : state === 'declined' ? 'Declined, try again' : h('span', null, 'Pay ', amount)),
    h('span', { role: 'status', style: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' } }, state === 'paid' ? 'Payment successful' : state === 'declined' ? 'Payment declined' : ''))
}

export interface CartButtonProps extends Omit<AvatarProps, 'onClick'> {
  count: number
  onClick?: () => void
  label?: string
  className?: string
  style?: CSSProperties
}

/**
 * A cart that cheers when you add something and looks sad when you empty it.
 *
 *   <LivatarCartButton count={items.length} onClick={openCart} />
 */
export function LivatarCartButton({ count, onClick, label = 'Cart', className, style, ...av }: CartButtonProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const prev = useRef(count)
  useEffect(() => {
    if (count > prev.current) { ref.current?.emote('happy', 1200); ref.current?.nod() }
    else if (count < prev.current) ref.current?.emote(count ? 'surprised' : 'sad', 1400)
    prev.current = count
  }, [count])
  return h('button', { type: 'button', onClick, className, 'aria-label': `${label}, ${count} item${count === 1 ? '' : 's'}`, style: { position: 'relative', border: 0, padding: 0, background: 'none', cursor: 'pointer', lineHeight: 0, ...style } },
    h(Livatar, { variant: ui, seed: 'cart', options: { kind: 'cart', badge: false }, size: 52, ...av, ref }),
    count > 0 && h('span', { 'aria-hidden': true, style: { position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, padding: '0 5px', borderRadius: 10, background: '#ff4d6d', color: '#fff', fontSize: 12, fontWeight: 800, lineHeight: '20px', boxSizing: 'border-box' } }, count))
}

export interface UploadProps {
  /** Called with the dropped or picked files. Return false or throw to show failure. */
  onFiles?: (files: File[]) => unknown | Promise<unknown>
  accept?: string
  multiple?: boolean
  label?: ReactNode
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

/**
 * A drop zone whose folder gasps when you drag a file over it, chews while
 * uploading and beams when it's done.
 *
 *   <LivatarUpload onFiles={(files) => upload(files)} />
 */
export function LivatarUpload({ onFiles, accept, multiple = true, label = 'Drop files here or click to browse', avatar, className, style }: UploadProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [msg, setMsg] = useState<ReactNode>(label)
  const cb = useLatest(onFiles)
  const take = async (list: FileList | null) => {
    const files = [...(list ?? [])]
    if (!files.length) return
    setMsg(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}…`)
    ref.current?.emote('neutral')
    const chew = setInterval(() => ref.current?.talk(400), 380)
    try {
      if ((await cb.current?.(files)) === false) throw 0
      setMsg('Done!')
      react(ref.current!, 'success')
    } catch {
      setMsg('Upload failed')
      react(ref.current!, 'error')
    } finally {
      clearInterval(chew)
    }
  }
  return h('div', {
    className, role: 'button', tabIndex: 0, 'aria-label': typeof label === 'string' ? label : 'Upload files',
    onClick: () => input.current?.click(),
    onKeyDown: (e: RKeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), input.current?.click()),
    onDragOver: (e: RDragEvent) => { e.preventDefault(); if (!over) { setOver(true); ref.current?.emote('surprised') } },
    onDragLeave: () => { setOver(false); ref.current?.emote('neutral') },
    onDrop: (e: RDragEvent) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files) },
    style: { ...box(style), padding: 24, borderRadius: 20, border: `2px dashed ${over ? '#7f5af0' : 'rgba(127,127,127,.35)'}`, background: over ? 'rgba(127,90,240,.08)' : undefined, cursor: 'pointer', transition: 'all .15s', minWidth: 240 },
  },
    h(Livatar, { variant: office, seed: 'upload', options: { kind: 'folder' }, size: 80, ...avatar, ref }),
    h('span', { style: muted, 'aria-live': 'polite' }, msg),
    h('input', { ref: input, type: 'file', accept, multiple, hidden: true, onChange: (e: RChangeEvent<HTMLInputElement>) => take(e.currentTarget.files) }))
}

export interface ThemeToggleProps {
  dark: boolean
  onChange: (dark: boolean) => void
  size?: number
  className?: string
  style?: CSSProperties
}

/**
 * A sun that becomes a sleepy moon. Controlled: wire it to your theme state.
 *
 *   <LivatarThemeToggle dark={theme === 'dark'} onChange={(d) => setTheme(d ? 'dark' : 'light')} />
 */
export function LivatarThemeToggle({ dark, onChange, size = 40, className, style }: ThemeToggleProps): ReactElement {
  return h('button', { type: 'button', className, onClick: () => onChange(!dark), 'aria-label': dark ? 'Switch to light mode' : 'Switch to dark mode', 'aria-pressed': dark, style: { border: 0, padding: 0, background: 'none', cursor: 'pointer', lineHeight: 0, ...style } },
    h(Livatar, { key: dark ? 'moon' : 'sun', variant: planet, seed: 'theme', size, background: false, mood: dark ? 'sleepy' : 'happy', options: { kind: dark ? 'moon' : 'sun', satellite: false, stars: false } }))
}

export interface PasswordStrengthProps {
  /** The password to rate. */
  value: string
  /** Your own scorer, 0…4. Default: length + character variety. */
  score?: (value: string) => number
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

const STRENGTH: [Mood, string][] = [['sad', 'Too weak'], ['confused', 'Weak'], ['neutral', 'Okay'], ['happy', 'Strong'], ['love', 'Very strong']]
const rate = (v: string) => (v ? Math.min(4, Math.floor((Math.min(v.length, 16) / 16) * 2 + [/[a-z]/, /[A-Z]/, /\d/, /[^\w]/].filter((r) => r.test(v)).length * 0.6)) : 0)

/**
 * A padlock that gets braver as the password gets stronger.
 *
 *   <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
 *   <LivatarPasswordStrength value={pw} />
 */
export function LivatarPasswordStrength({ value, score = rate, avatar, className, style }: PasswordStrengthProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const sc = Math.max(0, Math.min(4, Math.round(score(value))))
  useEffect(() => {
    if (value) ref.current?.emote(STRENGTH[sc][0])
  }, [sc, !value])
  return h('div', { className, style: { display: 'flex', alignItems: 'center', gap: 10, ...style } },
    h(Livatar, { variant: ui, seed: 'lock', options: { kind: 'lock', badge: false }, size: 40, mood: value ? STRENGTH[sc][0] : 'neutral', ...avatar, ref }),
    h('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 } },
      h('div', { role: 'meter', 'aria-label': 'Password strength', 'aria-valuemin': 0, 'aria-valuemax': 4, 'aria-valuenow': sc, 'aria-valuetext': STRENGTH[sc][1], style: { display: 'flex', gap: 4 } },
        [0, 1, 2, 3].map((i) => h('i', { key: i, style: { flex: 1, height: 6, borderRadius: 6, background: value && i < Math.max(1, sc) ? ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#16a34a'][sc] : 'rgba(127,127,127,.2)', transition: 'background .2s' } }))),
      h('span', { style: { ...muted, fontSize: 12 } }, value ? STRENGTH[sc][1] : 'Enter a password')))
}

export interface RatingProps {
  value: number
  onChange: (value: number) => void
  /** Number of steps. Default 5. */
  max?: number
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

/**
 * A rating whose face follows the score, from furious to in love.
 *
 *   <LivatarRating value={stars} onChange={setStars} />
 */
export function LivatarRating({ value, onChange, max = 5, avatar, className, style }: RatingProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const moods: Mood[] = ['angry', 'sad', 'neutral', 'happy', 'love']
  const mood = value ? moods[Math.min(4, Math.round(((value - 1) / Math.max(1, max - 1)) * 4))] : 'neutral'
  useEffect(() => void ref.current?.emote(mood), [mood])
  return h('div', { className, style: { display: 'flex', alignItems: 'center', gap: 12, ...style } },
    h(Livatar, { variant: emoji, seed: 'rating', size: 56, mood, ...avatar, ref }),
    h('div', { role: 'radiogroup', 'aria-label': 'Rating', style: { display: 'flex', gap: 2 } },
      Array.from({ length: max }, (_, i) => h('button', { key: i, type: 'button', role: 'radio', 'aria-checked': value === i + 1, 'aria-label': `${i + 1} of ${max}`, onClick: () => onChange(i + 1), style: { border: 0, background: 'none', cursor: 'pointer', fontSize: 26, padding: 2, color: i < value ? '#f5b301' : 'rgba(127,127,127,.35)', lineHeight: 1 } }, '★'))))
}

export interface ConnectionProps {
  /** Override the detected state (e.g. from your websocket). */
  online?: boolean
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

/**
 * A little cloud that sulks when the connection drops and cheers when it's back.
 *
 *   <LivatarConnection />            // follows navigator.onLine
 *   <LivatarConnection online={socket.connected} />
 */
export function LivatarConnection({ online, avatar, className, style }: ConnectionProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const [net, setNet] = useState(true)
  useEffect(() => {
    if (typeof window === 'undefined') return
    setNet(navigator.onLine)
    const up = () => setNet(true), down = () => setNet(false)
    addEventListener('online', up); addEventListener('offline', down)
    return () => (removeEventListener('online', up), removeEventListener('offline', down))
  }, [])
  const on = online ?? net
  const first = useRef(true)
  useEffect(() => {
    if (first.current) return void (first.current = false)
    ref.current && react(ref.current, on ? 'online' : 'offline')
  }, [on])
  return h('div', { className, role: 'status', style: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px', borderRadius: 99, background: on ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.12)', ...style } },
    h(Livatar, { variant: tech, seed: 'net', options: { kind: 'cloud', leds: true }, size: 32, mood: on ? 'happy' : 'sad', ...avatar, ref }),
    h('span', { style: { fontSize: 13, fontWeight: 700 } }, on ? 'Online' : 'Offline'))
}

/* -------------------- inline fields: the character lives inside the input -------------------- */

const shell = (focus: boolean, extra?: CSSProperties): CSSProperties => ({ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px 4px 4px', borderRadius: 14, border: `1.5px solid ${focus ? '#7f5af0' : 'rgba(127,127,127,.3)'}`, boxShadow: focus ? '0 0 0 4px rgba(127,90,240,.15)' : 'none', background: 'var(--lv-card, transparent)', transition: 'border-color .15s, box-shadow .15s', ...extra })
const bare: CSSProperties = { flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', color: 'inherit', font: 'inherit', fontSize: 15, padding: '8px 4px' }

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Avatar props. It sits inside the field on a transparent background. */
  avatar?: AvatarProps
  /** Custom check. Default: the browser's own validity (type, required, pattern…). */
  validate?: (value: string) => boolean
  /** Something on the right, like a button. */
  end?: ReactNode
  /** Avatar size in px. Default 34. */
  face?: number
}

/**
 * A text field with a face inside it: it watches the caret, covers its eyes on
 * password fields, smiles once the value is valid and looks puzzled when it isn't.
 *
 *   <LivatarInput type="email" placeholder="you@example.com" required />
 */
export const LivatarInput: WithRef<InputProps> = forwardRef<AliveHandle | null, InputProps>(function LivatarInput({ avatar, validate, end, face = 34, className, style, onFocus, onBlur, onInput, ...input }, outer) {
  const ref = useRef<AliveHandle | null>(null)
  useImperativeHandle(outer, () => ref.current as AliveHandle, [])
  const [focus, setFocus] = useState(false)
  const last = useRef<boolean | null>(null)
  const check = (el: HTMLInputElement, final: boolean) => {
    if (!el.value) return (last.current = null), ref.current?.emote('neutral')
    const ok = validate ? validate(el.value) : el.checkValidity()
    if (ok && last.current !== true) ref.current?.emote('happy')
    else if (!ok && final) ref.current?.emote('confused', 1600)
    else if (!ok && last.current) ref.current?.emote('neutral')
    last.current = ok
  }
  return h('label', { className, style: shell(focus, { cursor: 'text', ...style }) },
    h(Livatar, { seed: 'field-' + (input.name ?? input.type ?? 'x'), variant: emoji, size: face, background: false, ...avatar, ref }),
    h('input', { ...input, style: bare,
      onFocus: (e: RFocusEvent<HTMLInputElement>) => (setFocus(true), onFocus?.(e)),
      onBlur: (e: RFocusEvent<HTMLInputElement>) => (setFocus(false), check(e.currentTarget, true), onBlur?.(e)),
      onInput: (e: FormEvent<HTMLInputElement>) => (check(e.currentTarget, false), onInput?.(e as Parameters<NonNullable<typeof onInput>>[0])) }),
    end)
})

export interface SearchProps {
  /** Run the search. Return the results (array) or a count; 0 / [] shows "nothing found". */
  onSearch: (query: string) => unknown[] | number | Promise<unknown[] | number>
  placeholder?: string
  /** Debounce in ms. Default 300. */
  debounce?: number
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

/**
 * A search field with an owl inside: it chews while searching, beams at results
 * and droops when nothing turns up.
 *
 *   <LivatarSearch onSearch={async (q) => (await fetch('/api/search?q=' + q)).json()} />
 */
export function LivatarSearch({ onSearch, placeholder = 'Search…', debounce = 300, avatar, className, style }: SearchProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const [focus, setFocus] = useState(false)
  const [note, setNote] = useState('')
  const run = useLatest(onSearch)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const seq = useRef(0)
  const go = (q: string) => {
    clearTimeout(timer.current)
    if (!q.trim()) return setNote(''), ref.current?.emote('neutral')
    timer.current = setTimeout(async () => {
      const n = ++seq.current
      const chew = setInterval(() => ref.current?.talk(300), 280)
      ref.current?.look(0.7, -0.4, 800)
      try {
        const r = await run.current(q)
        if (n !== seq.current) return
        const count = typeof r === 'number' ? r : r.length
        setNote(count ? `${count} result${count === 1 ? '' : 's'}` : 'Nothing found')
        ref.current?.emote(count ? 'happy' : 'sad', 1800)
      } catch {
        setNote('Search failed')
        ref.current?.emote('confused', 1800)
      } finally {
        clearInterval(chew)
      }
    }, debounce)
  }
  return h('div', { className, role: 'search', style: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 260, ...style } },
    h('label', { style: shell(focus, { cursor: 'text' }) },
      h(Livatar, { variant: animal, seed: 'search', options: { species: 'owl' }, size: 34, background: false, ...avatar, ref }),
      h('input', { type: 'search', placeholder, 'aria-label': placeholder, style: bare, onFocus: () => setFocus(true), onBlur: () => setFocus(false), onInput: (e: FormEvent<HTMLInputElement>) => go(e.currentTarget.value) })),
    h('span', { 'aria-live': 'polite', style: { ...muted, fontSize: 12, minHeight: 16, paddingLeft: 6 } }, note))
}

export interface OTPProps {
  /** Number of digits. Default 6. */
  length?: number
  /** Check the code. Return false or throw for a wrong code. */
  onComplete?: (code: string) => unknown | Promise<unknown>
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

/**
 * A one-time code input guarded by a key: it watches each digit, nods when the
 * code is right and shakes when it's wrong. Paste works.
 *
 *   <LivatarOTP onComplete={(code) => verify(code)} />
 */
export function LivatarOTP({ length = 6, onComplete, avatar, className, style }: OTPProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const [vals, setVals] = useState<string[]>(() => Array(length).fill(''))
  const [state, setState] = useState<'idle' | 'checking' | 'ok' | 'bad'>('idle')
  const boxes = useRef<(HTMLInputElement | null)[]>([])
  const done = useLatest(onComplete)
  const submit = async (code: string) => {
    setState('checking')
    const chew = setInterval(() => ref.current?.talk(300), 280)
    try {
      if ((await done.current?.(code)) === false) throw 0
      setState('ok'); ref.current?.emote('love', 2500); ref.current?.nod()
    } catch {
      setState('bad'); ref.current?.emote('angry', 1500); ref.current?.shake()
      setTimeout(() => { setVals(Array(length).fill('')); setState('idle'); boxes.current[0]?.focus() }, 900)
    } finally { clearInterval(chew) }
  }
  const put = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (!digits && raw) return
    const next = [...vals]
    if (!digits) next[i] = ''
    for (let k = 0; k < digits.length && i + k < length; k++) next[i + k] = digits[k]
    setVals(next)
    const to = Math.min(length - 1, i + Math.max(1, digits.length))
    if (digits) boxes.current[to]?.focus()
    if (next.every(Boolean)) submit(next.join(''))
  }
  const color = state === 'ok' ? '#22c55e' : state === 'bad' ? '#ef4444' : undefined
  return h('div', { className, style: { display: 'flex', alignItems: 'center', gap: 12, ...style } },
    h(Livatar, { variant: home, seed: 'otp', options: { kind: 'key' }, size: 52, ...avatar, ref }),
    h('div', { role: 'group', 'aria-label': 'One-time code', style: { display: 'flex', gap: 6 } },
      vals.map((v, i) => h('input', { key: i, ref: (el: HTMLInputElement | null) => void (boxes.current[i] = el), value: v, inputMode: 'numeric', autoComplete: i ? 'off' : 'one-time-code', maxLength: length, 'aria-label': `Digit ${i + 1}`, disabled: state === 'checking' || state === 'ok',
        onChange: (e: RChangeEvent<HTMLInputElement>) => put(i, e.currentTarget.value.slice(v ? 1 : 0) || e.currentTarget.value),
        onKeyDown: (e: RKeyboardEvent<HTMLInputElement>) => { if (e.key === 'Backspace' && !v && i) boxes.current[i - 1]?.focus() },
        style: { width: 40, height: 48, textAlign: 'center', fontSize: 20, fontWeight: 700, borderRadius: 12, border: `1.5px solid ${color ?? 'rgba(127,127,127,.3)'}`, background: 'transparent', color: 'inherit', outline: 'none', transition: 'border-color .15s' } }))))
}

export interface NewsletterProps {
  onSubscribe?: (email: string) => unknown | Promise<unknown>
  placeholder?: string
  button?: ReactNode
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

/**
 * An inline signup pill with a sprout inside. Subscribe and it blooms into a sunflower.
 *
 *   <LivatarNewsletter onSubscribe={(email) => subscribe(email)} />
 */
export function LivatarNewsletter({ onSubscribe, placeholder = 'you@example.com', button = 'Subscribe', avatar, className, style }: NewsletterProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const [focus, setFocus] = useState(false)
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const cb = useLatest(onSubscribe)
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const input = e.currentTarget.elements.namedItem('email') as HTMLInputElement
    if (!input.checkValidity()) return ref.current?.emote('confused', 1500), ref.current?.shake()
    setState('busy')
    try {
      if ((await cb.current?.(input.value)) === false) throw 0
      setState('done')
    } catch { setState('error'); ref.current?.emote('sad', 1800) }
  }
  return h('form', { className, onSubmit: submit, noValidate: true, style: shell(focus, { padding: 4, borderRadius: 999, maxWidth: 420, ...style }) },
    h(Livatar, { key: state === 'done' ? 'bloom' : 'sprout', variant: plant, seed: 'news', size: 40, background: false, mood: state === 'done' ? 'love' : undefined, options: { kind: state === 'done' ? 'sunflower' : 'sprout', pot: 'round' }, ...avatar, ref }),
    state === 'done'
      ? h('span', { role: 'status', style: { flex: 1, fontWeight: 700, padding: '0 8px' } }, "You're in! 🌻")
      : h('input', { name: 'email', type: 'email', required: true, placeholder, 'aria-label': 'Email', style: bare, onFocus: () => setFocus(true), onBlur: () => setFocus(false) }),
    state !== 'done' && h('button', { type: 'submit', disabled: state === 'busy', style: { ...primary, borderRadius: 999, padding: '10px 18px' } }, state === 'busy' ? '…' : button))
}

/* -------------------- more themed components -------------------- */

export interface CookieConsentProps {
  onAccept?: () => void
  onDecline?: () => void
  title?: ReactNode
  description?: ReactNode
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

/**
 * A cookie banner with a donut who really hopes you say yes.
 *
 *   <LivatarCookieConsent onAccept={allow} onDecline={deny} />
 */
export function LivatarCookieConsent({ onAccept, onDecline, title = 'Cookies? Donuts?', description = 'We use cookies to make things work and to see what you like.', avatar, className, style }: CookieConsentProps): ReactElement | null {
  const ref = useRef<AliveHandle | null>(null)
  const [gone, setGone] = useState(false)
  const pick = (yes: boolean) => {
    ref.current?.emote(yes ? 'love' : 'sad', 1200)
    yes ? ref.current?.nod() : ref.current?.shake()
    setTimeout(() => { setGone(true); (yes ? onAccept : onDecline)?.() }, 900)
  }
  if (gone) return null
  return h('div', { className, role: 'dialog', 'aria-label': 'Cookie consent', style: { display: 'flex', gap: 14, alignItems: 'center', padding: 16, borderRadius: 20, background: 'var(--lv-card, #fff)', color: 'var(--lv-fg, #1f1a2e)', boxShadow: '0 12px 40px rgba(0,0,0,.14)', border: '1px solid rgba(127,127,127,.18)', maxWidth: 440, ...style } },
    h('div', { onPointerEnter: () => ref.current?.emote('happy', 900), style: { lineHeight: 0 } }, h(Livatar, { variant: food, seed: 'cookie', options: { kind: 'donut' }, size: 64, ...avatar, ref })),
    h('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: 8 } },
      h('strong', null, title), h('span', { style: { ...muted, fontSize: 13 } }, description),
      h('div', { style: { display: 'flex', gap: 8 } },
        h('button', { type: 'button', onClick: () => pick(true), style: { ...primary, padding: '8px 14px' } }, 'Accept'),
        h('button', { type: 'button', onClick: () => pick(false), onPointerEnter: () => ref.current?.emote('sad', 900), style: { ...primary, padding: '8px 14px', background: 'transparent', color: 'inherit', border: '1px solid rgba(127,127,127,.3)' } }, 'Decline'))))
}

export interface ProgressProps {
  /** 0…100. */
  value: number
  label?: ReactNode
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

/**
 * A progress bar with a little car driving along it. It cheers at the finish line.
 *
 *   <LivatarProgress value={percent} label="Uploading" />
 */
export function LivatarProgress({ value, label, avatar, className, style }: ProgressProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const v = Math.max(0, Math.min(100, value))
  const done = v >= 100
  useEffect(() => { if (done) { ref.current?.emote('happy', 2000); ref.current?.nod() } }, [done])
  return h('div', { className, style: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 260, ...style } },
    h('div', { style: { position: 'relative', height: 44 } },
      h('div', { style: { position: 'absolute', left: `calc(${v}% - ${v * 0.4}px)`, bottom: 10, transition: 'left .4s ease', lineHeight: 0 } },
        h(Livatar, { variant: vehicle, seed: 'progress', options: { kind: 'car', color: 'purple' }, size: 40, background: false, alive: { poke: false }, ...avatar, ref })),
      h('div', { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(v), 'aria-label': typeof label === 'string' ? label : 'Progress', style: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, borderRadius: 10, background: 'rgba(127,127,127,.18)', overflow: 'hidden' } },
        h('div', { style: { width: `${v}%`, height: '100%', borderRadius: 10, background: done ? '#22c55e' : 'linear-gradient(90deg,#a78bfa,#7f5af0)', transition: 'width .4s ease, background .3s' } }))),
    h('div', { style: { display: 'flex', justifyContent: 'space-between', ...muted, fontSize: 13 } }, h('span', null, label), h('span', null, done ? 'Done!' : `${Math.round(v)}%`)))
}

export interface StepperProps {
  steps: ReactNode[]
  /** Current step index (0-based). Equal to steps.length = finished. */
  current: number
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

/**
 * Onboarding steps with a rocket that moves along and launches at the end.
 *
 *   <LivatarStepper steps={['Account', 'Profile', 'Invite', 'Launch']} current={step} />
 */
export function LivatarStepper({ steps, current, avatar, className, style }: StepperProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const done = current >= steps.length
  const at = Math.min(current, steps.length - 1)
  useEffect(() => { if (done) ref.current?.emote('love', 3000); else if (current > 0) ref.current?.nod() }, [current, done])
  const pct = steps.length > 1 ? (at / (steps.length - 1)) * 100 : 0
  return h('div', { className, style: { position: 'relative', padding: '64px 20px 8px', minWidth: 300, ...style } },
    h('div', { style: { position: 'absolute', top: done ? -40 : 8, left: `calc(20px + (100% - 40px) * ${pct / 100})`, transform: 'translateX(-50%)', transition: 'left .5s ease, top 1s cubic-bezier(.5,-0.4,.7,1), opacity 1s', opacity: done ? 0 : 1, lineHeight: 0 } },
      h(Livatar, { variant: vehicle, seed: 'launch', options: { kind: 'rocket' }, size: 48, background: false, alive: { poke: false }, ...avatar, ref })),
    h('div', { style: { position: 'relative', height: 4, borderRadius: 4, background: 'rgba(127,127,127,.2)' } },
      h('div', { style: { position: 'absolute', inset: 0, width: `${done ? 100 : pct}%`, borderRadius: 4, background: '#7f5af0', transition: 'width .5s ease' } })),
    h('ol', { style: { listStyle: 'none', margin: '10px 0 0', padding: 0, display: 'flex', justifyContent: 'space-between' } },
      steps.map((s, i) => h('li', { key: i, 'aria-current': i === current ? 'step' : undefined, style: { fontSize: 13, fontWeight: i === current ? 700 : 500, opacity: i <= current ? 1 : 0.5, textAlign: i === 0 ? 'left' : i === steps.length - 1 ? 'right' : 'center', flex: 1 } }, s))),
    done && h('div', { role: 'status', style: { textAlign: 'center', fontWeight: 800, marginTop: 12 } }, 'Liftoff! 🚀'))
}

export interface PricingTier {
  name: string
  price: ReactNode
  period?: string
  features: ReactNode[]
  cta?: ReactNode
  popular?: boolean
  /** Character. Default: coin, piggy bank, gem by position. */
  avatar?: AvatarProps
  onSelect?: () => void
}

export interface PricingProps {
  tiers: PricingTier[]
  className?: string
  style?: CSSProperties
}

const TIER_KINDS = ['coin', 'piggy', 'gem', 'bag']

/**
 * Pricing cards with a money character per tier (coin, piggy bank, gem). They
 * light up on hover; the popular plan is already in love.
 *
 *   <LivatarPricing tiers={[{ name: 'Free', price: '$0', features: […] }, { name: 'Pro', price: '$12', popular: true, features: […] }]} />
 */
export function LivatarPricing({ tiers, className, style }: PricingProps): ReactElement {
  return h('div', { className, style: { display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`, gap: 14, width: '100%', ...style } },
    tiers.map((t, i) => h(Tier, { key: t.name, t, kind: TIER_KINDS[i % TIER_KINDS.length] })))
}
function Tier({ t, kind }: { t: PricingTier; kind: string }): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  return h('div', { onPointerEnter: () => { ref.current?.emote(t.popular ? 'love' : 'happy', 1500); ref.current?.nod() }, style: { position: 'relative', display: 'flex', flexDirection: 'column', gap: 10, padding: 20, borderRadius: 22, border: t.popular ? '2px solid #7f5af0' : '1px solid rgba(127,127,127,.2)', background: t.popular ? 'linear-gradient(180deg, rgba(127,90,240,.10), transparent 60%)' : 'var(--lv-card, transparent)', boxShadow: t.popular ? '0 14px 40px rgba(127,90,240,.18)' : 'none' } },
    t.popular && h('span', { style: { position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: '#7f5af0', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, letterSpacing: '.05em', textTransform: 'uppercase' } }, 'Popular'),
    h(Livatar, { variant: money, seed: 'tier-' + t.name, options: { kind, sparkle: !!t.popular }, size: 56, mood: t.popular ? 'love' : undefined, ...t.avatar, ref }),
    h('strong', { style: { fontSize: 16 } }, t.name),
    h('div', null, h('span', { style: { fontSize: 30, fontWeight: 900, letterSpacing: '-0.02em' } }, t.price), t.period && h('span', { style: muted }, ' / ' + t.period)),
    h('ul', { style: { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, flex: 1 } }, t.features.map((f, k) => h('li', { key: k }, '✓ ', f))),
    h('button', { type: 'button', onClick: t.onSelect, style: { ...primary, ...(t.popular ? null : { background: 'transparent', color: 'inherit', border: '1px solid rgba(127,127,127,.3)' }) } }, t.cta ?? 'Choose'))
}

export interface BellProps {
  count: number
  onClick?: () => void
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

/**
 * A notification bell that jumps and shakes when something new arrives and dozes when it's quiet.
 *
 *   <LivatarBell count={unread} onClick={openInbox} />
 */
export function LivatarBell({ count, onClick, avatar, className, style }: BellProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const prev = useRef(count)
  useEffect(() => {
    if (count > prev.current) { ref.current?.emote('surprised', 1200); ref.current?.shake() }
    prev.current = count
  }, [count])
  return h('button', { type: 'button', onClick, className, 'aria-label': `Notifications, ${count} unread`, style: { position: 'relative', border: 0, padding: 0, background: 'none', cursor: 'pointer', lineHeight: 0, ...style } },
    h(Livatar, { variant: ui, seed: 'bell', options: { kind: 'bell', badge: false }, size: 48, mood: count ? 'neutral' : 'sleepy', ...avatar, ref }),
    count > 0 && h('span', { 'aria-hidden': true, style: { position: 'absolute', top: -3, right: -3, minWidth: 20, height: 20, padding: '0 5px', borderRadius: 10, background: '#ff4d6d', color: '#fff', fontSize: 12, fontWeight: 800, lineHeight: '20px', boxSizing: 'border-box' } }, count > 99 ? '99+' : count))
}

export interface LikeProps {
  liked: boolean
  onChange: (liked: boolean) => void
  count?: number
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

/**
 * A like button that is a little heart planet. Like it and it falls in love.
 *
 *   <LivatarLike liked={liked} count={likes} onChange={setLiked} />
 */
export function LivatarLike({ liked, onChange, count, avatar, className, style }: LikeProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) return void (first.current = false)
    if (liked) { ref.current?.emote('love', 1600); ref.current?.nod() } else ref.current?.emote('sad', 900)
  }, [liked])
  return h('button', { type: 'button', className, onClick: () => onChange(!liked), 'aria-pressed': liked, 'aria-label': liked ? 'Unlike' : 'Like', style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px 4px 4px', borderRadius: 999, border: `1.5px solid ${liked ? '#ff4d6d' : 'rgba(127,127,127,.3)'}`, background: liked ? 'rgba(255,77,109,.1)' : 'transparent', color: 'inherit', cursor: 'pointer', font: 'inherit', fontWeight: 700, transition: 'all .2s', ...style } },
    h(Livatar, { variant: planet, seed: 'like', options: { kind: 'heart', satellite: false, stars: false }, background: false, size: 34, mood: liked ? 'happy' : 'neutral', ...avatar, ref }),
    count != null && h('span', null, count + (liked ? 1 : 0)))
}

export interface CountdownProps {
  /** Target time. */
  to: Date | number | string
  /** Called once at zero. */
  onDone?: () => void
  label?: ReactNode
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

/**
 * A countdown with a clock that gets more excited as time runs out and celebrates at zero.
 *
 *   <LivatarCountdown to="2026-12-31T23:59:59" label="Launch in" />
 */
export function LivatarCountdown({ to, onDone, label, avatar, className, style }: CountdownProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const target = new Date(to).getTime()
  const [now, setNow] = useState(() => target)
  const done = useLatest(onDone)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])
  const left = Math.max(0, target - now)
  const phase = left === 0 ? 'zero' : left < 10_000 ? 'soon' : left < 3_600_000 ? 'near' : 'far'
  useEffect(() => {
    const a = ref.current
    if (!a) return
    if (phase === 'zero') { a.emote('love', 4000); a.nod(); done.current?.() }
    else a.emote(phase === 'soon' ? 'surprised' : phase === 'near' ? 'happy' : 'sleepy')
  }, [phase, done])
  const s = Math.floor(left / 1000)
  const parts: [string, number][] = [['days', Math.floor(s / 86400)], ['hrs', Math.floor(s / 3600) % 24], ['min', Math.floor(s / 60) % 60], ['sec', s % 60]]
  return h('div', { className, style: { display: 'flex', alignItems: 'center', gap: 14, ...style } },
    h(Livatar, { variant: home, seed: 'clock', options: { kind: 'clock' }, size: 64, ...avatar, ref }),
    h('div', null,
      label != null && h('div', { style: { ...muted, fontSize: 13, marginBottom: 2 } }, label),
      h('div', { role: 'timer', 'aria-live': 'off', style: { display: 'flex', gap: 10 } },
        parts.map(([k, v]) => h('div', { key: k, style: { textAlign: 'center' } },
          h('div', { style: { fontSize: 26, fontWeight: 900, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 } }, String(v).padStart(2, '0')),
          h('div', { style: { ...muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' } }, k))))))
}

export interface HelpLauncherProps {
  /** The panel content (your chat widget, FAQ, form…). */
  children?: ReactNode
  title?: ReactNode
  /** 'fixed' sticks to the viewport corner (default); 'absolute' to the nearest positioned parent. */
  position?: 'fixed' | 'absolute'
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

/**
 * A floating help button: a bot that peeks around while you browse and pops open a panel.
 *
 *   <LivatarHelpLauncher title="Need a hand?"><YourChat /></LivatarHelpLauncher>
 */
export function LivatarHelpLauncher({ children, title = 'Hi! Need a hand?', position = 'fixed', avatar, className, style }: HelpLauncherProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (open) return
    const id = setInterval(() => ref.current?.look(Math.random() * 2 - 1, -0.3, 900), 3500)
    return () => clearInterval(id)
  }, [open])
  return h('div', { className, style: { position, right: 20, bottom: 20, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, ...style } },
    open && h('div', { role: 'dialog', 'aria-label': typeof title === 'string' ? title : 'Help', style: { width: 280, padding: 16, borderRadius: 20, background: 'var(--lv-card, #fff)', color: 'var(--lv-fg, #1f1a2e)', boxShadow: '0 16px 50px rgba(0,0,0,.18)', border: '1px solid rgba(127,127,127,.18)' } },
      h('strong', { style: { display: 'block', marginBottom: 8 } }, title), children),
    h('button', { type: 'button', onClick: () => { setOpen(!open); ref.current?.emote(open ? 'neutral' : 'happy', open ? 0 : 1400) }, 'aria-expanded': open, 'aria-label': open ? 'Close help' : 'Open help', style: { border: 0, padding: 0, borderRadius: '50%', cursor: 'pointer', lineHeight: 0, boxShadow: '0 10px 30px rgba(127,90,240,.35)', background: 'none' } },
      h(Livatar, { variant: bot, seed: 'help', size: 60, ...avatar, ref })))
}

export interface CallParticipant extends Participant {
  /** Hand raised: a badge shows and their face lights up. */
  hand?: boolean
  /** An emoji that floats up from their tile. Change it (or `reactionId`) to send again. */
  reaction?: string
  reactionId?: string | number
  /** Camera "off" look: dimmer tile. */
  cameraOff?: boolean
}

export interface CallProps {
  participants: CallParticipant[]
  /** 'auto' (default) puts the first speaker on a stage and keeps the last speaker there; 'grid' keeps tiles equal; 'spotlight' always has a stage. */
  layout?: 'auto' | 'grid' | 'spotlight'
  /** Latest chat message: everyone reacts to its mood. */
  message?: { id: string | number; from: string; text: string }
  /** Header title, e.g. the meeting name. */
  title?: ReactNode
  /** Show the control bar (mic, reactions, leave). Default true. */
  controls?: boolean
  /** Your participant id, so the mic button can mute you. */
  me?: string
  onMute?: (muted: boolean) => void
  onReact?: (emoji: string) => void
  onLeave?: () => void
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

const CALL_CSS = `
.lv-call{--lv-tile:#1d1830;--lv-tile2:#2a2343;background:#110e1d;color:#f3f0ff;border-radius:22px;padding:14px;display:flex;flex-direction:column;gap:12px;font:inherit;box-shadow:0 30px 80px rgba(17,14,29,.35)}
.lv-call-tiles{display:grid;gap:10px;flex:1}
.lv-tile{position:relative;border-radius:16px;background:radial-gradient(circle at 50% 30%,var(--lv-tile2),var(--lv-tile));display:grid;place-items:center;overflow:hidden;aspect-ratio:16/10;transition:box-shadow .25s,transform .25s,opacity .25s;min-width:0}
.lv-tile[data-speaking]{box-shadow:0 0 0 3px #a78bfa,0 0 30px rgba(167,139,250,.55)}
.lv-tile[data-speaking]::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 3px #a78bfa;animation:lv-ring 1.4s ease-out infinite;pointer-events:none}
.lv-tile[data-off]{opacity:.55}
.lv-tile .lv-av{transition:transform .3s}
.lv-tile[data-speaking] .lv-av{transform:scale(1.06)}
.lv-name{position:absolute;left:8px;bottom:8px;display:flex;align-items:center;gap:6px;padding:3px 9px;border-radius:999px;background:rgba(0,0,0,.45);backdrop-filter:blur(6px);font-size:12px;font-weight:600;max-width:calc(100% - 16px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lv-eq{display:inline-flex;gap:2px;align-items:flex-end;height:11px}
.lv-eq i{width:3px;border-radius:2px;background:#a78bfa;animation:lv-eq .9s ease-in-out infinite}
.lv-eq i:nth-child(2){animation-delay:-.3s}.lv-eq i:nth-child(3){animation-delay:-.6s}
.lv-badge{position:absolute;top:8px;right:8px;padding:3px 8px;border-radius:999px;background:#fbbf24;color:#1f1a2e;font-size:12px;font-weight:800;animation:lv-wave 1s ease-in-out infinite;transform-origin:70% 90%}
.lv-float{position:absolute;bottom:30%;left:50%;font-size:30px;pointer-events:none;animation:lv-up 1.8s ease-out forwards}
.lv-call-bar{display:flex;justify-content:center;gap:8px;flex-wrap:wrap}
.lv-call .lv-call-bar .lv-b{font:inherit;border:0;border-radius:999px;padding:9px 14px;background:#2a2343;color:inherit;cursor:pointer;font-weight:600;transition:background .15s,transform .1s}
.lv-call .lv-call-bar .lv-b:hover{background:#3a3160}.lv-call .lv-call-bar .lv-b:active{transform:scale(.94)}
.lv-call .lv-call-bar .lv-leave{background:#ef4444}.lv-call .lv-call-bar .lv-leave:hover{background:#dc2626}
.lv-call .lv-call-bar .lv-b[aria-pressed=true]{background:#ef4444}
@keyframes lv-ring{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(1.04)}}
@keyframes lv-eq{0%,100%{height:3px}50%{height:11px}}
@keyframes lv-wave{0%,100%{transform:rotate(0)}50%{transform:rotate(-14deg)}}
@keyframes lv-up{0%{opacity:0;transform:translate(-50%,0) scale(.6)}15%{opacity:1;transform:translate(-50%,-10px) scale(1.1)}100%{opacity:0;transform:translate(-50%,-110px) scale(1)}}
@media (prefers-reduced-motion:reduce){.lv-call *{animation:none!important}}
`

function Floater({ emoji, k }: { emoji?: string; k?: string | number }): ReactElement | null {
  const [shown, setShown] = useState<{ e: string; n: number } | null>(null)
  useEffect(() => {
    if (!emoji) return
    setShown({ e: emoji, n: Date.now() })
    const t = setTimeout(() => setShown(null), 1800)
    return () => clearTimeout(t)
  }, [emoji, k])
  return shown ? h('span', { key: shown.n, className: 'lv-float', 'aria-hidden': true }, shown.e) : null
}

/**
 * A meeting window: video-call tiles where the active speaker glows on a
 * stage, and everyone else turns to look at them. Raised hands wave, emoji
 * reactions float up, chat moods ripple through the room.
 *
 *   <LivatarCall title="Standup" me="you" participants={people} onLeave={hangUp} />
 */
export function LivatarCall({ participants, layout = 'auto', message, title, controls = true, me, onMute, onReact, onLeave, avatar, className, style }: CallProps): ReactElement {
  const [refs, speaker, room] = useRoom(participants, message)
  const [burst, setBurst] = useState<{ e: string; n: number } | null>(null)
  const hands = participants.filter((p) => p.hand).map((p) => p.id).join(',')
  useEffect(() => {
    for (const id of hands.split(',').filter(Boolean)) refs.get(id)?.emote('surprised', 1200)
  }, [hands, refs])
  const reacts = participants.map((p) => `${p.id}:${p.reaction ?? ''}:${p.reactionId ?? ''}`).join('|')
  useEffect(() => {
    for (const p of participants) if (p.reaction) refs.get(p.id)?.emote(p.reaction === '😢' ? 'sad' : p.reaction === '❤️' ? 'love' : 'happy', 1500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reacts])
  // the stage sticks with the last speaker so the layout doesn't jump between turns
  const last = useRef('')
  if (speaker) last.current = speaker
  if (last.current && !participants.some((p) => p.id === last.current)) last.current = ''
  const stage = layout === 'grid' ? '' : speaker || last.current || (layout === 'spotlight' ? participants[0]?.id : '')
  const others = stage ? participants.filter((p) => p.id !== stage) : participants
  const cols = stage ? Math.min(6, Math.max(1, others.length)) : participants.length <= 1 ? 1 : participants.length <= 4 ? 2 : participants.length <= 9 ? 3 : 4
  const meP = participants.find((p) => p.id === me)
  const tile = (p: CallParticipant, big: boolean) =>
    h('div', { key: p.id, className: 'lv-tile', role: 'listitem', 'aria-label': (p.name ?? p.id) + (p.id === speaker ? ', speaking' : '') + (p.muted ? ', muted' : '') + (p.hand ? ', hand raised' : ''), 'data-speaking': p.id === speaker || undefined, 'data-off': p.cameraOff || undefined, style: big ? { aspectRatio: '16/8' } : undefined },
      h('div', { className: 'lv-av', style: { lineHeight: 0 } }, h(Livatar, { seed: p.id, size: big ? 150 : stage ? 64 : 96, ...avatar, ...p.avatar, ref: (x: AliveHandle | null) => void refs.set(p.id, x) })),
      h('span', { className: 'lv-name' }, p.id === speaker ? h('span', { className: 'lv-eq', 'aria-hidden': true }, h('i'), h('i'), h('i')) : p.muted ? h('span', { 'aria-hidden': true }, '🔇') : null, p.name ?? p.id),
      p.hand && h('span', { className: 'lv-badge', 'aria-hidden': true }, '✋'),
      h(Floater, { emoji: p.reaction, k: p.reactionId }),
      p.id === me && burst && h('span', { key: burst.n, className: 'lv-float', 'aria-hidden': true }, burst.e))
  const react = (e: string) => {
    setBurst({ e, n: Date.now() })
    room.g?.all((hd) => hd.emote(e === '😢' ? 'sad' : e === '❤️' ? 'love' : 'happy', 1400))
    onReact?.(e)
  }
  return h('div', { className: 'lv-call ' + (className ?? ''), style },
    h('style', null, CALL_CSS),
    (title != null) && h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, opacity: 0.85, padding: '0 4px' } },
      h('strong', null, title), h('span', null, '● ', participants.length, ' in call')),
    h('div', { className: 'lv-call-tiles', role: 'list' },
      stage && tile(participants.find((p) => p.id === stage)!, true),
      others.length > 0 && h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 10 } }, others.map((p) => tile(p, false)))),
    controls && h('div', { className: 'lv-call-bar' },
      meP && h('button', { type: 'button', className: 'lv-b', 'aria-pressed': !!meP.muted, onClick: () => onMute?.(!meP.muted) }, meP.muted ? '🔇 Unmute' : '🎙️ Mute'),
      ['👏', '🎉', '❤️', '😂'].map((e) => h('button', { key: e, type: 'button', className: 'lv-b', 'aria-label': 'React ' + e, onClick: () => react(e) }, e)),
      onLeave && h('button', { type: 'button', className: 'lv-b lv-leave', onClick: () => { room.g?.all((hd) => hd.emote('sad', 1500)); onLeave() } }, 'Leave')))
}

export interface CopyButtonProps {
  /** Text to copy. */
  text: string
  label?: ReactNode
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

/**
 * A copy button with a clipboard that grins when the copy worked.
 *
 *   <LivatarCopyButton text="npm i livatar" />
 */
export function LivatarCopyButton({ text, label = 'Copy', avatar, className, style }: CopyButtonProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const [st, setSt] = useState<'idle' | 'ok' | 'err'>('idle')
  useEffect(() => {
    if (st === 'idle') return
    const t = setTimeout(() => setSt('idle'), 1600)
    return () => clearTimeout(t)
  }, [st])
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setSt('ok'); ref.current?.emote('happy', 1500); ref.current?.nod()
    } catch {
      setSt('err'); ref.current?.emote('sad', 1500); ref.current?.shake()
    }
  }
  return h('button', { type: 'button', onClick: copy, className, 'aria-live': 'polite', style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 12px 3px 3px', borderRadius: 999, border: '1.5px solid rgba(127,127,127,.3)', background: st === 'ok' ? 'rgba(34,197,94,.12)' : 'transparent', color: 'inherit', font: 'inherit', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background .2s', ...style } },
    h(Livatar, { variant: office, seed: 'copy', options: { kind: 'clipboard' }, size: 30, background: false, alive: { poke: false }, ...avatar, ref }),
    st === 'ok' ? 'Copied!' : st === 'err' ? 'Copy failed' : label)
}

export interface PollOption {
  id: string
  label: ReactNode
  votes: number
}

export interface PollProps {
  question: ReactNode
  options: PollOption[]
  /** Called with the option id. After voting, results show. */
  onVote?: (id: string) => void
  /** The option this user picked, if any (controlled). */
  voted?: string
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

const share = (o: PollOption, total: number) => (total ? o.votes / total : 0)

/**
 * A poll where every option has a face. After you vote, the winner is in
 * love, the runner-up is happy, and the losers get a little sad.
 *
 *   <LivatarPoll question="Lunch?" options={opts} onVote={vote} />
 */
export function LivatarPoll({ question, options, onVote, voted: votedProp, avatar, className, style }: PollProps): ReactElement {
  const [own, setOwn] = useState<string | undefined>(undefined)
  const voted = votedProp ?? own
  const refs = useRef(new Map<string, AliveHandle | null>())
  const list = voted ? options.map((o) => (o.id === voted && votedProp === undefined ? { ...o, votes: o.votes + 1 } : o)) : options
  const total = list.reduce((a, o) => a + o.votes, 0)
  const ranked = [...list].sort((a, b) => b.votes - a.votes).map((o) => o.id)
  const mood = (o: PollOption): Mood => (!voted ? 'neutral' : ranked[0] === o.id ? 'love' : ranked[1] === o.id ? 'happy' : share(o, total) < 0.15 ? 'sad' : 'neutral')
  const pick = (id: string) => {
    if (voted) return
    setOwn(id)
    refs.current.get(id)?.nod()
    onVote?.(id)
  }
  return h('div', { className, role: 'group', 'aria-label': typeof question === 'string' ? question : 'Poll', style: { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 280, ...style } },
    h('strong', { style: { fontSize: 16, marginBottom: 2 } }, question),
    list.map((o) => {
      const pct = Math.round(share(o, total) * 100)
      return h('button', { key: o.id, type: 'button', onClick: () => pick(o.id), disabled: !!voted && o.id !== voted, 'aria-pressed': o.id === voted, style: { position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px 6px 6px', borderRadius: 14, border: `1.5px solid ${o.id === voted ? '#7f5af0' : 'rgba(127,127,127,.25)'}`, background: 'transparent', color: 'inherit', font: 'inherit', textAlign: 'left', cursor: voted ? 'default' : 'pointer', overflow: 'hidden', opacity: 1 } },
        voted && h('span', { 'aria-hidden': true, style: { position: 'absolute', inset: 0, width: pct + '%', background: o.id === voted ? 'rgba(127,90,240,.16)' : 'rgba(127,127,127,.1)', transition: 'width .6s cubic-bezier(.2,.8,.2,1)' } }),
        h('span', { style: { position: 'relative', lineHeight: 0 } }, h(Livatar, { variant: emoji, seed: 'poll-' + o.id, size: 32, mood: mood(o), ...avatar, ref: (x: AliveHandle | null) => void refs.current.set(o.id, x) })),
        h('span', { style: { position: 'relative', flex: 1, fontWeight: 600 } }, o.label),
        voted && h('span', { style: { position: 'relative', fontWeight: 800, fontVariantNumeric: 'tabular-nums' } }, pct + '%'))
    }),
    h('span', { style: { ...muted, fontSize: 12 } }, total, ' vote', total === 1 ? '' : 's'))
}

export interface FocusTimerProps {
  /** Focus minutes. Default 25. */
  focus?: number
  /** Break minutes. Default 5. */
  rest?: number
  onPhase?: (phase: 'focus' | 'break') => void
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

/**
 * A focus (pomodoro) timer with a mug of coffee: it stays alert while you
 * work, cheers when the break starts, and naps while paused.
 *
 *   <LivatarFocusTimer focus={25} rest={5} />
 */
export function LivatarFocusTimer({ focus = 25, rest = 5, onPhase, avatar, className, style }: FocusTimerProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const [phase, setPhase] = useState<'focus' | 'break'>('focus')
  const [running, setRunning] = useState(false)
  const len = (phase === 'focus' ? focus : rest) * 60
  const [left, setLeft] = useState(len)
  const cb = useLatest(onPhase)
  useEffect(() => setLeft(len), [len])
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000)
    return () => clearInterval(id)
  }, [running])
  useEffect(() => {
    if (left > 0 || !running) return
    const next = phase === 'focus' ? 'break' : 'focus'
    setPhase(next)
    cb.current?.(next)
    if (next === 'break') { ref.current?.emote('love', 2500); ref.current?.nod() } else ref.current?.emote('surprised', 1200)
  }, [left, running, phase, cb])
  const mood: Mood = !running ? 'sleepy' : phase === 'break' ? 'happy' : left < 60 ? 'surprised' : 'neutral'
  const r = 46, c = 2 * Math.PI * r
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0')
  const btn: CSSProperties = { font: 'inherit', fontWeight: 700, fontSize: 13, padding: '7px 14px', borderRadius: 999, border: '1.5px solid rgba(127,127,127,.3)', background: 'transparent', color: 'inherit', cursor: 'pointer' }
  return h('div', { className, style: { display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10, ...style } },
    h('div', { style: { position: 'relative', width: 120, height: 120, display: 'grid', placeItems: 'center' } },
      h('svg', { width: 120, height: 120, viewBox: '0 0 120 120', style: { position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }, 'aria-hidden': true },
        h('circle', { cx: 60, cy: 60, r, fill: 'none', stroke: 'rgba(127,127,127,.18)', strokeWidth: 7 }),
        h('circle', { cx: 60, cy: 60, r, fill: 'none', stroke: phase === 'focus' ? '#7f5af0' : '#22c55e', strokeWidth: 7, strokeLinecap: 'round', strokeDasharray: c, strokeDashoffset: c * (1 - left / len), style: { transition: 'stroke-dashoffset 1s linear, stroke .3s' } })),
      h(Livatar, { variant: home, seed: 'focus', options: { kind: 'mug' }, size: 72, background: false, mood, ...avatar, ref })),
    h('div', { role: 'timer', 'aria-label': `${phase} ${mm}:${ss}`, style: { fontSize: 28, fontWeight: 900, fontVariantNumeric: 'tabular-nums', lineHeight: 1 } }, mm, ':', ss),
    h('div', { style: { ...muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em' } }, phase === 'focus' ? 'Focus' : 'Break'),
    h('div', { style: { display: 'flex', gap: 6 } },
      h('button', { type: 'button', style: btn, onClick: () => { setRunning(!running); if (!running) ref.current?.nod() } }, running ? 'Pause' : 'Start'),
      h('button', { type: 'button', style: btn, onClick: () => { setRunning(false); setPhase('focus'); setLeft(focus * 60) } }, 'Reset')))
}

export interface TodoItem {
  id: string
  text: string
  done?: boolean
}

export interface TodoListProps {
  items: TodoItem[]
  onChange: (items: TodoItem[]) => void
  title?: ReactNode
  /** Show the "add a task" field. Default true. */
  adding?: boolean
  avatar?: AvatarProps
  className?: string
  style?: CSSProperties
}

const GROW = ['sprout', 'succulent', 'monstera', 'sunflower'] as const

/**
 * A to-do list with a plant that grows as you finish tasks: sprout,
 * succulent, monstera, then a sunflower in love when everything is done.
 *
 *   <LivatarTodoList items={todos} onChange={setTodos} />
 */
export function LivatarTodoList({ items, onChange, title = 'Today', adding = true, avatar, className, style }: TodoListProps): ReactElement {
  const ref = useRef<AliveHandle | null>(null)
  const [draft, setDraft] = useState('')
  const done = items.filter((i) => i.done).length
  const p = items.length ? done / items.length : 0
  const stage = GROW[p >= 1 ? 3 : p >= 0.6 ? 2 : p >= 0.3 ? 1 : 0]
  const mood: Mood = p >= 1 ? 'love' : done ? 'happy' : 'neutral'
  const toggle = (id: string) => {
    const next = items.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    const was = items.find((i) => i.id === id)?.done
    if (!was) { ref.current?.nod(); ref.current?.emote('happy', 900) } else ref.current?.emote('sad', 700)
    onChange(next)
  }
  const add = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    onChange([...items, { id: String(Date.now()), text: draft.trim() }])
    setDraft('')
    ref.current?.emote('surprised', 700)
  }
  return h('div', { className, style: { display: 'flex', gap: 16, alignItems: 'flex-start', minWidth: 300, ...style } },
    h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 } },
      h(Livatar, { key: stage, variant: plant, seed: 'todo', options: { kind: stage, flower: stage !== 'sprout' }, size: 80, mood, ...avatar, ref }),
      h('span', { style: { ...muted, fontSize: 12, fontWeight: 700 } }, done, '/', items.length)),
    h('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 } },
      h('strong', { style: { marginBottom: 4 } }, title),
      items.map((i) => h('label', { key: i.id, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 4px', borderRadius: 8, cursor: 'pointer' } },
        h('input', { type: 'checkbox', checked: !!i.done, onChange: () => toggle(i.id), style: { width: 17, height: 17, accentColor: '#22c55e' } }),
        h('span', { style: { textDecoration: i.done ? 'line-through' : 'none', opacity: i.done ? 0.5 : 1, transition: 'opacity .2s' } }, i.text))),
      adding && h('form', { onSubmit: add, style: { display: 'flex', gap: 6, marginTop: 4 } },
        h('input', { value: draft, onChange: (e: RChangeEvent<HTMLInputElement>) => setDraft(e.target.value), placeholder: 'Add a task…', 'aria-label': 'New task', style: { ...field, padding: '7px 10px', fontSize: 14 } }),
        h('button', { type: 'submit', style: { ...primary, padding: '7px 12px', fontSize: 14 } }, 'Add'))))
}

export interface ChainLoaderProps {
  /** 'chain' (holding hands, a wave runs through), 'orbit' (friends circle a big one), 'conga' (marching line), 'stack' (tower that tumbles). Default 'chain'. */
  kind?: 'chain' | 'orbit' | 'conga' | 'stack'
  /** How many characters. Default 5 (4 for orbit and stack). */
  count?: number
  /** Styles to cycle through, e.g. [buddy, animal, food]. Default: the avatar's own variant. */
  variants?: AvatarProps['variant'][]
  avatar?: AvatarProps
  /** Character size in px. Default 40. */
  size?: number
  label?: ReactNode
  className?: string
  style?: CSSProperties
}

const CHAIN_CSS = `
.lv-cl{display:inline-flex;flex-direction:column;align-items:center;gap:14px}
.lv-cl-chain{display:flex;align-items:center}
.lv-cl-chain>span{display:block;line-height:0;animation:lv-cl-wave 1.1s ease-in-out infinite;animation-delay:calc(var(--i) * .12s)}
.lv-cl-hand{width:10px;height:4px;border-radius:4px;background:currentColor;opacity:.25;margin:0 -2px}
.lv-cl-orbit{position:relative;display:grid;place-items:center}
.lv-cl-orbit>.lv-cl-big{line-height:0;animation:lv-cl-bob 1.6s ease-in-out infinite}
.lv-cl-orbit>.lv-cl-o{position:absolute;line-height:0;animation:lv-cl-spin 2.4s linear infinite}
.lv-cl-orbit>.lv-cl-o>span{display:block;animation:lv-cl-unspin 2.4s linear infinite}
.lv-cl-conga{position:relative;overflow:hidden;-webkit-mask:linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent);mask:linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent)}
.lv-cl-conga>span{position:absolute;bottom:4px;line-height:0;animation:lv-cl-march 3s linear infinite,lv-cl-hop .5s ease-in-out infinite alternate;animation-delay:calc(var(--i) * -.6s),calc(var(--i) * -.1s)}
.lv-cl-stack{position:relative}
.lv-cl-stack>span{position:absolute;left:0;line-height:0;opacity:0;animation:lv-cl-drop 2.8s cubic-bezier(.3,1.4,.5,1) infinite;animation-delay:calc(var(--i) * .25s)}
@keyframes lv-cl-wave{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-40%) rotate(-6deg)}}
@keyframes lv-cl-bob{50%{transform:translateY(-6px) scale(1.04)}}
@keyframes lv-cl-spin{from{transform:rotate(var(--a)) translateX(var(--r))}to{transform:rotate(calc(var(--a) + 360deg)) translateX(var(--r))}}
@keyframes lv-cl-unspin{from{transform:rotate(calc(-1 * var(--a)))}to{transform:rotate(calc(-1 * var(--a) - 360deg))}}
@keyframes lv-cl-march{from{left:-15%}to{left:105%}}
@keyframes lv-cl-hop{from{transform:translateY(0) rotate(-5deg)}to{transform:translateY(-25%) rotate(5deg)}}
@keyframes lv-cl-drop{0%{opacity:0;transform:translateY(-300%)}15%,70%{opacity:1;transform:translateY(0)}85%{opacity:1;transform:translate(calc((var(--i) - 1.5) * 75%),100%) rotate(calc((var(--i) - 1.5) * 40deg))}100%{opacity:0;transform:translate(calc((var(--i) - 1.5) * 100%),150%)}}
@media (prefers-reduced-motion:reduce){.lv-cl *{animation:none!important}.lv-cl-stack>span{opacity:1}}
`

/**
 * A loader made of characters: a hand-holding chain with a wave running
 * through it, friends orbiting a big one, a conga line, or a tower that
 * stacks up and tumbles.
 *
 *   <LivatarChainLoader kind="conga" variants={[buddy, animal, food]} label="Loading…" />
 */
export function LivatarChainLoader({ kind = 'chain', count, variants, avatar, size = 40, label, className, style }: ChainLoaderProps): ReactElement {
  const n = Math.max(1, count ?? (kind === 'orbit' || kind === 'stack' ? 4 : 5))
  const av = (i: number, s = size, mood?: Mood) => h(Livatar, { seed: 'loader-' + i, size: s, alive: false, ...avatar, ...(variants?.length ? { variant: variants[i % variants.length] } : null), ...(mood ? { mood } : null) })
  const v = (i: number) => ({ '--i': i } as CSSProperties)
  let scene: ReactElement
  if (kind === 'orbit') {
    const r = size * 1.55
    scene = h('div', { className: 'lv-cl-orbit', style: { width: r * 2 + size, height: r * 2 + size } },
      h('span', { className: 'lv-cl-big' }, av(0, size * 1.6, 'surprised')),
      Array.from({ length: n }, (_, i) => h('span', { key: i, className: 'lv-cl-o', style: { '--a': `${(360 / n) * i}deg`, '--r': `${r}px` } as CSSProperties }, h('span', null, av(i + 1, size * 0.7)))))
  } else if (kind === 'conga') {
    scene = h('div', { className: 'lv-cl-conga', style: { width: size * 6.5, height: size * 1.5 } }, Array.from({ length: n }, (_, i) => h('span', { key: i, style: v(i) }, av(i, size * 0.9, 'happy'))))
  } else if (kind === 'stack') {
    scene = h('div', { className: 'lv-cl-stack', style: { width: size, height: size * (n + 0.5) } }, Array.from({ length: n }, (_, i) => h('span', { key: i, style: { ...v(i), bottom: i * size * 0.92 } }, av(i))))
  } else {
    scene = h('div', { className: 'lv-cl-chain', style: { paddingTop: size * 0.45 } }, Array.from({ length: n }, (_, i) => [i > 0 && h('i', { key: 'h' + i, className: 'lv-cl-hand', 'aria-hidden': true }), h('span', { key: i, style: v(i) }, av(i, size, 'happy'))]))
  }
  return h('div', { className: 'lv-cl ' + (className ?? ''), role: 'status', 'aria-busy': true, 'aria-label': typeof label === 'string' ? label : 'Loading', style },
    h('style', null, CHAIN_CSS), scene, label != null && h('span', { style: muted }, label))
}

export { feel }
export type { Personality, PersonalityInput, Assistant, AssistantState, Pet, PetStats, PetOptions, LifeEvent }
