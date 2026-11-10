import { mount, mountCode, createAvatar, styles, palettes, MOODS, encode, randomConfig } from '../../dist/index.js'

const $ = (id) => document.getElementById(id)
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
const box = (parent) => { const d = el('div'); parent.append(d); return d }
const lazyIO = 'IntersectionObserver' in window
  ? new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { lazyIO.unobserve(e.target); const f = e.target.__lazy; e.target.__lazy = null; f?.() } }, { rootMargin: '300px 0px' })
  : null
const lazy = (node, fn) => { if (!lazyIO) return fn(); node.__lazy = fn; lazyIO.observe(node) }

$('theme').onclick = () => {
  const root = document.documentElement
  const dark = root.dataset.theme === 'dark'
  root.dataset.theme = dark ? 'light' : 'dark'
  try { localStorage.setItem('livatar-theme', root.dataset.theme) } catch {}
}

const PREF = ['human', 'buddy', 'memoji', 'clay', 'dev', 'animal', 'dino', 'alien', 'planet', 'food', 'fruit', 'drink', 'plant', 'monster', 'ghost', 'emoji', 'initials', 'bot', 'blob', 'pixel', 'ui', 'device', 'tech', 'vehicle', 'money', 'home', 'office', 'weather', 'sport', 'music', 'sea', 'bug', 'magic', 'party', 'season', 'tool', 'ai']
const ORDER = [...PREF.filter((n) => styles[n]), ...Object.keys(styles).filter((n) => !PREF.includes(n))]
const ABOUT = {
  human: 'People from baby to grandparent, with age, gender, skin tone, hair and clothes.',
  buddy: 'Cartoon humans with hair styles, facial hair, glasses, accessories, clothes, skin and hair colors. Hands cover the eyes on password fields.',
  memoji: 'Glossy 3D-style cartoon heads: curly tops, fades, beards, aviator sunglasses, skin and hair colors.',
  clay: 'Soft claymorphism people built from layered gradients, in matte pastels.',
  dev: 'A developer at work: coding, debugging, shipping, with a hoodie color.',
  animal: 'Sixteen sticker-style animals and birds. Paws and wings come up on password fields.',
  dino: 'T-rex, triceratops, stego, bronto, ptero and a little dragon, with spots and party hats.',
  alien: 'Friendly aliens with one to three eyes, antennas, head shapes and a glass helmet.',
  planet: 'Earth, Saturn, Mars, the Moon, the Sun, gas giants, comets and stars, with orbiting moons.',
  food: 'Kawaii food: avocado, toast, donut, sushi, onigiri, cupcake, boba, taco and more.',
  fruit: 'Chunky outlined fruit with leaves: strawberry, lemon, banana, pineapple, kiwi and more.',
  drink: 'Cups, boba, bottles and mugs. Hot drinks steam.',
  plant: 'Potted cacti, succulents, monstera, sunflowers, tulips, bonsai and mushrooms. Leaves cover the eyes on password fields.',
  monster: 'Fuzzy monsters with one to three eyes, horns, fangs and spots.',
  ghost: 'Little sheet ghosts that float, with bows, hats, crowns and halos.',
  emoji: 'Classic round smileys: the clearest canvas for moods.',
  initials: 'Initials from a name (or the seed) with a tiny face that blinks and follows the cursor. Set options.name.',
  bot: 'Robots with LED eyes, antennas and a glow color.',
  blob: 'Abstract gradient creatures with soft organic outlines.',
  pixel: 'Mirrored pixel critters; density controls how full the sprite is.',
  ui: 'Friendly interface parts: toggles, cards, inputs and buttons, with an optional notification dot.',
  device: 'Cute gadgets: phones, laptops, retro TVs, gamepads, with a glowing screen option.',
  tech: 'Routers, servers, chips and cloud hardware with blinking status lights.',
  vehicle: 'Cars, rockets, bikes and planes in any paint color.',
  money: 'Coins, cards, banknotes and wallets, with twinkling sparkles.',
  home: 'Cozy home things: a house, lamp, sofa, mug, alarm clock, bed. Chimneys smoke.',
  office: 'Clipboards, sticky notes, staplers and friends, with ruled lines.',
  weather: 'Rain clouds, snowflakes, lightning, rainbows, umbrellas, tornadoes and snowmen, with optional sparkles.',
  sport: 'Soccer, basketball, tennis, baseball, football, volleyball, a bowling pin and a trophy, with speed lines.',
  music: 'Guitars, drums, mics, trumpets, vinyl, a piano and maracas, with floating notes.',
  sea: 'Fish, octopus, crab, whale, jellyfish, starfish, pufferfish and turtle, with rising bubbles.',
  bug: 'Bees, ladybugs, butterflies, snails, caterpillars, ants, spiders and fireflies, sometimes with a flower.',
  magic: 'Crystal balls, potions, wizard hats, spellbooks, wands, crystals, cauldrons and scrolls, with sparkles.',
  party: 'Balloons, gifts, cake, party hats, poppers, candles, a piñata and a disco ball, with confetti.',
  season: 'Pumpkins, acorns, leaves, pinecones, chestnuts, mittens, sandcastles and snow globes, with falling bits.',
  tool: 'Hammers, wrenches, screwdrivers, saws, drills, toolboxes, paint rollers and tape, in classic or candy colours.',
  ai: 'Shapes inspired by well-known AI assistants (not their official logos), with a pulsing glow ring.',
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
const aboutOf = (n) => ABOUT[n] || `The ${n} character.`
const rnd = () => Math.random().toString(36).slice(2, 9)
const zero = (n) => (n === 'animal' ? 'zoo' : $('seed').value)

$('count').textContent = ORDER.length
const chars = $('chars'), chips = $('chips'), over = $('overview')
const galleries = []

// overview + chips
chips.append(el('a', { href: '#create', class: 'make', text: '＋ Create your own' }))
const ovHandles = []
const drawOverview = () => {
  ovHandles.forEach((h) => h.destroy()); over.innerHTML = ''
  ORDER.forEach((n, i) => {
    const a = el('a', { href: '#ch-' + n })
    ovHandles.push(mount(box(a), styles[n], { seed: $('seed').value, mood: i % 3 === 1 ? 'happy' : 'neutral', title: n }))
    a.append(n)
    over.append(a)
  })
}
for (const n of ORDER) chips.append(el('a', { href: '#ch-' + n, text: n }))

for (const name of ORDER) {
  const st = styles[name]
  const variants = st.variants || {}
  const keys = Object.keys(variants)
  const gal = el('div', { class: 'gal' })
  const optHost = el('div')
  const seedIn = el('input', { value: zero(name), 'aria-label': `Seed for ${name}`, style: 'min-width:160px' })
  const picks = {}                       // feature -> chosen value (absent = random from seed)
  const code = el('code')
  const feats = el('div', { class: 'feats' })
  const copyBtn = el('button', { type: 'button', class: 'ghost sm', text: 'Copy' })
  const snippet = () => {
    const o = Object.entries(picks).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')
    return `import { mount, ${name} } from 'livatar'\n\nmount(el, ${name}, { seed: ${JSON.stringify(seedIn.value)}${o ? `, options: { ${o} }` : ''} })`
  }
  const sync = () => { code.textContent = snippet() }
  let hs = []
  const draw = () => {
    hs.forEach((h) => h.destroy()); gal.innerHTML = ''
    const s = seedIn.value
    // with nothing pinned, cover every kind at least once; pinned features stay fixed across the gallery
    const mk = mainKey(st), vals = mk && !(mk in picks) ? variants[mk] : []
    hs = Array.from({ length: Math.max(12, vals.length) }, (_, i) => {
      const o = { ...picks, ...(i < vals.length ? { [mk]: vals[i] } : {}) }
      return mount(box(gal), st, { seed: i ? `${s}-${i}` : s, options: o, title: `${name} ${i < vals.length ? vals[i] : i ? s + '-' + i : s}` })
    })
    sync()
  }
  const selects = keys.map((k) => {
    const sel = el('select', { 'aria-label': `${name} ${k}` })
    sel.append(el('option', { value: '', text: 'random' }), ...variants[k].map((v, i) => el('option', { value: String(i), text: String(v) })))
    sel.onchange = () => { if (sel.value === '') delete picks[k]; else picks[k] = variants[k][Number(sel.value)]; draw() }
    feats.append(el('label', { class: 'field' }, k, sel))
    return [k, sel]
  })
  const shuffleSeed = () => { seedIn.value = rnd(); draw() }
  const shuffleFeatures = () => {
    for (const [k, sel] of selects) { const i = Math.floor(Math.random() * variants[k].length); sel.value = String(i); picks[k] = variants[k][i] }
    draw()
  }
  const reset = () => { for (const [k, sel] of selects) { sel.value = ''; delete picks[k] } draw() }
  seedIn.addEventListener('input', draw)
  copyBtn.onclick = async () => { try { await navigator.clipboard.writeText(snippet()); copyBtn.textContent = 'Copied!' } catch { prompt('Copy:', snippet()) } setTimeout(() => (copyBtn.textContent = 'Copy'), 1200) }
  chars.append(el('section', { class: 'char', id: 'ch-' + name },
    el('h2', { text: name }),
    el('p', { class: 'meta', text: `${keys.length} option${keys.length === 1 ? '' : 's'}: ${keys.join(', ') || 'none'} · ${st.colors?.length ?? 0} default colors` }),
    el('p', { text: aboutOf(name) }),
    el('div', { class: 'live' },
      el('div', { class: 'toolbar' },
        el('label', { class: 'field' }, 'Seed', el('span', { class: 'row', style: 'gap:10px;flex-wrap:nowrap' }, seedIn, el('button', { type: 'button', class: 'ghost', title: 'Shuffle seed', 'aria-label': 'Shuffle seed', text: '🎲', onclick: shuffleSeed }))),
        keys.length ? el('button', { type: 'button', class: 'ghost', text: 'Shuffle features', onclick: shuffleFeatures }) : '',
        keys.length ? el('button', { type: 'button', class: 'ghost', text: 'Reset', onclick: reset }) : ''),
      keys.length ? feats : '',
      gal),
    el('div', { class: 'pre-wrap', style: 'position:relative' }, el('pre', {}, code), el('div', { style: 'position:absolute;top:8px;right:8px' }, copyBtn)),
    optHost,
  ))
  galleries.push({ gal, draw, seedIn })
  lazy(gal, draw)
  lazy(optHost, () => optHost.append(optionsTable(name)))
  sync()
}

function optionsTable(name) {
  const st = styles[name]
  const variants = st.variants || {}
  if (!Object.keys(variants).length) return el('p', { class: 'muted', text: 'This character has no options. The seed decides everything.' })
  const tbody = el('tbody')
  const seed = name === 'animal' ? 'zoo' : 'docs'
  for (const [key, list] of Object.entries(variants)) {
    const def = st.defaults?.[key] ?? 'random'
    const choices = el('div', { class: 'choices' })
    for (const v of list) {
      const isColor = typeof v === 'string' && /^#/.test(v)
      const label = isColor ? el('span', {}, el('i', { class: 'sw', style: `background:${v}` }), v) : el('span', { text: String(v) })
      choices.append(el('div', { class: 'choice', html: createAvatar(st, { seed, size: 42, options: { [key]: v }, title: `${key}: ${v}` }) }, label))
    }
    tbody.append(el('tr', {}, el('td', { class: 'nw' }, el('code', { text: key })), el('td', { class: 'nw' }, el('code', { text: JSON.stringify(def) })), el('td', {}, choices)))
  }
  return el('div', { class: 'tw' }, el('table', {}, el('thead', {}, el('tr', {}, el('th', { text: 'Option' }), el('th', { text: 'Default' }), el('th', { text: 'Choices' }))), tbody))
}

let t
const redraw = () => { clearTimeout(t); t = setTimeout(() => { drawOverview(); galleries.forEach((g) => { g.seedIn.value = $('seed').value; if (!g.gal.__lazy) g.draw() }) }, 120) }
$('seed').addEventListener('input', redraw)
$('dice').onclick = () => { $('seed').value = rnd(); redraw() }
drawOverview()

// highlight current chip
if ('IntersectionObserver' in window) {
  const links = new Map([...chips.querySelectorAll('a')].map((a) => [a.getAttribute('href').slice(1), a]))
  const spy = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { links.forEach((a) => a.classList.remove('cur')); links.get(e.target.id)?.classList.add('cur') }
  }, { rootMargin: '-30% 0px -65% 0px' })
  document.querySelectorAll('.char').forEach((s) => spy.observe(s))
}

/* ---------------- mobile views ---------------- */
{
  const sel = $('mStyle')
  for (const n of ORDER) sel.append(el('option', { value: n, text: n }))
  sel.value = styles.buddy ? 'buddy' : ORDER[0]
  chips.insertBefore(el('a', { href: '#mobile', text: 'On mobile' }), chips.children[1])
  let mh = []
  const NAMES = ['Ada', 'Bo', 'Cy', 'Di', 'Ed', 'Flo', 'Gus']
  const MSG = ['sent you a photo', 'are you free?', 'lol 😂', 'see you at 5', 'thanks!', 'on my way', 'check this out']
  const drawPhones = () => {
    mh.forEach((h) => h.destroy()); mh = []
    const st = styles[sel.value], seed = $('mSeed').value
    const av = (parent, i, mood) => { const d = box(parent); d.className = 'av'; mh.push(mount(d, st, { seed: i ? `${seed}-${i}` : seed, mood, title: NAMES[i % 7] })); return d }
    const phone = (title, build, cap) => {
      const scr = el('div', { class: 'scr' })
      build(scr)
      const p = el('div', { class: 'phone', role: 'img', 'aria-label': cap }, scr, el('div', { class: 'bar' }))
      return el('figure', { style: 'margin:0' }, p, el('div', { class: 'ph-cap', text: cap }))
    }
    const chat = phone('Chats', (s) => {
      s.append(el('h4', { text: 'Chats' }))
      const st2 = el('div', { class: 'stories' }); s.append(st2)
      for (let i = 0; i < 5; i++) { const w = el('div', { class: 'av' }); st2.append(w); const inner = box(w); mh.push(mount(inner, st, { seed: `${seed}-${i}`, mood: 'happy' })) }
      for (let i = 0; i < 6; i++) { const r = el('div', { class: 'li' }); s.append(r); av(r, i); r.append(el('div', {}, el('b', { text: NAMES[i] }), el('span', { text: MSG[i] }))) }
    }, 'Chat list')
    const prof = phone('Profile', (s) => {
      const big = el('div', { class: 'big' }); s.append(big)
      mh.push(mount(box(big), st, { seed, mood: 'happy', alive: { intensity: 1.2 }, title: 'You' }))
      s.append(el('h4', { class: 'c', text: 'Ada Lovelace' }), el('div', { class: 'c muted', text: '@' + seed }))
      const pills = el('div', { class: 'c' }); s.append(pills)
      for (const k of Object.keys(st.variants || {}).slice(0, 6)) pills.append(el('span', { class: 'pill', text: k }))
      const mm = el('div', { class: 'c' }); s.append(mm)
      for (const m of ['happy', 'love', 'wink', 'sleepy']) mm.append(el('button', { type: 'button', class: 'ghost sm', style: 'margin:2px', text: m, onclick: () => mh[mh.length - 1 - 0 + 0]?.emote(m) }))
      const me = mh.length
      ;[...mm.children].forEach((b, i) => (b.onclick = () => mh[me - 1].emote(['happy', 'love', 'wink', 'sleepy'][i], 1500)))
    }, 'Profile')
    const conv = phone('Chat', (s) => {
      const top = el('div', { class: 'li' }); s.append(top); av(top, 2, 'happy'); top.append(el('b', { text: 'Cy' }))
      s.append(el('div', { class: 'bub', text: 'Is the new avatar live?' }), el('div', { class: 'bub me', text: 'Yes, it follows my finger 👀' }), el('div', { class: 'bub', text: 'Love it' }))
      const row = el('div', { class: 'stories', style: 'margin-top:auto' }); s.append(row)
      for (let i = 0; i < 4; i++) { const w = el('div', { class: 'av' }); row.append(w); mh.push(mount(box(w), st, { seed: `${seed}-${i + 3}`, mood: 'wink' })) }
      const tb = el('div', { class: 'tabs-bar' }); s.append(tb)
      for (let i = 0; i < 4; i++) av(tb, i + 1)
    }, 'Conversation + presence')
    $('phones').replaceChildren(chat, prof, conv)
  }
  sel.onchange = drawPhones
  $('mSeed').addEventListener('input', drawPhones)
  lazy($('phones'), drawPhones)
}

/* ---------------- create your own ---------------- */
const DEFAULT_SRC = `import { defineStyle, faceEyes, faceBrows, faceMouth, faceExtras } from 'livatar'

export const jelly = defineStyle({
  name: 'jelly',
  colors: ['#e0e7ff', '#fce7f3', '#dcfce7', '#fef9c3', '#ffe4e6', '#cffafe'],
  defaults: { eyes: 'random' },
  variants: { eyes: ['round', 'tall'] },
  render(ctx) {
    const { color, background, mood } = ctx
    const ry = ctx.pick('eyes', ['round', 'tall']) === 'tall' ? 4.6 : 3.4
    const face = {
      x: 50, ey: 58, gap: 10, my: 67, ink: '#1f1a2e',
      eye: (x, y) => \`<ellipse cx="\${x}" cy="\${y}" rx="3.2" ry="\${ry}" fill="#1f1a2e"/>\`,
    }
    const mouth = faceMouth(face, mood) || '<ellipse cx="50" cy="69" rx="4" ry="2" fill="#1f1a2e"/>'
    return \`
      <g data-lv-body="">
        <path data-lv-depth=".3" fill="\${color(background)}" stroke="#1f1a2e" stroke-width="2.5"
          d="M22 92V58a28 28 0 0 1 56 0v34l-7-5-7 5-7-5-7 5-7-5-7 5-7-5z"/>
        <g data-lv-depth="1">
          \${faceEyes(face, mood)}\${faceBrows(face, mood)}
          <g data-lv-mouth="1.5">\${mouth}</g>
        </g>
        \${faceExtras(face, mood)}
      </g>\`
  },
})`
/* no-code customizer */
{
  const fill = (sel, vals, labels = vals) => { sel.innerHTML = ''; vals.forEach((v, i) => sel.append(el('option', { value: v, text: labels[i] }))) }
  const enc = (v) => JSON.stringify(v)
  fill($('pStyle'), Object.keys(styles)); fill($('pMood'), MOODS)
  for (const k of Object.keys(palettes)) $('pPalette').append(el('option', { value: k, text: k }))
  $('pStyle').value = styles.buddy ? 'buddy' : Object.keys(styles)[0]
  const optionControls = (name, values = {}) => {
    $('pOptions').innerHTML = ''
    const v = styles[name].variants || {}
    if (!Object.keys(v).length) return $('pOptions').append(el('p', { class: 'muted', text: 'No options: the seed decides.' }))
    for (const [key, list] of Object.entries(v)) {
      const sel = el('select', { 'data-key': key })
      fill(sel, ['"random"', ...list.map(enc)], ['random (from seed)', ...list.map(String)])
      if (key in values) sel.value = enc(values[key])
      sel.onchange = update
      $('pOptions').append(el('label', { class: 'field' }, key, sel))
    }
  }
  const read = () => {
    const options = {}
    $('pOptions').querySelectorAll('select').forEach((s) => { const v = JSON.parse(s.value); if (v !== 'random') options[s.dataset.key] = v })
    const bg = $('pBg').value
    return { style: $('pStyle').value, seed: $('pSeed').value, mood: $('pMood').value, shape: $('pShape').value, palette: $('pPalette').value || undefined,
      background: bg === 'none' ? false : bg === 'custom' ? $('pBgColor').value : undefined,
      gradient: $('pGradient').checked || undefined, flip: $('pFlip').checked || undefined, border: $('pBorder').checked || undefined, options }
  }
  let ph = null, sz = [], code = ''
  function update() {
    $('pBgColorWrap').hidden = $('pBg').value !== 'custom'
    code = encode(read())
    ph?.destroy(); sz.forEach((h) => h.destroy())
    ph = mountCode($('pPreview'), code, { alive: { intensity: 1.2 }, title: 'Your avatar' })
    $('pSizes').innerHTML = ''
    sz = [24, 32, 48, 64].map((px) => { const d = box($('pSizes')); d.style.width = px + 'px'; return mountCode(d, code) })
    $('pCode').value = code
    $('pSnipText').textContent = `import { mountCode } from 'livatar'\n\nmountCode(el, '${code}')`
  }
  $('pStyle').onchange = () => { optionControls($('pStyle').value); update() }
  for (const id of ['pSeed', 'pMood', 'pShape', 'pPalette', 'pBg', 'pBgColor', 'pGradient', 'pFlip', 'pBorder']) $(id).addEventListener('input', update)
  $('pDice').onclick = () => { $('pSeed').value = rnd(); update() }
  $('pShuffle').onclick = () => {
    const c = randomConfig($('pStyle').value)
    $('pSeed').value = c.seed ?? rnd(); $('pMood').value = c.mood ?? 'neutral'; $('pShape').value = c.shape ?? 'circle'
    $('pPalette').value = c.palette ?? ''; $('pGradient').checked = !!c.gradient; $('pFlip').checked = !!c.flip; $('pBorder').checked = !!c.border
    $('pBg').value = c.background === false ? 'none' : typeof c.background === 'string' ? 'custom' : ''
    if (/^#[\da-f]{6}$/i.test(c.background)) $('pBgColor').value = c.background
    optionControls($('pStyle').value, c.options); update()
  }
  const flash = async (btn, text, label) => { try { await navigator.clipboard.writeText(text); btn.textContent = 'Copied!' } catch { prompt('Copy:', text) } setTimeout(() => (btn.textContent = label), 1200) }
  $('pCopy').onclick = (e) => flash(e.currentTarget, code, 'Copy code')
  $('pSnip').onclick = (e) => flash(e.currentTarget, $('pSnipText').textContent, 'Copy snippet')
  $('pSvg').onclick = () => {
    const a = el('a', { href: URL.createObjectURL(new Blob([createAvatar(styles[$('pStyle').value], { ...read(), size: 256 })], { type: 'image/svg+xml' })), download: `livatar-${$('pSeed').value || 'avatar'}.svg` })
    a.click(); URL.revokeObjectURL(a.href)
  }
  optionControls($('pStyle').value); update()
  // tabs
  const mode = (m) => {
    $('panePick').hidden = m !== 'pick'; $('paneCode').hidden = m !== 'code'
    $('tabPick').setAttribute('aria-selected', m === 'pick'); $('tabCode').setAttribute('aria-selected', m === 'code')
    if (m === 'code') run()
  }
  $('tabPick').onclick = () => mode('pick'); $('tabCode').onclick = () => mode('code')
}
const SAVED = 'livatar-custom-src'
const LIB = new URL('../../dist/index.js', import.meta.url).href
const src = $('src')
try { src.value = localStorage.getItem(SAVED) || DEFAULT_SRC } catch { src.value = DEFAULT_SRC }
let eh = [], mod = null
for (const m of MOODS) $('eMoods').append(el('button', { type: 'button', class: 'ghost sm', text: m, onclick: () => eh.forEach((h) => h.emote(m)) }))
async function run() {
  try {
    const code = src.value.replace(/from\s+['"]livatar['"]/g, `from '${LIB}'`)
    const m = await import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })))
    const style = Object.values(m).find((v) => v && typeof v.render === 'function')
    if (!style) throw new Error('Export a style: export const mine = defineStyle({ … render() { … } })')
    mod = style
    const seed = $('eSeed').value
    eh.forEach((h) => h.destroy()); $('eGal').innerHTML = ''
    eh = Array.from({ length: 8 }, (_, i) => mount(box($('eGal')), style, { seed: i ? `${seed}-${i}` : seed, title: `${style.name} ${i}` }))
    $('eErr').textContent = ''
    try { localStorage.setItem(SAVED, src.value) } catch {}
  } catch (e) { $('eErr').textContent = String(e.message || e) }
}
let rt
const later = () => { clearTimeout(rt); rt = setTimeout(run, 350) }
src.addEventListener('input', later)
$('eSeed').addEventListener('input', later)
src.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return
  e.preventDefault()
  const { selectionStart: s, selectionEnd: en } = src
  src.setRangeText('  ', s, en, 'end')
  later()
})
$('reset').onclick = () => { src.value = DEFAULT_SRC; run() }
$('copySrc').onclick = async (e) => {
  const b = e.currentTarget
  try { await navigator.clipboard.writeText(src.value); b.textContent = 'Copied!' } catch { prompt('Copy:', src.value) }
  setTimeout(() => (b.textContent = 'Copy code'), 1200)
}
$('submit').href = 'https://github.com/nuhmanpk/livatar/issues/new?' + new URLSearchParams({
  title: '[new character] ', labels: 'character,new style',
  body: '### Character idea\n(name and one line)\n\n### Source\nPaste your defineStyle code from https://nuhmanpk.github.io/livatar/characters/#create\n\n### I can open a PR\n- [ ] Yes',
})
if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView())
