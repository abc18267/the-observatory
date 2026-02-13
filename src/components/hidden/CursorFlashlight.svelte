<script lang="ts">
  import { onMount } from 'svelte';
  import { isNightTime } from '../../lib/utils/time';
  import { addDiscovery } from '../../lib/discovery/store';

  let active = $state(false);
  let mouseX = $state(0);
  let mouseY = $state(0);
  let overlay: HTMLDivElement | undefined = $state();

  function handleMouseMove(e: MouseEvent) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  onMount(() => {
    function checkNight() {
      const wasActive = active;
      active = isNightTime();

      if (active && !wasActive) {
        addDiscovery('night:flashlight', 'time', 'Night vision activated');
      }
    }

    checkNight();

    // Listen for time change events
    function onTimeChange() {
      checkNight();
    }
    window.addEventListener('observatory:time-change', onTimeChange);

    // Also check periodically in case events don't fire
    const intervalId = setInterval(checkNight, 30_000);

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('observatory:time-change', onTimeChange);
      clearInterval(intervalId);
    };
  });

  let maskStyle = $derived(
    `--flash-x: ${mouseX}px; --flash-y: ${mouseY}px;`
  );
</script>

{#if active}
  <div
    bind:this={overlay}
    class="flashlight-overlay"
    style={maskStyle}
  ></div>
{/if}

<style>
  .flashlight-overlay {
    position: fixed;
    inset: 0;
    z-index: 9998;
    pointer-events: none;
    background: radial-gradient(
      circle 300px at var(--flash-x, 50%) var(--flash-y, 50%),
      transparent 0%,
      transparent 40%,
      rgba(0, 0, 0, 0.85) 100%
    );
    transition: opacity 0.3s ease;
  }
</style>
