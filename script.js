// Reveal the pulse-line dividers as they scroll into view.
const dividers = document.querySelectorAll(".pulse-divider");

if (dividers.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  dividers.forEach((el) => observer.observe(el));
} else {
  dividers.forEach((el) => el.classList.add("is-visible"));
}

// The hero stays cream (matching the rest of the page) until real
// training photos exist at assets/hero-bg-1.jpg .. hero-bg-4.jpg. Each
// slot is probed independently, so any subset that exists still works;
// whichever slides actually load crossfade every ~4.5s, and the warm
// overlay only switches on once at least one photo is confirmed.
const hero = document.querySelector(".hero");
const slides = hero ? Array.from(hero.querySelectorAll(".hero__slide")) : [];

if (hero && slides.length) {
  const loaded = [];
  let outstanding = slides.length;

  slides.forEach((slide) => {
    const src = slide.dataset.src;
    const probe = new Image();

    probe.onload = () => {
      slide.style.backgroundImage = `url("${src}")`;
      if (slide.dataset.position) {
        slide.style.backgroundPosition = slide.dataset.position;
      }
      if (loaded.length === 0) {
        slide.classList.add("is-active");
      }
      loaded.push(slide);
      hero.classList.add("hero--photo");
      settle();
    };
    probe.onerror = settle;
    probe.src = src;

    function settle() {
      outstanding -= 1;
      if (outstanding === 0) startRotation();
    }
  });

  function startRotation() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (loaded.length < 2 || reducedMotion) return;

    let index = 0;
    setInterval(() => {
      loaded[index].classList.remove("is-active");
      index = (index + 1) % loaded.length;
      loaded[index].classList.add("is-active");
    }, 4500);
  }
}

// Testimonial carousel: arrow buttons, clickable dots, swipe on touch
// devices, and left/right arrow keys when the carousel has focus.
document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const viewport = carousel.querySelector("[data-viewport]");
  const track = carousel.querySelector("[data-track]");
  const slides = Array.from(track.children);
  const dotsContainer = carousel.querySelector("[data-dots]");
  const prevBtn = carousel.querySelector("[data-prev]");
  const nextBtn = carousel.querySelector("[data-next]");
  if (!track || slides.length < 2) return;

  let current = 0;

  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "testimonial-dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
    return dot;
  });

  function setHeight() {
    viewport.style.height = `${slides[current].offsetHeight}px`;
  }

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => dot.setAttribute("aria-selected", String(i === current)));
    setHeight();
  }

  window.addEventListener("resize", setHeight);

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));

  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goTo(current - 1);
    if (e.key === "ArrowRight") goTo(current + 1);
  });

  let touchStartX = null;
  viewport.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  viewport.addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 40) goTo(deltaX < 0 ? current + 1 : current - 1);
    touchStartX = null;
  });

  goTo(0);
});
