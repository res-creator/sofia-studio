#!/usr/bin/env python3
"""python3 review_pack.py <slug> -> scratchpad/review_<slug>/ (README.md + pNN.jpg листы кадров по абзацам)"""
import json, os, subprocess, sys
from PIL import Image
slug = sys.argv[1]; J = f'/home/user/sofia-studio/ru_geo/{slug}'; S = '/tmp/claude-0/-home-user-sofia-studio/24c15af6-1f18-59ef-a680-971b83cb24ee/scratchpad'; P = f'{S}/review_{slug}'; os.makedirs(P, exist_ok=True)
for f in os.listdir(P): os.remove(f'{P}/{f}')
film = json.load(open(J + '/film.json')); segs = [s for s in film['segs'] if s['kind'] == 'voice']; V = f'{J}/video/{slug}_share.mp4'
out = [f'# Пакет для проверки: {slug}', 'Для каждого абзаца: озвученный текст и лист кадров pNN.jpg (кадры абзаца слева направо, сверху вниз).', '']
for i, s in enumerate(segs):
    a = s['t']; b = a + s['dur']; n = max(2, min(6, int((b - a) / 3) + 1)); ts = [a + (b - a) * (k + 0.5) / n for k in range(n)]; ims = []
    for t in ts:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.2f}', '-i', V, '-frames:v', '1', '-vf', 'scale=480:-1', '/tmp/_f.jpg'], check=True); ims.append(Image.open('/tmp/_f.jpg').copy())
    cols = 3; rows = (len(ims) + cols - 1) // cols; sh = Image.new('RGB', (480 * cols, 270 * rows))
    for k, im in enumerate(ims): sh.paste(im, ((k % cols) * 480, (k // cols) * 270))
    sh.save(f'{P}/p{i+1:02d}.jpg', quality=80); out.append(f'## Абзац {i+1} ({a:.0f}-{b:.0f} с), лист p{i+1:02d}.jpg ({n} кадров)\nТЕКСТ: {s["text"]}\n')
open(P + '/README.md', 'w').write('\n'.join(out)); print(len(segs), P)
