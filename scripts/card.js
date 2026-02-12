/* =========================
   DOM REFERENCES
========================= */

const card = document.getElementById("card");
const stateOverlay = document.getElementById("stateOverlay");
const consoleOutput = document.querySelector(".console-output");

const ARCHETYPE = document.body.dataset.archetype;
const STAGE = "Process";

let hasFlipped = false;

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
   LOAD DATA
========================= */

if (!oracleMode) {

  fetch("../data/oracle.json")
    .then(res => res.json())
    .then(data => {
      systemData = data;
    })
    .catch(err => {
      console.error(err);
      if (consoleOutput) {
        consoleOutput.textContent = "SYSTEM DATA LOAD FAILURE";
      }
    });

} else {

  Promise.all([
    fetch("../data/oracle.json").then(res => res.json()),
    fetch("../data/translated.json").then(res => res.json())
  ])
  .then(([system, translated]) => {
    systemData = system;
    translatedData = translated;
  })
  .catch(err => {
    console.error(err);
    if (consoleOutput) {
      consoleOutput.textContent = "ORACLE DATA LOAD FAILURE";
    }
  });
}

/* =========================
   CARD CLICK
========================= */

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

/* =========================
   CONSOLE RENDER
========================= */

function renderConsole(stateName) {

  if (!systemData.length) {
    consoleOutput.textContent = "DATA NOT READY";
    return;
  }

  const systemEntry = systemData.find(row =>
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

  if (!oracleMode) {

    // NORMAL MODE
    typeText(
`[${systemEntry["Hex Code"]}]
${ARCHETYPE} (${stateName})

${systemEntry.Meaning}`
    );

  } else {

    // ORACLE MODE
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
