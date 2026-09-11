/* global Buffer, __dirname */
/**
 * Nihongo sound palette — 和音 (wa-on).
 *
 * Every effect is synthesised from a physical model of a real Japanese
 * instrument rather than a bare sine tone, because the ear identifies an
 * instrument by its noisy attack, its inharmonic partials and its room tail —
 * exactly the three things a `sin() * exp()` tone has none of.
 *
 *   koto      — plucked silk string (Karplus-Strong delay line)
 *   rin       — struck bronze bowl (inharmonic modal synthesis)
 *   hyoshigi  — hardwood clapper (noise burst through a resonant body)
 *   taiko     — struck drum head (pitch-dropping membrane)
 *
 * Pitches come from the yo scale (ヨナ抜き音階 D E G A B), the pentatonic used
 * in Japanese folk music, so the whole palette stays inside one tonality.
 *
 * Output:
 *   correct.wav, correct-2..5.wav  koto pluck, one scale degree per combo step
 *   incorrect.wav                  hyoshigi clack over a taiko thud
 *   tap.wav                        single soft wood tick for selection
 *   lesson-complete.wav            koto arpeggio resolving on a rin bell
 *   achievement.wav                single rin bell, long shimmer
 *   streak.wav                     taiko double hit under a rising koto figure
 *
 * Run: node scripts/generate-sounds.js
 */

const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 44100;

// ── WAV container ───────────────────────────────────────────────────────────

function createWavBuffer(samples, sampleRate = SAMPLE_RATE) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intSample = s < 0 ? s * 0x8000 : s * 0x7fff;
    buffer.writeInt16LE(Math.floor(intSample), 44 + i * 2);
  }

  return buffer;
}

// ── DSP toolkit ─────────────────────────────────────────────────────────────

/**
 * Deterministic xorshift noise so a rebuild always produces byte-identical
 * files — otherwise every run would churn ~1MB of binary diff in git.
 */
function noiseSource(seed) {
  let s = seed >>> 0 || 0x9e3779b9;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return (s / 0xffffffff) * 2 - 1;
  };
}

function silence(durationSec, sampleRate = SAMPLE_RATE) {
  return new Float32Array(Math.floor(durationSec * sampleRate));
}

/** Mix `src` into `dst` starting at `startSec`, scaled by `gain`. */
function mixInto(dst, src, startSec, gain = 1, sampleRate = SAMPLE_RATE) {
  const offset = Math.floor(startSec * sampleRate);
  const end = Math.min(dst.length, offset + src.length);
  for (let i = Math.max(0, offset); i < end; i++) {
    dst[i] += src[i - offset] * gain;
  }
  return dst;
}

/** Direct-form-1 biquad band-pass — the resonant "body" of wood and drums. */
function bandpass(input, freq, q, sampleRate = SAMPLE_RATE) {
  const w0 = (2 * Math.PI * freq) / sampleRate;
  const alpha = Math.sin(w0) / (2 * q);
  const cosw0 = Math.cos(w0);
  const a0 = 1 + alpha;
  const b0 = alpha / a0;
  const b2 = -alpha / a0;
  const a1 = (-2 * cosw0) / a0;
  const a2 = (1 - alpha) / a0;

  const out = new Float32Array(input.length);
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < input.length; i++) {
    const x0 = input[i];
    const y0 = b0 * x0 + b2 * x2 - a1 * y1 - a2 * y2;
    out[i] = y0;
    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
  }
  return out;
}

/**
 * Schroeder reverb — four parallel combs into two allpass sections.
 * A short tail is what stops every cue ending dead the instant it starts;
 * kept quiet (mix ≤ 0.2) so it reads as a room, not as an effect.
 */
function addRoomTail(input, { mix = 0.16, decay = 0.72, damping = 0 } = {}) {
  const combDelays = [1557, 1617, 1491, 1422];
  const allpassDelays = [225, 556];

  const wet = new Float32Array(input.length);
  for (const delay of combDelays) {
    const buf = new Float32Array(delay);
    let idx = 0;
    let store = 0;
    for (let i = 0; i < input.length; i++) {
      const delayed = buf[idx];
      wet[i] += delayed * 0.25;
      // One-pole lowpass inside the feedback path: high partials die before
      // low ones, as they do in a real room. It also evens out the tail
      // across pitches — the comb delays are fixed, so a note landing on a
      // comb resonance would otherwise ring far longer than its neighbours
      // (the top step of the answer ladder rang twice as long as the rest).
      store = delayed * (1 - damping) + store * damping;
      buf[idx] = input[i] + store * decay;
      idx = (idx + 1) % delay;
    }
  }

  let stage = wet;
  for (const delay of allpassDelays) {
    const buf = new Float32Array(delay);
    const out = new Float32Array(stage.length);
    let idx = 0;
    for (let i = 0; i < stage.length; i++) {
      const delayed = buf[idx];
      const v = stage[i] + delayed * -0.5;
      out[i] = delayed + v * 0.5;
      buf[idx] = v;
      idx = (idx + 1) % delay;
    }
    stage = out;
  }

  const out = new Float32Array(input.length);
  for (let i = 0; i < input.length; i++) {
    out[i] = input[i] * (1 - mix * 0.4) + stage[i] * mix;
  }
  return out;
}

/**
 * tanh saturation instead of hard clipping. Hard clipping folds a peak into a
 * square edge and that buzz is a large part of why synthesised UI sounds read
 * as cheap; tanh rounds the peak the way an overdriven speaker cone does.
 */
function softClip(samples, drive = 1.1) {
  for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.tanh(samples[i] * drive) / Math.tanh(drive);
  }
  return samples;
}

/**
 * Remove DC, taper both ends, then match loudness.
 *
 * Loudness is matched on the loudest `window` seconds rather than on the peak.
 * A koto pluck is one tall spike followed by a long decay, while a taiko hit
 * sustains: peak-normalising both to the same number leaves the pluck sounding
 * half as loud, which is how the answer cue ended up quieter than the error
 * cue. Short-term RMS is much closer to what the ear actually weighs.
 *
 * The fades are applied *before* measuring, because a percussive cue peaks
 * inside the first few milliseconds and would otherwise be normalised on a
 * sample the fade-in is about to attenuate.
 */
function finalize(
  samples,
  targetRms,
  { ceiling = 0.92, window = 0.3, sampleRate = SAMPLE_RATE } = {},
) {
  let mean = 0;
  for (let i = 0; i < samples.length; i++) mean += samples[i];
  mean /= samples.length || 1;
  for (let i = 0; i < samples.length; i++) samples[i] -= mean;

  const fadeIn = Math.floor(sampleRate * 0.0015);
  const fadeOut = Math.floor(sampleRate * 0.03);
  for (let i = 0; i < samples.length; i++) {
    if (i < fadeIn) samples[i] *= i / fadeIn;
    const tail = samples.length - i;
    if (tail < fadeOut) samples[i] *= tail / fadeOut;
  }

  // The window must be shorter than the cue, or the measurement averages in
  // trailing silence and the gain doubles to compensate — which drove the
  // short interaction cues straight into the limiter.
  const win = Math.min(samples.length, Math.floor(sampleRate * window));
  let energy = 0;
  for (let i = 0; i < win; i++) energy += samples[i] * samples[i];
  let loudest = energy;
  for (let i = win; i < samples.length; i++) {
    energy += samples[i] * samples[i] - samples[i - win] * samples[i - win];
    if (energy > loudest) loudest = energy;
  }
  const shortTermRms = Math.sqrt(Math.max(0, loudest) / win);
  const scale = shortTermRms > 1e-6 ? targetRms / shortTermRms : 1;

  // Round the transient against the ceiling instead of scaling the whole cue
  // down to fit it. A plucked string is one very tall spike over a quiet decay,
  // so a flat trim would drag the audible body down with the spike — which is
  // what made the higher combo steps quieter than the lower ones.
  for (let i = 0; i < samples.length; i++) {
    samples[i] = ceiling * Math.tanh((samples[i] * scale) / ceiling);
  }
  return samples;
}

/**
 * Relative loudness of each cue, in short-term RMS. These are the mix — a tap
 * has to sit under an answer, an answer under a lesson ending.
 */
/**
 * Measurement window for the short interaction cues. 130ms is roughly the
 * ear's integration time for a transient, so it reflects how loud a knock
 * actually seems — and unlike the 300ms window it fits inside the cue.
 */
const SHORT_CUE_WINDOW = 0.13;

const LOUDNESS = {
  tap: 0.065,
  correct: 0.2,
  incorrect: 0.19,
  streak: 0.21,
  lessonComplete: 0.23,
  achievement: 0.21,
};

// ── Instrument models ───────────────────────────────────────────────────────

/**
 * Koto — Karplus-Strong plucked string.
 *
 * A noise burst is loaded into a delay line one period long and recirculated
 * through a one-pole lowpass; the noise decorrelates into a pitched tone while
 * its high partials die first, which is exactly what a plucked silk string
 * does and what a summed sine stack cannot fake.
 */
function koto(
  freq,
  duration,
  {
    decay = 1.4,
    brightness = 0.55,
    seed = 1,
    pickPos = 0.22,
    attackMs = 2.5,
  } = {},
) {
  const n = Math.max(2, Math.round(SAMPLE_RATE / freq));
  const out = new Float32Array(Math.floor(duration * SAMPLE_RATE));
  const buf = new Float32Array(n);
  const rnd = noiseSource(seed);

  // Excitation: lowpassed noise, then a comb notch standing in for the point
  // along the string where the plectrum strikes.
  let lp = 0;
  for (let i = 0; i < n; i++) {
    lp += (rnd() - lp) * brightness;
    buf[i] = lp;
  }
  const pickDelay = Math.max(1, Math.floor(n * pickPos));
  const excited = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    excited[i] = buf[i] - (i >= pickDelay ? buf[i - pickDelay] * 0.7 : 0);
  }
  buf.set(excited);

  // Loop gain chosen so the string reaches -60 dB after `decay` seconds.
  const loopGain = Math.exp(Math.log(0.001) / Math.max(1, decay * freq));

  // A plectrum leaves the string over a couple of milliseconds, so the attack
  // is a steep ramp rather than a vertical edge. Without it the cue is one
  // sample-wide spike that eats all the headroom and nothing else can be heard.
  // A longer ramp also lowers the crest factor, which matters for the short
  // cues: they need real loudness out of very little time, and a knife-edge
  // transient forces the limiter to squash the very attack that makes a pluck
  // sound plucked.
  const attack = Math.floor((SAMPLE_RATE * attackMs) / 1000);

  let idx = 0;
  let prev = 0;
  for (let i = 0; i < out.length; i++) {
    const cur = buf[idx];
    out[i] = cur * (i < attack ? i / attack : 1);
    buf[idx] = (cur + prev) * 0.5 * loopGain;
    prev = cur;
    idx = (idx + 1) % n;
  }
  return out;
}

/**
 * Rin (おりん) — struck bronze bowl by modal synthesis.
 *
 * The partial ratios are deliberately inharmonic. That inharmonicity is the
 * entire difference between "a bell" and "a beep": integer harmonics fuse into
 * one buzzy tone, non-integer ones beat against each other and shimmer.
 */
function rin(freq, duration, { seed = 7, strike = 0.5 } = {}) {
  const ratios = [1, 2.74, 5.36, 8.93, 13.34, 18.6];
  const amps = [1, 0.5, 0.32, 0.18, 0.1, 0.05];
  const out = new Float32Array(Math.floor(duration * SAMPLE_RATE));
  const rnd = noiseSource(seed);

  for (let k = 0; k < ratios.length; k++) {
    const f = freq * ratios[k];
    if (f > SAMPLE_RATE * 0.45) continue;
    // Higher modes radiate faster, so they decay faster.
    const tau = (duration * 0.55) / (1 + 0.75 * k);
    const phase = rnd() * Math.PI;
    // A few cents of detune per mode makes two struck bowls never identical.
    const detune = 1 + rnd() * 0.0015;
    for (let i = 0; i < out.length; i++) {
      const t = i / SAMPLE_RATE;
      out[i] +=
        amps[k] *
        Math.sin(2 * Math.PI * f * detune * t + phase) *
        Math.exp(-t / tau);
    }
  }

  // Mallet contact: 4 ms of bright noise, the click your ear uses to tell
  // "struck" from "faded in".
  const contact = Math.floor(SAMPLE_RATE * 0.004);
  for (let i = 0; i < contact && i < out.length; i++) {
    out[i] += rnd() * strike * (1 - i / contact);
  }
  return out;
}

/**
 * Hyoshigi (拍子木) — the hardwood clappers struck before a kabuki scene.
 * Broadband click filtered through two wood resonances, gone in ~60 ms.
 */
function hyoshigi(duration, { body = 1750, ring = 3300, seed = 11 } = {}) {
  const len = Math.floor(duration * SAMPLE_RATE);
  const burst = new Float32Array(len);
  const rnd = noiseSource(seed);
  const burstLen = Math.floor(SAMPLE_RATE * 0.006);
  for (let i = 0; i < burstLen && i < len; i++) {
    burst[i] = rnd() * Math.exp(-i / (burstLen * 0.35));
  }

  const low = bandpass(burst, body, 9);
  const high = bandpass(burst, ring, 14);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 42);
    out[i] = (low[i] * 1.0 + high[i] * 0.55 + burst[i] * 0.25) * env;
  }
  return out;
}

/**
 * Taiko — struck drum head. The pitch drop over the first ~80 ms is the
 * defining gesture; a fixed-pitch sine reads as a synth tom, not a drum.
 */
function taiko(
  duration,
  { startFreq = 190, endFreq = 62, seed = 23, slap = 0.4 } = {},
) {
  const len = Math.floor(duration * SAMPLE_RATE);
  const out = new Float32Array(len);
  const rnd = noiseSource(seed);
  let phase = 0;

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const bend = Math.exp(-t * 26);
    const f = endFreq + (startFreq - endFreq) * bend;
    phase += (2 * Math.PI * f) / SAMPLE_RATE;
    out[i] = Math.sin(phase) * Math.exp(-t * 6.5);
  }

  // Skin slap: short mid-band noise so the hit has an edge, not just weight.
  const skin = new Float32Array(len);
  const slapLen = Math.floor(SAMPLE_RATE * 0.012);
  for (let i = 0; i < slapLen && i < len; i++) {
    skin[i] = rnd() * (1 - i / slapLen);
  }
  const skinFiltered = bandpass(skin, 420, 2.2);
  for (let i = 0; i < len; i++) out[i] += skinFiltered[i] * slap;

  return out;
}

// ── Yo scale (ヨナ抜き) ──────────────────────────────────────────────────────
// D4 E4 G4 A4 B4 — the combo ladder walks up these five degrees.
const YO_SCALE = [293.66, 329.63, 392.0, 440.0, 493.88];

// ── Cue construction ────────────────────────────────────────────────────────

/**
 * Correct answer, one cue per combo step.
 *
 * Same instrument as the lesson-ending fanfare, different articulation: this
 * is a *muted* pluck — the palm damps the string the instant it is struck, a
 * technique a koto player actually uses. The open, ringing version is saved
 * for arrival moments.
 *
 * That distinction is the whole point, and getting it wrong is what made the
 * first version grate. An open koto note rings for 900ms, but a learner checks
 * an answer and taps Continue inside about a second, so the note was still
 * sounding over the next question — it read as someone playing music at you
 * rather than as the app confirming your answer. Interaction sounds have to be
 * short, dry and close to the ear; only arrivals get to ring.
 *
 * The pitch still climbs a scale degree per correct answer in a row, which
 * survives the shortening: the ear fixes a pitch in well under 50ms.
 */
function buildCorrect(step) {
  const freq = YO_SCALE[Math.min(step, YO_SCALE.length - 1)];
  // The note has done its work by ~0.35s and everything past that sits on an
  // inaudible -45dB reverb floor, so the buffer stops just after and lets the
  // end-fade take the remainder.
  const buf = silence(0.62);

  // 0.55s to silence. The first attempt rang for 1.1s and was still sounding
  // over the next question; the correction went too far the other way at
  // 0.22s, which damps the string so hard it stops being a string at all and
  // reads as two objects knocking together. A plucked note needs to be heard
  // *decaying* to register as plucked.
  mixInto(
    buf,
    koto(freq, 0.7, {
      decay: 0.55,
      brightness: 0.6 + step * 0.05,
      seed: 101 + step,
      attackMs: 4,
    }),
    0,
    1,
  );

  // A quiet octave above, struck a hair late — one string exciting its
  // neighbour. This shimmer is much of what separates a koto from a sine
  // pluck. Left out of the chord-forming range: no fifth, which is what
  // turned the first version into music being played at the learner.
  mixInto(
    buf,
    koto(freq * 2, 0.4, {
      decay: 0.3,
      brightness: 0.72,
      seed: 211 + step,
      attackMs: 3,
    }),
    0.014,
    0.18,
  );

  // Just enough room to have an edge to fade against, well short of a hall.
  return finalize(
    softClip(addRoomTail(buf, { mix: 0.09, decay: 0.52, damping: 0.42 }), 1.05),
    LOUDNESS.correct,
    { window: SHORT_CUE_WINDOW },
  );
}

/**
 * Wrong answer. A single dull wooden knock — the sound of a piece not fitting.
 *
 * Cut down from 620ms for the same reason as the answer cue, and the drum
 * under it was pulled up from 54Hz to 96Hz: a note that low turns to mud on a
 * phone speaker and, at that length, read as ominous. Being wrong is
 * information, not a verdict.
 */
function buildIncorrect() {
  const buf = silence(0.44);
  mixInto(buf, hyoshigi(0.26, { body: 900, ring: 1900, seed: 401 }), 0, 0.95);
  mixInto(
    buf,
    taiko(0.3, { startFreq: 165, endFreq: 96, seed: 409, slap: 0.18 }),
    0.006,
    0.4,
  );
  return finalize(
    softClip(addRoomTail(buf, { mix: 0.075, decay: 0.48, damping: 0.42 }), 1.1),
    LOUDNESS.incorrect,
    { window: SHORT_CUE_WINDOW },
  );
}

/** Selection tick — a single quiet wood tap, short enough to fire rapidly. */
function buildTap() {
  const buf = silence(0.12);
  mixInto(buf, hyoshigi(0.1, { body: 2400, ring: 4200, seed: 503 }), 0, 0.5);
  return finalize(buf, LOUDNESS.tap, { window: SHORT_CUE_WINDOW });
}

/**
 * Lesson complete. The koto walks the whole yo scale and the rin bell lands on
 * the octave — the scale that has been climbing all lesson finally arrives.
 */
function buildLessonComplete() {
  const buf = silence(2.1);
  YO_SCALE.forEach((freq, i) => {
    mixInto(
      buf,
      koto(freq, 1.0, {
        decay: 1.2,
        brightness: 0.55 + i * 0.04,
        seed: 601 + i,
      }),
      i * 0.085,
      0.55 + i * 0.05,
    );
  });
  mixInto(
    buf,
    koto(YO_SCALE[0] * 2, 1.3, { decay: 1.6, brightness: 0.6, seed: 651 }),
    0.44,
    0.7,
  );
  mixInto(
    buf,
    rin(YO_SCALE[0] * 2, 1.6, { seed: 661, strike: 0.35 }),
    0.46,
    0.5,
  );
  mixInto(
    buf,
    taiko(0.7, { startFreq: 160, endFreq: 58, seed: 671, slap: 0.2 }),
    0.44,
    0.35,
  );
  return finalize(
    softClip(addRoomTail(buf, { mix: 0.2, decay: 0.78 }), 1.1),
    LOUDNESS.lessonComplete,
  );
}

/**
 * Achievement. One rin bell, struck alone and left to ring. Nothing else
 * happens in the mix — the restraint is the point, it has to feel rarer than
 * finishing a lesson.
 */
function buildAchievement() {
  const buf = silence(2.6);
  mixInto(buf, rin(392.0, 2.3, { seed: 701, strike: 0.55 }), 0, 1.0);
  // Second, softer strike a beat later — a bowl answering itself.
  mixInto(buf, rin(587.33, 1.6, { seed: 719, strike: 0.28 }), 0.34, 0.42);
  return finalize(
    softClip(addRoomTail(buf, { mix: 0.22, decay: 0.82 }), 1.0),
    LOUDNESS.achievement,
  );
}

/**
 * Streak. Two taiko hits (don–don) with the koto flaring upward over them:
 * momentum, carried by rhythm rather than by a whoosh.
 */
function buildStreak() {
  const buf = silence(1.5);
  mixInto(
    buf,
    taiko(0.6, { startFreq: 210, endFreq: 66, seed: 801, slap: 0.35 }),
    0,
    0.9,
  );
  mixInto(
    buf,
    taiko(0.75, { startFreq: 230, endFreq: 70, seed: 811, slap: 0.42 }),
    0.155,
    1.0,
  );
  [YO_SCALE[1], YO_SCALE[2], YO_SCALE[4]].forEach((freq, i) => {
    mixInto(
      buf,
      koto(freq, 0.8, { decay: 0.9, brightness: 0.62, seed: 821 + i }),
      0.3 + i * 0.07,
      0.42,
    );
  });
  mixInto(buf, rin(YO_SCALE[4], 1.0, { seed: 841, strike: 0.3 }), 0.46, 0.3);
  return finalize(
    softClip(addRoomTail(buf, { mix: 0.17, decay: 0.72 }), 1.12),
    LOUDNESS.streak,
  );
}

// ── Write files ─────────────────────────────────────────────────────────────

const soundsDir = path.join(__dirname, "..", "assets", "sounds");
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

function write(name, samples) {
  const wav = createWavBuffer(samples);
  const file = path.join(soundsDir, name);
  fs.writeFileSync(file, wav);
  console.log(`  ${name.padEnd(22)} ${(wav.length / 1024).toFixed(1)} KB`);
}

console.log("Generating 和音 sound palette…");

// Combo ladder. `correct.wav` is step 0 so existing call sites keep working.
write("correct.wav", buildCorrect(0));
for (let step = 1; step < YO_SCALE.length; step++) {
  write(`correct-${step + 1}.wav`, buildCorrect(step));
}

write("incorrect.wav", buildIncorrect());
write("tap.wav", buildTap());
write("lesson-complete.wav", buildLessonComplete());
write("achievement.wav", buildAchievement());
write("streak.wav", buildStreak());

console.log("Done.");
