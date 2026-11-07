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
button,.lv-tap{position:relative;transition:transform .18s cubic-bezier(.4,1.8,.5,1)}
button:active,.lv-tap:active{transform:scale(.94)}
.lv-ripple{position:absolute;border-radius:50%;pointer-events:none;background:currentColor;opacity:.22;transform:scale(0);animation:lv-ripple .55s ease-out forwards}
@keyframes lv-ripple{to{transform:scale(1);opacity:0}}
.lv-pop{animation:lv-pop .45s cubic-bezier(.4,1.8,.5,1)}
@keyframes lv-pop{0%{transform:scale(.6) rotate(-12deg)}100%{transform:none}}
@media (prefers-reduced-motion:reduce){.lv-theme *,.lv-burger span,button{transition:none!important}.lv-ripple{display:none}}
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
- Vue: 'livatar/vue' · Any framework: <livatar-avatar> from 'livatar/element' · Brand icons: icon(name) from 'livatar/icons'
- Login forms: bindForm(handle, form) → covers eyes on password fields, happy/sad on validation

Styles: buddy animal monster ghost emoji memoji clay planet dino alien food plant initials bot blob pixel ui device fruit drink vehicle tech money home office dev human
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
