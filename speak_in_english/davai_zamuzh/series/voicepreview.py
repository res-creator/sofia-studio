# Equal-loudness line files (series/voice/norm/*.wav: -16 LUFS voiced, soft lines -21) + voice-only episode previews (MP4).
import os, sys, json, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE); sys.path.insert(0, os.path.dirname(HERE))
import loud, mkvideo
src = open('../prep.py').read(); src = src[:src.index('# ---------- timeline ----------')]; G = {'__name__': 'prep_lib'}; exec(compile(src, 'prep.py', 'exec'), G)
load, SR, LN = G['load'], G['SR'], G['LN']; LT, SOFT = G['LINE_LUFS'], G['SOFT_DB']
os.makedirs('voice/norm', exist_ok=True); T = json.load(open('out/lengths.json')); rep = {}
for k, (who, text, st) in LN.items():
    a = load(k); tg = LT + (SOFT if st == 'w' else 0.)
    for _ in range(3): a = loud.limit(loud.to_lufs(a, SR, tg), SR, ceil_db=-7.0, w=.004, release=.03)
    a = loud.to_lufs(a, SR, tg); sf.write(f'voice/norm/{k}.wav', a, SR); rep[k] = round(loud.voiced_lufs(a, SR), 2)
n = [v for k, v in rep.items() if LN[k][2] != 'w']; s = [v for k, v in rep.items() if LN[k][2] == 'w']
print('normal lines', len(n), min(n), max(n), '| soft', s); json.dump(rep, open('out/line_lufs.json', 'w'), indent=0)
for ep in ('1', '2', '3'):
    E = T[ep]; out = np.zeros(int((E['total'] + 1) * SR))
    for k, who, at, d, txt in E['lines']:
        a = sf.read(f'voice/norm/{k}.wav')[0]
        if k == 'B17': a = a[:int((d - .5) * SR)]
        i = int(at * SR); out[i:i + len(a)] += a[:len(out) - i]
    out = out * 10 ** (3.5 / 20); pk = np.abs(out).max(); out = out / pk * .85 if pk > .85 else out   # listening level only
    sf.write(f'out/voice_ep{ep}.wav', out, SR)
    print(ep, mkvideo.build([(f'cards/card0{int(ep) - 1}.png', out)], f'voice_preview_ep{ep}.mp4'))
