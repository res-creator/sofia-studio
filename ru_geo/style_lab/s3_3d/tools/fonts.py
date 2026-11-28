"""Fonts (SIL OFL 1.1): Manrope 500 / 800 (Cyrillic) via the Google Fonts CSS API, subset to the Russian alphabet + digits/punctuation.
usage: python3 -I tools/fonts.py <s3_3d folder>"""
import os, re, sys, urllib.parse, urllib.request
D = sys.argv[1]; F = os.path.join(D, 'fonts'); os.makedirs(F, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'}
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read()
chars = ''.join(chr(c) for c in range(0x410, 0x450)) + 'Ёё' + '0123456789 .,:;!?·×–—-+%°«»()/≈²'
for w in (500, 800):
    css = get(f'https://fonts.googleapis.com/css2?family=Manrope:wght@{w}&text={urllib.parse.quote(chars)}').decode()
    open(os.path.join(F, f'Manrope-{w}-sub.woff2'), 'wb').write(get(re.search(r'url\((https://[^)]+)\)', css).group(1)))
print('fonts ok')
