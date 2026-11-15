# Пакет для загрузки «Третья мировая»: субтитры ww3.srt (по словам из timeline/words.json), описание с главами, CREDITS.md.
import json, os, re
J = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(os.path.dirname(J))
P = f'{R}/2d-video/projects/ww3'
W = json.load(open(f'{P}/timeline/words.json'))['words']
SEG = json.load(open(f'{J}/vo_full/segments_el.json'))
def srt_t(t): ms = int(round(t * 1000)); return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'
def two(s):
    if len(s) <= 42: return s
    m = len(s) // 2; i = min((k for k in range(len(s)) if s[k] == ' '), key=lambda k: abs(k - m)); return s[:i] + '\n' + s[i + 1:]
subs, cur = [], []
for w in W:
    cur.append(w); txt = ' '.join(x['word'] for x in cur)
    end = re.search(r'[.!?…»]$', w['word']) and len(txt) > 25
    if len(txt) > 70 or end or (re.search(r'[,—:;]$', w['word']) and len(txt) > 45):
        subs.append([cur[0]['start'], cur[-1]['end'], txt]); cur = []
if cur: subs.append([cur[0]['start'], cur[-1]['end'], ' '.join(x['word'] for x in cur)])
for a, b in zip(subs, subs[1:]): a[1] = min(max(a[1], a[0] + 0.8), b[0] - 0.02)
open(f'{J}/ww3.srt', 'w').write(''.join(f'{k + 1}\n{srt_t(a)} --> {srt_t(b)}\n{two(s)}\n\n' for k, (a, b, s) in enumerate(subs)))
# главы: титр главы стоит в тишине 2,4 с перед первым абзацем
def tc(t): t = max(0, int(t)); return f'{t // 60}:{t % 60:02d}'
NAMES = {'ХОЛОДНЫЙ СТАРТ': 'Ночь 26 сентября 1983 года', 'ПЕРВЫЙ ЧАС': 'Первый час', 'ПЕРВЫЕ СУТКИ И ПЕРВЫЙ МЕСЯЦ': 'Первые сутки и первый месяц',
         'ГОД: ЯДЕРНАЯ ЗИМА': 'Год: ядерная зима', 'ДЕСЯТЬ ЛЕТ И ДАЛЬШЕ': 'Десять лет и дальше', 'СЕМЬ РАЗ НА ГРАНИ': 'Семь раз на грани',
         'ПОЧЕМУ ЭТОГО ДО СИХ ПОР НЕ СЛУЧИЛОСЬ': 'Почему этого до сих пор не случилось'}
ch = [(0 if i == 0 else s['t'] - 2.4, NAMES.get(s['title'], s['title'].capitalize())) for i, s in enumerate(x for x in SEG if x['kind'] == 'chapter')]
arch = json.load(open(f'{J}/archive.json'))['clips']
caps = {}
for s in json.load(open(f'{P}/story/shots.json'))['shots']:
    if s['tpl'] == 'archive': caps.setdefault(s['params']['clip'], []).append(s['params'].get('caption') or '')
NAME = {'iss_earth_exp65': 'Земля с МКС (Экспедиция 65)', 'aurora_alaska': 'Северное сияние, Аляска (NASA SVS)'}
def cap(c): return NAME.get(c['id']) or sorted(set(x for x in caps[c['id']] if x), key=len)[0]
cred = [f"- {cap(c)}: {c['author']} — {c['source']}, {c['license']} — {c['page']}" for c in arch if c['id'] in caps]
short = [f"{cap(c)} — {c['author']} ({c['license'].split('(')[0].strip()})" for c in arch if c['id'] in caps]
open(f'{J}/CREDITS.md', 'w').write('# «Что будет, если начнётся Третья мировая» — архив и лицензии\n\n' + '\n'.join(cred) +
    '\n\nАнимация, карты, схемы и графика — нарисованы в коде (2D-студия проекта). Музыка и звуковые эффекты сгенерированы локально (без чужих треков).\n'
    'Голос диктора — ElevenLabs (eleven_v3, голос Todd).\n')
kit = f'''UPLOAD KIT — «Что будет, если начнётся Третья мировая» (полный выпуск, {tc(SEG[-1]['t'] + SEG[-1]['dur'] + 3)})

НАЗВАНИЕ (до 100 знаков):
Что будет, если начнётся Третья мировая? Первый час, год, десять лет

ВАРИАНТЫ НАЗВАНИЯ:
- Третья мировая: что посчитали учёные. Час за часом, год за годом
- 7 раз мир был на грани ядерной войны. Что было бы дальше?

ОПИСАНИЕ:
26 сентября 1983 года компьютер под Москвой написал одно слово: «Старт». Дежурный офицер Станислав Петров решил, что это ошибка — и оказался прав. А что, если однажды рядом не окажется своего Петрова? Мы пройдём по часам: первый час, сутки, месяц, год, десять лет. Без страшилок и без политики — только то, что посчитали учёные (ядерная зима, урожай, острова, которые смогут себя прокормить) и то, что уже случалось в истории: Хиросима, Чернобыль, атолл Бикини. И семь раз, когда мир был ближе к краю, чем кажется.

Таймкоды:
''' + '\n'.join(f'{tc(t)} {n}' for t, n in ch) + f'''

Источники (главные): SIPRI Yearbook 2026; Bulletin of the Atomic Scientists (Часы Судного дня, январь 2026); Coupe et al., JGR Atmospheres 2019; Xia et al., Nature Food 2022; Boyd & Wilson, Risk Analysis 2023; материалы музеев и архивов Хиросимы и NARA.

Озвучка сделана с помощью ИИ, факты проверены по источникам. Анимация, карты и графика нарисованы в коде; музыка сгенерирована (без чужих треков).
В фильме упомянут наш выпуск про Исландию — он есть на канале.

Архивные кадры (общественное достояние и свободные лицензии):
''' + '\n'.join(short) + f'''

#третьямировая #ядернаязима #история #наука #сквозьстраны #документальный #петров

ТЕГИ:
третья мировая война, что будет если, ядерная война, ядерная зима, станислав петров, василий архипов, карибский кризис, хиросима, чернобыль, атолл бикини, часы судного дня, история, наука, документальный фильм, сквозь страны

ЗАКРЕПЛЁННЫЙ КОММЕНТАРИЙ:
Какая из семи историй удивила вас больше всего? Напишите цифру от 1 до 7. А если бы вы сидели на месте Петрова — что бы вы доложили?

ПРИ ЗАГРУЗКЕ: отметить «Изменённый или синтетический контент» — Да (голос диктора создан ИИ).
СУБТИТРЫ: ww3.srt (русский, отдельной дорожкой)
КАТЕГОРИЯ: Образование
'''
open(f'{J}/upload_kit.txt', 'w').write(kit)
print(len(subs), 'subs;', ch)
