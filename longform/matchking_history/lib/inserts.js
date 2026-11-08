// Insert shots and close-ups for "The Match King" (variety between the wide parallax sets): every insert(ctx, g, o) draws one frame at local time g.
// strike · closeup · archive (Time cover print) · doc (certificate / bond / telegram / ledger, all labelled RE-CREATED) · coins (the trick) · hourglass
const P = require('./par.js'); const K = require('./kreuger.js'); const fs = require('fs'), path = require('path');
const { W, H, layer, camAt, fillShade, rect, poly, blob, sky, beams, dust, smoke, glow, grade, vignette, grain, hash, clamp, lerp, ss, eo, back, flame, plate, source } = P;
const LINE = 'rgba(27,20,16,0.5)';
let TIMEIMG = null; (async () => { try { TIMEIMG = await P.loadImage(path.join(__dirname, '../archive/time_1929-10-28.jpg')); } catch (e) {} })();
async function ready() { if (!TIMEIMG) TIMEIMG = await P.loadImage(path.join(__dirname, '../archive/time_1929-10-28.jpg')); }
function label(ctx, s) { plate(ctx, s, W - 70, H - 52, 1, { size: 20, weight: 700, align: 'right', bg: 'rgba(0,0,0,0.5)' }); }
// ---- big hand (for macro shots) ----
function bigHand(ctx, x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  fillShade(ctx, c => { c.beginPath(); c.roundRect(-70, 60, 140, 260, 30); }, '#2b2f3c', { line: LINE, y0: 60, y1: 320 }); fillShade(ctx, rect(-58, 50, 116, 30), '#f5f1e8', { line: LINE });
  fillShade(ctx, c => { c.beginPath(); c.ellipse(0, 0, 66, 70, 0, 0, 7); }, '#e6bf9c', { line: LINE, y0: -70, y1: 70 });
  for (let i = 0; i < 3; i++) fillShade(ctx, c => { c.beginPath(); c.roundRect(-52 + i * 30, -100, 26, 70, 13); }, '#e6bf9c', { line: LINE });
  fillShade(ctx, c => { c.beginPath(); c.roundRect(28, -70, 24, 64, 12); }, '#e6bf9c', { line: LINE }); fillShade(ctx, c => { c.beginPath(); c.ellipse(-62, -20, 18, 34, -0.6, 0, 7); }, '#e6bf9c', { line: LINE }); ctx.restore(); }
// ============ macro: a hand strikes a match on a matchbox ============
function strike(ctx, g, o = {}) { const at = o.at ?? 0.8, cam = camAt(g, [[0, 0, 0, 1.0, 1.0], [6, 0, 0, 1.12, 1.0]]);
  sky(ctx, [[0, '#0b0807'], [1, '#1a120c']]);
  layer(ctx, cam, 1.0, x => { // the matchbox side with its strike strip, huge
    x.save(); x.translate(860, 640); x.rotate(-0.12); fillShade(x, rect(-520, -150, 1040, 300), '#f2c230', { line: LINE, y0: -150, y1: 150 }); fillShade(x, rect(-520, -46, 1040, 92), '#b8231b', {});
    fillShade(x, rect(-520, -150, 1040, 46), '#5a3a24', {}); for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(0,0,0,${hash(i) * 0.4})`; x.fillRect(-520 + hash(i * 3) * 1040, -150 + hash(i * 7) * 46, 3, 3); }
    x.fillStyle = '#fff4d8'; x.font = `900 64px ${P.F}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(o.lab || 'SÄKERHETS-TÄNDSTICKOR', 0, 4); x.restore(); });
  const u = ss((g - at + 0.5) / 0.5), mx = lerp(1300, 420, u), my = lerp(420, 470, u) - Math.sin(u * Math.PI) * 30, lit = ss((g - at) / 0.25);
  layer(ctx, cam, 0.8, x => { x.save(); x.translate(mx, my); x.rotate(-0.35); fillShade(x, rect(-9, 0, 18, 330), '#e8c88f', { line: LINE }); x.fillStyle = '#9b1d1d'; x.beginPath(); x.ellipse(0, -4, 15, 20, 0, 0, 7); x.fill();
    if (lit > 0) flame(x, 0, -12, 1.6, g, lit); x.restore(); bigHand(x, mx + 120, my + 300, 1.15, -0.35); });
  if (g > at - 0.05 && g < at + 0.35) for (let i = 0; i < 30; i++) { const a = hash(i) * 6.28, r = (g - at + 0.05) * 900 * (0.4 + hash(i * 3)); ctx.fillStyle = `rgba(255,${180 + hash(i) * 60},90,${1 - (g - at) / 0.35})`; ctx.fillRect(mx - 40 + Math.cos(a) * r, my + Math.sin(a) * r * 0.5, 4, 4); }
  if (lit > 0) glow(ctx, mx, my - 60, 900, '255,170,80', 0.45 * lit); vignette(ctx, 0.55); grain(ctx, g, 0.05); }
// ============ close-up of Kreuger (head & shoulders, blurred room behind) ============
function closeup(ctx, g, o = {}) { const cam = camAt(g, o.cam || [[0, 0, 0, 1.0, 1.0], [8, 0, 20, 1.1, 1.0]]), bg = o.bg || ['#4a3020', '#1e140c'];
  sky(ctx, [[0, bg[0]], [1, bg[1]]]); for (let i = 0; i < 12; i++) glow(ctx, hash(i) * W, hash(i * 3) * H * 0.7, 120 + hash(i * 5) * 140, o.bokeh || '255,200,130', 0.12);
  if (o.window) { ctx.save(); ctx.filter = 'blur(14px)'; ctx.fillStyle = o.window; ctx.fillRect(1250, 80, 520, 600); ctx.restore(); }
  layer(ctx, cam, 1.0, x => K.kreuger(x, o.kx ?? 1060, o.ky ?? 760, o.ks ?? 2.6, Object.assign({ age: 'king' }, o.k || {}), g), { sharp: true });
  if (o.rim) beams(ctx, 1700, 0.5); grade(ctx, o.grade || 'warm', 0.6); vignette(ctx, 0.5); grain(ctx, g); }
// ============ the real Time cover (28 Oct 1929, public domain in the US since 2025) as a print on a desk ============
function archive(ctx, g, o = {}) { const u = ss(g / (o.dur || 7)); sky(ctx, [[0, '#2e2218'], [1, '#160f0a']]);
  for (let i = 0; i < 9; i++) { ctx.save(); ctx.translate(200 + i * 230, 900 + (i % 2) * 60); ctx.rotate((hash(i) - 0.5) * 0.4); ctx.fillStyle = `rgba(230,220,200,${0.08 + hash(i) * 0.06})`; ctx.fillRect(-120, -80, 240, 160); ctx.restore(); }
  if (TIMEIMG) { const z = lerp(1.0, 1.45, u), w = 560 * z, h = w * TIMEIMG.height / TIMEIMG.width; ctx.save(); ctx.translate(W / 2 + lerp(0, 40, u), H / 2 + lerp(20, 120, u)); ctx.rotate(lerp(-0.05, -0.02, u));
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 25; ctx.drawImage(TIMEIMG, -w / 2, -h / 2, w, h); ctx.restore(); }
  glow(ctx, W / 2, H / 2 - 100, 700, '255,210,150', 0.18); vignette(ctx, 0.5); grain(ctx, g, 0.05);
  source(ctx, 'TIME, 28 OCTOBER 1929 · PUBLIC DOMAIN (US)', 1); }
// ============ documents, close: re-created certificate / bond (with a pen forging a signature) / telegram / ledger ============
function doc(ctx, g, o = {}) { const kind = o.kind || 'bond', cam = camAt(g, o.cam || [[0, -60, 30, 1.05, 1.0], [8, 60, -30, 1.18, 1.0]]);
  sky(ctx, kind === 'bond' ? [[0, '#141a28'], [1, '#0a0d16']] : [[0, '#3a2a1c'], [1, '#1e140c']]);
  layer(ctx, cam, 1.0, x => { x.save(); x.translate(960, 560); x.rotate(-0.03);
    const pw = 1300, ph = 760; fillShade(x, rect(-pw / 2, -ph / 2, pw, ph), kind === 'telegram' ? '#efe2b8' : '#efe7d2', { line: LINE, y0: -ph / 2, y1: ph / 2, hi: 0.1 });
    x.fillStyle = '#2a2016'; x.textAlign = 'center'; x.textBaseline = 'middle';
    if (kind === 'certificate' || kind === 'bond') { x.strokeStyle = kind === 'bond' ? '#3a5a3a' : '#5a3a1a'; x.lineWidth = 14; x.strokeRect(-pw / 2 + 40, -ph / 2 + 40, pw - 80, ph - 80); x.lineWidth = 3; x.strokeRect(-pw / 2 + 64, -ph / 2 + 64, pw - 128, ph - 128);
      x.font = `700 70px ${P.SERIF}`; x.fillText(o.title || (kind === 'bond' ? 'REGNO D’ITALIA' : 'INTERNATIONAL MATCH'), 0, -230); x.font = `700 34px ${P.SERIF}`; x.fillText(o.sub || (kind === 'bond' ? 'MONOPOLIO DEI FIAMMIFERI · OBBLIGAZIONE' : 'CORPORATION · CERTIFICATE'), 0, -150);
      x.font = `italic 30px ${P.SERIF}`; for (let i = 0; i < 4; i++) { x.fillStyle = 'rgba(42,32,22,0.45)'; x.fillRect(-460, -70 + i * 50, 920 - (i === 3 ? 300 : 0), 10); }
      x.fillStyle = '#2a2016'; x.font = `900 120px ${P.SERIF}`; x.fillText(o.big || (kind === 'bond' ? '£ 500,000' : 'SHARES'), 0, 220);
      if (kind === 'bond') { const u = clamp((g - (o.signAt ?? 1.5)) / 2.2); x.strokeStyle = '#1b2a6a'; x.lineWidth = 5; x.lineCap = 'round'; x.beginPath(); for (let k = 0; k <= 80 * u; k++) { const q = k / 80; x.lineTo(160 + q * 360, 320 + Math.sin(q * 26) * 18 - q * 10); } x.stroke();
        const px = 160 + u * 360, py = 320 + Math.sin(u * 26) * 18 - u * 10; x.save(); x.translate(px, py); x.rotate(0.5); fillShade(x, rect(-7, -260, 14, 260), '#16120f', {}); fillShade(x, rect(-7, -60, 14, 18), '#d8b45a', {}); x.restore(); } }
    if (kind === 'telegram') { x.font = `900 60px monospace`; x.fillText('WESTERN UNION', 0, -280); x.font = `700 46px monospace`; x.textAlign = 'left';
      const msg = (o.lines || ['KREUGER STOCKHOLM', 'ERICSSON FIGURES NOT AS REPRESENTED', 'CANCEL AGREEMENT', 'RETURN 11 000 000 DOLLARS', 'ITT NEW YORK']); const n = Math.floor(clamp(g / (o.typeDur || 4)) * msg.join('').length); let used = 0;
      msg.forEach((m, i) => { const vis = m.slice(0, Math.max(0, n - used)); used += m.length; x.fillText(vis, -560, -160 + i * 80); }); }
    if (kind === 'ledger') { x.textAlign = 'left'; x.font = `700 34px monospace`; for (let i = 0; i < 11; i++) { x.fillStyle = '#2a2016'; x.fillText(['1926', '1927', '1928', '1929', '1930', '1931'][i % 6] + '   ' + ['PROFIT', 'DIVIDEND', 'ASSET', 'LOAN'][i % 4], -560, -300 + i * 60); x.textAlign = 'right'; x.save(); x.filter = 'blur(5px)'; x.fillText((hash(i) * 9e6 + 1e6).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), 560, -300 + i * 60); x.restore(); x.textAlign = 'left';
        if (g > (o.markAt ?? 1) + i * 0.25) { x.strokeStyle = '#c0281c'; x.lineWidth = 6; x.beginPath(); x.moveTo(-570, -300 + i * 60); x.lineTo(570, -300 + i * 60 + (hash(i) - 0.5) * 10); x.stroke(); } } }
    x.restore(); });
  grade(ctx, kind === 'bond' ? 'night' : 'warm', 0.5); vignette(ctx, 0.5); grain(ctx, g); label(ctx, 'RE-CREATED DOCUMENT · ILLUSTRATION'); }
// ============ the trick: coins from NEW investors go straight to OLD investors ============
function coins(ctx, g, o = {}) { sky(ctx, [[0, '#101624'], [1, '#070a12']]);
  const piles = [[420, 'NEW INVESTORS', '#e3a83a'], [1500, 'OLD INVESTORS', '#e3a83a']];
  for (const [x, lab] of piles) { fillShade(ctx, rect(x - 220, 820, 440, 40), '#2a2f3c', { line: LINE }); plate(ctx, lab, x, 920, 1, { size: 40, align: 'center', bg: 'none' }); }
  const n = 14; for (let i = 0; i < n; i++) { const u = clamp((g - 0.6 - i * 0.35) / 1.1); const x = lerp(420, 1500, ss(u)), y = lerp(800 - (n - i) * 18, 800 - i * 18, ss(u)) - Math.sin(u * Math.PI) * 300;
    ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.35 + 0.65 * Math.abs(Math.cos(u * 9))); fillShade(ctx, c => { c.beginPath(); c.ellipse(0, 0, 60, 60, 0, 0, 7); }, '#e3a83a', { line: '#8a5a10', lw: 4 }); ctx.restore(); }
  plate(ctx, 'PROFITS', W / 2, 260, ss((g - 2) / 0.4), { size: 44, align: 'center', bg: 'rgba(0,0,0,0.6)', col: '#8a8f99' }); ctx.save(); ctx.globalAlpha = ss((g - 2.4) / 0.3); ctx.strokeStyle = '#c0281c'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(W / 2 - 130, 260); ctx.lineTo(W / 2 + 130, 260); ctx.stroke(); ctx.restore();
  glow(ctx, W / 2, 600, 700, '255,190,90', 0.12); vignette(ctx, 0.5); grain(ctx, g); }
// ============ hourglass: governments repay slowly, investors want dividends every year ============
function hourglass(ctx, g, o = {}) { sky(ctx, [[0, '#2a2018'], [1, '#120c08']]); const cx = W / 2, cy = 540, u = clamp(g / (o.dur || 9)) * 0.25;
  ctx.save(); ctx.translate(cx, cy); fillShade(ctx, rect(-230, -380, 460, 40), '#5a3a22', { line: LINE }); fillShade(ctx, rect(-230, 340, 460, 40), '#5a3a22', { line: LINE });
  ctx.strokeStyle = 'rgba(220,235,245,0.7)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-180, -340); ctx.quadraticCurveTo(-170, -40, -14, 0); ctx.quadraticCurveTo(-170, 40, -180, 340); ctx.moveTo(180, -340); ctx.quadraticCurveTo(170, -40, 14, 0); ctx.quadraticCurveTo(170, 40, 180, 340); ctx.stroke();
  ctx.fillStyle = '#e3a83a'; ctx.beginPath(); const top = -40 - (1 - u) * 260; ctx.moveTo(-160 * (1 - u), top); ctx.lineTo(160 * (1 - u), top); ctx.lineTo(14, -10); ctx.lineTo(-14, -10); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-170, 336); ctx.lineTo(170, 336); ctx.lineTo(60, 336 - u * 300); ctx.lineTo(-60, 336 - u * 300); ctx.closePath(); ctx.fill(); ctx.fillRect(-3, 0, 6, 330 - u * 300);
  for (let i = 0; i < 6; i++) { const q = ((g * 1.4 + i / 6) % 1); ctx.beginPath(); ctx.arc(0, q * 320, 4, 0, 7); ctx.fill(); } ctx.restore();
  glow(ctx, cx, cy, 500, '255,200,120', 0.15); vignette(ctx, 0.5); grain(ctx, g); }
module.exports = { strike, closeup, archive, doc, coins, hourglass, ready };
