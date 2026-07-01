/* ============================================================
   Cat — the character. Owns its DOM, idle behaviour (wander, look,
   blink), and mood expression. During an attack the AttackManager
   calls beginControl()/setPose()/endControl() to puppeteer the body,
   so attack-specific motion lives in the attack, not here.
   ============================================================ */

import { CONFIG } from "../config.js";

const C = CONFIG.cat;

export class Cat {
  constructor(renderer, pointer, mood) {
    this.renderer = renderer;
    this.pointer = pointer;
    this.mood = mood;

    this.el = renderer.createEntity("cat");
    this.el.style.setProperty("--cat-w", `${C.width}px`);
    this.el.style.setProperty("--cat-h", `${C.height}px`);
    this.el.innerHTML = `
      <div class="cat-shadow"></div>
      <div class="cat-rig">
        <div class="cat-tail"></div>
        <div class="cat-body">
          <div class="cat-belly"></div>
          <div class="cat-leg left"></div>
          <div class="cat-leg right"></div>
        </div>
        <div class="cat-head">
          <div class="cat-ear left"></div>
          <div class="cat-ear right"></div>
          <div class="cat-head-shape"></div>
          <div class="cat-brow left"></div>
          <div class="cat-brow right"></div>
          <div class="cat-eye left"><div class="cat-pupil"></div></div>
          <div class="cat-eye right"><div class="cat-pupil"></div></div>
          <div class="cat-nose"></div>
          <div class="cat-mouth"></div>
        </div>
      </div>`;

    this.rig = this.el.querySelector(".cat-rig");
    this.head = this.el.querySelector(".cat-head");
    this.pupils = [...this.el.querySelectorAll(".cat-pupil")];

    // Pose state (attacks write these; render() applies them).
    this.x = renderer.width / 2;
    this.y = renderer.height / 2;
    this.scaleX = 1; this.scaleY = 1; this.rot = 0;
    this.shadow = 1;
    this.controlled = false;

    this.lookX = this.x; this.lookY = this.y;

    this._wanderTarget = null;
    this._wanderWait = 0;
    this._blinkTimer = 2 + Math.random() * 3;
  }

  // ---- Primitives used by attacks ----
  beginControl() { this.controlled = true; this._wanderTarget = null; }
  endControl() {
    this.controlled = false;
    this.scaleX = 1; this.scaleY = 1; this.rot = 0; this.shadow = 1;
    this.setCrouch(false);
    this._wanderWait = 0.4 + Math.random() * 0.6;
  }
  setPos(x, y) { this.x = x; this.y = y; }
  setPose(scaleX, scaleY, rot = 0, shadow = 1) {
    this.scaleX = scaleX; this.scaleY = scaleY; this.rot = rot; this.shadow = shadow;
  }
  setCrouch(on) { this.el.classList.toggle("crouching", on); }
  lookAt(x, y) { this.lookX = x; this.lookY = y; }

  clampToArena() {
    const m = C.edgeMargin;
    this.x = Math.max(m, Math.min(this.renderer.width - m, this.x));
    this.y = Math.max(m, Math.min(this.renderer.height - m, this.y));
  }

  update(dt, elapsed) {
    // Expression follows mood.
    this.el.dataset.mood = this.mood.value;

    // Blink occasionally (skipped while tired-eyes would hide it anyway).
    this._blinkTimer -= dt;
    if (this._blinkTimer <= 0) {
      this.el.classList.add("blink");
      setTimeout(() => this.el.classList.remove("blink"), 120);
      this._blinkTimer = 2.5 + Math.random() * 3.5;
    }

    if (!this.controlled) {
      this._wander(dt);
      this.lookAt(this.pointer.x, this.pointer.y); // idle: watch the "mouse"
    }

    this._applyTransforms();
  }

  _wander(dt) {
    if (this._wanderWait > 0) { this._wanderWait -= dt; return; }
    if (!this._wanderTarget) {
      const m = C.edgeMargin;
      this._wanderTarget = {
        x: m + Math.random() * (this.renderer.width - 2 * m),
        y: m + Math.random() * (this.renderer.height - 2 * m),
      };
    }
    const dx = this._wanderTarget.x - this.x;
    const dy = this._wanderTarget.y - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 6) {
      this._wanderTarget = null;
      const [lo, hi] = C.wanderPause;
      this._wanderWait = lo + Math.random() * (hi - lo);
      return;
    }
    const step = Math.min(d, C.wanderSpeed * dt);
    this.x += (dx / d) * step;
    this.y += (dy / d) * step;
  }

  _applyTransforms() {
    this.clampToArena();
    this.el.style.transform = `translate(${this.x - C.width / 2}px, ${this.y - C.height / 2}px)`;
    this.rig.style.transform = `scale(${this.scaleX}, ${this.scaleY}) rotate(${this.rot}deg)`;
    this.el.querySelector(".cat-shadow").style.setProperty("--shadow", this.shadow);

    // Eyes + head track the look point.
    const headX = this.x;
    const headY = this.y - C.height * 0.22;
    let dx = this.lookX - headX;
    let dy = this.lookY - headY;
    const d = Math.hypot(dx, dy) || 1;
    const px = (dx / d) * C.maxPupil;
    const py = (dy / d) * C.maxPupil;
    this.pupils.forEach((p) => { p.style.transform = `translate(${px}px, ${py}px)`; });

    const tilt = Math.max(-1, Math.min(1, dx / 160)) * C.headTilt;
    this.head.style.transform = `translateX(-50%) rotate(${tilt}deg)`;
  }

  resetPosition() {
    this.x = this.renderer.width / 2;
    this.y = this.renderer.height * 0.45;
    this.endControl();
  }
}
