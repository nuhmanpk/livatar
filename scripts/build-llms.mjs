// Writes llms-full.txt at the repo root (served at <site>/llms-full.txt, shipped on npm).
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
const r = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url))
const { styles, MOODS, palettes } = await import('../dist/index.js')
const ref = Object.entries(styles).map(([n, st]) => `### ${n}\n` + Object.entries(st.variants ?? {}).map(([k, v]) => `- ${k}: ${v.map(String).join(', ')}`).join('\n')).join('\n\n')
await writeFile(r('llms-full.txt'),
  (await readFile(r('llms.txt'), 'utf8')) +
  `\n\n## Generated reference (from the built package)\n\nMoods: ${MOODS.join(', ')}\nPalettes: ${Object.keys(palettes).join(', ')}\n\n${ref}\n\n## README\n\n` +
  stripHtml(await readFile(r('README.md'), 'utf8')))
console.log('llms-full.txt written')

// Drop README HTML (hero images, wrappers) but keep <tags> inside code blocks and `inline code`.
function stripHtml(md) {
  return md.split(/(```[\s\S]*?```|`[^`\n]*`)/).map((part, i) => (i % 2 ? part : part.replace(/<[^>]+>/g, ''))).join('')
}
