# Анимация «валютные кредиты» (Исландия, 2008), чистая инфографика.
#   o17 («Многие семьи брали кредиты в евро и иенах»): семья, полоса долга в кронах (пример: 10 млн),
#        рядом монеты: крона (коралловая), потом € и ¥; от € и ¥ к долгу тянутся пунктиры.
#   o18 («и после обвала кроны их долги выросли почти вдвое»): монета кроны сжимается (обвал), € и ¥ — того же
#        размера, полоса долга в кронах вырастает почти вдвое (10 → 19 млн), значок «≈ ×2».
# Запуск (из ru_geo/iceland):  python3 rework/anim_loans.py [секунды=7.37]  ->  cache/anim_loans.mp4
import math, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from anim_common import (W, H, SS, CORAL, CORAL_D, CORAL_L, look, clamp, lerp, lerpc, rnd, fade, Pen, layer2x, down, shadow_of,
                         glow, label, pad, navy, run)

TOTAL = float(sys.argv[1]) if len(sys.argv) > 1 else 7.37
K = TOTAL / 7.37
T_FAM = 0.25 * K                                               # «Многие семьи»
T_BAR = 1.35 * K                                               # «брали кредиты»
T_EUR, T_YEN = 2.45 * K, 2.90 * K                              # «в евро», «и иенах»
T_CRASH = 3.95 * K                                             # «обвала кроны» 3,97–4,51
T_GROW = 5.20 * K                                              # «долги выросли» 5,29–5,87
T_X2 = 6.30 * K                                                # «почти вдвое»

BG = navy(0.45, 0.45)
WHITE_C, WHITE_D = (236, 240, 245), (200, 210, 222)
BX, BY, BH = 480, 430, 96                                      # полоса долга
PX_PER_M = 42.0                                                # пикселей на миллион крон
COINS = {'kr': (700, 810), 'eur': (1000, 810), 'yen': (1300, 810)}
CR = 86

def pop(t, t0, d=0.45): return look.ease_back((t - t0) / d) if t > t0 else 0.0

def family(pen, t):
    k = pop(t, T_FAM, 0.5)
    if k <= 0: return
    figs = [(-78, 1.0, 0.0), (0, 1.0, 0.08), (66, 0.72, 0.16), (122, 0.62, 0.24)]       # (dx, масштаб, задержка)
    for dx, s, dl in figs:
        kk = pop(t, T_FAM + dl * K, 0.45)
        if kk <= 0: continue
        cx = 240 + dx; base = 590
        h = 150 * s * kk; bob = 2 * math.sin(t * 2.2 + dx)
        pen.rect(cx - 30 * s, base - h + 36 * s * kk + bob, cx + 30 * s, base, WHITE_C + (255,), r=24 * s)
        pen.circ((cx, base - h + bob), 24 * s * kk, WHITE_C + (255,))

def coin(img, c, r, sym, col, ring, txt_col, a, label_s=None, sub_col=look.SOFT, wobble=0.0):
    if a <= 0 or r < 2: return
    lay = layer2x(); p = Pen(lay)
    rx = r * (1 - 0.06 * abs(math.sin(wobble)))                # лёгкое «покачивание» монеты
    p.d.ellipse((SS * (c[0] - rx + 6), SS * (c[1] - r + 10), SS * (c[0] + rx + 6), SS * (c[1] + r + 10)), fill=(2, 8, 20, int(90 * a)))
    p.d.ellipse((SS * (c[0] - rx), SS * (c[1] - r), SS * (c[0] + rx), SS * (c[1] + r)), fill=ring + (int(255 * a),))
    p.d.ellipse((SS * (c[0] - rx * 0.84), SS * (c[1] - r * 0.84), SS * (c[0] + rx * 0.84), SS * (c[1] + r * 0.84)), fill=col + (int(255 * a),))
    img.alpha_composite(down(lay))
    look.text(img, (c[0], c[1] + r * 0.04), sym, max(8, int(r * 0.95)), 800, txt_col, 'mm', alpha=a, shadow=0)

def frame(t):
    img = Image.fromarray(BG.astype(np.uint8)).convert('RGBA')
    lay = layer2x(); pen = Pen(lay)
    # тонкая сетка-«бумага» для инфографики, медленно плывёт
    off = (t * 6) % 60
    for x in np.arange(-60, W + 60, 60):
        pen.line([(x + off, 0), (x + off, H)], (40, 70, 110, 40), 1)
    for y in np.arange(0, H + 60, 60):
        pen.line([(0, y), (W, y)], (40, 70, 110, 40), 1)
    family(pen, t)
    img.alpha_composite(down(lay))

    # ---- полоса долга
    ga = fade(t, T_BAR - 0.1 * K, d=0.3)
    m1 = 10 * look.ease_out((t - T_BAR) / (0.75 * K))
    m2 = 9 * look.ease((t - T_GROW) / (0.8 * K))
    mil = m1 + m2
    if ga > 0:
        look.text(img, (BX, BY - 40), 'ДОЛГ СЕМЬИ В КРОНАХ', 30, 700, look.WHITE, 'lm', alpha=ga, track=4, shadow=0.9)
        lay = layer2x(); p = Pen(lay)
        p.rect(BX, BY, BX + 19 * PX_PER_M + 40, BY + BH, (255, 255, 255, int(18 * ga)), r=14)          # дорожка
        L = mil * PX_PER_M
        if L > 4:
            grow = clamp((mil - 10) / 9)
            col = lerpc(WHITE_C, CORAL, grow)
            p.rect(BX, BY, BX + L, BY + BH, col + (255,), r=14)
        if t > T_GROW:                                         # пунктир старой длины
            xo = BX + 10 * PX_PER_M
            for y in np.arange(BY - 14, BY + BH + 16, 14):
                p.line([(xo, y), (xo, y + 7)], (255, 255, 255, int(220 * fade(t, T_GROW, d=0.3))), 2.4)
        img.alpha_composite(down(lay))
        val = f'{mil:.0f} МЛН КР.' if mil >= 0.5 else ''
        tx = BX + max(L, 120) + 26
        look.text(img, (tx, BY + BH / 2), val, 46, 800, look.WHITE, 'lm', alpha=ga, shadow=0.9)
        look.text(img, (BX, BY + BH + 36), 'ПРИМЕР', 20, 600, look.SOFT, 'lm', alpha=ga * 0.8, track=4, shadow=0.6)

    # ---- монеты
    kr_s = 1 - 0.45 * look.ease((t - T_CRASH) / (0.6 * K))
    shake = 4 * math.sin(t * 50) * math.exp(-max(0, t - T_CRASH) * 4) * (t > T_CRASH)
    for key, t0, sym, col, ring, tc, name in (('kr', T_BAR + 0.2 * K, 'кр', CORAL, CORAL_D, look.WHITE, 'КРОНА'),
                                              ('eur', T_EUR, '€', WHITE_C, WHITE_D, (30, 50, 80), 'ЕВРО'),
                                              ('yen', T_YEN, '¥', WHITE_C, WHITE_D, (30, 50, 80), 'ИЕНА')):
        k = pop(t, t0, 0.45)
        if k <= 0: continue
        c = COINS[key]; bob = 5 * math.sin(t * 1.6 + c[0] / 200)
        r = CR * k * (kr_s if key == 'kr' else 1.0)
        cc = (c[0] + (shake if key == 'kr' else 0), c[1] + bob + (CR - r) * (0.0))
        coin(img, cc, r, sym, col, ring, tc, min(1, k), wobble=t * 1.3 + c[0])
        look.text(img, (c[0], c[1] + CR + 44), name, 26, 700, look.WHITE, 'mm', alpha=min(1, k), track=4, shadow=0.9)
        # пунктир от € и ¥ к долгу
        if key != 'kr':
            pa = clamp((t - t0 - 0.2 * K) / (0.5 * K))
            if pa > 0:
                d = ImageDraw.Draw(img)
                a0 = (c[0], c[1] - CR - 12); a1 = (BX + 6.5 * PX_PER_M + (0 if key == 'eur' else 40), BY + BH + 60)
                n = 16
                for i in range(int(n * pa)):
                    u0, u1 = i / n, (i + 0.5) / n
                    d.line(((lerp(a0[0], a1[0], u0), lerp(a0[1], a1[1], u0)), (lerp(a0[0], a1[0], u1), lerp(a0[1], a1[1], u1))),
                           fill=(255, 255, 255, 150), width=3)
    if t > T_CRASH:                                            # подпись «обвал» у кроны
        a = fade(t, T_CRASH + 0.15 * K)
        c = COINS['kr']
        lay = layer2x(); p = Pen(lay)
        ax = c[0] - CR - 70; ay0 = c[1] - 60; ay1 = ay0 + 120 * look.ease_out(a)
        p.line([(ax, ay0), (ax, ay1)], CORAL + (int(255 * a),), 7)
        p.poly([(ax - 18, ay1 - 8), (ax + 18, ay1 - 8), (ax, ay1 + 16)], CORAL + (int(255 * a),))
        img.alpha_composite(down(lay))
        look.text(img, (ax - 30, c[1]), 'ОБВАЛ', 34, 800, CORAL_L, 'rm', alpha=a, track=3, shadow=0.9)

    # ---- «≈ ×2»
    if t > T_X2:
        k = pop(t, T_X2, 0.4); a = min(1, k)
        x0 = BX + 19 * PX_PER_M + 40 + 400; cy = BY + BH / 2
        lay = layer2x(); p = Pen(lay)
        r = 84 * k
        p.circ((x0, cy), r, CORAL + (int(255 * a),)); p.circ((x0, cy), r, None, (255, 255, 255, int(255 * a)), 4)
        img.alpha_composite(down(lay))
        look.text(img, (x0, cy + 4), '≈×2', int(max(8, 62 * k)), 800, look.WHITE, 'mm', alpha=a, shadow=0.4)

    look.tag(img, 'Исландия, 2008', t, sub='кредиты в валюте')
    return img.convert('RGB')

if __name__ == '__main__':
    run(frame, 'anim_loans', TOTAL)
