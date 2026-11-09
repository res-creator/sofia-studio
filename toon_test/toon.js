// Original sitcom-cartoon cast: Earl Pickens (dad), Penny (daughter), Fridge (smart fridge).
// Style: thick black outlines, flat colours, big round eyes, overbite muzzle, 4 fingers.
const OL = '#1d1a24';
const LW = 7;

function shape(ctx, path, fill, lw = LW) {
  ctx.beginPath(); path(ctx);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = OL; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
}
const ell = (x, y, rx, ry, r = 0) => c => c.ellipse(x, y, rx, ry, r, 0, Math.PI * 2);
function rrect(x, y, w, h, r) { return c => { c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }; }
function stroke(ctx, pts, w, col, cap = 'round') {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = cap; ctx.lineJoin = 'round'; ctx.stroke();
}
function limb(ctx, pts, w, col) { stroke(ctx, pts, w + LW * 2, OL); stroke(ctx, pts, w, col); }
// two-bone arm with elbow bending outward
function arm(ctx, sx, sy, hx, hy, len, side, w, col) {
  const dx = hx - sx, dy = hy - sy, d = Math.min(Math.hypot(dx, dy), len * 1.98);
  const ux = dx / (Math.hypot(dx, dy) || 1), uy = dy / (Math.hypot(dx, dy) || 1);
  const ex = hx - ux * 0, k = Math.sqrt(Math.max(0, len * len - (d / 2) ** 2));
  const mx = sx + ux * d / 2, my = sy + uy * d / 2;
  const elx = mx - uy * k * side, ely = my + ux * k * side;
  limb(ctx, [[sx, sy], [elx, ely], [sx + ux * d, sy + uy * d]], w, col);
  return [sx + ux * d, sy + uy * d];
}
// cartoon 4-finger hand. kind: open | fist
function hand(ctx, x, y, r, ang, kind, skin) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  if (kind === 'fist') { shape(ctx, ell(0, 0, r * 1.05, r * 0.95), skin); stroke(ctx, [[r * 0.2, -r * 0.6], [r * 0.2, r * 0.6]], 4, OL); }
  else {
    for (let i = 0; i < 3; i++) { const a = -0.5 + i * 0.5; shape(ctx, ell(Math.cos(a) * r * 1.1, Math.sin(a) * r * 1.1, r * 0.55, r * 0.3, a), skin, 5); }
    shape(ctx, ell(r * 0.15, -r * 0.95, r * 0.28, r * 0.5, 0.3), skin, 5);
    shape(ctx, ell(0, 0, r * 0.85, r * 0.85), skin);
  }
  ctx.restore();
}
function eye(ctx, x, y, r, p) {
  // p: {look:[x,y], lid:0..1, wide, shut, happy}
  if (p.happy) { stroke(ctx, [[x - r * 0.8, y + r * 0.2], [x, y - r * 0.5], [x + r * 0.8, y + r * 0.2]], 7, OL); return; }
  shape(ctx, ell(x, y, r * (p.wide ? 1.15 : 1), r * (p.wide ? 1.2 : 1)), '#fff');
  if (p.shut) { stroke(ctx, [[x - r * 0.9, y], [x + r * 0.9, y]], 7, OL); return; }
  const pr = p.wide ? r * 0.16 : r * 0.24, lx = (p.look || [0.3, 0])[0], ly = (p.look || [0, 0])[1];
  ctx.beginPath(); ctx.arc(x + lx * r * 0.5, y + ly * r * 0.45, pr, 0, 7); ctx.fillStyle = OL; ctx.fill();
  const lid = p.lid || 0;
  if (lid > 0.02) {
    ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, r, r, 0, 0, 7); ctx.clip();
    ctx.fillStyle = p.skin; ctx.fillRect(x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4 * lid * 0.5 + r * 0.02);
    ctx.restore();
    stroke(ctx, [[x - r, y - r + 2 * r * lid * 0.5], [x + r, y - r + 2 * r * lid * 0.5]], 6, OL);
  }
}
// mouth: open 0..1, smile -1..1, teeth, grit
function mouth(ctx, x, y, w, p) {
  const o = p.open || 0, sm = p.smile ?? 0.3;
  if (p.grit) {
    shape(ctx, rrect(x - w * 0.55, y - w * 0.16, w * 1.1, w * 0.34, 10), '#fff', 6);
    for (let i = 1; i < 5; i++) stroke(ctx, [[x - w * 0.55 + i * w * 0.22, y - w * 0.16], [x - w * 0.55 + i * w * 0.22, y + w * 0.18]], 4, OL);
    stroke(ctx, [[x - w * 0.55, y + 0.01], [x + w * 0.55, y + 0.01]], 4, OL);
    return;
  }
  if (o < 0.08) {
    ctx.beginPath(); ctx.moveTo(x - w * 0.5, y - sm * w * 0.12); ctx.quadraticCurveTo(x, y + sm * w * 0.32, x + w * 0.5, y - sm * w * 0.12);
    ctx.lineWidth = 7; ctx.strokeStyle = OL; ctx.lineCap = 'round'; ctx.stroke(); return;
  }
  const h = w * (0.12 + o * 0.6);
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x - w * 0.5, y - sm * w * 0.1);
  ctx.quadraticCurveTo(x, y - h * 0.35 + sm * w * 0.05, x + w * 0.5, y - sm * w * 0.1);
  ctx.quadraticCurveTo(x, y + h * 1.25, x - w * 0.5, y - sm * w * 0.1); ctx.closePath();
  ctx.fillStyle = '#5a1620'; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.beginPath(); ctx.ellipse(x, y + h * 0.95, w * 0.3, h * 0.45, 0, 0, 7); ctx.fillStyle = '#e8606b'; ctx.fill();
  if (p.teeth !== false) { ctx.fillStyle = '#fff'; ctx.fillRect(x - w * 0.5, y - h, w, h * 0.62); }
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(x - w * 0.5, y - sm * w * 0.1);
  ctx.quadraticCurveTo(x, y - h * 0.35 + sm * w * 0.05, x + w * 0.5, y - sm * w * 0.1);
  ctx.quadraticCurveTo(x, y + h * 1.25, x - w * 0.5, y - sm * w * 0.1); ctx.closePath();
  ctx.lineWidth = 7; ctx.strokeStyle = OL; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}

// ---------- EARL ----------
const ESKIN = '#F6C597', ESKIN_D = '#E2A878';
function drawEarl(ctx, x, fy, s, p = {}) {
  ctx.save(); ctx.translate(x, fy); ctx.scale(s * (p.face || 1), s);
  const bob = p.bob || 0, sq = p.squash || 0;
  ctx.translate(0, -bob); ctx.scale(1 + sq * 0.06, 1 - sq * 0.06);
  // legs + slippers
  const lp = p.legs || [0, 0];
  limb(ctx, [[-62, -270], [-66 + lp[0], -40 - Math.max(0, lp[0]) * 0.4]], 70, '#4E7FC4');
  limb(ctx, [[62, -270], [66 + lp[1], -40 - Math.max(0, lp[1]) * 0.4]], 70, '#4E7FC4');
  shape(ctx, ell(-58 + lp[0], -22 - Math.max(0, lp[0]) * 0.4, 62, 28), '#8A5A3B');
  shape(ctx, ell(80 + lp[1], -22 - Math.max(0, lp[1]) * 0.4, 62, 28), '#8A5A3B');
  // pajama stripes on legs
  // body
  const rb = [p.armR || [195, -250], p.armL || [-195, -250]];
  // back arm (left side, behind)
  const hl = arm(ctx, -150, -560, rb[1][0], rb[1][1], 175, 1, 62, '#C8423A');
  hand(ctx, hl[0], hl[1], 30, p.handLAng ?? 1.6, p.handL || 'open', ESKIN);
  // torso: robe (pear shape) with belly showing
  const robe = c => { c.moveTo(-70, -640); c.quadraticCurveTo(-150, -630, -170, -570); c.quadraticCurveTo(-240, -400, -200, -190); c.lineTo(200, -190); c.quadraticCurveTo(240, -400, 170, -570); c.quadraticCurveTo(150, -630, 70, -640); c.closePath(); };
  shape(ctx, robe, '#C8423A');
  shape(ctx, c => { c.moveTo(-62, -640); c.quadraticCurveTo(-150, -420, -95, -192); c.lineTo(95, -192); c.quadraticCurveTo(150, -420, 62, -640); c.closePath(); }, '#F4F1E8', 6);
  stroke(ctx, [[-62, -640], [-30, -540], [-10, -640]], 6, OL);
  shape(ctx, ell(0, -440, 9, 7), null, 5);
  shape(ctx, rrect(-215, -330, 430, 34, 14), '#9E2E28', 6);
  shape(ctx, c => { c.moveTo(-40, -300); c.lineTo(-70, -215); c.lineTo(-40, -220); c.closePath(); }, '#9E2E28', 5);
  // head
  ctx.save(); ctx.translate(0, -640); ctx.rotate(p.tilt || 0); ctx.translate(0, -p.headUp || 0);
  // neck
  shape(ctx, rrect(-60, -60, 120, 70, 20), ESKIN);
  // side hair tufts behind ears
  const hairC = '#7A4A2A';
  shape(ctx, c => { c.moveTo(-118, -190); c.quadraticCurveTo(-160, -170, -140, -130); c.quadraticCurveTo(-170, -110, -125, -80); c.lineTo(-105, -120); c.closePath(); }, hairC, 6);
  // cranium
  shape(ctx, c => { c.moveTo(-80, -10); c.quadraticCurveTo(-118, -40, -120, -120); c.lineTo(-120, -230); c.quadraticCurveTo(-110, -330, 0, -335); c.quadraticCurveTo(110, -330, 115, -230); c.lineTo(115, -60); c.closePath(); }, ESKIN);
  // shine on bald head
  ctx.save(); ctx.globalAlpha = 0.55; shape(ctx, ell(-35, -290, 34, 14, -0.3), '#FFE7CF', 0); ctx.restore();
  // comb-over: 3 wavy hairs
  for (let i = 0; i < 3; i++) {
    const hx = -40 + i * 30, up = p.hairUp || 0;
    ctx.beginPath(); ctx.moveTo(hx, -332);
    if (up > 0.5) { ctx.quadraticCurveTo(hx - 15, -380, hx + 5, -420); }
    else { ctx.bezierCurveTo(hx + 20, -360, hx + 40, -350, hx + 55, -330); }
    ctx.lineWidth = 6; ctx.strokeStyle = OL; ctx.stroke();
  }
  // ear
  shape(ctx, ell(-112, -150, 26, 36), ESKIN);
  stroke(ctx, [[-118, -168], [-104, -150], [-116, -132]], 4, OL);
  // muzzle (overbite jowls)
  shape(ctx, c => { c.moveTo(-30, -150); c.bezierCurveTo(-110, -110, -60, 15, 55, 12); c.bezierCurveTo(165, 8, 185, -95, 135, -150); c.quadraticCurveTo(50, -125, -30, -150); c.closePath(); }, '#F0BB8B');
  mouth(ctx, 70, -62, 110, p.mouth || {});
  // eyes
  const ep = Object.assign({ skin: ESKIN, look: [0.35, 0] }, p.eyes || {});
  eye(ctx, 18, -205, 44, ep); eye(ctx, 98, -208, 44, ep);
  // unibrow
  const br = p.brow || 0; // -1 worried, 1 angry
  ctx.beginPath(); ctx.moveTo(-28, -262 - br * -8); ctx.quadraticCurveTo(58, -282 + br * 18, 145, -262 - br * -8 + br * 14);
  ctx.lineWidth = 16; ctx.strokeStyle = '#5A3420'; ctx.lineCap = 'round'; ctx.stroke();
  // nose
  shape(ctx, ell(122, -150, 40, 30, 0.2), ESKIN);
  // blush / sweat
  if (p.sweat) for (const [sx, sy] of [[-60, -230], [150, -250]]) shape(ctx, c => { c.moveTo(sx, sy - 22); c.quadraticCurveTo(sx + 14, sy, sx, sy + 8); c.quadraticCurveTo(sx - 14, sy, sx, sy - 22); }, '#9fd8ff', 4);
  if (p.tears) { ctx.save(); ctx.globalAlpha = 0.9; for (const ex of [18, 98]) { const tt = p.tears; ctx.fillStyle = '#7cc6ff'; ctx.beginPath(); ctx.moveTo(ex - 10, -170); ctx.quadraticCurveTo(ex - 22, -120 + (tt * 60 % 40), ex - 8, -40); ctx.lineTo(ex + 8, -40); ctx.quadraticCurveTo(ex + 22, -120, ex + 10, -170); ctx.fill(); } ctx.restore(); }
  // disguise: groucho glasses + moustache
  if (p.disguise) {
    ctx.save(); const k = p.disguise; ctx.translate(60, -150); ctx.scale(k, k);
    ctx.lineWidth = 9; ctx.strokeStyle = OL;
    ctx.beginPath(); ctx.arc(-42, -55, 50, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(40, -58, 50, 0, 7); ctx.stroke();
    stroke(ctx, [[-130, -60], [-92, -58]], 8, OL);
    stroke(ctx, [[-50, -118], [-6, -128]], 18, '#2a1b12'); stroke(ctx, [[22, -128], [80, -118]], 18, '#2a1b12');
    shape(ctx, c => { c.moveTo(-40, 50); c.quadraticCurveTo(-10, 18, 40, 38); c.quadraticCurveTo(110, 25, 130, 75); c.quadraticCurveTo(90, 60, 45, 70); c.quadraticCurveTo(0, 80, -40, 50); c.closePath(); }, '#2a1b12', 5);
    ctx.restore();
  }
  ctx.restore();
  // front arm (right side)
  const hr = arm(ctx, 150, -560, rb[0][0], rb[0][1], 175, -1, 62, '#C8423A');
  if (p.holdR) p.holdR(ctx, hr[0], hr[1]);
  hand(ctx, hr[0], hr[1], 30, p.handRAng ?? 1.5, p.handR || 'open', ESKIN);
  if (p.holdBoth) p.holdBoth(ctx, hl, hr);
  ctx.restore();
}

// ---------- PENNY ----------
const PSKIN = '#F6C597';
function drawPenny(ctx, x, fy, s, p = {}) {
  ctx.save(); ctx.translate(x, fy); ctx.scale(s * (p.face || -1), s); ctx.translate(0, -(p.bob || 0));
  const lp = p.legs || [0, 0];
  limb(ctx, [[-28, -170], [-30 + lp[0], -30]], 40, '#F59BC0'); limb(ctx, [[28, -170], [30 + lp[1], -30]], 40, '#F59BC0');
  // bunny slippers
  for (const [sx, off] of [[-34, lp[0]], [40, lp[1]]]) { shape(ctx, ell(sx + off, -16, 40, 20), '#fff', 6); shape(ctx, ell(sx + off + 14, -44, 8, 20, 0.3), '#fff', 5); }
  const hl = arm(ctx, -70, -330, (p.armL || [-90, -190])[0], (p.armL || [-90, -190])[1], 90, -1, 36, '#F59BC0');
  hand(ctx, hl[0], hl[1], 18, 1.5, 'open', PSKIN);
  // nightgown
  shape(ctx, c => { c.moveTo(-70, -360); c.quadraticCurveTo(-120, -240, -110, -150); c.lineTo(110, -150); c.quadraticCurveTo(120, -240, 70, -360); c.closePath(); }, '#F59BC0');
  // star
  ctx.save(); ctx.translate(0, -255); ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 14 : 32, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fillStyle = '#FFE15A'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = OL; ctx.stroke(); ctx.restore();
  // head
  ctx.save(); ctx.translate(0, -370); ctx.rotate(p.tilt || 0);
  shape(ctx, rrect(-30, -40, 60, 50, 14), PSKIN);
  const hc = '#3B2418';
  shape(ctx, ell(-125, -235, 62, 62), hc); shape(ctx, ell(125, -235, 62, 62), hc);
  shape(ctx, ell(0, -150, 125, 135), PSKIN);
  // fringe of curls
  shape(ctx, c => { c.moveTo(-128, -150); c.quadraticCurveTo(-140, -300, 0, -292); c.quadraticCurveTo(140, -300, 128, -150); c.quadraticCurveTo(110, -215, 60, -222); c.quadraticCurveTo(30, -190, 0, -225); c.quadraticCurveTo(-30, -190, -60, -222); c.quadraticCurveTo(-110, -215, -128, -150); c.closePath(); }, hc);
  const ep = Object.assign({ skin: PSKIN, look: [0.3, 0] }, p.eyes || {});
  eye(ctx, -18, -150, 34, ep); eye(ctx, 74, -150, 34, ep);
  // glasses
  ctx.lineWidth = 7; ctx.strokeStyle = '#7A3FB0'; ctx.beginPath(); ctx.arc(-18, -150, 44, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(74, -150, 44, 0, 7); ctx.stroke();
  stroke(ctx, [[26, -152], [30, -152]], 7, '#7A3FB0');
  if (p.smug) { stroke(ctx, [[-50, -212], [25, -200]], 9, hc); stroke(ctx, [[40, -215], [110, -222]], 9, hc); }
  shape(ctx, ell(98, -105, 18, 14), PSKIN, 5);
  ctx.save(); ctx.globalAlpha = 0.35; shape(ctx, ell(-40, -88, 20, 12), '#ff6f8a', 0); shape(ctx, ell(115, -78, 16, 10), '#ff6f8a', 0); ctx.restore();
  mouth(ctx, 50, -60, 56, Object.assign({ smile: 0.6 }, p.mouth || {}));
  ctx.restore();
  const hr = arm(ctx, 70, -330, (p.armR || [90, -190])[0], (p.armR || [90, -190])[1], 90, 1, 36, '#F59BC0');
  if (p.holdR) { ctx.save(); ctx.translate(hr[0], hr[1]); if ((p.face || -1) < 0) ctx.scale(-1, 1); p.holdR(ctx); ctx.restore(); }
  hand(ctx, hr[0], hr[1], 18, 1.4, 'fist', PSKIN);
  ctx.restore();
}

// ---------- FRIDGE ----------
// screen: {mode:'face'|'off'|'text'|'battery'|'salad'|'sandwich', mood, talk, text, col}
function drawFridge(ctx, x, fy, p = {}, t = 0) {
  const W = 430, H = 1010, x0 = x - W / 2, y0 = fy - H;
  // shadow
  ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(x, fy + 4, W * 0.55, 22, 0, 0, 7); ctx.fill(); ctx.restore();
  // door open (lower door swings: draw interior + door panel)
  const dOpen = p.door || 0;
  shape(ctx, rrect(x0, y0, W, H, 46), '#7CCBC0');
  // interior when open
  if (dOpen > 0) {
    ctx.save(); shape(ctx, rrect(x0 + 24, y0 + 330, W - 48, H - 370, 20), '#FFF9D8');
    ctx.globalAlpha = 0.6; ctx.fillStyle = '#fff'; ctx.fillRect(x0 + 24, y0 + 330, W - 48, H - 370); ctx.restore();
    for (let k = 0; k < 3; k++) stroke(ctx, [[x0 + 30, y0 + 520 + k * 150], [x0 + W - 30, y0 + 520 + k * 150]], 6, '#9ab');
    // little food
    shape(ctx, rrect(x0 + 60, y0 + 440, 70, 80, 10), '#fff', 5); shape(ctx, rrect(x0 + 260, y0 + 600, 110, 70, 10), '#ffd36b', 5);
    // swinging door panel (perspective sliver to the right)
    const dw = W * (1 - dOpen * 0.85);
    shape(ctx, c => { c.moveTo(x0 + W, y0 + 320); c.lineTo(x0 + W + (W - dw) * 0.35, y0 + 300); c.lineTo(x0 + W + (W - dw) * 0.35, fy - 10); c.lineTo(x0 + W, fy - 30); c.closePath(); }, '#69b8ad');
  } else {
    stroke(ctx, [[x0 + 6, y0 + 320], [x0 + W - 6, y0 + 320]], 7, OL);
    // handle lower
    shape(ctx, rrect(x0 + W - 70, y0 + 400, 26, 220, 13), '#d9e3ea', 6);
  }
  shape(ctx, rrect(x0 + W - 70, y0 + 60, 26, 170, 13), '#d9e3ea', 6);
  // highlight
  ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#fff'; ctx.fillRect(x0 + 28, y0 + 40, 22, 250); if (!dOpen) ctx.fillRect(x0 + 28, y0 + 350, 22, 560); ctx.restore();
  // magnets
  if (!dOpen) { shape(ctx, ell(x0 + 110, y0 + 420, 22, 22), '#ff7a59', 5); shape(ctx, rrect(x0 + 180, y0 + 470, 110, 130, 6), '#fff', 5); stroke(ctx, [[x0 + 200, y0 + 500], [x0 + 270, y0 + 500]], 5, '#c33'); stroke(ctx, [[x0 + 200, y0 + 530], [x0 + 260, y0 + 530]], 5, '#c33'); stroke(ctx, [[x0 + 200, y0 + 560], [x0 + 250, y0 + 560]], 5, '#c33'); }
  // screen
  const sx = x0 + 70, sy = y0 + 70, sw = 260, sh = 190;
  shape(ctx, rrect(sx, sy, sw, sh, 26), '#14202c');
  const mode = p.mode || 'off', col = p.col || '#5ff0ff';
  if (mode !== 'off') {
    ctx.save(); ctx.beginPath(); rrect(sx + 6, sy + 6, sw - 12, sh - 12, 20)(ctx); ctx.clip();
    const g = ctx.createRadialGradient(sx + sw / 2, sy + sh / 2, 10, sx + sw / 2, sy + sh / 2, 200); g.addColorStop(0, col + '55'); g.addColorStop(1, '#14202c'); ctx.fillStyle = g; ctx.fillRect(sx, sy, sw, sh);
    const cx = sx + sw / 2, cy = sy + sh / 2;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 10;
    if (mode === 'face') {
      const m = p.mood || 'happy';
      for (const ex of [cx - 58, cx + 58]) {
        ctx.beginPath();
        if (m === 'happy') { ctx.arc(ex, cy - 10, 26, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
        else if (m === 'flat') { ctx.moveTo(ex - 28, cy - 18); ctx.lineTo(ex + 28, cy - 18); ctx.stroke(); }
        else if (m === 'angry') { ctx.moveTo(ex - 28, cy - 34 + (ex < cx ? 0 : 16)); ctx.lineTo(ex + 28, cy - 34 + (ex < cx ? 16 : 0)); ctx.stroke(); ctx.beginPath(); ctx.arc(ex, cy - 6, 12, 0, 7); ctx.fill(); }
        else { ctx.ellipse(ex, cy - 14, 16, 22 * (p.blink ? 0.12 : 1), 0, 0, 7); ctx.fill(); }
      }
      const o = p.talk || 0;
      ctx.beginPath();
      if (o > 0.08) { ctx.ellipse(cx, cy + 46, 34, 6 + o * 22, 0, 0, 7); ctx.fill(); }
      else if (m === 'flat' || m === 'angry') { ctx.moveTo(cx - 32, cy + 46); ctx.lineTo(cx + 32, cy + 46); ctx.stroke(); }
      else { ctx.arc(cx, cy + 22, 36, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
    } else if (mode === 'text') {
      ctx.font = `bold ${p.size || 40}px FredokaL`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const L = p.text.split('\n'); L.forEach((s, i) => ctx.fillText(s, cx, cy + (i - (L.length - 1) / 2) * (p.size || 40) * 1.15));
    } else if (mode === 'battery') {
      ctx.lineWidth = 8; ctx.strokeRect(cx - 80, cy - 45, 150, 80); ctx.fillRect(cx + 72, cy - 20, 14, 30);
      ctx.fillRect(cx - 70, cy - 35, 130 * 0.99, 60);
      ctx.fillStyle = '#14202c'; ctx.font = 'bold 40px FredokaL'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('99%', cx - 5, cy - 4);
    } else if (mode === 'sandwich') {
      for (let i = 0; i < 4; i++) { const ix = cx - 96 + i * 64, iy = cy - 10; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ix - 24, iy + 20); ctx.lineTo(ix, iy - 22); ctx.lineTo(ix + 24, iy + 20); ctx.closePath(); ctx.stroke(); stroke(ctx, [[ix - 16, iy + 6], [ix + 16, iy + 6]], 5, col); }
      ctx.font = 'bold 38px FredokaL'; ctx.textAlign = 'center'; ctx.fillStyle = col; ctx.fillText('TODAY: 4', cx, cy + 72);
    } else if (mode === 'salad') {
      ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, 70, 0, Math.PI); ctx.closePath(); ctx.stroke();
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(cx - 45 + i * 30, cy - 12, 20, Math.PI, 0); ctx.stroke(); }
      ctx.font = 'bold 34px FredokaL'; ctx.textAlign = 'center'; ctx.fillText('SALAD', cx, cy + 66);
    }
    // scanlines
    ctx.globalAlpha = 0.12; ctx.fillStyle = '#000'; for (let yy = sy; yy < sy + sh; yy += 6) ctx.fillRect(sx, yy, sw, 2);
    ctx.restore();
  }
  // brand plate
  ctx.font = 'bold 22px FredokaL'; ctx.textAlign = 'center'; ctx.fillStyle = '#2f6f68'; ctx.fillText('CHILL-O-MATIC 3000', x - 20, y0 + 296);
  // feet
  shape(ctx, rrect(x0 + 30, fy - 14, 60, 18, 6), '#555', 5); shape(ctx, rrect(x0 + W - 90, fy - 14, 60, 18, 6), '#555', 5);
}

// props
function salad(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 0; i < 6; i++) shape(ctx, ell(-70 + i * 28, -26 - (i % 2) * 14, 34, 26, i), i % 3 === 2 ? '#e8473c' : '#5cc05a', 5);
  shape(ctx, c => { c.moveTo(-105, -20); c.lineTo(105, -20); c.quadraticCurveTo(95, 60, 0, 66); c.quadraticCurveTo(-95, 60, -105, -20); c.closePath(); }, '#f2f2f2');
  stroke(ctx, [[-90, 5], [90, 5]], 6, '#7fb8e6');
  ctx.restore();
}
function iceCream(ctx, s = 1, lick = 0) {
  ctx.save(); ctx.scale(s, s); ctx.translate(0, -10);
  shape(ctx, c => { c.moveTo(-30, -40); c.lineTo(30, -40); c.lineTo(0, 50); c.closePath(); }, '#E3A458', 6);
  stroke(ctx, [[-18, -20], [10, 20]], 4, '#a86a2a'); stroke(ctx, [[18, -20], [-6, 30]], 4, '#a86a2a');
  shape(ctx, ell(0, -62, 42, 36 - lick * 6), '#FFB6D0', 6); shape(ctx, ell(0, -102, 32, 28), '#fff3c8', 6);
  shape(ctx, ell(4, -138, 11, 11), '#e8333a', 5);
  ctx.restore();
}
module.exports = { drawEarl, drawPenny, drawFridge, salad, iceCream, shape, rrect, ell, stroke, OL };
