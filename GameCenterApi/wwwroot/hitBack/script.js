// THE GATEKEEPER - Ensure player is authenticated
const token = localStorage.getItem("jwt_token");
const playerNameAuth = localStorage.getItem("playerName");
if (!token || !playerNameAuth) window.location.href = "../signin.html";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const player1Input = document.getElementById("player1Name");
const player2Input = document.getElementById("player2Name");
const gameModeSelect = document.getElementById("gameMode");
const roundSelector = document.getElementById("roundSelector");
const targetContainer = document.getElementById("targetContainer");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const winnerMessage = document.getElementById("winnerMessage");
const targetScoreText = document.getElementById("targetScore");
const modeLabel = document.getElementById("modeLabel");
const controlsInfo = document.getElementById("controlsInfo");

const BASE_WIDTH = 960;
const BASE_HEIGHT = 540;

const BASE_PADDLE_HEIGHT = 80;
const BASE_PADDLE_WIDTH = 10;
const BASE_PADDLE_SPEED = 6;

const BASE_PLAYER_X = 20;
const BASE_BALL_RADIUS = 8;
const BASE_BALL_SPEED_X = 4;
const BASE_BALL_SPEED_Y = 2.2;
const BASE_MAX_SPEED_X = 14; 
const BASE_MAX_SPEED_Y = 10;
const SPEED_INCREASE = 1.05; 

let scale = 1;

let paddleHeight = BASE_PADDLE_HEIGHT;
let paddleWidth = BASE_PADDLE_WIDTH;
let paddleSpeed = BASE_PADDLE_SPEED;

let playerX = BASE_PLAYER_X;
let opponentX = BASE_WIDTH - 30;

let ballRadius = BASE_BALL_RADIUS;
let baseBallSpeedX = BASE_BALL_SPEED_X;
let baseBallSpeedY = BASE_BALL_SPEED_Y;
let maxSpeedX = BASE_MAX_SPEED_X;
let maxSpeedY = BASE_MAX_SPEED_Y;

let player1Name = "Player 1";
let player2Name = "Computer";
let gameMode = "ranked";
let winningScore = 5;

let playerY = 0;
let opponentY = 0;

let ballX = 0;
let ballY = 0;
let ballSpeedX = 0;
let ballSpeedY = 0;

let player1Score = 0; 
let player2Score = 0;
let gameOver = false;
let gameStarted = false;

const keys = {};
let mobileMoveDirection = 0;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shortenName(name, maxLength = 10) {
  return name.length > maxLength ? name.slice(0, maxLength) + "…" : name;
}

function resizeCanvas() {
  const width = Math.min(window.innerWidth * 0.96, BASE_WIDTH);
  const height = width * (BASE_HEIGHT / BASE_WIDTH);

  canvas.width = width;
  canvas.height = height;

  scale = width / BASE_WIDTH;

  paddleHeight = window.innerWidth <= 768 ? 100 * scale : BASE_PADDLE_HEIGHT * scale;
  paddleWidth = BASE_PADDLE_WIDTH * scale;
  paddleSpeed = BASE_PADDLE_SPEED * scale;

  ballRadius = BASE_BALL_RADIUS * scale;
  baseBallSpeedX = BASE_BALL_SPEED_X * scale;
  baseBallSpeedY = BASE_BALL_SPEED_Y * scale;
  maxSpeedX = (window.innerWidth <= 768 ? 8 : BASE_MAX_SPEED_X) * scale;
  maxSpeedY = BASE_MAX_SPEED_Y * scale;

  playerX = BASE_PLAYER_X * scale;
  opponentX = canvas.width - 30 * scale;

  playerY = clamp(playerY || (canvas.height / 2 - paddleHeight / 2), 0, canvas.height - paddleHeight);
  opponentY = clamp(opponentY || (canvas.height / 2 - paddleHeight / 2), 0, canvas.height - paddleHeight);

  if (!gameStarted) {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
  }
}

function resetBall(direction) {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = baseBallSpeedX * direction;
  ballSpeedY = (Math.random() > 0.5 ? baseBallSpeedY : -baseBallSpeedY);
}

function capSpeed() {
  ballSpeedX = clamp(ballSpeedX, -maxSpeedX, maxSpeedX);
  ballSpeedY = clamp(ballSpeedY, -maxSpeedY, maxSpeedY);
}

function restartGame() {
  player1Score = 0;
  player2Score = 0;
  gameOver = false;
  winnerMessage.textContent = "";
  mobileMoveDirection = 0;

  playerY = canvas.height / 2 - paddleHeight / 2;
  opponentY = canvas.height / 2 - paddleHeight / 2;

  resetBall(gameMode === "ranked" ? -1 : (Math.random() > 0.5 ? 1 : -1));
}

function startGame() 
{
  const savedName = localStorage.getItem("playerName") || "Kani";
  
  player1Name = savedName;
  if (player1Input) 
  {
    player1Input.value = savedName; 
  }

  gameMode = gameModeSelect.value;
  winningScore = Number(roundSelector.value);

  if (gameMode === "ranked") {
    player2Name = "Wall";
    player2Input.style.display = "none";
    roundSelector.style.display = "none";
    targetContainer.style.display = "none";
    controlsInfo.textContent = "Ranked: Keep the rally alive!";
    modeLabel.textContent = "Endless Rally (Global)";
  }
  else if (gameMode === "single") 
  {
    player2Name = player2Input.value.trim() || "Computer";
    player2Input.style.display = "inline-block";
    roundSelector.style.display = "inline-block";
    targetContainer.style.display = "inline";
    controlsInfo.textContent = "Controls: Mouse / touch drag";
    modeLabel.textContent = "Single Player";
  } 
  else 
  {
    player2Name = player2Input.value.trim() || "Player 2";
    player2Input.style.display = "inline-block";
    roundSelector.style.display = "inline-block";
    targetContainer.style.display = "inline";
    controlsInfo.textContent = "Controls: Player 1 = W/S, Player 2 = ↑/↓";
    modeLabel.textContent = "Multiplayer";
  }

  targetScoreText.textContent = winningScore;
  gameStarted = true;
  restartGame();
}

function drawCenterLine() {
  ctx.fillStyle = "rgba(255,255,255,.82)";
  for (let i = 0; i < canvas.height; i += 24 * scale) {
    ctx.fillRect(canvas.width / 2 - 2 * scale, i, 4 * scale, 14 * scale);
  }
}

function drawPaddle(x, y) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, paddleWidth, paddleHeight);
}

function drawWall() {
  ctx.fillStyle = "rgba(139, 92, 246, 0.4)";
  ctx.fillRect(canvas.width - 15 * scale, 0, 15 * scale, canvas.height);
}

function drawBall() {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fill();
}

function drawScore() {
  ctx.fillStyle = "#ffffff";
  ctx.font = `${Math.max(16, 20 * scale)}px Arial`;
  
  if (gameMode === "ranked") {
    ctx.textAlign = "center";
    ctx.fillText(`Rally Streak: ${player1Score}`, canvas.width / 2, 30 * scale);
  } else {
    ctx.textAlign = "left";
    ctx.fillText(`${shortenName(player1Name)}: ${player1Score}`, 20 * scale, 30 * scale);

    ctx.textAlign = "right";
    ctx.fillText(`${shortenName(player2Name)}: ${player2Score}`, canvas.width - 20 * scale, 30 * scale);
  }

  ctx.textAlign = "left";
}

function drawStartMessage() {
  if (!gameStarted) {
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.max(18, 24 * scale)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("Set mode and press Start Game", canvas.width / 2, canvas.height / 2);
    ctx.textAlign = "left";
  }
}

function updateAI() {
  const opponentCenter = opponentY + paddleHeight / 2;
  const difference = ballY - opponentCenter;
  opponentY += difference * 0.08;
  opponentY = clamp(opponentY, 0, canvas.height - paddleHeight);
}

function updateMultiplayer() {
  if (keys["w"]) playerY -= paddleSpeed;
  if (keys["s"]) playerY += paddleSpeed;
  if (keys["arrowup"]) opponentY -= paddleSpeed;
  if (keys["arrowdown"]) opponentY += paddleSpeed;

  playerY = clamp(playerY, 0, canvas.height - paddleHeight);
  opponentY = clamp(opponentY, 0, canvas.height - paddleHeight);
}

function updateMobileSinglePlayer() {
  if (mobileMoveDirection !== 0) {
    playerY += mobileMoveDirection * paddleSpeed;
    playerY = clamp(playerY, 0, canvas.height - paddleHeight);
  }
}

function handleWallCollision() {
  if (ballY - ballRadius <= 0) {
    ballY = ballRadius;
    ballSpeedY *= -1;
  }

  if (ballY + ballRadius >= canvas.height) {
    ballY = canvas.height - ballRadius;
    ballSpeedY *= -1;
  }

  if (gameMode === "ranked") {
    if (ballX + ballRadius >= canvas.width - 15 * scale) {
      ballX = canvas.width - 15 * scale - ballRadius;
      ballSpeedX *= -1;
      
      ballSpeedY += (Math.random() - 0.5) * 2;
      capSpeed();
    }
  }
}

function handlePaddleCollision() {
  const hitPlayer =
    ballX - ballRadius <= playerX + paddleWidth &&
    ballX - ballRadius >= playerX &&
    ballY >= playerY &&
    ballY <= playerY + paddleHeight &&
    ballSpeedX < 0;

  const hitOpponent =
    gameMode !== "ranked" &&
    ballX + ballRadius >= opponentX &&
    ballX + ballRadius <= opponentX + paddleWidth &&
    ballY >= opponentY &&
    ballY <= opponentY + paddleHeight &&
    ballSpeedX > 0;

  if (hitPlayer) {
    const impact = (ballY - (playerY + paddleHeight / 2)) / (paddleHeight / 2);
    ballX = playerX + paddleWidth + ballRadius;
    ballSpeedX = Math.abs(ballSpeedX) * SPEED_INCREASE;
    ballSpeedY += impact * 1.1 * scale;
    capSpeed();

    if (gameMode === "ranked") {
        player1Score++;
    }
  }

  if (hitOpponent) {
    const impact = (ballY - (opponentY + paddleHeight / 2)) / (paddleHeight / 2);
    ballX = opponentX - ballRadius;
    ballSpeedX = -Math.abs(ballSpeedX) * SPEED_INCREASE;
    ballSpeedY += impact * 1.1 * scale;
    capSpeed();
  }
}

function handleScoring() {
  if (ballX + ballRadius < 0) {
    
    if (gameMode === "ranked") {
        gameOver = true;
        winnerMessage.textContent = `Game Over!\nFinal Rally Streak: ${player1Score}`;
        
        if (player1Name === localStorage.getItem("playerName")) {
            console.log("Match Over. Syncing HitBack points...");
            submitHitBackScore(player1Score);
        }
        return;
    }

    player2Score++;

    if (player2Score >= winningScore) {
      gameOver = true;
      winnerMessage.textContent = `${player2Name} Wins!`;
      return;
    }

    resetBall(1);
  }

  if (ballX - ballRadius > canvas.width && gameMode !== "ranked") {
    player1Score++;

    if (player1Score >= winningScore) {
      gameOver = true;
      winnerMessage.textContent = `${player1Name} Wins!`;
      return;
    }

    resetBall(-1);
  }
}

function updateBall() {
  if (!gameStarted || gameOver) return;

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  handleWallCollision();
  handlePaddleCollision();
  handleScoring();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1b1f4d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCenterLine();
  drawPaddle(playerX, playerY);

  if (gameMode === "ranked") {
    drawWall();
  } else {
    drawPaddle(opponentX, opponentY);
  }

  drawBall();

  if (gameStarted) {
    drawScore();
  } else {
    drawStartMessage();
  }
}

function gameLoop() {
  draw();

  if (gameStarted && !gameOver) {
    if (gameMode === "single" || gameMode === "ranked") {
      updateMobileSinglePlayer();
      if (gameMode === "single") updateAI();
    } else {
      updateMultiplayer();
    }
    updateBall();
  }

  requestAnimationFrame(gameLoop);
}

function movePlayerFromPointer(clientY) {
  const rect = canvas.getBoundingClientRect();
  const relativeY = clientY - rect.top;
  const ratio = canvas.height / rect.height;

  playerY = relativeY * ratio - paddleHeight / 2;
  playerY = clamp(playerY, 0, canvas.height - paddleHeight);
}

document.addEventListener("mousemove", (e) => {
  if (!gameStarted || gameOver || gameMode === "multi") return;
  movePlayerFromPointer(e.clientY);
});

canvas.addEventListener("touchstart", (e) => {
  if (gameMode === "multi") return;
  movePlayerFromPointer(e.changedTouches[0].clientY);
  if (!gameStarted) startGame();
}, { passive: true });

canvas.addEventListener("touchmove", (e) => {
  if (gameMode === "multi") return;
  movePlayerFromPointer(e.changedTouches[0].clientY);
}, { passive: true });

document.querySelectorAll(".mobile-controls button").forEach((btn) => {
  const action = btn.dataset.action;

  const startMove = (e) => {
    e.preventDefault();
    if (!gameStarted) startGame();
    mobileMoveDirection = action === "up" ? -1 : 1;
  };

  const stopMove = (e) => {
    e.preventDefault();
    mobileMoveDirection = 0;
  };

  btn.addEventListener("touchstart", startMove, { passive: false });
  btn.addEventListener("touchend", stopMove, { passive: false });
  btn.addEventListener("touchcancel", stopMove, { passive: false });
  btn.addEventListener("mousedown", startMove);
  btn.addEventListener("mouseup", stopMove);
  btn.addEventListener("mouseleave", stopMove);
});

document.addEventListener("mouseup", () => {
  mobileMoveDirection = 0;
});

document.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

gameModeSelect.addEventListener("change", () => {
  if (gameModeSelect.value === "ranked") {
    player2Input.style.display = "none";
    roundSelector.style.display = "none";
    targetContainer.style.display = "none";
  } else if (gameModeSelect.value === "single") {
    player2Input.placeholder = "Player 2 / Computer name";
    player2Input.style.display = "inline-block";
    roundSelector.style.display = "inline-block";
    targetContainer.style.display = "inline";
  } else {
    player2Input.placeholder = "Player 2 name";
    player2Input.style.display = "inline-block";
    roundSelector.style.display = "inline-block";
    targetContainer.style.display = "inline";
  }
});

startBtn.addEventListener("click", startGame);

restartBtn.addEventListener("click", () => {
  if (gameStarted) restartGame();
});

window.addEventListener("resize", resizeCanvas);

// Init
gameModeSelect.value = "ranked";
player2Input.style.display = "none";
roundSelector.style.display = "none";

resizeCanvas();
draw();
gameLoop();

async function submitHitBackScore(finalScore) {
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
        console.log("HitBack score synced to the Render API!");
    } catch (err) {
        console.error("HitBack API Sync failed:", err);
    }
}