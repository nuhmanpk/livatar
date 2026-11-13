/* ------------------------------------------------------------------ *
 *  Pixel-art bodies and faces for livatar/roam.
 *
 *  Every pet is painted on a 32×30 grid with a few shape helpers, then
 *  given a 1-pixel dark outline automatically. Two leg frames make the
 *  walk cycle. Faces are a separate pixel layer with their own set of
 *  expressions, so a pet can change mood without redrawing its body.
 * ------------------------------------------------------------------ */

export type PetSpecies = 'cat' | 'dog' | 'fox' | 'lion' | 'pig' | 'panda' | 'bunny' | 'koala' | 'bear' | 'mouse' | 'frog' | 'penguin' | 'owl' | 'chick' | 'dino'
export type PetFace = 'neutral' | 'happy' | 'laugh' | 'angry' | 'sad' | 'cry' | 'sleepy' | 'love' | 'scared' | 'surprised' | 'smug' | 'dizzy'

export const GW = 32
export const GH = 30
const OL = '#2b2140'
const INK = '#2b2140'
const PINK = '#ff8fa3'
const RED = '#e63946'
const BLUE = '#5ec5ff'
const BEAK = '#ffa62b'

type Grid = (string | null)[][]
const grid = (): Grid => Array.from({ length: GH }, () => Array<string | null>(GW).fill(null))
const set = (g: Grid, x: number, y: number, c: string) => { if (x >= 0 && y >= 0 && x < GW && y < GH) g[y]![x] = c }
const ell = (g: Grid, cx: number, cy: number, rx: number, ry: number, c: string) => {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry
      if (dx * dx + dy * dy <= 1) set(g, x, y, c)
    }
}
const rect = (g: Grid, x: number, y: number, w: number, h: number, c: string) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(g, x + i, y + j, c) }
/** Paint from an ASCII map; '.' is empty, other chars look up `pal`. */
const map = (g: Grid, x: number, y: number, rows: string[], pal: Record<string, string>) =>
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) set(g, x + i, y + j, pal[ch]!) }))
const copy = (g: Grid): Grid => g.map((r) => [...r])

/** 1-pixel outline around everything painted (4-neighbour, so corners stay crisp). */
function outline(g: Grid): Grid {
  const o = copy(g)
  for (let y = 0; y < GH; y++)
    for (let x = 0; x < GW; x++)
      if (!g[y]![x] && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g[y + dy!]?.[x + dx!])) o[y]![x] = OL
  return o
}

/** Grid → SVG paths, one per colour, horizontal runs merged. */
function paint(g: Grid): string {
  const by: Record<string, string> = {}
  for (let y = 0; y < GH; y++) {
    let x = 0
    while (x < GW) {
      const c = g[y]![x]
      if (!c) { x++; continue }
      let w = 1
      while (x + w < GW && g[y]![x + w] === c) w++
      by[c] = (by[c] ?? '') + `M${x} ${y}h${w}v1h${-w}z`
      x += w
    }
  }
  return Object.entries(by).map(([c, d]) => `<path d="${d}" fill="${c}"/>`).join('')
}

const shade = (hex: string, amt: number) => {
  const v = parseInt(hex.slice(1), 16)
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt))))
  return '#' + [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('')
}

interface Layout {
  /** Eye centres and mouth, in grid cells. */
  eyes: [number, number, number]
  mouth: [number, number]
  /** Draw a beak instead of a mouth. */
  beak?: boolean
  /** Eyes sit on dark fur (panda): draw them light. */
  light?: boolean
  /** Head centre x as a fraction of the sprite width (for the speech bubble). */
  head: number
}
interface Sprite { a: Grid; b: Grid; face: Layout }

/* ---------- body plans ---------- */

/** Four legs, body to the left, big head to the right (faces the viewer, walks right). */
function quad(fur: string, belly: string, legC = shade(fur, -0.12)) {
  const base = grid()
  ell(base, 14, 19.5, 9, 5.5, fur)
  ell(base, 15, 22, 6, 2.2, belly)
  const legs = (frame: 'a' | 'b') => {
    const g = grid()
    const L = frame === 'a' ? [[7, 0], [11, 0], [17, 0], [21, 0]] : [[8, -1], [10, 0], [18, -1], [20, 0]]
    for (const [x, lift] of L) { rect(g, x!, 23 + lift!, 3, 4, x! < 14 ? shade(legC, -0.08) : legC); rect(g, x!, 26 + lift!, 3, 1, shade(legC, 0.25)) }
    return g
  }
  return { base, legs, face: { eyes: [19, 25, 11], mouth: [22, 14], head: 22 / GW } as Layout }
}

/** Upright: big head on a round body, two feet. */
function up(fur: string, belly: string, footC = shade(fur, -0.12)) {
  const base = grid()
  ell(base, 16, 21, 7, 6, fur)
  ell(base, 16, 22.5, 4.5, 4, belly)
  const legs = (frame: 'a' | 'b') => {
    const g = grid()
    const [l, r] = frame === 'a' ? [0, 0] : [-1, 0]
    rect(g, 11, 26 + l, 4, 2, footC); rect(g, 17, 26 + r, 4, 2, footC)
    return g
  }
  return { base, legs, face: { eyes: [13, 19, 11], mouth: [16, 14], head: 0.5 } as Layout }
}

/* ---------- species ---------- */

const SPECIES: Record<PetSpecies, () => Sprite> = {
  cat() {
    const fur = '#f59a3e', w = '#fff3e0', { base, legs, face } = quad(fur, w)
    // tail curling up, white tip
    for (let i = 0; i < 9; i++) set(base, 5 - Math.round(Math.sin(i / 3) * 2), 18 - i, fur), set(base, 6 - Math.round(Math.sin(i / 3) * 2), 18 - i, fur)
    rect(base, 3, 8, 2, 2, w)
    // ears
    map(base, 15, 2, ['x.....', 'xx....', 'xpx...', 'xxxx..'], { x: fur, p: PINK }); map(base, 25, 2, ['.....x', '....xx', '...xpx', '..xxxx'], { x: fur, p: PINK })
    ell(base, 22, 11, 7.5, 6.5, fur)
    ell(base, 22, 14.5, 4, 2.5, w)
    return { a: outline(merge(base, legs('a'))), b: outline(merge(base, legs('b'))), face }
  },
  dog() {
    const fur = '#c8864a', w = '#f3dcc0', ear = '#8f5a2e', { base, legs, face } = quad(fur, w)
    for (let i = 0; i < 6; i++) set(base, 5 - (i > 3 ? 1 : 0), 17 - i, fur), set(base, 6 - (i > 3 ? 1 : 0), 17 - i, fur)
    ell(base, 22, 11, 7.5, 6.5, fur)
    ell(base, 22, 14.5, 4, 2.5, w)
    ell(base, 14.5, 10, 2.2, 4, ear); ell(base, 29.5, 10, 2.2, 4, ear)
    return { a: outline(merge(base, legs('a'))), b: outline(merge(base, legs('b'))), face }
  },
  fox() {
    const fur = '#f37b2a', w = '#ffffff', tip = '#3a2a25', { base, legs, face } = quad(fur, w, tip)
    ell(base, 4, 15, 3.4, 5.5, fur); ell(base, 3, 11, 2.2, 2.4, w)
    map(base, 15, 1, ['k.....', 'xx....', 'xpx...', 'xppx..', 'xxxxx.'], { x: fur, p: w, k: tip }); map(base, 24, 1, ['.....k', '....xx', '...xpx', '..xppx', '.xxxxx'], { x: fur, p: w, k: tip })
    ell(base, 22, 11, 7.5, 6.5, fur)
    ell(base, 22, 14.5, 5, 2.8, w)
    return { a: outline(merge(base, legs('a'))), b: outline(merge(base, legs('b'))), face }
  },
  lion() {
    const fur = '#f2b450', mane = '#9c5a26', w = '#fbe0a8', { base, legs, face } = quad(fur, w)
    for (let i = 0; i < 8; i++) set(base, 4, 20 - i, fur)
    ell(base, 4, 11, 2, 2, mane)
    ell(base, 22, 11, 10, 9, mane)
    for (const [x, y] of [[12, 6], [12, 16], [31, 6], [31, 16], [22, 1], [16, 2], [28, 2], [16, 20], [28, 20]]) ell(base, x!, y!, 1.6, 1.6, mane)
    ell(base, 22, 11.5, 6.5, 6, fur)
    ell(base, 22, 14.5, 3.5, 2.2, w)
    return { a: outline(merge(base, legs('a'))), b: outline(merge(base, legs('b'))), face }
  },
  pig() {
    const fur = '#ffb3c6', dk = '#ff8fab', { base, legs, face } = quad(fur, shade(fur, 0.25), dk)
    map(base, 3, 14, ['.x.', 'x.x', '.xx', '..x'], { x: dk })
    map(base, 15, 4, ['xx..', 'xxx.', 'xxxx'], { x: dk }); map(base, 26, 4, ['..xx', '.xxx', 'xxxx'], { x: dk })
    ell(base, 22, 11, 7.5, 6.5, fur)
    ell(base, 22, 14, 3, 2, dk); set(base, 21, 14, OL); set(base, 23, 14, OL)
    return { a: outline(merge(base, legs('a'))), b: outline(merge(base, legs('b'))), face: { ...face, mouth: [22, 16] } }
  },
  panda() {
    const w = '#ffffff', k = '#2b2b33', { base, legs, face } = up(w, w, k)
    ell(base, 9.5, 20, 2.2, 3.4, k); ell(base, 22.5, 20, 2.2, 3.4, k)
    rect(base, 10, 15, 12, 3, k)
    ell(base, 9, 4.5, 3, 3, k); ell(base, 23, 4.5, 3, 3, k)
    ell(base, 16, 11, 8.5, 7, w)
    ell(base, 12.5, 11.5, 2.5, 3, k); ell(base, 19.5, 11.5, 2.5, 3, k)
    return { a: outline(merge(base, legs('a'))), b: outline(merge(base, legs('b'))), face: { ...face, eyes: [13, 19, 11], light: true } }
  },
  bunny() {
    const w = '#fbfaff', g2 = '#e4e1ee', { base, legs, face } = up(w, g2)
    rect(base, 11, 0, 3, 6, w); rect(base, 18, 0, 3, 6, w); rect(base, 12, 1, 1, 4, PINK); rect(base, 19, 1, 1, 4, PINK)
    ell(base, 23.5, 24, 2, 2, w)
    ell(base, 16, 11, 7.5, 6.5, w)
    ell(base, 9.5, 21, 1.8, 2.6, g2); ell(base, 22.5, 21, 1.8, 2.6, g2)
    return { a: outline(merge(base, legs('a'))), b: outline(merge(base, legs('b'))), face }
  },
  koala() {
    const fur = '#9aa3ae', li = '#e4e7ec', { base, legs, face } = up(fur, li)
    ell(base, 7, 7, 4.5, 4.5, fur); ell(base, 25, 7, 4.5, 4.5, fur); ell(base, 7, 7.5, 2.5, 2.5, li); ell(base, 25, 7.5, 2.5, 2.5, li)
    ell(base, 16, 11, 8, 7, fur)
    ell(base, 16, 13, 1.8, 2.6, OL)
    ell(base, 9.5, 21, 1.8, 2.8, shade(fur, -0.1)); ell(base, 22.5, 21, 1.8, 2.8, shade(fur, -0.1))
    return { a: outline(merge(base, legs('a'))), b: outline(merge(base, legs('b'))), face: { ...face, eyes: [12, 20, 10], mouth: [16, 16] } }
  },
  bear() {
    const fur = '#9b5d2e', li = '#e3b07a', { base, legs, face } = up(fur, li)
    ell(base, 9.5, 5, 3, 3, fur); ell(base, 22.5, 5, 3, 3, fur); ell(base, 9.5, 5.5, 1.5, 1.5, li); ell(base, 22.5, 5.5, 1.5, 1.5, li)
    ell(base, 16, 11, 8, 7, fur)
    ell(base, 16, 14, 3.5, 2.5, li); rect(base, 15, 13, 2, 1, OL)
    ell(base, 9.5, 21, 2, 3, shade(fur, -0.1)); ell(base, 22.5, 21, 2, 3, shade(fur, -0.1))
    return { a: outline(merge(base, legs('a'))), b: outline(merge(base, legs('b'))), face: { ...face, mouth: [16, 15] } }
  },
  mouse() {
    const fur = '#b9bcc4', li = '#eceef2', { base, legs, face } = up(fur, li, PINK)
    for (let i = 0; i < 8; i++) set(base, 8 - i, 25 - Math.round(Math.sin(i / 2) * 2), shade(fur, -0.2))
    ell(base, 8, 5.5, 4.5, 4.5, fur); ell(base, 24, 5.5, 4.5, 4.5, fur); ell(base, 8, 6, 3, 3, PINK); ell(base, 24, 6, 3, 3, PINK)
    ell(base, 16, 11.5, 7.5, 6.5, fur)
    set(base, 16, 13, PINK)
    return { a: outline(merge(base, legs('a'))), b: outline(merge(base, legs('b'))), face: { ...face, mouth: [16, 15] } }
  },
  frog() {
    const fur = '#6cc551', li = '#f3f1b8', { base, legs, face } = up(fur, li)
    ell(base, 16, 20, 9, 6.5, fur); ell(base, 16, 22, 5.5, 4, li)
    ell(base, 16, 12, 9, 5.5, fur)
    ell(base, 11, 7, 3.5, 3.2, fur); ell(base, 21, 7, 3.5, 3.2, fur)
    rect(base, 7, 25, 5, 2, fur); rect(base, 20, 25, 5, 2, fur)
    return { a: outline(merge(base, legs('a'))), b: outline(merge(base, legs('b'))), face: { eyes: [11, 21, 7], mouth: [16, 13], head: 0.5 } }
  },
  penguin() {
    const k = '#26324a', w = '#ffffff', { base, legs, face } = up(k, w, BEAK)
    ell(base, 16, 19, 8, 8, k); ell(base, 16, 21, 5.5, 6, w)
    ell(base, 7.5, 19, 2, 4.5, k); ell(base, 24.5, 19, 2, 4.5, k)
    ell(base, 16, 10, 7.5, 7, k)
    ell(base, 13, 11, 3, 3.4, w); ell(base, 19, 11, 3, 3.4, w); rect(base, 13, 12, 6, 3, w)
    map(base, 15, 13, ['xx', 'xx'], { x: BEAK })
    return { a: outline(merge(base, legs('a'))), b: outline(merge(base, legs('b'))), face: { ...face, beak: true } }
  },
  owl() {
    const fur = '#9c6b44', li = '#f2d9b5', disc = '#f6e7cc', { base, legs, face } = up(fur, li, BEAK)
    ell(base, 16, 19, 8, 8, fur); ell(base, 16, 21, 5, 5.5, li)
    for (const [x, y] of [[14, 19], [18, 19], [16, 21], [14, 23], [18, 23]]) set(base, x!, y!, shade(li, -0.25))
    ell(base, 7.5, 19, 2.2, 5, shade(fur, -0.15)); ell(base, 24.5, 19, 2.2, 5, shade(fur, -0.15))
    map(base, 8, 2, ['x...', 'xx..', 'xxx.'], { x: fur }); map(base, 20, 2, ['...x', '..xx', '.xxx'], { x: fur })
    ell(base, 16, 10, 8, 6.5, fur)
    ell(base, 12.5, 10.5, 3.4, 3.4, disc); ell(base, 19.5, 10.5, 3.4, 3.4, disc)
    map(base, 15, 13, ['xx', '.x'], { x: BEAK })
    return { a: outline(merge(base, legs('a'))), b: outline(merge(base, legs('b'))), face: { ...face, eyes: [12, 20, 10], beak: true } }
  },
  chick() {
    const fur = '#ffd43b', { base, legs, face } = up(fur, shade(fur, 0.35), BEAK)
    ell(base, 16, 19, 8, 7.5, fur)
    ell(base, 16, 10, 7, 6, fur)
    map(base, 3, 15, ['xx....', 'xxxx..', '.xxxxx', '..xxxx'], { x: shade(fur, -0.08) }); map(base, 23, 15, ['....xx', '..xxxx', 'xxxxx.', 'xxxx..'], { x: shade(fur, -0.08) })
    map(base, 15, 2, ['.x.', 'xx.', '.xx'], { x: shade(fur, -0.1) })
    map(base, 15, 12, ['xx', 'xx', '.x'], { x: BEAK })
    return { a: outline(merge(base, legs('a'))), b: outline(merge(base, legs('b'))), face: { ...face, eyes: [13, 19, 10], beak: true } }
  },
  dino() {
    const fur = '#5cc34f', li = '#e8f2b0', sp = '#9b6bd6', { base, legs, face } = up(fur, li)
    // tail sweeping left and spikes down the back
    ell(base, 7, 23, 6, 2.6, fur); ell(base, 2.5, 21.5, 2.5, 1.6, fur)
    for (const [x, y] of [[4, 19], [7, 18], [10, 15], [11, 11], [12, 7]]) map(base, x!, y!, ['.x.', 'xxx'], { x: sp })
    ell(base, 18, 10.5, 8, 6.5, fur)
    ell(base, 22, 13, 4, 2.5, fur)
    ell(base, 22.5, 20, 2, 3, fur)
    return { a: outline(merge(base, legs('a'))), b: outline(merge(base, legs('b'))), face: { eyes: [16, 22, 10], mouth: [21, 14], head: 18 / GW } }
  },
}

/** Overlay `top` onto `base` (non-null cells win). Legs go *behind* the body. */
function merge(base: Grid, legs: Grid): Grid {
  const g = copy(legs)
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (base[y]![x]) g[y]![x] = base[y]![x]!
  return g
}

/* ---------- faces ---------- */

const R = (x: number, y: number, w: number, h: number, c: string) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`
const dots = (pts: [number, number][], c: string) => pts.map(([x, y]) => R(x, y, 1, 1, c)).join('')

/** Pixel face for a mood, drawn on top of the body. */
export function petFace(l: Layout, mood: PetFace): string {
  const [L, Rr, y] = l.eyes
  const [mx, my] = l.mouth
  const eyes = (f: (x: number) => string) => { const e = f(L) + f(Rr); return l.light ? e.split(`"${INK}"`).join('"#fff"') : e }
  const open = (x: number) => R(x - 1, y - 1, 2, 2, INK) + R(x - 1, y - 1, 1, 1, l.light ? INK : '#fff')
  const cheeks = R(L - 3, y + 2, 2, 1, PINK) + R(Rr + 1, y + 2, 2, 1, PINK)
  const v = l.beak ? '' : dots([[mx - 1, my], [mx, my + 1], [mx + 1, my]], INK)
  const tear = (x: number, len: number) => R(x, y + 1, 1, len, BLUE)
  let e = '', m = v, x = ''
  switch (mood) {
    case 'happy':
      e = eyes((c) => dots([[c - 1, y], [c, y - 1], [c + 1, y]], INK)) + cheeks
      m = l.beak ? '' : R(mx - 1, my, 3, 1, INK) + R(mx, my + 1, 1, 1, PINK)
      break
    case 'laugh':
      e = dots([[L - 1, y - 1], [L, y], [L - 1, y + 1], [Rr + 1, y - 1], [Rr, y], [Rr + 1, y + 1]], INK) + cheeks + R(L - 3, y, 1, 1, BLUE) + R(Rr + 3, y, 1, 1, BLUE)
      m = l.beak ? '' : R(mx - 2, my, 5, 1, INK) + R(mx - 1, my + 1, 3, 1, INK) + R(mx, my + 1, 1, 1, PINK)
      break
    case 'angry':
      e = eyes(open) + dots([[L - 2, y - 3], [L - 1, y - 3], [L, y - 2], [Rr + 1, y - 3], [Rr, y - 3], [Rr - 1, y - 2]], INK)
      m = l.beak ? '' : R(mx - 1, my + 1, 3, 1, INK)
      x = dots([[Rr + 3, 2], [Rr + 5, 2], [Rr + 4, 3], [Rr + 3, 4], [Rr + 5, 4]], RED)
      break
    case 'sad':
      e = eyes((c) => R(c - 1, y, 2, 2, INK)) + dots([[L - 1, y - 2], [L, y - 3], [Rr, y - 3], [Rr + 1, y - 2]], INK) + tear(L - 1, 2)
      m = l.beak ? '' : dots([[mx - 1, my + 1], [mx, my], [mx + 1, my + 1]], INK)
      break
    case 'cry':
      e = eyes((c) => R(c - 1, y, 3, 1, INK)) + tear(L - 1, 4) + tear(Rr + 1, 4)
      m = l.beak ? '' : R(mx - 1, my, 3, 2, INK) + R(mx, my + 1, 1, 1, PINK)
      break
    case 'sleepy':
      e = eyes((c) => R(c - 1, y, 3, 1, INK))
      m = l.beak ? '' : R(mx, my, 1, 1, INK)
      break
    case 'love':
      e = eyes((c) => dots([[c - 1, y - 1], [c + 1, y - 1], [c - 1, y], [c, y], [c + 1, y], [c, y + 1]], RED)) + cheeks
      break
    case 'scared':
      e = eyes((c) => R(c - 1, y - 1, 2, 2, '#fff') + R(c, y, 1, 1, INK))
      m = l.beak ? '' : dots([[mx - 2, my + 1], [mx - 1, my], [mx, my + 1], [mx + 1, my], [mx + 2, my + 1]], INK)
      x = R(Rr + 4, y - 4, 1, 2, BLUE) + R(Rr + 3, y - 3, 1, 1, BLUE)
      break
    case 'surprised':
      e = eyes((c) => R(c - 1, y - 2, 2, 3, INK) + R(c - 1, y - 2, 1, 1, '#fff'))
      m = l.beak ? '' : R(mx - 1, my, 2, 2, INK)
      break
    case 'smug':
      e = eyes((c) => R(c - 1, y - 1, 3, 1, INK) + R(c, y, 2, 1, INK)) + cheeks
      m = l.beak ? '' : dots([[mx - 1, my + 1], [mx, my + 1], [mx + 1, my], [mx + 2, my - 1]], INK)
      break
    case 'dizzy':
      e = eyes((c) => dots([[c - 1, y - 1], [c + 1, y - 1], [c, y], [c - 1, y + 1], [c + 1, y + 1]], INK))
      m = l.beak ? '' : dots([[mx - 1, my], [mx, my + 1], [mx + 1, my], [mx + 2, my + 1]], INK)
      x = dots([[L + 2, 1], [L + 4, 2], [Rr - 2, 1]], '#ffd43b')
      break
    default:
      e = `<g class="lvp-blink" style="transform-origin:50% ${((y + 0.5) / GH) * 100}%">${eyes(open)}</g>` + cheeks
  }
  return e + m + x
}

const cache = new Map<PetSpecies, Sprite>()
export const sprite = (sp: PetSpecies): Sprite => { let s = cache.get(sp); if (!s) cache.set(sp, (s = SPECIES[sp]())); return s }

/** Full SVG for a pet: two leg frames (toggled by CSS) and a face layer. */
export function petSvg(sp: PetSpecies, width: number, mood: PetFace = 'happy'): string {
  const s = sprite(sp)
  return `<svg class="lvp" width="${width}" height="${Math.round((width * GH) / GW)}" viewBox="0 0 ${GW} ${GH}" shape-rendering="crispEdges" aria-hidden="true">` +
    `<g class="lvp-a">${paint(s.a)}</g><g class="lvp-b">${paint(s.b)}</g><g class="lvp-face">${petFace(s.face, mood)}</g></svg>`
}

export const PET_SPECIES = Object.keys(SPECIES) as PetSpecies[]
