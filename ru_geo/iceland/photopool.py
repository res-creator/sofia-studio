# Фото Pixabay по конкретным местам Исландии (Ken Burns), отбор по контактным листам.
import json, os, sys, subprocess
from PIL import Image, ImageDraw
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', 'lib'))
import pixabay, look
Q = ['grindavik', 'heimaey', 'westman islands', 'vestmannaeyjar', 'eldfell', 'fagradalsfjall', 'iceland eruption', 'reykjanes', 'blue lagoon iceland',
     'svartsengi', 'eyjafjallajokull', 'hekla', 'katla', 'vik iceland church', 'myrdalsjokull', 'laki', 'askja', 'viti crater', 'holuhraun',
     'thingvellir', 'almannagja', 'reykjavik', 'reykjavik harbour', 'hallgrimskirkja', 'perlan', 'hellisheidi', 'geothermal power iceland',
     'nesjavellir', 'iceland pipeline', 'vatnajokull', 'skeidararsandur', 'iceland ring road', 'iceland sheep', 'iceland fishing', 'iceland cod',
     'stockfish', 'iceland trawler', 'iceland coast guard', 'keflavik', 'iceland forest', 'iceland birch', 'iceland lava field', 'eldhraun',
     'iceland turf house', 'iceland highlands', 'landmannalaugar', 'iceland moss', 'iceland krona', 'iceland money', 'reykjavik street',
     'iceland tourists', 'iceland volcano lava', 'iceland glacier', 'iceland ice cave', 'iceland flag', 'iceland aluminium', 'reydarfjordur',
     'iceland church', 'iceland map', 'iceland winter town', 'iceland people', 'iceland cliffs', 'iceland harbour boats', 'husavik', 'akureyri',
     'hafnarfjordur', 'kerid', 'myvatn', 'hverir', 'iceland crater', 'iceland black beach', 'reynisfjara', 'iceland horse']
def collect():
    pool = {}
    for q in Q:
        for h in pixabay.search(q, video=False, n=40, image_type='photo', orientation='horizontal'):
            t = h['tags'].lower()
            if 'ai generated' in t or 'generated' in t: continue
            r = pool.setdefault(h['id'], dict(id=h['id'], tags=h['tags'], user=h['user'], page=h['pageURL'], w=h['imageWidth'], h=h['imageHeight'],
                                              thumb=h['webformatURL'], url=h['largeImageURL'], q=[]))
            r['q'].append(q)
    json.dump(pool, open(f'{D}/photopool.json', 'w'), ensure_ascii=False, indent=0); return pool
def sheets(pool, sel, name, cols=6, rows=5):
    os.makedirs(f'{D}/cache/sheets', exist_ok=True); tdir = os.path.join(pixabay.CACHE, 'pthumbs'); os.makedirs(tdir, exist_ok=True)
    per = cols * rows; out = []
    for s in range(0, len(sel), per):
        img = Image.new('RGB', (cols * 320, rows * 210), (20, 20, 24))
        for i, k in enumerate(sel[s:s + per]):
            r = pool[k]; tp = os.path.join(tdir, f'{k}.jpg')
            if not os.path.exists(tp): subprocess.run(['curl', '-sS', '-A', pixabay.UA, '-o', tp, r['thumb']])
            try: im = Image.open(tp).convert('RGB'); im = im.resize((316, 178))
            except Exception: im = Image.new('RGB', (316, 178), (90, 0, 0))
            x, y = (i % cols) * 320, (i // cols) * 210; img.paste(im, (x + 2, y + 2))
            ImageDraw.Draw(img).text((x + 4, y + 182), f"{k} {r['q'][0][:12]}|{r['tags'][:26]}", fill=(255, 255, 255), font=look.font(15, 500))
        p = f'{D}/cache/sheets/{name}_{s // per:02d}.jpg'; img.save(p, quality=80); out.append(p)
    return out
if __name__ == '__main__':
    P = collect(); print(len(P))
    for q in Q: print(q, sum(1 for r in P.values() if r['q'][0] == q), end='; ')
