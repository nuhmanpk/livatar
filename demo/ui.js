// Shared site UI for every page (home, docs, icons). No dependencies.
//  • Theme toggle: sun ⇄ moon morph, and the new theme spreads in a circle from where you clicked (View Transitions)
//  • Hamburger ⇄ X on small screens, with a slide-down menu
//  • Spring press + ripple on every button, copy → check morph on copy buttons
const css = `
.lv-theme{position:relative;overflow:hidden}
.lv-theme svg{width:20px;height:20px;overflow:visible}
#theme .lv-sky svg,.lv-theme .lv-sky svg{width:100%!important;height:100%!important;display:block!important}
.lv-theme{display:grid!important;place-items:center}
.lv-theme .sun-core{transition:r .5s cubic-bezier(.5,1.6,.4,1)}
.lv-theme .rays{transform-origin:12px 12px;transition:transform .55s cubic-bezier(.5,1.6,.4,1),opacity .3s}
.lv-theme .bite{transition:cx .55s cubic-bezier(.5,1.4,.4,1),cy .55s cubic-bezier(.5,1.4,.4,1)}
:root[data-lv-dark] .lv-theme .sun-core{r:9px}
:root[data-lv-dark] .lv-theme .rays{transform:rotate(-90deg) scale(.4);opacity:0}
:root[data-lv-dark] .lv-theme .bite{cx:17px;cy:6px}
:root:not([data-lv-dark]) .lv-theme .bite{cx:30px;cy:-6px}
.lv-theme .stars path{opacity:0;transform-origin:center;transform-box:fill-box;transition:opacity .3s .25s,transform .5s .25s cubic-bezier(.5,1.8,.4,1);transform:scale(0)}
:root[data-lv-dark] .lv-theme .stars path{opacity:1;transform:scale(1)}
::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}
.lv-burger{display:none;width:38px;height:38px;padding:0;place-items:center;border-radius:12px;background:var(--card,#fff);color:var(--fg,#1f1a2e);border:1px solid var(--line,#ece6dc);cursor:pointer;flex:none}
.lv-burger span{display:block;width:18px;height:2px;border-radius:2px;background:currentColor;transition:transform .35s cubic-bezier(.6,1.6,.4,1),opacity .2s}
.lv-burger i{display:grid;gap:4px}
.lv-burger[aria-expanded="true"] span:nth-child(1){transform:translateY(6px) rotate(45deg)}
.lv-burger[aria-expanded="true"] span:nth-child(2){opacity:0;transform:scaleX(.2)}
.lv-burger[aria-expanded="true"] span:nth-child(3){transform:translateY(-6px) rotate(-45deg)}
@media (max-width:760px){
  .lv-burger{display:grid}
  header .nav-icons{margin-left:auto!important;border-left:0!important;padding-left:0!important}
  header .nav-icons a{width:32px!important;height:32px!important}
  header .lv-menu{position:fixed!important;left:12px;right:12px;top:62px;margin:0!important;display:grid!important;gap:2px!important;padding:8px!important;background:var(--card,#fff);border:1px solid var(--line,#ece6dc);border-radius:16px;box-shadow:0 18px 40px rgba(20,10,40,.18);transform-origin:top right;transform:scale(.9) translateY(-8px);opacity:0;pointer-events:none;transition:transform .3s cubic-bezier(.4,1.5,.4,1),opacity .2s;z-index:50;overflow:visible!important}
  header .lv-menu.open{transform:none;opacity:1;pointer-events:auto}
  header .lv-menu a{display:block!important;padding:10px 12px!important;font-size:15px!important}
  header .lv-menu .page{display:block!important}
  header .lv-menu .sep{display:block!important;width:auto!important;height:1px!important;margin:4px 6px!important}
}
/* the same compact header whenever the links do not fit, whatever the width (see the overflow check below) */
  html.lv-compact .lv-burger{display:grid}
  html.lv-compact header .nav-icons{margin-left:auto!important;border-left:0!important;padding-left:0!important}
  html.lv-compact header .nav-icons a{width:32px!important;height:32px!important}
  html.lv-compact header .lv-menu{position:fixed!important;left:12px;right:12px;top:62px;margin:0!important;display:grid!important;gap:2px!important;padding:8px!important;background:var(--card,#fff);border:1px solid var(--line,#ece6dc);border-radius:16px;box-shadow:0 18px 40px rgba(20,10,40,.18);transform-origin:top right;transform:scale(.9) translateY(-8px);opacity:0;pointer-events:none;transition:transform .3s cubic-bezier(.4,1.5,.4,1),opacity .2s;z-index:50;overflow:visible!important}
  html.lv-compact header .lv-menu.open{transform:none;opacity:1;pointer-events:auto}
  html.lv-compact header .lv-menu a{display:block!important;padding:10px 12px!important;font-size:15px!important}
  html.lv-compact header .lv-menu .page{display:block!important}
  html.lv-compact header .lv-menu .sep{display:block!important;width:auto!important;height:1px!important;margin:4px 6px!important}
button,.lv-tap{position:relative;transition:transform .18s cubic-bezier(.4,1.8,.5,1)}
button:active,.lv-tap:active{transform:scale(.94)}
.lv-ripple{position:absolute;border-radius:50%;pointer-events:none;background:currentColor;opacity:.22;transform:scale(0);animation:lv-ripple .55s ease-out forwards}
@keyframes lv-ripple{to{transform:scale(1);opacity:0}}
.lv-pop{animation:lv-pop .45s cubic-bezier(.4,1.8,.5,1)}
@keyframes lv-pop{0%{transform:scale(.6) rotate(-12deg)}100%{transform:none}}
.lv-roll{display:inline-block;animation:lv-roll .7s cubic-bezier(.3,.9,.4,1)}
@keyframes lv-roll{0%{transform:translateY(0) rotate(0) scale(1)}25%{transform:translateY(-14px) rotate(200deg) scale(1.25)}55%{transform:translateY(0) rotate(430deg) scale(.9)}75%{transform:translateY(-5px) rotate(620deg) scale(1.08)}100%{transform:translateY(0) rotate(720deg) scale(1)}}
@media (prefers-reduced-motion:reduce){.lv-roll{animation:none}.lv-theme *,.lv-burger span,button{transition:none!important}.lv-ripple{display:none}}
`
document.head.append(Object.assign(document.createElement('style'), { textContent: css }))

const root = document.documentElement
const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches)
const sync = () => root.toggleAttribute('data-lv-dark', isDark())
sync()
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', sync)

/* ---------- theme toggle ---------- */
const ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
<mask id="lv-moon"><rect x="-6" y="-6" width="36" height="36" fill="#fff"/><circle class="bite" cx="30" cy="-6" r="8" fill="#000"/></mask>
<circle class="sun-core" cx="12" cy="12" r="5" fill="currentColor" stroke="none" mask="url(#lv-moon)"/>
<g class="rays"><path d="M12 1.5v2.2M12 20.3v2.2M4.6 4.6l1.5 1.5M17.9 17.9l1.5 1.5M1.5 12h2.2M20.3 12h2.2M4.6 19.4l1.5-1.5M17.9 6.1l1.5-1.5"/></g>
<g class="stars" fill="currentColor" stroke="none"><path d="M20.5 3.5l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z"/><path d="M22 10l.35.8.8.35-.8.35L22 12.3l-.35-.8-.8-.35.8-.35z"/></g></svg>`

function flip(e) {
  const next = isDark() ? 'light' : 'dark'
  const apply = () => {
    root.dataset.theme = next
    sync()
    try { localStorage.setItem('livatar-theme', next) } catch {}
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduce) return apply()
  // the new theme grows as a circle from the click point
  const x = e.clientX || innerWidth - 40, y = e.clientY || 30
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  document.startViewTransition(apply).ready.then(() =>
    root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] }, { duration: 520, easing: 'cubic-bezier(.3,.7,.2,1)', pseudoElement: '::view-transition-new(root)' }),
  )
}
for (const b of document.querySelectorAll('#theme, [data-theme-toggle]')) {
  b.classList.add('lv-theme')
  b.innerHTML = ICON
  b.setAttribute('aria-pressed', String(isDark()))
}
// capture phase: runs before (and replaces) any page-level handler
document.addEventListener('click', (e) => {
  const b = e.target.closest?.('#theme, [data-theme-toggle]')
  if (!b) return
  e.stopImmediatePropagation()
  e.preventDefault()
  flip(e)
  b.setAttribute('aria-pressed', String(isDark()))
}, true)

/* ---------- hamburger ---------- */
const nav = document.querySelector('header nav')
if (nav) {
  nav.classList.add('lv-menu')
  nav.id ||= 'lv-site-menu'
  const burger = Object.assign(document.createElement('button'), { type: 'button', className: 'lv-burger', innerHTML: '<i><span></span><span></span><span></span></i>' })
  burger.setAttribute('aria-label', 'Menu')
  burger.setAttribute('aria-controls', nav.id)
  burger.setAttribute('aria-expanded', 'false')
  const set = (open) => { nav.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open)) }
  burger.onclick = () => set(!nav.classList.contains('open'))
  nav.addEventListener('click', (e) => e.target.closest('a') && set(false))
  document.addEventListener('keydown', (e) => e.key === 'Escape' && set(false))
  document.addEventListener('click', (e) => !nav.contains(e.target) && !burger.contains(e.target) && set(false))
  ;(document.querySelector('#theme') ?? nav).after(burger)
  // switch to the burger menu as soon as the links would overflow (more header buttons, long labels, zoom…)
  const fit = () => {
    const root = document.documentElement
    root.classList.remove('lv-compact')
    if (innerWidth > 760 && nav.scrollWidth > nav.clientWidth + 1) root.classList.add('lv-compact')
    else set(false)
  }
  addEventListener('resize', fit); new ResizeObserver(fit).observe(nav.closest('header') ?? nav); fit()
}

/* ---------- press ripple + copy pop ---------- */
document.addEventListener('pointerdown', (e) => {
  const b = e.target.closest?.('button, .lv-tap')
  if (!b || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2
  const dot = Object.assign(document.createElement('span'), { className: 'lv-ripple' })
  Object.assign(dot.style, { width: d + 'px', height: d + 'px', left: e.clientX - r.left - d / 2 + 'px', top: e.clientY - r.top - d / 2 + 'px' })
  if (getComputedStyle(b).overflow === 'visible') b.style.overflow = 'hidden'
  b.append(dot)
  dot.addEventListener('animationend', () => dot.remove())
})
// whenever a copy button swaps its icon to the check, pop it
new MutationObserver((ms) => {
  for (const m of ms) if (m.target.classList?.contains('copy-btn') && /M5 12l5 5/.test(m.target.innerHTML)) {
    m.target.classList.remove('lv-pop'); void m.target.offsetWidth; m.target.classList.add('lv-pop')
  }
}).observe(document.body, { subtree: true, childList: true })

/* ---------- random living logo + favicon on every load ---------- */
// ui.js sits next to dist/ on the site root, and one level below it in the repo's demo/
;(async () => {
  let lib
  for (const p of ['./dist/index.js', '../dist/index.js', '../../dist/index.js']) {
    try { lib = await import(new URL(p, import.meta.url).href); break } catch {}
  }
  if (!lib) return
  const { mountCode, render, randomConfig } = lib
  const cfg = { ...randomConfig(), mood: Math.random() < 0.5 ? 'happy' : 'neutral', shape: 'rounded' }
  const logo = document.querySelector('.brand img, .brand .logo, header .brand > svg')
  if (logo) {
    const slot = Object.assign(document.createElement('span'), { title: 'A new livatar every visit' })
    slot.style.cssText = 'display:inline-block;width:28px;height:28px;flex:none;line-height:0'
    logo.replaceWith(slot)
    mountCode(slot, cfg, { alive: { intensity: 1.4 } })
  }
  // theme button: a living sun (light) / moon (dark) that reacts to you
  const skyCfg = (dark) => ({ style: 'planet', scale: dark ? 1.45 : 1.12, seed: dark ? 'night' : 'day', mood: dark ? 'sleepy' : 'happy', background: false, options: { kind: dark ? 'moon' : 'sun', satellite: false, stars: dark } })
  for (const b of document.querySelectorAll('#theme, [data-theme-toggle]')) {
    const slot = Object.assign(document.createElement('span'), { className: 'lv-sky' })
    slot.style.cssText = 'display:block;width:38px;height:38px;line-height:0;transition:transform .5s cubic-bezier(.4,1.6,.4,1)'
    Object.assign(b.style, { background: 'transparent', border: '0', width: '40px', height: '40px', padding: '0', overflow: 'visible' })
    b.innerHTML = ''
    b.append(slot)
    let h = mountCode(slot, skyCfg(isDark()), { alive: { intensity: 1.5, pokeMood: 'surprised' } })
    b.addEventListener('pointerenter', () => h.emote(isDark() ? 'wink' : 'love', 900))
    new MutationObserver(() => {
      const dark = isDark()
      if (slot.dataset.dark === String(dark)) return
      slot.dataset.dark = String(dark)
      slot.style.transform = 'rotate(-200deg) scale(.4)'
      setTimeout(() => {
        h.destroy()
        h = mountCode(slot, skyCfg(dark), { alive: { intensity: 1.5 } })
        h.emote('surprised', 600)
        slot.style.transform = ''
      }, 220)
    }).observe(root, { attributes: true, attributeFilter: ['data-lv-dark'] })
    slot.dataset.dark = String(isDark())
  }

  const fav = document.querySelector('link[rel="icon"]')
  if (fav) {
    fav.type = 'image/svg+xml'
    fav.href = 'data:image/svg+xml;utf8,' + encodeURIComponent(render(cfg, { size: 64 }))
  }
})()

// ── Copy for AI agents ───────────────────────────────────────────────
// Any <button data-agent-copy data-agent-task="…"> copies one prompt that gives a coding agent
// (Claude Code, Cursor, Copilot, Codex, Windsurf…) the docs, skill, llms.txt and examples.
;(() => {
  const SITE = 'https://nuhmanpk.github.io/livatar/'
  const prompt = (task = '') => `I want to use livatar in this project: tiny, zero-dependency SVG avatars and icons that are alive (follow the cursor, blink, breathe, react to typing and passwords, 10 moods).

Before writing code, read the docs (short and written for agents):
- Full API + examples: ${SITE}llms-full.txt
- Agent skill (how to use it well): ${SITE}SKILL.md
- Index: ${SITE}llms.txt
- Human docs: ${SITE}docs/ · Visual builder (shareable codes): ${SITE}docs/#builder · Animated icons: ${SITE}icons/
- Source: https://github.com/nuhmanpk/livatar · After install, also node_modules/livatar/AGENTS.md

Install: npm i livatar   (optional: npx livatar skill  → installs the skill into .claude/skills)

Entry points:
- Static SVG / SSR / email: import { createAvatar, buddy } from 'livatar'; createAvatar(buddy, { seed: 'ada', mood: 'happy' })
- Animated: import { mount, buddy } from 'livatar'; const h = mount(el, buddy, { seed: 'ada', size: 64 }); h.emote('love', 900); h.nod()
- From a config or code: mountCode(el, { style: 'planet', mood: 'happy', options: { kind: 'sun' } })
- React / Next.js: import { LivatarCode } from 'livatar/react'; <LivatarCode variant="animal" seed={user.id} size={48} />  (already 'use client'; SSR renders static SVG)
- Vue: 'livatar/vue' · Any framework: <live-avatar> from 'livatar/element' · Brand icons: icon(name) from 'livatar/icons'
- Login forms: bindForm(handle, form) → covers eyes on password fields, happy/sad on validation

Styles: buddy animal monster ghost emoji memoji clay planet dino alien food plant initials bot blob pixel ui device fruit drink vehicle tech money home office dev human anime chibi toon notion flat lowpoly sketch retro
Moods: neutral happy sad angry surprised sleepy love wink silly confused

Rules: same seed = same avatar; don't invent options (check llms-full.txt); wrap interactive ones in a <button> with an aria-label; use describe(config) for alt text.

Task: ${task}`
  window.livatarAgentPrompt = prompt

  document.head.append(Object.assign(document.createElement('style'), { textContent: `
.lv-agent{font:inherit;font-size:14px;font-weight:600;padding:8px 14px;border-radius:999px;border:1px solid var(--line,#ddd);background:var(--card,#fff);color:inherit;cursor:pointer;display:inline-flex;gap:8px;align-items:baseline;flex-wrap:wrap}
.lv-agent small{font-weight:400;opacity:.65;font-size:12px}
@media (max-width:640px){.lv-agent small{display:none}}
.lv-agent:hover{border-color:var(--accent,#7f5af0)}
.lv-agent-dlg{border:1px solid var(--line,#ddd);border-radius:20px;padding:24px;max-width:min(420px,calc(100vw - 32px));background:var(--card,#fff);color:var(--fg,inherit);text-align:center}
.lv-agent-dlg::backdrop{background:rgba(0,0,0,.45)}
.lv-agent-dlg h2{margin:12px 0 6px;font-size:22px}
.lv-agent-dlg p{margin:6px 0;font-size:15px}
.lv-agent-dlg .muted{opacity:.7;font-size:13px}
.lv-agent-dlg form{display:flex;justify-content:center;margin-top:14px}` }))

  let dlg
  const show = () => {
    if (!dlg) {
      dlg = document.createElement('dialog'); dlg.className = 'lv-agent-dlg'; dlg.setAttribute('aria-labelledby', 'lvAgentT')
      dlg.innerHTML = `<div style="font-size:40px;line-height:1" aria-hidden="true">🚀</div>
<h2 id="lvAgentT">You're ready to ship livatar</h2>
<p>The setup prompt is on your clipboard. Paste it into your coding agent and say what to build. Works with Claude Code, Cursor, Copilot, Codex, Windsurf, and any other agent.</p>
<p class="muted">It links the docs, <a href="${SITE}llms-full.txt">llms-full.txt</a> and the <a href="${SITE}SKILL.md">agent skill</a>, with working examples.</p>
<form method="dialog"><button class="lv-agent" autofocus>Got it</button></form>`
      dlg.onclick = (e) => { if (e.target === dlg) dlg.close() }
      document.body.append(dlg)
    }
    dlg.showModal()
  }
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text) } catch {
      const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select(); document.execCommand('copy'); t.remove()
    }
  }
  window.livatarAgentCopy = async (task) => { await copy(prompt(task)); show() }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-agent-copy]'); if (!b) return
    window.livatarAgentCopy(b.dataset.agentTask || '')
  })
})()

// site kit: footer, breadcrumbs, scroll progress, username reserve (see kit.js)
import('./kit.js').catch((e) => console.warn('kit', e))

// 🎲 → livatar cube: every dice emoji inside a button becomes an inline cube that tumbles on click
const CUBE = '<svg class="lv-cube" viewBox="0 0 24 24" width="1.25em" height="1.25em" aria-hidden="true" style="vertical-align:-.22em"><path d="M12 2.5l8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3z" fill="#8b6cf0" stroke="#4b2fb0" stroke-width="1.4" stroke-linejoin="round"/><path d="M3.5 7.3L12 12.1l8.5-4.8" fill="none" stroke="#4b2fb0" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 12.1v9.4" stroke="#4b2fb0" stroke-width="1.4"/><path d="M12 2.5l8.5 4.8L12 12.1 3.5 7.3z" fill="#b9a4ff"/><path d="M3.5 7.3L12 12.1v9.4l-8.5-4.8z" fill="#7556e0"/><circle cx="12" cy="7.3" r="1.1" fill="#fff"/><circle cx="7.6" cy="14.6" r="1" fill="#fff"/><circle cx="16.4" cy="14.6" r="1" fill="#fff"/><circle cx="14.6" cy="16" r="1" fill="#fff" opacity="0"/></svg>'
const cubify = (root) => {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.nodeValue.includes('🎲') && n.parentElement?.closest('button') ? 1 : 3 })
  const hits = []; while (w.nextNode()) hits.push(w.currentNode)
  for (const n of hits) {
    const parts = n.nodeValue.split('🎲'); const f = document.createDocumentFragment()
    parts.forEach((t, k) => { if (k) { const sp = document.createElement('span'); sp.className = 'lv-roll-wrap'; sp.style.display = 'inline-block'; sp.innerHTML = CUBE; f.append(sp) } if (t) f.append(t) })
    n.replaceWith(f)
  }
}
cubify(document.body)
new MutationObserver((ms) => { for (const m of ms) for (const a of m.addedNodes) if (a.nodeType === 1) cubify(a); else if (a.nodeType === 3 && a.parentElement) cubify(a.parentElement) }).observe(document.body, { subtree: true, childList: true })
document.addEventListener('click', (e) => {
  const b = e.target.closest?.('button'); const c = b?.querySelector('.lv-roll-wrap')
  if (!c || c.dataset.rolling) return
  c.dataset.rolling = '1'; c.classList.remove('lv-roll'); void c.offsetWidth; c.classList.add('lv-roll')
  setTimeout(() => { c.classList.remove('lv-roll'); delete c.dataset.rolling }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 750)
}, true)

/* ---------- roaming animals: full-body pets, OFF by default.
   One 🐾 button in the header cycles: off → pets (muted) → pets with sound → off. ---------- */
;(async () => {
  const theme = document.querySelector('#theme')
  const KEY = 'livatar:roam'          // 'on' | 'sound' | absent
  const read = () => { try { return localStorage.getItem(KEY) } catch { return null } }
  const save = (v) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY) } catch {} }
  const st = document.createElement('style')
  st.textContent = `#paw{position:relative;width:36px;height:36px;padding:0;display:grid;place-items:center;border-radius:50%;background:var(--card,#fff);color:var(--fg,#1f1a2e);border:1px solid var(--line,#ece6dc);flex:none;cursor:pointer;transition:background .2s,border-color .2s,transform .2s}
#paw svg{width:18px;height:18px}#paw:hover{transform:translateY(-1px)}
#paw[data-mode=on],#paw[data-mode=sound]{background:var(--brand,#7f5af0);border-color:var(--brand,#7f5af0);color:#fff}
#paw{display:inline-flex;align-items:center;justify-content:center;gap:5px;width:auto;min-width:36px;padding:0 9px;border-radius:999px}
#paw .snd{display:none;line-height:0}#paw .snd svg{width:16px;height:16px}
#paw[data-mode=on] .snd,#paw[data-mode=sound] .snd{display:inline-block}
#paw .snd .on{display:none}#paw[data-mode=sound] .snd .on{display:inline}#paw[data-mode=sound] .snd .off{display:none}
#paw.float{position:fixed;left:14px;bottom:14px;z-index:60}
@media (max-width:640px){#paw{min-width:32px;height:32px;padding:0 7px}}`
  document.head.append(st)
  const btn = document.createElement('button')
  btn.id = 'paw'; btn.type = 'button'
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><ellipse cx="6.5" cy="10" rx="2.1" ry="2.8"/><ellipse cx="10.3" cy="5.8" rx="2.1" ry="2.8"/><ellipse cx="15.2" cy="5.8" rx="2.1" ry="2.8"/><ellipse cx="19" cy="10" rx="2.1" ry="2.8"/><path d="M12.7 11c-3 0-5.6 3.2-5.6 5.8 0 2 1.6 2.7 3.1 2.4 1-.2 1.6-.5 2.5-.5s1.5.3 2.5.5c1.5.3 3.1-.4 3.1-2.4 0-2.6-2.6-5.8-5.6-5.8z"/></svg><span class="snd" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 4V5L7 9z"/><g class="on" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"><path d="M15.5 9a4 4 0 010 6"/><path d="M18.5 6.5a8 8 0 010 11"/></g><g class="off" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M16 9.5l5 5M21 9.5l-5 5"/></g></svg></span>'
  let zoo = null, mod = null, mode = 'off'
  const LABEL = { off: 'Let animals roam this site', on: 'Animals are roaming (muted). Click for sounds', sound: 'Animals with sounds. Click to hide them' }
  const draw = () => { btn.dataset.mode = mode; btn.setAttribute('aria-label', LABEL[mode]); btn.title = LABEL[mode]; btn.setAttribute('aria-pressed', String(mode !== 'off')) }
  const load = async () => {
    if (mod) return mod
    for (const p of ['./dist/roam.js', '../dist/roam.js', '../../dist/roam.js']) {
      try { return (mod = await import(new URL(p, import.meta.url).href)) } catch {}
    }
  }
  const set = async (m, fromClick) => {
    if (m === 'off') { zoo?.destroy(); zoo = null }
    else {
      if (!zoo) { const lib = await load(); if (!lib) return; zoo = lib.roam({ count: innerWidth < 640 ? 2 : 3, sound: false }) }
      // audio needs a gesture: from a click it starts now, after a reload it waits for the first tap
      if (m === 'sound') { if (fromClick) zoo.sound = true; else addEventListener('pointerdown', () => { if (zoo && mode === 'sound') zoo.sound = true }, { once: true }) }
      else zoo.sound = false
    }
    mode = m; draw()
  }
  btn.onclick = () => { const next = mode === 'off' ? 'on' : mode === 'on' ? 'sound' : 'off'; save(next === 'off' ? null : next); set(next, true) }
  if (theme) theme.before(btn); else { btn.classList.add('float'); document.body.append(btn) }
  dispatchEvent(new Event('resize'))
  draw()
  const saved = read()
  if (saved === 'on' || saved === 'sound') set(saved, false) // only if the visitor switched it on before; never by default
})()
