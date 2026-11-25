# «Давай замуж!» series v5: voiced timelines + mixes for the three standalone episodes.
# Reuses prep.py (line processing, equal loudness in the mastered mix, music bed, master -15 LUFS / TP <= -1.5 dBTP).
# python3 series/prep_s.py [1 2 3] -> series/timeline_ep{N}.json, series/out/audio_ep{N}.wav, series/out/loudness_ep{N}.json
import os, sys, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE); sys.path.insert(0, os.path.dirname(HERE))
src = open('../prep.py').read()
lib = src[:src.index('# ---------- timeline ----------')]
head = src[src.index('def build(part):'):src.index('    if part == 1:')]
tail = src[src.index('    TOTAL = round(t, 3)'):src.index('build(1); build(2)')]
a, b = tail.index('    if part == 1:'), tail.index('    off(TOTAL - 1.8')
tail = tail[:a] + '    SER_OFF(off, EV, L, part)\n' + tail[b:]
head = head.replace("if k == 'r3':", "if k == BLEEP_ID:").replace("if k in ('s3', 's5', 's6', 's9', 's11'):", "if k in ASTRO_IDS:").replace("def build(part):", "def build_ep(part, SEQ):")
body = '''    for it in SEQ:
        if isinstance(it, str): say(it, GAP); continue
        name, d, fx = it; EV[name] = round(t, 3) if name not in EV else EV[name]
        for f in fx: f(t)
        wait(d)
    t -= GAP
'''
G = {'__name__': 'prep_series'}; exec(compile(lib, 'prep.py', 'exec'), G)
G['STOCK']['meow'] = sf.read('sfx/clean/meow.wav')[0]
G['BLEEP_ID'] = 'B17'; G['ASTRO_IDS'] = ('A7', 'A20', 'C10', 'C24', 'C16'); G['GAP'] = .25
exec(compile(head + body + tail, 'prep_s', 'exec'), G)
clip, crowd, applause, whistle, paper, slap, beep_loop, tone, whoosh = (G[k] for k in ('clip', 'crowd', 'applause', 'whistle', 'paper', 'slap', 'beep_loop', 'tone', 'whoosh'))
# the episode sequences: line ids, or (EVENT, duration, [sfx(t) ...]) beats (laugh / applause / visual gag); the only silent beat is BEAT before «Угу»
P = {}
def S(kind, d, v=.5, n=7, at=0.):
    return lambda t: P['put'](t + at, crowd(kind, n, v, d), 'crowd')
def AP(d, v=.45, at=0.): return lambda t: P['put'](t + at, applause(d, v), 'crowd')
def FX(name, d=None, v=.5, at=0., bus='fx'): return lambda t: P['put'](t + at, clip(name, d, v), bus)
EP = {1: ['A1', 'A2', 'A3', 'A4', ('LAUGH1', .9, [S('laugh', 2.0, .5), AP(1.8, .4)]), 'A5', ('CARD', 0., [lambda t: P['put'](t, whoosh(.3, .1))]), 'A6', ('OOH1', .6, [S('aww', 1.4, .45)]), 'A7', 'A8',
          'A9', ('JUMP', .3, [AP(2.2, .45), lambda t: P['put'](t, whoosh(.3, .12))]), 'A10', 'A11', ('LAUGH2', .6, [S('laugh', 1.6, .5, 5)]), 'A12', 'A13', 'A14',
          ('LAMP', .5, [lambda t: P['put'](t, tone(60, .5, .3))]), 'A15', 'A16', ('LAUGH3', .6, [S('laugh', 1.8, .5, 6)]), ('INTERRO_END', 0., []),
          ('DETECT', 2.2, [FX('beep', .9, .35), FX('phone', 1.2, .3, .9), S('ooh', 1.6, .5, at=.5)]), 'A17', 'A18', 'A19', 'A20', 'A21', 'A22', ('LAUGH4', .6, [S('laugh', 1.6, .5, 6)]), 'A23',
          ('CATWALK', 0., []), 'A24', ('CATIN', 1.6, [FX('aww', 1.3, .45, bus='crowd'), AP(2.4, .5, .3)]), 'A25'],
      2: [('SHOUT', 0., []), 'B1', 'B2', 'B3', ('GIVE', 0., []), 'B4', ('LAUGH1', .6, [S('laugh', 1.6, .5, 6)]), 'B5', 'B6', 'B7', 'B8', ('BOO', .6, [S('boo', 1.5, .45)]), 'B9', 'B10', ('LEAVE', 0., []),
          'B11', ('ENTER_R', 0., [AP(2.2, .45), lambda t: P['put'](t, whoosh(.3, .12))]), 'B12', ('OOH_W', .7, [S('ooh', 1.4, .5), lambda t: P['put'](t + .2, whistle(.35), 'crowd')]), 'B13', 'B14', 'B15',
          ('LAUGH2', .5, [S('laugh', 1.4, .5, 5)]), 'B16', ('NEWS', 2.0, [FX('phone', 1.0, .4), FX('news_sting', 2.6, .4, .5, 'crowd')]), 'B17', 'B18', 'B19', ('LAUGH3', .8, [S('laugh', 2.0, .55)]), 'B20', 'B21',
          ('TURBAN', 1.4, [S('ooh', 1.6, .5)]), 'B22', 'B23', 'B24', 'B25', ('LAUGH4', .6, [S('laugh', 1.6, .5, 6)]), 'B26', 'B27', 'B28', ('APPLAUSE', 1.2, [AP(2.4, .5)])],
      3: ['C1', 'C2', ('REWIND', 1.0, [lambda t: P['put'](t, whoosh(.9, .2))]), 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', ('BOO', .5, [S('boo', 1.3, .45)]), 'C9', 'C10', 'C11', 'C12', 'C13',
          ('BEAT', .5, []), 'C14', ('LAUGH1', 1.2, [S('laugh', 2.2, .6), AP(2.2, .45)]), 'C15', 'C16', 'C17', ('LAUGH2', .7, [S('laugh', 1.8, .55)]), 'C18', ('OOH', .5, [S('ooh', 1.3, .5)]), 'C19', 'C20', 'C21',
          ('PAPER', 1.5, [lambda t: P['put'](t, paper(.45)), S('laugh', 1.6, .45, 5, .4)]), 'C22', 'C23', ('CATIN', .8, [FX('aww', 1.2, .4, bus='crowd')]), 'C24', 'C25', 'C26', ('LAUGH3', .6, [S('laugh', 1.6, .5, 6)]),
          ('MEOW', 1.4, [FX('meow', None, .55, .6)]), 'C28', ('APPL', 0., [AP(2.6, .45)]), 'C29']}
def SER_OFF(off, EV, L, part):   # music dropouts: the interrogation lamp (ep1) and the beat before «Угу» (ep3)
    if 'LAMP' in EV: off(EV['LAMP'], EV['INTERRO_END'], .3, .8)
    if 'BEAT' in EV: c14 = next(l for l in L if l['id'] == 'C14'); off(EV['BEAT'] - .3, c14['end'] + .2, .4, .8)
G['SER_OFF'] = SER_OFF
# expose put() of the running build to the sfx lambdas
orig = G['build_ep']
import types
code = G['build_ep'].__code__
for ep in [int(x) for x in sys.argv[1:]] or [1, 2, 3]:
    src2 = head.replace('def build_ep(part, SEQ):', 'def build_ep(part, SEQ):') 
    G['P'] = P
    exec(compile((head + "    P['put'] = put\n" + body + tail), 'prep_s', 'exec'), G)
    G['build_ep'](f'_ep{ep}', EP[ep])
    os.replace(f'timeline_ep{ep}.json', f'timeline_ep{ep}.json')
