# Sound for the puppet test: existing chapter-3 voice (b2), kit SFX on the acting beats, the film's ragtime bars; master -14 LUFS.
import json, os, subprocess, sys, wave, numpy as np
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(D); sys.path.insert(0, os.path.join(ROOT, '..', 'kit')); import sfx
SR = sfx.SR; OFF, T = 14.2, 10.0; N = int(T * SR)
w = json.loads(subprocess.run(['node', '-e', "const p=require('./puppet.js');console.log(JSON.stringify(Object.fromEntries(['impressed','messy','soda','but','fine'].map(x=>[x,p.at(x)]))))"], cwd=D, capture_output=True, text=True, check=True).stdout)
x = wave.open(f'{ROOT}/chapters/c3_bottles/vo.wav'); vo = np.frombuffer(x.readframes(x.getnframes()), np.int16).astype(float) / 32768; x.close()
vo = vo[int(OFF * SR):int(OFF * SR) + N]
fx = np.zeros(N)
for name, t, g in [('puff', w['impressed'] + 0.1, 0.5), ('tap', w['messy'] - 0.3, 0.5), ('tap', w['messy'] + 0.1, 0.5), ('sparkle', w['soda'], 0.5), ('boop', w['but'] + 0.1, 0.4), ('slideup', w['fine'] - 0.15, 0.4), ('boing', w['fine'] + 0.05, 0.35)]:
    s = sfx.SFX[name]() * g; i = int(t * SR); fx[i:i + len(s)] += s[: N - i]
fx *= 0.3
src = open(f'{ROOT}/assemble.py').read(); g = {'np': np, 'sg': sfx.sg, 'SR': SR, 'N': N, 'TT': T, 'rng': np.random.default_rng(5), 'CU': {'T': T}}
exec(src[src.index('def t_(d)'):src.index('SECTIONS = sorted')], g)
tb, k = 0.0, 0
while tb < T - 0.5: g['ragbar'](tb, k, g=0.7); tb += g['BAR']; k += 1
fade = np.ones(N); fade[-int(0.5 * SR):] = np.linspace(1, 0, int(0.5 * SR))
dk = np.clip(np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(4410) / 4410, 'same') * 3, 0, 1)
out = np.tanh((vo + fx * (1 - 0.6 * dk) + g['mus'] * 0.12 * (1 - 0.7 * dk)) * fade * 1.1) * 0.9
x = wave.open(f'{D}/_mix.wav', 'wb'); x.setnchannels(1); x.setsampwidth(2); x.setframerate(SR); x.writeframes((out * 32767).astype(np.int16).tobytes()); x.close(); print('mix ok')
