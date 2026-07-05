export class AudioController {
  ctx: AudioContext | null = null;
  enabled = true;

  init(): void {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  }

  play(name: string): void {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') void this.ctx.resume();

    switch (name) {
      case 'deal':
        this.hiss(300, 0.12);
        break;
      case 'move':
        this.click(800, 0.03, 0.08);
        break;
      case 'merge':
        this.mechanicalDing();
        break;
      case 'stamp':
        this.ratchet();
        break;
      case 'flush':
        this.flush();
        break;
      case 'invalid':
        this.click(120, 0.08, 0.15);
        break;
      case 'discovery':
        this.chime();
        break;
      case 'win':
        this.fanfare();
        break;
      default:
        this.click(440, 0.05, 0.06);
    }
  }

  private now(): number {
    return this.ctx?.currentTime || 0;
  }

  private click(freq: number, dur: number, vol: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, this.now());
    gain.gain.setValueAtTime(vol, this.now());
    gain.gain.exponentialRampToValueAtTime(0.001, this.now() + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(this.now());
    osc.stop(this.now() + dur);
  }

  private hiss(freq: number, dur: number): void {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.25;
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start(this.now());
  }

  private mechanicalDing(): void {
    if (!this.ctx) return;
    const t = this.now();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.1);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  private ratchet(): void {
    if (!this.ctx) return;
    const t = this.now();
    for (let i = 0; i < 6; i++) {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(180 + i * 40, t + i * 0.04);
      g.gain.setValueAtTime(0.1, t + i * 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.04);
      o.connect(g).connect(this.ctx.destination);
      o.start(t + i * 0.04);
      o.stop(t + i * 0.08);
    }
  }

  private flush(): void {
    if (!this.ctx) return;
    const dur = 0.4;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = 1 - i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * env * env;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, this.now());
    filter.frequency.exponentialRampToValueAtTime(200, this.now() + dur);
    const gain = this.ctx.createGain();
    gain.gain.value = 0.35;
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start(this.now());
  }

  private chime(): void {
    if (!this.ctx) return;
    const t = this.now();
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const o = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, t + i * 0.05);
      g.gain.linearRampToValueAtTime(0.18, t + i * 0.05 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.9);
      o.connect(g).connect(this.ctx!.destination);
      o.start(t + i * 0.05);
      o.stop(t + i * 0.05 + 1);
    });
  }

  private fanfare(): void {
    if (!this.ctx) return;
    const t = this.now();
    const notes = [392, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const o = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      o.type = 'square';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, t + i * 0.12);
      g.gain.linearRampToValueAtTime(0.12, t + i * 0.12 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.35);
      o.connect(g).connect(this.ctx!.destination);
      o.start(t + i * 0.12);
      o.stop(t + i * 0.12 + 0.4);
    });
  }
}
