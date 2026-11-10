// Creative alternates for the components page. Each entry is a list of { name, note, Demo }.
// The page shows tabs in the detail view and the first one on the tile. Pure React + livatar, no extra deps.
export default function makeVariants({ h, useState, useEffect, useRef, Livatar, C, S }) {
  const { buddy, bot, human, animal, memoji, ghost, planet, clay, monster, emoji, ui, alien, food, vehicle, office } = S
  const F = (variant, seed, size = 40, extra = {}) => h(Livatar, { variant, seed, size, ...extra })
  const tick = (fn, ms) => useEffect(() => { fn(); const id = setInterval(fn, ms); return () => clearInterval(id) }, [])
  const row = (extra) => ({ display: 'flex', alignItems: 'center', ...extra })
  const col = (extra) => ({ display: 'flex', flexDirection: 'column', ...extra })
  const card = (extra) => ({ background: 'var(--card,#fff)', border: '1px solid var(--line,#ece6dc)', borderRadius: 18, color: 'var(--fg,#1f1a2e)', ...extra })
  const muted = { color: 'var(--muted,#6b6480)', fontSize: 13 }
  const brand = '#7f5af0'

  /* one shared looping 0..100 value */
  const useLoop = (step = 6, ms = 500) => {
    const [v, setV] = useState(0)
    tick(() => setV((x) => (x >= 100 ? 0 : Math.min(100, x + step * (0.6 + Math.random())))), ms)
    return v
  }
  const css = `
  @keyframes vz-float{50%{transform:translateY(-8px)}}
  @keyframes vz-bob{50%{transform:translateY(-5px) rotate(3deg)}}
  @keyframes vz-pop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
  @keyframes vz-rise{from{transform:translateY(0) scale(.6);opacity:1}to{transform:translateY(-70px) scale(1.2);opacity:0}}
  @keyframes vz-zzz{0%{transform:translate(0,0) scale(.6);opacity:0}30%{opacity:1}100%{transform:translate(14px,-26px) scale(1.1);opacity:0}}
  @keyframes vz-peek{0%,100%{transform:translateY(60%)}20%,80%{transform:translateY(8%)}}
  @keyframes vz-ring{0%{transform:scale(.8);opacity:.7}100%{transform:scale(1.9);opacity:0}}
  @keyframes vz-shake{0%,100%{transform:rotate(0)}20%{transform:rotate(-14deg)}40%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(6deg)}}
  @keyframes vz-chomp{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.82) scaleX(1.06)}}
  @keyframes vz-jump{0%,100%{transform:translateY(0)}40%{transform:translateY(-18px)}}
  .vz-btn{font:inherit;font-size:13px;padding:6px 12px;border-radius:10px;border:1px solid var(--line,#ece6dc);background:var(--card,#fff);color:inherit;cursor:pointer}
  .vz-btn:hover{border-color:${brand}}
  @media (prefers-reduced-motion:reduce){.vz *{animation:none!important}}`
  const Wrap = ({ children, style }) => h('div', { className: 'vz', style: { ...col({ alignItems: 'center', gap: 12 }), ...style } }, h('style', null, css), children)

  /* ================= PROGRESS ================= */
  const Race = () => {
    const a = useLoop(9, 450), b = useLoop(7, 520), c = useLoop(5, 480)
    const lane = (v, f, c0) => h('div', { style: { position: 'relative', height: 38, width: 360, borderBottom: '2px dashed var(--line,#ece6dc)' } },
      h('div', { style: { position: 'absolute', left: `calc(${Math.min(v, 100)}% * .88)`, bottom: 2, transition: 'left .45s linear' } }, f),
      h('span', { style: { position: 'absolute', right: 0, bottom: 4, fontSize: 18 } }, '🏁'))
    return h(Wrap, null, lane(a, F(vehicle, 'r1', 34, { options: { kind: 'car' }, mood: 'happy' })), lane(b, F(animal, 'r2', 34, { options: { species: 'fox' }, mood: 'happy' })), lane(c, F(food, 'r3', 34, { options: { kind: 'donut' }, mood: 'happy' })))
  }
  const FaceRing = () => {
    const v = useLoop(8, 450); const R = 52, C2 = 2 * Math.PI * R
    const mood = v > 92 ? 'love' : v > 60 ? 'happy' : v > 25 ? 'neutral' : 'sad'
    return h(Wrap, null,
      h('div', { style: { position: 'relative', width: 128, height: 128 } },
        h('svg', { width: 128, height: 128, style: { position: 'absolute', inset: 0, transform: 'rotate(-90deg)' } },
          h('circle', { cx: 64, cy: 64, r: R, fill: 'none', stroke: 'var(--line,#ece6dc)', strokeWidth: 8 }),
          h('circle', { cx: 64, cy: 64, r: R, fill: 'none', stroke: brand, strokeWidth: 8, strokeLinecap: 'round', strokeDasharray: C2, strokeDashoffset: C2 * (1 - v / 100), style: { transition: 'stroke-dashoffset .45s linear' } })),
        h('div', { style: { position: 'absolute', inset: 22 } }, F(buddy, 'ring', 84, { mood }))),
      h('b', null, Math.round(v) + '%'), h('span', { style: muted }, mood === 'sad' ? 'Just getting started…' : mood === 'love' ? 'Almost there!' : 'Working on it'))
  }
  const Battery = () => {
    const v = useLoop(8, 500); const n = 10, lit = Math.floor((v / 100) * n)
    return h(Wrap, null, h('div', { style: row({ gap: 6 }) }, Array.from({ length: n }, (_, i) => h('div', { key: i, style: { width: 28, height: 44, borderRadius: 8, background: i < lit ? 'var(--soft,#f3eee6)' : 'var(--line,#ece6dc)', display: 'grid', placeItems: 'center', opacity: i < lit ? 1 : .5, transition: 'all .3s' } }, i < lit && F(emoji, 'b' + i, 24, { mood: i === lit - 1 ? 'surprised' : 'happy' })))), h('span', { style: muted }, 'Every block that fills wakes a face up'))
  }
  const ToTheMoon = () => {
    const v = useLoop(6, 450)
    return h(Wrap, null, h('div', { style: { position: 'relative', width: 70, height: 230, background: 'linear-gradient(#0000,var(--soft,#f3eee6))', borderRadius: 16 } },
      h('div', { style: { position: 'absolute', top: -2, left: 8, animation: 'vz-float 3s ease-in-out infinite' } }, F(planet, 'moon', 54, { options: { kind: 'moon' } })),
      h('div', { style: { position: 'absolute', left: 14, bottom: `calc(${v}% * .68)`, transition: 'bottom .45s linear', transform: 'rotate(0)' } }, F(vehicle, 'rk', 42, { options: { kind: 'rocket' }, mood: v > 90 ? 'love' : 'happy' }))), h('span', { style: muted }, Math.round(v) + '% to the moon'))
  }

  /* ================= STEPPER ================= */
  const STEPS = ['Account', 'Profile', 'Invite', 'Launch']
  const useStep = () => { const [i, setI] = useState(0); tick(() => setI((x) => (x >= STEPS.length ? 0 : x + 1)), 1500); return i }
  const FaceTrail = () => {
    const i = useStep()
    return h(Wrap, null, h('div', { style: row({ gap: 0 }) }, STEPS.map((s, k) => h('div', { key: s, style: row({}) },
      k > 0 && h('div', { style: { width: 34, height: 4, borderRadius: 4, background: k <= i ? brand : 'var(--line,#ece6dc)', transition: 'background .4s' } }),
      h('div', { style: col({ alignItems: 'center', gap: 4 }) }, F(buddy, 'st' + k, 46, { mood: k < i ? 'happy' : k === i ? 'surprised' : 'sleepy', style: { opacity: k <= i ? 1 : .45, transition: 'opacity .4s' } }), h('small', { style: muted }, s))))))
  }
  const Climb = () => {
    const i = useStep()
    return h(Wrap, null, h('div', { style: { position: 'relative', width: 320, height: 150 } },
      STEPS.map((s, k) => h('div', { key: s, style: { position: 'absolute', left: k * 76, bottom: 0, width: 76, height: 34 + k * 30, borderRadius: '10px 10px 0 0', background: k <= i ? 'var(--soft,#f3eee6)' : 'transparent', border: '1px solid var(--line,#ece6dc)', transition: 'background .4s', ...col({ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 6 }) } }, h('small', { style: muted }, s))),
      h('div', { style: { position: 'absolute', left: Math.min(i, 3) * 76 + 16, bottom: 34 + Math.min(i, 3) * 30, transition: 'all .6s cubic-bezier(.3,1.4,.5,1)', animation: 'vz-jump 1.5s infinite' } }, F(animal, 'climb', 44, { options: { species: 'fox' }, mood: i >= STEPS.length ? 'love' : 'happy' }))))
  }
  const Timeline = () => {
    const i = useStep()
    return h(Wrap, null, h('div', { style: col({ gap: 0, width: 280 }) }, STEPS.map((s, k) => h('div', { key: s, style: row({ gap: 12, alignItems: 'stretch' }) },
      h('div', { style: col({ alignItems: 'center' }) }, h('div', { style: { width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', background: k < i ? brand : 'var(--card,#fff)', color: '#fff', border: `2px solid ${k <= i ? brand : 'var(--line,#ece6dc)'}`, fontSize: 14, transition: 'all .3s' } }, k < i ? '✓' : ''), k < 3 && h('div', { style: { width: 2, flex: 1, minHeight: 22, background: k < i ? brand : 'var(--line,#ece6dc)' } })),
      h('div', { style: { ...row({ gap: 10 }), paddingBottom: 14, flex: 1 } }, h('b', { style: { fontSize: 14, opacity: k <= i ? 1 : .5 } }, s), k === i && i < 4 && h('span', { style: { animation: 'vz-pop .4s both', marginLeft: 'auto' } }, F(bot, 'tl', 32, { mood: 'happy' })))))))
  }

  /* ================= COUNTDOWN ================= */
  const useLeft = (sec = 12) => { const [t, setT] = useState(sec); tick(() => setT((x) => (x <= 0 ? sec : x - 1)), 1000); return t }
  const Flip = () => {
    const t = useLeft(); const d = String(t).padStart(2, '0').split('')
    return h(Wrap, null, h('div', { style: row({ gap: 14 }) }, F(ghost, 'fl', 56, { mood: t < 4 ? 'surprised' : 'happy' }), h('div', { style: row({ gap: 6 }) }, d.map((c, i) => h('div', { key: i + c, style: { ...card({ width: 44, height: 64, borderRadius: 10 }), display: 'grid', placeItems: 'center', font: '800 34px system-ui', animation: 'vz-pop .35s both', boxShadow: '0 4px 0 var(--line,#ece6dc)' } }, c))), h('span', { style: muted }, 'sec')))
  }
  const DialRing = () => {
    const t = useLeft(12); const R = 50, C2 = 2 * Math.PI * R
    const mood = t < 3 ? 'surprised' : t < 7 ? 'neutral' : 'sleepy'
    return h(Wrap, null, h('div', { style: { position: 'relative', width: 120, height: 120 } }, h('svg', { width: 120, height: 120, style: { transform: 'rotate(-90deg)' } }, h('circle', { cx: 60, cy: 60, r: R, fill: 'none', stroke: 'var(--line,#ece6dc)', strokeWidth: 7 }), h('circle', { cx: 60, cy: 60, r: R, fill: 'none', stroke: t < 4 ? '#ef476f' : brand, strokeWidth: 7, strokeLinecap: 'round', strokeDasharray: C2, strokeDashoffset: C2 * (1 - t / 12), style: { transition: 'stroke-dashoffset 1s linear' } })), h('div', { style: { position: 'absolute', inset: 20 } }, F(clay, 'dial', 80, { mood }))), h('b', { style: { fontSize: 20 } }, t + 's'), h('span', { style: muted }, 'The face wakes up as time runs out'))
  }
  const Fuse = () => {
    const t = useLeft(10)
    return h(Wrap, null, h('div', { style: row({ gap: 0, width: 330 }) }, h('div', { style: { flex: 1, height: 6, borderRadius: 6, background: 'var(--line,#ece6dc)', position: 'relative' } }, h('div', { style: { position: 'absolute', right: 0, top: 0, bottom: 0, width: `${(t / 10) * 100}%`, background: '#ef476f', borderRadius: 6, transition: 'width 1s linear' } }), h('span', { style: { position: 'absolute', left: `calc(${100 - (t / 10) * 100}% - 8px)`, top: -9, fontSize: 20, transition: 'left 1s linear' } }, '✨')), h('div', { style: { animation: t < 3 ? 'vz-shake .4s infinite' : 'none' } }, F(monster, 'bomb', 54, { mood: t < 3 ? 'angry' : 'neutral' }))), h('span', { style: muted }, t > 0 ? t + 's until it goes off' : 'Boom!'))
  }

  /* ================= LOADER ================= */
  const Trio = () => h(Wrap, null, h('div', { style: row({ gap: 8 }) }, [buddy, animal, bot, ghost].map((v, i) => h('div', { key: i, style: { animation: `vz-jump .9s ease-in-out ${i * 0.12}s infinite` } }, F(v, 'tr' + i, 40, { mood: 'happy' })))), h('span', { style: muted }, 'Loading…'))
  const Fill = () => {
    const v = useLoop(10, 400)
    return h(Wrap, null, h('div', { style: { position: 'relative', width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--line,#ece6dc)' } }, h('div', { style: { position: 'absolute', left: 0, right: 0, bottom: 0, height: v + '%', background: brand, opacity: .22, transition: 'height .4s linear' } }), h('div', { style: { position: 'absolute', inset: 8 } }, F(ghost, 'fill', 80, { mood: v > 90 ? 'love' : 'neutral' }))), h('span', { style: muted }, Math.round(v) + '% loaded'))
  }
  const Orbit = () => h(Wrap, null, h('div', { style: { position: 'relative', width: 130, height: 130 } }, h('div', { style: { position: 'absolute', inset: 33 } }, F(planet, 'ob', 64)), [0, 1, 2].map((i) => h('div', { key: i, style: { position: 'absolute', inset: 0, animation: `spinv ${2 + i}s linear infinite` } }, h('div', { style: { position: 'absolute', top: 0, left: 50 } }, F([alien, bot, animal][i], 'o' + i, 28))))), h('style', null, '@keyframes spinv{to{transform:rotate(360deg)}}'), h('span', { style: muted }, 'Hang tight'))
  const Skeleton = () => h(Wrap, null, h('div', { style: { ...card({ padding: 14, width: 300 }), ...row({ gap: 12 }) } }, h('div', { style: { animation: 'vz-bob 1.6s infinite' } }, F(emoji, 'sk', 52, { mood: 'surprised' })), h('div', { style: { flex: 1, ...col({ gap: 8 }) } }, [90, 60].map((w, i) => h('div', { key: i, style: { height: 10, width: w + '%', borderRadius: 6, background: 'linear-gradient(90deg,var(--soft,#f3eee6),var(--line,#ece6dc),var(--soft,#f3eee6))', backgroundSize: '200% 100%', animation: 'vz-sh 1.2s linear infinite' } })))), h('style', null, '@keyframes vz-sh{to{background-position:-200% 0}}'))

  /* ================= EMPTY STATE ================= */
  const PeekGhost = () => h(Wrap, null, h('div', { style: { position: 'relative', height: 120, width: 120, overflow: 'hidden' } }, h('div', { style: { position: 'absolute', left: 20, bottom: 0, animation: 'vz-peek 4s ease-in-out infinite' } }, F(ghost, 'pk', 80))), h('b', null, 'Nothing here yet'), h('span', { style: muted }, 'Boo! Add your first item.'), h('button', { className: 'vz-btn' }, 'Add item'))
  const Astronaut = () => h(Wrap, null, h('div', { style: { animation: 'vz-float 4s ease-in-out infinite' } }, F(alien, 'as', 96, { mood: 'sad' })), h('b', null, 'Lost in space'), h('span', { style: muted }, 'No results. Try another search.'), h('button', { className: 'vz-btn' }, 'Clear filters'))
  const Sleepy = () => { const [awake, setA] = useState(false); return h(Wrap, null, h('div', { style: { position: 'relative' } }, F(animal, 'zz', 96, { options: { species: 'cat' }, mood: awake ? 'happy' : 'sleepy' }), !awake && ['z', 'Z', 'z'].map((z, i) => h('span', { key: i, style: { position: 'absolute', right: 0, top: 4, font: '700 18px system-ui', color: brand, animation: `vz-zzz 2.4s ${i * 0.8}s infinite` } }, z))), h('b', null, awake ? 'Good morning!' : 'Shh, inbox is empty'), h('button', { className: 'vz-btn', onClick: () => setA(!awake) }, awake ? 'Let it sleep' : 'Wake it up')) }

  /* ================= UPLOAD ================= */
  const Monster = () => {
    const [st, setSt] = useState('idle')
    const feed = () => { if (st !== 'idle') return; setSt('eat'); setTimeout(() => setSt('burp'), 1100); setTimeout(() => setSt('idle'), 2400) }
    return h(Wrap, null, h('button', { onClick: feed, 'aria-label': 'Feed the monster a file', style: { all: 'unset', cursor: 'pointer', position: 'relative', textAlign: 'center' } }, h('div', { style: { animation: st === 'eat' ? 'vz-chomp .3s infinite' : 'none' } }, F(monster, 'eat', 110, { mood: st === 'eat' ? 'surprised' : st === 'burp' ? 'love' : 'silly' })), st === 'idle' && h('span', { style: { position: 'absolute', top: -14, left: '50%', marginLeft: -18, animation: 'vz-jump 1.2s infinite', fontSize: 26 } }, '📄')), h('b', null, { idle: 'Feed me a file', eat: 'Nom nom nom…', burp: '*burp* Uploaded!' }[st]))
  }
  const CloudRing = () => {
    const [p, setP] = useState(null)
    useEffect(() => { if (p === null || p >= 100) return; const id = setTimeout(() => setP(Math.min(100, p + 12 + Math.random() * 10)), 260); return () => clearTimeout(id) }, [p])
    const R = 46, C2 = 2 * Math.PI * R
    return h(Wrap, null, h('button', { onClick: () => setP(0), 'aria-label': 'Upload', style: { all: 'unset', cursor: 'pointer', position: 'relative', width: 112, height: 112 } }, h('svg', { width: 112, height: 112, style: { position: 'absolute', inset: 0, transform: 'rotate(-90deg)' } }, h('circle', { cx: 56, cy: 56, r: R, fill: 'none', stroke: 'var(--line,#ece6dc)', strokeWidth: 6 }), h('circle', { cx: 56, cy: 56, r: R, fill: 'none', stroke: brand, strokeWidth: 6, strokeLinecap: 'round', strokeDasharray: C2, strokeDashoffset: C2 * (1 - (p || 0) / 100) })), h('div', { style: { position: 'absolute', inset: 14 } }, F(tech2(S), 'cl', 84, { options: { kind: 'cloud' }, mood: p === null ? 'neutral' : p >= 100 ? 'love' : 'surprised' }))), h('span', { style: muted }, p === null ? 'Tap the cloud to upload' : p >= 100 ? 'Done!' : Math.round(p) + '%'), p >= 100 && h('button', { className: 'vz-btn', onClick: () => setP(null) }, 'Again'))
  }
  const Mailbox = () => {
    const [n, setN] = useState(0)
    return h(Wrap, null, h('div', { style: row({ gap: 14 }) }, h('div', { style: { animation: n ? 'vz-shake .6s' : 'none' }, key: n }, F(S.home, 'mb', 90, { options: { kind: 'door' }, mood: n ? 'happy' : 'neutral' })), h('div', { style: col({ gap: 6 }) }, h('b', null, n + ' file' + (n === 1 ? '' : 's') + ' delivered'), h('button', { className: 'vz-btn', onClick: () => setN(n + 1) }, 'Drop a file in'))))
  }
  function tech2(S2) { return S2.tech }

  /* ================= HELP LAUNCHER ================= */
  const Fan = () => {
    const [open, setOpen] = useState(false)
    const acts = [['📖', 'Docs'], ['💬', 'Chat'], ['🐞', 'Bug']]
    return h(Wrap, null, h('div', { style: { position: 'relative', width: 190, height: 150 } }, acts.map(([e, l], i) => h('button', { key: l, 'aria-label': l, className: 'vz-btn', style: { position: 'absolute', right: 8, bottom: 8, width: 52, height: 52, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 20, transform: open ? `translate(${-Math.cos((i * 40 + 10) * Math.PI / 180) * 78}px,${-Math.sin((i * 40 + 10) * Math.PI / 180) * 78}px)` : 'none', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: `all .35s cubic-bezier(.3,1.4,.5,1) ${i * 0.05}s` } }, e)), h('button', { onClick: () => setOpen(!open), 'aria-label': 'Help', style: { position: 'absolute', right: 0, bottom: 0, border: 0, background: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 } }, F(buddy, 'fan', 64, { mood: open ? 'happy' : 'neutral' }))))
  }
  const Nudge = () => {
    const [step, setStep] = useState(0)
    tick(() => setStep((s) => (s + 1) % 3), 2600)
    return h(Wrap, null, h('div', { style: row({ gap: 10, alignItems: 'flex-end' }) }, h('div', { style: { ...card({ padding: '10px 14px', borderRadius: '16px 16px 4px 16px', maxWidth: 190 }), fontSize: 13, animation: 'vz-pop .4s both' }, key: step }, step === 0 ? 'Stuck on something?' : step === 1 ? h('span', null, 'Typing', h('b', null, ' …')) : 'Try the quick-start guide 👉'), F(bot, 'nu', 60, { mood: step === 1 ? 'confused' : 'happy' })))
  }
  const Peeker = () => h(Wrap, null, h('div', { style: { position: 'relative', width: 280, height: 130, ...card({ overflow: 'hidden' }) } }, h('div', { style: { padding: 14, ...muted } }, 'Your app'), h('div', { style: { position: 'absolute', right: 20, bottom: 0, animation: 'vz-peek 3.2s ease-in-out infinite', cursor: 'pointer' } }, F(ghost, 'pe', 64)), h('div', { style: { position: 'absolute', right: 88, bottom: 40, ...card({ padding: '4px 10px', borderRadius: 12 }), fontSize: 12 } }, 'Psst… need help?')))

  /* ================= AVATAR STACK ================= */
  const USERS = ['ada', 'bob', 'cy', 'dee', 'eli']
  const FanStack = () => { const [hv, setH] = useState(false); return h(Wrap, null, h('div', { onPointerEnter: () => setH(true), onPointerLeave: () => setH(false), style: { position: 'relative', width: 220, height: 110 } }, USERS.map((u, i) => h('div', { key: u, style: { position: 'absolute', left: 90, bottom: 0, transformOrigin: '50% 100%', transform: `rotate(${(i - 2) * (hv ? 26 : 12)}deg) translateY(${hv ? -26 : -10}px)`, transition: 'transform .4s cubic-bezier(.3,1.4,.5,1)' } }, F(memoji, u, 46, { style: { borderRadius: '50%', boxShadow: '0 0 0 3px var(--card,#fff)' } })))), h('span', { style: muted }, 'Hover to fan out')) }
  const Huddle = () => h(Wrap, null, h('div', { style: { position: 'relative', width: 150, height: 150, borderRadius: '50%', background: 'var(--soft,#f3eee6)' } }, h('div', { style: { position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', ...muted } }, '5 here'), USERS.map((u, i) => { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; return h('div', { key: u, style: { position: 'absolute', left: 75 + Math.cos(a) * 58 - 21, top: 75 + Math.sin(a) * 58 - 21, animation: `vz-bob ${2 + i * 0.3}s ease-in-out infinite` } }, F(human, u, 42, { mood: 'happy' })) })))
  const Presence = () => { const [open, setOpen] = useState(false); const st = ['#38b36b', '#f5a524', '#ef476f', '#38b36b', '#9aa0a6']; return h(Wrap, null, h('div', { onPointerEnter: () => setOpen(true), onPointerLeave: () => setOpen(false), style: row({}) }, USERS.map((u, i) => h('div', { key: u, style: { marginLeft: i ? (open ? 8 : -14) : 0, transition: 'margin .3s', position: 'relative' } }, F(clay, u, 48), h('i', { style: { position: 'absolute', right: 0, bottom: 0, width: 13, height: 13, borderRadius: '50%', background: st[i], border: '2px solid var(--card,#fff)' } })))), h('span', { style: muted }, open ? '3 online · 1 away · 1 busy' : '5 teammates')) }

  /* ================= PROFILE CARD ================= */
  const Flip3 = () => { const [f, setF] = useState(false); return h(Wrap, null, h('button', { onClick: () => setF(!f), 'aria-label': 'Flip card', style: { all: 'unset', cursor: 'pointer', perspective: 800 } }, h('div', { style: { position: 'relative', width: 240, height: 150, transformStyle: 'preserve-3d', transition: 'transform .6s', transform: f ? 'rotateY(180deg)' : 'none' } }, h('div', { style: { ...card({ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', ...col({ alignItems: 'center', justifyContent: 'center', gap: 6 }) }) } }, F(memoji, 'nuhman', 68), h('b', null, 'Nuhman'), h('small', { style: muted }, 'Maintainer · tap to flip')), h('div', { style: { ...card({ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', ...col({ alignItems: 'center', justifyContent: 'center', gap: 8 }) }) } }, [['Stars', '2.4k'], ['Repos', '38'], ['Streak', '212d']].map(([k, v]) => h('div', { key: k, style: row({ gap: 18, justifyContent: 'space-between', width: 160 }) }, h('span', { style: muted }, k), h('b', null, v))))))) }
  const Trading = () => h(Wrap, null, h('div', { style: { width: 190, padding: 10, borderRadius: 16, background: 'linear-gradient(135deg,#ffd166,#ff8fab,#90e0ef,#c3b1ff)', boxShadow: '0 10px 30px rgba(127,90,240,.3)' } }, h('div', { style: { background: 'var(--card,#fff)', borderRadius: 10, padding: 10, ...col({ alignItems: 'center', gap: 6 }) } }, h('div', { style: row({ justifyContent: 'space-between', width: '100%', fontSize: 12 }) }, h('b', null, 'NUHMAN'), h('span', { style: muted }, 'HP 120')), h('div', { style: { background: 'var(--soft,#f3eee6)', borderRadius: 8, padding: 6 } }, F(animal, 'tc', 100, { options: { species: 'owl' }, mood: 'happy' })), h('small', { style: muted }, 'Ability: ships on Fridays'), h('small', { style: { fontWeight: 700 } }, '★★★★☆'))))
  const Cover = () => h(Wrap, null, h('div', { style: { ...card({ width: 280, overflow: 'hidden' }) } }, h('div', { style: { height: 64, background: 'linear-gradient(120deg,#c3b1ff,#90e0ef)' } }), h('div', { style: { padding: '0 16px 16px', marginTop: -32, ...col({ gap: 4 }) } }, h('div', { style: { width: 68, borderRadius: '50%', boxShadow: '0 0 0 4px var(--card,#fff)', lineHeight: 0 } }, F(memoji, 'cov', 68)), h('b', null, 'Nuhman'), h('small', { style: muted }, 'Maintainer · online'), h('div', { style: row({ gap: 6, marginTop: 6 }) }, h('button', { className: 'vz-btn' }, 'Follow'), h('button', { className: 'vz-btn' }, 'Message')))))

  /* ================= TESTIMONIAL ================= */
  const Bubble = () => h(Wrap, null, h('div', { style: row({ gap: 12, alignItems: 'flex-end', maxWidth: 360 }) }, F(clay, 'ada', 62, { mood: 'happy' }), h('div', { style: { ...card({ padding: '12px 16px', borderRadius: '18px 18px 18px 4px' }), fontSize: 14, lineHeight: 1.4 } }, '“Our signup page finally smiles back.”', h('div', { style: { ...muted, marginTop: 6 } }, '— Ada Park, Inkwell'))))
  const Rotator = () => {
    const Q = [['“It cost 9 KB.”', 'Cy', 'bot'], ['“Same face on server and browser.”', 'Bo', 'animal'], ['“Sold my team in a minute.”', 'Ada', 'buddy']]; const [i, setI] = useState(0); tick(() => setI((x) => (x + 1) % 3), 2600); const q = Q[i]; const v = { bot, animal, buddy }[q[2]]
    return h(Wrap, null, h('div', { key: i, style: { ...card({ padding: 16, width: 280, ...col({ alignItems: 'center', gap: 8, textAlign: 'center' }) }), animation: 'vz-pop .4s both' } }, F(v, q[1], 56, { mood: 'happy' }), h('div', { style: { fontSize: 15 } }, q[0]), h('small', { style: muted }, q[1])), h('div', { style: row({ gap: 6 }) }, Q.map((_, k) => h('i', { key: k, style: { width: 8, height: 8, borderRadius: '50%', background: k === i ? brand : 'var(--line,#ece6dc)' } }))))
  }
  const Polaroid = () => h(Wrap, null, h('div', { style: { background: '#fff', color: '#1f1a2e', padding: '12px 12px 18px', borderRadius: 6, boxShadow: '0 12px 30px rgba(0,0,0,.15)', transform: 'rotate(-3deg)', width: 190, textAlign: 'center' } }, h('div', { style: { background: 'var(--soft,#f3eee6)', borderRadius: 4, padding: 8 } }, F(human, 'pol', 130, { mood: 'happy' })), h('div', { style: { font: 'italic 15px Georgia', marginTop: 10 } }, '“Users love it.”'), h('small', { style: { color: '#6b6480' } }, 'Ada, Inkwell')))

  /* ================= BELL ================= */
  const Inbox = () => {
    const [open, setOpen] = useState(true)
    const items = [['ada', 'Ada liked your post'], ['bob', 'Bob sent a message'], ['cy', 'Cy joined the team']]
    return h(Wrap, null, h('div', { style: col({ alignItems: 'flex-start', gap: 8, width: 260 }) }, h('button', { onClick: () => setOpen(!open), style: { all: 'unset', cursor: 'pointer', position: 'relative', lineHeight: 0 }, 'aria-label': 'Notifications' }, F(ui, 'bell', 48, { options: { kind: 'bell', badge: true }, mood: open ? 'happy' : 'surprised' })), open && h('div', { style: { ...card({ padding: 6, width: '100%' }), animation: 'vz-pop .3s both' } }, items.map(([u, t]) => h('div', { key: u, style: { ...row({ gap: 10 }), padding: '6px 8px' } }, F(memoji, u, 30), h('span', { style: { fontSize: 13 } }, t))))))
  }
  const Pips = () => { const [n, setN] = useState(3); return h(Wrap, null, h('div', { style: { position: 'relative', animation: n ? 'vz-shake 2s infinite' : 'none' } }, F(emoji, 'pip', 72, { mood: n ? 'surprised' : 'happy' }), n > 0 && h('span', { style: { position: 'absolute', top: -4, right: -6, minWidth: 24, height: 24, borderRadius: 12, background: '#ef476f', color: '#fff', font: '700 13px/24px system-ui', textAlign: 'center', padding: '0 6px' } }, n)), h('button', { className: 'vz-btn', onClick: () => setN(0) }, 'Clear'), h('button', { className: 'vz-btn', onClick: () => setN(n + 1) }, 'New')) }
  const Ping = () => h(Wrap, null, h('div', { style: { position: 'relative', width: 90, height: 90, display: 'grid', placeItems: 'center' } }, [0, 1].map((i) => h('i', { key: i, style: { position: 'absolute', width: 60, height: 60, borderRadius: '50%', border: `2px solid ${brand}`, animation: `vz-ring 2s ${i}s infinite` } })), F(ui, 'ping', 56, { options: { kind: 'bell' }, mood: 'surprised' })), h('span', { style: muted }, 'New activity'))

  /* ================= REACTIONS ================= */
  const Picker = () => {
    const [burst, setBurst] = useState([]); const set = [['😍', 'love'], ['😂', 'happy'], ['😮', 'surprised'], ['😢', 'sad'], ['😡', 'angry']]; const [m, setM] = useState('neutral')
    const fire = ([e, mood]) => { setM(mood); const id = Date.now(); setBurst((b) => [...b, { id, e }]); setTimeout(() => setBurst((b) => b.filter((x) => x.id !== id)), 1000) }
    return h(Wrap, null, h('div', { style: { position: 'relative', height: 90 } }, F(emoji, 'rp', 76, { mood: m }), burst.map((b) => h('span', { key: b.id, style: { position: 'absolute', left: '50%', top: 0, marginLeft: -12, fontSize: 24, animation: 'vz-rise 1s ease-out both' } }, b.e))), h('div', { style: { ...card({ padding: 6, borderRadius: 99 }), ...row({ gap: 2 }) } }, set.map((s) => h('button', { key: s[0], onClick: () => fire(s), 'aria-label': s[1], style: { all: 'unset', cursor: 'pointer', fontSize: 24, padding: '2px 6px', borderRadius: 99 }, onPointerEnter: (e) => (e.currentTarget.style.transform = 'scale(1.35) translateY(-4px)'), onPointerLeave: (e) => (e.currentTarget.style.transform = 'none') }, s[0]))))
  }
  const Hearts = () => { const [b, setB] = useState([]); const go = () => { const id = Date.now(); setB((x) => [...x, id]); setTimeout(() => setB((x) => x.filter((y) => y !== id)), 1000) }; return h(Wrap, null, h('button', { onClick: go, 'aria-label': 'Send love', style: { all: 'unset', cursor: 'pointer', position: 'relative', lineHeight: 0 } }, F(animal, 'hr', 90, { options: { species: 'bunny' }, mood: b.length ? 'love' : 'happy' }), b.map((id) => [0, 1, 2].map((k) => h('span', { key: id + '-' + k, style: { position: 'absolute', left: 20 + k * 22, top: 10, fontSize: 20, animation: `vz-rise ${0.8 + k * 0.15}s ease-out both` } }, '❤️')))), h('span', { style: muted }, 'Tap the bunny')) }
  const Slider = () => { const [v, setV] = useState(60); const mood = v > 80 ? 'love' : v > 55 ? 'happy' : v > 35 ? 'neutral' : v > 15 ? 'sad' : 'angry'; return h(Wrap, null, F(buddy, 'sl', 84, { mood }), h('input', { type: 'range', min: 0, max: 100, value: v, onChange: (e) => setV(+e.target.value), 'aria-label': 'How was it?', style: { width: 220 } }), h('span', { style: muted }, 'How was it? ' + mood)) }

  /* ================= THEME TOGGLE ================= */
  const useDark = () => { const [d, setD] = useState(false); return [d, () => setD(!d)] }
  const Sky = () => { const [d, t] = useDark(); return h(Wrap, null, h('button', { onClick: t, 'aria-label': 'Toggle theme', style: { all: 'unset', cursor: 'pointer', position: 'relative', width: 150, height: 76, borderRadius: 40, overflow: 'hidden', background: d ? '#1b1740' : '#9be2ff', transition: 'background .5s', boxShadow: 'inset 0 2px 8px rgba(0,0,0,.2)' } }, h('div', { style: { position: 'absolute', top: 8, left: d ? 78 : 8, transition: 'left .5s cubic-bezier(.3,1.3,.5,1)' } }, F(S.planet, d ? 'moon' : 'sun', 60, { options: { kind: d ? 'moon' : 'sun' }, mood: d ? 'sleepy' : 'happy' })), d && ['12%,18%', '30%,60%', '44%,24%'].map((p2, i) => h('i', { key: i, style: { position: 'absolute', left: p2.split(',')[0], top: p2.split(',')[1], width: 4, height: 4, borderRadius: '50%', background: '#fff', opacity: .9 } }))), h('span', { style: muted }, d ? 'Night' : 'Day')) }
  const Lamp = () => { const [d, t] = useDark(); return h(Wrap, null, h('div', { style: { ...row({ gap: 14 }), padding: 18, borderRadius: 20, background: d ? '#14121c' : '#fff6dd', transition: 'background .4s', border: '1px solid var(--line,#ece6dc)' } }, F(S.home, 'lamp', 72, { options: { kind: 'lamp' }, mood: d ? 'sleepy' : 'happy', style: { filter: d ? 'brightness(.6)' : 'none', transition: 'filter .4s' } }), h('button', { className: 'vz-btn', onClick: t, 'aria-label': 'Pull the cord' }, d ? 'Pull cord: light on' : 'Pull cord: light off'))) }
  const Pill = () => { const [d, t] = useDark(); return h(Wrap, null, h('button', { onClick: t, role: 'switch', 'aria-checked': d, 'aria-label': 'Dark mode', style: { all: 'unset', cursor: 'pointer', ...row({ gap: 0 }), padding: 4, borderRadius: 40, background: 'var(--soft,#f3eee6)', border: '1px solid var(--line,#ece6dc)', position: 'relative' } }, [['Light', 'happy'], ['Dark', 'sleepy']].map(([l, m], i) => h('span', { key: l, style: { ...row({ gap: 6 }), padding: '4px 14px 4px 6px', borderRadius: 30, background: (d ? 1 : 0) === i ? 'var(--card,#fff)' : 'transparent', boxShadow: (d ? 1 : 0) === i ? '0 2px 8px rgba(0,0,0,.12)' : 'none', transition: 'all .3s', fontSize: 13, fontWeight: 600 } }, F(buddy, 'pill' + i, 28, { mood: (d ? 1 : 0) === i ? m : 'neutral' }), l)))) }
  const Eyelid = () => { const [d, t] = useDark(); return h(Wrap, null, h('button', { onClick: t, 'aria-label': 'Toggle theme', style: { all: 'unset', cursor: 'pointer', lineHeight: 0, padding: 12, borderRadius: '50%', background: d ? '#14121c' : '#fff', border: '1px solid var(--line,#ece6dc)', transition: 'background .4s' } }, F(ghost, 'eye', 84, { mood: d ? 'sleepy' : 'happy' })), h('span', { style: muted }, d ? 'Eyes closed = dark' : 'Eyes open = light')) }

  /* ================= LIKE ================= */
  const Burst = () => { const [l, setL] = useState(false); const [k, setK] = useState(0); return h(Wrap, null, h('button', { onClick: () => { setL(!l); setK(k + 1) }, 'aria-pressed': l, 'aria-label': 'Like', style: { all: 'unset', cursor: 'pointer', position: 'relative', lineHeight: 0 } }, F(emoji, 'lk', 80, { mood: l ? 'love' : 'neutral' }), l && [0, 1, 2, 3, 4].map((i) => h('span', { key: k + '-' + i, style: { position: 'absolute', left: 14 + i * 14, top: 8, fontSize: 18, animation: `vz-rise ${0.7 + i * 0.1}s ease-out both` } }, '💖'))), h('b', null, 128 + (l ? 1 : 0))) }
  const HoldLike = () => { const [p, setP] = useState(0); const t = useRef(); const down = () => { clearInterval(t.current); t.current = setInterval(() => setP((x) => Math.min(100, x + 6)), 40) }; const up = () => { clearInterval(t.current); setP((x) => (x >= 100 ? 100 : 0)) }; return h(Wrap, null, h('button', { onPointerDown: down, onPointerUp: up, onPointerLeave: up, 'aria-label': 'Hold to love', style: { all: 'unset', cursor: 'pointer', touchAction: 'none', position: 'relative', width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--line,#ece6dc)' } }, h('div', { style: { position: 'absolute', left: 0, right: 0, bottom: 0, height: p + '%', background: '#ff8fab', opacity: .35 } }), h('div', { style: { position: 'absolute', inset: 8 } }, F(animal, 'hl', 76, { options: { species: 'bunny' }, mood: p >= 100 ? 'love' : p > 0 ? 'surprised' : 'neutral' }))), h('span', { style: muted }, p >= 100 ? 'Loved!' : 'Press and hold')) }
  const Thumbs = () => { const [v, setV] = useState(null); return h(Wrap, null, F(buddy, 'th', 72, { mood: v === 'up' ? 'happy' : v === 'down' ? 'sad' : 'neutral' }), h('div', { style: row({ gap: 8 }) }, [['up', '👍'], ['down', '👎']].map(([k, e]) => h('button', { key: k, className: 'vz-btn', 'aria-pressed': v === k, onClick: () => setV(v === k ? null : k), style: { fontSize: 20, background: v === k ? 'var(--soft,#f3eee6)' : undefined } }, e)))) }

  /* ================= RATING ================= */
  const FaceScale = () => { const [v, setV] = useState(3); const M = ['angry', 'sad', 'neutral', 'happy', 'love']; return h(Wrap, null, h('div', { style: row({ gap: 6 }) }, M.map((m, i) => h('button', { key: m, onClick: () => setV(i + 1), 'aria-label': m, 'aria-pressed': v === i + 1, style: { all: 'unset', cursor: 'pointer', lineHeight: 0, opacity: v === i + 1 ? 1 : .4, transform: v === i + 1 ? 'scale(1.2)' : 'none', transition: 'all .25s' } }, F(emoji, 'fs' + i, 46, { mood: m })))), h('span', { style: muted }, ['Awful', 'Bad', 'Okay', 'Good', 'Loved it'][v - 1])) }
  const Donuts = () => { const [v, setV] = useState(3); return h(Wrap, null, h('div', { style: row({ gap: 4 }) }, [1, 2, 3, 4, 5].map((i) => h('button', { key: i, onClick: () => setV(i), 'aria-label': i + ' donuts', style: { all: 'unset', cursor: 'pointer', lineHeight: 0, opacity: i <= v ? 1 : .3, transform: i <= v ? 'none' : 'scale(.85)', transition: 'all .25s' } }, F(food, 'dn' + i, 42, { options: { kind: 'donut' }, mood: i <= v ? 'happy' : 'sleepy' })))), h('span', { style: muted }, v + ' of 5 donuts')) }

  /* ================= COPY ================= */
  const Chomp = () => { const [d, setD] = useState(false); return h(Wrap, null, h('div', { style: row({ gap: 12 }) }, F(monster, 'cp', 64, { mood: d ? 'happy' : 'silly' }), h('code', { style: { ...card({ padding: '8px 12px', borderRadius: 10 }), fontSize: 13 } }, 'npm i livatar'), h('button', { className: 'vz-btn', onClick: () => { setD(true); setTimeout(() => setD(false), 1400) } }, d ? 'Copied ✓' : 'Copy'))) }
  const Clip = () => { const [d, setD] = useState(false); return h(Wrap, null, h('button', { onClick: () => { setD(true); setTimeout(() => setD(false), 1400) }, 'aria-label': 'Copy', style: { all: 'unset', cursor: 'pointer', ...row({ gap: 10 }), ...card({ padding: '8px 14px 8px 8px' }) } }, F(office, 'cl', 40, { options: { kind: 'clipboard' }, mood: d ? 'love' : 'neutral' }), h('span', { style: { fontSize: 13, fontWeight: 600 } }, d ? 'Copied to clipboard!' : 'Copy link'))) }

  /* ================= CART ================= */
  const Fly = () => { const [n, setN] = useState(0); const [k, setK] = useState(0); return h(Wrap, null, h('div', { style: { position: 'relative', width: 260, height: 100 } }, h('button', { className: 'vz-btn', style: { position: 'absolute', left: 0, bottom: 10 }, onClick: () => { setK(k + 1); setTimeout(() => setN((x) => x + 1), 500) } }, 'Add donut'), k > 0 && h('div', { key: k, style: { position: 'absolute', left: 30, bottom: 20, animation: 'vz-fly .55s ease-in both' } }, F(food, 'fy', 30, { options: { kind: 'donut' } })), h('div', { style: { position: 'absolute', right: 0, bottom: 0, animation: n ? 'vz-jump .4s' : 'none' }, key: 'c' + n }, F(ui, 'ct', 64, { options: { kind: 'cart' }, mood: n ? 'happy' : 'neutral' })), n > 0 && h('b', { style: { position: 'absolute', right: -2, top: 6, background: '#ef476f', color: '#fff', borderRadius: 12, padding: '0 8px' } }, n)), h('style', null, '@keyframes vz-fly{to{transform:translate(190px,-4px) scale(.5);opacity:.2}}')) }
  const Basket = () => { const [n, setN] = useState(2); return h(Wrap, null, h('div', { style: { ...row({ gap: 0 }), minHeight: 50 } }, Array.from({ length: n }, (_, i) => h('div', { key: i, style: { marginLeft: i ? -10 : 0, animation: 'vz-pop .35s both' } }, F([food, S.fruit, vehicle, animal][i % 4], 'bk' + i, 40, { mood: 'happy' }))), n === 0 && h('span', { style: muted }, 'Basket is empty')), h('div', { style: row({ gap: 8 }) }, h('button', { className: 'vz-btn', onClick: () => setN(n + 1) }, 'Add'), h('button', { className: 'vz-btn', onClick: () => setN(Math.max(0, n - 1)) }, 'Remove'))) }

  /* ================= CONNECTION ================= */
  const Plug = () => { const [on, setOn] = useState(true); return h(Wrap, null, h('div', { style: row({ gap: 0 }) }, F(S.tech, 'pl', 60, { options: { kind: 'plug' }, mood: on ? 'happy' : 'sad', style: { transform: on ? 'translateX(8px)' : 'translateX(-10px)', transition: 'transform .4s cubic-bezier(.3,1.4,.5,1)' } }), F(S.tech, 'pl2', 60, { options: { kind: 'router' }, mood: on ? 'happy' : 'sleepy' })), h('button', { className: 'vz-btn', onClick: () => setOn(!on) }, on ? 'Unplug' : 'Plug in'), h('span', { style: muted }, on ? 'Connected' : 'Offline')) }
  const Bars = () => { const [q, setQ] = useState(3); return h(Wrap, null, h('div', { style: row({ gap: 14 }) }, F(alien, 'wf', 62, { mood: q === 0 ? 'sad' : q < 3 ? 'neutral' : 'happy' }), h('div', { style: row({ gap: 3, alignItems: 'flex-end', height: 34 }) }, [1, 2, 3, 4].map((i) => h('i', { key: i, style: { width: 7, height: 6 + i * 7, borderRadius: 3, background: i <= q ? brand : 'var(--line,#ece6dc)', transition: 'background .3s' } })))), h('input', { type: 'range', min: 0, max: 4, value: q, onChange: (e) => setQ(+e.target.value), 'aria-label': 'Signal', style: { width: 180 } })) }

  /* ================= PASSWORD STRENGTH ================= */
  const Tower = () => { const [pw, setPw] = useState('hunter'); const sc = Math.min(4, (pw.length > 7) + /[A-Z]/.test(pw) + /\d/.test(pw) + /[^\w]/.test(pw)); return h(Wrap, null, h('input', { type: 'password', value: pw, onChange: (e) => setPw(e.target.value), 'aria-label': 'Password', placeholder: 'Type a password', style: { width: 240 } }), h('div', { style: col({ flexDirection: 'column-reverse', alignItems: 'center', minHeight: 130, justifyContent: 'flex-start', gap: 0 }) }, Array.from({ length: Math.max(1, sc) }, (_, i) => h('div', { key: i, style: { marginBottom: -8, animation: 'vz-pop .3s both' } }, F([ghost, buddy, bot, alien][i], 'tw' + i, 44, { mood: sc >= 3 ? 'happy' : 'sad' })))), h('span', { style: muted }, ['Wobbly', 'Weak', 'Okay', 'Good', 'Fortress'][sc])) }
  const Lock = () => { const [pw, setPw] = useState(''); const sc = Math.min(4, (pw.length > 7) + /[A-Z]/.test(pw) + /\d/.test(pw) + /[^\w]/.test(pw)); return h(Wrap, null, F(ui, 'lc', 76, { options: { kind: 'lock', badge: false }, mood: !pw ? 'neutral' : sc < 2 ? 'sad' : sc < 4 ? 'happy' : 'love' }), h('input', { type: 'password', value: pw, onChange: (e) => setPw(e.target.value), 'aria-label': 'Password', placeholder: 'Type to see the lock react', style: { width: 240 } })) }

  /* ================= POLL ================= */
  const Duel = () => { const [v, setV] = useState(null); const o = [['Tabs', buddy, 54], ['Spaces', bot, 46]]; return h(Wrap, null, h('div', { style: row({ gap: 14, alignItems: 'flex-end' }) }, o.map(([l, st, pc], i) => h('button', { key: l, onClick: () => setV(i), style: { all: 'unset', cursor: 'pointer', ...col({ alignItems: 'center', gap: 6 }) } }, F(st, l, 64 + (v === i ? 12 : 0), { mood: v === null ? 'neutral' : v === i ? 'love' : 'sad' }), h('b', null, l), v !== null && h('small', { style: muted }, pc + (v === i ? 1 : 0) + '%')))), h('span', { style: muted }, v === null ? 'Tabs or spaces?' : 'Thanks for voting')) }

  /* ================= TYPING ================= */
  const Dots = () => h(Wrap, null, h('div', { style: row({ gap: 10 }) }, F(clay, 'ty', 44, { mood: 'confused' }), h('div', { style: { ...card({ padding: '12px 16px', borderRadius: '18px 18px 18px 4px' }), ...row({ gap: 5 }) } }, [0, 1, 2].map((i) => h('i', { key: i, style: { width: 8, height: 8, borderRadius: '50%', background: brand, animation: `vz-jump .9s ${i * 0.15}s infinite` } })))))

  /* ================= FOCUS ================= */
  const Grow = () => { const v = useLoop(7, 600); return h(Wrap, null, h('div', { style: { height: 120, ...col({ justifyContent: 'flex-end', alignItems: 'center' }) } }, F(S.plant, 'gr', 40 + v * 0.8, { mood: v > 95 ? 'love' : 'happy', style: { transition: 'all .6s' } })), h('span', { style: muted }, 'Your plant grows while you focus')) }
  const Tomato = () => { const v = useLoop(5, 600); const R = 46, C2 = 2 * Math.PI * R; return h(Wrap, null, h('div', { style: { position: 'relative', width: 112, height: 112 } }, h('svg', { width: 112, height: 112, style: { transform: 'rotate(-90deg)' } }, h('circle', { cx: 56, cy: 56, r: R, fill: 'none', stroke: 'var(--line,#ece6dc)', strokeWidth: 6 }), h('circle', { cx: 56, cy: 56, r: R, fill: 'none', stroke: '#ef476f', strokeWidth: 6, strokeLinecap: 'round', strokeDasharray: C2, strokeDashoffset: C2 * (v / 100) })), h('div', { style: { position: 'absolute', inset: 16 } }, F(S.fruit, 'tm', 80, { options: { kind: 'apple' }, mood: v > 90 ? 'sleepy' : 'happy' }))), h('span', { style: muted }, 'A tomato timer')) }

  /* ================= SKELETON ================= */
  const W = (kind, count, width = 340) => () => h(Wrap, null, h('div', { style: { width, maxWidth: '100%' } }, h(C.LivatarSkeleton, { kind, count })))
  const Reveal = () => {
    const [ok, setOk] = useState(false)
    tick(() => { setOk(false); setTimeout(() => setOk(true), 1800) }, 4200)
    return h(Wrap, null, h('div', { style: { width: 320, ...card({ padding: 14 }) } }, ok
      ? h('div', { style: { ...row({ gap: 12 }), animation: 'vz-pop .4s both' } }, F(memoji, 'ada', 56, { mood: 'happy' }), h('div', null, h('b', null, 'Ada Park'), h('div', { style: muted }, 'Founder, Inkwell'), h('div', { style: muted }, 'Loaded just now')))
      : h(C.LivatarSkeleton, { kind: 'profile' })), h('span', { style: muted }, ok ? 'Content landed' : 'Loading…'))
  }
  /* ================= registry ================= */
  const orig = (name, note, Demo) => ({ name, note, Demo })
  return {
    wrap(O) {
      return {
        progress: [orig('Car', 'The default', O.progress), orig('Race', 'Faces race to the flag', Race), orig('Face ring', 'Mood follows progress', FaceRing), orig('Battery', 'Blocks wake faces up', Battery), orig('To the moon', 'Vertical rocket', ToTheMoon)],
        stepper: [orig('Rocket', 'The default', O.stepper), orig('Face trail', 'Sleepy → awake', FaceTrail), orig('Climb', 'A fox climbs stairs', Climb), orig('Timeline', 'Vertical, with a helper', Timeline)],
        countdown: [orig('Classic', 'The default', O.countdown), orig('Flip clock', 'A ghost watches the seconds', Flip), orig('Dial', 'Wakes up as time runs out', DialRing), orig('Fuse', 'A bomb with a burning fuse', Fuse)],
        loader: [orig('Status', 'The default', O.loader), orig('Trio', 'Bouncing friends', Trio), orig('Fill', 'A face that fills up', Fill), orig('Orbit', 'Moons around a planet', Orbit), orig('Skeleton', 'Shimmer with a face', Skeleton)],
        'empty-state': [orig('Folder', 'The default', O['empty-state']), orig('Peek-a-boo', 'A ghost peeks up', PeekGhost), orig('Lost in space', 'A floating alien', Astronaut), orig('Sleepy', 'Wake it up', Sleepy)],
        upload: [orig('Dropzone', 'The default', O.upload), orig('Hungry monster', 'Feed it a file', Monster), orig('Cloud ring', 'Progress around the cloud', CloudRing), orig('Mailbox', 'Drop files in', Mailbox)],
        help: [orig('Corner', 'The default', O.help), orig('Fan menu', 'Quick actions fan out', Fan), orig('Nudge', 'Proactive speech bubble', Nudge), orig('Peeker', 'Peeks from the edge', Peeker)],
        stack: [orig('Overlap', 'The default', O.stack), orig('Fan', 'Hover to fan out', FanStack), orig('Huddle', 'Around the table', Huddle), orig('Presence', 'Status dots, expands', Presence)],
        profile: [orig('Card', 'The default', O.profile), orig('Flip', 'Tap for stats', Flip3), orig('Trading card', 'Holo foil', Trading), orig('Cover', 'Banner + overlap', Cover)],
        testimonial: [orig('Card', 'The default', O.testimonial), orig('Speech bubble', 'The face is talking', Bubble), orig('Rotator', 'Quotes cycle', Rotator), orig('Polaroid', 'A pinned photo', Polaroid)],
        bell: [orig('Bell', 'The default', O.bell), orig('Inbox', 'Opens a list', Inbox), orig('Badge', 'Count pip, shakes', Pips), orig('Ping', 'Radar rings', Ping)],
        'theme-toggle': [orig('Switch', 'The default', O['theme-toggle']), orig('Sky', 'Sun and moon swap', Sky), orig('Lamp', 'Light on/off', Lamp), orig('Pill', 'Two faces, one switch', Pill), orig('Eyelid', 'Eyes open or shut', Eyelid)],
        like: [orig('Heart', 'The default', O.like), orig('Burst', 'Hearts float up', Burst), orig('Hold', 'Press and hold', HoldLike), orig('Thumbs', 'Up or down', Thumbs)],
        rating: [orig('Stars', 'The default', O.rating), orig('Face scale', 'Awful to loved it', FaceScale), orig('Donuts', 'Five donuts', Donuts)],
        copy: [orig('Button', 'The default', O.copy), orig('Chomp', 'A monster eats the text', Chomp), orig('Clipboard', 'Clipboard chip', Clip)],
        cart: [orig('Button', 'The default', O.cart), orig('Fly to cart', 'The item flies in', Fly), orig('Basket', 'Items pile up', Basket)],
        connection: [orig('Status', 'The default', O.connection), orig('Plug', 'Unplug and replug', Plug), orig('Signal bars', 'Mood follows signal', Bars)],
        'password-strength': [orig('Meter', 'The default', O['password-strength']), orig('Tower', 'A tower of faces', Tower), orig('Lock', 'A lock reacts', Lock)],
        poll: [orig('Bars', 'The default', O.poll), orig('Duel', 'This or that', Duel)],
        typing: [orig('Coder', 'The default', O.typing), orig('Dots', 'Three bouncing dots', Dots)],
        focus: [orig('Timer', 'The default', O.focus), orig('Grow', 'A plant grows', Grow), orig('Tomato', 'Ring timer', Tomato)],
        skeleton: [orig('Text', 'The default', O.skeleton), orig('List', 'Rows with avatars', W('list', 4)), orig('Card', 'Image, title, buttons', W('card')), orig('Image', 'One big picture', W('image')), orig('Video', 'Player with controls', W('video')), orig('Profile', 'Avatar and actions', W('profile')), orig('Table', 'Header and rows', W('table', 4)), orig('Chat', 'Bubbles both sides', W('chat', 4)), orig('Feed', 'Posts with media', W('feed', 2)), orig('Grid', 'Gallery tiles', W('grid', 6)), orig('Reveal', 'Skeleton → content', Reveal)],
        reaction: [orig('Bubble', 'The default', O.reaction), orig('Picker', 'Emoji bar and burst', Picker), orig('Hearts', 'Tap to send love', Hearts), orig('Mood slider', 'Drag to set a mood', Slider)],
      }
    },
  }
}
