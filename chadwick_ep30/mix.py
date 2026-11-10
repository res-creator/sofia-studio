# Sound for episode 30 "Carnegie's Daughter" (adult documentary style). NEW music — not the channel's usual bed, not ep 28's noir jazz,
# not ep 29's maritime folk: a Gilded-Age parlor tune — slow ragtime-style piano (stride left hand, syncopated right hand) + pizzicato strings,
# F major, 84 BPM, 4/4, ONE bar grid from 0. From c07 (the lawsuit) it darkens: piano drops out, low bowed strings in F minor + soft timpani.
# Synthesized SFX (ours): stamps, paper, cash, counter ticks, telephone silence, crowd-free bank run (footsteps + door rattle), cell door, vault.
# Music very quiet under the voice: mus*0.1*(1-0.7*dk). Reads cues.json + vo/, writes mix.wav
import json, subprocess, os, sys, wave, numpy as np, scipy.signal as sg
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, f'{D}/../longform/kit')
import sfx as K
from sfx import t_, noise, norm, bp, lp, hp, SR
CU = json.load(open(f'{D}/cues.json')); T = CU['T']; N = int((T + 0.5) * SR); H = CU['hits']; L = dict(CU['lines'])
rng = np.random.default_rng(30)
def counter(d=1.0):
    o = np.zeros(int(d * SR)); t = 0.0
    while t < d: x = K.tick(); s = int(t * SR); o[s:s + len(x)] += x[: len(o) - s]; t += 0.035 + 0.06 * (t / d) ** 2
    return norm(o, 0.3)
def papers(n=3, gap=0.2):
    o = np.zeros(int((n * gap + 0.4) * SR))
    for i in range(n): x = K.paper() if i % 2 else K.flip(); s = int(i * gap * SR); o[s:s + len(x)] += x[: len(o) - s]
    return norm(o, 0.35)
def footsteps(d=2.5):
    o = np.zeros(int(d * SR))
    for i in range(int(d * 9)): s = int(rng.uniform(0, d - 0.1) * SR); x = K.tap() * rng.uniform(0.4, 1.0); o[s:s + len(x)] += x[: len(o) - s]
    return norm(lp(o, 2500), 0.35)
def rattle(): d = 0.6; t = t_(d); return norm(bp(noise(d), 300, 2500) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 14 * t))) * np.exp(-t * 4), 0.35)
def celldoor(): d = 1.4; t = t_(d); x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(180, 3), (410, 5), (960, 8), (1730, 12)]) + 0.8 * lp(noise(d), 600) * np.exp(-t * 20); return norm(x, 0.6)
def vault(): d = 1.2; t = t_(d); f = 60 + 20 * t; x = lp(sg.sawtooth(2 * np.pi * np.cumsum(f) / SR), 400) * np.sin(np.pi * t / d); x[:len(K.clank())] += 0.6 * K.clank(); return norm(x, 0.4)
def cashfall(d=1.0):
    o = np.zeros(int(d * SR))
    for i in range(14): x = K.paper(); s = int(rng.uniform(0, d - 0.15) * SR); o[s:s + len(x)] += x[: len(o) - s] * rng.uniform(0.4, 1)
    return norm(o, 0.35)
def typing(d=1.6):
    o = np.zeros(int(d * SR)); t = 0.0
    while t < d - 0.1: x = K.typefx(); s = int(t * SR); o[s:s + len(x)] += x[: len(o) - s] * rng.uniform(0.6, 1); t += rng.uniform(0.06, 0.13)
    return norm(o, 0.35)
fx = np.zeros(N)
def add(x, t, g=1.0):
    s = int(t * SR)
    if 0 <= s < N: fx[s:s + len(x)] += (x * g)[: N - s]
# frame 0: the FORGED stamp lands at 0.0 (sound at the first sample) + low boom
add(K.stamp(), 0.0, 1.0); add(K.boom(), 0.0, 0.55)
add(K.flutter(), H['dropped'] + 0.1, 0.8); add(K.paper(), H['dropped'] + 0.9, 0.6);
add(K.paper(), H['pick'], 0.6); add(K.whoosh(0.35), H['oneday'] - 0.2, 0.4); add(K.rumble(), H['collapse'], 0.5); add(K.tear(), H['collapse'] + 0.1, 0.4)
add(K.shutter(), H['portrait'] - 0.1, 0.5); add(K.stamp(), H['daughter'] + 0.05, 0.8)
add(papers(4, 0.42), H['loans'] - 0.1, 0.6); add(K.cutfx(), H['nobody'] - 0.15, 0.45); add(K.stamp(), H['noCall'] + 0.1, 0.6)
add(K.stamp(), H['pct'], 0.8); add(counter(1.3), H['count'] - 0.1, 0.8); add(cashfall(1.2), H['count'], 0.6); add(K.kaching(), H['count'] + 1.2, 0.35)
add(K.flip(), H['house'] - 0.1, 0.5)
add(K.paper(), H['suit'] - 0.1, 0.6); add(K.stamp(), H['due'] + 0.05, 0.9)
add(K.shutter(), H['carnegie'] - 0.1, 0.4); add(K.stamp(), H['know'] + 0.05, 0.7); add(K.paper(), H['statement'] - 0.1, 0.5); add(typing(1.6), H['statement'], 0.6)
add(footsteps(2.6), H['run'], 0.8); add(rattle(), H['run'] + 1.2, 0.5); add(K.slam(), H['failed'] + 0.05, 0.7)
add(K.stamp(), H['news'] + 0.05, 1.0); add(K.boom(), H['news'] + 0.05, 0.35)
add(celldoor(), H['prison'] + 0.05, 0.8)
add(K.stamp(), H['zero'] + 0.05, 0.9); add(vault(), H['banks'] + 0.45, 0.4); add(cashfall(1.0), H['banks'] + 0.3, 0.6); add(K.paper(), H['name'] - 0.1, 0.5)
add(K.stamp(), CU['card'], 0.7)
# ---------- music: Gilded-Age parlor rag, 4/4, 84 BPM, F major → F minor strings (one bar grid) ----------
BPM = 84; BEAT = 60 / BPM; BAR = 4 * BEAT
NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)
mus = np.zeros(N)
def put(x, t, g=1.0):
    s = int(t * SR)
    if 0 <= s < N: mus[s:s + len(x)] += (x * g)[: N - s]
def piano(f, d=0.9, vel=1.0):  # hammer: decaying inharmonic partials + slight detune + felt click
    t = t_(d); x = sum(np.sin(2 * np.pi * f * h * (1 + 0.0004 * h * h) * t) * np.exp(-t * (1.6 + 1.3 * h)) / h ** 1.1 for h in range(1, 8))
    x += 0.4 * np.sin(2 * np.pi * f * 1.003 * t) * np.exp(-t * 2.2); x[:60] *= np.linspace(0, 1, 60)
    return lp(x, 4200) * vel * np.minimum(1, np.maximum(0, d - t) / 0.05)
def pizz(f): d = 0.45; t = t_(d); x = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (9 + 4 * h)) / h for h in range(1, 5)); x[:30] *= np.linspace(0, 1, 30); return lp(x, 2500)
def strings(f, d):  # low bowed section: detuned saws, slow swell
    t = t_(d); x = sum(lp(sg.sawtooth(2 * np.pi * np.cumsum(f * (1 + dt) * (1 + 0.003 * np.sin(2 * np.pi * 5 * t + dt * 300))) / SR), 900) for dt in (-0.003, 0, 0.004)) / 3
    return x * np.minimum(1, t / 0.7) * np.minimum(1, np.maximum(0, d - t) / 0.5)
def timp(): d = 0.9; t = t_(d); return np.sin(2 * np.pi * np.cumsum(55 + 25 * np.exp(-t * 12)) / SR) * np.exp(-t * 4) + 0.15 * lp(noise(d), 300) * np.exp(-t * 10)
# F major rag: bass on 1 & 3, chord on 2 & 4 (stride); melody syncopated
PROG = [(41, [57, 60, 65]), (46, [58, 62, 65]), (36, [55, 58, 64]), (41, [57, 60, 65])]     # F · Bb · C7 · F
MEL = [[(72, 0, 0.5), (69, 0.5, 0.5), (72, 1.5, 1), (77, 2.5, 0.5), (76, 3, 1)], [(74, 0, 1), (70, 1, 0.5), (74, 1.5, 1.5), (77, 3, 1)],
       [(76, 0, 0.5), (72, 0.5, 1), (70, 1.5, 0.5), (67, 2, 1.5), (70, 3.5, 0.5)], [(69, 0, 1.5), (65, 1.5, 0.5), (69, 2, 2)]]
DARK = [(41, [53, 56, 60]), (37, [49, 53, 56]), (36, [48, 52, 55]), (41, [53, 56, 60])]    # Fm · Db · C · Fm
# sections: (start, mode, gain)  mode: 'rag' full, 'ragsoft' (no melody), 'dark'
SECTIONS = [(0.0, 'ragsoft', 0.9), (L['c02'], 'rag', 1.0), (L['c07'] - 0.2, 'dark', 1.0), (H['news'], 'dark2', 1.1), (CU['card'] - 0.3, 'dark2', 1.15)]
def sec(t0): return [s for s in SECTIONS if s[0] <= t0 + 1e-6][-1]
nb = int(np.ceil(T / BAR)) + 1
for k in range(nb):
    t0 = k * BAR; _, mode, g = sec(t0)
    if mode.startswith('rag'):
        root, ch = PROG[k % 4]
        for b in range(4):
            if b % 2 == 0: put(piano(NOTE(root - 12 + (7 if b == 2 else 0)), 0.6, 0.8), t0 + b * BEAT, 0.35 * g)
            else:
                for n in ch: put(piano(NOTE(n), 0.35, 0.6), t0 + b * BEAT, 0.16 * g)
            put(pizz(NOTE(ch[(b + k) % 3] + 12)), t0 + b * BEAT + BEAT / 2, 0.16 * g)
        if mode == 'rag':
            for n, a, d in MEL[k % 4]: put(piano(NOTE(n), d * BEAT + 0.3, 0.9), t0 + a * BEAT, 0.3 * g)
    else:
        root, ch = DARK[k % 4]; put(strings(NOTE(root - 12), BAR + 0.4), t0, 0.5 * g); put(strings(NOTE(ch[0]), BAR + 0.4), t0, 0.25 * g); put(strings(NOTE(ch[2] - 12), BAR + 0.4), t0, 0.22 * g)
        put(timp(), t0, 0.35 * g)
        for b in (0, 2): put(pizz(NOTE(root)), t0 + b * BEAT, 0.2 * g)
        if mode == 'dark2': put(piano(NOTE(ch[2] + 12), 1.6, 0.7), t0 + 2 * BEAT, 0.18 * g)
fade = np.ones(N); fs = int((T - 0.6) * SR); fade[fs:] = np.linspace(1, 0, N - fs)
# ---------- voice ----------
vo = np.zeros(N)
for vid, t in CU['lines']:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{D}/vo/{vid}.mp3', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.int16).astype(float) / 32768; s = int(t * SR); vo[s:s + len(a)] += a[: N - s]
duck = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(4410) / 4410, 'same'); dk = np.clip(duck * 3, 0, 1)
mus = mus / (np.max(np.abs(mus)) + 1e-9)
out = (vo * 1.0 + fx * 0.3 * (1 - 0.5 * dk) + mus * 0.1 * (1 - 0.7 * dk)) * fade
cs = int(CU['card'] * SR); out[cs:] += (mus[cs:] * 0.12 * fade[cs:])
out = np.tanh(out * 1.1) * 0.9
w = wave.open(f'{D}/mix.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
print('mix ok', round(T, 2), 's')
