#!/usr/bin/env python3
"""python3 tools/sheet.py <папка_кадров> <выход.jpg> [колонок=4] [ширина=480]: контактный лист с подписью времени"""
import glob, sys
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4; w = int(sys.argv[4]) if len(sys.argv) > 4 else 480; h = w * 9 // 16
fs = sorted(glob.glob(d + '/f*.jpg')); rows = (len(fs) + cols - 1) // cols
sh = Image.new('RGB', (w * cols, h * rows)); dr = ImageDraw.Draw(sh)
for i, f in enumerate(fs):
    im = Image.open(f).resize((w, h)); sh.paste(im, ((i % cols) * w, (i // cols) * h)); n = int(f[-9:-4]); dr.rectangle([(i % cols) * w, (i // cols) * h, (i % cols) * w + 120, (i // cols) * h + 22], fill=(0, 0, 0)); dr.text(((i % cols) * w + 4, (i // cols) * h + 4), f'{n/30:.1f}s #{n}', fill=(255, 255, 255))
sh.save(out, quality=86); print(out, len(fs))
