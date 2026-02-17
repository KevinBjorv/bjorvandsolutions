(() => {
  let theme = 'light';

  try {
    theme = localStorage.getItem('assets-theme') || 'light';
  } catch (error) {
    theme = 'light';
  }

  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
})();
