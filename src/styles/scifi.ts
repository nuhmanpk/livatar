import { cast, C, E, O, P, S, star, type Look } from './_cast'

const KINDS = ['cyborg', 'android', 'marine', 'captain', 'pilot', 'rogue'] as const
export type ScifiKind = (typeof KINDS)[number]
export interface ScifiOptions { kind?: ScifiKind | 'random' }

export const scifi = cast<ScifiKind>({
  name: 'scifi',
  kinds: KINDS,
  colors: ['#e3e1f0', '#cfeff0', '#e6efff', '#efe2ff', '#e1f7ef', '#f0ebe5'],
  look(kind, r): Look {
    const glow = r.pick(['#3ec1ff', '#ff4fa3', '#7bdc6a', '#ffd23f'])
    switch (kind) {
      case 'cyborg':
        return {
          suit: ['#4a5470', '#2e3650'], glove: '#9aa4b8', eye: glow,
          back: O('M28 38Q26 16 50 16Q74 16 72 38Q60 26 50 28Q40 26 28 38Z', '#2a2a3e', 3.5),
          front: O('M50 22Q72 20 72 40Q72 50 62 54L50 54Z', '#9aa4b8', 3) + C(60, 40, 5, glow, ` stroke="#2a2440" stroke-width="2"`) + S('M52 28L68 30M52 46L66 48', '#6f7a8f', 1.4),
          chest: O('M42 64H58V76H42Z', '#2e3650', 2.5) + C(50, 70, 3, glow),
          prop: O('M76 68H92V80H76Z', '#9aa4b8', 3) + S('M80 74H88', glow, 2),
        }
      case 'android':
        return {
          skin: ['#f4f6fa', '#cfd6e4'], suit: ['#f4f6fa', '#cfd6e4'], glove: '#f4f6fa', noBlush: true, eye: glow,
          back: O('M26 40Q26 16 50 16Q74 16 74 40Q50 32 26 40Z', '#cfd6e4', 4),
          front: S('M50 18V30M30 44H34M66 44H70', '#9aa4b8', 1.6) + S('M44 22L56 22', glow, 2),
          chest: O('M40 64H60V78H40Z', '#cfd6e4', 2.5) + S('M44 70H56', glow, 2) + C(50, 66, 1.4, glow),
        }
      case 'marine':
        return {
          suit: ['#4a6a4a', '#2e4a2e'], glove: '#2e4a2e',
          back: O('M24 52H34V70H24Z', '#2e4a2e', 3),
          front: O('M26 36Q26 10 50 10Q74 10 74 36Q50 28 26 36Z', '#4a6a4a', 4.5) + O('M32 34Q50 28 68 34V42Q50 36 32 42Z', 'rgba(255,200,80,.5)', 3) + C(34, 18, 2, '#2e4a2e'),
          chest: O('M38 62H62V78H38Z', '#2e4a2e', 3) + S('M42 68H58M42 73H58', '#7a9a7a', 1.6),
          prop: O('M76 70H94V76H76Z', '#2a2a3e', 3) + S('M78 73H92', glow, 1.4),
        }
      case 'captain':
        return {
          skin: ['#a8e8c0', '#6fc08a'], suit: ['#3d5ab0', '#27388a'], glove: '#a8e8c0', eye: '#2a2440',
          back: O('M24 56Q18 76 22 92Q50 84 78 92Q82 76 76 56Z', '#27388a', 4),
          front: O('M40 22L50 4L60 22Q50 16 40 22Z', '#a8e8c0', 3) + O('M30 24Q50 10 70 24L72 30Q50 20 28 30Z', '#ffd23f', 3.5) + star(50, 14, 3.4, '#ffffff'),
          chest: O('M40 62H60V70H40Z', '#ffd23f', 2.5) + star(50, 72, 4, '#ffd23f'),
          prop: S('M82 92V60', '#9aa4b8', 3) + C(82, 56, 4, glow),
        }
      case 'pilot':
        return {
          suit: ['#e8744a', '#b04a22'], glove: '#e8744a',
          back: O('M22 48H34V84H22Z', '#8a95a8', 3) + O('M66 48H78V84H66Z', '#8a95a8', 3),
          front: O('M26 36Q26 8 50 8Q74 8 74 36Q50 26 26 36Z', '#f4f4f4', 4.5) + O('M30 34Q50 26 70 34V44Q50 36 30 44Z', 'rgba(60,180,255,.45)', 3) + S('M40 14H60', '#e8744a', 3),
          chest: S('M40 66H60M40 72H60', '#ffd23f', 2) + C(50, 78, 3, '#3ec1ff'),
          prop: O('M76 64L88 64L88 78L76 78Z', '#8a95a8', 3) + C(82, 71, 3, glow),
        }
      case 'rogue':
        return {
          skin: ['#6a6a9a', '#46466f'], suit: ['#17122a', '#0c0a18'], glove: '#46466f', eye: '#ff3a5a', noBlush: true,
          back: O('M24 52Q20 70 26 84L74 84Q80 70 76 52Z', '#0c0a18', 4),
          front: O('M26 38Q26 8 50 8Q74 8 74 38Q50 30 26 38Z', '#17122a', 4.5) + S('M32 24H44M56 24H68', '#ff3a5a', 2) + S('M34 52H66M40 56H60', '#ff3a5a', 1.4, ' opacity=".6"'),
          chest: S('M40 64L50 78L60 64', '#ff3a5a', 2) + C(50, 70, 2, '#ff3a5a'),
          prop: S('M80 70L90 56', '#ff3a5a', 3) + C(92, 54, 3, '#ff3a5a'),
        }
    }
  },
})
