# upload_kit.txt: название, описание, таймкоды глав, источники фактов, подписи авторов, хэштеги.
import os, re, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
from script import CHAPTERS
from timeline import build
paras, _, total = build()
def tc(t): return f'{int(t // 60)}:{int(t % 60):02d}'
chap = [('0:00', CHAPTERS['intro'])] + [(tc(p['start']), CHAPTERS[p['name']]) for p in paras if p['name'] in CHAPTERS and p['name'] != 'intro']
from media_list import MEDIA
by = {}
for m in MEDIA.values():
    if m['source'] != 'Wikimedia Commons': continue
    lic = re.sub(r', GFDL.*', '', m['license']).replace('CC-BY-SA-2.0', 'CC BY-SA 2.0').replace('PDM, ', '')
    by.setdefault(lic, [])
    if m['author'] not in by[lic]: by[lic].append(m['author'])
credits = 'Фото Wikimedia Commons (автор — лицензия):\n' + '\n'.join(f"{l}: {', '.join(a)}" for l, a in sorted(by.items())) + \
          '\nПолный список со ссылками на каждый файл: https://github.com/res-creator/sofia-studio/blob/claude/cool-hypatia-ehnxdy/ru_geo/iceland/CREDITS.md' + \
          '\nОстальные видео и фото: Pixabay (Pixabay Content License). Карты: Natural Earth. Музыка: Mixkit (Eugenio Mininni, Michael Ramir C.).'
SRC = '''Источники фактов:
— Статистическое бюро Исландии (население на 1.01.2026): statice.is
— Лаки, 1783: Thordarson & Self (1993, 2003); Википедия «Laki»
— Хеймаэй, 1973: USGS «Lava-cooling operations during the 1973 eruption of Eldfell» (pubs.usgs.gov/of/1997/of97-724); Музей Эльдхеймар
— Эйяфьядлайёкюдль, 2010: ICAO, IATA
— Гриндавик и Сундхнукюр, 2023–2025: Метеослужба Исландии (vedur.is)
— Геотермальное тепло: Orkustofnun (Национальное энергетическое управление Исландии)
— Carbfix: Matter et al., Science, 2016
— Тресковые войны: Imperial War Museums; Википедия «Cod Wars»
— Крах 2008: доклад Специальной комиссии альтинга (2010); МВФ
— Окйёкюдль: Rice University / Университет Исландии, табличка «A letter to the future» (2019)
— Астронавты: Exploration Museum, Хусавик; NASA'''
title = 'Исландия: остров, который хочет вас выгнать. Вулканы, лёд и упрямые люди'
desc = f'''Как почти 400 тысяч человек живут на острове, который постоянно пытается их выгнать? Извержение, которое убило пятую часть страны. Город, который спас гавань, поливая лаву морской водой. Вулкан, закрывший небо над Европой. Стены против лавы в Гриндавике. Войны за треску, которые маленькая Исландия выиграла у Британии, крах банков 2008 года, похороны ледника и астронавты, которые готовились здесь к полёту на Луну.

Таймкоды:
''' + '\n'.join(f'{a} {b}' for a, b in chap) + f'''

{SRC}

{credits}

#исландия #вулканы #география #путешествия #гриндавик #страны #документальный'''
tags = 'исландия, вулкан, извержение, гриндавик, лава, эйяфьядлайёкюдль, лаки, хеймаэй, тресковые войны, крах банков 2008, ледник, география, страны мира, рейкьявик, документальный фильм'
kit = f'''UPLOAD KIT — «Исландия» (полный выпуск, {tc(total)})

НАЗВАНИЕ (до 100 знаков):
{title}

ВАРИАНТЫ НАЗВАНИЯ:
— Исландия: как живут люди на острове, который их выгоняет
— Почему Исландия не сдаётся вулканам? Лава, лёд и 400 тысяч упрямцев

ОПИСАНИЕ:
{desc}

ТЕГИ:
{tags}

ОБЛОЖКА: cover.jpg (1280×720)
СУБТИТРЫ: iceland.srt (русский)
КАТЕГОРИЯ: Образование / Путешествия
'''
open(f'{D}/upload_kit.txt', 'w').write(kit)
print(kit[:300]); print('description chars:', len(desc))
