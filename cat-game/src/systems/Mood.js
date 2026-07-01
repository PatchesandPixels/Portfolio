/* ============================================================
   Mood — the cat's lightweight emotional state.
   A stable "base" mood (from survival + miss streak) plus short-lived
   "reaction" overrides (a near-miss makes it briefly excited, etc.).
   Other systems read `mood.value`; the Cat renders it.
   ============================================================ */

export const MOODS = [
  "curious", "focused", "excited", "frustrated",
  "tired", "embarrassed", "overconfident", "enraged",
];

export class Mood {
  constructor(bus) {
    this.bus = bus;
    this.reset();

    bus.on("attack:start", () => this._react("focused", 0.0)); // handled via base while attacking
    bus.on("nearmiss", () => {
      this.missStreak++;
      this._react("excited", 0.6);
    });
    bus.on("attack:miss", () => {
      this.missStreak++;
      this._react("embarrassed", 0.8);
    });
    bus.on("attack:hit", () => this._react("overconfident", 99)); // smug at game over
  }

  reset() {
    this.base = "curious";
    this.missStreak = 0;
    this.attacking = false;
    this._override = null;
    this._overrideTimer = 0;
    this._last = "curious";
  }

  setAttacking(v) { this.attacking = v; }
  setBaseline(name) { this._baseline = name; }

  _react(name, dur) {
    this._override = name;
    this._overrideTimer = dur;
  }

  get value() {
    if (this._override && this._overrideTimer > 0) return this._override;
    return this.base;
  }

  update(dt, elapsed) {
    if (this._overrideTimer > 0) this._overrideTimer -= dt;

    // Recompute the stable base mood from how the run is going.
    let base;
    if (this.missStreak >= 6) base = "enraged";
    else if (this.missStreak >= 3) base = "frustrated";
    else if (elapsed > 45 && this.missStreak < 1) base = "tired";
    else if (this.attacking) base = "focused";
    else if (elapsed < 8) base = "curious";
    else base = this._baseline || "focused";
    this.base = base;

    const v = this.value;
    if (v !== this._last) {
      this._last = v;
      this.bus.emit("mood:change", v);
    }
  }
}
