/* ============================================================
   Settings — persistent player preferences (localStorage).
   Accessibility: native-cursor toggle, hitbox assist ring, reduced
   motion (auto-detected), volume + mute.
   ============================================================ */

const KEY = "catgame.settings";

const DEFAULTS = {
  cursorMode: "sprite", // "sprite" | "native"
  muted: false,
  volume: 0.5,
  assist: false,        // show faint hitbox ring
};

export class Settings {
  constructor() {
    this.values = { ...DEFAULTS, ...this._load() };
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  _load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch {
      return {};
    }
  }

  _save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.values));
    } catch {
      /* storage may be unavailable (private mode); preferences just won't persist */
    }
  }

  get(k) { return this.values[k]; }

  set(k, v) {
    this.values[k] = v;
    this._save();
  }

  toggle(k) {
    this.set(k, !this.values[k]);
    return this.values[k];
  }

  /** Reflect settings onto the root element via data-attributes for CSS. */
  applyTo(gameEl) {
    gameEl.dataset.cursor = this.values.cursorMode;
    gameEl.dataset.assist = this.values.assist ? "on" : "off";
  }
}
