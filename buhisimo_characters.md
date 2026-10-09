# Buhísimo: Character & World Bible

*v0.2, 9 Oct 2026. Names, ages, Buhísimo's gender and the Amazon trip timing confirmed by Juan. Art style still being explored.*

---

## 1. The premise (one paragraph students could read)

**Matilda** (a koala) and **Max** (a kangaroo) fly from Melbourne to Colombia to stay with the **Restrepo family** in Salento, next to the **Cocora Valley**. They want to talk to everyone they meet, so they learn Spanish one step at a time, just like the students. Their guide is **Buhísimo**, a spectacled owl who knows every corner of Colombia and loves Spanish (especially the accents). Later in the year the family takes them on a trip to **Leticia, in the Amazon**, where they meet the chigüiro, the sloth and other friends.

**Why this works for learning:** Matilda and Max *are* the students: English speakers, from Melbourne, learning Spanish from zero. Every lesson has a reason ("Max needs to say where he's from"). They can carry the English in instructions early on, then use more and more Spanish as the year goes on.

---

## 2. Settings

### Home base: Salento and the Cocora Valley (Quindío, coffee region)
- **Wax palms** (*palma de cera*): Colombia's national tree, the tallest palms in the world (up to about 60 m), standing in green hills.
- **Cloud forest:** fog that rolls in every afternoon, cold mornings and rain. This makes it ideal for *hace frío*, *hay niebla* and *llueve*.
- **Salento town:** colourful houses with painted balconies and doors, a plaza, and the famous colourful **Willys jeeps** used as taxis up to the valley.
- **Coffee farms** on the hills.

### The trip: Leticia and the Amazon (Amazonas)
- Hot, humid rainforest with very heavy rain: *hace calor*, *llueve mucho*.
- The Amazon river, wooden river boats, and Colombia's border with Brazil and Peru.
- **Confirmed:** the trip starts in **2.3 (animals)**, so the Amazon animals arrive with that unit's vocabulary. Unit **3.4 (weather)** then compares the two places: *En Leticia hace calor. En Cocora hace frío y hay niebla.*

---

## 3. Cast, introduced gradually

Start small, add characters as the units need them (Duolingo did the same).

| When | Character | Who | Setting |
|---|---|---|---|
| 1.1 | **Buhísimo** | spectacled owl (*búho de anteojos*), the guide | everywhere (he flies) |
| 1.1 | **Matilda** | koala, visitor from Melbourne, ~12 | Salento → Amazon |
| 1.1 | **Max** | kangaroo, visitor from Melbourne, ~13 | Salento → Amazon |
| 1.3 | **Valentina** | the Restrepo daughter, 12 | Salento |
| 1.3 | **Samuel** | the Restrepo son, 13 | Salento |
| 2.2 | **Raúl and María Restrepo** (Papá and Mamá) | the parents, introduced with the family unit | Salento |
| 2.3 | **Chigüi** | chigüiro (capybara) | Amazon |
| 2.3 | **Pereza** | sloth (*el oso perezoso*) | Amazon |
| 2.6 / 3.x | later | spectacled bear, toucan, jaguar, pink river dolphin, yellow-eared parrot | Cocora / Amazon |

**Names:** every name goes into `names.csv` with its section. That's 8 new names by 2.3; worth keeping that number low.
- The listening conversations already use Mateo, Valentina, Lucía and others as one-off characters. If the daughter is called Valentina, conversation M2 ("Valentina se presenta") should either become *her* introduction or be renamed.
- The family surname "Restrepo" is a very common coffee-region surname. Change it freely.

### Character sheets

**Buhísimo**, the spectacled owl (guide and narrator)
- **Look:** dark brown, cream chest, the white "spectacles" around big yellow eyes. A small *mochila wayuu* bag across his body (*la mochila* is a 1.6 helper word).
- **Personality:** warm, patient, a little proud of his Spanish. Celebrates every effort. *Inteligente* (2.6), *simpático*.
- **Running joke:** he cares a LOT about accents and the ñ. He's the face of the accent fix-up activity.
- **Voice:** adult Colombian man, older and warmer than Papá (a new Qwen voice design; see §5).

**Matilda**, the koala (visitor)
- **Look:** grey fur, big fluffy ears, black nose. In Cocora she's always wrapped in a *ruana* (Andean wool poncho) because she's always cold.
- **Personality and arc:** starts **tímida** (shy, 2.6) and becomes **sociable** (3.6) by the end of the year. That's the same journey students make with speaking.
- **Running joke:** always cold in Cocora (*¡Hace frío!*), and likes sleeping (koalas sleep about 18 hours a day).
- **Voice:** to test. A clear young female voice.

**Max**, the kangaroo (visitor)
- **Look:** sandy brown, long feet, wears a Colombia football shirt he bought on day one.
- **Personality:** *entusiasta*, *activo*, *deportista* (3.2), *rápido*. Says yes to everything.
- **Running joke:** he can't sit still and jumps everywhere, sometimes a bit too far.
- **Voice:** to test. A clear young male voice.

**Valentina Restrepo**, daughter, 12
- **Look:** dark curly hair, *mochila wayuu*, bright colours, *alpargatas*.
- **Personality:** *divertida*, *generosa*, loves music and *bailar salsa* (3.1). Matilda's best friend.
- **Voice:** Colombian teen girl (`co_f_teen`). Test quality first.

**Samuel Restrepo**, son, 13
- **Look:** short dark hair, no hat, jeans and a t-shirt, a *carriel* (coffee-region leather bag).
- **Personality:** *inteligente*, a bit *nervioso* before football matches; he plays with Max.
- **Running joke:** knows every fact about the wax palms and tells everyone.
- **Voice:** Colombian teen boy (`co_m_teen`). Test quality first.

**Raúl (Papá) and María (Mamá) Restrepo**
- **Look:** everyday coffee-region clothes. Papá in a *ruana* and hat on cold mornings; Mamá in a *guayabera*-style blouse, with a *pollera colorá* for the 3.5 music/fiesta scene.
- **Personality:** warm, funny, never strict in a mean way. They're the "adult" voices for sentences like *¿Cuántos años tienes?*
- **Voices:** Papá = `co_m_30`; Mamá = a new adult Colombian female voice (see §5).

**Chigüi**, the chigüiro (from 2.3)
- **Look:** round, brown, small ears, calm half-closed eyes. Often a little bird (*el pájaro*, 2.3) sitting on his head.
- **Personality:** the calmest animal in the world (true of real capybaras). *Simpático* and *generoso*: everyone sits on him.
- **Voice:** to choose. A deep, slow male voice.

**Pereza**, the sloth (from 2.3)
- **Look:** shaggy beige, a permanent sleepy smile, hangs from branches.
- **Personality:** proudly *perezoso* (2.6), and *perezoso* is also the Spanish word for sloth, which is the joke. Always last, never worried, everyone waits kindly.
- **Running joke:** arrives at the end of every story: *"¡Hola!… ¿Qué tal?"* when everyone is already leaving.

### Later characters (ideas, not yet designed)
- **Spectacled bear** (Cocora): big, gentle, *torpe* (clumsy, 2.6). Knocks things over, then apologises.
- **Yellow-eared parrot** (Cocora): lives in the wax palms. A social-media star for 3.6 (*la red social, los seguidores, 'me gusta'*). Parrots repeat things, which is the joke.
- **Toucan** (Amazon): the singer for 3.5 (*el/la cantante, la canción*). Could have a Mexican accent.
- **Jaguar** (Amazon): looks *feroz* and *enorme* (2.3) but is actually *tímido*. That twist keeps it kind. Could have an Argentine accent.
- **Pink river dolphin** (Amazon): playful, *rápido*.

---

### Posture rules (decided 8 Oct)
- **Most animal characters stand upright** (Buhísimo, Matilda, Max, Chigüi), so they can gesture, carry things and show emotion.
- **Birds stay bird-shaped** (the toucan perches naturally). **The jaguar stays on four legs.** **The sloth hangs upside down** from branches.
- **Buhísimo is species-accurate** (round head with no ear tufts, white "spectacle" markings, yellow eyes) **and also wears real glasses**, a pun on *búho de anteojos*.

## 4. Kindness rules (non-negotiable)

1. **Jokes come from a character's own trait** (the sloth is slow, the bear is clumsy, Matilda is cold). Others react with kindness, never mockery.
2. **No character insults another.** Words like *feo/a, gordo/a, tonto/a, antipático/a, arrogante, agresivo/a* are **never** used about the main cast. They appear only with the 2.4 fairy-tale world (*el rey, la reina, la princesa*, "Espejito, espejito…") or in neutral grammar practice with no target.
3. **Mistakes are celebrated.** When a character gets Spanish wrong, someone helps.
4. **Cultural respect.** Clothing, food and places are shown as real everyday Colombia, not costumes. If we ever show Amazon Indigenous communities (e.g. the Ticuna people around Leticia), do it accurately and respectfully, ideally checked with someone from that community. Default: don't depict them.
5. **All dialogue follows the vocabulary rules**: only CSV words, `helper_words.csv` and `names.csv` entries already introduced at that point. Catchphrases above are character *ideas*; their exact Spanish wording must pass the checker for the unit where they're used.

---

## 5. Voices (to finalise after testing)

| Character | Voice | Status |
|---|---|---|
| Papá Restrepo | `co_m_30` (Colombian adult man) | exists |
| Mamá Restrepo | new adult Colombian woman (Qwen voice design → saved reference) | to make |
| Buhísimo | new older Colombian man (warm, wise) | to make |
| Valentina, Samuel | `co_f_teen`, `co_m_teen` | exist, quality to check |
| Matilda, Max | young clear voices | to choose |
| Chigüi, animals | to choose; some from other countries | later |
| Word audio (every non-gendered word in both voices) | Mamá's and Papá's voices | after Mamá's voice exists |

---

## 6. Art style guide

**App: flat and simple.**
- Rounded shapes, thick dark outline (the same width on every character), 3–4 flat colours per character, no gradients or texture.
- Big expressive eyes. Readable at 64 px on a phone.
- **Each character needs:** a front pose plus 6 expressions (happy, celebrating, surprised, confused, cold/shivering, sleepy). The app uses them for feedback, e.g. Buhísimo celebrating a correct answer.

**Worksheets: line art from the same drawings.**
- The black-and-white version is the same drawing with the colours removed, so characters look identical in the app and on paper.
- **Cognitive load rule:** a picture goes on a worksheet only when it *carries the meaning* (dual coding: Matilda shivering means *hace frío*). No decorative pictures, which distract (the "seductive details" effect). Full colouring pages only as early-finisher or homework extras.

**Backgrounds:** simple flat shapes. Cocora's wax palms and fog, Salento's coloured balconies, the Amazon river and canopy.

---

## 7. Decisions log

- 9 Oct: **design phase before the engine** (design system + one-lesson phone prototype). Prototype art: **chunky app style with Salento colours**. Samuel does **not** wear a sombrero vueltiao (AI kept drawing a Mexican sombrero). Font: playful and bubbly is fine, but the Spanish text must be absolutely legible.
- 9 Oct: names kept (Matilda, Max, Valentina, Samuel, Chigüi, Pereza, Restrepo). Parents are **Raúl** and **María**. Buhísimo is **male**. Matilda and Max are **12–13**. The Amazon trip happens in **2.3**. All names are recorded in `names.csv` with their sections.
- 8 Oct: posture rules (see §3). Name stays Buhísimo. Home base Salento/Cocora.

## 8. Still open

- Art style (exploring: `design/characters/*.html`).
- Voices for Matilda, Max, Buhísimo and the animals (to test).
