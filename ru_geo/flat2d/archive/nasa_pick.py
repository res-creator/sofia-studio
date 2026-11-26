#!/usr/bin/env python3
"""python3 archive/nasa_pick.py <slug>: для ключей photos.json без файла ищет изображение в NASA Image Library (общественное достояние)."""
import json, os, re, sys, time, urllib.parse, urllib.request
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); slug = sys.argv[1]; J = f'{R}/{slug}'
P = json.load(open(f'{J}/photos.json', encoding='utf8')); os.makedirs(f'{J}/archive/img', exist_ok=True)
cp = f'{J}/archive/credits.json'; cr = json.load(open(cp, encoding='utf8')) if os.path.exists(cp) else {}
def get(u):
    for a in range(5):
        try: return urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read()
        except Exception: time.sleep(5 + 5 * a)
    return None
for key, spec in P.items():
    if key.startswith('_') or key == 'reuse': continue
    if key in cr and os.path.exists(f"{J}/archive/img/{cr[key]['file']}"): continue
    done = False
    for q in spec.get('q', []):
        raw = get('https://images-api.nasa.gov/search?media_type=image&q=' + urllib.parse.quote(q))
        if not raw: continue
        items = json.loads(raw)['collection']['items']
        qw = {w for w in re.findall(r'[a-z0-9]{3,}', q.lower())}
        for it in items[:10]:
            dd = it['data'][0]; txt = (dd.get('title', '') + ' ' + dd.get('description', '')[:300]).lower()
            if len(qw & set(re.findall(r'[a-z0-9]{3,}', txt))) / max(1, len(qw)) < 0.5: continue
            ar = get(dd['nasa_id'] and 'https://images-api.nasa.gov/asset/' + urllib.parse.quote(dd['nasa_id']))
            if not ar: continue
            urls = [x['href'] for x in json.loads(ar)['collection']['items'] if x['href'].lower().endswith(('.jpg', '.jpeg'))]
            pref = [u for u in urls if '~large' in u] or [u for u in urls if '~medium' in u] or [u for u in urls if '~orig' in u] or urls
            if not pref: continue
            img = get(pref[0].replace(' ', '%20'))
            if not img or len(img) < 60000: continue
            fn = f'{key}.jpg'; open(f'{J}/archive/img/{fn}', 'wb').write(img)
            cr[key] = dict(file=fn, author='NASA', license='общественное достояние', cap=spec.get('cap', ''), page='https://images.nasa.gov/details/' + dd['nasa_id'], title=dd.get('title', ''))
            json.dump(cr, open(cp, 'w'), ensure_ascii=False, indent=1); print('ok', key, '<-', dd.get('title', '')[:60], flush=True); done = True; break
        if done: break
        time.sleep(1)
    if not done: print('нет', key, flush=True)
