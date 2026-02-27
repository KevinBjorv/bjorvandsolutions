const searchInput = document.getElementById("docSearch");
const searchStatus = document.getElementById("searchStatus");
const emptyState = document.getElementById("emptyState");
const sections = Array.from(document.querySelectorAll("[data-section]"));
const navLinks = Array.from(document.querySelectorAll(".sidebar-link"));
const sectionById = new Map(sections.map((section) => [section.id, section]));
const linkById = new Map(
  navLinks.map((link) => {
    const id = link.getAttribute("href").replace("#", "");
    return [id, link];
  })
);

function normalize(value) {
  return value.toLowerCase().trim();
}

function applySearch() {
  const query = normalize(searchInput.value);
  let visibleCount = 0;

  sections.forEach((section) => {
    const searchableText = normalize(section.innerText);
    const matched = query.length === 0 || searchableText.includes(query);
    section.classList.toggle("is-hidden", !matched);
    section.hidden = !matched;

    const link = linkById.get(section.id);
    if (link) {
      link.classList.toggle("is-hidden", !matched);
    }

    if (matched) {
      visibleCount += 1;
    }
  });

  searchStatus.textContent = "Showing " + visibleCount + " section" + (visibleCount === 1 ? "" : "s");
  emptyState.classList.toggle("visible", visibleCount === 0);
}

function activateNavLink(id) {
  navLinks.forEach((link) => {
    const linkId = link.getAttribute("href").replace("#", "");
    link.classList.toggle("active", linkId === id);
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    const visibleEntries = entries
      .filter((entry) => entry.isIntersecting && !entry.target.hidden)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

    if (visibleEntries.length > 0) {
      activateNavLink(visibleEntries[0].target.id);
    }
  },
  {
    rootMargin: "-20% 0px -70% 0px",
    threshold: 0.01
  }
);

sections.forEach((section) => observer.observe(section));

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const id = link.getAttribute("href").replace("#", "");
    const target = sectionById.get(id);
    if (target && target.hidden) {
      searchInput.value = "";
      applySearch();
    }
  });
});

searchInput.addEventListener("input", applySearch);
applySearch();
activateNavLink("overview");
