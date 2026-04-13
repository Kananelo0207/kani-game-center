(() => {
  const token = localStorage.getItem("jwt_token");
  const playerName = localStorage.getItem("playerName");

  if (!token || !playerName) {
      alert("Authentication required to play and save scores!");
      window.location.href = "../signin.html"; 
  }

  const BANK = {
    media: [
      { w: "one piece", h: "Pirate-themed anime with Luffy." },
      { w: "attack on titan", h: "Anime with giant Titans." },
      { w: "death note", h: "Notebook that can kill." },
      { w: "breaking bad", h: "Chemistry teacher becomes a drug kingpin." },
      { w: "stranger things", h: "Kids face supernatural in Hawkins." },
      { w: "the dark knight", h: "Batman faces the Joker." },
      { w: "inception", h: "Dreams within dreams." },
      { w: "toy story", h: "Pixar’s talking toys." },
    ],
    tech: [
      { w: "playstation", h: "A popular Sony gaming console." },
      { w: "nintendo", h: "Gaming giant known for Mario." },
      { w: "discord", h: "Gaming-focused chat platform." },
      { w: "motherboard", h: "Main circuit board of a computer." },
      { w: "bluetooth", h: "Short-range wireless technology." },
      { w: "windows", h: "Microsoft’s operating system." },
      { w: "linux", h: "Open-source operating system." },
    ],
    biblical: [
      { w: "genesis", h: "The first book of the Bible." },
      { w: "exodus", h: "Moses leads Israel out of Egypt." },
      { w: "good samaritan", h: "Parable about loving your neighbor." },
      { w: "water into wine", h: "Jesus’ first miracle at Cana." },
      { w: "resurrection", h: "Jesus rose from the dead." },
    ],
  };

  const modeSel = document.getElementById("mode");
  const diffSel = document.getElementById("difficulty");
  const catSel  = document.getElementById("category");
  const newGameBtn = document.getElementById("newGameBtn");
  const resetHistoryBtn = document.getElementById("resetHistoryBtn");

  const hintBtn = document.getElementById("hintBtn");
  const hintEl = document.getElementById("hint");
  const p1Label = document.getElementById("p1Label");
  const p2Label = document.getElementById("p2Label");
  const p1ScoreEl = document.getElementById("p1Score");

  const p2ScoreEl = document.getElementById("p2Score");
  const livesEl = document.getElementById("lives");
  const statusEl = document.getElementById("status");
  const wordEl = document.getElementById("word");
  const usedEl = document.getElementById("usedLetters");

  const logEl = document.getElementById("log");
  const guessInput = document.getElementById("guessInput");
  const guessBtn = document.getElementById("guessBtn");
  const skipBtn = document.getElementById("skipBtn");

  const canvas = document.getElementById("hangCanvas");
  const ctx = canvas.getContext("2d");
  const flash = document.getElementById("flash");
  const historyEl = document.getElementById("history");

  const DIFF_LIVES = { easy: 10, normal: 8, hard: 6 };

  let mode = "pvp"; 
  let maxLives = 8;
  let lives = 8;
  let p1 = { name: "Player 1", score: 0 };
  let p2 = { name: "Player 2", score: 0 };
  let turn = 1; 
  let secret = "";
  let hint = "";
  let used = []; 
  let revealed = []; 
  let gameOver = false;

  function revealOne(letter){
    letter = letter.toLowerCase();
    for (let i = 0; i < secret.length; i++){
      if (!revealed[i] && secret[i] === letter){
        revealed[i] = true;
        return true; 
      }
    }
    return false; 
  }

  function wordSolved(){
    for (let i = 0; i < secret.length; i++){
      if (secret[i] === " ") continue;
      if (!revealed[i]) return false;
    }
    return true;
  }

  function currentMasked(){
    let out = "";
    for (let i = 0; i < secret.length; i++){
      const ch = secret[i];
      if (ch === " ") out += "   ";
      else out += (revealed[i] ? ch.toUpperCase() : "_") + " ";
    }
    return out.trimEnd();
  }

  function setStatus(s){ statusEl.textContent = `Status: ${s}`; }

  function flashFX(type){
    flash.classList.remove("good","bad");
    flash.classList.add(type === "good" ? "good" : "bad");
    setTimeout(() => flash.classList.remove("good","bad"), 180);
  }

  function setHUD(){
    p1Label.textContent = p1.name;
    p2Label.textContent = mode === "cpu" ? "CPU" : p2.name;
    p1ScoreEl.textContent = String(p1.score);
    p2ScoreEl.textContent = String(p2.score);
    livesEl.textContent = String(lives);
    wordEl.textContent = currentMasked();
    usedEl.textContent = used.length ? used.join(" ") : "—";
  }

  function clearCanvas(){ ctx.clearRect(0,0,canvas.width,canvas.height); }

  function drawBase(){
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = "#ffffff";
    for (let x=0; x<canvas.width; x+=24){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
    for (let y=0; y<canvas.height; y+=24){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
    ctx.restore();
    ctx.save();
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.beginPath(); ctx.moveTo(90,320); ctx.lineTo(270,320); ctx.stroke();      
    ctx.beginPath(); ctx.moveTo(140,320); ctx.lineTo(140,70); ctx.stroke();      
    ctx.beginPath(); ctx.moveTo(140,70);  ctx.lineTo(320,70); ctx.stroke();      
    ctx.beginPath(); ctx.moveTo(320,70);  ctx.lineTo(320,110); ctx.stroke();     
    ctx.restore();
  }

  function drawHangmanParts(wrong){
    const parts = 6;
    const progress = Math.min(parts, Math.round((wrong / maxLives) * parts));
    ctx.save();
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255,255,255,.78)";
    if (progress >= 1){ ctx.beginPath(); ctx.arc(320,145,32,0,Math.PI*2); ctx.stroke(); }
    if (progress >= 2){ ctx.beginPath(); ctx.moveTo(320,178); ctx.lineTo(320,255); ctx.stroke(); }
    if (progress >= 3){ ctx.beginPath(); ctx.moveTo(320,200); ctx.lineTo(285,228); ctx.stroke(); }
    if (progress >= 4){ ctx.beginPath(); ctx.moveTo(320,200); ctx.lineTo(355,228); ctx.stroke(); }
    if (progress >= 5){ ctx.beginPath(); ctx.moveTo(320,255); ctx.lineTo(290,300); ctx.stroke(); }
    if (progress >= 6){ ctx.beginPath(); ctx.moveTo(320,255); ctx.lineTo(350,300); ctx.stroke(); }
    ctx.restore();
  }

  function redrawCanvas(){
    clearCanvas(); drawBase();
    const wrong = maxLives - lives;
    drawHangmanParts(wrong);
  }

  const HISTORY_KEY = "hangman_history_v1";
  function loadHistory(){ try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; } }
  function saveHistory(items){ localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 20))); }
  function addHistory(result){
    const items = loadHistory(); items.unshift(result);
    saveHistory(items); renderHistory();
  }
  function renderHistory(){
    const items = loadHistory();
    historyEl.innerHTML = items.length ? "" : `<div class="history-item">No matches yet.</div>`;
    for (const it of items){
      const div = document.createElement("div"); div.className = "history-item";
      div.innerHTML = `<div><strong>${it.winner}</strong> won • <span class="small">${it.mode} • ${it.diff} • ${it.category}</span></div>
        <div class="small">Word: <span style="opacity:.9">${it.word}</span> • Score: ${it.p1} - ${it.p2}</div>`;
      historyEl.appendChild(div);
    }
  }

  function pickWord(category){
    const arr = BANK[category] || BANK.media;
    const pick = arr[Math.floor(Math.random() * arr.length)];
    return { word: pick.w.toLowerCase(), hint: pick.h };
  }

  function promptNames() {
    p1.name = localStorage.getItem("playerName") || "Kani";
    const modeValue = modeSel.value.toLowerCase();
    if (modeValue === "cpu" || modeValue === "ranked") {
      p2.name = modeValue === "cpu" ? "CPU" : "Ranked"; 
      return;
    }
    p2.name = (prompt("Enter Player 2 name:", "Player 2") || "").trim() || "Player 2";
  }

  function setupNextWord() {
    used = [];
    hintEl.hidden = true;
    hintEl.textContent = "";
    const { word, hint: h } = pickWord(catSel.value);
    secret = word;
    hint = h;
    revealed = new Array(secret.length).fill(false);
    for (let i=0; i<secret.length; i++){ if (secret[i] === " ") revealed[i] = true; }
    setHUD();
    redrawCanvas();
    guessInput.value = "";
    guessInput.focus();
  }

  function startNewGame(){
    mode = modeSel.value;
    maxLives = DIFF_LIVES[diffSel.value] ?? 8;
    lives = maxLives;
    p1.score = 0; p2.score = 0;
    turn = 1; gameOver = false;
    promptNames();
    logEl.textContent = "Battle log will appear here…";
    setupNextWord();
    setStatus(`${p1.name}'s turn — guess a letter`);
  }

  function currentPlayer(){ return turn === 1 ? p1 : p2; }
  function otherPlayer(){ return turn === 1 ? p2 : p1; }

  function switchTurn(){
    if (mode === "cpu" || mode === "ranked"){ turn = 1; return; }
    turn = (turn === 1 ? 2 : 1);
  }

  function endGame(winnerName){
    gameOver = true;
    setStatus(`Game Over — Winner: ${winnerName}`);
    logEl.innerHTML = `<a href="../leaderboard.html" style="color: #a78bfa; text-decoration: underline; font-weight: bold;">Check your Global Rank here!</a>\n` + logEl.innerHTML;
    addHistory({
      winner: winnerName,
      mode: mode.toUpperCase(),
      diff: diffSel.value,
      category: catSel.value,
      word: secret,
      p1: p1.score,
      p2: p2.score
    });

   if (mode === "ranked" && p1.name === localStorage.getItem("playerName")) {
        setStatus(`Game Over. Syncing score of ${p1.score}...`);
        submitHangmanScore(p1.score);
    }
  }

  function scoreCorrect(pl){ /* No points for individual letters anymore */ }
  function scoreWrong(pl){ /* No penalties for individual letters anymore */ }
  
  function scoreWinWord(pl){
    const letterCount = secret.replace(/\s/g, "").length;
    pl.score += letterCount;
  }

  const FREQ = "etaoinshrdlcumwfgypbvkjxqz".split("");
  function cpuGuess(){
    const available = FREQ.filter(ch => !used.includes(ch.toUpperCase()));
    if (diffSel.value === "hard"){
      const candidates = [];
      for (const ch of FREQ){ if (secret.includes(ch) && !used.includes(ch.toUpperCase())) candidates.push(ch); }
      if (candidates.length && Math.random() < 0.75) return candidates[Math.floor(Math.random() * candidates.length)];
    }
    if (diffSel.value === "normal") return available[Math.floor(Math.random() * Math.min(10, available.length))];
    const a = "abcdefghijklmnopqrstuvwxyz";
    return a[Math.floor(Math.random()*a.length)];
  }

  function revealWouldWork(letter){
    letter = letter.toLowerCase();
    for (let i = 0; i < secret.length; i++){ if (!revealed[i] && secret[i] === letter) return true; }
    return false;
  }

  function applyGuess(letter, byCPU = false){
    if (gameOver) return;
    letter = (letter || "").toLowerCase();
    if (!/^[a-z]$/.test(letter)){ if (!byCPU) setStatus("Type ONE letter (A-Z)"); return; }

    const pl = currentPlayer();
    used.push(letter.toUpperCase());
    const hit = revealOne(letter);

    if (hit){
      flashFX("good");
      logEl.textContent = `${pl.name} guessed: ${letter.toUpperCase()} ✅\n` + logEl.textContent;
      setStatus(`${pl.name} got a letter!`);
    } else {
      flashFX("bad");
      lives -= 1;
      logEl.textContent = `${pl.name} guessed: ${letter.toUpperCase()} ❌ (Lives -1)\n` + logEl.textContent;
      setStatus(`${pl.name} missed.`);
    }

    setHUD();
    redrawCanvas();

    if (wordSolved()){
      const pointsAdded = secret.replace(/\s/g, "").length;
      scoreWinWord(pl);
      setHUD();
      
      if (mode === "ranked") {
          logEl.textContent = `🎯 WORD SOLVED! (+${pointsAdded} pts). Loading next word...\n` + logEl.textContent;
          setStatus("Correct! Moving to next word...");
          setTimeout(() => {
              if (!gameOver) setupNextWord();
          }, 1000);
          return;
      } else {
          setStatus(`${pl.name} won! (+${pointsAdded})`);
          endGame(pl.name);
          return;
      }
    }

    if (lives <= 0){
      const winner = (p1.score === p2.score) ? "Draw" : (p1.score > p2.score ? p1.name : (mode === "cpu" ? "CPU" : p2.name));
      setStatus(`Out of lives! Word was: ${secret}`);
      endGame(winner);
      return;
    }

    if (mode === "cpu" && !byCPU){
      turn = 2; setHUD(); setStatus("CPU is thinking…");
      setTimeout(() => {
        applyGuess(cpuGuess(), true);
        turn = 1; setHUD();
        if (!gameOver) setStatus(`${p1.name}'s turn — guess a letter`);
      }, 450);
      return;
    }

    if (mode !== "ranked") switchTurn();
    setHUD();
    if (!gameOver) setStatus(`${currentPlayer().name}'s turn — guess a letter`);
  }

  function skipTurn(){
    if (gameOver || mode === "cpu" || mode === "ranked") return;
    switchTurn(); setHUD();
    setStatus(`${currentPlayer().name}'s turn — guess a letter`);
  }

  function showHint(){
    if (gameOver) return;
    const pl = currentPlayer();
    pl.score = Math.max(0, pl.score - 5);
    hintEl.hidden = false;
    hintEl.textContent = `HINT: ${hint}`;
    setHUD();
    setStatus(`${pl.name} used a hint (-5)`);
  }

  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty("--mx", `${x}%`);
    document.documentElement.style.setProperty("--my", `${y}%`);
  }, { passive: true });

  newGameBtn.addEventListener("click", startNewGame);
  hintBtn.addEventListener("click", showHint);
  resetHistoryBtn.addEventListener("click", () => { localStorage.removeItem(HISTORY_KEY); renderHistory(); });
  modeSel.addEventListener("change", () => { mode = modeSel.value; if (mode === "cpu") p2.name = "CPU"; setHUD(); });
  guessBtn.addEventListener("click", () => { const v = guessInput.value.trim(); guessInput.value = ""; guessInput.focus(); applyGuess(v); });
  guessInput.addEventListener("keydown", (e) => { if (e.key === "Enter"){ e.preventDefault(); guessBtn.click(); } });
  skipBtn.addEventListener("click", skipTurn);

  renderHistory(); redrawCanvas(); setHUD();
})();

async function submitHangmanScore(finalScore) {
    const token = localStorage.getItem('jwt_token');
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
        console.log("Hangman score synced to Render!");
    } catch (err) {
        console.error("Hangman API Sync failed:", err);
    }
}