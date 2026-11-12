#!/usr/bin/env python3
"""VOICE MASTERING - the same studio processing we use on all our films. Run it BEFORE place_voice.py / mix_and_mux.sh.

 python3 master_voice.py            voice_raw/<id>.wav (raw TTS takes) -> voice/<id>.wav (mastered)
 python3 master_voice.py IN_DIR OUT_DIR   other folders
Needs: python3 with numpy, scipy, soundfile; ffmpeg on the PATH.
(Copied from the kit's VOICE_ADDON/master_voice.py.)

Chain, per take:
 1. matching EQ: the long-term spectrum (1/3-octave bands) of every take is pulled toward the MEDIAN spectrum of all takes
    (tone only, not level; smoothed; limited to +-4 dB; linear-phase FIR)
 2. high-pass 75 Hz; light FFT denoise
 3. -2.5 dB at 300 Hz (less boxiness), +2 dB at 4 kHz (presence), +1.5 dB air shelf from 11 kHz
 4. de-esser
 5. compressor 2.5:1, attack 12 ms, release 180 ms, soft knee
 6. light tanh soft-clip, then a limiter
 7. every take normalised to -16 LUFS integrated (two-pass loudnorm, linear), true peak -1.5 dB
Lengths stay exactly the same as the input takes. Writes MASTER_REPORT.json.
"""
import os, sys, json, re, glob, subprocess
import numpy as np, soundfile as sf
from scipy.signal import fftconvolve, firwin2

IN = sys.argv[1] if len(sys.argv) > 1 else "voice_raw"; OUT = sys.argv[2] if len(sys.argv) > 2 else "voice"
os.makedirs(OUT, exist_ok=True); SR = 48000
FILES = sorted(f for f in glob.glob(os.path.join(IN, "*")) if f.lower().endswith((".wav", ".mp3", ".flac", ".m4a")))
if not FILES: sys.exit("no takes found in %s/" % IN)
IDS = [os.path.splitext(os.path.basename(f))[0] for f in FILES]; SRC = dict(zip(IDS, FILES))
BANDS = 1000 * 2 ** (np.arange(-17, 15) / 3); BANDS = BANDS[(BANDS > 60) & (BANDS < 16000)]
CHAIN = ("highpass=f=75:poles=2,afftdn=nr=8:nf=-42:tn=1,"
         "equalizer=f=300:t=q:w=1.1:g=-2.5,equalizer=f=4000:t=q:w=1.0:g=2.0,highshelf=f=11000:g=1.5,"
         "deesser=i=0.35:m=0.5:f=0.5:s=o,"
         "acompressor=threshold=-21dB:ratio=2.5:attack=12:release=180:knee=4:makeup=2,"
         "asoftclip=type=tanh:threshold=0.95:output=1,"
         "alimiter=limit=0.89:attack=5:release=60:level=false")

def load(p):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True)
    if r.returncode: sys.exit("cannot read " + p)
    return np.frombuffer(r.stdout, np.float32).astype(np.float64)

def lufs_file(f):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", f, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])

def spectrum(x):
    n = 4096; hop = 2048; w = np.hanning(n); fr = []
    for i in range(0, len(x) - n, hop):
        seg = x[i:i + n]
        if np.sqrt((seg ** 2).mean()) > 0.01: fr.append(np.abs(np.fft.rfft(seg * w)) ** 2)
    if not fr: fr = [np.abs(np.fft.rfft(np.pad(x[:n], (0, max(0, n - len(x[:n])))) * w)) ** 2]
    P = np.mean(fr, 0); f = np.fft.rfftfreq(n, 1 / SR)
    band = np.array([P[(f >= c / 2 ** (1 / 6)) & (f < c * 2 ** (1 / 6))].mean() for c in BANDS])
    bdb = 10 * np.log10(band + 1e-20); cent = float((P * f).sum() / P.sum())
    return bdb, round(cent)

def measure(files):
    res = {}
    for i, p in files.items():
        x = load(p); b, c = spectrum(x)
        tmp = os.path.join(OUT, "_m.wav"); sf.write(tmp, x.astype(np.float32), SR); L = lufs_file(tmp); os.remove(tmp)
        res[i] = dict(bands=b, centroid=c, lufs=round(L, 2))
    return res

def spread(res):
    B = np.array([r["bands"] for r in res.values()]); m = (BANDS >= 100) & (BANDS <= 10000)
    dev = B - np.median(B, 0)
    return dict(lufs_range=round(max(r["lufs"] for r in res.values()) - min(r["lufs"] for r in res.values()), 2),
                tone_dev_rms_db=round(float(np.sqrt((dev[:, m] ** 2).mean())), 2))

before = measure(SRC)
ref = np.median(np.array([before[i]["bands"] for i in IDS]), 0)
for i in IDS:
    x = load(SRC[i])
    corr = ref - before[i]["bands"]; corr -= np.average(corr, weights=((BANDS > 200) & (BANDS < 4000)).astype(float))  # tone only, not level
    corr = np.convolve(np.pad(corr, 1, mode="edge"), [0.25, 0.5, 0.25], "valid"); corr[BANDS < 90] = 0; corr = np.clip(corr, -4, 4)
    fpts = np.concatenate([[0], BANDS, [SR / 2]]) / (SR / 2); gain = 10 ** (np.concatenate([[corr[0]], corr, [corr[-1]]]) / 20)
    fir = firwin2(2047, fpts, gain); y = fftconvolve(x, fir, mode="full")[1023:1023 + len(x)]
    eq, ch = os.path.join(OUT, "_eq_%s.wav" % i), os.path.join(OUT, "_ch_%s.wav" % i)
    sf.write(eq, y.astype(np.float32), SR, subtype="FLOAT")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", eq, "-af", CHAIN, "-ar", str(SR), "-c:a", "pcm_f32le", ch], check=True)
    m = subprocess.run(["ffmpeg", "-hide_banner", "-i", ch, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    js = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
    af = ("loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true"
          % (js["input_i"], js["input_tp"], js["input_lra"], js["input_thresh"], js["target_offset"]))
    out = os.path.join(OUT, i + ".wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", ch, "-af", af + ",aresample=48000", "-ar", str(SR), "-c:a", "pcm_s24le", out], check=True)
    y2, _ = sf.read(out)
    if len(y2) != len(x): y2 = np.pad(y2, (0, max(0, len(x) - len(y2))))[:len(x)]; sf.write(out, y2, SR, subtype="PCM_24")
    os.remove(eq); os.remove(ch); print("mastered", i, flush=True)
after = measure({i: os.path.join(OUT, i + ".wav") for i in IDS})
rep = dict(before=spread(before), after=spread(after), chain=CHAIN,
           takes={i: dict(lufs_before=before[i]["lufs"], lufs_after=after[i]["lufs"], centroid_before=before[i]["centroid"], centroid_after=after[i]["centroid"]) for i in IDS})
json.dump(rep, open("MASTER_REPORT.json", "w"), indent=1)
print("BEFORE", rep["before"], "AFTER", rep["after"])
print("done: %d mastered takes in %s/ - next: python3 onset_check.py, then python3 place_voice.py" % (len(IDS), OUT))
