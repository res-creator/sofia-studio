"""Fonts for this film (all SIL Open Font License 1.1), via the Google Fonts CSS API, subset (&text=) to the whole
Russian alphabet, Latin, digits and punctuation:
  Pangolin 400 (felt-tip marker lettering, Cyrillic)       -> kit/fonts/Pangolin-sub.woff2
  Fira Sans Condensed 500 / 700 / 900 (tags, stamp, cards) -> kit/fonts/FiraSansCondensed-<w>-sub.woff2
  IBM Plex Mono 400 / 500 (typewriter cards, credit lines) -> kit/fonts/IBMPlexMono-<w>-sub.woff2
usage: python3 -I tools/fonts.py <film dir>
"""
import os, re, sys, urllib.parse, urllib.request
D = sys.argv[1]; F = os.path.join(D, 'kit', 'fonts'); os.makedirs(F, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'}
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read()
chars = (''.join(chr(c) for c in range(0x410, 0x450)) + 'Ёё' + ''.join(chr(c) for c in range(0x21, 0x7f))
         + ' ·×÷–—−≈→←↑↓«»“”„°²³½…№')
txt = urllib.parse.quote(chars)
def fetch(fam, w, out):
    css = get(f'https://fonts.googleapis.com/css2?family={fam.replace(" ", "+")}:wght@{w}&text={txt}').decode()
    data = get(re.search(r'url\((https://[^)]+)\)', css).group(1)); open(os.path.join(F, out), 'wb').write(data); print(out, len(data))
fetch('Pangolin', 400, 'Pangolin-sub.woff2')
for w in (500, 700, 900): fetch('Fira Sans Condensed', w, f'FiraSansCondensed-{w}-sub.woff2')
for w in (400, 500): fetch('IBM Plex Mono', w, f'IBMPlexMono-{w}-sub.woff2')
