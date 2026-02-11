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
let systemOracle = [];      // system meanings
let translatedOracle = [];  // translated/oracle meanings

Promise.all([
  fetch("../data/oracle.json").then(r => r.json()).then(d => systemOracle = d),
  fetch("../data/translated.json").then(r => r.json()).then(d => translatedOracle = d)
]).catch(err => console.error("Failed to load oracle data", err));

// ==============================
// ORACLE MODE FLAG
// ==============================
let ORACLE_MODE = true;

// ==============================
// FLIP CARD & SHOW MEANINGS
// ==============================
function revealCard(archetype, stage) {
  // pick random state
  const state = STATES[Math.floor(Math.random() * STATES.length)];

  // Set card face GIF
  cardGif.src = `../assets/gifs/card - ${archetype.toLowerCase()}.gif`;

  // Flip card
  card.classList.add("flipped");

  // Show state overlay after flip
  setTimeout(() => {
    stateOverlay.src = state.src;
    stateOverlay.className = `state-overlay active ${state.class}`;
    stateOverlay.style.display = "block";

    // Show meanings in console
    showMeaning(archetype, state.name, stage);
  }, 900);
}

// ==============================
// SHOW SYSTEM + ORACLE MEANING
// ==============================
function showMeaning(archetype, stateName, stage) {
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
  if (oracleEntry) {
    typeText(consoleOracle, `[${oracleEntry["Hex Code"]}] ${oracleEntry.Meaning}`);
  } else {
    consoleOracle.textContent = `NO TRANSLATED DATA AVAILABLE`;
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
// SIMULATE CARD SCAN (for now)
// ==============================
// In production, replace this with NFC scan listener
function simulateScan() {
  // pick random archetype
  const archetypes = [
    "BOOT","SIGNAL","PROCESS","CACHE","FIREWALL",
    "ROOT","AUTHORITY","SYNC","ISOLATE",
    "OVERFLOW","PATCH","LOOP","TERMINATE"
  ];

  const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
  const stage = "Process"; // could vary based on context

  revealCard(archetype, stage);
}

// Wait 1s and simulate a scan for testing
setTimeout(simulateScan, 1000);
