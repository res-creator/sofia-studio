# Upscaled copies of every puppet (x1.6, Lanczos + gentle unsharp like prepare.py) so medium shots stay crisp.
# Writes art/cache/chars/<name>/ (git-ignored): all PNGs scaled + character.js with every pixel coordinate scaled by K (draw with s / K).
import cv2, glob, os, json, re
ART = os.path.dirname(os.path.abspath(__file__)); K = 1.6
def up(src, dst):
    im = cv2.imread(src, cv2.IMREAD_UNCHANGED); h, w = im.shape[:2]
    o = cv2.resize(im, (int(w * K), int(h * K)), interpolation=cv2.INTER_LANCZOS4)
    rgb = o[..., :3]; bl = cv2.GaussianBlur(rgb, (0, 0), 1.2); o[..., :3] = cv2.addWeighted(rgb, 1.3, bl, -0.3, 0); cv2.imwrite(dst, o)
def sc(v): return [round(x * K, 1) for x in v]
for d in sorted(glob.glob(f'{ART}/characters/*/character.js')):
    cd = os.path.dirname(d); name = os.path.basename(cd); out = f'{ART}/cache/chars/{name}'; os.makedirs(out, exist_ok=True)
    js = open(d).read(); cfg = json.loads(re.sub(r'^[\s\S]*?module\.exports\s*=\s*', '', js).rstrip().rstrip(';')) if js.strip().split('module.exports')[1].lstrip(' =').startswith('{\n "') or '"heads"' in js else None
    if cfg is None:   # JS-literal config (olekirk): evaluate with node
        cfg = json.loads(os.popen(f'node -e "console.log(JSON.stringify(require(\'{d}\')))"').read())
    for f in glob.glob(f'{cd}/*.png'): up(f, f'{out}/{os.path.basename(f)}')
    cfg['head']['pivot'] = sc(cfg['head']['pivot']); cfg['head']['offset'] = sc(cfg['head'].get('offset', [0, 0]))
    b = cfg['body']; b['neck'] = sc(b['neck']); b['shoulders'] = {k: sc(v) for k, v in b['shoulders'].items()}
    for side in ('L', 'R'):
        A = cfg['arms'][side]; A['straight']['top'] = sc(A['straight']['top']); A['straight']['elbowY'] = round(A['straight']['elbowY'] * K, 1)
        for g in A.get('gestures', {}).values(): g['top'] = sc(g['top'])
    cfg['bendZone'] = round(cfg.get('bendZone', 60) * K, 1); cfg['K'] = K
    open(f'{out}/character.js', 'w').write('module.exports = ' + json.dumps(cfg, indent=1) + ';\n'); print('ok', name)
