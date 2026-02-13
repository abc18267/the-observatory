/**
 * Central discovery state manager.
 * All hidden features read/write state through this module.
 * Persists to localStorage with versioned schema migration.
 */

import { emit } from './events';

const STORAGE_KEY = 'observatory:state';
const SCHEMA_VERSION = 1;

export interface DiscoveryState {
  version: number;
  discoveries: string[];
  constellations: string[];
  gamesCompleted: string[];
  terminalCommands: string[];
  visitCount: number;
  firstVisitDate: string;
  lastVisitDate: string;
  sessionStart: number;
  loopCount: number;
  audioEnabled: boolean;
  totalClickedStars: number;
}

function createDefaultState(): DiscoveryState {
  const now = new Date().toISOString();
  return {
    version: SCHEMA_VERSION,
    discoveries: [],
    constellations: [],
    gamesCompleted: [],
    terminalCommands: [],
    visitCount: 0,
    firstVisitDate: now,
    lastVisitDate: now,
    sessionStart: Date.now(),
    loopCount: 0,
    audioEnabled: false,
    totalClickedStars: 0,
  };
}

function migrate(raw: Record<string, unknown>): DiscoveryState {
  const state = createDefaultState();

  // Version 0 (no version field) -> Version 1
  if (!raw.version || (raw.version as number) < 1) {
    // Copy over any fields that exist
    if (Array.isArray(raw.discoveries)) state.discoveries = raw.discoveries;
    if (typeof raw.visitCount === 'number') state.visitCount = raw.visitCount;
    if (typeof raw.firstVisitDate === 'string') state.firstVisitDate = raw.firstVisitDate;
  }

  state.version = SCHEMA_VERSION;
  return state;
}

function load(): DiscoveryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();

    const parsed = JSON.parse(raw) as Record<string, unknown>;

    if ((parsed.version as number) === SCHEMA_VERSION) {
      return parsed as unknown as DiscoveryState;
    }

    return migrate(parsed);
  } catch {
    return createDefaultState();
  }
}

function save(state: DiscoveryState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable. Silently fail.
  }
}

// In-memory state
let state = createDefaultState();

/** Initialize the store. Call once on page load. */
export function init(): DiscoveryState {
  state = load();

  // Update visit tracking
  state.visitCount += 1;
  state.lastVisitDate = new Date().toISOString();
  state.sessionStart = Date.now();

  save(state);

  emit('observatory:visit', {
    count: state.visitCount,
    isFirstVisit: state.visitCount === 1,
  });

  return state;
}

/** Get current state (read-only snapshot). */
export function getState(): Readonly<DiscoveryState> {
  return { ...state };
}

/** Record a new discovery. Returns true if it was new. */
export function addDiscovery(id: string, category: string, label: string): boolean {
  if (state.discoveries.includes(id)) return false;

  state.discoveries.push(id);
  save(state);

  emit('observatory:discovery', { id, category, label });
  emit('observatory:state-change', {
    discoveries: [...state.discoveries],
    totalCount: state.discoveries.length,
  });

  return true;
}

/** Check if a discovery has been made. */
export function hasDiscovery(id: string): boolean {
  return state.discoveries.includes(id);
}

/** Get total discovery count. */
export function discoveryCount(): number {
  return state.discoveries.length;
}

/** Record a completed constellation. */
export function addConstellation(name: string, stars: string[]): boolean {
  if (state.constellations.includes(name)) return false;

  state.constellations.push(name);
  save(state);

  emit('observatory:constellation-complete', { name, stars });
  addDiscovery(`constellation:${name}`, 'constellation', `Formed ${name}`);

  return true;
}

/** Record a completed game. */
export function addGameComplete(gameId: string, score: number): boolean {
  if (state.gamesCompleted.includes(gameId)) return false;

  state.gamesCompleted.push(gameId);
  save(state);

  emit('observatory:game-complete', { gameId, score });
  addDiscovery(`game:${gameId}`, 'game', `Completed ${gameId}`);

  return true;
}

/** Record a terminal command. */
export function addTerminalCommand(command: string, output: string): void {
  if (!state.terminalCommands.includes(command)) {
    state.terminalCommands.push(command);
    save(state);

    if (state.terminalCommands.length === 1) {
      addDiscovery('terminal:first-command', 'terminal', 'First terminal command');
    }
  }

  emit('observatory:terminal-command', { command, output });
}

/** Increment star click counter. */
export function clickStar(): number {
  state.totalClickedStars += 1;
  save(state);

  if (state.totalClickedStars === 1) {
    addDiscovery('star:first-click', 'star', 'Clicked first star');
  }

  return state.totalClickedStars;
}

/** Toggle audio. */
export function toggleAudio(): boolean {
  state.audioEnabled = !state.audioEnabled;
  save(state);

  emit('observatory:audio-toggle', { enabled: state.audioEnabled });
  return state.audioEnabled;
}

/** Increment loop counter (called every 22 minutes). */
export function incrementLoop(): number {
  state.loopCount += 1;
  save(state);

  emit('observatory:loop-reset', { loopCount: state.loopCount });

  if (state.loopCount === 1) {
    addDiscovery('loop:first-reset', 'loop', 'First time loop');
  }

  return state.loopCount;
}

/** Get session duration in milliseconds. */
export function getSessionDuration(): number {
  return Date.now() - state.sessionStart;
}

/** Check if enough discoveries for the deep game (need 10+). */
export function canAccessDeepGame(): boolean {
  return state.discoveries.length >= 10;
}

/** Reset all state (for testing). */
export function resetState(): void {
  state = createDefaultState();
  save(state);
}
