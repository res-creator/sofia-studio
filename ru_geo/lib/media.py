# Реестр исходников: откуда каждый файл, автор, лицензия, что и где снято. По нему же скачиваем и пишем CREDITS.
# Источники: Mixkit (Mixkit License), Wikimedia Commons (CC / PD — нужна подпись автора), Internet Archive (CC BY/BY-SA).
import json, os, re, subprocess, sys, time, urllib.parse, urllib.request
DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'media')
UA = 'SofiaStudioResearch/1.0 (https://github.com/res-creator/sofia-studio)'

def path(key, m):
    if m.get('file'): return os.path.normpath(os.path.join(DATA, '..', m['file']))
    ext = os.path.splitext(urllib.parse.urlparse(m['url']).path)[1].lower() or '.mp4'
    return os.path.join(DATA, key + ext)

def fetch(reg, keys=None):
    os.makedirs(DATA, exist_ok=True)
    for k, m in reg.items():
        if keys and k not in keys: continue
        p = path(k, m)
        if os.path.exists(p) and os.path.getsize(p) > 1000: continue
        print('download', k, m['url'][:100], flush=True)
        for i in range(5):
            r = subprocess.run(['curl', '-sS', '-L', '-A', UA, '--max-time', '900', '-o', p, '-w', '%{http_code}', m['url']], capture_output=True, text=True)
            if r.stdout.strip() == '200': break
            print('  retry', r.stdout, r.stderr[:100], flush=True); time.sleep(30 * (i + 1))
        time.sleep(3)

def credits_md(reg, used):
    rows = ['| Ключ | Что в кадре | Где снято | Автор | Лицензия | Источник |', '|---|---|---|---|---|---|']
    for k in used:
        m = reg[k]
        rows.append(f"| `{k}` | {m.get('what', '')} | {m.get('place', '')} | {m.get('author', '')} | {m.get('license', '')} | {m.get('page', m['url'])} |")
    return '\n'.join(rows)
