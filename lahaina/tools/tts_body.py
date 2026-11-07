# Todd (eleven_v4, same settings as the hook), one request per chapter, sequential, 3 s apart -> vo/<ch>.mp3 + .words.json
import json, subprocess, base64, time, os, sys
V = 'g14YnDYCsy3k7XLlcKlO'
chs = json.load(open('script/body.json'))
only = set(sys.argv[1:])
for c in chs:
    if only and c['ch'] not in only: continue
    out = f"vo/{c['ch']}"
    if os.path.exists(out + '.words.json') and not only: print('skip', c['ch']); continue
    text = '\n'.join(t for _, t in c['lines'])
    body = json.dumps({"text": text, "model_id": "eleven_v4", "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True}})
    r = subprocess.run(['curl', '-s', '-m', '400', '-X', 'POST', f'https://api.elevenlabs.io/v1/text-to-speech/{V}/with-timestamps?output_format=mp3_44100_128', '-H', 'xi-api-key: dummy', '-H', 'Content-Type: application/json', '--data-binary', '@-'], input=body.encode(), capture_output=True).stdout
    j = json.loads(r)
    if 'audio_base64' not in j: raise SystemExit(f"{c['ch']}: {str(j)[:300]}")
    open(out + '.mp3', 'wb').write(base64.b64decode(j['audio_base64']))
    a = j['alignment']; words = []; cur = ''; s = e = None
    for ch, t0, t1 in zip(a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']):
        if ch.isspace():
            if cur: words.append([cur, s, e]); cur = ''
            continue
        if not cur: s = t0
        cur += ch; e = t1
    if cur: words.append([cur, s, e])
    ids = [i for i, t in c['lines'] for _ in t.split()]
    assert len(ids) == len(words), (c['ch'], len(ids), len(words))
    json.dump([{'w': w, 's': round(s, 3), 'e': round(e, 3), 'line': i} for (w, s, e), i in zip(words, ids)], open(out + '.words.json', 'w'), indent=0)
    print(c['ch'], 'ok', round(words[-1][2], 1), 's', flush=True)
    time.sleep(3)
