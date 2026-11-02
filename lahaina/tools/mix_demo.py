# demo soundtrack: narration + synthesized dark score (drone, low pulse, a riser), silence on "not one of them sounded"
import json, subprocess, wave, numpy as np
SR = 44100
W = json.load(open('vo/hook.words.json'))
def cue(line, w, nth=0):
    import re; n = lambda x: re.sub(r"[^a-z0-9:]", '', x.lower())
    return [x for x in W if x['line'] == line and n(x['w']).startswith(n(w))][nth]['s']
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'vo/hook.mp3', '-ac', '1', '-ar', str(SR), '/tmp/claude-0/hook.wav'], check=True)
with wave.open('/tmp/claude-0/hook.wav') as f: vo = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
end_vo = W[-1]['e']; DUR = end_vo + 4.0; N = int(DUR * SR); t = np.arange(N) / SR
v = np.zeros(N, np.float32); v[:len(vo)] = vo[:N]
rng = np.random.default_rng(3)
# drone: low D + A + F, slow beating, filtered
def tone(f, a): return a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6))
drone = sum(tone(f * d, a) for f, a in [(36.71, 0.5), (55.0, 0.35), (73.42, 0.28), (87.31, 0.16)] for d in (1.0, 1.003))
drone *= 0.55 + 0.45 * np.sin(2 * np.pi * t / 9) ** 2
# pulse: soft low thump, tempo rising toward the sirens line
pulse = np.zeros(N, np.float32); tt = 1.0
s_not = cue('h08', 'not'); s_title = cue('h14', 'Lahaina')
while tt < DUR - 1:
    if not (s_not - 0.6 < tt < cue('h09', 'By') - 0.2):
        n = int(0.5 * SR); i = int(tt * SR); x = np.arange(min(n, N - i)) / SR
        pulse[i:i + len(x)] += (np.sin(2 * np.pi * 52 * x) * np.exp(-x / 0.11)).astype(np.float32)
    tt += 1.25 if tt < cue('h05', 'That') else 0.95 if tt < s_not else 0.85
# riser into the title
ri = np.zeros(N, np.float32); a, b = int((s_title - 4.5) * SR), int(s_title * SR)
x = np.arange(b - a) / SR; ri[a:b] = (np.sin(2 * np.pi * (110 + 220 * (x / x[-1]) ** 2) * x) * (x / x[-1]) ** 2 * 0.25).astype(np.float32)
# booms: on "not" (after silence) and on the title
def boom(at, g):
    i = int(at * SR); x = np.arange(int(2.5 * SR)) / SR; y = np.sin(2 * np.pi * 40 * x * (1 - 0.2 * x)) * np.exp(-x / 0.6) * (1 - np.exp(-x / 0.01))
    n = min(len(y), N - i); out = np.zeros(N, np.float32); out[i:i + n] = y[:n] * g; return out
music = drone * 0.22 + pulse * 0.30 + ri
gate = np.ones(N, np.float32)  # silence before "not one of them sounded"
g0, g1 = int((s_not - 0.7) * SR), int((cue('h09', 'By') - 0.3) * SR)
gate[g0:g1] = 0.0; ramp = int(0.3 * SR); gate[g0 - ramp:g0] = np.linspace(1, 0, ramp); gate[g1:g1 + ramp] = np.linspace(0, 1, ramp)
music = music * gate + boom(s_not - 0.02, 0.5) + boom(s_title - 0.05, 0.65)
music *= np.clip(t / 1.5, 0, 1) * np.clip((DUR - t) / 2.5, 0, 1)
env = np.convolve(np.abs(v), np.ones(int(0.3 * SR)) / int(0.3 * SR), 'same'); env = np.clip(env / (np.percentile(env[env > 0.003], 60) + 1e-9), 0, 1)
mix = v * 0.95 + music * (1 - 0.45 * env)
st = np.stack([mix, mix], 1); st = st / (np.abs(st).max() + 1e-9) * 0.9
with wave.open('/tmp/claude-0/demo_raw.wav', 'w') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((st * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/claude-0/demo_raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), 'public/audio/demo_mix.wav'], check=True)
print('ok', DUR)
