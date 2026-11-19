# Красочный пул видео про Японию: Pixabay (API, все страницы) + Mixkit + Coverr, оценка красочности по превью.
import json, os, re, subprocess, sys, time, urllib.parse
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image, ImageDraw, ImageFont
D = os.path.dirname(os.path.abspath(__file__)); RG = os.path.join(D, '..', '..'); sys.path.insert(0, os.path.join(RG, 'lib'))
import pixabay
OUT = f'{D}/pool.json'; TH = f'{D}/thumbs'; os.makedirs(TH, exist_ok=True)
QS = ['japan', 'japan drone', 'japan aerial', 'tokyo', 'tokyo night', 'tokyo aerial', 'shibuya', 'shinjuku', 'akihabara', 'tokyo tower', 'tokyo skytree',
      'kyoto', 'kyoto temple', 'fushimi inari', 'arashiyama bamboo', 'kinkakuji', 'nara deer', 'osaka', 'dotonbori', 'hiroshima', 'miyajima', 'nikko',
      'mount fuji', 'fuji', 'sakura', 'cherry blossom japan', 'japan autumn', 'momiji', 'japanese garden', 'zen garden', 'koi', 'torii', 'pagoda',
      'japanese temple', 'shrine japan', 'geisha', 'kimono', 'japanese street', 'japan night street', 'izakaya', 'ramen', 'sushi', 'japanese food',
      'shinkansen', 'japan train', 'tokyo metro', 'japan countryside', 'rice field japan', 'onsen', 'hokkaido', 'okinawa', 'japan snow', 'japan winter',
      'japan festival', 'lantern japan', 'japan sea', 'japan coast', 'japan mountains', 'japan forest', 'japan lake', 'japan bridge', 'japan castle']
KEY = re.compile(r'japan|tokyo|kyoto|osaka|fuji|shibuya|shinjuku|akihabara|nara|hiroshima|miyajima|nikko|hokkaido|okinawa|sakura|torii|kinkaku|fushimi|arashiyama|dotonbori|shinkansen|geisha|kimono|onsen|japanese|izakaya|ramen|sushi|skytree')
def px():
    pool = json.load(open(OUT)) if os.path.exists(OUT) else {}
    for q in QS:
        for page in (1, 2):
            url = 'https://pixabay.com/api/videos/?key=' + os.environ['PIXABAY_API_KEY'] + '&' + urllib.parse.urlencode(dict(q=q, per_page=200, page=page, safesearch='true'))
            try: hits = pixabay._get(url).get('hits', [])
            except Exception: break
            for h in hits:
                b = pixabay.best_video(h)
                if b['width'] < 1920 or not KEY.search((h['tags'] + ' ' + q).lower()) or 'ai generated' in h['tags'].lower(): continue
                r = pool.setdefault(f"px{h['id']}", dict(src='Pixabay', id=h['id'], tags=h['tags'], dur=h['duration'], author=h['user'], page=h['pageURL'],
                     license='Pixabay Content License', likes=h.get('likes', 0), w=b['width'], url=b['url'],
                     thumb=h['videos']['medium'].get('thumbnail') or h['videos']['small'].get('thumbnail'), q=[]))
                if q not in r['q']: r['q'].append(q)
            if len(hits) < 200: break
            time.sleep(0.7)
    json.dump(pool, open(OUT, 'w'), ensure_ascii=False, indent=0); return pool
def thumbs_and_score(pool):
    def one(k):
        r = pool[k]; tp = f'{TH}/{k}.jpg'
        if not os.path.exists(tp): subprocess.run(['curl', '-sS', '-L', '-A', pixabay.UA, '-o', tp, r['thumb']])
        try:
            a = np.asarray(Image.open(tp).convert('RGB').resize((160, 90)), np.float32)
            rg = a[..., 0] - a[..., 1]; yb = 0.5 * (a[..., 0] + a[..., 1]) - a[..., 2]
            r['color'] = round(float(np.hypot(rg.std(), yb.std()) + 0.3 * np.hypot(rg.mean(), yb.mean())), 1); r['bright'] = round(float(a.mean()), 1)
        except Exception: r['color'] = -1; r['bright'] = 0
    with ThreadPoolExecutor(10) as ex: list(ex.map(one, list(pool)))
    json.dump(pool, open(OUT, 'w'), ensure_ascii=False, indent=0)
def sheets(pool, per=60, cols=6):
    good = sorted([r for r in pool.values() if r['color'] > 0 and r['bright'] > 40], key=lambda r: -(r['color'] + 5 * np.log1p(r.get('likes', 0))))
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
    for s in range(0, len(good), per):
        part = good[s:s + per]; img = Image.new('RGB', (cols * 320, ((len(part) + cols - 1) // cols) * 196), (16, 16, 20)); d = ImageDraw.Draw(img)
        for i, r in enumerate(part):
            k = f"px{r['id']}"
            try: im = Image.open(f'{TH}/{k}.jpg').convert('RGB').resize((316, 178))
            except Exception: continue
            x, y = (i % cols) * 320, (i // cols) * 196; img.paste(im, (x + 2, y + 2))
            d.text((x + 4, y + 181), f"{r['id']} {r['dur']}s c{r['color']:.0f} {r['tags'][:26]}", fill=(255, 255, 0), font=f)
        img.save(f'{D}/sheet_{s // per}.jpg', quality=80)
    print('good', len(good))
if __name__ == '__main__':
    p = px(); print('pool', len(p)); thumbs_and_score(p); sheets(p)
