"""contact sheet: python3 tools/sheet.py <dir> <out.jpg> [cols] — every jpg in dir, labelled with its name"""
import sys, glob, os
from PIL import Image, ImageDraw
fs = sorted(glob.glob(os.path.join(sys.argv[1], '*.jpg'))); cols = int(sys.argv[3]) if len(sys.argv) > 3 else 2
w, h = 960, 540; rows = (len(fs) + cols - 1) // cols
c = Image.new('RGB', (w * cols, h * rows), 'black'); d = ImageDraw.Draw(c)
for i, f in enumerate(fs):
    im = Image.open(f).resize((w, h)); x, y = (i % cols) * w, (i // cols) * h; c.paste(im, (x, y))
    d.rectangle([x, y, x + 150, y + 22], fill='black'); d.text((x + 4, y + 4), os.path.basename(f), fill='yellow')
    d.line([x, y + int(830 / 2), x + w, y + int(830 / 2)], fill='magenta')
c.save(sys.argv[2], quality=85)
