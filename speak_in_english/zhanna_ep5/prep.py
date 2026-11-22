# Zhanna ep5 (brunch with friends): trims voices (Zhanna sped up 1.2x), lays out the timeline, adds a few light SFX
# (no music). Outputs timeline.json + out/audio.wav.   python3 prep.py
import json, subprocess, numpy as np, soundfile as sf, os
S = json.load(open('voice/script.json')); SR = 44100; os.makedirs('out', exist_ok=True)
GAP = {'t1': .9, 'w2': .45, 'l3': 1.25, 't3': .9, 'z4': .45}   # t1 -> waitress walks in, l3 -> brooch close-up, t3 -> Zhanna freezes
def load(k, who):
    o = f'out/v_{k}.wav'; tempo = {'z': 1.2, 'l': 1.08}.get(who, 1.0)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'voice/{k}.mp3', '-af', f'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo={tempo}', '-ar', str(SR), '-ac', '1', o], check=True)
    a = sf.read(o)[0]; fr = int(.01 * SR); n = len(a) // fr
    db = np.array([20 * np.log10(np.sqrt(np.mean(a[i * fr:(i + 1) * fr] ** 2)) + 1e-9) for i in range(n)]); keep = np.ones(len(a), bool); i = 0
    while i < n:   # squeeze long internal pauses to 0.32 s
        if db[i] < -42:
            j = i
            while j < n and db[j] < -42: j += 1
            if j - i > 40: keep[(i + 16) * fr:(j - 16) * fr] = False
            i = j
        else: i += 1
    return a[keep]
t = .7; L = []; clips = []
for k, who, text in S['lines']:
    a = load(k, who); env = []
    for i in range(int(len(a) / SR * 30) + 1):
        seg = a[int(i * SR / 30): int((i + 1) * SR / 30)]; env.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0)
    mx = max(env) or 1; env = [round(min(1, e / mx * 1.6), 3) for e in env]
    L.append({'id': k, 'who': who, 'text': text, 'at': round(t, 3), 'end': round(t + len(a) / SR, 3), 'env': env}); clips.append((t, a))
    t += len(a) / SR + GAP.get(k, .28)
END = round(t + .4, 3); TOTAL = round(END + 6, 3)
voice = np.zeros(int(TOTAL * SR) + SR)
for at, a in clips: i = int(at * SR); voice[i:i + len(a)] += a
fx = np.zeros_like(voice)
def tone(f, d, v=.2, shape=lambda x: np.exp(-x * 6)):
    x = np.arange(int(d * SR)) / SR; return v * np.sin(2 * np.pi * f * x) * shape(x / d)
def put(at, a): i = int(at * SR); fx[i:i + len(a)] += a[:len(fx) - i]
by = {l['id']: l for l in L}
GLASS = round(by['w2']['end'] + .05, 3)
for k in range(3): put(GLASS + k * .14, tone(2600 + k * 180, .5, .07, lambda x: np.exp(-x * 9)) + tone(3900 + k * 150, .5, .035, lambda x: np.exp(-x * 12)))   # glasses set down
put(by['z3']['at'] + 1.9, tone(1500, .06, .08, lambda x: np.exp(-x * 30)))                     # phone tap
put(by['z3']['end'] - .4, tone(700, .12, .1, lambda x: np.exp(-x * 20)))                       # "block" tap
REVEAL = round(by['l3']['end'] + .1, 3)
put(REVEAL, tone(98, 1.0, .25, lambda x: np.exp(-x * 4)) + tone(147, 1.0, .1, lambda x: np.exp(-x * 4)))   # soft "dun" on the brooch
put(by['w3']['at'] + 1.2, tone(1760, .7, .09) + tone(2640, .7, .05))                            # check "ding"
put(END, tone(1046, 1.2, .12) + tone(1568, 1.2, .07))
mix = voice + fx
mix = mix / max(1e-6, np.abs(mix).max()) * .89
sf.write('out/audio_raw.wav', mix, SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/audio_raw.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '44100', 'out/audio.wav'], check=True)
json.dump({'L': L, 'END': END, 'TOTAL': TOTAL, 'GLASS': GLASS, 'REVEAL': REVEAL}, open('timeline.json', 'w'), ensure_ascii=False)
for l in L: print(l['id'], l['at'], l['end'], round(l['end'] - l['at'], 2))
print('GLASS', GLASS, 'REVEAL', REVEAL, 'END', END, 'TOTAL', TOTAL)
