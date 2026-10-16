# Real ElevenLabs voices for Ep4 (key comes from the environment's network secret, see el.py).
# python3 ep4/voice_el.py [lines_all.json] -> ep4/vo/<id>.mp3 (+align), ep4/vo/<id>.wav (trimmed, used by audio.py), ep4/vo/vo.json
# Skips lines whose mp3 already exists. One request at a time, ~3 s apart (owner's limit: max 2 at once).
import json, sys, os, time, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import el
D = os.path.dirname(os.path.abspath(__file__)); SR = 44100
LJ = sys.argv[1] if len(sys.argv) > 1 else f'{D}/lines_all.json'
V2 = 'eleven_multilingual_v2'; T4 = 'eleven_v4_turbo'
VOICE = {  # who: (voice id, model, settings)
    'sofia': ('cgSgspJ2msm6clMCkdW9', 'eleven_v3', {"stability": 0.5, "similarity_boost": 0.8}),                  # Jessica
    'gus':   ('JBFqnCBsd6RMkjVDRZzb', V2, {"stability": 0.75, "similarity_boost": 0.8, "style": 0.1, "speed": 0.85}),  # George
    'rose':  ('pFZP5JQG7iQjIQuC4Bku', T4, {"stability": 0.5, "similarity_boost": 0.8, "style": 0.3, "speed": 0.92}),   # Lily
    'tom':   ('bIHbv24MWmeRgasZH58o', T4, {"stability": 0.5, "similarity_boost": 0.8, "style": 0.3}),                   # Will
    'dan':   ('nPczCjzI2devNBz1zQrb', T4, {"stability": 0.55, "similarity_boost": 0.8, "style": 0.2}),                  # Brian
    'phone': ('EXAVITQu4vr4xnSDxMaL', T4, {"stability": 0.9, "similarity_boost": 0.8, "style": 0.0}),                   # Sarah, recorded message
}
# eleven_v3 emotion tags for Sofia (sent to the API only; subtitles use the clean text)
TAGS = {'i05': '[deadpan] ', 'a05': '[sighs] ', 'e01': '[cheerful] ', 'e02': '[worried] ', 'e04': '[groans] ',
        'e05': '[nervous] ', 'e11': '[confused] ', 'e17': '[excited] ', 'f02': '[shouting] ', 'f04': '[upset] ',
        'f06': '[sighs] ', 'f08': '[proud] ', 'o01': '[cheerful] ', 'p11': '[curious] '}
def load(f): return np.frombuffer(subprocess.check_output(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']), np.float32).copy()
def write_wav(a, f): subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', f], input=a.astype(np.float32).tobytes(), check=True)
P = f'{D}/vo/vo.json'; out = json.load(open(P)) if os.path.exists(P) else {}
for lid, who, text in json.load(open(LJ)):
    mp3 = f'{D}/vo/{lid}.mp3'
    if not os.path.exists(mp3):
        v, model, vs = VOICE[who]; vs = dict(vs); speed = vs.pop('speed', None)
        el.tts(v, TAGS.get(lid, '') + text, mp3, model=model, vs=vs, speed=speed); time.sleep(3)
    if lid in out and out[lid].get('src') == 'el' and out[lid]['text'] == text: continue
    a = load(mp3); nz = np.where(np.abs(a) > 0.01)[0]; off = max(0, nz[0] - 600); a = a[off: nz[-1] + 1200]
    words = None  # real word timings from the ElevenLabs alignment (tags like [sighs] dropped), relative to the trimmed wav
    al = f'{D}/vo/{lid}.align.json'
    if os.path.exists(al):
        A = json.load(open(al)); ws, cur = [], None
        for ch, s0, s1 in zip(A['characters'], A['character_start_times_seconds'], A['character_end_times_seconds']):
            if ch.isspace():
                if cur: ws.append(cur); cur = None
            elif cur is None: cur = [ch, s0, s1]
            else: cur[0] += ch; cur[2] = s1
        if cur: ws.append(cur)
        ws = [w for w in ws if not (w[0].startswith('[') and w[0].endswith(']'))]
        if [w[0] for w in ws] == text.split():
            words = [[w[0], round(max(0, w[1] - off / SR), 3), round(max(0, w[2] - off / SR), 3)] for w in ws]
    if who == 'phone':  # telephone band
        import scipy.signal as sg; b_, a_ = sg.butter(2, [400 / (SR / 2), 3200 / (SR / 2)], 'band'); a = sg.lfilter(b_, a_, a).astype(np.float32)
    write_wav(a, f'{D}/vo/{lid}.wav')
    hop = SR // 30; env = [float(np.sqrt(np.mean(a[i:i + hop] ** 2))) for i in range(0, len(a), hop)]
    m = max(env) or 1; out[lid] = {'who': who, 'text': text, 'dur': len(a) / SR, 'env': [round(e / m, 3) for e in env], 'src': 'el', 'words': words}
    json.dump(out, open(P, 'w')); print(lid, who, round(len(a) / SR, 2), flush=True)
