/* Frogger Crossing Game Engine Module */

const FroggerGame = (function() {
  const GAME_SENTENCES = [
    { english: "Hello! I am from Spain.", spanish: ["¡hola!", "soy de", "España"] },
    { english: "Hello! I am from Argentina.", spanish: ["¡hola!", "soy de", "Argentina"] },
    { english: "Hello! I am from Cuba.", spanish: ["¡hola!", "soy de", "Cuba"] },
    { english: "He is from Spain.", spanish: ["él", "es de", "España"] },
    { english: "She is from Spain.", spanish: ["ella", "es de", "España"] },
    { english: "He is from Argentina.", spanish: ["él", "es de", "Argentina"] },
    { english: "She is from Argentina.", spanish: ["ella", "es de", "Argentina"] },
    { english: "He is from Cuba.", spanish: ["él", "es de", "Cuba"] },
    { english: "She is from Cuba.", spanish: ["ella", "es de", "Cuba"] },
    { english: "Hello! He is from Spain.", spanish: ["¡hola!", "él", "es de", "España"] },
    { english: "Hello! She is from Spain.", spanish: ["¡hola!", "ella", "es de", "España"] },
    { english: "Hello! He is from Argentina.", spanish: ["¡hola!", "él", "es de", "Argentina"] },
    { english: "Hello! She is from Argentina.", spanish: ["¡hola!", "ella", "es de", "Argentina"] },
    { english: "Hello! He is from Cuba.", spanish: ["¡hola!", "él", "es de", "Cuba"] },
    { english: "Hello! She is from Cuba.", spanish: ["¡hola!", "ella", "es de", "Cuba"] }
  ];

  let gameLoop = null;
  let canvas = null;
  let ctx = null;
  let gameObj = null;

  function start() {
    if (state.b1_crown < 3) return; 
    if (!state.game_unlocked) {
      alert("🔒 Game is locked! To play this game again, you must first complete a practice crown in a study bubble.");
      return;
    }

    const area = document.getElementById('question-area');
    area.innerHTML = `
      <span class="prompt-label" id="game-prompt-title">Cruce del Río: Loading...</span>
      <div id="frogger-canvas-container">
        <canvas id="frogger-canvas" width="400" height="300"></canvas>
        <div class="direction-pad">
          <div></div>
          <button class="d-btn" onclick="FroggerGame.move(0, -1)">▲</button>
          <div></div>
          <button class="d-btn" onclick="FroggerGame.move(-1, 0)">◀</button>
          <button class="d-btn" onclick="FroggerGame.move(0, 1)">▼</button>
          <button class="d-btn" onclick="FroggerGame.move(1, 0)">▶</button>
        </div>
      </div>
    `;

    document.getElementById('check-btn').hidden = true;
    document.getElementById('lesson-overlay').style.display = 'flex';

    init();
  }

  function init() {
    canvas = document.getElementById('frogger-canvas');
    ctx = canvas.getContext('2d');

    // Reset progress bar in header to 0%
    document.getElementById('lesson-progress-fill').style.width = '0%';

    const gameWords = ["¡hola!", "Buenos días", "¡Adiós!", "¿Qué tal?", "soy de", "España", "Estados Unidos", "Argentina", "él", "ella", "es de", "Cuba"];

    gameObj = {
      gameState: 'playing', // 'playing', 'message', 'gameover', 'won'
      messageText: "",
      messageColor: "",
      messageTimer: 0,
      words: gameWords,
      targetSentence: "",
      spanishChunks: [],
      numRows: 3,
      score: 0,
      lives: 4,
      frog: { x: 185, y: 255, w: 30, h: 30 },
      logs: []
    };

    rollRound();
    
    document.addEventListener('keydown', handleGameKeys);

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 1000 / 30);
  }

  function rollRound() {
    const sentenceObj = GAME_SENTENCES[Math.floor(Math.random() * GAME_SENTENCES.length)];
    gameObj.targetSentence = sentenceObj.english;
    gameObj.spanishChunks = sentenceObj.spanish;
    gameObj.numRows = sentenceObj.spanish.length;

    canvas.height = gameObj.numRows * 50 + 100;

    document.getElementById('game-prompt-title').textContent = `Cross in order: "${gameObj.targetSentence}"`;

    gameObj.logs = [];

    for (let i = 0; i < gameObj.numRows; i++) {
      const correctWord = gameObj.spanishChunks[gameObj.numRows - 1 - i];
      
      let dist = "";
      do {
        dist = gameObj.words[Math.floor(Math.random() * gameObj.words.length)];
      } while (dist === correctWord);

      const speed = (i % 2 === 0) ? (1.4 + Math.random() * 0.6) : (-1.4 - Math.random() * 0.6);
      const isCorrectLeft = Math.random() < 0.5;

      const startX = Math.random() * 100;
      gameObj.logs.push({
        x: startX,
        y: 50 + i * 50 + 5,
        w: 125,
        h: 40,
        speed: speed,
        word: isCorrectLeft ? correctWord : dist
      });

      gameObj.logs.push({
        x: startX + 200,
        y: 50 + i * 50 + 5,
        w: 125,
        h: 40,
        speed: speed,
        word: isCorrectLeft ? dist : correctWord
      });
    }

    gameObj.frog.x = 185;
    gameObj.frog.y = canvas.height - 45;
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

    if (e.key === 'ArrowUp' || key === 'k') move(0, -1);
    else if (e.key === 'ArrowDown' || key === 'j') move(0, 1);
    else if (e.key === 'ArrowLeft' || key === 'h') move(-1, 0);
    else if (e.key === 'ArrowRight' || key === 'l') move(1, 0);
  }

  function move(dx, dy) {
    if (!gameObj || gameObj.gameState !== 'playing') return;
    const stepX = 30;
    const stepY = 50; 
    gameObj.frog.x = Math.max(10, Math.min(360, gameObj.frog.x + dx * stepX));
    gameObj.frog.y = Math.max(5, Math.min(canvas.height - 45, gameObj.frog.y + dy * stepY));
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
        } else if (gameObj.score >= 5) {
          gameObj.gameState = 'won';
        } else {
          rollRound();
          gameObj.gameState = 'playing';
        }
      }
    } else if (gameObj.gameState === 'playing') {
      // Move Logs
      gameObj.logs.forEach(log => {
        log.x += log.speed;
        if (log.speed > 0 && log.x > canvas.width) {
          log.x = -log.w;
        } else if (log.speed < 0 && log.x < -log.w) {
          log.x = canvas.width;
        }
      });

      const frog = gameObj.frog;
      let onLog = false;
      let matchedLogWord = "";

      if (frog.y > 50 && frog.y < canvas.height - 50) {
        const rowIndex = Math.floor((frog.y - 50) / 50);
        const correctWord = gameObj.spanishChunks[gameObj.numRows - 1 - rowIndex];

        gameObj.logs.forEach(log => {
          if (frog.y >= log.y && frog.y <= log.y + log.h) {
            if (frog.x + frog.w > log.x && frog.x < log.x + log.w) {
              onLog = true;
              matchedLogWord = log.word;
              frog.x += log.speed;
            }
          }
        });

        if (frog.x < 0 || frog.x + frog.w > canvas.width) {
          resetLoss("Floated off screen!");
          return;
        }

        if (!onLog) {
          resetLoss("Fell in water!");
          return;
        } else if (matchedLogWord !== correctWord) {
          resetLoss(`Stepped on "${matchedLogWord}"!`);
          return;
        }
      }

      if (frog.y <= 50) {
        gameObj.score++;
        
        // Move progress bar in header forward
        const progressPercent = Math.min(100, (gameObj.score / 5) * 100);
        document.getElementById('lesson-progress-fill').style.width = `${progressPercent}%`;

        if (gameObj.score >= 5) {
          triggerMessage("🏆 ALL CROSSINGS DONE!", "#10b981", 60);
        } else {
          triggerMessage(`🎉 CORRECT! Crossing ${gameObj.score}/5 complete!`, "#10b981", 20);
        }
        return;
      }
    }

    // Drawing Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#27ae60'; 
    ctx.fillRect(0, 0, canvas.width, 50);
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    ctx.fillStyle = '#3498db'; 
    ctx.fillRect(0, 50, canvas.width, canvas.height - 100);

    gameObj.logs.forEach(log => {
      ctx.fillStyle = '#873600'; 
      ctx.fillRect(log.x, log.y, log.w, log.h);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(log.word, log.x + log.w/2, log.y + 24);
    });

    ctx.fillStyle = '#2ecc71'; 
    ctx.fillRect(gameObj.frog.x, gameObj.frog.y, gameObj.frog.w, gameObj.frog.h);

    ctx.fillStyle = '#000000';
    ctx.fillRect(gameObj.frog.x + 4, gameObj.frog.y + 4, 5, 5);
    ctx.fillRect(gameObj.frog.x + 20, gameObj.frog.y + 4, 5, 5);

    // Draw HUD (score and lives)
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 12px Outfit';
    ctx.textAlign = 'left';
    ctx.fillText(`CROSSINGS: ${gameObj.score} / 5`, 10, 20);

    let heartsStr = "❤️".repeat(gameObj.lives);
    ctx.textAlign = 'right';
    ctx.fillText(`LIVES: ${heartsStr}`, canvas.width - 10, 20);

    // Overlay drawing for messages and ending screens
    if (gameObj.gameState === 'message') {
      drawOverlayBanner(gameObj.messageText, gameObj.messageColor);
    } else if (gameObj.gameState === 'gameover') {
      drawEndScreen("😭 GAME OVER", `Crossing Progress: ${gameObj.score} / 5`, "Press ENTER / click modal '✕' to exit", "#ef4444");
    } else if (gameObj.gameState === 'won') {
      drawEndScreen("🏆 VICTORY!", "You successfully crossed the river 5 times!", "Earnings: +15⚡ XP. Press ENTER to close.", "#10b981");
    }
  }

  function drawOverlayBanner(text, color) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    
    const bx = 30;
    const by = (canvas.height / 2) - 50;
    const bw = canvas.width - 60;
    const bh = 100;
    
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx, by, bw, bh);
    
    ctx.fillStyle = color;
    ctx.font = '700 16px Outfit';
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
    ctx.fillText(title, canvas.width / 2, 110);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 16px Outfit';
    ctx.fillText(subtitle1, canvas.width / 2, 160);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 13px Outfit';
    ctx.fillText(subtitle2, canvas.width / 2, 210);
  }

  function resetLoss(msg) {
    gameObj.lives--;
    if (gameObj.lives <= 0) {
      triggerMessage("😭 GAME OVER", "#ef4444", 60);
    } else {
      triggerMessage(`❌ Splash! ${msg}`, "#f59e0b", 30);
    }
  }

  // Expose clean quit
  function quit() {
    clearInterval(gameLoop);
    gameLoop = null;

    // If the game ends because they lost all lives, lock the game!
    if (gameObj && gameObj.lives <= 0) {
      state.game_unlocked = false;
      saveProgress();
    }

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

    state.game_unlocked = false;
    state.xp += 15;
    saveProgress();
  }

  return {
    start: start,
    move: move,
    quit: quit,
    isActive: function() { return gameObj !== null; }
  };
})();
