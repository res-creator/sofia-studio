# Раскадровка «Северной Кореи» в мультяшном стиле → story/shots.json (главы — из ru_geo/nkorea/vo/segments_el.json)
# Каждая сцена привязана к слову озвучки: X('слово') / X('два слова') — ищется вперёд от предыдущей привязки.
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(f'{P}/config.json'))
W = json.load(open(f'{P}/timeline/words.json')); W = W.get('words', W)
norm = lambda s: re.sub(r'[^a-zа-я0-9-]', '', s.lower().replace('ё', 'е'))
NW = [norm(w['word']) for w in W]
cur = [0]
def X(phrase, lead=0.12):
    toks = [norm(x) for x in phrase.split()]
    for i in range(cur[0], len(NW) - len(toks) + 1):
        if all(NW[i + j] == toks[j] for j in range(len(toks))):
            cur[0] = i + 1; return max(0.0, W[i]['start'] - lead)
    raise SystemExit(f'ANCHOR NOT FOUND after word #{cur[0]} ({W[cur[0]]["word"] if cur[0] < len(W) else "END"}): {phrase!r}')
def T(sec): return ('abs', sec)   # абсолютное время (для пауз без голоса)

SB = []
def add(at, scene):
    st = at[1] if isinstance(at, tuple) else at
    SB.append((st, scene[0], scene[1]))

SEG = json.load(open(os.path.join(P, '../../../ru_geo/nkorea/vo/segments_el.json')))
CH = [s['t'] for s in SEG if s['kind'] == 'chapter']
import chapters
chapters.build(add, X, T, CH)
SB.sort(key=lambda s: s[0])
# длинные сцены (> 4,6 с) делим: вторая половина — та же сцена другим планом (наезд/сдвиг камеры), чтобы средний кадр был ≈ 2,5 с
import copy
END = float(cfg['duration']); out = []
for i, (st, tp, pa) in enumerate(SB):
    en = SB[i + 1][0] if i + 1 < len(SB) else END; d = en - st
    if tp != 'stage' or d <= 4.0 or pa.get('big'): out.append((st, tp, pa)); continue
    n = 2 if d <= 7 else 3
    for j in range(n):
        q = copy.deepcopy(pa)
        if j:
            c = (q.get('cam') or [[0, 960, 540, 1.0]])[-1]; x, y, zz = c[1], c[2], c[3] if len(c) > 3 else 1.0
            cast = q.get('cast', [])
            if cast and zz < 1.8:
                xs = [a.get('x', 960) for a in cast]; hs = [a.get('y', 930) - 210 * a.get('s', 1) for a in cast]
                cx = min(1420, max(500, sum(xs) / len(xs))); cy = sum(hs) / len(hs) + 70
                z2 = min(1.5 if len(cast) <= 2 else 1.25, 1700 / (max(xs) - min(xs) + 420))
                z2 = max(z2, zz * 1.1)
                q['cam'] = [[0, cx - 25, cy, z2], ['end', cx + 25, cy - 8, z2 * 1.06]]
            else:
                dx = 90 if j == 1 else -90
                q['cam'] = [[0, x + dx, y, zz * 1.2], ['end', x + dx * 0.6, y - 10, zz * 1.28]]
            q['tags'] = [dict(t, at=0) for t in q.get('tags', []) if not t.get('screen')] + [t for t in q.get('tags', []) if t.get('screen')]
            for pp in q.get('props', []):
                if isinstance(pp.get('at'), str): pp['at'] = 0
            for b in q.get('bubbles', []): b['at'] = 0
        out.append((st + d * j / n, tp, q))
SB = out
# чёрная карточка — не дольше 2,4 с: следующий кадр начинается раньше
for i in range(len(SB) - 1):
    if SB[i][1] == 'card' and SB[i + 1][0] - SB[i][0] > 2.45: SB[i + 1] = (SB[i][0] + 2.4,) + SB[i + 1][1:]
SB.append((float(cfg['duration']), 'END', {}))
def line(a, b): return ' '.join(w['word'] for w in W if a <= w['start'] < b)
shots = []
for i, (st, tp, pa) in enumerate(SB[:-1]):
    en = SB[i + 1][0]
    if en - st < 0.4: print('WARN tiny shot', i, st, en, tp)
    shots.append({'id': f'w{i+1:03d}', 'start': round(st, 3), 'end': round(en, 3), 'tpl': tp, 'params': pa, 'line': line(st, en)})
json.dump({'title': cfg['title'], 'duration': shots[-1]['end'], 'shots': shots, 'music': []}, open(f'{P}/story/shots.json', 'w'), ensure_ascii=False, indent=1)
d = [s['end'] - s['start'] for s in shots]; import statistics as stt
print(len(shots), 'shots', shots[-1]['end'], 'mean', round(stt.mean(d), 2), 'median', round(stt.median(d), 2), 'long>5:', [(s['id'], round(s['end'] - s['start'], 1)) for s in shots if s['end'] - s['start'] > 5])
