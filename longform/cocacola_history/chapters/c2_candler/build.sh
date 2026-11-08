cd "$(dirname "$0")"
node episode.js cues && python3 mix.py && node episode.js srt seg.srt && node episode.js video seg_video.mp4
