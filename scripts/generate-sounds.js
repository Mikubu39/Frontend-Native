/**
 * Script to generate high quality PCM WAV sound effects for Nihongo:
 * 1. correct.wav - Pleasant major chord chime (C5 -> E5 -> G5) with exponential decay
 * 2. incorrect.wav - Soft mellow low double-tone (A3 -> F3)
 */

const fs = require("fs");
const path = require("path");

function createWavBuffer(samples, sampleRate = 44100) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF identifier
  buffer.write("RIFF", 0);
  // File size minus 8 bytes RIFF header
  buffer.writeUInt32LE(36 + dataSize, 4);
  // WAVE identifier
  buffer.write("WAVE", 8);
  // Format chunk identifier
  buffer.write("fmt ", 12);
  // Format chunk length (16 for PCM)
  buffer.writeUInt32LE(16, 16);
  // Sample format (1 is PCM)
  buffer.writeUInt16LE(1, 20);
  // Number of channels
  buffer.writeUInt16LE(numChannels, 22);
  // Sample rate
  buffer.writeUInt32LE(sampleRate, 24);
  // Byte rate
  buffer.writeUInt32LE(byteRate, 28);
  // Block align
  buffer.writeUInt16LE(blockAlign, 32);
  // Bits per sample
  buffer.writeUInt16LE(bitsPerSample, 34);
  // Data chunk identifier
  buffer.write("data", 36);
  // Data chunk length
  buffer.writeUInt32LE(dataSize, 40);

  // Write PCM 16-bit signed integer samples
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intSample = s < 0 ? s * 0x8000 : s * 0x7fff;
    buffer.writeInt16LE(Math.floor(intSample), 44 + i * 2);
  }

  return buffer;
}

function generateCorrectSound() {
  const sampleRate = 44100;
  const duration = 0.42; // ~420ms
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  // Arpeggio notes: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.5Hz)
  const notes = [
    { freq: 523.25, start: 0.0, end: 0.35, amp: 0.35 },
    { freq: 659.25, start: 0.07, end: 0.38, amp: 0.4 },
    { freq: 783.99, start: 0.14, end: 0.42, amp: 0.45 },
    { freq: 1046.5, start: 0.2, end: 0.42, amp: 0.3 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (const note of notes) {
      if (t >= note.start && t <= note.end) {
        const noteT = t - note.start;
        const noteDur = note.end - note.start;
        // ADSR Envelope: Fast 5ms attack, smooth exponential decay
        const attack = Math.min(1, noteT / 0.005);
        const decay = Math.exp(-noteT * 9.5);
        const envelope = attack * decay;

        // Fundamental + soft bell harmonic (2nd and 3rd harmonic for crisp shimmer)
        const fundamental = Math.sin(2 * Math.PI * note.freq * noteT);
        const harmonic2 =
          0.25 * Math.sin(2 * Math.PI * (note.freq * 2) * noteT);
        const harmonic3 = 0.1 * Math.sin(2 * Math.PI * (note.freq * 3) * noteT);

        sample += (fundamental + harmonic2 + harmonic3) * envelope * note.amp;
      }
    }

    samples[i] = sample * 0.8;
  }

  return createWavBuffer(samples, sampleRate);
}

function generateIncorrectSound() {
  const sampleRate = 44100;
  const duration = 0.38; // ~380ms
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  // Soft low two-tone: D3 (146.83Hz) -> Bb2 (116.54Hz)
  const pulses = [
    { freq: 146.83, start: 0.0, end: 0.18, amp: 0.45 },
    { freq: 116.54, start: 0.15, end: 0.38, amp: 0.5 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (const pulse of pulses) {
      if (t >= pulse.start && t <= pulse.end) {
        const pulseT = t - pulse.start;
        // Mellow envelope with warm gentle decay
        const attack = Math.min(1, pulseT / 0.015);
        const decay = Math.exp(-pulseT * 8.0);
        const envelope = attack * decay;

        // Warm rounded tone
        const fundamental = Math.sin(2 * Math.PI * pulse.freq * pulseT);
        const warmHarmonic =
          0.2 * Math.sin(2 * Math.PI * (pulse.freq * 1.5) * pulseT);

        sample += (fundamental + warmHarmonic) * envelope * pulse.amp;
      }
    }

    samples[i] = sample * 0.8;
  }

  return createWavBuffer(samples, sampleRate);
}

const soundsDir = path.join(__dirname, "..", "assets", "sounds");
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

const correctWav = generateCorrectSound();
fs.writeFileSync(path.join(soundsDir, "correct.wav"), correctWav);
console.log(
  `Generated ${path.join(soundsDir, "correct.wav")} (${correctWav.length} bytes)`,
);

const incorrectWav = generateIncorrectSound();
fs.writeFileSync(path.join(soundsDir, "incorrect.wav"), incorrectWav);
console.log(
  `Generated ${path.join(soundsDir, "incorrect.wav")} (${incorrectWav.length} bytes)`,
);
