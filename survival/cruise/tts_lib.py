# Shared ElevenLabs voice table and tts() for the cruise episode and the full pilot.
import json, sys, base64, subprocess, os, time, shutil
D = os.path.dirname(os.path.abspath(__file__))
VOICES = {
  'N':   ('nPczCjzI2devNBz1zQrb', 'eleven_multilingual_v2', {"stability": 0.5, "similarity_boost": 0.8, "style": 0.3, "use_speaker_boost": True}),  # Brian (same settings as the pilot)
  'R':   ('hpp4J3VqNfWAUOO0d1Us', 'eleven_multilingual_v2', {"stability": 0.55, "similarity_boost": 0.8, "style": 0.15}),  # Bella - Rosa Okafor
  'CAP': ('pqHfZKP75CvOlQylNhV4', 'eleven_multilingual_v2', {"stability": 0.6, "similarity_boost": 0.8, "style": 0.1}),   # Bill - the captain on the PA
  'CG':  ('pNInz6obpgDQGcFmaJgB', 'eleven_multilingual_v2', {"stability": 0.7, "similarity_boost": 0.7}),                 # Adam - Coast Guard (radio filter in mix)
  'B':   ('cjVigY5qzO86Huf0OWal', 'eleven_multilingual_v2', {"stability": 0.7, "similarity_boost": 0.8, "style": 0.05}),  # Eric - the voice on the bridge
}
def tts(who, text, out):
    vid, model, vs = VOICES[who]
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128"
    r = subprocess.run(['curl', '-s', '-m', '180', '-X', 'POST', url, '-H', 'Content-Type: application/json', '--data-binary', '@-'],
                       input=json.dumps({"text": text, "model_id": model, "voice_settings": vs}).encode(), capture_output=True).stdout
    j = json.loads(r)
    if 'audio_base64' not in j: raise SystemExit(f'EL error {out}: {str(j)[:300]}')
    open(out, 'wb').write(base64.b64decode(j['audio_base64'])); json.dump(j['alignment'], open(out[:-4] + '.align.json', 'w'))
