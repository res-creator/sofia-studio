# Upload kit «Япония»: описание с главами и авторами, CREDITS.md, субтитры japan.srt (тайминг по файлам озвучки, внутри — по длине фраз).
import json, os, re, collections, importlib.util
from plan import build, LINES, J, CHAPTERS
P = build()
def tc(t): t = int(t); return f'{t // 60}:{t % 60:02d}'
# ---------- субтитры ----------
_s = importlib.util.spec_from_file_location('intro', f'{J}/test3/script.py'); intro = importlib.util.module_from_spec(_s); _s.loader.exec_module(intro)
texts = [l['tag'] + l['text'] for l in intro.LINES] + [i['text'] for i in LINES]
from plan import dur
def chunks(text):
    text = re.sub(r'\[[^\]]+\]\s*', '', text).replace('—', '-').strip()
    parts = re.split(r'(?<=[.!?…])\s+', text); out = []
    for p in parts:
        while len(p) > 84:
            cut = p.rfind(' ', 0, 80); cut = p.rfind(', ', 0, 80) + 1 if p.rfind(', ', 0, 80) > 40 else cut
            out.append(p[:cut].strip()); p = p[cut:].strip()
        if p: out.append(p)
    return out
def two_lines(s):
    if len(s) <= 42: return s
    m = len(s) // 2; i = min((k for k in range(len(s)) if s[k] == ' '), key=lambda k: abs(k - m)); return s[:i] + '\n' + s[i + 1:]
def srt_t(t): ms = int(round(t * 1000)); return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'
subs = []
for (t0, f), text in zip(P['voice'], texts):
    d = dur(f); cs = chunks(text); total = sum(len(c) for c in cs); t = t0
    for c in cs:
        dd = d * len(c) / total; subs.append((t, t + dd - 0.05, two_lines(c))); t += dd
open(f'{J}/japan.srt', 'w').write(''.join(f'{k + 1}\n{srt_t(a)} --> {srt_t(b)}\n{s}\n\n' for k, (a, b, s) in enumerate(subs)))
# ---------- авторы ----------
src = json.load(open(f'{os.path.dirname(os.path.abspath(__file__))}/sources.json'))
used = {str(s['id']) for s in P['segs'] if not s.get('img')}
px_auth = sorted({src[i]['author'] for i in used if i in src})
cc = {}
for p in ('AB', 'C'):
    fp = f'{J}/shots/commons_credits_{p}.json'
    if os.path.exists(fp): cc.update(json.load(open(fp)))
used_img = {s['ss'] for s in P['segs'] if s.get('img')}
by_lic = collections.defaultdict(set)
for k, v in cc.items():
    if k in used_img:
        lic = v['license'] if isinstance(v['license'], str) else ', '.join(v['license'])
        by_lic[lic].add(re.sub(r'\s+', ' ', v.get('author', '')).strip()[:80] or 'автор не указан')
MUSIC = ('«Do you Shakuhachi» - Antti Luode (Wikimedia Commons, CC BY 3.0)\n'
         '«Cyborg Ninja», «Eastern Thought», «Ishikari Lore», «Tea Roots» - Kevin MacLeod (incompetech.com), CC BY 4.0, creativecommons.org/licenses/by/4.0/')
credits = ['# «Япония» — авторы и лицензии', '', '## Музыка', MUSIC, '', '## Фото Wikimedia Commons (по лицензиям)']
for lic in sorted(by_lic): credits += [f'- **{lic}**: ' + ', '.join(sorted(by_lic[lic]))]
credits += ['', '## Подробно по каждому фото']
for k in sorted(used_img):
    v = cc.get(k, {}); credits.append(f"- `{k}` — {v.get('author', '?')} — {v.get('license', '?')} — {v.get('page', '')}")
credits += ['', '## Видео Pixabay (Pixabay Content License)', ', '.join(px_auth), '', '## Подробно по каждому клипу']
for i in sorted(used, key=int): credits.append(f"- {i} — {src.get(i, {}).get('author', '?')} — {src.get(i, {}).get('page', '')}")
open(f'{J}/CREDITS.md', 'w').write('\n'.join(credits) + '\n')
# ---------- описание ----------
NICE = {2: 'Странная Япония', 5: 'Киото и Нара', 9: 'Советы путешественнику'}
chap = [(0.0, 'Вступление')] + [(c['t'], NICE.get(c['ch'], c['name'].capitalize())) for c in P['cards']] + [(P['chap_t'][10], 'Финал')]
desc = f"""UPLOAD KIT — «Япония» (полный выпуск, {tc(P['END'])})

НАЗВАНИЕ (до 100 знаков):
Почему в Японии ИЗВИНЯЮТСЯ за 20 секунд? Страна, где всё немного не так

ВАРИАНТЫ НАЗВАНИЯ:
- Япония: поезд ушёл на 20 секунд раньше - и вся страна извинилась
- Япония без урн и без мусора: как это работает? Токио, Киото, онсэны и Фудзи

ОПИСАНИЕ:
Здесь поезд ушёл на двадцать секунд раньше расписания - и компания официально извинилась перед пассажирами. В огромном городе почти нет урн и почти нет мусора. Мы пройдём по неоновому Токио и перекрёстку Сибуя, заглянем в странную Японию с туалетами на пульте, кафе с совами и гигантским роботом, промчимся на синкансэне, попробуем рамен и такояки, увидим Киото, оленей Нары, Фудзи без облаков и обезьян в горячих источниках.

Таймкоды:
""" + '\n'.join(f'{tc(t)} {n}' for t, n in chap) + f"""

Озвучка сделана с помощью ИИ, факты проверены по источникам.

Музыка:
{MUSIC}

Фото: Wikimedia Commons (CC0, CC BY, CC BY-SA, Public domain) - все авторы по лицензиям: https://github.com/res-creator/sofia-studio/blob/claude/cool-hypatia-ehnxdy/ru_geo/japan/CREDITS.md
Видео: Pixabay (Pixabay Content License).

#япония #токио #путешествия #сквозьстраны #география #странымира #документальный

ТЕГИ:
япония, токио, киото, нара, фудзи, синкансэн, сибуя, онсэн, сакура, японская еда, рамен, путешествие в японию, странная япония, сквозь страны, документальный фильм, страны мира, география

ЗАКРЕПЛЁННЫЙ КОММЕНТАРИЙ:
Что из этого ты хотел бы увидеть своими глазами? 1) Фудзи без облаков 2) обезьяны в горячем источнике 3) неоновый Токио ночью 4) олени Нары. Пиши цифру!

ПРИ ЗАГРУЗКЕ: отметить «Изменённый или синтетический контент» - Да (голос диктора создан ИИ).
СУБТИТРЫ: japan.srt (русский, загрузить отдельной дорожкой «С синхронизацией»)
КАТЕГОРИЯ: Путешествия / Образование
"""
open(f'{J}/upload_kit.txt', 'w').write(desc)
print('subs', len(subs), 'photos', len(used_img), 'licenses', dict((k, len(v)) for k, v in by_lic.items()), 'desc chars', len(desc))
