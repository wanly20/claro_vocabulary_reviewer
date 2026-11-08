"""Candidate voice descriptions + test script (shared by the job builders)."""

S = "/tmp/claude-1000/-home-wanly-Documents-teaching-app/b9b0b658-241b-47c1-a577-9ccdb61e02d6/scratchpad"

REF_TEXT = ("Hola, buenos días. Me llamo Alex y vivo en una ciudad grande. "
            "Hoy hace buen tiempo, así que voy a pasear por el parque. "
            "Me gusta mucho leer, escuchar música y jugar al fútbol con mis amigos.")

CANDIDATES = {
    # ---- María (Mamá, ~38) ----
    "maria_bogota_warm": dict(role="María", label="Bogotá, warm",
        desc="A warm, kind Colombian woman, about 38 years old, speaking Spanish with a clear, "
             "soft Bogotá accent. Medium-low pitch, gentle and caring like a loving mother. "
             "She speaks slowly and calmly, articulating every word very clearly for beginners."),
    "maria_paisa_warm": dict(role="María", label="Paisa (coffee region), warm",
        desc="A warm, friendly Colombian woman, about 37 years old, from the coffee region of "
             "Colombia, speaking Spanish with a soft paisa accent and gently melodic intonation. "
             "Medium pitch, smiling, affectionate tone. Unhurried, clear and easy to understand."),
    "maria_bogota_bright": dict(role="María", label="Bogotá, bright",
        desc="A bright, cheerful Colombian woman, about 35 years old, speaking Spanish with a "
             "polite Bogotá accent. Medium-high pitch, clear, crisp and energetic but never fast. "
             "Friendly teacher-like delivery, careful pronunciation, slow steady pace."),
    "maria_paisa_bright": dict(role="María", label="Paisa (coffee region), bright",
        desc="A lively, bright Colombian mother, about 38 years old, from Salento in Quindío, the "
             "Colombian coffee region. Spanish with a clear paisa coffee-region accent, warm and "
             "sing-song. Expressive and joyful, but she speaks slowly and pronounces every word clearly."),
    # ---- Buhísimo (owl guide, older wise man) ----
    "buho_abuelo_bogota": dict(role="Buhísimo", label="Grandfather, Bogotá",
        desc="An older Colombian man, about 68 years old, a wise and kind grandfather. Deep, warm, "
             "slightly husky voice, speaking Spanish with a calm, clear Bogotá accent. Slow, gentle, "
             "patient pace, as if telling a story to children."),
    "buho_paisa_cuentero": dict(role="Buhísimo", label="Paisa storyteller",
        desc="An older Colombian man, about 62 years old, from the Colombian coffee region, a warm "
             "and wise storyteller. Rich low voice with a friendly paisa accent and a smile in it. "
             "Unhurried, clear and expressive, with a hint of playful humour."),
    "buho_profesor": dict(role="Buhísimo", label="Wise professor",
        desc="A mature Colombian man, about 58 years old, a wise, warm professor. Resonant baritone "
             "voice, very clear diction, neutral Colombian Spanish accent. Calm, encouraging and "
             "slow, slightly theatrical and proud when he pronounces words carefully."),
}

TEST_LINES = [
    ("01", "¿De dónde eres?"),
    ("02", "Soy de Colombia."),
    ("03", "Max es de Australia."),
    ("04", "Matilda es de Melbourne."),
    ("05", "España."),
    ("06", "El país."),
    ("07", "La capital."),
    ("08", "Colombia es famosa."),
    ("09", "El mundo."),
    ("10", "El mapa."),
]
