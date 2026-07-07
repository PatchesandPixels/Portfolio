/* ════════════════════════════════════════════════════════════════
   PONDRIPPLES.JS — WebGL water refraction (jquery.ripples) on the
   pond background, with drops driven by the swimming koi.

   jquery.ripples renders a real ripple simulation that REFRACTS the
   element's background image — the pond floor art visibly bends and
   settles like disturbed water. It can only distort one element's
   background, so it lives on a clipped div that mirrors the .koi-bg
   art only over open water. The flat pond image remains visible below
   it so perimeter rocks/plants are never refracted.

   Drop sources:
     - swimming koi (koipond.js calls PondRipples.dropKoi as fish move)
     - feeding clicks (koipond.js calls PondRipples.dropFood)

   Boundary behavior: stronger/main drops throw delayed, weaker echo
   drops from just inside the open-water edge. This reads as the ripple
   hitting the pond walls/rocks and reflecting back inward, then
   dissipating instead of building into feedback.

   Progressive enhancement: if jQuery/the plugin/WebGL are missing or
   fail, the div is removed and the original .koi-bg <img> stays —
   the pond just doesn't refract. Skipped under reduced motion.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var BG_SRC = 'assets/hero/koi/beautiful-pond/pond-background-no-koi.png';
  var STYLE = {
    koiRadius: 0.18,
    koiMaxRadius: 13,
    koiStrengthBase: 0.0038,
    koiStrengthSpeed: 0.0044,
    koiMaxStrength: 0.0085,
    koiMinTravel: 10,
    foodRadius: 0.25,
    foodMaxRadius: 18,
    foodStrength: 0.013,
    foodScatter: 0.12,
    foodScatterStrength: 0.0048,
    maxRadius: 22,
    maxStrength: 0.018
  };
  var WATER = { cx: 0.5, cy: 0.5, rx: 0.42, ry: 0.38 };
  var REFLECT = {
    waveSpeed: 210,       // px/s: delay before a wave reaches the edge
    inset: 13,            // keep reflected drops off the painted bank art
    minDelay: 0.12,
    maxDelay: 1.55,
    koiCooldown: 360,
    strength: {
      generic: 0.34,
      koi: 0.32,
      food: 0.42
    },
    radius: {
      generic: 0.7,
      koi: 0.62,
      food: 0.78
    }
  };
  window.PondRippleStyle = STYLE;

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  var initTries = 0;
  function init() {
    var pond = document.querySelector('.koipond');
    if (!pond) return;
    var img = pond.querySelector('.koi-bg');
    if (!img) return;
    if (!window.jQuery || !window.jQuery.fn || !window.jQuery.fn.ripples) {
      // CDN can land late on a cold load — retry briefly instead of
      // giving up (the pond just stays flat until the plugin arrives)
      if (initTries++ < 30) setTimeout(init, 350);
      return;
    }

    var div = document.createElement('div');
    div.className = 'koi-bg-water';
    div.setAttribute('aria-hidden', 'true');
    div.style.backgroundImage = 'url("' + BG_SRC + '")';
    pond.insertBefore(div, img.nextSibling);

    try {
      window.jQuery(div).ripples({
        resolution: 256,       // simulation grid — enough detail for thin rings
        dropRadius: 14,
        perturbance: 0.015,    // refraction strength — subtle, not funhouse
        interactive: false     // no mouse-following ripples — the water
                               // only responds to the koi and to feeding
      });
    } catch (e) {
      div.remove();            // no WebGL (or plugin failure): keep the plain img
      return;
    }

    // Keep the flat pond image visible under the clipped ripple surface.
    // Only the inner-water duplicate refracts, so edge rocks/plants stay
    // stable instead of vibrating with the water simulation.
    img.style.visibility = '';

    function emit(kind, x, y, radius, strength) {
      document.dispatchEvent(new CustomEvent('pond:ripple-drop', {
        detail: { kind: kind, x: x, y: y, radius: radius, strength: strength }
      }));
    }
    function waterEllipse() {
      var r = div.getBoundingClientRect();
      return {
        cx: WATER.cx * r.width,
        cy: WATER.cy * r.height,
        rx: WATER.rx * r.width,
        ry: WATER.ry * r.height
      };
    }
    function rayToEllipse(e, x, y, angle) {
      var vx = Math.cos(angle), vy = Math.sin(angle);
      var ox = x - e.cx, oy = y - e.cy;
      var a = (vx * vx) / (e.rx * e.rx) + (vy * vy) / (e.ry * e.ry);
      var b = 2 * ((ox * vx) / (e.rx * e.rx) + (oy * vy) / (e.ry * e.ry));
      var c = (ox * ox) / (e.rx * e.rx) + (oy * oy) / (e.ry * e.ry) - 1;
      var disc = b * b - 4 * a * c;
      if (disc <= 0 || a <= 0) return null;
      var t = (-b + Math.sqrt(disc)) / (2 * a);
      if (t <= 0) return null;
      return { x: x + vx * t, y: y + vy * t, t: t, vx: vx, vy: vy };
    }
    function reflectionAngles(kind, x, y, e) {
      var base = Math.atan2(y - e.cy, x - e.cx);
      if (!isFinite(base)) base = Math.random() * Math.PI * 2;
      if (kind === 'food') return [base - 0.36, base + 0.36];
      return [base];
    }
    var lastKoiReflection = 0;
    function scheduleReflections(kind, x, y, radius, strength) {
      if (kind === 'reflection' || strength < 0.0032) return;

      var e = waterEllipse();
      var nx = (x - e.cx) / e.rx, ny = (y - e.cy) / e.ry;
      var depth = Math.sqrt(nx * nx + ny * ny);
      var now = Date.now();

      // Koi wake drops happen often, so only reflect the ones already
      // traveling near the rim and throttle them into soft occasional echoes.
      if (kind === 'koi') {
        if (depth < 0.58 || now - lastKoiReflection < REFLECT.koiCooldown) return;
        lastKoiReflection = now;
      }

      var angles = reflectionAngles(kind, x, y, e);
      var strengthMul = REFLECT.strength[kind] || REFLECT.strength.generic;
      var radiusMul = REFLECT.radius[kind] || REFLECT.radius.generic;

      angles.forEach(function (angle, i) {
        var hit = rayToEllipse(e, x, y, angle);
        if (!hit) return;
        var delay = clamp(hit.t / REFLECT.waveSpeed, REFLECT.minDelay, REFLECT.maxDelay);
        var inwardX = hit.x - hit.vx * REFLECT.inset;
        var inwardY = hit.y - hit.vy * REFLECT.inset;
        var falloff = clamp(1 - hit.t / Math.max(e.rx, e.ry), 0.35, 0.82);
        var echoStrength = strength * strengthMul * falloff * (i ? 0.74 : 1);
        var echoRadius = radius * radiusMul * (i ? 0.84 : 1);
        if (echoStrength < 0.0016) return;
        setTimeout(function () {
          dropRaw('reflection', inwardX, inwardY, echoRadius, echoStrength, { reflect: false });
        }, delay * 1000);
      });
    }
    function dropRaw(kind, x, y, radius, strength, options) {
      radius = clamp(radius || 0, 2, STYLE.maxRadius);
      strength = clamp(strength || 0, 0, STYLE.maxStrength);
      try {
        window.jQuery(div).ripples('drop', x, y, radius, strength);
        emit(kind, x, y, radius, strength);
        if (!options || options.reflect !== false) scheduleReflections(kind, x, y, radius, strength);
      } catch (e) { /* sim lost (context loss) — ignore */ }
    }

    window.PondRipples = {
      /* x/y in pond-box px; radius px; strength ≈ perturbance share */
      drop: function (x, y, radius, strength) {
        dropRaw('generic', x, y, radius, strength);
      },
      dropKoi: function (x, y, fishH, speedN) {
        var sn = Math.max(0, Math.min(1, speedN || 0));
        var radius = Math.min(fishH * STYLE.koiRadius, STYLE.koiMaxRadius);
        var strength = Math.min(STYLE.koiStrengthBase + sn * STYLE.koiStrengthSpeed, STYLE.koiMaxStrength);
        dropRaw('koi', x, y, radius, strength);
      },
      dropFood: function (x, y, fishH) {
        var radius = Math.min(fishH * STYLE.foodRadius, STYLE.foodMaxRadius);
        dropRaw('food', x, y, radius, STYLE.foodStrength);
        // Slightly strange, natural-looking asymmetry: two tiny delayed
        // off-center taps, like a pellet skips under the water skin.
        setTimeout(function () { dropRaw('food', x + fishH * 0.08, y - fishH * 0.035, Math.min(fishH * STYLE.foodScatter, STYLE.foodMaxRadius * 0.55), STYLE.foodScatterStrength, { reflect: false }); }, 75);
        setTimeout(function () { dropRaw('food', x - fishH * 0.045, y + fishH * 0.06, Math.min(fishH * STYLE.foodScatter * 0.82, STYLE.foodMaxRadius * 0.45), STYLE.foodScatterStrength * 0.72, { reflect: false }); }, 145);
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
