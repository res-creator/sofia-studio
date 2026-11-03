#!/bin/sh
# Fragments for the full film (exact source timecodes; USGS data release doi:10.5066/P94E623Y, CC0). Archive aspect kept.
cd "$(dirname "$0")/.."
R=assets/raw/usgs
cut() { [ -s public/vid/$4.mp4 ] || ffmpeg -v error -y -ss $2 -t $3 -i $R/$1 -an -c:v libx264 -crf 17 -preset fast -pix_fmt yuv420p public/vid/$4.mp4; }
M=1980_03_28_USGS_MSH_FW.mp4                           # March 28, 1980: ash cloud above the clouds (aerial)
cut $M 161 56 m28_plume; cut $M 15 16 m28_clouds
C7=Date_Unk_Pre_1980_05_18_USGS_MSH_FW_Clip_7.mp4        # before May 18: north flank from the air, Rick Hoblitt, slush flows
cut $C7 14 37 c7_flank; cut $C7 108 9 c7_hoblitt; cut $C7 116 24 c7_field; # (c7_slush removed: timecode was outside the clip)
C9=Date_Unk_Pre_1980_05_18_USGS_MSH_FW_Clip_9.mp4        # before May 18: summit crater and fractured north flank
cut $C9 140 20 c9_flank
A=1980_05_24-1980_05_26_Est_USGS_MSH_FW.mp4             # about May 24-26, 1980: after the eruption
cut $A 12 10 a24_heli; cut $A 104 9 a24_blowdown; cut $A 283 22 a24_phreatic; cut $A 343 35 a24_steam; cut $A 380 12 a24_logs; cut $A 395 11 a24_forest; cut $A 420 11 a24_camera; cut $A 434 14 a24_lake
B=1980_05_28_USGS_MSH_FW.mp4                            # May 28, 1980: blast zone, Spirit Lake, avalanche, scientists, Toutle
cut $B 9 13 a28_forest; cut $B 75 8 a28_heli; cut $B 95 11 a28_river; cut $B 125 16 a28_blowdown; cut $B 192 9 a28_lake; cut $B 243 26 a28_hummocks; cut $B 272 19 a28_sci; cut $B 300 18 a28_stumps; cut $B 370 15 a28_blowdown2; cut $B 448 15 a28_logs; cut $B 490 32 a28_toutle
S=swanson_may18_broll.mp4                               # May 18, ~9:30 a.m.-12:30 p.m., Don Swanson from a USGS aircraft
cut $S 1150 32 sw_flows; cut $S 836 26 sw_col2; cut $S 640 20 sw_col3
echo CLIPS2_OK
C4=Date_Unk_Pre_1980_05_18_USGS_MSH_FW_Clip_4.mp4     # before May 18: aerial, Spirit Lake (ice-covered) 1:36-1:47, north side 2:00-2:16
cut $C4 96 11 c4_lake; cut $C4 120 16 c4_mtn
