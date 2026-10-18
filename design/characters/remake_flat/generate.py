"""Makes every PNG in this folder: scripts/make_image.py in a batch (boots WanGP once,
runs every prompt in prompts.json x its seeds). NAG off, no negative prompt. Skips files
that exist. Needs the GPU free and the WanGP web UI closed:

    cd ~/Documents/video_generation && Wan2GP/.venv/bin/python <this file> [names...]
"""
import json, shutil, sys, time
from pathlib import Path
ROOT = Path.home() / "Documents/video_generation"
OUT = Path(__file__).resolve().parent
cfg = json.load(open(OUT / "prompts.json"))
only = set(sys.argv[1:])
sys.path.insert(0, str(ROOT / "Wan2GP"))
from shared.api import init
t0 = time.time()
session = init(root=ROOT / "Wan2GP", console_output=False)
print(f"ready in {time.time()-t0:.0f}s", flush=True)
for name, prompt in cfg["prompts"].items():
    if only and name not in only: continue
    seeds = cfg["seeds_nouns"] if name.startswith("noun") else cfg["seeds_characters"]
    seeds = seeds + cfg.get("extra_seeds", {}).get(name, [])
    for seed in seeds:
        dest = OUT / f"{name}_s{seed}.png"
        if dest.exists(): continue
        s = dict(model_type="z_image", prompt=prompt, negative_prompt="", NAG_scale=1.0, NAG_tau=3.5, NAG_alpha=0.5,
                 resolution="1024x1024", num_inference_steps=8, guidance_scale=0, batch_size=1, image_mode=1,
                 video_length=1, seed=seed)
        t1 = time.time()
        r = session.submit_task(s).result(timeout=600)
        if not r.success or not r.generated_files:
            raise SystemExit(f"FAILED {name} s{seed}: {[str(e) for e in r.errors]}")
        shutil.copy2(r.generated_files[-1], dest)
        print(f"{name} s{seed} {time.time()-t1:.0f}s", flush=True)
print(f"TOTAL {time.time()-t0:.0f}s", flush=True)
