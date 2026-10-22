"""python3 nar_take.py <ep>  ->  prints the ONE narrator take for ElevenLabs (all 8 narrator lines joined by 2 s breaks)
Paste it into ElevenLabs Text to Speech (voice Sarah, model Eleven Multilingual v2), download the mp3 as eps/<ep>/nar_all.mp3,
then run: python3 split_nar.py <ep>"""
import sys
from episodes_v2 import EP
lines = [l[2] for l in EP[sys.argv[1]]["lines"] if l[1] == "nar"]
txt = ' <break time="2.0s" /> '.join(lines)
print(txt); print(f"\n[{len(lines)} parts, {len(txt)} characters ~ {len(txt)} ElevenLabs credits]", file=sys.stderr)
