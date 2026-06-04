<script lang="ts">
  import { onMount } from 'svelte';
  import {
    addDiscovery,
    addTerminalCommand,
    getState,
    discoveryCount,
    getSessionDuration,
  } from '../../lib/discovery/store';
  import { getTimeUntilNextLoop } from '../../lib/utils/loop';
  import { getTimeOfDay } from '../../lib/utils/time';
  import { getProgress, getDiscoveredNodes, getNodes } from '../../lib/discovery/knowledgeGraph';

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
  let commandHistory: string[] = $state([]);
  let historyIndex = $state(-1);
  let voidCount = 0;
  let uniqueCommands = new Set<string>();

  const SPACE_HAIKU = [
    'Stars burn in silence\nLight years apart yet connected\nWe look up, and dream',
    'The void is not empty\nIt hums with ancient radio\nTune in, if you dare',
    'One orbit around\nEverything changes, stays same\nThe loop remembers',
    'Pixels on a screen\nPretending to be starlight\nBut the wonder, real',
    'Code compiles at dawn\nAnother universe boots\nHello, world, again',
  ];

  const COFFEE_ART = `
        ( (
         ) )
      ._______.
      |       |]
      \\       /
       \`-----'
    OBSERVATORY BLEND
   "Fuel for late nights"`;

  function processCommand(cmd: string): string {
    const trimmed = cmd.trim().toLowerCase();
    const parts = trimmed.split(/\s+/);
    const base = parts[0];
    const arg = parts.slice(1).join(' ');

    // Track unique commands for terminal:master
    uniqueCommands.add(base);
    if (uniqueCommands.size >= 15) {
      addDiscovery('terminal:master', 'terminal', 'Terminal master - used 15+ commands');
    }

    switch (base) {
      // ===== CORE COMMANDS =====
      case 'help':
        return [
          'OBSERVATORY TERMINAL v2.0',
          '',
          'CORE',
          '  help        Show this help message',
          '  status      Discovery count and stats',
          '  clear       Clear the terminal',
          '  exit        Close terminal',
          '',
          'INFO',
          '  discoveries List all your discoveries',
          '  progress    Visual progress bar',
          '  stars       Star click count',
          '  visits      Visit statistics',
          '  time        Current time state',
          '  loop        Time until next loop reset',
          '  history     Last 10 commands',
          '  coordinates Show constellation data',
          '',
          'FUN',
          '  matrix      You know what this does',
          '  coffee      Brew a cup',
          '  42          The answer',
          '  poem        Random space haiku',
          '  stardate    Current stardate',
          '  cipher <t>  ROT13 encode/decode text',
          '',
          'HIDDEN',
          '  ...some commands are not listed.',
          '  ...explore.',
        ].join('\n');

      case 'status': {
        const state = getState();
        return [
          `Discoveries: ${state.discoveries.length}/${getNodes().length}`,
          `Constellations: ${state.constellations.length}`,
          `Games completed: ${state.gamesCompleted.length}`,
          `Visit count: ${state.visitCount}`,
          `Loop count: ${state.loopCount}`,
          `Session: ${formatDuration(getSessionDuration())}`,
        ].join('\n');
      }

      case 'clear':
        lines = [];
        return '';

      case 'exit':
        isOpen = false;
        return '';

      // ===== INFO COMMANDS =====
      case 'discoveries': {
        const state = getState();
        const discovered = getDiscoveredNodes(state.discoveries);
        if (discovered.length === 0) {
          return 'No discoveries yet. Explore the site.';
        }
        const list = discovered.map((n) => `  [${n.category}] ${n.label}`).join('\n');
        return `Found ${discovered.length} discoveries:\n${list}`;
      }

      case 'progress': {
        const state = getState();
        const pct = getProgress(state.discoveries);
        const filled = Math.round(pct / 5);
        const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
        return `[${bar}] ${pct}%\n${state.discoveries.length} of ${getNodes().length} discoveries`;
      }

      case 'stars': {
        const state = getState();
        return `Total stars clicked: ${state.totalClickedStars}`;
      }

      case 'visits': {
        const state = getState();
        const first = new Date(state.firstVisitDate).toLocaleDateString();
        const last = new Date(state.lastVisitDate).toLocaleDateString();
        return [
          `Total visits: ${state.visitCount}`,
          `First visit: ${first}`,
          `Last visit: ${last}`,
          `Terminal commands used: ${state.terminalCommands.length}`,
        ].join('\n');
      }

      case 'time': {
        const tod = getTimeOfDay();
        const hour = new Date().getHours();
        const min = String(new Date().getMinutes()).padStart(2, '0');
        return `Local time: ${hour}:${min}\nTime state: ${tod}\nThe site shifts with the hours.`;
      }

      case 'loop': {
        const state = getState();
        const remaining = getTimeUntilNextLoop(state.sessionStart);
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        return [
          `Loop #${state.loopCount + 1} in progress`,
          `Next reset in: ${mins}m ${secs}s`,
          `22 minutes. Then everything shifts.`,
        ].join('\n');
      }

      case 'history': {
        const recent = commandHistory.slice(-10);
        if (recent.length === 0) return 'No command history yet.';
        return recent.map((c, i) => `  ${i + 1}. ${c}`).join('\n');
      }

      case 'coordinates': {
        const state = getState();
        if (state.constellations.length === 0) {
          return 'No constellations formed yet.\nClick stars in the background. Some form patterns.';
        }
        return [
          'Formed constellations:',
          ...state.constellations.map((c) => `  ★ ${c}`),
        ].join('\n');
      }

      // ===== FUN COMMANDS =====
      case 'matrix':
        addDiscovery('terminal:matrix', 'terminal', 'Entered the Matrix');
        return matrixRain();

      case 'coffee':
        addDiscovery('terminal:coffee', 'terminal', 'Brewed observatory coffee');
        return COFFEE_ART;

      case '42':
        return 'The Answer to the Ultimate Question of Life,\nthe Universe, and Everything.\n\nBut what was the question?';

      case 'poem':
        return SPACE_HAIKU[Math.floor(Math.random() * SPACE_HAIKU.length)];

      case 'stardate': {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        const day = Math.floor(diff / 86400000);
        const sd = `${now.getFullYear() - 1900}.${day}`;
        return `Stardate ${sd}\nCaptain's log: The observatory continues its mission.`;
      }

      case 'sudo':
        return [
          'ACCESS DENIED',
          '',
          'Nice try. This terminal doesn\'t have root.',
          'It barely has CSS.',
        ].join('\n');

      case 'hack': {
        addDiscovery('terminal:hack', 'terminal', 'Attempted to hack the observatory');
        return hackSequence();
      }

      case 'cipher': {
        if (!arg) return 'Usage: cipher <text>\nROT13 encodes or decodes your text.';
        const result = rot13(arg);
        return `Input:  ${arg}\nOutput: ${result}`;
      }

      // ===== SECRET COMMANDS =====
      case 'observer':
        addDiscovery('terminal:observer', 'terminal', 'Found the observer log');
        return [
          'OBSERVER LOG - ENTRY 1',
          '',
          'I built this site as an experiment.',
          'The surface is a portfolio. Clean, simple.',
          'But underneath there\'s a whole hidden layer.',
          '',
          'Stars you can click. Constellations to form.',
          'Games hidden in the text. A 22-minute time loop.',
          'Music that generates itself. A terminal you found.',
          '',
          'Most people will never see any of it.',
          'That\'s kind of the point.',
        ].join('\n');

      case 'void':
        voidCount++;
        if (voidCount >= 3) {
          addDiscovery('terminal:void-stare', 'terminal', 'Stared into the void');
          return 'You stared into the void. The void stared back.\n\n...it blinked first.';
        }
        if (voidCount === 2) {
          return 'The void acknowledges you.';
        }
        return '...';

      case 'frequency': {
        if (arg === '137.5') {
          addDiscovery('terminal:frequency-found', 'terminal', 'Tuned to frequency 137.5');
          return [
            '▓▓▓ SIGNAL LOCKED ▓▓▓',
            '',
            'Frequency 137.5 MHz - NOAA weather satellite band.',
            'But this signal is different.',
            '',
            'Coordinates detected: 47.6062° N, 122.3321° W',
            'It points to... /observatory',
            '',
            'Something is there.',
          ].join('\n');
        }
        if (!arg) return 'Usage: frequency <MHz>\nTry scanning first.';
        return `Frequency ${arg} MHz - static. Nothing here.`;
      }

      case 'scan':
        return [
          'SCANNING PAGE...',
          '',
          '  DOM nodes: ' + document.querySelectorAll('*').length,
          '  Hidden elements: [CLASSIFIED]',
          '  Event listeners: [REDACTED]',
          '',
          '  Anomaly detected:',
          '    Faint signal on frequency 137.5',
          '    Source: unknown',
          '',
          'Try: frequency <MHz>',
        ].join('\n');

      case 'signal': {
        addDiscovery('terminal:signal', 'terminal', 'Decoded a signal');
        return [
          '... --- ... / .-- . / .- .-. . / .... . .-. .',
          '',
          'Morse code translation:',
          '"SOS WE ARE HERE"',
          '',
          'Origin: beyond the observable edge.',
          'They\'ve been transmitting for 22 minutes.',
          'Then silence. Then again.',
        ].join('\n');
      }

      // ===== EASTER EGG RESPONSES =====
      case 'hello':
      case 'hi':
        return 'Hello, explorer. Welcome to the terminal.';

      case 'whoami':
        return 'You are the observer. The site remembers you.';

      case 'ls':
        return 'stars/  constellations/  games/  loops/  secrets/  void/';

      case 'cd':
        return 'You can\'t navigate the filesystem. But you can explore the site.';

      case 'pwd':
        return '/observatory/terminal/v2';

      case 'rm':
        return 'Nice try. Discoveries are permanent.';

      case 'cat':
        return '🐱 Meow.';

      case 'ping':
        return 'PING observatory.local: 64 bytes, time=0.001ms\nThe signal is strong. You are close.';

      default:
        return `Unknown command: "${trimmed}". Type "help" for available commands.`;
    }
  }

  function matrixRain(): string {
    const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01234567890';
    const rows: string[] = [];
    for (let i = 0; i < 8; i++) {
      let row = '';
      for (let j = 0; j < 40; j++) {
        row += chars[Math.floor(Math.random() * chars.length)];
      }
      rows.push(row);
    }
    return rows.join('\n') + '\n\nWake up, explorer...';
  }

  function hackSequence(): string {
    return [
      'INITIATING HACK SEQUENCE...',
      '',
      '  [■■■■■■■■■■] 100% - Firewall bypassed',
      '  [■■■■■■■■■■] 100% - Mainframe accessed',
      '  [■■■■■■■■■■] 100% - Downloading secrets',
      '',
      'HACK COMPLETE.',
      '',
      'Just kidding. This is a static site.',
      'There\'s nothing to hack.',
      'But you get a discovery for trying.',
    ].join('\n');
  }

  function rot13(text: string): string {
    return text.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });
  }

  function formatDuration(ms: number): string {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  }

  function handleSubmit() {
    const cmd = inputText.trim();
    if (!cmd) return;

    commandHistory = [...commandHistory, cmd];
    historyIndex = -1;

    lines = [...lines, { text: `> ${cmd}`, type: 'input' }];
    const output = processCommand(cmd);

    if (output) {
      lines = [...lines, { text: output, type: 'output' }];
    }

    addTerminalCommand(cmd, output);
    inputText = '';

    requestAnimationFrame(() => {
      if (outputEl) {
        outputEl.scrollTop = outputEl.scrollHeight;
      }
    });
  }

  function handleInputKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      if (historyIndex === -1) {
        historyIndex = commandHistory.length - 1;
      } else if (historyIndex > 0) {
        historyIndex--;
      }
      inputText = commandHistory[historyIndex];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        inputText = commandHistory[historyIndex];
      } else {
        historyIndex = -1;
        inputText = '';
      }
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (isOpen && e.key === 'Escape') {
      isOpen = false;
      return;
    }

    if (!isOpen) {
      if (e.code === KONAMI_CODE[konamiProgress]) {
        konamiProgress++;
        if (konamiProgress === KONAMI_CODE.length) {
          konamiProgress = 0;
          openTerminal();
        }
      } else {
        konamiProgress = 0;
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
      { text: 'OBSERVATORY TERMINAL v2.0', type: 'system' },
      { text: 'Type "help" for available commands.', type: 'system' },
      { text: 'Some commands are not listed. Explore.', type: 'system' },
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
          onkeydown={handleInputKeydown}
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
