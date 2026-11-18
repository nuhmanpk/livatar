import { cast, C, E, O, P, S, star, type Look } from './_cast'

const KINDS = ['chef', 'doctor', 'farmer', 'firefighter', 'pilot', 'scientist', 'artist', 'detective'] as const
export type JobKind = (typeof KINDS)[number]
export interface JobOptions { kind?: JobKind | 'random' }

const hair = (c: string) => O('M28 38Q26 16 50 16Q74 16 72 38Q60 26 50 28Q40 26 28 38Z', c, 3.5)

export const job = cast<JobKind>({
  name: 'job',
  kinds: KINDS,
  colors: ['#fff1c9', '#e6efff', '#e1f7ef', '#ffe6dc', '#efe2ff', '#cfeff0'],
  look(kind, r): Look {
    const brown = r.pick(['#5a3a1c', '#2e2118', '#8a5a2b', '#c9822a'])
    switch (kind) {
      case 'chef':
        return {
          suit: ['#fafafa', '#d4d8e0'],
          back: hair(brown),
          front: O('M32 24Q22 20 26 10Q30 2 40 8Q50 -2 60 8Q70 2 74 10Q78 20 68 24Z', '#fff', 3.5) + O('M32 22H68V28H32Z', '#fff', 3),
          chest: S('M42 62V80M58 62V80', '#d4d8e0', 1.6) + C(50, 68, 1.4, '#e8344e') + C(50, 74, 1.4, '#e8344e'),
          prop: S('M80 78L88 56', '#8a5a2b', 3) + O('M80 56Q90 46 96 54Q90 62 82 60Z', '#cfd6e4', 2.5),
        }
      case 'doctor':
        return {
          suit: ['#ffffff', '#cfe0f0'],
          back: hair(brown),
          front: O('M28 28Q50 14 72 28L70 24Q50 12 30 24Z', '#fff', 3) + O('M42 18H58V24H42Z', '#e8f0f8', 2) + S('M50 17V25M46 21H54', '#e8344e', 2),
          chest: O('M42 64L50 74L58 64', '#cfe0f0', 2) + S('M38 66Q36 80 46 78', '#3d7be0', 2) + C(46, 79, 2.4, '#9aa4b8'),
          prop: O('M78 70H90V82H78Z', '#fff', 2.5) + S('M84 72V80M80 76H88', '#e8344e', 2),
        }
      case 'farmer':
        return {
          suit: ['#3d7be0', '#2a5cb8'],
          back: hair('#c9822a'),
          front: O('M20 26Q50 14 80 26Q76 34 50 31Q24 34 20 26Z', '#e8c860', 4) + O('M32 26Q34 6 50 8Q66 6 68 26Z', '#e8c860', 4) + S('M33 22H67', '#c0541f', 2.5),
          chest: O('M40 62H60V82H40Z', '#3d7be0', 3) + C(44, 66, 1.6, '#ffd23f') + C(56, 66, 1.6, '#ffd23f') + O('M44 72H56V78H44Z', '#2a5cb8', 2),
          prop: S('M82 92V46', '#8a5a2b', 3) + S('M82 46L76 40M82 46L88 40M82 54L76 48M82 54L88 48', '#e8c860', 2.4),
        }
      case 'firefighter':
        return {
          suit: ['#d94a2a', '#a22c12'],
          back: hair(brown),
          front: O('M26 32Q26 8 50 8Q74 8 74 32Q50 26 26 32Z', '#e8344e', 4) + O('M22 32Q50 38 78 32Q74 28 50 28Q26 28 22 32Z', '#e8344e', 3.5) + O('M42 12H58V22H42Z', '#ffd23f', 2.5),
          chest: S('M38 74H62M38 79H62', '#ffd23f', 2.4),
          prop: S('M80 80Q92 70 90 56', '#2a2440', 4) + O('M86 50H96V58H86Z', '#ffd23f', 2.5),
        }
      case 'pilot':
        return {
          suit: ['#3a4a6a', '#27324c'],
          back: hair(brown),
          front: O('M27 34Q27 12 50 12Q73 12 73 34Q50 26 27 34Z', '#8a5a2b', 4) + O('M33 30H45V40H33Z', 'rgba(255,200,80,.5)', 2.5) + O('M55 30H67V40H55Z', 'rgba(255,200,80,.5)', 2.5) + S('M45 35H55', '#2a2440', 2) + S('M33 35H29M67 35H71', '#2a2440', 2),
          chest: O('M40 66H48L46 72H42Z', '#ffd23f', 2) + O('M52 66H60L58 72H54Z', '#ffd23f', 2) + S('M50 62V80', '#ffd23f', 1.4),
          prop: O('M76 66L96 70L76 76Z', '#cfd6e4', 2.5),
        }
      case 'scientist':
        return {
          suit: ['#ffffff', '#d4d8e0'],
          back: hair(r.pick(['#8a8a99', '#2e2118', '#5a3a1c'])),
          front: O('M31 36H69V44H31Z', 'rgba(190,235,255,.35)', 3) + S('M31 40H27M69 40H73', '#2a2440', 2.5) + S('M50 40V42', '#2a2440', 2),
          chest: O('M42 64L50 76L58 64', '#d4d8e0', 2) + O('M43 70H49V76H43Z', '#3ec1ff', 1.6),
          prop: O('M80 66H88L87 74Q84 80 81 74Z', '#9fe8b0', 2.5) + C(84, 60, 2, '#9fe8b0') + C(88, 56, 1.4, '#9fe8b0'),
        }
      case 'artist':
        return {
          suit: ['#b03a8a', '#7d2262'],
          back: hair(brown),
          front: O('M28 30Q24 12 50 12Q76 12 72 30Q64 24 50 24Q36 24 28 30Z', '#e8344e', 4) + O('M30 24Q40 4 66 8Q74 12 70 24Q50 14 30 24Z', '#e8344e', 3.5) + C(36, 18, 0.1, '#fff'),
          chest: C(42, 70, 2.6, '#ffd23f') + C(52, 74, 2.6, '#3ec1ff') + C(58, 68, 2.2, '#7bdc6a'),
          prop: O('M76 84L88 46L91 47L80 86Z', '#8a5a2b', 2.5) + O('M87 40L92 40L91 48L88 48Z', '#e8344e', 2.5) + O('M72 56Q80 48 88 56Q90 68 78 70Q70 66 72 56Z', '#e8c24a', 2.5),
        }
      case 'detective':
        return {
          suit: ['#a3784f', '#7a5632'],
          back: hair(brown),
          front: O('M26 28Q28 8 50 8Q72 8 74 28Q50 22 26 28Z', '#8a7238', 4) + O('M22 28Q50 20 78 28Q74 32 50 31Q26 32 22 28Z', '#8a7238', 3.5) + S('M32 24L42 12M44 24L58 10M56 24L68 14', '#5a3a1c', 1.4, ' opacity=".6"'),
          chest: O('M40 62L50 72L60 62', '#6a4a2a', 2.5) + S('M50 72V82', '#6a4a2a', 2),
          prop: C(86, 66, 7, 'rgba(200,235,255,.5)', ` stroke="#2a2440" stroke-width="3"`) + S('M81 71L74 80', '#5a3a1c', 3.4) + E(84, 64, 2, 1.2, '#fff', -35),
        }
    }
  },
})
