/* ============================
   ORACLE QUERY SYSTEM
   ============================ */

let systemOracle = [];
let translatedOracle = [];
let oracleReady = false;

/* ============================
   DOM REFERENCES
   ============================ */

const oracleConsole = document.getElementById("oracleConsole");
const oracleTitle   = document.getElementById("oracleTitle");

/* ============================
   LOAD ORACLE DATA
   ============================ */

Promise.all([
  fetch("../data/oracle.json").then(res => res.json()),
  fetch("../data/translated.json").then(res => res.json())
])
.then(([systemData, translatedData]) => {
  systemOracle = systemData;
  translatedOracle = translatedData;
  oracleReady = true;

  printOracleLine("ORACLE QUERY INITIALIZED");
  printOracleLine("AWAITING ARCHETYPE INPUT…");
})
.catch(err => {
  console.error("Oracle load failure:", err);
  printOracleLine("ORACLE DATA CORRUPTED");
});

/* ============================
   CORE LOOKUP FUNCTION
   ============================ */

function getOracleMeaning(archetype, state) {
  if (!oracleReady) {
    return null;
  }

  // SYSTEM MEANING (PROCESS STAGE)
  const systemEntry = systemOracle.find(e =>
    e.Archetype === archetype &&
    e.State === state &&
    e.Stage.toLowerCase() === "process"
  );

  // TRANSLATED MEANING (PROCESS STAGE)
  const translatedEntry = translatedOracle.find(e =>
    e.Archetype === archetype &&
    e.State === state &&
    e.Stage.toLowerCase() === "process"
  );

  return {
    archetype,
    state,
    hex: systemEntry?.["Hex Code"] || "?? ?? ??",
    systemMeaning: systemEntry?.Meaning || "NO SYSTEM MEANING FOUND",
    translatedMeaning: translatedEntry?.Meaning || "NO TRANSLATION FOUND"
  };
}

/* ============================
   ORACLE QUERY ENTRY POINT
   ============================ */
/*
   This function is called when:
   - an NFC card is scanned
   - OR a card is clicked in dev mode
*/

function runOracleQuery(archetype, state) {
  const result = getOracleMeaning(archetype, state);

  if (!result) {
    printOracleLine("QUERY FAILED");
    return;
  }

  clearOracle();

  oracleTitle.innerText = `${result.archetype} — ${result.state}`;

  // Oracle-style output
  typeOracleBlock([
    `HEX ${result.hex}`,
    ``,
    result.translatedMeaning,
    ``,
    `— SYSTEM CONTEXT —`,
    result.systemMeaning
  ]);
}

/* ============================
   ORACLE CONSOLE EFFECTS
   ============================ */

function clearOracle() {
  oracleConsole.innerHTML = "";
}

function printOracleLine(text) {
  const line = document.createElement("div");
  line.className = "oracle-line";
  line.textContent = text;
  oracleConsole.appendChild(line);
  oracleConsole.scrollTop = oracleConsole.scrollHeight;
}

function typeOracleBlock(lines, speed = 22) {
  let lineIndex = 0;
  let charIndex = 0;

  function typeNextChar() {
    if (lineIndex >= lines.length) return;

    if (!oracleConsole.lastChild || oracleConsole.lastChild.dataset.complete === "true") {
      const line = document.createElement("div");
      line.className = "oracle-line";
      line.dataset.complete = "false";
      oracleConsole.appendChild(line);
    }

    const currentLine = oracleConsole.lastChild;
    currentLine.textContent += lines[lineIndex][charIndex] || "";

    charIndex++;

    if (charIndex >= lines[lineIndex].length) {
      currentLine.dataset.complete = "true";
      lineIndex++;
      charIndex = 0;
    }

    oracleConsole.scrollTop = oracleConsole.scrollHeight;
    setTimeout(typeNextChar, speed);
  }

  typeNextChar();
}

/* ============================
   DEV MODE (REMOVE LATER)
   ============================ */
/*
   Temporary testing hook.
   Call from console or click handler.
*/

window.devOracleQuery = function () {
  runOracleQuery("BOOT", "STABLE");
};
