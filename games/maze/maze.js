/* Owl's Maze (Laberinto) Game Engine Module */

const OwlsMazeGame = (function() {
  const GAME_WORDS = [
    "el nombre", "el apellido", "la edad",
    "el lugar de nacimiento", "el carnet de identidad",
    "el/la amigo/a", "¿Cuántos años tienes?", "tengo... años"
  ];

  // 8 cols x 6 rows maze layout (1 = wall, 0 = path)
  const MAZE_GRID = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 1],
    [1, 0, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ];

  const COLS = 8;
  const ROWS = 6;
  const TILE_SIZE = 50;

  // Open candidate positions for spawning scrolls
  const OPEN_SPOTS = [
    { r: 1, c: 1 }, { r: 1, c: 3 }, { r: 1, c: 5 }, { r: 1, c: 6 },
    { r: 2, c: 1 }, { r: 2, c: 3 }, { r: 2, c: 5 },
    { r: 3, c: 1 }, { r: 3, c: 5 }, { r: 3, c: 6 },
    { r: 4, c: 1 }, { r: 4, c: 3 }, { r: 4, c: 6 }
  ];

  let gameLoop = null;
  let canvas = null;
  let ctx = null;
  let gameObj = null;

  function start() {
    if (state.b12_crown < 2) {
      alert("🔒 El Laberinto is locked! You must first complete Bubble 12 (Datos Personales) to 2 crowns to unlock this game.");
      return;
    }
    if (!state.game_unlocked_1_3) {
      alert("🔒 Game is locked! To play this game again, you must first complete a practice crown in a study bubble.");
      return;
    }

    const area = document.getElementById('question-area');
    area.innerHTML = `
      <span class="prompt-label" id="game-prompt-title">El Laberinto: Loading...</span>
      <div id="maze-canvas-container">
        <canvas id="maze-canvas" width="400" height="300"></canvas>
        <div class="direction-pad-maze">
          <button class="d-btn" onclick="OwlsMazeGame.move(0, -1)">▲</button>
          <div class="direction-pad-row">
            <button class="d-btn" onclick="OwlsMazeGame.move(-1, 0)">◀</button>
            <button class="d-btn" onclick="OwlsMazeGame.move(0, 1)">▼</button>
            <button class="d-btn" onclick="OwlsMazeGame.move(1, 0)">▶</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('check-btn').hidden = true;
    document.getElementById('lesson-overlay').style.display = 'flex';

    init();
  }

  function init() {
    canvas = document.getElementById('maze-canvas');
    ctx = canvas.getContext('2d');

    document.getElementById('lesson-progress-fill').style.width = '0%';

    gameObj = {
      gameState: 'playing', // 'playing', 'message', 'gameover', 'won'
      messageText: "",
      messageColor: "",
      messageTimer: 0,
      score: 0,
      lives: 4,
      owl: { r: 4, c: 1 }, // Start position
      scrolls: [],
      particles: [],
      correctAnswer: "",
      targetWord: ""
    };

    spawnRound();

    window.addEventListener('keydown', handleGameKeys);

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 1000 / 30);
  }

  function spawnRound() {
    // Reset owl to starting position
    gameObj.owl = { r: 4, c: 1 };

    // Choose 3 unique words
    const roundWords = shuffle([...GAME_WORDS]).slice(0, 3);
    const correctWord = roundWords[Math.floor(Math.random() * roundWords.length)];
    const wordData = VOCAB_DATABASE[correctWord];

    gameObj.correctAnswer = correctWord;
    gameObj.targetWord = wordData ? wordData.english : correctWord;

    // Pick 3 distinct open spots (excluding owl start spot r:4, c:1)
    const availableSpots = shuffle(OPEN_SPOTS.filter(s => !(s.r === 4 && s.c === 1)));
    
    gameObj.scrolls = [];
    for (let i = 0; i < 3; i++) {
      gameObj.scrolls.push({
        r: availableSpots[i].r,
        c: availableSpots[i].c,
        word: roundWords[i]
      });
    }

    document.getElementById('game-prompt-title').textContent = `Collect: "${gameObj.targetWord}"`;
  }

  function move(dc, dr) {
    if (!gameObj || gameObj.gameState !== 'playing') return;

    const newR = gameObj.owl.r + dr;
    const newC = gameObj.owl.c + dc;

    // Check bounds & walls
    if (newR >= 0 && newR < ROWS && newC >= 0 && newC < COLS) {
      if (MAZE_GRID[newR][newC] === 0) {
        gameObj.owl.r = newR;
        gameObj.owl.c = newC;
        checkCollisions();
      }
    }
  }

  function handleGameKeys(e) {
    if (!gameObj || gameObj.gameState !== 'playing') return;
    if (e.key === 'ArrowUp' || e.key === 'w') {
      move(0, -1);
      e.preventDefault();
    } else if (e.key === 'ArrowDown' || e.key === 's') {
      move(0, 1);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
      move(-1, 0);
      e.preventDefault();
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
      move(1, 0);
      e.preventDefault();
    }
  }

  function checkCollisions() {
    for (let i = 0; i < gameObj.scrolls.length; i++) {
      const scr = gameObj.scrolls[i];
      if (scr.r === gameObj.owl.r && scr.c === gameObj.owl.c) {
        // Step onto scroll!
        createExplosion((scr.c + 0.5) * TILE_SIZE, (scr.r + 0.5) * TILE_SIZE, scr.word === gameObj.correctAnswer ? '#10b981' : '#ef4444');

        if (scr.word === gameObj.correctAnswer) {
          gameObj.score++;
          const pct = Math.min(100, (gameObj.score / 5) * 100);
          document.getElementById('lesson-progress-fill').style.width = `${pct}%`;
          triggerMessage("🎉 CORRECT!", "#10b981", 10);
        } else {
          gameObj.lives--;
          triggerMessage(`❌ INCORRECT! (-1 Life)`, "#ef4444", 30);
        }
        break;
      }
    }
  }

  function triggerMessage(text, color, duration = 30) {
    gameObj.gameState = 'message';
    gameObj.messageText = text;
    gameObj.messageColor = color;
    gameObj.messageTimer = duration;
  }

  function createExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      gameObj.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        color: color,
        alpha: 1.0,
        size: 2 + Math.random() * 4
      });
    }
  }

  function update() {
    if (!gameObj) return;

    if (gameObj.gameState === 'message') {
      gameObj.messageTimer--;
      if (gameObj.messageTimer <= 0) {
        if (gameObj.score >= 5) {
          complete();
        } else if (gameObj.lives <= 0) {
          quit();
        } else {
          gameObj.gameState = 'playing';
          spawnRound();
        }
      }
      draw();
      return;
    }

    // Update particles
    for (let p = gameObj.particles.length - 1; p >= 0; p--) {
      const prt = gameObj.particles[p];
      prt.x += prt.vx;
      prt.y += prt.vy;
      prt.vy += 0.05;
      prt.alpha -= 0.03;
      if (prt.alpha <= 0) {
        gameObj.particles.splice(p, 1);
      }
    }

    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Draw maze tiles/walls
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (MAZE_GRID[r][c] === 1) {
          // Wall tile
          ctx.fillStyle = isDark ? '#334155' : '#cbd5e1';
          ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
          ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        } else {
          // Path grid lines
          ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
          ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // Draw scrolls
    gameObj.scrolls.forEach(scr => {
      const x = scr.c * TILE_SIZE + TILE_SIZE / 2;
      const y = scr.r * TILE_SIZE + TILE_SIZE / 2;

      // Scroll background pill
      ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
      ctx.strokeStyle = 'var(--brand-purple)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Word label
      ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
      ctx.font = '700 10px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(scr.word, x, y + 3);
    });

    // Draw Owl Avatar
    const owlX = gameObj.owl.c * TILE_SIZE + TILE_SIZE / 2;
    const owlY = gameObj.owl.r * TILE_SIZE + TILE_SIZE / 2;

    ctx.font = '28px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('🦉', owlX, owlY + 9);

    // Draw particles
    gameObj.particles.forEach(prt => {
      ctx.save();
      ctx.globalAlpha = prt.alpha;
      ctx.fillStyle = prt.color;
      ctx.beginPath();
      ctx.arc(prt.x, prt.y, prt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw HUD text (Lives & Score)
    ctx.fillStyle = isDark ? '#ffffff' : '#1e293b';
    ctx.font = '700 13px Outfit';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameObj.score}/5`, 16, 22);
    ctx.textAlign = 'right';
    ctx.fillText(`Lives: ${"❤️".repeat(gameObj.lives)}${"🖤".repeat(4 - gameObj.lives)}`, canvas.width - 16, 22);

    // Draw screen messages
    if (gameObj.gameState === 'message') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = gameObj.messageColor;
      ctx.font = '800 24px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(gameObj.messageText, canvas.width / 2, canvas.height / 2);

      const subtitle = gameObj.score >= 5 ? "Great job!" : "Get ready for the next round...";
      ctx.fillStyle = '#ffffff';
      ctx.font = '500 14px Outfit';
      ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 35);
    }
  }

  function quit() {
    clearInterval(gameLoop);
    gameLoop = null;

    if (gameObj && gameObj.lives <= 0) {
      state.game_unlocked_1_3 = false;
      saveProgress();
    }

    gameObj = null;
    window.removeEventListener('keydown', handleGameKeys);
    document.getElementById('lesson-overlay').style.display = 'none';
    session = null;
    renderMap();
  }

  function complete() {
    clearInterval(gameLoop);
    gameLoop = null;
    gameObj = null;
    window.removeEventListener('keydown', handleGameKeys);
    document.getElementById('lesson-overlay').style.display = 'none';

    state.game_unlocked_1_3 = false;
    state.xp += 15;
    saveProgress();
    session = null;
    renderMap();
  }

  function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  return {
    start: start,
    move: move,
    quit: quit,
    isActive: function() { return gameObj !== null; }
  };
})();
