(() => {
  const root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  const toggleButton = document.querySelector("[data-mobile-nav-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-nav-panel]");

  function normalizePathname(pathname) {
    let normalized = (pathname || "/").replace(/\\/g, "/");
    normalized = normalized.replace(/\/index\.html$/i, "/");
    if (normalized.length > 1) {
      normalized = normalized.replace(/\/+$/, "");
    }
    return normalized || "/";
  }

  function refreshIcons() {
    if (!window.lucide || typeof window.lucide.createIcons !== "function") {
      return;
    }

    window.lucide.createIcons({
      attrs: {
        "aria-hidden": "true",
        focusable: "false",
      },
    });
  }

  window.SiteIcons = { refresh: refreshIcons };

  function loadLucide() {
    if (window.lucide) {
      refreshIcons();
      document.dispatchEvent(new CustomEvent("site:icons-ready"));
      return;
    }

    if (document.querySelector("script[data-lucide-runtime]")) {
      return;
    }

    const script = document.createElement("script");
    script.src = "/assets/js/vendor/lucide.min.js";
    script.async = true;
    script.dataset.lucideRuntime = "";
    script.addEventListener("load", () => {
      refreshIcons();
      document.dispatchEvent(new CustomEvent("site:icons-ready"));
    });
    document.head.append(script);
  }

  function iconNode(name, className = "") {
    const icon = document.createElement("i");
    icon.setAttribute("data-lucide", name);
    icon.setAttribute("aria-hidden", "true");
    if (className) {
      icon.className = className;
    }
    return icon;
  }

  function navIconForLink(link) {
    const href = link.getAttribute("href") || "";
    const text = (link.textContent || "").trim().toLowerCase();

    if (href.includes("smartindie.dev")) return "rocket";
    if (href.includes("bilagpilot.no")) return "receipt-text";
    if (/\/support\/?$/.test(href) || text === "support" || text === "støtte") return "life-buoy";
    if (/\/articles\/?$/.test(href) || text === "articles" || text === "artikler") return "book-open-text";
    if (/\/games\/?$/.test(href) || text === "games" || text === "spill") return "gamepad-2";
    if (/\/tools\/?$/.test(href) || text === "tools" || text === "verktøy") return "wrench";
    if (href === "/" || href === "/no/" || text === "home" || text === "hjem") return "house";
    return "arrow-right";
  }

  function decorateNavigation() {
    const links = document.querySelectorAll(".site-header .menu-link, .mobile-nav-single-link > a");
    links.forEach((link) => {
      if (link.querySelector("[data-nav-icon]")) {
        return;
      }

      const icon = iconNode(navIconForLink(link));
      icon.dataset.navIcon = "";
      link.prepend(icon);
    });

    document.querySelectorAll(".site-nav .menu-link[href^='https://bilagpilot.no']").forEach((link) => {
      link.closest(".menu-item")?.classList.add("menu-item-bilagpilot");
    });
  }

  function setMobileOpen(open) {
    if (!toggleButton || !mobilePanel) {
      return;
    }

    toggleButton.setAttribute("aria-expanded", String(open));
    mobilePanel.hidden = !open;
    document.body.classList.toggle("nav-open", open);

    const icon = toggleButton.querySelector("svg[data-lucide]") || toggleButton.querySelector("[data-lucide]");
    if (icon) {
      icon.setAttribute("data-lucide", open ? "x" : "menu");
      refreshIcons();
    }
  }

  function configureMobileNavigation() {
    if (!toggleButton || !mobilePanel) {
      return;
    }

    if (!toggleButton.querySelector("[data-lucide]")) {
      toggleButton.prepend(iconNode("menu"));
    }

    toggleButton.addEventListener("click", () => {
      setMobileOpen(toggleButton.getAttribute("aria-expanded") !== "true");
    });

    mobilePanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMobileOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 1025px)").matches) {
        setMobileOpen(false);
      }
    });
  }

  function markCurrentPage() {
    const currentPath = normalizePathname(window.location.pathname);
    const links = document.querySelectorAll(".site-header .menu-link, .mobile-nav-panel a");

    links.forEach((link) => {
      link.removeAttribute("aria-current");
      const href = link.getAttribute("href");
      if (!href) return;

      let url;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }

      if (url.origin === window.location.origin && normalizePathname(url.pathname) === currentPath && !url.hash) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function localizePath(pathname, language) {
    const currentPath = normalizePathname(pathname);
    const isNorwegian = currentPath === "/no" || currentPath.startsWith("/no/");
    const englishPath = isNorwegian ? normalizePathname(currentPath.replace(/^\/no/, "") || "/") : currentPath;
    const norwegianPaths = new Map([
      ["/", "/no/"],
      ["/tools", "/no/tools/"],
      ["/games", "/no/games/"],
      ["/support", "/no/support/"],
    ]);

    if (language === "no") return norwegianPaths.get(englishPath) || "/no/";
    if (englishPath === "/") return "/";
    return `${englishPath}/`.replace(/\/{2,}/g, "/");
  }

  function updateLanguageLinks() {
    const currentPath = normalizePathname(window.location.pathname);
    const currentLanguage = currentPath === "/no" || currentPath.startsWith("/no/") ? "no" : "en";

    document.querySelectorAll("[data-language-option]").forEach((link) => {
      const language = link.getAttribute("data-language-option");
      if (!language) return;
      link.href = localizePath(currentPath, language);
      if (language === currentLanguage) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function ensureFooterServiceLink() {
    const exploreSection = Array.from(document.querySelectorAll(".site-footer section")).find((section) => {
      const heading = section.querySelector("h2");
      return heading && ["explore", "utforsk"].includes(heading.textContent.trim().toLowerCase());
    });
    const list = exploreSection?.querySelector(".link-list");
    if (!list || list.querySelector("[data-footer-service-link='youtube-thumbnail-preview']")) return;

    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = "/youtube-thumbnail-preview/";
    link.textContent = "YouTube Thumbnail Preview";
    link.dataset.footerServiceLink = "youtube-thumbnail-preview";
    item.append(link);
    list.append(item);
  }

  const productContexts = [
    { match: "build-size-guard", names: ["build size guard"], icon: "/assets/images/BuildSizeGuard/icons/BuildSizeGuardIcon160.jpg" },
    { match: "shader-variant-budget-ci-guard", names: ["shader variant budget & ci guard"], icon: "/assets/images/ShaderVariantBudgetCIGuard/icons/Icon160.jpg" },
    { match: "unity-serialization-migration-guard", names: ["unity serialization migration guard", "serialization migration guard"], icon: "/assets/images/UnitySerializationMigrationGuard/icons/Icon160.jpg" },
    { match: "import-settings-validator-fix", names: ["import settings validator & fix"], icon: "/assets/images/ImportSettingsValidatorFix/icons/ImportSettingsValidatorFixIcon160.jpg" },
    { match: "compliance", names: ["compliance exporter", "third-party notices & credits"], icon: "/assets/images/CompliancePack/icons/IconcompliancePack160.jpg" },
    { match: "inspector-event-link-doctor", names: ["inspector event link doctor"], icon: "/assets/images/InspectorEventLinkDoctor/icons/Icon160.png" },
  ];

  function contextImage(context) {
    const image = document.createElement("img");
    image.className = "context-product-icon";
    image.src = context.icon;
    image.alt = "";
    image.width = 24;
    image.height = 24;
    image.loading = "lazy";
    image.setAttribute("aria-hidden", "true");
    return image;
  }

  function decorateProductContext() {
    const pathname = window.location.pathname.toLowerCase();
    const pageContext = productContexts.find((context) => pathname.includes(context.match));

    if (pageContext) {
      document.querySelectorAll(".article-chip").forEach((chip) => {
        if (!chip.querySelector(".context-product-icon")) chip.prepend(contextImage(pageContext));
      });

      const docsHeading = document.querySelector(".content .doc-card h1");
      if (docsHeading && !docsHeading.querySelector(".context-product-icon")) {
        docsHeading.prepend(contextImage(pageContext));
        docsHeading.classList.add("heading-with-product-icon");
      }
    }

    document.querySelectorAll(".article-tag, .article-chip").forEach((tag) => {
      if (tag.querySelector(".context-product-icon")) return;
      const label = (tag.textContent || "").trim().toLowerCase();
      const context = productContexts.find((item) => item.names.includes(label));
      if (context) tag.prepend(contextImage(context));
    });
  }

  function ensureSkipLink() {
    const main = document.querySelector("main");
    if (!main) return;
    if (!main.id) main.id = "main-content";
    if (document.querySelector(".skip-link")) return;

    const link = document.createElement("a");
    link.className = "skip-link";
    link.href = `#${main.id}`;
    link.textContent = document.documentElement.lang === "no" ? "Hopp til innhold" : "Skip to content";
    document.body.prepend(link);
  }

  ensureSkipLink();
  decorateNavigation();
  configureMobileNavigation();
  markCurrentPage();
  updateLanguageLinks();
  ensureFooterServiceLink();
  decorateProductContext();
  loadLucide();

  const year = String(new Date().getFullYear());
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = year;
  });

  const catalogDate = window.SiteCatalog?.snapshotDateLabel;
  if (catalogDate) {
    document.querySelectorAll("[data-catalog-date]").forEach((node) => {
      node.textContent = catalogDate;
    });
  }
})();
