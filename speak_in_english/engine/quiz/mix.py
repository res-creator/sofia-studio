"""python3 mix.py <workdir> -> <workdir>/audio.wav  (voices + countdown ticks + soft pad, -14 LUFS applied by ffmpeg afterwards)"""
import json, subprocess, sys, numpy as np
wd = sys.argv[1]; SR = 48000
TL = json.load(open(f"{wd}/timeline.json")); N = int((TL["total"] + 0.5) * SR); out = np.zeros(N, np.float32)
def load(p): return np.frombuffer(subprocess.run(["ffmpeg","-loglevel","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True).stdout, np.float32).copy()
def put(x, t, g=1.0):
    i = int(t * SR); x = x * g; out[i:i+len(x)] += x[:N-i]
def level(x, db=-19.0):
    r = np.sqrt(np.mean(x**2) + 1e-12); return x * (10**(db/20) / r)
put(level(load(f"{wd}/vo/intro.wav")), TL["intro"][0])
for q in TL["q"]:
    i = q["i"]
    put(level(load(f"{wd}/vo/q{i}_ru.wav")), q["ruv"][0])
    put(level(load(f"{wd}/vo/q{i}_uk.wav")), q["ukv"][0]); put(level(load(f"{wd}/vo/q{i}_us.wav")), q["usv"][0])
    # countdown ticks: 4 ticks, last one higher
    for k in range(4):
        tt = np.arange(int(0.07*SR)) / SR; f = 1500 if k < 3 else 2000
        tick = (np.sin(2*np.pi*f*tt) * np.exp(-tt*55)).astype(np.float32)
        put(tick, q["count"][0] + k, 0.22)
    # soft reveal pops
    for vs in (q["ukv"], q["usv"]):
        tt = np.arange(int(0.18*SR)) / SR
        pop = ((np.sin(2*np.pi*660*tt) + 0.5*np.sin(2*np.pi*990*tt)) * np.exp(-tt*18)).astype(np.float32)
        put(pop, vs[0] - 0.06, 0.10)
put(level(load(f"{wd}/vo/outro.wav")), TL["outro"][0])
# warm pad: slow chord loop (Am9 / Fmaj7 / C / G), very quiet
chords = [[220.0, 261.63, 329.63, 392.0], [174.61, 220.0, 261.63, 329.63], [196.0, 261.63, 329.63, 392.0], [196.0, 246.94, 293.66, 392.0]]
pad = np.zeros(N, np.float32); seg = int(4.0 * SR); t = np.arange(seg) / SR
env = np.minimum(1, t/1.2) * np.minimum(1, (4.0-t)/1.2)
for s in range(0, N, seg):
    ch = chords[(s // seg) % 4]; w = sum(np.sin(2*np.pi*f*t) + 0.3*np.sin(4*np.pi*f*t) for f in ch) / len(ch)
    w = (w * env * (0.8 + 0.2*np.sin(2*np.pi*0.25*t))).astype(np.float32); e = min(s+seg, N); pad[s:e] += w[:e-s]
fade = np.minimum(1, np.linspace(0, 1, N) * 40) * np.minimum(1, (N - np.arange(N)) / (SR * 1.5))
out += pad * fade * 0.045
out = np.clip(out, -0.98, 0.98)
subprocess.run(["ffmpeg","-y","-loglevel","error","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-af","loudnorm=I=-14:TP=-1.5:LRA=9","-ar","48000",f"{wd}/audio.wav"], input=out.tobytes(), check=True)
print("audio ok")
