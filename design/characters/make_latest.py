#!/usr/bin/env python3
"""Builds latest.html: a gallery of the newest Buhísimo character art. Re-run after new images are generated."""
from pathlib import Path
HERE = Path(__file__).parent

sections = [
    ('Buhísimo · species-accurate', 'Round head, no ear tufts (made with NAG negative prompts). The third try (seed 3) is the most consistent set and is the one sent to the prototype.',
     [(f'owl_fix/pose_{p}_s{s}.png', f'{p} · try {s}', s == 3) for s in (1, 2, 3) for p in ('explaining', 'celebrating', 'encouraging', 'thinking')], 'sq'),
    ('The Restrepo family · line-up (latest)', 'Second attempt: colour palette described without "houses", NAG at strength 2 and 3.',
     [(f'family_fix2/family_nag{n}_s{s}.png', f'family · NAG {n} · try {s}', False) for n in (2, 3) for s in (1, 2)], 'wide'),
    ('The Restrepo family · one by one (latest)', 'Raúl (Papá), María (Mamá), Valentina (12) and Samuel (13), with nothing behind them.',
     [(f'family_fix2/{n}_s{s}.png', f'{n.capitalize()} · try {s}', False) for n in ('raul', 'maria', 'valentina', 'samuel') for s in (1, 2)], 'sq'),
    ('Matilda & Max · the visitors from Melbourne (latest)', 'Redrawn with nothing behind them.',
     [(f'family_fix2/{n}_s{s}.png', f'{n.capitalize()} · try {s}', False) for n in ('matilda', 'max') for s in (1, 2)], 'sq'),
    ('Amazon friends · new', 'Chigüi the chigüiro (with a leaf, not the shop-style bird) and Pereza the sloth hanging upside down. For the 2.3 trip.',
     [(f'art_round5/{n}_s{s}.png', f'{n.capitalize()} · try {s}', False) for n in ('chigui', 'pereza') for s in (1, 2, 3)], 'sq'),
    ('Matilda · expressions', 'Wave, cold, surprised, thinking, celebrating: for feedback and stories.',
     [(f'art_round5/matilda_{p}_s{s}.png', f'{p} · try {s}', False) for p in ('wave', 'cold', 'surprised', 'thinking', 'celebrate') for s in (1, 2)], 'sq'),
    ('Max · expressions', 'Wave, surprised, thinking, thumbs up, jumping.',
     [(f'art_round5/max_{p}_s{s}.png', f'{p} · try {s}', False) for p in ('wave', 'surprised', 'thinking', 'celebrate', 'jump') for s in (1, 2)], 'sq'),
    ('Pictures for 1.1 nouns', 'For new-word cards: el mapa, el mundo, el país, la capital, el monumento. Note: an AI-drawn country outline may not be geographically exact; for el país a real Colombia outline would be safer.',
     [(f'art_round5/noun_{n}_s{s}.png', f'{lbl} · try {s}', False) for n, lbl in (('mapa', 'el mapa'), ('mundo', 'el mundo'), ('pais', 'el país'), ('capital', 'la capital'), ('monumento', 'el monumento')) for s in (1, 2)], 'sq'),
    ('Settings', 'Map background (Cocora wax palms up to Salento) and a Salento street, chunky style with Salento colours. Try 2 of the map and try 1 of the street went into the prototype.',
     [('../prototype_art/map_background_s1.png', 'map · try 1', False), ('../prototype_art/map_background_s2.png', 'map · try 2', True),
      ('../prototype_art/salento_street_s1.png', 'street · try 1', True), ('../prototype_art/salento_street_s2.png', 'street · try 2', False)], 'mixed'),

    ('The prototype · screenshots', 'From buhisimo/prototype/ (one 1.1 lesson). Open prototype/index.html via a local server, or online once it is published.',
     [(f'../../../buhisimo/prototype/screenshots/{n}.webp', n.split('-', 1)[1].replace('-', ' '), False) for n in
      ('01-path-start', '03-lesson-intro', '05-lesson-pick-selected', '06-lesson-pick-feedback-wrong', '08-lesson-listen', '13-lesson-tiles-built',
       '17-lesson-type-fixup', '19-lesson-type-feedback', '21-lesson-match', '25-lesson-speak', '32-complete', '33-path-after', '34-settings', 'desktop-1366-path', 'desktop-1366-pick-keys', 'desktop-1366-type-accent-bar', 'desktop-1366-complete', 'tablet-820-path')], 'phone'),
    ('First family attempt (for comparison)', 'Houses crept in because the style text mentioned Salento\'s houses; the line-up came out washed out.',
     [(f'family_fix/{n}.png', n.replace('_s', ' · try '), False) for n in
      ('family_s1', 'family_s2', 'family_s3', 'raul_s1', 'maria_s1', 'valentina_s1', 'samuel_s1', 'matilda_s1', 'max_s1')], 'sq'),
]

cards = []
for title, note, imgs, kind in sections:
    figs = []
    for src, cap, chosen in imgs:
        exists = (HERE / src).exists()
        img = f'<img loading="lazy" src="{src}" alt="{cap}">' if exists else '<div class="missing">not generated yet</div>'
        figs.append(f'<figure class="{"chosen" if chosen else ""}" data-src="{src}">{img}<figcaption>{cap}{" · <b>in prototype</b>" if chosen else ""}</figcaption></figure>')
    cards.append(f'<section><h2>{title}</h2><p>{note}</p><div class="grid {kind}">{"".join(figs)}</div></section>')

html = f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Buhísimo latest art</title>
<style>
  :root {{ --bg:#fbf7f1; --card:#fff; --ink:#2b2118; --muted:#7a6a5b; --accent:#0fb5ae; --chosen:#e0218a; }}
  @media (prefers-color-scheme: dark) {{ :root {{ --bg:#1c1814; --card:#2a241e; --ink:#f4ece2; --muted:#b9a993; }} }}
  * {{ box-sizing: border-box; }}
  body {{ margin:0; background:var(--bg); color:var(--ink); font-family: system-ui, sans-serif; padding: 24px 16px 60px; }}
  main {{ max-width: 1400px; margin: 0 auto; }}
  h1 {{ margin: 0 0 4px; font-size: 2rem; }} h1 span {{ color: var(--accent); }}
  .lead {{ color: var(--muted); margin: 0 0 8px; }}
  nav a {{ color: var(--accent); margin-right: 14px; font-size: .95rem; }}
  section {{ margin-top: 34px; }} h2 {{ margin: 0 0 4px; }} section > p {{ color: var(--muted); margin: 0 0 12px; max-width: 80ch; }}
  .grid {{ display: grid; gap: 12px; }}
  .grid.sq {{ grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); }}
  .grid.wide {{ grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); }}
  .grid.phone {{ grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }}
  .grid.mixed {{ grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); align-items: start; }}
  figure {{ margin:0; background:var(--card); border-radius:14px; padding:8px; box-shadow:0 1px 4px rgba(0,0,0,.08); cursor: zoom-in; border: 3px solid transparent; }}
  figure.chosen {{ border-color: var(--chosen); }}
  figure img {{ width:100%; height:auto; display:block; border-radius:8px; background:#fff; }}
  figcaption {{ font-size: 13px; color: var(--muted); margin-top: 6px; }} figcaption b {{ color: var(--chosen); }}
  .missing {{ aspect-ratio: 1; display:grid; place-items:center; color: var(--muted); font-size: 13px; }}
  #box {{ position: fixed; inset: 0; background: rgba(0,0,0,.85); display: none; place-items: center; z-index: 10; cursor: zoom-out; padding: 16px; }}
  #box img {{ max-width: 100%; max-height: 100%; border-radius: 10px; background:#fff; }}
  #box.open {{ display: grid; }}
</style></head><body><main>
<h1>Buhísimo <span>latest art</span></h1>
<p class="lead">Chunky app style with Salento colours. Click any image to enlarge. Pink border = used in the prototype.</p>
<nav>Earlier rounds: <a href="art_directions_3.html">round 3</a><a href="art_directions_2.html">round 2</a><a href="art_directions.html">round 1</a><a href="compare.html">first test</a></nav>
{"".join(cards)}
</main>
<div id="box"><img alt=""></div>
<script>
  const box = document.getElementById('box'), big = box.querySelector('img');
  document.querySelectorAll('figure[data-src]').forEach(f => f.addEventListener('click', () => {{ big.src = f.dataset.src; box.classList.add('open'); }}));
  box.addEventListener('click', () => box.classList.remove('open'));
  document.addEventListener('keydown', e => {{ if (e.key === 'Escape') box.classList.remove('open'); }});
</script>
</body></html>'''
(HERE / 'latest.html').write_text(html, encoding='utf-8')
print('wrote latest.html')
