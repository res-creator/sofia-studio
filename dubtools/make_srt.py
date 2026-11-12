#!/usr/bin/env python3
"""Subtitles timed to the real voice: python3 make_srt.py SCRIPT_EN.csv VOICE_DIR OUT.srt
Each paragraph runs from start_s for the real (trimmed) length of its take; text is split into cues of <= 84 chars
(2 lines of <= 42), timed in proportion to their length."""
import csv, re, sys, subprocess, numpy as np
CSV, VD, OUT = sys.argv[1:4]; SR = 48000
def dur(p):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True)
    x = np.abs(np.frombuffer(r.stdout, np.float32)); i = np.where(x > 10 ** (-50 / 20))[0]
    return ((i[-1] - i[0]) / SR - 0.09) if len(i) else 0.0
def cues(t, lim=84):
    out = []
    for s in re.split(r'(?<=[.!?…])\s+', t):
        w = s.split()
        n = -(-len(s) // lim)  # parts needed
        if n <= 1: out.append(s); continue
        target = len(s) / n; cur = ''
        for x in w:
            if cur and len(cur) + 1 + len(x) > target + 8 and len(out) >= 0 and n > 1:
                out.append(cur); cur = x; n -= 1; rest = len(s) - sum(len(c) + 1 for c in out[-50:]); 
            else: cur = (cur + ' ' + x).strip()
        if cur: out.append(cur)
    merged = []
    for c in out:
        if merged and len(merged[-1]) + len(c) + 1 <= lim and (len(c) < 25 or len(merged[-1]) < 25): merged[-1] += ' ' + c
        else: merged.append(c)
    return merged
def lines(c, lim=42):
    if len(c) <= lim: return c
    w = c.split(); best = min(range(1, len(w)), key=lambda k: abs(len(' '.join(w[:k])) - len(' '.join(w[k:]))))
    return ' '.join(w[:best]) + '\n' + ' '.join(w[best:])
def ts(t): h, r = divmod(t, 3600); m, s = divmod(r, 60); return '%02d:%02d:%02d,%03d' % (h, m, int(s), round((s - int(s)) * 1000) % 1000)
n = 0; o = []
for r in csv.DictReader(open(CSV, encoding='utf-8')):
    t = re.sub(r'\[[^\]]*\]\s*', '', r['english_narration']).strip(); st = float(r['start_s']); d = dur('%s/%s.mp3' % (VD, r['id']))
    cs = cues(t); L = sum(len(c) for c in cs); a = st
    for c in cs:
        b = a + d * len(c) / L; n += 1
        o.append('%d\n%s --> %s\n%s\n' % (n, ts(a), ts(b - 0.04), lines(c))); a = b
open(OUT, 'w', encoding='utf-8').write('\n'.join(o)); print(n, 'cues')
