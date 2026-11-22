# Builds out/voice_*.wav (trimmed, Zhanna sped up), timeline.json and out/audio.wav (voices + light sfx). python3 prep.py
import json, subprocess, numpy as np, soundfile as sf, os
S = json.load(open('voice/script.json')); SR = 44100; os.makedirs('out', exist_ok=True)
GAP = {'z1': .35, 'z8': 1.3, 'z10': 1.2}  # comedic pauses after these lines
def load(k, who):
    o = f'out/v_{k}.wav'; tempo = 1.2 if who == 'z' else 1.0
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'voice/{k}.mp3', '-af', f'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=stop_periods=-1:stop_duration=0.22:stop_threshold=-38dB:stop_silence=0.16,atempo={tempo}', '-ar', str(SR), '-ac', '1', o], check=True)
    return sf.read(o)[0]
t = .35; L = []; clips = []
for k, who, text in S['lines']:
    a = load(k, who); env = []
    for i in range(int(len(a) / SR * 30) + 1):
        seg = a[int(i * SR / 30): int((i + 1) * SR / 30)]; env.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0)
    mx = max(env) or 1; env = [round(min(1, e / mx * 1.6), 3) for e in env]
    L.append({'id': k, 'who': who, 'text': text, 'at': round(t, 3), 'end': round(t + len(a) / SR, 3), 'env': env}); clips.append((t, a))
    t += len(a) / SR + GAP.get(k, .28)
END = round(t + .3, 3); TOTAL = round(END + 6, 3)
mix = np.zeros(int(TOTAL * SR) + SR)
for at, a in clips: i = int(at * SR); mix[i:i + len(a)] += a
def tone(f, d, v=.2, shape=lambda x: np.exp(-x * 6)):
    x = np.arange(int(d * SR)) / SR; return v * np.sin(2 * np.pi * f * x) * shape(x / d)
def put(at, a): i = int(at * SR); mix[i:i + len(a)] += a[:len(mix) - i]
byid = {l['id']: l for l in L}
# crickets in the Miami pause
c0 = byid['z8']['end'] + .15
for k in range(4): put(c0 + k * .28, tone(4400, .12, .05, lambda x: (np.sin(x * np.pi * 9) > 0) * np.exp(-x * 2)))
# phone ring before Petrovich
r0 = byid['z10']['end'] + .2
for k in range(2): put(r0 + k * .45, tone(880, .3, .12, lambda x: np.ones_like(x)) + tone(1320, .3, .06, lambda x: np.ones_like(x)))
# soft chime for the end card
put(END, tone(1046, 1.2, .12) + tone(1568, 1.2, .07))
# quiet street room tone
rng = np.random.default_rng(1); noise = rng.standard_normal(len(mix)); k = np.ones(400) / 400; mix += np.convolve(noise, k, 'same') * .06
mix = mix / max(1e-6, np.abs(mix).max()) * .89
sf.write('out/audio_raw.wav', mix, SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/audio_raw.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '44100', 'out/audio.wav'], check=True)
json.dump({'L': L, 'END': END, 'TOTAL': TOTAL, 'PHONE': round(r0, 3)}, open('timeline.json', 'w'), ensure_ascii=False)
for l in L: print(l['id'], l['at'], l['end'])
print('END', END, 'TOTAL', TOTAL)
