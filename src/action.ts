/* ------------------------------------------------------------------ *
 *  A framework-agnostic "action": (node, params) → { update, destroy }.
 *  Works as-is with Svelte (`use:livatar`), and wraps easily for Solid,
 *  Alpine, Stimulus, or plain JS.
 * ------------------------------------------------------------------ */
import { createAvatar, type AvatarOptions, type AvatarStyle } from './core'
import { alive, type AliveHandle, type AliveOptions } from './alive'
import { resolve, type LivatarConfig } from './code'
import { blob } from './styles/blob'

export interface ActionParams extends AvatarOptions<any> {
  /** Style object (lean) — e.g. `buddy`. */
  variant?: AvatarStyle<any>
  alive?: AliveOptions | false
  /** Called with the animation handle whenever it is (re)created. */
  onHandle?: (h: AliveHandle | null) => void
}

export interface CodeActionParams extends Omit<ActionParams, 'variant'> {
  /** A livatar code, a style name ('buddy'), or a config. */
  code?: string | LivatarConfig
  variant?: AvatarStyle<any> | string
}

function bind(node: Element, get: (p: any) => { style: AvatarStyle<any>; options: AvatarOptions<any> }, params: any) {
  let h: AliveHandle | null = null
  let key = ''
  const run = (p: any) => {
    const { alive: a, onHandle, ...rest } = p ?? {}
    const k = JSON.stringify(rest, (_k, v) => (v && typeof v === 'object' && 'render' in v ? v.name : v)) + JSON.stringify(a)
    if (k === key) return
    key = k
    const { style, options } = get(rest)
    node.innerHTML = createAvatar(style, options)
    h?.destroy()
    h = a === false ? null : alive(node, { rerender: (mood) => createAvatar(style, { ...options, mood }), ...a })
    onHandle?.(h)
  }
  run(params)
  return {
    update: run,
    destroy() {
      h?.destroy()
      h = null
    },
    get handle() {
      return h
    },
  }
}

/** Lean action: pass `variant` as a style object. `<div use:livatar={{ variant: buddy, seed }} />` */
export function livatar(node: Element, params: ActionParams = {}) {
  return bind(node, ({ variant, ...options }) => ({ style: variant ?? blob, options }), params)
}

/** Batteries-included action: codes and style names. Pulls in every style. */
export function livatarCode(node: Element, params: CodeActionParams = {}) {
  return bind(
    node,
    ({ code, variant, ...options }) => {
      if (variant && typeof variant === 'object') return { style: variant, options }
      const r = resolve(code ?? variant ?? 'blob')
      return { style: r.style, options: { ...r.options, ...options } }
    },
    params,
  )
}
