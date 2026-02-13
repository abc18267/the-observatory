<script lang="ts">
  import { onMount } from 'svelte';
  import { startLoopTimer, stopLoopTimer } from '../../lib/utils/loop';
  import { incrementLoop } from '../../lib/discovery/store';

  onMount(() => {
    startLoopTimer(() => {
      incrementLoop();
      document.body.classList.add('loop-reset');

      // Remove the animation class after it plays
      setTimeout(() => {
        document.body.classList.remove('loop-reset');
      }, 2000);
    });

    return () => {
      stopLoopTimer();
    };
  });
</script>
