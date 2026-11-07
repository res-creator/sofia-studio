"""Two thumbnail candidates for the Harvey film (1280x720). Frames are DVIDS public-domain footage."""
import subprocess, io, os
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import re
FI = re.search(r"FI = '([^']+)'", open(os.path.join(ROOT, 'tools/build_final.py')).read()).group(1)
def F(n, s): return ImageFont.truetype(FI + n, s)
def frame(src, t):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', f'{ROOT}/assets/raw/dvids/dvids_{src}.mp4', '-frames:v', '1', '-f', 'image2', '-c:v', 'png', '-'], capture_output=True, check=True).stdout
    return Image.open(io.BytesIO(b)).convert('RGB')
YEL = (255, 196, 30)
def text(d, xy, s, f, fill, anchor='la'):
    d.text(xy, s, font=f, fill=fill, anchor=anchor, stroke_width=6, stroke_fill=(0, 0, 0))

# A: aerial of a flooded neighbourhood (Coast Guard, Houston, Aug 27, 2017)
im = frame('546164', 27.0).resize((1280, 720), Image.LANCZOS)
im = ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(0.85)).enhance(1.15)
sh = Image.new('L', (1280, 720)); ImageDraw.Draw(sh).rectangle((0, 0, 760, 720), fill=170); sh = sh.filter(ImageFilter.GaussianBlur(160))
im = Image.composite(Image.new('RGB', im.size, (0, 0, 0)), im, sh)
d = ImageDraw.Draw(im)
text(d, (56, 70), 'FORECAST:', F('InterDisplay-Black.otf', 70), (255, 255, 255))
text(d, (50, 150), '15–30', F('InterDisplay-Black.otf', 210), YEL)
text(d, (56, 370), 'INCHES', F('InterDisplay-Black.otf', 110), YEL)
text(d, (56, 520), 'HOUSTON: NO ORDER TO LEAVE', F('InterDisplay-Black.otf', 50), (255, 255, 255))
im.save(f'{ROOT}/final/thumbnail_a.jpg', quality=92)

# B: hoist camera over a roof (Coast Guard, Houston, Aug 27-28, 2017)
fr = frame('546574', 4.0).crop((180, 0, 844, 576)).resize((830, 720), Image.LANCZOS)
fr = ImageEnhance.Sharpness(ImageEnhance.Contrast(fr).enhance(1.15)).enhance(1.6)
im = Image.new('RGB', (1280, 720), (10, 12, 15)); im.paste(fr, (450, 0))
sh = Image.new('L', (1280, 720)); ImageDraw.Draw(sh).rectangle((0, 0, 560, 720), fill=255); sh = sh.filter(ImageFilter.GaussianBlur(70))
im = Image.composite(Image.new('RGB', im.size, (10, 12, 15)), im, sh)
d = ImageDraw.Draw(im)
text(d, (48, 90), 'FORECAST', F('InterDisplay-Black.otf', 100), (255, 255, 255))
text(d, (48, 200), 'DAYS AHEAD.', F('InterDisplay-Black.otf', 100), (255, 255, 255))
text(d, (48, 350), 'STILL ON', F('InterDisplay-Black.otf', 112), YEL)
text(d, (48, 470), 'THE ROOF', F('InterDisplay-Black.otf', 112), YEL)
d.ellipse((850, 300, 1050, 475), outline=YEL, width=8)
im.save(f'{ROOT}/final/thumbnail_b.jpg', quality=92)
print('ok')
