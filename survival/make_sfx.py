# Sound effects via ElevenLabs sound generation (auth injected by proxy). Skips files that exist.
import json, subprocess, os, time
D = os.path.dirname(os.path.abspath(__file__))
SFX = {
 'waves': ('calm open ocean waves ambience, gentle wind', 10),
 'horn': ('distant deep cruise ship horn blast', 4),
 'buzz': ('emergency phone alert alarm tone with strong vibration buzz', 2.5),
 'pa': ('ship intercom announcement crackle then sudden static cut off click', 2),
 'groan': ('several distant zombie groans echoing in a long hallway', 6),
 'whoosh': ('short fast cinematic whoosh', 1),
 'cart': ('metal kitchen trolley rolling on tile floor, rattling', 3),
 'bang': ('three heavy violent pounds on a steel door, metallic boom', 3),
 'engine': ('huge ship engine starting below, deep mechanical rumble building up', 7),
 'drone': ('dark tense cinematic ambient drone, low pulsing synth, suspense underscore, no melody', 22),
 'boom': ('deep cinematic boom impact hit', 2.5),
 'pop': ('soft short UI pop click', 0.5),
}
for k, (txt, dur) in SFX.items():
    out = f'{D}/sfx/{k}.mp3'
    if os.path.exists(out): continue
    code = subprocess.run(['curl', '-s', '-m', '120', '-X', 'POST', 'https://api.elevenlabs.io/v1/sound-generation', '-H', 'Content-Type: application/json',
        '-d', json.dumps({'text': txt, 'duration_seconds': dur, 'prompt_influence': 0.5}), '-o', out, '-w', '%{http_code}'], capture_output=True, text=True).stdout
    if code != '200': print('fail', k, code, open(out).read()[:200]); os.remove(out)
    else: print('ok', k)
    time.sleep(3)
