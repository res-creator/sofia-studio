# Кинетическая типографика: фраза собирается по словам точно в такт голосу (как в AE «word-by-word pop»).
#   kinetic(img, t, dur, lines, times, hl=..., pos='center'|'lower') — поверх кадра 1920x1080 (RGBA, на месте);
#   word_times(json, trim, shot_start_in_para, shot_dur) — моменты слов из JSON озвучки относительно начала плана.
# Белый Inter 800 + коралловые слова-акценты с подчёркиванием, мягкое затемнение фона под текстом.
import json, re
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import look

W, H = 1920, 1080
MAX_W = 1600
POP = 0.22          # длительность «выскока» слова
UL_DELAY, UL_DUR = 0.12, 0.32   # коралловое подчёркивание у акцентных слов
FADE_IN, FADE_OUT = 0.3, 0.25
RISE = 18

_TILES, _MASKS = {}, {}

def _norm(w):
    return re.sub(r'[^\w]', '', w.lower().replace('ё', 'е'))

def _tile(word, size, color):
    """Слово с мягкой тенью на прозрачной плитке; возвращает (плитка, x_начала_глифа, y_базовой_линии)."""
    key = (word, size, color)
    if key in _TILES: return _TILES[key]
    f = look.font(size, 800)
    asc, desc = f.getmetrics()
    pad = int(size * 0.35)
    tw = int(f.getlength(word)) + 2 * pad; th = asc + desc + 2 * pad
    txt = Image.new('RGBA', (tw, th), (0, 0, 0, 0))
    ImageDraw.Draw(txt).text((pad, pad + asc), word, font=f, fill=color + (255,), anchor='ls')
    a = txt.split()[3]
    sh = Image.new('L', (tw, th), 0); off = max(2, size // 28)
    sh.paste(a, (0, off))
    sh = sh.filter(ImageFilter.GaussianBlur(max(3, size / 10))).point(lambda v: int(v * 0.7))
    out = Image.merge('RGBA', [Image.new('L', (tw, th), 0)] * 3 + [sh])
    out.alpha_composite(txt)
    _TILES[key] = (out, pad, pad + asc); return _TILES[key]

def _layout(lines, size, pos):
    """Подбор кегля (ни одна строка не шире 1600 px) и позиции слов: [(слово, x, y_baseline)], кегль, рамка блока."""
    while True:
        f = look.font(size, 800); sp = f.getlength(' ')
        widths = [sum(f.getlength(w) for w in ln.split()) + sp * (len(ln.split()) - 1) for ln in lines]
        if max(widths) <= MAX_W or size <= 40: break
        size = int(size * MAX_W / max(widths) * 0.98)
    asc, desc = f.getmetrics(); cap = asc - f.getbbox('Н')[1]   # высота заглавной
    lh = size * 1.15; n = len(lines)
    block_h = (n - 1) * lh + cap
    if pos == 'lower':
        top = H - 150 - block_h
    else:
        top = (H - block_h) / 2
    words, xs = [], []
    for i, ln in enumerate(lines):
        y = top + cap + i * lh
        x = 120 if pos == 'lower' else (W - widths[i]) / 2
        for w in ln.split():
            words.append((w, x, y)); x += f.getlength(w) + sp
    x0 = 120 if pos == 'lower' else (W - max(widths)) / 2
    return words, size, (x0, top, x0 + max(widths), top + block_h)

def _dim_mask(box, pos, size):
    """Альфа затемнения 0..1: лёгкое по всему кадру + мягкое пятно/градиент за текстом."""
    key = (tuple(int(v) for v in box), pos)
    if key in _MASKS: return _MASKS[key]
    x0, y0, x1, y1 = box
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    if pos == 'lower':
        g = np.clip((yy - (y0 - 260)) / (H - (y0 - 260)), 0, 1) ** 1.3   # снизу вверх
        side = np.clip(1.25 - xx / (x1 + 500), 0, 1)                    # слева, где текст
        m = 0.25 + 0.75 * g * (0.55 + 0.45 * side)
    else:
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        rx, ry = (x1 - x0) / 2 + 380, (y1 - y0) / 2 + 300
        d = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
        m = 0.4 + 0.6 * np.exp(-d * 1.3)
    _MASKS[key] = np.clip(m, 0, 1); return _MASKS[key]

def _spread(times, n, dur):
    """Недостающие моменты слов — равномерно, последнее слово ровно в 0.85·dur."""
    times = list(times[:n]); rest = n - len(times)
    if rest > 0:
        start = times[-1] if times else 0.15
        end = max(start + 0.1 * rest, 0.85 * dur)
        if times: times += [start + (end - start) * (i + 1) / rest for i in range(rest)]
        else: times += [start + (end - start) * i / max(1, rest - 1) for i in range(rest)]
    return times

def kinetic(img, t, dur, lines, times, hl=(), dim=0.55, pos='center', size=104):
    """Фраза по словам в такт голосу. lines — строки фразы; times — секунда появления каждого слова
    (относительно начала плана; если короче — остальные слова равномерно до 0.85·dur);
    hl — слова в коралловом цвете (без учёта регистра и пунктуации); dim — затемнение фона;
    pos 'center' (по центру) | 'lower' (нижняя треть, от x=120); size — кегль (ужимается под 1600 px)."""
    if t < 0 or t > dur: return
    words, sz, box = _layout(lines, size, pos)
    ts = _spread(times, len(words), dur)
    hls = {_norm(w) for w in hl}
    a_all = min(1.0, look.ease(t / FADE_IN)) * (max(0.0, (dur - t) / FADE_OUT) if t > dur - FADE_OUT else 1.0)
    if a_all <= 0: return
    # затемнение фона
    if dim > 0:
        m = _dim_mask(box, pos, sz) * (dim * a_all)
        arr = np.asarray(img).astype(np.float32)
        arr[..., :3] *= (1 - m)[..., None]
        img.paste(Image.fromarray(arr.astype(np.uint8), 'RGBA'))
    f = look.font(sz, 800)
    for (w, x, y), tw in zip(words, ts):
        u = t - tw
        if u < 0: continue
        acc = _norm(w) in hls
        tile, gx, gy = _tile(w, sz, look.ACCENT if acc else look.WHITE)
        kb = look.ease_back(u / POP); ka = look.ease_out(u / (POP * 0.7))
        sc = 0.82 + 0.18 * kb
        alpha = ka * a_all
        if alpha <= 0.003: continue
        tl = tile
        if sc < 0.999 or sc > 1.001:
            tl = tile.resize((max(1, int(tile.size[0] * sc)), max(1, int(tile.size[1] * sc))), Image.BICUBIC)
        if alpha < 0.999:
            tl = tl.copy(); tl.putalpha(tl.split()[3].point(lambda v: int(v * alpha)))
        wl = f.getlength(w)
        if acc:   # коралловое подчёркивание дорисовывается слева направо (под словом, ниже выносных)
            k = look.ease_out((u - UL_DELAY) / UL_DUR)
            if k > 0:
                core = w.rstrip(',.!?:;…»"—')
                wtrim = f.getlength(core) if core else wl
                th = max(4, int(sz * 0.045)); uy = y + sz * 0.27
                ul = Image.new('RGBA', (int(wtrim) + 4, th + 2), (0, 0, 0, 0))
                ImageDraw.Draw(ul).rounded_rectangle((0, 0, max(1, wtrim * k), th), th // 2, fill=look.ACCENT + (int(255 * a_all),))
                img.alpha_composite(ul, (int(x), int(uy)))
        # масштаб от центра слова по базовой линии
        cx = x + wl / 2
        px = cx - (gx + wl / 2) * sc
        py = y + (1 - kb) * RISE - gy * sc
        img.alpha_composite(tl, (int(round(px)), int(round(py))))

def word_times(vo_json_path, trim, shot_start_in_para, shot_dur):
    """Начала слов озвучки (JSON {'words': [[' слово', start, end], ...]}), попавших в план
    [shot_start_in_para, shot_start_in_para + shot_dur), в секундах от начала плана; t_слова = start − trim."""
    with open(vo_json_path, encoding='utf-8') as fh: d = json.load(fh)
    out = []
    for w in d.get('words', []):
        if not str(w[0]).strip(): continue
        tw = float(w[1]) - trim
        if shot_start_in_para <= tw < shot_start_in_para + shot_dur:
            out.append(round(tw - shot_start_in_para, 3))
    return out
