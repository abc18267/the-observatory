/**
 * Custom event system for cross-component communication.
 * All events fire on window and use the "observatory:" prefix.
 */

export type ObservatoryEventMap = {
  'observatory:discovery': { id: string; category: string; label: string };
  'observatory:constellation-complete': { name: string; stars: string[] };
  'observatory:game-complete': { gameId: string; score: number };
  'observatory:terminal-command': { command: string; output: string };
  'observatory:visit': { count: number; isFirstVisit: boolean };
  'observatory:time-change': { isNight: boolean; hour: number };
  'observatory:loop-reset': { loopCount: number };
  'observatory:audio-toggle': { enabled: boolean };
  'observatory:state-change': { discoveries: string[]; totalCount: number };
};

export function emit<K extends keyof ObservatoryEventMap>(
  event: K,
  detail: ObservatoryEventMap[K],
): void {
  window.dispatchEvent(new CustomEvent(event, { detail }));
}

export function listen<K extends keyof ObservatoryEventMap>(
  event: K,
  handler: (detail: ObservatoryEventMap[K]) => void,
): () => void {
  const wrapper = (e: Event) => {
    handler((e as CustomEvent<ObservatoryEventMap[K]>).detail);
  };
  window.addEventListener(event, wrapper);
  return () => window.removeEventListener(event, wrapper);
}
