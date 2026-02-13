<script lang="ts">
  import { onMount } from 'svelte';
  import {
    addDiscovery,
    addTerminalCommand,
    getState,
    discoveryCount,
  } from '../../lib/discovery/store';

  const KONAMI_CODE = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'KeyB',
    'KeyA',
  ];

  let isOpen = $state(false);
  let inputText = $state('');
  let lines = $state<Array<{ text: string; type: 'input' | 'output' | 'system' }>>([]);
  let konamiProgress = $state(0);
  let inputEl: HTMLInputElement | undefined = $state();
  let outputEl: HTMLDivElement | undefined = $state();

  function processCommand(cmd: string): string {
    const trimmed = cmd.trim().toLowerCase();

    switch (trimmed) {
      case 'help':
        return [
          'Available commands:',
          '  help   - Show this help message',
          '  status - Show discovery count',
          '  stars  - Show clicked stars',
          '  clear  - Clear the terminal',
          '  exit   - Close terminal',
        ].join('\n');

      case 'status': {
        const state = getState();
        return [
          `Discoveries: ${state.discoveries.length}`,
          `Constellations: ${state.constellations.length}`,
          `Games completed: ${state.gamesCompleted.length}`,
          `Visit count: ${state.visitCount}`,
          `Loop count: ${state.loopCount}`,
        ].join('\n');
      }

      case 'stars': {
        const state = getState();
        return `Total stars clicked: ${state.totalClickedStars}`;
      }

      case 'clear':
        lines = [];
        return '';

      case 'exit':
        isOpen = false;
        return '';

      default:
        return `Unknown command: "${trimmed}". Type "help" for available commands.`;
    }
  }

  function handleSubmit() {
    const cmd = inputText.trim();
    if (!cmd) return;

    lines = [...lines, { text: `> ${cmd}`, type: 'input' }];
    const output = processCommand(cmd);

    if (output) {
      lines = [...lines, { text: output, type: 'output' }];
    }

    addTerminalCommand(cmd, output);
    inputText = '';

    // Scroll to bottom on next tick
    requestAnimationFrame(() => {
      if (outputEl) {
        outputEl.scrollTop = outputEl.scrollHeight;
      }
    });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (isOpen && e.key === 'Escape') {
      isOpen = false;
      return;
    }

    if (!isOpen) {
      // Track Konami code
      if (e.code === KONAMI_CODE[konamiProgress]) {
        konamiProgress++;
        if (konamiProgress === KONAMI_CODE.length) {
          konamiProgress = 0;
          openTerminal();
        }
      } else {
        konamiProgress = 0;
        // Check if the first key matches to start fresh
        if (e.code === KONAMI_CODE[0]) {
          konamiProgress = 1;
        }
      }
    }
  }

  function openTerminal() {
    isOpen = true;
    addDiscovery('terminal:opened', 'terminal', 'Unlocked the terminal');

    lines = [
      { text: 'OBSERVATORY TERMINAL v1.0', type: 'system' },
      { text: 'Type "help" for available commands.', type: 'system' },
      { text: '', type: 'system' },
    ];

    requestAnimationFrame(() => {
      inputEl?.focus();
    });
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  // Focus input when terminal opens
  $effect(() => {
    if (isOpen && inputEl) {
      inputEl.focus();
    }
  });
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="terminal-overlay" onkeydown={(e) => { if (e.key === 'Escape') isOpen = false; }}>
    <div class="terminal-window">
      <div class="terminal-header">
        <span class="terminal-title">Observatory Terminal</span>
        <button class="terminal-close" onclick={() => (isOpen = false)}>
          [X]
        </button>
      </div>
      <div bind:this={outputEl} class="terminal-output">
        {#each lines as line}
          <div class="terminal-line {line.type}">
            {#each line.text.split('\n') as subline}
              <div>{subline}</div>
            {/each}
          </div>
        {/each}
      </div>
      <form class="terminal-input-row" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <span class="terminal-prompt">&gt;</span>
        <input
          bind:this={inputEl}
          bind:value={inputText}
          class="terminal-input"
          type="text"
          autocomplete="off"
          spellcheck="false"
        />
      </form>
    </div>
  </div>
{/if}

<style>
  .terminal-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(4px);
  }

  .terminal-window {
    width: min(90vw, 700px);
    height: min(80vh, 500px);
    display: flex;
    flex-direction: column;
    background: #0a0a0a;
    border: 1px solid #00ff41;
    border-radius: 4px;
    box-shadow: 0 0 30px rgba(0, 255, 65, 0.15);
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 14px;
    color: #00ff41;
  }

  .terminal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #00ff41;
    background: #111;
  }

  .terminal-title {
    font-size: 12px;
    opacity: 0.7;
  }

  .terminal-close {
    background: none;
    border: none;
    color: #00ff41;
    cursor: pointer;
    font-family: inherit;
    font-size: 12px;
    padding: 0;
  }

  .terminal-close:hover {
    color: #fff;
  }

  .terminal-output {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    scrollbar-width: thin;
    scrollbar-color: #00ff41 #0a0a0a;
  }

  .terminal-line {
    margin-bottom: 4px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .terminal-line.system {
    color: #00aa2a;
  }

  .terminal-line.input {
    color: #00ff41;
  }

  .terminal-line.output {
    color: #88cc88;
  }

  .terminal-input-row {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-top: 1px solid #003300;
    gap: 8px;
  }

  .terminal-prompt {
    color: #00ff41;
    flex-shrink: 0;
  }

  .terminal-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #00ff41;
    font-family: inherit;
    font-size: inherit;
    outline: none;
    caret-color: #00ff41;
  }
</style>
