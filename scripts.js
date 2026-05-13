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
