"""python3 detective1_cover.py <lineup_frame.png> <out.jpg> -> 1080x1920 cover for ENGLISH DETECTIVE #1.
The line-up frame (A, B, C at the height chart) is pushed down; the title sits above the faces, inside the 3:4 grid crop (y 240-1680)."""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
UNB = "node_modules/@expo-google-fonts/unbounded/900Black/Unbounded_900Black.ttf"
src, out = sys.argv[1], sys.argv[2]
fr = Image.open(src).convert("RGB")
im = Image.new("RGB", (1080, 1920), "#1E1A26"); im.paste(fr, (0, 260))
# dark band behind the title, fading into the line-up
band = Image.new("L", (1080, 1920), 0); d = ImageDraw.Draw(band)
for y in range(0, 900): d.line([(0, y), (1080, y)], fill=int(255 * min(1, max(0, (900 - y) / 320))))
im = Image.composite(Image.new("RGB", (1080, 1920), "#1E1A26"), im, band)
d = ImageDraw.Draw(im)
def text(s, y, size, fill, stroke="#2B1A12", sw=10, x=540, maxw=1000):
    f = ImageFont.truetype(UNB, size)
    while d.textlength(s, font=f) > maxw: size -= 4; f = ImageFont.truetype(UNB, size)
    d.text((x, y), s, font=f, fill=fill, anchor="mm", stroke_width=sw, stroke_fill=stroke)
# chip
f = ImageFont.truetype(UNB, 40); w = d.textlength("ENGLISH DETECTIVE #1", font=f) + 80
d.rounded_rectangle([540 - w / 2, 300, 540 + w / 2, 380], radius=40, fill="#2B2F3A", outline="#F2C14E", width=5)
d.text((540, 341), "ENGLISH DETECTIVE #1", font=f, fill="#F2C14E", anchor="mm")
text("КТО УКРАЛ", 480, 110, "#FFFFFF")
text("МИЛЛИОН?!", 615, 150, "#F2C14E")
# bottom plate
d.rounded_rectangle([80, 1480, 1000, 1610], radius=28, fill="#E0474C", outline="#FFFFFF", width=7)
text("CAN YOU FIND THE THIEF?", 1547, 58, "#FFFFFF", "#7A1E22", 0, maxw=840)
im.save(out, quality=92); print(out)
