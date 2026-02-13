# The Observatory - Project Instructions

## Tech Stack
- **Framework**: Astro 5 + Svelte 5 islands architecture
- **Styling**: Tailwind CSS v4 (CSS-first config with @theme)
- **3D/WebGL**: Three.js (interactive starfield, constellations)
- **Small games**: LittleJS (~7KB, instant-load easter egg games)
- **Big game**: Phaser 3 (hidden space exploration, dynamic import only)
- **Audio**: Tone.js (generative music) + Howler.js (sound effects)
- **Physics**: Matter.js (DOM element physics, text scatter)
- **Particles**: tsParticles (ambient starfield/dust)
- **State**: localStorage (discovery tracking, no server)
- **Deploy**: Cloudflare Pages (static output)

## Architecture
Two-layer site: clean portfolio surface, hidden discovery layer underneath.
All heavy libraries (Three.js, Phaser, Tone.js, LittleJS) use dynamic imports.
Only hydrate Svelte islands that need interactivity. Keep static HTML for everything else.

## Directory Layout
```
src/
  components/
    surface/    - Nav, Footer, Hero, ProjectCard, BlogCard
    hidden/     - StarField, Terminal, KnowledgeGate, WordTrigger, etc.
    games/      - GameOverlay, MiniGameLoader, DeepGameLoader
    audio/      - AudioEngine, AudioToggle
    ui/         - Shared UI primitives
  layouts/      - BaseLayout, PageLayout
  pages/        - index, about, projects, blog, contact, ship-log
  lib/
    discovery/  - store.ts, knowledgeGraph.ts, events.ts
    audio/      - generative.ts, sfx.ts
    games/      - littlejs/, phaser/
    utils/      - time.ts, visit.ts, loop.ts
  styles/       - global.css (Tailwind + custom theme)
  content/      - projects/, blog/ (content collections)
  data/         - knowledge-graph.json, constellations.json
  assets/       - fonts/, images/, sounds/
```

## Conventions
- Svelte 5 runes syntax ($state, $derived, $effect)
- TypeScript strict mode
- Path aliases: @/ = src/, @components/, @lib/, @data/, @assets/
- Discovery events use CustomEvent on window
- All discovery state goes through src/lib/discovery/store.ts
- Game/audio components must handle their own cleanup on destroy

## Build Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npx tsc --noEmit` - Type check

## Performance Budget
- Initial JS bundle: <200KB
- Dynamic imports for: Three.js, Phaser, Tone.js, LittleJS, Matter.js
- Lighthouse Performance target: 90+
