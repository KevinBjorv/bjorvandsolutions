const revealItems = document.querySelectorAll(".reveal");

if (revealItems.length) {
  const shouldShowImmediately =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    typeof window.IntersectionObserver !== "function";

  if (shouldShowImmediately) {
    revealItems.forEach((item) => item.classList.add("visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });

    revealItems.forEach((item) => observer.observe(item));
  }
}
