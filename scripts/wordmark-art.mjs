// Builds assets/wordmark.svg: the word "livatar" filled with a mosaic of ~1000 livatar faces.
//   node scripts/wordmark-art.mjs        (needs `npm run build` first; outlines come from scripts/wordmark-path.json)
//
// Responsive (viewBox, no fixed size), transparent (works on light and dark READMEs), no fonts or scripts
// (GitHub and npm render it as an <img>). A soft light sweeps across the faces like a passing cursor, and
// when the file is opened directly in a browser, faces under the real mouse pop up (CSS :hover).
import { readFile, writeFile } from 'node:fs/promises'
import { createAvatar, styles } from '../dist/index.js'

const r = (p) => new URL('../' + p, import.meta.url)
const G = JSON.parse(await readFile(r('scripts/wordmark-path.json'), 'utf8'))
const upem = G.upem
const track = -0.05 * upem

// 1) a palette of distinct little faces, each a <symbol> with its own id prefix (no clashes)
const names = Object.keys(styles).filter((n) => n !== 'initials')
const moods = ['happy', 'neutral', 'wink', 'love', 'surprised', 'silly']
const prefixIds = (svg, p) => svg.replace(/\bid="([^"]+)"/g, `id="${p}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`).replace(/href="#([^"]+)"/g, `href="#${p}$1"`)
const N = 28
const symbols = Array.from({ length: N }, (_, i) => {
  const svg = createAvatar(styles[names[i % names.length]], { seed: 'wordmark-' + i, mood: moods[i % moods.length], size: 100 })
  const inner = prefixIds(svg, `f${i}-`).replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
  return `<symbol id="f${i}" viewBox="0 0 100 100">${inner}</symbol>`
})
// the face that dots the i
symbols.push(`<symbol id="fd" viewBox="0 0 100 100">${prefixIds(createAvatar(styles.buddy, { seed: 'livatar', mood: 'happy', size: 100 }), 'fd-').replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')}</symbol>`)

// 2) letters as one clip path; the i's dot becomes one bigger face
const glyphs = G.glyphs.map((g) => `<path d="${g.d}"/>`).join('')
const iGlyph = G.glyphs.find((g) => g.ch === 'i')
const next = G.glyphs[G.glyphs.indexOf(iGlyph) + 1]
const iCenter = iGlyph.x + (next.x - iGlyph.x - track) / 2
const dotR = upem * 0.105, dotY = -upem * 0.7
const top = -upem * 0.82, bottom = upem * 0.02, left = -upem * 0.03, right = G.width + upem * 0.03
const W = right - left, H = bottom - top

// 3) tiles: a staggered grid, only where letters can be (x-height letters start lower)
const tall = new Set(['l', 'i', 't'])
const xh = -upem * 0.56, cap = -upem * 0.74
let seed = 11
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
const cell = upem * 0.052
const uses = []
for (let row = 0, y = top; y < bottom; y += cell * 0.88, row++) {
  for (let x = left + (row % 2 ? cell / 2 : 0); x < right; x += cell) {
    const g = G.glyphs.find((gl, k) => x + cell > gl.x && x < (G.glyphs[k + 1]?.x ?? right))
    if (!g || y + cell < (tall.has(g.ch) ? cap : xh)) continue
    uses.push(`<use href="#f${Math.floor(rnd() * N)}" x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${cell.toFixed(0)}" height="${cell.toFixed(0)}"/>`)
  }
}

const css = `
.m use{transform-box:fill-box;transform-origin:center;transition:transform .25s cubic-bezier(.3,1.6,.5,1)}
.m use:hover{transform:scale(1.9)}
.dot{transform-box:fill-box;transform-origin:center;animation:bob 3.2s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(-6%) rotate(-6deg)}}
@media (prefers-reduced-motion:reduce){.dot,.spot{animation:none!important}.spot{display:none}}`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left.toFixed(0)} ${top.toFixed(0)} ${W.toFixed(0)} ${H.toFixed(0)}" role="img" aria-labelledby="t">
<title id="t">livatar, written in a mosaic of ${uses.length} tiny livatar faces</title>
<style>${css}</style>
<defs>${symbols.join('')}
<clipPath id="letters">${glyphs}</clipPath>
<radialGradient id="spotg"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".55" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs>
<g clip-path="url(#letters)">
<g class="m">${uses.join('')}</g>
<circle class="spot" r="${(upem * 0.5).toFixed(0)}" cx="0" cy="${(-upem * 0.4).toFixed(0)}" fill="url(#spotg)" pointer-events="none">
<animate attributeName="cx" values="${left.toFixed(0)};${right.toFixed(0)};${left.toFixed(0)}" dur="14s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>
<animate attributeName="cy" values="${(-upem * 0.2).toFixed(0)};${(-upem * 0.65).toFixed(0)};${(-upem * 0.2).toFixed(0)}" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>
</circle>
</g>
<use class="dot" href="#fd" x="${(iCenter - dotR).toFixed(0)}" y="${(dotY - dotR).toFixed(0)}" width="${(dotR * 2).toFixed(0)}" height="${(dotR * 2).toFixed(0)}"/>
</svg>
`
await writeFile(r('assets/wordmark.svg'), svg)
console.log(`assets/wordmark.svg: ${uses.length} faces, ${Math.round(svg.length / 1024)} KB`)
