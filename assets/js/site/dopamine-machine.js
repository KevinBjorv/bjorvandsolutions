(() => {
  const canvas = document.querySelector("#unity-canvas");
  const container = document.querySelector("#unity-container");
  const loadingBar = document.querySelector("#unity-loading-bar");
  const progressBar = document.querySelector("#unity-progress-bar");
  const warningBanner = document.querySelector("#unity-warning");
  const fullscreenButton = document.querySelector("#unity-fullscreen-button");

  if (!canvas || !container) {
    return;
  }

  function updateWarningVisibility() {
    if (!warningBanner) {
      return;
    }

    warningBanner.classList.toggle("is-visible", warningBanner.children.length > 0);
  }

  function unityShowBanner(message, type) {
    if (!warningBanner) {
      return;
    }

    const entry = document.createElement("div");
    entry.className = type === "error" ? "unity-warning-message is-error" : "unity-warning-message";
    entry.textContent = message;
    warningBanner.append(entry);

    if (type !== "error") {
      window.setTimeout(() => {
        entry.remove();
        updateWarningVisibility();
      }, 5000);
    }

    updateWarningVisibility();
  }

  const buildUrl = "/dopamine/Build";
  const config = {
    arguments: [],
    dataUrl: `${buildUrl}/DM 1.1.1.data`,
    frameworkUrl: `${buildUrl}/DM 1.1.1.framework.js`,
    codeUrl: `${buildUrl}/DM 1.1.1.wasm`,
    streamingAssetsUrl: "/dopamine/StreamingAssets",
    companyName: "Bjorvand Solutions",
    productName: "Dopamine Machine",
    productVersion: "1.1.1",
    showBanner: unityShowBanner,
  };

  if (/iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent)) {
    container.classList.remove("unity-desktop");
    container.classList.add("unity-mobile");
    canvas.classList.add("unity-mobile");
  }

  if (loadingBar) {
    loadingBar.hidden = false;
  }

  const loaderScript = document.createElement("script");
  loaderScript.src = `${buildUrl}/DM 1.1.1.loader.js`;
  loaderScript.onload = () => {
    window.createUnityInstance(canvas, config, (progress) => {
      if (progressBar) {
        progressBar.value = progress;
        progressBar.textContent = `${Math.round(100 * progress)}%`;
      }
    }).then((unityInstance) => {
      if (loadingBar) {
        loadingBar.hidden = true;
      }

      if (fullscreenButton) {
        fullscreenButton.disabled = false;
        fullscreenButton.addEventListener("click", () => {
          unityInstance.SetFullscreen(1);
        });
      }
    }).catch((error) => {
      unityShowBanner(String(error), "error");
    });
  };

  loaderScript.onerror = () => {
    unityShowBanner("Dopamine Machine could not load. Refresh the page and try again.", "error");
  };

  document.body.append(loaderScript);
})();
