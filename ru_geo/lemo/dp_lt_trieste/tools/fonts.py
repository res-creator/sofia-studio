"""Fonts for the light-table clip, fetched from Google Fonts (SIL OFL 1.1) into fonts/, subset to the characters film.js uses
(Cyrillic + ASCII): IBM Plex Sans 400/500, IBM Plex Mono 500, Noto Serif 600. usage: python -I tools/fonts.py <dir>"""
import sys, os, re, urllib.request, urllib.parse
D = sys.argv[1]
src = open(os.path.join(D, 'film.js'), encoding='utf-8').read()
extra = sorted(set(c for c in src if ord(c) > 126))
text = ''.join(chr(c) for c in range(32, 127)) + ''.join(extra)
print(len(extra), 'non-ASCII chars:', ''.join(extra))
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=60).read()
for fam, w, out in (('IBM Plex Sans', 400, 'IBMPlexSans-400.woff2'), ('IBM Plex Sans', 500, 'IBMPlexSans-500.woff2'),
                    ('IBM Plex Mono', 500, 'IBMPlexMono-500.woff2'), ('Noto Serif', 600, 'NotoSerif-600.woff2')):
    css = get('https://fonts.googleapis.com/css2?family=' + urllib.parse.quote(fam) + f':wght@{w}&text=' + urllib.parse.quote(text)).decode()
    urls = re.findall(r'url\((https://[^)]+)\)', css)
    assert len(urls) == 1, css[:400]
    data = get(urls[0]); open(os.path.join(D, 'fonts', out), 'wb').write(data)
    print(out, len(data), 'bytes')
open(os.path.join(D, 'fonts', 'OFL-notoserif.txt'), 'wb').write(get('https://raw.githubusercontent.com/google/fonts/main/ofl/notoserif/OFL.txt'))
