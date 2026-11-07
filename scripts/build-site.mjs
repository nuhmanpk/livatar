// Assemble the static GitHub Pages site into _site/ (run after `npm run build`).
//   /            homepage (demo/index.html)
//   /docs/       documentation
//   /icons/      animated icons, plus /icons/svg/<name>-<animation>[-tile].svg hosted files for READMEs
//   /dist/       the library build the pages import
// Every path is relative, so it works under https://<user>.github.io/<repo>/ and at a domain root.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ANIMATIONS, ICONS, icon, badge } from '../dist/icons.js'

const r = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url))
const out = r('_site')

await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })
await cp(r('dist'), `${out}/dist`, { recursive: true })
await cp(r('demo/favicon.svg'), `${out}/favicon.svg`)
await cp(r('llms.txt'), `${out}/llms.txt`)
await cp(r('skills/livatar/SKILL.md'), `${out}/SKILL.md`)
await cp(r('demo/ui.js'), `${out}/ui.js`)

// pages live one level higher on the site than in demo/: drop one '../' from links to dist/ and llms.txt
const shift = (src) => src.replace(/(["'(])((?:\.\.\/)+)(dist\/|llms\.txt)/g, (_m, q, ups, t) => `${q}${ups.slice(3) || './'}${t}`)
// pages live one level higher on the site than in demo/, so their dist paths get one '../' shorter
const page = async (from, to) => {
  if (!existsSync(r(from))) return console.warn(`skip ${from} (missing)`)
  const html = shift(await readFile(r(from), 'utf8'))
  await mkdir(`${out}/${to}`, { recursive: true })
  await writeFile(`${out}/${to}/index.html`.replace('//', '/'), html)
}
await page('demo/index.html', '')
await page('demo/docs/index.html', 'docs')
await page('demo/icons/index.html', 'icons')
for (const extra of ['docs/docs.css', 'docs/docs.js']) if (existsSync(r(`demo/${extra}`))) await writeFile(`${out}/${extra}`, shift(await readFile(r(`demo/${extra}`), 'utf8')))

// hosted icon files: every icon × animation × tile (brand color, looping)
await mkdir(`${out}/icons/svg`, { recursive: true })
await mkdir(`${out}/icons/badge`, { recursive: true })
let n = 0
for (const name of Object.keys(ICONS)) {
  for (const animation of ANIMATIONS)
    for (const tile of ['none', 'circle', 'rounded']) {
      await writeFile(`${out}/icons/svg/${name}-${animation}${tile === 'none' ? '' : '-' + tile}.svg`, icon(name, { animation, tile, size: 32 }))
      n++
    }
  for (const theme of ['brand', 'dark', 'light']) await writeFile(`${out}/icons/badge/${name}-${theme}.svg`, badge(name, ICONS[name][0], { theme }))
}

await writeFile(
  `${out}/404.html`,
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found · livatar</title>
<link rel="icon" href="/livatar/favicon.svg"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px system-ui,sans-serif;background:#fbf8f3;color:#1f1a2e;text-align:center}a{color:#7f5af0}</style>
<div><div id="a" style="width:120px;margin:0 auto"></div><h1>Lost?</h1><p>This page doesn't exist. <a id="home" href="/livatar/">Go home</a></p></div>
<script type="module">
  // works at any base path: find the site root from this script's location
  const base = location.pathname.split('/').filter(Boolean)[0]
  const root = location.hostname.endsWith('github.io') && base ? '/' + base + '/' : '/'
  document.getElementById('home').href = root
  const { mountCode } = await import(root + 'dist/index.js')
  mountCode(document.getElementById('a'), { style: 'animal', seed: 'lost', mood: 'confused', options: { species: 'owl' } })
</script>\n`,
)
// ---- discoverability for LLMs, agents, and search engines ----
const SITE = 'https://nuhmanpk.github.io/livatar/'
const { styles, MOODS, palettes } = await import('../dist/index.js')
await import('./build-llms.mjs')
await cp(r('llms-full.txt'), `${out}/llms-full.txt`)
await writeFile(`${out}/robots.txt`, `User-agent: *\nAllow: /\n\n# AI crawlers and coding agents are welcome\nUser-agent: GPTBot\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n# LLM docs: ${SITE}llms.txt and ${SITE}llms-full.txt\n`)
await writeFile(`${out}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['', 'docs/', 'icons/', 'llms.txt', 'llms-full.txt'].map((p) => `<url><loc>${SITE}${p}</loc></url>`).join('')}</urlset>\n`)
await writeFile(`${out}/.nojekyll`, '')
console.log(`site → _site/ (${n} hosted icons)`)
