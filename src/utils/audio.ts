/**
 * Procedural Web Audio API sound synthesizer for FuzzPop.
 * Zero external audio files required - 100% reliable offline.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private musicInterval: number | null = null;
  private musicStep: number = 0;
  private isMusicPlaying: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    } else if (this.isMusicPlaying) {
      this.startMusic();
    }
  }

  public isSoundOn() {
    return this.soundEnabled;
  }

  public isMusicOn() {
    return this.musicEnabled;
  }

  // Button tap
  public playClick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.05);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Shoot launch whoosh
  public playShoot() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // Wall bounce boing
  public playWallBounce() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.09);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Ball attaches to cluster
  public playAttach() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.07);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Satisfying pop sound (pitch raises with combo count)
  public playPop(combo: number = 1, index: number = 0) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + index * 0.04;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Pentatonic scale base frequencies for musical pops
    const baseFreqs = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const baseFreq = baseFreqs[Math.min(combo - 1 + index, baseFreqs.length - 1)];

    osc.frequency.setValueAtTime(baseFreq * 0.7, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.03);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.1);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    // Add high chirp overtone
    const overtone = this.ctx.createOscillator();
    const overtoneGain = this.ctx.createGain();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(baseFreq * 2.2, now);
    overtone.frequency.exponentialRampToValueAtTime(baseFreq * 3.5, now + 0.03);
    overtoneGain.gain.setValueAtTime(0.15, now);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    overtone.connect(overtoneGain);
    overtoneGain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
    overtone.start(now);
    overtone.stop(now + 0.08);
  }

  // Falling group drop sound
  public playDrop(count: number = 1) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < Math.min(count, 4); i++) {
      const delay = i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700 - i * 50, now + delay);
      osc.frequency.exponentialRampToValueAtTime(260 - i * 30, now + delay + 0.18);

      gain.gain.setValueAtTime(0.25, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.18);
    }
  }

  // Combo announcement chime
  public playCombo(comboCount: number) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const delay = idx * 0.06;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * (1 + (comboCount - 1) * 0.15), now + delay);

      gain.gain.setValueAtTime(0.22, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.25);
    });
  }

  // Chameleon color change magic sound
  public playMorph() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const delay = idx * 0.045;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + delay + 0.16);

      gain.gain.setValueAtTime(0.28, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.16);
    });
  }

  // Level Complete fanfare
  public playLevelComplete() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const melody = [
      { f: 523.25, d: 0.1 }, // C5
      { f: 659.25, d: 0.1 }, // E5
      { f: 783.99, d: 0.1 }, // G5
      { f: 1046.5, d: 0.25 }, // C6
      { f: 880.0, d: 0.12 }, // A5
      { f: 1046.5, d: 0.4 }, // C6 hold
    ];

    let t = this.ctx.currentTime;
    melody.forEach((note) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + note.d);
      t += note.d * 0.9;
    });
  }

  // Melancholic, expressive Game Over sound ("üzüntülü bir ses")
  public playGameOver() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Phrase: 3 short mournful steps followed by a long sad downward slide (wah-wah-wah-waaaah)
    const steps = [
      { f: 311.13, duration: 0.26, start: 0.0 },   // Eb4
      { f: 293.66, duration: 0.26, start: 0.28 },  // D4
      { f: 277.18, duration: 0.30, start: 0.56 },  // Db4
      { f: 261.63, endF: 174.61, duration: 0.95, start: 0.88 }, // C4 sliding down into low F3!
    ];

    steps.forEach((step) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      // Warm, muted sad brass/reed timbre
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      const sTime = now + step.start;
      const eTime = sTime + step.duration;

      filter.frequency.setValueAtTime(600, sTime);
      filter.frequency.exponentialRampToValueAtTime(320, eTime);

      osc.frequency.setValueAtTime(step.f, sTime);
      if (step.endF) {
        osc.frequency.setValueAtTime(step.f, sTime + 0.12);
        osc.frequency.exponentialRampToValueAtTime(step.endF, eTime);
      }

      // Mournful slight vibrato
      const lfo = this.ctx!.createOscillator();
      const lfoGain = this.ctx!.createGain();
      lfo.frequency.setValueAtTime(5.2, sTime);
      lfoGain.gain.setValueAtTime(3.5, sTime);
      lfo.connect(osc.frequency);
      lfo.start(sTime);
      lfo.stop(eTime);

      gain.gain.setValueAtTime(0.001, sTime);
      gain.gain.linearRampToValueAtTime(0.22, sTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, eTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(sTime);
      osc.stop(eTime);
    });

    // Sad low minor sub-chords in background
    const chordNotes = [130.81, 155.56, 196.0]; // C minor (C3, Eb3, G3)
    chordNotes.forEach((freq) => {
      const cOsc = this.ctx!.createOscillator();
      const cGain = this.ctx!.createGain();
      cOsc.type = 'sine';
      cOsc.frequency.setValueAtTime(freq, now + 0.15);

      cGain.gain.setValueAtTime(0.07, now + 0.15);
      cGain.gain.exponentialRampToValueAtTime(0.001, now + 1.85);

      cOsc.connect(cGain);
      cGain.connect(this.ctx!.destination);

      cOsc.start(now + 0.15);
      cOsc.stop(now + 1.85);
    });
  }

  // Special Fuzzy sound: Bomb detonation
  public playBomb() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Special Fuzzy sound: Lightning zap
  public playLightning() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.22);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Background procedural music loop (cute playful marimba tune)
  public startMusic() {
    this.isMusicPlaying = true;
    if (!this.musicEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
    }

    // Cute pentatonic scale notes (C major pentatonic: C, D, E, G, A)
    const melody = [
      523.25, 659.25, 783.99, 659.25,
      880.0, 783.99, 659.25, 587.33,
      523.25, 587.33, 659.25, 783.99,
      1046.5, 880.0, 783.99, 659.25,
      440.0, 523.25, 659.25, 523.25,
      587.33, 659.25, 783.99, 587.33,
      523.25, 659.25, 880.0, 1046.5,
      783.99, 659.25, 587.33, 523.25
    ];

    const bass = [
      261.63, 0, 329.63, 0,
      392.0, 0, 329.63, 0,
      220.0, 0, 261.63, 0,
      293.66, 0, 392.0, 0
    ];

    this.musicInterval = window.setInterval(() => {
      if (!this.musicEnabled || !this.ctx || this.ctx.state !== 'running') return;

      const note = melody[this.musicStep % melody.length];
      const bassNote = bass[Math.floor(this.musicStep / 2) % bass.length];
      const now = this.ctx.currentTime;

      // Play soft marimba melody note
      if (note > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now);

        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
      }

      // Play soft bass note
      if (bassNote > 0 && this.musicStep % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassNote * 0.5, now);

        bassGain.gain.setValueAtTime(0.05, now);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);

        bassOsc.start(now);
        bassOsc.stop(now + 0.35);
      }

      this.musicStep++;
    }, 240); // 125 BPM 8th notes
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
