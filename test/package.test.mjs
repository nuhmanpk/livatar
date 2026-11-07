// Checks what actually goes to npm, and that every public entry point loads.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const packed = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { encoding: 'utf8' }))[0]
const files = packed.files.map((f) => f.path)

test('npm tarball has only what the package needs', () => {
  for (const bad of [/^src\//, /^test\//, /^demo\//, /^scripts\//, /^assets\//, /^_site\//, /^node_modules\//, /\.map$/, /^tsconfig/, /^tsup/, /^ROADMAP/, /package-lock/]) {
    assert.ok(!files.some((f) => bad.test(f)), `should not ship ${bad}: ${files.filter((f) => bad.test(f)).join(', ')}`)
  }
  for (const need of ['package.json', 'README.md', 'LICENSE', 'bin/livatar.mjs', 'skills/livatar/SKILL.md', 'llms.txt', 'AGENTS.md']) assert.ok(files.includes(need), `missing ${need}`)
})

test('tarball stays small', () => {
  assert.ok(packed.size < 1_500_000, `packed size ${packed.size}`)
})

test('every export path points at a shipped file', () => {
  const targets = []
  const walk = (v) => (typeof v === 'string' ? targets.push(v.replace(/^\.\//, '')) : v && Object.values(v).forEach(walk))
  walk(pkg.exports)
  assert.ok(targets.length > 10)
  for (const t of targets) {
    assert.ok(existsSync(t), `export target missing on disk: ${t}`)
    if (t !== 'package.json') assert.ok(files.includes(t), `export target not in tarball: ${t}`)
  }
})

test('every entry loads in ESM and CJS', async () => {
  const require = createRequire(import.meta.url)
  // the browser <script> build (global IIFE) only sets window.livatar, so it has no module exports
  const entries = Object.keys(pkg.exports).filter((k) => k !== './package.json' && !JSON.stringify(pkg.exports[k]).includes('global'))
  for (const k of entries) {
    const spec = k === '.' ? 'livatar' : 'livatar/' + k.slice(2)
    const esm = await import(spec)
    assert.ok(Object.keys(esm).length > 0, `${spec} (esm) exports nothing`)
    const e = pkg.exports[k]
    if (e.require || e.default?.endsWith?.('.cjs')) assert.ok(Object.keys(require(spec)).length > 0, `${spec} (cjs) exports nothing`)
  }
})

test('client entries keep "use client" for Next.js', () => {
  for (const f of ['dist/react.js', 'dist/components.js']) assert.ok(readFileSync(f, 'utf8').startsWith('"use client"'), f)
})

test('CLI prints help and installs nothing by accident', () => {
  const out = execFileSync('node', ['bin/livatar.mjs', '--help'], { encoding: 'utf8' })
  assert.match(out, /livatar/i)
})

test('core has zero runtime dependencies', () => {
  assert.equal(Object.keys(pkg.dependencies ?? {}).length, 0)
})
