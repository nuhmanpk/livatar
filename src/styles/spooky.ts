import { cast, C, E, O, P, S, star, type Look } from './_cast'

const KINDS = ['zombie', 'vampire', 'mummy', 'skeleton', 'werewolf', 'pumpkin', 'reaper', 'stitched'] as const
export type SpookyKind = (typeof KINDS)[number]
export interface SpookyOptions { kind?: SpookyKind | 'random' }

export const spooky = cast<SpookyKind>({
  name: 'spooky',
  kinds: KINDS,
  colors: ['#e3e1f0', '#efe2ff', '#ffe6dc', '#e1f7ef', '#f0ebe5', '#fff1c9'],
  look(kind, r): Look {
    switch (kind) {
      case 'zombie':
        return {
          skin: ['#a8d08a', '#789e5a'], suit: ['#6a6a8a', '#46465f'], glove: '#a8d08a', eye: '#c9c24a',
          back: O('M30 30Q30 16 42 18L40 28Z', '#4a5a3a', 3) + O('M62 18Q72 18 70 30L60 28Z', '#4a5a3a', 3),
          front: S('M38 30L44 36M60 34L64 42', '#46465f', 1.6) + P('M56 24L64 24L60 32Z', '#e08a8a', ' stroke="#2a2440" stroke-width="1.5"'),
          chest: S('M42 66L46 70M54 72L58 76', '#46465f', 1.6) + O('M60 64L66 70L62 74Z', '#e08a8a', 1.5),
          prop: S('M80 78L92 60', '#789e5a', 5),
        }
      case 'vampire':
        return {
          skin: ['#f4e9ee', '#d4bcc6'], suit: ['#2a2340', '#17122a'], glove: '#f4e9ee',
          back: O('M24 56Q16 76 20 94Q50 84 80 94Q84 76 76 56Z', '#c43d4e', 4.5) + O('M28 36Q26 14 50 14Q74 14 72 36Q60 24 50 26Q40 24 28 36Z', '#17122a', 3.5),
          front: O('M28 34Q34 18 50 24Q66 18 72 34Q60 24 50 30Q40 24 28 34Z', '#17122a', 3) + P('M44 54L46 59L48 54Z', '#fff', ' stroke="#2a2440" stroke-width="1.2"') + P('M52 54L54 59L56 54Z', '#fff', ' stroke="#2a2440" stroke-width="1.2"'),
          chest: O('M42 62L50 72L58 62', '#f4f4f4', 2) + O('M47 66H53V70H47Z', '#c43d4e', 1.5),
        }
      case 'mummy':
        return {
          skin: ['#f2ead6', '#d4c9a8'], suit: ['#f2ead6', '#d4c9a8'], glove: '#f2ead6', noBlush: true,
          front: S('M30 26Q50 20 70 26M29 34Q50 28 71 34M31 42Q36 40 40 44M60 52Q66 50 70 54M32 56Q50 60 68 56', '#b8a984', 3) + S('M30 30L70 36M30 38L70 30', '#d4c9a8', 2.4, ' opacity=".7"'),
          chest: S('M38 66L62 72M38 74L62 80M40 82L60 78', '#b8a984', 2.4),
          prop: S('M80 80Q88 88 84 98', '#d4c9a8', 3),
        }
      case 'skeleton':
        return {
          skin: ['#fbfbf4', '#d9d9c8'], suit: ['#fbfbf4', '#d9d9c8'], glove: '#fbfbf4', noBlush: true,
          front: O('M44 52H56V60H44Z', '#fbfbf4', 2) + S('M47 52V60M50 52V60M53 52V60', '#2a2440', 1.2),
          chest: S('M42 64H58M42 69H58M42 74H58M50 62V78', '#9a9a88', 2.4),
          prop: O('M78 72H94V80H78Z', '#fbfbf4', 2.5) + C(78, 72, 3, '#fbfbf4', ` stroke="#2a2440" stroke-width="2"`),
        }
      case 'werewolf':
        return {
          skin: ['#a79ab8', '#6f6485'], suit: ['#4a3f60', '#2e2640'], glove: '#a79ab8', eye: '#d9a400',
          back: O('M28 30L22 4L42 20Z', '#6f6485', 3.5) + O('M72 30L78 4L58 20Z', '#6f6485', 3.5) + O('M24 44Q16 64 28 70Q32 52 36 44Z', '#8a7ea0', 3) + O('M76 44Q84 64 72 70Q68 52 64 44Z', '#8a7ea0', 3),
          front: O('M34 40Q50 58 66 40Q60 62 50 64Q40 62 34 40Z', '#d4cce0', 3) + C(50, 50, 3, '#2a2440') + P('M42 58L44 62L46 58Z', '#fff') + P('M54 58L56 62L58 58Z', '#fff'),
          chest: S('M42 66L46 72M54 66L58 72', '#2e2640', 1.8),
        }
      case 'pumpkin':
        return {
          skin: ['#ffa43a', '#e8741f'], suit: ['#2a2340', '#17122a'], glove: '#ffa43a', noBlush: true, eye: '#ffd23f',
          back: S('M30 24Q50 6 70 24', '#e8741f', 2),
          front: O('M46 20Q44 6 54 6L54 20Z', '#6cc24a', 3) + S('M34 38Q50 14 66 38M40 40Q50 18 60 40', '#e8741f', 1.4, ' opacity=".6"') + O('M38 36L46 42L38 44Z', '#ffd23f', 1.5) + O('M62 36L54 42L62 44Z', '#ffd23f', 1.5),
          chest: C(50, 70, 3.6, '#ffa43a', ` stroke="#2a2440" stroke-width="2"`),
          prop: O('M82 70Q92 62 94 76Q90 88 82 84Z', '#ffa43a', 3) + S('M86 66L88 62', '#6cc24a', 2.4),
        }
      case 'reaper':
        return {
          skin: ['#fbfbf4', '#d9d9c8'], suit: ['#2a2a3e', '#15151f'], robe: true, glove: '#fbfbf4', noBlush: true, eye: '#8fe0ff',
          back: O('M24 40Q22 62 28 72L72 72Q78 62 76 40Z', '#15151f', 4),
          front: O('M24 40Q22 12 50 10Q78 12 76 40Q72 22 50 22Q28 22 24 40Z', '#2a2a3e', 4) + S('M44 56H56M47 54V58M50 54V58M53 54V58', '#2a2440', 1.2),
          chest: S('M50 62V84', '#8fe0ff', 1.4, ' opacity=".6"'),
          prop: S('M82 96V30', '#8a5a2b', 3.2) + O('M82 30Q92 22 94 34Q88 28 82 34Z', '#cfd6e4', 2.5),
        }
      case 'stitched':
        return {
          skin: ['#a8d08a', '#789e5a'], suit: ['#3a3a5a', '#25253f'], glove: '#a8d08a', eye: '#d9a400',
          back: O('M27 36L27 18L73 18L73 36Z', '#25253f', 4),
          front: S('M32 22L68 22M38 18L38 26M46 18L46 26M54 18L54 26M62 18L62 26', '#a8d08a', 1.6) + S('M60 34L70 40M62 32L64 38M66 36L68 42', '#2a2440', 1.4),
          chest: O('M46 66H54V72H46Z', '#9aa4b8', 2) + C(40, 70, 2.2, '#9aa4b8') + C(60, 70, 2.2, '#9aa4b8'),
          prop: `<g data-lv-float="">${O('M82 64L86 56L90 64L86 62Z', '#ffd23f', 2)}</g>`,
        }
    }
  },
})
