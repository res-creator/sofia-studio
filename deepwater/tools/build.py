# Opening timeline + soundtrack -> src/data/open.json, public/audio/open_mix.wav (-14 LUFS).
# Narration and original testimony never overlap; music (Mixkit Free License) stays well under both.
import json, subprocess, wave, os, numpy as np
SR = 44100
SRC = {'w': 'assets/raw/jit/dvids91190_jit_2010-07-23_part1.mp4'}
def read(p, mono=True, ss=None, t=None):
    cmd = ['ffmpeg', '-v', 'error', '-y'] + (['-ss', str(ss)] if ss is not None else []) + (['-t', str(t)] if t is not None else []) + ['-i', p, '-ac', '1' if mono else '2', '-ar', str(SR), '/tmp/claude-0/x.wav']
    subprocess.run(cmd, check=True)
    with wave.open('/tmp/claude-0/x.wav') as f: a = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
    return a if mono else a.reshape(-1, 2)
SEQ = json.load(open('script/opening.json'))['seq']
t = 0.0; T = {'lines': {}, 'bites': {}, 'events': {}}; tracks = []
for it in SEQ:
    k, i = it[0], it[1]
    if k == 'vo':
        t += it[3]; w = json.load(open(f'vo/{i}.words.json'))
        T['lines'][i] = {'s': round(t, 3), 'e': round(t + w[-1]['e'], 3), 'words': [{'w': x['w'], 's': round(t + x['s'], 3), 'e': round(t + x['e'], 3)} for x in w]}
        tracks.append(('vo', t, read(f'vo/{i}.mp3'))); t += w[-1]['e']
    elif k == 'bite':
        t += it[3]; segs = []
        for a, b in it[2]:
            segs.append({'at': round(t, 3), 'src': a, 'dur': round(b - a, 3)}); tracks.append(('bite', t, read(SRC[i[0]], ss=a, t=b - a))); t += b - a
        T['bites'][i] = segs
    else:
        t += it[3]; T['events'][i] = {'at': round(t, 3), 'dur': it[2]}; t += it[2]
DUR = round(t + 0.6, 2); T['duration'] = DUR; N = int(DUR * SR) + SR; tt = np.arange(N) / SR
vo = np.zeros(N, np.float32); bite = np.zeros(N, np.float32)
for kind, at, a in tracks:
    i0 = int(at * SR); a = a[:N - i0].copy(); f = int(0.03 * SR); a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
    if kind == 'bite': a = a / (np.sqrt((a ** 2).mean()) + 1e-9) * 0.075
    (vo if kind == 'vo' else bite)[i0:i0 + len(a)] += a * (0.95 if kind == 'vo' else 1.0)
def track(n, a0, a1, off=0.0, fin=1.5, fout=1.5):
    m = read(f'assets/music/mk{n}.mp3', mono=False); m = m / (np.sqrt((m ** 2).mean()) + 1e-9) * 0.04
    L = int((a1 - a0) * SR) + SR
    while len(m) < int(off * SR) + L: m = np.concatenate([m, m])
    out = np.zeros((N, 2), np.float32); i0 = int(a0 * SR); seg = m[int(off * SR):int(off * SR) + min(L, N - i0)]
    out[i0:i0 + len(seg)] = seg; env = np.clip((tt - a0) / fin, 0, 1) * np.clip((a1 - tt) / fout, 0, 1); return out * env[:, None]
Ln = T['lines']; E = T['events']
music = track('614', 0, Ln['c03']['s'] - 0.3, 0, 1.5, 1.5) + track('593', Ln['c03']['s'] - 1.2, E['silence']['at'] + 0.2, 60, 1.5, 1.2) + track('597', Ln['c10']['s'] - 0.8, DUR + 0.3, 6, 1.5, 2.0)
sm = lambda x, w: np.convolve(np.abs(x), np.ones(int(w * SR)) / int(w * SR), 'same')
ev, eb = np.clip(sm(vo, 0.3) / 0.02, 0, 1), np.clip(sm(bite, 0.3) / 0.02, 0, 1)
duck = (1 - 0.6 * ev) * (1 - 0.8 * eb)
a0 = E['title']['at']; duck *= 1 + 0.6 * np.clip((tt - a0) / 0.4, 0, 1)
fade = np.clip((DUR - tt) / 1.5, 0, 1)
mix = (np.stack([vo + bite] * 2, 1) + music * duck[:, None]) * fade[:, None]; mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
with wave.open('/tmp/claude-0/open_raw.wav', 'w') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
os.makedirs('public/audio', exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/claude-0/open_raw.wav', '-t', str(DUR), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), 'public/audio/open_mix.wav'], check=True)
json.dump(T, open('src/data/open.json', 'w'), indent=0); print('duration', DUR, T['bites'], E)
