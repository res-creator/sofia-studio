# Слова диктора внутри плана со временем от начала плана (для kt: at=[...]).  python3 rework/words.py u15 [u16 ...]
import json, os, sys
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, D)
from timeline import build
_, s, _ = build(); by = {x['key']: x for x in s}
for k in sys.argv[1:]:
    x = by[k]; name, c = x['vo']; j = json.load(open(f'{D}/vo/{name}.json'))
    print(k, f"dur={x['dur']:.2f}", [(w[0].strip(), round(w[1] - c, 2)) for w in j['words'] if c - 0.05 <= w[1] < c + x['dur']])
