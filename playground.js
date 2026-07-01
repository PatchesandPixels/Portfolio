/* ════════════════════════════════════════════════════════════════
   PLAYGROUND.JS — "Patch Notes Playground" hero interaction
   Vanilla pointer-events drag with light throw momentum. No deps.
   Progressive enhancement: tokens are real, readable HTML without JS;
   this file makes them draggable and wires the Patch Zone.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  var pg = document.querySelector('.playground');
  if (!pg) return;
  var stage = pg.querySelector('.pg-stage');
  var zone = pg.querySelector('.pg-zone');
  var tokenEls = Array.prototype.slice.call(pg.querySelectorAll('.patch-token'));
  var outputs = Array.prototype.slice.call(pg.querySelectorAll('.pg-output-item'));
  if (!stage || !zone || !tokenEls.length) return;

  // On very small screens CSS lays tokens out as a static wrap row and the
  // zone/output stack. There, dragging is cramped — use tap-to-patch only.
  var tapMode = window.matchMedia('(max-width: 540px)').matches;

  var patchedTotal = 0;
  var tokens = [];

  /* ── geometry helpers ── */
  function stageRect() { return stage.getBoundingClientRect(); }
  function tokenSize(el) { var r = el.getBoundingClientRect(); return { w: r.width, h: r.height }; }

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }

  function place(tok) {
    tok.el.style.transform = 'translate(' + tok.x + 'px,' + tok.y + 'px)';
  }

  /* scatter tokens down the left ~58% of the stage (clear of the zone),
     staggered with enough vertical spacing that wide chips never overlap */
  function scatter() {
    var s = stageRect();
    var colW = s.width * 0.58;
    var n = tokens.length;
    var tokH = tokenSize(tokens[0].el).h || 38;
    // distribute down the column so rows always clear each other (+ idle float)
    var spacing = clamp((s.height - tokH - 16) / (n - 1), 44, 56);
    tokens.forEach(function (tok, i) {
      var sz = tokenSize(tok.el);
      tok.w = sz.w; tok.h = sz.h;
      // alternate a small indent for a hand-scattered feel
      var indent = (i % 2 ? 46 : 8) + (Math.random() * 10 - 5);
      var maxX = Math.max(0, Math.min(colW, s.width) - tok.w);
      tok.x = clamp(indent, 0, maxX);
      tok.y = clamp(12 + i * spacing + (Math.random() * 6 - 3), 0, Math.max(0, s.height - tok.h));
      place(tok);
    });
  }

  /* does the token's centre sit inside the patch zone? */
  function overZone(tok) {
    var s = stageRect();
    var z = zone.getBoundingClientRect();
    var cx = s.left + tok.x + tok.w / 2;
    var cy = s.top + tok.y + tok.h / 2;
    return cx > z.left && cx < z.right && cy > z.top && cy < z.bottom;
  }

  function checkNextOutput() {
    if (patchedTotal < outputs.length) {
      outputs[patchedTotal].classList.add('is-done');
    }
    patchedTotal++;
  }

  function patch(tok) {
    if (tok.patched) return;
    tok.patched = true;
    tok.el.classList.add('is-patched');
    zone.classList.remove('is-hot');
    if (!reduce) {
      zone.classList.remove('is-pulse'); void zone.offsetWidth;
      zone.classList.add('is-pulse');
    }
    checkNextOutput();

    // settle the patched token into a tidy pile inside the zone
    var s = stageRect();
    var z = zone.getBoundingClientRect();
    var pileX = (z.left - s.left) + 14 + (tok.pile % 3) * 10;
    var pileY = (z.bottom - s.top) - tok.h - 12 - Math.floor(tok.pile / 3) * 8;
    tok.vx = 0; tok.vy = 0;
    if (reduce) {
      tok.x = clamp(pileX, 0, s.width - tok.w);
      tok.y = clamp(pileY, 0, s.height - tok.h);
      place(tok);
    } else {
      animateTo(tok, clamp(pileX, 0, s.width - tok.w), clamp(pileY, 0, s.height - tok.h));
    }
  }

  /* eased glide to a target (used for patch settle + tap-to-patch) */
  function animateTo(tok, tx, ty) {
    cancelAnimationFrame(tok.raf);
    var sx = tok.x, sy = tok.y, t0 = performance.now(), dur = 460;
    function frame(now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);           // easeOutCubic
      tok.x = sx + (tx - sx) * e;
      tok.y = sy + (ty - sy) * e;
      place(tok);
      if (p < 1) tok.raf = requestAnimationFrame(frame);
    }
    tok.raf = requestAnimationFrame(frame);
  }

  /* inertia after a throw: glide + friction + bounce off the field edges */
  function inertia(tok) {
    cancelAnimationFrame(tok.raf);
    var s = stageRect();
    var maxX = s.width - tok.w, maxY = s.height - tok.h;
    function frame() {
      tok.x += tok.vx; tok.y += tok.vy;
      if (tok.x < 0) { tok.x = 0; tok.vx *= -0.6; }
      else if (tok.x > maxX) { tok.x = maxX; tok.vx *= -0.6; }
      if (tok.y < 0) { tok.y = 0; tok.vy *= -0.6; }
      else if (tok.y > maxY) { tok.y = maxY; tok.vy *= -0.6; }
      tok.vx *= 0.94; tok.vy *= 0.94;
      place(tok);
      zone.classList.toggle('is-hot', !tok.patched && overZone(tok));
      if (Math.abs(tok.vx) > 0.15 || Math.abs(tok.vy) > 0.15) {
        tok.raf = requestAnimationFrame(frame);
      } else {
        if (!tok.patched && overZone(tok)) patch(tok);
        else zone.classList.remove('is-hot');
      }
    }
    tok.raf = requestAnimationFrame(frame);
  }

  /* ── per-token drag wiring ── */
  function wire(tok) {
    var el = tok.el;
    var startX = 0, startY = 0, baseX = 0, baseY = 0;
    var lastX = 0, lastY = 0, lastT = 0, moved = false, dragging = false;

    el.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      if (tapMode) { e.preventDefault(); return; }   // tap handled on click
      dragging = true; moved = false;
      cancelAnimationFrame(tok.raf);
      startX = e.clientX; startY = e.clientY;
      baseX = tok.x; baseY = tok.y;
      lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
      tok.vx = 0; tok.vy = 0;
      el.classList.add('is-dragging');
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });

    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var s = stageRect();
      var nx = baseX + (e.clientX - startX);
      var ny = baseY + (e.clientY - startY);
      tok.x = clamp(nx, 0, s.width - tok.w);
      tok.y = clamp(ny, 0, s.height - tok.h);
      place(tok);
      if (Math.abs(e.clientX - startX) > 4 || Math.abs(e.clientY - startY) > 4) moved = true;

      var now = performance.now(), dt = now - lastT || 16;
      tok.vx = (e.clientX - lastX) / dt * 16;
      tok.vy = (e.clientY - lastY) / dt * 16;
      lastX = e.clientX; lastY = e.clientY; lastT = now;

      zone.classList.toggle('is-hot', !tok.patched && overZone(tok));
    });

    function end(e) {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('is-dragging');
      try { el.releasePointerCapture(e.pointerId); } catch (err) {}

      if (!tok.patched && overZone(tok)) { patch(tok); return; }
      // throw: cap velocity so it stays playful, then let friction settle it
      var speed = Math.hypot(tok.vx, tok.vy);
      if (!reduce && moved && speed > 0.8) {
        var cap = 26;
        if (speed > cap) { tok.vx *= cap / speed; tok.vy *= cap / speed; }
        inertia(tok);
      } else {
        zone.classList.remove('is-hot');
      }
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);

    // tap-to-patch (coarse / cramped screens, and keyboard parity)
    el.addEventListener('click', function () {
      if (!tapMode && !coarse) return;
      if (tok.patched) return;
      patch(tok);
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!tok.patched) patch(tok); }
    });
  }

  /* ── init ── */
  tokenEls.forEach(function (el, i) {
    el.style.setProperty('--float-delay', (i * 240) + 'ms');
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    var label = (el.getAttribute('data-label') || el.textContent || 'token').trim();
    el.setAttribute('aria-label', 'Patch token: ' + label);
    var tok = { el: el, x: 0, y: 0, vx: 0, vy: 0, w: 0, h: 0, patched: false, raf: 0, pile: i };
    tokens.push(tok);
    wire(tok);
  });

  if (!tapMode) {
    scatter();
    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (window.matchMedia('(max-width: 540px)').matches) {
          // entered cramped mode: hand layout back to CSS
          tokens.forEach(function (t) { t.el.style.transform = ''; });
          tapMode = true;
          return;
        }
        var s = stageRect();
        tokens.forEach(function (tok) {
          tok.w = tokenSize(tok.el).w; tok.h = tokenSize(tok.el).h;
          tok.x = clamp(tok.x, 0, s.width - tok.w);
          tok.y = clamp(tok.y, 0, s.height - tok.h);
          place(tok);
        });
      }, 160);
    }, { passive: true });
  }

  // pause any motion when the tab is hidden
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) tokens.forEach(function (t) { cancelAnimationFrame(t.raf); });
  });
})();
