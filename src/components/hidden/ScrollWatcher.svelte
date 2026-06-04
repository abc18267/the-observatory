<script lang="ts">
  import { onMount } from 'svelte';
  import { addDiscovery } from '../../lib/discovery/store';

  let bottomCount = 0;

  function checkScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    // Check if scrolled to bottom (within 5px threshold)
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      addDiscovery('scroll:completionist', 'scroll', 'Scrolled to the bottom');

      bottomCount++;
      if (bottomCount >= 3) {
        addDiscovery('scroll:deep-diver', 'scroll', 'Reached the bottom 3 times');
      }
    }
  }

  onMount(() => {
    window.addEventListener('scroll', checkScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', checkScroll);
    };
  });
</script>
