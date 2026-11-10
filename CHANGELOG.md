# Changelog

## 0.3.0

### New
- **`LivatarInput` `follow` and `cycle`**: the face is seeded from the typed text (every username gets its own face), and clicking the face switches the character type.
- **Component variants**: the components gallery shows creative alternates (tabs) for progress, stepper, countdown, loader, empty state, upload, help launcher, avatar stack, profile card, testimonial, bell, reactions, theme toggle and more, plus live popup previews for toast and cookie consent, with phone layouts on small screens.
- **Avatar API, Figma plugin and scaffolding**: `npx livatar api` (local avatar API) with a Cloudflare Worker example, a Figma/FigJam plugin, `npx livatar components` and `npx livatar add <name>`.
- **New components**: `LivatarSkeleton` (10 kinds), `LivatarMarquee`, `LivatarConfetti`, `LivatarPresence` (presence, typing, multiplayer cursors).
- **Photo with fallback**: `LivatarPhoto` and vanilla `photoFallback()` show the user's photo or, when it is missing or broken, their seeded livatar in the same box.
- **9 new styles** (37 in all): `weather`, `sport`, `music`, `sea`, `bug`, `magic`, `party`, `season`, `tool`, 8 kinds each, every one with a mood-aware face and one extra option (sparkles, motion lines, floating notes, bubbles, a flower, confetti, falling leaves or snow, tool finish). Appended to the registry, so existing livatar codes are unchanged.
- **`livatar/roam`**: full-body animals that spawn and roam the page with species habits (koala naps, naughty pig, flying birds, scratching cat…), pat and pick-up, and optional synthesized sounds (off by default). The site has a 🐾 header button: off → pets → pets with sound.
- **Wordmark art**: `assets/wordmark.svg`, the word livatar as a mosaic of 857 faces with a sweeping light (README), and a mouse-magnifier mosaic in the site footer.
- **Virtual pet with legs**: `LivatarPet` (and the Life page) now live in a yard: the pet walks around on legs, turns the way it goes, eats, plays, sleeps, and shows hunger, tiredness and love. The footer wordmark has living faces too.
- Dice buttons on the site are now an animated livatar cube; smoother mobile loading screen.

### Package
- New export `livatar/roam`; ships `figma-plugin` and `examples`.

## 0.2.0

### New
- **`livatar/life`**: personality engine (7 presets or seeded traits), `feel()` text sentiment, context-aware reactions, AI assistant face (`assistant()` with streaming), virtual pet with persistence and levels, multiplayer rooms (`group()`: greetings, gaze at the speaker, chat moods).
- **`livatar/components`**: 40 ready-made React / Next.js components with living characters, including `LivatarCall` (meeting window with a speaker stage, raised hands and floating reactions), `LivatarChainLoader` (chain, orbit, conga, stack), checkout, inline inputs, OTP, search, pricing, poll, focus timer, growing to-do list, copy button and more.
- **11 new styles** (`ui`, `device`, `fruit`, `drink`, `vehicle`, `tech`, `money`, `home`, `office`, `dev`, `human`) and the **`ai` style** (gemini, claude, grok, chatgpt inspired characters).
- **540+ animated brand icons** (`livatar/icons`).
- Agent support: `SKILL.md`, `AGENTS.md`, `llms.txt`, `npx livatar skill`.

### Fixed
- An AI stream that fails now shows the error face instead of talking forever.
- Duplicate SVG ids when the same avatar appears twice on a page.

### Package
- Ships only `dist`, `bin`, `skills` and docs; tests guard the tarball contents and every export.
- `engines.node >= 18`.

## 0.1.0
- First release.
