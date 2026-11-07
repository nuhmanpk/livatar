// Page loader: a little troupe of characters while the page gets ready.
// Plain script (no modules, no libraries) so it shows instantly. Put it right after <body>.
// Pages that render late (React) set <body data-wait> and dispatch `livatar:ready` when done.
;(function () {
  if (window.__lvLoader) return
  window.__lvLoader = 1
  var body = document.body
  if (!body) return
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches
  var COLORS = [['#ffd166', '#e0a800'], ['#ff8fab', '#e05780'], ['#90e0ef', '#2a9dbb'], ['#b8f2a0', '#4caf50'], ['#c3b1ff', '#7f5af0'], ['#ffb38a', '#e8743b']]
  var face = function (i, s, mood) {
    var c = COLORS[i % COLORS.length]
    var mouth = mood === 'o' ? '<ellipse cx="24" cy="31" rx="3" ry="3.6" fill="#2b2140"/>' : '<path d="M17 29 Q24 36 31 29" stroke="#2b2140" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
    return '<svg class="lv-f" width="' + s + '" height="' + s + '" viewBox="0 0 48 48" aria-hidden="true" style="--d:' + i * 0.12 + 's">' +
      '<circle cx="24" cy="24" r="21" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="2"/>' +
      '<g class="lv-eyes"><circle cx="17" cy="21" r="3" fill="#2b2140"/><circle cx="31" cy="21" r="3" fill="#2b2140"/></g>' +
      '<circle cx="12" cy="28" r="3" fill="#ff6b9a" opacity=".35"/><circle cx="36" cy="28" r="3" fill="#ff6b9a" opacity=".35"/>' + mouth + '</svg>'
  }
  var n = 5, html = ''
  var scenes = {
    // holding hands in a line, a wave runs through them
    chain: function () { for (var i = 0; i < n; i++) html += (i ? '<i class="lv-hand"></i>' : '') + '<span class="lv-c">' + face(i, 40) + '</span>'; return '<div class="lv-chain">' + html + '</div>' },
    // small friends orbit a big one
    orbit: function () { for (var i = 0; i < 4; i++) html += '<span class="lv-o" style="--a:' + i * 90 + 'deg">' + face(i + 1, 28) + '</span>'; return '<div class="lv-orbit"><span class="lv-big">' + face(0, 64, 'o') + '</span>' + html + '</div>' },
    // a conga line marching across
    conga: function () { for (var i = 0; i < n; i++) html += '<span class="lv-g" style="--i:' + i + '">' + face(i, 36) + '</span>'; return '<div class="lv-conga">' + html + '</div>' },
    // stacking up into a tower, then tumbling
    stack: function () { for (var i = 0; i < 4; i++) html += '<span class="lv-s" style="--i:' + i + '">' + face(i + 2, 38) + '</span>'; return '<div class="lv-stack">' + html + '</div>' },
  }
  var keys = Object.keys(scenes)
  var want = (location.search.match(/[?&]loader=(\w+)/) || [])[1]
  var pick = scenes[want] ? want : keys[Math.floor(Math.random() * keys.length)]
  var LINES = ['Waking up the avatars…', 'Brushing their teeth…', 'Practising smiles…', 'Finding everyone a seat…', 'Untangling the hand-holding…']
  var css = '' +
    '#lv-load{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:var(--bg,#faf7f2);color:var(--fg,#1f1a2e);transition:opacity .35s,visibility .35s;font:600 14px/1.4 system-ui,sans-serif}' +
    '#lv-load.out{opacity:0;visibility:hidden}' +
    '#lv-load .lv-in{display:flex;flex-direction:column;align-items:center;gap:22px}' +
    '#lv-load .lv-t{opacity:.6;min-height:20px;transition:opacity .3s}' +
    '.lv-f .lv-eyes{transform-origin:24px 21px;animation:lv-blink 3.2s infinite var(--d)}' +
    '.lv-chain{display:flex;align-items:center}.lv-c{display:block;animation:lv-wave 1.1s ease-in-out infinite;animation-delay:calc(var(--k,0) * 1s)}' +
    '.lv-chain .lv-c:nth-of-type(2){animation-delay:.12s}.lv-chain .lv-c:nth-of-type(3){animation-delay:.24s}.lv-chain .lv-c:nth-of-type(4){animation-delay:.36s}.lv-chain .lv-c:nth-of-type(5){animation-delay:.48s}' +
    '.lv-hand{display:block;width:10px;height:4px;border-radius:4px;background:currentColor;opacity:.25;margin:0 -2px}' +
    '.lv-orbit{position:relative;width:150px;height:150px;display:grid;place-items:center}.lv-big{animation:lv-bob 1.6s ease-in-out infinite}' +
    '.lv-o{position:absolute;left:61px;top:61px;animation:lv-spin 2.4s linear infinite;--r:62px}' +
    '.lv-o svg{display:block;animation:lv-unspin 2.4s linear infinite}' +
    '.lv-conga{position:relative;width:260px;height:60px;overflow:hidden;-webkit-mask:linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent);mask:linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent)}' +
    '.lv-g{position:absolute;bottom:6px;left:-40px;animation:lv-march 3s linear infinite,lv-hop .5s ease-in-out infinite alternate;animation-delay:calc(var(--i) * -.6s),calc(var(--i) * -.1s)}' +
    '.lv-stack{position:relative;width:60px;height:170px}' +
    '.lv-s{position:absolute;left:11px;bottom:calc(var(--i) * 36px);opacity:0;animation:lv-drop 2.8s cubic-bezier(.3,1.4,.5,1) infinite;animation-delay:calc(var(--i) * .25s)}' +
    '@keyframes lv-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}' +
    '@keyframes lv-wave{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-16px) rotate(-6deg)}}' +
    '@keyframes lv-bob{50%{transform:translateY(-6px) scale(1.04)}}' +
    '@keyframes lv-spin{from{transform:rotate(var(--a)) translateX(var(--r))}to{transform:rotate(calc(var(--a) + 360deg)) translateX(var(--r))}}' +
    '@keyframes lv-unspin{from{transform:rotate(calc(-1 * var(--a)))}to{transform:rotate(calc(-1 * var(--a) - 360deg))}}' +
    '@keyframes lv-march{from{left:-40px}to{left:270px}}' +
    '@keyframes lv-hop{from{transform:translateY(0) rotate(-5deg)}to{transform:translateY(-10px) rotate(5deg)}}' +
    '@keyframes lv-drop{0%{opacity:0;transform:translateY(-120px)}15%,70%{opacity:1;transform:translateY(0)}85%{opacity:1;transform:translate(calc((var(--i) - 1.5) * 30px),40px) rotate(calc((var(--i) - 1.5) * 40deg))}100%{opacity:0;transform:translate(calc((var(--i) - 1.5) * 40px),60px)}}' +
    '@media (prefers-reduced-motion:reduce){#lv-load *{animation:none!important}.lv-s{opacity:1}}'
  var style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
  var el = document.createElement('div')
  el.id = 'lv-load'
  el.setAttribute('role', 'status')
  el.setAttribute('aria-live', 'polite')
  el.innerHTML = '<div class="lv-in">' + scenes[pick]() + '<div class="lv-t">' + LINES[0] + '</div></div>'
  body.prepend(el)
  var t = el.querySelector('.lv-t'), li = 0
  var tick = reduce ? 0 : setInterval(function () { li = (li + 1) % LINES.length; t.textContent = LINES[li] }, 1400)

  var start = Date.now(), MIN = 650, MAX = 8000
  var waiting = body.hasAttribute('data-wait'), loaded = document.readyState === 'complete'
  var hide = function () {
    if (!el.parentNode || el.classList.contains('out')) return
    setTimeout(function () {
      el.classList.add('out')
      clearInterval(tick)
      setTimeout(function () { el.remove(); style.remove() }, 400)
    }, Math.max(0, MIN - (Date.now() - start)))
  }
  // ?loader keeps it on screen (to look at it); ?loader=orbit picks a scene
  var keep = /[?&]loader\b/.test(location.search)
  var check = function () { if (loaded && !waiting && !keep) hide() }
  window.addEventListener('load', function () { loaded = true; check() })
  window.addEventListener('livatar:ready', function () { waiting = false; check() })
  if (!keep) setTimeout(hide, MAX)
  check()
})()
