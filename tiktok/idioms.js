// TikTok 9:16 — «Угадай идиому по картинке» (6 English idioms, quiz with A/B/C + 3-sec countdown)
// Usage: node tiktok/idioms.js video out.mp4 | still t1,t2,... out.png | cues (writes tiktok/cues.json for the audio)
require('../lib/fonts');
const F = require('../lib/fonts');
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const { OL, paint, line, curve, roundRect, ease, clamp, lerp, hash, noise1 } = require('../lib/draw');
const U = require('../lib/ui');
const { drawGus } = require('../lib/gus');

const W = 1080, H = 1920, FPS = 30;
const ORANGE = '#FF7A2F', GREEN = '#3DAA6E', RED = '#E5484D', BLUE = '#2E6FD8', CREAM = '#FFF6E6';

const ROUNDS = [
  { en: "It's raining cats and dogs", pic: 'rain', opts: ['льёт как из ведра', 'животные убегают', 'странная погода'], ok: 0, ex: "Take an umbrella — it's raining cats and dogs!" },
  { en: 'A piece of cake', pic: 'cake', opts: ['кусочек торта', 'день рождения', 'проще простого'], ok: 2, ex: 'The test was a piece of cake.' },
  { en: 'Break a leg!', pic: 'leg', opts: ['осторожно, упадёшь!', 'удачи! ни пуха ни пера!', 'беги быстрее!'], ok: 1, ex: 'Big show tonight? Break a leg!' },
  { en: 'Spill the beans', pic: 'beans', opts: ['выдать секрет', 'испортить ужин', 'рассыпать деньги'], ok: 0, ex: 'Come on, spill the beans! Who is it?' },
  { en: 'Under the weather', pic: 'weather', opts: ['гулять под дождём', 'ждать хорошую погоду', 'неважно себя чувствовать'], ok: 2, ex: "I'm a bit under the weather today." },
  { en: 'Cost an arm and a leg', pic: 'price', opts: ['очень больно', 'стоит целое состояние', 'тяжёлая работа'], ok: 1, ex: 'This phone costs an arm and a leg!' },
];
const INTRO = 3.0, RD = 10.5, OUTRO = 6.0;
const T_END = INTRO + ROUNDS.length * RD + OUTRO;
// round-local timing
const R = { optIn: 1.4, count: 3.0, reveal: 6.0, ex: 6.6 };

// ---------------------------------------------------------------- helpers
function txt(ctx, s, x, y, size, fill, o = {}) { U.textOutlined(ctx, s, x, y, size, fill, Object.assign({ f: F.RU }, o)); }
function fitSize(ctx, s, maxW, size, w = 800) { ctx.font = `${w} ${size}px ${F.RU}`; while (ctx.measureText(s).width > maxW && size > 30) { size -= 2; ctx.font = `${w} ${size}px ${F.RU}`; } return size; }
function bg(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#FFE9A8'); g.addColorStop(1, '#FFD0B5'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.35;
  for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.arc(hash(i) * W, (hash(i + 3) * H + t * 30 * (0.4 + hash(i))) % H, 24 + hash(i + 7) * 60, 0, 7); ctx.fillStyle = ['#FFFFFF', '#FFC27A', '#FFB3C7'][i % 3]; ctx.fill(); }
  ctx.restore();
}
// picture panel area
const PX = 60, PY = 330, PW = 960, PH = 700;

// ---------------------------------------------------------------- the 6 pictures (drawn in panel space 0..PW x 0..PH)
function sky(ctx, a, b) { const g = ctx.createLinearGradient(0, 0, 0, PH); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 0, PW, PH); }
function cloud(ctx, x, y, s, col = '#9AA7B8') {
  const B = [[-80, 14, 52], [-20, -16, 66], [55, -4, 58], [100, 22, 42], [10, 30, 56], [-110, 32, 36]];
  for (const [dx, dy, r] of B) { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s + 4, 0, 7); ctx.fillStyle = OL; ctx.fill(); }
  for (const [dx, dy, r] of B) { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s - 2, 0, 7); ctx.fillStyle = col; ctx.fill(); }
  ctx.save(); ctx.globalAlpha = 0.18; for (const [dx, dy, r] of B) { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s + r * s * 0.35, r * s * 0.7, 0, Math.PI); ctx.fillStyle = '#000'; ctx.fill(); } ctx.restore();
}
function cat(ctx, x, y, s, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s);
  for (const k of [-1, 1]) paint(ctx, c => { c.moveTo(k * 18, -26); c.lineTo(k * 38, -60); c.lineTo(k * 44, -14); c.closePath(); }, '#FF9A2E', { lw: 5 });
  paint(ctx, c => c.ellipse(0, 0, 48, 40, 0, 0, 7), '#FF9A2E', { shade: '#E0761A', sx: 6, sy: 6, lw: 6 });
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.arc(k * 16, -4, 6, 0, 7); ctx.fillStyle = OL; ctx.fill(); }
  line(ctx, [[-6, 12], [0, 16], [6, 12]], 4, OL);
  for (const k of [-1, 1]) for (const d of [-1, 1]) line(ctx, [[k * 26, 10 + d * 4], [k * 54, 8 + d * 10]], 3, OL);
  ctx.restore();
}
function dog(ctx, x, y, s, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s);
  paint(ctx, c => c.ellipse(0, 0, 46, 42, 0, 0, 7), '#C98B5B', { shade: '#A86F44', sx: 6, sy: 6, lw: 6 });
  for (const k of [-1, 1]) paint(ctx, c => c.ellipse(k * 44, 4, 16, 32, k * 0.3, 0, 7), '#7A5133', { lw: 5 });
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.arc(k * 15, -6, 6, 0, 7); ctx.fillStyle = OL; ctx.fill(); }
  paint(ctx, c => c.ellipse(0, 14, 12, 9, 0, 0, 7), OL, { lw: 0 });
  paint(ctx, c => c.ellipse(0, 30, 8, 10, 0, 0, 7), '#FF8FA6', { lw: 4 });
  ctx.restore();
}
function picRain(ctx, t) {
  sky(ctx, '#8E9CB0', '#C9D3E0');
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 4;
  for (let i = 0; i < 60; i++) { const x = (hash(i) * PW + t * 40) % PW, y = (hash(i + 9) * PH + t * 900) % PH; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 34); ctx.stroke(); }
  ctx.restore();
  for (let i = 0; i < 7; i++) { const x = 90 + i * 130 + Math.sin(i * 3) * 30, y = ((hash(i + 2) * PH + t * 260) % (PH + 200)) - 100; (i % 2 ? dog : cat)(ctx, x, y, 0.8, Math.sin(t * 3 + i) * 0.6); }
  cloud(ctx, 220, 90, 1.3); cloud(ctx, 640, 70, 1.5); cloud(ctx, 860, 120, 1.0);
  // ground + umbrella
  paint(ctx, c => roundRect(c, -10, PH - 90, PW + 20, 120, 0), '#7FB86A', { lw: 6 });
  ctx.save(); ctx.translate(480, PH - 90);
  line(ctx, [[0, 0], [0, -230], ], 10, OL);
  curve(ctx, [0, 0], [-6, 22], [-24, 20], 10, OL);
  paint(ctx, c => { c.moveTo(-190, -230); c.quadraticCurveTo(0, -420, 190, -230); for (let k = 0; k < 4; k++) c.quadraticCurveTo(190 - 47.5 * (2 * k + 1), -270, 190 - 95 * (k + 1), -230); c.closePath(); }, RED, { shade: '#B8343A', sx: 10, sy: 0, lw: 7 });
  ctx.restore();
}
function picCake(ctx, t) {
  sky(ctx, '#FFE3EC', '#FFF6E6');
  paint(ctx, c => c.ellipse(480, 520, 330, 80, 0, 0, 7), '#FFFFFF', { shade: '#E3E6EE', sx: 0, sy: -10, lw: 7 });
  ctx.save(); ctx.translate(480, 480);
  const tri = c => { c.moveTo(-230, 0); c.lineTo(200, 40); c.lineTo(210, -200); c.lineTo(-210, -250); c.closePath(); };
  paint(ctx, tri, '#F6D598', { shade: '#E8B86C', sx: 10, sy: 0, lw: 7 });
  ctx.save(); ctx.beginPath(); tri(ctx); ctx.clip();
  ctx.fillStyle = '#C0582C'; ctx.fillRect(-260, -150, 520, 30); ctx.fillRect(-260, -70, 520, 30);
  ctx.fillStyle = '#FF8FA6'; ctx.fillRect(-260, -260, 520, 50); ctx.restore();
  ctx.save(); ctx.beginPath(); tri(ctx); ctx.lineWidth = 7; ctx.strokeStyle = OL; ctx.stroke(); ctx.restore();
  paint(ctx, c => c.arc(0, -262, 36, 0, 7), RED, { shade: '#B8343A', sx: 6, sy: 6, lw: 6 }); curve(ctx, [0, -296], [14, -330], [34, -340], 6, '#4C9547');
  ctx.restore();
  // fork
  ctx.save(); ctx.translate(820, 380); ctx.rotate(0.5); paint(ctx, c => roundRect(c, -12, 0, 24, 220, 10), '#C8D3D9', { lw: 5 }); for (const k of [-14, -4, 6]) paint(ctx, c => roundRect(c, k, -70, 8, 76, 4), '#C8D3D9', { lw: 4 }); ctx.restore();
  for (let i = 0; i < 6; i++) { const a = t * 2 + i; ctx.save(); ctx.translate(120 + i * 150, 120 + Math.sin(a) * 30); ctx.rotate(a); paint(ctx, c => { for (let k = 0; k <= 8; k++) { const aa = k / 8 * Math.PI * 2, rr = k % 2 ? 8 : 22; k ? c.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr) : c.moveTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } c.closePath(); }, '#FFD23F', { lw: 4 }); ctx.restore(); }
}
function picLeg(ctx, t) {
  sky(ctx, '#2A1B3D', '#4A2C5A');
  // spotlight
  ctx.save(); const g = ctx.createRadialGradient(480, 420, 20, 480, 420, 380); g.addColorStop(0, 'rgba(255,240,180,0.55)'); g.addColorStop(1, 'rgba(255,240,180,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, PW, PH); ctx.restore();
  // stage floor
  paint(ctx, c => roundRect(c, -10, PH - 140, PW + 20, 160, 0), '#B07A50', { shade: '#8A5A38', sx: 0, sy: -14, lw: 6 });
  // curtains
  for (const k of [0, 1]) { ctx.save(); if (k) { ctx.translate(PW, 0); ctx.scale(-1, 1); }
    paint(ctx, c => { c.moveTo(-10, -10); c.lineTo(250, -10); c.bezierCurveTo(200, 200, 120, 300, 160, PH + 10); c.lineTo(-10, PH + 10); c.closePath(); }, '#C9302C', { shade: '#9A1F1C', sx: 14, sy: 0, lw: 7 });
    for (const x of [60, 130]) line(ctx, [[x, 0], [x - 10, PH]], 4, 'rgba(0,0,0,0.18)'); ctx.restore(); }
  paint(ctx, c => roundRect(c, -10, -10, PW + 20, 70, 0), '#C9302C', { shade: '#9A1F1C', sx: 0, sy: 10, lw: 6 });
  // leg in plaster cast
  ctx.save(); ctx.translate(500, 300); ctx.rotate(0.12);
  paint(ctx, c => roundRect(c, -60, -120, 120, 300, 50), '#FFFFFF', { shade: '#DCE2EA', sx: 10, sy: 0, lw: 7 });
  for (let i = 0; i < 5; i++) line(ctx, [[-56, -80 + i * 55], [56, -60 + i * 55]], 3, '#C8D0DA');
  paint(ctx, c => { c.moveTo(-60, 150); c.lineTo(60, 150); c.quadraticCurveTo(170, 160, 170, 210); c.lineTo(-60, 210); c.closePath(); }, '#FFFFFF', { shade: '#DCE2EA', sx: 6, sy: 6, lw: 7 });
  ctx.restore();
  // crutches
  for (const k of [-1, 1]) { ctx.save(); ctx.translate(500 + k * 170, PH - 150); ctx.rotate(k * 0.16); line(ctx, [[0, 0], [0, -420]], 14, '#8C9098'); line(ctx, [[-30, -420], [30, -420]], 16, '#8C9098'); line(ctx, [[-20, -260], [20, -260]], 12, '#8C9098'); ctx.restore(); }
  // pain stars
  for (let i = 0; i < 4; i++) { const a = t * 4 + i * Math.PI / 2; ctx.save(); ctx.translate(540 + Math.cos(a) * 110, 170 + Math.sin(a) * 30); paint(ctx, c => { for (let k = 0; k <= 10; k++) { const aa = k / 10 * Math.PI * 2 - Math.PI / 2, rr = k % 2 ? 9 : 22; k ? c.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr) : c.moveTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } c.closePath(); }, '#FFD23F', { lw: 4 }); ctx.restore(); }
}
function picBeans(ctx, t) {
  sky(ctx, '#E4F2EE', '#CDEBD3');
  paint(ctx, c => roundRect(c, -10, PH - 160, PW + 20, 180, 0), '#E8DCC8', { lw: 6 });
  // tipped can
  ctx.save(); ctx.translate(330, PH - 230); ctx.rotate(-1.35 + Math.sin(t * 2) * 0.03);
  paint(ctx, c => roundRect(c, -110, -150, 220, 300, 24), '#E5484D', { shade: '#B8343A', sx: 12, sy: 0, lw: 7 });
  paint(ctx, c => roundRect(c, -110, -60, 220, 120, 0), '#FFF6E6', { lw: 5 });
  U.textOutlined(ctx, 'BEANS', 0, 20, 52, '#7A4A2A', { ol: false });
  paint(ctx, c => c.ellipse(0, -150, 110, 26, 0, 0, 7), '#C8D3D9', { lw: 6 });
  ctx.restore();
  // beans spilling
  for (let i = 0; i < 34; i++) {
    const p = ((hash(i) + t * 0.35) % 1), x = 420 + p * 460 + (hash(i + 4) - 0.5) * 120, y = PH - 300 + Math.pow(p, 0.6) * 170 + (hash(i + 8) - 0.5) * 60;
    ctx.save(); ctx.translate(x, Math.min(y, PH - 120 - hash(i) * 40)); ctx.rotate(hash(i) * 6); paint(ctx, c => c.ellipse(0, 0, 22, 13, 0, 0, 7), '#B5532C', { shade: '#8A3B1C', sx: 3, sy: 3, lw: 4 }); ctx.restore();
  }
  // speech bubble "shhh..."
  const k = 0.5 + 0.5 * Math.sin(t * 3);
  ctx.save(); ctx.translate(700, 150); ctx.rotate(0.05);
  paint(ctx, c => { roundRect(c, -170, -70, 340, 140, 40); }, '#FFFFFF', { lw: 6 });
  paint(ctx, c => { c.moveTo(-60, 64); c.lineTo(-110, 130); c.lineTo(-10, 64); c.closePath(); }, '#FFFFFF', { lw: 0 }); line(ctx, [[-60, 68], [-110, 130], [-10, 68]], 6, OL);
  U.textOutlined(ctx, 'SECRET!', 0, 20 + k * 4, 62, RED, { olw: 8 });
  ctx.restore();
}
function picWeather(ctx, t) {
  sky(ctx, '#BFE6FA', '#FFF6E6');
  ctx.beginPath(); ctx.arc(820, 110, 70, 0, 7); ctx.fillStyle = '#FFE680'; ctx.fill();
  paint(ctx, c => roundRect(c, -10, PH - 110, PW + 20, 130, 0), '#7FB86A', { lw: 6 });
  // Gus, sad, with his own little rain cloud
  drawGus(ctx, 470, PH - 100, 1.0, { face: 1, lids: 0.82, neck: 0.5, look: -0.4, wing: 0.05, squash: 0.97 });
  ctx.save(); ctx.strokeStyle = 'rgba(80,130,200,0.8)'; ctx.lineWidth = 5;
  for (let i = 0; i < 14; i++) { const x = 400 + hash(i) * 260, y = 150 + ((hash(i + 5) + t * 1.4) % 1) * 230; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 26); ctx.stroke(); }
  ctx.restore();
  cloud(ctx, 540, 110 + Math.sin(t * 2) * 6, 1.05, '#7F8A9C');
  // thermometer in beak
  ctx.save(); ctx.translate(690, PH - 560); ctx.rotate(0.35); paint(ctx, c => roundRect(c, -8, -10, 16, 120, 8), '#FFFFFF', { lw: 4 }); paint(ctx, c => c.arc(0, 112, 14, 0, 7), RED, { lw: 4 }); line(ctx, [[0, 30], [0, 100]], 6, RED); ctx.restore();
}
function picPrice(ctx, t) {
  sky(ctx, '#FFF1DC', '#FFD9C2');
  // shop shelf
  paint(ctx, c => roundRect(c, 40, 470, PW - 80, 30, 8), '#B07A50', { lw: 6 });
  // phone on the shelf
  ctx.save(); ctx.translate(250, 460); ctx.rotate(-0.05);
  paint(ctx, c => roundRect(c, -80, -300, 160, 300, 26), '#3A3F4A', { lw: 7 }); paint(ctx, c => roundRect(c, -66, -282, 132, 250, 14), '#7EC8F5', { lw: 4 });
  ctx.restore();
  // swinging price tag
  const sw = Math.sin(t * 2.2) * 0.08;
  ctx.save(); ctx.translate(620, 80); ctx.rotate(sw);
  line(ctx, [[0, 0], [0, 80]], 5, OL);
  paint(ctx, c => { c.moveTo(-170, 80); c.lineTo(170, 80); c.lineTo(170, 400); c.lineTo(-170, 400); c.closePath(); }, '#FFE07A', { shade: '#E8B640', sx: 10, sy: 0, lw: 7 });
  paint(ctx, c => c.arc(0, 110, 14, 0, 7), '#FFF6E6', { lw: 5 });
  U.textOutlined(ctx, 'PRICE:', 0, 180, 54, OL, { ol: false });
  // arm
  ctx.save(); ctx.translate(-70, 280); ctx.rotate(-0.4); paint(ctx, c => roundRect(c, -24, -70, 48, 140, 22), '#FFDCC6', { shade: '#F4B79C', sx: 6, sy: 0, lw: 5 }); paint(ctx, c => c.arc(0, -80, 28, 0, 7), '#FFDCC6', { lw: 5 }); ctx.restore();
  U.textOutlined(ctx, '+', 0, 300, 70, RED, { olw: 8 });
  // leg
  ctx.save(); ctx.translate(80, 270); paint(ctx, c => roundRect(c, -24, -80, 48, 150, 22), '#FFDCC6', { shade: '#F4B79C', sx: 6, sy: 0, lw: 5 }); paint(ctx, c => roundRect(c, -24, 50, 80, 34, 14), '#5BB8F0', { lw: 5 }); ctx.restore();
  ctx.restore();
  // coins
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(120 + i * 140, 600 + Math.sin(t * 3 + i) * 8); paint(ctx, c => c.ellipse(0, 0, 40, 18, 0, 0, 7), '#FFD23F', { shade: '#E0A800', sx: 0, sy: -5, lw: 5 }); ctx.restore(); }
}
const PICS = { rain: picRain, cake: picCake, leg: picLeg, beans: picBeans, weather: picWeather, price: picPrice };

function panel(ctx, pic, t, k, shake = 0) {
  if (k <= 0) return;
  const s = lerp(0.85, 1, ease.back(clamp(k)));
  ctx.save(); ctx.translate(W / 2 + shake, PY + PH / 2); ctx.scale(s, s); ctx.translate(-PW / 2, -PH / 2); ctx.globalAlpha = clamp(k * 3);
  ctx.save(); ctx.globalAlpha *= 0.25; paint(ctx, c => roundRect(c, 14, 20, PW, PH, 56), '#000', { lw: 0 }); ctx.restore();
  ctx.save(); ctx.beginPath(); roundRect(ctx, 0, 0, PW, PH, 56); ctx.clip(); PICS[pic](ctx, t); ctx.restore();
  ctx.save(); ctx.beginPath(); roundRect(ctx, 0, 0, PW, PH, 56); ctx.lineWidth = 10; ctx.strokeStyle = OL; ctx.stroke(); ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------- HUD
function header(ctx, n, t, a = 1) {
  ctx.save(); ctx.globalAlpha = a;
  paint(ctx, c => roundRect(c, 60, 110, 960, 140, 70), '#FFFFFF', { lw: 8 });
  txt(ctx, 'УГАДАЙ ИДИОМУ', 430, 205, 66, ORANGE, { olw: 12, w: 900 });
  paint(ctx, c => roundRect(c, 790, 128, 210, 104, 52), BLUE, { lw: 6 });
  txt(ctx, `${n}/6`, 895, 204, 62, '#FFFFFF', { olw: 10, w: 900 });
  ctx.restore();
}
function optionBox(ctx, i, label, state, k, t) {
  if (k <= 0) return;
  const y = 1255 + i * 148, s = ease.back(clamp(k)) * (state === 'ok' ? 1.04 + 0.02 * Math.sin(t * 9) : state === 'no' ? 0.96 : 1);
  const shake = state === 'no' ? Math.sin(t * 40) * Math.max(0, 1 - (k - 1)) * 0 : 0;
  ctx.save(); ctx.translate(W / 2 - 40 + shake, y); ctx.scale(s, s);
  const fill = state === 'ok' ? '#7BD88F' : state === 'no' ? '#E8DCD2' : '#FFFFFF';
  paint(ctx, c => roundRect(c, -420, -60, 840, 120, 40), fill, { lw: 7 });
  paint(ctx, c => c.arc(-350, 0, 42, 0, 7), ['#FF7A2F', '#5BB8F0', '#B98CE0'][i], { lw: 6 });
  txt(ctx, 'ABC'[i], -350, 20, 54, '#FFFFFF', { olw: 9 });
  const fs = fitSize(ctx, label, 600, 50);
  ctx.font = `800 ${fs}px ${F.RU}`; ctx.fillStyle = state === 'no' ? '#A39188' : OL; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(label, -280, 2);
  if (state === 'ok') paint(ctx, c => { c.moveTo(300, 0); c.lineTo(335, 36); c.lineTo(395, -40); }, 'rgba(0,0,0,0)', { lw: 16, ol: '#1E7A3A' });
  ctx.restore();
}
function timer(ctx, u, t) { // u: 0..1 through the 3 seconds
  const n = Math.max(1, 3 - Math.floor(u * 3)), f = (u * 3) % 1;
  ctx.save(); ctx.translate(900, 410); const s = 1.25 - ease.out(Math.min(1, f * 3)) * 0.25; ctx.scale(s, s);
  paint(ctx, c => c.arc(0, 0, 86, 0, 7), '#FFFFFF', { lw: 8 });
  ctx.beginPath(); ctx.arc(0, 0, 70, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - u)); ctx.lineWidth = 16; ctx.strokeStyle = RED; ctx.lineCap = 'round'; ctx.stroke();
  txt(ctx, String(n), 0, 34, 100, RED, { olw: 12 });
  ctx.restore();
}

// ---------------------------------------------------------------- frame
function frame(ctx, t) {
  bg(ctx, t);
  if (t < INTRO) return intro(ctx, t);
  if (t >= INTRO + ROUNDS.length * RD) return outro(ctx, t - INTRO - ROUNDS.length * RD, t);
  const i = Math.floor((t - INTRO) / RD), r = ROUNDS[i], u = t - INTRO - i * RD;
  header(ctx, i + 1, t);
  panel(ctx, r.pic, t, u / 0.35);
  // idiom
  const ik = ease.back(clamp((u - 0.25) / 0.35));
  if (ik > 0) {
    ctx.save(); ctx.translate(W / 2 - 30, 1120); ctx.scale(ik, ik);
    const fs = fitSize(ctx, r.en, 900, 84, 900);
    U.textOutlined(ctx, r.en, 0, 30, fs, '#FFFFFF', { olw: 16, w: 900 });
    ctx.restore();
  }
  const rev = u >= R.reveal;
  r.opts.forEach((o, j) => optionBox(ctx, j, o, rev ? (j === r.ok ? 'ok' : 'no') : '', (u - R.optIn - j * 0.2) / 0.3, t));
  if (u >= R.count && u < R.reveal) {
    timer(ctx, (u - R.count) / (R.reveal - R.count), t);
  }
  if (rev) { // example sentence ribbon over the picture bottom
    const ek = ease.back(clamp((u - R.ex + 0.4) / 0.35));
    if (ek > 0) {
      ctx.save(); ctx.translate(W / 2, PY + PH - 70); ctx.scale(ek, ek); ctx.rotate(-0.02);
      ctx.font = `700 44px ${F.EN}`; const w = Math.min(900, ctx.measureText(r.ex).width + 80);
      paint(ctx, c => roundRect(c, -w / 2, -52, w, 104, 50), '#FFFFFF', { lw: 7 });
      const fs = fitSize(ctx, r.ex, w - 60, 44, 700);
      ctx.font = `700 ${fs}px ${F.EN}`; ctx.fillStyle = BLUE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(r.ex, 0, 2);
      ctx.restore();
    }
    if (u < R.reveal + 1.2) confetti(ctx, u - R.reveal);
  }
  // hint line under header during the question
  if (!rev && u > 0.4) { ctx.save(); ctx.globalAlpha = clamp((u - 0.4) / 0.3); txt(ctx, 'Как думаешь, что это значит?', W / 2, 305, 40, OL, { ol: false, w: 800 }); ctx.restore(); }
  // round-3 "hard one" stamp
  if (i === 2 && !rev && u > 0.6) { ctx.save(); ctx.translate(250, 400); ctx.rotate(-0.2); const s = lerp(2, 1, ease.out(clamp((u - 0.6) / 0.25))); ctx.scale(s, s); paint(ctx, c => roundRect(c, -170, -50, 340, 100, 20), RED, { lw: 7 }); txt(ctx, 'СЛОЖНАЯ!', 0, 22, 56, '#FFFFFF', { olw: 9 }); ctx.restore(); }
}
function confetti(ctx, u) {
  for (let i = 0; i < 70; i++) { const ph = u * (0.6 + hash(i) * 0.6); const x = hash(i * 3) * W, y = 200 - 100 + ph * 900 + hash(i * 5) * 300; ctx.save(); ctx.translate(x + Math.sin(ph * 6 + i) * 30, y); ctx.rotate(ph * 8 + i); ctx.fillStyle = ['#FF7A2F', '#3DAA6E', '#5BB8F0', '#E5484D', '#FFD23F'][i % 5]; ctx.fillRect(-12, -6, 24, 12); ctx.restore(); }
}
function intro(ctx, t) {
  panel(ctx, 'rain', t, 1);
  ctx.fillStyle = 'rgba(30,20,40,0.45)'; ctx.fillRect(0, 0, W, H);
  const k = ease.back(clamp(t / 0.35)), k2 = ease.back(clamp((t - 0.45) / 0.35)), k3 = ease.back(clamp((t - 1.0) / 0.35));
  ctx.save(); ctx.translate(W / 2, 700); ctx.rotate(-0.04); ctx.scale(k, k);
  txt(ctx, '90% НЕ УГАДАЮТ', 0, 0, 104, '#FFFFFF', { olw: 18, w: 900 }); ctx.restore();
  ctx.save(); ctx.translate(W / 2, 860); ctx.rotate(-0.04); ctx.scale(k2, k2);
  txt(ctx, '3-Ю ИДИОМУ', 0, 0, 132, ORANGE, { olw: 22, w: 900 }); ctx.restore();
  ctx.save(); ctx.translate(W / 2, 1180); ctx.scale(k3, k3);
  paint(ctx, c => roundRect(c, -400, -80, 800, 160, 60), '#FFFFFF', { lw: 8 });
  txt(ctx, 'Считай свои очки!', 0, 22, 66, BLUE, { olw: 10, w: 900 }); ctx.restore();
  ctx.save(); ctx.translate(W / 2, 1440); ctx.scale(k3, k3); txt(ctx, '6 английских идиом', 0, 0, 58, '#FFFFFF', { olw: 10 }); ctx.restore();
}
function outro(ctx, u, t) {
  header(ctx, 6, t, clamp(1 - u / 0.3));
  const k = ease.back(clamp(u / 0.4)), k2 = ease.back(clamp((u - 0.5) / 0.4)), k3 = ease.back(clamp((u - 1.2) / 0.4));
  ctx.save(); ctx.translate(W / 2, 520); ctx.scale(k, k); txt(ctx, 'Сколько угадал(а)?', 0, 0, 92, ORANGE, { olw: 16, w: 900 }); ctx.restore();
  // score row
  for (let i = 0; i < 6; i++) { const s = ease.back(clamp((u - 0.3 - i * 0.08) / 0.3)); if (s <= 0) continue; ctx.save(); ctx.translate(165 + i * 150, 760); ctx.scale(s, s); paint(ctx, c => c.arc(0, 0, 58, 0, 7), '#FFFFFF', { lw: 7 }); txt(ctx, String(i + 1), 0, 22, 64, BLUE, { olw: 9 }); ctx.restore(); }
  ctx.save(); ctx.translate(W / 2, 1000); ctx.scale(k2, k2);
  paint(ctx, c => roundRect(c, -440, -90, 880, 180, 60), '#FFFFFF', { lw: 8 });
  txt(ctx, 'Пиши счёт в комментариях!', 0, 22, 56, OL, { ol: false, w: 900 }); ctx.restore();
  ctx.save(); ctx.translate(W / 2 - 90, 1260); ctx.scale(k3, k3);
  paint(ctx, c => roundRect(c, -360, -80, 720, 160, 80), RED, { lw: 8 });
  txt(ctx, 'Подпишись: часть 2', 0, 22, 62, '#FFFFFF', { olw: 10, w: 900 }); ctx.restore();
  // Gus cameo, waving
  ctx.save(); ctx.translate(800, 1760); drawGus(ctx, 0, 0, 0.62, { face: -1, lids: 0.55, wing: 0.4 + 0.3 * Math.sin(t * 10), honk: u > 2 && u < 2.6 ? 0.8 : 0 }); ctx.restore();
  const f = clamp((u - (OUTRO - 0.5)) / 0.5); if (f > 0) { ctx.fillStyle = `rgba(0,0,0,${f})`; ctx.fillRect(0, 0, W, H); }
}

// audio cue list (consumed by tiktok/audio.py)
function cues() {
  const c = [{ t: 0.05, n: 'slam' }, { t: 0.5, n: 'pop' }, { t: 1.0, n: 'pop' }];
  ROUNDS.forEach((r, i) => {
    const b = INTRO + i * RD;
    c.push({ t: b - 0.15, n: 'whoosh' }, { t: b + 0.3, n: 'pop' });
    for (let j = 0; j < 3; j++) c.push({ t: b + R.optIn + j * 0.2, n: 'click' });
    for (let j = 0; j < 3; j++) c.push({ t: b + R.count + j, n: 'tick' });
    c.push({ t: b + R.reveal, n: 'correct' }, { t: b + R.ex, n: 'pop' });
    if (i === 2) c.push({ t: b + 0.6, n: 'thud' });
  });
  const o = INTRO + ROUNDS.length * RD; c.push({ t: o, n: 'whoosh' }, { t: o + 0.3, n: 'quizjingle' }, { t: o + 2.0, n: 'honk' });
  return { T: T_END, cues: c };
}

const [mode, A, B] = process.argv.slice(2);
if (mode === 'cues') { fs.writeFileSync(__dirname + '/cues.json', JSON.stringify(cues())); console.log('T', T_END); }
else if (mode === 'still') {
  const ts = A.split(',').map(Number), s = 0.3, cols = Math.min(5, ts.length), rows = Math.ceil(ts.length / cols);
  const sheet = createCanvas(W * s * cols, H * s * rows), sx = sheet.getContext('2d'), c = createCanvas(W, H), x = c.getContext('2d');
  ts.forEach((t, i) => { frame(x, t); sx.drawImage(c, (i % cols) * W * s, Math.floor(i / cols) * H * s, W * s, H * s); sx.fillStyle = '#000'; sx.fillRect((i % cols) * W * s, Math.floor(i / cols) * H * s, 60, 24); sx.fillStyle = '#fff'; sx.font = '18px sans-serif'; sx.fillText(t.toFixed(1), (i % cols) * W * s + 4, Math.floor(i / cols) * H * s + 18); });
  fs.writeFileSync(B, sheet.toBuffer('image/png'));
} else if (mode === 'video') {
  (async () => {
    const c = createCanvas(W, H), ctx = c.getContext('2d');
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', A], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round(T_END * FPS);
    for (let f = 0; f < n; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 300 === 0) process.stderr.write(`${f}/${n}\n`); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  })();
}
