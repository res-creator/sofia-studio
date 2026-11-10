# План полного выпуска «Япония»: таймлайн голоса, кадры, главы, музыка. Используется fetch.py и build.py.
import json, os, subprocess
D = os.path.dirname(os.path.abspath(__file__)); J = os.path.join(D, '..'); RG = os.path.join(J, '..')
import importlib.util
_s = importlib.util.spec_from_file_location('intro', f'{J}/test3/script.py')  # тексты/озвучка вступления; intro = importlib.util.module_from_spec(_s); _s.loader.exec_module(intro)
LINES = json.load(open(f'{J}/vo_full/lines.json'))
SHOTS = {}
for part in 'ABC':
    p = f'{J}/shots/{part}.json'
    if os.path.exists(p): SHOTS.update(json.load(open(p)))
CHAPTERS = {1: 'ТОКИО', 2: 'СТРАННАЯ ЯПОНИЯ', 3: 'ПОЕЗДА', 4: 'ЕДА', 5: 'КИОТО И НАРА', 6: 'ЧЕТЫРЕ СЕЗОНА', 7: 'ОНСЭНЫ',
            8: 'БЕСПОКОЙНАЯ ЗЕМЛЯ', 9: 'СОВЕТЫ ПУТЕШЕСТВЕННИКУ', 10: None}
MUS = f'{RG}/data/music'
# музыка по главам: глава → (файл, громкость). Меняется без переделки картинки.
# музыка по главам: глава → (файл, громкость, с какой секунды начинать). Громкость подобрана по замеру (≈ −30 LUFS у всех треков до приглушения под голос).
MUSIC = {0: ('do_you_shakuhachi.ogg', 0.24, 3.0), 1: ('kml/cyborg_ninja.mp3', 0.075, 0.0), 2: ('kml/eastern_thought.mp3', 0.31, 0.0),
         3: ('kml/ishikari_lore.mp3', 0.42, 0.0), 5: ('kml/tea_roots.mp3', 0.25, 4.5), 8: ('kml/ishikari_lore.mp3', 0.42, 40.0),
         10: ('do_you_shakuhachi.ogg', 0.24, 3.0)}
V0, GAP_I, GAP, CARD, HOLD_TITLE, TAIL = 1.0, 0.55, 0.7, 2.6, 5.5, 14.0
# Вступление-трейлер: (id, ss, вес) или ('img', путь, вес). Последняя строка — кадр с названием «ЯПОНИЯ» за мостом с синкансэном.
INTRO2 = [
  [(177314, 1, 1), (4431, 1, 1), (66410, 5, 1), (202740, 2, 1), (31889, 5, 1), (84908, 1, 1.2)],
  [(243075, 6, 1), (248449, 2, 1.4), ('img', 'jp/street_yanaka.jpg', 1), (44621, 2, 1)],
  [(41957, 1, 1), (147893, 4, 1), (380567, 5, 1), (181114, 1, 1.2), (246384, 2, 1), (167404, 2, 1)],
  [(136101, 10, 1), (205345, 2, 1), (173522, 1, 1), (202982, 1, 1.2)],
  [(110790, 2, 1), (208552, 3, 1), (157699, 3, 1), (218735, 1, 1), (218734, 2, 1)],
  [(44622, 3, 1), (40602, 1, 1), ('img', 'jp/toilet_buttons.jpg', 1), ('img', 'jp/owlcafe.jpg', 1), (53375, 5, 1.4)],
  [(205346, 7, 1)],
]
# Музыкальные паузы: после абзаца → (секунд, кадры). Голоса нет, музыка выходит вперёд.
INTERLUDE = {'c01_02': (12.0, [(213815, 3, 1), (20851, 2, 1)])}
# Подписи мест (слева внизу), «окно», для кадров по (абзац, номер кадра)
EXTRAS = {('c01_01', 0): dict(loc='ТОКИО'), ('c01_02', 0): dict(loc='СИБУЯ · ТОКИО'), ('c01_02', 1): dict(win=True),
          ('c01_03', 0): dict(loc='МЕТРО ТОКИО')}
# Рукописные пометки: (строка вступления, сдвиг от начала фразы, длительность, текст, (x, y) текста, (x, y) конца стрелки) в долях кадра
NOTES = [(1, 2.6, 2.8, 'урн почти нет!', (0.06, 0.24), (0.30, 0.76))]
# Карточки с цифрой: (строка вступления, сдвиг, длительность, крупно, мелко)
NUMCARDS = [(0, 2.2, 3.4, '20 СЕКУНД', 'РАНЬШЕ РАСПИСАНИЯ')]

def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)

def build():
    voice, segs, cards = [], [], []      # voice: (t, file); segs: кадры; cards: главы
    t = V0; idur = json.load(open(f'{J}/test3/vo_el/durs.json')); istarts = []
    for i, d in enumerate(idur): voice.append((t, f'{J}/test3/vo_el/{i:02d}.mp3')); istarts.append(t); t += d + GAP_I
    t_title = istarts[-1] + 0.05; intro_end = t - GAP_I + HOLD_TITLE
    b = [0.0] + [s - 0.15 for s in istarts[1:]] + [intro_end]
    for i, sh in enumerate(INTRO2):
        ws = [s[2] for s in sh]; acc = b[i]
        for j, (sid, ss, w) in enumerate(sh):
            dd = (b[i + 1] - b[i]) * w / sum(ws); segs.append(dict(id=sid, ss=ss, t0=acc, dur=dd, dis=False, ch=0, img=sid == 'img')); acc += dd
    segs[-1]['dis'] = True; segs[-1]['title2'] = True
    notes = [dict(t=istarts[i] + o, dur=d, text=tx, xy=xy, to=to) for i, o, d, tx, xy, to in NOTES]
    numcards = [dict(t=istarts[i] + o, dur=d, big=bg, small=sm) for i, o, d, bg, sm in NUMCARDS]
    t = intro_end; chap_t = {0: 0.0}; inter = []
    pstarts = []
    for it in LINES:
        ch = int(it['id'][1:3])
        if ch not in chap_t:
            chap_t[ch] = t
            if CHAPTERS.get(ch): cards.append(dict(t=t, ch=ch, name=CHAPTERS[ch])); t += CARD
            else: t += 1.2
            first = True
        else: first = False
        pstarts.append((t, it, first, chap_t[ch])); voice.append((t, f'{J}/vo_full/{it["id"]}.mp3')); t += it['dur'] + GAP
        if it['id'] in INTERLUDE:
            L, sh = INTERLUDE[it['id']]; inter.append(dict(t=t, dur=L, shots=sh, after=it['id'])); t += L
    END = t - GAP + TAIL
    for k, (ts, it, first, ct) in enumerate(pstarts):
        a = ct if first else ts - 0.15
        z = (pstarts[k + 1][3] if pstarts[k + 1][2] else pstarts[k + 1][0] - 0.15) if k + 1 < len(pstarts) else END
        il = [x for x in inter if x['after'] == it['id']]
        if il: z = il[0]['t'] - 0.15
        sh = SHOTS.get(it['id'], []); ws = [s[2] for s in sh] or [1]; acc = a
        for j, s in enumerate(sh):
            dd = (z - a) * s[2] / sum(ws); segs.append(dict(id=s[0], ss=s[1], t0=acc, dur=dd, dis=first and j == 0, ch=int(it['id'][1:3]), what=s[3] if len(s) > 3 else '', img=s[0] == 'img', **EXTRAS.get((it['id'], j), {}))); acc += dd
        for x in il:
            ws2 = [q[2] for q in x['shots']]; a2 = x['t'] - 0.15
            for q in x['shots']:
                d2 = (x['dur']) * q[2] / sum(ws2); segs.append(dict(id=q[0], ss=q[1], t0=a2, dur=d2, dis=False, ch=int(it['id'][1:3]), img=q[0] == 'img')); a2 += d2
    segs.sort(key=lambda s: s['t0'])
    return dict(voice=voice, segs=segs, cards=cards, t_title=t_title, intro_end=intro_end, END=END, chap_t=chap_t, notes=notes, numcards=numcards, inter=inter)

if __name__ == '__main__':
    P = build(); print('END', round(P['END'], 1), 'shots', len(P['segs']), 'cards', [(c['ch'], round(c['t'], 1)) for c in P['cards']])
    missing = [it['id'] for it in LINES if it['id'] not in SHOTS]; print('нет кадров:', missing)
