/* ============================================================
   SOUND — reproduce archivos de /sounds si existen; si no,
   genera efectos sintéticos con WebAudio (placeholders).
   Sustituye los archivos en /sounds para usar los tuyos.
   ============================================================ */

const FILES = {
  hover: 'sounds/hover.mp3',
  select: 'sounds/select.mp3',
  back: 'sounds/back.mp3',
  open: 'sounds/open.mp3',
  boot: 'sounds/boot.mp3',
};

// Tonos de respaldo (si el .mp3 no está disponible)
const SYNTH = {
  hover: { freq: 620, dur: 0.05, type: 'sine', gain: 0.05 },
  select: { freq: 880, dur: 0.12, type: 'triangle', gain: 0.09, slide: 1200 },
  back: { freq: 360, dur: 0.12, type: 'sine', gain: 0.08, slide: 220 },
  open: { freq: 520, dur: 0.22, type: 'triangle', gain: 0.09, slide: 900 },
  boot: { freq: 180, dur: 1.2, type: 'sine', gain: 0.12, slide: 620 },
};

class SoundEngine {
  constructor() {
    this.enabled = true;
    this.ctx = null;
    this.buffers = new Map();
    this.available = new Map();
    this._unlocked = false;
  }

  init(enabled = true) {
    this.enabled = enabled;
    // Desbloquear audio con la primera interacción
    const unlock = () => {
      if (this._unlocked) return;
      this._ensureCtx();
      this._unlocked = true;
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: false });
    window.addEventListener('keydown', unlock, { once: false });
    // Precarga en segundo plano
    Object.entries(FILES).forEach(([k, url]) => this._preload(k, url));
  }

  _ensureCtx() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  async _preload(key, url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('no file');
      const arr = await res.arrayBuffer();
      this._ensureCtx();
      if (!this.ctx) return;
      const buf = await this.ctx.decodeAudioData(arr);
      this.buffers.set(key, buf);
      this.available.set(key, true);
    } catch {
      this.available.set(key, false); // usaremos síntesis
    }
  }

  play(key) {
    if (!this.enabled) return;
    this._ensureCtx();
    if (!this.ctx) return;
    if (this.buffers.has(key)) return this._playBuffer(key);
    this._playSynth(key);
  }

  _playBuffer(key) {
    const src = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    gain.gain.value = key === 'boot' ? 0.5 : 0.35;
    src.buffer = this.buffers.get(key);
    src.connect(gain).connect(this.ctx.destination);
    src.start(0);
  }

  _playSynth(key) {
    const cfg = SYNTH[key] || SYNTH.hover;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = cfg.type;
    osc.frequency.setValueAtTime(cfg.freq, t);
    if (cfg.slide) osc.frequency.exponentialRampToValueAtTime(cfg.slide, t + cfg.dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(cfg.gain, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + cfg.dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + cfg.dur + 0.02);
  }

  setEnabled(v) { this.enabled = v; }
}

export const Sound = new SoundEngine();
