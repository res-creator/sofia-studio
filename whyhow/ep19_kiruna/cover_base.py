# EP19 thumbnail bases (owner's Hong Kong look). Run from whyhow/: python3 ep19_kiruna/cover_base.py
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from covers_v4 import crop, grade, overlay
os.makedirs('covers_v5_base', exist_ok=True)
from PIL import ImageOps, ImageEnhance
im = crop('ep19_kiruna/footage/cm_move_side.jpg', zoom=1.0, ax=0.0, ay=0.5)
im = ImageEnhance.Brightness(im).enhance(1.25)
overlay(grade(im, sat=1.3), 'left', None, 0.4).save('covers_v5_base/kiruna_church.jpg', quality=95)
overlay(grade(crop('ep19_kiruna/footage/cm_mine_over_town.jpg', zoom=1.05, ax=0.5, ay=0.5), sat=1.2), 'left', None, 0.45).save('covers_v5_base/kiruna_mine.jpg', quality=95)
