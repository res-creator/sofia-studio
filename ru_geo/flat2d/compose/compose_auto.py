#!/usr/bin/env python3
"""python3 compose_auto.py <slug> [t0 t1] : SCRIPT.md (новый формат: >> {"b":[англ. запросы стока],"big":{"n","l"}}, главы с >> {"icon"}) + film.json
-> подбор клипов Coverr, карточки, timeline, видео ru_geo/<slug>/video/<slug>.mp4 (или excerpt если заданы t0 t1)."""
import json, os, re, subprocess, sys, urllib.parse
R = '/home/user/sofia-studio/ru_geo'; slug = sys.argv[1]; J = f'{R}/{slug}'; C = f'{R}/flat2d/compose'; ST = f'{R}/stock'; os.makedirs(ST, exist_ok=True)
film = json.load(open(f'{J}/film.json', encoding='utf8')); segs = film['segs']
DBF = f'{R}/stock/coverr_db.json'; DB = json.load(open(DBF)) if os.path.exists(DBF) else {'q': {}, 'v': {}}
old = f'{R}/iceland/rework/coverr_db.json'
if not DB['v'] and os.path.exists(old): DB = json.load(open(old))
def curl(url): return subprocess.run(['curl', '-sS', '-L', '--max-time', '60', url], capture_output=True, text=True).stdout
import time
def pixabay(q):
    key = os.environ.get('PIXABAY_API_KEY', '')
    if not key: return []
    for attempt in range(5):
        raw = curl('https://pixabay.com/api/videos/?' + urllib.parse.urlencode(dict(key=key, q=q[:100], per_page=20, safesearch='true')))
        try: d = json.loads(raw)
        except Exception: time.sleep(20); continue
        ids = []
        for h in d.get('hits', []):
            vv = h['videos']; m = vv.get('medium') or vv.get('small')
            if not m or not m.get('url') or m['width'] < m['height']: continue
            if re.search(r'cartoon|character|mascot|funny|fun\b|3d|render|cgi|illustration|emoji|animation|alien|ufo|fantasy|sci-fi|scifi|futuristic|abstract|ai generated|generated|neon|glow|particles|hologram|digital|wallpaper|loop|vfx|effect|magic|astronaut|planet surface|galaxy fantasy', h.get('tags', ''), re.I): continue
            k = 'px%s' % h['id']
            DB['v'][k] = dict(id=k, title=h.get('tags', ''), dur=h.get('duration'), mp4=m['url'], tags=h.get('tags', '').split(', ')[:10]); ids.append(k)
        time.sleep(1.0); return ids
    return []
def search(q):
    if q in DB['q'] and DB['q'][q]: return DB['q'][q]
    ids = pixabay(q)
    if len(ids) >= 3:
        DB['q'][q] = ids; json.dump(DB, open(DBF, 'w'), ensure_ascii=False); return ids
    for attempt in range(1):
        raw = curl('https://api.coverr.co/videos?' + urllib.parse.urlencode(dict(query=q, page_size=20, urls='true')))
        if 'Exceeded query limit' in raw or not raw.strip(): print('лимит Coverr, жду 5 минут', flush=True); time.sleep(300); continue
        try: d = json.loads(raw)
        except Exception: time.sleep(30); continue
        ids = []
        for h in d.get('hits', []):
            if h.get('is_vertical') or h.get('is_ai_generated'): continue
            u = h.get('urls') or {}; mp4 = u.get('mp4') or u.get('mp4_download')
            if not mp4: continue
            DB['v'][h['id']] = dict(id=h['id'], title=h['title'], dur=h.get('duration'), mp4=mp4, tags=h.get('tags', [])[:10]); ids.append(h['id'])
        DB['q'][q] = ids; json.dump(DB, open(DBF, 'w'), ensure_ascii=False); time.sleep(1.5); return ids
    return []
# --- разбор сценария
L = open(f'{J}/SCRIPT.md', encoding='utf8').read().split('## ТАБЛИЦА ФАКТОВ')[0].splitlines()
paras, icons = [], {}; last = None; cur_ch = None
for l in L:
    t = l.strip()
    if t.startswith('## '): cur_ch = t[3:].strip(); last = ('ch', cur_ch); continue
    if t.startswith('>>'):
        d = json.loads(t[2:].strip())
        if last and last[0] == 'ch': icons[last[1]] = d.get('icon', '')
        elif last and last[0] == 'p': paras[-1]['cue'] = d
        continue
    if not t or t.startswith(('---', '#', '|')): continue
    txt = re.sub(r'\s+', ' ', re.sub(r'\[[a-z ]+\]', '', t)).strip()
    if txt: paras.append(dict(text=txt, cue={})); last = ('p', txt)
voice = [s for s in segs if s['kind'] == 'voice']
if len(paras) != len(voice): sys.exit(f'абзацев {len(paras)} != озвученных {len(voice)}')
# --- фото по абзацам из старой раскадровки
photos_by_par = {}; caps = {}; PIMG = {}; fb = [0]
oc = f'{J}/SCRIPT_oldcues.md'; cr_path = f'{J}/archive/credits.json'
if os.path.exists(cr_path):
    CR = json.load(open(cr_path, encoding='utf8')); caps = {k: v.get('cap', '') for k, v in CR.items() if not v.get('author', '').startswith('собственная')}
    pi = -1
    for l in (open(oc, encoding='utf8').read().split('## ТАБЛИЦА ФАКТОВ')[0].splitlines() if os.path.exists(oc) else []):
        t = l.strip()
        if t.startswith('>>'):
            try: d = json.loads(t[2:].strip())
            except Exception: continue
            ks = list(d.get('shots', [])) + ([d['card']['photo']] if d.get('card', {}).get('photo') else [])
            if pi >= 0: photos_by_par[pi] = [k for k in ks if k in CR and os.path.exists(f"{J}/archive/img/{CR[k]['file']}")]
            continue
        if not t or t.startswith(('---', '#', '|')): continue
        if re.sub(r'\s+', ' ', re.sub(r'\[[a-z ]+\]', '', t)).strip(): pi += 1
    PIMG = {k: f"{J}/archive/img/{v['file']}" for k, v in CR.items()}
STRICT = True
NO_STOCK = os.path.exists(f'{J}/no_stock')
REQ = re.compile(open(f'{J}/stock_require', encoding='utf8').read().strip(), re.I) if os.path.exists(f'{J}/stock_require') else None
SB = json.load(open(f'{J}/storyboard.json', encoding='utf8')) if os.path.exists(f'{J}/storyboard.json') else {}
# --- подбор клипов
used = set(); cards = []; tl = []
def pick(q):
    if NO_STOCK: return None, None
    STOP = {'time', 'laps', 'abst', 'slow', 'moti', 'movi', 'clos', 'view', 'shot', 'real', 'wide', 'live', 'aeri', 'dark', 'black', 'back', 'nigh'}
    qw = [w[:4] for w in re.findall(r'[a-z]+', q.lower()) if len(w) > 2 and w[:4] not in STOP]
    def score(k): tg = ' '.join(DB['v'][k].get('tags', []) + [DB['v'][k].get('title', '')]).lower(); return -sum(1 for w in qw if w in tg)
    for k in sorted(search(q), key=score):
        if STRICT and score(k) == 0: continue
        if REQ and not REQ.search(' '.join(DB['v'][k].get('tags', []) + [DB['v'][k].get('title', '')])): continue
        v = DB['v'][k]
        if k in used or float(v.get('dur') or 0) < 4.5: continue
        used.add(k); p = f'{ST}/{k}.mp4'
        if not os.path.exists(p): subprocess.run(['curl', '-sSL', '--max-time', '180', '-o', p, v['mp4']])
        if os.path.exists(p) and os.path.getsize(p) > 100000: return k, v
    return None, None
def add(t, d, **k): tl.append(dict(t=round(t, 3), d=round(d, 3), **k))
chaps = [(s['t'], s['title']) for s in segs if s['kind'] == 'chapter']; ci = 0
bounds = []  # окна абзацев
vi = 0
for i, s in enumerate(segs):
    if s['kind'] != 'voice': continue
    a = 0.0 if vi == 0 else s['t']; b = film['total']
    for j in range(i + 1, len(segs)): b = segs[j]['t'] - 1.6 if segs[j]['kind'] == 'chapter' else segs[j]['t']; break
    bounds.append((a, b)); vi += 1
cardjobs = []; last_ttl = -99
for idx, ((a, b), p) in enumerate(zip(bounds, paras)):
    cue = p['cue']; qs = (cue.get('b', []) or ['city street'])[:3]; big = cue.get('big'); t = a; dur_total = b - a
    if big and dur_total > 6:
        png = f'{J}/card_big_{idx}.png'; cardjobs.append(dict(type='bignum', big=big['n'], label=big.get('l', ''), bg='black', out=png)); add(t, 3.6, type='card', src=png); t += 3.6
    sbk = SB.get(str(idx + 1))
    sbk = [k for k in (sbk or []) if k.partition('@')[0] in PIMG]
    if sbk:
        items = []
        for k in sbk:
            kk, _, fr = k.partition('@'); items.append((kk, float(fr) if fr else None))
        win = b - t
        if any(f is not None for _, f in items):
            st = []
            for i, (kk, f) in enumerate(items): st.append(f if f is not None else (0.0 if i == 0 else None))
            for i in range(len(st)):
                if st[i] is None: st[i] = (st[i - 1] + (1.0 - st[i - 1]) / 2) if i else 0.0
            for i, (kk, _) in enumerate(items):
                a0 = t + win * st[i]; a1 = t + win * (st[i + 1] if i + 1 < len(items) else 1.0)
                if a1 - a0 > 0.2: add(a0, a1 - a0, type='photo', src=PIMG[kk], cap=caps.get(kk, ''))
        else:
            import math as _m
            ks = [kk for kk, _ in items]; n = max(len(ks), _m.ceil(win / 6.0)); shot = win / n
            for j in range(n):
                key = ks[j % len(ks)] if j < len(ks) else ks[-1 - ((j - len(ks)) % len(ks))]
                add(t + j * shot, shot, type='photo', src=PIMG[key], cap=caps.get(key, ''))
        continue
    n = max(1, round((b - t) / (4.6 if NO_STOCK else 3.2))); shot = (b - t) / n
    ttl = cue.get('ttl') or (p['text'] if (len(p['text']) <= 70 and p['text'].endswith('?') and t - last_ttl > 40) else None)
    ov = None
    if ttl and not big:
        ov = f'{J}/card_ttl_{idx}.png'; cardjobs.append(dict(type='title', text=ttl, out=ov)); last_ttl = t
    phs = photos_by_par.get(idx, []); pj = 0
    for j in range(n):
        if pj < len(phs) and (j % 2 == 0 or n <= len(phs) + 1):
            key = phs[pj]; pj += 1; zz = [[1.0, 1.12], [1.12, 1.0], [1.05, 1.15]][(idx + j) % 3]
            add(t + j * shot, shot, type='photo', src=PIMG[key], z=zz, p=[[0.4, 0.5], [0.6, 0.45], [0.5, 0.5]][(idx + j) % 3], cap=caps.get(key, ''), **({'ov': ov} if (ov and j == (n - 1 if cue.get('ttl') else 0)) else {}))
            continue
        k, v = pick(qs[j % len(qs)])
        if not k:
            for q in qs:
                k, v = pick(q)
                if k: break
        if k: add(t + j * shot, shot, type='clip', src=f'stock/{k}.mp4', ss=0.3, **({'ov': ov} if (ov and j == (n - 1 if cue.get('ttl') else 0)) else {}))
        elif PIMG:
            pool = (phs or []) + [x for x in PIMG if x not in (phs or [])]; key = pool[(fb[0]) % len(pool)]; fb[0] += 1
            zz = [[1.0, 1.14], [1.14, 1.0], [1.05, 1.16]][fb[0] % 3]; pp = [[0.2, 0.4], [0.8, 0.55], [0.5, 0.25], [0.35, 0.75], [0.7, 0.3]][fb[0] % 5]
            add(t + j * shot, shot, type='photo', src=PIMG[key], z=zz, p=pp, cap=caps.get(key, ''))
        else: add(t + j * shot, shot, type='card', src=f'{C}/black.png')
# заставки глав
for ct, title in chaps:
    if ct < 0.01: continue
    png = f'{J}/card_ch_{int(ct)}.png'; num = [x for x in chaps if x[0] > 0.01].index((ct, title)) + 1
    cardjobs.append(dict(type='chapter', num=f'{num:02d}', title=title, icon=icons.get(title, ''), out=png)); add(ct - 1.6, 2.6, type='card', src=png)
# окна абзацев не должны пересекаться с заставками: заставка занимает [ct-1.6, ct+1.0]; абзацы уже заканчиваются на ct-1.6 и начинаются на ct+1.0 (по layout)
tl.sort(key=lambda x: x['t'])
if not os.path.exists(f'{C}/black.png'): cardjobs.append(dict(type='bignum', big='', label='', bg='black', out=f'{C}/black.png'))
json.dump(cardjobs, open('/tmp/cj.json', 'w'), ensure_ascii=False); subprocess.run(['node', f'{C}/cards.mjs', '/tmp/cj.json'], check=True)
json.dump(dict(segs=tl), open(f'{J}/timeline.json', 'w'), ensure_ascii=False, indent=0)
# проверка непрерывности
prev = 0.0
for s in tl:
    if abs(s['t'] - prev) > 0.15: print('ДЫРА/нахлёст', round(prev, 2), '->', round(s['t'], 2))
    prev = s['t'] + s['d']
print('segments', len(tl), 'clips used', len(used))
# музыка
M = f'{R}/paperson/music'; mus = f'{J}/music.wav'
if not os.path.exists(mus):
    T = film['total']; ids = ['41', '76', '22', '18']; args = []; filt = ''; prevl = '[0]'
    for m in ids: args += ['-i', f'{M}/mixkit_{m}.mp3']
    for i in range(1, len(ids)): filt += f'{prevl}[{i}]acrossfade=d=4[c{i}];'; prevl = f'[c{i}]'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args, '-filter_complex', f'{filt}{prevl}atrim=0:{T},asetpts=N/SR/TB,volume=0.34,afade=t=in:d=3,afade=t=out:st={T - 5}:d=5[o]', '-map', '[o]', '-ar', '48000', '-ac', '2', mus], check=True)
t0, t1 = (sys.argv[2], sys.argv[3]) if len(sys.argv) > 3 else ('0', str(film['total']))
os.makedirs(f'{J}/video', exist_ok=True); out = f'{J}/video/{slug}.mp4' if len(sys.argv) <= 3 else f'/tmp/claude-0/-home-user-sofia-studio/24c15af6-1f18-59ef-a680-971b83cb24ee/scratchpad/{slug}_excerpt.mp4'
subprocess.run(['python3', f'{C}/compose.py', slug, f'{J}/timeline.json', out, t0, t1], check=True)
