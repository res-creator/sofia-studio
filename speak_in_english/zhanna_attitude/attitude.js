// «Show off your attitude!» TikTok campaign — Zhanna + Petrovich (from behind), toon v4.
// node attitude.js slides            -> final/slide1..4.png
// node attitude.js still 3.5,6.2     -> out/still_<t>.png
// node attitude.js video             -> out/video_silent.mp4 (12 s, 30 fps)   then: node attitude.js mux -> final/zhanna_attitude.mp4
// node attitude.js cover             -> final/cover.png
// No song in any file: the owner adds «Bad News» in TikTok.
const fs = require('fs'), {spawn, execFileSync} = require('child_process'), {createCanvas, GlobalFonts} = require('@napi-rs/canvas'), T = require('./toon');
for (const [f, n] of [['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL']]) GlobalFonts.registerFromPath(`${__dirname}/fonts/${f}.woff2`, n);
const W = 1080, H = 1920, FPS = 30, DUR = 12, INK = '#2a2230';
const cv = createCanvas(W, H); let g = cv.getContext('2d');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = v => { v = clamp(v); return v * v * (3 - 2 * v); }, lerp = (a, b, k) => a + (b - a) * k;
const P = () => g.beginPath();
function fsx(fill, lw = 7) { if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } }
const ell = (x, y, rx, ry, fill, lw = 7, rot = 0) => { P(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, 7); fsx(fill, lw); };
const rr = (x, y, w, h, r, fill, lw = 7) => { P(); g.roundRect(x, y, w, h, r); fsx(fill, lw); };
const ln = (pts, w, col = INK) => { P(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); };
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
function body(x, y, sc, fn) { g.save(); g.translate(x, y); g.scale(sc, sc); fn(); g.restore(); }

// ---------- Zhanna ----------
T.OUTFITS.cardigan = {kind: 'cardigan', pal: {top: '#f6c9dc', topS: '#e5aec6', collar: '#ffffff', pocket: true, skirt: '#bfe3d6', bottom: '#bfe3d6', sleeve: '#f6c9dc', arm: '#f6c9dc'}};
const ZPAL = {skin: '#f4c8a8', skinS: '#e2aa88', hair: '#f3d27a', hairS: '#d9b257', brow: '#8a6030', lip: '#d02a5a', legs: '#f4c8a8', shoe: '#e0b040', sole: '#e0b040'};
const ZSWEET = {outfit: 'cardigan', hair: 'bouffant', lashes: true, earrings: '#f4f4ff', skirt: true, nails: '#f7a6c4', pal: {...ZPAL, lip: '#e8708e', shoe: '#ffffff', sole: '#f7a6c4'}};
const ZSAVAGE = {outfit: 'leopard', hair: 'bouffant', lashes: true, earrings: '#f2c820', skirt: true, nails: '#d0103a', pal: {...ZPAL, lip: '#b0102e', shoe: '#2a2230', sole: '#d0103a'}};
// sunglasses over the eyes (head coords); k = 0..1 slide down from the hair
const shadesFx = (k = 1) => (gg, HY) => { const pg = g; g = gg; const dy = lerp(-150, 0, ease(k)), ey = HY - 30 + dy;
  for (const s of [-1, 1]) { P(); g.roundRect(s * 56 - 66, ey - 46, 132, 96, 34); fsx('#1d1824', 7); P(); g.ellipse(s * 56 - 26, ey - 18, 22, 10, -.3, 0, 7); g.fillStyle = 'rgba(255,255,255,.55)'; g.fill(); }
  ln([[-12, ey - 18], [12, ey - 18]], 10); ln([[-122, ey - 20], [-160, ey - 34]], 8); ln([[122, ey - 20], [160, ey - 34]], 8); g = pg; };
// extra hair volume behind the head (the attitude bouffant): v = 0..1
const bigHairFx = (v = 1, flip = 0) => (gg, HY) => { if (v <= 0) return; const pg = g; g = gg; g.save(); g.translate(flip * 30, 0); g.scale(1 + .05 * v, 1 + .05 * v);
  P(); g.moveTo(-226, HY + 220); g.bezierCurveTo(-292, HY + 40, -280, HY - 220, -134, HY - 282); g.bezierCurveTo(-44, HY - 318, 60, HY - 318, 150, HY - 282); g.bezierCurveTo(286, HY - 214, 300, HY + 40, 236 + flip * 40, HY + 220); g.quadraticCurveTo(0, HY + 246, -226, HY + 220); g.closePath(); fsx(ZPAL.hairS, 7);
  g.restore(); g = pg; };
function zh(def, x, y, sc, o = {}) { T.draw(g, {...def, x, y, s: sc, ...o}); }
// hands-on-hips (attitude) / teacup hold / reach out to screen-right
const HIPS = s => [[s * 86, -860], [s * 168, -735], [s * 92, -632]];
const CUP = s => [[s * 86, -860], [s * 128, -730], [s * 44, -700]];
const reach = k => s => s > 0 ? [[86, -860], [lerp(168, 290, k), lerp(-735, -830, k)], [lerp(92, 470, k), lerp(-632, -820, k)]] : HIPS(s);
function teacup(x, y, sc) { body(x, y, sc, () => { P(); g.moveTo(-58, -730); g.lineTo(58, -730); g.quadraticCurveTo(54, -650, 0, -646); g.quadraticCurveTo(-54, -650, -58, -730); g.closePath(); fsx('#ffffff');
  P(); g.arc(66, -704, 20, -1.4, 1.4); g.strokeStyle = INK; g.lineWidth = 7; g.stroke(); ell(0, -730, 58, 12, '#c98a5a', 6); for (const k of [-24, 6, 30]) ell(k, -690, 9, 9, '#f7a6c4', 0);
  for (const k of [-20, 14]) { P(); g.moveTo(k, -760); g.quadraticCurveTo(k + 16, -790, k, -820); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 6; g.stroke(); } }); }

// ---------- Petrovich: ALWAYS from behind (ears at the sides, grey horseshoe at ear level, nape + collar below, bald shine on top) ----------
function petroHead(x, y, sc) { body(x, y, sc, () => { const cy = -1040;
  for (const s of [-1, 1]) { ell(s * 106, cy + 10, 22, 36, '#e8b896', 6); ell(s * 106, cy + 10, 9, 18, '#d39a7a', 0); }   // ears
  ell(0, cy, 104, 116, '#e8b896'); g.save(); P(); g.ellipse(0, cy, 104, 116, 0, 0, 7); g.clip();
  g.fillStyle = 'rgba(0,0,0,.10)'; g.fillRect(40, cy - 130, 80, 260);
  P(); g.moveTo(-110, cy - 6); for (let k = 0; k <= 10; k++) g.lineTo(-110 + k * 22, cy - 6 + (k % 2 ? -8 : 0) + Math.abs(k - 5) * -3); g.lineTo(110, cy + 52); g.quadraticCurveTo(0, cy + 70, -110, cy + 52); g.closePath(); g.fillStyle = '#b8b0a8'; g.fill();   // horseshoe fringe at ear level
  g.restore(); ell(0, cy, 104, 116, null, 7);
  for (let k = -4; k <= 4; k++) ln([[k * 22, cy + 2], [k * 23, cy + 40]], 3, '#8a8278');
  ell(-30, cy - 78, 30, 14, 'rgba(255,255,255,.75)', 0, -.3); }); }   // bald shine
function collar(x, y, sc) { body(x, y, sc, () => { P(); g.moveTo(-70, -930); g.quadraticCurveTo(0, -950, 70, -930); g.lineTo(80, -900); g.quadraticCurveTo(0, -918, -80, -900); g.closePath(); fsx('#1f2d6a', 6); }); }
// the newspaper seen from behind: we look at its back page; head = 'BRIGHTON POST' or 'BAD NEWS!' (snap = squash on the page turn)
function paperBack(x, y, sc, top, headline, snap = 0, hw = 250) { body(x, y, sc, () => { g.translate(0, top); g.scale(1 - .12 * snap, 1);
  rr(-hw, 0, hw * 2, 320, 8, '#efe9d8'); ln([[0, 0], [0, 320]], 5);
  const bad = headline !== 'BRIGHTON POST';
  T.fitText(g, headline, {x: -hw + 10, y: 8, w: hw * 2 - 20, h: bad ? 120 : 70}, {maxSize: bad ? 110 : 52, color: bad ? '#c8102e' : INK, pad: 8});
  for (let k = 0; k < 4; k++) { ln([[-hw + 30, (bad ? 160 : 110) + k * 34], [-24, (bad ? 160 : 110) + k * 34]], 5, '#9a9488'); ln([[24, (bad ? 160 : 110) + k * 34], [hw - 30, (bad ? 160 : 110) + k * 34]], 5, '#9a9488'); } }); }
// hands gripping the paper's side edges (we see the backs of his hands, fingers curling round the edge)
function gripHands(x, y, sc, top, hw = 250) { body(x, y, sc, () => { for (const s of [-1, 1]) { const hx = s * hw, hy = top + 150; ell(hx, hy, 34, 44, '#e8b896', 6); for (let k = 0; k < 3; k++) ln([[hx - s * 6, hy - 26 + k * 22], [hx + s * 20, hy - 26 + k * 22]], 4, '#c99272'); } }); }
function petroBody(x, y, sc, headline = 'BAD NEWS!') { const TOP = -1290;
  paperBack(x, y, sc, TOP, headline);   // paper is in front of him (further from us), so it goes first
  body(x, y, sc, () => {   // standing, from behind: tracksuit, heels toward us
  for (const s of [-1, 1]) { ln([[s * 46, -580], [s * 52, -70]], 58, INK); ln([[s * 46, -580], [s * 52, -70]], 46, '#2c3f8f'); ln([[s * 70, -560], [s * 76, -80]], 6, '#f4f1ea');
    P(); g.moveTo(s * 52 - 36, -70); g.lineTo(s * 52 + 36, -70); g.lineTo(s * 52 + 34, -14); g.quadraticCurveTo(s * 52, 2, s * 52 - 34, -14); g.closePath(); fsx('#f4f1ea', 6); ln([[s * 52 - 34, -14], [s * 52 + 34, -14]], 5, '#c9c2b2'); }   // heels only: feet point away
  P(); g.moveTo(-118, -900); g.quadraticCurveTo(0, -935, 118, -900); g.lineTo(112, -560); g.quadraticCurveTo(0, -548, -112, -560); g.closePath(); fsx('#2c3f8f'); g.save(); g.clip(); g.fillStyle = '#1f2d6a'; g.fillRect(56, -940, 80, 400); g.restore();
  P(); g.moveTo(-118, -900); g.quadraticCurveTo(0, -935, 118, -900); g.lineTo(112, -560); g.quadraticCurveTo(0, -548, -112, -560); g.closePath(); fsx(null);
  for (const s of [-1, 1]) ln([[s * 100, -896], [s * 106, -580]], 6, '#f4f1ea');
  for (const s of [-1, 1]) { ln([[s * 104, -880], [s * 220, -960], [s * 250, TOP + 150]], 52, INK); ln([[s * 104, -880], [s * 220, -960], [s * 250, TOP + 150]], 40, '#2c3f8f'); }   // arms raised, elbows out
  ln([[-30, -930], [30, -930]], 40, '#e8b896'); }); collar(x, y, sc); petroHead(x, y, sc); gripHands(x, y, sc, TOP); }
function armchairBack(x, y, sc, col = '#9b3b4a') { body(x, y, sc, () => { const cs = shade(col, .78);
  rr(-300, -760, 600, 760, 90, col); g.save(); P(); g.roundRect(-300, -760, 600, 760, 90); g.clip(); g.fillStyle = cs; g.fillRect(170, -780, 150, 800); g.restore(); rr(-300, -760, 600, 760, 90, null);
  for (const s of [-1, 1]) rr(s * 300 - 60, -520, 120, 520, 50, s > 0 ? cs : col);
  ln([[-200, -640], [200, -640]], 5, cs); ln([[-200, -420], [200, -420]], 5, cs); }); }
// seated in the armchair, from behind: paper (far) -> head (top shows above the chair) -> hands on the paper edges -> chair back (near)
function petroChair(x, y, sc, headline = 'BAD NEWS!', snap = 0, rustle = 0) { const TOP = -1220 + rustle * 4, HW = 215;
  paperBack(x, y, sc, TOP, headline, snap, HW); collar(x, y + 57 * sc + 40 * sc, sc * .92); petroHead(x, y + 57 * sc, sc * .92); gripHands(x, y, sc, TOP, HW); armchairBack(x, y, sc); }

// ---------- backgrounds ----------
function pastelBg() { g.fillStyle = '#fde7ef'; g.fillRect(0, 0, W, H); g.fillStyle = '#f9d5e3'; for (let x = 0; x < W; x += 120) for (let y = 0; y < H; y += 120) { g.save(); g.translate(x + ((y / 120) % 2) * 60, y); ell(0, 0, 10, 10, '#f9d5e3', 0); g.restore(); }
  g.fillStyle = '#f3c8d8'; g.fillRect(0, 1500, W, 420); ln([[0, 1500], [W, 1500]], 6, '#e5aec6');
  for (const [x, y] of [[130, 1180], [950, 1240]]) { rr(x - 40, y, 80, 120, 20, '#ffffff', 6); for (const [dx, dy, c] of [[-26, -30, '#f7a6c4'], [24, -36, '#ffd36e'], [0, -64, '#c8a6f2']]) { ln([[x, y], [x + dx * .6, y + dy + 20]], 5, '#5fa86a'); ell(x + dx, y + dy, 24, 24, c, 6); ell(x + dx, y + dy, 8, 8, '#fff3c0', 0); } } }
function redBg(t = 0, spot = true) { g.fillStyle = '#6e0a16'; g.fillRect(0, 0, W, H); g.fillStyle = '#8c1020'; for (let x = 0; x < W; x += 90) g.fillRect(x, 0, 45, 1500);
  g.fillStyle = '#3a060c'; g.fillRect(0, 1500, W, 420); ln([[0, 1500], [W, 1500]], 6, '#2a0508');
  if (spot) { const gr = g.createRadialGradient(540, 1300, 40, 540, 1300, 700); gr.addColorStop(0, 'rgba(255,220,200,.42)'); gr.addColorStop(1, 'rgba(255,220,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.save(); g.globalAlpha = .16; P(); g.moveTo(420, 0); g.lineTo(660, 0); g.lineTo(980, 1780); g.lineTo(100, 1780); g.closePath(); g.fillStyle = '#ffe8d8'; g.fill(); g.restore(); } }
function vanity(y = 1560) { rr(60, y, 960, 70, 16, '#ffffff', 7); rr(90, y + 70, 900, 300, 10, '#f6dbe6', 7); for (const x of [300, 780]) ell(x, y + 200, 14, 14, '#e0b040', 5);
  rr(820, y - 120, 60, 120, 14, '#f7a6c4', 6); rr(838, y - 150, 24, 34, 6, '#e0b040', 5); }
// ---------- TikTok-like text: bold white, black outline, upper third ----------
function title(str, cy = 330, maxS = 92, lines = 2, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha = a;
  const box = {x: 70, y: cy - 150, w: 940, h: 300}; let size = maxS, rows;
  const wrap = s => { g.font = `${s}px NBL, NBC`; const words = str.split(' '), out = []; let cur = ''; for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (g.measureText(tr).width <= box.w) cur = tr; else { if (cur) out.push(cur); cur = w; } } out.push(cur); return out; };
  for (; size > 30; size -= 2) { rows = wrap(size); if (rows.length <= lines && rows.length * size * 1.15 <= box.h && rows.every(r => g.measureText(r).width <= box.w)) break; }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  rows.forEach((r, i) => { const y = cy + (i - (rows.length - 1) / 2) * size * 1.15; g.lineWidth = size * .2; g.strokeStyle = '#000000'; g.strokeText(r, 540, y); g.fillStyle = '#ffffff'; g.fillText(r, 540, y); }); g.restore(); }

// ---------- photo slides ----------
const ZS = .94, FEET = 1860;
function slide1() { pastelBg(); zh(ZSWEET, 540, FEET, ZS, {arms: CUP, front: true, hands: {1: 'fist', '-1': 'fist'}, mood: 'kind', look: 0}); teacup(540, FEET, ZS); title('me without an attitude'); }
function slide2() { redBg(); petroBody(840, FEET, .9); zh(ZSAVAGE, 300, FEET, ZS, {arms: HIPS, hands: {1: 'fist', '-1': 'fist'}, mood: 'smugside', backFx: bigHairFx(1), faceFx: shadesFx(1)}); title('me with an attitude'); }
function slide3() { redBg(); petroChair(790, FEET, .95, 'BAD NEWS!'); zh(ZSAVAGE, 205, FEET, ZS * .92, {arms: s => s > 0 ? [[86, -860], [200, -760], [300, -800]] : HIPS(s), hands: {1: 'open', '-1': 'fist'}, lean: .04, mood: 'smug', backFx: bigHairFx(1), faceFx: shadesFx(1)}); title('my partner in crime'); }
function slide4() { const half = (left, fn) => { g.save(); P(); if (left) { g.moveTo(0, 0); g.lineTo(560, 0); for (let y = 0; y <= H; y += 120) g.lineTo(y / 120 % 2 ? 520 : 560, y); g.lineTo(0, H); } else { g.moveTo(W, 0); g.lineTo(560, 0); for (let y = 0; y <= H; y += 120) g.lineTo(y / 120 % 2 ? 520 : 560, y); g.lineTo(W, H); } g.closePath(); g.clip(); fn(); g.restore(); };
  half(true, () => { pastelBg(); zh(ZSWEET, 540, FEET, ZS, {pose: 'hips', hands: {1: 'fist', '-1': 'fist'}, mood: 'kind'}); });
  half(false, () => { redBg(); zh(ZSAVAGE, 540, FEET, ZS, {pose: 'hips', hands: {1: 'fist', '-1': 'fist'}, mood: 'smug', backFx: bigHairFx(1), faceFx: shadesFx(1)}); });
  P(); g.moveTo(560, 0); for (let y = 0; y <= H; y += 120) g.lineTo(y / 120 % 2 ? 520 : 560, y); g.strokeStyle = '#ffffff'; g.lineWidth = 14; g.stroke(); g.strokeStyle = '#000000'; g.lineWidth = 5; g.stroke();
  title('oops… I forgot my attitude'); }

// ---------- video timeline (12 s) ----------
const SNAP = 3.0, REACH = 5.0, PULL = 5.7, PULLD = 1.3, POSE = 8.0, LOWER = 9.0;
function blink(t, per = 3.7) { return (t % per) < .12; }
function frame(t) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (t < SNAP) {   // sweet at the vanity, soft light, gentle sway
    pastelBg(); const sway = .06 * Math.sin(t * 1.6), lift = ease((t - .7) / .4) * (1 - ease((t - 1.9) / .4)), up = -70 * lift;
    const cupArms = s => { const [S, E, Hd] = CUP(s); return [S, [E[0], E[1] + up * .5], [Hd[0], Hd[1] + up]]; };
    zh(ZSWEET, 540, FEET + 40, ZS, {arms: cupArms, front: true, hands: {1: 'fist', '-1': 'fist'}, mood: lift > .5 ? 'happy' : 'kind', tilt: sway, nod: Math.sin(t * 2.4) * 4, blink: (t > 2.4 && t < 2.52) || (t > .3 && t < .42)}); teacup(540, FEET + 40 + up * ZS, ZS); vanity();
    title('oops, I forgot my attitude', 330, 92, 2, ease((t - .3) / .25));
    return; }
  // attitude world (red)
  const z = t >= POSE ? lerp(1, 1.1, ease((t - POSE) / (DUR - POSE))) : 1; g.translate(700, 1300); g.scale(z, z); g.translate(-700, -1300);
  redBg(t);
  const zx = t < REACH ? 540 : lerp(540, 215, ease((t - REACH) / .6));
  const chairX = t < PULL ? 1500 : lerp(1500, 790, ease((t - PULL) / PULLD));
  const rustle = t > PULL + PULLD && t < PULL + PULLD + .5 ? Math.sin(t * 50) : 0;
  const snap = t >= LOWER && t < LOWER + .25 ? Math.sin((t - LOWER) / .25 * Math.PI) : 0, head = t < LOWER + .12 ? 'BRIGHTON POST' : 'BAD NEWS!';
  if (t >= PULL - .1) petroChair(chairX, FEET + 40, .95, head, snap, rustle);
  let arms = HIPS, hands = {1: 'fist', '-1': 'fist'}, mood = 'smug';
  if (t >= REACH && t < PULL + PULLD) { const k = t < PULL ? ease((t - REACH) / (PULL - REACH)) : 1 - ease((t - PULL) / PULLD) * .55; arms = reach(k); hands = {1: 'fist', '-1': 'fist'}; mood = 'smugside'; }
  else if (t >= PULL + PULLD && t < POSE) { const k = .45 * (1 - ease((t - PULL - PULLD) / .7)); arms = reach(k); }
  if (t >= POSE) mood = t < POSE + 1.2 ? 'proud' : 'smugside';
  const flip = t >= POSE && t < POSE + 1 ? Math.sin((t - POSE) * Math.PI) : 0;
  const pop = ease((t - SNAP) / .25), sq = t < SNAP + .35 ? 1 - .06 * Math.sin((t - SNAP) / .35 * Math.PI) : 1;
  zh(ZSAVAGE, zx, FEET + 40, ZS * (.9 + .1 * pop), {arms, hands, mood, sq, tilt: -.06 * flip, nod: Math.sin(t * 2.6) * 3, blink: blink(t + .7), backFx: bigHairFx(pop, flip), faceFx: shadesFx(ease((t - SNAP - .2) / .5))});
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (t >= SNAP && t < SNAP + .2) { g.fillStyle = `rgba(255,255,255,${1 - (t - SNAP) / .2})`; g.fillRect(0, 0, W, H); }   // the snap flash (0.2 s)
  if (t >= POSE + .3) title('me & my partner in crime', 330, 88, 2, ease((t - POSE - .3) / .25));
}

// ---------- SFX (synthesised; no song) ----------
function sfx() { const SR = 44100, N = Math.round(DUR * SR), a = new Float32Array(N); let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const put = (t0, d, fn) => { const i0 = Math.round(t0 * SR); for (let i = 0; i < d * SR && i0 + i < N; i++) a[i0 + i] += fn(i / SR, i / (d * SR)); };
  put(SNAP - .02, .09, (x, u) => rnd() * Math.exp(-u * 9) * .8);                                                          // finger snap
  let lp = 0; put(SNAP, .5, (x, u) => { lp += .18 * (rnd() - lp); return lp * Math.sin(Math.PI * u) * 1.4; });               // whoosh
  let lp2 = 0; put(PULL, PULLD, (x, u) => { lp2 += .05 * (rnd() - lp2); return lp2 * 2.2 * Math.sin(Math.PI * u) * (1 + .4 * Math.sin(x * 60)); });   // chair sliding
  let lp3 = 0; put(PULL + PULLD, .5, (x, u) => { lp3 += .4 * (rnd() - lp3); return lp3 * .5 * Math.exp(-u * 4); });          // newspaper rustle
  let lp4 = 0; put(POSE, .4, (x, u) => { lp4 += .25 * (rnd() - lp4); return lp4 * Math.sin(Math.PI * u) * .9; });            // hair flip swish
  const b = Buffer.alloc(44 + N * 2); b.write('RIFF', 0); b.writeUInt32LE(36 + N * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(N * 2, 40);
  for (let i = 0; i < N; i++) b.writeInt16LE(Math.round(clamp(a[i], -1, 1) * 22000), 44 + i * 2); fs.writeFileSync(`${__dirname}/out/sfx.wav`, b); }

// ---------- main ----------
const mode = process.argv[2] || 'slides'; fs.mkdirSync(`${__dirname}/out`, {recursive: true}); fs.mkdirSync(`${__dirname}/final`, {recursive: true});
const save = p => fs.writeFileSync(p, cv.toBuffer('image/png'));
if (mode === 'slides') { [slide1, slide2, slide3, slide4].forEach((fn, i) => { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); fn(); save(`${__dirname}/final/slide${i + 1}.png`); }); console.log('slides ok'); }
if (mode === 'still') { for (const t of (process.argv[3] || '1').split(',').map(Number)) { frame(t); save(`${__dirname}/out/still_${t}.png`); } console.log('stills ok'); }
if (mode === 'cover') { frame(10.5); save(`${__dirname}/final/cover.png`); console.log('cover ok'); }
if (mode === 'video') { const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'veryfast', `${__dirname}/out/video_silent.mp4`], {stdio: ['pipe', 'inherit', 'inherit']});
  (async () => { for (let f = 0; f < DUR * FPS; f++) { frame(f / FPS); const buf = cv.data(); if (!ff.stdin.write(Buffer.from(buf))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('video exit', c)); })(); }
if (mode === 'mux') { sfx(); execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', `${__dirname}/out/video_silent.mp4`, '-i', `${__dirname}/out/sfx.wav`, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', `${__dirname}/final/zhanna_attitude.mp4`]); console.log('mux ok'); }
