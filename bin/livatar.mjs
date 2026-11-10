#!/usr/bin/env node
// livatar CLI — render avatars to SVG from the terminal.
//   npx livatar ada --style animal --mood happy --size 128 > ada.svg
//   npx livatar --code lvAQQBAG51aG1hbnBr -o me.svg
//   npx livatar ada --style buddy --opt hair=afro --encode     # print a code
//   npx livatar --random --style animal                       # random avatar
//   npx livatar --list                                        # styles, options, moods, palettes
//   npx livatar api [port]                                    # run your own avatar API (http://localhost:8787/animal/ada.svg)
//   npx livatar components                                    # list the React components
//   npx livatar add skeleton [dir]                            # scaffold an editable wrapper (default components/livatar)
//   npx livatar skill [dir]                                   # install the AI agent skill (default .claude/skills/livatar)
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MOODS, encode, palettes, randomConfig, render, styles } from '../dist/index.js'

const argv = process.argv.slice(2)

// `livatar skill [dir]`: drop the agent skill where Claude Code (and similar agents) look for it
if (argv[0] === 'skill') {
  const dir = argv[1] ?? join('.claude', 'skills', 'livatar')
  mkdirSync(dir, { recursive: true })
  copyFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'livatar', 'SKILL.md'), join(dir, 'SKILL.md'))
  console.log(`livatar skill → ${join(dir, 'SKILL.md')}\nYour coding agent now knows livatar. Docs for any agent: https://nuhmanpk.github.io/livatar/llms-full.txt`)
  process.exit(0)
}

// `livatar api [port]`: a zero-config avatar API on Node (same URLs as livatar/server)
if (argv[0] === 'api') {
  const { avatarHandler } = await import('../dist/server.js')
  const { createServer } = await import('node:http')
  const port = Number(argv[1] ?? process.env.PORT ?? 8787)
  const handle = avatarHandler()
  createServer(async (req, res) => {
    const r = handle(new Request(`http://localhost:${port}${req.url}`, { method: req.method }))
    res.writeHead(r.status, Object.fromEntries(r.headers))
    res.end(Buffer.from(await r.arrayBuffer()))
  }).listen(port, () => console.log(`livatar api → http://localhost:${port}/animal/ada.svg?mood=happy&size=128\n  /<style>/<seed>.svg?mood=&size=&palette=&<option>=   or   /<livatar code>.svg\n  Deploy anywhere with: export default { fetch: avatarHandler() }  (livatar/server)`))
  await new Promise(() => {})
}

// `livatar components` / `livatar add <name> [dir]`: shadcn-style scaffolding for the React components
if (argv[0] === 'components' || argv[0] === 'add') {
  const C = await import('../dist/components.js')
  const names = Object.keys(C).filter((k) => /^Livatar[A-Z]/.test(k))
  const short = (n) => n.replace(/^Livatar/, '').toLowerCase()
  if (argv[0] === 'components') { console.log(names.map((n) => `${short(n).padEnd(18)} ${n}`).join('\n')); process.exit(0) }
  const want = (argv[1] ?? '').toLowerCase().replace(/^livatar/, '').replace(/[-_ ]/g, '')
  const name = names.find((n) => short(n) === want)
  if (!name) { console.error(`livatar add: unknown component "${argv[1] ?? ''}". Run: npx livatar components`); process.exit(1) }
  const dir = argv[2] ?? join('components', 'livatar')
  mkdirSync(dir, { recursive: true })
  const file = join(dir, `${short(name)}.tsx`)
  writeFileSync(file, `'use client'
// Scaffolded by \`npx livatar add ${short(name)}\`. This file is yours: set project defaults here.
import { ${name} as Base } from 'livatar/components'
import type { ComponentProps } from 'react'

export type ${name.replace('Livatar', '')}Props = ComponentProps<typeof Base>

export function ${name.replace('Livatar', '')}(props: ${name.replace('Livatar', '')}Props) {
  return <Base {...props} />
}
`)
  console.log(`livatar add → ${file}\nImport it from your own components. Docs: https://nuhmanpk.github.io/livatar/components/#${short(name)}`)
  process.exit(0)
}
const flags = {}
const pos = []
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (!a.startsWith('-')) pos.push(a)
  else {
    const [k, inline] = a.replace(/^--?/, '').split('=')
    const key = { s: 'style', m: 'mood', o: 'out', h: 'help' }[k] ?? k
    const bool = ['encode', 'random', 'list', 'help', 'flip', 'gradient', 'border', 'json'].includes(key)
    const v = inline ?? (bool ? true : argv[++i])
    if (key === 'opt') (flags.opt ??= []).push(v)
    else flags[key] = v
  }
}

if (flags.help) {
  console.log(`livatar [seed] [options]

  -s, --style <name>     ${Object.keys(styles).join(' | ')}
  -m, --mood <mood>      ${MOODS.join(' | ')}
      --size <px>        width/height (default: fluid 100%)
      --shape <shape>    circle | rounded | square
      --radius <0-50>    corner radius
      --palette <name>   ${Object.keys(palettes).join(' | ')}
      --background <c>   a color, or "none"
      --flip --gradient --border
      --opt key=value    style option (repeatable), e.g. --opt species=owl
      --code <code>      render a livatar code
      --random           random seed and options
      --encode           print the livatar code instead of SVG
      --json             print the config as JSON
  -o, --out <file>       write to a file instead of stdout
      --list             list styles, their options, moods, and palettes

livatar skill [dir]      install the AI coding agent skill (default .claude/skills/livatar)
livatar api [port]       run your own avatar API (default 8787)
livatar components       list the React components
livatar add <name> [dir] scaffold an editable wrapper (default components/livatar)`)
  process.exit(0)
}

if (flags.list) {
  for (const [name, s] of Object.entries(styles)) {
    console.log(`\n${name}`)
    for (const [k, v] of Object.entries(s.variants ?? {})) console.log(`  ${k}: ${v.join(', ')}`)
  }
  console.log(`\nmoods: ${MOODS.join(', ')}\npalettes: ${Object.keys(palettes).join(', ')}`)
  process.exit(0)
}

const parse = (v) => (v === 'true' ? true : v === 'false' ? false : /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v)
let cfg
try {
  cfg = flags.code
    ? flags.code
    : flags.random
      ? randomConfig(flags.style)
      : {
          style: flags.style ?? 'buddy',
          seed: pos[0] ?? 'livatar',
          mood: flags.mood,
          shape: flags.shape,
          radius: flags.radius != null ? Number(flags.radius) : undefined,
          palette: flags.palette,
          background: flags.background === 'none' ? false : flags.background,
          flip: flags.flip || undefined,
          gradient: flags.gradient || undefined,
          border: flags.border || undefined,
          options: Object.fromEntries((flags.opt ?? []).map((kv) => { const [k, ...v] = kv.split('='); return [k, parse(v.join('='))] })),
        }
  if (typeof cfg === 'object' && flags.mood) cfg.mood = flags.mood
  const out = flags.encode
    ? (typeof cfg === 'string' ? cfg : encode(cfg))
    : flags.json
      ? JSON.stringify(typeof cfg === 'string' ? (await import('../dist/index.js')).decode(cfg) : cfg, null, 2)
      : render(cfg, flags.size ? { size: Number(flags.size) } : {})
  if (flags.out) {
    writeFileSync(flags.out, out + '\n')
    console.error(`wrote ${flags.out}`)
  } else process.stdout.write(out + '\n')
} catch (e) {
  console.error(`livatar: ${e.message}`)
  process.exit(1)
}
