/* ============================================================
   StageDirector — maps survival time to the active stage, which
   decides the unlocked attack pool and the cat's baseline mood.
   (Heat-driven modulation lives in Scoring/AttackManager; this module
   owns the time-gated structure.)
   ============================================================ */

import { CONFIG } from "../config.js";

export class StageDirector {
  constructor(bus) {
    this.bus = bus;
    this.reset();
  }

  reset() {
    this.elapsed = 0;
    this.stage = CONFIG.stages[0];
  }

  update(dt) {
    this.elapsed += dt;
    const next = this._stageFor(this.elapsed);
    if (next.id !== this.stage.id) {
      this.stage = next;
      this.bus.emit("stage:change", next);
    }
  }

  _stageFor(t) {
    for (const s of CONFIG.stages) {
      if (t < s.until) return s;
    }
    return CONFIG.stages[CONFIG.stages.length - 1];
  }

  get unlockedAttacks() { return this.stage.attacks; }
  get baselineMood() { return this.stage.baselineMood; }

  /** Per-stage difficulty multipliers (defaults to 1 if a stage omits them). */
  get difficulty() {
    const s = this.stage;
    return {
      cooldownMul: s.cooldownMul ?? 1,
      telegraphMul: s.telegraphMul ?? 1,
      bodyRadiusMul: s.bodyRadiusMul ?? 1,
    };
  }
}
