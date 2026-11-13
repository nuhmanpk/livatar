/* ------------------------------------------------------------------ *
 *  livatar/roam — full-body animals that spawn and roam around your site.
 *
 *    import { roam } from 'livatar/roam'
 *    const zoo = roam({ count: 3 })       // cats, foxes, owls… wandering along the bottom of the page
 *    zoo.spawn('fox')                     // add one
 *    zoo.destroy()                        // remove them all
 *
 *  Each animal is a full-body pixel-art sprite with its own pixel face (happy, angry, crying,
 *  scared, smug, dizzy…), so moods show on the whole character. They walk, sit, sleep, jump, greet
 *  each other, and can be petted (click) or picked up and dropped (drag). Natural rivals
 *  (dog → cat, cat → mouse, fox → chick…) chase each other, scuffle in a dust cloud when
 *  caught, and walk off smug or crying.
 *  Decorative: hidden from assistive tech, and they stay still with prefers-reduced-motion.
 * ------------------------------------------------------------------ */
import type { Mood } from './core'
import { GH, GW, PET_SPECIES, petFace, petSvg, sprite, type PetFace, type PetSpecies } from './roam-sprites'

export type RoamSpecies = PetSpecies
export type { PetFace } from './roam-sprites'

export interface RoamOptions {
  /** Species to pick from. Default: all of them. */
  species?: RoamSpecies[]
  /** How many to spawn right away. Default 3 (2 on small screens). */
  count?: number
  /** Most that can exist at once. Default 6. */
  max?: number
  /** Head size in px. Default 64 (48 on small screens). */
  size?: number
  /** Distance from the bottom of the viewport the animals stand on. Default 0. */
  ground?: number
  /** Where to put them. Default document.body. */
  container?: HTMLElement
  /** Let them say things now and then. Default true. */
  speak?: boolean
  /** Random synthesized sounds (meow, oink, tweet…). Default false: browsers need a click first, and surprise audio is rude. Change later with `zoo.sound = true`. */
  sound?: boolean
  /** z-index of the animals. Default 40. */
  zIndex?: number
  /** Animate even if the visitor prefers reduced motion. Default false. */
  ignoreReducedMotion?: boolean
  /** Natural rivals chase and scuffle now and then (dog → cat, cat → mouse, fox → chick…). Default true. */
  rivals?: boolean
  /** Called when an animal is clicked. */
  onPat?: (roamer: Roamer) => void
  /** Called when a chase ends: `winner` caught or escaped from `loser`. */
  onFight?: (winner: Roamer, loser: Roamer) => void
}

export interface Roamer {
  readonly species: RoamSpecies
  readonly el: HTMLElement
  /** Show a speech bubble for a moment. */
  say(text: string, ms?: number): void
  /** Hop. */
  jump(): void
  /** Show a face for a moment (default 1500 ms): any livatar mood, or a pet face like 'dizzy'. */
  emote(mood: Mood | PetFace, ms?: number): void
  /** Chase another animal. It runs away; if caught, they scuffle. */
  chase(other: Roamer): void
  remove(): void
}

export interface Roam {
  /** Turn the random sounds on or off. Call it from a click or key press so the browser allows audio. */
  sound: boolean
  readonly roamers: readonly Roamer[]
  spawn(species?: RoamSpecies): Roamer | null
  clear(): void
  destroy(): void
}

const ALL: RoamSpecies[] = PET_SPECIES
type St = 'walk' | 'idle' | 'sit' | 'sleep' | 'fly' | 'scratch' | 'roll' | 'zoom' | 'eat' | 'spin' | 'roar' | 'chase' | 'flee' | 'fight' | 'argue'
/** Who chases whom. */
const PREY: Partial<Record<RoamSpecies, RoamSpecies[]>> = {
  dog: ['cat', 'cat', 'bunny', 'pig'], cat: ['mouse', 'mouse', 'chick', 'dog'], fox: ['chick', 'bunny', 'mouse'], lion: ['pig', 'panda', 'bear'],
  owl: ['mouse'], bear: ['fox'], pig: ['chick'], dino: ['pig', 'chick', 'frog'],
}
type Snd = 'meow' | 'woof' | 'oink' | 'tweet' | 'squeak' | 'ribbit' | 'roar' | 'hoot' | 'yip' | 'growl' | 'snore' | 'bloop' | 'peep'
interface Persona { move: 'walk' | 'hop' | 'waddle'; speed: [number, number]; pick: [St, number][]; says: string[]; snd?: Snd; food?: string }
/** Every species has its own habits: koalas nap, pigs get naughty, birds fly, cats scratch… */
const PERSONA: Record<RoamSpecies, Persona> = {
  cat: { move: 'walk', speed: [30, 55], pick: [['walk', 3], ['idle', 2], ['sit', 2], ['scratch', 4], ['sleep', 2]], says: ['meow', 'purr…', '😼', '🐟'], snd: 'meow' },
  dog: { move: 'walk', speed: [48, 80], pick: [['walk', 4], ['idle', 1], ['sit', 1], ['spin', 3], ['sleep', 1]], says: ['woof!', '🦴', '🎾', '!'], snd: 'woof' },
  bear: { move: 'walk', speed: [24, 40], pick: [['walk', 2], ['eat', 4], ['sit', 2], ['sleep', 2]], says: ['🍯', 'grr?', '…'], snd: 'growl', food: '🍯' },
  bunny: { move: 'hop', speed: [44, 72], pick: [['walk', 4], ['idle', 2], ['sit', 2], ['eat', 3], ['sleep', 1]], says: ['🥕', '♪', '…'], snd: 'squeak', food: '🥕' },
  fox: { move: 'walk', speed: [46, 80], pick: [['walk', 4], ['idle', 2], ['sit', 2], ['zoom', 3]], says: ['yip!', '🦊', '…'], snd: 'yip' },
  panda: { move: 'walk', speed: [18, 32], pick: [['eat', 5], ['sit', 3], ['sleep', 3], ['walk', 2]], says: ['🎋', 'zzz', '…'], snd: 'bloop', food: '🎋' },
  frog: { move: 'hop', speed: [40, 70], pick: [['walk', 4], ['idle', 3], ['eat', 2]], says: ['ribbit', '🪰', '…'], snd: 'ribbit', food: '🪰' },
  mouse: { move: 'walk', speed: [60, 100], pick: [['walk', 3], ['zoom', 4], ['idle', 2], ['eat', 2]], says: ['squeak!', '🧀', '…'], snd: 'squeak', food: '🧀' },
  penguin: { move: 'waddle', speed: [30, 50], pick: [['walk', 4], ['zoom', 3], ['idle', 2], ['sit', 1]], says: ['🐟', '❄️', '♪'], snd: 'peep' },
  owl: { move: 'walk', speed: [20, 36], pick: [['idle', 3], ['fly', 4], ['sleep', 3], ['sit', 2], ['walk', 1]], says: ['hoo', '🌙', '👀'], snd: 'hoot' },
  chick: { move: 'walk', speed: [50, 84], pick: [['walk', 4], ['fly', 3], ['idle', 2], ['eat', 2]], says: ['peep!', '🌾', '♪'], snd: 'peep', food: '🌾' },
  pig: { move: 'walk', speed: [40, 62], pick: [['walk', 2], ['zoom', 4], ['roll', 4], ['idle', 1], ['sit', 1], ['sleep', 1]], says: ['oink!', 'snort!', 'hehe', '🐷'], snd: 'oink' },
  koala: { move: 'walk', speed: [10, 20], pick: [['sleep', 8], ['eat', 3], ['sit', 2], ['walk', 1]], says: ['zzz', '🌿', '…'], snd: 'snore', food: '🌿' },
  dino: { move: 'walk', speed: [28, 46], pick: [['walk', 3], ['roar', 3], ['sit', 2], ['sleep', 2], ['eat', 1]], says: ['RAWR', '🦖', '🌋', '…'], snd: 'roar', food: '🌿' },
  lion: { move: 'walk', speed: [30, 46], pick: [['walk', 3], ['roar', 3], ['sit', 3], ['sleep', 2], ['idle', 2]], says: ['ROAR', '👑', '…'], snd: 'roar' },
}

/* tiny synthesized animal noises (Web Audio, no files) */
type Tone = { t?: number; f0: number; f1: number; dur: number; type: OscillatorType; g?: number }
const SOUNDS: Record<Snd, Tone[]> = {
  meow: [{ f0: 520, f1: 920, dur: 0.18, type: 'triangle' }, { t: 0.17, f0: 920, f1: 440, dur: 0.38, type: 'triangle' }],
  woof: [{ f0: 320, f1: 150, dur: 0.13, type: 'sawtooth', g: 0.05 }, { t: 0.22, f0: 300, f1: 140, dur: 0.14, type: 'sawtooth', g: 0.05 }],
  oink: [{ f0: 190, f1: 130, dur: 0.12, type: 'square', g: 0.04 }, { t: 0.15, f0: 210, f1: 120, dur: 0.16, type: 'square', g: 0.04 }],
  tweet: [{ f0: 2300, f1: 3100, dur: 0.08, type: 'sine' }, { t: 0.11, f0: 3000, f1: 2100, dur: 0.1, type: 'sine' }, { t: 0.25, f0: 2500, f1: 3400, dur: 0.08, type: 'sine' }],
  peep: [{ f0: 2600, f1: 3300, dur: 0.07, type: 'sine' }, { t: 0.1, f0: 2800, f1: 3500, dur: 0.07, type: 'sine' }],
  squeak: [{ f0: 1500, f1: 2500, dur: 0.1, type: 'triangle' }],
  ribbit: [{ f0: 140, f1: 220, dur: 0.08, type: 'square', g: 0.04 }, { t: 0.11, f0: 150, f1: 240, dur: 0.1, type: 'square', g: 0.04 }],
  roar: [{ f0: 150, f1: 55, dur: 0.9, type: 'sawtooth', g: 0.07 }],
  growl: [{ f0: 110, f1: 70, dur: 0.5, type: 'sawtooth', g: 0.05 }],
  hoot: [{ f0: 430, f1: 390, dur: 0.22, type: 'sine', g: 0.08 }, { t: 0.4, f0: 430, f1: 350, dur: 0.34, type: 'sine', g: 0.08 }],
  yip: [{ f0: 700, f1: 1150, dur: 0.1, type: 'square', g: 0.03 }, { t: 0.14, f0: 760, f1: 1200, dur: 0.1, type: 'square', g: 0.03 }],
  snore: [{ f0: 95, f1: 70, dur: 0.7, type: 'sawtooth', g: 0.03 }],
  bloop: [{ f0: 300, f1: 700, dur: 0.12, type: 'sine', g: 0.08 }],
}
let audio: AudioContext | null = null
let lastSound = 0
const noise = (snd: Snd) => {
  const now = performance.now()
  if (now - lastSound < 1200) return
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audio ??= new Ctx()
    if (audio.state === 'suspended') void audio.resume()
    lastSound = now
    const t0 = audio.currentTime + 0.01
    for (const tone of SOUNDS[snd]) {
      const o = audio.createOscillator(), g = audio.createGain(), st = t0 + (tone.t ?? 0)
      o.type = tone.type; o.frequency.setValueAtTime(tone.f0, st); o.frequency.exponentialRampToValueAtTime(Math.max(20, tone.f1), st + tone.dur)
      g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(tone.g ?? 0.06, st + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, st + tone.dur)
      o.connect(g); g.connect(audio.destination); o.start(st); o.stop(st + tone.dur + 0.03)
    }
  } catch { /* no audio available: stay quiet */ }
}
const weighted = (l: [St, number][]): St => { let r = Math.random() * l.reduce((n, [, w]) => n + w, 0); for (const [k, w] of l) if ((r -= w) <= 0) return k; return l[0]![0] }

const css = `.lvr{position:fixed;left:0;pointer-events:none;will-change:transform;contain:layout style;transition:opacity .25s}
.lvr-flip{transform-origin:50% 100%}
.lvr svg.lvp{display:block;overflow:visible;image-rendering:pixelated;pointer-events:auto;cursor:grab;touch-action:none}
.lvr svg.lvp:active{cursor:grabbing}
.lvr-bodywrap,.lvr-bob{transform-origin:50% 100%}
.lvp-b{visibility:hidden}
.lvr[data-s=walk] .lvp-a,.lvr[data-s=zoom] .lvp-a,.lvr[data-s=chase] .lvp-a,.lvr[data-s=flee] .lvp-a,.lvr[data-s=fight] .lvp-a{animation:lvr-fa .36s step-end infinite}
.lvr[data-s=walk] .lvp-b,.lvr[data-s=zoom] .lvp-b,.lvr[data-s=chase] .lvp-b,.lvr[data-s=flee] .lvp-b,.lvr[data-s=fight] .lvp-b{animation:lvr-fb .36s step-end infinite}
.lvr[data-s=zoom] .lvp-a,.lvr[data-s=zoom] .lvp-b,.lvr[data-s=chase] .lvp-a,.lvr[data-s=chase] .lvp-b,.lvr[data-s=flee] .lvp-a,.lvr[data-s=flee] .lvp-b{animation-duration:.18s}
.lvr[data-s=walk] .lvr-bob,.lvr[data-s=zoom] .lvr-bob,.lvr[data-s=chase] .lvr-bob,.lvr[data-s=flee] .lvr-bob{animation:lvr-b .36s steps(2) infinite}
.lvr[data-s=sit] .lvr-bob,.lvr[data-s=eat] .lvr-bob{transform:translateY(4%) scaleY(.93)}
.lvr[data-s=sleep] .lvr-bob{transform:translateY(8%) scale(1.04,.86)}
.lvr[data-s=eat] .lvr-bodywrap{animation:lvr-eat .3s steps(2) infinite}
.lvr[data-s=scratch] .lvr-bodywrap{animation:lvr-sh .14s steps(2) infinite}
.lvr[data-s=roar] .lvr-bob{transform:scale(1.1) translateY(-4%)}
.lvr[data-s=roll] .lvr-bodywrap{animation:lvr-roll .7s steps(8) infinite;transform-origin:50% 60%}
.lvr[data-s=spin] .lvr-bob{animation:lvr-b .2s steps(2) infinite}
.lvr[data-s=fly] .lvr-bob{animation:lvr-b .24s steps(2) infinite}
.lvr[data-s=argue] .lvr-bob{animation:lvr-b .22s steps(2) infinite}
.lvr[data-s=fight] .lvr-bodywrap{animation:lvr-sh .1s steps(2) infinite}
.lvp-blink{animation:lvr-blink 3.6s step-end infinite}
.lvr-dust{position:absolute;left:50%;bottom:0;width:150%;height:110%;transform:translateX(-50%);pointer-events:none;font:700 15px system-ui;text-align:center}
.lvr-dust i{position:absolute;border-radius:50%;background:#e9e4dc;box-shadow:inset -4px -4px 0 rgba(0,0,0,.08);animation:lvr-d .5s ease-in-out infinite alternate}
.lvr-dust b{position:absolute;animation:lvr-pop .6s ease-out infinite}
.lvr-bubble{position:absolute;left:50%;bottom:100%;transform:translateX(-50%);margin-bottom:4px;transition:left .15s;padding:2px 8px;border-radius:12px;background:#fff;color:#1f1a2e;font:700 13px/1.3 system-ui,sans-serif;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.18);animation:lvr-p .35s cubic-bezier(.3,1.4,.5,1) both}
.lvr-bubble:empty{display:none}
.lvr-z{position:absolute;font:700 14px system-ui;color:#7f5af0;animation:lvr-z 2.2s ease-in infinite;opacity:0}
@keyframes lvr-fa{0%{visibility:visible}50%{visibility:hidden}}
@keyframes lvr-fb{0%{visibility:hidden}50%{visibility:visible}}
@keyframes lvr-b{50%{transform:translateY(-4%)}}
@keyframes lvr-sh{from{transform:translateX(-3%)}to{transform:translateX(3%)}}
@keyframes lvr-eat{50%{transform:translateY(3%)}}
@keyframes lvr-roll{to{transform:rotate(360deg)}}
@keyframes lvr-blink{0%,93%{transform:none}95%{transform:scaleY(.15)}}
@keyframes lvr-d{from{transform:scale(.85)}to{transform:scale(1.12)}}
@keyframes lvr-pop{0%{transform:scale(.3);opacity:0}30%{opacity:1}100%{transform:scale(1.3) translateY(-10px);opacity:0}}
@keyframes lvr-p{from{transform:translateX(-50%) scale(.4);opacity:0}}
@keyframes lvr-z{0%{transform:translate(0,0) scale(.6);opacity:0}25%{opacity:1}100%{transform:translate(12px,-26px) scale(1.1);opacity:0}}
@media (prefers-reduced-motion:reduce){.lvr *{animation:none!important}}`

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const pick = <T>(l: readonly T[]): T => l[Math.floor(Math.random() * l.length)]!

let styleEl: HTMLStyleElement | null = null
const ensureCss = () => {
  if (styleEl || typeof document === 'undefined') return
  styleEl = document.createElement('style'); styleEl.textContent = css; styleEl.setAttribute('data-livatar-roam', ''); document.head.append(styleEl)
}

/** Livatar moods → the pets' own pixel faces. */
const FACE: Record<string, PetFace> = {
  neutral: 'neutral', happy: 'happy', laugh: 'laugh', angry: 'angry', sad: 'sad', cry: 'cry', sleepy: 'sleepy', love: 'love', starstruck: 'love',
  scared: 'scared', surprised: 'surprised', smug: 'smug', cool: 'smug', silly: 'laugh', wink: 'happy', confused: 'dizzy', dizzy: 'dizzy',
}
interface PetHead { emote(mood: Mood | PetFace, ms?: number): void; destroy(): void }

interface Agent {
  api: Roamer
  el: HTMLElement
  flip: HTMLElement
  bubble: HTMLElement
  head: PetHead | null
  /** Head centre as a fraction of the sprite width. */
  hx: number
  species: RoamSpecies
  persona: Persona
  w: number
  x: number
  y: number
  vy: number
  dir: 1 | -1
  state: St | 'fall' | 'jump' | 'held'
  until: number
  tx: number
  ty: number
  legs: number
  speed: number
  nextSay: number
  nextSnore: number
  nextShove: number
  hopAt: number
  flipAt: number
  held?: { dx: number }
  foe?: Agent
  nextFeud: number
  dust?: HTMLElement
}

/** Spawn full-body animals that roam the page. */
export function roam(opts: RoamOptions = {}): Roam {
  const noop: Roam = { sound: false, roamers: [], spawn: () => null, clear() {}, destroy() {} }
  if (typeof document === 'undefined') return noop
  const calm = !opts.ignoreReducedMotion && matchMedia('(prefers-reduced-motion: reduce)').matches
  if (calm) return noop
  ensureCss()
  const small = innerWidth < 640
  const size = opts.size ?? (small ? 48 : 64)
  const max = opts.max ?? 6
  const ground = opts.ground ?? 0
  const species = opts.species?.length ? opts.species : ALL
  const host = opts.container ?? document.body
  const agents: Agent[] = []
  let sound = !!opts.sound
  let raf = 0
  let last = 0
  let px = -1e4, py = -1e4
  const onMove = (e: PointerEvent) => { px = e.clientX; py = e.clientY }
  addEventListener('pointermove', onMove, { passive: true })

  const vw = () => (host === document.body ? innerWidth : host.clientWidth)
  const vh = () => (host === document.body ? innerHeight : host.clientHeight)
  const W = Math.round(size * 1.3)
  /** Flying height: a low lane just above the ground, so birds never cover what people read. */
  const lane = () => rand(size * 0.6, Math.min(size * 2.2, vh() * 0.18))
  const queue = [...species].sort(() => Math.random() - 0.5)
  const nextSpecies = (): RoamSpecies => { if (!queue.length) queue.push(...[...species].sort(() => Math.random() - 0.5)); return queue.pop()! }
  const hear = (a: Agent, snd?: Snd) => { if (sound && !document.hidden) noise(snd ?? a.persona.snd ?? 'squeak') }

  const spawn = (sp?: RoamSpecies): Roamer | null => {
    if (agents.length >= max) return null
    const species_ = sp ?? nextSpecies()
    const persona = PERSONA[species_]
    const el = document.createElement('div')
    el.className = 'lvr'; el.dataset.s = 'fall'; el.dataset.m = persona.move; el.setAttribute('aria-hidden', 'true'); el.style.zIndex = String(opts.zIndex ?? 40); el.style.width = W + 'px'
    const flip = document.createElement('div'); flip.className = 'lvr-flip'
    const wrap = document.createElement('div'); wrap.className = 'lvr-bodywrap'
    const bob = document.createElement('div'); bob.className = 'lvr-bob'; bob.style.position = 'relative'
    bob.innerHTML = petSvg(species_, W, 'happy')
    const head = bob.firstElementChild as SVGSVGElement
    const faceEl = head.querySelector('.lvp-face')!
    wrap.append(bob); flip.append(wrap)
    const bubble = document.createElement('div'); bubble.className = 'lvr-bubble'
    bubble.style.marginBottom = -((W * GH) / GW) * 0.12 + 'px'
    el.style.bottom = '0px'; el.style.transform = 'translate3d(0,-120vh,0)'
    el.append(flip, bubble); host.append(el)
    // the pet's own face: shows a mood for a while, then settles back to neutral
    const layout = sprite(species_).face
    let faceTimer = 0, curFace: PetFace = 'happy'
    const showFace = (f: PetFace) => { if (f !== curFace) { curFace = f; faceEl.innerHTML = petFace(layout, f) } }
    const handle: PetHead = {
      emote: (m, ms = 1500) => { clearTimeout(faceTimer); showFace(FACE[m] ?? 'neutral'); faceTimer = setTimeout(() => showFace(a.state === 'sleep' ? 'sleepy' : 'neutral'), ms) as unknown as number },
      destroy: () => clearTimeout(faceTimer),
    }
    handle.emote('happy', 1200)
    const now = performance.now()
    const a: Agent = {
      api: null as unknown as Roamer, el, flip, bubble, head: handle, hx: layout.head, species: species_, persona, w: W,
      x: rand(0, Math.max(0, vw() - W)), y: vh() + 80, vy: 0, dir: Math.random() < 0.5 ? 1 : -1,
      state: 'fall', until: 0, tx: 0, ty: 0, legs: 0, speed: rand(...persona.speed), nextSay: now + rand(4000, 12000), nextSnore: 0, nextShove: 0, hopAt: 0, flipAt: 0,
      nextFeud: now + rand(6000, 14000),
    }
    a.api = {
      species: species_, el,
      say: (text, ms = 1800) => { bubble.textContent = text; setTimeout(() => { if (bubble.textContent === text) bubble.textContent = '' }, ms) },
      jump: () => { if (a.state !== 'held' && a.y <= 1) { a.vy = 380; a.state = 'jump' } },
      emote: (mood, ms = 1500) => handle.emote(mood, ms),
      chase: (other) => { const b = agents.find((x) => x.api === other); if (b && b !== a) feud(a, b, performance.now()) },
      remove: () => { if (a.foe) calm_(a.foe, performance.now()); calm_(a, 0); const i = agents.indexOf(a); if (i >= 0) agents.splice(i, 1); handle.destroy(); el.remove(); if (!agents.length) stop() },
    }
    // pat and pick-up
    let moved = 0, sx = 0, sy = 0
    head.addEventListener('pointerdown', (e) => {
      head.setPointerCapture(e.pointerId); moved = 0; sx = e.clientX; sy = e.clientY
      if (a.foe) { const f = a.foe; calm_(a, 0); f.head?.emote('confused', 1200); calm_(f, performance.now()) }
      a.held = { dx: e.clientX - a.x }; a.state = 'held'; el.dataset.s = 'held'
    })
    head.addEventListener('pointermove', (e) => {
      if (a.state !== 'held') return
      moved = Math.max(moved, Math.hypot(e.clientX - sx, e.clientY - sy))
      a.x = e.clientX - (a.held?.dx ?? 0); a.y = Math.max(0, vh() - ground - e.clientY - ((W * GH) / GW) * 0.5); a.vy = 0
    })
    const drop = (e: PointerEvent) => {
      if (a.state !== 'held') return
      head.releasePointerCapture?.(e.pointerId)
      if (moved < 6) { a.state = 'idle'; a.until = performance.now() + 1400; handle.emote('love', 1200); a.api.say('❤️', 1200); a.api.jump(); hear(a); opts.onPat?.(a.api) }
      else { a.state = 'fall'; handle.emote('scared', 900) }
    }
    head.addEventListener('pointerup', drop); head.addEventListener('pointercancel', drop)
    agents.push(a)
    if (!raf) start()
    return a.api
  }

  const free = (b: Agent) => b.state !== 'held' && b.state !== 'fly' && b.state !== 'fall' && b.state !== 'jump' && b.state !== 'sleep' && !b.foe && b.y < 4
  /** Start a chase: `a` goes after `b`. */
  const feud = (a: Agent, b: Agent, t: number) => {
    if (a.foe || b.foe || a.state === 'held' || b.state === 'held') return
    a.foe = b; b.foe = a
    a.state = 'chase'; b.state = 'flee'
    a.until = b.until = t + rand(5000, 8000)
    a.speed = a.persona.speed[1] * 1.9; b.speed = b.persona.speed[1] * 1.7
    a.head?.emote('angry', 8000); b.head?.emote('scared', 8000)
    a.api.say(pick(['!!', '😠', 'get back here!', a.persona.says[0] ?? '!'])); b.api.say(pick(['eek!', '😱', 'help!', '!!']))
    hear(a)
  }
  /** Drop out of any feud and go back to normal life. */
  const calm_ = (a: Agent, t: number) => {
    a.foe = undefined; a.dust?.remove(); a.dust = undefined
    if (t) decide(a, t)
  }
  const dust = (a: Agent) => {
    const d = document.createElement('div'); d.className = 'lvr-dust'
    let h = ''
    for (const [x, y, r] of [[18, 40, 30], [44, 18, 36], [70, 38, 30], [32, 60, 26], [58, 58, 28]]) h += `<i style="left:${x}%;top:${y}%;width:${r}%;height:${r * 1.2}%;animation-delay:${(x % 5) / 10}s"></i>`
    for (const [x, y, c, dl] of [[10, 0, '💢', 0], [70, -10, '⭐', 0.2], [40, -24, 'POW!', 0.35], [86, 30, '💥', 0.1]] as const) h += `<b style="left:${x}%;top:${y}%;animation-delay:${dl}s">${c}</b>`
    d.innerHTML = h; a.el.append(d); a.dust = d
  }
  /** The chase is over: `win` gloats, `lose` cries and runs off. */
  const settle = (win: Agent, lose: Agent, t: number) => {
    win.foe = lose.foe = undefined
    win.nextFeud = lose.nextFeud = t + rand(20000, 35000)
    win.dust?.remove(); lose.dust?.remove(); win.dust = lose.dust = undefined
    win.state = 'sit'; win.until = t + rand(2500, 4000)
    win.head?.emote(Math.random() < 0.5 ? 'smug' : 'cool', 3000); win.api.say(pick(['😏', 'hmph.', 'too easy', '🏆']), 2200)
    lose.state = 'walk'; lose.tx = lose.x < vw() / 2 ? vw() - lose.w : 0; lose.dir = lose.tx >= lose.x ? 1 : -1; lose.speed = lose.persona.speed[1] * 1.4; lose.until = t + 20000
    lose.head?.emote('cry', 3500); lose.api.say(pick(['😭', 'waaah', 'not fair!', '💔']), 2200)
    hear(lose); opts.onFight?.(win.api, lose.api)
  }

  const WAKE = ['😠 I was sleeping!', 'HEY! 💢', 'do you mind?!', 'ugh, so loud…', '😤 shoo!']
  const BACK = ['not my fault!', 'it\'s my spot too', '😜 oops', 'sleep less!', 'whatever 🙄']
  const RANT = ['💢#@!', 'you always do this', 'grr…', 'say that again!', '😡']
  /** A sleeper woken by a passer-by: they argue, then either scuffle or stomp off. */
  const argue = (a: Agent, b: Agent, t: number) => {
    a.foe = b; b.foe = a
    a.state = b.state = 'argue'; a.until = t + rand(3200, 4400); b.until = a.until + 600
    a.dir = b.x >= a.x ? 1 : -1; b.dir = a.x >= b.x ? 1 : -1
    a.el.querySelector('.lvr-z')?.remove()
    a.head?.emote('angry', 4500); b.head?.emote('surprised', 900)
    const lines: [Agent, string, number, Mood][] = [[a, pick(WAKE), 0, 'angry'], [b, pick(BACK), 1000, pick<Mood>(['smug', 'angry', 'silly'])], [a, pick(RANT), 2000, 'angry'], [b, pick(RANT), 2900, 'angry']]
    for (const [who, text, ms, mood] of lines) setTimeout(() => { if (who.state === 'argue') { who.api.say(text, 1100); who.head?.emote(mood, 1200) } }, ms)
    hear(a, a.persona.snd === 'snore' ? 'growl' : a.persona.snd)
  }

  /** Choose what to do next, according to the species' habits. */
  const decide = (a: Agent, t: number) => {
    const k = weighted(a.persona.pick)
    a.state = k
    a.head?.emote(k === 'sleep' ? 'sleepy' : k === 'roar' ? 'angry' : k === 'zoom' || k === 'spin' || k === 'roll' ? 'silly' : k === 'eat' ? 'love' : k === 'scratch' ? 'wink' : k === 'fly' ? 'surprised' : 'happy')
    const [lo, hi] = a.persona.speed
    switch (k) {
      case 'walk': case 'zoom':
        a.tx = rand(0, Math.max(0, vw() - a.w)); a.dir = a.tx >= a.x ? 1 : -1; a.speed = rand(lo, hi) * (k === 'zoom' ? 2.3 : 1)
        a.until = t + 20000; if (k === 'zoom') { a.api.say(pick(a.persona.says), 1400); hear(a) }
        break
      case 'fly':
        a.tx = rand(0, Math.max(0, vw() - a.w)); a.ty = lane(); a.legs = (Math.random() < 0.5 ? 1 : 0) + 1; a.dir = a.tx >= a.x ? 1 : -1; a.until = t + 20000; hear(a)
        break
      case 'sleep': a.until = t + (a.species === 'koala' ? rand(12000, 24000) : rand(6000, 12000)); a.nextSnore = t + 2500; break
      case 'sit': a.until = t + rand(2500, 6000); break
      case 'idle': a.until = t + rand(1200, 3200); break
      case 'scratch': a.until = t + rand(2200, 3800); a.api.say('🌀', 900); break
      case 'roll': a.until = t + rand(1800, 3000); a.api.say(a.species === 'pig' ? 'wheee!' : '🌊', 1200); hear(a); break
      case 'eat': a.until = t + rand(2500, 4500); a.api.say((a.persona.food ?? '🍖') + ' nom', 2000); break
      case 'spin': a.until = t + rand(1800, 2800); a.api.say('!', 900); hear(a); break
      case 'roar': a.until = t + rand(1500, 2400); a.api.say(a.persona.says[0] ?? 'ROAR', 1500); hear(a, 'roar'); break
    }
  }

  const tick = () => {
    raf = requestAnimationFrame(tick)
    const t = performance.now()
    if (document.hidden) { last = t; return }
    const dt = Math.max(0.001, Math.min(0.05, (t - last) / 1000)); last = t
    for (const a of agents) {
      const st = a.state
      if (st === 'fall' || st === 'jump') {
        a.vy -= 1500 * dt; a.y += a.vy * dt
        if (a.y <= 0) { a.y = 0; if (Math.abs(a.vy) > 260 && st === 'fall') a.vy = -a.vy * 0.35; else { a.vy = 0; a.head?.emote('happy', 700); decide(a, t) } }
      } else if (st === 'walk' || st === 'zoom') {
        const d = a.tx - a.x, step = a.speed * dt
        if (a.persona.move === 'hop') {
          a.vy -= 1500 * dt; a.y = Math.max(0, a.y + a.vy * dt)
          if (a.y <= 0) { a.y = 0; a.vy = 0; if (t > a.hopAt) { a.vy = rand(230, 310); a.hopAt = t + rand(140, 320) } }
        }
        if (Math.abs(d) <= step) { a.x = a.tx; decide(a, t) } else a.x += Math.sign(d) * step * (a.persona.move === 'hop' && a.y <= 0 ? 0.15 : 1)
        if (t > a.until) decide(a, t)
        // naughty: a zooming pig barges into whoever is in the way
        if (a.species === 'pig' && st === 'zoom' && t > a.nextShove) for (const b of agents) {
          if (b !== a && b.state !== 'held' && b.y < 4 && Math.abs(b.x - a.x) < a.w * 0.7) { a.nextShove = t + 5000; b.x += a.dir * 40; b.vy = 300; b.state = 'fall'; b.head?.emote('angry', 1200); b.api.say('hey!'); a.head?.emote('laugh', 1200); a.api.say('hehe'); hear(a); break }
        }
      } else if (st === 'chase' || st === 'flee') {
        const f = a.foe
        if (!f || !agents.includes(f) || (f.state !== 'chase' && f.state !== 'flee' && f.state !== 'fight')) { calm_(a, t); continue }
        if (st === 'chase') {
          a.dir = f.x >= a.x ? 1 : -1
          a.x += a.dir * a.speed * dt
          if (Math.abs(f.x - a.x) < a.w * 0.45) {
            // caught: scuffle in a dust cloud
            a.state = f.state = 'fight'; a.until = f.until = t + rand(1800, 2600)
            a.x = f.x = (a.x + f.x) / 2; dust(a); f.el.style.visibility = 'hidden'
            a.head?.emote('angry', 3000); f.head?.emote('angry', 3000); hear(a, 'growl')
          } else if (t > a.until) {
            // gave up: the prey has the last laugh
            a.foe = f.foe = undefined; a.nextFeud = f.nextFeud = t + rand(15000, 25000)
            a.head?.emote('sad', 1600); a.api.say(pick(['hmph', 'fine.', '😤'])); decide(a, t)
            f.head?.emote('laugh', 2000); f.api.say(pick(['nyah!', 'too slow!', '😜'])); f.state = 'idle'; f.until = t + 1800
          }
        } else {
          const away = a.x >= f.x ? 1 : -1, edge = away === 1 ? a.x >= vw() - a.w * 0.85 : a.x <= -a.w * 0.15
          if (edge) { a.dir = (away * -1) as 1 | -1; if (Math.random() < 0.02) { a.vy = 260; a.y = 1; a.state = 'flee' } }
          else { a.dir = away as 1 | -1; a.x += a.dir * a.speed * dt }
          if (a.y > 0) { a.vy -= 1500 * dt; a.y = Math.max(0, a.y + a.vy * dt) }
          if (a.persona.move === 'hop' && a.y <= 0 && Math.random() < 0.06) { a.vy = 220; a.y = 0.5 }
        }
      } else if (st === 'fight') {
        const f = a.foe
        if (!f || !agents.includes(f)) { a.el.style.visibility = ''; calm_(a, t); continue }
        if (Math.random() < 0.03) a.dir = a.dir === 1 ? -1 : 1
        if (a.dust && Math.random() < 0.012) a.api.say(pick(['💢', 'grr!', '#@!', 'ow!']), 700)
        if (a.dust && t > a.until) {
          f.el.style.visibility = ''
          const chaserWins = Math.random() < 0.65
          settle(chaserWins ? a : f, chaserWins ? f : a, t)
          f.x += (f.x < vw() / 2 ? -1 : 1) * a.w * 0.6
        }
      } else if (st === 'argue') {
        const f = a.foe
        if (!f || !agents.includes(f) || f.state !== 'argue') { a.foe = undefined; decide(a, t); continue }
        // the woken one (the one that started it) decides how it ends
        if (t > a.until && a.until < f.until) {
          if (opts.rivals !== false && Math.random() < 0.55) {
            a.state = f.state = 'fight'; a.until = f.until = t + rand(1800, 2600)
            a.x = f.x = (a.x + f.x) / 2; dust(a); f.el.style.visibility = 'hidden'; hear(a, 'growl')
          } else {
            a.foe = f.foe = undefined
            a.head?.emote('sleepy', 1500); a.api.say('hmph. 💤', 1400); a.state = 'sleep'; a.until = t + rand(6000, 10000); a.nextSnore = t + 2500
            f.head?.emote(pick<Mood>(['smug', 'sad', 'laugh']), 1800); f.state = 'walk'; f.tx = f.x < vw() / 2 ? vw() - f.w : 0; f.dir = f.tx >= f.x ? 1 : -1; f.until = t + 20000
          }
        }
      } else if (st === 'fly') {
        const dx = a.tx - a.x, dy = a.ty - a.y, dist = Math.hypot(dx, dy), step = 120 * dt
        a.dir = dx >= 0 ? 1 : -1
        if (dist <= step + 2) { a.x = a.tx; a.y = a.ty; if (a.legs-- > 0) { a.tx = rand(0, Math.max(0, vw() - a.w)); a.ty = lane(); hear(a) } else { a.state = 'fall'; a.vy = 0; a.head?.emote('happy', 900) } }
        else { a.x += (dx / dist) * step; a.y += (dy / dist) * step + Math.sin(t / 140) * 0.6 }
      } else if (st !== 'held') {
        if (st === 'spin' && t > a.flipAt) { a.dir = a.dir === 1 ? -1 : 1; a.flipAt = t + 130 }
        if (st === 'sleep' && t > a.nextFeud && !a.foe) {
          const b = agents.find((b) => b !== a && !b.foe && (b.state === 'walk' || b.state === 'zoom' || b.state === 'roll' || b.state === 'spin') && b.y < 4 && Math.abs(b.x - a.x) < a.w * 0.75)
          if (b) { a.nextFeud = t + rand(12000, 20000); if (Math.random() < 0.85) { argue(a, b, t); continue } }
        }
        if (st === 'sleep' && t > a.nextSnore) { a.nextSnore = t + rand(3500, 6500); if (a.species === 'koala' || Math.random() < 0.35) hear(a, 'snore') }
        if (t > a.until) decide(a, t)
      }
      // rivals: a chaser that spots its prey nearby goes for it
      if (opts.rivals !== false && t > a.nextFeud && free(a) && (a.state === 'walk' || a.state === 'idle' || a.state === 'sit')) {
        a.nextFeud = t + rand(14000, 30000)
        const prey = PREY[a.species]
        const b = prey && agents.find((b) => b !== a && prey.includes(b.species) && free(b) && Math.abs(b.x - a.x) < vw() * 0.6)
        if (b && Math.random() < 0.6) feud(a, b, t)
      }
      // greet a neighbour
      if (a.state === 'idle' || a.state === 'sit') for (const b of agents) if (b !== a && Math.abs(b.x - a.x) < a.w * 0.9 && b.state !== 'sleep' && b.state !== 'held' && Math.random() < 0.004) { a.dir = b.x >= a.x ? 1 : -1; a.api.say(pick(['👋', 'hi!', 'haha'])); a.head?.emote(pick<Mood>(['happy', 'laugh', 'wink']), 900) }
      if (opts.speak !== false && t > a.nextSay && a.state !== 'held' && a.state !== 'fall') {
        a.nextSay = t + rand(8000, 20000)
        a.api.say(a.state === 'sleep' ? '💤' : pick(a.persona.says))
        if (a.state !== 'sleep' && Math.random() < 0.6) hear(a)
      }
      a.x = Math.max(-a.w * 0.2, Math.min(vw() - a.w * 0.8, a.x))
      const s = a.state === 'fall' || a.state === 'jump' ? 'idle' : a.state
      if (a.el.dataset.s !== s) a.el.dataset.s = s
      a.flip.style.transform = `scaleX(${a.dir})`
      const hOff = a.dir === 1 ? a.w * a.hx : a.w * (1 - a.hx), Hs = (a.w * GH) / GW
      const headX = a.x + hOff
      a.bubble.style.left = hOff + 'px'
      // near the pointer but not on its head: step aside visually so the page underneath stays usable
      const bottomY = vh() - ground - a.y, near = Math.abs(px - (a.x + a.w / 2)) < a.w * 0.9 && py > bottomY - Hs * 1.3 && py < bottomY + 8
      const onHead = Math.hypot(px - headX, py - (bottomY - Hs * 0.6)) < Hs * 0.55
      const fade = near && !onHead && a.state !== 'held' ? '0.35' : ''
      if (a.el.style.opacity !== fade) a.el.style.opacity = fade
      a.el.style.transform = `translate3d(${Math.round(a.x)}px, ${-Math.round(a.y + ground)}px, 0)`
      if (a.state === 'sleep' && !a.el.querySelector('.lvr-z')) { const z = document.createElement('span'); z.className = 'lvr-z'; z.textContent = 'z'; z.style.left = hOff + a.w * 0.12 + 'px'; z.style.top = '0px'; a.el.append(z) }
      else if (a.state !== 'sleep') a.el.querySelector('.lvr-z')?.remove()
    }
  }
  const start = () => { last = performance.now(); raf = requestAnimationFrame(tick) }
  const stop = () => { cancelAnimationFrame(raf); raf = 0 }

  const n = opts.count ?? (small ? 2 : 3)
  for (let i = 0; i < n; i++) setTimeout(() => spawn(), 400 + i * 700)

  return {
    get sound() { return sound },
    set sound(v: boolean) { sound = v; if (v) noise('bloop') },
    get roamers() { return agents.map((a) => a.api) },
    spawn,
    clear() { for (const a of [...agents]) a.api.remove() },
    destroy() { for (const a of [...agents]) a.api.remove(); stop(); removeEventListener('pointermove', onMove) },
  }
}
