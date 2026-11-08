"""Batch-transcribe wavs with whisper large-v3 (same loading trick as scripts/transcribe.py).

usage: whisper_batch.py out.json file1.wav file2.wav ...
Also records duration, speech rate and median F0 (pitch) for each file.
"""
import json, sys
from pathlib import Path
import numpy as np
import torch, whisper

out_json = Path(sys.argv[1])
files = sys.argv[2:]
model_dir = str(Path.home() / "Documents/video_generation/models/whisper")
model = whisper.load_model("large-v3", download_root=model_dir, device="cpu").half()
for m in model.modules():
    if isinstance(m, torch.nn.LayerNorm):
        m.float()
model = model.to("cuda")


def median_f0(audio16k):
    try:
        import librosa
        f0, vflag, _ = librosa.pyin(audio16k, fmin=60, fmax=400, sr=16000, frame_length=1024)
        f0 = f0[vflag & ~np.isnan(f0)]
        return float(np.median(f0)) if len(f0) else None
    except Exception:
        return None


res = json.loads(out_json.read_text()) if out_json.exists() else {}
for f in files:
    if f in res:
        continue
    audio = whisper.load_audio(f)
    r = model.transcribe(audio, language="es", task="transcribe", fp16=True,
                         condition_on_previous_text=False, temperature=0.0)
    text = r["text"].strip()
    # speech span from segments
    segs = r.get("segments", [])
    span = (segs[-1]["end"] - segs[0]["start"]) if segs else 0
    res[f] = dict(text=text, dur=len(audio) / 16000, span=span,
                  f0=median_f0(audio))
    print(f"{Path(f).name}\t{res[f]['dur']:.2f}s\tf0={res[f]['f0']}\t{text}", flush=True)
    out_json.write_text(json.dumps(res, ensure_ascii=False, indent=1))
