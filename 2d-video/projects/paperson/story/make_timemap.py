# Карта времени новое->старое: абзацы новой озвучки сопоставляются со старыми по тексту; удалённые абзацы пропускаются скачком.
import difflib, json, os
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
old = json.load(open(f'{P}/story/segments_old.json')); new = json.load(open(f'{P}/story/segments_new.json'))
ov = [s for s in old if s['kind'] == 'voice']; nv = [s for s in new if s['kind'] == 'voice']
# последовательное сопоставление: для каждого нового абзаца ищем лучший старый после предыдущего совпадения
pairs = []; j0 = 0
for n in nv:
    best = (0.0, None)
    for j in range(j0, min(len(ov), j0 + 12)):
        r = difflib.SequenceMatcher(None, n['text'], ov[j]['text']).ratio()
        if r > best[0]: best = (r, j)
    if best[1] is not None and best[0] >= 0.45: pairs.append((n, ov[best[1]], best[1], round(best[0], 2))); j0 = best[1] + 1
    else: pairs.append((n, None, None, 0))
pts = []; prev = None
for n, o, j, r in pairs:
    if o is None: continue
    ns, ne = n['t'], n['t'] + n['dur']; os_, oe = o['t'], o['t'] + o['dur']
    if prev is not None and j != prev[2] + 1:      # скачок: старые абзацы между ними вырезаны
        g = max(0.0, ns - prev[1]); pts += [(prev[1] + 1e-3, os_ - g + 1e-3)]
    pts += [(ns, os_), (ne, oe)]; prev = (n, ne, j)
pts = sorted(set((round(a, 3), round(b, 3)) for a, b in pts))
cfg = json.load(open(f'{P}/config.json')); cfg['timeMap'] = pts
cfg.setdefault('oldDuration', 651.22)
json.dump(cfg, open(f'{P}/config.json', 'w'), ensure_ascii=False, indent=1)
print(len(pairs), 'абзацев,', sum(1 for p in pairs if p[1] is None), 'без пары;', len(pts), 'точек')
for n, o, j, r in pairs:
    if o is None or r < 0.9: print(' ', n['t'], r, n['text'][:70])
