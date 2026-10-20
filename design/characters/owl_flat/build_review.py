#!/usr/bin/env python3
"""Builds index.html, thumbs/ and contact_sheet.png from picks.json: per pose, the old (NAG 3) prototype owl,
the chosen seed (teal border) and every other seed with its note; plus the current prototype Max and Matilda
for style comparison. Adapted from ../remake_flat/build_review.py."""
import json, html
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ASSETS = Path.home() / "Documents/spanish/buhisimo/prototype/assets"
picks = json.load(open(HERE / "picks.json"))
T = HERE / "thumbs"; T.mkdir(exist_ok=True)
esc = html.escape

def thumb(src: Path, name: str, size=360):
    im = Image.open(src).convert("RGBA")
    bg = Image.new("RGBA", im.size, "white"); bg.alpha_composite(im)
    im = bg.convert("RGB"); im.thumbnail((size, size))
    canvas = Image.new("RGB", (size, size), "white")
    canvas.paste(im, ((size - im.width) // 2, (size - im.height) // 2))
    canvas.save(T / name, quality=86)
    return canvas

refs = [(n, thumb(ASSETS / f"{n}.webp", f"ref_{n}.jpg")) for n in picks["style_refs"]]
ref_figs = "".join(f'<figure class="ref"><img src="thumbs/ref_{n}.jpg" alt="Current {n}"><figcaption>Current {n}.webp</figcaption></figure>' for n, _ in refs)

secs, sheet_rows = [], []
for a in picks["assets"]:
    name, stem, best = a["asset"], a["stem"], a["seed"]
    old = thumb(ASSETS / f"{name}.webp", f"old_{name}.jpg")
    figs = [f'<figure class="ref"><img src="thumbs/old_{name}.jpg" alt="Old {esc(name)}"><figcaption>Old (NAG 3, in the prototype)</figcaption></figure>']
    row = [old]
    for s in [best] + a.get("runners", []) + [int(k) for k in a.get("rejected", {})]:
        f = f"{stem}_s{s}.png"; im = thumb(HERE / f, f"{stem}_s{s}.jpg"); row.append((s, im))
        if s == best: cls, cap = "best", f"Pick · seed {s}"
        elif s in a.get("runners", []): cls, cap = "", f"Runner-up · seed {s}"
        else: cls, cap = "rej", f"Rejected · seed {s}: {a['rejected'][str(s)]}"
        figs.append(f'<figure class="{cls}"><a href="{f}"><img src="thumbs/{stem}_s{s}.jpg" alt="{esc(name)} seed {s}" loading="lazy"></a><figcaption>{esc(cap)}</figcaption></figure>')
    sheet_rows.append((name, best, row))
    secs.append(f'<section><h2><code>{esc(name)}.webp</code></h2><p>{esc(a["note"])}</p><div class="row">{"".join(figs)}</div></section>')

page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Buhísimo flat remake</title><style>
:root{{--bg:#faf8f3;--card:#fff;--ink:#22303a;--muted:#5d6b75;--accent:#1fa39d;--line:#e6e0d4}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{--bg:#172026;--card:#1f2a31;--ink:#eef2f3;--muted:#a9b6bd;--accent:#4fd1c9;--line:#33434d}}}}
:root[data-theme="dark"]{{--bg:#172026;--card:#1f2a31;--ink:#eef2f3;--muted:#a9b6bd;--accent:#4fd1c9;--line:#33434d}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,sans-serif}}
main{{max-width:1100px;margin:0 auto;padding:16px}}h1{{font-size:1.5rem;margin:.2em 0}}
section{{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin:16px 0}}
h2{{font-size:1.1rem;margin:0 0 4px}}p{{color:var(--muted);margin:4px 0 10px}}
.row{{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}}
figure{{margin:0;border:2px solid var(--line);border-radius:10px;overflow:hidden;background:#fff}}figure img{{width:100%;display:block;aspect-ratio:1}}
figcaption{{font-size:.85rem;text-align:center;padding:4px;color:#5d6b75}}figure.ref{{background:#f3f1ec}}figure.ref figcaption{{font-style:italic}}
figure.best{{border-color:var(--accent);border-width:3px}}figure.best figcaption{{color:#16827d;font-weight:700}}
figure.rej img{{opacity:.55}}code{{font-size:.95em}}
</style></head><body><main><h1>Buhísimo flat remake (20 Oct)</h1>
<p>{esc(picks["intro"])}</p><p><a href="contact_sheet.png">Contact sheet</a> · <a href="prompts.json">prompts.json</a> · <a href="picks.json">picks.json</a></p>
<section><h2>Style references: current Max and Matilda</h2><p>The approved flat style (prototype assets, remade 18 Oct).</p><div class="row">{ref_figs}</div></section>
{"".join(secs)}</main></body></html>'''
(HERE / "index.html").write_text(page, encoding="utf-8")

# contact sheet: one row per pose: old | pick | other seeds; last row: Max + Matilda refs
C = 220; n = max(len(r) for _, _, r in sheet_rows); W = 20 + n * (C + 6) + 10
sh = Image.new("RGB", (W, 10 + (len(sheet_rows) + 1) * (C + 40)), "white"); d = ImageDraw.Draw(sh)
try: font = ImageFont.truetype("/usr/share/fonts/noto/NotoSans-Regular.ttf", 15)
except OSError: font = ImageFont.load_default()
for r, (name, best, row) in enumerate(sheet_rows):
    y = 10 + r * (C + 40)
    for k, it in enumerate(row):
        x = 10 + k * (C + 6)
        if k == 0:
            sh.paste(it.resize((C, C)), (x, y)); d.text((x, y + C + 4), f"{name} (old)", fill="black", font=font)
        else:
            s, im = it; sh.paste(im.resize((C, C)), (x, y))
            if s == best: d.rectangle((x, y, x + C, y + C), outline=(31, 163, 157), width=4)
            d.text((x, y + C + 4), f"seed {s}" + ("  PICK" if s == best else ""), fill=(22, 130, 125) if s == best else "grey", font=font)
y = 10 + len(sheet_rows) * (C + 40)
for k, (nme, im) in enumerate(refs):
    x = 10 + k * (C + 6); sh.paste(im.resize((C, C)), (x, y)); d.text((x, y + C + 4), f"current {nme} (style ref)", fill="black", font=font)
sh.save(HERE / "contact_sheet.png", optimize=True)
print("wrote index.html, contact_sheet.png,", len(sheet_rows), "poses")
