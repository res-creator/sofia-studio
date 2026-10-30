"""python3 short/short_audio.py <slug> [dir]  -> <dir>/mix_raw.wav (+ stems when STEMS=1)
Runs the ORIGINAL audio_v2.py (shared file, untouched) with patched paths and adjustable bus gains, so the short versions
use exactly the same music / sound effects / ducking logic. EPN (= the original slug) still selects the music and the C2 silence rules.
Env: VG (voice bus gain), MG (music gain), FG (sound-effects gain), STEMS=1 dumps <dir>/stem_{voice,music,fx}.wav."""
import sys, os
PRE = '''
import numpy as np, sys as _sys
_sys.path.insert(0, "short")
from loud import lufs as _lufs
from scipy.ndimage import minimum_filter1d as _minf, uniform_filter1d as _unif
_LT = float(os.environ.get("LT", -17.0)); _CEIL = 10 ** (float(os.environ.get("CEIL", -2.5)) / 20); _MIXCEIL = 10 ** (float(os.environ.get("MIXCEIL", -2.0)) / 20)
def _limit(x, ceil, win=0.03, sr=48000):
    """look-ahead brick-wall limiter (gain reduction starts 30 ms before a peak, ends 30 ms after): transparent for sparse peaks"""
    a = np.abs(x) if x.ndim == 1 else np.abs(x).max(1); need = np.minimum(1.0, ceil / (a + 1e-9)); w = int(win * sr) | 1
    g = np.minimum(_unif(_minf(need, w), w), need)
    return x * (g if x.ndim == 1 else g[:, None])
from scipy.signal import butter as _butter, sosfilt as _sosfilt, lfilter as _lfilter
def _eq(x, sr=48000):
    """phone-speaker voicing: 90 Hz high-pass + a gentle +2.5 dB presence bell at 3 kHz (consonants / English phrases stay audible on a small speaker)"""
    x = _sosfilt(_butter(2, 90, "hp", fs=sr, output="sos"), x)
    A = 10 ** (2.5 / 40); w0 = 2 * np.pi * 3000 / sr; al = np.sin(w0) / (2 * 0.8)
    b = [1 + al * A, -2 * np.cos(w0), 1 - al * A]; a = [1 + al / A, -2 * np.cos(w0), 1 - al / A]
    return _lfilter(b, a, x)
def _rd(s, path):
    """speech clip -> uniform loudness (_LT LUFS integrated per clip) with limiter: quiet lines are raised, peaky shouts are tamed"""
    x, sr = sf.read(path); x = _eq(x.astype(np.float64), sr)
    for _ in range(3):
        L = _lufs(x, sr); g = 10 ** ((_LT - L) / 20); g = min(g, 10 ** (16 / 20)) if L < _LT else g
        x = _limit(x * g, _CEIL)
        if abs(_lufs(x, sr) - _LT) < 0.4: break
    return x.astype(np.float32), sr
'''
slug = sys.argv[1]; D = sys.argv[2] if len(sys.argv) > 2 else f"eps/{slug}"
src = open("audio_v2.py").read()
src = src.replace('json.load(open(f"eps/{EPN}/timeline.json"))', f'json.load(open("{D}/timeline.json"))')
src = src.replace('sf.read(f"eps/{EPN}/vo/{s[\'id\']}.wav")', f'sf.read(f"{D}/vo/{{s[\'id\']}}.wav")')
src = src.replace('sf.write(f"eps/{EPN}/mix_raw.wav"', f'sf.write("{D}/mix_raw.wav"')
old = "mix = voice + fx + np.stack([music*mus_g, np.roll(music, 240)*mus_g], 1)"
assert old in src
new = f"""VG = float(os.environ.get('VG', 1)); MG = float(os.environ.get('MG', 1)); FG = float(os.environ.get('FG', 1))
_mus = np.stack([music*mus_g, np.roll(music, 240)*mus_g], 1)*MG; voice = voice*VG; fx = fx*FG*(1 - float(os.environ.get('FXDUCK', 0.45))*np.clip(duck, 0, 1))[:, None]
if os.environ.get('STEMS'):
    for _n, _x in (('voice', voice), ('music', _mus), ('fx', fx)): sf.write(f"{D}/stem_{{_n}}.wav", _x[:int(DUR*SR)].astype(np.float32), SR)
mix = voice + fx + _mus"""
src = src.replace(old, new)
src = src.replace("x, _ = sf.read(", "x, _ = _rd(s, ")
assert "_rd(s, " in src
src = src.replace('g = 1.0 if s["who"] == "nar" else 0.95', "g = 1.0")
old2 = "mix = np.tanh(mix*1.1)/np.tanh(1.1)"
assert old2 in src
src = src.replace(old2, "mix = _limit(mix, _MIXCEIL)")
assert 'sys.argv[2]' not in src
sys.argv = [sys.argv[0], slug]
exec(compile("import os\n" + PRE + src, "audio_v2_patched", "exec"))
