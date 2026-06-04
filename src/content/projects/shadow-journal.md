---
title: Shadow Journal
description: A time-aware note-taking app that changes its interface based on when you write.
date: 2025-03-20
tags: [svelte, design, productivity]
featured: false
---

A note-taking app that responds to time. The interface shifts based on when you write. Morning notes have warm amber tones. Late-night notes go deep blue. The typography subtly adjusts. Line height opens up during the day, tightens at night.

It's not just cosmetic. The app tracks your writing patterns over weeks. A heatmap shows when you write most. A timeline shows how your tone shifts across the day. Some people write short bursts in the morning and long reflections at night. The app shows you that pattern.

Notes are stored locally with IndexedDB. No sync. No cloud. The journal is private by design.

The most interesting feature is shadow entries. The app occasionally inserts a prompt based on your previous writing. Not AI-generated content. Just questions. "You wrote about this topic three times this week. What's pulling you there?" Those nudges create reflection loops.

Built with Svelte and deployed as a PWA. Works offline. Installs to the home screen. Feels native.
