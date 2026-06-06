window.addEventListener("DOMContentLoaded", () => {
  const elements = {
    startButton: document.querySelector(".start-button"),
    workInput: document.getElementById("workInput"),
    restInput: document.getElementById("restInput"),
    roundsInput: document.getElementById("roundsInput"),
    setsInput: document.getElementById("setsInput"),
    restSetsInput: document.getElementById("restSetsInput"),
    form: document.querySelector(".form"),
    timerScreen: document.getElementById("timerScreen"),
    phaseDisplay: document.getElementById("phaseDisplay"),
    timeDisplay: document.getElementById("timeDisplay"),
    errorMessage: document.getElementById("errorMessage"),
    countdownPaused: document.getElementById("countdownPaused"),
    editBtn: document.getElementById("editBtn"),
    editOverlay: document.getElementById("editOverlay"),
    editWork: document.getElementById("editWork"),
    editRest: document.getElementById("editRest"),
    editRounds: document.getElementById("editRounds"),
    editSets: document.getElementById("editSets"),
    editRestSets: document.getElementById("editRestSets"),
    confirmEditBtn: document.getElementById("confirmEditBtn"),
    cancelEditBtn: document.getElementById("cancelEditBtn"),
    editErrorMessage: document.getElementById("editErrorMessage"),
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
    isRunning: false,
    countdownInterval: null,
    preCountdownActive: false,
    preCountdownPaused: false,
    preCountdownCount: 10,
    preCountdownResolve: null,
    phaseActive: false,
    phasePaused: false,
    phaseRemaining: 0,
    editOverlayOpen: false,
    currentWorkout: {
      work: 0,
      rest: 0,
      rounds: 0,
      sets: 0,
      restSets: 0,
    },
  };

  setupFullscreen();
  loadSavedValues();
  attachEvents();

  function attachEvents() {
    elements.startButton.addEventListener("click", handleStartClick);
    elements.editBtn.addEventListener("click", openEditOverlay);
    elements.confirmEditBtn.addEventListener("click", handleConfirmEdit);
    elements.cancelEditBtn.addEventListener("click", closeEditOverlay);

    [
      [elements.workInput, "tabata_work"],
      [elements.restInput, "tabata_rest"],
      [elements.roundsInput, "tabata_rounds"],
      [elements.setsInput, "tabata_sets"],
      [elements.restSetsInput, "tabata_restSets"],
    ].forEach(([input, key]) => {
      input.addEventListener("change", () => localStorage.setItem(key, input.value));
    });

    document.body.addEventListener("click", (event) => {
      if (!state.preCountdownActive && !state.phaseActive) return;
      if (
        event.target.closest("button") ||
        event.target.closest("a") ||
        event.target.closest("input")
      ) return;

      togglePause();
    });

    window.addEventListener("keydown", (event) => {
      if (!state.preCountdownActive && !state.phaseActive) return;
      if (event.code !== "Space") return;
      event.preventDefault();
      togglePause();
    });
  }

  function loadSavedValues() {
    elements.workInput.value = localStorage.getItem("tabata_work") || "";
    elements.restInput.value = localStorage.getItem("tabata_rest") || "";
    elements.roundsInput.value = localStorage.getItem("tabata_rounds") || "";
    elements.setsInput.value = localStorage.getItem("tabata_sets") || "";
    elements.restSetsInput.value = localStorage.getItem("tabata_restSets") || "";
  }

  function handleStartClick() {
    if (state.isRunning) return;

    unlockAudio();
    elements.errorMessage.textContent = "";

    const work = Number(elements.workInput.value);
    const rest = Number(elements.restInput.value);
    const rounds = Number(elements.roundsInput.value);
    const sets = Number(elements.setsInput.value);
    const restSets = Number(elements.restSetsInput.value);

    if (
      !isValid(work, true) ||
      !isValid(rest, false) ||
      !isValid(rounds, true) ||
      !isValid(sets, true) ||
      !isValid(restSets, false)
    ) {
      elements.errorMessage.textContent = "Enter valid values (positive integers)";
      return;
    }

    elements.form.classList.add("hidden");
    elements.timerScreen.classList.remove("hidden");

    state.isRunning = true;
    state.currentWorkout = { work, rest, rounds, sets, restSets };

    startPreCountdown()
      .then(() => {
        elements.editBtn.classList.remove("hidden");
        return runWorkout();
      })
      .finally(() => {
        state.isRunning = false;
        elements.editBtn.classList.add("hidden");
      });
  }

  function togglePause() {
    if (state.preCountdownActive) {
      state.preCountdownPaused ? resumePreCountdown() : pausePreCountdown();
      return;
    }

    if (state.phaseActive) {
      state.phasePaused ? resumePhase() : pausePhase();
    }
  }

  function openEditOverlay() {
    if (!state.isRunning || state.preCountdownActive) return;
    if (state.editOverlayOpen) {
      closeEditOverlay();
      return;
    }

    elements.editWork.value = state.currentWorkout.work;
    elements.editRest.value = state.currentWorkout.rest;
    elements.editRounds.value = state.currentWorkout.rounds;
    elements.editSets.value = state.currentWorkout.sets;
    elements.editRestSets.value = state.currentWorkout.restSets;
    elements.editErrorMessage.textContent = "";

    state.editOverlayOpen = true;
    elements.editOverlay.classList.remove("hidden");
  }

  function closeEditOverlay() {
    if (!state.editOverlayOpen) return;

    state.editOverlayOpen = false;
    elements.editOverlay.classList.add("hidden");
    elements.editErrorMessage.textContent = "";
  }

  function handleConfirmEdit() {
    const work = Number(elements.editWork.value);
    const rest = Number(elements.editRest.value);
    const rounds = Number(elements.editRounds.value);
    const sets = Number(elements.editSets.value);
    const restSets = Number(elements.editRestSets.value);

    if (
      !isValid(work, true) ||
      !isValid(rest, false) ||
      !isValid(rounds, true) ||
      !isValid(sets, true) ||
      !isValid(restSets, false)
    ) {
      elements.editErrorMessage.textContent = "Enter valid values (positive integers)";
      return;
    }

    state.currentWorkout = { work, rest, rounds, sets, restSets };
    elements.workInput.value = work;
    elements.restInput.value = rest;
    elements.roundsInput.value = rounds;
    elements.setsInput.value = sets;
    elements.restSetsInput.value = restSets;

    localStorage.setItem("tabata_work", work);
    localStorage.setItem("tabata_rest", rest);
    localStorage.setItem("tabata_rounds", rounds);
    localStorage.setItem("tabata_sets", sets);
    localStorage.setItem("tabata_restSets", restSets);

    closeEditOverlay();
  }

  function startPreCountdown() {
    return new Promise((resolve) => {
      state.preCountdownActive = true;
      state.preCountdownPaused = false;
      state.preCountdownCount = 10;
      state.preCountdownResolve = resolve;
      elements.countdownPaused.textContent = "";
      elements.countdownPaused.classList.remove("visible");
      elements.timeDisplay.textContent = formatCountdownValue(state.preCountdownCount);
      tickCountdown();
    });
  }

  function tickCountdown() {
    state.countdownInterval = setInterval(() => {
      if (state.preCountdownPaused) return;

      state.preCountdownCount--;

      if (state.preCountdownCount === 3) playSound(sounds.s3);
      if (state.preCountdownCount === 2) playSound(sounds.s2);
      if (state.preCountdownCount === 1) playSound(sounds.s1);

      if (state.preCountdownCount <= 0) {
        clearInterval(state.countdownInterval);
        state.preCountdownActive = false;
        state.preCountdownPaused = false;
        playSound(sounds.go);
        elements.timeDisplay.textContent = "00:00:00";
        state.preCountdownResolve();
        return;
      }

      elements.timeDisplay.textContent = formatCountdownValue(state.preCountdownCount);
    }, 1000);
  }

  function pausePreCountdown() {
    if (!state.preCountdownActive || state.preCountdownPaused) return;
    state.preCountdownPaused = true;
    elements.countdownPaused.textContent = "PAUSED";
    elements.countdownPaused.classList.add("visible");
  }

  function resumePreCountdown() {
    if (!state.preCountdownActive || !state.preCountdownPaused) return;
    state.preCountdownPaused = false;
    elements.countdownPaused.textContent = "";
    elements.countdownPaused.classList.remove("visible");
  }

  function pausePhase() {
    if (!state.phaseActive || state.phasePaused) return;
    state.phasePaused = true;
    elements.countdownPaused.textContent = "PAUSED";
    elements.countdownPaused.classList.add("visible");
  }

  function resumePhase() {
    if (!state.phaseActive || !state.phasePaused) return;
    state.phasePaused = false;
    elements.countdownPaused.textContent = "";
    elements.countdownPaused.classList.remove("visible");
  }

  async function runWorkout() {
    for (let set = 1; set <= state.currentWorkout.sets; set++) {
      for (let round = 1; round <= state.currentWorkout.rounds; round++) {
        const isLastPhase = set === state.currentWorkout.sets && round === state.currentWorkout.rounds;
        await runPhase("WORK", state.currentWorkout.work, round, set, isLastPhase);

        if (state.currentWorkout.rest > 0 && round < state.currentWorkout.rounds) {
          await runPhase("REST", state.currentWorkout.rest, round, set, false);
        }
      }

      if (state.currentWorkout.restSets > 0 && set < state.currentWorkout.sets) {
        await runPhase("REST BETWEEN SETS", state.currentWorkout.restSets, 0, set, false);
      }
    }

    elements.phaseDisplay.textContent = "FINISHED";
    elements.timeDisplay.textContent = "00:00:00";
    elements.editBtn.classList.add("hidden");
    playSound(sounds.finish);
  }

  function runPhase(type, duration, round, set, isLastPhase) {
    return new Promise((resolve) => {
      let time = duration;
      state.phaseActive = true;
      state.phasePaused = false;
      state.phaseRemaining = time;
      elements.countdownPaused.classList.remove("visible");
      elements.countdownPaused.textContent = "";

      updatePhase(type, round, set);
      updateTime(time);

      const interval = setInterval(() => {
        if (state.phasePaused) return;

        time--;
        state.phaseRemaining = time;

        if (time === 3) playSound(sounds.s3);
        if (time === 2) playSound(sounds.s2);
        if (time === 1) playSound(sounds.s1);

        if (time <= 0) {
          clearInterval(interval);
          state.phaseActive = false;
          state.phasePaused = false;
          resolve();
          return;
        }

        updateTime(time);
      }, 1000);
    });
  }

  function updatePhase(type, round, set) {
    if (type === "WORK") {
      elements.phaseDisplay.className = "work";
    } else if (type === "REST") {
      elements.phaseDisplay.className = "rest";
    } else {
      elements.phaseDisplay.className = "set-rest";
    }

    if (type === "REST BETWEEN SETS") {
      elements.phaseDisplay.textContent = `SET ${set} - REST BETWEEN SETS`;
    } else {
      elements.phaseDisplay.textContent = `SET ${set} - ROUND ${round} - ${type}`;
    }
  }

  function updateTime(total) {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    elements.timeDisplay.textContent = formatTime(h, m, s);
  }
});
