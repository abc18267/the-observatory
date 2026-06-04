<script lang="ts">
  import { onMount } from 'svelte';
  import { init, addDiscovery } from '../../lib/discovery/store';

  onMount(() => {
    const state = init();
    const count = state.visitCount;

    // Remove any existing visit classes
    document.body.classList.remove(
      'visit-1', 'visit-2', 'visit-3', 'visit-many',
      'visit-frequent', 'visit-resident'
    );

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

    if (count >= 5) {
      document.body.classList.add('visit-frequent');
      addDiscovery('visit:frequent', 'visit', 'Frequent flyer - 5+ visits');
    }

    if (count >= 10) {
      document.body.classList.add('visit-resident');
      addDiscovery('visit:resident', 'visit', 'Resident observer - 10+ visits');
    }

    // Discovery stage classes
    const discoveries = state.discoveries.length;
    document.body.classList.remove('stage-novice', 'stage-explorer', 'stage-seeker');
    if (discoveries >= 15) {
      document.body.classList.add('stage-seeker');
    } else if (discoveries >= 5) {
      document.body.classList.add('stage-explorer');
    } else {
      document.body.classList.add('stage-novice');
    }

    // True explorer meta discovery
    if (discoveries >= 25) {
      addDiscovery('meta:true-explorer', 'meta', 'True explorer - 25+ discoveries');
    }

    // Check constellation master
    const constellations = state.constellations;
    if (
      constellations.includes('orion') &&
      constellations.includes('cassiopeia') &&
      constellations.includes('lyra')
    ) {
      addDiscovery('meta:constellation-master', 'meta', 'All constellations formed');
    }

    // Check game master
    const games = state.gamesCompleted;
    if (
      games.includes('star-catcher') &&
      games.includes('signal-decoder') &&
      games.includes('gravity-hop') &&
      games.includes('nebula-painter')
    ) {
      addDiscovery('meta:game-master', 'meta', 'All mini-games completed');
    }
  });
</script>
