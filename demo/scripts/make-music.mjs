// Synthesizes the V2 story video's background music (and UI click) into demo/public/.
// Run: node scripts/make-music.mjs
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const SR = 44100;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
mkdirSync(OUT, { recursive: true });

const wav = (samples) => {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + i * 2);
  }
  return buf;
};

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

// --- Music: 16s, 80bpm feel, one chord per 4s bar --------------------------
const DUR = 16;
const N = DUR * SR;
const out = new Float64Array(N);

// Cmaj7, Am7, Fmaj7, G7 (MIDI note numbers; index 0 is the bass root)
const CHORDS = [
  [36, 60, 64, 67, 71],
  [33, 57, 60, 64, 67],
  [29, 53, 57, 60, 64],
  [31, 55, 59, 62, 65],
];
const BAR = 4; // seconds per chord
const BEAT = 0.75; // 80 bpm

const addTone = (start, dur, freq, amp, attack, decay) => {
  const s0 = Math.round(start * SR);
  const n = Math.round(dur * SR);
  for (let i = 0; i < n && s0 + i < N; i++) {
    const t = i / SR;
    const env =
      Math.min(1, t / attack) * (decay ? Math.exp(-Math.max(0, t - attack) * decay) : 1) *
      Math.min(1, (dur - t) / 0.15);
    // sine + a whisper of 2nd harmonic for warmth
    out[s0 + i] +=
      amp * env * (Math.sin(2 * Math.PI * freq * t) + 0.25 * Math.sin(4 * Math.PI * freq * t));
  }
};

for (let bar = 0; bar < DUR / BAR; bar++) {
  const chord = CHORDS[bar % CHORDS.length];
  const t0 = bar * BAR;
  // pad: sustained chord tones, slow attack
  for (const m of chord.slice(1)) {
    addTone(t0, BAR, midi(m), 0.045, 0.9, 0);
    addTone(t0, BAR, midi(m) * 1.003, 0.03, 1.1, 0); // gentle detune
  }
  // bass: root pluck on beats 1 and 3
  for (const beat of [0, 2 * BEAT * 2]) {
    addTone(t0 + beat, 1.2, midi(chord[0]), 0.16, 0.008, 3.5);
  }
  // arp: eighth-note plucks cycling up the chord
  const tones = chord.slice(1);
  for (let k = 0; k < BAR / (BEAT / 2); k++) {
    addTone(t0 + k * (BEAT / 2), 0.5, midi(tones[k % tones.length] + 12), 0.035, 0.005, 9);
  }
}

// master fade in/out + soft clip
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = Math.min(1, t / 0.6) * Math.min(1, (DUR - t) / 2);
  out[i] = Math.tanh(out[i] * 1.1) * 0.8 * fade;
}
writeFileSync(join(OUT, "music.wav"), wav(Array.from(out)));
console.log("wrote public/music.wav");

// --- UI click for the Save button ------------------------------------------
const CN = Math.round(0.06 * SR);
const click = new Float64Array(CN);
let last = 0;
for (let i = 0; i < CN; i++) {
  const t = i / SR;
  last = 0.5 * last + 0.5 * (Math.random() * 2 - 1);
  click[i] =
    0.5 * last * Math.exp(-t * 160) + 0.35 * Math.sin(2 * Math.PI * 1400 * t) * Math.exp(-t * 120);
}
writeFileSync(join(OUT, "click.wav"), wav(Array.from(click)));
console.log("wrote public/click.wav");
