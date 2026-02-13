<script lang="ts">
  import { onMount } from 'svelte';
  import { isNightTime, getCurrentHour } from '../../lib/utils/time';
  import { emit } from '../../lib/discovery/events';

  let intervalId: ReturnType<typeof setInterval> | null = null;

  function checkTime() {
    const night = isNightTime();
    const hour = getCurrentHour();

    if (night) {
      document.documentElement.classList.add('night-mode');
    } else {
      document.documentElement.classList.remove('night-mode');
    }

    emit('observatory:time-change', { isNight: night, hour });
  }

  onMount(() => {
    checkTime();
    intervalId = setInterval(checkTime, 60_000);

    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  });
</script>
