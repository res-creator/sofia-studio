# Full pilot mix -> out/mix.wav: voices (level-matched per speaker; radio / PA filters), sfx cues tied to words, ducked beds.
import json, subprocess, os, re, numpy as np
D = os.path.dirname(os.path.abspath(__file__)); SR = 44100
TL = json.load(open(f'{D}/timeline.json')); T = TL['T']; N = int((T + 0.5) * SR)
LN = {l['id']: l for l in TL['lines']}; SC = {s['id']: s for s in TL['scenes']}
def at(i, rx=None):
    L = LN[i]
    if rx:
        for w in L['words']:
            if re.search(rx, w['w']): return w['t0']
    return L['t0']
end = lambda i: LN[i]['t1']
cache = {}
def load(f, filt=None):
    k = (f, filt)
    if k not in cache:
        args = ['ffmpeg', '-v', 'error', '-i', os.path.join(D, f)] + (['-af', filt] if filt else []) + ['-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
        cache[k] = np.frombuffer(subprocess.run(args, capture_output=True, check=True).stdout, dtype=np.float32).reshape(-1, 2)
    return cache[k]
def put(buf, a, t, v, dur=None):
    if dur:
        L = min(len(a), int(dur * SR)); a = a[:L].copy(); fo = min(int(0.8 * SR), L // 2); a[L - fo:] *= np.linspace(1, 0, fo)[:, None]
    i = int(max(0, t) * SR); j = min(N, i + len(a))
    if j > i: buf[i:j] += a[:j - i] * v
voice, fx, mus = (np.zeros((N, 2), np.float32) for _ in range(3))
TARGET = {'N': 0.115, 'R': 0.095, 'CG': 0.105, 'B': 0.125}
FILT = {'CG': 'highpass=f=500,lowpass=f=2800,acrusher=bits=8:mix=0.25,volume=1.4', 'B': 'highpass=f=300,lowpass=f=4000,aecho=0.8:0.6:45:0.25'}
def rms(a): x = a[np.abs(a).max(axis=1) > 0.01]; return float(np.sqrt((x ** 2).mean())) if len(x) else 1.0
for L in TL['lines']:
    a = load(L['file'], FILT.get(L['who'])); put(voice, a, L['t0'], TARGET[L['who']] / max(rms(a), 1e-4))
    if L['who'] == 'CG': put(fx, load('../ep1/sfx/radio.mp3'), L['t0'] - 0.3, 0.25, 1.0)
P, CR, E1 = '../sfx/', '../cruise/sfx/', '../ep1/sfx/'
s = lambda i: SC[i]['t0']
cues = [  # (file, time, volume, duration)
  # the original pilot (0 .. door)
  (P + 'waves', 0, 0.45), (P + 'horn', 1.2, 0.5), (P + 'buzz', at('l02', 'buzzes') - 0.1, 0.55), (P + 'pa', at('l03', 'stops') - 0.4, 0.6), (P + 'boom', at('l03', 'mid'), 0.6),
  (P + 'groan', s('deck') + 0.3, 0.5), (P + 'boom', at('l04', 'coming'), 0.45), (P + 'cart', at('l09') + 0.3, 0.55),
  (CR + 'bangmetal', at('l09', 'wait') + 0.9, 0.85), (CR + 'bangmetal', at('l09', 'wait') + 1.6, 0.8), (CR + 'bangmetal', at('l09', 'wait') + 2.0, 0.9), (CR + 'scrape', at('l09', 'wait') + 2.6, 0.3, 1.2),
  # night 1 .. night 10
  (CR + 'enginestop', at('s04_4', 'stop') - 0.2, 0.8),
  (CR + 'steps', at('s05_2', 'Footsteps'), 0.45, 2.4), (CR + 'scrape', at('s05_2', 'dragging'), 0.3, 2.0), (CR + 'drip', at('s05_2', 'silences') + 0.4, 0.4), (CR + 'fork', at('a1', 'can'), 0.25),
  (E1 + 'metaldoor', at('s05_4') - 0.3, 0.4), (E1 + 'sting', at('s05_4', 'infected'), 0.4),
  (E1 + 'heartbeat', s('visitor') + 1.0, 0.3, 5), (CR + 'hatch', at('a2') - 4.2, 0.6), (CR + 'steps', at('a2') - 3.2, 0.3, 1.2), (E1 + 'heartbeat', at('a2') - 1.8, 0.5), (CR + 'hatch', at('a2', 'Orange') + 2.9, 0.45),
  (E1 + 'breath', s('mess') + 0.2, 0.4), (CR + 'steps', s('mess') + 0.2, 0.22, 4.5), (CR + 'drip', s('mess') + 2.0, 0.3),
  (CR + 'icemachine', end('s07_3') + 0.2, 1.0, 3.0), (E1 + 'growl', end('s07_3') + 0.7, 0.7), (E1 + 'crowd', end('s07_3') + 0.8, 0.35, 2), (CR + 'steps', at('a3') + 0.1, 0.4, 2),
  (CR + 'steps', s('run'), 0.6, 5.5), (E1 + 'growl', s('run') + 0.8, 0.5), (E1 + 'heartbeat', at('a4', 'twenty'), 0.5),
  (E1 + 'slamdoor', s('radio') - 0.05, 0.9), (CR + 'bangmetal', s('radio') + 0.5, 0.6),
  (CR + 'paclick', end('s08_1') - 0.5, 0.8), (CR + 'pabreath', end('s08_1') - 0.1, 0.6, 3.6), (CR + 'paclick', at('s08_2', 'off') + 0.3, 0.8),
  # day 12 .. engine control
  (P + 'waves', s('light'), 0.25), (CR + 'enginestart', at('s09_2', 'engines') - 0.3, 0.9), (E1 + 'creak', at('s09_3', 'away') - 0.4, 0.5), (P + 'whoosh', at('s09_1', 'drifted') - 0.3, 0.3),
  (P + 'pop', at('s10_1', 'Safe'), 0.4), (P + 'pop', at('s10_1', 'Fed'), 0.4), (P + 'pop', at('s10_1', 'blind'), 0.4),
  (P + 'whoosh', s('tunnel') - 0.2, 0.3), (CR + 'hatch', at('a5', 'hatch'), 0.5), (CR + 'crawl', at('a5', 'lights'), 0.45, 3.5), (CR + 'crawl', at('a6', 'Something'), 0.35, 4.5), (E1 + 'heartbeat', at('a6', 'Something'), 0.55, 4),
  (E1 + 'tick', at('a7'), 0.6, 1.6), (CR + 'timer', at('a7', 'slide') + 0.4, 0.7, 2.0), (CR + 'timer', at('a7', 'slide') + 2.4, 0.35, 2.0), (CR + 'timer', at('s10_3'), 0.14, 2.0),
  (CR + 'hatch', s('engine') + 0.5, 0.6), (E1 + 'thud', s('engine') + 2.4, 0.8), (CR + 'beep', at('s11_5'), 0.3), (CR + 'beep', at('s11_6', 'engines'), 0.4),
  # the deal .. the crawler
  (CR + 'plate', at('b1', 'fed') + 0.4, 0.35), (CR + 'stove', at('s12_1'), 0.35, 4),
  (P + 'whoosh', at('f2', 'bridge') - 0.4, 0.3), (P + 'pop', at('f3', 'water'), 0.4), (P + 'pop', at('f3', 'pantry'), 0.4), (P + 'pop', at('f3', 'one'), 0.4),
  (P + 'waves', s('cutter'), 0.35), (P + 'horn', at('c1', 'gray'), 0.25), (CR + 'bangmetal', at('c2', 'Kill') + 0.3, 0.5), (CR + 'enginestop', at('c2', 'Kill') + 0.4, 0.5),
  (E1 + 'heartbeat', at('c4') - 0.3, 0.5, 5), (E1 + 'tick', at('c4', 'hour'), 0.25, 3), (P + 'whoosh', at('c5') - 0.4, 0.3),
  (CR + 'bangmetal', at('d2', 'way') - 0.3, 0.6), (CR + 'hatch', at('d2', 'way'), 0.6), (E1 + 'thud', at('d2', 'way') + 1.4, 0.8), (E1 + 'growl', at('d2', 'way') + 2.0, 0.55), (E1 + 'heartbeat', at('d3'), 0.5, 4),
  (CR + 'bangmetal', at('d5', 'bell') - 0.2, 0.9), (CR + 'bangmetal', at('d5', 'bell') + 0.25, 0.9), (CR + 'bangmetal', at('d5', 'bell') + 0.7, 0.9), (CR + 'bangmetal', at('d5', 'bell') + 1.2, 0.9),
  (E1 + 'growl', at('d5', 'bell') + 1.0, 0.6), (CR + 'steps', at('d5', 'bell') + 0.4, 0.35, 4), (E1 + 'slamdoor', at('d6') - 1.3, 0.95), (E1 + 'growl', at('d6') - 1.0, 0.3, 1.0),
  # days 26-29, day 30, outro
  (CR + 'stove', at('e2', 'peaches') - 0.5, 0.25, 4), (CR + 'beep', at('s12_3', 'Fuel'), 0.5),
  (CR + 'beep', s('bridge') + 1.6, 0.9), (CR + 'override', s('bridge') + 1.65, 0.6), (CR + 'beep', at('s13_2') + 0.9, 0.5), (CR + 'beep', at('s13_2') + 1.4, 0.5), (CR + 'beep', at('s13_2') + 1.9, 0.5),
  (E1 + 'heartbeat', end('s13_2') + 0.7, 0.55), (E1 + 'riser', end('s13_2') + 2.5, 0.35, 3.0), (E1 + 'tvnews', at('s13_3') - 1.6, 0.22, 0.6),
  (CR + 'paclick', at('s13_3') - 1.0, 0.9), (CR + 'pabreath', at('s13_3') - 0.8, 0.35, 0.8), (CR + 'paclick', end('s13_4') + 0.4, 0.7), (CR + 'enginestart', end('s13_5') + 0.1, 1.0),
  (P + 'waves', s('outro'), 0.35), (CR + 'gulls', s('outro') + 1.0, 0.3), (E1 + 'sting', end('s13_7') + 0.6, 0.5),
]
for c in cues: put(fx, load(c[0] + '.mp3'), c[1], c[2], c[3] if len(c) > 3 else None)
beds = [  # (file, from, to, volume): looped, faded, ducked under voices
  (P + 'drone', 0, s('night1'), 0.32), (CR + 'hullbed', s('night1'), at('s09_2', 'engines'), 0.28), (CR + 'enginebed', at('s09_2', 'engines') + 0.6, s('outro'), 0.22),
  (E1 + 'music3', at('s09_3'), s('choice') + 1, 0.15), (E1 + 'music3', at('a6'), s('engine'), 0.14), (CR + 'warm', at('s11_7') - 0.3, s('clue'), 0.2), (E1 + 'music3', at('d2'), at('d6'), 0.14),
  (CR + 'warm', s('days'), at('s12_3'), 0.2), (E1 + 'music4', s('outro'), T, 0.24),
]
for f, a, b, v in beds:
    x = load(f + '.mp3'); L = int((b - a) * SR)
    if L <= 0: continue
    seg = np.tile(x, (int(np.ceil(L / len(x))), 1))[:L].copy(); fi, fo = min(int(0.6 * SR), L // 3), min(int(1.0 * SR), L // 3)
    seg[:fi] *= np.linspace(0, 1, fi)[:, None]; seg[L - fo:] *= np.linspace(1, 0, fo)[:, None]; put(mus, seg, a, v)
env = np.abs(voice).max(axis=1); win = int(0.25 * SR); cs = np.concatenate([[0], np.cumsum(env, dtype=np.float64)])
env = (cs[np.minimum(np.arange(N) + win // 2, N)] - cs[np.maximum(np.arange(N) - win // 2, 0)]) / win
mix = voice + fx * 0.9 * (1 - 0.25 * np.clip(env / 0.05, 0, 1))[:, None] + mus * (1 - 0.45 * np.clip(env / 0.05, 0, 1))[:, None]
mix = np.tanh(mix * 1.1) * 0.92; os.makedirs(f'{D}/out', exist_ok=True); raw = f'{D}/out/mix_raw.f32'; mix.astype(np.float32).tofile(raw)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', raw, '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-ar', str(SR), f'{D}/out/mix.wav'], check=True)
os.remove(raw); print('mix ok', round(T, 1))
