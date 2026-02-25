// ==============================
// DOM REFERENCES
// ==============================
const card = document.getElementById("card");
const cardGif = card.querySelector(".card-gif");
const stateOverlay = document.getElementById("stateOverlay");

const consoleSystem = document.querySelector(".console-system");
const consoleOracle = document.querySelector(".console-oracle");
const prompt = document.querySelector(".prompt");

// ==============================
// STATES
// ==============================
const STATES = [
  { name: "STABLE", src: "../assets/images/state - stable.png", class: "stable" },
  { name: "REDUNDANT", src: "../assets/images/state - redundant.png", class: "redundant" },
  { name: "DEPRECATED", src: "../assets/images/state - deprecated.png", class: "deprecated" },
  { name: "ELEVATED", src: "../assets/images/state - elevated.png", class: "elevated" },
  { name: "CORRUPTED", src: "../assets/images/state - corrupted.png", class: "corrupted" },
  { name: "EXPERIMENTAL", src: "../assets/images/state - experimental.png", class: "experimental" }
];

// ==============================
// ORACLE DATA
// ==============================
let systemOracle = [];
let translatedOracle = [];

Promise.all([
  fetch("../data/oracle.json").then(r => r.json()).then(d => systemOracle = d),
  fetch("../data/translated.json").then(r => r.json()).then(d => translatedOracle = d)
]).catch(err => console.error("Failed to load oracle data", err));

// ==============================
// ORACLE MODE MANAGEMENT
// ==============================
const ORACLE_KEY = "oracleMode";
const ORACLE_TIME_KEY = "oracleActivatedAt";
const ORACLE_DURATION = 30 * 60 * 1000; // 30 minutes

function isOracleActive() {
  const active = localStorage.getItem(ORACLE_KEY) === "true";
  const activatedAt = parseInt(localStorage.getItem(ORACLE_TIME_KEY), 10);

  if (!active || !activatedAt) return false;

  const now = Date.now();

  if (now - activatedAt > ORACLE_DURATION) {
    disableOracleMode();
    return false;
  }

  return true;
}

function enableOracleMode() {
  localStorage.setItem(ORACLE_KEY, "true");
  localStorage.setItem(ORACLE_TIME_KEY, Date.now());
  ORACLE_MODE = true;
  prompt.textContent = "Oracle Activated. Scan your card.";
}

function disableOracleMode() {
  localStorage.removeItem(ORACLE_KEY);
  localStorage.removeItem(ORACLE_TIME_KEY);
  ORACLE_MODE = false;
  prompt.textContent = "Oracle Closed.";
}

let ORACLE_MODE = isOracleActive();

// ==============================
// FLIP CARD & SHOW MEANINGS
// ==============================
function revealCard(archetype, stage) {

  const state = STATES[Math.floor(Math.random() * STATES.length)];

  cardGif.src = `../assets/gifs/card - ${archetype.toLowerCase()}.gif`;
  card.classList.add("flipped");

  setTimeout(() => {
    stateOverlay.src = state.src;
    stateOverlay.className = `state-overlay active ${state.class}`;
    stateOverlay.style.display = "block";

    showMeaning(archetype, state.name, stage);
  }, 900);
}

// ==============================
// SHOW SYSTEM + ORACLE MEANING
// ==============================
function showMeaning(archetype, stateName, stage) {

  ORACLE_MODE = isOracleActive(); // always re-check expiration

  const systemEntry = systemOracle.find(row =>
    row.Archetype === archetype &&
    row.State === stateName &&
    row.Stage === stage
  );

  const oracleEntry = ORACLE_MODE ? translatedOracle.find(row =>
    row.Archetype === archetype &&
    row.State === stateName &&
    row.Stage === stage
  ) : null;

  // SYSTEM CONSOLE
  if (systemEntry) {
    typeText(consoleSystem, `[${systemEntry["Hex Code"]}] ${archetype} (${stateName})\n${systemEntry.Meaning}`);
  } else {
    consoleSystem.textContent = `[??-??-??] ${archetype} (${stateName})\nNO DATA AVAILABLE`;
  }

  // ORACLE CONSOLE
  if (ORACLE_MODE && oracleEntry) {
    typeText(consoleOracle, `[${oracleEntry["Hex Code"]}] ${oracleEntry.Meaning}`);
  } else if (!ORACLE_MODE) {
    consoleOracle.textContent = "ORACLE MODE INACTIVE";
  } else {
    consoleOracle.textContent = "NO TRANSLATED DATA AVAILABLE";
  }
}

// ==============================
// TYPING EFFECT
// ==============================
function typeText(element, text) {
  element.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    element.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 18);
}

// ==============================
// NFC LISTENER
// ==============================
async function startNFCListener() {
  if ("NDEFReader" in window) {
    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      console.log("NFC listener active.");
      prompt.textContent = "Scan your card";

      ndef.onreading = event => {
        for (const record of event.message.records) {

          if (record.recordType === "url" || record.recordType === "text") {

            const value = new TextDecoder().decode(record.data);
            console.log("Card scanned:", value);

            const parts = value.split("/");
            const lastSegment = parts[parts.length - 1].toLowerCase();

            // 🔮 ORACLE KEY TOGGLE
            if (lastSegment === "oracle-query") {

              if (isOracleActive()) {
                disableOracleMode();   // Close third eye
              } else {
                enableOracleMode();    // Open third eye
              }

              return;
            }

            const archetype = lastSegment.toUpperCase();
            revealCard(archetype, "Process");
          }
        }
      };

    } catch (err) {
      console.error("NFC scan failed:", err);
      prompt.textContent = "NFC not available on this device.";
    }
  } else {
    console.warn("Web NFC not supported.");
    prompt.textContent = "Web NFC not supported.";
  }
}

// ==============================
// START LISTENER
// ==============================
window.addEventListener("load", () => {
  ORACLE_MODE = isOracleActive();
  startNFCListener();
});
