/* ------------------------------------------------------------------ *
 *  Vue 3 / Nuxt components. SSR renders the static SVG; the animation
 *  starts on mount in the browser.
 *
 *    <Livatar :variant="buddy" seed="ada" mood="happy" :size="64" />
 *    <LivatarCode code="lvAQQ…" :size="64" ref="av" />   av.value.handle.emote('love')
 * ------------------------------------------------------------------ */
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, shallowRef, watch, type PropType } from 'vue'
import { createAvatar, type AvatarOptions, type AvatarStyle, type Mood } from './core'
import { alive, type AliveHandle, type AliveOptions } from './alive'
import { resolve, type LivatarConfig } from './code'
import { blob } from './styles/blob'

const common = {
  seed: [String, Number] as PropType<string | number>,
  mood: String as PropType<Mood>,
  size: [Number, String] as PropType<number | string>,
  shape: String as PropType<'circle' | 'rounded' | 'square'>,
  radius: Number,
  scale: Number,
  rotate: Number,
  colors: Array as PropType<string[]>,
  background: { type: [Boolean, String] as PropType<boolean | string>, default: undefined },
  gradient: { type: Boolean, default: undefined },
  flip: { type: Boolean, default: undefined },
  border: { type: [Boolean, String] as PropType<boolean | string>, default: undefined },
  borderWidth: Number,
  title: String,
  options: Object as PropType<Record<string, unknown>>,
  alive: { type: [Object, Boolean] as PropType<AliveOptions | false>, default: undefined },
}

function make(name: string, pick: (props: any) => { style: AvatarStyle<any>; options: AvatarOptions<any> }, extra: Record<string, unknown>) {
  return defineComponent({
    name,
    props: { ...common, ...extra } as typeof common,
    setup(props, { expose }) {
      const el = ref<HTMLElement | null>(null)
      const handle = shallowRef<AliveHandle | null>(null)
      const resolved = computed(() => {
        const r = pick(props)
        const clean = Object.fromEntries(Object.entries(r.options).filter(([k, v]) => v !== undefined && k !== 'alive' && k !== 'size'))
        return { style: r.style, options: clean as AvatarOptions<any> }
      })
      const html = computed(() => createAvatar(resolved.value.style, resolved.value.options))
      const start = () => {
        handle.value?.destroy()
        handle.value = null
        if (!el.value || props.alive === false) return
        const { style, options } = resolved.value
        handle.value = alive(el.value, { rerender: (mood) => createAvatar(style, { ...options, mood }), ...props.alive })
      }
      onMounted(start)
      watch(html, () => queueMicrotask(start), { flush: 'post' })
      onBeforeUnmount(() => handle.value?.destroy())
      expose({ handle })
      return () =>
        h('span', {
          ref: el,
          innerHTML: html.value,
          style: {
            display: 'inline-block',
            lineHeight: 0,
            width: props.size == null ? undefined : typeof props.size === 'number' ? props.size + 'px' : props.size,
          },
        })
    },
  })
}

/** Lean: pass the style object, e.g. `:variant="buddy"`. */
export const Livatar = make(
  'Livatar',
  ({ variant, ...o }) => ({ style: variant ?? blob, options: o }),
  { variant: Object as PropType<AvatarStyle<any>> },
)

/** Batteries included: `code="lv…"` or `variant="buddy"`. Pulls in every style. */
export const LivatarCode = make(
  'LivatarCode',
  ({ code, variant, ...o }) => {
    if (variant && typeof variant === 'object') return { style: variant, options: o }
    const r = resolve((code as string | LivatarConfig) ?? variant ?? 'blob')
    return { style: r.style, options: { ...r.options, ...Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) } }
  },
  { code: [String, Object] as PropType<string | LivatarConfig>, variant: [Object, String] as PropType<AvatarStyle<any> | string> },
)

/** `app.use(LivatarPlugin)` registers <Livatar> and <LivatarCode> globally. */
export const LivatarPlugin = {
  install(app: { component(name: string, c: unknown): unknown }) {
    app.component('Livatar', Livatar)
    app.component('LivatarCode', LivatarCode)
  },
}
