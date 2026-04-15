setupFullscreen();// =========================
// RELOJ
// =========================
function updateClock() {
  const now = new Date();

  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");

  document.getElementById("clock").textContent = `${h}:${m}:${s}`;
}

// iniciar reloj
updateClock();
setInterval(updateClock, 1000);


// =========================
// FULLSCREEN (COMÚN)
// =========================
setupFullscreen();