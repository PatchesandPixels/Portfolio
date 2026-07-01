/* ============================================================
   Attack — shared base class / interface. Every attack (now and the
   future Act II powers) implements this contract so new attacks drop
   in without rewriting the game.

   Lifecycle: start() -> update(dt) repeatedly -> phase === "done" -> cleanup()
   Phases:    "telegraph" -> "active" -> "recovery" -> "done"
   ============================================================ */

import { CONFIG } from "../config.js";

export class Attack {
  // Subclasses override meta.
  static meta = {
    name: "attack",
    minStage: 1,
    baseCooldown: 1.5,
    telegraph: 0.8,
    active: 0.3,
    recovery: 0.6,
    maxConcurrent: 1,
  };

  constructor(ctx) {
    this.ctx = ctx;
    this.t = 0;
    this.phase = "telegraph";
  }

  /** Current player hitbox snapshot. */
  get player() { return this.ctx.player; }

  /**
   * Fairness Contract helper. Given how far the player might have to move to
   * reach safety, returns the minimum telegraph time that keeps the dodge
   * achievable at or below maxDodgeSpeed (plus reaction budget). The caller
   * uses max(this, designed telegraph) so attacks are never *less* generous.
   * @param dodgeDistance px the player may need to travel
   * @param extraWindow   s of additional avoidance time after telegraph (e.g. active)
   */
  fairTelegraph(dodgeDistance, extraWindow = 0) {
    const f = CONFIG.fairness;
    const needed = f.reactionBudget + dodgeDistance / f.maxDodgeSpeed - extraWindow;
    return Math.max(needed, f.minTelegraph);
  }

  // Subclasses must implement these.
  start() { return true; }   // return false if no fair solution this frame
  update(/* dt */) {}
  cleanup() {}
}
