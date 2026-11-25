# storyboard_series.png: per episode a row of phone-size frames, each labelled with time + shot type
import json, sys
from PIL import Image, ImageDraw, ImageFont
S = json.load(open('series/sb_spec.json'))['frames']; FW, FH = 300, 533; PAD = 14; LAB = 92
font = lambda n: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', n)
TIT = {1: 'Серия 1 · «Выбери два» (~64 с)', 2: 'Серия 2 · «Веган съел цветы ведущей» (~65 с)', 3: 'Серия 3 · «Невеста выбрала ЖЕНАТОГО» (~66 с)'}
eps = sorted({f['ep'] for f in S}); maxn = max(sum(1 for f in S if f['ep'] == e) for e in eps)
W = PAD + maxn * (FW + PAD); RH = 60 + LAB + FH + PAD; img = Image.new('RGB', (W, 90 + RH * len(eps)), '#fbf3f6'); d = ImageDraw.Draw(img)
d.text((PAD, 24), '«Давай замуж!» — сериал v5, раскадровка (кадры 1080×1920, показаны уменьшенно)', fill='#2a2230', font=font(34))
def wrap(s, n):
    out, cur = [], ''
    for w in s.split():
        if len(cur) + len(w) + 1 > n: out.append(cur); cur = w
        else: cur = (cur + ' ' + w).strip()
    return out + [cur]
for r, e in enumerate(eps):
    y0 = 90 + r * RH; d.text((PAD, y0 + 10), TIT[e], fill='#d63a8a', font=font(32))
    for i, f in enumerate([f for f in S if f['ep'] == e]):
        x = PAD + i * (FW + PAD); y = y0 + 60; d.rounded_rectangle([x, y, x + FW, y + LAB - 6], 10, fill='#2a2230')
        d.text((x + 10, y + 6), f"{f['st']:.1f} с", fill='#ffd23f', font=font(22))
        for k, line in enumerate(wrap(f['shot'], 30)[:3]): d.text((x + 10, y + 34 + k * 19), line, fill='#ffffff', font=font(15))
        im = Image.open(f"series/sb/{f['id']}.png").convert('RGB').resize((FW, FH), Image.LANCZOS); img.paste(im, (x, y + LAB))
img.save(sys.argv[1] if len(sys.argv) > 1 else 'storyboard_series.png'); print(img.size)
