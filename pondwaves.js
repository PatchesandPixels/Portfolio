/* ════════════════════════════════════════════════════════════════
   PONDWAVES.JS — local ripple accents + wind-coupled plant motion
   The moving-water shimmer: individual light "caustic strand" sprites
   (cut from water-shimmer-texture.png offline — background keyed away,
   each strand isolated into assets/hero/koi/beautiful-pond/waves/)
   drift slowly across the pond like mini wave crests catching light.

   Each strand lives a short cycle: it rises, glides along a shared
   breeze heading (with its own jitter and sideways sway), then
   dissipates and respawns somewhere else. Three things make it read
   as wind on real water rather than a drifting cloud:
     - a GLINT pass: on top of the faint base strand, a bright spot —
       isolated by masking the sprite with a moving radial gradient —
       travels along the crest and pulses, so parts of the wave catch
       light while the rest stays dim.
     - a GUST FRONT (real-world wind physics): a broad band of
       agitation sweeps across the WHOLE pond along the wind heading,
       the way a breeze roughens a traveling swath of surface
       ("cat's paws"). Every strand the front passes over brightens
       AND gets pushed faster downwind; behind the front the water
       settles into a lull until the next gust arrives. Two fronts on
       different periods overlap so the rhythm never feels metronomic.
     - between gusts a low ambient floor keeps a faint shimmer alive,
       so the pond never reads as switched off.

   The ambient all-over wave-strand field is disabled; this layer now
   only draws short-lived accents that are triggered by the same ripple
   events as PondRipples, plus the separate wind-coupled plant sprites.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var pond = document.querySelector('.koipond');
  if (!pond) return;
  var canvas = pond.querySelector('.pond-waves-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var DIR = 'assets/hero/koi/beautiful-pond/waves/';
  var SPRITE_COUNT = 10;
  var WAVES = 0;                                   // ambient full-pond wave strands disabled
  var BASE_DIR = -0.18;                            // shared wind heading (rad, ~10° up-right)
  var WATER = { cx: 0.5, cy: 0.5, rx: 0.44, ry: 0.40 };
  var AMBIENT = 0.22;                              // shimmer floor between gusts
  var GUST_PUSH = 26;                              // extra px/s the wind adds inside a gust

  var sprites = [], loaded = 0;
  for (var s = 1; s <= SPRITE_COUNT; s++) {
    (function (i) {
      var im = new Image();
      im.onload = function () { sprites[i - 1] = im; loaded++; if (loaded === 1) wake(); };
      im.src = DIR + 'wave-' + i + '.png';
    })(s);
  }

  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var waves = [], impacts = [], raf = null, t0 = 0, currentT = 0;
  /* shared scratch canvas for the glint pass (sprite masked by a
     moving radial gradient) — sized once per resize, reused per wave */
  var scratch = document.createElement('canvas'), sctx = scratch.getContext('2d');

  function resize() {
    var r = pond.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scratch.width = Math.ceil(W * 0.26 * dpr);
    scratch.height = Math.ceil(W * 0.26 * dpr);
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function randInWater(shrink) {
    var a = Math.random() * 6.283, rr = Math.sqrt(Math.random()) * shrink;
    return {
      x: (WATER.cx + Math.cos(a) * WATER.rx * rr) * W,
      y: (WATER.cy + Math.sin(a) * WATER.ry * rr) * H
    };
  }

  function spawn(t, initial) {
    var p = randInWater(0.82);
    var dur = 4.5 + Math.random() * 3.5;           //  short-lived: appear, sparkle, dissipate
    return {
      img: Math.floor(Math.random() * SPRITE_COUNT),
      x: p.x, y: p.y,
      dir: BASE_DIR + (Math.random() - 0.5) * 0.7,
      speed: 6 + Math.random() * 5,                //  CSS px/s — a visible glide
      w: 0.12 + Math.random() * 0.1,               //  strand width as fraction of pond width
      basePeak: 0.2 + Math.random() * 0.1,         //  whole-strand body (strong inside a gust)
      glintPeak: 0.65 + Math.random() * 0.3,       //  bright sun-catch spot
      glintDir: Math.random() < 0.5 ? -1 : 1,      //  which way the light travels along the crest
      twPh: Math.random() * 6.283,                 //  twinkle phase
      swayPh: Math.random() * 6.283,
      flip: Math.random() < 0.5 ? -1 : 1,
      born: t - (initial ? Math.random() * dur : 0),   // stagger phases at boot
      dur: dur
    };
  }

  /* ── gust fronts: the real-world model. Wind arrives as a broad
     band of agitation that SWEEPS the whole pond along the wind
     heading — every patch of water it crosses roughens, then settles
     behind it. Each front: during the first 65% of its cycle the band
     travels from upwind edge to downwind edge; the rest is lull.
     Two fronts on different periods overlap so gusts feel irregular.
     Returns 0..1 strength at a point. ── */
  var COS_D = Math.cos(BASE_DIR), SIN_D = Math.sin(BASE_DIR);
  /* project a point onto the wind axis, normalized 0 (upwind edge of
     the pond box) → 1 (downwind edge) */
  function windCoord(x, y) {
    var sMin = Math.min(0, W * COS_D) + Math.min(0, H * SIN_D);
    var sMax = Math.max(0, W * COS_D) + Math.max(0, H * SIN_D);
    return (x * COS_D + y * SIN_D - sMin) / (sMax - sMin);
  }
  function frontStrength(x, y, t, period, phase, width, gain) {
    var cyc = ((t + phase) % period) / period;         // 0..1 through this gust's cycle
    if (cyc > 0.65) return 0;                          // lull between gusts
    var front = -0.25 + (cyc / 0.65) * 1.5;            // band center, -0.25 → 1.25 across the pond
    var d = (windCoord(x, y) - front) / width;
    return Math.exp(-d * d) * gain;
  }
  function gustAt(x, y, t) {
    var a = frontStrength(x, y, t, 13, 0, 0.28, 1);
    var b = frontStrength(x, y, t, 21, 8.5, 0.34, 0.7);
    return Math.min(1, a + b);
  }

  /* soft fade near the open-water rim so strands never sit on the
     painted shore plants */
  function edgeFade(x, y) {
    var nx = (x / W - WATER.cx) / WATER.rx;
    var ny = (y / H - WATER.cy) / WATER.ry;
    var d = Math.sqrt(nx * nx + ny * ny);
    return d >= 1 ? 0 : d <= 0.72 ? 1 : 1 - (d - 0.72) / 0.28;
  }
  function hash(n) {
    var x = Math.sin(n) * 10000;
    return x - Math.floor(x);
  }
  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  document.addEventListener('pond:ripple-drop', function (e) {
    if (!e.detail || reduce) return;
    var d = e.detail;
    impacts.push({
      kind: d.kind || 'generic',
      x: d.x,
      y: d.y,
      radius: clamp(d.radius || W * 0.03, 2, W * 0.035),
      strength: clamp(d.strength || 0.006, 0, 0.018),
      seed: Math.random() * 1000,
      born: currentT
    });
    if (impacts.length > 18) impacts.shift();
    wake();
  });

  /* ── wind-coupled shore plants ──
     The reeds/lilies in the baked background can't move, so a few
     SEPARATE plant sprites (real alpha, same art set) are placed at
     the fringes of the baked clusters and driven by the same gustAt()
     field as the waves. When a front passes over a plant's spot:
       - reeds lean downwind and flutter harder (rooted at the stem)
       - lily pads get nudged a few px downwind and wobble, then
         settle back as the gust moves on
     Each plant smooths the gust with its own inertia (reeds respond
     fast, floating pads lag), so the pond, plants, and waves all obey
     one wind. [file, type, centerX, anchorY, width% of pond] */
  var PLANTS_DIR = 'assets/hero/koi/beautiful-pond/plants/';
  var PLANT_DEFS = [
    ['reeds-tall-01.png', 'reed', 0.085, 0.52, 9],
    ['reeds-medium-01.png', 'reed', 0.315, 0.975, 9],
    ['reeds-tall-02.png', 'reed', 0.66, 0.985, 10],
    ['reeds-small-01.png', 'reed', 0.945, 0.34, 7],
    ['single-lily-large-01.png', 'lily', 0.315, 0.075, 6.5],
    ['lily-cluster-small-01.png', 'lily', 0.735, 0.075, 7],
    ['single-lily-medium-01.png', 'lily', 0.155, 0.315, 5.5],
    ['single-lily-medium-02.png', 'lily', 0.855, 0.60, 5.5],
    ['single-lily-small-01.png', 'lily', 0.435, 0.935, 4.5],
    ['single-lily-small-02.png', 'lily', 0.235, 0.635, 4]
  ];
  var POND_AR = 1448 / 1086;                 // pond box aspect, for %-height math
  var plants = [];
  (function buildPlants() {
    var layer = document.createElement('div');
    layer.className = 'plant-layer';
    layer.setAttribute('aria-hidden', 'true');
    pond.appendChild(layer);
    PLANT_DEFS.forEach(function (d) {
      var img = new Image();
      img.className = 'pond-plant ' + (d[1] === 'reed' ? 'plant-reed' : 'plant-lily');
      img.alt = '';
      img.style.width = d[4] + '%';
      img.onload = function () {
        var hPct = d[4] * (img.naturalHeight / img.naturalWidth) * POND_AR;
        img.style.left = (d[2] * 100 - d[4] / 2) + '%';
        // reeds anchor at the stem base, lilies at their center
        img.style.top = (d[3] * 100 - (d[1] === 'reed' ? hPct : hPct / 2)) + '%';
        layer.appendChild(img);
      };
      img.src = PLANTS_DIR + d[0];
      plants.push({ el: img, type: d[1], x: d[2], y: d[3], ph: Math.random() * 6.283, g: 0 });
    });
  })();

  function updatePlants(t, dt) {
    for (var i = 0; i < plants.length; i++) {
      var p = plants[i];
      var g = gustAt(p.x * W, p.y * H, t);
      // inertia: reeds react quickly, floating pads lag and settle
      p.g += (g - p.g) * Math.min(1, dt * (p.type === 'reed' ? 6 : 2.5));
      if (p.type === 'reed') {
        var lean = p.g * 6;                                    // bend downwind
        var flutter = (0.7 + 2.6 * p.g) * Math.sin(t * (1.5 + p.g * 1.8) + p.ph);
        p.el.style.transform = 'rotate(' + (lean + flutter).toFixed(2) + 'deg)';
      } else {
        var nudge = p.g * 5;                                   // px downwind
        var tx = COS_D * nudge + Math.sin(t * 0.6 + p.ph) * 1.3;
        var ty = SIN_D * nudge + Math.cos(t * 0.5 + p.ph) * 1.0;
        var rot = Math.sin(t * 0.9 + p.ph) * (0.8 + p.g * 2.6);
        p.el.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) rotate(' + rot.toFixed(2) + 'deg)';
      }
    }
  }

  function drawRippleAccents(t) {
    for (var i = impacts.length - 1; i >= 0; i--) {
      var im = impacts[i];
      var age = t - im.born;
      var life = im.kind === 'food' ? 1.15 : 0.72;
      if (age > life) { impacts.splice(i, 1); continue; }
      var p = age / life;
      var fade = Math.pow(1 - p, 1.7) * edgeFade(im.x, im.y);
      if (fade <= 0.01) continue;
      var weird = im.kind === 'food' ? 1 : 0.45;
      var radius = Math.min(im.radius * (0.78 + p * (im.kind === 'food' ? 1.8 : 1.15)), W * 0.072);
      var alpha = Math.min(0.095, im.strength * (im.kind === 'food' ? 5.2 : 2.6)) * fade;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.shadowBlur = im.kind === 'food' ? 5 : 3;
      ctx.shadowColor = 'rgba(105, 222, 216,' + (alpha * 0.5).toFixed(3) + ')';
      ctx.strokeStyle = 'rgba(169, 241, 229,' + alpha.toFixed(3) + ')';
      ctx.lineWidth = im.kind === 'food' ? 1.2 : 0.9;
      var segs = im.kind === 'food' ? 9 : 5;
      for (var s = 0; s < segs; s++) {
        if (hash(im.seed + s * 31 + Math.floor(p * 5)) < (im.kind === 'food' ? 0.22 : 0.38)) continue;
        var start = hash(im.seed + s * 71) * Math.PI * 2 + p * 0.55 * weird;
        var len = 0.18 + hash(im.seed + s * 19) * (im.kind === 'food' ? 0.34 : 0.2);
        ctx.beginPath();
        for (var k = 0; k <= 5; k++) {
          var a = start + len * (k / 5);
          var wob = 1 + (hash(im.seed + s * 13 + k * 7) - 0.5) * 0.18 * weird;
          var x = Math.round(im.x + Math.cos(a) * radius * wob);
          var y = Math.round(im.y + Math.sin(a) * radius * 0.43 * wob);
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  var lastT = 0;
  function paint(t) {
    currentT = t;
    var dt = Math.min(0.1, Math.max(0, t - lastT));
    lastT = t;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < waves.length; i++) {
      var wv = waves[i];
      var age = t - wv.born;
      var p = age / wv.dur;
      if (p >= 1) { waves[i] = spawn(t, false); continue; }
      var im = sprites[wv.img];
      if (!im) continue;
      // wind at this wave's spot right now
      var g = gustAt(wv.x, wv.y, t);
      // glide with the breeze; a passing gust physically pushes the
      // wave faster downwind — integrated, so speed varies over life
      var push = wv.speed + GUST_PUSH * g;
      wv.x += Math.cos(wv.dir) * push * dt;
      wv.y += Math.sin(wv.dir) * push * dt;
      var x = wv.x;
      var y = wv.y + Math.sin(t * 0.8 + wv.swayPh) * 4;
      // brightness: lifecycle envelope × rim fade × (ambient + gust)
      var env = Math.sin(Math.PI * p) * edgeFade(x, y) * (AMBIENT + (1 - AMBIENT) * g);
      if (env < 0.02) continue;
      var dw = W * wv.w;
      var dh = dw * im.naturalHeight / im.naturalWidth;

      // pass 1 — faint whole-strand body
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(wv.flip, 1);
      ctx.globalAlpha = wv.basePeak * env;
      ctx.drawImage(im, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();

      // pass 2 — the sun-catch glint: mask the sprite down to a bright
      // spot that travels along the crest and pulses as it goes
      var tw = 0.45 + 0.55 * Math.max(0, Math.sin(t * 2.4 + wv.twPh));
      var glintA = wv.glintPeak * env * tw;
      if (glintA < 0.02) continue;
      var gx = dw * (0.5 + wv.glintDir * (p - 0.5) * 0.7);   // slides end-to-end over the life
      var gy = dh * 0.5;
      sctx.clearRect(0, 0, scratch.width / dpr, scratch.height / dpr);
      sctx.globalCompositeOperation = 'source-over';
      sctx.drawImage(im, 0, 0, dw, dh);
      var grad = sctx.createRadialGradient(gx, gy, 0, gx, gy, dw * 0.3);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      sctx.globalCompositeOperation = 'destination-in';
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, dw, dh);
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(wv.flip, 1);
      ctx.globalAlpha = glintA;
      ctx.drawImage(scratch, 0, 0, dw * dpr, dh * dpr, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    drawRippleAccents(t);

    // shore plants obey the same wind
    updatePlants(t, dt);
  }

  function frame(ts) {
    if (!t0) t0 = ts;
    paint((ts - t0) / 1000);
    raf = requestAnimationFrame(frame);
  }

  function wake() {
    if (!W) resize();
    if (!waves.length) {
      for (var i = 0; i < WAVES; i++) waves.push(spawn(0, true));
    }
    if (reduce) { paint(2.5); return; }      // one calm static frame
    if (raf === null) raf = requestAnimationFrame(frame);
  }

  var rt = null;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); if (reduce) paint(2.5); }, 150);
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (reduce) return;
    if (document.hidden && raf !== null) { cancelAnimationFrame(raf); raf = null; }
    else if (!document.hidden && raf === null && loaded) { raf = requestAnimationFrame(frame); }
  });
})();
