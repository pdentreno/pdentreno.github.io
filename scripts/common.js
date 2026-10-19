// =========================
// SHARED UTILS
// =========================
function setupFullscreen(buttonId = "fullscreenBtn") {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  const frame = window.frameElement;
  const fullscreenTarget = frame || document.documentElement;
  const fullscreenDocument = frame ? window.parent.document : document;
  const updateButton = () => {
    btn.textContent = fullscreenDocument.fullscreenElement ? "❐" : "⛶";
  };

  fullscreenDocument.addEventListener("fullscreenchange", updateButton);
  window.addEventListener("pagehide", () => {
    fullscreenDocument.removeEventListener("fullscreenchange", updateButton);
  }, { once: true });
  updateButton();

  btn.addEventListener("click", () => {
    if (!fullscreenDocument.fullscreenElement) {
      fullscreenTarget.requestFullscreen().catch((error) => {
        console.error("Unable to enter fullscreen mode:", error);
      });
    } else {
      fullscreenDocument.exitFullscreen().catch((error) => {
        console.error("Unable to exit fullscreen mode:", error);
      });
    }
  });
}

function unlockAudio() {
  const sound = new Audio("../sounds/beep.wav");
  sound.volume = 1.0;
  sound.play()
    .then(() => {
      sound.pause();
      sound.currentTime = 0;
    })
    .catch(() => { });
}

function playSound(sound) {
  const clone = sound.cloneNode();
  clone.volume = sound.volume;
  clone.currentTime = 0;
  clone.play().catch(() => { });
}

function formatTime(h, m, s) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatCountdownValue(value, pad = false) {
  const text = String(value);
  return pad ? text.padStart(2, "0") : text;
}

function normalizeTime(h, m, s) {
  let total = h * 3600 + m * 60 + s;
  const hours = Math.floor(total / 3600);
  total %= 3600;
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return { hours, minutes, seconds };
}

function isValid(value, required = false) {
  if (!Number.isInteger(value)) return false;
  return required ? value > 0 : value >= 0;
}

document
  .querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')
  .forEach((element) => {
    element.tabIndex = 0;
  });

document.querySelectorAll(".mode-selector").forEach((selector) => {
  const summary = selector.querySelector("summary");

  selector.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && selector.open) {
      selector.open = false;
      summary.focus();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!selector.contains(event.target)) {
      selector.open = false;
    }
  });
});
