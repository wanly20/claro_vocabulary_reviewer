# Buhísimo — Unit Creation Rules

Working guide for adding new chapters (units) to `buhisimo.html`. This is a
**draft for discussion** — anything marked 🟡 is an open decision.

---

## 0. Two rules that override everything

### Rule 1 — Vocabulary comes only from the database
Every Spanish word or phrase used *anywhere* in Buhísimo — study cards, games,
revision, mix sentences, checkpoint questions, boss challenges — must exist as a
row in `vocabulary_database.csv`.

**The only exception is an approved helper word.** A helper word is a small
grammatical glue word (article, pronoun, preposition, `hay`, a container noun)
that the CSV doesn't carry but a sentence needs. To add one:
1. Propose it to Juan and get explicit approval.
2. Record it in this file (§6.1).
3. **Introduce it explicitly** in a study bubble — it gets its own intro card,
   same as a real vocabulary word. It may not just "appear" in a sentence.

### Rule 2 — Introduce before use (top-to-bottom)
The map is read top to bottom. A word may only be used by a node if it was
introduced by a study bubble **above** that node. Before adding any game,
revision, mix sentence, or checkpoint, check every word in it against the study
bubbles that precede it on the map. `startStudySession` silently drops unknown
words, so a violation shows up as a thin or empty question queue, not an error.

---

## 1. Where we are now

| Buhísimo | Vocabulary DB (`vocabulary_database.csv`) |
|---|---|
| Chapters **1.1 → 1.5** built (26 map nodes, `b1`–`b26`) | Units **1.1 → 3.1** entered (13 sections, 298 words) |

**Units in the CSV but not yet in Buhísimo:** 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1.

**Next unit to build:** `1.6 ¡Tod@s a clase!` — see §11.

### Known debt from 1.5 (fix while touching this area)
- `"Mis Preferencias"` was added to `VOCAB_DATABASE` but **not** to `THEME_LABELS`
  or `THEME_TOTAL_COUNTS_1_1`. The strengths modal can't label that theme and
  never seeds `theme_strengths["Mis Preferencias"]`. → The §7 checklist exists to
  stop this recurring.
- `THEME_TOTAL_COUNTS_1_1` is stale (missing `Calendario`, `Mis Preferencias`)
  and its name still says "1.1".
- A couple of inline `style=` strings have crept back into JS-generated HTML
  (e.g. the theme-modal back button) despite the no-inline-styles banner.

---

## 2. Architecture recap

- Single file `buhisimo.html`: inline `<style>` + inline `<script>`, plus 4 game
  engines in `games/*/`.
- Progress lives in `localStorage['buhisimo_progress']` as one flat `state` object.
- The **map** is a vertical scroll of "bubbles" (`.bubble-wrapper`), grouped under
  `.chapter-header-divider` blocks.
- **Spaced repetition:** every word has `state.word_strengths[word] = {strength,
  last_practiced}`; `decayStrengths()` applies 15%/day exponential decay. Same for
  `state.theme_strengths[themeLabel]`.
- Words come from `VOCAB_DATABASE` (a hand-curated subset of the CSV, keyed by the
  Spanish string). Games read `VOCAB_DATABASE` too.

---

## 3. Node types

| Type | Crowns | Questions | Purpose |
|---|---|---|---|
| **Study bubble** (`bNN`) | 2 (standard) or 3 (intro ch. 1.1) | 12, or 10 on the "gold" run | Introduce new words in 2–3 levels, then mixed practice |
| **Revision bubble** (`rNN`) | 1 | 10 | Weakest-first review drawn from earlier chapters; no new words |
| **Game node** (`bNN`) | — | — | Reskin of a game engine with the chapter's vocab; unlocks when the preceding study bubble hits max crowns |
| **Checkpoint exam** (`bNN`) | pass/fail | 15 + boss | 4 hearts, "last chance boss challenge" if you fail near the end |

### Study-bubble internals (`startStudySession`)
- Level split: `BUBBLE_NN_LEVELS = [[...level1], [...level2](, [...level3])]`.
- Per crown run: intro cards for that level's new words + 8 mixed questions
  (10 on gold / revision). `targetCount` = 12 normal, 10 gold/revision.
- `isMax2` list decides 2-crown vs 3-crown. Standard chapters (1.2+) are all 2-crown.
- Question styles auto-mix: `mc`, `match`, `dialogue`, `bank`, `typing`, `listening`.
  `dialogue` only fires for a fixed set of question-phrase keys (`convoKeys`).

### Checkpoint internals (`startCheckpointTest`)
- `fullPool` = every level array of both study bubbles in the chapter.
- 15 random questions, `lives: 4`.
- Fail at question ≥13 → `triggerLastChanceChallenge()` with a hand-written
  `bank`-type boss sentence (one per chapter). Must be added for each new chapter.
- Pass → sets `state.bNN_completed = true`, `rewardXP += 20` (40 total).

---

## 4. Chapter templates

### A. Intro template — used only by 1.1
3 study bubbles @ 3 crowns · 2 games · 1 checkpoint · **no** revision nodes.
Colour accent: `brand-green`.

### B. Standard template — used by 1.2–1.5 (7 nodes)
```
rODD   Revision   ← weakest-first from previous chapter(s)
bA     Study      2 crowns, 2 levels (~6–8 words each)
game1  Arcade     unlocks at bA = 2 crowns
rEVEN  Revision   ← weakest-first incl. bA
bB     Study      2 crowns, 2 levels
game2  Arcade     unlocks at bB = 2 crowns   (different engine from game1)
exam   Checkpoint 15 Q + boss
```
Colour accent cycles: 1.2 orange → 1.3 purple → 1.4 teal → 1.5 teal.

### C. Consolidation template — for short units (1.6)
For units with too few new words for two study bubbles. Juan's steer: keep it
short — *bubble → game → bubble* — and make the second bubble an **explicit
recombination** of the new vocab with earlier vocab.
```
rODD    Revision       ← weakest-first from the chapter just before
bA      Study (new)    3 crowns, 3 levels — objects, then more objects, then the
                       structural words (container noun + hay + articles + prep)
game    Arcade         reskinned with bA words + earlier vocab only
bB      Mix & Match    2 crowns — NO new words; grammatically-generated sentences
                       recombining bA words with prior chapters (colours, numbers,
                       likes), e.g. "En mi mochila hay tres bolígrafos rojos"
exam    Checkpoint     15 Q drawn from bA + bB pool + boss
```
Decisions taken for 1.6:
- `bA` is **3 crowns / 3 levels** (not 2), so the structural helper words are
  introduced on the map *before* the game and mix bubble need them. (3-level
  bubbles must stay out of the `isMax2` list — see §3.)
- One revision node is enough (`r9`), placed before `bA`.
- `bB` uses a **grammar-driven sentence engine**, not a hand-written list — see §8.1.
- Keep a real checkpoint exam (`b30`).

---

## 5. Numbering & naming

- **Bubbles** are one sequential integer series across the whole map: next chapter
  starts at `b27`. Games and checkpoints consume numbers too.
- **Revision** nodes are `r1, r2, …` in their own series: next is `r9`.
- **Chapter number** passed to games / checkpoints is the *minor* version as an
  int: 1.1→`1`, 1.2→`2`, … 1.5→`5`, 1.6→`6`. (Chapter 2.1 will need a decision —
  see §10.)
- `bubble-label` = short Spanish name shown on the map. `chapter-title` /
  `chapter-subtitle` on the divider = unit name + one-line English summary.
- Revision labels: `Repaso: <what it covers>`.

---

## 6. Vocabulary rules

**The CSV is the source of truth. Juan maintains it. When a unit needs words that
aren't in the CSV yet, ASK JUAN — do not invent them.** See §0 Rule 1.

### 6.1 Approved helper words

Words not in the CSV that Juan has approved. Each must be introduced by an intro
card in a study bubble before any node uses it.

| Word | English | Approved for | Introduced in |
|---|---|---|---|
| `un` | a / an (m.) | 1.6 | `b27` level 3 |
| `una` | a / an (f.) | 1.6 | `b27` level 3 |
| `mi` | my | 1.6 | `b27` level 3 |
| `en` | in | 1.6 | `b27` level 3 |
| `la mochila` | backpack | 1.6 | `b27` level 3 |

(Already in `VOCAB_DATABASE` as pre-approved grammatical glue from earlier
chapters: `él, ella, es, tú, eres, y, o, pero, también, además, sin embargo`.)

Adding a chapter:
1. Read the unit's rows from `vocabulary_database.csv` (match the `Section` column).
2. For each word, decide:
   - **Include as-is?** Most single words and short phrases: yes.
   - **Gendered variant needed?** CSV stores `rojo/a`; Buhísimo splits into
     `"rojo"` and `"roja"` as separate entries. **Confirm the split list with Juan.**
   - **Helper word needed?** e.g. pronouns, articles, connectors not in the CSV
     that the sentences need. **Propose the list to Juan before adding.**
3. Add entries to `VOCAB_DATABASE`:
   ```js
   "el bolígrafo": { english: "pen", theme: "Material Escolar" },
   ```
4. Split into levels in a new `BUBBLE_NN_LEVELS` const (~6–8 per level, 2 levels
   for standard chapters; group by meaning, easiest level first).
5. Every word you put in a `LEVELS` array **must** exist in `VOCAB_DATABASE` —
   `startStudySession` filters out unknowns silently, which can empty a queue.

---

## 7. Theme checklist (the thing 1.5 missed)

A "theme" is the bucket used by `theme_strengths` and the strengths modal. When a
chapter introduces a **new** theme, update **all** of:

- [ ] `THEME_LABELS` — add `"<Theme>": "<emoji> <short label>"`
- [ ] `THEME_TOTAL_COUNTS_1_1` — add the real count (and 🟡 rename this const to
      drop `_1_1`, since it's no longer chapter-specific)
- [ ] Confirm `loadProgress()` seeds `theme_strengths` from `THEME_LABELS` keys
      (it iterates `THEME_LABELS`, so adding there is enough)
- [ ] Every `VOCAB_DATABASE` entry for the chapter has a `theme` that exactly
      matches a `THEME_LABELS` key (string-identical, accents included)

Existing themes: `Saludos y Sentimientos`, `Países`, `Identidad Personal`,
`Los Números`, `Calendario`, `Mis Preferencias`.

---

## 8. Game reskin rules

Four engines, each in `games/<name>/`. They read `VOCAB_DATABASE` (global) and
keep their own per-chapter word/sentence lists.

| Engine | Object | Label | Used by | Content shape |
|---|---|---|---|---|
| Frogger | `FroggerGame` (`frogger.js`) | Cruce del Río | 1.1, 1.2 | `GAME_SENTENCES_1_x` |
| Space Invaders | `SpaceInvadersGame` | Invasores del Espacio | 1.1, 1.3, 1.5 | `GAME_WORDS_1_x` |
| Globo Pop | `GloboGame` | Globo Pop | 1.2, 1.4 | `GAME_WORDS_1_x` |
| Owl's Maze | `OwlsMazeGame` | El Laberinto | 1.3, 1.4, 1.5 | `GAME_WORDS_1_x` |

To reskin for a new chapter:
1. Add `const GAME_WORDS_1_N = [...]` (subset of that chapter's `VOCAB_DATABASE`
   keys) near the top of the engine file.
2. Extend the list-picker ternary inside the engine (search `chapterNum ===`).
3. Map HTML `onclick` = `<Engine>.start(N)`.
4. Pick which engines a chapter uses — the rotation keeps variety and avoids
   repeating an engine back-to-back within a chapter. **Every word the game shows
   must be introduced above it on the map (§0 Rule 2).**

New engines get their own `games/<name>/<name>.js` + `.css`, `<script>`/`<link>`
in `buhisimo.html`'s head/footer, and follow the same IIFE shape: a module with
`start(chapterNum)` that repaints `#question-area` inside `#lesson-overlay`,
reads global `state` + `VOCAB_DATABASE`, runs its own loop, and on finish sets
the unlock flag / calls back into `completeLesson`-style handling.

### 8.1 "En mi mochila" — mochila-packing game (new engine, 1.6)

New engine `games/mochila/mochila.js` + `.css`. Object `MochilaGame`, `start(6)`.

**Concept.** A backpack sits at the bottom. A *lista* panel shows 1–3 requests in
Spanish (`un cuaderno`, `tres lápices`, `una goma verde`). School-object tiles
drift down the screen (or sit in a grid). Click the tiles that satisfy the list;
correct → pops into the bag with a chime and ticks the list line, wrong → shake +
small time penalty. Clear the list before the round timer → next round. 4 rounds,
rising difficulty (more list lines, colour constraints, distractors). Score →
XP + unlock flag, same as other games.

**Vocabulary scope (all introduced above `b28`):**
- Objects: the 12 words from `b27` (`el bolígrafo` … `hay…`).
- `un` / `una` from `b27` L3; `la mochila` from `b27` L3.
- Numbers `dos`–`nueve` — from `b14` (chapter 1.3), invariable, safe.
- Colours from `b22` (chapter 1.5) — used only as the request text and only in
  their correct agreed form (the game generates the request via the §8.1 grammar
  data, never by string concat).

**Correctness.** The game never free-forms Spanish. Every request string is
produced by the same slot templates + morphology tables as the mix engine (§8.2),
from a whitelist of noun+colour+number combinations. If a combo can't be rendered
correctly (e.g. an invariable-plural noun like `las tijeras` with a number), it
is excluded from that template.

### 8.2 Mix & Match sentence engine (`b29`)

Juan's condition: a generator is allowed **only if it guarantees Spanish syntax
is always correct** for our vocabulary. It can, because the surface is tiny and
fully constrained. Design:

**A. Morphology tables (hand-written, hand-checked, one row per noun).**
```js
const ESCOLAR_NOUNS = {
  "el bolígrafo":     { gender:"m", art:"el",  sing:"bolígrafo",     plur:"bolígrafos",     countable:true  },
  "el lápiz":         { gender:"m", art:"el",  sing:"lápiz",         plur:"lápices",        countable:true  },
  "el cuaderno":      { gender:"m", art:"el",  sing:"cuaderno",      plur:"cuadernos",      countable:true  },
  "el libro":         { gender:"m", art:"el",  sing:"libro",         plur:"libros",         countable:true  },
  "el libro de texto":{ gender:"m", art:"el",  sing:"libro de texto",plur:"libros de texto",countable:true  },
  "el estuche":       { gender:"m", art:"el",  sing:"estuche",       plur:"estuches",       countable:true  },
  "el sacapuntas":    { gender:"m", art:"el",  sing:"sacapuntas",    plur:"sacapuntas",     countable:true  },
  "la goma":          { gender:"f", art:"la",  sing:"goma",          plur:"gomas",          countable:true  },
  "la regla":         { gender:"f", art:"la",  sing:"regla",         plur:"reglas",         countable:true  },
  "la hoja de papel": { gender:"f", art:"la",  sing:"hoja de papel", plur:"hojas de papel", countable:true  },
  "la mochila":       { gender:"f", art:"la",  sing:"mochila",       plur:"mochilas",       countable:true  },
  "las tijeras":      { gender:"f", art:"las", sing:null,            plur:"tijeras",        countable:false } // always plural
};

const COLOUR_ADJ = {
  // gendered: 4 forms; invariable: same for m/f, +es or special plural
  "rojo":   { ms:"rojo",   fs:"roja",   mp:"rojos",   fp:"rojas"   },
  "amarillo":{ms:"amarillo",fs:"amarilla",mp:"amarillos",fp:"amarillas"},
  "blanco": { ms:"blanco", fs:"blanca", mp:"blancos", fp:"blancas" },
  "negro":  { ms:"negro",  fs:"negra",  mp:"negros",  fp:"negras"  },
  "morado": { ms:"morado", fs:"morada", mp:"morados", fp:"moradas" },
  "azul":   { ms:"azul",   fs:"azul",   mp:"azules",  fp:"azules"  },
  "verde":  { ms:"verde",  fs:"verde",  mp:"verdes",  fp:"verdes"  },
  "gris":   { ms:"gris",   fs:"gris",   mp:"grises",  fp:"grises"  },
  "marrón": { ms:"marrón", fs:"marrón", mp:"marrones",fp:"marrones"},
  "naranja":{ ms:"naranja",fs:"naranja",mp:"naranjas",fp:"naranjas"},
  "rosa":   { ms:"rosa",   fs:"rosa",   mp:"rosas",   fp:"rosas"   }
};
const NUMBERS = { 2:"dos",3:"tres",4:"cuatro",5:"cinco",6:"seis",7:"siete",8:"ocho",9:"nueve" };
```
Only words already in `VOCAB_DATABASE` above `b29` may key these tables. The
tables carry *inflected forms only* — no rule engine, so nothing to get wrong at
runtime.

**B. Templates (each hand-verified, with slot types and an agreement recipe).**
| # | Pattern | Example | Notes |
|---|---|---|---|
| T1 | `En mi mochila hay {N} {noun.plur} {colour.Xp}` | En mi mochila hay tres lápices rojos | `countable` nouns only; colour agrees `p` + gender |
| T2 | `Hay {un/una} {noun.sing} {colour.Xs} en mi mochila` | Hay una regla verde en mi mochila | `un` if `gender==m`, `una` if `f`; singular nouns only |
| T3 | `{Me gusta/Prefiero/Me encanta/Odio/Detesto} {art} {noun.sing} {colour.Xs}` | Prefiero el cuaderno azul | verb from 1.5 set; `art` from table |
| T4 | `No hay {noun.plur} en mi mochila` | No hay tijeras en mi mochila | works for `las tijeras` too |
| T5 | `¿Hay {un/una} {noun.sing} en tu mochila? — Sí, hay {un/una} {noun.sing}` | dialogue variant of T2 |

Agreement recipe per slot: pick noun → look up `gender`; pick `sing`/`plur` per
template; colour form = `COLOUR_ADJ[c][ (plural?"p":"s") prefixed by (gender=="f"?"f":"m") ]`
→ e.g. `fp` = feminine plural. Article: T1 none, T2/T5 `un|una`, T3 `el|la`.

**C. Question rendering.** Reuse the existing `session` queue + question types.
A generated sentence becomes:
- a `typing` card (`prompt` = English gloss built from the same slots, `correct`
  = the Spanish string), or
- a `bank` card (`wordsPool` = the correct tokens + 3–4 distractor tokens drawn
  from the same tables), or
- an `mc` card (one correct sentence vs 3 sentences with a single deliberate
  agreement error — also generated, so the distractors are realistic).

English gloss is also generated from a fixed per-template pattern, so no
free-text translation is ever needed.

**D. Guard.** A dev-only `validateMixEngine()` renders every
(template × noun × colour × number) combo it would ever produce and logs the
list, so Juan can eyeball the full output surface before release. Combos flagged
impossible are hard-excluded, not silently skipped.

---

## 9. Revision node pool rules

`levelsPool` for `rN` = a single flat array spreading the level arrays of the
bubbles it reviews (see the `if (bubbleNum === 'rN')` ladder in
`startStudySession`). Convention:
- `rODD` (start of chapter) = **all** words from the previous chapter's study bubbles.
- `rEVEN` (mid chapter) = the chapter's first study bubble + a slice of older material.
- The SR engine picks weakest-first at runtime; the pool just bounds the scope.

---

## 10. 🟡 Unit / chapter boundary — the problem, explained

The textbook is organised as **Unit → Chapter**: Unit 1 contains chapters
1.1–1.6, Unit 2 contains 2.1–2.6, and so on. Buhísimo so far has only ever been
inside Unit 1, so it has never had to represent the Unit level — it just has a
flat run of "chapters" 1.1…1.5.

Three things in the code assume "chapter" is a **single small integer** and will
break or mislead when we cross into Unit 2:

1. **The chapter id passed around.** `startStudySession`, `<Engine>.start(n)`,
   `startCheckpointTest(n)` and `session.bubbleNum` maps all take `n` = the minor
   number: 1.1→`1` … 1.5→`5`. 1.6 can just be `6`. But 2.1 has no obvious integer.
   - *Option A — keep counting:* 2.1→`7`, 2.2→`8`, … The number stops meaning
     anything ("chapter 9" ≠ 2.3 to a reader) but it's a one-line change per site.
   - *Option B — real ids:* pass `"2.1"` strings everywhere chapters are keyed.
     Cleaner and self-documenting; touches every `chapterNum ===` comparison in
     the four game files and the checkpoint/session maps once.
   - Recommendation: **Option B**, done as its own refactor commit *before*
     building 2.1, so 1.6 stays simple (`6`) and Unit 2 starts clean.

2. **Visual hierarchy.** Right now every chapter gets the same
   `.chapter-header-divider`. Crossing into Unit 2 probably wants a bigger break —
   a "Unidad 2" band, a fresh colour cycle, maybe a short recap gate. Decision
   deferred, but the divider markup should grow a `data-unit` / `data-chapter`
   attribute now so later styling has something to hook.

3. **The `unit-banner` scroll handler** (`window.addEventListener('scroll', …)`)
   is hard-coded: it grabs `dividers[1]`…`dividers[4]` and has a literal
   `if/else` per chapter 1.2–1.5 with the title/description baked in. Adding a 6th
   chapter means editing this by hand; it should instead **loop over all
   `.chapter-header-divider` elements**, reading their title/colour from
   `data-*` attributes. Worth fixing when we add 1.6 (it'll be the first chapter
   the current handler doesn't cover).

None of this blocks 1.6. It's the cleanup that should happen in the gap between
finishing 1.6 and starting 2.1.

---

## 11. Plan for 1.6 ¡Tod@s a clase!

### The 12 words (CSV `Section = "1.6 ¡Tod@s a clase!"`)
| Spanish | English |
|---|---|
| el bolígrafo | pen |
| el cuaderno | exercise book |
| el estuche | pencil case |
| el lápiz | pencil |
| el libro | book |
| el libro de texto | textbook |
| el sacapuntas | pencil sharpener |
| la goma | eraser |
| la hoja de papel | sheet of paper |
| la regla | ruler |
| las tijeras | scissors |
| hay… | there is / there are |

### Why 1.6 is short
In *Claro 1* the `.6` unit is the closing practical spread of the chapter
(classroom language / "manos a la obra"), not a full vocabulary set. 12 items is
the smallest of all 13 sections — it doesn't support the standard two-new-bubble
template.

### Structure (Consolidation template C) — agreed

- **New theme:** `Material Escolar` → `THEME_LABELS` `"🎒 Material Escolar"`,
  `THEME_TOTAL_COUNTS` `17` (12 objects + 5 helpers). Do the full §7 checklist.
- **Colour accent:** continues teal, or starts a fresh cycle back to green
  (Unit-1 finale). 🟡 minor — pick when building.

| Node | Id | Type | Contents |
|---|---|---|---|
| Revision | `r9` | 1 crown | **Repaso: Colores y Opiniones** — pool = `BUBBLE_22_LEVELS` + `BUBBLE_24_LEVELS`, weakest-first |
| Study | `b27` | **3 crowns / 3 levels** | **Material Escolar** (see levels below) |
| Game | `b28` | — | **En mi mochila** packing game (`MochilaGame.start(6)`), §8.1 |
| Mix | `b29` | 2 crowns | **La mochila mágica** — grammar-engine recombination, §8.2, **no new words** |
| Exam | `b30` | pass/fail | **Examen del Capítulo 1.6** |

**`b27` levels:**
- L1 (objects): `el bolígrafo, el lápiz, el cuaderno, el libro, la goma, la regla`
- L2 (objects): `el estuche, el sacapuntas, la hoja de papel, las tijeras, el libro de texto`
- L3 (structure): `hay…, la mochila, un, una, mi, en`

`b27` stays **out of** the `isMax2` list so all 3 levels are reachable.

**`b30` boss sentence** (generated by the §8.2 engine, template T1 + a T2 clause):
*"En mi mochila hay tres bolígrafos rojos y una regla verde."*
English gloss: *"In my backpack there are three red pens and a green ruler."*

### Helper words — APPROVED by Juan (2026-09-10)
`un`, `una`, `mi`, `en`, `la mochila`. Added to `VOCAB_DATABASE`, introduced in
`b27` L3. Logged in §6.1. `la mochila` is **not** added to the CSV (it's glue for
the game/mix, not a Claro 1.6 vocab item).

### Plurals
Not drilled as their own `VOCAB_DATABASE` entries. Plural forms live only in the
§8.2 `ESCOLAR_NOUNS` morphology table and are only ever *shown* (in generated
sentences / the game's list panel), never *asked for in isolation*.

### Numbers used in 1.6 sentences
`dos`–`nueve` only (from `b14`, chapter 1.3). All invariable — avoids `un/uno`
apocope and `veintiún` edge cases.

---

## 12. Full checklist — adding a chapter

Vocabulary & data
- [ ] Words confirmed with Juan; CSV updated if needed
- [ ] Any helper words approved by Juan + logged in §6.1 + given an intro card
- [ ] `VOCAB_DATABASE` entries added (every one has a valid `theme`)
- [ ] `BUBBLE_NN_LEVELS` const(s) added
- [ ] §7 theme checklist done (if a new theme)
- [ ] **§0 Rule 2 pass:** every word in every game / revision / mix / checkpoint
      node traced to a study bubble above it on the map

Map HTML
- [ ] `.chapter-header-divider` block (badge / title / subtitle, `chapter-N` class)
- [ ] `.bubble-wrapper` for each node (progress ring SVG with unique `id`s,
      `bubble-emoji`, `bubble-crown-badge`, `bubble-label`,
      alternating `bubble-left` / `bubble-right`)
- [ ] `onclick` wired: `startStudySession(NN)` / `startStudySession('rN')` /
      `<Engine>.start(N)` / `startCheckpointTest(N)`

Logic
- [ ] `defaultStateKeys` in `loadProgress()` — add `bNN_crown`, `rN_crown`,
      `bNN_completed`, `game*_unlocked_1_N`
- [ ] `resetBuhisimoData()` — same keys added (keep in sync!)
- [ ] `renderMap()` — a render block per bubble (lock/active/gold class + ring
      offset + colour). Use the backward-compat unlock idiom:
      `state.<prev> >= X || state.<next-thing started> || state.<this> > 0`
- [ ] `startStudySession()` — lock-guard `if` per bubble + `levelsPool` wiring +
      `isMax2` entry if 2-crown
- [ ] `startCheckpointTest()` — lock guard, `fullPool`, `session.bubbleNum` map
- [ ] `triggerLastChanceChallenge()` — boss card for the new chapter
- [ ] `completeLesson()` — crown-increment branch per bubble (XP, titles, game
      unlock flags, `bNN_completed`)

Games
- [ ] `GAME_WORDS_1_N` / `GAME_SENTENCES_1_N` in the chosen engine files
- [ ] engine list-picker ternary extended
- [ ] new engine (if any): `games/<name>/` files, `<script>`+`<link>` in head,
      IIFE shape matches §8, unlock-flag + completion wired
- [ ] mix engine (consolidation chapters): morphology tables keyed only by
      already-introduced words, templates hand-verified, `validateMixEngine()`
      output reviewed by Juan

UI polish
- [ ] `unit-banner` scroll handler covers the new divider
- [ ] FAB colour branch (`focus-bubble-btn`) if a new colour band
- [ ] No inline `style=` — use CSS classes (per the banner at the top of the file)

Test
- [ ] Fresh state: whole chapter reachable, each bubble → crown → game → exam
- [ ] Legacy state (old `buhisimo_progress` without the new keys) still loads
- [ ] Checkpoint fail path + boss challenge works
