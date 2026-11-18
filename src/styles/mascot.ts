import { cast, C, E, O, P, S, star, type Look } from './_cast'

const KINDS = ['cube', 'cloud', 'star', 'gem', 'battery', 'heart'] as const
export type MascotKind = (typeof KINDS)[number]
export interface MascotOptions { kind?: MascotKind | 'random' }

/** Shapes that cover the whole head so the face reads as the object itself. */
export const mascot = cast<MascotKind>({
  name: 'mascot',
  kinds: KINDS,
  colors: ['#e6efff', '#fff1c9', '#e1f7ef', '#ffe6dc', '#efe2ff', '#cfeff0'],
  look(kind, r): Look {
    const hue = r.pick<[string, string]>([['#3d9be8', '#2266b0'], ['#ff7a5a', '#c84a2e'], ['#7bd45a', '#3f9a2a'], ['#b480ff', '#7a48c8'], ['#ff8fcf', '#d85aa8']])
    const body = { suit: hue, skin: hue, glove: hue[0], noBlush: false } as const
    switch (kind) {
      case 'cube':
        return {
          ...body,
          front: O('M26 20H74V62H26Z', hue[0], 4.5) + O('M26 20L36 12H84L74 20Z', '#ffffff', 3.5) + O('M74 20L84 12V54L74 62Z', hue[1], 3.5) + S('M50 12V6M46 6H54', '#2a2440', 2.4) + C(50, 5, 2, '#ffd23f'),
          chest: O('M42 66H58V76H42Z', '#fff', 2.5),
        }
      case 'cloud':
        return {
          ...body, skin: ['#ffffff', '#dce8f5'], suit: ['#ffffff', '#dce8f5'], glove: '#ffffff',
          front: O('M24 44Q18 30 32 28Q34 14 50 16Q66 12 70 28Q84 28 78 44Q82 58 66 58L34 58Q18 58 24 44Z', '#ffffff', 4.5),
          chest: S('M42 70Q46 74 50 70M54 70Q58 74 62 70', '#9fc0e8', 2) + `<g data-lv-float="">${C(72, 80, 3, '#7ab6ff')}${C(78, 88, 2, '#7ab6ff')}</g>`,
        }
      case 'star':
        return {
          ...body, skin: ['#ffe066', '#f2b820'], suit: ['#ffe066', '#f2b820'], glove: '#ffe066',
          front: O('M50 6L58 28L82 28L62 42L70 64L50 50L30 64L38 42L18 28L42 28Z', '#ffe066', 4.5),
          chest: `<g data-lv-float="">${star(80, 76, 3.4, '#fff6a8')}${star(20, 80, 2.4, '#fff6a8')}</g>`,
        }
      case 'gem':
        return {
          ...body,
          front: O('M28 28L38 14H62L72 28L50 64Z', hue[0], 4.5) + S('M28 28H72M38 14L44 28L50 64L56 28L62 14', 'rgba(255,255,255,.55)', 1.8),
          chest: `<g data-lv-float="">${star(78, 78, 3, '#ffffff')}</g>`,
        }
      case 'battery':
        return {
          ...body, skin: ['#7bd45a', '#3f9a2a'], suit: ['#7bd45a', '#3f9a2a'], glove: '#7bd45a',
          front: O('M26 16H74V64H26Z', '#7bd45a', 4.5) + O('M42 8H58V16H42Z', '#9aa4b8', 3) + S('M40 24H60', 'rgba(255,255,255,.5)', 2),
          chest: O('M44 66L54 66L50 74L56 74L46 84L48 76H42Z', '#ffd23f', 2),
        }
      case 'heart':
        return {
          ...body, skin: ['#ff6a8a', '#d92a58'], suit: ['#ff6a8a', '#d92a58'], glove: '#ff6a8a',
          front: O('M50 66C16 44 20 14 38 14C46 14 50 22 50 22C50 22 54 14 62 14C80 14 84 44 50 66Z', '#ff6a8a', 4.5) + E(38, 24, 5, 3, '#fff', -30, ' opacity=".55"'),
          chest: `<g data-lv-float="">${P('M80 80C70 74 72 66 77 66C79 66 80 68 80 68C80 68 81 66 83 66C88 66 90 74 80 80Z', '#ff8fcf')}</g>`,
        }
    }
  },
})
