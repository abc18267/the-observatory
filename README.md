# The Observatory

A portfolio hiding an entire world of discovery. A two-layer site: a clean
portfolio surface with a hidden discovery layer underneath (interactive WebGL
starfield, easter-egg mini-games, generative audio, and a secret "observatory"
room).

## Tech Stack

- **Framework:** Astro 5 (static output) + Svelte 5 islands
- **Styling:** Tailwind CSS v4 (CSS-first config with `@theme`)
- **3D / WebGL:** Three.js (starfield, constellations)
- **Games:** raw-canvas mini-games + Phaser 3 (hidden, dynamic import only)
- **Audio:** Tone.js (generative music + SFX)
- **Physics:** Matter.js (DOM text scatter)
- **Particles:** tsParticles (ambient dust)
- **State:** localStorage (discovery tracking — no server)
- **Deploy:** Cloudflare Pages (static)

## Project Structure

```text
public/        Static assets, robots.txt, _headers, favicons
src/
  components/  surface/ hidden/ games/ audio/ ui/
  layouts/     BaseLayout, PageLayout
  pages/       index, about, projects, blog, contact, ship-log, observatory
  lib/         discovery/, audio/, games/, utils/
  styles/      global.css (Tailwind + theme)
  content/     projects/, blog/ (content collections)
  data/        knowledge-graph.json, constellations.json
```

## Commands

| Command            | Action                                      |
| :----------------- | :------------------------------------------ |
| `npm install`      | Install dependencies                        |
| `npm run dev`      | Start local dev server at `localhost:4321`  |
| `npm run build`    | Build the production site to `./dist/`      |
| `npm run preview`  | Preview the production build locally        |
| `npx tsc --noEmit` | Type-check                                  |

## Notes

- All heavy libraries (Three.js, Phaser, Tone.js) are dynamically imported.
- Initial-JS budget: < 200KB. Lighthouse performance target: 90+.
- The `/observatory` route is an intentional hidden page; it is excluded from
  the sitemap and disallowed in `robots.txt`.
