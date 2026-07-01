/* ============================================================
   config.js — all tunable values. Nothing gameplay-numeric should
   live anywhere else; tweak the feel of the whole game from here.
   ============================================================ */

export const CONFIG = {
  // --- Player / cursor ---
  player: {
    mouseSize: 26,      // visible mouse character, px
    hitbox: 18,         // lethal radius (smaller than the sprite = forgiving), px
    nearMissBand: 52,   // extra px beyond a threat edge that still counts as a near-miss
    moveThreshold: 18,  // px/s above which the player counts as "moving" (scoring/anti-camp)
  },

  // --- Cat character ---
  cat: {
    width: 120,
    height: 110,
    wanderSpeed: 90,      // px/s idle drift
    wanderPause: [0.8, 2.2], // seconds between idle wander targets [min,max]
    maxPupil: 4,          // px the pupils can travel toward the cursor
    headTilt: 10,         // max degrees the head turns toward the cursor
    edgeMargin: 90,       // keep the cat this far from arena edges while idle
  },

  // --- Fairness Contract (engine-enforced guarantees) ---
  fairness: {
    minTelegraph: 0.35,   // s — no lethal telegraph may ever be shorter
    reactionBudget: 0.25, // s — assumed human reaction time, added to travel time
    maxDodgeSpeed: 1100,  // px/s — the fastest movement any dodge may ever require
  },

  // --- Heat (performance-driven intensity, 0..100) ---
  heat: {
    perNearMiss: 9,
    decayPerSec: 3,       // cools down when nothing happens
    risePerSec: 1.2,      // slowly warms while surviving
    cooldownScale: 0.35,  // at heat 100, cooldowns shrink by this fraction
  },

  // --- Scoring ---
  scoring: {
    survivePerSec: 10,    // passive points while moving in the arena
    nearMissPoints: 100,  // base near-miss reward (scaled by heat multiplier)
    multiplierFromHeat: 1.0, // heat/100 * this is added to the score multiplier
  },

  // --- Anti-camping (Agitation) ---
  agitation: {
    radius: 130,          // staying within this px of one spot builds agitation
    buildPerSec: 22,      // agitation gained while camping
    relaxPerSec: 30,      // agitation lost while moving around
    threshold: 100,       // at this level the cat forces a guaranteed area-ish attack
  },

  // --- Stage / Heat pacing. Times are cumulative seconds of survival. ---
  // Only stage 1 is implemented in the Phase-5 prototype; later stages slot in
  // by adding their attack classes to AttackManager.
  // 15-second stages. `until` is cumulative survival seconds. Each stage
  // escalates the cat via the *Mul fields (multipliers applied to cooldown,
  // telegraph, and the cat's lethal body radius). New attacks (arrow, yarn,
  // boxes, ...) get added to a stage's `attacks` list as they are built; the
  // AttackManager safely ignores any attack name that isn't registered yet.
  stageLength: 15,
  stages: [
    { id: 1, name: "The Beginner Hunter", until: 15,  attacks: ["lunge"], baselineMood: "curious",      cooldownMul: 1.00, telegraphMul: 1.00, bodyRadiusMul: 1.00 },
    { id: 2, name: "Warming Up",          until: 30,  attacks: ["lunge"], baselineMood: "focused",       cooldownMul: 0.86, telegraphMul: 0.93, bodyRadiusMul: 1.00 },
    { id: 3, name: "Locked On",           until: 45,  attacks: ["lunge"], baselineMood: "focused",       cooldownMul: 0.74, telegraphMul: 0.87, bodyRadiusMul: 1.05 },
    { id: 4, name: "Getting Annoyed",     until: 60,  attacks: ["lunge"], baselineMood: "frustrated",    cooldownMul: 0.64, telegraphMul: 0.82, bodyRadiusMul: 1.05 },
    { id: 5, name: "Relentless",          until: 75,  attacks: ["lunge"], baselineMood: "frustrated",    cooldownMul: 0.56, telegraphMul: 0.77, bodyRadiusMul: 1.10 },
    { id: 6, name: "Overclocked",         until: 90,  attacks: ["lunge"], baselineMood: "enraged",       cooldownMul: 0.50, telegraphMul: 0.73, bodyRadiusMul: 1.10 },
    { id: 7, name: "Feral",               until: 105, attacks: ["lunge"], baselineMood: "enraged",       cooldownMul: 0.45, telegraphMul: 0.69, bodyRadiusMul: 1.15 },
    { id: 8, name: "Apex Predator",       until: Infinity, attacks: ["lunge"], baselineMood: "enraged",  cooldownMul: 0.42, telegraphMul: 0.66, bodyRadiusMul: 1.15 },
  ],

  // --- Lunge attack ---
  // No ground "zone" is drawn. The cat's BODY is the threat: it pounces to
  // where you were when it crouched, telegraphed by the crouch + lean. Keep
  // moving and it lands where you aren't.
  lunge: {
    baseCooldown: 0.8,   // s between attacks at heat 0 (snappier than before)
    telegraph: 0.55,     // s wind-up (crouch + wiggle + lean toward target)
    active: 0.3,         // s leap duration (slow enough to read the incoming cat)
    recovery: 0.4,       // s slide + huff before idle
    bodyRadius: 46,      // px lethal radius of the cat's body at landing
    lead: 0.1,           // s of cursor velocity to lead the target
    leapHeight: 26,      // px visual hop arc
    squash: 0.7,         // crouch vertical scale
    stretch: 1.18,       // mid-leap vertical scale
    lean: 16,            // max degrees the cat leans toward its target while winding up
  },

  // --- Audio ---
  audio: {
    masterVolume: 0.5,
  },
};
