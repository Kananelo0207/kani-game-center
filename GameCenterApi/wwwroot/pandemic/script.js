// THE GATEKEEPER
const token = localStorage.getItem("jwt_token");
const playerName = localStorage.getItem("playerName");
if (!token || !playerName) window.location.href = "../signin.html";

const desktop = document.getElementById("desktop");
const scoreLabel = document.getElementById("scoreLabel");
const loadLabel = document.getElementById("loadLabel");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");

let score = 0;
let activeWindows = 0;
const MAX_WINDOWS = 10;
let spawnRate = 2000; // Starts at 2 seconds
let gameInterval;
let difficultyInterval;
let gameRunning = false;

// Random Words for the Typing Micro-Game
const words = ["DATA", "VIRUS", "WORM", "HACK", "CODE", "BYTE", "FILE", "NODE", "PORT", "PING"];

// --- GLOBAL LEADERBOARD SYNC ---
async function submitPandemicScore(finalScore) {
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
        console.log("Pandemic score synced to API!");
    } catch (err) {
        console.error("API Sync failed:", err);
    }
}

function updateHUD() {
    scoreLabel.textContent = score;
    loadLabel.textContent = activeWindows;
    
    // Change color to red if danger is near
    if (activeWindows >= 8) {
        loadLabel.style.color = "red";
    } else {
        loadLabel.style.color = "white";
    }
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(difficultyInterval);
    
    // Clear all windows off the desktop
    const windows = document.querySelectorAll('.popup-window');
    windows.forEach(win => win.remove());
    
    overlay.style.display = "flex";
    overlayText.textContent = `FATAL ERROR: CPU OVERLOAD\nFinal Score: ${score}`;
    startBtn.textContent = "REBOOT SYSTEM";
    
    submitPandemicScore(score);
}

// Function to handle a successfully closed window
window.closeWindow = function(windowId) {
    if (!gameRunning) return;
    
    const win = document.getElementById(windowId);
    if (win) {
        win.remove();
        score++;
        activeWindows--;
        updateHUD();
    }
}

// Validation logic for the Typing Micro-game
window.checkTyping = function(inputElement, targetWord, windowId, closeBtnId) {
    if (inputElement.value.toUpperCase() === targetWord) {
        document.getElementById(closeBtnId).disabled = false;
        inputElement.style.backgroundColor = "#90ee90"; // Green for success
    } else {
        document.getElementById(closeBtnId).disabled = true;
    }
}

// Validation logic for the Slider Micro-game
window.checkSlider = function(inputElement, windowId, closeBtnId) {
    if (inputElement.value == 100) {
        document.getElementById(closeBtnId).disabled = false;
    } else {
        document.getElementById(closeBtnId).disabled = true;
    }
}

function spawnWindow() {
    if (!gameRunning) return;
    
    if (activeWindows >= MAX_WINDOWS) {
        gameOver();
        return;
    }

    activeWindows++;
    updateHUD();

    const windowId = `win_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const closeBtnId = `btn_${windowId}`;
    
    // Determine random position (keeping it inside the desktop bounds)
    const maxX = desktop.clientWidth - 260; // 250px width + padding
    const maxY = desktop.clientHeight - 180; // Buffer for taskbar and height
    const randomX = Math.max(0, Math.floor(Math.random() * maxX));
    const randomY = Math.max(0, Math.floor(Math.random() * maxY));

    // Choose which micro-game this pop-up will be
    const gameType = Math.floor(Math.random() * 3);
    let title = "";
    let content = "";
    let closeDisabled = "";

    if (gameType === 0) {
        // MICRO-GAME 1: Simple Click
        title = "Warning.exe";
        content = `<p>Your system is compromised. Click X to close immediately.</p>`;
        closeDisabled = ""; // Unlocked by default
    } 
    else if (gameType === 1) {
        // MICRO-GAME 2: The Typer
        const target = words[Math.floor(Math.random() * words.length)];
        title = "Security_Check";
        content = `
            <p>Type <strong>${target}</strong> to unlock the close button.</p>
            <input type="text" class="micro-input" oninput="checkTyping(this, '${target}', '${windowId}', '${closeBtnId}')" autocomplete="off" />
        `;
        closeDisabled = "disabled"; // Locked
    } 
    else if (gameType === 2) {
        // MICRO-GAME 3: The Slider
        title = "System_Calibrate";
        content = `
            <p>Slide power to 100% to terminate process.</p>
            <input type="range" min="0" max="100" value="0" class="micro-input" oninput="checkSlider(this, '${windowId}', '${closeBtnId}')" />
        `;
        closeDisabled = "disabled"; // Locked
    }

    // Build the actual HTML element
    const winDiv = document.createElement("div");
    winDiv.id = windowId;
    winDiv.className = "popup-window";
    winDiv.style.left = `${randomX}px`;
    winDiv.style.top = `${randomY}px`;
    
    // Bring clicked windows to the front
    winDiv.onmousedown = () => {
        document.querySelectorAll('.popup-window').forEach(w => w.style.zIndex = 10);
        winDiv.style.zIndex = 20;
    };

    winDiv.innerHTML = `
        <div class="title-bar">
            <span>${title}</span>
            <button id="${closeBtnId}" class="close-btn" ${closeDisabled} onclick="closeWindow('${windowId}')">X</button>
        </div>
        <div class="window-content">
            ${content}
        </div>
    `;

    desktop.appendChild(winDiv);
}

function startGame() {
    score = 0;
    activeWindows = 0;
    spawnRate = 2000;
    gameRunning = true;
    
    overlay.style.display = "none";
    updateHUD();

    // Spawn the first window immediately
    spawnWindow();

    // Start the game loop
    gameInterval = setInterval(spawnWindow, spawnRate);

    // Make it harder over time (decrease spawn delay every 5 seconds)
    difficultyInterval = setInterval(() => {
        if (spawnRate > 600) { // Cap maximum speed
            spawnRate -= 150;
            clearInterval(gameInterval);
            gameInterval = setInterval(spawnWindow, spawnRate);
        }
    }, 5000);
}

startBtn.addEventListener("click", startGame);

// Clock for the fake OS
setInterval(() => {
    const now = new Date();
    document.getElementById("timeLabel").textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}, 1000);