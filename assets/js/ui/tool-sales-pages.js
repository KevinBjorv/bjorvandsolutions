(() => {
  const salesPage = document.querySelector(".sales-page");

  if (!salesPage) {
    return;
  }

  const revealSections = Array.from(salesPage.querySelectorAll(".reveal"));
  revealSections.forEach((section, index) => {
    section.style.setProperty("--reveal-order", `${index}`);
  });

  const staggerGroups = Array.from(salesPage.querySelectorAll("[data-stagger]"));
  staggerGroups.forEach((group) => {
    Array.from(group.children).forEach((child, index) => {
      if (child instanceof HTMLElement) {
        child.style.setProperty("--child-order", `${index}`);
      }
    });
  });

  const spotlightTargets = Array.from(
    salesPage.querySelectorAll("[data-spotlight]")
  );

  const setSpotlight = (element, clientX, clientY) => {
    const rect = element.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    element.style.setProperty("--spotlight-x", `${x}px`);
    element.style.setProperty("--spotlight-y", `${y}px`);
  };

  spotlightTargets.forEach((element) => {
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--spotlight-x", `${rect.width / 2}px`);
    element.style.setProperty("--spotlight-y", `${rect.height / 2}px`);

    element.addEventListener("pointermove", (event) => {
      setSpotlight(element, event.clientX, event.clientY);
    });

    element.addEventListener("pointerleave", () => {
      const nextRect = element.getBoundingClientRect();
      element.style.setProperty("--spotlight-x", `${nextRect.width / 2}px`);
      element.style.setProperty("--spotlight-y", `${nextRect.height / 2}px`);
    });
  });

  document.addEventListener("pointermove", (event) => {
    document.body.style.setProperty("--cursor-x", `${event.clientX}px`);
    document.body.style.setProperty("--cursor-y", `${event.clientY}px`);
  });
})();
