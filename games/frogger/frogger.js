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

    const gameWords = ["¡hola!", "Buenos días", "¡Adiós!", "¿Qué tal?", "soy de", "España", "Estados Unidos", "Argentina", "él", "ella", "es de", "Cuba"];

    gameObj = {
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
    if (e.key === 'ArrowUp' || key === 'k') move(0, -1);
    else if (e.key === 'ArrowDown' || key === 'j') move(0, 1);
    else if (e.key === 'ArrowLeft' || key === 'h') move(-1, 0);
    else if (e.key === 'ArrowRight' || key === 'l') move(1, 0);
  }

  function move(dx, dy) {
    if (!gameObj) return;
    const stepX = 30;
    const stepY = 50; 
    gameObj.frog.x = Math.max(10, Math.min(360, gameObj.frog.x + dx * stepX));
    gameObj.frog.y = Math.max(5, Math.min(canvas.height - 45, gameObj.frog.y + dy * stepY));
  }

  function update() {
    if (!gameObj) return;

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
        resetLoss("Splash! You floated off the screen.");
        return;
      }

      if (!onLog) {
        resetLoss("Splash! You fell in the water.");
        return;
      } else if (matchedLogWord !== correctWord) {
        resetLoss(`Incorrect word! You landed on "${matchedLogWord}" instead of "${correctWord}".`);
        return;
      }
    }

    if (frog.y <= 50) {
      gameObj.score++;
      if (gameObj.score >= 5) {
        complete();
      } else {
        alert(`🎉 Correct sentence built! Crossing ${gameObj.score} / 5 complete!`);
        rollRound();
      }
    }

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
    ctx.fillRect(frog.x, frog.y, frog.w, frog.h);

    ctx.fillStyle = '#000000';
    ctx.fillRect(frog.x + 4, frog.y + 4, 5, 5);
    ctx.fillRect(frog.x + 20, frog.y + 4, 5, 5);
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

    state.game_unlocked = false;
    state.xp += 15;
    saveProgress();

    alert("🏆 Congratulations! You successfully crossed the river 5 times and won the game!\n\nEarnings: +15⚡ XP\n\n🔒 Note: The game is now locked. Complete a practice session on a study node to unlock it again.");
  }

  return {
    start: start,
    move: move,
    isActive: function() { return gameObj !== null; }
  };
})();
