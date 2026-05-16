window.addEventListener("DOMContentLoaded", () => {
  setupFullscreen();

  const clockElement = document.getElementById("clock");
  if (!clockElement) return;

  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    clockElement.textContent = `${h}:${m}:${s}`;
  }

  updateClock();
  setInterval(updateClock, 1000);
});