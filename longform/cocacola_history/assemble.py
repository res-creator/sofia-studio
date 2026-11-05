# Assemble the long-form "How Coca-Cola Took Over the World in 10 Minutes" (YouTube 16:9) from the 8 chapter folders:
# joins chapters/*/seg_video.mp4, lays seg*/vo.wav + fx.wav at their offsets, builds ONE continuous music bed (one 120 BPM bar grid for the whole film,
# moods from each segment's cues.json music.sections), ducks it under the voice at the owner's quiet level, masters to -14 LUFS (master.sh),
# merges the subtitles into one SRT and prints the YouTube chapter timestamps (chapters.txt).
# Usage: python3 assemble.py   ->  how_coca_cola_took_over_the_world.mp4 / .srt / chapters.txt (each chapter folder must have seg_video.mp4, vo.wav, fx.wav, cues.json, seg.srt)
import json, os, re, subprocess, tempfile, wave, numpy as np, scipy.signal as sg
D = os.path.dirname(os.path.abspath(__file__)); SR = 44100
SEGS = ['chapters/c0_hook', 'chapters/c1_pemberton', 'chapters/c2_candler', 'chapters/c3_bottles', 'chapters/c4_woodruff', 'chapters/c5_pepsi', 'chapters/c6_newcoke', 'chapters/c7_today']
TITLES = ['2.2 billion a day', '1886: the pharmacist and his syrup', 'Asa Candler: give it away', 'The one-dollar bottling deal', 'Woodruff, Santa and World War II',
          'Pepsi strikes back', 'New Coke: 79 days', 'Coca-Cola today: what really made it big']
OUT = 'how_coca_cola_took_over_the_world'
rng = np.random.default_rng(5)
def readwav(p):
    w = wave.open(p); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768; w.close(); return a
def vlen(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
# --- offsets: each segment starts where the previous video ends (frame-exact: video length) ---
offs, cues, t = [], [], 0.0
for s in SEGS:
    c = json.load(open(f'{D}/{s}/cues.json')); L = vlen(f'{D}/{s}/seg_video.mp4')
    if abs(L - c['T']) > 0.08: print('WARN', s, 'video', L, 'cues T', c['T'])
    offs.append(t); cues.append(c); t += L
TT = t; N = int(round(TT * SR)); print('total', round(TT, 2), 's')
vo = np.zeros(N); fx = np.zeros(N)
for s, o in zip(SEGS, offs):
    for arr, name in ((vo, 'vo'), (fx, 'fx')):
        a = readwav(f'{D}/{s}/{name}.wav'); i = int(round(o * SR)); arr[i:i + len(a)] += a[: N - i]
def t_(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))
def bp(x, lo, hi, o=2): b, a = sg.butter(o, [lo / (SR / 2), min(hi / (SR / 2), 0.99)], 'band'); return sg.lfilter(b, a, x)
def lp(x, f): b, a = sg.butter(2, f / (SR / 2), 'low'); return sg.lfilter(b, a, x)
def hp(x, f): b, a = sg.butter(2, f / (SR / 2), 'high'); return sg.lfilter(b, a, x)
CU = {'T': TT}
# ---------- music (synthesized, ours): 120 BPM grid from the stamp; sections follow the story ----------
BEAT = 0.5; BAR = 2.0
NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)
def pluck(f, d=0.5, b=1.0):
    t = t_(d); x = sum((1 / h ** 1.4) * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (4 + h * 2.5)) for h in range(1, 6))
    x[: 80] *= np.linspace(0, 1, 80); return x * b
def marimba(f, d=0.45): t = t_(d); return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30)) * np.exp(-t * 7)
def bassn(f, d=0.45): t = t_(d); x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t); e = np.minimum(1, t / 0.01) * np.exp(-t * 3.5); return x * e
def pad(freqs, d, att=0.5):
    t = t_(d); x = sum(sg.sawtooth(2 * np.pi * f * (1 + dt) * t) for f in freqs for dt in (-0.004, 0.004)); x = lp(x, 1100)
    e = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, d - t) / 0.6); return x * e / (len(freqs) * 2)
def kick(): t = t_(0.35); return np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-t * 30)) / SR) * np.exp(-t * 9)
def snapd(): t = t_(0.15); return bp(noise(0.15), 1200, 6000) * np.exp(-t * 32)
def hat(): t = t_(0.05); return hp(noise(0.05), 7000) * np.exp(-t * 80)
mus = np.zeros(N)
def put(x, t, g=1.0):
    s = int(t * SR)
    if 0 <= s < N: mus[s:s + len(x)] += (x * g)[: N - s]
MAJ = [(60, [60, 64, 67]), (57, [57, 60, 64]), (53, [53, 57, 60]), (55, [55, 59, 62])]   # C Am F G
MIN = [(50, [50, 53, 57]), (46, [46, 50, 53]), (50, [50, 53, 57]), (45, [45, 49, 52])]   # Dm Bb Dm A (tension)
ARP = [0, 1, 2, 3, 2, 1, 0, 2]
def bar(t0, k, prog=MAJ, drums=2, arp=True, lead=False, g=1.0):
    root, ch = prog[k % 4]
    if arp:
        for i in range(8): n = ch[ARP[i]] + 12 if ARP[i] < 3 else ch[0] + 24; put(pluck(NOTE(n), 0.42), t0 + i * BEAT / 2, (0.13 if i % 2 else 0.18) * g)
    for b in range(4):
        put(bassn(NOTE(root - 24), 0.42), t0 + b * BEAT, (0.36 if b % 2 == 0 else 0.24) * g)
        if drums >= 1: put(kick(), t0 + b * BEAT, (0.5 if b % 2 == 0 else 0.3) * g)
        if drums >= 2 and b % 2: put(snapd(), t0 + b * BEAT, 0.22 * g)
        if drums >= 2: put(hat(), t0 + b * BEAT + BEAT / 2, 0.08 * g); put(hat(), t0 + b * BEAT, 0.05 * g)
    put(pad([NOTE(n) for n in ch], BAR + 0.3, 0.3), t0, 0.09 * g)
    if lead:
        for i, n in enumerate([72, None, 74, 76, None, 74, 72, None]):
            if n: put(marimba(NOTE(n)), t0 + i * BEAT / 2, 0.13 * g)
SWING = [0, 2, 1, 2, 0, 2, 1, 2]
def ragbar(t0, k, g=1.0, prog=MAJ):  # 1880s-1910s: oom-pah bass + swung piano plucks (ragtime feel), no drums
    root, ch = prog[k % 4]
    for b in range(4): put(bassn(NOTE((root if b % 2 == 0 else ch[2]) - 24), 0.3), t0 + b * BEAT, 0.34 * g); put(pluck(NOTE(ch[1] + 12), 0.25), t0 + b * BEAT + BEAT * 0.5, 0.13 * g)
    for i, d in enumerate([0, 0.66, 1.0, 1.66, 2.0, 2.33, 3.0, 3.66]): n = ch[SWING[i]] + 24; put(pluck(NOTE(n), 0.3), t0 + d * BEAT, (0.15 if i % 2 == 0 else 0.1) * g)
def marchbar(t0, k, g=1.0):  # 1940s: snare rolls + brass-like saw chords, major
    root, ch = MAJ[k % 4]
    for b in range(4):
        put(kick(), t0 + b * BEAT, 0.42 * g); put(snapd(), t0 + b * BEAT + BEAT * 0.5, 0.12 * g)
        if b % 2: put(snapd(), t0 + b * BEAT, 0.22 * g)
        put(bassn(NOTE(root - 24), 0.4), t0 + b * BEAT, 0.3 * g)
    put(pad([NOTE(n + 12) for n in ch], BAR * 0.45, 0.05) * 1.6, t0, 0.08 * g); put(pad([NOTE(n + 12) for n in ch], BAR * 0.45, 0.05) * 1.6, t0 + BAR / 2, 0.07 * g)
MOOD = {'light': ('bar', dict(prog=MAJ, drums=2, arp=True, g=0.6)), 'calm': ('bar', dict(prog=MAJ, drums=1, arp=True, g=0.55)),
        'up': ('bar', dict(prog=MAJ, drums=2, arp=True, lead=True, g=0.6)), 'build': ('bar', dict(prog=MAJ, drums=2, arp=True, lead=True, g=0.66)),
        'tension': ('bar', dict(prog=MIN, drums=2, arp=True, g=0.58)), 'dark': ('bar', dict(prog=MIN, drums=1, arp=True, g=0.52)), 'sad': ('bar', dict(prog=MIN, drums=0, arp=True, g=0.45)),
        'soft': ('bar', dict(prog=MAJ, drums=0, arp=True, g=0.4)), 'gaslight': ('rag', dict(g=0.62)), 'ragtime': ('rag', dict(g=0.7)), 'ragminor': ('rag', dict(g=0.6, prog=MIN)),
        'march': ('march', dict(g=0.62)), 'pop': ('bar', dict(prog=MAJ, drums=2, arp=True, lead=True, g=0.64)), 'modern': ('bar', dict(prog=MAJ, drums=2, arp=True, g=0.6))}
SECTIONS = sorted(((o + st, MOOD.get(m, MOOD['calm'])) for c, o in zip(cues, offs) for st, m in c.get('music', {}).get('sections', [[0, 'calm']])), key=lambda s: s[0])
# ONE bar grid for the whole film; each 2 s bar takes the mood of the section it starts in (a boundary within a quarter bar snaps to that bar)
k = 0; tb = 0.0
while tb < TT - 1.0:
    kind, kw = [s for s in SECTIONS if s[0] <= tb + 0.25][-1][1]
    (bar if kind == 'bar' else ragbar if kind == 'rag' else marchbar)(tb, k, **kw); tb += BAR; k += 1
fade = np.ones(N); fs = int((TT - 1.5) * SR); fade[fs:] = np.linspace(1, 0, N - fs)
duck = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(4410) / 4410, 'same'); dk = np.clip(duck * 3, 0, 1)
out = (vo * 1.0 + fx * (1 - 0.6 * dk) + mus * 0.1 * (1 - 0.7 * dk)) * fade   # owner's level: quiet background music
out = np.tanh(out * 1.1) * 0.9
w = wave.open(f'{D}/mix.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
# --- video: concat (all segments are H.264 1920x1080 30 fps yuv420p) ---
tmp = tempfile.mkdtemp(prefix='lf_')
open(f'{tmp}/list.txt', 'w').write(''.join(f"file '{D}/{s}/seg_video.mp4'\n" for s in SEGS))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{tmp}/list.txt', '-c', 'copy', f'{tmp}/video.mp4'], check=True)
subprocess.run(['sh', '../../howitsrun_style/master.sh', 'mix.wav', f'{tmp}/video.mp4', f'{tmp}/m.mp4', f'{TT:.3f}'], cwd=D, check=True)
# a long film with pauses lands a little under the target after master.sh: measure, then gain + a -2 dBFS limiter -> about -14 LUFS
I0 = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', subprocess.run(['ffmpeg', '-i', f'{tmp}/m.mp4', '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr)[-1]); gain = max(0.0, -14.0 - I0 + 0.1)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{tmp}/m.mp4', '-c:v', 'copy', '-af', f'volume={gain:.2f}dB,alimiter=limit=0.8:attack=1:release=40:level=false',
                '-ar', '44100', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', f'{D}/{OUT}.mp4'], check=True)
# --- subtitles: merge with offsets ---
def ts(x): x = max(0, x); h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f'{h:02d}:{m:02d}:{int(s):02d},{int(round((s % 1) * 1000)) % 1000:03d}'
def pt(s): h, m, r = s.split(':'); sec, ms = r.split(','); return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000
n, srt = 0, []
for s, o in zip(SEGS, offs):
    for blk in open(f'{D}/{s}/seg.srt').read().strip().split('\n\n'):
        ln = blk.strip().split('\n'); a, b = [pt(x.strip()) for x in ln[1].split('-->')]; n += 1
        srt.append(f'{n}\n{ts(a + o)} --> {ts(b + o)}\n' + '\n'.join(ln[2:]))
open(f'{D}/{OUT}.srt', 'w').write('\n\n'.join(srt) + '\n')
ch = ''.join(f'{int(o // 60)}:{int(o % 60):02d} {ti}\n' for o, ti in zip(offs, TITLES))
open(f'{D}/chapters.txt', 'w').write(ch); print(ch)
print('temp dir (safe to delete):', tmp)
