"""python3 mix.py <workdir> -> <workdir>/audio.wav  (voice + soft pops + quiet pad, -14 LUFS target)"""
import json, subprocess, sys, numpy as np
wd = sys.argv[1]; SR = 48000; TL = json.load(open(f"{wd}/timeline.json")); N = int((TL["total"] + 0.5) * SR); out = np.zeros(N, np.float32)
def load(p): return np.frombuffer(subprocess.run(["ffmpeg","-loglevel","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True).stdout, np.float32).copy()
def put(x, t, g=1.0):
    i = int(t * SR); x = x * g; out[i:i+len(x)] += x[:N-i]
def level(x, db=-19.0): return x * (10**(db/20) / (np.sqrt(np.mean(x**2) + 1e-12)))
def pop(t):
    tt = np.arange(int(0.18*SR)) / SR; put(((np.sin(2*np.pi*660*tt) + 0.5*np.sin(2*np.pi*990*tt)) * np.exp(-tt*18)).astype(np.float32), t - 0.06, 0.09)
put(level(load(f"{wd}/vo/i0_fast.wav")), TL["hookv"][0])
for q in TL["q"]:
    i = q["i"]; f = level(load(f"{wd}/vo/i{i}_fast.wav")); s = level(load(f"{wd}/vo/i{i}_slow.wav"))
    put(f, q["f1"][0]); put(s, q["slow"][0]); pop(q["slow"][0]); put(f, q["f2"][0])
put(level(load(f"{wd}/vo/outro.wav")), TL["outro"][0])
chords = [[220.0, 261.63, 329.63, 392.0], [174.61, 220.0, 261.63, 329.63], [196.0, 261.63, 329.63, 392.0], [196.0, 246.94, 293.66, 392.0]]
pad = np.zeros(N, np.float32); seg = int(4.0 * SR); t = np.arange(seg) / SR; env = np.minimum(1, t/1.2) * np.minimum(1, (4.0-t)/1.2)
for s0 in range(0, N, seg):
    ch = chords[(s0 // seg) % 4]; w = sum(np.sin(2*np.pi*f*t) + 0.3*np.sin(4*np.pi*f*t) for f in ch) / len(ch)
    w = (w * env * (0.8 + 0.2*np.sin(2*np.pi*0.25*t))).astype(np.float32); e = min(s0+seg, N); pad[s0:e] += w[:e-s0]
fade = np.minimum(1, np.linspace(0, 1, N) * 40) * np.minimum(1, (N - np.arange(N)) / (SR * 1.5)); out += pad * fade * 0.05; out = np.clip(out, -0.98, 0.98)
subprocess.run(["ffmpeg","-y","-loglevel","error","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-af","acompressor=threshold=0.05:ratio=4:attack=3:release=60:makeup=3,loudnorm=I=-14:TP=-1.5:LRA=7","-ar","48000",f"{wd}/audio.wav"], input=out.tobytes(), check=True); print("audio ok")
