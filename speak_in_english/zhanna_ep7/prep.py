# Zhanna ep7 (restaurant, Petrovich speaks): trims voices (Zhanna sped up 1.2x), lays out the timeline, adds light SFX and optional music
# (audio/music.mp3, ducked under the voices). Outputs timeline.json + out/audio.wav.   python3 prep.py
import json, subprocess, numpy as np, soundfile as sf, os
S = json.load(open('voice/script.json')); SR = 44100; os.makedirs('out', exist_ok=True)
GAP = {'z1': .3, 'p1': .6, 'z3': .6, 'p2': .7, 'w3': .4, 'w4': .3, 'z4': .6, 'p4': 4.1, 'p5': .9, 'w6': .3, 'z5': .9, 'p7': .3, 'z6': .35}   # z3 -> waiter pours in front, p4 -> ONE HOUR LATER + fork beat, z5 -> steam rises
def load(k, who):
    o = f'out/v_{k}.wav'; tempo = 1.2 if who == 'z' else 1.0
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'voice/{k}.mp3', '-af', f'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo={tempo}', '-ar', str(SR), '-ac', '1', o], check=True)
    return sf.read(o)[0]
t = .35; L = []; clips = []
for k, who, text in S['lines']:
    a = load(k, who); env = []
    for i in range(int(len(a) / SR * 30) + 1):
        seg = a[int(i * SR / 30): int((i + 1) * SR / 30)]; env.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0)
    mx = max(env) or 1; env = [round(min(1, e / mx * 1.6), 3) for e in env]
    L.append({'id': k, 'who': who, 'text': text, 'at': round(t, 3), 'end': round(t + len(a) / SR, 3), 'env': env}); clips.append((t, a))
    t += len(a) / SR + GAP.get(k, .25)
CUT = round(L[-1]['end'] + 1.6, 3); END = round(CUT + 1.6, 3); TOTAL = round(END + 4.5, 3)   # newspaper lowers -> cut to black -> «ПРОДОЛЖЕНИЕ СЛЕДУЕТ» -> end card
voice = np.zeros(int(TOTAL * SR) + SR)
for at, a in clips: i = int(at * SR); voice[i:i + len(a)] += a
fx = np.zeros_like(voice)
def tone(f, d, v=.2, shape=lambda x: np.exp(-x * 6)):
    x = np.arange(int(d * SR)) / SR; return v * np.sin(2 * np.pi * f * x) * shape(x / d)
def put(at, a): i = int(at * SR); fx[i:i + len(a)] += a[:len(fx) - i]
by = {l['id']: l for l in L}
put(.05, tone(2637, .5, .07) + tone(3520, .5, .04))                       # glass clink
put(by['z4']['at'] - .25, np.concatenate([tone(f, .012, .18, lambda x: np.ones_like(x)) for f in np.linspace(900, 220, 30)]))  # surprise drop
LATER = round(by['p4']['end'] + .4, 3); FORK = round(LATER + 1.45, 3)
for k in range(4): put(LATER + .1 + k * .45, tone(1800, .05, .12, lambda x: np.exp(-x * 40)))   # clock ticks
rng = np.random.default_rng(5)
for k in range(3): n = rng.standard_normal(int(.09 * SR)); n = np.convolve(n, np.ones(30) / 30, 'same') * np.hanning(len(n)) * .5; put(FORK + 1.25 + k * .2, n)   # munch behind the newspaper
put(by['p4']['at'] + .55, tone(3136, .7, .09) + tone(4186, .7, .05))     # bling (bald head glint)
CHECK = round(by['w6']['at'] - .2, 3)
put(by['p6']['end'] - .5, tone(1568, .6, .1) + tone(2093, .6, .07))     # cash "ding"
n = rng.standard_normal(int(1.2 * SR)); n = np.convolve(n, np.ones(80) / 80, 'same') * np.hanning(len(n)) * .35; put(by['p7']['at'] - .7, n)   # steam puff
put(CUT, tone(98, 1.4, .3) + tone(147, 1.4, .15))                         # cliffhanger "dun"
put(END, tone(1046, 1.2, .1) + tone(1568, 1.2, .06))                    # end card chime
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
json.dump({'L': L, 'END': END, 'TOTAL': TOTAL, 'CHECK': CHECK, 'LATER': LATER, 'FORK': FORK, 'CUT': CUT}, open('timeline.json', 'w'), ensure_ascii=False)
for l in L: print(l['id'], l['at'], l['end'])
print('LATER', LATER, 'FORK', FORK, 'CHECK', CHECK, 'CUT', CUT, 'END', END, 'TOTAL', TOTAL, 'music' if os.path.exists('audio/music.mp3') else 'no music')
