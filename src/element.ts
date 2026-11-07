import { createAvatar, type AvatarStyle, type Mood } from './core'
import { alive, type AliveHandle } from './alive'
import { resolve, type LivatarConfig } from './code'
import { palettes, type PaletteName } from './palettes'
import { styles as builtin } from './registry'

export { styles } from './registry'

const ATTRS = [
  'code', 'seed', 'variant', 'size', 'colors', 'palette', 'shape', 'background', 'gradient', 'border', 'border-width',
  'flip', 'mood', 'options', 'label', 'intensity', 'static', 'sleep-after',
]

/**
 * Register the `<live-avatar>` custom element (or a custom tag name).
 *
 *   <live-avatar seed="ada" variant="buddy" size="96" mood="happy"></live-avatar>
 *   <live-avatar code="lvAQE…"></live-avatar>
 *
 * Attributes: code, seed, variant, size, colors (comma list), palette, shape,
 * background, gradient, border, border-width, flip, mood, options (JSON),
 * label, intensity, static, sleep-after, no-track, no-keyboard, no-blink, no-poke.
 * Explicit attributes override what the code says.
 */
export function defineElement(tag = 'live-avatar', styles: Record<string, AvatarStyle<any>> = builtin): void {
  if (typeof customElements === 'undefined' || customElements.get(tag)) return

  class LivatarElement extends HTMLElement {
    static observedAttributes = ATTRS
    private h: AliveHandle | null = null

    /** Animation handle: el.handle.talk(), el.handle.emote('happy', 1500)… */
    get handle() {
      return this.h
    }
    connectedCallback() {
      this.render()
    }
    disconnectedCallback() {
      this.h?.destroy()
      this.h = null
    }
    attributeChangedCallback() {
      if (this.isConnected) this.render()
    }
    private render() {
      const a = (k: string) => this.getAttribute(k)
      const has = (k: string) => this.hasAttribute(k)
      let cfg: LivatarConfig = { style: 'blob' }
      try {
        if (a('code')) {
          const r = resolve(a('code')!, styles)
          cfg = { ...(r.options as Omit<LivatarConfig, 'style'>), style: r.style.name }
        }
      } catch {
        /* bad code: fall back to attributes */
      }
      let options: Record<string, unknown> | undefined
      try {
        options = a('options') ? JSON.parse(a('options')!) : undefined
      } catch {
        options = undefined
      }
      const bg = a('background')
      const pal = a('palette') as PaletteName | null
      const colors = a('colors')?.split(',').map((c) => c.trim()).filter(Boolean)
      const style = styles[a('variant') || cfg.style] || styles.blob
      const opts = {
        ...cfg,
        seed: a('seed') ?? cfg.seed,
        colors: colors?.length ? colors : pal && palettes[pal] ? [...palettes[pal]] : cfg.colors,
        shape: (a('shape') as any) || cfg.shape,
        background: bg == null ? cfg.background ?? true : bg === 'none' || bg === 'false' ? false : bg,
        gradient: has('gradient') || cfg.gradient,
        border: a('border') != null ? a('border') || true : cfg.border,
        borderWidth: a('border-width') ? parseFloat(a('border-width')!) : cfg.borderWidth,
        flip: has('flip') || cfg.flip,
        mood: (a('mood') as Mood) || cfg.mood,
        options: { ...cfg.options, ...options },
        title: a('label') ?? undefined,
      }
      this.innerHTML = createAvatar(style, opts)
      const s = this.style
      if (!s.display) s.display = 'inline-block'
      s.lineHeight = '0'
      const size = a('size')
      if (size) s.width = /^\d+(\.\d+)?$/.test(size) ? size + 'px' : size
      else if (!s.width) s.width = '64px'

      this.h?.destroy()
      this.h = has('static')
        ? null
        : alive(this, {
            intensity: parseFloat(a('intensity') || '1') || 1,
            track: !has('no-track'),
            keyboard: !has('no-keyboard'),
            blink: !has('no-blink'),
            poke: !has('no-poke'),
            sleepAfter: parseFloat(a('sleep-after') || '0') || 0,
            rerender: (mood) => createAvatar(style, { ...opts, mood }),
          })
    }
  }
  customElements.define(tag, LivatarElement)
}

defineElement()
