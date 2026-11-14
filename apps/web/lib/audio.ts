/**
 * Authentic Indian Wedding Audio Synthesizer
 * Zero-dependency Web Audio API implementation for auspicious celebration music.
 * Generates traditional Shehnai, Royal Sitar, and Flute melodies with Tanpura drones.
 */

export type AudioPreset = 'shehnai' | 'sitar' | 'flute';

export interface PresetInfo {
  id: AudioPreset;
  name: string;
  hindiName: string;
  description: string;
}

export const AUDIO_PRESETS: PresetInfo[] = [
  {
    id: 'shehnai',
    name: 'Mangal Shehnai & Tanpura',
    hindiName: 'मंगल शहनाई एवं तानपुरा',
    description: 'Auspicious Vedic celebration melodies played during sacred pheras',
  },
  {
    id: 'sitar',
    name: 'Royal Sitar & Tanpura',
    hindiName: 'रॉयल सितार राग',
    description: 'Regal classical raga strings with rich sympathetic harmonics',
  },
  {
    id: 'flute',
    name: 'Bansuri & Temple Chimes',
    hindiName: 'मधुर बांसुरी एवं घंटियाँ',
    description: 'Serene bamboo flute meditation melody with gentle temple bells',
  },
];

// Frequencies for Raag Bilawal / Yaman (Sa, Re, Ga, Ma, Pa, Dha, Ni, Sa)
// Key of C# (138.59 Hz base Sa)
const SCALE_FREQS = [
  138.59, // Sa  (C#3)
  155.56, // Re  (D#3)
  174.61, // Ga  (F3)
  196.0,  // Ma  (G3)
  207.65, // Pa  (G#3)
  233.08, // Dha (A#3)
  261.63, // Ni  (C4)
  277.18, // Sa' (C#4)
  311.13, // Re' (D#4)
  349.23, // Ga' (F4)
  415.3,  // Pa' (G#4)
];

export class WeddingAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning = false;
  private activePreset: AudioPreset = 'shehnai';
  private timerId: ReturnType<typeof setInterval> | null = null;
  private droneOscs: OscillatorNode[] = [];

  public getActivePreset(): AudioPreset {
    return this.activePreset;
  }

  public isAudioPlaying(): boolean {
    return this.isRunning;
  }

  public start(preset: AudioPreset = 'shehnai'): void {
    if (typeof window === 'undefined') return;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    this.stop(); // Stop any existing sequence
    this.activePreset = preset;
    this.isRunning = true;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // 1. Start Tanpura Drone
    this.startTanpuraDrone();

    // 2. Start Melodic Sequence
    this.startMelodicSequence(preset);
  }

  public stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    for (const osc of this.droneOscs) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignore if already stopped
      }
    }
    this.droneOscs = [];

    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      } catch {
        // ignore
      }
    }

    this.isRunning = false;
  }

  private startTanpuraDrone(): void {
    if (!this.ctx || !this.masterGain) return;

    // Tanpura strings: Pa (207.65 Hz), Sa' (277.18 Hz), Sa (138.59 Hz)
    const droneFreqs = [138.59, 207.65, 277.18, 554.37];
    droneFreqs.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const droneGain = this.ctx.createGain();

      osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Low pass filter to soften the sawtooth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      // Subtle slow amplitude modulation for tanpura strum effect
      droneGain.gain.setValueAtTime(0.04 / (i + 1), this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(this.masterGain);

      osc.start();
      this.droneOscs.push(osc);
    });
  }

  private startMelodicSequence(preset: AudioPreset): void {
    if (!this.ctx) return;

    // Auspicious wedding melody pattern indices
    const pattern = [
      0, 2, 4, 7, // Sa Ga Pa Sa'
      4, 2, 0,    // Pa Ga Sa
      2, 4, 7, 9, // Ga Pa Sa' Ga'
      7, 4, 2, 0, // Sa' Pa Ga Sa
      4, 6, 7,    // Pa Ni Sa'
      9, 7, 4, 0, // Ga' Sa' Pa Sa
    ];

    let noteIndex = 0;
    const intervalMs = preset === 'sitar' ? 450 : preset === 'shehnai' ? 600 : 750;

    this.timerId = setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;

      const scaleIdx = pattern[noteIndex % pattern.length];
      const freq = SCALE_FREQS[scaleIdx % SCALE_FREQS.length];
      noteIndex++;

      this.playNote(freq, preset);
    }, intervalMs);
  }

  private playNote(freq: number, preset: AudioPreset): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    if (preset === 'shehnai') {
      // Shehnai has rich nasal harmonics (sawtooth + bandpass)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * 2, now); // Higher register

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1200, now);
      bandpass.Q.setValueAtTime(3.5, now);

      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.12, now + 0.08); // Slight breath attack
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(bandpass);
      bandpass.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.7);
    } else if (preset === 'sitar') {
      // Sitar has metallic plucking with fast attack and long resonance
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Add high overtone for metallic string twang
      const overtone = this.ctx.createOscillator();
      overtone.type = 'sawtooth';
      overtone.frequency.setValueAtTime(freq * 3, now);

      const overGain = this.ctx.createGain();
      overGain.gain.setValueAtTime(0.06, now);
      overGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      overtone.connect(overGain);
      overGain.connect(this.masterGain);
      overtone.start(now);
      overtone.stop(now + 0.25);

      noteGain.gain.setValueAtTime(0.15, now);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.6);
    } else {
      // Bansuri (Flute) - pure sine wave with gentle breath envelope
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 2, now);

      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.15, now + 0.12);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.9);
    }
  }
}
