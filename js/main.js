/**
 * Arya Kuwar Portfolio — main.js
 *
 * Security notes:
 *  - Zero use of innerHTML / outerHTML / document.write
 *  - Zero use of eval() / Function() / setTimeout(string)
 *  - All DOM reads use getElementById / querySelector (static IDs)
 *  - No dynamic script tag creation
 *  - No user-controlled data rendered to DOM
 *  - All event listeners passive where applicable
 *  - Canvas state sandboxed — only Math.random() + CSS string values written
 *  - rAF loop cancelled on page hide (Page Visibility API)
 *  - Resize handler debounced to prevent layout thrashing
 *  - No external fetch() calls
 */

'use strict';

/* ─────────────────────────────────────────────
   1. CUSTOM CURSOR
   ───────────────────────────────────────────── */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;

  // Only show custom cursor on pointer devices
  if (!window.matchMedia('(pointer: fine)').matches) {
    cursor.style.display = 'none';
    ring.style.display   = 'none';
    return;
  }

  let mx = -100, my = -100;
  let rx = -100, ry = -100;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  function animateCursor() {
    cursor.style.left = (mx - 6) + 'px';
    cursor.style.top  = (my - 6) + 'px';
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = (rx - 18) + 'px';
    ring.style.top  = (ry - 18) + 'px';
    rafId = requestAnimationFrame(animateCursor);
  }
  rafId = requestAnimationFrame(animateCursor);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(animateCursor);
    }
  });

  // Hover state — use class toggle, not inline style mutation
  document.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovered');
      ring.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovered');
      ring.classList.remove('hovered');
    });
  });
})();


/* ─────────────────────────────────────────────
   2. MATRIX CANVAS BACKGROUND
   ───────────────────────────────────────────── */
(function initMatrix() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  // Bail if reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  // Only katakana + hex safe characters — no < > to avoid any confusion
  const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789ABCDEF';
  const CHAR_ARR = CHARS.split('');
  const CHAR_LEN = CHAR_ARR.length;
  const COL_WIDTH = 20;

  let W, H, cols, drops;
  let matrixRaf;
  let lastFrame = 0;
  const FPS_TARGET = 25;
  const FRAME_INTERVAL = 1000 / FPS_TARGET;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const newCols = Math.floor(W / COL_WIDTH);
    if (!drops || newCols !== cols) {
      const old = drops ? drops.slice() : [];
      cols  = newCols;
      drops = Array.from({ length: cols }, (_, i) =>
        old[i] !== undefined ? old[i] : Math.random() * -50
      );
    }
  }

  function drawFrame(ts) {
    matrixRaf = requestAnimationFrame(drawFrame);
    if (ts - lastFrame < FRAME_INTERVAL) return;
    lastFrame = ts;

    // Fade trail
    ctx.fillStyle = 'rgba(5, 10, 14, 0.05)';
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < cols; i++) {
      const char = CHAR_ARR[Math.floor(Math.random() * CHAR_LEN)];
      const y = drops[i] * COL_WIDTH;
      const t = Math.random();

      if (t > 0.97) {
        ctx.fillStyle = '#ffffff';
      } else if (t > 0.85) {
        ctx.fillStyle = '#00d4ff';
      } else {
        // Safe: only integer values interpolated — no user input
        const g = 100 + Math.floor(Math.random() * 155);
        ctx.fillStyle = 'rgba(0,' + g + ',180,0.7)';
      }

      const sz = 12 + Math.floor(Math.random() * 4);
      ctx.font = sz + "px 'Share Tech Mono',monospace";
      ctx.fillText(char, i * COL_WIDTH, y);

      if (y > H && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.35;
    }
  }

  resize();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(matrixRaf);
    } else {
      lastFrame = 0;
      matrixRaf = requestAnimationFrame(drawFrame);
    }
  });

  matrixRaf = requestAnimationFrame(drawFrame);
})();


/* ─────────────────────────────────────────────
   3. TERMINAL 3D TILT ON MOUSEMOVE
   ───────────────────────────────────────────── */
(function initTilt() {
  const heroRight = document.querySelector('.hero-right');
  const terminal  = document.querySelector('.terminal');
  if (!heroRight || !terminal) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  heroRight.addEventListener('mousemove', (e) => {
    const rect = heroRight.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    // Values clamped to ±0.5 by definition — safe numeric strings
    terminal.classList.add('tilt-active');
    terminal.style.transform =
      'rotateY(' + (x * 16).toFixed(2) + 'deg) rotateX(' + (-y * 10).toFixed(2) + 'deg)';
  }, { passive: true });

  heroRight.addEventListener('mouseleave', () => {
    terminal.classList.remove('tilt-active');
    terminal.style.transform = '';
  });
})();


/* ─────────────────────────────────────────────
   4. SCROLL REVEAL (IntersectionObserver)
   ───────────────────────────────────────────── */
(function initReveal() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything immediately
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
})();


/* ─────────────────────────────────────────────
   5. SCROLL 3D CARD PARALLAX
   ───────────────────────────────────────────── */
(function initScrollParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function onScroll() {
    const cards = document.querySelectorAll('.project-card, .skill-group, .cert-card');
    const mid   = window.innerHeight / 2;
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = ((mid - center) / window.innerHeight);
      // Small bounded rotation — no user input
      card.style.transform = 'perspective(800px) rotateX(' + (dist * 3).toFixed(2) + 'deg)';
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ─────────────────────────────────────────────
   6. HERO NAME GLITCH EFFECT
   ───────────────────────────────────────────── */
(function initGlitch() {
  const heroName = document.querySelector('.hero-name');
  if (!heroName) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  setInterval(() => {
    // Toggle CSS class — no style string injection
    heroName.classList.add('glitch');
    setTimeout(() => heroName.classList.remove('glitch'), 80);
  }, 4000);
})();


/* ─────────────────────────────────────────────
   7. MOBILE NAV TOGGLE
   ───────────────────────────────────────────── */
(function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    // Animate hamburger bars
    const bars = toggle.querySelectorAll('span');
    if (isOpen) {
      bars[0].style.transform = 'translateY(7px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
    }
  });

  // Close nav on link click
  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      const bars = toggle.querySelectorAll('span');
      bars.forEach((b) => { b.style.transform = ''; b.style.opacity = ''; });
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();


/* ─────────────────────────────────────────────
   8. STAT COUNTER ANIMATION
   ───────────────────────────────────────────── */
(function initCounters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const el     = entry.target;
      const target = parseFloat(el.dataset.count);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const isFloat = el.dataset.float === 'true';
      const duration = 1200;
      const start = performance.now();

      function tick(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased    = 1 - Math.pow(1 - progress, 3);
        const val      = target * eased;
        el.textContent = prefix + (isFloat ? val.toFixed(2) : Math.floor(val)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => observer.observe(el));
})();
