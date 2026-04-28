/**
 * scroll.js — Vishal Kumar Portfolio
 * ─────────────────────────────────────────────────────────────
 * Source files merged here:
 *   • Navbar file      → Mobile nav hide on scroll-down
 *   • Certificates file → Heading fade-in + cert drop-in + preview
 *   • Skills file      → Nav active highlight + bar fill animation
 *   • Projects file    → GSAP ScrollTrigger card animations
 *
 * All original logic preserved exactly.
 * ─────────────────────────────────────────────────────────────
 */


/* ════════════════════════════════════════════════════════════
   SOURCE: Navbar file — Hide mobile nav on scroll down
   Adds .scrolled-down when scrolling down past 80px
   Only active on mobile widths (< 1024px)
════════════════════════════════════════════════════════════ */
let lastY = 0;
window.addEventListener('scroll', () => {
  if (window.innerWidth >= 1024) return;
  const y = window.scrollY;
  document.getElementById('mobileNav').classList.toggle('scrolled-down', y > lastY && y > 80);
  lastY = y;
}, { passive: true });


/* ════════════════════════════════════════════════════════════
   SOURCE: Certificates file — Heading elements fade in
   Watches #lbl, #ttl, #sub — adds class .in to trigger CSS
   opacity + translateY transition defined in style.css
════════════════════════════════════════════════════════════ */
const headObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.2 });

['lbl', 'ttl', 'sub'].forEach(id => {
  const el = document.getElementById(id);
  if (el) headObs.observe(el);
});


/* ════════════════════════════════════════════════════════════
   SOURCE: Certificates file — Cert items drop in one by one
   When items enter viewport they get .landed with stagger.
   Observer unsubscribes after trigger (animate once only).
════════════════════════════════════════════════════════════ */
const certItems = document.querySelectorAll('.cert-item');

const certObs = new IntersectionObserver(entries => {
  /* Sort entering items by DOM order so they drop in top→bottom */
  const hitting = [...entries]
    .filter(e => e.isIntersecting && !e.target.classList.contains('landed'))
    .sort((a, b) => [...certItems].indexOf(a.target) - [...certItems].indexOf(b.target));

  hitting.forEach((e, i) => {
    setTimeout(() => {
      e.target.classList.add('landed');
      certObs.unobserve(e.target);
    }, i * 110);  /* 110ms stagger between each row */
  });
}, { threshold: 0.12 });

certItems.forEach(item => certObs.observe(item));


/* ════════════════════════════════════════════════════════════
   SOURCE: Certificates file — Floating preview card
   Follows mouse cursor when hovering a cert-item.
   Preview positioned to stay within viewport bounds.
════════════════════════════════════════════════════════════ */
const preview    = document.getElementById('certPreview');
const previewImg = document.getElementById('previewImg');

/* Update preview card position on every mousemove */
document.addEventListener('mousemove', e => {
  const pw  = preview.offsetWidth  || 270;
  const ph  = preview.offsetHeight || 180;
  const gap = 22;
  let left  = e.clientX + gap;
  let top   = e.clientY - ph / 2;

  /* Keep within viewport */
  if (left + pw > window.innerWidth  - 12) left = e.clientX - pw - gap;
  if (top < 12)                             top  = 12;
  if (top + ph > window.innerHeight  - 12) top  = window.innerHeight - ph - 12;

  preview.style.left = left + 'px';
  preview.style.top  = top  + 'px';
});

/* Show/hide on cert item hover */
certItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    previewImg.src = item.dataset.img;
    preview.classList.add('visible');
  });
  item.addEventListener('mouseleave', () => {
    preview.classList.remove('visible');
  });
});


/* ════════════════════════════════════════════════════════════
   SOURCE: Skills file — Sticky nav highlight + bar animations
   IntersectionObserver picks the most-visible panel from each
   batch of entries (handles scroll-up and scroll-down correctly)
════════════════════════════════════════════════════════════ */
(function() {
  const panels   = Array.from(document.querySelectorAll('.panel'));
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const animated = {};  /* track which panels have had bars animated */

  /* Animate progress bars inside a panel (fires once per panel) */
  function animateBars(panel) {
    const idx = panel.getAttribute('data-idx');
    if (animated[idx]) return;
    animated[idx] = true;
    panel.querySelectorAll('.bar-fill').forEach(function(b) {
      const w = b.getAttribute('data-w');
      requestAnimationFrame(function() {
        setTimeout(function() { b.style.width = w + '%'; }, 60);
      });
    });
  }

  /* Update active nav item + trigger bar animation */
  function setActive(idx) {
    navItems.forEach(function(n) {
      n.classList.toggle('active', +n.getAttribute('data-idx') === idx);
    });
    animateBars(panels[idx]);
  }

  /* Pick the most-visible panel from the intersection batch */
  const io = new IntersectionObserver(function(entries) {
    let best = null, bestRatio = 0;
    entries.forEach(function(e) {
      if (e.isIntersecting && e.intersectionRatio > bestRatio) {
        bestRatio = e.intersectionRatio;
        best = e.target;
      }
    });
    if (best) setActive(+best.getAttribute('data-idx'));
  }, { threshold: [0.3, 0.6] });

  panels.forEach(function(p) { io.observe(p); });

  /* Click nav item → smooth scroll to panel */
  navItems.forEach(function(n) {
    n.addEventListener('click', function() {
      const idx = +n.getAttribute('data-idx');
      panels[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  /* Init first panel active */
  setActive(0);
})();


/* ════════════════════════════════════════════════════════════
   SOURCE: Projects file — GSAP ScrollTrigger animations
   Cards fade + slide up on scroll-into-view (staggered 120ms).
   Cards scale on hover.
   Gracefully skips if GSAP hasn't loaded (e.g. offline).
════════════════════════════════════════════════════════════ */
window.addEventListener('load', function() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* Stagger reveal on scroll */
  gsap.from('.project-card', {
    opacity: 0,
    y: 60,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.12,
    scrollTrigger: {
      trigger: '.projects-grid',
      start: 'top 85%',
      once: true,
    },
  });

  /* Hover scale (original code) */
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => { gsap.to(card, { scale: 1.05, duration: 0.25 }); });
    card.addEventListener('mouseleave', () => { gsap.to(card, { scale: 1,    duration: 0.25 }); });
  });
});