const card = document.getElementById("card");
const stateOverlay = document.getElementById("stateOverlay");
const consoleOutput = document.querySelector(".console-output");

// ==============================
// CONFIG
// ==============================

// Prefer data attribute, fallback to constant
const ARCHETYPE = card?.dataset?.archetype || "BOOT";
const STAGE = "Process";

// Oracle mode flag
const params = new URLSearchParams(window.location.search);
const ORACLE_MODE = params.get("oraclemode"); // null | query

// ==============================
// STATE DATA
// ==============================

const states = [
  { name: "STABLE", src: "../assets/images/state - stable.png", class: "stable" },
  { name: "REDUNDANT", src: "../assets/images/state - redundant.png", class: "redundant" },
  { name: "DEPRECATED", src: "../assets/images/state - deprecated.png", class: "deprecated" },
  { name: "ELEVATED", src: "../assets/images/state - elevated.png", class: "elevated" },
  { name: "CORRUPTED", src: "../assets/images/state - corrupted.png", class: "corrupted" },
  { name: "EXPERIMENTAL", src: "../assets/images/state - experimental.png", class: "experimental" }
];

let oracleData = [];
let oracleTranslated = [];
let hasFlipped = false;

// ==============================
// LOAD DATA
// ==============================

// Always load system meanings
fetch("../data/oracle.json")
  .then(res => res.json())
  .then(data => oracleData = data)
  .catch(err => {
    console.error(err);
    consoleOutput.textContent = "ORACLE DATA LOAD FAILURE";
  });

// Only load translated meanings if oracle-query is active
if (ORACLE_MODE === "query") {
  fetch("../data/translated.json")
    .then(res => res.json())
    .then(data => oracleTranslated = data)
    .catch(err => console.warn("Translated oracle unavailable", err));
}

// ==============================
// INTERACTION
// ==============================

card.addEventListener("click", () => {
  if (hasFlipped) return;
  hasFlipped = true;

  card.classList.add("flipped");

  setTimeout(() => {
    const state = states[Math.floor(Math.random() * states.length)];

    stateOverlay.src = state.src;
    stateOverlay.className = `state-overlay ${state.class} active`;
    stateOverlay.style.display = "block";

    renderConsole(state.name);
  }, 900);
});

// ==============================
// CONSOLE RENDER
// ==============================

function renderConsole(stateName) {
  const systemEntry = oracleData.find(row =>
    row.Archetype === ARCHETYPE &&
    row.State === stateName &&
    row.Stage === STAGE
  );

  if (!systemEntry) {
    consoleOutput.textContent =
`[??-??-??]
${ARCHETYPE} (${stateName})
NO DATA AVAILABLE`;
    return;
  }

  // Default output (normal mode)
  let output =
`[${systemEntry["Hex Code"]}]
${ARCHETYPE} (${stateName})

${systemEntry.Meaning}`;

  // Oracle-query enhancement (adds interpretation, does NOT replace)
  if (ORACLE_MODE === "query" && oracleTranslated.length) {
    const translatedEntry = oracleTranslated.find(row =>
      row.Archetype === ARCHETYPE &&
      row.State === stateName &&
      row.Stage === STAGE
    );

    if (translatedEntry) {
      output += `

— ORACLE INTERPRETATION —

${translatedEntry.Meaning}`;
    }
  }

  typeText(output);
}

// ==============================
// TYPE EFFECT
// ==============================

function typeText(text) {
  consoleOutput.textContent = "";
  let i = 0;

  const interval = setInterval(() => {
    consoleOutput.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 18);
}
