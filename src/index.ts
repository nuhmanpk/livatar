import { createAvatar, type AvatarOptions, type AvatarStyle } from './core'
import { alive, type AliveHandle, type AliveOptions } from './alive'
import { render, resolve, type LivatarConfig } from './code'
import { blob } from './styles/blob'
import { buddy } from './styles/buddy'
import { bot } from './styles/bot'
import { pixel } from './styles/pixel'
import { animal } from './styles/animal'
import { monster } from './styles/monster'
import { ghost } from './styles/ghost'
import { emoji } from './styles/emoji'
import { initials } from './styles/initials'
import { food } from './styles/food'
import { plant } from './styles/plant'
import { dino } from './styles/dino'
import { alien } from './styles/alien'
import { planet } from './styles/planet'
import { clay } from './styles/clay'
import { memoji } from './styles/memoji'
import { anime } from './styles/anime'
import { notion } from './styles/notion'
import { chibi } from './styles/chibi'
import { flat } from './styles/flat'
import { lowpoly } from './styles/lowpoly'
import { sketch } from './styles/sketch'
import { retro } from './styles/retro'
import { toon } from './styles/toon'
import { ui } from './styles/ui'
import { device } from './styles/device'
import { fruit } from './styles/fruit'
import { drink } from './styles/drink'
import { vehicle } from './styles/vehicle'
import { tech } from './styles/tech'
import { money } from './styles/money'
import { home } from './styles/home'
import { office } from './styles/office'
import { weather } from './styles/weather'
import { sport } from './styles/sport'
import { music } from './styles/music'
import { sea } from './styles/sea'
import { bug } from './styles/bug'
import { magic } from './styles/magic'
import { party } from './styles/party'
import { season } from './styles/season'
import { tool } from './styles/tool'
import { dev } from './styles/dev'
import { human } from './styles/human'
import { ai } from './styles/ai'

export * from './core'
export * from './alive'
export * from './code'
export * from './form'
export * from './export'
export { doodle, type DoodleOptions } from './doodle'
export { faceEyes, faceBrows, faceMouth, faceExtras, heart, type FaceSpec } from './face'
export { palettes, type PaletteName } from './palettes'
export { styles } from './registry'
export { blob, buddy, bot, pixel, animal, monster, ghost, emoji, initials, food, plant, dino, alien, planet, clay, memoji, ui, device, fruit, drink, vehicle, tech, money, home, office, dev, human, ai, weather, sport, music, sea, bug, magic, party, season, tool, anime, notion, chibi, flat, lowpoly, sketch, retro, toon }
export { describe } from './describe'
export type { BlobOptions } from './styles/blob'
export type { BuddyOptions } from './styles/buddy'
export type { BotOptions } from './styles/bot'
export type { PixelOptions } from './styles/pixel'
export type { AnimalOptions } from './styles/animal'
export type { MonsterOptions } from './styles/monster'
export type { GhostOptions } from './styles/ghost'
export type { EmojiOptions } from './styles/emoji'
export type { InitialsOptions } from './styles/initials'
export type { FoodOptions } from './styles/food'
export type { PlantOptions } from './styles/plant'
export type { DinoOptions } from './styles/dino'
export type { AlienOptions } from './styles/alien'
export type { PlanetOptions } from './styles/planet'
export type { ClayOptions } from './styles/clay'
export type { MemojiOptions } from './styles/memoji'
export type { AnimeOptions } from './styles/anime'
export type { NotionOptions } from './styles/notion'
export type { ChibiOptions } from './styles/chibi'
export type { FlatOptions } from './styles/flat'
export type { LowpolyOptions } from './styles/lowpoly'
export type { SketchOptions } from './styles/sketch'
export type { RetroOptions } from './styles/retro'
export type { ToonOptions } from './styles/toon'
export type { UiOptions } from './styles/ui'
export type { DeviceOptions } from './styles/device'
export type { FruitOptions } from './styles/fruit'
export type { DrinkOptions } from './styles/drink'
export type { VehicleOptions } from './styles/vehicle'
export type { TechOptions } from './styles/tech'
export type { MoneyOptions } from './styles/money'
export type { HomeOptions } from './styles/home'
export type { OfficeOptions } from './styles/office'
export type { WeatherOptions } from './styles/weather'
export type { SportOptions } from './styles/sport'
export type { MusicOptions } from './styles/music'
export type { SeaOptions } from './styles/sea'
export type { BugOptions } from './styles/bug'
export type { MagicOptions } from './styles/magic'
export type { PartyOptions } from './styles/party'
export type { SeasonOptions } from './styles/season'
export type { ToolOptions } from './styles/tool'
export type { DevOptions } from './styles/dev'
export type { HumanOptions } from './styles/human'
export type { AiOptions } from './styles/ai'

let mounts = 0
const uniqueIds = (svg: string, tag: string) => svg.replace(/\b(lv[0-9a-z]+)(?=-)/g, `$1${tag}`)

export interface MountOptions<O> extends AvatarOptions<O> {
  /** Animation options, or `false` for a static avatar. */
  alive?: AliveOptions | false
}

/**
 * Render `style` into `el` and bring it to life. Only the style you pass ends
 * up in your bundle. For codes, use `mountCode()`.
 */
export function mount<O>(el: Element, style: AvatarStyle<O>, opts: MountOptions<O> = {}): AliveHandle {
  const { alive: aliveOpts, ...options } = opts
  // ids are deterministic per avatar; the same avatar twice on one page would share clipPath/gradient ids,
  // and hiding one copy breaks the other. Give every mounted instance its own suffix.
  const tag = 'm' + (++mounts).toString(36)
  const draw = (o: AvatarOptions<O>) => uniqueIds(createAvatar(style, o), tag)
  el.innerHTML = draw(options)
  if (aliveOpts === false) return alive(null)
  return alive(el, { rerender: (mood) => draw({ ...options, mood }), ...aliveOpts })
}

/**
 * Like `mount()`, but from a livatar code (`'lvAQE…'`), a style name
 * (`'buddy'`), or a config (`{ style: 'buddy', seed: 'ada' }`).
 * This pulls every built-in style into your bundle.
 */
export function mountCode(el: Element, code: string | LivatarConfig, opts: MountOptions<any> = {}): AliveHandle {
  const r = resolve(code)
  return mount(el, r.style, { ...r.options, ...opts })
}

/** Render to a `data:` URI — for <img src>, CSS backgrounds, emails, OG images (static). */
export function toDataUri<O>(style: AvatarStyle<O>, opts: AvatarOptions<O> = {}): string {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(createAvatar(style, opts))
}
export { checkUsername, RESERVED_NAMES, type UsernameResult, type UsernameOptions, type UsernameReason } from './username'

/**
 * Show a user's photo, and fall back to their livatar when there is no photo or it fails to load
 * (404, blocked, offline). Same seed, same face, so the fallback is stable across sessions.
 *
 *   photoFallback(img, { style: 'buddy', seed: user.id })            // <img src={user.photoUrl}>
 *   photoFallback(document.querySelectorAll('img[data-seed]'))        // seed from data-seed, style from data-style
 *
 * Returns a cleanup function.
 */
export function photoFallback(target: HTMLImageElement | Iterable<HTMLImageElement>, cfg: Partial<LivatarConfig> = {}): () => void {
  const imgs = (typeof (target as HTMLImageElement).tagName === 'string' ? [target as HTMLImageElement] : [...(target as Iterable<HTMLImageElement>)])
  const offs: (() => void)[] = []
  for (const img of imgs) {
    const swap = () => {
      if (img.dataset.lvFallback) return
      img.dataset.lvFallback = '1'
      const seed = cfg.seed ?? img.dataset.seed ?? img.alt ?? 'user'
      const style = cfg.style ?? img.dataset.style ?? 'buddy'
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(render({ ...cfg, style, seed } as LivatarConfig))
    }
    if (!img.getAttribute('src') || (img.complete && img.naturalWidth === 0)) swap()
    img.addEventListener('error', swap)
    offs.push(() => img.removeEventListener('error', swap))
  }
  return () => offs.forEach((f) => f())
}
