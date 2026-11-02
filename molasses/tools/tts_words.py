# usage: python3 tools/tts_words.py VOICE_ID SPEED  -> vo/narration.mp3, vo/narration.align.json, vo/words.json
import json, subprocess, base64, sys
voice, speed = sys.argv[1], float(sys.argv[2])
text = open('vo/script.txt').read().strip()
body = json.dumps({"text": text, "model_id": "eleven_v4", "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True, "speed": speed}})
r = subprocess.run(['curl', '-s', '-m', '300', '-X', 'POST', f'https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128', '-H', 'xi-api-key: dummy', '-H', 'Content-Type: application/json', '--data-binary', '@-'], input=body.encode(), capture_output=True).stdout
j = json.loads(r)
if 'audio_base64' not in j: raise SystemExit(str(j)[:500])
open('vo/narration.mp3', 'wb').write(base64.b64decode(j['audio_base64']))
json.dump(j['alignment'], open('vo/narration.align.json', 'w'))
a = j['alignment']; words = []; cur = ''; s = e = None
for c, t0, t1 in zip(a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']):
    if c.isspace():
        if cur: words.append((cur, s, e)); cur = ''
        continue
    if not cur: s = t0
    cur += c; e = t1
if cur: words.append((cur, s, e))
json.dump([{"w": w, "s": round(s, 3), "e": round(e, 3)} for w, s, e in words], open('vo/words.json', 'w'), indent=0)
print(len(words), 'words, end', words[-1][2])
