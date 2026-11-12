#!/usr/bin/env python3
"""Kokoro am_puck takes per paragraph (like the kit's kokoro_voice.py, without lead-in).
python3 kokoro_takes.py MODELS_DIR SCRIPT_EN.csv OUT_DIR [--lead] [ids...]
--lexicon FILE.json: {"Word": "IPA"} pronunciation fixes (e.g. {"Norilsk": "nɔːɹˈiːlsk"}); the text is phonemized and the word's phonemes replaced.
--speed X: base speed (default 1.05, the dub kits' value; documentaries use ~0.88).
--pause S: pause between sentences in seconds (kokoro default 0.25).
--lead: voice '<last sentence of previous paragraph> <this paragraph>' in one go and keep only this paragraph (fixes muffled starts).
Speed 1.05, retries +0.03 up to 1.12 if longer than max_duration_s. Writes OUT_DIR/<id>.wav (48 kHz) and prints a report."""
import csv, re, sys, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
from scipy.signal import resample_poly
M, CSV, OUT = sys.argv[1:4]; os.makedirs(OUT, exist_ok=True)
k = Kokoro(os.path.join(M, 'kokoro-v1.0.onnx'), os.path.join(M, 'voices-v1.0.bin'))
LEAD = '--lead' in sys.argv; sys.argv = [a for a in sys.argv if a != '--lead']
BASE = 1.05
if '--speed' in sys.argv:
    j = sys.argv.index('--speed'); BASE = float(sys.argv[j + 1]); del sys.argv[j:j + 2]
if '--pause' in sys.argv:
    j = sys.argv.index('--pause'); _P = float(sys.argv[j + 1]); del sys.argv[j:j + 2]
    _c0 = k.create
    def _pause_create(text, **kw):
        kw.setdefault('sentence_pause', _P); return _c0(text, **kw)
    k.create = _pause_create
LEX = {}
if '--lexicon' in sys.argv:
    j = sys.argv.index('--lexicon'); import json; LEX = json.load(open(sys.argv[j + 1], encoding='utf-8')); del sys.argv[j:j + 2]
    _create = k.create
    def _lex_create(text, **kw):
        ph = k.tokenizer.phonemize(text, 'en-us')
        for w, ipa in LEX.items():
            ph = ph.replace(k.tokenizer.phonemize(w, 'en-us').strip(), ipa)
        return _create(ph, is_phonemes=True, **kw)
    k.create = _lex_create
rows = list(csv.DictReader(open(CSV, encoding='utf-8'))); ids = sys.argv[4:] or [r['id'] for r in rows]; by = {r['id']: r for r in rows}
def take(t, sp):
    x, sr = k.create(t, voice='am_puck', speed=sp, lang='en-us'); x = resample_poly(np.asarray(x, np.float32), 48000, sr)
    i = np.where(np.abs(x) > 0.004 * np.abs(x).max())[0]; return x[max(0, i[0] - 1440):i[-1] + 5760]
order = [r['id'] for r in rows]
def clean(t): return re.sub(r'\[[^\]]*\]\s*', '', t).strip()
def leadin(t, pid, sp):
    k_ = order.index(pid); prev = clean(by[order[k_ - 1]]['english_narration']) if k_ else 'Hello.'
    s_ = [p for p in re.split(r'(?<=[.!?])\s+', prev) if p]; lead = s_[-1] if s_ else 'Hello.'
    def raw(z):
        x, sr = k.create(z, voice='am_puck', speed=sp, lang='en-us'); x = resample_poly(np.asarray(x, np.float32), 48000, sr)
        i = np.where(np.abs(x) > 0.004 * np.abs(x).max())[0]; return x[i[0]:i[-1] + 12000]
    xl = raw(lead); xf = raw(lead + ' ' + t); b = len(xl) - 12000
    a0, a1 = max(0, b - 12000), min(len(xf) - 480, b + 16800)
    e = np.array([np.sqrt((xf[i:i + 480] ** 2).mean()) for i in range(a0, a1, 120)]); cut = a0 + 120 * int(np.argmin(e))
    x = xf[cut:]; i = np.where(np.abs(x) > 0.004 * np.abs(x).max())[0]; return x[max(0, i[0] - 1440):i[-1] + 5760]
bad = []
for pid in ids:
    r = by[pid]; t = re.sub(r'\[[^\]]*\]\s*', '', r['english_narration']).strip(); mx = float(r['max_duration_s']); sp = BASE
    while True:
        x = leadin(t, pid, sp) if LEAD else take(t, sp); d = len(x) / 48000
        if d <= mx or sp >= 1.12 - 1e-6: break
        sp = round(min(1.12, sp + 0.03), 2)
    f = int(0.012 * 48000); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    sf.write(os.path.join(OUT, pid + '.wav'), x / np.abs(x).max() * 0.89, 48000, subtype='PCM_24')
    flag = ' TOO LONG' if d > mx else ''
    if flag: bad.append(pid)
    print('%s %5.2f / %5.2f speed %.2f%s' % (pid, d, mx, sp, flag), flush=True)
print('done', len(ids), 'too long:', ' '.join(bad) or 'none')
