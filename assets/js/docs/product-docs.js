(() => {
  const searchInput = document.getElementById("docSearch");
  const searchStatus = document.getElementById("searchStatus");
  const emptyState = document.getElementById("emptyState");
  const sections = Array.from(document.querySelectorAll("[data-section]"));
  const navLinks = Array.from(document.querySelectorAll(".sidebar-link"));
  const sidebar = document.querySelector(".sidebar");
  const layout = document.querySelector(".layout");
  const norwegian = document.documentElement.lang === "no";
  const sectionById = new Map(sections.map((section) => [section.id, section]));
  const linkById = new Map(navLinks.map((link) => [(link.getAttribute("href") || "").replace("#", ""), link]));

  function normalize(value) {
    return (value || "").toLocaleLowerCase().trim();
  }

  function activateNavLink(id) {
    navLinks.forEach((link) => {
      const active = (link.getAttribute("href") || "").replace("#", "") === id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  function applySearch() {
    if (!(searchInput instanceof HTMLInputElement)) return;
    const query = normalize(searchInput.value);
    let visibleCount = 0;

    sections.forEach((section) => {
      const matched = !query || normalize(section.innerText).includes(query);
      section.hidden = !matched;
      section.classList.toggle("is-hidden", !matched);
      linkById.get(section.id)?.classList.toggle("is-hidden", !matched);
      if (matched) visibleCount += 1;
    });

    if (searchStatus) {
      searchStatus.textContent = norwegian
        ? `Viser ${visibleCount} ${visibleCount === 1 ? "seksjon" : "seksjoner"}`
        : `Showing ${visibleCount} ${visibleCount === 1 ? "section" : "sections"}`;
    }
    emptyState?.classList.toggle("visible", visibleCount === 0);
  }

  if (searchInput instanceof HTMLInputElement) {
    searchInput.addEventListener("input", applySearch);
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting && !entry.target.hidden)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) activateNavLink(visible[0].target.id);
    }, { rootMargin: "-18% 0px -72% 0px", threshold: 0.01 });
    sections.forEach((section) => observer.observe(section));
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const id = (link.getAttribute("href") || "").replace("#", "");
      const target = sectionById.get(id);
      if (target?.hidden && searchInput instanceof HTMLInputElement) {
        searchInput.value = "";
        applySearch();
      }
      activateNavLink(id);
      sidebar?.classList.remove("is-open");
      document.querySelector("[data-docs-menu-toggle]")?.setAttribute("aria-expanded", "false");
    });
  });

  function createMobileMenu() {
    if (!sidebar || !layout || document.querySelector("[data-docs-menu-toggle]")) return;
    if (!sidebar.id) sidebar.id = "docs-sidebar";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "docs-menu-toggle";
    button.dataset.docsMenuToggle = "";
    button.setAttribute("aria-controls", sidebar.id);
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = `<i data-lucide="list-tree" aria-hidden="true"></i><span>${norwegian ? "På denne siden" : "On this page"}</span>`;
    layout.prepend(button);

    button.addEventListener("click", () => {
      const open = !sidebar.classList.contains("is-open");
      sidebar.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
    });

    window.SiteIcons?.refresh();
  }

  function copyTextFallback(text) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.className = "sr-only";
    document.body.append(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    return copied;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return copyTextFallback(text);
  }

  function enhanceCodeBlocks() {
    document.querySelectorAll("pre").forEach((pre) => {
      if (pre.parentElement?.classList.contains("code-block")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "code-block";
      pre.before(wrapper);
      wrapper.append(pre);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-button";
      button.innerHTML = `<i data-lucide="copy" aria-hidden="true"></i><span>${norwegian ? "Kopier" : "Copy"}</span>`;
      button.setAttribute("aria-label", norwegian ? "Kopier kode" : "Copy code");
      wrapper.append(button);

      button.addEventListener("click", async () => {
        try {
          await copyText(pre.innerText);
          button.classList.add("is-copied");
          button.querySelector("span").textContent = norwegian ? "Kopiert" : "Copied";
          window.setTimeout(() => {
            button.classList.remove("is-copied");
            button.querySelector("span").textContent = norwegian ? "Kopier" : "Copy";
          }, 1800);
        } catch {
          button.querySelector("span").textContent = norwegian ? "Kunne ikke kopiere" : "Copy failed";
        }
      });
    });
    window.SiteIcons?.refresh();
  }

  function enhanceTables() {
    document.querySelectorAll(".doc-card table").forEach((table) => {
      if (table.parentElement?.classList.contains("table-scroll")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "table-scroll";
      wrapper.tabIndex = 0;
      wrapper.setAttribute("role", "region");
      wrapper.setAttribute("aria-label", norwegian ? "Rullbar tabell" : "Scrollable table");
      table.before(wrapper);
      wrapper.append(table);
    });
  }

  function createReadingProgress() {
    if (document.querySelector(".docs-reading-progress")) return;
    const progress = document.createElement("div");
    progress.className = "docs-reading-progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.append(progress);

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const value = Math.min(100, Math.max(0, window.scrollY / scrollable * 100));
      progress.style.setProperty("--docs-progress", `${value.toFixed(2)}%`);
    };

    window.addEventListener("scroll", () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  applySearch();
  activateNavLink(window.location.hash.replace("#", "") || sections[0]?.id || "");
  createMobileMenu();
  enhanceCodeBlocks();
  enhanceTables();
  createReadingProgress();
})();
