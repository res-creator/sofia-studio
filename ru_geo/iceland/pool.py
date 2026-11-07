# Пул видео Pixabay для выпуска: запросы по темам → список кандидатов (id, теги, длительность, автор) + контактные листы для отбора.
import json, os, sys, subprocess
from PIL import Image, ImageDraw
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', 'lib'))
import pixabay, look
ISL = ['iceland volcano', 'iceland lava', 'iceland eruption', 'volcano eruption lava', 'lava flow', 'fagradalsfjall', 'reykjanes',
       'reykjavik', 'reykjavik city', 'hallgrimskirkja', 'iceland town', 'iceland village', 'iceland church', 'iceland houses',
       'iceland glacier', 'vatnajokull', 'jokulsarlon', 'iceland ice cave', 'glacier lagoon', 'iceberg beach', 'diamond beach',
       'iceland waterfall', 'iceland highlands', 'landmannalaugar', 'iceland moss lava field', 'iceland black sand', 'iceland coast',
       'iceland cliffs', 'iceland sea', 'iceland harbor', 'iceland fishing boat', 'iceland aerial', 'iceland drone', 'iceland road',
       'iceland ring road', 'iceland bridge', 'iceland geothermal', 'geothermal steam', 'hot spring iceland', 'geysir', 'strokkur',
       'iceland power plant', 'iceland sheep', 'icelandic horse', 'iceland farm', 'iceland aurora', 'northern lights iceland',
       'thingvellir', 'iceland canyon', 'iceland river', 'vik iceland', 'iceland winter', 'iceland snow', 'iceland storm',
       'westman islands iceland', 'iceland puffin', 'iceland birch', 'iceland forest', 'iceland crater', 'iceland ash',
       'iceland tourists', 'iceland hiking', 'iceland airport', 'iceland plane', 'iceland flag', 'iceland mountains', 'kirkjufell',
       'iceland pipeline', 'iceland greenhouse', 'iceland steam vents', 'iceland mud pot', 'iceland fissure', 'silfra', 'iceland caldera']
GEN = ['airport departures board', 'airport empty terminal', 'airplane takeoff', 'airplane landing', 'cancelled flight', 'airplane engine',
       'trawler', 'fishing trawler sea', 'fishing net', 'cod fish', 'fish market', 'fish processing', 'stormy sea ship', 'warship', 'navy frigate',
       'coast guard ship', 'bank building', 'stock market crash', 'stock exchange', 'money coins', 'counting money', 'protest crowd',
       'news tv', 'aluminium', 'aluminum factory', 'molten metal', 'steel factory', 'cargo ship', 'container ship', 'power lines',
       'hydroelectric dam', 'electricity pylon', 'laboratory scientist', 'rock basalt', 'drilling rig', 'moon surface', 'astronaut',
       'rocket launch', 'fog sun', 'red sun haze', 'smog', 'old book', 'candle dark', 'sheep flock', 'cows field', 'horses running',
       'bulldozer', 'excavator', 'dump truck', 'construction earth', 'firefighter hose', 'water pump', 'fire hose water', 'earthquake crack',
       'cracked road', 'seismograph', 'measurement instrument', 'hot dog', 'tree planting', 'seedlings', 'birch forest', 'wind sand storm',
       'radiator heating', 'hot water tap', 'shower', 'swimming pool outdoor', 'snow street', 'taxi', 'train europe', 'bus travel',
       'tourists crowd', 'selfie', 'map globe', 'earth from space', 'ocean waves', 'ice melting', 'glacier melting', 'thermometer heat',
       'courthouse', 'prison', 'handcuffs', 'judge gavel', 'vote ballot', 'parliament', 'viking ship', 'old wooden boat', 'campfire',
       'church bells', 'evacuation', 'police car night', 'traffic jam', 'people walking city', 'family home', 'packing suitcase', 'ferry ship']

def collect():
    pool = {}
    for q in ISL + GEN:
        for h in pixabay.search(q):
            t = h['tags'].lower(); isl = q in ISL and ('iceland' in t or 'island' in q or q in ('fagradalsfjall', 'reykjanes', 'reykjavik', 'reykjavik city', 'hallgrimskirkja', 'vatnajokull', 'jokulsarlon', 'thingvellir', 'geysir', 'strokkur', 'kirkjufell', 'landmannalaugar', 'silfra', 'diamond beach'))
            if q in ISL and not isl: continue
            r = pool.setdefault(h['id'], dict(id=h['id'], tags=h['tags'], dur=h['duration'], user=h['user'], page=h['pageURL'], q=[], isl=False,
                                              thumb=h['videos']['medium'].get('thumbnail') or h['videos']['small'].get('thumbnail'),
                                              w=pixabay.best_video(h)['width'], url=pixabay.best_video(h)['url']))
            r['q'].append(q); r['isl'] |= isl
    json.dump(pool, open(f'{D}/pool.json', 'w'), ensure_ascii=False, indent=0)
    return pool

def sheets(pool, sel, name, cols=6, rows=5):
    os.makedirs(f'{D}/cache/sheets', exist_ok=True); tdir = os.path.join(pixabay.CACHE, 'thumbs'); os.makedirs(tdir, exist_ok=True)
    ids = list(sel); per = cols * rows; out = []
    for s in range(0, len(ids), per):
        img = Image.new('RGB', (cols * 320, rows * 210), (20, 20, 24))
        for i, k in enumerate(ids[s:s + per]):
            r = pool[k]; tp = os.path.join(tdir, f'{k}.jpg')
            if not os.path.exists(tp): subprocess.run(['curl', '-sS', '-A', pixabay.UA, '-o', tp, r['thumb']])
            try: im = Image.open(tp).convert('RGB').resize((316, 178))
            except Exception: im = Image.new('RGB', (316, 178), (90, 0, 0))
            x, y = (i % cols) * 320, (i // cols) * 210; img.paste(im, (x + 2, y + 2))
            ImageDraw.Draw(img).text((x + 4, y + 182), f"{k} {r['dur']}s {r['tags'][:34]}", fill=(255, 255, 255), font=look.font(15, 500))
        p = f'{D}/cache/sheets/{name}_{s // per:02d}.jpg'; img.save(p, quality=80); out.append(p)
    return out

if __name__ == '__main__':
    pool = collect()
    isl = [k for k, r in pool.items() if r['isl']]; gen = [k for k, r in pool.items() if not r['isl']]
    print(len(pool), 'clips;', len(isl), 'iceland;', len(gen), 'generic')
