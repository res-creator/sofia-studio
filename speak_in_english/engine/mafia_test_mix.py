"""Sound for the "NO FIGHTING!" animation test (no voices yet).
python3 mafia_test_mix.py <silent.mp4> <out.mp4>
Cues come from the renderer (node mafia_nofight.js --cues). Effects: the make-2d-video procedural library (audio/sfx.py)
where it has the sound, plus a few small comedy effects defined here (record scratch, crickets, glass, rimshot...).
A quiet room tone sits underneath; effects only, so the test is normalised to -18 LUFS (episodes with voices use -14)."""
import glob, json, os, subprocess, sys
import numpy as np
KIT = glob.glob(os.path.expanduser('~/.claude/plugins/**/make-2d-video/kit/audio'), recursive=True)
sys.path.insert(0, KIT[0])
import sfx as LIB
from dsp import SR, secs, t_axis, noise, lp, hp, bp, expdec, sine, stereo, normalize, reverb, fade

def mono(n, x): return np.asarray(x, np.float32)[:n]
def scratch(dur=0.35, **_):   # record scratch: fast down-up pitch sweep of filtered noise
    n = secs(dur); t = t_axis(n); f = 900 + 2600 * np.abs(np.sin(t / dur * np.pi * 2.2)); ph = np.cumsum(f) / SR
    x = np.sign(np.sin(2 * np.pi * ph)) * 0.3 + bp(noise(n, 3), 800, 4000) * 0.6; return fade(normalize(x * expdec(n, dur * 0.6), -3))
def crickets(dur=1.7, **_):
    n = secs(dur); t = t_axis(n); x = np.zeros(n, np.float32)
    for k, f in enumerate((4300, 4700)):
        chirp = (np.sin(2 * np.pi * 30 * t + k) > 0.6) * (np.sin(2 * np.pi * 1.6 * t + k * 1.3) > 0.3)
        x += np.sin(2 * np.pi * f * t) * chirp * 0.4
    return fade(normalize(lp(x, 6000), -6), 0.05, 0.2)
def shatter(dur=1.2, **_):   # porcelain cup: a knock, a noisy crack and a scatter of high tinkles
    n = secs(dur); x = bp(noise(n, 11), 1800, 9000) * expdec(n, 0.07) * 1.2
    x += np.concatenate([sine(180, secs(0.12)) * expdec(secs(0.12), 0.03), np.zeros(n - secs(0.12), np.float32)]) * 0.8
    r = np.random.default_rng(5)
    for i in range(14):
        at = secs(0.02 + r.random() * 0.6); m = secs(0.18); f = 3000 + r.random() * 4500
        if at + m < n: x[at:at + m] += sine(f, m) * expdec(m, 0.035) * (0.5 - i * 0.02)
    return normalize(reverb(stereo(x, width=0.6), size=1.2, wet=0.18), -1)
def gasp(dur=0.5, **_):
    n = secs(dur); t = t_axis(n); env = np.minimum(1, t / 0.08) * expdec(n, 0.18); return normalize(bp(noise(n, 9), 900, 3500) * env, -4)
def creak(dur=1.2, **_):     # slow wooden creak for the growing grin
    n = secs(dur); t = t_axis(n); f = 70 + 40 * t / dur; pulses = (np.sin(2 * np.pi * np.cumsum(f) / SR) > 0.97).astype(np.float32)
    return fade(normalize(bp(lp(pulses, 3000) + bp(noise(n, 4), 300, 900) * 0.05, 200, 2500), -6), 0.1, 0.2)
def slide(dur=0.4, **_):
    n = secs(dur); env = np.sin(np.linspace(0, np.pi, n)); return normalize(bp(noise(n, 6, 'pink'), 150, 1200) * env, -6)
def roll(dur=0.35, **_):
    n = secs(dur); t = t_axis(n); x = bp(noise(n, 8, 'pink'), 120, 700) * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * t)) * np.linspace(1, 0.2, n); return normalize(x, -6)
def thud(dur=0.5, **_):
    n = secs(dur); t = t_axis(n); x = np.sin(2 * np.pi * np.cumsum(90 * np.exp(-t * 6) + 45) / SR) * expdec(n, 0.12) + lp(noise(n, 2), 600) * expdec(n, 0.04) * 0.6; return normalize(x, -1)
def knock(dur=0.25, **_):
    n = secs(dur); t = t_axis(n); return normalize(np.sin(2 * np.pi * 220 * t) * expdec(n, 0.03) + bp(noise(n, 1), 800, 3000) * expdec(n, 0.01), -3)
def clink(dur=0.4, **_):
    n = secs(dur); return normalize(sine(2600, n) * expdec(n, 0.06) + sine(3900, n) * expdec(n, 0.04) * 0.5, -6)
def blinkfx(dur=0.12, **_):
    n = secs(dur); return normalize(sine(1400, n) * expdec(n, 0.02), -10)
def page(dur=0.3, **_):
    n = secs(dur); return normalize(hp(noise(n, 12), 2500) * np.sin(np.linspace(0, np.pi, n)) ** 2, -8)
def rimshot(dur=1.6, **_):
    n = secs(dur); t = t_axis(n); x = np.zeros(n, np.float32)
    def hit(at, y):
        a = secs(at); m = min(len(y), n - a); x[a:a + m] += y[:m]
    tom = lambda f: np.sin(2 * np.pi * f * t_axis(secs(0.3))) * expdec(secs(0.3), 0.08)
    snare = lambda: (np.sin(2 * np.pi * 190 * t_axis(secs(0.25))) * 0.5 + bp(noise(secs(0.25), 3), 1500, 7000)) * expdec(secs(0.25), 0.06)
    hit(0.0, tom(180)); hit(0.14, tom(140)); hit(0.32, snare()); hit(0.32, hp(noise(secs(1.2), 4), 6000) * expdec(secs(1.2), 0.35) * 0.5)
    return normalize(x, -1)
CUSTOM = dict(scratch=scratch, crickets=crickets, shatter=shatter, gasp=gasp, creak=creak, slide=slide, roll=roll, thud=thud, knock=knock, clink=clink, blink=blinkfx, page=page, rimshot=rimshot)

def render(name, c):
    kw = {k: c[k] for k in ('dur', 'seed') if k in c}
    if name in CUSTOM: y = CUSTOM[name](**kw)
    else: y = LIB.make(name, **kw)
    y = np.asarray(y, np.float32)
    return y if y.ndim == 2 else np.stack([y, y], 1)

def main(silent, out):
    data = json.loads(subprocess.check_output(['node', 'mafia_nofight.js', '--cues']))
    n = secs(data['dur'] + 0.5); mix = np.zeros((n, 2), np.float32)
    room = LIB.make('roomtone', dur=data['dur'] + 0.5); mix[:len(room)] += room[:n] * 10 ** (-34 / 20)
    for c in data['cues']:
        y = render(c['name'], c) * 10 ** (c.get('gain', -10) / 20); a = secs(c['t']); m = min(len(y), n - a)
        if m > 0: mix[a:a + m] += y[:m]
    wav = out.replace('.mp4', '_mix.wav'); import soundfile as sf; sf.write(wav, np.clip(mix, -1, 1), SR)
    subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', silent, '-i', wav, '-af', 'loudnorm=I=-18:TP=-1.5:LRA=11,alimiter=limit=0.84:level=false', '-ar', '48000',
                           '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', out])
    os.remove(wav)

if __name__ == '__main__': main(sys.argv[1], sys.argv[2])
