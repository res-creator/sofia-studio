"""python3 short/asr_short.py <slug>_s  -> Whisper listen-back of every clip actually used in the short cut (checks that trimmed clips start/end on whole words)"""
import json, sys, soundfile as sf, sherpa_onnx
from scipy.signal import resample_poly
D = f"eps/{sys.argv[1]}"; d = "models/sherpa-onnx-whisper-small"; TL = json.load(open(f"{D}/timeline.json"))
def rec(lang): return sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{d}/small-encoder.int8.onnx", decoder=f"{d}/small-decoder.int8.onnx", tokens=f"{d}/small-tokens.txt", language=lang, task="transcribe", num_threads=2)
R = {"en": rec("en"), "ru": rec("ru")}
for s in TL["speech"]:
    l = "ru" if s["who"] == "nar" else "en"; x, sr = sf.read(f"{D}/vo/{s['id']}.wav"); x = resample_poly(x, 1, 3).astype("float32")
    r = R[l]; st = r.create_stream(); st.accept_waveform(16000, x); r.decode_stream(st)
    print(f"{s['id']:8s} {s['t']:6.2f} {s['d']:5.2f} | {st.result.text.strip()}")
