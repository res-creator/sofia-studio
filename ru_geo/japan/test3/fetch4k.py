# Скачивает оригиналы Pixabay в максимальном качестве (4K, если есть) по id. Ключ только из PIXABAY_API_KEY.
import json, os, subprocess, sys, time
D = os.path.dirname(os.path.abspath(__file__)); RG = os.path.join(D, '..', '..')
sys.path.insert(0, os.path.join(RG, 'lib')); import pixabay
from script import LINES
OUT = os.path.join(RG, 'data', 'pixabay', 'v4k'); os.makedirs(OUT, exist_ok=True)
META = f'{D}/sources.json'; meta = json.load(open(META)) if os.path.exists(META) else {}
for l in LINES:
    for i, *_ in l['shots']:
        p = f'{OUT}/{i}.mp4'
        if str(i) not in meta:
            hit = pixabay._get(f'https://pixabay.com/api/videos/?key={os.environ["PIXABAY_API_KEY"]}&id={i}')['hits'][0]
            v = pixabay.best_video(hit, maxw=3840)
            meta[str(i)] = dict(url=v['url'], w=v['width'], h=v['height'], author=hit['user'], page=hit['pageURL'], license='Pixabay Content License')
            json.dump(meta, open(META, 'w'), ensure_ascii=False, indent=0); time.sleep(0.7)
        ok = pixabay.download(meta[str(i)]['url'], p)
        print(i, meta[str(i)]['w'], 'x', meta[str(i)]['h'], 'ok' if ok else 'FAIL', flush=True)
