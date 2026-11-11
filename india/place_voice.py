#!/usr/bin/env python3
"""Place the English voice paragraphs at their start times, check them, mix with MUSIC_AND_EFFECTS.wav, mux with PICTURE_EN_4K.mp4.
Needs: python3 with numpy, and ffmpeg on the PATH. Run inside this folder:
 python3 place_voice.py (voice files in ./voice/<id>.wav or .mp3, e.g. voice/p001.mp3)
Writes VOICE_EN.wav, MIX_EN.wav, FINAL_EN_4K.mp4 and prints a report. Stops with a clear message if a paragraph is too long.
(Copied from the INDIA kit.)"""
import csv, os, sys, subprocess, json, re
import numpy as np
SR = 48000; HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
def load(p):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True)
    if r.returncode: sys.exit("cannot read " + p)
    return np.frombuffer(r.stdout, np.float32).reshape(-1, 2).copy()
def trim(x, thr=10 ** (-50 / 20)):
    e = np.abs(x).max(1); idx = np.where(e > thr)[0]
    if not len(idx): return x
    a = max(0, idx[0] - int(0.03 * SR)); b = min(len(x), idx[-1] + int(0.12 * SR)); return x[a:b]
def lufs(path):
    r = subprocess.run(["ffmpeg", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1]); tp = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r)
    return I, (float(tp[-1]) if tp else None)
def write(p, x):
    import wave
    with wave.open(p, "wb") as w:
        w.setnchannels(2); w.setsampwidth(3); w.setframerate(SR)
        y = (np.clip(x, -1, 1) * 8388607).astype("<i4")
        w.writeframes(y.view(np.uint8).reshape(-1, 4)[:, :3].tobytes())
rows = list(csv.DictReader(open("SCRIPT_EN.csv", encoding="utf-8")))
me = load("MUSIC_AND_EFFECTS.wav"); N = len(me); voice = np.zeros_like(me); bad = []; report = []
for k, r in enumerate(rows):
    f = next((p for p in ("voice/%s.wav" % r["id"], "voice/%s.mp3" % r["id"], "voice/%s.flac" % r["id"]) if os.path.exists(p)), None)
    if not f: bad.append("%s: file missing (voice/%s.wav)" % (r["id"], r["id"])); continue
    x = trim(load(f)); d = len(x) / SR; mx = float(r["max_duration_s"]); st = float(r["start_s"])
    report.append("%s start %8.2f len %5.2f / max %5.2f %s" % (r["id"], st, d, mx, "TOO LONG" if d > mx else ""))
    if d > mx: bad.append("%s is %.2f s, max %.2f s: speed it up slightly (max 1.1x) or shorten the text" % (r["id"], d, mx)); continue
    i = int(round(st * SR)); f_ = int(0.008 * SR); x[:f_] *= np.linspace(0, 1, f_)[:, None]; x[-f_:] *= np.linspace(1, 0, f_)[:, None]
    voice[i:i + len(x)] += x[:N - i]
open("PLACEMENT_REPORT.txt", "w").write("\n".join(report + [""] + bad))
if bad: sys.exit("NOT DONE - fix these paragraphs first:\n" + "\n".join(bad))
write("VOICE_EN_raw.wav", voice)
I, _ = lufs("VOICE_EN_raw.wav"); voice *= 10 ** ((-14.0 - I) / 20)  # voice track alone -> -14 LUFS integrated
write("VOICE_EN.wav", voice)
mix = voice; mix += me; del me
write("MIX_EN_raw.wav", mix)  # voice + music/effects 1:1, then a peak limiter at -1 dBFS
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "MIX_EN_raw.wav", "-af", "alimiter=limit=0.891:level=false:attack=5:release=50", "-ar", "48000", "-c:a", "pcm_s24le", "MIX_EN.wav"], check=True)
I2, tp = lufs("MIX_EN.wav")
print("voice track -14.0 LUFS, final mix %.1f LUFS (target -14 +/- 1), peak %s dBFS" % (I2, tp))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "PICTURE_EN_4K.mp4", "-i", "MIX_EN.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-shortest", "-movflags", "+faststart", "-tag:v", "hvc1", "FINAL_EN_4K.mp4"], check=True)
print("FINAL_EN_4K.mp4 ready. Check PLACEMENT_REPORT.txt and watch the film once.")
