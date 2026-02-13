<script lang="ts">
  import { onMount } from 'svelte';
  import { addDiscovery } from '../../lib/discovery/store';

  let { text }: { text: string } = $props();

  let containerEl: HTMLDivElement | undefined = $state();
  let canvasEl: HTMLCanvasElement | undefined = $state();
  let scattered = $state(false);
  let showCanvas = $state(false);

  // Store the positions of each letter in the original layout
  let letterSpans: HTMLSpanElement[] = [];

  interface LetterData {
    char: string;
    originalX: number;
    originalY: number;
    width: number;
    height: number;
  }

  let engine: any = null;
  let render: any = null;
  let runner: any = null;
  let reassembleTimeout: ReturnType<typeof setTimeout> | null = null;

  async function scatter() {
    if (scattered || !containerEl || !canvasEl) return;
    scattered = true;

    addDiscovery('physics:first-scatter', 'physics', 'Text went boom');

    const Matter = await import('matter-js');
    const { Engine, Render, Runner, Bodies, Composite, Body } = Matter.default || Matter;

    // Measure each letter's position
    const letters: LetterData[] = [];
    const containerRect = containerEl.getBoundingClientRect();

    for (const span of letterSpans) {
      const rect = span.getBoundingClientRect();
      letters.push({
        char: span.textContent || '',
        originalX: rect.left - containerRect.left + rect.width / 2,
        originalY: rect.top - containerRect.top + rect.height / 2,
        width: Math.max(rect.width, 10),
        height: Math.max(rect.height, 20),
      });
    }

    // Set canvas size to match container
    const canvasWidth = containerRect.width;
    const canvasHeight = Math.max(containerRect.height * 3, 300);
    canvasEl.width = canvasWidth;
    canvasEl.height = canvasHeight;

    showCanvas = true;

    // Create engine
    engine = Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
    });

    // Create renderer
    render = Render.create({
      canvas: canvasEl,
      engine: engine,
      options: {
        width: canvasWidth,
        height: canvasHeight,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio || 1,
      },
    });

    // Create walls
    const wallThickness = 50;
    const walls = [
      // Floor
      Bodies.rectangle(canvasWidth / 2, canvasHeight + wallThickness / 2, canvasWidth + 100, wallThickness, {
        isStatic: true,
        render: { visible: false },
      }),
      // Left wall
      Bodies.rectangle(-wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight * 2, {
        isStatic: true,
        render: { visible: false },
      }),
      // Right wall
      Bodies.rectangle(canvasWidth + wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight * 2, {
        isStatic: true,
        render: { visible: false },
      }),
    ];

    Composite.add(engine.world, walls);

    // Create letter bodies
    const letterBodies: any[] = [];

    for (const letter of letters) {
      if (letter.char.trim() === '') continue;

      const body = Bodies.rectangle(
        letter.originalX,
        letter.originalY,
        letter.width,
        letter.height,
        {
          restitution: 0.6,
          friction: 0.1,
          render: {
            visible: false,
          },
        }
      );

      // Give a random initial velocity for the scatter effect
      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 10,
        y: -(Math.random() * 5 + 2),
      });

      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);

      letterBodies.push(body);
      Composite.add(engine.world, body);
    }

    // Custom render loop for letters
    const ctx = canvasEl.getContext('2d')!;
    const fontSize = parseFloat(getComputedStyle(containerEl).fontSize) || 16;
    const fontFamily = getComputedStyle(containerEl).fontFamily || 'sans-serif';
    const fillColor = getComputedStyle(containerEl).color || '#c9d1d9';

    let animFrame: number;
    let visibleLetters = letters.filter((l) => l.char.trim() !== '');

    function renderLoop() {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = fillColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < letterBodies.length; i++) {
        const body = letterBodies[i];
        const letter = visibleLetters[i];
        if (!letter) continue;

        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);
        ctx.fillText(letter.char, 0, 0);
        ctx.restore();
      }

      animFrame = requestAnimationFrame(renderLoop);
    }

    runner = Runner.create();
    Runner.run(runner, engine);
    renderLoop();

    // After 3 seconds, reassemble
    reassembleTimeout = setTimeout(() => {
      // Stop physics
      Runner.stop(runner);

      // Animate back to original positions
      const duration = 800;
      const startTime = performance.now();
      const startPositions = letterBodies.map((b: any) => ({
        x: b.position.x,
        y: b.position.y,
        angle: b.angle,
      }));

      function reassembleFrame(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = fillColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < letterBodies.length; i++) {
          const start = startPositions[i];
          const target = visibleLetters[i];
          if (!start || !target) continue;

          const x = start.x + (target.originalX - start.x) * eased;
          const y = start.y + (target.originalY - start.y) * eased;
          const angle = start.angle * (1 - eased);

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.fillText(target.char, 0, 0);
          ctx.restore();
        }

        if (progress < 1) {
          animFrame = requestAnimationFrame(reassembleFrame);
        } else {
          // Done. Clean up and show the text again
          cancelAnimationFrame(animFrame);
          cleanup();
          showCanvas = false;
          scattered = false;
        }
      }

      cancelAnimationFrame(animFrame);
      requestAnimationFrame(reassembleFrame);
    }, 3000);
  }

  function cleanup() {
    if (reassembleTimeout) {
      clearTimeout(reassembleTimeout);
      reassembleTimeout = null;
    }

    if (runner) {
      const Matter = (window as any).__matterCleanupRef;
      if (Matter) {
        Matter.Runner.stop(runner);
      }
      runner = null;
    }

    if (render) {
      try {
        const Matter = (window as any).__matterCleanupRef;
        if (Matter) {
          Matter.Render.stop(render);
        }
      } catch {
        // ignore
      }
      render = null;
    }

    if (engine) {
      try {
        const Matter = (window as any).__matterCleanupRef;
        if (Matter) {
          Matter.Engine.clear(engine);
        }
      } catch {
        // ignore
      }
      engine = null;
    }
  }

  onMount(() => {
    // Store Matter reference for cleanup
    import('matter-js').then((Matter) => {
      (window as any).__matterCleanupRef = Matter.default || Matter;
    });

    return () => {
      cleanup();
      delete (window as any).__matterCleanupRef;
    };
  });

</script>

<div bind:this={containerEl} class="physics-text-container">
  {#if !showCanvas}
    <span
      class="physics-text"
      role="button"
      tabindex="0"
      onclick={scatter}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          scatter();
        }
      }}
    >
      {#each text.split('') as char, i}
        <span bind:this={letterSpans[i]} class="physics-letter">{char}</span>
      {/each}
    </span>
  {/if}
  <canvas
    bind:this={canvasEl}
    class="physics-canvas"
    class:visible={showCanvas}
  ></canvas>
</div>

<style>
  .physics-text-container {
    position: relative;
    display: inline-block;
  }

  .physics-text {
    cursor: pointer;
    display: inline;
  }

  .physics-letter {
    display: inline;
  }

  .physics-canvas {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .physics-canvas.visible {
    opacity: 1;
  }
</style>
