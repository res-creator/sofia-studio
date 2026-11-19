import json, os
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def fig(x, y, s, who, **o): return [x, y, s, who, o]
SH = []
def add(a, b, **p): SH.append(dict(id=f's{len(SH)+1:02d}', start=a, end=b, params=dict(k='v2', sticker=1, grain=0.16, **p), mv=dict(r=0.0)))
add(8.0, 11.0, bg='photoFull', bo=dict(src='angel_building', sep=0.6), figs=[fig(1250, 1070, 1.25, 'boy', exprs=[[8, 'worried']], look=0.5)], fx=[['ptag', '16 лет', 330, 150, 8.2, {'size': 82, 'bg': '#ffd43b'}], ['ptxt', 'допрос завтра', 640, 880, 120, 9.0, {'col': '#fbf8f0'}]])
add(28.5, 31.0, bg='photoFull', bo=dict(src='poetry', dim=0.35, br=1.1), figs=[fig(560, 1070, 1.2, 'boy', holdR='folder', exprs=[[28.5, 'worried']], look=1), fig(1380, 1070, 1.25, 'clerk', flip=True, exprs=[[28.5, 'neutral']], look=-1)], fx=[['doc', 29.2, 960, 470, 330, 230, 'Признание', 0.04, 54], ['ptag', 'признаться во всём', 960, 130, 29.2, {'size': 74, 'bg': '#ffd43b'}]])
add(46.0, 49.0, bg='photoFull', bo=dict(src='law', dim=0.45, sep=0.8, dy=-250), figs=[fig(560, 1070, 1.2, 'clerk', pose='cut', holdR='pen', exprs=[[46, 'focus']], look=1)], fx=[['ptag', 'закон 1882', 1300, 150, 46.8, {'size': 84, 'bg': '#ffd43b'}]])
add(95.5, 98.3, bg='photoFull', bo=dict(src='genthe', sep=0.7, dim=0.2), figs=[fig(380, 1070, 1.15, 'boy', exprs=[[95.5, 'worried']], look=1, sweatAt=96.5)], fx=[['ptag', '18 апреля 1906', 960, 130, 95.7, {'size': 88, 'bg': '#ffd43b'}]])
add(117.6, 119.7, bg='photoFull', bo=dict(src='worden', sep=0.7, dim=0.3), figs=[fig(1450, 1070, 1.2, 'woman', holdR='baby', exprs=[[117.6, 'sad']], look=-1)], fx=[['qm', 118.4, 700, 420, 1.6], ['ptag', 'архива больше нет', 960, 130, 118.2, {'size': 80, 'bg': '#ffd43b'}]])
json.dump(dict(duration=178.22, shots=SH, sfx=[]), open(f'{P}/story/shots.json', 'w'), ensure_ascii=False, indent=1)
print(len(SH))
