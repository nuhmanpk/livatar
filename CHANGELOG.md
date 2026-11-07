# Changelog

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
