import { test } from 'node:test'
import assert from 'node:assert/strict'
import { feel, feeling, traits, personality, personalityName, reaction, react, assistant, pet, group } from '../dist/life.js'

// Records every call so tests can check what the avatar was told to do.
function fake(el = null) {
  const calls = []
  const state = { mood: 'neutral' }
  const h = { calls, state, el, opts: {} }
  for (const k of ['look', 'talk', 'blink', 'poke', 'nod', 'shake', 'refresh', 'destroy']) h[k] = (...a) => calls.push([k, ...a])
  h.emote = (m, ms) => { calls.push(['emote', m, ms]); if (!ms) state.mood = m }
  h.set = (o) => Object.assign(h.opts, o)
  h.did = (k, arg) => calls.some((c) => c[0] === k && (arg === undefined || c[1] === arg))
  return h
}
const fakeEl = () => {
  const l = {}
  return { l, addEventListener: (e, f) => (l[e] = f), removeEventListener: (e) => delete l[e], getBoundingClientRect: () => ({ left: 0, top: 0, width: 10, height: 10 }) }
}

test('feel: words, emoji, negation, shouting', () => {
  assert.equal(feel('this is great, thanks!'), 'happy')
  assert.equal(feel('the build is broken again'), 'angry')
  assert.equal(feel('not good'), 'sad')
  assert.equal(feel('I love it 😍'), 'love')
  assert.equal(feel('why does this happen??'), 'confused')
  assert.equal(feel('soooo goood'), 'happy')
  assert.equal(feel('hello there'), 'neutral')
  assert.equal(feel('WHY IS THIS BROKEN'), 'angry')
  assert.equal(feeling('hello').score, 0)
  assert.ok(feeling('great great awesome').score > 0.5)
})

test('personality: presets, seeds are deterministic, partial traits', () => {
  assert.equal(traits('grumpy').temper, 0.9)
  assert.deepEqual(traits({ seed: 'ada' }), traits({ seed: 'ada' }))
  assert.notDeepEqual(traits({ seed: 'ada' }), traits({ seed: 'bob' }))
  assert.equal(traits({ energy: 2 }).energy, 1)
  assert.equal(traits({ energy: 0.2 }).warmth, 0.5)
  assert.equal(personalityName(traits('shy')), 'shy')
})

test('personality: tunes motion and escalates pokes', () => {
  const el = fakeEl()
  const h = fake(el)
  const p = personality(h, 'grumpy', { idle: false })
  assert.equal(h.opts.pokeMood, 'angry')
  assert.ok(h.opts.intensity < 1)
  for (let i = 0; i < 3; i++) el.l['livatar:poke']()
  assert.ok(h.did('emote', 'angry') && h.did('shake'))
  p.react('success')
  assert.ok(h.did('emote', 'wink')) // grumpy has low warmth
  p.destroy()
  assert.equal(el.l['livatar:poke'], undefined)
})

test('reactions depend on traits', () => {
  assert.equal(reaction('error', traits('grumpy')).mood, 'angry')
  assert.equal(reaction('error', traits('shy')).mood, 'sad')
  assert.equal(reaction('celebrate', traits('cheerful')).mood, 'love')
  const h = fake()
  react(h, 'join')
  assert.ok(h.did('nod') && h.did('emote', 'happy'))
})

test('assistant: states, streaming, sentiment at the end', async () => {
  const h = fake()
  const seen = []
  const ai = assistant(h, { onState: (s) => seen.push(s) })
  ai.listen()
  ai.think()
  assert.equal(ai.state, 'thinking')
  assert.ok(h.did('emote', 'confused'))
  async function* tokens() { yield 'Done! '; yield 'That works great.' }
  const text = await ai.stream(tokens())
  assert.equal(text, 'Done! That works great.')
  assert.ok(h.calls.filter((c) => c[0] === 'talk').length >= 2)
  assert.deepEqual(seen, ['listening', 'thinking', 'speaking', 'done'])
  assert.ok(h.did('emote', 'happy') && h.did('nod'))
  ai.error()
  assert.equal(ai.state, 'error')
  ai.destroy()
})

test('pet: decays over time, persists, levels up', () => {
  let t = 0
  const mem = new Map()
  const store = { get: (k) => mem.get(k), set: (k, v) => mem.set(k, v) }
  const levels = []
  const h = fake()
  const p = pet(h, { store, now: () => t, tick: 0, onLevelUp: (l) => levels.push(l) })
  assert.equal(p.stats.hunger, 80)
  t += 10 * 3_600_000 // 10 hours later
  assert.equal(p.mood(), 'sad')
  assert.equal(Math.round(p.stats.hunger), 20)
  p.feed(50)
  assert.equal(Math.round(p.stats.hunger), 70)
  p.reward(100)
  assert.deepEqual(levels, [2])
  p.sleep()
  assert.equal(p.mood(), 'sleepy')
  p.destroy()
  // a new pet with the same store picks up where it left off
  const again = pet(fake(), { store, now: () => t, tick: 0 })
  assert.equal(again.stats.level, 2)
  assert.equal(again.stats.asleep, true)
  again.destroy()
})

test('group: join, speaking, messages, mentions, leave', () => {
  const room = group({ idleAfter: 0 })
  const a = fake(fakeEl())
  const b = fake(fakeEl())
  room.join('ada', a)
  room.join('bob', b)
  assert.ok(a.did('emote', 'happy')) // ada greets bob
  assert.ok(a.did('look'))
  room.message('bob', 'this is awesome @ada')
  assert.ok(b.did('talk'))
  assert.ok(a.calls.some((c) => c[0] === 'emote' && c[1] === 'happy' && c[2]))
  assert.ok(a.did('emote', 'surprised')) // mention
  room.speaking('ada')
  assert.ok(room.members.get('ada').speaking)
  room.speaking('ada', false)
  room.leave('bob')
  assert.ok(a.did('emote', 'sad'))
  assert.equal(room.members.size, 1)
  room.destroy()
})

test('edge cases do not throw and stay in range', () => {
  assert.equal(feel(''), 'neutral')
  assert.equal(feel('   '), 'neutral')
  assert.equal(typeof feeling('🙂🙂🙂').score, 'number')
  for (const name of ['cheerful', 'shy', 'grumpy', 'curious', 'lazy', 'playful', 'calm']) {
    const t = traits(name)
    for (const v of Object.values(t)) assert.ok(v >= 0 && v <= 1, `${name} trait out of range`)
  }
  const t = traits({ energy: -5, warmth: 9 })
  assert.equal(t.energy, 0)
  assert.equal(t.warmth, 1)
  for (const ev of ['success', 'error', 'warning', 'loading', 'done', 'join', 'leave', 'message', 'celebrate', 'night', 'offline']) {
    const r = reaction(ev, traits('calm'))
    assert.ok(r && Object.keys(r).length, `no reaction for ${ev}`)
  }
  const room = group({ idleAfter: 0 })
  room.leave('nobody')
  room.speaking('nobody')
  room.message('nobody', 'hi')
  assert.equal(room.members.size, 0)
  room.destroy()
})

test('pet stats never leave 0…100', () => {
  let now = 0
  const p = pet(fake(), { now: () => now, tick: 0, store: { get() {}, set() {} } })
  now += 1000 * 3_600_000
  for (const k of ['hunger', 'energy', 'happiness']) assert.ok(p.stats[k] >= 0 && p.stats[k] <= 100, k)
  p.feed(1000)
  p.play?.()
  for (const k of ['hunger', 'energy', 'happiness']) assert.ok(p.stats[k] >= 0 && p.stats[k] <= 100, k)
  p.destroy()
})

test('assistant handles plain strings, empty streams and errors in streams', async () => {
  const h = fake()
  const ai = assistant(h)
  assert.equal(await ai.stream((async function* () {})()), '')
  await assert.rejects(ai.stream((async function* () { yield 'a'; throw new Error('net') })()))
  assert.equal(ai.state, 'error')
  ai.destroy()
})
