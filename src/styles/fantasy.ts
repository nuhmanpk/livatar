import { cast, C, E, O, P, S, star, type Look } from './_cast'

const KINDS = ['wizard', 'elf', 'dwarf', 'knight', 'orc', 'fairy', 'witch', 'bard'] as const
export type FantasyKind = (typeof KINDS)[number]
export interface FantasyOptions { kind?: FantasyKind | 'random' }

const cap = (c: string) => O('M28 38Q26 16 50 16Q74 16 72 38Q60 26 50 28Q40 26 28 38Z', c, 3.5)
const brim = (c: string) => O('M22 28Q50 18 78 28Q50 34 22 28Z', c, 4)

export const fantasy = cast<FantasyKind>({
  name: 'fantasy',
  kinds: KINDS,
  colors: ['#efe2ff', '#e1f7ef', '#fff1c9', '#e6efff', '#ffe6dc', '#f0ebe5'],
  look(kind, r): Look {
    const hue = r.pick(['#5b3fc4', '#2f6fd6', '#1f8a6e', '#b03a8a'])
    switch (kind) {
      case 'wizard':
        return {
          suit: [hue, '#2e2466'], robe: true,
          back: O('M30 36Q28 56 36 64L64 64Q72 56 70 36Z', '#e9e9f2', 3.5),
          front: O('M30 26Q46 -8 66 -2Q58 6 70 26Z', hue, 4) + brim(hue) + star(48, 12, 2.6) + star(58, 18, 1.8),
          chest: O('M40 66Q50 80 60 66Q50 72 40 66Z', '#e9e9f2', 2.5),
          prop: S('M80 78L90 44', '#8a5a2b', 3.2) + `<g data-lv-float="">${star(90, 40, 4.4)}</g>`,
        }
      case 'elf':
        return {
          skin: ['#ffe9d2', '#f0c4a2'], suit: ['#3f9a5a', '#2a6e3e'],
          back: P('M26 40L8 30L30 46Z', '#ffe9d2', ' stroke="#2a2440" stroke-width="2.5"') + P('M74 40L92 30L70 46Z', '#ffe9d2', ' stroke="#2a2440" stroke-width="2.5"') + O('M27 44Q22 66 30 72Q32 50 36 44Z', '#f5d97a', 3) + O('M73 44Q78 66 70 72Q68 50 64 44Z', '#f5d97a', 3),
          front: cap('#f5d97a') + S('M34 22Q50 16 66 22', '#d9b84a', 1.5) + O('M40 20L50 12L60 20L50 24Z', '#7fe0a0', 2.5),
          chest: O('M42 62L50 70L58 62', '#e7d38a', 2),
          prop: S('M82 80Q92 62 82 44', '#8a5a2b', 2.5) + S('M82 44L82 80', '#fff', 0.8),
        }
      case 'dwarf':
        return {
          suit: ['#b4502c', '#7d3418'],
          front: O('M28 24Q50 8 72 24Q50 30 28 24Z', '#9aa4b8', 4) + O('M44 14L50 6L56 14Z', '#c8d0de', 3) + O('M30 48Q50 90 70 48Q62 66 50 66Q38 66 30 48Z', '#c0541f', 3.5),
          chest: O('M36 76H64V82H36Z', '#8a5a2b', 2.5) + O('M46 75H54V83H46Z', '#ffd23f', 2),
          prop: O('M80 50L92 62L90 64L78 54Z', '#9aa4b8', 3) + S('M80 78L84 52', '#8a5a2b', 3),
        }
      case 'knight':
        return {
          suit: ['#aab4c6', '#6f7a8f'], glove: '#8a95a8',
          back: O('M24 56Q18 72 22 90Q50 84 78 90Q82 72 76 56Z', '#c43d4e', 4),
          front: O('M28 44Q28 14 50 14Q72 14 72 44L72 38Q50 30 28 38Z', '#c3ccdb', 4.5) + O('M48 2Q50 -4 56 4L52 16L46 16Z', '#e8344e', 3) + S('M36 34H64', '#2a2440', 3),
          chest: O('M44 64L56 64L58 74L50 80L42 74Z', '#e8344e', 3) + star(50, 71, 3, '#ffd23f'),
          prop: O('M78 76L90 76L90 88L84 94L78 88Z', '#2f6fd6', 3.5) + S('M82 80H86M84 78V90', '#ffd23f', 1.4),
        }
      case 'orc':
        return {
          skin: ['#8fd05a', '#5a9a32'], suit: ['#7a4a2a', '#4e2c14'], eye: '#d9a400',
          back: P('M26 40L14 28L30 44Z', '#8fd05a', ' stroke="#2a2440" stroke-width="2.5"') + P('M74 40L86 28L70 44Z', '#8fd05a', ' stroke="#2a2440" stroke-width="2.5"'),
          front: O('M40 20L50 8L60 20Q50 16 40 20Z', '#3a3a44', 3) + P('M41 60L44 54L47 60Z', '#fff', ' stroke="#2a2440" stroke-width="1.5"') + P('M53 60L56 54L59 60Z', '#fff', ' stroke="#2a2440" stroke-width="1.5"'),
          chest: O('M38 62H62L58 76H42Z', '#9aa4b8', 3),
          prop: S('M80 80L86 50', '#5a3a1c', 4) + C(88, 46, 6, '#6e6e7a', ` stroke="#2a2440" stroke-width="2.5"`),
        }
      case 'fairy':
        return {
          suit: ['#ff8fcf', '#d85aa8'], robe: true,
          tail: `<g data-lv-float="">${E(24, 62, 12, 20, 'rgba(190,240,255,.8)', -30, ' stroke="#2a2440" stroke-width="2.5"')}${E(76, 62, 12, 20, 'rgba(190,240,255,.8)', 30, ' stroke="#2a2440" stroke-width="2.5"')}</g>`,
          back: O('M28 40Q22 64 34 70Q32 50 36 40Z', '#ffd0ee', 3) + O('M72 40Q78 64 66 70Q68 50 64 40Z', '#ffd0ee', 3),
          front: cap('#ffd0ee') + star(50, 14, 3.4, '#fff6a8') + `<g data-lv-float="">${star(82, 18, 2.6, '#fff6a8')}${star(18, 26, 2, '#fff6a8')}</g>`,
          prop: S('M80 78L88 52', '#c8a4ff', 2.6) + `<g data-lv-float="">${star(88, 48, 4, '#fff6a8')}</g>`,
        }
      case 'witch':
        return {
          suit: ['#3a2a58', '#221638'], robe: true, glove: '#8fd05a', skin: ['#d9f0c0', '#a3cf84'],
          back: O('M28 40Q22 64 32 72Q34 50 38 40Z', '#2a1f3f', 3) + O('M72 40Q78 64 68 72Q66 50 62 40Z', '#2a1f3f', 3),
          front: O('M30 26Q44 -8 62 -4Q56 6 70 26Z', '#2a1f3f', 4) + brim('#2a1f3f') + P('M34 24Q50 28 66 24L66 28Q50 32 34 28Z', '#ff9a2e'),
          chest: C(50, 68, 4, '#ff9a2e', ` stroke="#2a2440" stroke-width="2"`),
          prop: S('M78 90L90 40', '#8a5a2b', 3) + O('M84 42Q92 34 96 44Q90 48 86 46Z', '#e8c24a', 2.5),
        }
      case 'bard':
        return {
          suit: ['#d4a017', '#9a6e0a'],
          back: O('M28 38Q24 60 32 66Q34 48 38 40Z', '#8a4a2a', 3) + O('M72 38Q76 60 68 66Q66 48 62 40Z', '#8a4a2a', 3),
          front: cap('#8a4a2a') + O('M32 24Q50 4 70 18Q58 22 44 26Z', '#2f9a5a', 4) + O('M64 18Q74 2 82 8Q72 10 70 20Z', '#e8344e', 2.5),
          chest: O('M42 62L58 62L56 72L44 72Z', '#f5ecd0', 2.5),
          prop: O('M80 80Q74 70 82 62Q90 56 94 66Q96 78 86 82Z', '#c07a3a', 3) + S('M82 66L90 76', '#fff', 1.2),
        }
    }
  },
})
