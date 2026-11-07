# Full soundtrack: narration (vo/full_narration.wav) + Mixkit Free-License music per part (crossfaded) + hook sound design
# (distant siren wail, total silence after "not one of them sounded", two low booms) -> public/audio/full_mix.wav (-14 LUFS)
import json, re, subprocess, wave, numpy as np
SR = 44100
T = json.load(open('src/data/full.json')); DUR = T['duration']; N = int(DUR * SR); t = np.arange(N) / SR
hm = json.load(open('vo/hook_timed.meta.json'))
W = T['words']
n = lambda x: re.sub(r"[^a-z0-9:]", '', x.lower())
def cue(line, w, nth=0): return [x for x in W if x['line'] == line and n(x['w']).startswith(n(w))][nth]['s']
def read(p, mono=True):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-ac', '1' if mono else '2', '-ar', str(SR), '/tmp/claude-0/mx.wav'], check=True)
    with wave.open('/tmp/claude-0/mx.wav') as f:
        a = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
    return a if mono else a.reshape(-1, 2)
vo = read('vo/full_narration.wav'); vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]
# ---- music sections: (start, end, track id, offset into track, gain)
P = {p['id']: p for p in T['parts']}
hook_end = T['hook_end']
secs = [(0.0, hook_end, '614', 0.0, 1.0)]
plan = {'p1': ('188', 20, 0.9), 'p2': ('597', 10, 1.0), 'p3': ('671', 0, 0.95), 'p4': ('679', 0, 0.85), 'p5': ('571', 40, 0.9),
        'p6': ('563', 30, 1.0), 'p7': ('563', 120, 1.0), 'p8': ('593', 60, 0.9), 'p9': ('520', 0, 0.9), 'p10': ('168', 0, 0.9)}
for p in T['parts']:
    trk, off, g = plan[p['id']]; secs.append((p['title_at'], p['end'], trk, off, g))
secs[-1] = (secs[-1][0], DUR, *secs[-1][2:])
music = np.zeros((N, 2), np.float32); XF = 2.0
cache = {}
for i, (a, b, trk, off, g) in enumerate(secs):
    if trk not in cache:
        m = read(f'assets/music/mk{trk}.mp3', mono=False)
        rms = np.sqrt((m ** 2).mean() + 1e-12); cache[trk] = m / rms * 0.045  # level-match tracks (quieter bed: well under the voice)
    m = cache[trk]; i0 = max(0, int((a - XF / 2) * SR)); i1 = min(N, int((b + XF / 2) * SR)); L = i1 - i0
    s0 = int(off * SR); seg = m[s0:s0 + L]
    if len(seg) < L: seg = np.concatenate([seg, m[:L - len(seg)]])  # loop if the track is short
    env = np.ones(L, np.float32); r = int(XF * SR)
    if i > 0: env[:r] = np.linspace(0, 1, r)
    if i + 1 < len(secs): env[-r:] = np.linspace(1, 0, r)
    music[i0:i1] += seg * (env * g)[:, None]
# ---- hook sound design (siren wail -> total silence -> boom), title boom
quiet0 = cue('h08', 'not') - 0.35; quiet1 = hm['gap_at'] + hm['gap'] - 0.1
def env_between(a, b, fade):
    return (np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1)).astype(np.float32)
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for k in range(len(x)): s = a * s + (1 - a) * x[k]; y[k] = s
    return y
sa = cue('h07', 'They') - 0.3; xs = t - sa; f = 640 + 360 * np.sin(2 * np.pi * xs / 3.2 - np.pi / 2) ** 2
i0, i1 = int(sa * SR), int(quiet0 * SR) + SR
siren = np.zeros(N, np.float32); ph = 2 * np.pi * np.cumsum(f[i0:i1]) / SR
siren[i0:i1] = lp(np.sin(ph).astype(np.float32), 2200) * 0.06
siren *= env_between(sa, quiet0, 0.7)
gate = np.ones(N, np.float32); g0, g1 = int(quiet0 * SR), int(quiet1 * SR); r = int(0.25 * SR)
gate[g0:g1] = 0; gate[g0 - r:g0] = np.linspace(1, 0, r); gate[g1:g1 + r] = np.linspace(0, 1, r)
rng = np.random.default_rng(4)
def boom(at, g):
    i = int(at * SR); x = np.arange(int(2.5 * SR)) / SR
    y = (np.sin(2 * np.pi * 42 * x * (1 - 0.2 * x)) + 0.3 * lp(rng.standard_normal(len(x)).astype(np.float32), 900) * np.exp(-x / 0.08) / 0.3) * np.exp(-x / 0.7) * (1 - np.exp(-x / 0.008))
    o = np.zeros(N, np.float32); k = min(len(y), N - i); o[i:i + k] = y[:k] * g; return o
booms = boom(cue('h08', 'sounded') + 0.15, 0.12) + boom(cue('h14', 'Lahaina') - 0.05, 0.14)
# ---- ducking: music dips under the voice, more under archival speech inserts
env = np.convolve(np.abs(vo), np.ones(int(0.3 * SR)) / int(0.3 * SR), 'same')
env = np.clip(env / (np.percentile(env[env > 0.003], 60) + 1e-9), 0, 1).astype(np.float32)
duck = 1 - 0.65 * env
for x in T['inserts']: duck *= 1 - 0.5 * env_between(x['at'] - 0.3, x['at'] + x['dur'] + 0.3, 0.3)
# swell during part titles (no voice)
for p in T['parts']:
    if p['title']: duck *= 1 + 0.35 * env_between(p['title_at'], p['vo'], 0.4)
mus = music * (duck * gate)[:, None]
mix = np.stack([vo, vo], 1) * 0.95 + mus + np.stack([siren + booms, siren + booms], 1) * gate[:, None] ** 0
fade = np.clip((DUR - t) / 3.0, 0, 1)[:, None]
mix = (mix * fade); mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
with wave.open('/tmp/claude-0/full_raw.wav', 'w') as fo:
    fo.setnchannels(2); fo.setsampwidth(2); fo.setframerate(SR); fo.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/claude-0/full_raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), 'public/audio/full_mix.wav'], check=True)
print('ok', DUR)
