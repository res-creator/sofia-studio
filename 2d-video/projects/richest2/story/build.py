# Раскадровка нового «Самого богатого» в мультяшном стиле → story/shots.json
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(f'{P}/config.json'))
SB = [  # (start, template, params)
 (0.0, 'arrive', {}), (2.9, 'goldSign', {}), (6.0, 'cairoWide', {}), (8.7, 'musaMali', {}), (12.0, 'route', {}),
 (13.5, 'goldCaravan', {}), (18.6, 'payGold', {}), (20.9, 'pricesUp', {}), (23.5, 'goldChart', {}),
 (25.7, 'card', {'text': 'Представляете? Один гость —', 'gold': ['гость']}), (27.7, 'cityCoin', {}),
 (30.7, 'umari', {}), (35.2, 'mithqal', {}),
 (43.3, 'throne', {'view': 'wide'}), (45.5, 'throne', {'view': 'refuse'}), (47.8, 'throne', {'view': 'say'}), (51.3, 'throne', {'view': 'bow'}), (52.4, 'throne', {'view': 'seat'}),
 (55.6, 'kidPhone', {}), (57.3, 'phoneArticle', {}), (60.2, 'tower', {}), (63.4, 'pinboard', {}),
 (68.4, 'card', {'text': 'Так кто же был самым богатым человеком в истории?', 'gold': ['богатым']}),
 (71.2, 'crassusFire', {}), (73.4, 'fuggerCrown', {}), (76.2, 'oilKing', {}), (80.1, 'nowMan', {}), (83.0, 'countDesk', {}),
 (89.0, 'card', {'text': 'Как измерить богатство?', 'gold': ['богатство']}),
]
from chapters import CH
SB += CH
SB.append((float(cfg['duration']), 'END', {}))
W = json.load(open(f'{P}/timeline/words.json')); W = W.get('words', W)
def line(a, b): return ' '.join(w['word'] for w in W if a <= w['start'] < b)
shots = []
for i, (st, tp, pa) in enumerate(SB[:-1]):
    en = SB[i + 1][0]
    shots.append({'id': f'p{i+1:03d}', 'start': st, 'end': en, 'tpl': tp, 'params': pa, 'line': line(st, en)})
json.dump({'title': cfg['title'], 'duration': shots[-1]['end'], 'shots': shots, 'music': []}, open(f'{P}/story/shots.json', 'w'), ensure_ascii=False, indent=1)
print(len(shots), 'shots', shots[-1]['end'])
