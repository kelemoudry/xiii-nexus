const cards = [
  "1-BOOT","2-SIGNAL","3-PROCESS","4-CACHE","5-FIREWALL",
  "6-ROOT","7-AUTHORITY","8-SYNC","9-ISOLATE",
  "10-OVERFLOW","11-PATCH","12-LOOP","13-TERMINATE"
];

const states = [
  { name: "stable", file: "state - stable.png" },
  { name: "redundant", file: "state - redundant.png" },
  { name: "deprecated", file: "state - deprecated.png" },
  { name: "elevated", file: "state - elevated.png" },
  { name: "corrupted", file: "state - corrupted.png" },
  { name: "experimental", file: "state - experimental.png" }
];

const slots = document.querySelectorAll(".card");
const prompt = document.querySelector(".prompt");

let step = 0;
let availableCards = [...cards];

const labels = ["Input", "Process", "Output"];

/* Build card DOM */
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

/* Click to reveal next card */
document.body.addEventListener("click", () => {
  if (step > 2) return;

  const slot = slots[step];
  const gif = slot.querySelector(".card-gif");
  const stateOverlay = slot.querySelector(".state-overlay");

  // Pick archetype (no repeats)
  const pickIndex = Math.floor(Math.random() * availableCards.length);
  const archetype = availableCards.splice(pickIndex, 1)[0];

  const archetypeName = archetype.toLowerCase().split("-")[1];

  // Pick state
  const state = states[Math.floor(Math.random() * states.length)];

  // Set sources
  gif.src = `../assets/gifs/card - ${archetypeName}.gif`;
  stateOverlay.src = `../assets/images/${state.file}`;

  // Flip card
  slot.classList.add("flipped");

  // Reveal state after flip
  setTimeout(() => {
    stateOverlay.className = `state-overlay active ${state.name}`;
  }, 1000);

  step++;

  if (step < 3) {
    prompt.textContent = `Click to draw ${labels[step]}`;
  } else {
    prompt.textContent = `System Flow complete.`;
  }
});
