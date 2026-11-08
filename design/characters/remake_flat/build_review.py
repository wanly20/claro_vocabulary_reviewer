#!/usr/bin/env python3
"""Builds index.html, thumbs/ and contact_sheet.png from picks.json (old vs new, chosen seed, runners-up)."""
import json, html
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ASSETS = Path.home() / "Documents/spanish/buhisimo/prototype/assets"
picks = json.load(open(HERE / "picks.json"))
T = HERE / "thumbs"; T.mkdir(exist_ok=True)

def thumb(src: Path, name: str, size=360):
    im = Image.open(src).convert("RGBA")
    bg = Image.new("RGBA", im.size, "white"); bg.alpha_composite(im)
    im = bg.convert("RGB"); im.thumbnail((size, size))
    canvas = Image.new("RGB", (size, size), "white")
    canvas.paste(im, ((size - im.width) // 2, (size - im.height) // 2))
    canvas.save(T / name, quality=86)
    return canvas

esc = html.escape
secs = []
sheet_rows = []
for a in picks["assets"]:
    name, stem = a["asset"], a.get("stem")
    old = thumb(Path(a["old"]), f"old_{name}.jpg") if a.get("old") else None
    figs = []
    if old is not None:
        figs.append(f'<figure class="ref"><img src="thumbs/old_{name}.jpg" alt="Old {esc(name)}"><figcaption>Old (in the prototype)</figcaption></figure>')
    if a.get("seed") is not None:
        f = f"{stem}_s{a['seed']}.png"; new = thumb(HERE / f, f"{stem}_s{a['seed']}.jpg")
        figs.append(f'<figure class="best"><a href="{f}"><img src="thumbs/{stem}_s{a["seed"]}.jpg" alt="New {esc(name)}, seed {a["seed"]}"></a><figcaption>New · seed {a["seed"]}</figcaption></figure>')
        sheet_rows.append((name, a["seed"], old, new))
    for s in a.get("runners", []):
        f = f"{stem}_s{s}.png"; thumb(HERE / f, f"{stem}_s{s}.jpg")
        figs.append(f'<figure><a href="{f}"><img src="thumbs/{stem}_s{s}.jpg" alt="{esc(name)} seed {s}" loading="lazy"></a><figcaption>Runner-up · seed {s}</figcaption></figure>')
    rej = "".join(f"<li><code>s{k}</code>: {esc(v)}</li>" for k, v in a.get("rejected", {}).items())
    secs.append(f'<section><h2><code>{esc(name)}.webp</code></h2><p>{esc(a["note"])}</p><div class="row">{"".join(figs)}</div>'
                + (f'<details><summary>Rejected seeds</summary><ul>{rej}</ul></details>' if rej else "") + "</section>")

page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Flat art remake</title><style>
:root{{--bg:#faf8f3;--card:#fff;--ink:#22303a;--muted:#5d6b75;--accent:#1fa39d;--line:#e6e0d4}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{--bg:#172026;--card:#1f2a31;--ink:#eef2f3;--muted:#a9b6bd;--accent:#4fd1c9;--line:#33434d}}}}
:root[data-theme="dark"]{{--bg:#172026;--card:#1f2a31;--ink:#eef2f3;--muted:#a9b6bd;--accent:#4fd1c9;--line:#33434d}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,sans-serif}}
main{{max-width:1100px;margin:0 auto;padding:16px}}h1{{font-size:1.5rem;margin:.2em 0}}
section{{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin:16px 0}}
h2{{font-size:1.1rem;margin:0 0 4px}}p,li{{color:var(--muted)}}p{{margin:4px 0 10px}}
.row{{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}}
figure{{margin:0;border:2px solid var(--line);border-radius:10px;overflow:hidden;background:#fff}}figure img{{width:100%;display:block;aspect-ratio:1}}
figcaption{{font-size:.85rem;text-align:center;padding:4px;color:#5d6b75}}figure.ref{{background:#f3f1ec}}figure.ref figcaption{{font-style:italic}}
figure.best{{border-color:var(--accent);border-width:3px}}figure.best figcaption{{color:#16827d;font-weight:700}}
summary{{cursor:pointer;color:var(--muted);font-size:.9rem;padding:6px 0}}ul{{font-size:.9rem}}code{{font-size:.95em}}
</style></head><body><main><h1>Flat art remake (18 Oct)</h1>
<p>{esc(picks["intro"])}</p><p><a href="contact_sheet.png">Contact sheet: old next to new on one image</a> · <a href="prompts.json">prompts.json</a></p>
{"".join(secs)}</main></body></html>'''
(HERE / "index.html").write_text(page, encoding="utf-8")

# contact sheet: 3 pairs per row, old | new
C = 240; cols = 3; pw = C * 2 + 30
rows = (len(sheet_rows) + cols - 1) // cols
sh = Image.new("RGB", (cols * pw + 20, rows * (C + 46) + 20), "white"); d = ImageDraw.Draw(sh)
try: font = ImageFont.truetype("/usr/share/fonts/noto/NotoSans-Regular.ttf", 15)
except OSError: font = ImageFont.load_default()
for i, (name, seed, old, new) in enumerate(sheet_rows):
    x = 10 + (i % cols) * pw; y = 10 + (i // cols) * (C + 46)
    if old is not None: sh.paste(old.resize((C, C)), (x, y))
    else: d.text((x + 60, y + C // 2), "(new asset)", fill="grey", font=font)
    sh.paste(new.resize((C, C)), (x + C + 4, y))
    d.rectangle((x + C + 4, y, x + 2 * C + 4, y + C), outline=(31, 163, 157), width=3)
    d.text((x, y + C + 6), f"{name}   old | new (seed {seed})", fill="black", font=font)
sh.save(HERE / "contact_sheet.png", optimize=True)
print("wrote index.html, contact_sheet.png,", len(sheet_rows), "pairs")
