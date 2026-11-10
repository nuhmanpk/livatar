import * as L from '../../dist/index.js'
import '../../dist/element.js'

const {
  mount, mountCode, createAvatar, styles, palettes, MOODS, encode, decode, isCode,
  randomConfig, alive, bindForm, bindInput, toImage, download, toDataUri,
} = L

const $ = (id) => document.getElementById(id)
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))
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
const box = (parent, width) => { const d = el('div'); if (width) d.style.width = width; parent.append(d); return d }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const PREF = ['human', 'buddy', 'memoji', 'clay', 'dev', 'animal', 'dino', 'alien', 'planet', 'food', 'plant', 'monster', 'ghost', 'emoji', 'initials', 'bot', 'blob', 'pixel']
// preferred order first, then any style added later (so docs never go stale)
const ORDER = [...PREF.filter((n) => styles[n]), ...Object.keys(styles).filter((n) => !PREF.includes(n))]
const NAMES = Object.keys(styles)
const fill = (sel, values, labels = values) => {
  sel.innerHTML = ''
  values.forEach((v, i) => sel.append(el('option', { value: v, text: labels[i] })))
}

/** Run `fn` once, when `node` gets near the viewport. */
const lazyIO = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { lazyIO.unobserve(e.target); const f = e.target.__lazy; e.target.__lazy = null; f?.() }
    }, { rootMargin: '300px 0px' })
  : null
const lazy = (node, fn) => { if (!lazyIO) return fn(); node.__lazy = fn; lazyIO.observe(node) }

/* ---------------- theme ---------------- */
$('theme').onclick = () => {
  const root = document.documentElement
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
  root.dataset.theme = dark ? 'light' : 'dark'
  try { localStorage.setItem('livatar-theme', root.dataset.theme) } catch {}
}

/* ---------------- code blocks ---------------- */
const KW = new Set('import from export const let var function return new await async if else for of in default type interface class extends static true false null undefined this typeof'.split(' '))
const escHtml = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
function highlight(src, lang) {
  if (lang === 'bash') {
    return src.split('\n').map((line) => {
      const i = line.search(/(^|\s)#/)
      return i < 0 ? escHtml(line) : escHtml(line.slice(0, i)) + `<span class="tok-c">${escHtml(line.slice(i))}</span>`
    }).join('\n')
  }
  const markup = /^(html|vue|svelte|astro)$/.test(lang)
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|\{\/\*[\s\S]*?\*\/\})|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|\b([A-Za-z_$][\w$]*)(?=\s*\()|\b([A-Za-z_]\w*)\b/g
  let out = '', last = 0, m
  while ((m = re.exec(src))) {
    out += escHtml(src.slice(last, m.index))
    last = re.lastIndex
    const [t, com, str, fn, word] = m
    // in markup, "//" inside text (e.g. URLs) is not a comment unless it starts a line of script
    if (com && markup && com.startsWith('//') && !/^\s*$/.test(src.slice(src.lastIndexOf('\n', m.index - 1) + 1, m.index))) { out += escHtml(t); continue }
    if (com && com.startsWith('//') && /:$/.test(src.slice(0, m.index))) { out += escHtml(t); continue } // http://
    if (com) out += `<span class="tok-c">${escHtml(t)}</span>`
    else if (str) out += `<span class="tok-s">${escHtml(t)}</span>`
    else if (fn) out += KW.has(fn) ? `<span class="tok-k">${fn}</span>` : `<span class="tok-f">${fn}</span>`
    else if (word && KW.has(word)) out += `<span class="tok-k">${word}</span>`
    else out += escHtml(t)
  }
  return out + escHtml(src.slice(last))
}
const dedent = (s) => {
  const lines = s.replace(/^\s*\n/, '').replace(/\s+$/, '').split('\n')
  const ind = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length))
  return lines.map((l) => l.slice(ind)).join('\n')
}
const snipText = (node) => dedent(node.textContent.replace(/<\\\/script/g, '</script'))

const COPY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>'
const DONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>'
const copyText = async (text) => {
  try { await navigator.clipboard.writeText(text); return true } catch { prompt('Copy:', text); return false }
}
function withCopy(pre) {
  const wrap = el('div', { class: 'pre-wrap' })
  pre.replaceWith(wrap); wrap.append(pre)
  const b = el('button', { type: 'button', class: 'copy-btn', title: 'Copy', 'aria-label': 'Copy code', html: COPY })
  b.onclick = async () => {
    if (await copyText(pre.textContent)) { b.innerHTML = DONE; setTimeout(() => (b.innerHTML = COPY), 1200) }
  }
  wrap.append(b)
  return wrap
}
function makePre(text, lang, file) {
  const code = el('code', { html: highlight(text, lang) })
  const pre = el('pre', { 'data-lang': lang, tabindex: '0' }, code)
  const frag = document.createDocumentFragment()
  if (file) frag.append(el('div', { class: 'pre-file', text: file }))
  const tmp = el('div'); tmp.append(pre); frag.append(tmp)
  withCopy(pre)
  tmp.replaceWith(...tmp.childNodes)
  return frag
}
const SRC = {}
for (const s of $$('script.snip')) {
  const text = snipText(s)
  if (s.id) SRC[s.id] = text
  s.replaceWith(makePre(text, s.dataset.lang || 'js', s.dataset.file))
}
// live-updated blocks: set text through setCode()
for (const pre of $$('pre[data-lang]')) if (!pre.parentElement.classList.contains('pre-wrap')) { pre.tabIndex = 0; withCopy(pre) }
const setCode = (code, text) => { code.innerHTML = highlight(text, code.parentElement.dataset.lang || 'js') }

/* ---------------- tabs ---------------- */
for (const set of $$('[data-tabs]')) {
  const btns = $$('[data-tab]', set)
  const show = (name) => {
    btns.forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === name))
    $$('[data-panel]', set).forEach((p) => (p.hidden = p.dataset.panel !== name))
  }
  btns.forEach((b) => (b.onclick = () => show(b.dataset.tab)))
  show(btns[0].dataset.tab)
}

/* ---------------- header + hero ---------------- */
// logo: ui.js mounts a new random livatar on every load
ORDER.forEach((n, i) => mount(box($('heroStrip')), styles[n], { seed: 'nuhmanpk', mood: i % 3 === 1 ? 'happy' : 'neutral', title: n }))

/* ---------------- characters ---------------- */
const ABOUT = {
  buddy: 'Cartoon humans with hair styles, facial hair, glasses, accessories, clothes, skin and hair colors. Their hands cover their eyes on password fields.',
  animal: 'Sixteen sticker-style animals and birds. Paws and wings come up on password fields.',
  monster: 'Fuzzy monsters with one to three eyes, horns, fangs and spots.',
  ghost: 'Little sheet ghosts that float, with bows, hats, crowns and halos.',
  emoji: 'Classic round smileys: the clearest canvas for moods.',
  bot: 'Robots with LED eyes, antennas and a glow color.',
  blob: 'Abstract gradient creatures with soft organic outlines.',
  pixel: 'Mirrored pixel critters; density controls how full the sprite is.',
  memoji: 'Glossy 3D-style cartoon heads: curly tops, fades, beards, aviator sunglasses, skin and hair colors.',
  clay: 'Soft claymorphism people built from layered gradients (no filters), in matte pastels.',
  dino: 'T-rex, triceratops, stego, bronto, ptero and a little dragon, with spots and party hats.',
  alien: 'Friendly aliens with one to three eyes, antennas, head shapes and a glass helmet.',
  planet: 'Earth, Saturn, Mars, the Moon, the Sun, gas giants, comets and stars, with orbiting moons.',
  food: 'Kawaii food: avocado, toast, donut, sushi, onigiri, cupcake, boba, taco and more.',
  plant: 'Potted cacti, succulents, monstera, sunflowers, tulips, bonsai and mushrooms. Leaves cover the eyes on password fields.',
  initials: 'Initials from a name (or the seed) with a tiny face that blinks and follows the cursor. Set options.name.',
}
// The gallery must show every kind at least once: pick the option that defines "what it is" and cover all its values.
const mainKey = (st) => {
  const v = st.variants || {}
  const plain = (l) => l.every((x) => !(typeof x === 'string' && /^#/.test(x)))
  const pref = ['kind', 'species', 'age', 'type', 'shape', 'head'].find((k) => v[k] && plain(v[k]) && v[k].length > 1)
  if (pref) return pref
  const best = Object.entries(v).filter(([, l]) => plain(l) && l.length >= 4).sort((a, b) => b[1].length - a[1].length)[0]
  return best?.[0]
}
const host = $('charSections')
for (const name of ORDER) {
  const st = styles[name]
  const gal = el('div', { class: 'gal' })
  const seedIn = el('input', { value: name === 'animal' ? 'zoo' : 'ada', 'aria-label': `Seed for the ${name} gallery`, style: 'max-width:220px' })
  const optHost = el('div')
  host.append(
    el('h3', { id: 'ch-' + name, text: name }),
    el('p', {}, ABOUT[name] || ''),
    makePre(`import { mount, ${name} } from 'livatar'\n\nmount(el, ${name}, { seed: 'ada'${Object.keys(st.variants || {})[0] ? `, options: { ${Object.keys(st.variants)[0]}: ${JSON.stringify(st.variants[Object.keys(st.variants)[0]][1])} }` : ''} })`, 'js'),
    el('div', { class: 'live' },
      el('div', { class: 'row end' }, el('label', { class: 'field' }, 'Gallery seed', seedIn),
        el('button', { type: 'button', class: 'ghost', title: 'Random seed', 'aria-label': 'Random seed', text: '🎲', onclick: () => { seedIn.value = Math.random().toString(36).slice(2, 8); draw() } })),
      gal),
    optHost,
  )
  let hs = []
  const draw = () => {
    hs.forEach((h) => h.destroy()); gal.innerHTML = ''
    const mk = mainKey(st), vals = mk ? st.variants[mk] : []
    hs = Array.from({ length: Math.max(8, vals.length) }, (_, i) => {
      const o = mk && i < vals.length ? { [mk]: vals[i] } : undefined
      return mount(box(gal), st, { seed: i ? `${seedIn.value}-${i}` : seedIn.value, options: o, title: `${name} ${o ? vals[i] : i ? seedIn.value + '-' + i : seedIn.value}` })
    })
  }
  seedIn.addEventListener('input', draw)
  lazy(gal, draw)
  lazy(optHost, () => optHost.append(optionsTable(name)))
}
function optionsTable(name) {
  const st = styles[name]
  const variants = st.variants || {}
  const tbody = el('tbody')
  const seed = name === 'animal' ? 'zoo' : 'docs'
  for (const [key, list] of Object.entries(variants)) {
    const def = st.defaults?.[key] ?? 'random'
    const choices = el('div', { class: 'choices' })
    for (const v of list) {
      const isColor = typeof v === 'string' && /^#/.test(v)
      const label = isColor ? el('span', {}, el('i', { class: 'sw', style: `background:${v}` }), v) : el('span', { text: String(v) })
      const svg = createAvatar(st, { seed, size: 42, options: { [key]: v }, title: `${key}: ${v}` })
      choices.append(el('div', { class: 'choice', html: svg }, label))
    }
    tbody.append(el('tr', {},
      el('td', { class: 'nw' }, el('code', { text: key })),
      el('td', { class: 'nw' }, el('code', { text: JSON.stringify(def) })),
      el('td', {}, choices)))
  }
  const t = el('table', {}, el('thead', {}, el('tr', {}, el('th', { text: 'Option' }), el('th', { text: 'Default' }), el('th', { text: 'Choices' }))), tbody)
  return el('div', { class: 'tw' }, t)
}

/* ---------------- builder (ported from the homepage) ---------------- */
{
  fill($('bStyle'), NAMES)
  fill($('bMood'), MOODS)
  for (const p of Object.keys(palettes)) $('bPalette').append(el('option', { value: p, text: p }))
  const enc = (v) => JSON.stringify(v)
  const renderOptionControls = (styleName, values = {}) => {
    $('bOptions').innerHTML = ''
    for (const [key, list] of Object.entries(styles[styleName].variants || {})) {
      const sel = el('select', { 'data-key': key })
      fill(sel, ['"random"', ...list.map(enc)], ['random (from seed)', ...list.map((v) => String(v))])
      if (key in values) sel.value = enc(values[key])
      sel.onchange = update
      $('bOptions').append(el('label', {}, key, sel))
    }
  }
  const readConfig = () => {
    const options = {}
    $$('select', $('bOptions')).forEach((s) => { const v = JSON.parse(s.value); if (v !== 'random') options[s.dataset.key] = v })
    const bg = $('bBg').value
    return {
      style: $('bStyle').value,
      seed: $('bSeed').value,
      mood: $('bMood').value,
      shape: $('bShape').value,
      palette: $('bPalette').value || undefined,
      background: bg === 'none' ? false : bg === 'custom' ? $('bBgColor').value : undefined,
      gradient: $('bGradient').checked || undefined,
      flip: $('bFlip').checked || undefined,
      border: $('bBorder').checked || undefined,
      options,
    }
  }
  const loadConfig = (cfg) => {
    $('bStyle').value = cfg.style
    $('bSeed').value = cfg.seed ?? ''
    $('bMood').value = cfg.mood ?? 'neutral'
    $('bShape').value = cfg.shape ?? 'circle'
    $('bPalette').value = cfg.palette ?? ''
    $('bBg').value = cfg.background === false ? 'none' : typeof cfg.background === 'string' ? 'custom' : ''
    if (typeof cfg.background === 'string' && /^#[\da-f]{6}$/i.test(cfg.background)) $('bBgColor').value = cfg.background
    $('bGradient').checked = !!cfg.gradient
    $('bFlip').checked = !!cfg.flip
    $('bBorder').checked = !!cfg.border
    renderOptionControls(cfg.style, cfg.options)
    update()
  }
  let bHandle = null, sizeHandles = [], code = '', started = false
  function update() {
    $('bBgColorWrap').hidden = $('bBg').value !== 'custom'
    code = encode(readConfig())
    bHandle?.destroy(); sizeHandles.forEach((h) => h.destroy())
    bHandle = mountCode($('bPreview'), code, { alive: { intensity: 1.2 }, title: 'Your avatar' })
    $('bSizes').innerHTML = ''
    sizeHandles = [24, 32, 48, 64].map((px) => mountCode(box($('bSizes'), px + 'px'), code))
    $('bCode').value = code
    setCode($('sHtml'), `<script type="module" src="https://unpkg.com/livatar/dist/element.js"></script>\n<live-avatar code="${code}" size="64"></live-avatar>`)
    setCode($('sJs'), `import { mountCode, render } from 'livatar'\n\nmountCode(el, '${code}')    // alive\nrender('${code}')            // '<svg …>' (SSR, <img>, email)`)
    setCode($('sReact'), `import { LivatarCode } from 'livatar/react'\n\n<LivatarCode code="${code}" size={64} />`)
    // keep the hash in sync once the user has touched the builder (not on first paint)
    if (started) try { history.replaceState(null, '', '#' + code) } catch {}
  }
  const touched = () => { started = true; update() }
  $('bStyle').onchange = () => { renderOptionControls($('bStyle').value); touched() }
  for (const id of ['bSeed', 'bMood', 'bShape', 'bPalette', 'bBg', 'bBgColor', 'bGradient', 'bFlip', 'bBorder']) $(id).addEventListener('input', touched)
  $('bOptions').addEventListener('change', () => (started = true))
  $('bDice').onclick = () => { $('bSeed').value = Math.random().toString(36).slice(2, 9); touched() }
  $('bShuffle').onclick = () => { started = true; const c = randomConfig($('bStyle').value); loadConfig({ ...c, mood: $('bMood').value }) }
  $('bPng').onclick = () => download(L.render(code), 'livatar.png')
  $$('[data-act]').forEach((b) => (b.onclick = () => bHandle?.[b.dataset.act](b.dataset.act === 'talk' ? 1400 : undefined)))
  const flash = (btn, text) => { const t = btn.textContent; btn.textContent = text; setTimeout(() => (btn.textContent = t), 1200) }
  $('bCopy').onclick = async () => { if (await copyText(code)) flash($('bCopy'), 'Copied') }
  $('bLink').onclick = async () => { if (await copyText(location.href.split('#')[0] + '#' + code)) flash($('bLink'), 'Copied') }
  const tryLoad = (c) => { try { if (isCode(c)) { loadConfig(decode(c)); return true } } catch {} return false }
  $('bLoadBtn').onclick = () => {
    if (tryLoad($('bLoad').value.trim())) { started = true; update() }
    else { $('bLoad').value = ''; $('bLoad').placeholder = 'That is not a livatar code' }
  }
  const fromHash = location.hash.slice(1)
  if (tryLoad(fromHash)) { started = true; requestAnimationFrame(() => $('builder').scrollIntoView()) }
  else loadConfig({ style: 'animal', seed: 'nuhmanpk', mood: 'happy' })
  // a code typed into the address bar later
  addEventListener('hashchange', () => { const h = location.hash.slice(1); if (isCode(h) && h !== code && tryLoad(h)) $('builder').scrollIntoView() })
}

/* ---------------- quick start ---------------- */
{
  const h = mount($('qsAv'), styles.buddy, { seed: 'ada@example.com', mood: 'happy', title: 'Quick start avatar' })
  $$('[data-q]').forEach((b) => (b.onclick = () => {
    const q = b.dataset.q
    if (q === 'talk') h.talk(1500)
    else if (q === 'surprised') h.emote('surprised', 800)
    else h[q]()
  }))
}

/* ---------------- moods ---------------- */
{
  $('moodList').innerHTML = MOODS.map((m) => `<code>${m}</code>`).join(', ')
  let hs = [], cur = 'emoji'
  const draw = (name = cur) => {
    cur = name
    hs.forEach((h) => h.destroy()); $('moodGal').innerHTML = ''
    hs = MOODS.map((mood, i) => {
      const fig = el('figure', { class: 'cap' }); const d = box(fig)
      fig.append(el('figcaption', { text: mood })); $('moodGal').append(fig)
      const st = name === 'mixed' ? styles[ORDER[i % ORDER.length]] : styles[name]
      return mount(d, st, { seed: 'nuhmanpk', mood, title: `${st.name}, ${mood}` })
    })
    $$('button', $('moodTabs')).forEach((b) => b.setAttribute('aria-pressed', b.dataset.name === name))
  }
  for (const name of [...ORDER, 'mixed']) $('moodTabs').append(el('button', { type: 'button', 'data-name': name, text: name, onclick: () => draw(name) }))
  lazy($('moodGal'), () => draw())

  $('moodImg').src = toDataUri(styles.emoji, { seed: 'ada', mood: 'love' })
  const live = mount($('moodLive'), styles.emoji, { seed: 'ada' })
  for (const m of MOODS) $('moodBtns').append(el('button', { type: 'button', class: 'ghost sm', text: m, onclick: () => {
    const t = $('moodFlash').checked
    live.emote(m, t ? 1200 : undefined)
    $('moodLiveCap').textContent = 'live: ' + m + (t ? ' (1200 ms)' : '')
    if (t) setTimeout(() => ($('moodLiveCap').textContent = 'live: ' + live.state.mood), 1300)
  } }))
}

/* ---------------- customization playground ---------------- */
{
  fill($('cStyle'), ORDER)
  for (const p of Object.keys(palettes)) $('cPalette').append(el('option', { value: p, text: p }))
  let h = null
  const fmt = (o) => '{\n' + Object.entries(o).map(([k, v]) => `  ${k}: ${Array.isArray(v) ? `palettes.${$('cPalette').value}` : JSON.stringify(v).replace(/"/g, "'")},`).join('\n') + '\n}'
  const update = () => {
    const r = +$('cRadius').value
    $('cRadiusV').textContent = r < 0 ? 'auto' : r
    $('cScaleV').textContent = $('cScale').value
    $('cRotateV').textContent = $('cRotate').value + '°'
    $('cBwV').textContent = $('cBw').value
    $('cSizeV').textContent = $('cSize').value + 'px'
    const o = { seed: $('cSeed').value, shape: $('cShape').value }
    if (r >= 0) o.radius = r
    if (+$('cScale').value !== 1) o.scale = +$('cScale').value
    if (+$('cRotate').value) o.rotate = +$('cRotate').value
    if ($('cPalette').value) o.colors = [...palettes[$('cPalette').value]]
    const bg = $('cBg').value
    if (bg === 'none') o.background = false
    if (bg === 'color') o.background = $('cColor').value
    if ($('cGradient').checked) o.gradient = true
    if ($('cFlip').checked) o.flip = true
    if ($('cBorder').checked) {
      o.border = $('cBorderColor').checked ? $('cColor').value : true
      if (+$('cBw').value !== 4) o.borderWidth = +$('cBw').value
    }
    $('cPrevWrap').style.width = $('cSize').value + 'px'
    h?.destroy()
    h = mount($('cPrev'), styles[$('cStyle').value], o)
    setCode($('cCode'), `import { mount, ${$('cStyle').value}${o.colors ? ', palettes' : ''} } from 'livatar'\n\nmount(el, ${$('cStyle').value}, ${fmt(o)})`)
  }
  $$('input, select', $('cControls')).forEach((i) => i.addEventListener('input', update))
  lazy($('cPrev'), update)

  lazy($('palStrip'), () => {
    for (const [name, cols] of Object.entries(palettes)) {
      const avs = el('div', { class: 'avs' })
      ;['buddy', 'animal', 'ghost', 'blob'].forEach((s, i) => (avs.innerHTML += createAvatar(styles[s], { seed: name + i, colors: [...cols], size: 34, title: `${s} with ${name}` })))
      $('palStrip').append(el('div', { class: 'pal' },
        el('code', { text: name }),
        el('div', { class: 'sws', 'aria-hidden': 'true', html: cols.map((c) => `<i style="background:${c}"></i>`).join('') }),
        avs))
    }
  })
}

/* ---------------- codes ---------------- */
{
  fill($('eStyle'), ORDER)
  fill($('eMood'), MOODS)
  for (const p of Object.keys(palettes)) $('ePalette').append(el('option', { value: p, text: p }))
  const opts = (name, values = {}) => {
    $('eOptions').innerHTML = ''
    for (const [key, list] of Object.entries(styles[name].variants || {})) {
      const sel = el('select', { 'data-key': key })
      fill(sel, ['"random"', ...list.map((v) => JSON.stringify(v))], ['random (from seed)', ...list.map(String)])
      if (key in values) sel.value = JSON.stringify(values[key])
      sel.onchange = update
      $('eOptions').append(el('label', {}, key, sel))
    }
  }
  let h = null
  function update() {
    const options = {}
    $$('select', $('eOptions')).forEach((s) => { const v = JSON.parse(s.value); if (v !== 'random') options[s.dataset.key] = v })
    const cfg = { style: $('eStyle').value, seed: $('eSeed').value }
    if ($('eMood').value !== 'neutral') cfg.mood = $('eMood').value
    if ($('ePalette').value) cfg.palette = $('ePalette').value
    if (Object.keys(options).length) cfg.options = options
    const code = encode(cfg)
    $('eCode').value = code
    $('eLen').textContent = `(${code.length} characters)`
    setCode($('eCall'), `encode(${JSON.stringify(cfg, null, 2).replace(/"(\w+)":/g, '$1:').replace(/"/g, "'")})\n// → '${code}'`)
    $('eOpen').href = '#' + code
    h?.destroy(); h = mountCode($('eAv'), code)
  }
  $('eStyle').onchange = () => { opts($('eStyle').value); update() }
  for (const id of ['eSeed', 'eMood', 'ePalette']) $(id).addEventListener('input', update)
  $('eCopy').onclick = async () => { if (await copyText($('eCode').value)) { $('eCopy').textContent = 'Copied'; setTimeout(() => ($('eCopy').textContent = 'Copy'), 1200) } }
  $('eRandom').onclick = () => {
    const c = randomConfig($('eStyle').value)
    $('eSeed').value = c.seed; opts(c.style, c.options); update()
  }
  lazy($('eAv'), () => { $('eStyle').value = 'animal'; opts('animal', { species: 'owl' }); update() })

  let dh = null
  const dec = () => {
    const v = $('dIn').value.trim()
    try {
      const cfg = decode(v)
      setCode($('dOut'), JSON.stringify(cfg, null, 2))
      $('dErr').textContent = ''
      dh?.destroy(); dh = mountCode($('dAv'), cfg)
    } catch (e) {
      $('dErr').textContent = v ? e.message : 'Paste a code that starts with "lv".'
      setCode($('dOut'), '// …')
    }
  }
  $('dIn').addEventListener('input', dec)
  lazy($('dAv'), dec)
}

/* ---------------- engine ---------------- */
{
  let h = null
  lazy($('enAv'), () => {
    h = mount($('enAv'), styles.animal, { seed: 'engine', options: { species: 'owl' }, title: 'Engine demo owl' })
    const opts = $('enOpts')
    for (const k of ['track', 'focus', 'keyboard', 'shy', 'blink', 'breathe', 'idle', 'poke']) {
      const c = el('input', { type: 'checkbox', checked: true, onchange: () => h.set({ [k]: c.checked }) })
      opts.append(el('label', { class: 'check' }, c, k))
    }
    const range = (k, min, max, step, val) => {
      const v = el('span', { class: 'mono', text: val })
      const r = el('input', { type: 'range', min, max, step, value: val, oninput: () => { v.textContent = r.value; h.set({ [k]: +r.value }) } })
      opts.append(el('label', {}, el('span', {}, k + ' ', v), r))
    }
    range('intensity', 0, 3, 0.1, 1)
    range('speed', 0.2, 3, 0.1, 1)
    const sl = el('select', { onchange: () => h.set({ sleepAfter: +sl.value }) })
    fill(sl, ['0', '3000', '10000'], ['never', '3 s', '10 s'])
    opts.append(el('label', {}, 'sleepAfter', sl))
    // state readout, only while visible
    let vis = false
    new IntersectionObserver(([e]) => (vis = e.isIntersecting)).observe($('enAv'))
    setInterval(() => {
      if (!vis) return
      const s = h.state
      $('enState').textContent = `x ${s.x.toFixed(2).padStart(5)}  y ${s.y.toFixed(2).padStart(5)}  closed ${s.closed.toFixed(2)}\nmouth ${s.mouth.toFixed(2)}  shy ${s.shy.toFixed(2)}  mood ${s.mood}`
    }, 120)
    let n = 0
    $('enAv').addEventListener('livatar:poke', () => ($('enLog').textContent = `livatar:poke × ${++n}`))
  })
  $$('[data-en]').forEach((b) => (b.onclick = () => {
    if (!h) return
    const a = b.dataset.en
    if (a === 'look-left') h.look(-1, 0)
    else if (a === 'look-up') h.look(0, -1)
    else if (a === 'talk') h.talk(1500)
    else if (a === 'love') h.emote('love', 1500)
    else if (a === 'angry' || a === 'neutral') h.emote(a)
    else h[a]()
  }))
}

/* ---------------- forms ---------------- */
{
  const h = mount($('fAv'), styles.buddy, { seed: 'guard', options: { glasses: false, accessory: 'none', facialHair: 'none' }, title: 'Form guard' })
  const form = $('fForm')
  const binding = bindForm(h, form)
  form.addEventListener('submit', async () => {
    if (!form.checkValidity()) { $('fLog').textContent = 'rejected: fix the fields (sad + shake)'; return }
    $('fLog').textContent = 'submitting… (surprised)'
    await sleep(1100)
    if ($('fFail').checked) { binding.error(); $('fLog').textContent = 'binding.error() (sad + shake)' }
    else { binding.success(); $('fLog').textContent = 'binding.success() (love + nod)' }
  })
  $('fReset').onclick = () => { form.reset(); binding.reset(); $('fLog').textContent = 'binding.reset()' }

  const bi = mount($('biAv'), styles.animal, { seed: 'names', options: { species: 'fox' } })
  const taken = ['admin', 'root', 'ada']
  bindInput(bi, $('biIn'), (v) => (!v ? 'neutral' : v.length < 3 ? 'confused' : taken.includes(v.toLowerCase()) ? 'sad' : 'happy'))
}

/* ---------------- export ---------------- */
{
  const opts = { seed: 'export', mood: 'happy', options: { species: 'panda' } }
  const svg = () => createAvatar(styles.animal, opts)
  mount($('xAv'), styles.animal, opts)
  $('xBg').style.backgroundImage = `url("${toDataUri(styles.animal, opts)}")`
  let url = ''
  $('xImg').onclick = async () => {
    const size = +$('xSize').value
    try {
      const blob = await toImage(svg(), size)
      if (url) URL.revokeObjectURL(url)
      url = URL.createObjectURL(blob)
      $('xOut').src = url; $('xOut').hidden = false
      $('xLog').textContent = `${blob.type}, ${size}×${size}, ${(blob.size / 1024).toFixed(1)} KB`
    } catch (e) { $('xLog').textContent = e.message }
  }
  $('xPng').onclick = () => download(svg(), 'livatar.png', +$('xSize').value)
  $('xSvg').onclick = () => download(svg(), 'livatar.svg')
}

/* ---------------- web component ---------------- */
$('wcBtn').onclick = () => $('wc1').handle?.emote('love', 1500)

/* ---------------- make anything alive ---------------- */
{
  const src = $('mugSrc').textContent.trim()
  $('mugSnip').replaceWith(makePre(src, 'html', 'mug.svg'))
  $('mugHost').innerHTML = src
  const h = alive($('mug'))
  $$('[data-m]').forEach((b) => (b.onclick = () => {
    const a = b.dataset.m
    if (a === 'talk') h.talk(1500)
    else if (a === 'poke') h.poke()
    else h.emote(a)
  }))
}

/* ---------------- live source modules (custom style, behaviors) ---------------- */
const LIB = new URL('../../dist/index.js', import.meta.url).href
const importSnippet = (id) => {
  const code = SRC[id].replace(/from 'livatar'/g, `from '${LIB}'`)
  return import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })))
}
{
  lazy($('jellyGal'), async () => {
    try {
      const { jelly } = await importSnippet('jellySrc')
      const hs = ['ada', 'bo', 'cy', 'di', 'ed', 'flo'].map((seed) => mount(box($('jellyGal')), jelly, { seed, title: `jelly ${seed}` }))
      for (const m of MOODS) $('jellyBtns').append(el('button', { type: 'button', class: 'ghost sm', text: m, onclick: () => hs.forEach((h) => h.emote(m)) }))
    } catch (e) { $('jellyErr').textContent = 'Could not run the example: ' + e.message }
  })
  lazy($('behAv'), async () => {
    const h = mount($('behAv'), styles.ghost, { seed: 'boo', title: 'Behavior demo ghost' })
    let mod = {}
    try { mod = await importSnippet('behSrc') } catch (e) { console.warn(e) }
    const set = (name) => {
      h.set({ behaviors: name === 'none' ? [] : [mod[name]] })
      $$('button', $('behTabs')).forEach((b) => b.setAttribute('aria-pressed', b.dataset.name === name))
    }
    for (const name of ['none', 'followMoon', 'avoid', 'nervous']) $('behTabs').append(el('button', { type: 'button', 'data-name': name, text: name, onclick: () => set(name) }))
    set('followMoon')
  })
}

/* ---------------- performance stress test ---------------- */
{
  let hs = []
  const t0 = { n: 0, ms: 0 }
  const fill = (n) => {
    clear()
    const s = performance.now()
    const frag = document.createDocumentFragment()
    const boxes = Array.from({ length: n }, () => { const d = el('div'); frag.append(d); return d })
    $('stress').append(frag)
    hs = boxes.map((d, i) => mount(d, styles[ORDER[i % ORDER.length]], { seed: 'st' + i }))
    t0.n = n; t0.ms = performance.now() - s
  }
  const clear = () => { hs.forEach((h) => h.destroy()); hs = []; $('stress').innerHTML = ''; t0.n = 0; t0.ms = 0 }
  $$('[data-n]').forEach((b) => (b.onclick = () => fill(+b.dataset.n)))
  $('stClear').onclick = clear
  let vis = false, frames = 0, since = performance.now(), raf = 0
  const tick = (t) => {
    frames++
    if (t - since >= 500) {
      const fps = Math.round((frames * 1000) / (t - since))
      $('fps').textContent = `${fps} fps · ${t0.n} avatars${t0.n ? ` · mounted in ${Math.round(t0.ms)} ms` : ''}`
      frames = 0; since = t
    }
    raf = vis ? requestAnimationFrame(tick) : 0
  }
  new IntersectionObserver(([e]) => {
    vis = e.isIntersecting
    if (vis && !raf) { frames = 0; since = performance.now(); raf = requestAnimationFrame(tick) }
  }).observe($('fps'))
}

/* ---------------- accessibility demo ---------------- */
lazy($('pwAv'), () => mount($('pwAv'), styles.animal, { seed: 'privacy', options: { species: 'bear' }, title: 'Privacy bear' }))

/* ---------------- sidebar: build, filter, scroll spy ---------------- */
{
  const list = $('tocList')
  const heads = []
  for (const h2 of $$('#content h2[id]')) {
    const li = el('li')
    const a = el('a', { href: '#' + h2.id, text: h2.textContent })
    li.append(a); heads.push([h2, a])
    const sec = h2.closest('section')
    if (sec?.hasAttribute('data-subnav')) {
      const sub = el('ol')
      for (const h3 of $$('h3[id]', sec)) {
        const a3 = el('a', { href: '#' + h3.id, text: h3.textContent })
        sub.append(el('li', {}, a3)); heads.push([h3, a3])
      }
      if (sub.children.length) li.append(sub)
    }
    list.append(li)
  }
  // heading anchors
  for (const [h] of heads) h.append(el('a', { class: 'anchor', href: '#' + h.id, 'aria-label': `Link to ${h.textContent}`, text: '#' }))

  const toc = $('toc')
  const mq = matchMedia('(max-width: 900px)')
  const syncOpen = () => (toc.open = !mq.matches)
  syncOpen(); mq.addEventListener('change', syncOpen)
  list.addEventListener('click', (e) => { if (e.target.closest('a') && mq.matches) toc.open = false })

  $('tocFilter').addEventListener('input', () => {
    const q = $('tocFilter').value.trim().toLowerCase()
    let any = false
    for (const li of list.children) {
      const top = li.querySelector(':scope > a')
      const subs = $$(':scope > ol > li', li)
      let subHit = false
      for (const s of subs) { const hit = !q || s.textContent.toLowerCase().includes(q); s.hidden = !hit; subHit ||= hit && !!q }
      const hit = !q || top.textContent.toLowerCase().includes(q)
      if (hit && q) subs.forEach((s) => (s.hidden = false))
      li.hidden = !(hit || subHit)
      any ||= !li.hidden
    }
    $('tocEmpty')?.remove()
    if (!any) list.after(el('div', { class: 'empty', id: 'tocEmpty', text: 'No matching sections' }))
  })

  let current = null
  const body = toc.querySelector('.toc-body')
  const spy = () => {
    const line = innerHeight * 0.3
    let best = heads[0]
    for (const pair of heads) { if (pair[0].getBoundingClientRect().top < line) best = pair; else break }
    if (best === current) return
    current?.[1].removeAttribute('aria-current')
    current = best
    best[1].setAttribute('aria-current', 'true')
    $('tocCur').textContent = '· ' + best[0].firstChild.textContent
    // keep the active link visible inside the sidebar without scrolling the page
    const scroller = mq.matches ? body : toc.closest('.sidebar')
    const r = best[1].getBoundingClientRect(), s = scroller.getBoundingClientRect()
    if (r.top < s.top + 60 || r.bottom > s.bottom - 20) scroller.scrollTop += r.top - s.top - s.height / 3
  }
  const io = new IntersectionObserver(spy, { rootMargin: '0px 0px -70% 0px' })
  heads.forEach(([h]) => io.observe(h))
  spy()
}

/* ---------------- deep links after content was generated ---------------- */
if (location.hash && !isCode(location.hash.slice(1))) {
  const t = document.getElementById(decodeURIComponent(location.hash.slice(1)))
  if (t) requestAnimationFrame(() => t.scrollIntoView())
}

/* ---------------- usage cards ---------------- */
lazy($('uEmpty'), () => {
  const h = mountCode($('uEmpty'), 'animal', { seed: 'inbox', mood: 'sleepy', options: { species: 'koala' } })
  $('uEmptyGo').onclick = async () => {
    h.emote('surprised'); $('uEmptyTxt').textContent = 'Checking…'; await sleep(900)
    h.emote('sad'); h.shake(); $('uEmptyTxt').textContent = 'Still nothing.'; await sleep(1600)
    h.emote('sleepy'); $('uEmptyTxt').textContent = 'No new messages'
  }
})
lazy($('uRate'), () => {
  const h = mountCode($('uRate'), 'emoji', { seed: 'feedback', options: { tone: 'yellow' } })
  const scale = [['angry', 'terrible'], ['sad', 'bad'], ['neutral', 'okay'], ['happy', 'great'], ['love', 'loved it']]
  $('uRateIn').oninput = () => { const [m, t] = scale[$('uRateIn').value]; h.emote(m); $('uRateTxt').textContent = t }
})
lazy($('uBot'), () => {
  const bot = mountCode($('uBot'), 'bot', { seed: 'helper', options: { eyes: 'round' } })
  const lines = [['Beep boop! I talk while your LLM streams.', 'happy'], ['Hmm, let me think about that…', 'confused'], ['Uh oh, that request failed.', 'sad'], ['Fixed it. You are welcome!', 'wink']]
  let i = 0, busy = false
  $('uTalk').onclick = async () => {
    if (busy) return; busy = true
    const [text, mood] = lines[i++ % lines.length]
    bot.emote(mood); bot.talk(text.length * 35); $('uSay').textContent = ''
    for (const ch of text) { $('uSay').textContent += ch; await sleep(35) }
    busy = false
  }
})
lazy($('uUp'), () => {
  const up = mountCode($('uUp'), 'ghost', { seed: 'cloud' })
  let busy = false, fail = false
  $('uUpFail').onclick = () => (fail = true)
  $('uUpGo').onclick = async () => {
    if (busy) return; busy = true; fail = false
    up.emote('surprised', 700)
    for (let p = 0; p <= 100; p += 4) {
      if (fail && p > 30) { up.emote('sad'); up.shake(); busy = false; return }
      $('uUpBar').value = p; up.talk(80); await sleep(60)
    }
    up.emote('happy'); up.nod(); busy = false
    setTimeout(() => { if (!busy) { up.emote('neutral'); $('uUpBar').value = 0 } }, 2500)
  }
})
lazy($('uNews'), () => {
  const h = mountCode($('uNews'), 'animal', { seed: 'news', options: { species: 'penguin' } })
  const b = bindForm(h, $('uNewsForm'))
  $('uNewsForm').addEventListener('submit', async () => { if ($('uNewsForm').checkValidity()) { await sleep(800); b.success() } })
})
lazy($('uPw'), () => {
  const pw = mountCode($('uPw'), 'animal', { seed: 'guard', options: { species: 'owl' } })
  const grade = (v) => (v.length >= 8) + /[A-Z]/.test(v) + /\d/.test(v) + /[^\w]/.test(v) + (v.length >= 12)
  const moods = ['sad', 'confused', 'neutral', 'happy', 'happy', 'love'], labels = ['weak', 'meh', 'okay', 'good', 'strong', 'excellent']
  bindInput(pw, $('uPwIn'), (v) => { const g = v ? grade(v) : -1; $('uPwTxt').textContent = g < 0 ? 'empty' : labels[g]; return g < 0 ? 'neutral' : moods[g] })
})

/* ---------------- icons ---------------- */
lazy($('icGal'), async () => {
  try {
    const I = await import('../../dist/icons.js')
    $('animCount').textContent = I.ANIMATIONS.length
    const names = Object.keys(I.ICONS)
    fill($('icName'), names, names.map((n) => I.ICONS[n][0]))
    $('icName').value = names.includes('github') ? 'github' : names[0]
    const draw = () => {
      const n = $('icName').value
      $('icGal').innerHTML = I.ANIMATIONS.map((a) => `<figure>${I.icon(n, { animation: a, size: 40, tile: 'rounded' })}<figcaption>${a}</figcaption></figure>`).join('')
      $('icBadges').innerHTML = ['brand', 'dark', 'light'].map((theme) => I.badge(n, I.ICONS[n][0], { theme, animation: 'wiggle' })).join('')
    }
    $('icName').onchange = draw
    draw()
  } catch (e) { $('icGal').textContent = 'Could not load livatar/icons: ' + e.message }
})

/* ---------------- use cases (compact recipes) ---------------- */
lazy($('ucEmpty'), () => {
  const e = mountCode($('ucEmpty'), { style: 'animal', seed: 'inbox', mood: 'sleepy', options: { species: 'koala' } })
  $('ucEmptyGo').onclick = async () => { e.emote('surprised'); $('ucEmptyTxt').textContent = 'Checking…'; await sleep(900); e.emote('sad'); e.shake(); $('ucEmptyTxt').textContent = 'Still nothing.'; await sleep(1500); e.emote('sleepy'); $('ucEmptyTxt').textContent = 'No new messages' }
  const f = mountCode($('ucForm'), 'buddy', { seed: 'join' })
  const b = bindForm(f, $('ucFormEl'))
  $('ucFormEl').addEventListener('submit', async () => { await sleep(700); if ($('ucFormEl').checkValidity()) b.success() })
  const bot = mountCode($('ucBot'), 'bot', { seed: 'helper' })
  const L = [['Hi! I talk while text streams.', 'happy'], ['Hmm, let me think…', 'confused'], ['Oops, that failed.', 'sad'], ['Fixed it!', 'wink']]; let i = 0
  $('ucTalk').onclick = () => { const [t, m] = L[i++ % L.length]; bot.emote(m); bot.talk(t.length * 40); $('ucSay').textContent = t }
  const r = mountCode($('ucRate'), 'emoji', { seed: 'rate' })
  $('ucRateIn').oninput = () => r.emote(['angry', 'sad', 'neutral', 'happy', 'love'][$('ucRateIn').value])
})

/* ---------------- mobile: phone demo + touch use cases ---------------- */
lazy($('phScreen'), () => {
  const species = ['cat', 'bunny', 'fox', 'panda', 'owl', 'frog']
  const faces = species.map((sp, i) => mountCode($('ph' + (i + 1)), { style: 'animal', seed: 'ph' + sp, options: { species: sp } }, { alive: { track: false } }))
  const scr = $('phScreen'), fin = $('phFinger')
  let mode = 'touch', timer, t0
  const lookAt = (x, y, ms = 400) => faces.forEach((h) => h.look(x, y, ms))
  const relLook = (e) => {
    const r = scr.getBoundingClientRect()
    fin.hidden = false; fin.style.left = e.clientX - r.left + 'px'; fin.style.top = e.clientY - r.top + 'px'
    for (const [i, h] of faces.entries()) {
      const a = $('ph' + (i + 1)).getBoundingClientRect()
      h.look(Math.max(-1, Math.min(1, (e.clientX - (a.left + a.width / 2)) / 80)), Math.max(-1, Math.min(1, (e.clientY - (a.top + a.height / 2)) / 80)), 500)
    }
  }
  scr.addEventListener('pointerdown', (e) => { if (mode !== 'touch') return; scr.setPointerCapture(e.pointerId); relLook(e); $('phHint').hidden = true })
  scr.addEventListener('pointermove', (e) => { if (mode === 'touch' && (e.buttons || e.pointerType !== 'mouse')) relLook(e) })
  scr.addEventListener('pointerup', () => { fin.hidden = true })
  scr.addEventListener('click', (e) => { const i = [1, 2, 3, 4, 5, 6].findIndex((n) => $('ph' + n).contains(e.target)); if (i >= 0) { faces[i].emote('love', 900); faces[i].nod() } })
  const onTilt = (e) => { if (e.gamma != null) lookAt(Math.max(-1, Math.min(1, e.gamma / 30)), Math.max(-1, Math.min(1, (e.beta - 40) / 30))) }
  const setMode = (m) => {
    mode = m; clearInterval(timer); removeEventListener('deviceorientation', onTilt); fin.hidden = true
    $('phHint').textContent = m === 'touch' ? 'Drag here like a finger' : m === 'wander' ? 'Nobody touching: they glance around' : 'Tilt the phone'
    $('phHint').hidden = false
    if (m === 'wander') timer = setInterval(() => { const h = faces[(Math.random() * 6) | 0]; h.look(Math.random() * 2 - 1, Math.random() * 2 - 1, 1400); h.blink() }, 700)
    if (m === 'tilt') {
      const D = window.DeviceOrientationEvent, touch = matchMedia('(pointer: coarse)').matches
      if (touch && D?.requestPermission) D.requestPermission().then((r) => r === 'granted' && addEventListener('deviceorientation', onTilt)).catch(() => {})
      else if (touch && D) addEventListener('deviceorientation', onTilt)
      else { t0 = performance.now(); timer = setInterval(() => { const t = (performance.now() - t0) / 1000; lookAt(Math.sin(t * 1.2), Math.sin(t * 0.7) * 0.5, 300) }, 100) }
    }
  }
  document.querySelectorAll('input[name="phMode"]').forEach((r) => (r.onchange = () => setMode(r.value)))
  $('phTap').onclick = () => { const h = faces[(Math.random() * 6) | 0]; h.emote('surprised', 700); h.nod() }
})

lazy($('mTap'), () => {
  const buzz = (p) => navigator.vibrate?.(p)
  // tap to pet
  const tap = mountCode($('mTap'), { style: 'animal', seed: 'pet', options: { species: 'cat' } })
  let pets = 0
  $('mTap').onclick = () => { tap.emote('love', 900); tap.nod(); buzz(15); $('mTapTxt').textContent = `Purr × ${++pets}` }
  // long press
  const hold = mountCode($('mHold'), { style: 'ghost', seed: 'hold' })
  let ht
  $('mHold').onpointerdown = () => { $('mHoldTxt').textContent = 'Keep holding…'; hold.emote('surprised'); ht = setTimeout(() => { hold.emote('love', 1600); hold.nod(); buzz(25); $('mHoldTxt').textContent = 'Love it!' }, 450) }
  $('mHold').onpointerup = $('mHold').onpointerleave = () => { clearTimeout(ht); setTimeout(() => ($('mHoldTxt').textContent = 'Press and hold.'), 1200) }
  $('mHold').oncontextmenu = (e) => e.preventDefault()
  // swipe
  const sw = mountCode($('mSwipe'), { style: 'food', seed: 'swipe', options: { kind: 'donut' } }), card = $('mSwipe')
  let x0 = null
  card.onpointerdown = (e) => { x0 = e.clientX; card.setPointerCapture(e.pointerId) }
  card.onpointermove = (e) => { if (x0 != null) card.style.transform = `translateX(${Math.max(-40, Math.min(40, e.clientX - x0))}px) rotate(${(e.clientX - x0) / 6}deg)` }
  card.onpointerup = (e) => {
    const dx = e.clientX - x0; x0 = null; card.style.transform = ''
    if (Math.abs(dx) > 30) { sw.emote(dx > 0 ? 'love' : 'sad', 1000); dx > 0 ? sw.nod() : sw.shake(); buzz(15); $('mSwipeTxt').textContent = dx > 0 ? 'Liked ♥' : 'Skipped' }
  }
  // pull to refresh
  const pull = mountCode($('mPullAv'), { style: 'planet', seed: 'pull', mood: 'sleepy', background: false, options: { kind: 'cloud', satellite: false, stars: false } })
  const pz = $('mPull'), pav = $('mPullAv')
  let y0 = null, dy = 0
  pz.onpointerdown = (e) => { y0 = e.clientY; pz.setPointerCapture(e.pointerId); pull.emote('surprised') }
  pz.onpointermove = (e) => { if (y0 == null) return; dy = Math.max(0, Math.min(40, e.clientY - y0)); pav.style.transform = `translateY(${dy}px)`; $('mPullTxt').textContent = dy > 30 ? 'Release to refresh' : 'Pull down ↓' }
  pz.onpointerup = async () => {
    y0 = null; pav.style.transform = ''
    if (dy > 30) { $('mPullTxt').textContent = 'Refreshing…'; pull.emote('confused'); await sleep(900); pull.emote('happy', 1400); pull.nod(); buzz(15); $('mPullTxt').textContent = 'Up to date!' } else pull.emote('sleepy')
    dy = 0
  }
  // PIN pad
  const pin = mountCode($('mPin'), { style: 'bot', seed: 'pin' })
  let code = ''
  const dots = () => ($('mPinDots').textContent = '●'.repeat(code.length) + '○'.repeat(4 - code.length))
  $('mPinKeys').innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => `<button type="button">${d}</button>`).join('')
  $('mPinKeys').onclick = async (e) => {
    const b = e.target.closest('button'); if (!b || code.length >= 4) return
    code += b.textContent; dots(); pin.look(0, 0.6, 300); buzz(8)
    if (code.length === 4) {
      await sleep(200)
      if (code === '1234') { pin.emote('happy', 1400); pin.nod() } else { pin.emote('sad', 1200); pin.shake(); buzz([30, 40, 30]) }
      await sleep(900); code = ''; dots()
    }
  }
  $('mPin').title = 'Hint: 1234'
  // tilt
  const tilt = mountCode($('mTilt'), { style: 'alien', seed: 'tilt' })
  const onTilt = (e) => { if (e.gamma != null) { tilt.look(Math.max(-1, Math.min(1, e.gamma / 30)), Math.max(-1, Math.min(1, (e.beta - 40) / 30)), 400); $('mTiltTxt').textContent = `γ ${Math.round(e.gamma)}° β ${Math.round(e.beta)}°` } }
  $('mTiltGo').onclick = () => {
    const D = window.DeviceOrientationEvent
    if (!matchMedia('(pointer: coarse)').matches || !D) { $('mTiltTxt').textContent = 'Open on a phone to try it.'; tilt.emote('confused', 1200); return }
    if (D.requestPermission) D.requestPermission().then((r) => r === 'granted' && addEventListener('deviceorientation', onTilt)).catch(() => {})
    else addEventListener('deviceorientation', onTilt)
    $('mTiltGo').hidden = true
  }

  // shake to wake (devicemotion; iOS asks permission from a tap)
  const shk = mountCode($('mShake'), { style: 'animal', seed: 'shake', mood: 'sleepy', options: { species: 'panda' } })
  let lastShake = 0, shakeN = 0
  const onMotion = (e) => {
    const a = e.accelerationIncludingGravity; if (!a) return
    const f = Math.hypot(a.x || 0, a.y || 0, a.z || 0)
    if (f > 24 && performance.now() - lastShake > 350) {
      lastShake = performance.now(); shakeN++
      shk.emote('confused', 900); shk.shake(); navigator.vibrate?.(20); $('mShakeTxt').textContent = shakeN > 2 ? 'Whoa, I am awake!' : 'Dizzy…'
      if (shakeN > 2) setTimeout(() => { shk.emote('surprised', 900); shk.nod(); shakeN = 0 }, 700)
    }
  }
  $('mShakeGo').onclick = () => {
    const D = window.DeviceMotionEvent
    if (!matchMedia('(pointer: coarse)').matches || !D) { shk.emote('confused', 700); shk.shake(); $('mShakeTxt').textContent = 'Simulated shake. Try it on a phone.'; return }
    if (D.requestPermission) D.requestPermission().then((r) => r === 'granted' && addEventListener('devicemotion', onMotion)).catch(() => {})
    else addEventListener('devicemotion', onMotion)
    $('mShakeGo').hidden = true
  }
  // face-down to sleep (beta near ±180 = screen facing the floor)
  const flip = mountCode($('mFlip'), { style: 'ghost', seed: 'flip' })
  let down = false
  addEventListener('deviceorientation', (e) => {
    if (e.beta == null) return
    const now = Math.abs(e.beta) > 150
    if (now !== down) { down = now; flip.emote(now ? 'sleepy' : 'surprised', now ? 60000 : 900); $('mFlipTxt').textContent = now ? 'Zzz…' : 'Oh! Morning.' }
  })
  if (!matchMedia('(pointer: coarse)').matches) $('mFlipTxt').textContent = 'Open on a phone, then flip it.'
  // double-tap to wink (two taps within 300ms)
  const dbl = mountCode($('mDbl'), { style: 'emoji', seed: 'dbl' })
  let lastTap = 0
  $('mDbl').onclick = () => {
    const t = performance.now()
    if (t - lastTap < 300) { dbl.emote('wink', 1200); dbl.nod(); navigator.vibrate?.(15); $('mDblTxt').textContent = '😉'; lastTap = 0 }
    else { lastTap = t; dbl.look(0, -0.4, 400); $('mDblTxt').textContent = 'One more…' }
  }
  // battery + network aware
  const bat = mountCode($('mBatt'), { style: 'bot', seed: 'batt' })
  const upd = (b) => {
    if (!navigator.onLine) { bat.emote('sad', 60000); $('mBattTxt').textContent = 'Offline. Waiting for Wi-Fi…'; return }
    if (b && b.level < 0.2 && !b.charging) { bat.emote('sleepy', 60000); $('mBattTxt').textContent = `Battery ${Math.round(b.level * 100)}%. So tired…`; return }
    bat.emote(b?.charging ? 'love' : 'happy', 60000); $('mBattTxt').textContent = b ? `Battery ${Math.round(b.level * 100)}%${b.charging ? ', charging ⚡' : ''}` : 'Online and happy'
  }
  let battery = null
  navigator.getBattery?.().then((b) => { battery = b; upd(b); b.onlevelchange = b.onchargingchange = () => upd(b) }).catch(() => upd())
  if (!navigator.getBattery) upd()
  addEventListener('online', () => { upd(battery); bat.nod() }); addEventListener('offline', () => { upd(battery); bat.shake() })
})
