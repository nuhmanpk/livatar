// Zero-dependency static server for the local demo.
//   node scripts/serve.mjs [port] [--watch]
// --watch: rebuilds the library on source changes (tsup --watch) and
// live-reloads open pages whenever dist/ or demo/ change.
// Also serves the agent files the way the built site does (at the site root and under /demo/):
//   /llms.txt, /llms-full.txt, /SKILL.md (or /skills.md), /AGENTS.md
import { spawn } from 'node:child_process'
import { watch } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const args = process.argv.slice(2)
const live = args.includes('--watch')
const port = Number(args.find((a) => /^\d+$/.test(a)) || process.env.PORT || 5173)

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

const clients = new Set()
const RELOAD = `<script>(()=>{const es=new EventSource('/__livereload');es.onmessage=()=>location.reload()})()</script>`

createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost')
  if (live && url.pathname === '/__livereload') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' })
    res.write(': connected\n\n')
    clients.add(res)
    req.on('close', () => clients.delete(res))
    return
  }
  if (url.pathname === '/' || url.pathname === '/demo') {
    res.writeHead(302, { location: '/demo/' }).end()
    return
  }
  // agent files: the site build copies these next to the pages; mirror that locally
  const AGENT = { 'skill.md': 'skills/livatar/SKILL.md', 'skills.md': 'skills/livatar/SKILL.md', 'llms.txt': 'llms.txt', 'llms-full.txt': 'llms-full.txt', 'agents.md': 'AGENTS.md' }
  const alias = AGENT[url.pathname.replace(/^\/(demo\/)?/, '').toLowerCase()]
  let file = normalize(join(root, alias || decodeURIComponent(url.pathname)))
  if (file !== root && !file.startsWith(root + sep)) {
    res.writeHead(403).end('Forbidden')
    return
  }
  try {
    if ((await stat(file)).isDirectory()) {
      // relative links in a page need the trailing slash: /demo/life → /demo/life/
      if (!url.pathname.endsWith('/')) {
        res.writeHead(301, { location: url.pathname + '/' + url.search }).end()
        return
      }
      file = join(file, 'index.html')
    }
    let body = await readFile(file)
    const type = types[extname(file)] || 'application/octet-stream'
    if (live && extname(file) === '.html') body = Buffer.from(body.toString().replace(/<\/body>|$/i, (m) => RELOAD + m))
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' })
    res.end(body)
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found')
  }
}).listen(port, () => {
  console.log(`livatar demo → http://localhost:${port}/demo/${live ? '  (watching, live reload on)' : ''}`)
})

if (live) {
  // rebuild the library whenever src/ changes
  const tsup = spawn(join(root, 'node_modules', '.bin', 'tsup'), ['--watch', 'src'], { cwd: root, stdio: ['ignore', 'pipe', 'inherit'] })
  tsup.stdout.on('data', (d) => {
    const line = d.toString()
    if (/error/i.test(line) || /Build success/i.test(line)) process.stdout.write(line.split('\n').filter((l) => /error|success/i.test(l)).join('\n') + '\n')
  })
  process.on('exit', () => tsup.kill())
  process.on('SIGINT', () => process.exit())

  let timer
  const reload = (why) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      for (const c of clients) c.write(`data: ${why}\n\n`)
      if (clients.size) console.log(`↻ reload (${why})`)
    }, 200)
  }
  for (const dir of ['dist', 'demo']) {
    try {
      watch(join(root, dir), { recursive: true }, (_e, f) => reload(`${dir}/${f ?? ''}`))
    } catch (e) {
      console.warn(`cannot watch ${dir}/: ${e.message}`)
    }
  }
}
