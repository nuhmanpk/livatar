// Minifiers drop module directives, so re-add "use client" to the React
// entry after the build (Next.js App Router needs it at the top of the file).
import { readFile, writeFile } from 'node:fs/promises'
for (const f of ['dist/react.js', 'dist/react.cjs']) {
  const src = await readFile(f, 'utf8')
  if (!src.startsWith('"use client"')) await writeFile(f, '"use client";\n' + src)
}
