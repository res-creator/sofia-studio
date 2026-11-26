#!/usr/bin/env python3
"""python3 archive/pick.py <slug>: читает ru_geo/<slug>/photos.json ({key:{q:[...],cap,need}}), ищет на Wikimedia Commons свободные фото,
скачивает лучшее (≥900 px) в ru_geo/<slug>/archive/img, пишет credits.json и лист для проверки review/photos_sheet.jpg. Ключи из "reuse" берутся из другой папки (см. поле _reuse)."""
import html, io, json, os, re, sys, time, urllib.parse, urllib.request
UA = {'User-Agent': 'Mozilla/5.0 (documentary research script; non-commercial research)'}
FREE = re.compile(r'public domain|pd[- ]|cc0|cc by(?!-nc)|cc-by(?!-nc)|no restrictions', re.I)
R_ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); slug = sys.argv[1]; J = f'{R_}/{slug}'
P = json.load(open(f'{J}/photos.json', encoding='utf8')); os.makedirs(f'{J}/archive/img', exist_ok=True); os.makedirs(f'{J}/review', exist_ok=True)
credits_path = f'{J}/archive/credits.json'; cr = json.load(open(credits_path, encoding='utf8')) if os.path.exists(credits_path) else {}
def get(u, tries=25):
    for a in range(tries):
        try: return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read()
        except urllib.error.HTTPError as e:
            if e.code not in (429, 503): raise
        except Exception: pass
        time.sleep(min(180, 20 + 15 * a))
    raise RuntimeError('fail ' + u[:80])
def api(**p):
    p['format'] = 'json'; return json.loads(get('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(p)))
tok = lambda s: {w for w in re.findall(r'[a-zа-яё0-9]{3,}', s.lower()) if w not in ('the', 'and', 'for', 'with', 'from', 'file', 'jpg', 'jpeg', 'png')}
for key, spec in P.items():
    if key.startswith('_') or key == 'reuse': continue
    if key in cr and os.path.exists(f"{J}/archive/img/{cr[key]['file']}"): continue
    best = None
    for q in spec.get('q', []):
        time.sleep(3); r = api(action='query', generator='search', gsrsearch=q + ' filetype:bitmap', gsrnamespace=6, gsrlimit=15, prop='imageinfo', iiprop='url|size|extmetadata', iiurlwidth=1600)
        qt = tok(q)
        for pg in (r.get('query', {}).get('pages', {}) or {}).values():
            ii = (pg.get('imageinfo') or [{}])[0]; m = ii.get('extmetadata', {}); g = lambda k: re.sub(r'\s+', ' ', re.sub('<[^>]+>', ' ', html.unescape(m.get(k, {}).get('value', '')))).strip()
            lic = g('LicenseShortName'); w = ii.get('width') or 0
            if not FREE.search(lic) or w < 900 or pg['title'].lower().endswith(('.svg', '.gif', '.pdf', '.tif', '.tiff')) or not ii.get('thumburl'): continue
            ov = len(qt & tok(pg['title'] + ' ' + g('ImageDescription') + ' ' + g('ObjectName'))) / max(1, len(qt))
            sc = ov * 10 + min(w, 3000) / 3000
            if ov < 0.34: continue
            if not best or sc > best[0]: best = (sc, pg['title'], ii, lic, g('Artist'), q)
        if best and best[0] > 8: break
    if not best: print('НЕТ ФОТО', key, spec.get('q')); continue
    _, title, ii, lic, art, q = best; fn = f'{key}.jpg'
    open(f'{J}/archive/img/{fn}', 'wb').write(get(ii['thumburl'])); time.sleep(5)
    pd = 'public domain' in lic.lower() or lic.lower().startswith('pd') or lic.lower() == 'cc0'
    art = re.sub(r'\s+', ' ', art).strip()[:60] or 'автор неизвестен'
    cr[key] = dict(file=fn, author='автор неизвестен' if (pd and (len(art) < 3 or art.lower().startswith(('unknown', 'anonym')))) else art, license='общественное достояние' if pd else lic, cap=spec.get('cap', ''), page=ii.get('descriptionurl', ''), title=title)
    print('ok', key, '<-', title[:70], lic, flush=True); json.dump(cr, open(credits_path, 'w'), ensure_ascii=False, indent=1)
json.dump(cr, open(credits_path, 'w'), ensure_ascii=False, indent=1)
try:
    from PIL import Image, ImageDraw, ImageFont
    keys = [k for k in P if k in cr and not k.startswith('_')]; f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20); cols = 4
    ims = []
    for k in keys:
        im = Image.open(f"{J}/archive/img/{cr[k]['file']}").convert('RGB'); im.thumbnail((470, 290)); c = Image.new('RGB', (480, 330), (24, 24, 28)); c.paste(im, (5, 35)); d = ImageDraw.Draw(c); d.text((6, 6), k, fill=(255, 210, 74), font=f); d.text((6, 312), cr[k]['title'][5:50], fill=(200, 200, 200)); ims.append(c)
    rows = (len(ims) + cols - 1) // cols; sh = Image.new('RGB', (480 * cols, 330 * rows))
    for i, c in enumerate(ims): sh.paste(c, ((i % cols) * 480, (i // cols) * 330))
    sh.save(f'{J}/review/photos_sheet.jpg', quality=82); print('sheet', len(ims))
except Exception as e: print('sheet error', e)
