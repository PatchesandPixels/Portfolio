/* ============================================================
   main.js — bootstrap + wiring. Builds every system, owns the top
   level state transitions (start / pause / game over / restart), and
   drives the per-frame update. Keep gameplay numbers in config.js.
   ============================================================ */

import { CONFIG } from "./config.js";
import { EventBus } from "./core/EventBus.js";
import { GameState, STATES } from "./core/GameState.js";
import { Loop } from "./core/Loop.js";
import { Pointer } from "./core/Pointer.js";
import { Renderer } from "./render/Renderer.js";
import { Settings } from "./systems/Settings.js";
import { Audio } from "./systems/Audio.js";
import { Scoring } from "./systems/Scoring.js";
import { Mood } from "./systems/Mood.js";
import { Cat } from "./systems/Cat.js";
import { StageDirector } from "./systems/StageDirector.js";
import { AttackManager } from "./systems/AttackManager.js";
import { Hud } from "./ui/Hud.js";
import { LungeAttack } from "./attacks/LungeAttack.js";

const QUIPS = [
  "The cat looks extremely pleased with itself.",
  "It bats your remains around for a bit.",
  "A flawless pounce. The cat demands applause.",
  "It immediately pretends that was on purpose.",
  "The cat curls up for a victory nap.",
];

class Game {
  constructor() {
    this.gameEl = document.getElementById("game");
    this.arenaEl = document.getElementById("arena");

    // CSS sizing variables driven from config.
    this.gameEl.style.setProperty("--mouse-size", `${CONFIG.player.mouseSize}px`);
    this.gameEl.style.setProperty("--hitbox", `${CONFIG.player.hitbox}px`);

    // --- Core + systems ---
    this.settings = new Settings();
    this.settings.applyTo(this.gameEl);
    this.bus = new EventBus();
    this.state = new GameState(this.bus);
    this.renderer = new Renderer(this.arenaEl);
    this.pointer = new Pointer(this.arenaEl, this.bus);
    this.audio = new Audio(this.settings);
    this.scoring = new Scoring(this.bus);
    this.mood = new Mood(this.bus);
    this.cat = new Cat(this.renderer, this.pointer, this.mood);
    this.stageDirector = new StageDirector(this.bus);
    this.hud = new Hud();

    this._buildMouseSprite();

    // Shared context handed to every attack. `player` is a fresh snapshot.
    const self = this;
    this.ctx = {
      cat: this.cat,
      pointer: this.pointer,
      renderer: this.renderer,
      bus: this.bus,
      audio: this.audio,
      scoring: this.scoring,
      mood: this.mood,
      stageDirector: this.stageDirector,
      settings: this.settings,
      get player() {
        return {
          x: self.pointer.x,
          y: self.pointer.y,
          hitbox: CONFIG.player.hitbox,
          nearMissBand: CONFIG.player.nearMissBand,
        };
      },
    };

    // Attack registry — add future attacks here and to config.stages.
    this.attackManager = new AttackManager(this.ctx, { lunge: LungeAttack });

    this.elapsed = 0;
    this.loop = new Loop((dt) => this._update(dt), () => {});

    this._wireBusEvents();
    this._wireInput();
    this._setState(STATES.START);
    this.loop.start(); // runs continuously so the cat idles behind menus
  }

  _buildMouseSprite() {
    const m = document.createElement("div");
    m.className = "mouse";
    m.innerHTML = `
      <div class="mouse-ear left"></div>
      <div class="mouse-ear right"></div>
      <div class="mouse-body"></div>
      <div class="mouse-eye left"></div>
      <div class="mouse-eye right"></div>
      <div class="mouse-tail"></div>
      <div class="mouse-hitbox"></div>`;
    this.arenaEl.querySelector("#entity-layer").appendChild(m);
    this.mouseEl = m;
  }

  // ---------------- State transitions ----------------
  _setState(s) {
    this.state.set(s);
    this.gameEl.dataset.state = s;
  }

  _show(id, on) {
    document.getElementById(id).classList.toggle("hidden", !on);
  }

  startGame() {
    this.audio.init(); // first gesture: WebAudio may now run
    this.scoring.reset();
    this.stageDirector.reset();
    this.mood.reset();
    this.attackManager.reset();
    this.cat.resetPosition();
    this.pointer.reset();
    this.elapsed = 0;

    this._show("start-overlay", false);
    this._show("pause-overlay", false);
    this._show("gameover-overlay", false);
    this._setState(STATES.PLAYING);
  }

  pause() {
    if (!this.state.is(STATES.PLAYING)) return;
    this._setState(STATES.PAUSED);
    this._show("pause-overlay", true);
  }

  resume() {
    if (!this.state.is(STATES.PAUSED)) return;
    this.pointer.reset(); // avoid a velocity spike after the gap
    this._show("pause-overlay", false);
    this._setState(STATES.PLAYING);
  }

  gameOver() {
    if (!this.state.is(STATES.PLAYING)) return;
    this._setState(STATES.GAMEOVER);
    this.audio.play("gameover");
    document.getElementById("go-score").textContent = Math.floor(this.scoring.score).toLocaleString();
    document.getElementById("go-time").textContent = this.elapsed.toFixed(1);
    document.getElementById("go-quip").textContent = QUIPS[Math.floor(Math.random() * QUIPS.length)];
    this._show("gameover-overlay", true);
  }

  // ---------------- Per-frame ----------------
  _update(dt) {
    this.pointer.update(dt);
    this._updateMouseSprite();

    if (this.state.is(STATES.PLAYING)) {
      this.elapsed += dt;
      this.stageDirector.update(dt);
      this.scoring.update(dt, this.pointer);
      this.mood.setBaseline(this.stageDirector.baselineMood);
      this.mood.update(dt, this.elapsed);
      this.attackManager.update(dt);
      this.cat.update(dt, this.elapsed);
      this.hud.update({
        score: this.scoring.score,
        time: this.elapsed,
        stage: this.stageDirector.stage.id,
        mood: this.mood.value,
        heat: this.scoring.heat,
      });
    } else {
      // Keep the cat alive (idling) behind overlays.
      this.cat.update(dt, this.elapsed);
    }
  }

  _updateMouseSprite() {
    const playingish = this.state.is(STATES.PLAYING) || this.state.is(STATES.PAUSED);
    const show = this.settings.get("cursorMode") === "sprite" && this.pointer.inside && playingish;
    this.mouseEl.style.display = show ? "block" : "none";
    if (show) {
      this.mouseEl.style.transform = `translate(${this.pointer.x}px, ${this.pointer.y}px)`;
    }
  }

  // ---------------- Wiring ----------------
  _showStageBanner(stage) {
    const el = document.getElementById("stage-banner");
    el.innerHTML = `<div class="stage-num">Stage ${stage.id}</div>` +
                   `<div class="stage-name">${stage.name}</div>`;
    el.classList.remove("show");
    void el.offsetWidth; // restart the animation
    el.classList.add("show");
  }

  _wireBusEvents() {
    this.bus.on("attack:hit", () => this.gameOver());
    this.bus.on("stage:change", (stage) => {
      this.audio.play("stage");
      this._showStageBanner(stage);
    });
    this.bus.on("mood:change", (v) => {
      if (v === "frustrated" || v === "enraged") this.audio.play("frustrated");
    });
  }

  _wireInput() {
    const on = (id, ev, fn) => document.getElementById(id).addEventListener(ev, fn);

    on("btn-start", "click", () => this.startGame());
    on("btn-resume", "click", () => this.resume());
    on("btn-restart", "click", () => this.startGame());
    on("btn-restart-pause", "click", () => this.startGame());
    on("btn-pause", "click", () => {
      if (this.state.is(STATES.PLAYING)) this.pause();
      else if (this.state.is(STATES.PAUSED)) this.resume();
    });

    on("btn-mute", "click", () => {
      const muted = this.settings.toggle("muted");
      this.audio.setMuted(muted);
      document.getElementById("btn-mute").textContent = muted ? "🔇" : "🔊";
    });

    on("btn-cursor", "click", () => {
      const mode = this.settings.get("cursorMode") === "sprite" ? "native" : "sprite";
      this.settings.set("cursorMode", mode);
      this.settings.applyTo(this.gameEl);
      document.getElementById("btn-cursor").textContent = mode === "sprite" ? "🐭" : "➤";
    });

    // Escape pauses / resumes.
    this._onKey = (e) => {
      if (e.key === "Escape") {
        if (this.state.is(STATES.PLAYING)) this.pause();
        else if (this.state.is(STATES.PAUSED)) this.resume();
      }
    };
    window.addEventListener("keydown", this._onKey);

    // Auto-pause if the tab is hidden mid-game.
    this._onVis = () => {
      if (document.hidden && this.state.is(STATES.PLAYING)) this.pause();
    };
    document.addEventListener("visibilitychange", this._onVis);
  }
}

// Boot once the DOM is ready.
window.addEventListener("DOMContentLoaded", () => {
  window.__catGame = new Game();
});
