// README scene engine: turns a scene description into one animated SVG file.
// README images can't run JavaScript, so every movement (gaze, blinks, talking,
// moods, a cursor tour, speech bubbles) is baked into CSS keyframes.
// Shares its motion math with scripts/readme-art.mjs.
import { createAvatar, styles } from '../../dist/index.js'
import { icon, ICONS } from '../../dist/icons.js'

const f = (n) => +n.toFixed(2)
const pc = (n) => `${f(n)}%`

// deterministic randomness so the art doesn't churn on every run
let s0 = 0x9e3779b9
const reseed = (n) => { s0 = n | 0 }
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

const blinksFor = (dur) => Array.from({ length: Math.max(1, Math.round(dur / rr(2.6, 4.5))) }, () => rr(3, 97))
const cursor = '<path d="M0 0L0 22L6 16.5L10.5 26L14 24.5L9.6 15.2L17.5 15Z" fill="#1f1a2e" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>'

const fadeCss = (cls, dur, windows) => {
  const pts = [[0, 0], [100, 0]]
  for (const [a, b] of windows) pts.push([a - 1.5, 0], [a, 1], [b, 1], [b + 1.5, 0])
  pts.sort((x, y) => x[0] - y[0])
  return `@keyframes ${cls}{${pts.map(([p, v]) => `${pc(Math.max(0, Math.min(100, p)))}{opacity:${v}}`).join('')}}.${cls}{opacity:0;animation:${cls} ${dur}s linear infinite}`
}
// visible during windows, hidden otherwise
const showCss = (cls, dur, windows, from = 0) => {
  const pts = [[0, from], [100, from]]
  for (const [a, b] of windows) pts.push([a - 1, from], [a, 1], [b, 1], [b + 1, from])
  pts.sort((x, y) => x[0] - y[0])
  return `@keyframes ${cls}{${pts.map(([p, v]) => `${pc(Math.max(0, Math.min(100, p)))}{opacity:${v}}`).join('')}}.${cls}{animation:${cls} ${dur}s linear infinite}`
}


const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const hash = (s) => { let x = 2166136261; for (const ch of String(s)) x = Math.imul(x ^ ch.charCodeAt(0), 16777619); return x >>> 0 }

/**
 * scene = {
 *   width, height (auto when omitted), duration (s), theme: 'auto'|'light'|'dark'|'transparent',
 *   title, subtitle, size, gap, shape,
 *   cursor: true → a cursor tours the cast and everyone watches it,
 *   cast: [{ style, seed, name, mood, options }],
 *   links: [{ icon: 'github', text, animation }] → a row of animated brand buttons (any livatar/icons name),
 *   beats: [{ at (s), for (s), who (index), do: 'say'|'mood'|'poke'|'look'|'sleep', text, mood, target (index) }],
 * }
 */
export function renderScene(scene) {
  uid = 0
  reseed(hash(JSON.stringify(scene)))
  const cast = scene.cast?.length ? scene.cast : [{ style: 'buddy', seed: 'livatar' }]
  const size = scene.size ?? 96, gap = scene.gap ?? 36, dur = Math.max(2, scene.duration ?? 12)
  const perRow = Math.max(1, Math.min(cast.length, scene.perRow ?? 8))
  const rows = Math.ceil(cast.length / perRow)
  const hasBubbles = (scene.beats ?? []).some((b) => b.do === 'say' && b.text)
  const named = cast.some((c) => c.name)
  const titleH = (scene.title ? 50 : 0) + (scene.subtitle ? 26 : 0)
  const bubbleH = hasBubbles ? 48 : 0
  const rowH = size + (named ? 30 : 0) + bubbleH
  const contentW = perRow * size + (perRow - 1) * gap
  const links = (scene.links ?? []).filter((l) => l && ICONS[l.icon])
  const pill = (l) => (l.text ? 54 : 44) + [...(l.text ?? '')].length * 8.2
  const linksW = links.reduce((a, l) => a + pill(l), 0) + Math.max(0, links.length - 1) * 10
  const W0 = Math.max(scene.width ?? 0, contentW + 64, scene.title ? Math.min(900, scene.title.length * 22 + 80) : 0)
  const linksH = links.length ? 58 : 0
  const W = Math.max(W0, linksW + 48)
  const H = Math.max(scene.height ?? 0, 28 + titleH + rows * rowH + (rows - 1) * 16 + linksH + 28)
  const top = 28 + titleH
  const slot = (i) => {
    const r = Math.floor(i / perRow), inRow = Math.min(perRow, cast.length - r * perRow)
    const ox = (W - (inRow * size + (inRow - 1) * gap)) / 2
    const x = ox + (i % perRow) * (size + gap), y = top + bubbleH + r * (rowH + 16)
    return { x, y, cx: x + size / 2, cy: y + size / 2 }
  }
  const P = (s) => Math.max(0, Math.min(100, (s / dur) * 100))
  const beats = (scene.beats ?? []).map((b) => ({ ...b, a: P(b.at ?? 0), b: P((b.at ?? 0) + (b.for ?? 2)) })).filter((b) => b.who == null || cast[b.who])

  // cursor tour: visit characters in a shuffled order, pause on each
  let cursorPts = null
  if (scene.cursor) {
    const order = cast.map((_, i) => i).sort(() => rnd() - 0.5)
    const stops = Math.max(3, Math.min(8, order.length + 1))
    cursorPts = [[0, W - 40, H - 30]]
    for (let k = 0; k < stops; k++) {
      const t = 6 + (k * 84) / stops, s = slot(order[k % order.length])
      const px = s.cx + rr(-size * 0.25, size * 0.25), py = s.cy + rr(-size * 0.1, size * 0.35)
      cursorPts.push([t, px, py], [t + 84 / stops - 5, px + rr(-6, 6), py + rr(-4, 4)])
    }
    cursorPts.push([96, W - 40, H - 30], [100, W - 40, H - 30])
  }

  const css = [], body = []
  const neutralGaze = [0, 0.1]
  cast.forEach((c, i) => {
    const style = styles[c.style] ?? styles.buddy
    const { x, y, cx, cy } = slot(i)
    const speaking = (t) => beats.find((b) => b.do === 'say' && b.who !== i && t >= b.a && t <= b.b)
    const looking = (t) => beats.find((b) => b.do === 'look' && b.who === i && t >= b.a && t <= b.b)
    const gaze = []
    for (let t = 0; t <= 100; t += 1) {
      const lk = looking(t), sp = speaking(t)
      let g = neutralGaze
      if (lk && cast[lk.target]) g = gazeTo(cx, cy, slot(lk.target).cx, slot(lk.target).cy, size)
      else if (lk && lk.target === 'left') g = [-0.9, 0.1]
      else if (lk && lk.target === 'right') g = [0.9, 0.1]
      else if (lk && lk.target === 'up') g = [0, -0.9]
      else if (sp) g = gazeTo(cx, cy, slot(sp.who).cx, slot(sp.who).cy, size)
      else if (cursorPts) g = gazeTo(cx, cy, ...sample(cursorPts, t), size * 1.2)
      gaze.push([t, +g[0].toFixed(2), +g[1].toFixed(2)])
    }
    // keep only the points where the gaze changes direction (keyframes stay small)
    const same = (p, q) => Math.abs(p[1] - q[1]) < 0.03 && Math.abs(p[2] - q[2]) < 0.03
    for (let j = gaze.length - 2; j > 0; j--) {
      const [p, q, r] = [gaze[j - 1], gaze[j], gaze[j + 1]]
      const mid = [(p[1] + r[1]) / 2, (p[2] + r[2]) / 2]
      if (same(p, q) && same(q, r)) gaze.splice(j, 1)
      else if (Math.abs(mid[0] - q[1]) < 0.02 && Math.abs(mid[1] - q[2]) < 0.02) gaze.splice(j, 1)
    }
    const sleeps = beats.filter((b) => b.who === i && b.do === 'sleep').map((b) => [b.a, b.b])
    const eyes = eyePoints(blinksFor(dur), dur, sleeps)
    const talk = beats.filter((b) => b.who === i && b.do === 'say').map((b) => [b.a, b.b])
    const poke = beats.filter((b) => b.who === i && b.do === 'poke').map((b) => b.a)
    const opts = { seed: c.seed || 'seed' + i, x, y, size, dur, gaze, eyes, mouth: mouthPoints(talk, dur), poke, shape: scene.shape ?? 'circle', options: c.options }
    const base = actor(style, { ...opts, mood: c.mood })
    css.push(base.css)
    let layers = base.svg
    // mood changes: the same character in another mood, faded in for its window
    const moodBeats = beats.filter((b) => b.who === i && (b.do === 'mood' || b.do === 'poke' || b.do === 'sleep') && (b.mood || b.do !== 'mood'))
    const byMood = new Map()
    for (const b of moodBeats) {
      const m = b.mood || (b.do === 'poke' ? 'surprised' : 'sleepy')
      if (!byMood.has(m)) byMood.set(m, [])
      byMood.get(m).push([b.a, b.do === 'poke' ? Math.min(100, b.a + P(1.2)) : b.b])
    }
    let k = 0
    for (const [m, windows] of byMood) {
      const alt = actor(style, { ...opts, mood: m })
      const cls = `mo${i}x${k++}`
      css.push(alt.css, fadeCss(cls, dur, windows))
      layers += `<g class="${cls}">${alt.svg}</g>`
    }
    body.push(`<g>${layers}</g>`)
    if (c.name) body.push(`<text x="${f(cx)}" y="${f(y + size + 22)}" text-anchor="middle" class="fg" font-size="14" font-weight="700">${esc(c.name)}</text>`)
  })

  // speech bubbles above the speaker
  beats.filter((b) => b.do === 'say' && b.text).forEach((b, k) => {
    const { cx, y } = slot(b.who)
    const w = Math.min(W - 16, Math.max(60, b.text.length * 7.6 + 28))
    const bx = Math.max(8, Math.min(W - w - 8, cx - w / 2)), by = y - 44
    const cls = `bu${k}`
    css.push(showCss(cls, dur, [[b.a, b.b]]))
    body.push(`<g class="${cls}" opacity="0"><rect x="${f(bx)}" y="${f(by)}" width="${f(w)}" height="32" rx="16" class="card line" stroke-width="1.5"/><path d="M${f(cx - 6)} ${f(by + 31)} L${f(cx)} ${f(by + 39)} L${f(cx + 6)} ${f(by + 31)}" class="card"/><text x="${f(bx + w / 2)}" y="${f(by + 21)}" text-anchor="middle" class="fg" font-size="13">${esc(b.text)}</text></g>`)
  })

  if (scene.title) body.unshift(`<text x="${W / 2}" y="${28 + 34}" text-anchor="middle" class="fg" font-size="32" font-weight="800" letter-spacing="-0.5">${esc(scene.title)}</text>`)
  if (scene.subtitle) body.unshift(`<text x="${W / 2}" y="${28 + (scene.title ? 64 : 18)}" text-anchor="middle" class="muted" font-size="15">${esc(scene.subtitle)}</text>`)

  if (links.length) {
    let lx = (W - linksW) / 2
    const ly = H - 28 - 42
    links.forEach((l, k) => {
      const w = pill(l)
      let ic = icon(l.icon, { size: 22, animation: l.animation || 'bounce' })
      ic = ic.replace(/^<svg([^>]*?)width="22" height="22"/, `<svg$1x="${f(lx + 12)}" y="${f(ly + 10)}" width="22" height="22"`)
      body.push(`<g><rect x="${f(lx)}" y="${f(ly)}" width="${f(w)}" height="42" rx="21" class="card line" stroke-width="1.5"/>${ic}${l.text ? `<text x="${f(lx + 40)}" y="${f(ly + 26)}" class="fg" font-size="14" font-weight="700">${esc(l.text)}</text>` : ''}</g>`)
      lx += w + 10
    })
  }
  if (cursorPts) {
    css.push(`@keyframes cur{${cursorPts.map(([p, x, y]) => `${pc(p)}{transform:translate(${f(x)}px,${f(y)}px)}`).join('')}}.cur{animation:cur ${dur}s ease-in-out infinite}`)
    body.push(`<g class="cur"><g>${cursor}</g></g>`)
  }
  const mode = scene.theme ?? 'auto'
  const bg = mode === 'transparent' ? '' : `<rect width="${W}" height="${H}" rx="20" class="bg"/><rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="20" fill="none" class="line" stroke-width="1.5"/>`
  const label = `<title>${esc(scene.alt || (scene.title ? scene.title + ': ' : '') + cast.map((c) => c.name || c.seed || c.style).join(', '))}</title>`
  return doc(W, H, label + bg + body.join('\n'), css.join('\n'), theme(mode === 'transparent' ? 'auto' : mode))
}

const who = (style, seed, name, kind) => ({ style, seed, name, ...(kind ? { options: { kind } } : null) })
const say = (at, len, who, text) => ({ at, for: len, who, do: 'say', text })
const mood = (at, len, who, m) => ({ at, for: len, who, do: 'mood', mood: m })
const MIX = ['buddy', 'animal', 'memoji', 'bot', 'ghost', 'food', 'plant', 'planet', 'monster', 'emoji', 'human', 'clay']

export const PRESETS = {
  'Meet the team': { title: 'Meet the team', subtitle: 'They follow your cursor', cursor: true, duration: 12, size: 88, cast: [['buddy', 'ada'], ['animal', 'bob'], ['memoji', 'cy'], ['bot', 'dee'], ['ghost', 'eli']].map(([s, n]) => who(s, n, n)), beats: [{ at: 4, for: 1, who: 1, do: 'poke' }, mood(8, 2, 3, 'love')] },
  Conversation: { duration: 14, size: 96, gap: 140, cast: [who('human', 'ada', 'You'), who('ai', 'claude', 'Claude', 'claude')], beats: [say(0.5, 2.5, 0, 'Can you fix the failing test?'), mood(3.2, 1.6, 1, 'confused'), say(4.8, 2.6, 1, 'Found it: an off-by-one 🐛'), say(7.8, 2.2, 0, 'Ship it! 🚀'), say(10.2, 2.4, 1, 'Merged. All green ✅'), mood(12.4, 1.6, 0, 'love'), mood(12.4, 1.6, 1, 'happy')] },
  'AI crew': { title: 'Built with AI friends', duration: 14, size: 96, gap: 44, cast: [['gemini', 'Gemini'], ['claude', 'Claude'], ['grok', 'Grok'], ['chatgpt', 'ChatGPT']].map(([k, n]) => who('ai', k, n, k)), beats: [say(0.5, 2.5, 1, 'I wrote the tests ✅'), say(3.5, 2.5, 0, 'I drew the diagrams ✨'), say(6.5, 2.5, 3, 'I wrote the docs 📚'), say(9.5, 2.5, 2, 'I roasted the code 🔥'), mood(10, 2, 1, 'surprised'), mood(12, 1.8, 0, 'happy'), mood(12, 1.8, 1, 'happy'), mood(12, 1.8, 3, 'happy')] },
  Sponsors: { title: 'Thank you, sponsors 💖', subtitle: 'You keep this project alive', cursor: true, duration: 12, size: 72, gap: 24, cast: [...['alice', 'bob', 'carol', 'dan', 'erin', 'frank'].map((n, i) => who(['memoji', 'human', 'clay', 'buddy', 'animal', 'memoji'][i], n, '@' + n)), who('ghost', 'you', 'you?')], beats: [mood(2, 2, 0, 'love'), mood(4, 2, 2, 'love'), mood(6, 2, 4, 'love'), say(7.5, 3.5, 6, 'Sponsor us →'), mood(7.5, 3.5, 6, 'happy')] },
  Contributors: { title: 'Made by these lovely people', subtitle: 'Thank you for every issue, PR and idea', cursor: true, duration: 12, size: 60, gap: 16, perRow: 8, cast: Array.from({ length: 16 }, (_, i) => who(['human', 'memoji', 'clay', 'buddy'][i % 4], 'contrib' + i)), beats: [mood(3, 2, 2, 'love'), mood(5, 2, 9, 'happy'), { at: 7, for: 1, who: 13, do: 'poke' }] },
  'Star the repo': { title: 'Like it? Give it a ⭐', duration: 10, size: 84, gap: 40, cast: [who('buddy', 'star1'), who('animal', 'star2'), who('ai', 'gemini', null, 'gemini'), who('plant', 'star4')], beats: [say(0.5, 2, 0, '⭐ please?'), say(2.5, 2, 1, 'Pretty please?'), say(4.5, 2, 2, 'One click ✨'), say(6.5, 2.5, 3, 'Thank you! 💖'), mood(6.5, 3, 0, 'love'), mood(6.5, 3, 1, 'love'), mood(6.5, 3, 2, 'love')] },
  'Bug → fix': { title: 'Found a bug? Open an issue', duration: 14, size: 92, gap: 140, cast: [who('human', 'reporter', 'You'), who('ai', 'claude', 'Maintainer bot', 'claude')], beats: [mood(0.3, 3, 0, 'angry'), say(0.5, 2.8, 0, "It's broken on Safari 😡"), mood(3.5, 2, 1, 'confused'), say(5.5, 2.5, 1, 'Reproduced. On it 🔍'), say(8.5, 2.5, 1, 'Fixed in #42 ✅'), mood(11, 2.6, 0, 'love'), say(11, 2.6, 0, 'You rock 🙌')] },
  'PR review': { title: 'How we ship', duration: 15, size: 84, gap: 60, cast: [who('dev', 'author', 'Author'), who('memoji', 'reviewer', 'Reviewer'), who('tech', 'ci', 'CI', 'server')], beats: [say(0.5, 2.5, 0, 'PR #128 is ready 🚀'), { at: 3.2, for: 2.4, who: 1, do: 'look', target: 0 }, say(5.8, 2.4, 2, 'All checks passed ✅'), say(8.5, 2.4, 1, 'LGTM 👍'), mood(11.2, 3, 0, 'love'), mood(11.2, 3, 1, 'happy'), mood(11.2, 3, 2, 'happy')] },
  'Release party': { title: 'v2.0 is out! 🎉', subtitle: 'npm i livatar@latest', cursor: true, duration: 10, size: 60, gap: 16, perRow: 9, cast: Array.from({ length: 18 }, (_, i) => who(MIX[i % MIX.length], 'party' + i)), beats: Array.from({ length: 9 }, (_, i) => mood(1 + i * 0.8, 2, i * 2, i % 2 ? 'love' : 'happy')) },
  'Welcome first PR': { title: 'First time contributing?', subtitle: 'Look for "good first issue". We will help 👋', duration: 12, size: 84, gap: 50, cast: [who('memoji', 'newbie', 'You'), who('buddy', 'mentor1', 'Ada'), who('animal', 'mentor2', 'Bob')], beats: [mood(0.3, 2.2, 0, 'confused'), say(0.5, 2.4, 0, 'Can I help? 😅'), say(3.2, 2.4, 1, 'Yes! Welcome 👋'), say(6, 2.4, 2, 'Try issue #7 ✨'), mood(8.6, 3, 0, 'love'), say(8.6, 3, 0, 'Opened my first PR!')] },
  'Follow me': { title: "Let's be friends 👋", subtitle: 'I post about open source, AI and design', duration: 10, size: 120, cast: [who('memoji', 'me', null)], beats: [say(0.6, 3, 0, 'Follow for more! ✨'), { at: 4, for: 1, who: 0, do: 'poke' }, mood(5, 3, 0, 'love'), say(6, 3, 0, 'See you there 💜')], links: [{ icon: 'github', text: 'GitHub', animation: 'wiggle' }, { icon: 'x', text: 'X', animation: 'tada' }, { icon: 'linkedin', text: 'LinkedIn', animation: 'bounce' }, { icon: 'youtube', text: 'YouTube', animation: 'pulse' }, { icon: 'discord', text: 'Discord', animation: 'jelly' }] },
  'Buy me a coffee': { title: 'Powered by coffee ☕', subtitle: 'If this saved you time, fuel the next feature', duration: 12, size: 104, gap: 70, cast: [who('human', 'dev', 'Me'), who('drink', 'coffee', null, 'coffee')], beats: [{ at: 0.3, for: 3.5, who: 0, do: 'sleep' }, say(0.6, 3, 1, 'Need a refill? ☕'), mood(4.2, 1.5, 0, 'surprised'), say(5.8, 3, 0, 'Thanks for the coffee! 💛'), mood(5.8, 5, 0, 'love'), mood(5.8, 5, 1, 'happy')], links: [{ icon: 'buymeacoffee', text: 'Buy me a coffee', animation: 'heartbeat' }, { icon: 'kofi', text: 'Ko-fi', animation: 'bounce' }] },
  'Sponsor / donate': { title: 'Feed the piggy 🐷', subtitle: 'Sponsors keep this project free for everyone', duration: 12, size: 112, cast: [who('money', 'piggy', null, 'piggy')], beats: [mood(0.3, 3, 0, 'sad'), say(0.5, 3, 0, 'So empty… 🥺'), { at: 4, for: 1, who: 0, do: 'poke' }, mood(4.6, 6, 0, 'love'), say(5, 3.5, 0, 'Thank you!! 🪙🪙🪙')], links: [{ icon: 'githubsponsors', text: 'Sponsor', animation: 'heartbeat' }, { icon: 'opencollective', text: 'Open Collective', animation: 'pulse' }, { icon: 'patreon', text: 'Patreon', animation: 'bounce' }, { icon: 'paypal', text: 'PayPal', animation: 'wiggle' }] },
  'Get support': { title: 'Need help? We are here', duration: 12, size: 96, gap: 120, cast: [who('memoji', 'user', 'You'), who('bot', 'helper', 'Helper')], beats: [mood(0.3, 2.6, 0, 'confused'), say(0.5, 2.6, 0, 'How do I set this up? 🤔'), say(3.6, 2.8, 1, 'Ask in Discussions 💬'), say(6.8, 2.6, 1, 'Or ping us on Discord!'), mood(9.6, 2.4, 0, 'happy'), say(9.6, 2.4, 0, 'Got it, thanks! 🙌')], links: [{ icon: 'github', text: 'Discussions', animation: 'wiggle' }, { icon: 'discord', text: 'Discord', animation: 'jelly' }, { icon: 'stackoverflow', text: 'Stack Overflow', animation: 'bounce' }] },
  'Profile intro': { title: "Hi, I'm Ada 👋", subtitle: 'Full-stack dev · I build tiny tools with big smiles', duration: 10, size: 120, cast: [who('memoji', 'ada', null)], beats: [say(0.5, 2.6, 0, 'Welcome to my profile!'), mood(3.3, 2, 0, 'happy'), say(5.5, 3, 0, 'Here is what I use ⬇')], links: [{ icon: 'react', text: 'React', animation: 'spin' }, { icon: 'typescript', text: 'TypeScript', animation: 'bounce' }, { icon: 'python', text: 'Python', animation: 'wiggle' }, { icon: 'docker', text: 'Docker', animation: 'float' }] },
  'We are hiring': { title: "We're hiring! 🚀", subtitle: 'Remote · Open source first · Kind people', cursor: true, duration: 12, size: 80, gap: 28, cast: [who('human', 'h1', 'Design'), who('dev', 'h2', 'Frontend'), who('human', 'h3', 'Backend'), who('ghost', 'you', 'You?')], beats: [say(5, 3.5, 3, 'Could be you 👀'), mood(5, 3.5, 3, 'love'), mood(2, 2, 0, 'happy'), mood(3, 2, 1, 'happy')], links: [{ icon: 'linkedin', text: 'Open roles', animation: 'tada' }] },
  'Open to work': { title: 'Open to work ✨', subtitle: 'Frontend · Design systems · Animation', duration: 10, size: 120, cast: [who('memoji', 'jobseeker', null)], beats: [say(0.5, 3, 0, "Let's build something fun!"), mood(4, 3, 0, 'happy'), { at: 7, for: 1, who: 0, do: 'poke' }], links: [{ icon: 'linkedin', text: 'Hire me', animation: 'heartbeat' }, { icon: 'gmail', text: 'Email', animation: 'bounce' }] },
  'Thanks for visiting': { title: 'Thanks for visiting!', subtitle: 'Come back soon 💜', cursor: true, duration: 10, size: 64, gap: 18, perRow: 7, cast: Array.from({ length: 7 }, (_, i) => who(MIX[(i * 2) % MIX.length], 'bye' + i)), beats: [...Array.from({ length: 7 }, (_, i) => mood(1 + i * 0.6, 1.6, i, 'happy')), { at: 7, for: 2.5, who: 3, do: 'sleep' }, say(6, 2.5, 0, 'Bye! 👋')] },
  Standup: { title: 'Daily standup', duration: 14, size: 84, cast: ['ada', 'bob', 'cy', 'dee'].map((n) => who('human', n, n)), beats: [say(0.5, 3, 0, 'Shipped the poll 🚀'), say(4, 3, 2, 'Reviewing PRs today'), say(7.5, 3, 3, 'Blocked on CI 😩'), mood(9, 2, 1, 'sad'), { at: 10.5, for: 3, who: 1, do: 'sleep' }] },
  'Crowd banner': { title: 'Hello, world!', subtitle: 'Thanks for stopping by', cursor: true, duration: 10, size: 56, gap: 14, perRow: 10, cast: Array.from({ length: 20 }, (_, i) => who(['buddy', 'animal', 'food', 'plant', 'ghost', 'planet', 'monster', 'emoji'][i % 8], 'crowd' + i)), beats: [mood(5, 2, 4, 'love'), { at: 3, for: 1, who: 11, do: 'poke' }] },
}

export const PRESET_GROUPS = {
  'Team & community': ['Meet the team', 'Contributors', 'Sponsors', 'Welcome first PR', 'Thanks for visiting'],
  'Support & socials': ['Follow me', 'Buy me a coffee', 'Sponsor / donate', 'Star the repo', 'Get support'],
  'Dev & AI': ['Conversation', 'AI crew', 'Bug → fix', 'PR review', 'Release party', 'Standup'],
  'Profile & more': ['Profile intro', 'Open to work', 'We are hiring', 'Crowd banner'],
}

export { styles, ICONS }
