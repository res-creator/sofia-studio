# CREDITS.md: какой исходник в каком плане, автор, лицензия, ссылка. Плюс блок «Источники» для описания на YouTube
# (для CC BY / CC BY-SA обязательно указать автора, лицензию и ссылку).
import os, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
from media_list import MEDIA, SHOTS
from timeline import build

def fmt(t): return f'{int(t // 60)}:{t % 60:04.1f}'

_, shots, total = build()
used, where = [], {}
for sh in shots:
    ks = ([sh['m']] if sh.get('m') else []) + [p['m'] for p in sh.get('split', [])] + ([sh['card']['m']] if sh.get('card') else [])
    for k in ks:
        if k not in used: used.append(k)
        where.setdefault(k, []).append(fmt(sh['start']))

L = ['# Источники пилота «Норвегия» v2', '',
     'Все кадры — с лицензиями, разрешающими коммерческое использование. Для CC BY и CC BY-SA обязательна подпись автора',
     '(она есть в блоке для описания YouTube ниже). Карты и инфографика нарисованы нами из данных Natural Earth (public domain).', '',
     '| Время в ролике | Что в кадре | Где снято | Автор | Лицензия | Ссылка |', '|---|---|---|---|---|---|']
for k in used:
    m = MEDIA[k]
    L.append(f"| {', '.join(where[k])} | {m['what']} | {m['place']} | {m['author']} | {m['license']} | {m['page']} |")
L += ['', '## Прочее', '',
      '- Карты: Natural Earth (NE1_HR рельеф, границы, береговые линии), public domain. Нарисованы скриптами `maps.py`, `../lib/geo.py`.',
      '- Музыка: Mixkit «Wind Leaves» (Eugenio Mininni), Mixkit Stock Music Free License.',
      '- Голос: Fish Audio, публичная модель «Энергичный Рассказчик» (`48ec28a45588422b977a86460c11977f`), модель s2.1-pro-free. См. ограничения в README.',
      '- Шрифты: Inter, Caveat (Google Fonts, SIL OFL).', '',
      '## Блок для описания YouTube', '', '```', 'Видео и фото:']
for k in used:
    m = MEDIA[k]
    if m.get('source') == 'Mixkit': continue
    L.append(f"— {m['place']}: {m['author']}, {m['license']}, {m['page']}")
L += ['— Остальные видео: Mixkit (mixkit.co).', 'Карты: Natural Earth. Музыка: Mixkit «Wind Leaves» (Eugenio Mininni).', '```']
open(f'{D}/CREDITS.md', 'w').write('\n'.join(L) + '\n')
print('CREDITS.md', len(used), 'sources')
