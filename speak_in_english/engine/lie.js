// "He says he was home" episode renderer: node lie.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/lie/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const HER = { ...BASE.her_london };
const JAKE = { ...BASE.oliver, top: { type: 'tee', col: '#7AA0D6', text: 'zzz', textSize: 44, textCol: '#FFFFFF' }, bottom: { type: 'joggers', col: '#3C6FB4', dots: '#FFFFFF' } };
const G = { her: geom(HER), jake: geom(JAKE) };
const FY = 60, HERX = -320, JX = 330;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- kitchen (prerendered)
const BX0 = -1500, BY0 = -2900, BW = 3000, BH = 3600, BS = 0.5;
function drawKitchen(c) {
  c.fillStyle = '#F4E6C8'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = '#FFFFFF'; for (let y = -1100; y < -500; y += 60) for (let x = BX0 + ((y / 60) % 2) * 30; x < BX0 + BW; x += 60) c.fillRect(x + 2, y + 2, 56, 56);
  c.fillStyle = '#7AB8A0'; c.fillRect(BX0, -2300, BW, 700); c.fillStyle = '#6AA890'; for (let x = BX0 + 40; x < BX0 + BW; x += 260) { c.fillRect(x, -2260, 220, 620); c.fillStyle = '#F2C14E'; c.fillRect(x + 180, -1700, 14, 50); c.fillStyle = '#6AA890'; }
  c.fillStyle = '#E9E4DA'; c.fillRect(BX0, -500, BW, 560); c.fillStyle = '#C9C2B4'; c.fillRect(BX0, -520, BW, 40); c.fillStyle = '#B9B2A4'; for (let x = BX0 + 40; x < BX0 + BW; x += 260) c.fillRect(x, -440, 220, 460);
  c.fillStyle = '#FFFDF8'; c.fillRect(950, -1650, 420, 520); c.fillStyle = '#9FC8E8'; c.fillRect(970, -1630, 380, 480); c.fillStyle = '#FFFDF8'; c.fillRect(1150, -1630, 20, 480);
  c.fillStyle = '#C9CED6'; rr(c, -1400, -2050, 380, 2110, 26); c.fill(); c.fillStyle = '#9AA3B2'; c.fillRect(-1060, -1700, 14, 160); c.fillRect(-1060, -1000, 14, 220); c.fillStyle = '#E0474C'; for (const [x, y] of [[-1300, -1800], [-1200, -1500], [-1340, -1250]]) { c.beginPath(); c.arc(x, y, 22, 0, TAU); c.fill(); }
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#C9B49A'); fg.addColorStop(1, '#A8937A'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawKitchen(c); }

// ---------------- props / photos
function moustache(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#2A1E16'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-40, -22, -70, 8); c.quadraticCurveTo(-36, -2, 0, 12); c.quadraticCurveTo(36, -2, 70, 8); c.quadraticCurveTo(40, -22, 0, 0); c.fill(); c.restore(); }
function personPic(c, x, y, s, opts) { // simple head-and-shoulders portrait used inside photos
  c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => q.e(0, 140, 120, 90), opts.top || '#7AA0D6', { sd: 3, hd: 2, lw: 3 }); paint(c, q => q.e(0, 0, 70, 82), '#F2C9A8', { sd: 3, hd: 2, lw: 3 }); paint(c, q => { q.m(-72, -10); q.q(-70, -100, 0, -96); q.q(70, -100, 72, -10); q.q(40, -60, -72, -10); q.z(); }, opts.hair || '#C9A060', { sd: 2, hd: 1, lw: 2 });
  c.fillStyle = '#2B2F3A'; for (const sx of [-24, 24]) { c.beginPath(); c.arc(sx, 0, 7, 0, TAU); c.fill(); } if (opts.moustache) moustache(c, 0, 34, 0.7); if (opts.glasses) { c.fillStyle = '#1A1A1A'; rr(c, -60, -18, 50, 30, 8); c.fill(); rr(c, 10, -18, 50, 30, 8); c.fill(); c.fillRect(-10, -10, 20, 6); } if (opts.shade) { paint(c, q => { q.m(-60, -70); q.l(60, -70); q.l(90, -170); q.l(-90, -170); q.z(); }, '#F2C14E', { sd: 3, hd: 2, lw: 3 }); } c.restore(); }
function twinPhoto(c, w, h, t) { c.fillStyle = '#E9D2B4'; c.fillRect(0, 0, w, h); personPic(c, w / 2, 300, 1.4, { moustache: true }); c.fillStyle = '#FFFFFF'; rr(c, 30, 560, w - 60, 100, 18); c.fill(); txt(c, 'MY TWIN, JOHN', w / 2, 610, 34, '#2B2F3A'); }
function partyPhoto(c, w, h, t, zoom) { c.save(); const z = 1 + zoom * 1.5, zx = lerp(w / 2, w - 80, zoom), zy = lerp(h / 2, 150, zoom); c.translate(w / 2, h / 2); c.scale(z, z); c.translate(-zx, -zy);
  c.fillStyle = '#3A1E4A'; c.fillRect(0, 0, w, h); for (let i = 0; i < 20; i++) { c.fillStyle = ['#E0474C', '#F2C14E', '#3C8FE0', '#7CF29A'][i % 4]; c.globalAlpha = 0.6; c.beginPath(); c.arc(hash(i) * w, hash(i * 3) * h * 0.6, 12, 0, TAU); c.fill(); } c.globalAlpha = 1;
  c.fillStyle = '#8A5A3A'; c.fillRect(60, 460, 300, 30); c.fillRect(80, 490, 20, 200); c.fillRect(320, 490, 20, 200); personPic(c, 210, 320, 0.9, { shade: true }); c.strokeStyle = '#7AA0D6'; c.lineWidth = 16; c.beginPath(); c.moveTo(180, 440); c.lineTo(150, 500); c.moveTo(240, 440); c.lineTo(270, 500); c.stroke();
  c.fillStyle = '#4A3A2A'; c.fillRect(w - 140, 110, 120, 180); personPic(c, w - 80, 120, 0.55, { hair: '#3A2820', moustache: true, glasses: true, top: '#C9A06A' }); c.restore(); }
function sleepCar(c, k) { const x = lerp(1500, 830, k); c.save(); c.translate(x, -1270); c.scale(0.8, 0.8); paint(c, q => { q.m(-160, 0); q.l(160, 0); q.l(140, -70); q.l(60, -110); q.l(-80, -110); q.l(-150, -60); q.z(); }, '#E0474C', { sd: 4, hd: 2, lw: 3 }); for (const s of [-1, 1]) paint(c, q => q.e(s * 90, 4, 30, 30), '#2B2F3A', { sd: 2, hd: 1, lw: 2 }); paint(c, q => { q.m(-60, -110); q.l(40, -110); q.l(20, -200); q.z(); }, '#3C6FB4', { sd: 2, hd: 1, lw: 2 }); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(20, -200, 12, 0, TAU); c.fill(); txt(c, 'z', 70, -170, 40, '#FFFFFF'); txt(c, 'z', 100, -210, 30, '#FFFFFF'); c.restore(); }

// ---------------- characters
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'skeptical', turn: 0.4, look: 0.8, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 1.1, g.ySh + 180), items: { R: ctx => { ctx.fillStyle = '#2B2F3A'; rr(ctx, -26, -100, 52, 100, 10); ctx.fill(); ctx.fillStyle = '#9FD8F2'; ctx.fillRect(-20, -92, 40, 82); } } };
  if (L === 'A1') st.mood = 'annoyed'; if (L === 'C1' && t > ev('photo') - 0.2) st.armR = reach(g, 1, g.sw * 2.2, g.ySh + 60);
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; if (t > ev('zoom')) st.mood = 'shock'; if (SP.c2_her2 && t > SP.c2_her2.t - 0.2) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 0.4, g.ySh - 160); st.afterTorso = cc => moustache(cc, g.sw * 0.6, g.ySh + 260, 0.6); } }
  return st; }
function jakeState(t, L) { const g = G.jake, st = { t, talk: talk('jake', t), mood: 'happy', turn: -0.4, look: -0.8, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 300), armR: reach(g, 1, g.sw * 0.6, g.ySh + 300) };
  const sp = TL.speech.find(s => s.who === 'jake' && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st.armL = reach(g, -1, -g.sw * 1.7 + Math.sin(u) * 25, g.ySh + 200 + Math.cos(u) * 25); }
  st.items = { R: ctx => { ctx.fillStyle = '#E0474C'; rr(ctx, -34, -46, 68, 24, 6); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.font = '13px Unb9'; ctx.textAlign = 'center'; ctx.fillText('PARTY', 0, -30); } };
  st.front = (cc, gg) => { cc.fillStyle = '#F2C14E'; for (let i = 0; i < 14; i++) { cc.beginPath(); cc.arc(gg.head.x + (hash(i) - 0.5) * g.hw * 2, gg.head.y - g.hh * 0.6 + hash(i * 5) * g.hh * 0.5, 5, 0, TAU); cc.fill(); } cc.strokeStyle = '#E0474C'; cc.lineWidth = 6; cc.beginPath(); cc.arc(gg.head.x - g.hw * 0.55, gg.head.y + g.hh * 0.35, 18, 0.2, Math.PI - 0.2); cc.stroke(); };
  if (L === 'A1' && t > ev('snore') - 0.1 && t < ev('snore') + 1.2) { st.squint = true; st.mood = 'happy'; st.tilt = 0.25; }
  if (L === 'A2' && t > ev('twin') - 0.3) { st.armL = reach(g, -1, -g.sw * 2.2, g.ySh + 80); st.mood = 'smug'; }
  if (L === 'B1' && t > ev('dream')) { st.squint = true; st.tilt = 0.12; }
  if (L === 'C1' && t > ev('photo')) { st.mood = 'shock'; st.lookY = 0.5; }
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'worried' : 'sad'; if (t > ev('zoom') - 0.4) { st.mood = 'surprised'; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh + 80); } if (SP.c2_her2 && t > endOf('c2_her2')) st.mood = 'skeptical'; }
  return st; }
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH);
  if (L === 'B2' && t > ev('car') - 0.6) { c.save(); c.beginPath(); c.rect(970, -1630, 380, 480); c.clip(); sleepCar(c, P(t, ev('car') - 0.6, ev('car') + 1.0)); c.restore(); }
  const heads = {};
  heads.her = put(c, HER, herState(t, L), HERX, FY);
  heads.jake = put(c, JAKE, jakeState(t, L), JX, FY);
  if (L === 'A1' && t > ev('snore') - 0.1 && t < ev('snore') + 1.2) { const k = P(t, ev('snore'), ev('snore') + 1.2); txt(c, 'Z', JX + 200 + k * 80, -1700 - k * 200, 80, `rgba(60,111,180,${1 - k})`); txt(c, 'z', JX + 150 + k * 60, -1600 - k * 160, 54, `rgba(60,111,180,${1 - k})`); }
  if (L === 'B1' && t > ev('dream') && t < SP.b1_nar.t + 1.2) { const k = eBack(P(t, ev('dream'), ev('dream') + 0.4), 1.6); c.save(); c.translate(40, -1180); c.scale(k * 0.95, k * 0.95); c.fillStyle = '#FFFFFF'; for (const [x, y, r] of [[-150, 0, 120], [0, -40, 150], [160, 0, 120], [0, 60, 130]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } c.beginPath(); c.arc(-60, 220, 30, 0, TAU); c.fill(); c.beginPath(); c.arc(-20, 290, 18, 0, TAU); c.fill(); c.fillStyle = '#3A1E4A'; rr(c, -180, -110, 360, 220, 30); c.fill(); personPic(c, 0, -10, 0.6, {}); c.fillStyle = '#F2C14E'; for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(-160 + hash(i) * 320, -100 + hash(i * 3) * 200, 6, 0, TAU); c.fill(); } c.restore(); }
  return heads;
}
function shotFor(t) { const sc = sceneAt(t), L = sc.id, two = { x: 0, y: -1100, z: 0.8, r: 0 }; if (L === 'hook' || L === 'outro') return two; const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.76, cut: u < 0.85 };
  if (L === 'B2' && t > ev('car') - 0.8 && t < SP.b2_nar.t + 0.5) return { x: 500, y: -1250, z: 0.72, r: 0 };
  if (L === 'B1' && t > ev('dream') - 0.2 && t < SP.b1_nar.t + 0.8) return { x: 200, y: -1400, z: 0.7, r: 0 };
  if (L === 'C2' && speaking('c2_her', t, 0.2, 0.3)) return { x: HERX + 200, y: -1500, z: 0.88, r: 0 };
  const l = L.toLowerCase(), cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? { x: HERX + 230, y: -1250, z: 0.95, r: 0.3 } : { x: JX - 230, y: -1280, z: 0.95, r: -0.3 };
  return two; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L); const M = c.getTransform(); c.restore(); return { heads, M }; }
function drawHook(c, t) { const k = eIO(P(t, 1.6, 2.6)); drawWorld(c, t, 'hook', { x: lerp(JX, 0, k), y: lerp(-1250, -1100, k), z: lerp(1.35, 0.8, k), r: 0 }); Hq.vignette(c, W, HH, 0.3);
  const lab = (s, x, y, d) => { const q = eBack(P(t, d, d + 0.3), 2) * (1 - k); if (q > 0) { c.save(); c.translate(x, y); c.scale(q, q); c.rotate(-0.05); UI.font(c, 'Unb9', 46); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, s, 0, 0, C.gold, C.oliveD, 12); c.restore(); } };
  lab('БЛЁСТКИ', 760, 640, 0.3); lab('ПОМАДА', 300, 900, 0.6); lab('БРАСЛЕТ «PARTY»', 760, 1500, 0.9);
  K.titleRibbon(c, t, 540, 330); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А КАК ТЫ ЛОВИШЬ', 'НА ВРАНЬЕ?'], rows: [['A2', 'I saw you at the party yesterday.'], ['B1', 'I know you were there.'], ['B2', "That doesn't add up."], ['C1', "I don't want to argue, but…"]], cta: ['ОТПРАВЬ ТОМУ,', 'КТО «БЫЛ ДОМА»'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'smug', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 0.6, G.her.ySh + 300), front: (k, gg) => moustache(k, gg.head.x, gg.head.y + G.her.hh * 0.42, 0.55) }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh); Hq.vignette(c, W, HH, 0.26);
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }), e = sc.ev || {};
  if (sc.id === 'A2' && e.twin) { const k = eBack(P(t, e.twin, e.twin + 0.3), 1.8) * (1 - P(t, SP.a2_nar.t + 1.6, SP.a2_nar.t + 1.9)); if (k > 0) K.phone(c, 780, 1270, 0.6 * k, (cc, w, h) => twinPhoto(cc, w, h, t), 0.06); }
  if ((sc.id === 'C1' && e.photo) || sc.id === 'C2') { const t0 = sc.id === 'C1' ? e.photo : -1; const k = sc.id === 'C1' ? eBack(P(t, t0, t0 + 0.3), 1.8) * (1 - P(t, SP.c1_nar.t + 2.0, SP.c1_nar.t + 2.3)) : (t > e.zoom - 0.6 && t < SP.c2_nar.t + 1.2 ? 1 : 0); if (k > 0) K.phone(c, sc.id === 'C2' ? 540 : 790, sc.id === 'C2' ? 1200 : 1270, (sc.id === 'C2' ? 0.85 : 0.6) * k, (cc, w, h) => partyPhoto(cc, w, h, t, sc.id === 'C2' ? eIO(P(t, e.zoom, e.zoom + 0.8)) : 0), sc.id === 'C2' ? 0 : 0.06); }
  K.bubbles(c, t, sc, heads, proj, { names: { jake: ['JAKE', '#3C6FB4'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'C2') K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.6);
  K.hud(c, t, sc);
}
E.run('lie', NF, renderFrame);
