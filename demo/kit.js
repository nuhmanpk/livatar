// livatar site kit: vanilla versions of the livatar/components layout pieces, installed on every page.
//   footer · breadcrumbs · scroll progress + back-to-top · accordions
// Exports small builders (card, carousel, list, table, accordion, copy) the home page uses too.
let lib
for (const p of ['./dist/index.js', '../dist/index.js', '../../dist/index.js']) {
  try { lib = await import(new URL(p, import.meta.url).href); break } catch {}
}
const { mount } = lib || {}
const root = document.documentElement
const SITE = new URL(/\/(docs|icons|life|components|characters|readme)\/?$/.test(location.pathname.replace(/index\.html$/, '')) ? '../' : './', location.href)
const url = (p) => new URL(p, SITE).href
const el = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v
    else if (k === 'text') e.textContent = v
    else if (k === 'html') e.innerHTML = v
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v)
    else if (v != null && v !== false) e.setAttribute(k, v === true ? '' : v)
  }
  e.append(...kids)
  return e
}
const face = (parent, seed, size = 32, opts = {}) => {
  const d = el('span', { class: 'kit-face' }); d.style.cssText = `display:inline-block;width:${size}px;height:${size}px;line-height:0;flex:none`
  parent.append(d)
  return lib ? mount(d, lib.styles[opts.style || 'buddy'], { seed, mood: opts.mood, title: opts.title ?? '', ...opts.mountOpts }) : null
}

const css = `
.kit-bar{position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,#7f5af0,#ff6b9a);z-index:200;transition:width .08s linear}
.kit-top{position:fixed;right:16px;bottom:16px;width:48px;height:48px;padding:0;border-radius:50%;border:1px solid var(--line,#ece6dc);background:var(--card,#fff);cursor:pointer;z-index:60;display:grid;place-items:center;box-shadow:0 8px 24px rgba(20,10,40,.15);opacity:0;transform:translateY(16px) scale(.8);pointer-events:none;transition:opacity .25s,transform .3s cubic-bezier(.4,1.6,.4,1)}
.kit-top.show{opacity:1;transform:none;pointer-events:auto}
.kit-crumbs{max-width:1260px;margin:0 auto;padding:10px 16px 0}
.kit-crumbs ol{display:flex;align-items:center;gap:8px;list-style:none;margin:0;padding:0;font-size:14px;color:var(--muted,#6b6478);flex-wrap:wrap}
.kit-crumbs a{color:inherit}.kit-crumbs [aria-current]{color:var(--fg,#1f1a2e);font-weight:600}
/* footer */
.kit-foot{display:block!important;position:relative;overflow:hidden;margin-top:96px;padding:48px 16px 0;border-top:1px solid var(--line,#ece6dc);color:var(--fg,#1f1a2e)}
.kit-foot .in{max-width:1260px;margin:0 auto;display:flex;justify-content:space-between;gap:40px;flex-wrap:wrap}
.kit-foot .brand2{display:flex;align-items:center;gap:8px;font-weight:700;font-size:15px}
.kit-foot .tag{color:var(--muted,#6b6478);margin:14px 0 0;max-width:300px;line-height:1.5}
.kit-foot .faces{display:flex;margin-top:16px}.kit-foot .faces .kit-face{margin-left:-8px;border-radius:50%;box-shadow:0 0 0 2px var(--bg,#fbf8f3)}.kit-foot .faces .kit-face:first-child{margin-left:0}
.kit-foot .cols{display:flex;gap:56px;flex-wrap:wrap}
.kit-foot h3{margin:0 0 12px;font-size:14px}
.kit-foot ul{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.kit-foot li a{color:var(--muted,#6b6478);text-decoration:none;font-size:14px}.kit-foot li a:hover{color:var(--fg,#1f1a2e)}
.kit-foot .social{display:flex;gap:10px;margin-top:16px}
.kit-foot .word{font-size:clamp(90px,24vw,320px);font-weight:800;line-height:.8;letter-spacing:-.05em;text-align:center;opacity:.07;margin-top:40px;margin-bottom:-.02em;white-space:nowrap;user-select:none;max-height:.6em;overflow:hidden;pointer-events:none}
.kit-foot canvas.word{display:block;width:100%;margin:40px 0 0;opacity:.9;max-height:none;pointer-events:none;user-select:none}
.kit-foot .legal{position:relative;z-index:1;margin:0 -16px;padding:14px 16px 16px;border-top:1px solid color-mix(in srgb,var(--line,#ece6dc) 60%,transparent);font-size:13px;color:var(--muted,#6b6478);opacity:.7;display:flex;gap:6px 16px;flex-wrap:wrap;justify-content:space-between;align-items:center;background:color-mix(in srgb,var(--bg,#fbf8f3) 85%,transparent)}
.kit-foot .legal>*{max-width:1260px}
.kit-foot .legal{padding-right:88px}
.kit-foot .legal a{color:inherit}
@media(max-width:640px){
.kit-foot{margin-top:64px;padding-top:36px}
.kit-foot .in{gap:28px}.kit-foot .cols{gap:28px 36px;width:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
.kit-foot .legal{flex-direction:column;align-items:flex-start;gap:2px}
.kit-top{right:12px;bottom:12px;width:44px;height:44px}
.kit-crumbs{padding-top:8px}
.kit-car .sl{flex-direction:column;text-align:center;padding:22px 16px;min-height:0}.kit-car .sl blockquote{font-size:16px}
.kit-car .ctl .d{display:none}
.kit-cards{grid-template-columns:1fr}
}
/* accordion */
details.faq,details.kit-acc{border-bottom:1px solid var(--line,#ece6dc);padding:4px 0}
details.kit-acc>summary,details.faq>summary{display:flex;align-items:center;gap:10px;cursor:pointer;list-style:none;font-weight:600;padding:8px 0}
details.kit-acc>summary::-webkit-details-marker,details.faq>summary::-webkit-details-marker{display:none}
details.kit-acc>summary::after,details.faq>summary::after{content:'+';margin-left:auto;font-size:20px;color:var(--muted,#6b6478);transition:transform .25s}
details.kit-acc[open]>summary::after,details.faq[open]>summary::after{transform:rotate(45deg)}
details.kit-acc>p,details.kit-acc>div{margin:0 0 10px 38px;color:var(--muted,#6b6478)}
/* cards, carousel, list, table */
.kit-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin:18px 0}
.kit-card{display:block;padding:18px;border-radius:20px;border:1px solid var(--line,#ece6dc);background:var(--card,#fff);color:inherit;text-decoration:none;transition:transform .2s,box-shadow .2s}
.kit-card:hover{transform:translateY(-3px);box-shadow:0 14px 32px rgba(20,10,40,.1)}
.kit-card .h{display:flex;align-items:center;gap:12px;margin-bottom:8px;font-weight:700}
.kit-card p{margin:0;color:var(--muted,#6b6478);font-size:14px}
.kit-car{margin:18px 0}
.kit-car .tr{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;border-radius:20px}
.kit-car .tr::-webkit-scrollbar{display:none}
.kit-car .sl{flex:0 0 100%;scroll-snap-align:center;padding:28px 20px;box-sizing:border-box;display:flex;gap:20px;align-items:center;background:var(--card,#fff);border:1px solid var(--line,#ece6dc);border-radius:20px;min-height:170px}
.kit-car .sl blockquote{margin:0;font-size:18px;line-height:1.45}.kit-car .sl cite{display:block;margin-top:8px;font-size:14px;color:var(--muted,#6b6478);font-style:normal}
.kit-car .ctl{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:12px}
.kit-car .ctl button{border:1px solid var(--line,#ece6dc);background:transparent;color:inherit;border-radius:50%;width:34px;height:34px;padding:0;cursor:pointer}
.kit-car .ctl .d{width:8px;height:8px;padding:0;border-radius:8px;border:0;background:currentColor;opacity:.25;transition:width .2s}
.kit-car .ctl .d.on{width:22px;opacity:.9}
.kit-list{list-style:none;margin:12px 0;padding:0}
.kit-list li{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--line,#ece6dc)}
.kit-list b{display:block}.kit-list span{color:var(--muted,#6b6478);font-size:14px}
.kit-tw{overflow-x:auto;border:1px solid var(--line,#ece6dc);border-radius:14px;margin:14px 0;background:var(--card,#fff)}
.kit-tw table{width:100%;border-collapse:collapse;font-size:14px}.kit-tw th,.kit-tw td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--line,#ece6dc)}
.kit-tw th{background:var(--soft,#f3eee6)}.kit-tw tr:last-child td{border-bottom:0}
`
document.head.append(el('style', { text: css }))

/* ---------- scroll: progress bar + back to top ---------- */
{
  const bar = el('div', { class: 'kit-bar', role: 'progressbar', 'aria-label': 'Reading progress' })
  const top = el('button', { class: 'kit-top', type: 'button', 'aria-label': 'Back to top' })
  document.body.append(bar, top)
  const f = face(top, 'top', 40, { mood: 'happy' })
  top.onclick = () => { scrollTo({ top: 0, behavior: 'smooth' }); f?.emote('love', 900) }
  const on = () => {
    const d = root, max = d.scrollHeight - d.clientHeight, p = max > 0 ? d.scrollTop / max : 0
    bar.style.width = p * 100 + '%'; bar.setAttribute('aria-valuenow', Math.round(p * 100))
    top.classList.toggle('show', p > 0.06)
  }
  addEventListener('scroll', on, { passive: true }); on()
}

/* ---------- breadcrumbs (every page except home) ---------- */
{
  const seg = location.pathname.replace(/index\.html$/, '').split('/').filter(Boolean)
  const page = ['docs', 'icons', 'life', 'components', 'characters', 'readme'].find((p) => seg.includes(p))
  const header = document.querySelector('header')
  if (page && header) {
    const titles = { docs: 'Docs', icons: 'Icons', life: 'Life', components: 'Components', characters: 'Characters', readme: 'README studio' }
    const nav = el('nav', { class: 'kit-crumbs', 'aria-label': 'Breadcrumb' })
    const ol = el('ol'); nav.append(ol)
    const li = (child, cur) => { const l = el('li', cur ? { 'aria-current': 'page' } : {}); l.append(child); ol.append(l) }
    const home = el('span'); face(home, 'crumb', 22); li(home)
    li(el('span', { 'aria-hidden': true, text: '/' }))
    li(el('a', { href: url('./'), text: 'livatar' }))
    li(el('span', { 'aria-hidden': true, text: '/' }))
    const hash = decodeURIComponent(location.hash).startsWith('#@') ? '' : location.hash.slice(1)
    li(el('span', { text: titles[page] }), !hash)
    header.after(nav)
  }
}


/* ---------- footer wordmark: a mosaic of tiny faces inside the letters ---------- */
async function drawWordmark(cv, foot) {
  if (!lib) return
  const names = Object.keys(lib.styles).filter((n) => n !== 'initials')
  const moods = ['happy', 'neutral', 'wink', 'love', 'surprised', 'silly']
  // a palette of 48 distinct little faces, rendered once to bitmaps
  const imgs = await Promise.all(Array.from({ length: 48 }, (_, i) => new Promise((res) => {
    const svg = lib.createAvatar(lib.styles[names[i % names.length]], { seed: 'wm-' + i, mood: moods[i % moods.length], size: 48 })
    const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null)
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.includes('xmlns') ? svg : svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'))
  })))
  const tiles = imgs.filter(Boolean); if (!tiles.length) return
  let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
  const MAXK = 2.8 // biggest magnification
  let W = 0, H = 0, fs = 0, cell = 0, dpr = 1, grid = [], sprites = [], base = null, mask = null, mx = -1e4, my = -1e4, raf = 0, prev = null
  const off = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c }
  // everything expensive happens here, once per size: faces → bitmaps, letters → a mask, the still mosaic → a cached layer
  const layout = () => {
    W = Math.max(320, foot.clientWidth - 32); fs = Math.min(320, Math.max(90, innerWidth * 0.24)); H = Math.round(fs * 0.86)
    dpr = Math.min(2, devicePixelRatio || 1)
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.height = H + 'px'; cv.style.maxWidth = W + 'px'; cv.style.margin = '40px auto 0'
    cell = Math.max(9, fs / 24); seed = 7; grid = []
    const px = Math.ceil(cell * MAXK * dpr)
    sprites = tiles.map((im) => { const c = off(px, px); c.getContext('2d').drawImage(im, 0, 0, px, px); return c })
    for (let y = -cell; y < H + cell; y += cell * 0.86) {
      const o = Math.round(y / (cell * 0.86)) % 2 ? cell / 2 : 0
      for (let x = -cell; x < W + cell; x += cell) grid.push([x + o + cell / 2, y + cell / 2, sprites[Math.floor(rnd() * sprites.length)]])
    }
    mask = off(W * dpr, H * dpr)
    const m = mask.getContext('2d'); m.scale(dpr, dpr)
    m.fillStyle = '#000'; m.textAlign = 'center'; m.textBaseline = 'alphabetic'
    m.font = `800 ${fs}px ${getComputedStyle(foot).fontFamily}`
    if ('letterSpacing' in m) m.letterSpacing = -0.05 * fs + 'px'
    m.fillText('livatar', W / 2, H * 0.97)
    base = off(W * dpr, H * dpr)
    const b = base.getContext('2d'); b.scale(dpr, dpr)
    for (const [cx, cy, sp] of grid) b.drawImage(sp, cx - cell / 2, cy - cell / 2, cell, cell)
    b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'destination-in'; b.drawImage(mask, 0, 0)
    const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.drawImage(base, 0, 0)
    prev = null
  }
  // per mouse move: repaint only the small patch around the cursor (old patch + new patch), ~40 faces instead of ~1500
  const R = () => cell * 7
  const paint = () => {
    raf = 0
    const g = cv.getContext('2d')
    const cur = mx > -1e3 ? [mx - R(), my - R(), 2 * R(), 2 * R()] : null
    const rects = [prev, cur].filter(Boolean)
    if (!rects.length) return
    const x0 = Math.max(0, Math.min(...rects.map((r) => r[0]))), y0 = Math.max(0, Math.min(...rects.map((r) => r[1])))
    const x1 = Math.min(W, Math.max(...rects.map((r) => r[0] + r[2]))), y1 = Math.min(H, Math.max(...rects.map((r) => r[1] + r[3])))
    if (x1 <= x0 || y1 <= y0) { prev = cur; return }
    g.save()
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip()
    g.clearRect(x0, y0, x1 - x0, y1 - y0)
    g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(base, 0, 0); g.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (cur) {
      const r2 = (cell * 3) ** 2, big = []
      for (const [cx, cy, sp] of grid) {
        if (cx < x0 - cell || cx > x1 + cell || cy < y0 - cell || cy > y1 + cell) continue
        const d2 = (cx - mx) ** 2 + (cy - my) ** 2
        if (d2 < r2 * 4) { const k = 1 + (MAXK - 1) * Math.exp(-d2 / r2); if (k > 1.05) big.push([cx, cy, sp, k]) }
      }
      big.sort((p, q) => p[3] - q[3])
      for (const [cx, cy, sp, k] of big) { const sz = cell * k; g.drawImage(sp, cx - sz / 2, cy - sz / 2, sz, sz) }
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'destination-in'; g.drawImage(mask, 0, 0)
    }
    g.restore()
    prev = cur
  }
  const queue = () => { if (!raf) raf = requestAnimationFrame(paint) }
  if (!calm) {
    foot.addEventListener('pointermove', (e) => { const b = cv.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; queue() }, { passive: true })
    foot.addEventListener('pointerleave', () => { mx = my = -1e4; queue() })
  }
  layout()
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(layout, 200) })
  document.fonts?.ready.then(layout)
}

/* ---------- footer ---------- */
{
  const old = [...document.querySelectorAll('body > footer, main > footer, .layout ~ footer, footer.site-foot')]
  const foot = el('footer', { class: 'kit-foot' })
  const mk = (t, links) => el('div', {}, el('h3', { text: t }), el('ul', {}, ...links.map(([l, h]) => el('li', {}, el('a', { href: h, text: l, ...(h.startsWith('http') ? { rel: 'noopener' } : {}) })))))
  const brand = el('div', {}, el('div', { class: 'brand2' }, el('span', { class: 'bl' }), 'livatar'), el('p', { class: 'tag', text: 'Tiny, zero-dependency SVG avatars that are alive. Same seed, same face.' }), el('div', { class: 'faces' }))
  const cols = el('div', { class: 'cols' },
    mk('Explore', [['Characters', url('characters/')], ['Docs', url('docs/')], ['Components', url('components/')], ['Icons', url('icons/')], ['Life', url('life/')]]),
    mk('Build', [['Builder', url('docs/#builder')], ['README studio', url('readme/')], ['llms.txt', url('llms.txt')], ['Agent skill', url('SKILL.md')]]),
    mk('Project', [['GitHub', 'https://github.com/nuhmanpk/livatar'], ['npm', 'https://www.npmjs.com/package/livatar'], ['Sponsor', 'https://github.com/sponsors/nuhmanpk'], ['MIT license', 'https://github.com/nuhmanpk/livatar/blob/main/LICENSE']]))
  // the wordmark is a static mosaic: thousands of tiny livatar faces fill the letters (drawn once on a canvas)
  const wordmark = el('canvas', { class: 'word', 'aria-hidden': true })
  foot.append(el('div', { class: 'in' }, brand, cols), wordmark, el('div', { class: 'legal' }, el('span', { html: 'MIT · made by <a href="https://github.com/nuhmanpk">@nuhmanpk</a>' }), el('span', { text: 'Built with livatar/components' })))
  document.body.append(foot)
  drawWordmark(wordmark, foot)
  old.forEach((o) => o.remove())
  face(brand.querySelector('.bl'), 'livatar', 28, { mood: 'happy' })
  ;['ada', 'bo', 'cy', 'di', 'ed'].forEach((s, i) => face(brand.querySelector('.faces'), s, 34, { style: ['buddy', 'animal', 'bot', 'ghost', 'emoji'][i] }))
}

/* ---------- builders used by pages ---------- */
export const card = (title, text, seed, { href, style, mood } = {}) => {
  const c = el(href ? 'a' : 'div', { class: 'kit-card', ...(href ? { href } : {}) })
  const head = el('div', { class: 'h' }); const f = face(head, seed, 44, { style, mood }); head.append(title)
  c.append(head, el('p', { text })); c.addEventListener('pointerenter', () => f?.emote('happy', 1100)); return c
}
export const cards = (items) => el('div', { class: 'kit-cards' }, ...items.map((i) => card(i.title, i.text, i.seed, i)))
export const accordion = (items, { exclusive = true } = {}) => {
  const box = el('div')
  items.forEach((it, i) => {
    const d = el('details', { class: 'kit-acc', ...(exclusive ? { name: 'kit-acc' } : {}) })
    const s = el('summary'); const fh = face(s, it.seed || it.q, 28, { style: it.style }); s.append(it.q)
    d.append(s, el('p', { text: it.a }))
    d.addEventListener('toggle', () => fh?.setMood?.(d.open ? 'happy' : 'neutral'))
    box.append(d)
  })
  return box
}
export const list = (items) => el('ul', { class: 'kit-list' }, ...items.map((it) => { const li = el('li'); face(li, it.seed || it.title, 40, { style: it.style }); li.append(el('div', {}, el('b', { text: it.title }), el('span', { text: it.text || '' }))); return li }))
// rows: [seed, ...cells]. The seed picks the avatar in the first column and is not shown as a cell.
export const table = (cols, rows) => {
  const t = el('table', {}, el('thead', {}, el('tr', {}, el('th', { 'aria-label': 'Avatar' }), ...cols.map((c) => el('th', { scope: 'col', text: c })))), el('tbody'))
  rows.forEach((r) => { const tr = el('tr'); const td = el('td'); face(td, r[0], 32, { style: r.style }); tr.append(td, ...r.slice(1).map((c) => el('td', { text: c }))); t.tBodies[0].append(tr) })
  return el('div', { class: 'kit-tw' }, t)
}
export const carousel = (slides, { autoplay = 0 } = {}) => {
  const wrap = el('section', { class: 'kit-car', 'aria-roledescription': 'carousel', 'aria-label': 'Highlights' })
  const tr = el('div', { class: 'tr' }); const ctl = el('div', { class: 'ctl' })
  const mid = el('span'); const fh = face(mid, 'carousel', 32)
  let i = 0
  slides.forEach((s, k) => {
    const sl = el('div', { class: 'sl', role: 'group', 'aria-label': `${k + 1} of ${slides.length}` })
    face(sl, s.seed, 72, { style: s.style, mood: s.mood || 'happy', mountOpts: { alive: { intensity: 1.2 } } })
    sl.append(el('div', {}, el('blockquote', { text: s.quote }), el('cite', { text: s.by }))); tr.append(sl)
  })
  const go = (n) => { i = (n + slides.length) % slides.length; tr.scrollTo({ left: i * tr.clientWidth, behavior: 'smooth' }); fh?.nod?.() }
  const prev = el('button', { type: 'button', 'aria-label': 'Previous', text: '‹', onclick: () => go(i - 1) })
  const next = el('button', { type: 'button', 'aria-label': 'Next', text: '›', onclick: () => go(i + 1) })
  const dots = slides.map((_, k) => el('button', { type: 'button', class: 'd', 'aria-label': `Slide ${k + 1}`, onclick: () => go(k) }))
  ctl.append(prev, mid, ...dots, next)
  const mark = () => dots.forEach((d, k) => d.classList.toggle('on', k === i))
  tr.addEventListener('scroll', () => { i = Math.round(tr.scrollLeft / tr.clientWidth); mark() }, { passive: true }); mark()
  if (autoplay) setInterval(() => !wrap.matches(':hover') && go(i + 1), autoplay)
  wrap.append(tr, ctl); return wrap
}
export const copy = (text, label = 'Copy') => {
  const b = el('button', { type: 'button', class: 'ghost', style: 'display:inline-flex;align-items:center;gap:8px;padding:6px 12px 6px 6px;border-radius:99px', 'aria-live': 'polite' })
  const f = face(b, 'copy', 26); const t = el('span', { text: label }); b.append(t)
  b.onclick = async () => { try { await navigator.clipboard.writeText(text); t.textContent = 'Copied!'; f?.emote('wink', 1200); setTimeout(() => (t.textContent = label), 1400) } catch { f?.emote('sad', 900) } }
  return b
}
window.livatarKit = { card, cards, accordion, list, table, carousel, copy, face }
document.dispatchEvent(new Event('livatar:kit'))
