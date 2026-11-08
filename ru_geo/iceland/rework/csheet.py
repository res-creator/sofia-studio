import json, os, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
import research as R
tag, n, qs = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
QS = json.load(open(R.Q_F)); names = []
for q in qs:
    for typ in ('image', 'video'):
        for x in QS.get(f'{typ}:{q}', [])[:n]:
            if x not in names: names.append(x)
R.meta(names)
names = [x for x in names if not R.DB.get(x, {}).get('missing')]
print(R.sheet(tag, names[:60]))
