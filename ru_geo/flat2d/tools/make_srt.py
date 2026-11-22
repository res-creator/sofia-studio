#!/usr/bin/env python3
"""python3 tools/make_srt.py <папка_фильма> -> <папка>/<имя>.srt из film.json"""
import json, sys, os
J = sys.argv[1]; film = json.load(open(f'{J}/film.json', encoding='utf8')); name = sys.argv[2] if len(sys.argv) > 2 else os.path.basename(os.path.abspath(J))
ts = lambda t: f'{int(t//3600):02}:{int(t%3600//60):02}:{int(t%60):02},{int(round((t%1)*1000)):03}'
n = 0; out = []
for s in film['segs']:
    if s['kind'] != 'voice': continue
    for a, b, c in s['captions']: n += 1; out.append(f'{n}\n{ts(a)} --> {ts(max(b, a + 0.4))}\n{c}\n')
open(f'{J}/{name}.srt', 'w', encoding='utf8').write('\n'.join(out)); print(n, 'cues')
