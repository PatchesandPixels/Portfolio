/* ════════════════════════════════════════════════════════════════
   PONDRIPPLES.JS — WebGL water refraction (jquery.ripples) on the
   pond background, with drops driven by the swimming koi.

   jquery.ripples renders a real ripple simulation that REFRACTS the
   element's background image — the pond floor art visibly bends and
   settles like disturbed water. It can only distort one element's
   background, so it lives on a div that mirrors the .koi-bg art,
   sitting at the same layer (under the fish — physically right, since
   what a surface ripple distorts is your view of what's below it).

   Drop sources:
     - swimming koi (koipond.js calls PondRipples.dropKoi as fish move)
     - feeding clicks (koipond.js calls PondRipples.dropFood)

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

    // the ripple surface now shows the same art — hide the flat img
    // (kept in the DOM as the instant fallback if ripples get destroyed)
    img.style.visibility = 'hidden';

    function emit(kind, x, y, radius, strength) {
      document.dispatchEvent(new CustomEvent('pond:ripple-drop', {
        detail: { kind: kind, x: x, y: y, radius: radius, strength: strength }
      }));
    }
    function dropRaw(kind, x, y, radius, strength) {
      radius = clamp(radius || 0, 2, STYLE.maxRadius);
      strength = clamp(strength || 0, 0, STYLE.maxStrength);
      try {
        window.jQuery(div).ripples('drop', x, y, radius, strength);
        emit(kind, x, y, radius, strength);
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
        setTimeout(function () { dropRaw('food', x + fishH * 0.08, y - fishH * 0.035, Math.min(fishH * STYLE.foodScatter, STYLE.foodMaxRadius * 0.55), STYLE.foodScatterStrength); }, 75);
        setTimeout(function () { dropRaw('food', x - fishH * 0.045, y + fishH * 0.06, Math.min(fishH * STYLE.foodScatter * 0.82, STYLE.foodMaxRadius * 0.45), STYLE.foodScatterStrength * 0.72); }, 145);
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
