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
cut dvids/dvids315074_fire_boats_night.mp4 36 24 night_wide      # wider night view, rig burning on the horizon (after 11 p.m., Apr 20)
cut dvids/dvids83700_daytime_fire.mp4 6 20 day_fire              # DVIDS 83700: daylight, i.e. Apr 21 (slate says Apr 20)
# ---- main film (all DVIDS, public domain, U.S. Coast Guard unless noted)
cut dvids/dvids315069_mh65_hoist_survivor_support_vessel.mp4 4 25 rescue_basket      # DVIDS 315069: survivor hoisted from a support vessel, night of Apr 20-21 (vessel not named)
cut dvids/dvids315068_hh60_survivors_airsta_nola.mp4 3 25 medevac     # DVIDS 315068: injured crew at Air Station New Orleans, night of Apr 20-21
cut dvids/dvids315076_firefighting_sar.mp4 4 16 search_cutter   # DVIDS 315076: patrol boat searching, Apr 21
cut dvids/dvids85187_insitu_burn_may7.mp4 36 15 burn_may7             # DVIDS 85187: controlled burn, May 7, 2010 (DoD)
cut dvids/dvids83700_daytime_fire.mp4 24 16 day_deck                  # DVIDS 83700: the deck in flames, Apr 21
Y=jit/dvids91195_jit_2010-07-23.mp4                                    # DVIDS 91195: JIT hearing July 23 2010, part 3; Williams on camera from ~8:27
[ -s public/vid/w_sync1.mp4 ] || ffmpeg -v error -y -i $R/$Y -ss 533.98 -t 8.32 -an -c:v libx264 -crf 16 -preset fast -pix_fmt yuv420p public/vid/w_sync1.mp4
[ -s public/vid/w_sync2.mp4 ] || ffmpeg -v error -y -i $R/$Y -ss 556.33 -t 12.12 -an -c:v libx264 -crf 16 -preset fast -pix_fmt yuv420p public/vid/w_sync2.mp4
echo FILM_CLIPS_OK
[ -s public/vid/w_live.mp4 ] || ffmpeg -v error -y -i $R/$Y -ss 524 -t 44.4 -an -c:v libx264 -crf 16 -preset fast -pix_fmt yuv420p public/vid/w_live.mp4   # Williams on camera, continuous (8:44-9:28)
