# Zhanna ep6 «Жанна учит Брук русскому»: trims voices (Zhanna sped up 1.2x), lays out the timeline, adds light SFX
# (no music). Outputs timeline.json + out/audio.wav.   python3 prep.py
import json, subprocess, numpy as np, soundfile as sf, os
S = json.load(open('voice/script.json')); SR = 44100; os.makedirs('out', exist_ok=True)
GAP = {'b1': .3, 'z3': .35, 'z5': .35, 'z7': .35, 'z8': .9, 'z9': .3, 'b5': .55, 'b6': 1.5, 'z10': .3, 'b7': 1.25}  # z8 -> text ding, b6 -> sent + reply
def load(k, who):
    o = f'out/v_{k}.wav'; tempo = 1.2 if who == 'z' else 1.0
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'voice/{k}.mp3', '-af', f'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=stop_periods=-1:stop_duration=0.3:stop_threshold=-42dB:stop_silence=0.2,atempo={tempo}', '-ar', str(SR), '-ac', '1', o], check=True)
    return sf.read(o)[0]
t = .5; L = []; clips = []
for k, who, text, *tts in S['lines']:
    a = load(k, who); env = []
    for i in range(int(len(a) / SR * 30) + 1):
        seg = a[int(i * SR / 30): int((i + 1) * SR / 30)]; env.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0)
    mx = max(env) or 1; env = [round(min(1, e / mx * 1.6), 3) for e in env]
    L.append({'id': k, 'who': who, 'text': text, 'at': round(t, 3), 'end': round(t + len(a) / SR, 3), 'env': env}); clips.append((t, a))
    t += len(a) / SR + GAP.get(k, .22)
END = round(t + .3, 3); TOTAL = round(END + 5.5, 3)
voice = np.zeros(int(TOTAL * SR) + SR)
for at, a in clips: i = int(at * SR); voice[i:i + len(a)] += a
fx = np.zeros_like(voice)
def tone(f, d, v=.2, shape=lambda x: np.exp(-x * 6)):
    x = np.arange(int(d * SR)) / SR; return v * np.sin(2 * np.pi * f * x) * shape(x / d)
def put(at, a): i = int(at * SR); fx[i:i + len(a)] += a[:len(fx) - i]
by = {l['id']: l for l in L}
PHONE = round(by['z8']['end'] + .3, 3)
put(PHONE, tone(1568, .25, .12) ); put(PHONE + .12, tone(2093, .35, .1))     # text ding
OKMSG = round(by['z9']['end'] + .1, 3); put(OKMSG, tone(1568, .2, .08))      # "ok" arrives
SENT = round(by['b6']['end'] + .15, 3)
n = np.random.default_rng(2).standard_normal(int(.3 * SR)); n = np.convolve(n, np.ones(20) / 20, 'same') * np.linspace(0, 1, len(n)) ** 2 * .5; put(SENT, n)  # whoosh
REPLY = round(SENT + .65, 3); put(REPLY, tone(1568, .25, .14)); put(REPLY + .12, tone(2093, .25, .12)); put(REPLY + .24, tone(2637, .4, .1))  # reply ding
POP = round(by['b7']['end'] + 1.0, 3); put(POP, tone(180, .08, .3, lambda x: np.exp(-x * 30)))   # gum pop
put(END, tone(1046, 1.2, .12) + tone(1568, 1.2, .07))
mix = voice + fx
mix = mix / max(1e-6, np.abs(mix).max()) * .89
sf.write('out/audio_raw.wav', mix, SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/audio_raw.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '44100', 'out/audio.wav'], check=True)
json.dump({'L': L, 'END': END, 'TOTAL': TOTAL, 'PHONE': PHONE, 'OKMSG': OKMSG, 'SENT': SENT, 'REPLY': REPLY, 'POP': POP}, open('timeline.json', 'w'), ensure_ascii=False)
for l in L: print(l['id'], l['at'], l['end'], round(l['end'] - l['at'], 2))
print('PHONE', PHONE, 'SENT', SENT, 'REPLY', REPLY, 'END', END, 'TOTAL', TOTAL)
