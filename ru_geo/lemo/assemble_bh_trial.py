"""Сборка пробного отрывка «Высота зданий»: доска + карта + доска + архивный стол.
Звук: голос и музыка из готового ролика + шумы (маркер, машинка, ластик, счётчик, карта, стол). Субтитры в плашке.
python3 assemble_bh_trial.py"""
import json, subprocess, os, sys
VAR = sys.argv[1] if len(sys.argv) > 1 else ''          # '', 'marker', 'brief'
BFILE = f'board_{VAR}.mp4' if VAR else 'board.mp4'
EVF = {'': 'bh_board', 'marker': 'bh_marker', 'brief': 'bh_brief'}[VAR]
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
R = '/home/user/sofia-studio/ru_geo/building_height'; P = f'{R}/video/parts'; S = '/tmp/claude-0/-home-user-sofia-studio/24c15af6-1f18-59ef-a680-971b83cb24ee/scratchpad/asm' + (VAR and '_' + VAR)
os.makedirs(S, exist_ok=True)
SHARE = f'{R}/video/building_height_share.mp4'
M0, M1, BEND = 20.6, 30.9, 85.3                    # карта вместо доски на 20.6–30.9; доска до 85.3
LT0, LT1 = 149.04, 164.20                           # архивный стол (время фильма)
TOTAL = BEND + (LT1 - LT0)
run = lambda a: subprocess.run(a, check=True)
def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))

# ---- картинка
have_map = os.path.exists(f'{P}/map.mp4'); have_lt = os.path.exists(f'{P}/lighttable.mp4')
segs = []
def cut(src, a, b, name):
    o = f'{S}/{name}.mp4'
    run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{a:.3f}', '-i', src, '-t', f'{b - a:.3f}', '-r', '30', '-vf', 'scale=1920:1080,setsar=1,format=yuv420p', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', o]); segs.append(o)
if have_map:
    cut(f'{P}/{BFILE}', 0, M0, 'a'); cut(f'{P}/map.mp4', 0, M1 - M0, 'b'); cut(f'{P}/{BFILE}', M1, BEND, 'c')
else: cut(f'{P}/{BFILE}', 0, BEND, 'a')
if have_lt: cut(f'{P}/lighttable.mp4', 0, LT1 - LT0, 'd')
total = BEND + (LT1 - LT0 if have_lt else 0)
open(f'{S}/list.txt', 'w').write(''.join(f"file '{x}'\n" for x in segs))
run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{S}/list.txt', '-c', 'copy', f'{S}/pic.mp4'])

# ---- голос и музыка из готового ролика
run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', '0', '-t', f'{BEND}', '-i', SHARE, '-vn', '-ar', '48000', '-ac', '2', f'{S}/v1.wav'])
parts = [f'{S}/v1.wav']
if have_lt:
    run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{LT0 - 0.3}', '-t', f'{LT1 - LT0 + 0.3}', '-i', SHARE, '-vn', '-ar', '48000', '-ac', '2', f'{S}/v2.wav'])
    run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{S}/v1.wav', '-i', f'{S}/v2.wav', '-filter_complex', '[0][1]acrossfade=d=0.3:c1=tri:c2=tri', f'{S}/base.wav'])
else: os.replace(f'{S}/v1.wav', f'{S}/base.wav')

# ---- шумы
SR = 48000; out = np.zeros(int((total + 1) * SR)); rng = np.random.default_rng(7)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def put(sig, t, g):
    i = int(t * SR); j = min(len(out), i + len(sig))
    if 0 <= i < j: out[i:j] += sig[:j - i] * g
def marker(t, L, g=0.06):                          # фломастер по глянцу: шипение + «тело» + прерывистость
    n = max(int(0.06 * SR), int(L * SR)); u = np.linspace(0, 1, n)
    x = bp(rng.standard_normal(n), 2000, 7500) * .8 + bp(rng.standard_normal(n), 500, 1500) * .5
    grain = .55 + .45 * rng.random(n // 300 + 1).repeat(300)[:n]
    put(x * np.sin(np.pi * u) ** .5 * grain, t, g)
def click(t, g=.2, f=1500):
    n = int(.045 * SR); x = bp(rng.standard_normal(n), f, 7000) * np.exp(-np.linspace(0, 1, n) * 18); put(x + .5 * np.sin(2 * np.pi * 170 * np.arange(n) / SR) * np.exp(-np.linspace(0, 1, n) * 25), t, g)
def whoosh(t, L=.6, g=.12):
    n = int(L * SR); u = np.linspace(0, 1, n); x = rng.standard_normal(n); lo = bp(x, 300, 2500); put(lo * np.sin(np.pi * u) ** 2, t, g)
def tick(t, g=.04):
    n = int(.02 * SR); put(np.sin(2 * np.pi * 2400 * np.arange(n) / SR) * np.exp(-np.linspace(0, 1, n) * 30), t, g)
def thump(t, g=.18):
    n = int(.25 * SR); put(np.sin(2 * np.pi * 90 * np.arange(n) / SR) * np.exp(-np.linspace(0, 1, n) * 12), t, g)
def inside(t): return not (have_map and M0 <= t < M1)
ev = json.load(open(f'/home/user/sofia-studio/ru_geo/lemo/{EVF}/events.json'))
ev = ev['ev'] if isinstance(ev, dict) else ev
for e in ev:
    t = e['t']
    if t >= BEND or not inside(t): continue
    ty = e.get('type')
    if ty in ('stroke', 'write', 'dash', 'draw', 'text', 'line', 'letter'): marker(t, e.get('dur', .2), .05 if ty == 'write' else .065)
    elif ty == 'tap': click(t, .05, 3000)
    elif ty == 'erase': whoosh(t, e.get('dur', .6), .1)
    elif ty == 'key': click(t, .22)
    elif ty == 'count':
        m = max(3, int(e['dur'] * 14))
        for i in range(m): tick(t + e['dur'] * (1 - (1 - i / m) ** 2))
if have_map and os.path.exists(f'{P}/map_events.json'):
    for e in json.load(open(f'{P}/map_events.json')):
        t = M0 + e['t']; k = e['k']
        whoosh(t, .9, .14) if k == 'whoosh' else thump(t, .16) if k == 'pin' else whoosh(t, 1.2, .08)
if have_lt and os.path.exists(f'{P}/lighttable_events.json'):
    for e in json.load(open(f'{P}/lighttable_events.json')):
        t = BEND + e['t']; k = e['k']
        click(t, .18, 900) if k == 'light' else thump(t, .12) if k == 'loupe' else click(t, .06, 2500)
wavfile.write(f'{S}/sfx.wav', SR, (np.clip(out, -1, 1) * 32767).astype(np.int16))

# ---- субтитры (плашка, чтобы читались и на белой доске, и на карте)
f = json.load(open(f'{R}/film.json'))
def ts(x): x = max(0, x); return f"{int(x // 3600)}:{int(x % 3600 // 60):02d}:{x % 60:05.2f}"
L = ['[Script Info]', 'ScriptType: v4.00+', 'PlayResX: 1920', 'PlayResY: 1080', '', '[V4+ Styles]',
     'Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding',
     'Style: C,Inter,52,&H00FFFFFF,&H000000FF,&H48141414,&H48141414,1,0,0,0,100,100,0,0,3,14,0,2,120,120,60,1', '', '[Events]',
     'Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text']
for s in f['segs']:
    for a, b, tx in s.get('captions') or []:
        a, b = float(a), float(b)
        if 69.5 <= a < 73.26: continue                  # вопрос печатает машинка
        if b <= BEND: L.append(f'Dialogue: 0,{ts(a)},{ts(min(b, BEND))},C,,0,0,0,,{tx}')
        elif have_lt and a >= LT0 - .01 and a < LT1: L.append(f'Dialogue: 0,{ts(a - LT0 + BEND)},{ts(min(b, LT1) - LT0 + BEND)},C,,0,0,0,,{tx}')
open(f'{S}/subs.ass', 'w', encoding='utf-8').write('\n'.join(L) + '\n')

dst = f'{R}/video/trial_styles{"_" + VAR if VAR else ""}.mp4'
run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{S}/pic.mp4', '-i', f'{S}/base.wav', '-i', f'{S}/sfx.wav', '-filter_complex',
     f'[2:a]aformat=channel_layouts=stereo[s];[1:a][s]amix=inputs=2:normalize=0[a];[0:v]ass={S}/subs.ass[v]',
     '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-c:a', 'aac', '-b:a', '160k', '-t', f'{total:.2f}', '-movflags', '+faststart', dst])
print('done', dst, round(dur(dst), 2), 'map' if have_map else 'NO MAP', 'lighttable' if have_lt else 'NO LIGHTTABLE')
