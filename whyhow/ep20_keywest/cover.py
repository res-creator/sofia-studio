# EP20 cover base (owner's Hong Kong look): run from whyhow/: python3 ep20_keywest/cover.py && node ep20_keywest/cover.js
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from covers_v4 import crop, grade, overlay
D = os.path.dirname(os.path.abspath(__file__))
for src, out, c in [('footage/cm_seven_mile_aerial.jpg', 'cover_base_bridge.jpg', dict(zoom=1.0, ax=0.5, ay=0.15)), ('footage/cm_seven_mile_pigeon_b.jpg', 'cover_base_pigeon.jpg', dict(zoom=1.0, ax=0.5, ay=0.35))]:
    overlay(grade(crop(os.path.join(D, src), **c), sat=1.2, teal=1), 'left', None, 0.45).save(os.path.join(D, out), quality=95)
