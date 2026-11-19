// MONTAGE TEST (15 s, picture only, no voice / no music): shows that the figmakit engine can reproduce the *editing language* of the
// Nvidia reference videos (Why_Nvidia_Would_Fail_Without_Jensen_Huang / Why_Hitler_Gave_STALIN_His_Only_NVIDIA_GPU):
//   slow push-in + yellow date tag pop -> WHIP transition -> character acting (neutral -> skeptical -> point) -> hard cut + punch-in
//   + shake + FLASH on the surprised face ("!" emotion marks) -> IRIS (circle) transition into a close-up -> object flutters down, lands,
//   dust puff + glint + "$1" tag -> long PULL-BACK reveal of the whole town -> word-by-word POP title with underline -> SPEED-LINES burst
//   -> black card with typewriter text.
// All art = existing approved figmakit assets (no new generations). Usage: node montage_test.js still t1,t2,.. out.png | frame t out.png | video out.mp4
const path = require('path');
require('../../lib/fonts');                                   // registers NunitoL (700/800/900)
const S = require('../figmakit/lib/scene'), { Puppet } = require('../figmakit/lib/puppet');
const { W, H, clamp, lerp, ss, hash } = S;
const u = (t, t0, d) => clamp((t - t0) / d);
const backOut = x => { x = clamp(x); return 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2); };
const outCubic = x => 1 - Math.pow(1 - clamp(x), 3);
const FONT = '900 {S}px NunitoL, sans-serif';

// ---------- timeline ----------
const T = 15.0;
const T1 = 0, T2 = 3.2, T3 = 5.4, T4 = 7.0, T5 = 9.3, T6 = 11.7, T7 = 13.3;

// ---------- type helpers ----------
function yellowTag(ctx, text, x, y, k, rot = -0.05, size = 54) {            // like the "APR 1993" / "33 YEARS" labels of the reference
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const s = backOut(k); ctx.scale(s, s); ctx.globalAlpha = clamp(k * 5);
  ctx.font = FONT.replace('{S}', size); const w = ctx.measureText(text).width + size * 0.9, h = size * 1.35;
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.roundRect(-w / 2 + 6, -h / 2 + 8, w, h, 8); ctx.fill();
  ctx.fillStyle = '#F7D117'; ctx.strokeStyle = '#1A1208'; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1A1208'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, size * 0.04); ctx.restore(); }
function popWord(ctx, text, x, y, size, k, rot = -0.03, fill = '#FFF3D6') {         // title words that pop in one by one
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const s = backOut(k); ctx.scale(s, s); ctx.globalAlpha = clamp(k * 6);
  ctx.font = FONT.replace('{S}', size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#120C06'; ctx.lineWidth = size * 0.2; ctx.strokeText(text, 0, 0); ctx.fillStyle = fill; ctx.fillText(text, 0, 0); ctx.restore(); }
function underline(ctx, x0, x1, y, k) {                                                // gold marker swoosh that draws itself
  if (k <= 0) return; ctx.save(); ctx.strokeStyle = '#F7B500'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath();
  const n = 24; for (let i = 0; i <= n * k; i++) { const p = i / n; const px = lerp(x0, x1, p), py = y + Math.sin(p * 6) * 4 - p * 14; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.restore(); }
function speedLines(ctx, t, a, inner = 0.2) {                                         // manga burst, re-seeded 18x per second
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const cx = W / 2, cy = H / 2, seed = Math.floor(t * 18), r0 = inner * H, r1 = W;
  for (let i = 0; i < 90; i++) { const ang = hash(i * 1.7 + seed * 3.1) * 6.2832, wd = 0.012 + hash(i * 5.3 + seed) * 0.03, rr = r0 + hash(i * 9.1 + seed) * 0.35 * H;
    ctx.fillStyle = `rgba(255,255,255,${a * (0.55 + 0.45 * hash(i * 2.2 + seed))})`; ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang - wd) * r1, cy + Math.sin(ang - wd) * r1); ctx.lineTo(cx + Math.cos(ang + wd) * r1, cy + Math.sin(ang + wd) * r1);
    ctx.lineTo(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr); ctx.closePath(); ctx.fill(); } ctx.restore(); }
function surpriseMarks(ctx, x, y, k) {                                                  // "!" and little emotion strokes around the head
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); const s = backOut(k); ctx.scale(s, s);
  ctx.font = FONT.replace('{S}', 220); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.rotate(0.12);
  ctx.strokeStyle = '#120C06'; ctx.lineWidth = 34; ctx.strokeText('!', 0, 0); ctx.fillStyle = '#E8322E'; ctx.fillText('!', 0, 0); ctx.restore();
  ctx.save(); ctx.strokeStyle = '#FFF3D6'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.globalAlpha = clamp(k * 3) * (1 - u(k, 0.7, 0.3));
  for (const [a, r0, r1] of [[-2.6, 330, 410], [-2.2, 340, 430], [-0.5, 340, 430], [-0.1, 330, 410]]) { ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r0, y + 150 + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + 150 + Math.sin(a) * r1); ctx.stroke(); }
  ctx.restore(); }

// ---------- assets / acting ----------
let P = {}, CANDLER, act2, act3;
const DESK = [[0, 585], [330, 537], [720, 513], [1050, 513], [1385, 553], [1414, 590], [1400, 864], [0, 864]];
act2 = Puppet.acting({ expr: [[0, 'neutral'], [0.85, 'skeptical'], [1.7, 'talk']], blinks: [0.5], tilt: [[0.8, -0.07], [1.7, 0.04]], nods: [0.85],
  gestures: { R: [[1.35, 99, 'point', { wag: 1 }]] } });
act3 = Puppet.acting({ expr: [[0, 'surprised']], blinks: [], tilt: [[0, 0.05], [0.4, -0.04], [1.4, 0.03]], shrugs: [[0.15, 1]], gestures: { L: [[0.2, 99, 'palm']], R: [[0.2, 99, 'palm']] } });

// ---------- shots (each: draw by local time lt) ----------
function candlerShot(ctx, c, lt, t, act, x = 468) {
  S.world(ctx, c, 1, g => { S.plate(g, P.desk); S.beams(g, t, 1060, -40, 0.42, 3, 0.1); S.dust(g, t, 900, 0, 600, 600, 30);
    CANDLER.draw(g, x, 330, 0.5, act, t); S.reveal(g, P.desk, DESK); }); }
function s1(ctx, t, lt) {                                      // wide establishing, slow push-in + date tag
  const c = S.camKeys([[0, 768, 432, 1.0], [T2 - T1, 560, 330, 1.5]], lt);
  S.world(ctx, c, 1, g => { S.plate(g, P.wide); S.beams(g, t, 1040, -40, 0.45, 4, 0.13); S.dust(g, t, 700, 0, 800, 800, 55); });
  yellowTag(ctx, '1899', 300, 190, u(lt, 0.5, 0.35) * (1 - u(lt, 2.7, 0.2))); S.grade(ctx); }
function s2(ctx, t, lt) {                                      // character, push-in, acting
  const c = S.camKeys([[0, 560, 450, 1.35], [T3 - T2, 500, 395, 1.85]], lt);
  candlerShot(ctx, c, lt, t, act2(lt)); S.grade(ctx, 0.06, 0.4); }
function s3(ctx, t, lt) {                                      // hard cut + punch-in on the surprised face
  const c = S.camKeys([[0, 520, 380, 1.7], [0.16, 470, 300, 2.85], [T4 - T3, 470, 296, 3.05]], lt);
  candlerShot(ctx, c, lt, t, act3(lt)); surpriseMarks(ctx, 1480, 250, u(lt, 0.3, 0.3)); S.grade(ctx, 0.06, 0.5); }
function s4(ctx, t, lt) {                                      // iris into the drawer, dollar flutters down and lands
  const k = outCubic(u(lt, 0, 0.7)), r = k * Math.hypot(W, H) * 0.56;
  if (k < 1) { s3(ctx, T3 + 1.5 + lt * 0.3, 1.5 + lt * 0.3); ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  ctx.save(); if (k < 1) { ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, 6.2832); ctx.clip(); }
  const c = S.camKeys([[0, 800, 470, 1.05], [T5 - T4, 700, 500, 1.4]], lt);
  S.world(ctx, c, 1, g => { S.plate(g, P.drawer); S.beams(g, t, 520, -40, 0.35, 2, 0.1); S.dust(g, t, 200, 100, 900, 600, 50);
    S.sparkle(g, 1140, 326, 34, Math.max(0, Math.sin(clamp((lt - 0.9) / 0.9) * Math.PI)));
    const fall = u(lt, 0.45, 1.05), x = lerp(1250, 760, ss(fall)) + Math.sin(fall * 9) * 90 * (1 - fall), y = lerp(-80, 600, fall * fall * 0.6 + fall * 0.4) + Math.cos(fall * 7) * 18;
    const landed = fall >= 1; S.sprite(g, P.dollar, x, y, 0.55, { pre: P.dollar.pre, r: landed ? -0.06 : Math.sin(fall * 9) * 0.5, sq: landed ? 2.0 : 1 + fall * 0.9, shadow: landed, ay: 0.5 });
    S.puff(g, 760, 610, u(lt, 1.5, 0.6), 150, '#CDBFA6'); });
  ctx.restore();
  if (k < 1) { ctx.save(); ctx.strokeStyle = '#FFF3D6'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, 6.2832); ctx.stroke(); ctx.restore(); }
  yellowTag(ctx, '$1', 1380, 250, u(lt, 1.65, 0.35) * (1 - u(lt, 2.1, 0.2)), 0.06, 90); S.grade(ctx, 0.04, 0.5); }
function s5(ctx, t, lt) {                                      // long PULL-BACK reveal of the town
  const c = S.camKeys([[0, 520, 250, 2.5, -0.03], [T6 - T5 - 0.2, 768, 432, 1.0, 0]], lt), d = T6 - T5;
  S.world(ctx, c, 1, g => { S.plate(g, P.town); S.smoke(g, t, 478, 196, 1.2, 6, 4); S.sparkle(g, 1330, 470, 26, Math.max(0, Math.sin(clamp((lt - 1.3) / 0.8) * Math.PI))); });
  S.world(ctx, c, 1.12, g => { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(0, 300, 0, 864); gr.addColorStop(0, 'rgba(255,170,80,0)'); gr.addColorStop(1, 'rgba(255,170,80,0.16)'); g.fillStyle = gr; g.fillRect(-200, 300, 1900, 600); g.restore(); });
  S.grade(ctx, 0.08, 0.4); }
function s6(ctx, t, lt) {                                      // title: words pop one by one, underline, speed-lines burst
  const c = S.camKeys([[0, 768, 432, 1.0], [T7 - T6, 700, 400, 1.12]], lt);
  S.world(ctx, c, 1, g => { g.filter = 'blur(5px)'; S.plate(g, P.town); g.filter = 'none'; });
  ctx.save(); ctx.fillStyle = 'rgba(10,6,2,0.55)'; ctx.fillRect(0, 0, W, H); ctx.restore();
  popWord(ctx, 'THE ONE-DOLLAR', 960, 420, 150, u(lt, 0.15, 0.3), -0.03);
  popWord(ctx, 'DEAL', 960, 610, 230, u(lt, 0.55, 0.3), 0.02, '#F7D117'); underline(ctx, 560, 1360, 735, u(lt, 0.95, 0.45));
  const b = u(lt, 1.35, 0.25); if (b > 0) { speedLines(ctx, t, b * 0.95, 0.12 + (1 - b) * 0.5); }
  S.grade(ctx, 0.04, 0.45); }
function s7(ctx, t, lt) {                                      // black card + typewriter
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); const s = 'That dollar built the empire.', n = Math.floor(clamp((lt - 0.25) / 1.1) * s.length);
  ctx.save(); ctx.font = '800 76px NunitoL, sans-serif'; ctx.fillStyle = '#FFF'; ctx.textBaseline = 'middle'; const w = ctx.measureText(s).width; ctx.translate(W / 2 - w / 2, H / 2); ctx.transform(1, 0, -0.18, 1, 0, 0);
  ctx.fillText(s.slice(0, n), 0, 0); if (n < s.length && Math.sin(lt * 14) > 0) ctx.fillRect(ctx.measureText(s.slice(0, n)).width + 8, -34, 5, 68); ctx.restore(); }

const shots = [
  { t0: T1, draw: s1 }, { t0: T2, in: 'whip', dir: 1, draw: s2 }, { t0: T3, in: 'flash', shake: t => S.shake(t, T3 + 0.16, 16, 0.45), draw: s3 },
  { t0: T4, draw: s4 }, { t0: T5, in: 'flash', draw: s5 }, { t0: T6, in: 'whip', dir: -1, draw: s6 }, { t0: T7, draw: s7 } ].map(x => ({ ...x, draw: (ctx, t, lt) => x.draw(ctx, t, lt) }));
S.run({ module, T, shots, load: async () => {
  P.wide = await S.loadPlate('office_1899_wide_with_people'); P.desk = await S.loadPlate('office_1899_desk'); P.drawer = await S.loadPlate('desk_drawer_closeup'); P.town = await S.loadPlate('bottling_plants_panorama');
  P.dollar = await S.loadProp('dollar'); const dir = path.join(S.KIT, 'assets/characters/candler'); CANDLER = await Puppet.load(require(path.join(dir, 'character.js')), dir); } });
