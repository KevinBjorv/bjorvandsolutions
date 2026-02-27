(() => {
  const rawItems = Array.from(
    document.querySelectorAll("[data-gallery-item], .product-image")
  );

  if (!rawItems.length) {
    return;
  }

  const items = [];
  const seen = new Set();

  function getCaption(element) {
    const explicitCaption = (element.getAttribute("data-gallery-caption") || "").trim();
    if (explicitCaption) {
      return explicitCaption;
    }

    const parentFigure = element.closest("figure");
    const figureCaption = parentFigure ? parentFigure.querySelector("figcaption") : null;
    return figureCaption ? (figureCaption.textContent || "").trim() : "";
  }

  function isInteractiveElement(element) {
    const tagName = element.tagName;
    return (
      tagName === "A" ||
      tagName === "BUTTON" ||
      tagName === "INPUT" ||
      tagName === "SELECT" ||
      tagName === "TEXTAREA" ||
      tagName === "SUMMARY"
    );
  }

  rawItems.forEach((element) => {
    if (!(element instanceof HTMLElement) || seen.has(element)) {
      return;
    }

    seen.add(element);

    const isImage = element.tagName === "IMG";
    const nestedImage = !isImage ? element.querySelector("img") : null;
    const source =
      element.getAttribute("data-gallery-src") ||
      (isImage
        ? element.currentSrc || element.getAttribute("src") || ""
        : nestedImage
          ? nestedImage.currentSrc || nestedImage.getAttribute("src") || ""
          : "");
    const caption = getCaption(element);
    const altText =
      (element.getAttribute("data-gallery-alt") || "").trim() ||
      (isImage
        ? (element.getAttribute("alt") || "").trim()
        : nestedImage
          ? (nestedImage.getAttribute("alt") || "").trim()
          : caption);
    const placeholderMarkup =
      element.getAttribute("data-gallery-placeholder") ||
      element.innerHTML ||
      "<p>Preview unavailable.</p>";

    const index = items.length;
    items.push({
      source,
      caption,
      altText,
      placeholderMarkup
    });

    element.classList.add("gallery-trigger");

    if (!isInteractiveElement(element)) {
      element.setAttribute("role", "button");
      if (!element.hasAttribute("tabindex")) {
        element.tabIndex = 0;
      }
    }

    if (!element.hasAttribute("aria-label")) {
      const labelSource = altText || caption || `Preview item ${index + 1}`;
      element.setAttribute("aria-label", `Expand: ${labelSource}`);
    }

    const handleOpen = (event) => {
      event.preventDefault();
      openLightbox(index);
    };

    element.addEventListener("click", handleOpen);
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        handleOpen(event);
      }
    });
  });

  if (!items.length) {
    return;
  }

  const closeIconPath = "/assets/images/icons/return-button-svgrepo-com.svg";
  const leftIconPath = "/assets/images/icons/arrow-circle-left-svgrepo-com.svg";
  const rightIconPath = "/assets/images/icons/arrow-circle-right-svgrepo-com.svg";

  const lightbox = document.createElement("div");
  lightbox.className = "product-lightbox";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <div class="product-lightbox__backdrop" data-gallery-close></div>
    <div class="product-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Expanded media preview" tabindex="-1">
      <div class="product-lightbox__toolbar">
        <button class="product-lightbox__close" type="button" data-gallery-close aria-label="Back to page">
          <img class="product-lightbox__icon" src="${closeIconPath}" alt="">
          <span>Back</span>
        </button>
        <p class="product-lightbox__counter" aria-live="polite"></p>
      </div>
      <div class="product-lightbox__content">
        <button class="product-lightbox__nav product-lightbox__nav--prev" type="button" aria-label="Previous image">
          <img class="product-lightbox__icon" src="${leftIconPath}" alt="">
        </button>
        <figure class="product-lightbox__figure">
          <img class="product-lightbox__image" src="" alt="">
          <div class="product-lightbox__placeholder" hidden></div>
          <figcaption class="product-lightbox__caption"></figcaption>
        </figure>
        <button class="product-lightbox__nav product-lightbox__nav--next" type="button" aria-label="Next image">
          <img class="product-lightbox__icon" src="${rightIconPath}" alt="">
        </button>
      </div>
    </div>
  `;

  document.body.append(lightbox);

  const dialog = lightbox.querySelector(".product-lightbox__dialog");
  const backdrop = lightbox.querySelector(".product-lightbox__backdrop");
  const closeButtons = lightbox.querySelectorAll("[data-gallery-close]");
  const counter = lightbox.querySelector(".product-lightbox__counter");
  const prevButton = lightbox.querySelector(".product-lightbox__nav--prev");
  const nextButton = lightbox.querySelector(".product-lightbox__nav--next");
  const figure = lightbox.querySelector(".product-lightbox__figure");
  const image = lightbox.querySelector(".product-lightbox__image");
  const placeholder = lightbox.querySelector(".product-lightbox__placeholder");
  const caption = lightbox.querySelector(".product-lightbox__caption");

  if (
    !dialog ||
    !backdrop ||
    !counter ||
    !prevButton ||
    !nextButton ||
    !figure ||
    !image ||
    !placeholder ||
    !caption
  ) {
    return;
  }

  let activeIndex = 0;
  let isOpen = false;
  let closeTimer = null;
  let focusReturnTarget = null;
  let touchStartX = 0;
  let touchStartY = 0;

  function normalizeIndex(index) {
    const total = items.length;
    if (!total) {
      return 0;
    }
    return (index % total + total) % total;
  }

  function preloadAdjacent(index) {
    if (items.length < 2) {
      return;
    }

    [index - 1, index + 1].forEach((targetIndex) => {
      const candidate = items[normalizeIndex(targetIndex)];
      if (!candidate || !candidate.source) {
        return;
      }

      const preloadImage = new Image();
      preloadImage.src = candidate.source;
    });
  }

  function render(index) {
    activeIndex = normalizeIndex(index);
    const activeItem = items[activeIndex];
    const hasImage = Boolean(activeItem.source);

    figure.classList.remove("is-changing");
    void figure.offsetWidth;
    figure.classList.add("is-changing");

    if (hasImage) {
      image.hidden = false;
      image.src = activeItem.source;
      image.alt = activeItem.altText || "";
      placeholder.hidden = true;
      placeholder.innerHTML = "";
    } else {
      image.hidden = true;
      image.src = "";
      image.alt = "";
      placeholder.hidden = false;
      placeholder.innerHTML = activeItem.placeholderMarkup;
    }

    const displayCaption = activeItem.caption || activeItem.altText;
    caption.textContent = displayCaption || "";
    caption.hidden = !displayCaption;

    counter.textContent = `${activeIndex + 1} / ${items.length}`;

    const showNavigation = items.length > 1;
    prevButton.hidden = !showNavigation;
    nextButton.hidden = !showNavigation;

    preloadAdjacent(activeIndex);
  }

  function openLightbox(index) {
    focusReturnTarget = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }

    render(index);
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("gallery-open");

    requestAnimationFrame(() => {
      lightbox.classList.add("is-open");
      dialog.focus({ preventScroll: true });
    });

    isOpen = true;
    document.addEventListener("keydown", handleKeydown);
  }

  function closeLightbox() {
    if (!isOpen) {
      return;
    }

    isOpen = false;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gallery-open");
    document.removeEventListener("keydown", handleKeydown);

    closeTimer = window.setTimeout(() => {
      lightbox.hidden = true;
      closeTimer = null;
      if (focusReturnTarget && document.contains(focusReturnTarget)) {
        focusReturnTarget.focus({ preventScroll: true });
      }
    }, 280);
  }

  function showNext() {
    render(activeIndex + 1);
  }

  function showPrevious() {
    render(activeIndex - 1);
  }

  function handleKeydown(event) {
    if (!isOpen) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeLightbox();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    }
  }

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeLightbox);
  });

  prevButton.addEventListener("click", showPrevious);
  nextButton.addEventListener("click", showNext);

  figure.addEventListener(
    "touchstart",
    (event) => {
      if (!isOpen || !event.changedTouches[0]) {
        return;
      }

      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    },
    { passive: true }
  );

  figure.addEventListener("touchend", (event) => {
    if (!isOpen || items.length < 2 || !event.changedTouches[0]) {
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const horizontalThreshold = 48;

    if (
      Math.abs(deltaX) < horizontalThreshold ||
      Math.abs(deltaX) <= Math.abs(deltaY)
    ) {
      return;
    }

    if (deltaX > 0) {
      showPrevious();
    } else {
      showNext();
    }
  });
})();
