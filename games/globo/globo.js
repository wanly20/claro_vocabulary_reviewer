/* Globo Pop (Balloon Archer) Game Engine Module */

const GloboPopGame = (function() {
  const GAME_WORDS = [
    "Buenas tardes", "¡Hasta luego!", "¿Cómo estás?", "¿Y tú?",
    "bien", "mal", "regular", "fatal",
    "fantástico", "fenomenal", "bien, gracias", "muy bien"
  ];

  let gameLoop = null;
  let canvas = null;
  let ctx = null;
  let gameObj = null;

  function start() {
    if (state.b7_crown < 3) {
      alert("🔒 Globo Pop is locked! You must first complete Bubble 7 (Saludos y Sentimientos) to 3 crowns to unlock this game.");
      return;
    }
    if (!state.game_unlocked_1_2) {
      alert("🔒 Game is locked! To play this game again, you must first complete a practice crown in a study bubble.");
      return;
    }

    const area = document.getElementById('question-area');
    area.innerHTML = `
      <span class="prompt-label" id="game-prompt-title">Globo Pop: Loading...</span>
      <div id="globo-canvas-container">
        <canvas id="globo-canvas" width="400" height="350"></canvas>
        <div class="direction-pad-globo">
          <button class="d-btn" onclick="GloboPopGame.rotateBow(-1)">◀</button>
          <button class="d-btn" onclick="GloboPopGame.fireArrow()" style="width: 80px; font-weight: 800; font-size: 0.85rem;">SHOOT</button>
          <button class="d-btn" onclick="GloboPopGame.rotateBow(1)">▶</button>
        </div>
      </div>
    `;

    document.getElementById('check-btn').hidden = true;
    document.getElementById('lesson-overlay').style.display = 'flex';

    init();
  }

  function init() {
    canvas = document.getElementById('globo-canvas');
    ctx = canvas.getContext('2d');

    document.getElementById('lesson-progress-fill').style.width = '0%';

    gameObj = {
      gameState: 'playing', // 'playing', 'message', 'gameover', 'won'
      messageText: "",
      messageColor: "",
      messageTimer: 0,
      score: 0,
      lives: 4,
      bow: { x: 200, y: 330, angle: -Math.PI / 2, length: 30 },
      arrows: [],
      balloons: [],
      particles: [],
      correctAnswer: "",
      targetWord: ""
    };

    spawnWave();

    window.addEventListener('keydown', handleGameKeys);

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 1000 / 30);
  }

  function spawnWave() {
    // Select 3 random unique words from pool
    const roundWords = shuffle([...GAME_WORDS]).slice(0, 3);
    const correctWord = roundWords[Math.floor(Math.random() * roundWords.length)];
    const wordData = VOCAB_DATABASE[correctWord];

    gameObj.correctAnswer = correctWord;
    gameObj.targetWord = wordData ? wordData.english : correctWord;

    const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6'];
    const shuffledColors = shuffle(colors);

    // X positions spaced across the screen
    const xOffsets = [70, 200, 330];
    const shuffledX = shuffle(xOffsets);

    gameObj.balloons = [];
    for (let i = 0; i < 3; i++) {
      gameObj.balloons.push({
        x: shuffledX[i],
        y: 380, // Start just off screen
        r: 22,
        vy: -0.8 - Math.random() * 0.7, // Slow upward drift
        word: roundWords[i],
        color: shuffledColors[i]
      });
    }

    document.getElementById('game-prompt-title').textContent = `Shoot: "${gameObj.targetWord}"`;
  }

  function rotateBow(dir) {
    if (!gameObj || gameObj.gameState !== 'playing') return;
    // Rotate 5 degrees left or right
    const delta = 0.08 * dir;
    gameObj.bow.angle = Math.max(-Math.PI + 0.2, Math.min(-0.2, gameObj.bow.angle + delta));
  }

  function fireArrow() {
    if (!gameObj || gameObj.gameState !== 'playing') return;
    if (gameObj.arrows.length > 2) return; // Max 3 arrows active

    const angle = gameObj.bow.angle;
    const speed = 7.5;

    gameObj.arrows.push({
      x: gameObj.bow.x,
      y: gameObj.bow.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle: angle
    });
  }

  function handleGameKeys(e) {
    if (!gameObj || gameObj.gameState !== 'playing') return;
    if (e.key === 'ArrowLeft' || e.key === 'a') {
      rotateBow(-1);
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
      rotateBow(1);
    } else if (e.key === ' ' || e.key === 'Enter') {
      fireArrow();
      e.preventDefault();
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
          spawnWave();
        }
      }
      draw();
      return;
    }

    // Move arrows
    for (let i = gameObj.arrows.length - 1; i >= 0; i--) {
      const arr = gameObj.arrows[i];
      arr.x += arr.vx;
      arr.y += arr.vy;

      // Remove off screen arrows
      if (arr.x < -20 || arr.x > canvas.width + 20 || arr.y < -20) {
        gameObj.arrows.splice(i, 1);
      }
    }

    // Move balloons
    let correctEscaped = false;
    gameObj.balloons.forEach(bal => {
      bal.y += bal.vy;
      if (bal.y < -30 && bal.word === gameObj.correctAnswer) {
        correctEscaped = true;
      }
    });

    if (correctEscaped) {
      gameObj.lives--;
      triggerMessage("❌ MISSED TARGET!", "#ef4444", 30);
      draw();
      return;
    }

    // Check collisions
    let hitCorrect = false;
    let hitIncorrect = false;
    let hitWord = "";

    for (let b = gameObj.balloons.length - 1; b >= 0; b--) {
      const bal = gameObj.balloons[b];
      for (let a = gameObj.arrows.length - 1; a >= 0; a--) {
        const arr = gameObj.arrows[a];

        const dist = Math.hypot(arr.x - bal.x, arr.y - bal.y);
        if (dist < bal.r + 5) {
          // Hit detected!
          createExplosion(bal.x, bal.y, bal.color);
          gameObj.arrows.splice(a, 1);
          
          if (bal.word === gameObj.correctAnswer) {
            hitCorrect = true;
          } else {
            hitIncorrect = true;
            hitWord = bal.word;
          }
          break;
        }
      }
      if (hitCorrect || hitIncorrect) break;
    }

    if (hitCorrect) {
      gameObj.score++;
      const pct = Math.min(100, (gameObj.score / 5) * 100);
      document.getElementById('lesson-progress-fill').style.width = `${pct}%`;
      triggerMessage("🎉 CORRECT!", "#10b981", 10);
    } else if (hitIncorrect) {
      gameObj.lives--;
      triggerMessage(`❌ INCORRECT! (-1 Life)`, "#ef4444", 30);
    }

    // Move particles
    for (let p = gameObj.particles.length - 1; p >= 0; p--) {
      const prt = gameObj.particles[p];
      prt.x += prt.vx;
      prt.y += prt.vy;
      prt.vy += 0.05; // gravity
      prt.alpha -= 0.03;
      if (prt.alpha <= 0) {
        gameObj.particles.splice(p, 1);
      }
    }

    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Bow/Launcher
    ctx.save();
    ctx.translate(gameObj.bow.x, gameObj.bow.y);
    ctx.rotate(gameObj.bow.angle + Math.PI / 2);

    // Draw Bow base/stand
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI, true);
    ctx.fill();

    // Draw Arrow shaft (ready to fire)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -gameObj.bow.length);
    ctx.stroke();

    // Draw Arrow tip
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(-5, -gameObj.bow.length);
    ctx.lineTo(5, -gameObj.bow.length);
    ctx.lineTo(0, -gameObj.bow.length - 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Draw fired arrows
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    gameObj.arrows.forEach(arr => {
      ctx.save();
      ctx.translate(arr.x, arr.y);
      ctx.rotate(arr.angle + Math.PI / 2);
      
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(0, -15);
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(-4, -15);
      ctx.lineTo(4, -15);
      ctx.lineTo(0, -22);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });

    // Draw balloons
    gameObj.balloons.forEach(bal => {
      ctx.fillStyle = bal.color;

      // Balloon body (oval)
      ctx.save();
      ctx.translate(bal.x, bal.y);
      ctx.scale(1, 1.15);
      ctx.beginPath();
      ctx.arc(0, 0, bal.r, 0, Math.PI * 2);
      ctx.fill();

      // Balloon reflection highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(-bal.r * 0.35, -bal.r * 0.35, bal.r * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Balloon knot (small triangle at bottom)
      ctx.fillStyle = bal.color;
      ctx.beginPath();
      ctx.moveTo(bal.x, bal.y + bal.r * 1.1);
      ctx.lineTo(bal.x - 5, bal.y + bal.r * 1.1 + 5);
      ctx.lineTo(bal.x + 5, bal.y + bal.r * 1.1 + 5);
      ctx.closePath();
      ctx.fill();

      // Balloon string
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bal.x, bal.y + bal.r * 1.1 + 5);
      ctx.bezierCurveTo(bal.x - 3, bal.y + bal.r * 1.1 + 15, bal.x + 3, bal.y + bal.r * 1.1 + 25, bal.x, bal.y + bal.r * 1.1 + 35);
      ctx.stroke();

      // Draw word text
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 2.5;
      ctx.font = '700 13px Outfit';
      ctx.textAlign = 'center';
      ctx.strokeText(bal.word, bal.x, bal.y + 4);
      ctx.fillText(bal.word, bal.x, bal.y + 4);
    });

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
    ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#ffffff' : '#1e293b';
    ctx.font = '700 13px Outfit';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameObj.score}/5`, 16, 25);
    ctx.textAlign = 'right';
    ctx.fillText(`Lives: ${"❤️".repeat(gameObj.lives)}${"🖤".repeat(4 - gameObj.lives)}`, canvas.width - 16, 25);

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
      state.game_unlocked_1_2 = false;
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

    state.game_unlocked_1_2 = false;
    state.xp += 15;
    saveProgress();
    session = null;
    renderMap();
  }

  // Shuffle helper
  function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  return {
    start: start,
    rotateBow: rotateBow,
    fireArrow: fireArrow,
    quit: quit,
    isActive: function() { return gameObj !== null; }
  };
})();
