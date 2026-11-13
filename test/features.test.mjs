import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createSSRApp, h } from 'vue'
import { renderToString as vueToString } from 'vue/server-renderer'
import { createAvatar, encode, decode, render, randomConfig, styles, buddy, animal, bindForm, bindInput, toImage } from '../dist/index.js'
import { Livatar, LivatarCode } from '../dist/react.js'
import { Livatar as VLivatar, LivatarCode as VLivatarCode } from '../dist/vue.js'
import { livatar, livatarCode } from '../dist/action.js'

test('radius, scale, rotate', () => {
  const svg = createAvatar(buddy, { seed: 'x', radius: 12, scale: 0.8, rotate: 10, border: true })
  assert.match(svg, /<rect width="100" height="100" rx="12"\/>/)
  assert.match(svg, /rotate\(10\) scale\(0\.8\)/)
  assert.match(svg, /rx="10"/) // ring follows the radius
  // clamped, and garbage ignored
  assert.match(createAvatar(buddy, { seed: 'x', radius: 999 }), /<circle cx="50" cy="50" r="50"\/>/)
  assert.doesNotMatch(createAvatar(buddy, { seed: "x", scale: NaN, rotate: Infinity }), /translate\(50 50\)/)
})

test('codes carry radius/scale/rotate', () => {
  const cfg = { style: 'animal', seed: 'ada', radius: 18, scale: 1.1, rotate: -8, options: { species: 'owl' } }
  const back = decode(encode(cfg))
  assert.equal(back.radius, 18)
  assert.equal(back.scale, 1.1)
  assert.equal(back.rotate, -8)
  assert.deepEqual(back.options, { species: 'owl' })
  assert.equal(render(encode(cfg)), render(cfg))
})

test('randomConfig picks real variant values', () => {
  for (let i = 0; i < 20; i++) {
    const cfg = randomConfig()
    assert.ok(styles[cfg.style])
    for (const [k, v] of Object.entries(cfg.options)) assert.ok(styles[cfg.style].variants[k].includes(v))
    assert.equal(render(decode(encode(cfg))), render(cfg))
  }
  assert.equal(randomConfig('ghost').style, 'ghost')
})

test('React: server render (lean + code)', () => {
  const a = renderToString(createElement(Livatar, { variant: animal, seed: 'ada', mood: 'happy', size: 48 }))
  assert.match(a, /<span style="display:inline-block;line-height:0;width:48px"><svg/)
  assert.match(a, /data-lv-mood="happy"/)
  const code = encode({ style: 'ghost', seed: 'boo', mood: 'love' })
  const b = renderToString(createElement(LivatarCode, { code }))
  assert.ok(b.includes(render(code)))
  const c = renderToString(createElement(LivatarCode, { variant: 'monster', seed: 'm' }))
  assert.match(c, /data-lv-root="monster"/)
})

test('Vue: server render (lean + code)', async () => {
  const a = await vueToString(createSSRApp({ render: () => h(VLivatar, { variant: animal, seed: 'ada', mood: 'sad', size: 48 }) }))
  assert.match(a, /data-lv-root="animal"/)
  assert.match(a, /data-lv-mood="sad"/)
  assert.match(a, /width:48px/)
  const code = encode({ style: 'emoji', seed: 'e', mood: 'wink' })
  const b = await vueToString(createSSRApp({ render: () => h(VLivatarCode, { code }) }))
  assert.ok(b.includes(render(code)))
})

test('action + form helpers are SSR safe', () => {
  // a fake node: the action only needs innerHTML and alive() (no-op without window)
  const node = { innerHTML: '', matches: () => false, querySelector: () => null, querySelectorAll: () => [] }
  const a = livatar(node, { variant: buddy, seed: 'x' })
  assert.match(node.innerHTML, /data-lv-root="buddy"/)
  a.update({ variant: buddy, seed: 'y', mood: 'love' })
  assert.match(node.innerHTML, /data-lv-mood="love"/)
  a.destroy()
  livatarCode(node, { code: encode({ style: 'pixel', seed: 'p' }) })
  assert.match(node.innerHTML, /data-lv-root="pixel"/)
  assert.equal(typeof bindForm, 'function')
  assert.equal(typeof bindInput, 'function')
})

test('toImage refuses politely without a browser', async () => {
  await assert.rejects(() => toImage('<svg/>'), /needs a browser/)
})

test('roam: every species has a body, a persona, and sound is off by default', async () => {
  const { roam } = await import('../dist/roam.js')
  // outside a browser it is a harmless no-op
  const zoo = roam({ count: 2 })
  assert.equal(zoo.sound, false)
  assert.deepEqual([...zoo.roamers], [])
  assert.equal(zoo.spawn('cat'), null)
  zoo.destroy()
  const src = (await import('node:fs')).readFileSync('src/roam.ts', 'utf8')
  for (const sp of ['cat', 'dog', 'bear', 'bunny', 'fox', 'panda', 'frog', 'mouse', 'penguin', 'owl', 'chick', 'pig', 'koala', 'lion', 'dino']) {
    assert.ok(new RegExp(`\\b${sp}: \\{ move:`).test(src), `persona for ${sp}`)
  }
  assert.ok(/sound\?: boolean/.test(src) && /!!opts\.sound/.test(src))
})
