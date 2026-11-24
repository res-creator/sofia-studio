# Zhanna × Sci-Fi Sitcom Toon trial: trims voices (Zhanna ×1.2, Kaylee ×1.05), lays out the timeline, mouth envelopes,
# synthesized foley (pop, shake thud, newspaper rustle, fridge hum room tone). No music.  python3 prep.py → timeline.json + out/audio.wav
import json, subprocess, numpy as np, soundfile as sf, os
D = os.path.dirname(os.path.abspath(__file__)); os.chdir(D)
S = json.load(open('voice/script.json')); SR = 44100; os.makedirs('out', exist_ok=True)
TEMPO = {'z': 1.2, 'k': 1.05, 'p': 1.0}
GAP = {'k1': .2, 'z1': .15, 'k2': .25, 'z2': 1.35}   # z2 → cold silent beat before «Угу»
def load(k, who):
    o = f'out/v_{k}.wav'
    af = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
    if who == 'z': af += ',silenceremove=stop_periods=-1:stop_duration=0.24:stop_threshold=-42dB:stop_silence=0.17'
    af += f',atempo={TEMPO[who]}'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'voice/{k}.mp3', '-af', af, '-ar', str(SR), '-ac', '1', o], check=True)
    a = sf.read(o)[0]; n = int(.012 * SR); a[:n] *= np.linspace(0, 1, n); a[-n:] *= np.linspace(1, 0, n); return a
def mouthEnv(a, fps=24, win=.035, hyst=1.5):
    """Mouth openness per 1/24 s (0 = closed): 35 ms RMS in dB, per-line threshold with hysteresis, forced close on dips between syllables."""
    n = int(len(a) / SR * fps) + 1; w = int(win * SR); db = np.empty(n)
    for i in range(n):
        c = int((i + .5) * SR / fps); seg = a[max(0, c - w // 2): c + w // 2]
        db[i] = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-6) if len(seg) else -120
    lo, hi = np.percentile(db, 12), np.percentile(db, 96); thr = lo + .5 * (hi - lo)
    env = np.zeros(n); op = False
    for i in range(n):
        op = db[i] > thr + hyst if not op else db[i] > thr - hyst
        if op:
            nb = db[max(0, i - 2): i + 3]
            if 0 < i < n - 1 and db[i] <= db[i - 1] and db[i] <= db[i + 1] and nb.max() - db[i] > 2.5: continue
            env[i] = .3 + .7 * min(1, max(0, (db[i] - thr) / max(1e-6, hi - thr))) ** .8
    return [round(float(v), 3) for v in env]
t = .35; L = []; clips = []
for k, who, text in S['lines']:
    a = load(k, who)
    L.append({'id': k, 'who': who, 'text': text, 'at': round(t, 3), 'end': round(t + len(a) / SR, 3), 'env': mouthEnv(a)}); clips.append((t, a))
    t += len(a) / SR + GAP.get(k, .2)
if os.path.exists('voice/words.json'):
    W = json.load(open('voice/words.json'))
    for l in L: l['words'] = [[round(l['at'] + s, 3), round(l['at'] + e, 3), w] for s, e, w in W.get(l['id'], [])]
END = round(L[-1]['end'] + .25, 3); TOTAL = round(END + 1.3, 3)   # tail = Kaylee reaction close-up after «Угу» (≥ 1.2 s)
by = {l['id']: l for l in L}
voice = np.zeros(int(TOTAL * SR) + SR)
for at, a in clips: i = int(at * SR); voice[i:i + len(a)] += a
fx = np.zeros_like(voice); rng = np.random.default_rng(11)
def tone(f, d, v=.2, shape=lambda x: np.exp(-x * 6)):
    x = np.arange(int(d * SR)) / SR; return v * np.sin(2 * np.pi * f * x) * shape(x / d)
def noise(d, v, smooth=30): n = rng.standard_normal(int(d * SR)); return np.convolve(n, np.ones(smooth) / smooth, 'same') * np.hanning(len(n)) * v
def put(at, a): i = int(at * SR); fx[i:i + len(a)] += a[:len(fx) - i]
# room tone: fridge hum (+ a little 120 Hz buzz), constant, quiet; it is the only thing left in the cold beat
x = np.arange(len(fx)) / SR; fx += .018 * np.sin(2 * np.pi * 60 * x) + .008 * np.sin(2 * np.pi * 120 * x) + .004 * np.convolve(rng.standard_normal(len(fx)), np.ones(80) / 80, 'same')
put(.05, tone(520, .12, .25, lambda u: np.exp(-u * 8)) + tone(780, .12, .12, lambda u: np.exp(-u * 8)))   # opening pop
SHAKE = round(by['k2']['at'] + .05, 3); put(SHAKE, tone(70, .35, .5, lambda u: np.exp(-u * 7))); put(SHAKE, noise(.1, .4, 6))   # thud under the shake
CLUTCH = round(by['z2']['at'] + .1, 3); put(CLUTCH, tone(1400, .06, .15, lambda u: np.exp(-u * 20))); put(CLUTCH, tone(2100, .05, .1, lambda u: np.exp(-u * 20)))   # clutch clasp click
RUSTLE = round(by['p1']['at'] - .45, 3)
for k in range(4): put(RUSTLE + k * .09, noise(.09, .25, 3))   # newspaper rustle
CUT = round(by['p1']['end'] + .25, 3); put(CUT, tone(330, .18, .12, lambda u: np.exp(-u * 10)))   # tiny blip on the reaction cut
mix = voice + fx
mix = mix / max(1e-6, np.abs(mix).max()) * .89
sf.write('out/audio_raw.wav', mix[:int(TOTAL * SR)], SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/audio_raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5', '-ar', '44100', 'out/audio.wav'], check=True)
json.dump({'L': L, 'END': END, 'TOTAL': TOTAL, 'SHAKE': SHAKE, 'CUT': CUT, 'RUSTLE': RUSTLE}, open('timeline.json', 'w'), ensure_ascii=False)
for l in L: print(l['id'], l['at'], l['end'])
print('END', END, 'TOTAL', TOTAL)
