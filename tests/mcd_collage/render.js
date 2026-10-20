// "How McDonald's Really Makes Money" — 23 s collage-documentary style test (1080x1920, 30 fps).
// Usage: node render.js video out.mp4 | still t1,t2,... out.png | cues   (writes cues.json for mix.py)
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('./kit');
const { C, F, clamp, lerp, seg, E, spring, hash, lerpCol, rr, cut, flat, applyCam, tag, restaurant, slab, burgerMoney, coin, bill, pin, sparkle, puff, hq, continents, ll } = K;
const W = 1080, H = 1920, FPS = 30, T = 23.0, A = [510, 860]; // anchor keeps action clear of TikTok UI (right rail, bottom caption)

// ---------- voice-over timing ----------
const VO = [['n1', 0.2], ['n2', 3.6], ['n3', 7.45], ['n4', 11.75], ['n5', 17.9]];
function word(id, w) { // start time of a word in a VO line (global seconds)
  const a = JSON.parse(fs.readFileSync(`${__dirname}/vo/${id}.align.json`)), s = a.characters.join('').toLowerCase(), i = s.indexOf(w);
  return VO.find(v => v[0] === id)[1] + (i < 0 ? 0 : a.character_start_times_seconds[i]);
}
const tRoy = word('n4', 'royalties'), tMany = word('n4', 'many'), tRent = word('n4', 'rent'), tMore = word('n5', 'more'), tBurg = word('n5', 'burgers'), tFr = word('n3', 'franchisees');

// ---------- layout ----------
const SY2 = -93, GOFF = 29;            // hero slab top (scene 2) and slab-top -> building ground offset
const CARD = [0, 140];                 // map card front edge (scene 3)
const k = 0.36;                        // diagram scale
const R = [{ x: -250, sy: -230, land: 'soil', city: 'Chicago' }, { x: -250, sy: 75, land: 'pave', city: 'London' }, { x: -250, sy: 380, land: 'soil', city: 'Tokyo' }];
const HQ = [250, 420, 0.95];
const CITIES = [['Chicago', -88, 42], ['Los Angeles', -118, 34], ['New York', -74, 41], ['Mexico City', -99, 19], ['Bogota', -74, 5], ['Sao Paulo', -46, -23], ['London', 0, 52],
  ['Paris', 2, 49], ['Madrid', -4, 40], ['Moscow', 37, 56], ['Cairo', 31, 30], ['Johannesburg', 28, -26], ['Dubai', 55, 25], ['Mumbai', 73, 19], ['Beijing', 116, 40],
  ['Shanghai', 121, 31], ['Seoul', 127, 37], ['Tokyo', 140, 36], ['Sydney', 151, -34], ['Jakarta', 107, -6]]
  .map(([n, lo, la]) => { const p = ll(lo, la); return { n, x: CARD[0] + p[0], y: CARD[1] + p[1] }; });
CITIES.forEach(c => { c.t = c.n === 'Chicago' ? 8.12 : Math.max(8.7, 8.85 + ((c.x + 360) / 760) * 1.6); });
const chosen = n => R.findIndex(r => r.city === n);
const bez = (p, u) => { const v = 1 - u; return [0, 1].map(i => v * v * v * p[0][i] + 3 * v * v * u * p[1][i] + 3 * v * u * u * p[2][i] + u * u * u * p[3][i]); };
const ROY = R.map((r, i) => { const s = [r.x + k * 215, r.sy - k * 150], e = [HQ[0] - 108 * HQ[2], HQ[1] - [470, 340, 210][i] * HQ[2]]; return [s, [s[0] + 150, s[1] - 70], [e[0] - 130, e[1] + 10], e]; });
const RENT = R.map((r, i) => { if (r.land !== 'soil') return null; const s = [r.x + k * 330, r.sy + k * 110], e = [HQ[0] - 108 * HQ[2], HQ[1] - [400, 140][i ? 1 : 0] * HQ[2]]; return [s, [s[0] + 120, s[1] + 90], [e[0] - 150, e[1] + 70], e]; });
const TRAVEL = 1.05, FLOW_END = 16.7;
const COINS = [], BILLS = [];
R.forEach((r, i) => { for (let t = tRoy + i * 0.11; t < FLOW_END - TRAVEL; t += 0.34) COINS.push({ i, t }); });
R.forEach((r, i) => { if (RENT[i]) for (let t = tMany + i * 0.09; t < FLOW_END - TRAVEL; t += 0.5) BILLS.push({ i, t }); });

// ---------- camera ----------
function camAt(t) {
  const key = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)) });
  const P = { s1: { x: 0, y: -250, z: 0.82 }, punch: { x: 0, y: -175, z: 1.45 }, punch2: { x: 0, y: -170, z: 1.53 }, s2: { x: 0, y: -240, z: 0.72 }, s2b: { x: 0, y: -275, z: 0.78 }, s2c: { x: -12, y: -280, z: 0.85 },
    map: { x: 0, y: -150, z: 0.95 }, west: { x: -235, y: -160, z: 1.5 }, east: { x: 235, y: -150, z: 1.5 }, dia: { x: 0, y: 40, z: 1.0 }, dia2: { x: -12, y: 36, z: 1.05 },
    hero: { x: R[0].x, y: R[0].sy - 138, z: 2.1 }, hero2: { x: R[0].x + 4, y: R[0].sy - 144, z: 2.0 } };
  let c;
  if (t < 0.86) c = P.s1;
  else if (t < 1.25) c = key(P.s1, P.punch, E.out5(seg(t, 0.86, 1.2)));
  else if (t < 3.4) c = key(P.punch, P.punch2, E.inOut(seg(t, 1.25, 3.4)));
  else if (t < 4.3) c = key(P.punch2, P.s2, E.inOut5(seg(t, 3.4, 4.25)));
  else if (t < 5.0) c = key(P.s2, P.s2b, E.inOut(seg(t, 4.3, 5.0)));
  else if (t < 7.35) c = key(P.s2b, P.s2c, E.inOut(seg(t, 5.0, 7.35)));
  else if (t < 8.5) c = key(P.s2c, P.map, E.inOut(seg(t, 7.35, 8.4)));
  else if (t < 9.0) c = key(P.map, P.west, E.inOut(seg(t, 8.5, 9.0)));
  else if (t < 10.45) c = key(P.west, P.east, E.inOut(seg(t, 9.0, 10.45)));
  else if (t < 11.35) c = key(P.east, P.map, E.inOut(seg(t, 10.45, 11.3)));
  else if (t < 12.4) c = key(P.map, P.dia, E.inOut(seg(t, 11.4, 12.35)));
  else if (t < 16.9) c = key(P.dia, P.dia2, E.inOut(seg(t, 12.4, 16.9)));
  else if (t < 17.85) c = key(P.dia2, P.hero, E.inOut5(seg(t, 16.9, 17.8)));
  else c = key(P.hero, P.hero2, E.inOut(seg(t, 17.85, T)));
  c.r = t > 9.0 && t < 10.45 ? Math.sin(seg(t, 9.0, 10.45) * Math.PI) * 0.025 : 0;
  // impact shakes
  let sh = 0; for (const [t0, a] of [[0.86, 22], [4.85, 8], [20.28, 14]]) if (t > t0 && t < t0 + 0.5) sh += a * Math.exp(-(t - t0) * 9) * Math.sin((t - t0) * 70);
  c.shx = sh * 0.4; c.shy = sh; return c;
}

// ---------- background collage layer (parallax) ----------
function torn(ctx, x, y, w, h, rot, seed, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  cut(ctx, () => { ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); for (let i = 0; i <= 12; i++) ctx.lineTo(-w / 2 + (w * i) / 12, -h / 2 + (hash(seed + i) - 0.5) * 14);
    for (let i = 12; i >= 0; i--) ctx.lineTo(-w / 2 + (w * i) / 12, h / 2 + (hash(seed + 40 + i) - 0.5) * 14); ctx.closePath(); }, col, { lw: 0, sb: 14, sy: 6, edgeW: 0 });
  ctx.restore();
}
function halftone(ctx, x, y, n, step, col) {
  ctx.fillStyle = col; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const d = Math.hypot(i - n / 2, j - n / 2) / (n / 2), r = step * 0.38 * (1 - d); if (r > 0.6) { ctx.beginPath(); ctx.arc(x + i * step, y + j * step, r, 0, 7); ctx.fill(); } }
}
function background(ctx, t, cam) {
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
  // far layer: torn paper strips and halftone patches
  ctx.save(); applyCam(ctx, cam, A, 0.25);
  torn(ctx, -470, -820, 520, 90, -0.12, 1, '#EFE6D3'); torn(ctx, 520, 760, 560, 100, 0.09, 7, '#EAE2CF'); torn(ctx, 560, -420, 300, 70, 0.5, 13, '#F1E2C4');
  torn(ctx, -560, 560, 360, 80, -0.4, 21, '#E3EEE9');
  halftone(ctx, 260, -900, 12, 20, 'rgba(23,23,23,0.10)'); halftone(ctx, -640, 220, 11, 22, 'rgba(230,57,70,0.16)'); halftone(ctx, 380, 380, 10, 20, 'rgba(38,166,154,0.16)');
  ctx.restore();
  // accent disc behind the hero object: yellow (hook) -> teal ring (map) -> gone (diagram) -> yellow (finale)
  ctx.save(); applyCam(ctx, cam, A, 0.6);
  let r = 0, col = C.yellow;
  if (t < 7.6) r = 400 * E.back(seg(t, 0.08, 0.5), 2) * (1 - E.in(seg(t, 7.35, 7.7)));
  if (t >= 16.9) { r = 260 * E.back(seg(t, 17.9, 18.5), 2); }
  if (r > 1) {
    const cx = t < 10 ? 0 : R[0].x * 0.6 + 0, cy = t < 10 ? -300 : (R[0].sy - 160) * 0.6 + 0;
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip(); halftone(ctx, cx - r, cy + r * 0.1, 18, r / 9, 'rgba(233,169,58,0.55)'); ctx.restore();
  }
  if (t > 8.2 && t < 12.2) { // pale teal stage behind the map
    const u = E.out(seg(t, 8.2, 8.9)) * (1 - E.in(seg(t, 11.6, 12.2)));
    ctx.fillStyle = 'rgba(38,166,154,0.10)'; ctx.beginPath(); ctx.arc(0, -150 * 0.6, 640 * u, 0, 7); ctx.fill();
  }
  ctx.restore();
}

// ---------- scene content (world space) ----------
function world(ctx, t, cam) {
  const p = (x0, x1) => seg(t, x0, x1);
  // ---- scene 1-2: restaurant, burger -> money, rising land ----
  if (t < 8.3) {
    const slabU = p(4.25, 5.0), slabY = t < 4.25 ? 1600 : lerp(1600, SY2, E.back(slabU, 1.25));
    const m = E.inOut(p(7.35, 8.3)), dm = E.inOut(p(7.35, 7.95));
    const sy = t < 7.35 ? slabY : lerp(SY2, CARD[1], m);
    // sidewalk under the building before the land arrives
    const ground = Math.min(0, slabY - GOFF);
    if (slabY > 60) { const sw = E.out(p(0.0, 0.35)); flat(ctx, () => rr(ctx, -330 * sw, 0, 660 * sw, 20, 10), C.grey, 3); }
    if (t > 4.2) {
      slab(ctx, 0, sy, 1, { w: lerp(640, 920, m), depth: lerp(400, 0, dm), top: lerp(64, 580, m), inset: lerp(34, 0, m), topCol: lerpCol(C.green, C.cream, m),
        plot: t < 7.5 ? p(5.6, 6.5) * (1 - p(7.35, 7.5)) : 0 });
      if (t > 5.1 && t < 7.6) tag(ctx, 'REAL ESTATE', -120, sy + 165, { u: p(5.15, 5.6) * (1 - p(7.35, 7.55)), size: 50, rot: -0.06, bg: C.ink });
    }
    // building: pops in, rides the land, then flies into the first map pin
    if (t < 8.15) {
      const pop = spring(t - 0.02, 2.0, 6.5), fly = E.inOut(p(7.35, 8.12));
      let bx = 0, by = ground, bs = 1, rot = 0;
      if (t > 7.35) { const c = CITIES[0]; bx = lerp(0, c.x, fly); by = lerp(ground, c.y, fly) - Math.sin(fly * Math.PI) * 160; bs = lerp(1, 0.06, E.in(fly)); rot = Math.sin(fly * Math.PI) * 0.3; }
      const push = t > 4.6 && t < 5.3 ? 1 - spring(t - 4.75, 3, 6) : 0;
      restaurant(ctx, bx, by, bs, { sy: Math.max(0.02, pop) * (1 + push * 0.1), sx: 1 + (1 - Math.min(1, pop)) * 0.25 - push * 0.06, rot, glow: t > 4.0 ? Math.exp(-(t - 4.02) * 3) : 0 });
      if (t > 4.0 && t < 4.9) for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28 + 0.3, u = p(4.02, 4.7); sparkle(ctx, 176 + Math.cos(a) * (60 + u * 150), -440 + Math.sin(a) * (60 + u * 150), 22 * Math.sin(u * Math.PI)); }
    }
    // burger falls, squashes, morphs into a bill stack, then flies into the sign
    if (t > 0.3 && t < 4.06) {
      const fall = p(0.35, 0.86), d = t > 0.86 ? 1 - spring(t - 0.86, 2.4, 5.5) : 0, mor = p(1.55, 2.45), fly = E.inOut(p(3.45, 4.05));
      let x = 0, y = lerp(-1900, 30, E.in(fall)), s = 1.3, sx = 1 - d * -0.24, sy = 1 - d * 0.3;
      if (t < 0.86) { sx = 0.9; sy = 1.14; }
      if (t > 3.45) { x = lerp(0, 176, fly); y = lerp(30, -400, fly) - Math.sin(fly * Math.PI) * 240; s = lerp(1.3, 0.05, E.in(fly)); }
      const bob = mor >= 1 && t < 3.45 ? Math.sin((t - 2.45) * 5) * 6 : 0;
      if (t < 0.86) for (let g = 4; g >= 1; g--) { ctx.save(); ctx.globalAlpha = 0.12; burgerMoney(ctx, x, lerp(-1900, 30, E.in(clamp(fall - g * 0.05))), s, 0, { sx, sy }); ctx.restore(); }
      if (t > 3.45) for (let g = 3; g >= 1; g--) { const f2 = E.inOut(clamp(p(3.45, 4.05) - g * 0.05)); ctx.save(); ctx.globalAlpha = 0.14; burgerMoney(ctx, lerp(0, 176, f2), lerp(30, -400, f2) - Math.sin(f2 * Math.PI) * 240, lerp(1.3, 0.05, E.in(f2)), 1); ctx.restore(); }
      burgerMoney(ctx, x, y + bob, s, mor, { sx, sy });
      puff(ctx, -260, 30, p(0.86, 1.5), -1); puff(ctx, 260, 30, p(0.86, 1.5), 1);
      if (t > 2.4 && t < 3.4) for (let i = 0; i < 5; i++) { const u = p(2.42 + i * 0.08, 2.95 + i * 0.08); sparkle(ctx, [-290, 280, -240, 300, 30][i], [-380, -300, -120, -40, -520][i], 30 * Math.sin(u * Math.PI)); }
    }
  }
  // ---- scene 3-4: map card, pins, diagram ----
  if (t >= 8.3 && t < 12.4) {
    const fade = 1 - E.inOut(p(11.8, 12.35)), sh = 1 - 0.12 * E.in(p(11.8, 12.35));
    ctx.save(); ctx.globalAlpha = fade; ctx.translate(CARD[0], CARD[1] - 290); ctx.scale(sh, sh); ctx.translate(-CARD[0], -(CARD[1] - 290));
    slab(ctx, CARD[0], CARD[1], 1, { w: 920, depth: 0, top: 580, inset: 0, topCol: C.cream });
    ctx.save(); ctx.translate(CARD[0], CARD[1]); rr(ctx, -460, -580, 920, 580, 0); ctx.clip();
    ctx.strokeStyle = 'rgba(23,23,23,0.13)'; ctx.lineWidth = 2; ctx.setLineDash([3, 10]);
    for (let la = -40; la <= 60; la += 20) { const y = ll(0, la)[1]; ctx.beginPath(); ctx.moveTo(-460, y); ctx.lineTo(460, y); ctx.stroke(); }
    for (let lo = -150; lo <= 180; lo += 30) { const x = ll(lo, 0)[0]; ctx.beginPath(); ctx.moveTo(x, -580); ctx.lineTo(x, 0); ctx.stroke(); }
    ctx.setLineDash([]);
    const rv = E.out(p(8.05, 9.0)) * 1150; ctx.beginPath(); ctx.arc(CITIES[0].x - CARD[0], CITIES[0].y - CARD[1], Math.max(1, rv), 0, 7); ctx.clip();
    continents(ctx, { shrink: i => 1 - E.in(p(11.45 + i * 0.03, 11.9 + i * 0.03)) });
    ctx.restore(); ctx.restore();
    // pins (three of them travel into the diagram)
    for (const c of CITIES) {
      const ci = chosen(c.n), u = p(c.t, c.t + 0.6), drop = (1 - E.out(p(c.t, c.t + 0.25))) * 50;
      if (ci < 0) { const s = E.elastic(u) * 0.85 * (1 - E.in(p(11.45, 11.8))); pin(ctx, c.x, c.y - drop, s); continue; }
      const mv = E.inOut(p(11.6, 12.3)), r = R[ci], gx = r.x, gy = r.sy - GOFF * k;
      const s = E.elastic(u) * 0.85 * (1 - E.in(p(11.9, 12.2))) * (1 + Math.sin(mv * Math.PI) * 0.5);
      pin(ctx, lerp(c.x, gx, mv), lerp(c.y - drop, gy, mv) - Math.sin(mv * Math.PI) * 120, s);
    }
    if (t > 10.5) tag(ctx, '~95% FRANCHISED', 0, CARD[1] + 75, { u: p(Math.max(10.55, tFr), Math.max(10.55, tFr) + 0.4) * (1 - p(11.45, 11.7)), size: 46, bg: C.red, rot: 0.03 });
  }
  if (t >= 11.9) diagram(ctx, t);
}

function diagram(ctx, t) {
  const p = (x0, x1) => seg(t, x0, x1);
  const out = 1 - E.in(p(16.85, 17.35)); // everything but R1 leaves for the finale
  // HQ rising out of a slot
  if (out > 0.01) {
    const hu = p(12.1, 12.7), hy = lerp(760, 0, E.back(hu, 1.2));
    ctx.save(); ctx.translate(HQ[0], HQ[1]); ctx.scale(out, out); ctx.translate(-HQ[0], -HQ[1]);
    flat(ctx, () => rr(ctx, HQ[0] - 150 * E.out(p(11.95, 12.25)), HQ[1] - 2, 300 * E.out(p(11.95, 12.25)), 18, 9), C.grey, 3);
    ctx.save(); ctx.beginPath(); ctx.rect(HQ[0] - 400, HQ[1] - 1200, 800, 1200); ctx.clip();
    const arrived = COINS.filter(c => t > c.t + TRAVEL).length + BILLS.filter(b => t > b.t + TRAVEL).length * 2;
    hq(ctx, HQ[0], HQ[1] + hy, HQ[2], { lit: 0.08 + 0.92 * arrived / (COINS.length + BILLS.length * 2) });
    ctx.restore();
    tag(ctx, 'HQ', HQ[0], HQ[1] - 700 * HQ[2], { u: p(12.65, 13.0), size: 44, bg: C.yellow, fg: C.ink, rot: -0.04 });
    ctx.restore();
  }
  // flow paths (dashed, drawn on)
  const drawPath = (P, u, col) => { if (u <= 0) return; ctx.beginPath(); for (let i = 0; i <= 40 * u; i++) { const q = bez(P, i / 40); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
    ctx.setLineDash([10, 12]); ctx.lineDashOffset = -t * 40; ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke(); ctx.setLineDash([]); };
  ctx.save(); ctx.globalAlpha = out;
  ROY.forEach((P, i) => drawPath(P, E.inOut(p(12.55 + i * 0.1, 13.1 + i * 0.1)), 'rgba(23,23,23,0.35)'));
  RENT.forEach((P, i) => P && drawPath(P, E.inOut(p(tMany - 0.4, tMany + 0.1)), 'rgba(61,140,106,0.55)'));
  ctx.restore();
  // restaurants on their plots (different property set-ups)
  R.forEach((r, i) => {
    const grow = E.back(p(12.0 + i * 0.06, 12.45 + i * 0.06), 1.6), s = (i ? out : 1) * grow; if (s <= 0.01) return;
    const lift = i === 0 ? hero(t) : null;
    ctx.save(); ctx.translate(r.x, r.sy); ctx.scale(s, s); ctx.translate(-r.x, -r.sy);
    if (r.land === 'soil') slab(ctx, r.x, r.sy, k, { w: 640, depth: lift ? lift.depth : 240, top: 64, plot: lift ? lift.plot : 0, coins: lift ? lift.coins : 0 });
    else slab(ctx, r.x, r.sy, k, { w: 600, depth: 70, top: 64, topCol: C.grey, soilCol: C.greyD, soilD: '#A9A193', soilDD: '#A9A193', grassLip: false });
    if (lift && lift.L > 2) { ctx.fillStyle = `rgba(40,25,10,${0.22 * clamp(lift.L / 120)})`; ctx.beginPath(); ctx.ellipse(r.x, r.sy - GOFF * k * 1.1, 200 * k * (1 - lift.L / 900), 16 * k, 0, 0, 7); ctx.fill(); }
    restaurant(ctx, r.x, r.sy - GOFF * k, k, lift ? { lift: lift.L, rot: lift.rot, sx: lift.sx, sy: lift.sy } : {});
    ctx.restore();
  });
  // money in motion: royalties (coins) from every restaurant, rent (bills) only from company-owned plots
  if (out > 0.01) {
    ctx.save(); ctx.globalAlpha = out;
    for (const c of COINS) { const u = (t - c.t) / TRAVEL; if (u <= 0 || u >= 1) continue;
      for (let g = 3; g >= 0; g--) { const q = bez(ROY[c.i], E.inOut(clamp(u - g * 0.025))); ctx.save(); ctx.globalAlpha *= g ? 0.18 : 1; coin(ctx, q[0], q[1], 17 * (1 + Math.sin(u * Math.PI) * 0.3), (t - c.t) * 4, { flat: g > 0 }); ctx.restore(); } }
    for (const b of BILLS) { const u = (t - b.t) / TRAVEL; if (u <= 0 || u >= 1) continue;
      for (let g = 2; g >= 0; g--) { const q = bez(RENT[b.i], E.inOut(clamp(u - g * 0.03))); ctx.save(); ctx.globalAlpha *= g ? 0.18 : 1; bill(ctx, q[0], q[1], 0.6 * (1 + Math.sin(u * Math.PI) * 0.25), Math.sin((t - b.t) * 6) * 0.35); ctx.restore(); } }
    // legend
    const L1 = p(tRoy, tRoy + 0.4), L2 = p(tRent - 0.1, tRent + 0.3);
    if (L1 > 0) { coin(ctx, -330, 560, 22 * E.back(L1), 1); tag(ctx, 'ROYALTIES', -180, 560, { u: L1, size: 38, bg: C.ink, tape: false }); }
    if (L2 > 0) { bill(ctx, 80, 560, 0.62 * E.back(L2)); tag(ctx, 'RENT', 190, 560, { u: L2, size: 38, bg: C.billD, tape: false }); }
    ctx.restore();
  }
  if (t > 17.0) finale(ctx, t);
}

// hero restaurant state in the finale (lift, deeper land, plot, landing squash)
function hero(t) {
  const p = (x0, x1) => seg(t, x0, x1);
  let L = 0; if (t > 18.0 && t < 20.0) L = 300 * E.back(p(18.0, 18.6), 1.4); else if (t >= 20.0 && t < 20.28) L = 300 * (1 - E.in(p(20.0, 20.28)));
  const d = t > 20.28 ? 1 - spring(t - 20.28, 2.6, 6) : 0;
  return { L, rot: L > 0 ? Math.sin(t * 2.2) * 0.025 * (L / 230) : 0, sy: 1 - d * 0.16, sx: 1 + d * 0.1, depth: lerp(240, 420, E.out(p(18.05, 18.75))), plot: p(18.35, 19.1) * (1 - 0.6 * p(20.3, 20.8)), coins: p(18.4, 19.3) };
}

function finale(ctx, t) {
  const p = (x0, x1) => seg(t, x0, x1), r = R[0], gy = r.sy;
  puff(ctx, r.x - 105, gy - 6, p(20.28, 20.9), -1); puff(ctx, r.x + 105, gy - 6, p(20.28, 20.9), 1);
  // foreground pieces slide in: burger (left) and the money it really stands for (right)
  const bu = E.back(p(20.45, 20.95), 1.5), cu = E.back(p(20.6, 21.1), 1.5);
  if (bu > 0) { ctx.save(); ctx.translate(lerp(r.x - 520, r.x - 168, bu), gy + 72); ctx.rotate(lerp(-0.6, -0.08, bu)); burgerMoney(ctx, 0, 0, 0.2, 0); ctx.restore(); }
  if (cu > 0) { const cx = lerp(r.x + 520, r.x + 166, cu); bill(ctx, cx, gy + 66, 0.62, 0.06); for (let i = 0; i < 4; i++) coin(ctx, cx + 4, gy + 50 - i * 9, 19, 0.02, { flat: i > 0 }); }
  if (t > 20.9) for (let i = 0; i < 6; i++) { const ph = (t - 20.9 - i * 0.37) % 2.2; const u = ph / 1.1; if (ph > 0 && u < 1) sparkle(ctx, r.x + [-150, 140, -60, 170, -170, 60][i], gy - [220, 160, 250, 60, 90, 230][i], 13 * Math.sin(u * Math.PI)); }
}

// ---------- screen-space typography ----------
function overlay(ctx, t) {
  if (t < tMore - 0.1) return;
  const p = (x0, x1) => seg(t, x0, x1);
  // line 1: mask slide-up
  ctx.save(); ctx.font = `100px ${F.black}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const u1 = E.out5(p(tMore - 0.05, tMore + 0.4)); ctx.beginPath(); ctx.rect(0, 220, W, 120); ctx.clip();
  ctx.fillStyle = C.ink; ctx.fillText('MORE THAN', A[0], 318 + (1 - u1) * 120); ctx.restore();
  // line 2: red paper strip wipes in, word slides up inside it
  const u2 = E.inOut(p(tBurg - 0.15, tBurg + 0.2)), u3 = E.out5(p(tBurg + 0.05, tBurg + 0.5)), sw = 640, sh = 150, x0 = A[0] - sw / 2, y0 = 352;
  if (u2 > 0) {
    ctx.save(); ctx.translate(A[0], y0 + sh / 2); ctx.rotate(-0.025); ctx.translate(-A[0], -(y0 + sh / 2));
    cut(ctx, () => rr(ctx, x0, y0, sw * u2, sh, 8), C.red, { lw: 0, sb: 24, sy: 12, edgeW: 12 });
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, sw * u2, sh); ctx.clip(); ctx.font = `126px ${F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF';
    ctx.fillText('BURGERS', A[0], y0 + 122 + (1 - u3) * 150); ctx.restore();
    ctx.fillStyle = 'rgba(255,240,200,0.8)'; ctx.save(); ctx.translate(x0 + 10, y0 + 6); ctx.rotate(-0.7); ctx.fillRect(-34, -12, 68, 24); ctx.restore();
    ctx.restore();
  }
}

// ---------- frame ----------
const TEX = K.paperTexture(W, H);
const sub = createCanvas(W, H), sx = sub.getContext('2d');
function drawFrame(ctx, t) {
  const cam = camAt(t);
  background(ctx, t, cam);
  ctx.save(); applyCam(ctx, cam, A); world(ctx, t, cam); ctx.restore();
  overlay(ctx, t);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.6; ctx.drawImage(TEX, 0, 0); ctx.restore();
}
function frame(ctx, t) { // camera motion blur: average sub-frames when the camera moves fast
  const a = camAt(t), b = camAt(t - 1 / FPS), v = Math.abs(Math.log(a.z / b.z)) * 40 + Math.hypot(a.x - b.x, a.y - b.y) * a.z / 20;
  const n = v > 1.2 ? 4 : 1;
  if (n === 1) return drawFrame(ctx, t);
  for (let j = 0; j < n; j++) { drawFrame(sx, t - (j / n) * (0.6 / FPS)); ctx.globalAlpha = 1 / (j + 1); ctx.drawImage(sub, 0, 0); }
  ctx.globalAlpha = 1;
}

// ---------- sound cues ----------
function cues() {
  const c = [['pop', 0.02], ['whoosh', 0.1, 0.5], ['fall', 0.35], ['thump', 0.86, 1], ['zoom', 0.88], ['puff', 0.9]];
  for (let i = 0; i < 6; i++) c.push(['paper', 1.55 + i * 0.09]);
  c.push(['kaching', 2.45], ['whoosh', 3.42, 0.8], ['coins', 4.0], ['rumble', 4.3], ['thump', 4.85, 0.6], ['tape', 5.15], ['scratch', 5.6], ['whoosh', 7.35, 0.7], ['unfold', 8.0], ['pop', 8.12]);
  CITIES.slice(1).forEach(x => c.push(['tick', x.t]));
  c.push(['tag', Math.max(10.55, tFr)], ['whoosh', 11.45, 0.6], ['pop', 12.05], ['pop', 12.15], ['pop', 12.25], ['rise', 12.1], ['thump', 12.55, 0.5], ['scratch', 12.6]);
  COINS.forEach(x => c.push(['clink', x.t + TRAVEL])); BILLS.forEach(x => c.push(['flutter', x.t + 0.1]));
  c.push(['tag', tRoy], ['tag', tRent - 0.1], ['zoom', 16.95], ['whoosh', 16.95, 0.9], ['rise', 18.0], ['coins', 18.5], ['tag', tMore], ['slam', tBurg + 0.05], ['fall', 20.0], ['thump', 20.28, 1], ['puff', 20.3],
    ['whoosh', 20.45, 0.4], ['kaching', 20.7]);
  fs.writeFileSync(__dirname + '/cues.json', JSON.stringify({ T, vo: VO, sfx: c }));
  console.log(c.length, 'cues');
}

async function video(out) {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(T * FPS), T0 = Date.now();
  for (let f = 0; f < N; f++) {
    ctx.globalAlpha = 1; frame(ctx, f / FPS);
    const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 90 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
function stills(ts, out) {
  const tw = 360, th = 640, cols = Math.min(ts.length, 6), rows = Math.ceil(ts.length / cols), sheet = createCanvas(tw * cols, th * rows), sc = sheet.getContext('2d');
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  ts.forEach((t, i) => { ctx.globalAlpha = 1; frame(ctx, t); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); sc.fillStyle = '#E63946'; sc.font = '22px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * tw + 8, Math.floor(i / cols) * th + 26); });
  fs.writeFileSync(out, sheet.toBuffer('image/png'));
}

const [mode, a1, a2] = process.argv.slice(2);
if (mode === 'video') video(a1 || 'out.mp4');
else if (mode === 'still') stills(a1.split(',').map(Number), a2 || 'stills.png');
else if (mode === 'cues') cues();
module.exports = { frame, W, H };
