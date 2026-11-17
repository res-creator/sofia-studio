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
PEOPLE = [[200, 1000, 0.72, 0, {}], [420, 990, 0.7, 1, {}], [1150, 1000, 0.72, 2, {}], [1380, 990, 0.7, 3, {}], [1650, 1010, 0.74, 4, {}]]
add(T(0), 'apt', h=dict(expr='tired', pose='desk', lookY=0.6))
add(X('Соседи'), 'apt', h=dict(expr='angry', pose=[[-122, -446, -1], [122, -446, 1]], look=-1), drill=1, cam=[[0, 700, 520, 1.25], [9, 680, 520, 1.3]])
add(X('начальник,'), 'phone', ring=1, call=1)
add(X('сообщения'), 'phone', notes=1)
add(X('И вы решили'), 'apt', stand=1, hx=900, hy=990, hs=1.0, pack=1, h=dict(expr='focus', pose='idle', look=0.6), cam=[[0, 960, 560, 1.15], [9, 960, 540, 1.22]])
add(X('дальше, чем'), 'globe', lon=60, lat=30, rings=1, spin=25)
add(X('Куда'), 'apt', h=dict(expr='worried', pose='chin', look=0.8, lookY=-0.6), q=1, cam=[[0, 820, 470, 2.0], [9, 820, 460, 2.15]])
add(X('тайгу,'), 'nature', 'whip', set='taiga', label='тайга?')
add(X('пустыню,'), 'nature', 'whip', set='desert', label='пустыня?')
add(X('Антарктиду.'), 'nature', 'whip', set='antarctic', label='Антарктида?')
add(X('И почти'), 'tri')
add(X('Сегодня'), 'globe', lon=-10, lat=-35, pin=[3.36, -54.42], pinLabel='?', spin=3)
add(X('А потом'), 'moon', label='не на Земле?')
add(X('Берите'), 'apt', stand=1, hx=960, hy=990, hs=1.0, pack=1, h=dict(expr='smile', pose='shrug', look=0.2), cam=[[0, 960, 600, 1.1], [9, 960, 580, 1.2]])
add(T(34.45), 'title', 'dip')
add(T(37.6), 'card', text='Остров на краю карты')
SA = [-75, -60, 45, 5]
add(X('Начнём'), 'map', 'fade', view=SA, labels=[['Африка', 22, -6, 70], ['Южная Америка', -57, -9, 60]], cam=[[0, 960, 540, 1.0], [9, 960, 560, 1.06]], pins=[['tristan', 1.0, 'Тристан-да-Кунья', {'ring': True}]])
add(X('Посреди'), 'map', view=[-45, -50, 25, -15], labels=[['Южная Атлантика', -14, -30, 70, '#2f5a7a']], pins=[['tristan', 0.1, 'Тристан-да-Кунья', {'ring': True}]])
add(X('Аэропорта'), 'island', 'push', noRunway=0.3)
add(X('Сюда'), 'sea', days=1)
add(X('Если,'), 'sea', 'whip', storm=1)
add(X('До соседнего'), 'map', 'push', view=[-30, -46, 14, -8], pins=[['tristan', 0.1, 'Тристан'], ['helena', 0.3, 'Святая Елена']], routes=[['tristan', 'helena', 0.6, '≈ 2 400 км']])
add(X('Это дальше,'), 'map', 'push', view=[25, 44, 85, 66], labels=[['Россия', 62, 62, 80]], pins=[['moscow', 0.1, 'Москва'], ['omsk', 0.3, 'Омск']], routes=[['moscow', 'omsk', 0.5, '2 235 км']])
add(X('На острове одна'), 'village', 'push', sign=1)
add(X('И в ней'), 'village', count=0.3, people=PEOPLE, cam=[[0, 960, 600, 1.0], [9, 960, 600, 1.05]])
add(X('И вот тут'), 'village', people=[[1150, 1000, 0.72, 2, {'pose': 'shrug', 'expr': 'smile', 'look': -1}], [1380, 990, 0.7, 3, {'pose': 'point', 'expr': 'smile', 'flip': True}], [1650, 1010, 0.74, 4, {'expr': 'smile', 'look': -1}]], hero=[500, 1010, 0.8, {'expr': 'shock', 'look': 1}])
add(X('Сбежать'), 'village', people=[[1350, 990, 0.8, 0, {'pose': 'chin', 'look': -1, 'expr': 'smile'}], [1580, 1000, 0.82, 3, {'pose': 'hips', 'look': -1, 'expr': 'smile'}]], hero=[640, 1010, 0.85, {'expr': 'worried', 'look': 1}], egg=0.8, cam=[[0, 1000, 640, 1.25], [9, 1000, 620, 1.32]])
add(X('Нет,'), 'village', hero=[760, 1010, 0.9, {'expr': 'tired', 'pose': [[-100, -175, 1], [30, -470, -1]]}], cross=0.15, cam=[[0, 900, 620, 1.35], [9, 900, 610, 1.42]])
add(X('К тому'), 'map', 'push', view=[-26, -46, -2, -32], pins=[['tristan', 0.1, 'Тристан'], ['gough', 0.4, 'Гоф']], routes=[['tristan', 'gough', 0.7, '420 км', {'arc': 0.3}]])
add(X('Там круглый'), 'station')
add(X('Значит,'), 'map', 'push', view=[-40, -70, 40, -25], labels=[['Антарктида', 0, -67, 70, '#5a6a7a']], pins=[['tristan', 0.1, 'Тристан'], ['gough', 0.2, 'Гоф'], ['bouvet', 1.0, '?', {'ring': True, 'col': '#3a6aa8'}]])
END = float(cfg['duration']); S.sort(key=lambda s: s[0]); shots = []
for i, (st, p, tr) in enumerate(S):
    en = S[i + 1][0] if i + 1 < len(S) else END; d = dict(id=f'r{i + 1:03d}', start=round(st, 3), end=round(en, 3), params=p)
    if tr: d['in'] = {'type': tr, 'dur': 0.35 if tr != 'dip' else 0.6}
    shots.append(d)
json.dump(dict(duration=END, shots=shots), open(f'{P}/story/shots.json', 'w'), ensure_ascii=False, indent=1)
ds = [s['end'] - s['start'] for s in shots]; print(len(shots), 'shots, mean', round(sum(ds) / len(ds), 2), 'max', round(max(ds), 2), [(s['id'], round(s['end'] - s['start'], 1)) for s in shots if s['end'] - s['start'] > 4.5])
