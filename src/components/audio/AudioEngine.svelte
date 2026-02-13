<script lang="ts">
  import { onMount } from 'svelte';
  import { getState, discoveryCount } from '../../lib/discovery/store';
  import { listen } from '../../lib/discovery/events';

  let audioReady = $state(false);
  let generative: typeof import('../../lib/audio/generative') | null = $state(null);
  let sfx: typeof import('../../lib/audio/sfx') | null = $state(null);

  async function initAudio() {
    if (audioReady) return;

    try {
      const [genModule, sfxModule] = await Promise.all([
        import('../../lib/audio/generative'),
        import('../../lib/audio/sfx'),
      ]);

      generative = genModule;
      sfx = sfxModule;

      sfx.init();
      await generative.init();

      // Set initial layer count
      generative.updateLayers(discoveryCount());

      // Start playing if audio is already enabled in state
      if (getState().audioEnabled) {
        generative.start();
      }

      audioReady = true;
    } catch {
      // Audio init failed. Not critical, just skip.
    }
  }

  onMount(() => {
    // Web Audio API requires a user gesture before it can play.
    // Listen for the first click or tap on the document.
    let gestureReceived = false;

    function onUserGesture() {
      if (gestureReceived) return;
      gestureReceived = true;

      document.removeEventListener('click', onUserGesture);
      document.removeEventListener('touchstart', onUserGesture);
      document.removeEventListener('keydown', onUserGesture);

      initAudio();
    }

    document.addEventListener('click', onUserGesture);
    document.addEventListener('touchstart', onUserGesture);
    document.addEventListener('keydown', onUserGesture);

    // Listen for audio toggle events
    const unlistenToggle = listen('observatory:audio-toggle', (detail) => {
      if (!audioReady || !generative) return;

      if (detail.enabled) {
        generative.start();
      } else {
        generative.stop();
      }
    });

    // Listen for discoveries to update layers and play SFX
    const unlistenDiscovery = listen('observatory:discovery', () => {
      if (!audioReady) return;

      generative?.updateLayers(discoveryCount());
      sfx?.play('discovery');
    });

    // Listen for star clicks
    function onStarClick() {
      sfx?.play('starClick');
    }
    window.addEventListener('observatory:star-click', onStarClick);

    // Listen for game events
    const unlistenGameComplete = listen('observatory:game-complete', () => {
      sfx?.play('gameEnd');
    });

    // Listen for terminal commands
    const unlistenTerminal = listen('observatory:terminal-command', () => {
      sfx?.play('terminalOpen');
    });

    // Custom events for game start (not in the typed event map, use raw listener)
    function onGameStart() {
      sfx?.play('gameStart');
    }
    window.addEventListener('observatory:game-start', onGameStart);

    // Cleanup
    return () => {
      document.removeEventListener('click', onUserGesture);
      document.removeEventListener('touchstart', onUserGesture);
      document.removeEventListener('keydown', onUserGesture);
      window.removeEventListener('observatory:star-click', onStarClick);
      window.removeEventListener('observatory:game-start', onGameStart);

      unlistenToggle();
      unlistenDiscovery();
      unlistenGameComplete();
      unlistenTerminal();

      generative?.dispose();
      sfx?.dispose();
    };
  });
</script>

<!-- AudioEngine is invisible. It manages audio lifecycle only. -->
