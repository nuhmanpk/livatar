import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  createAvatar, toDataUri, defineStyle, alive, styles, palettes, MOODS,
  encode, decode, render, isCode, blob, buddy,
} from '../dist/index.js'

const all = Object.values(styles)

test('deterministic: same seed, same SVG', () => {
  for (const s of all) assert.equal(createAvatar(s, { seed: 'ada' }), createAvatar(s, { seed: 'ada' }))
})

test('different seeds differ', () => {
  for (const s of all) assert.notEqual(createAvatar(s, { seed: 'ada' }), createAvatar(s, { seed: 'linus' }))
})

test('well-formed XML-ish output (no bare attributes, balanced tags)', () => {
  for (const s of all)
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const svg = createAvatar(s, { seed, title: 'Ada <3' })
      assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'))
      assert.doesNotMatch(svg, /\sdata-lv-[a-z]+[>\s]/, 'bare data attribute')
      const open = (svg.match(/<g[\s>]/g) || []).length
      const close = (svg.match(/<\/g>/g) || []).length
      assert.equal(open, close)
      assert.match(svg, /aria-label="Ada &#60;3"/)
    }
})

test('every style exposes animatable parts', () => {
  for (const s of all) {
    const svg = createAvatar(s, { seed: 'x' })
    for (const attr of ['data-lv-body', 'data-lv-eye', 'data-lv-mouth', 'data-lv-depth'])
      assert.ok(svg.includes(attr), `${s.name} missing ${attr}`)
  }
})

test('options: size, shape, background, colors', () => {
  const svg = createAvatar(blob, { seed: 'x', size: 48, shape: 'square', background: '#123456', colors: ['#ff0000', '#00ff00'] })
  assert.match(svg, /width="48"/)
  assert.match(svg, /fill="#123456"/)
  assert.match(svg, /<rect width="100" height="100"\/>/)
  assert.doesNotMatch(createAvatar(blob, { seed: 'x', background: false }), /<rect width="100" height="100" fill/)
})

test('rejects injection through colors', () => {
  const svg = createAvatar(blob, { seed: 'x', colors: ['"/><script>alert(1)</script>'] })
  assert.doesNotMatch(svg, /<script/)
})

test('custom styles plug in', () => {
  const dot = defineStyle({
    name: 'dot',
    colors: ['#000'],
    render: ({ color }) => `<circle cx="50" cy="50" r="20" fill="${color()}" data-lv-depth="1"/>`,
  })
  assert.match(createAvatar(dot, { seed: 1 }), /<circle cx="50"/)
})

test('SSR safe: alive() without DOM is a no-op handle', () => {
  const h = alive(null)
  h.talk(); h.look(1, 0); h.destroy()
  assert.equal(typeof toDataUri(blob, { seed: 'x' }), 'string')
  assert.deepEqual(Object.keys(styles), ['blob', 'buddy', 'bot', 'pixel', 'animal', 'monster', 'ghost', 'emoji', 'initials', 'food', 'plant', 'dino', 'alien', 'planet', 'clay', 'memoji', 'ui', 'device', 'fruit', 'drink', 'vehicle', 'tech', 'money', 'home', 'office', 'dev', 'human', 'ai', 'weather', 'sport', 'music', 'sea', 'bug', 'magic', 'party', 'season', 'tool', 'anime', 'notion', 'chibi', 'flat', 'lowpoly', 'sketch', 'retro', 'toon'])
})

const wellFormed = (svg, msg) => {
  assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), msg)
  assert.doesNotMatch(svg, /\sdata-lv-[a-z]+[>\s/]/, `bare data attribute: ${msg}`)
  assert.doesNotMatch(svg, /NaN|undefined/, `NaN/undefined: ${msg}`)
  assert.equal((svg.match(/<g[\s>]/g) || []).length, (svg.match(/<\/g>/g) || []).length, `unbalanced <g>: ${msg}`)
}

test('every style draws every mood, deterministically', () => {
  for (const s of all)
    for (const mood of MOODS)
      for (const seed of ['a', 'b', 'c']) {
        const svg = createAvatar(s, { seed, mood })
        wellFormed(svg, `${s.name}/${mood}/${seed}`)
        assert.match(svg, new RegExp(`data-lv-mood="${mood}"`))
        assert.equal(svg, createAvatar(s, { seed, mood }))
      }
})

test('every variant value renders', () => {
  for (const s of all)
    for (const [key, list] of Object.entries(s.variants ?? {}))
      for (const value of list) wellFormed(createAvatar(s, { seed: 'v', options: { [key]: value } }), `${s.name}.${key}=${value}`)
})

test('moods change the face but keep the identity', () => {
  for (const s of all) {
    const neutral = createAvatar(s, { seed: 'ada' })
    const happy = createAvatar(s, { seed: 'ada', mood: 'happy' })
    assert.notEqual(neutral, happy, `${s.name} happy looks neutral`)
  }
})

test('flip, border, gradient', () => {
  const svg = createAvatar(buddy, { seed: 'x', flip: true, border: '#ff0000', borderWidth: 6, gradient: true })
  assert.match(svg, /data-lv-flip=""/)
  assert.match(svg, /matrix\(-1 0 0 1 100 0\)/)
  assert.match(svg, /stroke="#ff0000" stroke-width="6"/)
  assert.match(svg, /linearGradient id="lv[a-z0-9]+-bg"/)
  wellFormed(svg, 'flip/border/gradient')
})

test('rejects injection through style options', () => {
  const svg = createAvatar(buddy, { seed: 'x', options: { skin: '"/><script>alert(1)</script>', hairColor: '"><img onerror=x>' } })
  assert.doesNotMatch(svg, /<script|onerror/)
})

test('codes: round trip', () => {
  const cfgs = [
    { style: 'buddy', seed: 'nuhmanpk' },
    { style: 'animal', seed: 'ada@example.com', mood: 'love', shape: 'rounded', flip: true, gradient: true, palette: 'ocean', options: { species: styles.animal.variants.species[0] } },
    { style: 'emoji', seed: 'ünïcödé 🎉', background: '#123456', border: '#ff0000', borderWidth: 2.5, colors: ['#111111', '#222222'] },
    { style: 'buddy', seed: '', background: false, border: true, options: { hair: 'afro', glasses: 'sun', skin: '#abcdef' } },
    { style: 'pixel', seed: 'x', options: { density: 0.123 } },
  ]
  for (const cfg of cfgs) {
    const code = encode(cfg)
    assert.ok(isCode(code), code)
    assert.match(code, /^lv[A-Za-z0-9_-]+$/)
    const back = decode(code)
    const norm = (c) => JSON.parse(JSON.stringify({ ...c, seed: String(c.seed ?? 'livatar'), options: c.options && Object.keys(c.options).length ? c.options : undefined }))
    assert.deepEqual(norm(back), norm(cfg))
    assert.equal(render(code), render(cfg))
  }
})

test('codes: short and stable', () => {
  const code = encode({ style: 'buddy', seed: 'nuhmanpk', mood: 'happy', options: { hair: 'curly', glasses: 'round' } })
  assert.ok(code.length < 32, `${code} is ${code.length} chars`)
  // 'random' options are dropped, so they don't bloat the code
  assert.equal(code, encode({ style: 'buddy', seed: 'nuhmanpk', mood: 'happy', options: { hair: 'curly', glasses: 'round', mouth: 'random' } }))
})

test('codes: garbage is rejected, not rendered', () => {
  for (const bad of ['', 'hello', 'lv', 'lv!!!!', 'lvAAAAAAAAAA', 'xxAQEB'])
    assert.throws(() => decode(bad))
  assert.equal(isCode('lvAQEBAA'), true)
  assert.equal(isCode('buddy'), false)
})

test('render accepts a style name and palettes', () => {
  assert.equal(render('blob', { seed: 'a' }), createAvatar(blob, { seed: 'a' }))
  const svg = render({ style: 'blob', seed: 'a', palette: 'mono' })
  assert.ok(palettes.mono.some((c) => svg.includes(c)))
})
