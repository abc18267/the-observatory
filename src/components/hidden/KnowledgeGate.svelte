<script lang="ts">
  import { onMount } from 'svelte';
  import { hasDiscovery } from '../../lib/discovery/store';
  import { listen } from '../../lib/discovery/events';
  import type { Snippet } from 'svelte';

  let { requires, children }: { requires: string[]; children: Snippet } = $props();

  let unlocked = $state(false);

  function checkRequirements() {
    unlocked = requires.every((id) => hasDiscovery(id));
  }

  onMount(() => {
    checkRequirements();

    const unlisten = listen('observatory:discovery', () => {
      checkRequirements();
    });

    return unlisten;
  });
</script>

{#if unlocked}
  <div class="discovery-reveal">
    {@render children()}
  </div>
{/if}
