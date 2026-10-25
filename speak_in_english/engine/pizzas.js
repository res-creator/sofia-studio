// WHO ORDERED 40 PIZZAS?! — vertical TikTok teaser for THE TRIAL (1080x1920, hard_cut): node pizzas.js start end out.mp4 | --png=f1,f2
// An alternative cut of the trial: the set, cast, props, character states and party flashbacks are copied from trial.js
// (lines 1-339, so the teaser looks exactly like the YouTube episode); the shots, inserts and HUD below are new, for 9:16.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, mix, shade, rgba, paint, rr, softShadow, human, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/pizzas/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C, LVCOL } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
// lines spoken inside a flashback (on the wall screen): the courtroom figures keep their mouths shut meanwhile
const FBL = new Set(['a1_fb', 'ex_f1', 'ex_f2', 'ex_f3', 'ex_n', 'c1_fb']);
const talkC = (who, t) => TL.speech.some(s => FBL.has(s.id) && s.who === who && t >= s.t - 0.1 && t < s.t + s.d + 0.1) ? 0 : talk(who, t);
const W = UI.W, HH = UI.H, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (sid, k) => { const v = ((SC[sid] || {}).ev || {})[k]; return v === undefined ? 1e9 : v; };
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const after = (sid, k, d = 0) => ev(sid, k) + d;

// ---------------- cast (existing designs; court accessories are drawn on top: wig, hearing aid, props)
const HER = { ...BASE.her_london, top: { type: 'blazer', col: '#33507A', shirt: '#FFFFFF', tie: '#FFFFFF' }, bottom: { type: 'trousers', col: '#2B2F3A' } };
const HERP = BASE.her_party;                                      // the party night (flashbacks, final scene): pyjamas from "Neighbours"
const JUDGE = { ...BASE.reggie, top: { type: 'blazer', col: '#1E1E26', shirt: '#FFFFFF', tie: '#FFFFFF' } };
const ROCKY = { ...BASE.rocky, top: { type: 'blazer', col: '#6A4630', shirt: '#22252E', tie: '#E0474C' } };
const ROCKYP = BASE.rocky;                                        // party Rocky (tank top)
const NANA = BASE.nana, MARGOT = BASE.margot;
const KAI = { ...BASE.kai, top: { type: 'tank', col: '#6A4630', text: 'CAFÉ\n24/7', textSize: 40, textCol: '#F3EDDF' }, bottom: { type: 'trousers', col: '#2B2F3A' } };
const USHER = { ...BASE.tom, top: { type: 'blazer', col: '#2B2F3A', shirt: '#FFFFFF', tie: '#2B2F3A' }, bottom: { type: 'trousers', col: '#2B2F3A' } };
const COUR = { ...BASE.mark, top: { type: 'tank', col: '#E0474C', text: 'PIZZA', textSize: 40, textCol: '#FFFFFF' }, bottom: { type: 'trousers', col: '#2B2F3A' } };
const G = {}; for (const [k, v] of Object.entries({ her: HER, herp: HERP, reggie: JUDGE, rocky: ROCKY, rockyp: ROCKYP, nana: NANA, margot: MARGOT, kai: KAI, usher: USHER, jay: BASE.jay, tony: BASE.tony, cour: COUR })) G[k] = geom(v);
const NAMES = { reggie: ['JUDGE', '#1E1E26'], rocky: ['ROCKY', '#E0474C'], nana: ['NANA', '#C2504A'], margot: ['MARGOT', '#2F3E5C'], kai: ['KAI', '#6A4630'], homey: ['HOMEY', '#2E8C86'] };

// ---------------- set layout (world units, floor y = 0)
const HERX = -2650;                          // the dock
const JFY = -470;                            // judge's feet (behind the bench, on the dais)
const BENCH = { x0: -780, x1: 780, top: -1440 };       // bench top at the judge's chest: he reads as seated
const WITX = 1300, WFY = -110;               // witness box (on a step)
const RX = 2500;                             // claimant's table
const EVX = -1350;                           // evidence table
const SCR = { x: -1580, y: -2330, w: 1180, h: 664 };   // wall screen centre / size
const GAL = { x0: 3250, x1: 5450, top: -660 };          // public gallery bench back
const SEAT = { nana: 3480, margot: 3900, jay: 4320, tony: 4740, kai: 5150 }, DROP = 300;
const DOORX = 6100, USHX = 5750;
const NIGHTX = 20000;
const NBX = 1000;                            // verdict: Nana in front of the bench                        // the night corridor lives far away in the same world (same camera)
const headW = (who, x, fy = 0, drop = 0) => ({ x, y: fy + G[who].headY + drop, hh: G[who].hh });

// ---------------- courtroom background (prerendered once, softly blurred)
const BX0 = -3900, BY0 = -4500, BW = 10600, BH = 5300, BS = 0.5;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function drawCourt(c) {
  // upper wall: warm plaster with soft vertical bands
  const g = c.createLinearGradient(0, BY0, 0, -900); g.addColorStop(0, '#CFC2A6'); g.addColorStop(1, '#E8DDC4'); c.fillStyle = g; c.fillRect(BX0, BY0, BW, -900 - BY0);
  c.fillStyle = 'rgba(255,255,255,.18)'; for (let x = BX0; x < BX0 + BW; x += 300) c.fillRect(x, BY0, 130, 3700);
  // ceiling cornice + coffered strip
  c.fillStyle = '#7A5636'; c.fillRect(BX0, BY0, BW, 260); c.fillStyle = '#E8DCC8'; c.fillRect(BX0, BY0 + 260, BW, 40); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(BX0, BY0 + 300, BW, 18);
  for (let x = BX0 + 60; x < BX0 + BW; x += 240) { c.fillStyle = '#8A6440'; rr(c, x, BY0 + 40, 180, 180, 10); c.fill(); }
  // tall arched windows with London daylight (left wall section and gallery side)
  for (const wx of [-3250, -2050, 3650, 4850]) { c.fillStyle = '#6E4A2E'; rr(c, wx - 330, -3700, 660, 1900, 330); c.fill();
    const sg = c.createLinearGradient(0, -3650, 0, -1850); sg.addColorStop(0, '#BFE0F2'); sg.addColorStop(1, '#F2EBD8'); c.fillStyle = sg; rr(c, wx - 290, -3660, 580, 1820, 290); c.fill();
    c.fillStyle = 'rgba(160,184,200,.55)'; for (let i = 0; i < 5; i++) { const hh = 260 + hash(i + wx) * 420; c.fillRect(wx - 270 + i * 110, -1850 - hh, 90, hh); }
    c.fillStyle = '#6E4A2E'; c.fillRect(wx - 12, -3660, 24, 1820); c.fillRect(wx - 290, -2700, 580, 22);
    const lg = c.createLinearGradient(wx, -1850, wx + 600, 0); lg.addColorStop(0, 'rgba(255,246,220,.22)'); lg.addColorStop(1, 'rgba(255,246,220,0)'); c.fillStyle = lg; c.beginPath(); c.moveTo(wx - 290, -1850); c.lineTo(wx + 290, -1850); c.lineTo(wx + 900, 0); c.lineTo(wx + 100, 0); c.fill(); }
  // dark oak panelling behind the judge, full height, with the crest
  c.fillStyle = '#5A3A24'; c.fillRect(-1150, -4200, 2300, 4200); c.fillStyle = '#6E4A2E'; for (let i = 0; i < 4; i++) { rr(c, -1080 + i * 545, -4100, 480, 1600, 20); c.fill(); }
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 8; for (let i = 0; i < 4; i++) c.strokeRect(-1060 + i * 545, -4080, 440, 1560);
  // crest: shield with scales of justice
  c.save(); c.translate(0, -3080); c.fillStyle = '#C9A24A'; c.beginPath(); c.arc(0, 0, 330, 0, TAU); c.fill(); c.fillStyle = '#8A1C2E'; c.beginPath(); c.moveTo(-200, -210); c.lineTo(200, -210); c.lineTo(200, 40); c.quadraticCurveTo(200, 220, 0, 280); c.quadraticCurveTo(-200, 220, -200, 40); c.closePath(); c.fill();
  c.strokeStyle = '#F2D488'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -150); c.lineTo(0, 170); c.moveTo(-130, -90); c.lineTo(130, -90); c.stroke();
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 130, -90); c.lineTo(s * 170, 20); c.moveTo(s * 130, -90); c.lineTo(s * 90, 20); c.stroke(); c.fillStyle = '#F2D488'; c.beginPath(); c.arc(s * 130, 20, 50, 0, Math.PI); c.fill(); }
  c.restore();
  c.fillStyle = '#2B2F3A'; rr(c, -360, -2600, 720, 120, 14); c.fill(); txt(c, 'COURT 2', 0, -2540, 74, '#F2D488');
  // lower wainscot (oak) across the room
  const wg = c.createLinearGradient(0, -900, 0, 0); wg.addColorStop(0, '#8A5A36'); wg.addColorStop(1, '#6E4528'); c.fillStyle = wg; c.fillRect(BX0, -900, BW, 900);
  c.fillStyle = '#E8DCC8'; c.fillRect(BX0, -930, BW, 34); c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 6; for (let x = BX0; x < BX0 + BW; x += 340) c.strokeRect(x + 30, -850, 280, 780);
  // portraits on the right wall
  for (const [px, col] of [[2050, '#2E5E4E'], [2750, '#5A2E4E']]) { c.fillStyle = '#C9A06A'; c.fillRect(px - 210, -2650, 420, 540); c.fillStyle = col; c.fillRect(px - 175, -2615, 350, 470); c.fillStyle = '#F2CDB4'; c.beginPath(); c.arc(px, -2440, 70, 0, TAU); c.fill(); c.fillStyle = '#E8E4DA'; c.beginPath(); c.ellipse(px, -2520, 92, 46, 0, 0, TAU); c.fill(); c.fillStyle = '#1E1E26'; c.beginPath(); c.moveTo(px - 140, -2150); c.quadraticCurveTo(px, -2400, px + 140, -2150); c.fill(); }
  // exit door + sign
  c.fillStyle = '#5A3A24'; c.fillRect(DOORX - 380, -2500, 760, 2500); c.fillStyle = '#7A5232'; c.fillRect(DOORX - 330, -2440, 300, 2400); c.fillRect(DOORX + 30, -2440, 300, 2400);
  c.fillStyle = '#C9A24A'; c.beginPath(); c.arc(DOORX - 60, -1150, 22, 0, TAU); c.arc(DOORX + 60, -1150, 22, 0, TAU); c.fill();
  c.fillStyle = '#2F9E58'; rr(c, DOORX - 200, -2760, 400, 130, 14); c.fill(); txt(c, 'EXIT', DOORX, -2694, 70, '#FFFFFF');
  // floor: herringbone oak with a green runner to the bench
  const fg = c.createLinearGradient(0, 0, 0, 800); fg.addColorStop(0, '#9C6A40'); fg.addColorStop(1, '#7A5030'); c.fillStyle = fg; c.fillRect(BX0, 0, BW, 800);
  c.strokeStyle = 'rgba(0,0,0,.16)'; c.lineWidth = 4; for (let x = BX0; x < BX0 + BW; x += 120) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 60, 800); c.stroke(); }
  c.fillStyle = 'rgba(46,94,78,.85)'; c.beginPath(); c.moveTo(-600, 0); c.lineTo(600, 0); c.lineTo(900, 800); c.lineTo(-900, 800); c.fill();
  c.fillStyle = '#3A2414'; c.fillRect(BX0, -40, BW, 40);
}
const BGS = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGS.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); drawCourt(c); }
const BGB = createCanvas(BGS.width, BGS.height); { const c = BGB.getContext('2d'); c.filter = 'blur(2.2px)'; c.drawImage(BGS, 0, 0); }

// ---------------- props
function woodBox(c, x0, x1, top, bottom, col = '#7A5232') {
  paint(c, q => { q.m(x0, top); q.l(x1, top); q.l(x1, bottom); q.l(x0, bottom); q.z(); }, col, { sd: 6, hd: 3, lw: 3, inner: k => { k.strokeStyle = 'rgba(0,0,0,.22)'; k.lineWidth = 6; const n = Math.max(1, Math.round((x1 - x0) / 360)); for (let i = 0; i < n; i++) { const a = x0 + 30 + i * (x1 - x0 - 30) / n; k.strokeRect(a, top + 70, (x1 - x0 - 30) / n - 30, bottom - top - 110); } } });
  c.fillStyle = shade(col, 0.75); c.fillRect(x0 - 20, top - 30, x1 - x0 + 40, 40); c.fillStyle = 'rgba(255,240,210,.18)'; c.fillRect(x0 - 20, top - 30, x1 - x0 + 40, 10);
}
function rail(c, x0, x1, top, bottom, col = '#6E4A2E') {   // dock / witness rail: posts + top rail, the person shows through
  c.fillStyle = col; for (let x = x0; x <= x1 + 1; x += (x1 - x0) / 6) c.fillRect(x - 16, top, 32, bottom - top);
  paint(c, q => { q.m(x0 - 30, top - 34); q.l(x1 + 30, top - 34); q.l(x1 + 30, top + 10); q.l(x0 - 30, top + 10); q.z(); }, shade(col, 1.1), { sd: 4, hd: 2, lw: 3 });
  paint(c, q => { q.m(x0 - 20, bottom - 300); q.l(x1 + 20, bottom - 300); q.l(x1 + 20, bottom); q.l(x0 - 20, bottom); q.z(); }, col, { sd: 4, hd: 2, lw: 3 });
}
function pizzaBox(c, x, y, s = 1, lid = false) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(-170, -36); q.l(170, -36); q.l(170, 0); q.l(-170, 0); q.z(); }, '#E8C890', { sd: 4, hd: 2, lw: 3 }); c.fillStyle = '#C23C4A'; c.font = '24px Unb9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PIZZA', 0, -17); if (lid) { c.fillStyle = '#F2D49A'; c.beginPath(); c.moveTo(-170, -36); c.lineTo(170, -36); c.lineTo(150, -200); c.lineTo(-150, -200); c.fill(); } c.restore(); }
function extinguisher(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(-46, -330); q.q(-50, -380, 0, -386); q.q(50, -380, 46, -330); q.l(46, 0); q.l(-46, 0); q.z(); }, '#E0474C', { sd: 8, hd: 5, lw: 3, inner: k => { k.fillStyle = '#FFFDF8'; k.fillRect(-46, -230, 92, 90); k.fillStyle = '#2B2F3A'; k.font = '20px Unb9'; k.textAlign = 'center'; k.fillText('FIRE', 0, -196); k.fillText('EXT.', 0, -168); } }); c.fillStyle = '#2B2F3A'; c.fillRect(-14, -430, 28, 50); c.strokeStyle = '#2B2F3A'; c.lineWidth = 12; c.beginPath(); c.moveTo(10, -420); c.quadraticCurveTo(90, -420, 80, -300); c.stroke(); c.restore(); }
// flamingo: k = 0 deflated heap, 1 = giant and inflated
function flamingo(c, x, y, k, t = 0) { c.save(); c.translate(x, y); const pink = '#F27AAE', pinkD = '#D9558E';
  if (k < 0.05) { paint(c, q => { q.m(-230, 0); q.q(-180, -90, -40, -70); q.q(60, -120, 190, -60); q.q(250, -20, 230, 0); q.z(); }, pink, { sd: 8, hd: 4, lw: 3 }); paint(c, q => { q.m(130, -60); q.q(200, -150, 260, -110); q.q(290, -80, 250, -60); q.z(); }, pink, { sd: 4, hd: 2, lw: 3 }); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(240, -100, 8, 0, TAU); c.fill(); c.fillStyle = '#F2C14E'; c.beginPath(); c.moveTo(270, -96); c.lineTo(310, -84); c.lineTo(268, -78); c.fill(); c.restore(); return; }
  const s = lerp(0.25, 1, eBack(k, 1.4)); c.scale(s, s); c.rotate(Math.sin(t * 2) * 0.02);
  paint(c, q => { q.m(-60, -700); q.q(-40, -1100, 40, -1400); q.q(90, -1550, 200, -1480); q.q(250, -1430, 210, -1380); q.q(140, -1420, 110, -1350); q.q(60, -1100, 90, -700); q.z(); }, pink, { sd: 12, hd: 6, lw: 4 });
  paint(c, q => q.e(0, -560, 330, 240), pink, { sd: 18, hd: 10, lw: 4, inner: k2 => { k2.fillStyle = pinkD; k2.beginPath(); k2.ellipse(80, -560, 170, 120, 0.3, 0, TAU); k2.fill(); } });
  c.strokeStyle = pinkD; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(-60, -340); c.lineTo(-80, 0); c.moveTo(60, -340); c.lineTo(40, -160); c.lineTo(100, -120); c.stroke();
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(170, -1450, 16, 0, TAU); c.fill(); c.fillStyle = '#F2C14E'; c.beginPath(); c.moveTo(220, -1440); c.lineTo(300, -1400); c.lineTo(212, -1390); c.fill(); c.restore(); }
// Homey: smart speaker; lit = light ring (0..1); bag = in the evidence bag with the EXHIBIT A tag
function homey(c, x, y, s, lit, bag, t, col = '#5BE0E6') { c.save(); c.translate(x, y); c.scale(s, s);
  paint(c, q => { q.m(-80, -230); q.q(0, -250, 80, -230); q.l(80, 0); q.q(0, 14, -80, 0); q.z(); }, '#3A3F4B', { sd: 8, hd: 4, lw: 3, inner: k => { k.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 9; i++) k.fillRect(-70, -200 + i * 22, 140, 8); } });
  c.fillStyle = mix('#22262E', col, clamp(lit)); c.beginPath(); c.ellipse(0, -232, 74, 18, 0, 0, TAU); c.fill();
  if (lit > 0.05) { c.save(); c.globalAlpha = 0.5 * lit; c.fillStyle = col; c.beginPath(); c.ellipse(0, -232, 120 + 20 * Math.sin(t * 10), 40, 0, 0, TAU); c.fill(); c.restore(); }
  if (bag) { c.fillStyle = 'rgba(220,235,245,.28)'; c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 5; c.beginPath(); c.moveTo(-120, 10); c.lineTo(-110, -300); c.lineTo(110, -310); c.lineTo(120, 10); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#E0474C'; c.fillRect(-112, -320, 224, 24); c.save(); c.translate(120, -150); c.rotate(0.25); c.fillStyle = '#FFFDF8'; rr(c, 0, -40, 170, 80, 10); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 3; c.stroke(); txt(c, 'EXHIBIT', 85, -14, 26, '#2B2F3A'); txt(c, 'A', 85, 18, 30, '#E0474C'); c.restore(); }
  c.restore(); }
function homeyLit(t) { const b = ev('RC', 'beep'); if (t > b && t < b + 0.5) return 1; return Math.max(talk('homey', t), TL.speech.some(s => s.who === 'homey' && t >= s.t - 0.2 && t < s.t + s.d + 0.25) ? 0.6 : 0); }
const gavelItem = (ctx, a) => { ctx.rotate(a - Math.PI / 2 + Math.PI * 0.55); paint(ctx, q => { q.m(-8, -10); q.l(8, -10); q.l(6, 150); q.l(-6, 150); q.z(); }, '#7A4A2A', { sd: 2, hd: 2, lw: 2 }); paint(ctx, q => { q.m(-60, 130); q.l(60, 130); q.l(60, 190); q.l(-60, 190); q.z(); }, '#5A3420', { sd: 4, hd: 2, lw: 3 }); };
const boxItem = (open) => (ctx) => { ctx.translate(0, -20); paint(ctx, q => { q.m(-80, -50); q.l(80, -50); q.l(74, 40); q.l(-74, 40); q.z(); }, '#F6EFE4', { sd: 6, hd: 3, lw: 3, inner: k => { k.fillStyle = '#E8B04A'; k.fillRect(-70, -40, 140, 30); k.fillStyle = '#C98B5A'; for (let i = 0; i < 4; i++) k.fillRect(-64 + i * 34, -36, 24, 18); } }); if (!open) { ctx.fillStyle = '#5BC0EB'; rr(ctx, -86, -66, 172, 22, 8); ctx.fill(); } };
const plateItem = (ctx) => { ctx.translate(0, -10); paint(ctx, q => q.e(0, 0, 90, 24), '#FFFDF8', { sd: 4, hd: 2, lw: 3 }); ctx.fillStyle = '#C98B5A'; for (let i = 0; i < 3; i++) { rr(ctx, -60 + i * 40, -30, 34, 22, 8); ctx.fill(); } };
const micItem = (ctx, a) => { ctx.rotate(a - Math.PI / 2 + Math.PI); paint(ctx, q => { q.m(-12, -10); q.l(12, -10); q.l(9, 110); q.l(-9, 110); q.z(); }, '#2B2F3A', { sd: 3, hd: 2, lw: 3 }); paint(ctx, q => q.a(0, -32, 30), '#C9CED6', { sd: 4, hd: 3, lw: 3 }); };
const pillowItem = (ctx) => { ctx.rotate(0.25); paint(ctx, q => { q.m(-100, -64); q.q(0, -86, 100, -64); q.q(118, 0, 100, 64); q.q(0, 86, -100, 64); q.q(-118, 0, -100, -64); q.z(); }, '#FFFDF8', { sd: 8, hd: 5, lw: 3 }); };
const pizzaTower = (n) => (ctx) => { for (let i = 0; i < n; i++) pizzaBox(ctx, 0, -i * 38, 0.55); };
const receiptItem = (ctx, a) => { ctx.rotate(-0.15); ctx.fillStyle = '#FFFDF8'; ctx.fillRect(-40, -170, 80, 160); ctx.fillStyle = '#9A9488'; for (let i = 0; i < 7; i++) ctx.fillRect(-30, -155 + i * 20, 60 - (i % 3) * 12, 6); };
const wigItem = (ctx, a) => { ctx.rotate(a - Math.PI / 2 + Math.PI); wigShape(ctx, 0, -60, 70, 70); };

// court accessories drawn over the head (st.front gets the head position)
function wigShape(c, x, y, hw, hh) { c.save(); c.translate(x, y); c.fillStyle = '#F4F1EA'; c.strokeStyle = '#B9B4A6'; c.lineWidth = 3;
  const curl = (cx, cy, r) => { c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill(); c.stroke(); };
  c.beginPath(); c.ellipse(0, -hh * 0.62, hw * 1.08, hh * 0.52, 0, Math.PI, TAU); c.fill(); c.stroke();
  for (let i = -4; i <= 4; i++) curl(i * hw * 0.25, -hh * 0.66 - Math.cos(i / 4 * 1.2) * hh * 0.28, hw * 0.2);
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) curl(s * hw * 1.06, -hh * 0.42 + k * hh * 0.33, hw * 0.19);
  c.restore(); }
const wig = (g) => (ctx, o) => wigShape(ctx, o.head.x, o.head.y, g.hw, g.hh);
function hearingAid(g, t) { return (ctx, o) => { const x = o.head.x + g.hw * 0.98, y = o.head.y + g.hh * 0.02; ctx.save(); ctx.fillStyle = '#E6C9A8'; ctx.strokeStyle = '#9A7A5A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, g.hw * 0.12, g.hh * 0.2, 0.2, 0, TAU); ctx.fill(); ctx.stroke();
  const w = whistle(t); ctx.fillStyle = w > 0 ? '#FF3B3B' : '#7A3A3A'; ctx.beginPath(); ctx.arc(x + 2, y - g.hh * 0.1, g.hw * 0.04, 0, TAU); ctx.fill();
  if (w > 0) { ctx.strokeStyle = `rgba(255,80,80,${0.8 * w})`; ctx.lineWidth = 5; for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(x, y, g.hw * (0.2 + k * 0.16 + 0.06 * Math.sin(t * 20)), -0.7, 0.7); ctx.stroke(); } }
  ctx.restore(); }; }
// moments when Nana's hearing aid whistles (sfx "squeak" near her lines + the WHISTLE events)
const WHISTLES = [ev('NM', 'whistle'), ev('C1', 'whistle'), ev('C2', 'whistle')].filter(x => x < 1e8);
function whistle(t) { let a = 0; for (const w of WHISTLES) if (t > w && t < w + 1.3) a = Math.max(a, 1 - P(t, w + 0.9, w + 1.3)); return a; }
function sweat(c, hd, k) { if (k <= 0) return; const x = hd.x + hd.hh * 0.75, y = hd.y - hd.hh * 0.55 + (1 - k) * -20; c.save(); c.globalAlpha = k; c.fillStyle = '#8FD3F7'; c.strokeStyle = '#3C8FE0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 34); c.quadraticCurveTo(x + 22, y, x, y + 14); c.quadraticCurveTo(x - 22, y, x, y - 34); c.fill(); c.stroke(); c.restore(); }

// ---------------- character states
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
const inS = (t, a, b) => t >= a && t < b;
function herState(t, L) { const g = G.her, st = { t, talk: talkC('her', t), mood: 'worried', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 0.6, g.ySh + 330), armR: reach(g, 1, g.sw * 1.6, g.ySh + 260) };   // hands on the dock rail
  gest(st, g, 'her', t, -1, 160);
  if (L === 'hook') { st.mood = 'neutral'; if (t > SP.hook_her.t - 0.1) { st.mood = 'shock'; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh - 160); st.armR = reach(g, 1, g.sw * 1.4, g.ySh - 160); }
    if (t > endOf('hook_her') + 0.5) { st.mood = 'worried'; st.armL = reach(g, -1, -g.sw * 0.6, g.ySh + 330); } }
  if (L === 'A1') { st.mood = speaking('a1_her', t) ? 'smug' : 'neutral'; if (t > ev('A1', 'screen')) st.mood = 'worried'; const f = ev('A1', 'facepalm'); if (t > f && t < SP.a1_nar.t + 0.4) { st.mood = 'sad'; st.lookY = 0.6; st.armL = reach(g, -1, -g.hw * 0.4, g.headY + 40); st.armR = reach(g, 1, g.hw * 0.4, g.headY + 40); st.headFirst = false; } }
  if (L === 'NM') { st.mood = 'neutral'; if (t > SP.nm_h.t) st.mood = 'shock'; if (t > SP.nm_x2.t) st.mood = 'tired'; }
  if (L === 'EX') { st.mood = 'worried'; if (t > ev('EX', 'flamingo')) st.mood = 'sad'; if (speaking('ex_her', t, 0.1)) st.mood = 'tired'; }
  if (L === 'LOG') { st.mood = 'neutral'; if (t > ev('LOG', 'look')) { st.mood = 'shock'; st.look = 0.2; } }
  if (L === 'A2') { st.mood = speaking('a2_her', t) ? 'neutral' : 'worried'; if (t > SP.a2_x2.t) st.mood = 'annoyed'; }
  if (L === 'RC') { st.mood = 'worried'; if (speaking('rc_her', t, 0.1)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 0.3, g.ySh + 120); st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 40); } if (t > SP.rc_j3.t) st.mood = 'shock'; if (t > SP.rc_x2.t + 0.5) st.mood = 'sad'; }
  if (L === 'B1') { st.mood = speaking('b1_her', t, 0.1) ? 'smug' : 'neutral'; if (t > ev('B1', 'kai')) { st.mood = 'happy'; st.look = 1; } if (t > endOf('b1_k2') - 0.3) { st.mood = 'shock'; } if (t > SP.b1_nar.t + 1) st.mood = 'worried'; }
  if (L === 'B2') { st.mood = 'annoyed'; st.look = 1; if (speaking('b2_her', t, 0.1)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 0.3, g.ySh + 120); st.armR = reach(g, 1, g.sw * 2.1, g.ySh - 40); } if (t > SP.b2_m2.t + 0.6) st.mood = 'surprised'; if (t > SP.b2_x2.t) st.mood = 'skeptical'; }
  if (L === 'C1') { st.mood = speaking('c1_her', t, 0.1) ? 'happy' : 'neutral'; const w = ev('C1', 'whistle'); if (t > w) { st.mood = 'surprised'; st.lookY = -0.4; st.look = 0.4; st.armR = reach(g, 1, g.hw * 1.3, g.headY + 10); } if (t > SP.c1_nar.t + 0.5) { st.mood = 'smug'; st.lookY = 0; st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 260); } }
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral';
    if (speaking('c2_her', t)) { const u = t - SP.c2_her.t; st.armR = reach(g, 1, g.sw * 1.9 + Math.sin(u * 1.3) * 60, g.ySh - 60 + Math.cos(u * 1.1) * 60); st.armL = reach(g, -1, -g.sw * 0.4, g.ySh + 150); if (t > chunkT('c2_her', 7)) { st.armR = reach(g, 1, g.sw * 2.4, g.ySh - 200); } }
    if (t > ev('C2', 'match')) st.mood = 'happy'; if (t > ev('C2', 'oops')) { st.mood = 'shock'; } if (t > SP.c2_n3.t + 0.4) { st.mood = 'happy'; st.laugh = !speaking('c2_her', t); } }
  if (L === 'VD') { st.mood = 'happy'; if (speaking('vd_her', t, 0.1, 0.5)) st.mood = 'tired'; if (t > SP.vd_x4.t) { st.mood = 'happy'; st.laugh = true; } }
  if (L === 'FN') { st.mood = 'happy'; st.laugh = true; st.armL = reach(g, -1, -g.sw * 1.5 + Math.sin(t * 8) * 40, g.ySh - 250); }
  return st; }
function judgeState(t, L) { const g = G.reggie, st = { t, talk: talk('reggie', t), mood: 'skeptical', turn: 0, look: -0.5, armL: reach(g, -1, -g.sw * 1.1, g.ySh + 420), armR: reach(g, 1, g.sw * 1.1, g.ySh + 420), front: wig(g) };
  gest(st, g, 'reggie', t, -1, 300);
  const cur = TL.speech.find(s => s.who !== 'nar' && s.who !== 'tip' && t >= s.t && t < s.t + s.d + 0.4); if (cur) { if (['rocky', 'margot', 'kai', 'nana'].includes(cur.who)) st.look = 0.6; if (cur.who === 'her') st.look = -0.7; }
  // gavel strikes (thud cues)
  const hit = TL.sfx.filter(s => s.n === 'thud' && t > s.t - 0.35 && t < s.t + 0.3)[0];
  if (hit) { const k = t < hit.t ? eIO(P(t, hit.t - 0.35, hit.t - 0.05)) : 1 - P(t, hit.t, hit.t + 0.3); st.armR = reach(g, 1, g.sw * 1.0, lerp(g.ySh + 420, g.ySh - 200, t < hit.t ? k : 0)); st.items = { R: gavelItem }; st.mood = 'annoyed'; }
  if (L === 'NM' && t > SP.nm_x2.t) st.mood = 'smug';
  if (L === 'EX' && t > ev('EX', 'flamingo')) st.mood = 'skeptical';
  if (L === 'A2' && t > SP.a2_x3.t - 0.2) st.mood = 'annoyed';
  if (L === 'RC') { if (t > ev('RC', 'beep')) st.mood = 'annoyed'; if (t > SP.rc_j3.t) st.mood = 'smug'; }
  if (L === 'C2') { if (speaking('c2_her', t)) { st.mood = 'surprised'; st.look = -0.8; } if (t > ev('C2', 'match')) { st.mood = 'shock'; st.look = -0.3; } if (t > SP.c2_x2.t - 0.1) st.mood = 'skeptical'; if (t > SP.c2_n3.t + 0.6) st.mood = 'surprised'; }
  if (L === 'VD') { st.mood = 'neutral'; if (t > ev('VD', 'eat')) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 0.2, g.ySh + 60); st.items = { R: plateItem }; } if (speaking('vd_x4', t, 0.1, 0.5)) { st.armL = reach(g, -1, -g.sw * 1.8, g.ySh + 20); st.items = { L: plateItem }; } }
  if (L === 'FN') { st.mood = 'happy'; st.laugh = true; st.front = null; st.armR = reach(g, 1, g.sw * 0.6 + Math.cos(t * 9) * 50, g.ySh - 520 + Math.sin(t * 9) * 40); st.items = { R: wigItem }; }
  return st; }
function rockyState(t, L) { const g = G.rocky, st = { t, talk: talk('rocky', t), mood: 'smug', turn: -0.35, look: -0.8, armL: reach(g, -1, -g.sw * 0.9, g.ySh + 380), armR: reach(g, 1, g.sw * 0.9, g.ySh + 380) };
  gest(st, g, 'rocky', t, 1, 200);
  if (speaking('a1_x', t, 0.1) || speaking('a2_x2', t, 0.1) || speaking('b2_x', t, 0.1) || (L === 'LOG' && speaking('log_x', t, 0.1))) { st.mood = L === 'A2' ? 'angry' : 'smug'; st.armL = reach(g, -1, -g.sw * 2.5, g.ySh - 40); }
  if (L === 'A2' && t > SP.a2_x3.t) st.mood = 'sad';
  if (L === 'RC') { st.mood = 'smug'; if (speaking('rc_x', t, 0.1, 0.3) || speaking('rc_x2', t, 0.1, 0.4)) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 260); st.items = { L: receiptItem }; } }
  if (L === 'B1' && t > ev('B1', 'kai')) st.mood = 'worried'; if (L === 'B1' && t > endOf('b1_k2') - 0.3) st.mood = 'smug';
  if (L === 'C2') { st.mood = speaking('c2_her', t) ? 'worried' : 'neutral'; if (t > ev('C2', 'match')) st.mood = 'shock'; if (t > ev('C2', 'oops')) { st.mood = 'surprised'; st.look = -0.4; } }
  if (L === 'VD') st.mood = 'sad';
  if (L === 'FN') { st.mood = 'happy'; st.laugh = !speaking('fn_r', t); st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 380 + Math.sin(t * 9) * 40); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 380 + Math.cos(t * 9) * 40); st.headY = Math.abs(Math.sin(t * 7)) * 14; }
  return st; }
// where Nana is: 'gallery' (seated), 'evid' (standing at the evidence table, C2 on), 'bench' (in front of the judge, verdict)
function nanaWhere(t, L) { if (L === 'C2' && t > ev('C2', 'walk')) return 'evid'; if (L === 'VD' && t > SP.vd_n.t - 0.6) return 'bench'; if (L === 'VD' || L === 'FN') return 'evid'; return 'gallery'; }
function nanaState(t, L) { const g = G.nana, where = nanaWhere(t, L), st = { t, talk: talkC('nana', t), mood: 'happy', turn: -0.3, look: -0.7, armL: { a: 0.25, b: 0.6 }, armR: reach(g, 1, g.sw * 0.6, g.ySh + 300), items: { R: boxItem(false) }, front: hearingAid(g, t) };
  if (where === 'gallery') { st.drop = DROP; st.legs = false; st.turn = 0.2; st.look = 0.6; const u = t % 9; if (u > 5 && u < 7.5) { st.armR = reach(g, 1, g.sw * 2.3, g.ySh - 60); st.look = 1; } }   // keeps offering sandwiches to the usher
  if (L === 'NM' && speaking('nm_n', t, 0.1, 0.4)) { st.mood = 'annoyed'; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh - 120); st.look = -0.8; }
  if (L === 'LOG' && t > ev('LOG', 'look')) { st.mood = 'neutral'; st.look = -0.9; }
  if (L === 'C2') { if (speaking('c2_her', t)) { st.mood = t > chunkT('c2_her', 6) ? 'worried' : 'neutral'; if (t > chunkT('c2_her', 6)) { st.armL = reach(g, -1, -g.hw * 1.2, g.headY + 40); st.look = 1; } }
    if (where === 'evid') { st.mood = 'worried'; st.turn = -0.2; st.look = -0.6; if (t > ev('C2', 'match')) st.mood = 'shock'; if (speaking('c2_n', t, 0.1)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.8, g.ySh - 140); } if (t > ev('C2', 'oops')) { st.mood = 'shock'; st.armL = reach(g, -1, -g.hw * 0.6, g.headY + 90); }
      if (t > SP.c2_n2.t - 0.1) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh + 60); } if (speaking('c2_n3', t, 0.1)) { st.mood = 'happy'; st.laugh = true; } if (t > SP.c2_n4.t - 0.1) st.mood = 'smug'; } }
  if (L === 'VD') { st.mood = 'happy'; if (where === 'bench') { st.turn = 0.3; st.look = 0.6; st.lookY = -0.6; st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 260); st.items = { R: boxItem(true) }; } }
  if (L === 'FN') { st.mood = 'happy'; st.laugh = true; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh - 200 + Math.sin(t * 6) * 30); }
  return st; }
function margotState(t, L) { const g = G.margot, st = { t, talk: talk('margot', t), mood: 'happy', turn: -0.3, look: -0.7, armL: reach(g, -1, -g.sw * 0.8, g.ySh + 300), armR: reach(g, 1, g.sw * 0.8, g.ySh + 300) };
  gest(st, g, 'margot', t, -1, 150);
  if (speaking('b2_m3', t, 0, 1.2)) { st.headY = Math.sin(t * 7) * 10; st.tilt = Math.sin(t * 3.5) * 0.08; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 260 + Math.sin(t * 7) * 30); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 260 + Math.cos(t * 7) * 30); }
  if (L === 'C2' && t > ev('C2', 'match')) st.mood = 'shock';
  return st; }
function kaiState(t, L) { const g = G.kai, st = { t, talk: talk('kai', t), mood: 'tired', turn: -0.3, look: -0.7, armL: reach(g, -1, -g.sw * 0.8, g.ySh + 330), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330) };
  gest(st, g, 'kai', t, -1, 200); if (speaking('b1_k2', t, 0, 0.5)) st.mood = 'neutral'; return st; }
const galleryState = (who, t, L) => { const st = { t, mood: 'neutral', turn: -0.2, look: -0.6, drop: DROP, legs: false, armL: { a: 0.3, b: 0.6 }, armR: { a: 0.3, b: 0.6 } };
  if (L === 'LOG' && t > ev('LOG', 'look')) { st.mood = 'shock'; st.look = -1; }
  if (L === 'C2' && speaking('c2_her', t) && t > chunkT('c2_her', 4)) st.mood = 'surprised';
  if (L === 'C2' && t > ev('C2', 'match')) { st.mood = 'shock'; st.look = -1; } if (L === 'C2' && t > SP.c2_n3.t + 0.4) { st.mood = 'happy'; st.laugh = true; }
  if (L === 'FN' && t > ev('FN', 'arrive')) { st.mood = 'happy'; st.drop = 0; st.legs = true; st.headY = Math.abs(Math.sin(t * 7 + who.length)) * 16; st.armR = reach(G[who], 1, G[who].sw * 1.5, G[who].ySh - 300 + Math.sin(t * 8 + who.length) * 40); }
  return st; };

// ---------------- chunk timing (same rule as ep_kit: by word timings when they match, else by characters)
function chunkStarts(id) { const ch = (TL.cfg.chunks || {})[id], sp = SP[id]; if (!ch) return [sp.t]; const W8 = sp.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0), chars = ch.map(([en]) => en.length), ctot = chars.reduce((a, b) => a + b, 0);
  let wi = 0, ci = 0; return ch.map(([en], i) => { const a = W8.length === tot ? W8[wi][1] : sp.d * ci / ctot; wi += cnt[i]; ci += chars[i]; return sp.t + a; }); }
const CH = {}; for (const id of Object.keys(TL.cfg.chunks || {})) CH[id] = chunkStarts(id);
const chunkT = (id, i) => CH[id][i];

// ---------------- the wall screen: flashbacks (vertical episode look) and the speaker's log
const FBW = 540, FBH = 960, FB = createCanvas(FBW, FBH), fbx = FB.getContext('2d');
// which flashback plays on the wall screen at t (null = screen shows the court's standby slide)
function flashAt(t) {   // teaser: the party night plays full screen (see FLASH below), log1 = "No music!", log2 = "pump the brakes"
  if (inS(t, ev('EX', 'screen'), ev('EX', 'screen2'))) return 'log1';
  if (inS(t, ev('EX', 'screen2'), ev('EX', 'back2'))) return 'log2';
  return null; }
const FLOG = { pizza: ['EXHIBIT B', 'SAT · 01:06', 'FLAT 13'], log1: ['EXHIBIT A', 'SAT · 01:58', 'NEW USER: NO MUSIC'], log2: ['EXHIBIT A', 'SAT · 02:04', '"Turn it down"'], nana: ['EXHIBIT A', 'SAT · 02:05', '"Turn it UP"'] };
// party room in Rocky's flat, drawn into the 540x960 flashback canvas (colours/props from the "Neighbours" episode)
function drawFlash(kind, t) { const c = fbx; c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createLinearGradient(0, 0, 0, FBH); g.addColorStop(0, '#3A1E4A'); g.addColorStop(1, '#120A1E'); c.fillStyle = g; c.fillRect(0, 0, FBW, FBH);
  c.save(); c.globalCompositeOperation = 'lighter'; ['#FF4FA0', '#5BC0EB', '#F2C14E'].forEach((col, i) => { const a = Math.sin(t * (0.9 + i * 0.35) + i * 2) * 0.5 + (i - 1) * 0.35; c.save(); c.translate(140 + i * 130, 20); c.rotate(a); const gr = c.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, rgba(col, 0.35)); gr.addColorStop(1, rgba(col, 0)); c.fillStyle = gr; c.beginPath(); c.moveTo(-8, 0); c.lineTo(8, 0); c.lineTo(110, 900); c.lineTo(-110, 900); c.fill(); c.restore(); }); c.restore();
  c.fillStyle = '#EE5E9A'; c.save(); c.translate(80, 230); c.rotate(-0.05); c.fillRect(-55, -80, 110, 160); txt(c, 'THE', 0, -40, 18, '#1A0E24'); txt(c, 'NEIGH-', 0, -8, 16, '#1A0E24'); txt(c, 'BOURS', 0, 14, 16, '#1A0E24'); c.restore();
  c.fillStyle = '#B9C2CE'; c.beginPath(); c.arc(420, 120, 44, 0, TAU); c.fill(); for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { const v = hash(i * 13 + j * 7 + Math.floor(t * 6)); if (i * i + j * j > 10) continue; c.fillStyle = v > 0.7 ? '#FFFFFF' : '#8C96A4'; c.fillRect(420 + i * 12, 120 + j * 12, 9, 9); }
  for (let i = 0; i < 6; i++) { const x = 30 + i * 96, hop = Math.abs(Math.sin(t * 7 + i)) * 14; c.fillStyle = '#24102E'; c.beginPath(); c.ellipse(x, 690 - hop, 34, 70, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(x, 600 - hop, 30, 0, TAU); c.fill(); }
  c.fillStyle = '#4A2A5A'; c.fillRect(0, 760, FBW, 200);
  const S = 0.36, FY0 = 900, heads = {};
  const put = (who, cfg, st, x) => { c.save(); c.translate(x, FY0); c.scale(S, S); const r = human(c, cfg, st); c.restore(); heads[who] = { x: x + r.head.x * S, y: FY0 + r.head.y * S, hh: r.hh * S }; };
  const stool = (x) => { c.fillStyle = '#2B2F3A'; c.fillRect(x - 40, FY0 - 230, 80, 230); c.fillStyle = '#3A3F4B'; c.fillRect(x - 60, FY0 - 250, 120, 24); };
  const gh = G.herp, gn = G.nana, gr = G.rockyp;
  const herSt = { t, talk: talk('her', t), mood: 'tired', turn: 0.4, look: 0.8, armL: { a: 0.18, b: 0.35 }, armR: reach(gh, 1, gh.sw * 0.5, gh.ySh + 280), items: { R: pillowItem } };
  if (kind === 'pizza') { const rk = { t, talk: talk('rocky', t), mood: 'happy', turn: -0.35, look: -0.8, armL: reach(gr, -1, -gr.sw * 1.6, gr.ySh - 60), armR: reach(gr, 1, gr.sw * 0.6, gr.ySh + 300) };
    put('rocky', ROCKYP, rk, 390); herSt.mood = speaking('a1_fb', t, 0.1, 0.5) ? 'happy' : 'smug'; put('her', HERP, herSt, 150); return heads; }
  const fl = kind === 'log2' ? eBack(P(t, ev('EX', 'flamingo') - 0.2, ev('EX', 'flamingo') + 0.9), 1.3) * (t > ev('EX', 'flamingo') - 0.2 ? 1 : 0) : 0;
  if (fl > 0) { c.save(); c.translate(400, FY0); c.scale(S * 1.15, S * 1.15); flamingo(c, 0, 0, fl, t); c.restore(); }
  stool(285); homey(c, 285, FY0 - 250, S * 1.4, homeyLit(t), false, t); heads.homey = { x: 285, y: FY0 - 250 - 230 * S * 1.4, hh: 12 };
  if (kind === 'log1' || kind === 'log2') { herSt.mood = speaking('ex_f1', t) || speaking('ex_f2', t) || speaking('ex_f3', t) ? 'annoyed' : 'tired'; if (kind === 'log1' && t > SP.ex_h1.t + 0.3) herSt.mood = 'shock'; if (kind === 'log2' && t > endOf('ex_h4')) herSt.mood = 'shock'; if (fl > 0.5) herSt.mood = 'sad'; herSt.armL = reach(gh, -1, -gh.sw * 0.2, gh.ySh + 120); put('her', HERP, herSt, 120); }
  if (kind === 'log2' || kind === 'nana') { const nst = { t, talk: talk('nana', t), mood: 'happy', turn: -0.3, look: -0.7, armL: { a: 0.25, b: 0.6 }, armR: reach(gn, 1, gn.hw * 0.7, gn.headY + 140), items: { R: micItem }, front: hearingAid(gn, t + (kind === 'nana' ? 0 : 0)), headY: Math.abs(Math.sin(t * 3)) * 6 };
    if (speaking('ex_n', t, 0.1, 0.4) || speaking('c1_fb', t, 0.1, 0.4)) { nst.mood = 'annoyed'; nst.armL = reach(gn, -1, -gn.hw * 1.0, gn.headY + 10); }
    put('nana', NANA, nst, kind === 'nana' ? 280 : 470); if (kind === 'nana') { stool(110); homey(c, 110, FY0 - 250, S * 1.4, 0.2, false, t); } }
  Hq.grain(c, FBW, FBH, t, 0.05); return heads; }
// screen in world coords; content = standby slide / flashback (+ log panels) ; returns flashback heads in world coords
function wallScreen(c, t) { const { x, y, w, h } = SCR, x0 = x - w / 2, y0 = y - h / 2; let heads = {};
  c.fillStyle = '#2B2F3A'; rr(c, x0 - 30, y0 - 30, w + 60, h + 60, 18); c.fill(); c.fillStyle = '#12161F'; c.fillRect(x0, y0, w, h);
  const kind = flashAt(t);
  if (!kind) { const sg = c.createLinearGradient(0, y0, 0, y0 + h); sg.addColorStop(0, '#3A4660'); sg.addColorStop(1, '#2A3246'); c.fillStyle = sg; c.fillRect(x0, y0, w, h); c.fillStyle = 'rgba(242,212,136,.25)'; c.beginPath(); c.arc(x, y - 30, 120, 0, TAU); c.fill(); txt(c, 'COURT 2', x, y - 30, 56, '#F2D488'); txt(c, 'CASE 4B/0314', x, y + 150, 40, '#9AA8C4'); return heads; }
  const fh = h - 40, fw = fh * FBW / FBH, fx = x - fw / 2, fy = y0 + 20;
  const fbh = drawFlash(kind, t); c.drawImage(FB, fx, fy, fw, fh); c.strokeStyle = '#F2C14E'; c.lineWidth = 6; c.strokeRect(fx, fy, fw, fh);
  const sc = fh / FBH; for (const [k, v] of Object.entries(fbh)) heads[k] = { x: fx + v.x * sc, y: fy + v.y * sc, hh: v.hh * sc };
  const [a, b, q] = FLOG[kind]; c.fillStyle = '#E0474C'; rr(c, x0 + 30, y0 + 30, 300, 64, 12); c.fill(); txt(c, a, x0 + 180, y0 + 62, 32, '#FFFFFF');
  txt(c, b, x0 + 180, y0 + 160, 38, '#BFD3F2'); txt(c, q, x0 + w - 200, y0 + 160, 34, '#F2C14E');
  c.fillStyle = '#E0474C'; c.beginPath(); c.arc(x0 + w - 330, y0 + 62, 12 * (0.6 + 0.4 * Math.abs(Math.sin(t * 3))), 0, TAU); c.fill(); txt(c, 'PLAYBACK', x0 + w - 200, y0 + 62, 30, '#FFFFFF');
  return heads; }

// ---------------- the world
function seated(c, cfg, st, x) { c.save(); c.translate(x, 0); const r = human(c, cfg, st); c.restore(); return { x: x + r.head.x, y: r.head.y, hh: r.hh }; }
function put(c, cfg, st, x, y) { c.save(); c.translate(x, y); const r = human(c, cfg, st); c.restore(); return { x: x + r.head.x, y: y + r.head.y, hh: r.hh }; }
function wallClock(c, x, y, t) { c.save(); c.translate(x, y); paint(c, q => q.e(0, 0, 120, 120), '#FFFDF8', { sd: 4, hd: 2, lw: 6 }); c.strokeStyle = '#2B2F3A'; c.lineCap = 'round'; const m = 10 * 60 + 14 + t * 0.03, hA = (m / 60) / 12 * TAU, mA = (m % 60) / 60 * TAU; c.lineWidth = 12; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(hA) * 60, -Math.cos(hA) * 60); c.stroke(); c.lineWidth = 8; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(mA) * 95, -Math.cos(mA) * 95); c.stroke(); c.restore(); }
function partyLights(c, t, k) { if (k <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; ['#FF4FA0', '#5BC0EB', '#F2C14E', '#7CF29A'].forEach((col, i) => { const a = Math.sin(t * (0.8 + i * 0.3) + i) * 0.6; c.save(); c.translate(-2000 + i * 2400, -4300); c.rotate(a); const gr = c.createLinearGradient(0, 0, 0, 4400); gr.addColorStop(0, rgba(col, 0.3 * k)); gr.addColorStop(1, rgba(col, 0)); c.fillStyle = gr; c.beginPath(); c.moveTo(-30, 0); c.lineTo(30, 0); c.lineTo(900, 4400); c.lineTo(-900, 4400); c.fill(); c.restore(); }); c.restore(); }
function world(c, t, L, solo) {
  if (L === 'FN' && t > ev('FN', 'night')) return nightWorld(c, t, solo);
  c.drawImage(BGB, BX0, BY0, BW, BH); const heads = {};
  wallClock(c, -1700, -3600, t);
  const fh = wallScreen(c, t);
  // clean singles: only the subject is drawn (others keep a head position for bubbles); 'gallery' = the public gallery only
  const GSET = new Set(['nana', 'margot', 'jay', 'tony', 'kai', 'usher']), show = who => !solo || solo === who || (solo === 'gallery' && GSET.has(who));
  // judge + bench
  heads.reggie = show('reggie') ? put(c, JUDGE, judgeState(t, L), 0, JFY) : headW('reggie', 0, JFY);
  woodBox(c, BENCH.x0, BENCH.x1, BENCH.top, 0, '#6E4528'); c.fillStyle = '#C9A24A'; rr(c, -220, BENCH.top + 120, 440, 90, 12); c.fill(); txt(c, 'THE HON. JUDGE', 0, BENCH.top + 165, 30, '#2B2F3A');
  // witness box
  const wit = L === 'B1' && t > SP.b1_k.t - 0.1 ? 'kai' : L === 'B2' && t > ev('B2', 'margot') ? 'margot' : null;
  if (wit === 'kai') heads.kai = show('kai') ? put(c, KAI, kaiState(t, L), WITX, WFY) : headW('kai', WITX, WFY);
  if (wit === 'margot') heads.margot = show('margot') ? put(c, MARGOT, margotState(t, L), WITX, WFY) : headW('margot', WITX, WFY);
  rail(c, WITX - 330, WITX + 330, WFY - 720, 0); c.fillStyle = '#2B2F3A'; rr(c, WITX - 170, -260, 340, 70, 10); c.fill(); txt(c, 'WITNESS', WITX, -225, 34, '#F2D488');
  // evidence table + exhibits
  const nW = nanaWhere(t, L);
  if (nW === 'evid' && show('nana')) heads.nana = put(c, NANA, nanaState(t, L), EVX + 520, 0); else if (nW === 'evid') heads.nana = headW('nana', EVX + 520, 0);
  if (nW === 'bench') heads.nana = show('nana') ? put(c, NANA, nanaState(t, L), NBX, 0) : headW('nana', NBX, 0);   // verdict: Nana in front of the bench, feeding the judge
  woodBox(c, EVX - 380, EVX + 380, -560, 0, '#8A5A36');
  for (let i = 0; i < 5; i++) pizzaBox(c, EVX - 200, -590 - i * 38, 0.75);
  flamingo(c, EVX + 60, -590, 0); extinguisher(c, EVX + 280, -590, 0.85);
  homey(c, EVX - 20, -720, 0.95, homeyLit(t), true, t); heads.homey = { x: EVX - 20, y: -720 - 230 * 0.95, hh: 50 };
  // the dock + heroine
  heads.her = show('her') ? put(c, HER, herState(t, L), HERX, 0) : headW('her', HERX, 0);
  rail(c, HERX - 480, HERX + 480, -700, 0); c.fillStyle = '#2B2F3A'; rr(c, HERX - 150, -260, 300, 70, 10); c.fill(); txt(c, 'DOCK', HERX, -225, 34, '#F2D488');
  // claimant's table + Rocky
  heads.rocky = show('rocky') ? put(c, ROCKY, rockyState(t, L), RX, 0) : headW('rocky', RX, 0);
  woodBox(c, RX - 450, RX + 450, -560, 0, '#7A5232'); c.fillStyle = '#FFFDF8'; c.save(); c.translate(RX - 120, -600); c.rotate(-0.08); c.fillRect(-90, -24, 180, 30); c.restore();
  // gallery (seated behind the bench back) + usher
  if (show('nana') && nW === 'gallery' && (!solo || solo === 'nana' || solo === 'gallery')) heads.nana = seated(c, NANA, nanaState(t, L), SEAT.nana); else if (nW === 'gallery') heads.nana = headW('nana', SEAT.nana, 0, DROP);
  if (show('margot') && wit !== 'margot' && (!solo || solo === 'gallery')) seated(c, MARGOT, galleryState('margot', t, L), SEAT.margot);
  if (!solo || solo === 'gallery') { seated(c, BASE.jay, galleryState('jay', t, L), SEAT.jay); seated(c, BASE.tony, galleryState('tony', t, L), SEAT.tony); if (LEVELS.indexOf(L) > 2 || ['RC', 'VD', 'FN'].includes(L)) seated(c, KAI, galleryState('kai', t, L), SEAT.kai); }
  if (!(L === 'FN' && t > ev('FN', 'arrive'))) woodBox(c, GAL.x0, GAL.x1, GAL.top, 0, '#6E4528');
  if (!solo || solo === 'gallery') put(c, USHER, { t, mood: L === 'C2' && t > ev('C2', 'match') ? 'shock' : 'neutral', turn: -0.4, look: -0.8, armL: reach(G.usher, -1, -G.usher.sw * 0.6, G.usher.ySh + 360), armR: reach(G.usher, 1, G.usher.sw * 0.6, G.usher.ySh + 360), items: (t % 9) > 6.2 ? { R: boxItem(true) } : {} }, USHX, 0);
  // B1: Kai comes in through the door (then he is in the witness box)
  if (L === 'B1' && t > ev('B1', 'kai') && t < SP.b1_k.t - 0.1 && !solo) { const k = eIO(P(t, ev('B1', 'kai'), SP.b1_k.t - 0.1)); put(c, KAI, { t, mood: 'tired', turn: -0.6, look: -1, legPose: 'walk', armL: reach(G.kai, -1, -G.kai.sw * 0.5, G.kai.ySh + 340), armR: reach(G.kai, 1, G.kai.sw * 0.5, G.kai.ySh + 340) }, lerp(DOORX, DOORX - 1100, k), 0); }
  // finale: pizza couriers come in through the door
  if (L === 'FN' && t > ev('FN', 'arrive')) { const k = eOut(P(t, ev('FN', 'arrive'), ev('FN', 'arrive') + 1.6)); for (let i = 0; i < 2; i++) put(c, COUR, { t, mood: 'happy', turn: -0.6, look: -1, legPose: k < 1 ? 'walk' : 'stand', armL: reach(G.cour, -1, -G.cour.sw * 0.5, G.cour.ySh + 120), armR: reach(G.cour, 1, G.cour.sw * 0.5, G.cour.ySh + 120), items: { L: pizzaTower(8) } }, lerp(DOORX + 200, DOORX - 700 - i * 500, k), 0); }
  partyLights(c, t, L === 'FN' ? P(t, ev('FN', 'arrive') + 0.5, ev('FN', 'arrive') + 1.2) : 0);
  Object.assign(heads, fh);   // a flashback on the wall screen: its speakers' heads (bubbles point at the screen)
  return heads; }
// the night after: corridor, Rocky's door 13 opens, the judge with a microphone
function nightWorld(c, t, solo) { const X = NIGHTX, heads = {};
  const g = c.createLinearGradient(0, -3000, 0, 0); g.addColorStop(0, '#1A2E2D'); g.addColorStop(1, '#24403F'); c.fillStyle = g; c.fillRect(X - 3000, -3200, 6000, 3200);
  c.fillStyle = 'rgba(255,240,210,.05)'; for (let x = X - 3000; x < X + 3000; x += 120) c.fillRect(x, -2900, 40, 2100);
  const wg = c.createLinearGradient(0, -760, 0, 0); wg.addColorStop(0, '#4A3020'); wg.addColorStop(1, '#3A2418'); c.fillStyle = wg; c.fillRect(X - 3000, -760, 6000, 760); c.fillStyle = '#C9B89A'; c.fillRect(X - 3000, -790, 6000, 30);
  c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 6; for (let x = X - 3000; x < X + 3000; x += 320) c.strokeRect(x + 30, -700, 260, 620);
  for (const sx of [X - 900, X + 1700]) { const lg = c.createRadialGradient(sx, -1750, 10, sx, -1750, 520); lg.addColorStop(0, 'rgba(255,214,150,.35)'); lg.addColorStop(1, 'rgba(255,214,150,0)'); c.fillStyle = lg; c.fillRect(sx - 520, -2270, 1040, 1040); c.fillStyle = '#FFE6B0'; c.beginPath(); c.moveTo(sx - 55, -1700); c.lineTo(sx + 55, -1700); c.lineTo(sx + 35, -1800); c.lineTo(sx - 35, -1800); c.closePath(); c.fill(); }
  c.save(); c.translate(X - 1100, -1300); c.rotate(-0.03); c.fillStyle = '#FFFDF8'; c.fillRect(-150, -110, 300, 230); c.fillStyle = '#C23C4A'; c.fillRect(-150, -110, 300, 56); txt(c, 'NOTICE', 0, -82, 34, '#FFFFFF'); txt(c, 'QUIET HOURS', 0, -10, 30, '#2B2F3A'); txt(c, '23:00–07:00', 0, 48, 40, '#2B2F3A'); c.restore();
  c.fillStyle = '#3A281C'; c.fillRect(X - 3000, 0, 6000, 900); c.fillStyle = '#6A1E2A'; c.fillRect(X - 3000, 90, 6000, 360);
  const d0 = X + 700, open = eOut(P(t, SP.fn_x.t - 0.55, SP.fn_x.t - 0.15));
  // inside door 13: party lights
  c.save(); c.beginPath(); c.rect(d0 - 420, -2200, 840, 2200); c.clip(); const ig = c.createLinearGradient(0, -2200, 0, 0); ig.addColorStop(0, '#3A1E4A'); ig.addColorStop(1, '#120A1E'); c.fillStyle = ig; c.fillRect(d0 - 420, -2200, 840, 2200);
  partyLightsAt(c, d0, t); if (open > 0.2) { flamingo(c, d0 + 230, 0, 1, t); heads.reggie = put(c, JUDGE, { t, talk: talk('reggie', t), mood: 'happy', turn: -0.3, look: -0.8, front: wig(G.reggie), armR: reach(G.reggie, 1, G.reggie.hw * 0.8, G.reggie.headY + 160), items: { R: micItem }, armL: reach(G.reggie, -1, -G.reggie.sw * 1.6, G.reggie.ySh - 100) }, d0 - 60, 0); } else heads.reggie = headW('reggie', d0 - 60, 0);
  c.restore();
  // door leaf (swings open) + number
  c.save(); c.translate(d0 - 420, 0); c.scale(lerp(1, 0.12, open), 1); c.fillStyle = '#2B2F3A'; c.fillRect(0, -2200, 840, 2200); c.fillStyle = '#3A3F4B'; c.fillRect(80, -2080, 680, 900); c.fillRect(80, -1080, 680, 900); c.restore();
  c.fillStyle = '#C9A06A'; rr(c, d0 - 120, -2420, 240, 150, 16); c.fill(); txt(c, '13', d0, -2345, 90, '#2B2F3A');
  if (open < 1) for (let i = 0; i < 5; i++) { const ph = (t * 0.5 + i / 5) % 1; c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * 0.8; txt(c, '♪', d0 - 300 + i * 150 + Math.sin(t * 3 + i) * 30, -300 - ph * 1500, 120, ['#EE5E9A', '#8E78C8', '#E9A23B'][i % 3]); c.restore(); }
  // her (pyjamas, sleep mask up) knocking
  const gh = G.herp, kn = TL.sfx.filter(s => s.n === 'knock' && t > s.t - 0.1 && t < s.t + 0.15).length > 0;
  heads.her = put(c, HERP, { t, mood: open > 0.5 ? 'shock' : 'tired', turn: 0.4, look: 0.8, armL: { a: 0.18, b: 0.35 }, armR: { ...reach(gh, 1, gh.sw * (kn ? 2.6 : 2.2), gh.ySh + 40), fist: true }, items: { L: pillowItem } }, X - 300, 0);
  return heads; }
function partyLightsAt(c, x, t) { c.save(); c.globalCompositeOperation = 'lighter'; ['#FF4FA0', '#5BC0EB', '#F2C14E'].forEach((col, i) => { const a = Math.sin(t * (0.9 + i * 0.35) + i * 2) * 0.5; c.save(); c.translate(x - 300 + i * 300, -2200); c.rotate(a); const gr = c.createLinearGradient(0, 0, 0, 2200); gr.addColorStop(0, rgba(col, 0.4)); gr.addColorStop(1, rgba(col, 0)); c.fillStyle = gr; c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.lineTo(400, 2200); c.lineTo(-400, 2200); c.fill(); c.restore(); }); c.restore(); }

// =============================================================================================== teaser (9:16) from here
const { Image } = require('@napi-rs/canvas');
const COVER = (() => { try { const im = new Image(); im.src = fs.readFileSync('../releases/trial/trial_cover.png'); return im; } catch (e) { return null; } })();
const sev = (sid, k) => ev(sid, k);
// Nana in the gallery for the teaser gag: chewing a sausage roll -> freezes and stares -> fiddles with the hearing aid -> "can't hear" -> chews on
const sausageItem = (ctx) => { ctx.rotate(-0.4); paint(ctx, q => { q.m(-60, -22); q.q(-74, 0, -60, 22); q.l(60, 22); q.q(74, 0, 60, -22); q.z(); }, '#E2A65A', { sd: 4, hd: 2, lw: 3, inner: k => { k.fillStyle = '#B0603A'; k.fillRect(-44, -10, 88, 20); } }); };
const _nanaBase = nanaState;
nanaState = function (t, L) { const st = _nanaBase(t, L); if (L !== 'NN' && L !== 'NN2' && L !== 'LOG') return st; const g = G.nana;
  const fr = sev('NN', 'freeze'), aid = sev('NN', 'aid'), n0 = SP.nn_n.t, n1 = endOf('nn_n');
  const chew = () => { st.talk = 0.25 + 0.25 * Math.abs(Math.sin(t * 9)); st.armR = reach(g, 1, g.hw * 0.4, g.headY + 190 + Math.sin(t * 9) * 8); st.items = { R: sausageItem }; };
  st.turn = 0.2; st.look = 0.6; st.mood = 'happy';
  if (L === 'LOG' || t < fr) { chew(); st.squint = true; }
  if (L === 'NN' && t >= fr && t < aid) { st.armR = reach(g, 1, g.hw * 0.4, g.headY + 190); st.items = { R: sausageItem }; st.talk = 0; st.mood = 'surprised'; st.look = -1; st.turn = -0.3; }   // freeze: stares at her
  if (L === 'NN' && t >= aid && t < n0 + 0.2) { st.mood = 'neutral'; st.look = -0.4; st.armL = reach(g, -1, g.hw * 0.2, g.headY + 30); st.armR = reach(g, 1, g.hw * 1.05, g.headY + 20); st.items = { R: sausageItem }; }   // hand to the hearing aid
  if (L === 'NN' && t >= n0 + 0.2) { st.mood = 'happy'; st.look = 0.3; st.armR = reach(g, 1, g.sw * 1.2, g.ySh + 200); st.items = { R: sausageItem }; }
  if (L === 'NN2' || (L === 'NN' && t > n1 + 0.1)) { chew(); st.look = 0.9; st.turn = 0.35; st.squint = true; st.headY = Math.sin(t * 9) * 5; st.talk = 0.35 + 0.3 * Math.abs(Math.sin(t * 9)); }   // looks away, chews on
  return st; };
// her: looks at the gallery when she asks Nana; a hard stare after Nana's "can't hear"
const _herBase = herState;
herState = function (t, L) { const st = _herBase(t, L), g = G.her;
  if (L === 'LOG' && speaking('log_her', t, 0.1)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 0.3, g.ySh + 110); }
  if (L === 'NN') { st.mood = speaking('nn_her', t, 0.1) ? 'skeptical' : 'surprised'; st.look = 1; st.turn = 0.45; }
  if (L === 'NN2') { st.mood = 'skeptical'; st.look = 1; st.turn = 0.45; st.squint = true; }
  if (L === 'END') st.mood = 'shock';
  return st; };

// ---------------- camera: portrait singles and inserts, hard cuts by meaning
const single = (hd, sx, sy, z, tag) => ({ x: hd.x + (W / 2 - sx) / z, y: hd.y + (HH / 2 - sy) / z, z, r: 0, tag });
const H_HER = headW('her', HERX + 30, 0), H_J = headW('reggie', 0, JFY), H_R = headW('rocky', RX - 30, 0), H_NG = headW('nana', SEAT.nana + 20, 0, DROP);
const SH = {
  HER: single(H_HER, 540, 900, 1.0, 'her'), HER_CU: single(H_HER, 540, 1000, 1.4, 'her'), HER_R: single(H_HER, 540, 1080, 1.1, 'her'),
  JUDGE: single(H_J, 540, 880, 0.95, 'reggie'), JUDGE_CU: single(H_J, 540, 1000, 1.35, 'reggie'),
  ROCKY: single(H_R, 540, 900, 0.95, 'rocky'), ROCKY_CU: single(H_R, 540, 1000, 1.3, 'rocky'),
  NANA_G: single(H_NG, 540, 960, 1.2, 'nana'), NANA_CU: single(H_NG, 540, 1020, 1.75, 'nana'),
  GALLERY: { x: 4150, y: -1050, z: 0.5, r: 0, tag: 'gallery' }, DOCK: { x: HERX + 250, y: -1100, z: 0.55, r: 0 },
};
const CUTS = []; const cut = (t, name) => { if (t < 1e8) CUTS.push([t, name]); };
const line = id => SP[id].t - 0.1;
const wordAt = (id, i) => SP[id].t + (SP[id].words[i] || [0, 0])[1];
(function plan() {
  // HOOK: gavel -> £1,240 -> her face -> Rocky lists the charges, each with its own object shot
  cut(0, 'JUDGE'); cut(line('hook_her'), 'HER_CU'); cut(line('hook_x2'), 'ROCKY');
  const w = SP.hook_x2.words, at = k => SP.hook_x2.t + w[k][1] - 0.05;   // "Forty pizzas. One giant flamingo. One fire extinguisher. All at three fourteen a.m."
  cut(at(0), 'INS_PIZZA'); cut(at(2), 'INS_FLAMINGO'); cut(at(5), 'INS_EXT'); cut(at(8), 'INS_CLOCK');
  // EX: exhibit A -> the party night, full screen
  cut(SC.EX.s, 'INS_NIGHT'); cut(line('ex_x'), 'ROCKY'); cut(sev('EX', 'screen'), 'FLASH'); cut(sev('EX', 'back2'), 'JUDGE_CU'); cut(line('ex_her'), 'HER_CU');
  // LOG: the 03:14 recording -> Rocky -> everybody points at her -> her denial
  cut(SC.LOG.s, 'INS_LOG'); cut(line('log_x'), 'ROCKY'); cut(chunkT('log_x', 1) + 0.6, 'GALLERY'); cut(line('log_her'), 'HER_CU');
  // NN: she asks Nana; Nana freezes, the hearing aid, "can't hear", chews on; her stare
  cut(line('nn_her'), 'HER'); cut(sev('NN', 'freeze'), 'NANA_CU'); cut(SC.NN2.s + 0.9, 'HER_R');
  // RC: exhibit C -> the judge -> her -> the record stands -> Rocky -> silence on her face
  cut(SC.RC.s, 'INS_RECEIPT'); cut(line('rc_j') + 1.0, 'JUDGE'); cut(line('rc_her'), 'HER_CU'); cut(line('rc_j3'), 'JUDGE_CU'); cut(line('rc_x2'), 'ROCKY_CU'); cut(sev('RC', 'stop'), 'HER_R');
  cut(SC.END.s, 'INS_END');
  CUTS.sort((a, b) => a[0] - b[0]);
})();
function shotName(t) { let n = 'JUDGE'; for (const [ct, name] of CUTS) { if (ct <= t) n = name; else break; } return n; }
const isInsert = n => n.startsWith('INS_') || n === 'FLASH';
function shotFor(t) { const n = shotName(t); if (isInsert(n)) return { ...SH.DOCK, x: -99999, force: true, tag: n }; return { ...SH[n], force: true }; }
const CAM = E.simulateCamera(TL, shotFor, {});
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(W / 2 + sh.x, HH / 2 + sh.y); c.rotate(sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, ['her', 'reggie', 'rocky', 'nana', 'gallery'].includes(cam.tag) ? cam.tag : null); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts (object shots on a solid backdrop, 9:16)
function backdrop(c) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#3B3550'); g.addColorStop(1, '#1F1B2C'); c.fillStyle = g; c.fillRect(0, 0, W, HH); }
function paper(c, x, y, w, h, rot, col = '#FFFDF8') { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, -w / 2 + 14, -h / 2 + 18, w, h, 16); c.fill(); c.fillStyle = col; rr(c, -w / 2, -h / 2, w, h, 16); c.fill(); return () => c.restore(); }
function tag(c, s, y, col = '#E0474C', sz = 64) { c.save(); c.translate(540, y); c.rotate(-0.03); UI.textFit(c, 'Unb9', sz, s, 920); const w = c.measureText(s).width + 80; c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 8, -sz * 0.9 + 10, w, sz * 1.8, 26); c.fill(); c.fillStyle = col; rr(c, -w / 2, -sz * 0.9, w, sz * 1.8, 26); c.fill(); c.strokeStyle = C.white; c.lineWidth = 6; rr(c, -w / 2, -sz * 0.9, w, sz * 1.8, 26); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 0, 3); c.restore(); }
function insSum(c, t) { backdrop(c); const a = sev('hook', 'sum'), k = eBack(P(t, a, a + 0.3), 2.4), pk = 1 + 0.03 * Math.sin(t * 9);
  const done = paper(c, 540, 900, 900, 700, -0.04); txt(c, 'CLAIM · COURT 2', 0, -250, 44, '#7A8290', 'Unb9'); c.save(); c.scale(lerp(2.2, 1, Math.min(1, k)) * pk, lerp(2.2, 1, Math.min(1, k)) * pk); txt(c, '£1,240', 0, 20, 190, '#E0474C'); c.restore(); txt(c, 'FLAT 13  →  FLAT 14', 0, 230, 36, '#2B2F3A', 'Nun9'); done(); }
function insObj(c, t, kind) { backdrop(c); const t0 = CUTS.find(x => x[1] === kind)[0], k = eBack(P(t, t0, t0 + 0.25), 2);
  c.save(); c.translate(540, 1150); c.scale(k, k);
  if (kind === 'INS_PIZZA') { for (let i = 0; i < 9; i++) pizzaBox(c, (i % 2) * 30 - 15, -i * 64, 1.6); c.restore(); tag(c, '40 × PIZZA', 420); return; }
  if (kind === 'INS_FLAMINGO') { c.translate(0, 300); flamingo(c, -40, 0, 1, t); c.restore(); tag(c, '1 × GIANT FLAMINGO', 420, '#EE5E9A'); return; }
  if (kind === 'INS_EXT') { extinguisher(c, 0, 120, 2.2); c.restore(); tag(c, '1 × FIRE EXTINGUISHER', 420); return; }
  c.translate(0, -250); paint(c, q => q.e(0, 0, 300, 300), '#FFFDF8', { sd: 6, hd: 3, lw: 10 }); c.strokeStyle = '#2B2F3A'; c.lineCap = 'round'; const hA = (3 + 14 / 60) / 12 * TAU, mA = 14 / 60 * TAU;
  c.lineWidth = 26; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(hA) * 150, -Math.cos(hA) * 150); c.stroke(); c.lineWidth = 16; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(mA) * 230, -Math.cos(mA) * 230); c.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(Math.sin(a) * 260, -Math.cos(a) * 260, 12, 0, TAU); c.fill(); } c.restore(); tag(c, '03:14 НОЧИ', 1480, '#2B3A67'); }
function insNight(c, t) { backdrop(c); const a = SC.EX.s, k = eBack(P(t, a, a + 0.3), 2); c.save(); c.translate(540, 900); c.scale(k, k); UI.font(c, 'Unb9', 110); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'НОЧЬ', 0, -80, C.pink, C.white, 14); UI.strokeText(c, 'ВЕЧЕРИНКИ', 0, 60, C.white, C.oliveD, 14); txt(c, 'SAT · 01:58', 0, 200, 46, '#9AA8C4', 'Unb9'); c.restore(); }
// the party night: the trial's flashback canvas (540x960, same drawing) shown full screen
function insFlash(c, t) { const kind = flashAt(t) || 'log2', fbh = drawFlash(kind, t); c.drawImage(FB, 0, 0, W, HH);
  const [a, b, q] = FLOG[kind]; c.fillStyle = '#E0474C'; rr(c, 40, 170, 260, 60, 12); c.fill(); txt(c, a, 170, 201, 30, '#FFFFFF'); txt(c, b, 330, 201, 32, '#FFFFFF', 'Unb9', 'left');
  c.fillStyle = '#E0474C'; c.beginPath(); c.arc(W - 220, 201, 12 * (0.6 + 0.4 * Math.abs(Math.sin(t * 3))), 0, TAU); c.fill(); txt(c, 'PLAYBACK', W - 200, 201, 28, '#FFFFFF', 'Unb9', 'left');
  const s = W / FBW, heads = {}; for (const [k, v] of Object.entries(fbh)) heads[k] = { x: v.x * s, y: v.y * s, hh: v.hh * s }; return heads; }
function insLog(c, t) { backdrop(c); const a = sev('LOG', 'log'); c.save(); c.translate(540, 900); c.fillStyle = '#12161F'; rr(c, -480, -560, 960, 1120, 36); c.fill(); c.strokeStyle = '#2E8C86'; c.lineWidth = 6; rr(c, -480, -560, 960, 1120, 36); c.stroke();
  txt(c, 'HOMEY · VOICE LOG', 0, -480, 40, '#5BE0E6'); txt(c, 'SAT · 03:14', 0, -410, 64, '#E0474C'); homey(c, 0, -80, 1.15, 0.8 + 0.2 * Math.sin(t * 9), false, t);
  for (let i = 0; i < 44; i++) { const h = 10 + Math.abs(Math.sin(i * 1.7 + t * 8) * Math.sin(i * 0.37)) * 110; c.fillStyle = 'rgba(91,224,230,.75)'; c.fillRect(-420 + i * 19.5, 60 - h / 2, 11, h); }
  const words = ['BOX!', 'FORTY', 'PIZZA!', 'GIRL', 'HUNGRY!']; words.forEach((wd, i) => { const k = eBack(P(t, a + 0.75 + i * 0.32, a + 0.95 + i * 0.32), 2); if (k <= 0) return; c.save(); c.translate(i < 3 ? (i - 1) * 290 : (i - 3.5) * 340, i < 3 ? 210 : 310); c.scale(k, k); txt(c, wd, 0, 0, 70, '#FFFFFF'); c.restore(); });
  const k = eBack(P(t, endOf('log_rec') + 0.05, endOf('log_rec') + 0.35), 2); if (k > 0) { c.save(); c.translate(0, 450); c.scale(k, k); c.fillStyle = '#E0474C'; rr(c, -330, -54, 660, 108, 22); c.fill(); txt(c, 'ORDER CONFIRMED', 0, 3, 52, '#FFFFFF'); c.restore(); }
  c.restore(); }
function insReceipt(c, t) { backdrop(c); const a = sev('RC', 'receipt'); const done = paper(c, 540, 1040, 860, 1000, 0.03);
  txt(c, 'PIZZA ROMA', 0, -400, 66, '#2B2F3A'); txt(c, 'DELIVERY RECEIPT', 0, -335, 34, '#7A8290', 'Nun9');
  c.setLineDash([10, 10]); c.strokeStyle = '#9A9488'; c.lineWidth = 3; c.beginPath(); c.moveTo(-370, -285); c.lineTo(370, -285); c.stroke(); c.setLineDash([]);
  const rows = [['40 × MARGHERITA', 56, '#2B2F3A'], ['CUSTOMER: MS NO MUSIC', 50, '#2B2F3A'], ['TIME: 03:14', 50, '#2B2F3A'], ['DELIVERY NOTE:', 32, '#7A8290'], ['EVERYONE LOOKS HUNGRY', 32, '#7A8290']];
  rows.forEach(([s2, sz, col], i) => { const k = eBack(P(t, a + 0.1 + i * 0.12, a + 0.3 + i * 0.12), 2); if (k <= 0) return; const y = -200 + i * 110 - (i > 3 ? 60 : 0);
    if (i === 1 && t > a + 0.9) { const mk = eOut(P(t, a + 0.9, a + 1.25)); UI.textFit(c, 'Unb9', sz, s2, 780); const w2 = c.measureText(s2).width; c.fillStyle = 'rgba(242,193,78,.55)'; rr(c, -w2 / 2 - 14, y - 36, (w2 + 28) * mk, 72, 12); c.fill(); }
    c.save(); c.translate(0, y); c.scale(k, k); fitTxt(c, s2, 0, 0, sz, col, 780, i > 2 ? 'Nun9' : 'Unb9'); c.restore(); });
  c.setLineDash([10, 10]); c.beginPath(); c.moveTo(-370, 360); c.lineTo(370, 360); c.stroke(); c.setLineDash([]); txt(c, 'TOTAL £520', 0, 420, 48, '#2B2F3A'); c.save(); c.translate(220, 270); c.rotate(-0.15); c.strokeStyle = '#E0474C'; c.lineWidth = 8; rr(c, -170, -46, 340, 92, 14); c.stroke(); txt(c, 'EXHIBIT C', 0, 3, 44, '#E0474C'); c.restore(); done(); }
// the end: one question card, then the cover of THE TRIAL and where to watch
function insEnd(c, t) { const a = SC.END.s, u = t - a, cv = (K.wordT('end_nar', 'узнай') || a + 2.4) - a - 0.25; backdrop(c);   // question card while the narrator asks, the cover from «Узнай…»
  if (u < cv) { const k = eBack(P(u, 0.05, 0.4), 2.2); c.save(); c.translate(540, 920); c.rotate(-0.04); c.scale(k, k); UI.font(c, 'Unb9', 96); c.textAlign = 'center'; c.textBaseline = 'middle';
    UI.strokeText(c, 'НО КТО', 0, -170, C.white, C.oliveD, 16); UI.strokeText(c, 'ЗАКАЗАЛ', 0, -40, C.white, C.oliveD, 16); UI.font(c, 'Unb9', 140); UI.strokeText(c, '40 ПИЦЦ?!', 0, 120, C.pink, C.white, 16); c.restore(); return; }
  const k = eBack(P(u, cv, cv + 0.4), 1.8);
  c.save(); c.translate(540, 820); c.scale(k, k); c.rotate(-0.02); const cw = 960, ch = 540; c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, -cw / 2 + 12, -ch / 2 + 16, cw, ch, 26); c.fill();
  if (COVER) { c.save(); rr(c, -cw / 2, -ch / 2, cw, ch, 26); c.clip(); c.drawImage(COVER, -cw / 2, -ch / 2, cw, ch); c.restore(); } c.strokeStyle = C.white; c.lineWidth = 8; rr(c, -cw / 2, -ch / 2, cw, ch, 26); c.stroke();
  c.fillStyle = '#FF0033'; rr(c, -70, -48, 140, 96, 28); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-18, -26); c.lineTo(30, 0); c.lineTo(-18, 26); c.closePath(); c.fill(); c.restore();
  const k2 = eBack(P(u, cv + 0.3, cv + 0.65), 2.2); if (k2 > 0) { c.save(); c.translate(540, 1240); c.scale(k2, k2); UI.font(c, 'Unb9', 84); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'РАЗВЯЗКА', 0, -60, C.white, C.oliveD, 14); UI.strokeText(c, 'НА YOUTUBE', 0, 50, '#FF4D6A', C.white, 14); c.restore(); }
  const k3 = eOut(P(u, cv + 0.7, cv + 1.0)); if (k3 > 0) { c.save(); c.globalAlpha = k3; txt(c, 'SPEAK IN ENGLISH', 540, 1450, 56, '#F2C14E'); txt(c, 'ссылка в профиле', 540, 1530, 40, '#FFFFFF', 'Nun9'); c.restore(); } }
const INSERTS = { INS_SUM: insSum, INS_PIZZA: (c, t) => insObj(c, t, 'INS_PIZZA'), INS_FLAMINGO: (c, t) => insObj(c, t, 'INS_FLAMINGO'), INS_EXT: (c, t) => insObj(c, t, 'INS_EXT'), INS_CLOCK: (c, t) => insObj(c, t, 'INS_CLOCK'), INS_NIGHT: insNight, INS_LOG: insLog, INS_RECEIPT: insReceipt, INS_END: insEnd };

// the claim over the judge's opening line: counts up to £1,240 with the register, lands with a stamp
function sumStamp(c, t) { const a = sev('hook', 'sum'); if (t < a) return; const u = P(t, a, a + 1.0), v = Math.round(1240 * eOut(u) / 10) * 10, k = eBack(P(t, a, a + 0.25), 2.4), st = P(t, a + 2.15, a + 2.3);
  c.save(); c.translate(540, 1440); c.rotate(-0.06); c.scale(k * lerp(1.25, 1, st), k * lerp(1.25, 1, st)); c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, -400 + 10, -120 + 14, 800, 240, 30); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -400, -120, 800, 240, 30); c.fill(); c.strokeStyle = '#E0474C'; c.lineWidth = 12; rr(c, -400, -120, 800, 240, 30); c.stroke();
  txt(c, 'CLAIM', 0, -72, 34, '#7A8290'); txt(c, '£' + (v >= 1000 ? Math.floor(v / 1000) + ',' + String(v % 1000).padStart(3, '0') : v), 0, 28, 150, '#E0474C'); c.restore(); }
// ---------------- HUD: claim badge, the three English phrases (short plates, no narrator), watermark
function claim(c, t, sc) { if (sc.id === 'END' || (sc.id === 'hook' && t < SP.hook_her.t)) return; c.save(); c.translate(36, 170); c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, 6, 8, 300, 68, 34); c.fill(); c.fillStyle = '#E0474C'; rr(c, 0, 0, 300, 68, 34); c.fill(); c.strokeStyle = C.white; c.lineWidth = 4; c.stroke(); txt(c, 'ИСК', 62, 35, 26, '#FFFFFF', 'Unb9'); txt(c, '£1,240', 196, 36, 38, '#FFFFFF', 'Unb9'); c.restore(); }
const PHRASES = [['B1', "That's not my voice!", '= Это не мой голос!', () => [endOf('log_her') + 0.15, SC.LOG.e + 0.05]], ['B2', "There's been a mistake.", '= Произошла ошибка.', () => [SP.rc_her.t + 1.0, SP.rc_j3.t - 0.15]], ['', 'pump the brakes', '= притормозить (а колонка «накачала»)', () => [SP.ex_x3.t + 0.1, SC.EX.e - 0.1]]];
function phrase(c, t) { for (const [lv, en, ru, span] of PHRASES) { const [a, b] = span(); if (t < a || t > b) continue; const k = eBack(P(t, a, a + 0.25), 2) * (1 - eIn(P(t, b - 0.2, b)));
  c.save(); c.translate(540, 1470); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -470 + 8, -88 + 10, 940, 176, 30); c.fill(); c.fillStyle = C.white; rr(c, -470, -88, 940, 176, 30); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke();
  let x0 = -420; if (lv) { c.fillStyle = LVCOL[lv]; rr(c, x0, -34 - 22, 96, 68, 18); c.fill(); txt(c, lv, x0 + 48, -22, 34, '#FFFFFF'); x0 += 120; }
  fitTxt(c, en, x0, -22, 52, C.oliveD, 420 - x0, 'Nun9', 'left'); fitTxt(c, ru, -420, 46, 32, C.pink, 840, 'Nun9', 'left'); c.restore(); } }

// ---------------- frame
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  const n = shotName(t), f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  let heads = {}, M = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  if (n === 'FLASH') heads = insFlash(c, t);
  else if (isInsert(n)) INSERTS[n](c, t);
  else { const r = drawWorld(c, t, L, cam, sh); heads = r.heads; M = r.M; Hq.vignette(c, W, HH, 0.24); }
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  if (isInsert(n) && n !== 'FLASH') for (const who of ['her', 'reggie', 'rocky', 'nana', 'homey']) heads[who] = { x: W + 9999, y: 0, hh: 0 };   // speakers off screen -> bubble at the top
  if (n === 'FLASH') for (const who of ['reggie', 'rocky']) heads[who] = { x: W + 9999, y: 0, hh: 0 };
  if (L !== 'END') K.bubbles(c, t, sc, heads, proj, { names: NAMES, hold: { log_x: -0.15, rc_x2: 0.9, nn_n: 0.25 } });
  if (L === 'NN' && n === 'NANA_CU' && t > sev('NN', 'aid') && t < SP.nn_n.t + 0.3) K.pop(c, t, 'КЛИК', sev('NN', 'aid') + 0.05, SP.nn_n.t, 760, 620, C.white, 0.1, 60);
  if (L === 'NN2' && n === 'NANA_CU') K.pop(c, t, 'ЧАВК-ЧАВК', SC.NN2.s - 0.1, SC.NN2.s + 0.8, 540, 1500, C.gold, -0.06, 70);
  if (L === 'LOG' && n === 'GALLERY') K.pop(c, t, 'ЭТО ОНА!', sev('LOG', 'look') - 0.6, SP.log_her.t - 0.15, 540, 1500, '#E0474C', -0.06, 80);
  if (L === 'hook' && n === 'JUDGE') sumStamp(c, t); phrase(c, t); UI.sparkles(c, t); Hq.grain(c, W, HH, t, 0.035); if (!isInsert(n)) claim(c, t, sc); if (L !== 'END') UI.watermark(c);
  if (process.env.ANIMATIC) { const s = `АНИМАТИК · ${t.toFixed(1)} · ${L} · ${n}`; c.save(); c.font = '24px Nun9'; const w = c.measureText(s).width + 32; c.fillStyle = 'rgba(0,0,0,.55)'; rr(c, 24, HH - 64, w, 40, 20); c.fill(); c.fillStyle = '#FFFFFF'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(s, 40, HH - 44); c.restore(); }
}
E.run('pizzas', NF, renderFrame, W, HH);
