import json, re, sys, urllib.parse, urllib.request, html
UA = {'User-Agent': 'Mozilla/5.0 (documentary research script)'}
def api(**p):
    p['format'] = 'json'; u = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(p)
    import time
    for a in range(6):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30))
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            time.sleep(8 + 8 * a)
    raise SystemExit('429')
def search(q, n=8):
    r = api(action='query', generator='search', gsrsearch=q, gsrnamespace=6, gsrlimit=n, prop='imageinfo', iiprop='url|size|extmetadata', iiurlwidth=1280)
    out = []
    for pg in (r.get('query', {}).get('pages', {}) or {}).values():
        ii = (pg.get('imageinfo') or [{}])[0]; m = ii.get('extmetadata', {})
        lic = m.get('LicenseShortName', {}).get('value', ''); art = re.sub('<[^>]+>', '', m.get('Artist', {}).get('value', ''))[:60]
        out.append((pg['title'], ii.get('width'), ii.get('height'), lic, art, ii.get('thumburl'), ii.get('descriptionurl')))
    return out
import time
for q in sys.argv[1:]:
    time.sleep(4); print('##', q, flush=True)
    for t in search(q): print(' ', t[0], t[1], t[2], '|', t[3], '|', t[4])
