<script lang="ts">
  import { onMount } from 'svelte';
  import { init, addDiscovery } from '../../lib/discovery/store';

  onMount(() => {
    const state = init();
    const count = state.visitCount;

    // Remove any existing visit classes
    document.body.classList.remove('visit-1', 'visit-2', 'visit-3', 'visit-many');

    if (count === 1) {
      document.body.classList.add('visit-1');
    } else if (count === 2) {
      document.body.classList.add('visit-2');
    } else if (count === 3) {
      document.body.classList.add('visit-3');
    } else {
      document.body.classList.add('visit-many');
    }

    if (count >= 3) {
      addDiscovery('visit:returning', 'visit', 'You keep coming back');
    }
  });
</script>
