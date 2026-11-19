# Сборка обложек v3: build/stills (1920x1080 PNG) -> ru_geo/afghan/cover/cover_v3_{a,b,c}.jpg (1280x720) + compare_v3.jpg
# Сначала: PW_CHROMIUM=/opt/pw-browsers/chromium node render.mjs --project projects/afghan_cover --stills 5,7,9
import os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '../../../ru_geo/afghan/cover')
SRC = {'a': '5s_5.00.png', 'b': '7s_7.00.png', 'c': '9s_9.00.png'}
imgs = {}
for k, f in SRC.items():
    im = Image.open(os.path.join(HERE, 'build/stills', f)).convert('RGB').resize((1280, 720), Image.LANCZOS)
    p = os.path.join(OUT, f'cover_v3_{k}.jpg'); im.save(p, quality=92, optimize=True, progressive=True)
    print(p, os.path.getsize(p) // 1024, 'KB'); imgs[k] = im
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26) if os.path.exists('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf') else ImageFont.load_default()
G, LH = 24, 40
Wd = G + 1280 + G + 320 + G; Hd = G + 3 * (LH + 720 + G)
sheet = Image.new('RGB', (Wd, Hd), (24, 24, 28)); d = ImageDraw.Draw(sheet)
for i, k in enumerate('abc'):
    y = G + i * (LH + 720 + G)
    d.text((G, y + 4), f'cover_v3_{k}.jpg  1280x720', fill=(235, 235, 235), font=font)
    sheet.paste(imgs[k], (G, y + LH))
    x2 = G + 1280 + G
    d.text((x2, y + 4), '320x180', fill=(235, 235, 235), font=font)
    sheet.paste(imgs[k].resize((320, 180), Image.LANCZOS), (x2, y + LH))
    d.text((x2, y + LH + 200), '168x94', fill=(235, 235, 235), font=font)
    sheet.paste(imgs[k].resize((168, 94), Image.LANCZOS), (x2, y + LH + 240))
p = os.path.join(OUT, 'compare_v3.jpg'); sheet.save(p, quality=88, optimize=True); print(p, os.path.getsize(p) // 1024, 'KB')
