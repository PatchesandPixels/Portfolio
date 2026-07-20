(function () {
  'use strict';

  var header = document.querySelector('#site-header');
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('#nav-links');

  if (!header || !navToggle || !navLinks) return;

  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }

  function closeMenu() {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('menu-locked');

    var workItem = header.querySelector('.nav-item--work');
    var workButton = header.querySelector('.nav-btn-work');
    if (workItem) workItem.classList.remove('is-open');
    if (workButton) workButton.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', function () {
    var isOpen = navToggle.getAttribute('aria-expanded') === 'true';

    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    navLinks.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('menu-locked', !isOpen);
  });

  navLinks.addEventListener('click', function (event) {
    if (event.target.matches('a')) closeMenu();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', function (event) {
    if (!header.contains(event.target)) closeMenu();
  });

  var desktopQuery = window.matchMedia('(min-width: 761px)');
  var handleDesktop = function (event) {
    if (event.matches) closeMenu();
  };

  if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', handleDesktop);
  else desktopQuery.addListener(handleDesktop);

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  (function workDropdown() {
    var item = header.querySelector('.nav-item--work');
    var button = header.querySelector('.nav-btn-work');
    if (!item || !button) return;

    function closeDropdown() {
      item.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    }

    button.addEventListener('click', function (event) {
      if (window.matchMedia('(max-width: 760px)').matches) return;
      event.stopPropagation();
      var isOpen = item.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', function (event) {
      if (!item.contains(event.target)) closeDropdown();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeDropdown();
    });
  })();

  (function hideOnScroll() {
    var lastScrollY = window.scrollY;
    var ticking = false;
    // Case-study pages tuck the header away sooner so the reading column
    // takes over faster; the homepage keeps a more forgiving threshold.
    var isCaseStudy = document.body.classList.contains('case-study');
    var hideThreshold = isCaseStudy ? 32 : 80;

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(function () {
        var currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > hideThreshold) {
          closeMenu();
          header.classList.add('nav--hidden');
        } else if (currentScrollY < lastScrollY) {
          // Only an actual upward scroll brings it back, so a timed
          // auto-hide near the top isn't undone by tiny downward jitter.
          header.classList.remove('nav--hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
    }, { passive: true });

    if (isCaseStudy) {
      // Arriving on a case study, tuck the nav away on a short timer — no
      // scroll required — so the story reads full-bleed. Skipped if the
      // reader scrolls or opens the menu before it fires.
      var autoHide = window.setTimeout(function () {
        if (!navLinks.classList.contains('is-open')) header.classList.add('nav--hidden');
      }, 1200);
      var cancelAutoHide = function () { window.clearTimeout(autoHide); };
      window.addEventListener('scroll', cancelAutoHide, { passive: true, once: true });
      navToggle.addEventListener('click', cancelAutoHide, { once: true });

      // The timed hide can land at the very top, where scrolling up can't
      // reveal it — so bring the nav back when the pointer nears the top edge.
      window.addEventListener('mousemove', function (event) {
        if (event.clientY <= 60 && !navLinks.classList.contains('is-open')) {
          header.classList.remove('nav--hidden');
        }
      }, { passive: true });
    }
  })();
})();
