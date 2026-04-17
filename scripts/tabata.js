setupFullscreen();// =========================

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

// ==========================
// STATE
// ==========================
let isRunning = false;
let interval = null;

// ==========================
// INIT
// ==========================
window.addEventListener("DOMContentLoaded", () => {
    timerScreen.classList.add("hidden");
    errorMessage.textContent = "";
});

// ==========================
// START
// ==========================
startButton.addEventListener("click", () => {
    if (isRunning) return;

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
        errorMessage.textContent = "Enter valid values ​​(positive integers)";
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
// PRE COUNTDOWN (10s)
// ==========================
function startPreCountdown() {
    return new Promise(resolve => {

        let count = 10;

        phaseDisplay.textContent = "";
        timeDisplay.textContent = `${String(count).padStart(2, "0")}`;

        interval = setInterval(() => {

            count--;

            timeDisplay.textContent = String(Math.max(count, 0));
            if (count < 0) {
                clearInterval(interval);
                resolve();
            }

        }, 1000);
    });
}

// ==========================
// WORKOUT FLOW
// ==========================
async function runWorkout(work, rest, rounds, sets, restSets) {

    for (let set = 1; set <= sets; set++) {

        for (let round = 1; round <= rounds; round++) {

            await runPhase("WORK", work, round, set);

            if (rest > 0 && round < rounds) {
                await runPhase("REST", rest, round, set);
            }
        }

        if (restSets > 0 && set < sets) {
            await runPhase("REST BETWEEN SETS", restSets, 0, set);
        }
    }

    phaseDisplay.textContent = "FINISHED";
    timeDisplay.textContent = "00:00:00";
}

// ==========================
// PHASE ENGINE
// ==========================
function runPhase(type, duration, round, set) {
    return new Promise(resolve => {

        let time = duration;

        updatePhase(type, round, set);
        updateTime(time);

        interval = setInterval(() => {

            time--;

            updateTime(time);

            if (time < 0) {
                clearInterval(interval);
                resolve();
            }

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