// ==============================
// GLOBALS
// ==============================

let oracleData = null;
let cardFlipped = false;

// Archetypes must match your file naming EXACTLY
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

// States must match oracle.json keys
const STATES = [
  "STABLE",
  "REDUNDANT",
  "DEPRECATED",
  "ELEVATED",
  "CORRUPTED",
  "EXPERIMENTAL"
];

// ==============================
// LOAD ORACLE
// ==============================

fetch("../data/oracle.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("Oracle fetch failed");
    }
    return response.json();
  })
  .then(data => {
    oracleData = data;
    console.log("Oracle loaded:", oracleData);
  })
  .catch(error => {
    console.error("Oracle failed to load:", error);
  });

// ==============================
// HELPERS
// ==============================

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// ==============================
// MAIN CARD LOGIC
// ==============================

const card = document.querySelector(".card");
const cardFrontImg = document.getElementById("card-front");
const stateOverlay = document.getElementById("state-overlay");
const oracleOutput = document.getElementById("oracle-output");

card.addEventListener("click", () => {
  if (cardFlipped) return;

  cardFlipped = true;

  // 1. Flip the card
  card.classList.add("flipped");

  // 2. After flip animation completes, resolve card + state
  setTimeout(() => {
    runSystemQuery();
  }, 800); // must match CSS flip duration
});

// ==============================
// SYSTEM QUERY
// ==============================

function runSystemQuery() {
  if (!oracleData) {
    oracleOutput.innerText = "ORACLE UNAVAILABLE";
    return;
  }

  // Pick archetype + state
  const archetype = randomFrom(ARCHETYPES);
  const state = randomFrom(STATES);

  console.log("Selected:", archetype, state);

  // 3. Set card face
  cardFrontImg.src = `./assets/gifs/card - ${archetype}.gif`;

  // 4. Set state overlay (PNG or GIF, transparent)
  stateOverlay.src = `./assets/images/state-${state}.png`;
  stateOverlay.classList.add(`state-${state.toLowerCase()}`);

  // 5. Oracle interpretation
  const interpretation = getOracleInterpretation(archetype, state);

  oracleOutput.innerHTML = `
    <h2>${archetype} :: ${state}</h2>
    <p>${interpretation.summary}</p>
    <ul>
      ${interpretation.guidance.map(item => `<li>${item}</li>`).join("")}
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
      summary: "DATA CORRUPTED OR UNAVAILABLE.",
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

