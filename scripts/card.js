const card = document.getElementById("card");
const stateOverlay = document.getElementById("stateOverlay");

const states = [
  { src: "../assets/images/state - stable.png", class: "stable" },
  { src: "../assets/images/state - redundant.png", class: "redundant" },
  { src: "../assets/images/state - deprecated.png", class: "deprecated" },
  { src: "../assets/images/state - elevated.png", class: "elevated" },
  { src: "../assets/images/state - corrupted.png", class: "corrupted" },
  { src: "../assets/images/state - experimental.png", class: "experimental" }
];

let hasFlipped = false;

card.addEventListener("click", () => {
  if (hasFlipped) return;
  hasFlipped = true;

  // Flip the card
  card.classList.add("flipped");

  // After flip animation finishes
  setTimeout(() => {
    // Pick a random state
    const randomState = states[Math.floor(Math.random() * states.length)];
    stateOverlay.src = randomState.src;

    // Apply state class for animations
    stateOverlay.className = "state-overlay " + randomState.class + " active";

    // Make it visible
    stateOverlay.style.display = "block";
  }, 1000); // matches CSS flip duration
});