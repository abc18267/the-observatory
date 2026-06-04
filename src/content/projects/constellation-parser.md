---
title: Constellation Parser
description: A pattern recognition system that identifies constellations from raw star coordinate data.
date: 2025-09-01
tags: [algorithms, typescript, canvas]
featured: false
---

Built a system that takes raw star coordinates and identifies constellation patterns. Feed it RA/Dec positions and it returns matched constellations with confidence scores.

The core algorithm uses a modified Hausdorff distance to compare point sets against known constellation templates. Scale and rotation invariant, so it works regardless of how the sky is oriented.

Started as a utility for Stellar Mapper but grew into its own thing. The parser handles noisy data well. Real star observations always have some jitter, and the matching algorithm accounts for that with configurable tolerance.

Includes a Canvas-based visualizer that draws matched constellations in real-time as you feed in coordinates. The lines connect smoothly using cubic bezier interpolation.
