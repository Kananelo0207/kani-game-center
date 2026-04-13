(() => {
  // THE GATEKEEPER
  const token = localStorage.getItem("jwt_token");
  const playerNameAuth = localStorage.getItem("playerName");
  if (!token || !playerNameAuth) window.location.href = "../signin.html";

  const modeSel = document.getElementById("mode");
  const cpuSel = document.getElementById("cpu");
  const cpuField = document.getElementById("cpuField");
  const winToSel = document.getElementById("winTo");
  const winConditionField = document.getElementById("winConditionField");

  const resetBtn = document.getElementById("resetBtn");
  const fightBtn = document.getElementById("fightBtn");

  const pScoreEl = document.getElementById("pScore");
  const cScoreEl = document.getElementById("cScore");
  const roundsEl = document.getElementById("rounds");

  const hudLabelLeft = document.getElementById("hudLabelLeft");
  const hudLabelCenter = document.getElementById("hudLabelCenter");
  const hudLabelRight = document.getElementById("hudLabelRight");

  const statusEl = document.getElementById("status");
  const logEl = document.getElementById("log");
  const tipEl = document.getElementById("tip");

  const youPickEl = document.getElementById("youPick");
  const cpuPickEl = document.getElementById("cpuPick");

  const leftLabel = document.getElementById("leftLabel");
  const rightLabel = document.getElementById("rightLabel");

  const moveButtons = [...document.querySelectorAll("[data-move]")];

  const nameModal = document.getElementById("nameModal");
  const nameP1 = document.getElementById("nameP1");
  const nameP2 = document.getElementById("nameP2");
  const nameP2Wrap = document.getElementById("nameP2Wrap");
  const nameSaveBtn = document.getElementById("nameSaveBtn");
  const nameSkipBtn = document.getElementById("nameSkipBtn");

  const beats = {
    rock: ["scissors", "fire"],
    paper: ["rock", "water"],
    scissors: ["paper", "water"],
    water: ["rock", "fire"],
    fire: ["paper", "scissors"]
  };

  let mode = "ranked";
  let cpuDifficulty = "normal";
  let winTo = 5;

  let pScore = 0;
  let cScore = 0;
  let rounds = 0;
  let lives = 5; 

  let p1Pick = null;
  let p2Pick = null;

  let pvpTurn = 1;
  let lastMoves = [];

  let player1Name = localStorage.getItem("playerName") || "Kani";
  let player2Name = "CPU";

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  async function submitKnockoutScore(finalScore) {
    if (!token) return;
    try {
      await fetch('https://kani-game-center-api.onrender.com/api/game/submit-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ Points: finalScore }) 
      });
      console.log("KnockoutClash score synced to Render!");
    } catch (err) {
      console.error("KnockoutClash API Sync failed:", err);
    }
  }

  function setStatus(text, fx = "") {
    statusEl.textContent = `Status: ${text}`;
    statusEl.classList.remove("pulse", "shake");
    if (fx) statusEl.classList.add(fx);
  }

  function setLog(text, fx = "") {
    const textNode = [...logEl.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
    if (textNode) {
      textNode.textContent = text;
    } else {
      logEl.prepend(document.createTextNode(text));
    }
    logEl.classList.remove("pulse", "shake");
    if (fx) logEl.classList.add(fx);
  }

  function updateHUD() {
    pScoreEl.textContent = String(pScore);
    roundsEl.textContent = String(rounds);

    if (mode === "ranked") {
        cScoreEl.textContent = String(lives);
    } else {
        cScoreEl.textContent = String(cScore);
    }
  }

  function clearSelectedButtons() {
    moveButtons.forEach((b) => b.classList.remove("selected"));
  }

  function applyNamesToUI() {
    leftLabel.textContent = player1Name;
    if (mode === "cpu" || mode === "ranked") {
      rightLabel.textContent = "CPU";
    } else {
      rightLabel.textContent = player2Name;
    }
  }

  function setPickUI() {
    applyNamesToUI();

    if (mode === "cpu" || mode === "ranked") {
      youPickEl.textContent = p1Pick ? cap(p1Pick) : "—";
      cpuPickEl.textContent = p2Pick ? cap(p2Pick) : "—";
      return;
    }

    if (!p2Pick) {
      youPickEl.textContent = p1Pick ? "✓ Locked" : "—";
      cpuPickEl.textContent = "—";
    } else {
      youPickEl.textContent = cap(p1Pick);
      cpuPickEl.textContent = cap(p2Pick);
    }
  }

  function showNameModal() {
    const storedName = localStorage.getItem("playerName") || "Kani";
    player1Name = storedName;
    nameP1.value = storedName;

    if (modeSel.value === "cpu" || modeSel.value === "ranked") {
      saveNames(false);
      return;
    }

    nameModal.classList.add("open");
    nameModal.setAttribute("aria-hidden", "false");
    nameP2Wrap.style.display = "";
    requestAnimationFrame(() => nameP2.focus());
  }

  function hideNameModal() {
    nameModal.classList.remove("open");
    nameModal.setAttribute("aria-hidden", "true");
  }

  function saveNames(useDefaults = false) {
    const storedName = localStorage.getItem("playerName") || "Kani";
    if (useDefaults) {
      player1Name = storedName;
      player2Name = (mode === "cpu" || mode === "ranked") ? "CPU" : "Player 2";
    } else {
      player1Name = (nameP1.value || "").trim() || storedName;
      player2Name = (mode === "cpu" || mode === "ranked") ? "CPU" : ((nameP2.value || "").trim() || "Player 2");
    }

    hideNameModal();
    setPickUI();
    setStatus(`${player1Name}: choose your move`, "pulse");
  }

  function setModeUI() {
    mode = modeSel.value;
    cpuField.style.display = (mode === "cpu" || mode === "ranked") ? "" : "none";
    tipEl.style.display = mode === "pvp" ? "" : "none";
    
    if (mode === "ranked") {
        winConditionField.style.display = "none";
        hudLabelLeft.textContent = "Points";
        hudLabelCenter.textContent = "Round";
        hudLabelRight.textContent = "Lives";
    } else {
        winConditionField.style.display = "";
        hudLabelLeft.textContent = player1Name;
        hudLabelCenter.textContent = "Rounds";
        hudLabelRight.textContent = mode === "cpu" ? "CPU" : player2Name;
    }

    p1Pick = null; p2Pick = null; pvpTurn = 1;
    fightBtn.disabled = true;
    clearSelectedButtons();
    setPickUI();
  }

  function setWinToUI() {
    winTo = Number(winToSel.value) || 5;
  }

  function resetMatch() {
    pScore = 0;
    cScore = 0;
    rounds = 0;
    lives = 5; 
    p1Pick = null;
    p2Pick = null;
    pvpTurn = 1;
    lastMoves = [];

    clearSelectedButtons();
    updateHUD();
    setPickUI();

    fightBtn.disabled = true;
    setStatus(`${player1Name}: choose your move`, "pulse");
    setLog("Battle results will appear here…", "pulse");
  }

  function cpuPickMove() {
    const moves = Object.keys(beats);
    if (cpuDifficulty === "easy") return moves[Math.floor(Math.random() * moves.length)];

    const recent = lastMoves.slice(-3);
    if (recent.length === 0) return moves[Math.floor(Math.random() * moves.length)];

    const freq = new Map();
    for (const m of recent) freq.set(m, (freq.get(m) || 0) + 1);

    let predicted = recent[recent.length - 1];
    let bestCount = -1;
    for (const [m, c] of freq.entries()) {
      if (c > bestCount) { bestCount = c; predicted = m; }
    }

    const counters = moves.filter((m) => beats[m].includes(predicted));
    if (cpuDifficulty === "normal") {
      if (Math.random() < 0.65 && counters.length) return counters[Math.floor(Math.random() * counters.length)];
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (Math.random() < 0.85 && counters.length) return counters[Math.floor(Math.random() * counters.length)];

    const last = recent[recent.length - 1];
    const countersLast = moves.filter((m) => beats[m].includes(last));
    if (countersLast.length) return countersLast[Math.floor(Math.random() * countersLast.length)];
    return moves[Math.floor(Math.random() * moves.length)];
  }

  function resolve(p1, p2) {
    if (p1 === p2) return "draw";
    if (beats[p1].includes(p2)) return "p1";
    return "p2";
  }

  function endMatch(champ) {
    fightBtn.disabled = true;
    moveButtons.forEach((btn) => btn.disabled = true);

    if (mode === "ranked") {
        setStatus(`GAME OVER! Final Score: ${pScore}`, "pulse");
        setLog(`SURVIVAL FAILED\nFinal Score: ${pScore}\n\n<a href="../leaderboard.html" style="color: #a78bfa;">Check Global Rank</a>`, "pulse");
        
        if (player1Name === localStorage.getItem("playerName")) {
            submitKnockoutScore(pScore);
        }
    } else {
        setStatus(`${champ} wins the MATCH!`, "pulse");
        setLog(`Match over!\nWinner: ${champ}\nFinal: ${pScore} - ${cScore}\n\nPress Reset to play again.`, "pulse");
    }
  }

  function unlockMoves() { moveButtons.forEach((btn) => btn.disabled = false); }

  function doFight() {
    if (!p1Pick) { setStatus("Pick a move first", "shake"); return; }

    if (mode === "pvp") {
      if (!p2Pick) { setStatus(`${player2Name} must pick a move`, "shake"); return; }
    } else {
      p2Pick = cpuPickMove();
    }

    rounds += 1;
    updateHUD();
    setPickUI();

    const winner = resolve(p1Pick, p2Pick);
    const p2Display = (mode === "cpu" || mode === "ranked") ? "CPU" : player2Name;

    if (mode === "ranked") {
        if (winner === "draw") {
            setStatus("Draw! Lives intact.", "pulse");
            setLog(`Round ${rounds}: Draw.\nBoth chose ${cap(p1Pick)}.`, "pulse");
        } else if (winner === "p1") {
            pScore += 10;
            setStatus(`Round won! +10 Points`, "pulse");
            setLog(`Round ${rounds}: You WIN!\n${cap(p1Pick)} beats ${cap(p2Pick)}.`, "pulse");
        } else {
            lives -= 1;
            setStatus(`Round lost! -1 Life`, "shake");
            setLog(`Round ${rounds}: You LOSE!\n${cap(p2Pick)} beats ${cap(p1Pick)}.`, "shake");
        }
        
        updateHUD();
        if (lives <= 0) {
            endMatch("Game Over");
            return;
        }
    } 
    else {
        if (winner === "draw") {
          setStatus("Draw!", "pulse");
          setLog(`${player1Name}: ${cap(p1Pick)}\n${p2Display}: ${cap(p2Pick)}\n\nResult: Draw.`, "pulse");
        } else if (winner === "p1") {
          pScore += 1;
          setStatus(`${player1Name} wins the round!`, "pulse");
          setLog(`${player1Name}: ${cap(p1Pick)}\n${p2Display}: ${cap(p2Pick)}\n\nResult: ${player1Name} wins.`, "pulse");
        } else {
          cScore += 1;
          setStatus(`${p2Display} wins the round!`, "shake");
          setLog(`${player1Name}: ${cap(p1Pick)}\n${p2Display}: ${cap(p2Pick)}\n\nResult: ${p2Display} wins.`, "shake");
        }

        if (pScore >= winTo || cScore >= winTo) {
          const champ = pScore >= winTo ? player1Name : p2Display;
          endMatch(champ);
          return;
        }
    }

    p1Pick = null; p2Pick = null; pvpTurn = 1;
    clearSelectedButtons();
    setPickUI();
    fightBtn.disabled = true;
    
    if(mode !== "ranked") setStatus(`${player1Name}: choose your move`, "pulse");
  }

  function handleMoveClick(move, btn) {
    if (fightBtn.disabled && (mode === "ranked" && lives <= 0)) return;
    if (fightBtn.disabled && mode !== "ranked" && (pScore >= winTo || cScore >= winTo)) return;

    clearSelectedButtons();
    btn.classList.add("selected");

    if (mode === "cpu" || mode === "ranked") {
      p1Pick = move;
      lastMoves.push(move);
      p2Pick = null;
      setPickUI();
      fightBtn.disabled = false;
      setStatus("Ready. Press Fight!", "pulse");
      return;
    }

    if (pvpTurn === 1) {
      p1Pick = move; p2Pick = null; pvpTurn = 2;
      setPickUI(); fightBtn.disabled = true;
      setStatus(`${player2Name}: choose your move`, "pulse");
      clearSelectedButtons();
      return;
    }

    p2Pick = move; pvpTurn = 1;
    setPickUI(); fightBtn.disabled = false;
    setStatus("Ready. Press Fight!", "pulse");
  }

  function setupGlowTracking() {
    window.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty("--mx", `${x}%`);
      document.documentElement.style.setProperty("--my", `${y}%`);
    }, { passive: true });
  }

  modeSel.addEventListener("change", () => {
    setModeUI();
    if (mode === "cpu" || mode === "ranked") player2Name = "CPU";
    else if (player2Name === "CPU") player2Name = "Player 2";
    resetMatch();
    showNameModal();
  });

  cpuSel.addEventListener("change", () => { cpuDifficulty = cpuSel.value; setStatus("CPU updated", "pulse"); });
  winToSel.addEventListener("change", () => { setWinToUI(); resetMatch(); });
  resetBtn.addEventListener("click", () => { unlockMoves(); resetMatch(); });
  fightBtn.addEventListener("click", doFight);
  moveButtons.forEach((btn) => btn.addEventListener("click", () => handleMoveClick(btn.dataset.move, btn)));

  nameSaveBtn.addEventListener("click", () => { saveNames(false); unlockMoves(); resetMatch(); });
  nameSkipBtn.addEventListener("click", () => { saveNames(true); unlockMoves(); resetMatch(); });
  nameModal.addEventListener("click", (e) => { if (e.target === nameModal) { saveNames(false); unlockMoves(); resetMatch(); } });

  document.addEventListener("keydown", (e) => {
    if (nameModal.classList.contains("open")) {
      if (e.key === "Enter") { e.preventDefault(); saveNames(false); unlockMoves(); resetMatch(); }
      if (e.key === "Escape") { e.preventDefault(); saveNames(true); unlockMoves(); resetMatch(); }
      return;
    }

    const keyMap = { "1": "rock", "2": "paper", "3": "scissors", "4": "water", "5": "fire" };
    if (keyMap[e.key]) {
      const btn = moveButtons.find((b) => b.dataset.move === keyMap[e.key]);
      if (btn) btn.click();
    }
    if (e.key === "Enter" && !fightBtn.disabled) fightBtn.click();
    if (e.key.toLowerCase() === "r") resetBtn.click();
  });

  cpuDifficulty = cpuSel.value;
  setModeUI();
  setWinToUI();
  updateHUD();
  setPickUI();
  unlockMoves();
  setupGlowTracking();
  showNameModal();
})();