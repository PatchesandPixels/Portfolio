/* ============================================================
   Pointer — tracks the real pointer in arena-local coordinates.
   Never intercepts or moves the real cursor; only reads its position.
   Exposes velocity (for target leading) and a prev->current segment
   (for swept-segment collision of fast projectiles).
   ============================================================ */

export class Pointer {
  constructor(arenaEl, bus) {
    this.arena = arenaEl;
    this.bus = bus;

    this.x = 0; this.y = 0;     // current arena-local position
    this.px = 0; this.py = 0;   // previous-frame position
    this.vx = 0; this.vy = 0;   // velocity, px/s
    this.speed = 0;
    this.inside = false;
    this.moving = false;

    this._clientX = 0;
    this._clientY = 0;
    this._rect = arenaEl.getBoundingClientRect();
    this._seen = false;

    // Bound handlers so we can remove them on destroy().
    this._onMove = this._onMove.bind(this);
    this._onEnter = this._onEnter.bind(this);
    this._onLeave = this._onLeave.bind(this);
    this._onResize = this._cacheRect.bind(this);

    arenaEl.addEventListener("pointermove", this._onMove);
    arenaEl.addEventListener("pointerenter", this._onEnter);
    arenaEl.addEventListener("pointerleave", this._onLeave);
    window.addEventListener("resize", this._onResize);
    window.addEventListener("scroll", this._onResize, true);
  }

  _cacheRect() {
    this._rect = this.arena.getBoundingClientRect();
  }

  _onMove(e) {
    this._clientX = e.clientX;
    this._clientY = e.clientY;
    if (!this._seen) {
      // First sample: snap prev to current so velocity doesn't spike.
      this.x = this.px = e.clientX - this._rect.left;
      this.y = this.py = e.clientY - this._rect.top;
      this._seen = true;
    }
  }

  _onEnter() { this.inside = true; }
  _onLeave() { this.inside = false; this.bus.emit("pointer:leave"); }

  /** Recompute arena-local position + velocity for this frame. */
  update(dt) {
    this.px = this.x;
    this.py = this.y;
    this.x = this._clientX - this._rect.left;
    this.y = this._clientY - this._rect.top;
    if (dt > 0) {
      this.vx = (this.x - this.px) / dt;
      this.vy = (this.y - this.py) / dt;
    }
    this.speed = Math.hypot(this.vx, this.vy);
    this.moving = this.speed > 0; // refined against config threshold by callers
  }

  /** Recenter without producing a velocity spike (used on restart/resume). */
  reset() {
    this._cacheRect();
    this.x = this.px = this._clientX - this._rect.left;
    this.y = this.py = this._clientY - this._rect.top;
    this.vx = this.vy = 0;
    this.speed = 0;
  }

  destroy() {
    this.arena.removeEventListener("pointermove", this._onMove);
    this.arena.removeEventListener("pointerenter", this._onEnter);
    this.arena.removeEventListener("pointerleave", this._onLeave);
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("scroll", this._onResize, true);
  }
}
