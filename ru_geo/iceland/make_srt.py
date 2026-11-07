# Субтитры .srt из сценария и таймингов склеек (текст — точно по сценарию, время — по распознанной озвучке).
import json, os, re, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
from script import PARAS
from timeline import build

def ts(t):
    h, r = divmod(max(0, t), 3600); m, s = divmod(r, 60)
    return f'{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)) % 1000:03d}'

def wrap(s, n=42):
    if len(s) <= n: return s
    w = s.split(); best = None
    for i in range(1, len(w)):
        a, b = ' '.join(w[:i]), ' '.join(w[i:])
        sc = max(len(a), len(b))
        if best is None or sc < best[0]: best = (sc, a + '\n' + b)
    return best[1]

paras, _, _ = build()
out, n = [], 0
for (name, raw), pa in zip(PARAS, paras):
    j = json.load(open(f'{D}/vo/{name}.json'))
    parts = re.split(r'\[\[(\w+)\]\]', raw)[1:]
    segs = list(zip(parts[0::2], parts[1::2]))
    times = [pa['start'] + max(0.0, j['cuts'][k] - pa['trim']) for k, _ in segs]
    end_para = pa['start'] + pa['len']
    # склеиваем короткие куски (< 1,6 с) со следующим, чтобы субтитр успевали прочитать
    items = []
    for i, (k, txt) in enumerate(segs):
        t0 = times[i]; t1 = times[i + 1] if i + 1 < len(segs) else end_para
        txt = txt.strip()
        if items and (items[-1][1] - items[-1][0] < 1.6) and len(items[-1][2]) + len(txt) < 84 and not items[-1][2].endswith(('.', '?', '!')):
            items[-1] = (items[-1][0], t1, items[-1][2] + ' ' + txt)
        else: items.append((t0, t1, txt))
    for t0, t1, txt in items:
        if len(txt) > 84:   # длинную фразу делим пополам по времени
            w = txt.split(); h = len(w) // 2; tm = t0 + (t1 - t0) * len(' '.join(w[:h])) / len(txt)
            chunks = [(t0, tm, ' '.join(w[:h])), (tm, t1, ' '.join(w[h:]))]
        else: chunks = [(t0, t1, txt)]
        for a, b, s in chunks:
            n += 1; out.append(f'{n}\n{ts(a)} --> {ts(b - 0.05)}\n{wrap(s)}\n')
open(f'{D}/iceland.srt', 'w').write('\n'.join(out))
print('srt', n, 'cues')
