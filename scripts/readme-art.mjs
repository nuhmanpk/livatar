// Generates the animated SVGs used in README.md (assets/*.svg).
// README images cannot run JS, so this bakes livatar's motion (gaze parallax,
// tilt, blink, talk, breathe, shy) into pure CSS keyframes using the same math
// as src/alive.ts. Run: npm run build && node scripts/readme-art.mjs
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createAvatar, defineStyle, MOODS, styles, blob, buddy, bot, pixel, animal, emoji } from '../dist/index.js'
import { icon, badge } from '../dist/icons.js'

const out = fileURLToPath(new URL('../assets/', import.meta.url))
const STYLES = styles
const f = (n) => +n.toFixed(2)
const pc = (n) => `${f(n)}%`

// deterministic randomness so the art doesn't churn on every run
let s0 = 0x9e3779b9
const rnd = () => ((s0 = (s0 + 0x6d2b79f5) | 0), (((s0 ^ (s0 >>> 15)) * (s0 | 1)) >>> 0) / 4294967296)
const rr = (a, b) => a + rnd() * (b - a)

/** Linear sample of [[pct, value...]] at pct. */
const sample = (pts, t) => {
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const [a, b] = [pts[i - 1], pts[i]]
      const k = (t - a[0]) / (b[0] - a[0] || 1)
      return a.slice(1).map((v, j) => v + (b[j + 1] - v) * k)
    }
  }
  return pts[pts.length - 1].slice(1)
}

/** Gaze vector in [-1,1] from an avatar centre towards a point (canvas units). */
const gazeTo = (cx, cy, px, py, range) => {
  const dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) + range
  return [Math.max(-1, Math.min(1, (dx / d) * 1.4)), Math.max(-1, Math.min(1, (dy / d) * 1.4))]
}

/** Blink keyframe points: closed amount 0..1, with optional held-closed segments. */
const eyePoints = (blinks, dur, held = []) => {
  const w = (0.075 / dur) * 100 // half a 150 ms blink, in %
  const pts = [[0, 0], [100, 0]]
  for (const b of blinks) pts.push([b - w, 0], [b, 1], [b + w, 0])
  for (const [a, b] of held) pts.push([a - 1.5, 0], [a, 1], [b, 1], [b + 1.5, 0])
  pts.sort((a, b) => a[0] - b[0])
  return pts.filter((p) => p[0] >= 0 && p[0] <= 100)
}

/** Mouth keyframe points: talking segments become a jittery open/close. */
const mouthPoints = (segments, dur) => {
  const pts = [[0, 0], [100, 0]]
  const step = (0.09 / dur) * 100
  for (const [a, b] of segments) {
    pts.push([a - step, 0])
    let i = 0
    for (let t = a; t < b; t += step) pts.push([t, i++ % 2 ? rr(0.05, 0.2) : rr(0.45, 1)])
    pts.push([b, 0])
  }
  return pts.sort((a, b) => a[0] - b[0])
}

let uid = 0
/**
 * Render one avatar as a nested <svg> plus the CSS that animates it.
 * gaze: [[pct, x, y]], eyes: [[pct, closed]], mouth: [[pct, open]], shy: [[pct, 0..1]].
 */
function actor(style, { seed, x, y, size, shape = 'circle', dur, gaze, eyes, mouth, poke = [], shy = [[0, 0], [100, 0]], background, options, mood }) {
  const c = `a${(uid++).toString(36)}`
  let svg = createAvatar(style, { seed, size, shape, background, options, mood })
  // unique ids per actor so <defs> never collide inside one file
  svg = svg.replace(/\b(lv[a-z0-9]+)-/g, `${c}$1-`)
  svg = svg.replace(/^<svg[^>]*?viewBox="([^"]+)"[^>]*>/, `<svg x="${f(x)}" y="${f(y)}" width="${size}" height="${size}" viewBox="$1">`)

  const css = []
  const kf = (name, pts, fn) =>
    css.push(`@keyframes ${c}${name}{${pts.map((p) => `${pc(p[0])}{transform:${fn(...p.slice(1))}}`).join('')}}`)
  const anim = (name, extra = '') =>
    `animation:${c}${name} ${dur}s ${extra || 'ease-in-out'} infinite`
  const keys = new Map()

  svg = svg.replace(/<([a-z]+)([^>]*?data-lv-[^>]*?)(\/?)>/g, (tag, el, attrs, close) => {
    const d = +(attrs.match(/data-lv-depth="([^"]*)"/)?.[1] || 0)
    const t = +(attrs.match(/data-lv-tilt="([^"]*)"/)?.[1] || 0)
    const m = attrs.match(/data-lv-mouth="([^"]*)"/)?.[1]
    const k = /data-lv-float="drip"/.test(attrs) ? 'fd'
      : /data-lv-float/.test(attrs) ? 'f'
      : /data-lv-shy/.test(attrs) ? 's'
      : /data-lv-eye/.test(attrs) ? 'e'
      : m != null ? `m${m}`
      : /data-lv-body/.test(attrs) ? 'b'
      : d || t ? `g${d}_${t}`
      : null
    if (!k) return tag
    const cls = `${c}${k.replace(/\./g, 'p')}`
    keys.set(cls, { k, d, t, m: +m })
    return `<${el}${attrs} class="${cls}"${close}>`
  })

  for (const [cls, { k, d, t, m }] of keys) {
    const name = cls.slice(c.length)
    if (k === 'f' || k === 'fd') {
      // bob (zzz, hearts) or drip (tears)
      const drip = k === 'fd'
      const bob = drip ? `0%{transform:translateY(0);opacity:1}100%{transform:translateY(7px);opacity:0}` : `0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}`
      css.push(`@keyframes ${c}${name}{${bob}}.${cls}{animation:${c}${name} ${drip ? 1.6 : 1.9}s ease-in-out infinite}`)
    } else if (k === 's') {
      css.push(`@keyframes ${c}${name}{${shy.map(([p, v]) => `${pc(p)}{opacity:${v > 0.01 ? 1 : 0};transform:translateY(${f((1 - v) * 48)}px)}`).join('')}}`)
      css.push(`.${cls}{${anim(name)}}`)
    } else if (k === 'e') {
      kf(name, eyes, (v) => `scaleY(${f(1 - 0.9 * v)})`)
      css.push(`.${cls}{transform-origin:50% 50%;${anim(name, 'linear')}}`)
    } else if (k[0] === 'm') {
      kf(name, mouth, (v) => `scale(${f(1 - v * 0.08)},${f(1 + v * m)})`)
      css.push(`.${cls}{transform-origin:50% 0%;${anim(name, 'linear')}}`)
    } else if (k === 'b') {
      // breathe, plus a squash wobble on poke
      const pts = []
      for (let p = 0; p <= 100; p += 2.5) pts.push([p, Math.sin((p / 100) * dur * 1000 / 620) * 0.013, 0])
      for (const p0 of poke) {
        const w = (0.52 / dur) * 100
        for (let i = 0; i <= 10; i++) {
          const q = i / 10
          pts.push([p0 + q * w, 0, Math.sin(q * Math.PI * 3) * (1 - q) * 0.12])
        }
      }
      pts.sort((a, b) => a[0] - b[0])
      const clean = pts.filter((p, i) => !poke.some((p0) => p[0] > p0 - 2.5 && p[0] < p0 + (0.52 / dur) * 100 && p[2] === 0 && i))
      kf(name, clean, (br, sq) => `scale(${f(1 - br * 0.4 + sq * 0.7)},${f(1 + br - sq)})`)
      css.push(`.${cls}{transform-origin:50% 100%;${anim(name, 'linear')}}`)
    } else {
      kf(name, gaze, (gx, gy) => `translate(${f(gx * d * 4)}px,${f(gy * d * 4)}px) rotate(${f(gx * t)}deg)`)
      css.push(`.${cls}{transform-origin:50% 50%;${anim(name)}}`)
    }
  }
  return { svg, css: css.join('\n') }
}

const doc = (w, h, body, css, extraCss = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
<style>
[class]{transform-box:fill-box}
${extraCss}
${css}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
</style>
${body}
</svg>
`

const LIGHT = `.bg{fill:#fbf8f3}.line{stroke:#ece6dc}.card{fill:#ffffff}.fg{fill:#1f1a2e}.muted{fill:#6b6478}.field{fill:#ffffff}.accent{stroke:#7f5af0}.btn{fill:#ffffff;stroke:#ece6dc}`
const DARK = `.bg{fill:#14121c}.line{stroke:#2b2738}.card{fill:#1d1a28}.fg{fill:#f2eefb}.muted{fill:#a39db3}.field{fill:#14121c}.accent{stroke:#7f5af0}.btn{fill:#1d1a28;stroke:#3a3450}`
const FONTS = `text{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}`
/** 'auto' follows the OS; README cards ship explicit light/dark files for <picture> instead (GitHub's theme ≠ OS theme). */
const theme = (mode = 'auto') => (mode === 'light' ? LIGHT : mode === 'dark' ? DARK : `${LIGHT}@media (prefers-color-scheme: dark){${DARK}}`) + FONTS
const THEME = theme()

const blinksFor = (dur) => Array.from({ length: Math.max(1, Math.round(dur / rr(2.6, 4.5))) }, () => rr(3, 97))
const cursor = '<path d="M0 0L0 22L6 16.5L10.5 26L14 24.5L9.6 15.2L17.5 15Z" fill="#1f1a2e" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>'

/* ---------------- hero: a wall of nuhmanpk avatars watching a roaming point ---------------- */
{
  const W = 1200, H = 392, size = 80, gap = 12, cols = 13, rows = 4, dur = 14
  const ox = (W - (cols * size + (cols - 1) * gap)) / 2, oy = (H - (rows * size + (rows - 1) * gap)) / 2
  const path = [[0, 600, 200], [12, 600, 200], [22, 120, 90], [34, 140, 330], [46, 640, 380], [58, 1100, 300], [70, 1080, 70], [82, 600, -40], [92, 600, 200], [100, 600, 200]]
  const names = Object.keys(STYLES).filter((n) => n !== 'pixel' || true), shapes = ['circle', 'rounded', 'circle', 'squircle']
  const parts = []
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
    const i = r * cols + q
    const x = ox + q * (size + gap), y = oy + r * (size + gap), cx = x + size / 2, cy = y + size / 2
    const lag = rr(0, 2.5)
    const gaze = path.map(([p]) => [p, ...gazeTo(cx, cy, ...sample(path, Math.max(0, p - lag)), 260)])
    const talk = rnd() < 0.18 ? [[rr(5, 60), 0]].map(([a]) => [a, a + rr(6, 14)]) : []
    parts.push(actor(STYLES[names[(i * 5 + r * 3) % names.length]], {
      seed: i === 45 ? 'nuhmanpk' : `nuhmanpk-${i}`, x, y, size, dur,
      shape: shapes[(q + r * 3) % 4] === 'squircle' ? 'rounded' : shapes[(q + r * 3) % 4],
      gaze, eyes: eyePoints(blinksFor(dur), dur), mouth: mouthPoints(talk, dur),
      poke: rnd() < 0.08 ? [rr(10, 80)] : [],
    }))
  }
  await mkdir(out, { recursive: true })
  await writeFile(`${out}hero.svg`, doc(W, H, parts.map((p) => p.svg).join('\n'), parts.map((p) => p.css).join('\n')))
}

/* ---------------- demo: four big avatars follow an animated cursor, one gets clicked ---------------- */
{
  const W = 880, H = 236, size = 150, dur = 11, gap = 40, top = 52
  const ox = (W - (4 * size + 3 * gap)) / 2
  // cursor path in canvas units (tip position)
  const path = [[0, 440, 200], [8, 440, 200], [20, 70, 50], [30, 90, 205], [42, 800, 205], [52, 820, 45], [62, 440, 40], [72, 330, 140], [80, 330, 140], [90, 440, 200], [100, 440, 200]]
  const clickAt = 76
  const parts = [buddy, animal, bot, emoji].map((style, i) => {
    const x = ox + i * (size + gap), cx = x + size / 2, cy = top + size / 2
    const gaze = path.map(([p, px, py]) => [p, ...gazeTo(cx, cy, px, py, 140)])
    const hit = i === 1 // cursor lands on the buddy
    return actor(style, {
      seed: 'nuhmanpk', x, y: top, size, dur, shape: i === 2 ? 'rounded' : i === 3 ? 'square' : 'circle', gaze,
      eyes: eyePoints(blinksFor(dur), dur), mouth: mouthPoints(hit ? [[clickAt + 1, clickAt + 9]] : i === 2 ? [[24, 36]] : [], dur),
      poke: hit ? [clickAt] : [],
    })
  })
  const cur = `@keyframes cur{${path.map(([p, x, y]) => `${pc(p)}{transform:translate(${x}px,${y}px)}`).join('')}}
#cur{animation:cur ${dur}s ease-in-out infinite}
@keyframes clk{0%,${pc(clickAt - 0.2)}{opacity:0;transform:scale(.2)}${pc(clickAt)}{opacity:.55;transform:scale(.4)}${pc(clickAt + 4)}{opacity:0;transform:scale(1.4)}100%{opacity:0}}
#clk{transform-origin:330px 140px;animation:clk ${dur}s linear infinite}`
  const body = `<rect class="card line" x="1" y="1" width="${W - 2}" height="${H - 2}" rx="20" stroke-width="2"/>
<text class="muted" x="${W / 2}" y="32" text-anchor="middle" font-size="15">same seed, four styles · they follow the cursor, blink, breathe, and squash when clicked</text>
${parts.map((p) => p.svg).join('\n')}
<circle id="clk" cx="330" cy="140" r="34" fill="none" stroke="#7f5af0" stroke-width="4"/>
<g id="cur">${cursor}</g>`
  await writeFile(`${out}demo.svg`, doc(W, H, body, parts.map((p) => p.css).join('\n'), THEME + cur))
}

/* ---------------- login: watches the caret, covers its eyes on password (compact, light + dark) ---------------- */
for (const mode of ['light', 'dark']) {
  const W = 520, H = 150, size = 108, dur = 12, fx = 152, fw = 350, f1 = 38, f2 = 96, fh = 36
  const email = 'nuhmanpk@github.com', pass = '••••••••••'
  const cw = 8.4 // monospace advance at 14px
  const [e0, e1, p0, p1, end] = [8, 40, 50, 74, 86]
  const ax = 22, ay = (H - size) / 2, cx = ax + size / 2, cy = ay + size / 2
  const caret = (n, fy) => [fx + 14 + n * cw, fy + fh / 2]
  const gaze = [
    [0, 0, 0], [5, 0, 0],
    [e0, ...gazeTo(cx, cy, ...caret(0, f1), 90)],
    [e1, ...gazeTo(cx, cy, ...caret(email.length, f1), 90)],
    [p0 - 4, ...gazeTo(cx, cy, ...caret(0, f2), 90)],
    [p0 + 3, -1, 0.45], [p1, -1, 0.45], [end, 0, 0], [100, 0, 0],
  ]
  const keyTaps = Array.from({ length: email.length }, (_, i) => e0 + ((e1 - e0) * i) / email.length)
  const mouth = [[0, 0]]
  for (const t of keyTaps) mouth.push([t, 0], [t + 0.25, 0.55], [t + 1.4, 0.05])
  mouth.push([100, 0])
  const a = actor(buddy, {
    seed: 'nuhmanpk', x: ax, y: ay, size, dur, gaze, mouth,
    eyes: eyePoints([3, 44, 92], dur, [[p0 + 2, p1]]),
    shy: [[0, 0], [p0, 0], [p0 + 4, 1], [p1, 1], [p1 + 4, 0], [100, 0]],
  })
  const reveal = (id, n, t0, t1) => {
    const w = n * cw + 4
    return `@keyframes ${id}{0%,${pc(t0)}{transform:translateX(0)}${pc(t1)},${pc(end + 6)}{transform:translateX(${f(w)}px)}${pc(end + 6.01)},100%{transform:translateX(0)}}
#${id}{animation:${id} ${dur}s steps(${n},end) infinite}`
  }
  const focus = `@keyframes fo1{0%,${pc(e0 - 2)}{stroke-opacity:0}${pc(e0 - 1)},${pc(p0 - 2)}{stroke-opacity:1}${pc(p0 - 1)},100%{stroke-opacity:0}}
@keyframes fo2{0%,${pc(p0 - 2)}{stroke-opacity:0}${pc(p0 - 1)},${pc(end)}{stroke-opacity:1}${pc(end + 1)},100%{stroke-opacity:0}}
#fo1{animation:fo1 ${dur}s linear infinite}#fo2{animation:fo2 ${dur}s linear infinite}
@keyframes blinkc{0%,49%{opacity:1}50%,100%{opacity:0}}.car{animation:blinkc 1s steps(1) infinite}
`
  const field = (id, fy, label, text) => `<text class="muted" x="${fx}" y="${fy - 6}" font-size="11">${label}</text>
<rect class="field line" x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="10" stroke-width="1.5"/>
<rect id="fo${id}" x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="10" fill="none" class="accent" stroke-width="2"/>
<clipPath id="cl${id}"><rect x="${fx + 2}" y="${fy + 2}" width="${fw - 4}" height="${fh - 4}" rx="8"/></clipPath>
<g clip-path="url(#cl${id})"><text class="fg mono" x="${fx + 14}" y="${fy + fh / 2 + 5}" font-size="14">${text}</text>
<g id="rv${id}"><rect class="field" x="${fx + 12}" y="${fy + 3}" width="${fw}" height="${fh - 6}"/><rect class="car" x="${fx + 12}" y="${fy + 10}" width="1.5" height="${fh - 20}" fill="#7f5af0"/></g></g>`
  const body = `<rect class="card line" x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" stroke-width="1.5"/>
${a.svg}
${field(1, f1, 'email · it watches your caret', email)}
${field(2, f2, 'password · it covers its eyes', pass)}`
  const css = theme(mode) + focus + reveal('rv1', email.length, e0, e1) + '\n' + reveal('rv2', pass.length, p0 + 1, p1 - 6) + '\n'
  await writeFile(`${out}login-${mode}.svg`, doc(W, H, body, a.css, css))
}

/* ---------------- empty state: sleepy koala, "Check again" → surprised → sad + shake → sleepy ---------------- */
for (const mode of ['light', 'dark']) {
  const W = 360, H = 150, size = 72, dur = 10, ax = 18, ay = 62
  const T = { press: 34, surprised: 36, sad: 54, back: 80 } // % of the loop
  const still = [[0, 0, 0.2], [100, 0, 0.2]]
  // the sad phase shakes its head, like handle.shake()
  const shake = [[0, 0, 0.3], [T.sad, 0, 0.3]]
  for (let i = 1; i <= 8; i++) shake.push([T.sad + i * 1.1, (i % 2 ? 1 : -1) * 0.9 * (1 - i / 9), 0.3])
  shake.push([T.sad + 10, 0, 0.35], [100, 0, 0.35])
  const actors = [
    ['sleepy', still, [[0, 0], [100, 0]]],
    ['surprised', [[0, 0.3, -0.3], [T.surprised, 0.5, -0.1], [T.sad, 0.5, -0.1], [100, 0.5, -0.1]], [[0, 0], [100, 0]]],
    ['sad', shake, [[0, 0], [100, 0]]],
  ].map(([mood, gaze, eyes]) => actor(animal, { seed: 'inbox', mood, options: { species: 'koala' }, x: ax, y: ay, size, dur, gaze, eyes, mouth: [[0, 0], [100, 0]] }))
  const opacity = (id, pts) => `@keyframes ${id}{${pts.map(([p, v]) => `${pc(p)}{opacity:${v}}`).join('')}}#${id}{animation:${id} ${dur}s step-end infinite}`
  const sleepyVis = [[0, 1], [T.surprised, 0], [T.back, 1], [100, 1]]
  const surpVis = [[0, 0], [T.surprised, 1], [T.sad, 0], [100, 0]]
  const sadVis = [[0, 0], [T.sad, 1], [T.back, 0], [100, 0]]
  const tx = 106
  const css = theme(mode) +
    opacity('m0', sleepyVis) + opacity('m1', surpVis) + opacity('m2', sadVis) +
    opacity('t0', sleepyVis) + opacity('t1', surpVis) + opacity('t2', sadVis) +
    // cursor glides to the button and clicks
    `@keyframes cur{0%,${pc(T.press - 12)}{transform:translate(330px,150px)}${pc(T.press - 1)},${pc(T.press + 3)}{transform:translate(${tx + 52}px,${ay + 50}px)}${pc(T.press + 14)},100%{transform:translate(330px,160px)}}#cur{animation:cur ${dur}s ease-in-out infinite}` +
    `@keyframes press{0%,${pc(T.press - 0.5)},${pc(T.press + 1.5)},100%{transform:scale(1)}${pc(T.press)}{transform:scale(.94)}}#btn{transform-box:fill-box;transform-origin:50% 50%;animation:press ${dur}s linear infinite}`
  const body = `<rect class="card line" x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" stroke-width="1.5"/>
<text class="fg" x="18" y="30" font-size="15" font-weight="700">Empty state</text>
<text class="muted" x="18" y="49" font-size="12">Nothing here yet. Something sleepy instead of a blank box.</text>
${actors.map((a, i) => `<g id="m${i}">${a.svg}</g>`).join('\n')}
<g font-size="15" font-weight="700"><text id="t0" class="fg" x="${tx}" y="${ay + 24}">No new messages</text><text id="t1" class="fg" x="${tx}" y="${ay + 24}">Checking…</text><text id="t2" class="fg" x="${tx}" y="${ay + 24}">Still nothing.</text></g>
<g id="btn"><rect class="btn" x="${tx}" y="${ay + 36}" width="98" height="30" rx="9" stroke-width="1.5"/><text class="fg" x="${tx + 49}" y="${ay + 55.5}" font-size="13" text-anchor="middle">Check again</text></g>
<g id="cur">${cursor}</g>`
  await writeFile(`${out}empty-${mode}.svg`, doc(W, H, body, actors.map((a) => a.css).join('\n'), css))
}

/* ---------------- one row per style, each avatar idling on its own ---------------- */
const idleRow = async (file, list, { size = 88, gap = 14, dur = 10 } = {}) => {
  const W = list.length * size + (list.length - 1) * gap + 8, H = size + 8
  const parts = list.map(({ style, seed, shape, options, background, mood }, i) => {
    const gaze = [[0, 0, 0]]
    for (let p = rr(4, 10); p < 92; p += rr(10, 22)) {
      const g = [p, rr(-1, 1), rr(-0.8, 0.8)]
      gaze.push(g, [Math.min(96, p + rr(4, 8)), g[1], g[2]])
    }
    gaze.push([100, 0, 0])
    gaze.sort((a, b) => a[0] - b[0])
    return actor(style, {
      seed, x: 4 + i * (size + gap), y: 4, size, dur, shape, options, background, mood, gaze,
      eyes: eyePoints(blinksFor(dur), dur), mouth: mouthPoints(rnd() < 0.3 ? [[rr(10, 70), 0]].map(([a]) => [a, a + rr(5, 10)]) : [], dur),
    })
  })
  await writeFile(`${out}${file}.svg`, doc(W, H, parts.map((p) => p.svg).join('\n'), parts.map((p) => p.css).join('\n')))
}

for (const [name, style] of Object.entries(STYLES)) {
  await idleRow(`style-${name}`, Array.from({ length: 8 }, (_, i) => ({ style, seed: `nuhmanpk-${name}-${i}` })))
}

// one row per mood for the showcase styles, and every animal species
for (const [name, style] of [['emoji', emoji], ['animal', animal], ['buddy', buddy]])
  await idleRow(`moods-${name}`, MOODS.map((mood) => ({ style, seed: 'nuhmanpk', mood, options: name === 'animal' ? { species: 'shark' } : undefined })), { size: 84, gap: 10 })
await idleRow('moods-mixed', MOODS.map((mood, i) => ({ style: Object.values(STYLES)[i % 8], seed: 'nuhmanpk', mood })), { size: 84, gap: 10 })
const species = animal.variants.species
await idleRow('animals-1', species.slice(0, 8).map((s) => ({ style: animal, seed: 'nuhmanpk', options: { species: s } })))
await idleRow('animals-2', species.slice(8).map((s, i) => ({ style: animal, seed: 'nuhmanpk', options: { species: s }, mood: i % 3 === 0 ? 'happy' : undefined })))

await idleRow('shapes', [
  { style: buddy, seed: 'nuhmanpk', shape: 'circle' },
  { style: buddy, seed: 'nuhmanpk', shape: 'rounded' },
  { style: buddy, seed: 'nuhmanpk', shape: 'square' },
  { style: blob, seed: 'nuhmanpk', background: false },
  { style: bot, seed: 'nuhmanpk', options: { eyes: 'visor' } },
  { style: bot, seed: 'nuhmanpk', options: { eyes: 'happy', antenna: 'double' } },
  { style: pixel, seed: 'nuhmanpk', colors: undefined },
])

// the custom style from the README's "Write your own style" example
const jelly = defineStyle({
  name: 'jelly',
  colors: ['#e0e7ff', '#fce7f3', '#dcfce7', '#fef9c3'],
  render: ({ rand, color, background }) => `
    <g data-lv-body="">
      <path data-lv-depth=".3" d="M22 92V58a28 28 0 0 1 56 0v34l-7-5-7 5-7-5-7 5-7-5-7 5-7-5z" fill="${color(background)}" stroke="#1f1a2e" stroke-width="2.5"/>
      <g data-lv-depth="1">
        <ellipse data-lv-eye="" cx="40" cy="58" rx="3.2" ry="${rand.float(3.5, 5)}" fill="#1f1a2e"/>
        <ellipse data-lv-eye="" cx="60" cy="58" rx="3.2" ry="4.2" fill="#1f1a2e"/>
        <ellipse data-lv-mouth="1.5" cx="50" cy="70" rx="4" ry="2" fill="#1f1a2e"/>
      </g>
    </g>`,
})
await idleRow('custom', Array.from({ length: 5 }, (_, i) => ({ style: jelly, seed: `nuhmanpk-jelly-${i}` })))

// animated social icons + support badges for the README (our own livatar/icons)
await mkdir(`${out}icons`, { recursive: true })
const SOCIAL = { github: 'wiggle', linkedin: 'bounce', kaggle: 'pulse', x: 'tada', huggingface: 'jelly', npm: 'bounce' }
for (const [name, animation] of Object.entries(SOCIAL)) await writeFile(`${out}icons/${name}.svg`, icon(name, { animation, tile: 'circle', size: 36 }))
await writeFile(`${out}icons/sponsor.svg`, badge('githubsponsors', 'Sponsor', { animation: 'heartbeat', theme: 'light' }))
await writeFile(`${out}icons/coffee.svg`, badge('buymeacoffee', 'Buy me a coffee', { animation: 'tada' }))
await writeFile(`${out}icons/star.svg`, badge('github', 'Star on GitHub', { animation: 'wiggle', theme: 'dark' }))

console.log('README art → assets/')
