// Camera assist (LAYOUT v2): keeps the director's camera, then nudges each shot so faces, text and bodies don't clash.
// Before rendering it walks the episode (every 0.2 s), records where faces, feet, bubbles, the lesson card, captions
// and inserts land on screen, and finds the smallest correction per moment: vertical / horizontal shift first,
// a slight zoom-out only when a shift can't solve it. Corrections are held through a shot, eased in and out, and reset
// on camera cuts, so close-ups, push-ins and cuts stay exactly as directed.
// Result is cached in eps/<ep>/camassist.json (keyed by the sources), so parallel render chunks reuse it.
const fs = require('fs'), crypto = require('crypto');
const W = 1080, H = 1920, STEP = 0.2, FPS = 30;
const SAFE_TOP = 150, SAFE_BOTTOM = 1560, BUBBLE_MIN_Y = 360;
const area = r => Math.max(0, r.w) * Math.max(0, r.h);
const inter = (a, b) => { const x0 = Math.max(a.x, b.x), y0 = Math.max(a.y, b.y), x1 = Math.min(a.x + a.w, b.x + b.w), y1 = Math.min(a.y + a.h, b.y + b.h); return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; };
const inRect = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

function collect(TL, RF, Hq) {
  const canvas = Hq.createCanvas(W, H), ctx = canvas.getContext('2d'); const prev = global.__QA; let F = null;
  global.__QA = {
    human(c, cfg, st, g) { if (!F || c.canvas !== canvas) return; const M = c.getTransform(), s = Math.hypot(M.a, M.b); const P = (x, y) => ({ x: M.a * x + M.c * y + M.e, y: M.b * x + M.d * y + M.f });
      const hc = P(g.head.x, g.head.y), rx = g.hw * 1.02 * s, ry = g.hh * 1.08 * s; if (rx < 14) return;
      F.chars.push({ hc, rx, ry, hs: g.h * s, talk: st.talk || 0, legs: st.legs !== false && !(g.drop || 0) && ['stand', 'walk', 'wide'].includes(st.legPose || 'stand'), floor: P(0, 0).y, ankle: P(0, -40).y, knee: P(0, -g.h * 0.24).y }); },
    worldDone() {},
    ui(c, kind, r) { if (!F || c.canvas !== canvas) return; const M = c.getTransform(); F.ui.push({ kind, k: r.k, x: M.a * r.x + M.e, y: M.d * r.y + M.f, w: r.w * M.a, h: r.h * M.d, anchor: r.anchor, dev: r.dev }); },
  };
  const out = [];
  try { for (let t = 0; t < TL.dur; t += STEP) { F = { t, chars: [], ui: [] }; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; RF(ctx, t, canvas); out.push(F); } }
  finally { global.__QA = prev; }
  return out;
}

// cost of a framing correction (f = zoom about screen centre, dx/dy = screen shift) for one sampled moment
function cost(S, f, dx, dy) {
  const T = p => ({ x: 540 + (p.x - 540) * f + dx, y: 960 + (p.y - 960) * f + dy });
  const card = S.ui.find(u => u.kind === 'card' && u.k > 0.02), caps = S.ui.filter(u => u.kind === 'captions'), fixed = S.ui.filter(u => u.kind === 'insert' || u.kind === 'window');
  const bubbles = S.ui.filter(u => u.kind === 'bubble' && u.k > 0.3);
  let c = Math.abs(dy) * 0.12 + Math.abs(dx) * 0.12 + (1 - f) * 2200;
  for (const m of S.ui.filter(u => u.kind === 'mark')) { const p = T(m.dev); if (p.x < 40 || p.x > W - 40 || p.y < SAFE_TOP || p.y > SAFE_BOTTOM) c += 300; if (card && inRect(p, card)) c += 300; }
  for (const ch of S.chars) {
    if (fixed.some(u => u.kind === 'window' && inRect(ch.hc, u))) continue;     // person inside a video-call window: not camera space
    const p = T(ch.hc), rx = ch.rx * f, ry = ch.ry * f, face = { x: p.x - rx, y: p.y - ry, w: 2 * rx, h: 2 * ry }, wgt = ch.talk > 0.02 ? 1.5 : 1;
    const onScreen0 = ch.hc.x > 0 && ch.hc.x < W && ch.hc.y > -ch.ry && ch.hc.y < H;
    if (!onScreen0) continue;                                                        // entering/leaving the frame is the director's choice
    if (card) c += 1300 * wgt * area(inter(face, card)) / area(face);
    for (const u of fixed) c += 900 * wgt * area(inter(face, u)) / area(face);
    for (const u of caps) c += 450 * wgt * area(inter(face, u)) / area(face);
    if (face.y < SAFE_TOP) c += (SAFE_TOP - face.y) * 2 * wgt + (face.y < 0 ? 500 : 0);
    if (face.y + face.h > SAFE_BOTTOM) c += (face.y + face.h - SAFE_BOTTOM) * 3 * wgt;
    if (p.x < 70) c += (70 - p.x) * 3 * wgt; if (p.x > W - 70) c += (p.x - W + 70) * 3 * wgt;
    // the speaker's own bubble is clamped under the level bar: keep the face below it
    for (const b of bubbles) { if (!b.anchor || Math.hypot(b.anchor.x - ch.hc.x, b.anchor.y - (ch.hc.y - ch.ry)) > ch.ry * 2.2) continue;
      const ay = T(b.anchor).y, top = Math.max(BUBBLE_MIN_Y, Math.min(SAFE_BOTTOM - b.h, ay - b.h - 60)), bot = top + b.h;
      if (b.x < face.x + face.w && b.x + b.w > face.x) c += Math.max(0, bot - face.y) * 3; if (bot > SAFE_BOTTOM) c += (bot - SAFE_BOTTOM) * 2; }
    // body crops (feet / knees) are only reported by qa_frames.js for a manual look: moving the whole shot for them made framing worse
  }
  return c;
}
function solve(S, hard) {
  const base = cost(S, 1, 0, 0); if (base < 25) return { f: 1, dx: 0, dy: 0, base, best: base };
  let best = { f: 1, dx: 0, dy: 0, c: base };
  const dxs = [-160, -120, -80, -40, 0, 40, 80, 120, 160];
  const zooms = !hard && S.ui.some(u => u.kind === 'card' && u.k > 0.02) ? [1, 0.96, 0.92] : [1];   // hard_cut: no automatic zoom-out at all   // zoom out only to make room for a lesson card, never in plain dialogue
  for (const f of zooms) for (const dx of dxs) for (let dy = -360; dy <= 360; dy += 8) { const c = cost(S, f, dx, dy); if (c < best.c - 0.01) best = { f, dx, dy, c }; }
  return best.c < base - 20 ? { ...best, base, best: best.c } : { f: 1, dx: 0, dy: 0, base, best: base };
}

// hard_cut: one fixed correction per shot (a shot = frames between camera cuts), chosen so the whole shot works:
// candidates are each sampled moment's own best fix plus "no fix"; the one with the lowest total cost over the shot wins.
// Nothing moves inside a shot, so the composition is decided once, like a cameraman framing a static shot.
function shotConstant(samples, sol, cut) {
  const n = cut.length, corr = new Array(n); let a = 0;
  for (let i = 1; i <= n; i++) { if (i < n && !cut[i]) continue;
    const ss = samples.filter(S => S.t * FPS >= a - 0.01 && S.t * FPS < i), cand = [{ f: 1, dx: 0, dy: 0 }];
    for (const S of ss) { const j = samples.indexOf(S), s = sol[j]; if (s && (s.dx || s.dy || s.f !== 1)) cand.push(s); }
    let best = cand[0], bc = Infinity;
    for (const c of cand) { let tot = 0; for (const S of ss) tot += cost(S, c.f, c.dx, c.dy); if (tot < bc - 0.01) { bc = tot; best = c; } }
    for (let f = a; f < i; f++) corr[f] = { f: best.f, dx: best.dx, dy: best.dy }; a = i; }
  return corr;
}
module.exports = function assist(EPN, TL, CAM, RF, Hq) {
  const hard = (process.env.CAMERA || (TL.cfg && TL.cfg.camera) || 'smooth') === 'hard_cut';
  const files = [`eps/${EPN}/timeline.json`, `${EPN}.js`, 'hq.js', 'ui_v2.js', 'ep_kit.js', 'camassist.js', 'cast_v2.js', 'episodes_v2.py'];
  const hash = crypto.createHash('md5'); for (const f of files) if (fs.existsSync(f)) hash.update(fs.readFileSync(f)); hash.update(Hq.STYLE + '|' + Hq.LAYOUT + (hard ? '|hard_cut' : ''));
  const key = hash.digest('hex'), cacheF = `eps/${EPN}/camassist.json`;
  let corr = null;
  if (fs.existsSync(cacheF)) { try { const c = JSON.parse(fs.readFileSync(cacheF, 'utf8')); if (c.key === key && c.n === CAM.length) corr = c.corr; } catch (e) {} }
  if (!corr) {
    const samples = collect(TL, RF, Hq);
    const sceneAt = t => TL.scenes.find(s => t >= s.s && t < s.e);
    const sol = samples.map(S => { const sc = sceneAt(S.t); return (!sc || sc.id === 'hook' || sc.id === 'outro') ? { f: 1, dx: 0, dy: 0 } : solve(S, hard); });
    // camera cuts split the timeline into shots; corrections never smear across a cut
    const cut = CAM.map((c, i) => i > 0 && (Math.abs(c.x - CAM[i - 1].x) * c.z + Math.abs(c.y - CAM[i - 1].y) * c.z + Math.abs(c.z - CAM[i - 1].z) * 1000 > 60));
    if (hard) corr = shotConstant(samples, sol, cut);
    else {
    // per-frame targets: anticipate a needed correction and hold it a little after the need ends (strongest need in [t-0.6, t+0.4]),
    // so the camera never drifts back while a card or bubble is still fading out
    const n = CAM.length, tgt = [];
    for (let i = 0; i < n; i++) { const t = i / FPS; let pick = { f: 1, dx: 0, dy: 0 }, m = 0;
      for (let j = Math.max(0, Math.floor((t - 0.6) / STEP)); j <= Math.min(sol.length - 1, Math.ceil((t + 0.4) / STEP)); j++) { const s = sol[j], gain = (s.base || 0) - (s.best || 0); if (gain > m) { m = gain; pick = s; } }   // the most important need wins, not the biggest move
      tgt.push(pick); }
    // zero-phase easing inside each shot (tau ~0.2 s), cut = hard reset
    corr = tgt.map(s => ({ f: s.f, dx: s.dx, dy: s.dy })); const a = 1 - Math.exp(-1 / (FPS * 0.2));
    for (const k of ['f', 'dx', 'dy']) { for (let i = 1; i < n; i++) if (!cut[i]) corr[i][k] += (corr[i - 1][k] - corr[i][k]) * (1 - a);
      for (let i = n - 2; i >= 0; i--) if (!cut[i + 1]) corr[i][k] += (corr[i + 1][k] - corr[i][k]) * (1 - a); }
    }
    corr = corr.map(c => ({ f: +c.f.toFixed(4), dx: +c.dx.toFixed(1), dy: +c.dy.toFixed(1) }));
    try { fs.writeFileSync(cacheF + '.tmp' + process.pid, JSON.stringify({ key, n: CAM.length, corr })); fs.renameSync(cacheF + '.tmp' + process.pid, cacheF); } catch (e) {}
  }
  for (let i = 0; i < CAM.length; i++) { const c = corr[i], cam = CAM[i]; if (!c) continue; const z1 = cam.z * c.f; CAM[i] = { ...cam, z: z1, x: cam.x - c.dx / z1, y: cam.y - c.dy / z1 }; }
  return corr;
};
