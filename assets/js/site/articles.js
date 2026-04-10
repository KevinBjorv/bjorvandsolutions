(() => {
  const cards = Array.from(document.querySelectorAll("[data-article-card]"));
  if (!cards.length) {
    return;
  }

  const sortSelect = document.querySelector("[data-article-sort]");
  const toolButtons = Array.from(document.querySelectorAll("[data-tool-filter]"));
  const categoryButtons = Array.from(document.querySelectorAll("[data-category-filter]"));
  const status = document.querySelector("[data-article-status]");
  const emptyState = document.querySelector("[data-article-empty]");
  const grid = document.querySelector("[data-articles-grid]");
  const params = new URLSearchParams(window.location.search);

  let activeTool = params.get("tool") || "all";
  let activeCategory = params.get("category") || "all";
  let activeSort = params.get("sort") || "newest";

  function compareCards(a, b) {
    const dateA = a.getAttribute("data-date") || "";
    const dateB = b.getAttribute("data-date") || "";
    const titleA = a.getAttribute("data-title") || "";
    const titleB = b.getAttribute("data-title") || "";

    if (activeSort === "oldest") {
      return dateA.localeCompare(dateB) || titleA.localeCompare(titleB);
    }

    if (activeSort === "title") {
      return titleA.localeCompare(titleB);
    }

    return dateB.localeCompare(dateA) || titleA.localeCompare(titleB);
  }

  function syncButtons(buttons, activeValue) {
    buttons.forEach((button) => {
      const value = button.getAttribute("data-filter-value");
      button.classList.toggle("is-active", value === activeValue);
      button.setAttribute("aria-pressed", value === activeValue ? "true" : "false");
    });
  }

  function updateQuery() {
    const next = new URLSearchParams();

    if (activeTool !== "all") {
      next.set("tool", activeTool);
    }

    if (activeCategory !== "all") {
      next.set("category", activeCategory);
    }

    if (activeSort !== "newest") {
      next.set("sort", activeSort);
    }

    const query = next.toString();
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
  }

  function applyState() {
    let visibleCount = 0;
    const visibleCards = cards.filter((card) => {
      const tool = card.getAttribute("data-tool");
      const category = card.getAttribute("data-category");
      const toolMatch = activeTool === "all" || tool === activeTool;
      const categoryMatch = activeCategory === "all" || category === activeCategory;
      const isVisible = toolMatch && categoryMatch;
      card.classList.toggle("is-hidden", !isVisible);
      card.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
      }
      return isVisible;
    });

    visibleCards.sort(compareCards).forEach((card) => grid.appendChild(card));

    if (status) {
      status.textContent = `Showing ${visibleCount} article${visibleCount === 1 ? "" : "s"}`;
    }

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visibleCount === 0);
    }

    if (sortSelect) {
      sortSelect.value = activeSort;
    }

    syncButtons(toolButtons, activeTool);
    syncButtons(categoryButtons, activeCategory);
    updateQuery();
  }

  toolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeTool = button.getAttribute("data-filter-value") || "all";
      applyState();
    });
  });

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.getAttribute("data-filter-value") || "all";
      applyState();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      activeSort = sortSelect.value || "newest";
      applyState();
    });
  }

  applyState();
})();
