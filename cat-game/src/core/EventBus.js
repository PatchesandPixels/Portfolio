/* ============================================================
   EventBus — tiny pub/sub so systems stay decoupled.
   Systems emit semantic events ("nearmiss", "attack:hit") rather than
   calling each other directly.
   ============================================================ */

export class EventBus {
  constructor() {
    this._handlers = new Map();
  }

  on(event, fn) {
    if (!this._handlers.has(event)) this._handlers.set(event, new Set());
    this._handlers.get(event).add(fn);
    return () => this.off(event, fn); // returns an unsubscribe handle
  }

  off(event, fn) {
    this._handlers.get(event)?.delete(fn);
  }

  emit(event, payload) {
    this._handlers.get(event)?.forEach((fn) => fn(payload));
  }

  clear() {
    this._handlers.clear();
  }
}
