/**
 * Sound effects manager using the Web Audio API directly.
 * Each effect is a short synthesized sound (50-300ms).
 * No audio files needed. No heavy library imports.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let initialized = false;

type EffectFn = () => void;

const effects: Record<string, EffectFn> = {};

/**
 * Helper: create an oscillator that auto-stops after a duration.
 */
function playTone(
  frequency: number,
  type: OscillatorType,
  duration: number,
  volume: number,
  opts?: {
    freqEnd?: number;
    delay?: number;
    attack?: number;
    decay?: number;
  },
): void {
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime + (opts?.delay ?? 0);
  const attack = opts?.attack ?? 0.005;
  const decay = opts?.decay ?? duration * 0.6;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);

  if (opts?.freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(opts.freqEnd, now + duration);
  }

  // Envelope: quick attack, then decay to silence
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + attack);
  gain.gain.linearRampToValueAtTime(0, now + attack + decay);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(now);
  osc.stop(now + duration + 0.05);
}

function registerEffects(): void {
  // Star click: short high ping
  effects['starClick'] = () => {
    playTone(1200, 'sine', 0.12, 0.15, { freqEnd: 1800, decay: 0.08 });
  };

  // Discovery: ascending three-note chime
  effects['discovery'] = () => {
    playTone(600, 'sine', 0.15, 0.12, { delay: 0 });
    playTone(800, 'sine', 0.15, 0.12, { delay: 0.1 });
    playTone(1100, 'sine', 0.25, 0.14, { delay: 0.2, decay: 0.18 });
  };

  // Game start: quick rising tone
  effects['gameStart'] = () => {
    playTone(300, 'square', 0.25, 0.08, { freqEnd: 900, decay: 0.18 });
  };

  // Game end: descending tone
  effects['gameEnd'] = () => {
    playTone(800, 'triangle', 0.3, 0.1, { freqEnd: 300, decay: 0.22 });
  };

  // Terminal open: digital beep
  effects['terminalOpen'] = () => {
    playTone(880, 'square', 0.08, 0.06);
    playTone(1100, 'square', 0.06, 0.06, { delay: 0.09 });
  };

  // Error: low buzz
  effects['error'] = () => {
    playTone(120, 'sawtooth', 0.2, 0.1, { decay: 0.15 });
    playTone(125, 'sawtooth', 0.2, 0.08, { decay: 0.15 });
  };
}

export function init(): void {
  if (initialized) return;

  try {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);
    registerEffects();
    initialized = true;
  } catch {
    // Web Audio API not available. Silently fail.
  }
}

export function play(effectName: string): void {
  if (!initialized || !ctx) return;

  // Resume context if suspended (browsers suspend until user gesture)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const fn = effects[effectName];
  if (fn) fn();
}

export function setVolume(v: number): void {
  if (!masterGain) return;
  // Clamp between 0 and 1
  masterGain.gain.value = Math.max(0, Math.min(1, v));
}

export function dispose(): void {
  if (ctx) {
    ctx.close().catch(() => {});
  }

  ctx = null;
  masterGain = null;
  initialized = false;

  // Clear effect functions
  for (const key of Object.keys(effects)) {
    delete effects[key];
  }
}
