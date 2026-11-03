#!/bin/sh
# Cut the selected source fragments (exact source timecodes) into public/vid; archive aspect is kept (no stretch, no crop).
cd "$(dirname "$0")/.."
R=assets/raw/usgs
cut() { ffmpeg -v error -y -ss $2 -t $3 -i $R/$1 -an -c:v libx264 -crf 16 -preset fast -pix_fmt yuv420p public/vid/$4.mp4; }
cutav() { ffmpeg -v error -y -ss $2 -t $3 -i $R/$1 -c:v libx264 -crf 16 -preset fast -pix_fmt yuv420p -c:a pcm_s16le public/vid/$4.mov; }
cut Date_Unk_Pre_1980_05_18_USGS_MSH_FW_Clip_9.mp4 124 14 aerial_crater      # summit crater from the air, before May 18
cut Date_Unk_Pre_1980_05_18_USGS_MSH_FW_Clip_14.mp4 3.5 10 crater_steam        # inside the summit crater, steam vents
cut Date_Unk_Pre_1980_05_18_USGS_MSH_FW_Clip_14.mp4 161 12 johnston_crater   # man USGS identifies as David Johnston
cut 1980_05_04_USGS_MSH_TL_Clip_7.mp4 18 8 tl_coldwater                     # time-lapse from Coldwater I, May 4
cut 1980_05_04_USGS_MSH_TL_Clip_7.mp4 45 9 tl_notes                         # handwritten field note in front of the camera
cut swanson_may18_broll.mp4 44 16 sw_column                                  # Swanson, May 18 ~9:30-12:30, wing + column
cut swanson_may18_broll.mp4 778 40 sw_mountain                               # Swanson, May 18, mountain + column
cutav corecast125_msh_1980.mp4 93.0 10.4 cc_banks                            # Norm Banks interview
cutav corecast125_msh_1980.mp4 118.5 6.3 cc_miller                           # Dan Miller interview
cutav corecast125_msh_1980.mp4 154.3 5.5 cc_swanson                          # Don Swanson interview
echo CLIPS_OK
