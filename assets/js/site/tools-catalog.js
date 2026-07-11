(() => {
  const cards = Array.from(document.querySelectorAll("[data-tool-card]"));
  const search = document.querySelector("[data-tool-search]");
  const filters = Array.from(document.querySelectorAll("[data-tool-filter]"));
  const statusSelect = document.querySelector("[data-tool-status]");
  const count = document.querySelector("[data-tool-count]");
  const empty = document.querySelector("[data-tool-empty]");
  const clearButtons = document.querySelectorAll("[data-tool-clear]");

  if (!cards.length || !(search instanceof HTMLInputElement) || !(statusSelect instanceof HTMLSelectElement)) return;

  const params = new URLSearchParams(window.location.search);
  const norwegian = document.documentElement.lang === "no";
  let activeCategory = params.get("category") || "all";
  let activeStatus = params.get("status") || "all";
  let query = params.get("q") || "";

  function normalized(value) {
    return value.toLocaleLowerCase().trim();
  }

  function syncUrl() {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (activeCategory !== "all") next.set("category", activeCategory);
    if (activeStatus !== "all") next.set("status", activeStatus);
    const value = next.toString();
    window.history.replaceState({}, "", value ? `${window.location.pathname}?${value}` : window.location.pathname);
  }

  function applyFilters() {
    const normalizedQuery = normalized(query);
    let visible = 0;

    cards.forEach((card) => {
      const categoryMatch = activeCategory === "all" || card.dataset.category === activeCategory;
      const statusMatch = activeStatus === "all" || card.dataset.status === activeStatus;
      const searchable = normalized(`${card.dataset.name || ""} ${card.dataset.search || ""} ${card.textContent || ""}`);
      const queryMatch = !normalizedQuery || searchable.includes(normalizedQuery);
      const show = categoryMatch && statusMatch && queryMatch;
      card.hidden = !show;
      if (show) visible += 1;
    });

    filters.forEach((filter) => {
      const selected = filter.dataset.toolFilter === activeCategory;
      filter.classList.toggle("is-active", selected);
      filter.setAttribute("aria-pressed", String(selected));
    });

    search.value = query;
    statusSelect.value = activeStatus;

    if (count) {
      count.textContent = norwegian
        ? `Viser ${visible} verktøy`
        : `Showing ${visible} ${visible === 1 ? "tool" : "tools"}`;
    }
    if (empty) empty.hidden = visible !== 0;
    syncUrl();
  }

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      activeCategory = filter.dataset.toolFilter || "all";
      applyFilters();
    });
  });

  search.addEventListener("input", () => {
    query = search.value.trim();
    applyFilters();
  });

  statusSelect.addEventListener("change", () => {
    activeStatus = statusSelect.value || "all";
    applyFilters();
  });

  clearButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = "all";
      activeStatus = "all";
      query = "";
      applyFilters();
      search.focus();
    });
  });

  applyFilters();
})();
