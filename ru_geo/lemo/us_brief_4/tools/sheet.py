import sys, glob, os
from PIL import Image, ImageDraw
d = sys.argv[1]; fs = sorted(glob.glob(os.path.join(d, 's_*.jpg')), key=lambda f: float(os.path.basename(f)[2:-4]))
ims = []
for f in fs:
    im = Image.open(f).resize((960, 540)); ImageDraw.Draw(im).text((10, 10), os.path.basename(f), fill='red'); ims.append(im)
for k in range(0, len(ims), 6):
    W = Image.new('RGB', (1920, 540 * 3), 'black')
    for i, im in enumerate(ims[k:k + 6]): W.paste(im, ((i % 2) * 960, (i // 2) * 540))
    W.save(os.path.join(d, f'sheet_{k // 6}.jpg'))
print(len(ims))
