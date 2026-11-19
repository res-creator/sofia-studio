# Скачивает исходники Wikimedia Commons, которые использованы в SHOTS, в ../data/commons и ../data/commons_img.
# Фото берём с thumb.wikimedia.org (там нет жёсткого лимита), видео — 1080p/720p-версии с upload.wikimedia.org
# (Commons часто отвечает 429: скрипт ждёт и повторяет, может идти долго).
import os, re, subprocess, sys, time
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D); sys.path.insert(0, os.path.join(D, '..', 'lib'))
from media_list import MEDIA, SHOTS
import media, commons_html
UA = commons_html.UA

def get(url, path):
    for k in range(8):
        r = subprocess.run(['curl', '-sS', '-L', '-A', UA, '--max-time', '1500', '-o', path, '-w', '%{http_code}', url], capture_output=True, text=True)
        if r.stdout.strip() == '200' and os.path.getsize(path) > 50000: return True
        print('   ', r.stdout.strip(), 'wait', 45 * (k + 1), flush=True); time.sleep(45 * (k + 1))
    return False

for k in sorted({s['m'] for s in SHOTS.values() if 'm' in s}):
    m = MEDIA[k]; p = media.path(k, m)
    if m.get('source') != 'Wikimedia Commons' or (os.path.exists(p) and os.path.getsize(p) > 50000): continue
    os.makedirs(os.path.dirname(p), exist_ok=True)
    i = commons_html.info('File:' + m['page'].split('/wiki/File:')[1])
    if 'commons_img' in m['file']:
        o = i['orig'].split('?')[0]; parts = o.split('/commons/')[1]; name = parts.split('/')[-1]; w = (i['dims'] or (0, 0))[0]
        tw = 3840 if w > 4200 else (1920 if w > 1920 else 1280)
        url = f'https://thumb.wikimedia.org/wikipedia/commons/thumb/{parts}/{tw}px-{name}'
    else:
        t = i['trans']; url = next((u for q in ('1080p.vp9.webm', '720p.vp9.webm', '480p.vp9.webm') for u in t if u.endswith(q)), i['orig'])
    print(k, url[-60:], 'OK' if get(url, p) else 'FAIL', flush=True)
