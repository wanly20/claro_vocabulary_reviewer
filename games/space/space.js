/* Space Invaders Game Engine Module */

const SpaceInvadersGame = (function() {
  const GAME_WORDS = ["el mapa", "el país", "el mundo", "la capital", "tú", "eres", "¿de dónde eres?", "de dónde", "famoso", "histórico", "la lengua", "hispanohablante"];

  let gameLoop = null;
  let canvas = null;
  let ctx = null;
  let gameObj = null;

  function start() {
    if (state.b3_crown < 3) return; 
    if (!state.game2_unlocked) {
      alert("🔒 Game is locked! To play this game again, you must first complete a practice crown in a study bubble.");
      return;
    }

    const area = document.getElementById('question-area');
    area.innerHTML = `
      <span class="prompt-label" id="game-prompt-title">Invasores del Espacio: Loading...</span>
      <div id="space-canvas-container">
        <canvas id="space-canvas" width="400" height="350"></canvas>
        <div class="direction-pad-space">
          <button class="d-btn" onclick="SpaceInvadersGame.moveShip(-1)">◀</button>
          <button class="d-btn" onclick="SpaceInvadersGame.shootLaser()" style="width: 80px; font-weight: 800; font-size: 0.85rem;">SHOOT</button>
          <button class="d-btn" onclick="SpaceInvadersGame.moveShip(1)">▶</button>
        </div>
      </div>
    `;

    document.getElementById('check-btn').hidden = true;
    document.getElementById('lesson-overlay').style.display = 'flex';

    init();
  }

  function init() {
    canvas = document.getElementById('space-canvas');
    ctx = canvas.getContext('2d');

    gameObj = {
      targetWord: "",
      correctAnswer: "",
      score: 0,
      lives: 4,
      ship: { x: 185, y: 310, w: 30, h: 20 },
      aliens: [
        { x: 10, y: 40, w: 110, h: 35, word: "" },
        { x: 145, y: 40, w: 110, h: 35, word: "" },
        { x: 280, y: 40, w: 110, h: 35, word: "" }
      ],
      lasers: [],
      stars: []
    };

    // Create random star field decoration
    for (let i = 0; i < 30; i++) {
      gameObj.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 2
      });
    }

    rollRound();
    
    document.addEventListener('keydown', handleGameKeys);

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 1000 / 30);
  }

  function rollRound() {
    const target = GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
    gameObj.targetWord = VOCAB_DATABASE[target].english;
    gameObj.correctAnswer = target;

    document.getElementById('game-prompt-title').textContent = `Shoot the correct alien for: "${gameObj.targetWord}"`;

    const distractors = shuffle(GAME_WORDS.filter(w => w !== target));

    // Choose 3 words (1 correct + 2 distractors)
    const roundWords = shuffle([target, distractors[0], distractors[1]]);
    
    // Reset alien positions to top and assign words
    gameObj.aliens.forEach((alien, idx) => {
      alien.y = 40;
      alien.word = roundWords[idx];
    });

    gameObj.lasers = [];
  }

  function handleGameKeys(e) {
    if (!gameObj) return;
    const key = e.key.toLowerCase();
    if (e.key === 'ArrowLeft' || key === 'h') {
      moveShip(-1);
    } else if (e.key === 'ArrowRight' || key === 'l') {
      moveShip(1);
    } else if (e.key === ' ' || key === 'k' || e.key === 'ArrowUp') {
      shootLaser();
      e.preventDefault(); // Prevent page scrolling
    }
  }

  function moveShip(dir) {
    if (!gameObj) return;
    const step = 20;
    gameObj.ship.x = Math.max(10, Math.min(360, gameObj.ship.x + dir * step));
  }

  function shootLaser() {
    if (!gameObj) return;
    // Cap laser firing frequency to prevent spamming
    if (gameObj.lasers.length < 3) {
      gameObj.lasers.push({
        x: gameObj.ship.x + gameObj.ship.w / 2,
        y: gameObj.ship.y,
        speed: -12
      });
    }
  }

  function update() {
    if (!gameObj) return;

    // 1. Move Aliens downward
    const speed = 0.5 + (gameObj.score * 0.05); // Speed increases slightly with score
    gameObj.aliens.forEach(alien => {
      alien.y += speed;
    });

    // Check if aliens reach the spaceship line
    const reachedBottom = gameObj.aliens.some(alien => alien.y + alien.h >= gameObj.ship.y);
    if (reachedBottom) {
      resetLoss("Aliens reached the bottom! Spaceship invaded.");
      return;
    }

    // 2. Move Lasers
    gameObj.lasers.forEach((laser, idx) => {
      laser.y += laser.speed;
    });

    // Filter out lasers that left the screen
    gameObj.lasers = gameObj.lasers.filter(laser => laser.y > 0);

    // 3. Collision Checks
    let hitDetected = false;
    let hitCorrect = false;
    let hitWord = "";

    gameObj.lasers.forEach((laser, lIdx) => {
      gameObj.aliens.forEach(alien => {
        if (laser.y <= alien.y + alien.h && laser.y >= alien.y) {
          if (laser.x >= alien.x && laser.x <= alien.x + alien.w) {
            // Collision detected!
            hitDetected = true;
            hitWord = alien.word;
            gameObj.lasers.splice(lIdx, 1); // remove laser
            
            if (alien.word === gameObj.correctAnswer) {
              hitCorrect = true;
            }
          }
        }
      });
    });

    if (hitDetected) {
      if (hitCorrect) {
        gameObj.score++;
        if (gameObj.score >= 10) {
          complete();
        } else {
          alert(`🎉 Correct! Score: ${gameObj.score} / 10`);
          rollRound();
        }
      } else {
        resetLoss(`Incorrect! You shot "${hitWord}" instead of "${gameObj.correctAnswer}".`);
      }
      return;
    }

    // 4. Drawing Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Space Background stars
    ctx.fillStyle = '#ffffff';
    gameObj.stars.forEach(star => {
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // Draw Aliens
    gameObj.aliens.forEach(alien => {
      ctx.fillStyle = '#8b5cf6'; // Violet glowing aliens
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 2;
      ctx.fillRect(alien.x, alien.y, alien.w, alien.h);
      ctx.strokeRect(alien.x, alien.y, alien.w, alien.h);

      // Text labels
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(alien.word, alien.x + alien.w/2, alien.y + 22);
    });

    // Draw Spaceship
    ctx.fillStyle = 'var(--brand-green)';
    ctx.beginPath();
    ctx.moveTo(gameObj.ship.x + gameObj.ship.w / 2, gameObj.ship.y);
    ctx.lineTo(gameObj.ship.x, gameObj.ship.y + gameObj.ship.h);
    ctx.lineTo(gameObj.ship.x + gameObj.ship.w, gameObj.ship.y + gameObj.ship.h);
    ctx.closePath();
    ctx.fill();

    // Draw Lasers
    ctx.strokeStyle = '#ef4444'; // Bright red lasers
    ctx.lineWidth = 3;
    gameObj.lasers.forEach(laser => {
      ctx.beginPath();
      ctx.moveTo(laser.x, laser.y);
      ctx.lineTo(laser.x, laser.y + 10);
      ctx.stroke();
    });

    // Draw HUD (score and lives)
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 12px Outfit';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${gameObj.score} / 10`, 10, 20);

    let heartsStr = "❤️".repeat(gameObj.lives);
    ctx.textAlign = 'right';
    ctx.fillText(`LIVES: ${heartsStr}`, canvas.width - 10, 20);
  }

  function resetLoss(msg) {
    gameObj.lives--;
    if (gameObj.lives <= 0) {
      alert(`😭 Game Over! ${msg}`);
      quit();
    } else {
      alert(`❌ ${msg} Lives remaining: ${gameObj.lives}`);
      rollRound();
    }
  }

  function quit() {
    clearInterval(gameLoop);
    gameLoop = null;
    gameObj = null;
    document.removeEventListener('keydown', handleGameKeys);
    document.getElementById('lesson-overlay').style.display = 'none';
  }

  function complete() {
    clearInterval(gameLoop);
    gameLoop = null;
    gameObj = null;
    document.removeEventListener('keydown', handleGameKeys);
    document.getElementById('lesson-overlay').style.display = 'none';

    state.game2_unlocked = false;
    state.xp += 25;
    saveProgress();

    alert("🏆 Congratulations! You successfully defeated the invaders and won the game!\n\nEarnings: +25⚡ XP\n\n🔒 Note: The game is now locked. Complete a practice session on a study node to unlock it again.");
  }

  return {
    start: start,
    moveShip: moveShip,
    shootLaser: shootLaser,
    isActive: function() { return gameObj !== null; }
  };
})();
