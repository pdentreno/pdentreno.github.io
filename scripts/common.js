// =========================
// FULLSCREEN BUTTON
// =========================
function setupFullscreen(buttonId = "fullscreenBtn") {
  const btn = document.getElementById(buttonId);

  if (!btn) return;

  btn.addEventListener("click", () => {
    const elem = document.documentElement;

    if (!document.fullscreenElement) {
      elem.requestFullscreen();
      btn.textContent = "❐";
    } else {
      document.exitFullscreen();
      btn.textContent = "⛶";
    }
  });
}