# storyboard.py + тайминги озвучки → story/shots.json (шоты, звуки, музыкальный план).
#   python3 story/build_shots.py
import json, math, os, re, sys
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(P, 'story'))
from storyboard import SB, IMG, IMG_CREDIT
# архив: картинки → ru_geo/richest/archive.json; нет файла — шот заменяется карточкой с подписью
IMGDIR = os.path.join(P, '../../../ru_geo/data/richest_img')
CRED = json.load(open(os.path.join(IMGDIR, 'credits.json'))) if os.path.exists(os.path.join(IMGDIR, 'credits.json')) else {}
def short(lic): return (lic or '').split(' (')[0].replace('Public domain', 'общественное достояние').replace('PD', 'общественное достояние')
clips = []
for k, f in IMG.items():
    if os.path.exists(os.path.join(IMGDIR, f)):
        c = CRED.get(f, {}); clips.append(dict(id=k, file=f'ru_geo/data/richest_img/{f}', caption='', author=c.get('author') or 'см. страницу файла', license=c.get('license', ''), page=c.get('page', '')))
        IMG_CREDIT[k] = 'Wikimedia Commons · ' + short(c.get('license', ''))
have = {c['id'] for c in clips}
json.dump(dict(clips=clips), open(os.path.join(P, '../../../ru_geo/richest/archive.json'), 'w'), ensure_ascii=False, indent=1)
missing = set()
for key, specs in SB.items():
    for sp in specs:
        if sp['tpl'] == 'archive':
            sp['params']['credit'] = IMG_CREDIT.get(sp['params']['clip'], '')
            if sp['params']['clip'] not in have:
                missing.add(sp['params']['clip']); sp['tpl'] = 'quote'; sp['params'] = {'str': sp['params']['caption'], 'by': ''}
if missing: print('нет картинок (заменены подписью):', sorted(missing))
SEG = json.load(open(os.path.join(P, '../../../ru_geo/richest/vo_full/segments_el.json')))
W = json.load(open(os.path.join(P, 'timeline/words.json')))['words']
norm = lambda s: re.sub(r'[^0-9a-zа-я]', '', s.lower().replace('ё', 'е'))
WN = [(norm(w['word']), w['start'], w['end']) for w in W]
MAXD, KEEPMAX = 3.6, 7.0
GRAPHIC = set('scales pie rankCard mythChain coins ticker statCard bigCounter quote calendar timer chapterTitle caseCard mapShot barsShot thermo uvScale slider curves priceTag twoSensors sunGlint chain briefcase smokeDiagram cutaway hiroshimaMap lamps treaties bunkersWorld cableVsHose sevenRow hoursStrip doomsday globeShot phoneInsert'.split())
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

# 3b) под каждую новую мысль (предложение/часть фразы) — свой кадр: если в шоте начинается новое предложение,
# с этого места показываем крупно ключевые слова этой мысли (шаблон phrase), слова появляются в момент произнесения.
try:
    from storyboard import KEYS
except ImportError:
    KEYS = {}
FILL = {'а', 'и', 'но', 'так', 'да', 'ну', 'вот', 'же', 'ведь', 'кстати', 'теперь', 'тем', 'более', 'что'}
NUMW = ('тысяч', 'миллион', 'миллиард', 'триллион', 'процент', 'сто', 'двест', 'трист', 'пятьс', 'девят', 'восем', 'семь', 'шест', 'пят', 'четыр', 'три', 'два', 'одн', 'полтор', 'десят', 'двадцат', 'сорок')
ends = [i for i, w in enumerate(W) if re.search(r'[.!?…]»?$', w['word'])]
sent_starts = [0] + [i + 1 for i in ends if i + 1 < len(W)]
clause_starts = [i + 1 for i, w in enumerate(W[:-1]) if re.search(r'[,:;—]$', w['word']) or W[i + 1]['word'] in ('—',)]
def phrase_at(i, t_end):
    """ключевые слова мысли, начинающейся со слова i (до конца предложения/шота)"""
    j = i; seq = []
    while j < len(W) and W[j]['start'] < t_end - 0.2:
        seq.append(j)
        if re.search(r'[.!?…]»?$', W[j]['word']): break
        j += 1
    txt = ' '.join(W[k]['word'] for k in seq)
    for pre, words in KEYS.items():
        if norm(txt).startswith(norm(pre)) or (len(norm(txt)) >= 6 and norm(pre).startswith(norm(txt))): return words, seq
    words = [re.sub(r'[«»"().,!?…:;]', '', W[k]['word']) for k in seq]
    idx = [k for k, w in zip(seq, words) if w and w != '—']
    while idx and norm(W[idx[0]]['word']) in FILL: idx = idx[1:]
    # не больше 6 слов: до первой запятой/тире, если мысль длинная
    if len(idx) > 6:
        cut = next((n for n, k in enumerate(idx[:7]) if n >= 2 and re.search(r'[,:;—]$', W[k]['word'])), None)
        idx = idx[:(cut + 1) if cut else 6]
    return None, idx
def key_of(word): return re.sub(r'[«»"().,!?…:;]', '', word).upper()
out_raw = []
MIN_FIRST, MIN_LAST = 1.3, 1.1
for sh in raw:
    d = sh['end'] - sh['start']
    starts = sorted(set([W[i]['start'] for i in sent_starts if sh['start'] + MIN_FIRST < W[i]['start'] < sh['end'] - MIN_LAST]))
    if sh['sp']['tpl'] in ('chapterTitle', 'phrase') or not starts and d <= 4.0:
        out_raw.append(sh); continue
    cuts = [sh['start']]
    for st in starts:
        if st - cuts[-1] >= 1.2: cuts.append(st)
    cuts.append(sh['end'])
    # куски длиннее 4 с режем ещё и по запятым
    k = 0
    while k < len(cuts) - 1:
        if cuts[k + 1] - cuts[k] > 4.0:
            cl = [W[i]['start'] for i in clause_starts if cuts[k] + 1.6 < W[i]['start'] < cuts[k + 1] - 1.4]
            if cl: cuts.insert(k + 1, min(cl, key=lambda x: abs(x - (cuts[k] + cuts[k + 1]) / 2))); continue
        k += 1
    if len(cuts) == 2: out_raw.append(sh); continue
    for q in range(len(cuts) - 1):
        if q == 0: out_raw.append({**sh, 'end': round(cuts[1], 3)}); continue
        i0 = next(i for i, w in enumerate(W) if abs(w['start'] - cuts[q]) < 0.005)
        fixed, idx = phrase_at(i0, cuts[q + 1])
        if fixed:
            words = [w.lstrip('*') for w in fixed]; fixed_acc = [n for n, w in enumerate(fixed) if w.startswith('*')]
            span = max(0.6, min(cuts[q + 1] - cuts[q] - 0.6, (W[idx[-1]]['start'] - cuts[q]) if idx else 1.2))
            times = [round(span * n / max(1, len(words) - 1) * 0.8, 2) for n in range(len(words))]
        else: words = [key_of(W[k]['word']) for k in idx]; times = [round(W[k]['start'] - cuts[q], 2) for k in idx]
        if not words: out_raw[-1]['end'] = round(cuts[q + 1], 3); continue
        acc = fixed_acc if fixed else [n for n, w in enumerate(words) if re.search(r'\d', w) or any(norm(w).startswith(x) for x in NUMW) or (n > 0 and w[:1].isupper() and len(w) > 3 and fixed is None and W[idx[n]]['word'][:1].isupper())]
        bg = ('void', 'dark', 'warm')[len(out_raw) % 3]
        out_raw.append(dict(sp=dict(tpl='phrase', w=None, keep=True, cues={}, params={'words': words, 'times': times, 'accent': acc, 'bg': bg}), start=round(cuts[q], 3), end=round(cuts[q + 1], 3), key=sh['key']))
raw = out_raw

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
    for it in sp['params'].get('items', []) or []:          # слова-cue внутри карточек
        if isinstance(it, dict) and isinstance(it.get('cue'), str):
            at = find(it['cue'], r['start'] - 0.3, r['end'] + 3)
            it['cue'] = round(max(0.0, at - r['start']), 2) if at is not None else None
    for q in range(len(cuts) - 1):
        p = json.loads(json.dumps(sp['params'])); cues = dict(cues0)
        if q:
            off = round(cuts[q] - cuts[0], 3)
            if sp['tpl'] == 'archive': p['from'] = p.get('from', 0) + off
            else:
                p['tOff'] = off
                pass   # продолжение того же кадра той же камерой: склейка незаметна, кадр не прыгает
        shots.append(dict(tpl=sp['tpl'], params=p, cues=cues, start=round(cuts[q], 3), end=round(cuts[q + 1], 3), key=r['key'], part=q))

# 4) текст, id, звуки
SFX = {'rankCard': [{'at': 0.05, 'name': 'hit', 'gain': -12}], 'mythChain': [{'at': 0.4, 'name': 'pop', 'gain': -16}], 'coins': [{'at': 0.2, 'name': 'ding', 'gain': -18}], 'scales': [{'at': 0.8, 'name': 'tick', 'gain': -16}], 'chapterTitle': [{'at': 0.0, 'name': 'whoosh', 'gain': -12}], 'caseCard': [{'at': 0.05, 'name': 'hit', 'gain': -12}],
       'statCard': [{'at': 0.3, 'name': 'pop', 'gain': -16}], 'bigCounter': [{'at': 0.2, 'name': 'counter', 'gain': -18}],
       'santaCall': [{'at': 0.1, 'name': 'phonering', 'gain': -16}], 'bedroomCall': [{'at': 0.2, 'name': 'phonering', 'gain': -14}],
       'priceTag': [{'at': 0.4, 'name': 'blip', 'gain': -14}], 'calendar': [{'at': 0.2, 'name': 'tick', 'gain': -16}],
       'oleanderBloom': [{'at': 0.5, 'name': 'shimmer', 'gain': -18}], 'lamps': [{'at': 0.3, 'name': 'blip', 'gain': -16}]}
AMB = {'caravan': 'wind', 'bazaar': 'murmur', 'throneRoom': 'roomtone', 'fireRome': 'city', 'steelMill': 'hum', 'castle': 'wind', 'oilfield': 'wind', 'libraryKid': 'roomtone', 'fuggerei': 'city', 'petrovDesk': 'hum', 'noradHall': 'hum', 'scientists': 'hum', 'subCouncil': 'roomtone', 'kitchenNews': 'roomtone',
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
MUS = [(1, 'mystery', 0.4), (6, 'tension', 0.45), ('P9', 'wonder', 0.35), (10, 'playful', 0.3), (16, 'mystery', 0.35), (18, 'epic', 0.35),
       (22, 'playful', 0.3), (26, 'tension', 0.4), (28, 'playful', 0.3), (29, 'mystery', 0.35), ('P30', 'wonder', 0.3), (31, 'playful', 0.35),
       (36, 'sad', 0.3), (37, 'hopeful', 0.3), (38, 'tension', 0.4), (42, 'dark', 0.4), (44, 'playful', 0.3), (48, 'tension', 0.45),
       (49, 'epic', 0.35), (53, 'mystery', 0.35), (56, 'triumph', 0.35), (58, 'mystery', 0.4), (59, 'sad', 0.3), (62, 'tension', 0.4),
       ('P63', 'wonder', 0.3), (64, 'action', 0.35), (67, 'tension', 0.4), (69, 'sad', 0.3), ('P69', 'calm', 0.3), (70, 'epic', 0.35),
       (75, 'calm', 0.3), (77, 'hopeful', 0.35), (79, 'calm', 0.3), (80, 'hopeful', 0.4), (81, 'triumph', 0.35)]
start_of = {it['key']: it['start'] for it in items}
music = []
for j, (key, mood, inten) in enumerate(MUS):
    a = 0.0 if j == 0 else start_of[key]; b = END if j == len(MUS) - 1 else start_of[MUS[j + 1][0]]
    music.append(dict(start=round(a, 2), end=round(b, 2), mood=mood, intensity=inten))

json.dump(dict(title='Кто был самым богатым человеком в истории', duration=round(END, 2), shots=out, music=music),
          open(os.path.join(P, 'story/shots.json'), 'w'), ensure_ascii=False, indent=1)
ds = [s['end'] - s['start'] for s in out]
print(f'{len(out)} shots, {END/60:.2f} min, median {sorted(ds)[len(ds)//2]:.2f}s, max {max(ds):.2f}s, min {min(ds):.2f}s; missing keys: {miss}')
