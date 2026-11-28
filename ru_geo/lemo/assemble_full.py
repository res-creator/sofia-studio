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
 'country_sizes': dict(
  SEG=[('board_1.mp4', 0, 0, 3.92, 'cs_brief_1'), ('globe.mp4', 3.92, 3.92, 11.15, None),
       ('board_1.mp4', 0, 11.15, 44.2, 'cs_brief_1'), ('lt_merc.mp4', 44.2, 44.2, 78.0, None),
       ('board_1.mp4', 0, 78.0, 115.1, 'cs_brief_1'),
       ('board_2.mp4', 115.1, 115.1, 268.26, 'cs_brief_2'),
       ('board_3.mp4', 268.26, 268.26, 439.03, 'cs_brief_3'),
       ('board_4.mp4', 439.03, 439.03, TOTAL, 'cs_brief_4')],
  EXTRA=[('globe_events.json', 3.92, 3.92, 11.15), ('lt_merc_events.json', 44.2, 44.2, 78.0)],
  SKIP=[]),
 'remote_places': dict(
  SEG=[('board_1.mp4', 0, 0, 118.15, 'rp_brief_1'),
       ('board_2.mp4', 118.15, 118.15, 134.25, 'rp_brief_2'), ('map_nemo.mp4', 134.25, 134.25, 150.96, None),
       ('board_2.mp4', 118.15, 150.96, 241.71, 'rp_brief_2'),
       ('board_3.mp4', 241.71, 241.71, 316.65, 'rp_brief_3'), ('lt_deep.mp4', 316.65, 316.65, 341.59, None),
       ('board_3.mp4', 241.71, 341.59, 343.74, 'rp_brief_3'),
       ('board_4.mp4', 343.74, 343.74, 347.36, 'rp_brief_4'), ('map_tristan.mp4', 347.36, 347.36, 362.56, None),
       ('board_4.mp4', 343.74, 362.56, 461.1, 'rp_brief_4'),
       ('board_5.mp4', 461.1, 461.1, TOTAL, 'rp_brief_5')],
  EXTRA=[('map_nemo_events.json', 134.25, 134.25, 150.96), ('lt_deep_events.json', 316.65, 316.65, 341.59),
         ('map_tristan_events.json', 347.36, 347.36, 362.56)],
  SKIP=[]),
 'deadly_places': dict(
  SEG=[('board_1.mp4', 0, 0, 47.37, 'dp_brief_1'), ('map_everest.mp4', 47.37, 47.37, 55.72, None),
       ('board_1.mp4', 0, 55.72, 122.65, 'dp_brief_1'),
       ('board_2.mp4', 122.65, 122.65, 123.65, 'dp_brief_2'), ('map_nyos.mp4', 123.65, 123.65, 141.11, None),
       ('board_2.mp4', 122.65, 141.11, 297.5, 'dp_brief_2'),
       ('board_3.mp4', 297.5, 297.5, 335.43, 'dp_brief_3'), ('lt_trieste.mp4', 335.43, 335.43, 353.56, None),
       ('board_3.mp4', 297.5, 353.56, 468.6, 'dp_brief_3'),
       ('board_4.mp4', 468.6, 468.6, TOTAL, 'dp_brief_4')],
  EXTRA=[('map_everest_events.json', 47.37, 47.37, 55.72), ('map_nyos_events.json', 123.65, 123.65, 141.11),
         ('lt_trieste_events.json', 335.43, 335.43, 353.56)],
  SKIP=[]),
}
C = CONF[SLUG]; SEG, EXTRA_EV = C['SEG'], C['EXTRA']
END = float(os.environ.get('END', 0))                    # END=127.7: только кусок с начала (на согласование)
if END:
    TOTAL = END; SEG = [(f, o, a, min(b, END), e) for f, o, a, b, e in SEG if a < END]
    EXTRA_EV = [x for x in EXTRA_EV if x[2] < END]

# ---- проверка: каждая часть не короче нужного (короткий кусок рендера = застывший кадр)
def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
for f, off, a, b, _ in SEG:
    if dur(f'{P}/{f}') + .05 < b - off: raise SystemExit(f'ЧАСТЬ КОРОЧЕ НУЖНОГО: {f} {dur(f"{P}/{f}"):.2f} < {b - off:.2f}')
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

# ---- вставки: настоящие видео и фото на весь экран поверх доски (ru_geo/<slug>/video/inserts.json)
# формат: [{"a": фильм-сек, "b": фильм-сек, "file": путь от ru_geo/<slug>/, "kind": "video"|"photo", "ss": начало в файле}]
INS = f'{R}/video/inserts.json'
if os.path.exists(INS) and not os.environ.get('NO_INSERTS'):
    ins = [x for x in json.load(open(INS)) if (not END or x['a'] < END)]
    parts = []
    for i, x in enumerate(ins):
        d = x['b'] - x['a']; o = f'{S}/ins{i}.mp4'; src = f'{R}/{x["file"]}'
        if x.get('kind') == 'photo':     # фото целиком, без обрезки, на размытом фоне; лёгкое движение не трогает края
            vf = ('[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=30:3,eq=brightness=-0.08[bg];'
                  '[0:v]scale=1920:1080:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p')
            run(['ffmpeg', '-y', '-loglevel', 'error', '-loop', '1', '-i', src, '-t', f'{d:.3f}', '-r', '30', '-filter_complex', vf, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', o])
        else:                             # видео: заполнить кадр, без звука
            run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{x.get("ss", 0)}', '-i', src, '-t', f'{d:.3f}', '-an', '-r', '30',
                 '-vf', 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,format=yuv420p,tpad=stop_mode=clone:stop_duration=2', '-t', f'{d:.3f}',
                 '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', o])
        parts.append((o, x['a'], x['b']))
    if parts:
        args = ['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{S}/pic.mp4']
        fc, last = '', '0:v'
        for k, (o, a, b) in enumerate(parts):
            args += ['-i', o]; fc += f'[{k + 1}:v]setpts=PTS-STARTPTS+{a:.3f}/TB[i{k}];[{last}][i{k}]overlay=enable=\'between(t,{a:.3f},{b - 0.01:.3f})\':eof_action=pass[o{k}];'; last = f'o{k}'
        run(args + ['-filter_complex', fc.rstrip(';'), '-map', f'[{last}]', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', f'{S}/pic_ins.mp4'])
        os.replace(f'{S}/pic_ins.mp4', f'{S}/pic_final.mp4')
else:
    if os.path.exists(f'{S}/pic_final.mp4'): os.remove(f'{S}/pic_final.mp4')
PIC = f'{S}/pic_final.mp4' if os.path.exists(f'{S}/pic_final.mp4') else f'{S}/pic.mp4'

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

# ---- без субтитров в кадре (владелица: их включают на YouTube); отдельный .srt для загрузки
# ---- вместо карточки «ХОЛОДНЫЙ СТАРТ» (первая секунда) машинка печатает название ролика (TITLE_DUR секунд)
CUT0 = float(os.environ.get('CUT0', '1.0'))
TITLES = {'building_height': 'Как высоко можно построить?', 'universe_size': 'Размер Вселенной',
          'country_sizes': 'Реальный размер стран', 'remote_places': 'Самое отдалённое место человечества',
          'deadly_places': '7 мест, где человек не выживет без защиты'}
def kit_title():
    try:
        h = open(f'{R}/UPLOAD_KIT.md', encoding='utf-8').readline()
        return h.split(':', 1)[1].strip() if ':' in h else SLUG
    except Exception: return SLUG
TITLE = TITLES.get(SLUG) or kit_title(); TITLE_DUR = 3.0
SHIFT = TITLE_DUR - CUT0                                  # время фильма → время ролика
def st(x): x = max(0, x); return f"{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(round((x % 1) * 1000)) % 1000:03d}"
n = 0; srt = []
for s_ in film['segs']:
    for a_, b_, tx in s_.get('captions') or []:
        a_, b_ = float(a_) + SHIFT, float(b_) + SHIFT
        if b_ <= TITLE_DUR or a_ >= TOTAL + SHIFT: continue
        n += 1; srt.append(f'{n}\n{st(a_)} --> {st(b_)}\n{tx}\n')
if not END: open(f'{R}/video/{SLUG}_ru.srt', 'w', encoding='utf-8').write('\n'.join(srt))

# титульная карточка: чёрный фон, моноширинный шрифт, буквы печатаются, оранжевый курсор (как карточки глав)
from PIL import Image, ImageDraw, ImageFont
fnt = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 76)
words, lines, cur = TITLE.split(), [], ''
dd = ImageDraw.Draw(Image.new('RGB', (10, 10)))
for w in words:
    tr = (cur + ' ' + w).strip()
    if dd.textlength(tr, font=fnt) > 1500 and cur: lines.append(cur); cur = w
    else: cur = tr
lines.append(cur)
nchar = sum(len(l.replace(' ', '')) for l in lines); T0, T1 = 0.25, min(1.9, 0.25 + nchar * 0.055)
ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '1920x1080', '-r', '30', '-i', '-',
                       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', f'{S}/title.mp4'], stdin=subprocess.PIPE)
keys = []
for fi in range(int(TITLE_DUR * 30)):
    t = fi / 30; im = Image.new('RGB', (1920, 1080), (5, 5, 6)); d = ImageDraw.Draw(im)
    shown = int(nchar * min(1, max(0, (t - T0) / (T1 - T0))) + (1 if t >= T1 else 0)); shown = min(shown, nchar)
    lh = 104; y0 = 540 - lh * len(lines) / 2; cx = cy = None; left = shown
    for i, ln in enumerate(lines):
        x0 = 960 - dd.textlength(ln, font=fnt) / 2; txt = ''
        for ch in ln:
            if ch != ' ':
                if left <= 0: break
                left -= 1
            txt += ch
        d.text((x0, y0 + i * lh), txt, font=fnt, fill=(242, 240, 234))
        if txt: cx, cy = x0 + dd.textlength(txt, font=fnt), y0 + i * lh
    if cx is None: cx, cy = 960 - dd.textlength(lines[0], font=fnt) / 2, y0
    if t < T1 or int(t * 2.4) % 2 == 0: d.rectangle([cx + 10, cy + 8, cx + 48, cy + 84], fill=(217, 119, 87))
    ff.stdin.write(im.tobytes())
ff.stdin.close(); ff.wait()
tw = np.zeros(int(TITLE_DUR * SR))
for k in range(nchar):
    t = T0 + (T1 - T0) * k / max(1, nchar - 1); i = int(t * SR); nn = int(.045 * SR)
    x = bp(rng.standard_normal(nn), 1500, 7000) * np.exp(-np.linspace(0, 1, nn) * 18)
    tw[i:i + nn] += (x + .5 * np.sin(2 * np.pi * 170 * np.arange(nn) / SR) * np.exp(-np.linspace(0, 1, nn) * 25))[:len(tw) - i] * .2 * float(os.environ.get('SFX_GAIN', '0.4'))
wavfile.write(f'{S}/title.wav', SR, (np.clip(tw, -1, 1) * 32767).astype(np.int16))

master = f'{S}/{SLUG}_master.mp4'
VSKIP = 0.25   # хвост старой карточки «ХОЛОДНЫЙ СТАРТ» в первых кадрах доски: картинку берём чуть позже, первый кадр держим
run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{S}/title.mp4', '-i', f'{S}/title.wav', '-ss', f'{CUT0 + VSKIP}', '-i', PIC, '-ss', f'{CUT0}', '-i', f'{S}/mix.wav',
     '-filter_complex', f'[1:a]aformat=sample_rates=48000:channel_layouts=stereo[ta];[3:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{TOTAL - CUT0:.3f}[ba];'
     f'[2:v]trim=0:{TOTAL - CUT0 - VSKIP:.3f},setpts=PTS-STARTPTS,tpad=start_duration={VSKIP}:start_mode=clone[bv];[0:v][ta][bv][ba]concat=n=2:v=1:a=1[v][a]',
     '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', os.environ.get('PRESET', 'medium'), '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', master])
share = f'{R}/video/{SLUG}_' + ('excerpt' if END else 'share') + '.mp4'
run(['ffmpeg', '-y', '-loglevel', 'error', '-i', master, '-vf', 'scale=1280:720', '-c:v', 'libx264', '-preset', os.environ.get('SHARE_PRESET', 'fast'), '-b:v', '520k', '-maxrate', '900k', '-bufsize', '1800k',
     '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', share])
print('done', master, share, os.path.getsize(share) // 1048576, 'MB')
