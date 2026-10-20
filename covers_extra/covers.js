// TikTok-safe covers 1080x1920 for two uploaded videos (credit card trap, gym no-shows). Same rules as COVERS.md.
// Usage: node covers.js   -> card_trap_cover.png, gym_sponsor_cover.png
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const { C, F, cut, rr, coin, bill, contact, tag } = K;
const W = 1080, H = 1920;
function base(bg, disc) {
  const c = createCanvas(W, H), x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, W, H);
  // torn paper strips in the background
  const cols = ['rgba(230,57,70,0.10)', 'rgba(38,166,154,0.12)', 'rgba(255,200,87,0.18)'];
  for (let i = 0; i < 16; i++) { x.save(); x.translate(K.hash(i) * W, K.hash(i + 40) * H); x.rotate(-0.25 + K.hash(i + 9) * 0.2); x.fillStyle = cols[i % 3]; x.fillRect(-130, -22, 260, 44); x.restore(); }
  x.fillStyle = disc; x.beginPath(); x.arc(540, 1150, 400, 0, 7); x.fill();
  return [c, x];
}
function title(x, l1, red, l3, col = C.ink) {
  x.textAlign = 'center'; x.fillStyle = col; x.font = `104px ${F.black}`; x.fillText(l1, 540, 400);
  x.font = `140px ${F.black}`; const w = x.measureText(red).width + 90;
  x.save(); x.translate(540, 528); x.rotate(-0.03); cut(x, () => rr(x, -w / 2, -88, w, 162, 10), C.red, { lw: 0, sb: 24, sy: 12, edgeW: 12 });
  x.fillStyle = '#FFFFFF'; x.fillText(red, 0, 50); x.restore();
  if (l3) { x.fillStyle = col; x.font = `104px ${F.black}`; x.fillText(l3, 540, 720); }
}
function finish(c, x, name) {
  x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.55; x.drawImage(K.paperTexture(W, H), 0, 0); x.restore();
  require('fs').writeFileSync(__dirname + '/' + name, c.toBuffer('image/png'));
}
function card(x, w, h) { // generic credit card (no network logo)
  cut(x, () => rr(x, -w / 2, -h / 2, w, h, 22), C.red, { sb: 18 });
  x.fillStyle = C.yellow; rr(x, -w / 2 + 40, -h / 2 + 70, 70, 54, 8); x.fill(); x.lineWidth = 2.5; x.strokeStyle = C.ink; x.stroke();
  x.fillStyle = 'rgba(255,255,255,0.85)'; x.font = `26px ${F.black}`; x.textAlign = 'left'; x.fillText('••••  ••••  ••••  5000', -w / 2 + 40, h / 2 - 60);
  x.font = `18px ${F.xb}`; x.fillText('YOUR NAME', -w / 2 + 40, h / 2 - 28);
}

// ---- 1. credit card trap ----
{
  const [c, x] = base(C.paper, C.yellow);
  title(x, 'THE CREDIT CARD', 'TRAP', null);
  tag(x, '$5,000  →  $12,700', 540, 700, { size: 64, bg: C.ink, rot: -0.02 });
  // mousetrap
  x.save(); x.translate(520, 1240);
  contact(x, 0, 120, 380, 26, 0.25);
  cut(x, () => { x.beginPath(); x.moveTo(-390, 0); x.lineTo(390, 0); x.lineTo(410, 110); x.lineTo(-410, 110); x.closePath(); }, '#C98E5F', { sb: 26 });
  x.fillStyle = '#A76E46'; x.fillRect(-410, 80, 820, 30); x.strokeStyle = C.ink; x.lineWidth = 3.5; x.strokeRect(-410, 80, 820, 30);
  x.strokeStyle = 'rgba(126,80,52,0.5)'; x.lineWidth = 3; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(-330 + i * 40, 22 + i * 14); x.lineTo(200 + i * 30, 22 + i * 14); x.stroke(); }
  x.save(); x.translate(110, -110); x.rotate(-0.12); card(x, 400, 250); x.restore();
  // wire bar snapped over the card
  x.strokeStyle = '#3A3A3A'; x.lineWidth = 14; x.lineJoin = 'round'; x.beginPath(); x.moveTo(-200, 40); x.lineTo(-200, -170); x.lineTo(330, -170); x.lineTo(330, 40); x.stroke();
  x.strokeStyle = '#9A9A9A'; x.lineWidth = 6; x.stroke();
  x.fillStyle = '#777'; x.beginPath(); x.ellipse(-250, 40, 36, 46, 0, 0, 7); x.fill(); x.lineWidth = 3.5; x.strokeStyle = C.ink; x.stroke();
  x.restore();
  for (let i = 0; i < 4; i++) coin(x, 190, 1450 - i * 22, 46, 0.02, { flat: i > 0 });
  bill(x, 820, 1440, 1.4, 0.2);
  finish(c, x, 'card_trap_cover.png');
}

// ---- 2. gym ----
{
  const [c, x] = base(C.yellow, '#FFE3A0');
  title(x, 'YOUR GYM', 'WANTS', 'NO-SHOWS');
  tag(x, '6,000 MEMBERS · ROOM FOR 300', 540, 830, { size: 46, bg: C.ink, rot: 0.02 });
  x.save(); x.translate(540, 1420);
  contact(x, 0, 6, 360, 24, 0.25);
  cut(x, () => rr(x, -300, -420, 600, 420, 8), '#2C5D8F', { sb: 26 });
  x.strokeStyle = 'rgba(255,255,255,0.18)'; x.lineWidth = 4; for (let i = 1; i < 10; i++) { x.beginPath(); x.moveTo(-300 + i * 60, -420); x.lineTo(-300 + i * 60, 0); x.stroke(); }
  cut(x, () => rr(x, -230, -330, 160, 130, 6), '#FFF3D6', { sb: 8 }); cut(x, () => rr(x, 70, -330, 160, 130, 6), '#FFF3D6', { sb: 8 });
  cut(x, () => rr(x, -70, -170, 140, 170, 4), '#1A1A1A', { sb: 6 });
  cut(x, () => rr(x, -250, -540, 500, 120, 14), C.yellow, { sb: 18 });
  x.fillStyle = C.ink; x.font = `84px ${F.black}`; x.textAlign = 'center'; x.fillText('GYM', 50, -448);
  x.fillRect(-170, -490, 110, 18); x.fillRect(-180, -515, 22, 68); x.fillRect(-72, -515, 22, 68);
  x.save(); x.translate(195, -95); x.rotate(-0.35); tag(x, 'EMPTY', 0, 0, { size: 44, bg: C.red }); x.restore();
  x.restore();
  // membership card with SPONSOR stamp
  x.save(); x.translate(250, 1495); x.rotate(-0.1);
  cut(x, () => rr(x, -180, -110, 360, 220, 16), '#FFFFFF', { sb: 18 });
  x.fillStyle = C.green; rr(x, -180, -110, 360, 56, [16, 16, 0, 0]); x.fill();
  x.fillStyle = '#FFFFFF'; x.font = `34px ${F.black}`; x.textAlign = 'left'; x.fillText('MEMBER', -160, -70);
  x.strokeStyle = C.greyD; x.setLineDash([8, 6]); x.lineWidth = 4; rr(x, -160, -36, 100, 120, 8); x.stroke(); x.setLineDash([]);
  x.fillStyle = C.ink; for (let i = 0; i < 26; i++) x.fillRect(-40 + i * 7.5, 40, (i % 3) + 2, 46);
  x.restore();
  x.save(); x.translate(270, 1490); x.rotate(-0.16); x.strokeStyle = C.red; x.lineWidth = 9; rr(x, -165, -48, 330, 96, 8); x.stroke();
  x.fillStyle = C.red; x.font = `68px ${F.black}`; x.textAlign = 'center'; x.fillText('SPONSOR', 0, 24); x.restore();
  for (let i = 0; i < 4; i++) coin(x, 800, 1500 - i * 22, 44, 0.02, { flat: i > 0 });
  finish(c, x, 'gym_sponsor_cover.png');
}
