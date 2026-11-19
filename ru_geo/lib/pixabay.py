# Pixabay API: поиск и скачивание видео/фото. Ключ только из переменной окружения PIXABAY_API_KEY (в код и логи не пишем).
# Лицензия Pixabay Content License: можно коммерчески, без подписи (подпись автора всё равно даём в CREDITS).
# Важно: нужен «браузерный» User-Agent (с дефолтным UA Python сервер отвечает 403).
import json, os, subprocess, time, urllib.parse
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'pixabay'); os.makedirs(CACHE, exist_ok=True)

def _get(url):
    for k in range(5):
        r = subprocess.run(['curl', '-sS', '-A', UA, '--max-time', '60', url], capture_output=True, text=True)
        if r.returncode == 0 and r.stdout.startswith('{'): return json.loads(r.stdout)
        time.sleep(3 * (k + 1))
    raise RuntimeError('pixabay request failed')

def search(q, video=True, n=50, **kw):
    f = os.path.join(CACHE, ('v_' if video else 'p_') + urllib.parse.quote(q, safe='') + '.json')
    if os.path.exists(f): return json.load(open(f))
    p = dict(q=q, per_page=n, safesearch='true', **kw)
    url = ('https://pixabay.com/api/videos/?' if video else 'https://pixabay.com/api/?') + 'key=' + os.environ['PIXABAY_API_KEY'] + '&' + urllib.parse.urlencode(p)
    hits = _get(url).get('hits', []); json.dump(hits, open(f, 'w')); time.sleep(0.7)
    return hits

def download(url, path):
    if os.path.exists(path) and os.path.getsize(path) > 20000: return True
    os.makedirs(os.path.dirname(path), exist_ok=True)
    r = subprocess.run(['curl', '-sS', '-L', '-A', UA, '--max-time', '900', '-o', path, '-w', '%{http_code}', url], capture_output=True, text=True)
    return r.stdout.strip() == '200'

def best_video(hit, maxw=1920):
    vs = [v for v in hit['videos'].values() if v.get('url')]
    ok = [v for v in vs if v['width'] <= maxw]
    return max(ok, key=lambda v: v['width']) if ok else min(vs, key=lambda v: v['width'])
