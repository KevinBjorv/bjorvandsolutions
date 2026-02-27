(() => {
  const platformIcons = [
    {
      key: "itch",
      iconPath: "/assets/images/icons/itchdotio.svg",
      altText: "itch.io",
      hostPattern: /(^|\.)itch\.io$/i
    },
    {
      key: "unity",
      iconPath: "/assets/images/icons/unity.svg",
      altText: "Unity",
      hostPattern: /(^|\.)assetstore\.unity\.com$/i
    },
    {
      key: "unity",
      iconPath: "/assets/images/icons/unity.svg",
      altText: "Unity",
      hostPattern: /(^|\.)u3d\.as$/i
    },
    {
      key: "google-play",
      iconPath: "/assets/images/icons/googleplay.svg",
      altText: "Google Play",
      hostPattern: /(^|\.)play\.google\.com$/i
    },
    {
      key: "apple-app-store",
      iconPath: "/assets/images/icons/apple.svg",
      altText: "App Store",
      hostPattern: /(^|\.)apps\.apple\.com$/i
    }
  ];

  const obviousExternalTextPattern =
    /https?:\/\/|www\.|\.com|\.dev|\.io|google play|app store|unity asset store|itch\.io|youtube|instagram|tiktok|skool|x\/|email|mailto/i;

  function parseUrl(href) {
    try {
      return new URL(href, window.location.origin);
    } catch (error) {
      return null;
    }
  }

  function isExternalAnchor(link) {
    const href = link.getAttribute("href");
    if (!href) {
      return false;
    }

    if (href.startsWith("mailto:")) {
      return true;
    }

    const url = parseUrl(href);
    if (!url || !(url.protocol === "http:" || url.protocol === "https:")) {
      return false;
    }

    return url.origin !== window.location.origin;
  }

  function shouldSkipIndicator(link) {
    if (link.dataset.externalIndicator === "off") {
      return true;
    }

    const text = (link.textContent || "").trim();
    return obviousExternalTextPattern.test(text);
  }

  function appendPlatformIcon(link, url) {
    if (!url || link.querySelector(".platform-icon")) {
      return;
    }

    const platform = platformIcons.find((item) => item.hostPattern.test(url.hostname));
    if (!platform) {
      return;
    }

    const icon = document.createElement("img");
    icon.className = `platform-icon platform-icon--${platform.key}`;
    icon.src = platform.iconPath;
    icon.alt = `${platform.altText} icon`;
    icon.loading = "lazy";
    link.prepend(icon);
    link.classList.add("link-with-platform-icon");
  }

  function appendExternalIndicator(link) {
    if (link.querySelector(".external-link-indicator")) {
      return;
    }

    const indicator = document.createElement("img");
    indicator.className = "external-link-indicator";
    indicator.src = "/external-link-svgrepo-com.svg";
    indicator.alt = "External link";
    indicator.loading = "lazy";
    link.append(indicator);
    link.classList.add("link-with-external-indicator");
  }

  function decorateLinks() {
    const links = Array.from(document.querySelectorAll("a[href]"));
    links.forEach((link) => {
      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      if (link.querySelector("img")) {
        return;
      }

      const href = link.getAttribute("href");
      const url = parseUrl(href);
      appendPlatformIcon(link, url);

      if (!isExternalAnchor(link) || shouldSkipIndicator(link)) {
        return;
      }

      appendExternalIndicator(link);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", decorateLinks, { once: true });
    return;
  }

  decorateLinks();
})();

