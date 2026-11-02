# Demo soundtrack v2.
# - narration with a 1.6 s gap of dead air after "...not one of them sounded." (words after it are shifted -> vo/hook_timed.words.json)
# - score with real mid-range content (pad 200 Hz-2 kHz), stereo; a low pulse; fire roar only during fire beats;
#   a distant siren wail under "They exist for moments exactly like this", then TOTAL silence; a boom on "sounded".
import json, re, subprocess, wave, numpy as np
SR = 44100; GAP = 1.6
W = json.load(open('vo/hook.words.json'))
n = lambda x: re.sub(r"[^a-z0-9:]", '', x.lower())
def cue0(line, w, nth=0): return [x for x in W if x['line'] == line and n(x['w']).startswith(n(w))][nth]['s']
cut_at = [x for x in W if x['line'] == 'h08'][-1]['e'] + 0.05  # end of "sounded."
TW = [dict(x, s=round(x['s'] + (GAP if x['s'] > cut_at else 0), 3), e=round(x['e'] + (GAP if x['s'] > cut_at else 0), 3)) for x in W]
json.dump(TW, open('vo/hook_timed.words.json', 'w'), indent=0)
def cue(line, w, nth=0): return [x for x in TW if x['line'] == line and n(x['w']).startswith(n(w))][nth]['s']
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'vo/hook.mp3', '-ac', '1', '-ar', str(SR), '/tmp/claude-0/hook.wav'], check=True)
with wave.open('/tmp/claude-0/hook.wav') as f: vo = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
ci = int(cut_at * SR); vo = np.concatenate([vo[:ci], np.zeros(int(GAP * SR), np.float32), vo[ci:]])
end_vo = TW[-1]['e']; DUR = end_vo + 2.4; N = int(DUR * SR); t = np.arange(N) / SR
v = np.zeros(N, np.float32); v[:min(N, len(vo))] = vo[:N]
rng = np.random.default_rng(5)
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s = a * s + (1 - a) * x[i]; y[i] = s
    return y
def env_between(a, b, fade=0.6):
    e = np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1); return e.astype(np.float32)
s_not = cue('h08', 'not'); s_sounded = cue('h08', 'sounded'); s_title = cue('h14', 'Lahaina')
quiet0, quiet1 = s_not - 0.35, cut_at + GAP - 0.1
# pad: D minor -> Bb -> F -> C voicings, saw-ish (odd+even harmonics), filtered ~1.6 kHz, L/R detuned
chords = [(146.8, 174.6, 220.0, 293.7), (116.5, 146.8, 174.6, 233.1), (174.6, 220.0, 261.6, 349.2), (130.8, 164.8, 196.0, 261.6)]
padL = np.zeros(N, np.float32); padR = np.zeros(N, np.float32); seg = 6.0
for ci_, start in enumerate(np.arange(0, DUR, seg)):
    fr = chords[ci_ % 4]; a, b = int(start * SR), min(N, int((start + seg + 1.5) * SR)); tt = t[a:b] - start
    e = np.clip(tt / 1.5, 0, 1) * np.clip((seg + 1.5 - tt) / 1.5, 0, 1)
    for f in fr:
        for side, det in ((padL, 0.997), (padR, 1.003)):
            y = sum(np.sin(2 * np.pi * f * det * h * tt + h) / h for h in (1, 2, 3, 4, 5)) * e
            side[a:b] += (y * 0.12).astype(np.float32)
padL = lp(padL, 1600); padR = lp(padR, 1600)
# pulse (low + a mid click so it reads on phones)
pulse = np.zeros(N, np.float32); tt0 = 1.0
while tt0 < DUR - 0.5:
    if not (quiet0 < tt0 < quiet1) and tt0 < s_title - 0.3:
        i = int(tt0 * SR); x = np.arange(min(int(0.4 * SR), N - i)) / SR
        pulse[i:i + len(x)] += (np.sin(2 * np.pi * 55 * x) * np.exp(-x / 0.1) + 0.25 * np.sin(2 * np.pi * 440 * x) * np.exp(-x / 0.02)).astype(np.float32)
    tt0 += 1.2 if tt0 < cue('h05', 'That') else 0.92 if tt0 < s_not else 0.8
# fire roar: band-limited noise (250 Hz - 1.4 kHz), only while the fire is "live" on screen
noise = rng.standard_normal(N).astype(np.float32); roar = lp(noise, 1400) - lp(noise, 250)
roar *= (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 0.7 * t))).astype(np.float32)
roar_env = env_between(cue('h04', 'back') - 0.2, cue('h06', 'enters') + 2.5, 0.8) + env_between(cue('h09', 'By') - 0.1, cue('h09', 'Coast'), 0.8)
roar = roar / (np.abs(roar).max() + 1e-9) * roar_env
# distant siren wail (what should have happened), then silence
sa, sb = cue('h07', 'They') - 0.3, quiet0
x = t - sa; f = 640 + 360 * np.sin(2 * np.pi * x / 3.2 - np.pi / 2) ** 2
siren = np.sin(2 * np.pi * np.cumsum(f) / SR).astype(np.float32) * env_between(sa, sb, 0.7)
siren = lp(siren, 2200) * 0.35
# riser + booms
ri = np.zeros(N, np.float32); a, b = int((s_title - 3.5) * SR), int(s_title * SR); xx = np.arange(b - a) / SR
ri[a:b] = (np.sin(2 * np.pi * (180 + 520 * (xx / xx[-1]) ** 2) * xx) * (xx / xx[-1]) ** 2 * 0.18).astype(np.float32)
def boom(at, g):
    i = int(at * SR); x = np.arange(int(2.5 * SR)) / SR
    y = (np.sin(2 * np.pi * 42 * x * (1 - 0.2 * x)) + 0.35 * lp(rng.standard_normal(len(x)).astype(np.float32), 900) * np.exp(-x / 0.08) / 0.3) * np.exp(-x / 0.7) * (1 - np.exp(-x / 0.008))
    o = np.zeros(N, np.float32); k = min(len(y), N - i); o[i:i + k] = y[:k] * g; return o
gate = np.ones(N, np.float32); g0, g1 = int(quiet0 * SR), int(quiet1 * SR); r = int(0.25 * SR)
gate[g0:g1] = 0; gate[g0 - r:g0] = np.linspace(1, 0, r); gate[g1:g1 + r] = np.linspace(0, 1, r)
mono = (pulse * 0.28 + ri + roar * 0.10 + siren) * gate
L = (padL * 0.9 + mono) * gate + boom(s_sounded + 0.15, 0.55) + boom(s_title - 0.05, 0.6)
R = (padR * 0.9 + np.roll(mono, 300)) * gate + boom(s_sounded + 0.15, 0.55) + boom(s_title - 0.05, 0.6)
fade = (np.clip(t / 1.2, 0, 1) * np.clip((DUR - t) / 1.8, 0, 1)).astype(np.float32)
env = np.convolve(np.abs(v), np.ones(int(0.3 * SR)) / int(0.3 * SR), 'same'); env = np.clip(env / (np.percentile(env[env > 0.003], 60) + 1e-9), 0, 1)
duck = 1 - 0.5 * env
st = np.stack([v * 0.95 + L * fade * duck * 0.55, v * 0.95 + R * fade * duck * 0.55], 1)
st = st / (np.abs(st).max() + 1e-9) * 0.9
with wave.open('/tmp/claude-0/demo_raw.wav', 'w') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((st * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/claude-0/demo_raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), 'public/audio/demo_mix.wav'], check=True)
json.dump({'duration': DUR, 'gap_at': cut_at, 'gap': GAP}, open('vo/hook_timed.meta.json', 'w'))
print('ok', DUR, 'gap at', cut_at)
