import { cast, C, E, O, P, S, star, type Look } from './_cast'

const KINDS = ['greek', 'norse', 'pharaoh', 'jackal', 'gorgon', 'minotaur', 'centaur', 'satyr'] as const
export type MythKind = (typeof KINDS)[number]
export interface MythOptions { kind?: MythKind | 'random' }

const leaf = (x: number, y: number, a: number) => E(x, y, 4, 2, '#6cc24a', a, ' stroke="#2a2440" stroke-width="1.4"')

export const myth = cast<MythKind>({
  name: 'myth',
  kinds: KINDS,
  colors: ['#fff1c9', '#e6efff', '#efe2ff', '#e1f7ef', '#ffe6dc', '#f0ebe5'],
  look(kind, r): Look {
    const brown = r.pick(['#5a3a1c', '#2e2118', '#8a5a2b'])
    switch (kind) {
      case 'greek':
        return {
          suit: ['#fafafa', '#d4d8e0'], robe: true,
          back: O('M28 38Q26 16 50 16Q74 16 72 38Q60 26 50 28Q40 26 28 38Z', '#e8c24a', 3.5),
          front: S('M28 28Q50 18 72 28', '#6cc24a', 3.6) + leaf(34, 26, -30) + leaf(42, 22, -15) + leaf(58, 22, 15) + leaf(66, 26, 30),
          chest: O('M38 62L62 62L58 70L42 70Z', '#fff', 2) + O('M36 78H64V82H36Z', '#e8c24a', 2.5),
          prop: S('M82 94V44', '#e8c24a', 3) + `<g data-lv-float="">${O('M78 44L82 34L86 44L82 40Z', '#ffd23f', 2)}</g>`,
        }
      case 'norse':
        return {
          suit: ['#3a5a8a', '#25405f'],
          back: O('M28 40Q22 66 32 78Q34 54 38 42Z', '#f5d97a', 3) + O('M72 40Q78 66 68 78Q66 54 62 42Z', '#f5d97a', 3) + O('M24 56Q18 76 22 92Q50 84 78 92Q82 76 76 56Z', '#c43d4e', 4),
          front: O('M28 30Q30 14 50 14Q70 14 72 30Q50 22 28 30Z', '#f5d97a', 3.5) + O('M30 48Q50 90 70 48Q62 66 50 66Q38 66 30 48Z', '#f5d97a', 3.5) + S('M50 66V78', '#f5d97a', 3),
          chest: O('M40 62H60V72H40Z', '#9aa4b8', 3) + S('M46 66L54 66M50 64V70', '#ffd23f', 1.6),
          prop: S('M82 94V54', '#8a5a2b', 3.4) + O('M74 52Q82 40 90 52L82 56Z', '#9aa4b8', 3) + `<g data-lv-float="">${S('M84 36L90 28L88 34L94 32', '#ffe066', 1.8)}</g>`,
        }
      case 'pharaoh':
        return {
          suit: ['#f5ecd0', '#d4c690'], glove: '#e0b480',
          back: O('M24 30Q24 6 50 6Q76 6 76 30L78 70L66 70L66 38Q50 28 34 38L34 70L22 70Z', '#2a5ab0', 4),
          front: S('M26 22H74M26 28H74', '#ffd23f', 3.6) + O('M44 10L50 -2L56 10Z', '#ffd23f', 2.5) + O('M46 62L50 80L54 62Z', '#2a5ab0', 3),
          chest: O('M38 62Q50 74 62 62L62 68Q50 80 38 68Z', '#ffd23f', 3) + C(50, 72, 2.4, '#3ec1ff'),
          prop: S('M82 94V44', '#ffd23f', 3) + S('M76 46Q82 36 88 46', '#ffd23f', 3),
        }
      case 'jackal':
        return {
          skin: ['#4a4a5a', '#2e2e3c'], suit: ['#f5ecd0', '#d4c690'], glove: '#4a4a5a', eye: '#ffd23f',
          back: O('M30 30L24 0L44 20Z', '#2e2e3c', 3.5) + O('M70 30L76 0L56 20Z', '#2e2e3c', 3.5) + O('M24 30Q50 10 76 30L78 60L66 60L66 38Q50 28 34 38L34 60L22 60Z', '#2a5ab0', 4),
          front: O('M40 46Q50 66 60 46Q60 56 50 60Q40 56 40 46Z', '#6a6a7a', 3) + C(50, 56, 2.4, '#17122a') + S('M26 24H74', '#ffd23f', 3),
          chest: O('M38 62Q50 74 62 62L62 68Q50 80 38 68Z', '#ffd23f', 3),
          prop: S('M82 94V48', '#ffd23f', 3) + C(82, 44, 4, 'rgba(0,0,0,0)', ` stroke="#ffd23f" stroke-width="2.6"`),
        }
      case 'gorgon': {
        const snake = (x: number, y: number, dx: number) => S(`M${x} ${y}Q${x + dx} ${y - 8} ${x + dx / 2} ${y - 14}`, '#4a9a4a', 3.2) + C(x + dx / 2, y - 15, 2, '#6cc24a', ` stroke="#2a2440" stroke-width="1.2"`)
        return {
          skin: ['#bfe8a0', '#8fc070'], suit: ['#4a9a6a', '#2e6e48'], robe: true, glove: '#bfe8a0', eye: '#ffd23f',
          back: `<g data-lv-float="">${snake(32, 26, -8)}${snake(42, 20, -4)}${snake(50, 18, 0)}${snake(58, 20, 4)}${snake(68, 26, 8)}</g>`,
          front: O('M30 26Q50 14 70 26Q50 22 30 26Z', '#4a9a4a', 3),
          chest: O('M40 62H60V72H40Z', '#ffd23f', 2.5),
        }
      }
      case 'minotaur':
        return {
          skin: ['#a87a4a', '#7a5230'], suit: ['#8a4a2a', '#5a2e16'], glove: '#a87a4a',
          back: O('M30 28Q10 28 12 6Q22 18 36 20Z', '#f5ecd0', 3.5) + O('M70 28Q90 28 88 6Q78 18 64 20Z', '#f5ecd0', 3.5) + P('M24 38L10 34L28 46Z', '#7a5230', ' stroke="#2a2440" stroke-width="2.5"') + P('M76 38L90 34L72 46Z', '#7a5230', ' stroke="#2a2440" stroke-width="2.5"'),
          front: O('M38 46Q50 66 62 46Q62 62 50 64Q38 62 38 46Z', '#e8c9a0', 3) + C(46, 56, 1.8, '#2a2440') + C(54, 56, 1.8, '#2a2440') + C(50, 52, 2.6, '#ffd0a0', ` stroke="#2a2440" stroke-width="1.4"`),
          chest: O('M38 70H62V78H38Z', '#5a2e16', 2.5) + C(50, 74, 2.6, '#ffd23f'),
          prop: S('M82 94V50', '#8a5a2b', 3.6) + O('M74 48Q82 36 90 48Z', '#9aa4b8', 3),
        }
      case 'centaur':
        return {
          suit: ['#c9822a', '#8a5a2b'], glove: '#e0aa80',
          tail: O('M26 74Q24 94 34 98H66Q76 94 74 74Q50 82 26 74Z', '#c9822a', 4.5) + O('M72 82Q94 88 90 100Q80 92 70 90Z', '#5a3a1c', 3.5) + S('M34 98V92M44 98V92M56 98V92M66 98V92', '#8a5a2b', 3),
          back: O('M28 38Q26 16 50 16Q74 16 72 38Q60 26 50 28Q40 26 28 38Z', brown, 3.5),
          front: O('M34 26Q50 16 66 26Q50 22 34 26Z', brown, 2.5),
          chest: O('M38 62H62L60 74H40Z', '#e0aa80', 3),
          prop: S('M80 74Q92 62 84 46', '#8a5a2b', 2.8) + S('M84 46V76', '#fff', 0.8),
          robe: false,
        }
      case 'satyr':
        return {
          suit: ['#8a6a4a', '#5a4228'], glove: '#e0aa80',
          back: O('M28 38Q26 16 50 16Q74 16 72 38Q60 26 50 28Q40 26 28 38Z', '#7a4a2a', 3.5) + P('M26 40L12 36L30 48Z', '#e0aa80', ' stroke="#2a2440" stroke-width="2.5"') + P('M74 40L88 36L70 48Z', '#e0aa80', ' stroke="#2a2440" stroke-width="2.5"'),
          front: O('M32 24Q24 14 30 4Q34 14 42 18Z', '#f5ecd0', 3) + O('M68 24Q76 14 70 4Q66 14 58 18Z', '#f5ecd0', 3) + O('M40 56Q50 70 60 56Q50 60 40 56Z', '#7a4a2a', 2.5) + S('M30 20Q50 12 70 20', '#6cc24a', 3),
          chest: O('M38 62H62L58 74H42Z', '#8a6a4a', 3),
          prop: S('M80 94V60', '#8a5a2b', 2.8) + O('M76 60Q80 50 86 56L84 66Q78 68 76 60Z', '#c9822a', 2.5) + S('M80 56V48M84 54V46', '#8a5a2b', 2),
        }
    }
  },
})
