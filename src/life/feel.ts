import type { Mood } from '../core'

// Tiny sentiment lexicon: enough to pick a believable face, not a classifier.
const WORDS: Record<string, Mood> = {}
const add = (mood: Mood, list: string) => list.split(' ').forEach((w) => (WORDS[w] = mood))
add('happy', 'good great nice awesome amazing cool yay yes thanks thank ty glad happy fun win won works working fixed done perfect excellent sweet congrats congratulations lol haha hehe')
add('love', 'love loved lovely adore beautiful cute heart xoxo wonderful')
add('sad', 'sad sorry unfortunately miss missed lost lose failed fail cry crying depressed bad worse worst no nope alone tired')
add('angry', 'angry hate hated broken broke bug bugs crash crashed crashing stupid annoying annoyed wtf ugh furious damn terrible awful')
add('surprised', 'wow whoa woah omg really seriously what unexpected suddenly huh')
add('confused', 'confused confusing why how hmm unclear weird strange lost idk dunno')
add('sleepy', 'sleepy sleep zzz bored boring yawn night bedtime')
add('silly', 'silly joke kidding jk lmao rofl meme goofy')
add('wink', 'wink secret psst ;)')

const EMOJI: [RegExp, Mood][] = [
  [/[😍🥰😘❤️💖💕♥]/u, 'love'],
  [/[😂🤣😄😁😃😀🙂😊🎉👍✅]/u, 'happy'],
  [/[😢😭😞☹️🙁💔]/u, 'sad'],
  [/[😠😡🤬💢]/u, 'angry'],
  [/[😮😲😱🤯]/u, 'surprised'],
  [/[🤔😕❓]/u, 'confused'],
  [/[😴🥱💤]/u, 'sleepy'],
  [/[😜🤪😛]/u, 'silly'],
  [/[😉]/u, 'wink'],
]

const NEGATE = new Set(['not', "don't", 'dont', "isn't", 'isnt', 'never', "doesn't", 'doesnt', "can't", 'cant', "won't", 'wont'])
const FLIP: Partial<Record<Mood, Mood>> = { happy: 'sad', love: 'sad', sad: 'happy', angry: 'neutral' }

export interface Feeling {
  mood: Mood
  /** 0…1, how sure the guess is. */
  score: number
}

/**
 * Guess a mood from text: words, emoji, negation ("not good") and shouting ("WHY!!").
 * Tiny and local: no model, no network.
 */
export function feeling(text: string): Feeling {
  const tally: Partial<Record<Mood, number>> = {}
  const bump = (m: Mood, by = 1) => (tally[m] = (tally[m] ?? 0) + by)
  for (const [re, m] of EMOJI) if (re.test(text)) bump(m, 2)
  if (/[:;]-?\)/.test(text)) bump(text.includes(';') ? 'wink' : 'happy', 1.5)
  if (/:-?\(/.test(text)) bump('sad', 1.5)
  const words = text.toLowerCase().match(/[a-z';)]+/g) ?? []
  words.forEach((w, i) => {
    let m = WORDS[w] ?? WORDS[w.replace(/(.)\1{2,}/g, '$1$1')] ?? WORDS[w.replace(/(.)\1+/g, '$1')]
    if (!m) return
    if (NEGATE.has(words[i - 1]) || NEGATE.has(words[i - 2])) m = FLIP[m] ?? m
    bump(m)
  })
  const shout = /[A-Z]{4,}/.test(text) && text === text.toUpperCase()
  const bangs = (text.match(/!/g) ?? []).length
  const asks = (text.match(/\?/g) ?? []).length
  if (asks >= 2 && !tally.angry) bump('confused', 0.5)
  if (bangs >= 2 && !Object.keys(tally).length) bump('surprised', 1)
  if (shout) bump(tally.happy || tally.love ? 'happy' : 'angry', 1)
  let best: Mood = 'neutral'
  let top = 0
  let total = 0
  for (const [m, v] of Object.entries(tally) as [Mood, number][]) {
    total += v
    if (v > top) (top = v), (best = m)
  }
  return { mood: best, score: total ? Math.min(1, (top / total) * Math.min(1, top / 2)) : 0 }
}

/** Shorthand: `feel("this is broken!!") → 'angry'`. */
export const feel = (text: string): Mood => feeling(text).mood
