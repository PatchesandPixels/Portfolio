// ─── Active nav link ──────────────────────────────────────────
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const map = {
    'index.html':            'work',
    '':                      'work',
    'tersus.html':           'work',
    'cure-quick-quote.html': 'work',
    'cure-scan-license.html':'work',
    'cure-my-account.html':  'work',
  };
  const active = map[page];
  if (active) {
    const link = document.querySelector(`.nav-link[data-page="${active}"]`);
    if (link) link.classList.add('active');
  }
})();

// ─── Hide nav on scroll down, reveal on scroll up ─────────────
(function () {
  const nav     = document.querySelector('.nav');
  const navRule = document.querySelector('.nav-rule');
  if (!nav) return;

  let lastScrollY = window.scrollY;
  let ticking     = false;

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          // Scrolling down — hide
          nav.classList.add('nav--hidden');
          if (navRule) navRule.classList.add('nav-rule--hidden');
        } else {
          // Scrolling up (or near top) — show
          nav.classList.remove('nav--hidden');
          if (navRule) navRule.classList.remove('nav-rule--hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();
