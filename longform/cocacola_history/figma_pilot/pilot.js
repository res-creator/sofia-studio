// Figma pilot (30 s, chapter 3 "The One-Dollar Deal", b1 → first sentence of b4): AI illustrations from Figma (art/) as layered plates and cut-out
// sprites (green-screen sheets keyed by tools/chroma.py), animated in code: camera + parallax, sprites that slide/bob/hop/swap poses, flying money and
// documents, foam particles, dust, light, smoke, transitions — all cut on the word timings of the existing chapter-3 voice.
// Usage: node pilot.js still t1,t2,... out.png | frame t out.png | video out_video.mp4 | T
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { spawn } = require('child_process'); const fs = require('fs');
const L = require('../../kit/look');
const { clamp, lerp, seg, E } = L;
const W = 1920, H = 1080, FPS = 30, OFF = 2.7;            // pilot t = chapter t - OFF
const CH = `${__dirname}/../chapters/c3_bottles`;
// ---------- word timings from the existing chapter voice ----------
const CU = JSON.parse(fs.readFileSync(`${CH}/cues.json`)); const WORDS = {};
for (const [id, t0] of CU.vo) { const a = JSON.parse(fs.readFileSync(`${CH}/vo/${id}.align.json`)), s = a.characters.join(''), re = /\S+/g; let m; WORDS[id] = [];
  while ((m = re.exec(s))) WORDS[id].push({ w: m[0].toLowerCase().replace(/[^a-z0-9$']/g, ''), t: t0 + a.character_start_times_seconds[m.index] - OFF }); }
const at = (id, w, n = 0) => { const l = WORDS[id].filter(x => x.w.startsWith(w)); if (!l.length) throw new Error('word ' + id + ' ' + w); return l[Math.min(n, l.length - 1)].t; };
const T = +(at('b4', 'thomas') - 0.35).toFixed(2);       // ends right after "That dollar built the empire."
// ---------- easing helpers ----------
const ease = E.inOut, eo = E.out, back = u => E.back(clamp(u), 1.7);
const u = (t, t0, d) => clamp((t - t0) / d);
const noise = (t, k = 1) => Math.sin(t * 1.7 * k) * 0.6 + Math.sin(t * 2.9 * k + 1.3) * 0.4;
// ---------- assets ----------
const A = {}; const HI = `${__dirname}/hi`;
const SPR = { candler1: 'candler_pose1', candler2: 'candler_pose2', candler3: 'candler_pose3', thomas: 'thomas_bottle', thomasJump: 'thomas_jump', white: 'whitehead_case', whiteFlinch: 'whitehead_flinch',
  dollar: 'dollar', contract: 'contract', quill: 'quill', foam: 'bottle_foam', drop: 'foam_drop', glass: 'glass', ink: 'inkwell' };
const BG = { wide: '01_office_wide', empty: '02_office_empty', drawer: '06_drawer', empire: '07_empire' };
// ---------- camera: world = original 1536x864 illustration units; c = {x, y, z} centre + zoom ----------
const K = W / 1536;
function camT(ctx, c, d = 1, cx0 = 768, cy0 = 432) { ctx.translate(W / 2, H / 2); const z = Math.pow(c.z, d); ctx.scale(K * z, K * z); ctx.rotate(c.r || 0); ctx.translate(-(cx0 + (c.x - cx0) * d), -(cy0 + (c.y - cy0) * d)); }
function camKeys(keys, lt) { let a = keys[0], b = keys[keys.length - 1]; if (lt <= a[0]) return { x: a[1], y: a[2], z: a[3], r: a[4] || 0 }; if (lt >= b[0]) return { x: b[1], y: b[2], z: b[3], r: b[4] || 0 };
  for (let i = 1; i < keys.length; i++) if (lt < keys[i][0]) { a = keys[i - 1]; b = keys[i]; break; } const v = ease(seg(lt, a[0], b[0]));
  return { x: lerp(a[1], b[1], v) + noise(lt, 0.7) * 2.5, y: lerp(a[2], b[2], v) + noise(lt + 3, 0.6) * 2, z: Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), v)), r: lerp(a[4] || 0, b[4] || 0, v) }; }
const bg = (ctx, k) => ctx.drawImage(A[k], 0, 0, 1536, 864);
// sprite: anchor = bottom-centre (ax, ay in 0..1 of the sprite), size in sheet pixels (hi sprites are 1.5x)
function spr(ctx, k, x, y, s = 1, o = {}) { const im = A[k], w = im.width / 1.5 * s, h = im.height / 1.5 * s; ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.translate(x, y); ctx.rotate(o.r || 0); ctx.scale(o.flip ? -1 : 1, o.sq ? 1 / o.sq : 1);
  if (o.shadow) { ctx.save(); ctx.globalAlpha *= 0.35; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, 0, w * 0.45, w * 0.08, 0, 0, 6.28); ctx.fill(); ctx.restore(); }
  ctx.drawImage(im, -w * (o.ax ?? 0.5), -h * (o.ay ?? 1), w, h); ctx.restore(); }
function clipPoly(ctx, pts) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.clip(); }
// light & atmosphere
function beams(ctx, t, x0, y0, ang, n = 4, a = 0.12) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const fl = 0.75 + 0.25 * Math.sin(t * 0.8 + i * 1.7);
  ctx.save(); ctx.translate(x0 + i * 70, y0); ctx.rotate(ang); const g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, `rgba(255,220,150,${a * fl})`); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(-28, 0, 56 + i * 8, 900); ctx.restore(); } ctx.restore(); }
function dust(ctx, t, x, y, w, h, n = 40, col = '255,236,200') { ctx.save(); for (let i = 0; i < n; i++) { const h1 = L.hash(i * 3.7), h2 = L.hash(i * 9.1), h3 = L.hash(i * 1.3);
  const px = x + ((h1 * w + Math.sin(t * 0.3 + i) * 30 + t * 6 * (h3 - 0.5)) % w + w) % w, py = y + ((h2 * h - t * (8 + h3 * 10)) % h + h) % h, tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i));
  ctx.fillStyle = `rgba(${col},${0.55 * tw})`; ctx.beginPath(); ctx.arc(px, py, 1.2 + h3 * 2.2, 0, 6.28); ctx.fill(); } ctx.restore(); }
function glowAt(ctx, x, y, r, col, a) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }
function sparkle(ctx, x, y, s, a) { if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.globalAlpha = a; ctx.fillStyle = '#FFF8E0'; for (const r of [0, Math.PI / 2]) { ctx.save(); ctx.rotate(r + a * 0.6); ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * 0.12, -s * 0.12, s, 0); ctx.quadraticCurveTo(s * 0.12, s * 0.12, 0, s); ctx.quadraticCurveTo(-s * 0.12, s * 0.12, -s, 0); ctx.quadraticCurveTo(-s * 0.12, -s * 0.12, 0, -s); ctx.fill(); ctx.restore(); } ctx.restore(); glowAt(ctx, x, y, s * 2.2, 'rgba(255,240,190,0.9)', a * 0.6); }
function smoke(ctx, t, x, y, s = 1, n = 6) { ctx.save(); for (let i = 0; i < n; i++) { const ph = (t * 0.22 + i / n) % 1; ctx.globalAlpha = 0.5 * Math.sin(ph * Math.PI); ctx.fillStyle = '#F6EEE4';
  ctx.beginPath(); ctx.arc(x + ph * 60 * s + Math.sin(t + i) * 6 * s, y - ph * 110 * s, (10 + ph * 26) * s, 0, 6.28); ctx.fill(); } ctx.restore(); }
// FX after each frame: soft vignette + warm grade (keeps all plates in one look)
function grade(ctx, warm = 0.06, vig = 0.38) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(255,170,90,${warm})`; ctx.globalCompositeOperation = 'soft-light'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over'; const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 1.0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(15,6,0,${vig})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
// small type: only a date and two name tags (no label clutter)
function tag(ctx, s, x, y, a, size = 40) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y + (1 - a) * 16); ctx.font = `${size}px ${L.F.black}`; const w = ctx.measureText(s).width + size * 0.9;
  ctx.fillStyle = 'rgba(28,26,31,0.82)'; L.rr(ctx, -w / 2, -size * 0.75, w, size * 1.5, 10); ctx.fill(); ctx.fillStyle = '#F6EBD3'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 2); ctx.restore(); }

// ---------- shot boundaries (cut on the words) ----------
const S = { wide: 0, lawyers: at('b1', 'benjamin') - 0.2, candler: at('b2', 'candler') - 0.15, messy: at('b2', 'bottling') - 0.12, fountain: at('b2', 'and') - 0.05,
  fine: at('b2', 'but') - 0.1, contract: at('b3', 'he') - 0.1, dollar: at('b3', 'for') - 0.15, drawer: at('b3', 'and') - 0.1, empire: at('b4', 'that') - 0.25 };
// plate for the wide office with the foreground pieces (armchair, books) painted out, so those can slide in parallax
const FG_R = [[1172, 864], [1188, 560], [1300, 500], [1536, 494], [1536, 864]], FG_L = [[0, 660], [120, 610], [205, 610], [395, 770], [395, 864], [0, 864]];
const DESK = [[0, 585], [330, 537], [720, 513], [1050, 513], [1385, 553], [1414, 590], [1400, 864], [0, 864]];

function shotWide(ctx, t) { const lt = t - S.wide, c = camKeys([[0, 980, 470, 1.32], [S.lawyers - 0.2, 720, 430, 1.08]], lt);
  ctx.save(); camT(ctx, c, 1); ctx.drawImage(A.widePlate, 0, 0, 1536, 864); beams(ctx, lt, 1040, -40, 0.45, 4, 0.13); dust(ctx, lt, 900, 0, 600, 700, 55); ctx.restore();
  // foreground pieces move faster than the room (parallax)
  for (const pts of [FG_R, FG_L]) { ctx.save(); camT(ctx, c, 1.18); clipPoly(ctx, pts); bg(ctx, 'wide'); ctx.restore(); }
  L.dateCard(ctx, '1899', 260, 140, back(u(lt, at('b1', '1899') - 0.05, 0.4)), { size: 70 });
  // a glint travels along the bottle in the lawyer's hand
  ctx.save(); camT(ctx, c, 1); sparkle(ctx, 878, 190, 26, Math.max(0, Math.sin(clamp((lt - 2.1) / 0.9) * Math.PI))); ctx.restore(); grade(ctx); }
function officeBlur(ctx, c, px = 7) { ctx.save(); camT(ctx, c, 0.7); ctx.filter = `blur(${px}px)`; bg(ctx, 'empty'); ctx.filter = 'none'; ctx.restore(); }
function shotLawyers(ctx, t) { const lt = t - S.lawyers, dur = S.candler - S.lawyers, c = { x: 1050, y: 300, z: 1.25 + lt * 0.012 };
  officeBlur(ctx, c, 8); ctx.save(); camT(ctx, { x: 768, y: 432, z: 1 }, 1); beams(ctx, lt, 900, -60, 0.4, 3, 0.1); dust(ctx, lt, 0, 0, 1536, 864, 40); ctx.restore();
  ctx.save(); camT(ctx, { x: 768 + lt * 4, y: 432, z: 1.0 + lt * 0.01 }, 1);
  const tIn = eo(u(lt, 0, 0.6)), wIn = eo(u(lt, at('b1', 'joseph') - S.lawyers - 0.3, 0.6));
  const hop = at('b1', 'bottles') - S.lawyers, hp = u(lt, hop - 0.1, 0.55), jump = Math.sin(hp * Math.PI) * 60;
  spr(ctx, 'white', lerp(1700, 1010, wIn), 990 + noise(lt * 2) * 3, 1.08, { r: noise(lt + 2) * 0.012 });
  spr(ctx, 'thomas', lerp(-200, 560, tIn), 1010 - jump + noise(lt * 2.2) * 3, 1.0, { r: -0.03 * Math.sin(hp * Math.PI) + noise(lt) * 0.01 });
  // the idea: the bottle glints, then sparkles burst on "bottles"
  sparkle(ctx, 425 + 0, 330 - jump, 34, Math.max(0, Math.sin(clamp((lt - (at('b1', 'idea') - S.lawyers)) / 0.8) * Math.PI)));
  for (let i = 0; i < 6; i++) { const k = u(lt, hop + i * 0.06, 0.7); if (k > 0 && k < 1) sparkle(ctx, 425 + Math.cos(i) * 140 * k, 330 - jump + Math.sin(i * 2) * 120 * k, 16, 1 - k); }
  ctx.restore();
  tag(ctx, 'BENJAMIN THOMAS', 520, 960, eo(u(lt, at('b1', 'benjamin') - S.lawyers, 0.35)) * (1 - u(lt, dur - 0.4, 0.3)), 36);
  tag(ctx, 'JOSEPH WHITEHEAD', 1340, 960, eo(u(lt, at('b1', 'joseph') - S.lawyers, 0.35)) * (1 - u(lt, dur - 0.4, 0.3)), 36);
  grade(ctx); }
function candlerDesk(ctx, t, lt, c, pose, o = {}) { ctx.save(); camT(ctx, c, 1); bg(ctx, 'empty'); beams(ctx, lt, 1060, -40, 0.42, 3, 0.1); dust(ctx, lt, 900, 0, 600, 600, 30);
  const br = Math.sin(lt * 2.1) * 0.006, tilt = (o.tilt || 0) + noise(lt, 0.8) * 0.012;
  if (o.prev && o.mix < 1) spr(ctx, o.prev, 468, 712 + Math.sin(lt * 2.1) * 2, 0.5, { r: tilt, sq: 1 + br, a: 1 - o.mix });
  spr(ctx, pose, 468, 712 + Math.sin(lt * 2.1) * 2 - (o.lift || 0), 0.5, { r: tilt, sq: 1 + br, a: o.prev ? o.mix : 1 });
  ctx.save(); clipPoly(ctx, DESK); bg(ctx, 'empty'); ctx.restore(); // the desk occludes his lower body
  if (o.after) o.after(ctx); ctx.restore(); }
function shotCandler(ctx, t) { const lt = t - S.candler, c = camKeys([[0, 600, 440, 1.0], [1.6, 500, 380, 1.55]], lt);
  candlerDesk(ctx, t, lt, c, 'candler1', { tilt: -0.03 * eo(u(lt, at('b2', 'impressed') - S.candler, 0.4)) });
  // "hmph": a small puff from his moustache on "impressed"
  const p = u(lt, at('b2', 'impressed') - S.candler + 0.15, 0.7); if (p > 0 && p < 1) { ctx.save(); camT(ctx, c, 1); ctx.globalAlpha = 0.7 * (1 - p); ctx.fillStyle = '#F2EEE6';
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(468 + sx * (40 + p * 50), 470 + p * 10, 8 + p * 14, 0, 6.28); ctx.fill(); } ctx.restore(); }
  grade(ctx); }
function shotMessy(ctx, t) { const lt = t - S.messy, c = { x: 760, y: 380, z: 1.2 + lt * 0.02 }, sh = lt < 0.9 ? Math.sin(lt * 70) * 4 * (1 - lt / 0.9) : 0;
  officeBlur(ctx, c, 9); ctx.save(); camT(ctx, { x: 768 + sh, y: 432, z: 1 }, 1);
  const fl = eo(u(lt, 0.25, 0.45)); spr(ctx, 'whiteFlinch', lerp(1750, 1180, fl), 1020, 1.05, { r: 0.05 * Math.sin(lt * 9) * (1 - u(lt, 1, 0.5)) });
  const pop = back(u(lt, 0, 0.35)); spr(ctx, 'foam', 640 + Math.sin(lt * 40) * 3 * (1 - u(lt, 0.6, 0.4)), 900, 1.15 * pop, { r: Math.sin(lt * 35) * 0.04 * (1 - u(lt, 0.6, 0.4)) });
  // foam spray: drops fly up and fall, a few splat onto the "lens"
  for (let i = 0; i < 26; i++) { const t0 = 0.05 + L.hash(i) * 0.5, k = lt - t0; if (k < 0) continue; const vx = (L.hash(i * 3) - 0.5) * 900, vy = -700 - L.hash(i * 7) * 600;
    const x = 640 + vx * k, y = 300 + vy * k + 1300 * k * k; if (y > 1000) continue; spr(ctx, 'drop', x, y, 0.5 + L.hash(i * 5) * 0.6, { r: k * 6 + i, ay: 0.5 }); }
  ctx.restore();
  for (let i = 0; i < 3; i++) { const k = u(lt, 0.55 + i * 0.12, 0.15); if (k <= 0) continue; ctx.save(); ctx.globalAlpha = 0.85 * (1 - u(lt, 1.6, 0.5)); spr(ctx, 'drop', [1500, 300, 1650][i], [180, 820, 760][i], (2.6 + i) * back(k), { r: i * 2, ay: 0.5 }); ctx.restore(); }
  grade(ctx); }
function shotFountain(ctx, t) { const lt = t - S.fountain, c = camKeys([[0, 560, 470, 1.45], [2.4, 600, 450, 1.3]], lt);
  candlerDesk(ctx, t, lt, c, 'candler1', { after: g => { const s = eo(u(lt, 0.15, 0.5)); spr(g, 'glass', lerp(1100, 760, s), 560, 0.42, { shadow: true });
    for (let i = 0; i < 10; i++) { const ph = (lt * 0.9 + i / 10) % 1; g.fillStyle = `rgba(255,240,215,${0.7 * (1 - ph)})`; g.beginPath(); g.arc(lerp(1100, 760, s) - 18 + L.hash(i) * 36, 520 - ph * 70, 2.5, 0, 6.28); g.fill(); }
    sparkle(g, lerp(1100, 760, s) + 10, 455, 22, Math.max(0, Math.sin(clamp((lt - (at('b2', 'fountain') - S.fountain)) / 0.8) * Math.PI))); } });
  grade(ctx); }
function shotFine(ctx, t) { const lt = t - S.fine, f = at('b2', 'fine') - S.fine, c = camKeys([[0, 520, 430, 1.35], [f, 500, 410, 1.5], [f + 0.25, 490, 400, 1.62]], lt);
  const mix = clamp((lt - (f - 0.12)) / 0.18);
  candlerDesk(ctx, t, lt, c, 'candler2', { prev: 'candler1', mix, lift: Math.sin(clamp((lt - f + 0.1) / 0.5) * Math.PI) * 14 });
  const s = Math.max(0, 1 - (lt - f) / 0.35); if (lt > f) { ctx.save(); ctx.translate(Math.sin(lt * 80) * 6 * s, 0); ctx.restore(); }
  grade(ctx); }
// desk-top close shots: contract slides in, the quill signs, a map glows, the dollar flutters down
const PEN = (k) => [690 + k * 200, 742 + Math.sin(k * 26) * 5 - k * 4];
function shotContract(ctx, t) { const lt = t - S.contract, dEnd = S.drawer - S.contract, c = camKeys([[0, 600, 520, 1.3], [dEnd, 660, 560, 1.55]], lt);
  candlerDesk(ctx, t, lt, c, 'candler3', { after: g => {
    const cs = eo(u(lt, 0.1, 0.7)); spr(g, 'contract', lerp(1400, 790, cs), 770, 0.7, { r: lerp(0.3, -0.04, cs), sq: 2.1, shadow: true });
    // map glow on "United States"
    const mg = Math.max(0, Math.sin(clamp((lt - (at('b3', 'united') - S.contract)) / 1.2) * Math.PI)); glowAt(g, 790, 700, 110, 'rgba(255,215,120,0.9)', mg * 0.6);
    // the quill writes a signature line (ink appears behind the nib)
    const w0 = at('b3', 'rights') - S.contract, wk = clamp((lt - w0) / 2.4);
    if (wk > 0) { g.save(); g.strokeStyle = 'rgba(40,24,14,0.9)'; g.lineWidth = 3.2; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 60 * wk; i++) { const [x, y] = PEN(i / 60); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore();
      const [px, py] = PEN(wk); spr(g, 'quill', px, py - Math.abs(Math.sin(lt * 22)) * 4 * (wk < 1 ? 1 : 0), 0.24, { ax: 0.02, ay: 0.98, r: -0.25 + Math.sin(lt * 22) * 0.06 * (wk < 1 ? 1 : 0) }); }
    // the dollar: flutters down and lands on the contract on "dollar"
    const dl = at('b3', 'dollar') - S.contract, k = clamp((lt - (dl - 1.1)) / 1.1);
    if (k > 0) { const x = 800 + Math.sin(k * 9) * 90 * (1 - k), y = lerp(-120, 705, k), r = Math.sin(k * 7) * 0.5 * (1 - k) - 0.1;
      spr(g, 'dollar', x, y, 0.42 * (1 + 0.25 * Math.sin(clamp((lt - dl) / 0.3) * Math.PI)), { r, ay: 0.5, sq: lerp(1, 1.9, k) }); }
    const land = u(lt, dl, 0.5); if (land > 0 && land < 1) { for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; g.globalAlpha = 0.6 * (1 - land); g.fillStyle = '#F4E8D0'; g.beginPath(); g.arc(800 + Math.cos(a) * 160 * land, 710 + Math.sin(a) * 30 * land, 10 + land * 16, 0, 6.28); g.fill(); } g.globalAlpha = 1; }
  } });
  // Thomas pops up from the bottom-right corner to celebrate the $1
  const dl = at('b3', 'dollar') - S.contract, j = u(lt, dl + 0.1, 0.5); if (j > 0) { ctx.save(); camT(ctx, { x: 768, y: 432, z: 1 }, 1); spr(ctx, 'thomasJump', 1330, lerp(1350, 1010, back(j)) + Math.sin(lt * 9) * 8, 0.95, { r: 0.08 }); ctx.restore(); }
  // impact shake on landing
  grade(ctx); }
function shotDrawer(ctx, t) { const lt = t - S.drawer, c = camKeys([[0, 768, 432, 1.06], [S.empire - S.drawer, 760, 420, 1.28]], lt);
  ctx.save(); camT(ctx, c, 1); bg(ctx, 'drawer');
  const fl = 0.8 + 0.2 * Math.sin(lt * 13) * Math.sin(lt * 3.1); beams(ctx, lt, 460, -100, -0.32, 2, 0.12 * fl);
  // the dollar lies in the drawer; dust settles on it as years pass (time-lapse)
  const yrs = clamp((lt - 0.4) / 2.2); spr(ctx, 'dollar', 760, 470, 0.46, { r: -0.12, ay: 0.5 });
  ctx.save(); ctx.globalAlpha = 0.55 * yrs; ctx.fillStyle = '#8A7A66'; for (let i = 0; i < 260; i++) { const x = 620 + L.hash(i * 1.1) * 290, y = 410 + L.hash(i * 2.3) * 120; ctx.fillRect(x, y, 2 + L.hash(i) * 3, 2 + L.hash(i * 4) * 3); } ctx.restore();
  // pocket watch hands race (years go by)
  ctx.save(); ctx.translate(1140, 318); for (const [sp, l, w] of [[2.2, 42, 5], [26, 58, 3]]) { ctx.save(); ctx.rotate(lt * sp * (0.4 + yrs)); ctx.strokeStyle = '#2A1E14'; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -l); ctx.stroke(); ctx.restore(); } ctx.restore();
  // a spider lowers itself on a thread right above the bill on "never"
  const sp = eo(u(lt, at('b3', 'never') - S.drawer - 0.3, 0.9)); if (sp > 0) { const sy = lerp(140, 395, sp) + Math.sin(lt * 4) * 6;
    ctx.strokeStyle = 'rgba(230,230,230,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(800, 60); ctx.lineTo(800, sy); ctx.stroke();
    ctx.save(); ctx.translate(800, sy); ctx.fillStyle = '#1A1412'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 16, 0, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.arc(0, -16, 8, 0, 6.28); ctx.fill();
    ctx.strokeStyle = '#1A1412'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) for (const sx of [-1, 1]) { const a = -0.6 + i * 0.4 + Math.sin(lt * 8 + i) * 0.1; ctx.beginPath(); ctx.moveTo(0, -4 + i * 4); ctx.quadraticCurveTo(sx * 22, -14 + i * 8, sx * 30, 4 + i * 8 + a * 6); ctx.stroke(); }
    ctx.fillStyle = '#FFF'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 3.5, -18, 2.6, 0, 6.28); ctx.fill(); } ctx.restore(); }
  dust(ctx, lt, 380, 60, 520, 600, 50, '255,230,190'); ctx.restore();
  grade(ctx, 0.04, 0.5); }
const CHIMNEYS = [[460, 192, 1.6], [86, 150, 0.6], [212, 196, 0.8], [282, 98, 0.45], [650, 186, 0.7], [700, 100, 0.4], [790, 98, 0.4], [962, 112, 0.45], [1068, 128, 0.45], [1240, 124, 0.45], [1392, 112, 0.45], [1490, 140, 0.5], [598, 150, 0.6]];
function shotEmpire(ctx, t) { const lt = t - S.empire, c = camKeys([[0, 470, 330, 2.1], [1.8, 760, 430, 1.0]], lt);
  ctx.save(); camT(ctx, c, 1); bg(ctx, 'empire'); ctx.save(); ctx.filter = 'blur(5px)'; ctx.globalAlpha = 0.75; for (const [x, y, s] of CHIMNEYS) smoke(ctx, lt + x * 0.01, x, y, s, 5); ctx.restore();
  glowAt(ctx, 1172, 72, 240 + Math.sin(lt * 2) * 20, 'rgba(255,220,140,0.9)', 0.5);
  // wagons roll (a gentle push of the road layer is enough at this distance): a dust trail behind the front wagon
  for (let i = 0; i < 6; i++) { const ph = (lt * 0.8 + i / 6) % 1; ctx.globalAlpha = 0.35 * (1 - ph); ctx.fillStyle = '#E8D2AE'; ctx.beginPath(); ctx.arc(330 - ph * 80, 820 - ph * 20, 14 + ph * 26, 0, 6.28); ctx.fill(); }
  ctx.globalAlpha = 1; ctx.restore();
  // flash-in from the drawer
  const fl = 1 - u(lt, 0, 0.45); if (fl > 0) { ctx.save(); ctx.fillStyle = `rgba(255,244,220,${fl})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  grade(ctx, 0.05, 0.3); }
// ---------- edit: shots + transitions ----------
const SHOTS = [['wide', shotWide], ['lawyers', shotLawyers], ['candler', shotCandler], ['messy', shotMessy], ['fountain', shotFountain], ['fine', shotFine], ['contract', shotContract], ['dollar', null], ['drawer', shotDrawer], ['empire', shotEmpire]]
  .filter(s => s[1]).map(([k, f]) => ({ k, t0: S[k], f }));
SHOTS.forEach((s, i) => s.t1 = i < SHOTS.length - 1 ? SHOTS[i + 1].t0 : T + 1);
const WHIP = new Set(['lawyers', 'messy', 'contract']); // these shots enter with a whip pan
let tmp = null;
function frame(ctx, t) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#1A120C'; ctx.fillRect(0, 0, W, H);
  const i = SHOTS.findIndex(s => t >= s.t0 && t < s.t1), s = SHOTS[i < 0 ? SHOTS.length - 1 : i]; s.f(ctx, t);
  // whip transition: the first 0.22 s of a whip shot is smeared from the side
  if (WHIP.has(s.k) && t - s.t0 < 0.22) { if (!tmp) tmp = createCanvas(W, H); const tc = tmp.getContext('2d'); tc.setTransform(1, 0, 0, 1, 0, 0); tc.drawImage(ctx.canvas, 0, 0); const k = 1 - (t - s.t0) / 0.22;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); for (let j = 0; j < 8; j++) { ctx.globalAlpha = 1 / (j + 1); ctx.drawImage(tmp, (j - 4) * 60 * k + 280 * k, 0); } ctx.restore(); }
  // the drawer shot pushes in from black (time jump)
  if (s.k === 'drawer') { const f = 1 - u(t - s.t0, 0, 0.35); if (f > 0) { ctx.save(); ctx.fillStyle = `rgba(10,6,4,${f})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
  // landing shake for the dollar
  const dl = at('b3', 'dollar'); if (t > dl && t < dl + 0.4) { const k = 1 - (t - dl) / 0.4; if (!tmp) tmp = createCanvas(W, H); const tc = tmp.getContext('2d'); tc.drawImage(ctx.canvas, 0, 0); ctx.drawImage(tmp, Math.sin(t * 90) * 10 * k, Math.cos(t * 70) * 8 * k); }
}
async function load() { for (const [k, f] of Object.entries(SPR)) A[k] = await loadImage(`${HI}/${f}.png`); for (const [k, f] of Object.entries(BG)) A[k] = await loadImage(`${HI}/${f}.png`);
  A.widePlate = await loadImage(`${HI}/01_office_wide_plate.png`); }
module.exports = { T, S, at };
if (require.main === module) (async () => {
  const [mode, a1, a2] = process.argv.slice(2); if (mode === 'T') return console.log(T);
  await load(); const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'still') { const ts = a1.split(',').map(Number), tw = 640, th = 360, cols = 3, rows = Math.ceil(ts.length / cols), sh = createCanvas(tw * cols, th * rows), sc = sh.getContext('2d');
    ts.forEach((t, i) => { frame(ctx, t); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); sc.fillStyle = '#E8322E'; sc.font = '24px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * tw + 8, Math.floor(i / cols) * th + 28); });
    fs.writeFileSync(a2, sh.toBuffer('image/png')); return; }
  if (mode === 'frame') { frame(ctx, +a1); fs.writeFileSync(a2, cv.toBuffer('image/png')); return; }
  if (mode === 'video') { const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    const N = Math.round(T * FPS); for (let f = 0; f < N; f++) { frame(ctx, f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) process.stderr.write(`${f}/${N}\n`); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); }
})();
