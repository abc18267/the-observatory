/**
 * 22-minute loop timer.
 * After 22 minutes of session time, triggers a subtle visual reset.
 * Progress is never lost. Only cosmetic elements shift.
 */

const LOOP_DURATION_MS = 22 * 60 * 1000; // 22 minutes

let timerId: ReturnType<typeof setInterval> | null = null;
let onLoop: (() => void) | null = null;

export function startLoopTimer(callback: () => void): void {
  onLoop = callback;
  timerId = setInterval(() => {
    onLoop?.();
  }, LOOP_DURATION_MS);
}

export function stopLoopTimer(): void {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
  onLoop = null;
}

export function getTimeUntilNextLoop(sessionStart: number): number {
  const elapsed = Date.now() - sessionStart;
  const remaining = LOOP_DURATION_MS - (elapsed % LOOP_DURATION_MS);
  return remaining;
}

export function getCurrentLoopProgress(sessionStart: number): number {
  const elapsed = Date.now() - sessionStart;
  return (elapsed % LOOP_DURATION_MS) / LOOP_DURATION_MS;
}
