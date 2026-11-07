# livatar roadmap

Planned work and ideas, roughly in priority order. Want to help? Pick an item, open an issue to say you're on it, then send a PR. New characters: use **Request a new character** on the [homepage](https://nuhmanpk.github.io/livatar/#characters).

## 1. Ship what's built

- [ ] Bump the version (minor: 11 new styles, 540+ icons, agent skill, `livatar/life`, `livatar/components`) and write the changelog
- [ ] Publish to npm (the Components page previews and `livatar/life` / `livatar/components` imports need it)
- [ ] Click through all 34 components and 5 examples on desktop and phone
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
- [ ] **Avatar group presence dots** (online, away, busy) on `LivatarStack`; stacked avatars and "+N more" are done
- [ ] **Lip-sync**: drive `talk()` from an audio stream (Web Audio levels) for voice and AI assistants
- [ ] **More gestures**: wave, thumbs-up, celebrate (confetti). The thinking loop exists in `assistant()`
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

## 6. Life and components, next

- [ ] **Voice**: lip-sync from mic or TTS audio, plus a `LivatarVoice` push-to-talk button whose face listens and answers
- [ ] **Assistant adapters**: one-liners for Vercel AI SDK `useChat`, OpenAI/Anthropic streams, LangChain callbacks
- [ ] **Pet extras**: tricks, accessories unlocked by level, daily streaks, a `LivatarPet` home-screen widget
- [ ] **Multiplayer transports**: ready adapters for Liveblocks, PartyKit, Supabase Realtime, Yjs awareness
- [ ] **Reactions from real signals**: page visibility, idle time, network, scroll depth, form errors, CI status
- [ ] **Memory**: the avatar remembers a returning user (greets them, remembers their last mood) via a pluggable store
- [ ] **Emotion from camera** (opt-in, on-device): mirror the user's expression with face landmarks
- [ ] **More components**: date picker, file tree, kanban card, music player, map pin, quiz, game score, onboarding tour, error boundary, offline banner, leaderboard, comment thread
- [ ] **Vue and Svelte versions** of `livatar/components`, plus a shadcn-style registry (`npx livatar add checkout`) so users copy the source
- [ ] **Tailwind preset** and CSS variables for every component

## 7. Characters and art

- [ ] Outfits and accessories layer (hats, glasses, headphones, seasonal sets)
- [ ] Seasonal moods: snow on avatars in December, pumpkins in October (opt-in)
- [ ] Pixel art, line art and 3D-shaded render modes for every style
- [ ] Bring-your-own-SVG: rig any illustration with eyes and mouth anchors so it comes alive
- [ ] Character editor: draw a new style in the browser and export a style file

## 8. Platform and tooling

- [ ] Benchmarks page: frames per second with 100 / 1,000 avatars; pause off-screen avatars automatically
- [ ] Reduced-motion and screen-reader audit for every component (WCAG AA)
- [ ] Storybook with every component and mood
- [ ] Visual regression tests (screenshot diff per style)
- [ ] Size budget check in CI (fail if core grows past a limit)
- [ ] Framework starters: Next.js, Astro, Nuxt, SvelteKit templates
- [ ] Chrome extension: replace missing avatars on GitHub, Slack and Gmail with livatars

## 9. Ideas to explore

- [ ] Identity cards: a shareable profile page per avatar code
- [ ] Livatar for games: health/hit/level-up reactions, controller input
- [ ] Desktop pet app (Tauri) that sits on the dock and reacts to notifications
- [ ] Stream overlay for Twitch/OBS that reacts to chat
- [ ] Slack/Discord status avatar that follows your calendar and mood
- [ ] Classroom mode: kids design a character, the teacher sees reactions to quiz answers

## Done recently

- [x] `livatar/life`: personality engine, feelings from text, context reactions, AI assistant face, virtual pet, multiplayer rooms
- [x] `livatar/components`: 34 React/Next components and 5 example screens, with a Components gallery page
- [x] Life demo page, docs section, animated README art (meeting room, assistant)
- [x] GitHub Pages deploy via Actions; `SKILL.md`/`AGENTS.md` served in every casing
- [x] 11 new styles: `ui`, `device`, `fruit`, `drink`, `vehicle`, `tech`, `money`, `home`, `office`, `dev` (developer at work), `human` (realistic, baby to grandparent)
- [x] 540+ animated brand icons in 14 categories; doodle animation now replays on hover
- [x] "Copy for AI agents" on every page, `SKILL.md`, `AGENTS.md`, `npx livatar skill`
- [x] Mobile & touch docs section and 10 mobile use cases
- [x] Living UI icons (theme toggle, like/unlike, favorite…) with JS/React/Next.js/agent snippets
- [x] Fix: duplicate SVG ids when the same avatar appears twice on a page
