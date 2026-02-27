(() => {
  const root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  const isDesktop = () => window.matchMedia("(min-width: 1025px)").matches;
  const triggers = Array.from(document.querySelectorAll("[data-nav-trigger]"));
  const items = Array.from(document.querySelectorAll(".menu-item"));
  const siteNav = document.querySelector(".site-nav");
  const toggleButton = document.querySelector("[data-mobile-nav-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-nav-panel]");
  const hoverCloseDelayMs = 200;
  const hoverIntentDelayMs = 170;
  const hoverIntentPollMs = 40;
  const pointerHistoryLimit = 8;
  const pointerLookbackMs = 120;
  const pointerSpeedMin = 0.02;
  const pointerSpeedMax = 1.6;
  const safeZonePadding = 14;
  const triggerProximityPadding = 22;

  let activeMenuId = "";
  let hoveredMenuId = "";
  let openTimerId = null;
  let closeTimerId = null;
  const pointerHistory = [];
  const triggerIds = triggers
    .map((trigger) => trigger.getAttribute("data-nav-trigger"))
    .filter((id) => Boolean(id));

  function getMenuById(id) {
    return document.querySelector(`[data-nav-menu="${id}"]`);
  }

  function getTriggerById(id) {
    return document.querySelector(`[data-nav-trigger="${id}"]`);
  }

  function closeMenus() {
    items.forEach((item) => item.classList.remove("is-open"));
    triggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
    activeMenuId = "";
  }

  function clearHoverTimers() {
    if (openTimerId !== null) {
      window.clearTimeout(openTimerId);
      openTimerId = null;
    }

    if (closeTimerId !== null) {
      window.clearTimeout(closeTimerId);
      closeTimerId = null;
    }
  }

  function focusedWithinMenu() {
    const activeElement = document.activeElement;
    return activeElement instanceof HTMLElement && Boolean(activeElement.closest(".menu-item"));
  }

  function containsPoint(rect, point, padding = 0) {
    return (
      point.x >= rect.left - padding &&
      point.x <= rect.right + padding &&
      point.y >= rect.top - padding &&
      point.y <= rect.bottom + padding
    );
  }

  function side(pointA, pointB, pointC) {
    return (pointA.x - pointC.x) * (pointB.y - pointC.y) - (pointB.x - pointC.x) * (pointA.y - pointC.y);
  }

  function pointInTriangle(point, vertexA, vertexB, vertexC) {
    const d1 = side(point, vertexA, vertexB);
    const d2 = side(point, vertexB, vertexC);
    const d3 = side(point, vertexC, vertexA);
    const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNegative && hasPositive);
  }

  function pointerSamples() {
    if (!pointerHistory.length) {
      return null;
    }

    const latest = pointerHistory[pointerHistory.length - 1];
    let earlier = pointerHistory[0];

    for (let index = pointerHistory.length - 1; index >= 0; index -= 1) {
      const sample = pointerHistory[index];
      if (latest.time - sample.time >= pointerLookbackMs) {
        earlier = sample;
        break;
      }
    }

    return { earlier, latest };
  }

  function submenuEntryEdge(parentRect, submenuRect) {
    const parentCenterX = (parentRect.left + parentRect.right) / 2;
    const parentCenterY = (parentRect.top + parentRect.bottom) / 2;
    const submenuCenterX = (submenuRect.left + submenuRect.right) / 2;
    const submenuCenterY = (submenuRect.top + submenuRect.bottom) / 2;
    const deltaX = submenuCenterX - parentCenterX;
    const deltaY = submenuCenterY - parentCenterY;

    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
      if (deltaX >= 0) {
        return {
          axis: "x",
          direction: 1,
          cornerA: { x: submenuRect.left - safeZonePadding, y: submenuRect.top - safeZonePadding },
          cornerB: { x: submenuRect.left - safeZonePadding, y: submenuRect.bottom + safeZonePadding },
        };
      }

      return {
        axis: "x",
        direction: -1,
        cornerA: { x: submenuRect.right + safeZonePadding, y: submenuRect.top - safeZonePadding },
        cornerB: { x: submenuRect.right + safeZonePadding, y: submenuRect.bottom + safeZonePadding },
      };
    }

    if (deltaY >= 0) {
      return {
        axis: "y",
        direction: 1,
        cornerA: { x: submenuRect.left - safeZonePadding, y: submenuRect.top - safeZonePadding },
        cornerB: { x: submenuRect.right + safeZonePadding, y: submenuRect.top - safeZonePadding },
      };
    }

    return {
      axis: "y",
      direction: -1,
      cornerA: { x: submenuRect.left - safeZonePadding, y: submenuRect.bottom + safeZonePadding },
      cornerB: { x: submenuRect.right + safeZonePadding, y: submenuRect.bottom + safeZonePadding },
    };
  }

  function pointerIndicatesIntentForMenu(id) {
    if (!id || !isDesktop()) {
      return false;
    }

    const trigger = getTriggerById(id);
    const menu = getMenuById(id);
    const samples = pointerSamples();
    if (!trigger || !menu || !samples) {
      return false;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const { earlier, latest } = samples;

    if (!containsPoint(triggerRect, earlier, triggerProximityPadding) && !containsPoint(triggerRect, latest, triggerProximityPadding)) {
      return false;
    }

    const deltaX = latest.x - earlier.x;
    const deltaY = latest.y - earlier.y;
    const distance = Math.hypot(deltaX, deltaY);
    if (distance < 2) {
      return false;
    }

    const elapsed = Math.max(1, latest.time - earlier.time);
    const speed = distance / elapsed;
    if (speed < pointerSpeedMin || speed > pointerSpeedMax) {
      return false;
    }

    const edge = submenuEntryEdge(triggerRect, menuRect);
    const movementOnAxis = edge.axis === "x" ? deltaX : deltaY;
    if (movementOnAxis * edge.direction <= 0) {
      return false;
    }

    return pointInTriangle(latest, earlier, edge.cornerA, edge.cornerB);
  }

  function shouldDelayMenuSwitch(candidateId) {
    return Boolean(activeMenuId) && activeMenuId !== candidateId && pointerIndicatesIntentForMenu(activeMenuId);
  }

  function queueOpenMenu(id, delayMs = 0, holdForIntent = false) {
    if (!isDesktop()) {
      return;
    }

    if (!getMenuById(id)) {
      return;
    }

    if (closeTimerId !== null) {
      window.clearTimeout(closeTimerId);
      closeTimerId = null;
    }

    if (openTimerId !== null) {
      window.clearTimeout(openTimerId);
      openTimerId = null;
    }

    const attemptOpen = () => {
      openTimerId = null;

      if (hoveredMenuId !== id || focusedWithinMenu()) {
        return;
      }

      if (holdForIntent && shouldDelayMenuSwitch(id)) {
        openTimerId = window.setTimeout(attemptOpen, hoverIntentPollMs);
        return;
      }

      openMenu(id);
    };

    if (delayMs <= 0) {
      attemptOpen();
      return;
    }

    openTimerId = window.setTimeout(attemptOpen, delayMs);
  }

  function queueCloseMenus() {
    if (!isDesktop()) {
      return;
    }

    if (openTimerId !== null) {
      window.clearTimeout(openTimerId);
      openTimerId = null;
    }

    if (closeTimerId !== null) {
      window.clearTimeout(closeTimerId);
      closeTimerId = null;
    }

    const attemptClose = () => {
      closeTimerId = null;

      if (hoveredMenuId !== "" || focusedWithinMenu()) {
        return;
      }

      if (activeMenuId && pointerIndicatesIntentForMenu(activeMenuId)) {
        closeTimerId = window.setTimeout(attemptClose, hoverIntentPollMs);
        return;
      }

      closeMenus();
    };

    closeTimerId = window.setTimeout(attemptClose, hoverCloseDelayMs);
  }

  function openMenu(id) {
    closeMenus();
    const menu = getMenuById(id);
    const trigger = getTriggerById(id);

    if (!menu || !trigger) {
      return;
    }

    const item = trigger.closest(".menu-item");
    if (item) {
      item.classList.add("is-open");
    }

    trigger.setAttribute("aria-expanded", "true");
    activeMenuId = id;
  }

  function toggleMenu(id) {
    if (activeMenuId === id) {
      closeMenus();
      return;
    }

    openMenu(id);
  }

  function menuLinks(menu) {
    return Array.from(menu.querySelectorAll("a[role='menuitem']")).filter((link) => link.offsetParent !== null);
  }

  function focusMenuEdge(id, fromEnd = false) {
    const menu = getMenuById(id);
    if (!menu) {
      return;
    }

    const links = menuLinks(menu);
    if (!links.length) {
      return;
    }

    links[fromEnd ? links.length - 1 : 0].focus();
  }

  function focusMenuLink(id, direction) {
    const menu = getMenuById(id);
    if (!menu) {
      return;
    }

    const links = menuLinks(menu);
    if (!links.length) {
      return;
    }

    let currentIndex = links.findIndex((link) => link === document.activeElement);
    if (currentIndex < 0) {
      currentIndex = direction > 0 ? -1 : 0;
    }

    const nextIndex = (currentIndex + direction + links.length) % links.length;
    links[nextIndex].focus();
  }

  function adjacentMenuId(id, direction) {
    const currentIndex = triggerIds.indexOf(id);
    if (currentIndex < 0 || !triggerIds.length) {
      return "";
    }

    const nextIndex = (currentIndex + direction + triggerIds.length) % triggerIds.length;
    return triggerIds[nextIndex] || "";
  }

  triggers.forEach((trigger) => {
    const id = trigger.getAttribute("data-nav-trigger");
    if (!id) {
      return;
    }

    trigger.addEventListener("click", (event) => {
      if (!isDesktop()) {
        return;
      }

      if (!getMenuById(id)) {
        return;
      }

      event.preventDefault();
      clearHoverTimers();
      toggleMenu(id);
    });

    trigger.addEventListener("keydown", (event) => {
      if (!isDesktop()) {
        return;
      }

      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        clearHoverTimers();
        toggleMenu(id);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        clearHoverTimers();
        openMenu(id);
        focusMenuEdge(id, false);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        clearHoverTimers();
        openMenu(id);
        focusMenuEdge(id, true);
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        clearHoverTimers();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextId = adjacentMenuId(id, direction);
        if (!nextId) {
          return;
        }

        const nextTrigger = getTriggerById(nextId);
        if (!nextTrigger) {
          return;
        }

        nextTrigger.focus();
        if (activeMenuId) {
          openMenu(nextId);
        }
      }
    });
  });

  document.addEventListener(
    "mousemove",
    (event) => {
      if (!isDesktop()) {
        return;
      }

      pointerHistory.push({
        x: event.clientX,
        y: event.clientY,
        time: performance.now(),
      });

      if (pointerHistory.length > pointerHistoryLimit) {
        pointerHistory.shift();
      }
    },
    { passive: true }
  );

  items.forEach((item) => {
    const trigger = item.querySelector("[data-nav-trigger]");
    const id = trigger && trigger.getAttribute("data-nav-trigger");
    if (!id) {
      return;
    }

    item.addEventListener("mouseenter", () => {
      if (!isDesktop()) {
        return;
      }

      hoveredMenuId = id;
      const delayForIntent = shouldDelayMenuSwitch(id);
      queueOpenMenu(id, delayForIntent ? hoverIntentDelayMs : 0, delayForIntent);
    });

    item.addEventListener("mouseleave", () => {
      if (!isDesktop()) {
        return;
      }

      if (hoveredMenuId === id) {
        hoveredMenuId = "";
      }

      queueCloseMenus();
    });
  });

  if (siteNav) {
    siteNav.addEventListener("mouseleave", () => {
      if (!isDesktop()) {
        return;
      }

      hoveredMenuId = "";
      queueCloseMenus();
    });
  }

  document.querySelectorAll("[data-nav-menu]").forEach((menu) => {
    menu.addEventListener("keydown", (event) => {
      const id = menu.getAttribute("data-nav-menu");
      if (!id) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusMenuLink(id, 1);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        focusMenuLink(id, -1);
      }

      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextId = adjacentMenuId(id, direction);
        if (!nextId) {
          return;
        }

        clearHoverTimers();
        openMenu(nextId);
        focusMenuEdge(nextId, false);
      }

      if (event.key === "Home") {
        event.preventDefault();
        focusMenuEdge(id, false);
      }

      if (event.key === "End") {
        event.preventDefault();
        focusMenuEdge(id, true);
      }

      if (event.key === "Tab") {
        const links = menuLinks(menu);
        if (!links.length) {
          return;
        }

        const first = links[0];
        const last = links[links.length - 1];
        if (!event.shiftKey && document.activeElement === last) {
          clearHoverTimers();
          closeMenus();
          return;
        }

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          clearHoverTimers();
          closeMenus();
          const trigger = getTriggerById(id);
          if (trigger) {
            trigger.focus();
          }
        }
      }

      if (event.key === "Escape") {
        event.preventDefault();
        clearHoverTimers();
        closeMenus();
        const trigger = getTriggerById(id);
        if (trigger) {
          trigger.focus();
        }
      }
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (!target.closest(".menu-item")) {
      hoveredMenuId = "";
      clearHoverTimers();
      closeMenus();
    }
  });

  document.addEventListener("focusin", (event) => {
    if (!isDesktop()) {
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (!target.closest(".site-nav")) {
      hoveredMenuId = "";
      clearHoverTimers();
      closeMenus();
    }
  });

  function setMobileOpen(open) {
    if (!toggleButton || !mobilePanel) {
      return;
    }

    toggleButton.setAttribute("aria-expanded", String(open));
    mobilePanel.hidden = !open;
    document.body.classList.toggle("nav-open", open);
  }

  if (toggleButton && mobilePanel) {
    toggleButton.addEventListener("click", () => {
      const expanded = toggleButton.getAttribute("aria-expanded") === "true";
      setMobileOpen(!expanded);
    });

    mobilePanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMobileOpen(false));
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hoveredMenuId = "";
      clearHoverTimers();
      closeMenus();
      setMobileOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    hoveredMenuId = "";
    clearHoverTimers();
    pointerHistory.length = 0;

    if (!isDesktop()) {
      closeMenus();
      return;
    }

    setMobileOpen(false);
  });

  const year = String(new Date().getFullYear());
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = year;
  });

  const catalogDate = window.SiteCatalog && window.SiteCatalog.snapshotDateLabel;
  if (catalogDate) {
    document.querySelectorAll("[data-catalog-date]").forEach((node) => {
      node.textContent = catalogDate;
    });
  }
})();
