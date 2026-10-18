# Mixes voiceover + sfx + drone into mix.wav using timeline.json word times.
import json, subprocess, os, re
D = os.path.dirname(os.path.abspath(__file__)); TL = json.load(open(f'{D}/timeline.json'))
def at(i, rx=None):
    L = next(l for l in TL['lines'] if l['id'] == i)
    if rx:
        for w in L['words']:
            if re.search(rx, w['w']): return w['t0']
    return L['t0']
sc = {s['id']: s for s in TL['scenes']}
ev = []  # (file, start, volume)
for L in TL['lines']: ev.append((f"vo/{L['id']}.mp3", L['t0'], 1.0))
ev += [('sfx/waves.mp3', 0, 0.45), ('sfx/horn.mp3', 1.2, 0.5), ('sfx/buzz.mp3', at('l02', 'buzzes') - 0.1, 0.55),
       ('sfx/pa.mp3', at('l03', 'stops') - 0.4, 0.6), ('sfx/boom.mp3', at('l03', 'mid'), 0.6),
       ('sfx/groan.mp3', sc['deck']['t0'] + 0.3, 0.5), ('sfx/boom.mp3', at('l04', 'coming'), 0.45),
       ('sfx/cart.mp3', at('l09') + 0.3, 0.55), ('sfx/bang.mp3', at('l09', 'wait') + 0.8, 0.85),
       ('sfx/engine.mp3', at('l10', 'engines') - 0.4, 0.8), ('sfx/boom.mp3', at('l11'), 0.6), ('sfx/boom.mp3', TL['lines'][-1]['t1'] + 0.4, 0.7)]
for s in TL['scenes'][1:]: ev.append(('sfx/whoosh.mp3', s['t0'] - 0.25, 0.35))
for i, rx in [('l01', 'Day'), ('l01', 'Three'), ('l01', 'Seven'), ('l05', 'Rule'), ('l06', 'galley'), ('l07', 'Food'), ('l07', 'Water'), ('l07', 'steel'), ('l08', 'Rule'), ('l10', 'Day')]:
    ev.append(('sfx/pop.mp3', at(i, rx), 0.5))
T = TL['T']
args = ['ffmpeg', '-y', '-v', 'error']
for f, _, _ in ev: args += ['-i', f'{D}/{f}']
args += ['-stream_loop', '-1', '-i', f'{D}/sfx/drone.mp3']
fl = []
for k, (f, st, v) in enumerate(ev):
    ms = max(0, int(st * 1000)); fl.append(f'[{k}:a]aresample=44100,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[a{k}]')
n = len(ev); fl.append(f'[{n}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0,volume=0.32,afade=t=in:d=2,afade=t=out:st={T-2.5}:d=2.5[dr]')
fl.append(''.join(f'[a{k}]' for k in range(n)) + f'[dr]amix=inputs={n+1}:normalize=0:duration=longest,atrim=0:{T},alimiter=limit=0.9[out]')
args += ['-filter_complex', ';'.join(fl), '-map', '[out]', '-t', str(T), f'{D}/mix.wav']
subprocess.run(args, check=True); print('mix ok', round(T, 2))
