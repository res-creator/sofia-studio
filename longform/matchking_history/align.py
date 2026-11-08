# Word timings for the Match King voice: faster-whisper word timestamps mapped onto the SCRIPT words (difflib), so names and numbers keep
# the script spelling. Writes vo/<id>.words.json = [[word, start, end], ...] and vo/check.txt (script vs heard, for QC). Usage: python3 align.py
import json, os, re, subprocess, difflib, numpy as np
from faster_whisper import WhisperModel
D = os.path.dirname(os.path.abspath(__file__)); L = json.load(open(f'{D}/vo/lines.json'))
m = WhisperModel('small.en', device='cpu', compute_type='int8'); norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
NUM = {'1880': 'eighteen eighty', '1908': 'nineteen oh eight', '1912': 'nineteen twelve', '1913': 'nineteen thirteen', '1917': 'nineteen seventeen', '1923': 'nineteen twenty three', '1925': 'nineteen twenty five',
       '1927': 'nineteen twenty seven', '1928': 'nineteen twenty eight', '1929': 'nineteen twenty nine', '1930': 'nineteen thirty', '1932': 'nineteen thirty two', '1933': 'nineteen thirty three', '1934': 'nineteen thirty four', '2022': 'twenty twenty two'}
chk = open(f'{D}/vo/check.txt', 'w'); total = 0
for i, text in L:
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{D}/vo/{i}.mp3', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32); dur = len(a) / 16000; total += dur
    segs, _ = m.transcribe(a, word_timestamps=True, language='en'); hw = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
    sw = text.split(); sn = [norm(NUM.get(re.sub(r'[^0-9]', '', w), w)) for w in sw]; hn = [norm(w[0]) for w in hw]
    out = [None] * len(sw); sm = difflib.SequenceMatcher(None, sn, hn, autojunk=False)
    for b in sm.get_matching_blocks():
        for k in range(b.size): out[b.a + k] = [sw[b.a + k], round(hw[b.b + k][1], 3), round(hw[b.b + k][2], 3)]
    # fill unmatched words by interpolation between known neighbours
    for k in range(len(sw)):
        if out[k] is None:
            p = next((out[j][2] for j in range(k - 1, -1, -1) if out[j]), 0.0); q = next((out[j][1] for j in range(k + 1, len(sw)) if out[j]), dur)
            out[k] = [sw[k], round(p, 3), round(max(p, q), 3)]
    json.dump(out, open(f'{D}/vo/{i}.words.json', 'w')); matched = sum(b.size for b in sm.get_matching_blocks())
    chk.write(f'{i} ({dur:.1f}s, matched {matched}/{len(sw)})\n  SCRIPT: {text}\n  HEARD:  {" ".join(w[0] for w in hw)}\n\n'); print(i, f'{dur:.1f}s', f'{matched}/{len(sw)}', flush=True)
print('total voice', round(total, 1), 's')
