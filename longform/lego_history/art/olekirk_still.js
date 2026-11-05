// LEGO film: character check (no video). Ole Kirk puppet (v6 system: figmakit/lib/puppet.js) standing behind the workshop table (plate P5),
// showing a brick; integrated with the plate: same light direction, colour match, soft shadow on the wall behind him, contact shade on the table edge.
// Run: node art/olekirk_still.js frame 2 out.png   |   node art/olekirk_still.js sheet out.png  (prepared parts sheet)
const S = require('../../figmakit/lib/scene.js'), { Puppet } = require('../../figmakit/lib/puppet.js');
const I = require('./integrate.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path'), fs = require('fs');
const ART = __dirname, DIR = path.join(ART, 'characters/olekirk');
let BG, OK, P = {};
async function img(kind, name) { const c = path.join(ART, 'cache', kind, name + '.png'), o = path.join(ART, kind, name + '.png');
  const im = await loadImage(fs.existsSync(c) ? c : o); im.pre = fs.existsSync(c) ? (kind === 'props' ? 1.5 : 1) : 1; return im; }
async function load() { BG = await img('backgrounds', 'p5_tabletop'); OK = await Puppet.load(require(path.join(DIR, 'character.js')), DIR);
  for (const n of ['brick_red_2x4', 'brick_yellow_2x2', 'brick_blue_2x4', 'brick_white_2x4']) P[n] = await img('props', n); }

const TABLE = [[503, 322], [977, 322], [1536, 612], [1536, 864], [168, 864], [204, 520]];   // occluder: the table top in front of him
// acting range check: rest -> shows the brick (smile) -> explains with both palms (talk) -> worried
const act = Puppet.acting({ expr: [[0, 'neutral'], [0.9, 'smile'], [2.9, 'talk'], [4.6, 'worried']], blinks: [0.4, 3.1, 5.0], tilt: [[0.8, 0.05], [3.0, -0.04], [4.6, 0.03]], nods: [1.0, 3.2], shrugs: [[3.1, 0.6]],
  gestures: { R: [[0.6, 2.5, 'brick'], [3.0, 4.4, 'palm']], L: [[3.0, 4.4, 'palm']] } });
// draw the puppet into a layer, then light / colour-match it like the props (shade left, warm right)
let LAY = null;
function puppetLayer(t, x, y, s) { LAY = LAY || createCanvas(1536 * 3, 864 * 3); const c = LAY.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, LAY.width, LAY.height);
  c.setTransform(3, 0, 0, 3, 0, 0);   // 3x layer: the puppet stays crisp when the camera pushes in
  c.globalCompositeOperation = 'source-over'; OK.draw(c, x, y, s, act(t), t);
  c.globalCompositeOperation = 'source-atop'; const g = c.createLinearGradient(x - 120, 0, x + 120, 0);
  g.addColorStop(0, 'rgba(60,30,10,0.26)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(255,196,120,0.14)'); c.fillStyle = g; c.fillRect(0, 0, 1536, 864);
  c.fillStyle = 'rgba(226,178,120,0.06)'; c.fillRect(0, 0, 1536, 864); return LAY; }

const shots = [{ t0: 0, draw(ctx, t, lt) { const cam = S.camKeys([[0, 742, 238, 2.0], [6, 742, 236, 2.04]], lt);
  S.world(ctx, cam, 1, c => { S.plate(c, BG);
    const x = 742, y = 214, s = 0.36, L = puppetLayer(t, x, y, s);
    // soft shadow of the figure on the wall/shelf behind him (window light from the right -> shadow to the left)
    c.save(); c.globalAlpha = 0.24; c.filter = 'blur(10px) brightness(0)'; c.drawImage(L, -46, 8, 1536, 864); c.restore();
    c.save(); c.filter = 'saturate(0.86) sepia(0.10) contrast(0.96) blur(0.25px)'; c.drawImage(L, 0, 0, 1536, 864); c.restore();
    S.reveal(c, BG, TABLE);                                             // the table hides his lower body
    // a few bricks on the table in front of him (same perspective/scale rules as the town)
    const VX = 722, VY = 200, tx = (u, yy) => VX + u * 1.83 * (yy - VY), sc = (yy, k) => 0.0018 * (yy - VY) * k, dep = yy => S.clamp((yy - 300) / 420);
    [['brick_yellow_2x2', -0.30, 352, 0.30, 0.1], ['brick_blue_2x4', 0.18, 360, 0.30, -0.2], ['brick_white_2x4', 0.36, 345, 0.30, 0.3], ['brick_red_2x4', -0.05, 372, 0.30, 0.05]]
      .sort((a, b) => a[2] - b[2]).forEach(([n, u, yy, k, r]) => I.place(c, P[n], tx(u, yy), yy, sc(yy, k), { depth: dep(yy), r }));
    S.beams(c, t, 1350, 60, 2.55, 3, 0.06, 1300); S.dust(c, t, 450, 120, 700, 300, 40); });
  S.grade(ctx, 0.07, 0.42); } }];

async function sheet(out) {   // prepared parts: 6 heads, torso (sleeve stubs removed), 2 straight arms, 3 drawn gestures, with their pivots
  const files = ['head_neutral', 'head_blink', 'head_smile', 'head_talk', 'head_worried', 'head_surprised', 'torso', 'arm_L_down', 'arm_R_down', 'arm_L_palm', 'arm_R_palm', 'arm_R_brick'];
  const cfg = require(path.join(DIR, 'character.js')), W = 2400, H = 1500, cv = createCanvas(W, H), c = cv.getContext('2d');
  c.fillStyle = '#d9d2c6'; c.fillRect(0, 0, W, H); c.font = 'bold 26px sans-serif'; c.fillStyle = '#3a2c20'; c.fillText('Ole Kirk Christiansen: prepared puppet parts (keyed, stubs removed, pivots marked in red)', 30, 44);
  const pts = { torso: [cfg.body.neck, cfg.body.shoulders.L, cfg.body.shoulders.R], arm_L_down: [cfg.arms.L.straight.top], arm_R_down: [cfg.arms.R.straight.top],
    arm_L_palm: [cfg.arms.L.gestures.palm.top], arm_R_palm: [cfg.arms.R.gestures.palm.top], arm_R_brick: [cfg.arms.R.gestures.brick.top] };
  let x = 30, y = 80, rowH = 0;
  for (const f of files) { const im = await loadImage(path.join(DIR, f + '.png')), k = f.startsWith('head') ? 0.85 : 0.8, w = im.width * k, h = im.height * k;
    if (x + w > W - 20 || f === 'torso') { x = 30; y += rowH + 60; rowH = 0; }
    c.drawImage(im, x, y, w, h); c.fillStyle = '#3a2c20'; c.font = '20px sans-serif'; c.fillText(f + '.png', x, y + h + 26);
    for (const [px, py] of (f.startsWith('head') ? [cfg.head.pivot] : pts[f] || [])) { c.fillStyle = '#e02020'; c.beginPath(); c.arc(x + px * k, y + py * k, 6, 0, 6.28); c.fill(); }
    if (f === 'arm_L_down' || f === 'arm_R_down') { c.strokeStyle = '#e02020'; c.setLineDash([6, 5]); c.beginPath(); c.moveTo(x - 6, y + cfg.arms.L.straight.elbowY * k); c.lineTo(x + w + 6, y + cfg.arms.L.straight.elbowY * k); c.stroke(); c.setLineDash([]); }
    x += w + 40; rowH = Math.max(rowH, h); }
  fs.writeFileSync(out, cv.toBuffer('image/png')); }
if (require.main === module && process.argv[2] === 'sheet') sheet(process.argv[3]);
else S.run({ module, T: 6, shots, load });
