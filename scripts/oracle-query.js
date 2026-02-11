const card = document.getElementById("card");
const stateOverlay = document.getElementById("stateOverlay");
const systemConsole = document.getElementById("systemConsole");
const oracleConsole = document.getElementById("oracleConsole");
const simulateBtn = document.getElementById("simulateScan");

const cardGif = card.querySelector(".card-gif");

const states = [
  { name: "STABLE", src: "../assets/images/state - stable.png", class: "stable" },
  { name: "REDUNDANT", src: "../assets/images/state - redundant.png", class: "redundant" },
  { name: "DEPRECATED", src: "../assets/images/state - deprecated.png", class: "deprecated" },
  { name: "ELEVATED", src: "../assets/images/state - elevated.png", class: "elevated" },
  { name: "CORRUPTED", src: "../assets/images/state - corrupted.png", class: "corrupted" },
  { name: "EXPERIMENTAL", src: "../assets/images/state - experimental.png", class: "experimental" }
];

let oracleData = [];
let translatedData = [];
let hasFlipped = false;

/* LOAD BOTH JSON FILES */
Promise.all([
  fetch("../data/oracle.json").then(r => r.json()),
  fetch("../data/translated.json").then(r => r.json())
]).then(([systemData, oracleDataTranslated]) => {
  oracleData = systemData;
  translatedData = oracleDataTranslated;
}).catch(err => {
  console.error("Oracle data load failure", err);
});

/* SIMULATED NFC SCAN */
simulateBtn.addEventListener("click", () => {

  if (hasFlipped) return;
  hasFlipped = true;

  const ARCHETYPE = "BOOT"; // Later: parsed from scanned URL
  const STAGE = "Process";

  const state = states[Math.floor(Math.random() * states.length)];

  cardGif.src = `../assets/gifs/card - ${ARCHETYPE.toLowerCase()}.gif`;

  card.classList.add("flipped");

  setTimeout(() => {
    stateOverlay.src = state.src;
    stateOverlay.className = `state-overlay active ${state.class}`;

    renderMeaning(ARCHETYPE, state.name, STAGE);
  }, 900);

});

/* RENDER MEANINGS */
function renderMeaning(archetype, stateName, stage) {

  const systemEntry = oracleData.find(row =>
    row.Archetype === archetype &&
    row.State === stateName &&
    row.Stage === stage
  );

  const oracleEntry = translatedData.find(row =>
    row.Archetype === archetype &&
    row.State === stateName &&
    row.Stage === stage
  );

  typeText(systemConsole,
`[${systemEntry?.["Hex Code"] || "??-??-??"}]

${systemEntry?.Meaning || "NO SYSTEM DATA"}`);

  typeText(oracleConsole,
`${oracleEntry?.Meaning || "NO ORACLE DATA"}`);
}

/* TYPE EFFECT */
function typeText(element, text) {
  element.textContent = "";
  let i = 0;

  const interval = setInterval(() => {
    element.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 15);
}
