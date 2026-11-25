# Series v5: voiced timeline per episode -> length check (>= 61 s, ideally 62-68 s). Reuses prep.py's per-line processing
# (trim, tempo, soft / shout / tears, equal loudness). Gaps between lines 0.25 s (rule: <= 0.5 s); reaction beats only where
# the script asks for laughter / applause / a visual gag; the single 0.5 s beat before «Угу».
import os, sys, json, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE); sys.path.insert(0, os.path.dirname(HERE))
src = open('../prep.py').read(); src = src[:src.index('# ---------- timeline ----------')]
G = {'__name__': 'prep_lib'}; exec(compile(src, 'prep.py', 'exec'), G)
load, words, SR, LN = G['load'], G['words'], G['SR'], G['LN']
GAP = .25
SEQ = {1: ['A1', 'A2', 'A3', 'A4', ('laugh+applause', .9), 'A5', 'A6', ('ooh', .6), 'A7', 'A8', 'A9', ('jump-in', .3), 'A10', 'A11', ('laugh', .6), 'A12', 'A13', 'A14', ('lamp drop', .5), 'A15', 'A16', ('laugh', .6),
           ('lie detector prints НОЛЬ + «Оооо»', 2.2), 'A17', 'A18', 'A19', 'A20', 'A21', 'A22', ('laugh', .6), 'A23', 'A24', ('cat brings money + applause', 1.6), 'A25'],
       2: ['B1', 'B2', 'B3', 'B4', ('laugh', .6), 'B5', 'B6', 'B7', 'B8', ('«Ууууу»', .6), 'B9', 'B10', 'B11', 'B12', ('«Оооо» + whistle', .7), 'B13', 'B14', 'B15', ('laugh', .5), 'B16',
           ('phone beep + chart + НОВОСТИ', 2.0), 'B17', 'B18', 'B19', ('laugh', .8), 'B20', 'B21', ('turban off: curlers + «Оооо»', 1.4), 'B22', 'B23', 'B24', 'B25', ('laugh', .6), 'B26', 'B27', 'B28', ('applause', 1.2)],
       3: ['C1', 'C2', ('rewind «ЧУТЬ РАНЬШЕ»', 1.0), 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', ('«Ууууу»', .5), 'C9', 'C10', 'C11', 'C12', 'C13', ('THE beat before «Угу»', .5), 'C14', ('laugh + applause', 1.2),
           'C15', 'C16', 'C17', ('laugh', .7), 'C18', ('«Оооо»', .5), 'C19', 'C20', 'C21', ('newspaper rises: ЖЕНАТ. СОВСЕМ.', 1.5), 'C22', 'C23', ('cat walks in', .8), 'C24', 'C25', 'C26', ('laugh', .6),
           ('cat sits, puts on her glasses: «Мяу»', 1.4), 'C28', 'C29']}
out = {}
for ep, seq in SEQ.items():
    t = 0.; L = []; beats = []
    for it in seq:
        if isinstance(it, tuple): beats.append([round(t, 2), it[0], it[1]]); t += it[1]; continue
        a = load(it); d = len(a) / SR
        if it == 'B17': W = words(it); d = min(W[1][0], W[0][1] + .12) if len(W) > 1 else .35; beats.append([round(t + d, 2), 'bleep', .5]); d += .5
        L.append([it, LN[it][0], round(t, 2), round(d, 2), LN[it][1]]); t += d + GAP
    t -= GAP; out[ep] = {'total': round(t, 2), 'lines': L, 'beats': beats, 'dialogue': round(sum(x[3] for x in L), 2)}
    print(f'episode {ep}: {t:.1f} s  (lines {len(L)}, speech {out[ep]["dialogue"]:.1f} s, reaction/visual beats {sum(b[2] for b in beats):.1f} s)')
json.dump(out, open('out/lengths.json', 'w'), ensure_ascii=False, indent=1)
