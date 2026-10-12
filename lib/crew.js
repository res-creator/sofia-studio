// Crew rig (Ep3 guest characters) — derived from the Dr. Max rig (lib/drmax.js stays untouched).
// drawCrew(ctx,x,hipY,s,pose,who) who: 'anna' | 'annaFA' | 'bob' | 'maxVac'.
// Dr. Max character rig. Origin = hip centre, y down. ~ 860 units tall (feet +280 .. hair top -580).
// Same cel-shaded outline style as Sofia. Human proportions, slightly taller.
const { OL, paint, line, curve, limb, ik, lerp, clamp, roundRect } = require('./draw');

const PAL = {
  skin: '#F5D4B8', skinSh: '#D9AD8A',
  hair: '#7A5C42', hairSh: '#5A3E2C', hairHi: '#A08060', grey: '#A9A0A0',
  iris: '#5B8FAF', irisDk: '#3A6480', pupil: '#1A2530',
  mouth: '#6B2E30', tongue: '#E87880', teeth: '#FFFFFF',
  coat: '#FFFFFF', coatSh: '#D8DAE0',
  shirt: '#A4C8E8', shirtSh: '#7BA8CC',
  pants: '#3C3C4C', pantsSh: '#2A2A38',
  shoe: '#4A3A2C', shoeSh: '#2E2420',
  steth: '#505860', stethHead: '#8C9098',
  clip: '#D4B896', clipSh: '#B49A78',
  glass: '#3A3028',
};

const PAL0 = Object.assign({}, PAL);
let ST = {};
const SH_Y = -250, SH_X = 95, L1 = 125, L2 = 118;
const HEAD_Y = -470, NECK_Y = -310;

const DEF = {
  turn: 0, tilt: 0, lean: 0, bob: 0,
  look: [0, 0], blink: 0, wide: 0, browL: 0, browR: 0, surprise: 0,
  mouth: { open: 0, smile: 0.3, w: 1 },
  armL: null, armR: null, handL: 'relax', handR: 'relax', armsFront: false,
  holdR: null, holdL: null,
  clipboard: true, // show clipboard in right hand by default
  legs: 'stand', walk: 0,
};

function merge(p) {
  const o = Object.assign({}, DEF, p);
  o.mouth = Object.assign({}, DEF.mouth, p && p.mouth || {});
  return o;
}

// ---- head ----
function facePath(ctx, t) {
  const cx = t * 14;
  if (ST.female) { ctx.moveTo(0, -140); ctx.bezierCurveTo(90, -140, 152, -90, 152, -5); ctx.bezierCurveTo(152, 70, 100, 130, cx + 30, 142); ctx.quadraticCurveTo(cx, 148, cx - 30, 142); ctx.bezierCurveTo(-100, 130, -152, 70, -152, -5); ctx.bezierCurveTo(-152, -90, -90, -140, 0, -140); ctx.closePath(); return; }
  // slightly squarer jaw than Sofia
  ctx.moveTo(0, -140);
  ctx.bezierCurveTo(90, -140, 155, -90, 156, -5);
  ctx.bezierCurveTo(157, 60, 125, 108, cx + 72, 130);
  ctx.lineTo(cx + 30, 142);
  ctx.quadraticCurveTo(cx, 146, cx - 30, 142);
  ctx.lineTo(cx - 72, 130);
  ctx.bezierCurveTo(-125, 108, -157, 60, -156, -5);
  ctx.bezierCurveTo(-155, -90, -90, -140, 0, -140);
  ctx.closePath();
}

function drawEye(ctx, x, y, s, o, side) {
  const open = clamp(1 - o.blink) + o.wide * 0.25; // wide opens eyes more
  const rx = 36 * s, ry = 42; // larger eyes — closer to Sofia
  if (open < 0.12) {
    curve(ctx, [x - rx, y + 4], [x, y + 12], [x + rx, y + 4], 7, OL);
    return;
  }
  ctx.save();
  const top = y - ry * open, bot = y + ry * 0.85;
  const p = c => {
    c.moveTo(x - rx, y);
    c.bezierCurveTo(x - rx, top - 4 * open, x + rx, top - 4 * open, x + rx, y);
    c.bezierCurveTo(x + rx, bot + 2, x - rx, bot + 2, x - rx, y);
    c.closePath();
  };
  paint(ctx, p, '#FFFFFF', { lw: 0 });
  ctx.beginPath(); p(ctx); ctx.clip();
  const lx = x + o.look[0] * 14 * s + o.turn * 8, ly = y + 4 + o.look[1] * 12;
  const ir = 24; // slightly larger iris
  ctx.beginPath(); ctx.arc(lx, ly, ir * s + 1, 0, 7); ctx.fillStyle = PAL.irisDk; ctx.fill();
  ctx.beginPath(); ctx.arc(lx, ly + 2, ir * s - 3, 0, 7); ctx.fillStyle = PAL.iris; ctx.fill();
  ctx.beginPath(); ctx.arc(lx, ly, 10 * s, 0, 7); ctx.fillStyle = PAL.pupil; ctx.fill();
  ctx.beginPath(); ctx.arc(lx - 7 * s, ly - 9, 6.5, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.beginPath(); ctx.arc(lx + 6 * s, ly + 7, 3, 0, 7); ctx.fill();
  // lid shadow
  ctx.globalAlpha = 0.15; ctx.beginPath(); ctx.ellipse(x, top + 2, rx * 1.1, 10, 0, 0, 7);
  ctx.fillStyle = PAL.skinSh; ctx.fill();
  ctx.restore();
  // upper lid line
  ctx.save(); ctx.beginPath(); ctx.moveTo(x - rx - 2, y + 2);
  ctx.bezierCurveTo(x - rx, top - 5 * open, x + rx, top - 5 * open, x + rx + 2, y + 2);
  ctx.lineWidth = 7; ctx.strokeStyle = OL; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
  // small lash
  const ox = x + side * rx;
  line(ctx, [[ox, y - ry * open * 0.4], [ox + side * 8, y - ry * open * 0.5 - 6]], 4, OL);
}

function drawBrow(ctx, x, y, raise, side, s) {
  const yy = y - raise * 22; // more vertical travel for expressiveness
  const inner = [x - side * 28 * s, yy + 5];
  const outer = [x + side * 32 * s, yy - 3];
  // thick, dark brows — clearly visible above glasses
  ctx.save(); ctx.beginPath(); ctx.moveTo(inner[0], inner[1]);
  ctx.quadraticCurveTo(x, yy - 14, outer[0], outer[1]);
  ctx.lineWidth = ST.female ? 9 : (ST.browW || 13); ctx.strokeStyle = PAL.hairSh; ctx.lineCap = 'round'; ctx.stroke();
  // darker core line for definition
  ctx.beginPath(); ctx.moveTo(inner[0], inner[1]);
  ctx.quadraticCurveTo(x, yy - 12, outer[0], outer[1]);
  ctx.lineWidth = ST.female ? 4 : 7; ctx.strokeStyle = PAL.browCore || '#3E2A1C'; ctx.stroke();
  ctx.restore();
}

function drawMouth(ctx, x, y, m) {
  const w = 30 * m.w, open = m.open, sm = m.smile;
  if (open < 0.05) {
    curve(ctx, [x - w, y - sm * 4], [x, y + sm * 18], [x + w, y - sm * 4], 6, OL);
    return;
  }
  const ww = w * (1 + sm * 0.1 + open * 0.1);
  const topY = y - sm * 6, depth = 10 + open * 50 + sm * 10;
  const p = c => {
    c.moveTo(x - ww, topY);
    c.quadraticCurveTo(x, topY + sm * 6 - open * 4, x + ww, topY);
    c.bezierCurveTo(x + ww * 0.9, topY + depth * 0.9, x - ww * 0.9, topY + depth * 0.9, x - ww, topY);
    c.closePath();
  };
  paint(ctx, p, PAL.mouth, { lw: 0 });
  ctx.save(); ctx.beginPath(); p(ctx); ctx.clip();
  ctx.beginPath(); ctx.ellipse(x, topY + depth * 0.8, ww * 0.6, depth * 0.3, 0, 0, 7);
  ctx.fillStyle = PAL.tongue; ctx.fill();
  if (open > 0.2) {
    ctx.fillStyle = PAL.teeth; ctx.fillRect(x - ww, topY - 6, ww * 2, 12);
  }
  ctx.restore();
  ctx.save(); ctx.beginPath(); p(ctx); ctx.lineWidth = 5; ctx.strokeStyle = OL; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}

function drawGlasses(ctx, t) {
  const dx = t * 24;
  const FC = '#7A5A44'; // warm light-brown frames — clearly NOT sunglasses
  // smaller rectangular-round lenses so eyes stay visible
  for (const s of [-1, 1]) {
    const cx = s * 56 + dx;
    const vis = 1 - Math.abs(t) * (s === Math.sign(t) ? 0.18 : 0);
    // extremely subtle lens tint — practically invisible
    ctx.beginPath(); ctx.ellipse(cx, 0, 42 * vis, 36, 0, 0, 7);
    ctx.fillStyle = 'rgba(230,245,255,0.04)'; ctx.fill();
    // thin frame
    ctx.lineWidth = 5; ctx.strokeStyle = FC; ctx.stroke();
    // lens glare — small highlight
    ctx.save(); ctx.globalAlpha = 0.4;
    curve(ctx, [cx - 18 * vis, -16], [cx - 22 * vis, -2], [cx - 14 * vis, 10], 2.5, '#fff');
    ctx.restore();
  }
  // bridge
  curve(ctx, [-56 + dx + 44, -6], [dx, -16], [56 + dx - 44, -6], 5, FC);
  // temples (side arms)
  for (const s of [-1, 1]) {
    const ex = s * (56 + 42) + dx;
    line(ctx, [[ex, -2], [ex + s * 30, 2]], 4.5, FC);
  }
}

function drawMustache(ctx, fx, y) {
  // small neat mustache — sits between nose and mouth
  const my = y - 4; // just above the mouth y
  ctx.save();
  // left half
  paint(ctx, c => {
    c.moveTo(fx, my - 4);
    c.bezierCurveTo(fx - 8, my - 6, fx - 28, my - 5, fx - 32, my + 2);
    c.bezierCurveTo(fx - 30, my + 6, fx - 14, my + 5, fx, my + 2);
    c.closePath();
  }, PAL.hairSh, { lw: 3, ol: '#3E2A1C' });
  // right half
  paint(ctx, c => {
    c.moveTo(fx, my - 4);
    c.bezierCurveTo(fx + 8, my - 6, fx + 28, my - 5, fx + 32, my + 2);
    c.bezierCurveTo(fx + 30, my + 6, fx + 14, my + 5, fx, my + 2);
    c.closePath();
  }, PAL.hairSh, { lw: 3, ol: '#3E2A1C' });
  ctx.restore();
}

function drawHair(ctx, o) {
  const t = o.turn;
  // short neat hair with side part, open forehead — no bangs covering brows
  // back/side mass — sits on top of head, does NOT extend over forehead
  paint(ctx, c => {
    c.moveTo(-148, -20);
    c.bezierCurveTo(-160, -80, -110, -155, -20, -158);
    // side part: hair swoops to the right from the left
    c.bezierCurveTo(30, -162, 90, -158, 130, -140);
    c.bezierCurveTo(165, -120, 170, -80, 148, -20);
    // sides — stop above ears, NOT covering forehead
    c.bezierCurveTo(140, 4, 120, 10, 100, 6);
    c.lineTo(100, -30);
    c.lineTo(-100, -30);
    c.lineTo(-100, 6);
    c.bezierCurveTo(-120, 10, -140, 4, -148, -20);
    c.closePath();
  }, PAL.hair, { shade: PAL.hairSh, sx: -10, sy: -10, hi: PAL.hairHi, hiA: 0.3,
    hiFn: c => c.ellipse(20, -140, 55, 12, 0.15, 0, 7) });
  // part line — subtle diagonal line showing where hair parts
  curve(ctx, [-40, -148], [-30, -130], [-26, -100], 3, PAL.hairSh);
  // grey at temples — kept
  ctx.save(); ctx.globalAlpha = 0.55;
  for (const s of [-1, 1]) {
    paint(ctx, c => {
      c.moveTo(s * 120, -40); c.bezierCurveTo(s * 145, -15, s * 135, 5, s * 100, 4);
      c.lineTo(s * 105, -25); c.closePath();
    }, PAL.grey, { lw: 0 });
  }
  ctx.restore();
  // hair texture strands on top
  curve(ctx, [-20, -156], [10, -148], [50, -142], 3.5, PAL.hairSh);
  curve(ctx, [60, -146], [90, -120], [110, -70], 3, PAL.hairSh);
  curve(ctx, [30, -156], [60, -138], [80, -100], 3, PAL.hairSh);
}

function drawStethoscopeBack(ctx) {
  // U-shape tube around the back of the neck (neck is at ~NECK_Y=-310)
  const ny = NECK_Y + 10; // neck centre
  // left tube going behind neck
  curve(ctx, [-40, ny - 20], [-55, ny + 10], [-42, ny + 40], 7, PAL.steth);
  // right tube behind neck
  curve(ctx, [40, ny - 20], [55, ny + 10], [42, ny + 40], 7, PAL.steth);
}

function drawStethoscopeFront(ctx) {
  // front part: earpieces at top, tubes down to chestpiece at upper chest
  const tc = PAL.steth;
  const ny = NECK_Y + 10;
  // earpieces — small angled metal tips at the top of the U
  for (const s of [-1, 1]) {
    // earpiece: short angled tube going up and outward
    ctx.save(); ctx.beginPath();
    ctx.moveTo(s * 40, ny - 20);
    ctx.lineTo(s * 48, ny - 40);
    ctx.lineWidth = 7; ctx.strokeStyle = tc; ctx.lineCap = 'round'; ctx.stroke();
    // earpiece tip (olive-shaped)
    paint(ctx, c => c.ellipse(s * 50, ny - 44, 6, 9, s * 0.3, 0, 7), PAL.stethHead, { lw: 3 });
    ctx.restore();
  }
  // front tubes coming down from neck over the coat — converge to chestpiece
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-42, ny + 40);
  ctx.bezierCurveTo(-36, ny + 70, -28, SH_Y + 40, -20, SH_Y + 70);
  ctx.lineWidth = 7; ctx.strokeStyle = tc; ctx.lineCap = 'round'; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(42, ny + 40);
  ctx.bezierCurveTo(30, ny + 60, 0, SH_Y + 30, -14, SH_Y + 70);
  ctx.lineWidth = 6; ctx.strokeStyle = tc; ctx.lineCap = 'round'; ctx.stroke();
  ctx.restore();
  // chestpiece (round diaphragm) — at upper chest level
  const cpY = SH_Y + 80;
  paint(ctx, c => c.ellipse(-18, cpY, 18, 18, 0, 0, 7), PAL.stethHead, { shade: tc, sx: 3, sy: 3, lw: 5 });
  paint(ctx, c => c.ellipse(-18, cpY, 10, 10, 0, 0, 7), '#707880', { lw: 0 });
  // ring detail
  ctx.save(); ctx.beginPath(); ctx.arc(-18, cpY, 13, 0, 7);
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(58,34,29,0.25)'; ctx.stroke(); ctx.restore();
}

function drawHead(ctx, o) {
  const t = o.turn;
  ctx.save(); ctx.translate(0, HEAD_Y + o.bob); ctx.rotate(o.tilt);
  // ears
  for (const s of [-1, 1]) {
    const ex = s * 150 - t * 12, vis = 1 - Math.max(0, s * t) * 0.5;
    paint(ctx, c => c.ellipse(ex, 14, 20 * vis, 26, 0, 0, 7), PAL.skin, { shade: PAL.skinSh, sx: -s * 4, sy: 0, lw: 5 });
  }
  // face
  paint(ctx, c => facePath(c, t), PAL.skin, { shade: PAL.skinSh, sx: 14 - t * 8, sy: 10, lw: 6 });
  const fx = t * 28;
  if (ST.hairBack) ST.hairBack(ctx, o);
  // stubble shadow (very subtle)
  ctx.save(); ctx.globalAlpha = ST.female ? 0 : 0.06;
  ctx.beginPath(); ctx.ellipse(fx, 100, 80, 50, 0, 0.2, Math.PI - 0.2);
  ctx.fillStyle = PAL.hairSh; ctx.fill(); ctx.restore();
  // eyes
  const eL = -54 + fx * 0.85, eR = 54 + fx * 0.85;
  const sL = 1 - Math.max(0, t) * 0.2, sR = 1 - Math.max(0, -t) * 0.2;
  drawEye(ctx, eL, 0, sL, o, -1);
  drawEye(ctx, eR, 0, sR, o, 1);
  // glasses (thicker than Sofia)
  if (ST.glasses) drawGlasses(ctx, t);
  // brows — positioned above glasses, clearly visible on open forehead
  const brL = o.browL + o.surprise * 0.6;
  const brR = o.browR + o.surprise * 0.6;
  drawBrow(ctx, eL, -72, brL, -1, sL);
  drawBrow(ctx, eR, -72, brR, 1, sR);
  if (ST.female) { ctx.save(); ctx.globalAlpha = 0.35; for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * 96 + fx * 0.8, 52, 24, 13, 0, 0, 7); ctx.fillStyle = '#F29A9A'; ctx.fill(); } ctx.restore();
    for (const [ex, k] of [[eL, -1], [eR, 1]]) { const op = clamp(1 - o.blink) + o.wide * 0.25; if (op < 0.12) continue; const ty = -42 * op; for (let i = 0; i < 2; i++) line(ctx, [[ex + k * (30 + i * 6), ty + 10 + i * 10], [ex + k * (44 + i * 6), ty + 2 + i * 12]], 5, OL); } }
  // nose — slightly larger/broader than Sofia
  if (ST.female) curve(ctx, [fx * 1.3 - 4, 36], [fx * 1.3 + 8, 48], [fx * 1.3 - 2, 52], 5, '#C4886E');
  else curve(ctx, [fx * 1.3 - 8, 28], [fx * 1.3 + 12, 48], [fx * 1.3 - 2, 56], 6, '#C4886E');
  // mustache — small neat, between nose and mouth
  if (ST.mustache === 'brush') drawBrush(ctx, fx * 1.1, 72); else if (ST.mustache) drawMustache(ctx, fx * 1.1, 72);
  // mouth
  drawMouth(ctx, fx * 1.1, ST.female ? 82 : 88, o.mouth); // shifted mouth slightly down to make room for mustache
  // hair on top
  (ST.hair || drawHair)(ctx, o);
  if (ST.cap) drawCap(ctx, o);
  ctx.restore();
}

// ---- hands ----
function drawHand(ctx, at, ang, kind, side, hold) {
  ctx.save(); ctx.translate(at[0], at[1]); ctx.rotate(ang - Math.PI / 2);
  const sk = PAL.skin, ss = PAL.skinSh;
  if (hold) { ctx.save(); ctx.rotate(-(ang - Math.PI / 2)); hold(ctx, side, ang); ctx.restore(); }
  if (kind === 'open') {
    for (let i = 0; i < 4; i++) {
      const a = -0.42 + i * 0.28, L = 42 - Math.abs(i - 1.5) * 4;
      ctx.save(); ctx.rotate(a);
      paint(ctx, c => roundRect(c, -9, 8, 18, L + 8, 9), sk, { lw: 5 });
      ctx.restore();
    }
    paint(ctx, c => c.ellipse(0, 4, 26, 24, 0, 0, 7), sk, { shade: ss, sx: 5, sy: 3, lw: 5 });
    ctx.save(); ctx.rotate(-side * 1.0);
    paint(ctx, c => roundRect(c, -9, 4, 18, 36, 9), sk, { lw: 5 }); ctx.restore();
  } else { // relax — softly curved, fingers together
    paint(ctx, c => c.ellipse(0, 16, 24, 30, 0, 0, 7), sk, { shade: ss, sx: 5, sy: 3, lw: 5 });
    // slight finger lines
    for (let i = -1; i <= 1; i++) curve(ctx, [i * 10 - 4, 34], [i * 10, 40], [i * 10 + 4, 34], 3, 'rgba(58,34,29,0.35)');
    // thumb
    ctx.save(); ctx.translate(-side * 18, 6); ctx.rotate(side * 0.5);
    paint(ctx, c => c.ellipse(0, 0, 10, 16, 0, 0, 7), sk, { lw: 4.5 }); ctx.restore();
  }
  ctx.restore();
}

function drawArm(ctx, o, side) {
  const tgt = (side < 0 ? o.armL : o.armR) || [side * 130, -30];
  const sh = [side * SH_X, SH_Y + o.bob * 0.5];
  const { el, hand: hd } = ik(sh, tgt, L1, L2, side);
  // lab coat sleeve (white with outline)
  limb(ctx, [sh, el, hd], 48, PAL.sleeve || PAL.coat, PAL.sleeveSh || PAL.coatSh);
  // cuff — show shirt colour peeking out
  const ang = Math.atan2(hd[1] - el[1], hd[0] - el[0]);
  ctx.save(); ctx.translate(hd[0] - Math.cos(ang) * 10, hd[1] - Math.sin(ang) * 10); ctx.rotate(ang);
  paint(ctx, c => roundRect(c, -10, -24, 20, 48, 8), PAL.cuff || PAL.shirt, { lw: 4 }); ctx.restore();
  drawHand(ctx, hd, ang, side < 0 ? o.handL : o.handR, side, side < 0 ? o.holdL : o.holdR);
}

// ---- pen prop ----
function drawPen(ctx, side, ang) {
  ctx.save();
  ctx.rotate(0.3 * side);
  // pen body
  paint(ctx, c => roundRect(c, -3, -6, 6, 60, 3), '#3366AA', { lw: 3 });
  // pen tip
  paint(ctx, c => { c.moveTo(-3, 54); c.lineTo(3, 54); c.lineTo(0, 66); c.closePath(); }, '#222', { lw: 2 });
  // pen clip
  line(ctx, [[2, -4], [2, 18]], 2, '#666');
  ctx.restore();
}

// ---- clipboard prop ----
function drawClipboard(ctx, side, ang) {
  ctx.save();
  ctx.rotate(0.1 * side);
  // board
  paint(ctx, c => roundRect(c, -32, -10, 64, 100, 6), PAL.clip, { shade: PAL.clipSh, sx: 4, sy: 4, lw: 5 });
  // paper
  paint(ctx, c => roundRect(c, -26, 0, 52, 80, 3), '#FFFFFF', { lw: 0 });
  // clip at top
  paint(ctx, c => roundRect(c, -18, -18, 36, 16, 4), '#8C8C8C', { lw: 4 });
  // text lines
  ctx.fillStyle = 'rgba(58,34,29,0.2)';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(-20, 10 + i * 14, 40 - (i === 4 ? 18 : 0), 4);
  }
  ctx.restore();
}

// ---- legs ----
function drawLegs(ctx, o) {
  for (const s of [-1, 1]) {
    const sw = o.legs === 'walk' ? Math.sin(o.walk * Math.PI * 2 + (s > 0 ? Math.PI : 0)) * 26 : 0;
    const lift = o.legs === 'walk' ? Math.max(0, Math.sin(o.walk * Math.PI * 2 + (s > 0 ? Math.PI : 0))) * 22 : 0;
    const hip = [s * 44, 10], foot = [s * 50 + sw * 30, 230 - lift];
    const knee = [lerp(hip[0], foot[0], 0.5) + s * 3 + sw * 6, lerp(hip[1], foot[1], 0.5) - lift * 0.3];
    limb(ctx, [hip, knee, foot], 60, PAL.pants, PAL.pantsSh);
    // shoes — simple, dark
    const fx = foot[0], fy = foot[1] + 12;
    const shoe = c => {
      c.moveTo(fx - s * 30, fy - 14);
      c.bezierCurveTo(fx - s * 36, fy + 18, fx - s * 16, fy + 24, fx + s * 16, fy + 24);
      c.bezierCurveTo(fx + s * 50, fy + 24, fx + s * 54, fy + 2, fx + s * 36, fy - 4);
      c.bezierCurveTo(fx + s * 18, fy - 12, fx + s * 8, fy - 22, fx - s * 30, fy - 14);
      c.closePath();
    };
    paint(ctx, shoe, PAL.shoe, { shade: PAL.shoeSh, sx: -s * 3, sy: -4, lw: 5 });
  }
}

// ---- torso ----
function drawTorso(ctx, o) {
  // shirt underneath (visible at V-neck area)
  paint(ctx, c => {
    c.moveTo(-40, SH_Y - 10);
    c.lineTo(40, SH_Y - 10);
    c.lineTo(40, SH_Y + 40);
    c.lineTo(-40, SH_Y + 40);
    c.closePath();
  }, PAL.shirt, { lw: 0 });

  // lab coat (open front)
  const coatPath = c => {
    c.moveTo(-SH_X - 14, SH_Y - 14);
    c.quadraticCurveTo(0, SH_Y - 44, SH_X + 14, SH_Y - 14);
    c.bezierCurveTo(SH_X + 32, SH_Y + 10, SH_X + 24, -40, 100, 20);
    // coat extends below hip — longer than a sweater
    c.lineTo(100, 140);
    c.quadraticCurveTo(80, 150, 30, 146);
    // open front gap
    c.lineTo(18, SH_Y + 30);
    c.lineTo(-18, SH_Y + 30);
    c.lineTo(-30, 146);
    c.quadraticCurveTo(-80, 150, -100, 140);
    c.lineTo(-100, 20);
    c.bezierCurveTo(-SH_X - 24, -40, -SH_X - 32, SH_Y + 10, -SH_X - 14, SH_Y - 14);
    c.closePath();
  };
  paint(ctx, coatPath, PAL.coat, { shade: PAL.coatSh, sx: 12, sy: 6, lw: 6 });

  // shirt showing through the open coat front
  paint(ctx, c => {
    c.moveTo(-18, SH_Y + 30);
    c.lineTo(18, SH_Y + 30);
    c.lineTo(22, 140);
    c.lineTo(-22, 140);
    c.closePath();
  }, PAL.shirt, { shade: PAL.shirtSh, sx: 4, sy: 4, lw: 0 });

  // coat buttons (2 on each side)
  ctx.fillStyle = PAL.coatSh;
  for (const s of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      ctx.beginPath(); ctx.arc(s * 40, SH_Y + 60 + i * 50, 5, 0, 7); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = OL; ctx.stroke();
    }
  }

  // coat collar/lapels
  for (const s of [-1, 1]) {
    paint(ctx, c => {
      c.moveTo(s * 18, SH_Y - 10);
      c.lineTo(s * 55, SH_Y - 30);
      c.lineTo(s * 50, SH_Y + 26);
      c.lineTo(s * 18, SH_Y + 30);
      c.closePath();
    }, PAL.coat, { shade: PAL.coatSh, sx: s * 4, sy: 4, lw: 5 });
  }

  // pocket on left chest
  paint(ctx, c => roundRect(c, -80, SH_Y + 50, 44, 36, 4), PAL.coatSh, { lw: 3.5 });
  // pen in pocket
  paint(ctx, c => roundRect(c, -66, SH_Y + 38, 6, 18, 3), '#3366AA', { lw: 3 });
}

// ---- main draw ----
function drawCrew(ctx, x, y, scale, pose, who = 'anna') {
  ST = STYLES[who]; Object.assign(PAL, PAL0, ST.pal || {});
  const o = merge(Object.assign({ clipboard: false }, pose));
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  // ground shadow
  ctx.save(); ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.ellipse(0, 280, 140, 20, 0, 0, 7);
  ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  ctx.rotate(o.lean || 0);

  drawLegs(ctx, o);
  if (ST.skirt) paint(ctx, c => { c.moveTo(-100, -10); c.lineTo(100, -10); c.lineTo(92, 150); c.quadraticCurveTo(0, 162, -92, 150); c.closePath(); }, ST.skirt, { shade: PAL.jacketSh, sx: 8, sy: 4, lw: 6 });
  // neck
  paint(ctx, c => roundRect(c, -28, NECK_Y - 36, 56, 86, 18), PAL.skin, { shade: PAL.skinSh, sx: 0, sy: -16, lw: 5.5 });
  // stethoscope back part (behind coat, around neck)
  if (ST.steth) drawStethoscopeBack(ctx);
  (ST.torso || drawTorso)(ctx, o);
  // stethoscope front part (over coat — visible!)
  if (ST.steth) drawStethoscopeFront(ctx);
  // arms
  const clipHold = o.clipboard ? (ctx2, s, a) => drawClipboard(ctx2, s, a) : null;
  const oWithClip = Object.assign({}, o);
  if (o.clipboard && !o.holdR) oWithClip.holdR = clipHold;
  if (!oWithClip.armsFront) { drawArm(ctx, oWithClip, -1); drawArm(ctx, oWithClip, 1); }
  drawHead(ctx, o);
  if (oWithClip.armsFront) { drawArm(ctx, oWithClip, -1); drawArm(ctx, oWithClip, 1); }

  ctx.restore();
}


// ================= Ep3 crew styles =================
// generic jacket torso (closed front, collar) used by Anna / Bob
function jacketTorso(ctx, o) {
  const J = PAL.jacket, JS = PAL.jacketSh;
  paint(ctx, c => {
    c.moveTo(-SH_X - 14, SH_Y - 14);
    c.quadraticCurveTo(0, SH_Y - 44, SH_X + 14, SH_Y - 14);
    c.bezierCurveTo(SH_X + 32, SH_Y + 10, SH_X + 18, -40, 96, ST.long ? 110 : 30);
    c.quadraticCurveTo(0, ST.long ? 124 : 44, -96, ST.long ? 110 : 30);
    c.bezierCurveTo(-SH_X - 18, -40, -SH_X - 32, SH_Y + 10, -SH_X - 14, SH_Y - 14);
    c.closePath();
  }, J, { shade: JS, sx: 12, sy: 6, lw: 6 });
  // shirt V
  paint(ctx, c => { c.moveTo(-34, SH_Y - 20); c.lineTo(34, SH_Y - 20); c.lineTo(0, SH_Y + 60); c.closePath(); }, PAL.shirt, { lw: 4 });
  // centre line + buttons
  line(ctx, [[0, SH_Y + 60], [0, ST.long ? 110 : 34]], 4, JS);
  ctx.fillStyle = PAL.button || '#E8C860';
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, SH_Y + 90 + i * 60, 7, 0, 7); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = OL; ctx.stroke(); }
  // lapels
  for (const k of [-1, 1]) paint(ctx, c => { c.moveTo(k * 34, SH_Y - 20); c.lineTo(k * 66, SH_Y - 26); c.lineTo(k * 30, SH_Y + 40); c.lineTo(0, SH_Y + 60); c.closePath(); }, J, { shade: JS, sx: k * 3, sy: 3, lw: 5 });
  if (ST.extra) ST.extra(ctx, o);
}

// Anna: airline scarf + wings badge (+ name tag)
function annaExtra(ctx) {
  const SC = '#E5484D', SCs = '#B8323A';
  paint(ctx, c => { c.moveTo(-50, SH_Y - 30); c.quadraticCurveTo(0, SH_Y - 4, 50, SH_Y - 30); c.lineTo(42, SH_Y - 6); c.quadraticCurveTo(0, SH_Y + 16, -42, SH_Y - 6); c.closePath(); }, SC, { shade: SCs, sx: 3, sy: 3, lw: 5 });
  paint(ctx, c => { c.moveTo(14, SH_Y - 2); c.lineTo(58, SH_Y + 30); c.lineTo(40, SH_Y + 44); c.lineTo(10, SH_Y + 8); c.closePath(); }, SC, { shade: SCs, sx: 2, sy: 2, lw: 5 });
  paint(ctx, c => { c.moveTo(4, SH_Y); c.lineTo(28, SH_Y + 42); c.lineTo(8, SH_Y + 50); c.lineTo(-4, SH_Y + 6); c.closePath(); }, '#FFFFFF', { lw: 4 });
  paint(ctx, c => c.ellipse(10, SH_Y - 2, 14, 11, 0, 0, 7), SC, { lw: 4 });
  // gold wings badge
  ctx.save(); ctx.translate(-56, SH_Y + 74);
  paint(ctx, c => { c.moveTo(-26, -2); c.quadraticCurveTo(-14, -12, 0, -4); c.quadraticCurveTo(14, -12, 26, -2); c.quadraticCurveTo(12, 6, 0, 4); c.quadraticCurveTo(-12, 6, -26, -2); c.closePath(); }, '#F2C744', { lw: 3 });
  ctx.restore();
  // name tag
  paint(ctx, c => roundRect(c, 30, SH_Y + 66, 50, 22, 5), '#FFFFFF', { lw: 3 });
  ctx.fillStyle = '#1E2E5A'; ctx.font = '700 15px FredokaL, NunitoC'; ctx.textAlign = 'center'; ctx.fillText('ANNA', 55, SH_Y + 83);
}
function annaHairBack(ctx) {
  // bun behind the head
  paint(ctx, c => c.ellipse(0, -168, 70, 54, 0, 0, 7), PAL.hair, { shade: PAL.hairSh, sx: -6, sy: -6 });
}
function annaHair(ctx, o) {
  paint(ctx, c => {
    c.moveTo(-156, 10);
    c.bezierCurveTo(-170, -90, -100, -158, 0, -160);
    c.bezierCurveTo(100, -158, 170, -90, 156, 10);
    c.bezierCurveTo(150, -40, 120, -70, 70, -86);
    // side-swept fringe
    c.bezierCurveTo(30, -70, -40, -60, -96, -84);
    c.bezierCurveTo(-130, -60, -148, -30, -156, 10);
    c.closePath();
  }, PAL.hair, { shade: PAL.hairSh, sx: -10, sy: -10, hi: PAL.hairHi, hiA: 0.35, hiFn: c => c.ellipse(-30, -136, 60, 12, -0.15, 0, 7) });
  curve(ctx, [-110, -120], [-60, -140], [0, -146], 3.5, PAL.hairSh);
  // red hair band at the bun
  paint(ctx, c => roundRect(c, -40, -160, 80, 14, 7), '#E5484D', { lw: 4 });
}
// Anna flight-attendant: little pillbox hat
function annaHat(ctx) {
  ctx.save(); ctx.translate(46, -150); ctx.rotate(0.2);
  paint(ctx, c => roundRect(c, -48, -30, 96, 40, 12), PAL.jacket, { shade: PAL.jacketSh, sx: 4, sy: 3, lw: 5 });
  paint(ctx, c => roundRect(c, -48, -2, 96, 10, 4), '#E5484D', { lw: 3.5 });
  ctx.restore();
}

// Bob: strict security officer
function bobExtra(ctx) {
  // dark tie
  paint(ctx, c => { c.moveTo(-10, SH_Y - 14); c.lineTo(10, SH_Y - 14); c.lineTo(14, SH_Y + 50); c.lineTo(0, SH_Y + 62); c.lineTo(-14, SH_Y + 50); c.closePath(); }, '#2A2E3A', { lw: 4 });
  // SECURITY patch
  paint(ctx, c => roundRect(c, 22, SH_Y + 70, 70, 26, 5), '#FFD23F', { lw: 3.5 });
  ctx.fillStyle = '#2A2E3A'; ctx.font = '800 13px FredokaL, NunitoC'; ctx.textAlign = 'center'; ctx.fillText('SECURITY', 57, SH_Y + 88);
  // shield badge
  ctx.save(); ctx.translate(-56, SH_Y + 82);
  paint(ctx, c => { c.moveTo(0, -20); c.lineTo(18, -12); c.lineTo(14, 10); c.lineTo(0, 22); c.lineTo(-14, 10); c.lineTo(-18, -12); c.closePath(); }, '#F2C744', { shade: '#C79A2A', sx: 2, sy: 2, lw: 3.5 });
  ctx.restore();
  // belt
  paint(ctx, c => roundRect(c, -98, 4, 196, 26, 6), '#1F2128', { lw: 4 });
  paint(ctx, c => roundRect(c, -16, 2, 32, 30, 5), '#C9CDD6', { lw: 3.5 });
}
function bobHair(ctx) {
  // very short buzz cut sides (cap covers top)
  for (const k of [-1, 1]) paint(ctx, c => { c.moveTo(k * 154, -4); c.bezierCurveTo(k * 158, -30, k * 156, -50, k * 146, -66); c.lineTo(k * 126, -60); c.lineTo(k * 130, -2); c.closePath(); }, PAL.hair, { lw: 4 });
}
function drawCap(ctx) {
  // police-style cap: crown + black visor + badge
  paint(ctx, c => { c.moveTo(-168, -86); c.bezierCurveTo(-180, -200, 180, -200, 168, -86); c.quadraticCurveTo(0, -70, -168, -86); c.closePath(); }, PAL.jacket, { shade: PAL.jacketSh, sx: -8, sy: -8, lw: 6 });
  paint(ctx, c => { c.moveTo(-160, -92); c.quadraticCurveTo(0, -76, 160, -92); c.lineTo(156, -70); c.quadraticCurveTo(0, -56, -156, -70); c.closePath(); }, '#2A2E3A', { lw: 5 });
  paint(ctx, c => { c.moveTo(-150, -68); c.quadraticCurveTo(0, -52, 150, -68); c.quadraticCurveTo(110, -28, 0, -26); c.quadraticCurveTo(-110, -28, -150, -68); c.closePath(); }, '#1A1C22', { lw: 5 });
  ctx.save(); ctx.globalAlpha = 0.35; curve(ctx, [-90, -56], [0, -44], [90, -56], 4, '#fff'); ctx.restore();
  paint(ctx, c => { c.moveTo(0, -150); c.lineTo(16, -136); c.lineTo(10, -112); c.lineTo(-10, -112); c.lineTo(-16, -136); c.closePath(); }, '#F2C744', { lw: 3.5 });
}
function drawBrush(ctx, fx, y) {
  // big bushy brush mustache
  const my = y - 6;
  paint(ctx, c => { c.moveTo(fx - 54, my + 10); c.bezierCurveTo(fx - 50, my - 18, fx - 14, my - 20, fx, my - 10); c.bezierCurveTo(fx + 14, my - 20, fx + 50, my - 18, fx + 54, my + 10); c.bezierCurveTo(fx + 30, my + 18, fx + 10, my + 8, fx, my + 6); c.bezierCurveTo(fx - 10, my + 8, fx - 30, my + 18, fx - 54, my + 10); c.closePath(); }, PAL.hairSh, { lw: 4 });
  for (let i = -3; i <= 3; i++) line(ctx, [[fx + i * 12, my - 6], [fx + i * 13, my + 6]], 2.5, '#2A2020');
}

// Dr. Max on holiday: Hawaiian shirt, no coat, no stethoscope (same head)
function hawaiiTorso(ctx, o) {
  const B = PAL.jacket;
  const path = c => {
    c.moveTo(-SH_X - 14, SH_Y - 14); c.quadraticCurveTo(0, SH_Y - 44, SH_X + 14, SH_Y - 14);
    c.bezierCurveTo(SH_X + 32, SH_Y + 10, SH_X + 24, -40, 100, 40); c.quadraticCurveTo(0, 54, -100, 40);
    c.bezierCurveTo(-SH_X - 24, -40, -SH_X - 32, SH_Y + 10, -SH_X - 14, SH_Y - 14); c.closePath();
  };
  paint(ctx, path, B, { shade: PAL.jacketSh, sx: 12, sy: 6, lw: 6 });
  ctx.save(); ctx.beginPath(); path(ctx); ctx.clip();
  // hibiscus print
  const fl = [[-60, -190], [40, -150], [-20, -80], [70, -40], [-75, -20], [10, 10], [80, -210]];
  for (const [fx, fy] of fl) { hibiscus(ctx, fx, fy, 1); }
  for (const [lx, ly, r] of [[-20, -220, 0.6], [60, -100, -0.8], [-60, -110, 2.2], [30, -10, 1.2]]) {
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(r);
    paint(ctx, c => c.ellipse(0, 0, 26, 10, 0, 0, 7), '#2FA36B', { lw: 3 }); ctx.restore();
  }
  ctx.restore();
  // open collar + skin V
  paint(ctx, c => { c.moveTo(-30, SH_Y - 22); c.lineTo(30, SH_Y - 22); c.lineTo(0, SH_Y + 40); c.closePath(); }, PAL.skin, { lw: 4 });
  for (const k of [-1, 1]) paint(ctx, c => { c.moveTo(k * 30, SH_Y - 22); c.lineTo(k * 74, SH_Y - 30); c.lineTo(k * 40, SH_Y + 22); c.lineTo(k * 4, SH_Y + 44); c.closePath(); }, B, { shade: PAL.jacketSh, sx: k * 3, sy: 3, lw: 5 });
  ctx.fillStyle = '#FFF4E0';
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(4, SH_Y + 80 + i * 70, 6, 0, 7); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = OL; ctx.stroke(); }
  // sunglasses hooked on the shirt
  ctx.save(); ctx.translate(-46, SH_Y + 70); ctx.rotate(0.15);
  for (const k of [-1, 1]) paint(ctx, c => c.ellipse(k * 20, 0, 18, 13, 0, 0, 7), '#1E2230', { lw: 4 });
  line(ctx, [[-4, -3], [4, -3]], 4, OL); ctx.restore();
}
function hibiscus(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 0; i < 5; i++) { ctx.save(); ctx.rotate(i * 1.2566); paint(ctx, c => c.ellipse(0, -16, 12, 17, 0, 0, 7), '#FF8FA3', { lw: 3 }); ctx.restore(); }
  ctx.beginPath(); ctx.arc(0, 0, 6, 0, 7); ctx.fillStyle = '#FFD23F'; ctx.fill();
  ctx.restore();
}


// ---- Ep4 hotel crew: Carmen (receptionist) + Pablo (bellboy) — new characters, same crew rig
function carmenExtra(ctx) {
  // gold hotel pin + name tag, thin gold collar trim
  for (const k of [-1, 1]) line(ctx, [[k * 34, SH_Y - 20], [k * 66, SH_Y - 26], [k * 30, SH_Y + 40]], 3, '#F2C744');
  ctx.save(); ctx.translate(-58, SH_Y + 80);
  paint(ctx, c => { c.arc(0, 0, 18, 0, 7); }, '#F2C744', { shade: '#C79A2A', sx: 2, sy: 2, lw: 3.5 });
  line(ctx, [[-6, -2], [6, -2]], 3, OL); line(ctx, [[0, -8], [0, 8]], 3, OL);
  ctx.restore();
  paint(ctx, c => roundRect(c, 24, SH_Y + 66, 66, 24, 5), '#F2C744', { lw: 3 });
  ctx.fillStyle = '#4A1620'; ctx.font = '800 14px FredokaL, NunitoC'; ctx.textAlign = 'center'; ctx.fillText('CARMEN', 57, SH_Y + 83);
}
function carmenHairBack(ctx) { paint(ctx, c => c.ellipse(0, -176, 74, 56, 0, 0, 7), PAL.hair, { shade: PAL.hairSh, sx: -6, sy: -6 }); paint(ctx, c => roundRect(c, -46, -172, 92, 14, 7), '#F2C744', { lw: 4 }); }
function pabloExtra(ctx) {
  // gold buttons down the front + shoulder braid + name tag
  for (let i = 0; i < 4; i++) { ctx.fillStyle = '#F2C744'; ctx.beginPath(); ctx.arc(0, SH_Y + 40 + i * 52, 8, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = OL; ctx.stroke(); }
  for (const k of [-1, 1]) line(ctx, [[k * 60, SH_Y - 14], [k * 100, SH_Y + 4]], 7, '#F2C744');
  paint(ctx, c => roundRect(c, 24, SH_Y + 70, 64, 24, 5), '#FFFFFF', { lw: 3 });
  ctx.fillStyle = '#7A1E26'; ctx.font = '800 14px FredokaL, NunitoC'; ctx.textAlign = 'center'; ctx.fillText('PABLO', 56, SH_Y + 87);
}
function pabloHair(ctx) {
  bobHair(ctx);
  // red pillbox hat with chin strap
  ctx.save(); ctx.translate(0, -150);
  line(ctx, [[-120, 70], [-120, 120]], 4, '#F2C744');
  paint(ctx, c => roundRect(c, -92, -44, 184, 60, 14), '#C8323A', { shade: '#9E232B', sx: 5, sy: 4, lw: 6 });
  paint(ctx, c => roundRect(c, -92, -2, 184, 12, 5), '#F2C744', { lw: 3.5 });
  ctx.fillStyle = '#F2C744'; ctx.beginPath(); ctx.arc(0, -16, 10, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = OL; ctx.stroke();
  ctx.restore();
}

const STYLES = {
  anna: { female: true, glasses: false, mustache: false, steth: false, torso: jacketTorso, extra: annaExtra, hair: annaHair, hairBack: annaHairBack, skirt: '#1E2E5A',
    pal: { hair: '#3A2620', hairSh: '#24160F', hairHi: '#6A4A3A', browCore: '#24160F', iris: '#6B4A30', irisDk: '#3E2A1C', skin: '#F2CBA8', skinSh: '#D6A47E',
      jacket: '#2A3D73', jacketSh: '#1E2E5A', shirt: '#FFFFFF', sleeve: '#2A3D73', sleeveSh: '#1E2E5A', cuff: '#FFFFFF', pants: '#E9BFA0', pantsSh: '#D6A47E', shoe: '#1E2E5A', shoeSh: '#121C3A' } },
  bob: { glasses: false, mustache: 'brush', steth: false, torso: jacketTorso, extra: bobExtra, hair: bobHair, cap: true, browW: 16, long: true,
    pal: { hair: '#4A4040', hairSh: '#2E2626', hairHi: '#6A6060', browCore: '#1E1818', iris: '#5A6A50', irisDk: '#3A4630', skin: '#EBC3A2', skinSh: '#CF9E7C',
      jacket: '#7C8494', jacketSh: '#5E6676', shirt: '#DCE3EE', sleeve: '#7C8494', sleeveSh: '#5E6676', cuff: '#DCE3EE', button: '#C9CDD6', pants: '#3A3F4C', pantsSh: '#262A34', shoe: '#1A1C22', shoeSh: '#0E0F12' } },
  maxVac: { glasses: true, mustache: true, steth: false, torso: hawaiiTorso,
    pal: { jacket: '#2E9BD6', jacketSh: '#1F7AB0', sleeve: '#2E9BD6', sleeveSh: '#1F7AB0', cuff: '#2E9BD6', pants: '#E8D6A8', pantsSh: '#C8B484', shoe: '#8A5A34', shoeSh: '#5E3C22' } },
};
STYLES.carmen = Object.assign({}, STYLES.anna, { extra: carmenExtra, hairBack: carmenHairBack, skirt: '#5A1A26',
  pal: Object.assign({}, STYLES.anna.pal, { hair: '#241812', hairSh: '#140C08', hairHi: '#4A3226', skin: '#E9BE98', skinSh: '#CC9870', jacket: '#7A2432', jacketSh: '#5A1A26', sleeve: '#7A2432', sleeveSh: '#5A1A26', pants: '#E0B48E', pantsSh: '#CC9870', shoe: '#3A1018', shoeSh: '#220A0E', iris: '#4A3020', irisDk: '#2E1C12' }) });
STYLES.pablo = { glasses: false, mustache: false, steth: false, torso: jacketTorso, extra: pabloExtra, hair: pabloHair, browW: 14, long: false,
  pal: { hair: '#1E1612', hairSh: '#0E0A08', hairHi: '#4A3A30', browCore: '#140E0A', iris: '#4A3020', irisDk: '#2E1C12', skin: '#E3B48E', skinSh: '#C58E66',
    jacket: '#C8323A', jacketSh: '#9E232B', shirt: '#FFFFFF', sleeve: '#C8323A', sleeveSh: '#9E232B', cuff: '#F2C744', button: '#F2C744', pants: '#23262F', pantsSh: '#14161C', shoe: '#14161C', shoeSh: '#0A0B0E' } };
STYLES.annaFA = Object.assign({}, STYLES.anna, { hair: (c, o) => { annaHair(c, o); annaHat(c); } });

module.exports = { drawCrew, STYLES };
