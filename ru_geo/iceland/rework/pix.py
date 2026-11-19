# Pixabay: видео с людьми и работой под конкретные фразы. Сохраняет pix_pool.json (id → теги, автор, ссылка, лучшая версия).
import json, os, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', '..', 'lib'))
import pixabay
F = f'{D}/pix_pool.json'; POOL = json.load(open(F)) if os.path.exists(F) else {}
def run(qs):
    for q in qs:
        for h in pixabay.search(q, n=40):
            b = pixabay.best_video(h)
            r = POOL.setdefault(str(h['id']), dict(id=h['id'], tags=h['tags'], dur=h['duration'], user=h['user'], page=h['pageURL'], q=[],
                 thumb=h['videos']['medium'].get('thumbnail') or h['videos']['small'].get('thumbnail'), w=b['width'], url=b['url']))
            if q not in r['q']: r['q'].append(q)
        print(q, flush=True)
    json.dump(POOL, open(F, 'w'), ensure_ascii=False, indent=0)
if __name__ == '__main__': run(sys.argv[1:])
