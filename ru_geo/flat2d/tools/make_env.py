#!/usr/bin/env python3
"""python3 tools/make_env.py <папка_фильма>: огибающая громкости озвучки по кадрам (30 к/с) -> env.json"""
import json, subprocess, sys, numpy as np
J = sys.argv[1]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{J}/vo_clone/vo.mp3', '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout
a = np.frombuffer(raw, np.float32); n = int(len(a) / 16000 * 30); env = []
for i in range(n):
    x = a[int(i / 30 * 16000):int((i + 1) / 30 * 16000)]; env.append(float(np.sqrt((x ** 2).mean())) if len(x) else 0.0)
mx = max(env) or 1; json.dump([round(e / mx, 3) for e in env], open(f'{J}/env.json', 'w')); print(n, 'frames')
