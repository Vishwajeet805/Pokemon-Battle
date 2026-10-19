import { ElementType } from '../types/game';

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private hapticsEnabled: boolean = true;

  constructor() {
    // Check saved preferences
    try {
      const savedMute = localStorage.getItem('pm_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      const savedHaptics = localStorage.getItem('pm_haptics');
      if (savedHaptics !== null) {
        this.hapticsEnabled = savedHaptics === 'true';
      }
    } catch {
      // localStorage may fail in iframe/private browsing
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('pm_muted', String(this.isMuted));
    } catch {
      // ignore
    }
    if (!this.isMuted) {
      this.playSelect();
    }
    return this.isMuted;
  }

  public getHaptics(): boolean {
    return this.hapticsEnabled;
  }

  public toggleHaptics(): boolean {
    this.hapticsEnabled = !this.hapticsEnabled;
    try {
      localStorage.setItem('pm_haptics', String(this.hapticsEnabled));
    } catch {
      // ignore
    }
    return this.hapticsEnabled;
  }

  public vibrate(pattern: number | number[]) {
    if (!this.hapticsEnabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignored
    }
  }

  // --- SOUND EFFECTS ---

  public playSelect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(720, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);

    this.vibrate(25);
  }

  public playLockIn() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(440, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);

    osc2.frequency.setValueAtTime(660, now);
    osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);

    this.vibrate([40, 30, 60]);
  }

  public playCountdown(count: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (count > 0) {
      // Short high pitch beep for 3, 2, 1
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 + (4 - count) * 120, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
      this.vibrate(40);
    } else {
      // 0 = BATTLE START!!
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
      this.vibrate([80, 50, 150]);
    }
  }

  public playAttack(type: ElementType) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    switch (type) {
      case 'fire': {
        // White noise burst with low-pass filter sweep
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(1800, now + 0.2);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.4);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.4);
        break;
      }
      case 'water': {
        // Sine wave pitch sweep down + flutter
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.35);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      case 'electric': {
        // Rapid square wave arpeggio
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.setValueAtTime(1400, now + 0.05);
        osc.frequency.setValueAtTime(600, now + 0.1);
        osc.frequency.setValueAtTime(1800, now + 0.15);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'ice': {
        // High crystalline chime
        [1200, 1600, 2100].forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          gain.gain.setValueAtTime(0.18, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.25);
        });
        break;
      }
      case 'psychic': {
        // Eerie rising sine wave
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.35);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
      default: {
        // Punch / Physical thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.2);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
    }
  }

  public playImpact(effectiveness: 'super_effective' | 'normal' | 'not_effective' | 'immune', isCrit: boolean) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (effectiveness === 'super_effective') {
      // High triumphant ding + heavy crunch
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(980, now);
      osc1.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      this.vibrate([70, 40, 100]);
    } else if (isCrit) {
      this.vibrate([100, 30, 80]);
    } else {
      this.vibrate(50);
    }
  }

  public playFaint() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.6);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);

    this.vibrate([80, 80, 120]);
  }

  public playMatchPoint() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [0, 0.15, 0.3].forEach((offset) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now + offset);
      gain.gain.setValueAtTime(0.2, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.12);
    });

    this.vibrate([60, 40, 60, 40, 100]);
  }

  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Classic victory fanfare: C4, E4, G4, C5 (held)
    const notes = [
      { f: 523.25, t: 0, d: 0.15 },    // C5
      { f: 523.25, t: 0.16, d: 0.15 }, // C5
      { f: 523.25, t: 0.32, d: 0.15 }, // C5
      { f: 523.25, t: 0.48, d: 0.4 },  // C5
      { f: 415.3,  t: 0.9,  d: 0.4 },  // Ab4
      { f: 466.16, t: 1.32, d: 0.4 },  // Bb4
      { f: 523.25, t: 1.74, d: 0.8 },  // C5
    ];

    notes.forEach((note) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.28, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + note.t);
      osc.stop(now + note.t + note.d);
    });

    this.vibrate([100, 50, 100, 50, 250]);
  }

  public playDefeat() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 392.0, t: 0, d: 0.3 },    // G4
      { f: 369.99, t: 0.32, d: 0.3 }, // F#4
      { f: 349.23, t: 0.64, d: 0.3 }, // F4
      { f: 329.63, t: 0.96, d: 0.6 }, // E4
    ];

    notes.forEach((note) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.2, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + note.t);
      osc.stop(now + note.t + note.d);
    });
  }
}

export const sounds = new SoundManager();
