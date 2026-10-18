# Cruise Ship sound effects + one music bed via ElevenLabs sound generation (auth injected by the proxy). Skips existing files.
import json, subprocess, os, time
D = os.path.dirname(os.path.abspath(__file__))
SFX = {
 'phones': ('dozens of smartphones vibrating and emergency alert tones going off at the same time on an open deck', 4),
 'pachime': ('cruise ship public address chime, two tones', 1.5),
 'paclick': ('public address speaker click on with faint electrical hum, then click off', 3),
 'pabreath': ('quiet human breathing through a loudspeaker with hum, eerie', 4),
 'glass': ('tray of champagne glasses falling and shattering on a wooden deck', 1.5),
 'plate': ('ceramic plate sliding off a cart and clattering on carpet', 1.2),
 'fork': ('metal fork skittering along a carpeted corridor', 1),
 'steps': ('slow heavy shuffling footsteps on carpet, several people', 4),
 'timer': ('mechanical kitchen timer ringing loudly', 2.5),
 'muffle': ('ringing bell muffled under a towel and stopping', 1.2),
 'bangmetal': ('fists banging on a heavy steel door, muffled', 3),
 'scrape': ('slow fingernails scraping down a steel door', 3),
 'enginestop': ('large ship engine winding down and stopping, deep vibration fading', 5),
 'enginestart': ('huge ship diesel engine starting up deep below, rumble building', 5),
 'icemachine': ('loud ice machine grinding and dumping ice in a quiet room', 3),
 'drip': ('slow water dripping in a metal corridor', 4),
 'hatch': ('metal service hatch panel sliding open', 1.5),
 'crawl': ('knees and hands crawling inside a metal air duct, knocking', 4),
 'flare': ('flare gun hammer cocked, metallic click', 1),
 'beep': ('ship control console warning beep', 1),
 'override': ('electronic alarm tone, control system switching, ominous', 2.5),
 'stove': ('camping gas stove hissing and food sizzling softly', 4),
 'gulls': ('seagulls and gentle ocean waves at sunset', 6),
 'scream': ('distant scream echoing from below deck', 2),
 'warm': ('quiet warm melancholic piano and soft strings, slow, hopeful, loopable', 22),
}
os.makedirs(f'{D}/sfx', exist_ok=True)
for k, (txt, dur) in SFX.items():
    out = f'{D}/sfx/{k}.mp3'
    if os.path.exists(out): continue
    code = subprocess.run(['curl', '-s', '-m', '120', '-X', 'POST', 'https://api.elevenlabs.io/v1/sound-generation', '-H', 'Content-Type: application/json',
        '-d', json.dumps({'text': txt, 'duration_seconds': dur, 'prompt_influence': 0.5}), '-o', out, '-w', '%{http_code}'], capture_output=True, text=True).stdout
    if code != '200': print('fail', k, code, open(out).read()[:200], flush=True); os.remove(out)
    else: print('ok', k, flush=True)
    time.sleep(3)
