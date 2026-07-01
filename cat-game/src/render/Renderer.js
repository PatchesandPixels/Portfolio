/* ============================================================
   Renderer — owns the DOM layers and spawns transient effects.
   Keeping all DOM creation behind this interface means the effects
   layer could later be swapped to Canvas without touching game logic.
   ============================================================ */

export class Renderer {
  constructor(arenaEl) {
    this.arena = arenaEl;
    this.entityLayer = arenaEl.querySelector("#entity-layer");
    this.fxLayer = arenaEl.querySelector("#fx-layer");
    this._timers = new Set();
  }

  get width() { return this.arena.clientWidth; }
  get height() { return this.arena.clientHeight; }

  /** Create a persistent entity element (cat, mouse, marker). */
  createEntity(className) {
    const el = document.createElement("div");
    el.className = className;
    this.entityLayer.appendChild(el);
    return el;
  }

  remove(el) {
    el?.remove();
  }

  /** Spawn a short-lived effect node at (x,y) that removes itself. */
  spawnFx(className, x, y, { text = "", ttl = 700 } = {}) {
    const el = document.createElement("div");
    el.className = `fx ${className}`;
    if (text) el.textContent = text;
    el.style.transform = `translate(${x}px, ${y}px)`;
    this.fxLayer.appendChild(el);
    const t = setTimeout(() => {
      el.remove();
      this._timers.delete(t);
    }, ttl);
    this._timers.add(t);
    return el;
  }

  dust(x, y) { this.spawnFx("fx-dust", x, y, { ttl: 520 }); }
  stars(x, y) { this.spawnFx("fx-star", x, y, { text: "✦", ttl: 620 }); }
  nearMiss(x, y, points) {
    this.spawnFx("fx-ring", x, y, { ttl: 520 });
    this.spawnFx("fx-nearmiss", x, y - 14, { text: `+${points}`, ttl: 820 });
  }

  /** Brief screen shake (respects reduced motion via CSS). */
  shake() {
    const game = document.getElementById("game");
    game.classList.remove("shake");
    void game.offsetWidth; // force reflow so the animation can replay
    game.classList.add("shake");
  }

  destroy() {
    this._timers.forEach((t) => clearTimeout(t));
    this._timers.clear();
    this.fxLayer.innerHTML = "";
  }
}
