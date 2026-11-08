# «Красивый пул»: все 4K/Full HD видео про Исландию с Pixabay (API, все страницы) + оценка яркости/красочности по превью
# (colorfulness Hasler–Süsstrunk), лайки/скачивания. Результат: rework/beauty_pool.json и листы rework/sheets/beauty_*.jpg
import json, os, subprocess, sys, time, urllib.parse
import numpy as np
from PIL import Image, ImageDraw, ImageFont
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', '..', 'lib'))
import pixabay
OUT = f'{D}/beauty_pool.json'
QS = ['iceland', 'iceland drone', 'iceland aerial', 'iceland landscape', 'iceland nature', 'iceland volcano', 'iceland lava', 'iceland eruption',
      'iceland waterfall', 'iceland glacier', 'iceland aurora', 'northern lights iceland', 'iceland beach', 'iceland black sand', 'iceland road',
      'iceland mountains', 'iceland winter', 'iceland summer', 'iceland horse', 'iceland sheep', 'iceland puffin', 'iceland whale', 'iceland church',
      'reykjavik', 'kirkjufell', 'seljalandsfoss', 'skogafoss', 'gullfoss', 'dettifoss', 'godafoss', 'jokulsarlon', 'reynisfjara', 'vik iceland',
      'landmannalaugar', 'thingvellir', 'geysir', 'strokkur', 'blue lagoon', 'fagradalsfjall', 'reykjanes', 'vestrahorn', 'stokksnes', 'snaefellsnes',
      'iceland canyon', 'fjadrargljufur', 'iceland ice cave', 'iceberg', 'glacier lagoon', 'diamond beach', 'westfjords', 'husavik', 'akureyri',
      'iceland river', 'iceland moss', 'iceland highlands', 'iceland geothermal', 'iceland hot spring', 'iceland fjord', 'iceland sunset']
def harvest():
    pool = json.load(open(OUT)) if os.path.exists(OUT) else {}
    for q in QS:
        for page in (1, 2, 3):
            url = 'https://pixabay.com/api/videos/?key=' + os.environ['PIXABAY_API_KEY'] + '&' + urllib.parse.urlencode(dict(q=q, per_page=200, page=page, safesearch='true'))
            try: d = pixabay._get(url)
            except Exception: break
            hits = d.get('hits', [])
            for h in hits:
                b = pixabay.best_video(h)
                if b['width'] < 1920: continue
                r = pool.setdefault(str(h['id']), dict(id=h['id'], tags=h['tags'], dur=h['duration'], user=h['user'], page=h['pageURL'], q=[],
                     likes=h.get('likes', 0), downloads=h.get('downloads', 0), w=b['width'], url=b['url'],
                     thumb=h['videos']['medium'].get('thumbnail') or h['videos']['small'].get('thumbnail')))
                if q not in r['q']: r['q'].append(q)
            if len(hits) < 200: break
            time.sleep(0.7)
        print(q, len(pool), flush=True)
    json.dump(pool, open(OUT, 'w'), ensure_ascii=False, indent=0); return pool
def score(pool):
    td = f'{D}/thumbs'; os.makedirs(td, exist_ok=True)
    for k, r in pool.items():
        if 'color' in r: continue
        tp = f'{td}/px{k}.jpg'
        if not os.path.exists(tp): subprocess.run(['curl', '-sS', '-A', pixabay.UA, '-o', tp, r['thumb']])
        try:
            a = np.asarray(Image.open(tp).convert('RGB').resize((160, 90)), np.float32)
            rg = a[..., 0] - a[..., 1]; yb = 0.5 * (a[..., 0] + a[..., 1]) - a[..., 2]
            r['color'] = round(float(np.sqrt(rg.std() ** 2 + yb.std() ** 2) + 0.3 * np.sqrt(rg.mean() ** 2 + yb.mean() ** 2)), 1)
            r['bright'] = round(float(a.mean()), 1)
        except Exception: r['color'] = -1; r['bright'] = 0
    json.dump(pool, open(OUT, 'w'), ensure_ascii=False, indent=0)
def sheets(pool, n=180, cols=6):
    good = [r for r in pool.values() if 'iceland' in (r['tags'] + ' '.join(r['q'])).lower() and r['color'] > 0 and r['bright'] > 45]
    good.sort(key=lambda r: -(r['color'] + 6 * np.log1p(r['likes'])))
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
    for s in range(0, min(n, len(good)), 60):
        part = good[s:s + 60]; img = Image.new('RGB', (cols * 320, 10 * 196), (16, 16, 20)); d = ImageDraw.Draw(img)
        for i, r in enumerate(part):
            try: im = Image.open(f"{D}/thumbs/px{r['id']}.jpg").convert('RGB').resize((316, 178))
            except Exception: continue
            x, y = (i % cols) * 320, (i // cols) * 196; img.paste(im, (x + 2, y + 2))
            d.text((x + 4, y + 181), f"{r['id']} {r['dur']}s {r['w']} c{r['color']:.0f} ♥{r['likes']}", fill=(255, 255, 0), font=f)
        img.save(f'{D}/sheets/beauty_{s // 60}.jpg', quality=80)
    print('good', len(good))
if __name__ == '__main__':
    p = harvest(); score(p); sheets(p)
