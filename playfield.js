/* ════════════════════════════════════════════════════════════════
   PLAYFIELD.JS — "toss a pixel" drag engine
   Vanilla pointer-events drag with light throw momentum + edge bounce.
   No dependencies. Progressive enhancement: objects are real, readable
   HTML without JS; this just makes them tossable. Optional & ignorable.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var field = document.querySelector('.playfield');
  if (!field) return;
  var objEls = Array.prototype.slice.call(field.querySelectorAll('.play-obj'));
  if (!objEls.length) return;

  var objs = [];

  function fieldRect() { return field.getBoundingClientRect(); }
  function size(el) { var r = el.getBoundingClientRect(); return { w: r.width, h: r.height }; }
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
  function place(o) { o.el.style.transform = 'translate(' + o.x + 'px,' + o.y + 'px)'; }

  /* scatter objects across the field with light overlap avoidance */
  function scatter() {
    var f = fieldRect();
    var placed = [];
    objs.forEach(function (o) {
      var s = size(o.el); o.w = s.w; o.h = s.h;
      var maxX = Math.max(0, f.width - o.w);
      var maxY = Math.max(0, f.height - o.h);
      var best = null, bestGap = -1;
      for (var t = 0; t < 24; t++) {
        var x = Math.random() * maxX;
        var y = Math.random() * maxY;
        var gap = minGap(x, y, o, placed);
        if (gap > 14) { best = { x: x, y: y }; break; }       // good enough
        if (gap > bestGap) { bestGap = gap; best = { x: x, y: y }; }
      }
      o.x = clamp(best.x, 0, maxX);
      o.y = clamp(best.y, 0, maxY);
      placed.push({ x: o.x, y: o.y, w: o.w, h: o.h });
      place(o);
    });
  }
  function minGap(x, y, o, placed) {
    var g = 9999;
    for (var i = 0; i < placed.length; i++) {
      var p = placed[i];
      var dx = Math.max(p.x - (x + o.w), x - (p.x + p.w), 0);
      var dy = Math.max(p.y - (y + o.h), y - (p.y + p.h), 0);
      g = Math.min(g, Math.hypot(dx, dy));
    }
    return g;
  }

  /* throw inertia: glide + friction + soft bounce off the field edges */
  function inertia(o) {
    cancelAnimationFrame(o.raf);
    var f = fieldRect();
    var maxX = f.width - o.w, maxY = f.height - o.h;
    function frame() {
      o.x += o.vx; o.y += o.vy;
      if (o.x < 0) { o.x = 0; o.vx *= -0.6; }
      else if (o.x > maxX) { o.x = maxX; o.vx *= -0.6; }
      if (o.y < 0) { o.y = 0; o.vy *= -0.6; }
      else if (o.y > maxY) { o.y = maxY; o.vy *= -0.6; }
      o.vx *= 0.94; o.vy *= 0.94;
      place(o);
      if (Math.abs(o.vx) > 0.15 || Math.abs(o.vy) > 0.15) o.raf = requestAnimationFrame(frame);
    }
    o.raf = requestAnimationFrame(frame);
  }

  function wire(o) {
    var el = o.el;
    var startX = 0, startY = 0, baseX = 0, baseY = 0;
    var lastX = 0, lastY = 0, lastT = 0, dragging = false;

    el.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      cancelAnimationFrame(o.raf);
      startX = e.clientX; startY = e.clientY;
      baseX = o.x; baseY = o.y;
      lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
      o.vx = 0; o.vy = 0;
      el.classList.add('is-dragging');
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });

    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var f = fieldRect();
      o.x = clamp(baseX + (e.clientX - startX), 0, f.width - o.w);
      o.y = clamp(baseY + (e.clientY - startY), 0, f.height - o.h);
      place(o);
      var now = performance.now(), dt = now - lastT || 16;
      o.vx = (e.clientX - lastX) / dt * 16;
      o.vy = (e.clientY - lastY) / dt * 16;
      lastX = e.clientX; lastY = e.clientY; lastT = now;
    });

    function end(e) {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('is-dragging');
      try { el.releasePointerCapture(e.pointerId); } catch (err) {}
      var speed = Math.hypot(o.vx, o.vy);
      if (!reduce && speed > 0.8) {
        var cap = 28;
        if (speed > cap) { o.vx *= cap / speed; o.vy *= cap / speed; }
        inertia(o);
      }
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);

    // keyboard nudge for parity (objects are focusable)
    el.addEventListener('keydown', function (e) {
      var step = 12, moved = true;
      if (e.key === 'ArrowLeft') o.x -= step;
      else if (e.key === 'ArrowRight') o.x += step;
      else if (e.key === 'ArrowUp') o.y -= step;
      else if (e.key === 'ArrowDown') o.y += step;
      else moved = false;
      if (moved) {
        e.preventDefault();
        var f = fieldRect();
        o.x = clamp(o.x, 0, f.width - o.w);
        o.y = clamp(o.y, 0, f.height - o.h);
        place(o);
      }
    });
  }

  /* ── init ── */
  objEls.forEach(function (el, i) {
    if (getComputedStyle(el).display === 'none') return;   // skip hidden (tablet) objects
    el.style.setProperty('--float-delay', (i * 220) + 'ms');
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    var label = (el.getAttribute('data-label') || 'object').trim();
    el.setAttribute('aria-label', 'Draggable ' + label);
    var o = { el: el, x: 0, y: 0, vx: 0, vy: 0, w: 0, h: 0, raf: 0 };
    objs.push(o);
    wire(o);
  });

  scatter();

  var rt = null;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var f = fieldRect();
      objs.forEach(function (o) {
        var s = size(o.el); o.w = s.w; o.h = s.h;
        o.x = clamp(o.x, 0, f.width - o.w);
        o.y = clamp(o.y, 0, f.height - o.h);
        place(o);
      });
    }, 160);
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) objs.forEach(function (o) { cancelAnimationFrame(o.raf); });
  });
})();
