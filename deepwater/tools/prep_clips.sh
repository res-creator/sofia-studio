#!/bin/sh
# Opening fragments (exact source timecodes). DVIDS = public domain (USCG). Archive aspect kept (contain).
cd "$(dirname "$0")/.."
R=assets/raw
cut() { [ -s public/vid/$4.mp4 ] || ffmpeg -v error -y -ss $2 -t $3 -i $R/$1 -an -c:v libx264 -crf 16 -preset fast -pix_fmt yuv420p public/vid/$4.mp4; }
cut dvids/dvids315074_fire_boats_night.mp4 7 24 night_rig          # DVIDS 315074, Air Station New Orleans, night of Apr 20-21 2010
cut dvids/dvids315070_mh65_films_fire_sar.mp4 4 23 night_fireboats # DVIDS 315070, MH-65 crew, before dawn Apr 21 2010
J=jit/dvids91190_jit_2010-07-23_part1.mp4                          # DVIDS 91190, Joint Investigation hearing, July 23 2010 (Mike Williams)
cut $J 0 22 jit_sworn; cut $J 24 10 jit_wide1; cut $J 34 22.5 jit_wide2   # the camera stays on panel member J. McCarroll after 0:56; only the wide shots show the room with the witness
echo CLIPS_OK
