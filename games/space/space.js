/* Space Invaders Game Engine Module */

const SpaceInvadersGame = (function() {
  const GAME_WORDS = ["el mapa", "el país", "el world", "la capital", "tú", "eres", "¿de dónde eres?", "de dónde", "famoso", "histórico", "la lengua", "hispanohablante"];

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
      gameState: 'playing', // 'playing', 'message', 'gameover', 'won'
      messageText: "",
      messageColor: "",
      messageTimer: 0,
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
    // Fallback if target word is not yet mapped in VOCAB_DATABASE
    const wordData = VOCAB_DATABASE[target];
    gameObj.targetWord = wordData ? wordData.english : target;
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

    // End screens exits
    if (gameObj.gameState === 'gameover') {
      if (e.key === 'Enter') {
        quit();
      }
      return;
    }
    if (gameObj.gameState === 'won') {
      if (e.key === 'Enter') {
        complete();
      }
      return;
    }

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
    if (!gameObj || gameObj.gameState !== 'playing') return;
    const step = 20;
    gameObj.ship.x = Math.max(10, Math.min(360, gameObj.ship.x + dir * step));
  }

  function shootLaser() {
    if (!gameObj || gameObj.gameState !== 'playing') return;
    // Cap laser firing frequency to prevent spamming
    if (gameObj.lasers.length < 3) {
      gameObj.lasers.push({
        x: gameObj.ship.x + gameObj.ship.w / 2,
        y: gameObj.ship.y,
        speed: -12
      });
    }
  }

  function triggerMessage(text, color, duration = 45) {
    gameObj.gameState = 'message';
    gameObj.messageText = text;
    gameObj.messageColor = color;
    gameObj.messageTimer = duration;
  }

  function update() {
    if (!gameObj) return;

    if (gameObj.gameState === 'message') {
      gameObj.messageTimer--;
      if (gameObj.messageTimer <= 0) {
        if (gameObj.lives <= 0) {
          gameObj.gameState = 'gameover';
        } else if (gameObj.score >= 10) {
          gameObj.gameState = 'won';
        } else {
          rollRound();
          gameObj.gameState = 'playing';
        }
      }
    } else if (gameObj.gameState === 'playing') {
      // 1. Move Aliens downward
      const speed = 0.5 + (gameObj.score * 0.05); // Speed increases slightly with score
      gameObj.aliens.forEach(alien => {
        alien.y += speed;
      });

      // Check if aliens reach the spaceship line
      const reachedBottom = gameObj.aliens.some(alien => alien.y + alien.h >= gameObj.ship.y);
      if (reachedBottom) {
        resetLoss("Spaceship invaded!");
      } else {
        // 2. Move Lasers
        gameObj.lasers.forEach(laser => {
          laser.y += laser.speed;
        });

        // Filter out lasers that left the screen
        gameObj.lasers = gameObj.lasers.filter(laser => laser.y > 0);

        // 3. Collision Checks (Backwards loop to safely splice without index skipping)
        let hitDetected = false;
        let hitCorrect = false;
        let hitWord = "";

        for (let l = gameObj.lasers.length - 1; l >= 0; l--) {
          const laser = gameObj.lasers[l];
          let laserRemoved = false;
          for (let a = 0; a < gameObj.aliens.length; a++) {
            const alien = gameObj.aliens[a];
            if (laser.y <= alien.y + alien.h && laser.y >= alien.y) {
              if (laser.x >= alien.x && laser.x <= alien.x + alien.w) {
                hitDetected = true;
                hitWord = alien.word;
                gameObj.lasers.splice(l, 1);
                laserRemoved = true;

                if (alien.word === gameObj.correctAnswer) {
                  hitCorrect = true;
                }
                break; // stop checking this laser
              }
            }
          }
        }

        if (hitDetected) {
          if (hitCorrect) {
            gameObj.score++;
            triggerMessage("🎉 CORRECT!", "#10b981", 45);
          } else {
            resetLoss(`You shot "${hitWord}"!`);
          }
        }
      }
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

    // Overlay drawing for messages and ending screens
    if (gameObj.gameState === 'message') {
      drawOverlayBanner(gameObj.messageText, gameObj.messageColor);
    } else if (gameObj.gameState === 'gameover') {
      drawEndScreen("😭 GAME OVER", `Final Score: ${gameObj.score} / 10`, "Press ENTER / click modal '✕' to exit", "#ef4444");
    } else if (gameObj.gameState === 'won') {
      drawEndScreen("🏆 VICTORY!", "You defeated the space invaders!", "Earnings: +25⚡ XP. Press ENTER to close.", "#10b981");
    }
  }

  function drawOverlayBanner(text, color) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    
    const bx = 30;
    const by = 110;
    const bw = canvas.width - 60;
    const bh = 100;
    
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx, by, bw, bh);
    
    ctx.fillStyle = color;
    ctx.font = '700 20px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, by + 45);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px Outfit';
    ctx.fillText("Next round starting...", canvas.width / 2, by + 75);
  }

  function drawEndScreen(title, subtitle1, subtitle2, titleColor) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = titleColor;
    ctx.font = '900 28px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, 130);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 16px Outfit';
    ctx.fillText(subtitle1, canvas.width / 2, 180);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 13px Outfit';
    ctx.fillText(subtitle2, canvas.width / 2, 230);
  }

  function resetLoss(msg) {
    gameObj.lives--;
    if (gameObj.lives <= 0) {
      triggerMessage("😭 GAME OVER", "#ef4444", 60);
    } else {
      triggerMessage(`❌ OUCH! ${msg}`, "#f59e0b", 60);
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
  }

  return {
    start: start,
    moveShip: moveShip,
    shootLaser: shootLaser,
    quit: quit,
    isActive: function() { return gameObj !== null; }
  };
})();
