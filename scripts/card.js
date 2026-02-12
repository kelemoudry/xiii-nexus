/* =========================
   DOM REFERENCES
========================= */

const card = document.getElementById("card");
const stateOverlay = document.getElementById("stateOverlay");
const consoleOutput = document.querySelector(".console-output");

const ARCHETYPE = document.body.dataset.archetype?.toUpperCase();
const STAGE = "Process";

let hasFlipped = false;
let dataReady = false;

/* =========================
   STATE DEFINITIONS
========================= */

const states = [
  { name: "STABLE", src: "../assets/images/state - stable.png", class: "stable" },
  { name: "REDUNDANT", src: "../assets/images/state - redundant.png", class: "redundant" },
  { name: "DEPRECATED", src: "../assets/images/state - deprecated.png", class: "deprecated" },
  { name: "ELEVATED", src: "../assets/images/state - elevated.png", class: "elevated" },
  { name: "CORRUPTED", src: "../assets/images/state - corrupted.png", class: "corrupted" },
  { name: "EXPERIMENTAL", src: "../assets/images/state - experimental.png", class: "experimental" }
];

/* =========================
   ORACLE MODE
========================= */

const oracleMode = sessionStorage.getItem("oracleMode") === "true";

let systemData = [];
let translatedData = [];

/* =========================
   BASE PATH (GitHub Safe)
========================= */

const BASE_PATH = window.location.hostname.includes("github.io")
  ? "/xiii-nexus"   // 🔥 CHANGE THIS
  : "";

/* =========================
   LOAD DATA
========================= */

async function loadData() {

  try {

    const systemResponse = await fetch(`${BASE_PATH}/data/oracle.json`);
    const systemJson = await systemResponse.json();

    if (!Array.isArray(systemJson)) {
      throw new Error("oracle.json is not an array.");
    }

    systemData = systemJson;

    if (oracleMode) {
      try {
        const translatedResponse = await fetch(`${BASE_PATH}/data/translated.json`);
        translatedData = await translatedResponse.json();
      } catch {
        // fallback if filename is translate.json
        const fallback = await fetch(`${BASE_PATH}/data/translate.json`);
        translatedData = await fallback.json();
      }
    }

    dataReady = true;

    console.log("Data loaded successfully.");
    console.log("System entries:", systemData.length);

  } catch (err) {

    console.error("DATA LOAD FAILURE:", err);

    if (consoleOutput) {
      consoleOutput.textContent = "DATA LOAD FAILURE";
    }
  }
}

loadData();

/* =========================
   CARD CLICK
========================= */

card.addEventListener("click", () => {

  if (hasFlipped || !dataReady) {
    if (!dataReady) {
      consoleOutput.textContent = "LOADING DATA...";
    }
    return;
  }

  hasFlipped = true;

  card.classList.add("flipped");

  setTimeout(() => {

    const state = states[Math.floor(Math.random() * states.length)];

    stateOverlay.src = state.src;
    stateOverlay.className = `state-overlay ${state.class} active`;
    stateOverlay.style.display = "block";

    renderConsole(state.name.toUpperCase());

  }, 900);
});

/* =========================
   CONSOLE RENDER
========================= */

function renderConsole(stateName) {

  console.log("Searching for:", ARCHETYPE, stateName, STAGE);

  const systemEntry = systemData.find(row =>
    row.Archetype?.toUpperCase() === ARCHETYPE &&
    row.State?.toUpperCase() === stateName &&
    row.Stage === STAGE
  );

  if (!systemEntry) {

    console.warn("NO MATCH FOUND");

    consoleOutput.textContent =
`[??-??-??]
${ARCHETYPE} (${stateName})
NO DATA AVAILABLE`;

    return;
  }

  if (!oracleMode) {

    typeText(
`[${systemEntry["Hex Code"]}]
${ARCHETYPE} (${stateName})

${systemEntry.Meaning}`
    );

  } else {

    const translatedEntry = translatedData.find(row =>
      row["Hex Code"] === systemEntry["Hex Code"]
    );

    const translatedMeaning = translatedEntry
      ? translatedEntry.Meaning
      : "NO TRANSLATED DATA AVAILABLE";

    typeText(
`[${systemEntry["Hex Code"]}]
${ARCHETYPE} (${stateName})

SYSTEM:
${systemEntry.Meaning}

ORACLE:
${translatedMeaning}`
    );
  }
}

/* =========================
   TYPING EFFECT
========================= */

function typeText(text) {

  consoleOutput.textContent = "";

  let i = 0;

  const interval = setInterval(() => {

    consoleOutput.textContent += text[i];
    i++;

    if (i >= text.length) {
      clearInterval(interval);
    }

  }, 18);
}
