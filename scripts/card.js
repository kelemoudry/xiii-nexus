// ==============================
// DOM REFERENCES (MATCH YOUR HTML)
// ==============================

const card = document.getElementById("card");
const cardFrontImg = document.getElementById("cardFront"); // <-- make sure this exists
const stateOverlay = document.getElementById("stateOverlay");
const oracleOutput = document.getElementById("oracle-output");

// ==============================
// DATA
// ==============================

const ARCHETYPES = [
  "BOOT",
  "SIGNAL",
  "PROCESS",
  "CACHE",
  "FIREWALL",
  "ROOT",
  "AUTHORITY",
  "SYNC",
  "ISOLATE",
  "OVERFLOW",
  "PATCH",
  "LOOP",
  "TERMINATE"
];

const STATES = [
  { key: "STABLE", src: "../assets/images/state - stable.png", class: "stable" },
  { key: "REDUNDANT", src: "../assets/images/state - redundant.png", class: "redundant" },
  { key: "DEPRECATED", src: "../assets/images/state - deprecated.png", class: "deprecated" },
  { key: "ELEVATED", src: "../assets/images/state - elevated.png", class: "elevated" },
  { key: "CORRUPTED", src: "../assets/images/state - corrupted.png", class: "corrupted" },
  { key: "EXPERIMENTAL", src: "../assets/images/state - experimental.png", class: "experimental" }
];

let oracleData = null;
let hasFlipped = false;

// ==============================
// LOAD ORACLE
// ==============================

fetch("../data/oracle.json")
  .then(res => {
    if (!res.ok) throw new Error("Oracle fetch failed");
    return res.json();
  })
  .then(data => {
    oracleData = data;
    console.log("Oracle loaded:", oracleData);
  })
  .catch(err => {
    console.error("Oracle failed to load:", err);
  });

// ==============================
// HELPERS
// ==============================

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// ==============================
// MAIN INTERACTION
// ==============================

card.addEventListener("click", () => {
  if (hasFlipped) return;
  hasFlipped = true;

  // Flip animation
  card.classList.add("flipped");

  // After flip finishes
  setTimeout(() => {
    runSystemQuery();
  }, 1000); // MUST match your CSS flip duration
});

// ==============================
// SYSTEM QUERY
// ==============================

function runSystemQuery() {
  if (!oracleData) {
    oracleOutput.innerText = "ORACLE OFFLINE";
    return;
  }

  const archetype = randomFrom(ARCHETYPES);
  const stateObj = randomFrom(STATES);

  console.log("Selected:", archetype, stateObj.key);

  // Set card face
  if (cardFrontImg) {
    cardFrontImg.src = `../assets/gifs/card - ${archetype}.gif`;
  }

  // Set state overlay
  stateOverlay.src = stateObj.src;
  stateOverlay.className = `state-overlay ${stateObj.class} active`;
  stateOverlay.style.display = "block";

  // Oracle interpretation
  const interpretation = getOracleInterpretation(archetype, stateObj.key);

  oracleOutput.innerHTML = `
    <h2>${archetype} :: ${stateObj.key}</h2>
    <p>${interpretation.summary}</p>
    <ul>
      ${interpretation.guidance.map(line => `<li>${line}</li>`).join("")}
    </ul>
  `;
}

// ==============================
// ORACLE INTERPRETER
// ==============================

function getOracleInterpretation(archetype, state) {
  const cardData = oracleData.archetypes[archetype];
  const stateData = oracleData.states[state];

  if (!cardData || !stateData) {
    return {
      summary: "INTERPRETATION UNAVAILABLE",
      guidance: []
    };
  }

  return {
    summary: `${cardData.coreMeaning} — ${stateData.modifier}`,
    guidance: [
      ...cardData.guidance,
      ...stateData.guidance
    ]
  };
}
