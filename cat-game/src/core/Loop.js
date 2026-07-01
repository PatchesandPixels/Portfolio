/* ============================================================
   Loop — delta-time game loop, resilient to page visibility.

   requestAnimationFrame is PAUSED by the browser whenever the page
   isn't visible (background tabs, and some embedded preview panels
   that keep the document "hidden"). That would freeze the game. So
   the authoritative tick comes from a Web Worker timer, which keeps
   firing regardless of visibility. rAF is used as a fallback when a
   Worker can't be created (e.g. strict CSP).

   dt is clamped so a long stall can never teleport entities.
   ============================================================ */

const TICK_MS = 16; // ~60Hz

export class Loop {
  constructor(onUpdate, onRender) {
    this.onUpdate = onUpdate;
    this.onRender = onRender;
    this._last = 0;
    this._running = false;
    this._worker = null;
    this._raf = 0;
    this._tick = this._tick.bind(this);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._last = performance.now();

    // Preferred: a Worker that posts a tick every ~16ms, immune to
    // visibility throttling. Created from a Blob so there's no extra file.
    try {
      const src = `let h=setInterval(()=>postMessage(0),${TICK_MS});` +
                  `onmessage=(e)=>{if(e.data==='stop'){clearInterval(h);close();}};`;
      const url = URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
      this._worker = new Worker(url);
      URL.revokeObjectURL(url);
      this._worker.onmessage = () => this._step(performance.now());
    } catch {
      this._worker = null; // fall back to rAF below
    }

    // rAF fallback only when no Worker is available.
    if (!this._worker) this._raf = requestAnimationFrame(this._tick);
  }

  stop() {
    this._running = false;
    if (this._worker) {
      this._worker.postMessage("stop");
      this._worker.terminate();
      this._worker = null;
    }
    cancelAnimationFrame(this._raf);
  }

  _tick(now) {
    if (!this._running) return;
    this._step(now);
    this._raf = requestAnimationFrame(this._tick);
  }

  _step(now) {
    let dt = (now - this._last) / 1000;
    if (dt <= 0) return;
    this._last = now;
    if (dt > 0.05) dt = 0.05; // clamp ~3 frames; avoids tunnelling on stalls
    this.onUpdate(dt);
    this.onRender();
  }
}
