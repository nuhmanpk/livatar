/* ------------------------------------------------------------------ *
 *  livatar/roam — full-body animals that spawn and roam around your site.
 *
 *    import { roam } from 'livatar/roam'
 *    const zoo = roam({ count: 3 })       // cats, foxes, owls… wandering along the bottom of the page
 *    zoo.spawn('fox')                     // add one
 *    zoo.destroy()                        // remove them all
 *
 *  Each animal has a head (the livatar `animal` style, so it blinks, looks at the cursor and
 *  reacts), a body, legs and a tail that suit the species. They walk, sit, sleep, jump, greet
 *  each other, and can be petted (click) or picked up and dropped (drag).
 *  Decorative: hidden from assistive tech, and they stay still with prefers-reduced-motion.
 * ------------------------------------------------------------------ */
import { mount } from './index'
import { animal } from './styles/animal'
import type { AliveHandle } from './alive'

export type RoamSpecies = 'cat' | 'dog' | 'bear' | 'bunny' | 'fox' | 'panda' | 'frog' | 'mouse' | 'shark' | 'penguin' | 'owl' | 'chick' | 'parrot' | 'pig' | 'koala' | 'lion'

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
  /** Called when an animal is clicked. */
  onPat?: (roamer: Roamer) => void
}

export interface Roamer {
  readonly species: RoamSpecies
  readonly el: HTMLElement
  /** Show a speech bubble for a moment. */
  say(text: string, ms?: number): void
  /** Hop. */
  jump(): void
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

const ALL: RoamSpecies[] = ['cat', 'dog', 'bear', 'bunny', 'fox', 'panda', 'frog', 'mouse', 'shark', 'penguin', 'owl', 'chick', 'parrot', 'pig', 'koala', 'lion']
const FUR: Record<RoamSpecies, string> = { cat: '#f4a259', dog: '#c68b59', bear: '#8b5a3c', bunny: '#f6f1ea', fox: '#f08a3c', panda: '#ffffff', frog: '#7ccf6b', mouse: '#b8b2ae', shark: '#7f9cc0', penguin: '#2f3b52', owl: '#9c6b4a', chick: '#ffd84d', parrot: '#3cb371', pig: '#ffb3c1', koala: '#9aa3ad', lion: '#f4b860' }
const BELLY: Partial<Record<RoamSpecies, string>> = { penguin: '#f4f1ec', panda: '#2b2b33', shark: '#e8f0f7', owl: '#e7d3b8', fox: '#fbf3e4', cat: '#fbf3e4', dog: '#f3e6d2', bunny: '#ffffff', frog: '#d7f2b8', mouse: '#efe9e4', chick: '#fff1a8', pig: '#ffd1da', lion: '#f9d9a0', koala: '#dfe3e7', bear: '#b98a63', parrot: '#7fe0a6' }
const LEG: Partial<Record<RoamSpecies, string>> = { panda: '#2b2b33', penguin: '#ffa62b', chick: '#ffa62b', owl: '#c89a62', parrot: '#ffa62b', shark: '#6d8fb5' }
const BIPED = new Set<RoamSpecies>(['penguin', 'owl', 'chick', 'parrot', 'shark'])
type Tail = 'long' | 'short' | 'bushy' | 'pom' | 'thin' | 'curl' | 'tuft' | 'feather' | 'none'
const TAIL: Record<RoamSpecies, Tail> = { cat: 'long', dog: 'short', bear: 'pom', bunny: 'pom', fox: 'bushy', panda: 'pom', frog: 'none', mouse: 'thin', shark: 'none', penguin: 'none', owl: 'none', chick: 'none', parrot: 'feather', pig: 'curl', koala: 'none', lion: 'tuft' }
type St = 'walk' | 'idle' | 'sit' | 'sleep' | 'fly' | 'scratch' | 'roll' | 'zoom' | 'eat' | 'spin' | 'roar'
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
  shark: { move: 'waddle', speed: [26, 44], pick: [['walk', 3], ['idle', 2], ['roll', 3], ['sit', 1]], says: ['🌊', 'dun dun…', '🐟'], snd: 'bloop' },
  penguin: { move: 'waddle', speed: [30, 50], pick: [['walk', 4], ['zoom', 3], ['idle', 2], ['sit', 1]], says: ['🐟', '❄️', '♪'], snd: 'peep' },
  owl: { move: 'walk', speed: [20, 36], pick: [['idle', 3], ['fly', 4], ['sleep', 3], ['sit', 2], ['walk', 1]], says: ['hoo', '🌙', '👀'], snd: 'hoot' },
  chick: { move: 'walk', speed: [50, 84], pick: [['walk', 4], ['fly', 3], ['idle', 2], ['eat', 2]], says: ['peep!', '🌾', '♪'], snd: 'peep', food: '🌾' },
  parrot: { move: 'walk', speed: [30, 52], pick: [['fly', 5], ['walk', 2], ['idle', 2], ['sit', 1]], says: ['hello!', 'polly!', '🥜', '♪'], snd: 'tweet' },
  pig: { move: 'walk', speed: [40, 62], pick: [['walk', 2], ['zoom', 4], ['roll', 4], ['idle', 1], ['sit', 1], ['sleep', 1]], says: ['oink!', 'snort!', 'hehe', '🐷'], snd: 'oink' },
  koala: { move: 'walk', speed: [10, 20], pick: [['sleep', 8], ['eat', 3], ['sit', 2], ['walk', 1]], says: ['zzz', '🌿', '…'], snd: 'snore', food: '🌿' },
  lion: { move: 'walk', speed: [30, 46], pick: [['walk', 3], ['roar', 3], ['sit', 3], ['sleep', 2], ['idle', 2]], says: ['ROAR', '👑', '…'], snd: 'roar' },
}
const WINGED = new Set<RoamSpecies>(['owl', 'chick', 'parrot'])

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
.lvr svg.lvr-body{display:block;overflow:visible}
.lvr-head{position:absolute;pointer-events:auto;cursor:grab;touch-action:none;line-height:0;transition:transform .2s}
.lvr-head:active{cursor:grabbing}
.lvr-leg{transform-box:fill-box;transform-origin:50% 0}
.lvr[data-s=walk] .lvr-leg{animation:lvr-l .4s ease-in-out infinite alternate}
.lvr[data-s=walk] .lvr-leg.b{animation-delay:.2s}
.lvr[data-s=walk] .lvr-bob{animation:lvr-b .4s ease-in-out infinite}
.lvr-tail{transform-box:fill-box;transform-origin:10% 80%;animation:lvr-t 1.6s ease-in-out infinite alternate}
.lvr[data-s=walk] .lvr-tail{animation-duration:.5s}
.lvr[data-s=sit] .lvr-bodywrap{transform:translateY(8%) rotate(-12deg);transform-origin:20% 100%}
.lvr[data-s=sleep] .lvr-bob{transform:translateY(14%) scale(1.04,.88)}
.lvr[data-m=hop][data-s=walk] .lvr-leg{animation:none}
.lvr[data-s=zoom] .lvr-leg{animation:lvr-l .2s ease-in-out infinite alternate}.lvr[data-s=zoom] .lvr-leg.b{animation-delay:.1s}
.lvr[data-s=zoom] .lvr-bodywrap{transform:rotate(7deg)}.lvr[data-s=zoom] .lvr-tail{animation-duration:.25s}
.lvr[data-s=scratch] .lvr-bodywrap,.lvr[data-s=eat] .lvr-bodywrap,.lvr[data-s=roar] .lvr-bodywrap{transform:translateY(8%) rotate(-12deg);transform-origin:20% 100%}
.lvr[data-s=scratch] .lvr-leg.bk{animation:lvr-sc .13s ease-in-out infinite alternate;transform-origin:50% 10%}
.lvr[data-s=scratch] .lvr-head{animation:lvr-hw .26s ease-in-out infinite alternate}
.lvr[data-s=eat] .lvr-head{animation:lvr-eat .3s ease-in-out infinite alternate}
.lvr[data-s=roar] .lvr-head{transform:scale(1.18) translateY(-6px) rotate(-8deg)}
.lvr[data-s=roll] .lvr-bodywrap{animation:lvr-roll .7s linear infinite;transform-origin:50% 62%}
.lvr[data-s=spin] .lvr-tail{animation-duration:.18s}
.lvr[data-s=fly] .lvr-bodywrap{transform:rotate(-8deg)}.lvr[data-s=fly] .lvr-leg{transform:rotate(55deg)}
.lvr-wing{transform-box:fill-box;transform-origin:15% 85%;transform:rotate(8deg)}
.lvr[data-s=fly] .lvr-wing{animation:lvr-w .16s ease-in-out infinite alternate}
.lvr[data-s=fly] .lvr-bob{animation:lvr-b .32s ease-in-out infinite}
.lvr[data-s=sleep] .lvr-leg{display:none}
.lvr-bob{transition:transform .35s}
.lvr-bubble{position:absolute;left:50%;bottom:100%;transform:translateX(-50%);margin-bottom:4px;transition:left .15s;padding:2px 8px;border-radius:12px;background:#fff;color:#1f1a2e;font:700 13px/1.3 system-ui,sans-serif;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.18);animation:lvr-p .35s cubic-bezier(.3,1.4,.5,1) both}
.lvr-bubble:empty{display:none}
.lvr-z{position:absolute;font:700 14px system-ui;color:#7f5af0;animation:lvr-z 2.2s ease-in infinite;opacity:0}
@keyframes lvr-l{from{transform:rotate(28deg)}to{transform:rotate(-28deg)}}
@keyframes lvr-b{50%{transform:translateY(-3px)}}
@keyframes lvr-sc{from{transform:rotate(-70deg)}to{transform:rotate(-28deg)}}@keyframes lvr-hw{from{transform:rotate(-7deg)}to{transform:rotate(7deg)}}@keyframes lvr-eat{from{transform:translateY(0)}to{transform:translateY(5px) rotate(5deg)}}@keyframes lvr-roll{to{transform:rotate(360deg)}}@keyframes lvr-w{from{transform:rotate(-70deg)}to{transform:rotate(35deg)}}
@keyframes lvr-t{from{transform:rotate(-14deg)}to{transform:rotate(18deg)}}
@keyframes lvr-p{from{transform:translateX(-50%) scale(.4);opacity:0}}
@keyframes lvr-z{0%{transform:translate(0,0) scale(.6);opacity:0}25%{opacity:1}100%{transform:translate(12px,-26px) scale(1.1);opacity:0}}
@media (prefers-reduced-motion:reduce){.lvr *{animation:none!important}}`

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const pick = <T>(l: readonly T[]): T => l[Math.floor(Math.random() * l.length)]!

function bodySvg(sp: RoamSpecies, size: number): string {
  const W = size * 1.3, H = size * 0.85
  const fur = FUR[sp], belly = BELLY[sp] ?? fur, leg = LEG[sp] ?? shade(fur, -0.22), dark = shade(fur, -0.28)
  const biped = BIPED.has(sp)
  const L = (x: number, cls: string) => `<g class="lvr-leg ${cls}"><rect x="${x - 4.5}" y="38" width="9" height="19" rx="4.5" fill="${leg}"/><ellipse cx="${x + 2}" cy="57" rx="7.5" ry="3.6" fill="${shade(leg, -0.18)}"/></g>`
  const legs = biped ? L(46, 'a') + L(66, 'b') : L(28, 'b bk') + L(42, 'a') + L(66, 'b') + L(80, 'a')
  const t = TAIL[sp]
  const tail = t === 'none' ? '' : `<g class="lvr-tail">${{
    long: `<path d="M20 30 C4 28 2 12 12 6" stroke="${fur}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
    short: `<path d="M22 28 C12 24 10 16 14 12" stroke="${fur}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
    bushy: `<path d="M22 32 C2 36 0 14 14 8 C14 18 22 22 24 26Z" fill="${fur}"/><path d="M4 18 C6 12 10 10 14 8 C12 12 8 16 6 22Z" fill="${belly}"/>`,
    pom: `<circle cx="16" cy="28" r="7" fill="${belly === fur ? shade(fur, 0.15) : belly}"/>`,
    thin: `<path d="M22 34 C8 38 4 26 8 20" stroke="${shade(fur, -0.15)}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
    curl: `<path d="M22 28 c-8 -2 -8 -10 -2 -10 c5 0 4 6 -1 5" stroke="${dark}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    tuft: `<path d="M22 30 C10 32 6 22 10 16" stroke="${shade(fur, -0.1)}" stroke-width="3.2" fill="none" stroke-linecap="round"/><circle cx="9" cy="14" r="5" fill="${shade(fur, -0.3)}"/>`,
    feather: `<path d="M22 34 C6 44 -2 36 -2 26 C8 32 14 30 24 28Z" fill="${shade(fur, -0.1)}"/><path d="M20 36 C8 50 2 46 0 40 C10 42 14 38 22 32Z" fill="#e63946"/>`,
  }[t]}</g>`
  const wing = WINGED.has(sp) ? `<g class="lvr-wing"><path d="M40 26 C28 6 6 8 0 20 C12 16 22 22 34 34Z" fill="${shade(fur, -0.12)}"/><path d="M40 26 C32 14 18 12 8 16 C20 16 28 22 36 30Z" fill="${shade(fur, 0.12)}" opacity=".7"/></g>` : ''
  const body = `<ellipse cx="46" cy="30" rx="${biped ? 22 : 34}" ry="${biped ? 24 : 20}" fill="${fur}"/><ellipse cx="46" cy="${biped ? 34 : 36}" rx="${biped ? 14 : 22}" ry="${biped ? 17 : 11}" fill="${belly}" opacity="${belly === fur ? 0 : 0.95}"/>`
  return `<svg class="lvr-body" width="${W}" height="${H}" viewBox="-4 0 104 62" aria-hidden="true">${tail}${legs}${body}${wing}</svg>`
}

/** Lighten (amount > 0) or darken (< 0) a #rrggbb colour. */
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt))))
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('')
}

let styleEl: HTMLStyleElement | null = null
const ensureCss = () => {
  if (styleEl || typeof document === 'undefined') return
  styleEl = document.createElement('style'); styleEl.textContent = css; styleEl.setAttribute('data-livatar-roam', ''); document.head.append(styleEl)
}

interface Agent {
  api: Roamer
  el: HTMLElement
  flip: HTMLElement
  bubble: HTMLElement
  head: AliveHandle | null
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
    bob.innerHTML = bodySvg(species_, size)
    const head = document.createElement('div'); head.className = 'lvr-head'
    head.style.cssText += `;left:${size * 0.42}px;top:${-size * 0.52}px;width:${size}px;height:${size}px`
    bob.append(head); wrap.append(bob); flip.append(wrap)
    const bubble = document.createElement('div'); bubble.className = 'lvr-bubble'
    bubble.style.marginBottom = size * 0.42 + 'px'
    el.style.bottom = '0px'; el.style.transform = 'translate3d(0,-120vh,0)'
    el.append(flip, bubble); host.append(el)
    const seed = species_ + '-' + Math.random().toString(36).slice(2, 7)
    const handle = mount(head, animal, { seed, options: { species: species_, fur: FUR[species_], pattern: 'none', outline: true }, size, background: false, mood: 'happy', alive: { intensity: 1 } })
    const now = performance.now()
    const a: Agent = {
      api: null as unknown as Roamer, el, flip, bubble, head: handle, species: species_, persona, w: W,
      x: rand(0, Math.max(0, vw() - W)), y: vh() + 80, vy: 0, dir: Math.random() < 0.5 ? 1 : -1,
      state: 'fall', until: 0, tx: 0, ty: 0, legs: 0, speed: rand(...persona.speed), nextSay: now + rand(4000, 12000), nextSnore: 0, nextShove: 0, hopAt: 0, flipAt: 0,
    }
    a.api = {
      species: species_, el,
      say: (text, ms = 1800) => { bubble.textContent = text; setTimeout(() => { if (bubble.textContent === text) bubble.textContent = '' }, ms) },
      jump: () => { if (a.state !== 'held' && a.y <= 1) { a.vy = 380; a.state = 'jump' } },
      remove: () => { const i = agents.indexOf(a); if (i >= 0) agents.splice(i, 1); handle.destroy?.(); el.remove(); if (!agents.length) stop() },
    }
    // pat and pick-up
    let moved = 0, sx = 0, sy = 0
    head.addEventListener('pointerdown', (e) => {
      head.setPointerCapture(e.pointerId); moved = 0; sx = e.clientX; sy = e.clientY
      a.held = { dx: e.clientX - a.x }; a.state = 'held'; el.dataset.s = 'held'
    })
    head.addEventListener('pointermove', (e) => {
      if (a.state !== 'held') return
      moved = Math.max(moved, Math.hypot(e.clientX - sx, e.clientY - sy))
      a.x = e.clientX - (a.held?.dx ?? 0); a.y = Math.max(0, vh() - ground - e.clientY - size * 0.6); a.vy = 0
    })
    const drop = (e: PointerEvent) => {
      if (a.state !== 'held') return
      head.releasePointerCapture?.(e.pointerId)
      if (moved < 6) { a.state = 'idle'; a.until = performance.now() + 1400; handle.emote('love', 1200); a.api.say('❤️', 1200); a.api.jump(); hear(a); opts.onPat?.(a.api) }
      else { a.state = 'fall'; handle.emote('surprised', 900) }
    }
    head.addEventListener('pointerup', drop); head.addEventListener('pointercancel', drop)
    agents.push(a)
    if (!raf) start()
    return a.api
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
          if (b !== a && b.state !== 'held' && b.y < 4 && Math.abs(b.x - a.x) < a.w * 0.7) { a.nextShove = t + 5000; b.x += a.dir * 40; b.vy = 300; b.state = 'fall'; b.head?.emote('surprised', 1200); b.api.say('hey!'); a.api.say('hehe'); hear(a); break }
        }
      } else if (st === 'fly') {
        const dx = a.tx - a.x, dy = a.ty - a.y, dist = Math.hypot(dx, dy), step = 120 * dt
        a.dir = dx >= 0 ? 1 : -1
        if (dist <= step + 2) { a.x = a.tx; a.y = a.ty; if (a.legs-- > 0) { a.tx = rand(0, Math.max(0, vw() - a.w)); a.ty = lane(); hear(a) } else { a.state = 'fall'; a.vy = 0; a.head?.emote('happy', 900) } }
        else { a.x += (dx / dist) * step; a.y += (dy / dist) * step + Math.sin(t / 140) * 0.6 }
      } else if (st !== 'held') {
        if (st === 'spin' && t > a.flipAt) { a.dir = a.dir === 1 ? -1 : 1; a.flipAt = t + 130 }
        if (st === 'sleep' && t > a.nextSnore) { a.nextSnore = t + rand(3500, 6500); if (a.species === 'koala' || Math.random() < 0.35) hear(a, 'snore') }
        if (t > a.until) decide(a, t)
      }
      // greet a neighbour
      if (a.state === 'idle' || a.state === 'sit') for (const b of agents) if (b !== a && Math.abs(b.x - a.x) < a.w * 0.9 && b.state !== 'sleep' && b.state !== 'held' && Math.random() < 0.004) { a.dir = b.x >= a.x ? 1 : -1; a.api.say('👋'); a.head?.emote('happy', 900) }
      if (opts.speak !== false && t > a.nextSay && a.state !== 'held' && a.state !== 'fall') {
        a.nextSay = t + rand(8000, 20000)
        a.api.say(a.state === 'sleep' ? '💤' : pick(a.persona.says))
        if (a.state !== 'sleep' && Math.random() < 0.6) hear(a)
      }
      a.x = Math.max(-a.w * 0.2, Math.min(vw() - a.w * 0.8, a.x))
      const s = a.state === 'fall' || a.state === 'jump' ? 'idle' : a.state
      if (a.el.dataset.s !== s) a.el.dataset.s = s
      a.flip.style.transform = `scaleX(${a.dir})`
      const headX = a.x + (a.dir === 1 ? size * 0.92 : a.w - size * 0.92)
      a.bubble.style.left = (a.dir === 1 ? size * 0.92 : a.w - size * 0.92) + 'px'
      // near the pointer but not on its head: step aside visually so the page underneath stays usable
      const bottomY = vh() - ground - a.y, near = Math.abs(px - (a.x + a.w / 2)) < a.w * 0.9 && py > bottomY - size * 1.5 && py < bottomY + 8
      const onHead = Math.hypot(px - headX, py - (bottomY - size * 0.95)) < size * 0.5
      const fade = near && !onHead && a.state !== 'held' ? '0.35' : ''
      if (a.el.style.opacity !== fade) a.el.style.opacity = fade
      a.el.style.transform = `translate3d(${Math.round(a.x)}px, ${-Math.round(a.y + ground)}px, 0)`
      if (a.state === 'sleep' && !a.el.querySelector('.lvr-z')) { const z = document.createElement('span'); z.className = 'lvr-z'; z.textContent = 'z'; z.style.left = a.w * 0.8 + 'px'; z.style.top = -size * 0.62 + 'px'; a.el.append(z) }
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
