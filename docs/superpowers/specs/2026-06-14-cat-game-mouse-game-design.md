# Cat Game Mouse Game — Design Spec

**Date:** 2026-06-14
**Status:** Approved (core decisions); pending final spec review before prototype build.

---

## 1. Pitch

A one-screen browser survival/score-attack. A charming, escalating cartoon cat mistakes your
cursor for a real mouse and hunts it. Survive its growing repertoire of clearly telegraphed
attacks, bait near-misses for big points, and outlast it until it collapses, exhausted.
The cat is a *character*, not an enemy sprite: its mood and idle behavior react to how you play.

The hook is instant legibility (no instructions needed) plus expressive character animation.

---

## 2. Locked decisions

- **Failure model: single-hit game over.** One connecting attack ends the run. Because the stakes
  are absolute, fairness is enforced through generous, floored telegraphs, spatial separation of
  threats, and a hard cap on simultaneous lethal threats. **Near-misses are the primary scoring
  mechanic** — the game rewards baiting and dodging, not turtling.
- **Cursor visual: replace with a mouse sprite.** Hide the system cursor inside the arena and draw
  a small mouse character that follows the real pointer 1:1 (no lag, no input interception). A
  settings toggle restores the native cursor for players who prefer it. The native cursor always
  returns on pause/menus and when the pointer leaves the arena.
- **Pacing: Stage + Heat hybrid.** Wall-clock time gates which attacks are unlocked (variable stage
  lengths — shorter early, longer late). A performance-driven **Heat** value (0–100) modulates
  cooldowns, combo frequency, and telegraph length *within hard fairness floors*. Time gives
  structure and onboarding; Heat makes difficulty responsive to skill.

---

## 3. Core loop

1. Player moves the mouse sprite inside the arena.
2. Cat observes, updates mood, and selects an attack (respecting cooldowns + threat cap).
3. **Telegraph phase** — a clear, floored wind-up that reaches toward the cursor (targeting line,
   ground shadow, or dotted predicted path), so the warning appears where the player is already
   looking.
4. **Active phase** — the avoidable threat resolves.
5. Player dodges (near-miss = points) or is hit (game over).
6. **Recovery phase** — expressive cat reaction (slide, huff, embarrassment). Recovery length is a
   primary difficulty lever.
7. Heat and mood update; repeat. New attacks unlock over time.

---

## 4. Rules, scoring, win/loss

- **Arena:** the viewport (a centered max-width band on ultrawide displays).
- **Loss:** any attack connecting with the player hitbox → immediate game over.
- **Scoring:**
  - Low passive tick **only while moving inside the arena** (discourages parking off-screen without
    trapping the cursor — leaving simply freezes score and the cat "loses interest").
  - **Near-miss bonus:** a projectile/claw passing within `hitbox × 2.4` without hitting. This is the
    main score source.
  - Survival-time multiplier that grows with Heat.
- **Anti-camping (Agitation):** staying in one small region is viable for a few seconds, then the
  cat escalates to a *guaranteed area attack* covering that spot (box-flip, broad pounce). Movement
  and baiting are rewarded; stillness is gently punished. The cursor is never trapped or controlled.
- **Win:** survive the 8-stage arc (~6–7 min) → the cat collapses, exhausted (win screen). Then
  optional **Endless+**: Heat-driven remix of all attacks, chasing a high score.

---

## 5. Difficulty philosophy

Difficulty increases through **behavior, not raw speed**:

- shorter recovery windows
- shorter telegraphs (hard floor ≈ 350 ms)
- higher simultaneous-threat cap, scaled slowly (1 → 2 → 3 across the whole game)
- more frequent combos
- better prediction / target leading

**Hard fairness floors (never violated):** telegraph ≥ ~350 ms; threat cap never exceeds the
stage's value; no two *unavoidable* telegraphs may overlap the same escape route; projectile speed
never exceeds a readable limit.

---

## 5b. Fairness Contract (core, non-negotiable)

**Every attack, at every stage including the absurd Act II powers, must be beatable by a
sufficiently skilled player. The game never produces an unwinnable moment.** This is enforced
mechanically, not just by hand-tuning:

1. **Reaction budget.** Every lethal threat's telegraph ≥ human reaction time (~250 ms) **plus** the
   travel time the player needs to reach safety. Telegraphs lengthen automatically when the required
   dodge distance is larger.
2. **Capped required dodge speed.** Safety is always reachable at a cursor speed a trackpad user can
   hit. No attack ever demands flick-fast or pixel-precise movement. Speed/precision are never the
   gate — reading and timing are.
3. **A reachable safe spot always exists.** At any instant there is at least one position the player
   can reach in time. Threats are spatially arranged so the union of their danger zones never covers
   every escape route.
4. **No unavoidable overlap.** Two threats may never resolve such that dodging one forces you into
   the other. The threat cap and "no overlapping escape routes" rule guarantee this.
5. **Runtime solvability check.** Before an attack goes from telegraph → active, `AttackManager`
   verifies a safe path still exists given the player's current position and all other live threats.
   If not, the attack is delayed, retargeted, or replaced. The engine refuses to commit an
   impossible state.
6. **Late game is rehearsable, not random.** Combos and the finale are *choreographed* readable
   sequences a player can learn. Randomness selects *which* authored pattern plays, never assembles
   an untested impossible one.
7. **Speed events are telegraphed and time-boxed.** "Overdrive" moments (e.g. Super Saiyan) have a
   clear charge-up wind-up, last a bounded duration, individually telegraph each strike, and end in
   an exhausted punish-window. Speed is spectacle, never permanent difficulty creep.

Death must always read as *"I misread or mistimed that,"* never *"that was impossible."*

---

## 6. Stage progression

The game is structured in **Acts**. Act I is the grounded cat and is built first. Act II replaces
the old "Endless+" idea with authored, escalating set-pieces where the cat stops respecting physics.
Every Act II power still obeys the Fairness Contract (§5b): telegraphed, beatable, no flashing,
never controls the cursor.

### Act I — The Hunter (Stages 1–8)

| # | ~Time | New attack | Returning | Difficulty lever | Cat personality |
|---|-------|-----------|-----------|------------------|-----------------|
| 1 | 0:00–0:40 | **Lunge** (crouch → wiggle → pounce → slide → recover) | — | long telegraph (~900 ms), long recovery | Curious → playful |
| 2 | 0:40–1:25 | **Bow & Arrow** (aims, leads target, fires arrow) | Lunge | single arrow, ~700 ms telegraph | Focused, proud; embarrassed on miss |
| 3 | 1:25–2:10 | **Yarn Lob** (arcing ball → brief ground splat zone) | Lunge, Arrow | telegraphed ground shadow | Excited, showing off |
| 4 | 2:10–3:00 | **Ambush Boxes** (boxes slide in; surprise lunges from a box) | Lunge, Arrow, Yarn | shorter lunge telegraph (~600 ms) but signposted to a box | Sneaky, overconfident |
| 5 | 3:00–3:55 | **Edge Swat** (giant paw sweeps a telegraphed lane) | rotating subset | threat cap → 2 | Frustrated → aggressive |
| 6 | 3:55–4:50 | **The Understudy** (a 2nd fast kitten, mini-lunges) | rotating | two independent pursuers; combos | Overconfident ("calls backup") |
| 7 | 4:50–5:50 | **Fishing Hook** (casts to *predicted* future position, sweeps arc) | rotating, denser | prediction lead ↑, recovery ↓ | Enraged but precise |
| 8 | 5:50–6:45 | **Tantrum Finale** (choreographed combos + soft, non-flashing spotlight dim) | all | threat cap → 3, shortest fair recovery | Enraged → exhausted → embarrassed (defeat) |

**Explicitly dropped:** decoy cats *as a standalone Act I attack* (muddy readability against a tiny
cursor — they return safely in Act II as the telegraphed "Nine Afterimages") and screen-darkening
*as a standalone attack* (flirts with the "no dangerous effects" rule). The finale's spotlight is a
gentle, steady dim only — never flashing.

### Act II — The Cat Breaks Physics (Stages 9+)

The cat, humiliated by losing to a mouse, starts transcending reality. Absurd spectacle, readable
threat. This is the memorable back half and the answer to "what happens after stage 8."

| # | Power | The attack | How it stays fair |
|---|-------|-----------|-------------------|
| 9 | **Earthbender Cat** | Stone pillars erupt from the ground; rock shrapnel arcs; a rolling boulder sweeps a lane | Pillars telegraph as glowing ground-cracks before rising |
| 10 | **Black Hole Cat** | Tears portal *pairs* — projectiles enter one and exit near you; gravity wells *curve* arrows/yarn | Portals and well radius are always visible before anything fires |
| 11 | **Super Saiyan Overdrive** | Aura charge-up, then ~10 s of rapid micro-lunges at near-zero recovery, then collapses panting | Time-boxed; each micro-lunge still telegraphs; the exhausted collapse is a big bonus-point window |
| 12 | **Nine Afterimages** | Splits into clone copies doing a synchronized pounce | Only the *glowing* one is lethal — a brief, honest tell; decoys done safely |
| 13 | **Storm Cat** | Lightning from telegraphed shadow-rings; a giant cartoon paw drops from the sky | Shadow circles / growing paw-shadow warn before impact |
| 14 | **Time Cat** | Snaps and slows time — telegraphs stretch out, then *SNAP* back to full speed | A gift that becomes a trap; teaches timing rather than punishing reflexes |
| 15 | **The Catpocalypse** (true final) | Choreographed medley of everything, reality glitching (non-flashing) at the edges, until the cat over-exerts and reverts into a sleepy kitten | Rehearsable choreography; the real ending |

Because attacks are plug-in modules sharing one interface (§9), Act II is **content, not new
engineering** — earthbending and black holes use the same `Attack` contract as the basic lunge.

---

## 7. Cat personality system

**Mood states:** `curious, focused, excited, frustrated, tired, embarrassed, overconfident, enraged`.

**Mood shifts based on:** miss streak, closest-call distance, survival time, the attack being
prepared, and detected play-style (zoomer vs camper).

**Idle charm (when not attacking):** grooming, tail flicks, ear twitches, chasing its own tail,
knocking a pencil off a ledge, a fake yawn that snaps into a surprise pounce, glaring at the player
after a near-miss, smug stretching when ahead.

Expression and idle animation are driven by the current mood, not hardcoded per attack.

---

## 8. Technology

**Chosen: vanilla JS (ES modules) + DOM/CSS. No framework, no build step.**

Rationale: only ~1 cat plus a handful of projectiles are ever on screen, so CSS transforms (GPU
accelerated) are the best, lowest-friction tool for expressive squash/stretch/anticipation — which
*is* the product. Free responsive layout (vmin + normalized coords), free high-DPI, built-in
`prefers-reduced-motion`. Canvas/Pixi/Phaser only pay off at hundreds of particles or with physics
we don't need. The render layer sits behind a `Renderer` interface so effects can move to Canvas
later without touching game logic.

---

## 9. Architecture

```
cat-game/
  index.html
  src/
    main.js              # bootstrap, wiring, rAF loop
    config.js            # ALL tunables: timings, hitbox, stages, heat curves
    core/    Loop.js  EventBus.js  GameState.js  Pointer.js
    systems/ StageDirector.js  AttackManager.js  Collision.js
             Scoring.js  Cat.js  Mood.js  Telegraph.js  Audio.js  Settings.js
    attacks/ Attack.js  LungeAttack.js  ArrowAttack.js  (more later)
    render/  Renderer.js
    ui/      Hud.js  PauseMenu.js
  styles/  main.css  cat.css  effects.css
```

- **GameState:** FSM `boot → playing → paused → gameover → win`.
- **Loop:** rAF with **delta time** + clamped accumulator; fast projectiles sub-step.
- **EventBus:** pub/sub decoupling (`attack:hit`, `nearmiss`, `stage:change`, …).
- **Pointer:** tracks the real pointer, exposes in-arena state and a prev→current segment for CCD.
- **StageDirector:** maps `(elapsedTime, heat)` → active stage, unlocked attack pool, baseline mood.
- **AttackManager:** enforces per-attack cooldowns, the global threat cap, the "no overlapping
  escape routes" rule, and weighted combo selection with anti-repeat memory (no attack 3× in a row).

**Shared attack interface (new attacks drop in without rewrites):**

```js
class Attack {
  static meta = { name, minStage, baseCooldown, telegraph, active,
                  recovery, maxConcurrent, tags };
  constructor(ctx)           // { cat, pointer, arena, bus, difficulty, render }
  select(state)  // → target | null  (pick target + lead; null = skip this tick)
  start(target)              // spawn telegraph + entities
  update(dt, state)          // advance phase: telegraph → active → recovery
  checkCollision(pointer)    // → { hit, nearMiss, dist }
  cleanup()                  // remove DOM, clear timers
  get phase()                // 'telegraph' | 'active' | 'recovery' | 'done'
}
```

---

## 10. Collision

- **Player hitbox:** circle, **radius 18 px** (config), *smaller* than the ~22 px visible mouse
  sprite so it feels forgiving. The lethal core is the circle, not the whole avatar.
- **Near-miss radius:** `hitbox × 2.4`.
- **Continuous detection:** checked every rAF; fast projectiles use **swept-segment CCD** (closest
  distance from the projectile's prev→current segment to the pointer point) to prevent tunneling.
- **Accessibility assist:** optional faint hitbox ring.

---

## 11. Responsive & accessibility

- Entities stored in **normalized 0..1 coords × arena size** → resize is free.
- Small laptops: arena = viewport. Ultrawide: centered max-width play band; cat enters from edges.
- High-DPI: free with DOM.
- Touch (later): drag a mouse sprite instead of pointer-follow.
- `prefers-reduced-motion`: reduce trails/shake/squash; keep telegraphs fully intact.
- Settings: native-cursor toggle, hitbox-ring assist, master volume, mute.
- **Escape** pauses/exits at all times. The game never traps the cursor, intercepts input, blocks
  navigation, disables browser controls, or uses flashing/dangerous effects.

---

## 12. Audio

WebAudio, lazy-initialized on first user input (autoplay policy). Master gain + mute; fully playable
silent. Cues for: crouch, lunge, miss/slide, projectile fire, near-miss, stage change, cat
frustration, game over.

---

## 13. Scope

**MVP (Phase 5):** Stage-1 Lunge only; full shell (survival timer, score, single-hit game over,
pause via Escape, restart, game-over screen, mute); mouse-sprite cursor with toggle; basic mood
(curious / focused / frustrated / tired); cursor tracking; eye/head tracking; crouch animation;
telegraphed lunge; collision; short recovery animation; DOM placeholder graphics; reduced-motion
support; tunable `config.js`.

**Phase 6:** `ArrowAttack` via the same interface (aim, movement prediction, telegraph, projectile
movement, swept collision, cleanup, cat reactions); `AttackManager` selecting lunge vs arrow by
stage.

**Later:** Stages 3–8, the second kitten, Heat tuning, audio polish, touch support, Endless+,
illustrated sprite sheets replacing placeholders.
