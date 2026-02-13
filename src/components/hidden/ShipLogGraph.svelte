<script lang="ts">
  import { onMount } from 'svelte';
  import { getState } from '../../lib/discovery/store';
  import { listen } from '../../lib/discovery/events';
  import {
    getNodes,
    getDiscoveredNodes,
    getHintableNodes,
    getProgress,
    type KnowledgeNode,
  } from '../../lib/discovery/knowledgeGraph';

  let canvas: HTMLCanvasElement | undefined = $state();
  let selectedNode: KnowledgeNode | null = $state(null);
  let discoveries: string[] = $state([]);
  let progress = $derived(getProgress(discoveries));

  // Layout positions for each node (computed once on mount)
  interface NodePosition {
    node: KnowledgeNode;
    x: number;
    y: number;
  }

  let positions: NodePosition[] = [];

  // Canvas dimensions
  const WIDTH = 700;
  const HEIGHT = 500;
  const CENTER_X = WIDTH / 2;
  const CENTER_Y = HEIGHT / 2;
  const NODE_RADIUS = 18;

  // Colors matching the theme
  const COLOR_GOLD = '#fbbf24';
  const COLOR_DIM = '#30363d';
  const COLOR_HINT = '#484f58';
  const COLOR_LINE = '#21262d';
  const COLOR_LINE_DISCOVERED = '#484f58';
  const COLOR_BG = '#0a0a0f';
  const COLOR_TEXT = '#c9d1d9';
  const COLOR_TEXT_DIM = '#8b949e';

  function computeRadialLayout(): NodePosition[] {
    const nodes = getNodes();
    const result: NodePosition[] = [];

    // Group nodes by category for organized radial placement
    const categories = ['star', 'constellation', 'game', 'terminal', 'loop', 'visit', 'meta'];
    const grouped: Record<string, KnowledgeNode[]> = {};
    for (const cat of categories) {
      grouped[cat] = nodes.filter((n) => n.category === cat);
    }

    const activeCats = categories.filter((c) => (grouped[c]?.length ?? 0) > 0);
    const catCount = activeCats.length;

    let catIndex = 0;
    for (const cat of activeCats) {
      const catNodes = grouped[cat];
      if (!catNodes || catNodes.length === 0) continue;

      // Angle range for this category
      const catAngleStart = (catIndex / catCount) * Math.PI * 2 - Math.PI / 2;
      const catAngleSpan = (1 / catCount) * Math.PI * 2;

      for (let i = 0; i < catNodes.length; i++) {
        const angle = catAngleStart + ((i + 0.5) / catNodes.length) * catAngleSpan;
        // Vary radius a bit based on index
        const radius = 140 + (i % 2) * 40;

        result.push({
          node: catNodes[i],
          x: CENTER_X + Math.cos(angle) * radius,
          y: CENTER_Y + Math.sin(angle) * radius,
        });
      }

      catIndex++;
    }

    return result;
  }

  function getNodePosition(nodeId: string): NodePosition | undefined {
    return positions.find((p) => p.node.id === nodeId);
  }

  function isDiscovered(nodeId: string): boolean {
    return discoveries.includes(nodeId);
  }

  function isHintable(nodeId: string): boolean {
    const hintable = getHintableNodes(discoveries);
    return hintable.some((n) => n.id === nodeId);
  }

  function draw(): void {
    if (!canvas) return;
    const c = canvas.getContext('2d');
    if (!c) return;

    // Handle device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    c.scale(dpr, dpr);

    // Clear
    c.fillStyle = COLOR_BG;
    c.fillRect(0, 0, WIDTH, HEIGHT);

    // Draw connection lines first (behind nodes)
    for (const pos of positions) {
      const node = pos.node;

      // Draw lines to required nodes
      for (const reqId of node.requires) {
        const reqPos = getNodePosition(reqId);
        if (!reqPos) continue;

        const bothDiscovered = isDiscovered(node.id) && isDiscovered(reqId);

        c.beginPath();
        c.moveTo(pos.x, pos.y);
        c.lineTo(reqPos.x, reqPos.y);
        c.strokeStyle = bothDiscovered ? COLOR_LINE_DISCOVERED : COLOR_LINE;
        c.lineWidth = bothDiscovered ? 1.5 : 0.8;

        // Dashed lines for undiscovered connections
        if (!bothDiscovered) {
          c.setLineDash([4, 6]);
        } else {
          c.setLineDash([]);
        }

        c.stroke();
        c.setLineDash([]);
      }

      // Draw lines to unlocked nodes
      for (const unlockId of node.unlocks) {
        const unlockPos = getNodePosition(unlockId);
        if (!unlockPos) continue;

        const bothDiscovered = isDiscovered(node.id) && isDiscovered(unlockId);

        c.beginPath();
        c.moveTo(pos.x, pos.y);
        c.lineTo(unlockPos.x, unlockPos.y);
        c.strokeStyle = bothDiscovered ? COLOR_LINE_DISCOVERED : COLOR_LINE;
        c.lineWidth = bothDiscovered ? 1.5 : 0.8;

        if (!bothDiscovered) {
          c.setLineDash([4, 6]);
        } else {
          c.setLineDash([]);
        }

        c.stroke();
        c.setLineDash([]);
      }
    }

    // Draw nodes
    for (const pos of positions) {
      const discovered = isDiscovered(pos.node.id);
      const hintable = isHintable(pos.node.id);
      const isSelected = selectedNode?.id === pos.node.id;

      c.beginPath();
      c.arc(pos.x, pos.y, NODE_RADIUS, 0, Math.PI * 2);

      if (discovered) {
        // Bright filled node with glow
        c.fillStyle = COLOR_GOLD;
        c.shadowColor = COLOR_GOLD;
        c.shadowBlur = isSelected ? 16 : 8;
        c.fill();
        c.shadowBlur = 0;
      } else if (hintable) {
        // Dim outlined node
        c.fillStyle = COLOR_DIM;
        c.fill();
        c.strokeStyle = COLOR_HINT;
        c.lineWidth = 1.5;
        c.stroke();
      } else {
        // Very dim node
        c.fillStyle = COLOR_DIM;
        c.globalAlpha = 0.4;
        c.fill();
        c.globalAlpha = 1;
      }

      // Selected ring
      if (isSelected) {
        c.beginPath();
        c.arc(pos.x, pos.y, NODE_RADIUS + 4, 0, Math.PI * 2);
        c.strokeStyle = discovered ? COLOR_GOLD : COLOR_HINT;
        c.lineWidth = 2;
        c.stroke();
      }

      // Label
      c.font = '11px system-ui, sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';

      if (discovered) {
        c.fillStyle = COLOR_BG;
        // Short abbreviation inside the circle
        const abbr = pos.node.label.substring(0, 2).toUpperCase();
        c.fillText(abbr, pos.x, pos.y);

        // Full label below the node
        c.fillStyle = COLOR_TEXT;
        c.font = '10px system-ui, sans-serif';
        c.fillText(pos.node.label, pos.x, pos.y + NODE_RADIUS + 14);
      } else if (hintable) {
        c.fillStyle = COLOR_TEXT_DIM;
        c.font = '14px system-ui, sans-serif';
        c.fillText('?', pos.x, pos.y);
      }
    }
  }

  function handleCanvasClick(e: MouseEvent) {
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    // Find clicked node
    let clicked: KnowledgeNode | null = null;
    for (const pos of positions) {
      const dx = mx - pos.x;
      const dy = my - pos.y;
      if (dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS) {
        clicked = pos.node;
        break;
      }
    }

    if (clicked) {
      // Toggle selection
      selectedNode = selectedNode?.id === clicked.id ? null : clicked;
    } else {
      selectedNode = null;
    }

    draw();
  }

  onMount(() => {
    discoveries = getState().discoveries;
    positions = computeRadialLayout();
    draw();

    const unlistenDiscovery = listen('observatory:discovery', () => {
      discoveries = getState().discoveries;
      draw();
    });

    const unlistenState = listen('observatory:state-change', (detail) => {
      discoveries = detail.discoveries;
      draw();
    });

    // Redraw on resize for sharp rendering
    function onResize() {
      draw();
    }
    window.addEventListener('resize', onResize);

    return () => {
      unlistenDiscovery();
      unlistenState();
      window.removeEventListener('resize', onResize);
    };
  });
</script>

<div class="ship-log-container">
  <div class="ship-log-header">
    <h2 class="ship-log-title">Ship Log</h2>
    <span class="ship-log-progress">{progress}% explored</span>
  </div>

  <div class="ship-log-canvas-wrap">
    <canvas
      bind:this={canvas}
      width={WIDTH}
      height={HEIGHT}
      onclick={handleCanvasClick}
      class="ship-log-canvas"
    ></canvas>
  </div>

  {#if selectedNode}
    <div class="ship-log-detail">
      <h3 class="detail-label">{selectedNode.label}</h3>
      {#if isDiscovered(selectedNode.id)}
        <p class="detail-description">{selectedNode.description}</p>
        <span class="detail-badge discovered">Discovered</span>
      {:else if isHintable(selectedNode.id)}
        <p class="detail-hint">{selectedNode.hint}</p>
        <span class="detail-badge hinted">Undiscovered</span>
      {:else}
        <p class="detail-locked">???</p>
        <span class="detail-badge locked">Locked</span>
      {/if}
    </div>
  {/if}

  <div class="ship-log-legend">
    <span class="legend-item">
      <span class="legend-dot discovered"></span> Discovered
    </span>
    <span class="legend-item">
      <span class="legend-dot hinted"></span> Hinted
    </span>
    <span class="legend-item">
      <span class="legend-dot locked"></span> Locked
    </span>
  </div>
</div>

<style>
  .ship-log-container {
    max-width: 740px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .ship-log-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .ship-log-title {
    font-family: var(--font-display);
    font-size: 1.25rem;
    color: var(--color-nebula-100);
    margin: 0;
  }

  .ship-log-progress {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    color: var(--color-star-gold);
  }

  .ship-log-canvas-wrap {
    border: 1px solid var(--color-nebula-700);
    border-radius: 12px;
    overflow: hidden;
    background: var(--color-void);
  }

  .ship-log-canvas {
    display: block;
    width: 100%;
    height: auto;
    cursor: pointer;
  }

  .ship-log-detail {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid var(--color-nebula-700);
    border-radius: 8px;
    background: var(--color-nebula-900);
  }

  .detail-label {
    font-family: var(--font-display);
    font-size: 1rem;
    color: var(--color-nebula-100);
    margin: 0 0 0.5rem 0;
  }

  .detail-description {
    font-size: 0.875rem;
    color: var(--color-nebula-300);
    margin: 0 0 0.5rem 0;
  }

  .detail-hint {
    font-size: 0.875rem;
    color: var(--color-nebula-400);
    font-style: italic;
    margin: 0 0 0.5rem 0;
  }

  .detail-locked {
    font-size: 0.875rem;
    color: var(--color-nebula-500);
    margin: 0 0 0.5rem 0;
  }

  .detail-badge {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .detail-badge.discovered {
    background: color-mix(in srgb, var(--color-star-gold), transparent 85%);
    color: var(--color-star-gold);
  }

  .detail-badge.hinted {
    background: color-mix(in srgb, var(--color-nebula-400), transparent 85%);
    color: var(--color-nebula-400);
  }

  .detail-badge.locked {
    background: color-mix(in srgb, var(--color-nebula-600), transparent 85%);
    color: var(--color-nebula-500);
  }

  .ship-log-legend {
    display: flex;
    gap: 1.25rem;
    margin-top: 1rem;
    justify-content: center;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
    color: var(--color-nebula-400);
  }

  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .legend-dot.discovered {
    background: var(--color-star-gold);
    box-shadow: 0 0 6px color-mix(in srgb, var(--color-star-gold), transparent 50%);
  }

  .legend-dot.hinted {
    background: var(--color-nebula-600);
    border: 1px solid var(--color-nebula-500);
  }

  .legend-dot.locked {
    background: var(--color-nebula-700);
    opacity: 0.5;
  }
</style>
