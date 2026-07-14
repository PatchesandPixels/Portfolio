/* ═══════════════════════════════════════════════════════════════
   ABOUT.JS — toggles the About pop-down panel. Self-contained so it
   never collides with the shared nav script. The "About" nav item is
   a link to index.html#about: on this page we intercept the click and
   toggle the panel; from other pages the link lands here with #about
   and the panel opens on load.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var overlay = document.getElementById('about-overlay');
  if (!overlay) return;
  var toggles = document.querySelectorAll('[data-about-toggle]');
  var closeBtn = overlay.querySelector('.about-close-btn');
  var lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    overlay.classList.add('is-open');
    document.body.classList.add('about-open');
    toggles.forEach(function (t) { t.setAttribute('aria-expanded', 'true'); });
    if (closeBtn) closeBtn.focus();
  }
  function close() {
    overlay.classList.remove('is-open');
    document.body.classList.remove('about-open');
    toggles.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function isOpen() { return overlay.classList.contains('is-open'); }

  toggles.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      isOpen() ? close() : open();
    });
  });
  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) close(); });

  // open when arriving via #about (e.g. the About link from another page).
  // Commit the closed state with a forced reflow first so the open still
  // plays its transition, without depending on rAF timing.
  if (location.hash === '#about') {
    void overlay.offsetWidth;
    open();
  }
})();
