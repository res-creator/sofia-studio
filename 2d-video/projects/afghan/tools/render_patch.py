# Частичный перерендер: отрезки затронутых шотов (aff.json: [[i, id, start, end, why]]) → build/patch/pNN.mp4 + segs.json
#   python3 tools/render_patch.py aff.json
import json, math, os, subprocess, sys
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); R = os.path.join(P, '..', '..'); B = os.path.join(P, 'build', 'patch'); os.makedirs(B, exist_ok=True)
FPS = 24; S = json.load(open(os.path.join(P, 'story/shots.json')))['shots']; aff = json.load(open(sys.argv[1]))
seg = []
for i, _, a, b, _ in aff:
    if i + 1 < len(S) and S[i + 1].get('in'): b = S[i + 1]['start'] + 0.55      # переход следующего шота смешивает этот
    f0, f1 = math.floor(a * FPS), math.ceil(b * FPS)
    if seg and f0 - seg[-1][1] < 4 * FPS: seg[-1][1] = max(seg[-1][1], f1)
    else: seg.append([f0, f1])
json.dump(seg, open(os.path.join(B, 'segs.json'), 'w')); print(len(seg), 'segments', sum(b - a for a, b in seg) / FPS, 's', flush=True)
env = dict(os.environ, PW_CHROMIUM='/opt/pw-browsers/chromium')
for k, (f0, f1) in enumerate(seg):
    out = os.path.join(B, f'p{k:02d}.mp4')
    if os.path.exists(out): continue
    subprocess.run(['node', 'render.mjs', '--project', 'projects/afghan', '--from', f'{f0 / FPS:.6f}', '--to', f'{f1 / FPS:.6f}', '--workers', '4', '--format', 'jpeg', '--crf', '17', '--preset', 'veryfast', '--out', out + '.tmp.mp4'],
                   cwd=os.path.abspath(R), env=env, check=True, stdout=subprocess.DEVNULL)
    os.rename(out + '.tmp.mp4', out); print('seg', k, f0, f1, flush=True)
print('PATCH_DONE', flush=True)
