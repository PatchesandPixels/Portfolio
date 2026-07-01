/* ============================================================
   AttackManager — selects, starts, advances, and retires attacks.
   Enforces cooldowns (shortened by Heat), the global threat cap, and
   anti-repeat. Attacks run their own telegraph/active/recovery and
   report collisions through the shared ctx (bus + player snapshot).
   ============================================================ */

import { CONFIG } from "../config.js";

export class AttackManager {
  /**
   * @param ctx  shared context handed to every attack
   * @param registry  map of attack-name -> Attack subclass
   */
  constructor(ctx, registry) {
    this.ctx = ctx;
    this.registry = registry;
    this.reset();
  }

  reset() {
    this.active?.cleanup();
    this.active = null;
    this.cooldown = 1.2;   // brief grace before the first attack
    this.lastName = null;
  }

  _scaledCooldown(base) {
    const heat = this.ctx.scoring.heat;
    const heatScale = 1 - (heat / 100) * CONFIG.heat.cooldownScale;
    const stageMul = this.ctx.stageDirector.difficulty.cooldownMul;
    return base * heatScale * stageMul;
  }

  update(dt) {
    if (this.active) {
      this.active.update(dt);
      if (this.active.phase === "done") {
        const base = this.active.constructor.meta.baseCooldown;
        this.active.cleanup();
        this.active = null;
        this.ctx.cat.endControl();
        this.ctx.mood.setAttacking(false);
        this.cooldown = this._scaledCooldown(base);
      }
      return;
    }

    this.cooldown -= dt;
    if (this.cooldown <= 0) this._trySelect();
  }

  _trySelect() {
    const pool = this.ctx.stageDirector.unlockedAttacks;
    if (!pool.length) { this.cooldown = 0.3; return; }

    // Anti-repeat: avoid the same attack twice running when alternatives exist.
    let choices = pool.filter((n) => n !== this.lastName);
    if (!choices.length) choices = pool.slice();
    const name = choices[Math.floor(Math.random() * choices.length)];

    const Cls = this.registry[name];
    if (!Cls) { this.cooldown = 0.3; return; }

    const attack = new Cls(this.ctx);
    // Fairness Contract: an attack's start() validates a fair solution and
    // returns false if it cannot make one this frame (manager retries soon).
    const ok = attack.start();
    if (!ok) { attack.cleanup(); this.cooldown = 0.25; return; }

    this.active = attack;
    this.lastName = name;
    this.ctx.cat.beginControl();
    this.ctx.mood.setAttacking(true);
    this.ctx.bus.emit("attack:start", name);
  }
}
