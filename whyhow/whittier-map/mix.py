"""Whittier, Alaska: score, foley and narration -> out/mix.wav (48 kHz stereo).
Score is synthesized (no sample downloads): a low D pedal with 2nd/3rd harmonics, plucked pulse, bowed glass pads,
hand-chime-like bells on each label, frame-drum thumps, a spiccato pulse under the tunnel, a horn-like swell at the end.
Foley from the library's core/audio/sfx.py, driven by events.json. Voice: the Kokoro am_puck takes in voice/.
usage: <LIB>/.venv/bin/python mix.py   (LIB in the environment, default /root/lemo-opuscar)"""
import os, sys, json
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ.get('LIB', '/root/lemo-opuscar')
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
import sfx
SR = sfx.SR
EV = json.load(open(os.path.join(HERE, 'events.json')))
DUR = EV['dur']; N = int(DUR * SR) + SR
music = np.zeros((N, 2)); fol = np.zeros((N, 2)); vox = np.zeros((N, 2))
BPM = 84; BEAT = 60 / BPM; BAR = 4 * BEAT
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
T = lambda d: np.arange(int(d * SR)) / SR
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)

def pluck(m, d=1.2, v=1.0):
    t = T(d); f = mtof(m); y = np.zeros_like(t)
    for h, a in [(1, 1), (2, .5), (3, .28), (4, .15), (5, .08)]: y += a * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (2.5 + 3.5 * h))
    att = np.minimum(1, t / .004); return y * att * v * .35
def bell(m, d=2.6, v=1.0):
    t = T(d); f = mtof(m); y = np.zeros_like(t)
    for r, a, k in [(1, 1, 1.6), (2.76, .45, 2.8), (5.4, .25, 5), (8.93, .12, 8)]: y += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k)
    return y * np.minimum(1, t / .002) * v * .22
def pad(ms, d, v=1.0, att=.9):
    t = T(d); y = np.zeros_like(t)
    for m in ms:
        f = mtof(m); y += np.sin(2 * np.pi * f * t + .3 * np.sin(2 * np.pi * 5.2 * t)) + .25 * np.sin(2 * np.pi * 2 * f * t)
    env = np.minimum(1, t / att) * np.minimum(1, (d - t) / 1.2)
    return y * env * v * .06 / len(ms)
def pedal(m, d, v=1.0):
    t = T(d); f = mtof(m)
    y = np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * 2 * f * t) + .25 * np.sin(2 * np.pi * 3 * f * t)
    return y * np.minimum(1, t / 2.5) * np.minimum(1, (d - t) / 2.0) * v * .12
def swell(ms, d, v=1.0):
    t = T(d); y = np.zeros_like(t)
    for m in ms:
        f = mtof(m); ph = 2 * np.pi * f * t; y += sum(np.sin(ph * h) / h for h in range(1, 7))
    y = lp(y, 900); env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    return y * env * v * .05 / len(ms)

def put(buf, x, at, g=1.0, pan=0.0): sfx.add(buf, x.astype(np.float32), at, g, pan)

# --- score (D minor, 84 bpm) ---
put(music, pedal(38, 13.5), 0.0, .9)                                   # D2 pedal: orbit and dive
put(music, pad([74, 81], 7.0, .8), 0.2)                                # high bowed glass: D5 A5
for i, m in enumerate([62, 69, 65, 69, 62, 69, 64, 69] * 3):           # plucked pulse from the dive (bar 3)
    t0 = 6.5 + i * BEAT / 2
    if t0 < 18.8: put(music, pluck(m - 12, .9, .55 + .25 * (i % 2 == 0)), t0, 1, -.2 + .4 * (i % 2))
put(music, pad([62, 65, 69], 6.5, 1.0), 12.6)                          # Dm, the enclosure
for t0 in np.arange(19.4, 28.6, BAR): put(fol, sfx.thump(.6, 62), t0, .55)   # frame drum on bar downbeats under the building
put(music, pad([58, 62, 65], 9.4, .9), 19.2)                           # Bb, the building
put(music, pedal(43, 9.5, .7), 19.2)
for i in range(int(8.4 / (BEAT / 2))):                                 # spiccato under the tunnel
    t0 = 29.4 + i * BEAT / 2; m = [50, 50, 57, 50, 53, 50, 57, 55][i % 8]
    if t0 < 37.7: put(music, pluck(m, .35, .5), t0, 1, .15 * ((i % 2) * 2 - 1))
put(music, pedal(38, 9.0, .8), 29.0)
# half a bar of near-silence before "And at night" (37.9 -> 38.6), then the pedal and the swell
put(music, pedal(38, 8.0, 1.0), 38.4)
put(music, swell([50, 57, 62], 6.5, 1.0), 39.2)
put(music, bell(74, 4.0, 1.0), 41.9); put(music, bell(81, 4.0, .6), 42.15)     # the end line
put(music, pad([62, 69, 74], 4.5, .8, att=.4), 41.6)

# --- foley from the timeline ---
E = {e['type']: e['t'] for e in EV['ev']}
air = sfx.bp(sfx.noise(8.0), 2500, 7000) * .03; air *= np.minimum(1, sfx.t_(8.0) / 1.0) * np.minimum(1, (8.0 - sfx.t_(8.0)) / 1.5)
put(fol, air, 0.0, 1, -.2); put(fol, air[::-1].copy(), 0.0, 1, .2)
put(fol, sfx.whoosh(1.1, 1.0), E['dive'] - .3, .55)
wind = sfx.lp(sfx.brown(30.0), 500) * .12; wind *= np.minimum(1, sfx.t_(30.0) / 2.0) * np.minimum(1, (30.0 - sfx.t_(30.0)) / 3.0)
put(fol, wind, 7.0, .8, -.3)
for k in ['pin', 'pin2']: put(music, bell(86, 2.2, .7), E[k], 1, .2)
for k, m in [('chime', 81), ('chime2', 79)]: put(music, bell(m, 2.4, .8), E[k], 1, -.2)
for e in EV['ev']:
    if e['type'] == 'tick': put(fol, sfx.click(1.4, .5), e['t'], .5)
put(fol, sfx.whoosh(.7, .8), E['road'], .3, -.3)
put(fol, sfx.whoosh(.9, .8), E['orbit'], .3, .3)
put(fol, sfx.whoosh(.8, .9), E['whoosh'], .4)
put(fol, sfx.ignite(1.0), E['ignite'], .55); put(fol, sfx.thump(1.0, 48), E['ignite'], .7)
shim = np.sin(2 * np.pi * 1760 * sfx.t_(1.6)) * np.exp(-sfx.t_(1.6) * 2.5) * .08; put(fol, shim, E['ignite'] + .05, 1, .3)
put(fol, sfx.whoosh(.5, .6), E['car'], .25, -.4)
put(fol, sfx.rumble(2.1, 1.0), E['train'], .45, .3)
put(fol, sfx.thump(.7, 55), E['close'], .5)
sea = sfx.lp(sfx.brown(9.0), 900) * .14; sea *= np.minimum(1, sfx.t_(9.0) / 2.0) * np.minimum(1, (9.0 - sfx.t_(9.0)) / 2.5)
put(fol, sea, 37.5, .9, .2)

# --- narration ---
START = {'W01': .6, 'W02': 8.0, 'W03': 13.2, 'W04': 19.4, 'W05': 29.0, 'W06': 38.6}
for k, t0 in START.items():
    x, sr = sf.read(os.path.join(HERE, 'voice', k + '.wav'), dtype='float32'); x = x if x.ndim == 1 else x.mean(1)
    assert sr == SR or True
    if sr != SR:
        from scipy.signal import resample_poly
        x = resample_poly(x, SR, sr)
    put(vox, sfx.compress(x, .3, 3.0), t0, 1.0)

# --- duck music under the voice (about 6 dB), balance by RMS ---
env = np.abs(vox[:, 0]); env = sosfilt(butter(1, 4, 'low', fs=SR, output='sos'), env)
duck = 1 - .5 * np.clip(env / (env.max() * .25 + 1e-9), 0, 1)
music *= duck[:, None]
rms = lambda a: np.sqrt(np.mean(a[np.abs(a).sum(1) > 1e-6] ** 2)) + 1e-9
vg = 1.0; mg = rms(vox) / rms(music) / 10 ** (10 / 20)          # music ~10 dB under the voice
mix = vox * vg + music * mg + fol * mg * 1.1
mix = mix[:int(DUR * SR)]
fade = np.ones(len(mix)); n = int(1.2 * SR); fade[-n:] = np.linspace(1, 0, n); mix *= fade[:, None]
mix = mix / (np.abs(mix).max() + 1e-9) * .89
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix', len(mix) / SR, 's')
