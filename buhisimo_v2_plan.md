# Buhísimo v2: Review of v1 and Build Plan

*Prepared 7 October 2026 for Juan (Year 7 Spanish, Claro 1). Scope: review `buhisimo.html` and its games, then plan a v2 that covers units 1.1 to 3.6. No existing files were changed. This document is the only output.*

---

## 0. Summary

**What v1 gets right.** v1 has a clear Duolingo-style path. It introduces words in small sets (about 4 per crown level) and recycles mistakes until they are answered correctly. It has revision nodes and checkpoints. Your rules document (`buhisimo_rules.md`) has firm vocabulary rules and checklists. The 1.6 mix engine shows the right way to generate sentences safely: hand-checked inflection tables, with every output listed for review. The Mochila game asks students to understand Spanish and choose a picture, which is real comprehension. All of this is worth keeping.

**Top 5 problems with v1**

1. **The spaced-repetition engine doesn't work.** On every page load, `decayStrengths()` applies decay again from the same `last_practiced` date, so the decay compounds. A correct answer sets strength to 1.0, and a wrong answer never lowers it. Strength only updates when a vocabulary key appears as a substring of a *Spanish* prompt. Typing, word-bank, listening and match questions therefore credit nothing, while tiny keys such as `o`, `y`, `es` and `un` get credited constantly. Nothing chooses words by weakness, even though the rules doc says revision is "weakest-first". Crowns measure completion, not mastery.
2. **The two vocabulary rules are broken in places, and nothing in the code catches it.** 24 of the 173 `VOCAB_DATABASE` keys are not CSV rows. Some are approved, but `la lengua` was never approved. Dialogues and boss cards use words that were never introduced: `gracias`, `muy`, `mañana`, `Señor`, `tu`, `de`, `Carlos`, and `un`/`mi` long before 1.6 introduces them. Word-bank distractors are drawn from the *whole* database, so untaught words appear as tiles. Frogger includes sentences like "My name is Spain" and "Her name is she".
3. **The code is hand-unrolled for every node.** Adding a unit means editing about 12 places (`renderMap` alone is about 540 lines). This has already produced copy-paste bugs: Space Invaders 1.5 and Maze 1.5 re-lock the wrong games. **"Save Data" currently crashes for everyone** because `btoa()` can't encode the `…` in `hay…` and `mi color favorito es…`. After the first lesson, the "I forgot" and "Skip" buttons disappear until the page is reloaded.
4. **Retrieval is leaked or replaced by guessing.** Hovering over the prompt in a multiple-choice question shows the English answer. New-word "intro" cards are 4-option guesses rather than worked examples, and on phones, where hover doesn't exist, students simply guess. Answers are accepted without accents, `ñ` included (`año` = `ano`). Every utterance uses a randomly chosen voice.
5. **The games add effort that has nothing to do with Spanish, and they get used up.** Aiming a bow, steering through a maze and dodging logs take a lot of time per word retrieved. Each game locks itself again after one play. Storage is fragile: a single localStorage key, a full name is required, Safari can wipe data after 7 days, and the backup feature is broken.

**Top 5 ideas for v2**

1. **Units are generated from data and checked automatically.** The CSV plus small unit files (YAML) are built into `content.json`. A **validator** tokenises every Spanish string in the app and fails the build if a word isn't in the CSV, the approved helper list or the approved forms list (Rule 1), or if it's used before the node that introduces it (Rule 2). GitHub Actions only deploys when the validator passes.
2. **A real item model with spaced repetition.** Every word or phrase moves through stages: *presented → recognised → guided recall → free recall → used in a sentence*. Scheduling uses a Leitner box system, with a daily "Repaso" of items that are due, interleaved across units. Crowns mean *completed → mastered → retained after a gap of 3 or more days*.
3. **Duolingo-style content built only from known words.** Short **stories/dialogues** with recurring characters, a **"Radio Búho" podcast** for each unit, **shadowing-based speaking**, dictation, sentence building, and safe generated-sentence engines. All of these are validated.
4. **Catch-up mode that mirrors your teaching.** A static `class.json` records where each class is. A student who is behind sees a short "catch-up route" through the core words of the units they missed, so they can take part in your next lesson. No leaderboards, no hearts in practice, and no "Exam failed 😭" screen.
5. **Pre-generated audio tied to CSV IDs, with a review step**, plus offline PWA support, a mobile-first layout and an accent keyboard. The teacher side is designed in from the start: class code, pseudonymous practice codes and no accounts. It can be switched on later without changing the data model.

**Recommended Phase 1** (about 35–50 hours with AI help): the engine, the data pipeline and validator, *auto-generated* word-level units for every CSV section (1.1 to 3.1, and later 3.4–3.6), and **one fully hand-authored vertical slice: unit 3.4**. It also includes v1 progress migration, local storage with working export, and a PWA. Your current class gets something useful this term, and the hardest parts (sentences, stories, the validator) are proven early. Phase 2 hand-authors 1.1 to 3.1 for the 2027 cohort. See §13.

---

## 1. What was reviewed (and what couldn't be verified)

Read in full or in the relevant parts:

- `buhisimo.html`: map markup, `VOCAB_DATABASE`, the `BUBBLE_*_LEVELS` arrays, state, `loadProgress`, `decayStrengths`, `renderMap`, `startStudySession`, the mix engine, `generateRandomQuestion`, `loadNextQuestion`, `submitAnswer`, `confirmContinue`, `completeLesson`, the checkpoint and boss code, `speakTTS`, `scrollToActiveBubble`, key handlers and responsive CSS.
- `buhisimo_rules.md` (all of it), `vocabulary_database.csv` (all 298 rows, analysed with a script), `sound_system.md` and `unlock_1_5_key.txt` (decoded).
- `games/`: frogger, globo, maze, space and mochila. `challenges/`: animal_colour, retrato_robot and verb_conjugation. `index.html` was skimmed for the CSV loader, `grade()`, teacher mode and the Omakase phases.
- The textbook image for 3.4–3.6, which matches the transcription in the brief.

**Not verified:**

- I didn't run the app in a browser. All bugs were found by reading the code. The `btoa` crash was confirmed by running the same call in Node, which throws `InvalidCharacterError`.
- I don't know how your school's Chromebooks are configured. If they use *ephemeral mode*, localStorage is wiped at sign-out.
- I don't know your school's privacy approval process, or the current state of Chrome's on-device speech recognition.
- I don't know which Spanish variety you model in class.
- I don't know the 3.2 and 3.3 vocabulary.

Note: 1.6 (`b27`–`b30`, `r9`) and `games/mochila/` exist in the working tree but are **uncommitted** (`git status`). `buhisimo_rules.md` still says "Next unit to build: 1.6".

---

## 2. Review of v1

### 2.1 What works

| Area | What's good | Where |
|---|---|---|
| Small steps | Levels of about 4 words each, with new words introduced a level at a time. This is good management of intrinsic load. | `BUBBLE_1_LEVELS` … `BUBBLE_27_LEVELS` (l.2167–2242) |
| Error loop | Wrong answers go to `mistakesQueue` and come back until correct, so every lesson ends with the correct form. | `loadNextQuestion` l.3779 |
| Interleaving (intent) | Revision nodes `r1`–`r9` mix earlier chapters. | `startStudySession` l.3345–3365 |
| Safe generation | The mix engine uses hand-written inflection tables, has no runtime grammar rules, and `validateMixEngine()` lists its outputs. This is the right pattern and should be generalised. | l.3479–3632, rules §8.2 |
| Comprehension game | Mochila: hear or read Spanish, then choose the matching picture (number, colour and noun agreement). No English is involved. | `games/mochila/mochila.js` |
| Typing tolerance | Accepts answers without an article or accents, which lowers frustration. | `cleanSpanString`, `submitAnswer` l.4168–4201 |
| Desktop usability | Keyboard 1–9 to pick an option, Enter to check, dark mode, a focus button. | l.5046–5083 |
| Privacy | No backend and no accounts. Hosting is static. | — |
| Process | The rules doc, the checklists and the helper-approval log. These are excellent and should become *data* in v2. | `buhisimo_rules.md` §0, §6.1, §12 |

`index.html` also has reusable pieces: a CSV loader, a `grade()` function with a *nearly* grade (correct apart from accents), dictation modes, a "Omakase" phase progression (flashcards → MC → typing → dictation), and Retrato Robot, which is an excellent comprehension task.

### 2.2 Problems with the learning design

1. **There is no "I do" step.** The intro card (`type: "intro"`, l.3437–3449) shows the new word and **4 English options to guess from**. On desktop the answer is in a hover tooltip. On phones students guess. A first exposure should be a worked example, without a test.
2. **Answers leak during retrieval.** In `mc` questions every prompt word gets a hover tooltip with its English meaning (l.3906–3920). Only checkpoints switch this off. A single-word prompt such as "el mapa" is answered by hovering.
3. **Question types are chosen at random, with no difficulty progression.** `generateRandomQuestion` picks uniformly from `mc, match, dialogue, bank, typing, listening` (l.3638). A word seen 10 seconds ago can be asked as free typing, and a well-known word can come back as an easy match.
4. **Crowns record completion, not mastery.** Every question loops until correct, so a crown is guaranteed however many errors were made (`completeLesson`, l.4317+).
5. **Revision isn't spaced repetition.** Each revision pool is a fixed list of chapters, and questions pick targets at random. A revision node shows gold forever after one run.
6. **The strength data is unreliable** (see §2.4, bugs B1–B3). So "My Vocabulary" percentages don't mean anything, and they couldn't feed you useful "weak words" either.
7. **Checkpoints punish.** Four hearts, Skip costs a heart, and failing shows "Exam Failed! 😭" with no targeted follow-up practice. The boss "last chance" appears only if you fail at question 13 or later. For students who are behind, this is exactly the shame-and-avoid loop the app is meant to prevent.
8. **The games are rewards that get used up.** Each game re-locks after one play ("complete a practice session to unlock it again"). It also means extra practice through games is rationed.
9. **Some sentences are nonsense or unnatural.** Frogger has "My name is Spain.", "My name is well.", "Her name is she." The `¿Qué tal?` dialogue answer is "Buenos días, bien".
10. **Accent and ñ errors are silently accepted.** `cleanSpanString` strips all diacritics, `ñ` included, so `el ano` is marked correct for `el año`. Students never see that they made a mistake.
11. **Audio is inconsistent.** `speakTTS` picks a **random** Spanish voice for every utterance (l.4945–4950). A beginner might hear es-ES, es-MX and es-US within one lesson. On Linux there is often no voice at all.

### 2.3 Audit of the two rules (v1 as it is now)

| Location | Problem | Rule |
|---|---|---|
| `VOCAB_DATABASE` "la lengua" (`b3` L3) | Not in the CSV and not approved | 1 |
| `VOCAB_DATABASE` "soy de", "de dónde", "bien, gracias", "muy bien", "me llamo/te llamas/se llama", "¿cómo te llamas?", "¿cómo se escribe?", "tengo... años" | Not CSV rows and not in the §6.1 approved list. Most are reasonable, but they were never recorded. | 1 |
| Dialogue `¿cómo te llamas?` → "me llamo Señor Ospina León"; distractor "me llamo Carlos" | `Señor` and the names aren't approved | 1 |
| Dialogue `¿Cuántos años tienes?` distractor "mi cumpleaños es mañana" | `mañana` isn't in the CSV. `mi` is used in 1.3 but introduced in 1.6. | 1, 2 |
| Dialogue / boss 1.4 "Mi cumpleaños es el primero de junio" | `mi`, `tu`, `de` are used before they're introduced (or are unapproved) | 1, 2 |
| Boss 1.1 "Chile es un país hispanohablante" | `un` is introduced in `b27` (1.6) | 2 |
| Boss 1.2 "¿Cómo estás? Muy bien, gracias" | `muy` and `gracias` aren't in the CSV | 1 |
| Boss 1.5 "Me encanta el azul, pero no me gusta nada el amarillo" | Standalone `el` is never introduced | 1/2 |
| Frogger 1.1 chunks "es de" | `de` on its own is never introduced | 2 |
| Mochila label "Pon en la mochila", HUD "Ronda" | `pon`, standalone `la` and `ronda` aren't in the CSV | 1 |
| `getRandomWordPoolDistractors` (l.3759) | Draws tiles from **all** of `VOCAB_DATABASE`, so a 1.1 student can see `tijeras` | 2 |
| CSV rows missing from the app | `me gusta (mucho)` and `no me gusta (nada)` only appear as "me gusta"/"no me gusta". `el lugar de nascimiento` (a CSV typo) appears in the app as `nacimiento`. | — |

None of this is anyone's fault. Discipline alone can't keep 170+ strings consistent across 8 files. That's why v2 needs a validator.

### 2.4 Technical problems and bugs

| # | Problem | Evidence | Impact |
|---|---|---|---|
| B1 | **Decay compounds** | `decayStrengths()` (l.2415) multiplies `strength` by e^(−0.15·days since last_practiced) but doesn't move `last_practiced`. It runs on every load, on lesson start, on checkpoints and on opening the modal. | Strengths drain faster every time the app is used |
| B2 | **Strength is binary and rarely updated** | `confirmContinue` (l.4236–4252) sets 1.0 on a correct answer and does nothing on a wrong one. Credit goes to keys found by `q.prompt.includes(key)`. Prompts for typing and bank are English, listening has no `prompt`, and match has no `prompt`. | Most practice is never recorded. `o`, `y`, `es`, `en`, `un` and `mi` are falsely credited. |
| B3 | Theme strength is meaningless | One correct word sets the whole theme to 1.0 | The modal is misleading |
| B4 | **Export crashes** | `exportBuhisimoData` calls `btoa(JSON.stringify(state))`. `state.word_strengths` now contains `hay…` and `mi color favorito es…` (U+2026), so `btoa` throws `InvalidCharacterError`. The old `unlock_1_5_key.txt` predates these keys. | "Save Data" is broken for all students |
| B5 | Forgot and Skip buttons vanish | `completeLesson` and `showCheckpointFailScreen` set `style.display='none'`. Later code only toggles `.hidden`. | After the first lesson, "I forgot" never shows again, and checkpoint Skip is gone until reload |
| B6 | Wrong game unlock flags | `space.js` `complete()`/`quit()` treat any chapter other than 1 as 1.3, so 1.5 clears `game2_unlocked_1_3`. `maze.js` treats any chapter other than 3 as 1.4. | 1.5 games never re-lock, and they lock the 1.3 and 1.4 games instead |
| B7 | The streak never resets | `completeLesson` l.4614: `if lastActive !== today → streak++` | "Day streak" is really "days active" |
| B8 | Dead code | `startCrossingGame` and `completeCrossingGame` (l.4888–4937) call `initFroggerGame`, which is undefined | Confusing |
| B9 | The Enter key handler ignores Mochila | l.5068–5071 | Possible double actions |
| B10 | `<html lang="es">` on an English interface | l.2 | Screen readers read English with a Spanish voice |
| B11 | Node logic is hand-unrolled | `renderMap` l.2448–2988, guards l.3217–3300, `completeLesson` l.4298–4655, `scrollToActiveBubble` l.4969–5011, `defaultStateKeys`, `resetBuhisimoData`, checkpoint pools, boss cards | Each new unit means about 12 edits and the §12 checklist, with high regression risk |
| B12 | Data is copied by hand | `VOCAB_DATABASE`, `GAME_WORDS_*`, `MIX_*` and `OBJECTS` all copy CSV words | They drift apart (the `nascimiento`/`nacimiento` split already happened) |
| B13 | Silent failure | Unknown words are dropped by `.filter(w => VOCAB_DATABASE[w])` | A rule violation shows up as a short lesson, not an error |
| B14 | Inline styles in JS | 145 `.style` uses despite the banner forbidding them | Theming and mobile fixes are harder |

**Performance** is not the problem. 200 KB served with gzip from GitHub Pages loads quickly. The game loops use `setInterval` at 30 fps and don't pause when the tab is hidden, which is minor. The Google Fonts `@import` blocks rendering and fails offline. **Maintainability** is the real cost.

### 2.5 Mobile and accessibility

- **Phones:** below 768 px the sidebar (profile, controls, **Reset Data**) stacks *above* the map. Students scroll past a destructive button every time. The canvas games run at a fixed 400 px with one move per tap on a d-pad, and they're blurry on high-DPI screens. Tooltips that need hover don't exist on touch. On Chromebooks, typing `á é í ó ú ñ ¿ ¡` is hard, and v1 has no accent bar.
- **Accessibility:** the feedback banner has no `aria-live`. Lock messages use `alert()`. Correct and wrong are shown by colour alone. Emoji buttons have no labels. The canvas games have no non-canvas alternative. Hover-only information. No `prefers-reduced-motion` support. Wrong page `lang`.
- **Storage:** everything is in one `localStorage['buhisimo_progress']` key. Safari/iOS can delete script-written storage for sites not visited in 7 days (unless the site is installed to the home screen). Managed Chromebooks may wipe it. The welcome modal requires a **first and last name** and says it can't be changed, and the name is then embedded in every backup key.

### 2.6 Issues in `vocabulary_database.csv`

These are for you to decide on, since the CSV is yours:

- Typos: `el lugar de nascimiento` → `nacimiento`; `los rasgos fisicos` → `físicos`.
- Duplicates: `la edad` (1.3 and 2.2). Coming in 3.4–3.6: `famoso/a` (1.1 and 3.5), `el estilo` (2.4 and 3.6), `simpático/a` (2.6 and 3.6), `talentoso/a` (3.5 and 3.6). Same spelling with a new meaning: `'me gusta'` (a like on social media) versus `me gusta` (I like), and `el/la famoso/a` (noun) versus `famoso/a` (adjective). See §5.7.
- Inconsistent conventions: `el/la amigo/a` is one row, but `el gato` and `la gata` are two rows. 2.4 lists only masculine forms (`castaño`, `corto`, `liso`) and plural colours (`azules`, `verdes`, `marrones`) that duplicate 1.5 colours. `negro` (2.4) sits alongside `negro/a` (1.5).
- The meaning of the `capitals` column: it's effectively **"case matters"**. Countries must be capitalised, while `lunes`/`enero`/`hispanohablante` must *not* be (a common English-speaker error). Worth writing down in a README, because the name suggests the opposite for days and months.
- `el uno` / `el primero` both mean "the first". The gloss would be clearer as "the first (of the month)".

---

## 3. Design principles for v2

1. **The CSV is the only source of vocabulary.** Everything else is generated from it or checked against it.
2. **Rules are enforced by the build, not by memory.** A violation fails the build with the file and line number.
3. **One new thing at a time.** Show → check → use, with the scaffolding faded step by step.
4. **Every interaction is a retrieval that gets recorded.** The scheduler decides what comes next.
5. **The app supports your teaching and doesn't compete with it.** It follows your sequence, prepares students for your lessons, and later feeds your retrieval starters.
6. **No shame.** Mistakes are information. Struggling students get more support, not fewer hearts.
7. **One teacher can maintain it.** Vanilla JS modules, data files, a single build script, and no framework.

---

## 4. Learning design for v2

### 4.1 Learning items, forms and stages

- A **lexeme** is one meaning-bearing CSV row (or one sense of it). Its ID is derived from the row (§5.2).
- A **form** is a surface string that belongs to a lexeme: gender and number variants (`roja`, `rojos`), optional parts (`hace calor` / `hace mucho calor`), and verb forms (`me llamo` from `llamarse`). Forms are listed in `forms.csv` and checked by a person. Nothing is inflected at runtime, following your §8.2 principle.
- A **pattern** is a sentence frame taught as a unit, for example *Cuando/Si + weather, + opinion + activity*. A pattern is also an item, with its own stage and box.

Each item moves up a **stage ladder**. The stage decides which exercise types it's eligible for:

| Stage | Name | Example exercises | Rosenshine link |
|---|---|---|---|
| 0 | Presented | Intro card: picture, audio, Spanish, English, an example sentence. No question. | Present new material in small steps; give models |
| 1 | Recognised | Spanish → meaning (MC), listen → picture, match pairs | Check understanding with a high success rate |
| 2 | Guided recall | Meaning → choose Spanish, word bank, fill the gap from a choice | Guided practice and scaffolds |
| 3 | Free recall | Type from English or a picture, dictation, say it | Independent practice |
| 4 | Used | Build or type a whole sentence, answer story questions, speak a sentence | Use in context |

Practice targets the item's current stage, or one stage higher (a desirable difficulty). A correct first try at the item's stage moves it up a stage. A wrong answer moves it down one stage (never to 0), and it is re-asked 3–4 items later in an easier form.

### 4.2 Scheduler (spaced repetition)

Use a simple **Leitner box** system. It's easy to explain to students and to you, and it's robust.

```
Item record: { id, stage 0–4, box 0–6, due (date), reps, lapses, lastSeen,
               firstTry: {c, w}, lastWrongAt, hintsUsed }
Interval for each box (days): [0 (same session), 1, 2, 4, 8, 16, 32]

correct on first try, no hint: box = min(box+1, 6); due = today + interval[box]
correct after hint, or "nearly": box unchanged; due = today + 1
wrong:                          lapses++; box = max(1, box-2); due = today;
                                re-ask in this session after 3 other items
"Long-term memory" = box >= 4 (survived an 8-day gap)
```

- **Daily Repaso** (a button on the map, outside the path) gives up to 15 due items. Overdue items and items with many lapses come first. Items are **interleaved across units**, using the exercise type for each item's stage.
- Due items are capped at 20 a day so a returning student isn't hit with an avalanche.
- The timestamp math is pure and tested. `today` uses local midnight. Fixing B1 means *never mutating stored values on read*.

### 4.3 Lesson types (nodes) and how a session is built

| Node type | New items | Length | Composition |
|---|---|---|---|
| **Learn** | 4–6 (never more than 8) | 5–7 min | For each new item in order: intro (stage 0) → immediate recognition (stage 1) → recognition again after 2 other items. Then guided recall (stage 2) of the whole set. Plus 20–30% due items from earlier units, but only those already at stage 2 or above. |
| **Practise** | 0 | 5–7 min | 12–15 exercises on the node's items plus due review, at stage or stage+1. Sentence patterns are faded: model → gap-fill → word bank → type. |
| **Story / Dialogue** | 0 | 4–6 min | A read-and-listen story with comprehension checks between lines (§6.3) |
| **Listen (podcast)** | 0 | 3–5 min | A Radio Búho episode (§6.4) |
| **Speak** | 0 | 3–5 min | Shadowing and prompted production (§6.5) |
| **Game** | 0 | 3–5 min | An engine fed by the scheduler. It reports a result for each item (§6.6). |
| **Unit check (boss)** | 0 | 8–10 min | A mastery check with no hearts (§6.7) |
| **Repaso** (warm-up) | 0 | 3–5 min | Generated at the start of each unit: due items, plus the **prerequisites this unit's sentences rely on**. In 3.4 that means the opinion verbs (1.5) and activities (3.1). |

**Keeping success around 80%** (Rosenshine): if the rolling first-try accuracy in a session drops below 70%, the composer uses easier stages and inserts a short re-presentation card. If it goes above 95%, it raises the stage.

### 4.4 Mastery and crowns

Crowns stay, but each one means something real:

| Crown | Meaning |
|---|---|
| 👑 1 | Completed. Every item in the node was answered correctly at least once. |
| 👑 2 | Mastered. Every item reached stage 3 or above, *and* the last run had at least 80% first-try accuracy. |
| 👑 3 (gold) | Retained. The node's items were answered correctly again **at least 3 days later**, through Daily Repaso. This rewards spacing. |

The next node unlocks at **crown 1**, so nobody gets stuck. The unit check is recommended once the unit's Learn nodes are at crown 2, but it's never locked.

### 4.5 Feedback, errors and grading

- **Immediate feedback that explains the error.** "You chose *hace sol* (it's sunny). *Hace viento* = it's windy" is followed by the audio and the picture. For a confusable pair, a contrast card is added once, for example *hace frío* vs *el frío*, or *hay* (there is) vs *hay niebla* (it's foggy).
- **Port `grade()` from `index.html`, with these fixes.** It returns `correct | nearly | wrong`, plus a reason:
  - Missing accents count as **nearly**: the answer is accepted and the correct accents are shown. The item still moves up, but the box doesn't advance.
  - `ñ`/`n` mistakes are also *nearly*, with the explicit note "ñ is a different letter: año ≠ ano".
  - Case is only checked when the CSV `capitals` column says yes (countries; *lowercase* days and months).
  - Articles are optional at stages 1–2 and **required at stage 3 and above for nouns**, because gender is part of knowing the word.
  - Optional parenthesised parts are accepted with or without them: `llueve` or `llueve mucho` for "it's raining (a lot)".
  - For sentences, the diff shows the specific token that was wrong.
- **A hint ladder** replaces "I forgot": 1) the first letter, 2) the word length or the tiles, 3) reveal. Using a reveal counts as wrong for scheduling, but the student never sees a penalty.
- **An accent bar** (`á é í ó ú ñ ¿ ¡`) above every typing field.

### 4.6 Students who are behind: support without shame

- **Mirror your sequence.** The path follows *your* teaching order, which unit files set (it can differ from the CSV `Section`, as 1.1 already does by pulling greetings forward from 1.2). `class.json` (static, edited by you) records the unit and lesson each class is on. The map shows a small owl flag: "Your class is here".
- **Catch-up route.** If a student is more than one unit behind the class marker, the home screen offers "Catch up to your class". It covers only the **Learn** nodes and the core-word practice of the units they missed. Unit files tag 8–12 core items per unit: the ones you'll use in your next lessons. Stories, games and podcasts stay available but optional. The goal is to *take part in Monday's lesson*, not to finish everything.
- **Preview** (your decision, see §14). Letting students who are behind see the Learn node for *next* week's core words is pre-teaching. It reduces working-memory load in class.
- **No public comparison.** No leaderboards, no hearts in practice, no "failed" screens. The unit check says "Not yet: let's practise these 4 words" and builds that practice straight away.
- **Adjustable support:** slower audio (playbackRate 0.75), a bigger font, and a "show English" toggle during Learn only.

### 4.7 How it fits with explicit teaching

| In class (you) | At home (Buhísimo) |
|---|---|
| I do: model with choral response | Unit opener: an optional 60–90 s AI video of you presenting the words. Intro cards repeat the same model sentences. |
| We do: mini-whiteboards, cold calling | Learn and Practise nodes with scaffolds that fade |
| You do: independent writing and speaking | Stage 3–4 exercises, Speak node, unit check |
| Daily, weekly and monthly review starters | Daily Repaso. Later, the app's weak-word data feeds your starters (§9). |

**Extra that costs little:** a **"Projector mode"** that uses the same validated content to build a 5-question retrieval starter. It draws from last lesson, last week and last month, shows one question at a time with a timer, then reveals the answer. It's useful for mini-whiteboards and needs no student data.

---

## 5. Making the vocabulary rules enforceable

### 5.1 Data files (all in `data/`, all plain CSV you can edit in a spreadsheet)

| File | Owner | Purpose |
|---|---|---|
| `vocabulary_database.csv` | Juan | Unchanged columns: `Spanish, English, Section, Source, capitals`. The build reads the existing file at the repo root, so there's still one source of truth for `index.html` and v2. |
| `forms.csv` | Claude drafts it, Juan approves | `lexeme_id, form, features, gloss, needs_intro, approved_on`. The build **proposes** default forms (expanding `(…)`, splitting `o/a` and `el/la x/y`) into `build/forms.proposed.csv`. You copy approved rows across. |
| `helpers.csv` | Juan | `form, gloss, approved_by, approved_on, introduced_in, note`. This is your §6.1 table as data. A helper without `approved_on` makes the build fail. |
| `names.csv` | Juan | Approved proper nouns that aren't in the CSV: story characters (for example `Lucía`, `Mateo`) and any extra places. Each has `introduced_in`. |
| `class.json` | Juan | `{ "7B": { "unit": "3.4", "node": "n5" } }`. Phase 1, static. |

### 5.2 Stable IDs

- `lexeme_id = <section number>/<slug>`. The slug is the Spanish with parenthesised parts and `¿?¡!'…` removed, accents folded and spaces turned into `-`. Examples: `3.4/hace-calor`, `1.5/me-gusta`, `3.6/me-gusta` (the "like" sense, kept separate by its section number).
- `build/ids.lock.json` records every ID ever published. If a CSV edit changes an ID (for example fixing `nascimiento`), the build stops and asks for one line in `data/id_aliases.csv` (`old_id,new_id`). Students' progress then follows the word.

### 5.3 Tokeniser (one module, used by both the build and the app)

1. NFC-normalise the text, lowercase it (keeping a copy for case checks), and strip `¡!¿?.,;:"“”'‘’…()—` and emoji. Keep the accents, because `si` and `sí` are different words.
2. Find matches using **greedy longest-match** against the dictionary of all approved forms, helpers and names (phrases up to 6 tokens). For example, `¿Qué tiempo hace en Chile?` becomes [`¿qué tiempo hace`] [`en`] [`chile`]. `hay niebla` matches the 3.4 lexeme before `hay`.
3. Digits are allowed and aren't Spanish words. Any token left unmatched is a **Rule 1 error**.

### 5.4 Validator checks (`node tools/validate.mjs`; it also runs inside `build.mjs`)

| Check | Severity |
|---|---|
| Every Spanish string (intro examples, sentences, story lines, podcast scripts, game data, distractor lists, boss items, Spanish UI labels) tokenises completely | **Error** (Rule 1) |
| Walking the path in order, every lexeme, form, helper and name used in node *N* was introduced by a Learn node before *N*. Inside a Learn node, an item counts as introduced from the step after its intro card. | **Error** (Rule 2) |
| Forms with `needs_intro` (`me llamo`, `tengo`) have their own intro card before they're used | Error |
| Every helper and name in use has `approved_on` and is introduced where `helpers.csv` says | Error |
| Generated-sentence engines: **every possible output is listed** and each one is validated (§5.6) | Error |
| A CSV row isn't taught anywhere on the path | Warning, listed per unit |
| A duplicate row in another section isn't declared `recycled` or `newSense` in its unit file | Error (§5.7) |
| An item is taught in a different unit from its CSV `Section` | Info (allowed: your sequence comes first) |
| A Spanish string has no audio file, or its audio is stale | Warning (TTS is the fallback) |

Output: `build/reports/validation.md`, with each error naming the unit file and line. For example: *"3.4.yaml:42 story s1 line 6 — token `mucho` in 'hace mucho frío': no form 'hace mucho frío' for lexeme 3.4/hace-frio"*. The report also contains a per-unit list of helpers used and a coverage table.

**Enforcement:** a GitHub Actions workflow runs the build on every push and **only deploys to Pages if validation passes**. Locally, `npm run check` gives the same report, and an optional git pre-commit hook can run it too.

### 5.5 Runtime guard

- At build time, every node gets a `known` set (cumulative lexeme IDs). The runtime chooses **distractors, tiles and generated items only from `known`**, so v1's whole-database distractor leak becomes impossible by design.
- In development mode (`?dev=1`), every rendered Spanish string goes through `assertKnown(text, nodeId)`, which uses the same tokeniser. A violation shows a red banner. In production, violations are recorded in a hidden debug panel.

### 5.6 Generated sentences

This generalises the 1.6 mix engine. Each generator is declared as **slot tables plus templates** in the unit file. Its slot values must be lexeme or form IDs, not free text. At build time the engine **lists every combination** (2.1–3.6 surfaces stay in the low thousands), validates each one, and writes `build/reports/generated-<unit>.txt` for you to skim. A **plausibility table** can rule combinations out, for example `nieva` with `Cuba`. Excluded combinations are listed, not silently skipped, as in your §8.2 "Guard".

### 5.7 Duplicates across units

| Case | Example | Rule |
|---|---|---|
| Same Spanish, same meaning, later unit | `famoso/a` 1.1 and 3.5; `simpático/a` 2.6 and 3.6; `el estilo` 2.4 and 3.6; `talentoso/a` 3.5 and 3.6; `la edad` 1.3 and 2.2 | **Recycled.** One lexeme (the first one taught). Glosses are merged ("nice" + "kind, nice"). The later unit lists it under `recycled:`. It gets a quick "You know this!" retrieval card instead of an intro, and it counts towards the later unit's check. Keep both CSV rows so the CSV still mirrors the textbook. |
| Same spelling, new meaning | `'me gusta'` (a like) vs `me gusta` (I like); `el/la famoso/a` (a famous person) vs `famoso/a` | **New sense.** A separate lexeme, declared under `newSense:` with `contrastWith`. Its intro card shows both meanings side by side. |
| Word known from inside a phrase | `Internet` (3.5) was already seen in `navegar por Internet` (3.1) | A new standalone lexeme. Its intro card points back: "You've seen this in *navegar por Internet*." |

### 5.8 Helper words: what exists, what was used without approval, what's proposed

| Status | Words | Action |
|---|---|---|
| Already approved (rules §6.1) | `él, ella, es, tú, eres` (1.1); `un, una, mi, en, la mochila` (1.6) | Move to `helpers.csv`. **Move `un`/`una` to 1.1** if the 1.1 boss keeps "un país". |
| Used in v1 without approval | `soy`, `de`, `gracias`, `muy`, `tu`, standalone `el`/`la`, `la lengua`, `Señor`, `mañana`, `Carlos` | Decide each one (§14 Q3). My recommendation: approve `soy` and `tengo/tienes/tiene` as *forms* of `ser`/`tener` (`needs_intro`). Approve `de`, `tu`, `el`, `la`, `los`, `las` as helpers. Drop `mañana`, `Señor` and `Carlos`, or use `names.csv`. Add `la lengua` to the CSV or remove it. Decide on `gracias` and `muy`. |
| Verb forms not in the CSV | `me llamo / te llamas / se llama` (`llamarse`), `mido` (already in the CSV row `medir (mido)`) | Forms with `needs_intro`. They get an intro card. |
| Likely needed for 3.5–3.6 | `muy` (muy popular), `su` (3.6 title: "Su foto…"), `tiene` (form of tener), `muchos/muchas` (form of `mucho`, which already appears in the CSV as "(mucho)") | Propose when 3.5/3.6 are authored. **The 3.4 exemplar below needs no new helpers.** |

---

## 6. Exercise and game types

### 6.1 Verdicts on the existing games and challenges

| Item | What it does | Verdict | Why |
|---|---|---|---|
| **Frogger / Cruce del Río** | Cross the river by stepping on Spanish chunks in sentence order | **Remake** as "Sentence Bridge" | Ordering chunks into a sentence is valuable (syntax and word order). The dodging and d-pad add irrelevant load, and the sentence lists include nonsense and `es de`. Remake: tap chunks in order on a static bridge, with an optional gentle timer, fed by validated sentences and patterns. |
| **Space Invaders** | English cue, shoot the Spanish word | **Keep the engine, rewire it** | Fine for building speed with numbers and calendar words. v2 changes: an **audio cue** mode (hear `veintisiete`, shoot `27`), items only at stage ≥2 from the scheduler, per-item results reported, tap-to-move controls, and `requestAnimationFrame` with pause on hide. |
| **Globo Pop** | Aim a bow at the balloon with the right word | **Drop** | Same choice as Space Invaders, but aiming geometry costs about 5–10 s per retrieval. Merge it into the Space engine as a reskin if students love it. |
| **Owl's Maze** | Steer the owl to the right scroll | **Drop** | The lowest retrieval density of all (most of the time is navigation), and it's awkward on phones. |
| **Mochila** | Read and hear a request, then choose the matching picture tile | **Keep and generalise** into a "Request" engine | Spanish → meaning with no English, and it trains agreement. Fixes needed: English instruction text (or validated Spanish), unambiguous **SVG icons** instead of 🧽 (eraser), 🔩 (sharpener) and 🧰 (pencil case), and per-item reporting. Reuse it for pets (2.3) and the weather map (3.4). |
| **Mix engine (`b29`)** | Generated recombination sentences | **Keep and generalise** (§5.6) | Already the right pattern |
| **Animal Colour** (`index.html`) | Coloured animal picture → phrase | **Port** for 2.3 | Picture plus agreement. Move its inflection to `forms.csv`, because `colorForm` builds forms at runtime. |
| **Retrato Robot** (`index.html`) | Read a description, pick the suspect from a lineup | **Port** for 2.4/2.5. A star activity. | Excellent multi-feature comprehension. Its sentences use `Soy`, `Tengo`, `tiene`, `su`, `el pelo` and `los ojos`, which must become approved forms or helpers. Use with fictional suspects only (`gordo/a` and `feo/a` are sensitive). |
| **Verb Conjugation** (`index.html`) | Conjugation tables for ser/estar/tener/llamarse including vosotros/ustedes | **Keep in the reviewer, not in Buhísimo** | Goes well beyond the CSV (`estar`, `vosotros`). A pruned version (yo/tú/él forms of `ser`/`tener` that are introduced) can become Stage 3 drills in 2.4/2.5. |
| **Checkpoint + boss** | 15 random questions, 4 hearts, last-chance boss | **Remake** as the unit check (§6.7) | Keep the idea of a culminating challenge. Remove the shame and the randomness. |

Games stop being consumable. They're always playable once their items are introduced, and they count as practice: each item's result goes to the scheduler.

### 6.2 Core exercise catalogue

Effort: **S** about 2–4 h, **M** about 4–8 h, **L** 1–3 days (with AI help, including testing on a phone).

| Type | Stage | How it works | Rule enforcement | Cognitive purpose | Effort |
|---|---|---|---|---|---|
| Intro card | 0 | Picture, audio (auto-play once, tap to replay), Spanish, English, 1 example sentence. "Got it" button. | The example sentence is validated against the node's `known` set plus the item | A worked example, dual coding | S |
| Listen → pick picture | 1 | Hear the word, choose from 3–4 icons | Distractors come from `known` | Sound–meaning link with no English | S |
| Spanish → meaning | 1 | Read or hear Spanish, choose the English. **No hover glosses.** | `known` | Recognition | S (port) |
| Match pairs | 1 | 4–5 pairs. The timed variant ("Lightning") only uses items in box 3 or above. | `known` | Recognition; automaticity when timed | S (port) |
| Meaning → Spanish | 2 | English or a picture, choose the Spanish | `known` | Guided recall | S |
| Gap fill (choice) | 2 | A sentence with one gap and 3 options | The sentence and options are validated | Recall in context | S |
| Word bank | 2–4 | Build a sentence from tiles | Tiles come from the sentence plus `known` distractors | Syntax and word order | S (port, fix tile rendering) |
| Categorise | 2 | Sort into buckets (*hace / hay / verb*; masculine / feminine) | Items are from `known` | Noticing patterns, contrast | M |
| Type it | 3 | English or a picture → type Spanish, with the accent bar and `grade()` | — | Free recall | S (port) |
| Dictation | 3 | Hear → type (normal speed, then slow) | Audio text is validated | Sound → spelling | S (port from `index.html`) |
| Odd one out / true–false against a picture | 1–2 | "En Chile nieva" next to a weather-map picture | Validated | Quick comprehension | S |
| Sentence translation | 4 | Type a whole sentence from English | Accepted answers are validated. Use alternates for word-order variants. | Production | M (diff feedback) |
| Story | 1–4 | §6.3 | Every line validated | Reading and listening in context | L (once), then S per story |
| Podcast | 1–3 | §6.4 | Script validated | Extended listening | M (once), then S per episode |
| Speak | 3–4 | §6.5 | Prompts validated | Pronunciation, oral production | M |
| Request game (Mochila engine) | 1–2 | Hear or read a request, tap the matching picture(s) | Request text comes from generators | Comprehension under light time pressure | M (generalise) |
| Sentence Bridge | 2–4 | Tap chunks in order | Chunks are validated | Syntax | M |
| Number Invaders | 2–3 | Audio cue → shoot the digits | Numbers are from `known` | Automaticity | M (rewire) |
| Map / calendar tap | 1–2 | Hear "En Perú llueve", tap the country; or hear a date, tap the calendar | Validated | Comprehension, cultural geography | M |

### 6.3 Stories and dialogues (Duolingo "Stories" style)

- **Format:** 8–14 lines between two or three recurring characters (names from `names.csv`). Each line has audio, and every word can be tapped for a gloss. That's fine here because stories test *comprehension of the whole*, not recall of single words. After every 2–4 lines there is an inline check: a comprehension MC in English, "tap the Spanish that means …", "what will she say next?" (choose the line), or "put these lines in order".
- **Authoring:** YAML in the unit file (see §10.2). Lines are validated like any other text. Claude can draft them under the constraint "only these lexeme IDs plus these helpers", the validator proves the result, and you approve the meaning and tone.
- **Audio:** two fixed voices, one per character, pre-generated (§7). Normal speed, plus a 0.75× playback control.
- **Why it matters:** this is where the words become *language*. Students meet the unit's words recombined with earlier units, which is interleaving and elaboration, in a context that's easy to understand.

### 6.4 Listening "podcast" lessons (Radio Búho)

- **What it is:** a 45–120 second episode for each unit, hosted by Búho (the owl): a weather report (3.4), a fan vlog (3.5), a family introduction (2.2). The script uses only known words. It **can be denser than a story**, because it comes later in the unit.
- **Flow:** (1) pre-listen: 3 key-word recognition items; (2) listen once with no text, filling a **task grid** (for example countries × days with weather icons dragged in); (3) listen again with the transcript, tapping words for glosses; (4) 3–5 detail questions; (5) optionally, "shadow one sentence" (links to Speak).
- **Build:** one audio file per episode plus per-line timestamps (generated alongside the audio, or measured by hand). This lets the transcript highlight the current line.

### 6.5 Speaking

| Mode | How | Privacy | Recommendation |
|---|---|---|---|
| **Shadowing** (default) | Play the model, then record with `MediaRecorder`, play back side by side, and self-rate ("Got it / Not yet") | Audio **stays in memory on the device** and is discarded at the end of the node. Nothing is uploaded. | **Default for everyone.** Self-rating feeds the scheduler at a low weight. |
| **Prompted production** | A picture prompt (rain icon + book), then the student says "Cuando llueve, me gusta leer libros". Recorded, followed by the model, then a self-check against the shown answer. | Same as above | The Stage 4 speaking task |
| **Speech recognition (optional)** | `webkitSpeechRecognition`, with lenient token matching against the expected sentence | In Chrome, recognition traditionally sends audio to Google's servers. Firefox doesn't support it. Results are unreliable for beginners' accents and short words, and it "autocorrects" to plausible words. Check Chrome's current on-device option before relying on it. | **Off by default.** Only switch it on with school and parent awareness, **never use it to block progress**, and show "the computer heard: …" as a hint only. |

Mic access may be blocked on managed Chromebooks, so Speak nodes must be skippable without penalty.

### 6.6 Games in v2 (one shared interface)

Every game module exports `{ id, minStage, build(items, ctx), mount(el, api) }`. It receives items **from the scheduler** (only `known` items at stage `minStage` or above), and calls `api.report({itemId, correct, ms})` for each answer. Games use `requestAnimationFrame`, pause on `visibilitychange`, support tap, keyboard and pointer, and offer a "calm mode" with no timer.

### 6.7 Unit checks ("bosses")

- **Section check** (end of each section, for example 3.4): 12–15 items, every item in the section at least once, mostly stage 3–4, plus 1 listening task and 2–3 sentence productions. **No hearts.** Pass at ≥80% first-try accuracy, giving a "Section mastered" badge. Below that, it shows "Not yet" and immediately offers a 5-minute targeted practice of the missed items, after which the student can retry.
- **Unit boss** (end of 1.6, 2.6 and 3.6): cumulative across the whole textbook unit and themed (for example 3.6: "Búho's social media profile"). It always includes production: build or type 4–5 sentences that combine at least 3 sections.

---

## 7. Audio pipeline

| Choice | Recommendation |
|---|---|
| Source | **Pre-generated files** for every taught form, example sentence, story line and podcast. Browser TTS stays as a fallback for anything missing, and dev mode warns when it's used. |
| Generator | Your AI audio tool, or a neural TTS API (Google, Azure, ElevenLabs). Run it from `tools/gen-audio.mjs` with your API key in an environment variable. **The key never goes into the client.** |
| Voices | One **primary model voice** for words and intro cards, used consistently everywhere. Two character voices for stories. Podcasts can introduce a second Spanish variety for exposure. |
| Accent | **Open question** (§14). Claro's vocabulary leans Peninsular (`el móvil`, `el bolígrafo`, `la goma`). Recommendation: the primary voice should match the variety *you* model in class, so home and class sound the same. Add the other variety in podcasts later, labelled ("Lucía is from Chile"). |
| Input text | **Feed forms, never raw CSV strings.** TTS reads "rojo/a" as "rojo barra a", "(mucho)" unpredictably and "hay…" with an odd pause. `forms.csv` provides clean text. |
| File naming | Words: `audio/w/<lexeme_id with / → __>__<form-slug>.mp3`, for example `audio/w/3.4__hace-calor__hace-mucho-calor.mp3`. Sentences and story lines: `audio/s/<first 10 hex of sha1(normalised text + voice)>.mp3`. A text edit gives a new hash, so stale audio is detected automatically. |
| Manifest | `build/audio-manifest.csv`: `file, text, voice, kind, used_in, status (missing/ok/stale), reviewed_by, reviewed_on`. The build fills `text/voice/used_in/status`. |
| Review | `tools/audio-review.html`, a local page: play each clip next to its text, press ✓ / ✗ / note, and download `audio-review.csv`, which is merged into the manifest. Things to check: stress (`sacapuntas`, `pronóstico`), `ll`/`y`, `si` vs `sí`, the article included, natural intonation in questions (`¿Qué tiempo hace?`). Ideally a native-speaker colleague does a second pass. |
| Format and size | MP3 mono at 48–64 kbps. A word is about 6–10 KB, a sentence about 20–30 KB. The service worker caches audio **per unit, on demand**, with a "Download this unit for offline" button. |
| Slow speed | `audio.playbackRate = 0.75` (pitch preserved). No second files needed. |

---

## 8. Motivation without gimmicks

| Mechanic | v2 decision | Reason |
|---|---|---|
| Owl (Búho) | **Keep as the guide, not a mascot that nags.** Búho presents worked examples, hosts Radio Búho and runs the unit bosses. Feedback is short and specific ("Watch the accent: frío"). | A consistent character lowers novelty load and gives the app a voice |
| XP | Keep it, but **XP = correct first-try retrievals**, with a bonus for Daily Repaso | Rewards effortful retrieval and spacing, not clicking through |
| Streak | Replace with a **weekly goal** (for example 3 sessions of about 10 min across the week) with a ring. Missing a day loses nothing. | Spacing across days matters, and daily-streak anxiety and loss aversion don't help struggling 12-year-olds |
| Visible learning | "**Words in long-term memory: 142**" (box ≥4) and a per-unit mastery bar | Makes learning progress concrete and honest |
| Crowns | Completed / mastered / retained (§4.4) | Ties the reward to what you value |
| Games | Always available once their items are introduced; they count as practice | Removes rationing and frustration |
| Leaderboards | **None** in v2. Later, an optional cooperative class goal ("7B: 1,200 words reviewed this week"). | No public comparison for students who are behind |
| Cosmetics | Optional and low priority: owl outfits earned through *retained* crowns | 12–13-year-olds like a little customisation, but it must not drive behaviour |

---

## 9. Teacher side (design now, build later)

**Phase 1 (no backend):** `class.json` drives the class marker and catch-up route. Students optionally type a **class code** (for example `7B`). No identity is involved and nothing leaves the device. Projector mode (§4.7) gives you starters from content, not from student data.

**Later phase (optional sync):**

- **Identity without accounts:** you print a random **practice code** for each student (for example `OWL-7K3Q`). The code→name list lives **only in your own spreadsheet**, never on the server. Students enter class code + practice code once. They can use the app with no code at all, fully local.
- **Data collected (minimum):** `class, practiceCode, date, itemId, attempts, firstTryCorrect, minutes`. These are daily aggregates, not raw keystrokes, audio or names.
- **Transport:** progress events are queued in IndexedDB and POSTed in batches when a node is completed, retrying when the device is back online.
- **Backend options:** (a) **Google Apps Script web app + a Google Sheet in your school Workspace**. This is the simplest option and keeps the data in the school's tenancy, if the school allows it. (b) Cloudflare Worker + D1, or Supabase, which are third-party services that need a privacy assessment. Recommendation: **(a)**, subject to approval.
- **Teacher view:** a separate `teacher.html` page that reads the Sheet. It shows who practised this week (by code, mapped to names locally in your browser from your CSV) and the **class's weakest items**. It exports the top 10 weak items straight into Projector mode as tomorrow's retrieval starter.
- **Privacy:** check with your school's privacy officer before collecting anything. Government schools in Victoria fall under the state's privacy framework and Department policy. Independent and Catholic schools fall under the Privacy Act 1988 and the APPs. Either way, expect a privacy assessment and parent notice for a new tool. Australia's Children's Online Privacy Code is also being developed. *Not verified: confirm locally.* Data minimisation, pseudonymous codes, a retention limit (delete at the end of the year) and a "delete my data" request by code all make approval easier.

**What Phase 1 must already do so this can be added later:** stable item IDs (§5.2); an append-only **attempt log** in IndexedDB with `{itemId, ts, correct, firstTry, exerciseType, nodeId}`; a `sync.js` interface with a no-op implementation; and no names in the progress data (only an optional local nickname).

---

## 10. Technical plan

### 10.1 Repository structure

Live in the same repo and therefore the same GitHub Pages **origin**, so v2 can read v1's localStorage for migration. localStorage is per origin, not per path.

```
spanish_app/
  vocabulary_database.csv          ← unchanged master (also used by index.html)
  index.html, buhisimo.html        ← v1 untouched during the transition
  buhisimo2/
    index.html                     app shell (small)
    manifest.webmanifest, sw.js    PWA
    css/tokens.css, app.css
    js/
      main.js                      boot, hash router (#/map, #/node/3.4-n5, #/review)
      content.js                   loads build/content.json (+ per-unit chunks)
      tokenise.js                  shared with tools/ (Rule 1/2 matching)
      engine/scheduler.js          Leitner boxes, due queue (pure, tested)
      engine/composer.js           builds sessions per node type
      engine/grade.js              port of index.html grade() + fixes
      engine/progress.js           localStorage summary + IndexedDB attempt log, migrations, export/import
      engine/sync.js               no-op now; Apps Script later
      audio.js                     file playback, TTS fallback, playbackRate
      exercises/*.js               one module per exercise type (common interface)
      games/*.js                   request, bridge, invaders, maptap
      ui/map.js, lesson.js, story.js, podcast.js, speak.js, projector.js
    data/forms.csv, helpers.csv, names.csv, id_aliases.csv, class.json
    content/units/1.1.yaml … 3.6.yaml   (missing units are auto-generated)
    content/generators/*.yaml           slot tables + templates
    audio/w/…, audio/s/…
    tools/build.mjs, validate.mjs, gen-audio.mjs, audio-review.html
    build/content.json, reports/       (generated)
    tests/*.test.mjs                   node --test: tokeniser, validator, scheduler, grade, migration
  .github/workflows/pages.yml          build → validate → deploy only if green
```

**Stack:** vanilla ES modules with no bundler (GitHub Pages serves modules as they are). The build uses Node 20+ with **one dependency** (`yaml`). No framework: the UI is a handful of screens, and keeping one language and no toolchain means you (with Claude) can maintain it.

### 10.2 Unit file schema (example excerpt, 3.4)

```yaml
unit: "3.4"
title: "¡Brrr! ¡Hace frío!"          # validated: tokens hace, frío -> form of 3.4/hace-frio; "brrr" is listed in names.csv as an interjection, or drop it
subtitle_en: "Talk about the weather and what you do in it"
core: [3.4/que-tiempo-hace, 3.4/hace-calor, 3.4/hace-frio, 3.4/hace-sol, 3.4/llueve, 3.4/nieva, 3.4/cuando, 3.4/si]
recycled: []                          # none in 3.4
prereqs: [1.5/me-gusta, 1.5/no-me-gusta, 1.5/me-encanta, 1.5/prefiero, 1.5/odio, 1.5/detesto,
          3.1/leer-libros, 3.1/ver-la-tele, 3.1/practicar-deportes, 3.1/descansar-en-casa,
          3.1/salir-con-mis-amigos, 3.1/jugar-videojuegos, 3.1/escuchar-musica]
nodes:
  - id: n2
    type: learn
    title_en: "What's the weather like?"
    items:
      - id: 3.4/que-tiempo-hace
        icon: weather-question
        example: "¿Qué tiempo hace? — Hace sol."      # hace sol is introduced later in this list → validator error unless reordered
      - id: 3.4/hace-sol
        icon: sun
        example: "Hace sol."
      # …
  - id: n8
    type: story
    title_en: "A video call to Chile"
    cast: { L: Lucía, M: Mateo }
    lines:
      - M: "¡Hola, Lucía! ¿Qué tal?"
      - L: "¡Hola, Mateo! Fatal. Hace frío."
      - check: { type: mc, q_en: "How is Lucía feeling?", options_en: ["awful", "great", "so-so"], answer: 0 }
```

(The comment on `n2` shows the kind of ordering mistake the validator catches inside a node.)

### 10.3 Exercise module interface

```js
export default {
  type: 'listen-pick', stage: 1,
  canBuild(item, ctx) { return !!item.icon && !!ctx.audioFor(item.formId); },
  build(item, ctx)   { /* distractors = ctx.pick(ctx.known, {sameCategory:true, n:3}) */ },
  mount(question, el, api) { /* render; api.submit({correct, firstTry, hints, ms}) */ }
};
```

The composer only needs `canBuild`, `build` and `stage`. Adding a new type means adding a file and registering it.

### 10.4 Storage, export and PWA

- **Summary state** goes in `localStorage['buhisimo.v2']`: per-item `{stage, box, due, reps, lapses}` plus per-node crowns and settings. That's about 50–80 KB for 600 items, and it's synchronous and simple. The **attempt log** goes in IndexedDB (pruned to 120 days).
- `navigator.storage.persist()` is requested after the first lesson. The app nudges students to **install to the home screen**, which mitigates iOS eviction.
- **Export/import** has two options: (1) download a `.json` file, or (2) a backup code using UTF-8-safe base64 (`TextEncoder`) of the summary only, about 10–20 KB, or a QR code for phone ↔ Chromebook. This fixes B4. Nothing in the export identifies the student unless they typed a nickname.
- The **service worker** caches the app shell and `content.json`, and fetches audio per unit on demand. Content is versioned, and the cache is busted using the build hash.

### 10.5 Mobile and accessibility requirements (acceptance criteria)

- Mobile-first: the map is the first screen, and settings sit behind a ⚙️ menu. Reset is hidden, double-confirmed and offers export first.
- Tap targets ≥44 px. A bottom action bar that stays clear of the virtual keyboard (`visualViewport`). No hover-only information.
- Page `lang="en"`. Every Spanish string is wrapped in `<span lang="es">`. Feedback goes in an `aria-live="polite"` region. Correct and wrong are shown by an icon and text, not colour alone. `prefers-reduced-motion` is respected. Every game has a calm, non-canvas alternative.
- Keyboard: 1–4 to choose an option, Enter to check or continue, Esc to quit with confirmation. The accent bar can be reached by keyboard.
- Tested on: an Android phone in Chrome, an iPhone in Safari, a Chromebook, and Windows with Edge.

### 10.6 Build and deploy

1. `npm run build` reads the CSV and data, parses the units (or generates them automatically), tokenises, validates, lists the generators, writes `content.json` and the reports, and updates the audio manifest.
2. `npm test` runs the tokeniser, validator, scheduler, grade and migration tests.
3. GitHub Actions (`pages.yml`) runs on every push: build, then test, then upload the Pages artifact, then deploy. **If validation fails, nothing deploys**, so the live site always obeys the two rules. You'll need to set the repo's Pages source to "GitHub Actions", which is a one-time change.

**Auto-units:** any section without a hand-written unit file is generated from the CSV. Rows are grouped in CSV order into Learn nodes of 5, followed by Practise, Repaso and a section check, using word-level exercises only. That is how Phase 1 reaches 3.6 quickly. Hand-authored files then replace the auto-units one at a time.

---

## 11. The path 1.1 → 3.6

### 11.1 Templates

**Standard section** (about 8–12 nodes, about 60–80 min of home practice per section):
`Repaso (prereqs + due) → Learn A → Learn B → Practise → Learn C → Patterns (sentences, faded) → Story → Game → Listen (from 1.3) → Speak → Section check`

**Consolidation section** (small sets such as 1.6): `Repaso → Learn (3 groups) → Request game → Mix (generated) → Section check`, plus the **Unit boss** at 1.6, 2.6 and 3.6.

### 11.2 Unit-by-unit outline

"Rows" is the number of CSV rows. Helpers and forms are only listed where they're new.

| Section | Rows | Learn groups (in order) | Patterns / sentences | Story / podcast | Game / activity | Notes and risks |
|---|---|---|---|---|---|---|
| **1.1** El español global | 24 (+4 greetings pulled forward from 1.2, as in v1) | Greetings (¡hola!, Buenos días, ¡Adiós!, ¿Qué tal?) · Countries A (España, Argentina, Chile, Colombia, Cuba, Perú) · "¿De dónde eres? / ¿De dónde es?" + `soy, de, eres, es, tú, él, ella` · Countries B + islands · Geography (el mapa, el país, el mundo, la capital, el destino, el monumento) + `un/una` · Adjectives (famoso/a, histórico/a, hispanohablante) | "Soy de Chile." "Ella es de Cuba." "Chile es un país hispanohablante." | Story: two students meet online | Map tap (hear "Soy de Perú", tap Perú) | Decide on `la lengua`. Introduce `un/una` here (helpers). |
| **1.2** ¿Qué tal? | 17 | Greetings 2 (Buenas tardes, ¡Hasta luego!, ¿Cómo estás?, ¿Y tú?) · Feelings (bien, mal, regular, fatal, fantástico/a, fenomenal) · Names (llamarse → me llamo, te llamas, se llama, ¿Cómo te llamas?) · Spelling (el alfabeto, escribir, ¿Cómo se escribe?) | "¿Qué tal? — Fatal. ¿Y tú?" "Me llamo Lucía." | Story: first day of school | Spelling dictation (letter names → type the name); Sentence Bridge | **Letter names** (a, be, ce…) need a decision: a helper set or a special "alphabet" dataset. `gracias`/`muy` decision. |
| **1.3** Mi carnet de identidad | 38 | Numbers 1–10 · 11–20 · 21–31 · ID nouns (el nombre, el apellido, la edad, el lugar de nacimiento, el carnet de identidad, el/la amigo/a) · ¿Cuántos años tienes? + `tengo/tienes/tiene … años` (forms) | "Tengo doce años." "Mi amiga se llama…" (needs `mi` early, so move it from 1.6) | Podcast: three teens introduce themselves, and the student fills in their ID cards | Number Invaders (audio → digits) | Fix the `nascimiento` typo. Avoid `uno`/`un` apocope in generators. |
| **1.4** ¡…y que cumplas muchos más! | 27 | Days · Months A · Months B · Calendar nouns (el año, el mes, la semana, la fecha, el cumpleaños, el primero/el uno) · ¿Cuándo es tu cumpleaños? + `mi, tu, el, de` | "Mi cumpleaños es el primero de junio." | Story: a birthday chat | Calendar tap (hear a date, tap it) | Interleave numbers 1–31 heavily. `capitals` = lowercase check. |
| **1.5** Mis preferencias | 26 | Colours A · Colours B (+ claro/oscuro, mi color favorito es…) · Opinions (me gusta (mucho), no me gusta (nada), me encanta, prefiero, odio, detesto) · Connectors (y, o, pero, también, además, sin embargo) | "Me encanta el azul, pero no me gusta nada el amarillo." | Podcast: Búho's favourite colours poll | Colour picture match; opinion categorise | Agreement forms come from `forms.csv`. Standalone `el` must be approved by 1.4. |
| **1.6** ¡Tod@s a clase! | 12 (+ `la mochila`, `un, una, mi, en` if not moved earlier) | As built: objects A · objects B · structure (hay…) | Mix engine T1–T5 (existing) | — | Mochila (Request engine) | **Unit 1 boss** (cumulative 1.1–1.6) |
| **2.1** ¡Contamos hasta cien! | 27 | Tens · compound numbers (tokens: cuarenta y siete = cuarenta + y + siete, valid) · Measurements (el centímetro, el metro, el kilómetro, el largo, medir (mido)) · el número de teléfono | "Mido un metro…" | Podcast: phone numbers to note down | Number Invaders 2; phone dictation (digits) | `¿Cuánto mides?` needs `cuánto`/`mides` (form) approval |
| **2.2** Te presento a mi familia | 25 (`la edad` recycled) | Parents and siblings · Grandparents, uncles and aunts, cousins · Step-family, twins, only child · mayor, menor, divorciado/a | "Tengo dos hermanos." "Mi madre se llama…" | Story: "Te presento a mi familia" video call | Family tree tap (listen → tap the person) | Family-structure sensitivity (divorced, step-family): use fictional families and never ask "your family" in Speak |
| **2.3** Los animales y las mascotas | 24 | Pets A · Pets B (el pez vs el pescado contrast) · Size and adjectives (grande, pequeño/a, enorme, feroz, de colores) · tengo mascota, no tengo mascotas, me gustaría tener, tenía | "Tengo un perro negro." "Me gustaría tener un caballo." | Podcast: pet-shop radio ad | Pet shop (Request engine), Animal Colour port | `el gato`/`la gata` rows already split |
| **2.4** Espejito, espejito… | 25 | Face (la cara, la boca, la nariz, los ojos) · Hair (el pelo + corto, largo, liso, rizado, ondulado, rubio, castaño, pelirrojo, negro) · Extras (las gafas, la barba, el bigote, las pecas, calvo/a) · tener forms | "Tiene el pelo largo y rizado." | Story: the missing-person poster | **Retrato Robot** lineup | Masculine-only CSV forms are OK with `el pelo`. Merge plural colours with 1.5 lexemes as forms. |
| **2.5** Las descripciones físicas | 17 | Height and build (alto/a, bajo/a, mediano/a, delgado/a, musculoso/a, gordito/a…) · Age and looks (joven, viejo/a, guapo/a, feo/a) · ser forms · Royals (el rey, la reina, la infanta, la princesa) | "La reina es alta y joven." | Podcast: an art-gallery audio guide to *Las Meninas* | Retrato Robot level 2 | **Sensitivity:** `gordo/a` and `feo/a` only for fictional or artwork characters, never in "describe yourself" |
| **2.6** Mi carácter y relaciones | 19 | Positive traits · Negative traits · ¿Cómo es? + agreement | "Mi amigo es divertido pero perezoso." | Story: choosing a team captain | "Guess who" (Request engine) | **Unit 2 boss** |
| **3.1** Mi tiempo libre | 17 | Activities A (bailar salsa, chatear en el móvil, descansar en casa, escuchar música, jugar videojuegos) · Activities B (leer libros, navegar por Internet, practicar deportes, salir con mis amigos, ver la tele) · Nouns and adjectives (el programa, el tipo, la discoteca, los pasatiempos, estupendo/a, favorito/a, interesante) | "Me encanta jugar videojuegos, pero prefiero leer libros." | Podcast: a teen vlog about weekends | Sentence Bridge | Builds the opinion + infinitive pattern that 3.4 relies on |
| **3.2** *(vocabulary to be supplied)* | ? | Slot: `status: awaiting-vocab` | — | — | — | **Open item: Juan to supply rows.** The build marks this section "coming soon" and doesn't block later sections (their Rule 2 check simply doesn't count 3.2 words). |
| **3.3** *(vocabulary to be supplied)* | ? | as above | — | — | — | **Open item.** |
| **3.4** ¡Brrr! ¡Hace frío! | 22 | See §11.3 | | | | Exemplar |
| **3.5** ¡Somos fanátic@s de la música! | 14 (`famoso/a` recycled; `el/la famoso/a` new sense; `Internet` known from 3.1) | People (el/la actor/actriz, el/la artista, el/la cantante, el/la rapero/a, el/la fan, el/la famoso/a) · Things and actions (la canción, actuar, la visita, Internet, estar en contacto con) · Adjectives (popular, talentoso/a, famoso/a ↺) | "Me encanta la canción." "La cantante es popular." | Podcast: a fan podcast about a (fictional) singer | Request engine: "find the singer described" | `muy`, `su` and `tiene` likely needed; propose them when authoring |
| **3.6** Su foto tiene muchos 'me gusta' | 14 (`el estilo`, `simpático/a`, `talentoso/a` recycled; `'me gusta'` new sense) | Social media (la red social, la foto, el seguidor/la seguidora, 'me gusta', usar, influenciar) · Groups and people (el grupo, el miembro, el jugador/la jugadora, la personalidad) · Adjectives (sociable + recycled) | "Me gusta usar la red social." Contrast card: *me gusta* (I like) vs *'me gusta'* (a like) | Reading: a fictional social feed of validated posts with comprehension questions | Sentence Bridge | **Unit 3 boss**. `muchos` is a form of `mucho`. |

### 11.3 Exemplar: unit 3.4 "¡Brrr! ¡Hace frío!" in detail

**Assumptions.** Everything from 1.1 to 3.1 is on the path before 3.4. The words from **3.2 and 3.3 are not used** (they're unknown). Approved helpers already introduced: `en` (1.6), `es` (1.1), `y`/`pero` (CSV 1.5). **No new helper words are needed.** Two story character names (`Lucía`, `Mateo`) need entries in `names.csv`.

**Forms this unit needs** (proposed for `forms.csv`): `hace calor`, `hace mucho calor`, `llueve`, `llueve mucho`, `invierno` (no article, for "en invierno"), `me gusta` (from `me gusta (mucho)`), `no me gusta nada` (from `no me gusta (nada)`), `aburrida` (from `aburrido/a`, 2.6). **`hace mucho frío` is *not* available**, because the CSV row is `hace frío` with no "(mucho)". The validator would flag it, so the exemplar avoids it.

**Words not allowed** (useful to know): seasons other than *el invierno* (`verano`, `primavera`, `otoño`), clothes, `hoy`, `grados`, `Australia`/`Melbourne` (unless you approve them as names). The usual "what to wear in this weather" activity is therefore off the table.

| Node | Type | Introduces | Content and example sentences (all validated against the CSV, forms and helpers) | Exercises |
|---|---|---|---|---|
| **n0** | Opener (optional) | — | Your 60–90 s AI video presenting the weather expressions with icons. A preview only: nothing is marked introduced. | — |
| **n1** | Repaso (warm-up) | — | Prerequisites: *me gusta (mucho), no me gusta (nada), me encanta, prefiero, odio, detesto* (1.5); *leer libros, ver la tele, practicar deportes, descansar en casa, salir con mis amigos, jugar videojuegos, escuchar música* (3.1); *hay…, en* (1.6); countries (1.1); months (1.4). Plus due items. | Stage-appropriate mix, 10–12 items |
| **n2** | Learn 1: "¿Qué tiempo hace?" | `¿Qué tiempo hace?`, `el tiempo`, `hace (mucho) calor`, `hace frío`, `hace sol`, `hace viento` (6 rows, 7 forms) | Intro order: hace sol → hace calor → hace frío → hace viento → ¿Qué tiempo hace? → el tiempo. Examples: "Hace sol." · "Hace mucho calor." · "Hace frío y hace viento." · "¿Qué tiempo hace? — Hace sol." | Intro cards with weather icons → listen → pick icon → icon → choose Spanish → word bank "Hace ___ y hace ___" → contrast frío/calor |
| **n3** | Learn 2: "Llueve y nieva" | `hay niebla`, `hay tormenta`, `llueve (mucho)`, `nieva` | Examples: "Llueve mucho." · "Nieva y hace frío." · "Hay niebla." · "Hay tormenta y hace viento." Explicit note: *hay* (1.6, "there is") → *hay niebla*, literally "there is fog". | Intros; **categorise** into *hace… / hay… / one verb (llueve, nieva)*; listen → pick icon (n2 and n3 items interleaved) |
| **n4** | Practise 1 (no new words) | — | Countries + weather: "En España hace sol." · "En Chile nieva." · "¿Qué tiempo hace en Perú? — Llueve." · "En julio hace frío en Argentina." · "En diciembre hace calor en Chile." Cultural note: in Chile and Argentina, July is winter, just like Melbourne. | True/false against a weather-map picture → gap fill → word bank → type 2 full sentences |
| **n5** | Learn 3: "El sol y la lluvia" | `el calor`, `el frío`, `el sol`, `el viento` (4 introduced, then a check), then `la niebla`, `la tormenta`, `la lluvia`, `la nieve` (4) | Each noun is introduced *paired* with its known phrase: *hace frío* → *el frío*. Examples: "Me encanta la nieve." · "Odio el viento." · "No me gusta nada la lluvia." · "Prefiero el sol." · "Detesto el frío." · "La lluvia es aburrida." · "El calor es fatal." | Intros; match the phrase to the noun (hace sol ↔ el sol); opinion sentences in the word bank |
| **n6** | Game: Weather Map | — | Request engine reskin: hear and read "En Perú hace sol", then drag ☀️ onto Perú. Later rounds have 2 requests ("En Chile nieva y en Cuba hay tormenta"). Generated from a plausibility table (country × weather), so it never produces "En Cuba nieva". | Calm mode available; results reported per item |
| **n7** | Learn 4: "Cuando, si…" | `el invierno`, `el pronóstico`, `cuando`, `si` | **Worked examples first** (I do): "Cuando llueve, me gusta leer libros." · "Si hace sol, prefiero practicar deportes." Then **faded practice** (we do → you do): choose the missing activity → order the chunks (Sentence Bridge) → type the sentence from English. More: "Cuando hace frío, me encanta descansar en casa." · "Si nieva, no me gusta salir con mis amigos." · "En invierno hace frío." · "Odio el invierno." · "El pronóstico: lunes, llueve." | Pattern item `pattern/cuando-si-weather-opinion-activity` gets its own stage ladder |
| **n8** | Story: "A video call to Chile" | — | The title is in English because `videollamada` isn't in the CSV. Script below. | Inline checks after lines 2, 5, 8 and 11 |
| **n9** | Listen: Radio Búho, "El pronóstico" | — | Script below. Task grid: 5 countries × 3 days, students drag weather icons into it on the first listen. | Pre-listen recognition → grid → transcript replay → 4 detail questions |
| **n10** | Speak: "Di el tiempo" | — | Shadow 4 model sentences ("Hace sol." "Llueve mucho." "Cuando llueve, me gusta leer libros." "Si hace frío, prefiero ver la tele."). Prompted production from pictures (🌧️ + 📚). | Record → compare → self-rate |
| **n11** | Practise 2: Mix | — | Generator `weather-opinion-activity`: [Cuando \| Si] × 8 weather forms (hace calor, hace frío, hace sol, hace viento, hay niebla, hay tormenta, llueve, nieva) × 6 opinion forms (me gusta, me encanta, prefiero, no me gusta, odio, detesto) × 10 activities from 3.1 = **960 sentences**, all listed and validated at build time. English template: "When/If it's {weather_en}, I {opinion_en} {activity_en}" (for example "If it's snowing, I hate going out with my friends"). | Typing, bank, MC with one swapped chunk as the distractor (as in the v1 mix engine) |
| **n12** | Section check: "El jefe del tiempo" | — | 14 items: every 3.4 lexeme at least once, mostly stage 3–4. A listening grid (a short new forecast). **Boss finale:** Búho needs a weather presenter. Build "Lunes: hace sol. Martes: llueve mucho." from picture cues, then type one *cuando/si* sentence of your own (graded against the generator's accepted set). Pass at ≥80%; otherwise targeted practice, then retry. | No hearts |

**n8 story script** (Mateo is in Spain, Lucía in Chile; it's July):

```
M: ¡Hola, Lucía! ¿Qué tal?
L: ¡Hola, Mateo! Fatal. Hace frío.
   [check] How is Lucía? (awful / fantastic / so-so)
M: ¿Qué tiempo hace en Chile?
L: Llueve mucho y hace viento. ¡Odio el invierno!
M: En España hace mucho calor. Hace sol.
   [check] What's the weather like in Spain? (hot and sunny / windy / snowing)
L: Me encanta el sol. Pero no me gusta nada el calor.
M: Cuando hace calor, prefiero descansar en casa.
L: Si llueve, me gusta ver la tele.
   [check] What does Lucía like doing when it rains? (watch TV / read books / dance salsa)
M: ¿Y el pronóstico?
L: El pronóstico: sábado, nieva. ¡Fantástico!
   [check] Put the last three lines in order.
M: ¡Hasta luego, Lucía!
L: ¡Adiós!
```

Token check, by hand, as the validator would do it: ¡hola! (1.2), ¿Qué tal? (1.2), fatal (1.2), hace frío / hace sol / hace viento / hace mucho calor / llueve mucho / nieva (3.4), ¿Qué tiempo hace? (3.4), en (helper), Chile/España (1.1), y/pero (1.5), odio/me encanta/prefiero (1.5), me gusta and no me gusta nada (forms of 1.5 rows), el invierno/el sol/el calor/el pronóstico (3.4), cuando/si (3.4), descansar en casa/ver la tele (3.1), sábado (1.4), fantástico (1.2), ¡Hasta luego! (1.2), ¡Adiós! (1.2), Lucía/Mateo (names.csv). **No unapproved tokens.**

**n9 Radio Búho script:**

```
¡Buenos días! El pronóstico.
Lunes: en España hace sol y hace mucho calor. En Colombia llueve mucho.
Martes: en Argentina hace frío y hay niebla. En Chile nieva.
Miércoles: en Cuba hay tormenta. En Perú hace viento.
Cuando hay tormenta, ¡prefiero descansar en casa! ¡Hasta luego!
```

**Distractor policy for 3.4:** use same-category confusables first (hace sol ↔ el sol, hace frío ↔ hace calor, llueve ↔ nieva, cuando ↔ si). These are the errors you most want students to notice. All distractors come from `known`.

### 11.4 Adding 3.4–3.6 to the CSV

Append these 50 rows to `vocabulary_database.csv`. They use the same columns and `Source = claro1_sb_3.4-3.6`. Notes:
- `Internet` is marked `capitals=yes`, matching the textbook and the 3.1 phrase.
- The duplicates (`famoso/a`, `talentoso/a` ×2, `el estilo`, `simpático/a`) are kept on purpose and handled as *recycled* (§5.7).
- `el tiempo` is glossed "weather" only. If "time" appears later, it will be a new sense.

```csv
el tiempo,weather,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
¿Qué tiempo hace?,What's the weather like?,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
hace (mucho) calor,it's (very) hot,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
hace frío,it's cold,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
hace sol,it's sunny,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
hace viento,it's windy,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
hay niebla,it's foggy,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
hay tormenta,it's stormy,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
llueve (mucho),it's raining (a lot),3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
nieva,it's snowing,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
el pronóstico,forecast,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
el calor,heat,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
el frío,cold,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
el invierno,winter,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
la lluvia,rain,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
la niebla,fog,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
la nieve,snow,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
el sol,sun,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
la tormenta,storm,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
el viento,wind,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
cuando,when,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
si,if,3.4 ¡Brrr! ¡Hace frío!,claro1_sb_3.4-3.6,
el/la actor/actriz,actor/actress,3.5 ¡Somos fanátic@s de la música!,claro1_sb_3.4-3.6,
actuar,to act/perform,3.5 ¡Somos fanátic@s de la música!,claro1_sb_3.4-3.6,
el/la artista,(performing) artist,3.5 ¡Somos fanátic@s de la música!,claro1_sb_3.4-3.6,
la canción,song,3.5 ¡Somos fanátic@s de la música!,claro1_sb_3.4-3.6,
el/la cantante,singer,3.5 ¡Somos fanátic@s de la música!,claro1_sb_3.4-3.6,
estar en contacto con,to be in touch with,3.5 ¡Somos fanátic@s de la música!,claro1_sb_3.4-3.6,
famoso/a,famous,3.5 ¡Somos fanátic@s de la música!,claro1_sb_3.4-3.6,
el/la famoso/a,famous person,3.5 ¡Somos fanátic@s de la música!,claro1_sb_3.4-3.6,
el/la fan,fan,3.5 ¡Somos fanátic@s de la música!,claro1_sb_3.4-3.6,
Internet,Internet,3.5 ¡Somos fanátic@s de la música!,claro1_sb_3.4-3.6,yes
popular,popular,3.5 ¡Somos fanátic@s de la música!,claro1_sb_3.4-3.6,
el/la rapero/a,rapper,3.5 ¡Somos fanátic@s de la música!,claro1_sb_3.4-3.6,
talentoso/a,talented,3.5 ¡Somos fanátic@s de la música!,claro1_sb_3.4-3.6,
la visita,view (e.g. on YouTube),3.5 ¡Somos fanátic@s de la música!,claro1_sb_3.4-3.6,
el estilo,style,3.6 Su foto tiene muchos 'me gusta',claro1_sb_3.4-3.6,
la foto,photo/picture,3.6 Su foto tiene muchos 'me gusta',claro1_sb_3.4-3.6,
el grupo,group,3.6 Su foto tiene muchos 'me gusta',claro1_sb_3.4-3.6,
influenciar,to influence,3.6 Su foto tiene muchos 'me gusta',claro1_sb_3.4-3.6,
el/la jugador(a),player,3.6 Su foto tiene muchos 'me gusta',claro1_sb_3.4-3.6,
'me gusta',like (on social network),3.6 Su foto tiene muchos 'me gusta',claro1_sb_3.4-3.6,
el miembro,member,3.6 Su foto tiene muchos 'me gusta',claro1_sb_3.4-3.6,
la personalidad,personality,3.6 Su foto tiene muchos 'me gusta',claro1_sb_3.4-3.6,
la red social,social network,3.6 Su foto tiene muchos 'me gusta',claro1_sb_3.4-3.6,
el/la seguidor(a),follower,3.6 Su foto tiene muchos 'me gusta',claro1_sb_3.4-3.6,
usar,to use,3.6 Su foto tiene muchos 'me gusta',claro1_sb_3.4-3.6,
simpático/a,"kind, nice",3.6 Su foto tiene muchos 'me gusta',claro1_sb_3.4-3.6,
sociable,sociable,3.6 Su foto tiene muchos 'me gusta',claro1_sb_3.4-3.6,
talentoso/a,talented,3.6 Su foto tiene muchos 'me gusta',claro1_sb_3.4-3.6,
```

Proposed `forms.csv` entries for the new compound notations (for your approval): `el actor`, `la actriz`; `el artista`, `la artista`; `el cantante`, `la cantante`; `el rapero`, `la rapera`; `el jugador`, `la jugadora`; `el seguidor`, `la seguidora`, `los seguidores` (very useful in 3.6); `el famoso`, `la famosa`; `el fan`, `la fan`; `talentoso`, `talentosa`; `'me gusta'` → spoken and matched as `me gusta`, with the new-sense flag. Its plural is invariable (`muchos 'me gusta'`).

### 11.5 3.2 and 3.3

These are open items you need to supply. When you add the rows to the CSV, the build automatically creates auto-units in their place. Hand-authored units can follow. Until then, 3.4's Rule 2 check simply doesn't include those words. If 3.2/3.3 introduce words that would make 3.4 richer (for example more activities or places), add them to the 3.4 generators afterwards.

---

## 12. Migration from v1

**Reuse content:**

| v1 | v2 |
|---|---|
| `VOCAB_DATABASE` (173 keys) | CSV lexemes + `forms.csv` (e.g. `rojo/roja`, `me llamo`) + `helpers.csv` (§5.8) |
| `BUBBLE_N_LEVELS` | Learn-node item order in `1.1.yaml` … `1.6.yaml` (your groupings are good; split groups of more than 8, such as months and numbers 21–31) |
| `MIX_NOUNS`, `MIX_COLOURS`, `MIX_TEMPLATES`, Mochila `OBJECTS` | Generator YAML + `forms.csv` |
| Mochila engine | Request engine (generalised) |
| Frogger sentence lists | Rewrite as validated patterns for Sentence Bridge (drop the nonsense ones) |
| Dialogues and boss cards | Rewrite under the validator (§2.3) |
| `index.html` `grade()`, dictation, Retrato Robot, Animal Colour | Port as modules |

**Keep students' progress.** v2 runs at the same origin, so it can read `localStorage['buhisimo_progress']`. It never deletes that key, so rollback stays possible.

1. **Units:** map v1 completion flags to v2 sections: `b6_completed` → 1.1, `b11` → 1.2, `b16` → 1.3, `b21` → 1.4, `b26` → 1.5, `b30` → 1.6. Each one becomes **crown 1 (migrated)**, so the path is unlocked to the same point.
2. **Items:** every word in a completed chapter, or with v1 `strength > 0`, gets stage 2 and box 1. Due dates are **spread over the next 10 days**, at most 20 a day. (v1 strengths aren't reliable enough to use beyond "seen", because of B1/B2.)
3. **Placement check (optional, recommended):** "Show what you remember", a 10-item quick check per migrated section. Correct first try sends an item to box 3. This rewards students who really learned.
4. **Profile:** keep XP. Turn crowns into a "v1 crowns" badge. Use only the *first word* of `student_name` as a local nickname (and offer to clear it). Drop the streak (it was really days active).
5. **Students past v1's content** (your current class, already beyond 1.6): the **auto-units** for 2.1–3.1 plus the placement check let them start at their real position with nothing lost.

**v1 hotfixes worth doing now if v1 stays live this term** (about 1–2 h in total, each a few lines):
- B4: make export UTF-8 safe with `btoa(unescape(encodeURIComponent(json)))`, and decode with the inverse.
- B5: use `.hidden` consistently instead of `style.display`.
- B1: compute decay on a copy for display and never write it back.
- B6: fix the chapter checks in `space.js` and `maze.js`.
- Remove `la lengua` and the `Señor`/`mañana` dialogues.

---

## 13. Phased roadmap

Effort assumes Claude writes most of the code and you review, test on devices and approve content. The ranges are wide because device testing and content review take time.

| Phase | Scope | Exit criteria | Effort |
|---|---|---|---|
| **0. Hotfix v1** (optional) | The 5 fixes above | Save Data works; buttons stay visible | 1–2 h |
| **1. Engine + 3.4 pilot** | Repo skeleton; build + **validator** + tokeniser + tests; `forms.csv`/`helpers.csv`/`names.csv` seeded from v1 and the CSV; **auto-units for every CSV section**; scheduler, composer, `grade()`; exercises: intro, listen-pick, ES→meaning, match, meaning→ES, gap fill, word bank, type, dictation; map UI from data; Daily Repaso; local storage + IndexedDB log + export/import; v1 migration + placement check; PWA; accent bar; mobile/a11y baseline; **3.4 hand-authored** (n1–n12, including story, podcast, generator and section check); browser TTS fallback (one fixed voice) | Validator green; 1.1→3.1 + 3.4 playable on a phone and a Chromebook; v1 progress migrates; Actions deploys only when green | **35–50 h** |
| **2. Hand-authored Unit 1–2 + audio** | Units 1.1–1.6 and 2.1–2.6 hand-authored (port v1, then enrich); generators for 1.5, 1.6, 2.3 and 2.4; Request engine (Mochila generalised); Retrato Robot + Animal Colour ports; audio pipeline: `gen-audio`, manifest, review page; generate and review word audio for 1.1–3.4; section checks + Unit 1/2 bosses | All of Units 1–2 authored; word audio reviewed | **30–45 h** + about 6–10 h audio review |
| **3. Rich content to 3.6** | Stories and Radio Búho for 1.3 onwards (one per section); Speak nodes (shadowing); Sentence Bridge, Number Invaders, Map/Calendar tap; 3.1, 3.5, 3.6 hand-authored; **3.2/3.3 once supplied**; Unit 3 boss; Projector mode; catch-up route + `class.json` | Path 1.1→3.6 complete (3.2/3.3 pending your rows) | **35–55 h** (+ about 1–2 h per story or podcast for scripting, audio and review) |
| **4. Teacher side** (optional) | Practice codes; `sync.js` → Apps Script + Sheet; `teacher.html` (who practised, weakest items, export to Projector mode) | School privacy approval obtained first | **20–30 h** + approval time |

**Suggested order for this school year:** Phase 0 now, Phase 1 for a 3.4 pilot with your current class in Term 4, and Phases 2–3 over the summer, ready for the 2027 Year 7s starting at 1.1.

---

## 14. Open questions for Juan (in priority order)

1. **Pilot first or port first?** Should Phase 1 be the **3.4 pilot** (useful to your current class now) or the **1.1–1.6 port** (aimed at next year's cohort)? *Recommendation: 3.4 pilot, with auto-units covering everything else.*
2. **3.2 and 3.3 vocabulary.** Please add the rows to the CSV when you can. Also confirm the 50 rows for 3.4–3.6 in §11.4.
3. **Helper and form policy.** Do you accept the **"forms of CSV words"** category (`me llamo`, `tengo`, `roja`, `invierno` without its article), approved row by row in `forms.csv`, as compliant with Rule 1? And please decide each of: `soy`, `de`, `tu`, standalone `el/la/los/las`, `gracias`, `muy`, `su`, `la lengua`, and the alphabet letter names (§5.8).
4. **Accent of the model voice** (es-ES or a Latin American variety), and should a second variety appear in podcasts?
5. **Can students go ahead of the class?** Should the path stop at the class marker, allow a one-unit preview, or be fully open? *Recommendation: preview of the next section's Learn nodes only.*
6. **Proper nouns:** character names (Lucía, Mateo, …) and places outside the CSV (`Australia`, `Melbourne`) via `names.csv`. Yes or no?
7. **Grading strictness:** should missing accents or `ñ` count as "nearly" (accepted, with a note) as proposed? Should articles become required at stage 3+?
8. **Sensitive words** (`gordo/a`, `feo/a`, `divorciado/a`, step-family): confirm they're only used with fictional or artwork characters and never in "describe yourself or your family" prompts.
9. **Speech recognition:** keep it off by default (shadowing only)? Is microphone use allowed on school Chromebooks?
10. **Teacher sync:** is a Google Apps Script + school Sheet acceptable to your school, and who approves it? (Only needed for Phase 4.)
11. **CSV tidy-up:** fix `nascimiento`/`fisicos`, and decide on `la edad` (1.3/2.2) and the `capitals` column meaning ("case matters"). Your call. The build copes either way via aliases.

---

## Appendix A: v1 node → v2 section map (for migration)

| v1 nodes | v2 section | Notes |
|---|---|---|
| b1, b2 (Frogger), b3, b4 (Space), b5, b6 (exam) | 1.1 | b1 L1 greetings are 1.2 CSV rows: kept in 1.1 by unit order |
| r1, b7, b8 (Globo), r2, b9, b10 (Frogger), b11 | 1.2 | r-nodes are replaced by Repaso |
| r3, b12, b13 (Maze), r4, b14, b15 (Space), b16 | 1.3 | |
| r5, b17, b18 (Globo), r6, b19, b20 (Maze), b21 | 1.4 | |
| r7, b22, b23 (Space), r8, b24, b25 (Maze), b26 | 1.5 | |
| r9, b27, b28 (Mochila), b29 (mix), b30 | 1.6 | Uncommitted in git at the time of review |

## Appendix B: Rosenshine's principles → v2 features

| Principle | v2 feature |
|---|---|
| Daily review | Repaso warm-up for each unit; Daily Repaso |
| New material in small steps | Learn nodes with 4–6 items, one at a time |
| Ask many questions | Every screen is a retrieval; about 12–15 per node |
| Provide models | Intro cards, worked-example sentences, the opener video |
| Guide student practice | Stage 2 exercises, word bank, hint ladder |
| Check for understanding | An immediate recognition check after each intro |
| Obtain a high success rate | The composer adjusts difficulty to keep about 80% |
| Scaffolds for difficult tasks | Model → gap → bank → type fading in Patterns |
| Independent practice | Stage 3–4, Speak, section check |
| Weekly and monthly review | Leitner boxes (1–32 days), retained crown, Projector-mode starters |

---

## Appendix C: Grammar guardrails for sentences and generated items (added 9 Oct 2026)

- **y → e before an "i" sound:** "y" becomes "e" before a word starting with *i-* or *hi-* (not *hie-*), e.g. *inteligente e influencia*, not *y influencia*. The 3.6 slides avoid it by putting "influencia a sus seguidores" first. Generators that join chunks with "y" must reorder them or use "e" (and teach it before using it).
- **o → u before an "o" sound:** same rule for "o" before *o-/ho-* (e.g. *siete u ocho*).
- **el águila:** a feminine noun that takes "el" in the singular; only "el águila" is used (México lessons).
