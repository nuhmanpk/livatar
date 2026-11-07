---
name: livatar
description: Add living, animated SVG avatars and UI icons to a web app with the livatar npm package (vanilla JS, React, Next.js, Vue, Svelte, web component, SSR). Use when the user wants avatars, mascot characters, animated icons, mood-reacting form helpers, or "livatar".
---

# livatar

Tiny, zero-dependency SVG avatars that are alive: they follow the cursor, blink, breathe, chew while you type, cover their eyes on password fields, and show 10 moods. Deterministic from a seed.

- Install: `npm i livatar`
- Full API (read first if unsure): https://nuhmanpk.github.io/livatar/llms-full.txt
- Short index: https://nuhmanpk.github.io/livatar/llms.txt
- Docs: https://nuhmanpk.github.io/livatar/docs/ · Builder: https://nuhmanpk.github.io/livatar/docs/#builder
- Icons: https://nuhmanpk.github.io/livatar/icons/

## Pick the entry point
| Need | Use |
|---|---|
| Static SVG string (SSR, email, `<img>`) | `createAvatar(style, opts)` from `livatar` |
| Animated, one style, smallest bundle | `mount(el, style, opts)` |
| Animated from a config/code, any style | `mountCode(el, config)` |
| React / Next.js | `<Livatar variant={buddy} />` or `<LivatarCode variant="buddy" />` from `livatar/react` (already `'use client'`) |
| Vue / Nuxt | `livatar/vue` |
| Any framework / plain HTML | `<livatar-avatar>` from `livatar/element` |
| Brand icons | `icon(name, opts)` from `livatar/icons` |

## Examples
```js
import { mount, buddy } from 'livatar'
const h = mount(document.querySelector('#me'), buddy, { seed: 'ada', mood: 'happy', size: 64 })
h.emote('love', 900); h.nod()   // handle: look talk blink poke emote nod shake set destroy
```
```tsx
import { LivatarCode } from 'livatar/react'
export const Avatar = ({ user }) => <LivatarCode variant="animal" seed={user.id} size={48} />
```
```js
// login form: covers eyes on password, reacts to validation
import { mount, bindForm, blob } from 'livatar'
const h = mount(el, blob, { seed: 'login' })
const f = bindForm(h, document.querySelector('form'))   // f.success() / f.error()
```
```js
// theme toggle icon: sun in light, moon in dark
mountCode(btn, { style: 'planet', mood: dark ? 'sleepy' : 'happy', background: false,
  options: { kind: dark ? 'moon' : 'sun', satellite: false, stars: false } })
```

## Facts to get right
- Styles: buddy animal monster ghost emoji memoji clay planet dino alien food plant initials bot blob pixel ui device fruit drink vehicle tech money home office dev human.
- planet kinds: earth saturn mars moon sun gas comet star heart cloud.
- Moods: neutral happy sad angry surprised sleepy love wink silly confused.
- Every style option also accepts `'random'` (picked from the seed). Same seed → same avatar.
- `alive: false` renders static; animation respects `prefers-reduced-motion`.
- Wrap interactive avatars/icons in a real `<button>` with an `aria-label`; use `describe(config)` for alt text.
- Don't invent options. If unsure, fetch llms-full.txt.
