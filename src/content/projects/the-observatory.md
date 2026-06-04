---
title: The Observatory
description: This portfolio site itself. Two layers. A clean surface and a hidden world of discovery underneath.
date: 2026-02-01
tags: [astro, svelte, three-js, tone-js]
featured: true
---

This is the project you're standing in right now.

The Observatory is a two-layer portfolio site. The surface is clean. Standard portfolio layout. Projects, blog, about, contact. Nothing unusual.

Underneath there's a hidden discovery layer. Stars you can click. Constellations to form from star patterns. Four mini-games hidden in the text. A terminal that opens with the Konami code. Generative music. Physics-enabled text. A 22-minute time loop inspired by Outer Wilds.

## The Stack

- **Astro 5** for the static shell and content collections
- **Svelte 5** islands for interactive components
- **Three.js** for the WebGL starfield
- **LittleJS** for the mini-games (under 7KB)
- **Tone.js** for generative ambient music
- **Matter.js** for physics-enabled text
- **Tailwind CSS v4** for styling
- **localStorage** for persistent discovery state

Everything heavy loads dynamically. Initial JS stays under 200KB.

## The Design Philosophy

Most portfolios are passive. You scroll, you read, you leave. I wanted a site that rewards curiosity. Click things. Type things. Stay a while. The more you explore, the more you find.

Every discovery persists. The site remembers what you found across visits. The ship log page shows your complete exploration history as a knowledge graph.

## What I Learned

Building two layers means building two experiences. The surface has to work perfectly on its own. The hidden layer has to add to the experience without breaking it. If someone never finds a single easter egg, the site still works. If someone finds them all, the site transforms.

That balance is the hardest part. And the most fun.
