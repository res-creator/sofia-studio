# Сборка обложек из build/stills (1920x1080 PNG) -> ru_geo/afghan/cover/*.jpg (1280x720) + лист сравнения
# Сначала: PW_CHROMIUM=/opt/pw-browsers/chromium node render.mjs --project projects/afghan_cover --stills 5,7,9,11,13,15
#   python3 make_covers.py v3   -> cover_v3_{a,b,c}.jpg + compare_v3.jpg
#   python3 make_covers.py v4   -> cover_v4_{d,e,f}.jpg + compare_v4.jpg (+ v3_a для сравнения)
import os, sys
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '../../../ru_geo/afghan/cover'))
SETS = {'v3': {'a': '5s_5.00.png', 'b': '7s_7.00.png', 'c': '9s_9.00.png'},
        'v4': {'d': '11s_11.00.png', 'e': '13s_13.00.png', 'f': '15s_15.00.png'}}
REF = {'v4': ['cover_v3_a.jpg']}
v = sys.argv[1] if len(sys.argv) > 1 else 'v4'
items = []
for k, f in SETS[v].items():
    im = Image.open(os.path.join(HERE, 'build/stills', f)).convert('RGB').resize((1280, 720), Image.LANCZOS)
    name = f'cover_{v}_{k}.jpg'; p = os.path.join(OUT, name); im.save(p, quality=92, optimize=True, progressive=True)
    print(p, os.path.getsize(p) // 1024, 'KB'); items.append((name, im))
for name in REF.get(v, []): items.append((name + '  (reference)', Image.open(os.path.join(OUT, name)).convert('RGB')))
fp = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
font = ImageFont.truetype(fp, 26) if os.path.exists(fp) else ImageFont.load_default()
G, LH = 24, 40
sheet = Image.new('RGB', (G + 1280 + G + 320 + G, G + len(items) * (LH + 720 + G)), (24, 24, 28)); d = ImageDraw.Draw(sheet)
for i, (name, im) in enumerate(items):
    y = G + i * (LH + 720 + G); x2 = G + 1280 + G
    d.text((G, y + 4), f'{name}  1280x720', fill=(235, 235, 235), font=font); sheet.paste(im, (G, y + LH))
    d.text((x2, y + 4), '320x180', fill=(235, 235, 235), font=font); sheet.paste(im.resize((320, 180), Image.LANCZOS), (x2, y + LH))
    d.text((x2, y + LH + 200), '168x94', fill=(235, 235, 235), font=font); sheet.paste(im.resize((168, 94), Image.LANCZOS), (x2, y + LH + 240))
p = os.path.join(OUT, f'compare_{v}.jpg'); sheet.save(p, quality=88, optimize=True); print(p, os.path.getsize(p) // 1024, 'KB')
