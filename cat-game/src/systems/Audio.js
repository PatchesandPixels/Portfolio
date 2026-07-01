/* ============================================================
   Audio — tiny WebAudio synth. No asset files; cues are generated.
   Lazy-initialised on the first user gesture (autoplay policy).
   The game is fully playable with sound muted or unavailable.
   ============================================================ */

export class Audio {
  constructor(settings) {
    this.settings = settings;
    this.ctx = null;
    this.master = null;
  }

  /** Call from a user gesture (start click) so the context can run. */
  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return; // no WebAudio: game still works, silently
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.settings.get("muted") ? 0 : this.settings.get("volume");
    this.master.connect(this.ctx.destination);
  }

  setMuted(muted) {
    if (this.master) this.master.gain.value = muted ? 0 : this.settings.get("volume");
  }

  /** Play a short tone. type/freq sweep gives each cue character. */
  _tone(freq, dur, { type = "sine", to = null, gain = 0.3 } = {}) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, now + dur);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(gain, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  play(cue) {
    switch (cue) {
      case "crouch":   this._tone(220, 0.18, { type: "sine", to: 180, gain: 0.18 }); break;
      case "lunge":    this._tone(180, 0.22, { type: "sawtooth", to: 420, gain: 0.25 }); break;
      case "miss":     this._tone(300, 0.25, { type: "triangle", to: 140, gain: 0.2 }); break;
      case "nearmiss": this._tone(880, 0.12, { type: "sine", to: 1320, gain: 0.22 }); break;
      case "stage":    this._tone(523, 0.1, { type: "square", gain: 0.18 });
                       setTimeout(() => this._tone(784, 0.16, { type: "square", gain: 0.18 }), 90); break;
      case "frustrated": this._tone(160, 0.3, { type: "sawtooth", to: 120, gain: 0.22 }); break;
      case "gameover": this._tone(440, 0.5, { type: "sawtooth", to: 90, gain: 0.3 }); break;
      default: break;
    }
  }
}
