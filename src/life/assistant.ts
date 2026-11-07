import type { Mood } from '../core'
import type { AliveHandle } from '../alive'
import { feel } from './feel'

export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'done' | 'error'

export interface Assistant {
  readonly state: AssistantState
  /** Switch state by hand. */
  set(state: AssistantState): void
  /** User is talking / typing. */
  listen(): void
  /** Waiting on the model. Looks up and away, a little puzzled. */
  think(): void
  /**
   * Feed streamed tokens: each chunk moves the mouth. Pass an (async) iterable
   * to consume it all, or call with single chunks as they arrive.
   * Resolves to the full text when an iterable is passed.
   */
  stream(tokens: string | Iterable<string> | AsyncIterable<string>): Promise<string>
  /** Lip-sync to audio (an <audio>/<video> element or a MediaStream). Returns a stop function. */
  speak(source: HTMLMediaElement | MediaStream): () => void
  /** Finished: shows a mood guessed from the reply (or the one you pass). */
  done(mood?: Mood): void
  error(): void
  destroy(): void
}

export interface AssistantOptions {
  /** Guess the final mood from the reply text. Default true. */
  sentiment?: boolean
  /** ms of mouth movement per streamed chunk. Default 160. */
  perToken?: number
  /** Called whenever the state changes. */
  onState?: (state: AssistantState) => void
}

/**
 * Turn an avatar into the face of an AI assistant: idle → listening →
 * thinking → speaking → done/error, with token-driven talking and audio lip-sync.
 *
 *   const ai = assistant(mount(el, bot, { seed: 'helper' }))
 *   ai.think()
 *   const reply = await ai.stream(llmTokens)   // talks while tokens arrive
 */
export function assistant(handle: AliveHandle, opts: AssistantOptions = {}): Assistant {
  let state: AssistantState = 'idle'
  let text = ''
  let thinkTimer: ReturnType<typeof setInterval> | undefined
  const per = opts.perToken ?? 160
  const stops = new Set<() => void>()

  const set = (s: AssistantState) => {
    clearInterval(thinkTimer)
    state = s
    if (s === 'idle') handle.emote('neutral')
    if (s === 'listening') {
      handle.emote('neutral')
      handle.look(0, 0, 4000)
    }
    if (s === 'thinking') {
      handle.emote('confused')
      // glance around while waiting, like someone thinking
      let i = 0
      const glance = () => handle.look(i++ % 2 ? -0.5 : 0.5, -0.7, 1400)
      glance()
      thinkTimer = setInterval(glance, 1300)
    }
    if (s === 'speaking') handle.emote('neutral')
    if (s === 'error') {
      handle.emote('sad', 2500)
      handle.shake()
    }
    opts.onState?.(s)
  }

  const chunk = (t: string) => {
    if (state !== 'speaking') {
      text = ''
      set('speaking')
    }
    text += t
    handle.talk(Math.min(900, per + t.length * 25))
  }

  return {
    get state() {
      return state
    },
    set,
    listen: () => set('listening'),
    think: () => set('thinking'),
    async stream(tokens) {
      if (typeof tokens === 'string') {
        chunk(tokens)
        return text
      }
      text = ''
      try {
        for await (const t of tokens as AsyncIterable<string>) chunk(t)
      } catch (e) {
        // a broken stream (network, abort) shows the error face instead of talking forever
        this.error()
        throw e
      }
      this.done()
      return text
    },
    speak(source) {
      const AC = typeof window !== 'undefined' && ((window as any).AudioContext || (window as any).webkitAudioContext)
      if (!AC) return () => {}
      const ctx: AudioContext = new AC()
      const node = source instanceof MediaStream ? ctx.createMediaStreamSource(source) : ctx.createMediaElementSource(source)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      node.connect(analyser)
      if (!(source instanceof MediaStream)) analyser.connect(ctx.destination)
      const buf = new Uint8Array(analyser.fftSize)
      set('speaking')
      let raf = 0
      const loop = () => {
        analyser.getByteTimeDomainData(buf)
        let sum = 0
        for (const v of buf) sum += ((v - 128) / 128) ** 2
        if (Math.sqrt(sum / buf.length) > 0.04) handle.talk(120)
        raf = requestAnimationFrame(loop)
      }
      loop()
      const stop = () => {
        cancelAnimationFrame(raf)
        node.disconnect()
        ctx.close()
        stops.delete(stop)
      }
      stops.add(stop)
      return stop
    },
    done(mood) {
      set('done')
      const m = mood ?? (opts.sentiment === false ? 'happy' : feel(text))
      handle.emote(m === 'neutral' ? 'happy' : m, 2200)
      if (m !== 'sad' && m !== 'angry') handle.nod()
    },
    error: () => set('error'),
    destroy() {
      clearInterval(thinkTimer)
      stops.forEach((s) => s())
    },
  }
}
