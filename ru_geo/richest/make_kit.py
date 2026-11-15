# Пакет для загрузки «Третья мировая»: субтитры ww3.srt (по словам из timeline/words.json), описание с главами, CREDITS.md.
import json, os, re
J = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(os.path.dirname(J))
P = f'{R}/2d-video/projects/richest'
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
open(f'{J}/richest.srt', 'w').write(''.join(f'{k + 1}\n{srt_t(a)} --> {srt_t(b)}\n{two(s)}\n\n' for k, (a, b, s) in enumerate(subs)))
# главы: титр главы стоит в тишине 2,4 с перед первым абзацем
def tc(t): t = max(0, int(t)); return f'{t // 60}:{t % 60:02d}'
NAMES = {'ХОЛОДНЫЙ СТАРТ': 'Каир, 1324: золото подешевело', 'КАК ИЗМЕРИТЬ БОГАТСТВО': 'Как измерить богатство', 'ПРАВИТЕЛИ: ОТДЕЛЬНАЯ ЛИГА': 'Правители: отдельная лига',
         'ОТ СЕДЬМОГО ДО ЧЕТВЁРТОГО': 'От седьмого до четвёртого', 'ТРОЕ НАВЕРХУ': 'Трое наверху', 'А СЕГОДНЯ?': 'А сегодня?', 'ВЕРДИКТ': 'Вердикт'}
ch = [(0 if i == 0 else s['t'] - 2.4, NAMES.get(s['title'], s['title'].capitalize())) for i, s in enumerate(x for x in SEG if x['kind'] == 'chapter')]
arch = json.load(open(f'{J}/archive.json'))['clips']
caps = {}
for s in json.load(open(f'{P}/story/shots.json'))['shots']:
    if s['tpl'] == 'archive': caps.setdefault(s['params']['clip'], []).append(s['params'].get('caption') or '')
NAME = {}
def cap(c): return NAME.get(c['id']) or sorted(set(x for x in caps[c['id']] if x), key=len)[0]
cred = [f"- {cap(c)}: {c['author']} — Wikimedia Commons, {c['license']} — {c['page']}" for c in arch if c['id'] in caps]
short = [(f"{cap(c)} — общественное достояние" if c['author'] == 'см. страницу файла' else f"{cap(c)} — {c['author']} ({c['license'].split('(')[0].strip()})") for c in arch if c['id'] in caps]
open(f'{J}/CREDITS.md', 'w').write('# «Кто был самым богатым человеком в истории?» — изображения и лицензии\n\n' + '\n'.join(cred) +
    '\n\nАнимация, карты, схемы и графика — нарисованы в коде (2D-студия проекта). Музыка и звуковые эффекты сгенерированы локально.\n'
    'Голос диктора — ElevenLabs (eleven_v3, голос Todd).\n')
kit = f'''UPLOAD KIT — «Кто был самым богатым человеком в истории?» (полный выпуск, {tc(SEG[-1]['t'] + SEG[-1]['dur'] + 3)})

НАЗВАНИЕ (до 100 знаков):
Кто был самым богатым человеком в истории? Не Манса Муса и не тот, о ком вы думаете

ВАРИАНТЫ НАЗВАНИЯ:
- Самый богатый человек в истории: честный рейтинг от Рима до Маска
- «400 миллиардов Мансы Мусы» — миф? Кто на самом деле был богаче всех

ОПИСАНИЕ:
В 1324 году правитель Мали Манса Муса прошёл через Каир — и золото в городе подешевело. Сегодня в интернете пишут, что у него было 400 миллиардов долларов. Откуда взялась эта цифра — и кто на самом деле был самым богатым человеком в истории? Мы сравниваем честно: по доле экономики своей страны и по разрыву с обычным человеком. Красс и пожары Рима, Фуггер, который купил императору корону, Рокфеллер, чьё состояние было больше бюджета США, неожиданный номер один из средневековой Англии — и Илон Маск, первый триллионер.

Таймкоды:
''' + '\n'.join(f'{tc(t)} {n}' for t, n in ch) + f'''

Источники (главные): аль-Умари (пер. Levtzion & Hopkins, 1981); W. Schultz (2006); Плиний, Плутарх, Светоний; Klepper & Gunther, «The Wealthy 100» (1996); Beresford & Rubinstein, «The Richest of the Rich» (2007); G. Steinmetz, «The Richest Man Who Ever Lived» (2015); R. Chernow, «Titan» (1998); Forbes и Bloomberg (ноябрь 2026); Всемирный банк (2025).

Озвучка сделана с помощью ИИ, факты проверены по источникам. Анимация, карты и графика нарисованы в коде; музыка сгенерирована (без чужих треков).

Изображения (Wikimedia Commons, общественное достояние и свободные лицензии):
''' + '\n'.join(short) + f'''

#самыйбогатый #история #деньги #мансамуса #рокфеллер #сквозьстраны #документальный

ТЕГИ:
самый богатый человек в истории, манса муса, рокфеллер, фуггер, красс, карнеги, вандербильт, илон маск, триллионер, богатство, история денег, документальный фильм, сквозь страны

ЗАКРЕПЛЁННЫЙ КОММЕНТАРИЙ:
Какая линейка честнее: доля экономики своей страны или во сколько раз ты богаче среднего жителя? И кого вы ставите на первое место — Красса, Фуггера, Рокфеллера, Маска или Алана Рыжего?

ПРИ ЗАГРУЗКЕ: отметить «Изменённый или синтетический контент» — Да (голос диктора создан ИИ).
СУБТИТРЫ: richest.srt (русский, отдельной дорожкой)
КАТЕГОРИЯ: Образование
'''
open(f'{J}/upload_kit.txt', 'w').write(kit)
print(len(subs), 'subs;', ch)
