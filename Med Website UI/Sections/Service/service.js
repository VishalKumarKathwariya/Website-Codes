(function () {

  /* ── Config ── */
  const MOBILE_BP       = 428;                        // must match your CSS breakpoint
  const SCROLL_PER_CARD = window.innerHeight * 0.05;  // scroll px dedicated to each card entry
  const STICKY_TOP      = 80;                         // must match CSS: top: 80px

  /* ── DOM ── */
  const grid  = document.querySelector('.cards-grid');
  const cards = Array.from(grid.querySelectorAll('.service-card'));

  /* ── State ── */
  let active  = false;
  let spacers = [];

  /* ─────────────────────────────────────
     setup() — called when viewport ≤ 428px
     Injects spacers and enables sticky mode
  ───────────────────────────────────────*/
  function setup() {
    if (active) return;
    active = true;

    grid.classList.add('stack-ready');

    cards.forEach((card, i) => {

      // Later cards sit on top of earlier ones
      card.style.setProperty('--card-z', i + 1);

      // No spacer before the very first card
      if (i === 0) return;

      // Insert a spacer div BEFORE each card (except the first).
      // Without this, all cards snap into position instantly —
      // the spacer gives the page height so the previous card
      // has time to pin before this one scrolls in.
      const spacer = document.createElement('div');
      spacer.className = 'card-scroll-spacer';
      spacer.style.setProperty('--spacer-h', SCROLL_PER_CARD + 'px');
      grid.insertBefore(spacer, card);
      spacers.push(spacer);
    });
  }

  /* ─────────────────────────────────────
     teardown() — called when viewport > 428px
     Removes everything setup() added
  ───────────────────────────────────────*/
  function teardown() {
    if (!active) return;
    active = false;

    grid.classList.remove('stack-ready');

    // Remove every spacer div from the DOM
    spacers.forEach(s => s.remove());
    spacers = [];

    // Clear all inline CSS vars so cards go back to normal
    cards.forEach(card => {
      card.style.removeProperty('--card-z');
      card.style.removeProperty('--card-scale');
      card.style.removeProperty('--card-ty');
      card.style.removeProperty('--card-shadow-y');
      card.style.removeProperty('--card-shadow-b');
      card.style.removeProperty('--card-shadow-a');
    });
  }

  /* ─────────────────────────────────────
     onScroll() — fires on every scroll event
     Updates each card's visual depth based
     on how many cards are pinned on top of it
  ───────────────────────────────────────*/
  function onScroll() {
    if (!active) return;

    cards.forEach((card, i) => {

      // Count how many cards after this one are already pinned
      let stackDepth = 0;
      for (let j = i + 1; j < cards.length; j++) {
        const top = cards[j].getBoundingClientRect().top;
        if (top <= STICKY_TOP + 4) stackDepth++;
      }

      // Scale: shrink slightly for each card on top (floor at 0.82)
      const scale = Math.max(0.82, 1 - stackDepth * 0.04);

      // Peek: nudge upward so the buried card's edge shows
      const ty = stackDepth > 0 ? -(stackDepth * 10) : 0;

      // Shadow: gets deeper as more cards pile on
      const shadowY = 4  + stackDepth * 4;
      const shadowB = 16 + stackDepth * 8;
      const shadowA = Math.min(0.08 + stackDepth * 0.04, 0.22);

      card.style.setProperty('--card-scale',    scale);
      card.style.setProperty('--card-ty',       ty + 'px');
      card.style.setProperty('--card-shadow-y', shadowY + 'px');
      card.style.setProperty('--card-shadow-b', shadowB + 'px');
      card.style.setProperty('--card-shadow-a', shadowA);
    });
  }

  /* ─────────────────────────────────────
     checkBreakpoint() — decides whether
     to run setup or teardown based on width
  ───────────────────────────────────────*/
  function checkBreakpoint() {
    if (window.innerWidth <= MOBILE_BP) {
      setup();
    } else {
      teardown();
    }
  }

  /* ── Listeners ── */
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', checkBreakpoint);

  // Run once on page load
  checkBreakpoint();

})();