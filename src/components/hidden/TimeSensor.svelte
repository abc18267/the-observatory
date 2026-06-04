<script lang="ts">
  import { onMount } from 'svelte';
  import { isNightTime, getCurrentHour, getTimeOfDay } from '../../lib/utils/time';
  import { emit } from '../../lib/discovery/events';
  import { addDiscovery } from '../../lib/discovery/store';

  let intervalId: ReturnType<typeof setInterval> | null = null;

  const TIME_CLASSES = ['time-dawn', 'time-day', 'time-dusk', 'time-night'];

  function checkTime() {
    const night = isNightTime();
    const hour = getCurrentHour();
    const tod = getTimeOfDay();

    // Toggle night mode class
    if (night) {
      document.documentElement.classList.add('night-mode');
    } else {
      document.documentElement.classList.remove('night-mode');
    }

    // Set time-of-day class on <html>
    TIME_CLASSES.forEach((c) => document.documentElement.classList.remove(c));
    document.documentElement.classList.add(`time-${tod}`);

    // Night visitor discovery
    if (night) {
      addDiscovery('time:night-visitor', 'time', 'Visited during the night');
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
