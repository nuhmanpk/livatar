#!/usr/bin/env node
// livatar CLI — render avatars to SVG from the terminal.
//   npx livatar ada --style animal --mood happy --size 128 > ada.svg
//   npx livatar --code lvAQQBAG51aG1hbnBr -o me.svg
//   npx livatar ada --style buddy --opt hair=afro --encode     # print a code
//   npx livatar --random --style animal                       # random avatar
//   npx livatar --list                                        # styles, options, moods, palettes
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

livatar skill [dir]      install the AI coding agent skill (default .claude/skills/livatar)`)
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
