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

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(function () {
        var currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          closeMenu();
          header.classList.add('nav--hidden');
        } else {
          header.classList.remove('nav--hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
    }, { passive: true });
  })();
})();
