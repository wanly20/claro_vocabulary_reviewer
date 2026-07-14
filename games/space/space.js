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
      gameState: 'playing', // 'playing', 'message', 'gameover', 'won'
      messageText: "",
      messageColor: "",
      messageTimer: 0,
      score: 0,
      lives: 4,
      ship: { x: 185, y: 310, w: 30, h: 20 },
      waves: [],
      lasers: [],
      stars: [],
      waveSpawnTimer: 0, // spawn immediately on start
      spawnInterval: 240, // 8 seconds at 30fps
      baseSpeed: 0.6
    };

    // Create random star field decoration
    for (let i = 0; i < 30; i++) {
      gameObj.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 2
      });
    }

    spawnWave();
    
    document.addEventListener('keydown', handleGameKeys);

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 1000 / 30);
  }

  function spawnWave() {
    const target = GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
    const wordData = VOCAB_DATABASE[target];
    const targetWord = wordData ? wordData.english : target;
    const correctAnswer = target;

    const distractors = shuffle(GAME_WORDS.filter(w => w !== target));
    const roundWords = shuffle([target, distractors[0], distractors[1]]);

    const aliens = [
      { x: 10, w: 110, h: 30, word: roundWords[0] },
      { x: 145, w: 110, h: 30, word: roundWords[1] },
      { x: 280, w: 110, h: 30, word: roundWords[2] }
    ];

    gameObj.waves.push({
      y: -35,
      targetWord: targetWord,
      correctAnswer: correctAnswer,
      aliens: aliens
    });

    updatePrompt();
  }

  function updatePrompt() {
    const lowestWave = gameObj.waves[0];
    if (lowestWave) {
      document.getElementById('game-prompt-title').textContent = `Shoot the correct alien for: "${lowestWave.targetWord}"`;
    }
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
    // Cap laser to 1 bullet at a time
    if (gameObj.lasers.length === 0) {
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
          // If all waves were cleared (e.g. after life loss), spawn a new one
          if (gameObj.waves.length === 0) {
            spawnWave();
          }
          updatePrompt();
          gameObj.gameState = 'playing';
        }
      }
    } else if (gameObj.gameState === 'playing') {
      // Calculate current speed & spawn interval based on score
      const currentSpeed = gameObj.baseSpeed + (gameObj.score * 0.08);
      const currentSpawnInterval = Math.max(110, 240 - (gameObj.score * 13));

      // Spawn waves by timer
      gameObj.waveSpawnTimer--;
      if (gameObj.waveSpawnTimer <= 0) {
        spawnWave();
        gameObj.waveSpawnTimer = currentSpawnInterval;
      }

      // Move Waves downward
      gameObj.waves.forEach(wave => {
        wave.y += currentSpeed;
      });

      // Check if lowest wave reached the danger line (y = 280)
      if (gameObj.waves.length > 0 && gameObj.waves[0].y + 30 >= 280) {
        resetLoss("Aliens invaded!");
      } else {
        // Move Lasers
        gameObj.lasers.forEach(laser => {
          laser.y += laser.speed;
        });

        // Filter out lasers that left the screen
        gameObj.lasers = gameObj.lasers.filter(laser => laser.y > 0);

        // Collision Checks
        let hitDetected = false;
        let hitCorrect = false;
        let hitWord = "";

        for (let l = gameObj.lasers.length - 1; l >= 0; l--) {
          const laser = gameObj.lasers[l];
          for (let wIdx = 0; wIdx < gameObj.waves.length; wIdx++) {
            const wave = gameObj.waves[wIdx];
            for (let a = 0; a < wave.aliens.length; a++) {
              const alien = wave.aliens[a];
              const alienY = wave.y;
              if (laser.y <= alienY + alien.h && laser.y >= alienY) {
                if (laser.x >= alien.x && laser.x <= alien.x + alien.w) {
                  hitDetected = true;
                  hitWord = alien.word;
                  gameObj.lasers.splice(l, 1); // remove laser

                  // ONLY allow hitting the correct alien in the LOWEST wave
                  if (wIdx === 0 && alien.word === wave.correctAnswer) {
                    hitCorrect = true;
                    gameObj.waves.shift(); // remove completed wave
                  }
                  break;
                }
              }
            }
            if (hitDetected) break;
          }
        }

        if (hitDetected) {
          if (hitCorrect) {
            gameObj.score++;
            triggerMessage("🎉 CORRECT!", "#10b981", 45);
          }
          // Note: If they hit the wrong alien, nothing happens. The bullet is absorbed but no penalty.
        }
      }
    }

    // Drawing Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Space Background stars
    ctx.fillStyle = '#ffffff';
    gameObj.stars.forEach(star => {
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // Draw Danger Zone line
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, 280);
    ctx.lineTo(canvas.width, 280);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Draw Waves of Aliens
    gameObj.waves.forEach((wave, wIdx) => {
      const isLowest = (wIdx === 0);
      wave.aliens.forEach(alien => {
        // Highlight active wave (lowest) in Violet, upper waves in Grey
        ctx.fillStyle = isLowest ? '#7c3aed' : '#4b5563'; 
        ctx.strokeStyle = isLowest ? '#a78bfa' : '#6b7280';
        ctx.lineWidth = 2;
        ctx.fillRect(alien.x, wave.y, alien.w, alien.h);
        ctx.strokeRect(alien.x, wave.y, alien.w, alien.h);

        // Text labels
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(alien.word, alien.x + alien.w/2, wave.y + 19);
      });
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
    ctx.fillText("Resuming game...", canvas.width / 2, by + 75);
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
    gameObj.waves = []; // Clear on screen invaders so player isn't immediately overrun
    gameObj.lasers = [];
    if (gameObj.lives <= 0) {
      triggerMessage("😭 GAME OVER", "#ef4444", 60);
    } else {
      triggerMessage(`❌ ${msg} -1 Life`, "#ef4444", 60);
      gameObj.waveSpawnTimer = 30; // spawn soon
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
