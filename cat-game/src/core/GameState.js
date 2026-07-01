/* ============================================================
   GameState — simple finite state machine for the top-level flow.
   States: start | playing | paused | gameover | win
   ============================================================ */

export const STATES = {
  START: "start",
  PLAYING: "playing",
  PAUSED: "paused",
  GAMEOVER: "gameover",
  WIN: "win",
};

export class GameState {
  constructor(bus) {
    this.bus = bus;
    this.current = STATES.START;
  }

  is(state) {
    return this.current === state;
  }

  set(state) {
    if (this.current === state) return;
    const prev = this.current;
    this.current = state;
    this.bus.emit("state:change", { prev, next: state });
  }
}
