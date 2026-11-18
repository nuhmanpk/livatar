import { cast, C, E, O, P, S, star, type Look } from './_cast'

const KINDS = ['baby', 'toddler', 'grandma', 'grandpa', 'teen', 'punk', 'nerd', 'athlete'] as const
export type KidKind = (typeof KINDS)[number]
export interface KidOptions { kind?: KidKind | 'random' }

const hair = (c: string) => O('M28 38Q26 16 50 16Q74 16 72 38Q60 26 50 28Q40 26 28 38Z', c, 3.5)

export const kid = cast<KidKind>({
  name: 'kid',
  kinds: KINDS,
  colors: ['#ffe6dc', '#fff1c9', '#e6efff', '#e1f7ef', '#efe2ff', '#cfeff0'],
  look(kind, r): Look {
    const brown = r.pick(['#5a3a1c', '#2e2118', '#8a5a2b', '#c9822a'])
    const tee = r.pick<[string, string]>([['#3d7be0', '#2a5cb8'], ['#e8504a', '#a62a26'], ['#3f9a5a', '#2a6e3e'], ['#b03a8a', '#7d2262']])
    switch (kind) {
      case 'baby':
        return {
          suit: ['#ffe9f2', '#f0c4d8'], glove: '#ffe1cc',
          front: O('M44 16Q44 6 52 10Q54 16 50 18Z', '#8a5a2b', 2.5) + O('M44 54H56V60Q50 64 44 60Z', '#8fd8ff', 2.5),
          chest: O('M40 64H60V74H40Z', '#fff', 2.5) + C(50, 69, 2.4, '#ff8fcf'),
          prop: O('M80 62H90V80H80Z', '#fff', 2.5) + O('M78 60H92V64H78Z', '#ff8fcf', 2.5),
        }
      case 'toddler':
        return {
          suit: ['#ffd23f', '#e0a100'],
          back: hair(brown),
          front: O('M40 18Q50 8 60 18Q50 14 40 18Z', brown, 2.5) + C(50, 11, 4, '#ff8fcf', ` stroke="#2a2440" stroke-width="2"`),
          chest: star(50, 70, 4, '#fff'),
          prop: S('M80 80L84 56', '#8a5a2b', 2.6) + C(85, 52, 7, '#ff5c8a', ` stroke="#2a2440" stroke-width="2.5"`),
        }
      case 'grandma':
        return {
          suit: ['#b46fcf', '#7d4a9a'], robe: true,
          back: O('M26 40Q20 56 32 62Q34 48 38 40Z', '#e8e8f0', 3) + O('M74 40Q80 56 68 62Q66 48 62 40Z', '#e8e8f0', 3),
          front: O('M28 34Q24 12 50 12Q76 12 72 34Q60 22 50 24Q40 22 28 34Z', '#e8e8f0', 4) + C(50, 10, 6, '#e8e8f0', ` stroke="#2a2440" stroke-width="3"`) +
            C(40, 40, 6, 'rgba(200,235,255,.3)', ` stroke="#2a2440" stroke-width="2"`) + C(60, 40, 6, 'rgba(200,235,255,.3)', ` stroke="#2a2440" stroke-width="2"`) + S('M46 40H54', '#2a2440', 2),
          chest: O('M42 62Q50 70 58 62', '#e8d0f0', 2) + C(50, 68, 2.4, '#ffd23f'),
          prop: O('M78 74H92V86H78Z', '#e8a0b0', 3) + S('M80 74Q85 66 90 74', '#2a2440', 2),
        }
      case 'grandpa':
        return {
          suit: ['#6a8a6a', '#46604a'],
          back: O('M26 40Q22 50 30 54Q32 46 36 40Z', '#e8e8f0', 3) + O('M74 40Q78 50 70 54Q68 46 64 40Z', '#e8e8f0', 3),
          front: O('M32 24Q50 14 68 24Q50 20 32 24Z', '#e8e8f0', 3) + O('M30 48Q50 80 70 48Q62 62 50 62Q38 62 30 48Z', '#e8e8f0', 3.5) +
            S('M32 40H46M54 40H68', '#2a2440', 2.4) + C(40, 40, 6, 'rgba(200,235,255,.3)', ` stroke="#2a2440" stroke-width="2"`) + C(60, 40, 6, 'rgba(200,235,255,.3)', ` stroke="#2a2440" stroke-width="2"`),
          chest: O('M40 62L50 72L60 62', '#cfd6e4', 2) + S('M50 72V82', '#46604a', 2),
          prop: S('M82 96V66Q82 58 90 60', '#8a5a2b', 3.4),
        }
      case 'teen':
        return {
          suit: tee,
          back: hair(brown),
          front: O('M26 34Q24 10 50 10Q76 10 74 34Q60 18 44 22Q34 26 26 34Z', brown, 3.5) + O('M22 38Q22 20 32 18L34 38Z', '#2a2440', 3) + O('M78 38Q78 20 68 18L66 38Z', '#2a2440', 3) + S('M24 36Q50 8 76 36', '#3a3a4a', 2.5),
          chest: S('M42 70H58', '#fff', 2.4) + S('M40 76H60', '#fff', 2.4),
          prop: O('M78 66H92V86H78Z', '#3a3a4a', 3) + C(85, 76, 3, '#3ec1ff'),
        }
      case 'punk':
        return {
          suit: ['#2a2a3e', '#15151f'], glove: '#ffe1cc',
          back: O('M30 30L28 10L38 22L42 4L50 20L58 4L62 22L72 10L70 30Z', r.pick(['#ff4fa3', '#3ec1ff', '#7bdc6a']), 3.5),
          front: S('M34 58L38 62M62 58L66 62', '#9aa4b8', 2.2) + C(56, 46, 1.6, '#9aa4b8') + S('M30 22Q50 14 70 22', '#2a2440', 1),
          chest: S('M40 64L60 80M60 64L40 80', '#9aa4b8', 1.6) + C(50, 72, 3, '#e8344e', ` stroke="#2a2440" stroke-width="1.6"`),
          prop: O('M78 74L92 66L94 72L80 82Z', '#c43d4e', 3),
        }
      case 'nerd':
        return {
          suit: ['#f4f4f4', '#cfd6e4'],
          back: hair(brown),
          front: O('M30 26Q34 14 50 16Q66 14 70 26Q50 20 30 26Z', brown, 3) + C(40, 41, 7.5, 'rgba(190,235,255,.3)', ` stroke="#2a2440" stroke-width="2.6"`) + C(60, 41, 7.5, 'rgba(190,235,255,.3)', ` stroke="#2a2440" stroke-width="2.6"`) + S('M47.5 40H52.5', '#2a2440', 2.4) + S('M32 40H28M68 40H72', '#2a2440', 2.4),
          chest: O('M42 62L50 70L58 62', '#cfd6e4', 2) + O('M47 66H53L52 80H48Z', '#e8344e', 2),
          prop: O('M78 66H92V84H78Z', '#3d7be0', 3) + S('M82 72H88M82 77H88', '#fff', 1.4),
        }
      case 'athlete':
        return {
          suit: ['#e8504a', '#a62a26'],
          back: hair(brown),
          front: O('M28 30Q34 22 50 24Q66 22 72 30L72 34Q50 28 28 34Z', '#ffffff', 3) + O('M24 30Q50 22 76 30L74 34Q50 28 26 34Z', '#ffffff', 2),
          chest: C(50, 70, 6, '#fff', ` stroke="#2a2440" stroke-width="2"`) + S('M50 66V74M47 70H53', '#e8504a', 2),
          prop: C(86, 74, 7, '#ffa43a', ` stroke="#2a2440" stroke-width="2.6"`) + S('M79 74H93M86 67V81', '#2a2440', 1.4),
        }
    }
  },
})
