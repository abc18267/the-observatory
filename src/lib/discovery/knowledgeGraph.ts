/**
 * Knowledge graph system.
 * Defines connections between discoveries and what unlocks what.
 * Used by KnowledgeGate components to show/hide content.
 */

export interface KnowledgeNode {
  id: string;
  label: string;
  category: 'star' | 'constellation' | 'game' | 'terminal' | 'loop' | 'visit' | 'time' | 'meta' | 'scroll';
  description: string;
  requires: string[];
  unlocks: string[];
  hint: string;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
}

// Static knowledge graph definition
const graphData: KnowledgeGraphData = {
  nodes: [
    // Star discoveries
    {
      id: 'star:first-click',
      label: 'First Light',
      category: 'star',
      description: 'You clicked your first star.',
      requires: [],
      unlocks: ['star:pattern-hint'],
      hint: 'The stars are not just decoration.',
    },
    {
      id: 'star:pattern-hint',
      label: 'Pattern Recognition',
      category: 'star',
      description: 'A hint appeared about star patterns.',
      requires: ['star:first-click'],
      unlocks: [],
      hint: 'Some stars belong together.',
    },

    // Constellation discoveries
    {
      id: 'constellation:orion',
      label: 'The Hunter',
      category: 'constellation',
      description: 'You formed the Orion constellation.',
      requires: ['star:first-click'],
      unlocks: ['gate:orion-story'],
      hint: 'Three stars in a row...',
    },
    {
      id: 'constellation:cassiopeia',
      label: 'The Queen',
      category: 'constellation',
      description: 'You formed the Cassiopeia constellation.',
      requires: ['star:first-click'],
      unlocks: ['gate:cassiopeia-story'],
      hint: 'Five stars make a W.',
    },
    {
      id: 'constellation:lyra',
      label: 'The Lyre',
      category: 'constellation',
      description: 'You formed the Lyra constellation.',
      requires: ['star:first-click'],
      unlocks: ['gate:lyra-story'],
      hint: 'Music lives among the stars.',
    },

    // Game discoveries
    {
      id: 'game:star-catcher',
      label: 'Star Catcher',
      category: 'game',
      description: 'You completed Star Catcher.',
      requires: [],
      unlocks: ['gate:game-stories'],
      hint: 'Some words are more than text.',
    },
    {
      id: 'game:signal-decoder',
      label: 'Signal Decoder',
      category: 'game',
      description: 'You completed Signal Decoder.',
      requires: [],
      unlocks: ['gate:game-stories'],
      hint: 'Listen to the signals.',
    },
    {
      id: 'game:gravity-hop',
      label: 'Gravity Hop',
      category: 'game',
      description: 'You completed Gravity Hop.',
      requires: [],
      unlocks: ['gate:game-stories'],
      hint: 'What goes up...',
    },
    {
      id: 'game:nebula-painter',
      label: 'Nebula Painter',
      category: 'game',
      description: 'You completed Nebula Painter.',
      requires: [],
      unlocks: ['gate:game-stories'],
      hint: 'Create something beautiful.',
    },

    // Terminal discoveries
    {
      id: 'terminal:first-command',
      label: 'First Transmission',
      category: 'terminal',
      description: 'You typed your first terminal command.',
      requires: [],
      unlocks: ['gate:terminal-stories'],
      hint: 'Up up down down...',
    },
    {
      id: 'terminal:opened',
      label: 'Access Granted',
      category: 'terminal',
      description: 'You unlocked the terminal.',
      requires: [],
      unlocks: [],
      hint: 'The Konami Code opens doors.',
    },
    {
      id: 'terminal:coffee',
      label: 'Observatory Blend',
      category: 'terminal',
      description: 'You brewed a cup of terminal coffee.',
      requires: ['terminal:opened'],
      unlocks: [],
      hint: 'Every good terminal needs a coffee command.',
    },
    {
      id: 'terminal:void-stare',
      label: 'Void Gazer',
      category: 'terminal',
      description: 'You stared into the void three times.',
      requires: ['terminal:opened'],
      unlocks: [],
      hint: 'The void rewards persistence.',
    },
    {
      id: 'terminal:frequency-found',
      label: 'Signal Lock',
      category: 'terminal',
      description: 'You tuned to frequency 137.5.',
      requires: ['terminal:opened'],
      unlocks: ['meta:observatory-found'],
      hint: 'Scan the page. Something is broadcasting.',
    },
    {
      id: 'terminal:master',
      label: 'Command Master',
      category: 'terminal',
      description: 'You used 15 or more unique terminal commands.',
      requires: ['terminal:opened'],
      unlocks: [],
      hint: 'Keep exploring the terminal.',
    },
    {
      id: 'terminal:matrix',
      label: 'Red Pill',
      category: 'terminal',
      description: 'You entered the Matrix.',
      requires: ['terminal:opened'],
      unlocks: [],
      hint: 'Follow the white rabbit.',
    },
    {
      id: 'terminal:hack',
      label: 'Script Kiddie',
      category: 'terminal',
      description: 'You tried to hack a static site.',
      requires: ['terminal:opened'],
      unlocks: [],
      hint: 'What would you even hack?',
    },
    {
      id: 'terminal:observer',
      label: 'Observer Log',
      category: 'terminal',
      description: 'You found the developer diary.',
      requires: ['terminal:opened'],
      unlocks: [],
      hint: 'The observer is always watching.',
    },
    {
      id: 'terminal:signal',
      label: 'Morse Decoder',
      category: 'terminal',
      description: 'You decoded a signal from beyond.',
      requires: ['terminal:opened'],
      unlocks: [],
      hint: 'Signals come in many forms.',
    },

    // Loop discoveries
    {
      id: 'loop:first-reset',
      label: 'Time Loop',
      category: 'loop',
      description: 'You experienced your first 22-minute loop.',
      requires: [],
      unlocks: ['gate:loop-story'],
      hint: 'Time moves in circles here.',
    },

    // Visit-based discoveries
    {
      id: 'visit:returning',
      label: 'Return Visitor',
      category: 'visit',
      description: 'You came back.',
      requires: [],
      unlocks: ['gate:returning-content'],
      hint: 'Come back tomorrow.',
    },
    {
      id: 'visit:frequent',
      label: 'Frequent Flyer',
      category: 'visit',
      description: 'You\'ve visited 5 or more times.',
      requires: ['visit:returning'],
      unlocks: [],
      hint: 'Keep coming back.',
    },
    {
      id: 'visit:resident',
      label: 'Resident Observer',
      category: 'visit',
      description: 'You\'ve visited 10 or more times.',
      requires: ['visit:frequent'],
      unlocks: [],
      hint: 'This is basically your home now.',
    },

    // Time-based discoveries
    {
      id: 'time:night-visitor',
      label: 'Night Owl',
      category: 'time',
      description: 'You visited during the night hours.',
      requires: [],
      unlocks: [],
      hint: 'The site changes after dark.',
    },

    // Scroll discoveries
    {
      id: 'scroll:completionist',
      label: 'Completionist',
      category: 'scroll',
      description: 'You scrolled to the bottom of a page.',
      requires: [],
      unlocks: [],
      hint: 'Read all the way down.',
    },
    {
      id: 'scroll:deep-diver',
      label: 'Deep Diver',
      category: 'scroll',
      description: 'You reached the absolute bottom three times.',
      requires: ['scroll:completionist'],
      unlocks: [],
      hint: 'The bottom has a bottom.',
    },

    // Meta discoveries (combos)
    {
      id: 'meta:deep-game',
      label: 'The Deep',
      category: 'meta',
      description: 'You found the deep game.',
      requires: ['star:first-click', 'terminal:first-command', 'game:star-catcher'],
      unlocks: ['game:deep-complete'],
      hint: 'There is more beyond what you see.',
    },
    {
      id: 'game:deep-complete',
      label: 'Deep Explorer',
      category: 'game',
      description: 'You completed the deep game.',
      requires: ['meta:deep-game'],
      unlocks: [],
      hint: 'Finish what you started in the deep.',
    },
    {
      id: 'meta:observatory-found',
      label: 'The Observatory',
      category: 'meta',
      description: 'You found the hidden observatory page.',
      requires: ['terminal:frequency-found'],
      unlocks: [],
      hint: 'The terminal holds coordinates.',
    },
    {
      id: 'meta:constellation-master',
      label: 'Star Cartographer',
      category: 'meta',
      description: 'You formed all three constellations.',
      requires: ['constellation:orion', 'constellation:cassiopeia', 'constellation:lyra'],
      unlocks: [],
      hint: 'Map every star pattern in the sky.',
    },
    {
      id: 'meta:game-master',
      label: 'Game Master',
      category: 'meta',
      description: 'You completed all four mini-games.',
      requires: ['game:star-catcher', 'game:signal-decoder', 'game:gravity-hop', 'game:nebula-painter'],
      unlocks: [],
      hint: 'Every hidden word leads somewhere.',
    },
    {
      id: 'meta:lost-explorer',
      label: 'Lost Explorer',
      category: 'meta',
      description: 'You found the 404 page.',
      requires: [],
      unlocks: [],
      hint: 'Not every path leads somewhere.',
    },
    {
      id: 'meta:true-explorer',
      label: 'True Explorer',
      category: 'meta',
      description: 'You found 25 or more discoveries.',
      requires: [],
      unlocks: [],
      hint: 'The journey has no real end.',
    },
  ],
};

/** Get all nodes in the knowledge graph. */
export function getNodes(): KnowledgeNode[] {
  return graphData.nodes;
}

/** Get a specific node by ID. */
export function getNode(id: string): KnowledgeNode | undefined {
  return graphData.nodes.find((n) => n.id === id);
}

/** Check if all requirements for a node are met. */
export function isUnlocked(nodeId: string, discoveries: string[]): boolean {
  const node = getNode(nodeId);
  if (!node) return false;
  return node.requires.every((req) => discoveries.includes(req));
}

/** Get all nodes that a discovery unlocks. */
export function getUnlockedBy(discoveryId: string): KnowledgeNode[] {
  return graphData.nodes.filter((n) => n.requires.includes(discoveryId));
}

/** Get all discovered nodes. */
export function getDiscoveredNodes(discoveries: string[]): KnowledgeNode[] {
  return graphData.nodes.filter((n) => discoveries.includes(n.id));
}

/** Get all undiscovered but hintable nodes (requirements partially met). */
export function getHintableNodes(discoveries: string[]): KnowledgeNode[] {
  return graphData.nodes.filter((n) => {
    if (discoveries.includes(n.id)) return false;
    // Show hint if at least one requirement is met, or no requirements
    return n.requires.length === 0 || n.requires.some((req) => discoveries.includes(req));
  });
}

/** Get discovery progress as a percentage. */
export function getProgress(discoveries: string[]): number {
  return Math.round((discoveries.length / graphData.nodes.length) * 100);
}
