# CREDITS.md: какой исходник в каком плане, автор, лицензия, ссылка + блок для описания YouTube (CC BY / BY-SA — автор обязателен).
import os, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
from media_list import MEDIA
from timeline import build

def fmt(t): return f'{int(t // 60)}:{int(t % 60):02d}'

_, shots, total = build()
used, where = [], {}
for sh in shots:
    ks = ([sh['m']] if sh.get('m') else []) + [p['m'] for p in sh.get('split', []) + sh.get('seq', []) if p.get('m')] + ([sh['card']['m']] if sh.get('card') else []) + \
         [p['card']['m'] for p in sh.get('seq', []) if p.get('card')]
    for k in ks:
        if k not in used: used.append(k)
        where.setdefault(k, []).append(fmt(sh['start']))
L = ['# Источники выпуска «Исландия»', '',
     'Все кадры — с лицензиями, которые разрешают коммерческое использование: Pixabay Content License (подпись не обязательна, но мы её даём),',
     'Wikimedia Commons и Flickr (CC0 / public domain / CC BY / CC BY-SA / OGL / «Attribution» — подпись автора обязательна, она есть в блоке для YouTube ниже).',
     'Новостное видео Kanal13 (Гриндавик, 16.11.2023) опубликовано автором под CC BY 3.0 (лицензия подтверждена на Wikimedia Commons), логотип канала обрезан, автор указан.',
     'Кадры с пометкой «иллюстрация» сняты не в Исландии и на экране не подписаны как Исландия. Карты и инфографика нарисованы нами из данных Natural Earth (public domain).', '',
     '| Время в ролике | Что в кадре | Где снято | Автор | Лицензия | Ссылка |', '|---|---|---|---|---|---|']
for k in used:
    m = MEDIA[k]
    L.append(f"| {', '.join(where[k][:6])}{' …' if len(where[k]) > 6 else ''} | {m['what']} | {m['place']} | {m['author']} | {m['license']} | {m['page']} |")
L += ['', '## Источники фактов', ''] + [x for x in ['— Статистическое бюро Исландии (население на 1.01.2026): statice.is', '— Лаки, 1783: Thordarson & Self (1993, 2003); Википедия «Laki»', '— Хеймаэй, 1973: USGS «Lava-cooling operations during the 1973 eruption of Eldfell» (pubs.usgs.gov/of/1997/of97-724); Музей Эльдхеймар', '— Эйяфьядлайёкюдль, 2010: ICAO, IATA', '— Гриндавик и Сундхнукюр, 2023–2025: Метеослужба Исландии (vedur.is)', '— Геотермальное тепло: Orkustofnun (Национальное энергетическое управление Исландии)', '— Carbfix: Matter et al., Science, 2016', '— Тресковые войны: Imperial War Museums; Википедия «Cod Wars»', '— Крах 2008: доклад Специальной комиссии альтинга (2010); МВФ', '— Окйёкюдль: Rice University / Университет Исландии, табличка «A letter to the future» (2019)', '— Астронавты: Exploration Museum, Хусавик; NASA']]
L += ['', '## Прочее', '',
      '- Карты: Natural Earth (рельеф NE1_HR, границы, береговые линии), public domain. Скрипты `maps.py`, `../lib/geo.py`.',
      '- Музыка: Mixkit — «Wind Leaves», «Your Breath», «Forest Walk» (Eugenio Mininni), «I\'m Going Home» (Michael Ramir C.); Mixkit Stock Music Free License.',
      '- Голос: ElevenLabs (модель v3), голос Todd (Clear, Engaging and Educational) из Voice Library; платный тариф Creator — коммерческое использование разрешено.',
      '- Шрифты: Inter, Caveat (Google Fonts, SIL OFL).', '',
      '## Блок для описания YouTube', '', '```', 'Фото и видео:']
seen = set()
for k in used:
    m = MEDIA[k]
    if m['source'] not in ('Wikimedia Commons', 'Flickr') or m['page'] in seen: continue
    seen.add(m['page'])
    L.append(f"— {m['what']}: {m['author'] or 'автор не указан'}, {m['license']}, {m['page']}")
L += ['— Остальные видео и фото: Pixabay (pixabay.com), Pixabay Content License.',
      'Карты: Natural Earth. Музыка: Mixkit (Eugenio Mininni, Michael Ramir C.).', '```']
open(f'{D}/CREDITS.md', 'w').write('\n'.join(L) + '\n')
print('CREDITS.md', len(used), 'sources;', len(seen), 'Commons')
