# Раскадровка «Третьей мировой» в мультяшном стиле → story/shots.json
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

import chapters_a, chapters_b, chapters_c
for mod in (chapters_a, chapters_b, chapters_c): mod.build(add, X, T)
SB.sort(key=lambda s: s[0])
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
