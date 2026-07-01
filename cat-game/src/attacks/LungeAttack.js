/* ============================================================
   LungeAttack — Stage 1. The cat crouches (telegraph), wiggles its
   back legs and leans toward you, then pounces to where you were.

   No ground "zone" is drawn. The cat's BODY is the only lethal thing,
   and only at the landing. The warning is the cat's body language:
   it crouches and leans toward its target. Avoidance is intuitive —
   keep moving so the cat lands where you no longer are.

   Fairness Contract: the telegraph is auto-extended if the player's
   current position is too close to the landing to escape in time.
   ============================================================ */

import { Attack } from "./Attack.js";
import { CONFIG } from "../config.js";
import { Collision } from "../systems/Collision.js";

const L = CONFIG.lunge;

export class LungeAttack extends Attack {
  static meta = {
    name: "lunge",
    minStage: 1,
    baseCooldown: L.baseCooldown,
    telegraph: L.telegraph,
    active: L.active,
    recovery: L.recovery,
    maxConcurrent: 1,
  };

  start() {
    const { cat, pointer, renderer, stageDirector } = this.ctx;

    // Per-stage difficulty: faster, snappier, slightly bigger reach each stage.
    const diff = stageDirector.difficulty;
    this.bodyRadius = L.bodyRadius * diff.bodyRadiusMul;
    const baseTelegraph = LungeAttack.meta.telegraph * diff.telegraphMul;

    // Lead the target slightly by the cursor's current velocity, then keep
    // the cat on-screen so it never lands half off the arena.
    const margin = 50;
    let tx = pointer.x + pointer.vx * L.lead;
    let ty = pointer.y + pointer.vy * L.lead;
    tx = Math.max(margin, Math.min(renderer.width - margin, tx));
    ty = Math.max(margin, Math.min(renderer.height - margin, ty));
    this.landing = { x: tx, y: ty };
    this.start0 = { x: cat.x, y: cat.y };

    // Lean direction (purely a telegraph cue — the cat tips toward its target).
    this.lean = Math.max(-1, Math.min(1, (tx - cat.x) / 220)) * L.lean;

    // Fairness Contract: guarantee the player can clear the cat's body in time.
    // The wind-up is auto-extended past the stage's shorter telegraph if needed,
    // so escalation never produces an unavoidable hit.
    const p = this.player;
    const dist0 = Collision.dist(p.x, p.y, tx, ty);
    const escapeNeeded = Math.max(0, (this.bodyRadius + p.hitbox) - dist0);
    this.telegraph = Math.max(
      baseTelegraph,
      this.fairTelegraph(escapeNeeded, LungeAttack.meta.active)
    );

    this._leapStarted = false;
    this._resolved = false;
    this.ctx.audio.play("crouch");
    return true;
  }

  update(dt) {
    this.t += dt;
    const { cat } = this.ctx;
    const TG = this.telegraph;
    const AC = LungeAttack.meta.active;
    const RC = LungeAttack.meta.recovery;

    if (this.t < TG) {
      // --- Telegraph: crouch, wiggle, lean toward the target ---
      const p = this.t / TG;
      const sy = 1 - (1 - L.squash) * this._easeIn(p);
      const sx = 1 + (1 - sy) * 0.5;
      const wiggle = Math.sin(this.t * 32) * (1.5 + p * 3);
      cat.setPos(this.start0.x, this.start0.y);
      cat.setPose(sx, sy, wiggle + this.lean * p, 1 + (1 - sy) * 0.3);
      cat.setCrouch(true);
      cat.lookAt(this.landing.x, this.landing.y);
      this.phase = "telegraph";
      return;
    }

    if (this.t < TG + AC) {
      // --- Active: leap from start to landing along a hop arc ---
      if (!this._leapStarted) {
        this._leapStarted = true;
        cat.setCrouch(false);
        this.ctx.audio.play("lunge");
      }
      const lp = (this.t - TG) / AC;
      const hop = Math.sin(lp * Math.PI);
      const x = this._lerp(this.start0.x, this.landing.x, lp);
      const y = this._lerp(this.start0.y, this.landing.y, lp) - hop * L.leapHeight;
      const dir = Math.max(-1, Math.min(1, (this.landing.x - this.start0.x) / 200));
      cat.setPos(x, y);
      cat.setPose(1 / L.stretch, L.stretch, dir * 12, 1 - hop * 0.4);
      this.phase = "active";
      return;
    }

    if (this.t < TG + AC + RC) {
      // --- Recovery: resolve collision once, then squash-settle + huff ---
      if (!this._resolved) {
        this._resolved = true;
        this._resolve();
      }
      const rp = (this.t - TG - AC) / RC;
      const squash = 1 - 0.26 * Math.sin(rp * Math.PI); // land squash then return
      cat.setPos(this.landing.x, this.landing.y);
      cat.setPose(1 + (1 - squash) * 0.6, squash, 0, 1 + (1 - squash) * 0.4);
      this.phase = "recovery";
      return;
    }

    this.phase = "done";
  }

  _resolve() {
    const { renderer, scoring, bus } = this.ctx;
    renderer.dust(this.landing.x, this.landing.y + 8);

    // The cat's body (at the landing) is the threat.
    const p = this.player;
    const res = Collision.classifyCircle(this.landing.x, this.landing.y, this.bodyRadius, p);
    if (res.hit) {
      renderer.stars(p.x, p.y);
      renderer.shake();
      bus.emit("attack:hit", { x: p.x, y: p.y });
    } else if (res.nearMiss) {
      const pts = scoring.awardNearMiss(p.x, p.y);
      renderer.nearMiss(p.x, p.y, pts);
      this.ctx.audio.play("nearmiss");
      bus.emit("nearmiss", { x: p.x, y: p.y });
    } else {
      this.ctx.audio.play("miss");
      bus.emit("attack:miss", { x: p.x, y: p.y });
    }
  }

  cleanup() {
    // No persistent DOM to remove (no ground marker).
  }

  _lerp(a, b, t) { return a + (b - a) * t; }
  _easeIn(t) { return t * t; }
}
