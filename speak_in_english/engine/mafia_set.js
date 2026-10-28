// THE ACCIDENTAL MAFIA BOSS — cast, Bella Notte dining room and props (new files only; cast_v2 bases stay untouched).
const H = require('./hq');
const { geom } = require('./pose');
const { paint, rr, rgba, mix, shade, hash, createCanvas, lerp } = H;

// ---------------------------------------------------------------- cast
const CAST = {
  alex: { kind: 'human', h: 1560, seed: 61, skin: '#F2C9A8', iris: '#4A6A8A', jaw: 1.05, blush: '#F07C8C', blushA: 0.35,
    hair: { style: 'quiff', col: '#6A4428' }, brow: '#5A3820',
    build: { shoulder: 0.95 },
    top: { type: 'blazer', col: '#4F78B0', shirt: '#FFFFFF', tie: '#F2C14E' }, bottom: { type: 'trousers', col: '#3A4256' }, shoes: { col: '#7A4A2A', acc: null } },
  tony: { kind: 'human', h: 1700, seed: 62, skin: '#D9A97E', iris: '#2A1A10', jaw: 1.2, stubble: '#2A1A10',
    hair: { style: 'short', col: '#14100E' }, mustache: '#14100E', brow: '#14100E', browW: 9,
    build: { shoulder: 1.0, hip: 0.95 },
    top: { type: 'blazer', col: '#2B2F3A', shirt: '#B89AD8', tie: '#14100E' }, bottom: { type: 'trousers', col: '#2B2F3A' }, shoes: { col: '#14100E', acc: null } },
  bruno: { kind: 'human', h: 1900, seed: 63, skin: '#E3AE88', iris: '#3A2A1A', jaw: 1.4, headScale: 0.84, stubble: '#4A3020',
    hair: { style: 'buzz', col: '#3A2618' }, brow: '#3A2618', browW: 13,
    build: { shoulder: 1.55, hip: 1.25, arm: 1.6, belly: 0.9, chest: 0.5, neck: 1.7 },
    top: { type: 'tee', col: '#7FA6C8' }, bottom: { type: 'trousers', col: '#4A4F5C' }, shoes: { col: '#2B2F3A', acc: null } },
  marco: { kind: 'human', h: 1340, seed: 64, skin: '#E6B892', iris: '#2A1A10', jaw: 1.1, bigNose: true,
    hair: { style: 'short', col: '#1A1210' }, mustache: '#1A1210', brow: '#1A1210', browW: 12,
    build: { shoulder: 0.95, arm: 1.05 },
    top: { type: 'blazer', col: '#7A2E34', shirt: '#1E1E24', tie: '#C9A24A' }, bottom: { type: 'trousers', col: '#2B2F3A' }, shoes: { col: '#14100E', acc: null } },
  patterson: { kind: 'human', h: 1300, seed: 65, skin: '#F4D2BC', iris: '#4A6A8A', age: 1, lashes: true, lips: '#C76A86', blush: '#F09AAA', blushA: 0.5,
    hair: { style: 'bouffant', col: '#D8D0E4' }, glasses: { col: '#9A6AC8' }, necklace: true,
    build: { shoulder: 0.92, hip: 1.1, belly: 0.25 },
    top: { type: 'cardigan', col: '#E8A0B4' }, bottom: { type: 'skirt', col: '#6A5A8A' }, shoes: { col: '#8A5A6A', acc: null } },
};
const G = {}; for (const k in CAST) G[k] = geom(CAST[k]);

// Bruno's apron (afterTorso hook: drawn over the tee, under the arms)
function apron(g) {
  return (ctx) => { const w = g.sw * 0.78, top = g.ySh + g.h * 0.08, bot = -g.h * 0.24;
    ctx.strokeStyle = '#D8D2C6'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-w * 0.55, top); ctx.lineTo(-g.hw * 0.45, g.ySh - 10); ctx.moveTo(w * 0.55, top); ctx.lineTo(g.hw * 0.45, g.ySh - 10); ctx.stroke();
    paint(ctx, q => { q.m(-w * 0.62, top); q.l(w * 0.62, top); q.l(w * 0.66, -g.h * 0.5); q.l(w * 1.0, -g.h * 0.49); q.l(w * 0.98, bot); q.q(0, bot + 30, -w * 0.98, bot); q.l(-w, -g.h * 0.49); q.l(-w * 0.66, -g.h * 0.5); q.z(); }, '#FFFFFF', { sd: 12, hd: 5, lw: 4 });
    ctx.fillStyle = 'rgba(180,60,50,.35)'; ctx.beginPath(); ctx.ellipse(w * 0.3, -g.h * 0.36, 22, 14, 0.3, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(-w * 0.2, -g.h * 0.3, 12, 9, 0, 0, 7); ctx.fill();   // sauce stains
    ctx.fillStyle = '#ECE6DA'; ctx.fillRect(-w * 0.36, -g.h * 0.42, w * 0.72, 8); };
}

// ---------------------------------------------------------------- props (hq items: drawn at the wrist, a = forearm angle)
const knuckles = (cfg) => { const r = cfg.h * 0.03; return (ctx, a, side) => { ctx.save(); ctx.rotate(a - Math.PI / 2); ctx.scale(side < 0 ? -1 : 1, 1);
  for (let i = 0; i < 4; i++) { const x = -r * 0.6 + i * r * 0.4; paint(ctx, q => q.e(x, r * 0.88, r * 0.24, r * 0.2), '#E8C060', { sd: 3, hd: 2, lw: 3, inner: c => { c.fillStyle = '#7A5A20'; c.beginPath(); c.ellipse(x, r * 0.88, r * 0.1, r * 0.08, 0, 0, 7); c.fill(); } }); }
  paint(ctx, q => { q.m(-r * 0.78, r * 0.62); q.l(r * 0.78, r * 0.62); q.l(r * 0.7, r * 0.72); q.l(-r * 0.7, r * 0.72); q.z(); }, '#D4A848', { sd: 2, hd: 1, lw: 2.5 }); ctx.restore(); }; };
// baseball bat drawn along +y from the grip; `ang` = absolute world angle of the bat (0 = pointing down)
function batShape(c, len = 640) {
  paint(c, q => { q.m(-10, -40); q.l(10, -40); q.l(14, len * 0.45); q.q(34, len * 0.75, 30, len); q.q(0, len + 18, -30, len); q.q(-34, len * 0.75, -14, len * 0.45); q.z(); }, '#C98A4A', { sd: 8, hd: 4, lw: 4,
    inner: k => { k.fillStyle = '#2B2F3A'; k.fillRect(-12, -40, 24, 120); k.strokeStyle = 'rgba(255,255,255,.25)'; k.lineWidth = 6; k.beginPath(); k.moveTo(-14, len * 0.55); k.lineTo(-20, len * 0.92); k.stroke(); } });
  paint(c, q => q.e(0, -46, 18, 10), '#2B2F3A', { sd: 2, hd: 1, lw: 3 });
}
const batItem = (ang) => (ctx) => { ctx.save(); ctx.rotate(ang); ctx.translate(0, -40); batShape(ctx); ctx.restore(); };
// the notebook "MY PERFECT RESTAURANT PLAN": closed (cover) or open (two pages with the checklist)
function notebook(c, open = 0, ticks = 0) {
  if (open < 0.5) {
    paint(c, q => { q.m(-95, -130); q.l(95, -130); q.l(95, 130); q.l(-95, 130); q.z(); }, '#B8323C', { sd: 6, hd: 3, lw: 4 });
    c.fillStyle = '#2B2F3A'; for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(-95, -110 + i * 36, 7, 0, 7); c.fill(); }
    c.fillStyle = '#F2D488'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '25px Unb9'; c.fillText('MY', 4, -78); c.font = '24px Unb9'; c.fillText('PERFECT', 4, -46); c.font = '17px Unb9'; c.fillText('RESTAURANT', 4, -16); c.font = '25px Unb9'; c.fillText('PLAN', 4, 14);
    c.font = '46px Unb9'; c.fillText('★', 4, 72);
  } else {
    for (const s of [-1, 1]) paint(c, q => { q.m(0, -125); q.l(s * 175, -135); q.l(s * 175, 125); q.l(0, 130); q.z(); }, '#FFFDF6', { sd: 5, hd: 3, lw: 3.5 });
    c.fillStyle = '#2B2F3A'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.font = '22px Cav7';
    const L = ['1. No fighting', '2. Smile more', '3. Name tags', '4. Clean all'];
    L.forEach((s, i) => { c.fillText(s, 18, -86 + i * 50); if (i < ticks) { c.strokeStyle = '#3C9A4A'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(140, -90 + i * 50); c.lineTo(150, -78 + i * 50); c.lineTo(168, -104 + i * 50); c.stroke(); } });
    c.strokeStyle = '#E0474C'; c.lineWidth = 3; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-160, -86 + i * 46); c.lineTo(-20, -84 + i * 46); c.stroke(); }
    c.font = '30px Cav7'; c.fillStyle = '#E0474C'; c.fillText('5 ★★★★★', -150, 100);
  }
}
const notebookItem = (open, ticks) => (ctx) => { ctx.save(); ctx.translate(0, 40); notebook(ctx, open, ticks); ctx.restore(); };
function teacup(c, x, y, rot = 0, s = 1) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  paint(c, q => { q.m(-46, -48); q.l(46, -48); q.q(44, 10, 0, 14); q.q(-44, 10, -46, -48); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 3.5, inner: k => { k.fillStyle = '#7FB0D8'; k.fillRect(-46, -30, 92, 10); } });
  c.strokeStyle = '#3A3F4B'; c.lineWidth = 7; c.beginPath(); c.arc(52, -22, 16, -1.4, 1.4); c.stroke(); c.restore(); }
const teacupItem = (ctx) => { ctx.save(); ctx.translate(-10, -10); teacup(ctx, 0, 0, 0, 0.9); ctx.restore(); };

// ---------------------------------------------------------------- set: Bella Notte dining room (world units, floor y = 0)
const BX0 = -3600, BY0 = -2700, BW = 7600, BH = 3700, BS = 0.5;
function txt(c, s, x, y, size, col, font = 'Unb9') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function drawRoom(c) {
  // wall: warm plaster with a soft gradient, dark wood wainscot, crown moulding
  const wg = c.createLinearGradient(0, BY0, 0, 0); wg.addColorStop(0, '#E9CFA8'); wg.addColorStop(1, '#F3DEC0'); c.fillStyle = wg; c.fillRect(BX0, BY0, BW, 2700);
  c.fillStyle = '#7A4A2E'; c.fillRect(BX0, -760, BW, 760); c.fillStyle = '#8E5836'; for (let x = BX0; x < BX0 + BW; x += 380) { c.fillRect(x + 30, -700, 320, 640); } c.fillStyle = '#5E3420'; c.fillRect(BX0, -790, BW, 40);
  c.fillStyle = '#C9A06A'; c.fillRect(BX0, -2300, BW, 34);
  // striped awning-like frieze
  for (let i = 0; i < 40; i++) { c.fillStyle = i % 2 ? '#3C8A4A' : '#E0474C'; c.fillRect(BX0 + i * 200, -2266, 200, 40); }
  // neon sign
  c.save(); c.shadowColor = '#FF6A7A'; c.shadowBlur = 40; txt(c, 'Bella Notte', 200, -1870, 210, '#FF5468', 'Cav7'); c.restore(); txt(c, 'Bella Notte', 200, -1870, 210, '#FFD9DE', 'Cav7');
  txt(c, 'RISTORANTE · SINCE 1962', 200, -1690, 44, '#7A4A2E', 'Unb7');
  // framed family photos (silhouettes of very serious men)
  const frame = (x, y, w, hh, n) => { paint(c, q => { q.m(x - w / 2, y - hh / 2); q.l(x + w / 2, y - hh / 2); q.l(x + w / 2, y + hh / 2); q.l(x - w / 2, y + hh / 2); q.z(); }, '#C9A04A', { sd: 6, hd: 3, lw: 4 });
    c.fillStyle = '#E8E0CC'; c.fillRect(x - w / 2 + 22, y - hh / 2 + 22, w - 44, hh - 44);
    for (let i = 0; i < n; i++) { const px = x - (n - 1) * 60 + i * 120; c.fillStyle = '#4A4038'; c.beginPath(); c.arc(px, y - 10, 34, 0, 7); c.fill(); c.fillRect(px - 50, y + 30, 100, hh / 2 - 52); c.fillStyle = '#2B2F3A'; c.fillRect(px - 40, y - 46, 80, 14); } };
  frame(-1500, -1350, 420, 320, 3); frame(-2350, -1450, 300, 380, 1); frame(1600, -1400, 460, 300, 3); frame(2450, -1350, 300, 340, 2);
  // wall clock
  paint(c, q => q.a(-650, -1480, 120), '#FFFDF8', { sd: 8, hd: 4, lw: 6 }); c.strokeStyle = '#2B2F3A'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(-650, -1480); c.lineTo(-650, -1560); c.moveTo(-650, -1480); c.lineTo(-590, -1470); c.stroke();
  // kitchen door (left) with a round window
  paint(c, q => { q.m(-3300, -1500); q.l(-2700, -1500); q.l(-2700, 0); q.l(-3300, 0); q.z(); }, '#9A6A44', { sd: 12, hd: 6, lw: 5 });
  paint(c, q => q.a(-3000, -1050, 110), '#BFE0EE', { sd: 6, hd: 3, lw: 8 }); txt(c, 'CUCINA', -3000, -1330, 54, '#F3DEC0');
  // entrance door (right): glass with a reversed OPEN sign
  paint(c, q => { q.m(3000, -1650); q.l(3600, -1650); q.l(3600, 0); q.l(3000, 0); q.z(); }, '#5E3420', { sd: 10, hd: 5, lw: 5 });
  c.fillStyle = '#BFE0EE'; c.fillRect(3060, -1590, 480, 1000); c.save(); c.translate(3300, -1300); c.scale(-1, 1); rr(c, -120, -40, 240, 80, 12); c.fillStyle = '#E0474C'; c.fill(); txt(c, 'OPEN', 0, 0, 52, '#FFFFFF'); c.restore();
  // string lights
  for (let i = 0; i < 34; i++) { const x = BX0 + 200 + i * 210, y = -2150 + Math.sin(i * 0.9) * 30 + (i % 4) * 14; c.fillStyle = ['#F2C14E', '#FF8A5C', '#FFF2C4'][i % 3]; c.save(); c.shadowColor = '#FFD27A'; c.shadowBlur = 24; c.beginPath(); c.arc(x, y, 16, 0, 7); c.fill(); c.restore(); }
  // floor: terracotta tiles with a little perspective (rows get taller toward the camera)
  c.fillStyle = '#C98A62'; c.fillRect(BX0, 0, BW, 1000);
  let y = 0; for (let r = 0; r < 9; r++) { const hgt = 40 + r * 22; for (let x = BX0 - 400, i = 0; x < BX0 + BW + 400; x += 260, i++) { if ((i + r) % 2) { c.fillStyle = '#B97A54'; const k = (y) / 1000, sx = (x - 200) * (1 + k * 0.6); c.beginPath(); c.moveTo(x - 200 + (x - 200) * y * 0.0006, y); c.lineTo(x + 60 + (x + 60) * y * 0.0006, y); c.lineTo(x + 60 + (x + 60) * (y + hgt) * 0.0006, y + hgt); c.lineTo(x - 200 + (x - 200) * (y + hgt) * 0.0006, y + hgt); c.fill(); void sx; } } y += hgt; }
  const fg = c.createLinearGradient(0, 0, 0, 160); fg.addColorStop(0, 'rgba(60,30,20,.35)'); fg.addColorStop(1, 'rgba(60,30,20,0)'); c.fillStyle = fg; c.fillRect(BX0, 0, BW, 160);
}
let BG = null;
function background() { if (BG) return BG; BG = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = BG.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); drawRoom(c); return BG; }
function drawBackground(c) { c.drawImage(background(), BX0, BY0, BW, BH); }

// a dining table seen from the front: checked tablecloth hanging to the floor (hides what is under it)
function table(c, x0, x1, top, floor = 0, o = {}) {
  paint(c, q => { q.m(x0 - 20, top); q.l(x1 + 20, top); q.l(x1 + 40, top + 70); q.l(x0 - 40, top + 70); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 4 });
  const cloth = q => { q.m(x0 - 40, top + 70); q.l(x1 + 40, top + 70); q.l(x1 + 70, floor - (o.gap ?? 30)); q.l(x0 - 70, floor - (o.gap ?? 30)); q.z(); };
  paint(c, cloth, '#F6F0E6', { sd: 14, hd: 6, lw: 4, inner: k => { k.fillStyle = 'rgba(224,71,76,.75)'; const s = 70; for (let yy = top + 70; yy < floor; yy += s) for (let xx = x0 - 80; xx < x1 + 80; xx += s) if (((xx - x0) / s + (yy - top) / s | 0) % 2 === 0) k.fillRect(xx, yy, s, s); } });
  if (o.candle) { const cx = (x0 + x1) / 2; c.fillStyle = '#3C6A3A'; rr(c, cx - 26, top - 120, 52, 120, 16); c.fill(); c.fillStyle = '#FFF2C4'; c.fillRect(cx - 8, top - 175, 16, 60); c.save(); c.shadowColor = '#FFB347'; c.shadowBlur = 30; c.fillStyle = '#FFB347'; c.beginPath(); c.ellipse(cx, top - 195, 10, 20, 0, 0, 7); c.fill(); c.restore(); }
}
function chair(c, x, floor, s = 1) { c.save(); c.translate(x, floor); c.scale(s, s); paint(c, q => { q.m(-150, -1050); q.l(150, -1050); q.l(150, -520); q.l(-150, -520); q.z(); }, '#7A4A2E', { sd: 10, hd: 5, lw: 4, inner: k => { k.fillStyle = '#5E3420'; for (let i = 0; i < 3; i++) k.fillRect(-110 + i * 90, -990, 40, 420); } }); c.restore(); }

module.exports = { CAST, G, apron, knuckles, batShape, batItem, notebook, notebookItem, teacup, teacupItem, drawBackground, table, chair, txt };
