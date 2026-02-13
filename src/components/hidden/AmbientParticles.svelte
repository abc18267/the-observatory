<script lang="ts">
  import { onMount } from 'svelte';
  import { discoveryCount } from '../../lib/discovery/store';
  import { listen } from '../../lib/discovery/events';

  let container: HTMLDivElement | undefined = $state();
  let particlesInstance: any = null;

  onMount(() => {
    let destroyed = false;

    async function initParticles() {
      const { tsParticles } = await import('@tsparticles/engine');
      const { loadSlim } = await import('@tsparticles/slim');
      await loadSlim(tsParticles);

      if (destroyed || !container) return;

      const count = discoveryCount();
      const baseCount = 20;
      const bonusCount = Math.min(count * 3, 40);

      particlesInstance = await tsParticles.load({
        element: container,
        options: {
          fullScreen: false,
          fpsLimit: 60,
          particles: {
            number: {
              value: baseCount + bonusCount,
            },
            color: {
              value: ['#ffffff', '#60a5fa', '#a78bfa', '#fbbf24'],
            },
            opacity: {
              value: { min: 0.1, max: 0.3 },
              animation: {
                enable: true,
                speed: 0.3,
                startValue: 'random',
                sync: false,
              },
            },
            size: {
              value: { min: 1, max: 3 },
            },
            move: {
              enable: true,
              speed: 0.2,
              direction: 'none' as const,
              random: true,
              straight: false,
              outModes: {
                default: 'bounce' as const,
              },
            },
            shape: {
              type: 'circle',
            },
          },
          detectRetina: true,
        },
      });
    }

    initParticles();

    // Update particle count when discoveries change
    const unlisten = listen('observatory:state-change', async () => {
      if (particlesInstance && !destroyed) {
        const count = discoveryCount();
        const baseCount = 20;
        const bonusCount = Math.min(count * 3, 40);
        const newTotal = baseCount + bonusCount;

        // Update the particle count
        const currentOptions = particlesInstance.options;
        if (currentOptions && currentOptions.particles) {
          currentOptions.particles.number.value = newTotal;
          await particlesInstance.refresh();
        }
      }
    });

    return () => {
      destroyed = true;
      unlisten();
      if (particlesInstance) {
        particlesInstance.destroy();
        particlesInstance = null;
      }
    };
  });
</script>

<div bind:this={container} class="ambient-particles"></div>

<style>
  .ambient-particles {
    position: fixed;
    inset: 0;
    z-index: -2;
    pointer-events: none;
  }
</style>
