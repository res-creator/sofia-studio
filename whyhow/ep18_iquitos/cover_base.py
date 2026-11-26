# EP18 thumbnail base (owner's Hong Kong look): crop + grade with the shared v5 grade. Run from whyhow/: python3 ep18_iquitos/cover_base.py
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from covers_v4 import crop, grade, overlay
os.makedirs('covers_v5_base', exist_ok=True)
overlay(grade(crop('ep18_iquitos/footage/cm_iquitos_desde_el_aire.jpg', zoom=1.12, ax=0.55, ay=0.12), sat=1.25, teal=0.5), 'left', None, 0.5).save('covers_v5_base/iquitos.jpg', quality=95)
