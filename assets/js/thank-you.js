const countdownEl = document.getElementById('countdown');
let seconds = 10;

const interval = setInterval(() => {
  seconds -= 1;
  countdownEl.textContent = seconds;

  if (seconds <= 0) {
    clearInterval(interval);
    window.location.href = 'https://go.smartindie.dev/s/website';
  }
}, 1000);
