# scan Mixkit tag pages, keep only items whose copyrightNotice is the FREE licence
import re, json, subprocess, time, os
tags = 'wind trees storm clouds smoke flames ocean waves night sky smartphone paper office meeting hands police road highway car water rain satellite earth news reporter typing computer clock time sunset beach island mountain aerial drone airplane electricity darkness silhouette crowd people family sad crying law money hospital ambulance sirens volcano lava ash burning wildfire forest-fire disaster'.split()
seen = json.load(open('assets/mk_free.json')) if os.path.exists('assets/mk_free.json') else {}
checked = set(seen.get('_checked', []))
for tag in tags:
    s = subprocess.run(['curl', '-sSL', '-m', '20', '-A', 'Mozilla/5.0', f'https://mixkit.co/free-stock-video/{tag}/'], capture_output=True, text=True).stdout
    ids = []
    for n, i in re.findall(r'/free-stock-video/([a-z0-9-]+)-(\d+)/', s):
        if i not in [x[1] for x in ids]: ids.append((n, i))
    for n, i in ids[:24]:
        if i in checked: continue
        checked.add(i)
        p = subprocess.run(['curl', '-sSL', '-m', '20', '-A', 'Mozilla/5.0', f'https://mixkit.co/free-stock-video/{n}-{i}/'], capture_output=True, text=True).stdout
        m = re.search(r'"copyrightNotice":"([^"]+)"', p)
        if m and 'Free' in m.group(1):
            res = sorted(set(re.findall(rf'https://assets\.mixkit\.co/videos/{i}/{i}-(\d+)\.mp4', p)), key=int)
            seen[i] = {'slug': n, 'tag': tag, 'notice': m.group(1), 'res': res}
            print('FREE', tag, n, res, flush=True)
        time.sleep(0.6)
    seen['_checked'] = sorted(checked); json.dump(seen, open('assets/mk_free.json', 'w'), indent=0)
print('done', len(seen) - 1)
