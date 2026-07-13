/* ════════════════════════════════════════════════════════════════
   KOIPOND.JS — dark pixel-art koi pond: fish, lily pads, food & ripples
   Scene: pond base (WebGL-refracted, see pondripples.js) → fish shadow →
   fish rig → lily pads (fish swim UNDER these) → ripples → food pellets
   → UI. Each koi drops its own ripple into the WebGL water as it swims
   (PondRipples.drop, called from the update loop below).

   The koi are SEGMENTED RIGS, never sprite-swapped: head-body /
   mid-body / tail-base / tail-fin / left-fin / right-fin are six
   independent layers (assets/hero/koi/rig2/), each rotating around its
   own joint pivot. A sine swim cycle with PHASE OFFSETS travels down
   the spine (head calmest → tail-fin strongest), and a spring-smoothed
   turn bias leans the chain into turns.

   Two smoothing layers keep turning fluid instead of "pivoted":
     1. steering physics (f.angle) is rate-clamped — heading can only
        change by a fixed amount per frame, so a target behind the fish
        produces a wide arc, never a spin-in-place.
     2. a SEPARATE visual heading (f.visualAngle) eases toward f.angle
        every frame — the body's rendered rotation trails the physics
        heading slightly, like real rotational inertia, so direction
        changes read as smooth swimming rather than a mechanical snap.

   Idle behaviour: with no food around, fish patrol a lazy orbit but
   periodically rest — drifting to a stop (or a slow crawl) and holding
   still for a few seconds before moving on. They are not perpetually
   circling.

   Feeding: click drops a pellet and a single ripple that plays once
   and settles; the nearest fish always responds, others join if
   close enough, and a small ripple marks the moment it's eaten.

   Rig facts: fish points DOWN in source; head/front-body pivot at
   (300,667) of 600×953. Group rotation = travelDirection − 90°.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var pond = document.querySelector('.koipond');
  if (!pond) return;
  var stage = pond.querySelector('.koi-stage');
  var rippleLayer = pond.querySelector('.ripple-layer');
  var foodLayer = pond.querySelector('.food-layer');
  var disturbanceLayer = pond.querySelector('.koi-disturbance-canvas');
  if (!stage || !rippleLayer || !foodLayer) return;

  /* ── asset config ── */
  var A = 'assets/hero/koi/';
  var RIG = A + 'rig2/';
  var POND = A + 'pond3/';   // pond base + food pellet — ships fully opaque, needs keying
  var BEAUTIFUL = A + 'beautiful-pond/';
  var FOOD = 'assets/koi-pond/food/koi-food-pellet.png';
  /* back-to-front, per koi-rig-pivots.json's recommended layer order */
  var RIG_PARTS = ['tail-fin', 'tail-base', 'mid-body', 'head-body', 'left-fin', 'right-fin'];
  var PIV_X = 0.5, PIV_Y = 667 / 953;      // head/front-body pivot fraction
  var FISH_AR = 600 / 953;                 // rig canvas width / height

  /* elliptical swim region (fractions of the pond box) */
  /* open-water ellipse of the new Figma pond (water inside the rock
     ring), as fractions of the pond container box — keeps fish, food
     and ripples off the shore rocks */
  var WATER = { cx: 0.498, cy: 0.48, rx: 0.31, ry: 0.34 };

  var W = 0, H = 0, fishH = 60, fishW = 38, idleRipT = 3;
  var fish = [], food = [], fed = false;
  var raf = null, last = 0;
  var rippleCtx = rippleLayer.getContext ? rippleLayer.getContext('2d') : null;
  var disturbanceCtx = disturbanceLayer && disturbanceLayer.getContext ? disturbanceLayer.getContext('2d') : null;
  var rippleDpr = 1, ripples = [], rippleRaf = null, nextRippleId = 1;
  var disturbanceDpr = 1;
  var sprites = { food: null, shadow: null };

  /* ── background keying: every pond3/pond4 asset ships as a flattened
     PNG with a baked near-white background (no real alpha), so it's
     keyed via a border flood-fill the same way earlier batches in this
     pond were handled. Small/isolated art (pellets, the fish shadow) is
     additionally trimmed to its visible bbox so it centers correctly
     wherever it's placed. The ripple art is the exception — its canvas
     is a dark tiled pattern edge-to-edge with no near-white border for
     the flood-fill to key from, which left a visible dark square behind
     the ripple; keyByLuma() below keys those by brightness instead. ── */
  function load(src, cb) { var im = new Image(); im.onload = function () { cb(im); }; im.onerror = function () { cb(null); }; im.src = src; }
  function keyBg(src, cb) {
    load(src, function (im) {
      if (!im) { cb(null); return; }
      var w = im.naturalWidth, h = im.naturalHeight, c = document.createElement('canvas'); c.width = w; c.height = h;
      var x = c.getContext('2d'); x.drawImage(im, 0, 0);
      var id; try { id = x.getImageData(0, 0, w, h); } catch (e) { cb(c); return; }
      var d = id.data, vis = new Uint8Array(w * h), st = [];
      function isBg(p) { var i = p * 4, a = d[i + 3]; if (a < 8) return true; var r = d[i], g = d[i + 1], b = d[i + 2]; return (Math.max(r, g, b) - Math.min(r, g, b)) < 26 && Math.max(r, g, b) > 192; }
      function push(p) { if (p >= 0 && p < w * h && !vis[p]) { vis[p] = 1; st.push(p); } }
      for (var xi = 0; xi < w; xi++) { push(xi); push((h - 1) * w + xi); }
      for (var yi = 0; yi < h; yi++) { push(yi * w); push(yi * w + w - 1); }
      while (st.length) { var p = st.pop(); if (!isBg(p)) continue; d[p * 4 + 3] = 0; var px = p % w, py = (p - px) / w; if (px > 0) push(p - 1); if (px < w - 1) push(p + 1); if (py > 0) push(p - w); if (py < h - 1) push(p + w); }
      x.putImageData(id, 0, 0); cb(c);
    });
  }
  function trim(c) {
    var w = c.width, h = c.height, x = c.getContext('2d'), minX = w, minY = h, maxX = 0, maxY = 0, hit = false, d;
    try { d = x.getImageData(0, 0, w, h).data; } catch (e) { return c; }
    for (var py = 0; py < h; py += 2) for (var px = 0; px < w; px += 2) { if (d[(py * w + px) * 4 + 3] > 24) { hit = true; if (px < minX) minX = px; if (px > maxX) maxX = px; if (py < minY) minY = py; if (py > maxY) maxY = py; } }
    if (!hit) return c;
    var sw = maxX - minX, sh = maxY - minY, out = document.createElement('canvas');
    out.width = sw; out.height = sh;
    out.getContext('2d').drawImage(c, minX, minY, sw, sh, 0, 0, sw, sh);
    return out;
  }
  /* key a full-bleed overlay <img> in place (hidden until ready, so
     there's no flash of its baked background) */
  function keyImgInPlace(el, src) {
    if (!el) return;
    el.style.visibility = 'hidden';
    keyBg(src, function (c) { if (c) el.src = c.toDataURL(); el.style.visibility = ''; });
  }
  /* key + trim a small isolated asset, caching the result for reuse */
  function keySprite(src, cb) { keyBg(src, function (c) { cb(c ? trim(c).toDataURL() : null); }); }

  /* ── geometry ── */
  function resize() {
    var r = pond.getBoundingClientRect();
    W = r.width; H = r.height;
    resizeRippleCanvas();
    resizeDisturbanceCanvas();
    fishH = Math.min(W, H) * 0.14;
    fishW = fishH * FISH_AR;
    fish.forEach(function (f) { f.el.style.width = fishW + 'px'; f.el.style.height = fishH + 'px'; });
  }
  function resizeRippleCanvas() {
    if (!rippleCtx) return;
    rippleDpr = window.devicePixelRatio || 1;
    rippleLayer.width = Math.max(1, Math.round(W * rippleDpr));
    rippleLayer.height = Math.max(1, Math.round(H * rippleDpr));
    rippleLayer.style.width = W + 'px';
    rippleLayer.style.height = H + 'px';
    rippleCtx.setTransform(rippleDpr, 0, 0, rippleDpr, 0, 0);
  }
  function resizeDisturbanceCanvas() {
    if (!disturbanceCtx) return;
    disturbanceDpr = Math.min(window.devicePixelRatio || 1, 2);
    disturbanceLayer.width = Math.max(1, Math.round(W * disturbanceDpr));
    disturbanceLayer.height = Math.max(1, Math.round(H * disturbanceDpr));
    disturbanceLayer.style.width = W + 'px';
    disturbanceLayer.style.height = H + 'px';
    disturbanceCtx.setTransform(disturbanceDpr, 0, 0, disturbanceDpr, 0, 0);
  }
  function ell() { return { cx: WATER.cx * W, cy: WATER.cy * H, rx: WATER.rx * W, ry: WATER.ry * H }; }
  function randInWater() { var e = ell(), a = Math.random() * 6.28, rr = Math.sqrt(Math.random()) * 0.85; return { x: e.cx + Math.cos(a) * e.rx * rr, y: e.cy + Math.sin(a) * e.ry * rr }; }
  function clampWater(o, pad) { var e = ell(), nx = (o.x - e.cx) / (e.rx - pad), ny = (o.y - e.cy) / (e.ry - pad), d = Math.hypot(nx, ny); if (d > 1) { o.x = e.cx + nx / d * (e.rx - pad); o.y = e.cy + ny / d * (e.ry - pad); } }
  function newOrbit() { var c = randInWater(); return { cx: c.x, cy: c.y, r: 0.16 + Math.random() * 0.12, ang: Math.random() * 6.28, dir: Math.random() > 0.5 ? 1 : -1, life: 9 + Math.random() * 7 }; }
  function angleDiff(a, b) { var d = ((b - a + Math.PI) % 6.283) - Math.PI; if (d < -Math.PI) d += 6.283; return d; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  var DEPTH_LAYERS = [
    { name: 'bottom', rank: 0, scale: 0.82, tint: 1, shadow: 1 },
    { name: 'middle', rank: 1, scale: 0.88, tint: 0.68, shadow: 0.58 },
    { name: 'top', rank: 2, scale: 0.94, tint: 0.35, shadow: 0.18 }
  ];
  function depthLayer(index) { return DEPTH_LAYERS[clamp(index, 0, DEPTH_LAYERS.length - 1)]; }
  function setDepthLayer(f, index, hold) {
    var next = clamp(index, 0, DEPTH_LAYERS.length - 1);
    if (f.depthLayer === next) return;
    f.depthLayer = next;
    f.depthHold = hold || 8;
  }
  function forwardWaterTarget(f, e, pad) {
    var span = Math.PI * 0.78;
    var baseDist = Math.min(e.rx, e.ry) * (0.22 + Math.random() * 0.18);
    for (var i = 0; i < 8; i++) {
      var a = f.angle + (Math.random() - 0.5) * span;
      var p = { x: f.x + Math.cos(a) * baseDist, y: f.y + Math.sin(a) * baseDist * 0.82 };
      clampWater(p, pad);
      if (Math.abs(angleDiff(f.angle, Math.atan2(p.y - f.y, p.x - f.x))) < Math.PI * 0.72) return p;
    }
    return { x: f.x + Math.cos(f.angle) * baseDist, y: f.y + Math.sin(f.angle) * baseDist };
  }
  /* rest schedule: fish drift to a stop (or slow crawl) every so often
     instead of perpetually circling */
  function scheduleRest() { return 10 + Math.random() * 14; }

  /* ── build the segmented DOM fish (+ its own shadow decal) ── */
  function buildRig(className) {
    var rig = document.createElement('div'); rig.className = className;
    RIG_PARTS.forEach(function (part) {
      var im = new Image(); im.src = RIG + 'koi-' + part + '.png'; im.alt = ''; im.className = 'koi-' + part;
      rig.appendChild(im);
    });
    return rig;
  }
  function buildFish() {
    resize();
    stage.innerHTML = ''; fish = [];
    var count = 2;
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div'); el.className = 'koi-fish';
      var shadowDecal = new Image(); shadowDecal.alt = ''; shadowDecal.className = 'koi-shadow-decal';
      if (sprites.shadow) shadowDecal.src = sprites.shadow;
      el.appendChild(shadowDecal);
      el.appendChild(buildRig('koi-shadow-rig'));
      el.appendChild(buildRig('koi-visible-rig'));
      stage.appendChild(el);
      var p = randInWater();
      var initialDepth = Math.max(1, 2 - i);
      fish.push({
        id: i, el: el, shadowDecal: shadowDecal, x: p.x, y: p.y,
        angle: Math.random() * 6.28, visualAngle: 0, speed: 0,
        phase: Math.random() * 6.28,
        sizeMul: i === 0 ? 1 : 0.88,
        dart: 0, dartT: 4 + Math.random() * 5,
        orbit: newOrbit(),
        restT: scheduleRest(), restRemaining: 0, restDrift: 0,
        depthLayer: initialDepth, depthVisual: initialDepth, depthHold: 4 + i * 2, surfaceHold: 0,
        idleTurnArc: 0, idleTurnDir: 0,
        turnAmount: 0, bend: 0, bendVel: 0
      });
      fish[i].visualAngle = fish[i].angle;
    }
    resize();
  }

  /* ── canvas ripples: broken pixel-art ellipse rings, low opacity,
     with a few food-colored center pixels. Reusable via spawnRipple(x,y).
     (Koi-swim water refraction is separate — see PondRipples.drop in
     the update loop below, driven by pondripples.js/jquery.ripples.) ── */
  function spawnRipple(x, y, isFoodDrop) {
    if (!rippleCtx) return;
    ripples.push({
      id: nextRippleId++,
      x: x,
      y: y,
      startedAt: performance.now(),
      duration: reduce ? 900 : (isFoodDrop ? 1650 : 1350),
      seed: Math.random() * 1000,
      foodDrop: !!isFoodDrop
    });
    wakeRipples();
  }
  /* small, faint SURFACE ring trailing a swimming koi — this is what
     makes the top of the water read as disturbed (the WebGL layer only
     refracts the pond floor beneath) */
  function spawnKoiWake(x, y) {
    if (!rippleCtx) return;
    ripples.push({
      id: nextRippleId++,
      x: x,
      y: y,
      startedAt: performance.now(),
      duration: 1050,
      seed: Math.random() * 1000,
      foodDrop: false,
      wake: true
    });
    wakeRipples();
  }
  function wakeRipples() {
    if (rippleRaf === null && rippleCtx) rippleRaf = requestAnimationFrame(drawRipples);
  }
  function drawRipples(now) {
    if (!rippleCtx) return;
    rippleCtx.clearRect(0, 0, W, H);
    rippleCtx.save();
    clipWater(rippleCtx);
    for (var i = ripples.length - 1; i >= 0; i--) {
      if (now - ripples[i].startedAt >= ripples[i].duration) ripples.splice(i, 1);
    }
    for (var r = 0; r < ripples.length; r++) drawRipple(rippleCtx, ripples[r], now);
    rippleCtx.restore();
    rippleRaf = ripples.length ? requestAnimationFrame(drawRipples) : null;
  }
  function clipWater(ctx) {
    var e = ell();
    ctx.beginPath();
    ctx.ellipse(e.cx, e.cy, e.rx * 0.99, e.ry * 0.98, 0, 0, Math.PI * 2);
    ctx.clip();
  }
  function drawRipple(ctx, ripple, now) {
    var age = now - ripple.startedAt;
    var t = Math.min(age / ripple.duration, 1);
    var travel = 1 - Math.pow(1 - t, 2.6);
    var fade = Math.pow(1 - t, 1.55);
    if (ripple.wake) fade *= 0.6;            // koi wakes stay a whisper
    var maxRadius = fishH * (ripple.foodDrop ? 1.08 : ripple.wake ? 0.42 : 0.68);
    var headRadius = (ripple.wake ? 4 : 7) + travel * maxRadius;
    var ellipseYScale = 0.46;

    if (ripple.foodDrop) drawFoodPixels(ctx, ripple.x, ripple.y, fade);
    var ringCount = ripple.foodDrop ? 3 : 2;
    for (var i = 0; i < ringCount; i++) {
      var spacing = fishH * 0.18;
      var radius = headRadius - i * spacing;
      if (radius < 5) continue;
      var ringAge = Math.max(0, Math.min(1, radius / Math.max(maxRadius, 1)));
      var innerFade = Math.pow(Math.max(0, 1 - i * 0.16), 1.2);
      var opacity = fade * innerFade * (ripple.foodDrop ? 0.34 : 0.24);
      if (ringAge > 0.72) opacity *= Math.max(0, (1 - ringAge) / 0.28);
      if (i === 0) opacity *= Math.max(0, (1 - t) / 0.62);
      drawSoftEllipseRing(ctx, ripple.x, ripple.y, radius, radius * ellipseYScale, opacity * 0.42, i);
      drawBrokenEllipseRing(ctx, ripple.x, ripple.y, radius, radius * ellipseYScale, opacity, ripple.seed + i * 17, i);
    }
    drawTinyHighlights(ctx, ripple.x, ripple.y, headRadius, fade, ripple.seed);
  }
  function drawSoftEllipseRing(ctx, x, y, rx, ry, opacity, ringIndex) {
    ctx.save();
    ctx.lineWidth = ringIndex === 0 ? 3 : 2.4;
    ctx.strokeStyle = 'rgba(51, 177, 190,' + opacity.toFixed(3) + ')';
    ctx.shadowColor = 'rgba(52, 180, 190,' + (opacity * 0.65).toFixed(3) + ')';
    ctx.shadowBlur = 7;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  function drawBrokenEllipseRing(ctx, x, y, rx, ry, opacity, seed, ringIndex) {
    var segmentCount = 24;
    var snap = 2;
    ctx.save();
    ctx.lineWidth = ringIndex === 0 ? 1.25 : 1;
    ctx.strokeStyle = 'rgba(127, 231, 218,' + opacity.toFixed(3) + ')';
    ctx.shadowColor = 'rgba(85, 211, 211,' + (opacity * 0.65).toFixed(3) + ')';
    ctx.shadowBlur = 5;
    for (var i = 0; i < segmentCount; i++) {
      var n = pseudoRandom(seed + i * 91);
      if (n < 0.34) continue;
      var start = (i / segmentCount) * Math.PI * 2;
      var length = 0.16 + pseudoRandom(seed + i * 19) * 0.28;
      var end = start + length;
      ctx.beginPath();
      for (var s = 0; s <= 7; s++) {
        var a = start + (end - start) * (s / 7);
        var px = Math.round((x + Math.cos(a) * rx) / snap) * snap;
        var py = Math.round((y + Math.sin(a) * ry) / snap) * snap;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawFoodPixels(ctx, x, y, fade) {
    var opacity = Math.min(0.65, fade * 0.9);
    var pellets = [[0, 0], [5, -2], [-4, 3], [2, 5], [-6, -3]];
    ctx.save();
    ctx.fillStyle = 'rgba(198, 126, 42,' + opacity.toFixed(3) + ')';
    for (var i = 0; i < pellets.length; i++) {
      ctx.fillRect(Math.round(x + pellets[i][0]), Math.round(y + pellets[i][1]), 3, 3);
    }
    ctx.restore();
  }
  function drawTinyHighlights(ctx, x, y, radius, fade, seed) {
    ctx.save();
    for (var i = 0; i < 5; i++) {
      var a = pseudoRandom(seed + i * 33) * Math.PI * 2;
      var rr = radius * (0.65 + pseudoRandom(seed + i * 51) * 0.35);
      var px = Math.round(x + Math.cos(a) * rr);
      var py = Math.round(y + Math.sin(a) * rr * 0.38);
      var alpha = fade * pseudoRandom(seed + i * 77) * 0.42;
      ctx.fillStyle = 'rgba(200, 244, 234,' + alpha.toFixed(3) + ')';
      ctx.fillRect(px, py, 2, 2);
    }
    ctx.restore();
  }
  function drawKoiDisturbance(now) {
    if (!disturbanceCtx) return;
    disturbanceCtx.clearRect(0, 0, W, H);
    if (reduce) return;
    disturbanceCtx.save();
    clipWater(disturbanceCtx);
    for (var i = 0; i < fish.length; i++) {
      var f = fish[i];
      var speedN = clamp(f.speed / 1.25, 0, 1);
      var depthT = clamp(0.35 + ((2 - f.depthVisual) / 2) * 0.65, 0.35, 1);
      var alphaBase = speedN * (0.42 - depthT * 0.18);   /* subtle — surface wake rings carry visibility */
      if (alphaBase < 0.035) continue;
      var a = f.visualAngle;
      var sideX = -Math.sin(a), sideY = Math.cos(a);
      var backX = -Math.cos(a), backY = -Math.sin(a);
      var seed = f.id * 71 + Math.floor(now / 180);
      disturbanceCtx.save();
      disturbanceCtx.lineCap = 'round';
      for (var p = 0; p < 6; p++) {
        var side = p % 2 ? -1 : 1;
        var along = fishH * (-0.22 + pseudoRandom(seed + p * 17) * 0.5);
        var out = fishW * (0.34 + pseudoRandom(seed + p * 29) * 0.34);
        var jitter = (pseudoRandom(seed + p * 41) - 0.5) * fishH * 0.08;
        var x = f.x + backX * along + sideX * out * side + backX * jitter;
        var y = f.y + backY * along + sideY * out * side + backY * jitter;
        var len = 2 + pseudoRandom(seed + p * 53) * 6;
        var opacity = alphaBase * (0.045 + pseudoRandom(seed + p * 67) * 0.045);
        disturbanceCtx.strokeStyle = 'rgba(176, 236, 224,' + opacity.toFixed(3) + ')';
        disturbanceCtx.lineWidth = p % 3 === 0 ? 1.2 : 1;
        disturbanceCtx.beginPath();
        disturbanceCtx.moveTo(Math.round(x), Math.round(y));
        disturbanceCtx.lineTo(Math.round(x + backX * len + sideX * side * 1.5), Math.round(y + backY * len + sideY * side * 1.5));
        disturbanceCtx.stroke();
      }
      if (alphaBase > 0.16) {
        disturbanceCtx.fillStyle = 'rgba(205, 247, 232,' + (alphaBase * 0.07).toFixed(3) + ')';
        for (var q = 0; q < 3; q++) {
          var px = f.x + backX * fishH * (0.08 + q * 0.11) + sideX * (pseudoRandom(seed + q * 83) - 0.5) * fishW;
          var py = f.y + backY * fishH * (0.08 + q * 0.11) + sideY * (pseudoRandom(seed + q * 97) - 0.5) * fishW;
          disturbanceCtx.fillRect(Math.round(px), Math.round(py), 2, 2);
        }
      }
      disturbanceCtx.restore();
    }
    disturbanceCtx.restore();
  }
  function pseudoRandom(n) {
    var x = Math.sin(n) * 10000;
    return x - Math.floor(x);
  }

  /* ── feeding: pellet (DOM) + ripple at the click point ── */
  function addFood(x, y) {
    if (!sprites.food) return;               // ignore clicks until assets are ready
    var p = { x: x, y: y }; clampWater(p, fishH * 0.3);
    var img = new Image();
    img.className = 'food-pellet';
    img.src = sprites.food;
    img.alt = '';
    img.style.width = Math.max(8, Math.min(14, fishH * 0.18)) + 'px';
    img.style.left = p.x + 'px'; img.style.top = p.y + 'px';
    foodLayer.appendChild(img);
    food.push({ x: p.x, y: p.y, el: img, life: 8 });
    // Food uses the same capped ripple profile as koi wakes, with a
    // small asymmetric scatter handled by pondripples.js.
    if (window.PondRipples && window.PondRipples.dropFood) window.PondRipples.dropFood(p.x, p.y, fishH);
    else spawnRipple(p.x, p.y, false);
    if (!fed) { fed = true; pond.classList.add('fed'); }
    wake();
  }
  function removeFood(item, eaten) {
    var i = food.indexOf(item); if (i >= 0) food.splice(i, 1);
    item.el.classList.add('eaten');
    setTimeout(function () { item.el.remove(); }, 450);
    if (eaten) spawnRipple(item.x, item.y, false);
  }

  pond.addEventListener('click', function (e) {
    var r = pond.getBoundingClientRect();
    addFood(e.clientX - r.left, e.clientY - r.top);
  });
  pond.setAttribute('tabindex', '0');
  pond.setAttribute('role', 'img');
  pond.setAttribute('aria-label', 'Interactive koi pond. Click to drop food and the koi swim toward it.');
  pond.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); var p = randInWater(); addFood(p.x, p.y); } });

  /* nearest fish always responds to a pellet; others join if close */
  function pickTarget(f, k) {
    var best = null, bd = Infinity;
    for (var i = 0; i < food.length; i++) {
      var fd = food[i];
      var d = Math.hypot(fd.x - f.x, fd.y - f.y);
      var nearest = true;
      for (var j = 0; j < fish.length; j++) {
        if (j === k) continue;
        if (Math.hypot(fd.x - fish[j].x, fd.y - fish[j].y) < d) { nearest = false; break; }
      }
      if (!nearest && d > W * 0.4) continue;
      if (d < bd) { bd = d; best = fd; }
    }
    return best;
  }

  function updateDepthLayers(dtf) {
    var dt = dtf / 60;
    for (var i = 0; i < fish.length; i++) {
      var f = fish[i];
      if (f.depthHold > 0) f.depthHold = Math.max(0, f.depthHold - dt);
      if (food.length || f.surfaceHold > 0) setDepthLayer(f, 2, 2.2);
      else if (f.depthHold <= 0 && Math.random() < 0.0016 * dtf) {
        var next = clamp(f.depthLayer + (Math.random() < 0.5 ? -1 : 1), 0, 2);
        setDepthLayer(f, next, 8 + Math.random() * 8);
      }
      f.depthVisual += (f.depthLayer - f.depthVisual) * 0.035 * dtf;
    }
  }

  /* ── per-frame simulation ──
     Rate-clamped steering: heading changes at most maxRate per frame,
     position always advances — arcs, never spins-in-place. Turned
     down from earlier tuning (which read as too "pivoted") and paired
     with the visual-angle smoothing in placeFish(). */
  var MAXTURN_IDLE = 0.040;    // rad per 60fps-frame while cruising (~2.3°)
  var MAXTURN_FEED = 0.072;    // rad per 60fps-frame while pursuing food (~4.1°)
  var MAXTURN_EDGE = 0.10;     // minimum turn rate near the pond edge
  var DART_TURN_MUL = 0.6;     // less agile mid-dart (forward burst)
  var IDLE_MAX_TARGET_DIFF = Math.PI * 0.76; // no idle U-turns / full loops; food may override
  var IDLE_MAX_TURN_ARC = Math.PI * 1.32;    // about 238° total before idle path is re-routed
  var VISUAL_TURN_SMOOTH = 0.10;  // how quickly the RENDERED heading catches up to the steering heading
  /* the bend is a light spring: eases toward the raw turn, slightly
     overshoots, settles — a flexible body catching up to the turn */
  var BEND_STIFFNESS = 0.05;
  var BEND_DAMPING = 0.88;

  function update(dtf) {
    var dt = dtf / 60;
    for (var i = food.length - 1; i >= 0; i--) {
      food[i].life -= dt;
      if (food[i].life <= 0) removeFood(food[i], false);
    }
    if (!reduce) { idleRipT -= dt; if (idleRipT <= 0) { idleRipT = 3.5 + Math.random() * 3.5; var ip = randInWater(); spawnRipple(ip.x, ip.y, false); } }

    var idleSpeed = reduce ? 0.16 : 0.5, feedSpeed = reduce ? 0.5 : 1.1;
    var idleRate = reduce ? MAXTURN_IDLE * 0.6 : MAXTURN_IDLE;
    var feedRate = reduce ? MAXTURN_FEED * 0.6 : MAXTURN_FEED;
    var e = ell();

    for (var k = 0; k < fish.length; k++) {
      var f = fish[k], lenF = fishH * f.sizeMul, target = pickTarget(f, k), hasFoodTarget = !!target, tx, ty, maxRate, targetSpeed;
      if (f.surfaceHold > 0) f.surfaceHold = Math.max(0, f.surfaceHold - dt);
      if (target) {
        f.surfaceHold = 1.2;
        f.idleTurnArc = 0;
        f.idleTurnDir = 0;
        f.restRemaining = 0;                 // food interrupts any rest
        tx = target.x; ty = target.y;
        var dist = Math.hypot(tx - f.x, ty - f.y);
        if (dist < lenF * 0.26) { removeFood(target, true); continue; }
        maxRate = feedRate; targetSpeed = feedSpeed * Math.min(1, dist / (fishH * 1.1));   // slow on arrival
      } else if (f.restRemaining > 0 && !reduce) {
        // resting: hold heading, coast down to a stop (or a slow crawl)
        f.restRemaining -= dt;
        tx = f.x + Math.cos(f.angle) * 10; ty = f.y + Math.sin(f.angle) * 10;
        maxRate = idleRate; targetSpeed = f.restDrift;
        if (f.restRemaining <= 0) f.orbit = newOrbit();
      } else {
        if (!reduce) { f.restT -= dt; if (f.restT <= 0) { f.restRemaining = 2.5 + Math.random() * 4; f.restDrift = Math.random() < 0.5 ? 0 : 0.1 + Math.random() * 0.12; f.restT = scheduleRest(); } }
        f.orbit.life -= dt; if (f.orbit.life <= 0) f.orbit = newOrbit();
        f.orbit.ang += f.orbit.dir * 0.012 * dtf;
        var rr = Math.min(e.rx, e.ry) * f.orbit.r, op = { x: f.orbit.cx + Math.cos(f.orbit.ang) * rr, y: f.orbit.cy + Math.sin(f.orbit.ang) * rr * 0.72 };
        clampWater(op, lenF * 0.34); tx = op.x; ty = op.y; maxRate = idleRate; targetSpeed = idleSpeed;
      }

      f.dartT -= dt; if (f.dartT <= 0 && !reduce && f.restRemaining <= 0) { f.dart = 0.45; f.dartT = 5 + Math.random() * 6; }
      if (f.dart > 0) { f.dart -= dt; targetSpeed *= 2.1; maxRate *= DART_TURN_MUL; }

      var desired = Math.atan2(ty - f.y, tx - f.x);
      var edge = Math.hypot((f.x - e.cx) / e.rx, (f.y - e.cy) / e.ry);
      if (edge > 0.84) { desired = Math.atan2(e.cy - f.y, e.cx - f.x); maxRate = Math.max(maxRate, MAXTURN_EDGE); }

      // rate-clamped turn: cap the per-frame heading change, don't lerp
      var diff = angleDiff(f.angle, desired);
      if (!hasFoodTarget && edge <= 0.94 && Math.abs(diff) > IDLE_MAX_TARGET_DIFF) {
        var ahead = forwardWaterTarget(f, e, lenF * 0.34);
        tx = ahead.x; ty = ahead.y;
        desired = Math.atan2(ty - f.y, tx - f.x);
        diff = angleDiff(f.angle, desired);
        f.orbit = newOrbit();
        f.idleTurnArc = 0;
        f.idleTurnDir = 0;
      }
      var cap = maxRate * dtf;
      var step = clamp(diff, -cap, cap);
      if (!hasFoodTarget) {
        var turnDir = Math.abs(step) > 0.001 ? (step > 0 ? 1 : -1) : 0;
        if (turnDir === 0 || turnDir !== f.idleTurnDir) {
          f.idleTurnArc = 0;
          f.idleTurnDir = turnDir;
        }
        if (turnDir && f.idleTurnArc + Math.abs(step) > IDLE_MAX_TURN_ARC) {
          var smallTurn = forwardWaterTarget(f, e, lenF * 0.34);
          desired = Math.atan2(smallTurn.y - f.y, smallTurn.x - f.x);
          diff = angleDiff(f.angle, desired);
          step = clamp(diff, -cap, cap);
          f.orbit = newOrbit();
          f.idleTurnArc = 0;
          f.idleTurnDir = step > 0 ? 1 : step < 0 ? -1 : 0;
        }
        f.idleTurnArc += Math.abs(step);
      }
      f.angle += step;
      f.turnAmount = cap > 1e-6 ? step / cap : 0;   // normalized -1..1 → drives the body bend

      f.speed += (targetSpeed - f.speed) * 0.08 * dtf;
      f.x += Math.cos(f.angle) * f.speed * dtf;      // always advances — never a spin-in-place
      f.y += Math.sin(f.angle) * f.speed * dtf;

      // light separation only prevents exact stacking; depth sorting handles normal overlaps
      for (var j = 0; j < fish.length; j++) { if (j === k) continue; var o = fish[j]; var dx = f.x - o.x, dy = f.y - o.y, dd = Math.hypot(dx, dy), minD = (fishW * f.sizeMul + fishW * o.sizeMul) * 0.32; if (dd > 0.001 && dd < minD) { var pp = (minD - dd) * 0.22 * dtf; f.x += dx / dd * pp; f.y += dy / dd * pp; } }
      // pad = 0.34 body lengths: the rig's tail trails ~0.7 lengths behind
      // the pivot, so a small pad let bodies sweep over the rim rocks
      // (worst at the lantern corner, where the rocks bite into the ellipse)
      clampWater(f, lenF * 0.34);
      f.phase += (0.1 + f.speed * 0.14) * dtf;

      // Koi wakes use a capped shared ripple profile so fast fish do not
      // throw oversized waves across the pond.
      if (window.PondRipples) {
        var mdx = f.x - (f.lastDropX === undefined ? f.x : f.lastDropX);
        var mdy = f.y - (f.lastDropY === undefined ? f.y : f.lastDropY);
        var minTravel = window.PondRippleStyle ? window.PondRippleStyle.koiMinTravel : 7;
        if (f.lastDropX === undefined || mdx * mdx + mdy * mdy > minTravel * minTravel) {
          var sn2 = Math.min(1, f.speed / 1.2);
          if (window.PondRipples.dropKoi) window.PondRipples.dropKoi(f.x, f.y, fishH, sn2);
          else window.PondRipples.drop(f.x, f.y, fishH * 0.2, 0.005 + sn2 * 0.007);
          f.lastDropX = f.x; f.lastDropY = f.y;
          // surface wake: a faint expanding ring behind the fish every
          // ~1.7 body lengths of travel (skipped when barely drifting)
          if (!reduce && f.speed > 0.28) {
            f.wakeAcc = (f.wakeAcc || 0) + Math.sqrt(mdx * mdx + mdy * mdy);
            if (f.wakeAcc > fishH * 1.7) {
              f.wakeAcc = 0;
              spawnKoiWake(f.x - Math.cos(f.angle) * fishH * 0.35,
                           f.y - Math.sin(f.angle) * fishH * 0.35);
            }
          }
        }
      }
    }
    updateDepthLayers(dtf);
  }

  /* ── render: parent transform + the five joint angles ──
     The swim wave travels down the spine via phase offsets; the turn
     bias (spring-smoothed) leans every joint into the turn, more the
     further down the chain, while the head stays calmest. */
  function placeFish(f, dtf) {
    // visual heading eases toward the steering heading — decouples the
    // RENDERED rotation from the rate-clamped physics angle so turns
    // read as smooth swimming, not a mechanical pivot
    f.visualAngle += angleDiff(f.visualAngle, f.angle) * VISUAL_TURN_SMOOTH * dtf;

    var rot = f.visualAngle * 180 / Math.PI - 90;    // source fish points down
    var depthT = clamp(0.35 + ((2 - f.depthVisual) / 2) * 0.65, 0.35, 1);
    var layerScale = 0.82 + f.depthVisual * 0.06;
    var tx = f.x - PIV_X * fishW, ty = f.y - PIV_Y * fishH;
    f.el.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) rotate(' + rot.toFixed(2) + 'deg) scale(' + (f.sizeMul * layerScale).toFixed(3) + ')';
    var depth = clamp((f.y / Math.max(H, 1) - 0.2) / 0.62, 0, 1);
    f.el.style.setProperty('--koi-depth-opacity', (0.83 - depthT * 0.12 + depth * 0.025).toFixed(3));
    f.el.style.setProperty('--koi-depth-shadow', (0.21 + depthT * 0.19 + depth * 0.045).toFixed(3));
    f.el.style.setProperty('--koi-depth-tint', depthT.toFixed(3));
    // shadow falls down-right in WORLD space (one constant light
    // direction) — counter-rotate the offset into the fish's rotated
    // local frame so it doesn't spin with the body
    var th = rot * Math.PI / 180;
    var sdx = fishH * 0.11, sdy = fishH * 0.16;      // world-space offset, scales with fish
    var inv = 1 / f.sizeMul;
    var lx = (Math.cos(th) * sdx + Math.sin(th) * sdy) * inv;
    var ly = (-Math.sin(th) * sdx + Math.cos(th) * sdy) * inv;
    f.el.style.setProperty('--shadow-tx', lx.toFixed(2) + 'px');
    f.el.style.setProperty('--shadow-ty', ly.toFixed(2) + 'px');
    if (reduce) return;

    var sn = Math.min(1, f.speed / 1.6);             // speed 0..1

    // spring the bend toward the raw turn (slight overshoot + settle)
    var rawTurn = clamp(f.turnAmount, -1, 1);
    f.bendVel += (rawTurn - f.bend) * BEND_STIFFNESS * dtf;
    f.bendVel *= Math.pow(BEND_DAMPING, dtf);
    f.bend += f.bendVel * dtf;
    var bend = clamp(f.bend, -1.25, 1.25);

    // swim wave: amplitude grows with speed, phase travels down the body
    var s = 1 + sn * 0.9;
    var ph = f.phase;
    var head = Math.sin(ph) * 1.6 * s + bend * 2;
    var mid = Math.sin(ph - 0.7) * 3.5 * s + bend * 6.5;
    var tailBase = Math.sin(ph - 1.4) * 7 * s + bend * 12;
    var tailFin = Math.sin(ph - 2.1) * 11 * s + bend * 18;
    var fin = Math.sin(ph * 1.8) * (2.5 + sn * 3.5) + bend * 4;

    f.el.style.setProperty('--head-angle', head.toFixed(2) + 'deg');
    f.el.style.setProperty('--mid-angle', mid.toFixed(2) + 'deg');
    f.el.style.setProperty('--tail-base-angle', tailBase.toFixed(2) + 'deg');
    f.el.style.setProperty('--tail-fin-angle', tailFin.toFixed(2) + 'deg');
    f.el.style.setProperty('--fin-angle', fin.toFixed(2) + 'deg');
  }
  function render(dtf) {
    // stable 3-layer sort first; y only breaks ties within a layer.
    fish.slice().sort(function (a, b) {
      var la = depthLayer(a.depthLayer).rank;
      var lb = depthLayer(b.depthLayer).rank;
      return la === lb ? a.y - b.y : la - lb;
    }).forEach(function (f, idx) { f.el.style.zIndex = idx; });
    for (var k = 0; k < fish.length; k++) placeFish(fish[k], dtf || 1);
    drawKoiDisturbance(performance.now());
  }

  function frame(t) { var dtf = last ? Math.min(3, (t - last) / 16.67) : 1; last = t; update(dtf); render(dtf); var active = !reduce || food.length; raf = active ? requestAnimationFrame(frame) : (last = 0, null); }
  function wake() { if (raf === null) { last = 0; raf = requestAnimationFrame(frame); } }

  /* ── boot ──
     If the page loads while hidden or pre-rendered (Chrome prerender,
     background tabs), the pond can measure 0×0 — which would seed every
     fish at the origin with zero size. Wait for real dimensions before
     building. ResizeObserver (not setTimeout polling) because hidden
     pages throttle timers, but RO fires as soon as layout sizes the box. */
  (function boot() {
    var built = false;
    function tryBuild() {
      if (built) return;
      resize();
      if (!W || !H) return;
      built = true;
      if (ro) ro.disconnect();
      buildFish();
      render(1);
      if (!reduce) wake();
    }
    var ro = window.ResizeObserver ? new ResizeObserver(tryBuild) : null;
    if (ro) ro.observe(pond);
    tryBuild();                                   // normal visible load: build now
    if (!built && !ro) setTimeout(tryBuild, 400); // ancient-browser fallback
  })();

  var bgEl = pond.querySelector('.koi-bg');
  if (bgEl) bgEl.src = 'assets/koi-pond/pond/pond-base.png';

  keySprite(FOOD, function (url) { sprites.food = url; });
  keySprite(POND + 'fish-shadow.png', function (url) {
    sprites.shadow = url;
    if (url) fish.forEach(function (f) { f.shadowDecal.src = url; });
  });

  var rt = null;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { resize(); render(1); wakeRipples(); }, 150); }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
      if (rippleRaf !== null) { cancelAnimationFrame(rippleRaf); rippleRaf = null; }
    } else {
      wake();
      wakeRipples();
    }
  });
})();
