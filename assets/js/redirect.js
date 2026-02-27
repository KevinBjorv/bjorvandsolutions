(() => {
  const target = document.documentElement.getAttribute('data-redirect');
  if (!target) {
    return;
  }

  window.location.replace(target);
})();
