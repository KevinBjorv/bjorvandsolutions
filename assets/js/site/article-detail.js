(() => {
  const links = Array.from(document.querySelectorAll("[data-article-toc-link]"));
  const sections = Array.from(document.querySelectorAll("[data-article-section]"));

  if (!links.length || !sections.length) {
    return;
  }

  const linkById = new Map(
    links.map((link) => {
      const id = (link.getAttribute("href") || "").replace("#", "");
      return [id, link];
    })
  );

  function activate(id) {
    links.forEach((link) => {
      const linkId = (link.getAttribute("href") || "").replace("#", "");
      link.classList.toggle("is-active", linkId === id);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (!visible.length) {
        return;
      }

      activate(visible[0].target.id);
    },
    {
      rootMargin: "-18% 0px -65% 0px",
      threshold: 0.01
    }
  );

  sections.forEach((section) => observer.observe(section));

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const id = (link.getAttribute("href") || "").replace("#", "");
      if (linkById.has(id)) {
        activate(id);
      }
    });
  });

  activate(sections[0].id);
})();
