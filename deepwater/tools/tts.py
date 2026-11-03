# Todd (project documentary voice; same model/settings as Lahaina), one request per line, sequential, 3 s apart.
# -> vo/<id>.mp3 + vo/<id>.words.json (word timings). Prev/next text passed for natural continuity.
import json, subprocess, base64, time, os, sys
V = 'g14YnDYCsy3k7XLlcKlO'
L = [[it[1], it[2]] for it in json.load(open('script/opening.json'))['seq'] if it[0] == 'vo']; only = set(sys.argv[1:])
for k, (i, text) in enumerate(L):
    out = f'vo/{i}'
    if (only and i not in only) or (not only and os.path.exists(out + '.words.json')): continue
    body = {"text": text, "model_id": "eleven_v4", "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True}}
    if k > 0: body['previous_text'] = L[k - 1][1]
    if k + 1 < len(L): body['next_text'] = L[k + 1][1]
    r = subprocess.run(['curl', '-s', '-m', '300', '-X', 'POST', f'https://api.elevenlabs.io/v1/text-to-speech/{V}/with-timestamps?output_format=mp3_44100_128',
                        '-H', 'xi-api-key: dummy', '-H', 'Content-Type: application/json', '--data-binary', '@-'], input=json.dumps(body).encode(), capture_output=True).stdout
    j = json.loads(r)
    if 'audio_base64' not in j: raise SystemExit(f'{i}: {str(j)[:300]}')
    open(out + '.mp3', 'wb').write(base64.b64decode(j['audio_base64']))
    a = j['alignment']; words = []; cur = ''; s = e = None
    for ch, t0, t1 in zip(a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']):
        if ch.isspace():
            if cur: words.append({'w': cur, 's': round(s, 3), 'e': round(e, 3)}); cur = ''
            continue
        if not cur: s = t0
        cur += ch; e = t1
    if cur: words.append({'w': cur, 's': round(s, 3), 'e': round(e, 3)})
    json.dump(words, open(out + '.words.json', 'w')); print(i, 'ok', words[-1]['e'], flush=True); time.sleep(3)
