import json, subprocess, time, os
S = {
 'jingle': ("Short upbeat 1990s TV sitcom theme jingle, brass and xylophone fanfare, cheerful, ends with a big final hit", 3.5),
 'sneak': ("Cartoon sneaking tiptoe pizzicato strings, quiet comic", 4.5),
 'chime': ("Smart appliance power on chime, friendly two-note electronic ding", 1.0),
 'buzzer': ("Electronic access denied buzzer, two short low beeps, comic", 1.0),
 'pop': ("Cartoon pop with a quick whoosh, disguise appears", 0.6),
 'yank': ("Plug yanked out of wall socket, electric zap and power down whine, appliances shut off", 1.5),
 'boot': ("Robotic computer reboot sound, ominous low hum, red light turns on", 1.6),
 'click': ("Light switch click, then fluorescent lights flicker on", 1.0),
 'door': ("Refrigerator door opening with a soft suction pop and a happy ding", 1.2),
 'trombone': ("Sad trombone, wah wah wah waaah, comedic failure", 3.0),
 'laugh': ("Small studio audience laughing, sitcom laugh track, short", 2.5),
}
for k, (text, d) in S.items():
    out = f'sfx/{k}.mp3'
    if os.path.exists(out): continue
    body = json.dumps({"text": text, "duration_seconds": d, "prompt_influence": 0.5})
    subprocess.run(['curl', '-sS', '-m', '120', '-X', 'POST', 'https://api.elevenlabs.io/v1/sound-generation', '-H', 'xi-api-key: proxy', '-H', 'Content-Type: application/json', '-d', body, '-o', out])
    print(k, os.path.getsize(out), flush=True); time.sleep(1)
