// "Wrong chat — she texted her boss by accident" episode renderer: node wrongchat.js start end out.mp4 | --png=f1,f2
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, mix, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/wrongchat/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags(); SP.c2_her.fs = 40;
const { talk, speaking, endOf, EV, put } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);

// ---------------- cast & layout
const HER = { ...BASE.her_london, top: { type: 'blazer', col: '#2E8C86', shirt: '#FFFFFF', tie: '#FFFFFF' }, bottom: { type: 'trousers', col: '#2B2F3A' } };
const GRANT = { ...BASE.greg, top: { type: 'blazer', col: '#2B3A67', tie: '#F2C14E' }, bottom: { type: 'trousers', col: '#2B3A67' }, shoes: { col: '#1A1A1A', acc: null } };
const G = { her: geom(HER), grant: geom(GRANT) };
const FY = 60, HERX = -300, GX = 380, HDESK = { x0: -800, x1: -500, top: -560 }, GDESK = { x0: 560, x1: 900, top: -620 };
const herHY = FY + G.her.headY, gHY = FY + G.grant.headY;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const win = (t, a, b, inD = 0.3) => eBack(P(t, a, a + inD), 1.6) * (1 - eIn(P(t, b - 0.22, b)));

// Grant ages during the C2 speech (hair, moustache and brows go white)
function grantCfg(t, L) { const k = L === 'C2' ? eIO(P(t, SP.c2_her.t + 1.0, endOf('c2_her') - 0.5)) : 0; if (k <= 0) return GRANT; const wh = '#ECE9E4';
  return { ...GRANT, age: lerp(0.6, 1, k), hair: { ...GRANT.hair, col: mix(GRANT.hair.col, wh, k) }, mustache: mix(GRANT.mustache, wh, k), brow: mix(GRANT.brow, '#DAD6D0', k) }; }

// ---------------- open-plan office (prerendered, softly blurred)
const BX0 = -1700, BY0 = -3500, BW = 3500, BH = 4200, BS = 0.5;
function drawOffice(c) {
  c.fillStyle = '#E3E9EF'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,255,255,.35)'; for (let x = BX0; x < BX0 + BW; x += 260) c.fillRect(x, BY0, 130, FY - BY0);
  c.fillStyle = '#C7D2DD'; c.fillRect(BX0, -520, BW, 580); c.fillStyle = '#B4C0CC'; c.fillRect(BX0, -540, BW, 22);
  // big window (the drone comes in here)
  c.fillStyle = '#FFFFFF'; c.fillRect(-260, -2380, 760, 1000); const sg = c.createLinearGradient(0, -2350, 0, -1410); sg.addColorStop(0, '#8FC3EA'); sg.addColorStop(1, '#D8ECF7'); c.fillStyle = sg; c.fillRect(-235, -2355, 710, 950);
  c.fillStyle = '#9FB6CC'; for (let i = 0; i < 8; i++) { const h = 220 + hash(i * 5) * 380; c.fillRect(-225 + i * 88, -1410 - h, 72, h); } c.fillStyle = '#FFFFFF'; c.fillRect(110, -2355, 16, 950); c.fillRect(-235, -1900, 710, 14);
  // poster above her desk
  c.fillStyle = '#2B2F3A'; c.fillRect(-1010, -2250, 520, 400); c.fillStyle = '#F2C14E'; c.fillRect(-990, -2230, 480, 360); txt(c, 'THINK', -750, -2150, 74, '#2B2F3A'); txt(c, 'BEFORE', -750, -2060, 74, '#2B2F3A'); txt(c, 'YOU SEND', -750, -1960, 64, '#E0474C');
  // team board behind Grant
  c.fillStyle = '#FFFDF8'; c.fillRect(800, -2150, 600, 420); c.strokeStyle = '#9AA3B2'; c.lineWidth = 8; c.strokeRect(800, -2150, 600, 420); txt(c, 'Q3 TARGETS', 1100, -2090, 40, '#2B3A67');
  c.strokeStyle = '#4CAF6A'; c.lineWidth = 12; c.beginPath(); c.moveTo(850, -1790); c.lineTo(980, -1850); c.lineTo(1110, -1820); c.lineTo(1250, -1960); c.lineTo(1350, -1900); c.stroke();
  // plants
  for (const px of [-1350, 1500]) { c.fillStyle = '#C96A3A'; c.fillRect(px - 90, -260, 180, 320); c.fillStyle = '#3C8A4A'; for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(px + Math.cos(i * 2.4) * 90, -420 + Math.sin(i * 2.4) * 120, 80, 36, i, 0, TAU); c.fill(); } }
  const fg = c.createLinearGradient(0, FY, 0, 700); fg.addColorStop(0, '#8E8A86'); fg.addColorStop(1, '#6E6A66'); c.fillStyle = fg; c.fillRect(BX0, FY, BW, BY0 + BH - FY);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawOffice(c); }

// ---------------- props
function clock(c, x, y, t, L) { c.save(); c.translate(x, y); paint(c, q => q.e(0, 0, 90, 90), '#FFFDF8', { sd: 4, hd: 2, lw: 5 }); c.strokeStyle = '#2B2F3A'; c.lineCap = 'round';
  let m = 2 + t * 0.03; if (L === 'C2' && t > SP.c2_her.t) m += (Math.min(endOf('c2_her'), t) - SP.c2_her.t) * 22; const hA = (11 + m / 60) / 12 * TAU, mA = m / 60 * TAU;
  c.lineWidth = 9; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(hA) * 44, -Math.cos(hA) * 44); c.stroke(); c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(mA) * 70, -Math.cos(mA) * 70); c.stroke(); c.restore(); }
const phoneItem = (lit = '#9FD3FF', s = 1) => ctx => { ctx.save(); ctx.scale(s, s); ctx.fillStyle = '#2B2F3A'; rr(ctx, -30, -118, 60, 112, 10); ctx.fill(); ctx.fillStyle = lit; rr(ctx, -24, -110, 48, 92, 6); ctx.fill(); ctx.restore(); };
const mugItem = ctx => { paint(ctx, q => { q.m(-38, -92); q.l(38, -92); q.l(33, 0); q.l(-33, 0); q.z(); }, '#FFFDF8', { sd: 3, hd: 2, lw: 3 }); ctx.strokeStyle = '#2B2F3A'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(-44, -48, 16, Math.PI - 1.3, Math.PI + 1.3); ctx.stroke(); txt(ctx, '#1', 0, -60, 22, '#E0474C'); txt(ctx, 'BOSS', 0, -34, 15, '#2B3A67'); };
function book(c, x, y, s = 1, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  paint(c, q => { q.m(-150, -260); q.l(150, -260); q.l(150, 0); q.l(-150, 0); q.z(); }, '#7A1C2E', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#F2EBDD'; c.fillRect(150, -250, 22, 244); c.fillStyle = '#E0B040'; c.fillRect(-150, -232, 300, 8); c.fillRect(-150, -36, 300, 8);
  txt(c, 'THE', 0, -190, 40, '#F2C14E'); txt(c, 'IDIOT', 0, -132, 64, '#F2C14E'); txt(c, 'F. DOSTOEVSKY', 0, -70, 24, '#F2EBDD'); c.restore(); }
const bookItem = ctx => book(ctx, 0, 40, 0.62, -0.12);
function binder(c, x, y, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(1, lerp(0.6, 1, k)); paint(c, q => { q.m(-210, -330); q.l(210, -330); q.l(210, 0); q.l(-210, 0); q.z(); }, '#E0474C', { sd: 8, hd: 4, lw: 4 });
  c.fillStyle = '#B8302E'; c.fillRect(-210, -330, 50, 330); c.fillStyle = '#FFFDF8'; rr(c, -130, -280, 310, 120, 12); c.fill(); txt(c, 'EVIDENCE', 25, -220, 50, '#2B2F3A');
  txt(c, '47 SCREENSHOTS', 25, -120, 26, '#FFFDF8'); txt(c, '1 DRONE · 1 LUCY', 25, -80, 26, '#FFFDF8'); c.fillStyle = '#FFFDF8'; for (let i = 0; i < 6; i++) c.fillRect(-196 + i * 5, -320 + i * 4, 400, 6); c.restore(); }
function drone(c, x, y, t, carry) { c.save(); c.translate(x, y + Math.sin(t * 9) * 6); c.scale(1.5, 1.5); c.rotate(Math.sin(t * 3) * 0.05);
  if (carry) { c.strokeStyle = '#2B2F3A'; c.lineWidth = 4; c.beginPath(); c.moveTo(-40, 20); c.lineTo(-60, 80); c.moveTo(40, 20); c.lineTo(60, 80); c.stroke(); book(c, 0, 250, 0.6); }
  paint(c, q => { q.m(-90, -24); q.l(90, -24); q.l(70, 26); q.l(-70, 26); q.z(); }, '#F7F9FC', { sd: 4, hd: 2, lw: 4 }); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(0, 4, 10, 0, TAU); c.fill();
  for (const s of [-1, 1]) { c.fillStyle = '#2B2F3A'; c.fillRect(s * 130 - 6, -60, 12, 40); c.fillRect(s * 90, -30, s * 40, 10); const w = 70 * Math.abs(Math.sin(t * 40 + s)); c.fillStyle = 'rgba(43,47,58,.55)'; c.beginPath(); c.ellipse(s * 130, -62, w + 8, 8, 0, 0, TAU); c.fill(); }
  c.restore(); }
function droneSign(c, x, y, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k * 1.3, k * 1.3); c.strokeStyle = '#2B2F3A'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 60); c.stroke();
  c.fillStyle = '#FFFDF8'; rr(c, -190, 60, 380, 130, 16); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; rr(c, -190, 60, 380, 130, 16); c.stroke(); txt(c, 'RATE YOUR DELIVERY', 0, 98, 26, '#2B2F3A'); for (let i = 0; i < 5; i++) { c.fillStyle = C.gold; UI.star(c, -120 + i * 60, 150, 22); } c.restore(); }
function deskShape(c, D, col) { paint(c, q => { q.m(D.x0, D.top); q.l(D.x1, D.top); q.l(D.x1, D.top + 34); q.l(D.x0, D.top + 34); q.z(); }, col, { sd: 4, hd: 2, lw: 3 }); c.fillStyle = mix(col, '#2B2F3A', 0.3); c.fillRect(D.x0 + 20, D.top + 34, 26, FY - D.top - 34); c.fillRect(D.x1 - 46, D.top + 34, 26, FY - D.top - 34); }
function monitor(c, x, y, s = 1, glow = '#BFE3F7') { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#3A3F4A'; c.fillRect(-14, -90, 28, 90); c.fillRect(-70, -8, 140, 12); paint(c, q => { q.m(-150, -300); q.l(150, -300); q.l(150, -80); q.l(-150, -80); q.z(); }, '#2B2F3A', { sd: 3, hd: 2, lw: 3 }); c.fillStyle = glow; c.fillRect(-136, -286, 272, 192); c.restore(); }
function sweat(c, hd, k) { if (k <= 0) return; const x = hd.x + hd.hh * 0.75, y = hd.y - hd.hh * 0.55 + (1 - k) * -20; c.save(); c.globalAlpha = k; c.fillStyle = '#8FD3F7'; c.strokeStyle = '#3C8FE0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 34); c.quadraticCurveTo(x + 22, y, x, y + 14); c.quadraticCurveTo(x - 22, y, x, y - 34); c.fill(); c.stroke(); c.restore(); }

// ---------------- phone UI (screen inserts)
function wrapLines(c, s, maxW) { const out = []; let line = ''; for (const w of s.split(' ')) { const tryL = line ? line + ' ' + w : w; if (c.measureText(tryL).width > maxW && line) { out.push(line); line = w; } else line = tryL; } if (line) out.push(line); return out; }
function tick2(c, x, y, col, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.lineWidth = 4; c.lineCap = 'round'; c.lineJoin = 'round'; for (const d of [0, 10]) { c.beginPath(); c.moveTo(-10 + d, 0); c.lineTo(-4 + d, 7); c.lineTo(8 + d, -8); c.stroke(); } c.restore(); }
function laughFace(c, x, y, r) { c.fillStyle = '#F7C948'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = '#B8860B'; c.lineWidth = 2; c.stroke(); c.strokeStyle = '#5A3A10'; c.lineWidth = r * 0.12; c.beginPath(); c.arc(x - r * 0.35, y - r * 0.15, r * 0.2, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.beginPath(); c.arc(x + r * 0.35, y - r * 0.15, r * 0.2, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.fillStyle = '#5A3A10'; c.beginPath(); c.moveTo(x - r * 0.55, y + r * 0.1); c.quadraticCurveTo(x, y + r * 0.9, x + r * 0.55, y + r * 0.1); c.fill(); c.fillStyle = '#5FB0E8'; c.beginPath(); c.ellipse(x - r * 0.85, y + r * 0.05, r * 0.14, r * 0.25, 0, 0, TAU); c.ellipse(x + r * 0.85, y + r * 0.05, r * 0.14, r * 0.25, 0, 0, TAU); c.fill(); }
// one messenger screen (416 x 740). o: { title, sub, av, msgs: [{me, text, hi, voice}], scroll, input, sendK, status, toast, flash }
function chat(c, w, h, o) {
  c.fillStyle = '#EEF1F5'; c.fillRect(0, 0, w, h);
  let y = 108 - (o.scroll || 0); c.save(); c.beginPath(); c.rect(0, 96, w, h - 96 - (o.input !== undefined ? (o.input ? 150 : 92) : 0)); c.clip();
  for (const m of o.msgs) {
    c.font = '27px Nun9'; const lines = m.voice ? [''] : wrapLines(c, m.text, w - 110); const bw = m.voice ? 300 : Math.max(...lines.map(l => c.measureText(l).width)) + 36, bh = m.voice ? 76 : lines.length * 34 + 26;
    const bx = m.me ? w - bw - 16 : 16; if (m.k !== undefined && m.k < 1) { y += (bh + 14) * m.k; continue; }
    c.fillStyle = m.me ? '#3C8FE0' : '#FFFFFF'; rr(c, bx, y, bw, bh, 22); c.fill();
    if (m.voice) { c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(bx + 26, y + 22); c.lineTo(bx + 52, y + 38); c.lineTo(bx + 26, y + 54); c.fill(); for (let i = 0; i < 26; i++) { const a = 6 + Math.abs(Math.sin(i * 1.7) * Math.sin(i * 0.6)) * 22; c.fillRect(bx + 66 + i * 7, y + 38 - a / 2, 4, a); } txt(c, m.voice, bx + bw - 12, y + 62, 18, '#FFFFFF', 'Nun8', 'right'); }
    else lines.forEach((l, i) => { c.font = '27px Nun9'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = m.me ? '#FFFFFF' : '#2B2F3A'; if (m.hi) { let xx = bx + 18; for (const wd of l.split(' ')) { const red = /idiot/i.test(wd); c.fillStyle = red ? (m.me ? '#FFE15A' : '#E0474C') : (m.me ? '#FFFFFF' : '#2B2F3A'); c.fillText(wd, xx, y + 30 + i * 34); xx += c.measureText(wd + ' ').width; } } else c.fillText(l, bx + 18, y + 30 + i * 34); });
    y += bh + 14;
    if (m.status) { txt(c, m.status, w - 22, y + 2, 19, m.statusCol || '#7A8290', 'Nun8', 'right'); if (m.statusCol) tick2(c, w - 34 - c.measureText(m.status).width, y + 2, m.statusCol, 0.8); y += 26; }
  }
  c.restore();
  c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, 96); c.fillStyle = '#D5DAE0'; c.fillRect(0, 95, w, 2);
  c.fillStyle = o.av || '#9AA3B2'; c.beginPath(); c.arc(54, 56, 28, 0, TAU); c.fill(); txt(c, (o.title || '?')[0], 54, 58, 26, '#FFFFFF');
  fitTxt(c, o.title, 96, 46, 28, '#2B2F3A', 300, 'Nun9', 'left'); if (o.sub) txt(c, o.sub, 96, 76, 18, '#7A8290', 'Nun7', 'left');
  if (o.input !== undefined) { const big = !!o.input, ih = big ? 150 : 92; c.fillStyle = '#FFFFFF'; c.fillRect(0, h - ih, w, ih); c.fillStyle = big ? '#FFF6D6' : '#EEF1F5'; rr(c, 12, h - ih + 12, w - 92, ih - 24, 30); c.fill();
    if (big) { c.strokeStyle = '#F2C14E'; c.lineWidth = 3; rr(c, 12, h - ih + 12, w - 92, ih - 24, 30); c.stroke(); c.font = '30px Nun9'; wrapLines(c, o.input, w - 130).forEach((l, i) => txt(c, l, 30, h - ih + 54 + i * 40, 30, '#2B2F3A', 'Nun9', 'left')); }
    else fitTxt(c, 'Message', 26, h - 46, 24, '#9AA3B2', w - 120, 'Nun9', 'left');
    const sk = o.sendK || 0; c.save(); c.translate(w - 42, h - 46); c.scale(1 + sk * 0.15, 1 + sk * 0.15); c.fillStyle = '#3C8FE0'; c.beginPath(); c.arc(0, 0, 32, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-12, -14); c.lineTo(16, 0); c.lineTo(-12, 14); c.lineTo(-6, 0); c.fill(); c.restore(); }
  if (o.toast) { c.fillStyle = 'rgba(43,47,58,.92)'; rr(c, 40, h - 120, w - 80, 70, 35); c.fill(); txt(c, o.toast, w / 2, h - 84, 24, '#FFFFFF', 'Nun9'); }
  if (o.flash > 0) { c.fillStyle = `rgba(255,255,255,${o.flash})`; c.fillRect(0, 0, w, h); }
}
// lock screen with one notification
function lock(c, w, h, o) { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5A6BC8'); g.addColorStop(1, '#C86BA8'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  txt(c, '11:07', w / 2, 150, 92, '#FFFFFF', 'Unb9'); txt(c, 'Thursday', w / 2, 220, 26, '#FFFFFF', 'Nun8');
  const k = o.k; if (k <= 0) return; c.save(); c.translate(0, (1 - eOut(k)) * -200); c.fillStyle = 'rgba(255,255,255,.95)'; rr(c, 18, 270, w - 36, 250, 30); c.fill();
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(62, 316, 24, 0, TAU); c.fill(); txt(c, 'L', 62, 318, 24, '#FFFFFF'); txt(c, 'LUCY', 98, 316, 28, '#2B2F3A', 'Nun9', 'left'); txt(c, 'now', w - 42, 316, 20, '#7A8290', 'Nun8', 'right');
  c.font = '31px Nun9'; const L = wrapLines(c, o.text, w - 90); L.forEach((l, i) => txt(c, l, 42, 382 + i * 40, 31, '#2B2F3A', 'Nun9', 'left')); laughFace(c, w - 74, 382 + (L.length - 1) * 40, 22); c.restore(); }
// the phone in screen space + darkened world behind it
const PH = { x: 540, y: 1125, s: 1.2 }, ZM = 1.3;
const zoom = fn => (c, w, h) => { c.save(); c.scale(ZM, ZM); fn(c, w / ZM, h / ZM); c.restore(); };
function insert(c, k, screen) { if (k <= 0) return; c.fillStyle = `rgba(28,24,40,${0.5 * clamp(k)})`; c.fillRect(0, 0, W, HH); const s = PH.s * lerp(0.6, 1, k); c.save(); c.globalAlpha = clamp(k * 2); K.phone(c, PH.x, PH.y + (1 - k) * 260, s, zoom(screen)); c.restore(); }
// big status banner under the phone
function banner(c, k, en, col, ru, y = 1515, check = true) { if (k <= 0) return; c.save(); c.translate(540, y); c.rotate(-0.025); c.scale(k, k); const hh = ru ? 132 : 112;
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -480 + 8, -hh / 2 + 10, 960, hh, 26); c.fill(); c.fillStyle = col; rr(c, -480, -hh / 2, 960, hh, 26); c.fill(); c.strokeStyle = C.white; c.lineWidth = 6; rr(c, -480, -hh / 2, 960, hh, 26); c.stroke();
  const ty = ru ? -18 : 2; const s = UI.textFit(c, 'Unb9', 54, en, check ? 780 : 900); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; const tw = c.measureText(en).width; c.fillText(en, check ? -36 : 0, ty);
  if (check) { c.fillStyle = C.white; c.beginPath(); c.arc(tw / 2 + 20, ty, 32, 0, TAU); c.fill(); UI.check(c, tw / 2 + 20, ty, 24, col); }
  if (ru) fitTxt(c, ru, 0, 38, 30, '#FFFFFF', 900, 'Nun9'); c.restore(); }

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.35, look: 0.8, armL: reach(g, -1, -g.sw * 0.5, g.ySh + 330), armR: reach(g, 1, g.sw * 0.6, g.ySh + 330) };
  gest(st, g, 'her', t, 1, 200);
  const phoneR = () => { st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 170); st.items = { R: phoneItem() }; };
  if (L === 'hook') { st.mood = t < 1.85 ? 'neutral' : 'shock'; phoneR(); st.lookY = t < 1.85 ? 0.5 : 0; if (t > 2.45) { st.mood = 'shock'; st.armR = reach(g, 1, g.sw * 0.3, g.ySh + 420); st.items = {}; st.armL = reach(g, -1, -g.sw * 1.0, g.ySh + 140); } }
  if (L === 'A1') { st.mood = 'worried'; if (speaking('a1_her', t, 0.1)) { const u = t * 9; st.armL = reach(g, -1, -g.sw * 1.6 + Math.sin(u) * 30, g.ySh - 120); st.armR = reach(g, 1, g.sw * 1.6 - Math.sin(u) * 30, g.ySh - 120); } if (t > SP.a1_x.t + 0.4) { st.mood = 'happy'; } if (t > ev('shot')) st.mood = 'happy'; }
  if (L === 'A2') { st.mood = speaking('a2_her', t) ? 'happy' : 'worried'; if (t > ev('chart')) st.mood = 'shock'; }
  if (L === 'B1') { st.mood = speaking('b1_her', t, 0.1) ? 'smug' : 'neutral'; if (speaking('b1_her', t)) st.armR = reach(g, 1, g.sw * 1.2, g.ySh - 260); if (t > SP.b1_x.t) st.mood = 'worried';
    if (t > ev('scroll') - 0.5 && t < SP.b1_nar.t) { st.armR = reach(g, 1, g.sw * 2.3, g.ySh + 120); st.items = { R: phoneItem() }; } if (t > ev('idiots')) st.mood = 'shock'; }
  if (L === 'B2') { st.mood = 'worried'; if (t > ev('drone') - 0.4 && t < ev('drop')) { st.lookY = 0.5; st.look = 0.2; st.armL = reach(g, -1, -g.sw * 0.2, g.ySh + 200); st.armR = reach(g, 1, g.sw * 0.4 + Math.sin(t * 30) * 8, g.ySh + 190); st.items = { R: phoneItem() }; }
    if (t > ev('drop') + 0.3) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh - 60); st.items = { L: bookItem }; } if (t > endOf('b2_x2') - 0.3) st.mood = 'tired'; }
  if (L === 'C1') { st.mood = 'happy'; if (speaking('c1_her', t, 0.1)) st.armR = reach(g, 1, -g.sw * 0.2, g.ySh + 110); if (t > ev('lucy')) { st.mood = 'shock'; st.look = -0.6; st.lookY = 0.5; st.turn = 0; }
    const hd = ev('hide'); if (t > hd - 0.35 && t < hd + 0.25) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 260); st.items = { L: phoneItem() }; } if (t > hd + 0.25) { st.mood = 'worried'; st.look = 0.8; st.lookY = 0; st.turn = 0.35; st.armR = reach(g, 1, -g.sw * 0.15, g.ySh + 150); } }
  if (L === 'C2') { st.mood = speaking('c2_her', t, 0.1) ? 'smug' : 'neutral'; if (speaking('c2_her', t)) { st.armL = reach(g, -1, -g.sw * 0.4, g.ySh + 140); } if (t > SP.c2_x.t + 0.4) st.mood = 'surprised';
    if (t > SP.c2_her2.t - 0.1) { st.mood = 'happy'; st.laugh = true; } if (t > ev('sent')) { st.mood = 'shock'; st.laugh = false; st.lookY = 0.6; st.look = 0; st.turn = 0; st.armR = reach(g, 1, -g.sw * 0.1, g.ySh + 160); st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 40); } }
  return st; }
function grantState(t, L) { const g = G.grant, st = { t, talk: talk('grant', t), mood: 'skeptical', turn: -0.35, look: -0.8, armL: reach(g, -1, -g.sw * 0.7, g.ySh + 330), armR: reach(g, 1, g.sw * 0.7, g.ySh + 330) };
  gest(st, g, 'grant', t, -1, 200);
  const showPhone = () => { st.armL = reach(g, -1, -g.sw * 2.3, g.ySh + 40); st.items = { L: phoneItem('#FFFFFF', 1.2) }; };
  if (L === 'hook') { const k = eIO(P(t, 2.45, 3.6)); st.turn = lerp(0.55, -0.35, k); st.look = lerp(1, -0.9, k); st.lookY = lerp(0.45, 0, k); st.mood = 'neutral'; st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 170); st.items = { R: phoneItem('#FFFFFF') }; if (t > 3.6) st.mood = 'skeptical'; }
  if (L === 'A1') { if (t > SP.a1_x.t - 0.2 && t < SP.a1_nar.t + 0.4) showPhone(); st.mood = t > ev('shot') ? 'smug' : 'skeptical'; }
  if (L === 'A2' && t > ev('chart') - 0.3) { st.armL = reach(g, -1, -g.sw * 2.3, g.ySh + 60); st.mood = 'smug'; }
  if (L === 'B1') { if (speaking('b1_x', t, 0.1, 0.4)) st.armL = reach(g, -1, -g.sw * 2.0, g.ySh + 150); if (t > ev('scroll')) { st.mood = 'skeptical'; st.lookY = 0.3; } if (t > SP.b1_x2.t) st.mood = 'smug'; }
  if (L === 'B2') { st.mood = 'bored'; if (t > ev('drone')) { st.mood = 'skeptical'; st.look = -1; st.lookY = -0.5; } if (t > ev('drop')) { st.lookY = 0; } if (speaking('b2_x2', t, 0.1, 0.6)) { st.lookY = -0.6; st.look = -1; st.mood = 'bored'; } }
  if (L === 'C1') { st.mood = speaking('c1_her', t) ? 'surprised' : 'happy'; if (speaking('c1_x', t, 0.1, 0.6)) st.armR = reach(g, 1, g.sw * 0.1, g.ySh + 120); if (t > ev('lucy')) { st.mood = 'skeptical'; st.lookY = 0.4; st.look = -1; } if (t > SP.c1_x2.t) st.mood = 'annoyed'; }
  if (L === 'C2') { const sp = speaking('c2_her', t); st.mood = sp ? (t > SP.c2_her.t + 6 ? 'tired' : 'bored') : 'neutral'; const s0 = ev('sip');
    if (t > s0 - 0.3 && t < s0 + 2.2) { const up = t > s0 + 0.5 && t < s0 + 1.4; st.armR = up ? reach(g, 1, g.sw * 0.35, g.ySh - 60) : reach(g, 1, g.sw * 0.9, g.ySh + 30); st.items = { R: mugItem }; st.headFirst = up; st.lookY = up ? 0 : 0.3; st.look = 0.4; }
    const f = ev('folder'); if (t > f - 0.5 && t < f + 0.4) { st.armL = reach(g, -1, -g.sw * 1.0, g.ySh + 60); st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 60); }
    if (t > SP.c2_x.t - 0.1) st.mood = 'neutral'; const b = ev('bossmsg'); if (t > b - 0.3 && t < SP.c2_her2.t) { showPhone(); st.mood = 'sad'; } if (t > SP.c2_x2.t + 0.6) { st.mood = 'happy'; st.laugh = !speaking('c2_x2', t); }
    if (t > ev('sent') + 0.2) { st.mood = 'shock'; st.laugh = false; st.look = -0.6; st.lookY = 0.4; } }
  return st; }

// ---------------- world
function world(c, t, L) {
  c.drawImage(BGB, BX0, BY0, BW, BH); const heads = {};
  clock(c, 700, -2420, t, L);
  // Grant + his desk
  heads.grant = put(c, grantCfg(t, L), grantState(t, L), GX, FY);
  deskShape(c, GDESK, '#7A4E30'); monitor(c, 790, GDESK.top, 1, '#BFE3F7'); c.fillStyle = '#2B2F3A'; rr(c, 590, GDESK.top - 54, 170, 34, 6); c.fill(); txt(c, 'MR GRANT', 675, GDESK.top - 37, 20, '#F2C14E');
  if (!(L === 'C2' && t > ev('sip') - 0.3 && t < ev('sip') + 2.2)) { c.save(); c.translate(620, GDESK.top); mugItem(c); c.restore(); }
  if (L === 'C2') binder(c, 650, GDESK.top, eBack(P(t, ev('folder') + 0.45, ev('folder') + 0.75), 1.4) * (t > ev('folder') + 0.45 ? 1 : 0));
  // her desk + things
  deskShape(c, HDESK, '#B98A62'); monitor(c, -720, HDESK.top, 0.8, '#D6F0E4');
  const bookOn = (L === 'B2' && t > ev('drop') && t < ev('drop') + 0.3) || ['C1', 'C2'].includes(L);
  if (bookOn) book(c, -580, HDESK.top, 0.55, 0);
  if (L === 'C1' && t < ev('hide') - 0.3) { c.save(); c.translate(-560, HDESK.top - 6); c.fillStyle = '#2B2F3A'; rr(c, -60, -18, 120, 18, 6); c.fill(); if (t > ev('lucy')) { const gk = 0.5 + 0.5 * Math.sin(t * 14); c.fillStyle = `rgba(255,230,120,${0.45 * gk})`; c.beginPath(); c.ellipse(0, -16, 110, 40, 0, 0, TAU); c.fill(); } c.restore(); }
  heads.her = put(c, HER, herState(t, L), HERX, FY);
  // pocket glow when the voice message leaves
  if (L === 'C2' && t > ev('sent') - 0.3 && t < ev('freeze')) { const gk = 0.5 + 0.5 * Math.sin(t * 16); c.save(); c.globalAlpha = 0.7 * gk; c.fillStyle = '#7CF2FF'; c.beginPath(); c.arc(HERX - G.her.sw * 0.35, FY + G.her.ySh + 170, 70, 0, TAU); c.fill(); c.restore(); }
  // drone (B2)
  if (L === 'B2' && t > ev('drone') - 0.1) { const d0 = ev('drone'), d1 = ev('drop'), k = eIO(P(t, d0, d1 - 0.2)); const x = lerp(250, -620, k), y = lerp(-2300, HDESK.top - 760, k), carry = t < d1;
    if (!carry && t < d1 + 0.3) { const f = eIn(P(t, d1, d1 + 0.3)); book(c, lerp(-620, -580, f), lerp(HDESK.top - 760 + 375, HDESK.top, f), lerp(0.9, 0.55, f)); }
    const hx = carry ? x : lerp(-620, -650, eOut(P(t, d1 + 0.2, d1 + 1.0))), hy = carry ? y : lerp(HDESK.top - 760, -1620, eOut(P(t, d1 + 0.2, d1 + 1.0)));
    drone(c, hx, hy, t, carry); if (!carry) droneSign(c, hx, hy + 30, eBack(P(t, d1 + 0.9, d1 + 1.2), 2)); K.mark(c, 'drone', hx, hy, 160); }
  return heads;
}

// ---------------- camera
function shotFor(t) { const sc = sceneAt(t), L = sc.id, two = { x: 40, y: -1000, z: 0.72, r: 0 }; if (L === 'outro') return two;
  if (L === 'hook') { if (t < 2.45) return { x: HERX + 60, y: herHY + 140, z: 1.6, r: 0, cut: true }; return { x: 60, y: -1180, z: 0.76, r: 0, cut: t < 2.5 }; }
  const u = t - sc.s; if (u < 1.15) return { ...two, z: 0.7, cut: u < 0.85 };
  const l = L.toLowerCase(), nar = SP[l + '_nar'], herC = { x: HERX + 230, y: herHY + 230, z: 1.0, r: 0.3 }, grC = { x: GX - 230, y: gHY + 220, z: 0.98, r: -0.3 };
  if (L === 'B2' && t > ev('drone') - 0.4 && t < SP.b2_nar.t) return { x: -200, y: -1250, z: 0.66, r: 0 };
  if (L === 'C2') { if (speaking('c2_her', t, 0.2, 0.3)) return { x: 60, y: -1700, z: lerp(0.64, 0.68, P(t, SP.c2_her.t, endOf('c2_her'))), r: 0 };
    if (t > ev('freeze')) return { x: 40, y: -1560, z: 0.84, r: 0, cut: t < ev('freeze') + 0.05 }; }
  if (nar && t >= nar.t - 0.15) return two;
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.3 && t < s.t + s.d + 0.2);
  if (cur) return cur.who === 'her' ? herC : grC;
  return two; }
const CAM = E.simulateCamera(TL, shotFor, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, sh = { x: 0, y: 0, r: 0 }, tw = t) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, tw, L); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- phone inserts per level
const GRANT_CHAT = [{ me: false, text: 'Report by 5, please.' }, { me: true, text: 'Sure! On it.' }];
const IDIOT_MSGS = ['my boss is an idiot', 'IDIOT', 'he did it AGAIN', 'such an idiot', 'idiot alert', 'meeting with the idiot', 'idiot idiot idiot', 'guess who? the idiot', 'total idiot', 'the idiot wants a report', 'IDIOT.', 'why is he such an idiot', 'idiot update', 'still an idiot'];
function hookScreen(t) { const sent = t > 0.45; return (c, w, h) => chat(c, w, h, { title: 'Mr Grant', sub: 'Manager', av: '#2B3A67', input: sent ? '' : 'My boss is an absolute idiot.', sendK: sent ? 0 : 0.5 + 0.5 * Math.sin(t * 9),
  msgs: [...GRANT_CHAT, ...(sent ? [{ me: true, text: 'My boss is an absolute idiot.', k: eOut(P(t, 0.42, 0.52)), status: t > 1.4 ? 'Read 11:02' : 'Delivered', statusCol: t > 1.4 ? '#3C8FE0' : null }] : [])] }); }
function overlays(c, t, L) {
  if (L === 'A1') { const s = ev('shot'), k = win(t, s - 0.15, SP.a1_nar.t - 0.05, 0.2); insert(c, k, (cc, w, h) => chat(cc, w, h, { title: 'Marketing', sub: 'your team', av: '#2E8C86', msgs: [{ me: false, text: 'My boss is an absolute idiot.' }], flash: 1 - P(t, s, s + 0.4), toast: t > s + 0.1 ? 'Screenshot saved' : null })); }
  if (L === 'A2') { const a = ev('chart'), k = win(t, a - 0.1, SP.a2_nar.t + 2.2); orgChart(c, k); }
  if (L === 'B1') { const s = ev('scroll'), k = win(t, s - 0.05, SP.b1_nar.t - 0.1); const sc = eIO(P(t, s + 0.3, s + 1.9)) * 1000;
    insert(c, k, (cc, w, h) => chat(cc, w, h, { title: 'Lucy', sub: 'best friend', av: '#F2C14E', scroll: sc, msgs: [...IDIOT_MSGS, ...IDIOT_MSGS.slice(0, 6)].map((m, i) => ({ me: i % 3 !== 2, text: i % 3 === 2 ? 'lol' : m, hi: true })) }));
    banner(c, k * eBack(P(t, ev('idiots'), ev('idiots') + 0.25), 2.2), 'IDIOT ×47', '#E0474C', 'слово «идиот» — 47 раз', 1515, false); }
  if (L === 'C1') { const a = ev('lucy'), k = win(t, a - 0.05, ev('hide') - 0.05); insert(c, k, (cc, w, h) => lock(cc, w, h, { k: P(t, a + 0.1, a + 0.45), text: "Did you tell him he's an idiot yet?" }));
    banner(c, k * eBack(P(t, a + 0.5, a + 0.8), 2), 'NEW MESSAGE', '#EE5E9A', '«Ты уже сказала ему, что он идиот?»', 1515, false); }
  if (L === 'C2') { const b = ev('bossmsg'), kb = win(t, b - 0.05, SP.c2_x2.t + 0.35);
    insert(c, kb, (cc, w, h) => { chat(cc, w, h, { title: 'Ms Whitmore', sub: 'Owner', av: '#8A1C2E', msgs: [{ me: false, text: 'Grant. My cat needs a LinkedIn profile. By 5 pm.' }] }); catPic(cc, 30, 330); });
    banner(c, kb * eBack(P(t, b + 0.3, b + 0.6), 2), 'FROM: HIS BOSS', '#8A1C2E', '«Грант. Моему коту нужен профиль в LinkedIn. К 17:00.»', 1515, false);
    const s = ev('sent'), r = ev('read'), f = ev('freeze'), ks = win(t, s, f + 0.05, 0.25);
    insert(c, ks, (cc, w, h) => chat(cc, w, h, { title: 'COMPANY GROUP CHAT', sub: '48 members', av: '#4CAF6A', msgs: [{ me: false, text: 'Cake in the kitchen!' }, { me: true, voice: '1:12', status: t > r ? 'Read by Ms Whitmore + 47' : 'Sending…', statusCol: t > r ? '#3C8FE0' : null }] }));
    const kb2 = eBack(P(t, s + 0.15, s + 0.4), 2); if (t < f) banner(c, kb2, t > r ? 'READ BY MS WHITMORE' : 'SENT TO: COMPANY GROUP CHAT', t > r ? '#3C8FE0' : '#2F9E58', t > r ? 'прочитала её начальница — и ещё 47' : 'голосовое из кармана — в общий чат', 1515);
  }
}
function catPic(c, x, y) { c.fillStyle = '#FFFFFF'; rr(c, x, y, 240, 200, 18); c.fill(); c.fillStyle = '#E8A05A'; c.beginPath(); c.ellipse(x + 120, y + 112, 64, 56, 0, 0, TAU); c.fill(); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + 120 + s * 56, y + 82); c.lineTo(x + 120 + s * 44, y + 30); c.lineTo(x + 120 + s * 18, y + 66); c.fill(); }
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(x + 98, y + 104, 7, 0, TAU); c.arc(x + 142, y + 104, 7, 0, TAU); c.fill(); c.fillStyle = '#2B3A67'; c.fillRect(x + 80, y + 150, 80, 16); c.fillStyle = '#F2C14E'; c.beginPath(); c.moveTo(x + 112, y + 150); c.lineTo(x + 128, y + 150); c.lineTo(x + 120, y + 182); c.fill(); }
function orgChart(c, k) { if (k <= 0) return; c.save(); c.translate(540, 1150); c.rotate(-0.03); c.scale(k * 0.92, k * 0.92); const w = 640, h = 470;
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 10, -h / 2 + 14, w, h, 30); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -w / 2, -h / 2, w, h, 30); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; rr(c, -w / 2, -h / 2, w, h, 30); c.stroke();
  txt(c, 'TEAM STRUCTURE', 0, -180, 40, '#2B2F3A'); c.fillStyle = '#2B3A67'; rr(c, -170, -130, 340, 90, 16); c.fill(); txt(c, 'MR GRANT', 0, -84, 44, '#F2C14E');
  c.strokeStyle = '#E0474C'; c.lineWidth = 10; c.beginPath(); c.moveTo(0, -40); c.lineTo(0, 70); c.stroke(); c.fillStyle = '#EE5E9A'; rr(c, -170, 70, 340, 90, 16); c.fill(); txt(c, 'YOU', 0, 116, 48, '#FFFFFF');
  c.save(); c.translate(150, 16); c.rotate(-0.12); c.fillStyle = '#E0474C'; rr(c, -10, -28, 170, 56, 14); c.fill(); txt(c, '1 BOSS', 75, 1, 28, '#FFFFFF'); c.restore(); txt(c, 'ваш начальник: один', 0, 200, 28, '#C2507A', 'Nun9'); c.restore(); }

// ---------------- hook & frame
function drawHook(c, t) {
  if (t < 1.85) { drawWorld(c, t, 'hook', { x: 60, y: -1000, z: 0.76, r: 0 }); c.fillStyle = 'rgba(28,24,40,.5)'; c.fillRect(0, 0, W, HH); K.phone(c, PH.x, PH.y, PH.s, zoom(hookScreen(t)));
    if (t < 0.45) UI.tapCursor(c, PH.x + 208 * PH.s - 42 * ZM * PH.s + 20, PH.y + 370 * PH.s - 46 * ZM * PH.s + 30, 1, P(t, 0.3, 0.6));
    if (t > 0.8) banner(c, eBack(P(t, 0.8, 1.05), 2.2), t > 1.4 ? 'READ' : 'SENT TO: MR GRANT', t > 1.4 ? '#3C8FE0' : '#2F9E58', t > 1.4 ? 'прочитано' : 'отправлено… начальнику', 1515);
  } else { const cam = CAM[Math.min(CAM.length - 1, Math.round(t * FPS))]; const { heads, M } = drawWorld(c, t, 'hook', cam); if (t > 1.85 && t < 2.45) K.pop(c, t, 'О НЕТ…', 1.95, 2.35, 540, 1450, C.white, -0.06, 90); }
  Hq.vignette(c, W, HH, 0.3); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t);
  if (sc.id === 'hook') { drawHook(c, t); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (sc.id === 'outro') { K.outro(c, t, { q: ['А ТЫ ПИСАЛ(А)', 'НЕ В ТОТ ЧАТ?'], rows: [['A2', 'I sent it to the wrong person.'], ['B1', "That's not what I meant."], ['B2', "You've taken it out of context."], ['C1', "That message wasn't meant for you."]], cta: ['ОТПРАВЬ ТОМУ, КТО', 'ПИШЕТ НЕ В ТОТ ЧАТ'], hero: (cc, tt) => put(cc, HER, { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(G.her, -1, -G.her.sw * 0.6, G.her.ySh + 300), armR: reach(G.her, 1, G.her.sw * 1.0, G.her.ySh + 140), items: { R: phoneItem() } }, 0, 0) }); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const frozen = sc.id === 'C2' && t > ev('freeze'), tw = frozen ? ev('freeze') : t;
  const f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  if (frozen) c.filter = 'saturate(0.35) contrast(1.08)';
  const { heads, M } = drawWorld(c, t, sc.id, cam, sh, tw); c.filter = 'none'; Hq.vignette(c, W, HH, frozen ? 0.45 : 0.26);
  if (frozen) { const fl = 1 - P(t, ev('freeze'), ev('freeze') + 0.35); if (fl > 0) { c.fillStyle = `rgba(255,255,255,${fl * 0.85})`; c.fillRect(0, 0, W, HH); } }
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f });
  if (sc.id === 'A1' || sc.id === 'A2') sweat(c, { ...proj(heads.her), hh: heads.her.hh * cam.z }, sc.id === 'A1' ? clamp(P(t, SP.a1_x.t + 0.4, SP.a1_x.t + 0.8)) : clamp(P(t, SP.a2_x.t, SP.a2_x.t + 0.4)));
  overlays(c, t, sc.id);
  K.bubbles(c, t, sc, heads, proj, { names: { grant: ['MR GRANT', '#2B3A67'] }, hold: { c2_her: 0.25 } });
  if (sc.id === 'A1') K.pop(c, t, 'ХЕ-ХЕ…', SP.a1_nar.t - 0.05, SP.a1_nar.t + 1.6, 300, 1180, C.white, -0.08, 64);
  if (sc.id === 'B2') K.pop(c, t, 'БА-ДУМ-ТСС!', endOf('b2_x2') + 0.1, SP.b2_nar.t + 0.4, 540, 1250);
  if (sc.id === 'B1') K.pop(c, t, 'БА-ДУМ-ТСС!', endOf('b1_x2') + 0.1, SP.b1_nar.t + 0.4, 540, 1250);
  if (sc.id === 'C2') { K.dots(c, t, endOf('c2_her') + 0.3, SP.c2_x.t - 0.1); if (t > SP.c2_her.t + 2 && t < endOf('c2_her')) K.pop(c, t, '+ 30 ЛЕТ', ev('folder') - 2.5, endOf('c2_her') - 0.3, 760, 1370, C.white, 0.06, 54); }
  K.hud(c, t, sc);
}
E.run('wrongchat', NF, renderFrame);
