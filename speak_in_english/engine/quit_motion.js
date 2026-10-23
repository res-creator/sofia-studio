// MOTION TEST (not a release renderer): quit.js scene B2 with directed camera, parallax, depth of field and motion blur.
// Same script, voices, poses, cards and subtitles as quit.js; only the staging changes. quit.js itself is untouched.
// node quit_motion.js <start_frame> <end_frame> out.mp4   (frames 1315..1807 = scene B2)
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/quit/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const HER = { ...BASE.her_london, top: { type: 'blazer', col: '#7A5BC6', shirt: '#FFFFFF', tie: '#FFFFFF' } };
const BOSS = { ...BASE.greg, top: { type: 'blazer', col: '#2B2F3A', shirt: '#F7F9FC', tie: '#E0474C' }, bottom: { type: 'trousers', col: '#2B2F3A' } };
const G = { her: geom(HER), boss: geom(BOSS) };
const FY = 60, HERX = -360, BX = 330, DESK = { x0: 20, x1: 700, top: -620 }, PLX = -660, SHX = 600;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- boss's office (prerendered)
const BX0 = -1600, BY0 = -3000, BW = 3300, BH = 3700, BS = 0.5;
function drawOffice(c) { c.fillStyle = '#DCE6EE'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = '#C3D0DC'; c.fillRect(BX0, -650, BW, 710);
  c.fillStyle = '#FFFFFF'; c.fillRect(-1300, -2400, 900, 1100); c.fillStyle = '#9FC8E8'; c.fillRect(-1270, -2370, 840, 1040); c.fillStyle = '#7A9AB8'; for (let i = 0; i < 6; i++) c.fillRect(-1250 + i * 140, -1700 + hash(i) * -400, 110, 1000); c.fillStyle = '#FFFFFF'; c.fillRect(-860, -2370, 20, 1040);
  c.fillStyle = '#C9A06A'; c.fillRect(500, -2200, 520, 380); c.fillStyle = '#FFFDF8'; c.fillRect(520, -2180, 480, 340); txt(c, 'EMPLOYEE', 760, -2110, 40, '#2B2F3A'); txt(c, 'OF THE MONTH', 760, -2060, 34, '#2B2F3A'); txt(c, 'MR HUGHES', 760, -1960, 52, '#E0474C'); c.fillStyle = '#C9A06A'; c.fillRect(1080, -2200, 300, 380); c.fillStyle = '#FFFDF8'; c.fillRect(1100, -2180, 260, 340); txt(c, 'ALSO', 1230, -2060, 40, '#2B2F3A'); txt(c, 'HUGHES', 1230, -1990, 40, '#E0474C');
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#6A5A4A'); fg.addColorStop(1, '#4A3E32'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY); }
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawOffice(c); }
const BGBB = createCanvas(BGB.width, BGB.height); { const c = BGBB.getContext('2d'); c.filter = 'blur(7px)'; c.drawImage(BGB, 0, 0); }   // depth-of-field version of the wall
const FGP = createCanvas(700, 1000); { const c = FGP.getContext('2d'); c.filter = 'blur(9px)'; c.translate(350, 1000);           // out-of-focus foreground plant (front layer)
  for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + (hash(i + 7) - 0.5) * 2.2, r = 220 + hash(i + 3) * 520; c.save(); c.translate(Math.cos(a) * r * 0.55, Math.sin(a) * r); c.rotate(a + Math.PI / 2); c.fillStyle = i % 2 ? '#3F8F55' : '#2F6E42'; c.beginPath(); c.ellipse(0, 0, 46, 150, 0, 0, TAU); c.fill(); c.restore(); } }

// ---------------- props
function envelope(c, x, y, s, label, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); paint(c, q => { q.m(-110, -70); q.l(110, -70); q.l(110, 70); q.l(-110, 70); q.z(); }, '#FFFDF8', { sd: 3, hd: 2, lw: 3 }); c.strokeStyle = '#C9CED6'; c.lineWidth = 3; c.beginPath(); c.moveTo(-110, -70); c.lineTo(0, 10); c.lineTo(110, -70); c.stroke(); txt(c, label, 0, 40, 20, '#2B2F3A'); c.restore(); }
function shredder(c, t, L) { paint(c, q => { q.m(SHX - 90, DESK.top); q.l(SHX + 90, DESK.top); q.l(SHX + 80, DESK.top - 130); q.l(SHX - 80, DESK.top - 130); q.z(); }, '#3A3F4A', { sd: 3, hd: 2, lw: 3 }); c.fillStyle = '#1E1E24'; c.fillRect(SHX - 60, DESK.top - 134, 120, 10); c.fillStyle = '#7CF29A'; c.beginPath(); c.arc(SHX + 60, DESK.top - 100, 7, 0, TAU); c.fill();
  if (L === 'hook' && t > 1.0 && t < 2.6) { const k = P(t, 1.0, 1.8); envelope(c, SHX, DESK.top - 150 + k * 80, 0.6, 'RESIGNATION', 0); c.fillStyle = '#FFFDF8'; for (let i = 0; i < 8; i++) c.fillRect(SHX - 50 + i * 13, DESK.top + 4, 6, 30 + k * 160 * (0.6 + hash(i) * 0.4)); } }
function plant(c, x, t, L) { if (!(['C1', 'C2', 'outro'].includes(L)) || (L === 'C1' && t < ev('plant') - 0.1)) return; const k = L === 'C1' ? eBack(P(t, ev('plant') - 0.1, ev('plant') + 0.25), 1.6) : 1; c.save(); c.translate(x, FY); c.scale(k, k);
  paint(c, q => { q.m(-110, 0); q.l(110, 0); q.l(130, -220); q.l(-130, -220); q.z(); }, '#C96A3A', { sd: 4, hd: 2, lw: 3 }); c.fillStyle = '#5A3A2A'; c.fillRect(-12, -700, 24, 480);
  for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 60 + (i % 4) * 50; paint(c, q => q.e(Math.cos(a) * r, -760 + Math.sin(a) * r * 0.8, 70, 34), i % 2 ? '#4CAF6A' : '#3C8A4A', { sd: 2, hd: 1, lw: 2 }); }
  paint(c, q => { q.m(-16, -620); q.l(16, -620); q.l(26, -420); q.l(0, -390); q.l(-26, -420); q.z(); }, '#E0474C', { sd: 2, hd: 1, lw: 3 }); paint(c, q => { q.m(-24, -650); q.l(24, -650); q.l(14, -615); q.l(-14, -615); q.z(); }, '#B8302E', { sd: 1, hd: 1, lw: 3 });
  if (L !== 'C1' && (L === 'outro' || t > ev('point'))) { c.fillStyle = '#2B2F3A'; rr(c, -150, -330, 300, 80, 10); c.fill(); txt(c, 'MANAGER', 0, -290, 44, '#F2C14E'); } c.restore(); }
const mugItem = ctx => { ctx.rotate(0); paint(ctx, q => { q.m(-40, -90); q.l(40, -90); q.l(34, 0); q.l(-34, 0); q.z(); }, '#FFFDF8', { sd: 3, hd: 2, lw: 3 }); ctx.strokeStyle = '#2B2F3A'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(46, -48, 16, -1.3, 1.3); ctx.stroke(); ctx.fillStyle = '#E0474C'; ctx.font = '13px Unb9'; ctx.textAlign = 'center'; ctx.fillText('BEST', 0, -54); ctx.fillText('BOSS', 0, -36); };
function badge(c, hd, k) { if (k <= 0) return; c.save(); c.translate(hd.x + 70, hd.y + 330); c.scale(k, k); c.fillStyle = '#F2C14E'; rr(c, -70, -26, 140, 52, 8); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 3; rr(c, -70, -26, 140, 52, 8); c.stroke(); txt(c, 'SENIOR JUNIOR', 0, -8, 13, '#2B2F3A'); txt(c, 'MANAGER', 0, 12, 16, '#E0474C'); c.restore(); }
function cardBox(c, k, w, h, fn, rot = -0.03, pos = [540, 1140, 1]) { if (k <= 0) return; c.save(); c.translate(pos[0], pos[1]); c.scale(pos[2], pos[2]); c.rotate(rot); c.scale(k * 0.92, k * 0.92); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 10, -h / 2 + 14, w, h, 30); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -w / 2, -h / 2, w, h, 30); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; rr(c, -w / 2, -h / 2, w, h, 30); c.stroke(); fn(); c.restore(); }
function cards(c, t, L) { const win = (a, b) => eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, b, b + 0.25));
  if (L === 'A2') cardBox(c, win(ev('denied') - 0.4, SP.a2_nar.t + 2.5), 560, 460, () => { c.fillStyle = '#2B2F3A'; txt(c, 'Dear Mr Hughes,', -200, -160, 30, '#2B2F3A', 'Nun9', 'left'); txt(c, 'I want to quit from my job.', -200, -110, 30, '#2B2F3A', 'Nun9', 'left'); c.fillStyle = '#C9D6E8'; for (let i = 0; i < 4; i++) c.fillRect(-200, -60 + i * 40, 380 - i * 60, 8); const s = eOut(P(t, ev('denied'), ev('denied') + 0.15)); if (s > 0) { c.save(); c.translate(20, 110); c.rotate(-0.2); c.scale(2.2 - 1.2 * s, 2.2 - 1.2 * s); c.globalAlpha = s; c.strokeStyle = '#E0474C'; c.lineWidth = 10; rr(c, -190, -60, 380, 120, 16); c.stroke(); txt(c, 'DENIED', 0, 4, 90, '#E0474C'); c.restore(); } }, 0.03);
  if (L === 'B1') cardBox(c, win(ev('badge'), SP.b1_nar.t + 2.0), 560, 300, () => { c.fillStyle = '#F2C14E'; rr(c, -230, -90, 460, 180, 18); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; rr(c, -230, -90, 460, 180, 18); c.stroke(); txt(c, 'SENIOR JUNIOR', 0, -30, 46, '#2B2F3A'); txt(c, 'MANAGER', 0, 40, 60, '#E0474C'); });
  const dk = eIO(P(t, ev('b2_nar') - 0.15, ev('b2_nar') + 0.45));
  if (L === 'B2') cardBox(c, win(ev('cal'), SP.b2_nar.t + 2.5), 720, 340, () => { txt(c, 'THIS WEEK', 0, -120, 40, '#2B2F3A'); const D = ['MON', 'TUE', 'WED', 'THU', 'SAT', 'SUN']; D.forEach((d, i) => { const x = -275 + i * 110; c.fillStyle = d === 'SAT' || d === 'SUN' ? '#F4B8C8' : '#E6EEF4'; c.fillRect(x - 48, -70, 96, 160); txt(c, d, x, -40, 26, '#2B2F3A'); txt(c, String(i < 4 ? 10 + i : 11 + i), x, 30, 44, '#2B2F3A'); }); c.save(); c.translate(-55, 10); c.strokeStyle = '#E0474C'; c.lineWidth = 8; c.beginPath(); c.moveTo(-20, -90); c.lineTo(20, 110); c.stroke(); c.restore(); txt(c, 'FRI: cancelled', 0, 135, 30, '#E0474C', 'Nun9'); }, -0.03, [lerp(540, 820, dk), lerp(1140, 1250, dk), lerp(1, 0.55, dk)]);
}

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
function hasMug(t, L) { return (L === 'A1' && t > ev('mug')) || ['A2', 'B1'].includes(L); }
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 330), armR: reach(g, 1, g.sw * 0.6, g.ySh + 330) };
  gest(st, g, 'her', t, 1, 200);
  if (hasMug(t, L)) { st.armL = reach(g, -1, -g.sw * 1.0, g.ySh + 240); st.items = { L: mugItem }; }
  if (L === 'hook') { st.mood = t < 1.0 ? 'smug' : 'shock'; if (t < 1.0) st.armR = reach(g, 1, g.sw * 2.6, g.ySh + 280); }
  if (L === 'A1') st.mood = t > ev('mug') ? 'annoyed' : 'happy';
  if (L === 'A2') st.mood = t > ev('denied') ? 'shock' : 'neutral';
  if (L === 'B1') st.mood = t > ev('badge') ? 'skeptical' : 'neutral';
  if (L === 'B2') { st.mood = t > ev('cal') ? 'tired' : 'neutral'; const u = t - ev('cal'); if (u > 0 && u < 0.6) st.tilt = -0.09 * Math.sin(u * 16) * Math.exp(-u * 6); }
  if (L === 'C1') { st.mood = t > ev('plant') ? 'shock' : 'neutral'; if (t > ev('plant')) { st.turn = -0.4; st.look = -1; } }
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; if (t > ev('letter')) st.mood = 'surprised'; if (t > ev('point')) { st.mood = 'shock'; st.turn = -0.4; st.look = -1; } }
  return st; }
function bossState(t, L) { const g = G.boss, st = { t, talk: talk('hughes', t), mood: 'happy', turn: -0.35, look: -0.8, armL: reach(g, -1, -g.sw * 0.7, g.ySh + 330), armR: reach(g, 1, g.sw * 0.7, g.ySh + 330) };
  gest(st, g, 'hughes', t, -1, 200);
  if (L === 'hook') { st.mood = 'smug'; st.look = 0.2; st.lookY = 0.3; if (t > 0.8 && t < 1.8) st.armR = reach(g, 1, g.sw * 1.6, DESK.top - 140 - FY); }
  if (L === 'A1' && t > ev('mug') - 0.4 && t < ev('mug') + 0.2) st.armL = reach(g, -1, -g.sw * 2.4, g.ySh + 240);
  if (L === 'A2' && t > ev('denied') - 0.4 && t < ev('denied') + 0.4) { st.armL = reach(g, -1, -g.sw * 1.6, DESK.top - 30 - FY - (t < ev('denied') ? 120 : 0), { fist: true }); st.mood = 'smug'; }
  if (L === 'B1' && t > ev('badge') - 0.4 && t < ev('badge') + 0.3) st.armL = reach(g, -1, -g.sw * 2.4, g.ySh + 280);
  if (L === 'B2' && t > ev('cal') - 0.3) st.mood = 'smug';
  if (L === 'C1' && t > ev('plant') - 0.4) st.mood = 'smug';
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'worried' : 'sad'; if (t > SP.c2_x.t) st.mood = 'happy'; if (t > ev('letter') - 0.2) { st.armL = reach(g, -1, -g.sw * 1.7, g.ySh + 120); st.items = { L: ctx => envelope(ctx, 0, -60, 0.5, 'HUGHES', -0.1) }; } if (t > ev('point')) { st.armR = reach(g, 1, g.sw * 0.4, g.ySh + 330); st.armL = reach(g, -1, -g.sw * 2.6, g.ySh + 160); st.items = {}; } }
  return st; }
function world(c, t, L) {
  c.fillStyle = '#A9B7C4'; c.fillRect(BX0, FY - 40, BW, 44);   // skirting line on the character layer hides the wall/floor parallax seam
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#6A5A4A'); fg.addColorStop(1, '#4A3E32'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, 900);
  const heads = {};
  heads.hughes = put(c, BOSS, bossState(t, L), BX, FY);
  paint(c, q => { q.m(DESK.x0, DESK.top); q.l(DESK.x1, DESK.top); q.l(DESK.x1, FY); q.l(DESK.x0, FY); q.z(); }, '#7A4E30', { sd: 8, hd: 4, lw: 3, inner: k => { k.fillStyle = 'rgba(255,255,255,.08)'; k.fillRect(DESK.x0 + 40, DESK.top + 60, DESK.x1 - DESK.x0 - 80, 260); } });
  paint(c, q => { q.m(DESK.x0 - 20, DESK.top - 26); q.l(DESK.x1 + 20, DESK.top - 26); q.l(DESK.x1 + 20, DESK.top); q.l(DESK.x0 - 20, DESK.top); q.z(); }, '#5A3820', { sd: 3, hd: 2, lw: 3 });
  c.fillStyle = '#2B2F3A'; rr(c, 120, DESK.top - 60, 200, 34, 6); c.fill(); txt(c, 'THE BOSS', 220, DESK.top - 43, 20, '#F2C14E');
  shredder(c, t, L);
  if (L === 'hook' && t < 1.0) envelope(c, lerp(-60, 260, eOut(P(t, 0.2, 0.9))), DESK.top - 70, 0.6, 'RESIGNATION', 0);
  plant(c, PLX, t, L);
  heads.her = put(c, HER, herState(t, L), HERX, FY);
  if (L === 'B1' || L === 'B2' || L === 'C1' || L === 'C2') badge(c, heads.her, L === 'B1' ? eBack(P(t, ev('badge'), ev('badge') + 0.3), 1.8) : 1);
  return heads;
}
function shotFor(t) { const sc = sceneAt(t), L = sc.id, two = { x: 0, y: -1000, z: 0.8, r: 0 }; if (L === 'hook' || L === 'outro') return two; const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.76, cut: u < 0.85 };
  if ((L === 'C1' && t > ev('plant') - 0.2 && t < SP.c1_nar.t + 1.5) || (L === 'C2' && t > ev('point') - 0.3)) return { x: -200, y: -950, z: 0.7, r: 0 };
  if (L === 'C2' && speaking('c2_her', t, 0.2, 0.3)) return { x: HERX + 200, y: -1250, z: 0.85, r: 0 };
  const l = L.toLowerCase(), cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? { x: HERX + 230, y: -1180, z: 0.95, r: 0.3 } : { x: BX - 230, y: -1280, z: 0.92, r: -0.3 };
  return two; }
// ---------------- directed camera (B2): hard cuts on speaker changes, motivated eased moves inside a shot, no spring drift
const HF = { her: { x: HERX, y: -1300 }, boss: { x: BX, y: -1500 } };          // face centres (world)
const on = (f, sx, sy, z) => ({ x: f.x - (sx - 540) / z, y: f.y - (sy - 960) / z, z });   // camera that puts face f at screen (sx, sy)
const sm = u => u * u * (3 - 2 * u), lerpC = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: a.z * Math.pow(b.z / a.z, u) });
const T = { her: SP.b2_her.t, x: SP.b2_x.t, punch: (K.wordT('b2_x', 'cancel') || SP.b2_x.t + 2.0) - 0.08, cal: ev('cal'), nar: SP.b2_nar.t, tip: SP.b2_tip.t };
const LESSON = z => ({ x: -15, y: HF.boss.y - (925 - 960) / z, z });                       // both faces under the lesson card
const SHOTS = [   // [start, end, from, to, ease-in time (s), dof]
  [SC.B2.s - 0.01, T.her - 0.15, { x: 0, y: -1000, z: 0.76 }, { x: 0, y: -1000, z: 0.76 }, 0, 0],
  [T.her - 0.15, T.x - 0.1, { x: 0, y: -1000, z: 0.76 }, on(HF.her, 560, 820, 1.02), 'dolly', 0],
  [T.x - 0.1, T.punch, on(HF.boss, 590, 800, 0.9), on(HF.boss, 575, 800, 0.96), 'drift', 0],
  [T.punch, T.cal - 0.06, on(HF.boss, 575, 800, 0.96), on(HF.boss, 545, 780, 1.16), 'punch', 1],
  [T.cal - 0.06, T.nar - 0.55, on(HF.her, 540, 770, 1.16), on(HF.her, 540, 775, 1.22), 'drift', 1],
  [T.nar - 0.55, T.tip - 0.3, on(HF.her, 540, 775, 1.22), LESSON(0.7), 'pull', 0],
  [T.tip - 0.3, SC.B2.e + 0.01, LESSON(0.7), LESSON(0.75), 'drift', 0]];
function shotAt(t) { return SHOTS.findIndex(s => t >= s[0] && t < s[1]); }
function camAt(t) {
  const i = shotAt(t); if (i < 0) return { x: 0, y: -1000, z: 0.8, r: 0, dof: 0, i };
  const [a, b, A, B, kind, dof] = SHOTS[i], d = b - a, u = (t - a) / d;
  let k = u; if (kind === 'dolly') k = sm(clamp((t - a) / 1.6)) * 0.85 + 0.15 * u;                  // settle in ~1.6 s, then a slow push
  else if (kind === 'punch') k = eOut(clamp((t - a) / 0.16)) * 0.8 + 0.2 * u;                        // quick comedic punch-in, then hold
  else if (kind === 'pull') k = sm(clamp((t - a) / 0.8)) * 0.9 + 0.1 * u;                           // reveal the lesson two-shot, then settle
  const c = lerpC(A, B, k), prevDof = i > 0 ? SHOTS[i - 1][5] : 0;
  return { ...c, r: 0, dof: lerp(prevDof, dof, clamp((t - a) / 0.25)), i };
}
const CAM = []; for (let f = 0; f <= NF; f++) CAM[f] = camAt(f / FPS);
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
const REF = { x: 0, y: -1000, z: 0.8 };
function layer(c, cam, d, sh) { const z = REF.z * Math.pow(cam.z / REF.z, d), x = REF.x + (cam.x - REF.x) * d, y = REF.y + (cam.y - REF.y) * d; c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(z, z); c.translate(-x, -y); }
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) {
  c.save(); layer(c, cam, 0.8, sh); c.drawImage(BGB, BX0, BY0, BW, BH); if (cam.dof > 0.01) { c.globalAlpha = cam.dof; c.drawImage(BGBB, BX0, BY0, BW, BH); c.globalAlpha = 1; } c.restore();
  c.save(); layer(c, cam, 1, sh); const heads = world(c, t, L); const M = c.getTransform(); c.restore();
  c.save(); layer(c, cam, 1.45, sh); c.globalAlpha = 0.95; c.drawImage(FGP, 560, FY - 980, 700, 1000); c.restore();
  return { heads, M }; }
function drawHook(c, t) { drawWorld(c, t, 'hook', { x: 100, y: -1000, z: 0.8, r: 0 }); Hq.vignette(c, W, HH, 0.3);
  if (t > 1.6) { const kk = eBack(P(t, 1.6, 1.9), 2); c.save(); c.translate(540, 1500); c.rotate(-0.05); c.scale(kk, kk); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -440 + 8, -60 + 10, 880, 120, 20); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -440, -60, 880, 120, 20); c.fill(); UI.textFit(c, 'Unb9', 54, 'ЭТО УЖЕ СЕДЬМАЯ ПОПЫТКА', 800); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ЭТО УЖЕ СЕДЬМАЯ ПОПЫТКА', 0, 4); c.restore(); }
  K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А ТЕБЯ ОТПУСКАЛИ', 'С ПЕРВОГО РАЗА?'], rows: [['A2', 'I want to quit my job.'], ['B1', "I've decided to leave the company."], ['B2', "I'm handing in my notice."], ['C1', 'My decision is final.']], cta: ['ОТПРАВЬ ТОМУ, КТО', 'ХОЧЕТ УВОЛИТЬСЯ'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'smug', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 0.6, G.her.ySh + 300) }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const cam = camAt(t), sh = shake(t);
  const c1 = camAt(t + 0.5 / FPS), c0 = camAt(t - 0.5 / FPS), sameShot = c1.i === cam.i && c0.i === cam.i;
  const speed = sameShot ? Math.hypot((c1.x - c0.x) * cam.z, (c1.y - c0.y) * cam.z) + Math.abs(c1.z - c0.z) * 1400 : 0;   // screen px per frame
  let heads, M;
  if (speed > 7) { const N = 6; ACCX.setTransform(1, 0, 0, 1, 0, 0); ACCX.clearRect(0, 0, W, HH);
    for (let j = 0; j < N; j++) { const tj = t + ((j + 0.5) / N - 0.5) * 0.5 / FPS; /* 180-degree shutter */ SUBX.setTransform(1, 0, 0, 1, 0, 0); const r = drawWorld(SUBX, tj, sc.id, camAt(tj), sh); if (j === (N >> 1)) ({ heads, M } = r); ACCX.globalAlpha = 1 / (j + 1); ACCX.drawImage(SUB, 0, 0); }
    ACCX.globalAlpha = 1; c.drawImage(ACC, 0, 0); }
  else ({ heads, M } = drawWorld(c, t, sc.id, cam, sh));
  Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  cards(c, t, sc.id);
  K.bubbles(c, t, sc, heads, proj, { names: { hughes: ['MR HUGHES', '#2B2F3A'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1);
  K.hud(c, t, sc);
}
const SUB = createCanvas(W, HH), SUBX = SUB.getContext('2d'), ACC = createCanvas(W, HH), ACCX = ACC.getContext('2d');
E.run('quit_motion', NF, renderFrame);
