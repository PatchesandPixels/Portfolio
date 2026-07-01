/* ════════════════════════════════════════════════════════════════
   HERO.JS — interactive 2.5D studio room (Pixels & Patches)

   Architecture
   - Config-driven objects with PER-BREAKPOINT layouts
     (small / mobile / tablet / desktop). Replace placeholder asset
     paths in HERO_ASSETS; animation logic never references filenames.
   - Objects mount into one of three depth GROUPS (light / medium /
     heavy). Groups carry the GSAP scroll-exit transform; individual
     objects carry their own drag-translate, entrance-scale and
     pointer-parallax. These live on DIFFERENT elements, so no two
     animations ever target the same transform property.
   - Decorative only: no navigation, no scroll capture.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  /* Breakpoints: small <360, mobile <768, tablet <1024, desktop. */
  function bpName() {
    var w = window.innerWidth;
    return w < 360 ? 'small' : w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
  }
  var BP_ORDER = { small: ['small', 'mobile', 'tablet', 'desktop'],
                   mobile: ['mobile', 'tablet', 'desktop'],
                   tablet: ['tablet', 'desktop'],
                   desktop: ['desktop'] };

  /* ─── ASSET + LAYOUT CONFIG ─────────────────────────────────────
     group: 'light' | 'medium' | 'heavy'  (scroll-exit band)
     plx:   pointer-parallax factor (decorative furniture only)      */
  var A = 'assets/hero/';
  var HERO_ASSETS = {
    /* ── furniture (decorative) ── */
    rug: {
      img: A + 'furniture/rug-placeholder.svg', group: 'heavy', z: 1,
      enterDelay: 300, plx: 6,
      layouts: {
        desktop: { pos: { left: '12%', bottom: '-2%' }, w: 480 },
        tablet:  { pos: { left: '6%', bottom: '-2%' }, w: 420 },
        mobile:  { show: false }
      }
    },
    desk: {
      img: A + 'furniture/desk-placeholder.svg', group: 'heavy', z: 2,
      enterDelay: 360, plx: 10,
      layouts: {
        desktop: { pos: { left: '-12px', bottom: '6%' }, w: 340 },
        tablet:  { pos: { left: '-20px', bottom: '5%' }, w: 280 },
        mobile:  { show: false }
      }
    },
    shelf: {
      img: A + 'furniture/shelf-placeholder.svg', group: 'heavy', z: 2,
      enterDelay: 360, plx: 8,
      layouts: {
        desktop: { pos: { right: '-6px', bottom: '6%' }, w: 220 },
        tablet:  { pos: { right: '-14px', bottom: '5%' }, w: 184 },
        mobile:  { show: false }
      }
    },

    /* ── LEFT DESK ZONE ── */
    aquarium: {
      tank:  A + 'aquarium/tank-placeholder.svg',
      fish:  A + 'aquarium/fish-placeholder.svg',
      plant: A + 'aquarium/water-plant-placeholder.svg',
      group: 'heavy', z: 6, label: 'Activate fish tank', enterDelay: 560,
      layouts: {
        desktop: { pos: { left: '15%', bottom: '25%' }, w: 146 },
        tablet:  { pos: { left: '12%', bottom: '23%' }, w: 126 },
        mobile:  { pos: { left: '-10px', bottom: '12%' }, w: 116, rot: -2, show: true }
      }
    },
    plant: {
      pot:  A + 'plants/pot-placeholder.svg',
      leaf: A + 'plants/leaf-placeholder.svg',
      group: 'heavy', z: 4, label: 'Grow the plant', enterDelay: 620,
      layouts: {
        desktop: { pos: { left: '-4px', bottom: '8%' }, w: 116 },
        tablet:  { pos: { left: '-8px', bottom: '7%' }, w: 100 },
        mobile:  { show: false }
      }
    },
    lamp: {
      img: A + 'lamp/lamp-placeholder.svg',
      group: 'medium', z: 7, label: 'Toggle desk lamp', enterDelay: 680,
      doodles: ['user flows ↗', 'v2 — simplify', '☕ then iterate'],
      layouts: {
        desktop: { pos: { left: '3%', bottom: '26%' }, w: 104 },
        tablet:  { pos: { left: '1%', bottom: '25%' }, w: 92 },
        mobile:  { pos: { left: '-14px', top: '-12px' }, w: 84, rot: -3 },
        small:   { pos: { left: '-16px', top: '-10px' }, w: 72, rot: -3 }
      }
    },
    notebook: {
      pages: A + 'notebook/notebook-pages-placeholder.svg',
      group: 'light', z: 5, enterDelay: 600,
      notes: ['Make it clear.', 'Ask why.', 'Prototype first.', 'Test the strange idea.'],
      layouts: {
        desktop: { pos: { left: '0%', bottom: '9%' }, w: 152, rot: -5 },
        tablet:  { pos: { left: '-1%', bottom: '8%' }, w: 134, rot: -5 },
        mobile:  { show: false }
      }
    },
    camera: {
      img: A + 'camera/camera-placeholder.svg',
      photos: [A + 'camera/photo-01-placeholder.svg',
               A + 'camera/photo-02-placeholder.svg',
               A + 'camera/photo-03-placeholder.svg'],
      group: 'light', z: 8, label: 'Take a photo', enterDelay: 800,
      layouts: {
        desktop: { pos: { left: '13%', bottom: '13%' }, w: 86 },
        tablet:  { pos: { left: '11%', bottom: '12%' }, w: 80 },
        mobile:  { pos: { left: '-12px', bottom: '54%' }, w: 80, rot: -6, show: true },
        small:   { pos: { left: '-14px', bottom: '54%' }, w: 70, rot: -6, show: true }
      }
    },
    shoes: {
      left:  A + 'shoes/shoe-left-placeholder.svg',
      right: A + 'shoes/shoe-right-placeholder.svg',
      footL: A + 'shoes/footprint-left-placeholder.svg',
      footR: A + 'shoes/footprint-right-placeholder.svg',
      group: 'medium', z: 9, label: 'Animate hiking boots', enterDelay: 740,
      layouts: {
        desktop: { pos: { left: '15%', bottom: '4%' }, w: 132 },
        tablet:  { pos: { left: '12%', bottom: '4%' }, w: 116 },
        mobile:  { show: false }
      }
    },

    /* ── RIGHT SHELF ZONE ── */
    vinyl: {
      base:   A + 'vinyl/turntable-placeholder.svg',
      record: A + 'vinyl/record-placeholder.svg',
      arm:    A + 'vinyl/tonearm-placeholder.svg',
      group: 'medium', z: 6, label: 'Play vinyl — drag the record to scratch', enterDelay: 700,
      layouts: {
        desktop: { pos: { right: '4%', bottom: '30%' }, w: 152 },
        tablet:  { pos: { right: '2%', bottom: '28%' }, w: 132 },
        mobile:  { pos: { right: '-30px', top: '8px' }, w: 132, rot: 4, show: true, z: 3 },
        small:   { pos: { right: '-32px', top: '6px' }, w: 116, rot: 4, show: true, z: 3 }
      }
    },
    smallplant: {
      pot:  A + 'plants/pot-placeholder.svg',
      leaf: A + 'plants/leaf-placeholder.svg',
      group: 'medium', z: 6, label: 'Grow the plant', enterDelay: 660,
      layouts: {
        desktop: { pos: { right: '18%', bottom: '31%' }, w: 74 },
        tablet:  { pos: { right: '16%', bottom: '29%' }, w: 64 },
        mobile:  { show: false }
      }
    },
    mascot: {
      img: A + 'mascot/mascot-placeholder.svg',
      group: 'light', z: 8, label: 'Talk to studio mascot', enterDelay: 880,
      phrases: ['Patch!', 'Still iterating.', 'Ship it?', 'One more pixel.', 'Looks intentional.'],
      layouts: {
        desktop: { pos: { right: '7%', bottom: '34%' }, w: 96 },
        tablet:  { pos: { right: '5%', bottom: '32%' }, w: 84 },
        mobile:  { pos: { right: '-10px', bottom: '8px' }, w: 88, rot: 5, show: true },
        small:   { pos: { right: '-12px', bottom: '6px' }, w: 76, rot: 5, show: true }
      }
    },
    folder: {
      img: A + 'folder/folder-front-placeholder.svg',
      group: 'light', z: 7, label: 'Open final files folder', enterDelay: 900,
      files: ['final.fig', 'final-final.fig', 'final_v2.fig', 'final_v7.fig',
              'actually-final.fig', 'final_really_final.fig', 'use-this-one.fig',
              'client-approved-final.fig', 'untitled-47.fig', 'do-not-delete.fig'],
      layouts: {
        desktop: { pos: { right: '6%', bottom: '13%' }, w: 112 },
        tablet:  { pos: { right: '4%', bottom: '12%' }, w: 100 },
        mobile:  { show: false }
      }
    },
    fishing: {
      rod:  A + 'fishing/rod-placeholder.svg',
      fish: A + 'fishing/fish-body-placeholder.svg',
      group: 'medium', z: 12, label: 'Reel in the fish', enterDelay: 1000,
      layouts: {
        desktop: { pos: { right: '1%', top: '-1%' }, w: 150, line: 220 },
        tablet:  { pos: { right: '0%', top: '-1%' }, w: 132, line: 190 },
        mobile:  { show: false }
      }
    },
    cat: {
      peek: A + 'cat/cat-peek-placeholder.svg',
      paw:  A + 'cat/cat-paw-placeholder.svg',
      pos: { right: '12%', bottom: '0%' }
    }
  };

  var hero = document.querySelector('.ihero');
  var layer = document.getElementById('iheroObjects');
  var hint = document.getElementById('iheroHint');
  if (!hero || !layer) return;

  /* ─── helpers ───────────────────────────────────────────────── */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function img(src, cls) {
    var i = new Image();
    i.src = src; i.alt = '';
    if (cls) i.className = cls;
    i.setAttribute('aria-hidden', 'true');
    return i;
  }
  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* depth groups carry the scroll-exit transform */
  var groups = {
    heavy:  el('div', 'studio-grp grp-heavy'),
    medium: el('div', 'studio-grp grp-medium'),
    light:  el('div', 'studio-grp grp-light')
  };
  groups.heavy.setAttribute('aria-hidden', 'true');
  groups.medium.setAttribute('aria-hidden', 'true');
  groups.light.setAttribute('aria-hidden', 'true');
  layer.appendChild(groups.heavy);
  layer.appendChild(groups.medium);
  layer.appendChild(groups.light);
  function mount(node, group) { (groups[group] || groups.medium).appendChild(node); }

  /* cross-object: lamp warms the tank glass (set by aquarium, used by lamp) */
  var aquariumLit = function () {};

  /* interaction-hint fade after first meaningful interaction */
  var interacted = false;
  function markInteracted() {
    if (interacted) return;
    interacted = true;
    hero.classList.add('has-interacted');
  }

  /* ─── responsive layout engine ──────────────────────────────── */
  var registry = [];
  var currentBp = null;

  function resolveLayout(cfg) {
    var chain = BP_ORDER[bpName()];
    var out = { show: true, pos: null, w: null, rot: 0, line: null, z: null };
    for (var i = chain.length - 1; i >= 0; i--) {
      var l = cfg.layouts[chain[i]];
      if (!l) continue;
      if (l.show !== undefined) out.show = l.show;
      if (l.pos) out.pos = l.pos;
      if (l.w) out.w = l.w;
      if (l.rot !== undefined) out.rot = l.rot;
      if (l.line) out.line = l.line;
      if (l.z !== undefined) out.z = l.z;
    }
    return out;
  }

  function applyLayout(entry, bpChanged) {
    var L = resolveLayout(entry.cfg);
    var n = entry.node;
    if (!L.show || !L.pos) { n.style.display = 'none'; entry.hidden = true; return; }
    n.style.display = ''; entry.hidden = false;
    ['left', 'right', 'top', 'bottom'].forEach(function (k) { n.style[k] = ''; });
    Object.keys(L.pos).forEach(function (k) { n.style[k] = L.pos[k]; });
    n.style.width = L.w + 'px';
    n.style.rotate = L.rot ? L.rot + 'deg' : '';
    n.style.zIndex = L.z !== null ? L.z : entry.cfg.z;
    if (bpChanged) { n.style.translate = '0px 0px'; entry.dx = 0; entry.dy = 0; }
    if (entry.onLayout) entry.onLayout(L);
  }

  function layoutAll(force) {
    var bp = bpName();
    var changed = bp !== currentBp;
    if (!changed && !force) return;
    currentBp = bp;
    registry.forEach(function (entry) { applyLayout(entry, changed); });
  }

  var resizeT = null;
  function queueLayout() {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      layoutAll(true);
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }, 150);
  }
  window.addEventListener('resize', queueLayout, { passive: true });
  window.addEventListener('orientationchange', queueLayout);
  ['(max-width: 359px)', '(max-width: 767px)', '(max-width: 1023px)'].forEach(function (q) {
    var m = window.matchMedia(q);
    if (m.addEventListener) m.addEventListener('change', queueLayout);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { layoutAll(true); });
  }

  function register(node, cfg, onLayout) {
    node.style.setProperty('--enter-delay', (cfg.enterDelay || 500) + 'ms');
    if (cfg.label) node.setAttribute('aria-label', cfg.label);
    var entry = { node: node, cfg: cfg, onLayout: onLayout, dx: 0, dy: 0, hidden: false };
    registry.push(entry);
    return entry;
  }

  /* Draggable + click discrimination. onTap fires only when the
     pointer moved less than 6px — dragging never triggers actions. */
  function makeInteractive(entry, onTap) {
    var node = entry.node;
    var sx = 0, sy = 0, bx = 0, by = 0, dragging = false, moved = false;
    node.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true; moved = false;
      sx = e.clientX; sy = e.clientY; bx = entry.dx; by = entry.dy;
      try { node.setPointerCapture(e.pointerId); } catch (err) {}
      node.classList.add('is-dragging');
    });
    node.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var mx = e.clientX - sx, my = e.clientY - sy;
      if (Math.abs(mx) > 6 || Math.abs(my) > 6) moved = true;
      entry.dx = bx + mx; entry.dy = by + my;
      node.style.translate = entry.dx + 'px ' + entry.dy + 'px';
    });
    node.addEventListener('pointerup', function (e) {
      dragging = false;
      node.classList.remove('is-dragging');
      try { node.releasePointerCapture(e.pointerId); } catch (err) {}
      if (!moved && onTap) { markInteracted(); onTap(); }
    });
    node.addEventListener('pointercancel', function () {
      dragging = false; node.classList.remove('is-dragging');
    });
    node.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && onTap) { e.preventDefault(); markInteracted(); onTap(); }
    });
  }

  /* ─── furniture (decorative, parallax only) ─────────────────── */
  var parallaxNodes = [];
  function furniture(key) {
    var cfg = HERO_ASSETS[key];
    var node = el('div', 'ihero-furniture obj-' + key);
    node.setAttribute('aria-hidden', 'true');
    node.appendChild(img(cfg.img, key + 'img'));
    mount(node, cfg.group);
    register(node, cfg);
    if (cfg.plx) parallaxNodes.push({ node: node, f: cfg.plx });
  }
  furniture('rug');
  furniture('desk');
  furniture('shelf');

  /* ─── 1. AQUARIUM ───────────────────────────────────────────── */
  (function aquarium() {
    var cfg = HERO_ASSETS.aquarium;
    var node = el('button', 'ihero-obj obj-aquarium');
    node.type = 'button';
    var water = el('div', 'tank-water');
    water.appendChild(img(cfg.plant, 'tank-weed weed-a'));
    water.appendChild(img(cfg.plant, 'tank-weed weed-b'));
    var fishes = [];
    for (var i = 0; i < 3; i++) {
      var f = img(cfg.fish, 'tank-fish tank-fish-' + i);
      water.appendChild(f); fishes.push(f);
    }
    var bubbleWrap = el('div', 'tank-bubbles');
    water.appendChild(bubbleWrap);
    node.appendChild(img(cfg.tank, 'tankimg'));
    node.appendChild(water);
    mount(node, cfg.group);
    var entry = register(node, cfg);
    aquariumLit = function (on) { node.classList.toggle('lamp-lit', on); };

    var busy = false, bubbleT = null;
    makeInteractive(entry, function () {
      if (busy || reducedMotion) { node.classList.add('is-active'); setTimeout(function(){ node.classList.remove('is-active'); }, 1200); return; }
      busy = true;
      node.classList.add('is-active');
      var n = 0;
      bubbleT = setInterval(function () {
        var b = el('span', 'tank-bubble');
        b.style.left = (18 + Math.random() * 64) + '%';
        b.style.setProperty('--bdur', (1400 + Math.random() * 900) + 'ms');
        b.style.setProperty('--bsize', (4 + Math.random() * 5) + 'px');
        bubbleWrap.appendChild(b);
        setTimeout(function () { b.remove(); }, 2400);
        if (++n > 9) { clearInterval(bubbleT); bubbleT = null; }
      }, 320);
      setTimeout(function () {
        node.classList.remove('is-active');
        if (bubbleT) { clearInterval(bubbleT); bubbleT = null; }
        busy = false;
      }, 5200);
    });
  })();

  /* ─── 2. PLANT (and shelf small plant) ──────────────────────── */
  function growable(key) {
    var cfg = HERO_ASSETS[key];
    var node = el('button', 'ihero-obj obj-plant');
    node.type = 'button';
    node.appendChild(img(cfg.pot, 'plantimg'));
    var grown = el('div', 'plant-grown');
    node.appendChild(grown);
    mount(node, cfg.group);
    var entry = register(node, cfg);

    var leaves = [], CAP = 3, resetT = null;
    makeInteractive(entry, function () {
      if (leaves.length >= CAP) return;
      var leaf = img(cfg.leaf, 'plant-leaf');
      var spread = (leaves.length - 1) * 26 + (Math.random() * 10 - 5);
      leaf.style.setProperty('--lx', spread + 'px');
      leaf.style.setProperty('--lr', (leaves.length % 2 ? 14 : -14) + 'deg');
      grown.appendChild(leaf);
      requestAnimationFrame(function () { leaf.classList.add('is-grown'); });
      leaves.push(leaf);
      clearTimeout(resetT);
      resetT = setTimeout(function () {
        leaves.forEach(function (l) { l.classList.remove('is-grown'); });
        setTimeout(function () { leaves.forEach(function (l) { l.remove(); }); leaves = []; }, 500);
      }, 6000);
    });
  }
  growable('plant');

  /* ─── 3. LAMP ───────────────────────────────────────────────── */
  (function lamp() {
    var cfg = HERO_ASSETS.lamp;
    var node = el('button', 'ihero-obj obj-lamp');
    node.type = 'button';
    node.setAttribute('aria-pressed', 'false');
    node.appendChild(img(cfg.img, 'lampimg'));
    mount(node, cfg.group);
    var entry = register(node, cfg);

    var glow = el('div', 'lamp-glow');
    glow.setAttribute('aria-hidden', 'true');
    hero.appendChild(glow);

    var doodles = cfg.doodles.map(function (text, i) {
      var d = el('span', 'lamp-doodle', text);
      d.setAttribute('aria-hidden', 'true');
      d.style.left = 'calc(6% + ' + (i * 64) + 'px)';
      d.style.bottom = (150 + i * 30) + 'px';
      hero.appendChild(d);
      return d;
    });

    makeInteractive(entry, function () {
      var on = node.classList.toggle('is-on');
      node.setAttribute('aria-pressed', String(on));
      var hr = hero.getBoundingClientRect();
      var r = node.getBoundingClientRect();
      glow.style.left = (r.left - hr.left + r.width / 2 - 170) + 'px';
      glow.style.top = (r.top - hr.top - 30) + 'px';
      glow.classList.toggle('is-on', on);
      doodles.forEach(function (d) { d.classList.toggle('is-lit', on); });
      aquariumLit(on);   // cross-object: warm reflection on the tank glass
    });
  })();

  /* ─── 4. NOTEBOOK (decorative) ──────────────────────────────── */
  (function notebook() {
    var cfg = HERO_ASSETS.notebook;
    var node = el('div', 'ihero-obj obj-notebook');
    node.setAttribute('aria-hidden', 'true');
    var wrap = el('div', 'nb-wrap');
    wrap.appendChild(img(cfg.pages, 'nb-pages'));
    wrap.appendChild(el('div', 'nb-note', cfg.notes.map(function (n) { return '✦ ' + n; }).join('<br>')));
    node.appendChild(wrap);
    mount(node, cfg.group);
    register(node, cfg);
  })();

  /* ─── 5. CAMERA ─────────────────────────────────────────────── */
  (function camera() {
    var cfg = HERO_ASSETS.camera;
    var node = el('button', 'ihero-obj obj-camera');
    node.type = 'button';
    node.appendChild(img(cfg.img, 'camimg'));
    mount(node, cfg.group);
    var entry = register(node, cfg);

    var flash = el('div', 'camera-flash');
    flash.setAttribute('aria-hidden', 'true');
    document.body.appendChild(flash);

    var shot = 0, busy = false;
    makeInteractive(entry, function () {
      if (busy) return;
      busy = true;
      node.classList.add('is-snapping');
      if (!reducedMotion) {
        flash.classList.remove('is-flashing'); void flash.offsetWidth;
        flash.classList.add('is-flashing');
      }
      var hr = hero.getBoundingClientRect();
      var r = node.getBoundingClientRect();
      var photo = el('div', 'ihero-polaroid');
      photo.style.setProperty('--pr', (Math.random() * 10 - 5).toFixed(1) + 'deg');
      photo.style.left = (r.left - hr.left + r.width / 2 - 42) + 'px';
      photo.style.top = (r.top - hr.top - 30) + 'px';
      photo.appendChild(img(cfg.photos[shot++ % cfg.photos.length]));
      layer.appendChild(photo);
      requestAnimationFrame(function () {
        photo.classList.add('is-printed');
        setTimeout(function () { photo.classList.add('is-developed'); }, 250);
      });
      setTimeout(function () { node.classList.remove('is-snapping'); }, 200);
      setTimeout(function () {
        photo.style.opacity = '0';
        setTimeout(function () { photo.remove(); busy = false; }, 700);
      }, 3600);
    });
  })();

  /* ─── 6. HIKING BOOTS ───────────────────────────────────────── */
  (function shoes() {
    var cfg = HERO_ASSETS.shoes;
    var node = el('button', 'ihero-obj obj-shoes');
    node.type = 'button';
    var L = img(cfg.left, 'shoe shoe-l');
    var R = img(cfg.right, 'shoe shoe-r');
    node.appendChild(L); node.appendChild(R);
    mount(node, cfg.group);
    var entry = register(node, cfg);

    var busy = false;
    makeInteractive(entry, function () {
      if (busy) return;
      busy = true;
      var steps = reducedMotion ? 2 : 6;
      var i = 0, prints = [];
      function step() {
        if (i >= steps) return done();
        var shoe = i % 2 === 0 ? L : R;
        shoe.classList.add('stepping');
        var heroRect = hero.getBoundingClientRect();
        var rect = node.getBoundingClientRect();
        var fp = img(i % 2 === 0 ? cfg.footL : cfg.footR, 'ihero-footprint');
        fp.style.left = (rect.left - heroRect.left + (i % 2 ? 14 : 40)) + 'px';
        fp.style.top = (rect.bottom - heroRect.top - 14) + 'px';
        fp.style.rotate = (82 + (Math.random() * 14 - 7)) + 'deg';
        layer.appendChild(fp);
        requestAnimationFrame(function () { fp.classList.add('is-on'); });
        prints.push(fp);
        setTimeout(function () { shoe.classList.remove('stepping'); }, 480);
        i++;
        setTimeout(step, reducedMotion ? 600 : 420);
      }
      function done() {
        setTimeout(function () {
          prints.forEach(function (fp) { fp.classList.add('is-fading'); });
          setTimeout(function () { prints.forEach(function (fp) { fp.remove(); }); busy = false; }, 1200);
        }, 700);
      }
      step();
    });
  })();

  /* ─── 7. VINYL — play toggle + drag-to-scratch ──────────────── */
  (function vinyl() {
    var cfg = HERO_ASSETS.vinyl;
    var node = el('button', 'ihero-obj obj-vinyl');
    node.type = 'button';
    node.setAttribute('aria-pressed', 'false');
    node.appendChild(img(cfg.base, 'vt-base'));
    var record = img(cfg.record, 'vt-record');
    node.appendChild(record);
    node.appendChild(img(cfg.arm, 'vt-arm'));
    node.appendChild(el('div', 'vinyl-bars', '<i></i><i></i><i></i>'));
    mount(node, cfg.group);
    var entry = register(node, cfg);

    var playing = false, angle = 0, speed = 0, raf = null;
    var scratching = false, lastX = 0, scratchVel = 0;

    function spin() {
      if (scratching) {
        angle = (angle + scratchVel) % 360;
        record.style.transform = 'rotate(' + angle + 'deg)';
        scratchVel *= 0.82;
        raf = requestAnimationFrame(spin);
        return;
      }
      var targetSpeed = playing ? (reducedMotion ? 0.4 : 2.2) : 0;
      speed += (targetSpeed - speed) * 0.04;
      speed += scratchVel; scratchVel *= 0.7;
      angle = (angle + speed) % 360;
      record.style.transform = 'rotate(' + angle + 'deg)';
      if (Math.abs(speed) > 0.01 || playing || Math.abs(scratchVel) > 0.01) raf = requestAnimationFrame(spin);
      else raf = null;
    }
    function wake() { if (raf === null) raf = requestAnimationFrame(spin); }

    /* play / pause via tap on the whole turntable */
    makeInteractive(entry, function () {
      if (scratching) return;
      playing = !playing;
      node.classList.toggle('is-playing', playing);
      node.setAttribute('aria-pressed', String(playing));
      wake();
    });

    /* scratch: drag horizontally on the record itself */
    if (!reducedMotion) {
      record.style.pointerEvents = 'auto';
      var moved = false;
      record.addEventListener('pointerdown', function (e) {
        e.stopPropagation();      // don't move the object or toggle play
        scratching = true; moved = false; lastX = e.clientX; scratchVel = 0;
        node.classList.add('is-scratching');
        try { record.setPointerCapture(e.pointerId); } catch (err) {}
        wake();
      });
      record.addEventListener('pointermove', function (e) {
        if (!scratching) return;
        var dx = e.clientX - lastX; lastX = e.clientX;
        if (Math.abs(dx) > 3) moved = true;
        scratchVel = dx * 0.6;     // forward + backward scratching
      });
      ['pointerup', 'pointercancel'].forEach(function (ev) {
        record.addEventListener(ev, function (e) {
          if (!scratching) return;
          scratching = false;
          node.classList.remove('is-scratching');
          try { record.releasePointerCapture(e.pointerId); } catch (err) {}
          if (!moved) {            // a tap on the record toggles play too
            markInteracted();
            playing = !playing;
            node.classList.toggle('is-playing', playing);
            node.setAttribute('aria-pressed', String(playing));
          } else { markInteracted(); }
          wake();
        });
      });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden && raf !== null) { cancelAnimationFrame(raf); raf = null; }
      else if (!document.hidden && (playing || Math.abs(speed) > 0.01)) wake();
    });
  })();

  growable('smallplant');

  /* ─── FINAL_FINAL_FINAL FOLDER ──────────────────────────────── */
  (function folder() {
    var cfg = HERO_ASSETS.folder;
    var node = el('button', 'ihero-obj obj-folder');
    node.type = 'button';
    node.appendChild(img(cfg.img, 'folderimg'));
    node.appendChild(el('span', 'folder-label', 'Final_Final_Final'));
    mount(node, cfg.group);
    var entry = register(node, cfg);

    var busy = false;
    makeInteractive(entry, function () {
      if (busy) return;
      busy = true;
      var hr = hero.getBoundingClientRect();
      var r = node.getBoundingClientRect();
      var smallScreen = currentBp === 'small' || currentBp === 'mobile';
      var count = smallScreen || reducedMotion ? 3 : 4 + Math.floor(Math.random() * 2);
      var names = cfg.files.slice().sort(function () { return Math.random() - 0.5; }).slice(0, count);
      var cards = names.map(function (name, i) {
        var c = el('div', 'ihero-filecard', '▤ ' + name);
        c.style.left = (r.left - hr.left + 14) + 'px';
        c.style.top = (r.top - hr.top + 10) + 'px';
        var spread = reducedMotion ? 30 : 92;
        c.style.setProperty('--fx', (-spread - i * 22) + 'px');
        c.style.setProperty('--fy', (-20 - i * 30) + 'px');
        c.style.setProperty('--fr', (i % 2 ? 4 : -5) + 'deg');
        layer.appendChild(c);
        setTimeout(function () { c.classList.add('is-out'); }, 40 + i * 90);
        return c;
      });
      setTimeout(function () {
        cards.forEach(function (c, i) { setTimeout(function () { c.classList.remove('is-out'); }, i * 60); });
        setTimeout(function () { cards.forEach(function (c) { c.remove(); }); busy = false; }, 800);
      }, reducedMotion ? 1200 : 1800);
    });
  })();

  /* ─── 8. MASCOT (easter egg) ────────────────────────────────── */
  (function mascot() {
    var cfg = HERO_ASSETS.mascot;
    var node = el('button', 'ihero-obj obj-mascot');
    node.type = 'button';
    node.appendChild(img(cfg.img, 'mascotimg'));
    var bubble = el('span', 'mascot-bubble');
    bubble.setAttribute('aria-hidden', 'true');
    node.appendChild(bubble);
    mount(node, cfg.group);
    var entry = register(node, cfg);

    var busy = false;
    makeInteractive(entry, function () {
      if (busy) return;
      busy = true;
      node.classList.add('is-blinking');
      bubble.textContent = rand(cfg.phrases);
      bubble.classList.add('is-shown');
      setTimeout(function () { node.classList.remove('is-blinking'); }, 360);
      setTimeout(function () { bubble.classList.remove('is-shown'); }, 2200);
      setTimeout(function () { busy = false; }, 2400);
    });
  })();

  /* ─── FISHING ROD + FISH + CAT (easter egg) ─────────────────── */
  (function fishing() {
    var cfg = HERO_ASSETS.fishing;
    if (!cfg.layouts.desktop) return;
    var node = el('div', 'ihero-obj obj-fishing');
    node.appendChild(img(cfg.rod, 'rod'));
    var line = el('div', 'fishing-line');
    var fish = el('button', 'fishing-fish');
    fish.type = 'button';
    fish.setAttribute('aria-label', cfg.label);
    fish.appendChild(img(cfg.fish, 'fishimg'));
    node.appendChild(line); node.appendChild(fish);
    mount(node, cfg.group);

    var MAXLINE = 220, MINLINE = 50;
    var entry = register(node, cfg, function (L) {
      MAXLINE = L.line || 220; MINLINE = Math.round(MAXLINE * 0.22); place();
    });

    var progress = 0, target = 0, raf = null, holding = false;
    function place() {
      var len = MAXLINE - (MAXLINE - MINLINE) * progress;
      line.style.left = '16%'; line.style.top = '70%'; line.style.height = len + 'px';
      fish.style.left = 'calc(16% - 34px)';
      fish.style.top = 'calc(70% + ' + (len - 6) + 'px)';
      fish.classList.toggle('is-flapping', progress > 0.05);
    }
    function tick() {
      target = holding ? Math.min(1, target + 0.012) : Math.max(0, target - 0.02);
      progress += (target - progress) * 0.15;
      place(); maybeCat(progress);
      if (Math.abs(target - progress) > 0.002 || holding) raf = requestAnimationFrame(tick);
      else raf = null;
    }
    function wake() { if (raf === null) raf = requestAnimationFrame(tick); }

    fish.addEventListener('pointerdown', function (e) {
      e.stopPropagation(); markInteracted(); holding = true; wake();
      try { fish.setPointerCapture(e.pointerId); } catch (err) {}
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      fish.addEventListener(ev, function () { holding = false; wake(); });
    });
    fish.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); markInteracted();
        if (reducedMotion) { target = 0.8; progress = 0.8; place(); maybeCat(0.8);
          setTimeout(function () { target = 0; progress = 0; place(); }, 1200); }
        else { holding = true; wake(); setTimeout(function () { holding = false; }, 1400); }
      }
    });

    var catCfg = HERO_ASSETS.cat;
    var cat = el('div', 'ihero-cat');
    cat.setAttribute('aria-hidden', 'true');
    cat.appendChild(img(catCfg.peek));
    cat.appendChild(img(catCfg.paw, 'paw'));
    Object.keys(catCfg.pos).forEach(function (k) { cat.style[k] = catCfg.pos[k]; });
    hero.appendChild(cat);

    var catCooldown = false;
    function maybeCat(p) {
      if (p < 0.75 || catCooldown) return;
      catCooldown = true;
      cat.classList.add('is-peeking');
      setTimeout(function () { cat.classList.add('is-attacking'); }, reducedMotion ? 400 : 700);
      setTimeout(function () { cat.classList.remove('is-attacking'); cat.classList.remove('is-peeking'); }, reducedMotion ? 1400 : 2200);
      setTimeout(function () { catCooldown = false; }, 8000);
    }
    place();
  })();

  /* ─── pointer parallax (decorative furniture only) ──────────── */
  (function parallax() {
    if (reducedMotion || coarse || !parallaxNodes.length) return;
    var tx = 0, ty = 0, raf = null;
    function apply() {
      parallaxNodes.forEach(function (p) {
        p.node.style.translate = (tx * p.f / 100).toFixed(1) + 'px ' + (ty * p.f / 100).toFixed(1) + 'px';
      });
      raf = null;
    }
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2 * 30;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2 * 18;
      if (raf === null) raf = requestAnimationFrame(apply);
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (raf === null) raf = requestAnimationFrame(apply); });
  })();

  /* ─── interaction hint reveal (after entrance) ──────────────── */
  if (hint) {
    setTimeout(function () { if (!interacted) hint.classList.add('is-shown'); }, reducedMotion ? 200 : 1500);
  }

  /* ─── initial layout + entrance ─────────────────────────────── */
  layoutAll(true);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { hero.classList.add('is-in'); });
  });

  /* ─── GSAP scroll-disassembly (progressive enhancement) ─────── */
  function initScroll() {
    if (reducedMotion || !window.gsap || !window.ScrollTrigger) return;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    var st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4 };

    // light props leave first and furthest
    gsap.to(groups.light, { yPercent: -10, autoAlpha: 0, ease: 'none',
      scrollTrigger: Object.assign({}, st, { end: '55% top' }) });
    gsap.to(groups.light, { y: -70, ease: 'none',
      scrollTrigger: Object.assign({}, st, { end: '60% top' }) });

    // medium objects: smaller lift, slight shrink
    gsap.to(groups.medium, { y: -38, scale: 0.98, autoAlpha: 0, ease: 'none', transformOrigin: '50% 50%',
      scrollTrigger: Object.assign({}, st, { start: '12% top', end: '78% top' }) });

    // heavy furniture: grounded longest, minimal travel
    gsap.to(groups.heavy, { y: -16, autoAlpha: 0, ease: 'none',
      scrollTrigger: Object.assign({}, st, { start: '30% top', end: '95% top' }) });

    // central copy lifts + softens last (stays readable through most of scroll)
    gsap.to('.ihero-center', { y: -34, autoAlpha: 0.25, ease: 'none',
      scrollTrigger: Object.assign({}, st, { start: '60% top', end: 'bottom top' }) });

    window.ScrollTrigger.refresh();
  }

  if (window.gsap && window.ScrollTrigger) initScroll();
  else window.addEventListener('load', initScroll);
})();
