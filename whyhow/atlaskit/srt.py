#!/usr/bin/env python3
"""SRT from word timings: python3 srt.py EPDIR OUT.srt  (timeline.json + words_script.json). Cues <= 84 chars, 2 lines <= 42, split at sentence/comma."""
import json, sys, os
EP, OUT = sys.argv[1:3]; TL = json.load(open(os.path.join(EP, 'timeline.json'))); WS = json.load(open(os.path.join(EP, 'words_script.json')))
def ts(t): h, r = divmod(t, 3600); m, s = divmod(r, 60); return '%02d:%02d:%02d,%03d' % (h, m, int(s), int(round((s - int(s)) * 1000)) % 1000)
def lines(c, lim=42):
    if len(c) <= lim: return c
    w = c.split(); k = min(range(1, len(w)), key=lambda k: abs(len(' '.join(w[:k])) - len(' '.join(w[k:])))); return ' '.join(w[:k]) + '\n' + ' '.join(w[k:])
cues = []
for p in TL['paras']:
    ws = WS[p['id']]; cur = []
    for i, w in enumerate(ws):
        cur.append(w); txt = ' '.join(x['w'] for x in cur); nxt = ws[i + 1]['w'] if i + 1 < len(ws) else None
        end_s = w['w'][-1] in '.?!'; soft = w['w'][-1] in ',;:—'
        if nxt is None or end_s or (soft and len(txt) > 40) or len(txt + ' ' + nxt) > 84:
            cues.append([p['start'] + cur[0]['s'], p['start'] + cur[-1]['e'] + 0.15, txt]); cur = []
for i in range(len(cues) - 1): cues[i][1] = min(cues[i][1], cues[i + 1][0] - 0.04)
open(OUT, 'w', encoding='utf-8').write('\n'.join('%d\n%s --> %s\n%s\n' % (i + 1, ts(a), ts(b), lines(c)) for i, (a, b, c) in enumerate(cues)))
print(len(cues), 'cues')
