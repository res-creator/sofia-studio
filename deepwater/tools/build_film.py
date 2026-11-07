# Main film (after the opening): timeline + soundtrack -> src/data/film.json, public/audio/film_mix.wav (-14 LUFS).
# Narration (vo/*.mp3) and Mike Williams's original testimony (bites, DVIDS 91190/91191/91195) never overlap.
# Music: Mixkit Stock Music Free License (614 "Silent Descent", 593 "Opalescent", 597 "Vertigo", Eugenio Mininni), well under both.
import json, subprocess, wave, os, numpy as np
SR = 44100
SRC = {'w': 'assets/raw/jit/dvids91190_jit_2010-07-23_part1.mp4', 'x': 'assets/raw/jit/dvids91191_jit_2010-07-23.mp4', 'y': 'assets/raw/jit/dvids91195_jit_2010-07-23.mp4'}
TMP = '/tmp/claude-0/xf.wav'
def read(p, mono=True, ss=None, t=None):
    cmd = ['ffmpeg', '-v', 'error', '-y'] + (['-ss', str(ss)] if ss is not None else []) + (['-t', str(t)] if t is not None else []) + ['-i', p, '-ac', '1' if mono else '2', '-ar', str(SR), TMP]
    subprocess.run(cmd, check=True)
    with wave.open(TMP) as f: a = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
    return a if mono else a.reshape(-1, 2)
SEQ = json.load(open('script/film.json'))['seq']
t = 0.0; T = {'lines': {}, 'bites': {}, 'events': {}}; tracks = []
for it in SEQ:
    k, i = it[0], it[1]
    if k == 'vo':
        t += it[3]; w = json.load(open(f'vo/{i}.words.json'))
        T['lines'][i] = {'s': round(t, 3), 'e': round(t + w[-1]['e'], 3), 'words': [{'w': x['w'], 's': round(t + x['s'], 3), 'e': round(t + x['e'], 3)} for x in w]}
        tracks.append(('vo', t, read(f'vo/{i}.mp3'))); t += w[-1]['e']
    elif k == 'bite':
        t += it[3]; segs = []
        for n, (a, b) in enumerate(it[2]):
            if n: t += 0.35  # short breath between joined pieces of one answer
            segs.append({'at': round(t, 3), 'src': a, 'dur': round(b - a, 3)}); tracks.append(('bite', t, read(SRC[it[4]], ss=a, t=b - a))); t += b - a
        T['bites'][i] = segs
    else:
        t += it[3]; T['events'][i] = {'at': round(t, 3), 'dur': it[2]}; t += it[2]
DUR = round(t + 0.5, 2); T['duration'] = DUR; N = int(DUR * SR) + SR; tt = np.arange(N) / SR
vo = np.zeros(N, np.float32); bite = np.zeros(N, np.float32)
for kind, at, a in tracks:
    i0 = int(at * SR); a = a[:N - i0].copy(); f = int(0.03 * SR); a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
    if kind == 'bite':
        a = a - a.mean()
        a = a / (np.sqrt((a ** 2).mean()) + 1e-9) * 0.075
    (vo if kind == 'vo' else bite)[i0:i0 + len(a)] += a * (0.95 if kind == 'vo' else 1.0)
def track(n, a0, a1, off=0.0, fin=1.5, fout=1.5):
    m = read(f'assets/music/mk{n}.mp3', mono=False); m = m / (np.sqrt((m ** 2).mean()) + 1e-9) * 0.04
    L = int((a1 - a0) * SR) + SR
    while len(m) < int(off * SR) + L: m = np.concatenate([m, m])
    out = np.zeros((N, 2), np.float32); i0 = int(max(a0, 0) * SR); seg = m[int(off * SR):int(off * SR) + min(L, N - i0)]
    out[i0:i0 + len(seg)] = seg; env = np.clip((tt - a0) / fin, 0, 1) * np.clip((a1 - tt) / fout, 0, 1); return out * env[:, None]
L = T['lines']; E = T['events']
music = (track('593', 0, L['b25']['s'] - 0.3, 0, 2.0, 1.5)
         + track('597', L['b25']['s'] - 0.8, E['boom']['at'] + 0.1, 20, 1.5, 0.3)
         + track('614', L['b32']['s'] - 0.5, E['hold6']['at'] + 1.0, 30, 2.0, 1.5)
         + track('593', E['ch7']['at'], E['names']['at'] - 0.5, 90, 1.5, 1.5)
         + track('614', E['names']['at'] - 1.0, DUR + 0.5, 0, 2.0, 3.0))
def sm(x, w):  # moving average of |x| (cumulative sum; np.convolve is too slow for a 13-minute track)
    n = int(w * SR); c = np.concatenate([[0], np.cumsum(np.abs(x), dtype=np.float64)]); y = (c[n:] - c[:-n]) / n
    return np.pad(y, (n // 2, len(x) - len(y) - n // 2)).astype(np.float32)
ev, eb = np.clip(sm(vo, 0.3) / 0.02, 0, 1), np.clip(sm(bite, 0.3) / 0.02, 0, 1)
duck = (1 - 0.6 * ev) * (1 - 0.8 * eb)
a0 = E['names']['at']; duck *= 1 + 0.5 * np.clip((tt - a0) / 1.0, 0, 1)
fade = np.clip((DUR - tt) / 2.0, 0, 1)
mix = (np.stack([vo + bite] * 2, 1) + music * duck[:, None]) * fade[:, None]; mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
with wave.open('/tmp/claude-0/film_raw.wav', 'w') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
os.makedirs('public/audio', exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/claude-0/film_raw.wav', '-t', str(DUR), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), 'public/audio/film_mix.wav'], check=True)
json.dump(T, open('src/data/film.json', 'w'), indent=0); print('duration', DUR)
