import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createElement as h } from 'react'
import { renderToString } from 'react-dom/server'
import { bot, animal, emoji } from '../dist/index.js'
import { LivatarInput, LivatarSearch, LivatarOTP, LivatarNewsletter, LivatarCookieConsent, LivatarProgress, LivatarStepper, LivatarPricing, LivatarBell, LivatarLike, LivatarCountdown, LivatarHelpLauncher, LivatarBackground, LivatarChat, LivatarToast, LivatarNotFound, LivatarTyping, LivatarProfileCard, LivatarTestimonial, LivatarCheckout, LivatarCartButton, LivatarUpload, LivatarThemeToggle, LivatarPasswordStrength, LivatarRating, LivatarConnection, LivatarLoader, LivatarMeet, LivatarForm, LivatarAssistant, LivatarPet, LivatarStack, LivatarEmptyState, LivatarReaction } from '../dist/components.js'

const svgs = (html) => (html.match(/<svg/g) ?? []).length

test('components ships "use client" for Next.js', () => {
  assert.ok(readFileSync('dist/components.js', 'utf8').startsWith('"use client"'))
  assert.ok(readFileSync('dist/components.cjs', 'utf8').startsWith('"use client"'))
})

test('every component server-renders a static avatar', () => {
  const loader = renderToString(h(LivatarLoader, { status: 'loading', label: 'Fetching…' }))
  assert.match(loader, /role="status"/)
  assert.match(loader, /aria-busy="true"/)
  assert.match(loader, /Fetching…/)
  assert.equal(svgs(loader), 1)

  const meet = renderToString(h(LivatarMeet, { participants: [{ id: 'ada', speaking: true }, { id: 'bob', muted: true }, { id: 'cy', name: 'Cy' }] }))
  assert.equal(svgs(meet), 3)
  assert.match(meet, /data-speaking="true"/)
  assert.match(meet, /bob 🔇/)
  assert.match(meet, />Cy</)

  const form = renderToString(h(LivatarForm, { onSubmit: () => {} }, h('input', { name: 'email', type: 'email', required: true })))
  assert.match(form, /<form[^>]*novalidate/i)
  assert.equal(svgs(form), 1)
  assert.equal(svgs(renderToString(h(LivatarForm, { placement: 'none' }, h('input')))), 0)

  const ai = renderToString(h(LivatarAssistant, { variant: bot, seed: 'helper', status: 'submitted', showState: true }))
  assert.match(ai, /data-state="idle"/) // state changes start after mount
  assert.equal(svgs(ai), 1)

  // the pet's stats load from storage in an effect, so SSR shows just the avatar
  assert.equal(svgs(renderToString(h(LivatarPet, { variant: animal, seed: 'mochi' }))), 1)

  const stack = renderToString(h(LivatarStack, { users: ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((id) => ({ id, status: 'online' })), max: 4 }))
  assert.equal(svgs(stack), 4)
  assert.match(stack, /\+3/)
  assert.match(stack, /aria-label="7 people"/)

  const empty = renderToString(h(LivatarEmptyState, { variant: animal, title: 'No messages yet', description: 'Check back soon', action: h('button', null, 'Refresh') }))
  assert.match(empty, /No messages yet/)
  assert.match(empty, /Refresh/)

  assert.equal(svgs(renderToString(h(LivatarReaction, { variant: emoji, text: 'love it' }))), 1)
})

test('themed components server-render with their own characters', () => {
  const co = renderToString(h(LivatarCheckout, { amount: '$24.00' }))
  assert.match(co, /data-lv-root="money"/)
  assert.match(co, /type="password"[^>]*aria-label="CVC"|aria-label="CVC"[^>]*type="password"/) // card covers its eyes on the CVC
  assert.match(co, /Pay <!-- -->\$24\.00|Pay \$24\.00/)
  assert.match(renderToString(h(LivatarCartButton, { count: 2 })), /aria-label="Cart, 2 items"[\s\S]*data-lv-root="ui"/)
  assert.match(renderToString(h(LivatarUpload, {})), /data-lv-root="office"/)
  assert.match(renderToString(h(LivatarThemeToggle, { dark: true, onChange() {} })), /aria-pressed="true"[\s\S]*data-lv-root="planet"/)
  assert.match(renderToString(h(LivatarPasswordStrength, { value: 'Tr0ub4dor&3xyz!' })), /aria-valuenow="4"/)
  assert.match(renderToString(h(LivatarPasswordStrength, { value: 'abc' })), /aria-valuenow="0"/)
  assert.match(renderToString(h(LivatarRating, { value: 4, onChange() {} })), /data-lv-root="emoji" data-lv-mood="happy"[\s\S]*role="radiogroup"/)
  assert.match(renderToString(h(LivatarConnection, { online: false })), /Offline/)
  assert.equal(svgs(renderToString(h(LivatarBackground, { count: 12 }, h('h1', null, 'hi')))), 12)
  const chat = renderToString(h(LivatarChat, { messages: [{ id: 1, from: 'ada', text: 'hi' }, { id: 2, from: 'me', text: 'yo', me: true }], typing: 'ada' }))
  assert.equal(svgs(chat), 3)
  assert.match(chat, /ada is typing/)
  assert.match(renderToString(h(LivatarToast, { type: 'error', title: 'Declined' })), /role="alert"/)
  assert.equal(renderToString(h(LivatarToast, { open: false, title: 'x' })), '')
  assert.match(renderToString(h(LivatarNotFound, {})), /404/)
  assert.match(renderToString(h(LivatarTyping, { name: 'Ada' })), /Ada is typing/)
  assert.match(renderToString(h(LivatarProfileCard, { name: 'Ada', status: 'online' })), /aria-label="online"/)
  assert.match(renderToString(h(LivatarTestimonial, { quote: 'I love it', name: 'Ada' })), /data-lv-mood="love"/)
})

test('inline fields and the newest themed components server-render', () => {
  const inp = renderToString(h(LivatarInput, { type: 'email', name: 'email', required: true, placeholder: 'you@example.com' }))
  assert.match(inp, /<label[\s\S]*data-lv-root="emoji"[\s\S]*<input[^>]*type="email"/)
  assert.doesNotMatch(inp, /<rect width="100" height="100" fill=/) // transparent: no background tile
  assert.match(renderToString(h(LivatarSearch, { onSearch: () => 0 })), /role="search"[\s\S]*data-lv-root="animal"/)
  assert.equal((renderToString(h(LivatarOTP, { length: 4 })).match(/aria-label="Digit/g) ?? []).length, 4)
  assert.match(renderToString(h(LivatarNewsletter, {})), /data-lv-root="plant"[\s\S]*type="email"/)
  assert.match(renderToString(h(LivatarCookieConsent, {})), /role="dialog"[\s\S]*data-lv-root="food"/)
  assert.match(renderToString(h(LivatarProgress, { value: 140 })), /aria-valuenow="100"/)
  assert.match(renderToString(h(LivatarStepper, { steps: ['a', 'b', 'c'], current: 1 })), /aria-current="step"/)
  const pr = renderToString(h(LivatarPricing, { tiers: [{ name: 'Free', price: '$0', features: ['x'] }, { name: 'Pro', price: '$9', features: ['y'], popular: true }] }))
  assert.equal(svgs(pr), 2)
  assert.match(pr, /Popular/)
  assert.match(pr, /data-lv-mood="love"/)
  assert.match(renderToString(h(LivatarBell, { count: 0 })), /data-lv-mood="sleepy"/)
  assert.match(renderToString(h(LivatarBell, { count: 120 })), /99\+/)
  assert.match(renderToString(h(LivatarLike, { liked: true, onChange() {}, count: 9 })), /aria-pressed="true"[\s\S]*>10</)
  assert.match(renderToString(h(LivatarCountdown, { to: Date.now() + 90061000 })), /role="timer"/)
  assert.match(renderToString(h(LivatarHelpLauncher, {})), /aria-expanded="false"/)
})

test('call, copy, poll, focus timer, to-do list render', async () => {
  const { LivatarCall, LivatarCopyButton, LivatarPoll, LivatarFocusTimer, LivatarTodoList } = await import('../dist/components.js')
  const people = [{ id: 'ada', speaking: true }, { id: 'bob', muted: true, hand: true }, { id: 'cy' }]
  const call = renderToString(h(LivatarCall, { participants: people, me: 'bob', title: 'Standup', onLeave() {} }))
  assert.equal(svgs(call), 3)
  assert.match(call, /aria-label="ada, speaking"[^>]*data-speaking="true"/)
  assert.match(call, /bob, muted, hand raised/)
  assert.match(call, /Unmute[\s\S]*Leave/)
  assert.match(call, /aspect-ratio:16\/8/) // ada is on the stage
  assert.doesNotMatch(renderToString(h(LivatarCall, { participants: people, layout: 'grid', controls: false })), /16\/8|Leave/)
  assert.match(renderToString(h(LivatarCopyButton, { text: 'x' })), /data-lv-root="office"[\s\S]*Copy/)
  const poll = renderToString(h(LivatarPoll, { question: 'Lunch?', voted: 'a', options: [{ id: 'a', label: 'Tacos', votes: 3 }, { id: 'b', label: 'Sushi', votes: 1 }] }))
  assert.match(poll, /75%/)
  assert.match(poll, /data-lv-mood="love"/)
  assert.match(renderToString(h(LivatarFocusTimer, { focus: 25 })), /25<!-- -->:<!-- -->00[\s\S]*Start/)
  const todo = renderToString(h(LivatarTodoList, { items: [{ id: '1', text: 'a', done: true }, { id: '2', text: 'b', done: true }], onChange() {} }))
  assert.match(todo, /data-lv-mood="love"/)
  assert.match(todo, /2<!-- -->\/<!-- -->2/)
})

test('character loaders render every kind', async () => {
  const { LivatarChainLoader } = await import('../dist/components.js')
  for (const [kind, n] of [['chain', 5], ['orbit', 5], ['conga', 5], ['stack', 4]]) {
    const html = renderToString(h(LivatarChainLoader, { kind, variants: [bot, animal] }))
    assert.equal(svgs(html), n, kind)
    assert.match(html, /role="status"[^>]*aria-busy="true"/)
  }
})
