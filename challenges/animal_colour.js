/* 🎨 Animal Colour Challenge Module */

let aQuiz = null;

const ANIMAL_DATA = [
  { phrase: 'el caballo',    en: 'horse',       emoji: '🐴', gender: 'm' },
  { phrase: 'el conejo',     en: 'rabbit',      emoji: '🐰', gender: 'm' },
  { phrase: 'el gato',       en: 'cat',         emoji: '🐱', gender: 'm', alt: 'la gata' },
  { phrase: 'el perro',      en: 'dog',         emoji: '🐶', gender: 'm', alt: 'la perra' },
  { phrase: 'el pez',        en: 'fish',        emoji: '🐟', gender: 'm' },
  { phrase: 'el pájaro',     en: 'bird',        emoji: '🐦', gender: 'm' },
  { phrase: 'el ratón',      en: 'mouse',       emoji: '🐭', gender: 'm' },
  { phrase: 'la cobaya',     en: 'guinea pig',  emoji: '🐹', gender: 'f' },
  { phrase: 'la serpiente',  en: 'snake',       emoji: '🐍', gender: 'f' },
];

const COLOR_DATA = [
  { base: 'amarillo', en: 'yellow', hex: '#EFB700', gendered: true  },
  { base: 'azul',     en: 'blue',   hex: '#1E88E5', gendered: false },
  { base: 'blanco',   en: 'white',  hex: '#F5F5F5', gendered: true  },
  { base: 'gris',     en: 'grey',   hex: '#9E9E9E', gendered: false },
  { base: 'marrón',   en: 'brown',  hex: '#6D4C41', gendered: false },
  { base: 'morado',   en: 'purple', hex: '#8E24AA', gendered: true  },
  { base: 'naranja',  en: 'orange', hex: '#FB8C00', gendered: false },
  { base: 'negro',    en: 'black',  hex: '#1A1A2E', gendered: true  },
  { base: 'rojo',     en: 'red',    hex: '#E53935', gendered: true  },
  { base: 'rosa',     en: 'pink',   hex: '#E91E63', gendered: false },
  { base: 'verde',    en: 'green',  hex: '#2E7D32', gendered: false },
];

function colorForm(color, gender) {
  if (!color.gendered) return color.base;
  return gender === 'f' ? color.base.slice(0, -1) + 'a' : color.base;
}

function animalPhrase(animal, color) {
  return `${animal.phrase} ${colorForm(color, animal.gender)}`;
}

function animalAltPhrase(animal, color) {
  if (!animal.alt) return null;
  return `${animal.alt} ${colorForm(color, 'f')}`;
}

function animalPhraseEn(animal, color) {
  return `the ${color.en} ${animal.en}`;
}

function generateMCOptions(animal, color) {
  const correct     = animalPhrase(animal, color);
  const distAnimal  = shuffle(ANIMAL_DATA.filter(a => a.phrase !== animal.phrase))[0];
  const distColor   = shuffle(COLOR_DATA.filter(c => c.base !== color.base))[0];
  return shuffle([
    correct,
    animalPhrase(distAnimal, color),    // wrong animal, right colour
    animalPhrase(animal, distColor),    // right animal, wrong colour
    animalPhrase(distAnimal, distColor),// wrong animal, wrong colour
  ]);
}

function generateAnimalQuestions(mode) {
  const animals = shuffle([...ANIMAL_DATA]);
  const colors  = shuffle([...COLOR_DATA]);
  return Array.from({ length: 10 }, (_, i) => {
    const animal  = animals[i % animals.length];
    const color   = colors[i % colors.length];
    return {
      animal, color,
      correct: animalPhrase(animal, color),
      options: mode === 'mc' ? generateMCOptions(animal, color) : null,
    };
  });
}

function drawAnimalCanvas(emoji, hexColor) {
  const canvas = document.getElementById('animal-canvas');
  const size   = canvas.width; // 400 px (CSS scales to 200)
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.font          = `${Math.floor(size * 0.72)}px serif`;
  ctx.textAlign     = 'center';
  ctx.textBaseline  = 'middle';
  ctx.fillText(emoji, size / 2, size / 2 + size * 0.03);
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = 'source-over';
}

function startAnimalColour(mode) {
  aQuiz = { mode, questions: generateAnimalQuestions(mode), index: 0, results: [], total: 10 };
  showScreen('animal-screen');
  renderAnimalQuestion();
}

function renderAnimalQuestion() {
  const q   = aQuiz.questions[aQuiz.index];
  const res = aQuiz.results[aQuiz.index];

  document.getElementById('animal-progress').textContent      = `${aQuiz.index + 1} / ${aQuiz.total}`;
  document.getElementById('animal-progress-fill').style.width = `${((aQuiz.index + 1) / aQuiz.total) * 100}%`;
  drawAnimalCanvas(q.animal.emoji, q.color.hex);

  const fb       = document.getElementById('animal-feedback');
  const ca       = document.getElementById('animal-correct-answer');
  const mcOpts   = document.getElementById('animal-mc-options');
  const typeIn   = document.getElementById('animal-type-input');
  const navRow   = document.getElementById('animal-nav-row');
  const skipBtn  = document.getElementById('animal-back-skip-btn');
  const checkBtn = document.getElementById('animal-check-next-btn');

  fb.textContent = ''; fb.className = 'feedback'; ca.innerHTML = '';

  if (aQuiz.mode === 'mc') {
    typeIn.hidden = true;
    mcOpts.innerHTML = '';
    for (const opt of q.options) {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      if (res) {
        btn.disabled = true;
        if (opt === q.correct)               btn.classList.add('correct');
        if (opt === res.chosen && !res.ok)   btn.classList.add('incorrect');
      } else {
        btn.onclick = () => animalMCPick(opt, q);
      }
      mcOpts.appendChild(btn);
    }
    if (res) {
      navRow.hidden = false;
      skipBtn.textContent  = '← Back'; skipBtn.disabled = aQuiz.index === 0;
      checkBtn.textContent = aQuiz.index >= aQuiz.total - 1 ? 'Finish ✓' : 'Next →';
      if (res.ok) {
        fb.textContent = '¡Correcto! ✓'; fb.className = 'feedback correct';
      } else {
        fb.textContent = 'Incorrect ✗'; fb.className = 'feedback incorrect';
        ca.innerHTML = `<strong>${q.correct}</strong> <em style="color:#888">(${animalPhraseEn(q.animal, q.color)})</em>`;
      }
    } else {
      navRow.hidden = true;
    }
  } else {
    mcOpts.innerHTML = '';
    typeIn.hidden = false;
    navRow.hidden = false;
    if (res) {
      typeIn.value = res.chosen; typeIn.disabled = true;
      typeIn.className = 'type-input ' + res.result;
      skipBtn.textContent  = '← Back'; skipBtn.disabled = aQuiz.index === 0;
      checkBtn.textContent = aQuiz.index >= aQuiz.total - 1 ? 'Finish ✓' : 'Next →';
      if (res.ok) {
        fb.textContent = '¡Correcto! ✓'; fb.className = 'feedback correct';
      } else if (res.result === 'nearly') {
        fb.textContent = 'Nearly! ½ point'; fb.className = 'feedback nearly';
        ca.innerHTML = `<strong>${q.correct}</strong> <em style="color:#888">(${animalPhraseEn(q.animal, q.color)})</em>`;
      } else {
        fb.textContent = res.chosen === '—' ? 'Skipped' : 'Incorrect ✗';
        fb.className = 'feedback incorrect';
        ca.innerHTML = `<strong>${q.correct}</strong> <em style="color:#888">(${animalPhraseEn(q.animal, q.color)})</em>`;
      }
    } else {
      typeIn.value = ''; typeIn.disabled = false; typeIn.className = 'type-input';
      skipBtn.textContent = 'Skip'; skipBtn.disabled = false;
      checkBtn.textContent = 'Check →';
      typeIn.focus();
    }
  }
}

function animalMCPick(chosen, q) {
  const ok = chosen === q.correct;
  aQuiz.results[aQuiz.index] = { ok, score: ok ? 1 : 0, chosen, result: ok ? 'correct' : 'incorrect' };
  renderAnimalQuestion();
}

function animalCheckNext() {
  const res = aQuiz.results[aQuiz.index];
  if (!res) {
    const typed = document.getElementById('animal-type-input').value.trim();
    if (!typed) return;
    const q       = aQuiz.questions[aQuiz.index];
    const r1      = grade(typed, q.correct, false);
    const altP    = animalAltPhrase(q.animal, q.color);
    const r2      = altP ? grade(typed, altP, false) : 'incorrect';
    const gradeRank = { correct: 2, nearly: 1, incorrect: 0 };
    const result  = gradeRank[r1] >= gradeRank[r2] ? r1 : r2;
    aQuiz.results[aQuiz.index] = {
      ok: result === 'correct', score: result === 'correct' ? 1 : result === 'nearly' ? 0.5 : 0,
      chosen: typed, result,
    };
    renderAnimalQuestion();
  } else {
    aQuiz.index++;
    if (aQuiz.index >= aQuiz.total) renderAnimalScore();
    else {
      rollStudent();
      renderAnimalQuestion();
    }
  }
}

function animalBackSkip() {
  const res = aQuiz.results[aQuiz.index];
  if (!res) {
    aQuiz.results[aQuiz.index] = { ok: false, score: 0, chosen: '—', result: 'incorrect' };
    rollStudent();
    renderAnimalQuestion();
  } else if (aQuiz.index > 0) {
    aQuiz.index--;
    rollStudent();
    renderAnimalQuestion();
  }
}

function renderAnimalScore() {
  const total = aQuiz.total;
  const score = aQuiz.results.reduce((acc, r) => acc + (r ? r.score : 0), 0);
  const wrong = aQuiz.results.filter(r => r && !r.ok);

  const sd = Number.isInteger(score) ? score : score.toFixed(1);
  document.getElementById('score-number').textContent = `${sd}/${total}`;
  document.getElementById('score-label').textContent  =
    score === total      ? '¡Perfecto! 🎉' :
    score >= total * 0.8 ? '¡Muy bien! Nearly there.' :
    score >= total * 0.5 ? 'Good effort — keep practising!' :
                           'Don\'t worry, practice makes perfect!';

  const list = document.getElementById('wrong-list');
  list.innerHTML = '';
  document.getElementById('review-heading').hidden = wrong.length === 0;
  for (const r of wrong) {
    const q = aQuiz.questions[aQuiz.results.indexOf(r)];
    const div = document.createElement('div');
    div.className = 'wrong-item';
    div.innerHTML = `
      <span class="es">${q.correct}</span>
      <span class="en"> — ${animalPhraseEn(q.animal, q.color)}</span>
      <span class="yours">You answered: ${r.chosen}</span>`;
    list.appendChild(div);
  }
  document.getElementById('redo-btn').hidden            = true;
  document.getElementById('next-phase-btn').hidden      = true;
  document.getElementById('back-home-btn').hidden       = false;
  document.getElementById('score-omakase-section').hidden = true;
  showScreen('score-screen');
}
