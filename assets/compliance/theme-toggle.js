(() => {
  const storageKey = "assets-theme";
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");

  if (!toggle) {
    return;
  }

  const icon = toggle.querySelector(".theme-toggle-icon");
  const label = toggle.querySelector(".theme-toggle-label");
  const sunIcon = toggle.getAttribute("data-sun-icon") || "";
  const moonIcon = toggle.getAttribute("data-moon-icon") || "";

  function normalizeTheme(value) {
    return value === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    const normalizedTheme = normalizeTheme(theme);
    const isDark = normalizedTheme === "dark";

    root.setAttribute("data-theme", normalizedTheme);
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");

    if (icon) {
      icon.src = isDark ? sunIcon : moonIcon;
      icon.alt = isDark ? "Sun icon" : "Moon icon";
    }

    if (label) {
      label.textContent = isDark ? "Light" : "Dark";
    }
  }

  let storedTheme = "light";
  try {
    storedTheme = localStorage.getItem(storageKey) || "light";
  } catch (error) {
    storedTheme = "light";
  }

  applyTheme(storedTheme);

  toggle.addEventListener("click", () => {
    const currentTheme = normalizeTheme(root.getAttribute("data-theme"));
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);

    try {
      localStorage.setItem(storageKey, nextTheme);
    } catch (error) {
      // Ignore storage failures (private browsing or blocked storage).
    }
  });
})();
