(() => {
  const body = document.body;
  const youtubeShell = document.querySelector(".youtube-shell");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeToggleLabel = document.querySelector("[data-theme-toggle-label]");
  const sidebarToggle = document.querySelector("[data-sidebar-toggle]");
  const searchForm = document.querySelector("[data-mock-search-form]");
  const activeSlotLabel = document.querySelector("[data-active-slot-label]");
  const slotCountLabel = document.querySelector("[data-slot-count-label]");
  const slotPickerList = document.querySelector("[data-slot-picker-list]");
  const videoGrid = document.querySelector("[data-video-grid]");
  const controls = {
    thumbnail: document.querySelector("[data-control='thumbnail']"),
    title: document.querySelector("[data-control='title']"),
    channel: document.querySelector("[data-control='channel']"),
    avatar: document.querySelector("[data-control='avatar']"),
    views: document.querySelector("[data-control='views']"),
    date: document.querySelector("[data-control='date']"),
    duration: document.querySelector("[data-control='duration']"),
    reset: document.querySelector("[data-custom-reset]"),
    addSlot: document.querySelector("[data-add-slot]"),
    removeSlot: document.querySelector("[data-remove-slot]"),
    randomizeGrid: document.querySelector("[data-randomize-grid]"),
  };
  const defaultTheme = "light";
  const themeStorageKey = "youtube-thumbnail-preview-theme";
  const maxCustomSlots = 6;
  const minCustomSlots = 1;
  const initialCustomSlotCount = 1;
  const slotIds = Array.from({ length: maxCustomSlots }, (_, index) => `slot-${index + 1}`);
  const defaultSlots = Object.fromEntries(
    slotIds.map((slotId, index) => [
      slotId,
      {
        label: `Thumbnail ${index + 1}`,
        title: `Thumbnail option ${index + 1} goes here`,
        channel: "Your Channel",
        views: "349 views",
        date: "2 days ago",
        duration: "12:34",
        thumbUrl: "",
        thumbObjectUrl: "",
        avatarUrl: "",
        avatarObjectUrl: "",
      },
    ])
  );
  const mockFeedVideos = [
    {
      id: "feed-1",
      fileName: "The Spongebob Movie - Search for Squarepants - Animation Breakdown.avif",
      title: "The SpongeBob Movie - Search for SquarePants | Animation Breakdown",
      channel: "Animation Breakdown",
      views: "214K views",
      date: "6 days ago",
      duration: "18:42",
      avatarLabel: "AB",
      avatarClass: "channel-avatar--blue",
    },
    {
      id: "feed-2",
      fileName: "Spring - Blender Open Movie.avif",
      title: "Spring | Blender Open Movie",
      channel: "Blender",
      views: "1.1M views",
      date: "2 years ago",
      duration: "9:51",
      avatarLabel: "BL",
      avatarClass: "channel-avatar--green",
    },
    {
      id: "feed-3",
      fileName: "POV - You finally started posting to YouTube.avif",
      title: "POV: You finally started posting to YouTube",
      channel: "Creator Growth Lab",
      views: "89K views",
      date: "3 days ago",
      duration: "14:08",
      avatarLabel: "CG",
      avatarClass: "channel-avatar--orange",
    },
    {
      id: "feed-4",
      fileName: "Biking The Philippines - Finale.avif",
      title: "Biking the Philippines - Finale",
      channel: "Trail Routes",
      views: "356K views",
      date: "1 week ago",
      duration: "22:11",
      avatarLabel: "TR",
      avatarClass: "channel-avatar--pink",
    },
    {
      id: "feed-5",
      fileName: "Despicable Me - Teaser Trailer #1.avif",
      title: "Despicable Me - Teaser Trailer #1",
      channel: "Trailer Archive",
      views: "8.3M views",
      date: "1 year ago",
      duration: "2:31",
      avatarLabel: "TA",
      avatarClass: "channel-avatar--orange",
    },
    {
      id: "feed-6",
      fileName: "How I tricked the internet.avif",
      title: "How I tricked the internet",
      channel: "Internet Stories",
      views: "428K views",
      date: "2 weeks ago",
      duration: "16:54",
      avatarLabel: "IS",
      avatarClass: "channel-avatar--blue",
    },
    {
      id: "feed-7",
      fileName: "I did low reps for a year and here's my experience prioritising mechanical tension.avif",
      title: "I did low reps for a year and here's my experience prioritising mechanical tension",
      channel: "Strength Notes",
      views: "93K views",
      date: "5 days ago",
      duration: "12:18",
      avatarLabel: "SN",
      avatarClass: "channel-avatar--green",
    },
    {
      id: "feed-8",
      fileName: "This hormone is why you have brainfog.avif",
      title: "This hormone is why you have brainfog",
      channel: "Body Signals",
      views: "271K views",
      date: "8 days ago",
      duration: "10:47",
      avatarLabel: "BS",
      avatarClass: "channel-avatar--pink",
    },
    {
      id: "feed-9",
      fileName: "Your attention span is cooked.avif",
      title: "Your attention span is cooked",
      channel: "Focus Theory",
      views: "604K views",
      date: "4 days ago",
      duration: "11:03",
      avatarLabel: "FT",
      avatarClass: "channel-avatar--orange",
    },
  ];
  const cloneSlots = (slots) =>
    Object.fromEntries(
      Object.entries(slots).map(([slotId, slot]) => [slotId, { ...slot }])
    );
  const slotState = cloneSlots(defaultSlots);
  const slotElements = {};
  const slotPickerButtons = new Map();
  const gridItemNodes = new Map();

  let activeSlotId = slotIds[0];
  let activeSlotCount = initialCustomSlotCount;
  let gridOrderIds = [];
  let sidebarCollapsed = false;

  function readStoredTheme() {
    try {
      return window.localStorage.getItem(themeStorageKey);
    } catch {
      return "";
    }
  }

  function storeTheme(theme) {
    try {
      window.localStorage.setItem(themeStorageKey, theme);
    } catch {
      // Ignore storage failures in restricted browsing modes.
    }
  }

  function applyTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    body.dataset.theme = nextTheme;

    if (!themeToggle || !themeToggleLabel) {
      return;
    }

    const darkModeEnabled = nextTheme === "dark";
    themeToggle.setAttribute("aria-pressed", String(darkModeEnabled));
    themeToggleLabel.textContent = darkModeEnabled ? "Light mode" : "Dark mode";
  }

  function applySidebarState(collapsed) {
    sidebarCollapsed = Boolean(collapsed);

    if (youtubeShell) {
      youtubeShell.classList.toggle("is-sidebar-collapsed", sidebarCollapsed);
    }

    if (!sidebarToggle) {
      return;
    }

    sidebarToggle.setAttribute("aria-expanded", String(!sidebarCollapsed));
    sidebarToggle.setAttribute("aria-label", sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar");
  }

  function getInitials(channelName) {
    const parts = channelName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!parts.length) {
      return "YC";
    }

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  function getSlotIndex(slotId) {
    const index = Number(slotId.split("-")[1]);
    return Number.isInteger(index) ? index : 0;
  }

  function isVisibleSlot(slotId) {
    return getSlotIndex(slotId) <= activeSlotCount;
  }

  function getVisibleSlotIds() {
    return slotIds.filter((slotId) => isVisibleSlot(slotId));
  }

  function getAllVisibleGridIds() {
    return [...getVisibleSlotIds(), ...mockFeedVideos.map((video) => video.id)];
  }

  function buildMockThumbnailPath(fileName) {
    return `/Mockup%20thmbnails/${encodeURIComponent(fileName)}`;
  }

  function clearObjectUrl(slotId, field) {
    const objectUrlKey = `${field}ObjectUrl`;
    const currentUrl = slotState[slotId][objectUrlKey];
    if (!currentUrl) {
      return;
    }

    URL.revokeObjectURL(currentUrl);
    slotState[slotId][objectUrlKey] = "";
  }

  function createStatsNode(views, date) {
    const stats = document.createElement("p");
    stats.className = "video-card__stats";

    const viewsText = document.createElement("span");
    viewsText.textContent = views;

    const separator = document.createElement("span");
    separator.className = "video-card__separator";
    separator.setAttribute("aria-hidden", "true");
    separator.innerHTML = "&middot;";

    const dateText = document.createElement("span");
    dateText.textContent = date;

    stats.append(viewsText, separator, dateText);
    return stats;
  }

  function openThumbnailPickerForSlot(slotId) {
    if (!controls.thumbnail || slotState[slotId]?.thumbUrl) {
      return;
    }

    setActiveSlot(slotId, { forceSync: true });
    controls.thumbnail.click();
  }

  function createCustomCard(slotId) {
    const slotNumber = getSlotIndex(slotId);
    const card = document.createElement("article");
    card.className = "video-card video-card--custom";
    card.dataset.gridItemId = slotId;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Edit thumbnail ${slotNumber}`);

    const thumb = document.createElement("div");
    thumb.className = "video-card__thumb video-card__thumb--custom";

    const thumbImage = document.createElement("img");
    thumbImage.className = "video-card__image";
    thumbImage.hidden = true;

    const placeholder = document.createElement("div");
    placeholder.className = "video-card__empty-state";

    const placeholderPlus = document.createElement("span");
    placeholderPlus.className = "video-card__empty-plus";
    placeholderPlus.setAttribute("aria-hidden", "true");
    placeholderPlus.textContent = "+";

    const placeholderText = document.createElement("span");
    placeholderText.textContent = `Upload thumbnail ${slotNumber}`;

    placeholder.append(placeholderPlus, placeholderText);

    const duration = document.createElement("span");
    duration.className = "video-card__duration";

    thumb.append(thumbImage, placeholder, duration);

    const meta = document.createElement("div");
    meta.className = "video-card__meta";

    const avatar = document.createElement("span");
    avatar.className = "channel-avatar channel-avatar--custom";

    const avatarImage = document.createElement("img");
    avatarImage.className = "channel-avatar__image";
    avatarImage.hidden = true;

    const avatarFallback = document.createElement("span");
    avatarFallback.className = "channel-avatar__fallback";

    avatar.append(avatarImage, avatarFallback);

    const copy = document.createElement("div");
    copy.className = "video-card__copy";

    const title = document.createElement("p");
    title.className = "video-card__title";

    const channel = document.createElement("p");
    channel.className = "video-card__channel";

    const stats = createStatsNode("349 views", "2 days ago");
    const views = stats.children[0];
    const date = stats.children[2];

    copy.append(title, channel, stats);
    meta.append(avatar, copy);
    card.append(thumb, meta);

    card.addEventListener("click", () => {
      if (!slotState[slotId]?.thumbUrl) {
        openThumbnailPickerForSlot(slotId);
        return;
      }

      setActiveSlot(slotId);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      if (!slotState[slotId]?.thumbUrl) {
        openThumbnailPickerForSlot(slotId);
        return;
      }

      setActiveSlot(slotId);
    });

    slotElements[slotId] = {
      card,
      thumbImage,
      placeholder,
      title,
      channel,
      views,
      date,
      duration,
      avatarImage,
      avatarFallback,
    };
    gridItemNodes.set(slotId, card);
  }

  function createFeedCard(video) {
    const card = document.createElement("article");
    card.className = "video-card";
    card.dataset.gridItemId = video.id;

    const thumb = document.createElement("div");
    thumb.className = "video-card__thumb";

    const image = document.createElement("img");
    image.className = "video-card__image";
    image.loading = "lazy";
    image.src = buildMockThumbnailPath(video.fileName);
    image.alt = `${video.title} thumbnail mockup`;

    const duration = document.createElement("span");
    duration.className = "video-card__duration";
    duration.textContent = video.duration;

    thumb.append(image, duration);

    const meta = document.createElement("div");
    meta.className = "video-card__meta";

    const avatar = document.createElement("span");
    avatar.className = `channel-avatar ${video.avatarClass}`;
    avatar.textContent = video.avatarLabel;

    const copy = document.createElement("div");
    copy.className = "video-card__copy";

    const title = document.createElement("p");
    title.className = "video-card__title";
    title.textContent = video.title;

    const channel = document.createElement("p");
    channel.className = "video-card__channel";
    channel.textContent = video.channel;

    const stats = createStatsNode(video.views, video.date);

    copy.append(title, channel, stats);
    meta.append(avatar, copy);
    card.append(thumb, meta);

    gridItemNodes.set(video.id, card);
  }

  function createSlotPickerButton(slotId) {
    const button = document.createElement("button");
    button.className = "preview-slot-button";
    button.type = "button";
    button.dataset.slotPicker = slotId;
    button.addEventListener("click", () => {
      setActiveSlot(slotId);
    });

    slotPickerButtons.set(slotId, button);
  }

  function createInterface() {
    slotIds.forEach((slotId) => {
      createCustomCard(slotId);
      createSlotPickerButton(slotId);
    });

    mockFeedVideos.forEach((video) => {
      createFeedCard(video);
    });

    if (slotPickerList) {
      slotIds.forEach((slotId) => {
        const button = slotPickerButtons.get(slotId);
        if (button) {
          slotPickerList.appendChild(button);
        }
      });
    }
  }

  function renderSlot(slotId) {
    const state = slotState[slotId];
    const elements = slotElements[slotId];
    if (!state || !elements) {
      return;
    }

    elements.title.textContent = state.title;
    elements.channel.textContent = state.channel;
    elements.views.textContent = state.views;
    elements.date.textContent = state.date;
    elements.duration.textContent = state.duration;
    elements.card.setAttribute("aria-label", `Edit ${state.label.toLowerCase()}`);

    if (state.thumbUrl) {
      elements.thumbImage.src = state.thumbUrl;
      elements.thumbImage.alt = `${state.title} thumbnail preview`;
      elements.thumbImage.hidden = false;
      elements.placeholder.hidden = true;
    } else {
      elements.thumbImage.hidden = true;
      elements.thumbImage.removeAttribute("src");
      elements.thumbImage.alt = "";
      elements.placeholder.hidden = false;
    }

    if (state.avatarUrl) {
      elements.avatarImage.src = state.avatarUrl;
      elements.avatarImage.alt = `${state.channel} channel profile picture`;
      elements.avatarImage.hidden = false;
      elements.avatarFallback.hidden = true;
    } else {
      elements.avatarImage.hidden = true;
      elements.avatarImage.removeAttribute("src");
      elements.avatarImage.alt = "";
      elements.avatarFallback.hidden = false;
      elements.avatarFallback.textContent = getInitials(state.channel);
    }
  }

  function syncControls(slotId) {
    const state = slotState[slotId];
    if (!state) {
      return;
    }

    if (controls.title) {
      controls.title.value = state.title;
    }

    if (controls.channel) {
      controls.channel.value = state.channel;
    }

    if (controls.views) {
      controls.views.value = state.views;
    }

    if (controls.date) {
      controls.date.value = state.date;
    }

    if (controls.duration) {
      controls.duration.value = state.duration;
    }

    if (controls.thumbnail) {
      controls.thumbnail.value = "";
    }

    if (controls.avatar) {
      controls.avatar.value = "";
    }
  }

  function syncSlotButtonStates() {
    slotIds.forEach((slotId) => {
      const button = slotPickerButtons.get(slotId);
      const card = slotElements[slotId]?.card;
      const visible = isVisibleSlot(slotId);

      if (button) {
        button.hidden = !visible;
        button.disabled = !visible;
        button.textContent = slotState[slotId].label;
      }

      if (card) {
        card.hidden = !visible;
        card.tabIndex = visible ? 0 : -1;
      }
    });

    if (slotCountLabel) {
      slotCountLabel.textContent = `${activeSlotCount} of ${maxCustomSlots} active`;
    }

    if (controls.addSlot) {
      controls.addSlot.disabled = activeSlotCount >= maxCustomSlots;
    }

    if (controls.removeSlot) {
      controls.removeSlot.disabled = activeSlotCount <= minCustomSlots;
    }
  }

  function setActiveSlot(slotId, options = {}) {
    const { forceSync = false } = options;

    if (!slotState[slotId] || !isVisibleSlot(slotId)) {
      return;
    }

    if (!forceSync && slotId === activeSlotId) {
      return;
    }

    activeSlotId = slotId;

    slotIds.forEach((candidateSlotId) => {
      const isActive = candidateSlotId === slotId;
      const button = slotPickerButtons.get(candidateSlotId);
      const card = slotElements[candidateSlotId]?.card;

      if (button) {
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      }

      if (card) {
        card.classList.toggle("is-active", isActive);
      }
    });

    if (activeSlotLabel) {
      activeSlotLabel.textContent = slotState[slotId].label;
    }

    syncControls(slotId);
  }

  function renderGridOrder() {
    if (!videoGrid) {
      return;
    }

    gridOrderIds.forEach((gridItemId) => {
      const node = gridItemNodes.get(gridItemId);
      if (node) {
        videoGrid.appendChild(node);
      }
    });
  }

  function syncGridOrder(preserveExisting = true) {
    const visibleIds = getAllVisibleGridIds();
    const visibleSet = new Set(visibleIds);
    const nextOrder = preserveExisting ? gridOrderIds.filter((gridItemId) => visibleSet.has(gridItemId)) : [];

    visibleIds.forEach((gridItemId) => {
      if (!nextOrder.includes(gridItemId)) {
        nextOrder.push(gridItemId);
      }
    });

    gridOrderIds = nextOrder;
    renderGridOrder();
  }

  function shuffleGridOrder() {
    const shuffledIds = [...getAllVisibleGridIds()];

    for (let index = shuffledIds.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffledIds[index], shuffledIds[randomIndex]] = [shuffledIds[randomIndex], shuffledIds[index]];
    }

    gridOrderIds = shuffledIds;
    renderGridOrder();
  }

  function updateSlotField(slotId, field, value) {
    if (!slotState[slotId] || !(field in slotState[slotId])) {
      return;
    }

    const nextValue = value.trim();
    slotState[slotId][field] = nextValue || defaultSlots[slotId][field];
    renderSlot(slotId);
  }

  function updateSlotFile(slotId, field, file) {
    if (!slotState[slotId]) {
      return;
    }

    const urlKey = `${field}Url`;
    clearObjectUrl(slotId, field);

    if (!(file instanceof File)) {
      slotState[slotId][urlKey] = "";
      renderSlot(slotId);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    slotState[slotId][`${field}ObjectUrl`] = objectUrl;
    slotState[slotId][urlKey] = objectUrl;
    renderSlot(slotId);
  }

  function resetSlot(slotId) {
    if (!slotState[slotId]) {
      return;
    }

    clearObjectUrl(slotId, "thumb");
    clearObjectUrl(slotId, "avatar");
    slotState[slotId] = { ...defaultSlots[slotId] };
    renderSlot(slotId);

    if (slotId === activeSlotId) {
      syncControls(slotId);
    }
  }

  function updateVisibleSlotCount(nextSlotCount) {
    const boundedCount = Math.min(Math.max(nextSlotCount, minCustomSlots), maxCustomSlots);
    if (boundedCount === activeSlotCount) {
      return;
    }

    activeSlotCount = boundedCount;

    if (!isVisibleSlot(activeSlotId)) {
      const visibleSlotIds = getVisibleSlotIds();
      activeSlotId = visibleSlotIds[visibleSlotIds.length - 1] || slotIds[0];
    }

    syncSlotButtonStates();
    syncGridOrder();
    setActiveSlot(activeSlotId, { forceSync: true });
  }

  function bindControls() {
    if (controls.title) {
      controls.title.addEventListener("input", (event) => {
        const target = event.currentTarget;
        if (target instanceof HTMLInputElement) {
          updateSlotField(activeSlotId, "title", target.value);
        }
      });
    }

    if (controls.channel) {
      controls.channel.addEventListener("input", (event) => {
        const target = event.currentTarget;
        if (target instanceof HTMLInputElement) {
          updateSlotField(activeSlotId, "channel", target.value);
        }
      });
    }

    if (controls.views) {
      controls.views.addEventListener("input", (event) => {
        const target = event.currentTarget;
        if (target instanceof HTMLInputElement) {
          updateSlotField(activeSlotId, "views", target.value);
        }
      });
    }

    if (controls.date) {
      controls.date.addEventListener("input", (event) => {
        const target = event.currentTarget;
        if (target instanceof HTMLInputElement) {
          updateSlotField(activeSlotId, "date", target.value);
        }
      });
    }

    if (controls.duration) {
      controls.duration.addEventListener("input", (event) => {
        const target = event.currentTarget;
        if (target instanceof HTMLInputElement) {
          updateSlotField(activeSlotId, "duration", target.value);
        }
      });
    }

    if (controls.thumbnail) {
      controls.thumbnail.addEventListener("change", (event) => {
        const target = event.currentTarget;
        if (!(target instanceof HTMLInputElement)) {
          return;
        }

        const file = target.files && target.files[0];
        updateSlotFile(activeSlotId, "thumb", file || null);
      });
    }

    if (controls.avatar) {
      controls.avatar.addEventListener("change", (event) => {
        const target = event.currentTarget;
        if (!(target instanceof HTMLInputElement)) {
          return;
        }

        const file = target.files && target.files[0];
        updateSlotFile(activeSlotId, "avatar", file || null);
      });
    }

    if (controls.reset) {
      controls.reset.addEventListener("click", () => {
        resetSlot(activeSlotId);
      });
    }

    if (controls.addSlot) {
      controls.addSlot.addEventListener("click", () => {
        const nextSlotId = slotIds[activeSlotCount];
        updateVisibleSlotCount(activeSlotCount + 1);
        if (nextSlotId) {
          setActiveSlot(nextSlotId);
        }
      });
    }

    if (controls.removeSlot) {
      controls.removeSlot.addEventListener("click", () => {
        updateVisibleSlotCount(activeSlotCount - 1);
      });
    }

    if (controls.randomizeGrid) {
      controls.randomizeGrid.addEventListener("click", () => {
        shuffleGridOrder();
      });
    }
  }

  function bindThemeToggle() {
    if (!themeToggle) {
      return;
    }

    themeToggle.addEventListener("click", () => {
      const nextTheme = body.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      storeTheme(nextTheme);
    });
  }

  function bindSidebarToggle() {
    if (!sidebarToggle) {
      return;
    }

    sidebarToggle.addEventListener("click", () => {
      applySidebarState(!sidebarCollapsed);
    });
  }

  function bindSearchForm() {
    if (!searchForm) {
      return;
    }

    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  }

  function disposeObjectUrls() {
    slotIds.forEach((slotId) => {
      clearObjectUrl(slotId, "thumb");
      clearObjectUrl(slotId, "avatar");
    });
  }

  createInterface();
  slotIds.forEach((slotId) => renderSlot(slotId));
  syncSlotButtonStates();
  syncGridOrder(false);
  setActiveSlot(activeSlotId, { forceSync: true });
  applyTheme(readStoredTheme() || defaultTheme);
  applySidebarState(false);
  bindThemeToggle();
  bindSidebarToggle();
  bindSearchForm();
  bindControls();

  window.addEventListener("beforeunload", disposeObjectUrls);
})();
