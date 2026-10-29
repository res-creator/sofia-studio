# Word timings for vo/<id>.mp3 when the audio came without ElevenLabs alignment (generated through the ElevenLabs connector):
# local Whisper (faster-whisper small.en, word timestamps) times the spoken words, which are mapped in order onto the words of
# script.json, then written as vo/<id>.align.json in the ElevenLabs character format the engine reads. Also prints what Whisper heard,
# as a first speech-to-text check of every line. Usage: python3 -I vo_align.py
import json, os, re, difflib, wave, subprocess
import numpy as np
from faster_whisper import WhisperModel
D = os.path.dirname(os.path.abspath(__file__)); M = WhisperModel('small.en', device='cpu', compute_type='int8')
norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower().replace('’', "'"))
for L in json.load(open(f'{D}/script.json')):
    f = f"{D}/vo/{L['id']}.mp3"; wav = f[:-4] + '.tmp.wav'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f, '-ar', '16000', '-ac', '1', wav], check=True)
    w = wave.open(wav); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768; dur = w.getnframes() / 16000; w.close(); os.remove(wav)
    segs, _ = M.transcribe(a, beam_size=5, word_timestamps=True, initial_prompt=L['text'])
    heard = [x for s in segs for x in s.words]
    want = L['text'].split()
    # align script words to heard words (difflib on normalised forms); unmatched script words are interpolated
    hw = [norm(x.word) for x in heard]; sw = [norm(x) for x in want]; times = [None] * len(want)
    for op, a0, a1, b0, b1 in difflib.SequenceMatcher(None, sw, hw, autojunk=False).get_opcodes():
        if op in ('equal', 'replace'):
            for i in range(a0, a1):
                j = b0 + min(i - a0, b1 - b0 - 1) if b1 > b0 else None
                if j is not None: times[i] = [heard[j].start, heard[j].end]
    known = [i for i, x in enumerate(times) if x]
    for i in range(len(want)):
        if times[i] is None:
            p = max([k for k in known if k < i], default=None); n = min([k for k in known if k > i], default=None)
            t0 = times[p][1] if p is not None else 0.05; t1 = times[n][0] if n is not None else dur - 0.05; times[i] = [t0, max(t0 + 0.05, t1)]
    chars, st, en = [], [], []
    for i, (wd, (t0, t1)) in enumerate(zip(want, times)):
        if i: chars.append(' '); st.append(round(t0, 3)); en.append(round(t0, 3))
        for c_i, ch in enumerate(wd): u0, u1 = c_i / len(wd), (c_i + 1) / len(wd); chars.append(ch); st.append(round(t0 + (t1 - t0) * u0, 3)); en.append(round(t0 + (t1 - t0) * u1, 3))
    json.dump({'characters': chars, 'character_start_times_seconds': st, 'character_end_times_seconds': en}, open(f[:-4] + '.align.json', 'w'))
    got = ' '.join(x.word.strip() for x in heard); r = difflib.SequenceMatcher(None, sw, hw).ratio()
    print(f"{L['id']} {dur:5.2f}s match {r:.2f} | {got}")
