# Правки «Северной Кореи» по отчётам критиков (ноябрь 2026): новые фразы, рендер шотов, плашки-напоминания, монтаж vedit.py.
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
R = '/home/user/sofia-studio'; T = f'{R}/2d-video/tools'; W = f'{R}/2d-video/projects/nkorea/build/fix'; os.makedirs(W, exist_ok=True)
FPS = 24; F = lambda t: round(t * FPS) / FPS
WD = json.load(open(f'{R}/ru_geo/fix_vo/words.json')); CL = f'{R}/ru_geo/fix_vo'
run = lambda *a, **k: subprocess.run(list(a), check=True, **k)
WORKERS = next((a for a in sys.argv[1:] if a.isdigit()), '2')
dur = lambda p: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))
SH = {s['id']: s for s in json.load(open(f'{R}/2d-video/projects/nkorea/story/shots.json'))['shots']}
P = lambda sid, **upd: {**SH[sid]['params'], **upd}
def job(name, key, pre, post, shots):
    d = pre + dur(f'{CL}/{key}.wav') + post + 0.2
    shots[-1]['end'] = round(d, 3)
    j = dict(src='nkorea', name=name, dur=round(d, 3), workers=WORKERS, out=f'{W}/{name}.mp4', words=[[w, a + pre, b + pre] for w, a, b in WD[key]], shots=shots)
    json.dump(j, open(f'{W}/{name}.json', 'w'), ensure_ascii=False); return j
PRE, POST = 2 / FPS, 0.2
JOBS = [
 job('seoul', 'nk_seoul', PRE, POST, [dict(id='s1', start=0, end=2.0, tpl='stage', params=P('w298')), dict(id='s2', start=2.0, end=0, tpl='stage', params=P('w299'))]),
 job('hrw', 'nk_hrw', PRE, POST, [dict(id='h1', start=0, end=1.95, tpl='stage', params=P('w319')),
      dict(id='h2', start=1.95, end=4.45, tpl='stage', params=P('w320', tags=[{'t': 'по данным Human Rights Watch', 'x': 1150, 'y': 160, 'at': 0.15, 'bg': 'y'}])),
      dict(id='h3', start=4.45, end=6.7, tpl='stage', params=P('w321', tags=[{'t': 'обратно', 'x': 1300, 'y': 160, 'at': 0, 'bg': 'r'}])),
      dict(id='h4', start=6.7, end=0, tpl='stage', params=P('w322', big=[{'t': '500+', 'size': 220, 'col': '#ff6a5a', 'at': 0.05, 'sub': 'за один день, октябрь 2023, данные HRW'}]))]),
 job('fao', 'nk_fao', PRE, POST, [dict(id='a1', start=0, end=4.2, tpl='stage', params=P('w365', tags=[{'t': 'оценка ФАО, 2020–2022', 'x': 960, 'y': 140, 'at': 1.4, 'bg': 'y'}])),
      dict(id='a2', start=4.2, end=0, tpl='stage', params=P('w366'))]),
 job('camps', 'nk_camps', PRE, POST, [dict(id='c1', start=0, end=4.4, tpl='stage', params=P('w368', tags=[{'t': 'комиссия ООН, 2014 год', 'x': 960, 'y': 140, 'at': 1.8, 'bg': 'y'}])),
      dict(id='c2', start=4.4, end=0, tpl='stage', params=P('w369', big=[{'t': '80–120 тыс.', 'size': 170, 'col': '#ffffff', 'at': 0.05, 'sub': 'в политических лагерях, оценка ООН 2014'}]))]),
 job('sub', 'nk_sub', 0.25, 0.3, [dict(id='u1', start=0, end=0, tpl='stage', params={'set': 'desk', 'cast': [{'c': 'YOU_PIONEER', 'x': 560, 'y': 960, 's': 1.3, 'pose': 'point', 'expr': 'grin'}],
      'props': [{'k': 'folder', 'x': 1230, 'y': 560, 's': 1.1, 'name': 'подписка', 'lines': ['анкета: не нужна', 'сонбун: не проверяем'], 'stamp': 'одобрено', 'at': 0.5}],
      'tags': [{'t': 'подписка без анкеты', 'x': 960, 'y': 140, 'at': 0.4, 'bg': 'y'}], 'setOpts': {}})]),
]
if '--stills' in sys.argv:
    for j in JOBS: run('python3', f'{T}/fixshot.py', f'{W}/{j["name"]}.json', '--stills', ','.join(f'{x:.2f}' for x in [j['dur'] * k for k in (0.15, 0.4, 0.65, 0.92)]))
    sys.exit()
for j in JOBS:
    if not os.path.exists(j['out']): run('python3', f'{T}/fixshot.py', f'{W}/{j["name"]}.json')
# плашки-напоминания о времени (поверх готовой картинки, правый верхний угол)
FONT = f'{R}/2d-video/projects/richest/assets/Caveat.ttf'
def tagpng(text, out, bg=(255, 212, 59)):
    f = ImageFont.truetype(FONT, 58); f.set_variation_by_axes([700]) if hasattr(f, 'set_variation_by_axes') else None
    w = int(f.getlength(text)) + 60; h = 86; im = Image.new('RGBA', (w + 12, h + 12), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([6, 9, w + 6, h + 9], 8, fill=(0, 0, 0, 60)); d.rounded_rectangle([0, 0, w, h], 8, fill=bg + (255,), outline=(42, 35, 33, 255), width=5)
    d.text((w / 2, h / 2 + 2), text, font=f, fill=(42, 35, 33, 255), anchor='mm'); im = im.rotate(2, expand=True, resample=Image.BICUBIC); im.save(out); return im.size
w1, _ = tagpng('если бы вы родились в 1986-м', f'{W}/tag_1986.png'); w2, _ = tagpng('снова сегодня', f'{W}/tag_today.png', (214, 245, 200))
ops = [dict(cut=c) for c in ([58.08, 61.01], [62.3, 63.41], [64.2, 65.2], [126.72, 129.80], [863.04, 873.48],
        [192.4, 193.3], [329.08, 329.98], [463.2, 464.1], [599.8, 600.7], [655.32, 656.22], [766.64, 767.54], [904.36, 905.26], [965.64, 966.54])]
TXT = {'nk_seoul': 'Самый короткий путь на Юг: от Пхеньяна до Сеула около двухсот километров.',
       'nk_hrw': 'Их ловят и возвращают. По данным Human Rights Watch, только за один день в октябре 2023 года обратно отправили больше пятисот человек.',
       'nk_fao': 'По оценке ФАО, в 2020 и 2022 годах недоедали около сорока пяти процентов людей на Севере.',
       'nk_camps': 'А в политических лагерях, по оценке комиссии ООН 2014 года, держали от восьмидесяти до ста двадцати тысяч человек.',
       'nk_sub': 'Кстати, подписаться на этот канал можно без анкеты. Сонбун мы не проверяем.'}
for (name, key), rg in zip([('seoul', 'nk_seoul'), ('hrw', 'nk_hrw'), ('fao', 'nk_fao'), ('camps', 'nk_camps')], ([770.76, 774.42], [815.9, 824.74], [936.6, 941.38], [943.32, 950.5])):
    ops.append(dict(replace=rg, clip=f'{CL}/{key}.wav', video=f'{W}/{name}.mp4', pre=PRE, post=POST, srt=TXT[key]))
ops.append(dict(insert=287.68, clip=f'{CL}/nk_sub.wav', video=f'{W}/sub.mp4', pre=0.25, post=0.3, srt=TXT['nk_sub']))
ops += [dict(overlay=[333.0, 462.5], png=f'{W}/tag_1986.png', x=1920 - w1 - 40, y=34), dict(overlay=[464.6, 469.5], png=f'{W}/tag_today.png', x=1920 - w2 - 40, y=34)]
spec = dict(work=f'{W}/edit', src_video=f'{R}/ru_geo/nkorea/video/nkorea_1080p.mp4', src_vo=f'{R}/2d-video/projects/nkorea/input/voiceover.mp3', cues=f'{R}/2d-video/projects/nkorea/story/music.json',
            mix_py=f'{R}/2d-video/projects/nkorea/tools/mix.py', srt=f'{R}/ru_geo/nkorea/nkorea.srt', out_srt=f'{W}/nkorea.srt', out_video=f'{W}/nkorea_1080p_new.mp4', ops=ops, srt_fix=[])
json.dump(spec, open(f'{W}/edit.json', 'w'), ensure_ascii=False, indent=1)
if '--render-only' not in sys.argv: run('python3', f'{T}/vedit.py', f'{W}/edit.json')
