# download chosen FREE Mixkit clips by slug prefix (from assets/mk_free.json), normalise, log
import json, subprocess, sys, os, time
free = {k: v for k, v in json.load(open('assets/mk_free.json')).items() if not k.startswith('_')}
want = json.load(open(sys.argv[1]))  # {key: slug_prefix}
log = json.load(open('assets/stock_log.json')) if os.path.exists('assets/stock_log.json') else {}
for key, pre in want.items():
    if os.path.exists(f'public/stock/{key}.mp4'): continue
    hit = [(i, v) for i, v in free.items() if v['slug'].startswith(pre)]
    if not hit: print('MISS', key, pre); continue
    i, v = hit[0]
    res = [r for r in v['res'] if int(r) <= 1080]
    if not res: print('NORES', key); continue
    src = f'https://assets.mixkit.co/videos/{i}/{i}-{res[-1]}.mp4'
    tmp = f'/tmp/claude-0/mk/{key}_src.mp4'
    subprocess.run(['curl', '-sSL', '-m', '180', '-o', tmp, src])
    r = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', tmp, '-t', '8', '-an', '-vf', 'fps=30,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p', '-c:v', 'libx264', '-crf', '20', '-preset', 'fast', f'public/stock/{key}.mp4'])
    log[key] = {'url': f"https://mixkit.co/free-stock-video/{v['slug']}-{i}/", 'license': v['notice'], 'file': src, 'ok': r.returncode == 0}
    print(key, res[-1], r.returncode, flush=True); json.dump(log, open('assets/stock_log.json', 'w'), indent=1); time.sleep(1)
