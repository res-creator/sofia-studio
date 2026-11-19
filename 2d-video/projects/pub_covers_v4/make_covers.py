# build/stills (1920x1080) -> cover_v4.jpg каждого выпуска (1280x720) + лист сравнения старая/новая.
# Сначала: PW_CHROMIUM=/opt/pw-browsers/chromium node render.mjs --project projects/pub_covers_v4 --stills 1,3,5
import os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); RU = os.path.normpath(os.path.join(HERE, '../../../ru_geo'))
ITEMS = [('ww3', '1s_1.00.png', 'ww3/video_toon/cover_v4.jpg', 'ww3/cover/cover_toon_v3.jpg'),
         ('nkorea', '3s_3.00.png', 'nkorea/cover/cover_v4.jpg', 'nkorea/cover/cover_toon_v3.jpg'),
         ('richest', '5s_5.00.png', 'richest/cover/cover_v4.jpg', 'richest/cover/cover_A.jpg')]
fp = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; font = ImageFont.truetype(fp, 24) if os.path.exists(fp) else ImageFont.load_default()
rows = []
for name, src, dst, old in ITEMS:
    im = Image.open(os.path.join(HERE, 'build/stills', src)).convert('RGB').resize((1280, 720), Image.LANCZOS)
    p = os.path.join(RU, dst); im.save(p, quality=92, optimize=True, progressive=True); print(p, os.path.getsize(p) // 1024, 'KB')
    rows.append((name, Image.open(os.path.join(RU, old)).convert('RGB').resize((1280, 720), Image.LANCZOS), im, old, dst))
G, LH, CW = 24, 36, 640
Wd = G + CW + G + CW + G + 168 + G + 168 + G; Hd = G + len(rows) * (LH + 360 + G)
sheet = Image.new('RGB', (Wd, Hd), (24, 24, 28)); d = ImageDraw.Draw(sheet)
for i, (name, old, new, op, np_) in enumerate(rows):
    y = G + i * (LH + 360 + G); x = G
    for lab, im in ((f'{name}: OLD {os.path.basename(op)}', old), (f'NEW {os.path.basename(np_)}', new)):
        d.text((x, y + 4), lab, fill=(235, 235, 235), font=font); sheet.paste(im.resize((CW, 360), Image.LANCZOS), (x, y + LH)); x += CW + G
    for lab, im in (('old 168x94', old), ('new 168x94', new)):
        d.text((x, y + 4), lab, fill=(235, 235, 235), font=font); sheet.paste(im.resize((168, 94), Image.LANCZOS), (x, y + LH)); x += 168 + G
p = os.path.join(RU, 'afghan/cover/compare_published_v4.jpg'); sheet.save(p, quality=88, optimize=True); print(p, os.path.getsize(p) // 1024, 'KB')
