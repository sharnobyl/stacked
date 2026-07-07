// Synthesizes the demo's sound effects as small mono WAVs in demo/public/.
// Run: node scripts/make-sounds.mjs
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
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
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

// Sweep with phase continuity so pitch glides don't click.
const sweep = (dur, f0, f1, env) => {
  const n = Math.round(dur * SR);
  const out = new Float64Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = f0 + (f1 - f0) * (t / dur);
    phase += (2 * Math.PI * f) / SR;
    out[i] = Math.sin(phase) * env(t);
  }
  return out;
};

const noise = (dur, env) => {
  const n = Math.round(dur * SR);
  const out = new Float64Array(n);
  let last = 0;
  for (let i = 0; i < n; i++) {
    // lightly low-passed noise so it hisses less
    last = 0.6 * last + 0.4 * (Math.random() * 2 - 1);
    out[i] = last * env(i / SR);
  }
  return out;
};

const mix = (...tracks) => {
  const n = Math.max(...tracks.map((t) => t.length));
  const out = new Float64Array(n);
  for (const t of tracks) for (let i = 0; i < t.length; i++) out[i] += t[i];
  return out;
};

const save = (name, samples) => {
  writeFileSync(join(OUT, name), wav(Array.from(samples)));
  console.log(`wrote public/${name}`);
};

// Copy lands in the stack: bright little pop.
save("pop.wav", sweep(0.1, 880, 520, (t) => 0.55 * Math.exp(-t * 42)));

// Paste leaves the stack: softer downward thock.
save("paste.wav", sweep(0.12, 520, 260, (t) => 0.5 * Math.exp(-t * 30)));

// Panel pops in: quick airy swish.
save(
  "swish.wav",
  mix(
    noise(0.22, (t) => 0.22 * Math.sin((Math.PI * t) / 0.22) ** 2),
    sweep(0.22, 300, 750, (t) => 0.12 * Math.exp(-t * 12))
  )
);

// Screenshot: two-click camera shutter.
save(
  "shutter.wav",
  mix(
    noise(0.05, (t) => 0.7 * Math.exp(-t * 120)),
    noise(0.16, (t) => (t > 0.07 ? 0.5 * Math.exp(-(t - 0.07) * 100) : 0))
  )
);

// End card: gentle two-note chime (E5 + B5).
save(
  "chime.wav",
  mix(
    sweep(0.9, 659.25, 659.25, (t) => 0.28 * Math.exp(-t * 4)),
    sweep(0.9, 987.77, 987.77, (t) => (t > 0.12 ? 0.22 * Math.exp(-(t - 0.12) * 4) : 0))
  )
);
