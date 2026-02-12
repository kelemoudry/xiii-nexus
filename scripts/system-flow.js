// ==============================
// SYSTEM FLOW JS (HARDENED)
// ==============================

const cards = [
  "1-BOOT","2-SIGNAL","3-PROCESS","4-CACHE","5-FIREWALL",
  "6-ROOT","7-AUTHORITY","8-SYNC","9-ISOLATE",
  "10-OVERFLOW","11-PATCH","12-LOOP","13-TERMINATE"
];

const states = [
  { name: "STABLE", file: "state - stable.png" },
  { name: "REDUNDANT", file: "state - redundant.png" },
  { name: "DEPRECATED", file: "state - deprecated.png" },
  { name: "ELEVATED", file: "state - elevated.png" },
  { name: "CORRUPTED", file: "state - corrupted.png" },
  { name: "EXPERIMENTAL", file: "state - experimental.png" }
];

const labels = ["INPUT", "PROCESS", "OUTPUT"];

const slots = document.querySelectorAll(".card");
const prompt = document.querySelector(".prompt");
const consoleOutput = document.querySelector(".console-output");

let step = 0;
let availableCards = [...cards];
let oracleLookup = {};
let dataReady = false;

// ==============================
// BASE PATH (GitHub Safe)
// ==============================

const BASE_PATH = window.location.hostname.includes("github.io")
  ? "/xiii-nexus"   // 🔥 CHANGE THIS
  : "";

// ==============================
// HELPER FUNCTIONS
// ==============================

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function typeWriter(text, element, delay = 20) {
  let i = 0;
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, delay);
    }
  }
  type();
}

function writeToConsole(text) {
  const line = document.createElement("div");
  consoleOutput.appendChild(line);
  typeWriter(text, line, 15);
}

// ==============================
// LOAD ORACLE (SAFE)
// ==============================

async function loadOracle() {

  try {

    const res = await fetch(`${BASE_PATH}/data/oracle.json`);

    if (!res.ok) throw new Error("Oracle fetch failed");

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("oracle.json is not an array");
    }

    data.forEach(item => {

      const key = `${item.Stage?.toUpperCase()}|${item.Archetype?.toUpperCase()}|${item.State?.toUpperCase()}`;

      oracleLookup[key] = {
        hex: item["Hex Code"],
        meaning: item.Meaning
      };

    });

    dataReady = true;

    console.log("Oracle lookup ready");
    console.log("Total keys:", Object.keys(oracleLookup).length);

  } catch (err) {

    console.error("Oracle failed to load:", err);
    prompt.textContent = "Oracle data failed to load.";
  }
}

loadOracle();

// ==============================
// BUILD CARD DOM
// ==============================

slots.forEach(slot => {
  slot.innerHTML = `
    <div class="card-shell">
      <div class="card-face card-back">
        <img src="../assets/images/card - back.png" alt="Card Back">
      </div>
      <div class="card-face card-front">
        <img class="card-gif" alt="Card Face">
        <img class="state-overlay" alt="State Overlay">
      </div>
    </div>
  `;
});

// ==============================
// CARD CLICK HANDLER
// ==============================

document.body.addEventListener("click", () => {

  if (!dataReady) {
    prompt.textContent = "Loading oracle data...";
    return;
  }

  if (step > 2) return;

  const slot = slots[step];
  const gif = slot.querySelector(".card-gif");
  const stateOverlay = slot.querySelector(".state-overlay");

  // Pick archetype (no repeats)
  const pickIndex = Math.floor(Math.random() * availableCards.length);
  const archetypeFull = availableCards.splice(pickIndex, 1)[0];

  const archetypeName = archetypeFull.split("-")[1]?.toUpperCase();

  // Pick state
  const state = randomFrom(states);
  const stateName = state.name.toUpperCase();

  // Set card visuals
  gif.src = `../assets/gifs/card - ${archetypeName?.toLowercase()}.gif`;
  stateOverlay.src = `../assets/images/${state.file}`;

  slot.classList.add("flipped");

  setTimeout(() => {
    stateOverlay.className = `state-overlay active ${stateName.toLowerCase()}`;
  }, 1000);

  // ==============================
  // LOOKUP ORACLE DATA
  // ==============================

  const stageKey = labels[step].toUpperCase();
  const lookupKey = `${stageKey}|${archetypeName}|${stateName}`;

  console.log("Looking up:", lookupKey);

  const result = oracleLookup[lookupKey];

  const hex = result ? result.hex : "??-??-??";
  const meaning = result ? result.meaning : "NO DATA AVAILABLE";

  writeToConsole(`[${hex}] ${stageKey} :: ${archetypeName} (${stateName})`);
  writeToConsole(meaning);

  step++;

  if (step < 3) {
    prompt.textContent = `Click to draw ${labels[step]}`;
  } else {
    prompt.textContent = "System Flow complete.";
  }
});


