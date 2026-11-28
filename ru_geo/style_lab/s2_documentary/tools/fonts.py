"""Fonts (SIL OFL 1.1) via the Google Fonts CSS API, subset to Russian + digits + punctuation.
Cormorant Garamond 500 italic / 600 (serif titles), IBM Plex Mono 400 (readings). usage: python3 -I tools/fonts.py <dir>"""
import os, re, sys, urllib.parse, urllib.request
D = sys.argv[1]; F = os.path.join(D, 'fonts'); os.makedirs(F, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'}
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read()
chars = ''.join(chr(c) for c in range(0x410, 0x450)) + 'Ёё' + '0123456789 .,:;!?·×–—-+%°′″«»()/≈²' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
txt = urllib.parse.quote(chars)
for fam, spec, name in [('Cormorant+Garamond', 'ital,wght@0,500', 'serif-500'), ('Cormorant+Garamond', 'ital,wght@1,500', 'serif-500i'),
                        ('Cormorant+Garamond', 'ital,wght@0,600', 'serif-600'), ('IBM+Plex+Mono', 'wght@400', 'mono-400'), ('IBM+Plex+Mono', 'wght@300', 'mono-300')]:
    css = get(f'https://fonts.googleapis.com/css2?family={fam}:{spec}&text={txt}').decode()
    open(os.path.join(F, f'{name}.woff2'), 'wb').write(get(re.search(r'url\((https://[^)]+)\)', css).group(1)))
print('fonts ok')
