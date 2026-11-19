# Проверка кинетической типографики: кадры при разных t → листы ru_geo/iceland/rework/sheets/kt_preview_{1,2,3}.png
import os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..', '..')
sys.path.insert(0, os.path.join(ROOT, 'lib'))
from PIL import Image
import look, kt
OUT = os.path.join(HERE, 'sheets'); os.makedirs(OUT, exist_ok=True)

def frame(src, ss=None):
    cache = os.path.join(tempfile.gettempdir(), 'kt_bg_' + os.path.basename(src) + '.png')
    if not os.path.exists(cache):
        if ss is not None:
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(ss), '-i', src, '-frames:v', '1',
                            '-vf', 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080', cache], check=True)
        else:
            im = Image.open(src).convert('RGB'); s = max(1920 / im.size[0], 1080 / im.size[1])
            im = im.resize((int(im.size[0] * s + 1), int(im.size[1] * s + 1)), Image.LANCZOS)
            im.crop((0, 0, 1920, 1080)).save(cache)
    return Image.open(cache).convert('RGBA')

def sheet(bg, ts, name, **kw):
    tiles = []
    for t in ts:
        im = bg.copy(); kt.kinetic(im, t, **kw)
        look.text(im, (40, 1040), f't = {t:.2f}', 34, 700, look.WHITE, 'ls')
        tiles.append(im.convert('RGB').resize((960, 540), Image.LANCZOS))
    rows = (len(tiles) + 1) // 2; S = Image.new('RGB', (1920 + 10, rows * 545), (20, 20, 20))
    for i, tl in enumerate(tiles): S.paste(tl, ((i % 2) * 970, (i // 2) * 545))
    S.save(os.path.join(OUT, name)); print(name)

vid = frame(os.path.join(ROOT, 'data', 'commons_vid', 'swedrone_grindavik.webm'), 60)
img = frame(os.path.join(ROOT, 'data', 'commons_img', 'Blue_Lagoon_Iceland_hdsr_2019_10_19_9999_332.jpg.jpg'))

L1 = ['Исландия станет христианской,', 'но старым богам', 'можно молиться дома']
sheet(vid, [0.35, 0.95, 1.6, 2.5, 3.6, 4.85], 'kt_preview_1.png', dur=5.0, lines=L1,
      times=[0.2, 0.55, 0.85, 1.5, 1.75, 2.0, 2.4, 2.75, 3.1], hl=['христианской', 'старым', 'богам'])
sheet(vid, [0.1, 0.32, 0.5, 1.5], 'kt_preview_2.png', dur=2.0, lines=['ТРОСОРЕЗЫ'], times=[0.15],
      hl=['ТРОСОРЕЗЫ'], size=180, dim=0.6)
sheet(img, [0.4, 1.0, 2.0, 3.85], 'kt_preview_3.png', dur=4.0, pos='lower', size=84, dim=0.5,
      lines=['Вода в лагуне —', 'отходы геотермальной станции'], times=[0.3, 0.55, 0.75], hl=['отходы'])
