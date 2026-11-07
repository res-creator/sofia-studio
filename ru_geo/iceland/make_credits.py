# CREDITS.md: какой исходник в каком плане, автор, лицензия, ссылка + блок для описания YouTube (CC BY / BY-SA — автор обязателен).
import os, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
from media_list import MEDIA
from timeline import build

def fmt(t): return f'{int(t // 60)}:{int(t % 60):02d}'

_, shots, total = build()
used, where = [], {}
for sh in shots:
    ks = ([sh['m']] if sh.get('m') else []) + [p['m'] for p in sh.get('split', [])] + ([sh['card']['m']] if sh.get('card') else [])
    for k in ks:
        if k not in used: used.append(k)
        where.setdefault(k, []).append(fmt(sh['start']))
L = ['# Источники выпуска «Исландия»', '',
     'Все кадры — с лицензиями, которые разрешают коммерческое использование: Pixabay Content License (подпись не обязательна, но мы её даём),',
     'Wikimedia Commons (CC0 / public domain / CC BY / CC BY-SA / OGL / «Attribution» — подпись автора обязательна, она есть в блоке для YouTube ниже).',
     'Кадры с пометкой «иллюстрация» сняты не в Исландии и на экране не подписаны как Исландия. Карты и инфографика нарисованы нами из данных Natural Earth (public domain).', '',
     '| Время в ролике | Что в кадре | Где снято | Автор | Лицензия | Ссылка |', '|---|---|---|---|---|---|']
for k in used:
    m = MEDIA[k]
    L.append(f"| {', '.join(where[k][:6])}{' …' if len(where[k]) > 6 else ''} | {m['what']} | {m['place']} | {m['author']} | {m['license']} | {m['page']} |")
L += ['', '## Прочее', '',
      '- Карты: Natural Earth (рельеф NE1_HR, границы, береговые линии), public domain. Скрипты `maps.py`, `../lib/geo.py`.',
      '- Музыка: Mixkit — «Wind Leaves», «Your Breath», «Forest Walk» (Eugenio Mininni), «I\'m Going Home» (Michael Ramir C.); Mixkit Stock Music Free License.',
      '- Голос: ElevenLabs (модель v3), голос Leonid Fomichev из Voice Library; платный тариф Creator — коммерческое использование разрешено.',
      '- Шрифты: Inter, Caveat (Google Fonts, SIL OFL).', '',
      '## Блок для описания YouTube', '', '```', 'Фото и видео:']
seen = set()
for k in used:
    m = MEDIA[k]
    if m['source'] != 'Wikimedia Commons' or m['page'] in seen: continue
    seen.add(m['page'])
    L.append(f"— {m['what']}: {m['author'] or 'автор не указан'}, {m['license']}, {m['page']}")
L += ['— Остальные видео и фото: Pixabay (pixabay.com), Pixabay Content License.',
      'Карты: Natural Earth. Музыка: Mixkit (Eugenio Mininni, Michael Ramir C.).', '```']
open(f'{D}/CREDITS.md', 'w').write('\n'.join(L) + '\n')
print('CREDITS.md', len(used), 'sources;', len(seen), 'Commons')
