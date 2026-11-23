# Zhanna GRWM (beauty-blogger parody): trims voices (Zhanna sped up 1.2x, long inner pauses shortened), lays out the timeline,
# adds light SFX (no music file). Outputs timeline.json + out/audio.wav.   python3 prep.py
import json, subprocess, numpy as np, soundfile as sf, os
S = json.load(open('voice/script.json')); SR = 44100; os.makedirs('out', exist_ok=True)
TEMPO = {'z': 1.2, 'k': 1.1, 'p': 1.0}
# beats: z8 -> fridge door + sad «Угу…» over the pour, z9 -> phone rings, z12 -> Petrovich's hand reaches, p2/z13 -> crunch, second reach
GAP = {'z0': .15, 'z1': .2, 'z2': .25, 'k5': .02, 'z8': .7, 'p1': .45, 'z9': .95, 'k6': .3, 'z11': .55, 'z12': .7, 'p2': .55, 'z13': .7}
def load(k, who):
    o = f'out/v_{k}.wav'
    af = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
    if who == 'z': af += ',silenceremove=stop_periods=-1:stop_duration=0.24:stop_threshold=-42dB:stop_silence=0.17'
    af += f',atempo={TEMPO[who]}'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'voice/{k}.mp3', '-af', af, '-ar', str(SR), '-ac', '1', o], check=True)
    a = sf.read(o)[0]; n = int(.012 * SR); a[:n] *= np.linspace(0, 1, n); a[-n:] *= np.linspace(1, 0, n); return a
def mouthEnv(a, SR, fps=30, win=.035, hyst=1.5):
    """Mouth openness per video frame (0 = closed). Short-window RMS (35 ms) in dB, adaptive threshold per line
    (half way between the 12th and 96th percentile), hysteresis, and a forced close on dips between syllables.
    Gives ~3.5-5 open/close cycles per second with the mouth closed ~30-55% of a line. No boost/clipping."""
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
            if 0 < i < n - 1 and db[i] <= db[i - 1] and db[i] <= db[i + 1] and nb.max() - db[i] > 2.5: continue   # dip between syllables -> closed
            env[i] = .3 + .7 * min(1, max(0, (db[i] - thr) / max(1e-6, hi - thr))) ** .8
    return [round(float(v), 3) for v in env]
t = .3; L = []; clips = []
for k, who, text in S['lines']:
    a = load(k, who)
    if who == 'p': a = a * .8
    env = mouthEnv(a, SR)
    L.append({'id': k, 'who': who, 'text': text, 'at': round(t, 3), 'end': round(t + len(a) / SR, 3), 'env': env}); clips.append((t, a))
    t += len(a) / SR + GAP.get(k, .15)
# word timings (faster-whisper on the trimmed clips, voice/words.json from voice/words.py): kinetic captions pop word by word
WORDS = {}
if os.path.exists('voice/words.json'):
    for k, ws in json.load(open('voice/words.json')).items():
        m = []
        for w in ws:   # glue split tokens ("eighty -dollar", "Ma 'am") back to one caption word
            if m and (w[2][:1] in "-'’" or not w[2].strip()): m[-1] = [m[-1][0], w[1], m[-1][2] + w[2]]
            else: m.append(list(w))
        WORDS[k] = m
for l in L:
    if l['id'] in WORDS: l['words'] = [round(l['at'] + w[0], 3) for w in WORDS[l['id']]]
by = {l['id']: l for l in L}
END = round(L[-1]['end'] + .9, 3); TOTAL = round(END + 4.2, 3)
voice = np.zeros(int(TOTAL * SR) + SR)
for at, a in clips: i = int(at * SR); voice[i:i + len(a)] += a
fx = np.zeros_like(voice); rng = np.random.default_rng(7)
def tone(f, d, v=.2, shape=lambda x: np.exp(-x * 6)):
    x = np.arange(int(d * SR)) / SR; return v * np.sin(2 * np.pi * f * x) * shape(x / d)
def noise(d, v, smooth=30): n = rng.standard_normal(int(d * SR)); return np.convolve(n, np.ones(smooth) / smooth, 'same') * np.hanning(len(n)) * v
def put(at, a): i = int(at * SR); fx[i:i + len(a)] += a[:len(fx) - i]
put(.02, tone(1200, .08, .12, lambda x: np.exp(-x * 30)))                              # ring light click
put(.12, tone(2637, .5, .05) + tone(3520, .5, .03))                                     # sparkle
SPLAT = {'z3': .55, 'z9': .12}                                                          # mayo / sour cream splats (fraction of the line)
for k, u in SPLAT.items(): l = by[k]; put(l['at'] + (l['end'] - l['at']) * u, noise(.18, .5, 12))
POUR = round(by['z8']['at'] + (by['z8']['end'] - by['z8']['at']) * .62, 3)
put(POUR, noise(1.6, .16, 6))                                                           # beer glug/pour
FRIDGE = round(by['z8']['end'] + .1, 3)
put(FRIDGE, noise(.12, .7, 40)); put(FRIDGE, tone(90, .25, .25)); put(FRIDGE + .15, tone(60, .5, .05, lambda x: np.ones_like(x) * (1 - x)))   # fridge door thunk + hum
RING = round(by['z9']['end'] + .2, 3)
for k in range(2): put(RING + k * .5, tone(1318, .35, .1, lambda x: (np.sin(x * 60) > 0) * np.exp(-x * 2)) + tone(1568, .35, .06, lambda x: np.exp(-x * 3)))   # phone ring
HANG = round(by['z11']['end'] + .1, 3); put(HANG, tone(440, .15, .1, lambda x: np.ones_like(x)))   # call ended
CREAK = round(by['z12']['at'] - .35, 3)
put(CREAK, sum(tone(f, .6, .03, lambda x: np.sin(np.pi * x)) for f in (310, 333, 355)))     # door creak
GRAB1 = round(by['z12']['end'] + .15, 3); GRAB2 = round(by['z13']['end'] + .1, 3)
for at in (by['p2']['end'] + .05, by['p3']['end'] + .05):
    for k in range(3): put(at + k * .13, noise(.07, .7, 4))                              # crunch
put(END, tone(1046, 1.2, .1) + tone(1568, 1.2, .06))                                    # end card chime
def wt(k, sub, d=0.):   # absolute time of the first word of line k containing sub
    for st, en, w in WORDS.get(k, []):
        if sub.lower() in w.lower(): return round(by[k]['at'] + st, 3)
    return round(by[k]['at'] + d, 3)
# ---- edit events: one source for picture (render.js) and sound ----
PUNCH = [[wt('z3', 'восемьдесят', .05), 1.0], [wt('z8', 'слэй', 3.8), .9], [wt('z11', 'коллаб', .05), .9], [wt('z13', 'брэда', 2.4), 1.0]]   # punch-in + small shake on the 4 top punchlines
FREEZE = [wt('z9', 'ноу', 2.2), 1.6]                                    # freeze-frame on the full mask: «НОУ ФИЛТЕР»
SHUSH = [round(by['z8']['at'] - .05, 3), round(wt('z8', 'деточка', .7) - .02, 3)]   # «Шшш»: pointing-up finger, «ш» lips
WHIP = [[round(by['k1']['at'] - .12, 3), 1], [round(RING - .2, 3), 1], [round(by['z10']['at'] - .1, 3), -1]]   # whip-pans into / out of Kaylee's phone
MATCH = round(by['z3']['at'] - .1, 3)                                    # match cut: Kaylee's $80 bottle -> Zhanna's mayo jar
def at(k, u): return by[k]['at'] + (by[k]['end'] - by[k]['at']) * u
PANELS = [['mayo', at('z3', .3), by['z3']['end'] + .4], ['fork', by['z5']['at'] + .1, by['z5']['end'] + .35], ['pelmeni', by['z7']['at'] + .15, by['z7']['end'] + .45],
  ['shelf', by['z10']['at'] + .1, by['z10']['end'] + .35], ['brad', at('z13', .3), by['z13']['end'] + .6]]
PANELS = [[i, round(x, 3), round(y, 3)] for i, x, y in PANELS]
def whoosh(d, v):
    n = rng.standard_normal(int(d * SR)); x = np.linspace(0, 1, len(n)); n = np.convolve(n, np.ones(12) / 12, 'same'); return n * np.sin(np.pi * x) ** 2 * v
for t0, d in WHIP: put(t0 - .22, whoosh(.4, .14))                         # quiet whoosh on each whip-pan
for t0, k in PUNCH: put(t0, tone(70, .22, .2 * k))                       # low thump under each punch-in
put(FREEZE[0], noise(.03, .5, 3)); put(FREEZE[0], tone(2400, .04, .06))   # shutter click on the freeze
for pid, a0, b0 in PANELS: put(a0, whoosh(.12, .06))                     # soft paper "fwip" when a card pops
mix = voice + fx
mix = mix / max(1e-6, np.abs(mix).max()) * .89
sf.write('out/audio_raw.wav', mix, SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/audio_raw.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '44100', 'out/audio.wav'], check=True)
json.dump({'L': L, 'END': END, 'TOTAL': TOTAL, 'PUNCH': PUNCH, 'FREEZE': FREEZE, 'SHUSH': SHUSH, 'WHIP': WHIP, 'MATCH': MATCH, 'PANELS': PANELS, 'POUR': POUR, 'FRIDGE': FRIDGE, 'RING': RING, 'HANG': HANG, 'CREAK': CREAK, 'GRAB1': GRAB1, 'GRAB2': GRAB2}, open('timeline.json', 'w'), ensure_ascii=False)
for l in L: print(l['id'], l['at'], l['end'], round(l['end'] - l['at'], 2))
print('PUNCH', PUNCH, 'FREEZE', FREEZE, 'SHUSH', SHUSH, 'WHIP', WHIP, 'MATCH', MATCH); print('POUR', POUR, 'RING', RING, 'END', END, 'TOTAL', TOTAL)
