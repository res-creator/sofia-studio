# Список замен для владелицы: таймкод, фраза диктора, что было → что стало, источник и лицензия.
import importlib.util, json, os, re, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(D); sys.path.insert(0, R)
from script import PARAS
from timeline import build
import media_list as NEW
old_src = subprocess.run(['git', 'show', 'HEAD:ru_geo/iceland/media_list.py'], cwd=R, capture_output=True, text=True).stdout
spec = importlib.util.spec_from_loader('old_ml', loader=None); OLD = importlib.util.module_from_spec(spec); exec(old_src, OLD.__dict__)
txt = {}
for _, t in PARAS:
    for m in re.finditer(r'\[\[(\w+)\]\]([^\[]*)', t): txt[m.group(1)] = m.group(2).strip()
_, shots, _ = build()
st = {x['key']: x for x in shots}
keys = open(f'{D}/changed_keys.txt').read().split(',')
def fmt(t): return f'{int(t // 60)}:{t % 60:04.1f}'
def what(mod, k):
    sh = mod.SHOTS[k]; return mod.MEDIA[sh['m']]['what'] if sh.get('m') else 'карта/график'
L = ['# «Исландия»: доработка видеоряда (люди и жизнь страны)', '',
     'Озвучка, текст, темп и общая длительность не менялись (21:26). Заменены только кадры под теми же фразами.',
     'Колонка «Было» — прежний кадр, «Стало» — новый. Лицензии проверены по странице файла; авторство указано в CREDITS.md и в блоке для описания YouTube.', '',
     '| Время | Фраза диктора | Было | Стало | Автор, лицензия | Ссылка |', '|---|---|---|---|---|---|']
for k in sorted(keys, key=lambda k: st[k]['start']):
    sh = NEW.SHOTS[k]
    if sh.get('m'):
        m = NEW.MEDIA[sh['m']]; L.append(f"| {fmt(st[k]['start'])} | {txt.get(k, '')[:90]} | {what(OLD, k)} | {m['what']} | {m['author']}, {m['license']} | {m['page']} |")
    else:
        L.append(f"| {fmt(st[k]['start'])} | {txt.get(k, '')[:90]} | {what(OLD, k)} | карта 200-мильной зоны начинается раньше (вместо случайного берега) | наша графика, Natural Earth | — |")
open(f'{D}/REPLACEMENTS.md', 'w').write('\n'.join(L) + '\n'); print(len(keys), 'rows')
