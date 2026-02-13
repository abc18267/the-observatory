<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let canAccess = $state(false);
  let isLoading = $state(false);
  let isActive = $state(false);
  let containerEl: HTMLDivElement | undefined = $state(undefined);
  let phaserGame: unknown = null;

  function handleGameClose() {
    destroyPhaser();
  }

  onMount(async () => {
    const { canAccessDeepGame } = await import('../../lib/discovery/store');
    canAccess = canAccessDeepGame();

    // Re-check when discoveries change
    window.addEventListener('observatory:state-change', handleStateChange);
    // Listen for close event from EndScene
    window.addEventListener('observatory:game-close', handleGameClose);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('observatory:state-change', handleStateChange);
      window.removeEventListener('observatory:game-close', handleGameClose);
    }
    destroyPhaser();
  });

  function handleStateChange() {
    import('../../lib/discovery/store').then(({ canAccessDeepGame }) => {
      canAccess = canAccessDeepGame();
    });
  }

  async function launchGame() {
    if (isLoading || isActive) return;
    isLoading = true;

    try {
      const Phaser = await import('phaser');
      const { default: BootScene } = await import('../../lib/games/phaser/bootScene');
      const { default: SpaceScene } = await import('../../lib/games/phaser/spaceScene');
      const { default: PlanetScene } = await import('../../lib/games/phaser/planetScene');
      const { default: EndScene } = await import('../../lib/games/phaser/endScene');

      // Wait for container to mount
      await new Promise((r) => requestAnimationFrame(r));
      if (!containerEl) return;

      isActive = true;
      isLoading = false;

      phaserGame = new Phaser.default.Game({
        type: Phaser.default.AUTO,
        width: 800,
        height: 600,
        parent: containerEl,
        backgroundColor: '#060612',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
        scene: [BootScene, SpaceScene, PlanetScene, EndScene],
        scale: {
          mode: Phaser.default.Scale.FIT,
          autoCenter: Phaser.default.Scale.CENTER_BOTH,
        },
      });
    } catch (err) {
      console.error('Failed to load Phaser game:', err);
      isLoading = false;
    }
  }

  function destroyPhaser() {
    if (phaserGame && typeof (phaserGame as { destroy: (b: boolean) => void }).destroy === 'function') {
      (phaserGame as { destroy: (b: boolean) => void }).destroy(true);
      phaserGame = null;
    }
    isActive = false;
  }

  function closeGame() {
    destroyPhaser();
  }
</script>

{#if canAccess}
  <div class="deep-game">
    {#if !isActive}
      <button
        class="deep-game__portal"
        onclick={launchGame}
        disabled={isLoading}
      >
        {#if isLoading}
          <span class="deep-game__loading">
            <span class="deep-game__spinner"></span>
            Loading deep space...
          </span>
        {:else}
          <span class="deep-game__icon">&#10059;</span>
          <span class="deep-game__label">A mysterious portal shimmers...</span>
        {/if}
      </button>
    {:else}
      <div class="deep-game__wrapper">
        <button class="deep-game__close" onclick={closeGame} aria-label="Close game">
          &times; Return to Observatory
        </button>
        <div class="deep-game__container" bind:this={containerEl}></div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .deep-game {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 0;
  }

  .deep-game__portal {
    background: radial-gradient(ellipse at center, rgba(100, 50, 200, 0.3), transparent 70%);
    border: 1px solid rgba(150, 100, 255, 0.3);
    border-radius: 50%;
    width: 180px;
    height: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #c9b8ff;
    font-family: monospace;
    font-size: 0.85rem;
    transition: all 0.3s ease;
    animation: portalPulse 3s ease-in-out infinite;
  }

  .deep-game__portal:hover {
    border-color: rgba(150, 100, 255, 0.6);
    box-shadow: 0 0 40px rgba(150, 100, 255, 0.3);
    transform: scale(1.05);
  }

  .deep-game__portal:disabled {
    cursor: wait;
    opacity: 0.7;
  }

  .deep-game__icon {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .deep-game__label {
    text-align: center;
    padding: 0 1rem;
    line-height: 1.3;
  }

  .deep-game__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .deep-game__spinner {
    display: block;
    width: 24px;
    height: 24px;
    border: 2px solid rgba(150, 100, 255, 0.3);
    border-top-color: #c9b8ff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .deep-game__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
    max-width: 820px;
  }

  .deep-game__close {
    background: rgba(150, 100, 255, 0.15);
    border: 1px solid rgba(150, 100, 255, 0.3);
    border-radius: 8px;
    padding: 8px 16px;
    color: #c9b8ff;
    font-family: monospace;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .deep-game__close:hover {
    background: rgba(150, 100, 255, 0.25);
    border-color: rgba(150, 100, 255, 0.5);
  }

  .deep-game__container {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(150, 100, 255, 0.2);
    box-shadow: 0 0 40px rgba(100, 50, 200, 0.2);
  }

  .deep-game__container :global(canvas) {
    display: block;
    width: 100%;
    height: auto;
  }

  @keyframes portalPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(150, 100, 255, 0.15); }
    50% { box-shadow: 0 0 40px rgba(150, 100, 255, 0.3); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
