import type { Mood } from '../core'
import type { AliveHandle } from '../alive'
import type { Traits } from './personality'

/** Things that happen around an avatar. */
export type LifeEvent =
  | 'success' | 'error' | 'warning' | 'loading' | 'done'
  | 'join' | 'leave' | 'welcome' | 'message' | 'mention'
  | 'like' | 'celebrate' | 'annoyed' | 'agree' | 'disagree'
  | 'night' | 'offline' | 'online' | 'scroll'

export interface Reaction {
  mood?: Mood
  ms?: number
  gesture?: 'nod' | 'shake'
  talk?: number
  look?: [number, number]
}

const NEUTRAL: Traits = { energy: 0.5, curiosity: 0.5, temper: 0.3, warmth: 0.6, shyness: 0.3, playfulness: 0.4 }

/** How a character with these traits reacts to `event`. Pure, so you can test or reuse it. */
export function reaction(event: LifeEvent, t: Traits = NEUTRAL): Reaction | null {
  const long = 1200 + t.energy * 1200
  switch (event) {
    case 'success': case 'done':
      return { mood: t.warmth > 0.5 ? 'happy' : 'wink', ms: long, gesture: t.energy > 0.4 ? 'nod' : undefined }
    case 'celebrate': case 'like':
      return { mood: t.warmth > 0.7 ? 'love' : 'happy', ms: long, gesture: 'nod' }
    case 'error':
      return { mood: t.temper > 0.6 ? 'angry' : t.shyness > 0.7 ? 'sad' : 'surprised', ms: long, gesture: 'shake' }
    case 'warning': return { mood: 'confused', ms: long }
    case 'loading': return { mood: t.energy < 0.3 ? 'sleepy' : 'confused', ms: 1500, look: [0.6, -0.6] }
    case 'join': case 'welcome': case 'online':
      return { mood: t.shyness > 0.8 ? 'love' : 'happy', ms: long, gesture: 'nod', talk: t.warmth > 0.5 ? 600 : undefined }
    case 'leave': return { mood: t.warmth > 0.4 ? 'sad' : 'neutral', ms: 1400 }
    case 'offline': return { mood: 'sad', ms: 2500 }
    case 'message': return { talk: 900 }
    case 'mention': return { mood: t.shyness > 0.7 ? 'love' : 'surprised', ms: 1200, look: [0, 0] }
    case 'annoyed': return { mood: t.temper > 0.4 ? 'angry' : 'confused', ms: 1800, gesture: 'shake' }
    case 'agree': return { gesture: 'nod', mood: 'happy', ms: 900 }
    case 'disagree': return { gesture: 'shake', mood: t.temper > 0.6 ? 'angry' : 'confused', ms: 900 }
    case 'night': return { mood: 'sleepy', ms: 2500 }
    case 'scroll': return t.curiosity > 0.3 ? { mood: 'surprised', ms: 700, look: [0, 1] } : null
  }
  return null
}

/** Play a stock reaction on any handle (no personality needed). */
export function react(handle: AliveHandle, event: LifeEvent, t?: Traits): void {
  const r = reaction(event, t)
  if (!r) return
  if (r.mood) handle.emote(r.mood, r.ms ?? 1500)
  if (r.gesture === 'nod') handle.nod()
  if (r.gesture === 'shake') handle.shake()
  if (r.talk) handle.talk(r.talk)
  if (r.look) handle.look(r.look[0], r.look[1], 900)
}

export interface ContextOptions {
  /** Yawn at night (22:00–6:00 local). Default true. */
  time?: boolean
  /** Sad when the connection drops, happy when it's back. Default true. */
  network?: boolean
  /** "Welcome back" when the tab is focused again after a while. Default true. */
  visibility?: boolean
  /** Surprised by very fast scrolling. Default true. */
  scroll?: boolean
  /** Return after this many ms hidden to count as "back". Default 60000. */
  awayFor?: number
  /** Custom reaction instead of the stock one (e.g. `me.react`). */
  onEvent?: (event: LifeEvent) => void
  /** Clock, for tests. Default `() => new Date()`. */
  now?: () => Date
}

/**
 * Make an avatar aware of its surroundings: time of day, network, tab focus
 * and scrolling. Returns a cleanup function. Safe to call during SSR (no-op).
 */
export function context(handle: AliveHandle, opts: ContextOptions = {}): () => void {
  if (typeof window === 'undefined') return () => {}
  const fire = opts.onEvent ?? ((e: LifeEvent) => react(handle, e))
  const now = opts.now ?? (() => new Date())
  const off: (() => void)[] = []
  const on = (t: EventTarget, ev: string, fn: EventListener) => {
    t.addEventListener(ev, fn, { passive: true })
    off.push(() => t.removeEventListener(ev, fn))
  }

  if (opts.time !== false) {
    const check = () => {
      const h = now().getHours()
      if (h >= 22 || h < 6) fire('night')
    }
    check()
    const id = setInterval(check, 10 * 60_000)
    off.push(() => clearInterval(id))
  }
  if (opts.network !== false) {
    on(window, 'offline', () => fire('offline'))
    on(window, 'online', () => fire('online'))
  }
  if (opts.visibility !== false && typeof document !== 'undefined') {
    let hiddenAt = 0
    on(document, 'visibilitychange', () => {
      if (document.hidden) hiddenAt = Date.now()
      else if (hiddenAt && Date.now() - hiddenAt > (opts.awayFor ?? 60_000)) fire('welcome')
    })
  }
  if (opts.scroll !== false) {
    let lastY = window.scrollY
    let lastT = Date.now()
    let cool = 0
    on(window, 'scroll', () => {
      const t = Date.now()
      const v = Math.abs(window.scrollY - lastY) / Math.max(1, t - lastT)
      lastY = window.scrollY
      lastT = t
      if (v > 4 && t > cool) {
        cool = t + 3000
        fire('scroll')
      }
    })
  }
  return () => off.forEach((f) => f())
}
