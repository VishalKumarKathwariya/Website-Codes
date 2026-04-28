document.addEventListener("DOMContentLoaded", () => {

  /* ═══════════════════════════════════════════
     GSAP + ScrollTrigger Registration
  ═══════════════════════════════════════════ */
  gsap.registerPlugin(ScrollTrigger);

  /* ═══════════════════════════════════════════
     HERO ANIMATION (plays immediately on load)
  ═══════════════════════════════════════════ */
  gsap.set(".animate-hero", { y: 40, opacity: 0 });
  gsap.set(".hero-glow", { opacity: 0, scale: 0.8 });

  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  heroTl
    .to(".hero-glow", {
      opacity: 1,
      scale: 1,
      duration: 1.5,
      stagger: 0.2
    })
    .to(".animate-hero", {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.15
    }, "-=1.2");


  /* ═══════════════════════════════════════════
     PROJECT GALLERY — GSAP ANIMATIONS
  ═══════════════════════════════════════════ */
  gsap.from(".pg-card", {
    opacity: 0,
    y: 56,
    duration: 0.75,
    ease: "power3.out",
    stagger: 0.1,
    scrollTrigger: {
      trigger: "#pgGrid",
      start: "top 88%",
      once: true
    }
  });

  document.querySelectorAll(".pg-card").forEach(card => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, { scale: 1.035, duration: 0.22, ease: "power2.out" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { scale: 1, duration: 0.22, ease: "power2.out" });
    });
  });


  /* ═══════════════════════════════════════════
     DESKTOP SIDEBAR TOGGLE
  ═══════════════════════════════════════════ */
  const sidebar  = document.getElementById("sidebar");
  const sbToggle = document.getElementById("sbToggle");

  if (sidebar && sbToggle) {
    sbToggle.addEventListener("click", () => {
      const open = sidebar.classList.toggle("open");
      sbToggle.setAttribute("aria-expanded", open);
    });
  }


  /* ═══════════════════════════════════════════
     MOBILE MENU TOGGLE
  ═══════════════════════════════════════════ */
  const mCard   = document.getElementById("mCard");
  const mToggle = document.getElementById("mToggle");
  const mNav    = document.getElementById("mobileNav");

  if (mCard && mToggle && mNav) {
    mToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = mCard.classList.toggle("open");
      mToggle.classList.toggle("active", open);
      mToggle.setAttribute("aria-expanded", open);
    });

    document.querySelectorAll(".m-link").forEach((l) =>
      l.addEventListener("click", closeMenu)
    );

    document.addEventListener("click", (e) => {
      if (!mNav.contains(e.target)) closeMenu();
    });

    function closeMenu() {
      mCard.classList.remove("open");
      mToggle.classList.remove("active");
      mToggle.setAttribute("aria-expanded", false);
    }
  }


  /* ═══════════════════════════════════════════
     HIDE MOBILE NAV ON SCROLL DOWN
  ═══════════════════════════════════════════ */
  let lastY = 0;
  const mNavEl = document.getElementById("mobileNav");

  window.addEventListener("scroll", () => {
    if (window.innerWidth >= 1024) return;
    const y = window.scrollY;
    if (mNavEl) mNavEl.classList.toggle("scrolled-down", y > lastY && y > 80);
    lastY = y;
  }, { passive: true });


  /* ═══════════════════════════════════════════
     SHARED SECTION HEADING ANIMATION
  ═══════════════════════════════════════════ */
  (function () {
    const sectionGroups = [
      { ids: ["hiwLbl", "hiwTtl", "hiwSub"] },
      { ids: ["pgLbl",  "pgTtl",  "pgSub"]  },
      { ids: ["ceoLbl", "ceoTtl"]            },
    ];

    const secObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const id = entry.target.id;
          const group = sectionGroups.find((g) => g.ids.includes(id));
          if (!group) return;

          group.ids.forEach((sibId, i) => {
            const el = document.getElementById(sibId);
            if (el) {
              setTimeout(() => el.classList.add("sec-in"), i * 110);
            }
          });

          group.ids.forEach((sibId) => {
            const el = document.getElementById(sibId);
            if (el) secObs.unobserve(el);
          });
        });
      },
      { threshold: 0.2 }
    );

    sectionGroups.forEach((group) => {
      const trigger = document.getElementById(group.ids[0]);
      if (trigger) secObs.observe(trigger);
    });
  })();


  /* ═══════════════════════════════════════════
     SKILLS SECTION — RINGS + STAT BARS
  ═══════════════════════════════════════════ */
  (function () {
    var CIRCUMFERENCE   = 251.33;
    var skPanels        = Array.from(document.querySelectorAll("#skillsPanels .panel"));
    var skNavItems      = Array.from(document.querySelectorAll("#skillsNav .nav-item"));
    var skAnimated      = {};
    var skCurrentActive = -1;

    function skAnimateBars(panel) {
      var idx = panel.getAttribute("data-idx");
      if (skAnimated[idx]) return;
      skAnimated[idx] = true;

      /* Animate circular progress rings */
      panel.querySelectorAll(".sk-ring-fill").forEach(function (circle) {
        var pct    = parseInt(circle.getAttribute("data-w"), 10);
        var offset = CIRCUMFERENCE * (1 - pct / 100);
        requestAnimationFrame(function () {
          setTimeout(function () { circle.style.strokeDashoffset = offset; }, 80);
        });
      });

      /* Animate stat bar fills */
      panel.querySelectorAll(".sk-stat-fill").forEach(function (fill) {
        var pct = parseInt(fill.getAttribute("data-w"), 10);
        requestAnimationFrame(function () {
          setTimeout(function () { fill.style.width = pct + "%"; }, 80);
        });
      });
    }

    function skSetActive(idx) {
      if (idx === skCurrentActive) return;
      skCurrentActive = idx;
      skNavItems.forEach(function (n) {
        n.classList.toggle("active", +n.getAttribute("data-idx") === idx);
      });
      skAnimateBars(skPanels[idx]);
    }

    var skObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            skSetActive(+entry.target.getAttribute("data-idx"));
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    skPanels.forEach(function (p) { skObserver.observe(p); });

    var skTicking = false;
    window.addEventListener("scroll", function () {
      if (skTicking) return;
      skTicking = true;
      requestAnimationFrame(function () {
        var trigger = window.innerHeight * 0.45;
        var best = 0;
        skPanels.forEach(function (p, i) {
          if (p.getBoundingClientRect().top <= trigger) best = i;
        });
        skSetActive(best);
        skTicking = false;
      });
    }, { passive: true });

    skNavItems.forEach(function (navItem) {
      navItem.addEventListener("click", function () {
        var idx  = +navItem.getAttribute("data-idx");
        var navH = document.getElementById("skillsNav").getBoundingClientRect().height;
        var top  = skPanels[idx].getBoundingClientRect().top + window.pageYOffset - navH;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    });

    skSetActive(0);
  })();


  /* ═══════════════════════════════════════════
     CERTIFICATE SECTION
  ═══════════════════════════════════════════ */
  (function () {

    const headObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("cert-in");
          headObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });

    ["certLbl", "certTtl", "certSub"].forEach(id => {
      const el = document.getElementById(id);
      if (el) headObs.observe(el);
    });

    const items = document.querySelectorAll(".cert-item");

    const certObs = new IntersectionObserver(entries => {
      const hitting = [...entries]
        .filter(e => e.isIntersecting && !e.target.classList.contains("cert-landed"))
        .sort((a, b) => [...items].indexOf(a.target) - [...items].indexOf(b.target));

      hitting.forEach((e, i) => {
        setTimeout(() => {
          e.target.classList.add("cert-landed");
          certObs.unobserve(e.target);
        }, i * 110);
      });
    }, { threshold: 0.12 });

    items.forEach(item => certObs.observe(item));

    const preview    = document.getElementById("certPreview");
    const previewImg = document.getElementById("previewImg");

    if (preview && previewImg) {
      document.addEventListener("mousemove", e => {
        const pw  = preview.offsetWidth  || 270;
        const ph  = preview.offsetHeight || 180;
        const gap = 22;
        let left  = e.clientX + gap;
        let top   = e.clientY - ph / 2;
        if (left + pw > window.innerWidth  - 12) left = e.clientX - pw - gap;
        if (top < 12)                             top  = 12;
        if (top + ph > window.innerHeight - 12)  top  = window.innerHeight - ph - 12;
        preview.style.left = left + "px";
        preview.style.top  = top  + "px";
      });

      items.forEach(item => {
        item.addEventListener("mouseenter", () => {
          previewImg.src = item.dataset.img;
          preview.classList.add("cert-visible");
        });
        item.addEventListener("mouseleave", () => {
          preview.classList.remove("cert-visible");
        });
      });
    }

  })();

}); // end DOMContentLoaded