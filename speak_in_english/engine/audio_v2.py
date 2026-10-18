"""python3 audio_v2.py gym|lift -> eps/<ep>/mix_raw.wav"""
import json, sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR = 48000; rng = np.random.default_rng(7)
EPN = sys.argv[1]; TL = json.load(open(f"eps/{EPN}/timeline.json")); DUR = TL["dur"]; N = int(DUR * SR) + SR
def T(d): return np.arange(int(d * SR)) / SR
def env_ad(n, a, d):
    t = np.arange(n) / SR
    e = np.minimum(t / max(a, 1e-4), 1) * np.exp(-np.maximum(t - a, 0) / d)
    return e
def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, hi], btype="band", fs=SR, output="sos"), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, btype="low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, btype="high", fs=SR, output="sos"), x)
def chirp(f0, f1, d, curve=1.0):
    t = T(d); f = f0 + (f1 - f0) * (t / d) ** curve
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def norm(x, p=0.9): return x / (np.abs(x).max() + 1e-9) * p

# ---------------- SFX
def whoosh(d=0.5):
    n = int(d * SR); x = rng.standard_normal(n); out = np.zeros(n)
    # time-varying bandpass via blocks
    blk = 512
    for i in range(0, n, blk):
        p = i / n; fc = 300 + 3500 * np.sin(np.pi * p) ** 1.5
        seg = rng.standard_normal(blk + 256)
        out[i:i+blk] = bp(seg, fc * 0.6, min(fc * 1.6, 20000))[256:256+len(out[i:i+blk])]
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return norm(out * e, 0.8)
def impact(soft=False):
    d = 0.9; t = T(d)
    body = np.sin(2*np.pi*np.cumsum(40 + 110*np.exp(-t*18))/SR) * np.exp(-t*(6 if not soft else 9))
    nz = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t*35)
    x = body * 1.0 + nz * (0.5 if not soft else 0.2)
    return norm(np.tanh(x * 2), 0.95 if not soft else 0.6)
def pop():
    t = T(0.09); x = np.sin(2*np.pi*np.cumsum(1100*np.exp(-t*30)+280)/SR) * np.exp(-t*45)
    return norm(x, 0.7)
def stamp():
    t = T(0.35); x = np.sin(2*np.pi*np.cumsum(70+160*np.exp(-t*40))/SR)*np.exp(-t*14)
    x += lp(rng.standard_normal(len(t)), 4000)*np.exp(-t*60)*0.8
    return norm(np.tanh(2*x), 0.9)
def sparkle():
    d = 1.0; x = np.zeros(int(d*SR))
    for k in range(9):
        f = rng.uniform(2200, 5200); st = int(k * 0.07 * SR); t = T(0.45)
        s = (np.sin(2*np.pi*f*t) + 0.3*np.sin(2*np.pi*2.01*f*t)) * np.exp(-t*9)
        x[st:st+len(s)] += s[:len(x)-st] * (1 - k/12)
    return norm(x, 0.5)
def blink():
    t = T(0.3); x = np.sin(2*np.pi*np.cumsum(420*np.exp(-t*4)+120)/SR) * np.sin(np.pi*t/0.3)
    return norm(x, 0.7)
def brow():
    t = T(0.45); f = 180 + 420*(t/0.45) + 25*np.sin(2*np.pi*16*t)
    x = np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*3.5) * np.minimum(t*80, 1)
    return norm(x, 0.7)
def buzz():
    t = T(0.42); x = np.sign(np.sin(2*np.pi*140*t)) * 0.6 + np.sign(np.sin(2*np.pi*147*t)) * 0.4
    x = lp(x, 1800) * np.minimum(t*200, 1) * np.minimum((0.42-t)*40, 1)
    return norm(x, 0.55)
def ding():
    t = T(1.2); x = sum(a*np.sin(2*np.pi*f*t)*np.exp(-t*r) for f, a, r in [(1318.5,1,3),(1975.5,.5,4),(2637,.25,6),(3951,.12,8)])
    x2 = np.zeros_like(x); off = int(0.09*SR)
    x2[off:] = sum(a*np.sin(2*np.pi*f*t)*np.exp(-t*r) for f, a, r in [(1760,1,3),(2637,.5,4)])[:len(x)-off]
    return norm(x + x2 * 0.8, 0.55)
def marker():
    d = 0.55; n = int(d*SR); x = bp(rng.standard_normal(n), 2500, 6000)
    am = (np.sin(2*np.pi*9*T(d)) > -0.2).astype(float)
    return norm(x * lp(am, 60) * np.sin(np.pi*np.linspace(0, 1, n)), 0.35)
def cricket():
    d = 2.5; t = T(d); x = np.zeros(len(t))
    for c0 in np.arange(0.05, d - 0.3, 0.62):
        for k in range(3):
            st = int((c0 + k*0.055)*SR); tt = T(0.035)
            s = np.sin(2*np.pi*4600*tt)*np.sin(np.pi*tt/0.035)
            x[st:st+len(s)] += s
    return norm(x, 0.35)
def tick():
    t = T(0.05); x = hp(rng.standard_normal(len(t)), 2000) * np.exp(-t*220) + np.sin(2*np.pi*2400*t)*np.exp(-t*160)
    return norm(x, 0.6)
def deflate():  # sad trombone
    out = []
    for f, d, vib in [(311, 0.32, 0), (294, 0.32, 0), (277, 0.32, 0), (262, 1.1, 1)]:
        t = T(d); ff = f * (1 + 0.012*vib*np.sin(2*np.pi*5.5*t)) * (1 - 0.03*vib*t)
        ph = 2*np.pi*np.cumsum(ff)/SR
        s = sum(np.sin(k*ph)/k for k in range(1, 9))
        s = lp(s, 1600) * (0.6 + 0.4*np.exp(-t*3)) * np.minimum(t*40, 1) * np.minimum((d-t)*12, 1)
        out.append(s)
    return norm(np.concatenate(out), 0.6)
def riser_short():
    d = 0.4; n = int(d*SR); t = T(d)
    x = hp(rng.standard_normal(n), 1500) * (t/d)**2
    return norm(x, 0.5)

def scurry():
    d = 0.7; x = np.zeros(int(d*SR))
    for k in range(14):
        st = int(k*0.045*SR); t = T(0.03); s_ = hp(rng.standard_normal(len(t)), 3000)*np.exp(-t*150)
        x[st:st+len(s_)] += s_ * (0.6 + 0.4*np.sin(k))
    t = T(d); x += np.sin(2*np.pi*np.cumsum(900+500*np.sin(2*np.pi*14*t))/SR) * 0.15 * np.exp(-t*2)
    return norm(x, 0.6)
def rev():
    d = 1.3; t = T(d); f = 45 + 90*np.clip(t/0.5, 0, 1)**0.7 * (1 - 0.3*np.clip((t-0.7)/0.6, 0, 1))
    ph = 2*np.pi*np.cumsum(f)/SR
    x = sum(np.sin(k*ph)/k for k in range(1, 12)) + 0.3*lp(rng.standard_normal(len(t)), 600)
    x = lp(x, 1800) * np.minimum(t*20, 1) * np.minimum((d-t)*4, 1)
    return norm(np.tanh(x*1.5), 0.7)
def coo():
    x = np.zeros(int(2.4*SR))
    for c0 in [0.1, 0.9, 1.5]:
        t = T(0.45); f = 420 + 60*np.sin(2*np.pi*3*t)
        s_ = np.sin(2*np.pi*np.cumsum(f)/SR) * np.sin(np.pi*t/0.45)**2 * (1 + 0.5*np.sin(2*np.pi*30*t))
        i = int(c0*SR); x[i:i+len(s_)] += s_
    return norm(lp(x, 1200), 0.45)
def paper():
    d = 0.9; t = T(d); x = bp(rng.standard_normal(len(t)), 1500, 8000)
    am = np.abs(lp(rng.standard_normal(len(t)), 25)); am /= am.max()
    return norm(x * am * np.exp(-t*2.5), 0.5)


def put(buf, x, t, g=1.0):
    i = int(t * SR)
    if i < 0: x = x[-i:]; i = 0
    j = min(len(buf), i + len(x))
    if i < len(buf) and j > i: buf[i:j] += x[:j-i] * g
def clank():
    x = np.zeros(int(1.2*SR))
    for k, f0 in enumerate([523, 811, 1247]):
        t = T(1.0); s = sum(np.sin(2*np.pi*f0*m*t)*np.exp(-t*(4+m*3))/m for m in [1, 2.76, 5.4]); put(x, s, k*0.11, 1 - k*0.2)
    t = T(0.08); put(x, hp(rng.standard_normal(len(t)), 2000)*np.exp(-t*60), 0, 0.8)
    return norm(x, 0.7)
def scratch():
    d = 0.55; t = T(d); f = 900 * np.abs(np.sin(2*np.pi*3.5*t)) + 150
    x = bp(rng.standard_normal(len(t)), 300, 4000) * (0.5 + 0.5*np.sin(2*np.pi*np.cumsum(f)/SR))
    return norm(x * np.minimum(1, (d - t)*8), 0.75)
def drop():
    t = T(0.9); x = np.sin(2*np.pi*np.cumsum(45 + 80*np.exp(-t*25))/SR)*np.exp(-t*7) + 0.4*lp(rng.standard_normal(len(t)), 900)*np.exp(-t*18)
    y = np.zeros(int(1.4*SR)); put(y, x, 0); put(y, x*0.35, 0.28); put(y, x*0.12, 0.45)
    return norm(np.tanh(2*y), 0.9)
def bell():
    t = T(1.4); x = sum(a*np.sin(2*np.pi*f*t) for f, a in [(880, 1), (2210, .4), (3520, .2)]) * (0.6 + 0.4*np.sign(np.sin(2*np.pi*22*t)))
    return norm(x * np.exp(-t*1.8) * np.minimum(t*80, 1), 0.45)
def lift_ding():
    t = T(1.6); x = (np.sin(2*np.pi*1046.5*t) + .35*np.sin(2*np.pi*2093*t))*np.exp(-t*2.2)
    y = np.zeros(int(1.9*SR)); put(y, x, 0); t2 = T(1.4); put(y, (np.sin(2*np.pi*830.6*t2) + .35*np.sin(2*np.pi*1661*t2))*np.exp(-t2*2.2), 0.28)
    return norm(y, 0.5)
def doors():
    d = 0.75; t = T(d); x = lp(rng.standard_normal(len(t)), 700) * np.sin(np.pi*t/d) + 0.2*np.sin(2*np.pi*np.cumsum(90 + 30*t)/SR)*np.sin(np.pi*t/d)
    y = np.zeros(int(0.9*SR)); put(y, x, 0); tt = T(0.08); put(y, np.sin(2*np.pi*120*tt)*np.exp(-tt*40), d - 0.05, 0.7)
    return norm(y, 0.45)
def hum():
    d = 2.6; t = T(d); x = (np.sin(2*np.pi*60*t) + .5*np.sin(2*np.pi*120*t) + .2*np.sin(2*np.pi*180*t)) * np.minimum(1, t*4) * np.minimum(1, (d - t)*4)
    return norm(x, 0.25)
def plop():
    d = 0.35; t = T(d); f = 140 + 520 * (1 - np.exp(-t * 30))
    x = np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t * 16) + 0.5 * lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 40)
    return norm(np.tanh(1.6 * x), 0.8)
def thud():
    y = np.zeros(int(1.4*SR)); put(y, impact(), 0, 1.0)
    for k in range(7):
        t = T(0.4); f = rng.uniform(1800, 4200); put(y, np.sin(2*np.pi*f*t)*np.exp(-t*14)*0.35, 0.05 + k*0.045 + rng.uniform(0, 0.02))
    return norm(y, 0.9)
def gulp():
    t = T(0.22); f = 320 * np.exp(-t * 9) + 90
    x = np.sin(2*np.pi*np.cumsum(f)/SR) * np.sin(np.pi * t / 0.22) ** 0.6
    y = np.zeros(int(0.4*SR)); put(y, x, 0); put(y, x * 0.6, 0.16)
    return norm(lp(y, 1500), 0.75)
def boing():
    d = 0.6; t = T(d); f = 160 + 260 * (t / d) + 90 * np.sin(2*np.pi*14*t) * np.exp(-t * 4)
    x = np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t * 4.5) * np.minimum(t * 200, 1)
    return norm(x, 0.65)
def nope():
    y = np.zeros(int(0.6*SR))
    for k, f0 in enumerate([420, 300]):
        t = T(0.16); f = f0 * (1 + 0.04*np.sin(2*np.pi*22*t)); s_ = np.sin(2*np.pi*np.cumsum(f)/SR) + 0.3*np.sin(4*np.pi*np.cumsum(f)/SR)
        put(y, s_ * np.sin(np.pi*t/0.16), k * 0.2)
    return norm(lp(y, 2500), 0.6)
def cuckoo():
    y = np.zeros(int(0.9*SR))
    for k, f0 in enumerate([659.3, 523.3]):
        t = T(0.26); s_ = np.sin(2*np.pi*f0*t) + 0.15*np.sin(4*np.pi*f0*t) + 0.12*bp(rng.standard_normal(len(t)), f0*0.8, f0*1.4)
        put(y, s_ * np.sin(np.pi*t/0.26) ** 0.8, k * 0.32)
    return norm(y, 0.6)
def snip1():
    t = T(0.12); x = hp(rng.standard_normal(len(t)), 3500) * np.exp(-t * 60) + 0.5 * np.sin(2*np.pi*3200*t) * np.exp(-t * 80)
    y = np.zeros(int(0.2*SR)); put(y, x, 0); put(y, x * 0.6, 0.035)
    return norm(y, 0.8)
def snips():
    y = np.zeros(int(1.9*SR)); s1 = snip1()
    for k in range(13): put(y, s1 * rng.uniform(0.6, 1.0), k * 0.13 + rng.uniform(0, 0.03))
    return norm(y, 0.8)
def clipper():
    d = 1.8; t = T(d); x = np.sign(np.sin(2*np.pi*120*t)) * 0.5 + 0.5*np.sin(2*np.pi*240*t) + 0.25*hp(rng.standard_normal(len(t)), 3000)
    am = 1 + 0.25*np.sin(2*np.pi*7*t); x = bp(x, 150, 5000) * am * np.minimum(t*20, 1) * np.minimum((d - t)*8, 1)
    return norm(x, 0.55)
def hairdryer():
    d = 1.0; t = T(d); x = bp(rng.standard_normal(len(t)), 600, 5000) + 0.3*np.sin(2*np.pi*np.cumsum(300 + 80*t)/SR)
    return norm(x * np.sin(np.pi*t/d) ** 0.7, 0.45)
def spin():
    d = 0.45; t = T(d); x = bp(rng.standard_normal(len(t)), 800, 6000) * np.sin(np.pi*t/d) ** 2 * (1 + 0.6*np.sin(2*np.pi*18*t))
    return norm(x, 0.55)
def register():
    y = np.zeros(int(1.3*SR)); t = T(0.08); put(y, hp(rng.standard_normal(len(t)), 2000)*np.exp(-t*50), 0, 0.6)
    t2 = T(0.3); put(y, lp(rng.standard_normal(len(t2)), 1500)*np.exp(-t2*12), 0.06, 0.5)
    t3 = T(1.1); put(y, sum(a*np.sin(2*np.pi*f*t3)*np.exp(-t3*r) for f, a, r in [(2093, 1, 3), (3136, .6, 4), (4186, .3, 5)]), 0.18, 0.8)
    return norm(y, 0.6)
def knock():
    t = T(0.16); x = np.sin(2*np.pi*np.cumsum(170 + 90*np.exp(-t*60))/SR)*np.exp(-t*38) + 0.6*lp(rng.standard_normal(len(t)), 1800)*np.exp(-t*70)
    return norm(np.tanh(1.8*x), 0.85)
def creak():
    d = 0.9; t = T(d); f = 260 + 140*np.sin(np.pi*t/d) + 30*np.sin(2*np.pi*7*t)
    ph = 2*np.pi*np.cumsum(f)/SR; x = sum(np.sin(k*ph)/k for k in range(1, 14))
    am = 0.55 + 0.45*np.sign(np.sin(2*np.pi*np.cumsum(38 + 20*t)/SR))
    x = bp(x*am, 400, 3200) * np.sin(np.pi*t/d)**0.6
    return norm(x, 0.5)
def power_chord(root, d, mute=False):
    t = T(d); x = np.zeros(len(t))
    for m, a in [(0, 1), (7, 0.8), (12, 0.6)]:
        f = 440*2**((root + m - 69)/12)
        for det in (0.997, 1.003): ph = 2*np.pi*f*det*t; x += a*(2*((ph/(2*np.pi)) % 1) - 1)
    env = np.exp(-t*(14 if mute else 1.6)) * np.minimum(t*400, 1) * np.minimum((d - t)*60, 1)
    return lp(np.tanh(x*env*3.5), 3200)
def riff():
    y = np.zeros(int(1.6*SR))
    for k, (r, d, m) in enumerate([(40, 0.12, 1), (40, 0.12, 1), (43, 0.25, 0), (45, 0.9, 0)]):
        put(y, power_chord(r, d + 0.05, m), [0, 0.13, 0.27, 0.55][k], 0.8)
    return norm(y, 0.8)
def knob():
    y = np.zeros(int(0.9*SR))
    for k in range(9):
        t = T(0.03); put(y, hp(rng.standard_normal(len(t)), 2500)*np.exp(-t*160) + 0.4*np.sin(2*np.pi*(1800 + k*120)*t)*np.exp(-t*120), k*0.07, 0.8)
    return norm(y, 0.6)
def boom():
    y = np.zeros(int(1.6*SR)); t = T(1.4)
    put(y, np.tanh(3*np.sin(2*np.pi*np.cumsum(38 + 70*np.exp(-t*12))/SR)*np.exp(-t*2.2)), 0, 1.0)
    rat = bp(rng.standard_normal(len(t)), 900, 5000) * (0.5 + 0.5*np.sign(np.sin(2*np.pi*31*t))) * np.exp(-t*3)
    put(y, rat, 0.02, 0.35)
    return norm(y, 0.95)
def feather():
    y = np.zeros(int(2.2*SR))
    for k in range(14):
        t = T(0.05); put(y, hp(rng.standard_normal(len(t)), 6000)*np.exp(-t*90), k*0.14 + rng.uniform(0, 0.02), 0.35 + 0.2*(k % 2))
        if k % 4 == 0: t2 = T(0.12); put(y, np.sin(2*np.pi*np.cumsum(140 + 60*np.exp(-t2*40))/SR)*np.exp(-t2*30), k*0.14, 0.15)
    return norm(y, 0.35)
def clapclap():
    y = np.zeros(int(0.8*SR))
    for k in range(2):
        t = T(0.2); x = bp(rng.standard_normal(len(t)), 900, 4000); put(y, x*(np.exp(-t*30) + 0.5*np.exp(-np.maximum(t - 0.01, 0)*40)*(t > 0.01)), k*0.28, 1)
    return norm(y, 0.8)
def powerdown():
    d = 1.0; t = T(d); f = 420*np.exp(-t*2.6) + 40
    x = sum(np.sin(k*2*np.pi*np.cumsum(f)/SR)/k for k in range(1, 6))
    return norm(lp(x, 1600)*np.minimum(1, (d - t)*5)*np.minimum(t*80, 1), 0.5)
def choo():
    y = np.zeros(int(1.3*SR))
    for k, d in enumerate([0.32, 0.6]):
        t = T(d); f = 520 + 40*np.sin(2*np.pi*6*t)
        x = sum(np.sin(2*np.pi*f*m*t)/m for m in (1, 1.26, 1.5)) + 0.25*bp(rng.standard_normal(len(t)), 800, 3000)
        put(y, x * np.minimum(t*30, 1) * np.minimum((d - t)*12, 1), k*0.42, 1)
    return norm(lp(y, 3500), 0.6)
def bark():
    y = np.zeros(int(0.7*SR))
    for k in range(2):
        t = T(0.16); f = 620*np.exp(-t*6) + 300
        x = np.sign(np.sin(2*np.pi*np.cumsum(f)/SR))*0.5 + 0.5*bp(rng.standard_normal(len(t)), 600, 2500)
        put(y, lp(x, 2500)*np.sin(np.pi*t/0.16), k*0.24, 1)
    return norm(y, 0.6)
def umbrella_fx():
    y = np.zeros(int(0.9*SR)); put(y, whoosh(0.35), 0, 0.7)
    t = T(0.25); put(y, lp(rng.standard_normal(len(t)), 3000)*np.exp(-t*25) + np.sin(2*np.pi*np.cumsum(300 + 900*np.exp(-t*30))/SR)*np.exp(-t*20), 0.3, 1)
    return norm(y, 0.8)
def tada():
    y = np.zeros(int(1.8*SR))
    def brass(f, d):
        t = T(d); ph = 2*np.pi*f*t*(1 + 0.003*np.sin(2*np.pi*5*t)); x = sum(np.sin(k*ph)*(0.8**k) for k in range(1, 10))
        return lp(x, 2600) * (0.7 + 0.3*np.exp(-t*3)) * np.minimum(t*25, 1) * np.minimum((d - t)*8, 1)
    for f in (392, 494, 587): put(y, brass(f, 0.16), 0, 0.3)
    for f in (523.3, 659.3, 784): put(y, brass(f, 1.3), 0.2, 0.3)
    return norm(y, 0.7)
def gasp():
    t = T(0.42); x = bp(rng.standard_normal(len(t)), 900, 3200) * np.minimum(t*14, 1) * np.exp(-np.maximum(t - 0.12, 0)*9)
    return norm(x + 0.15*np.sin(2*np.pi*np.cumsum(420 + 260*t)/SR)*np.exp(-t*6), 0.55)
def zipfx():
    y = np.zeros(int(0.55*SR)); n = 26
    for k in range(n):
        tt = T(0.012); put(y, bp(rng.standard_normal(len(tt)), 1500 + 3500*k/n, 6000 + 3000*k/n)*np.exp(-tt*300), k*0.018, 0.9)
    return norm(y, 0.6)
def rimshot():
    y = np.zeros(int(1.6*SR))
    def tomh(f): t = T(0.3); return np.sin(2*np.pi*np.cumsum(f*(1 + 0.6*np.exp(-t*25)))/SR)*np.exp(-t*10)
    put(y, tomh(210), 0, 0.8); put(y, tomh(160), 0.17, 0.85)
    t = T(1.1); put(y, hp(rng.standard_normal(len(t)), 5000)*np.exp(-t*3.2)*0.7 + 0.5*bp(rng.standard_normal(len(t)), 300, 3000)*np.exp(-t*40), 0.36, 1)
    return norm(y, 0.8)
def squeak():
    t = T(0.14); f = 900 + 500*np.sin(np.pi*t/0.14) + 40*np.sin(2*np.pi*35*t)
    return norm(np.sin(2*np.pi*np.cumsum(f)/SR)*np.sin(np.pi*t/0.14)*(1 + 0.3*np.sin(2*np.pi*2*np.cumsum(f)/SR)), 0.4)
def dressup():
    y = np.zeros(int(3.3*SR))
    for k in range(8):
        t0 = k*0.36; tt = T(0.22); put(y, bp(rng.standard_normal(len(tt)), 700, 4000)*np.sin(np.pi*tt/0.22)**2, t0, 0.5)
        f = 440*2**(k*2/12); tp = T(0.12); put(y, np.sin(2*np.pi*np.cumsum(f*(1 + 0.8*np.exp(-tp*40)))/SR)*np.exp(-tp*25), t0 + 0.16, 0.5)
    return norm(y, 0.75)
def chime():
    y = np.zeros(int(2.2*SR))
    for k, f in enumerate([659.3, 523.3, 392.0]):
        t = T(1.4); put(y, (np.sin(2*np.pi*f*t) + 0.3*np.sin(2*np.pi*2.01*f*t)*np.exp(-t*3))*np.exp(-t*2.2)*np.minimum(t*300, 1), k*0.38, 0.5)
    return norm(y, 0.6)
SFX = dict(gasp=gasp(), zip=zipfx(), rimshot=rimshot(), squeak=squeak(), dressup=dressup(), chime=chime(), strain=creak(), coo=coo(), choo=choo(), bark=bark(), umbrella=umbrella_fx(), tada=tada(), knock=knock(), creak=creak(), riff=riff(), knob=knob(), boom=boom(), feather=feather(), clapclap=clapclap(), powerdown=powerdown(), snip=snip1(), snips=snips(), clipper=clipper(), hairdryer=hairdryer(), spin=spin(), register=register(), plop=plop(), thud=thud(), gulp=gulp(), boing=boing(), nope=nope(), cuckoo=cuckoo(), whoosh=whoosh(), impact=impact(), impact_soft=impact(True), pop=pop(), stamp=stamp(), sparkle=sparkle(), blink=blink(), brow=brow(), buzz=buzz(), ding=ding(),
           cricket=cricket(), tick=tick(), deflate=deflate(), riser_short=riser_short(), clank=clank(), scratch=scratch(), drop=drop(), bell=bell(), lift_ding=lift_ding(), doors=doors(), hum=hum())
def note(m, key=0): return 440 * 2 ** ((m + key - 69) / 12)
def pluck(f, d, bright=1.0):
    t = T(d); ph = 2*np.pi*f*t
    return (np.sin(ph) + 0.5*np.sin(2*ph)*np.exp(-t*6) + 0.25*np.sin(3*ph)*np.exp(-t*10)*bright) * np.exp(-t*5) * np.minimum(t*300, 1)
def kick():
    t = T(0.35); return np.sin(2*np.pi*np.cumsum(50+120*np.exp(-t*30))/SR)*np.exp(-t*9)
def clap():
    t = T(0.25); x = bp(rng.standard_normal(len(t)), 900, 3500); return x * (np.exp(-t*25) + 0.6*np.exp(-np.maximum(t-0.012, 0)*30)*(t > 0.012)) * 0.8
def hat(o=False):
    t = T(0.18 if o else 0.05); return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t*(25 if o else 90)) * 0.5
def epiano(f, d):
    t = T(d); ph = 2*np.pi*f*t
    return (np.sin(ph + 0.6*np.sin(ph)*np.exp(-t*3)) + 0.2*np.sin(2*ph)*np.exp(-t*4)) * np.exp(-t*1.6) * np.minimum(t*200, 1) * np.minimum((d-t)*30, 1)
music = np.zeros(N)
def kick_(): t = T(0.4); return np.tanh(2.2*np.sin(2*np.pi*np.cumsum(48 + 140*np.exp(-t*35))/SR)*np.exp(-t*8))
def snare_(): t = T(0.25); return (0.6*np.sin(2*np.pi*190*t)*np.exp(-t*30) + bp(rng.standard_normal(len(t)), 1500, 7000)*np.exp(-t*16)) * 0.9
def tom_(f): t = T(0.4); return np.sin(2*np.pi*np.cumsum(f*(1 + 0.5*np.exp(-t*20)))/SR)*np.exp(-t*7)
def saw_(f, d, det=(0.993, 1.0, 1.007)):
    t = T(d); return sum(2*((f*k*t) % 1) - 1 for k in det) / len(det)
def track_rock(d):
    y = np.zeros(int(d*SR) + SR); bpm = 140; b = 60/bpm; e = b/2
    pat = [(40, 1), (40, 1), (40, 0), (40, 1), (43, 0), (40, 1), (45, 0), (43, 1)]
    for k in range(int(d/e) + 2):
        t0 = k*e; r, m = pat[k % 8]
        if (k // 16) % 2 == 1 and k % 16 >= 12: r = [47, 45, 43, 42][k % 4]; m = 0
        put(y, power_chord(r, e*(0.9 if m else 1.8), m), t0, 0.32 if m else 0.38)
        tb = T(e*0.9); put(y, lp(np.sign(np.sin(2*np.pi*440*2**((r - 12 - 69)/12)*tb))*np.exp(-tb*4), 700), t0, 0.22)
        if k % 4 == 0: put(y, kick_(), t0, 0.9)
        if k % 4 == 2: put(y, snare_(), t0, 0.7)
        if k % 8 == 7: put(y, kick_(), t0, 0.6)
        put(y, hat(k % 2 == 1), t0, 0.25)
    return y
def track_edm(d):
    y = np.zeros(int(d*SR) + SR); bpm = 126; b = 60/bpm
    prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
    for k in range(int(d/b) + 2):
        t0 = k*b; ch = prog[(k // 4) % 4]
        put(y, kick_(), t0, 0.95); put(y, hat(True), t0 + b/2, 0.3)
        if k % 2 == 1: put(y, clap(), t0, 0.5)
        tt = T(b*0.42); pump = np.minimum(1, T(b*0.42)/(b*0.2))
        for m in ch: put(y, lp(saw_(440*2**((m + 12 - 69)/12), b*0.42), 2600)*pump*np.exp(-tt*2), t0 + b*0.5, 0.11)
        tb = T(b*0.45); put(y, lp(saw_(440*2**((ch[0] - 24 - 69)/12), b*0.45), 400)*np.minimum(1, tb/0.05), t0 + b*0.5, 0.35)
        for j in range(4): put(y, pluck(440*2**((ch[j % 3] + 24 - 69)/12), 0.18, 1.3), t0 + j*b/4, 0.05)
    return y
def track_drums(d):
    y = np.zeros(int(d*SR) + SR); bpm = 150; b = 60/bpm; e = b/2
    for k in range(int(d/e) + 2):
        t0 = k*e; bar = (k // 8) % 2
        if bar == 1 and k % 8 >= 4: put(y, tom_([220, 180, 140, 110][k % 4]), t0, 0.8); put(y, tom_([220, 180, 140, 110][k % 4]), t0 + e/2, 0.6); continue
        if k % 4 == 0 or k % 8 == 3: put(y, kick_(), t0, 1.0)
        if k % 4 == 2: put(y, snare_(), t0, 0.85)
        put(y, hat(False), t0, 0.35); put(y, hat(False), t0 + e/2, 0.15)
        if k % 16 == 0: put(y, hat(True), t0, 0.5)
    return y
def track_waltz(d):
    y = np.zeros(int(d*SR) + SR); bpm = 168; b = 60/bpm
    def accord(f, dd):
        t = T(dd); ph = 2*np.pi*f*(1 + 0.004*np.sin(2*np.pi*5.5*t))*t
        x = sum(np.sin(k*ph)/k**1.3 for k in range(1, 7)) + 0.6*sum(np.sin(k*ph*1.004)/k**1.3 for k in range(1, 7))
        return lp(x, 2600) * np.minimum(t*30, 1) * np.minimum((dd - t)*20, 1)
    prog = [(48, [60, 64, 67]), (43, [59, 62, 65]), (43, [59, 62, 67]), (48, [60, 64, 67]), (41, [60, 65, 69]), (48, [60, 64, 67]), (43, [59, 62, 65]), (48, [60, 64, 67])]
    mel = [[76, 79, 77], [74, 74, 77], [79, 77, 74], [72, 76, 79], [81, 77, 81], [79, 76, 72], [74, 77, 79], [72, None, None]]
    for k in range(int(d/(3*b)) + 2):
        root, ch = prog[k % 8]; t0 = k*3*b
        put(y, pluck(note(root - 12), b*1.2, 0.5), t0, 0.6)
        for j in (1, 2):
            for m in ch: put(y, pluck(note(m), b*0.5, 0.9), t0 + j*b, 0.14)
        for j, m in enumerate(mel[k % 8]):
            if m is not None: put(y, accord(note(m), b*0.95), t0 + j*b, 0.12)
    return y
def track_disco(d):
    y = np.zeros(int(d*SR) + SR); bpm = 112; b = 60/bpm; K = 2
    def marimba(f, dd=0.35):
        t = T(dd); return (np.sin(2*np.pi*f*t) + 0.3*np.sin(2*np.pi*4*f*t)*np.exp(-t*25)) * np.exp(-t*9) * np.minimum(t*400, 1)
    prog = [(41, [65, 69, 72, 76]), (43, [67, 71, 74, 77]), (45, [69, 72, 76, 79]), (43, [67, 71, 74, 77])]
    hook = [81, None, 79, 76, None, 74, 76, None]
    for k in range(int(d/b) + 2):
        bar = (k // 4) % 4; t0 = k*b; root, ch = prog[bar]
        put(y, kick(), t0, 0.6)
        if k % 2 == 1: put(y, clap(), t0, 0.35)
        put(y, hat(True), t0 + b/2, 0.22); put(y, hat(), t0 + b*0.25, 0.08); put(y, hat(), t0 + b*0.75, 0.08)
        for h_, o in [(0, 0), (0.5, 12)]:
            tb = T(b*0.4); bs = np.sin(2*np.pi*note(root + o, K)*tb) * np.exp(-tb*7); put(y, lp(bs, 1200), t0 + h_*b, 0.32)
        if k % 2 == 1:
            for m in ch: put(y, epiano(note(m, K), b*0.45), t0 + b*0.5, 0.06)
        for i, m in enumerate(hook[(k % 2) * 4:(k % 2) * 4 + 4]):
            if m is not None: put(y, marimba(note(m, K)), t0 + i * b / 4, 0.08)
    return y
if EPN == "party":
    STY = dict(hook="rock", A1="rock", A2="edm", B1="waltz", B2="drums", C1="disco", C2="rock", outro="rock")
    GEN = dict(rock=track_rock, edm=track_edm, waltz=track_waltz, drums=track_drums, disco=track_disco)
    LVL = dict(rock=0.8, edm=0.85, waltz=0.9, drums=0.75, disco=0.95)
    sp_ = {x["id"]: x for x in TL["speech"]}
    for sc in TL["scenes"]:
        s0, s1 = sc["s"], sc["e"]; d = s1 - s0 + 0.15; sty = STY[sc["id"]]
        full = GEN[sty](d)[:int(d*SR)]; full = norm(full, 0.9) * LVL[sty]
        muff = lp(lp(full, 260), 260) * 1.7
        n = len(full); tt = np.arange(n)/SR + s0
        ev = sc.get("ev", {})
        op = np.zeros(n) if sc["id"] != "outro" else np.ones(n)
        if "open" in ev: op = np.clip((tt - ev["open"])/0.18, 0, 1)
        g = np.ones(n)
        if sc["id"] == "B1": g *= 1 + 0.75*np.clip((tt - ev["knob"] - 0.45)/0.5, 0, 1)
        if sc["id"] == "B2": xe = sp_["b2_x"]["t"] + sp_["b2_x"]["d"]; g *= 1 - np.clip((tt - xe - 0.1)/0.25, 0, 1)
        if sc["id"] == "C1": g *= 1 - np.clip((tt - ev["wrap"] - 0.5)/1.1, 0, 1)
        if sc["id"] == "hook": g *= 0.9
        seg = (full*op + muff*(1 - op)) * g
        seg *= np.minimum(1, np.arange(n)/(0.03*SR)) * np.minimum(1, (n - np.arange(n))/(0.12*SR))
        put(music, seg, s0, 1.0)
elif EPN in ("london", "sorry", "vendor", "courier", "lie"):
    # cheerful London stroll: pizzicato, walking bass, glockenspiel, brushes
    bpm = 116; b = 60/bpm; K = 0
    def pizz(f, d=0.35):
        t = T(d); return (np.sin(2*np.pi*f*t) + 0.4*np.sin(4*np.pi*f*t)*np.exp(-t*12) + 0.15*np.sin(6*np.pi*f*t)) * np.exp(-t*11) * np.minimum(t*500, 1)
    def glock(f, d=0.9):
        t = T(d); return (np.sin(2*np.pi*f*t) + 0.35*np.sin(2*np.pi*2.76*f*t)*np.exp(-t*6)) * np.exp(-t*4) * np.minimum(t*500, 1)
    prog = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [57, 60, 65]), (43, [55, 59, 62])]
    walk = [0, 4, 7, 9]
    mel = [72, 76, 79, 76, 77, 74, 72, None, 69, 72, 76, 72, 74, 71, 67, None]
    for k in range(int(DUR / b) + 8):
        bar = (k // 4) % 4; t0 = k * b; root, ch = prog[bar]
        put(music, pizz(note(root - 12 + walk[k % 4]), b*0.9), t0, 0.45)
        if k % 2 == 1:
            for m in ch: put(music, pizz(note(m + 12), 0.3), t0, 0.1)
        tt = T(0.12); put(music, bp(rng.standard_normal(len(tt)), 2000, 7000)*np.exp(-tt*25), t0 + b*0.5, 0.1); put(music, bp(rng.standard_normal(len(tt)), 2000, 7000)*np.exp(-tt*35), t0, 0.06)
        for j in range(2):
            m = mel[(k*2 + j) % 16]
            if m is not None and (k // 16) % 2 == 0: put(music, glock(note(m + 12)), t0 + j*b/2, 0.07)
            if m is not None and (k // 16) % 2 == 1: put(music, pizz(note(m), 0.4), t0 + j*b/2, 0.12)
elif EPN in ("airport", "raise", "smell", "things"):
    # breezy airport lounge bossa: e-piano, nylon plucks, soft shaker, walking bass
    bpm = 120; b = 60/bpm; K = 0
    prog = [([62, 65, 69, 72], 38), ([61, 65, 67, 71], 43), ([60, 64, 67, 71], 36), ([57, 61, 64, 67], 45)]
    for k in range(int(DUR / (4*b)) + 4):
        ch, root = prog[k % 4]; t0 = k * 4 * b
        for off, m in [(0, root - 12), (1.5, root - 5), (2, root - 12), (3.5, root - 5)]: put(music, pluck(note(m), b*1.1, 0.4), t0 + off*b, 0.4)
        for off in [0.5, 1.5, 2, 3]:
            for m in ch: put(music, epiano(note(m), b*0.7), t0 + off*b, 0.05)
        for j in range(16):
            tt = T(0.05); put(music, hp(rng.standard_normal(len(tt)), 6000)*np.exp(-tt*70), t0 + j*b/4, 0.1 if j % 2 else 0.05)
        if (k // 4) % 2 == 1:
            for j, m in enumerate([ch[3] + 12, ch[2] + 12, ch[1] + 12]): put(music, pluck(note(m), 0.6, 1.2), t0 + (j*1.25 + 0.5)*b, 0.07)
elif EPN in ("restaurant", "loan"):
    # cosy bistro swing: brushed snare, walking bass, muted piano comping, glock hook
    bpm = 120; b = 60/bpm; K = 0
    def glock(f, d=0.8):
        t = T(d); return (np.sin(2*np.pi*f*t) + 0.35*np.sin(2*np.pi*2.76*f*t)*np.exp(-t*6)) * np.exp(-t*4.5) * np.minimum(t*500, 1)
    prog = [(41, [60, 64, 67, 71]), (38, [62, 65, 69, 72]), (43, [59, 62, 65, 67]), (36, [60, 64, 67, 71])]
    walk = [0, 4, 7, 5]
    mel = [79, None, 76, 74, 72, None, 76, None, 77, None, 74, 72, 71, None, 67, None]
    for k in range(int(DUR / b) + 8):
        bar = (k // 4) % 4; t0 = k * b; root, ch = prog[bar]
        put(music, pluck(note(root + walk[k % 4]), b*0.9, 0.5), t0, 0.45)
        tt = T(0.14); put(music, bp(rng.standard_normal(len(tt)), 3000, 8000)*np.exp(-tt*18), t0, 0.08)
        if k % 2 == 1:
            put(music, bp(rng.standard_normal(len(tt)), 3000, 8000)*np.exp(-tt*22), t0 + b*0.66, 0.07)
            for m in ch: put(music, epiano(note(m), b*0.35), t0, 0.045)
        m = mel[k % 16]
        if m is not None and (k // 16) % 2 == 1: put(music, glock(note(m)), t0, 0.07)
elif EPN == "names":
    # warm wedding waltz: soft piano arpeggio, pizzicato bass, glockenspiel tune
    bpm = 150; b = 60/bpm; K = 0
    def glock(f, d=0.9):
        t = T(d); return (np.sin(2*np.pi*f*t) + 0.35*np.sin(2*np.pi*2.76*f*t)*np.exp(-t*6)) * np.exp(-t*4) * np.minimum(t*500, 1)
    prog = [(41, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (38, [62, 65, 69]), (43, [59, 62, 67]), (36, [60, 64, 67])]
    tune = [[76, 79, 84], [83, None, 79], [81, 77, 76], [74, 77, 81], [79, 83, 86], [84, None, None]]
    for k in range(int(DUR / (3*b)) + 4):
        root, ch = prog[k % 6]; t0 = k * 3 * b
        put(music, pluck(note(root), b*1.1, 0.5), t0, 0.45)
        for j in (1, 2):
            for m in ch: put(music, epiano(note(m), b*0.45), t0 + j*b, 0.04)
        if (k // 6) % 2 == 1:
            for j, m in enumerate(tune[k % 6]):
                if m is not None: put(music, glock(note(m)), t0 + j*b, 0.06)
elif EPN == "market":
    # jaunty London market: honky-tonk oom-pah piano, accordion melody, tambourine
    bpm = 132; b = 60/bpm; K = 0
    def accord(f, d):
        t = T(d); ph = 2*np.pi*f*(1 + 0.004*np.sin(2*np.pi*5.5*t))*t
        x = sum(np.sin(k*ph)/k**1.3 for k in range(1, 7)) + 0.6*sum(np.sin(k*ph*1.004)/k**1.3 for k in range(1, 7))
        return lp(x, 2600) * np.minimum(t*30, 1) * np.minimum((d - t)*20, 1)
    def honky(f, d): return pluck(f, d, 1.2) + pluck(f*1.006, d, 1.0)
    prog = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [57, 60, 65]), (43, [55, 59, 62])]
    mel = [72, 74, 76, 79, 77, 76, 74, None, 69, 72, 74, 77, 76, 74, 72, None]
    for k in range(int(DUR / b) + 8):
        bar = (k // 2) % 4; t0 = k * b; root, ch = prog[bar]
        put(music, honky(note(root - 12 + (7 if k % 2 else 0)), b*0.6), t0, 0.35)
        for m in ch: put(music, honky(note(m + 12), b*0.4), t0 + b*0.5, 0.06)
        tt = T(0.09); put(music, hp(rng.standard_normal(len(tt)), 4500)*np.exp(-tt*30), t0 + b*0.5, 0.12)
        m = mel[k % 16]
        if m is not None and (k // 16) % 2 == 1: put(music, accord(note(m), b*0.9), t0, 0.07)
elif EPN in ("gym", "cancel"):
    bpm = 118; b = 60/bpm; K = 2
    chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]; roots = [33, 29, 36, 31]
    for k in range(int(DUR / b) + 8):
        bar = (k // 4) % 4; t0 = k * b
        put(music, kick(), t0, 0.85)
        if k % 2 == 1: put(music, clap(), t0, 0.55)
        put(music, hat(), t0 + b/2, 0.35); put(music, hat(), t0 + b*0.75, 0.15)
        tb = T(b*0.45); bs = np.sign(np.sin(2*np.pi*note(roots[bar], K)*tb)) * np.exp(-tb*5); put(music, lp(bs, 900), t0 + b/2, 0.28)
        if k % 4 == 0:
            for m in chords[bar]: put(music, pluck(note(m + 12, K), b*1.8, 0.6), t0, 0.12)
        if k % 2 == 0: put(music, pluck(note(chords[bar][(k//2) % 3] + 24, K), 0.3, 1.2), t0 + b*0.5, 0.06)
elif EPN in ("dinner", "gift", "guest"):
    # cosy family waltz: oom-pah-pah + accordion-ish melody + mandolin tremolo
    bpm = 168; b = 60/bpm; K = 0
    def accord(f, d):
        t = T(d); ph = 2*np.pi*f*(1 + 0.004*np.sin(2*np.pi*5.5*t))*t
        x = sum(np.sin(k*ph)/k**1.3 for k in range(1, 7)) + 0.6*sum(np.sin(k*ph*1.004)/k**1.3 for k in range(1, 7))
        return lp(x, 2600) * np.minimum(t*30, 1) * np.minimum((d - t)*20, 1)
    prog = [(48, [60, 64, 67]), (43, [59, 62, 65]), (43, [59, 62, 67]), (48, [60, 64, 67]), (41, [60, 65, 69]), (48, [60, 64, 67]), (43, [59, 62, 65]), (48, [60, 64, 67])]
    mel = [[76, 79, 77], [74, 74, 77], [79, 77, 74], [72, 76, 79], [81, 77, 81], [79, 76, 72], [74, 77, 79], [72, None, None]]
    for k in range(int(DUR / (3*b)) + 4):
        root, ch = prog[k % 8]; t0 = k * 3 * b
        put(music, pluck(note(root - 12), b*1.2, 0.5), t0, 0.5)
        for j in (1, 2):
            for m in ch: put(music, pluck(note(m), b*0.5, 0.9), t0 + j*b, 0.11)
        if (k // 8) % 2 == 1:
            for j, m in enumerate(mel[k % 8]):
                if m is not None: put(music, accord(note(m), b*0.95), t0 + j*b, 0.09)
        else:
            m = ch[(k) % 3] + 12; tt = T(3*b*0.9); trem = (0.55 + 0.45*np.sign(np.sin(2*np.pi*14*tt)))
            put(music, pluck(note(m), 3*b*0.9, 1.2) * trem * 0.0 + np.sin(2*np.pi*note(m)*tt)*np.exp(-tt*0.8)*trem*np.minimum(tt*80, 1), t0, 0.05)
elif EPN in ("salon", "haircut"):
    # groovy salon radio: light disco beat, octave bass, e-piano stabs, marimba hook
    bpm = 112; b = 60/bpm; K = 2
    def marimba(f, d=0.35):
        t = T(d); return (np.sin(2*np.pi*f*t) + 0.3*np.sin(2*np.pi*4*f*t)*np.exp(-t*25)) * np.exp(-t*9) * np.minimum(t*400, 1)
    prog = [(41, [65, 69, 72, 76]), (43, [67, 71, 74, 77]), (45, [69, 72, 76, 79]), (43, [67, 71, 74, 77])]
    hook = [81, None, 79, 76, None, 74, 76, None]
    for k in range(int(DUR / b) + 8):
        bar = (k // 4) % 4; t0 = k * b; root, ch = prog[bar]
        put(music, kick(), t0, 0.6)
        if k % 2 == 1: put(music, clap(), t0, 0.35)
        put(music, hat(True), t0 + b/2, 0.22); put(music, hat(), t0 + b*0.25, 0.08); put(music, hat(), t0 + b*0.75, 0.08)
        for h_, o in [(0, 0), (0.5, 12)]:
            tb = T(b*0.4); bs = np.sin(2*np.pi*note(root + o, K)*tb) * np.exp(-tb*7); put(music, lp(bs, 1200), t0 + h_*b, 0.32)
        if k % 2 == 1:
            for m in ch: put(music, epiano(note(m, K), b*0.45), t0 + b*0.5, 0.05)
        if (k // 16) % 2 == 1:
            for i, m in enumerate(hook[(k % 2) * 4:(k % 2) * 4 + 4]):
                if m is not None: put(music, marimba(note(m, K)), t0 + i * b / 4, 0.07)
else:
    bpm = 104; b = 60/bpm; K = 0
    prog = [([62, 65, 69, 72], 38), ([60, 64, 67, 71], 43), ([62, 65, 69, 72], 38), ([59, 62, 65, 69], 43)]
    for k in range(int(DUR / (4*b)) + 4):
        ch, root = prog[k % 4]; t0 = k * 4 * b
        put(music, epiano(note(root - 12), b*1.4), t0, 0.35); put(music, epiano(note(root - 5), b*1.2), t0 + 2*b, 0.3)
        for off in [0, 1.5, 2.5, 3.5]:
            for m in ch: put(music, epiano(note(m), b*0.9), t0 + off*b, 0.07)
        for s_ in range(8):
            tt = T(0.06); put(music, hp(rng.standard_normal(len(tt)), 5000)*np.exp(-tt*60), t0 + s_*b/2, 0.12 if s_ % 2 else 0.06)
        for off in [0, 0.75, 1.5, 2.5, 3.0]:
            tt = T(0.03); put(music, bp(rng.standard_normal(len(tt)), 1500, 4000)*np.exp(-tt*120), t0 + off*b, 0.18)
music = norm(music, 0.9) if EPN != "party" else music / (np.abs(music).max() + 1e-9) * 0.9
sp = {s["id"]: s for s in TL["speech"]}
gain = np.ones(N)
def ramp(t0, t1, g0, g1):
    i0, i1 = int(t0*SR), int(t1*SR); gain[i0:i1] = np.linspace(g0, g1, max(1, i1-i0))
c2e = sp["c2_her"]["t"] + sp["c2_her"]["d"]; c2n = sp["c2_nar"]["t"] if EPN not in ("dinner", "salon") else sp["c2_x2"]["t"]
if EPN == "airport": c2n = sp["c2_x"]["t"] + sp["c2_x"]["d"] + 0.35
ramp(c2e - 0.08, c2e + 0.02, 1, 0); gain[int((c2e + 0.02)*SR):int((c2n - 0.05)*SR)] = 0; ramp(c2n - 0.05, c2n + 0.4, 0, 1)
ramp(DUR - 1.6, DUR, 1, 0); gain[int(DUR*SR):] = 0
voice = np.zeros((N, 2)); duck = np.zeros(N)
PAN = dict(nar=(1, 1), tip=(1, 1), her=(1.0, 0.84))
for s in TL["speech"]:
    x, _ = sf.read(f"eps/{EPN}/vo/{s['id']}.wav"); i = int(s["t"]*SR); j = min(N, i + len(x))
    if EPN == "airport" and s["id"] == "c2_her2": x = lp(lp(x, 650), 650) * 1.8
    l, r = PAN.get(s["who"], (0.84, 1.0)); g = 1.0 if s["who"] == "nar" else 0.95
    voice[i:j, 0] += x[:j-i]*l*g; voice[i:j, 1] += x[:j-i]*r*g; duck[max(0, i-2400):j+4800] = 1
duck = lp(duck, 4); mus_g = gain * (1 - (0.74 if EPN == "party" else 0.7)*np.clip(duck, 0, 1)) * (0.30 if EPN == "gym" else 0.32 if EPN in ("dinner", "salon", "gift", "guest", "haircut") else 0.44 if EPN == "party" else 0.34)
fx = np.zeros((N, 2))
for c in TL["sfx"]:
    x = SFX[c["n"]]; i = int(c["t"]*SR)
    if i < 0: x = x[-i:]; i = 0
    j = min(N, i + len(x)); pan = rng.uniform(-0.25, 0.25)
    fx[i:j, 0] += x[:j-i]*c["g"]*(1 - pan)*0.55; fx[i:j, 1] += x[:j-i]*c["g"]*(1 + pan)*0.55
mix = voice + fx + np.stack([music*mus_g, np.roll(music, 240)*mus_g], 1)
mix = mix[:int(DUR*SR)]; mix = np.tanh(mix*1.1)/np.tanh(1.1)
sf.write(f"eps/{EPN}/mix_raw.wav", mix.astype(np.float32), SR); print("mixed", EPN, DUR)
