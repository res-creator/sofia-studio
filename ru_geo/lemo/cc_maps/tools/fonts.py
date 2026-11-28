"""Fonts for this film (SIL Open Font License 1.1): Fira Sans Condensed 500 / 600 (Cyrillic), via the Google Fonts CSS API,
subset (&text=) to the whole Russian alphabet, digits and the punctuation the film draws.
usage: python3 -I <film>/tools/fonts.py <film>
"""
import os, re, sys, urllib.parse, urllib.request
D = sys.argv[1]; F = os.path.join(D, 'fonts'); os.makedirs(F, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'}
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read()
chars = ''.join(chr(c) for c in range(0x410, 0x450)) + 'Ёё' + '0123456789 .,:;!?·×–—-+%°′″«»()/≈?²'
txt = urllib.parse.quote(chars)
for w in (500, 600):
    css = get(f'https://fonts.googleapis.com/css2?family=Fira+Sans+Condensed:wght@{w}&text={txt}').decode()
    open(os.path.join(F, f'FiraSansCondensed-{w}-sub.woff2'), 'wb').write(get(re.search(r'url\((https://[^)]+)\)', css).group(1)))
print('fonts ok:', len(chars), 'characters')
