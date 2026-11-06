# Full-film assembly for the v3.1 documentary cut of "How LEGO Almost Destroyed Itself":
#  video: v3/render/{opening2,c1b,c2..c7}.mp4 (concat, 1920x1080 30 fps)
#  voice: chapters/*/vo.wav (temp Fish Audio voice) at the chapter offsets
#  sfx:   opening events (same list as audio2.py, adjusted to the fixed edit) + each segment's <seg>.sfx.json, synthesized by longform/kit/sfx.py (ours)
#  music: one continuous synthesized score (ours, no samples) whose mood follows the chapters, ducked under the voice
#  master: howitsrun_style/master.sh (-14 LUFS, -1.5 dBTP); then SRT merge + chapters.txt.
# Usage (from longform/lego_history/v3): python3 film_audio.py
import json, os, re, sys, subprocess, wave, numpy as np, scipy.signal as sg
D = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(D); sys.path.insert(0, os.path.join(R, '../kit')); import sfx
SR = 44100
CH = ['c0_hook', 'c1_system', 'c2_growth', 'c3_beyond', 'c4_nomovie', 'c5_outsider', 'c6_outsourcing', 'c7_stillfits']
TITLES = ['One set, one piece', 'The System (1932-1960)', 'Too Successful (1978-1998)', 'Beyond the Brick (1998-2002)', 'The Year Without a Movie (2003-2004)',
          'The Outsider (2004-2005)', 'The Fix That Broke (2006-2008)', 'It Still Fits']
CU = [json.load(open(f'{R}/chapters/{c}/cues.json')) for c in CH]
OFF = [0.0]
for c in CU[:-1]: OFF.append(OFF[-1] + c['T'] + c.get('tail', 0))
TT = OFF[-1] + CU[-1]['T'] + CU[-1].get('tail', 0); N = int(round(TT * SR)); print('total', round(TT, 2))
SEGS = [('opening2', 0.0), ('c1b', OFF[1] + 31.06)] + [(f'c{i}', OFF[i]) for i in range(2, 8)]
OUT = f'{D}/how_lego_almost_destroyed_itself_v3'
def readwav(p):
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).astype(float); return a
vo = np.zeros(N); fx = np.zeros(N); mu = np.zeros(N)
def put(buf, x, t0, g=1.0):
    i = int(round(t0 * SR))
    if 0 <= i < N: buf[i:i + len(x)] += (x * g)[: N - i]
for c, o in zip(CH, OFF): put(vo, readwav(f'{R}/chapters/{c}/vo.wav'), o)
S = sfx.SFX
def F(name, t0, g): put(fx, S[name](), t0, g)
# --- opening SFX: the event list from audio2.py, adjusted to the fixed opening (the box pours at once, the letter blocks drop at the cut) ---
t = json.loads(subprocess.run(['node', f'{D}/opening2.js', 'times'], capture_output=True, text=True).stdout)
src = open(f'{D}/audio2.py').read(); blk = src[src.index('# --- SFX on picture events ---'): src.index('# --- score')]
blk = blk.replace("F('thump', t['box'] + 0.3, 0.5); F('slidedown', t['box'] + 0.4, 0.4)", "F('thump', t['h4'] + 0.2, 0.5); F('slidedown', t['h4'] + 0.3, 0.4)")
blk = blk.replace("t['name'] + 0.15 if i < 3", "t['name'] - 0.2 if i < 3")
O1 = OFF[1]; exec(blk)
# --- segment SFX ---
for name, o in SEGS[1:]:
    for n, tt, g in json.load(open(f'{D}/{name}.sfx.json'))['sfx']: F(n, o + tt, g)
# --- score: 92 BPM felt piano / pad / pulse bass / low hits; mood per chapter ---
def t_(d): return np.arange(int(d * SR)) / SR
def lp(x, f): b, a = sg.butter(2, f / (SR / 2), 'low'); return sg.lfilter(b, a, x)
NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)
def piano(f, d=1.6):
    tt = t_(d); x = sum((0.6 / h) * np.sin(2 * np.pi * f * h * tt) * np.exp(-tt * (2.2 + h * 1.6)) for h in range(1, 6)); x[:60] *= np.linspace(0, 1, 60); return lp(x, 3200)
def pad(fs, d):
    tt = t_(d); x = sum(sg.sawtooth(2 * np.pi * f * (1 + dt) * tt) for f in fs for dt in (-0.003, 0.003)); x = lp(x, 900); e = np.minimum(1, tt / 1.5) * np.minimum(1, (d - tt) / 1.5); return x * e / (len(fs) * 2)
def bassp(f, d=0.3): tt = t_(d); return np.sin(2 * np.pi * f * tt) * np.exp(-tt * 9) * np.minimum(1, tt / 0.005)
def hit(): tt = t_(2.2); return lp(np.sin(2 * np.pi * np.cumsum(32 + 60 * np.exp(-tt * 8)) / SR) * np.exp(-tt * 1.6) + 0.3 * np.random.default_rng(3).standard_normal(len(tt)) * np.exp(-tt * 6), 400)
BEAT = 60 / 92
MIN = [(50, [62, 65, 69]), (46, [58, 62, 65]), (48, [60, 64, 67]), (45, [57, 61, 64])]     # Dm Bb C A
MAJ = [(50, [62, 66, 69]), (47, [59, 62, 66]), (43, [55, 59, 62]), (45, [57, 61, 64])]     # D Bm G A
DARK = [(50, [62, 65, 69]), (46, [58, 62, 65]), (43, [55, 58, 62]), (45, [57, 60, 64])]    # Dm Bb Gm Am
MOTIF = [0, 2, 1, 2, 0, 1, 2, 1]
# (start, mood): mood = (progression, piano density 0-2, bass on, octave up)
MOODS = [(0, (MIN, 1, 1, 1)), (t['h2'] - 0.3, (MIN, 1, 1, 0)), (t['h3'] + 0.5, (MIN, 1, 1, 1)), (OFF[1] - 0.5, (MAJ, 2, 1, 1)),
         (OFF[2], (MAJ, 2, 1, 1)), (OFF[2] + 40, (MIN, 1, 1, 0)), (OFF[3], (MIN, 2, 1, 1)), (OFF[4], (DARK, 0, 0, 0)),
         (OFF[5], (DARK, 1, 1, 0)), (OFF[5] + 52, (MAJ, 1, 1, 1)), (OFF[6], (MIN, 1, 1, 0)), (OFF[7], (MAJ, 2, 1, 1))]
def mood(tb): return [m for s, m in MOODS if s <= tb][-1]
tb, bar = 0.0, 0
while tb < TT - 2:
    prog, dens, bass, up = mood(tb); root, ch = prog[bar % 4]
    put(mu, pad([NOTE(n) for n in ch], 4 * BEAT + 1.5), tb, 0.12 if dens == 0 else 0.10)
    for b in range(8):
        pb = tb + b * BEAT / 2
        if bass and tb > 2.5: put(mu, bassp(NOTE(root - 12)), pb, 0.22 if b % 2 == 0 else 0.12)
        if (dens == 2) or (dens == 1 and b % 2 == 0) or (dens == 0 and b == 0): put(mu, piano(NOTE(ch[MOTIF[b]] + (12 if up else 0))), pb, 0.07 if b % 2 else 0.1)
    tb += 4 * BEAT; bar += 1
for k in ('lost', 'system'): put(mu, hit(), t[k], 0.5)
put(mu, hit(), t['y1947'], 0.35)
for o in OFF[1:]: put(mu, hit(), o + 0.3, 0.4)
# --- mix: duck the music under the voice, short fade at the very end ---
env = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), 'same'); dk = np.clip(env * 3, 0, 1)
fade = np.ones(N); fade[-int(1.5 * SR):] = np.linspace(1, 0, int(1.5 * SR))
out = (vo * 1.0 + fx * 0.32 + mu * (1.0 - 0.55 * dk)) * fade; out = np.tanh(out * 1.1) * 0.9
w = wave.open(f'{D}/render/mix.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close(); print('mix ok')
# --- video concat + master ---
lst = f'{D}/render/list.txt'; open(lst, 'w').write(''.join(f"file '{D}/render/{n}.mp4'\n" for n, _ in SEGS))
for n, o in SEGS:
    L = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{D}/render/{n}.mp4'], capture_output=True, text=True).stdout); print(n, 'start', round(o, 2), 'len', round(L, 2))
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', f'{D}/render/video.mp4'], check=True)
subprocess.run(['sh', f'{R}/../../howitsrun_style/master.sh', f'{D}/render/mix.wav', f'{D}/render/video.mp4', f'{D}/render/master.mp4', f'{TT:.3f}'], check=True)
# --- SRT merge + YouTube chapters ---
def ts(x): x = max(0, x); return f'{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(round(x % 1 * 1000)) % 1000:03d}'
def pt(s): h, m, r = s.split(':'); sec, ms = r.split(','); return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000
subs, n = [], 1
for c, o in zip(CH, OFF):
    for b in open(f'{R}/chapters/{c}/seg.srt').read().strip().split('\n\n'):
        ln = b.split('\n'); a, z = ln[1].split(' --> '); subs.append(f'{n}\n{ts(pt(a) + o)} --> {ts(pt(z) + o)}\n' + '\n'.join(ln[2:])); n += 1
open(f'{OUT}.srt', 'w').write('\n\n'.join(subs) + '\n')
open(f'{D}/chapters.txt', 'w').write(''.join(f'{int(o // 60)}:{int(o % 60):02d} {ti}\n' for o, ti in zip(OFF, TITLES)))
print('done', TT)
