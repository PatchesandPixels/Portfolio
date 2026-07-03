/* ════════════════════════════════════════════════════════════════
   PONDFLOOR.JS — underwater floor detail, rendered once on a canvas
   Sits UNDER the fish (between the pond base art and the koi stage),
   so everything here reads as the bottom of the pond: stone-floor
   texture, algae tone patches, and scattered submerged rock clusters.
   The water-tint / drifting-texture canvas (pondwater.js) then renders
   ABOVE the fish, which is what pushes all of this convincingly
   underwater.

   Static by design: the floor doesn't animate. It paints once when
   its textures are ready (and again on resize) — no rAF loop, so it
   costs nothing per frame. All drawing is clipped to the pond's own
   silhouette via the same keyed pond-base mask pondwater.js uses.

   Rock clusters are individual pre-keyed sprites (cropped offline
   from the scatter sheets and darkened toward the pond palette),
   placed at explicit interior positions with varied scale and opacity
   so some formations read deeper than others.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var pond = document.querySelector('.koipond');
  if (!pond) return;
  var canvas = pond.querySelector('.pond-floor-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var PONDA = 'assets/hero/koi/pond3/';
  var A = 'assets/hero/koi/pond5/';

  /* same border flood-fill as koipond.js/pondwater.js — derives the
     pond-shaped clip stencil from the pond-base art */
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
      var od = id.data; for (var i2 = 3; i2 < od.length; i2 += 4) if (od[i2] > 0) od[i2] = 255;
      x.putImageData(id, 0, 0);
      cb(c);
    });
  }

  var mask = null, tex = {}, pendingPaint = false;
  var texSrcs = { floor: 'floor-mosaic.png', algae: 'rock-algae.png' };
  /* individual rock clusters (pre-keyed + pre-darkened toward the pond
     palette so they read as submerged): [name, cx, cy, w, alpha] —
     center position + width as fractions of the pond box. Anchored to
     the four corners (under where the lily pads sit, so each corner
     reads as one cohesive rock+pad formation) plus two smaller groups
     on the side edges — the interior stays open water, textured by
     the floor mosaic/algae passes below rather than by rock clutter. */
  var ROCKS = [
    ['rock-1.png', 0.13, 0.15, 0.135, 0.68],   // top-left
    ['rock-6.png', 0.88, 0.13, 0.11, 0.62],    // top-right
    ['rock-3.png', 0.14, 0.87, 0.13, 0.64],    // bottom-left
    ['rock-2.png', 0.87, 0.85, 0.125, 0.64],   // bottom-right
    ['rock-5.png', 0.045, 0.52, 0.065, 0.5],   // left edge, small
    ['rock-4.png', 0.955, 0.55, 0.075, 0.5]    // right edge, small
  ];
  var W = 0, H = 0, buf = document.createElement('canvas'), bctx = buf.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function ready() {
    if (!mask || !tex.floor || !tex.algae) return false;
    for (var i = 0; i < ROCKS.length; i++) if (!tex[ROCKS[i][0]]) return false;
    return true;
  }

  function resize() {
    var r = pond.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    canvas.width = buf.width = W * dpr;
    canvas.height = buf.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* draw a texture covering the pond with overscan + offset (fractions
     of pond size), so repeated draws of square sources land differently */
  function cover(im, scale, ox, oy, alpha) {
    var dw = W * scale, dh = H * scale;
    bctx.globalAlpha = alpha;
    bctx.drawImage(im, (W - dw) / 2 + ox * W, (H - dh) / 2 + oy * H, dw, dh);
  }

  function paint() {
    if (!W || !ready()) { pendingPaint = true; return; }
    pendingPaint = false;
    bctx.clearRect(0, 0, W, H);

    // stone floor base — one even pass; the pebbled bottom should be
    // clearly visible across the whole pond, not just hinted at
    cover(tex.floor, 1.04, 0, 0, 0.55);
    // algae/rock tone patches — two offset passes for uneven, mottled
    // floor variation (darker mossy zones)
    cover(tex.algae, 1.5, -0.1, -0.06, 0.32);
    cover(tex.algae, 1.7, 0.14, 0.1, 0.22);
    // submerged rock clusters anchored at the corners/edges — varied
    // size and opacity so some formations sit deeper than others
    ROCKS.forEach(function (r) {
      var im = tex[r[0]];
      var w = W * r[3], h = w * im.naturalHeight / im.naturalWidth;
      bctx.globalAlpha = r[4];
      bctx.drawImage(im, r[1] * W - w / 2, r[2] * H - h / 2, w, h);
    });

    // clip to the pond silhouette
    bctx.globalCompositeOperation = 'destination-in';
    bctx.globalAlpha = 1;
    bctx.drawImage(mask, 0, 0, mask.width, mask.height, 0, 0, W, H);
    bctx.globalCompositeOperation = 'source-over';

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(buf, 0, 0, W, H);
  }

  Object.keys(texSrcs).forEach(function (name) {
    load(A + texSrcs[name], function (im) { tex[name] = im; if (pendingPaint) paint(); });
  });
  ROCKS.forEach(function (r) {
    load(A + r[0], function (im) { tex[r[0]] = im; if (pendingPaint) paint(); });
  });
  keyMask(PONDA + 'pond-base.png', function (c) { mask = c; if (pendingPaint) paint(); });

  resize();
  paint();

  var rt = null;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { resize(); paint(); }, 150); }, { passive: true });
})();
