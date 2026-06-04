---
title: Frequency Garden
description: A generative audio garden where plants grow from synthesized frequencies using Tone.js.
date: 2025-07-15
tags: [audio, tone-js, generative]
featured: false
---

An experiment in generative audio-visual art. You plant seeds on a canvas. Each seed grows into a plant that produces sound. The frequency, timbre, and rhythm are determined by the plant's position and neighbors.

Built with Tone.js for audio synthesis and Canvas for the visuals. Each plant is a simple oscillator with an ADSR envelope. Plants near each other harmonize. Plants far apart create dissonance. The garden finds its own sound.

The growth algorithm uses L-systems. Each plant type has a grammar that determines its branching pattern. Stems, leaves, and flowers all generate from the same recursive rule set.

The most interesting part is the emergent behavior. Plant a cluster in one corner and a single plant across the garden. The cluster creates a chord. The lone plant creates a melody line. Together they make something that sounds almost composed. But it's not. It's just math and proximity.
