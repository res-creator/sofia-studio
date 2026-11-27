# EP17 cover base (owner's Hong Kong look): run from whyhow/: python3 ep17_phoenix/cover.py && node ep17_phoenix/cover.js
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from covers_v4 import crop, grade, overlay
D = os.path.dirname(os.path.abspath(__file__))
for src, out, c in [('footage/cm_cap_canal_2013.jpg', 'cover_base_cap.jpg', dict(zoom=1.05, ax=0.6, ay=0.5)), ('footage/cm_grand_canal_camelback.jpg', 'cover_base_canal.jpg', dict(zoom=1.05, ax=0.5, ay=0.55))]:
    overlay(grade(crop(os.path.join(D, src), **c), sat=1.22, warm=1), 'left', None, 0.45).save(os.path.join(D, out), quality=95)
