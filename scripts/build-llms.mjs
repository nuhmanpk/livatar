// Writes llms-full.txt at the repo root (served at <site>/llms-full.txt, shipped on npm).
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
const r = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url))
const { styles, MOODS, palettes } = await import('../dist/index.js')
const ref = Object.entries(styles).map(([n, st]) => `### ${n}\n` + Object.entries(st.variants ?? {}).map(([k, v]) => `- ${k}: ${v.map(String).join(', ')}`).join('\n')).join('\n\n')
await writeFile(r('llms-full.txt'),
  (await readFile(r('llms.txt'), 'utf8')) +
  `\n\n## Generated reference (from the built package)\n\nMoods: ${MOODS.join(', ')}\nPalettes: ${Object.keys(palettes).join(', ')}\n\n${ref}\n\n## README\n\n` +
  (await readFile(r('README.md'), 'utf8')).replace(/<[^>]+>/g, ''))
console.log('llms-full.txt written')
