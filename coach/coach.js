(() => {
  document.documentElement.classList.remove("no-js");

  const progress = document.querySelector("[data-scroll-progress]");
  const stageInput = document.querySelector("[data-stage-input]");
  const messageInput = document.querySelector("[data-message-input]");
  const stageOutput = document.querySelector("[data-stage-output]");
  const messageOutput = document.querySelector("[data-message-output]");
  const faqItems = Array.from(document.querySelectorAll(".faq-list details"));

  function updateProgress() {
    if (!(progress instanceof HTMLProgressElement)) {
      return;
    }

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.value = Math.min(amount * 100, 100);
  }

  function updateSnapshot() {
    if (
      !(stageInput instanceof HTMLSelectElement) ||
      !(messageInput instanceof HTMLTextAreaElement) ||
      !(stageOutput instanceof HTMLElement) ||
      !(messageOutput instanceof HTMLElement)
    ) {
      return;
    }

    stageOutput.textContent = stageInput.value
      ? `Current stage: ${stageInput.value}.`
      : "Choose your current stage in the form.";

    const messageLength = messageInput.value.trim().length;
    messageOutput.textContent = messageLength > 0
      ? `Project note started: ${messageLength} characters.`
      : "Describe the game and where you are stuck.";
  }

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const link = event.target.closest('a[href^="#"]');

    if (!(link instanceof HTMLAnchorElement)) {
      return;
    }

    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);

    if (!(target instanceof HTMLElement)) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) {
        return;
      }

      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.open = false;
        }
      });
    });
  });

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  if (stageInput instanceof HTMLSelectElement) {
    stageInput.addEventListener("change", updateSnapshot);
  }

  if (messageInput instanceof HTMLTextAreaElement) {
    messageInput.addEventListener("input", updateSnapshot);
  }

  updateProgress();
  updateSnapshot();
})();
