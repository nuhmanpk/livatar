import { cast, C, E, O, P, S, star, type Look } from './_cast'

const KINDS = ['pirate', 'explorer', 'cowboy', 'viking', 'samurai', 'ninja', 'astronaut', 'diver'] as const
export type PirateKind = (typeof KINDS)[number]
export interface PirateOptions { kind?: PirateKind | 'random' }

const hair = (c: string) => O('M28 38Q26 16 50 16Q74 16 72 38Q60 26 50 28Q40 26 28 38Z', c, 3.5)

export const pirate = cast<PirateKind>({
  name: 'pirate',
  kinds: KINDS,
  colors: ['#cfeff0', '#fff1c9', '#e6efff', '#ffe6dc', '#e1f7ef', '#f0ebe5'],
  look(kind, r): Look {
    const brown = r.pick(['#5a3a1c', '#2e2118', '#8a5a2b'])
    switch (kind) {
      case 'pirate':
        return {
          suit: ['#e8344e', '#a82238'],
          back: hair(brown),
          front: O('M26 26Q50 -2 74 26Q50 20 26 26Z', '#1f1f2e', 4) + O('M44 10H56L58 16H42Z', '#f4f4f4', 2) + S('M47 12L53 15M53 12L47 15', '#1f1f2e', 1.2) +
            O('M42 38Q46 36 50 38L48 46Q44 48 42 38Z', '#1f1f2e', 2) + S('M30 30L42 38', '#1f1f2e', 2),
          chest: O('M38 70H62V76H38Z', '#f4f4f4', 2) + O('M36 76H64V81H36Z', '#5a3a1c', 2.5),
          prop: S('M80 80L88 52', '#c9b27a', 3) + O('M84 52Q92 40 96 52Q90 54 86 54Z', '#cfd6e4', 2.5),
        }
      case 'explorer':
        return {
          suit: ['#b49a5a', '#8a7238'],
          back: hair(brown),
          front: O('M24 28Q50 20 76 28Q50 34 24 28Z', '#c9a86a', 4) + O('M32 28Q32 8 50 8Q68 8 68 28Z', '#c9a86a', 4) + S('M33 24H67', '#5a3a1c', 2.5),
          chest: S('M38 62L60 80', '#5a3a1c', 3),
          prop: C(84, 74, 6, '#fff', ` stroke="#2a2440" stroke-width="2.5"`) + S('M84 74L87 70', '#e8344e', 1.4),
        }
      case 'cowboy':
        return {
          suit: ['#3d7be0', '#2a5cb8'],
          back: hair(brown),
          front: O('M20 28Q50 18 80 28Q76 36 50 34Q24 36 20 28Z', '#8a5a2b', 4) + O('M32 28Q34 6 50 10Q66 6 68 28Z', '#8a5a2b', 4) + S('M33 24H67', '#e0b25a', 2.5),
          chest: star(50, 68, 4, '#ffd23f') + O('M36 78H64V83H36Z', '#5a3a1c', 2.5),
          prop: S('M78 78Q86 60 94 66', '#c9a86a', 3) + C(94, 66, 3, '#c9a86a'),
        }
      case 'viking':
        return {
          suit: ['#6a4a2a', '#4a3018'],
          back: O('M28 40Q24 64 34 74Q34 52 38 42Z', '#d98a3a', 3) + O('M72 40Q76 64 66 74Q66 52 62 42Z', '#d98a3a', 3),
          front: O('M28 34Q28 12 50 12Q72 12 72 34Q50 26 28 34Z', '#9aa4b8', 4) + O('M28 30Q16 26 14 12Q26 14 32 26Z', '#f5ecd0', 3) + O('M72 30Q84 26 86 12Q74 14 68 26Z', '#f5ecd0', 3) +
            O('M30 48Q50 92 70 48Q62 68 50 68Q38 68 30 48Z', '#d98a3a', 3.5),
          chest: O('M38 62H62L60 74H40Z', '#9aa4b8', 3),
          prop: S('M80 90L82 44', '#8a5a2b', 3.4) + O('M74 44Q82 36 90 44Q82 48 74 44Z', '#cfd6e4', 3),
        }
      case 'samurai':
        return {
          suit: ['#c43d4e', '#7d1f2e'],
          back: O('M42 12Q50 -2 58 12Z', '#1f1f2e', 3),
          front: O('M26 30Q28 10 50 10Q72 10 74 30Q50 22 26 30Z', '#2b2b3c', 4) + O('M26 30L18 36L30 38Z', '#c43d4e', 3) + O('M74 30L82 36L70 38Z', '#c43d4e', 3) + O('M44 12L50 2L56 12Z', '#ffd23f', 2.5),
          chest: O('M38 62H62L60 78H40Z', '#2b2b3c', 3) + S('M40 68H60M40 73H60', '#c43d4e', 1.6),
          prop: S('M80 90L90 50', '#cfd6e4', 3) + S('M79 78L83 76', '#8a5a2b', 3.4),
        }
      case 'ninja':
        return {
          suit: ['#2b2b3c', '#1a1a26'], glove: '#2b2b3c',
          front: O('M27 40Q27 14 50 14Q73 14 73 40Q73 32 50 30Q27 32 27 40Z', '#2b2b3c', 4) + O('M28 54Q50 70 72 54L72 46Q50 52 28 46Z', '#2b2b3c', 3) + S('M28 36Q50 40 72 36', '#e8344e', 3) + O('M72 34L84 28L80 40Z', '#e8344e', 2.5),
          chest: S('M38 62L62 76', '#e8344e', 3),
          prop: star(86, 62, 5, '#cfd6e4'),
        }
      case 'astronaut':
        return {
          suit: ['#f4f6fa', '#c3cad8'], glove: '#f4f6fa', noBlush: false,
          back: O('M26 56H74V80H26Z', '#c3cad8', 3.5),
          front: `<circle cx="50" cy="40" r="26" fill="rgba(180,225,255,.28)" stroke="#2a2440" stroke-width="4.5"/><circle cx="50" cy="40" r="26" fill="none" stroke="#f4f6fa" stroke-width="2.5"/>` + E(40, 24, 6, 3, '#fff', -35, ' opacity=".7"'),
          chest: O('M42 66H58V74H42Z', '#8a95a8', 2.5) + C(46, 70, 1.6, '#e8344e') + C(54, 70, 1.6, '#3ec1ff'),
          prop: O('M80 68L88 60L92 66L84 74Z', '#e8344e', 2.5),
        }
      case 'diver':
        return {
          suit: ['#2f6fd6', '#1c4a9a'], glove: '#1c4a9a',
          back: O('M24 54H34V84H24Z', '#aab4c6', 3) + O('M66 54H76V84H66Z', '#aab4c6', 3),
          front: O('M27 34Q27 12 50 12Q73 12 73 34Q50 26 27 34Z', '#1c4a9a', 4) + O('M31 34H69V50Q50 56 31 50Z', 'rgba(170,225,255,.45)', 3) + S('M27 38Q14 44 18 60', '#2a2440', 2.5),
          chest: O('M42 64H58V70H42Z', '#ffd23f', 2.5),
          prop: S('M82 82Q90 70 84 58', '#9aa4b8', 3) + C(84, 54, 3, 'rgba(180,225,255,.8)'),
        }
    }
  },
})
