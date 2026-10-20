# Sound for the final video (copied from tests/mcd_collage/mix.py; VO read from the test folder): synthesized SFX at cues.json times + ElevenLabs VO (vo/n*.mp3). Writes mix.wav
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
SFX = {'pop': pop, 'whoosh': whoosh, 'fall': fall, 'thump': thump, 'zoom': lambda: whoosh(0.35), 'puff': puff, 'paper': paper, 'kaching': kaching, 'coins': coinburst,
       'rumble': rumble, 'tape': tape, 'scratch': scratch, 'unfold': lambda: norm(paper() + 0, 0.3), 'tick': tick, 'tag': lambda: pop(300, 900), 'rise': rise, 'clink': clink, 'flutter': flutter, 'slam': slam}
mix = np.zeros(N)
for c in CU['sfx']:
    name, t, g = c[0], c[1], (c[2] if len(c) > 2 else 1.0)
    x = SFX[name]() * g; s = int(t * SR)
    if 0 <= s < N: mix[s:s + len(x)] += x[: N - s]

# ---------- music: 120 BPM, beat 1 = burger impact (0.86 s); break on the dive (16.86); final chord on the drop (20.36) ----------
BPM, B0 = 120, 0.86; BEAT = 60 / BPM
NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)
def pluck(f, d=0.5, b=1.0):
    t = t_(d); x = sum((1 / h ** 1.4) * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (4 + h * 2.5)) for h in range(1, 6))
    x[: 80] *= np.linspace(0, 1, 80); return x * b
def marimba(f, d=0.45): t = t_(d); return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30)) * np.exp(-t * 7)
def bassn(f, d=0.45): t = t_(d); x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t); e = np.minimum(1, t / 0.01) * np.exp(-t * 3.5); return x * e
def pad(freqs, d, att=0.5):
    t = t_(d); x = sum(sg.sawtooth(2 * np.pi * f * (1 + dt) * t) for f in freqs for dt in (-0.004, 0.004)); x = lp(x, 1100)
    e = np.minimum(1, t / att) * np.minimum(1, (d - t) / 0.6); return x * e / (len(freqs) * 2)
def kick(): t = t_(0.35); return np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-t * 30)) / SR) * np.exp(-t * 9)
def snap(): t = t_(0.15); return bp(noise(0.15), 1200, 6000) * np.exp(-t * 32)
def hat(): t = t_(0.05); return hp(noise(0.05), 7000) * np.exp(-t * 80)
mus = np.zeros(N)
def put(x, t, g=1.0):
    s = int(t * SR)
    if 0 <= s < N: mus[s:s + len(x)] += (x * g)[: N - s]
CH = [(57, [57, 60, 64]), (53, [53, 57, 60]), (60, [60, 64, 67]), (55, [55, 59, 62])]  # Am F C G
ARP = [0, 1, 2, 3, 2, 1, 0, 2]
LEAD = [76, None, 74, 72, None, 72, 74, None, 72, None, 69, 67, None, 69, 72, None]
for bar in range(8):  # 0.86 .. 16.86
    t0 = B0 + bar * 4 * BEAT; root, ch = CH[bar % 4]
    for i in range(8):
        n = ch[ARP[i]] + 12 if ARP[i] < 3 else ch[0] + 24
        put(pluck(NOTE(n), 0.45), t0 + i * BEAT / 2, 0.16 if i % 2 else 0.22)
    for bt in range(4):
        put(bassn(NOTE(root - 24), 0.45), t0 + bt * BEAT, 0.42 if bt % 2 == 0 else 0.3)
        put(kick(), t0 + bt * BEAT, 0.55 if bt % 2 == 0 else 0.35)
        if bt % 2: put(snap(), t0 + bt * BEAT, 0.28)
        for h in range(4 if bar >= 4 else 2): put(hat(), t0 + bt * BEAT + h * BEAT / (4 if bar >= 4 else 2), 0.08 if h else 0.12)
    put(pad([NOTE(n) for n in ch], 4 * BEAT + 0.3, 0.3), t0, 0.12)
    if bar >= 4:
        for i, n in enumerate(LEAD[(bar % 2) * 8:(bar % 2) * 8 + 8]):
            if n: put(marimba(NOTE(n)), t0 + i * BEAT / 2, 0.2)
    if bar == 3:  # fill into the map reveal
        for i in range(4): put(snap(), t0 + 3 * BEAT + i * BEAT / 4, 0.12 + i * 0.05)
# pickup before the impact
for i, n in enumerate([64, 67, 69]): put(pluck(NOTE(n + 12), 0.35), B0 - 0.75 + i * 0.25, 0.15)
# break: pad + heartbeat + riser under the lift
brk = B0 + 32 * BEAT
put(pad([NOTE(n) for n in (57, 60, 64, 69)], 1.75 + 0.3, 0.4), brk, 0.16); put(pad([NOTE(n) for n in (53, 57, 60, 65)], 1.75, 0.3), brk + 1.75, 0.16)
for i in range(6): put(kick(), brk + i * 2 * BEAT, 0.28)
rt = t_(2.1); put(norm(fsweep(200, 1600, 2.1) * 0.3 + hp(noise(2.1), 3000) * 0.5, 1) * (rt / 2.1) ** 2, 20.36 - 2.1, 0.12)
# final chord (C major) + soft crash
HIT = 20.36
for n in (48, 55, 60, 64, 67, 72, 76): put(pluck(NOTE(n), 2.5), HIT, 0.16)
put(pad([NOTE(n) for n in (48, 60, 64, 67)], 2.6, 0.05), HIT, 0.2); put(kick(), HIT, 0.7); put(bassn(NOTE(36), 1.2), HIT, 0.5)
put(hp(noise(1.6), 5000) * np.exp(-t_(1.6) * 3), HIT, 0.1)
for i, n in enumerate([72, 76, 79, 84]): put(marimba(NOTE(n)), HIT + 0.75 + i * BEAT / 2, 0.14)
fade = np.ones(N); fs = int((CU['T'] - 0.7) * SR); fade[fs:] = np.linspace(1, 0, N - fs); mus *= fade
fx = mix * 0.7
vo = np.zeros(N)
for vid, t in CU['vo']:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{D}/../tests/mcd_collage/vo/{vid}.mp3', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.int16).astype(float) / 32768; s = int(t * SR); vo[s:s + len(a)] += a[: N - s]
duck = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(4410) / 4410, 'same')
dk = np.clip(duck * 3, 0, 1)
out = vo * 1.0 + fx * (1 - 0.35 * dk) + mus * 0.55 * (1 - 0.45 * dk)
out = np.tanh(out * 1.1) * 0.9
import wave
w = wave.open(f'{D}/mix.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
print('mix ok', len(CU['sfx']), 'sfx')
