/* ⚙️ Verb Conjugation Challenge Module */

let vQuiz = null;

function toggleAllVerbs(select) {
  document.querySelectorAll('input[name="verb-select"]').forEach(cb => {
    cb.checked = select;
  });
}

const VERB_DATA = {
  ser: {
    infinitive: "ser",
    meaning: "to be (essential/origin)",
    conjugations: {
      "yo": "soy",
      "tú": "eres",
      "él/ella": "es",
      "usted": "es",
      "nosotros": "somos",
      "vosotros": "sois",
      "ellos": "son",
      "ustedes": "son"
    },
    sentences: {
      "yo": [
        { spanish: "yo soy de España", english: "I am from Spain" },
        { spanish: "yo soy de Argentina", english: "I am from Argentina" },
        { spanish: "yo soy de Cuba", english: "I am from Cuba" }
      ],
      "tú": [
        { spanish: "tú eres inteligente", english: "you are intelligent" },
        { spanish: "tú eres de Colombia", english: "you are from Colombia" }
      ],
      "él/ella": [
        { spanish: "él es alto y delgado", english: "he is tall and thin" },
        { spanish: "ella es baja y gorda", english: "she is short and fat" }
      ],
      "usted": [
        { spanish: "usted es de España", english: "you (singular, formal) are from Spain" },
        { spanish: "usted es inteligente", english: "you (singular, formal) are intelligent" }
      ],
      "nosotros": [
        { spanish: "nosotros somos hispanohablantes", english: "we are Spanish-speaking" }
      ],
      "vosotros": [
        { spanish: "vosotros sois de los Estados Unidos", english: "you are from the United States" }
      ],
      "ellos": [
        { spanish: "ellos son famosos", english: "they are famous" }
      ],
      "ustedes": [
        { spanish: "ustedes son de los Estados Unidos", english: "you (plural, formal) are from the United States" },
        { spanish: "ustedes son hispanohablantes", english: "you (plural, formal) are Spanish-speaking" }
      ]
    }
  },
  estar: {
    infinitive: "estar",
    meaning: "to be (feeling/location)",
    conjugations: {
      "yo": "estoy",
      "tú": "estás",
      "él/ella": "está",
      "usted": "está",
      "nosotros": "estamos",
      "vosotros": "estáis",
      "ellos": "están",
      "ustedes": "están"
    },
    sentences: {
      "yo": [
        { spanish: "yo estoy bien", english: "I am well" },
        { spanish: "yo estoy fatal", english: "I am awful" }
      ],
      "tú": [
        { spanish: "tú estás regular", english: "you are so-so" },
        { spanish: "tú estás fenomenal", english: "you are great" }
      ],
      "él/ella": [
        { spanish: "él está bien", english: "he is well" },
        { spanish: "ella está regular", english: "she is so-so" }
      ],
      "usted": [
        { spanish: "usted está bien", english: "you (singular, formal) are well" },
        { spanish: "usted está regular", english: "you (singular, formal) are so-so" }
      ],
      "nosotros": [
        { spanish: "nosotros estamos bien", english: "we are well" }
      ],
      "vosotros": [
        { spanish: "vosotros estáis fatal", english: "you are awful" }
      ],
      "ellos": [
        { spanish: "ellos están fenomenal", english: "they are great" }
      ],
      "ustedes": [
        { spanish: "ustedes están bien", english: "you (plural, formal) are well" },
        { spanish: "ustedes están fenomenal", english: "you (plural, formal) are great" }
      ]
    }
  },
  tener: {
    infinitive: "tener",
    meaning: "to have",
    conjugations: {
      "yo": "tengo",
      "tú": "tienes",
      "él/ella": "tiene",
      "usted": "tiene",
      "nosotros": "tenemos",
      "vosotros": "tenéis",
      "ellos": "tienen",
      "ustedes": "tienen"
    },
    sentences: {
      "yo": [
        { spanish: "yo tengo catorce años", english: "I am 14 years old" },
        { spanish: "yo tengo quince años", english: "I am 15 years old" },
        { spanish: "yo tengo una mascota", english: "I have a pet" }
      ],
      "tú": [
        { spanish: "tú tienes los ojos verdes", english: "you have green eyes" },
        { spanish: "tú tienes un conejo", english: "you have a rabbit" }
      ],
      "él/ella": [
        { spanish: "él tiene el pelo rubio y corto", english: "he has short, blond hair" },
        { spanish: "ella tiene los ojos marrones", english: "she has brown eyes" }
      ],
      "usted": [
        { spanish: "usted tiene los ojos verdes", english: "you (singular, formal) have green eyes" },
        { spanish: "usted tiene un perro", english: "you (singular, formal) have a dog" }
      ],
      "nosotros": [
        { spanish: "nosotros tenemos un gato y un perro", english: "we have a cat and a dog" }
      ],
      "vosotros": [
        { spanish: "vosotros tenéis una cobaya", english: "you have a guinea pig" }
      ],
      "ellos": [
        { spanish: "ellos tienen una serpiente", english: "they have a snake" }
      ],
      "ustedes": [
        { spanish: "ustedes tienen catorce años", english: "you (plural, formal) are 14 years old" },
        { spanish: "ustedes tienen un perro y un gato", english: "you (plural, formal) have a dog and a cat" }
      ]
    }
  },
  llamarse: {
    infinitive: "llamarse",
    meaning: "to be called",
    conjugations: {
      "yo": "me llamo",
      "tú": "te llamas",
      "él/ella": "se llama",
      "usted": "se llama",
      "nosotros": "nos llamamos",
      "vosotros": "os llamáis",
      "ellos": "se llaman",
      "ustedes": "se llaman"
    },
    sentences: {
      "yo": [
        { spanish: "yo me llamo Juan", english: "I am called Juan" },
        { spanish: "yo me llamo María", english: "I am called María" }
      ],
      "tú": [
        { spanish: "tú te llamas Carlos", english: "you are called Carlos" }
      ],
      "él/ella": [
        { spanish: "él se llama Pedro", english: "he is called Pedro" },
        { spanish: "ella se llama Ana", english: "she is called Ana" }
      ],
      "usted": [
        { spanish: "usted se llama Carlos", english: "you (singular, formal) are called Carlos" },
        { spanish: "usted se llama Ana", english: "you (singular, formal) are called Ana" }
      ],
      "nosotros": [
        { spanish: "nosotros nos llamamos Gómez", english: "we are called Gómez" }
      ],
      "vosotros": [
        { spanish: "vosotros os llamáis Torres", english: "you are called Torres" }
      ],
      "ellos": [
        { spanish: "ellos se llaman Sánchez", english: "they are called Sánchez" }
      ],
      "ustedes": [
        { spanish: "ustedes se llaman Gómez", english: "you (plural, formal) are called Gómez" },
        { spanish: "ustedes se llaman Sánchez", english: "you (plural, formal) are called Sánchez" }
      ]
    }
  }
};

const PRONOUN_MEANINGS = {
  "yo": "I",
  "tú": "you (singular, informal)",
  "él/ella": "he/she",
  "usted": "you (singular, formal)",
  "nosotros": "we",
  "vosotros": "you (plural, informal)",
  "ellos": "they",
  "ustedes": "you (plural, formal)"
};

const ENGLISH_CONJUGATIONS = {
  ser: {
    "yo": "I am (essential)",
    "tú": "you are (essential)",
    "él/ella": "he/she is (essential)",
    "usted": "you (singular, formal) are (essential)",
    "nosotros": "we are (essential)",
    "vosotros": "you (plural) are (essential)",
    "ellos": "they are (essential)",
    "ustedes": "you (plural, formal) are (essential)"
  },
  estar: {
    "yo": "I am (feeling/location)",
    "tú": "you are (feeling/location)",
    "él/ella": "he/she is (feeling/location)",
    "usted": "you (singular, formal) are (feeling/location)",
    "nosotros": "we are (feeling/location)",
    "vosotros": "you (plural) are (feeling/location)",
    "ellos": "they are (feeling/location)",
    "ustedes": "you (plural, formal) are (feeling/location)"
  },
  tener: {
    "yo": "I have",
    "tú": "you have",
    "él/ella": "he/she has",
    "usted": "you (singular, formal) have",
    "nosotros": "we have",
    "vosotros": "you (plural) have",
    "ellos": "they have",
    "ustedes": "you (plural, formal) have"
  },
  llamarse: {
    "yo": "I am called",
    "tú": "you are called",
    "él/ella": "he/she is called",
    "usted": "you (singular, formal) are called",
    "nosotros": "we are called",
    "vosotros": "you (plural) are called",
    "ellos": "they are called",
    "ustedes": "you (plural, formal) are called"
  }
};

function openVerbSetup() {
  showScreen('verb-screen');
  showVerbSetup();
}

function showVerbSetup() {
  document.getElementById('verb-setup-view').hidden = false;
  document.getElementById('verb-play-view').hidden = true;
  document.getElementById('verb-review-view').hidden = true;
  vQuiz = null;
}

function startVerbPractice() {
  const checkedBoxes = document.querySelectorAll('input[name="verb-select"]:checked');
  const selected = Array.from(checkedBoxes).map(cb => cb.value);
  if (selected.length === 0) {
    alert("Please select at least one verb to practice.");
    return;
  }

  const mode = document.querySelector('input[name="verb-mode"]:checked').value;
  const direction = document.getElementById('verb-dir').value;
  const style = document.querySelector('input[name="verb-style"]:checked').value;
  const includeFormal = document.getElementById('verb-formal').checked;

  vQuiz = {
    selectedVerbs: selected,
    mode: mode,
    direction: direction,
    style: style,
    includeFormal: includeFormal,
    questions: [],
    currentIndex: 0,
    score: 0
  };

  const pronouns = includeFormal
    ? ["yo", "tú", "él/ella", "usted", "nosotros", "vosotros", "ellos", "ustedes"]
    : ["yo", "tú", "él/ella", "nosotros", "vosotros", "ellos"];

  for (let i = 0; i < 10; i++) {
    const verbKey = selected[Math.floor(Math.random() * selected.length)];
    const pronoun = pronouns[Math.floor(Math.random() * pronouns.length)];
    const verbObj = VERB_DATA[verbKey];
    
    let questionDir = direction;
    if (direction === 'mixed') {
      questionDir = Math.random() < 0.5 ? 'es-en' : 'en-es';
    }

    let spanishText = '';
    let englishText = '';

    if (mode === 'pure') {
      spanishText = pronoun + " " + verbObj.conjugations[pronoun];
      englishText = ENGLISH_CONJUGATIONS[verbKey][pronoun];
    } else {
      const sentenceList = verbObj.sentences[pronoun];
      const randomSentence = sentenceList[Math.floor(Math.random() * sentenceList.length)];
      spanishText = randomSentence.spanish;
      englishText = randomSentence.english;
    }

    vQuiz.questions.push({
      verb: verbKey,
      pronoun: pronoun,
      dir: questionDir,
      spanish: spanishText,
      english: englishText,
      questionText: questionDir === 'es-en' ? spanishText : englishText,
      correctAnswer: questionDir === 'es-en' ? englishText : spanishText
    });
  }

  document.getElementById('verb-setup-view').hidden = true;
  document.getElementById('verb-play-view').hidden = false;
  
  if (teacherMode) {
    rollStudent();
    showAllStudentPills();
  }

  loadVerbQuestion();
}

function loadVerbQuestion() {
  const q = vQuiz.questions[vQuiz.currentIndex];
  
  document.getElementById('verb-counter').textContent = `${vQuiz.currentIndex + 1} / 10`;
  document.getElementById('verb-question-hint').textContent = 
    q.dir === 'es-en' ? "Translate to English:" : "Translate to Spanish:";
  document.getElementById('verb-question-text').textContent = q.questionText;

  document.getElementById('verb-feedback').innerHTML = '';
  document.getElementById('verb-feedback').className = 'correct-answer';
  document.getElementById('verb-next-container').hidden = true;

  if (vQuiz.style === 'mc') {
    document.getElementById('verb-mc-container').hidden = false;
    document.getElementById('verb-type-container').hidden = true;
    generateVerbMCOptions(q);
  } else {
    document.getElementById('verb-mc-container').hidden = true;
    document.getElementById('verb-type-container').hidden = false;
    const input = document.getElementById('verb-type-input');
    input.value = '';
    input.disabled = false;
    input.className = 'type-input';
    document.getElementById('verb-type-btn').hidden = false;
    
    setTimeout(() => input.focus(), 100);
  }
}

function getVerbSwapDistractor(q) {
  const targetConj = VERB_DATA[q.verb].conjugations[q.pronoun];
  let swapVerb = null;
  if (q.verb === 'ser') swapVerb = 'estar';
  else if (q.verb === 'estar') swapVerb = 'ser';
  else if (q.verb === 'tener') swapVerb = 'ser';
  else if (q.verb === 'llamarse') swapVerb = 'ser';

  if (swapVerb) {
    const swapConj = VERB_DATA[swapVerb].conjugations[q.pronoun];
    if (q.dir === 'en-es') {
      return q.spanish.replace(targetConj, swapConj);
    } else {
      let engTarget = q.english;
      if (q.verb === 'ser') {
        return engTarget.replace("am", "am (feeling)").replace("are", "are (feeling)").replace("is", "is (feeling)");
      } else if (q.verb === 'estar') {
        return engTarget.replace("am", "am (essential)").replace("are", "are (essential)").replace("is", "is (essential)");
      } else if (q.verb === 'tener') {
        return engTarget.replace("am", "have").replace("are", "have").replace("is", "has");
      } else if (q.verb === 'llamarse') {
        return engTarget.replace("am called", "am").replace("are called", "are").replace("is called", "is");
      }
    }
  }
  return null;
}

function getSubjectSwapDistractor(q, otherPronoun) {
  const targetConj = VERB_DATA[q.verb].conjugations[q.pronoun];
  const otherConj = VERB_DATA[q.verb].conjugations[otherPronoun];
  
  if (q.dir === 'en-es') {
    let dist = q.spanish;
    const words = dist.split(' ');
    if (words.length > 1) {
      let currentPronounWord = q.pronoun;
      if (q.pronoun === 'él/ella') {
        currentPronounWord = words[0] === 'ella' ? 'ella' : 'él';
      }
      
      let nextPronounWord = otherPronoun;
      if (otherPronoun === 'él/ella') {
        nextPronounWord = Math.random() < 0.5 ? 'él' : 'ella';
      }

      if (words[0] === currentPronounWord) {
        words[0] = nextPronounWord;
      }
      
      let subSentence = words.join(' ');
      const escapedConj = targetConj.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp('\\b' + escapedConj + '\\b', 'g');
      subSentence = subSentence.replace(regex, otherConj);
      
      return subSentence;
    }
  } else {
    let currentEng = PRONOUN_MEANINGS[q.pronoun];
    if (q.pronoun === 'yo') currentEng = "I";
    else if (q.pronoun === 'tú') currentEng = "you";
    else if (q.pronoun === 'él/ella') currentEng = "he/she";
    else if (q.pronoun === 'nosotros') currentEng = "we";
    else if (q.pronoun === 'vosotros') currentEng = "you (plural)";
    else if (q.pronoun === 'ellos') currentEng = "they";
    else if (q.pronoun === 'usted') currentEng = "you (singular, formal)";
    else if (q.pronoun === 'ustedes') currentEng = "you (plural, formal)";

    let nextEng = PRONOUN_MEANINGS[otherPronoun];
    if (otherPronoun === 'yo') nextEng = "I";
    else if (otherPronoun === 'tú') nextEng = "you";
    else if (otherPronoun === 'él/ella') nextEng = "he/she";
    else if (otherPronoun === 'nosotros') nextEng = "we";
    else if (otherPronoun === 'vosotros') nextEng = "you (plural)";
    else if (otherPronoun === 'ellos') nextEng = "they";
    else if (otherPronoun === 'usted') nextEng = "you (singular, formal)";
    else if (otherPronoun === 'ustedes') nextEng = "you (plural, formal)";

    let engTarget = q.english;
    if (engTarget.startsWith(currentEng)) {
      let rest = engTarget.slice(currentEng.length);
      if (q.verb === 'ser' || q.verb === 'estar') {
        if (rest.startsWith(" am")) rest = rest.replace(" am", " are");
        else if (rest.startsWith(" is")) rest = rest.replace(" is", " are");
        else if (rest.startsWith(" are")) {
          if (otherPronoun === 'yo') rest = rest.replace(" are", " am");
          else if (otherPronoun === 'él/ella') rest = rest.replace(" are", " is");
        }
      } else if (q.verb === 'tener') {
        if (rest.startsWith(" have")) {
          if (otherPronoun === 'él/ella') rest = rest.replace(" have", " has");
        } else if (rest.startsWith(" has")) {
          rest = rest.replace(" has", " have");
        }
      } else if (q.verb === 'llamarse') {
        if (rest.startsWith(" am called")) rest = rest.replace(" am called", " are called");
        else if (rest.startsWith(" is called")) rest = rest.replace(" is called", " are called");
        else if (rest.startsWith(" are called")) {
          if (otherPronoun === 'yo') rest = rest.replace(" are called", " am called");
          else if (otherPronoun === 'él/ella') rest = rest.replace(" are called", " is called");
        }
      }
      return nextEng + rest;
    }
  }
  return null;
}

function generateVerbMCOptions(q) {
  const container = document.getElementById('verb-mc-container');
  container.innerHTML = '';

  const distractors = [];
  const targetConjs = VERB_DATA[q.verb].conjugations;
  const pronounPool = vQuiz.includeFormal
    ? ["yo", "tú", "él/ella", "usted", "nosotros", "vosotros", "ellos", "ustedes"]
    : ["yo", "tú", "él/ella", "nosotros", "vosotros", "ellos"];

  if (vQuiz.mode === 'pure') {
    if (q.dir === 'es-en') {
      pronounPool.forEach(p => {
        if (p !== q.pronoun) {
          distractors.push(ENGLISH_CONJUGATIONS[q.verb][p]);
        }
      });
    } else {
      pronounPool.forEach(p => {
        if (p !== q.pronoun) {
          distractors.push(p + " " + targetConjs[p]);
        }
      });
    }
  } else {
    const verbSwap = getVerbSwapDistractor(q);
    const otherPronouns = pronounPool.filter(p => p !== q.pronoun);
    const shuffledOthers = shuffle(otherPronouns);
    const subSwap1 = getSubjectSwapDistractor(q, shuffledOthers[0]);
    const subSwap2 = getSubjectSwapDistractor(q, shuffledOthers[1]);

    const list = [verbSwap, subSwap1, subSwap2].filter(item => item && item !== q.correctAnswer);
    const uniqueList = Array.from(new Set(list));
    
    if (uniqueList.length < 3) {
      const allSentences = [];
      Object.keys(VERB_DATA).forEach(vk => {
        const verbObj = VERB_DATA[vk];
        pronounPool.forEach(p => {
          if (verbObj.sentences[p]) {
            verbObj.sentences[p].forEach(sent => {
              allSentences.push(sent);
            });
          }
        });
      });

      const optionsPool = allSentences
        .map(sent => q.dir === 'es-en' ? sent.english : sent.spanish)
        .filter(text => text !== q.correctAnswer && !uniqueList.includes(text));

      const fallbackChoices = shuffle(Array.from(new Set(optionsPool)));
      while (uniqueList.length < 3 && fallbackChoices.length > 0) {
        uniqueList.push(fallbackChoices.pop());
      }
    }

    shuffle(uniqueList).slice(0, 3).forEach(d => distractors.push(d));
  }

  const options = shuffle([q.correctAnswer, ...distractors.slice(0, 3)]);
  
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => submitVerbMC(btn, opt, q.correctAnswer);
    container.appendChild(btn);
  });
}

function submitVerbMC(clickedBtn, selectedAnswer, correctAnswer) {
  const buttons = document.querySelectorAll('#verb-mc-container .option-btn');
  buttons.forEach(btn => btn.disabled = true);

  const feedback = document.getElementById('verb-feedback');
  
  if (selectedAnswer === correctAnswer) {
    clickedBtn.classList.add('correct');
    feedback.innerHTML = `🎉 Correct! <strong>${correctAnswer}</strong>`;
    vQuiz.score++;
  } else {
    clickedBtn.classList.add('incorrect');
    buttons.forEach(btn => {
      if (btn.textContent === correctAnswer) btn.classList.add('correct');
    });
    feedback.innerHTML = `❌ Incorrect. Correct answer: <strong>${correctAnswer}</strong>`;
  }

  document.getElementById('verb-next-container').hidden = false;
}

function submitVerbType() {
  const input = document.getElementById('verb-type-input');
  const userVal = input.value.trim();
  if (!userVal) return;

  input.disabled = true;
  document.getElementById('verb-type-btn').hidden = true;

  const q = vQuiz.questions[vQuiz.currentIndex];
  const feedback = document.getElementById('verb-feedback');
  
  const result = grade(userVal, q.correctAnswer);

  if (result === 'correct') {
    input.className = 'type-input correct';
    feedback.innerHTML = `🎉 Correct!`;
    vQuiz.score += 1.0;
  } else if (result === 'nearly') {
    input.className = 'type-input nearly';
    feedback.innerHTML = `⚠️ Nearly! Smart Match: <strong>${q.correctAnswer}</strong><br><small style="color:var(--text-secondary)">Your answer: "${userVal}"</small>`;
    vQuiz.score += 0.5;
  } else {
    input.className = 'type-input incorrect';
    feedback.innerHTML = `❌ Incorrect. Correct answer: <strong>${q.correctAnswer}</strong>`;
  }

  document.getElementById('verb-next-container').hidden = false;
}

function nextVerbQuestion() {
  vQuiz.currentIndex++;
  if (vQuiz.currentIndex < 10) {
    loadVerbQuestion();
  } else {
    showVerbResults();
  }
}

function showVerbResults() {
  showScreen('score-screen');
  
  const sd = Number(vQuiz.score.toFixed(1));
  document.getElementById('score-number').textContent = `${sd}/10`;
  
  let msg = "";
  if (sd === 10) msg = "🎉 ¡Perfecto! Absolute mastery of conjugations!";
  else if (sd >= 8) msg = "👍 ¡Excelente trabajo! Superb verb mastery!";
  else if (sd >= 5) msg = "😊 Buen intento! Practice more to perfect those endings.";
  else msg = "💪 Keep learning! Try again to build your confidence.";
  
  document.getElementById('score-label').textContent = msg;
  
  document.getElementById('score-omakase-section').hidden = true;
  document.getElementById('review-heading').hidden = true;
  document.getElementById('wrong-list').innerHTML = '';
  document.getElementById('redo-btn').hidden = true;
  document.getElementById('next-phase-btn').hidden = true;
  document.getElementById('back-home-btn').hidden = false;
}

/* ── Verb Review Logic ── */
let activeReviewVerb = 'ser';

function openVerbReview() {
  showScreen('verb-screen');
  document.getElementById('verb-setup-view').hidden = true;
  document.getElementById('verb-play-view').hidden = true;
  document.getElementById('verb-review-view').hidden = false;
  vQuiz = null;
  
  renderVerbReviewTabs();
  renderVerbReviewChart('ser');
}

function renderVerbReviewTabs() {
  const container = document.getElementById('verb-tabs');
  container.innerHTML = '';
  
  const verbs = ['ser', 'estar', 'tener', 'llamarse'];
  verbs.forEach(v => {
    const btn = document.createElement('button');
    btn.className = 'btn verb-tab-btn';
    btn.setAttribute('data-verb', v);
    btn.style.flex = '1';
    btn.style.padding = '8px 12px';
    btn.style.borderRadius = '10px';
    btn.style.border = '1px solid var(--border-color)';
    btn.style.fontFamily = 'inherit';
    btn.style.fontWeight = '700';
    btn.style.fontSize = '0.9rem';
    btn.style.cursor = 'pointer';
    btn.style.whiteSpace = 'nowrap';
    btn.style.transition = 'all 0.2s';
    btn.textContent = v;
    btn.onclick = () => renderVerbReviewChart(v);
    
    container.appendChild(btn);
  });
}

function renderVerbReviewChart(verbKey) {
  activeReviewVerb = verbKey;
  const verbObj = VERB_DATA[verbKey];
  
  document.getElementById('verb-review-title').textContent = `${verbObj.infinitive} (${verbObj.meaning})`;
  
  const tabs = document.querySelectorAll('.verb-tab-btn');
  tabs.forEach(tab => {
    const active = tab.getAttribute('data-verb') === verbKey;
    tab.style.background = active ? 'var(--brand-green)' : 'var(--bg-color)';
    tab.style.color = active ? 'white' : 'var(--text-primary)';
    tab.style.borderColor = active ? 'var(--brand-green)' : 'var(--border-color)';
  });

  const rowsContainer = document.getElementById('verb-chart-rows');
  rowsContainer.innerHTML = '';

  const pronouns = ["yo", "tú", "él/ella", "usted", "nosotros", "vosotros", "ellos", "ustedes"];
  
  pronouns.forEach(p => {
    const conj = verbObj.conjugations[p];
    const translation = ENGLISH_CONJUGATIONS[verbKey][p];
    
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.padding = '8px 12px';
    row.style.borderRadius = '10px';
    row.style.borderBottom = '1px solid var(--border-color)';
    row.style.gap = '12px';

    const pCol = document.createElement('span');
    pCol.style.flex = '1';
    pCol.style.fontWeight = '700';
    pCol.style.color = 'var(--text-secondary)';
    pCol.textContent = p;

    const cCol = document.createElement('span');
    cCol.style.flex = '1.2';
    cCol.style.fontWeight = '800';
    cCol.style.color = 'var(--brand-green)';
    cCol.textContent = conj;

    const tCol = document.createElement('span');
    tCol.style.flex = '2';
    tCol.style.fontSize = '0.9rem';
    tCol.style.color = 'var(--text-secondary)';
    tCol.textContent = translation;

    const sBtn = document.createElement('button');
    sBtn.className = 'btn btn-ghost';
    sBtn.style.padding = '4px 8px';
    sBtn.style.borderRadius = '6px';
    sBtn.style.fontSize = '1.1rem';
    sBtn.innerHTML = '🔊';
    sBtn.onclick = () => speakVerbRandomAccent(`${p} ${conj}`);

    row.appendChild(pCol);
    row.appendChild(cCol);
    row.appendChild(tCol);
    row.appendChild(sBtn);
    
    rowsContainer.appendChild(row);
  });

  // Render Grammar Note & Example Sentences
  const noteEl = document.getElementById('verb-review-grammar-note');
  if (verbKey === 'tener') {
    noteEl.innerHTML = `
      <div style="background: var(--brand-green-light-solid); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; line-height: 1.45; color: var(--text-primary); font-size: 0.92rem; box-shadow: var(--shadow-sm);">
        <strong style="color: var(--brand-green);">⚠️ Nota Gramatical (Age Usage):</strong> In Spanish, 
        the verb <strong>tener</strong> (to have) is used to express age instead of "to be" (e.g., 
        <em>yo tengo catorce años</em> literally translates to "I have 14 years", which means 
        "I am 14 years old").
      </div>`;
    noteEl.hidden = false;
  } else {
    noteEl.hidden = true;
  }

  const listContainer = document.getElementById('verb-review-examples-list');
  listContainer.innerHTML = '';

  pronouns.forEach(p => {
    const sentenceList = verbObj.sentences[p];
    if (sentenceList && sentenceList.length > 0) {
      sentenceList.forEach(item => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.padding = '10px 12px';
        row.style.borderRadius = '10px';
        row.style.borderBottom = '1px dashed var(--border-color)';
        row.style.gap = '16px';
        
        const textWrap = document.createElement('div');
        textWrap.style.display = 'flex';
        textWrap.style.flexDirection = 'column';
        textWrap.style.gap = '3px';

        const esText = document.createElement('span');
        esText.style.color = 'var(--brand-green)';
        esText.style.fontWeight = '700';
        esText.style.fontSize = '1.05rem';
        esText.textContent = item.spanish;

        const enText = document.createElement('span');
        enText.style.color = 'var(--text-secondary)';
        enText.style.fontSize = '0.85rem';
        enText.textContent = item.english;

        textWrap.appendChild(esText);
        textWrap.appendChild(enText);

        const sBtn = document.createElement('button');
        sBtn.className = 'btn btn-ghost';
        sBtn.style.padding = '4px 8px';
        sBtn.style.borderRadius = '6px';
        sBtn.style.fontSize = '1.1rem';
        sBtn.innerHTML = '🔊';
        sBtn.onclick = () => speakVerbRandomAccent(item.spanish);

        row.appendChild(textWrap);
        row.appendChild(sBtn);

        listContainer.appendChild(row);
      });
    }
  });
}

function speakVerbRandomAccent(text) {
  if (!('speechSynthesis' in window)) return;
  
  const u = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith('es'));
  if (voices.length > 0) {
    const randomVoice = voices[Math.floor(Math.random() * voices.length)];
    u.voice = randomVoice;
    u.lang = randomVoice.lang;
  } else {
    u.lang = 'es-ES';
  }
  
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function speakAllReviewConjugations() {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  
  const verbObj = VERB_DATA[activeReviewVerb];
  const pronouns = ["yo", "tú", "él/ella", "usted", "nosotros", "vosotros", "ellos", "ustedes"];
  
  const voices = speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith('es'));
  const randomVoice = voices.length > 0 ? voices[Math.floor(Math.random() * voices.length)] : null;
  
  pronouns.forEach(p => {
    const conj = verbObj.conjugations[p];
    let pronounToSpeak = p;
    if (p === 'él/ella') {
      pronounToSpeak = Math.random() < 0.5 ? 'él' : 'ella';
    }
    
    const u = new SpeechSynthesisUtterance(`${pronounToSpeak} ${conj}`);
    if (randomVoice) {
      u.voice = randomVoice;
      u.lang = randomVoice.lang;
    } else {
      u.lang = 'es-ES';
    }
    speechSynthesis.speak(u);
  });
}
