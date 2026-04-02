const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("scoreLabel");
const livesEl = document.getElementById("livesLabel");
const restartBtn = document.getElementById("restartBtn");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");

const playerName = localStorage.getItem("playerName") || "Kani";

async function submitPacManScore(finalScore) {
    const token = localStorage.getItem('jwt_token');
    if (!token) return; 

    try {
        await fetch('https://YOUR-RENDER-NAME.onrender.com/api/game/submit-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ points: finalScore })
        });
        console.log("Pac-Man score synced to the Render!");
    } catch (err) {
        console.error("Pac-Man API Sync failed:", err);
    }
}

const BASE_TILE = 28;

let TILE = BASE_TILE;

const PLAYER_SPEED = 2.2;
const GHOST_SPEED = 1.9;
const FRIGHTENED_GHOST_SPEED = 1.35;
const EATEN_GHOST_SPEED = 2.8;

const WALL = "#";
const PELLET = ".";
const POWER_PELLET = "o";
const GHOST_DOOR = "-";
const EMPTY = " ";

const LEVELS = [
  [
    "###########################",
    "#o...........#...........o#",
    "#.##.##.##.##.#.##.##.###.#",
    "#.#...#.#...#.#.#...#.#...#",
    "#.##.##.##.##.#.##.##.###.#",
    "#.........................#",
    "#####.###.#########.###.###",
    "#.....#.......#.......#...#",
    "#.###.#.###.....###.#.#.#.#",
    "#o....#.#..#.-.#..#.#....o#",
    "#####.#.#..#...#..#.#.#####",
    "#.....#....# H #....#.....#",
    "#.###.#.#..#####..#.#.#.#.#",
    "#...#.#.....#.......#...#.#",
    "###.#.#####.#.#####.###.#.#",
    "#o.......................o#",
    "###########################"
  ],
  [
    "###########################",
    "#o....#.............#....o#",
    "#.###.#.###########.#.###.#",
    "#.#...#.....#.#.....#...#.#",
    "#.#.#######.#.#.#######.#.#",
    "#.........................#",
    "###.###.###########.###.###",
    "#.....#.......#.......#...#",
    "#.###.#.###.....###.#.#.#.#",
    "#o..#.#.#..#.-.#..#.#.#..o#",
    "###.#.#.#..#...#..#.#.#.###",
    "#...#......# H #......#...#",
    "#.###.#.#..#####..#.#.###.#",
    "#...#.#.....#.......#...#.#",
    "###.#.#####.#.#####.###.#.#",
    "#o.......................o#",
    "###########################"
  ],
  [
    "###########################",
    "#o.........#.#.........#.o#",
    "#.#####.##.#.#.##.#####.#.#",
    "#.#...#....#.#....#...#.#.#",
    "#.###.####.#.#.####.###.#.#",
    "#.........................#",
    "#####.###.#########.###.###",
    "#.....#.......#.......#...#",
    "#.###.#.###.....###.#.#.#.#",
    "#o#...#.#..#.-.#..#.#...#o#",
    "#.#.###.#..#...#..#.###.#.#",
    "#.#.....#..# H #..#.....#.#",
    "#.#.###.#..#####..#.###.#.#",
    "#...#.#.....#.......#.#...#",
    "###.#.#####.#.#####.#.###.#",
    "#o.......................o#",
    "###########################"
  ]
];

const ROWS = LEVELS[0].length;
const COLS = LEVELS[0][0].length;

let map = [];
let currentLevel = 0;
let score = 0;
let lives = 3;

let gameStarted = false;
let gamePaused = true;
let gameWon = false;
let levelCleared = false;

let powerMode = false;
let powerTimer = 0;
let hitCooldown = 0;

let ghostMode = "chase";
let ghostModeTimer = 0;

function centerX(col) {
  return col * TILE + TILE / 2;
}

function centerY(row) {
  return row * TILE + TILE / 2;
}

function showOverlay(text) {
  if (!overlay || !overlayText) return;
  overlay.style.display = "grid";
  overlayText.textContent = text;
}

function hideOverlay() {
  if (!overlay) return;
  overlay.style.display = "none";
}

function syncOverlayState() {
  const name = localStorage.getItem("playerName") || "Kani";

  if (gameWon) {
    showOverlay(`VICTORY, ${name}!\nYou cleared every level`);
    if (startBtn) startBtn.textContent = "Play Again";
    return;
  }

  if (lives <= 0) {
    showOverlay(`GAME OVER, ${name}\nFinal Score: ${score}`);
    if (startBtn) startBtn.textContent = "Restart";
    return;
  }

  if (levelCleared) {
    showOverlay("LEVEL CLEAR!");
    if (startBtn) startBtn.textContent = "Wait...";
    return;
  }

  if (!gameStarted) {
    showOverlay(`READY, ${name}?\nPRESS SPACE OR TAP START`);
    if (startBtn) startBtn.textContent = "Start";
    return;
  }

  if (gamePaused) {
    showOverlay("PAUSED");
    if (startBtn) startBtn.textContent = "Resume";
    return;
  }

  hideOverlay();
}

function resizeCanvas() {
  const maxWidth = Math.min(window.innerWidth * 0.94, 760);
  TILE = maxWidth / COLS;

  canvas.width = COLS * TILE;
  canvas.height = ROWS * TILE;

  player.radius = TILE * 0.36;
  ghosts.forEach((ghost) => {
    ghost.radius = TILE * 0.36;
  });

  player.x = centerX(player.col);
  player.y = centerY(player.row);

  ghosts.forEach((ghost) => {
    ghost.x = centerX(ghost.col);
    ghost.y = centerY(ghost.row);
  });

  draw();
}

function moveToward(entity, targetX, targetY, speed) {
  const dx = targetX - entity.x;
  const dy = targetY - entity.y;
  const dist = Math.hypot(dx, dy);

  if (dist <= speed || dist === 0) {
    entity.x = targetX;
    entity.y = targetY;
    return true;
  }

  entity.x += (dx / dist) * speed;
  entity.y += (dy / dist) * speed;
  return false;
}

function wrapTile(col, row) {
  let x = col;
  let y = row;

  if (x < 0) x = COLS - 1;
  if (x >= COLS) x = 0;
  if (y < 0) y = ROWS - 1;
  if (y >= ROWS) y = 0;

  return { x, y };
}

function getCell(col, row) {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return WALL;
  return map[row][col];
}

function isWall(col, row) {
  return getCell(col, row) === WALL;
}

function isGhostDoor(col, row) {
  return getCell(col, row) === GHOST_DOOR;
}

function canPlayerMoveTo(col, row) {
  const next = wrapTile(col, row);
  return !isWall(next.x, next.y) && !isGhostDoor(next.x, next.y);
}

function canGhostMoveTo(col, row, ghost) {
  const next = wrapTile(col, row);

  if (isWall(next.x, next.y)) return false;

  if (isGhostDoor(next.x, next.y)) {
    if (ghost.isEaten) return true;
    return ghost.dirY === -1 || next.y < ghost.row;
  }

  return true;
}

function getDirections() {
  return [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 }
  ];
}

function isReverseDirection(aX, aY, bX, bY) {
  return aX === -bX && aY === -bY;
}

const player = {
  col: 13,
  row: 13,
  x: centerX(13),
  y: centerY(13),
  dirX: 0,
  dirY: 0,
  nextDirX: 0,
  nextDirY: 0,
  targetCol: 13,
  targetRow: 13,
  moving: false,
  radius: TILE * 0.36,
  mouth: 0,
  speed: PLAYER_SPEED
};

let ghosts = [];

function createGhost(col, row, color, name, releaseDelay) {
  return {
    col,
    row,
    x: centerX(col),
    y: centerY(row),
    targetCol: col,
    targetRow: row,
    moving: false,
    startCol: col,
    startRow: row,
    homeCol: col,
    homeRow: row,
    color,
    name,
    dirX: 0,
    dirY: -1,
    radius: TILE * 0.36,
    releaseDelay,
    active: false,
    isEaten: false
  };
}

function cloneLevel(levelIndex) {
  return LEVELS[levelIndex].map(row => row.split(""));
}

function loadLevel(levelIndex) {
  map = cloneLevel(levelIndex);
}

function resetGhosts() {
  ghosts = [
    createGhost(12, 11, "red", "blinky", 0),
    createGhost(13, 11, "pink", "pinky", 18),
    createGhost(14, 11, "cyan", "inky", 36),
    createGhost(13, 12, "orange", "clyde", 54)
  ];
}

function resetPositions() {
  player.col = 13;
  player.row = 13;
  player.x = centerX(13);
  player.y = centerY(13);
  player.dirX = 0;
  player.dirY = 0;
  player.nextDirX = 0;
  player.nextDirY = 0;
  player.targetCol = 13;
  player.targetRow = 13;
  player.moving = false;
  player.mouth = 0;

  powerMode = false;
  powerTimer = 0;
  hitCooldown = 12;

  ghostMode = "chase";
  ghostModeTimer = 0;

  resetGhosts();
}

function resetGame() {
  currentLevel = 0;
  score = 0;
  lives = 3;
  gameStarted = false;
  gamePaused = true;
  gameWon = false;
  levelCleared = false;
  powerMode = false;
  powerTimer = 0;
  hitCooldown = 0;
  ghostMode = "chase";
  ghostModeTimer = 0;

  loadLevel(currentLevel);
  resetPositions();
  updateHUD();
  syncOverlayState();
  resizeCanvas();
}

function nextLevel() {
  currentLevel++;

  if (currentLevel >= LEVELS.length) {
    gameWon = true;
    syncOverlayState();
    submitPacManScore(score);
    return;
  }

  levelCleared = false;
  powerMode = false;
  powerTimer = 0;
  hitCooldown = 0;
  ghostMode = "chase";
  ghostModeTimer = 0;

  loadLevel(currentLevel);
  resetPositions();
  syncOverlayState();
}

function updateHUD() {
  if (scoreEl) scoreEl.textContent = `Score: ${score}`;
  if (livesEl) livesEl.textContent = `Lives: ${lives}`;
}

function hasPelletsLeft() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (map[row][col] === PELLET || map[row][col] === POWER_PELLET) {
        return true;
      }
    }
  }
  return false;
}

function getGhostOptions(ghost) {
  return getDirections().filter(dir => {
    const next = wrapTile(ghost.col + dir.x, ghost.row + dir.y);
    return canGhostMoveTo(next.x, next.y, ghost);
  });
}

function getScatterTarget(ghost) {
  if (ghost.name === "blinky") return { x: COLS - 2, y: 1 };
  if (ghost.name === "pinky") return { x: 1, y: 1 };
  if (ghost.name === "inky") return { x: COLS - 2, y: ROWS - 2 };
  return { x: 1, y: ROWS - 2 };
}

function clampTarget(target) {
  return {
    x: Math.max(0, Math.min(COLS - 1, target.x)),
    y: Math.max(0, Math.min(ROWS - 1, target.y))
  };
}

function getRandomWalkableTile() {
  while (true) {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    if (!isWall(x, y) && !isGhostDoor(x, y)) {
      return { x, y };
    }
  }
}

function getGhostTarget(ghost) {
  if (ghost.isEaten) {
    return { x: ghost.homeCol, y: ghost.homeRow };
  }

  if (ghostMode === "scatter") {
    return getScatterTarget(ghost);
  }

  if (ghost.name === "blinky") {
    return { x: player.col, y: player.row };
  }

  if (ghost.name === "pinky") {
    return clampTarget({
      x: player.col + player.dirX * 4,
      y: player.row + player.dirY * 4
    });
  }

  if (ghost.name === "inky") {
    const blinky = ghosts.find(g => g.name === "blinky") || ghosts[0];
    const pivotX = player.col + player.dirX * 2;
    const pivotY = player.row + player.dirY * 2;

    return clampTarget({
      x: pivotX + (pivotX - blinky.col),
      y: pivotY + (pivotY - blinky.row)
    });
  }

  const distance = Math.abs(player.col - ghost.col) + Math.abs(player.row - ghost.row);

  if (distance > 8) {
    return { x: player.col, y: player.row };
  }

  return getRandomWalkableTile();
}

function getFrightenedTarget(ghost) {
  return clampTarget({
    x: ghost.col + (ghost.col - player.col),
    y: ghost.row + (ghost.row - player.row)
  });
}

function findNextStep(start, target, ghost) {
  const startWrapped = wrapTile(start.x, start.y);
  const targetWrapped = wrapTile(target.x, target.y);

  const queue = [];
  const visited = new Set();

  queue.push({
    x: startWrapped.x,
    y: startWrapped.y,
    firstStep: null
  });

  visited.add(`${startWrapped.x},${startWrapped.y}`);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.x === targetWrapped.x && current.y === targetWrapped.y) {
      return current.firstStep || { x: 0, y: 0 };
    }

    for (const dir of getDirections()) {
      const next = wrapTile(current.x + dir.x, current.y + dir.y);
      const key = `${next.x},${next.y}`;

      if (visited.has(key)) continue;
      if (!canGhostMoveTo(next.x, next.y, ghost)) continue;

      visited.add(key);
      queue.push({
        x: next.x,
        y: next.y,
        firstStep: current.firstStep || dir
      });
    }
  }

  return { x: 0, y: 0 };
}

function chooseGhostDirection(ghost, index) {
  const options = getGhostOptions(ghost);
  if (options.length === 0) return { x: 0, y: 0 };

  let filtered = options;

  if (options.length > 1) {
    filtered = options.filter(dir => {
      return !isReverseDirection(ghost.dirX, ghost.dirY, dir.x, dir.y);
    });

    if (filtered.length === 0) filtered = options;
  }

  let target;

  if (ghost.isEaten) {
    target = { x: ghost.homeCol, y: ghost.homeRow };
  } else if (powerMode) {
    target = getFrightenedTarget(ghost);
  } else {
    target = getGhostTarget(ghost);
  }

  let chosen = findNextStep(
    { x: ghost.col, y: ghost.row },
    target,
    ghost
  );

  const valid = filtered.some(dir => dir.x === chosen.x && dir.y === chosen.y);

  if (!valid) {
    chosen = filtered[0];
  }

  if (!ghost.isEaten && powerMode) {
    const randomChance = ghost.name === "clyde" ? 0.55 : 0.25;
    if (Math.random() < randomChance) {
      chosen = filtered[Math.floor(Math.random() * filtered.length)];
    }
  }

  ghosts.forEach((other, otherIndex) => {
    if (otherIndex === index || other.isEaten || ghost.isEaten) return;

    const next = wrapTile(ghost.col + chosen.x, ghost.row + chosen.y);
    if (other.col === next.x && other.row === next.y) {
      const fallback = filtered.find(dir => {
        const alt = wrapTile(ghost.col + dir.x, ghost.row + dir.y);
        return !(alt.x === other.col && alt.y === other.row);
      });
      if (fallback) chosen = fallback;
    }
  });

  return chosen;
}

function movePlayer() {
  if (lives <= 0 || levelCleared || gameWon) return;

  if (!player.moving) {
    if (canPlayerMoveTo(player.col + player.nextDirX, player.row + player.nextDirY)) {
      player.dirX = player.nextDirX;
      player.dirY = player.nextDirY;
    }

    if (player.dirX !== 0 || player.dirY !== 0) {
      const next = wrapTile(player.col + player.dirX, player.row + player.dirY);

      if (canPlayerMoveTo(next.x, next.y)) {
        player.targetCol = next.x;
        player.targetRow = next.y;
        player.moving = true;
      } else {
        player.dirX = 0;
        player.dirY = 0;
      }
    }
  }

  if (player.moving) {
    const arrived = moveToward(
      player,
      centerX(player.targetCol),
      centerY(player.targetRow),
      player.speed
    );

    if (arrived) {
      player.col = player.targetCol;
      player.row = player.targetRow;
      player.moving = false;
      eatPellet();
    }
  }

  player.mouth += 0.22;
}

function moveGhost(ghost, index) {
  if (!ghost.active) {
    ghost.releaseDelay--;
    if (ghost.releaseDelay <= 0) {
      ghost.active = true;
      ghost.dirX = 0;
      ghost.dirY = -1;
    } else {
      return;
    }
  }

  let speed = GHOST_SPEED;
  if (ghost.isEaten) speed = EATEN_GHOST_SPEED;
  else if (powerMode) speed = FRIGHTENED_GHOST_SPEED;

  if (!ghost.moving) {
    const dir = chooseGhostDirection(ghost, index);
    ghost.dirX = dir.x;
    ghost.dirY = dir.y;

    const next = wrapTile(ghost.col + ghost.dirX, ghost.row + ghost.dirY);

    if (canGhostMoveTo(next.x, next.y, ghost)) {
      ghost.targetCol = next.x;
      ghost.targetRow = next.y;
      ghost.moving = true;
    }
  }

  if (ghost.moving) {
    const arrived = moveToward(
      ghost,
      centerX(ghost.targetCol),
      centerY(ghost.targetRow),
      speed
    );

    if (arrived) {
      ghost.col = ghost.targetCol;
      ghost.row = ghost.targetRow;
      ghost.moving = false;
    }
  }

  if (ghost.isEaten && ghost.col === ghost.homeCol && ghost.row === ghost.homeRow) {
    ghost.isEaten = false;
    ghost.active = true;
    ghost.dirX = 0;
    ghost.dirY = -1;
    ghost.targetCol = ghost.col;
    ghost.targetRow = ghost.row;
    ghost.moving = false;
  }
}

function moveGhosts() {
  if (lives <= 0 || levelCleared || gameWon) return;
  ghosts.forEach((ghost, index) => moveGhost(ghost, index));
}

function eatPellet() {
  const cell = map[player.row][player.col];

  if (cell === PELLET) {
    map[player.row][player.col] = EMPTY;
    score += 10;
    updateHUD();
  }

  if (cell === POWER_PELLET) {
    map[player.row][player.col] = EMPTY;
    score += 50;
    powerMode = true;
    powerTimer = 420;
    updateHUD();
  }

  if (!hasPelletsLeft()) {
    levelCleared = true;
    syncOverlayState();

    setTimeout(() => {
      if (!gameWon) {
        nextLevel();
      }
    }, 1000);
  }
}

function checkGhostCollision() {
  if (hitCooldown > 0 || lives <= 0 || gameWon) return;

  for (const ghost of ghosts) {
    const dx = ghost.x - player.x;
    const dy = ghost.y - player.y;
    const distance = Math.hypot(dx, dy);

    if (distance < TILE * 0.5) {
      if (powerMode && !ghost.isEaten) {
        score += 200;
        ghost.isEaten = true;
        ghost.dirX = 0;
        ghost.dirY = -1;
        ghost.targetCol = ghost.col;
        ghost.targetRow = ghost.row;
        ghost.moving = false;
        updateHUD();
      } 
      else if (!powerMode && !ghost.isEaten) {
        lives--;
        updateHUD();

        if (lives > 0) {
          resetPositions();
        } 
        else {
          syncOverlayState();
          submitPacManScore(score);
        }
      }
      return;
    }
  }
}

function updateGhostMode() {
  if (powerMode) return;

  ghostModeTimer++;

  if (ghostMode === "scatter" && ghostModeTimer > 180) {
    ghostMode = "chase";
    ghostModeTimer = 0;
  } else if (ghostMode === "chase" && ghostModeTimer > 620) {
    ghostMode = "scatter";
    ghostModeTimer = 0;
  }
}

function updatePowerMode() {
  if (!powerMode) return;

  powerTimer--;
  if (powerTimer <= 0) {
    powerMode = false;
  }
}

function updateTimers() {
  if (hitCooldown > 0) hitCooldown--;
}

function isFrightBlinking() {
  return powerMode && powerTimer <= 120 && Math.floor(powerTimer / 10) % 2 === 0;
}

function drawMap() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = map[row][col];
      const x = col * TILE;
      const y = row * TILE;

      if (cell === WALL) {
        ctx.shadowColor = "rgba(120,166,255,0.65)";
        ctx.shadowBlur = Math.max(6, TILE * 0.5);

        ctx.fillStyle = "#16325f";
        ctx.fillRect(x, y, TILE, TILE);

        ctx.fillStyle = "#244e8f";
        ctx.fillRect(x + TILE * 0.1, y + TILE * 0.1, TILE * 0.8, TILE * 0.8);

        ctx.strokeStyle = "rgba(157,123,255,0.7)";
        ctx.lineWidth = Math.max(1, TILE * 0.06);
        ctx.strokeRect(x + TILE * 0.1, y + TILE * 0.1, TILE * 0.8, TILE * 0.8);

        ctx.shadowBlur = 0;
      }

      if (cell === GHOST_DOOR) {
        ctx.shadowColor = "rgba(255,160,255,0.8)";
        ctx.shadowBlur = Math.max(4, TILE * 0.36);
        ctx.fillStyle = "#ffb8ff";
        ctx.fillRect(x + TILE * 0.15, y + TILE / 2 - TILE * 0.07, TILE * 0.7, TILE * 0.14);
        ctx.shadowBlur = 0;
      }

      if (cell === PELLET) {
        const pulse = TILE * 0.085 + Math.sin(Date.now() * 0.01 + row + col) * TILE * 0.02;

        ctx.shadowColor = "rgba(255,255,255,0.9)";
        ctx.shadowBlur = Math.max(3, TILE * 0.28);
        ctx.fillStyle = "#f5f7ff";
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (cell === POWER_PELLET) {
        const pulse = TILE * 0.18 + Math.sin(Date.now() * 0.012 + row + col) * TILE * 0.04;

        ctx.shadowColor = "rgba(255,180,255,0.95)";
        ctx.shadowBlur = Math.max(6, TILE * 0.5);
        ctx.fillStyle = "#ffd7ff";
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }
}

function drawPlayer() {
  let baseAngle = 0;
  if (player.dirX === -1) baseAngle = Math.PI;
  if (player.dirY === -1) baseAngle = -Math.PI / 2;
  if (player.dirY === 1) baseAngle = Math.PI / 2;

  const mouth = 0.18 + Math.abs(Math.sin(player.mouth)) * 0.3;

  ctx.shadowColor = "rgba(255,230,80,0.9)";
  ctx.shadowBlur = Math.max(6, TILE * 0.64);

  ctx.fillStyle = "#ffe14d";
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.arc(
    player.x,
    player.y,
    player.radius,
    baseAngle + mouth,
    baseAngle + Math.PI * 2 - mouth
  );
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
}

function drawGhost(ghost) {
  const px = ghost.x;
  const py = ghost.y;
  const r = ghost.radius;

  let bodyColor = ghost.color;

  if (ghost.isEaten) {
    bodyColor = "#0b0f17";
  } else if (powerMode) {
    bodyColor = isFrightBlinking() ? "#ffffff" : "#4b6bff";
  }

  let eyeOffsetX = 0;
  let eyeOffsetY = 0;

  if (ghost.dirX === -1) eyeOffsetX = -TILE * 0.05;
  if (ghost.dirX === 1) eyeOffsetX = TILE * 0.05;
  if (ghost.dirY === -1) eyeOffsetY = -TILE * 0.05;
  if (ghost.dirY === 1) eyeOffsetY = TILE * 0.05;

  if (!ghost.isEaten) {
    ctx.shadowColor = bodyColor;
    ctx.shadowBlur = Math.max(6, TILE * 0.58);

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(px, py, r, Math.PI, 0);
    ctx.lineTo(px + r, py + r);
    ctx.lineTo(px + r / 2, py + r - TILE * 0.14);
    ctx.lineTo(px, py + r);
    ctx.lineTo(px - r / 2, py + r - TILE * 0.14);
    ctx.lineTo(px - r, py + r);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(px - TILE * 0.14, py - TILE * 0.07, TILE * 0.12, 0, Math.PI * 2);
  ctx.arc(px + TILE * 0.14, py - TILE * 0.07, TILE * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = ghost.isEaten ? "#78a6ff" : "#0b0f17";
  ctx.beginPath();
  ctx.arc(px - TILE * 0.14 + eyeOffsetX, py - TILE * 0.07 + eyeOffsetY, TILE * 0.06, 0, Math.PI * 2);
  ctx.arc(px + TILE * 0.14 + eyeOffsetX, py - TILE * 0.07 + eyeOffsetY, TILE * 0.06, 0, Math.PI * 2);
  ctx.fill();
}

function drawGhosts() {
  ghosts.forEach(drawGhost);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawPlayer();
  drawGhosts();
}

function update() {
  movePlayer();
  moveGhosts();
  checkGhostCollision();
  updatePowerMode();
  updateGhostMode();
  updateTimers();
}

function startGame() {
  gameStarted = true;
  gamePaused = false;
  syncOverlayState();
}

function togglePause() {
  if (!gameStarted) return;
  gamePaused = !gamePaused;
  syncOverlayState();
}

function startOrResumeGame() {
  if (levelCleared) return;

  if (lives <= 0 || gameWon) {
    resetGame();
    startGame();
    return;
  }

  if (!gameStarted) {
    startGame();
    return;
  }

  if (gamePaused) {
    togglePause();
  }
}

function setDirection(dirX, dirY) {
  if (!gameStarted || gamePaused || lives <= 0 || gameWon || levelCleared) return;

  player.nextDirX = dirX;
  player.nextDirY = dirY;
}

window.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

  if (event.code === "Space") {
    event.preventDefault();

    if (!gameStarted) {
      startGame();
    } else {
      togglePause();
    }
    return;
  }

  if (key === "p" && gameStarted) {
    togglePause();
    return;
  }

  if (
    key === "arrowleft" || key === "arrowright" ||
    key === "arrowup" || key === "arrowdown" ||
    key === "a" || key === "d" || key === "w" || key === "s"
  ) {
    event.preventDefault();
  }

  if (key === "arrowleft" || key === "a") setDirection(-1, 0);
  if (key === "arrowright" || key === "d") setDirection(1, 0);
  if (key === "arrowup" || key === "w") setDirection(0, -1);
  if (key === "arrowdown" || key === "s") setDirection(0, 1);
});

document.querySelectorAll(".mobile-controls button").forEach((btn) => {
  const handlePress = (e) => {
    e.preventDefault();

    const dir = btn.dataset.dir;

    if (!gameStarted) {
      startGame();
    } else if (gamePaused) {
      togglePause();
    }

    if (dir === "left") setDirection(-1, 0);
    if (dir === "right") setDirection(1, 0);
    if (dir === "up") setDirection(0, -1);
    if (dir === "down") setDirection(0, 1);
  };

  btn.addEventListener("click", handlePress);
});

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (e) => {
  const touch = e.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

canvas.addEventListener("touchend", (e) => {
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

  if (!gameStarted) {
    startGame();
  } else if (gamePaused) {
    togglePause();
  }

  if (Math.abs(dx) > Math.abs(dy)) {
    setDirection(dx > 0 ? 1 : -1, 0);
  } else {
    setDirection(0, dy > 0 ? 1 : -1);
  }
}, { passive: true });

if (restartBtn) {
  restartBtn.addEventListener("click", resetGame);
}

if (startBtn) {
  startBtn.addEventListener("click", startOrResumeGame);
}

window.addEventListener("resize", resizeCanvas);

function gameLoop() {
  if (gameStarted && !gamePaused && !gameWon && !levelCleared && lives > 0) {
    update();
  }

  draw();
  syncOverlayState();
  requestAnimationFrame(gameLoop);
}

resetGame();
draw();
requestAnimationFrame(gameLoop);