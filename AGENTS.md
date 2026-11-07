# livatar — notes for AI coding agents

You are using **livatar**: tiny, zero-dependency, animated SVG avatars and icons (vanilla JS, React/Next.js, Vue, Svelte, web component, SSR).

Read before writing code:
- Full API + examples: [llms-full.txt](./llms-full.txt) (also https://nuhmanpk.github.io/livatar/llms-full.txt)
- How to use it well: [skills/livatar/SKILL.md](./skills/livatar/SKILL.md) — install it for Claude Code with `npx livatar skill`
- Docs: https://nuhmanpk.github.io/livatar/docs/ · Builder: https://nuhmanpk.github.io/livatar/docs/#builder

Quick start:
```js
import { mount, buddy } from 'livatar'           // animated, smallest bundle
const h = mount(el, buddy, { seed: user.id, mood: 'happy', size: 48 })
```
```tsx
import { LivatarCode } from 'livatar/react'       // React / Next.js ('use client' included)
<LivatarCode variant="animal" seed={user.id} size={48} />
```

Rules: same seed → same avatar. Don't invent options; check llms-full.txt. Interactive avatars go in a `<button>` with an `aria-label`. Use `describe(config)` for alt text.
