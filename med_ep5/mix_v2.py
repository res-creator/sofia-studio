# v2 (vo_v2/, writes mix_v2.wav). Sound for episode 5 (copy of rent_ep4/mix.py): same synthesized SFX + a phone ring; music arranged to the bill story; SFX kept well under the voice. Reads cues.json + vo/, writes mix.wav
import json, subprocess, os, numpy as np, scipy.signal as sg
D = os.path.dirname(os.path.abspath(__file__)); SR = 44100
CU = json.load(open(f'{D}/cues.json')); N = int((CU['T'] + 0.5) * SR)
rng = np.random.default_rng(11)
def t_(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))
def norm(x, p=0.8): return x / (np.max(np.abs(x)) + 1e-9) * p
def bp(x, lo, hi, o=2): b, a = sg.butter(o, [lo / (SR / 2), min(hi / (SR / 2), 0.99)], 'band'); return sg.lfilter(b, a, x)
def lp(x, f): b, a = sg.butter(2, f / (SR / 2), 'low'); return sg.lfilter(b, a, x)
def hp(x, f): b, a = sg.butter(2, f / (SR / 2), 'high'); return sg.lfilter(b, a, x)
def fsweep(f0, f1, d): f = np.geomspace(f0, f1, int(d * SR)); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def whoosh(d=0.5, up=True):
    x = noise(d); n = len(x); out = np.zeros(n); seg = 1024
    for i in range(0, n, seg):
        u = i / n; fc = 400 + 3000 * (u if up else 1 - u); out[i:i + seg] = bp(x[i:i + seg + 2048], fc * 0.6, fc * 1.5)[:len(out[i:i + seg])]
    return norm(out * np.sin(np.linspace(0, np.pi, n)) ** 1.6, 0.5)
def thump(f=65, d=0.45): t = t_(d); return norm(np.sin(2 * np.pi * np.cumsum(f * np.exp(-t * 7) + 38) / SR) * np.exp(-t * 8) + 0.35 * lp(noise(d), 500) * np.exp(-t * 25), 0.95)
def pop(f0=420, f1=1300): d = 0.08; return norm(fsweep(f0, f1, d) * np.exp(-t_(d) * 30), 0.5)
def tick(): f = rng.uniform(900, 1500); d = 0.06; return norm(np.sin(2 * np.pi * f * t_(d)) * np.exp(-t_(d) * 60) + 0.3 * hp(noise(d), 3000) * np.exp(-t_(d) * 90), 0.3)
def paper(): d = 0.12; return norm(bp(noise(d), 1500, 7000) * np.exp(-t_(d) * 28), 0.35)
def clink():
    f = rng.uniform(2400, 3400); d = 0.25; t = t_(d); x = sum(np.sin(2 * np.pi * f * m * t) / (i + 1) for i, m in enumerate([1, 2.76, 5.4])) * np.exp(-t * 18)
    return norm(x, 0.16)
def kaching():
    d = 0.9; t = t_(d); bell = (np.sin(2 * np.pi * 2093 * t) + 0.6 * np.sin(2 * np.pi * 3136 * t) + 0.3 * np.sin(2 * np.pi * 4186 * t)) * np.exp(-t * 5)
    x = 0.5 * bell; x[: int(0.07 * SR)] += 0.6 * hp(noise(0.07), 2500) * np.exp(-t_(0.07) * 40); return norm(x, 0.5)
def fall(): d = 0.5; return norm(fsweep(1800, 500, d) * np.linspace(0.2, 1, int(d * SR)) * 0.6 + 0.4 * whoosh(d), 0.35)
def rumble(): d = 0.6; t = t_(d); return norm(lp(noise(d), 160) * np.sin(np.linspace(0, np.pi, len(t))) + 0.3 * fsweep(50, 90, d), 0.55)
def rise(): d = 0.5; return norm(fsweep(300, 900, d) * np.sin(np.linspace(0, np.pi, int(d * SR))) * 0.5 + whoosh(d), 0.35)
def tape(): d = 0.18; return norm(bp(noise(d), 800, 5000) * (1 - t_(d) / d) * (0.6 + 0.4 * np.sin(2 * np.pi * 70 * t_(d))), 0.35)
def scratch(): d = 0.5; t = t_(d); return norm(bp(noise(d), 2500, 8000) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t)) ** 2 * np.sin(np.linspace(0, np.pi, len(t))), 0.18)
def flutter(): d = 0.35; t = t_(d); return norm(bp(noise(d), 1000, 4000) * (0.5 + 0.5 * np.sin(2 * np.pi * 24 * t)) * np.exp(-t * 6), 0.12)
def slam(): return norm(thump(55, 0.5) + 0.4 * hp(noise(0.5), 2000) * np.exp(-t_(0.5) * 14), 0.7)
def puff(): d = 0.4; return norm(lp(noise(d), 900) * np.exp(-t_(d) * 9), 0.3)
def coinburst():
    o = np.zeros(int(0.7 * SR))
    for i in range(7): s = int(rng.uniform(0, 0.4) * SR); c = clink(); o[s:s + len(c)] += c[: len(o) - s] * 2
    return norm(o, 0.35)
def snap(): d = 0.09; t = t_(d); return norm(hp(noise(d), 2500) * np.exp(-t * 60) + 0.5 * np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90), 0.45)
def stamp(): d = 0.4; t = t_(d); return norm(thump(85, 0.4) * 0.9 + 0.6 * bp(noise(d), 300, 2500) * np.exp(-t * 35) + 0.3 * hp(noise(d), 4000) * np.exp(-t * 60), 0.9)
def tear():
    d = 0.6; t = t_(d); crack = (rng.random(len(t)) < 0.02).astype(float); crack = np.convolve(crack, np.exp(-np.arange(200) / 30), 'same')
    x = bp(noise(d), 1200, 7000) * (0.4 + 0.6 * crack) * np.sin(np.linspace(0, np.pi, len(t))) ** 0.7; return norm(x, 0.55)
def boom(): d = 1.4; t = t_(d); x = np.sin(2 * np.pi * np.cumsum(38 + 40 * np.exp(-t * 6)) / SR) * np.exp(-t * 2.2) + 0.25 * lp(noise(d), 200) * np.exp(-t * 5); return norm(x, 0.95)
def flap():
    d = 0.9; o = np.zeros(int(d * SR)); k = t_(0.012); c = hp(noise(0.012), 2000) * np.exp(-k * 400)
    for i in range(int(d * 32)): s = int((i / 32 + rng.uniform(0, 0.01)) * SR); o[s:s + len(c)] += c[: len(o) - s] * rng.uniform(0.5, 1)
    return norm(o, 0.35)
def wah():
    o = np.zeros(int(1.5 * SR))
    for i, (f, dd) in enumerate([(196, 0.3), (185, 0.3), (175, 0.3), (165, 0.6)]):
        t = t_(dd); fr = f * (1 + 0.02 * np.sin(2 * np.pi * 6 * t)); x = lp(sg.sawtooth(2 * np.pi * np.cumsum(fr) / SR), 1400) * np.minimum(1, t / 0.03) * np.minimum(1, (dd - t) / 0.08)
        s = int(i * 0.3 * SR); o[s:s + len(x)] += x[: len(o) - s]
    return norm(o, 0.32)
def blip(): d = 0.16; t = t_(d); x = np.sin(2 * np.pi * 1760 * t) * (t < 0.06) + np.sin(2 * np.pi * 2350 * t) * (t > 0.08) * (t < 0.14); return norm(x * np.exp(-t * 8), 0.28)
def cutfx(): d = 0.22; t = t_(d); return norm(whoosh(d, up=False) * 0.6 + 0.6 * hp(noise(d), 3000) * np.exp(-t * 25), 0.45)
def pulse():
    o = np.zeros(int(0.6 * SR))
    for i in range(4): t = t_(0.08); x = np.sin(2 * np.pi * (600 + i * 220) * t) * np.exp(-t * 30); s = int(i * 0.1 * SR); o[s:s + len(x)] += x
    return norm(o + 0.5 * whoosh(0.6), 0.35)
def brake():
    d = 0.7; t = t_(d); f = np.linspace(2600, 1500, len(t)); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + bp(noise(d), 1500, 4000) * 0.6
    return norm(x * np.minimum(1, t / 0.03) * np.exp(-t * 2.5), 0.4)
def rev():
    d = 0.9; t = t_(d); f = 55 + 120 * (t / d) ** 1.5; ph = 2 * np.pi * np.cumsum(f) / SR; x = lp(sg.sawtooth(ph) + 0.5 * sg.sawtooth(ph * 2.02), 900)
    return norm(x * np.minimum(1, t / 0.08) * np.minimum(1, (d - t) / 0.2), 0.45)
def ring():  # classic two-tone phone ring burst (440 + 480 Hz, 20 Hz warble)
    d = 0.8; t = t_(d); x = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 20 * t)))
    return norm(x * np.minimum(1, t / 0.02) * np.minimum(1, (d - t) / 0.05), 0.35)
SFX = {'ring': ring, 'brake': brake, 'rev': rev, 'blip': blip, 'cut': cutfx, 'pulse': pulse, 'snap': snap, 'stamp': stamp, 'tear': tear, 'boom': boom, 'flap': flap, 'wah': wah, 'pop': pop, 'whoosh': whoosh, 'fall': fall, 'thump': thump, 'zoom': lambda: whoosh(0.35), 'puff': puff, 'paper': paper, 'kaching': kaching, 'coins': coinburst,
       'rumble': rumble, 'tape': tape, 'scratch': scratch, 'unfold': lambda: norm(paper() + 0, 0.3), 'tick': tick, 'tag': lambda: pop(300, 900), 'rise': rise, 'clink': clink, 'flutter': flutter, 'slam': slam}
mix = np.zeros(N)
for c in CU['sfx']:
    name, t, g = c[0], c[1], (c[2] if len(c) > 2 else 1.0)
    x = SFX[name]() * g; s = int(t * SR)
    if 0 <= s < N: mix[s:s + len(x)] += x[: N - s]

# ---------- music (synthesized, ours): 120 BPM grid from the stamp; sections follow the story ----------
MU = CU['music']; B0 = MU['b0']; BEAT = 0.5; BAR = 2.0
NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)
def pluck(f, d=0.5, b=1.0):
    t = t_(d); x = sum((1 / h ** 1.4) * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (4 + h * 2.5)) for h in range(1, 6))
    x[: 80] *= np.linspace(0, 1, 80); return x * b
def marimba(f, d=0.45): t = t_(d); return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30)) * np.exp(-t * 7)
def bassn(f, d=0.45): t = t_(d); x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t); e = np.minimum(1, t / 0.01) * np.exp(-t * 3.5); return x * e
def pad(freqs, d, att=0.5):
    t = t_(d); x = sum(sg.sawtooth(2 * np.pi * f * (1 + dt) * t) for f in freqs for dt in (-0.004, 0.004)); x = lp(x, 1100)
    e = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, d - t) / 0.6); return x * e / (len(freqs) * 2)
def kick(): t = t_(0.35); return np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-t * 30)) / SR) * np.exp(-t * 9)
def snapd(): t = t_(0.15); return bp(noise(0.15), 1200, 6000) * np.exp(-t * 32)
def hat(): t = t_(0.05); return hp(noise(0.05), 7000) * np.exp(-t * 80)
mus = np.zeros(N)
def put(x, t, g=1.0):
    s = int(t * SR)
    if 0 <= s < N: mus[s:s + len(x)] += (x * g)[: N - s]
MAJ = [(60, [60, 64, 67]), (57, [57, 60, 64]), (53, [53, 57, 60]), (55, [55, 59, 62])]   # C Am F G
MIN = [(50, [50, 53, 57]), (46, [46, 50, 53]), (50, [50, 53, 57]), (45, [45, 49, 52])]   # Dm Bb Dm A (tension)
ARP = [0, 1, 2, 3, 2, 1, 0, 2]
def bar(t0, k, prog=MAJ, drums=2, arp=True, lead=False, g=1.0):
    root, ch = prog[k % 4]
    if arp:
        for i in range(8): n = ch[ARP[i]] + 12 if ARP[i] < 3 else ch[0] + 24; put(pluck(NOTE(n), 0.42), t0 + i * BEAT / 2, (0.13 if i % 2 else 0.18) * g)
    for b in range(4):
        put(bassn(NOTE(root - 24), 0.42), t0 + b * BEAT, (0.36 if b % 2 == 0 else 0.24) * g)
        if drums >= 1: put(kick(), t0 + b * BEAT, (0.5 if b % 2 == 0 else 0.3) * g)
        if drums >= 2 and b % 2: put(snapd(), t0 + b * BEAT, 0.22 * g)
        if drums >= 2: put(hat(), t0 + b * BEAT + BEAT / 2, 0.08 * g); put(hat(), t0 + b * BEAT, 0.05 * g)
    put(pad([NOTE(n) for n in ch], BAR + 0.3, 0.3), t0, 0.09 * g)
    if lead:
        for i, n in enumerate([72, None, 74, 76, None, 74, 72, None]):
            if n: put(marimba(NOTE(n)), t0 + i * BEAT / 2, 0.13 * g)
def section(t0, t1, **kw):
    k = 0; t = t0
    while t < t1 - 0.01: bar(t, k, **kw); t += BAR; k += 1
for i, n in enumerate([67, 71, 74]): put(pluck(NOTE(n + 12), 0.25), max(0.0, B0 - 0.3) + i * 0.1, 0.1)  # tiny pickup into the stamp
M = MU
section(B0, M['relief'], prog=MIN, drums=1, arp=False, g=0.8)                                   # the $18,000 estimate: low pulse
t = B0
while t < M['relief']: put(bassn(NOTE(38), 0.2), t + 0.25, 0.18); t += 0.5
section(M['relief'], M['ring'] - 0.1, prog=MAJ, drums=2, lead=True, g=0.7)                      # ~$3,000: relief, light
# the ring: the music stops dead; tension returns after "Not quite."
section(M['tense'] + 0.4, M['twist'], prog=MIN, drums=1, arp=True, g=0.85)
for j in range(int((M['finale'] - M['twist']) / BAR)):                                           # the twist: serious pad + kick
    t0 = M['twist'] + j * BAR; put(pad([NOTE(n) for n in (38, 45, 50, 53)], BAR + 0.3, 0.4), t0, 0.14); put(kick(), t0, 0.3); put(kick(), t0 + 0.35, 0.16)
section(M['finale'], M['hit'], prog=MIN, drums=1, arp=True, g=0.7)                               # the finale
rd = 1.2; rt = t_(rd); put(norm(fsweep(200, 1500, rd) * 0.3 + hp(noise(rd), 3000) * 0.5, 1) * (rt / rd) ** 2, M['hit'] - rd, 0.08)
for n in (38, 50, 53, 57): put(pluck(NOTE(n), 2.4), M['hit'], 0.13)
put(pad([NOTE(n) for n in (50, 53, 57, 62)], M['end'] - M['hit'], 0.6), M['hit'], 0.07)
r0, r1 = int(M['ring'] * SR), int((M['tense'] + 0.4) * SR); g = np.ones(N); g[r0:r1] = 0; g[r0 - 2205:r0] = np.linspace(1, 0, 2205); mus *= g   # silence under the ring
fade = np.ones(N); fs = int((CU['T'] - 0.7) * SR); fade[fs:] = np.linspace(1, 0, N - fs); mus *= fade
fx = mix * 0.3   # owner's note: effects must sit clearly under the voice
vo = np.zeros(N)
for vid, t in CU['vo']:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{D}/vo_v2/{vid}.mp3', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.int16).astype(float) / 32768; s = int(t * SR); vo[s:s + len(a)] += a[: N - s]
duck = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(4410) / 4410, 'same')
dk = np.clip(duck * 3, 0, 1)
out = vo * 1.0 + fx * (1 - 0.6 * dk) + mus * 0.3 * (1 - 0.55 * dk)
out = np.tanh(out * 1.1) * 0.9
import wave
w = wave.open(f'{D}/mix_v2.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
print('mix ok', len(CU['sfx']), 'sfx')
