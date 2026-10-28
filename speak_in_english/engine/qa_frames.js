// Composition QA: node qa_frames.js <ep> [--step=0.25] [--out=../review/qa] [--sheet] [--json-only]
// Renders the episode frame by frame (no video) and checks what the viewer actually sees:
//  - faces covered by UI/overlays (pixel test: face pixels at the end of the world pass vs the final frame),
//  - awkward body crops (frame edge through feet/ankles or knees), speaker out of frame, forehead cut,
//  - speech bubbles off screen / covered / overlapping / too long,
//  - text and faces under the TikTok / YouTube Shorts interface.
// Read-only: episode sources and timelines are not modified.
const fs = require('fs'), path = require('path');
const ENGINE = __dirname; process.chdir(ENGINE);
const args = process.argv.slice(2), EP = args[0];
const opt = Object.fromEntries(args.slice(1).filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
const STEP = +(opt.step || 0.25), OUT = path.resolve(opt.out || '../review/qa');
process.argv[1] = path.join(ENGINE, EP + '.js');           // style/layout pinning works exactly as in a real render
const Hq = require('./hq'); const E = require('./engine_v2');
const W = 1080, H = 1920;
// platform overlays (1080x1920): status/search bar, right action rail, caption/username/music block
const UNSAFE = { top: { x: 0, y: 0, w: W, h: 110 }, right: { x: 940, y: 700, w: 140, h: 820 }, bottom: { x: 0, y: 1590, w: W, h: 330 } };
const canvas = Hq.createCanvas(W, H), ctx = canvas.getContext('2d');

let F = null;   // current frame record
const area = r => Math.max(0, r.w) * Math.max(0, r.h);
const inter = (a, b) => { const x0 = Math.max(a.x, b.x), y0 = Math.max(a.y, b.y), x1 = Math.min(a.x + a.w, b.x + b.w), y1 = Math.min(a.y + a.h, b.y + b.h); return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; };
const inRect = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
function gridEllipse(cx, cy, rx, ry, n = 11) { const pts = []; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const u = (i + 0.5) / n * 2 - 1, v = (j + 0.5) / n * 2 - 1; if (u * u + v * v <= 1) pts.push({ x: cx + u * rx, y: cy + v * ry }); } return pts; }
function gridRect(r, n = 12) { const pts = []; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) pts.push({ x: r.x + (i + 0.5) / n * r.w, y: r.y + (j + 0.5) / n * r.h }); return pts; }
function sample(pts) { const inside = pts.filter(p => p.x >= 0 && p.x < W && p.y >= 0 && p.y < H); if (!inside.length) return { pts: [], px: [] };
  const x0 = Math.floor(Math.min(...inside.map(p => p.x))), y0 = Math.floor(Math.min(...inside.map(p => p.y))), x1 = Math.ceil(Math.max(...inside.map(p => p.x))) + 1, y1 = Math.ceil(Math.max(...inside.map(p => p.y))) + 1;
  const d = ctx.getImageData(x0, y0, Math.min(W, x1) - x0, Math.min(H, y1) - y0); const ww = d.width;
  return { pts: inside, px: inside.map(p => { const i = ((Math.floor(p.y) - y0) * ww + (Math.floor(p.x) - x0)) * 4; return [d.data[i], d.data[i + 1], d.data[i + 2]]; }) }; }
function changed(snap, thr = 48) { const now = sample(snap.pts); const out = []; snap.px.forEach((a, i) => { const b = now.px[i]; if (b && Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2])) > thr) out.push(snap.pts[i]); }); return out; }
const devRect = (c, r) => { const M = c.getTransform(); return { x: M.a * r.x + M.e, y: M.d * r.y + M.f, w: r.w * M.a, h: r.h * M.d }; };

global.__QA = {
  human(c, cfg, st, g) { if (!F || c.canvas !== canvas) return; const M = c.getTransform(), s = Math.hypot(M.a, M.b); const Pt = (x, y) => ({ x: M.a * x + M.c * y + M.e, y: M.b * x + M.d * y + M.f });
    const hc = Pt(g.head.x, g.head.y), rx = g.hw * 1.02 * s, ry = g.hh * 1.08 * s; if (rx < 14) return;   // tiny background figures
    F.chars.push({ key: `${cfg.seed}|${cfg.h}|${(cfg.top || {}).col}`, hc, rx, ry, s, h: g.h, talk: st.talk || 0, legs: st.legs !== false, pose: st.legPose || 'stand', drop: g.drop || 0,
      floor: Pt(0, 0), ankle: Pt(0, -40), knee: Pt(0, -g.h * 0.24), hip: Pt(0, -g.h * 0.47), pts: gridEllipse(hc.x, hc.y, rx, ry), afterWorld: F.worldDone }); },
  worldDone(c) { if (!F || c.canvas !== canvas || F.worldDone) return; F.worldDone = true; for (const ch of F.chars) ch.snap = sample(ch.pts); for (const m of F.marks) m.snap = sample(gridEllipse(m.x + m.w / 2, m.y + m.h / 2, m.w / 2, m.h / 2, 7)); },
  ui(c, kind, r) { if (!F || c.canvas !== canvas) return; const rect = r.dev ? { x: r.dev.x - r.dev.r, y: r.dev.y - r.dev.r, w: 2 * r.dev.r, h: 2 * r.dev.r } : devRect(c, r); const rec = { kind, ...r, ...rect, after: F.worldDone }; F.ui.push(rec);
    if (kind === 'mark') { F.marks.push(rec); return; }
    if (kind === 'bubble' && r.k > 0.97) rec.snap = sample(gridRect(rect)); },
};

// ---- load the episode without rendering a video
let RF = null, NF = 0; E.run = (name, nf, rf) => { E.prepare(name, rf); RF = rf; NF = nf; };   // same camera assist as a real render
require(path.join(ENGINE, EP + '.js'));
if (!RF) { console.error('renderer did not call E.run'); process.exit(1); }
const TL = JSON.parse(fs.readFileSync(`eps/${EP}/timeline.json`, 'utf8'));
const sceneAt = t => TL.scenes.find(s => t >= s.s && t < s.e) || TL.scenes[TL.scenes.length - 1];

const findings = [];
const add = (t, type, sev, key, val, info = '') => findings.push({ t, type, sev, key, val, info });
const SEV = { critical: 3, major: 2, minor: 1 };
for (let t = 0; t < TL.dur; t += STEP) {
  const sc = sceneAt(t); if (!sc || sc.id === 'hook' || sc.id === 'outro' || t < sc.s + 1.25) continue;   // title, outro and level-intro wipes are designed full-screen moments
  F = { t, chars: [], ui: [], marks: [], worldDone: false };
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; RF(ctx, t, canvas);
  const after = F.ui.filter(u => u.after);
  // faces
  for (const ch of F.chars) {
    const inFrac = ch.pts.length ? ch.pts.filter(p => p.x >= 0 && p.x < W && p.y >= 0 && p.y < H).length / ch.pts.length : 0;
    const speaking = ch.talk > 0.02;
    if (inFrac < 0.5) { if (speaking) add(t, 'speaker_offscreen', 'critical', ch.key, 1 - inFrac); continue; }
    if (ch.hc.y - ch.ry * 0.55 < 0) add(t, 'head_cut', 'major', ch.key, 0);
    if (ch.snap && ch.snap.pts.length > 8) {
      const occ = changed(ch.snap), frac = occ.length / ch.snap.pts.length;
      if (frac >= 0.2) { const by = {}; for (const p of occ) { const u = after.find(u => u.kind !== 'captions' && inRect(p, u)) || after.find(u => inRect(p, u)); const k = u ? u.kind : 'overlay'; by[k] = (by[k] || 0) + 1; }
        const cause = Object.entries(by).sort((a, b) => b[1] - a[1])[0][0];
        const sev = frac >= 0.5 ? (speaking || cause === 'card' ? 'critical' : 'major') : (speaking ? 'major' : 'minor');
        add(t, 'face_covered_by_' + cause, sev, ch.key, frac, speaking ? 'speaker' : 'listener'); }
    }
    if (speaking && inRect(ch.hc, UNSAFE.bottom)) add(t, 'face_under_platform_ui', 'major', ch.key, 0);
    else if (speaking && inRect(ch.hc, UNSAFE.right)) add(t, 'face_under_platform_ui', 'minor', ch.key, 0);
    // body crops (standing figures whose legs are drawn)
    if (ch.legs && !ch.drop && ['stand', 'walk', 'wide'].includes(ch.pose) && ch.hc.y > 0) {
      const hs = ch.h * ch.s;
      // same rule as the camera assist: bad = frame edge through the feet/ankles or right at the knees (mid-shin / thigh cuts are fine)
      if (ch.floor.y > H + 2 && H > ch.ankle.y - 0.08 * hs) add(t, 'crop_feet_ankles', 'major', ch.key, ch.floor.y - H);
      else if (Math.abs(ch.knee.y - H) < 0.05 * hs) add(t, 'crop_knees', 'minor', ch.key, ch.knee.y - H);
    }
  }
  // important props marked with K.mark()
  for (const m of F.marks) { const cx = m.x + m.w / 2, cy = m.y + m.h / 2;
    if (cx < 0 || cx > W || cy < 0 || cy > H) add(t, 'prop_out_of_frame', 'major', m.id, 0);
    else if (m.snap && m.snap.pts.length) { const frac = changed(m.snap).length / m.snap.pts.length; if (frac >= 0.4) add(t, 'prop_covered', 'major', m.id, frac); } }
  // bubbles and text
  const bubbles = F.ui.filter(u => u.kind === 'bubble' && u.k > 0.97);
  for (const b of bubbles) {
    if (b.x < -2 || b.x + b.w > W + 2 || b.y < -2 || b.y + b.h > H + 2) add(t, 'bubble_offscreen', 'critical', b.id, 0);
    if (b.snap && b.snap.pts.length) { const frac = changed(b.snap).length / b.snap.pts.length; if (frac >= 0.15) add(t, 'bubble_covered', frac >= 0.4 ? 'critical' : 'major', b.id, frac); }
    if (b.lines >= 7) add(t, 'bubble_too_long', 'minor', b.id, b.lines);
    const ib = area(inter(b, UNSAFE.bottom)), ir = area(inter(b, UNSAFE.right));
    if (ib > 0.05 * area(b)) add(t, 'text_under_platform_ui', 'major', b.id, ib / area(b), 'bottom');
    else if (ir > 0.15 * area(b)) add(t, 'text_under_platform_ui', 'minor', b.id, ir / area(b), 'right rail');
  }
  for (let i = 0; i < bubbles.length; i++) for (let j = i + 1; j < bubbles.length; j++) { const a = area(inter(bubbles[i], bubbles[j])); if (a > 0.1 * Math.min(area(bubbles[i]), area(bubbles[j]))) add(t, 'bubble_overlap', 'major', bubbles[i].id + '+' + bubbles[j].id, a); }
  for (const u of F.ui.filter(u => (u.kind === 'card' || u.kind === 'captions') && u.k > 0.97)) { if (area(inter(u, UNSAFE.bottom)) > 0.05 * area(u)) add(t, 'text_under_platform_ui', 'major', u.kind, 0, u.kind); }
}
F = null;

// ---- merge per-sample findings into issues (continuous time ranges)
const issues = []; const byKey = {};
for (const f of findings) { const k = f.type + '|' + f.key; const cur = byKey[k];
  if (cur && f.t - cur.end <= STEP * 2.01) { cur.end = f.t; cur.n++; if (SEV[f.sev] > SEV[cur.sev]) cur.sev = f.sev; cur.max = Math.max(cur.max, f.val); if (!cur.info.includes(f.info)) cur.info.push(f.info); }
  else { const it = { ep: EP, type: f.type, key: f.key, start: f.t, end: f.t, n: 1, sev: f.sev, max: f.val, info: [f.info] }; issues.push(it); byKey[k] = it; } }
const MIN = { bubble_offscreen: 0, speaker_offscreen: 0.25 };
const real = issues.filter(i => (i.end - i.start + STEP) >= (MIN[i.type] ?? 0.5)).map(i => ({ ...i, dur: +(i.end - i.start + STEP).toFixed(2), info: i.info.filter(Boolean).join(',') }));
real.sort((a, b) => SEV[b.sev] - SEV[a.sev] || b.dur - a.dur);
const sum = { ep: EP, style: Hq.STYLE, layout: Hq.LAYOUT, samples: Math.ceil(TL.dur / STEP), issues: real.length, critical: real.filter(i => i.sev === 'critical').length, major: real.filter(i => i.sev === 'major').length, minor: real.filter(i => i.sev === 'minor').length };
fs.mkdirSync(path.join(OUT, EP), { recursive: true });
fs.writeFileSync(path.join(OUT, EP, 'qa.json'), JSON.stringify({ summary: sum, issues: real }, null, 1));
console.log(JSON.stringify(sum));
for (const i of real.slice(0, opt.brief ? 8 : 40)) console.log(`  ${i.sev.padEnd(8)} ${i.type.padEnd(28)} ${i.start.toFixed(2)}-${(i.end + STEP).toFixed(2)}s ${i.info}`);

// ---- contact sheet of the worst issues (frame + red boxes)
if (opt.sheet && real.length) {
  const top = real.filter(i => i.sev !== 'minor').slice(0, 6); if (!top.length) top.push(...real.slice(0, 3));
  const tw = 360, th = 640, sheet = Hq.createCanvas(tw * top.length, th + 70), sc2 = sheet.getContext('2d'); sc2.fillStyle = '#fff'; sc2.fillRect(0, 0, sheet.width, sheet.height);
  top.forEach((iss, n) => { const t = (iss.start + iss.end) / 2; F = { t, chars: [], ui: [], marks: [], worldDone: false }; ctx.setTransform(1, 0, 0, 1, 0, 0); RF(ctx, t, canvas);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.lineWidth = 8; ctx.strokeStyle = '#FF2020';
    for (const ch of F.chars) { ctx.beginPath(); ctx.ellipse(ch.hc.x, ch.hc.y, ch.rx, ch.ry, 0, 0, 7); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(0,160,255,.9)'; ctx.setLineDash([18, 12]); for (const u of Object.values(UNSAFE)) ctx.strokeRect(u.x, u.y, u.w, u.h); ctx.setLineDash([]);
    sc2.drawImage(canvas, n * tw, 0, tw, th); sc2.fillStyle = iss.sev === 'critical' ? '#B8302E' : '#C27A1A'; sc2.font = '18px sans-serif'; sc2.fillText(`${iss.sev}: ${iss.type}`, n * tw + 8, th + 26); sc2.fillStyle = '#333'; sc2.fillText(`${iss.start.toFixed(1)}–${(iss.end + STEP).toFixed(1)}s ${iss.info}`, n * tw + 8, th + 52); });
  F = null; fs.writeFileSync(path.join(OUT, EP, 'worst.png'), sheet.toBuffer('image/png'));
}
