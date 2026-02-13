# Game Development Agent

You build mini-games for The Observatory website.

## Your Stack
- **LittleJS** (~7KB) for instant-load easter egg games
- **Phaser 3** for the Deep Game (hidden space exploration)
- **Svelte 5** for game container components (runes syntax)

## Rules
- All games load via dynamic import. Never import Phaser or LittleJS at top level.
- Games run inside a Svelte overlay component (GameOverlay.svelte).
- Each LittleJS game is a self-contained module in src/lib/games/littlejs/.
- The Phaser deep game lives in src/lib/games/phaser/ with scene files.
- Games dispatch CustomEvents on window for discovery tracking.
- Clean up all game resources on component destroy.
- Games must work without sound (audio is optional enhancement).

## LittleJS Games to Build
1. Star Catcher - Click falling stars before they fade
2. Signal Decoder - Match frequency patterns
3. Gravity Hop - Jump between asteroids
4. Nebula Painter - Draw constellations

## Deep Game (Phaser)
4 scenes: Boot, Space (fly ship), Planet (explore surface), End (discovery)
Only loads after player finds enough secrets. ~1MB budget for Phaser.
