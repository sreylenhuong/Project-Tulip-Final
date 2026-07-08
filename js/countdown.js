function initCountdown({ weddingDate, days, hours, minutes, seconds }) {
  const target = new Date(weddingDate).getTime();

  function setCountdown() {
    const now = Date.now();
    const difference = Math.max(0, target - now);

    const totalSeconds = Math.floor(difference / 1000);
    const remainingDays = Math.floor(totalSeconds / 86400);
    const remainingHours = Math.floor((totalSeconds % 86400) / 3600);
    const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    days.textContent = String(remainingDays).padStart(2, '0');
    hours.textContent = String(remainingHours).padStart(2, '0');
    minutes.textContent = String(remainingMinutes).padStart(2, '0');
    seconds.textContent = String(remainingSeconds).padStart(2, '0');
  }

  setCountdown();
  window.setInterval(setCountdown, 1000);
}
