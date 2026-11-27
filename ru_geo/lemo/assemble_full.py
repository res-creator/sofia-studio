"""Полный ролик (любой slug из CONF ниже) в стиле «Инженерная доска»: доска (по главам) + 3D-карта + архивный стол.
Звук собирается заново в полном качестве: голос vo_clone/vo.mp3 + музыка music.wav (приглушается под голос) + шумы.
python3 assemble_full.py <slug>   -> scratchpad master 1080p и ru_geo/<slug>/video/<slug>_share.mp4 (720p, < 50 МБ)"""
import json, subprocess, os, sys
SLUG = sys.argv[1]
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
R = f'/home/user/sofia-studio/ru_geo/{SLUG}'; P = f'{R}/video/parts'; L = '/home/user/sofia-studio/ru_geo/lemo'
S = f'/tmp/claude-0/-home-user-sofia-studio/24c15af6-1f18-59ef-a680-971b83cb24ee/scratchpad/asm_{SLUG}' + ('_x' if os.environ.get('END') else ''); os.makedirs(S, exist_ok=True)
film = json.load(open(f'{R}/film.json')); TOTAL = float(film['total'])
run = lambda a: subprocess.run(a, check=True)
# (файл, начало файла в секундах фильма, кусок фильма a–b, папка событий); EXTRA: события карт и столов
CONF = {
 'building_height': dict(
  SEG=[('board_brief.mp4', 0, 0, 20.6, 'bh_brief'), ('map.mp4', 20.6, 20.6, 30.9, None),
       ('board_brief.mp4', 0, 30.9, 85.3, 'bh_brief'),
       ('board_brief_B.mp4', 85.3, 85.3, 149.04, 'bh_brief_B'), ('lighttable.mp4', 149.04, 149.04, 164.2, None),
       ('board_brief_B.mp4', 85.3, 164.2, 181.86, 'bh_brief_B'),
       ('board_brief_CD.mp4', 181.86, 181.86, 350.23, 'bh_brief_CD'),
       ('board_brief_EF.mp4', 350.23, 350.23, 481.72, 'bh_brief_EF'),
       ('board_brief_G.mp4', 481.72, 481.72, TOTAL, 'bh_brief_G')],
  EXTRA=[('map_events.json', 20.6, 20.6, 30.9), ('lighttable_events.json', 149.04, 149.04, 164.2)],
  SKIP=[(69.5, 73.26)]),
 'universe_size': dict(
  SEG=[('board_1.mp4', 0, 0, 89.1, 'us_brief_1'), ('lt_pbd.mp4', 89.1, 89.1, 105.6, None),
       ('board_1.mp4', 0, 105.6, 127.7, 'us_brief_1'),
       ('board_2.mp4', 127.7, 127.7, 272.67, 'us_brief_2'),
       ('board_3.mp4', 272.67, 272.67, 318.5, 'us_brief_3'), ('lt_hudf.mp4', 318.5, 318.5, 359.8, None),
       ('board_3.mp4', 272.67, 359.8, 454.73, 'us_brief_3'),
       ('board_4.mp4', 454.73, 454.73, TOTAL, 'us_brief_4')],
  EXTRA=[('lt_pbd_events.json', 89.1, 89.1, 105.6), ('lt_hudf_events.json', 318.5, 318.5, 359.8)],
  SKIP=[]),
}
C = CONF[SLUG]; SEG, EXTRA_EV = C['SEG'], C['EXTRA']
END = float(os.environ.get('END', 0))                    # END=127.7: только кусок с начала (на согласование)
if END:
    TOTAL = END; SEG = [(f, o, a, min(b, END), e) for f, o, a, b, e in SEG if a < END]
    EXTRA_EV = [x for x in EXTRA_EV if x[2] < END]

# ---- картинка (REUSE=1: взять готовую pic.mp4)
segs = []
if os.environ.get('REUSE') and os.path.exists(f'{S}/pic.mp4'): SEG_RUN = []
else: SEG_RUN = SEG
for i, (f, off, a, b, _) in enumerate(SEG_RUN):
    o = f'{S}/s{i}.mp4'
    run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{a - off:.3f}', '-i', f'{P}/{f}', '-t', f'{b - a:.3f}', '-r', '30',
         '-vf', 'scale=1920:1080,setsar=1,format=yuv420p,tpad=stop_mode=clone:stop_duration=1', '-t', f'{b - a:.3f}', '-an',
         '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', o]); segs.append(o)
if segs:
  open(f'{S}/list.txt', 'w').write(''.join(f"file '{x}'\n" for x in segs))
  run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{S}/list.txt', '-c', 'copy', f'{S}/pic.mp4'])

# ---- шумы из событий всех частей
SR = 48000; out = np.zeros(int((TOTAL + 2) * SR)); rng = np.random.default_rng(7)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def put(sig, t, g):
    i = int(t * SR); j = min(len(out), i + len(sig))
    if 0 <= i < j: out[i:j] += sig[:j - i] * g
def marker(t, Ln, g=.06):                         # мягкий шорох без скрежета: только низ-середина, тихо
    n = max(int(.06 * SR), int(min(Ln, 4) * SR)); u = np.linspace(0, 1, n)
    x = bp(rng.standard_normal(n), 250, 1100)
    put(x * np.sin(np.pi * u) ** 1.5, t, g * .35)
def click(t, g=.2, f=1500):
    n = int(.045 * SR); x = bp(rng.standard_normal(n), f, 7000) * np.exp(-np.linspace(0, 1, n) * 18)
    put(x + .5 * np.sin(2 * np.pi * 170 * np.arange(n) / SR) * np.exp(-np.linspace(0, 1, n) * 25), t, g)
def whoosh(t, Ln=.6, g=.1):
    n = int(min(Ln, 2) * SR); u = np.linspace(0, 1, n); put(bp(rng.standard_normal(n), 300, 2500) * np.sin(np.pi * u) ** 2, t, g)
def tick(t, g=.035):
    n = int(.02 * SR); put(np.sin(2 * np.pi * 2400 * np.arange(n) / SR) * np.exp(-np.linspace(0, 1, n) * 30), t, g)
def thump(t, g=.16):
    n = int(.25 * SR); put(np.sin(2 * np.pi * 90 * np.arange(n) / SR) * np.exp(-np.linspace(0, 1, n) * 12), t, g)
def sound(ty, t, d):
    if ty in ('stroke', 'write', 'dash', 'line', 'hatch'): marker(t, d or .2, .05 if ty == 'write' else .06)
    elif ty == 'key': click(t, .2)
    elif ty in ('tag', 'clack', 'magnet', 'pin', 'land', 'drop'): click(t, .09, 900); thump(t, .06)
    elif ty == 'erase': whoosh(t, d or .6, .08)
    elif ty == 'whoosh': whoosh(t, d or .6, .07)
    elif ty == 'count':
        m = max(3, int((d or .5) * 14))
        for k in range(m): tick(t + (d or .5) * (1 - (1 - k / m) ** 2))
for f, off, a, b, evd in SEG:
    if not evd or not os.path.exists(f'{L}/{evd}/events.json'): continue
    ev = json.load(open(f'{L}/{evd}/events.json')); ev = ev['ev'] if isinstance(ev, dict) else ev
    for e in ev:
        t = e['t'] + off
        if a <= t < b: sound(e.get('type'), t, e.get('dur', 0))
for f, off, a, b in EXTRA_EV:
    if not os.path.exists(f'{P}/{f}'): continue
    for e in json.load(open(f'{P}/{f}')):
        t = off + e['t']; k = e['k']
        if k == 'whoosh': whoosh(t, .9, .12)
        elif k in ('pin', 'loupe'): thump(t, .14)
        elif k == 'rise': whoosh(t, 1.2, .07)
        elif k == 'light': click(t, .18, 900)
        else: click(t, .06, 2500)
SFX_GAIN = float(os.environ.get('SFX_GAIN', '0.4'))        # владелица: все эффекты намного тише
out = sosfilt(butter(2, 3500, 'lowpass', fs=SR, output='sos'), out) * SFX_GAIN
wavfile.write(f'{S}/sfx.wav', SR, (np.clip(out, -1, 1) * 32767).astype(np.int16))

# ---- голос + музыка (приглушение под голос) + шумы, громкость -14 LUFS
run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{R}/vo_clone/vo.mp3', '-i', f'{R}/music.wav', '-i', f'{S}/sfx.wav', '-filter_complex',
     '[0:a]aresample=48000,apad,asplit=2[v][vs];[1:a]aresample=48000,volume=0.9[m];[m][vs]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=600[md];'
     '[2:a]aformat=channel_layouts=stereo[s];[v][md][s]amix=inputs=3:duration=longest:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=7',
     '-t', f'{TOTAL:.2f}', '-ar', '48000', '-ac', '2', f'{S}/mix.wav'])

# ---- субтитры в плашке (Inter 52, как в пробе)
def ts(x): x = max(0, x); return f"{int(x // 3600)}:{int(x % 3600 // 60):02d}:{x % 60:05.2f}"
A = ['[Script Info]', 'ScriptType: v4.00+', 'PlayResX: 1920', 'PlayResY: 1080', '', '[V4+ Styles]',
     'Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding',
     'Style: C,Inter,52,&H00FFFFFF,&H000000FF,&H48141414,&H48141414,1,0,0,0,100,100,0,0,3,14,0,2,120,120,60,1', '', '[Events]',
     'Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text']
SKIP = C['SKIP']                                       # фразы, которые печатает машинка
for s in film['segs']:
    for a, b, tx in s.get('captions') or []:
        a, b = float(a), float(b)
        if any(x <= a < y for x, y in SKIP): continue
        A.append(f'Dialogue: 0,{ts(a)},{ts(b)},C,,0,0,0,,{tx}')
open(f'{S}/subs.ass', 'w', encoding='utf-8').write('\n'.join(A) + '\n')

master = f'{S}/{SLUG}_master.mp4'
run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{S}/pic.mp4', '-i', f'{S}/mix.wav', '-vf', f'ass={S}/subs.ass', '-map', '0:v', '-map', '1:a',
     '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-t', f'{TOTAL:.2f}', '-movflags', '+faststart', master])
share = f'{R}/video/{SLUG}_' + ('excerpt' if END else 'share') + '.mp4'
run(['ffmpeg', '-y', '-loglevel', 'error', '-i', master, '-vf', 'scale=1280:720', '-c:v', 'libx264', '-preset', 'medium', '-b:v', '520k', '-maxrate', '900k', '-bufsize', '1800k',
     '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', share])
print('done', master, share, os.path.getsize(share) // 1048576, 'MB')
