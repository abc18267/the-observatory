<script lang="ts">
  import { onMount } from 'svelte';
  import { toggleAudio, getState } from '../../lib/discovery/store';
  import { listen } from '../../lib/discovery/events';

  let enabled = $state(false);
  let animating = $state(false);

  function handleClick() {
    toggleAudio();
  }

  onMount(() => {
    enabled = getState().audioEnabled;

    const unlisten = listen('observatory:audio-toggle', (detail) => {
      enabled = detail.enabled;

      // Trigger a short animation pulse
      animating = true;
      setTimeout(() => {
        animating = false;
      }, 400);
    });

    return unlisten;
  });
</script>

<button
  type="button"
  onclick={handleClick}
  class="audio-toggle"
  class:is-animating={animating}
  aria-label={enabled ? 'Mute audio' : 'Unmute audio'}
  title={enabled ? 'Mute audio' : 'Unmute audio'}
>
  {#if enabled}
    <!-- Speaker unmuted icon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  {:else}
    <!-- Speaker muted icon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  {/if}
</button>

<style>
  .audio-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border: 1px solid var(--color-nebula-600);
    border-radius: 8px;
    background: transparent;
    color: var(--color-nebula-400);
    cursor: pointer;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      transform 0.2s ease;
  }

  .audio-toggle:hover {
    color: var(--color-star-gold);
    border-color: var(--color-star-gold);
  }

  .audio-toggle:active {
    transform: scale(0.92);
  }

  .audio-toggle.is-animating {
    animation: toggle-pulse 0.4s var(--ease-out-expo);
  }

  @keyframes toggle-pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-star-gold), transparent 60%);
    }
    50% {
      transform: scale(1.12);
      box-shadow: 0 0 12px 4px color-mix(in srgb, var(--color-star-gold), transparent 80%);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 transparent;
    }
  }
</style>
