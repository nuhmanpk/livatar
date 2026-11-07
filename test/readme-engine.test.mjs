// The README studio (website) engine: scenes must become valid, script-free, animated SVG.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderScene, PRESETS } from '../demo/readme/engine.js'

test('every preset renders a script-free animated SVG', () => {
  for (const [name, scene] of Object.entries(PRESETS)) {
    const svg = renderScene(scene)
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, name)
    assert.doesNotMatch(svg, /<script|on[a-z]+="/i, `${name} must not contain JS`)
    assert.match(svg, /@keyframes/, name)
    assert.equal((svg.match(/<svg/g) ?? []).length - 1 >= scene.cast.length, true, `${name} draws every character`)
    assert.ok(svg.length < 450_000, `${name} is ${svg.length} bytes`)
  }
})

test('same scene → same file (stable diffs in repos)', () => {
  assert.equal(renderScene(PRESETS.Standup), renderScene(PRESETS.Standup))
})

test('bubbles, moods, cursor and themes', () => {
  const svg = renderScene({ theme: 'dark', cursor: true, cast: [{ style: 'bot', seed: 'a', name: 'A <b>' }, { style: 'buddy', seed: 'b' }], beats: [{ at: 1, for: 2, who: 0, do: 'say', text: 'hi & bye' }, { at: 3, for: 2, who: 1, do: 'mood', mood: 'love' }] })
  assert.match(svg, /hi &amp; bye/)
  assert.match(svg, /A &lt;b&gt;/) // names are escaped
  assert.match(svg, /class="cur"/)
  assert.equal((svg.match(/<svg/g) ?? []).length, 4) // file + 2 characters + 1 mood layer
  assert.doesNotMatch(svg, /prefers-color-scheme: dark\)\{\.bg/) // fixed dark theme, no media query
  assert.match(renderScene({ cast: [{ style: 'buddy', seed: 'x' }] }), /prefers-color-scheme: dark/)
  assert.doesNotMatch(renderScene({ theme: 'transparent', cast: [{ style: 'buddy', seed: 'x' }] }), /class="bg"/)
})

test('bad input does not throw', () => {
  assert.ok(renderScene({}))
  assert.ok(renderScene({ cast: [{ style: 'nope', seed: '' }], beats: [{ who: 9, do: 'say', text: 'x' }, { do: 'look', who: 0, target: 'left' }] }))
})

test('brand button row and preset groups', async () => {
  const { PRESET_GROUPS } = await import('../demo/readme/engine.js')
  const listed = Object.values(PRESET_GROUPS).flat()
  for (const k of Object.keys(PRESETS)) assert.ok(listed.includes(k), `preset ${k} is not in a group`)
  for (const k of listed) assert.ok(PRESETS[k], `group lists unknown preset ${k}`)
  const svg = renderScene({ cast: [{ style: 'buddy', seed: 'x' }], links: [{ icon: 'github', text: 'Follow' }, { icon: 'nope-not-real' }] })
  assert.match(svg, />Follow</)
  assert.equal((svg.match(/<rect[^>]*rx="21"/g) ?? []).length, 1) // unknown icons are skipped
})
