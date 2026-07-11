(() => {
  const platforms = [
    { key: "itch", icon: "/assets/images/icons/itchdotio.svg", label: "itch.io", host: /(^|\.)itch\.io$/i },
    { key: "unity", icon: "/assets/images/icons/unity.svg", label: "Unity Asset Store", host: /(^|\.)(assetstore\.unity\.com|u3d\.as)$/i },
    { key: "google-play", icon: "/assets/images/icons/googleplay.svg", label: "Google Play", host: /(^|\.)play\.google\.com$/i },
    { key: "apple-app-store", icon: "/assets/images/icons/apple.svg", label: "App Store", host: /(^|\.)apps\.apple\.com$/i },
  ];

  function parseUrl(href) {
    try {
      return new URL(href, window.location.origin);
    } catch {
      return null;
    }
  }

  function addPlatformIcon(link, platform) {
    if (!platform || link.querySelector(".platform-icon")) return;

    const icon = document.createElement("img");
    icon.className = `platform-icon platform-icon--${platform.key}`;
    icon.src = platform.icon;
    icon.alt = "";
    icon.width = 18;
    icon.height = 18;
    icon.loading = "lazy";
    icon.setAttribute("aria-hidden", "true");
    link.prepend(icon);
    link.classList.add("link-with-platform-icon");
    link.setAttribute("data-platform", platform.key);
  }

  function addExternalIndicator(link) {
    if (link.querySelector(".external-link-indicator") || link.classList.contains("menu-link")) return;

    const icon = document.createElement("i");
    icon.className = "external-link-indicator";
    icon.setAttribute("data-lucide", "arrow-up-right");
    icon.setAttribute("aria-hidden", "true");
    link.append(icon);
    link.classList.add("link-with-external-indicator");
  }

  function decorateLinks() {
    document.querySelectorAll("a[href]").forEach((link) => {
      if (!(link instanceof HTMLAnchorElement) || link.dataset.externalIndicator === "off") return;

      const url = parseUrl(link.getAttribute("href"));
      if (!url) return;

      const platform = platforms.find((item) => item.host.test(url.hostname));
      addPlatformIcon(link, platform);

      const external = url.protocol === "mailto:" || ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== window.location.origin);
      if (external && !platform) addExternalIndicator(link);
    });

    window.SiteIcons?.refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", decorateLinks, { once: true });
  } else {
    decorateLinks();
  }

  document.addEventListener("site:icons-ready", decorateLinks);
})();
