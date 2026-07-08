/* ════════════════════════════════════════════════════════════════
   HOME.JS — interactive grid, hero parallax, reveals, work previews
   Vanilla JS, no dependencies. Progressive enhancement only:
   all content and links work without this file.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var coarsePointer = window.matchMedia('(pointer: coarse)');

  /* ─── 1. INTERACTIVE VERTICAL-LINE GRID ─────────────────────── */
  (function gridCanvas() {
    var canvas = document.getElementById('gridCanvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');

    var W = 0, H = 0, dpr = 1, spacing = 96, lines = [];
    // pointer state: target (raw) and eased (drawn) positions
    var tx = -9999, ty = -9999, px = -9999, py = -9999;
    var rafId = null, idleFrames = 0;
    var RADIUS = 180, PULL = 26;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spacing = W < 700 ? 132 : 96;      // far fewer lines on small screens
      lines = [];
      for (var x = spacing / 2; x < W; x += spacing) lines.push(x);
      drawStatic();
    }

    function lineColor() {
      return W < 700 ? 'rgba(26,22,18,0.05)' : 'rgba(26,22,18,0.07)';
    }

    function drawStatic() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = lineColor();
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var i = 0; i < lines.length; i++) {
        ctx.moveTo(lines[i], 0);
        ctx.lineTo(lines[i], H);
      }
      ctx.stroke();
    }

    function draw() {
      // ease pointer toward target — interpolation, never snapping
      px += (tx - px) * 0.12;
      py += (ty - py) * 0.12;

      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = lineColor();
      ctx.lineWidth = 1;

      var seg = 14; // vertical segment length in px
      for (var i = 0; i < lines.length; i++) {
        var x = lines[i];
        var dx = x - px;
        if (Math.abs(dx) > RADIUS) {
          // far from pointer: cheap straight line
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, H);
          ctx.stroke();
          continue;
        }
        ctx.beginPath();
        ctx.moveTo(x, 0);
        for (var y = 0; y <= H; y += seg) {
          var dy = y - py;
          var d = Math.sqrt(dx * dx + dy * dy);
          var off = 0;
          if (d < RADIUS) {
            // smooth falloff; line pulls toward the pointer horizontally
            var t = 1 - d / RADIUS;
            off = -dx / (Math.abs(dx) + 8) * PULL * t * t;
          }
          ctx.lineTo(x + off, y);
        }
        ctx.stroke();
      }

      // stop the loop once the pointer easing settles (no idle rAF burn)
      if (Math.abs(tx - px) < 0.3 && Math.abs(ty - py) < 0.3) {
        idleFrames++;
        if (idleFrames > 30) { rafId = null; return; }
      } else {
        idleFrames = 0;
      }
      rafId = requestAnimationFrame(draw);
    }

    function wake() {
      if (rafId === null) rafId = requestAnimationFrame(draw);
    }

    var interactive = !reducedMotion.matches && !coarsePointer.matches;

    window.addEventListener('resize', resize, { passive: true });
    resize();

    if (interactive) {
      window.addEventListener('pointermove', function (e) {
        tx = e.clientX; ty = e.clientY;
        wake();
      }, { passive: true });
      window.addEventListener('pointerleave', function () {
        tx = -9999; ty = -9999;
        wake();
      });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden && rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    }
  })();

  /* ─── 1b. KEEP GRID OFF THE HERO ───────────────────────────── */
  (function heroGridGate() {
    var heroEl = document.querySelector('.hero');
    if (!heroEl) return;

    function update() {
      var heroBottom = heroEl.offsetTop + heroEl.offsetHeight;
      var showGrid = window.scrollY >= heroBottom - 24;
      document.documentElement.classList.toggle('hero-grid-hidden', !showGrid);
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  })();

  /* ─── 2. SCROLL REVEALS ─────────────────────────────────────── */
  (function reveals() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reducedMotion.matches) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ─── 3. HERO: entrance + restrained pointer parallax ───────── */
  (function hero() {
    var heroEl = document.querySelector('.hero');
    if (!heroEl) return;

    // entrance: patches settle in (CSS handles stagger via --patch-delay)
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { heroEl.classList.add('is-in'); });
    });

    if (reducedMotion.matches || coarsePointer.matches) return;

    var board = heroEl.querySelector('.patch-board');
    if (!board) return;
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

    function tick() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      board.style.setProperty('--px', cx.toFixed(2) + 'px');
      board.style.setProperty('--py', cy.toFixed(2) + 'px');
      if (Math.abs(tx - cx) > 0.2 || Math.abs(ty - cy) > 0.2) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }

    heroEl.addEventListener('pointermove', function (e) {
      var r = heroEl.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 24;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 16;
      if (raf === null) raf = requestAnimationFrame(tick);
    }, { passive: true });

    heroEl.addEventListener('pointerleave', function () {
      tx = 0; ty = 0;
      if (raf === null) raf = requestAnimationFrame(tick);
    });
  })();

  /* ─── 4. WORK LIST → PREVIEW STAGE ──────────────────────────── */
  (function workPreviews() {
    var list = document.querySelector('.work-list');
    var stage = document.querySelector('.work-stage');
    if (!list || !stage) return;

    var rows = Array.prototype.slice.call(list.querySelectorAll('.work-row'));
    var scenes = {};
    stage.querySelectorAll('.stage-scene').forEach(function (s) {
      scenes[s.dataset.project] = s;
    });

    var sceneId = null;
    var DEFAULT_ID = rows.length ? rows[0].dataset.project : null;
    var ripple = stage.querySelector('.pool-ripple');

    function stopSceneMotion(scene) {
      if (!scene) return;
      scene.querySelectorAll('video').forEach(function (video) {
        video.pause();
        video.currentTime = 0;
      });
    }

    function playSceneMotion(scene) {
      if (!scene) return;
      scene.querySelectorAll('video').forEach(function (video) {
        video.currentTime = 0;
        var play = video.play();
        if (play && typeof play.catch === 'function') play.catch(function () {});
      });
    }

    // send a ripple across the pool (restart the CSS animation)
    function pulseRipple() {
      if (!ripple) return;
      ripple.classList.remove('is-rippling');
      void ripple.offsetWidth;              // reflow so the animation replays
      ripple.classList.add('is-rippling');
    }

    // which project is surfaced in the reflecting pool (rise/focus in CSS)
    function setScene(id) {
      if (id === sceneId) return;
      if (sceneId && scenes[sceneId]) {
        scenes[sceneId].classList.remove('is-active');
        stopSceneMotion(scenes[sceneId]);
      }
      sceneId = id;
      if (id && scenes[id]) {
        scenes[id].classList.add('is-active');
        playSceneMotion(scenes[id]);
        stage.classList.add('has-active');
        pulseRipple();
      } else {
        stage.classList.remove('has-active');
      }
    }
    // which row reads as hovered (dims the others)
    function setRowHighlight(id) {
      rows.forEach(function (r) {
        r.classList.toggle('is-active', r.dataset.project === id);
      });
      list.classList.toggle('has-active', !!id);
      document.documentElement.classList.toggle('work-grid-dimmed', !!id);
    }
    function activate(id) { setScene(id); setRowHighlight(id); }
    // at rest the scroll is never empty: the first project stays on
    // display, with no row highlighted/dimmed
    function rest() { setScene(DEFAULT_ID); setRowHighlight(null); }

    rows.forEach(function (row) {
      var id = row.dataset.project;
      row.addEventListener('pointerenter', function () { activate(id); });
      // keyboard parity: focusing the row's link previews it too
      row.addEventListener('focusin', function () { activate(id); });
    });
    list.addEventListener('pointerleave', rest);
    list.addEventListener('focusout', function (e) {
      if (!list.contains(e.relatedTarget)) rest();
    });

    rest();   // resting display on load — scroll shows the first project
  })();

  /* ─── 4b. MOBILE NAVIGATION ─────────────────────────────────── */
  (function mobileNav() {
    var btn = document.getElementById('navMenuBtn');
    var nav = document.querySelector('.nav');
    var links = document.getElementById('navLinks');
    if (!btn || !nav || !links) return;

    function setOpen(open) {
      nav.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('menu-locked', open);
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!nav.classList.contains('menu-open'));
    });
    // close on selection, Escape, or outside tap
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('menu-open') && !nav.contains(e.target)) setOpen(false);
    });
    // leaving the mobile breakpoint resets the state
    window.matchMedia('(min-width: 768px)').addEventListener('change', function (m) {
      if (m.matches) setOpen(false);
    });
  })();

  /* ─── 5. PAUSE GALLERY VIDEOS OFFSCREEN ─────────────────────── */
  (function videoGuard() {
    var vids = document.querySelectorAll('video[data-autoplay]');
    if (!vids.length) return;
    if (reducedMotion.matches) {
      vids.forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });
      return;
    }
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) { v.play().catch(function () {}); }
        else { v.pause(); }
      });
    }, { threshold: 0.2 });
    vids.forEach(function (v) { io.observe(v); });
  })();
})();
