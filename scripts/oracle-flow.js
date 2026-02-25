const slots = document.querySelectorAll(".card");
const consoleOutput = document.querySelector(".console-output");
const revealBtn = document.getElementById("revealBtn");

const states = [
  { name: "STABLE", file: "state - stable.png", class: "stable" },
  { name: "REDUNDANT", file: "state - redundant.png", class: "redundant" },
  { name: "DEPRECATED", file: "state - deprecated.png", class: "deprecated" },
  { name: "ELEVATED", file: "state - elevated.png", class: "elevated" },
  { name: "CORRUPTED", file: "state - corrupted.png", class: "corrupted" },
  { name: "EXPERIMENTAL", file: "state - experimental.png", class: "experimental" }
];

let systemData = [];
let translatedData = [];

// Load both JSON files
Promise.all([
  fetch("../data/oracle.json").then(res => res.json()),
  fetch("../data/translated.json").then(res => res.json())
])
.then(([system, translated]) => {
  systemData = system;
  translatedData = translated;
})
.catch(err => console.error("Failed to load JSON:", err));

// Helper: random state
function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper: typewriter effect
function typeText(text, container) {
  container.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    container.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 18);
}

// Helper: write to console
function writeConsole(text) {
  const line = document.createElement("div");
  consoleOutput.appendChild(line);
  typeText(text, line);
}

// ====================
// INITIALIZE CARD BACKS
// ====================
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

// ====================
// REVEAL BUTTON CLICK
// ====================
revealBtn.addEventListener("click", () => {
  const hexInputs = [
    document.getElementById("inputHex").value.trim().toUpperCase(),
    document.getElementById("processHex").value.trim().toUpperCase(),
    document.getElementById("outputHex").value.trim().toUpperCase()
  ];

  consoleOutput.textContent = "";

  slots.forEach((slot, idx) => {
    const hex = hexInputs[idx];
    if (!hex) return;

    const systemEntry = systemData.find(row => row["Hex Code"] === hex);
    const translatedEntry = translatedData.find(row => row["Hex Code"] === hex);

    if (!systemEntry) {
      writeConsole(`[${hex}] NO DATA AVAILABLE`);
      return;
    }

    // Pick random state
    const state = randomFrom(states);

    // Get front elements
    const shell = slot.querySelector(".card-shell");
    const gif = slot.querySelector(".card-gif");
    const overlay = slot.querySelector(".state-overlay");

    // Set front images
    gif.src = `../assets/gifs/card - ${systemEntry.Archetype.toLowerCase()}.gif`;
    gif.alt = systemEntry.Archetype;
    overlay.src = `../assets/images/${state.file}`;
    overlay.className = `state-overlay ${state.class}`;

    // Flip the card
    shell.classList.add("flipped");

    // Write console output
    const text = `[${hex}] ${slot.dataset.position.toUpperCase()} :: ${systemEntry.Archetype} (${state.name})
SYSTEM: ${systemEntry.Meaning}
ORACLE: ${translatedEntry ? translatedEntry.Meaning : "NO DATA AVAILABLE"}`;

    writeConsole(text);
  });
});
