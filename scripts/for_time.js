setupFullscreen();// =========================

const startButton = document.querySelector(".start-button");
const inputs = document.querySelectorAll(".time-row input");
const errorMessage = document.getElementById("errorMessage");

const setup = document.getElementById("setup");
const countdownScreen = document.getElementById("countdownScreen");
const countdownDisplay = document.getElementById("countdownDisplay");

const timerScreen = document.getElementById("timerScreen");
const timerDisplay = document.getElementById("timerDisplay");

// 🔊 SOUNDS
const beep = new Audio("../sounds/beep.wav");

const s3 = new Audio("../sounds/countdown_3.wav");
const s2 = new Audio("../sounds/countdown_2.wav");
const s1 = new Audio("../sounds/countdown_1.wav");
const go = new Audio("../sounds/go.wav");
const finish = new Audio("../sounds/finish.wav");

let countdownInterval;
let timerInterval;

/* =========================
   START
========================= */
startButton.addEventListener("click", () => {

    unlockAudio();

    let hours = Number(inputs[0].value) || 0;
    let minutes = Number(inputs[1].value) || 0;
    let seconds = Number(inputs[2].value) || 0;

    errorMessage.textContent = "";

    if (hours < 0 || minutes < 0 || seconds < 0) {
        errorMessage.textContent = "Values cannot be negative";
        return;
    }

    if (hours === 0 && minutes === 0 && seconds === 0) {
        errorMessage.textContent = "Please enter a time greater than 0";
        return;
    }

    const normalized = normalizeTime(hours, minutes, seconds);

    setup.classList.add("hidden");
    countdownScreen.classList.remove("hidden");

    startCountdown(10, normalized.hours, normalized.minutes, normalized.seconds);
});

/* =========================
   AUDIO UNLOCK (estable)
========================= */
function unlockAudio() {
    const tempSound = new Audio("../sounds/beep.wav");

    tempSound.play()
        .then(() => {
            tempSound.pause();
            tempSound.currentTime = 0;
        })
        .catch(() => { });
}

/* =========================
   COUNTDOWN 10s
========================= */
function startCountdown(totalSeconds, h, m, s) {
    let count = totalSeconds;

    countdownDisplay.textContent = count;

    countdownInterval = setInterval(() => {
        count--;

        // 🔊 3-2-1 en countdown inicial
        if (count === 3) playSound(s3);
        if (count === 2) playSound(s2);
        if (count === 1) playSound(s1);

        if (count <= 0) {
            clearInterval(countdownInterval);

            go.currentTime = 0;
            go.play().catch(() => { });

            startTimer(h, m, s);
            return;
        }

        countdownDisplay.textContent = count;

    }, 1000);
}

/* =========================
   TIMER
========================= */
function startTimer(h, m, s) {
    countdownScreen.classList.add("hidden");
    timerScreen.classList.remove("hidden");

    let total = h * 3600 + m * 60 + s;

    updateDisplay(total);

    timerInterval = setInterval(() => {
        total--;

        // 🔊 3-2-1 en últimos segundos del TIMER
        if (total === 3) playSound(s3);
        if (total === 2) playSound(s2);
        if (total === 1) playSound(s1);

        if (total <= 0) {
            clearInterval(timerInterval);

            updateDisplay(0);

            finish.currentTime = 0;
            finish.play().catch(() => { });

            return;
        }

        updateDisplay(total);

    }, 1000);
}

/* =========================
   DISPLAY
========================= */
function updateDisplay(total) {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    timerDisplay.textContent = formatTime(h, m, s);
}

/* =========================
   SAFE PLAY
========================= */
function playSound(sound) {
    const clone = sound.cloneNode();
    clone.currentTime = 0;
    clone.play().catch(() => { });
}

/* =========================
   NORMALIZE TIME
========================= */
function normalizeTime(h, m, s) {
    let total = h * 3600 + m * 60 + s;

    const hours = Math.floor(total / 3600);
    total %= 3600;

    const minutes = Math.floor(total / 60);
    const seconds = total % 60;

    return { hours, minutes, seconds };
}

/* =========================
   FORMAT TIME
========================= */
function formatTime(h, m, s) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}