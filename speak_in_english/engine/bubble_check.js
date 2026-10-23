// usage: node bubble_check.js <ep> "$(pwd)"  (run from speak_in_english/engine)
// For every on-screen line (and every meaning chunk): is its bubble fully visible (scale ~1, text fully typed) at the end of the speech?
const path = require('path'), ENGINE = process.argv[3]; process.chdir(ENGINE);
const EP = process.argv[2]; process.argv[1] = path.join(ENGINE, EP + '.js');
const Hq = require(path.join(ENGINE, 'hq')); const E = require(path.join(ENGINE, 'engine_v2'));
let RF = null; E.run = (n, nf, rf) => { RF = rf; };
let F = null; global.__QA = { human() {}, worldDone() {}, ui(c, kind, r) { if (F && kind === 'bubble') F.push({ id: r.id, k: r.k, x: r.x, y: r.y, w: r.w, h: r.h }); } };
require(path.join(ENGINE, EP + '.js'));
const TL = JSON.parse(require('fs').readFileSync(`eps/${EP}/timeline.json`, 'utf8'));
const W = TL.cfg.format === 'landscape' ? 1920 : 1080, H = TL.cfg.format === 'landscape' ? 1080 : 1920;
const cv = Hq.createCanvas(W, H), ctx = cv.getContext('2d'); const TYPE = TL.cfg.format === 'landscape' ? 0.6 : 0.85;
const probes = [];
for (const sp of TL.speech) { if (['nar', 'tip', 'rec'].includes(sp.who)) continue;
  const ch = (TL.cfg.chunks || {})[sp.id];
  if (!ch) { probes.push({ id: sp.id, t: sp.t + Math.max(sp.d * TYPE + 0.02, sp.d - 0.05), part: '' }); continue; }
  const W8 = sp.words, cnt = ch.map(([en]) => en.trim().split(/\s+/).length); let wi = 0;
  ch.forEach(([en], i) => { const a = W8[wi][1]; wi += cnt[i]; const b = i === ch.length - 1 ? sp.d : W8[wi][1]; const d = b - a; probes.push({ id: sp.id, t: sp.t + a + Math.max(d * TYPE + 0.02, d - 0.25), part: `#${i + 1}` }); }); }
let bad = 0;
for (const p of probes) { F = []; ctx.setTransform(1, 0, 0, 1, 0, 0); RF(ctx, p.t, cv); const b = F.filter(x => x.id === p.id && x.k > 0.97);
  const off = b.some(x => x.x < -2 || x.y < -2 || x.x + x.w > W + 2 || x.y + x.h > H + 2);
  if (!b.length || off) { bad++; console.log('PROBLEM', p.id + p.part, p.t.toFixed(2), b.length ? 'offscreen' : 'no full bubble'); } }
console.log(`checked ${probes.length} line/chunk endings, problems: ${bad}`);
