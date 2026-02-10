const card = document.getElementById("card");
const stateOverlay = document.getElementById("stateOverlay");
const consoleOutput = document.querySelector(".console-output");

const ARCHETYPE = "BOOT";
const STAGE = "Process";

const states = [
  { name: "STABLE", src: "../assets/images/state - stable.png", class: "stable" },
  { name: "REDUNDANT", src: "../assets/images/state - redundant.png", class: "redundant" },
  { name: "DEPRECATED", src: "../assets/images/state - deprecated.png", class: "deprecated" },
  { name: "ELEVATED", src: "../assets/images/state - elevated.png", class: "elevated" },
  { name: "CORRUPTED", src: "../assets/images/state - corrupted.png", class: "corrupted" },
  { name: "EXPERIMENTAL", src: "../assets/images/state - experimental.png", class: "experimental" }
];

let oracleData = [];
let hasFlipped = false;

/* Load oracle data */
fetch("../data/oracle.json")
  .then(res => res.json())
  .then(data => oracleData = data)
  .catch(err => {
    console.error(err);
    consoleOutput.textContent = "ORACLE DATA LOAD FAILURE";
  });

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

/* Console render */
function renderConsole(stateName) {
  const entry = oracleData.find(row =>
    row.Archetype === ARCHETYPE &&
    row.State === stateName &&
    row.Stage === STAGE
  );

  if (!entry) {
    consoleOutput.textContent =
`[??-??-??]
${ARCHETYPE} (${stateName})
NO DATA AVAILABLE`;
    return;
  }

  typeText(
`[${entry["Hex Code"]}]
${ARCHETYPE} (${stateName})

${entry.Meaning}`
  );
}

/* Typing effect */
function typeText(text) {
  consoleOutput.textContent = "";
  let i = 0;

  const interval = setInterval(() => {
    consoleOutput.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 18);
}
