# Общие помощники для рисованных анимаций части E (anim_cracks, anim_cracks2, anim_evac, anim_heatcut, anim_loans).
# Тот же язык, что в anim_cutter.py: тёмно-синий фон, белые/светлые объекты, коралловый (look.ACCENT) — активное,
# векторный слой рисуется в 2x и сжимается, плавные ease-движения, подписи Inter заглавными с разрядкой.
import math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                                   # ru_geo/iceland
sys.path.insert(0, os.path.join(ROOT, '..', 'lib'))
import look

W, H, FPS, SS = 1920, 1080, 30, 2
CORAL = look.ACCENT
CORAL_D, CORAL_L = (214, 82, 54), (255, 170, 148)
NAVY_A, NAVY_B = np.array((16, 45, 85), float), np.array((9, 27, 55), float)
ICE = (205, 214, 224)

def clamp(v, a=0.0, b=1.0): return max(a, min(b, v))
def lerp(a, b, k): return a + (b - a) * k
def lerpc(a, b, k): return tuple(int(round(lerp(x, y, k))) for x, y in zip(a, b))
def rnd(i, salt=0):
    x = math.sin(i * 127.1 + salt * 311.7) * 43758.5453
    return x - math.floor(x)

def fade(t, t0, t1=None, d=0.4):
    a = look.ease((t - t0) / d)
    if t1 is not None: a *= 1 - look.ease((t - t1) / d)
    return a

def navy(cx=0.52, cy=0.42, a=NAVY_A, b=NAVY_B):
    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    r = np.sqrt(((xx - W * cx) / W) ** 2 + ((yy - H * cy) / H) ** 2 * 1.4)
    k = np.clip(r / 0.75, 0, 1)[..., None] ** 1.3
    return a * (1 - k) + b * k

def to_img(arr): return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).convert('RGBA')

class Pen:
    """Рисование в 2x: координаты — экранные (1920x1080), ширины — в экранных пикселях."""
    def __init__(self, img, s=SS): self.d = ImageDraw.Draw(img); self.s = s
    def P(self, p): return (p[0] * self.s, p[1] * self.s)
    def poly(self, pts, fill, outline=None, w=0):
        self.d.polygon([self.P(p) for p in pts], fill=fill, outline=outline, width=int(w * self.s) if w else 0)
    def line(self, pts, fill, w):
        self.d.line([self.P(p) for p in pts], fill=fill, width=max(1, int(round(w * self.s))), joint='curve')
    def circ(self, c, r, fill=None, outline=None, w=1):
        s = self.s
        self.d.ellipse((s * (c[0] - r), s * (c[1] - r), s * (c[0] + r), s * (c[1] + r)), fill=fill, outline=outline,
                       width=max(1, int(round(w * s))))
    def rect(self, x0, y0, x1, y1, fill, r=0, outline=None, w=0):
        s = self.s
        if r: self.d.rounded_rectangle((x0 * s, y0 * s, x1 * s, y1 * s), int(r * s), fill=fill, outline=outline, width=int(w * s) if w else 0)
        else: self.d.rectangle((x0 * s, y0 * s, x1 * s, y1 * s), fill=fill, outline=outline, width=int(w * s) if w else 0)

def layer2x(w=W, h=H): return Image.new('RGBA', (w * SS, h * SS), (0, 0, 0, 0))
def down(l): return l.reduce(SS)

def shadow_of(layer1x, r=9, off=(9, 13), a=0.55, col=(2, 8, 20)):
    al = layer1x.split()[3].filter(ImageFilter.GaussianBlur(r)).point(lambda v: int(v * a))
    big = Image.new('L', layer1x.size, 0); big.paste(al, off)
    return Image.merge('RGBA', [Image.new('L', layer1x.size, c) for c in col] + [big])

def glow(img, pts_r, color=(255, 200, 150), blur=22, strength=1.0):
    """Мягкое свечение (screen-like): pts_r = [(x, y, r, a), ...] в экранных координатах."""
    g = Image.new('L', img.size, 0); d = ImageDraw.Draw(g)
    for x, y, r, a in pts_r:
        if a > 0: d.ellipse((x - r, y - r, x + r, y + r), fill=int(255 * clamp(a)))
    g = g.filter(ImageFilter.GaussianBlur(blur))
    arr = np.asarray(img, float); k = np.asarray(g, float)[..., None] / 255 * strength
    arr[..., :3] = arr[..., :3] + (255 - arr[..., :3]) * k * (np.array(color) / 255.0)
    img.paste(Image.fromarray(arr.astype(np.uint8)))

def camera(world2x, z=1.0, cx=W / 2, cy=H / 2, sx=0.0, sy=0.0):
    """Кадр из мира в 2x: масштаб z вокруг точки (cx, cy) мира, сдвиг (sx, sy) — тряска в экранных px."""
    hw, hh = W / 2 / z, H / 2 / z; WW, WH = world2x.size[0] / SS, world2x.size[1] / SS
    x0 = clamp(cx - hw - sx / z, 0, WW - 2 * hw); y0 = clamp(cy - hh - sy / z, 0, WH - 2 * hh)
    box = (x0 * SS, y0 * SS, (x0 + 2 * hw) * SS, (y0 + 2 * hh) * SS)
    return world2x.resize((W, H), Image.LANCZOS, box=box)

def w2s(p, z=1.0, cx=W / 2, cy=H / 2, sx=0.0, sy=0.0, wh=(W, H)):
    hw, hh = W / 2 / z, H / 2 / z
    x0 = clamp(cx - hw - sx / z, 0, wh[0] - 2 * hw); y0 = clamp(cy - hh - sy / z, 0, wh[1] - 2 * hh)
    return ((p[0] - x0) * z, (p[1] - y0) * z)

def label(img, anchor_pt, text_pt, s, a, size=27, ha='l', dot=True, color=look.WHITE):
    """Подпись карты (как в anim_cutter): коралловая точка, тонкая выноска, белый текст заглавными с разрядкой."""
    if a <= 0.01: return
    d = ImageDraw.Draw(img)
    if dot:
        r = 6; x, y = anchor_pt
        d.ellipse((x - r - 2.5, y - r - 2.5, x + r + 2.5, y + r + 2.5), fill=(255, 255, 255, int(255 * a)))
        d.ellipse((x - r, y - r, x + r, y + r), fill=CORAL + (int(255 * a),))
        k = look.ease_out(a)
        ex = lerp(anchor_pt[0], text_pt[0], k); ey = lerp(anchor_pt[1], text_pt[1], k)
        if math.hypot(ex - x, ey - y) > 2: d.line((anchor_pt, (ex, ey)), fill=(255, 255, 255, int(200 * a)), width=2)
    dx = (1 - look.ease_out(a)) * (14 if ha == 'l' else -14 if ha == 'r' else 0)
    tx = text_pt[0] + (10 if ha == 'l' else -10 if ha == 'r' else 0) + dx
    look.text(img, (tx, text_pt[1]), s, size, 700, color, {'l': 'lm', 'r': 'rm', 'm': 'mm'}[ha], alpha=a, track=4, shadow=0.9)

def spark(img, p, k, seed, rays=11, scale=1.0):
    """Вспышка (как в anim_cutter): свечение, лучи, коралловое кольцо; k = 0..1."""
    if k <= 0 or k >= 1: return
    glow(img, [(p[0], p[1], (26 + 40 * k) * scale, (1 - k) ** 2.5)], (255, 217, 153), 22)
    lay = layer2x(); pen = Pen(lay)
    for j in range(rays):
        ang = 2 * math.pi * (j / rays + 0.3 * rnd(j, seed)); L0 = (6 + 30 * look.ease_out(k)) * scale
        L1 = L0 + (16 + 22 * rnd(j, seed + 1) * (1 - k)) * scale
        pen.line([(p[0] + math.cos(ang) * L0, p[1] + math.sin(ang) * L0), (p[0] + math.cos(ang) * L1, p[1] + math.sin(ang) * L1)],
                 (255, 244, 214, int(255 * (1 - k))), 2.4)
    pen.circ(p, (10 + 46 * look.ease_out(k)) * scale, None, CORAL + (int(230 * (1 - k)),), 3)
    pen.circ(p, 9 * (1 - k) + 2, (255, 255, 255, int(255 * (1 - k))))
    img.alpha_composite(down(lay))

def pad(img, box, a, r=26, blur=22, k=120):
    """Мягкая тёмная подложка под текст."""
    if a <= 0: return
    m = Image.new('L', img.size, 0); ImageDraw.Draw(m).rounded_rectangle(box, r, fill=int(k * a))
    img.alpha_composite(Image.merge('RGBA', [Image.new('L', img.size, 0)] * 3 + [m.filter(ImageFilter.GaussianBlur(blur))]))

def run(frame, name, total):
    """frame(t) -> PIL RGB/RGBA 1920x1080.  Отладка: script.py <total> t1,t2 out_dir -> PNG."""
    out = os.path.join(ROOT, 'cache', f'{name}.mp4')
    if len(sys.argv) > 3:
        os.makedirs(sys.argv[3], exist_ok=True)
        for tt in sys.argv[2].split(','):
            frame(float(tt)).convert('RGB').save(os.path.join(sys.argv[3], f'{name}_t{tt}.png'))
        return
    N = int(round(total * FPS))
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-frames:v', str(N), '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-an',
                          '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    for i in range(N):
        p.stdin.write(frame(i / FPS).convert('RGB').tobytes())
        if i % 30 == 0: print(f'{name} {i}/{N}', flush=True)
    p.stdin.close(); p.wait()
    print('->', out, N, 'frames', total, 's')
