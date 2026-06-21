const cronoDisplay = document.getElementById("cronoDisplay");
const resetButton = document.getElementById("resetBtn");

let isRunning = false;
let lastFrameTime = 0;
let elapsedMs = 0;
let rafId = null;

const formatChrono = (ms) => {
    const totalMilliseconds = Math.max(0, Math.floor(ms));
    const hours = Math.floor(totalMilliseconds / 3600000);
    const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
    const milliseconds = totalMilliseconds % 1000;

    return `${String(hours).padStart(2, "0")}:
${String(minutes).padStart(2, "0")}:
${String(seconds).padStart(2, "0")}:${String(milliseconds).padStart(3, "0")}`.replace(/\n/g, "");
};

const updateDisplay = () => {
    cronoDisplay.textContent = formatChrono(elapsedMs);
};

const animate = (timestamp) => {
    if (!isRunning) return;

    if (lastFrameTime === 0) {
        lastFrameTime = timestamp;
    }

    elapsedMs += timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    updateDisplay();
    rafId = window.requestAnimationFrame(animate);
};

const startCrono = () => {
    if (isRunning) return;
    isRunning = true;
    lastFrameTime = 0;
    rafId = window.requestAnimationFrame(animate);
};

const pauseCrono = () => {
    if (!isRunning) return;
    isRunning = false;
    if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
    }
};

const resetCrono = () => {
    pauseCrono();
    elapsedMs = 0;
    updateDisplay();
};

const toggleCrono = () => {
    if (isRunning) {
        pauseCrono();
    } else {
        startCrono();
    }
};

window.addEventListener("DOMContentLoaded", () => {
    updateDisplay();
    setupFullscreen();

    document.body.addEventListener("click", (event) => {
        const clickedReset = event.target.closest("#resetBtn");
        const clickedFullscreen = event.target.closest(".fullscreen-button");
        if (clickedReset || clickedFullscreen) return;
        toggleCrono();
    });

    document.addEventListener("keydown", (event) => {
        if (event.code === "Space" || event.key === " ") {
            event.preventDefault();
            toggleCrono();
        }
    });

    resetButton.addEventListener("click", (event) => {
        event.stopPropagation();
        resetCrono();
    });
});
