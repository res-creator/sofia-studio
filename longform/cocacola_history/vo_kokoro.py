# TEMPORARY scratch voice (open-source Kokoro-82M, Apache-2.0, voice am_michael) so the film can be timed and finished while the
# owner's ElevenLabs quota is used up. Writes chapters/<ch>/vo/<id>.mp3 + <id>.align.json (ElevenLabs-style character timings)
# + vo/speech.json. Replace with Chris (vo_chris.py) and re-run build.sh: every animation cue follows the word timings.
# Usage: <venv>/bin/python vo_kokoro.py [chapter ...]
import json, os, sys, subprocess, numpy as np, soundfile as sf
from kokoro import KPipeline
D = os.path.dirname(os.path.abspath(__file__)); SR = 24000
pipe = KPipeline(lang_code='a')
chs = sys.argv[1:] or sorted(os.listdir(f'{D}/chapters'))
for ch in chs:
    cd = f'{D}/chapters/{ch}'; os.makedirs(f'{cd}/vo', exist_ok=True); SP = {}
    for L in json.load(open(f'{cd}/script.json')):
        audio, chars, t0s, t1s, off = [], [], [], [], 0.0
        for r in pipe(L['text'], voice='am_michael', speed=1.0):
            a = r.audio.numpy() if hasattr(r.audio, 'numpy') else np.asarray(r.audio)
            for tk in (r.tokens or []):
                s0 = tk.start_ts if tk.start_ts is not None else (t1s[-1] - off if t1s else 0); s1 = tk.end_ts if tk.end_ts is not None else s0 + 0.05
                txt = tk.text + (tk.whitespace or '')
                for i, c in enumerate(txt):
                    chars.append(c); u0 = s0 + (s1 - s0) * i / max(1, len(tk.text)); t0s.append(off + min(u0, s1)); t1s.append(off + min(s0 + (s1 - s0) * (i + 1) / max(1, len(tk.text)), s1))
            audio.append(a); off += len(a) / SR
        y = np.concatenate(audio); wav = f'{cd}/vo/{L["id"]}.wav'; sf.write(wav, y, SR)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ar', '44100', '-b:a', '160k', f'{cd}/vo/{L["id"]}.mp3'], check=True); os.remove(wav)
        json.dump({'characters': chars, 'character_start_times_seconds': t0s, 'character_end_times_seconds': t1s}, open(f'{cd}/vo/{L["id"]}.align.json', 'w'))
        nz = np.where(np.abs(y) > 0.01)[0]; SP[L['id']] = [round(nz[0] / SR, 3), round(nz[-1] / SR, 3)]
        print(ch, L['id'], round(len(y) / SR, 2), 's', flush=True)
    json.dump(SP, open(f'{cd}/vo/speech.json', 'w'), indent=0)
