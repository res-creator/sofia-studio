# Zhanna «Франсе» trend: Zhanna lip-syncs the song fragment (song 56.2-77.9 s; the owner adds the TikTok sound on top),
# then a spoken punchline. The song itself is NEVER written into the repo: it is read from the scratchpad (SONG env var)
# only to measure the vocal envelope / syllables / beats; timeline.json stores numbers only.   SONG=... python3 prep.py
import json, subprocess, numpy as np, soundfile as sf, os
from scipy.signal import butter, sosfiltfilt
SR = 44100; os.makedirs('out', exist_ok=True)
SCR = '/tmp/claude-0/-home-user-sofia-studio/43e73c66-8e6e-5633-a8a3-d2d45001da3f/scratchpad/franse'
SONG = os.environ.get('SONG', SCR + '/frag.wav')   # 21.7 s fragment cut from the owner's mp3 at 56.2 s
SONG_LEN = 21.7
# ---------- 1. song: vocal-band envelope + whisper words -> per-syllable mouth openings ----------
a, sr = sf.read(SONG); mid = a.mean(1) if a.ndim > 1 else a
side = (a[:, 0] - a[:, 1]) / 2 if a.ndim > 1 else 0 * mid
voc = sosfiltfilt(butter(4, [250, 4000], 'band', fs=sr, output='sos'), mid - .6 * side)   # centre-panned vocal band
FPS = 30; n = int(SONG_LEN * FPS) + 1; w = int(.04 * sr)
db = np.array([20 * np.log10(np.sqrt(np.mean(voc[max(0, int((i + .5) * sr / FPS) - w // 2): int((i + .5) * sr / FPS) + w // 2] ** 2)) + 1e-7) for i in range(n)])
dbs = np.convolve(db, np.ones(3) / 3, 'same')
A = json.load(open(SCR + '/song_analysis.json')); WORDS = A['words']; BEATS = A['beats']
WORDS[0][0] = max(WORDS[0][0], .45)   # whisper snaps the first word to 0; the full-track pass put the line at 56.68 s (= 0.48 s here)
VOW = 'аеёиоуыэюя'; WIDE = 'аоэу'; ROUND = 'оуюё'
sing = np.zeros(n); rnd = np.zeros(n); syl = []
for s0, e0, word in WORDS:
    vs = [ch for ch in word.lower() if ch in VOW] or ['а']; k = len(vs)
    i0, i1 = int(s0 * FPS), max(int(s0 * FPS) + 1, int(e0 * FPS))
    seg = dbs[i0:i1 + 1]
    # pick k peaks (>= 3 frames apart) in the word window; fall back to even spacing
    order = list(np.argsort(-seg)); pk = []
    for j in order:
        if all(abs(j - q) >= 3 for q in pk): pk.append(j)
        if len(pk) == k: break
    pk = sorted(pk) if len(pk) == k else [int(round((m + .5) * len(seg) / k)) for m in range(k)]
    for v, j in zip(vs, pk): syl.append([(i0 + j) / FPS, v])
lo, hi = np.percentile(db, 20), np.percentile(db, 98)
for idx, (tp, v) in enumerate(syl):
    prev = syl[idx - 1][0] if idx else tp - .4; nxt = syl[idx + 1][0] if idx + 1 < len(syl) else tp + .4
    dl, dr = min(.16, (tp - prev) * .5), min(.2, (nxt - tp) * .5)   # half-way to the neighbours -> a closure between syllables
    amp = (.62 if v in WIDE else .45) + .38 * np.clip((dbs[int(tp * FPS)] - lo) / (hi - lo), 0, 1)
    for i in range(max(0, int((tp - dl) * FPS)), min(n, int((tp + dr) * FPS) + 1)):
        u = i / FPS - tp; d = dl if u < 0 else dr; x = .5 + .5 * np.cos(np.pi * min(1, abs(u) / max(d, 1e-3)))
        if amp * x > sing[i]: sing[i] = amp * x; rnd[i] = 1 if v in ROUND else 0
print('syllables', len(syl), 'open frames %', round(100 * np.mean(sing > .12)))
# ---------- 2. spoken punchline ----------
S = json.load(open('voice/script.json')); TEMPO = {'z': 1.2, 'k': 1.05, 'p': 1.0}
GAP = {'k1': .12, 'z1': .12, 'k2': .1, 'z2': .85}   # tight punchline; z2 -> short cold pause + newspaper rustle before «Угу»
def load(k, who):
    o = f'out/v_{k}.wav'; af = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
    if who == 'z': af += ',silenceremove=stop_periods=-1:stop_duration=0.24:stop_threshold=-42dB:stop_silence=0.17'
    af += f',atempo={TEMPO[who]}'; subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'voice/{k}.mp3', '-af', af, '-ar', str(SR), '-ac', '1', o], check=True)
    x = sf.read(o)[0]; m = int(.012 * SR); x[:m] *= np.linspace(0, 1, m); x[-m:] *= np.linspace(1, 0, m); return x
def mouthEnv(x, fps=30, win=.035, hyst=1.5):
    m = int(len(x) / SR * fps) + 1; ww = int(win * SR); d = np.empty(m)
    for i in range(m):
        c = int((i + .5) * SR / fps); sg = x[max(0, c - ww // 2): c + ww // 2]; d[i] = 20 * np.log10(np.sqrt(np.mean(sg ** 2)) + 1e-6) if len(sg) else -120
    l0, h0 = np.percentile(d, 12), np.percentile(d, 96); thr = l0 + .5 * (h0 - l0); env = np.zeros(m); op = False
    for i in range(m):
        op = d[i] > thr + hyst if not op else d[i] > thr - hyst
        if op:
            nb = d[max(0, i - 2): i + 3]
            if 0 < i < m - 1 and d[i] <= d[i - 1] and d[i] <= d[i + 1] and nb.max() - d[i] > 2.5: continue
            env[i] = .3 + .7 * min(1, max(0, (d[i] - thr) / max(1e-6, h0 - thr))) ** .8
    return [round(float(v), 3) for v in env]
t = SONG_LEN + .2; L = [{'id': 'song', 'who': 'z', 'text': '', 'at': 0.0, 'end': SONG_LEN, 'env': [round(float(v), 3) for v in sing], 'round': [int(v) for v in rnd]}]; clips = []
for k, who, text in S['lines']:
    x = load(k, who)
    if who == 'p': x = x * .8
    L.append({'id': k, 'who': who, 'text': text, 'at': round(t, 3), 'end': round(t + len(x) / SR, 3), 'env': mouthEnv(x)}); clips.append((t, x)); t += len(x) / SR + GAP.get(k, .25)
by = {l['id']: l for l in L}; END = round(L[-1]['end'] + .9, 3); TOTAL = END   # no end table: the video ends on Petrovich's «Угу»
voice = np.zeros(int(TOTAL * SR) + SR)
for at, x in clips: i = int(at * SR); voice[i:i + len(x)] += x
fx = np.zeros_like(voice); rng = np.random.default_rng(5)
def tone(f, d, v=.2, shape=lambda x: np.exp(-x * 6)): x = np.arange(int(d * SR)) / SR; return v * np.sin(2 * np.pi * f * x) * shape(x / d)
def noise(d, v, sm=30): q = rng.standard_normal(int(d * SR)); return np.convolve(q, np.ones(sm) / sm, 'same') * np.hanning(len(q)) * v
def put(at, x): i = int(at * SR); fx[i:i + len(x)] += x[:len(fx) - i]
# scene layout on strong beats (song time); every shot >= 1.2 s
SC = [['perfume', 0.0], ['perfume2', 2.79], ['croissant', 5.45], ['reveal', 8.14], ['beret', 10.83], ['eiffel', 14.32], ['wheel', 16.42], ['kvas', 17.82], ['talk', SONG_LEN]]
RUSTLE = round(by['z2']['end'] + .25, 3)
put(RUSTLE, noise(.35, .5, 6)); put(RUSTLE + .4, noise(.2, .35, 6))                       # newspaper rustle before «Угу»
put(SONG_LEN + .05, tone(1600, .06, .05, lambda x: np.exp(-x * 20)))                       # tiny record-scratch-ish tick as the song is cut
mix = voice + fx; mix = mix / max(1e-6, np.abs(mix).max()) * .89
sf.write('out/audio_raw.wav', mix, SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/audio_raw.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '44100', 'out/audio.wav'], check=True)
json.dump({'L': L, 'END': END, 'TOTAL': TOTAL, 'SONG_LEN': SONG_LEN, 'BEATS': BEATS, 'SC': SC, 'RUSTLE': RUSTLE, 'SYL': [[round(a_, 3), v] for a_, v in syl]}, open('timeline.json', 'w'), ensure_ascii=False)
for l in L: print(l['id'], l['at'], l['end'])
print('END', END, 'TOTAL', TOTAL)
