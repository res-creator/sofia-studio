import json, os, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D); sys.path.insert(0, os.path.join(D, '..', '..', 'lib'))
import pixabay, pixsheet
tag, n, qs = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
ids = []
for q in qs:
    for h in pixabay.search(q, n=40)[:n]:
        if str(h['id']) not in ids: ids.append(str(h['id']))
pixsheet.sheet(tag, ids)
