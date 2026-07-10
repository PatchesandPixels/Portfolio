/* ════════════════════════════════════════════════════════════════
   NAV.JS — shared site-wide navigation behavior, loaded on every page.
   Two independent, progressively-enhanced pieces:
     1. mobile hamburger  — toggles the .nav--home dropdown panel
     2. Work dropdown      — the case-study menu (click to open)
   All markup works without JS (links are real <a>s); this only adds
   the open/close affordances.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var nav = document.querySelector('.nav');
  if (!nav) return;

  /* ── 1. mobile hamburger ── */
  (function hamburger() {
    var btn = document.getElementById('navMenuBtn');
    var links = document.getElementById('navLinks');
    if (!btn || !links) return;

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
    // close when a link is chosen, on Escape, or on an outside tap
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('menu-open') && !nav.contains(e.target)) setOpen(false);
    });
    // reset when growing back to desktop so state can't get stuck
    var mq = window.matchMedia('(min-width: 768px)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function (m) {
      if (m.matches) setOpen(false);
    });
  })();

  /* ── 2. Work dropdown (case-study menu) ── */
  (function workDropdown() {
    var item = nav.querySelector('.nav-item--work');
    var btn = item && item.querySelector('.nav-btn-work');
    if (!item || !btn) return;

    function close() {
      item.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (!item.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  })();
})();
