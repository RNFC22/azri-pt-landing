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
