# Shared sound for the Case File long-form: voice placement + synthesized SFX + music bed, one chapter at a time.
#   python3 sound.py <chapter>            -> chapters/<ch>/mix.wav (44.1 kHz stereo, unmastered; voice ≈ -3 dBFS peaks)
#   python3 sound.py preview c0_open c1_price out.mp4   -> concat seg_video.mp4 + mix.wav of those chapters, master to -14 LUFS
# Inputs per chapter: chapters/<ch>/timeline.json (line placement) + cues.json (from `node episode.js cues`).
# cues keys: whoosh/stamp/hit/glitch/paper/marker/ding: [t...]; type/counter/footsteps: [[t, dur]...]; plane: [t...]; mode: [[t,'dark'|'paper']...]
# Music: one bar grid per chapter (96 BPM, 4/4). 'paper' bars = warm pulsing synth + soft plucks; 'dark' bars = low pulse + dark pad.
# Level rule (owner): music = 0.1 × voice level, ducked further under speech (1 - 0.7·duck).
import json, os, sys, subprocess
import numpy as np
SR = 44100; D = os.path.dirname(os.path.abspath(__file__)); rng = np.random.default_rng(7)
def load_mp3(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768
def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(r, 1e-4)); return e
def lp(x, k=0.15):  # one-pole low-pass
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s += k * (x[i] - s); y[i] = s
    return y
def lpf(x, cut):  # FFT low-pass (fast)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / cut) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)
def hpf(x, cut):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= (f / cut) ** 4 / (1 + (f / cut) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)
def noise(n): return rng.standard_normal(n).astype(np.float32)
# ---------------- SFX library ----------------
def sfx_whoosh(d=0.45):
    n = int(d * SR); t = np.arange(n) / SR; x = noise(n); e = np.sin(np.pi * t / d) ** 2
    lo = lpf(x, 900); hi = hpf(x, 2500) * 0.25; return (lo * 0.9 + hi) * e * 0.5
def sfx_stamp():
    n = int(0.35 * SR); t = np.arange(n) / SR; thump = np.sin(2 * np.pi * (90 - 40 * t) * t) * np.exp(-t / 0.07); slap = lpf(noise(n), 3000) * np.exp(-t / 0.025)
    return (thump * 0.9 + slap * 0.6) * 0.8
def sfx_hit():
    n = int(0.8 * SR); t = np.arange(n) / SR; boom = np.sin(2 * np.pi * (60 - 20 * t) * t) * np.exp(-t / 0.25); crack = hpf(noise(n), 1500) * np.exp(-t / 0.04) * 0.4
    return (boom + crack) * 0.75
def sfx_paper():
    n = int(0.3 * SR); t = np.arange(n) / SR; x = hpf(noise(n), 1800) * (np.exp(-t / 0.08) + 0.3 * np.exp(-((t - 0.12) / 0.04) ** 2)); return x * 0.35
def sfx_marker(d=0.45):
    n = int(d * SR); t = np.arange(n) / SR; x = hpf(noise(n), 3000) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t)) * np.sin(np.pi * t / d); return x * 0.18
def sfx_type(d):
    n = int(d * SR); out = np.zeros(n, np.float32); k = int(0.0); step = int(SR / 14)
    for i in range(0, n - 2000, step + int(rng.integers(-600, 600))):
        m = 1800; tt = np.arange(m) / SR; out[i:i + m] += hpf(noise(m), 2500) * np.exp(-tt / 0.008) * 0.5 + np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt / 0.004) * 0.1
    return out * 0.5
def sfx_glitch():
    n = int(0.22 * SR); t = np.arange(n) / SR; x = np.sign(np.sin(2 * np.pi * 220 * t * (1 + 3 * t))) * 0.3 + hpf(noise(n), 4000) * 0.3; x *= (np.floor(t * 60) % 2); return x * np.exp(-t / 0.15) * 0.5
def sfx_ding():
    n = int(0.9 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * 1318 * t) + 0.5 * np.sin(2 * np.pi * 1976 * t)) * np.exp(-t / 0.3) * 0.18
def sfx_counter(d):
    n = int(d * SR); out = np.zeros(n, np.float32); tick = int(SR / 22)
    for i in range(0, n - 800, tick): m = 700; tt = np.arange(m) / SR; out[i:i + m] += np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt / 0.006) * 0.25
    m = int(0.5 * SR); tt = np.arange(m) / SR; ch = (np.sin(2 * np.pi * 1568 * tt) + np.sin(2 * np.pi * 2093 * tt)) * np.exp(-tt / 0.18) * 0.25
    return np.concatenate([out, ch])
def sfx_plane(d=2.2):
    n = int(d * SR); t = np.arange(n) / SR; x = lpf(noise(n), 500) + 0.3 * hpf(lpf(noise(n), 3000), 1200); e = np.sin(np.pi * t / d) ** 2; return x * e * 0.35
def sfx_steps(d):
    n = int(d * SR); out = np.zeros(n, np.float32); step = int(SR * 0.42)
    for i in range(int(SR * 0.1), n - 3000, step): m = 3000; tt = np.arange(m) / SR; out[i:i + m] += lpf(noise(m), 900) * np.exp(-tt / 0.03) * 0.5
    return out
# ---------------- music ----------------
BPM = 96; BEAT = 60 / BPM; BAR = 4 * BEAT
CH_PAPER = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]   # Am F C G (warm, travel)
CH_DARK = [[45, 48, 52], [41, 45, 48], [43, 47, 50], [40, 44, 47]]    # Am F G E (low)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def saw(f, n): t = np.arange(n) / SR; return (2 * ((t * f) % 1) - 1).astype(np.float32)
def music(T, modes):
    n = int(T * SR) + SR; out = np.zeros((n, 2), np.float32); nb = int(T / BAR) + 2
    def mode_at(t):
        m = 'dark'
        for a, b in modes:
            if t >= a - 0.01: m = b
        return m
    for b in range(nb):
        t0 = b * BAR; i0 = int(t0 * SR); m = mode_at(t0); bn = int(BAR * SR)
        if i0 >= n: break
        seg = np.zeros((bn, 2), np.float32); chord = (CH_PAPER if m == 'paper' else CH_DARK)[b % 4]
        tt = np.arange(bn) / SR
        if m == 'paper':
            pad = sum(lpf(saw(hz(c) * (1 + d), bn), 1400) for c in chord for d in (-0.003, 0.003)) * 0.05
            pulse = 0.6 + 0.4 * np.sin(2 * np.pi * tt / (BEAT / 2)) ** 2
            seg[:, 0] += pad * pulse; seg[:, 1] += pad * pulse
            arp = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[1] + 12, chord[0] + 24, chord[2] + 12, chord[1] + 12, chord[2] + 12]
            for k, note in enumerate(arp):
                j = int(k * BEAT / 2 * SR); L = int(0.45 * SR); L = min(L, bn - j); te = np.arange(L) / SR
                pl = np.sin(2 * np.pi * hz(note) * te) * np.exp(-te / 0.18) * 0.09 + np.sin(2 * np.pi * hz(note) * 2 * te) * np.exp(-te / 0.06) * 0.03
                pan = 0.35 + 0.3 * (k % 2); seg[j:j + L, 0] += pl * (1 - pan); seg[j:j + L, 1] += pl * pan
            bass = np.sin(2 * np.pi * hz(chord[0] - 12) * tt) * 0.14 * (0.5 + 0.5 * np.cos(2 * np.pi * tt / BEAT))
            seg[:, 0] += bass; seg[:, 1] += bass
            for k in range(8):  # soft shaker
                j = int((k + 0.5) * BEAT / 2 * SR); L = 1500; seg[j:j + L] += (hpf(noise(L), 6000) * np.exp(-np.arange(L) / SR / 0.02) * 0.035)[:, None]
        else:
            pad = sum(lpf(saw(hz(c) * (1 + d), bn), 600) for c in chord for d in (-0.004, 0.004)) * 0.06
            seg[:, 0] += pad; seg[:, 1] += pad
            for k in range(8):  # low eighth-note pulse
                j = int(k * BEAT / 2 * SR); L = int(0.28 * SR); te = np.arange(L) / SR
                p = np.sin(2 * np.pi * hz(chord[0] - 12) * te) * np.exp(-te / 0.12) * (0.22 if k % 2 == 0 else 0.13); seg[j:j + L] += p[:, None]
            for k in (0, 2):  # muted kick-ish
                j = int(k * BEAT * SR); L = int(0.3 * SR); te = np.arange(L) / SR; seg[j:j + L] += (np.sin(2 * np.pi * (55 - 25 * te) * te) * np.exp(-te / 0.12) * 0.2)[:, None]
        e = min(bn, n - i0); out[i0:i0 + e] += seg[:e]
    return out[:int(T * SR)]
# ---------------- chapter mix ----------------
def chapter(ch):
    cd = os.path.join(D, 'chapters', ch); TL = json.load(open(os.path.join(cd, 'timeline.json'))); CU = json.load(open(os.path.join(cd, 'cues.json'))); T = TL['T']; n = int(T * SR)
    vo = np.zeros(n, np.float32)
    for i in TL['ids']:
        a = load_mp3(os.path.join(D, 'vo', i + '.mp3')); j = int(round(TL['place'][i] * SR)); j0 = max(0, j); a = a[j0 - j:]; e = min(len(a), n - j0); vo[j0:j0 + e] += a[:e]
    fx = np.zeros(n, np.float32)
    def put(x, t, g=1.0):
        j = int(max(0, t) * SR); e = min(len(x), n - j)
        if e > 0: fx[j:j + e] += x[:e] * g
    for t in CU.get('whoosh', []): put(sfx_whoosh(), t, 0.9)
    for t in CU.get('stamp', []): put(sfx_stamp(), t)
    for t in CU.get('hit', []): put(sfx_hit(), t, 0.8)
    for t in CU.get('glitch', []): put(sfx_glitch(), t)
    for t in CU.get('paper', []): put(sfx_paper(), t)
    for t in CU.get('marker', []): put(sfx_marker(), t)
    for t in CU.get('ding', []): put(sfx_ding(), t)
    for t in CU.get('plane', []): put(sfx_plane(), t, 0.7)
    for t, d in CU.get('type', []): put(sfx_type(d), t)
    for t, d in CU.get('counter', []): put(sfx_counter(d), t)
    for t, d in CU.get('footsteps', []): put(sfx_steps(d), t)
    # duck envelope from the voice (smoothed abs)
    ve = np.abs(vo); k = int(0.25 * SR); cs = np.concatenate([[0], np.cumsum(ve)]); idx = np.arange(n); lo_ = np.clip(idx - k // 2, 0, n); hi_ = np.clip(idx + k // 2, 0, n); dk = (cs[hi_] - cs[lo_]) / k; dk = np.clip(dk / (dk.max() + 1e-9) * 3, 0, 1)
    mu = music(T, CU.get('mode', [[0, 'dark']]))
    vr = np.sqrt((vo[np.abs(vo) > 0.02] ** 2).mean()); mr = np.sqrt((mu ** 2).mean()) + 1e-9
    mu *= 0.14 * vr / mr * (1 - 0.7 * dk)[:, None]   # music rms ≈ 0.14 of voice rms between lines, ×0.3 under speech
    fx *= (1 - 0.4 * dk) * 0.6
    fade = np.ones(n, np.float32); fl = int(0.4 * SR); fade[:fl] = np.linspace(0, 1, fl) if ch != 'c0_open' else 1; fade[-fl:] = np.linspace(1, 0, fl)
    mix = np.stack([vo + fx * 0.9, vo + fx * 1.0], 1) + mu * fade[:, None]
    mix /= max(1.0, np.abs(mix).max() / 0.89)
    out = os.path.join(cd, 'mix.wav'); pcm = (mix * 32767).astype(np.int16)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', out], input=pcm.tobytes(), check=True); print('mix', ch, round(T, 2), 's')
def preview(chs, out):
    tmp = os.path.join(D, '_prev'); os.makedirs(tmp, exist_ok=True)
    with open(os.path.join(tmp, 'v.txt'), 'w') as f:
        for c in chs: f.write(f"file '{os.path.join(D, 'chapters', c, 'seg_video.mp4')}'\n")
    with open(os.path.join(tmp, 'a.txt'), 'w') as f:
        for c in chs: f.write(f"file '{os.path.join(D, 'chapters', c, 'mix.wav')}'\n")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', os.path.join(tmp, 'v.txt'), '-c:v', 'libx264', '-preset', 'medium', '-crf', '27', '-pix_fmt', 'yuv420p', os.path.join(tmp, 'v.mp4')], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', os.path.join(tmp, 'a.txt'), os.path.join(tmp, 'a.wav')], check=True)
    T = sum(json.load(open(os.path.join(D, 'chapters', c, 'timeline.json')))['T'] for c in chs)
    subprocess.run(['sh', os.path.join(D, '../../howitsrun_style/master.sh'), os.path.join(tmp, 'a.wav'), os.path.join(tmp, 'v.mp4'), out, f'{T:.3f}'], check=True)
    for f in os.listdir(tmp): os.remove(os.path.join(tmp, f))
    os.rmdir(tmp); print('preview', out, round(T, 2))
if __name__ == '__main__':
    if sys.argv[1] == 'preview': preview(sys.argv[2:-1], sys.argv[-1])
    else: chapter(sys.argv[1])
