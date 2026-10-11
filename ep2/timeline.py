# Build ep2/timeline.json from seq.json + vo/*.mp3.
# Word timing: ElevenLabs web downloads have no alignment file, so words are aligned to the
# audio by energy: voiced segments are split at the biggest pauses (one per "..." / "," / "?!"),
# then words are spread inside each group by syllable weight.
# If a line's mp3 is missing, a PLACEHOLDER duration + synthetic envelope is used (preview only).
import json, re, subprocess, os, numpy as np
D = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(f'{D}/seq.json'))
FPS = 30
EST = {  # real take durations from ElevenLabs (used until the mp3 files are in ep2/vo/)
 'l01': 2.24, 'l02': 2.88, 'l03': 5.2, 'l04': 2.08, 'l05': 2.32, 'l06': 2.88, 'l07': 2.80, 'l08': 4.8, 'l09': 2.00, 'l10': 3.28,
 'l11': 7.36, 'l12': 2.96, 'l13': 1.92, 'l14': 3.12, 'l15': 2.32, 'l16': 2.32, 'l17': 2.80, 'l18': 2.08, 'l19': 1.60, 'l20': 4.32,
 'l21': 1.52, 'l22': 4.8, 'l23': 1.60, 'l24': 1.92, 'l25': 2.24, 'l26': 1.12, 'l27': 1.36, 'l28': 2.40, 'r1': 0.88, 'r2': 1.28,
 'r3': 0.88, 'r4': 1.44, 'q01': 2.88, 'q02': 3.76, 'q03': 2.4, 'l29': 7.68, 'l30': 2.0, 'l31': 0.96}

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
        if not re.search(r'[A-Za-z0-9]', w): continue
        core = re.sub(r'[^A-Za-z\']', '', w).lower()
        syl = max(1, len(re.findall(r'[aeiouy]+', core)) - (1 if core.endswith('e') and len(core) > 3 and not core.endswith('le') else 0))
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
                d = dur(f); x = pcm(f); words = align(tokens(it['text']), voiced_segments(x), d); env = env_of(x); real = True
            else:
                d = EST.get(it['say']) or estimate(it['text']); words, env = placeholder(it['text'], d); real = False; missing.append(it['say'])
            for w in words: w['t0'] += t; w['t1'] += t
            L = {'id': it['say'], 'who': it['who'], 't0': t, 't1': t + d, 'words': words, 'env': env, 'real': real}
            lines.append(L); s['lines'].append(it['say']); s['marks'][it['say']] = t; s['marks'][it['say'] + '_end'] = t + d; t += d
    s['t1'] = t; scenes.append(s)
json.dump({'fps': FPS, 'T': t, 'scenes': scenes, 'lines': lines, 'turns': turns, 'phrases': S['PHRASES'], 'missing': missing}, open(f'{D}/timeline.json', 'w'))
print('total', round(t, 2), '| placeholder lines:', ','.join(missing) or 'none')
for s in scenes: print(' ', s['id'], round(s['t0'], 2), '->', round(s['t1'], 2))
