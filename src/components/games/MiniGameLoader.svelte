<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import GameOverlay from './GameOverlay.svelte';

  let { gameId }: { gameId: string } = $props();

  let isOpen = $state(false);
  let canvasEl: HTMLCanvasElement | undefined = $state(undefined);
  let cleanup: (() => void) | null = null;
  let gameName = $derived(formatGameName(gameId));

  function formatGameName(id: string): string {
    // Convert kebab-case to Title Case (e.g. "star-catcher" -> "Star Catcher")
    return id
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  type GameModule = {
    init: (
      canvas: HTMLCanvasElement,
      onComplete: (score: number) => void,
    ) => (() => void) | void;
  };

  const gameModules: Record<string, () => Promise<GameModule>> = {
    'star-catcher': () => import('../../lib/games/littlejs/starCatcher.ts'),
    'signal-decoder': () => import('../../lib/games/littlejs/signalDecoder.ts'),
    'gravity-hop': () => import('../../lib/games/littlejs/gravityHop.ts'),
    'nebula-painter': () => import('../../lib/games/littlejs/nebulaPainter.ts'),
  };

  async function handleComplete(score: number) {
    const { addGameComplete } = await import('../../lib/discovery/store');
    addGameComplete(gameId, score);
  }

  async function startGame() {
    isOpen = true;

    // Wait for the canvas to mount
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    if (!canvasEl) return;

    const loader = gameModules[gameId];
    if (!loader) {
      console.warn(`Unknown game: ${gameId}`);
      return;
    }

    try {
      const mod = await loader();
      const result = mod.init(canvasEl, (score: number) => {
        handleComplete(score);
      });
      if (typeof result === 'function') {
        cleanup = result;
      }
    } catch (err) {
      console.error(`Failed to load game ${gameId}:`, err);
    }
  }

  function handleClose() {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    isOpen = false;
  }

  function onWordTrigger(e: Event) {
    const detail = (e as CustomEvent<{ gameId: string }>).detail;
    if (detail.gameId === gameId) {
      startGame();
    }
  }

  onMount(() => {
    window.addEventListener('observatory:word-trigger', onWordTrigger);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('observatory:word-trigger', onWordTrigger);
    }
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  });
</script>

<GameOverlay title={gameName} open={isOpen} onclose={handleClose}>
  <canvas
    bind:this={canvasEl}
    width="400"
    height="600"
    style="display: block; border-radius: 8px; background: #000;"
  ></canvas>
</GameOverlay>
