/* ============================================================
   Scoring — points + Heat. Near-misses are the main reward; passive
   points only tick while the player is moving inside the arena, which
   discourages parking off-screen without ever trapping the cursor.
   ============================================================ */

import { CONFIG } from "../config.js";

export class Scoring {
  constructor(bus) {
    this.bus = bus;
    this.reset();
    // Heat rises on near-misses.
    bus.on("nearmiss", () => this.addHeat(CONFIG.heat.perNearMiss));
  }

  reset() {
    this.score = 0;
    this.heat = 0; // 0..100
    this.nearMisses = 0;
  }

  get multiplier() {
    return 1 + (this.heat / 100) * CONFIG.scoring.multiplierFromHeat;
  }

  addHeat(amount) {
    this.heat = Math.max(0, Math.min(100, this.heat + amount));
  }

  awardNearMiss(x, y) {
    const pts = Math.round(CONFIG.scoring.nearMissPoints * this.multiplier);
    this.score += pts;
    this.nearMisses++;
    return pts;
  }

  update(dt, pointer) {
    // Passive survival points only while genuinely moving inside the arena.
    const moving = pointer.inside && pointer.speed > CONFIG.player.moveThreshold;
    if (moving) this.score += CONFIG.scoring.survivePerSec * this.multiplier * dt;

    // Heat slowly warms while surviving, cools when idle.
    if (moving) this.addHeat(CONFIG.heat.risePerSec * dt);
    this.addHeat(-CONFIG.heat.decayPerSec * dt);
  }
}
