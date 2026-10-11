// Sofia character rig. Origin = hip centre, y down. ~ 820 units tall (feet +330 .. bun top -660).
const { OL, paint, line, curve, limb, ik, lerp, clamp, roundRect } = require('./draw');

const PAL = {
  skin: '#FFDCC6', skinSh: '#F4B79C', cheek: '#FF8F86', freckle: '#D98361',
  hair: '#EE5A2A', hairSh: '#BE3C1A', hairHi: '#FF9A5C',
  iris: '#3DAA6E', irisDk: '#1F6E45', pupil: '#16211B',
  mouth: '#6B1F25', tongue: '#F0727A', teeth: '#FFFFFF',
  pencil: '#FFC83D', pencilSh: '#E09A12', eraser: '#FF8FA6',
};
const OUTFITS = {
  sweater: { top: '#F4B63F', topSh: '#D8901C', trim: '#E2A22E', collar: '#FFFFFF', pants: '#4A63A8', pantsSh: '#364B86', shoe: '#FFFFFF', shoeAcc: '#EE5A2A' },
  pajama: { top: '#9ED3F0', topSh: '#6FB2DA', trim: '#FFFFFF', collar: '#FFFFFF', pants: '#9ED3F0', pantsSh: '#6FB2DA', shoe: '#FFB3C7', shoeAcc: '#FFFFFF', dots: true },
  mix: { top: '#F4B63F', topSh: '#D8901C', trim: '#E2A22E', collar: '#FFFFFF', pants: '#9ED3F0', pantsSh: '#6FB2DA', shoe: '#FFB3C7', shoeAcc: '#FFFFFF', pantsDots: true, oddShoe: true },
  blouse: { top: '#FFF4E4', topSh: '#E8D3B6', trim: '#F2E2CA', collar: '#FFF4E4', pants: '#8C6A4F', pantsSh: '#6E513B', shoe: '#5B3A2E', shoeAcc: '#8C6A4F' },
};

const DEF = {
  turn: 0, tilt: 0, lean: 0, squash: 1, bob: 0,
  look: [0, 0], blink: 0, wide: 0, happyEyes: 0, sleepy: 0,
  brow: { l: 0, r: 0, angry: 0, worry: 0 },
  mouth: { open: 0, smile: 0.5, w: 1, o: 0, teeth: 0 },
  blush: 0.35, sweat: 0,
  armL: null, armR: null, handL: 'mitten', handR: 'mitten', armsFront: false,
  legs: 'stand', walk: 0, sitH: 0,
  outfit: 'sweater', hair: 'bun', glasses: true, mask: false, hairMess: 0,
  holdR: null, holdL: null, // fn(ctx) drawn at hand
};

const SH_Y = -236, SH_X = 90, L1 = 118, L2 = 112;
const HEAD_Y = -455; // head centre
const NECK_Y = -298;

function merge(p) {
  const o = Object.assign({}, DEF, p);
  o.brow = Object.assign({}, DEF.brow, p.brow || {});
  o.mouth = Object.assign({}, DEF.mouth, p.mouth || {});
  return o;
}

// ---------- head pieces (head-local coords, centre 0,0) ----------
function facePath(ctx, t) {
  const cx = t * 18;
  ctx.moveTo(0, -150);
  ctx.bezierCurveTo(95, -150, 165, -95, 166, -5);
  ctx.bezierCurveTo(167, 75, 120, 128, cx + 28, 142);
  ctx.quadraticCurveTo(cx, 148, cx - 28, 142);
  ctx.bezierCurveTo(-120, 128, -167, 75, -166, -5);
  ctx.bezierCurveTo(-165, -95, -95, -150, 0, -150);
  ctx.closePath();
}

function eye(ctx, x, y, s, o, side) {
  const open = clamp(1 - o.blink) * (1 - o.sleepy * 0.55);
  const rx = 37 * s, ry = 45 * (1 + o.wide * 0.12);
  if (o.happyEyes > 0.5) { // ^ ^
    curve(ctx, [x - rx, y + 8], [x, y - 34], [x + rx, y + 8], 9, OL); return;
  }
  if (open < 0.12) { // closed lid
    curve(ctx, [x - rx, y + 4], [x, y + 18], [x + rx, y + 4], 8, OL);
    line(ctx, [[x + side * rx * 0.95, y + 4], [x + side * (rx + 12), y - 6]], 6, OL);
    return;
  }
  ctx.save();
  const top = y - ry * open, bot = y + ry;
  const p = c => { c.moveTo(x - rx, y); c.bezierCurveTo(x - rx, top - 6 * open, x + rx, top - 6 * open, x + rx, y); c.bezierCurveTo(x + rx, bot + 4, x - rx, bot + 4, x - rx, y); c.closePath(); };
  paint(ctx, p, '#FFFFFF', { lw: 0 });
  ctx.beginPath(); p(ctx); ctx.clip();
  const lx = x + o.look[0] * 14 * s + o.turn * 10, ly = y + 6 + o.look[1] * 12;
  const ir = 27 * (1 - o.wide * 0.25);
  ctx.beginPath(); ctx.arc(lx, ly, ir * s + 1, 0, 7); ctx.fillStyle = PAL.irisDk; ctx.fill();
  ctx.beginPath(); ctx.arc(lx, ly + 2, ir * s - 4, 0, 7); ctx.fillStyle = PAL.iris; ctx.fill();
  ctx.beginPath(); ctx.arc(lx, ly, (13 - o.wide * 5) * s, 0, 7); ctx.fillStyle = PAL.pupil; ctx.fill();
  ctx.beginPath(); ctx.arc(lx - 9 * s, ly - 11, 8.5, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.beginPath(); ctx.arc(lx + 8 * s, ly + 9, 4, 0, 7); ctx.fill();
  // lid shadow
  ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.ellipse(x, top + 2, rx * 1.2, 14, 0, 0, 7); ctx.fillStyle = PAL.skinSh; ctx.fill();
  ctx.restore();
  // upper lid line + lashes
  ctx.save(); ctx.beginPath(); ctx.moveTo(x - rx - 3, y + 2); ctx.bezierCurveTo(x - rx, top - 7 * open, x + rx, top - 7 * open, x + rx + 3, y + 2);
  ctx.lineWidth = 9; ctx.strokeStyle = OL; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
  const ox = x + side * rx, oy = y - ry * open * 0.45;
  line(ctx, [[ox, oy], [ox + side * 15, oy - 12]], 6, OL);
  line(ctx, [[ox - side * 6, oy - 10 * open], [ox + side * 6, oy - 26 * open]], 5, OL);
  // lower lid hint
  curve(ctx, [x - rx * 0.6, bot - 2], [x, bot + 6], [x + rx * 0.6, bot - 2], 3.5, 'rgba(58,34,29,0.55)');
}

function brow(ctx, x, y, raise, angry, worry, side, s) {
  const yy = y - raise * 20;
  const inner = [x - side * 30 * s, yy + angry * 16 - worry * 12];
  const outer = [x + side * 34 * s, yy - 2 + worry * 8];
  ctx.save(); ctx.beginPath(); ctx.moveTo(inner[0], inner[1]);
  ctx.quadraticCurveTo(x, yy - 14 + angry * 6, outer[0], outer[1]);
  ctx.lineWidth = 12; ctx.strokeStyle = PAL.hairSh; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
}

function mouth(ctx, x, y, m) {
  const w = 34 * m.w, open = m.open, sm = m.smile;
  if (m.bleh) { // disgusted: wavy frown + tongue out
    paint(ctx, c => { c.ellipse(x + 6, y + 22, 18, 26, 0.15, 0, 7); }, PAL.tongue, { lw: 6 });
    line(ctx, [[x + 6, y + 10], [x + 8, y + 36]], 3, '#C9505A');
    ctx.save(); ctx.beginPath(); ctx.moveTo(x - 38, y + 10); ctx.bezierCurveTo(x - 24, y - 6, x - 12, y + 14, x, y + 2); ctx.bezierCurveTo(x + 12, y - 8, x + 24, y + 12, x + 38, y + 4);
    ctx.lineWidth = 8; ctx.strokeStyle = OL; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
    return;
  }
  if (m.o > 0.01) { // "o" shape
    const rx = 12 + m.o * 10 + open * 4, ry = 12 + m.o * 20 + open * 10;
    paint(ctx, c => c.ellipse(x, y + ry * 0.4, rx, ry, 0, 0, 7), PAL.mouth, { lw: 6 });
    ctx.save(); ctx.beginPath(); ctx.ellipse(x, y + ry * 0.4, rx, ry, 0, 0, 7); ctx.clip();
    ctx.beginPath(); ctx.ellipse(x, y + ry * 1.2, rx * 0.8, ry * 0.5, 0, 0, 7); ctx.fillStyle = PAL.tongue; ctx.fill(); ctx.restore();
    return;
  }
  if (open < 0.05) {
    curve(ctx, [x - w, y - sm * 6], [x, y + sm * 26], [x + w, y - sm * 6], 7, OL);
    if (sm > 0.3) { line(ctx, [[x - w - 4, y - sm * 10], [x - w + 2, y - sm * 2]], 5, OL); line(ctx, [[x + w + 4, y - sm * 10], [x + w - 2, y - sm * 2]], 5, OL); }
    return;
  }
  const ww = w * (1 + sm * 0.15 + open * 0.1);
  const topY = y - sm * 8 - 2, depth = 14 + open * 62 + Math.max(0, sm) * 12;
  const p = c => {
    c.moveTo(x - ww, topY);
    c.quadraticCurveTo(x, topY + sm * 10 - open * 6, x + ww, topY);
    c.bezierCurveTo(x + ww * 0.9, topY + depth * 0.9, x - ww * 0.9, topY + depth * 0.9, x - ww, topY);
    c.closePath();
  };
  paint(ctx, p, PAL.mouth, { lw: 0 });
  ctx.save(); ctx.beginPath(); p(ctx); ctx.clip();
  ctx.beginPath(); ctx.ellipse(x, topY + depth * 0.82, ww * 0.62, depth * 0.32, 0, 0, 7); ctx.fillStyle = PAL.tongue; ctx.fill();
  if (m.teeth > 0.01 || open > 0.2) { ctx.fillStyle = PAL.teeth; ctx.fillRect(x - ww, topY - 10, ww * 2, 10 + 9 + m.teeth * 10); }
  ctx.restore();
  ctx.save(); ctx.beginPath(); p(ctx); ctx.lineWidth = 6; ctx.strokeStyle = OL; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}

function glasses(ctx, t) {
  const dx = t * 30;
  const L = [-62 + dx, 0], R = [62 + dx, 0];
  ctx.save();
  for (const [i, c] of [L, R].entries()) {
    const s = 1 - Math.abs(t) * (i === (t > 0 ? 0 : 1) ? 0.22 : 0);
    ctx.beginPath(); ctx.ellipse(c[0], c[1], 54 * s, 52, 0, 0, 7); ctx.fillStyle = 'rgba(200,235,255,0.16)'; ctx.fill();
    ctx.lineWidth = 8; ctx.strokeStyle = '#2b1d1a'; ctx.stroke();
    ctx.globalAlpha = 0.55; curve(ctx, [c[0] - 30 * s, c[1] - 26], [c[0] - 36 * s, c[1] - 6], [c[0] - 28 * s, c[1] + 14], 5, '#fff'); ctx.globalAlpha = 1;
  }
  curve(ctx, [L[0] + 50, -8], [dx, -22], [R[0] - 50, -8], 7, '#2b1d1a');
  ctx.restore();
}

// hair mass behind the head (drawn before body so it sits behind neck & shoulders)
function hairBack(ctx, o) {
  const t = o.turn;
  ctx.save(); ctx.translate(0, HEAD_Y); ctx.rotate(o.tilt * 0.6);
  if (o.hair === 'long') {
    paint(ctx, c => {
      c.moveTo(-150, -110); c.bezierCurveTo(-230, 20, -250, 200, -200, 330);
      c.quadraticCurveTo(-170, 360, -140, 330); c.quadraticCurveTo(-110, 370, -70, 330);
      c.lineTo(70, 330); c.quadraticCurveTo(110, 370, 140, 330); c.quadraticCurveTo(170, 360, 200, 330);
      c.bezierCurveTo(250, 200, 230, 20, 150, -110); c.closePath();
    }, PAL.hair, { shade: PAL.hairSh, sx: -16, sy: -6 });
  } else {
    // short back mass + a few wisps at nape, all behind neck
    paint(ctx, c => {
      c.moveTo(-160, -60); c.bezierCurveTo(-200, 60, -180, 150, -120, 175);
      c.quadraticCurveTo(-60, 150, 0, 172); c.quadraticCurveTo(60, 150, 120, 175);
      c.bezierCurveTo(180, 150, 200, 60, 160, -60); c.closePath();
    }, PAL.hair, { shade: PAL.hairSh, sx: -14, sy: -8 });
  }
  ctx.restore();
}

function bun(ctx, o) {
  const m = o.hairMess;
  paint(ctx, c => { c.ellipse(0, -205, 92 + m * 14, 78 + m * 10, 0, 0, 7); }, PAL.hair, { shade: PAL.hairSh, sx: 14, sy: 12, hi: PAL.hairHi, hiA: 0.45, hiFn: c => c.ellipse(-30, -245, 40, 14, -0.3, 0, 7) });
  curve(ctx, [-50, -240], [0, -270], [52, -232], 5, PAL.hairSh);
  curve(ctx, [-62, -200], [-10, -236], [40, -196], 5, PAL.hairSh);
  curve(ctx, [-30, -170], [20, -190], [60, -170], 5, PAL.hairSh);
  // pencil stuck through the bun
  ctx.save(); ctx.translate(10, -215); ctx.rotate(-1.05 + m * 0.35);
  paint(ctx, c => roundRect(c, -11, -150, 22, 210, 6), PAL.pencil, { shade: PAL.pencilSh, sx: 6, sy: 0, lw: 5 });
  paint(ctx, c => roundRect(c, -11, -150, 22, 14, 3), '#C9C9D2', { lw: 4 });
  paint(ctx, c => roundRect(c, -11, -172, 22, 26, 8), PAL.eraser, { lw: 5 });
  paint(ctx, c => { c.moveTo(-11, 60); c.lineTo(0, 98); c.lineTo(11, 60); c.closePath(); }, '#F6D7A8', { lw: 5 });
  paint(ctx, c => { c.moveTo(-4, 85); c.lineTo(0, 98); c.lineTo(4, 85); c.closePath(); }, '#3a221d', { lw: 0 });
  ctx.restore();
  // re-cover the middle of the pencil so it goes *through* the bun
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, -205, 92 + m * 14, 78 + m * 10, 0, 0, 7); ctx.clip();
  ctx.translate(10, -215); ctx.rotate(-1.05 + m * 0.35); ctx.beginPath(); ctx.rect(-16, -40, 32, 60); ctx.fillStyle = PAL.hair; ctx.fill();
  ctx.restore();
  // loose strands sticking out (more when messy)
  const n = 2 + Math.round(m * 4);
  for (let i = 0; i < n; i++) {
    const a = -2.6 + i * (1.6 / n), r = 88;
    const sx = Math.cos(a) * r, sy = -205 + Math.sin(a) * r * 0.85;
    curve(ctx, [sx, sy], [sx + Math.cos(a) * 30 + 14, sy + Math.sin(a) * 34 - 10], [sx + Math.cos(a) * 48, sy + Math.sin(a) * 52 + 8], 7, OL);
    curve(ctx, [sx, sy], [sx + Math.cos(a) * 30 + 14, sy + Math.sin(a) * 34 - 10], [sx + Math.cos(a) * 48, sy + Math.sin(a) * 52 + 8], 3, PAL.hair);
  }
}

function hairFront(ctx, o) {
  const t = o.turn, m = o.hairMess;
  // top cap of hair
  paint(ctx, c => {
    c.moveTo(-172, 20); c.bezierCurveTo(-190, -120, -100, -178, 0, -176);
    c.bezierCurveTo(100, -178, 190, -120, 172, 20);
    // fringe edge (right to left), side part on her right
    c.bezierCurveTo(150, -30, 130, -60, 95, -70);
    c.quadraticCurveTo(70, -45, 40 + t * 10, -55);
    c.quadraticCurveTo(10, -95, -40 + t * 10, -78);
    c.quadraticCurveTo(-80, -60, -105, -82);
    c.bezierCurveTo(-140, -50, -160, -20, -172, 20);
    c.closePath();
  }, PAL.hair, { shade: PAL.hairSh, sx: -12, sy: -14, hi: PAL.hairHi, hiA: 0.5, hiFn: c => c.ellipse(-60, -140, 70, 18, -0.25, 0, 7) });
  // hair strand lines
  curve(ctx, [-20, -170], [-60, -120], [-45, -82], 4.5, PAL.hairSh);
  curve(ctx, [60, -168], [90, -120], [92, -74], 4.5, PAL.hairSh);
  curve(ctx, [10, -172], [30, -120], [40, -60], 4.5, PAL.hairSh);
  // side locks framing face (stop at jaw, never cover the neck)
  for (const s of [-1, 1]) {
    const x0 = s * 160 + t * 8;
    paint(ctx, c => {
      c.moveTo(x0 - s * 46, -100); c.bezierCurveTo(x0 + s * 22, -110, x0 + s * 30, 10, x0 + s * 18, 70);
      c.quadraticCurveTo(x0 + s * 12, 110, x0 - s * 6, 128); c.quadraticCurveTo(x0 - s * 4, 96, x0 - s * 22, 70);
      c.bezierCurveTo(x0 - s * 34, 20, x0 - s * 40, -40, x0 - s * 46, -100); c.closePath();
    }, PAL.hair, { shade: PAL.hairSh, sx: s * 10, sy: -6, lw: 5.5 });
    curve(ctx, [x0 - s * 14, -40], [x0 + s * 2, 20], [x0 - s * 2, 90], 4, PAL.hairSh);
  }
  // messy hair: a few loose curly strands sticking out of the top (no spiky shapes)
  if (m > 0.2) {
    for (const [x, a, L] of [[-90, -0.9, 1], [-30, -0.25, 1.15], [50, 0.5, 0.95]]) {
      const h = (34 + m * 34) * L;
      ctx.save(); ctx.translate(x, -168); ctx.rotate(a);
      const pts = [[0, 0], [10, -h * 0.5], [-6, -h * 0.8], [6, -h]];
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(14, -h * 0.4, -12, -h * 0.7, 6, -h);
      ctx.lineWidth = 11; ctx.strokeStyle = OL; ctx.lineCap = 'round'; ctx.stroke();
      ctx.lineWidth = 5; ctx.strokeStyle = PAL.hair; ctx.stroke();
      ctx.restore();
    }
  }
}

function drawHead(ctx, o) {
  const t = o.turn;
  ctx.save(); ctx.translate(0, HEAD_Y + o.bob); ctx.rotate(o.tilt);
  if (o.hair === 'bun') bun(ctx, o);
  // ears
  for (const s of [-1, 1]) {
    const ex = s * 160 - t * 16, vis = 1 - Math.max(0, s * t) * 0.6;
    paint(ctx, c => c.ellipse(ex, 18, 22 * vis, 30, 0, 0, 7), PAL.skin, { shade: PAL.skinSh, sx: -s * 6, sy: 0, lw: 5.5 });
  }
  paint(ctx, c => facePath(c, t), PAL.skin, { shade: PAL.skinSh, sx: 16 - t * 10, sy: 12, lw: 7 });
  const fx = t * 34;
  // blush & freckles
  if (o.blush > 0) {
    ctx.save(); ctx.globalAlpha = 0.45 * o.blush + 0.1;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(fx + s * 96, 58, 36, 20, 0, 0, 7); ctx.fillStyle = PAL.cheek; ctx.fill(); }
    ctx.restore();
  }
  ctx.fillStyle = PAL.freckle;
  for (const s of [-1, 1]) for (const [a, b] of [[56, 36], [76, 50], [92, 32], [68, 22], [100, 52]]) { ctx.beginPath(); ctx.arc(fx + s * a, b, 3.4, 0, 7); ctx.fill(); }
  // eyes
  const eL = -62 + fx * 0.9, eR = 62 + fx * 0.9;
  const sL = 1 - Math.max(0, t) * 0.25, sR = 1 - Math.max(0, -t) * 0.25;
  eye(ctx, eL, 0, sL, o, -1); eye(ctx, eR, 0, sR, o, 1);
  if (o.glasses) glasses(ctx, t);
  brow(ctx, eL, -74, o.brow.l, o.brow.angry, o.brow.worry, -1, sL);
  brow(ctx, eR, -74, o.brow.r, o.brow.angry, o.brow.worry, 1, sR);
  // nose
  curve(ctx, [fx * 1.5 - 6, 30], [fx * 1.5 + 10, 44], [fx * 1.5 - 4, 50], 5.5, '#C9806A');
  mouth(ctx, fx * 1.25, 88, o.mouth);
  // sweat drop
  if (o.sweat > 0.01) {
    ctx.save(); ctx.globalAlpha = o.sweat; const sx = 150, sy = -70 + (1 - o.sweat) * -20;
    paint(ctx, c => { c.moveTo(sx, sy - 34); c.bezierCurveTo(sx + 24, sy, sx + 18, sy + 20, sx, sy + 20); c.bezierCurveTo(sx - 18, sy + 20, sx - 24, sy, sx, sy - 34); c.closePath(); }, '#9FDDFF', { lw: 5 });
    ctx.restore();
  }
  hairFront(ctx, o);
  if (o.mask) { // sleep mask pushed up on forehead
    paint(ctx, c => { c.moveTo(-150, -112); c.bezierCurveTo(-120, -150, 120, -150, 150, -112); c.bezierCurveTo(130, -60, 30, -70, 0, -84); c.bezierCurveTo(-30, -70, -130, -60, -150, -112); c.closePath(); }, '#B98CF0', { shade: '#8F63CF', sx: 0, sy: -8 });
    curve(ctx, [-90, -102], [-60, -88], [-30, -102], 5, OL); curve(ctx, [30, -102], [60, -88], [90, -102], 5, OL);
  }
  ctx.restore();
}

// ---------- hands ----------
function hand(ctx, at, ang, kind, side, hold) {
  ctx.save(); ctx.translate(at[0], at[1]); ctx.rotate(ang - Math.PI / 2);
  const sk = PAL.skin, ss = PAL.skinSh;
  if (hold) { ctx.save(); ctx.rotate(-(ang - Math.PI / 2)); hold(ctx, side, ang); ctx.restore(); }
  if (kind === 'open') {
    for (let i = 0; i < 4; i++) {
      const a = (-0.42 + i * 0.28), L = 44 - Math.abs(i - 1.5) * 5;
      ctx.save(); ctx.rotate(a); paint(ctx, c => roundRect(c, -9, 10, 18, L + 10, 9), sk, { lw: 5 }); ctx.restore();
    }
    paint(ctx, c => c.ellipse(0, 6, 28, 26, 0, 0, 7), sk, { shade: ss, sx: 6, sy: 4, lw: 5.5 });
    ctx.save(); ctx.rotate(-side * 1.1); paint(ctx, c => roundRect(c, -9, 6, 18, 38, 9), sk, { lw: 5 }); ctx.restore();
  } else if (kind === 'fist') {
    paint(ctx, c => c.ellipse(0, 12, 27, 25, 0, 0, 7), sk, { shade: ss, sx: 6, sy: 4, lw: 5.5 });
    for (let i = -1; i <= 1; i++) curve(ctx, [i * 12 - 5, 26], [i * 12, 33], [i * 12 + 5, 26], 3.5, OL);
  } else if (kind === 'thumb') {
    paint(ctx, c => c.ellipse(0, 12, 27, 25, 0, 0, 7), sk, { shade: ss, sx: 6, sy: 4, lw: 5.5 });
    ctx.restore(); ctx.save(); ctx.translate(at[0], at[1]);
    paint(ctx, c => roundRect(c, side * 6 - 9, -52, 20, 46, 10), sk, { lw: 5 });
  } else { // mitten
    paint(ctx, c => c.ellipse(0, 18, 25, 31, 0, 0, 7), sk, { shade: ss, sx: 6, sy: 4, lw: 5.5 });
    ctx.save(); ctx.translate(-side * 20, 8); ctx.rotate(side * 0.6); paint(ctx, c => c.ellipse(0, 0, 10, 17, 0, 0, 7), sk, { lw: 5 }); ctx.restore();
  }
  ctx.restore();
}

function arm(ctx, o, side, fit) {
  const tgt = (side < 0 ? o.armL : o.armR) || [side * 118, -20];
  const sh = [side * SH_X, SH_Y + o.bob * 0.5];
  const { el, hand: hd } = ik(sh, tgt, L1, L2, side);
  limb(ctx, [sh, el, hd], 44, fit.top, fit.topSh);
  // cuff
  const ang = Math.atan2(hd[1] - el[1], hd[0] - el[0]);
  ctx.save(); ctx.translate(hd[0] - Math.cos(ang) * 12, hd[1] - Math.sin(ang) * 12); ctx.rotate(ang);
  paint(ctx, c => roundRect(c, -12, -26, 22, 52, 9), fit.trim, { lw: 5 }); ctx.restore();
  hand(ctx, hd, ang, side < 0 ? o.handL : o.handR, side, side < 0 ? o.holdL : o.holdR);
}

function legs(ctx, o, fit) {
  const mk = (s, ph) => {
    if (o.legs === 'sit') {
      const k = [s * 70, 40], f = [s * 76, 200];
      limb(ctx, [[s * 42, 10], k, f], 56, fit.pants, fit.pantsSh);
      return f;
    }
    const sw = o.legs === 'walk' ? Math.sin(o.walk * Math.PI * 2 + ph) : 0;
    const lift = o.legs === 'walk' ? Math.max(0, Math.sin(o.walk * Math.PI * 2 + ph)) * 26 : 0;
    const hip = [s * 42, 10], foot = [s * 50 + sw * 34, 236 - lift];
    const knee = [lerp(hip[0], foot[0], 0.5) + s * 4 + sw * 8, lerp(hip[1], foot[1], 0.5) - lift * 0.3];
    limb(ctx, [hip, knee, foot], 64, fit.pants, fit.pantsSh);
    return foot;
  };
  const fl = mk(-1, 0), fr = mk(1, Math.PI);
  if (fit.pantsDots) { ctx.save(); ctx.fillStyle = '#fff'; for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(s * 46 + (i % 2) * 12 - 6, 50 + i * 45, 6, 0, 7); ctx.fill(); } ctx.restore(); }
  for (const [f, s] of [[fl, -1], [fr, 1]]) {
    const x = f[0] + s * 10, y = f[1] + 14;
    const shoe = c => { c.moveTo(x - s * 34, y - 18); c.bezierCurveTo(x - s * 40, y + 24, x - s * 20, y + 30, x + s * 20, y + 30);
      c.bezierCurveTo(x + s * 62, y + 30, x + s * 66, y + 4, x + s * 40, y - 6); c.bezierCurveTo(x + s * 22, y - 14, x + s * 10, y - 26, x - s * 34, y - 18); c.closePath(); };
    paint(ctx, shoe, fit.oddShoe && s > 0 ? '#FFFFFF' : fit.shoe, { shade: '#DCD3CB', sx: -s * 4, sy: -6 });
    ctx.save(); ctx.beginPath(); shoe(ctx); ctx.clip(); ctx.fillStyle = fit.shoeAcc; ctx.fillRect(x - 80, y + 16, 160, 16); ctx.restore();
    ctx.save(); ctx.beginPath(); shoe(ctx); ctx.lineWidth = 6; ctx.strokeStyle = OL; ctx.stroke(); ctx.restore();
    line(ctx, [[x - s * 4, y - 12], [x + s * 14, y - 4]], 4, OL); line(ctx, [[x - s * 10, y - 4], [x + s * 8, y + 4]], 4, OL);
  }
}

function torso(ctx, o, fit) {
  const p = c => {
    c.moveTo(-SH_X - 10, SH_Y - 10);
    c.quadraticCurveTo(0, SH_Y - 40, SH_X + 10, SH_Y - 10);
    c.bezierCurveTo(SH_X + 30, SH_Y + 20, SH_X + 18, -60, 96, 10);
    c.quadraticCurveTo(0, 26, -96, 10);
    c.bezierCurveTo(-SH_X - 18, -60, -SH_X - 30, SH_Y + 20, -SH_X - 10, SH_Y - 10);
    c.closePath();
  };
  paint(ctx, p, fit.top, { shade: fit.topSh, sx: 16, sy: 6 });
  if (fit.dots) {
    ctx.save(); ctx.beginPath(); p(ctx); ctx.clip(); ctx.fillStyle = '#FFFFFF';
    for (let y = SH_Y; y < 20; y += 46) for (let x = -110; x < 120; x += 46) { ctx.beginPath(); ctx.arc(x + ((y / 46) % 2) * 23, y, 7, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  // hem rib
  ctx.save(); ctx.beginPath(); p(ctx); ctx.clip();
  ctx.fillStyle = fit.trim; ctx.fillRect(-140, -16, 280, 50);
  ctx.strokeStyle = 'rgba(58,34,29,0.25)'; ctx.lineWidth = 3;
  for (let x = -100; x <= 100; x += 14) { ctx.beginPath(); ctx.moveTo(x, -12); ctx.lineTo(x, 20); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.beginPath(); p(ctx); ctx.lineWidth = 6; ctx.strokeStyle = OL; ctx.stroke(); ctx.restore();
  // collar
  for (const s of [-1, 1]) paint(ctx, c => { c.moveTo(0, SH_Y - 18); c.lineTo(s * 52, SH_Y - 30); c.lineTo(s * 40, SH_Y + 18); c.closePath(); }, fit.collar, { lw: 5 });
  if (o.outfit === 'sweater') { // little heart patch
    paint(ctx, c => { const x = -44, y = -130; c.moveTo(x, y + 18); c.bezierCurveTo(x - 30, y - 4, x - 14, y - 26, x, y - 10); c.bezierCurveTo(x + 14, y - 26, x + 30, y - 4, x, y + 18); c.closePath(); }, '#EE5A2A', { lw: 4.5 });
  }
}

function drawSofia(ctx, x, y, scale, pose) {
  const o = merge(pose || {});
  const fit = OUTFITS[o.outfit];
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale * o.squash);
  // ground shadow
  ctx.save(); ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.ellipse(0, 280, 150, 22, 0, 0, 7); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  ctx.rotate(o.lean);
  hairBack(ctx, o);
  if (o.legs !== 'none') legs(ctx, o, fit);
  // neck (behind collar, in front of back hair)
  paint(ctx, c => roundRect(c, -30, NECK_Y - 40, 60, 90, 20), PAL.skin, { shade: PAL.skinSh, sx: 0, sy: -18, lw: 6 });
  torso(ctx, o, fit);
  if (!o.armsFront) { arm(ctx, o, -1, fit); arm(ctx, o, 1, fit); }
  drawHead(ctx, o);
  if (o.armsFront) { arm(ctx, o, -1, fit); arm(ctx, o, 1, fit); }
  ctx.restore();
}

module.exports = { drawSofia, PAL, OUTFITS, SH_Y, HEAD_Y };
