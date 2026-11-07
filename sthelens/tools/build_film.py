# Full-film timeline + soundtrack from script/film.json -> src/data/film.json, public/audio/film_mix.wav (-14 LUFS).
# Narration (vo/*.mp3) and original USGS interview audio (bites) never overlap; music (Mixkit Free License) stays well under both.
import json, subprocess, wave, os, numpy as np
SR = 44100
CC = 'assets/raw/usgs/corecast125_msh_1980.mp4'
def read(p, mono=True, ss=None, t=None):
    cmd = ['ffmpeg', '-v', 'error', '-y'] + (['-ss', str(ss)] if ss is not None else []) + (['-t', str(t)] if t is not None else []) + ['-i', p, '-ac', '1' if mono else '2', '-ar', str(SR), '/tmp/claude-0/x.wav']
    subprocess.run(cmd, check=True)
    with wave.open('/tmp/claude-0/x.wav') as f: a = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
    return a if mono else a.reshape(-1, 2)
SEQ = json.load(open('script/film.json'))['seq']
t = 0.0; T = {'lines': {}, 'bites': {}, 'events': {}, 'order': []}; tracks = []
for it in SEQ:
    k, i = it[0], it[1]
    if k == 'vo':
        gap = it[3]; t += gap
        w = json.load(open(f'vo/{i}.words.json'))
        T['lines'][i] = {'s': round(t, 3), 'e': round(t + w[-1]['e'], 3), 'words': [{'w': x['w'], 's': round(t + x['s'], 3), 'e': round(t + x['e'], 3)} for x in w]}
        tracks.append(('vo', t, read(f'vo/{i}.mp3'))); t += w[-1]['e']
    elif k == 'bite':
        a, b, gap = it[2], it[3], it[4]; t += gap
        clip = f'public/vid/{i}.mov'
        if not os.path.exists(clip):  # sync picture + sound, 0.3 s pre-roll
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a - 0.3), '-t', str(b - a + 0.6), '-i', CC, '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s16le', clip], check=True)
        if i in ('cc_banks', 'cc_miller', 'cc_swanson'): src_from = a - (a - 0.3) if False else None
        T['bites'][i] = {'at': round(t, 3), 'dur': round(b - a, 3), 'src': a}
        tracks.append(('bite', t, read(CC, ss=a, t=b - a))); t += b - a
    else:
        dur, gap = it[2], it[3]; t += gap
        T['events'][i] = {'at': round(t, 3), 'dur': dur}; t += dur
    T['order'].append([k, i])
DUR = round(t + 0.5, 2); T['duration'] = DUR; N = int(DUR * SR) + SR; tt = np.arange(N) / SR
vo = np.zeros(N, np.float32); bite = np.zeros(N, np.float32)
for kind, at, a in tracks:
    i0 = int(at * SR); a = a[:N - i0].copy(); f = int(0.02 * SR); a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
    (vo if kind == 'vo' else bite)[i0:i0 + len(a)] += a * (0.95 if kind == 'vo' else 1.25)
def track(n, a0, a1, off=0.0, fin=1.5, fout=1.5):
    m = read(f'assets/music/mk{n}.mp3', mono=False); m = m / (np.sqrt((m ** 2).mean()) + 1e-9) * 0.045
    L = int((a1 - a0) * SR) + SR
    while len(m) < int(off * SR) + L: m = np.concatenate([m, m])
    out = np.zeros((N, 2), np.float32); i0 = int(a0 * SR); seg = m[int(off * SR):int(off * SR) + min(L, N - i0)]
    out[i0:i0 + len(seg)] = seg; env = np.clip((tt - a0) / fin, 0, 1) * np.clip((a1 - tt) / fout, 0, 1); return out * env[:, None]
L = T['lines']; E = T['events']; B = T['bites']
radio = E['radio']['at']; quake = L['b5_04']['s']
sections = [('614', 0, radio - 0.1, 0, 1.5, 0.4), ('597', B['cc_miller']['at'] - 0.3, L['b1_01']['s'] - 0.2, 6, 1.0, 1.5),
            ('188', L['b1_01']['s'] - 1.5, L['b4_01']['s'] - 0.3, 20, 2, 2), ('593', L['b4_01']['s'] - 1.5, quake - 0.2, 60, 2, 0.6),
            ('571', L['b6_01']['s'] - 0.5, L['b8_01']['s'] - 0.3, 40, 2, 2), ('520', L['b8_01']['s'] - 1.0, L['b9_01']['s'] - 0.2, 0, 2, 2),
            ('168', L['b9_01']['s'] - 1.0, DUR + 0.5, 0, 2, 3)]
music = sum(track(*s) for s in sections)
sm = lambda x, w: np.convolve(np.abs(x), np.ones(int(w * SR)) / int(w * SR), 'same')
ev, eb = np.clip(sm(vo, 0.3) / 0.02, 0, 1), np.clip(sm(bite, 0.3) / 0.02, 0, 1)
duck = (1 - 0.6 * ev) * (1 - 0.75 * eb)
for c in ('title', 'end'):
    a0 = E[c]['at']; duck *= 1 + 0.6 * np.clip((tt - a0) / 0.5, 0, 1) * np.clip((a0 + E[c]['dur'] - tt) / 0.5, 0, 1)
fade = np.clip((DUR - tt) / 3.0, 0, 1)
mix = (np.stack([vo + bite] * 2, 1) + music * duck[:, None]) * fade[:, None]; mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
with wave.open('/tmp/claude-0/film_raw.wav', 'w') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/claude-0/film_raw.wav', '-t', str(DUR), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), 'public/audio/film_mix.wav'], check=True)
json.dump(T, open('src/data/film.json', 'w')); print('duration', DUR)
