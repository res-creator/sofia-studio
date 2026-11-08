# Тест «живых фото» (ru_geo/lib/motion.py): по 4-секундному клипу на режим → rework/motion_tests/<mode>.mp4,
# кадры начало/середина/конец → rework/motion_tests/frames/, контактный лист → rework/sheets/motion_preview.jpg.
# Запуск: python3 motion_test.py [mode ...]
import os, sys, time, subprocess
from PIL import Image, ImageDraw
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', '..', 'lib'))
import motion, look
IMG = os.path.join(D, '..', '..', 'data', 'commons_img')
OUT = os.path.join(D, 'motion_tests'); FR = os.path.join(OUT, 'frames'); SH = os.path.join(D, 'sheets')
W, H, FPS, DUR = 1920, 1080, 30, 4.0

LAND = 'Thingvellir.jpg.jpg'                                                            # пейзаж (скала + небо)
WIDE = 'Eldfell__Heimaey__Islas_Vestman__Suðurland__Islandia__2014-08-17__DD_067.jpg.jpg'  # широкая панорама 2.2:1
PEOPLE = 'Grandi_fish_processing_two_workers_2011.jpg.jpg'                              # люди
ARCH = 'Reykjavík__1910-1920.jpg.jpg'                                                    # архив ч/б
SMALL = 'L_rdalstunnelen__3._hall_.jpg'                                                  # маленькое (960×720)
PORT = 'Katrín_Jakobsdóttir__cropped_.jpg.jpg'                                           # портрет/вертикаль

# (имя клипа, файл, режим, fit, seed, grain, dust)
TESTS = [
    ('parallax', LAND, 'parallax', False, 1, 0, False),
    ('parallax_people', PEOPLE, 'parallax', False, 2, 0, False),
    ('tilt3d', PEOPLE, 'tilt3d', False, 1, 0, False),
    ('push', LAND, 'push', False, 3, 0, False),
    ('pan_fast', WIDE, 'pan_fast', False, 1, 0, False),
    ('rack', PEOPLE, 'rack', False, 1, 0, False),
    ('split_zoom', PEOPLE, 'split_zoom', False, 1, 0, False),
    ('fit_archival', ARCH, 'auto', True, 1, 0.035, True),
    ('fit_portrait', PORT, 'auto', True, 2, 0, False),
    ('auto_small', SMALL, 'auto', False, 4, 0, False),
]


def render(name, f, mode, fit, seed, grain, dust):
    out = os.path.join(OUT, name + '.mp4')
    p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    n = round(DUR * FPS); keep = {0: 'a', n // 2: 'b', n - 1: 'c'}; shots = {}
    t0 = time.time(); k = 0; tgen = 0.0
    g = motion.frames(os.path.join(IMG, f), DUR, mode=mode, seed=seed, fit=fit, grain=grain, dust=dust)
    while True:
        ta = time.time()
        try: b = next(g)
        except StopIteration: break
        tgen += time.time() - ta
        assert len(b) == W * H * 3
        if k in keep: shots[keep[k]] = Image.frombytes('RGB', (W, H), b)
        p.stdin.write(b); k += 1
    p.stdin.close(); p.wait()
    assert k == n, (k, n)
    for kk, im in shots.items(): im.save(os.path.join(FR, f'{name}_{kk}.png'))
    print(f'{name:16s} {mode:10s} fit={fit!s:5s} {k} fr  gen {tgen / k * 1000:.0f} ms/fr  total {time.time() - t0:.1f}s', flush=True)
    return shots


def sheet(rows):
    tw, th, lw = 480, 270, 230
    S = Image.new('RGB', (lw + 3 * (tw + 8), len(rows) * (th + 8) + 50), (14, 18, 24))
    d = ImageDraw.Draw(S)
    for j, h in enumerate(('start', 'middle', 'end')): d.text((lw + j * (tw + 8) + 8, 14), h, font=look.font(26), fill=(225, 230, 236))
    for i, (name, f, sh) in enumerate(rows):
        y = 50 + i * (th + 8)
        d.text((12, y + 8), name, font=look.font(26), fill=(255, 107, 74))
        d.text((12, y + 44), f[:24], font=look.font(15, 400), fill=(225, 230, 236))
        for j, kk in enumerate('abc'):
            if kk in sh: S.paste(sh[kk].resize((tw, th), Image.LANCZOS), (lw + j * (tw + 8), y))
    S.save(os.path.join(SH, 'motion_preview.jpg'), quality=88)


if __name__ == '__main__':
    os.makedirs(FR, exist_ok=True); os.makedirs(SH, exist_ok=True)
    only = sys.argv[1:]
    rows = []
    for t in TESTS:
        if only and t[0] not in only:
            sh = {kk: Image.open(os.path.join(FR, f'{t[0]}_{kk}.png')) for kk in 'abc' if os.path.exists(os.path.join(FR, f'{t[0]}_{kk}.png'))}
        else:
            sh = render(*t)
        rows.append((t[0], t[1], sh))
    sheet(rows)
