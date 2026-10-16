// Ep4 town cast on the crew rig (lib/crew.js stays untouched): Tom (corner-shop clerk) and Officer Dan.
// drawTom / drawDan(ctx, x, hipY, s, pose) — same pose API as drawCrew (hip = floor - 280*s).
// Props: mapProp(ctx, s, open), phoneProp(ctx, s, screen), burgerProp(ctx, X, Y, s).
const { OL, paint, line, curve, roundRect } = require('./draw');
const crew = require('./crew');
const SH_Y = -250, SH_X = 95;

// ---- Tom: green apron over a striped shirt, curly hair, name tag ----
function tomTorso(ctx) {
  const shirt = c => {
    c.moveTo(-SH_X - 14, SH_Y - 14); c.quadraticCurveTo(0, SH_Y - 44, SH_X + 14, SH_Y - 14);
    c.bezierCurveTo(SH_X + 32, SH_Y + 10, SH_X + 18, -40, 96, 30); c.quadraticCurveTo(0, 44, -96, 30);
    c.bezierCurveTo(-SH_X - 18, -40, -SH_X - 32, SH_Y + 10, -SH_X - 14, SH_Y - 14); c.closePath();
  };
  paint(ctx, shirt, '#F4F1EA', { shade: '#D9D3C6', sx: 12, sy: 6, lw: 6 });
  ctx.save(); ctx.beginPath(); shirt(ctx); ctx.clip(); ctx.fillStyle = '#6E9BD6';
  for (let x = -120; x < 130; x += 34) ctx.fillRect(x, SH_Y - 50, 12, 340); ctx.restore();
  ctx.save(); ctx.beginPath(); shirt(ctx); ctx.lineWidth = 6; ctx.strokeStyle = OL; ctx.stroke(); ctx.restore();
  // collar
  for (const k of [-1, 1]) paint(ctx, c => { c.moveTo(0, SH_Y - 20); c.lineTo(k * 50, SH_Y - 30); c.lineTo(k * 34, SH_Y + 14); c.closePath(); }, '#F4F1EA', { lw: 5 });
  // apron + straps
  for (const k of [-1, 1]) line(ctx, [[k * 40, SH_Y - 22], [k * 56, SH_Y + 70]], 12, '#2F9466');
  paint(ctx, c => { c.moveTo(-64, SH_Y + 60); c.lineTo(64, SH_Y + 60); c.lineTo(86, 40); c.quadraticCurveTo(0, 52, -86, 40); c.closePath(); }, '#2F9466', { shade: '#247A53', sx: 10, sy: 4, lw: 6 });
  paint(ctx, c => roundRect(c, -40, -120, 80, 46, 8), '#247A53', { lw: 4 }); // pocket
  paint(ctx, c => roundRect(c, 14, SH_Y + 78, 58, 24, 6), '#FFFFFF', { lw: 3.5 });
  ctx.fillStyle = '#2F9466'; ctx.font = '800 16px FredokaL, NunitoC'; ctx.textAlign = 'center'; ctx.fillText('TOM', 43, SH_Y + 96);
}
function tomHair(ctx) {
  const C = '#3A2A20', S = '#22170F';
  paint(ctx, c => {
    c.moveTo(-152, 0); c.bezierCurveTo(-168, -100, -96, -164, 0, -164); c.bezierCurveTo(96, -164, 168, -100, 152, 0);
    c.lineTo(132, -40); c.bezierCurveTo(100, -96, 40, -104, 0, -96); c.bezierCurveTo(-40, -104, -100, -96, -132, -40); c.closePath();
  }, C, { shade: S, sx: -8, sy: -8 });
  for (const [x, y] of [[-110, -120], [-60, -150], [0, -160], [60, -150], [110, -120], [-140, -60], [140, -60]]) paint(ctx, c => c.arc(x, y, 30, 0, 7), C, { lw: 5 });
  for (const [x, y] of [[-60, -140], [10, -150], [70, -136]]) curve(ctx, [x - 14, y + 6], [x, y - 10], [x + 14, y + 6], 3, '#6A5040');
}
crew.STYLES.tom = { glasses: false, mustache: false, steth: false, torso: tomTorso, hair: tomHair,
  pal: { hair: '#3A2A20', hairSh: '#22170F', hairHi: '#6A5040', browCore: '#22170F', iris: '#5A7A3A', irisDk: '#3A5226', skin: '#F2C9A6', skinSh: '#D6A47E',
    shirt: '#F4F1EA', sleeve: '#F4F1EA', sleeveSh: '#D9D3C6', cuff: '#6E9BD6', pants: '#3B4656', pantsSh: '#2A323E', shoe: '#5B3A2E', shoeSh: '#3A2620' } };

// ---- Officer Dan: navy police uniform + cap, badge, radio ----
function danExtra(ctx) {
  paint(ctx, c => { c.moveTo(-10, SH_Y - 14); c.lineTo(10, SH_Y - 14); c.lineTo(14, SH_Y + 50); c.lineTo(0, SH_Y + 62); c.lineTo(-14, SH_Y + 50); c.closePath(); }, '#1A2340', { lw: 4 });
  ctx.save(); ctx.translate(-56, SH_Y + 82); // star badge
  paint(ctx, c => { for (let i = 0; i < 10; i++) { const r = i % 2 ? 9 : 20, a = -Math.PI / 2 + i * Math.PI / 5; c[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); }, '#F2C744', { shade: '#C79A2A', sx: 2, sy: 2, lw: 3.5 });
  ctx.restore();
  paint(ctx, c => roundRect(c, 22, SH_Y + 70, 70, 26, 5), '#FFFFFF', { lw: 3.5 });
  ctx.fillStyle = '#1E2E5A'; ctx.font = '800 15px FredokaL, NunitoC'; ctx.textAlign = 'center'; ctx.fillText('POLICE', 57, SH_Y + 88);
  paint(ctx, c => roundRect(c, 60, SH_Y + 6, 24, 40, 6), '#2A2E3A', { lw: 3.5 }); // radio
  line(ctx, [[78, SH_Y + 6], [78, SH_Y - 18]], 4, '#2A2E3A');
  paint(ctx, c => roundRect(c, -98, 4, 196, 26, 6), '#1F2128', { lw: 4 }); // belt
  paint(ctx, c => roundRect(c, -16, 2, 32, 30, 5), '#C9CDD6', { lw: 3.5 });
}
function danHair(ctx) { for (const k of [-1, 1]) paint(ctx, c => { c.moveTo(k * 154, -4); c.bezierCurveTo(k * 158, -30, k * 156, -50, k * 146, -66); c.lineTo(k * 126, -60); c.lineTo(k * 130, -2); c.closePath(); }, '#1E1612', { lw: 4 }); }
crew.STYLES.dan = Object.assign({}, crew.STYLES.bob, { mustache: false, extra: danExtra, hair: danHair, browW: 13,
  pal: { hair: '#1E1612', hairSh: '#120C09', hairHi: '#3A2E28', browCore: '#120C09', iris: '#5A3A22', irisDk: '#3A2414', skin: '#B97A56', skinSh: '#9A5F40',
    jacket: '#2A3D73', jacketSh: '#1E2E5A', shirt: '#C9D6EE', sleeve: '#2A3D73', sleeveSh: '#1E2E5A', cuff: '#C9D6EE', button: '#F2C744', pants: '#1E2E5A', pantsSh: '#141F40', shoe: '#14161C', shoeSh: '#08090C' } });

const drawTom = (ctx, x, y, s, p) => crew.drawCrew(ctx, x, y, s, p, 'tom');
const drawDan = (ctx, x, y, s, p) => crew.drawCrew(ctx, x, y, s, p, 'dan');

// ---- props (drawn upright at the origin) ----
function mapProp(ctx, s = 1) {
  ctx.save(); ctx.scale(s, s);
  paint(ctx, c => roundRect(c, -70, -50, 140, 100, 6), '#FFF6DE', { shade: '#EADBB8', sx: 6, sy: 4, lw: 5 });
  for (const x of [-23, 23]) line(ctx, [[x, -50], [x, 50]], 3, '#D8C79E');
  ctx.save(); ctx.globalAlpha = 0.9;
  line(ctx, [[-60, 20], [60, 20]], 8, '#F2C744'); line(ctx, [[-10, -44], [-10, 44]], 8, '#F2C744');
  paint(ctx, c => c.arc(36, -22, 13, 0, 7), '#8ED28A', { lw: 3 });
  paint(ctx, c => { c.moveTo(-40, -20); c.lineTo(-40, -36); c.arc(-40, -36, 9, Math.PI, 0); c.closePath(); }, '#E5484D', { lw: 3 });
  ctx.restore(); ctx.restore();
}
function phoneProp(ctx, s = 1, screen = 'dark') {
  ctx.save(); ctx.scale(s, s);
  paint(ctx, c => roundRect(c, -26, -46, 52, 92, 10), '#2A2E3A', { lw: 5 });
  paint(ctx, c => roundRect(c, -20, -38, 40, 74, 6), screen === 'on' ? '#9ED4F2' : '#141820', { lw: 0 });
  if (screen === 'empty') { paint(ctx, c => roundRect(c, -12, -6, 22, 12, 3), '#141820', { ol: '#E5484D', lw: 3 }); paint(ctx, c => c.rect(10, -3, 3, 6), '#E5484D', { lw: 0 }); }
  ctx.restore();
}
function burgerProp(c, X, Y, s) {
  c.save(); c.translate(X, Y); c.scale(s, s);
  paint(c, q => { q.moveTo(-80, -6); q.bezierCurveTo(-80, -70, 80, -70, 80, -6); q.closePath(); }, '#E9A54A', { shade: '#C8862E', sx: 0, sy: -8, lw: 6 });
  c.fillStyle = '#FFF4D6'; for (const [x, y] of [[-40, -34], [-8, -46], [28, -36], [50, -22], [-58, -18]]) { c.beginPath(); c.ellipse(x, y, 7, 4, 0.3, 0, 7); c.fill(); }
  paint(c, q => { q.moveTo(-88, 0); for (let i = 0; i <= 8; i++) q.lineTo(-88 + i * 22, i % 2 ? 14 : 2); q.lineTo(88, 2); q.closePath(); }, '#6FCF5F', { lw: 5 });
  paint(c, q => roundRect(q, -84, 8, 168, 22, 10), '#FFD23F', { lw: 5 });
  paint(c, q => roundRect(q, -82, 24, 164, 30, 14), '#8A4A2E', { lw: 6 });
  paint(c, q => { q.moveTo(-80, 52); q.lineTo(80, 52); q.bezierCurveTo(80, 82, -80, 82, -80, 52); q.closePath(); }, '#E9A54A', { lw: 6 });
  c.restore();
}

module.exports = { drawTom, drawDan, mapProp, phoneProp, burgerProp };
