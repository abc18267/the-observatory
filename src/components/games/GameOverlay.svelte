<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  let {
    title,
    open,
    onclose,
    children,
  }: {
    title: string;
    open: boolean;
    onclose: () => void;
    children: Snippet;
  } = $props();

  let visible = $state(false);

  $effect(() => {
    if (open) {
      // Small delay so the CSS transition triggers
      requestAnimationFrame(() => {
        visible = true;
      });
    } else {
      visible = false;
    }
  });

  function close() {
    visible = false;
    // Wait for fade-out before firing callback
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('observatory:game-close'));
      onclose();
    }, 200);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="game-overlay"
    class:game-overlay--visible={visible}
    onkeydown={handleKeydown}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="game-overlay__backdrop" onclick={close}></div>

    <div class="game-overlay__panel" role="dialog" aria-label={title}>
      <div class="game-overlay__header">
        <h2 class="game-overlay__title">{title}</h2>
        <button
          class="game-overlay__close"
          onclick={close}
          aria-label="Close game"
        >
          &times;
        </button>
      </div>

      <div class="game-overlay__content">
        {@render children()}
      </div>
    </div>
  </div>
{/if}

<style>
  .game-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    pointer-events: none;
  }

  .game-overlay--visible {
    opacity: 1;
    pointer-events: auto;
  }

  .game-overlay__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
  }

  .game-overlay__panel {
    position: relative;
    background: #0d1117;
    border: 1px solid rgba(136, 192, 255, 0.2);
    border-radius: 12px;
    overflow: hidden;
    max-width: 440px;
    max-height: 90vh;
    width: 100%;
    box-shadow: 0 0 40px rgba(100, 150, 255, 0.15);
  }

  .game-overlay__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(136, 192, 255, 0.1);
    background: rgba(136, 192, 255, 0.05);
  }

  .game-overlay__title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #c9d1d9;
    letter-spacing: 0.02em;
  }

  .game-overlay__close {
    background: none;
    border: none;
    color: #8b949e;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
    transition: color 0.15s;
  }

  .game-overlay__close:hover {
    color: #f0f0f0;
  }

  .game-overlay__content {
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
