# Zhanna GRWM (beauty-blogger parody): trims voices (Zhanna sped up 1.2x, long inner pauses shortened), lays out the timeline,
# adds light SFX (no music file). Outputs timeline.json + out/audio.wav.   python3 prep.py
import json, subprocess, numpy as np, soundfile as sf, os
S = json.load(open('voice/script.json')); SR = 44100; os.makedirs('out', exist_ok=True)
TEMPO = {'z': 1.2, 'k': 1.1, 'p': 1.0}
# beats: z8 -> fridge door + sad «Угу…» over the pour, z9 -> phone rings, z12 -> Petrovich's hand reaches, p2/z13 -> crunch, second reach
GAP = {'z1': .2, 'z2': .25, 'k5': .02, 'z8': .8, 'p1': .45, 'z9': 1.05, 'k6': .3, 'z11': .55, 'z12': .78, 'p2': .55, 'z13': .8}
def load(k, who):
    o = f'out/v_{k}.wav'
    af = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
    if who == 'z': af += ',silenceremove=stop_periods=-1:stop_duration=0.24:stop_threshold=-42dB:stop_silence=0.17'
    af += f',atempo={TEMPO[who]}'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'voice/{k}.mp3', '-af', af, '-ar', str(SR), '-ac', '1', o], check=True)
    a = sf.read(o)[0]; n = int(.012 * SR); a[:n] *= np.linspace(0, 1, n); a[-n:] *= np.linspace(1, 0, n); return a
t = .3; L = []; clips = []
for k, who, text in S['lines']:
    a = load(k, who); env = []
    if who == 'p': a = a * .8
    for i in range(int(len(a) / SR * 30) + 1):
        seg = a[int(i * SR / 30): int((i + 1) * SR / 30)]; env.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0)
    mx = max(env) or 1; env = [round(min(1, e / mx * 1.6), 3) for e in env]
    L.append({'id': k, 'who': who, 'text': text, 'at': round(t, 3), 'end': round(t + len(a) / SR, 3), 'env': env}); clips.append((t, a))
    t += len(a) / SR + GAP.get(k, .18)
by = {l['id']: l for l in L}
END = round(L[-1]['end'] + .9, 3); TOTAL = round(END + 4.6, 3)
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
mix = voice + fx
mix = mix / max(1e-6, np.abs(mix).max()) * .89
sf.write('out/audio_raw.wav', mix, SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/audio_raw.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '44100', 'out/audio.wav'], check=True)
json.dump({'L': L, 'END': END, 'TOTAL': TOTAL, 'POUR': POUR, 'FRIDGE': FRIDGE, 'RING': RING, 'HANG': HANG, 'CREAK': CREAK, 'GRAB1': GRAB1, 'GRAB2': GRAB2}, open('timeline.json', 'w'), ensure_ascii=False)
for l in L: print(l['id'], l['at'], l['end'], round(l['end'] - l['at'], 2))
print('POUR', POUR, 'RING', RING, 'END', END, 'TOTAL', TOTAL)
