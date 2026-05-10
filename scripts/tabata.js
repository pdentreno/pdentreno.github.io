setupFullscreen();

// ==========================
// ELEMENTOS
// ==========================
const startButton = document.querySelector(".start-button");

const workInput = document.getElementById("workInput");
const restInput = document.getElementById("restInput");
const roundsInput = document.getElementById("roundsInput");
const setsInput = document.getElementById("setsInput");
const restSetsInput = document.getElementById("restSetsInput");

const form = document.querySelector(".form");
const timerScreen = document.getElementById("timerScreen");

const phaseDisplay = document.getElementById("phaseDisplay");
const timeDisplay = document.getElementById("timeDisplay");
const errorMessage = document.getElementById("errorMessage");
const countdownPaused = document.getElementById("countdownPaused");

// ==========================
// SOUNDS
// ==========================
const s3 = new Audio("../sounds/countdown_3.wav");
const s2 = new Audio("../sounds/countdown_2.wav");
const s1 = new Audio("../sounds/countdown_1.wav");
const go = new Audio("../sounds/go.wav");
const finish = new Audio("../sounds/finish.wav");

// ==========================
// STATE
// ==========================
let isRunning = false;

let countdownInterval = null;

let preCountdownActive = false;
let preCountdownPaused = false;
let preCountdownCount = 10;
let preCountdownResolve = null;

let phaseActive = false;
let phasePaused = false;
let phaseRemaining = 0;

// ==========================
// INIT
// ==========================
window.addEventListener("DOMContentLoaded", () => {
    timerScreen.classList.add("hidden");
    errorMessage.textContent = "";

    workInput.value = localStorage.getItem("tabata_work") || "";
    restInput.value = localStorage.getItem("tabata_rest") || "";
    roundsInput.value = localStorage.getItem("tabata_rounds") || "";
    setsInput.value = localStorage.getItem("tabata_sets") || "";
    restSetsInput.value = localStorage.getItem("tabata_restSets") || "";

    document.body.addEventListener("click", (event) => {
        if (!preCountdownActive && !phaseActive) return;
        if (event.target.closest("button")) return;

        if (preCountdownActive) {
            preCountdownPaused ? resumePreCountdown() : pausePreCountdown();
        } else {
            phasePaused ? resumePhase() : pausePhase();
        }
    });

    window.addEventListener("keydown", (event) => {
        if (!preCountdownActive && !phaseActive) return;
        if (event.code !== "Space") return;

        event.preventDefault();
        if (preCountdownActive) {
            preCountdownPaused ? resumePreCountdown() : pausePreCountdown();
        } else {
            phasePaused ? resumePhase() : pausePhase();
        }
    });
});

// ==========================
// SAVE VALUES
// ==========================
workInput.addEventListener("change", () => localStorage.setItem("tabata_work", workInput.value));
restInput.addEventListener("change", () => localStorage.setItem("tabata_rest", restInput.value));
roundsInput.addEventListener("change", () => localStorage.setItem("tabata_rounds", roundsInput.value));
setsInput.addEventListener("change", () => localStorage.setItem("tabata_sets", setsInput.value));
restSetsInput.addEventListener("change", () => localStorage.setItem("tabata_restSets", restSetsInput.value));

// ==========================
// START
// ==========================
startButton.addEventListener("click", () => {
    if (isRunning) return;

    unlockAudio();
    errorMessage.textContent = "";

    const work = Number(workInput.value);
    const rest = Number(restInput.value);
    const rounds = Number(roundsInput.value);
    const sets = Number(setsInput.value);
    const restSets = Number(restSetsInput.value);

    if (
        !isValid(work, true) ||
        !isValid(rest, false) ||
        !isValid(rounds, true) ||
        !isValid(sets, true) ||
        !isValid(restSets, false)
    ) {
        errorMessage.textContent = "Enter valid values (positive integers)";
        return;
    }

    form.classList.add("hidden");
    timerScreen.classList.remove("hidden");

    isRunning = true;

    startPreCountdown()
        .then(() => runWorkout(work, rest, rounds, sets, restSets))
        .finally(() => {
            isRunning = false;
        });
});

// ==========================
// AUDIO
// ==========================
function unlockAudio() {
    const temp = new Audio("../sounds/beep.wav");
    temp.play().then(() => {
        temp.pause();
        temp.currentTime = 0;
    }).catch(() => {});
}

function playSound(sound) {
    const c = sound.cloneNode();
    c.currentTime = 0;
    c.play().catch(() => {});
}

// ==========================
// PRE COUNTDOWN (FIXED + PAUSE)
// ==========================
function startPreCountdown() {
    return new Promise(resolve => {

        preCountdownActive = true;
        preCountdownPaused = false;

        preCountdownCount = 10;
        preCountdownResolve = resolve;

        countdownPaused.textContent = "";
        countdownPaused.classList.remove("visible");

        timeDisplay.textContent = preCountdownCount; // 👈 sin 09

        tickCountdown();
    });
}

function tickCountdown() {

    countdownInterval = setInterval(() => {

        if (preCountdownPaused) return;

        preCountdownCount--;

        if (preCountdownCount === 3) playSound(s3);
        if (preCountdownCount === 2) playSound(s2);
        if (preCountdownCount === 1) playSound(s1);

        if (preCountdownCount <= 0) {
            clearInterval(countdownInterval);

            preCountdownActive = false;
            preCountdownPaused = false;

            go.currentTime = 0;
            go.play().catch(() => { });

            timeDisplay.textContent = "00:00:00";

            preCountdownResolve();
            return;
        }

        timeDisplay.textContent = preCountdownCount; // 👈 sin padStart

    }, 1000);
}

// ==========================
// PAUSE / RESUME
// ==========================
function pausePreCountdown() {
    if (!preCountdownActive || preCountdownPaused) return;

    preCountdownPaused = true;
    countdownPaused.textContent = "PAUSED";
    countdownPaused.classList.add("visible");
}

function resumePreCountdown() {
    if (!preCountdownActive || !preCountdownPaused) return;

    preCountdownPaused = false;
    countdownPaused.classList.remove("visible");
    countdownPaused.textContent = "";
}

function pausePhase() {
    if (!phaseActive || phasePaused) return;

    phasePaused = true;
    countdownPaused.textContent = "PAUSED";
    countdownPaused.classList.add("visible");
}

function resumePhase() {
    if (!phaseActive || !phasePaused) return;

    phasePaused = false;
    countdownPaused.classList.remove("visible");
    countdownPaused.textContent = "";
}

// ==========================
// WORKOUT FLOW (INTACTO)
// ==========================
async function runWorkout(work, rest, rounds, sets, restSets) {

    for (let set = 1; set <= sets; set++) {

        for (let round = 1; round <= rounds; round++) {

            const isLastPhase = set === sets && round === rounds;
            await runPhase("WORK", work, round, set, isLastPhase);

            if (rest > 0 && round < rounds) {
                await runPhase("REST", rest, round, set, false);
            }
        }

        if (restSets > 0 && set < sets) {
            await runPhase("REST BETWEEN SETS", restSets, 0, set, false);
        }
    }

    phaseDisplay.textContent = "FINISHED";
    timeDisplay.textContent = "00:00:00";

    finish.currentTime = 0;
    finish.play().catch(() => {});
}

// ==========================
// PHASE ENGINE (SIN CAMBIOS)
// ==========================
function runPhase(type, duration, round, set, isLastPhase) {
    return new Promise(resolve => {

        let time = duration;

        phaseActive = true;
        phasePaused = false;
        phaseRemaining = time;
        countdownPaused.classList.remove("visible");
        countdownPaused.textContent = "";

        updatePhase(type, round, set);
        updateTime(time);

        const interval = setInterval(() => {
            if (phasePaused) return;

            time--;
            phaseRemaining = time;

            if (time === 3) playSound(s3);
            if (time === 2) playSound(s2);
            if (time === 1) playSound(s1);

            if (time <= 0) {
                clearInterval(interval);
                phaseActive = false;
                phasePaused = false;
                resolve();
                return;
            }

            updateTime(time);

        }, 1000);
    });
}

// ==========================
// UI
// ==========================
function updatePhase(type, round, set) {

    if (type === "WORK") phaseDisplay.className = "work";
    else if (type === "REST") phaseDisplay.className = "rest";
    else phaseDisplay.className = "set-rest";

    if (type === "REST BETWEEN SETS") {
        phaseDisplay.textContent = `SET ${set} - REST BETWEEN SETS`;
    } else {
        phaseDisplay.textContent = `SET ${set} - ROUND ${round} - ${type}`;
    }
}

function updateTime(total) {

    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    timeDisplay.textContent =
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ==========================
// VALIDATION
// ==========================
function isValid(value, required) {
    if (required) return Number.isInteger(value) && value > 0;
    return Number.isInteger(value) && value >= 0;
}