const countdownEl = document.getElementById('countdown');
let seconds = 10;

const interval = setInterval(() => {
  seconds -= 1;
  countdownEl.textContent = seconds;

  if (seconds <= 0) {
    clearInterval(interval);
    window.location.href = 'https://www.skool.com/smart-indie-6927/about?ref=6e183e0cb40b468289dc9bf659028fe2';
  }
}, 1000);
