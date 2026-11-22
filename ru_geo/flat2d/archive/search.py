#!/usr/bin/env python3
"""python3 search.py <фильм> : ищет на Wikimedia Commons свободные фото по темам, сохраняет миниатюры cand/<фильм>/ и cand_<фильм>.json (лицензия, автор, ссылка)."""
import html, json, os, re, sys, time, urllib.parse, urllib.request
UA = {'User-Agent': 'Mozilla/5.0 (documentary research script; non-commercial research)'}
FREE = re.compile(r'public domain|pd[- ]|cc0|cc by(?!-nc)|cc-by(?!-nc)|attribution|no restrictions', re.I)
Q = {
 'chernobyl': {
  'town86': 'Pripyat 1986 city street', 'town_wheel': 'Pripyat ferris wheel amusement park', 'blocks': 'Pripyat apartment buildings', 'pool': 'Pripyat Azure swimming pool',
  'plant86': 'Chernobyl nuclear power plant 1986 reactor 4 damaged', 'plant_before': 'Chernobyl nuclear power plant before accident', 'sarc': 'Chernobyl sarcophagus shelter object',
  'trucks': 'Chernobyl firefighters monument', 'evac': 'Pripyat evacuation buses 1986', 'buses': 'Pripyat abandoned buses', 'liquid': 'Chernobyl liquidators 1986',
  'forsmark': 'Forsmark nuclear power plant', 'arch': 'Chernobyl New Safe Confinement', 'flat': 'Pripyat abandoned apartment', 'school': 'Pripyat school classroom', 'sign': 'Chernobyl exclusion zone sign',
  'slav': 'Slavutych city', 'map': 'Chernobyl fallout map', 'moscow6': 'Clinical Hospital No. 6 Moscow', 'kiev': 'Kyiv Khreshchatyk 1980s', 'milk': 'Chernobyl contaminated milk 1986'},
 'titanic': {
  'leave': 'Titanic leaving Southampton 1912', 'queens': 'Titanic Queenstown tender 1912', 'cabin3': 'Titanic third class cabin', 'dine3': 'Titanic third class dining room', 'gen3': 'Titanic third class general room',
  'bath': 'Titanic third class bathroom', 'promen': 'Titanic third class promenade deck', 'boatdeck': 'Titanic boat deck lifeboats', 'iceberg': 'iceberg photographed near Titanic 1912', 'collD': 'Titanic collapsible lifeboat D',
  'carp': 'RMS Carpathia', 'carp_boats': 'Titanic survivors lifeboat Carpathia', 'rostron': 'Arthur Rostron Carpathia captain', 'ny': 'Carpathia arrives New York 1912 crowd', 'news': 'Titanic newspaper headline 1912',
  'senate': 'Titanic Senate inquiry 1912', 'cal': 'SS Californian', 'wireless': 'Titanic Marconi wireless room', 'dean': 'Millvina Dean', 'sinking': 'Titanic sinking illustration 1912', 'class3': 'Titanic emigrants third class passengers', 'plan': 'Titanic deck plan'}}
def api(**p):
    p['format'] = 'json'; u = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(p)
    for a in range(8):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40))
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            time.sleep(10 + 10 * a)
    raise SystemExit('429')
film = sys.argv[1]; os.makedirs(f'cand/{film}', exist_ok=True); out = {}
for key, q in Q[film].items():
    time.sleep(4); r = api(action='query', generator='search', gsrsearch=q + ' filetype:bitmap', gsrnamespace=6, gsrlimit=10, prop='imageinfo', iiprop='url|size|extmetadata', iiurlwidth=640)
    res = []
    for pg in (r.get('query', {}).get('pages', {}) or {}).values():
        ii = (pg.get('imageinfo') or [{}])[0]; m = ii.get('extmetadata', {}); g = lambda k: re.sub(r'\s+', ' ', re.sub('<[^>]+>', ' ', html.unescape(m.get(k, {}).get('value', '')))).strip()
        lic = g('LicenseShortName')
        if not FREE.search(lic) or (ii.get('width') or 0) < 900: continue
        res.append(dict(title=pg['title'], w=ii.get('width'), h=ii.get('height'), license=lic, author=g('Artist')[:90], date=g('DateTimeOriginal')[:30] or g('DateTime')[:30], desc=g('ImageDescription')[:110], thumb=ii.get('thumburl'), page=ii.get('descriptionurl'), url=ii.get('url')))
    out[key] = res; print(key, len(res), flush=True)
json.dump(out, open(f'cand_{film}.json', 'w'), ensure_ascii=False, indent=1)
