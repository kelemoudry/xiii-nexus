const eye = document.querySelector(".eye");
const message = document.getElementById("oracleMessage");

const ORACLE_KEY = "oracleMode";
const ORACLE_TIME_KEY = "oracleActivatedAt";
const ORACLE_DURATION = 30 * 60 * 1000;

function isOracleActive() {
  const active = localStorage.getItem(ORACLE_KEY) === "true";
  const activatedAt = parseInt(localStorage.getItem(ORACLE_TIME_KEY), 10);

  if (!active || !activatedAt) return false;

  if (Date.now() - activatedAt > ORACLE_DURATION) {
    localStorage.removeItem(ORACLE_KEY);
    localStorage.removeItem(ORACLE_TIME_KEY);
    return false;
  }

  return true;
}

function enableOracle() {
  localStorage.setItem(ORACLE_KEY, "true");
  localStorage.setItem(ORACLE_TIME_KEY, Date.now());
}

function disableOracle() {
  localStorage.removeItem(ORACLE_KEY);
  localStorage.removeItem(ORACLE_TIME_KEY);
}

function playOpenSequence() {
  message.textContent = "Oracle Daemon Initialized.";
  message.classList.add("visible");

  requestAnimationFrame(() => {
    eye.classList.add("open");
  });
}

function playCloseSequence() {
  message.textContent = "Oracle Daemon Suspended.";
  message.classList.add("visible");

  // Force fully open first
  eye.classList.remove("closing");
  eye.classList.add("open");

  // Let it render
  setTimeout(() => {
    eye.classList.add("closing");
    eye.classList.remove("open");

    // After animation completes, clean class
    setTimeout(() => {
      eye.classList.remove("closing");
    }, 1400);

  }, 100);
}

window.addEventListener("load", () => {

  const active = isOracleActive();

  if (active) {
    disableOracle();
    playCloseSequence();
  } else {
    enableOracle();
    playOpenSequence();
  }

});
