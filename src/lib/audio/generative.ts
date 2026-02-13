/**
 * Generative ambient audio engine powered by Tone.js.
 * Creates a layered soundscape that evolves as discoveries increase.
 * All Tone.js imports are dynamic to avoid SSR issues.
 *
 * Layers:
 *   0 discoveries - Base drone pad (always on when active)
 *   3 discoveries - Gentle high arpeggios
 *   7 discoveries - Subtle metallic percussion/clicks
 *  12 discoveries - Melodic fragments
 */

type ToneLib = typeof import('tone');

let Tone: ToneLib | null = null;
let initialized = false;
let playing = false;

// Synth references
let droneSynth: InstanceType<ToneLib['AMSynth']> | null = null;
let arpeggioSynth: InstanceType<ToneLib['PolySynth']> | null = null;
let percSynth: InstanceType<ToneLib['MetalSynth']> | null = null;
let melodySynth: InstanceType<ToneLib['FMSynth']> | null = null;

// Scheduling references
let droneLoop: InstanceType<ToneLib['Loop']> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let arpeggioPattern: any = null;
let percLoop: InstanceType<ToneLib['Loop']> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let melodyPattern: any = null;

// Volume nodes for per-layer control
let droneGain: InstanceType<ToneLib['Gain']> | null = null;
let arpeggioGain: InstanceType<ToneLib['Gain']> | null = null;
let percGain: InstanceType<ToneLib['Gain']> | null = null;
let melodyGain: InstanceType<ToneLib['Gain']> | null = null;

// Active layer tracking
let activeLayers = 0;

// Pentatonic notes used across layers
const DRONE_NOTES = ['A2', 'C3', 'D3', 'E3', 'G3'];
const ARPEGGIO_NOTES = ['A4', 'C5', 'D5', 'E5', 'G5', 'A5'];
const MELODY_NOTES = ['E4', 'G4', 'A4', 'C5', 'D5', 'E5'];

export async function init(): Promise<void> {
  if (initialized) return;

  Tone = await import('tone');
  await Tone.start();

  // --- Master output ---
  const masterGain = new Tone.Gain(0.35).toDestination();
  const reverb = new Tone.Reverb({ decay: 6, wet: 0.45 });
  await reverb.generate();
  reverb.connect(masterGain);

  // --- Layer 1: Drone pad (AM Synth) ---
  droneGain = new Tone.Gain(0.5).connect(reverb);
  droneSynth = new Tone.AMSynth({
    harmonicity: 2.5,
    oscillator: { type: 'sine' },
    modulation: { type: 'sine' },
    envelope: { attack: 3, decay: 1, sustain: 0.9, release: 4 },
    modulationEnvelope: { attack: 4, decay: 1, sustain: 0.8, release: 5 },
  }).connect(droneGain);

  let droneIndex = 0;
  droneLoop = new Tone.Loop((time) => {
    const note = DRONE_NOTES[droneIndex % DRONE_NOTES.length];
    droneSynth?.triggerAttackRelease(note, '4n', time, 0.15);
    droneIndex++;
    // Occasionally pick a random note for variation
    if (Math.random() < 0.3) {
      droneIndex = Math.floor(Math.random() * DRONE_NOTES.length);
    }
  }, '2m');

  // --- Layer 2: Arpeggios (PolySynth) ---
  arpeggioGain = new Tone.Gain(0).connect(reverb);
  arpeggioSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.3, decay: 0.5, sustain: 0.2, release: 1.5 },
    volume: -18,
  }).connect(arpeggioGain);

  arpeggioPattern = new Tone.Pattern(
    (time, note) => {
      arpeggioSynth?.triggerAttackRelease(note, '8n', time, 0.08);
    },
    ARPEGGIO_NOTES,
    'upDown',
  );
  arpeggioPattern.interval = '4n';

  // --- Layer 3: Percussion clicks (MetalSynth) ---
  percGain = new Tone.Gain(0).connect(masterGain);
  percSynth = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.1, release: 0.05 },
    harmonicity: 5.1,
    modulationIndex: 16,
    resonance: 4000,
    octaves: 1.5,
    volume: -28,
  }).connect(percGain);
  percSynth.frequency.value = 200;

  let percStep = 0;
  percLoop = new Tone.Loop((time) => {
    // Only trigger sometimes for subtle rhythmic texture
    if (percStep % 3 === 0 || Math.random() < 0.25) {
      percSynth?.triggerAttackRelease('16n', time, Math.random() * 0.04 + 0.01);
    }
    percStep++;
  }, '8n');

  // --- Layer 4: Melodic fragments (FMSynth) ---
  melodyGain = new Tone.Gain(0).connect(reverb);
  melodySynth = new Tone.FMSynth({
    harmonicity: 3,
    modulationIndex: 10,
    oscillator: { type: 'sine' },
    modulation: { type: 'triangle' },
    envelope: { attack: 0.2, decay: 0.3, sustain: 0.4, release: 2 },
    modulationEnvelope: { attack: 0.3, decay: 0.3, sustain: 0.6, release: 1.5 },
    volume: -20,
  }).connect(melodyGain);

  // Play a random short phrase every few bars
  melodyPattern = new Tone.Pattern(
    (time, note) => {
      // Only play roughly 40% of pattern steps for sparse melody
      if (Math.random() < 0.4) {
        melodySynth?.triggerAttackRelease(note, '4n', time, 0.06);
      }
    },
    MELODY_NOTES,
    'random',
  );
  melodyPattern.interval = '2n';

  initialized = true;
}

export function start(): void {
  if (!initialized || !Tone || playing) return;

  Tone.getTransport().bpm.value = 50;
  Tone.getTransport().start();

  // Always start the drone
  droneLoop?.start(0);

  // Start other loops (their gains control audibility)
  arpeggioPattern?.start(0);
  percLoop?.start(0);
  melodyPattern?.start(0);

  playing = true;

  // Apply whatever layers should be active
  updateLayers(activeLayers);
}

export function stop(): void {
  if (!initialized || !Tone || !playing) return;

  droneLoop?.stop();
  arpeggioPattern?.stop();
  percLoop?.stop();
  melodyPattern?.stop();

  Tone.getTransport().stop();
  playing = false;
}

export function updateLayers(discoveryCount: number): void {
  activeLayers = discoveryCount;

  if (!initialized) return;

  const rampTime = 2;

  // Layer 1: Drone is always audible when playing
  droneGain?.gain.rampTo(0.5, rampTime);

  // Layer 2: Arpeggios at 3+ discoveries
  const arpeggioVol = discoveryCount >= 3 ? 0.35 : 0;
  arpeggioGain?.gain.rampTo(arpeggioVol, rampTime);

  // Layer 3: Percussion at 7+ discoveries
  const percVol = discoveryCount >= 7 ? 0.25 : 0;
  percGain?.gain.rampTo(percVol, rampTime);

  // Layer 4: Melody at 12+ discoveries
  const melodyVol = discoveryCount >= 12 ? 0.3 : 0;
  melodyGain?.gain.rampTo(melodyVol, rampTime);
}

export function dispose(): void {
  stop();

  droneSynth?.dispose();
  arpeggioSynth?.dispose();
  percSynth?.dispose();
  melodySynth?.dispose();

  droneLoop?.dispose();
  arpeggioPattern?.dispose();
  percLoop?.dispose();
  melodyPattern?.dispose();

  droneGain?.dispose();
  arpeggioGain?.dispose();
  percGain?.dispose();
  melodyGain?.dispose();

  droneSynth = null;
  arpeggioSynth = null;
  percSynth = null;
  melodySynth = null;
  droneLoop = null;
  arpeggioPattern = null;
  percLoop = null;
  melodyPattern = null;
  droneGain = null;
  arpeggioGain = null;
  percGain = null;
  melodyGain = null;

  Tone = null;
  initialized = false;
  playing = false;
}
