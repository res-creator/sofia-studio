# Раскадровка тестового куска (холодный старт + глава 1) → story/shots.json. Якоря: слова озвучки.
import json, os, re
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(f'{P}/config.json')); W = json.load(open(f'{P}/timeline/words.json'))['words']
norm = lambda s: re.sub(r'[^a-zа-я0-9-]', '', s.lower().replace('ё', 'е')); NW = [norm(w['word']) for w in W]; cur = [0]
def X(ph, lead=0.12):
    tk = [norm(x) for x in ph.split()]
    for i in range(cur[0], len(NW) - len(tk) + 1):
        if all(NW[i + j] == tk[j] for j in range(len(tk))): cur[0] = i + 1; return max(0.0, W[i]['start'] - lead)
    raise SystemExit(f'ANCHOR NOT FOUND: {ph}')
T = lambda s: s
S = []
def add(at, k, tr=None, **p): S.append((at, dict(k=k, **p), tr))
import sys, copy
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
SEG = json.load(open(os.path.join(P, '../../../ru_geo/afghan/vo/segments_el.json')))
CH = [s['t'] for s in SEG if s['kind'] == 'chapter']
CH = [CH[0], CH[1] - 2.9] + [c - 2.95 for c in CH[2:]]   # титр ставим в паузу перед главой
import board
board.build(add, X, T, CH)
# длинные кадры (> 5,2 с) делим: вторая часть того же кадра другим планом
S.sort(key=lambda s: s[0]); END0 = float(cfg['duration']); out = []
for i, (st, p, tr) in enumerate(S):
    en = S[i + 1][0] if i + 1 < len(S) else END0; d = en - st
    if d <= 5.6 or p['k'] in ('title', 'card', 'quote', 'tri', 'board', 'phone'): out.append((st, p, tr)); continue
    n = 2 if d <= 8.5 else 3
    for j in range(n):
        q = copy.deepcopy(p)
        if j:
            c = (q.get('cam') or [[0, 960, 540, 1.0]])[-1]; x, y, z = c[1], c[2], c[3]
            if q['k'] in ('map', 'globe', 'globe2', 'orbits'): q['cam'] = [[0, 960 + (90 if j == 1 else -90), 540, 1.18], [9, 960 + (60 if j == 1 else -60), 530, 1.24]]; q['k2'] = 1
            else: q['cam'] = [[0, x + (100 if j == 1 else -100), y - 20, z * 1.25], [9, x + (70 if j == 1 else -70), y - 30, z * 1.32]]
            for key in ('pins', 'routes'):
                for it in q.get(key, []): it[1 if key == 'pins' else 2] = 0
            if q.get('tag'): q['tag'] = list(q['tag']) + [None] * (4 - len(q['tag'])) if len(q['tag']) < 4 else list(q['tag']); q['tag'][3] = 0
            for key in ('count', 'egg', 'cross', 'noRunway', 'sub', 'q'):
                if key in q: q[key] = 0
        out.append((st + d * j / n, q, tr if j == 0 else None))
S = out
END = float(cfg['duration']); S.sort(key=lambda s: s[0]); shots = []
for i, (st, p, tr) in enumerate(S):
    en = S[i + 1][0] if i + 1 < len(S) else END; d = dict(id=f'r{i + 1:03d}', start=round(st, 3), end=round(en, 3), params=p)
    if tr: d['in'] = {'type': tr, 'dur': 0.35 if tr != 'dip' else 0.6}
    shots.append(d)
json.dump(dict(duration=END, shots=shots), open(f'{P}/story/shots.json', 'w'), ensure_ascii=False, indent=1)
ds = [s['end'] - s['start'] for s in shots]; print(len(shots), 'shots, mean', round(sum(ds) / len(ds), 2), 'max', round(max(ds), 2), [(s['id'], round(s['end'] - s['start'], 1)) for s in shots if s['end'] - s['start'] > 4.5])
