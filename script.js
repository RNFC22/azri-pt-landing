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
