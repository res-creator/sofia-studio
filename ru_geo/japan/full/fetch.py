# Скачивает 4K-оригиналы Pixabay для всех кадров и сразу вырезает нужный кусок (экономим диск). Ключ — только из PIXABAY_API_KEY.
import json, os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor
D = os.path.dirname(os.path.abspath(__file__)); RG = os.path.join(D, '..', '..')
sys.path.insert(0, os.path.join(RG, 'lib')); import pixabay
from plan import build
SEG = os.path.join(RG, 'data', 'pixabay', 'seg'); os.makedirs(SEG, exist_ok=True)
META = f'{D}/sources.json'; meta = json.load(open(META)) if os.path.exists(META) else {}
P = build(); need = {}
for s in P['segs']:
    if s.get('img'): continue
    k = (s['id'], s['ss']); need[k] = max(need.get(k, 0), s['dur'])
def info(i):
    if str(i) in meta: return meta[str(i)]
    hit = pixabay._get(f'https://pixabay.com/api/videos/?key={os.environ["PIXABAY_API_KEY"]}&id={i}')['hits'][0]
    v = pixabay.best_video(hit, maxw=3840)
    meta[str(i)] = dict(url=v['url'], w=v['width'], h=v['height'], dur=hit['duration'], author=hit['user'], page=hit['pageURL'], license='Pixabay Content License')
    time.sleep(0.7); return meta[str(i)]
for (i, ss) in need: info(i)
json.dump(meta, open(META, 'w'), ensure_ascii=False, indent=0)
def one(k):
    i, ss = k; out = f'{SEG}/{i}_{ss}.mp4'
    if os.path.exists(out) and os.path.getsize(out) > 20000: return f'{i} ok'
    tmp = f'{SEG}/_{i}_{ss}.src.mp4'
    if not pixabay.download(meta[str(i)]['url'], tmp): return f'{i} DOWNLOAD FAIL'
    length = need[k] * 1.1 + 1.0           # небольшой запас по длине
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(ss), '-i', tmp, '-t', f'{length:.2f}', '-an', '-c:v', 'libx264', '-preset', 'fast',
                        '-crf', '19', '-pix_fmt', 'yuv420p', out], capture_output=True, text=True)
    os.remove(tmp)
    return f'{i} {"cut" if r.returncode == 0 else "CUT FAIL " + r.stderr[-200:]}'
with ThreadPoolExecutor(3) as ex:
    for msg in ex.map(one, list(need)): print(msg, flush=True)
