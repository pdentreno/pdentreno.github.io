window.addEventListener("DOMContentLoaded", () => {
  const elements = {
    startButton: document.querySelector(".start-button"),
    inputs: [...document.querySelectorAll(".time-row input")],
    errorMessage: document.getElementById("errorMessage"),
    setup: document.getElementById("setup"),
    countdownScreen: document.getElementById("countdownScreen"),
    countdownDisplay: document.getElementById("countdownDisplay"),
    countdownPaused: document.getElementById("countdownPaused"),
    timerScreen: document.getElementById("timerScreen"),
    timerDisplay: document.getElementById("timerDisplay"),
    timerPaused: document.getElementById("timerPaused"),
  };

  const sounds = {
    s3: new Audio("../sounds/countdown_3.wav"),
    s2: new Audio("../sounds/countdown_2.wav"),
    s1: new Audio("../sounds/countdown_1.wav"),
    go: new Audio("../sounds/go.wav"),
    finish: new Audio("../sounds/finish.wav"),
  };

  Object.values(sounds).forEach((sound) => {
    sound.volume = 1.0;
  });

  const state = {
    countdownInterval: null,
    timerInterval: null,
    preCountdownActive: false,
    preCountdownPaused: false,
    preCountdownCount: 0,
    preCountdownParams: null,
    timerActive: false,
    timerPaused: false,
    timerTotal: 0,
  };

  setupFullscreen();
  loadSavedValues();
  attachEvents();

  function attachEvents() {
    elements.startButton.addEventListener("click", handleStartClick);

    elements.inputs.forEach((input, index) => {
      input.addEventListener("change", () => saveInput(index, input.value));
    });

    document.body.addEventListener("click", (event) => {
      if (!state.preCountdownActive && !state.timerActive) return;
      if (
        event.target.closest("button") ||
        event.target.closest("a") ||
        event.target.closest("input")
      ) return;
      togglePause();
    });

    window.addEventListener("keydown", (event) => {
      if (!state.preCountdownActive && !state.timerActive) return;
      if (event.code !== "Space") return;
      event.preventDefault();
      togglePause();
    });
  }

  function loadSavedValues() {
    elements.inputs[0].value = localStorage.getItem("fortime_hours") || "";
    elements.inputs[1].value = localStorage.getItem("fortime_minutes") || "";
    elements.inputs[2].value = localStorage.getItem("fortime_seconds") || "";
  }

  function saveInput(index, value) {
    const keys = ["fortime_hours", "fortime_minutes", "fortime_seconds"];
    localStorage.setItem(keys[index], value);
  }

  function handleStartClick() {
    unlockAudio();

    const hours = Number(elements.inputs[0].value) || 0;
    const minutes = Number(elements.inputs[1].value) || 0;
    const seconds = Number(elements.inputs[2].value) || 0;

    elements.errorMessage.textContent = "";

    if (hours < 0 || minutes < 0 || seconds < 0) {
      elements.errorMessage.textContent = "Values cannot be negative";
      return;
    }

    if (hours === 0 && minutes === 0 && seconds === 0) {
      elements.errorMessage.textContent = "Please enter a time greater than 0";
      return;
    }

    const normalized = normalizeTime(hours, minutes, seconds);

    elements.setup.classList.add("hidden");
    elements.countdownScreen.classList.remove("hidden");

    startCountdown(10, normalized.hours, normalized.minutes, normalized.seconds);
  }

  function togglePause() {
    if (state.preCountdownActive) {
      state.preCountdownPaused ? resumePreCountdown() : pausePreCountdown();
      return;
    }

    if (state.timerActive) {
      state.timerPaused ? resumeTimer() : pauseTimer();
    }
  }

  function startCountdown(totalSeconds, h, m, s) {
    state.preCountdownActive = true;
    state.preCountdownPaused = false;
    state.preCountdownCount = totalSeconds;
    state.preCountdownParams = { h, m, s };

    elements.countdownDisplay.textContent = formatCountdownValue(state.preCountdownCount);
    elements.countdownPaused.textContent = "";
    elements.countdownPaused.classList.remove("visible");

    startCountdownInterval();
  }

  function startCountdownInterval() {
    state.countdownInterval = setInterval(() => {
      state.preCountdownCount--;

      if (state.preCountdownCount === 3) playSound(sounds.s3);
      if (state.preCountdownCount === 2) playSound(sounds.s2);
      if (state.preCountdownCount === 1) playSound(sounds.s1);

      if (state.preCountdownCount <= 0) {
        clearInterval(state.countdownInterval);
        state.preCountdownActive = false;
        state.preCountdownPaused = false;
        elements.countdownPaused.textContent = "";
        elements.countdownPaused.classList.remove("visible");

        playSound(sounds.go);
        startTimer(state.preCountdownParams.h, state.preCountdownParams.m, state.preCountdownParams.s);
        return;
      }

      elements.countdownDisplay.textContent = formatCountdownValue(state.preCountdownCount);
    }, 1000);
  }

  function pausePreCountdown() {
    if (!state.preCountdownActive || state.preCountdownPaused) return;

    clearInterval(state.countdownInterval);
    state.preCountdownPaused = true;
    elements.countdownPaused.textContent = "PAUSED";
    elements.countdownPaused.classList.add("visible");
  }

  function resumePreCountdown() {
    if (!state.preCountdownActive || !state.preCountdownPaused) return;

    state.preCountdownPaused = false;
    elements.countdownPaused.textContent = "";
    elements.countdownPaused.classList.remove("visible");
    startCountdownInterval();
  }

  function pauseTimer() {
    if (!state.timerActive || state.timerPaused) return;

    state.timerPaused = true;
    elements.timerPaused.textContent = "PAUSED";
    elements.timerPaused.classList.add("visible");
  }

  function resumeTimer() {
    if (!state.timerActive || !state.timerPaused) return;

    state.timerPaused = false;
    elements.timerPaused.textContent = "";
    elements.timerPaused.classList.remove("visible");
  }

  function startTimer(h, m, s) {
    elements.countdownScreen.classList.add("hidden");
    elements.timerScreen.classList.remove("hidden");

    state.timerActive = true;
    state.timerPaused = false;
    state.timerTotal = h * 3600 + m * 60 + s;

    updateDisplay(state.timerTotal);
    startTimerInterval();
  }

  function startTimerInterval() {
    state.timerInterval = setInterval(() => {
      if (state.timerPaused) return;

      state.timerTotal--;

      if (state.timerTotal === 3) playSound(sounds.s3);
      if (state.timerTotal === 2) playSound(sounds.s2);
      if (state.timerTotal === 1) playSound(sounds.s1);

      if (state.timerTotal <= 0) {
        clearInterval(state.timerInterval);
        state.timerActive = false;
        state.timerPaused = false;
        elements.timerPaused.textContent = "";
        elements.timerPaused.classList.remove("visible");
        updateDisplay(0);
        playSound(sounds.finish);
        return;
      }

      updateDisplay(state.timerTotal);
    }, 1000);
  }

  function updateDisplay(total) {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    elements.timerDisplay.textContent = formatTime(h, m, s);
  }
});
