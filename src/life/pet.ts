import type { Mood } from '../core'
import type { AliveHandle } from '../alive'

export interface PetStats {
  /** 0 = starving, 100 = full. */
  hunger: number
  /** 0 = exhausted, 100 = rested. */
  energy: number
  /** 0 = miserable, 100 = thrilled. */
  happiness: number
  xp: number
  level: number
  /** Life stage, grows with level. */
  stage: 'baby' | 'kid' | 'teen' | 'adult'
  asleep: boolean
  /** Last time stats were updated (ms epoch). */
  at: number
  born: number
}

export interface PetStore {
  get(key: string): string | null | undefined
  set(key: string, value: string): void
}

export interface PetOptions {
  /** Storage key. Default 'livatar:pet'. */
  key?: string
  /** Where to keep the pet. Default localStorage (falls back to memory). Pass your own to sync to a backend. */
  store?: PetStore | null
  /** Points lost per hour. Default { hunger: 6, energy: 4, happiness: 5 }. */
  decay?: Partial<Record<'hunger' | 'energy' | 'happiness', number>>
  /** Called on every change, e.g. to update a stats bar. */
  onChange?: (stats: PetStats) => void
  /** Called once when the level goes up. */
  onLevelUp?: (level: number, stats: PetStats) => void
  /** Clock, for tests. Default Date.now. */
  now?: () => number
  /** Re-check stats every ms. Default 60000. 0 = only on actions. */
  tick?: number
}

export interface Pet {
  readonly stats: Readonly<PetStats>
  feed(amount?: number): void
  play(amount?: number): void
  /** Petting: a quick happiness bump. Also triggered by poking the avatar. */
  pat(): void
  sleep(): void
  wake(): void
  /** Give XP for anything (finishing a task, a streak, …). */
  reward(xp: number): void
  /** The mood the pet's stats call for right now. */
  mood(): Mood
  reset(): void
  destroy(): void
}

const STAGES: PetStats['stage'][] = ['baby', 'kid', 'teen', 'adult']
const clamp = (v: number) => Math.max(0, Math.min(100, v))
const xpFor = (level: number) => 50 * level * level

function memoryStore(): PetStore {
  const m = new Map<string, string>()
  return { get: (k) => m.get(k), set: (k, v) => void m.set(k, v) }
}
function localStore(): PetStore {
  try {
    const ls = globalThis.localStorage
    ls.setItem('livatar:t', '1')
    ls.removeItem('livatar:t')
    return { get: (k) => ls.getItem(k), set: (k, v) => { try { ls.setItem(k, v) } catch {} } }
  } catch {
    return memoryStore()
  }
}

/**
 * A virtual pet: hunger, energy and happiness drift over real time (also while
 * the page is closed), it gains XP, levels up and grows through life stages.
 * Its face always follows how it feels.
 *
 *   const p = pet(mount(el, animal, { seed: 'mochi' }), { onChange: renderBars })
 *   feedButton.onclick = () => p.feed()
 */
export function pet(handle: AliveHandle, opts: PetOptions = {}): Pet {
  const now = opts.now ?? Date.now
  const key = opts.key ?? 'livatar:pet'
  const store = opts.store ?? localStore()
  const decay = { hunger: 6, energy: 4, happiness: 5, ...opts.decay }

  const fresh = (): PetStats => ({ hunger: 80, energy: 80, happiness: 80, xp: 0, level: 1, stage: 'baby', asleep: false, at: now(), born: now() })
  let s: PetStats
  try {
    s = { ...fresh(), ...JSON.parse(store.get(key) || 'null') }
  } catch {
    s = fresh()
  }
  let shown: Mood | null = null

  const mood = (): Mood => {
    if (s.asleep) return 'sleepy'
    const low = Math.min(s.hunger, s.energy, s.happiness)
    if (low < 15) return s.hunger === low ? 'angry' : s.energy === low ? 'sleepy' : 'sad'
    if (low < 35) return s.energy === low ? 'sleepy' : 'sad'
    if (s.happiness > 85 && s.hunger > 60) return 'love'
    if (s.happiness > 60) return 'happy'
    return 'neutral'
  }

  const save = () => {
    store.set(key, JSON.stringify(s))
    const m = mood()
    if (m !== shown) handle.emote((shown = m))
    opts.onChange?.(s)
  }

  // catch up on time passed (also while the tab was closed)
  const update = () => {
    const t = now()
    const hours = Math.max(0, (t - s.at) / 3_600_000)
    s.at = t
    if (s.asleep) {
      s.energy = clamp(s.energy + hours * 20)
      s.hunger = clamp(s.hunger - hours * decay.hunger * 0.5)
      if (s.energy >= 100) s.asleep = false
    } else {
      s.hunger = clamp(s.hunger - hours * decay.hunger)
      s.energy = clamp(s.energy - hours * decay.energy)
      // a hungry or tired pet gets unhappy faster
      const strain = s.hunger < 30 || s.energy < 30 ? 2 : 1
      s.happiness = clamp(s.happiness - hours * decay.happiness * strain)
    }
  }

  const reward = (xp: number) => {
    s.xp += Math.max(0, xp)
    while (s.xp >= xpFor(s.level)) {
      s.level++
      s.stage = STAGES[Math.min(STAGES.length - 1, Math.floor((s.level - 1) / 3))]
      opts.onLevelUp?.(s.level, s)
      handle.emote('love', 2500)
      handle.nod()
    }
  }

  const act = (fn: () => void, flash?: Mood) => {
    update()
    fn()
    save()
    if (flash) handle.emote(flash, 1400)
  }

  const onPoke = () => act(() => {
    if (s.asleep) return
    s.happiness = clamp(s.happiness + 3)
    reward(1)
  })
  handle.el?.addEventListener('livatar:poke', onPoke)

  const timer = opts.tick === 0 ? undefined : setInterval(() => act(() => {}), opts.tick ?? 60_000)
  update()
  save()

  return {
    get stats() {
      return s
    },
    feed: (amount = 25) => act(() => {
      if (s.asleep) return
      const full = s.hunger > 90
      s.hunger = clamp(s.hunger + amount)
      s.happiness = clamp(s.happiness + (full ? -5 : 5))
      reward(5)
    }, s.hunger > 90 ? 'confused' : 'happy'),
    play: (amount = 20) => act(() => {
      if (s.asleep || s.energy < 10) return
      s.happiness = clamp(s.happiness + amount)
      s.energy = clamp(s.energy - amount / 2)
      s.hunger = clamp(s.hunger - amount / 4)
      reward(8)
    }, s.energy < 10 ? 'sleepy' : 'silly'),
    pat: onPoke,
    sleep: () => act(() => (s.asleep = true)),
    wake: () => act(() => (s.asleep = false), 'surprised'),
    reward: (xp) => act(() => reward(xp)),
    mood: () => (update(), mood()),
    reset: () => {
      s = fresh()
      save()
    },
    destroy() {
      clearInterval(timer)
      handle.el?.removeEventListener('livatar:poke', onPoke)
    },
  }
}
