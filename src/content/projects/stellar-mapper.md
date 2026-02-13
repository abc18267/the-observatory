---
title: Stellar Mapper
description: A real-time star chart that tracks satellite positions and lets you plan observation sessions.
date: 2025-11-15
tags: [webgl, typescript, api]
featured: true
url: https://example.com/stellar-mapper
---

Built a real-time star chart using WebGL. It pulls satellite TLE data from CelesTrak and renders orbital paths overlaid on a zoomable sky map.

The trickiest part was getting the coordinate transforms right. Converting between ECEF, ECI, and topocentric frames meant a lot of math and a lot of test cases.

Users can set their location and see what's passing overhead tonight. The app predicts visible passes for the next 7 days and sends push notifications 5 minutes before a bright satellite crosses the sky.
