// "Перед твоим днём рождения он предлагает паузу" — rubric «Ответ на вопрос из комментариев» (live scene + 4 answers), hard_cut camera: node pause.js start end out.mp4 | --png=f1,f2
// Her bedroom: wall calendar (JUNE, the 14th = Friday circled with a heart, past days crossed out), a wardrobe on the left, the bed on the right.
// The heroine holds a birthday balloon; her boyfriend holds a sheet «BREAK». hook: "I think we need a little break." -> the balloon deflates; comment plate.
// 1 · ХОЛОДНО: "Fine. Bye." -> he whips a packed suitcase out from behind the bed -> "See you on the fifteenth!" -> calendar: the 15th circled right after the heart.
// 2 · С ЮМОРОМ: "From what — buying presents?" -> he chews his pen, sweat drop -> "No! …Partly. Mostly no." -> her eyebrow.
// 3 · КАК НОСИТЕЛЬ: "Interesting timing." -> "…Total coincidence. I'll stay." -> he squats and slowly slides the suitcase under the bed + Bella tip.
// 4 · КОРОЛЕВСКИЙ ОТВЕТ: the sweet threat -> "…The break is cancelled." -> he rips the BREAK sheet in half, then again.
// Twist: the wardrobe rattles, the doors burst open, a huge gift box «SURPRISE!» lurches out -> insert -> "I needed a week to build that. It's a bookshelf." -> the wrapping drops: a wonky bookshelf -> moral. End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/pause/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead (as in cake.js)
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'sweater', col: '#F2A65A' }, bottom: { type: 'leggings', col: '#4A4060' }, shoes: { col: '#F2B8C8', acc: '#FFFFFF' } };
const BF = { ...BASE.tom, seed: 23, hair: { style: 'short', col: '#2E2018' }, brow: '#2E2018', stubble: '#2E2018', top: { type: 'polo', col: '#3E8FB0', col2: '#FFFFFF' }, bottom: { type: 'jeans', col: '#3B4A6C' }, shoes: { col: '#FFFFFF', acc: '#3E8FB0' } };
const DROP = 430;
const G = { her: geom(HER), bf: geom(BF), bfS: geom(BF, DROP) };
const X = { her: -300, bf: 600 }, CALX = 110, CALY = -1250, CALW = 420, CALH = 500, CASEX = 830, BED0 = 1380, BED1 = 2100, WARDX = -1380;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function star(c, x, y, r, a = 1, col = '#FFF6C8') { c.save(); c.globalAlpha *= a; c.translate(x, y); c.fillStyle = col; c.beginPath(); for (let i = 0; i < 8; i++) { const rr_ = i % 2 ? r * 0.28 : r, an = i * Math.PI / 4; c.lineTo(Math.cos(an) * rr_, Math.sin(an) * rr_); } c.closePath(); c.fill(); c.restore(); }
// heart outline drawn with paths (no glyphs)
function heartPath(c, x, y, s) { c.beginPath(); c.moveTo(x, y + s * 0.95); c.bezierCurveTo(x - s * 1.5, y - s * 0.05, x - s * 0.75, y - s * 1.15, x, y - s * 0.45); c.bezierCurveTo(x + s * 0.75, y - s * 1.15, x + s * 1.5, y - s * 0.05, x, y + s * 0.95); c.closePath(); }

// ---------------- props (all drawn with paths; English only on the props)
// wall calendar: JUNE (1st = Saturday, so the 14th is a Friday); past days 1..7 crossed out, 14 inside a pink heart; o1: the 15th gets a red ring + "BACK"
function calendar(c, t, L) { c.save(); c.translate(CALX, CALY);
  const w = CALW, h = CALH, x0 = -w / 2, y0 = -h / 2;
  c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, x0 + 10, y0 + 14, w, h, 16); c.fill();
  c.fillStyle = '#FFFDF6'; rr(c, x0, y0, w, h, 16); c.fill(); c.strokeStyle = '#3E471E'; c.lineWidth = 5; c.stroke();
  c.fillStyle = '#E0474C'; rr(c, x0, y0, w, 96, [16, 16, 0, 0]); c.fill();
  c.fillStyle = '#2B2F3A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(x0 + 50 + i * 64, y0 + 4, 9, 0, TAU); c.fill(); }
  fitTxt(c, 'JUNE', 0, y0 + 52, 56, '#FFFFFF', 300);
  const cw = w / 7, gy = y0 + 118, ch = 64;
  ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) => fitTxt(c, d, x0 + cw * (i + 0.5), gy, 26, i > 4 ? '#E0474C' : '#6A6A7A', cw));
  for (let d = 1; d <= 30; d++) { const i = d + 4, col = i % 7, row = Math.floor(i / 7), cx = x0 + cw * (col + 0.5), cy = gy + 52 + row * ch;
    fitTxt(c, String(d), cx, cy, 30, col > 4 ? '#E0474C' : '#2B2F3A', cw, 'Nun9');
    if (d <= 7) { c.strokeStyle = 'rgba(62,71,30,.65)'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - 18, cy - 18); c.lineTo(cx + 18, cy + 18); c.moveTo(cx + 18, cy - 18); c.lineTo(cx - 18, cy + 18); c.stroke(); }
    if (d === 14) { const pk = 1 + 0.06 * Math.sin(t * 6); c.save(); c.translate(cx, cy); c.scale(pk, pk); heartPath(c, 0, 0, 34); c.strokeStyle = '#EE5E9A'; c.lineWidth = 6; c.stroke(); c.restore(); }
    if (d === 15 && L === 'o1' && t > ev('o1', 'circle')) { const k = clamp((t - ev('o1', 'circle')) / 0.5); c.strokeStyle = '#D62E3A'; c.lineWidth = 6; c.beginPath(); c.ellipse(cx, cy, 30, 27, -0.2, -1.4, -1.4 + TAU * 1.08 * k); c.stroke();
      const bk = eBack(clamp((t - ev('o1', 'circle') - 0.6) / 0.25), 2); if (bk > 0) { c.save(); c.translate(cx + 6, cy + 46); c.rotate(-0.12); c.scale(bk, bk); fitTxt(c, 'BACK!', 0, 0, 22, '#D62E3A', 80, 'Unb9'); c.restore(); } } }
  c.restore(); }
// suitcase standing on its wheels; (0,0) = floor centre, extended handle
function suitcase(c, handle = 1) { const w = 300, h = 440, y0 = -h - 30;
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 4, w * 0.62, 20, 0, 0, TAU); c.fill();
  if (handle > 0) { const hy = y0 - 220 * handle; c.fillStyle = '#4A4F5C'; c.fillRect(-80, hy, 14, y0 - hy + 10); c.fillRect(66, hy, 14, y0 - hy + 10); paint(c, q => { q.m(-94, hy - 30); q.l(94, hy - 30); q.l(94, hy + 6); q.l(-94, hy + 6); q.z(); }, '#2B2F3A', { sd: 3, hd: 2, lw: 3 }); }
  for (const s of [-1, 1]) { c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(s * (w / 2 - 40), -18, 20, 0, TAU); c.fill(); c.fillStyle = '#8A8F9C'; c.beginPath(); c.arc(s * (w / 2 - 40), -18, 7, 0, TAU); c.fill(); }
  paint(c, q => { q.m(-w / 2, y0 + 30); q.q(-w / 2, y0, -w / 2 + 30, y0); q.l(w / 2 - 30, y0); q.q(w / 2, y0, w / 2, y0 + 30); q.l(w / 2, -60); q.q(w / 2, -30, w / 2 - 30, -30); q.l(-w / 2 + 30, -30); q.q(-w / 2, -30, -w / 2, -60); q.z(); }, '#F2B33D', { sd: 10, hd: 5, lw: 4 });
  c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 8; for (const x of [-70, 0, 70]) { c.beginPath(); c.moveTo(x, y0 + 30); c.lineTo(x, -60); c.stroke(); }
  c.fillStyle = '#FFFDF6'; rr(c, 40, y0 + 60, 70, 46, 8); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 3; c.beginPath(); c.moveTo(60, y0 + 60); c.lineTo(40, y0 + 30); c.stroke(); }
// the sheet he holds: «BREAK» (s = scale); in o4 it gets ripped: pieces = 1 | 2 | 4
function sheet(c, s = 1, pieces = 1, spread = 0) { c.save(); c.scale(s, s); const w = 200, h = 140;
  const part = (x0, y0, x1, y1, dx, dy, r) => { c.save(); c.translate(dx, dy); c.rotate(r); c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); c.clip();
    c.fillStyle = '#FFFFFF'; c.fillRect(-w / 2, -h / 2, w, h); c.strokeStyle = '#3E471E'; c.lineWidth = 4; c.strokeRect(-w / 2, -h / 2, w, h);
    c.fillStyle = '#D62E3A'; c.font = '52px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BREAK', 0, -10);
    c.strokeStyle = '#8A8F9C'; c.lineWidth = 3; c.beginPath(); c.moveTo(-70, 40); c.lineTo(70, 40); c.stroke(); c.restore(); };
  if (pieces === 1) part(-w / 2, -h / 2, w / 2, h / 2, 0, 0, 0);
  else if (pieces === 2) { part(-w / 2, -h / 2, 0, h / 2, -spread, 0, -0.25 * spread / 60); part(0, -h / 2, w / 2, h / 2, spread, 0, 0.25 * spread / 60); }
  else for (let i = 0; i < 4; i++) { const sx = i % 2 ? 1 : -1, sy = i < 2 ? -1 : 1; part(sx < 0 ? -w / 2 : 0, sy < 0 ? -h / 2 : 0, sx < 0 ? 0 : w / 2, sy < 0 ? 0 : h / 2, sx * spread, sy * spread * 0.6, sx * sy * 0.3); }
  c.restore(); }
const sheetItem = (ctx, ha, side) => { ctx.save(); ctx.translate(side * -10, -60); ctx.rotate(side * -0.1); sheet(ctx, 0.9); ctx.restore(); };
// pen (o2): (0,0) = grip, tip points to the left (into his mouth)
const penItem = (ctx) => { ctx.save(); ctx.rotate(-0.5); paint(ctx, q => { q.m(-110, -8); q.l(40, -8); q.l(40, 8); q.l(-110, 8); q.z(); }, '#3FA9F5', { sd: 3, hd: 2, lw: 3 }); ctx.fillStyle = '#2B2F3A'; ctx.fillRect(-122, -5, 14, 10); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(10, -10, 8, 20); ctx.restore(); };
// hex key (twist): L-shaped
const keyItem = (ctx) => { ctx.save(); ctx.strokeStyle = '#8A8F9C'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, 40); ctx.lineTo(-10, -70); ctx.lineTo(30, -70); ctx.stroke(); ctx.strokeStyle = '#C8CCD6'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-14, 30); ctx.lineTo(-14, -64); ctx.stroke(); ctx.restore(); };
// birthday balloon on a string; (hx, hy) = her hand (world); k = 1 full .. 0 deflated
function balloon(c, t, hx, hy, k) { const bx = hx - 70 + Math.sin(t * 1.6) * 10, byFull = hy - 640 + Math.sin(t * 2.1) * 12, byFlat = hy + 140;
  const r = lerp(36, 105, k), by = lerp(byFlat, byFull, k), jx = k < 1 && k > 0 ? Math.sin(t * 60) * 12 * (1 - k) : 0;
  c.strokeStyle = '#6A6A7A'; c.lineWidth = 3; c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo(lerp(hx - 40, hx - 10, k), lerp(hy + 70, hy - 300, k), bx + jx, by + r * 1.15); c.stroke();
  c.save(); c.translate(bx + jx, by); c.rotate(k < 0.5 ? 0.5 * (1 - k) : 0);
  paint(c, q => { q.m(0, -r * 1.1); q.b(r * 1.05, -r * 1.1, r * 1.0, r * 0.6, 0, r * 1.1); q.b(-r * 1.0, r * 0.6, -r * 1.05, -r * 1.1, 0, -r * 1.1); q.z(); }, k > 0.4 ? '#EE5E9A' : '#D9528A', { sd: 8, hd: 4, lw: 4 });
  if (k > 0.3) { c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-r * 0.35, -r * 0.5, r * 0.18, r * 0.3, -0.5, 0, TAU); c.fill(); }
  else { c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * r * 0.4, -r * 0.6); c.lineTo(i * r * 0.2, r * 0.6); c.stroke(); } }
  c.fillStyle = '#C93E7A'; c.beginPath(); c.moveTo(-10, r * 1.18); c.lineTo(10, r * 1.18); c.lineTo(0, r * 1.05); c.fill(); c.restore(); }
const balloonK = (t, L) => { if (L !== 'hook') return 1; const a = hev('deflate'); return 1 - eOut(clamp((t - a) / 0.7)); };
// sweat drop
function sweat(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(0, -34); q.q(22, 0, 16, 14); q.q(0, 30, -16, 14); q.q(-22, 0, 0, -34); q.z(); }, '#8FD0F5', { sd: 3, hd: 2, lw: 3 }); c.restore(); }

// ---------------- her bedroom (prerendered, softly blurred)
const BX0 = -3300, BY0 = -3800, BW = 6800, BH = 5600, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#F4E1E6'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(214,150,170,.12)'; for (let x = BX0; x < BX0 + BW; x += 170) c.fillRect(x, BY0, 64, 3800);
  // window with curtains (between the wardrobe and the bed, behind the characters, high up)
  const g = c.createLinearGradient(0, -2700, 0, -1900); g.addColorStop(0, '#8EC9F0'); g.addColorStop(1, '#D8EEF8');
  c.fillStyle = '#FFFDF6'; rr(c, -560, -2750, 760, 740, 18); c.fill(); c.fillStyle = g; rr(c, -530, -2720, 700, 680, 10); c.fill(); c.fillStyle = '#FFFDF6'; c.fillRect(-190, -2720, 18, 680); c.fillRect(-530, -2390, 700, 18);
  c.fillStyle = '#B9A2D8'; rr(c, -690, -2820, 150, 900, 30); c.fill(); rr(c, 180, -2820, 150, 900, 30); c.fill();
  // framed pictures
  c.fillStyle = '#C98B6A'; rr(c, 700, -2300, 300, 380, 12); c.fill(); c.fillStyle = '#F7E6B0'; rr(c, 722, -2278, 256, 336, 8); c.fill(); c.fillStyle = '#EE5E9A'; heartPath(c, 850, -2110, 60); c.fill();
  c.fillStyle = '#7E9CC4'; rr(c, -2700, -2400, 340, 260, 12); c.fill(); c.fillStyle = '#D8EEF8'; rr(c, -2680, -2380, 300, 220, 8); c.fill(); c.fillStyle = '#6AA05A'; c.beginPath(); c.moveTo(-2680, -2160); c.lineTo(-2580, -2290); c.lineTo(-2500, -2210); c.lineTo(-2440, -2260); c.lineTo(-2380, -2160); c.closePath(); c.fill();
  // plant + lamp
  c.fillStyle = '#6A9E5A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(-2850 + i * 30, -700 - i * 60, 60, 170, -0.6 + i * 0.22, 0, TAU); c.fill(); } c.fillStyle = '#C9733A'; rr(c, -2930, -320, 240, 320, 20); c.fill();
  // skirting + floor + rug
  c.fillStyle = '#E2CDB2'; c.fillRect(BX0, -90, BW, 90);
  c.fillStyle = '#B07C52'; c.fillRect(BX0, 0, BW, 1800); c.fillStyle = 'rgba(0,0,0,.07)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, 0, 8, 1800);
  c.fillStyle = '#E8C9D8'; c.beginPath(); c.ellipse(150, 150, 1100, 120, 0, 0, TAU); c.fill();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);
// bed (drawn in FRONT of the suitcase: the valance hides whatever slides under it); headboard on the right
function bed(c) { const x0 = BED0, x1 = BED1;
  paint(c, q => { q.m(x1 - 80, -1050); q.q(x1 + 40, -1060, x1 + 60, -950); q.l(x1 + 60, 0); q.l(x1 - 80, 0); q.z(); }, '#8A6A4A', { sd: 10, hd: 5, lw: 4 });
  paint(c, q => { q.m(x1 - 360, -820); q.q(x1 - 220, -900, x1 - 90, -820); q.l(x1 - 90, -660); q.l(x1 - 360, -660); q.z(); }, '#FFFDF6', { sd: 8, hd: 4, lw: 3 });
  paint(c, q => { q.m(x0, -700); q.q(x0 + 20, -760, x0 + 120, -760); q.l(x1 - 80, -760); q.l(x1 - 80, -620); q.l(x0, -620); q.z(); }, '#9C7BD0', { sd: 10, hd: 5, lw: 4 });
  paint(c, q => { q.m(x0 - 20, -640); q.l(x1 - 80, -640); q.l(x1 - 80, -40); q.q((x0 + x1) / 2, -20, x0 - 20, -40); q.z(); }, '#B9A2D8', { sd: 10, hd: 5, lw: 4, inner: k => { k.strokeStyle = 'rgba(0,0,0,.08)'; k.lineWidth = 10; for (let x = x0 + 60; x < x1 - 80; x += 110) { k.beginPath(); k.moveTo(x, -620); k.lineTo(x + 10, -40); k.stroke(); } } });
  c.fillStyle = '#7A5A3A'; c.fillRect(x0 - 10, -40, 34, 40); }
// the wardrobe (left); open 0..1 = doors swing open; shake = rattle amplitude
function wardrobe(c, t, open, shake) { const w = 700, h = 2100, x0 = WARDX - w / 2, dx = shake * Math.sin(t * 70) * 8, rot = shake * Math.sin(t * 55) * 0.006;
  c.save(); c.translate(WARDX + dx, 0); c.rotate(rot); c.translate(-WARDX, 0);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x0 + 14, -h + 20, w, h - 20);
  paint(c, q => { q.m(x0, -h); q.l(x0 + w, -h); q.l(x0 + w, 0); q.l(x0, 0); q.z(); }, '#C9A57A', { sd: 12, hd: 6, lw: 4 });
  c.fillStyle = '#5A3A2A'; c.fillRect(x0 + 30, -h + 60, w - 60, h - 120);
  for (const s of [-1, 1]) { const hx = s < 0 ? x0 + 30 : x0 + w - 30, dw = (w - 60) / 2, sx = Math.cos(open * Math.PI * 0.8) * (s < 0 ? 1 : -1);
    c.save(); c.translate(hx, 0); c.scale(sx, 1);
    paint(c, q => { q.m(0, -h + 60); q.l(dw, -h + 60); q.l(dw, -60); q.l(0, -60); q.z(); }, Math.abs(sx) > 0.2 && Math.sign(sx) === (s < 0 ? 1 : -1) ? '#E2C08F' : '#B08A60', { sd: 8, hd: 4, lw: 4 });
    c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 6; c.strokeRect(40, -h + 130, dw - 80, 700); c.strokeRect(40, -h + 900, dw - 80, 900);
    c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(dw - 40, -1000, 16, 0, TAU); c.fill(); c.restore(); }
  c.restore(); }
// the gift box (twist): (0,0) = bottom centre; reveal 0..1 = the front wrapping drops, a wonky bookshelf shows
function giftBox(c, t, reveal = 0, s = 1) { c.save(); c.scale(s, s); const w = 560, h = 1240;
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 6, w * 0.6, 26, 0, 0, TAU); c.fill();
  if (reveal > 0) { // the bookshelf inside (slightly crooked)
    c.save(); c.rotate(0.03);
    paint(c, q => { q.m(-w / 2 + 20, -h + 20); q.l(w / 2 - 20, -h + 20); q.l(w / 2 - 20, 0); q.l(-w / 2 + 20, 0); q.z(); }, '#C9935A', { sd: 10, hd: 5, lw: 4 });
    c.fillStyle = '#7A5230'; c.fillRect(-w / 2 + 50, -h + 50, w - 100, h - 80);
    const shelves = [-h + 330, -h + 640, -h + 950]; shelves.forEach((y, i) => { c.save(); c.translate(0, y); c.rotate(i === 1 ? -0.09 : 0); c.fillStyle = '#E2B07A'; c.fillRect(-w / 2 + 40, -12, w - 80, 26); c.restore(); });
    const books = [['#E0474C', 60, 210], ['#3FA9F5', 50, 190], ['#F2B33D', 70, 230], ['#4CAF6A', 46, 170]]; let bx = -w / 2 + 70;
    books.forEach(([col, bw, bh], i) => { c.save(); c.translate(bx, -h + 318); if (i === 3) c.rotate(-0.35); c.fillStyle = col; c.fillRect(0, -bh, bw, bh); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(8, -bh + 30, bw - 16, 12); c.restore(); bx += bw + 6; });
    c.fillStyle = '#EE5E9A'; rr(c, 30, -h + 520, 140, 160, 12); c.fill(); c.fillStyle = '#FFFDF6'; rr(c, 44, -h + 534, 112, 132, 8); c.fill(); c.fillStyle = '#EE5E9A'; heartPath(c, 100, -h + 600, 26); c.fill();
    c.restore(); }
  if (reveal < 1) { const k = eIn(reveal); c.save(); c.translate(0, 0); c.transform(1, 0, 0, 1 - k * 0.92, 0, 0);
    paint(c, q => { q.m(-w / 2, -h); q.l(w / 2, -h); q.l(w / 2, 0); q.l(-w / 2, 0); q.z(); }, '#EE5E9A', { sd: 12, hd: 6, lw: 4, inner: k2 => { k2.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) { k2.beginPath(); k2.arc(-w / 2 + 70 + j * 140 + (i % 2) * 70, -h + 80 + i * 130, 16, 0, TAU); k2.fill(); } } });
    c.fillStyle = '#F2C14E'; c.fillRect(-36, -h, 72, h); c.fillRect(-w / 2, -h * 0.55 - 36, w, 72);
    c.save(); c.translate(0, -h * 0.3); c.rotate(-0.04); c.fillStyle = '#FFFDF6'; rr(c, -230, -60, 460, 120, 16); c.fill(); c.strokeStyle = '#3E471E'; c.lineWidth = 5; c.stroke(); fitTxt(c, 'SURPRISE!', 0, 4, 76, '#D62E3A', 420); c.restore();
    c.restore();
    if (reveal < 0.05) { c.save(); c.translate(0, -h - 10); const b = 1 + 0.04 * Math.sin(t * 5); c.scale(b, b);
      for (const sg of [-1, 1]) paint(c, q => { q.m(0, 0); q.b(sg * 120, -150, sg * 260, -40, sg * 170, 40); q.q(sg * 80, 40, 0, 0); q.z(); }, '#F2C14E', { sd: 6, hd: 3, lw: 4 });
      for (const sg of [-1, 1]) paint(c, q => { q.m(0, 0); q.l(sg * 70, 120); q.l(sg * 120, 100); q.z(); }, '#E3A33A', { sd: 4, hd: 2, lw: 4 });
      paint(c, q => q.a(0, 0, 40), '#E3A33A', { sd: 4, hd: 2, lw: 4 }); c.restore(); } }
  c.restore(); }
// box state in the twist: inside the wardrobe -> lurches out and tilts (bounce) -> stands there; reveal in ENDW
function boxState(t) { const b = ev('end', 'burst'), l = ev('end', 'land'); if (t < b) return { x: WARDX, rot: 0, vis: true };
  const k = clamp((t - b) / (l - b)), out = eOut(k), land = t > l ? Math.exp(-(t - l) * 6) * Math.sin((t - l) * 26) * 0.04 : 0;
  return { x: WARDX + 430 * out, rot: 0.12 * out + land, vis: true }; }
const revealK = t => eOut(clamp((t - ev('end', 'endw') - 0.3) / 0.45));

// ---------------- characters
const down = (g, s) => reach(g, s, s * g.sw * 1.08, g.ySh + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const gest = (st, g, who, t, side, b) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + b + Math.cos(u) * 20, { planar: true }); } };
const crossed = (st, g) => { st.armL = reach(g, -1, g.sw * 0.45, g.ySh + 300, { planar: true }); st.armR = reach(g, 1, -g.sw * 0.45, g.ySh + 330, { planar: true }); };
// her balloon hand (screen-left arm), local target
const BAL = g => ({ x: -g.sw * 1.45, y: g.ySh + 470 });
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'happy', turn: 0.25, look: 0.7 };
  const b = BAL(g); st.armL = reach(g, -1, b.x, b.y, { planar: true });
  if (L === 'hook') { st.mood = 'happy'; st.laugh = t < SP.hook_b.t + 0.6; if (t > SP.hook_b.t + 0.9) { st.mood = 'surprised'; st.blink = 0; } if (t > hev('deflate')) { st.mood = 'sad'; st.headY = 8; }
    if (t > hev('freeze')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.headY = 0; }
    if (t > hev('her')) { st.mood = 'sad'; st.headY = 8; st.look = 0.3; st.lookY = 0.3; }
    if (t > hev('eyes') - 0.1) { st.mood = 'skeptical'; st.look = 0.9; st.lookY = 0; st.headY = 0; st.tilt = -0.05; crossed(st, g); st.armL = reach(g, -1, b.x, b.y, { planar: true }); } }
  if (L === 'o1') { st.mood = 'bored'; st.turn = 0.2; st.look = 0.6; if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'annoyed'; st.armR = open(g, 1, 1.6, 200); }
    if (t > e('grab')) { st.mood = 'skeptical'; st.look = 0.9; } if (t > e('cal') + 1.4) { st.mood = 'tired'; st.blink = 1; st.look = 0.8; } }
  if (L === 'o2') { st.mood = 'smug'; st.turn = 0.25; st.look = 0.7; if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'happy'; gest(st, g, 'her', t, 1, 140); }
    if (t > e('herW') - 0.05) { st.mood = 'skeptical'; st.tilt = -0.06; st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 330, { planar: true }); }
    if (t > SP.o2_nar.t + 0.6) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'o3') { st.mood = 'neutral'; st.turn = 0.25; st.look = 0.7;
    if (speaking('o3_h', t, 0.1, 0.1)) { const u = t - SP.o3_h.t; st.mood = 'smug'; if (t > e('palm')) { const k = eOut(clamp((t - e('palm')) / 0.3)); st.armR = reach(g, 1, lerp(g.sw * 1.1, CALX - 110 - X.her, k), lerp(g.ySh + 400, CALY + 120 - (g.ySh * 0) + 0, k) , { planar: true }); st.look = 1; st.turn = 0.4; } else gest(st, g, 'her', t, 1, 150); if (u > 4.0) { st.mood = 'skeptical'; st.tilt = -0.05; } }
    if (t > endOf('o3_h') + 0.1) { st.mood = 'skeptical'; st.look = 0.9; }
    if (t > e('slide') + 0.3) { st.mood = 'smug'; st.look = 1; st.turn = 0.35; }
    if (t > SP.o3_nar.t + 0.4) { st.mood = 'happy'; st.blink = 1; st.turn = 0.05; st.look = 0.1; st.tilt = 0.06; } }
  if (L === 'o4') { st.mood = 'happy'; st.turn = 0.2; st.look = 0.5;
    if (speaking('o4_h', t, 0.1, 0.1)) { const u = t - SP.o4_h.t; st.mood = u > 2.4 ? 'smug' : 'happy'; st.squint = true; gest(st, g, 'her', t, 1, 140); if (u > 2.4) st.tilt = 0.05; }
    if (t > endOf('o4_h') + 0.1) { st.mood = 'smug'; st.blink = 1; st.squint = true; } }
  if (L === 'end') { st.mood = 'neutral'; st.look = 0.8; st.turn = 0.3;
    if (t > e('rattle')) { st.mood = 'surprised'; st.look = -0.8; st.turn = -0.3; st.blink = 0; }
    if (t > e('burst')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.armR = open(g, 1, 1.5, 120); }
    if (t > SP.end_b.t) { st.mood = 'surprised'; st.look = 0.8; st.turn = 0.3; st.armR = down(g, 1); }
    if (t > e('face')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.armR = reach(g, 1, g.sw * 0.2, g.ySh + 230, { planar: true }); st.look = 0.4; st.tilt = 0.06; }
    if (t > e('endw')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.look = -0.6; st.turn = -0.2; st.armR = open(g, 1, 1.6, 120 + Math.sin(t * 6) * 12); } }
  return st; }
// suitcase: hook = hidden behind the bed (handle tip peeks out); o1 = whipped out at 'grab'; o3 = beside him, then tipped over and slid under the bed
const caseShown = L => L === 'hook' || L === 'o1' || L === 'o3';
function caseState(t, L) {
  if (L === 'hook' || (L === 'o1' && t < ev('o1', 'grab'))) return { x: 1480, y: 0, rot: 0, hid: true };
  if (L === 'o1') { const k = clamp((t - ev('o1', 'grab')) / 0.35); return { x: lerp(1480, CASEX, eOut(k)), y: -Math.sin(k * Math.PI) * 260, rot: (1 - k) * 0.4, hid: false }; }
  if (L === 'o3') { const tp = ev('o3', 'tip'), sl = ev('o3', 'slide'); const rk = eIO(clamp((t - tp) / 0.3)), sk = clamp((t - sl) / 2.0), slide = 160 * eOut(clamp(sk / 0.3)) + 560 * eIO(clamp((sk - 0.25) / 0.75));
    return { x: CASEX + slide, y: 0, rot: rk * Math.PI / 2, hid: false }; }
  return null; }
function drawCase(c, cs) { c.save(); c.translate(cs.x, cs.y); if (cs.rot) { c.translate(150, 0); c.rotate(cs.rot); c.translate(-150, 0); } suitcase(c, cs.rot > 0.1 ? 0 : 1); c.restore(); }
function bfX(t, L) { return X.bf; }
function bfState(t, L) { let g = G.bf; const e = k => ev(L, k), st = { ...base(g, t, 'bf11'), mood: 'worried', turn: -0.25, look: -0.7 };
  const sheetL = (dy = 420) => { st.armL = reach(g, -1, -g.sw * 1.75, g.ySh + dy, { planar: true }); st.items.L = sheetItem; };
  sheetL(); st.armR = down(g, 1);
  if (L === 'hook') { st.mood = 'worried'; st.headY = 6; sheetL(t > SP.hook_b.t + 1.0 && t < endOf('hook_b') ? 300 : 420);
    if (t > hev('freeze')) { st.mood = 'worried'; st.blink = 0; }
    if (t > hev('bf')) { st.mood = 'happy'; st.squint = true; sheetL(260 + Math.sin(t * 8) * 10); st.armR = open(g, 1, 1.4, 160); } }
  if (L === 'o1') { st.mood = 'worried';
    if (t > e('grab')) { const k = clamp((t - e('grab')) / 0.35); st.armR = reach(g, 1, lerp(g.sw * 1.6, CASEX - X.bf - 70, k), lerp(g.ySh + 300, -760, k), { planar: true }); st.mood = 'happy'; st.laugh = true; st.blink = 1; }
    if (speaking('o1_b', t, 0.05, 0)) { st.mood = 'happy'; st.laugh = false; st.squint = false; st.blink = 0; }
    if (t > e('wave')) { const u = t - e('wave'); st.armL = reach(g, -1, -g.sw * 1.3 + Math.sin(u * 14) * 30, g.ySh + 120, { planar: true }); st.items.L = sheetItem; st.mood = 'happy'; } }
  if (L === 'o2') { st.mood = 'happy';
    if (speaking('o2_h', t, 0, 0.1)) { st.mood = t > SP.o2_h.t + 1.2 ? 'worried' : 'happy'; }
    if (t > e('pen')) { const k = eOut(clamp((t - e('pen')) / 0.25)), ch = Math.abs(Math.sin((t - e('pen')) * 9)) * 10;
      st.headFirst = true; st.mood = 'worried'; st.blink = 0; st.armR = reach(g, 1, lerp(g.sw * 0.8, g.hw * 0.9 + 70, k), lerp(g.ySh + 330, g.headY + g.hh * 0.55 + ch, k), { planar: true }); st.items.R = penItem; st.look = -0.4; st.lookY = -0.2; }
    if (t > endOf('o2_b') + 0.1) { st.mood = 'sad'; st.blink = 0; } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0, 0.1)) { const u = t - SP.o3_h.t; st.mood = u > 1.6 ? 'worried' : 'neutral'; if (u > 2.4) { st.look = -1; st.turn = -0.4; st.lookY = -0.4; } }
    st.armR = reach(g, 1, CASEX - X.bf - 70, -760, { planar: true });
    if (speaking('o3_b', t, 0.05, 0.05)) { st.mood = 'worried'; st.headY = 6; }
    if (t > e('squat')) { g = G.bfS; const k = eIO(clamp((t - e('squat')) / 0.3)); st.legPose = 'squat'; st.drop = DROP * k; st.mood = 'worried'; st.blink = 0; st.turn = 0.3; st.look = 0.8;
      const cs = caseState(t, L), bx = bfX(t, L), left = cs.rot > 1 ? cs.x + 150 : cs.x - 120;   // after the tip the suitcase's left end is at its hinge corner
      const tx = clamp(left - bx - 10, -200, 520), ty = cs.rot > 1 ? -280 : -560 + cs.rot * 180;
      st.armR = reach(g, 1, tx, ty, { planar: true }); st.armL = reach(g, -1, -g.sw * 1.0, g.ySh + 260, { planar: true }); st.items.L = sheetItem;
      if (t > e('slide') + 0.9) { st.mood = 'happy'; st.squint = true; st.look = -0.6; st.turn = -0.2; } } }
  if (L === 'o4') { st.mood = 'happy'; st.look = -0.7;
    if (speaking('o4_h', t, 0, 0)) { const u = t - SP.o4_h.t; st.mood = u > 2.6 ? 'worried' : 'happy'; if (u > 4.0) { st.mood = 'shock'; st.blink = 0; } }
    if (t > endOf('o4_h')) { st.mood = 'worried'; st.blink = 0; }
    if (t > SP.o4_b.t - 0.1) { st.mood = 'worried'; st.items = {}; const r1 = ev('o4', 'rip1'), r2 = ev('o4', 'rip2'), tos = ev('o4', 'toss');
      const sp = t < r1 ? 0 : t < r2 ? 70 * eOut(clamp((t - r1) / 0.2)) : 40 + 30 * eOut(clamp((t - r2) / 0.2));
      st.armL = reach(g, -1, -g.sw * 0.35 - sp * 0.9, g.ySh + 280, { planar: true }); st.armR = reach(g, 1, g.sw * 0.35 + sp * 0.9, g.ySh + 280, { planar: true });
      if (t < tos) st.afterTorso = (c, gg) => { c.save(); c.translate(0, gg.ySh + 230); sheet(c, 1.1, t < r1 ? 1 : t < r2 ? 2 : 4, sp); c.restore(); };
      else { st.armL = open(g, -1, 1.7, 40); st.armR = open(g, 1, 1.7, 40); st.mood = 'happy'; st.squint = true; } } }
  if (L === 'end') { st.mood = 'happy'; st.look = -0.4; st.squint = true;
    if (t > e('rattle')) { st.mood = 'worried'; st.squint = false; st.look = -1; st.turn = -0.4; }
    if (t > e('burst')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > SP.end_b.t - 0.15) { st.mood = 'worried'; st.look = -0.7; st.turn = -0.25; st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 120, { planar: true }); st.items = { R: keyItem }; st.armL = hold(g, -1, 330, 0.7); }
    if (t > e('face')) { st.mood = 'happy'; st.squint = true; }
    if (t > e('endw')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; } }
  return st; }

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'bf'], cover: ['her', 'bf'], two: ['her', 'bf'], her: ['her'], bf: ['bf'], cal: [], endw: ['her', 'bf'], ward: ['her'] };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  calendar(c, t, L); K.mark(c, 'calendar', CALX, CALY, 240);
  const wk = L === 'end' ? { open: eBack(clamp((t - ev('end', 'burst')) / 0.3), 1.4), shake: t > ev('end', 'rattle') && t < ev('end', 'burst') ? 1 : 0 } : { open: 0, shake: 0 };
  wardrobe(c, t, wk.open, wk.shake);
  if (L === 'end' && t > ev('end', 'burst')) { const b = boxState(t); c.save(); c.translate(b.x + 280, 0); c.rotate(b.rot); c.translate(-280, 0); giftBox(c, t, revealK(t)); c.restore(); K.mark(c, 'box', b.x + 100, -600, 420); }
  const cs = caseShown(L) ? caseState(t, L) : null;
  if (cs) drawCase(c, cs);
  bed(c);
  if (who.includes('her')) { const st = herState(t, L); heads.her = K.put(c, HER, st, X.her, 0); const b = BAL(G.her); balloon(c, t, X.her + b.x, b.y, balloonK(t, L)); }
  if (who.includes('bf')) { const st = bfState(t, L); heads.bf11 = K.put(c, BF, st, bfX(t, L), 0);
    if (L === 'o2' && t > ev('o2', 'pen') + 0.3) { const hd = heads.bf11, u = t - ev('o2', 'pen'); sweat(c, hd.x - hd.hh * 0.8, hd.y - hd.hh * 0.5 + (u % 1.2) * 60, 1.2); }
    if (L === 'o4' && t > SP.o4_h.t + 4.2 && t < SP.o4_b.t + 0.5) { const hd = heads.bf11; sweat(c, hd.x - hd.hh * 0.85, hd.y - hd.hh * 0.4 + ((t - SP.o4_h.t) % 1.2) * 50, 1.2); } }
  // o4: the BREAK pieces flutter down after the toss
  if (L === 'o4' && t > ev('o4', 'toss') && who.includes('bf')) { const u = t - ev('o4', 'toss');
    for (let i = 0; i < 4; i++) { const sx = i % 2 ? 1 : -1, x = bfX(t, L) + sx * (140 + u * 160 + i * 20), y = G.bf.ySh + 200 - Math.max(0, 260 - u * 420) + u * u * 260 + Math.sin(u * 6 + i) * 30; c.save(); c.translate(x, Math.min(y, -30)); c.rotate(u * (3 + i) * sx); c.fillStyle = '#FFFFFF'; c.strokeStyle = '#3E471E'; c.lineWidth = 3; c.fillRect(-50, -36, 100, 72); c.strokeRect(-50, -36, 100, 72); c.restore(); } }
  if (L === 'end' && t > ev('end', 'endw') + 0.6) { const u = t - ev('end', 'endw') - 0.6, b = boxState(t), k = eBack(clamp(u / 0.3), 2); star(c, b.x + 280 - 200, -1100, 60 * k); star(c, b.x + 280 + 220, -700, 40 * k, 0.9); }
  if (L === 'hook' && t > hev('cal') && t < hev('bf')) { const k = eBack(clamp((t - hev('cal')) / 0.3), 2); star(c, CALX + 120, CALY - 10, 30 * k); }
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(70, fy(HY('bf'), 0.56, 1000), 0.56, 'cover'), WIDE: S(150, fy(HY('bf'), 0.52, 640), 0.52, 'wide'), TWO: S(150, fy(HY('bf'), 0.74, 1010), 0.74, 'two'),
  HER: S(X.her + 40, fy(HY('her'), 1.0), 1.0, 'her'), HER_CU: S(X.her + 10, fy(HY('her'), 1.35, 980), 1.35, 'her'), HER_W: S(X.her + 60, fy(HY('her'), 0.75, 600), 0.75, 'her'), HER_R: S(X.her + 20, fy(HY('her'), 1.05, 960), 1.05, 'her'),
  HER_CAL: S(-120, fy(HY('her'), 0.85, 880), 0.85, 'her'),
  CAL: S(CALX, CALY - 20, 1.9, 'cal'),
  BF: S(X.bf + 60, fy(HY('bf'), 0.95, 900), 0.95, 'bf'), BF_CU: S(X.bf + 10, fy(HY('bf'), 1.3, 960), 1.3, 'bf'), BF_CASE: S(X.bf + 180, fy(HY('bf'), 0.72, 640), 0.72, 'bf'),
  UNDER: S(1250, fy(HY('bf'), 0.6, 700), 0.6, 'bf'),
  WARD: S(-860, -982, 0.55, 'ward'), ENDW: S(-150, fy(HY('bf'), 0.48, 640), 0.48, 'endw'), BOX: U('box', 1) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < 2.75) return SH.COVER; if (t < hev('her') - 0.02) return f(SH.TWO); if (t < hev('cal') - 0.02) return f(SH.HER_CU); if (t < hev('bf') - 0.02) return f(SH.CAL); if (t < hev('eyes') - 0.05) return f(SH.BF); if (t < hev('wide') - 0.05) return f(SH.HER_CU); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < endOf('o1_h') + 0.02) return f(SH.HER); if (t < e('cal') - 0.02) return f(SH.BF_CASE); if (t < e('cal') + 1.4) return f(SH.CAL); return f(SH.HER_R); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < endOf('o2_h') + 0.02) return f(SH.HER); if (t < e('herW') - 0.02) return f(SH.BF_CU); if (t < SP.o2_nar.t + 0.9) return f(SH.HER_W); return f(SH.TWO); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_b.t - 0.1) return f(SH.HER_CAL); if (t < e('squat') - 0.02) return f(SH.BF); if (t < SP.o3_nar.t + 0.9) return f(SH.UNDER); return f(SH.HER_R); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('two') - 0.02) return f(SH.HER); if (t < SP.o4_b.t - 0.1) return f(SH.TWO); return f(SH.BF_CU); }
  if (L === 'end') { if (t < e('insert') - 0.02) return f(SH.WARD); if (t < SP.end_b.t - 0.1) return f(SH.BOX); if (t < e('face') - 0.02) return f(SH.BF); if (t < e('endw') - 0.02) return f(SH.HER); return f(SH.ENDW); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- insert: the gift box on a solid backdrop
function boxView(c, t) { const a = ev('end', 'insert'), u = t - a; c.fillStyle = '#7A3A6A'; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'box' });
  c.fillStyle = 'rgba(255,255,255,.05)'; for (let k = 0; k < 12; k++) c.fillRect(0, k * 180, W, 70);
  const k = eBack(clamp(u / 0.3), 1.8); c.save(); c.translate(540, 1500); c.scale(0.95 * k, 0.95 * k); c.rotate(0.02 * Math.sin(t * 3)); giftBox(c, t, 0, 1); c.restore();
  const tk = eBack(clamp((u - 0.45) / 0.3), 2); if (tk > 0) { c.save(); c.translate(820, 520); c.rotate(0.18); c.scale(tk, tk); c.strokeStyle = '#F2C14E'; c.lineWidth = 6; c.beginPath(); c.moveTo(-150, -40); c.lineTo(-260, -120); c.stroke();
    c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -150 + 8, -70 + 10, 300, 140, 16); c.fill(); c.fillStyle = '#FFFDF6'; rr(c, -150, -70, 300, 140, 16); c.fill(); c.strokeStyle = '#3E471E'; c.lineWidth = 4; c.stroke();
    fitTxt(c, 'HAPPY', 0, -24, 46, '#D62E3A', 260, 'Unb9'); fitTxt(c, 'BIRTHDAY!', 0, 30, 46, '#D62E3A', 260, 'Unb9'); c.restore(); } }

// ---------------- overlays: title, comment plate, option plates
function title(c, t) { const a = 1 - P(t, hev('title_out') - 0.25, hev('title_out')); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
function commentPlate(c, t) { const a = hev('plate'), k = eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, SC.hook.e - 0.25, SC.hook.e - 0.05)); if (k <= 0) return;
  c.save(); c.translate(540, 350); c.rotate(-0.025); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, -450 + 8, -150 + 12, 900, 300, 34); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -450, -150, 900, 300, 34); c.fill();
  c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(-340, 145); c.lineTo(-300, 193); c.lineTo(-280, 145); c.fill();
  c.fillStyle = '#EE5E9A'; rr(c, -450, -150, 900, 70, [34, 34, 0, 0]); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -410, -133, 46, 34, 10); c.fill(); c.beginPath(); c.moveTo(-402, -103); c.lineTo(-406, -87); c.lineTo(-386, -101); c.fill();
  fitTxt(c, 'Вопрос из комментариев:', -345, -115, 36, '#FFFFFF', 700, 'Nun9', 'left');
  fitTxt(c, 'за неделю до моего дня рождения', 0, -30, 46, '#1E2030', 840, 'Unb9'); fitTxt(c, 'он предложил «отдохнуть', 0, 30, 46, '#1E2030', 840, 'Unb9'); fitTxt(c, 'друг от друга». Совпадение?', 0, 90, 46, '#1E2030', 840, 'Unb9');
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 90, y: 200, w: 900, h: 300, k, id: 'comment' }); }
const PLATES = { o1: ['1', 'ХОЛОДНО', '#E0474C'], o2: ['2', 'С ЮМОРОМ', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD8'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  c.save(); UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, s = k * Math.min(lerp(1, 1.4, big), 900 / w), y = 215;
  c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w * s / 2, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: «КАКОЙ ОТВЕТ ТВОЙ?», 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor (all inside x 60–940)
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, wt = (w, d) => K.wordT('outro', w) ?? (sp.t + d), CX = 500;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + boyfriend (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34; 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gb = G.bf, b = BAL(g);
    K.put(c, BF, { t, mood: 'happy', laugh: true, squint: true, turn: -0.2, look: -0.5, armL: open(gb, -1, 1.5, 60 + Math.sin(t * 7) * 20), armR: hold(gb, 1, 330, 0.8), items: { R: keyItem } }, 640, 60);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0.1, look: 0.3, armL: reach(g, -1, b.x, b.y, { planar: true }), armR: open(g, 1, 1.6, 100 + Math.sin(t * 8) * 20) }, 0, 0); balloon(c, t, b.x, b.y, 1); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.15, 0.5), 2.2);
  if (q > 0) { c.save(); c.translate(CX, 290); c.scale(q, q); UI.font(c, 'Unb9', 76); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'КАКОЙ ОТВЕТ', 0, -48, C.oliveD, C.white, 14); UI.strokeText(c, 'ТВОЙ?', 0, 48, C.pink, C.white, 14); c.restore(); }
  const rows = [['1', 'ХОЛОДНО', 'Fine. Bye.', '#E0474C', 'один'], ['2', 'С ЮМОРОМ', 'A break? From buying presents?', '#F2B33D', 'два'], ['3', 'КАК НОСИТЕЛЬ', 'Interesting timing.', '#4CAF6A', 'три'], ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', "I'll celebrate with people who remembered.", '#8E5BD8', 'четыре']];
  rows.forEach(([n, ru, en, col, w], i) => { const a = wt(w, 1.3 + i * 0.35) - 0.1, k = eBack(P(t, a, a + 0.28), 2.0); if (k <= 0) return; const y = 520 + i * 160;
    c.save(); c.translate(CX, y); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.16)'; rr(c, -420 + 8, -66 + 12, 840, 132, 36); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -420, -66, 840, 132, 36); c.fill(); c.stroke();
    c.fillStyle = col; c.beginPath(); c.arc(-340, 0, 50, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); fitTxt(c, n, -340, 4, 70, C.white, 70);
    fitTxt(c, ru, -265, -24, 40, C.oliveD, 650, 'Unb9', 'left'); fitTxt(c, en, -265, 28, 34, C.pinkD, 650, 'Nun9', 'left'); c.restore(); });
  const bt = wt('пиши', 3.55) - 0.2, bk = eBack(P(t, bt, bt + 0.35), 2.2), by = 1185;
  if (bk > 0) { c.save(); c.translate(CX, by); c.scale(bk, bk); c.fillStyle = C.gold; rr(c, -420, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-370, -30); c.lineTo(-330, -30); c.lineTo(-330, 32); c.lineTo(-350, 16); c.lineTo(-370, 32); c.closePath(); c.fill(); fitTxt(c, 'СОХРАНИ', -200, 4, 40, C.oliveD, 250);
    const subT = bt + 0.6, click = P(t, subT + 0.55, subT + 0.7), pressed = t > subT + 0.65, ss = 1 - 0.08 * Math.sin(click * Math.PI);
    c.save(); c.translate(220, 0); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -200, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); fitTxt(c, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4, 40, C.white, 340); c.restore(); c.restore();
    const mv = eIO(P(t, subT, subT + 0.55)); UI.tapCursor(c, lerp(930, CX + 260, mv), lerp(by + 330, by + 10, mv), 1, P(t, subT + 0.6, subT + 1.1)); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads = {}, proj;
  if (tag.startsWith('ui:')) { boxView(c, t); proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  // bubbles only for characters drawn in this shot (an off-screen speaker never gets a bubble over another shot)
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, hold: { hook_b: -0.2, o1_h: -0.22, o1_b: -0.2, o2_h: -0.22, o2_b: -0.2, o3_h: -0.22, o3_b: -0.2, o4_h: -0.15, o4_b: 0.2, end_b: -0.2 } });
  if (L === 'hook') { title(c, t); commentPlate(c, t); }
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('pause', NF, renderFrame);
