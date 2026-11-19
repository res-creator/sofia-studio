# Правки «Третьей мировой» по отчётам критиков (ноябрь 2026): рендер новых шотов + монтаж vedit.py.
import json, os, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__)); R = '/home/user/sofia-studio'; T = f'{R}/2d-video/tools'; W = f'{R}/2d-video/projects/ww3toon/build/fix'
os.makedirs(W, exist_ok=True)
FPS = 24; F = lambda t: round(t * FPS) / FPS
WD = json.load(open(f'{R}/ru_geo/fix_vo/words.json'))
run = lambda *a, **k: subprocess.run(list(a), check=True, **k)
WORKERS = next((a for a in sys.argv[1:] if a.isdigit()), '2')
# 1) Петров: новая фраза вместо «Он не нарушил ни одного правила»
PRE = 2 / FPS
pet = dict(src='ww3toon', name='ww3_petrov', dur=8.0, workers=WORKERS, out=f'{W}/petrov.mp4', words=[[w, a + PRE, b + PRE] for w, a, b in WD['ww3_petrov']], shots=[
  dict(id='f01', start=0, end=3.1, tpl='stage', params={'set': 'bunker', 'cast': [{'c': 'PETROV', 'x': 960, 'y': 930, 's': 1.2, 'pose': 'hold', 'hold': {'k': 'journal'}, 'holdS': 0.45, 'expr': 'neutral'}], 'props': [], 'tags': [{'t': 'сигнал наверх не передал', 'x': 960, 'y': 150, 'at': 1.3, 'bg': 'y'}]}),
  dict(id='f02', start=3.1, end=8.0, tpl='stage', params={'set': 'bunker', 'cast': [{'c': 'PETROV', 'x': 800, 'y': 930, 's': 1.2, 'pose': 'hold', 'hold': {'k': 'rotary', 'off': True}, 'holdS': 0.45, 'expr': 'neutral'}], 'props': [], 'tags': [{'t': '«ложное срабатывание»', 'x': 1330, 'y': 560, 'at': 0.8, 'bg': 'y'}, {'t': 'решение взял на себя', 'x': 1330, 'y': 690, 'at': 2.95, 'bg': 'g'}], 'setOpts': {'alarm': True}, 'cam': [[0, 900, 560, 1.3], ['end', 880, 560, 1.4]]}),
])
json.dump(pet, open(f'{W}/petrov.json', 'w'), ensure_ascii=False)
if '--stills' in sys.argv: run('python3', f'{T}/fixshot.py', f'{W}/petrov.json', '--stills', '1.5,2.8,4.5,7.5'); sys.exit()
if not os.path.exists(pet['out']): run('python3', f'{T}/fixshot.py', f'{W}/petrov.json')
# 2) шоты с исправленным текстом на экране (тот же тайминг): w252 «> 5 млрд», w344 Хиросима, w480 плашка на «СТАРТ»
VF = [('w252', 624.2, 628.52), ('w344', 872.36, 875.2), ('w480', 1232.32, 1235.0)]
for sid, a, b in VF:
    out = f'{W}/{sid}.mp4'
    if not os.path.exists(out):
        run('node', 'render.mjs', '--project', 'projects/ww3toon', '--from', f'{F(a):.5f}', '--to', f'{F(b):.5f}', '--workers', WORKERS, '--format', 'jpeg', '--crf', '16', '--preset', 'veryfast', '--out', out, cwd=f'{R}/2d-video', env={**os.environ, 'PW_CHROMIUM': '/opt/pw-browsers/chromium'}, stdout=subprocess.DEVNULL)
# 3) монтаж
cuts = [([79.0, 87.9], [79.0, 88.16]), ([280.6, 282.4], None), ([331.8, 334.4], None), ([335.4, 337.04], None), ([492.6, 495.6], None), ([496.6, 497.69], None),
        ([631.5, 634.0], None), ([690.6, 693.0], None), ([735.70, 745.45], [735.48, 745.76]), ([875.2, 877.6], None), ([1025.0, 1027.4], None), ([1029.6, 1031.3], None),
        ([1169.4, 1172.0], None), ([1199.32, 1211.74], None), ([1338.2, 1341.0], None), ([1342.3, 1343.54], None)]
ops = [dict(cut=c, **({'vcut': v} if v else {})) for c, v in cuts]
ops.append(dict(replace=[1239.25, 1242.04], clip=f'{R}/ru_geo/fix_vo/ww3_petrov.wav', video=pet['out'], pre=PRE, post=0.2, srt='Он не стал передавать наверх сигнал о нападении. Он доложил: ложное срабатывание. И взял решение на себя.'))
ops += [dict(vfile=[a, b], video=f'{W}/{sid}.mp4') for sid, a, b in VF]
spec = dict(work=f'{W}/edit', src_video=f'{R}/ru_geo/ww3/video_toon/ww3_toon_1080p.mp4', src_vo=f'{R}/2d-video/projects/ww3/input/voiceover.mp3', cues=f'{R}/2d-video/projects/ww3toon/story/music.json',
            mix_py=f'{R}/2d-video/projects/ww3toon/tools/mix.py', srt=f'{R}/ru_geo/ww3/ww3.srt', out_srt=f'{W}/ww3.srt', out_video=f'{W}/ww3_toon_1080p_new.mp4', ops=ops,
            srt_fix=[['Снимая наш фильм про\nИсландию, мы не подозревали,', ''], ['Это раз четвёртый. Советник президента\nСША по безопасности потом вспоминал:', 'Это раз четвёртый.'],
                     ['А по документам было так. На экранах\nкомандных центров вместо нулей появляются', 'На экранах командных\nцентров вместо нулей появляются']])
json.dump(spec, open(f'{W}/edit.json', 'w'), ensure_ascii=False, indent=1)
if '--render-only' not in sys.argv: run('python3', f'{T}/vedit.py', f'{W}/edit.json')
