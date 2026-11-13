import { defineStyle, luma, type Mood } from '../core'
import { faceExtras } from '../face'

export interface PixelOptions {
  /** Fill probability for body cells, 0…1. */
  density?: number
}

const INK = '#1b1530'

/** Tiny bitmaps for mood features: '#' ink, 'w' white, 'p' pink, 'r' red, 'b' blue. */
const EYES: Partial<Record<Mood, string>> = {
  happy: '.#.|#.#|...',
  sleepy: '...|###|...',
  love: 'r.r|rrr|.r.',
  laugh: '#..|.#.|#..',
  cool: '###|###|...',
  cry: '...|###|.b.',
  smug: '...|###|.#.',
  starstruck: '.w.|www|w.w',
}
const MOUTHS: Partial<Record<Mood, string>> = {
  happy: '######|#pppp#|.####.',
  sad: '......|.####.|#....#',
  angry: '######|#w#w#w|######',
  surprised: '..##..|.#..#.|..##..',
  sleepy: '......|..##..|......',
  love: '#....#|.####.|......',
  wink: '.....#|#...#.|.###..',
  silly: '######|...pp.|...pp.',
  confused: '.#....|#.#.#.|...#.#',
  laugh: '######|#wwww#|#pppp#|.####.',
  cool: '......|....##|.###..',
  cry: '.####.|#pppp#|######',
  scared: '######|#w#w#w|######',
  smug: '......|.....#|.####.',
  starstruck: '######|#pppp#|.####.',
}
const INKS: Record<string, string> = { '#': INK, w: '#fff', p: '#ff7a93', r: '#ff4d6d', b: '#5ec5ff' }
const bitmap = (map: string, x: number, y: number, px: number, ink = INK) =>
  map.split('|').map((row, r) =>
    [...row].map((ch, c) => (ch === '.' ? '' : `<rect x="${x + c * px}" y="${y + r * px}" width="${px}" height="${px}" fill="${ch === '#' ? ink : INKS[ch]}"/>`)).join(''),
  ).join('')

/** Mirrored pixel critters — blockies / minidenticons meet space invaders. */
export const pixel = defineStyle<PixelOptions>({
  name: 'pixel',
  colors: ['#fef6e4', '#f582ae', '#8bd3dd', '#001858', '#f3d2c1', '#ff8906', '#2cb67d', '#7f5af0'],
  defaults: { density: 0.55 },
  variants: { density: [0.35, 0.45, 0.55, 0.65, 0.75] },
  render({ rand, color, background, mood, options: o }) {
    const body = color(background)
    const alt = color()
    const mouthInk = (luma(body) ?? 1) < 0.3 ? '#fff' : INK
    const C = 9
    const X = 14
    const Y = 16
    const cols = 8
    const rows = 8

    let cells = ''
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols / 2; c++) {
        const face = r >= 2 && r <= 5 && c >= 1
        if (!face && (r === 0 ? !rand.bool(0.3) : !rand.bool(o.density))) continue
        const fill = !face && rand.bool(0.2) ? alt : body
        for (const cc of [c, cols - 1 - c])
          cells += `<rect x="${X + cc * C}" y="${Y + r * C}" width="${C + 0.4}" height="${C + 0.4}" fill="${fill}"/>`
      }
    }

    const open = (c: number, pupil = 4.5) =>
      `<g data-lv-eye=""><rect x="${X + c * C}" y="${Y + 3 * C}" width="${C}" height="${C}" fill="#fff"/>` +
      `<g data-lv-depth=".45"><rect x="${X + c * C + (C - pupil) / 2}" y="${Y + 3 * C + (C - pupil) / 2}" width="${pupil}" height="${pupil}" fill="${INK}"/></g></g>`
    const eye = (c: number) => {
      const m = mood === 'wink' && c === 5 ? 'happy' : mood === 'confused' && c === 5 ? 'sleepy' : mood
      const map = EYES[m]
      if (map) return `<g data-lv-eye="">${bitmap(map, X + c * C, Y + 3 * C, 3, mouthInk)}</g>`
      return open(c, mood === 'surprised' ? 3 : 4.5)
    }
    // brows / tear for moods that need them, one pixel row above the eyes
    const ey = Y + 3 * C - 3.5
    const brows =
      mood === 'angry'
        ? bitmap('##.|.##', X + 2 * C, ey - 3, 3, mouthInk) + bitmap('.##|##.', X + 5 * C, ey - 3, 3, mouthInk)
        : mood === 'sad'
          ? bitmap('.##|##.', X + 2 * C, ey - 3, 3, mouthInk) + bitmap('##.|.##', X + 5 * C, ey - 3, 3, mouthInk) + `<g data-lv-float="drip">${bitmap('b|b', X + 2 * C + 3, Y + 4 * C + 1, 3)}</g>`
          : mood === 'surprised'
            ? bitmap('###', X + 2 * C, ey - 3, 3, mouthInk) + bitmap('###', X + 5 * C, ey - 3, 3, mouthInk)
            : ''
    const mouthMap = MOUTHS[mood]

    return (
      `<g data-lv-body="">` +
      `<g data-lv-depth=".3" shape-rendering="crispEdges">${cells}</g>` +
      `<g data-lv-depth=".85" shape-rendering="crispEdges">${eye(2)}${eye(5)}${brows}` +
      `<g data-lv-mouth="1.2">${mouthMap ? bitmap(mouthMap, X + 3 * C, Y + 5 * C + 1, 3, mouthInk) : `<rect x="${X + 3 * C}" y="${Y + 5 * C + 2}" width="${2 * C}" height="4.5" fill="${mouthInk}"/>`}</g></g>` +
      faceExtras({ x: 50, ey: Y + 3 * C + 4.5, gap: 13.5, my: 0, ink: mouthInk === '#fff' ? '#fff' : INK, s: 0.9, eye: () => '', extra: [80, 16] }, mood === 'sad' || mood === 'happy' ? 'neutral' : mood) +
      `</g>`
    )
  },
})
