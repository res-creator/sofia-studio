# Long-form segment stems (copy of the SFX part of rats_ep26/mix.py; NO music — the lead makes one music bed for the whole film).
# Writes vo.wav (voice only) and fx.wav (SFX x 0.3, not ducked), mono 44.1 kHz 16-bit, exactly round(T * 44100) samples, no limiter.
import json, subprocess, os, sys, wave, numpy as np
sys.dont_write_bytecode = True
D = os.path.dirname(os.path.abspath(__file__)); SR = 44100
sys.path.insert(0, D)
from sfxlib import SFX
CU = json.load(open(f'{D}/cues.json')); N = int(round(CU['T'] * SR))
mix = np.zeros(N)
for c in CU['sfx']:
    name, t, g = c[0], c[1], (c[2] if len(c) > 2 else 1.0)
    x = SFX[name]() * g; s = int(round(t * SR))
    if 0 <= s < N: mix[s:s + len(x)] += x[: N - s]
fx = mix * 0.3
vo = np.zeros(N)
for vid, t in CU['vo']:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{D}/vo/{vid}.mp3', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.int16).astype(float) / 32768; s = int(round(t * SR)); vo[s:s + len(a)] += a[: N - s]
def save(name, x):
    w = wave.open(f'{D}/{name}', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
save('vo.wav', vo); save('fx.wav', fx)
print('stems ok', len(CU['sfx']), 'sfx,', N, 'samples, peak vo', round(float(np.max(np.abs(vo))), 3), 'fx', round(float(np.max(np.abs(fx))), 3))
