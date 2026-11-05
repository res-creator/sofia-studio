# FINAL voice: Chris (VOICE.md: ElevenLabs premade iP95p4xoKVk53GoZ742B, eleven_multilingual_v2, stability 0.35 / similarity 0.8 / style 0.55 / speaker boost / speed 0.95).
# Needs about 7,500 characters of ElevenLabs quota. Keys only via ELEVEN_API_KEYS (cloud: ELEVEN_API_KEYS=proxy). One request at a time, 3 s apart.
# Replaces chapters/<ch>/vo/<id>.mp3 + .align.json (the temporary Kokoro files are moved to vo_temp/), then rewrites vo/speech.json.
# After it: sh build_all.sh  (re-times every scene from the new word timings, re-renders, re-assembles).   Usage: python3 vo_chris.py [chapter ...]
import json, sys, base64, os, time, shutil, subprocess
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
import el
D = os.path.dirname(os.path.abspath(__file__)); VOICE = 'iP95p4xoKVk53GoZ742B'
chs = sys.argv[1:] or sorted(os.listdir(f'{D}/chapters'))
ALL = [L for ch in chs for L in json.load(open(f'{D}/chapters/{ch}/script.json'))]
for ch in chs:
    cd = f'{D}/chapters/{ch}'; LINES = json.load(open(f'{cd}/script.json')); os.makedirs(f'{cd}/vo_temp', exist_ok=True)
    for L in LINES:
        out = f"{cd}/vo/{L['id']}.mp3"; mark = out + '.chris'
        if os.path.exists(mark): continue
        i = ALL.index(L)
        body = json.dumps({'text': L['text'], 'model_id': 'eleven_multilingual_v2',
            'voice_settings': {'stability': 0.35, 'similarity_boost': 0.8, 'style': 0.55, 'use_speaker_boost': True, 'speed': 0.95},
            'previous_text': ' '.join(x['text'] for x in ALL[:i])[-400:], 'next_text': ALL[i + 1]['text'] if i + 1 < len(ALL) else ''})
        j = el._call(el.KEYS[0], f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128', body)
        if 'audio_base64' not in j: raise SystemExit(f"EL error {L['id']}: {str(j)[:300]}")
        for ext in ('.mp3', '.align.json'):
            p = out[:-4] + ext
            if os.path.exists(p): shutil.move(p, f"{cd}/vo_temp/{L['id']}{ext}")
        open(out, 'wb').write(base64.b64decode(j['audio_base64'])); json.dump(j['alignment'], open(out[:-4] + '.align.json', 'w')); open(mark, 'w').close()
        print(ch, L['id'], 'ok', flush=True); time.sleep(3)
    subprocess.run([sys.executable, f'{D}/speech.py', ch], check=True)
