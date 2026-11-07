/* ------------------------------------------------------------------ *
 *  livatar alive — brings any livatar SVG to life.
 *
 *  One shared requestAnimationFrame loop and one set of global
 *  listeners drive every avatar on the page. Parts opt in through
 *  data attributes, so any SVG (yours, too) can become alive:
 *
 *    data-lv-depth="0.8"  parallax: follows gaze by depth × 4 units
 *    data-lv-tilt="5"     rotates with horizontal gaze (degrees)
 *    data-lv-eye          blinks / closes (scaleY)
 *    data-lv-mouth="0.9"  opens when talking / typing (scaleY)
 *    data-lv-body         breathes and squashes when poked
 *    data-lv-shy          hidden; rises into view on password fields
 *                         (e.g. hands covering the eyes)
 *    data-lv-float        bobs gently ("drip": falls and fades, for tears)
 *
 *  The root <svg data-lv-mood="…"> picks mood motion (happy bounce,
 *  angry tremble, sleepy droop…); data-lv-flip mirrors the gaze.
 * ------------------------------------------------------------------ */
import type { Mood } from './core'

export interface AliveState {
  /** Smoothed gaze, -1…1. */
  x: number
  y: number
  /** 0 = eyes open, 1 = closed (blink or shy). */
  closed: number
  /** 0…1 mouth openness. */
  mouth: number
  /** 0…1 shyness (password focus). */
  shy: number
  /** Current mood (temporary emotes and sleep included). */
  mood: Mood
}

export interface BehaviorContext {
  /** Mutable gaze target for this frame, -1…1. */
  target: { x: number; y: number }
  state: Readonly<AliveState>
  rect: DOMRect
  now: number
  dt: number
  root: Element
  handle: AliveHandle
}

/** A behavior is a plugin called every frame before smoothing. */
export type Behavior = (ctx: BehaviorContext) => void

export interface AliveOptions {
  /** Follow pointer / touch. Default true. */
  track?: boolean
  /** Look at focused text inputs and their caret. Default true. */
  focus?: boolean
  /** React to typing (mouth) and arrow keys (gaze). Default true. */
  keyboard?: boolean
  /** Random blinking. Default true. */
  blink?: boolean
  /** Subtle breathing. Default true. */
  breathe?: boolean
  /** Wander gaze when the pointer is idle. Default true. */
  idle?: boolean
  /** Squash + `livatar:poke` event on click/tap. Default true. */
  poke?: boolean
  /** Close eyes & look away when a password field is focused. Default true. */
  shy?: boolean
  /** Motion amount multiplier. Default 1. */
  intensity?: number
  /** Smoothing speed multiplier. Default 1. */
  speed?: number
  /** Pixel distance at which gaze reaches ~50%. Default: max(160, 1.5 × size). */
  range?: number
  /** ms of pointer inactivity before idle wandering. Default 4000. */
  idleAfter?: number
  /** 'auto' honours prefers-reduced-motion. Default 'auto'. */
  reducedMotion?: 'auto' | 'ignore'
  /** Extra per-frame plugins. */
  behaviors?: Behavior[]
  /**
   * Returns fresh inner markup for `target` in a given mood. `mount()` and the
   * web component set this, which lets `emote()` redraw the whole face.
   * Without it, `emote()` only changes the motion.
   */
  rerender?: ((mood: Mood) => string) | null
  /** Mood flashed for a moment when poked (needs `rerender`), or false. Default 'surprised'. */
  pokeMood?: Mood | false
  /** Doze off (the sleepy mood) after this many ms without pointer or keyboard input. 0 = never. Default 0. */
  sleepAfter?: number
}

export interface AliveHandle {
  /** Look at a direction (-1…1) for `ms` milliseconds (default 1200). */
  look(x: number, y: number, ms?: number): void
  /** Animate talking for `ms` milliseconds (default 1200). Great for chat bots. */
  talk(ms?: number): void
  blink(): void
  poke(): void
  /** Switch mood. With `ms`, it's a temporary reaction that reverts afterwards. */
  emote(mood: Mood, ms?: number): void
  /** Nod yes. */
  nod(): void
  /** Shake head no. */
  shake(): void
  /** Re-scan parts after you replaced the SVG yourself. */
  refresh(): void
  set(options: Partial<AliveOptions>): void
  readonly state: Readonly<AliveState>
  /** The element this avatar lives in (null for a static handle). */
  readonly el: Element | null
  destroy(): void
}

interface Part {
  el: HTMLElement | SVGElement
  depth: number
  tilt: number
  eye: boolean
  mouth: number
  body: boolean
  shy: boolean
  /** 0 none, 1 bob, 2 drip */
  float: number
  last: string
  op: string
}

interface Instance {
  root: Element
  target: Element
  parts: Part[]
  o: Required<Omit<AliveOptions, 'range'>> & { range?: number }
  s: AliveState & {
    phase: number
    nextBlink: number
    blinkAt: number
    blinkTwice: boolean
    talkUntil: number
    pokeAt: number
    overrideUntil: number
    ox: number
    oy: number
    baseMood: Mood
    moodUntil: number
    asleep: boolean
    gesture: number
    gestureAt: number
  }
  flip: number
  moodTimer?: ReturnType<typeof setTimeout>
  scan(): void
  setMood(m: Mood): void
  rect: DOMRect | null
  visible: boolean
  handle: AliveHandle
  onDown: () => void
}

const DEFAULTS: Instance['o'] = {
  track: true,
  focus: true,
  keyboard: true,
  blink: true,
  breathe: true,
  idle: true,
  poke: true,
  shy: true,
  intensity: 1,
  speed: 1,
  idleAfter: 4000,
  reducedMotion: 'auto',
  behaviors: [],
  rerender: null,
  pokeMood: 'surprised',
  sleepAfter: 0,
}

const NOOP: AliveHandle = {
  look() {},
  talk() {},
  blink() {},
  poke() {},
  emote() {},
  nod() {},
  shake() {},
  refresh() {},
  set() {},
  state: { x: 0, y: 0, closed: 0, mouth: 0, shy: 0, mood: 'neutral' },
  el: null,
  destroy() {},
}

const SEL = '[data-lv-depth],[data-lv-tilt],[data-lv-eye],[data-lv-mouth],[data-lv-body],[data-lv-shy],[data-lv-float]'
const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

/* ---------------- shared engine ---------------- */

const instances = new Set<Instance>()
const pointer = { x: 0, y: 0, at: -1e9 }
let lastInput = 0
let focusEl: HTMLInputElement | HTMLTextAreaElement | HTMLElement | null = null
let raf = 0
let last = 0
let bound = false
let reduced = false
let io: IntersectionObserver | null = null
const now = () => performance.now()

function isTextField(el: Element | null): el is HTMLElement {
  if (!el) return false
  if (el instanceof HTMLTextAreaElement) return true
  if (el instanceof HTMLInputElement)
    return !/^(button|checkbox|radio|range|color|file|submit|reset|image|hidden)$/.test(el.type)
  return (el as HTMLElement).isContentEditable === true
}

function bind() {
  if (bound) return
  bound = true
  const mq = matchMedia('(prefers-reduced-motion: reduce)')
  reduced = mq.matches
  mq.addEventListener?.('change', (e) => (reduced = e.matches))

  addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.at = lastInput = now()
    },
    { passive: true },
  )
  addEventListener('pointerdown', (e) => {
    pointer.x = e.clientX
    pointer.y = e.clientY
    pointer.at = now()
  }, { passive: true })
  document.documentElement.addEventListener('mouseleave', () => (pointer.at = -1e9))
  addEventListener('blur', () => (pointer.at = -1e9))

  document.addEventListener('focusin', (e) => {
    focusEl = isTextField(e.target as Element) ? (e.target as HTMLElement) : null
  })
  document.addEventListener('focusout', () => (focusEl = null))

  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || /^(Shift|Alt|Control|Meta|CapsLock|Tab)$/.test(e.key)) return
    const t = (lastInput = now())
    const arrow = ARROWS[e.key]
    for (const i of instances) {
      if (!i.o.keyboard) continue
      if (arrow && !focusEl) {
        i.s.ox = arrow[0]
        i.s.oy = arrow[1]
        i.s.overrideUntil = t + 900
      } else if (!arrow && (focusEl as HTMLInputElement | null)?.type !== 'password') {
        // never chew on password keystrokes: no grin, no timing leak
        i.s.mouth = 1
      }
    }
  })

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) schedule()
  })

  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver((entries) => {
      for (const e of entries) for (const i of instances) if (i.target === e.target) i.visible = e.isIntersecting
      schedule()
    })
  }
}

function schedule() {
  if (!raf && instances.size && !document.hidden) {
    last = now()
    raf = requestAnimationFrame(frame)
  }
}

/** Approximate caret position of the focused field in viewport pixels. */
function caretPoint(): { x: number; y: number } | null {
  if (!focusEl) return null
  const r = focusEl.getBoundingClientRect()
  let x = r.left + r.width / 2
  const field = focusEl as HTMLInputElement
  if (typeof field.selectionStart === 'number' && field.value != null) {
    const fs = parseFloat(getComputedStyle(field).fontSize) || 16
    x = Math.min(r.right - 8, r.left + 10 + (field.selectionStart ?? 0) * fs * 0.55)
  }
  return { x, y: r.top + Math.min(r.height / 2, 24) }
}

const f = (v: number) => Math.round(v * 100) / 100
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function frame(t: number) {
  raf = 0
  const dt = Math.min(0.05, Math.max(0.001, (t - last) / 1000))
  last = t

  // READ phase (batch layout reads before any writes)
  const caret = caretPoint()
  const pw = !!focusEl && (focusEl as HTMLInputElement).type === 'password'
  for (const i of instances) if (i.visible) i.rect = i.target.getBoundingClientRect()

  // WRITE phase
  for (const i of instances) if (i.visible && i.rect) step(i, i.rect, t, dt, caret, pw)

  schedule()
}

function step(
  i: Instance,
  r: DOMRect,
  t: number,
  dt: number,
  caret: { x: number; y: number } | null,
  pw: boolean,
) {
  const { o, s } = i
  const calm = reduced && o.reducedMotion === 'auto'
  const k = o.intensity * (calm ? 0.5 : 1)
  const target = { x: 0, y: 0 }
  const range = o.range ?? Math.max(160, r.width * 1.5)
  const aim = (px: number, py: number) => {
    const dx = px - (r.left + r.width / 2)
    const dy = py - (r.top + r.height / 2)
    target.x = (dx / (Math.abs(dx) + range)) * 1.3
    target.y = (dy / (Math.abs(dy) + range)) * 1.3
  }

  // timed mood reactions and dozing off
  if (s.moodUntil && t >= s.moodUntil) {
    s.moodUntil = 0
    i.setMood(s.baseMood)
  }
  if (o.sleepAfter > 0 && !s.moodUntil) {
    const idle = t - Math.max(lastInput, s.gestureAt) > o.sleepAfter
    if (idle && !s.asleep && s.baseMood !== 'sleepy') {
      s.asleep = true
      i.setMood('sleepy')
    } else if (!idle && s.asleep) {
      s.asleep = false
      i.setMood(s.baseMood)
    }
  }
  const mood = s.mood
  const gt = (t - s.gestureAt) / 900

  if (s.gesture && gt < 1) {
    const w = Math.sin(gt * Math.PI * 4) * (1 - gt)
    if (s.gesture === 1) target.y = w
    else target.x = w * 1.1
  } else if (t < s.overrideUntil) {
    target.x = s.ox
    target.y = s.oy
  } else if (o.focus && caret) aim(caret.x, caret.y)
  else if (o.track && t - pointer.at < o.idleAfter) aim(pointer.x, pointer.y)
  else if (o.idle && !calm) {
    target.x = Math.sin(t / 1900 + s.phase) * 0.55 + Math.sin(t / 830 + s.phase * 3) * 0.15
    target.y = Math.sin(t / 2700 + s.phase * 2) * 0.3
  }

  // mood motion biases the gaze
  if (!calm) {
    if (mood === 'sad') target.y = target.y * 0.5 + 0.45
    else if (mood === 'sleepy') (target.x *= 0.2), (target.y = 0.55)
    else if (mood === 'love') target.x += Math.sin(t / 700 + s.phase) * 0.35
  }

  // shy: turn away & down, close eyes (styles may also raise data-lv-shy hands)
  s.shy = lerp(s.shy, o.shy && pw ? 1 : 0, 1 - Math.exp(-dt * 8))
  target.x = lerp(target.x, -1, s.shy)
  target.y = lerp(target.y, 0.45, s.shy)

  for (const b of o.behaviors) b({ target, state: s, rect: r, now: t, dt, root: i.root, handle: i.handle })

  const smooth = 1 - Math.exp(-dt * 9 * o.speed)
  s.x += (Math.max(-1, Math.min(1, target.x)) - s.x) * smooth
  s.y += (Math.max(-1, Math.min(1, target.y)) - s.y) * smooth

  // blink (not while surprised or asleep)
  if (o.blink && t >= s.nextBlink && mood !== 'surprised' && mood !== 'sleepy') {
    s.blinkAt = t
    s.blinkTwice = Math.random() < 0.18
    s.nextBlink = t + 1800 + Math.random() * 4200
  }
  const bt = (t - s.blinkAt) / 150
  let blink = bt >= 0 && bt < 1 ? Math.sin(bt * Math.PI) : 0
  if (s.blinkTwice && bt >= 1.5 && bt < 2.5) blink = Math.sin((bt - 1.5) * Math.PI)
  s.closed = Math.max(blink, s.shy)

  // mouth: talking oscillates, key presses decay
  if (t < s.talkUntil) s.mouth = Math.max(s.mouth, 0.35 + 0.65 * Math.abs(Math.sin(t / 85 + Math.sin(t / 310))))
  const mouth = s.mouth
  s.mouth *= Math.exp(-dt * 9)

  // body
  const slow = mood === 'sleepy' || mood === 'sad'
  let breathe = o.breathe && !calm ? Math.sin(t / (slow ? 1300 : 620) + s.phase) * (mood === 'sleepy' ? 0.03 : 0.013) : 0
  if (mood === 'happy' && !calm) breathe += Math.abs(Math.sin(t / 170)) * 0.03
  const pt = (t - s.pokeAt) / 520
  const squash = pt >= 0 && pt < 1 && !calm ? Math.sin(pt * Math.PI * 3) * (1 - pt) * 0.12 : 0

  // tremble (angry), tilt (confused), wobble (silly); mirrored avatars mirror the gaze
  const gx = (s.x + (mood === 'angry' && !calm ? Math.sin(t / 26) * 0.05 : 0)) * i.flip
  const lean = calm ? 0 : mood === 'confused' ? 1.2 : mood === 'silly' ? Math.sin(t / 260) * 0.9 : 0

  const M = 4 * k
  for (const p of i.parts) {
    let x = 0, y = 0, rot = 0, sx = 1, sy = 1
    if (p.depth) {
      x = gx * p.depth * M
      y = s.y * p.depth * M
    }
    if (p.tilt) rot = (gx + lean * i.flip) * p.tilt * k
    if (p.float) {
      if (p.float === 2) {
        const q = ((t + s.phase * 1000) % 1600) / 1600
        y += q * 7
        const op = (1 - q).toFixed(2)
        if (op !== p.op) p.el.style.opacity = p.op = op
      } else y += calm ? 0 : Math.sin(t / 480 + s.phase) * 1.6
    }
    if (p.eye) sy *= 1 - 0.92 * s.closed
    if (p.shy) {
      y += (1 - s.shy) * 48
      const op = s.shy > 0.01 ? '1' : '0'
      if (op !== p.op) p.el.style.opacity = p.op = op
    }
    if (p.mouth) {
      sy *= 1 + mouth * p.mouth
      sx *= 1 - mouth * 0.08
    }
    if (p.body) {
      sy *= 1 + breathe - squash
      sx *= 1 - breathe * 0.4 + squash * 0.7
    }
    const tr = `translate(${f(x)}px,${f(y)}px) rotate(${f(rot)}deg) scale(${f(sx)},${f(sy)})`
    if (tr !== p.last) p.el.style.transform = p.last = tr
  }
}

/* ---------------- public API ---------------- */

/**
 * Bring an avatar to life. `target` can be the <svg> itself or any element
 * containing it. Safe to call during SSR (returns a no-op handle).
 */
export function alive(target: Element | null | undefined, options: AliveOptions = {}): AliveHandle {
  if (!target || typeof window === 'undefined') return NOOP
  bind()

  const parts: Part[] = []
  const scan = () => {
  parts.length = 0
  const svg = target.matches('svg') ? target : target.querySelector('svg')
  inst.flip = svg?.hasAttribute('data-lv-flip') ? -1 : 1
  target.querySelectorAll<SVGElement>(SEL).forEach((el) => {
    const mouth = el.getAttribute('data-lv-mouth')
    const p: Part = {
      el,
      depth: parseFloat(el.getAttribute('data-lv-depth') || '0') || 0,
      tilt: parseFloat(el.getAttribute('data-lv-tilt') || '0') || 0,
      eye: el.hasAttribute('data-lv-eye'),
      mouth: mouth == null ? 0 : parseFloat(mouth) || 0.9,
      body: el.hasAttribute('data-lv-body'),
      shy: el.hasAttribute('data-lv-shy'),
      float: el.hasAttribute('data-lv-float') ? (el.getAttribute('data-lv-float') === 'drip' ? 2 : 1) : 0,
      last: '',
      op: '',
    }
    el.style.transformBox = 'fill-box'
    el.style.transformOrigin = p.body ? '50% 100%' : p.mouth ? '50% 0%' : '50% 50%'
    el.style.willChange = 'transform'
    parts.push(p)
  })
  }
  const svg0 = target.matches('svg') ? target : target.querySelector('svg')
  const mood0 = (svg0?.getAttribute('data-lv-mood') || 'neutral') as Mood

  const t = now()
  const inst: Instance = {
    root: target,
    target,
    parts,
    o: { ...DEFAULTS, ...options },
    s: {
      x: 0, y: 0, closed: 0, mouth: 0, shy: 0,
      mood: mood0,
      baseMood: mood0,
      moodUntil: 0,
      asleep: false,
      gesture: 0,
      gestureAt: -1e9,
      phase: Math.random() * 100,
      nextBlink: t + 600 + Math.random() * 3000,
      blinkAt: -1e9,
      blinkTwice: false,
      talkUntil: 0,
      pokeAt: -1e9,
      overrideUntil: 0,
      ox: 0,
      oy: 0,
    },
    rect: null,
    visible: !io,
    handle: NOOP,
    flip: 1,
    scan,
    setMood(m) {
      if (m === inst.s.mood) return
      inst.s.mood = m
      if (inst.o.rerender) {
        target.innerHTML = inst.o.rerender(m)
        scan()
      } else {
        const svg = target.matches('svg') ? target : target.querySelector('svg')
        svg?.setAttribute('data-lv-mood', m)
      }
    },
    onDown: () => {
      if (!inst.o.poke) return
      inst.s.pokeAt = now()
      const pm = inst.o.pokeMood
      if (pm && inst.o.rerender && !inst.s.moodUntil && !inst.s.asleep) handle.emote(pm, 700)
      target.dispatchEvent(new CustomEvent('livatar:poke', { bubbles: true }))
    },
  }
  scan()

  const handle: AliveHandle = {
    look(x, y, ms = 1200) {
      inst.s.ox = x
      inst.s.oy = y
      inst.s.overrideUntil = now() + ms
    },
    talk(ms = 1200) {
      inst.s.talkUntil = now() + ms
    },
    blink() {
      inst.s.nextBlink = 0
    },
    poke: inst.onDown,
    emote(m, ms) {
      clearTimeout(inst.moodTimer)
      if (ms) {
        inst.s.moodUntil = now() + ms
        // a timer, not the frame loop, so paused (offscreen) avatars revert too
        inst.moodTimer = setTimeout(() => {
          if (!inst.s.moodUntil) return
          inst.s.moodUntil = 0
          inst.setMood(inst.s.asleep ? 'sleepy' : inst.s.baseMood)
        }, ms)
      } else {
        inst.s.baseMood = m
        inst.s.moodUntil = 0
        inst.s.asleep = false
      }
      inst.setMood(m)
      schedule()
    },
    nod() {
      inst.s.gesture = 1
      inst.s.gestureAt = now()
    },
    shake() {
      inst.s.gesture = 2
      inst.s.gestureAt = now()
    },
    refresh() {
      scan()
      schedule()
    },
    set(o) {
      Object.assign(inst.o, o)
    },
    get state() {
      return inst.s
    },
    el: target,
    destroy() {
      clearTimeout(inst.moodTimer)
      instances.delete(inst)
      io?.unobserve(target)
      target.removeEventListener('pointerdown', inst.onDown)
      for (const p of parts) {
        p.el.style.transform = ''
        if (p.shy || p.float) p.el.style.opacity = ''
      }
    },
  }
  inst.handle = handle

  target.addEventListener('pointerdown', inst.onDown)
  instances.add(inst)
  io?.observe(target)
  schedule()
  return handle
}
