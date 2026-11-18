import { cast, C, E, O, P, S, type Look } from './_cast'

const KINDS = ['hamster', 'turtle', 'goldfish', 'hedgehog', 'otter', 'sloth', 'raccoon', 'llama'] as const
export type CritterKind = (typeof KINDS)[number]
export interface CritterOptions { kind?: CritterKind | 'random' }

const ear = (x: number, y: number, c: string, i: string, rx = 7, ry = 8) => E(x, y, rx, ry, c, 0, ' stroke="#2a2440" stroke-width="3"') + E(x, y + 1, rx * 0.5, ry * 0.5, i)

export const critter = cast<CritterKind>({
  name: 'critter',
  kinds: KINDS,
  colors: ['#fff1c9', '#e1f7ef', '#e6efff', '#ffe6dc', '#efe2ff', '#f0ebe5'],
  look(kind): Look {
    switch (kind) {
      case 'hamster':
        return {
          skin: ['#ffe2b8', '#e8b87a'], suit: ['#ffe2b8', '#e8b87a'], glove: '#ffe2b8',
          back: ear(32, 24, '#e8b87a', '#ffb0b8') + ear(68, 24, '#e8b87a', '#ffb0b8'),
          front: O('M34 40Q50 54 66 40Q66 60 50 62Q34 60 34 40Z', '#fff6e4', 3) + E(50, 48, 2.6, 1.8, '#ff8fa0') + O('M40 22Q50 14 60 22Q50 20 40 22Z', '#c9822a', 2.5),
          chest: E(50, 70, 6, 8, '#fff6e4'),
          tail: C(50, 90, 4, '#ffb0b8'),
        }
      case 'turtle':
        return {
          skin: ['#a8d08a', '#789e5a'], suit: ['#a8d08a', '#789e5a'], glove: '#a8d08a',
          tail: O('M24 56Q20 90 50 90Q80 90 76 56Z', '#3f8a5a', 4.5) + S('M32 64L50 72L68 64M50 56V84M30 78L50 72L70 78', '#2a6e3e', 2),
          front: O('M32 24Q50 4 68 24Q50 16 32 24Z', '#c9a86a', 3) + S('M42 20L46 14M54 20L58 14', '#8a7238', 1.6),
          chest: S('M42 68Q50 74 58 68', '#6a8a4a', 1.6),
        }
      case 'goldfish':
        return {
          skin: ['#ffa43a', '#e8741f'], suit: ['#ffa43a', '#e8741f'], glove: '#ffa43a',
          back: O('M24 38Q8 24 12 50Q16 44 26 46Z', '#ffd0a0', 3) + O('M76 38Q92 24 88 50Q84 44 74 46Z', '#ffd0a0', 3),
          front: O('M42 16Q50 0 58 16Q50 12 42 16Z', '#ffd0a0', 3) + S('M32 30Q38 40 32 50M68 30Q62 40 68 50', '#e8741f', 1.6, ' opacity=".5"') + C(50, 55, 2.2, '#ffe9c8', ` stroke="#2a2440" stroke-width="1.4"`),
          chest: S('M40 66Q50 72 60 66M40 74Q50 80 60 74', '#ffd0a0', 1.8),
          tail: O('M40 82Q50 100 60 82Z', '#ffd0a0', 3.5),
        }
      case 'hedgehog':
        return {
          skin: ['#f2d4b2', '#d4a87a'], suit: ['#f2d4b2', '#d4a87a'], glove: '#f2d4b2',
          back: O('M20 40L16 22L26 26L26 10L36 18L42 4L50 14L58 4L64 18L74 10L74 26L84 22L80 40Q50 26 20 40Z', '#6a4a3a', 3.5),
          front: O('M32 40Q50 24 68 40Q68 58 50 62Q32 58 32 40Z', '#f2d4b2', 2.5) + C(50, 50, 2.4, '#2a2440') + ear(30, 30, '#f2d4b2', '#ffb0b8', 4, 5) + ear(70, 30, '#f2d4b2', '#ffb0b8', 4, 5),
          chest: E(50, 70, 7, 9, '#f6e4cc'),
        }
      case 'otter':
        return {
          skin: ['#b88a5a', '#8a5e34'], suit: ['#b88a5a', '#8a5e34'], glove: '#b88a5a',
          back: ear(32, 24, '#8a5e34', '#b88a5a', 5, 5) + ear(68, 24, '#8a5e34', '#b88a5a', 5, 5),
          front: O('M34 42Q50 56 66 42Q66 60 50 62Q34 60 34 42Z', '#e8d4b4', 3) + E(50, 48, 3.4, 2.2, '#2a2440') + S('M38 52H30M38 55H31M62 52H70M62 55H69', '#5a3a1c', 1),
          chest: E(50, 70, 7, 9, '#e8d4b4'),
          prop: O('M78 72Q86 64 94 72Q90 84 82 82Z', '#9aa4b8', 3),
        }
      case 'sloth':
        return {
          skin: ['#cfb08a', '#a3825a'], suit: ['#b29270', '#8a6a48'], glove: '#cfb08a',
          back: E(50, 40, 25, 22, '#8a6a48', 0, ' stroke="#2a2440" stroke-width="3"'),
          front: E(40, 41, 6.5, 7.5, '#4a3a2a', -20) + E(60, 41, 6.5, 7.5, '#4a3a2a', 20) + C(50, 50, 2.4, '#2a2440'),
          chest: S('M38 64L42 70M62 64L58 70', '#6a4e30', 2),
          prop: S('M82 96V30', '#8a5a2b', 4) + O('M78 40Q84 34 90 40Q86 46 80 44Z', '#6cc24a', 2),
        }
      case 'raccoon':
        return {
          skin: ['#bfc4d0', '#8a90a0'], suit: ['#8a90a0', '#5f6475'], glove: '#bfc4d0',
          back: ear(32, 22, '#8a90a0', '#2a2a3a', 6, 7) + ear(68, 22, '#8a90a0', '#2a2a3a', 6, 7),
          front: O('M26 40Q32 32 44 36Q50 40 56 36Q68 32 74 40Q72 50 62 50Q54 48 50 44Q46 48 38 50Q28 50 26 40Z', '#2a2a3a', 2) + E(50, 54, 5, 3.4, '#f4f4f4') + C(50, 51, 2, '#2a2440'),
          chest: E(50, 70, 7, 9, '#f4f4f4'),
          tail: O('M66 84Q92 80 90 60Q84 74 70 74Z', '#8a90a0', 3.5) + S('M82 76L80 70M88 70L84 64', '#2a2a3a', 3),
        }
      case 'llama':
        return {
          skin: ['#f4ecde', '#d4c4a8'], suit: ['#f4ecde', '#d4c4a8'], glove: '#f4ecde',
          back: O('M30 28L26 4L40 20Z', '#f4ecde', 3.5) + O('M70 28L74 4L60 20Z', '#f4ecde', 3.5),
          front: O('M30 26Q50 6 70 26Q50 18 30 26Z', '#e8d4b4', 3.5) + O('M42 52Q50 62 58 52Q58 62 50 64Q42 62 42 52Z', '#d4c4a8', 2.5) + C(47, 54, 1.2, '#2a2440') + C(53, 54, 1.2, '#2a2440'),
          chest: O('M38 64H62V72H38Z', '#e8344e', 2.5) + S('M42 64V72M50 64V72M58 64V72', '#ffd23f', 1.4),
        }
    }
  },
})
