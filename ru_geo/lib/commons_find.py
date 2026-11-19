# Поиск фото на Wikimedia Commons через HTML MediaSearch (API часто 429) + превью с thumb.wikimedia.org (путь по md5 имени файла).
import hashlib, html, json, os, re, subprocess, time, urllib.parse
UA = 'SofiaStudioResearch/1.0 (https://github.com/res-creator/sofia-studio)'
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'commons_find'); os.makedirs(CACHE, exist_ok=True)

def thumb_url(name, w=330):
    n = name.replace(' ', '_'); h = hashlib.md5(n.encode()).hexdigest()
    q = urllib.parse.quote(n)
    ext = '.png' if n.lower().endswith(('.tif', '.tiff', '.svg', '.webp')) and not n.lower().endswith('.webp') else ''
    pre = 'lossy-page1-' if n.lower().endswith(('.tif', '.tiff')) else ''
    tn = f'{pre}{w}px-{q}' + ('.jpg' if pre else ('.png' if n.lower().endswith('.svg') else ''))
    return f'https://thumb.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/{tn}'

def search(q, n=12):
    f = os.path.join(CACHE, 's_' + urllib.parse.quote(q, safe='') + '.json')
    if os.path.exists(f): return json.load(open(f))
    url = 'https://commons.wikimedia.org/w/index.php?' + urllib.parse.urlencode(dict(search=q, title='Special:MediaSearch', type='image'))
    for k in range(5):
        r = subprocess.run(['curl', '-sS', '-A', UA, '--max-time', '60', url], capture_output=True, text=True)
        if r.returncode == 0 and 'File:' in r.stdout: break
        time.sleep(30 * (k + 1))
    names = []
    for m in re.findall(r'File:([^"&<\\]{3,200}\.(?:jpe?g|png|tiff?|webp))', r.stdout, re.I):
        nm = html.unescape(urllib.parse.unquote(m)).replace('_', ' ')
        if nm not in names: names.append(nm)
    names = names[:n]; json.dump(names, open(f, 'w'), ensure_ascii=False); time.sleep(5)
    return names
