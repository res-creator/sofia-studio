// "Подруга выложила ужасное фото" — rubric «Ответ на вопрос из комментариев» (4 answers, hard_cut camera, ~65 s): node badphoto.js start end out.mp4 | --png=f1,f2
// Two sets: the heroine on her sofa at home (phone in hand) and Chloe in her armchair at home. Inserts on a solid backdrop:
// the post (photo: Chloe glamorous, the heroine mid-sneeze with half-closed eyes), the photo close-up, the DM chat, the old school photo.
// Flow: hook (title over the live post, likes ticking 47 -> 120; comment plate) -> 1 · ХОЛОДНО ("Delete." -> "But I look amazing in it!" -> the like counter jumps)
// -> 2 · С ЮМОРОМ (potato joke, potato sticker on the photo -> "That's you!" + drawn laughing face -> Chloe laughing) -> 3 · КАК НОСИТЕЛЬ (DM + Bella tip)
// -> 4 · КОРОЛЕВСКИЙ ОТВЕТ (she holds up the school photo: braces + huge glasses -> close-up -> Chloe gasps)
// -> beat -> "Post deleted" -> «Mum commented: Beautiful girls!» -> facepalm -> moral (she pats her SCHOOL album) -> end screen (1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ + cursor).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas, human } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/badphoto/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, earrings: null, top: { type: 'hoodie', col: '#7CC8B8' }, bottom: { type: 'joggers', col: '#5E7FA8' }, shoes: { col: '#F4EFE6', acc: null } };
const HER_P = { ...BASE.her_lift, top: { type: 'tank', col: '#E0474C' }, bottom: { type: 'skirt', col: '#2B2F3A' } };            // party look (in the photo)
const FR = { ...BASE.chloe, top: { type: 'hoodie', col: '#C9B2F0' }, bottom: { type: 'joggers', col: '#9C86D8' }, shoes: { col: '#FFFFFF', acc: null } };
const FR_P = { ...BASE.chloe, necklace: true, earrings: '#F2C14E', top: { type: 'tank', col: '#F2C14E' }, bottom: { type: 'skirt', col: '#2B2F3A' } };  // glamorous (in the photo)
const KID = { ...BASE.chloe, freckles: true, lips: '#E89090', earrings: null, blushA: 0.6, top: { type: 'polo', col: '#3C5A9A', col2: '#FFFFFF' } };          // school photo
const G = { her: geom(HER), fr: geom(FR), herP: geom(HER_P), frP: geom(FR_P), kid: geom(KID) };
const SEAT = 330, HX = 0, FX = 6000;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function heartPath(c, x, y, s) { c.beginPath(); c.moveTo(x, y + s * 0.95); c.bezierCurveTo(x - s * 1.5, y - s * 0.05, x - s * 0.75, y - s * 1.25, x, y - s * 0.5); c.bezierCurveTo(x + s * 0.75, y - s * 1.25, x + s * 1.5, y - s * 0.05, x, y + s * 0.95); c.closePath(); }
function laughIcon(c, x, y, r) {   // drawn "laughing face" (no emoji glyphs)
  c.save(); c.fillStyle = '#FFC93C'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = '#D99A1E'; c.lineWidth = r * 0.08; c.stroke();
  c.strokeStyle = '#5A3A10'; c.lineWidth = r * 0.12; c.lineCap = 'round'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * r * 0.55, y - r * 0.35); c.lineTo(x + s * r * 0.25, y - r * 0.22); c.lineTo(x + s * r * 0.55, y - r * 0.08); c.stroke(); }
  c.fillStyle = '#5A3A10'; c.beginPath(); c.moveTo(x - r * 0.6, y + r * 0.08); c.quadraticCurveTo(x, y + r * 0.95, x + r * 0.6, y + r * 0.08); c.closePath(); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(x - r * 0.5, y + r * 0.1); c.lineTo(x + r * 0.5, y + r * 0.1); c.lineTo(x + r * 0.42, y + r * 0.28); c.lineTo(x - r * 0.42, y + r * 0.28); c.closePath(); c.fill();
  c.fillStyle = '#5EB8F0'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * r * 0.78, y - r * 0.1); c.quadraticCurveTo(x + s * r * 1.12, y + r * 0.25, x + s * r * 0.9, y + r * 0.42); c.quadraticCurveTo(x + s * r * 0.62, y + r * 0.3, x + s * r * 0.78, y - r * 0.1); c.fill(); }
  c.restore(); }
function potato(c, x, y, s, rot = 0) {   // drawn potato sticker
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(0, 0, 66, 50, 0.2, 0, TAU); c.fill();
  c.fillStyle = '#C9964E'; c.beginPath(); c.moveTo(-54, -8); c.bezierCurveTo(-56, -44, 10, -48, 40, -30); c.bezierCurveTo(66, -14, 62, 30, 30, 38); c.bezierCurveTo(-10, 46, -52, 30, -54, -8); c.fill();
  c.fillStyle = 'rgba(110,70,30,.55)'; for (const [a, b, r] of [[-28, -12, 5], [6, -24, 4], [24, 8, 5], [-8, 18, 4], [36, -10, 3]]) { c.beginPath(); c.arc(a, b, r, 0, TAU); c.fill(); }
  c.fillStyle = '#2B1A10'; c.beginPath(); c.arc(-14, -4, 5, 0, TAU); c.arc(12, -6, 5, 0, TAU); c.fill(); c.strokeStyle = '#2B1A10'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.arc(-1, 6, 10, 0.3, Math.PI - 0.3); c.stroke();
  c.restore(); }
function sparkle4(c, x, y, r) { c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill(); }

// ---------------- prerendered pictures: the party photo, the school photo, avatars
const PW = 1040, PH = 830;
function photoScene(c) {   // the group photo: Chloe glamorous (left), the heroine mid-sneeze (right)
  const g = c.createLinearGradient(0, 0, 0, PH); g.addColorStop(0, '#2A1B4A'); g.addColorStop(1, '#6A2A6A'); c.fillStyle = g; c.fillRect(0, 0, PW, PH);
  for (let i = 0; i < 26; i++) { c.fillStyle = ['rgba(255,200,120,.22)', 'rgba(255,120,200,.2)', 'rgba(140,200,255,.2)'][i % 3]; c.beginPath(); c.arc(hash(i) * PW, hash(i + 9) * PH * 0.7, 20 + hash(i + 3) * 50, 0, TAU); c.fill(); }
  c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= PW; x += 20) c.lineTo(x, 70 + Math.sin(x / PW * TAU * 1.5) * 30); c.stroke();
  for (let i = 0; i < 14; i++) { const x = 30 + i * 75, y = 70 + Math.sin(x / PW * TAU * 1.5) * 30; c.fillStyle = ['#FFD86A', '#FF8FC0', '#8FE0FF'][i % 3]; c.beginPath(); c.arc(x, y + 14, 11, 0, TAU); c.fill(); }
  const s = 0.62;
  { const gg = G.frP; const st = { t: 0.3, mood: 'happy', turn: 0.25, look: 0.15, tilt: -0.12, lookY: 0, talk: 0, floorShadow: false, armL: reach(gg, -1, -gg.sw * 1.45, gg.ySh + 320, { planar: true }), armR: reach(gg, 1, gg.sw * 1.45, gg.ySh + 320, { planar: true }) };
    const hd = K.put(c, FR_P, st, PW * 0.3, PH * 0.4 + 1386 * s, s);
    c.fillStyle = 'rgba(255,240,180,.95)'; for (const [dx, dy, r] of [[-170, -120, 26], [150, -170, 20], [190, 20, 16], [-200, 60, 14]]) sparkle4(c, hd.x + dx, hd.y + dy, r); }
  { const gg = G.herP; const st = { t: 0, mood: 'tired', turn: -0.2, look: -0.3, lookY: -0.7, tilt: 0.24, headX: 10, talk: 1.15, blink: 0.35, floorShadow: false, armL: reach(gg, -1, -gg.sw * 1.0, gg.ySh + 330), armR: reach(gg, 1, gg.sw * 1.2, gg.ySh + 300, { planar: true }) };
    const hd = K.put(c, HER_P, st, PW * 0.72, PH * 0.44 + (1480 - 139) * s, s);
    // mid-sneeze: spray dots + motion lines (funny, not mean)
    const mx = hd.x - 30, my = hd.y + hd.hh * 0.55; c.fillStyle = 'rgba(190,230,255,.9)'; for (let i = 0; i < 14; i++) { const a = Math.PI * (0.75 + hash(i) * 0.5), r = 40 + hash(i + 4) * 120; c.beginPath(); c.arc(mx + Math.cos(a) * r, my + Math.sin(a) * r * 0.6, 4 + hash(i + 2) * 5, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 6; c.lineCap = 'round'; for (const [a, b] of [[-0.9, 0], [-0.6, 0.25], [-1.2, -0.2]]) { c.beginPath(); c.moveTo(hd.x + hd.hh * 1.1 * Math.cos(a), hd.y - hd.hh * 0.9 + b * 60); c.lineTo(hd.x + hd.hh * 1.45 * Math.cos(a), hd.y - hd.hh * 1.1 + b * 60); c.stroke(); }
    PHOTO_FACE.x = hd.x; PHOTO_FACE.y = hd.y; PHOTO_FACE.r = hd.hh * 1.25; }
}
const PHOTO_FACE = { x: 0, y: 0, r: 100 };
const mkPic = (w, h, fn) => { const b = createCanvas(w, h); fn(b.getContext('2d')); return b; };
const PHOTO = mkPic(PW, PH, photoScene);
const SW_ = 760, SH_ = 900;
function schoolScene(c) {   // old school photo: Chloe as a kid with braces and huge glasses
  const g = c.createRadialGradient(SW_ / 2, SH_ * 0.4, 50, SW_ / 2, SH_ * 0.4, SW_); g.addColorStop(0, '#9EC3E6'); g.addColorStop(1, '#3E6A9A'); c.fillStyle = g; c.fillRect(0, 0, SW_, SH_);
  for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,255,255,${0.04 + hash(i) * 0.06})`; c.beginPath(); c.arc(hash(i + 1) * SW_, hash(i + 5) * SH_, 30 + hash(i + 2) * 70, 0, TAU); c.fill(); }
  const s = 1.25, gg = G.kid; const st = { t: 0.2, mood: 'happy', turn: 0, look: 0, lookY: 0, talk: 0, floorShadow: false, armL: reach(gg, -1, -gg.sw * 0.8, gg.ySh + 330), armR: reach(gg, 1, gg.sw * 0.8, gg.ySh + 330) };
  const hd = K.put(c, KID, st, SW_ / 2, SH_ * 0.42 + 1386 * s, s); const hw = hd.r.hw * s, hh = hd.hh;
  // braces grin
  const my = hd.y + hh * 0.5, mw = hw * 0.62; c.fillStyle = '#7A2A3A'; c.beginPath(); c.moveTo(hd.x - mw, my - 6); c.quadraticCurveTo(hd.x, my + hh * 0.42, hd.x + mw, my - 6); c.quadraticCurveTo(hd.x, my + 12, hd.x - mw, my - 6); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(hd.x - mw * 0.92, my); c.quadraticCurveTo(hd.x, my + 24, hd.x + mw * 0.92, my); c.lineTo(hd.x + mw * 0.8, my + 30); c.quadraticCurveTo(hd.x, my + 52, hd.x - mw * 0.8, my + 30); c.closePath(); c.fill();
  c.strokeStyle = '#8A97A8'; c.lineWidth = 6; c.beginPath(); c.moveTo(hd.x - mw * 0.86, my + 12); c.quadraticCurveTo(hd.x, my + 36, hd.x + mw * 0.86, my + 12); c.stroke();
  c.fillStyle = '#B8C4D4'; for (let i = -3; i <= 3; i++) { const x = hd.x + i * mw * 0.25, y = my + 14 + 22 * (1 - (i / 3.6) ** 2) * 0.9; c.fillRect(x - 9, y - 9, 18, 16); }
  // huge glasses
  const ey = hd.y + hh * 0.04; for (const sd of [-1, 1]) { c.fillStyle = 'rgba(210,235,255,.28)'; c.strokeStyle = '#7A4A2A'; c.lineWidth = 16; c.beginPath(); c.arc(hd.x + sd * hw * 0.47, ey, hw * 0.44, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 7; c.beginPath(); c.arc(hd.x + sd * hw * 0.47 - 14, ey - 14, hw * 0.28, 3.6, 4.5); c.stroke(); }
  c.strokeStyle = '#7A4A2A'; c.lineWidth = 14; c.beginPath(); c.moveTo(hd.x - hw * 0.08, ey - 6); c.quadraticCurveTo(hd.x, ey - 22, hd.x + hw * 0.08, ey - 6); c.stroke();
}
const SCHOOL = mkPic(SW_, SH_, schoolScene);
function mkAvatar(cfg, g, bg) { const r = 64, b = createCanvas(r * 2, r * 2), c = b.getContext('2d'); c.beginPath(); c.arc(r, r, r, 0, TAU); c.fillStyle = bg; c.fill(); c.clip(); const s = r * 1.55 / (g.hh * 2);
  c.translate(r, r + r * 0.18 - g.headY * s); c.scale(s, s); human(c, cfg, { t: 0, mood: 'happy', turn: 0, look: 0, armL: reach(g, -1, -g.sw * 0.8, g.ySh + 330), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330), floorShadow: false }); return b; }
const AV = { fr: mkAvatar(FR_P, G.frP, '#F7D9E4'), her: mkAvatar(HER, G.her, '#CFE9E2'), mum: null };
AV.mum = mkAvatar({ ...BASE.rose, glasses: null }, geom(BASE.rose), '#FBE3C8');
function avatar(c, who, x, y, r, ring) { c.drawImage(AV[who], x - r, y - r, r * 2, r * 2); if (ring) { c.strokeStyle = ring; c.lineWidth = Math.max(2, r * 0.12); c.beginPath(); c.arc(x, y, r + r * 0.12, 0, TAU); c.stroke(); } }

// ---------------- sets (prerendered, softly blurred backgrounds)
const BX0 = -1700, BY0 = -2600, BW = 3400, BH = 3400, BS = 0.5;
function livingRoom(c) {
  c.fillStyle = '#CFE3DA'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,255,255,.18)'; for (let x = BX0; x < BX0 + BW; x += 140) c.fillRect(x, BY0, 50, BH);
  c.fillStyle = '#F7F2E8'; rr(c, 700, -2150, 760, 980, 14); c.fill(); const g = c.createLinearGradient(0, -2120, 0, -1200); g.addColorStop(0, '#1E2A55'); g.addColorStop(1, '#5A4A8A'); c.fillStyle = g; rr(c, 730, -2120, 700, 920, 8); c.fill();
  c.fillStyle = '#F7F2E8'; c.fillRect(1070, -2120, 18, 920); c.fillStyle = 'rgba(255,240,200,.85)'; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(750 + hash(i) * 660, -2100 + hash(i + 5) * 420, 3 + hash(i + 1) * 3, 0, TAU); c.fill(); }
  for (const [x, y, w, h, bg] of [[-1250, -2050, 330, 260, '#F7D9E4'], [-850, -2150, 240, 320, '#F2E3B0'], [-1150, -1700, 230, 180, '#BFE3F5']]) { c.fillStyle = '#5A6E66'; rr(c, x - 14, y - 14, w + 28, h + 28, 8); c.fill(); c.fillStyle = bg; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(80,60,60,.3)'; c.beginPath(); c.arc(x + w / 2, y + h * 0.45, Math.min(w, h) * 0.2, 0, TAU); c.fill(); }
  // floor lamp (right) + plant (left)
  c.fillStyle = '#3A4A44'; c.fillRect(1180, -1500, 14, 1500); paint(c, q => { q.m(1080, -1500); q.l(1300, -1500); q.l(1250, -1700); q.l(1130, -1700); q.z(); }, '#F4E3B0', { sd: 6, hd: 3, lw: 4 });
  const gl = c.createRadialGradient(1190, -1500, 20, 1190, -1500, 600); gl.addColorStop(0, 'rgba(255,230,160,.45)'); gl.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = gl; c.fillRect(590, -2100, 1200, 1200);
  c.fillStyle = '#5E9A6A'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(-1230 + i * 26, -780 - i * 50, 55, 160, -0.7 + i * 0.22, 0, TAU); c.fill(); } c.fillStyle = '#C98B5A'; rr(c, -1320, -480, 220, 300, 18); c.fill();
  c.fillStyle = '#B88A62'; c.fillRect(BX0, -160, BW, 1200); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = BX0; x < BX0 + BW; x += 200) c.fillRect(x, -160, 6, 1200);
  c.fillStyle = '#E8C9AE'; c.beginPath(); c.ellipse(0, 140, 1300, 170, 0, 0, TAU); c.fill();
}
function friendRoom(c) {
  c.fillStyle = '#F4D3E2'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,255,255,.25)'; for (let x = BX0 + 60; x < BX0 + BW; x += 170) for (let y = BY0 + 80; y < -300; y += 170) { c.beginPath(); c.arc(x, y, 14, 0, TAU); c.fill(); }
  // vanity mirror with bulbs (right)
  c.fillStyle = '#FFFFFF'; rr(c, 650, -2200, 760, 980, 40); c.fill(); c.fillStyle = '#D8E6F0'; rr(c, 700, -2150, 660, 880, 28); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.moveTo(760, -2100); c.lineTo(900, -2100); c.lineTo(740, -1800); c.closePath(); c.fill();
  for (let i = 0; i < 6; i++) for (const x of [670, 1390]) { const y = -2120 + i * 160; const gg = c.createRadialGradient(x, y, 2, x, y, 50); gg.addColorStop(0, 'rgba(255,240,200,1)'); gg.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = gg; c.fillRect(x - 50, y - 50, 100, 100); c.fillStyle = '#FFF6D8'; c.beginPath(); c.arc(x, y, 18, 0, TAU); c.fill(); }
  c.fillStyle = '#E8B4CC'; rr(c, 620, -1240, 820, 70, 14); c.fill();
  // fairy lights (left) + poster
  c.strokeStyle = 'rgba(120,80,100,.6)'; c.lineWidth = 4; c.beginPath(); for (let x = -1600; x <= 400; x += 25) c.lineTo(x, -2250 + Math.sin(x / 300) * 60 + (x + 1600) * 0.05); c.stroke();
  for (let x = -1550; x <= 400; x += 110) { const y = -2250 + Math.sin(x / 300) * 60 + (x + 1600) * 0.05 + 18; const gg = c.createRadialGradient(x, y, 2, x, y, 40); gg.addColorStop(0, 'rgba(255,230,150,.95)'); gg.addColorStop(1, 'rgba(255,230,150,0)'); c.fillStyle = gg; c.fillRect(x - 40, y - 40, 80, 80); }
  c.fillStyle = '#B9A2E6'; rr(c, -1300, -1950, 380, 520, 12); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-1110, -1720, 110, 0, TAU); c.fill(); c.fillStyle = '#F590A6'; heartPath(c, -1110, -1730, 60); c.fill();
  c.fillStyle = '#E2B9A0'; c.fillRect(BX0, -160, BW, 1200); c.fillStyle = '#F7E6EC'; c.beginPath(); c.ellipse(0, 140, 1200, 170, 0, 0, TAU); c.fill();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BG_HER = mkBG(livingRoom), BG_FR = mkBG(friendRoom);
function sofa(c, x, col, half = 760) {   // sofa / armchair behind the seated character (her legs come over the seat front)
  const dk = Hq.shade ? Hq.shade(col, 0.8) : col;
  paint(c, q => { q.m(x - half, -360); q.l(x - half, -900); q.q(x - half, -1000, x - half + 100, -1000); q.l(x + half - 100, -1000); q.q(x + half, -1000, x + half, -900); q.l(x + half, -360); q.z(); }, col, { sd: 12, hd: 6, lw: 4 });
  paint(c, q => { q.m(x - half + 60, -440); q.l(x + half - 60, -440); q.l(x + half - 40, -60); q.l(x - half + 40, -60); q.z(); }, col, { sd: 10, hd: 5, lw: 4 });
  c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x - half + 60, -330, half * 2 - 120, 10);
  for (const s of [-1, 1]) paint(c, q => { const ax = x + s * half; q.m(ax - 90, -60); q.l(ax - 90, -560); q.q(ax, -660, ax + 90, -560); q.l(ax + 90, -60); q.z(); }, dk, { sd: 10, hd: 5, lw: 4 });
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x - half - 80, -60, 30, 60); c.fillRect(x + half + 50, -60, 30, 60); }
function cushion(c, x, y, col, rot) { c.save(); c.translate(x, y); c.rotate(rot); paint(c, q => { q.m(-120, -110); q.q(0, -140, 120, -110); q.q(150, 0, 120, 110); q.q(0, 140, -120, 110); q.q(-150, 0, -120, -110); q.z(); }, col, { sd: 8, hd: 4, lw: 4 }); c.restore(); }

// ---------------- props held in hands (items are drawn at the wrist)
const phoneBack = ctx => { ctx.save(); ctx.rotate(-0.12); ctx.fillStyle = '#20232E'; rr(ctx, -40, -150, 80, 150, 14); ctx.fill(); ctx.fillStyle = '#3A3F55'; ctx.beginPath(); ctx.arc(-18, -128, 8, 0, TAU); ctx.arc(2, -128, 8, 0, TAU); ctx.fill(); ctx.restore(); };
const schoolHeld = { under: ctx => { ctx.save(); ctx.rotate(0.08); ctx.fillStyle = 'rgba(0,0,0,.25)'; rr(ctx, -112, -318, 230, 280, 8); ctx.fill(); ctx.fillStyle = '#FFFFFF'; rr(ctx, -120, -326, 230, 280, 8); ctx.fill(); ctx.drawImage(SCHOOL, -106, -312, 202, 239); ctx.restore(); } };
const albumHeld = { under: ctx => { ctx.save(); ctx.rotate(-0.06); ctx.fillStyle = '#5A3A2A'; rr(ctx, -150, -330, 300, 300, 14); ctx.fill(); ctx.fillStyle = '#F2E3B0'; ctx.fillRect(-150 + 286, -320, 10, 280); ctx.fillStyle = '#8A4A3A'; rr(ctx, -140, -344, 290, 300, 14); ctx.fill();
  ctx.strokeStyle = '#F2C14E'; ctx.lineWidth = 5; rr(ctx, -118, -322, 246, 256, 10); ctx.stroke(); fitTxt(ctx, 'SCHOOL', 5, -240, 50, '#F2C14E', 220, 'Unb9'); fitTxt(ctx, '2008 - 2014', 5, -180, 28, '#F7E6C8', 200, 'Nun9');
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(-60, -140, 130, 70); ctx.drawImage(SCHOOL, -54, -134, 54, 58); ctx.drawImage(SCHOOL, 6, -134, 54, 58); ctx.restore(); } };

// ---------------- character states
const lap = (g, s) => reach(g, s, s * g.sw * 0.55, g.ySh + 300);
const holdPhone = g => reach(g, 1, g.sw * 0.25, g.ySh + 170);
function gest(st, g, t, side, base) { const u = t * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.45 + Math.sin(u) * 18), g.ySh + base + Math.cos(u) * 18, { planar: true }); }
function herState(t) { const g = G.her, L = sceneAt(t).id, e = k => ev(L, k);
  const st = { t, talk: talk('her', t), mood: 'neutral', turn: 0, look: 0, lookY: 0.45, drop: SEAT, legPose: 'sit', floorShadow: false, armL: lap(g, -1), armR: holdPhone(g), items: { R: phoneBack } };
  if (L === 'hook') { st.mood = 'shock'; st.blink = 0; st.lookY = 0.5; if (t > hev('photo') + 0.3) { st.mood = 'worried'; st.blink = undefined; } if (t > hev('think') - 0.05) { st.mood = 'skeptical'; st.lookY = 0; st.look = 0.2; st.tilt = -0.05; } if (t > hev('four') - 0.05) { st.mood = 'smug'; st.look = 0; st.tilt = 0; } }
  if (L === 'o1') { st.mood = 'annoyed'; st.lookY = 0.4; st.tilt = -0.06; if (t > e('face') + 0.55) { st.mood = 'bored'; st.lookY = -0.85; st.look = 0.3; st.tilt = 0.05; } }   // eye roll
  if (L === 'o2') { st.mood = 'bored'; st.lookY = 0; st.look = 0; st.tilt = 0.04; }   // deadpan into the camera
  if (L === 'o3') { st.mood = 'neutral'; st.lookY = 0.1; if (speaking('o3_h', t, 0.05, 0.1)) gest(st, g, t, -1, 120); if (t > endOf('o3_h') + 0.3) { st.mood = 'happy'; st.lookY = 0.35; } if (t > SP.o3_nar.t + 0.6) { st.lookY = 0; st.look = 0.1; } }
  if (L === 'o4') { st.mood = 'happy'; st.lookY = 0; st.look = 0.1; st.tilt = 0.07; if (t < SP.o4_h.t + 0.6) st.blink = 1;   // sweet smile
    const r = e('raise'); if (t > r) { const k = eBack(P(t, r, r + 0.3), 1.5); st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * lerp(0.6, 1.5, k), g.ySh + lerp(300, 150, k), { planar: true }); st.items = { R: phoneBack, L: schoolHeld }; } }
  if (L === 'end') { const pa = e('palm'), al = e('album');
    if (t > pa - 0.1 && t < al) { const k = eOut(P(t, pa - 0.1, pa + 0.12)); st.mood = 'tired'; st.blink = 1; st.headFirst = true; st.tilt = 0.06 * k; st.headY = 8 * k;
      st.armL = reach(g, -1, lerp(-g.sw * 0.6, -g.hw * 0.05, k), lerp(g.ySh + 300, g.headY - g.hh * 0.38, k), { planar: true }); }   // open palm on the forehead
    if (t >= al) { st.mood = 'smug'; st.lookY = 0; st.look = 0.15; st.tilt = -0.05; const k = eBack(P(t, al, al + 0.3), 1.5); st.armL = reach(g, -1, -g.sw * lerp(0.6, 1.25, k), g.ySh + lerp(300, 150, k), { planar: true }); st.items = { R: phoneBack, L: albumHeld };
      st.armR = reach(g, 1, g.sw * 0.1, g.ySh + 120 + Math.abs(Math.sin((t - al) * 7)) * -40 * (t - al < 1.2 ? 1 : 0), { planar: true }); } }   // pats the album
  return st; }
function frState(t) { const g = G.fr, L = sceneAt(t).id, e = k => ev(L, k);
  const st = { t, talk: talk('friend4', t), mood: 'happy', turn: 0, look: 0, lookY: 0.45, drop: SEAT, legPose: 'sit', floorShadow: false, armL: lap(g, -1), armR: holdPhone(g), items: { R: phoneBack } };
  if (L === 'o1') { st.mood = 'surprised'; st.lookY = 0; if (speaking('o1_f', t, 0.05, 0.05)) { gest(st, g, t, -1, 140); st.mood = 'neutral'; } if (t > endOf('o1_f')) { st.mood = 'smug'; st.blink = 1; st.lookY = 0.4; } }
  if (L === 'o2') { const u = t - e('laugh'); st.mood = 'happy'; st.laugh = true; st.blink = 1; st.headY = Math.sin(u * 22) * 7; st.tilt = 0.08; st.armL = reach(g, -1, -g.sw * 0.3, g.ySh + 330, { planar: true }); }
  if (L === 'o3') { st.mood = 'worried'; st.lookY = 0; st.look = 0.1; st.armL = reach(g, -1, -g.sw * 0.05, g.ySh + 110, { planar: true }); }   // hand on her chest: "sorry"
  if (L === 'o4') { st.mood = 'shock'; st.blink = 0; st.lookY = 0; st.breathe = 0; st.headFirst = true; st.items = {};
    st.armL = reach(g, -1, -g.hw * 1.05, g.headY + g.hh * 0.45, { planar: true }); st.armR = reach(g, 1, g.hw * 1.05, g.headY + g.hh * 0.45, { planar: true }); }   // palms on her cheeks
  return st; }

// ---------------- world
const OFF = { x: 1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const heads = { her: { ...OFF, x: -1e5 }, friend4: OFF };
  if (tag.startsWith('fr')) { c.drawImage(BG_FR, FX + BX0, BY0, BW, BH); sofa(c, FX, '#E58FB4', 560); cushion(c, FX - 420, -560, '#FFFFFF', -0.2); heads.friend4 = K.put(c, FR, frState(t), FX, 0); K.mark(c, 'face', FX, heads.friend4.y, 200); }
  else { c.drawImage(BG_HER, HX + BX0, BY0, BW, BH); sofa(c, HX, '#E9A65A'); cushion(c, HX - 560, -560, '#7CC8B8', -0.25); cushion(c, HX + 580, -560, '#F7D9E4', 0.2); heads.her = K.put(c, HER, herState(t), HX, 0); K.mark(c, 'face', HX, heads.her.y, 200); }
  return heads; }
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hY = SEAT + G.her.headY, fY = SEAT + G.fr.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { HER: S(HX + 30, fy(hY, 1.0, 900), 1.0, 'her'), HER_R: S(HX + 30, fy(hY, 1.0, 1080), 1.0, 'her'), HER_CU: S(HX + 20, fy(hY, 1.45, 1060), 1.45, 'her'), HER_PH: S(HX - 120, fy(hY, 0.86, 1000), 0.86, 'her'), HER_W: S(HX - 60, fy(hY, 0.8, 880), 0.8, 'her'),
  FR: S(FX + 30, fy(fY, 1.0, 960), 1.0, 'fr'), FR_R: S(FX + 30, fy(fY, 1.0, 1080), 1.0, 'fr'), FR_CU: S(FX + 20, fy(fY, 1.4, 1090), 1.4, 'fr'),
  POST: U('post', 1), CHAT: U('chat', 2), PHOTO: U('photo', 3), SCHOOL: U('school', 4) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.HER;
  if (L === 'hook') { if (t < hev('face')) return SH.POST; if (t < hev('photo')) return f(SH.HER_CU); if (t < hev('think')) return f(SH.PHOTO); return f(SH.HER_R); }
  if (L === 'o1') { if (t < SP.o1_f.t - 0.1) return f(SH.POST); if (t < e('jump') - 0.02) return f(SH.FR); if (t < e('face')) return f(SH.POST); return f(SH.HER_R); }
  if (L === 'o2') { if (t < e('laugh')) return f(SH.POST); if (t < e('deadpan')) return f(SH.FR_R); if (t < e('still')) return f(SH.HER_R); return f(SH.POST); }
  if (L === 'o3') { if (t < endOf('o3_h') + 0.27) return f(SH.HER); if (t < e('sorry')) return f(SH.CHAT); if (t < SP.o3_nar.t + 0.55) return f(SH.FR_R); return f(SH.HER_R); }
  if (L === 'o4') { if (t < e('school')) return f(SH.HER_PH); if (t < SP.o4_f.t - 0.1) return f(SH.SCHOOL); return f(SH.FR_CU); }
  if (L === 'end') { if (t < e('palm')) return f(SH.POST); if (t < e('album') - 0.05) return f(SH.HER_CU); return f(SH.HER_W); }
  return SH.HER; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- the post (light social app, English UI only)
function backdrop(c, id, col0 = '#2A2F48', col1 = '#141724') { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, col0); g.addColorStop(1, col1); c.fillStyle = g; c.fillRect(0, 0, W, HH); c.fillStyle = 'rgba(255,255,255,.035)'; for (let k = 0; k < 12; k++) c.fillRect(0, k * 180, W, 70); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id }); }
function wrapLines(c, s, maxW) { const out = []; let cur = ''; for (const w of s.split(' ')) { const tr = cur ? cur + ' ' + w : w; if (c.measureText(tr).width > maxW && cur) { out.push(cur); cur = w; } else cur = tr; } if (cur) out.push(cur); return out; }
function likesAt(t, L) { if (L === 'hook') return Math.round(lerp(47, 120, eIO(P(t, 0.3, 2.3))));
  if (L === 'o1') return t < ev('o1', 'jump') ? 120 : Math.round(lerp(120, 356, eOut(P(t, ev('o1', 'jump'), ev('o1', 'jump') + 0.5))));
  if (L === 'o2') return 120 + Math.floor(Math.max(0, t - SC.o2.s) * 3.2) + (t > ev('o2', 'reply') ? 40 : 0);
  return 120; }
function postState(t) { const L = sceneAt(t).id, e = k => ev(L, k), o = { L, likes: likesAt(t, L), mine: null, mineK: 0, typed: '', reply: null, replyK: 0, laugh: false, potato: 0, del: 0, jump: 0 };
  const typing = (txt, a, b) => { o.typed = txt.slice(0, Math.round(clamp(P(t, a, b)) * txt.length)); };
  if (L === 'o1') { const s = 'Delete.'; if (t < e('sent')) typing(s, e('type0'), e('sent') - 0.12); else { o.mine = s; o.mineK = eBack(P(t, e('sent'), e('sent') + 0.2), 1.6); }
    if (t > e('jump') - 0.08) { o.reply = 'But I look amazing in it!'; o.replyK = eBack(P(t, e('jump') - 0.08, e('jump') + 0.14), 1.6); } o.jump = P(t, e('jump'), e('jump') + 0.9); }
  if (L === 'o2') { const s = "Nice photo of you. Who's the potato next to you?"; if (t < e('sent')) typing(s, e('type0'), e('sent') - 0.15); else { o.mine = s; o.mineK = eBack(P(t, e('sent'), e('sent') + 0.2), 1.6); }
    o.potato = eBack(P(t, e('potato'), e('potato') + 0.25), 2.2); if (t > e('reply')) { o.reply = "That's you!"; o.laugh = true; o.replyK = eBack(P(t, e('reply'), e('reply') + 0.2), 1.6); } }
  if (L === 'end') { o.del = P(t, e('poof'), e('poof') + 0.35); }
  if (L === 'hook') o.heart = eBack(P(t, 0.12, 0.4), 2.4);
  return o; }
function heartIcon(c, x, y, s, filled, k = 1) { c.save(); c.translate(x, y); c.scale(k, k); heartPath(c, 0, 0, s); if (filled) { c.fillStyle = '#F0435A'; c.fill(); } else { c.strokeStyle = '#262A33'; c.lineWidth = 3; c.stroke(); } c.restore(); }
function comment(c, w, y, who, name, txt, k, indent = 0, laugh = false) { if (k <= 0) return y; c.font = '20px Nun8'; const lines = wrapLines(c, name + ' ' + txt, w - 96 - indent - (laugh ? 34 : 0)); const h = Math.max(36, lines.length * 25 + 8);
  c.save(); c.globalAlpha = clamp(k); c.translate(24 + indent, y + h / 2); c.scale(k, k); c.translate(-(24 + indent), -(y + h / 2));
  avatar(c, who, 30 + indent, y + 16, 15);
  let x0 = 54 + indent; lines.forEach((l, i) => { const yy = y + 12 + i * 25; c.textAlign = 'left'; c.textBaseline = 'middle';
    if (i === 0) { c.font = '20px Nun9'; c.fillStyle = '#121418'; c.fillText(name, x0, yy); const nw = c.measureText(name + ' ').width; c.font = '20px Nun8'; c.fillStyle = '#2B2F38'; c.fillText(l.slice(name.length + 1), x0 + nw, yy); }
    else { c.font = '20px Nun8'; c.fillStyle = '#2B2F38'; c.fillText(l, x0, yy); } });
  if (laugh) { c.font = '20px Nun8'; const lw = c.measureText(lines[lines.length - 1]).width; laughIcon(c, x0 + lw + 20, y + 12 + (lines.length - 1) * 25, 13); }
  c.restore(); return y + h + 6; }
function postScreen(c, w, h, t) { const o = postState(t);
  c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h);
  fitTxt(c, '11:42', 26, 18, 16, '#121418', 80, 'Nun9', 'left'); c.fillStyle = '#121418'; rr(c, w - 50, 11, 30, 14, 4); c.fill();
  // post header
  avatar(c, 'fr', 36, 62, 22, '#E0476E'); fitTxt(c, 'chloe.xo', 68, 54, 20, '#121418', 200, 'Nun9', 'left'); fitTxt(c, 'Just now', 68, 76, 15, '#8A8F99', 200, 'Nun8', 'left');
  c.fillStyle = '#262A33'; for (const dx of [-12, 0, 12]) { c.beginPath(); c.arc(w - 30 + dx, 62, 3, 0, TAU); c.fill(); }
  const py = 92, ph = 332;
  if (o.del < 1) { const k = 1 - eIn(o.del); c.save(); c.translate(w / 2, py + ph / 2); c.scale(k, k); c.globalAlpha = k; c.drawImage(PHOTO, -w / 2, -ph / 2, w, ph);
    if (o.potato > 0) potato(c, -w / 2 + PHOTO_FACE.x * w / PW + 70, -ph / 2 + PHOTO_FACE.y * ph / PH - 36, 0.55 * o.potato, -0.2);
    c.restore(); }
  if (o.del > 0) { // poof + "Post deleted"
    const u = o.del; if (u < 1) { c.save(); c.globalAlpha = 1 - u; c.fillStyle = '#D8DCE4'; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; c.beginPath(); c.arc(w / 2 + Math.cos(a) * 160 * eOut(u), py + ph / 2 + Math.sin(a) * 120 * eOut(u), 40 * (1 - u) + 10, 0, TAU); c.fill(); } c.restore(); }
    const k = eBack(P(u, 0.5, 1), 1.6); if (k > 0) { c.save(); c.translate(w / 2, py + ph / 2); c.scale(k, k); c.fillStyle = '#F1F2F5'; rr(c, -180, -130, 360, 260, 22); c.fill();
      c.strokeStyle = '#8A8F99'; c.lineWidth = 7; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-34, -46); c.lineTo(34, -46); c.moveTo(-12, -58); c.lineTo(12, -58); c.stroke(); rr(c, -28, -40, 56, 66, 8); c.stroke(); c.beginPath(); c.moveTo(-9, -26); c.lineTo(-9, 12); c.moveTo(9, -26); c.lineTo(9, 12); c.stroke();
      fitTxt(c, 'Post deleted', 0, 66, 30, '#262A33', 320, 'Nun9'); c.restore(); } }
  if (o.del > 0.4) { c.fillStyle = 'rgba(255,255,255,1)'; c.fillRect(0, py + ph, w, h - py - ph); c.fillStyle = '#E9EBEF'; for (const [y, ww] of [[452, 220], [482, 300], [512, 260]]) { rr(c, 20, y, ww, 14, 7); c.fill(); } return; }
  // actions + likes
  const ay = py + ph + 28, jumpK = o.jump > 0 && o.jump < 1 ? 1 + 0.45 * Math.sin(o.jump * Math.PI) : 1;
  heartIcon(c, 30, ay - 4, 13, true, (o.heart ?? 1) * jumpK);
  if (o.jump > 0 && o.jump < 1) { c.save(); c.globalAlpha = 1 - o.jump; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.45, r = 26 + o.jump * 90; heartIcon(c, 30 + Math.cos(a) * r, ay - 4 + Math.sin(a) * r, 7, true); } c.restore(); }
  c.strokeStyle = '#262A33'; c.lineWidth = 3; c.beginPath(); c.arc(76, ay - 4, 13, 0.6, TAU - 0.2); c.lineTo(66, ay + 12); c.closePath(); c.stroke();
  c.beginPath(); c.moveTo(106, ay - 16); c.lineTo(134, ay - 4); c.lineTo(106, ay + 8); c.lineTo(112, ay - 4); c.closePath(); c.stroke();
  c.beginPath(); c.moveTo(w - 40, ay - 16); c.lineTo(w - 22, ay - 16); c.lineTo(w - 22, ay + 12); c.lineTo(w - 31, ay + 4); c.lineTo(w - 40, ay + 12); c.closePath(); c.stroke();
  const lk = `${o.likes} likes`; c.save(); c.translate(20, ay + 34); c.scale(jumpK, jumpK); fitTxt(c, lk, 0, 0, 21, o.jump > 0 && o.jump < 1 ? '#F0435A' : '#121418', 300, 'Nun9', 'left'); c.restore();
  c.font = '20px Nun9'; c.fillStyle = '#121418'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('chloe.xo', 20, ay + 62); const nw = c.measureText('chloe.xo ').width; c.font = '20px Nun8'; c.fillStyle = '#2B2F38'; c.fillText('Best night ever!', 20 + nw, ay + 62);
  // comments
  let y = ay + 82; if (o.mine) y = comment(c, w, y, 'her', 'kate.m', o.mine, o.mineK); if (o.reply) y = comment(c, w, y, 'fr', 'chloe.xo', o.reply, o.replyK, 30, o.laugh);
  if (!o.mine && !o.reply && o.L !== 'end') { c.fillStyle = '#8A8F99'; c.font = '18px Nun8'; c.fillText(o.L === 'hook' ? 'Be the first to comment' : 'View all comments', 20, y + 12); }
  // input bar
  c.fillStyle = '#FFFFFF'; c.fillRect(0, h - 58, w, 58); c.fillStyle = '#E9EBEF'; c.fillRect(0, h - 58, w, 2); avatar(c, 'her', 30, h - 29, 15);
  if (o.typed) { fitTxt(c, o.typed, 56, h - 29, 20, '#121418', w - 130, 'Nun8', 'left'); if (Math.floor(t * 4) % 2 === 0) { UI.textFit(c, 'Nun8', 20, o.typed, w - 130); const tw = c.measureText(o.typed).width; c.fillStyle = '#3D7BF2'; c.fillRect(58 + tw, h - 42, 2, 26); } }
  else fitTxt(c, 'Add a comment...', 56, h - 29, 18, '#8A8F99', w - 130, 'Nun8', 'left');
  fitTxt(c, 'Post', w - 22, h - 29, 19, o.typed ? '#3D7BF2' : '#A9C4F5', 60, 'Nun9', 'right'); }
function postView(c, t, L) { backdrop(c, 'post'); const hook = L === 'hook', x = 540, y = hook ? 1032 : 905, s = hook ? 1.24 : 1.42;
  K.phone(c, x, y, s, (cc, w, h) => postScreen(cc, w, h, t));
  if (L === 'end') notification(c, t); }
function notification(c, t) { const a = ev('end', 'notif'); const k = eOut(P(t, a, a + 0.3)); if (k <= 0) return; const y = lerp(150, 430, k);
  c.save(); c.translate(540, y); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -430 + 8, -95 + 12, 860, 190, 36); c.fill(); c.fillStyle = 'rgba(250,250,252,.98)'; rr(c, -430, -95, 860, 190, 36); c.fill();
  const g = c.createLinearGradient(-390, -50, -290, 50); g.addColorStop(0, '#F7A23A'); g.addColorStop(1, '#E0476E'); c.fillStyle = g; rr(c, -395, -50, 100, 100, 26); c.fill(); heartIcon(c, -345, 0, 22, false); c.strokeStyle = '#FFFFFF'; c.lineWidth = 5; heartPath(c, -345, 0, 22); c.stroke();
  avatar(c, 'mum', -205, 0, 48);
  fitTxt(c, 'Mum commented:', -135, -32, 42, '#121418', 540, 'Nun9', 'left'); fitTxt(c, 'Beautiful girls!', -135, 26, 50, '#E0476E', 540, 'Nun9', 'left');
  fitTxt(c, 'now', 400, -60, 26, '#8A8F99', 80, 'Nun8', 'right'); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 110, y: y - 95, w: 860, h: 190, k, id: 'notif' }); }

// ---------------- the DM chat (o3)
function msg(c, w, y, s, mine, k, fs = 26) { if (k <= 0) return y; c.font = `${fs}px Nun9`; const lines = wrapLines(c, s, w * 0.68), bw = Math.max(...lines.map(l => c.measureText(l).width)) + 40, bh = lines.length * fs * 1.22 + 26;
  const x = mine ? w - 16 - bw : 52; c.save(); c.translate(mine ? x + bw : x, y + bh); c.scale(k, k); c.translate(-(mine ? x + bw : x), -(y + bh));
  c.fillStyle = mine ? '#7A5AF0' : '#EEF0F4'; rr(c, x, y, bw, bh, 22); c.fill(); if (!mine) avatar(c, 'fr', 28, y + bh - 14, 14);
  c.fillStyle = mine ? '#FFFFFF' : '#121418'; c.textAlign = 'left'; c.textBaseline = 'top'; lines.forEach((l, i) => c.fillText(l, x + 20, y + 13 + i * fs * 1.22));
  c.restore(); return y + bh + 14; }
function typingBubble(c, y, t, k) { if (k <= 0) return; c.save(); c.translate(52, y + 56); c.scale(k, k); c.fillStyle = '#EEF0F4'; rr(c, 0, -56, 104, 56, 22); c.fill();
  for (let i = 0; i < 3; i++) { const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 9 - i * 0.9)); c.fillStyle = `rgba(80,86,100,${a})`; c.beginPath(); c.arc(28 + i * 24, -28 - 5 * Math.max(0, Math.sin(t * 9 - i * 0.9)), 8, 0, TAU); c.fill(); } c.restore(); }
function chatScreen(c, w, h, t) { const e = k => ev('o3', k);
  c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h); fitTxt(c, '11:44', 26, 18, 16, '#121418', 80, 'Nun9', 'left'); c.fillStyle = '#121418'; rr(c, w - 50, 11, 30, 14, 4); c.fill();
  c.strokeStyle = '#121418'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(26, 48); c.lineTo(14, 62); c.lineTo(26, 76); c.stroke(); avatar(c, 'fr', 62, 62, 22, '#E0476E');
  const dots = t > e('dots') && t < e('reply'); fitTxt(c, 'chloe.xo', 94, 52, 21, '#121418', 200, 'Nun9', 'left'); fitTxt(c, dots ? 'typing...' : 'Active now', 94, 74, 15, dots ? '#7A5AF0' : '#8A8F99', 200, 'Nun8', 'left');
  c.fillStyle = '#E9EBEF'; c.fillRect(0, 96, w, 2);
  // shared post card from Chloe (the photo)
  let y = 116; c.fillStyle = '#EEF0F4'; rr(c, 52, y, 230, 236, 18); c.fill(); c.drawImage(PHOTO, 60, y + 8, 214, 171); fitTxt(c, 'Best night ever!', 64, y + 204, 17, '#121418', 200, 'Nun9', 'left'); avatar(c, 'fr', 28, y + 222, 14); y += 252;
  y = msg(c, w, y, "Could you take it down? I'm not comfortable with it.", true, eBack(P(t, e('sent'), e('sent') + 0.2), 1.6));
  if (t > e('sent') + 0.4) { fitTxt(c, 'Seen', w - 20, y - 6, 14, '#8A8F99', 80, 'Nun8', 'right'); y += 14; }
  if (dots) typingBubble(c, y, t, eBack(P(t, e('dots'), e('dots') + 0.2), 1.8));
  if (t > e('reply')) y = msg(c, w, y, 'Oh! Sure, sorry.', false, eBack(P(t, e('reply'), e('reply') + 0.22), 1.6));
  c.fillStyle = '#FFFFFF'; c.fillRect(0, h - 58, w, 58); c.fillStyle = '#F1F2F5'; rr(c, 14, h - 48, w - 28, 40, 20); c.fill(); fitTxt(c, 'Message...', 34, h - 28, 18, '#8A8F99', 200, 'Nun8', 'left'); }
function chatView(c, t) { backdrop(c, 'chat', '#3A2E5A', '#1A1530'); K.phone(c, 540, 905, 1.42, (cc, w, h) => chatScreen(cc, w, h, t)); }

// ---------------- photo close-up (hook) and school photo close-up (o4)
function photoView(c, t) { backdrop(c, 'photo', '#2A2F48', '#141724'); const w = 940, h = w * PH / PW, x = 540, y = 1060, k = eBack(P(t, hev('photo'), hev('photo') + 0.25), 1.5);
  c.save(); c.translate(x, y); c.rotate(-0.025); c.scale(lerp(0.9, 1, k), lerp(0.9, 1, k)); c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, -w / 2 - 10, -h / 2 - 2, w + 36, h + 36, 12); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -w / 2 - 18, -h / 2 - 18, w + 36, h + 36, 12); c.fill(); c.drawImage(PHOTO, -w / 2, -h / 2, w, h);
  // red marker circle around her face at «ужасно»
  const m = P(t, hev('circle'), hev('circle') + 0.45); if (m > 0) { const cx = -w / 2 + PHOTO_FACE.x * w / PW, cy = -h / 2 + PHOTO_FACE.y * h / PH, r = PHOTO_FACE.r * w / PW; c.strokeStyle = '#F0435A'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.ellipse(cx, cy, r * 1.05, r * 1.15, -0.2, -1.8, -1.8 + TAU * 1.08 * eOut(m)); c.stroke(); }
  c.restore(); }
function schoolView(c, t) { backdrop(c, 'school', '#3E6A9A', '#1C2E48'); const s0 = ev('o4', 'school'), k = eOut(P(t, s0, s0 + 0.35)), z = lerp(1.25, 1, k), w = SW_ * 0.95, h = SH_ * 0.95;
  c.save(); c.translate(540, 1000); c.rotate(lerp(-0.12, 0.03, k)); c.scale(z, z); c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, -w / 2 - 14, -h / 2 - 10, w + 44, h + 104, 10); c.fill(); c.fillStyle = '#FBF7EE'; rr(c, -w / 2 - 22, -h / 2 - 22, w + 44, h + 104, 10); c.fill(); c.drawImage(SCHOOL, -w / 2, -h / 2, w, h);
  fitTxt(c, 'SCHOOL PHOTO  2011', 0, h / 2 + 42, 34, '#5A5A6A', w - 40, 'Nun9'); c.restore();
  c.fillStyle = C.gold; for (let i = 0; i < 6; i++) { const a = t * 2 + i * 1.05; sparkle4(c, 540 + Math.cos(a) * 470, 1000 + Math.sin(a * 1.3) * 560, 22 + 8 * Math.sin(t * 6 + i)); } }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, hev('title_out') - 0.2, hev('title_out')); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 360); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 195, w: 980, h: 330, k: a, id: 'title' }); }
function commentPlate(c, t) { const a = hev('plate'), k = eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, SC.hook.e - 0.25, SC.hook.e - 0.05)); if (k <= 0) return;
  c.save(); c.translate(540, 470); c.rotate(-0.025); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, -450 + 8, -150 + 12, 900, 300, 34); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -450, -150, 900, 300, 34); c.fill();
  c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(-330, 145); c.lineTo(-290, 193); c.lineTo(-270, 145); c.fill();
  c.fillStyle = '#EE5E9A'; rr(c, -450, -150, 900, 70, [34, 34, 0, 0]); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -410, -133, 46, 34, 10); c.fill(); c.beginPath(); c.moveTo(-402, -103); c.lineTo(-406, -87); c.lineTo(-386, -101); c.fill();
  fitTxt(c, 'Вопрос из комментариев:', -345, -115, 36, '#FFFFFF', 720, 'Nun9', 'left');
  fitTxt(c, 'подруга выложила фото,', 0, -32, 50, '#1E2030', 820, 'Unb9'); fitTxt(c, 'где ты ужасно вышла.', 0, 30, 50, '#1E2030', 820, 'Unb9'); fitTxt(c, 'Что написать?', 0, 96, 50, C.pinkD, 820, 'Unb9');
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 90, y: 320, w: 900, h: 300, k, id: 'comment' }); }
const PLATES = { o1: ['1', 'ХОЛОДНО', '#E0474C'], o2: ['2', 'С ЮМОРОМ', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD6'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, s = k * lerp(1, Math.min(1.4, 960 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }
// Russian translation of a line read over an insert (under the phone)
const RU_IDS = ['hook_f', 'o1_h', 'o2_h', 'o2_f', 'o3_f', 'end_f'];
function ruLine(c, t, id, y) { const sp = SP[id]; if (!sp) return; const i = TL.speech.indexOf(sp), nx = TL.speech[i + 1], a = P(t, sp.t - 0.05, sp.t + 0.15), end = Math.min(sp.t + sp.d + 0.45, nx ? nx.t - 0.1 : 1e9), b = 1 - P(t, end - 0.12, end);
  const k = Math.min(a, b); if (k <= 0) return; c.save(); c.globalAlpha = k; UI.textFit(c, 'Nun9', 50, sp.ru, 960); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, sp.ru, 540, y, C.pinkL, C.oliveD, 10); c.restore();
  if (global.__QA) global.__QA.ui(c, 'captions', { x: 60, y: y - 40, w: 960, h: 80, k, id: id + '_ru' }); }

// ---------------- end screen
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Chloe small at the bottom-left (clear of the buttons and the subtitles)
  const hy = lerp(2350, 2040, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gf = G.fr; K.put(c, FR, { t, mood: 'happy', blink: 1, turn: -0.2, look: -0.4, armL: reach(gf, -1, -gf.sw * 0.8, gf.ySh + 330), armR: holdPhone(gf), items: { R: phoneBack } }, 640, 60);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0.1, look: 0.2, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(t * 8) * 30, { planar: true }), armR: holdPhone(g), items: { R: phoneBack } }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.2, 0.55), 2.2); if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 76); strokeText(c, 'КАКОЙ ОТВЕТ', 0, -48, C.oliveD, C.white, 14); strokeText(c, 'ТВОЙ?', 0, 48, C.pink, C.white, 14); c.restore(); }
  const tw = [wAt('outro', 'один', sp.t + 1.4), wAt('outro', 'два', sp.t + 1.75), wAt('outro', 'три', sp.t + 2.1), wAt('outro', 'четыре', sp.t + 2.45)];
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = i % 2 ? 730 : 270, y = 600 + Math.floor(i / 2) * 250, bump = 1 + 0.08 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -110 + 12, 390, 220, 40); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -195, -110, 390, 220, 40); c.fill(); c.stroke();
    font(c, 'Unb9', 110); c.fillStyle = C.white; c.fillText(p[0], 0, -28); const lab = p[1].split(' '); if (lab.length > 1 && id === 'o4') { textFit(c, 'Unb9', 30, 'КОРОЛЕВСКИЙ', 340); c.fillText('КОРОЛЕВСКИЙ', 0, 52); textFit(c, 'Unb9', 30, 'ОТВЕТ', 340); c.fillText('ОТВЕТ', 0, 86); }
    else { textFit(c, 'Unb9', 34, p[1], 340); c.fillText(p[1], 0, 66); } c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.0) - 0.15, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.3) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1110); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.6, SC.outro.e - 1.5), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1290;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(600, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 680, mv), lerp(sy + 230, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  UI.captions(c, t); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'her';
  let heads = { her: { ...OFF, x: -1e5 }, friend4: OFF }, proj = p => p;
  if (tag.startsWith('ui:')) { c.save(); c.translate(sh.x, sh.y);
    if (tag === 'ui:post') postView(c, t, L); else if (tag === 'ui:chat') chatView(c, t); else if (tag === 'ui:photo') photoView(c, t); else schoolView(c, t);
    c.restore(); Hq.vignette(c, W, HH, 0.2); for (const id of RU_IDS) ruLine(c, t, id, L === 'hook' ? 1572 : 1535); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26);
    const LIVE = { o1: ['friend4'], o3: ['her'], o4: ['her', 'friend4'] }[L] || [], bh = {}; for (const k of LIVE) bh[k] = heads[k];
    if (LIVE.length) K.bubbles(c, t, sc, bh, proj, { cleanChunks: true, names: { friend4: ['CHLOE', '#8E5BD6'] }, hold: { o1_f: 0.05, o3_h: 0.05, o4_h: 0.05, o4_f: 0.3 } }); }
  if (L === 'hook') { title(c, t); commentPlate(c, t); }
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('badphoto', NF, renderFrame);
