"""Рукописный шрифт (Caveat, OFL) -> однолинейные штрихи для движка «Доска» (формат EMS Tech JSON).
Глиф рисуется крупно, сжимается до осевой линии (skeletonize), линия разбирается на штрихи по порядку письма.
python3 font2strokes.py Caveat.ttf out.json"""
import json, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from skimage.morphology import skeletonize

S = 420
font = ImageFont.truetype(sys.argv[1], S)
try: font.set_variation_by_axes([500])
except Exception: pass
asc, desc = font.getmetrics()
CHARS = ('АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя'
         'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
         '.,:;!?-–—()«»"\'%/+=×²³°№<>@#&*[]')
cap = font.getbbox('Н')
capH = cap[3] - cap[1]; K = 677 / capH                       # px -> единицы шрифта (высота заглавной = 677)
N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]

def rdp(p, eps):
    if len(p) < 3: return p
    a, b = np.array(p[0], float), np.array(p[-1], float); d = b - a; L = np.hypot(*d) or 1
    dist = [abs(d[0] * (q[1] - a[1]) - d[1] * (q[0] - a[0])) / L for q in p[1:-1]]
    i = int(np.argmax(dist)) + 1
    if dist[i - 1] > eps: return rdp(p[:i + 1], eps)[:-1] + rdp(p[i:], eps)
    return [p[0], p[-1]]

def strokes(ch):
    W, H = int(S * 2.2), int(S * 1.8)
    im = Image.new('L', (W, H), 0); d = ImageDraw.Draw(im); ox, base = int(S * 0.3), int(S * 1.2)
    d.text((ox, base), ch, font=font, fill=255, anchor='ls')
    a = np.array(im) > 128
    if not a.any(): return []
    sk = skeletonize(a)
    pts = set(zip(*np.nonzero(sk)))
    nb = lambda p: [(p[0] + dy, p[1] + dx) for dy, dx in N8 if (p[0] + dy, p[1] + dx) in pts]
    deg = {p: len(nb(p)) for p in pts}
    used = set(); paths = []
    def walk(start, nxt):
        path = [start, nxt]; used.add(frozenset((start, nxt))); prev, cur = start, nxt
        while deg[cur] == 2:
            cand = [q for q in nb(cur) if q != prev and frozenset((cur, q)) not in used]
            if not cand: break
            prev, cur = cur, cand[0]; used.add(frozenset((prev, cur))); path.append(cur)
        return path
    nodes = sorted([p for p in pts if deg[p] != 2], key=lambda p: p[1])
    for p in nodes:
        for q in nb(p):
            if frozenset((p, q)) not in used: paths.append(walk(p, q))
    for p in sorted(pts, key=lambda p: p[1]):                    # замкнутые петли (о, 0)
        for q in nb(p):
            if frozenset((p, q)) not in used: paths.append(walk(p, q))
    out = []
    for pth in paths:
        if len(pth) < 7: continue
        xy = [(x, y) for y, x in pth]
        if np.hypot(xy[0][0] - xy[-1][0], xy[0][1] - xy[-1][1]) < 4:          # петля: делим по самой дальней точке
            far = int(np.argmax([np.hypot(x - xy[0][0], y - xy[0][1]) for x, y in xy]))
            xy = rdp(xy[:far + 1], 1.6)[:-1] + rdp(xy[far:], 1.6)
        else: xy = rdp(xy, 1.6)
        if xy[0][0] > xy[-1][0] + 8 or (abs(xy[0][0] - xy[-1][0]) <= 8 and xy[0][1] > xy[-1][1]): xy = xy[::-1]   # пишем слева направо, сверху вниз
        out.append(xy)
    # склеиваем штрихи, которые продолжают друг друга (концы рядом), чтобы буква писалась меньшим числом движений
    merged = True
    while merged and len(out) > 1:
        merged = False
        for i in range(len(out)):
            for j in range(len(out)):
                if i != j and np.hypot(out[i][-1][0] - out[j][0][0], out[i][-1][1] - out[j][0][1]) < 6:
                    out[i] = out[i] + out[j][1:]; out.pop(j); merged = True; break
            if merged: break
    out.sort(key=lambda s: (min(p[0] for p in s) // 40, min(p[1] for p in s)))
    return [[v for (x, y) in s for v in ((x - ox) * K, (base - y) * K)] for s in out]

G = {' ': {'w': font.getlength(' ') * K, 's': []}}
for ch in CHARS:
    G[ch] = {'w': round(font.getlength(ch) * K, 1), 's': [[round(v, 1) for v in s] for s in strokes(ch)]}
json.dump({'meta': 'Caveat (SIL OFL 1.1, Impallari Type), centre-lines by skeletonize', 'glyphs': G}, open(sys.argv[2], 'w'), ensure_ascii=False)
print(len(G), 'glyphs')
