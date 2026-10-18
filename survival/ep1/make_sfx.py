# Ep1 sound effects + extra music beds via ElevenLabs sound generation (auth injected by the proxy). Skips existing files.
import json, subprocess, os, time
D = os.path.dirname(os.path.abspath(__file__))
SFX = {
 'crowd': ('panicked crowd in a supermarket, people shouting, shopping carts crashing, alarm beeping', 8),
 'tvnews': ('urgent tv news broadcast jingle with muffled news anchor voice', 5),
 'fridge': ('refrigerator door opening with a suction pop and a soft electric hum', 2),
 'creak': ('slow creaking wooden floorboard at night', 1.5),
 'scratch': ('slow fingernails scratching on a wooden door, creepy', 4),
 'stepsaway': ('slow footsteps walking away down a hallway', 3),
 'canroll': ('metal tin can falling and rolling down concrete stairs', 3),
 'clang': ('loud metal clang and rattle inside a ventilation duct', 1.5),
 'radio': ('walkie talkie radio static crackle and squelch', 3),
 'wind': ('windy rooftop city ambience with distant police sirens', 10),
 'meow': ('creepy low cat meow', 1.5),
 'growl': ('zombie growl and groan, raspy', 3),
 'slamdoor': ('wooden apartment door slammed shut hard', 1.2),
 'metaldoor': ('heavy metal door slammed shut with echo', 1.5),
 'bite': ('cartoon chomp bite with cat yowl', 1),
 'stamp': ('rubber stamp thud on paper', 0.6),
 'ding': ('cartoon success ding', 0.8),
 'sting': ('comedic horror music sting, dramatic organ chord', 2.5),
 'heartbeat': ('slow heavy heartbeat thumps', 4),
 'breath': ('heavy nervous male breathing in a quiet room', 4),
 'zip': ('backpack zipper zipped quickly', 1),
 'spray': ('spray paint can shaking and spraying', 2),
 'boing': ('rubber toy bouncing off a wall, cartoon boing', 1),
 'crash': ('metal shopping cart crashing into a person and falling over', 2),
 'tick': ('clock ticking in a silent room', 3),
 'thud': ('body falling on the floor thud', 0.8),
 'hit': ('deep cinematic impact boom', 2),
 'riser': ('short tense horror riser', 2.5),
 'music3': ('tense horror underscore loop, slow pulsing synth bass, low strings, suspense', 22),
 'music4': ('upbeat quirky comedic chase music loop, fast pizzicato strings and drums', 15),
 'musicbox': ('eerie slow music box melody, creepy lullaby', 14),
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
