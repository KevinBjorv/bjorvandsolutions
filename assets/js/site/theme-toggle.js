(() => {
  const root = document.documentElement;
  const storageKey = "site-theme";
  const toggles = Array.from(document.querySelectorAll("[data-theme-toggle]"));

  if (!toggles.length) {
    return;
  }

  function normalizeTheme(value) {
    return value === "light" ? "light" : "dark";
  }

  function applyTheme(theme) {
    const normalizedTheme = normalizeTheme(theme);
    const isDark = normalizedTheme === "dark";

    root.setAttribute("data-theme", normalizedTheme);

    toggles.forEach((toggle) => {
      const label = toggle.querySelector("[data-theme-label]");
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");

      if (label) {
        label.textContent = isDark ? "Dark" : "Light";
      }
    });
  }

  let theme = normalizeTheme(root.getAttribute("data-theme"));
  applyTheme(theme);

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      theme = theme === "dark" ? "light" : "dark";
      applyTheme(theme);

      try {
        localStorage.setItem(storageKey, theme);
      } catch (error) {
        // Ignore localStorage failures.
      }
    });
  });
})();