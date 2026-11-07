# full/full_episode.srt from word timings (cold open: src/data/timeline.json, chapters: full/timeline_full.json)
import json, textwrap
cold = json.load(open('src/data/timeline.json'))['words']
T = json.load(open('full/timeline_full.json'))
words = [{'w': w['w'], 's': w['s'], 'e': w['e']} for w in cold] + [{'w': w['w'], 's': w['s'], 'e': w['e']} for w in T['words']]
cues, cur = [], []
def flush():
    if cur: cues.append((cur[0]['s'], cur[-1]['e'], ' '.join(x['w'] for x in cur)))
for i, w in enumerate(words):
    if cur and (len(textwrap.wrap(' '.join(x['w'] for x in cur + [w]), 42)) > 2 or w['s'] - cur[-1]['e'] > 0.7 or w['e'] - cur[0]['s'] > 6.0):
        flush(); cur = []
    cur.append(w)
    if w['w'][-1] in '.?!' and len(' '.join(x['w'] for x in cur)) > 18:
        flush(); cur = []
flush()
def ts(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'
out = []
for k, (a, b, txt) in enumerate(cues):
    nxt = cues[k + 1][0] if k + 1 < len(cues) else b + 1
    b = min(max(b + 0.25, a + 1.0), nxt - 0.04)
    out.append(f"{k + 1}\n{ts(a)} --> {ts(b)}\n" + '\n'.join(textwrap.wrap(txt, 42)) + '\n')
open('full/full_episode.srt', 'w').write('\n'.join(out))
print(len(cues), 'cues')
