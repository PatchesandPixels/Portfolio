/* ════════════════════════════════════════════════════════════════
   KOIPOND.JS — calm interactive koi pond
   Layered scene: pond base → fish (shadow rig + visible rig) → water
   tint overlay → caustics → click ripples → food pellets (canvas) → UI.

   Turning is a true segmented rig, not sprite-swapped and not a single
   rigid body: head-body / mid-body / tail-stem / tail-fin / left-fin /
   right-fin are six independent layers, each rotating around its own
   joint. A smoothed bend value (eased ~500ms toward the raw turn
   amount) drives increasing rotation down the chain — mid-body barely
   moves, the tail-stem moves more, the tail-fin moves the most — so
   the read is head leads → body follows → tail trails, never "whole
   image spins" and never "sprite pops to a new pose."

   Steering: rate-clamped (constant max degrees/frame), not proportional
   lerp. A big heading error only turns by the capped amount each frame,
   so a target behind the fish produces a wide swimming arc instead of
   a spin-in-place; motion is never a spin because x/y always advance
   every frame regardless of how much heading is changing.

   Rig facts (448×945 source): the fish points DOWN, head/front-body
   pivot at (224,745). So group rotation = travelDirection − 90°.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var pond = document.querySelector('.koipond');
  if (!pond) return;
  var canvas = pond.querySelector('.koi-canvas');
  var stage = pond.querySelector('.koi-stage');
  var rippleLayer = pond.querySelector('.ripple-layer');
  if (!canvas || !canvas.getContext || !stage) return;
  var ctx = canvas.getContext('2d');
  var pondImg = pond.querySelector('.koi-bg');
  var waterOverlayImg = pond.querySelector('.pond-water-overlay');
  var causticsImg = pond.querySelector('.pond-caustics');

  var A = 'assets/hero/koi/', RIG = A + 'rig/parts/';
  /* back-to-front within each rig, per koi-rig-pivots.json's recommended
     layer order: tail-fin sits behind tail-stem, behind mid-body, behind
     head-body; both fins render in front (they stick out past the body) */
  var RIG_PARTS = ['tail-fin', 'tail-stem', 'mid-body', 'head-body', 'left-fin', 'right-fin'];
  var PIV_X = 0.5, PIV_Y = 745 / 945;                          // head/front-body pivot fraction

  /* elliptical water region (fractions of the pond box) — tuned to the
     inner water area of pond-base.png, clear of the stone border/rocks */
  var WATER = { cx: 0.505, cy: 0.53, rx: 0.33, ry: 0.28 };

  var W = 0, H = 0, dpr = 1, fishH = 80, fishW = 38, idleRipT = 3;
  var fish = [], food = [], foodReady = false, fed = false;
  var raf = null, last = 0;
  var sprites = { food: null, splash: null, ripple: null };

  /* ── background keying (all pond/fish art ships with a baked light background) ── */
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
  function bbox(c) {
    var w = c.width, h = c.height, x = c.getContext('2d'), minX = w, minY = h, maxX = 0, maxY = 0, hit = false, d;
    try { d = x.getImageData(0, 0, w, h).data; } catch (e) { return { sx: 0, sy: 0, sw: w, sh: h }; }
    for (var py = 0; py < h; py += 3) for (var px = 0; px < w; px += 3) { if (d[(py * w + px) * 4 + 3] > 24) { hit = true; if (px < minX) minX = px; if (px > maxX) maxX = px; if (py < minY) minY = py; if (py > maxY) maxY = py; } }
    return hit ? { sx: minX, sy: minY, sw: maxX - minX, sh: maxY - minY } : { sx: 0, sy: 0, sw: w, sh: h };
  }
  /* key a full-bleed overlay <img> in place (hidden until ready, so there's
     no flash of its baked background) */
  function keyImgInPlace(el, src) {
    if (!el) return;
    el.style.visibility = 'hidden';
    keyBg(src, function (c) { if (c) el.src = c.toDataURL(); el.style.visibility = ''; });
  }

  /* ── geometry ── */
  function resize() {
    var r = pond.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fishH = Math.min(W, H) * 0.255;
    fishW = fishH * 448 / 945;
    fish.forEach(function (f) { f.el.style.width = fishW + 'px'; f.el.style.height = fishH + 'px'; });
  }
  function ell() { return { cx: WATER.cx * W, cy: WATER.cy * H, rx: WATER.rx * W, ry: WATER.ry * H }; }
  function randInWater() { var e = ell(), a = Math.random() * 6.28, rr = Math.sqrt(Math.random()) * 0.85; return { x: e.cx + Math.cos(a) * e.rx * rr, y: e.cy + Math.sin(a) * e.ry * rr }; }
  function clampWater(o, pad) { var e = ell(), nx = (o.x - e.cx) / (e.rx - pad), ny = (o.y - e.cy) / (e.ry - pad), d = Math.hypot(nx, ny); if (d > 1) { o.x = e.cx + nx / d * (e.rx - pad); o.y = e.cy + ny / d * (e.ry - pad); } }
  function newOrbit() { var c = randInWater(); return { cx: c.x, cy: c.y, r: 0.16 + Math.random() * 0.12, ang: Math.random() * 6.28, dir: Math.random() > 0.5 ? 1 : -1, life: 9 + Math.random() * 7 }; }
  /* shortest signed angular distance from a to b, in (-PI, PI] */
  function angleDiff(a, b) { var d = ((b - a + Math.PI) % 6.283) - Math.PI; if (d < -Math.PI) d += 6.283; return d; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  /* ── build the layered DOM fish: a duplicated "shadow rig" (tinted +
     blurred) sits under the "visible rig" (readable, water-muted). Both
     share the same bend and fin custom properties so the
     shadow always matches the visible fish's motion exactly. ── */
  function buildRig(className) {
    var rig = document.createElement('div'); rig.className = className;
    function partImg(part) {
      var im = new Image(); im.src = RIG + 'koi-' + part + '.png'; im.alt = ''; im.className = 'koi-' + part;
      return im;
    }

    var midJoint = document.createElement('div'); midJoint.className = 'koi-joint koi-joint-mid';
    var tailStemJoint = document.createElement('div'); tailStemJoint.className = 'koi-joint koi-joint-tail-stem';
    var tailFinJoint = document.createElement('div'); tailFinJoint.className = 'koi-joint koi-joint-tail-fin';

    // Joint hierarchy is what creates a real C-turn: tail-fin inherits
    // tail-stem, tail-stem inherits mid-body, and the head stays stable.
    tailFinJoint.appendChild(partImg('tail-fin'));
    tailStemJoint.appendChild(tailFinJoint);
    tailStemJoint.appendChild(partImg('tail-stem'));
    midJoint.appendChild(tailStemJoint);
    midJoint.appendChild(partImg('mid-body'));

    rig.appendChild(midJoint);
    rig.appendChild(partImg('head-body'));
    rig.appendChild(partImg('left-fin'));
    rig.appendChild(partImg('right-fin'));
    return rig;
  }

  function buildWaterMaskRig() {
    var rig = document.createElement('div'); rig.className = 'koi-water-rig';
    function partMask(part) {
      var m = document.createElement('div');
      m.className = 'koi-water-mask-part koi-' + part;
      m.style.setProperty('--part-mask', 'url("' + RIG + 'koi-' + part + '.png")');
      return m;
    }

    var midJoint = document.createElement('div'); midJoint.className = 'koi-joint koi-joint-mid';
    var tailStemJoint = document.createElement('div'); tailStemJoint.className = 'koi-joint koi-joint-tail-stem';
    var tailFinJoint = document.createElement('div'); tailFinJoint.className = 'koi-joint koi-joint-tail-fin';

    tailFinJoint.appendChild(partMask('tail-fin'));
    tailStemJoint.appendChild(tailFinJoint);
    tailStemJoint.appendChild(partMask('tail-stem'));
    midJoint.appendChild(tailStemJoint);
    midJoint.appendChild(partMask('mid-body'));

    rig.appendChild(midJoint);
    rig.appendChild(partMask('head-body'));
    rig.appendChild(partMask('left-fin'));
    rig.appendChild(partMask('right-fin'));
    return rig;
  }

  function buildFish() {
    resize();                                   // ensure W/H known before placing
    stage.innerHTML = ''; fish = [];
    var count = 1;                               // single koi for now
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div'); el.className = 'koi-fish';
      var groundShadow = document.createElement('div'); groundShadow.className = 'koi-ground-shadow';
      var shadowRig = buildRig('koi-shadow-rig');
      var visibleRig = buildRig('koi-visible-rig');
      var waterRig = buildWaterMaskRig();
      el.appendChild(groundShadow); el.appendChild(shadowRig); el.appendChild(visibleRig); el.appendChild(waterRig);
      stage.appendChild(el);
      var p = randInWater();
      fish.push({
        el: el, x: p.x, y: p.y, angle: Math.random() * 6.28, speed: 0, phase: Math.random() * 6.28,
        sizeMul: 1, dart: 0, dartT: 6 + Math.random() * 8, orbit: newOrbit(),
        turnAmount: 0, smoothedBend: 0, bendVel: 0, turnVel: 0
      });
    }
    resize();
  }

  /* ── click ripples (DOM, sit above the water overlay/caustics) ── */
  function spawnRipple(x, y, scale) {
    if (!rippleLayer || !sprites.ripple) return;
    var bb = sprites.ripple.bb, w = fishH * 1.5 * (scale || 1), h = w * bb.sh / bb.sw;
    var img = document.createElement('img');
    img.className = 'ripple';
    img.src = sprites.ripple.url;
    img.alt = '';
    img.style.width = w + 'px'; img.style.height = h + 'px';
    img.style.left = x + 'px'; img.style.top = y + 'px';
    rippleLayer.appendChild(img);
    var done = function () { img.remove(); };
    img.addEventListener('animationend', done, { once: true });
    setTimeout(done, 1600);                      // fallback if animationend doesn't fire
  }

  /* ── feeding: a food pellet (canvas) + a ripple (DOM) at the click point ── */
  function addFood(x, y) {
    var p = { x: x, y: y }; clampWater(p, fishH * 0.2);
    food.push({ x: p.x, y: p.y, life: 6.5, age: 0 });
    spawnRipple(p.x, p.y);
    if (!fed) { fed = true; pond.classList.add('fed'); }
    wake();
  }
  pond.addEventListener('click', function (e) { if (!foodReady) return; var r = canvas.getBoundingClientRect(); addFood(e.clientX - r.left, e.clientY - r.top); });
  pond.setAttribute('tabindex', '0');
  pond.setAttribute('role', 'img');
  pond.setAttribute('aria-label', 'Interactive koi pond. Click to drop food and the koi swim toward it.');
  pond.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); var p = randInWater(); addFood(p.x, p.y); } });

  function nearestFood(f) { var best = null, bd = Infinity; for (var i = 0; i < food.length; i++) { var dx = food[i].x - f.x, dy = food[i].y - f.y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = food[i]; } } return best; }

  /* ── per-frame simulation ──
     Rate-clamped steering: heading can only change by a fixed amount
     per frame, however large the target error is. Position always
     advances every frame regardless — the fish never stops to pivot,
     so a target behind it traces a wide arc back around instead of
     spinning on its axis. */
  var MAXTURN_IDLE = 0.028;    // rad per 60fps-frame while cruising (~1.6°)
  var MAXTURN_FEED = 0.06;     // rad per 60fps-frame while pursuing food (~3.4°)
  var MAXTURN_EDGE = 0.13;     // minimum turn rate near the pond edge, so it can't run the wall
  var DART_TURN_MUL = 0.6;     // steering gets a little less agile mid-dart (forward burst)
  /* bend is a light spring (not a flat lerp): it eases toward rawTurn,
     slightly overshoots, and settles — a flexible tail catching up to a
     turn rather than a value gliding smoothly to a stop. */
  var BEND_STIFFNESS = 0.16;
  var BEND_DAMPING = 0.78;

  function update(dtf) {
    var dt = dtf / 60;
    for (var i = food.length - 1; i >= 0; i--) { food[i].life -= dt; food[i].age += dt; if (food[i].life <= 0) food.splice(i, 1); }
    if (!reduce) { idleRipT -= dt; if (idleRipT <= 0) { idleRipT = 3.2 + Math.random() * 3.5; var ip = randInWater(); spawnRipple(ip.x, ip.y, 0.55); } }

    var idleSpeed = reduce ? 0.18 : 0.46, feedSpeed = reduce ? 0.55 : 0.92;   // tail-driven, gliding approach
    var idleRate = reduce ? MAXTURN_IDLE * 0.6 : MAXTURN_IDLE;
    var feedRate = reduce ? MAXTURN_FEED * 0.6 : MAXTURN_FEED;
    var e = ell();

    for (var k = 0; k < fish.length; k++) {
      var f = fish[k], lenF = fishH * f.sizeMul, target = nearestFood(f), tx, ty, maxRate, targetSpeed;
      if (target) {
        tx = target.x; ty = target.y;
        var dist = Math.hypot(tx - f.x, ty - f.y);
        if (dist < lenF * 0.22) { var fi = food.indexOf(target); if (fi >= 0) food.splice(fi, 1); continue; }
        maxRate = feedRate; targetSpeed = feedSpeed * Math.min(1, dist / (fishH * 1.1));   // slow on arrival
      } else {
        f.orbit.life -= dt; if (f.orbit.life <= 0) f.orbit = newOrbit();
        f.orbit.ang += f.orbit.dir * 0.012 * dtf;
        var rr = Math.min(e.rx, e.ry) * f.orbit.r, op = { x: f.orbit.cx + Math.cos(f.orbit.ang) * rr, y: f.orbit.cy + Math.sin(f.orbit.ang) * rr * 0.72 };
        clampWater(op, lenF * 0.12); tx = op.x; ty = op.y; maxRate = idleRate; targetSpeed = idleSpeed;
      }

      f.dartT -= dt; if (f.dartT <= 0 && !reduce) { f.dart = 0.28; f.dartT = 7 + Math.random() * 8; }
      if (f.dart > 0) { f.dart -= dt; targetSpeed *= 1.65; maxRate *= DART_TURN_MUL; }

      var desired = Math.atan2(ty - f.y, tx - f.x);
      var edge = Math.hypot((f.x - e.cx) / e.rx, (f.y - e.cy) / e.ry);
      if (edge > 0.84) { desired = Math.atan2(e.cy - f.y, e.cx - f.x); maxRate = Math.max(maxRate, MAXTURN_EDGE); }

      // Rate-clamp the desired heading change, then ease angular
      // velocity toward it so turns accelerate/decelerate smoothly.
      var diff = angleDiff(f.angle, desired);
      var cap = maxRate * dtf;
      var targetTurnVel = clamp(diff, -cap, cap);
      f.turnVel += (targetTurnVel - f.turnVel) * 0.16 * dtf;
      f.turnVel = clamp(f.turnVel, -cap, cap);
      if (Math.abs(diff) < Math.abs(f.turnVel)) f.turnVel = diff;
      f.angle += f.turnVel;

      var desiredTurnPressure = clamp(f.turnVel / Math.max(cap, 0.0001), -1, 1) * clamp(Math.abs(diff) / 0.75, 0, 1);
      f.turnAmount += (desiredTurnPressure - f.turnAmount) * 0.055 * dtf;

      f.speed += (targetSpeed - f.speed) * 0.045 * dtf;
      var surge = 1 + Math.sin(f.phase - 0.35) * Math.min(1, f.speed / 1.2) * 0.035;
      f.x += Math.cos(f.angle) * f.speed * surge * dtf;    // always advances — never a spin-in-place
      f.y += Math.sin(f.angle) * f.speed * surge * dtf;

      // separation so fish never stack
      for (var j = 0; j < fish.length; j++) { if (j === k) continue; var o = fish[j]; var dx = f.x - o.x, dy = f.y - o.y, dd = Math.hypot(dx, dy), minD = (fishW * f.sizeMul + fishW * o.sizeMul) * 0.55; if (dd > 0.001 && dd < minD) { var pp = (minD - dd) * 0.5 * dtf; f.x += dx / dd * pp; f.y += dy / dd * pp; } }
      clampWater(f, lenF * 0.1);
      f.phase += (0.28 + f.speed * 0.20) * dtf;
    }
  }

  /* ── render: canvas food pellets + DOM fish transforms ── */
  function blit(sp, cx, cy, targetW, alpha) { if (!sp) return; var bb = sp.bb, s = targetW / bb.sw, dw = bb.sw * s, dh = bb.sh * s; ctx.globalAlpha = alpha; ctx.drawImage(sp.img, bb.sx, bb.sy, bb.sw, bb.sh, cx - dw / 2, cy - dh / 2, dw, dh); ctx.globalAlpha = 1; }
  function drawFood(p) { var a = Math.min(1, p.life / 1.5); if (p.age < 0.3 && sprites.splash) blit(sprites.splash, p.x, p.y, fishH * 0.85, (1 - p.age / 0.3) * 0.9); blit(sprites.food, p.x, p.y, fishH * 0.46, a); }

  /* segmented-bend coefficients (degrees per unit of smoothedBend, plus
     a swim-oscillation term) — mid-body barely turns, the tail-stem
     turns more, the tail-fin turns the most, so the curve visibly
     travels down the body instead of the whole fish spinning. */
  var TURN_BEND_GAIN = 1.05;
  var MID_BEND_DEG = 3;
  var TAIL_STEM_BEND_DEG = 15;
  var TAIL_FIN_BEND_DEG = 34;

  function placeFish(f, dtf) {
    var sn = Math.min(1, f.speed / 1.4);                           // speed 0..1
    var propulsion = 0.55 + sn * 1.05;
    var headWag = Math.sin(f.phase + 2.35) * 0.45 * propulsion;
    var rot = f.angle * 180 / Math.PI - 90 + headWag;              // source fish points down
    var tx = f.x - PIV_X * fishW, ty = f.y - PIV_Y * fishH;
    f.el.style.transform = 'translate3d(' + tx.toFixed(3) + 'px,' + ty.toFixed(3) + 'px,0) rotate(' + rot.toFixed(3) + 'deg) scale(' + f.sizeMul.toFixed(3) + ')';
    if (reduce) return;

    // ── smooth the bend over time: rawTurn follows steering instantly,
    // but the body is a damped spring. The bend trails, overshoots a
    // little, and relaxes, which reads more like a flexible koi spine
    // than a value sliding linearly toward zero. ──
    var rawTurn = clamp(f.turnAmount * TURN_BEND_GAIN, -1.05, 1.05);
    f.bendVel += (rawTurn - f.smoothedBend) * BEND_STIFFNESS * dtf;
    f.bendVel *= Math.pow(BEND_DAMPING, dtf);
    f.smoothedBend = clamp(f.smoothedBend + f.bendVel * dtf, -1.05, 1.05);

    // Nonlinear bend makes normal cruising stay graceful, but once the
    // fish commits to a hard turn the tail curls into a visible C-shape.
    var bendSign = f.smoothedBend < 0 ? -1 : 1;
    var bend = bendSign * Math.pow(Math.abs(f.smoothedBend), 0.72);

    var swimMid = Math.sin(f.phase + 1.85);
    var swimStem = Math.sin(f.phase + 0.9);
    var swimTail = Math.sin(f.phase);
    var swimBoost = 1 + sn * 1.75;                                  // faster swimming -> bigger tail swish

    // head/front-body: no independent rotation — it stays the most
    // stable part, exactly as the wrapper's own heading dictates.
    var midAngle = bend * MID_BEND_DEG + swimMid * 0.65 * propulsion;
    var tailStemAngle = bend * TAIL_STEM_BEND_DEG + swimStem * 4.6 * propulsion;
    var tailFinAngle = bend * TAIL_FIN_BEND_DEG + swimTail * 14.5 * propulsion;
    var turnCurl = clamp(Math.abs(bend), 0, 1.05);
    var bodySquash = 1 - turnCurl * 0.018;
    var bodyLift = -turnCurl * 0.6;
    var curlDir = bend < 0 ? -1 : 1;
    var swimCurlDir = Math.sin(f.phase);
    var midCurlX = swimCurlDir * fishW * 0.002 * propulsion;
    var tailStemCurlX = curlDir * turnCurl * fishW * 0.025 + swimCurlDir * fishW * 0.018 * propulsion;
    var tailFinCurlX = curlDir * turnCurl * fishW * 0.075 + swimCurlDir * fishW * 0.06 * propulsion;

    // Pectoral fins paddle, but not as mirrored clock hands. A slight
    // phase offset plus a turn bias makes the inside fin tuck while the
    // outside fin pushes through a turn.
    var finBase = 0.9 + sn * 2.4;
    var leftFinAngle = Math.sin(f.phase * 1.45 + 0.6) * finBase - bend * 3.2;
    var rightFinAngle = Math.sin(f.phase * 1.45 + 2.25) * finBase + bend * 3.2;

    f.el.style.setProperty('--mid-angle', midAngle.toFixed(2) + 'deg');
    f.el.style.setProperty('--tail-stem-angle', tailStemAngle.toFixed(2) + 'deg');
    f.el.style.setProperty('--tail-fin-angle', tailFinAngle.toFixed(2) + 'deg');
    f.el.style.setProperty('--left-fin-angle', leftFinAngle.toFixed(2) + 'deg');
    f.el.style.setProperty('--right-fin-angle', rightFinAngle.toFixed(2) + 'deg');
    f.el.style.setProperty('--body-squash', bodySquash.toFixed(3));
    f.el.style.setProperty('--body-lift', bodyLift.toFixed(2) + 'px');
    f.el.style.setProperty('--mid-curl-x', midCurlX.toFixed(2) + 'px');
    f.el.style.setProperty('--tail-stem-curl-x', tailStemCurlX.toFixed(2) + 'px');
    f.el.style.setProperty('--tail-fin-curl-x', tailFinCurlX.toFixed(2) + 'px');
    f.el.style.setProperty('--fish-speed', sn.toFixed(3));
    f.el.style.setProperty('--turn-amount', (bend * 55).toFixed(2));
  }
  function render(dtf) {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < food.length; i++) drawFood(food[i]);
    // depth-sort the DOM fish by y (nearer in front)
    fish.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (f, idx) { f.el.style.zIndex = idx; });
    for (var k = 0; k < fish.length; k++) placeFish(fish[k], dtf || 1);
  }

  function frame(t) { var dtf = last ? Math.min(3, (t - last) / 16.67) : 1; last = t; update(dtf); render(dtf); var active = !reduce || food.length; raf = active ? requestAnimationFrame(frame) : (last = 0, null); }
  function wake() { if (raf === null) { last = 0; raf = requestAnimationFrame(frame); } }

  /* ── boot ── */
  buildFish();
  render(1);
  if (!reduce) wake();

  keyImgInPlace(pondImg, A + 'pond-base.png');
  keyImgInPlace(waterOverlayImg, A + 'pond-water-overlay.png');
  keyImgInPlace(causticsImg, A + 'pond-caustics.png');
  keyBg(A + 'food.png', function (c) { if (c) { sprites.food = { img: c, bb: bbox(c) }; } maybeReady(); });
  keyBg(A + 'food-splash.png', function (c) { if (c) { sprites.splash = { img: c, bb: bbox(c) }; } maybeReady(); });
  keyBg(A + 'ripple.png', function (c) { if (c) { var bb = bbox(c); sprites.ripple = { img: c, bb: bb, url: c.toDataURL() }; } maybeReady(); });
  function maybeReady() { if (sprites.food && sprites.splash && sprites.ripple) foodReady = true; }

  var rt = null;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { resize(); render(1); }, 150); }, { passive: true });
  document.addEventListener('visibilitychange', function () { if (document.hidden && raf !== null) { cancelAnimationFrame(raf); raf = null; } else if (!document.hidden) wake(); });
})();
