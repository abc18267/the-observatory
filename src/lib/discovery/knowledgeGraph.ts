/**
 * Knowledge graph system.
 * Defines connections between discoveries and what unlocks what.
 * Used by KnowledgeGate components to show/hide content.
 */

export interface KnowledgeNode {
  id: string;
  label: string;
  category: 'star' | 'constellation' | 'game' | 'terminal' | 'loop' | 'visit' | 'time' | 'meta';
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

    // Meta discoveries
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
