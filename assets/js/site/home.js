(() => {
  const triggers = Array.from(document.querySelectorAll("[data-bottleneck-trigger]"));
  const panels = Array.from(document.querySelectorAll("[data-bottleneck-panel]"));

  function activateBottleneck(value, moveFocus = false) {
    triggers.forEach((trigger) => {
      const active = trigger.dataset.bottleneckTrigger === value;
      trigger.setAttribute("aria-selected", String(active));
      trigger.tabIndex = active ? 0 : -1;
      if (active && moveFocus) trigger.focus();
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.bottleneckPanel !== value;
    });
  }

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => activateBottleneck(trigger.dataset.bottleneckTrigger));
    trigger.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % triggers.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + triggers.length) % triggers.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = triggers.length - 1;
      else return;

      event.preventDefault();
      activateBottleneck(triggers[nextIndex].dataset.bottleneckTrigger, true);
    });
  });

  const visual = document.querySelector("[data-release-visual]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");

  if (!visual || reducedMotion.matches) return;

  if (finePointer.matches) {
    visual.addEventListener("pointermove", (event) => {
      const rect = visual.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      visual.style.setProperty("--pointer-x", x.toFixed(3));
      visual.style.setProperty("--pointer-y", y.toFixed(3));
    });

    visual.addEventListener("pointerleave", () => {
      visual.style.setProperty("--pointer-x", "0");
      visual.style.setProperty("--pointer-y", "0");
    });
  }

  let framePending = false;
  function updateScrollShift() {
    framePending = false;
    const rect = visual.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const visualCenter = rect.top + rect.height / 2;
    const shift = Math.max(-8, Math.min(8, (visualCenter - viewportCenter) * -0.018));
    visual.style.setProperty("--scroll-shift", `${shift.toFixed(2)}px`);
  }

  window.addEventListener("scroll", () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateScrollShift);
  }, { passive: true });

  updateScrollShift();
})();
