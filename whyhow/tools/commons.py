#!/usr/bin/env python3
"""Wikimedia Commons access that works from this cloud sandbox (shared IP is rate-limited on commons.wikimedia.org/w/api.php and upload.wikimedia.org).
 - search / category listing: run on Wikidata Query Service via the MWAPI service (queries execute on Wikimedia's side)
 - file metadata (licence, author): parsed from the cached file description page (HTML), uploader via api.wikimedia.org REST
 - download: thumb.wikimedia.org serves width-scaled thumbnails (e.g. 1920 px)
Usage:
  python3 commons.py search "Mexico City cathedral" [limit]
  python3 commons.py cat "Category:Metropolitan Cathedral (Mexico City)" [limit]
  python3 commons.py info "File:Name.jpg"
  python3 commons.py get "File:Name.jpg" OUT.jpg [width]
"""
import sys, json, re, html, time, hashlib, urllib.request, urllib.parse
UA = 'HowItsRunDocBot/1.0 (educational documentary; https://www.mediawiki.org/wiki/API:Etiquette)'
def _get(url, accept=None, tries=4):
    for i in range(tries):
        h = {'User-Agent': UA}
        if accept: h['Accept'] = accept
        try: return urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=90).read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and i < tries - 1: time.sleep(65 if "wikidata" in url else 15 * (i + 1)); continue
            raise
_last = [0.0]
def _sparql(q):
    # WDQS currently allows ~1 request/min from this IP: space the calls
    w = 62 - (time.time() - _last[0])
    if w > 0: time.sleep(w)
    _last[0] = time.time()
    d = json.loads(_get('https://query.wikidata.org/sparql?' + urllib.parse.urlencode({'query': q}), 'application/sparql-results+json'))
    return [b['title']['value'] for b in d['results']['bindings']]
def search(text, limit=50):
    q = 'SELECT ?title WHERE { SERVICE wikibase:mwapi { bd:serviceParam wikibase:api "Generator" ; wikibase:endpoint "commons.wikimedia.org" ; mwapi:generator "search" ; mwapi:gsrsearch %s ; mwapi:gsrnamespace "6" ; mwapi:gsrlimit "max" . ?title wikibase:apiOutput mwapi:title . } } LIMIT %d' % (json.dumps(text), limit)
    return _sparql(q)
def category(cat, limit=200):
    q = 'SELECT ?title WHERE { SERVICE wikibase:mwapi { bd:serviceParam wikibase:api "Generator" ; wikibase:endpoint "commons.wikimedia.org" ; mwapi:generator "categorymembers" ; mwapi:gcmtitle %s ; mwapi:gcmlimit "max" . ?title wikibase:apiOutput mwapi:title . } } LIMIT %d' % (json.dumps(cat), limit)
    return _sparql(q)
def _txt(s): return html.unescape(re.sub(r'<[^>]+>', '', s or '')).strip()
def info(title):
    t = title if title.startswith('File:') else 'File:' + title
    page = 'https://commons.wikimedia.org/wiki/' + urllib.parse.quote(t.replace(' ', '_'))
    h = _get(page).decode('utf-8', 'replace')
    U = r'(?:_|&#95;)'
    lic = re.search(r'class="licensetpl' + U + r'short"[^>]*>(.*?)</span>', h, re.S)
    attr = re.search(r'class="licensetpl' + U + r'attr"[^>]*>(.*?)</span>', h, re.S)
    auth = re.search(r'id="fileinfotpl' + U + r'aut"[^>]*>.*?</td>\s*<td[^>]*>(.*?)</td>', h, re.S)
    if not lic and re.search(r'(?i)public domain|PD-self|CC0', h): lic_pd = 'Public domain'
    else: lic_pd = ''
    desc = re.search(r'class="description[^"]*"[^>]*>(.*?)</div>', h, re.S)
    lic_s = _txt(lic.group(1)) if lic else lic_pd
    author = _txt(attr.group(1)) if attr else _txt(auth.group(1))[:120] if auth else ''
    return {'title': t, 'page_url': page, 'licence': lic_s, 'author': author, 'description': _txt(desc.group(1))[:300] if desc else '',
            'attribution': f"{author}, {lic_s}, via Wikimedia Commons" if author else f"{lic_s}, via Wikimedia Commons"}
def thumb_url(title, width=1920):
    name = (title[5:] if title.startswith('File:') else title).replace(' ', '_')
    md = hashlib.md5(name.encode('utf-8')).hexdigest(); q = urllib.parse.quote(name)
    ext = name.rsplit('.', 1)[-1].lower(); suffix = q + ('.jpg' if ext in ('tif', 'tiff', 'pdf', 'webm', 'ogv') else '')
    return f'https://thumb.wikimedia.org/wikipedia/commons/thumb/{md[0]}/{md[:2]}/{q}/{width}px-{suffix}'
def get(title, out, width=1920):
    try: data = _get(thumb_url(title, width))
    except urllib.error.HTTPError as e:
        if e.code in (400, 404, 500): data = _get(thumb_url(title, 1280))   # image smaller than requested width
        else: raise
    open(out, 'wb').write(data); return out
if __name__ == '__main__':
    cmd, *a = sys.argv[1:]
    if cmd == 'search': print('\n'.join(search(a[0], int(a[1]) if len(a) > 1 else 50)))
    elif cmd == 'cat': print('\n'.join(category(a[0], int(a[1]) if len(a) > 1 else 200)))
    elif cmd == 'info': print(json.dumps(info(a[0]), ensure_ascii=False, indent=1))
    elif cmd == 'get': print(get(a[0], a[1], int(a[2]) if len(a) > 2 else 1920))
