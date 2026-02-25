const slots = document.querySelectorAll(".card");
const systemConsole = document.getElementById("systemConsole");
const oracleConsole = document.getElementById("oracleConsole");
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

// Load JSON files
Promise.all([
  fetch("../data/oracle.json").then(res => res.json()),
  fetch("../data/translated.json").then(res => res.json())
])
.then(([system, translated]) => {
  systemData = system;
  translatedData = translated;
})
.catch(err => console.error("Failed to load JSON:", err));

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function typeText(text, container) {
  container.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    container.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 18);
}

function writeConsole(text, container) {
  const line = document.createElement("div");
  container.appendChild(line);
  typeText(text, line);
}

// Initialize card backs
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

// Reveal cards
revealBtn.addEventListener("click", () => {
  const hexInputs = [
    document.getElementById("inputHex").value.trim().toUpperCase(),
    document.getElementById("processHex").value.trim().toUpperCase(),
    document.getElementById("outputHex").value.trim().toUpperCase()
  ];

  systemConsole.textContent = "";
  oracleConsole.textContent = "";

  slots.forEach((slot, idx) => {
    const hex = hexInputs[idx];
    if (!hex) return;

    const systemEntry = systemData.find(row => row["Hex Code"] === hex);
    const translatedEntry = translatedData.find(row => row["Hex Code"] === hex);

    if (!systemEntry) {
      writeConsole(`[${hex}] NO DATA AVAILABLE`, systemConsole);
      writeConsole(`[${hex}] NO DATA AVAILABLE`, oracleConsole);
      return;
    }

    const state = randomFrom(states);

    const shell = slot.querySelector(".card-shell");
    const gif = slot.querySelector(".card-gif");
    const overlay = slot.querySelector(".state-overlay");

    gif.src = `../assets/gifs/card - ${systemEntry.Archetype.toLowerCase()}.gif`;
    gif.alt = systemEntry.Archetype;
    overlay.src = `../assets/images/${state.file}`;
    overlay.className = `state-overlay ${state.class}`;

    shell.classList.add("flipped");

    writeConsole(`[${hex}] ${slot.dataset.position.toUpperCase()} :: ${systemEntry.Archetype} (${state.name})
${systemEntry.Meaning}`, systemConsole);

    writeConsole(`[${hex}] ${slot.dataset.position.toUpperCase()} :: ${systemEntry.Archetype} (${state.name})
${translatedEntry ? translatedEntry.Meaning : "NO DATA AVAILABLE"}`, oracleConsole);
  });
});
