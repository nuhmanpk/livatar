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

  // the pet's stats load from storage in an effect, so SSR shows just the yard: the avatar plus its legs
  const petHtml = renderToString(h(LivatarPet, { variant: animal, seed: 'mochi' }))
  assert.equal(svgs(petHtml), 2)
  assert.ok(petHtml.includes('<line'))

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

test('site-kit components server-render with living faces', async () => {
  const K = await import('../dist/components.js')
  const out = [
    h(K.LivatarFooter, { brand: 'Acme', columns: [{ title: 'Company', links: [{ label: 'Terms', href: '/t' }] }] }),
    h(K.LivatarBreadcrumbs, { items: [{ label: 'Home', href: '/' }, { label: 'Docs' }] }),
    h(K.LivatarCard, { title: 'Hi' }, 'x'),
    h(K.LivatarCarousel, { slides: ['a', 'b'] }),
    h(K.LivatarList, { items: [{ id: 'ada', title: 'Ada' }] }),
    h(K.LivatarAccordion, { items: [{ id: 'q', summary: 'Q', content: 'A' }] }),
    h(K.LivatarTable, { columns: [{ key: 'n', header: 'N' }], rows: [{ id: 'ada', n: 'Ada' }] }),
    h(K.LivatarUsername, { value: 'admin', syncHash: false }),
  ].map((e) => renderToString(e))
  for (const html of out) assert.ok(svgs(html) >= 1)
  assert.match(out[1], /aria-current="page"/)
  assert.match(out[7], /reserved/)
})

test('checkUsername explains every failure', async () => {
  const { checkUsername } = await import('../dist/index.js')
  const why = (n) => checkUsername(n).reason
  assert.equal(why(''), 'empty'); assert.equal(why('ab'), 'too-short'); assert.equal(why('a'.repeat(21)), 'too-long')
  assert.equal(why('my name'), 'invalid-chars'); assert.equal(why('-abc'), 'bad-edge'); assert.equal(why('a..b'), 'repeated')
  assert.equal(why('12345'), 'numeric'); assert.equal(why('admin'), 'reserved'); assert.equal(why('@Ada'), 'taken')
  assert.equal(why('zxq-91'), 'available')
  assert.ok(checkUsername('ada').suggestions.length > 0)
  assert.equal(checkUsername('x1y', { taken: (n) => n === 'x1y' }).reason, 'taken')
})

test('skeleton renders every kind, face slots can be hidden', async () => {
  const { LivatarSkeleton, LivatarInput } = await import('../dist/components.js')
  for (const kind of ['text', 'list', 'card', 'image', 'video', 'profile', 'table', 'chat', 'feed', 'grid']) {
    const html = renderToString(h(LivatarSkeleton, { kind }))
    assert.ok(html.includes('aria-busy') && html.includes('lv-sk'), kind)
  }
  assert.ok(svgs(renderToString(h(LivatarSkeleton, { kind: 'image' }))) >= 1)
  assert.equal(svgs(renderToString(h(LivatarSkeleton, { kind: 'image', avatar: false }))), 0)
  // follow seeds the face from the typed text; cycle makes the face a button
  const a = renderToString(h(LivatarInput, { follow: true, cycle: true, defaultValue: 'ada' }))
  const b = renderToString(h(LivatarInput, { follow: true, cycle: true, defaultValue: 'bob' }))
  assert.ok(a.includes('Change character') && a !== b)
})

test('marquee, confetti and presence render; presence draws cursors for children', async () => {
  const { LivatarMarquee, LivatarConfetti, LivatarPresence } = await import('../dist/components.js')
  const mq = renderToString(h(LivatarMarquee, { users: ['a', 'b', 'c'], rows: 2 }))
  assert.ok(mq.includes('lv-mq') && mq.includes('prefers-reduced-motion') && svgs(mq) >= 6)
  assert.ok(renderToString(h(LivatarConfetti, { fire: 1 }, h('button', null, 'go'))).includes('<button'))
  const users = [{ id: 'ada', name: 'Ada', cursor: { x: 10, y: 20 } }, { id: 'bob', typing: true }, { id: 'cy' }, { id: 'dee' }]
  const p = renderToString(h(LivatarPresence, { users, max: 2 }, h('div', null, 'canvas')))
  assert.ok(p.includes('+2') && p.includes('Ada') && p.includes('typing') && p.includes('canvas'))
  assert.ok(!renderToString(h(LivatarPresence, { users, max: 5 })).includes('left:10%'))
})

test('every keyframes block in the components has a reduced-motion guard', () => {
  const src = readFileSync('src/components.ts', 'utf8')
  const lits = [...src.matchAll(/'((?:[^'\\\n]|\\.)*@keyframes(?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*@keyframes(?:[^`\\]|\\.)*)`/g)].map((m) => m[1] ?? m[2])
  assert.ok(lits.length >= 4)
  for (const l of lits) assert.ok(l.includes('prefers-reduced-motion'), l.slice(0, 80))
})

test('LivatarPhoto shows the photo, or the seeded livatar when there is none', async () => {
  const { LivatarPhoto } = await import('../dist/components.js')
  const withPhoto = renderToString(h(LivatarPhoto, { src: '/me.jpg', seed: 'ada', alt: 'Ada' }))
  assert.ok(withPhoto.includes('<img') && withPhoto.includes('/me.jpg') && svgs(withPhoto) === 0)
  for (const src of [undefined, null, '']) {
    const fb = renderToString(h(LivatarPhoto, { src, seed: 'ada', alt: 'Ada', size: 48 }))
    assert.ok(!fb.includes('<img') && svgs(fb) === 1 && fb.includes('aria-label="Ada"'), String(src))
  }
  // same seed, same fallback face
  assert.equal(renderToString(h(LivatarPhoto, { seed: 'bo' })), renderToString(h(LivatarPhoto, { seed: 'bo' })))
})

test('effects and UI primitives server-render faces', async () => {
  const C = await import('../dist/components.js')
  const ppl = [{ id: 'ada', name: 'Ada', role: 'Eng' }, { id: 'bob' }, { id: 'cy' }]
  const cases = {
    LivatarAnimatedTooltip: [{ people: ppl }, 3], LivatarDock: [{ items: ppl }, 3], LivatarTiltCard: [{ seed: 'a', title: 'T' }, 1], LivatarSpotlightCard: [{ seed: 'a' }, 1],
    LivatarCompare: [{ left: { mood: 'happy' }, right: { mood: 'sad' } }, 2], LivatarFocusCards: [{ people: ppl }, 3], LivatarExpandableCard: [{ title: 'x', seed: 'a' }, 1],
    LivatarBento: [{ items: ppl }, 3], LivatarOrbit: [{ people: ppl, center: { seed: 'c' } }, 4], LivatarBeam: [{ from: ppl[0], to: ppl[1] }, 3], LivatarGlobe: [{ people: ppl }, 3],
    LivatarTabs: [{ tabs: [{ id: 'a', label: 'A', content: 'x' }, { id: 'b', label: 'B', content: 'y' }] }, 1], LivatarSwitch: [{ checked: true, onChange() {} }, 1],
    LivatarSlider: [{ value: 50, onChange() {} }, 1], LivatarCommand: [{ items: [{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }] }, 3],
    LivatarCalendar: [{ month: new Date(2026, 0, 1), marks: { '2026-01-05': ['a', 'b'] } }, 2], LivatarPagination: [{ page: 2, pages: 9, onChange() {} }, 1],
    LivatarAlert: [{ title: 'Hi', type: 'error' }, 1], LivatarTimeline: [{ items: [{ id: 'a', title: 'x' }, { id: 'b', title: 'y' }] }, 2],
    LivatarComment: [{ comments: [{ id: 'a', author: 'Ada', body: 'hi', replies: [{ id: 'b', author: 'Bob', body: 'yo' }] }] }, 2], LivatarResult: [{ status: '404' }, 1],
    LivatarSegmented: [{ options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], value: 'a', onChange() {} }, 2], LivatarStatistic: [{ title: 'Users', value: 1234, trend: 5 }, 1],
    LivatarTour: [{ steps: [{ title: 'one' }], open: true, onClose() {} }, 1], LivatarAvatar: [{ name: 'Ada', status: 'online' }, 1],
  }
  for (const [n, c] of Object.entries(cases)) {
    const html = renderToString(h(C[n], c[0]))
    assert.equal(svgs(html), c[1], `${n}: expected ${c[1]} svgs`)
  }
  assert.equal(renderToString(h(C.LivatarDialog, { open: false, onClose() {}, title: 'x' })), '')
  assert.equal(svgs(renderToString(h(C.LivatarDialog, { open: true, onClose() {}, title: 'x' }))), 1)
  assert.match(renderToString(h(C.LivatarSwitch, { checked: false, onChange() {} })), /aria-checked="false"/)
  assert.equal(svgs(renderToString(h(C.LivatarAvatar, { src: 'x.png', name: 'Ada' }))), 0)
})

test('playful components server-render faces', async () => {
  const C = await import('../dist/components.js')
  const ppl = [{ id: 'ada' }, { id: 'bob' }, { id: 'cy' }]
  const cases = {
    LivatarMagnetic: [{ children: 'Go' }, 1], LivatarFlipCard: [{ back: 'hi' }, 1], LivatarCarousel3D: [{ people: ppl }, 3], LivatarRain: [{ count: 4 }, 4],
    LivatarMemory: [{ pairs: 4 }, 0], LivatarSpinWheel: [{ people: ppl }, 3], LivatarPeek: [{ children: 'x' }, 1], LivatarSwipeCards: [{ people: ppl }, 1],
    LivatarMoodPicker: [{ seed: 'a' }, 5], LivatarSpeech: [{ text: 'Hello' }, 1], LivatarLeaderboard: [{ rows: [{ id: 'a', score: 5 }, { id: 'b', score: 9 }] }, 2],
    LivatarSlotMachine: [{}, 3], LivatarWave: [{ seeds: ['a', 'b', 'c'] }, 3], LivatarBuddy: [{ children: 'x' }, 1], LivatarPhotoBooth: [{}, 4],
    LivatarCursorTrail: [{ length: 3 }, 3], LivatarSwarm: [{ seeds: ['a', 'b'] }, 2], LivatarRipple: [{ children: 'x' }, 0],
  }
  for (const [n, c] of Object.entries(cases)) assert.equal(svgs(renderToString(h(C[n], c[0]))), c[1], `${n}: expected ${c[1]} svgs`)
})

test('more effects server-render faces', async () => {
  const C = await import('../dist/components.js')
  const cases = {
    LivatarBeamNetwork: [{ center: 'hub', people: ['a', 'b', 'c', 'd'] }, 6], LivatarBorderBeam: [{ title: 'x' }, 1], LivatarMeteors: [{ count: 4 }, 4],
    LivatarPulse: [{ center: 'c', people: ['a', 'b', 'c'] }, 4], LivatarParticles: [{ count: 5 }, 5], LivatarAura: [{ seed: 'a' }, 1], LivatarMarquee3D: [{ columns: 2, seeds: ['a', 'b'] }, 8],
    LivatarSphereCloud: [{ seeds: ['a', 'b', 'c'] }, 3], LivatarLens: [{}, 24], LivatarProximityGrid: [{ columns: 3, rows: 2 }, 6],
    LivatarTracingBeam: [{ items: [{ id: 'a', title: 'x' }, { id: 'b', title: 'y' }] }, 2], LivatarParallax: [{ seeds: ['a', 'b'] }, 2],
  }
  for (const [n, c] of Object.entries(cases)) assert.equal(svgs(renderToString(h(C[n], c[0]))), c[1], `${n}: expected ${c[1]} svgs`)
})

test('calendar views server-render faces', async () => {
  const C = await import('../dist/components.js')
  const d = new Date(2026, 0, 14)
  assert.equal(svgs(renderToString(h(C.LivatarCalendar, { month: d, fill: true }))), 31 + 0)
  assert.equal(svgs(renderToString(h(C.LivatarWeekStrip, { value: d, marks: { '2026-01-13': ['a'], '2026-01-15': ['b', 'c'] } }))), 3)
  assert.equal(svgs(renderToString(h(C.LivatarAgenda, { events: [{ id: 'e', date: '2026-01-14', title: 'Standup', who: ['a', 'b'] }] }))), 2)
  assert.equal(svgs(renderToString(h(C.LivatarAgenda, { events: [] }))), 1)
  assert.equal(svgs(renderToString(h(C.LivatarYearCalendar, { year: 2026, marks: { '2026-01-05': ['a'] } }))), 0)
  assert.equal(svgs(renderToString(h(C.LivatarHeatmap, { data: { '2026-01-05': 3 } }))), 1)
  assert.equal(svgs(renderToString(h(C.LivatarDatePicker, {}))), 1)
})
