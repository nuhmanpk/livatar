import { createRand, hash, type Mood } from '../core'
import type { AliveHandle } from '../alive'
import { react as play, type LifeEvent } from './react'

/** Every trait is 0…1. */
export interface Traits {
  /** How fast and how much it moves; low energy dozes off sooner. */
  energy: number
  /** How often it looks around and reacts to things. */
  curiosity: number
  /** How quickly it gets annoyed (pokes, errors). */
  temper: number
  /** How warmly it greets and celebrates. */
  warmth: number
  /** How easily it gets flustered and looks away. */
  shyness: number
  /** How often it pulls faces on its own. */
  playfulness: number
}

export const PERSONALITIES = {
  cheerful: { energy: 0.8, curiosity: 0.6, temper: 0.1, warmth: 0.9, shyness: 0.2, playfulness: 0.7 },
  shy: { energy: 0.4, curiosity: 0.5, temper: 0.1, warmth: 0.6, shyness: 0.95, playfulness: 0.2 },
  grumpy: { energy: 0.3, curiosity: 0.2, temper: 0.9, warmth: 0.2, shyness: 0.3, playfulness: 0.1 },
  curious: { energy: 0.7, curiosity: 1, temper: 0.2, warmth: 0.6, shyness: 0.3, playfulness: 0.5 },
  lazy: { energy: 0.1, curiosity: 0.2, temper: 0.3, warmth: 0.5, shyness: 0.4, playfulness: 0.2 },
  playful: { energy: 0.9, curiosity: 0.7, temper: 0.2, warmth: 0.7, shyness: 0.1, playfulness: 1 },
  calm: { energy: 0.3, curiosity: 0.4, temper: 0.05, warmth: 0.6, shyness: 0.3, playfulness: 0.2 },
} satisfies Record<string, Traits>

export type PersonalityName = keyof typeof PERSONALITIES
export type PersonalityInput = PersonalityName | Partial<Traits> | { seed: string }

const KEYS: (keyof Traits)[] = ['energy', 'curiosity', 'temper', 'warmth', 'shyness', 'playfulness']
const clamp = (v: number) => Math.max(0, Math.min(1, v))

/**
 * Resolve a personality: a preset name, partial traits (rest = 0.5), or
 * `{ seed }` for a deterministic one (same seed → same personality).
 */
export function traits(input: PersonalityInput = { seed: 'livatar' }): Traits {
  if (typeof input === 'string') return { ...(PERSONALITIES[input] ?? PERSONALITIES.calm) }
  if ('seed' in input && typeof input.seed === 'string') {
    const r = createRand(hash('personality:' + input.seed))
    return Object.fromEntries(KEYS.map((k) => [k, Math.round(r() * 100) / 100])) as unknown as Traits
  }
  const t = input as Partial<Traits>
  return Object.fromEntries(KEYS.map((k) => [k, clamp(t[k] ?? 0.5)])) as unknown as Traits
}

/** Name the closest preset, e.g. for "Ada is grumpy" UI copy. */
export function personalityName(t: Traits): PersonalityName {
  let best: PersonalityName = 'calm'
  let dist = Infinity
  for (const [name, p] of Object.entries(PERSONALITIES) as [PersonalityName, Traits][]) {
    const d = KEYS.reduce((s, k) => s + (p[k] - t[k]) ** 2, 0)
    if (d < dist) (dist = d), (best = name)
  }
  return best
}

export interface PersonalityOptions {
  /** Pull faces on its own every so often. Default true. */
  idle?: boolean
  /** Random source, for tests. Default Math.random. */
  random?: () => number
}

export interface Personality {
  readonly traits: Traits
  readonly name: PersonalityName
  /** React to an event the way this character would. */
  react(event: LifeEvent): void
  destroy(): void
}

const IDLE_FACES: [keyof Traits, Mood][] = [
  ['playfulness', 'silly'],
  ['playfulness', 'wink'],
  ['warmth', 'happy'],
  ['curiosity', 'surprised'],
  ['curiosity', 'confused'],
  ['temper', 'angry'],
]

/**
 * Give an avatar a character. It tunes motion (energy → intensity and speed,
 * dozing off), how it reacts to pokes, and adds unprompted idle faces.
 *
 *   const me = personality(mount(el, buddy, { seed }), { seed })
 *   me.react('success')
 */
export function personality(handle: AliveHandle, input: PersonalityInput = { seed: 'livatar' }, opts: PersonalityOptions = {}): Personality {
  const t = traits(input)
  const rnd = opts.random ?? Math.random
  let pokes = 0
  let pokeTimer: ReturnType<typeof setTimeout> | undefined
  let idleTimer: ReturnType<typeof setTimeout> | undefined
  let dead = false

  handle.set({
    intensity: 0.6 + t.energy * 0.8,
    speed: 0.6 + t.energy * 0.9,
    idleAfter: 6000 - t.curiosity * 4500,
    sleepAfter: Math.round(20000 + t.energy * 100000),
    pokeMood: t.temper > 0.7 ? 'angry' : t.shyness > 0.75 ? 'love' : t.playfulness > 0.7 ? 'silly' : 'surprised',
  })

  const react = (event: LifeEvent) => {
    if (!dead) play(handle, event, t)
  }

  // pokes escalate with temper: a calm one stays amused, a grumpy one gets cross
  const onPoke = () => {
    pokes++
    clearTimeout(pokeTimer)
    pokeTimer = setTimeout(() => (pokes = 0), 4000)
    if (pokes >= Math.round(6 - t.temper * 4)) react('annoyed')
  }
  const root = handle.el
  root?.addEventListener('livatar:poke', onPoke)

  const tick = () => {
    if (dead || opts.idle === false) return
    // more curious/playful → shorter gaps between idle faces
    const gap = 9000 + (1 - Math.max(t.playfulness, t.curiosity)) * 25000
    idleTimer = setTimeout(() => {
      if (dead) return
      const pool = IDLE_FACES.filter(([k]) => rnd() < t[k])
      const pick = pool[Math.floor(rnd() * pool.length)]
      if (pick && handle.state.mood === 'neutral') handle.emote(pick[1], 1200)
      else if (rnd() < t.curiosity) handle.look(rnd() * 2 - 1, rnd() - 0.5, 1000)
      tick()
    }, gap * (0.7 + rnd() * 0.6))
  }
  tick()

  return {
    traits: t,
    name: personalityName(t),
    react,
    destroy() {
      dead = true
      clearTimeout(idleTimer)
      clearTimeout(pokeTimer)
      root?.removeEventListener('livatar:poke', onPoke)
    },
  }
}
