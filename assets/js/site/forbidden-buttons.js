(() => {
  const ruleLab = document.querySelector("[data-fb-rule-lab]");

  if (ruleLab) {
    const buttons = Array.from(ruleLab.querySelectorAll("[data-fb-rule]"));
    const panels = Array.from(ruleLab.querySelectorAll("[data-fb-panel]"));

    const activate = (effect) => {
      ruleLab.dataset.activeEffect = effect;

      buttons.forEach((button) => {
        const isActive = button.dataset.fbRule === effect;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.fbPanel !== effect;
      });
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => activate(button.dataset.fbRule));
    });

    const initialEffect = ruleLab.dataset.activeEffect || buttons[0]?.dataset.fbRule;

    if (initialEffect) {
      activate(initialEffect);
    }
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    return;
  }

  document.querySelectorAll("[data-fb-parallax-root]").forEach((root) => {
    const reset = () => {
      root.style.setProperty("--fb-shift-x", "0");
      root.style.setProperty("--fb-shift-y", "0");
    };

    root.addEventListener("pointermove", (event) => {
      const rect = root.getBoundingClientRect();
      const offsetX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const offsetY = ((event.clientY - rect.top) / rect.height) * 2 - 1;

      root.style.setProperty("--fb-shift-x", offsetX.toFixed(3));
      root.style.setProperty("--fb-shift-y", offsetY.toFixed(3));
    });

    root.addEventListener("pointerleave", reset);
    root.addEventListener("pointercancel", reset);
  });
})();
