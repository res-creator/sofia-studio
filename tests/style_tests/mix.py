# Shared sound for the three style tests: voice (0.5 s in), a light original pizzicato/pad loop, SFX on the story events. Writes mix.wav (-14 LUFS later via loudnorm).
import json, sys, subprocess, wave, numpy as np
sys.path.insert(0, '/home/user/sofia-studio/longform/kit'); import sfx
SR = 44100; T = 10.0; N = int(T * SR); VO = 0.5
W = json.load(open('words.json')); at = lambda w: [x[1] for x in W if x[0].lower().replace("'", '').startswith(w)][0] + VO
vo = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', 'vo.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).astype(float)
out = np.zeros(N); mu = np.zeros(N); fx = np.zeros(N)
def put(b, x, t, g=1.0):
    i = int(t * SR)
    if 0 <= i < N: b[i:i + len(x)] += (x * g)[:N - i]
put(out, vo, VO)
S = sfx.SFX
for i in range(14): put(fx, S['pop'](), at('man') + i * 0.12, 0.25)
put(fx, S['whoosh'](), at('his') - 0.35, 0.5); put(fx, S['whoosh'](), at('lent') - 0.45, 0.5); put(fx, S['scratch'](), at('lent'), 0.5)
for i in range(3): put(fx, S['kaching'](), at('money') + i * 0.45 + 0.6, 0.35)
put(fx, S['stamp'](), at('ivar') + 0.5, 0.4)
t_ = lambda d: np.arange(int(d * SR)) / SR; NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)
def pluck(f): tt = t_(0.5); return sum(np.sin(2 * np.pi * f * h * tt) / h for h in (1, 2, 3)) * np.exp(-tt * 7)
seq = [62, 65, 69, 65, 60, 64, 67, 64, 58, 62, 65, 62, 57, 61, 64, 61]
for k in range(int(T / 0.25)): put(mu, pluck(NOTE(seq[k % 16])), k * 0.25, 0.12 if k % 2 else 0.18)
for k in range(int(T / 1.0)): put(mu, pluck(NOTE(seq[(k * 4) % 16] - 24)), k * 1.0, 0.3)
env = np.convolve((np.abs(out) > 0.02).astype(float), np.ones(int(0.5 * SR)) / int(0.5 * SR), 'same'); dk = np.clip(env * 3, 0, 1)
mix = out + fx * 0.35 + mu * 0.5 * (1 - 0.6 * dk); fade = np.ones(N); fade[-int(0.5 * SR):] = np.linspace(1, 0, int(0.5 * SR)); mix = np.tanh(mix * fade * 1.1) * 0.9
w = wave.open('mix.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close(); print('mix ok')
