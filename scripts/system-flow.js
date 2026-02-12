// ==============================
// SYSTEM FLOW JS
// ==============================

const cards = [
  "1-boot","2-signal","3-process","4-cache","5-firewall",
  "6-root","7-authority","8-sync","9-isolate",
  "10-overflow","11-patch","12-loop","13-terminate"
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

// ==============================
// HELPER FUNCTIONS
// ==============================

// Random array item
function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Typewriter effect
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

// Write line to console with typewriter
function writeToConsole(text) {
  const line = document.createElement("div");
  consoleOutput.appendChild(line);
  typeWriter(text, line, 15);
}

// ==============================
// LOAD ORACLE
// ==============================

fetch("../data/oracle.json")
  .then(res => {
    if (!res.ok) throw new Error("Oracle fetch failed");
    return res.json();
  })
  .then(data => {
    // Build lookup: STAGE|ARCHETYPE|STATE => { hex, meaning }
    data.forEach(item => {
      const key = `${item.Stage.toUpperCase()}|${item.Archetype.toUpperCase()}|${item.State.toUpperCase()}`;
      oracleLookup[key] = {
        hex: item["Hex Code"],
        meaning: item.Meaning
      };
    });
    console.log("Oracle lookup ready", oracleLookup);
  })
  .catch(err => {
    console.error("Oracle failed to load:", err);
  });

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
  if (step > 2) return; // All slots filled
  if (!oracleLookup) return;

  const slot = slots[step];
  const gif = slot.querySelector(".card-gif");
  const stateOverlay = slot.querySelector(".state-overlay");

  // Pick archetype (no repeats)
  const pickIndex = Math.floor(Math.random() * availableCards.length);
  const archetype = availableCards.splice(pickIndex, 1)[0];
  const archetypeName = archetype.split("-")[1];

  // Pick state
  const state = randomFrom(states);
  const stateName = state.name;

  // Set card GIF and state overlay
  gif.src = `../assets/gifs/card - ${archetypeName}.gif`;
  stateOverlay.src = `../assets/images/${state.file}`;

  // Flip card
  slot.classList.add("flipped");

  // Reveal state overlay after flip
  setTimeout(() => {
    stateOverlay.className = `state-overlay active ${stateName.toLowerCase()}`;
  }, 1000);

  // ==============================
  // LOOKUP ORACLE DATA
  // ==============================
  const stageKey = labels[step].toUpperCase();
  const lookupKey = `${stageKey}|${archetypeName}|${stateName}`;
  const result = oracleLookup[lookupKey];

  const hex = result ? result.hex : "??-??-??";
  const meaning = result ? result.meaning : "NO DATA AVAILABLE";

  // Write to console
  writeToConsole(`[${hex}] ${stageKey} :: ${archetypeName} (${stateName})`);
  writeToConsole(meaning);

  // Update prompt
  step++;
  if (step < 3) {
    prompt.textContent = `Click to draw ${labels[step]}`;
  } else {
    prompt.textContent = "System Flow complete.";
  }
});



