#!/usr/bin/env python3
"""Fast approximate check (no browser): while the camera is (nearly) at rest, anything drawn or pinned that sits in the
subtitle band (screen y > 830), and text cut by the frame edge. Camera maths = kit/board.js (no parallax, no hand).
usage: python3 tools/bandcheck.py scenes/film.json"""
import json, math, sys
S = json.load(open(sys.argv[1])); C = S['cam']; DUR = S['dur']
_lut = {}
def bease(u, a, b):
    if u <= 0: return 0.
    if u >= 1: return 1.
    k = (a, b)
    if k not in _lut:
        n = 2048; L = [0.] * (n + 1); s = 0.
        for i in range(1, n + 1): m = (i - .5) / n; s += m ** a * (1 - m) ** b; L[i] = s
        _lut[k] = [v / s for v in L]
    L = _lut[k]; f = u * 2048; i = int(f); return L[i] + (L[min(2048, i + 1)] - L[i]) * (f - i)
def cam(t):
    x, y, lz = C['x'], C['y'], math.log(C['z'])
    for m in C['moves']:
        if t <= m['t']: continue
        u = bease(min(1, (t - m['t']) / m['d']), m['a'], m['b'])
        x += m.get('dx', 0) * u; y += m.get('dy', 0) * u; lz += m.get('dl', 0) * u
    return x, y, math.exp(lz)
def scr(p, c): return 960 + (p[0] - c[0]) * c[2], 540 + (p[1] - c[1]) * c[2]
def boxes(e):
    """(label, is_text, t_start, [x0,y0,x1,y1]) in board px"""
    ty = e['type']
    if ty == 'ink':
        k = e['kind']; t = e.get('t', 0)
        if k == 'line': P = e['points']
        elif k == 'hatch': P = [p for s in e['strokes'] for p in s['points']]; t = min(s['t'] for s in e['strokes'])
        elif k == 'dim': P = [e['from'], e['to']]
        elif k == 'ring':
            r = e['r'] if isinstance(e['r'], list) else [e['r'], e['r']]; P = [[e['c'][0] - r[0], e['c'][1] - r[1]], [e['c'][0] + r[0], e['c'][1] + r[1]]]
        elif k in ('write', 'count'):
            txt = e['text']; s = e['size']; w = len(txt) * s * .5; x, y = e['xy']
            if e.get('align') == 'right': x -= w
            return [(txt, True, t, [x, y - s * .8, x + w, y + s * .2])]
        else: return []
        xs = [p[0] for p in P]; ys = [p[1] for p in P]
        return [(k, False, t, [min(xs), min(ys), max(xs), max(ys)])]
    if ty == 'tag':
        s = e['size']; x, y = e['xy']; w = len(e['text']) * s * .62 + s * 1.6
        return [(e['text'], True, e['arrive']['t'], [x - s * .6, y - s * .9, x + w, y + s * .9])]
    if ty == 'magnet':
        x, y = e['xy']; r = e['r']; return [('magnet', False, e['arrive']['t'], [x - r, y - r, x + r, y + r])]
    if ty == 'print':
        m = json.load(open('kit/objects/%s.json' % e['src'])); W, H = m.get('size', [m.get('w'), m.get('h')])
        w = e.get('w') or e['h'] * W / H; h = w * H / W; x, y = e['xy']
        return [(e['id'], False, e['arrive']['t'], [x - w / 2, y - h / 2, x + w / 2, y + h / 2])]
    if ty == 'stamp':
        x, y = e['xy']; s = e['size']; w = len(e['text']) * s * .7 + s
        return [(e['text'], True, e['t'], [x - w / 2, y - s * .8, x + w / 2, y + s * .8])]
    return []
B = [b for e in S['elements'] for b in boxes(e)]
cards = S.get('cards', [])
out = {}
t = 1.0
while t < DUR:
    if any(cd['t0'] - .1 <= t <= cd['t2'] + .1 for cd in cards): t += .1; continue
    c0, c1 = cam(t - .05), cam(t + .05)
    sp = math.hypot((c1[0] - c0[0]) * c1[2], (c1[1] - c0[1]) * c1[2]) / .1 + abs(math.log(c1[2] / c0[2])) / .1 * 900
    if sp < 40:
        for lab, istext, ts, bx in B:
            if t < ts: continue
            x0, y0 = scr(bx[:2], c1); x1, y1 = scr(bx[2:], c1)
            if x1 < 0 or x0 > 1920 or y1 < 0 or y0 > 1080: continue
            why = None
            if y1 > 830 and x1 > 0 and x0 < 1920: why = 'band'
            elif istext and (x0 < 0 or x1 > 1920 or y0 < 0): why = 'cut'
            if why: out.setdefault((lab, why), []).append(round(t, 1))
    t += .1
for (lab, why), ts in sorted(out.items(), key=lambda kv: kv[1][0]):
    print(f'{ts[0]:7.1f}…{ts[-1]:7.1f} ({len(ts):3d})  {why:4s}  {lab}')
print('done', len(out), 'problems')
