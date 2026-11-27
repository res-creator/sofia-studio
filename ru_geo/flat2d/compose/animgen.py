#!/usr/bin/env python3
"""Анимация «рисования» готовой схемы: python3 animgen.py <in.jpg> <длительность_с> <out.mp4>
Схема режется на смысловые части (связные области), части рисуются по очереди (заголовок, потом слева направо и сверху вниз),
камера подъезжает к рисуемой части и в конце отъезжает на общий план."""
import math, subprocess, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
W, H, FPS = 1920, 1080, 30
def ease(x): x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)
def steps_of(img):
    a = np.asarray(img).astype(np.int16); bg = a[0:6, 0:6].reshape(-1, 3).mean(0)
    ink = (np.abs(a - bg).sum(2) > 45)
    sm = ink.reshape(H // 4, 4, W // 4, 4).any(axis=(1, 3))                      # 270x480
    dil = ndi.binary_dilation(sm, structure=np.ones((3, 3), bool), iterations=4)  # ~16 px слияния
    lab, n = ndi.label(dil)
    comps = []
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        ys, xs = sl; area = int(((lab[sl] == i) & sm[sl]).sum())
        if area < 6: continue
        comps.append(dict(id=i, x0=xs.start * 4, x1=xs.stop * 4, y0=ys.start * 4, y1=ys.stop * 4))
    if not comps: return lab, [], bg
    comps.sort(key=lambda c: (c['y0'] > 150, round(((c['y0'] + c['y1']) / 2) / 70), c['x0']))
    return lab, comps, bg
def render(src, dur, out):
    img = Image.open(src).convert('RGB')
    if img.size != (W, H): img = img.resize((W, H), Image.LANCZOS)
    A = np.asarray(img); lab, comps, bg = steps_of(img); lab_full = None
    n = len(comps); draw_t = 0.72 * dur
    maxsteps = max(1, int(draw_t / 0.45)); groups = []
    if n:
        k = math.ceil(n / min(n, maxsteps, 12))
        for i in range(0, n, k): groups.append(comps[i:i + k])
    ng = max(1, len(groups)); st = draw_t / ng
    labmask = [np.isin(lab, [c['id'] for c in g]) for g in groups]
    bgimg = np.empty_like(A); bgimg[:] = bg.astype(np.uint8)
    gb = []
    for g in groups:
        x0 = min(c['x0'] for c in g); x1 = max(c['x1'] for c in g); y0 = min(c['y0'] for c in g); y1 = max(c['y1'] for c in g); gb.append((x0, y0, x1, y1))
    def cam_for(i):
        x0, y0, x1, y1 = gb[i]; bw = (x1 - x0) * 1.35 + 160; bh = (y1 - y0) * 1.35 + 120
        z = min(1.55, W / bw, H / bh)
        if z < 1.2: return (W / 2, H / 2, 1.0)
        cx = (x0 + x1) / 2; cy = (y0 + y1) / 2; vw = W / z; vh = H / z
        return (min(max(cx, vw / 2), W - vw / 2), min(max(cy, vh / 2), H - vh / 2), z)
    cams = [cam_for(i) for i in range(len(groups))] if groups else []
    bases = [bgimg]
    for m in labmask:
        mf = np.kron(m, np.ones((4, 4), bool)); bases.append(np.where(mf[..., None], A, bases[-1]))
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '19', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    nf = max(2, int(round(dur * FPS)))
    for f in range(nf):
        t = f / FPS
        if not groups: frame = A; view = (W / 2, H / 2, 1.0)
        elif t >= draw_t:
            frame = A; c0 = cams[-1]; e = ease((t - draw_t) / 0.7); view = (c0[0] + (W / 2 - c0[0]) * e, c0[1] + (H / 2 - c0[1]) * e, c0[2] + (1.0 - c0[2]) * e)
        else:
            gi = min(ng - 1, int(t / st)); local = (t - gi * st) / st; pr = ease(local / 0.8)
            x0, y0, x1, y1 = gb[gi]; cut = int(x0 + pr * (x1 - x0)); frame = bases[gi].copy()
            if cut > x0: frame[y0:y1, x0:cut] = bases[gi + 1][y0:y1, x0:cut]
            prev = cams[gi - 1] if gi > 0 else (W / 2, H / 2, 1.0); cu = cams[gi]; e = ease(local / 0.45)
            view = (prev[0] + (cu[0] - prev[0]) * e, prev[1] + (cu[1] - prev[1]) * e, prev[2] + (cu[2] - prev[2]) * e)
        cx, cy, z = view
        if z > 1.001:
            vw = W / z; vh = H / z; x0 = int(max(0, min(W - vw, cx - vw / 2))); y0 = int(max(0, min(H - vh, cy - vh / 2)))
            fr = Image.fromarray(frame[y0:y0 + int(vh), x0:x0 + int(vw)]).resize((W, H), Image.BILINEAR); p.stdin.write(np.asarray(fr).tobytes())
        else: p.stdin.write(np.ascontiguousarray(frame).tobytes())
    p.stdin.close(); p.wait()
if __name__ == '__main__': render(sys.argv[1], float(sys.argv[2]), sys.argv[3])
