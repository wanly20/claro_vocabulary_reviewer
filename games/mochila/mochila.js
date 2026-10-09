/* En mi mochila — backpack packing game engine (Chapter 1.6)
 *
 * Vocabulary rule (see buhisimo_rules.md §0): every Spanish word shown here is
 * introduced by Bubble 27 or an earlier bubble on the map —
 *   - school objects + "un"/"una"        → b27 (Chapter 1.6)
 *   - colours                            → b22 (Chapter 1.5)
 *   - numbers dos–cinco                  → b14 (Chapter 1.3)
 * Every request string is built from the inflection tables below (never string
 * concatenation of a bare adjective), so the Spanish is always grammatical.
 */

const MochilaGame = (function() {

  // Countable school objects. "las tijeras" is deliberately excluded from the
  // game (plural-only noun — kept for the b27 flashcards and the mix engine).
  const OBJECTS = [
    { key: "el bolígrafo",      g: "m", sing: "bolígrafo",      plur: "bolígrafos",      emoji: "🖊️" },
    { key: "el lápiz",          g: "m", sing: "lápiz",          plur: "lápices",         emoji: "✏️" },
    { key: "el cuaderno",       g: "m", sing: "cuaderno",       plur: "cuadernos",       emoji: "📓" },
    { key: "el libro",          g: "m", sing: "libro",          plur: "libros",          emoji: "📕" },
    { key: "el libro de texto", g: "m", sing: "libro de texto", plur: "libros de texto", emoji: "📚" },
    { key: "el estuche",        g: "m", sing: "estuche",        plur: "estuches",        emoji: "🧰" },
    { key: "el sacapuntas",     g: "m", sing: "sacapuntas",     plur: "sacapuntas",      emoji: "🔩" },
    { key: "la goma",           g: "f", sing: "goma",           plur: "gomas",           emoji: "🧽" },
    { key: "la regla",          g: "f", sing: "regla",          plur: "reglas",          emoji: "📐" },
    { key: "la hoja de papel",  g: "f", sing: "hoja de papel",  plur: "hojas de papel",  emoji: "📄" }
  ];

  // Colour adjective, all four agreement forms + a display swatch.
  const COLOURS = [
    { base: "rojo",    ms: "rojo",    fs: "roja",    hex: "#e53935" },
    { base: "azul",    ms: "azul",    fs: "azul",    hex: "#1e88e5" },
    { base: "verde",   ms: "verde",   fs: "verde",   hex: "#43a047" },
    { base: "amarillo",ms: "amarillo",fs: "amarilla",hex: "#fdd835" },
    { base: "negro",   ms: "negro",   fs: "negra",   hex: "#212121" },
    { base: "blanco",  ms: "blanco",  fs: "blanca",  hex: "#f5f5f5" },
    { base: "gris",    ms: "gris",    fs: "gris",    hex: "#9e9e9e" },
    { base: "morado",  ms: "morado",  fs: "morada",  hex: "#8e24aa" },
    { base: "naranja", ms: "naranja", fs: "naranja", hex: "#fb8c00" },
    { base: "rosa",    ms: "rosa",    fs: "rosa",    hex: "#ec407a" }
  ];

  const NUMWORDS = { 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco" };

  const TOTAL_ROUNDS = 10;
  const START_LIVES = 4;
  const ROUND_SECONDS = 12;

  let g = null;          // game state
  let tickTimer = null;

  function colourFor(colour, gender) {
    return gender === "f" ? colour.fs : colour.ms;
  }

  function start(chapterNum = 6) {
    if (state.b27_crown < 3) {
      alert("🔒 En mi mochila is locked! Complete Bubble 27 (Material Escolar) to 3 crowns first.");
      return;
    }
    if (!state.game_unlocked_1_6) {
      alert("🔒 Game is locked! To play again, first complete a practice crown on a study bubble.");
      return;
    }

    const area = document.getElementById('question-area');
    area.innerHTML = `
      <span class="prompt-label" id="game-prompt-title">En mi mochila</span>
      <div id="mochila-game-container">
        <div class="mochila-hud">
          <span id="mochila-score">Ronda 1 / ${TOTAL_ROUNDS}</span>
          <span class="mochila-lives" id="mochila-lives"></span>
        </div>
        <div class="mochila-timer-track"><div class="mochila-timer-fill" id="mochila-timer"></div></div>
        <div class="mochila-request">
          <div class="mochila-request-label">Pon en la mochila 🎒</div>
          <div class="mochila-request-text" id="mochila-request-text">…</div>
        </div>
        <div class="mochila-grid" id="mochila-grid"></div>
      </div>
    `;

    document.getElementById('check-btn').hidden = true;
    document.getElementById('lesson-overlay').style.display = 'flex';
    document.getElementById('lesson-progress-fill').style.width = '0%';

    g = { round: 0, score: 0, lives: START_LIVES, locked: false, timeLeft: ROUND_SECONDS };
    nextRound();

    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(tick, 250);
  }

  function drawHud() {
    document.getElementById('mochila-score').textContent = `Ronda ${Math.min(g.round, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS}`;
    document.getElementById('mochila-lives').textContent = "❤️".repeat(g.lives) + "🖤".repeat(START_LIVES - g.lives);
    const pct = Math.max(0, (g.timeLeft / ROUND_SECONDS) * 100);
    document.getElementById('mochila-timer').style.width = `${pct}%`;
    document.getElementById('lesson-progress-fill').style.width = `${(g.score / TOTAL_ROUNDS) * 100}%`;
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function nextRound() {
    if (g.round >= TOTAL_ROUNDS) { finish(true); return; }
    g.round++;
    g.timeLeft = ROUND_SECONDS;
    g.locked = false;

    const mode = Math.random() < 0.5 ? "colour" : "count";
    const obj = pick(OBJECTS);
    let requestText, matches;

    if (mode === "colour") {
      const colour = pick(COLOURS);
      const art = obj.g === "f" ? "una" : "un";
      requestText = `${art} ${obj.sing} ${colourFor(colour, obj.g)}`;
      matches = (t) => t.objKey === obj.key && t.colourBase === colour.base && t.count === 1;

      const tiles = [{ objKey: obj.key, emoji: obj.emoji, count: 1, colourBase: colour.base, hex: colour.hex }];
      // distractors: same object other colours, other objects same colour
      const otherColours = shuffle(COLOURS.filter(c => c.base !== colour.base)).slice(0, 3);
      otherColours.forEach(c => tiles.push({ objKey: obj.key, emoji: obj.emoji, count: 1, colourBase: c.base, hex: c.hex }));
      const otherObjs = shuffle(OBJECTS.filter(o => o.key !== obj.key)).slice(0, 2);
      otherObjs.forEach(o => tiles.push({ objKey: o.key, emoji: o.emoji, count: 1, colourBase: colour.base, hex: colour.hex }));
      renderRound(requestText, shuffle(tiles), matches);

    } else {
      const n = pick([2, 3, 4, 5]);
      requestText = `${NUMWORDS[n]} ${obj.plur}`;
      matches = (t) => t.objKey === obj.key && t.count === n && !t.colourBase;

      const tiles = [{ objKey: obj.key, emoji: obj.emoji, count: n }];
      // distractors: same object wrong count, other objects right/near count
      shuffle([2, 3, 4, 5].filter(x => x !== n)).slice(0, 2)
        .forEach(x => tiles.push({ objKey: obj.key, emoji: obj.emoji, count: x }));
      shuffle(OBJECTS.filter(o => o.key !== obj.key)).slice(0, 3)
        .forEach(o => tiles.push({ objKey: o.key, emoji: o.emoji, count: pick([2, 3, 4, 5]) }));
      renderRound(requestText, shuffle(tiles), matches);
    }
    drawHud();
  }

  function renderRound(requestText, tiles, matches) {
    document.getElementById('mochila-request-text').textContent = requestText;
    speakTTS(requestText);
    const grid = document.getElementById('mochila-grid');
    grid.innerHTML = '';
    tiles.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'mochila-tile';
      btn.type = 'button';
      const face = document.createElement('div');
      face.textContent = t.emoji.repeat(t.count);
      btn.appendChild(face);
      if (t.colourBase) {
        const sw = document.createElement('div');
        sw.className = 'mochila-swatch';
        sw.style.background = t.hex;
        btn.appendChild(sw);
      }
      btn.onclick = () => choose(btn, t, matches);
      grid.appendChild(btn);
    });
  }

  function choose(btn, tile, matches) {
    if (g.locked) return;
    g.locked = true;
    const correct = matches(tile);
    document.querySelectorAll('.mochila-tile').forEach(b => b.classList.add('disabled'));

    if (correct) {
      btn.classList.add('correct');
      g.score++;
      setTimeout(nextRound, 550);
    } else {
      btn.classList.add('wrong');
      g.lives--;
      drawHud();
      if (g.lives <= 0) { setTimeout(() => finish(false), 550); return; }
      setTimeout(nextRound, 700);
    }
  }

  function tick() {
    if (!g || g.locked) return;
    g.timeLeft -= 0.25;
    drawHud();
    if (g.timeLeft <= 0) {
      g.locked = true;
      g.lives--;
      drawHud();
      document.querySelectorAll('.mochila-tile').forEach(b => b.classList.add('disabled'));
      if (g.lives <= 0) { setTimeout(() => finish(false), 400); }
      else { setTimeout(nextRound, 500); }
    }
  }

  function stopLoop() {
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
  }

  function finish(won) {
    stopLoop();
    const area = document.getElementById('question-area');
    if (won) {
      area.innerHTML = `
        <div class="mochila-end">
          <div class="mochila-end-emoji">🎒🏆</div>
          <div class="mochila-end-title">¡Mochila lista!</div>
          <div class="mochila-end-sub">Puntuación: ${g.score} / ${TOTAL_ROUNDS} · +20⚡ XP</div>
        </div>`;
    } else {
      area.innerHTML = `
        <div class="mochila-end">
          <div class="mochila-end-emoji">😵‍💫</div>
          <div class="mochila-end-title">¡Se cayó todo!</div>
          <div class="mochila-end-sub">Puntuación: ${g.score} / ${TOTAL_ROUNDS}. ¡Inténtalo otra vez!</div>
        </div>`;
    }
    const checkBtn = document.getElementById('check-btn');
    checkBtn.hidden = false;
    checkBtn.disabled = false;
    checkBtn.textContent = "Back to Map";
    checkBtn.onclick = () => endGame(won);
  }

  function endGame(won) {
    stopLoop();
    const finalScore = g ? g.score : 0;
    g = null;
    document.getElementById('lesson-overlay').style.display = 'none';
    const checkBtn = document.getElementById('check-btn');
    checkBtn.onclick = submitAnswer;
    checkBtn.textContent = "Check";

    if (won && finalScore >= 7) {
      state.xp += 20;
    }
    // Re-lock: a practice crown on a study bubble unlocks it again.
    state.game_unlocked_1_6 = false;
    saveProgress();
  }

  function quit() {
    stopLoop();
    g = null;
    state.game_unlocked_1_6 = false;
    saveProgress();
    document.getElementById('lesson-overlay').style.display = 'none';
    const checkBtn = document.getElementById('check-btn');
    checkBtn.onclick = submitAnswer;
    checkBtn.textContent = "Check";
  }

  return {
    start: start,
    quit: quit,
    isActive: function() { return g !== null; }
  };
})();
