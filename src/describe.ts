/* ------------------------------------------------------------------ *
 *  describe(): human-readable alt text for any avatar, so every <img>
 *  and screen reader gets something better than "avatar".
 * ------------------------------------------------------------------ */
import type { LivatarConfig } from './code'

const SPACED = (v: unknown) => String(v).replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
const MOOD: Record<string, string> = {
  neutral: '', happy: 'happy', sad: 'sad', angry: 'angry', surprised: 'surprised', sleepy: 'sleepy',
  love: 'love-struck', wink: 'winking', silly: 'silly', confused: 'confused',
}
const NOUN: Record<string, string> = {
  buddy: 'cartoon person', bot: 'robot', blob: 'blob creature', pixel: 'pixel critter', monster: 'monster',
  ghost: 'ghost', emoji: 'smiley', initials: 'initials avatar', food: 'food character', plant: 'potted plant',
  dino: 'dinosaur', alien: 'alien', planet: 'planet', clay: 'clay character', memoji: 'cartoon person',
  ui: 'UI icon', device: 'gadget', fruit: 'fruit', drink: 'drink', vehicle: 'vehicle', tech: 'tech gadget', money: 'money character', home: 'home object', office: 'office supply', dev: 'developer', human: 'person',
}

/**
 * describe({ style: 'animal', mood: 'happy', options: { species: 'owl' } }) → "A happy owl"
 * Pass a code via decode() first. Only options you set explicitly are mentioned.
 */
export function describe(cfg: Pick<LivatarConfig, 'style' | 'mood' | 'options'>): string {
  const o = (cfg.options ?? {}) as Record<string, unknown>
  const kind = (o.species ?? o.kind) as string | undefined
  const noun = kind ? SPACED(kind) : NOUN[cfg.style] ?? `${cfg.style} avatar`
  const mood = MOOD[cfg.mood ?? 'neutral'] ?? ''
  const extras: string[] = []
  if (typeof o.hair === 'string' && o.hair !== 'random') extras.push(o.hair === 'bald' ? 'a bald head' : `${SPACED(o.hair)} hair`)
  if (typeof o.facialHair === 'string' && !/none|random/.test(o.facialHair)) extras.push(`a ${SPACED(o.facialHair)}`)
  if (typeof o.beard === 'string' && !/none|random/.test(o.beard)) extras.push(`a ${SPACED(o.beard)} beard`)
  const g = o.glasses
  if (g && g !== 'random') extras.push(g === 'sun' || g === 'aviator' ? 'sunglasses' : 'glasses')
  if (typeof o.accessory === 'string' && !/none|random/.test(o.accessory)) extras.push(`a ${SPACED(o.accessory)}`)
  if (typeof o.hat === 'string' && !/none|random/.test(o.hat)) extras.push(`a ${SPACED(o.hat)} hat`)
  if (typeof o.name === 'string') extras.push(`the initials of ${o.name}`)
  const head = `${mood ? `${/^[aeiou]/.test(mood) ? 'An' : 'A'} ${mood}` : /^[aeiou]/.test(noun) ? 'An' : 'A'} ${noun}`
  return extras.length ? `${head} with ${extras.length > 1 ? extras.slice(0, -1).join(', ') + ' and ' + extras[extras.length - 1] : extras[0]}` : head
}
