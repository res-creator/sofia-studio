"""contact sheet of out/chk/c_<t>.jpg (2 columns, half size, with the time and the subtitle band line)
usage: python3 tools/sheet.py out.jpg t1 t2 …"""
import sys
from PIL import Image, ImageDraw
out, ts = sys.argv[1], sys.argv[2:]
W = Image.new('RGB', (1920, 540 * ((len(ts) + 1) // 2)), 'black'); d = ImageDraw.Draw(W)
for i, t in enumerate(ts):
    im = Image.open(f'out/chk/c_{t}.jpg').resize((960, 540)); x, y = (i % 2) * 960, (i // 2) * 540
    W.paste(im, (x, y)); d.line([x, y + 415, x + 960, y + 415], fill=(255, 0, 255)); d.text((x + 8, y + 8), t, fill=(255, 0, 0))
W.save(out)
