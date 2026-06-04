---
title: The 22-Minute Universe
description: How Outer Wilds inspired a time loop on my portfolio site, and what I learned building it.
date: 2026-01-15
tags: [process, game-design, experiments]
---

Outer Wilds has a 22-minute loop. The sun explodes. Everything resets. But you keep what you learned. It's one of the best mechanics in gaming.

I wanted that feeling on my portfolio site.

## The Loop

Every 22 minutes, the site resets. Not your data. Just the atmosphere. A subtle brightness pulse. The starfield shifts. The ambient music restarts from a different seed.

Nothing breaks. Nothing is lost. But if you're paying attention, you feel it.

The timer runs in the background. It uses `setInterval` at the session level. When it fires, it dispatches a custom event. Every component that cares about the loop listens for that event and responds in its own way.

## Why 22 Minutes

Outer Wilds uses 22 minutes because it's long enough to explore but short enough to feel urgent. For a website, urgency doesn't matter. But the rhythm does.

Most website sessions last 2-5 minutes. If you're still here after 22, you're exploring. You're curious. The loop is a reward for that curiosity. A wink from the site that says "I noticed you're still here."

## What Persists

Everything you discover persists in localStorage. Stars you clicked. Constellations you formed. Games you completed. Terminal commands you ran. The site remembers all of it across visits and loops.

This was a core design decision. The loop resets the surface. Your knowledge stays.

## The Hard Part

The hard part wasn't the timer. That's just `setInterval`. The hard part was making the reset feel meaningful without being annoying.

Early versions were too dramatic. Screen flickers. Color inversions. It felt like a bug, not a feature. I stripped it back to a gentle brightness pulse and a starfield regeneration. Barely noticeable unless you're looking for it.

## What I Learned

Build things that reward attention. Most websites treat users like billboards treat drivers. Drive by. Glance. Leave. A time loop says "stick around. There's more." And there always is.
