/* ════════════════════════════════════════════════════════════════
   PONDWATER.JS — ambient water motion, rendered on a canvas
   The closest vanilla-JS equivalent of a standalone WaterCanvas
   component: kept deliberately separate from the fish/lily/food logic
   in koipond.js, and touches nothing outside its own <canvas>.

   This replaces the earlier static shimmer PNGs (which cross-faded
   as flat images and read as a "sticker" on top of the pond). The
   water is built in layers, back to front:
     - a translucent base tint, so the koi read as submerged (replaces
       the old flat pond-water-tint.png)
     - DEPTH ZONES: soft radial pools of darker and lighter tone — a
       deeper basin off-center, a couple of faint underwater-shadow
       shapes (read as submerged rocks), a lighter shallow patch, and
       a gentle vignette that settles the water into its rocky edge.
       Each drifts extremely slowly, so the depth feels alive without
       ever reading as an effect. This is what keeps the pond from
       looking like one uniform blue-green fill.
     - the soft cloud textures slowly pan back and forth (the big,
       barely-there patches sliding across the surface)
     - the fine grain textures FLICKER — jumping to a fresh random crop
       every ~100-170ms rather than panning smoothly, which is what
       reads as softly-alive water instead of color slowly drifting
       (see the referenced duck-pond footage); kept low-contrast.
     - ambient GLINTS: a few tiny specks twinkling in and out, like
       light catching the surface, so the pond breathes even when idle.
   Interaction ripples (food drop / eating) are the pixel-art sprite
   frames in koipond.js — clean concentric rings, not rendered here.

   The animation is clipped to the pond's own silhouette (not a plain
   rectangle) by keying the pond-base art the same way koipond.js does
   and using the result as a canvas clip mask — so the water motion
   never bleeds over the rocks/reeds at the pond's edge.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var pond = document.querySelector('.koipond');
  if (!pond) return;
  var canvas = pond.querySelector('.pond-water-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var PONDA = 'assets/hero/koi/pond3/';
  var A = 'assets/hero/koi/pond4/';

  /* ── background keying (same border flood-fill as koipond.js) —
     only the pond-base needs this, purely to derive a clip silhouette;
     the noise/cloud textures are meant to fill edge-to-edge and are
     used exactly as shipped. ── */
  function load(src, cb) { var im = new Image(); im.onload = function () { cb(im); }; im.onerror = function () { cb(null); }; im.src = src; }
  function keyMask(src, cb) {
    load(src, function (im) {
      if (!im) { cb(null); return; }
      var w = im.naturalWidth, h = im.naturalHeight, c = document.createElement('canvas'); c.width = w; c.height = h;
      var x = c.getContext('2d'); x.drawImage(im, 0, 0);
      var id; try { id = x.getImageData(0, 0, w, h); } catch (e) { cb(null); return; }
      var d = id.data, vis = new Uint8Array(w * h), st = [];
      function isBg(p) { var i = p * 4, a = d[i + 3]; if (a < 8) return true; var r = d[i], g = d[i + 1], b = d[i + 2]; return (Math.max(r, g, b) - Math.min(r, g, b)) < 26 && Math.max(r, g, b) > 192; }
      function push(p) { if (p >= 0 && p < w * h && !vis[p]) { vis[p] = 1; st.push(p); } }
      for (var xi = 0; xi < w; xi++) { push(xi); push((h - 1) * w + xi); }
      for (var yi = 0; yi < h; yi++) { push(yi * w); push(yi * w + w - 1); }
      while (st.length) { var p = st.pop(); if (!isBg(p)) continue; d[p * 4 + 3] = 0; var px = p % w, py = (p - px) / w; if (px > 0) push(p - 1); if (px < w - 1) push(p + 1); if (py > 0) push(p - w); if (py < h - 1) push(p + w); }
      x.putImageData(id, 0, 0);
      // opaque out every remaining (in-water) pixel so this becomes a
      // pure clip stencil, independent of the pond art's own colors
      var od = id.data; for (var i2 = 3; i2 < od.length; i2 += 4) if (od[i2] > 0) od[i2] = 255;
      x.putImageData(id, 0, 0);
      cb(c);
    });
  }

  var mask = null;              // pond-shaped clip stencil (keyed pond-base alpha)
  var tex = {};                 // noise/cloud/atmosphere textures (used as shipped)
  var A5 = 'assets/hero/koi/pond5/';
  var texSrcs = {
    noise1: A + 'water-noise-01.png', noise2: A + 'water-noise-02.png',
    clouds1: A + 'water-soft-clouds-01.png', clouds2: A + 'water-soft-clouds-02.png',
    oceanic: A5 + 'oceanic-texture.png',   // marbled tonal texture — broad watercolor variation
    mist: A5 + 'mist-clouds.png'           // pre-keyed wispy haze patches (real alpha)
  };
  Object.keys(texSrcs).forEach(function (name) { load(texSrcs[name], function (im) { tex[name] = im; }); });
  keyMask(PONDA + 'pond-base.png', function (c) { mask = c; });

  var W = 0, H = 0, buf = document.createElement('canvas'), bctx = buf.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    var r = pond.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    canvas.width = buf.width = W * dpr;
    canvas.height = buf.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* broad soft cloud drift: one texture, scaled larger than the pond
     and slowly panned back and forth — the big, barely-there patches
     of light/dark that slide across the reference water. */
  function drift(im, t, o) {
    if (!im) return;
    var dw = W * o.scale, dh = H * o.scale;
    var ox = Math.sin(t * o.fx + o.ph) * o.ax * W;
    var oy = Math.cos(t * o.fy + o.ph * 1.3) * o.ay * H;
    bctx.globalAlpha = o.alpha;
    bctx.drawImage(im, (W - dw) / 2 + ox, (H - dh) / 2 + oy, dw, dh);
  }

  /* depth zones: soft radial pools of tone, each drifting on its own
     very slow orbit. Dark pools read as deeper water / submerged rock
     shadows; light pools read as shallows. Fractional coords + radii
     so they scale with the pond. */
  function pool(t, o) {
    var cx = (o.cx + Math.sin(t * o.f + o.ph) * o.drift) * W;
    var cy = (o.cy + Math.cos(t * o.f * 0.8 + o.ph * 1.7) * o.drift) * H;
    var r = o.r * Math.min(W, H);
    var g = bctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, o.color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    bctx.globalAlpha = 1;
    bctx.fillStyle = g;
    bctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  /* vignette: transparent through the middle, gently darker at the
     boundary — settles the water into its rocky frame */
  function vignette() {
    var r = Math.max(W, H) * 0.72;
    var g = bctx.createRadialGradient(W / 2, H / 2, r * 0.52, W / 2, H / 2, r);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(4, 18, 25, 0.44)');
    bctx.globalAlpha = 1;
    bctx.fillStyle = g;
    bctx.fillRect(0, 0, W, H);
  }

  /* Interaction ripples (food drop / eating) are the pixel-art sprite
     frames in koipond.js — clean concentric rings, stepped by JS, not
     rendered here.

     ── ambient glints: a handful of tiny light specks that slowly
     twinkle in and out at random spots, like light catching the
     surface — the pond keeps breathing even with no interaction ── */
  var glints = [];
  (function () { for (var i = 0; i < 7; i++) glints.push({ t0: Math.random() * 5, t1: 0, x: 0, y: 0 }); })();
  function drawGlints(t) {
    for (var i = 0; i < glints.length; i++) {
      var g = glints[i];
      if (t >= g.t1) {
        g.t0 = t + Math.random() * 3;
        g.t1 = g.t0 + 2.5 + Math.random() * 4;
        g.x = 0.12 + Math.random() * 0.76;
        g.y = 0.12 + Math.random() * 0.76;
      }
      if (t < g.t0) continue;
      var pr = (t - g.t0) / (g.t1 - g.t0);
      var a = Math.pow(Math.sin(Math.PI * pr), 2) * 0.35;
      if (a < 0.02) continue;
      bctx.globalAlpha = a;
      bctx.fillStyle = 'rgb(205, 235, 238)';
      bctx.fillRect(g.x * W, g.y * H, 1.6, 1.6);
    }
  }

  /* fine grain: what actually reads as "alive, shimmering" water. A
     slow pan alone looks like color drifting, not shimmer — real film
     grain / water sparkle flickers frame to frame. So instead of
     panning smoothly, each grain layer jumps to a fresh random crop of
     its source texture on its own short interval, holds there for a
     few frames, then jumps again — a cheap stand-in for temporally
     random noise without generating pixels by hand every frame. */
  var grain = {
    noise1: { next: 0, x: 0, y: 0, period: 110 },
    noise2: { next: 0, x: 0, y: 0, period: 140 }
  };
  function grainCrop(im, name, nowMs) {
    var g = grain[name];
    if (nowMs >= g.next) {
      g.next = nowMs + g.period + Math.random() * g.period * 0.6;
      var maxX = Math.max(1, im.naturalWidth - im.naturalWidth * 0.55);
      var maxY = Math.max(1, im.naturalHeight - im.naturalHeight * 0.55);
      g.x = Math.random() * maxX; g.y = Math.random() * maxY;
    }
    return g;
  }
  function flicker(im, name, nowMs, alpha) {
    if (!im) return;
    var g = grainCrop(im, name, nowMs);
    var cw = im.naturalWidth * 0.55, ch = im.naturalHeight * 0.55;
    bctx.globalAlpha = alpha;
    bctx.drawImage(im, g.x, g.y, cw, ch, 0, 0, W, H);
  }

  function paint(t, nowMs) {
    if (!W) return;
    bctx.clearRect(0, 0, W, H);

    // translucent tint so the koi still read as submerged (replaces
    // the old flat pond-water-tint.png)
    bctx.globalAlpha = 1;
    bctx.fillStyle = 'rgba(6, 28, 33, 0.32)';
    bctx.fillRect(0, 0, W, H);

    // depth zones — darker basin + underwater-shadow shapes + a light
    // shallow patch, each on its own imperceptibly slow orbit
    pool(t, { cx: 0.56, cy: 0.44, r: 0.52, f: 0.011, ph: 0.0, drift: 0.03, color: 'rgba(3, 18, 27, 0.30)' });   // deep basin, off-center
    pool(t, { cx: 0.30, cy: 0.62, r: 0.22, f: 0.015, ph: 2.2, drift: 0.02, color: 'rgba(4, 16, 24, 0.26)' });   // submerged rock shadow
    pool(t, { cx: 0.72, cy: 0.70, r: 0.16, f: 0.013, ph: 4.5, drift: 0.02, color: 'rgba(4, 16, 24, 0.22)' });   // smaller rock shadow
    pool(t, { cx: 0.38, cy: 0.30, r: 0.26, f: 0.009, ph: 1.1, drift: 0.025, color: 'rgba(64, 120, 126, 0.12)' }); // lighter shallow patch
    vignette();

    // marbled watercolor texture — broad tonal richness under the clouds
    drift(tex.oceanic, t, { scale: 1.35, fx: 0.005, fy: 0.004, ax: 0.07, ay: 0.05, ph: 2.6, alpha: 0.10 });
    // broad soft cloud drift — large, slow, barely-there
    drift(tex.clouds1, t, { scale: 1.5, fx: 0.006, fy: 0.005, ax: 0.09, ay: 0.07, ph: 1.0, alpha: 0.16 });
    drift(tex.clouds2, t, { scale: 1.65, fx: 0.0045, fy: 0.007, ax: 0.11, ay: 0.06, ph: 4.2, alpha: 0.12 });
    // wispy mist patches — slowest layer, faint haze sliding across
    drift(tex.mist, t, { scale: 1.45, fx: 0.0035, fy: 0.0055, ax: 0.1, ay: 0.08, ph: 5.4, alpha: 0.14 });
    // fine texture — flickers between random crops; kept low-contrast
    // so it reads as calm water, never a shimmer overlay
    flicker(tex.noise1, 'noise1', nowMs, 0.17);
    flicker(tex.noise2, 'noise2', nowMs, 0.12);

    // living surface: twinkling ambient glints
    drawGlints(t);

    // clip everything to the pond's actual silhouette
    if (mask) { bctx.globalCompositeOperation = 'destination-in'; bctx.globalAlpha = 1; bctx.drawImage(mask, 0, 0, mask.width, mask.height, 0, 0, W, H); bctx.globalCompositeOperation = 'source-over'; }

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(buf, 0, 0, W, H);
  }

  var raf = null, t0 = 0;
  function frame(ts) { if (!t0) t0 = ts; paint((ts - t0) / 1000, ts); raf = requestAnimationFrame(frame); }

  resize();
  if (reduce) { paint(0, 0); } else { raf = requestAnimationFrame(frame); }

  var rt = null;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { resize(); if (reduce) paint(0, 0); }, 150); }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (reduce) return;
    if (document.hidden && raf !== null) { cancelAnimationFrame(raf); raf = null; }
    else if (!document.hidden && raf === null) { t0 = 0; raf = requestAnimationFrame(frame); }
  });
})();
