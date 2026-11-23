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
t = .1; L = []; clips = []; CH = None
for row in S['lines']:
    k, who, text = row[:3]
    if who == 'chorus': CH = CH if CH is not None else chorus(); a = CH
    else: a = load(f'voice/{k}.mp3', k, who)
    env = []
    for i in range(int(len(a) / SR * 30) + 1):
        seg = a[int(i * SR / 30): int((i + 1) * SR / 30)]; env.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0)
    mx = max(env) or 1; env = [round(min(1, e / mx * 1.6), 3) for e in env]
    L.append({'id': k, 'who': 'c' if who == 'chorus' else who, 'text': text, 'at': round(t, 3), 'end': round(t + len(a) / SR, 3), 'env': env}); clips.append((t, a))
    t += len(a) / SR + GAP.get(k, .18)
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
mix = voice + fx; mix = mix / max(1e-6, np.abs(mix).max()) * .89
sf.write('out/audio_raw.wav', mix, SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/audio_raw.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '44100', 'out/audio.wav'], check=True)
json.dump({'L': L, 'END': END, 'TOTAL': TOTAL, 'BANQ': BANQ, 'BANG': BANG, 'SWAN': SWAN, 'GATE': GATE}, open('timeline.json', 'w'), ensure_ascii=False)
for l in L: print(l['id'], l['at'], l['end'], round(l['end'] - l['at'], 2))
print('GATE', GATE, 'BANQ', BANQ, 'BANG', BANG, 'SWAN', SWAN, 'END', END, 'TOTAL', TOTAL)
