# ElevenLabs sound effects (key injected by the proxy, never stored). Max 2 requests at once, ~3 s apart.  python3 gen.py
import json, os, time, threading, urllib.request
D = os.path.dirname(os.path.abspath(__file__))
SFX = {
 'applause_short': ('TV studio audience applause, short burst, warm, indoor', 3),
 'applause_long': ('TV talk show studio audience applause and cheering, long, indoor', 6),
 'laugh_light': ('TV studio audience light laughter, chuckles, indoor sitcom audience', 3),
 'laugh_big': ('TV studio audience big laughter, roaring laugh, indoor sitcom', 4),
 'aww': ('TV studio audience sympathetic aww sound, soft collective awww, women', 2.5),
 'ooh': ('TV studio audience surprised oooh, collective amazed ooooh', 2.5),
 'boo': ('TV studio audience disapproving booing, short collective boo', 2.5),
 'whistle': ('single person wolf whistle in a TV studio audience', 1.5),
 'drumroll': ('snare drum roll building suspense, ends with a cymbal crash', 3),
 'clock': ('wall clock ticking slowly in a silent room', 3),
 'paper': ('newspaper rustling, pages shaking', 1.5),
 'crunch': ('crunchy bite of a fresh green leaf, crisp crunch', 1),
 'beep': ('loud TV censor bleep tone, 1000 Hz beep', 0.8),
 'sob': ('young woman sobbing softly, short tearful sob', 2),
 'underscore': ('soft emotional piano and strings underscore for a TV dating show, gentle and sad, no vocals', 12),
 'jingle': ('short upbeat TV dating show intro jingle, brass and strings, cheerful sting', 3),
 'whoosh': ('quick soft whoosh transition', 0.6),
}
def gen(name, text, dur):
    out = os.path.join(D, name + '.mp3')
    if os.path.exists(out): return
    req = urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation', data=json.dumps({'text': text, 'duration_seconds': dur, 'prompt_influence': .45}).encode(), headers={'Content-Type': 'application/json', 'xi-api-key': 'proxy'})
    for k in range(3):
        try: d = urllib.request.urlopen(req, timeout=180).read(); open(out, 'wb').write(d); print('ok', name, len(d), flush=True); return
        except Exception as e: print('err', name, e, flush=True); time.sleep(5)
sem = threading.Semaphore(2); th = []
for n, (tx, du) in SFX.items():
    sem.acquire(); t = threading.Thread(target=lambda n=n, tx=tx, du=du: (gen(n, tx, du), sem.release())); t.start(); th.append(t); time.sleep(3)
for t in th: t.join()
