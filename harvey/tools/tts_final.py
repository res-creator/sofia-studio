# Harvey narration with the documentary voice Todd (ElevenLabs, same model/settings as Deepwater and Lahaina).
# One request at a time, ~3 s apart, through the agent proxy (key injected; never stored here). -> harvey/vo/<beat>_<part>.mp3 + .txt
# Usage: python3 tools/tts_final.py [ids...]   (lines whose saved text is unchanged are skipped)
import os, sys, json, time, subprocess, importlib.util
ROOT = os.path.abspath(os.path.dirname(__file__) + '/..'); OUT = ROOT + '/vo'; os.makedirs(OUT, exist_ok=True)
for k in ('FINAL_TMP', 'DOCS', 'PIPER_DIR'): os.environ.setdefault(k, '/tmp')
sp = importlib.util.spec_from_file_location('bf', ROOT + '/tools/build_final.py'); bf = importlib.util.module_from_spec(sp); sp.loader.exec_module(bf)
V = 'g14YnDYCsy3k7XLlcKlO'
L = [(f"{b['id']}_{j}", t) for b in bf.BEATS for j, (t, g) in enumerate(bf.vo_parts(b))]; only = set(sys.argv[1:])
for k, (i, text) in enumerate(L):
    p = f'{OUT}/{i}'
    if only and i not in only: continue
    if not only and os.path.exists(p + '.mp3') and open(p + '.txt').read() == text: continue
    body = {"text": text, "model_id": "eleven_v4", "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True}}
    if k > 0: body['previous_text'] = L[k - 1][1]
    if k + 1 < len(L): body['next_text'] = L[k + 1][1]
    for attempt in range(3):
        r = subprocess.run(['curl', '-s', '-m', '300', '-o', p + '.part', '-w', '%{http_code}', '-X', 'POST', f'https://api.elevenlabs.io/v1/text-to-speech/{V}?output_format=mp3_44100_128',
                            '-H', 'xi-api-key: dummy', '-H', 'Content-Type: application/json', '--data-binary', '@-'], input=json.dumps(body).encode(), capture_output=True).stdout.decode()
        if r == '200': break
        print(i, 'HTTP', r, open(p + '.part', 'rb').read()[:200], flush=True); time.sleep(6)
    else: raise SystemExit(f'failed {i}')
    os.replace(p + '.part', p + '.mp3'); open(p + '.txt', 'w').write(text); print(i, 'ok', len(text), flush=True); time.sleep(3)
