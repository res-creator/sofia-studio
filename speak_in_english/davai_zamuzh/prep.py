# «Давай замуж!» ep1: trims voices (tempo per voice, long inner pauses shortened), word timings (faster-whisper),
# mouth envelopes, lays out part 1 and part 2 timelines with edit events, synthesized SFX (no music), one censor bleep.
# python3 prep.py  ->  timeline1.json, timeline2.json, out/audio1.wav, out/audio2.wav
import json, subprocess, numpy as np, soundfile as sf, os, io
S = json.load(open('voice/script.json')); SR = 44100; os.makedirs('out', exist_ok=True)
TEXT = {k: (w, t) for k, w, t in S['lines']}
TEMPO = {'z': 1.2, 'e': 1.1, 's': 1.12, 'b': 1.08, 'm': 1.05, 'j': 1.05, 'r': 1.05, 'p': 1.0}
def load(k):
    who = TEXT[k][0]; o = f'out/v_{k}.wav'
    af = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
    af += ',silenceremove=stop_periods=-1:stop_duration=0.3:stop_threshold=-42dB:stop_silence=0.2'
    af += f',atempo={TEMPO[who]}'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'voice/{k}.mp3', '-af', af, '-ar', str(SR), '-ac', '1', o], check=True)
    a = sf.read(o)[0]; n = int(.012 * SR); a[:n] *= np.linspace(0, 1, n); a[-n:] *= np.linspace(1, 0, n); return a
# word timings on the trimmed clips (cached)
WJ = 'voice/words.json'; WORDS = json.load(open(WJ)) if os.path.exists(WJ) else {}
def words(k, a):
    if k in WORDS: return WORDS[k]
    from faster_whisper import WhisperModel
    global _M
    if '_M' not in globals(): _M = WhisperModel('small', compute_type='int8')
    x = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'out/v_{k}.wav', '-ar', '16000', '-ac', '1', '-f', 'wav', '-'], capture_output=True).stdout
    y = sf.read(io.BytesIO(x), dtype='float32')[0]; pad = .6; y = np.concatenate([np.zeros(int(pad * 16000), 'float32'), y, np.zeros(int(pad * 16000), 'float32')])
    lang = 'ru' if any('а' <= ch <= 'я' for ch in TEXT[k][1].lower()) else 'en'
    segs, _ = _M.transcribe(y, language=lang, word_timestamps=True)
    WORDS[k] = [[round(max(0, w.start - pad), 3), round(max(0, w.end - pad), 3), w.word.strip()] for s in segs for w in s.words]
    json.dump(WORDS, open(WJ, 'w'), ensure_ascii=False, indent=0); return WORDS[k]
def mouthEnv(a, fps=30, win=.035, hyst=1.5):
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
            if 0 < i < n - 1 and db[i] <= db[i - 1] and db[i] <= db[i + 1] and nb.max() - db[i] > 2.5: continue
            env[i] = .3 + .7 * min(1, max(0, (db[i] - thr) / max(1e-6, hi - thr))) ** .8
    return [round(float(v), 3) for v in env]
rng = np.random.default_rng(5)
def tone(f, d, v=.2, shape=lambda x: np.exp(-x * 6)):
    x = np.arange(int(d * SR)) / SR; return v * np.sin(2 * np.pi * f * x) * shape(x / d)
def noise(d, v, smooth=30): n = rng.standard_normal(int(d * SR)); return np.convolve(n, np.ones(smooth) / smooth, 'same') * np.hanning(len(n)) * v
def mixs(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
def whoosh(d, v): n = rng.standard_normal(int(d * SR)); x = np.linspace(0, 1, len(n)); n = np.convolve(n, np.ones(12) / 12, 'same'); return n * np.sin(np.pi * x) ** 2 * v
def applause(d, v):
    out = np.zeros(int(d * SR))
    for k in range(int(d * 90)):
        i = int(rng.uniform(0, d - .05) * SR); c = noise(.03, 1, 3) * rng.uniform(.4, 1); out[i:i + len(c)] += c[:len(out) - i]
    x = np.linspace(0, 1, len(out)); return out * np.minimum(1, x * 6) * np.minimum(1, (1 - x) * 3) * v
def steps(n, v=.25):
    out = np.zeros(int((n * .5 + .2) * SR))
    for k in range(n): i = int(k * .5 * SR); c = mixs(tone(110, .09, v, lambda x: np.exp(-x * 25)), noise(.05, v * .3, 6)); out[i:i + len(c)] += c
    return out
def build(part, lines, plan):
    """plan: dict of extra gaps / events per line id (handled below)"""
    t = 0.; L = []; clips = []; EV = {}; FX = []
    def put(at, a): FX.append((at, a))
    def say(k, gap_after=.25):
        nonlocal t
        a = load(k); W = words(k, a)
        if k == 'r3':   # «Oh sh—» cut at the start of the second word, then a loud cartoon BEEP covers it
            cut = min(W[1][0], W[0][1] + .12) if len(W) > 1 else .35; a = a[:int(cut * SR)]; n = int(.02 * SR); a[-n:] *= np.linspace(1, 0, n)
        L.append({'id': k, 'who': TEXT[k][0], 'text': TEXT[k][1], 'at': round(t, 3), 'end': round(t + len(a) / SR, 3), 'env': mouthEnv(a), 'words': [[round(t + w[0], 3), round(t + w[1], 3), w[2]] for w in W]})
        clips.append((t, a)); t += len(a) / SR
        if k == 'r3': EV['BLEEP'] = [round(t, 3), .5]; put(t, tone(1000, .5, .55, lambda x: np.ones_like(x) * np.minimum(1, (1 - x) * 30))); t += .5
        t += max(gap_after, 1.25 - (t - L[-1]['at']))   # every caption can stay >= 1.2 s
    def wait(d): nonlocal t; t += d
    if part == 1:
        EV['TEASE'] = [[0, 'laptop'], [1.25, 'kale'], [2.5, 'crypto']]; put(.05, whoosh(.3, .12)); put(1.25, whoosh(.3, .12)); put(2.5, whoosh(.3, .12)); put(2.6, mixs(tone(330, .5, .12, lambda x: np.exp(-x * 4)), tone(200, .7, .1, lambda x: np.exp(-x * 3))))
        t = 3.75; EV['OPEN'] = t; put(t - .1, applause(2.2, .35)); put(t - .15, mixs(tone(1046, .7, .08), tone(1318, .7, .06), tone(1568, .9, .05))); wait(.6)
        say('e1', .2); say('z1', .2); EV['BALL'] = t; put(t, tone(1760, .8, .05) + tone(2637, .8, .03)); say('s1', .45)
        EV['CARD'] = t; put(t, whoosh(.3, .1)); wait(.35); say('b1', .35); say('b2', .45); EV['CARDEND'] = t
        say('e2', .2); say('b3', .2); say('z2', .3); EV['REACT1'] = [t, 1.3]; wait(1.3); say('e3', .2); say('b4', .2); say('z3', .3); EV['REACT2'] = [t, 1.3]; wait(1.3)
        EV['TAROT_KING'] = t; say('s2', .25); say('z4', .35)
        say('e4', .2); EV['ENTER_M'] = [t, 5.0]; put(t, mixs(tone(523, .2, .06), tone(659, .25, .05))); put(t + .5, steps(10)); put(t + .3, applause(3.0, .22)); wait(5.15)
        say('m1', .3); EV['LAPTOP'] = L[-1]['at'] + .6; say('z5', .3); EV['REACT3'] = [t, 1.3]; wait(1.3)
        say('e5', .2); say('m2', .25); say('e5b', .3); say('z6', .3); say('s3', .2); say('m3', .2); say('s4', .4)
        EV['SIT_M'] = t - .2; say('e6', .1); EV['KALE_PEEK'] = t; put(t, whoosh(.25, .1)); wait(.9); EV['PART2'] = [t, 1.8]; put(t, mixs(tone(392, .25, .1), tone(523, .4, .08))); wait(1.8)
    else:
        EV['KALE_PEEK'] = 0; wait(.35); say('e7', .2); EV['ENTER_J'] = [t, 5.0]; put(t, mixs(tone(523, .2, .06), tone(659, .25, .05))); put(t + .5, steps(10)); put(t + .3, applause(3.0, .22)); wait(5.15)
        say('j1', .3); say('z7', .3); EV['GIVE_KALE'] = t - .3; say('e8', .2); say('j2', .15); EV['NIBBLE'] = t; [put(t + k * .14, noise(.07, .6, 4)) for k in range(3)]; wait(.6); say('z8', .3); EV['FICUS'] = t; say('s5', .35)
        EV['SIT_J'] = t; EV['ENTER_R'] = [t, 5.0]; put(t, mixs(tone(523, .2, .06), tone(659, .25, .05))); put(t + .5, steps(10)); put(t + .3, applause(3.0, .22)); wait(5.15)
        say('r1', .2); say('e9', .2); say('r2', .25); EV['CRASH'] = t; [put(t + k * .16, tone(1600, .1, .12, lambda x: np.ones_like(x) * (x < .8))) for k in range(3)]; put(t + .5, tone(600, .6, .1, lambda x: 1 - x) + tone(300, .6, .08, lambda x: 1 - x)); wait(.75)
        say('r3', .25); say('r4', .3); say('z9', .3); EV['REACT1'] = [t, 1.3]; wait(1.3); say('s6', .4)
        EV['SIT_R'] = t; say('e10', .2); say('z10', .3); EV['BALL0'] = t; put(t, tone(1760, .6, .05)); say('s7', .4)
        say('e11', .15); EV['DRUM'] = [t, 1.3]; put(t, noise(1.2, .25, 2) * (np.sin(np.arange(int(1.2 * SR)) / SR * 2 * np.pi * 14) > 0)); put(t + 1.2, tone(120, .25, .3)); wait(1.4)
        say('b5', .35); say('m4', .25); say('j3', .25); say('r5', .2); EV['SILENCE1'] = [t, 1.0]; wait(1.0)
        say('z11', .0); EV['COLD'] = [t, 1.5]; wait(1.5); EV['RUSTLE'] = t - .1; put(t - .1, noise(.4, .3, 3)); say('p1', .35)
        EV['TURN_B'] = t - .2; EV['TAROT_MARRIED'] = t; say('s8', .3); EV['HORROR'] = t; say('z12', .4); say('e12', .4)
        EV['END'] = t; put(t, tone(1046, 1.2, .1) + tone(1568, 1.2, .06)); wait(5.5)
    TOTAL = round(t, 3); EV['TOTAL'] = TOTAL
    voice = np.zeros(int(TOTAL * SR) + SR); fx = np.zeros_like(voice)
    for at, a in clips: i = int(at * SR); voice[i:i + len(a)] += a * (.8 if False else 1)
    for at, a in FX: i = int(at * SR); fx[i:i + len(a)] += a[:len(fx) - i]
    mix = voice + fx; mix = mix[:int(TOTAL * SR)]; mix = mix / max(1e-6, np.abs(mix).max()) * .89
    sf.write(f'out/audio{part}_raw.wav', mix, SR)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'out/audio{part}_raw.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '44100', f'out/audio{part}.wav'], check=True)
    json.dump({'L': L, **EV}, open(f'timeline{part}.json', 'w'), ensure_ascii=False)
    print('part', part, 'TOTAL', TOTAL); [print(' ', l['id'], l['at'], l['end']) for l in L]
build(1, S['part1'], {}); build(2, S['part2'], {})
