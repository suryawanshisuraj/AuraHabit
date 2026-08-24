/**
 * AuraHabit - Master Audio & Ambient Sound Machine
 * Generates crisp UI feedback tones + ambient focus sound generator (White Noise, Rain, Deep Drone).
 */

class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.ambientNode = null;
    this.ambientGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  // UI Click sound
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      // Silent catch
    }
  }

  // Completion Chord Sound
  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.05);

        gain.gain.setValueAtTime(0.001, now + index * 0.05);
        gain.gain.linearRampToValueAtTime(0.14, now + index * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + index * 0.05);
        osc.stop(now + index * 0.05 + 0.35);
      });
    } catch (e) {
      // Silent catch
    }
  }

  // Alarm Tone
  playTimerAlarm() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const tones = [880, 1174.66, 880, 1174.66];

      tones.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);

        gain.gain.setValueAtTime(0.2, now + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.1);
      });
    } catch (e) {
      // Silent catch
    }
  }

  // Fanfare for Badges
  playBadgeUnlock() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const melody = [
        { f: 523.25, d: 0.1, delay: 0 },
        { f: 659.25, d: 0.1, delay: 0.1 },
        { f: 783.99, d: 0.1, delay: 0.2 },
        { f: 1046.50, d: 0.4, delay: 0.3 }
      ];

      melody.forEach(item => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(item.f, now + item.delay);

        gain.gain.setValueAtTime(0.2, now + item.delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + item.delay + item.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + item.delay);
        osc.stop(now + item.delay + item.d);
      });
    } catch (e) {
      // Silent catch
    }
  }

  // Ambient Sound Machine: White Noise / Deep Meditation Drone
  startAmbient(type = 'drone') {
    this.stopAmbient();
    this.init();
    if (!this.ctx) return;

    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.05, this.ctx.currentTime);

      if (type === 'drone') {
        // Binaural 432Hz Ambient Drone
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.frequency.value = 108; // Low A
        osc2.frequency.value = 112; // Slight offset binaural beat
        osc1.connect(this.ambientGain);
        osc2.connect(this.ambientGain);
        osc1.start();
        osc2.start();
        this.ambientNode = [osc1, osc2];
      } else if (type === 'noise') {
        // Synthesized White Noise Buffer
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        noise.connect(this.ambientGain);
        noise.start();
        this.ambientNode = [noise];
      }

      this.ambientGain.connect(this.ctx.destination);
    } catch (e) {
      console.error(e);
    }
  }

  stopAmbient() {
    if (this.ambientNode) {
      if (Array.isArray(this.ambientNode)) {
        this.ambientNode.forEach(n => {
          try { n.stop(); } catch (e) {}
        });
      }
      this.ambientNode = null;
    }
  }
}

export const soundFx = new AudioSynthesizer();
