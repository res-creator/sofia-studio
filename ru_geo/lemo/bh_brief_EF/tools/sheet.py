import sys
from PIL import Image, ImageDraw
fs = sys.argv[2:]; out = sys.argv[1]; W, Hh = 960, 540
cols = 2; rows = (len(fs) + 1) // 2
o = Image.new('RGB', (W * cols, Hh * rows), 'white'); d = ImageDraw.Draw(o)
for i, f in enumerate(fs):
    im = Image.open(f).resize((W, Hh)); x, y = (i % cols) * W, (i // cols) * Hh; o.paste(im, (x, y))
    d.rectangle([x, y + 415, x + W, y + 416], fill='red'); d.text((x + 8, y + 8), f.split('/')[-1], fill='red')
o.save(out, quality=85)
