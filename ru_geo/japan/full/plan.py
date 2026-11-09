# План полного выпуска «Япония»: таймлайн голоса, кадры, главы, музыка. Используется fetch.py и build.py.
import json, os, subprocess
D = os.path.dirname(os.path.abspath(__file__)); J = os.path.join(D, '..'); RG = os.path.join(J, '..')
import importlib.util
_s = importlib.util.spec_from_file_location('intro', f'{J}/test3/script.py'); intro = importlib.util.module_from_spec(_s); _s.loader.exec_module(intro)
LINES = json.load(open(f'{J}/vo_full/lines.json'))
SHOTS = {}
for part in 'ABC':
    p = f'{J}/shots/{part}.json'
    if os.path.exists(p): SHOTS.update(json.load(open(p)))
CHAPTERS = {1: 'ТОКИО', 2: 'СТРАННАЯ ЯПОНИЯ', 3: 'ПОЕЗДА', 4: 'ЕДА', 5: 'КИОТО И НАРА', 6: 'ЧЕТЫРЕ СЕЗОНА', 7: 'ОНСЭНЫ',
            8: 'БЕСПОКОЙНАЯ ЗЕМЛЯ', 9: 'СОВЕТЫ ПУТЕШЕСТВЕННИКУ', 10: None}
MUS = f'{RG}/data/music'
# музыка по главам: глава → (файл, громкость). Меняется без переделки картинки.
MUSIC = {0: ('do_you_shakuhachi.ogg', 0.24), 1: ('kml/cyborg_ninja.mp3', 0.16), 3: ('kml/ishikari_lore.mp3', 0.22),
         5: ('kml/tea_roots.mp3', 0.20), 8: ('kml/ishikari_lore.mp3', 0.22), 10: ('do_you_shakuhachi.ogg', 0.24)}
V0, GAP_I, GAP, CARD, HOLD_TITLE, TAIL = 1.0, 0.55, 0.7, 2.6, 4.5, 4.0

def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)

def build():
    voice, segs, cards = [], [], []      # voice: (t, file); segs: кадры; cards: главы
    t = V0; idur = json.load(open(f'{J}/test3/vo_el/durs.json')); istarts = []
    for i, d in enumerate(idur): voice.append((t, f'{J}/test3/vo_el/{i:02d}.mp3')); istarts.append(t); t += d + GAP_I
    t_title = istarts[-1] + 0.05; intro_end = t - GAP_I + HOLD_TITLE
    b = [0.0] + [s - 0.15 for s in istarts[1:]] + [intro_end]
    for i, l in enumerate(intro.LINES):
        ws = [s[2] for s in l['shots']]; acc = b[i]
        for j, (sid, ss, w) in enumerate(l['shots']):
            dd = (b[i + 1] - b[i]) * w / sum(ws); segs.append(dict(id=sid, ss=ss, t0=acc, dur=dd, dis=False, ch=0)); acc += dd
    segs[-1]['dis'] = True
    t = intro_end; chap_t = {0: 0.0}
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
    END = t - GAP + TAIL
    for k, (ts, it, first, ct) in enumerate(pstarts):
        a = ct if first else ts - 0.15
        z = (pstarts[k + 1][3] if pstarts[k + 1][2] else pstarts[k + 1][0] - 0.15) if k + 1 < len(pstarts) else END
        sh = SHOTS.get(it['id'], []); ws = [s[2] for s in sh] or [1]; acc = a
        for j, s in enumerate(sh):
            dd = (z - a) * s[2] / sum(ws); segs.append(dict(id=s[0], ss=s[1], t0=acc, dur=dd, dis=first and j == 0, ch=int(it['id'][1:3]), what=s[3] if len(s) > 3 else '')); acc += dd
    return dict(voice=voice, segs=segs, cards=cards, t_title=t_title, intro_end=intro_end, END=END, chap_t=chap_t)

if __name__ == '__main__':
    P = build(); print('END', round(P['END'], 1), 'shots', len(P['segs']), 'cards', [(c['ch'], round(c['t'], 1)) for c in P['cards']])
    missing = [it['id'] for it in LINES if it['id'] not in SHOTS]; print('нет кадров:', missing)
