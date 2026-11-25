"""timeline.json from voice/*.wav + chapters.json: 0.45 s between paragraphs, +2.0 s before chapter openings, +1.4 s title after the cold open."""
import json, soundfile as sf, csv
C = json.load(open('chapters.json')); chapters = set(C['chapters'])
order = [r['id'] for r in csv.DictReader(open('SCRIPT_EN.csv', encoding='utf-8'))]
t = 0.9; tl = []
for pid in order:
    info = sf.info(f'voice/{pid}.wav'); d = info.frames / info.samplerate
    if pid in chapters: t += 2.0
    tl.append(dict(id=pid, start=round(t, 3), dur=round(d, 3))); t += d + 0.45
    if pid == C['title_after']: t += 1.4
json.dump(dict(paras=tl, voiceEnd=round(t + 0.4, 2), qcard=2.5, endscreen=15), open('timeline.json', 'w'), indent=0)
print('voice end %.1f min' % (t / 60))
