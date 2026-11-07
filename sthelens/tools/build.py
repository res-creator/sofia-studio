# Timeline + soundtrack for the opening: narration lines, archival interview bites (original sound), the silent radio card,
# title. -> src/data/open.json, public/audio/open_mix.wav (-14 LUFS). Music: Mixkit Free License, kept well under voices.
import json, subprocess, wave, numpy as np
SR = 44100
def read(p, mono=True, ss=None, t=None):
    cmd = ['ffmpeg', '-v', 'error', '-y'] + (['-ss', str(ss)] if ss is not None else []) + (['-t', str(t)] if t is not None else []) + ['-i', p, '-ac', '1' if mono else '2', '-ar', str(SR), '/tmp/claude-0/x.wav']
    subprocess.run(cmd, check=True)
    with wave.open('/tmp/claude-0/x.wav') as f: a = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
    return a if mono else a.reshape(-1, 2)
dur = lambda p: float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
# (kind, id, gap before, [bite in, bite out])
SEQ = [('vo', 'n01', 0.6), ('vo', 'n02', 0.5), ('vo', 'n03', 0.45), ('vo', 'n04', 0.6), ('vo', 'n05', 0.5),
       ('bite', 'cc_banks', 0.35, 0.45, 10.0), ('vo', 'n06', 0.5), ('vo', 'n07', 0.6), ('card', 'radio', 0.25, 2.8),
       ('bite', 'cc_miller', 0.0, 0.4, 5.8), ('bite', 'cc_swanson', 0.45, 0.45, 5.0), ('vo', 'n10', 0.55), ('vo', 'n11', 0.6), ('title', 'title', 0.5, 3.6)]
t = 0.0; T = {'lines': {}, 'bites': {}, 'events': {}}; tracks = []
for it in SEQ:
    k, i, gap = it[:3]; t += gap
    if k == 'vo':
        w = json.load(open(f'vo/{i}.words.json')); d = dur(f'vo/{i}.mp3')
        T['lines'][i] = {'s': round(t, 3), 'e': round(t + w[-1]['e'], 3), 'words': [{'w': x['w'], 's': round(t + x['s'], 3), 'e': round(t + x['e'], 3)} for x in w]}
        tracks.append(('vo', t, read(f'vo/{i}.mp3'))); t += w[-1]['e']
    elif k == 'bite':
        a, b = it[3], it[4]; T['bites'][i] = {'at': round(t, 3), 'from': a, 'dur': round(b - a, 3)}
        tracks.append(('bite', t, read(f'public/vid/{i}.mov', ss=a, t=b - a))); t += b - a
    else:
        T['events'][i] = {'at': round(t, 3), 'dur': it[3]}; t += it[3]
DUR = round(t, 2); T['duration'] = DUR; N = int(DUR * SR) + SR; tt = np.arange(N) / SR
vo = np.zeros(N, np.float32); bite = np.zeros(N, np.float32)
for kind, at, a in tracks:
    i0 = int(at * SR); a = a[:N - i0].copy(); f = int(0.02 * SR); a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
    (vo if kind == 'vo' else bite)[i0:i0 + len(a)] += a * (0.95 if kind == 'vo' else 1.25)
def track(n, a0, a1, off=0.0):
    m = read(f'assets/music/mk{n}.mp3', mono=False); m = m / (np.sqrt((m ** 2).mean()) + 1e-9) * 0.045
    out = np.zeros((N, 2), np.float32); i0, i1 = int(a0 * SR), min(N, int(a1 * SR)); seg = m[int(off * SR):int(off * SR) + i1 - i0]
    out[i0:i0 + len(seg)] = seg; env = np.clip((tt - a0) / 1.5, 0, 1) * np.clip((a1 - tt) / 0.6, 0, 1); return out * env[:, None]
card = T['events']['radio']['at']; miller = T['bites']['cc_miller']['at']
music = track('614', 0, card - 0.1) + track('597', miller - 0.3, DUR + 0.5, off=6.0)
sm = lambda x, w: np.convolve(np.abs(x), np.ones(int(w * SR)) / int(w * SR), 'same')
ev, eb = np.clip(sm(vo, 0.3) / 0.02, 0, 1), np.clip(sm(bite, 0.3) / 0.02, 0, 1)
duck = (1 - 0.6 * ev) * (1 - 0.75 * eb)
ti = T['events']['title']['at']; duck *= 1 + 0.6 * np.clip((tt - ti) / 0.5, 0, 1)
fade = np.clip((DUR - tt) / 1.5, 0, 1)
mix = (np.stack([vo + bite] * 2, 1) + music * duck[:, None]) * fade[:, None]; mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
with wave.open('/tmp/claude-0/open_raw.wav', 'w') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(['mkdir', '-p', 'public/audio']); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/claude-0/open_raw.wav', '-t', str(DUR), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), 'public/audio/open_mix.wav'], check=True)
json.dump(T, open('src/data/open.json', 'w'), indent=0); print('duration', DUR, {k: v['at'] for k, v in {**T['bites'], **T['events']}.items()})
