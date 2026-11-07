# livatar roadmap

Planned work and ideas, roughly in priority order. Want to help? Pick an item, open an issue to say you're on it, then send a PR. New characters: use **Request a new character** on the [homepage](https://nuhmanpk.github.io/livatar/#characters).

## 1. Ship what's built

- [ ] Bump the version (minor: 11 new styles, 540+ icons, agent skill, `livatar skill` CLI) and write the changelog
- [ ] Publish to npm and deploy `_site/` to GitHub Pages (the `SKILL.md` and `llms.txt` links in the "Copy for AI agents" prompt depend on it)
- [ ] Test mobile features on real iOS and Android devices: tilt, shake, face-down, swipe, long-press, battery
- [ ] Pin Node >= 20 for development (`engines` / `.nvmrc`); Node 16 breaks tsup

## 2. Loose ends

- [ ] **Hosted image URLs**: a Cloudflare Worker running `avatarHandler` from `livatar/server`, so `https://<host>/<code>.svg` returns an image. Add a "Copy image URL" button in the builder, plus a share page at `/#lv…` on GitHub Pages
- [ ] Icons: in dark mode, lighten very dark brand colors (Goodreads and similar) automatically
- [ ] Move the face and drawing helpers that are copied in each new style file (`ui`, `device`, `fruit`, `drink`, `vehicle`, `tech`, `money`, `home`, `office`, `dev`) into one shared module
- [ ] `human`: give curly and coily hair the same strand detail as other hair; fit the dress straps to the sloped shoulders
- [ ] Tests: render every style × kind × mood, and check for valid SVG with nothing drawn outside the frame
- [ ] Icons page: merge the "AI agent prompt" tab and the "Copy for AI agents" button
- [ ] Site size: about 26k hosted icon files (119 MB). Host the common variants and generate the rest on demand

## 3. Library features

- [ ] **Mobile behaviors as options**: `alive(el, { tilt, wander, shake })`, on by default on touch devices (they only exist as demo code today)
- [ ] **PNG/WebP export on the server**, e.g. with `@resvg/resvg-wasm`, for email and social preview images
- [ ] **Avatar group component**: stacked avatars, "+N more", presence dots (online, away, busy)
- [ ] **Lip-sync**: drive `talk()` from an audio stream (Web Audio levels) for voice and AI assistants
- [ ] **More gestures**: wave, thumbs-up, celebrate (confetti), a "thinking…" loop
- [ ] **Theme tokens**: one setting so every style follows a brand palette
- [ ] **Animated export** to GIF or Lottie for platforms that block SVG animation
- [ ] **More characters**: the shortlist left from planning (weather, mail, sea creatures, bugs, sports, sweets, books)

## 4. Ecosystem

- [ ] **MCP server** (`npx livatar mcp`) with tools to render avatars, list styles and options, and encode or decode codes, so agents don't guess options
- [ ] **Figma plugin**: insert a livatar from a seed or code
- [ ] **Native wrappers**: React Native, Flutter, SwiftUI
- [ ] **Integrations**: WordPress plugin, Discord bot, a GitHub Action that builds a contributor avatar wall for READMEs
- [ ] **Community style gallery** built from "new character" issues

## 5. Growth

- [ ] Launch video: avatars reacting, the mobile tricks, and pasting the agent prompt into a coding agent
- [ ] Comparison pages against other avatar libraries (DiceBear, Boring Avatars, …)
- [ ] Submit to llms.txt directories, Claude skill lists, and Cursor rules collections

## Done recently

- [x] 11 new styles: `ui`, `device`, `fruit`, `drink`, `vehicle`, `tech`, `money`, `home`, `office`, `dev` (developer at work), `human` (realistic, baby to grandparent)
- [x] 540+ animated brand icons in 14 categories; doodle animation now replays on hover
- [x] "Copy for AI agents" on every page, `SKILL.md`, `AGENTS.md`, `npx livatar skill`
- [x] Mobile & touch docs section and 10 mobile use cases
- [x] Living UI icons (theme toggle, like/unlike, favorite…) with JS/React/Next.js/agent snippets
- [x] Fix: duplicate SVG ids when the same avatar appears twice on a page
