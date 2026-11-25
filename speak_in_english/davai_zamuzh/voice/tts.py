# Fish Audio TTS through the proxy (key injected by the proxy, never stored). Max 2 requests at once, ~3 s apart.
import json, sys, time, os, urllib.request, threading
def tts(text, ref, out):
    req = urllib.request.Request('https://api.fish.audio/v1/tts', data=json.dumps({'text': text, 'reference_id': ref, 'format': 'mp3'}).encode(), headers={'Content-Type': 'application/json', 'Authorization': 'Bearer proxy', 'model': 's2.1-pro-free'})
    for k in range(3):
        try: d = urllib.request.urlopen(req, timeout=180).read(); open(out, 'wb').write(d); print('ok', out, len(d), flush=True); return
        except Exception as e: print('retry', out, e, flush=True); time.sleep(5)
def run(jobs):   # jobs: [(text, ref, out)]
    sem = threading.Semaphore(2); th = []
    for j in jobs:
        sem.acquire(); t = threading.Thread(target=lambda j=j: (tts(*j), sem.release())); t.start(); th.append(t); time.sleep(3)
    for t in th: t.join()
if __name__ == '__main__':
    S = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'script.json'))); want = sys.argv[1:]
    D = os.path.dirname(os.path.abspath(__file__))
    TAG = {'l': '(laughing) ', 's': '(shouting) ', 'c': '(sad) ', 'w': '(whispering) '}
    L = [(l[0], l[1], l[2], l[3] if len(l) > 3 else '') for l in S['lines']]
    run([(TAG.get(st, '') + text, S['voices'][who], os.path.join(D, k + '.mp3')) for k, who, text, st in L if (k in want if want else not os.path.exists(os.path.join(D, k + '.mp3')))])
