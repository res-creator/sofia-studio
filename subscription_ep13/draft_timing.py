# DRAFT timing only (no audio): estimated per-character timings for script.json in the ElevenLabs alignment format -> vo_draft/,
# so the animation can be laid out and checked before the real voice exists. Pace calibrated on episode 11 (Chris, 0.065 s per
# character of speech) with pauses on punctuation. The final build never uses this: build.sh reads vo/ (real voice) only.
import json, os
D = os.path.dirname(os.path.abspath(__file__)); OUT = f'{D}/vo_draft'; os.makedirs(OUT, exist_ok=True)
PAUSE = {',': 0.16, '.': 0.32, '?': 0.32, '!': 0.3, ':': 0.24, '…': 0.4}
sp = {}
for L in json.load(open(f'{D}/script.json')):
    s = L['text'].replace('...', '…'); t = 0.05; st, en = [], []
    for ch in s:
        d = 0.0 if ch in '"“”' else 0.04 if ch == ' ' else 0.065
        st.append(round(t, 3)); t += d; en.append(round(t, 3)); t += PAUSE.get(ch, 0)
    json.dump({'characters': list(s), 'character_start_times_seconds': st, 'character_end_times_seconds': en}, open(f'{OUT}/{L["id"]}.align.json', 'w'))
    sp[L['id']] = [0.0, round(en[-1] + 0.08, 3)]
json.dump(sp, open(f'{OUT}/speech.json', 'w'), indent=0)
print('draft timing ok, speech total', round(sum(b - a for a, b in sp.values()), 2), 's')
