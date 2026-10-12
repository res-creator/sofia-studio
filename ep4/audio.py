# Episode 4 mix (copy of ep2/audio.py + airport sfx): voice lines that are not delivered yet are skipped.
import json, subprocess, os, numpy as np, scipy.signal as sg
D = os.path.dirname(os.path.abspath(__file__))
SR = 44100
TL = json.load(open(f'{D}/timeline.json'))
SFX = json.load(open(f'{D}/sfx.json'))
T = TL['T'] + 1.0
N = int(T * SR)
rng = np.random.default_rng(7)

def t_(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.005, r=0.1):
    e = np.ones(n); na = max(1, min(n // 2, int(a * SR))); nr = max(1, min(n // 2, int(r * SR))); e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def bp(x, lo, hi, o=2): b, a = sg.butter(o, [lo / (SR / 2), min(hi / (SR / 2), 0.99)], 'band'); return sg.lfilter(b, a, x)
def lp(x, f, o=2): b, a = sg.butter(o, f / (SR / 2), 'low'); return sg.lfilter(b, a, x)
def hp(x, f, o=2): b, a = sg.butter(o, f / (SR / 2), 'high'); return sg.lfilter(b, a, x)
def sweep(f0, f1, d, kind='sin'):
    t = t_(d); f = np.geomspace(f0, f1, len(t)); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) if kind == 'sin' else sg.sawtooth(ph)
def noise(d): return rng.standard_normal(int(d * SR))
def norm(x, p=0.8): m = np.max(np.abs(x)) + 1e-9; return x / m * p

def honk(d=0.5, f=330, drop=0.75):
    t = t_(d); fr = f * (1 + 0.04 * np.sin(2 * np.pi * 9 * t)) * np.linspace(1, drop, len(t))
    ph = 2 * np.pi * np.cumsum(fr) / SR; x = sg.sawtooth(ph) + 0.4 * sg.sawtooth(ph * 2.01)
    x = bp(x, 500, 2600) + 0.3 * bp(x, 900, 1300, 4)
    return norm(x * env(len(t), 0.02, 0.12), 0.9)
def boing(): t = t_(0.6); f = 180 + 220 * np.exp(-t * 6) * (1 + 0.5 * np.sin(2 * np.pi * 14 * t)); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4), 0.7)
def pop(): return norm(sweep(500, 1400, 0.09) * env(int(0.09 * SR), 0.002, 0.05), 0.6)
def whoosh(d=0.45, up=True):
    x = noise(d); out = np.zeros_like(x); n = len(x); seg = 512
    for i in range(0, n, seg):
        u = i / n; fc = (300 + 3500 * (u if up else 1 - u)); out[i:i + seg] = bp(x[i:i + seg + 2048], fc * 0.6, fc * 1.4)[:len(out[i:i + seg])]
    return norm(out * np.sin(np.linspace(0, np.pi, n)) ** 1.5, 0.55)
def thump(f=70, d=0.35): t = t_(d); return norm(np.sin(2 * np.pi * np.cumsum(f * np.exp(-t * 8) + 40) / SR) * np.exp(-t * 9) + 0.3 * lp(noise(d), 400) * np.exp(-t * 30), 0.9)
def slam(): return norm(thump(60, 0.6) + 0.4 * hp(noise(0.6), 2000) * np.exp(-t_(0.6) * 12), 0.95)
def chime(notes=(1046, 1568), d=0.35, gap=0.08):
    out = np.zeros(int((d + gap * len(notes)) * SR))
    for i, f in enumerate(notes):
        t = t_(d); x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.0 * t)) * np.exp(-t * 7); s = int(i * gap * SR); out[s:s + len(x)] += x
    return norm(out, 0.5)
def ding(): return chime((1318, 1760), 0.5, 0.0)
def slide(f0, f1, d=0.6): return norm(sweep(f0, f1, d) * env(int(d * SR), 0.02, 0.1) * (1 + 0.3 * np.sin(2 * np.pi * 7 * t_(d))), 0.5)
def tweet():
    out = np.zeros(int(1.0 * SR))
    for i in range(4):
        x = sweep(2500, 4200, 0.07) * env(int(0.07 * SR), 0.005, 0.03); s = int((0.1 + i * 0.2) * SR); out[s:s + len(x)] += x
    return norm(out, 0.35)
def squelch(d=0.35): t = t_(d); return norm(bp(noise(d), 200, 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 18 * t)) * env(len(t), 0.01, 0.1), 0.5)
def shudder(): t = t_(0.6); return norm(sg.sawtooth(2 * np.pi * 90 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 22 * t)) * env(len(t), 0.02, 0.2), 0.4) * 0.6
def hiss(d=1.6): return norm(hp(noise(d), 3000) * env(int(d * SR), 0.1, 0.3), 0.25)
def sputter():
    out = np.zeros(int(1.0 * SR))
    for i, s in enumerate([0, 0.18, 0.3, 0.55]): x = hp(noise(0.08), 1500) * np.exp(-t_(0.08) * 30); k = int(s * SR); out[k:k + len(x)] += x
    return norm(out, 0.4)
def pour(d=1.4): return norm(bp(noise(d), 800, 3000) * (0.6 + 0.4 * np.sin(2 * np.pi * 13 * t_(d))) * env(int(d * SR), 0.1, 0.3), 0.35)
def jingle(): return chime((523, 659, 784, 1046), 0.3, 0.09)
def correct(): return chime((784, 1046, 1568), 0.45, 0.1)
def sadhonk(): return honk(0.9, 260, 0.45) * 0.8
def tornado(d=1.6): x = whoosh(d, True) + whoosh(d, False); return norm(x * (0.6 + 0.4 * np.sin(2 * np.pi * 6 * t_(d)[:len(x)])), 0.5)
def poof(): return norm(lp(noise(0.35), 1800) * np.exp(-t_(0.35) * 10), 0.6)
def record(): t = t_(0.45); f = 900 * np.exp(-t * 4) + 120; return norm(hp(noise(0.45), 600) * 0.4 + sg.sawtooth(2 * np.pi * np.cumsum(f) / SR) * 0.6 * np.exp(-t * 3), 0.6)
def sparkle():
    out = np.zeros(int(0.8 * SR))
    for i in range(7): f = 2000 + rng.random() * 3000; x = np.sin(2 * np.pi * f * t_(0.15)) * np.exp(-t_(0.15) * 25); s = int(i * 0.08 * SR); out[s:s + len(x)] += x
    return norm(out, 0.3)
def click(): return norm(hp(noise(0.02), 2000) * np.exp(-t_(0.02) * 200), 0.5)
def tick(): return norm(bp(noise(0.03), 2500, 6000) * np.exp(-t_(0.03) * 150), 0.4)
def spring(): return boing() * 0.9
def knock(f=220): t = t_(0.25); return norm(np.sin(2 * np.pi * f * t) * np.exp(-t * 25) + 0.4 * bp(noise(0.25), 800, 2000) * np.exp(-t * 40), 0.7)
def slurp(d=1.0): t = t_(d); return norm(bp(noise(d), 300, 1500) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 11 * t))) * env(len(t), 0.05, 0.1), 0.45)
def steps(n=6, gap=0.13): out = np.zeros(int((n * gap + 0.2) * SR)); [out.__setitem__(slice(int(i * gap * SR), int(i * gap * SR) + int(0.06 * SR)), out[int(i * gap * SR):int(i * gap * SR) + int(0.06 * SR)] + knock(160)[:int(0.06 * SR)]) for i in range(n)]; return norm(out, 0.4)
def creak(): t = t_(0.7); f = 180 + 60 * np.sin(2 * np.pi * 3 * t); return norm(bp(sg.sawtooth(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * 37 * t)), 300, 1800) * env(len(t), 0.05, 0.2), 0.3)
def ahem(): return honk(0.3, 210, 0.9) * 0.4
def fridge(): x = np.concatenate([knock(300)[:int(0.08 * SR)], lp(noise(0.5), 300) * 0.3 * np.exp(-t_(0.5) * 3)]); return norm(x, 0.6)
def waddle(): out = np.zeros(int(1.6 * SR)); [out.__setitem__(slice(int(i * 0.32 * SR), int(i * 0.32 * SR) + int(0.07 * SR)), squelch(0.07)[:int(0.07 * SR)]) for i in range(5)]; return norm(out, 0.35)


def beep(): t = t_(0.9); g = (np.sin(2 * np.pi * 8 * t) > 0).astype(float); return norm(np.sin(2 * np.pi * 1500 * t) * g * env(len(t), 0.005, 0.05), 0.55)
def chomp(): x = np.concatenate([bp(noise(0.12), 200, 1200) * np.exp(-t_(0.12) * 25), np.zeros(int(0.05 * SR)), bp(noise(0.12), 200, 1200) * np.exp(-t_(0.12) * 25)]); return norm(x, 0.7)
def dingdong(): a = chime((988,), 0.7, 0)[:int(0.7 * SR)]; b = chime((784,), 0.9, 0); out = np.zeros(int(1.6 * SR)); out[:len(a)] += a; s = int(0.55 * SR); out[s:s + len(b)] += b; return norm(out, 0.55)
def rumble(d=2.8): t = t_(d); x = lp(noise(d), 220, 3) * (0.5 + 0.5 * np.sin(2 * np.pi * 5 * t)) + 0.4 * hp(noise(d), 1500) * np.linspace(0, 1, len(t)); return norm(x * env(len(t), 0.4, 0.8), 0.6)
def wheels(d=1.4): t = t_(d); return norm(bp(noise(d), 120, 700) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 9 * t))) * env(len(t), 0.1, 0.3), 0.35)
def beltsfx(d=2.4): t = t_(d); return norm(lp(noise(d), 500, 2) * (0.7 + 0.3 * np.sin(2 * np.pi * 12 * t)) * env(len(t), 0.2, 0.4), 0.3)

def cardswipe(): t = t_(0.35); return norm(bp(noise(0.35), 1500, 6000) * np.exp(-t * 7) * (0.5 + 0.5 * np.sin(2 * np.pi * 30 * t)), 0.5)
def bell(): t = t_(1.2); return norm((np.sin(2*np.pi*2093*t) + 0.5*np.sin(2*np.pi*4186*t) + 0.2*np.sin(2*np.pi*3140*t)) * np.exp(-t*4), 0.5)
def fan(d=2.6): t = t_(d); return norm(lp(noise(d), 700, 2) * (0.6 + 0.4 * np.sin(2*np.pi*14*t)) * env(len(t), 0.2, 0.5), 0.45)
def ac(): t = t_(1.0); return norm(lp(noise(1.0), 900, 2) * np.exp(-t*1.5) + 0.3*np.sin(2*np.pi*1200*t)*np.exp(-t*8), 0.4)
def revolve(d=3.0): t = t_(d); return norm(bp(noise(d), 200, 900) * (0.5 + 0.5 * np.sin(2*np.pi*2.2*t)) * env(len(t), 0.2, 0.4), 0.4)
def gulp(): t = t_(0.35); f = 300*np.exp(-t*6)+80; return norm(np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*8), 0.6)
LIB = {'cardswipe': cardswipe, 'bell': bell, 'fan': fan, 'ac': ac, 'revolve': revolve, 'gulp': gulp, 'honk': lambda: honk(0.55), 'boing': boing, 'pop': pop, 'whoosh': whoosh, 'slam': slam, 'fridge': fridge, 'waddle': waddle, 'tick': tick,
       'card': lambda: chime((880, 1318), 0.4, 0.07), 'ding': ding, 'slip': lambda: slide(400, 1600, 0.5), 'thud': thump, 'tweet': tweet,
       'squeeze': squelch, 'shudder': shudder, 'slide': lambda: slide(1400, 500, 0.45), 'shower': hiss, 'sputter': sputter, 'pour': pour,
       'quizjingle': jingle, 'correct': correct, 'sadhonk': sadhonk, 'tornado': tornado, 'poof': poof, 'record': record, 'sparkle': sparkle,
       'click': click, 'spring': spring, 'thunk': lambda: knock(140), 'bonk': lambda: knock(300), 'slurp': slurp, 'scratch': record, 'run': steps,
       'door': creak, 'ahem': ahem, 'doorclose': thump,
       'beep': beep, 'chomp': chomp, 'dingdong': dingdong, 'rumble': rumble, 'wheels': wheels, 'belt': beltsfx}
GAIN = {'honk': 0.55, 'whoosh': 0.5, 'card': 0.45, 'ding': 0.45, 'pop': 0.4, 'tick': 0.5, 'shower': 0.6, 'tornado': 0.6}

def load(f):
    a = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']); return np.frombuffer(a, np.float32).copy()

voice = np.zeros(N); fx = np.zeros(N)
def add(buf, x, t, g=1.0):
    s = int(t * SR); e = min(N, s + len(x));
    if s < 0 or s >= N: return
    buf[s:e] += x[:e - s] * g
for L in TL["lines"]:
    if not os.path.exists(f"{D}/vo/{L['id']}.mp3"): continue
    x = load(f"{D}/vo/{L['id']}.mp3")
    if L['who'] == 'announcer': x = norm(bp(x, 450, 3800, 2) * 2.2, 0.8)  # loudspeaker
    add(voice, x, L['t0'], 1.0 if L['who'] == 'sofia' else 1.05)
for e in SFX:
    add(fx, LIB[e['name']](), e['t'], GAIN.get(e['name'], 0.6) * e.get('g', 1))

# ---------- music: ukulele-ish plucks + bass + shaker, 112 bpm, C G Am F
BPM = 112; beat = 60 / BPM
def pluck(f, d=0.6):
    n = int(SR / f); buf = rng.uniform(-1, 1, n); out = np.zeros(int(d * SR))
    for i in range(len(out)): out[i] = buf[i % n]; buf[i % n] = 0.5 * (buf[i % n] + buf[(i + 1) % n]) * 0.996
    return out * env(len(out), 0.002, 0.15)
CH = {'C': [261.6, 329.6, 392.0, 523.3], 'G': [196.0, 293.7, 392.0, 493.9], 'Am': [220.0, 261.6, 329.6, 440.0], 'F': [174.6, 261.6, 349.2, 440.0]}
BASS = {'C': 65.4, 'G': 49.0, 'Am': 55.0, 'F': 43.7}
cache = {}
def pl(f, d):
    k = (round(f, 1), d)
    if k not in cache: cache[k] = pluck(f, d)
    return cache[k]
bar = 4 * beat; prog = ['C', 'G', 'Am', 'F']
loop = np.zeros(int(bar * 4 * SR) + SR)
pattern = [0, 0.75, 1.5, 2, 2.75, 3.5]  # strum positions in beats
for bi, ch in enumerate(prog):
    for p in pattern:
        for j, f in enumerate(CH[ch]):
            x = pl(f, 0.5) * (0.22 if p in (0, 2) else 0.14); s = int((bi * bar + p * beat + j * 0.012) * SR); loop[s:s + len(x)] += x
    for p in (0, 1.5, 2, 3):
        t = t_(0.4); x = np.sin(2 * np.pi * BASS[ch] * t) * np.exp(-t * 5) * 0.5; s = int((bi * bar + p * beat) * SR); loop[s:s + len(x)] += x
    for k in range(8):
        x = hp(noise(0.05), 6000) * np.exp(-t_(0.05) * 60) * (0.07 if k % 2 else 0.04); s = int((bi * bar + k * beat / 2) * SR); loop[s:s + len(x)] += x
    for p in (1, 3):
        x = (bp(noise(0.12), 900, 4000) * np.exp(-t_(0.12) * 30)) * 0.12; s = int((bi * bar + p * beat) * SR); loop[s:s + len(x)] += x
L4 = int(bar * 4 * SR); loop = loop[:L4]
music = np.tile(loop, int(N / L4) + 2)[:N]
# music: stops on the title slam, comes back with check-in; off for the end-screen tail fade
sc = {s['id']: s for s in TL['scenes']}
gate = np.ones(N)
def ramp(t0, t1, v0, v1):
    a, b = int(t0 * SR), int(t1 * SR); gate[a:b] = np.linspace(v0, v1, max(1, b - a))
ts = sc['title']['t0']; ct = sc['reception']['t0']
gate[int(ts * SR):int(ct * SR)] = 0.0; ramp(ts + 0.6, ct, 0.0, 0.7); ramp(ct, ct + 0.5, 0.7, 1)
# ducking under voice
venv = np.abs(voice); k = int(0.25 * SR); venv = np.convolve(venv, np.ones(k) / k, 'same'); duck = 1 - 0.68 * np.clip(venv * 8, 0, 1)
music = music * gate * duck * 0.42


# ---------- ambience beds per scene (quiet, ducked under voice): hall murmur, engine hum, room tone
def _n(d): return int(d * SR)
def murmur(d, lo=250, hi=1300):
    n = _n(d); tt = np.arange(n) / SR
    x = bp(rng.standard_normal(n), lo, hi) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * tt + 1.0) * np.sin(2 * np.pi * 0.11 * tt))
    return x / (np.max(np.abs(x)) + 1e-9)
def engine(d):
    n = _n(d); tt = np.arange(n) / SR
    x = lp(rng.standard_normal(n), 260, 3) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.35 * tt)) + 0.5 * np.sin(2 * np.pi * 96 * tt) + 0.25 * np.sin(2 * np.pi * 192 * tt)
    return x / (np.max(np.abs(x)) + 1e-9)
def roomtone(d): x = lp(rng.standard_normal(_n(d)), 400, 2); return x / (np.max(np.abs(x)) + 1e-9)
AMB = {'door': (murmur, 0.030), 'reception': (murmur, 0.030), 'lift': (engine, 0.030), 'room': (roomtone, 0.012), 'breakfast': (murmur, 0.040), 'checkout': (murmur, 0.030)}
amb = np.zeros(N)
for sc_ in TL['scenes']:
    if sc_['id'] not in AMB: continue
    fn, g = AMB[sc_['id']]; a = int(sc_['t0'] * SR); b = min(N, int(sc_['t1'] * SR)); d = (b - a) / SR
    seg = fn(d + 0.01)[:b - a] * g; f = min(len(seg) // 2, int(0.5 * SR)); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    amb[a:b] += seg
amb = amb * (1 - 0.6 * np.clip(np.convolve(np.abs(voice), np.ones(int(0.25 * SR)) / int(0.25 * SR), 'same') * 8, 0, 1))

mix = voice * 1.0 + fx * 0.8 + music + amb
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.95
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-ac', '2', f'{D}/mix.wav'], stdin=subprocess.PIPE)
p.communicate(pcm.tobytes())
print('mix done', round(T, 1), 's')
