# Draft voice (offline Kokoro) for a What-if episode: python3 whatif/tts_kokoro.py whatif/jupiter [voice]
# Writes <ep>/vo/<id>.wav. Final videos should use ElevenLabs (el.py) when credits are available.
import sys, json, subprocess, os
import soundfile as sf
from kokoro_onnx import Kokoro
ep = sys.argv[1]; voice = sys.argv[2] if len(sys.argv) > 2 else 'am_puck'
M = os.environ.get('KOKORO_DIR', '.')
k = Kokoro(f'{M}/kokoro-v1.0.int8.onnx', f'{M}/voices-v1.0.bin')
lines = json.loads(subprocess.check_output(['node', '-e', f"console.log(JSON.stringify(require('./{ep}/script.js')))"]))
os.makedirs(f'{ep}/vo', exist_ok=True)
for i, sc, text in lines:
    out = f'{ep}/vo/{i}.wav'
    if os.path.exists(out): continue
    s, sr = k.create(text, voice=voice, speed=1.12, lang='en-us')
    sf.write(out, s, sr); print(i, round(len(s) / sr, 2))
