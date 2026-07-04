/* ════════════════════════════════════════════════════════════════
   PONDWATER.JS — subtle WebGL pond water layer

   Transparent shader layer above the koi and below lily pads/UI:
   ambient water drift + click ripple crest highlights, clipped to the
   pond silhouette. No bright global shimmer.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  document.documentElement.dataset.pondwaterLoaded = '1';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pond = document.querySelector('.koipond');
  if (!pond) return;
  var canvas = pond.querySelector('.pond-water-canvas');
  if (!canvas) return;

  if (typeof canvas.getContext !== 'function') {
    canvas.dataset.renderer = 'no-canvas-context';
    window.koiPondWaterStatus = { renderer: 'no-canvas-context' };
    return;
  }

  var gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false });
  var POND_BASE = 'assets/hero/koi/pond3/pond-base.png';
  var MAX_RIPPLES = 8;
  var RIPPLE_DURATION = 1600;
  var ripples = [];
  var W = 1, H = 1, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var raf = null, t0 = 0, maskTexture = null;

  if (!gl) {
    canvas.dataset.renderer = 'no-webgl';
    window.koiPondWaterStatus = { renderer: 'no-webgl' };
    return;
  }

  canvas.dataset.renderer = 'webgl';
  window.koiPondWaterStatus = { renderer: 'webgl' };

  window.koiPondWater = {
    spawnRipple: function (x, y) {
      if (reduce) return;
      ripples.push({ x: x, y: y, startedAt: performance.now() });
      if (ripples.length > MAX_RIPPLES) ripples.shift();
      canvas.dataset.ripples = String(ripples.length);
      wake();
    }
  };

  document.addEventListener('koi:spawn-ripple', function (e) {
    if (!e.detail) return;
    window.koiPondWater.spawnRipple(e.detail.x, e.detail.y);
  });

  var vertexSrc =
    'attribute vec2 aPosition;\n' +
    'attribute vec2 aUv;\n' +
    'varying vec2 vUv;\n' +
    'void main(){\n' +
    '  vUv = aUv;\n' +
    '  gl_Position = vec4(aPosition, 0.0, 1.0);\n' +
    '}\n';

  var fragmentSrc =
    'precision mediump float;\n' +
    'uniform vec2 uResolution;\n' +
    'uniform float uTime;\n' +
    'uniform float uReduced;\n' +
    'uniform int uRippleCount;\n' +
    'uniform vec4 uRipples[8];\n' +
    'uniform sampler2D uMask;\n' +
    'varying vec2 vUv;\n' +
    'float random(vec2 st){ return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453); }\n' +
    'float softNoise(vec2 uv){\n' +
    '  vec2 i = floor(uv);\n' +
    '  vec2 f = fract(uv);\n' +
    '  float a = random(i);\n' +
    '  float b = random(i + vec2(1.0, 0.0));\n' +
    '  float c = random(i + vec2(0.0, 1.0));\n' +
    '  float d = random(i + vec2(1.0, 1.0));\n' +
    '  vec2 u = f * f * (3.0 - 2.0 * f);\n' +
    '  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;\n' +
    '}\n' +
    'void main(){\n' +
    '  float mask = texture2D(uMask, vUv).a;\n' +
    '  if (mask < 0.01) discard;\n' +
    '  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);\n' +
    '  float minRes = min(uResolution.x, uResolution.y);\n' +
    '  vec2 uv = vUv;\n' +
    '  vec2 driftUvA = uv * 3.2 + vec2(uTime * 0.014, uTime * 0.009);\n' +
    '  vec2 driftUvB = uv * 6.4 + vec2(-uTime * 0.01, uTime * 0.013);\n' +
    '  vec2 driftUvC = uv * 11.0 + vec2(uTime * 0.006, -uTime * 0.009);\n' +
    '  float ambient = softNoise(driftUvA) * 0.6 + softNoise(driftUvB) * 0.4;\n' +
    '  float fine = softNoise(driftUvC);\n' +
    '  float microPatch = smoothstep(0.62, 0.86, fine) * 0.5 - smoothstep(0.12, 0.34, fine) * 0.22;\n' +
    '  float ambientTone = (ambient - 0.5) * 0.038 + microPatch * 0.014;\n' +
    '  float ambientHighlight = smoothstep(0.80, 0.94, ambient) * 0.016;\n' +
    '  float rippleGlow = 0.0;\n' +
    '  for (int i = 0; i < 8; i++) {\n' +
    '    if (i >= uRippleCount) break;\n' +
    '    vec4 rp = uRipples[i];\n' +
    '    float age = clamp(rp.z, 0.0, 1.0);\n' +
    '    vec2 delta = (frag - rp.xy) / minRes;\n' +
    '    delta.y *= 1.72;\n' +
    '    float d = length(delta);\n' +
    '    float fade = pow(1.0 - age, 1.45) * rp.w;\n' +
    '    float radius = age * 0.24;\n' +
    '    float width = mix(0.018, 0.010, age);\n' +
    '    float ring = 1.0 - smoothstep(width, width * 1.8, abs(d - radius));\n' +
    '    float breakup = softNoise(uv * 78.0 + vec2(uTime * 0.09, -uTime * 0.04));\n' +
    '    ring *= smoothstep(0.28, 0.72, breakup);\n' +
    '    float crest = smoothstep(0.56, 1.0, sin((d - radius) * 155.0));\n' +
    '    rippleGlow += ring * crest * fade;\n' +
    '  }\n' +
    '  vec3 tint = vec3(0.08, 0.34, 0.38);\n' +
    '  vec3 crestColor = vec3(0.56, 0.88, 0.84);\n' +
    '  float alpha = 0.018 + abs(ambientTone) * 0.42 + ambientHighlight + rippleGlow * 0.18;\n' +
    '  alpha = clamp(alpha, 0.0, 0.15) * mask;\n' +
    '  vec3 color = mix(tint, crestColor, clamp(rippleGlow * 1.45 + ambientTone * 1.25, 0.0, 1.0));\n' +
    '  gl_FragColor = vec4(color, alpha);\n' +
    '}\n';

  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function program(vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }

  var prog;
  try {
    prog = program(vertexSrc, fragmentSrc);
  } catch (e) {
    canvas.dataset.renderer = 'shader-error';
    window.koiPondWaterStatus = { renderer: 'shader-error', message: e.message };
    console.warn('Pond water shader failed:', e.message);
    return;
  }

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 0, 1,
     1, -1, 1, 1,
    -1,  1, 0, 0,
     1,  1, 1, 0
  ]), gl.STATIC_DRAW);

  var loc = {
    pos: gl.getAttribLocation(prog, 'aPosition'),
    uv: gl.getAttribLocation(prog, 'aUv'),
    resolution: gl.getUniformLocation(prog, 'uResolution'),
    time: gl.getUniformLocation(prog, 'uTime'),
    reduced: gl.getUniformLocation(prog, 'uReduced'),
    rippleCount: gl.getUniformLocation(prog, 'uRippleCount'),
    ripples: gl.getUniformLocation(prog, 'uRipples'),
    mask: gl.getUniformLocation(prog, 'uMask')
  };

  function load(src, cb) {
    var im = new Image();
    im.onload = function () { cb(im); };
    im.onerror = function () { cb(null); };
    im.src = src;
  }
  function keyMask(src, cb) {
    load(src, function (im) {
      if (!im) { cb(null); return; }
      var w = im.naturalWidth, h = im.naturalHeight;
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      var x = c.getContext('2d');
      x.drawImage(im, 0, 0);
      var id;
      try { id = x.getImageData(0, 0, w, h); } catch (e) { cb(null); return; }
      var d = id.data, vis = new Uint8Array(w * h), st = [];
      function isBg(p) {
        var i = p * 4, a = d[i + 3];
        if (a < 8) return true;
        var r = d[i], g = d[i + 1], b = d[i + 2];
        return (Math.max(r, g, b) - Math.min(r, g, b)) < 26 && Math.max(r, g, b) > 192;
      }
      function push(p) { if (p >= 0 && p < w * h && !vis[p]) { vis[p] = 1; st.push(p); } }
      for (var xi = 0; xi < w; xi++) { push(xi); push((h - 1) * w + xi); }
      for (var yi = 0; yi < h; yi++) { push(yi * w); push(yi * w + w - 1); }
      while (st.length) {
        var p = st.pop();
        if (!isBg(p)) continue;
        d[p * 4 + 3] = 0;
        var px = p % w, py = (p - px) / w;
        if (px > 0) push(p - 1);
        if (px < w - 1) push(p + 1);
        if (py > 0) push(p - w);
        if (py < h - 1) push(p + w);
      }
      for (var a2 = 3; a2 < d.length; a2 += 4) d[a2] = d[a2] > 0 ? 255 : 0;
      x.putImageData(id, 0, 0);
      cb(c);
    });
  }
  function makeTexture(source) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    return tex;
  }

  function resize() {
    var r = pond.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function draw(ts) {
    if (!maskTexture) return;
    if (!t0) t0 = ts;
    var now = performance.now();
    for (var i = ripples.length - 1; i >= 0; i--) {
      if (now - ripples[i].startedAt > RIPPLE_DURATION) ripples.splice(i, 1);
    }
    canvas.dataset.ripples = String(ripples.length);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(loc.pos);
    gl.vertexAttribPointer(loc.pos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(loc.uv);
    gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, 16, 8);

    var data = new Float32Array(MAX_RIPPLES * 4);
    for (var r = 0; r < ripples.length; r++) {
      var age = Math.min(1, (now - ripples[r].startedAt) / RIPPLE_DURATION);
      data[r * 4] = ripples[r].x * dpr;
      data[r * 4 + 1] = ripples[r].y * dpr;
      data[r * 4 + 2] = age;
      data[r * 4 + 3] = 1;
    }

    gl.uniform2f(loc.resolution, canvas.width, canvas.height);
    gl.uniform1f(loc.time, reduce ? 0 : (ts - t0) / 1000);
    gl.uniform1f(loc.reduced, reduce ? 1 : 0);
    gl.uniform1i(loc.rippleCount, ripples.length);
    gl.uniform4fv(loc.ripples, data);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, maskTexture);
    gl.uniform1i(loc.mask, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    raf = (!reduce || ripples.length) ? requestAnimationFrame(draw) : null;
  }

  function wake() {
    if (raf === null && maskTexture) raf = requestAnimationFrame(draw);
  }

  resize();
  keyMask(POND_BASE, function (mask) {
    if (!mask) return;
    maskTexture = makeTexture(mask);
    wake();
  });

  var rt = null;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); wake(); }, 150);
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    } else if (!document.hidden) {
      wake();
    }
  });
})();
