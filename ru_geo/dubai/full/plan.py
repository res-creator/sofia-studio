# План выпуска «Дубай»: таймлайн голоса (vo_full), кадры (shots/*.json), заставки глав, музыкальные паузы, музыка по главам.
# Шаблон — ru_geo/japan/full2 (скилл skvoz-strany). Используется fetch.py, build.py, make_kit.py.
import json, os, subprocess
D = os.path.dirname(os.path.abspath(__file__)); J = os.path.join(D, '..'); RG = os.path.join(J, '..')
ALL = json.load(open(f'{J}/vo_full/lines.json'))
INTRO_LINES = [i for i in ALL if i['id'].startswith('c00_')]
LINES = [i for i in ALL if not i['id'].startswith('c00_')]
INTERS = json.load(open(f'{J}/vo_full/interludes.json'))
SHOTS = {}
for part in 'ABCD':
    p = f'{J}/shots/{part}.json'
    if os.path.exists(p): SHOTS.update(json.load(open(p)))
TITLE = 'ДУБАЙ'
SEAL = dict(text='دبي', font='NotoKufiArabic.ttf', color=(176, 36, 30))
TITLE_SHOT = (203952, 3)   # Бурдж-Халифа снизу на чистом небе — буквы встают ЗА башней (маска по небу)
CHAPTERS = {1: 'КРИК', 2: 'НЕФТЬ, КОТОРОЙ МАЛО', 3: 'ЛЮДИ С ДАУ', 4: 'ВВЕРХ И В МОРЕ', 5: 'ЧУЖИМИ РУКАМИ', 6: 'МОРЕ В КРАНЕ', 7: 'ГОРОД-ПЕРЕСАДКА'}
MUS = f'{RG}/data/music'
# музыка по главам (выбор владелицы — сэмплер «Дубай»): восточные — старый Дубай и пустыня, тёплые — современный город и финал
MUSIC = {0: ('kml/desert_city.mp3', 0.30, 0.0), 1: ('kml/mirage.mp3', 0.30, 0.0), 2: ('kml/tabuk.mp3', 0.28, 0.0), 3: ('kml/desert_city.mp3', 0.30, 60.0),
         4: ('kml/inspired.mp3', 0.26, 0.0), 5: ('kml/lasting_hope.mp3', 0.26, 0.0), 6: ('kml/atlantean_twilight.mp3', 0.28, 0.0), 7: ('kml/dreamer.mp3', 0.26, 0.0)}
V0, GAP_I, GAP, CARD, HOLD_TITLE, TAIL = 0.6, 0.45, 0.7, 2.6, 5.0, 14.0
EXTRAS = {}      # (абзац, № кадра) → dict(loc='ДЕЙРА · ДУБАЙ', win=True)
NOTES = []       # (абзац, сдвиг, длительность, текст, (x, y), (x2, y2))
NUMCARDS = []    # (абзац, сдвиг, длительность, крупно, мелко)

def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)

def _shot(s, t0, d, ch, extra=None, dis=False):
    return dict(id=s[0], ss=s[1], t0=t0, dur=d, dis=dis, ch=ch, what=s[3] if len(s) > 3 else '', img=s[0] == 'img', **(extra or {}))

def build():
    voice, segs, cards, inter = [], [], [], []
    pstart = {}
    # --- вступление: холодный старт + трейлер, затем кадр с названием
    t = V0; istarts = []
    for it in INTRO_LINES:
        voice.append((t, f'{J}/vo_full/{it["id"]}.mp3')); istarts.append(t); pstart[it['id']] = t; t += it['dur'] + GAP_I
    t_title = t; intro_end = t + HOLD_TITLE
    b = [0.0] + [s - 0.15 for s in istarts[1:]] + [t_title]
    for i, it in enumerate(INTRO_LINES):
        sh = SHOTS.get(it['id'], []); ws = [s[2] for s in sh] or [1]; acc = b[i]
        for j, s in enumerate(sh):
            d = (b[i + 1] - b[i]) * s[2] / sum(ws); segs.append(_shot(s, acc, d, 0, EXTRAS.get((it['id'], j)))); acc += d
    if TITLE_SHOT: segs.append(dict(id=TITLE_SHOT[0], ss=TITLE_SHOT[1], t0=t_title, dur=HOLD_TITLE, dis=True, ch=0, img=False, title2=True))
    t = intro_end; chap_t = {0: 0.0}; plist = []
    for x in INTERS:
        if x['after'] and x['after'].startswith('c00_'):
            inter.append(dict(t=t, dur=x['sec'], shots=SHOTS.get('pause:' + x['after'], []), after=x['after'])); t += x['sec']
    for it in LINES:
        ch = int(it['id'][1:3]); first = ch not in chap_t
        if first:
            chap_t[ch] = t; cards.append(dict(t=t, ch=ch, name=CHAPTERS[ch])); t += CARD
        plist.append((t, it, first, chap_t[ch])); pstart[it['id']] = t; voice.append((t, f'{J}/vo_full/{it["id"]}.mp3')); t += it['dur'] + GAP
        for x in INTERS:
            if x['after'] == it['id']:
                inter.append(dict(t=t, dur=x['sec'], shots=SHOTS.get('pause:' + it['id'], []), after=it['id'])); t += x['sec']
    END = t - GAP + TAIL
    for k, (ts, it, first, ct) in enumerate(plist):
        a = ct if first else ts - 0.15
        nxt = plist[k + 1] if k + 1 < len(plist) else None
        z = (nxt[3] if nxt and nxt[2] else nxt[0] - 0.15) if nxt else END
        il = [x for x in inter if x['after'] == it['id']]
        if il: z = il[0]['t'] - 0.15
        sh = SHOTS.get(it['id'], []); ws = [s[2] for s in sh] or [1]; acc = a
        for j, s in enumerate(sh):
            d = (z - a) * s[2] / sum(ws); segs.append(_shot(s, acc, d, it_ch(it), EXTRAS.get((it['id'], j)), dis=first and j == 0)); acc += d
    for x in inter:
        ws2 = [q[2] for q in x['shots']] or [1]; a2 = x['t'] - 0.15
        nxt_t = min([p[0] for p in plist if p[0] > x['t']] + [END]) - 0.15
        L = nxt_t - a2 if x['after'].startswith('c00_') else x['dur']
        for q in x['shots']:
            d2 = L * q[2] / sum(ws2); segs.append(_shot(q, a2, d2, int(x['after'][1:3]))); a2 += d2
    notes = [dict(t=pstart[p] + o, dur=d, text=tx, xy=xy, to=to) for p, o, d, tx, xy, to in NOTES]
    numcards = [dict(t=pstart[p] + o, dur=d, big=bg, small=sm) for p, o, d, bg, sm in NUMCARDS]
    segs.sort(key=lambda s: s['t0'])
    return dict(voice=voice, segs=segs, cards=cards, t_title=t_title, intro_end=intro_end, END=END, chap_t=chap_t, notes=notes, numcards=numcards, inter=inter, pstart=pstart)

def it_ch(it): return int(it['id'][1:3])

if __name__ == '__main__':
    P = build(); print('END', round(P['END'], 1), 'min', round(P['END'] / 60, 1), 'shots', len(P['segs']), 'cards', [(c['ch'], round(c['t'], 1)) for c in P['cards']])
    print('нет кадров:', [i['id'] for i in ALL if i['id'] not in SHOTS])
