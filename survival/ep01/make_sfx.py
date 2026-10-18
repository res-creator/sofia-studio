# Ep 1 sound effects + music beds via ElevenLabs sound generation (auth injected by proxy). Skips existing files.
import json, subprocess, os, time
D = os.path.dirname(os.path.abspath(__file__))
SFX = {
 'music': ('quirky comedic suspense music loop, playful pizzicato strings and soft low drums, sneaky cartoon tension', 22),
 'music2': ('dark comedic tension music loop, low plucked bass, ticking clock, cartoon suspense', 22),
 'slam': ('cinematic title slam hit with short whoosh', 1.5),
 'whoosh': ('fast cartoon whoosh', 0.8),
 'pop': ('soft short UI pop click', 0.5),
 'tv': ('tv news broadcast jingle under muffled anchor voice', 6),
 'crowd': ('panicked crowd in a supermarket, people shouting and arguing, shopping carts crashing', 8),
 'squeak': ('single rubber duck squeak', 0.8),
 'run': ('cartoon fast running footsteps', 2),
 'knock': ('three loud knocks on a wooden apartment door', 1.8),
 'chain': ('door chain lock and deadbolt sliding shut', 1.6),
 'rat': ('rat squeaking and scratching inside a metal vent', 3),
 'pigeon': ('pigeon cooing ominously', 3),
 'hiss': ('angry cat hiss and yowl', 2),
 'stamp': ('rubber stamp thud on paper', 0.6),
 'ding': ('cartoon success ding', 0.8),
 'bite': ('cartoon chomp bite sound', 0.8),
 'sting': ('comedic horror music sting, dramatic organ chord', 2.5),
 'wind': ('windy rooftop city ambience with distant sirens', 8),
 'room': ('quiet apartment room tone with faint fridge hum and distant sirens', 10),
}
for k, (txt, dur) in SFX.items():
    out = f'{D}/sfx/{k}.mp3'
    if os.path.exists(out): continue
    code = subprocess.run(['curl', '-s', '-m', '120', '-X', 'POST', 'https://api.elevenlabs.io/v1/sound-generation', '-H', 'Content-Type: application/json',
        '-d', json.dumps({'text': txt, 'duration_seconds': dur, 'prompt_influence': 0.5}), '-o', out, '-w', '%{http_code}'], capture_output=True, text=True).stdout
    if code != '200': print('fail', k, code, open(out).read()[:200]); os.remove(out)
    else: print('ok', k)
    time.sleep(3)
