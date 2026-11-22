#!/usr/bin/env python3
"""python3 tools/build_film.py <папка_фильма> -> <папка>/film.json
Берёт vo_clone/segments.json и абзацные wav, находит паузы (ffmpeg silencedetect), делит абзац на предложения и субтитры (≤38 знаков)."""
import hashlib, json, os, re, subprocess, sys
J = os.path.abspath(sys.argv[1]); O = f'{J}/vo_clone'
segs = json.load(open(f'{O}/segments.json', encoding='utf8'))
def speech_intervals(wav, dur):
    r = subprocess.run(['ffmpeg', '-i', wav, '-af', 'silencedetect=noise=-34dB:d=0.14', '-f', 'null', '-'], capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', r)]; ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', r)]
    sil = []; 
    for i, s in enumerate(starts): sil.append((s, ends[i] if i < len(ends) else dur))
    iv = []; cur = 0.0
    for s, e in sil:
        if s - cur > 0.08: iv.append([cur, s])
        cur = e
    if dur - cur > 0.08: iv.append([cur, dur])
    return iv or [[0, dur]]
def split_sent(t):
    parts = re.split(r'(?<=[.!?…])\s+(?=[«"А-ЯЁA-Z\[])', t.strip()); return [p for p in parts if p]
def chunks(s, mx=38):
    w = s.split(); out = []; cur = ''
    for x in w:
        if cur and len(cur) + 1 + len(x) > mx: out.append(cur); cur = x
        else: cur = (cur + ' ' + x).strip()
        if cur and re.search(r'[,:;]$', cur) and len(cur) > 16: out.append(cur); cur = ''
    if cur: out.append(cur)
    # merge tiny tail
    if len(out) > 1 and len(out[-1]) < 9:
        tail = out.pop(); out[-1] += ' ' + tail
    return out
film = {'fps': 30, 'segs': [], 'total': 0}
vidx = 0
for s in segs:
    if s['kind'] == 'chapter': film['segs'].append(dict(kind='chapter', t=s['t'], title=s['title'])); continue
    h = hashlib.md5(s['text'].encode()).hexdigest()[:10]; wav = f'{O}/c/{h}.wav'; dur = s['dur']
    iv = speech_intervals(wav, dur); V = sum(e - b for b, e in iv)
    sents = split_sent(s['text']); L = [len(x) for x in sents]; T = sum(L); caps = []; acc = 0
    def real(v):  # voiced-time -> time in paragraph
        for b, e in iv:
            if v <= e - b: return b + v
            v -= e - b
        return iv[-1][1]
    for sn, ln in zip(sents, L):
        v0 = V * acc / T; acc += ln; v1 = V * acc / T; a0, a1 = real(v0), real(v1) if v1 < V else iv[-1][1]
        cs = chunks(sn); cl = [len(c) for c in cs]; ct = sum(cl); c0 = a0
        for c, l in zip(cs, cl):
            c1 = c0 + (a1 - a0) * l / ct; caps.append([round(s['t'] + c0, 2), round(s['t'] + c1, 2), c]); c0 = c1
    film['segs'].append(dict(kind='voice', i=vidx, t=s['t'], dur=dur, text=s['text'], captions=caps)); vidx += 1
last = segs[-1]; film['total'] = round(last['t'] + last.get('dur', 0) + 1.5, 2)
json.dump(film, open(f'{J}/film.json', 'w'), ensure_ascii=False, indent=1)
print(J, 'segs', len(film['segs']), 'voice', vidx, 'total', film['total'])
