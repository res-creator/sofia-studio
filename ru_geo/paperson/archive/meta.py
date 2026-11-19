import json, re, sys, time, urllib.parse, urllib.request
UA = {'User-Agent': 'Mozilla/5.0 (documentary research script)'}
T = ["Detention center at U.S. Immigration Station Angel Island.jpg", "Poetry on the wall at the Angel Island Immigration Station (40204).jpg", "Angel Island Immigration Station - 02.jpg", "Angel island lg.jpg",
     "Chinese railroad workers in snow.jpg", "Chineseexclusionact.JPG", "Chinese exclusion article 1901.jpg", "Paperson.jpg",
     "The burning of San Francisco, April 18, 06, view from St. Francis Hotel.jpg", "San Francisco Fire Sacramento Street 1906-04-18.jpg", "San Francisco in ruin edit2.jpg", "Panorama of San Francisco disaster LCCN2007660415.jpg", "Willard Worden view from Kearny St after 1906 San Francisco earthquake and fire.jpg", "San Francisco Earthquake of 1906, People leaving the city - NARA - 522958.jpg"]
u = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(dict(action='query', titles='|'.join('File:' + t for t in T), prop='imageinfo', iiprop='url|size|extmetadata', iiurlwidth=1600, format='json'))
for a in range(6):
    try: r = json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40)); break
    except urllib.error.HTTPError as e:
        if e.code != 429: raise
        time.sleep(10 + 10 * a)
out = {}
for pg in r['query']['pages'].values():
    ii = (pg.get('imageinfo') or [{}])[0]; m = ii.get('extmetadata', {}); g = lambda k: re.sub(r'\s+', ' ', re.sub('<[^>]+>', ' ', html.unescape(m.get(k, {}).get('value', '')) if False else re.sub('<[^>]+>', ' ', m.get(k, {}).get('value', '')))).strip()
    out[pg['title']] = dict(w=ii.get('width'), h=ii.get('height'), license=g('LicenseShortName'), author=g('Artist')[:120], credit=g('Credit')[:100], desc=g('ImageDescription')[:160], date=g('DateTimeOriginal')[:40], thumb=ii.get('thumburl'), page=ii.get('descriptionurl'))
json.dump(out, open('meta.json', 'w'), ensure_ascii=False, indent=1)
for k, v in out.items(): print(k, v['w'], v['h'], '|', v['license'], '|', v['author'][:50], '|', v['date'])
