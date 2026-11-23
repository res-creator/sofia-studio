# Zhanna «wedding of the ex»: trims voices (Zhanna 1.2x, long inner pauses shortened), mixes the guests' chorus from 4 voices, lays out the timeline,
# adds light SFX. No music. Outputs timeline.json + out/audio.wav.   python3 prep.py
import json, subprocess, numpy as np, soundfile as sf, os
S = json.load(open('voice/script.json')); SR = 44100; os.makedirs('out', exist_ok=True)
GAP = {'o1': .02, 'z4': 1.25, 'g3': .85, 'c2': .95, 'p1': .25, 'z1': .25}
CUTS = {'z9': [(2.6, 5.55)], 'z7': [(2.46, 3.7)]}   # z9: «Я вам даже подарок привезла» cut for length (source seconds, before tempo)   # z4 -> BANQUET plate, g3 -> fist bang + cake slides away, c2 -> swan rolls in
TEMPO = {'z': 1.2, 'o': 1.12}
def load(src, k, who):
    o = f'out/v_{k}.wav'; tempo = TEMPO.get(who, 1.0); cut = ''.join(f"aselect='not(between(t,{a},{b}))'," for a, b in CUTS.get(k, []))
    af = cut + f'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=stop_periods=-1:stop_duration=0.25:stop_threshold=-42dB:stop_silence=0.16,atempo={tempo}'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', af, '-ar', str(SR), '-ac', '1', o], check=True)
    return sf.read(o)[0]
def chorus():
    parts = [load(f'voice/c1_{cv}.mp3', f'c1_{cv}', 'c') for cv in ('c1', 'c2', 'c3', 'c4')]; offs = [0, .07, .12, .17]; gains = [1, .8, .9, .8]
    n = max(int(o * SR) + len(p) for o, p in zip(offs, parts)); a = np.zeros(n)
    for o, p, gn in zip(offs, parts, gains): i = int(o * SR); a[i:i + len(p)] += p / (np.abs(p).max() + 1e-6) * gn
    return a / np.abs(a).max() * .8
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
t = .1; L = []; clips = []; CH = None
for row in S['lines']:
    k, who, text = row[:3]
    if who == 'chorus': CH = CH if CH is not None else chorus(); a = CH
    else: a = load(f'voice/{k}.mp3', k, who)
    env = mouthEnv(a, SR)
    L.append({'id': k, 'who': 'c' if who == 'chorus' else who, 'text': text, 'at': round(t, 3), 'end': round(t + len(a) / SR, 3), 'env': env}); clips.append((t, a))
    t += len(a) / SR + GAP.get(k, .18)
# word timings (faster-whisper on the trimmed clips, voice/words.json): kinetic captions pop word by word
try:
    WORDS = json.load(open('voice/words.json'))
    for l in L:
        if l['id'] in WORDS: l['words'] = [round(l['at'] + w[0], 3) for w in WORDS[l['id']]]
except FileNotFoundError: pass
by = {l['id']: l for l in L}
END = round(L[-1]['end'] + .9, 3); TOTAL = round(END + 4.2, 3)
BANQ = round(by['z4']['end'] + .2, 3)            # BANQUET plate: BANQ .. BANQ + 1.25
BANG = round(by['g3']['end'] - .25, 3)           # Gary's fist hits the table, the cake slides away
SWAN = round(by['c2']['end'] + .05, 3)           # ice swan cart rolls in, Petrovich stands
voice = np.zeros(int(TOTAL * SR) + SR)
for at, a in clips: i = int(at * SR); voice[i:i + len(a)] += a
fx = np.zeros_like(voice)
def tone(f, d, v=.2, shape=lambda x: np.exp(-x * 6)):
    x = np.arange(int(d * SR)) / SR; return v * np.sin(2 * np.pi * f * x) * shape(x / d)
def put(at, a): i = int(at * SR); fx[i:i + len(a)] += a[:len(fx) - i]
def add(*xs):
    o = np.zeros(max(len(x) for x in xs))
    for x in xs: o[:len(x)] += x
    return o
rng = np.random.default_rng(7)
def noise(d, smooth, v): n = rng.standard_normal(int(d * SR)); return np.convolve(n, np.ones(smooth) / smooth, 'same') * np.hanning(len(n)) * v
GATE = round(by['o1']['end'] - .12, 3)
put(GATE, add(noise(.18, 6, .9), tone(70, .35, .5)))                                 # gate bangs open
put(by['l1']['at'] - .3, np.concatenate([tone(f, .012, .15, lambda x: np.ones_like(x)) for f in np.linspace(900, 260, 25)]))   # gasp drop
put(BANQ + .05, tone(2637, .5, .08) + tone(3520, .5, .05)); put(BANQ + .35, tone(2794, .5, .07) + tone(3729, .5, .04))   # glasses clink
for k in range(3): put(by['z5']['at'] - .55 + k * .16, tone(3136, .25, .07, lambda x: np.exp(-x * 14)))   # fork taps the glass
put(by['z8']['at'] + 2.0, tone(1568, .4, .08) + tone(2093, .4, .05))           # price-tag "ding"
put(BANG, add(noise(.12, 4, 1.0), tone(60, .3, .6)))                               # fist bang
put(BANG + .15, noise(.7, 60, .35))                                            # cake slides
for k in range(6): put(SWAN + k * .13, noise(.05, 3, .25))                     # cart wheels rattle
put(SWAN + .9, tone(3136, .7, .08) + tone(4186, .7, .05))                      # ice sparkle
put(END, tone(1046, 1.2, .1) + tone(1568, 1.2, .06))                          # end card chime
WORDS = globals().get('WORDS', {})
def wt(k, sub, d=0.):   # time of the first spoken word of line k containing sub (whisper word timings)
    for st, en, w in WORDS.get(k, []):
        if sub.lower() in w.lower(): return round(by[k]['at'] + st, 3)
    return round(by[k]['at'] + d, 3)
# ---- edit events (single source for picture and sound; see EDIT_PLAN.md) ----
PUNCH = [[GATE, 1.0], [wt('z4', 'люд', .5), .8], [BANG, 1.0], [wt('p3', 'better', 4.0), .8]]   # punch-in + small shake on the hits
FREEZE = [wt('z8', 'пробег', 5.0), 1.6]                                                       # freeze-frame + label: «пробег всего семь лет»
WHIP = [round(BANQ - .25, 3), round(BANQ + 1.3, 3)]                                           # whip-pan out of the ceremony / into the banquet
PANELS = [['photo', by['z3']['at'] + .3, by['z3']['end'] + .3, True], ['toast', by['z5']['at'], by['c1']['end'] + .2, False], ['bride', by['z6']['at'] + .1, by['z6']['at'] + 3.6, False],
  ['partners', by['z7']['at'] + 1.6, by['z7']['end'] + .35, True], ['nohard', by['z9']['at'], by['z9']['at'] + 1.75, False]]
PANELS = [[i, round(x, 3), round(y, 3), th] for i, x, y, th in PANELS]
# subtle edit SFX: whooshes on the whip-pan, a low thump under each punch-in, a shutter click + pencil scribble on the freeze, a soft paper "fwip" when a card pops
def whoosh(d, v):
    n = rng.standard_normal(int(d * SR)); x = np.linspace(0, 1, len(n)); n = np.convolve(n, np.ones(12) / 12, 'same'); return n * np.sin(np.pi * x) ** 2 * v
put(WHIP[0] - .05, whoosh(.35, .16)); put(WHIP[1] - .05, whoosh(.3, .13))
for t0, k in PUNCH:
    if abs(t0 - GATE) > .05 and abs(t0 - BANG) > .05: put(t0, tone(70, .22, .22 * k))
put(FREEZE[0], add(noise(.03, 2, .5), tone(2400, .04, .06))); put(FREEZE[0] + .35, noise(.5, 3, .06))
for pid, a0, b0, th in PANELS: put(a0, whoosh(.12, .07))
mix = voice + fx; mix = mix / max(1e-6, np.abs(mix).max()) * .89
sf.write('out/audio_raw.wav', mix, SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/audio_raw.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '44100', 'out/audio.wav'], check=True)
json.dump({'L': L, 'END': END, 'TOTAL': TOTAL, 'BANQ': BANQ, 'BANG': BANG, 'SWAN': SWAN, 'GATE': GATE, 'PUNCH': PUNCH, 'FREEZE': FREEZE, 'WHIP': WHIP, 'PANELS': PANELS}, open('timeline.json', 'w'), ensure_ascii=False)
for l in L: print(l['id'], l['at'], l['end'], round(l['end'] - l['at'], 2))
print('PUNCH', PUNCH, 'FREEZE', FREEZE, 'WHIP', WHIP); print('GATE', GATE, 'BANQ', BANQ, 'BANG', BANG, 'SWAN', SWAN, 'END', END, 'TOTAL', TOTAL)
