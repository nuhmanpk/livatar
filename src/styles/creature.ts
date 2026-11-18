import { cast, C, E, O, P, S, star, type Look } from './_cast'

const KINDS = ['dragon', 'unicorn', 'phoenix', 'yeti', 'mermaid', 'kraken', 'griffin', 'golem'] as const
export type CreatureKind = (typeof KINDS)[number]
export interface CreatureOptions { kind?: CreatureKind | 'random' }

export const creature = cast<CreatureKind>({
  name: 'creature',
  kinds: KINDS,
  colors: ['#e1f7ef', '#efe2ff', '#ffe6dc', '#e6efff', '#cfeff0', '#fff1c9'],
  look(kind, r): Look {
    switch (kind) {
      case 'dragon': {
        const g = r.pick<[string, string]>([['#6cc24a', '#3f8a2a'], ['#e8504a', '#a62a26'], ['#4a9ae8', '#2a62a8']])
        return {
          skin: g, suit: [g[0], g[1]], glove: g[0], eye: '#d9a400',
          tail: `<g data-lv-float="">${O('M24 58Q4 50 8 28Q22 36 30 52Z', g[1], 3.5)}${O('M76 58Q96 50 92 28Q78 36 70 52Z', g[1], 3.5)}</g>` + O('M64 82Q84 90 90 74Q84 80 70 78Z', g[0], 3.5),
          back: P('M44 20L50 8L56 20Z', '#ffd23f', ' stroke="#2a2440" stroke-width="2"'),
          front: O('M32 24L24 6L40 18Z', '#f5ecd0', 3) + O('M68 24L76 6L60 18Z', '#f5ecd0', 3) + C(46, 50, 1.4, g[1]) + C(54, 50, 1.4, g[1]),
          chest: O('M42 62Q50 58 58 62V80H42Z', '#f5ecd0', 2.5),
        }
      }
      case 'unicorn':
        return {
          skin: ['#ffffff', '#eadcf5'], suit: ['#ffffff', '#d9c8ec'], glove: '#ffffff',
          back: O('M28 40Q20 66 32 76Q34 54 38 42Z', '#ff8fcf', 3) + O('M72 40Q80 66 68 76Q66 54 62 42Z', '#8fd8ff', 3),
          front: O('M30 30L26 8L42 20Z', '#ffffff', 3) + O('M70 30L74 8L58 20Z', '#ffffff', 3) + O('M44 20L50 -4L56 20Z', '#ffd23f', 3) + S('M45 14L55 10M46 18L54 15', '#e0a100', 1.2) + O('M32 30Q50 14 68 30Q50 22 32 30Z', '#c8a4ff', 3),
          chest: star(50, 70, 4, '#ff8fcf'),
          tail: O('M70 78Q92 84 90 100Q76 90 68 88Z', '#ff8fcf', 3),
        }
      case 'phoenix':
        return {
          skin: ['#ffb040', '#e8741f'], suit: ['#e8504a', '#a62a26'], glove: '#ffb040', eye: '#fff6a8',
          tail: `<g data-lv-float="">${O('M24 62Q2 52 6 24Q22 34 32 54Z', '#ff7a1f', 3.5)}${O('M76 62Q98 52 94 24Q78 34 68 54Z', '#ff7a1f', 3.5)}${O('M40 84Q30 100 50 100Q70 100 60 84Z', '#ffb040', 3.5)}</g>`,
          back: `<g data-lv-float="">${O('M36 24Q30 6 40 0Q40 12 48 12Q46 0 58 -2Q54 10 62 12Q68 4 70 12Q72 22 64 26Z', '#ffd23f', 3)}</g>`,
          front: O('M44 38L50 46L56 38L50 34Z', '#ffd23f', 2),
          chest: O('M42 62Q50 58 58 62V80H42Z', '#ffd23f', 2.5),
        }
      case 'yeti':
        return {
          skin: ['#f2f8ff', '#cfe0f0'], suit: ['#f2f8ff', '#cfe0f0'], glove: '#f2f8ff', noBlush: false,
          back: O('M24 50Q14 40 20 24Q30 14 50 12Q70 14 80 24Q86 40 76 50Q76 36 50 32Q24 36 24 50Z', '#f2f8ff', 4),
          front: O('M26 44Q34 30 50 32Q66 30 74 44Q74 62 50 66Q26 62 26 44Z', '#cfe0f0', 3),
          chest: S('M42 70L46 74M54 70L58 74M48 78L52 82', '#cfe0f0', 2.4),
          prop: O('M78 76L92 76L92 90L78 90Z', '#aee0ff', 3) + S('M82 80L88 86', '#fff', 1.4),
        }
      case 'mermaid':
        return {
          suit: ['#1fb59a', '#13866f'], glove: '#f6cfae',
          tail: O('M32 78Q28 94 18 98Q34 100 50 92Q66 100 82 98Q72 94 68 78Z', '#1fb59a', 3.5),
          back: O('M28 38Q20 66 30 78Q34 54 38 42Z', '#ff7a5a', 3) + O('M72 38Q80 66 70 78Q66 54 62 42Z', '#ff7a5a', 3),
          front: O('M28 38Q26 16 50 16Q74 16 72 38Q60 26 50 28Q40 26 28 38Z', '#ff7a5a', 3.5) + O('M40 20L50 14L60 20Z', '#ffd0ee', 2.5) + star(50, 16, 2.4, '#fff'),
          chest: O('M38 66H62V74H38Z', '#ffd0ee', 3) + S('M42 80Q50 86 58 80', '#fff', 1.4),
          robe: false,
        }
      case 'kraken':
        return {
          skin: ['#a67ce0', '#6a42a8'], suit: ['#a67ce0', '#6a42a8'], glove: '#a67ce0',
          tail: O('M26 80Q10 84 12 98Q22 90 34 90Z', '#a67ce0', 3.5) + O('M74 80Q90 84 88 98Q78 90 66 90Z', '#a67ce0', 3.5) + O('M46 84Q44 98 52 98Q58 96 56 84Z', '#a67ce0', 3.5),
          back: O('M28 34Q26 8 50 8Q74 8 72 34Z', '#a67ce0', 4),
          front: C(36, 14, 2.4, '#d6bfff') + C(60, 12, 3, '#d6bfff') + C(48, 18, 1.8, '#d6bfff') + S('M34 66Q40 70 36 76M46 66Q52 70 48 76M58 66Q64 70 60 76', '#d6bfff', 1.6),
          chest: C(44, 70, 2, '#d6bfff') + C(56, 70, 2, '#d6bfff'),
        }
      case 'griffin':
        return {
          skin: ['#f2d49a', '#d4a85a'], suit: ['#c9822a', '#8a5a2b'], glove: '#f2d49a', eye: '#d9a400',
          tail: `<g data-lv-tilt="6">${O('M26 62Q4 56 4 32Q22 40 32 56Z', '#f5ecd0', 3.5)}${O('M74 62Q96 56 96 32Q78 40 68 56Z', '#f5ecd0', 3.5)}</g>`,
          back: O('M32 22Q28 4 38 6L42 20Z', '#f5ecd0', 3) + O('M68 22Q72 4 62 6L58 20Z', '#f5ecd0', 3),
          front: O('M42 44L50 56L58 44Q50 40 42 44Z', '#ffd23f', 3) + O('M30 28Q50 12 70 28Q50 20 30 28Z', '#f5ecd0', 3),
          chest: O('M42 62Q50 58 58 62V80H42Z', '#f5ecd0', 2.5),
        }
      case 'golem':
        return {
          skin: ['#b9b09f', '#8a8272'], suit: ['#8a8272', '#5f584c'], glove: '#b9b09f', noBlush: true, eye: '#3ec1ff',
          back: O('M26 24L34 14L44 18L56 12L66 18L74 26Z', '#8a8272', 4),
          front: S('M36 18L40 28M60 16L56 26M64 52L58 58M36 50L42 56', '#5f584c', 1.8) + O('M34 20Q40 12 46 18Q40 24 34 20Z', '#6cc24a', 2.5) + O('M58 16Q64 8 70 14Q64 20 58 16Z', '#6cc24a', 2.5),
          chest: C(50, 70, 4, '#3ec1ff', ` stroke="#2a2440" stroke-width="2"`) + S('M40 64L44 72M60 76L56 82', '#5f584c', 1.8),
          prop: O('M76 72H92V86H76Z', '#8a8272', 3.5),
        }
    }
  },
})
