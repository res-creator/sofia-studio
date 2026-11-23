# Zhanna «Жанна сдаёт на права в Америке»: trims voices (Zhanna sped up 1.2x), lays out the timeline, adds light SFX (no music).
# Outputs timeline.json + out/audio.wav.   python3 prep.py
import json, subprocess, numpy as np, soundfile as sf, os
S = json.load(open('voice/script.json')); SR = 44100; os.makedirs('out', exist_ok=True)
GAP = {'e1': .1, 'z1': .25, 'p1': .25, 'z3': .2, 'z4': .2, 'z7': .2, 'p2': .35, 'e9': .35, 'z9': .3, 'z12': .35, 'p3': .35, 'e12': .6, 'z13': .15}
def load(k, who):
    o = f'out/v_{k}.wav'; tempo = 1.2 if who == 'z' else 1.08 if who == 'e' else 1.0
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'voice/{k}.mp3', '-af', f'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=stop_periods=-1:stop_duration=0.1:stop_threshold=-38dB,atempo={tempo}', '-ar', str(SR), '-ac', '1', o], check=True)
    return sf.read(o)[0]
CUT = set(os.environ.get('CUTL', '').split(','))
t = .3; L = []; clips = []
for k, who, text in S['lines']:
    if k in CUT: continue
    a = load(k, who); env = []
    for i in range(int(len(a) / SR * 30) + 1):
        seg = a[int(i * SR / 30): int((i + 1) * SR / 30)]; env.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0)
    mx = max(env) or 1; env = [round(min(1, e / mx * 1.6), 3) for e in env]
    L.append({'id': k, 'who': who, 'text': text, 'at': round(t, 3), 'end': round(t + len(a) / SR, 3), 'env': env}); clips.append((t, a))
    t += len(a) / SR + GAP.get(k, .14)
END = round(L[-1]['end'] + .6, 3); TOTAL = round(END + 5.6, 3)
voice = np.zeros(int(TOTAL * SR) + SR)
for at, a in clips: i = int(at * SR); voice[i:i + len(a)] += a
fx = np.zeros_like(voice); rng = np.random.default_rng(7)
def tone(f, d, v=.2, shape=lambda x: np.exp(-x * 6)):
    x = np.arange(int(d * SR)) / SR; return v * np.sin(2 * np.pi * f * x) * shape(x / d)
def noise(d, v, smooth=40): n = rng.standard_normal(int(d * SR)); return np.convolve(n, np.ones(smooth) / smooth, 'same') * np.hanning(len(n)) * v
def put(at, a): i = int(max(0, at) * SR); fx[i:i + len(a)] += a[:len(fx) - i]
def horn(at, d=.5, v=.12): put(at, tone(415, d, v, lambda x: np.where(x < .9, 1, 0)) + tone(523, d, v * .8, lambda x: np.where(x < .9, 1, 0)))
by = {l['id']: l for l in L}
x = np.arange(int(TOTAL * SR)) / SR; hum = .012 * np.sin(2 * np.pi * 55 * x) * (1 + .3 * np.sin(2 * np.pi * .7 * x)); hum[int(END * SR):] = 0; fx[:len(hum)] += hum   # engine hum
put(by['z1']['at'] + .5, tone(1600, .25, .08) + tone(2400, .25, .04))         # lipstick "mwah" ping
put(by['z3']['at'] + .6, noise(.9, .5, 6) * np.sin(2 * np.pi * 3 * np.arange(int(.9 * SR)) / SR) ** 2)   # tyre screech (left turn)
horn(by['e4']['at'] - .3, .45); horn(by['z4']['end'] - .2, .35, .08)
horn(by['z7']['at'] + .8, .3, .07); horn(by['z7']['at'] + 1.3, .3, .06)
put(by['e8']['at'] - .25, noise(.5, .4, 8))                                    # rolling past the stop sign
put(by['z9']['at'] + .3, noise(.6, .35, 8))                                    # parking skid
STAMP1 = round(by['e11']['at'] + 1.0, 3); STAMP2 = round(by['e12']['at'] + .15, 3)
for s in (STAMP1, STAMP2): put(s, tone(90, .35, .45)); put(s, noise(.12, .6, 20))
DOOR = round(by['e12']['end'] + .1, 3); put(DOOR, tone(70, .5, .45)); put(DOOR, noise(.2, .7, 25))   # door slam
put(by['p3']['at'] - .3, tone(1046, .5, .05))                                   # British "ting"
put(END, tone(1046, 1.2, .1) + tone(1568, 1.2, .06))                            # end card chime
mix = voice + fx
mix = mix / max(1e-6, np.abs(mix).max()) * .89
sf.write('out/audio_raw.wav', mix, SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/audio_raw.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '44100', 'out/audio.wav'], check=True)
json.dump({'L': L, 'END': END, 'TOTAL': TOTAL, 'STAMP1': STAMP1, 'STAMP2': STAMP2, 'DOOR': DOOR}, open('timeline.json', 'w'), ensure_ascii=False)
for l in L: print(l['id'], l['at'], l['end'])
print('STAMP1', STAMP1, 'STAMP2', STAMP2, 'DOOR', DOOR, 'END', END, 'TOTAL', TOTAL)
