# Субтитры из слов озвучки (2d-video/projects/afghan/timeline/words.json) → afghan.srt. Строка ≤ 42 знаков, блок ≤ 2 строк, разрыв на концах фраз.
import json, os
D = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(f'{D}/../../2d-video/projects/afghan/timeline/words.json'))['words']
def ts(t): h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60; return f'{h:02d}:{m:02d}:{int(s):02d},{int(round((s % 1) * 1000)) % 1000:03d}'
blocks, cur = [], []
def flush():
    if cur: blocks.append(list(cur)); cur.clear()
for i, w in enumerate(W):
    if cur and (w['start'] - cur[-1]['end'] > 0.8): flush()
    cur.append(w); txt = ' '.join(x['word'] for x in cur)
    end_sent = w['word'][-1:] in '.?!…»' and not w['word'].endswith('...')
    if len(txt) > 64 or (end_sent and len(txt) > 25) or w['word'][-1:] in '.?!' and i + 1 < len(W) and W[i + 1]['start'] - w['end'] > 0.5: flush()
flush()
def wrap(s):
    if len(s) <= 42: return s
    ws = s.split(); best = None
    for k in range(1, len(ws)):
        a, b = ' '.join(ws[:k]), ' '.join(ws[k:]); sc = max(len(a), len(b))
        if best is None or sc < best[0]: best = (sc, a + '\n' + b)
    return best[1]
out = []
for n, b in enumerate(blocks, 1):
    st, en = b[0]['start'], max(b[-1]['end'], b[0]['start'] + 1.0)
    if n < len(blocks): en = min(en + 0.25, blocks[n][0]['start'] - 0.02)
    out.append(f"{n}\n{ts(st)} --> {ts(en)}\n{wrap(' '.join(x['word'] for x in b))}\n")
open(f'{D}/afghan.srt', 'w').write('\n'.join(out)); print(len(out), 'blocks')
