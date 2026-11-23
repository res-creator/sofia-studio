#!/usr/bin/env python3
"""Fish Audio voiceover per paragraph, cloned from a reference clip (no saved voice model needed).

Usage (inside a film folder with SCRIPT_EN.csv, or any CSV with columns id, english_narration/text, max_duration_s, delivery_notes):
  export FISH_API_KEY=...            # your key from fish.audio -> Developers. Never write it into files or git.
  python3 fish_voice.py --ref ref.mp3 --ref-text ref_text.txt --csv SCRIPT_EN.csv --out voice_raw [--model s2.1-pro-free] [--ids F001 F002]
Then: python3 master_voice.py (voice_raw -> voice), python3 onset_check.py, python3 place_voice.py.

- ref.mp3: 1-3 min of clean voice, no music. ref_text.txt: the EXACT words spoken in ref.mp3 (no tags).
- The first [tag] of delivery_notes (e.g. [warm], [amused]) is sent as an emotion cue; other notes are never spoken.
- Reports length vs max_duration_s; too-long lines must be shortened in the CSV (and subtitles), then re-run with --ids.
Needs: pip install ormsgpack numpy; ffmpeg.
"""
import argparse, csv, os, re, ssl, subprocess, sys, time, urllib.request
import numpy as np, ormsgpack
ap = argparse.ArgumentParser()
ap.add_argument('--ref', required=True); ap.add_argument('--ref-text', required=True)
ap.add_argument('--csv', default='SCRIPT_EN.csv'); ap.add_argument('--out', default='voice_raw')
ap.add_argument('--model', default='s2.1-pro-free'); ap.add_argument('--ids', nargs='*')
ap.add_argument('--text-col', default=None)
A = ap.parse_args()
KEY = os.environ.get('FISH_API_KEY', 'proxy-injected')
REF = open(A.ref, 'rb').read(); REF_TEXT = open(A.ref_text, encoding='utf-8').read().strip()
ctx = ssl.create_default_context(cafile=os.environ.get('SSL_CERT_FILE')) if os.environ.get('SSL_CERT_FILE') else None
rows = list(csv.DictReader(open(A.csv, encoding='utf-8'))); os.makedirs(A.out, exist_ok=True)
col = A.text_col or ('english_narration' if 'english_narration' in rows[0] else 'text')
def tts(text, out):
    body = {"text": text, "format": "mp3", "mp3_bitrate": 192, "references": [{"audio": REF, "text": REF_TEXT}]}
    req = urllib.request.Request("https://api.fish.audio/v1/tts", data=ormsgpack.packb(body), method="POST",
          headers={"Authorization": "Bearer " + KEY, "content-type": "application/msgpack", "model": A.model})
    for k in range(4):
        try: open(out, 'wb').write(urllib.request.urlopen(req, timeout=300, context=ctx).read()); return
        except urllib.error.HTTPError as e:
            msg = e.read()[:300]
            if e.code in (429, 500, 502, 503) and k < 3: time.sleep(5 * (k + 1)); continue
            sys.exit('Fish Audio error %s: %s' % (e.code, msg))
def dur(p):
    x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
    i = np.where(np.abs(x) > 10 ** (-50 / 20))[0]; return (i[-1] - i[0]) / 48000 + 0.15 if len(i) else 0
bad = []
for r in rows:
    if A.ids and r['id'] not in A.ids: continue
    t = re.sub(r'\[[^\]]*\]\s*', '', r[col]).strip()
    tag = re.match(r'\[([^\]]*)\]', r.get('delivery_notes', '') or '')
    out = os.path.join(A.out, r['id'] + '.mp3'); tts(('[' + tag.group(1) + '] ' if tag else '') + t, out)
    d = dur(out); mx = float(r.get('max_duration_s') or 1e9); flag = ' TOO LONG' if d > mx else ''
    if flag: bad.append(r['id'])
    print('%s %5.2f / %s%s' % (r['id'], d, r.get('max_duration_s', '-'), flag), flush=True)
print('done; too long:', ' '.join(bad) or 'none')
