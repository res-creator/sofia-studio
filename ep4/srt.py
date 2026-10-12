# SRT from ep4/timeline.json (one cue per line of speech; long lines split in two at a word boundary)
import json, os
D = os.path.dirname(os.path.abspath(__file__)); TL = json.load(open(f'{D}/timeline.json'))
def ts(t): h, r = divmod(t, 3600); m, s = divmod(r, 60); return f'{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}'
cues = []
for L in TL['lines']:
    w = L['words']
    if not w: continue
    parts = [w] if len(w) <= 9 else [w[:len(w) // 2], w[len(w) // 2:]]
    for p in parts: cues.append((p[0]['t0'], p[-1]['t1'] + 0.15, ' '.join(x['w'] for x in p)))
with open(f'{D}/sofia_ep4_en.srt', 'w') as f:
    for i, (a, b, t) in enumerate(cues, 1): f.write(f'{i}\n{ts(a)} --> {ts(b)}\n{t}\n\n')
print(len(cues), 'cues')
