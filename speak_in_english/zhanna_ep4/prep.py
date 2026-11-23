# Zhanna ep4 v2 (dating app): trims voices (Zhanna sped up 1.2x), lays out the timeline, adds light SFX (no music).
# Outputs timeline.json + out/audio.wav.   python3 prep.py
import json, subprocess, numpy as np, soundfile as sf, os
S = json.load(open('voice/script.json')); SR = 44100; os.makedirs('out', exist_ok=True)
GAP = {'z4': .7, 'z5': 1.0, 'l6': .5, 'l7': .7, 'z8': .5, 'z10': 1.05}   # room for SFX beats; z10 -> Liza's flat look
def load(k, who):
    o = f'out/v_{k}.wav'; tempo = 1.22 if who == 'z' else 1.1
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'voice/{k}.mp3', '-af', f'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo={tempo}', '-ar', str(SR), '-ac', '1', o], check=True)
    return squeeze(sf.read(o)[0])
def squeeze(a, keep=.17):   # shorten internal pauses longer than `keep` seconds (short crossfade at the cut)
    w = int(SR * .02); e = np.array([np.sqrt(np.mean(a[i:i + w] ** 2)) for i in range(0, len(a) - w, w)]); q = e < e.max() * .03
    out, i, n = [], 0, len(q)
    while i < n:
        j = i
        while j < n and q[j] == q[i]: j += 1
        seg = a[i * w:j * w] if j < n else a[i * w:]
        if q[i] and (j - i) * .02 > keep and 0 < i and j < n: k = int(keep * SR / 2); seg = np.concatenate([seg[:k], seg[-k:]])
        out.append(seg); i = j
    return np.concatenate(out)
t = .5; L = []; clips = []
for k, who, text, *_ in S['lines']:
    a = load(k, who); env = []
    for i in range(int(len(a) / SR * 30) + 1):
        seg = a[int(i * SR / 30): int((i + 1) * SR / 30)]; env.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0)
    mx = max(env) or 1; env = [round(min(1, e / mx * 1.6), 3) for e in env]
    L.append({'id': k, 'who': who, 'text': text, 'at': round(t, 3), 'end': round(t + len(a) / SR, 3), 'env': env}); clips.append((t, a))
    t += len(a) / SR + GAP.get(k, .15)
END = round(t + .3, 3); TOTAL = round(END + 5.4, 3)
voice = np.zeros(int(TOTAL * SR) + SR)
for at, a in clips: i = int(at * SR); voice[i:i + len(a)] += a
fx = np.zeros_like(voice)
def tone(f, d, v=.2, shape=lambda x: np.exp(-x * 6)):
    x = np.arange(int(d * SR)) / SR; return v * np.sin(2 * np.pi * f * x) * shape(x / d)
def put(at, a): i = int(at * SR); fx[i:i + len(a)] += a[:len(fx) - i]
rng = np.random.default_rng(4)
def swoosh(d=.28, v=.10):
    n = rng.standard_normal(int(d * SR)); n = np.convolve(n, np.ones(10) / 10, 'same'); return n * np.hanning(len(n)) * v
by = {l['id']: l for l in L}
def click(v=.25): x = np.arange(int(.05 * SR)) / SR; return v * np.sin(2 * np.pi * 900 * x) * np.exp(-x * 120)
SW1 = round(by['z4']['end'] - .75, 3); put(SW1, swoosh())                                          # Kevin swiped left
PING1 = round(by['l4']['at'] - .32, 3); put(PING1, tone(1568, .35, .12) + tone(2093, .35, .06))   # "Hey."
BLOCK1 = round(by['z5']['end'] - .65, 3); put(BLOCK1, click())
MATCH = round(by['l5']['at'] - .3, 3); put(MATCH, tone(1318, .7, .1) + tone(1760, .7, .07))       # scammer match
SENT = round(by['l6']['end'] - .3, 3); put(SENT, swoosh(.22, .08))
THUD = round(by['l7']['at'] - .3, 3); put(THUD, tone(110, .3, .3, lambda x: np.exp(-x * 8)))      # unmatched
SW2 = round(by['l7']['end'] + .05, 3); put(SW2, swoosh(.32, .12))
SUPER = round(by['l8']['at'] - .35, 3); [put(SUPER + k * .16, tone(1760 + k * 440, .3, .09)) for k in range(2)]
PING2 = round(by['l9']['at'] - .3, 3); put(PING2, tone(1568, .35, .12) + tone(2093, .35, .06))
put(END, tone(1046, 1.2, .12) + tone(1568, 1.2, .07))
mix = voice + fx
mix = mix / max(1e-6, np.abs(mix).max()) * .89
sf.write('out/audio_raw.wav', mix, SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/audio_raw.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '44100', 'out/audio.wav'], check=True)
json.dump({'L': L, 'END': END, 'TOTAL': TOTAL, 'SW1': SW1, 'PING1': PING1, 'BLOCK1': BLOCK1, 'MATCH': MATCH, 'SENT': SENT, 'THUD': THUD, 'SW2': SW2, 'SUPER': SUPER, 'PING2': PING2}, open('timeline.json', 'w'), ensure_ascii=False)
for l in L: print(l['id'], l['at'], l['end'], round(l['end'] - l['at'], 2))
print('END', END, 'TOTAL', TOTAL)
