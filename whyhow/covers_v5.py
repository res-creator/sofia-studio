# Thumbnails v5 — owner's own Hong Kong look (CTR 3.3%): vivid photo, big Anton stacked lines (white + yellow), yellow arrow, no plates.
# Step 1 (this file): crop + grade the photos into covers_v5_base/. Step 2: node covers_v5.js draws the text and arrows.
import os
from covers_v4 import crop, grade, overlay
os.makedirs('covers_v5_base', exist_ok=True)
JOBS = {
  'singapore': ('ep14_singapore/footage/cm_gardens_by_the_bay_aerial.jpg', dict(zoom=1.15, ax=0.95, ay=0.55), dict(sat=1.22, teal=1)),
  'dubai':     ('ep15_dubai/footage/gov_nasa_iss_2014_palm_jumeirah.jpg', dict(zoom=1.12, ax=0.0, ay=0.45), dict(sat=1.2, teal=1.5, warm=1)),
  'tokyo':     ('ep16_tokyo/footage/cm_e235_yamanote_shibuya_2026.jpg', dict(zoom=1.0, ax=0.5, ay=0.22), dict(sat=1.15)),
}
for k, (src, c, g) in JOBS.items():
    overlay(grade(crop(src, **c), **g), 'left', None, 0.45).save(f'covers_v5_base/{k}.jpg', quality=95)
