# Раскадровка пробного куска «Бумажные сыновья» (0:00-2:58) -> story/shots.json. Времена абсолютные, по словам озвучки.
import json, os
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_CFG = json.load(open(f'{P}/config.json')); END = float(_CFG.get('oldDuration', _CFG['duration']))
S = []
def V(at, tr=None, mv=None, sfx=None, **p):
    d = dict(at=at, p=dict(k='v2', **p), tr=tr, mv=mv, sfx=sfx or []); S.append(d)
BOY, FAT, BRO, CLK, WK, WK2, MAN, WOM = 'boy', 'father', 'brother', 'clerk', 'worker', 'worker2', 'man', 'woman'
def fig(x, y, s, who, **o): return [x, y, s, who, o]
WD = json.load(open(f'{P}/story/words_old.json'))['words']
import re as _re
_nz = lambda t: _re.sub(r'[^a-zа-я0-9]', '', t.lower().replace('ё', 'е'))
WARN = []
def W(pre, after=0.0, fb=None):
    m = _nz(pre)
    for x in WD:
        if x['start'] >= after - 0.05 and _nz(x['word']).startswith(m): return round(x['start'], 2)
    WARN.append((pre, after)); return round(fb if fb is not None else after + 0.5, 2)
def M(r=0.04, **k):
    d = dict(r=0.0)   # камера неподвижна: без наезда и рывков (замечание владелицы 19.11)
    if 'shake' in k: d['shake'] = k['shake']
    return d

# ============================================================ ХОЛОДНЫЙ СТАРТ
V(0.0, bg='doorHouse', bo={'open': 0}, figs=[],
  fx=[['compass', 1450, 330, 190, {'stop': 180, 'stopAt': 3.2, 'hlS': 1}], ['ptag', 'куда смотрит дверь?', 640, 150, 1.5, {'size': 80, 'bg': '#ffd43b'}]], mv=M(0.03))
V(3.4, bg='doorHouse', bo={'open': 0}, figs=[fig(1380, 1010, 0.9, BOY, exprs=[[3.4, 'worried'], [4.6, 'sad']], look=1, sweatAt=4.6)],
  fx=[['stamp', 5.0, 700, 560, 220], ['ptxt', 'ОТКАЗ', 960, 930, 150, 5.0, {'col': '#e2483a'}]], mv=M(0.05, kick=1, kx=25), sfx=[[5.0, 'hit', -9]])
V(5.9, bg='village', bo={'dusk': 1, 'fog': 0.35}, figs=[fig(960, 1020, 0.7, BOY, exprs=[[5.9, 'worried']], look=-1)],
  fx=[['qm', 7.2, 520, 420, 1.1], ['qm', 7.45, 960, 330, 1.4], ['qm', 7.7, 1400, 430, 1.1]], mv=M(0.04), sfx=[[7.2, 'pop', -14], [7.45, 'pop', -14], [7.7, 'pop', -14]])
V(8.0, 'dip', bg='barrack', figs=[fig(960, 1010, 0.95, BOY, seated=False, exprs=[[8.0, 'worried']], look=0.5)],
  fx=[['ptag', '16 лет', 330, 150, 8.2, {'size': 82, 'bg': '#ffd43b'}], ['ptag', 'барак', 1540, 150, 9.1, {'size': 74}]], mv=M(0.05, kick=1, kx=-25))
V(10.0, bg='photo', bo={'src': 'angel_building'}, fx=[['ptag', 'остров Ангела', 960, 120, 10.5, {'size': 74, 'bg': '#ffd43b'}]], mv=M(0.0))
V(11.6, bg='barrack', bo={'dim': 0.1}, figs=[fig(700, 1010, 0.95, BOY, exprs=[[11.6, 'sad']], look=1)],
  fx=[['ptxt', 'допрос завтра', 1300, 300, 130, 11.7, {'col': '#ffd43b'}]], mv=M(0.05))
V(13.3, bg='village', fx=[['ptag', 'деревня', 960, 150, 13.4, {'size': 76}]], mv=M(0.04, px=40))
V(14.8, bg='village', bo={'hi': [1, 2]}, fx=[['ptag', 'третий дом', 600, 190, 14.9, {'size': 72, 'bg': '#ffd43b'}], ['ptag', 'второй ряд', 1320, 190, 15.9, {'size': 72, 'bg': '#ffd43b'}]], mv=M(0.06), sfx=[[14.9, 'pop', -14], [15.9, 'pop', -14]])
V(17.3, bg='color', bo={'col': '#2a2638'}, figs=[fig(520, 1010, 0.9, BOY, exprs=[[17.3, 'worried']]), fig(1400, 1010, 0.95, FAT, flip=True, exprs=[[17.3, 'neutral']], look=-1)],
  fx=[['doc', 18.3, 960, 560, 360, 260, 'Отец', -0.05, 56], ['ptag', 'по бумагам', 960, 150, 18.9, {'size': 80, 'bg': '#f6efdc'}]], mv=M(0.04, kick=1, kx=20), sfx=[[18.3, 'pop', -12]])
V(19.9, bg='color', bo={'col': '#1f2438'}, panels=[
    {'at': 19.9, 'x': 70, 'y': 150, 'w': 870, 'h': 640, 'bg': 'doorHouse', 'figs': [fig(480, 1020, 0.9, BOY, exprs=[[19.9, 'focus']])], 'over': [['plate', 20.6, 700, 280, 1, '#f6f1e4', 90]]},
    {'at': 21.2, 'x': 980, 'y': 150, 'w': 870, 'h': 640, 'bg': 'doorHouse', 'figs': [fig(1440, 1020, 0.95, FAT, flip=True, exprs=[[21.2, 'neutral']])], 'over': [['plate', 22.0, 1220, 280, 1, '#f6f1e4', 90]]}],
  fx=[['ptxt', '«отец»', 1415, 880, 90, 21.6, {'col': '#ffffff'}], ['ptxt', 'ты', 505, 880, 90, 20.2, {'col': '#ffffff'}], ['stamp', 24.3, 960, 470, 190]], mv=M(0.025), sfx=[[24.3, 'hit', -9]])
V(25.1, 'whip2', bg='color', bo={'col': '#1a0e12'}, figs=[fig(960, 1010, 1.1, BOY, exprs=[[25.1, 'sad']], look=0.5)], fx=[['stamp', 25.7, 960, 480, 260], ['ptxt', 'ОТКАЗАТЬ', 960, 900, 150, 25.7, {'col': '#e2483a'}]], mv=M(0.045), sfx=[[25.7, 'hit', -9]])
V(26.7, bg='color', bo={'col': '#2a2638'}, fx=[['count', 26.9, 0, 31, 960, 400, {'size': 300, 'dur': 0.9, 'pl': 1}]], mv=M(0.03), sfx=[[27.2, 'counter', -14]])
V(28.5, bg='deskRoom', figs=[fig(520, 1010, 0.9, BOY, holdR='folder', exprs=[[28.5, 'worried']], look=1), fig(1400, 1010, 0.95, CLK, flip=True, exprs=[[28.5, 'neutral']], look=-1)],
  fx=[['doc', 29.2, 960, 420, 330, 230, 'Признание', 0.04, 54], ['ptag', 'признаться во всём', 960, 150, 29.2, {'size': 74, 'bg': '#ffd43b'}]], mv=M(0.045, kick=1, kx=-25))
V(30.4, bg='color', bo={'col': '#2a2638'}, figs=[fig(460, 1010, 0.8, MAN, exprs=[[30.4, 'sad']]), fig(960, 1010, 0.8, BRO, exprs=[[30.4, 'worried']]), fig(1460, 1010, 0.8, WOM, exprs=[[30.4, 'sad']])],
  fx=[['plate', 31.4, 460, 260, 'Ли', '#f6f1e4', 84], ['plate', 31.7, 960, 260, 'Чен', '#f6f1e4', 84], ['plate', 32.0, 1460, 260, 'Вонг', '#f6f1e4', 84], ['ptag', 'чужие имена', 960, 130, 30.6, {'size': 70, 'bg': '#ffd43b'}]], mv=M(0.04), sfx=[[31.4, 'pop', -12], [31.7, 'pop', -12], [32.0, 'pop', -12]])
V(33.0, bg='color', bo={'col': '#1f2438'}, figs=[fig(960, 1010, 1.0, BOY, exprs=[[33.0, 'neutral'], [34.3, 'smile']], look=0)], fx=[['ptag', 'ты придуман', 960, 150, 33.2, {'size': 84, 'bg': '#f6efdc'}]], mv=M(0.04))
V(35.0, 'dip', bg='icons', bo={'n': 40, 'rows': 4, 'frac': 1.0, 'col': '#c8a24a', 'at': 35.0}, fx=[['ptag', 'настоящие люди', 960, 150, 35.4, {'size': 84, 'bg': '#ffd43b'}]], mv=M(0.035, kick=1), sfx=[[35.4, 'pop', -14]])
V(37.5, bg='doorHouse', bo={'open': 0}, figs=[fig(1380, 1010, 0.9, BOY, exprs=[[37.5, 'sad']], look=-1)], fx=[['ptxt', 'закрытая дверь', 960, 900, 110, 39.0, {'col': '#ffffff'}]], mv=M(0.05), sfx=[[39.5, 'hit', -10]])
# титр 1882
V(40.2, 'whip2', bg='black', fx=[['ptxt', '1882', 960, 400, 300, 40.5, {'col': '#ffd43b'}], ['card', 'Дверь закрывается', 41.0, 960, 640, 130]], vig=0, mv=M(0.03))

# ============================================================ 1882
V(42.83, bg='capitol', fx=[['ptag', '1882', 300, 150, 42.9, {'size': 90, 'bg': '#ffd43b'}], ['ptxt', 'тебя ещё нет', 960, 950, 100, 43.5, {'col': '#ffffff'}]], mv=M(0.04, px=-30))
V(44.5, bg='deskRoom', bo={'tx': 1130}, figs=[fig(700, 1010, 0.9, CLK, pose='cut', holdR='pen', exprs=[[44.5, 'focus']], look=1)], fx=[['doc', 46.4, 1130, 640, 330, 220, 'Закон', 0.04, 50], ['ptag', 'закон написан', 960, 140, 47.0, {'size': 78, 'bg': '#f6efdc'}]], mv=M(0.05, kick=1, kx=25))
V(45.9, bg='photo', bo={'src': 'law', 'maxh': 860}, fx=[['ptag', 'закон 1882', 960, 120, 46.8, {'size': 74, 'bg': '#ffd43b'}]], mv=M(0.0))
V(48.6, bg='railroad', figs=[fig(560, 1020, 0.7, WK, exprs=[[48.6, 'neutral']], appear=48.6, popIn=1), fig(1250, 1020, 0.7, WK2, flip=True, exprs=[[48.8, 'neutral']], appear=48.8, popIn=1)],
  fx=[['ptag', 'Америка зовёт работников', 960, 130, 49.1, {'size': 72}]], mv=M(0.04))
V(50.4, bg='photo', bo={'src': 'rail', 'maxw': 900, 'maxh': 600}, fx=[['ptag', 'китайцы едут', 960, 120, 50.6, {'size': 74, 'bg': '#ffd43b'}]], mv=M(0.0))
V(51.9, bg='railroad', bo={'move': 1}, figs=[fig(960, 1020, 0.75, WK, exprs=[[51.9, 'worried']], look=1)], fx=[['ptag', 'Запад', 300, 150, 52.2, {'size': 80, 'bg': '#ffd43b'}], ['dim', [[51.9, 0.0], [53.0, 0.3]]]], mv=M(0.045, kick=1, kx=-25))
V(53.9, bg='railroad', figs=[fig(700, 1020, 0.8, WK, exprs=[[53.9, 'worried'], [56.2, 'sad']], look=1, sweatAt=56.4), fig(1250, 1020, 0.8, WK2, flip=True, exprs=[[53.9, 'worried']])],
  fx=[['plate', 56.2, 960, 250, '«сбивают заработки»', '#f6f1e4', 74], ['strike', 57.1, 960, 250, 700]], mv=M(0.04), sfx=[[56.2, 'pop', -12], [57.1, 'hit', -12]])
V(57.6, 'whip2', bg='capitol', fx=[['ptag', 'Вашингтон', 960, 130, 57.9, {'size': 84, 'bg': '#ffd43b'}], ], mv=M(0.045))
V(59.3, bg='photo', bo={'src': 'law', 'maxh': 860}, fx=[['ptag', 'закон об исключении китайцев', 960, 120, 59.5, {'size': 74, 'bg': '#ffd43b'}]], mv=M(0.0))

V(61.4, bg='color', bo={'col': '#2a2638'}, figs=[fig(640, 1010, 0.95, WK, exprs=[[61.4, 'worried'], [62.4, 'sad']], look=1)],
  fx=[['doc', 61.5, 1330, 560, 420, 300, 'Закон', 0.04, 60], ['stamp', 62.4, 640, 600, 220], ['ptag', 'рабочим', 640, 150, 62.4, {'size': 84, 'bg': '#ffd43b'}]], mv=M(0.05, kick=1, kx=25), sfx=[[62.4, 'hit', -9]])
V(63.2, bg='color', bo={'col': '#243046'}, figs=[fig(460, 1010, 0.8, MAN, exprs=[[63.2, 'smile']]), fig(960, 1010, 0.8, BRO, exprs=[[63.2, 'smile']]), fig(1460, 1010, 0.8, CLK, flip=True, exprs=[[63.2, 'smile']])],
  fx=[['plate', 63.4, 460, 300, 'купцы', '#f6f1e4', 78], ['plate', 64.0, 960, 300, 'студенты', '#f6f1e4', 78], ['plate', 64.6, 1460, 300, 'дипломаты', '#f6f1e4', 78], ['ptag', 'узкие двери', 960, 130, 65.8, {'size': 76, 'bg': '#ffd43b'}]], mv=M(0.04), sfx=[[63.4, 'pop', -12], [64.0, 'pop', -12], [64.6, 'pop', -12]])
V(67.4, bg='black', fx=[['ptxt', '1943', 960, 420, 320, 68.9, {'col': '#ffd43b'}], ['card', 'закон отменят', 67.6, 960, 700, 120]], vig=0, mv=M(0.03), sfx=[[68.9, 'hit', -12]])
V(70.0, bg='paper', bo={'col': '#e8dcc0'}, fx=[['doc', 70.2, 960, 540, 560, 400, 'ГРАЖДАНСТВО', 0.02, 62], ['stamp', 73.7, 960, 560, 260], ['ptag', 'по натурализации', 960, 140, 73.7, {'size': 70, 'bg': '#ffd43b'}]], mv=M(0.045), sfx=[[73.7, 'hit', -9]])
V(75.1, bg='years', bo={'a': 1882, 'b': 1909, 'at': 75.3}, fx=[['count', 76.3, 0, 27, 960, 880, {'size': 140, 'pl': 1}]], mv=M(0.03), sfx=[[76.3, 'counter', -14]])
V(78.4, bg='capitol', figs=[fig(1500, 1030, 0.75, BOY, walk={'x0': 2200, 'x1': 1500, 'at': 79.0, 'dur': 1.6}, exprs=[[78.4, 'worried']])], fx=[['dim', [[78.4, 0.3]]], ['ptxt', 'он уже знает', 960, 940, 110, 78.6, {'col': '#ffffff'}]], mv=M(0.04, px=-30))
V(81.0, bg='photoFull', bo={'src': 'canton', 'sep': 0.65, 'zoom': 1.2, 'dim': 0.3}, figs=[fig(640, 1020, 0.85, WOM, exprs=[[81.0, 'sad']]), fig(1280, 1020, 0.85, MAN, exprs=[[81.0, 'sad']], look=-1)], fx=[['ptag', 'Гуандун', 960, 130, 82.5, {'size': 90, 'bg': '#ffd43b'}], ['ptxt', 'мало земли', 960, 940, 100, 83.5, {'col': '#ffffff'}]], mv=M(0.04, kick=1, kx=20))
V(85.1, bg='doorHouse', bo={'open': 0}, fx=[['stamp', 85.7, 760, 590, 190], ['stamp', 86.1, 1000, 520, 150], ['ptxt', 'законных путей нет', 960, 940, 100, 86.0, {'col': '#2a2a33'}]], mv=M(0.045), sfx=[[85.7, 'hit', -9], [86.1, 'hit', -11]])
V(87.1, bg='black', fx=[['glow', 960, 600, [[87.1, 40], [89.4, 620]], '255,120,40', 0.7], ['ptxt', 'лазейка', 960, 420, 190, 87.6, {'col': '#ffffff'}]], vig=0, mv=M(0.05))
V(90.2, 'whip2', bg='black', fx=[['ptxt', '1906', 960, 400, 300, 90.5, {'col': '#ffd43b'}], ['card', 'Архив горит', 91.0, 960, 640, 130]], vig=0, mv=M(0.03))

# ============================================================ 1906
V(93.2, bg='sfFire', bo={'k': 1}, fx=[['ptag', '18 апреля 1906', 960, 130, 93.7, {'size': 88, 'bg': '#ffd43b'}]], mv=M(0.05, shake=[[1.2, 9], [2.4, 7]]), sfx=[[93.2, 'whoosh', -10, 0.5]])
V(95.5, bg='photo', bo={'src': 'genthe'}, fx=[['ptag', '18 апреля 1906', 960, 120, 95.7, {'size': 74, 'bg': '#ffd43b'}]], mv=M(0.0))
V(98.3, bg='archive', bo={'burn': {'kv': [[98.3, 0.1], [101.0, 1.0]], 'd': 2.6}}, fx=[['doc', 100.4, 960, 560, 400, 280, 'Запись о рождении', -0.04, 48], ['ptag', 'архивы горят', 960, 130, 98.8, {'size': 80, 'bg': '#f6efdc'}]], mv=M(0.05, kick=1, kx=-25), sfx=[[98.8, 'flash', -12]])
V(102.3, bg='color', bo={'col': '#3a2e3a'}, figs=[fig(520, 1010, 0.85, MAN, pose='up', exprs=[[102.3, 'focus']]), fig(960, 1010, 0.85, WOM, exprs=[[102.3, 'focus']]), fig(1400, 1010, 0.85, BRO, pose='up', exprs=[[102.3, 'focus']])],
  fx=[['plate', 105.0, 960, 280, '«родился здесь»', '#f6f1e4', 84], ['ptag', 'многие', 300, 130, 102.7, {'size': 76}]], mv=M(0.04), sfx=[[105.0, 'pop', -12]])
V(106.0, bg='color', bo={'col': '#2a3846'}, figs=[fig(960, 1010, 0.95, MAN, exprs=[[106.0, 'smile']])], fx=[['ok', 107.0, 1400, 580, 130], ['ptag', 'часть говорит правду', 960, 140, 106.6, {'size': 76, 'bg': '#ffd43b'}]], mv=M(0.045, kick=1, kx=20), sfx=[[107.0, 'ding', -14]])
V(107.8, bg='capitol', fx=[['ptag', 'Вашингтон, 1898', 960, 120, 108.2, {'size': 80, 'bg': '#ffd43b'}], ['ptxt', '1898', 960, 940, 170, 109.0, {'col': '#ffffff'}]], mv=M(0.045))
V(111.1, bg='color', bo={'col': '#2a3846'}, figs=[fig(620, 1010, 0.9, WOM, holdR='baby', exprs=[[111.1, 'smile']])], fx=[['doc', 112.0, 1300, 560, 440, 300, 'Гражданин', 0.03, 56], ['ptag', 'родился в Америке', 960, 130, 113.0, {'size': 78, 'bg': '#ffd43b'}], ['ok', 114.3, 1300, 700, 130]], mv=M(0.045, kick=1, kx=20), sfx=[[114.3, 'ding', -14]])
V(115.2, bg='archive', bo={'empty': 1, 'dim': 0.35}, fx=[['qm', 116.7, 560, 400, 1.6], ['qm', 117.0, 1320, 440, 1.3], ['ptag', 'архива больше нет', 960, 130, 118.4, {'size': 76, 'bg': '#f6efdc'}]], mv=M(0.04, px=-30))
V(117.6, bg='photo', bo={'src': 'worden', 'maxw': 1100, 'maxh': 860}, fx=[['ptag', 'архива больше нет', 960, 120, 118.2, {'size': 74, 'bg': '#ffd43b'}]], mv=M(0.0))
V(119.7, bg='color', bo={'col': '#1f2438'}, panels=[
    {'at': 119.7, 'x': 70, 'y': 150, 'w': 870, 'h': 640, 'bg': 'village', 'bo': {}, 'figs': [fig(480, 1020, 0.7, WOM, holdR='baby', exprs=[[119.7, 'smile']])], 'over': [['ptag', 'Китай', 700, 160, 122.2, {'size': 64}]]},
    {'at': 120.4, 'x': 980, 'y': 150, 'w': 870, 'h': 640, 'bg': 'capitol', 'figs': [fig(1440, 1020, 0.65, CLK, exprs=[[120.4, 'neutral']])], 'over': [['ptag', 'Америка', 1220, 160, 121.0, {'size': 64}]]}],
  fx=[['plate', 123.9, 960, 900, 'гражданин', '#f6f1e4', 90]], mv=M(0.025), sfx=[[123.9, 'pop', -12]])
V(124.6, bg='doorHouse', bo={'open': {'kv': [[124.6, 0], [128.8, 1]], 'd': 0.6}}, figs=[fig(1380, 1010, 0.9, BOY, walk={'x0': 1700, 'x1': 640, 'at': 128.0, 'dur': 1.5}, exprs=[[124.6, 'neutral'], [128.8, 'smile']])], fx=[['ptag', 'дверь', 960, 130, 129.0, {'size': 90, 'bg': '#ffd43b'}]], mv=M(0.05), sfx=[[128.8, 'whoosh', -14, 0.4]])
V(130.1, 'whip2', bg='paper', bo={'col': '#e8dcc0'}, fx=[['card', 'БУМАЖНЫЕ', 130.5, 960, 440, 190, 16, '#2a2a33'], ['card', 'СЫНОВЬЯ', 131.4, 960, 700, 190, 16, '#e2483a']], mv=M(0.03))
V(133.0, bg='bayNight', bo={'day': 1, 'boat': {'at': 133.0, 'dur': 3.6, 'x0': 1850, 'x1': 600}}, fx=[['plate', 136.0, 960, 230, 'у него родился сын', '#f6f1e4', 74], ['ptag', 'Китай', 300, 130, 134.0, {'size': 70}]], mv=M(0.035, px=-30), sfx=[[136.0, 'pop', -12]])
V(136.8, bg='paper', bo={'col': '#e8dcc0'}, figs=[fig(960, 1060, 1.1, MAN, exprs=[[136.8, 'smile'], [138.2, 'worried']])], fx=[['strike', 138.2, 960, 380, 700], ['plate', 137.4, 960, 380, 'сын', '#f6f1e4', 150], ['qm', 138.3, 1500, 420, 1.5]], mv=M(0.04), sfx=[[138.2, 'hit', -11]])
V(139.2, bg='color', bo={'col': '#2a2638'}, figs=[fig(440, 1010, 0.8, MAN, holdR='money', exprs=[[139.2, 'smile']]), fig(960, 1010, 0.8, WOM, exprs=[[139.2, 'neutral']]), fig(1480, 1010, 0.8, CLK, flip=True, exprs=[[139.2, 'neutral']])],
  fx=[['ptag', 'родственник', 440, 190, 140.8, {'size': 66}], ['ptag', 'сосед', 960, 190, 141.8, {'size': 66}], ['ptag', 'чужой человек', 1480, 190, 142.9, {'size': 66}], ['ptag', 'место', 960, 100, 139.5, {'size': 84, 'bg': '#ffd43b'}]], mv=M(0.04, kick=1, kx=-20), sfx=[[140.8, 'pop', -12], [141.8, 'pop', -12], [142.9, 'pop', -12]])
V(144.2, bg='paper', bo={'col': '#e8dcc0'}, fx=[['doc', 144.3, 960, 540, 640, 420, 'Фамилия', 0, 54], ['type', 'Ли', 880, 530, 120, 145.0, {}], ['ptag', 'новая фамилия', 960, 130, 144.7, {'size': 84, 'bg': '#ffd43b'}]], mv=M(0.04), sfx=[[147.7, 'ding', -14]])
V(146.0, bg='photo', bo={'src': 'paperson', 'maxh': 800}, fx=[['ptag', 'документ эпохи', 960, 120, 146.2, {'size': 74, 'bg': '#ffd43b'}], ['ok', 147.7, 1180, 640, 130]], mv=M(0.0))
V(148.6, bg='bayNight', bo={'day': 1, 'boat': {'at': 148.6, 'dur': 4.8, 'x0': 1900, 'x1': 520}}, fx=[['ptag', '1882 - 1943', 960, 150, 150.2, {'size': 86, 'bg': '#ffd43b'}]], mv=M(0.035, px=-30))
V(153.7, bg='color', bo={'col': '#1f2438'}, fx=[['count', 154.9, 0, 300000, 960, 420, {'size': 240, 'dur': 2.0, 'unit': 'китайцев (оценка)', 'usize': 100, 'ucol': '#ffffff'}]], mv=M(0.03), sfx=[[154.9, 'counter', -14]])
V(157.0, bg='color', bo={'col': '#2a2638'}, fx=[['iconrow', 10, 360, 560, 130, 1.5, {'hi': [0, 1, 2, 3, 4, 5, 6, 7, 8], 'at': 159.3, 'step': 0.12, 'col': '#e2483a'}], ['ptag', 'оценка историков', 960, 150, 157.4, {'size': 80}], ['ptxt', 'подавляющее большинство?', 960, 880, 100, 160.0, {'col': '#ffd43b'}]], mv=M(0.035), sfx=[[159.3, 'pop', -14]])
V(162.5, bg='black', fx=[['qm', 162.8, 960, 520, 3.0], ['ptag', 'точных подсчётов нет', 960, 880, 163.0, {'size': 84}]], vig=0, mv=M(0.04))
V(164.3, bg='paper', bo={'col': '#f0e8d4'}, fx=[['sub', 164.7]], figs=[fig(520, 1040, 1.1, BOY, exprs=[[164.3, 'smile']])], mv=M(0.025))
V(172.7, 'dip', bg='years', bo={'a': 1906, 'b': 1925, 'at': 172.8}, figs=[fig(1500, 1030, 0.8, BOY, appear=177.4, popIn=1, exprs=[[177.4, 'smile']])], fx=[['ptag', 'Ли', 1500, 340, 178.0, {'size': 90, 'bg': '#ffd43b'}], ['count', 173.2, 0, 19, 960, 880, {'size': 130, 'pl': 1}]], mv=M(0.03))


exec(open(f'{P}/story/ch_full.py').read())

# ------------------------------------------------------------ единый стиль «вырезки на архивных фото»
FULL = ('dorm', 'chinatown', 'calcapitol', 'canton', 'angel_building', 'genthe', 'worden', 'leaving', 'lawrence', 'carved', 'poetry')
FLAT = ('photo', 'photoFull', 'black', 'paper', 'color', 'icons', 'years')
for s in S:
    p = s['p']; bg = p.get('bg')
    if bg == 'photo' and p['bo'].get('src') in FULL: p['bg'] = 'photoFull'; p['bo'] = dict(src=p['bo']['src'], sep=0.65)
    if p.get('figs'): p['sticker'] = 1
    p['grain'] = 0.15
    if p['bg'] not in ('photo', 'photoFull', 'black') and not s.get('tint'): s['tint'] = 'sepia'

# ------------------------------------------------------------ сборка
S.sort(key=lambda s: s['at']); shots = []; SFXL = []
for i, s in enumerate(S):
    en = S[i + 1]['at'] if i + 1 < len(S) else END
    d = dict(id=f'p{i + 1:03d}', start=round(s['at'], 3), end=round(en, 3), params=s['p'])
    if s['tr']: d['in'] = {'type': s['tr']} if s['tr'] in ('whip2', 'impact', 'drop', 'lightning') else {'type': s['tr'], 'dur': 0.35 if s['tr'] != 'dip' else 0.6}
    d['mv'] = s['mv'] or dict(r=0.0)
    if s.get('tint'): d['tint'] = s['tint']
    shots.append(d)
    for c in s['sfx']: SFXL.append(dict(t=round(c[0], 3), name=c[1], gain=c[2], **({'dur': c[3]} if len(c) > 3 else {})))
    if s['tr'] == 'whip2': SFXL.append(dict(t=round(s['at'], 3), name='swish', gain=-12))
json.dump(dict(duration=float(_CFG['duration']), shots=shots, sfx=sorted(SFXL, key=lambda c: c['t'])), open(f'{P}/story/shots.json', 'w'), ensure_ascii=False, indent=1)
print(len(shots), 'shots; longest:', max((s['end'] - s['start'], s['id']) for s in shots))
