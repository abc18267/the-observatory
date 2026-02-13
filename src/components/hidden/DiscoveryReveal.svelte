<script lang="ts">
  import { onMount } from 'svelte';
  import { hasDiscovery } from '../../lib/discovery/store';
  import { listen } from '../../lib/discovery/events';
  import type { Snippet } from 'svelte';

  let {
    discoveryId,
    children,
  }: {
    discoveryId: string;
    children: Snippet;
  } = $props();

  let visible = $state(false);
  let animate = $state(false);

  onMount(() => {
    // Check if already discovered on mount
    if (hasDiscovery(discoveryId)) {
      visible = true;
      animate = false;
      return;
    }

    // Listen for new discoveries
    const unlisten = listen('observatory:discovery', (detail) => {
      if (detail.id === discoveryId && !visible) {
        visible = true;
        animate = true;
      }
    });

    return unlisten;
  });
</script>

{#if visible}
  <div class={animate ? 'discovery-reveal' : ''}>
    {@render children()}
  </div>
{/if}
