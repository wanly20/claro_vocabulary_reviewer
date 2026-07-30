/* 👤 Retrato Robot Challenge Module */

let rQuiz = null;

const RETRATO_HAIR_STYLES = ['corto', 'largo', 'rizado', 'liso', 'ondulado', 'calvo'];
const RETRATO_HAIR_COLORS = ['rubio', 'castaño', 'negro', 'pelirrojo'];
const RETRATO_EYE_COLORS = ['azules', 'verdes', 'marrones'];
const RETRATO_HEIGHTS = ['alto', 'bajo', 'mediano'];
const RETRATO_BUILDS = ['delgado', 'gordo', 'gordito', 'musculoso', 'joven', 'viejo'];

function generateRandomSuspect() {
  const gender = Math.random() < 0.5 ? 'm' : 'f';
  const hairStyle = RETRATO_HAIR_STYLES[Math.floor(Math.random() * RETRATO_HAIR_STYLES.length)];
  const hairColor = RETRATO_HAIR_COLORS[Math.floor(Math.random() * RETRATO_HAIR_COLORS.length)];
  const eyeColor = RETRATO_EYE_COLORS[Math.floor(Math.random() * RETRATO_EYE_COLORS.length)];
  const hasGlasses = Math.random() < 0.35;
  const hasBeard = gender === 'm' && hairStyle !== 'calvo' && Math.random() < 0.3;
  const hasMoustache = gender === 'm' && hairStyle !== 'calvo' && !hasBeard && Math.random() < 0.3;
  const hasFreckles = Math.random() < 0.35;
  const height = RETRATO_HEIGHTS[Math.floor(Math.random() * RETRATO_HEIGHTS.length)];
  const build = RETRATO_BUILDS[Math.floor(Math.random() * RETRATO_BUILDS.length)];
  
  return {
    gender, hairStyle, hairColor, eyeColor, hasGlasses, hasBeard, hasMoustache, hasFreckles, height, build
  };
}

function generateDistinctSuspect(c) {
  let d = generateRandomSuspect();
  let diffCount = 0;
  while (diffCount < 3) {
    d = generateRandomSuspect();
    diffCount = 0;
    if (d.gender !== c.gender) diffCount++;
    if (d.hairStyle !== c.hairStyle) diffCount++;
    if (d.hairColor !== c.hairColor) diffCount++;
    if (d.eyeColor !== c.eyeColor) diffCount++;
    if (d.hasGlasses !== c.hasGlasses) diffCount++;
    if (d.hasBeard !== c.hasBeard) diffCount++;
    if (d.hasMoustache !== c.hasMoustache) diffCount++;
    if (d.height !== c.height) diffCount++;
    if (d.build !== c.build) diffCount++;
  }
  return d;
}

function agreeDescriptor(word, gender) {
  if (word === 'joven') return 'joven';
  if (gender === 'f' && word.endsWith('o')) {
    return word.slice(0, -1) + 'a';
  }
  return word;
}

function getSuspectDescription(s) {
  const sentences = [];
  const h = agreeDescriptor(s.height, s.gender);
  const b = agreeDescriptor(s.build, s.gender);
  sentences.push(`Soy ${h} y ${b}.`);
  
  if (s.hairStyle === 'calvo') {
    sentences.push(`Soy ${agreeDescriptor('calvo', s.gender)}.`);
  } else {
    sentences.push(`Tengo el pelo ${s.hairColor} y ${s.hairStyle}.`);
  }
  
  sentences.push(`Tengo los ojos ${s.eyeColor}.`);
  
  const features = [];
  if (s.hasGlasses) features.push('tengo gafas');
  if (s.hasBeard) features.push('tengo barba');
  if (s.hasMoustache) features.push('tengo bigote');
  if (s.hasFreckles) features.push('tengo pecas');
  
  if (features.length === 1) {
    sentences.push(`Y ${features[0]}.`);
  } else if (features.length > 1) {
    const last = features.pop();
    sentences.push(`Y ${features.join(', ')} y ${last}.`);
  }
  
  return sentences.join(' ');
}

function drawAvatar(canvas, s) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const isOld = s.build === 'viejo' || s.build === 'vieja';

  ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#f1f5f9';
  ctx.fillRect(0, 0, w, h);

  let torsoWidth = w * 0.45;
  if (s.build === 'delgado') torsoWidth = w * 0.35;
  else if (s.build === 'gordo' || s.build === 'gordito') torsoWidth = w * 0.58;
  else if (s.build === 'musculoso') torsoWidth = w * 0.54;

  ctx.fillStyle = s.gender === 'm' ? '#3b82f6' : '#ec4899';
  ctx.beginPath();
  ctx.ellipse(w/2, h + h*0.1, torsoWidth, h*0.25, 0, 0, Math.PI, true);
  ctx.fill();

  if (s.build === 'musculoso') {
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = Math.max(1, w*0.015);
    ctx.beginPath();
    ctx.moveTo(w/2 - w*0.1, h - h*0.05);
    ctx.lineTo(w/2 - w*0.2, h - h*0.02);
    ctx.moveTo(w/2 + w*0.1, h - h*0.05);
    ctx.lineTo(w/2 + w*0.2, h - h*0.02);
    ctx.stroke();
  }

  ctx.fillStyle = '#fcdbb0';
  ctx.fillRect(w/2 - w*0.08, h/2 + h*0.1, w*0.16, h*0.12);

  ctx.fillStyle = '#fcdbb0';
  ctx.beginPath();
  ctx.arc(w/2 - w*0.25, h/2 + h*0.02, w*0.05, 0, Math.PI*2);
  ctx.arc(w/2 + w*0.25, h/2 + h*0.02, w*0.05, 0, Math.PI*2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(w/2, h/2 + h*0.02, w*0.25, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(w/2 - w*0.09, h/2 - h*0.02, w*0.05, w*0.03, 0, 0, Math.PI*2);
  ctx.ellipse(w/2 + w*0.09, h/2 - h*0.02, w*0.05, w*0.03, 0, 0, Math.PI*2);
  ctx.fill();

  let irisColor = '#6d4c41';
  if (s.eyeColor === 'azules') irisColor = '#3b82f6';
  else if (s.eyeColor === 'verdes') irisColor = '#10b981';
  ctx.fillStyle = irisColor;
  ctx.beginPath();
  ctx.arc(w/2 - w*0.09, h/2 - h*0.02, w*0.022, 0, Math.PI*2);
  ctx.arc(w/2 + w*0.09, h/2 - h*0.02, w*0.022, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(w/2 - w*0.09, h/2 - h*0.02, w*0.01, 0, Math.PI*2);
  ctx.arc(w/2 + w*0.09, h/2 - h*0.02, w*0.01, 0, Math.PI*2);
  ctx.fill();

  ctx.strokeStyle = '#332211';
  ctx.lineWidth = Math.max(1, w*0.01);
  ctx.beginPath();
  ctx.moveTo(w/2 - w*0.14, h/2 - h*0.07);
  ctx.lineTo(w/2 - w*0.04, h/2 - h*0.06);
  ctx.moveTo(w/2 + w*0.04, h/2 - h*0.06);
  ctx.lineTo(w/2 + w*0.14, h/2 - h*0.07);
  ctx.stroke();

  if (s.hasFreckles) {
    ctx.fillStyle = '#d97706';
    const fPoints = [
      [w/2 - w*0.16, h/2 + h*0.05], [w/2 - w*0.14, h/2 + h*0.04], [w/2 - w*0.12, h/2 + h*0.06],
      [w/2 + w*0.16, h/2 + h*0.05], [w/2 + w*0.14, h/2 + h*0.04], [w/2 + w*0.12, h/2 + h*0.06],
      [w/2 - w*0.04, h/2 + h*0.05], [w/2 + w*0.04, h/2 + h*0.05]
    ];
    for (const pt of fPoints) {
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], Math.max(1, w*0.007), 0, Math.PI*2);
      ctx.fill();
    }
  }

  ctx.strokeStyle = '#d9a073';
  ctx.lineWidth = Math.max(1.5, w*0.012);
  ctx.beginPath();
  ctx.moveTo(w/2, h/2 - h*0.01);
  ctx.quadraticCurveTo(w/2 + w*0.02, h/2 + h*0.04, w/2, h/2 + h*0.04);
  ctx.stroke();

  ctx.strokeStyle = '#e11d48';
  ctx.lineWidth = Math.max(2, w*0.015);
  ctx.beginPath();
  ctx.moveTo(w/2 - w*0.07, h/2 + h*0.09);
  ctx.quadraticCurveTo(w/2, h/2 + h*0.12, w/2 + w*0.07, h/2 + h*0.09);
  ctx.stroke();

  let hairColorHex = '#8B5A2B';
  if (s.hairColor === 'rubio') hairColorHex = '#d9b310';
  else if (s.hairColor === 'negro') hairColorHex = '#272727';
  else if (s.hairColor === 'pelirrojo') hairColorHex = '#ea580c';

  if (s.hasBeard && s.gender === 'm') {
    ctx.fillStyle = hairColorHex;
    ctx.beginPath();
    ctx.arc(w/2, h/2 + h*0.02, w*0.252, Math.PI * 0.15, Math.PI * 0.85);
    ctx.lineTo(w/2 - w*0.2, h/2 + h*0.18);
    ctx.quadraticCurveTo(w/2, h/2 + h*0.29, w/2 + w*0.2, h/2 + h*0.18);
    ctx.closePath();
    ctx.fill();
  }

  if (s.hasMoustache && s.gender === 'm') {
    ctx.fillStyle = hairColorHex;
    ctx.beginPath();
    ctx.moveTo(w/2 - w*0.07, h/2 + h*0.06);
    ctx.quadraticCurveTo(w/2, h/2 + h*0.03, w/2 + w*0.07, h/2 + h*0.06);
    ctx.lineTo(w/2 + w*0.05, h/2 + h*0.08);
    ctx.quadraticCurveTo(w/2, h/2 + h*0.06, w/2 - w*0.05, h/2 + h*0.08);
    ctx.closePath();
    ctx.fill();
  }

  if (s.hasGlasses) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(2, w*0.018);
    ctx.beginPath();
    ctx.arc(w/2 - w*0.09, h/2 - h*0.02, w*0.065, 0, Math.PI*2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w/2 + w*0.09, h/2 - h*0.02, w*0.065, 0, Math.PI*2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w/2 - w*0.025, h/2 - h*0.02);
    ctx.lineTo(w/2 + w*0.025, h/2 - h*0.02);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w/2 - w*0.155, h/2 - h*0.02);
    ctx.lineTo(w/2 - w*0.25, h/2 - h*0.02);
    ctx.moveTo(w/2 + w*0.155, h/2 - h*0.02);
    ctx.lineTo(w/2 + w*0.25, h/2 - h*0.02);
    ctx.stroke();
  }

  ctx.fillStyle = hairColorHex;
  if (s.hairStyle === 'corto') {
    ctx.beginPath();
    ctx.moveTo(w/2 - w*0.24, h/2 - h*0.12);
    ctx.bezierCurveTo(w/2 - w*0.28, h/2 - h*0.35, w/2 + w*0.28, h/2 - h*0.35, w/2 + w*0.24, h/2 - h*0.12);
    ctx.bezierCurveTo(w/2 + w*0.2, h/2 - h*0.23, w/2 - w*0.2, h/2 - h*0.23, w/2 - w*0.24, h/2 - h*0.12);
    ctx.closePath();
    ctx.fill();
  } 
  else if (s.hairStyle === 'largo') {
    ctx.beginPath();
    ctx.moveTo(w/2 - w*0.25, h/2 + h*0.25);
    ctx.lineTo(w/2 - w*0.25, h/2 - h*0.1);
    ctx.bezierCurveTo(w/2 - w*0.28, h/2 - h*0.35, w/2 + w*0.28, h/2 - h*0.35, w/2 + w*0.25, h/2 - h*0.1);
    ctx.lineTo(w/2 + w*0.25, h/2 + h*0.25);
    ctx.lineTo(w/2 + w*0.19, h/2 + h*0.25);
    ctx.lineTo(w/2 + w*0.19, h/2 - h*0.05);
    ctx.bezierCurveTo(w/2 + w*0.1, h/2 - h*0.2, w/2 - w*0.1, h/2 - h*0.2, w/2 - w*0.19, h/2 - h*0.05);
    ctx.lineTo(w/2 - w*0.19, h/2 + h*0.25);
    ctx.closePath();
    ctx.fill();
  } 
  else if (s.hairStyle === 'liso') {
    ctx.beginPath();
    ctx.moveTo(w/2 - w*0.25, h/2 - h*0.05);
    ctx.bezierCurveTo(w/2 - w*0.28, h/2 - h*0.35, w/2 + w*0.28, h/2 - h*0.35, w/2 + w*0.25, h/2 - h*0.05);
    ctx.lineTo(w/2 + w*0.2, h/2 - h*0.1);
    ctx.quadraticCurveTo(w/2, h/2 - h*0.16, w/2 - w*0.2, h/2 - h*0.1);
    ctx.closePath();
    ctx.fill();
  }
  else if (s.hairStyle === 'rizado') {
    const curls = [
      [w/2 - w*0.2, h/2 - h*0.2], [w/2 - w*0.1, h/2 - h*0.24], [w/2, h/2 - h*0.26],
      [w/2 + w*0.1, h/2 - h*0.24], [w/2 + w*0.2, h/2 - h*0.2], [w/2 - w*0.24, h/2 - h*0.12],
      [w/2 + w*0.24, h/2 - h*0.12], [w/2 - w*0.25, h/2 - h*0.04], [w/2 + w*0.25, h/2 - h*0.04],
      [w/2 - w*0.15, h/2 - h*0.23], [w/2 + w*0.15, h/2 - h*0.23], [w/2 - w*0.05, h/2 - h*0.25],
      [w/2 + w*0.05, h/2 - h*0.25], [w/2 - w*0.25, h/2 - h*0.2], [w/2 + w*0.25, h/2 - h*0.2]
    ];
    ctx.fillStyle = hairColorHex;
    for (const c of curls) {
      ctx.beginPath();
      ctx.arc(c[0], c[1], w*0.06, 0, Math.PI*2);
      ctx.fill();
    }
  } 
  else if (s.hairStyle === 'ondulado') {
    ctx.beginPath();
    ctx.moveTo(w/2 - w*0.25, h/2 + h*0.03);
    ctx.bezierCurveTo(w/2 - w*0.3, h/2 - h*0.32, w/2 + w*0.3, h/2 - h*0.32, w/2 + w*0.25, h/2 + h*0.03);
    ctx.lineTo(w/2 + w*0.18, h/2 - h*0.12);
    ctx.bezierCurveTo(w/2 + w*0.1, h/2 - h*0.27, w/2 - w*0.1, h/2 - h*0.27, w/2 - w*0.18, h/2 - h*0.12);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = Math.max(1, w*0.008);
    ctx.beginPath();
    ctx.moveTo(w/2 - w*0.1, h/2 - h*0.25);
    ctx.quadraticCurveTo(w/2 - w*0.18, h/2 - h*0.18, w/2 - w*0.23, h/2 - h*0.15);
    ctx.moveTo(w/2 + w*0.1, h/2 - h*0.25);
    ctx.quadraticCurveTo(w/2 + w*0.18, h/2 - h*0.18, w/2 + w*0.23, h/2 - h*0.15);
    ctx.stroke();
  }

  // Render wrinkles and age lines on top of face/hair to ensure high visibility
  if (isOld) {
    ctx.strokeStyle = 'rgba(100, 60, 30, 0.35)'; // Highly visible warm wrinkle color
    ctx.lineWidth = Math.max(1.2, w * 0.009); // Prominent thickness
    
    // 1. Forehead wrinkles (positioned to be visible even with hair)
    ctx.beginPath();
    ctx.moveTo(w/2 - w*0.08, h/2 - h*0.11);
    ctx.quadraticCurveTo(w/2, h/2 - h*0.12, w/2 + w*0.08, h/2 - h*0.11);
    ctx.moveTo(w/2 - w*0.06, h/2 - h*0.08);
    ctx.quadraticCurveTo(w/2, h/2 - h*0.09, w/2 + w*0.06, h/2 - h*0.08);
    ctx.stroke();

    // 2. Crow's feet (eye crinkles) at outer edges of eyes
    ctx.beginPath();
    // Left eye outer
    ctx.moveTo(w/2 - w*0.14, h/2 - h*0.02);
    ctx.lineTo(w/2 - w*0.18, h/2 - h*0.04);
    ctx.moveTo(w/2 - w*0.14, h/2 - h*0.02);
    ctx.lineTo(w/2 - w*0.19, h/2 - h*0.01);
    ctx.moveTo(w/2 - w*0.14, h/2 - h*0.02);
    ctx.lineTo(w/2 - w*0.18, h/2 + h*0.01);
    // Right eye outer
    ctx.moveTo(w/2 + w*0.14, h/2 - h*0.02);
    ctx.lineTo(w/2 + w*0.18, h/2 - h*0.04);
    ctx.moveTo(w/2 + w*0.14, h/2 - h*0.02);
    ctx.lineTo(w/2 + w*0.19, h/2 - h*0.01);
    ctx.moveTo(w/2 + w*0.14, h/2 - h*0.02);
    ctx.lineTo(w/2 + w*0.18, h/2 + h*0.01);
    ctx.stroke();

    // 3. Under-eye bags/creases
    ctx.beginPath();
    ctx.moveTo(w/2 - w*0.13, h/2 + h*0.015);
    ctx.quadraticCurveTo(w/2 - w*0.09, h/2 + h*0.03, w/2 - w*0.05, h/2 + h*0.02);
    ctx.moveTo(w/2 + w*0.13, h/2 + h*0.015);
    ctx.quadraticCurveTo(w/2 + w*0.09, h/2 + h*0.03, w/2 + w*0.05, h/2 + h*0.02);
    ctx.stroke();

    // 4. Smile lines (around the mouth)
    ctx.beginPath();
    // Left smile line
    ctx.moveTo(w/2 - w*0.09, h/2 + h*0.05);
    ctx.quadraticCurveTo(w/2 - w*0.11, h/2 + h*0.09, w/2 - w*0.08, h/2 + h*0.13);
    // Right smile line
    ctx.moveTo(w/2 + w*0.09, h/2 + h*0.05);
    ctx.quadraticCurveTo(w/2 + w*0.11, h/2 + h*0.09, w/2 + w*0.08, h/2 + h*0.13);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(128,128,128,0.2)';
  ctx.lineWidth = Math.max(1, w*0.005);
  ctx.beginPath();
  ctx.moveTo(w*0.08, h*0.15);
  ctx.lineTo(w*0.08, h*0.85);
  ctx.stroke();
  for (let y = h*0.2; y <= h*0.8; y += h*0.1) {
    ctx.beginPath();
    ctx.moveTo(w*0.08, y);
    ctx.lineTo(w*0.12, y);
    ctx.stroke();
  }
  let heightY = h*0.5;
  if (s.height === 'alto') heightY = h*0.28;
  else if (s.height === 'bajo') heightY = h*0.72;
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(w*0.11, heightY);
  ctx.lineTo(w*0.05, heightY - h*0.02);
  ctx.lineTo(w*0.05, heightY + h*0.02);
  ctx.closePath();
  ctx.fill();
}

function startRetrato(mode) {
  const pool = [];
  for (let i = 0; i < 10; i++) {
    const correctSuspect = generateRandomSuspect();
    
    if (mode === 'lineup') {
      const dist1 = generateDistinctSuspect(correctSuspect);
      const dist2 = generateDistinctSuspect(correctSuspect);
      const dist3 = generateDistinctSuspect(correctSuspect);
      const suspects = shuffle([correctSuspect, dist1, dist2, dist3]);
      const correctIndex = suspects.indexOf(correctSuspect);
      
      pool.push({
        mode: 'lineup',
        prompt: getSuspectDescription(correctSuspect),
        correctSuspect,
        suspects,
        correctIndex,
        correct: `Suspect ${['A', 'B', 'C', 'D'][correctIndex]}`
      });
    } else {
      let qType = ['hair', 'eyes', 'build'][Math.floor(Math.random() * 3)];
      const hasAnyFeature = correctSuspect.hasGlasses || correctSuspect.hasBeard || correctSuspect.hasMoustache || correctSuspect.hasFreckles;
      if (hasAnyFeature && Math.random() < 0.35) {
        qType = 'features';
      }
      
      let promptText = '';
      let correctSentence = '';
      let options = [];
      
      if (qType === 'hair') {
        promptText = '¿Cómo es su pelo? (tiene el pelo... / es...)';
        if (correctSuspect.hairStyle === 'calvo') {
          correctSentence = `es ${agreeDescriptor('calvo', correctSuspect.gender)}`;
          options = [
            `es ${agreeDescriptor('calvo', correctSuspect.gender)}`,
            `tiene el pelo rubio y corto`,
            `tiene el pelo castaño y largo`,
            `tiene el pelo negro y rizado`
          ];
        } else {
          correctSentence = `tiene el pelo ${correctSuspect.hairColor} y ${correctSuspect.hairStyle}`;
          options = [
            correctSentence,
            `tiene el pelo ${correctSuspect.hairColor === 'rubio' ? 'castaño' : 'rubio'} y ${correctSuspect.hairStyle}`,
            `tiene el pelo ${correctSuspect.hairColor} y ${correctSuspect.hairStyle === 'corto' ? 'largo' : 'corto'}`,
            `es ${agreeDescriptor('calvo', correctSuspect.gender)}`
          ];
        }
      } 
      else if (qType === 'eyes') {
        promptText = '¿Cómo son sus ojos? (tiene los ojos...)';
        correctSentence = `tiene los ojos ${correctSuspect.eyeColor}`;
        options = [
          `tiene los ojos azules`,
          `tiene los ojos verdes`,
          `tiene los ojos marrones`,
          `tiene los ojos negros`
        ];
      } 
      else if (qType === 'build') {
        promptText = '¿Cómo es su aspecto físico? (es...)';
        const h = agreeDescriptor(correctSuspect.height, correctSuspect.gender);
        const b = agreeDescriptor(correctSuspect.build, correctSuspect.gender);
        correctSentence = `es ${h} y ${b}`;
        
        const otherG = correctSuspect.gender === 'm' ? 'f' : 'm';
        const hOpp = correctSuspect.height === 'alto' ? 'bajo' : 'alto';
        const bOpp = correctSuspect.build === 'delgado' ? 'gordo' : 'delgado';
        
        options = [
          correctSentence,
          `es ${agreeDescriptor(correctSuspect.height, otherG)} y ${agreeDescriptor(correctSuspect.build, otherG)}`,
          `es ${agreeDescriptor(hOpp, correctSuspect.gender)} y ${agreeDescriptor(correctSuspect.build, correctSuspect.gender)}`,
          `es ${agreeDescriptor(correctSuspect.height, correctSuspect.gender)} y ${agreeDescriptor(bOpp, correctSuspect.gender)}`
        ];
      } 
      else if (qType === 'features') {
        promptText = '¿Qué rasgos tiene?';
        const features = [];
        if (correctSuspect.hasGlasses) features.push('tiene gafas');
        if (correctSuspect.hasBeard) features.push('tiene barba');
        if (correctSuspect.hasMoustache) features.push('tiene bigote');
        if (correctSuspect.hasFreckles) features.push('tiene pecas');
        
        correctSentence = features.join(' y ');
        options = [
          correctSentence,
          correctSuspect.hasGlasses ? 'tiene pecas' : 'tiene gafas',
          correctSuspect.hasBeard ? 'tiene bigote' : 'tiene barba',
          'no tiene rasgos'
        ];
      }
      
      options = shuffle(options.filter((v, i, a) => a.indexOf(v) === i));
      while (options.length < 4) {
        options.push(`es ${agreeDescriptor('bajo', correctSuspect.gender)} y ${agreeDescriptor('joven', correctSuspect.gender)}`);
      }
      options = shuffle(options);
      
      pool.push({
        mode: 'describe',
        qType,
        prompt: promptText,
        correctSuspect,
        correct: correctSentence,
        options
      });
    }
  }
  
  rQuiz = {
    mode,
    questions: pool,
    index: 0,
    results: [],
    total: 10
  };
  
  document.getElementById('retrato-opt-0').onclick = () => selectRetratoLineup(0);
  document.getElementById('retrato-opt-1').onclick = () => selectRetratoLineup(1);
  document.getElementById('retrato-opt-2').onclick = () => selectRetratoLineup(2);
  document.getElementById('retrato-opt-3').onclick = () => selectRetratoLineup(3);

  showScreen('retrato-screen');
  renderRetratoQuestion();
}

function renderRetratoQuestion() {
  const q = rQuiz.questions[rQuiz.index];
  const res = rQuiz.results[rQuiz.index];
  const total = rQuiz.total;
  
  document.getElementById('retrato-progress').textContent = `${rQuiz.index + 1} / ${total}`;
  document.getElementById('retrato-progress-fill').style.width = `${((rQuiz.index + 1) / total) * 100}%`;
  
  const promptWord = document.getElementById('retrato-prompt-word');
  const promptLabel = document.getElementById('retrato-prompt-label');
  const singleWrap = document.getElementById('retrato-single-canvas-wrap');
  const lineupWrap = document.getElementById('retrato-lineup-wrap');
  const mcOptions = document.getElementById('retrato-mc-options');
  const typeIn = document.getElementById('retrato-type-input');
  const fb = document.getElementById('retrato-feedback');
  const ca = document.getElementById('retrato-correct-answer');
  const navRow = document.getElementById('retrato-nav-row');
  const skipBtn = document.getElementById('retrato-back-skip-btn');
  const checkBtn = document.getElementById('retrato-check-next-btn');
  
  fb.textContent = '';
  fb.className = 'feedback';
  ca.innerHTML = '';
  
  if (rQuiz.mode === 'lineup') {
    promptLabel.textContent = 'Retrato Robot Lineup';
    promptWord.textContent = q.prompt;
    singleWrap.hidden = true;
    lineupWrap.hidden = false;
    mcOptions.hidden = true;
    typeIn.hidden = true;
    navRow.hidden = false;
    checkBtn.hidden = !res;
    
    for (let i = 0; i < 4; i++) {
      const canv = document.getElementById(`retrato-canvas-${i}`);
      drawAvatar(canv, q.suspects[i]);
      
      const btn = document.getElementById(`retrato-opt-${i}`);
      btn.disabled = !!res;
      btn.className = 'activity-btn';
      if (res) {
        if (i === q.correctIndex) btn.style.borderColor = 'var(--color-correct)';
        const chosenIndex = ['A', 'B', 'C', 'D'].indexOf(res.chosen.replace('Suspect ', ''));
        if (i === chosenIndex && !res.ok) btn.style.borderColor = 'var(--color-incorrect)';
      } else {
        btn.style.borderColor = '';
      }
    }
    
    if (res) {
      skipBtn.textContent = '← Back'; skipBtn.disabled = rQuiz.index === 0;
      checkBtn.textContent = rQuiz.index >= total - 1 ? 'Finish ✓' : 'Next →';
      if (res.ok) {
        fb.textContent = '¡Correcto! ✓'; fb.className = 'feedback correct';
      } else {
        fb.textContent = 'Incorrect ✗'; fb.className = 'feedback incorrect';
        ca.innerHTML = `The correct suspect was: <strong>${q.correct}</strong>`;
      }
    } else {
      skipBtn.textContent = 'Skip'; skipBtn.disabled = false;
      checkBtn.textContent = 'Check →';
    }
  } else {
    promptLabel.textContent = 'Retrato Robot Description';
    promptWord.textContent = q.prompt;
    singleWrap.hidden = false;
    lineupWrap.hidden = true;
    mcOptions.hidden = true;
    typeIn.hidden = false;
    navRow.hidden = false;
    checkBtn.hidden = false;
    
    const mainCanv = document.getElementById('retrato-canvas');
    drawAvatar(mainCanv, q.correctSuspect);
    
    if (res) {
      typeIn.value = res.chosen;
      typeIn.disabled = true;
      typeIn.className = 'type-input ' + res.result;
      skipBtn.textContent = '← Back'; skipBtn.disabled = rQuiz.index === 0;
      checkBtn.textContent = rQuiz.index >= total - 1 ? 'Finish ✓' : 'Next →';
      if (res.ok) {
        fb.textContent = '¡Correcto! ✓'; fb.className = 'feedback correct';
      } else if (res.result === 'nearly') {
        fb.textContent = 'Nearly! ½ point'; fb.className = 'feedback nearly';
        ca.innerHTML = `Correct description: <strong>${q.correct}</strong>`;
      } else {
        fb.textContent = res.chosen === '—' ? 'Skipped' : 'Incorrect ✗';
        fb.className = 'feedback incorrect';
        ca.innerHTML = `Correct description: <strong>${q.correct}</strong>`;
      }
    } else {
      typeIn.value = '';
      typeIn.disabled = false;
      typeIn.className = 'type-input';
      skipBtn.textContent = 'Skip'; skipBtn.disabled = false;
      checkBtn.textContent = 'Check →';
      typeIn.focus();
    }
  }
}

function selectRetratoLineup(idx) {
  if (rQuiz.results[rQuiz.index]) return;
  const q = rQuiz.questions[rQuiz.index];
  const ok = idx === q.correctIndex;
  rQuiz.results[rQuiz.index] = {
    ok,
    score: ok ? 1 : 0,
    chosen: `Suspect ${['A', 'B', 'C', 'D'][idx]}`,
    correct: q.correct
  };
  renderRetratoQuestion();
}

function retratoCheckNext() {
  const res = rQuiz.results[rQuiz.index];
  if (!res) {
    if (rQuiz.mode === 'describe') {
      const typed = document.getElementById('retrato-type-input').value.trim();
      if (!typed) return;
      const q = rQuiz.questions[rQuiz.index];
      const result = grade(typed, q.correct, false);
      const ok = result === 'correct';
      const score = ok ? 1 : (result === 'nearly' ? 0.5 : 0);
      
      rQuiz.results[rQuiz.index] = {
        ok,
        score,
        chosen: typed,
        correct: q.correct,
        result
      };
      renderRetratoQuestion();
    } else if (rQuiz.mode === 'lineup') {
      const q = rQuiz.questions[rQuiz.index];
      rQuiz.results[rQuiz.index] = {
        ok: false,
        score: 0,
        chosen: '—',
        correct: q.correct,
        result: 'incorrect'
      };
      renderRetratoQuestion();
    }
  } else {
    rQuiz.index++;
    if (rQuiz.index >= rQuiz.total) renderRetratoScore();
    else {
      rollStudent();
      renderRetratoQuestion();
    }
  }
}

function retratoBackSkip() {
  const res = rQuiz.results[rQuiz.index];
  if (!res) {
    const q = rQuiz.questions[rQuiz.index];
    rQuiz.results[rQuiz.index] = {
      ok: false,
      score: 0,
      chosen: '—',
      correct: q.correct,
      result: 'incorrect'
    };
    rollStudent();
    renderRetratoQuestion();
  } else if (rQuiz.index > 0) {
    rQuiz.index--;
    rollStudent();
    renderRetratoQuestion();
  }
}

function renderRetratoScore() {
  const total = rQuiz.total;
  const score = rQuiz.results.reduce((acc, r) => acc + (r ? r.score : 0), 0);
  const wrong = rQuiz.results.filter(r => r && !r.ok);

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
    const q = rQuiz.questions[rQuiz.results.indexOf(r)];
    const div = document.createElement('div');
    div.className = 'wrong-item';
    
    let promptText = '';
    if (rQuiz.mode === 'lineup') {
      promptText = `Lineup clue: "${q.prompt}"`;
    } else {
      promptText = `${q.prompt} (Suspect features: ${describeSuspectDebug(q.correctSuspect)})`;
    }
    
    div.innerHTML = `
      <span class="es">${q.correct}</span>
      <span class="en"> — ${promptText}</span>
      <span class="yours">You answered: ${r.chosen}</span>`;
    list.appendChild(div);
  }
  document.getElementById('redo-btn').hidden            = true;
  document.getElementById('next-phase-btn').hidden      = true;
  document.getElementById('back-home-btn').hidden       = false;
  document.getElementById('score-omakase-section').hidden = true;
  showScreen('score-screen');
}

function describeSuspectDebug(s) {
  const parts = [s.gender === 'm' ? 'Male' : 'Female'];
  if (s.hairStyle === 'calvo') parts.push('bald');
  else parts.push(`${s.hairColor} ${s.hairStyle} hair`);
  parts.push(`${s.eyeColor} eyes`);
  if (s.hasGlasses) parts.push('glasses');
  if (s.hasBeard) parts.push('beard');
  if (s.hasMoustache) parts.push('moustache');
  if (s.hasFreckles) parts.push('freckles');
  parts.push(s.height);
  parts.push(s.build);
  return parts.join(', ');
}
