"""Звуки доски из events.json: мел (шорох по линии), машинка (щелчок на букву), счётчик (тихие тики), ластик.
python3 sfx.py events.json out.wav"""
import json, sys
import numpy as np
from scipy.signal import butter, sosfilt
SR = 48000
ev = json.load(open(sys.argv[1])); dur = ev['dur']; ev = ev['ev']
out = np.zeros(int((dur + 1) * SR)); rng = np.random.default_rng(7)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def put(sig, t, gain):
    i = int(t * SR); j = min(len(out), i + len(sig))
    if j > i >= 0: out[i:j] += sig[:j - i] * gain
for e in ev:
    k = e['k']
    if k == 'chalk':
        L = max(0.12, e['t1'] - e['t0']); n = int(L * SR)
        x = bp(rng.standard_normal(n), 1800, 6500) * 0.7 + bp(rng.standard_normal(n), 400, 1200) * 0.5
        u = np.linspace(0, 1, n); env = np.sin(np.pi * u) ** 0.6
        grain = 0.6 + 0.4 * (rng.random(n // 400 + 1).repeat(400)[:n])      # «прерывистость» мела
        put(x * env * grain, e['t0'], 0.05 if e.get('soft') else 0.07)
    elif k == 'key':
        n = int(0.05 * SR); x = bp(rng.standard_normal(n), 1500, 7000) * np.exp(-np.linspace(0, 1, n) * 18)
        thunk = np.sin(2 * np.pi * 180 * np.arange(n) / SR) * np.exp(-np.linspace(0, 1, n) * 25)
        put(x + 0.5 * thunk, e['t0'], 0.22)
    elif k == 'tick':
        T = e['t1'] - e['t0']; m = max(3, int(T * 14))
        for i in range(m):
            tt = e['t0'] + T * (1 - (1 - i / m) ** 2)                             # тики замедляются к концу, как число
            n = int(0.02 * SR); x = np.sin(2 * np.pi * 2400 * np.arange(n) / SR) * np.exp(-np.linspace(0, 1, n) * 30)
            put(x, tt, 0.05)
    elif k == 'erase':
        L = e['t1'] - e['t0']; n = int(L * SR)
        x = bp(rng.standard_normal(n), 250, 1500) * (0.6 + 0.4 * np.sin(np.linspace(0, L * 2 * np.pi * 6, n)) ** 2)
        put(x * np.sin(np.pi * np.linspace(0, 1, n)), e['t0'], 0.12)
from scipy.io import wavfile
wavfile.write(sys.argv[2], SR, (np.clip(out, -1, 1) * 32767).astype(np.int16))
