'use client'
/* ------------------------------------------------------------------ *
 *  React / Next.js / Preact (via preact/compat) / Remix components.
 *  Server rendering outputs the static SVG; animation starts in an effect.
 * ------------------------------------------------------------------ */
import { createElement, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, type CSSProperties, type ForwardedRef, type RefObject } from 'react'
import { createAvatar, type AvatarOptions, type AvatarStyle, type Mood } from './core'
import { alive, type AliveHandle, type AliveOptions } from './alive'
import { resolve, type LivatarConfig } from './code'
import { blob } from './styles/blob'

interface BaseProps extends Omit<AvatarOptions<any>, 'className'> {
  /** Animation options, or `false` for static. */
  alive?: AliveOptions | false
  className?: string
  style?: CSSProperties
}

export interface LivatarProps<O = any> extends BaseProps {
  /** Style definition, e.g. `buddy` from 'livatar'. Default: blob. */
  variant?: AvatarStyle<O>
}

export interface LivatarCodeProps extends BaseProps {
  /** A livatar code (`'lv…'`) or config. Other props override it. */
  code?: string | LivatarConfig
  /** A style name ('buddy') or style object. */
  variant?: AvatarStyle<any> | string
}

const IDLE = { x: 0, y: 0, closed: 0, mouth: 0, shy: 0, mood: 'neutral' as Mood }

function useLivatar(
  st: AvatarStyle<any>,
  merged: AvatarOptions<any>,
  aliveOpts: AliveOptions | false | undefined,
  ref: ForwardedRef<AliveHandle | null>,
) {
  const el = useRef<HTMLSpanElement>(null)
  const handle = useRef<AliveHandle | null>(null)
  const html = useMemo(() => createAvatar(st, merged), [st, merged])
  const aliveKey = aliveOpts === false ? 'off' : JSON.stringify(aliveOpts ?? {})

  useEffect(() => {
    if (aliveOpts === false) return
    const h = alive(el.current, { rerender: (mood) => createAvatar(st, { ...merged, mood }), ...aliveOpts })
    handle.current = h
    return () => {
      h.destroy()
      handle.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, aliveKey])

  useImperativeHandle(ref, () => ({
    look: (x, y, ms) => handle.current?.look(x, y, ms),
    talk: (ms) => handle.current?.talk(ms),
    blink: () => handle.current?.blink(),
    poke: () => handle.current?.poke(),
    emote: (m, ms) => handle.current?.emote(m, ms),
    nod: () => handle.current?.nod(),
    shake: () => handle.current?.shake(),
    refresh: () => handle.current?.refresh(),
    set: (o) => handle.current?.set(o),
    get state() {
      return handle.current?.state ?? IDLE
    },
    destroy: () => handle.current?.destroy(),
  }), [])

  return { el, html }
}

const view = (el: RefObject<HTMLSpanElement | null>, html: string, size: unknown, className?: string, style?: CSSProperties) =>
  createElement('span', {
    ref: el,
    className,
    style: {
      display: 'inline-block',
      lineHeight: 0,
      width: size == null ? undefined : typeof size === 'number' ? size + 'px' : (size as string),
      ...style,
    },
    dangerouslySetInnerHTML: { __html: html },
  })

const defined = (o: object) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined))

/**
 * <Livatar variant={buddy} seed="ada" size={96} mood="happy" />
 * Pass a ref to control it: ref.current.talk(), ref.current.emote('love', 1500)…
 */
export const Livatar = forwardRef<AliveHandle | null, LivatarProps>(function Livatar(
  { variant, alive: aliveOpts, className, style, size, ...opts },
  ref,
) {
  const key = JSON.stringify(opts)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const merged = useMemo(() => defined(opts) as AvatarOptions<any>, [key])
  const { el, html } = useLivatar(variant ?? blob, merged, aliveOpts, ref)
  return view(el, html, size, className, style)
})

/**
 * <LivatarCode code="lvAQQ…" size={64} />  or  <LivatarCode variant="animal" seed="ada" />
 * Batteries included: pulls in every style.
 */
export const LivatarCode = forwardRef<AliveHandle | null, LivatarCodeProps>(function LivatarCode(
  { code, variant, alive: aliveOpts, className, style, size, ...opts },
  ref,
) {
  const key = JSON.stringify([code, typeof variant === 'object' ? variant.name : variant, opts])
  const [st, merged] = useMemo(() => {
    if (variant && typeof variant === 'object') return [variant, defined(opts)] as const
    const r = resolve(code ?? variant ?? 'blob')
    return [r.style, { ...defined(r.options), ...defined(opts) }] as const
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  const { el, html } = useLivatar(st, merged as AvatarOptions<any>, aliveOpts, ref)
  return view(el, html, size, className, style)
})
