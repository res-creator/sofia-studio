# v2: reads cues_v2.json + vo_v2/, writes mix_v2.wav (same music and SFX as v1; hit names reused).
# Sound for episode 29 "The Country That Didn't Exist" (adult documentary style). NEW music — not the channel's usual bed and not ep 28's noir jazz:
# a dark 1820s maritime folk tune, sea-shanty feel, in 3/4 (D dorian, 72 BPM) on ONE bar grid: bowed cello drone, frame drum, plucked strings
# and a slow fiddle-like melody; sections follow the story (promise → voyage → jungle → court → payoff).
# Synthesized SFX (ours): stamps, paper, coins, counter ticks, sea wash, ship's bell, gavel, red-marker scratch, night insects (tonal, not voice-like).
# Music very quiet under the voice: mus*0.1*(1-0.7*dk). Reads cues_v2.json + vo/, writes mix.wav
import json, subprocess, os, sys, wave, numpy as np, scipy.signal as sg
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, f'{D}/../longform/kit')
import sfx as K
from sfx import t_, noise, norm, bp, lp, hp, SR
CU = json.load(open(f'{D}/cues_v2.json')); T = CU['T']; N = int((T + 0.5) * SR); H = CU['hits']; L = dict(CU['lines'])
rng = np.random.default_rng(29)
# ---------- custom SFX ----------
def counter(d=1.0):
    o = np.zeros(int(d * SR)); t = 0.0
    while t < d: x = K.tick(); s = int(t * SR); o[s:s + len(x)] += x[: len(o) - s]; t += 0.035 + 0.06 * (t / d) ** 2
    return norm(o, 0.3)
def seawash(d=4.0): t = t_(d); x = lp(noise(d), 700) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * t - 1.5) ** 2) + 0.3 * bp(noise(d), 1500, 5000) * np.sin(2 * np.pi * 0.35 * t) ** 8; return norm(x * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.8), 0.5)
def shipbell(): d = 1.8; t = t_(d); return norm(sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) / (i + 1) for i, (f, k) in enumerate([(880, 2.2), (2090, 3.5), (2640, 5), (3700, 7)])), 0.4)
def creak(): d = 0.7; t = t_(d); f = 180 + 60 * np.sin(np.pi * t / d); x = bp(sg.sawtooth(2 * np.pi * np.cumsum(f) / SR) * (rng.random(len(t)) < 0.3), 300, 1500); return norm(x * np.sin(np.pi * t / d), 0.2)
def marker(d=0.5): t = t_(d); return norm(bp(noise(d), 1200, 5000) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * t)) * np.sin(np.pi * t / d), 0.3)
def insects(d=3.0): t = t_(d); x = sum(np.sin(2 * np.pi * f * t) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * r * t))) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.7 * t + i)) for i, (f, r) in enumerate([(4200, 22), (5100, 31), (3600, 17)])); return norm(x * np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.8), 0.12)
def flagflap(d=0.9): t = t_(d); return norm(bp(noise(d), 300, 2500) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 5 * t))) * np.sin(np.pi * t / d), 0.3)
def papers(n=3, gap=0.2):
    o = np.zeros(int((n * gap + 0.4) * SR))
    for i in range(n): x = K.paper() if i % 2 else K.flip(); s = int(i * gap * SR); o[s:s + len(x)] += x[: len(o) - s]
    return norm(o, 0.35)
def coinpour(d=1.2):
    o = np.zeros(int(d * SR))
    for i in range(26): c = K.clink(); s = int(rng.uniform(0, d - 0.3) * SR); o[s:s + len(c)] += c * rng.uniform(0.5, 1.2)
    return norm(o, 0.4)
def gavel1(): c = K.clank(); x = 0.5 * c; x[:int(0.3 * SR)] += K.thump(120, 0.3)[: len(x)]; return norm(x, 0.6)
def gavel2(): o = np.zeros(int(0.9 * SR)); g = gavel1(); o[: len(g)] += g; s = int(0.32 * SR); o[s:s + len(g)] += g[: len(o) - s] * 0.8; return o
fx = np.zeros(N)
def add(x, t, g=1.0):
    s = int(t * SR)
    if 0 <= s < N: fx[s:s + len(x)] += (x * g)[: N - s]
# frame 0: the DOESN'T EXIST stamp lands at 0.0 (sound at the first sample) + a low boom
add(K.stamp(), 0.0, 1.0); add(K.boom(), 0.0, 0.6)
add(K.whoosh(0.4), L['y02'] - 0.25, 0.4); add(K.flip(), H['ruler'] - 0.1, 0.6)
add(papers(2, 0.15), H['book'] - 0.1, 0.6); add(flagflap(), H['flag'] - 0.1, 0.7); add(K.paper(), H['money'] - 0.2, 0.6)
add(papers(3, 0.2), H['bond'] - 0.1, 0.6); add(counter(1.0), H['counter'] - 0.1, 0.8); add(K.kaching(), H['counter'] + 0.95, 0.35)
add(K.paper(), H['land'] - 0.1, 0.6); add(papers(3, 0.28), H['jobs'] - 0.1, 0.6); add(K.paper(), H['shoe'] - 0.1, 0.6); add(K.stamp(), H['royal'] + 0.05, 0.8)
add(coinpour(1.3), H['coins'], 0.8); add(K.flutter(), H['swap'] - 0.05, 0.8); add(papers(4, 0.12), H['swap'], 0.5)
add(seawash(3.4), H['ships'] - 0.2, 0.9); add(shipbell(), H['ships'] + 0.1, 0.5); add(creak(), H['ship2'] + 0.2, 0.7)
add(marker(0.55), H['capital'] + 0.02, 0.9); add(K.stamp(), H['capital'] + 0.05, 0.5); add(insects(3.2), H['jungle'] - 0.1, 0.8)
add(counter(1.1), H['count'], 0.7); add(K.boom(), H['count'] + 1.1, 0.35)
add(K.cutfx(), H['court'] - 0.15, 0.5); add(gavel2(), H['court'] + 0.2, 0.7); add(K.stamp(), H['acquitted'] + 0.05, 0.9)
add(K.bell(), H['caracas'] + 0.05, 0.35)
add(K.paper(), H['final'] - 0.15, 0.6); add(K.stamp(), H['fake'] + 0.05, 0.9); add(coinpour(0.8), H['real'] - 0.6, 0.5); add(K.stamp(), H['real'] + 0.05, 0.9)
add(K.stamp(), CU['card'], 0.7)
# ---------- music: maritime folk, 3/4, 72 BPM, D dorian; one bar grid from 0 ----------
BPM = 72; BEAT = 60 / BPM; BAR = 3 * BEAT
NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)
mus = np.zeros(N)
def put(x, t, g=1.0):
    s = int(t * SR)
    if 0 <= s < N: mus[s:s + len(x)] += (x * g)[: N - s]
def cello(f, d):  # bowed drone: saw through a low-pass, slow bow swell, gentle vibrato
    t = t_(d); fr = f * (1 + 0.004 * np.sin(2 * np.pi * 4.8 * t)); x = lp(sg.sawtooth(2 * np.pi * np.cumsum(fr) / SR), 650) + 0.3 * np.sin(2 * np.pi * np.cumsum(fr) / SR)
    return x * np.minimum(1, t / 0.5) * np.minimum(1, np.maximum(0, d - t) / 0.4)
def drum(acc=1.0): t = t_(0.5); return (np.sin(2 * np.pi * np.cumsum(70 + 50 * np.exp(-t * 25)) / SR) * np.exp(-t * 9) + 0.2 * lp(noise(0.5), 900) * np.exp(-t * 30)) * acc
def pluck(f, d=0.9):  # harp/cittern-like: decaying harmonics, brighter attack
    t = t_(d); x = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (2.5 + 2.2 * h)) / h ** 1.3 for h in range(1, 7)); x[:40] *= np.linspace(0, 1, 40); return lp(x, 3500)
def fiddle(f, d):  # slow fiddle: saw, body bandpass, delayed vibrato, bow attack
    t = t_(d); vib = 0.007 * np.sin(2 * np.pi * 5.6 * t) * np.minimum(1, t / 0.35); ph = 2 * np.pi * np.cumsum(f * (1 + vib)) / SR
    x = bp(sg.sawtooth(ph), 500, 3800) + 0.25 * np.sin(ph) + 0.05 * bp(noise(d), 2000, 6000); return x * np.minimum(1, t / 0.09) * np.minimum(1, np.maximum(0, d - t) / 0.15)
PROG = [(50, [62, 65, 69]), (48, [60, 64, 67]), (50, [62, 65, 69]), (45, [60, 64, 69])]   # Dm · C · Dm · Am
TUNE = [[(69, 0, 1), (74, 1, 1.5), (72, 2.5, 0.5)], [(67, 0, 1), (72, 1, 1), (76, 2, 1)], [(77, 0, 1.5), (76, 1.5, 0.5), (74, 2, 1)], [(72, 0, 1), (69, 1, 2)]]
TUNE2 = [[(74, 0, 2), (72, 2, 1)], [(69, 0, 3)], [(65, 0, 1), (67, 1, 1), (69, 2, 1)], [(62, 0, 3)]]   # lower, sadder answer
# sections: (start, drone, drum, pluck, fiddle tune or None, gain)
SECTIONS = [(0.0, 1, 1, 0, None, 0.9), (L['y03'], 1, 1, 1, None, 1.0), (L['y05'], 1, 1, 1, TUNE, 1.0), (L['y07'], 1, 2, 1, TUNE, 1.1),
            (H['jungle'] - 0.3, 1, 1, 0, None, 0.8), (L['y10'], 1, 1, 1, TUNE2, 0.9), (L['y12'], 1, 2, 1, TUNE, 1.0), (CU['card'] - 0.3, 1, 1, 1, TUNE, 1.1)]
def sec(t0): return [s for s in SECTIONS if s[0] <= t0 + 1e-6][-1]
nb = int(np.ceil(T / BAR)) + 1
for k in range(nb):
    t0 = k * BAR; _, dr, dm, pl, tune, g = sec(t0); root, ch = PROG[k % 4]
    if dr: put(cello(NOTE(root - 12), BAR + 0.3), t0, 0.5 * g); put(cello(NOTE(root - 5), BAR + 0.3), t0, 0.22 * g)
    if dm: put(drum(1.0), t0, 0.45 * g); put(drum(0.5), t0 + 2 * BEAT, 0.3 * g)
    if dm == 2: put(drum(0.4), t0 + 1.5 * BEAT, 0.22 * g)
    if pl:
        for j, n in enumerate([ch[0], ch[1], ch[2], ch[1] + 12, ch[2], ch[1]]): put(pluck(NOTE(n)), t0 + j * BEAT / 2, 0.22 * g)
    if tune:
        for n, a, d in tune[k % 4]: put(fiddle(NOTE(n), d * BEAT), t0 + a * BEAT, 0.2 * g)
fade = np.ones(N); fs = int((T - 0.6) * SR); fade[fs:] = np.linspace(1, 0, N - fs)
# ---------- voice ----------
vo = np.zeros(N)
for vid, t in CU['lines']:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{D}/vo_v2/{vid}.mp3', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.int16).astype(float) / 32768; s = int(t * SR); vo[s:s + len(a)] += a[: N - s]
duck = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(4410) / 4410, 'same'); dk = np.clip(duck * 3, 0, 1)
mus = mus / (np.max(np.abs(mus)) + 1e-9)
out = (vo * 1.0 + fx * 0.3 * (1 - 0.5 * dk) + mus * 0.1 * (1 - 0.7 * dk)) * fade
# the card (no voice): let the music come up a little so the ending isn't empty
cs = int(CU['card'] * SR); out[cs:] += (mus[cs:] * 0.12 * fade[cs:])
out = np.tanh(out * 1.1) * 0.9
w = wave.open(f'{D}/mix_v2.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
print('mix ok', round(T, 2), 's')
