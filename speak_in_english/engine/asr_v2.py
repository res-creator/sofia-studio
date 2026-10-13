import sherpa_onnx, soundfile as sf, sys, os
from scipy.signal import resample_poly
from episodes_v2 import EP
d="models/sherpa-onnx-whisper-small"
def rec(lang):
    return sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{d}/small-encoder.int8.onnx",decoder=f"{d}/small-decoder.int8.onnx",tokens=f"{d}/small-tokens.txt",language=lang,task="transcribe",num_threads=2)
langs=sys.argv[2] if len(sys.argv)>2 else "en"
R={l:rec(l) for l in langs.split(",")}
for ep in sys.argv[1].split(","):
    for lid,who,text,ru in EP[ep]["lines"]:
        l="ru" if who=="nar" else "en"
        if l not in R or not os.path.exists(f"eps/{ep}/vo/{lid}.wav"): continue
        x,sr=sf.read(f"eps/{ep}/vo/{lid}.wav"); x=resample_poly(x,1,3).astype("float32")
        r=R[l]; s=r.create_stream(); s.accept_waveform(16000,x); r.decode_stream(s)
        print(f"{ep}/{lid:8s}| {s.result.text.strip()}")
