// Builds figma-plugin/ui.html by inlining dist/livatar.global.js (the plugin makes no network requests).
import { readFile, writeFile } from 'node:fs/promises'
const r = (p) => new URL('../' + p, import.meta.url)
const lib = (await readFile(r('dist/livatar.global.js'), 'utf8')).replace(/<\/script/gi, '<\\/script')
const html = (await readFile(r('figma-plugin/ui.template.html'), 'utf8')).replace('/*LIVATAR*/', () => lib)
await writeFile(r('figma-plugin/ui.html'), html)
console.log('figma-plugin/ui.html written (' + Math.round(html.length / 1024) + ' KB)')
