# Find a phrase on a PDF page and print its box as page fractions [x0,y0,x1,y1]; render the page to public/doc/<name>.jpg
# usage: python3 tools/docbox.py <pdf> <pdfpage> "<first words>" "<last words>" <name>
import sys, subprocess, re, html
pdf, pg, a, b, name = sys.argv[1], int(sys.argv[2]), sys.argv[3].split(), sys.argv[4].split(), sys.argv[5]
x = subprocess.run(['pdftotext', '-f', str(pg), '-l', str(pg), '-bbox', pdf, '-'], capture_output=True, text=True).stdout
W, H = map(float, re.search(r'<page width="([\d.]+)" height="([\d.]+)"', x).groups())
ws = [(html.unescape(m[4]), *map(float, m[:4])) for m in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)</word>', x)]
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
def find(seq, start=0):
    for i in range(start, len(ws) - len(seq) + 1):
        if all(norm(ws[i + j][0]) == norm(seq[j]) for j in range(len(seq))): return i
    raise SystemExit(f'not found: {seq}')
i = find(a); j = find(b, i) + len(b) - 1
sel = ws[i:j + 1]
box = [min(w[1] for w in sel) / W, min(w[2] for w in sel) / H, max(w[3] for w in sel) / W, max(w[4] for w in sel) / H]
# full text lines may extend left of the first word: extend x to the column of all selected lines
print(name, 'aspect', round(W / H, 4), 'box', [round(v, 4) for v in box])
subprocess.run(['pdftoppm', '-f', str(pg), '-l', str(pg), '-r', '200', '-jpeg', '-singlefile', pdf, f'public/doc/{name}'], check=True)
