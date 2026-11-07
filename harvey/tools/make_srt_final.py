"""English captions for harvey/final/harvey_final.mp4.

Narration cues use the script text (timeline_final.json); their timing comes from
faster-whisper word stamps on each narration part. Interview bites are transcribed
from the source clip's own audio (verbatim, as heard).
Run after build_final.py:  FINAL_TMP=... python3 tools/make_srt_final.py
"""
import json, os, re, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = f'{ROOT}/assets/raw'
TL = json.load(open(f'{ROOT}/final/timeline_final.json'))
OUT = sys.argv[1] if len(sys.argv) > 1 else f'{ROOT}/final/harvey_final.srt'
M = WhisperModel('small.en', device='cpu', compute_type='int8')
MAXC = 84          # characters per cue (two lines of ~42)

def pcm(path, a=0.0, d=None):
    cmd = ['ffmpeg', '-v', 'error', '-ss', f'{a:.3f}'] + (['-t', f'{d:.3f}'] if d else []) + ['-i', path, '-ac', '1', '-ar', '16000', '-f', 's16le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.int16).astype(np.float32) / 32768

def words(x):
    segs, _ = M.transcribe(x, word_timestamps=True, language='en', beam_size=5)
    return [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]

def chunks(text):
    """Split into cues of at most MAXC characters, preferring sentence, then comma breaks."""
    out = []
    for sent in re.split(r'(?<=[.?!])\s+', text.strip()):
        while len(sent) > MAXC:
            cut = max((m.end() for m in re.finditer(r'[,;:]\s', sent[:MAXC])), default=0)
            if cut < 25: cut = sent.rfind(' ', 0, MAXC) + 1
            out.append(sent[:cut].strip()); sent = sent[cut:].strip()
        if sent:
            if out and len(out[-1]) + len(sent) + 1 <= 60: out[-1] += ' ' + sent
            else: out.append(sent)
    return out

def timed(text, ws, t0, dur):
    """Place script chunks on the narration using whisper word times (matched by character share)."""
    cs = chunks(text); total = sum(len(c) for c in cs)
    if not ws: ws = [('', 0.0, dur)]
    wc = np.cumsum([len(w) + 1 for w, _, _ in ws]); wc = wc / wc[-1]
    cues, acc = [], 0
    for i, c in enumerate(cs):
        f0, f1 = acc / total, (acc + len(c)) / total; acc += len(c)
        i0 = int(np.searchsorted(wc, f0 + 1e-6)); i1 = int(np.searchsorted(wc, f1 - 1e-6))
        a = 0.0 if i == 0 else ws[min(i0, len(ws) - 1)][1]
        b = ws[min(i1, len(ws) - 1)][2] if i < len(cs) - 1 else max(ws[-1][2], dur - 0.05)
        cues.append([t0 + a, t0 + b, c])
    return cues

cues = []
for b in TL:
    t = b['sp']
    for path, d, gap in b['parts']:
        txt = open(path + '.txt').read() if os.path.exists(path + '.txt') else None
        if txt is None:   # Todd parts: the text sits next to the source mp3
            txt = open(f"{ROOT}/vo/{os.path.basename(path)[:-4]}.txt").read()
        cues += timed(txt, words(pcm(path)), t, d); t += d + gap
    if 'bite' in b:
        src, a0, a1 = b['bite']
        ws = words(pcm(f'{RAW}/dvids/dvids_{src}.mp4', a0, a1 - a0))
        line, s0 = [], None
        for w, ws_, we in ws:
            if s0 is None: s0 = ws_
            line.append(w)
            if len(' '.join(line)) > MAXC - 12 or re.search(r'[.?!]$', w):
                cues.append([b['sp'] + s0, b['sp'] + we, ' '.join(line)]); line, s0 = [], None
        if line: cues.append([b['sp'] + s0, b['sp'] + ws[-1][2], ' '.join(line)])

cues.sort()
for i in range(len(cues) - 1):     # no overlaps, small gap
    cues[i][1] = min(cues[i][1] + 0.25, cues[i + 1][0] - 0.04)

def ts(x):
    ms = int(round(x * 1000)); return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'
def wrap(c):
    if len(c) <= 42: return c
    mid = len(c) // 2; sp = [m.start() for m in re.finditer(' ', c)]
    k = min(sp, key=lambda p: abs(p - mid)); return c[:k] + '\n' + c[k + 1:]
with open(OUT, 'w') as f:
    for i, (a, b_, c) in enumerate(cues, 1):
        f.write(f'{i}\n{ts(a)} --> {ts(b_)}\n{wrap(c)}\n\n')
print(OUT, len(cues), 'cues')
