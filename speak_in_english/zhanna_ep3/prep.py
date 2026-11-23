# Zhanna ep3 v2 (gym bet): trims voices (Zhanna sped up 1.2x), lays out the timeline, adds light SFX and optional music
# (audio/music.mp3, ducked under the voices). Outputs timeline.json + out/audio.wav.   python3 prep.py
import json, subprocess, numpy as np, soundfile as sf, os
S = json.load(open('voice/script.json')); SR = 44100; os.makedirs('out', exist_ok=True)
GAP = {'z1': .3, 't1': .5, 'z5': 1.5, 't6': 1.1}   # t1 -> hop freeze, z5 -> followers explode, t6 -> phone rings
def load(k, who):
    o = f'out/v_{k}.wav'; tempo = 1.25 if who == 'z' else 1.08
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'voice/{k}.mp3', '-af', f'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=stop_periods=-1:stop_duration=0.22:stop_threshold=-40dB:stop_silence=0.16,atempo={tempo}', '-ar', str(SR), '-ac', '1', o], check=True)
    return sf.read(o)[0]
t = .6; L = []; clips = []
for k, who, text in S['lines']:
    a = load(k, who); env = []
    for i in range(int(len(a) / SR * 30) + 1):
        seg = a[int(i * SR / 30): int((i + 1) * SR / 30)]; env.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0)
    mx = max(env) or 1; env = [round(min(1, e / mx * 1.6), 3) for e in env]
    L.append({'id': k, 'who': who, 'text': text, 'at': round(t, 3), 'end': round(t + len(a) / SR, 3), 'env': env}); clips.append((t, a))
    t += len(a) / SR + GAP.get(k, .2)
STING = round(t - .2 + .3, 3); FAINT = round(STING + 2.4, 3); END = round(FAINT + 1.3, 3); TOTAL = round(END + 6.2, 3)
voice = np.zeros(int(TOTAL * SR) + SR)
for at, a in clips: i = int(at * SR); voice[i:i + len(a)] += a
fx = np.zeros_like(voice)
def tone(f, d, v=.2, shape=lambda x: np.exp(-x * 6)):
    x = np.arange(int(d * SR)) / SR; return v * np.sin(2 * np.pi * f * x) * shape(x / d)
def put(at, a): i = int(at * SR); fx[i:i + len(a)] += a[:len(fx) - i]
by = {l['id']: l for l in L}
rng = np.random.default_rng(3)
def thud(at, v=.3): n = int(.2 * SR); put(at, v * np.sin(2 * np.pi * 70 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 25) + v * .3 * rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 60))
def clank(at, v=.1):
    n = int(.25 * SR); put(at, v * .5 * rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 40) + tone(620, .25, v * .6, lambda x: np.exp(-x * 14)) + tone(1430, .25, v * .3, lambda x: np.exp(-x * 18)))
put(.05, tone(2093, .9, .1) + tone(2637, .9, .06))                       # door chime
JACK = round(by['t1']['end'] - 1.6, 3)
for k in range(3): thud(JACK + k * .5, .18)                               # jumping jacks
for k in range(3): clank(by['t4']['at'] + .4 + k * .7)                     # dumbbells
FOLLOW = round(by['z5']['end'] + .15, 3)
for k in range(6): put(FOLLOW + k * .2, tone(1760 + 220 * (k % 3), .25, .07))   # notification dings
RING = round(by['t6']['end'] + .1, 3)
for k in range(2): put(RING + k * .5, tone(880, .32, .1, lambda x: np.ones_like(x)) + tone(1320, .32, .05, lambda x: np.ones_like(x)))
for k in range(2): put(STING + k * .25, (rng.standard_normal(int(.15 * SR)) * .05 + tone(160, .15, .15, lambda x: np.ones_like(x))))   # phone buzz
put(FAINT + .55, np.zeros(1)); thud(FAINT + .6, .25)
put(END, tone(1046, 1.2, .12) + tone(1568, 1.2, .07))
mix = voice + fx
if os.path.exists('audio/music.mp3'):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'audio/music.mp3', '-ar', str(SR), '-ac', '1', 'out/music.wav'], check=True)
    m = sf.read('out/music.wav')[0]; m = np.tile(m, int(np.ceil(len(mix) / len(m))))[:len(mix)]
    e = np.abs(voice); k = int(.25 * SR); e = np.convolve(e, np.ones(k) / k, 'same'); duck = np.where(e > .01, .32, 1.0); duck = np.convolve(duck, np.ones(k) / k, 'same')
    fade = np.ones(len(m)); fade[-2 * SR:] = np.linspace(1, 0, 2 * SR)
    mix += m / (np.abs(m).max() + 1e-6) * .22 * duck * fade
mix = mix / max(1e-6, np.abs(mix).max()) * .89
sf.write('out/audio_raw.wav', mix, SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/audio_raw.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '44100', 'out/audio.wav'], check=True)
json.dump({'L': L, 'END': END, 'TOTAL': TOTAL, 'FOLLOW': FOLLOW, 'RING': RING, 'STING': STING, 'FAINT': FAINT, 'JACK': JACK}, open('timeline.json', 'w'), ensure_ascii=False)
for l in L: print(l['id'], l['at'], l['end'])
print('FOLLOW', FOLLOW, 'RING', RING, 'STING', STING, 'END', END, 'TOTAL', TOTAL, 'music' if os.path.exists('audio/music.mp3') else 'no music')
