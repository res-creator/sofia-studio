# Build tiktok2/timeline.json from seq.json + vo/*.mp3.
# Word timing: exact character alignment from ElevenLabs (vo/<id>.align.json, written by gen_vo.py);
# falls back to energy-based alignment if that file is missing.
# If a line's mp3 is missing, a PLACEHOLDER duration + synthetic envelope is used (preview only).
import json, re, subprocess, os, numpy as np
D = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(f'{D}/seq.json', encoding='utf-8'))
FPS = 30

def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
def pcm(f):
    a = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'])
    return np.frombuffer(a, np.int16).astype(np.float32) / 32768
def env_of(x):
    hop = 16000 // FPS; n = len(x) // hop
    r = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])
    r = r / (np.percentile(r, 95) + 1e-6); return [round(float(min(1, v)), 3) for v in r]

def clean(text): return re.sub(r'\[[^\]]*\]', ' ', text)
def tokens(text):
    """[(word, weight, pause_after)]"""
    out = []
    for raw in clean(text).split():
        w = raw.strip()
        if not re.search(r'[A-Za-z0-9\u0400-\u04FF]', w): continue
        core = re.sub(r'[^A-Za-z\u0400-\u04FF\']', '', w).lower()
        syl = max(1, len(re.findall(r'[aeiouy\u0430\u0435\u0451\u0438\u043e\u0443\u044b\u044d\u044e\u044f]+', core)) - (1 if core.endswith('e') and len(core) > 3 and not core.endswith('le') else 0))
        pause = bool(re.search(r'(\.\.\.|[,?!.])$', w))
        out.append((w, syl, pause))
    if out: out[-1] = (out[-1][0], out[-1][1], False)
    return out

def voiced_segments(x):
    hop = 160; n = len(x) // hop
    r = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])
    th = max(0.012, np.percentile(r, 95) * 0.12); v = r > th
    segs = []; i = 0
    while i < n:
        if v[i]:
            j = i
            while j < n and v[j]: j += 1
            segs.append([i * 0.01, j * 0.01]); i = j
        else: i += 1
    merged = []
    for s in segs:
        if merged and s[0] - merged[-1][1] < 0.09: merged[-1][1] = s[1]
        else: merged.append(s)
    return [s for s in merged if s[1] - s[0] > 0.04]

def align(tok, segs, total):
    if not segs: segs = [[0.05, total - 0.05]]
    groups = [[]]
    for t in tok:
        groups[-1].append(t)
        if t[2]: groups.append([])
    groups = [g for g in groups if g]
    # pick the (len(groups)-1) largest gaps between voiced segments as group borders
    gaps = sorted(range(len(segs) - 1), key=lambda i: -(segs[i + 1][0] - segs[i][1]))[:len(groups) - 1]
    cuts = sorted(gaps); spans = []; a = 0
    for c in cuts: spans.append([segs[a][0], segs[c][1]]); a = c + 1
    spans.append([segs[a][0], segs[-1][1]])
    if len(spans) < len(groups):  # fewer pauses than punctuation: merge text groups
        while len(groups) > len(spans): groups[-2] += groups[-1]; groups.pop()
    words = []
    for g, (s0, s1) in zip(groups, spans):
        W = sum(t[1] + 0.6 for t in g); u = s0
        for t in g:
            d = (s1 - s0) * (t[1] + 0.6) / W; words.append({'w': t[0], 't0': u, 't1': u + d * 0.92}); u += d
    return words


def words_from_alignment(f):
    """Words (without [tags]) with real start/end times from the ElevenLabs alignment."""
    A = json.load(open(f)); ch, s, e = A['characters'], A['character_start_times_seconds'], A['character_end_times_seconds']
    words = []; cur = None; tag = False
    for c, a, b in zip(ch, s, e):
        if c == '[': tag = True; continue
        if c == ']': tag = False; continue
        if tag: continue
        if c.isspace():
            if cur: words.append(cur); cur = None
            continue
        if cur is None: cur = {'w': c, 't0': a, 't1': b}
        else: cur['w'] += c; cur['t1'] = b
    if cur: words.append(cur)
    return [w for w in words if re.search(r'[A-Za-z0-9\u0400-\u04FF]', w['w'])]

def placeholder(text, d):
    tok = tokens(text); segs = []; W = sum(t[1] + 0.6 for t in tok) + sum(1.6 for t in tok if t[2]); u = 0.08; span = d - 0.16
    words = []
    for t in tok:
        dd = span * (t[1] + 0.6) / W; words.append({'w': t[0], 't0': u, 't1': u + dd * 0.9}); u += dd + (span * 1.6 / W if t[2] else 0)
    env = []
    for f in range(int(d * FPS)):
        tt = f / FPS; on = any(w['t0'] <= tt < w['t1'] for w in words)
        env.append(round(float(on * (0.55 + 0.45 * abs(np.sin(tt * 13)))), 3))
    return words, env

def estimate(text):
    tok = tokens(text); return 0.4 + sum(t[1] for t in tok) * 0.26 + sum(0.6 for t in tok if t[2])

t = 0; scenes = []; lines = []; turns = []; missing = []
for sc in S['SEQ']:
    s = {'id': sc['id'], 't0': t, 'marks': {}, 'lines': []}
    for it in sc['items']:
        if 'wait' in it: t += it['wait']
        elif 'mark' in it: s['marks'][it['mark']] = t
        elif 'turn' in it:
            d = it.get('dur', 2.4); turns.append({'phrase': it['turn'], 't0': t, 't1': t + d}); s['marks']['turn'] = t; t += d
        elif 'say' in it:
            f = f"{D}/vo/{it['say']}.mp3"
            if os.path.exists(f):
                d = dur(f); x = pcm(f); env = env_of(x); real = True
                af = f.replace('.mp3', '.align.json')
                words = words_from_alignment(af) if os.path.exists(af) else align(tokens(it['text']), voiced_segments(x), d)
            else:
                d = estimate(it['text']); words, env = placeholder(it['text'], d); real = False; missing.append(it['say'])
            for w in words: w['t0'] += t; w['t1'] += t
            L = {'id': it['say'], 'who': it['who'], 't0': t, 't1': t + d, 'words': words, 'env': env, 'real': real}
            lines.append(L); s['lines'].append(it['say']); s['marks'][it['say']] = t; s['marks'][it['say'] + '_end'] = t + d; t += d
    s['t1'] = t; scenes.append(s)
json.dump({'fps': FPS, 'T': t, 'scenes': scenes, 'lines': lines, 'turns': turns, 'phrases': S['PHRASES'], 'missing': missing}, open(f'{D}/timeline.json', 'w'))
print('total', round(t, 2), '| placeholder lines:', ','.join(missing) or 'none')
for s in scenes: print(' ', s['id'], round(s['t0'], 2), '->', round(s['t1'], 2))
