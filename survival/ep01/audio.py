# Mixes ep01: voices + sfx + music beds into mix.wav (times from timeline.json).
import json, subprocess, os, re
D = os.path.dirname(os.path.abspath(__file__)); TL = json.load(open(f'{D}/timeline.json'))
LN = {l['id']: l for l in TL['lines']}; SC = {s['id']: s for s in TL['scenes']}
def at(i, rx=None):
    if rx:
        for w in LN[i]['words']:
            if re.search(rx, w['w']): return w['t0']
    return LN[i]['t0']
P = '../sfx/'  # sounds shared with the cruise-ship pilot
ev = [(f"vo/{l['id']}.mp3", l['t0'], 1.0) for l in TL['lines']]
for d in ['d1a', 'd2a', 'd3a', 'd4a', 'd5a']: ev += [('sfx/slam.mp3', LN[d]['t0'] - 0.8, 0.7)]
for s in TL['scenes'][1:]: ev.append(('sfx/whoosh.mp3', s['t0'] - 0.1, 0.3))
ev += [
 (P + 'drone.mp3', 0, 0.15),
 ('sfx/run.mp3', at('d1b', 'Grab') - 0.4, 0.5), (P + 'cart.mp3', at('d1a', 'war'), 0.5), ('sfx/pop.mp3', at('d1b', 'water'), 0.6), ('sfx/pop.mp3', at('d1b', 'cans'), 0.6), ('sfx/pop.mp3', at('d1b', 'batteries'), 0.6),
 (P + 'boom.mp3', at('d1b', 'Skip'), 0.35),
 ('sfx/squeak.mp3', at('d1c', 'duck'), 0.8), ('sfx/squeak.mp3', LN['d1d']['t1'] + 0.1, 0.8), ('sfx/pop.mp3', LN['d1d']['t0'] + 0.9, 0.5),
 (P + 'boom.mp3', at('d2a', 'treat') + 0.25, 0.35), (P + 'boom.mp3', at('d2a', 'treat') + 0.6, 0.35), (P + 'boom.mp3', at('d2a', 'treat') + 0.95, 0.35),
 ('sfx/knock.mp3', LN['d2a']['t1'] + 0.05, 0.8), (P + 'boom.mp3', at('d2c') + 0.5, 0.4), ('sfx/chain.mp3', at('d2d') + 1.0, 0.8),
 ('sfx/rat.mp3', at('d3a', 'Rats') - 0.1, 0.6), ('sfx/pigeon.mp3', at('d3a', 'Pigeons') - 0.1, 0.6), (P + 'drone.mp3', at('d3a', 'yes'), 0.4),
 ('sfx/hiss.mp3', at('d3c', 'violence') - 0.05, 0.9), (P + 'boom.mp3', at('d3c', 'violence') + 0.6, 0.6),
 (P + 'waves.mp3', SC['roof']['t0'], 0.25), ('sfx/pop.mp3', at('d4a', 'One'), 0.6), ('sfx/pop.mp3', at('d4a', 'ground'), 0.6), ('sfx/pop.mp3', at('d4a', 'lock'), 0.6), ('sfx/chain.mp3', at('d4a', 'lock') + 0.2, 0.5),
 (P + 'boom.mp3', at('d5a', 'bit'), 0.5), ('sfx/squeak.mp3', at('d5a', 'unicorn') + 0.6, 0.4), ('sfx/pop.mp3', at('d5b'), 0.6),
 ('sfx/knock.mp3', LN['d5c']['t0'] - 0.7, 0.9), (P + 'boom.mp3', LN['d5d']['t0'] + 1.2, 0.6), (P + 'boom.mp3', LN['d5d']['t1'] + 0.35, 0.7),
]
T = TL['T']
beds = [('sfx/music.mp3', 0.6, SC['peep']['t0'], 0.22), ('sfx/music2.mp3', SC['peep']['t0'], SC['animals']['t0'] + 0.5, 0.25), ('sfx/music.mp3', SC['animals']['t0'] + 0.5, SC['bite']['t0'], 0.22), ('sfx/music2.mp3', SC['bite']['t0'], LN['d5d']['t1'] + 0.35, 0.25)]
args = ['ffmpeg', '-y', '-v', 'error']
for f, _, _ in ev: args += ['-i', f'{D}/{f}']
for f, *_ in beds: args += ['-stream_loop', '-1', '-i', f'{D}/{f}']
fl = []
for k, (f, st, v) in enumerate(ev):
    ms = max(0, int(st * 1000)); fl.append(f'[{k}:a]aresample=44100,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[a{k}]')
n = len(ev)
for j, (f, a, b, v) in enumerate(beds):
    ms = int(a * 1000); fl.append(f'[{n+j}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:{b-a},afade=t=in:d=0.4,afade=t=out:st={b-a-0.5}:d=0.5,volume={v},adelay={ms}|{ms}[b{j}]')
fl.append(''.join(f'[a{k}]' for k in range(n)) + ''.join(f'[b{j}]' for j in range(len(beds))) + f'amix=inputs={n+len(beds)}:normalize=0:duration=longest,atrim=0:{T},alimiter=limit=0.9[out]')
args += ['-filter_complex', ';'.join(fl), '-map', '[out]', '-t', str(T), f'{D}/mix.wav']
subprocess.run(args, check=True); print('mix ok', round(T, 2))
