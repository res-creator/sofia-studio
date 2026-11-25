# «Давай замуж!» ep1 v2 (живой сценарий): trims voices, performance post-processing (whisper / shout / tears / chorus), word timings,
# mouth envelopes, both part timelines with edit + acting events, studio-audience sound bed (crowd voices layered from Fish Audio,
# procedural applause / drum roll / clock / paper / crunch / beep / lyrical underscore), ducked under dialogue.
# python3 prep.py  ->  timeline1.json, timeline2.json, out/audio1.wav, out/audio2.wav
import json, subprocess, numpy as np, soundfile as sf, os, io, glob
import loud, music
from scipy.signal import butter, sosfilt, lfilter
from scipy.linalg import solve_toeplitz
S = json.load(open('voice/script.json')); SR = 44100; os.makedirs('out', exist_ok=True)
LN = {l[0]: (l[1], l[2], l[3] if len(l) > 3 else '') for l in S['lines']}
MASTER_LUFS = -15.
LINE_LUFS, SOFT_DB, MUSIC_LUFS, MUSIC_DUCK = -16., -5., -32.2, 4.   # music: owner approved the bed, asked for it quieter: about -29 LUFS in pauses / -33 under speech in the FINAL file (after the ~+4 dB master gain)   # every dialogue line is normalised to the same voiced loudness; soft lines sit 5 dB lower
TEMPO = {'z': 1.2, 'e': 1.1, 's': 1.12, 'b': 1.08, 'm': 1.05, 'j': 1.05, 'r': 1.05, 'p': 1.0}
rng = np.random.default_rng(11)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def norm(a, peak=.9): return a / max(1e-9, np.abs(a).max()) * peak
# ---------- performance processing ----------
def soft(a):
    """Soft, intimate 'whisper' (owner: no vocoder, no noise): the normal voice, gently compressed, a little warmer and less bright.
    Its level is set later (-5 dB vs. the other lines)."""
    k = int(.03 * SR); env = np.sqrt(np.convolve(a ** 2, np.ones(k) / k, 'same')) + 1e-6; ref = np.percentile(env[env > env.max() * .05], 70)
    g = np.where(env > ref, (env / ref) ** (1 / 2.2 - 1), 1.0); g = np.convolve(g, np.ones(k) / k, 'same'); a = a * g   # ~2.2:1 above the speech level
    a = a - .4 * hp(a, 4500, 2) + .12 * bp(a, 160, 420)   # softer top (about -4 dB above 5 kHz), a touch of close-mic warmth
    return a
def shout(a):
    a = np.tanh(a / max(1e-9, np.abs(a).max()) * 2.6); a = a + .6 * bp(a, 1800, 4200); return norm(a, .98)
def tears(a):
    t = np.arange(len(a)) / SR; trem = 1 - .28 * (.5 + .5 * np.sin(2 * np.pi * 6.5 * t + rng.uniform(0, 6)))   # trembling voice
    d = (.0018 * np.sin(2 * np.pi * 5.5 * t) * SR).astype(int); idx = np.clip(np.arange(len(a)) + d, 0, len(a) - 1); return norm(a[idx] * trem, .8)   # pitch wobble
def sob(v=.5):
    out = np.zeros(int(1.3 * SR))
    for k, (at, d, f) in enumerate([(0, .16, 900), (.22, .14, 1100), (.42, .35, 700)]):   # gasp-gasp-shudder
        n = int(d * SR); x = bp(rng.standard_normal(n), f * .6, f * 2.2) * np.sin(np.linspace(0, np.pi, n)) ** 1.5
        x += .3 * np.sin(2 * np.pi * (330 + 120 * k) * np.arange(n) / SR) * np.sin(np.linspace(0, np.pi, n)) ** 2; i = int(at * SR); out[i:i + n] += x
    return norm(out, v)
def load(k):
    who, _, st = LN[k]; o = f'out/v_{k}.wav'
    af = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
    af += ',silenceremove=stop_periods=-1:stop_duration=0.3:stop_threshold=-42dB:stop_silence=0.2' + f',atempo={TEMPO[who] * (.94 if st == "w" else 1):.4f}'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'voice/{k}.mp3', '-af', af, '-ar', str(SR), '-ac', '1', o], check=True)
    a = sf.read(o)[0]
    if st == 'w': a = soft(a)
    elif st == 's': a = shout(a)
    elif st == 'c': a = tears(a)
    n = int(.012 * SR); a[:n] *= np.linspace(0, 1, n); a[-n:] *= np.linspace(1, 0, n); sf.write(o, a, SR); return a
WJ = 'voice/words.json'; WORDS = json.load(open(WJ)) if os.path.exists(WJ) else {}
def words(k):
    key = k + ':' + LN[k][1]
    if key in WORDS: return WORDS[key]
    from faster_whisper import WhisperModel
    global _M
    if '_M' not in globals(): _M = WhisperModel('small', compute_type='int8')
    y = sf.read(io.BytesIO(subprocess.run(['ffmpeg', '-v', 'error', '-i', f'out/v_{k}.wav', '-ar', '16000', '-ac', '1', '-f', 'wav', '-'], capture_output=True).stdout), dtype='float32')[0]
    pad = .6; y = np.concatenate([np.zeros(int(pad * 16000), 'float32'), y, np.zeros(int(pad * 16000), 'float32')])
    lang = 'ru' if any('а' <= ch <= 'я' for ch in LN[k][1].lower()) else 'en'
    segs, _ = _M.transcribe(y, language=lang, word_timestamps=True)
    WORDS[key] = [[round(max(0, w.start - pad), 3), round(max(0, w.end - pad), 3), w.word.strip()] for s in segs for w in s.words]
    json.dump(WORDS, open(WJ, 'w'), ensure_ascii=False, indent=0); return WORDS[key]
def mouthEnv(a, fps=30, win=.035, hyst=1.5):
    n = int(len(a) / SR * fps) + 1; w = int(win * SR); db = np.empty(n)
    for i in range(n):
        c = int((i + .5) * SR / fps); seg = a[max(0, c - w // 2): c + w // 2]; db[i] = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-6) if len(seg) else -120
    lo, hi = np.percentile(db, 12), np.percentile(db, 96); thr = lo + .5 * (hi - lo); env = np.zeros(n); op = False
    for i in range(n):
        op = db[i] > thr + hyst if not op else db[i] > thr - hyst
        if op:
            nb = db[max(0, i - 2): i + 3]
            if 0 < i < n - 1 and db[i] <= db[i - 1] and db[i] <= db[i + 1] and nb.max() - db[i] > 2.5: continue
            env[i] = .3 + .7 * min(1, max(0, (db[i] - thr) / max(1e-6, hi - thr))) ** .8
    return [round(float(v), 3) for v in env]
# ---------- sound bed ----------
def mixs(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
def tone(f, d, v=.2, shape=lambda x: np.exp(-x * 6)): x = np.arange(int(d * SR)) / SR; return v * np.sin(2 * np.pi * f * x) * shape(x / d)
def noise(d, v, smooth=30): n = rng.standard_normal(int(d * SR)); return np.convolve(n, np.ones(smooth) / smooth, 'same') * np.hanning(len(n)) * v
REV = np.exp(-np.arange(int(.9 * SR)) / SR * 6) * rng.standard_normal(int(.9 * SR)) * .06; REV[0] = 1
def room(x, wet=.35): y = np.convolve(x, REV)[:len(x) + int(.6 * SR)]; y = np.r_[x, np.zeros(len(y) - len(x))] * (1 - wet) + y * wet; return y
def applause(d, v=.5):
    out = np.zeros(int(d * SR))
    for k in range(int(d * 260)):
        i = int(rng.uniform(0, d - .03) * SR); n = int(.012 * SR); c = bp(rng.standard_normal(n), rng.uniform(900, 1600), rng.uniform(3000, 6500)) * np.exp(-np.arange(n) / n * 5) * rng.uniform(.3, 1); out[i:i + n] += c
    x = np.linspace(0, 1, len(out)); out *= np.minimum(1, x * 5) * np.minimum(1, (1 - x) * 2.2); return norm(room(out, .4), v)
CROWD = {k: [sf.read(io.BytesIO(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ar', str(SR), '-ac', '1', '-f', 'wav', '-'], capture_output=True).stdout))[0] for f in sorted(glob.glob(f'sfx/crowd/{k}_*.mp3'))] for k in ('laugh', 'aww', 'ooh', 'boo')}
def crowd(kind, n=7, v=.5, dur=None):
    parts = []; take = CROWD[kind][:n]
    for a in take:
        a = a.copy(); s = int(rng.uniform(0, .25) * SR); g = rng.uniform(.5, 1); parts.append(np.r_[np.zeros(s), a * g])
    x = mixs(*parts); x = lp(x, 6500); x = room(x, .5)
    if dur: x = x[:int(dur * SR)]; f = min(len(x), int(.4 * SR)); x[-f:] *= np.linspace(1, 0, f)
    return norm(x, v)
def whistle(v=.4): t = np.arange(int(1.0 * SR)) / SR; f = 1800 + 900 * np.minimum(1, t / .25) - 1400 * np.maximum(0, t - .45) * 1.6; return norm(room(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * np.minimum(1, t / 1.0)) ** .6, .3), v)
def drumroll(d=1.6, v=.5):
    out = np.zeros(int((d + 1.2) * SR))
    for k in range(int(d * 22)):
        i = int(k / 22 * SR); n = int(.05 * SR); c = bp(rng.standard_normal(n), 1500, 6000) * np.exp(-np.arange(n) / n * 6) * (.4 + .6 * k / (d * 22)); out[i:i + n] += c
    i = int(d * SR); n = int(1.1 * SR); out[i:i + n] += hp(rng.standard_normal(n), 3000) * np.exp(-np.arange(n) / SR * 3) * 1.2 + tone(90, 1.1, .8, lambda x: np.exp(-x * 5))
    return norm(room(out, .3), v)
def clock(d=2, v=.35):
    out = np.zeros(int(d * SR))
    for k in range(int(d * 2)): i = int(k * .5 * SR); n = int(.03 * SR); c = bp(rng.standard_normal(n), 2500, 7000) * np.exp(-np.arange(n) / n * 8) * (1 if k % 2 else .7); out[i:i + n] += c
    return norm(out, v)
def paper(v=.4): return norm(mixs(*[np.r_[np.zeros(int(k * .09 * SR)), hp(noise(.12, 1, 2), 2500)] for k in range(6)]), v)
def crunch(v=.6): return norm(mixs(*[np.r_[np.zeros(int(k * .13 * SR)), bp(noise(.07, 1, 3), 800, 5000)] for k in range(3)]), v)
def slap(v=.6): n = int(.08 * SR); return norm(bp(rng.standard_normal(n), 600, 4000) * np.exp(-np.arange(n) / n * 9) + tone(180, .08, .5, lambda x: np.exp(-x * 20)), v)
def underscore(d, v=.22):
    t = np.arange(int(d * SR)) / SR; chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]; out = np.zeros(len(t)); seg = d / 4
    for i, ch in enumerate(chords):
        a, b = int(i * seg * SR), int((i + 1) * seg * SR); tt = t[a:b] - t[a]
        for m in ch:
            f = 440 * 2 ** ((m - 69) / 12); out[a:b] += (np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt)) * np.minimum(1, tt / .8) * np.minimum(1, (seg - tt) / .8) * .2
        for k, m in enumerate(ch + [ch[1] + 12]):   # soft piano-like arpeggio
            f = 440 * 2 ** ((m - 69 + 12) / 12); s0 = a + int(k * seg / 4 * SR); n = min(int(1.6 * SR), len(t) - s0); out[s0:s0 + n] += np.sin(2 * np.pi * f * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * 2.5) * .35
    out = lp(out, 3000); x = np.linspace(0, 1, len(out)); out *= np.minimum(1, x * 8) * np.minimum(1, (1 - x) * 6); return norm(room(out, .4), v)
def jingle(v=.45):
    out = np.zeros(int(2.6 * SR))
    for k, (m, at, d) in enumerate([(72, 0, .18), (76, .18, .18), (79, .36, .18), (84, .54, .9), (79, .54, .9), (76, .54, .9)]):
        f = 440 * 2 ** ((m - 69) / 12); n = int(d * SR); x = np.arange(n) / SR; s = sum(np.sin(2 * np.pi * f * h * x) / h for h in (1, 2, 3, 4)) * np.exp(-x * 2.5); i = int(at * SR); out[i:i + n] += s * .3
    return norm(room(out, .3), v)
def whoosh(d, v): n = rng.standard_normal(int(d * SR)); x = np.linspace(0, 1, len(n)); n = np.convolve(n, np.ones(12) / 12, 'same'); return n * np.sin(np.pi * x) ** 2 * v
def steps(n, v=.2, dt=.5):
    out = np.zeros(int((n * dt + .2) * SR))
    for k in range(n): i = int(k * dt * SR); c = mixs(tone(110, .09, v, lambda x: np.exp(-x * 25)), noise(.05, v * .3, 6)); out[i:i + len(c)] += c
    return out
# ---------- stock SFX (myinstants, approved by the owner; cleaned copies in sfx/clean) replace the synthesized crowd/foley ----------
STOCK = {k: sf.read(f'sfx/clean/{k}.wav')[0] for k in ('applause_short', 'applause_long', 'laugh_light', 'laugh_big', 'aww', 'ooh', 'boo', 'cheer_whistle', 'drumroll', 'clock', 'newspaper', 'crunch', 'beep', 'slap', 'news_sting', 'chime', 'phone')}
def clip(name, d=None, v=.5, tail=False, fade_in=.03, fade_out=.35):
    x = STOCK[name].copy()
    if d is not None and len(x) > int(d * SR): x = x[-int(d * SR):] if tail else x[:int(d * SR)]
    n = min(len(x), int(fade_in * SR)); x[:n] *= np.linspace(0, 1, n); n = min(len(x), int(fade_out * SR)); x[-n:] *= np.linspace(1, 0, n)
    return norm(x, v)
def applause(d, v=.5): return clip('applause_short' if d <= 2.4 else 'applause_long', d, v)
def crowd(kind, n=7, v=.5, dur=None): return clip({'laugh': 'laugh_light' if n <= 5 else 'laugh_big', 'aww': 'aww', 'ooh': 'ooh', 'boo': 'boo'}[kind], dur, v)
def whistle(v=.4): return clip('cheer_whistle', 3.2, v)
def drumroll(d=1.6, v=.5): return clip('drumroll', d + 1.2, v, tail=True, fade_out=.6)   # roll + cymbal crash at the end
def clock(d=2, v=.35): return clip('clock', d, v)
def paper(v=.4): return clip('newspaper', 1.2, v)
def crunch(v=.6): return clip('crunch', 1.0, v)
def slap(v=.6): return clip('slap', None, v, fade_out=.05)
def beep_loop(d, v=.55): b = STOCK['beep']; x = np.tile(b, int(np.ceil(d * SR / len(b))))[:int(d * SR)]; return norm(x, v)
# ---------- timeline ----------
def build(part):
    t = 0.; L = []; VO = []; CR = []; FXL = []; EV = {}
    def put(at, a, bus='fx'): (CR if bus == 'crowd' else FXL).append((at, a))
    def say(k, gap=.25, at=None, gdb=0.):
        nonlocal t
        a = load(k); W = words(k); t0 = t if at is None else at
        if k == 'r3': cut = min(W[1][0], W[0][1] + .12) if len(W) > 1 else .35; a = a[:int(cut * SR)]; n = int(.02 * SR); a[-n:] *= np.linspace(1, 0, n)
        L.append({'id': k, 'who': LN[k][0], 'text': LN[k][1], 'st': LN[k][2], 'at': round(t0, 3), 'end': round(t0 + len(a) / SR, 3), 'env': mouthEnv(a), 'words': [[round(t0 + w[0], 3), round(t0 + w[1], 3), w[2]] for w in W]})
        tg = LINE_LUFS + (SOFT_DB if LN[k][2] == 'w' else 0.) + gdb   # shouts: same loudness, brightness comes from shout()
        for _ in range(3): a = loud.limit(loud.to_lufs(a, SR, tg), SR, ceil_db=-7.0, w=.004, release=.03)   # tame peaky voices (Майк) so the master limiter leaves dialogue alone
        a = loud.to_lufs(a, SR, tg)
        VO.append((t0, a, k))
        if k in ('s3', 's5', 's6', 's9', 's11'): put(t0 - .35, clip('chime', 2.0, .3), 'crowd')
        if at is None:
            t += len(a) / SR
            if k == 'r3': EV['BLEEP'] = [round(t, 3), .5]; put(t, beep_loop(.5)); put(t - .3, clip('news_sting', 3.0, .4), 'crowd'); t += .5
            t += max(gap, 1.25 - (t - L[-1]['at']))
    def chorus(keys, gap=.3):   # several voices at once
        nonlocal t
        t0 = t; e = t0
        for j, k in enumerate(keys): say(k, at=t0 + j * .04, gdb=-10 * np.log10(len(keys))); e = max(e, L[-1]['end'])   # the chorus as a whole sits at the line level
        t = e + max(gap, 1.25 - (e - t0))
    def react(kind, at, d, v=.5, n=7):   # audience reaction, sits in a pause (the dialogue waits for it)
        put(at, crowd(kind, n, v, d), 'crowd')
    def wait(d): nonlocal t; t += d
    if part == 1:
        EV['TEASE'] = [0, 1.25, 2.5]; [put(x, whoosh(.3, .12)) for x in (.05, 1.25, 2.5)]; put(.1, jingle(.4))
        t = 3.75; EV['OPEN'] = t; wait(.4); say('e1', .15); say('z1', .2); put(t - .1, applause(2.0, .45), 'crowd'); EV['AP1'] = t; wait(1.6)
        say('e2', .2); say('z2', .25); say('s1', .3); EV['OY'] = t; chorus(['oy_e', 'oy_z'], .15); react('laugh', t, 2.0, .45, 5); EV['L_OY'] = t; wait(1.6)
        EV['DIM'] = t; put(t, underscore(30, .2), 'crowd'); wait(.6); say('e3', .35); say('e4', .3); react('aww', t, 1.8, .4, 5); wait(1.5); say('e5', .3)
        say('z3', .15); say('s2', .3); EV['DIMEND'] = t
        EV['CARD'] = t; put(t, whoosh(.3, .1)); wait(.3); say('b1', .35); say('b2', .25); put(t, sob(.45)); EV['SOB1'] = t; wait(1.1); say('b3', .2); EV['PHOTO'] = L[-1]['at']; react('aww', t, 1.8, .45, 6); wait(1.4); EV['CARDEND'] = t
        say('z4', .3); say('e6', .1); EV['ENTER_B'] = [t, 4.6]; put(t, applause(4.4, .5), 'crowd'); put(t + .5, steps(8)); wait(4.8)
        say('e7', .2); say('b4', .2); EV['LEAN_AWAY'] = t; say('z5', .2); react('laugh', t, 1.8, .45, 5); wait(1.3); EV['SLAP'] = t + .1; put(t + .1, slap(.3)); say('e8', .15); say('z6', .3)
        say('e9', .2); say('b5', .2); say('z7', .2); EV['CARDLAUGH'] = t; react('laugh', t, 1.5, .4, 4); say('e10', .3)
        say('s3', .2); EV['TAROT_KING'] = L[-1]['at'] + (L[-1]['end'] - L[-1]['at']) * .72; react('ooh', t, 1.6, .45, 6); wait(1.3); say('z8', .2); react('laugh', t, 2.4, .55, 7); wait(1.8); say('s4', .2); say('z9', .3)
        say('e11', .1); EV['ENTER_M'] = [t, 5.0]; put(t, applause(4.4, .5), 'crowd'); put(t + .5, steps(9)); wait(5.15)
        say('z10', .1); say('e12', .1); say('z11', .3); say('m1', .3); EV['LAPTOP'] = L[-1]['at'] + .5; say('z12', .2); react('laugh', t, 1.8, .5, 6); wait(1.3); say('m2', .3)
        say('e13', .2); say('m3', .2); EV['INTERRO'] = t; put(t, tone(60, .5, .3)); wait(.4); say('e14', .3); EV['GULP'] = t; wait(.4); say('m4', .2); EV['INTERRO_END'] = t; say('z13', .2); react('laugh', t, 1.8, .5, 6); wait(1.3)
        say('s5', .2); say('m5', .2); say('s6', .1); say('z14', .2); say('s7', .2); say('z15', .2); react('laugh', t, 1.8, .45, 5); wait(1.4)
        EV['SMOKE'] = t; say('e15', .1); react('ooh', t, 1.6, .45, 6); EV['KALE_PEEK'] = t; wait(1.0); EV['PART2'] = [t, 1.8]; put(t, mixs(tone(392, .25, .1), tone(523, .4, .08))); wait(1.8)
    else:
        EV['KALE_PEEK'] = 0; wait(.35); say('e16', .2)
        EV['ENTER_J'] = [t, 5.0]; put(t, applause(4.4, .5), 'crowd'); put(t + .5, steps(9)); wait(5.15)
        say('j1', .3); EV['GIVE_KALE'] = t; say('b6', .2); say('z16', .2); react('laugh', t, 1.8, .5, 6); wait(1.3); say('e17', .2); say('j2', .15)
        EV['NIBBLE'] = t; put(t, crunch(.6)); wait(.75); say('e18', .15); react('boo', t, 1.6, .5, 6); react('laugh', t + .9, 1.6, .45, 5); wait(1.9); EV['DESKLAUGH'] = t; say('z17', .2); EV['FICUS'] = t; say('s8', .4)
        EV['ENTER_R'] = [t, 5.0]; put(t, applause(4.4, .5), 'crowd'); put(t + .5, steps(9)); wait(5.15)
        say('r1', .15); react('ooh', t, 1.6, .5, 6); put(t + .5, whistle(.35), 'crowd'); wait(1.4); EV['HAIR'] = t; say('z18', .2); say('e19', .15); say('z19', .25); say('e20', .2); say('r2', .25)
        EV['CRASH'] = t; put(t, clip('phone', 1.2, .4)); put(t + .5, mixs(tone(600, .6, .1, lambda x: 1 - x), tone(300, .6, .08, lambda x: 1 - x))); wait(.85)
        say('r3', .25); react('laugh', t - .15, 1.8, .5, 6); wait(1.2); say('r4', .3); EV['LEAN_BACK'] = t; say('z20', .2); react('laugh', t, 2.4, .6, 7); wait(1.9)
        say('s9', .3); say('e21', .2); say('s10', .2); EV['GLANCE'] = [t, 1.6]; wait(1.6)
        say('e22', .2); say('z21', .2); EV['POINT_G'] = t; say('z22', .2); react('laugh', t, 1.8, .5, 6); wait(1.2); EV['HEY'] = t; chorus(['hey_m', 'hey_j', 'hey_r'], .3)
        EV['BALL0'] = t; say('s11', .2); put(t, crowd('boo', 3, .3, 1.4), 'crowd'); EV['GROOM_BOO'] = t; wait(1.4)
        EV['STAND_E'] = t; say('e23', .15); EV['DRUM'] = [t, 1.8]; put(t, drumroll(1.6, .5)); wait(2.6)
        say('b7', .35); say('m6', .25); say('j3', .25); say('r5', .2); EV['CRY'] = [t, 2.4]; put(t + .2, sob(.5)); put(t + 1.1, sob(.4)); wait(2.4)
        EV['COLD'] = [t, 2.0]; put(t, clock(2.0, .35)); wait(2.0); say('z23', .2); EV['TURN_Z'] = t; say('z24', .25)
        EV['RUSTLE'] = t; put(t, paper(.45)); wait(.5); say('p1', .3); react('laugh', t, 2.6, .65, 7); put(t, applause(2.6, .45), 'crowd'); wait(2.2)
        EV['PEEK_B'] = t; say('b8', .3); EV['TAROT_MARRIED'] = t; say('s12', .3); EV['HORROR'] = t; say('z25', .2); react('laugh', t, 2.0, .55, 7); put(t, applause(2.0, .4), 'crowd'); wait(1.7)
        say('e24', .25); EV['WINK'] = t; say('z26', .25); say('e25', .2); say('z27', .3); say('z28', .2); put(t, applause(3.0, .5), 'crowd')
        EV['END'] = t; put(t, mixs(tone(1046, 1.2, .1), tone(1568, 1.2, .06))); wait(5.5)
    TOTAL = round(t, 3); EV['TOTAL'] = TOTAL; N = int(TOTAL * SR)
    voice = np.zeros(N + SR); bed = np.zeros_like(voice); fx = np.zeros_like(voice)
    for at, a, _ in VO: i = int(at * SR); voice[i:i + len(a)] += a[:len(voice) - i]
    for at, a in CR: i = int(at * SR); bed[i:i + len(a)] += a[:len(bed) - i]
    for at, a in FXL: i = int(at * SR); fx[i:i + len(a)] += a[:len(fx) - i]
    # duck the audience bed under the dialogue (never covers words)
    e = np.abs(voice); k = int(.12 * SR); e = np.convolve(e, np.ones(k) / k, 'same'); talk = e > .01; duck = np.where(talk, .28, 1.0); k2 = int(.18 * SR); duck = np.convolve(duck, np.ones(k2) / k2, 'same')
    # background music: original bed (music.py), -33 LUFS alone before the master gain; 4 dB smooth sidechain duck under voices
    m = music.bed(TOTAL + 1)[:len(voice)]; m = np.pad(m, (0, len(voice) - len(m))); m = m * 10 ** ((MUSIC_LUFS - loud.integrated_lufs(m, SR)) / 20)
    md = np.where(talk, 10 ** (-MUSIC_DUCK / 20), 1.0); att, rel = np.exp(-1 / (.08 * SR)), np.exp(-1 / (.35 * SR)); mdd = md.copy(); g0 = 1.
    for i0 in range(0, len(md), 256):   # attack/release smoothing on 256-sample steps
        tgt = md[i0]; c = att if tgt < g0 else rel; g0 = tgt + (g0 - tgt) * c ** 256; mdd[i0:i0 + 256] = g0
    mdd = np.convolve(mdd, np.ones(512) / 512, 'same')
    menv = np.ones(len(voice)); tt = np.arange(len(voice)) / SR
    def off(a0, a1, fo=.6, fi=1.2):   # music out between a0 and a1 (fade out before, fade in after)
        menv[:] = np.minimum(menv, np.clip(np.maximum((a0 - tt) / fo, (tt - a1) / fi), 0, 1))
    if part == 1:
        off(-1, EV['OPEN'] - .3, .01, 1.5)                              # after the opening jingle
        off(EV['DIM'], EV['DIM'] + 29.5, .8, 1.5)                       # our romantic underscore under the bride intro / video card
        off(EV['INTERRO'], EV['INTERRO_END'], .5, 1.0)                  # interrogation lamp: cold
    else:
        p1 = next(l for l in L if l['id'] == 'p1'); off(EV['COLD'][0], p1['end'] + .2, .6, 1.0)   # cold silences before «Угу»
    off(TOTAL - 1.8, TOTAL + 5, 1.8, 1)
    mus = m * mdd * menv
    # equal loudness IN THE MIX: measure every line (or chorus) over dialogue + audience bed + music, correct its gain, repeat
    GROUPS = []
    for l in sorted(L, key=lambda l: l['at']):
        if GROUPS and l['at'] < max(x['end'] for x in GROUPS[-1]) - .05: GROUPS[-1].append(l)
        else: GROUPS.append([l])
    GAIN = {l['id']: 1.0 for l in L}; under = bed * duck * .85 + mus
    for it in range(5):
        voice = np.zeros_like(bed)
        for at, a, k in VO: i = int(at * SR); voice[i:i + len(a)] += a[:len(voice) - i] * GAIN[k]
        pre = voice + under + fx; gm = MASTER_LUFS - loud.integrated_lufs(pre[:N], SR)   # measure every line in the MASTERED mix (gain + limiter)
        lg = loud.limit(pre[:N] * 10 ** (gm / 20), SR, gain_only=True); nofx = (voice + under)[:N] * lg   # the limiter reacts to the full mix (incl. foley)
        for ls in GROUPS:
            a0, a1 = min(l['at'] for l in ls), max(l['end'] for l in ls); tgt = LINE_LUFS + (SOFT_DB if any(l['st'] == 'w' for l in ls) else 0.)
            d = np.clip(tgt - loud.voiced_lufs(nofx[int(a0 * SR):int(a1 * SR)], SR), -3, 3)
            for l in ls: GAIN[l['id']] *= 10 ** (d / 20)
    mix = voice + bed * duck * .85 + fx + mus; mix = mix[:N]
    sf.write(f'out/audio{part}_raw.wav', mix, SR)
    # master: ONE linear gain to -15 LUFS integrated (keeps the equal line balance), then a 4x-oversampled limiter for true peak <= -1.5 dBTP
    gain_db = MASTER_LUFS - loud.integrated_lufs(mix, SR)
    for it in range(4):
        sf.write(f'out/audio{part}_raw.wav', loud.limit(mix * 10 ** (gain_db / 20), SR), SR, subtype='FLOAT')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'out/audio{part}_raw.wav', '-af', 'aresample=176400,alimiter=limit=0.813:attack=1:release=50:level=disabled,aresample=44100', '-ar', '44100', f'out/audio{part}.wav'], check=True)
        got = loud.integrated_lufs(sf.read(f'out/audio{part}.wav')[0], SR)
        if abs(got - MASTER_LUFS) < .1: break
        gain_db += MASTER_LUFS - got   # the limiter shaves a little: nudge the linear gain and redo
    print('part', part, 'master gain', round(gain_db, 2), 'dB ->', round(got, 2), 'LUFS')
    fin = sf.read(f'out/audio{part}.wav')[0]; R = {}
    for ls in GROUPS:
        a0, a1 = min(l['at'] for l in ls), max(l['end'] for l in ls); nm = '+'.join(l['id'] for l in ls)
        R[nm] = {'lufs': round(loud.voiced_lufs(nofx[int(a0 * SR):int(a1 * SR)], SR) + gain_db, 2), 'full_mix': round(loud.voiced_lufs(fin[int(a0 * SR):int(a1 * SR)], SR), 2), 'soft': any(l['st'] == 'w' for l in ls), 'who': ls[0]['who']}
    sp = tt[:N][talk[:N]]; ml = loud.voiced_lufs(mus[:N][talk[:N]], SR, gate=40) if len(sp) else None
    R['_music_under_dialogue_lufs'] = round(ml + gain_db, 2); R['_music_in_pauses_lufs'] = round(MUSIC_LUFS + gain_db, 2); R['_master_gain_db'] = round(gain_db, 2); R['_mix_integrated_lufs'] = round(loud.integrated_lufs(fin, SR), 2)
    json.dump(R, open(f'out/loudness{part}.json', 'w'), ensure_ascii=False, indent=1)
    sf.write(f'out/music{part}.wav', mus[:N], SR)
    json.dump({'L': L, **EV}, open(f'timeline{part}.json', 'w'), ensure_ascii=False)
    print('part', part, 'TOTAL', TOTAL, 'lines', len(L))
build(1); build(2)
