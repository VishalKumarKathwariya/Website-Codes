const DATA = [
  {
    img: "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=800&q=80",
    label: "Vaccine Research Lab",
    tag: "Immunology · 2023",
    title: "Vaccine Research Lab Studies",
    desc: "Advanced mRNA adjuvant platforms tested in our lab show 3× faster immune activation, redefining pandemic preparedness timelines.",
  },
  {
    img: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80",
    label: "Neurological Sample Analysis",
    tag: "Neurology · 2023",
    title: "Neurological Sample Analysis",
    desc: "Biomarker-driven neural screening allows detection of early-onset neurodegenerative conditions up to 4 years before clinical symptoms appear.",
  },
  {
    img: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80",
    label: "Cancer Testing Machine 2023",
    tag: "Oncology · 2023",
    title: "Cancer Testing Machine 2023 in our Lab",
    desc: "Our latest oncology machine delivers biopsy-level precision at a fraction of the cost, enabling mass early-stage cancer screening.",
  },
  {
    img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
    label: "Genomic Pattern Studies",
    tag: "Genomics · 2022",
    title: "Post-COVID Genomic Pattern Studies",
    desc: "Post-COVID genomic drift studies reveal long-term cellular mutations, reshaping personalised medicine and future antiviral strategies.",
  },
  {
    img: "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=800&q=80",
    label: "Reagent Purity Testing",
    tag: "Pathology · 2023",
    title: "Reagent Purity Testing Standards",
    desc: "High-purity reagent sourcing directly impacts diagnostic accuracy — Patholab outlines the critical benchmarks every laboratory must meet.",
  },
  {
    img: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&q=80",
    label: "Microbiology Culture Lab",
    tag: "Microbiology · 2022",
    title: "Microbiology Culture Lab Research",
    desc: "Novel culture techniques developed here reduce contamination rates by 62%, setting a new benchmark for sterile lab environments worldwide.",
  },
  {
    img: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800&q=80",
    label: "Blood Sample Diagnostics",
    tag: "Diagnostics · 2023",
    title: "Advanced Blood Sample Diagnostics",
    desc: "Automated blood panel analysis cuts result turnaround to under 90 minutes while maintaining 99.4% accuracy across 42 diagnostic markers.",
  },
];

const track = document.getElementById("track");
const dotsWrap = document.getElementById("dots");
const btnPrev = document.querySelector(".arrow-prev");
const btnNext = document.querySelector(".arrow-next");

const GAP = 22;
const AUTO_MS = 2800;
const SPEED = 520; // ms

let current = 0; // logical index (0 … DATA.length-1)
let pos = 0; // actual DOM position (includes prepended clones)
let busy = false;
let timer;

/* ── Visible slides by breakpoint ── */
function vc() {
  if (window.innerWidth <= 580) return 1;
  if (window.innerWidth <= 900) return 2;
  return 3;
}

/* ── Slide width in px ── */
function slideW() {
  const peek = vc() === 1 ? 16 : vc() === 2 ? 36 : 72;
  const total = track.parentElement.offsetWidth;
  return (total - (vc() - 1) * GAP - peek * 2) / vc();
}

/* ── Build one slide DOM node ── */
function makeSlide(d) {
  const s = document.createElement("div");
  s.className = "slide";
  s.style.width = slideW() + "px";

  s.innerHTML = `
      <img src="${d.img}" alt="${d.label}" loading="lazy"/>
      <div class="slide-label">${d.label}</div>
      <div class="slide-hover">
        <span class="hover-tag">${d.tag}</span>
        <h3 class="hover-title">${d.title}</h3>
        <p class="hover-desc">${d.desc}</p>
        <a href="#" class="hover-btn">
          Read More
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>`;
  return s;
}

/* ── Build track: [clone-tail … originals … clone-head] ── */
function build() {
  track.innerHTML = "";
  const N = DATA.length;
  const C = N; // clone count on each side (full set = seamless)

  const all = [
    ...DATA.slice(N - C), // tail clones  → prepended
    ...DATA, // originals
    ...DATA.slice(0, C), // head clones  → appended
  ];

  all.forEach((d) => track.appendChild(makeSlide(d)));

  // pos: where we sit in the DOM array. originals start at index C.
  pos = C + current;
  setPos(false);
}

/* ── Set transform (no animation by default) ── */
function setPos(animate) {
  const N = DATA.length;
  const sw = slideW();
  const off = vc() === 1 ? 16 : vc() === 2 ? 36 : 72; // left peek gap
  const x = pos * (sw + GAP) - off;

  track.style.transition = animate
    ? `transform ${SPEED}ms cubic-bezier(.4,0,.2,1)`
    : "none";
  track.style.transform = `translateX(-${x}px)`;
}

/* ── Update slide widths on resize ── */
function resizeSlides() {
  const sw = slideW();
  track.querySelectorAll(".slide").forEach((s) => (s.style.width = sw + "px"));
  setPos(false);
}

/* ── Dots ── */
function buildDots() {
  dotsWrap.innerHTML = "";
  DATA.forEach((_, i) => {
    const d = document.createElement("button");
    d.className = "dot" + (i === current ? " active" : "");
    d.addEventListener("click", () => moveTo(i));
    dotsWrap.appendChild(d);
  });
}
function syncDots() {
  dotsWrap
    .querySelectorAll(".dot")
    .forEach((d, i) => d.classList.toggle("active", i === current));
}

/* ── Move by delta (+1 / -1) ── */
function move(delta) {
  if (busy) return;
  busy = true;

  const N = DATA.length;
  pos += delta;
  current = (((current + delta) % N) + N) % N;
  syncDots();
  setPos(true);
}

/* ── Move to exact logical index ── */
function moveTo(idx) {
  if (busy) return;
  busy = true;
  const N = DATA.length;
  const C = N;
  pos = C + idx;
  current = idx;
  syncDots();
  setPos(true);
}

/* ── After each transition: silently jump to canonical position ── */
track.addEventListener("transitionend", () => {
  const N = DATA.length;
  const C = N;

  // jump back to real range silently
  if (pos < C || pos >= C + N) {
    pos = C + current;
    setPos(false); // instant
  }
  busy = false;
});

/* ── Auto-play ── */
function startAuto() {
  timer = setInterval(() => move(1), AUTO_MS);
}
function stopAuto() {
  clearInterval(timer);
}
function resetAuto() {
  stopAuto();
  startAuto();
}

btnPrev.addEventListener("click", () => {
  move(-1);
  resetAuto();
});
btnNext.addEventListener("click", () => {
  move(+1);
  resetAuto();
});

/* ── Pause on hover ── */
track.parentElement.addEventListener("mouseenter", stopAuto);
track.parentElement.addEventListener("mouseleave", startAuto);

/* ── Touch swipe ── */
let tx = 0;
track.addEventListener(
  "touchstart",
  (e) => {
    tx = e.touches[0].clientX;
  },
  { passive: true },
);
track.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - tx;
  if (Math.abs(dx) > 40) {
    move(dx < 0 ? 1 : -1);
    resetAuto();
  }
});

/* ── Resize ── */
let rt;
window.addEventListener("resize", () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    build();
    buildDots();
  }, 180);
});

/* ── Init ── */
build();
buildDots();
startAuto();
