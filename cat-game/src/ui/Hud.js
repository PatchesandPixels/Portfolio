/* ============================================================
   Hud — writes live stats to the header. Pure view: it reads systems
   and updates DOM; it holds no game logic.
   ============================================================ */

export class Hud {
  constructor() {
    this.score = document.getElementById("hud-score");
    this.time = document.getElementById("hud-time");
    this.stage = document.getElementById("hud-stage");
    this.mood = document.getElementById("hud-mood");
    this.heat = document.getElementById("heat-bar");
  }

  update({ score, time, stage, mood, heat }) {
    this.score.textContent = Math.floor(score).toLocaleString();
    this.time.textContent = time.toFixed(1);
    this.stage.textContent = stage;
    this.mood.textContent = mood;
    this.heat.style.width = `${Math.round(heat)}%`;
  }
}
