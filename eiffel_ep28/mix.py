# Sound for episode 28 "The Man Who Sold the Eiffel Tower" (adult documentary style). NEW music, not the channel's usual bed:
# tense 1920s noir jazz on one bar grid (92 BPM, swung): walking upright bass, brushed snare, muted piano chords, a muted-trumpet-like line.
# Synthesized SFX (ours): stamp thumps, typewriter runs, paper, counter ticks, police whistle, ship horn, cell door clang.
# Music very quiet under the voice: mus*0.1*(1-0.7*dk). Reads cues.json + vo/, writes mix.wav
import json, subprocess, os, sys, wave, numpy as np, scipy.signal as sg
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, f'{D}/../longform/kit')
import sfx as K
from sfx import t_, noise, norm, bp, lp, hp, SR
CU = json.load(open(f'{D}/cues.json')); T = CU['T']; N = int((T + 0.5) * SR); H = CU['hits']; L = dict(CU['lines'])
rng = np.random.default_rng(28)
# ---------- custom SFX ----------
def typewriter(d=1.2):
    o = np.zeros(int(d * SR)); t = 0.0
    while t < d - 0.1:
        x = K.typefx() * rng.uniform(0.6, 1); s = int(t * SR); o[s:s + len(x)] += x[: len(o) - s]; t += rng.uniform(0.07, 0.13)
    e = K.ding(); s = len(o) - int(0.05 * SR); o = np.concatenate([o, np.zeros(len(e))]); o[s:s + len(e)] += e * 0.4
    return norm(o, 0.5)
def whistle(d=0.9):  # police whistle: ~2.9 kHz with a fast pea trill
    t = t_(d); f = 2900 + 120 * np.sign(np.sin(2 * np.pi * 26 * t)); x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.2 * bp(noise(d), 2500, 4000)
    return norm(x * np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.08), 0.35)
def shiphorn(d=1.6): t = t_(d); x = lp(sg.sawtooth(2 * np.pi * 98 * t) + 0.7 * sg.sawtooth(2 * np.pi * 123.5 * t), 700); return norm(x * np.minimum(1, t / 0.15) * np.minimum(1, (d - t) / 0.5), 0.45)
def celldoor():
    d = 1.6; t = t_(d); ring = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(180, 3), (431, 4), (977, 6), (1530, 8)])
    roll = bp(noise(0.5), 200, 1500) * np.linspace(0.2, 1, int(0.5 * SR)); x = np.zeros(int(d * SR) + len(roll)); x[: len(roll)] += roll * 0.3; s = len(roll)
    x[s:s + len(t)] += ring * 0.6; x[s:s + int(0.5 * SR)] += K.slam()[: int(0.5 * SR)] * 0.9
    return norm(x, 0.8)
def envslide(): d = 0.6; return norm(bp(noise(d), 600, 4000) * np.sin(np.linspace(0, np.pi, int(d * SR))), 0.3)
def counter(d=1.0):
    o = np.zeros(int(d * SR)); t = 0.0; k = 0
    while t < d: x = K.tick(); s = int(t * SR); o[s:s + len(x)] += x[: len(o) - s]; k += 1; t += 0.035 + 0.06 * (t / d) ** 2
    return norm(o, 0.3)
def rope(): d = 1.3; t = t_(d); return norm(bp(noise(d), 400, 1800) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 3 * t))) * np.sin(np.pi * t / d), 0.25)
def billfall():
    o = np.zeros(int(1.6 * SR))
    for i in range(18): x = K.flip() if i % 2 else K.paper(); s = int(rng.uniform(0, 1.3) * SR); o[s:s + len(x)] += x[: len(o) - s]
    return norm(o, 0.35)
def hit(): return norm(K.stamp() + 0.6 * K.boom()[: len(K.stamp())], 0.95)
fx = np.zeros(N)
def add(x, t, g=1.0):
    s = int(t * SR)
    if 0 <= s < N: fx[s:s + len(x)] += (x * g)[: N - s]
# frame 0: the SOLD stamp lands at 0.0 (sound at the first sample) + a low boom
add(K.stamp(), 0.0, 1.0); add(K.boom(), 0.0, 0.6)
add(K.whoosh(0.4), L['e02'] - 0.2, 0.5); add(K.flip(), L['e02'] - 0.05, 0.6)
add(typewriter(1.4), H['letter'] - 0.1, 0.6); add(K.stamp(), H['confidential'] + 0.05, 0.9)
add(K.cutfx(), H['hotel'] - 0.15, 0.5); add(K.clink(), H['hotel'] + 0.3, 0.4); add(K.clink(), H['hotel'] + 0.9, 0.3); add(K.ding(), H['one'], 0.35)
add(envslide(), H['envelope'], 0.7); add(counter(1.0), H['counter'] - 0.1, 0.8); add(K.kaching(), H['counter'] + 0.95, 0.4)
add(K.cutfx(), L['e06'] - 0.15, 0.5); add(typewriter(0.9), L['e06'] + 1.4, 0.45); add(K.stamp(), H['again'] + 0.05, 0.9)
add(whistle(), H['police'], 0.7); add(shiphorn(), H['ship'], 0.6)
add(billfall(), H['bills'], 0.7)
add(rope(), H['rope'], 0.8); add(celldoor(), H['alcatraz'] - 0.45, 0.9)
add(K.cutfx(), L['e10'] - 0.15, 0.5); add(K.stamp(), H['salesman'] + 0.05, 0.9)
add(K.stamp(), CU['card'], 0.7)
# ---------- music: noir jazz, 92 BPM, swung eighths, D minor; bar grid from 0 ----------
BPM = 92; BEAT = 60 / BPM; BAR = 4 * BEAT; SW = 0.62   # swing ratio
NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)
mus = np.zeros(N)
def put(x, t, g=1.0):
    s = int(t * SR)
    if 0 <= s < N: mus[s:s + len(x)] += (x * g)[: N - s]
def ubass(f, d):  # plucked upright bass: low sine + body, quick thump
    t = t_(d); x = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6) + 0.15 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 10)
    return lp(x, 900) * np.minimum(1, t / 0.006) * np.exp(-t * 2.6) * np.minimum(1, (d - t) / 0.03)
def brush(d=0.22): t = t_(d); return bp(noise(d), 1500, 8000) * np.minimum(1, t / 0.04) * np.exp(-t * 14)
def swish(d=BAR): t = t_(d); return bp(noise(d), 2500, 9000) * (0.5 + 0.5 * np.sin(2 * np.pi * t / BEAT) ** 2) * 0.35
def kickb(): t = t_(0.25); return np.sin(2 * np.pi * np.cumsum(50 + 60 * np.exp(-t * 30)) / SR) * np.exp(-t * 14)
def piano(fs, d=0.35):  # muted piano chord: short decaying partials, dark
    t = t_(d); x = sum(sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (7 + 4 * h)) / h ** 1.6 for h in range(1, 5)) for f in fs)
    x[:60] *= np.linspace(0, 1, 60); return lp(x, 2200) / len(fs)
def trumpet(f, d):  # muted trumpet-like synth: bright saw through a harmon-ish bandpass, vibrato, soft attack
    t = t_(d); fr = f * (1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.3)); ph = 2 * np.pi * np.cumsum(fr) / SR
    x = bp(sg.sawtooth(ph), 900, 2600) + 0.3 * np.sin(ph); return x * np.minimum(1, t / 0.05) * np.minimum(1, np.maximum(0, d - t) / 0.12)
# chords (root, voicing) — Dm6 / Bb7 / Em7b5 / A7b9
PROG = [(38, [62, 65, 69, 71]), (34, [62, 65, 68, 70]), (40, [62, 64, 67, 70]), (33, [61, 64, 67, 70])]
WALK = [[38, 41, 45, 44], [34, 38, 41, 39], [40, 43, 46, 45], [33, 37, 40, 37]]
LICK = [[(74, 0, 1.5), (72, 1.5, 0.5), (69, 2, 1.8)], [(70, 0.5, 1), (69, 1.5, 0.5), (65, 2, 1.8)], [(67, 0, 1), (70, 1, 1), (74, 2, 1.5)], [(73, 0, 2.5), (69, 2.5, 1.2)]]
def bar(t0, k, g=1.0, horn=False, sparse=False):
    root, ch = PROG[k % 4]
    for b in range(4):
        n = WALK[k % 4][b] if not sparse else (root if b in (0, 2) else None)
        if n: put(ubass(NOTE(n), BEAT * 0.95), t0 + b * BEAT, (0.55 if b % 2 == 0 else 0.45) * g)
        if b % 2: put(brush(), t0 + b * BEAT, 0.22 * g)
        put(brush(0.08), t0 + b * BEAT + BEAT * SW, 0.07 * g)
        if b == 0 and not sparse: put(kickb(), t0, 0.25 * g)
    put(swish(), t0, 0.06 * g)
    for pos in ((1 + SW, 3) if not sparse else (0,)): put(piano([NOTE(n) for n in ch], 0.32), t0 + pos * BEAT, 0.3 * g)
    if horn:
        for n, a, d in LICK[k % 4]: put(trumpet(NOTE(n), d * BEAT), t0 + a * BEAT, 0.14 * g)
nb = int(np.ceil(T / BAR)) + 1
for k in range(nb):
    t0 = k * BAR; card = t0 >= CU['card'] - BAR * 0.5
    bar(t0, k, g=1.0, horn=(k % 4 in (2, 3)) or card, sparse=(k == 0))
fade = np.ones(N); fs = int((T - 0.6) * SR); fade[fs:] = np.linspace(1, 0, N - fs)
# ---------- voice ----------
vo = np.zeros(N)
for vid, t in CU['lines']:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{D}/vo/{vid}.mp3', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.int16).astype(float) / 32768; s = int(t * SR); vo[s:s + len(a)] += a[: N - s]
duck = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(4410) / 4410, 'same'); dk = np.clip(duck * 3, 0, 1)
mus = mus / (np.max(np.abs(mus)) + 1e-9)
out = (vo * 1.0 + fx * 0.3 * (1 - 0.5 * dk) + mus * 0.1 * (1 - 0.7 * dk)) * fade
# the card (no voice): let the music come up a little so the ending isn't empty
cs = int(CU['card'] * SR); out[cs:] += (mus[cs:] * 0.12 * fade[cs:])
out = np.tanh(out * 1.1) * 0.9
w = wave.open(f'{D}/mix.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
print('mix ok', round(T, 2), 's')
