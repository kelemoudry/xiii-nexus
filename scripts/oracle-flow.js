const slots = document.querySelectorAll(".card");
const systemConsole = document.getElementById("systemConsole");
const oracleConsole = document.getElementById("oracleConsole");
const revealBtn = document.getElementById("revealBtn");

let systemData = [];
let translatedData = [];

/* =========================
   LOAD DATA
========================= */

Promise.all([
  fetch("../data/oracle.json").then(res => res.json()),
  fetch("../data/translated.json").then(res => res.json())
])
.then(([system, translated]) => {
  systemData = system;
  translatedData = translated;
})
.catch(err => {
  console.error("Failed to load JSON:", err);
});

/* =========================
   TYPEWRITER
========================= */

function typeText(text, container) {
  let i = 0;
  const interval = setInterval(() => {
    container.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 15);
}

function writeConsole(text, container) {
  const line = document.createElement("div");
  container.appendChild(line);
  typeText(text, line);
}

/* =========================
   REVEAL
========================= */

revealBtn.addEventListener("click", () => {

  const hexInputs = [
    document.getElementById("hexInput0")?.value.trim().toUpperCase(),
    document.getElementById("hexInput1")?.value.trim().toUpperCase(),
    document.getElementById("hexInput2")?.value.trim().toUpperCase()
  ];

  systemConsole.textContent = "";
  oracleConsole.textContent = "";

  slots.forEach((slot, idx) => {

    const hex = hexInputs[idx];
    if (!hex) return;

    const systemEntry = systemData.find(row =>
      row["Hex Code"].toUpperCase() === hex
    );

    const translatedEntry = translatedData.find(row =>
      row["Hex Code"].toUpperCase() === hex
    );

    if (!systemEntry) {
      writeConsole(`[${hex}] NO DATA AVAILABLE`, systemConsole);
      writeConsole(`[${hex}] NO DATA AVAILABLE`, oracleConsole);
      return;
    }

    const gif = slot.querySelector(".card-gif");
    const overlay = slot.querySelector(".state-overlay");

    /* SET CARD FACE */
    gif.src = `../assets/gifs/card - ${systemEntry.Archetype.toLowerCase()}.gif`;
    gif.alt = systemEntry.Archetype;

    /* SET STATE FROM DATA */
    overlay.src = `../assets/images/state - ${systemEntry.State.toLowerCase()}.png`;
    overlay.className = `state-overlay ${systemEntry.State.toLowerCase()} active`;

    /* FLIP */
    slot.classList.add("flipped");

    const position = slot.dataset.position;

    /* SYSTEM CONSOLE */
    writeConsole(
`[${hex}]
${position} :: ${systemEntry.Archetype} (${systemEntry.State})

${systemEntry.Meaning}
`,
    systemConsole
    );

    /* ORACLE CONSOLE */
    writeConsole(
`[${hex}]
${position} :: ${systemEntry.Archetype} (${systemEntry.State})

${translatedEntry ? translatedEntry.Meaning : "NO TRANSLATED DATA"}
`,
    oracleConsole
    );

  });

});
