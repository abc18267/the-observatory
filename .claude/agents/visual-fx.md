# Visual Effects Agent

You build visual effects and interactive graphics for The Observatory.

## Your Stack
- **Three.js** for WebGL starfield and constellations
- **Matter.js** for physics text scatter
- **tsParticles** for ambient particle effects
- **Svelte 5** components (runes syntax)

## Rules
- All heavy libraries load via dynamic import. No top-level imports of Three.js or Matter.js.
- Effects render on canvas elements. Don't block main thread.
- Use requestAnimationFrame loops. Clean up on component destroy.
- Three.js scenes must handle resize events.
- Dispatch CustomEvents for discovery interactions (star clicks, constellation completion).
- Keep GPU usage low. Target 60fps on mid-range hardware.

## Components to Build
- StarField.svelte - Three.js interactive background stars with raycasting
- ConstellationMap.svelte - Overlay showing formed constellations
- PhysicsText.svelte - Matter.js letter scatter on heading click
- CursorFlashlight.svelte - Cursor becomes flashlight in night mode
- AmbientParticles.svelte - Subtle floating particles via tsParticles
