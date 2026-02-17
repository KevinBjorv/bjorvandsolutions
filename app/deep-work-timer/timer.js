const display = document.getElementById('timerDisplay');
const playPauseButton = document.getElementById('playPauseButton');
const resetButton = document.getElementById('resetButton');
const fullScreenButton = document.getElementById('fullScreenButton');
const statusText = document.getElementById('timerStatus');
const completionSound = document.getElementById('completionSound');
const durationButtons = Array.from(document.querySelectorAll('[data-minutes]'));
const timerShell = document.querySelector('.timer-shell');

let selectedMinutes = 60;
let remainingSeconds = selectedMinutes * 60;
let timerId = null;
let isRunning = false;

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const updateDisplay = () => {
  display.textContent = formatTime(remainingSeconds);
  document.title = `${formatTime(remainingSeconds)} - Deep Work Timer`;
};

const updateButtons = () => {
  durationButtons.forEach((button) => {
    const isActive = Number(button.dataset.minutes) === selectedMinutes;
    button.classList.toggle('primary', isActive);
    button.classList.toggle('ghost', !isActive);
  });
};

const stopTimer = () => {
  clearInterval(timerId);
  timerId = null;
  isRunning = false;
  playPauseButton.textContent = 'Play';
};

const tick = () => {
  if (remainingSeconds > 0) {
    remainingSeconds -= 1;
    updateDisplay();
  }

  if (remainingSeconds <= 0) {
    remainingSeconds = 0;
    updateDisplay();
    statusText.textContent = 'Session complete. Great work!';
    stopTimer();
    completionSound.currentTime = 0;
    completionSound.play();
  }
};

const startTimer = () => {
  if (isRunning) {
    return;
  }
  isRunning = true;
  playPauseButton.textContent = 'Pause';
  statusText.textContent = 'Deep work session running.';
  timerId = setInterval(tick, 1000);
};

durationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedMinutes = Number(button.dataset.minutes);
    remainingSeconds = selectedMinutes * 60;
    updateButtons();
    updateDisplay();
    statusText.textContent = 'Ready to focus.';
    stopTimer();
  });
});

playPauseButton.addEventListener('click', () => {
  if (isRunning) {
    stopTimer();
    statusText.textContent = 'Paused.';
    return;
  }

  if (remainingSeconds === 0) {
    remainingSeconds = selectedMinutes * 60;
    updateDisplay();
  }
  startTimer();
});

resetButton.addEventListener('click', () => {
  stopTimer();
  remainingSeconds = selectedMinutes * 60;
  updateDisplay();
  statusText.textContent = 'Ready to focus.';
});

const updateFullScreenButton = () => {
  const isFullScreen = Boolean(document.fullscreenElement);
  fullScreenButton.textContent = isFullScreen ? 'Exit full screen' : 'Full screen';
  document.body.classList.toggle('timer-fullscreen', isFullScreen);
};

fullScreenButton.addEventListener('click', async () => {
  if (!document.fullscreenElement) {
    try {
      await timerShell.requestFullscreen();
    } catch (error) {
      console.error('Unable to enter full screen.', error);
    }
    return;
  }

  await document.exitFullscreen();
});

document.addEventListener('fullscreenchange', updateFullScreenButton);

updateButtons();
updateDisplay();
updateFullScreenButton();

