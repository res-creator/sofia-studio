# storyboard.py + тайминги озвучки → story/shots.json (шоты, звуки, музыкальный план).
#   python3 story/build_shots.py
import json, math, os, re, sys
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(P, 'story'))
from storyboard import SB
SEG = json.load(open(os.path.join(P, '../../../ru_geo/ww3/vo_full/segments_el.json')))
W = json.load(open(os.path.join(P, 'timeline/words.json')))['words']
norm = lambda s: re.sub(r'[^0-9a-zа-я]', '', s.lower().replace('ё', 'е'))
WN = [(norm(w['word']), w['start'], w['end']) for w in W]
MAXD, KEEPMAX = 4.0, 9.0
GRAPHIC = set('statCard bigCounter quote calendar timer chapterTitle caseCard mapShot barsShot thermo uvScale slider curves priceTag twoSensors sunGlint chain briefcase smokeDiagram cutaway hiroshimaMap lamps treaties bunkersWorld cableVsHose sevenRow hoursStrip doomsday globeShot phoneInsert'.split())
CAMS = [{'move': 'push', 'z': 1.25}, {'move': 'driftR', 'z': 1.1}, {'move': 'pull', 'z': 1.3}, {'move': 'driftL', 'z': 1.18}]

def find(phrase, t0, t1):
    q = [norm(x) for x in phrase.split() if norm(x)]
    for i, (w, s, e) in enumerate(WN):
        if s < t0 - 0.05 or s > t1: continue
        if all(i + j < len(WN) and WN[i + j][0].startswith(q[j]) for j in range(len(q))): return s
    return None

# 1) элементы таймлайна по порядку
items, k, pause_after = [], 0, None
for i, sg in enumerate(SEG):
    if sg['kind'] == 'chapter':
        n = sum(1 for x in SEG[:i + 1] if x['kind'] == 'chapter')
        if n > 1: items.append(dict(key=f'C{n}', start=sg['t'] - 2.4, t=sg['t']))
    elif sg['kind'] == 'pause': items.append(dict(key=f'P{k}', start=sg['t'], t=sg['t'], dur=sg['dur']))
    else: k += 1; items.append(dict(key=k, start=sg['t'], t=sg['t'], dur=sg['dur'], text=sg['text']))
END = SEG[-1]['t'] + SEG[-1]['dur'] + 3.0
for a, b in zip(items, items[1:] + [dict(start=END)]): a['end'] = b['start']
items[0]['start'] = 0.0

# 2) шоты с якорями
raw, miss = [], []
for it in items:
    specs = SB.get(it['key'])
    if not specs: miss.append(it['key']); continue
    t0, t1 = it['start'], it['end']
    marks = []
    for j, sp in enumerate(specs):
        at = t0 if j == 0 else (find(sp['w'], max(t0, marks[-1] if marks[-1] is not None else t0) + 0.2, t1) if sp.get('w') else None)
        if j and sp.get('w') and at is None: print('anchor not found:', it['key'], sp['w'])
        marks.append(at)
    marks.append(t1)
    # равномерно между известными якорями
    j = 0
    while j < len(specs):
        if marks[j + 1] is None:
            a = j; b = j + 1
            while marks[b] is None: b += 1
            for m in range(a + 1, b): marks[m] = marks[a] + (marks[b] - marks[a]) * (m - a) / (b - a)
        j += 1
    # минимум 1,6 с на кадр: сдвигаем следующую границу вперёд
    for j in range(len(specs) - 1):
        if marks[j + 1] - marks[j] < 1.6:
            nxt = marks[j + 2] if j + 2 < len(marks) else t1
            marks[j + 1] = min(marks[j] + 1.6, max(marks[j], nxt - 1.0))
    for j, sp in enumerate(specs):
        raw.append(dict(sp=sp, start=marks[j], end=marks[j + 1], key=it['key']))

# 3) нарезка длинных шотов
shots = []
for r in raw:
    d = r['end'] - r['start']; sp = r['sp']
    lim = KEEPMAX if sp['keep'] else MAXD
    n = max(1, math.ceil(d / lim - 1e-6)) if d > lim else 1
    if sp['tpl'] in GRAPHIC and d <= KEEPMAX: n = 1          # графику не режем: анимация целиком
    if (sp['keep'] or sp['tpl'] in GRAPHIC) and n > 1:   # анимация целиком в первой части, хвост — продолжение
        first = min(d - 2.0, 6.0); cuts = [r['start'], r['start'] + first]
        rest = d - first; m = max(1, math.ceil(rest / MAXD - 1e-6))
        cuts += [r['start'] + first + rest * q / m for q in range(1, m + 1)]
    else:
        cuts = [r['start'] + d * q / n for q in range(n + 1)]
    # словесные cue → секунды от начала шота (ищем слово внутри шота)
    cues0 = {}
    for c, v in sp['cues'].items():
        if isinstance(v, str):
            at = find(v, r['start'] - 0.3, r['end'])
            if at is None: print('cue word not found:', r['key'], c, v); continue
            cues0[c] = round(max(0.0, at - r['start']), 2)
        else: cues0[c] = v
    for q in range(len(cuts) - 1):
        p = json.loads(json.dumps(sp['params'])); cues = dict(cues0)
        if q:
            off = round(cuts[q] - cuts[0], 3)
            if sp['tpl'] == 'archive': p['from'] = p.get('from', 0) + off
            else:
                p['tOff'] = off
                p['cam'] = {**CAMS[(len(shots) + q) % len(CAMS)]}
                if sp['tpl'] in GRAPHIC: p['cam'] = {'move': ('push', 'pull')[(len(shots) + q) % 2], 'z': 1.03}
        shots.append(dict(tpl=sp['tpl'], params=p, cues=cues, start=round(cuts[q], 3), end=round(cuts[q + 1], 3), key=r['key'], part=q))

# 4) текст, id, звуки
SFX = {'chapterTitle': [{'at': 0.0, 'name': 'whoosh', 'gain': -12}], 'caseCard': [{'at': 0.05, 'name': 'hit', 'gain': -12}],
       'statCard': [{'at': 0.3, 'name': 'pop', 'gain': -16}], 'bigCounter': [{'at': 0.2, 'name': 'counter', 'gain': -18}],
       'santaCall': [{'at': 0.1, 'name': 'phonering', 'gain': -16}], 'bedroomCall': [{'at': 0.2, 'name': 'phonering', 'gain': -14}],
       'priceTag': [{'at': 0.4, 'name': 'blip', 'gain': -14}], 'calendar': [{'at': 0.2, 'name': 'tick', 'gain': -16}],
       'oleanderBloom': [{'at': 0.5, 'name': 'shimmer', 'gain': -18}], 'lamps': [{'at': 0.3, 'name': 'blip', 'gain': -16}]}
AMB = {'petrovDesk': 'hum', 'noradHall': 'hum', 'scientists': 'hum', 'subCouncil': 'roomtone', 'kitchenNews': 'roomtone',
       'bedroomCall': 'roomtone', 'fieldScene': 'wind', 'goldsboroField': 'wind', 'arcticRocket': 'wind', 'atollGather': 'murmur',
       'bankQueue': 'murmur', 'cityPhone': 'city'}
out = []
for i, s in enumerate(shots):
    line = ' '.join(w['word'] for w in W if s['start'] <= w['start'] < s['end'])
    o = dict(id=f's{i + 1:03d}', start=s['start'], end=s['end'], line=line, scene=s['tpl'], tpl=s['tpl'], params=s['params'])
    if s['cues']: o['cues'] = s['cues']
    if s['part'] == 0 and s['tpl'] in SFX: o['sfx'] = SFX[s['tpl']]
    if s['tpl'] == 'petrovDesk' and s['params'].get('alarm') and s['part'] == 0 and s['key'] in (1, 3): o['sfx'] = [{'at': 0.1, 'name': 'buzz', 'gain': -16}]
    if s['tpl'] in AMB: o['amb'] = {'name': AMB[s['tpl']], 'gain': -26}
    if s['tpl'] == 'establish' and s['params'].get('set') in ('station', 'field', 'arctic'): o['amb'] = {'name': 'wind', 'gain': -26}
    out.append(o)

# 5) музыка по абзацам: (с абзаца, настроение, интенсивность)
MUS = [(1, 'mystery', 0.35), (3, 'tension', 0.6), (7, 'mystery', 0.45), (15, 'tension', 0.45), (20, 'mystery', 0.35), (21, 'playful', 0.3),
       (23, 'mystery', 0.35), (24, 'dark', 0.45), ('P25', 'wonder', 0.3), (26, 'mystery', 0.35), (31, 'tension', 0.4), (32, 'mystery', 0.35),
       ('P33', 'calm', 0.3), (34, 'dark', 0.45), ('P39', 'sad', 0.35), (40, 'mystery', 0.35), (43, 'wonder', 0.35), (46, 'mystery', 0.3),
       (49, 'sad', 0.3), (51, 'hopeful', 0.3), (54, 'wonder', 0.3), (56, 'sad', 0.3), (60, 'calm', 0.25), (62, 'tension', 0.55),
       (66, 'dark', 0.4), (67, 'tension', 0.45), ('P67', 'hopeful', 0.35), (68, 'tension', 0.5), (71, 'mystery', 0.4), (73, 'tension', 0.45),
       (74, 'mystery', 0.4), (75, 'calm', 0.35), (78, 'sad', 0.3), (79, 'hopeful', 0.45), (83, 'triumph', 0.35)]
start_of = {it['key']: it['start'] for it in items}
music = []
for j, (key, mood, inten) in enumerate(MUS):
    a = 0.0 if j == 0 else start_of[key]; b = END if j == len(MUS) - 1 else start_of[MUS[j + 1][0]]
    music.append(dict(start=round(a, 2), end=round(b, 2), mood=mood, intensity=inten))

json.dump(dict(title='Что будет, если начнётся Третья мировая', duration=round(END, 2), shots=out, music=music),
          open(os.path.join(P, 'story/shots.json'), 'w'), ensure_ascii=False, indent=1)
ds = [s['end'] - s['start'] for s in out]
print(f'{len(out)} shots, {END/60:.2f} min, median {sorted(ds)[len(ds)//2]:.2f}s, max {max(ds):.2f}s, min {min(ds):.2f}s; missing keys: {miss}')
