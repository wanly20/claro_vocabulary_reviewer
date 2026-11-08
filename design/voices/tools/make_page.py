"""Build design/voices/index.html from the candidates, whisper results and notes."""
import json, re, statistics as st
from pathlib import Path
from candidates import CANDIDATES, TEST_LINES, REF_TEXT, S

V = Path.home() / "Documents/spanish/spanish_app/design/voices"
W = json.load(open(f"{S}/whisper_clone.json"))
WD = json.load(open(f"{S}/whisper_design.json"))
PICK = dict(maria_bogota_warm=202, maria_paisa_warm=101, maria_bogota_bright=101,
            maria_paisa_bright=101, buho_abuelo_bogota=101, buho_paisa_cuentero=303,
            buho_profesor=101)

NOTES = {
 "maria_bogota_warm": dict(rec="Recommended for María",
   accent="Bogotá (rolo) by design. The clone keeps the timbre; listen for whether it still sounds Colombian.",
   clarity="10/10 lines transcribed exactly. Steady pitch (median 189 Hz). The lowest, most adult-sounding María.",
   speed="Unhurried reference take (15.0 s). The cloned lines speak at a natural pace, like the other Marías.",
   extra="Seeds vary a lot: the other two takes came out at 244 Hz and 269 Hz and probably sound younger."),
 "maria_paisa_warm": dict(rec="Runner-up for María",
   accent="Paisa / coffee region by design, which fits Salento best on paper.",
   clarity="10/10 exact. The most stable pitch of all the candidates (median 231 Hz, very little drift).",
   speed="The slowest María reference (15.9 s). The cloned lines speak at a natural pace.",
   extra="Choose this one over Bogotá-warm if her accent sounds more Colombian to you."),
 "maria_bogota_bright": dict(rec="",
   accent="Bogotá by design. Bright and crisp.",
   clarity="10/10 exact in clone mode. In ICL mode it swallowed the first sound (heard as 'Emundo', 'Emapa').",
   speed="Medium pace.",
   extra="Higher voice (246 Hz in the clone; the other takes were 311–328 Hz). It may read as early 20s rather than 38."),
 "maria_paisa_bright": dict(rec="",
   accent="Paisa, 'from Salento in Quindío' by design. Sing-song and expressive.",
   clarity="10/10 exact in clone mode. Direct voice design slipped into English ('Mex is the Australia').",
   speed="The quickest María reference (14.0 s).",
   extra="The highest-pitched María (256 Hz in the clone). Lively, but it risks sounding young."),
 "buho_profesor": dict(rec="Recommended for Buhísimo",
   accent="Neutral Colombian by design. Resonant baritone.",
   clarity="10/10 exact. The clone keeps the deep voice (median 103 Hz) and holds it steadily.",
   speed="Medium-slow (14.0 s reference).",
   extra="Clearly lower than Raúl (143 Hz), so the two won't be confused."),
 "buho_abuelo_bogota": dict(rec="Runner-up for Buhísimo",
   accent="Bogotá grandfather by design. Husky and gentle.",
   clarity="10/10 exact in clone mode.",
   speed="The slowest reference of all (16.5 s). Storyteller pace.",
   extra="In clone mode the pitch rose to about 150 Hz, close to Raúl's 143 Hz. Take s303 (87 Hz, very deep) could be re-cloned if you prefer its sound."),
 "buho_paisa_cuentero": dict(rec="Not recommended",
   accent="Paisa storyteller by design.",
   clarity="9/10: 'Matilda es de' blurred to 'Matilda S. de'. The pitch is unstable across lines.",
   speed="Medium.",
   extra="All three takes came out at 169–218 Hz: too high for an older man, and too close to Raúl."),
 "raul_co_m_30": dict(rec="Good enough for Raúl",
   accent="The existing co_m_30 reference (Colombian, voice-designed earlier).",
   clarity="10/10 exact in clone mode (median 143 Hz). ICL mode clipped the lines (average 0.8 s of speech) and isn't usable.",
   speed="Natural; slightly brisker than the Marías.",
   extra="The reference itself sits at about 172 Hz, a fairly light adult voice. It reads as 30-ish rather than 40."),
}

LINE_TEXT = dict(TEST_LINES)


def norm(s):
    return re.sub(r"[^a-zñáéíóúü ]", "", s.lower()).strip()


def lines_for(key, mode):
    out = []
    for n, t in TEST_LINES:
        f = f"{S}/raw/clone/{key}__{mode}__{n}.wav"
        r = W.get(f)
        heard = r["text"] if r else ""
        out.append(dict(n=n, text=t, file=f"lines/{key}__{mode}__{n}.mp3",
                        heard=heard, ok=bool(r) and norm(heard) == norm(t)))
    return out


def stats(key, mode):
    f0 = [W[f"{S}/raw/clone/{key}__{mode}__{n}.wav"]["f0"] for n, _ in TEST_LINES]
    f0 = [x for x in f0 if x]
    return round(st.median(f0)) if f0 else None


cards = []
order = ["maria_bogota_warm", "maria_paisa_warm", "maria_bogota_bright", "maria_paisa_bright",
         "buho_profesor", "buho_abuelo_bogota", "buho_paisa_cuentero", "raul_co_m_30"]
for key in order:
    if key == "raul_co_m_30":
        c = dict(role="Raúl", label="co_m_30 (existing)",
                 desc="Existing reference conversations/voices/co_m_30.wav (Colombian adult man).")
        takes = [dict(seed="ref", file="takes/raul_co_m_30__ref.mp3", chosen=True,
                      f0=round(WD[str(Path.home() / 'Documents/video_generation/conversations/voices/co_m_30.wav')]['f0']),
                      dur=11.7)]
        modes = [("xvec", "Clone (x-vector), production mode"), ("iclpad", "Clone (ICL mode), not usable")]
    else:
        c = CANDIDATES[key]
        takes = []
        for seed in (101, 202, 303):
            r = WD[f"{S}/raw/design/{key}__s{seed}.wav"]
            takes.append(dict(seed=f"s{seed}", file=f"takes/{key}__s{seed}.mp3",
                              chosen=seed == PICK[key], f0=round(r["f0"]), dur=round(r["dur"], 1)))
        modes = [("xvec", "Clone (x-vector), production mode"),
                 ("design", "Direct voice design, for comparison"),
                 ("iclpad", "Clone (ICL mode), not usable")]
    cards.append(dict(key=key, role=c["role"], label=c["label"], desc=c["desc"],
                      ref=None if key == "raul_co_m_30" else f"refs/{key}.wav",
                      takes=takes, f0=stats(key, "xvec"), notes=NOTES[key],
                      modes=[dict(id=m, title=t, lines=lines_for(key, m)) for m, t in modes]))

data = dict(cards=cards, lines=TEST_LINES, ref_text=REF_TEXT)
html = Path(f"{S}/bin/page_template.html").read_text().replace("__DATA__", json.dumps(data, ensure_ascii=False))
(V / "index.html").write_text(html)
print("wrote", V / "index.html")
