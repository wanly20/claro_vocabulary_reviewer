#!/usr/bin/env python3
"""Run a list of Wan2GP TTS jobs from a JSON file.

Each job: {"out": "/abs/path.wav", "model_type": "...", "prompt": "...",
           "alt_prompt": "...", "seed": 123, "duration_seconds": 20,
           "audio_guide": "/abs/ref.wav" (base only)}
Appends timing lines to <jobs>.timing.tsv. Skips jobs whose output exists.
Run from the video_generation repo root with Wan2GP/.venv/bin/python.
"""
import json, shutil, sys, time
from pathlib import Path

ROOT = Path.home() / "Documents/video_generation"
WAN = ROOT / "Wan2GP"
sys.path.insert(0, str(WAN))

jobs_path = Path(sys.argv[1])
out_tmp = Path(sys.argv[2])
jobs = json.loads(jobs_path.read_text())
todo = [j for j in jobs if not Path(j["out"]).exists()]
print(f"[run_jobs] {len(todo)}/{len(jobs)} jobs to run", flush=True)
if not todo:
    sys.exit(0)

from shared.api import init

base = {
    "qwen3_tts_voicedesign": json.loads((WAN / "settings/qwen3_tts_voicedesign_settings.json").read_text()),
    "qwen3_tts_base": json.loads((WAN / "settings/qwen3_tts_base_settings.json").read_text()),
}
t0 = time.time()
session = init(root=WAN, output_dir=out_tmp, console_output=False)
print(f"[run_jobs] runtime ready in {time.time()-t0:.0f}s", flush=True)

timing = open(jobs_path.with_suffix(".timing.tsv"), "a")
for i, j in enumerate(todo, 1):
    s = dict(base[j["model_type"]])
    s.update(model_type=j["model_type"], prompt=j["prompt"],
             alt_prompt=j.get("alt_prompt", ""), model_mode="spanish",
             seed=j.get("seed", 12345), pause_seconds=0,
             duration_seconds=j.get("duration_seconds", 20))
    if j["model_type"] == "qwen3_tts_base":
        s.update(audio_prompt_type="A", audio_guide=j["audio_guide"])
    t = time.time()
    r = session.submit_task(s).result(timeout=1800)
    dt = time.time() - t
    if not r.success or not r.generated_files:
        print(f"[run_jobs] FAIL {j['out']}: {[str(e) for e in r.errors]}", flush=True)
        continue
    Path(j["out"]).parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(r.generated_files[-1], j["out"])
    timing.write(f"{j['out']}\t{j['model_type']}\t{len(j['prompt'].split())}\t{dt:.1f}\n")
    timing.flush()
    print(f"[run_jobs] {i}/{len(todo)} {Path(j['out']).name} {dt:.1f}s", flush=True)
print("[run_jobs] done", flush=True)
