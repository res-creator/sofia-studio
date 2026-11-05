# How It's Run LONG-FORM sound kit: synthesized SFX (ours, no samples) + chapter stem writer.
# A chapter's mix.py: `import sys; sys.path.insert(0, '../../../kit'); import sfx; sfx.stems(__file__)` -> vo.wav (voice) + fx.wav (SFX x 0.3, not ducked)
# Music is NOT made per chapter: assemble.py builds one continuous bed from every chapter's cues.json music sections.
import json, subprocess, os, wave, numpy as np, scipy.signal as sg
SR = 44100
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
def scanfx(): d = 0.7; t = t_(d); return norm(np.sin(2 * np.pi * np.cumsum(900 + 700 * np.sin(np.pi * t / d)) / SR) * 0.4 * np.sin(np.pi * t / d) + 0.3 * bp(noise(d), 3000, 8000) * np.sin(np.pi * t / d), 0.3)
def lockfx():
    o = np.zeros(int(0.3 * SR))
    for i in range(2): x = np.sin(2 * np.pi * 2400 * t_(0.05)) * np.exp(-t_(0.05) * 50); s = int(i * 0.09 * SR); o[s:s + len(x)] += x
    return norm(o, 0.35)
def hum(): d = 2.4; t = t_(d); return norm((np.sin(2 * np.pi * 110 * t) + 0.4 * np.sin(2 * np.pi * 220 * t)) * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.6), 0.12)
def servo(): d = 0.35; t = t_(d); return norm(sg.sawtooth(2 * np.pi * np.cumsum(300 + 500 * t / d) / SR) * np.sin(np.pi * t / d), 0.18)
def jet(): d = 2.6; t = t_(d); return norm(lp(noise(d), 1200) * np.sin(np.pi * t / d) ** 0.8 + 0.2 * bp(noise(d), 3000, 6000) * np.sin(np.pi * t / d), 0.3)
def engine(): d = 1.6; t = t_(d); ph = 2 * np.pi * np.cumsum(38 + 6 * np.sin(t * 3)) / SR; return norm(lp(sg.sawtooth(ph) + 0.5 * sg.sawtooth(ph * 2.01), 500) * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.5), 0.22)
def shutter(): d = 0.12; t = t_(d); x = hp(noise(d), 2000) * (np.exp(-t * 80) + 0.7 * np.exp(-np.maximum(0, t - 0.05) * 90) * (t > 0.05)); return norm(x, 0.4)
def power(): d = 0.6; t = t_(d); return norm(fsweep(80, 400, d) * np.exp(-t * 3) * 0.5 + 0.6 * np.pad(thump(70, 0.4), (0, int(d * SR) - int(0.4 * SR))), 0.6)
def steps():
    o = np.zeros(int(1.8 * SR))
    for i in range(6): x = lp(noise(0.06), 900) * np.exp(-t_(0.06) * 60); s = int(i * 0.28 * SR); o[s:s + len(x)] += x
    return norm(o, 0.25)
def buzz(): d = 0.4; t = t_(d); return norm(lp(sg.square(2 * np.pi * 150 * t), 600) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 8 * t))), 0.35)
def printfx():
    d = 0.6; t = t_(d); x = bp(noise(d), 1500, 5000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 28 * t))) * np.minimum(1, t / 0.02) * np.minimum(1, (d - t) / 0.05)
    return norm(x + 0.3 * np.sin(2 * np.pi * 180 * t) * np.sign(np.sin(2 * np.pi * 28 * t)), 0.3)
def sparkle():
    o = np.zeros(int(0.7 * SR))
    for i, f in enumerate([1568, 2093, 2637, 3136]): x = np.sin(2 * np.pi * f * t_(0.3)) * np.exp(-t_(0.3) * 12); s = int(i * 0.07 * SR); o[s:s + len(x)] += x
    return norm(o, 0.3)
def flip(): d = 0.25; t = t_(d); return norm(bp(noise(d), 800, 5000) * np.sin(np.pi * t / d) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * t)), 0.3)
def tap(): d = 0.05; t = t_(d); return norm(lp(noise(d), 3000) * np.exp(-t * 120) + 0.4 * np.sin(2 * np.pi * 900 * t) * np.exp(-t * 90), 0.35)
def boop(): d = 0.25; t = t_(d); return norm(np.sin(2 * np.pi * np.cumsum(600 + 500 * (t / d)) / SR) * np.exp(-t * 8), 0.3)
def twang(): d = 0.6; t = t_(d); return norm(np.sin(2 * np.pi * 110 * t * (1 + 0.05 * np.sin(2 * np.pi * 9 * t))) * np.exp(-t * 5) + 0.3 * np.sin(2 * np.pi * 220 * t) * np.exp(-t * 7), 0.4)
def buzzer(): d = 0.35; t = t_(d); return norm(lp(sg.square(2 * np.pi * 140 * t), 1500) * np.minimum(1, (d - t) / 0.05), 0.25)
def click(): d = 0.03; t = t_(d); return norm(hp(noise(d), 2500) * np.exp(-t * 200), 0.3)
def balloonpop(): d = 0.3; t = t_(d); return norm(hp(noise(d), 600) * np.exp(-t * 40) + 0.6 * thump(90, 0.3)[: int(d * SR)], 0.8)
def tvon(): d = 0.5; t = t_(d); return norm(np.sin(2 * np.pi * 15734 / 4 * t) * np.exp(-t * 6) * 0.3 + hp(noise(d), 3000) * np.exp(-t * 12) * 0.5 + thump(60, 0.5)[: len(t)] * 0.3, 0.4)
def laugh():  # studio audience laugh (ElevenLabs sound effect, generated once: sfx/laugh.mp3)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'laugh.mp3'), '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(float) / 32768; return norm(x, 0.6)
def applause(): d = 1.2; t = t_(d); x = bp(noise(d), 800, 6000) * (0.6 + 0.4 * (rng.random(len(t)) < 0.05)); return norm(x * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.6), 0.3)
def typefx(): d = 0.07; t = t_(d); return norm(hp(noise(d), 1500) * np.exp(-t * 90) + 0.5 * np.sin(2 * np.pi * 300 * t) * np.exp(-t * 70), 0.45)
def ding(): d = 0.8; t = t_(d); return norm((np.sin(2 * np.pi * 1568 * t) + 0.4 * np.sin(2 * np.pi * 3136 * t)) * np.exp(-t * 5), 0.4)
def snip(): d = 0.12; t = t_(d); return norm(hp(noise(d), 3500) * np.exp(-t * 50) + 0.6 * np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 80), 0.4)
def horn(): d = 0.45; t = t_(d); return norm(lp(sg.square(2 * np.pi * 330 * t) + sg.square(2 * np.pi * 415 * t), 1800) * np.minimum(1, t / 0.02) * np.minimum(1, (d - t) / 0.05), 0.3)
def error():  # the 'machine is broken' error beep, three descending square-wave tones, starts at 0.0 s
    d = 0.75; t = t_(d); f = np.where(t < 0.22, 880, np.where(t < 0.44, 660, 440)); g = ((t % 0.22) < 0.17).astype(float)
    return norm(lp(sg.square(2 * np.pi * np.cumsum(f) / SR), 3000) * g * np.minimum(1, (d - t) / 0.05), 0.5)
def squeak():  # tiny cartoon rat squeak: two short high chirps (pure tones, no voice-like noise)
    o = np.zeros(int(0.22 * SR))
    for i, (f0, f1) in enumerate([(2400, 3300), (2700, 3600)]): d = 0.07; t = t_(d); x = fsweep(f0, f1, d) * np.sin(np.pi * t / d); s = int(i * 0.1 * SR); o[s:s + len(x)] += x
    return norm(o, 0.22)
def splash(): d = 0.4; t = t_(d); return norm(bp(noise(d), 600, 4000) * np.exp(-t * 9) * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * t)), 0.3)
def machine(): d = 1.8; t = t_(d); return norm((lp(noise(d), 300) * 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 6 * t)) * bp(noise(d), 500, 1500)) * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.4), 0.4)
SFX = {'scan': scanfx, 'lock': lockfx, 'hum': hum, 'servo': servo, 'jet': jet, 'engine': engine, 'shutter': shutter, 'power': power, 'steps': steps, 'buzz': buzz, 'print': printfx,
       'sparkle': sparkle, 'flip': flip, 'tap': tap, 'boop': boop, 'twang': twang, 'buzzer': buzzer, 'click': click, 'balloonpop': balloonpop, 'ring': ring, 'brake': brake, 'rev': rev, 'blip': blip, 'cut': cutfx, 'pulse': pulse, 'snap': snap, 'stamp': stamp, 'tear': tear, 'boom': boom, 'flap': flap, 'wah': wah, 'pop': pop, 'whoosh': whoosh, 'fall': fall, 'thump': thump, 'zoom': lambda: whoosh(0.35), 'puff': puff, 'paper': paper, 'kaching': kaching, 'coins': coinburst,
       'rumble': rumble, 'tape': tape, 'scratch': scratch, 'unfold': lambda: norm(paper() + 0, 0.3), 'tick': tick, 'tag': lambda: pop(300, 900), 'rise': rise, 'clink': clink, 'flutter': flutter, 'slam': slam, 'tvon': tvon, 'laugh': laugh, 'applause': applause, 'type': typefx, 'ding': ding, 'snip': snip, 'horn': horn, 'machine': machine, 'error': error, 'squeak': squeak, 'splash': splash}

# ---- new for the long-form ----
def fizz(): d = 1.4; t = t_(d); x = hp(noise(d), 3500) * (rng.random(len(t)) < 0.08) * 3 + 0.3 * hp(noise(d), 6000); return norm(x * np.exp(-t * 2.2) * np.minimum(1, t / 0.01), 0.35)
def crowd(d=2.0, mood=0):  # murmur (0), cheer (1), boo (-1): band-limited noise bursts + slow swell
    t = t_(d); base = bp(noise(d), 300, 2500) * (0.6 + 0.4 * np.sin(2 * np.pi * 3.3 * t + rng.uniform(0, 6)))
    if mood > 0: base = base + 0.7 * bp(noise(d), 1500, 5000) * (0.5 + 0.5 * np.sin(2 * np.pi * 6 * t))
    if mood < 0: base = bp(noise(d), 150, 900) * (0.7 + 0.3 * np.sin(2 * np.pi * 2.2 * t)) + 0.4 * lp(sg.sawtooth(2 * np.pi * (110 + 15 * np.sin(2 * np.pi * 1.3 * t)) * t), 600)
    return norm(base * np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.6), 0.35)
def boing(): d = 0.5; t = t_(d); f = 180 + 260 * np.exp(-t * 6) * (1 + 0.3 * np.sin(2 * np.pi * 14 * t)); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5), 0.4)
def slide(up=True): d = 0.6; f = np.geomspace(500, 1600, int(d * SR)) if up else np.geomspace(1600, 400, int(d * SR)); t = t_(d); return norm(np.sin(2 * np.pi * np.cumsum(f * (1 + 0.01 * np.sin(2 * np.pi * 7 * t))) / SR) * np.sin(np.pi * t / d) ** 0.5, 0.3)
def clank(): d = 0.35; t = t_(d); x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(420, 14), (1130, 20), (2210, 30)]) + 0.4 * bp(noise(d), 800, 4000) * np.exp(-t * 40); return norm(x, 0.45)
def factory(d=3.0):
    o = np.zeros(int(d * SR))
    for i in range(int(d / 0.42)): c = clank() * rng.uniform(0.5, 1); s = int(i * 0.42 * SR); o[s:s + len(c)] += c[: len(o) - s]
    t = t_(d); o += 0.25 * lp(noise(d), 200) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.5); return norm(o, 0.4)
def glassclink(): return norm(clink() + 0.6 * clink(), 0.3)
def typewriter(n=8):
    o = np.zeros(int(n * 0.11 * SR + SR * 0.1))
    for i in range(n): x = typefx(); s = int(i * 0.11 * SR); o[s:s + len(x)] += x
    return norm(o, 0.4)
def gavel(): return norm(thump(120, 0.3) + 0.5 * clank(), 0.6)
def rumbleL(d=2.5): t = t_(d); return norm(lp(noise(d), 120) * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.8), 0.5)
def wind(d=3.0): t = t_(d); return norm(bp(noise(d), 300, 1200) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.4 * t)) * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.8), 0.25)
def plane(d=2.5): t = t_(d); ph = 2 * np.pi * np.cumsum(90 + 20 * np.sin(t * 2)) / SR; return norm((lp(sg.sawtooth(ph), 700) * 0.5 + bp(noise(d), 400, 2500) * 0.5) * np.sin(np.pi * t / d), 0.3)
def heartbeat(): o = np.zeros(int(0.9 * SR)); [o.__setitem__(slice(int(s * SR), int(s * SR) + len(thump(50, 0.25))), o[int(s * SR):int(s * SR) + len(thump(50, 0.25))] + thump(50, 0.25)) for s in (0, 0.22)]; return norm(o, 0.5)
def gasp(): d = 0.5; t = t_(d); return norm(bp(noise(d), 600, 3000) * np.sin(np.pi * t / d) ** 2, 0.25)
def bell(): d = 1.6; t = t_(d); return norm(sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) / (i + 1) for i, (f, k) in enumerate([(880, 2), (1760, 3), (2637, 4), (3520, 6)])), 0.35)
def drumroll(d=1.2): t = t_(d); return norm(bp(noise(d), 200, 3000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 18 * t))) * np.minimum(1, t / d * 1.5), 0.35)
def cymbal(): d = 1.2; t = t_(d); return norm(hp(noise(d), 5000) * np.exp(-t * 3), 0.35)
SFX.update({'fizz': fizz, 'murmur': lambda: crowd(2.5, 0), 'crowdcheer': lambda: crowd(2.0, 1), 'crowdboo': lambda: crowd(2.2, -1), 'boing': boing, 'slideup': lambda: slide(True), 'slidedown': lambda: slide(False),
            'clank': clank, 'factory': factory, 'glassclink': glassclink, 'typewriter': typewriter, 'gavel': gavel, 'rumble2': rumbleL, 'wind': wind, 'plane': plane, 'heartbeat': heartbeat, 'gasp': gasp, 'bell': bell, 'drumroll': drumroll, 'cymbal': cymbal})
def _read(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(float) / 32768
def _write(path, x):
    w = wave.open(path, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
def stems(mixfile):
    D = os.path.dirname(os.path.abspath(mixfile)); CU = json.load(open(f'{D}/cues.json')); N = int(round(CU['T'] * SR))
    fx = np.zeros(N); vo = np.zeros(N)
    for c in CU['sfx']:
        name, t, g = c[0], c[1], (c[2] if len(c) > 2 else 1.0)
        if name not in SFX: print('unknown sfx', name); continue
        x = SFX[name]() * g; s = int(t * SR)
        if 0 <= s < N: fx[s:s + len(x)] += x[: N - s]
    for vid, t in CU['vo']:
        a = _read(f'{D}/vo/{vid}.mp3'); s = int(round(t * SR))
        if s < 0: a = a[-s:]; s = 0
        vo[s:s + len(a)] += a[: N - s]
    _write(f'{D}/vo.wav', vo); _write(f'{D}/fx.wav', fx * 0.3); print('stems ok', CU['T'], 's', len(CU['sfx']), 'sfx')
