# Медленная закачка с upload.wikimedia.org (сервер отвечает 429 на частые запросы): по одному файлу, паузы, повторы.
import hashlib, os, subprocess, sys, time, urllib.parse
UA = 'SofiaStudioResearch/1.0 (https://github.com/res-creator/sofia-studio)'
def url(name, variant=None):
    n = name.replace(' ', '_'); h = hashlib.md5(n.encode()).hexdigest(); q = urllib.parse.quote(n)
    if variant: return f'https://upload.wikimedia.org/wikipedia/commons/transcoded/{h[0]}/{h[:2]}/{q}/{q}.{variant}'
    return f'https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[:2]}/{q}'
def get(name, out, variant=None, tries=8):
    if os.path.exists(out) and os.path.getsize(out) > 50000: return True
    for k in range(tries):
        r = subprocess.run(['curl', '-sS', '-L', '-A', UA, '--max-time', '1800', '-o', out, '-w', '%{http_code}', url(name, variant)], capture_output=True, text=True).stdout
        if r == '200' and os.path.getsize(out) > 50000: print('ok', out, os.path.getsize(out) // 1000000, 'MB', flush=True); return True
        print('retry', r, out, flush=True); time.sleep(30 * (k + 1))
    return False
if __name__ == '__main__':
    for line in open(sys.argv[1]):
        if not line.strip(): continue
        name, out, var = (line.rstrip('\n').split('\t') + [''])[:3]
        get(name, out, var or None); time.sleep(20)
