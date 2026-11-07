import type { AliveHandle } from '../alive'
import { feel } from './feel'
import { react } from './react'

export interface Member {
  id: string
  handle: AliveHandle
  speaking: boolean
  lastSeen: number
}

export interface GroupOptions {
  /** Members still for this many ms get sleepy. 0 = never. Default 120000. */
  idleAfter?: number
  /** Others react to messages with the mood of the text. Default true. */
  empathy?: boolean
  /** Clock, for tests. Default Date.now. */
  now?: () => number
}

export interface Group {
  readonly members: ReadonlyMap<string, Member>
  /** Add someone. Existing members turn to look and greet them. */
  join(id: string, handle: AliveHandle): void
  /** Remove someone. Others look a little sad. */
  leave(id: string): void
  /** Mark who is speaking: their mouth moves and everyone else looks at them. */
  speaking(id: string, on?: boolean): void
  /** Someone sent a message: they talk, the others react to its mood. */
  message(id: string, text: string): void
  /** Someone did something (moved, typed). Wakes them and resets idle. */
  active(id: string): void
  /** Everyone at once: `group.all(h => h.emote('happy', 1500))`. */
  all(fn: (h: AliveHandle, id: string) => void): void
  destroy(): void
}

// direction from one avatar to another, in gaze units (-1…1)
function dirTo(from: AliveHandle, to: AliveHandle): [number, number] {
  const a = from.el?.getBoundingClientRect?.()
  const b = to.el?.getBoundingClientRect?.()
  if (!a || !b) return [0, 0]
  const dx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dy = b.top + b.height / 2 - (a.top + a.height / 2)
  const d = Math.hypot(dx, dy) || 1
  return [dx / d, (dy / d) * 0.6]
}

/**
 * Avatars that notice each other: for chat rooms, calls, multiplayer games and
 * "who's online" strips. Transport-agnostic: call these from your socket events.
 *
 *   const room = group()
 *   socket.on('join', u => room.join(u.id, mount(slot(u), buddy, { seed: u.id })))
 *   socket.on('msg', m => room.message(m.from, m.text))
 */
export function group(opts: GroupOptions = {}): Group {
  const now = opts.now ?? Date.now
  const idleAfter = opts.idleAfter ?? 120_000
  const members = new Map<string, Member>()
  const others = (id: string) => [...members.values()].filter((m) => m.id !== id)
  const lookAll = (id: string, ms = 1500) => {
    const target = members.get(id)
    if (!target) return
    for (const m of others(id)) {
      const [x, y] = dirTo(m.handle, target.handle)
      m.handle.look(x, y, ms)
    }
  }
  let talkTimer: ReturnType<typeof setInterval> | undefined

  const idleTimer = idleAfter
    ? setInterval(() => {
        const t = now()
        for (const m of members.values()) if (!m.speaking && t - m.lastSeen > idleAfter && m.handle.state.mood !== 'sleepy') m.handle.emote('sleepy')
      }, Math.min(idleAfter, 15_000))
    : undefined

  const active = (id: string) => {
    const m = members.get(id)
    if (!m) return
    if (m.handle.state.mood === 'sleepy') m.handle.emote('neutral')
    m.lastSeen = now()
  }

  return {
    members,
    join(id, handle) {
      members.set(id, { id, handle, speaking: false, lastSeen: now() })
      react(handle, 'join')
      lookAll(id)
      for (const m of others(id)) m.handle.emote('happy', 1200)
    },
    leave(id) {
      const m = members.get(id)
      if (!m) return
      lookAll(id, 800)
      members.delete(id)
      for (const o of members.values()) react(o.handle, 'leave')
    },
    speaking(id, on = true) {
      const m = members.get(id)
      if (!m) return
      for (const o of members.values()) o.speaking = false
      m.speaking = on
      active(id)
      clearInterval(talkTimer)
      if (!on) return
      // keep the speaker's mouth moving and everyone's eyes on them
      const beat = () => {
        m.handle.talk(700)
        lookAll(id, 900)
      }
      beat()
      talkTimer = setInterval(beat, 600)
    },
    message(id, text) {
      const m = members.get(id)
      if (!m) return
      active(id)
      m.handle.talk(Math.min(2500, 300 + text.length * 40))
      lookAll(id, 1200)
      const mood = feel(text)
      if (mood !== 'neutral') {
        m.handle.emote(mood, 1800)
        if (opts.empathy !== false) for (const o of others(id)) o.handle.emote(mood === 'angry' ? 'surprised' : mood, 1400)
      }
      if (new RegExp(`@(${[...members.keys()].map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`).test(text)) {
        for (const o of others(id)) if (text.includes('@' + o.id)) react(o.handle, 'mention')
      }
    },
    active,
    all(fn) {
      members.forEach((m, id) => fn(m.handle, id))
    },
    destroy() {
      clearInterval(talkTimer)
      clearInterval(idleTimer)
      members.clear()
    },
  }
}
