import json, sys, time, urllib.parse, urllib.request
UA = {'User-Agent': 'Mozilla/5.0 (documentary research script)'}
def get(u):
    for a in range(6):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30))
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            time.sleep(8 + 8 * a)
    raise SystemExit('429')
for t in sys.argv[1:]:
    time.sleep(3)
    r = get('https://en.wikipedia.org/w/api.php?' + urllib.parse.urlencode(dict(action='query', titles=t, prop='images', imlimit=60, format='json')))
    for pg in r['query']['pages'].values():
        names = [i['title'] for i in pg.get('images', []) if i['title'].lower().endswith(('.jpg', '.jpeg', '.png', '.tif'))]
        print('##', t, len(names)); [print('  ', n) for n in names]
