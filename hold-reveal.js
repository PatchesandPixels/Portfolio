(function () {
  const root = document.querySelector('.hold-reveal');
  if (!root) return;

  const control = root.querySelector('.hold-reveal__control');
  const completedContent = root.querySelector('.hold-reveal__completed-content');
  const copyButton = root.querySelector('.hold-reveal__copy');
  const emailLink = root.querySelector('.hold-reveal__email');
  const status = root.querySelector('.hold-reveal__status');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const email = emailLink.textContent.trim();

  const HOLD_DURATION = 1400;
  const RETURN_DURATION = 550;
  const SESSION_KEY = 'andy-email-revealed';

  let state = 'idle';
  let progress = 0;
  let frameId = 0;
  let copyTimer = 0;
  let holdStartedAt = 0;
  let holdStartProgress = 0;
  let activePointerId = null;
  let activeKey = null;
  let lastAnnouncedStep = -1;

  function setState(nextState) {
    state = nextState;
    root.dataset.state = nextState;
  }

  function setProgress(nextProgress) {
    progress = Math.max(0, Math.min(1, nextProgress));
    if (!reduceMotion.matches || progress === 0 || progress === 1) {
      root.style.setProperty('--reveal-progress', progress.toFixed(4));
    }
  }

  function announceProgress() {
    const step = Math.floor(progress * 10);
    if (step !== lastAnnouncedStep && step > 0 && step < 10) {
      lastAnnouncedStep = step;
      status.textContent = `Keep pouring… ${step * 10}%`;
    }
  }

  function cancelFrame() {
    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }

  function storeRevealedState() {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch (error) {
      // The revealed state still persists for this page if storage is blocked.
    }
  }

  function revealEmail(announce) {
    cancelFrame();
    setProgress(1);
    setState('revealed');
    root.classList.remove('is-holding');
    completedContent.setAttribute('aria-hidden', 'false');
    control.setAttribute('aria-label', 'Andy Nguyen email revealed');
    control.disabled = true;
    activePointerId = null;
    activeKey = null;
    storeRevealedState();
    if (announce) status.textContent = 'The cup is full. Email revealed. Copy or send an email to Andy Nguyen.';
  }

  function runHoldFrame(timestamp) {
    if (state !== 'holding') return;

    const remainingDuration = HOLD_DURATION * (1 - holdStartProgress);
    const elapsed = timestamp - holdStartedAt;
    const nextProgress = holdStartProgress + (elapsed / Math.max(1, remainingDuration)) * (1 - holdStartProgress);
    setProgress(nextProgress);
    announceProgress();

    if (progress >= 1) {
      revealEmail(true);
      return;
    }

    frameId = requestAnimationFrame(runHoldFrame);
  }

  function startHold(input, event) {
    if (state === 'revealed' || state === 'holding') return;
    if (input === 'keyboard' && event.repeat) return;

    cancelFrame();
    setState('holding');
    root.classList.add('is-holding');
    holdStartProgress = progress;
    holdStartedAt = performance.now();
    lastAnnouncedStep = Math.floor(progress * 10);

    if (input === 'pointer') {
      activePointerId = event.pointerId;
      if (control.setPointerCapture) control.setPointerCapture(event.pointerId);
    } else {
      activeKey = event.code;
    }

    status.textContent = 'Keep pouring…';
    frameId = requestAnimationFrame(runHoldFrame);
  }

  function runReturnFrame(startProgress, startedAt, timestamp) {
    if (state !== 'returning') return;

    const elapsed = Math.min(1, (timestamp - startedAt) / RETURN_DURATION);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    setProgress(startProgress * (1 - eased));

    if (elapsed >= 1) {
      setProgress(0);
      setState('idle');
      status.textContent = 'Pour cancelled. Press and hold to try again.';
      frameId = 0;
      return;
    }

    frameId = requestAnimationFrame(runReturnFrame.bind(null, startProgress, startedAt));
  }

  function cancelHold() {
    if (state !== 'holding') return;

    cancelFrame();
    root.classList.remove('is-holding');
    activePointerId = null;
    activeKey = null;
    setState('returning');
    const startProgress = progress;
    const startedAt = performance.now();
    frameId = requestAnimationFrame(runReturnFrame.bind(null, startProgress, startedAt));
  }

  async function copyEmail() {
    let copied = false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(email);
        copied = true;
      } catch (error) {
        copied = false;
      }
    }

    if (!copied) {
      const fallback = document.createElement('textarea');
      fallback.value = email;
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.appendChild(fallback);
      fallback.select();
      try {
        copied = document.execCommand('copy');
      } catch (error) {
        copied = false;
      }
      fallback.remove();
    }

    clearTimeout(copyTimer);
    copyButton.textContent = copied ? 'Copied' : 'Try again';
    status.textContent = copied ? `Copied ${email} to the clipboard.` : 'Email could not be copied. Use the Send link instead.';
    copyTimer = window.setTimeout(function () {
      copyButton.textContent = 'Copy';
    }, 1600);
  }

  control.addEventListener('pointerdown', function (event) {
    if (event.button !== 0 || !event.isPrimary) return;
    event.preventDefault();
    startHold('pointer', event);
  });

  control.addEventListener('pointerup', function (event) {
    if (activePointerId !== event.pointerId) return;
    if (control.hasPointerCapture && control.hasPointerCapture(event.pointerId)) {
      control.releasePointerCapture(event.pointerId);
    }
    cancelHold();
  });

  control.addEventListener('pointercancel', cancelHold);
  control.addEventListener('lostpointercapture', cancelHold);

  control.addEventListener('keydown', function (event) {
    if (event.code !== 'Space' && event.code !== 'Enter') return;
    event.preventDefault();
    startHold('keyboard', event);
  });

  control.addEventListener('keyup', function (event) {
    if (event.code !== activeKey) return;
    event.preventDefault();
    cancelHold();
  });

  copyButton.addEventListener('click', copyEmail);
  window.addEventListener('blur', cancelHold);

  window.addEventListener('pagehide', function () {
    cancelFrame();
    clearTimeout(copyTimer);
  });

  try {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') revealEmail(false);
  } catch (error) {
    // Storage is optional; the interaction works without it.
  }
})();
