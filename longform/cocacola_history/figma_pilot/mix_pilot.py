# Sound for the Figma pilot: the existing chapter-3 voice (no new TTS), SFX from the long-form kit (kit/sfx.py) cued to the pilot's shots,
# and the film's own synthesized music (the ragtime/build bars from assemble.py), ducked under the voice; mastered to -14 LUFS by master.sh.
# Usage: python3 mix_pilot.py   (needs pilot T + shot times: node pilot.js T)
import json, os, subprocess, sys, wave, numpy as np
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(D)
sys.path.insert(0, os.path.join(ROOT, '..', 'kit')); import sfx
SR = sfx.SR; OFF = 2.7
info = json.loads(subprocess.run(['node', '-e', "const p=require('./pilot.js');console.log(JSON.stringify({T:p.T,S:p.S,w:{idea:p.at('b1','idea'),bottles:p.at('b1','bottles'),impressed:p.at('b2','impressed'),fountain:p.at('b2','fountain'),fine:p.at('b2','fine'),rights:p.at('b3','rights'),united:p.at('b3','united'),dollar:p.at('b3','dollar'),never:p.at('b3','never'),y1899:p.at('b1','1899')}}))"], cwd=D, capture_output=True, text=True, check=True).stdout)
T, S, w = info['T'], info['S'], info['w']; N = int(round(T * SR))
# voice: the chapter's own voice stem, same timing
def rd(p): x = wave.open(p); a = np.frombuffer(x.readframes(x.getnframes()), np.int16).astype(float) / 32768; x.close(); return a
vo = rd(f'{ROOT}/chapters/c3_bottles/vo.wav')[int(OFF * SR):int(OFF * SR) + N]; vo = np.pad(vo, (0, N - len(vo)))
CUES = [('ding', 0.0, 0.8), ('stamp', w['y1899'], 0.5), ('whoosh', S['lawyers'] - 0.05, 0.6), ('pop', S['lawyers'] + 0.2, 0.6), ('steps', S['lawyers'] + 1.6, 0.5), ('sparkle', w['idea'], 0.7),
        ('boing', w['bottles'], 0.5), ('sparkle', w['bottles'] + 0.1, 0.6), ('puff', w['impressed'] + 0.15, 0.6), ('whoosh', S['messy'] - 0.05, 0.6), ('fizz', S['messy'] + 0.02, 1.4), ('splash', S['messy'] + 0.1, 0.9),
        ('slidedown', S['messy'] + 0.3, 0.5), ('splash', S['messy'] + 0.6, 0.6), ('glassclink', S['fountain'] + 0.5, 0.8), ('sparkle', w['fountain'], 0.5), ('flip', S['fine'], 0.3), ('slideup', w['fine'] - 0.1, 0.35), ('boing', w['fine'] + 0.05, 0.35),
        ('whoosh', S['contract'] - 0.05, 0.6), ('paper', S['contract'] + 0.25, 0.8), ('scratch', w['rights'], 0.9), ('scratch', w['rights'] + 0.6, 0.8), ('sparkle', w['united'], 0.6), ('flutter', w['dollar'] - 1.0, 0.8),
        ('flutter', w['dollar'] - 0.5, 0.8), ('kaching', w['dollar'], 0.9), ('crowdcheer', w['dollar'] + 0.15, 0.4), ('rumble2', S['drawer'], 0.4), ('tick', S['drawer'] + 0.6, 0.6), ('tick', S['drawer'] + 1.0, 0.6),
        ('tick', S['drawer'] + 1.4, 0.6), ('tick', S['drawer'] + 1.8, 0.6), ('drumroll', w['never'] - 0.3, 0.3), ('bell', S['empire'] + 0.05, 0.8), ('whoosh', S['empire'] - 0.1, 0.7), ('factory', S['empire'] + 0.3, 0.35)]
fx = np.zeros(N)
for name, t, g in CUES:
    x = sfx.SFX[name]() * g; s = int(t * SR)
    if 0 <= s < N: fx[s:s + len(x)] += x[: N - s]
fx *= 0.3
# music: reuse the film's bar functions (assemble.py) on one 120 BPM grid: ragtime, then 'build' on "That dollar built the empire"
src = open(f'{ROOT}/assemble.py').read(); a = src.index('def t_(d)'); b = src.index('SECTIONS = sorted')
g = {'np': np, 'sg': sfx.sg, 'SR': SR, 'N': N, 'TT': T, 'rng': np.random.default_rng(5), 'CU': {'T': T}}; exec(src[a:b], g)
tb, k = 0.0, 0
while tb < T - 0.5:
    if tb + 0.25 < S['empire']: g['ragbar'](tb, k, g=0.7)
    else: g['bar'](tb, k, prog=g['MAJ'], drums=2, arp=True, lead=True, g=0.7)
    tb += g['BAR']; k += 1
mus = g['mus']
fade = np.ones(N); fs = int((T - 0.6) * SR); fade[fs:] = np.linspace(1, 0, N - fs)
duck = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(4410) / 4410, 'same'); dk = np.clip(duck * 3, 0, 1)
out = np.tanh((vo + fx * (1 - 0.6 * dk) + mus * 0.12 * (1 - 0.7 * dk)) * fade * 1.1) * 0.9
x = wave.open(f'{D}/_mix.wav', 'wb'); x.setnchannels(1); x.setsampwidth(2); x.setframerate(SR); x.writeframes((out * 32767).astype(np.int16).tobytes()); x.close(); print('mix ok', T)
