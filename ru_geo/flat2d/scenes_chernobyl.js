import { W, H, g, INK, TAU, clamp, lerp, ease, SCENES, EMBLEMS, PHOTOS, drawPhoto, drawChar, poly, rrect, ell, circ, fillO, R, P, E, C, line, rng, windows, building, tree, cloud, stack, star, ferris, bus, truck, smoke, flame, person_silhouette, LW } from './engine.js';

const FLOOR_Y = 760;
const stripes = (a, b, y0 = 0, y1 = FLOOR_Y, x0 = -1200, x1 = 3200, w = 80) => { for (let i = Math.floor(x0 / w); i < x1 / w; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * w, y0, w, y1 - y0); } };
const sky = (top, bot, y0 = -400, y1 = 1500) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(-1200, y0, 4400, y1 - y0); };
const flatSky = (col, y0 = -400, y1 = 800) => { g.fillStyle = col; g.fillRect(-1200, y0, 4400, y1 - y0); };
const ground = (y, col, h = 600, x0 = -1200, x1 = 3200) => { g.fillStyle = col; g.fillRect(x0, y, x1 - x0, h); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); };
const noise = (t, n, col) => { };

// ---------- вид из окна ----------
function windowView(x, y, w, h, o = {}) {
  g.save(); rrect(x, y, w, h, 8); g.clip();
  g.fillStyle = o.night ? '#1d2a4a' : '#9dd8f0'; g.fillRect(x, y, w, h);
  if (o.night) { for (let i = 0; i < 18; i++) { const r = rng(i + 9); g.fillStyle = '#ffe9a8'; g.fillRect(x + r() * w, y + r() * h * 0.55, 3, 3); } }
  g.fillStyle = o.night ? '#2a3a5c' : '#bfc9d3';
  for (const [bx, bw, bh] of [[0, 90, 160], [95, 70, 110], [170, 100, 190], [275, 60, 100], [335, 90, 150]]) { g.fillRect(x + bx, y + h - bh, bw, bh); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(x + bx, y + h - bh, bw, bh); windows(x + bx, y + h - bh, bw, bh, Math.max(2, Math.round(bw / 24)), Math.round(bh / 28), o.night ? '#43506e' : '#8b9fb3', o.night ? 0.35 : 0, bx + 3); }
  for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#fff' : '#e0443a'; g.fillRect(x + 238, y + 8 + i * 22, 22, 22); } g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(x + 238, y + 8, 22, 132);
  if (o.glow) { const gr = g.createRadialGradient(x + 249, y + 130, 4, x + 249, y + 130, 120); gr.addColorStop(0, 'rgba(255,140,30,.9)'); gr.addColorStop(1, 'rgba(255,140,30,0)'); g.fillStyle = gr; g.fillRect(x, y, w, h); }
  if (!o.night) { g.strokeStyle = '#d8423a'; g.lineWidth = 5; g.beginPath(); g.arc(x + 330, y + 90, 42, 0, TAU); g.stroke(); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(x + 330 + Math.cos(a) * 42, y + 90 + Math.sin(a) * 42); g.lineTo(x + 330 - Math.cos(a) * 42, y + 90 - Math.sin(a) * 42); g.stroke(); } }
  g.restore();
  rrect(x, y, w, h, 8); g.lineWidth = 10; g.strokeStyle = '#ffffff'; g.stroke(); rrect(x, y, w, h, 8); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
  g.fillStyle = '#fff'; g.fillRect(x + w / 2 - 5, y, 10, h); g.fillRect(x, y + h / 2 - 5, w, 10); g.lineWidth = 4; g.strokeStyle = INK; g.strokeRect(x + w / 2 - 5, y, 10, h); g.strokeRect(x, y + h / 2 - 5, w, 10);
  if (o.closed) { /* закрытое окно: форточка */ R(x + w - 80, y + 12, 60, 44, '#fff', 4, 4); }
}

// ---------- комната ----------
SCENES.room = {
  bg(st) {
    const sp = st.sp, night = !!sp.night, old = !!sp.old; const door = typeof sp.door === 'function' ? sp.door(st.pt) : (sp.door || 0);
    stripes(night ? '#6a6a9c' : '#ffd98a', night ? '#5a5a8c' : '#ffc76b', 0, 600, -1200, 3200);
    g.fillStyle = night ? '#6a4a6a' : '#e4793f'; g.fillRect(-1200, 600, 4400, FLOOR_Y - 600); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(-1204, 600, 4408, FLOOR_Y - 600);
    g.fillStyle = night ? '#4a3a58' : '#c8602f'; g.fillRect(-1200, 596, 4400, 12);
    g.fillStyle = night ? '#8a6a4a' : '#e7a85c'; g.fillRect(-1200, FLOOR_Y, 4400, H - FLOOR_Y + 400);
    g.strokeStyle = night ? '#6a4a3a' : '#c2813f'; g.lineWidth = 4; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(-1200, FLOOR_Y + 30 + i * 30); g.lineTo(3200, FLOOR_Y + 30 + i * 30); g.stroke(); }
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-1200, FLOOR_Y); g.lineTo(3200, FLOOR_Y); g.stroke();
    ell(960, 930, 520, 90); fillO('#d9503f', 6); ell(960, 930, 420, 66); fillO('#f6c75c', 5);
    windowView(760, 150, 420, 320, { night, glow: sp.glow });
    for (const sd of [0, 1]) { const x = sd ? 1186 : 664; P([[x, 130], [x + 90, 130], [x + 80, 510], [x + 6, 510]], night ? '#c8662c' : '#f58a3c', 6); }
    const dx = 110, dy = 300, dw = 230, dh = FLOOR_Y - 300;
    g.fillStyle = '#fff3cf'; g.fillRect(dx, dy, dw, dh + 20); g.fillStyle = '#e4793f'; g.fillRect(dx, dy + 280, dw, 220); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(dx, dy, dw, dh + 20); g.strokeRect(dx, dy + 280, dw, 220);
    const lw_ = lerp(dw, 20, ease(door)); g.fillStyle = '#b3612f'; g.fillRect(dx, dy, lw_, dh + 10); g.strokeRect(dx, dy, lw_, dh + 10);
    if (door < 0.6) { g.fillStyle = '#d68a3c'; g.fillRect(dx + 20, dy + 24, lw_ - 40, 140); g.strokeRect(dx + 20, dy + 24, lw_ - 40, 140); g.fillRect(dx + 20, dy + 200, lw_ - 40, 200); g.strokeRect(dx + 20, dy + 200, lw_ - 40, 200); circ(dx + lw_ - 28, dy + 300, 9); fillO('#ffd24a', 5); }
    R(400, 640, 300, 120, '#a05a2c', 14); R(410, 600, 280, 60, night ? '#2f5f9a' : '#3d86d6', 12); R(420, 580, 100, 40, '#fff', 14);
    R(1240, 270, 250, 490, '#b8672f', 10); line([[1365, 270], [1365, 760]], 6); for (const x of [1345, 1385]) C(x, 520, 8, '#ffd24a', 4);
    R(1480, 640, 340, 32, '#7a4a22', 8); for (const x of [1500, 1780]) R(x, 672, 24, 100, '#5c3618', 4);
    P([[1520, 640], [1556, 560], [1596, 560], [1632, 640]], '#ffe28a', 5);
    if (sp.book !== false) { R(1658, 604, 120, 36, '#2f6fc2', 6); R(1664, 594, 108, 16, '#f6efe0', 4, 5); line([[1718, 594], [1718, 610]], 3); }
    if (sp.radio) { R(1610, 560, 70, 44, '#8a5a32', 6); C(1634, 582, 14, '#e8d8b0', 4); line([[1700, 570], [1720, 560], [1700, 590]], 4); line([[1730, 560], [1760, 548], [1730, 604]], 4); }
    R(1560, 720, 120, 22, '#a05a2c', 8); for (const x of [1574, 1650]) R(x, 742, 14, 50, '#7a4a22', 3, 5);
    if (sp.teddyBed) { E(520, 596, 22, 24, '#a8743c', 5); E(520, 568, 17, 16, '#b8844c', 5); }
    if (old) { g.fillStyle = 'rgba(120,110,90,.38)'; g.fillRect(-1200, -400, 4400, 1800); const r2 = rng(5); for (let i = 0; i < 14; i++) { const x = 100 + r2() * 1700; P([[x, FLOOR_Y + 20], [x + 8, FLOOR_Y - 40 - r2() * 40], [x + 20, FLOOR_Y + 20]], '#4a8a3a', 4); } g.fillStyle = 'rgba(230,225,210,.5)'; R(1658, 590, 120, 18, 'rgba(210,205,190,.7)', 6, 3); }
    if (st.sp.knock) { const k = Math.floor(st.t * 5) % 2; g.save(); g.font = '900 64px Nunito'; g.textAlign = 'center'; g.strokeStyle = INK; g.lineWidth = 12; g.fillStyle = '#fff'; for (let i = 0; i < 2; i++) { g.strokeText('тук', 440 + i * 130, 400 - k * 6 + i * 20); g.fillText('тук', 440 + i * 130, 400 - k * 6 + i * 20); } g.restore(); }
  },
  fg(st) { const sp = st.sp; if (sp.night) { g.fillStyle = 'rgba(14,16,50,.35)'; g.fillRect(-1200, -400, 4400, 1800); } if (sp.waves) { /* радио-волны */ for (let i = 0; i < 3; i++) { g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 5; g.beginPath(); g.arc(1634, 582, 40 + ((st.t * 40 + i * 30) % 90), -0.8, 0.8); g.stroke(); } } },
};

// ---------- город ----------
SCENES.town = {
  bg(st) {
    const sp = st.sp, night = !!sp.night, t = st.t;
    sky(night ? '#1d2a4a' : '#8fd0ee', night ? '#4a5a8a' : '#e8f4fa'); if (night) for (let i = 0; i < 60; i++) { const r = rng(i + 3); g.fillStyle = '#ffe9a8'; g.fillRect(r() * 3000 - 600, r() * 500 - 200, 3, 3); }
    if (!night) { cloud(300 + (t * 6) % 120, 140, 1.1); cloud(1300, 100, 1.4); cloud(1750, 220, 0.9); }
    stack(1500, 640, 440, 54); R(1380, 540, 220, 100, '#cfd6dc', 0, 5); R(1620, 560, 160, 80, '#c0c7cd', 0, 5);
    const bl = [[-300, 360, 320], [30, 300, 260], [350, 340, 300], [1000, 380, 280], [1700, 320, 300], [2050, 300, 280], [2330, 340, 320]];
    ground(700, night ? '#3a5a3a' : '#7bbf5a', 700);
    if (sp.wheel !== false) ferris(sp.wheelX || 1120, 480, 150);
    bl.forEach(([x, w, h], i) => building(x, 700, w, h, night ? '#7a82a0' : (i % 2 ? '#e8ddc2' : '#d7cdb8'), { cols: Math.round(w / 52), rows: Math.round(h / 54), win: night ? '#4a5270' : '#8fa3b8', lit: night ? 0.45 : 0, seed: i + 2, roof: '#9a9aa8' }));
    for (const x of [-100, 760, 1400, 1900]) tree(x, 760, 1.1, night ? '#3d6a3a' : '#5aa84a');
    g.fillStyle = night ? '#4a4a58' : '#8a8a96'; g.fillRect(-1200, 800, 4400, 400); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-1200, 800); g.lineTo(3200, 800); g.stroke(); for (let i = -3; i < 25; i++) { g.fillStyle = '#f6e25a'; g.fillRect(i * 200 + ((t * 0) % 200), 940, 100, 12); }
    if (sp.helis) { for (let i = 0; i < 2; i++) { const x = ((t * 140 + i * 900) % 3000) - 500, y = 150 + i * 90; g.save(); g.translate(x, y); R(-70, -20, 130, 46, '#6a7a52', 20, 5); R(60, -8, 90, 14, '#6a7a52', 6, 4); line([[-100, -30], [90, -30]], 6); line([[-40 + Math.sin(t * 30) * 60, -34], [-40 - Math.sin(t * 30) * 60, -34]], 5); R(-50, -12, 40, 22, '#bfe6f6', 5, 4); g.restore(); } }
    if (sp.night && sp.glow) { const gr = g.createRadialGradient(1500, 560, 20, 1500, 560, 420); gr.addColorStop(0, 'rgba(255,130,30,.55)'); gr.addColorStop(1, 'rgba(255,130,30,0)'); g.fillStyle = gr; g.fillRect(900, 0, 1200, 900); }
    if (sp.title) { g.save(); g.font = '900 64px Nunito'; g.textAlign = 'center'; g.lineWidth = 12; g.strokeStyle = INK; g.fillStyle = '#fff'; g.strokeText(sp.title, 960, 220); g.fillText(sp.title, 960, 220); g.restore(); }
  },
};

// ---------- двор ----------
SCENES.yard = {
  bg(st) {
    const t = st.t, night = !!st.sp.night; sky(night ? '#1d2a4a' : '#9ad8f0', night ? '#4a5a8a' : '#e8f4fa'); if (!night) cloud(1400, 160, 1.3);
    building(-200, 740, 620, 520, '#e8ddc2', { cols: 12, rows: 9, lit: 0.1, seed: 4, roof: '#9a9aa8' }); building(1000, 740, 700, 520, '#d7cdb8', { cols: 13, rows: 9, lit: 0.1, seed: 8, roof: '#9a9aa8' });
    ground(740, '#7bbf5a', 700); for (const x of [520, 780, 1850]) tree(x, 760, 1.4);
    R(120, 790, 160, 14, '#a05a2c', 4); line([[140, 804], [140, 840]], 8); line([[260, 804], [260, 840]], 8);
    P([[1350, 790], [1520, 790], [1500, 700], [1370, 700]], '#e0443a', 5);
    R(700, 780, 90, 14, '#a05a2c', 4); line([[720, 794], [720, 830]], 8); line([[770, 794], [770, 830]], 8);
    if (st.sp.helis !== false) for (let i = 0; i < 2; i++) { const x = ((t * 120 + i * 1000) % 3000) - 500, y = 110 + i * 70; g.save(); g.translate(x, y); R(-70, -20, 130, 46, '#6a7a52', 20, 5); R(60, -8, 90, 14, '#6a7a52', 6, 4); line([[-100, -30], [90, -30]], 6); R(-50, -12, 40, 22, '#bfe6f6', 5, 4); g.restore(); }
    g.fillStyle = '#d9c48a'; g.fillRect(-1200, 880, 4400, 400); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-1200, 880); g.lineTo(3200, 880); g.stroke();
  },
};

// ---------- кухня (радио, телефон) ----------
SCENES.kitchen = {
  bg(st) {
    const sp = st.sp; stripes('#bfe6d8', '#a8d8c8', 0, 640); g.fillStyle = '#f2f2e8'; g.fillRect(-1200, 520, 4400, 120); for (let i = -10; i < 40; i++) { g.strokeStyle = 'rgba(42,34,48,.35)'; g.lineWidth = 3; g.strokeRect(i * 60, 520, 60, 60); g.strokeRect(i * 60, 580, 60, 60); }
    g.fillStyle = '#e7a85c'; g.fillRect(-1200, 640, 4400, 600); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-1200, 640); g.lineTo(3200, 640); g.stroke();
    windowView(720, 120, 400, 300, { night: false, closed: true }); for (const sd of [0, 1]) { const x = sd ? 1126 : 630; P([[x, 100], [x + 90, 100], [x + 80, 440], [x + 6, 440]], '#f58a3c', 6); }
    R(300, 600, 220, 100, '#d9d9e0', 8); R(320, 560, 180, 40, '#cfcfd6', 6); for (const x of [350, 410, 470]) C(x, 580, 14, '#3a3a44', 4);
    P([[380, 556], [440, 556], [430, 500], [390, 500]], '#c8c8d0', 5); line([[440, 520], [470, 530]], 6);
    R(1300, 640, 460, 40, '#7a4a22', 8); for (const x of [1320, 1720]) R(x, 680, 26, 150, '#5c3618', 4);
    if (sp.radio) { R(1400, 580, 120, 66, '#8a5a32', 8); C(1440, 614, 20, '#e8d8b0', 4); line([[1470, 600], [1500, 600]], 4); line([[1470, 620], [1500, 620]], 4); for (let i = 0; i < 3; i++) { g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 6; g.beginPath(); g.arc(1460, 614, 70 + ((st.t * 50 + i * 36) % 110), -0.7, 0.7); g.stroke(); } }
    const ph = st.sp.phone ? Math.sin(st.t * 40) * 4 : 0; g.save(); g.translate(1296 + ph, 340); R(-30, -40, 60, 80, '#f5a623', 10, 6); C(0, 10, 18, '#fff', 4); line([[-30, -40], [-60, -10]], 8); g.restore();
    if (sp.phone) { g.save(); g.font = '900 56px Nunito'; g.textAlign = 'center'; g.lineWidth = 12; g.strokeStyle = INK; g.fillStyle = '#fff'; const k = Math.floor(st.t * 4) % 2; g.strokeText('дзынь!', 1296, 250 - k * 8); g.fillText('дзынь!', 1296, 250 - k * 8); g.restore(); }
  },
};

// ---------- станция ----------
SCENES.plant = {
  bg(st) {
    const sp = st.sp, night = sp.day ? false : true, t = st.t;
    sky(night ? '#0f1630' : '#b8c0cc', night ? '#3a3a6a' : '#e0e0e0'); if (night) for (let i = 0; i < 80; i++) { const r = rng(i + 3); g.fillStyle = '#ffe9a8'; g.fillRect(r() * 3000 - 600, r() * 520 - 200, 3, 3); }
    const gl = g.createRadialGradient(900, 520, 10, 900, 520, 800); gl.addColorStop(0, sp.fire === false ? 'rgba(255,130,30,0)' : 'rgba(255,120,30,.5)'); gl.addColorStop(1, 'rgba(255,120,30,0)'); g.fillStyle = gl; g.fillRect(-600, -200, 3000, 1300);
    ground(780, night ? '#2e4a3a' : '#7a8a6a', 700);
    stack(1380, 780, 560, 70); R(560, 520, 440, 260, night ? '#8a8aa0' : '#cfd6dc', 0, 6); windows(560, 520, 440, 260, 8, 4, night ? '#4a5a7a' : '#8fa3b8', night ? 0.2 : 0, 6); R(1000, 590, 260, 190, night ? '#7a7a92' : '#c0c7cd', 0, 6);
    P([[560, 520], [1000, 520], [980, 470], [700, 450]], '#6a6a80', 5);
    R(330, 440, 240, 340, night ? '#6a6a80' : '#b0b8c0', 0, 6);
    if (sp.fire !== false) { P([[640, 520], [660, 440], [720, 400], [760, 450], [800, 380], [860, 470], [900, 520]], '#3a3a48', 5); flame(700, 520, 2.2, t); flame(820, 520, 1.8, t + 1); flame(900, 520, 1.4, t + 2); smoke(780, 420, t, 6, night ? '#6a6a80' : '#8a8a96'); }
    g.fillStyle = night ? '#3a3a48' : '#8a8a96'; g.fillRect(-1200, 880, 4400, 300); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-1200, 880); g.lineTo(3200, 880); g.stroke();
    if (sp.trucks) { const k = sp.trucks; for (let i = 0; i < k; i++) { const x = ((t * 190 + i * 480) % 3100) - 800; truck(x, 950, 0.9); const b = Math.floor(t * 6) % 2; C(x - 70, 790, 12, b ? '#ff3a3a' : '#3a8aff', 4); } }
    if (sp.siren) { const a = (Math.floor(t * 6) % 2) ? 0.18 : 0; g.fillStyle = `rgba(255,60,60,${a})`; g.fillRect(-1200, -400, 4400, 1800); }
  },
};

// ---------- улица, эвакуация ----------
SCENES.street = {
  bg(st) {
    const sp = st.sp, t = st.t; sky('#9ad8f0', '#e8f4fa'); cloud(700, 140, 1.3); cloud(1600, 220, 1);
    building(-300, 700, 560, 420, '#e8ddc2', { cols: 10, rows: 8, seed: 3, roof: '#9a9aa8' }); building(1700, 700, 640, 420, '#d7cdb8', { cols: 12, rows: 8, seed: 5, roof: '#9a9aa8' });
    ground(700, '#7bbf5a', 700); for (const x of [420, 1560]) tree(x, 730, 1.2);
    g.fillStyle = '#7a7a86'; g.fillRect(-1200, 760, 4400, 420); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-1200, 760); g.lineTo(3200, 760); g.stroke(); for (let i = -3; i < 25; i++) { g.fillStyle = '#f6e25a'; g.fillRect(i * 200, 960, 100, 12); }
    const n = sp.buses ?? 3; for (let i = 0; i < n; i++) { const mv = sp.moving ? ((t * 120) % 520) : 0; bus(300 + i * 520 + mv - (sp.moving ? 520 : 0), 900, 1.1 - (i % 2) * 0.12); }
    if (sp.crowd) { for (let i = 0; i < sp.crowd; i++) { const r = rng(i + 11); person_silhouette(100 + r() * 1700, 1000 + r() * 40, 0.9, ['#5b5b6a', '#7a5b6a', '#5b6a7a', '#6a7a5b'][i % 4]); } }
    if (sp.windows) { g.fillStyle = 'rgba(20,14,40,.0)'; }
  },
};

// ---------- автобус изнутри ----------
SCENES.busIn = {
  bg(st) {
    const t = st.t, sp = st.sp; g.fillStyle = '#e8c070'; g.fillRect(-1200, -400, 4400, 1800);
    for (const x0 of [0, 700, 1400]) { g.save(); rrect(x0 + 40, 120, 600, 340, 14); g.clip(); sky('#9ad8f0', '#e8f4fa', 100, 480); const off = (t * (sp.still ? 0 : 160)) % 400; for (let i = -1; i < 4; i++) { const x = x0 + i * 220 - off + 400; tree(x, 460, 0.8); } if (sp.wheel) { ferris(x0 + 300 - (t % 20) * 14, 300, Math.max(30, 110 - (t % 20) * 3)); } g.fillStyle = '#7bbf5a'; g.fillRect(x0, 400, 700, 100); g.restore(); rrect(x0 + 40, 120, 600, 340, 14); g.lineWidth = 10; g.strokeStyle = INK; g.stroke(); }
    g.fillStyle = '#c28a38'; g.fillRect(-1200, 470, 4400, 14); g.fillStyle = '#d9a24a'; g.fillRect(-1200, 484, 4400, 600); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-1200, 484); g.lineTo(3200, 484); g.stroke();
    g.fillStyle = '#6a4a3a'; g.fillRect(-1200, 900, 4400, 300); line([[-1200, 900], [3200, 900]], 6);
  },
  fg(st) { for (const x of [180, 880, 1580]) { R(x, 700, 380, 380, '#2f7fa8', 26, 6); R(x + 30, 660, 320, 60, '#3d93c2', 18, 5); } for (const x of [60, 760, 1460]) { R(x, 150, 14, 330, '#cfcfd6', 6, 5); } line([[-1200, 150], [3200, 150]], 8); },
};

// ---------- деревенская изба ----------
SCENES.village = {
  bg(st) {
    const sp = st.sp, t = st.t; g.fillStyle = '#b8803c'; g.fillRect(-1200, -400, 4400, 1800); for (let i = 0; i < 16; i++) { g.strokeStyle = '#8a5a26'; g.lineWidth = 5; g.beginPath(); g.moveTo(-1200, -300 + i * 80); g.lineTo(3200, -300 + i * 80); g.stroke(); }
    g.fillStyle = '#a05a2c'; g.fillRect(-1200, 760, 4400, 400); line([[-1200, 760], [3200, 760]], 6);
    R(160, 360, 260, 400, '#e8d8c0', 8); R(190, 300, 200, 70, '#9a4a3a', 6); R(180, 560, 70, 60, '#2a2230', 6); // печь
    windowView(760, 150, 380, 280, { night: !!sp.night }); for (const sd of [0, 1]) { const x = sd ? 1146 : 676; P([[x, 130], [x + 80, 130], [x + 74, 470], [x + 6, 470]], '#e8a8c0', 6); }
    R(1280, 560, 420, 36, '#7a4a22', 8); for (const x of [1300, 1660]) R(x, 596, 26, 180, '#5c3618', 4); R(1420, 470, 70, 90, '#cfcfd6', 14, 5); R(1330, 520, 50, 40, '#fff', 8, 4);
    R(940, 760, 360, 26, '#a05a2c', 8); for (const x of [960, 1250]) R(x, 786, 20, 60, '#7a4a22', 4);
    if (sp.tv) { R(1750, 500, 220, 200, '#3a3a44', 14); R(1766, 516, 188, 150, sp.tv === 'static' ? '#9a9aa8' : '#2f3f5f', 8, 4); if (sp.tv === 'static') { const r = rng(Math.floor(st.t * 12)); for (let i = 0; i < 60; i++) { g.fillStyle = r() > 0.5 ? '#fff' : '#333'; g.fillRect(1766 + r() * 180, 516 + r() * 146, 10, 6); } } R(1790, 700, 40, 40, '#2a2230', 4); }
    g.fillStyle = 'rgba(255,200,120,.12)'; g.fillRect(-1200, -400, 4400, 1800);
  },
};

// ---------- телевизор «Время» ----------
SCENES.tv = {
  bg(st) {
    g.fillStyle = '#6a5a7a'; g.fillRect(-1200, -400, 4400, 1800); for (let i = 0; i < 40; i++) { g.fillStyle = i % 2 ? '#7a6a8a' : '#6a5a7a'; g.fillRect(i * 80 - 1200, -400, 80, 1800); }
    R(380, 160, 1160, 740, '#3a2a22', 40, 8); R(440, 220, 1040, 620, '#1f2f5a', 22, 6);
    g.save(); rrect(440, 220, 1040, 620, 22); g.clip(); g.fillStyle = '#9ab8d8'; g.fillRect(440, 220, 1040, 620); g.fillStyle = '#2f4f8a'; g.fillRect(440, 640, 1040, 200);
    g.fillStyle = '#e8eef5'; g.fillRect(440, 220, 1040, 320); g.restore(); R(470, 232, 230, 70, '#e0443a', 10, 5); g.font = '900 48px Nunito'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('ВРЕМЯ', 585, 284);
    R(1560, 760, 200, 24, '#3a2a22', 6); C(1640, 300, 16, '#5a4a3a', 4); C(1640, 360, 16, '#5a4a3a', 4);
  },
  fg(st) { if (st.sp.anchor !== false) { g.save(); g.beginPath(); rrect(440, 220, 1040, 620, 22); g.clip(); drawChar({ who: 'anchor', x: 960, y: 1010, s: 1.75, emo: 'flat', t: st.t, mouth: st.sp.talk ? ((Math.floor(st.t * 7) % 3) + 1) : 0, pose: { L: 'hold', R: 'hold' }, still: true, tilt: 0, seed: 5 }); g.restore(); } if (st.sp.glitch) { const r = rng(Math.floor(st.t * 10)); for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(440, 220 + r() * 600, 1040, 8 + r() * 14); } } },
};

// ---------- школа ----------
SCENES.school = {
  bg(st) {
    stripes('#d9ecd0', '#c8e0bc', 0, 640); g.fillStyle = '#e7a85c'; g.fillRect(-1200, 640, 4400, 600); line([[-1200, 640], [3200, 640]], 6);
    R(500, 140, 900, 360, '#2f6a4a', 10, 8); R(500, 480, 900, 20, '#a05a2c', 4); g.font = '900 56px Nunito'; g.fillStyle = 'rgba(255,255,255,.85)'; g.textAlign = 'center'; g.fillText('Откуда ты?', 950, 300);
    windowView(1560, 150, 330, 280, {}); R(300, 120, 90, 90, '#fff', 8, 5); C(345, 165, 36, '#fff', 5); line([[345, 165], [345, 140]], 5); line([[345, 165], [362, 170]], 5);
    const r = rng(7); for (let i = 0; i < 6; i++) { const x = 500 + i * 230, y = 800; R(x - 90, y - 10, 180, 18, '#a05a2c', 4); R(x - 80, y + 8, 14, 70, '#7a4a22', 3, 5); R(x + 66, y + 8, 14, 70, '#7a4a22', 3, 5); }
  },
};

// ---------- Форсмарк ----------
SCENES.forsmark = {
  bg(st) {
    const t = st.t; sky('#9ad8f0', '#e8f4fa'); cloud(300, 150, 1.2); cloud(1500, 110, 1.4); ground(760, '#6fae5a', 600);
    R(300, 380, 900, 380, '#e8e8f0', 0, 6); windows(300, 380, 900, 380, 10, 5, '#8fa3b8', 0.1, 3); R(1200, 480, 400, 280, '#cfd6dc', 0, 6); stack(1700, 760, 380, 60); R(260, 340, 980, 50, '#3a5f9c', 0, 6);
    g.font = '900 56px Nunito'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('ФОРСМАРК', 750, 380);
    line([[1560, 400], [1560, 760]], 8); P([[1560, 400], [1700, 430], [1560, 470]], '#2f7fd8', 5); P([[1560, 430], [1700, 430], [1560, 460]], '#ffd24a', 4);
    g.fillStyle = '#8a8a96'; g.fillRect(-1200, 860, 4400, 400); line([[-1200, 860], [3200, 860]], 6);
    R(740, 700, 220, 60, '#cfcfd6', 6, 5); R(800, 640, 100, 60, '#e8e8f0', 8, 5);
    const al = Math.floor(t * 5) % 2; if (st.sp.alarm) { C(750, 630, 26, al ? '#ff3a3a' : '#a82a2a', 5); if (al) { g.fillStyle = 'rgba(255,60,60,.15)'; g.fillRect(-1200, -400, 4400, 1800); } }
  },
};

// ---------- карта ----------
SCENES.map = {
  bg(st) {
    const t = st.t, sp = st.sp; g.fillStyle = '#7cc2e8'; g.fillRect(-1200, -400, 4400, 1800);
    // Скандинавия
    P([[760, 40], [900, 20], [1010, 90], [1040, 210], [980, 330], [900, 470], [820, 430], [760, 330], [700, 200], [690, 110]], '#e8d89a', 6);
    P([[1040, 160], [1200, 100], [1260, 210], [1140, 300], [1050, 300]], '#d9c88a', 6); // Финляндия
    // Балтика/Центральная Европа/Украина/Россия
    P([[560, 520], [900, 480], [1080, 500], [1500, 440], [1900, 420], [1900, 760], [1500, 830], [1180, 800], [900, 760], [620, 720]], '#c8e0a0', 6);
    P([[1020, 600], [1400, 570], [1480, 640], [1360, 760], [1080, 730]], '#e8c870', 6); // Украина
    g.font = '900 54px Nunito'; g.textAlign = 'center'; g.lineJoin = 'round'; const lab = (s, x, y) => { g.lineWidth = 12; g.strokeStyle = INK; g.strokeText(s, x, y); g.fillStyle = '#fff'; g.fillText(s, x, y); };
    lab('ШВЕЦИЯ', 850, 250); lab('УКРАИНА', 1230, 700);
    if (sp.moscow) { C(1550, 330, 12, '#e0443a', 5); lab('МОСКВА', 1600, 300); }
    C(1250, 640, 14, '#ff8a1e', 5); const k = ease((t - (sp.t0 ?? 0)) / 3);
    if (sp.arrow) { for (let i = 0; i < 6; i++) { const u = i / 6; const x = lerp(1250, 880, u), y = lerp(640, 340, u) - Math.sin(u * Math.PI) * 90; if (u <= k) { g.save(); g.translate(x, y); g.rotate(-2.4); P([[-16, -10], [16, 0], [-16, 10]], '#ff4a3a', 5); g.restore(); } } }
    if (sp.ring) { for (let i = 0; i < 3; i++) { g.strokeStyle = `rgba(255,70,50,${0.8 - ((t * 0.5 + i / 3) % 1) * 0.8})`; g.lineWidth = 10; g.beginPath(); g.arc(850, 340, 20 + ((t * 0.5 + i / 3) % 1) * 160, 0, TAU); g.stroke(); } }
    if (sp.q) { g.save(); g.font = '900 120px Nunito'; lab('?', 1600, 430); g.restore(); }
  },
};

// ---------- арка и укрытие ----------
SCENES.arch = {
  bg(st) {
    const t = st.t, sp = st.sp; sky(sp.dusk ? '#4a5a8a' : '#a8d8f0', sp.dusk ? '#c8d0e0' : '#e8f4fa'); cloud(300, 150, 1.2); cloud(1400, 120, 1.3); ground(780, '#7a8a6a', 600);
    stack(300, 780, 420, 60);
    if (sp.sarc) { P([[700, 780], [740, 440], [1000, 360], [1260, 440], [1300, 780]], '#9a9aa4', 6); windows(780, 480, 450, 280, 6, 3, '#6a6a78', 0, 2); }
    if (sp.arch) { g.save(); g.beginPath(); g.moveTo(560, 800); g.bezierCurveTo(560, 220, 1440, 220, 1440, 800); g.lineTo(1340, 800); g.bezierCurveTo(1340, 340, 660, 340, 660, 800); g.closePath(); g.fillStyle = '#d8dce6'; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); for (let i = 0; i < 9; i++) { const u = i / 8; const x = lerp(612, 1388, u); line([[x, 800 - Math.sin(u * Math.PI) * 400 - 140 + 80], [x, 800 - Math.sin(u * Math.PI) * 400 - 80 + 80]], 4, '#9aa0ae'); } g.restore(); P([[700, 780], [740, 520], [1000, 460], [1260, 520], [1300, 780]], '#8a8a94', 6); }
    if (sp.drone) { const k = ease((t - (sp.t0 || 0)) / 4); const x = lerp(2000, 1180, k), y = lerp(180, 360, k) + Math.sin(t * 4) * 6; g.save(); g.translate(x, y); R(-30, -8, 60, 18, '#3a3a44', 6, 5); for (const dx of [-44, 44]) { line([[dx - 20, -16], [dx + 20, -16]], 6); line([[dx, -16], [dx * 0.6, -4]], 4); } g.restore(); if (k > 0.95) { g.save(); g.font = '900 80px Nunito'; g.textAlign = 'center'; g.lineWidth = 14; g.strokeStyle = INK; g.fillStyle = '#ffd24a'; g.strokeText('ПАХ!', 1180, 300); g.fillText('ПАХ!', 1180, 300); g.restore(); } }
    if (sp.year) { g.save(); g.font = '900 120px Nunito'; g.textAlign = 'center'; g.lineWidth = 20; g.strokeStyle = INK; g.fillStyle = '#fff'; g.strokeText(sp.year, 960, 210); g.fillText(sp.year, 960, 210); g.restore(); }
  },
};

// ---------- мёртвый город ----------
SCENES.zone = {
  bg(st) {
    const t = st.t; sky('#9aa8b0', '#d8dcd8'); cloud(500, 160, 1.3); cloud(1500, 120, 1.1); ground(780, '#5a7a4a', 600);
    const bl = [[-300, 380, 320], [120, 320, 260], [500, 340, 300], [1100, 360, 300], [1500, 320, 260], [1850, 400, 320]];
    bl.forEach(([x, w, h], i) => { building(x, 780, w, h, '#b8b0a0', { cols: Math.round(w / 52), rows: Math.round(h / 54), win: '#4a4a52', seed: i + 8, roof: '#7a7a82' }); });
    for (const x of [300, 920, 1330, 1700]) tree(x, 800, 1.6 + (x % 3) * 0.2, '#4a8a3a');
    ferris(960, 470, 150); g.fillStyle = 'rgba(140,100,60,.35)'; g.fillRect(800, 300, 320, 340);
    for (let i = 0; i < 12; i++) { const r = rng(i + 2); const x = r() * 2400 - 200; P([[x, 880], [x + 10, 800 - r() * 60], [x + 24, 880]], '#4a8a3a', 4); }
    g.fillStyle = '#7a7a76'; g.fillRect(-1200, 880, 4400, 300); line([[-1200, 880], [3200, 880]], 6); g.strokeStyle = '#4a4a46'; g.lineWidth = 5; for (let i = 0; i < 8; i++) { const r = rng(i + 22); g.beginPath(); g.moveTo(r() * 2000 - 200, 890); g.lineTo(r() * 2000, 980); g.stroke(); }
  },
};

// ---------- инфографика: молоко и йод ----------
SCENES.milk = {
  bg(st) {
    const t = st.t; g.fillStyle = '#d9ecff'; g.fillRect(-1200, -400, 4400, 1800); for (let i = -2; i < 14; i++) { g.fillStyle = i % 2 ? '#c9e2ff' : '#d9ecff'; g.fillRect(i * 160, -400, 160, 1800); }
    g.save(); g.translate(960, 560); g.scale(1.05, 1.05); g.translate(-960, -560); const step = Math.floor((t - 0) / 3.4) % 4, on = (i) => ((t % 14) > i * 3.4 - 0.3) || st.sp.all;
    const item = (i, x, draw) => { const k = ease(((t % 14) - i * 3.4 + 0.3) / 0.35); const s = st.sp.all ? 1 : k; if (s <= 0) return; g.save(); g.translate(x, 520); g.scale(s, s); draw(); g.restore(); };
    item(0, 330, () => { R(-170, 130, 340, 90, '#7bbf5a', 20, 6); for (let i = 0; i < 6; i++) P([[-140 + i * 56, 130], [-132 + i * 56, 60], [-116 + i * 56, 130]], '#4a8a3a', 4); for (let i = 0; i < 4; i++) { g.save(); g.translate(-100 + i * 70, -60 + ((t * 60 + i * 40) % 100)); P([[0, -16], [12, 0], [-12, 0]], '#ff8a1e', 4); g.restore(); } g.font = '900 46px Nunito'; g.textAlign = 'center'; g.lineWidth = 8; g.strokeStyle = INK; g.fillStyle = '#fff'; g.strokeText('трава', 0, 270); g.fillText('трава', 0, 270); });
    item(1, 780, () => { E(0, 90, 120, 70, '#fff', 6); E(-20, 140, 14, 14, '#2a2230'); E(30, 100, 26, 20, '#2a2230'); R(-110, 60, 60, 80, '#fff', 10, 5); C(-130, 40, 40, '#fff', 6); P([[-150, 8], [-170, -20], [-140, 0]], '#ffd2e0', 4); C(-140, 36, 5, INK); R(-100, 140, 20, 60, '#fff', 6, 5); R(60, 140, 20, 60, '#fff', 6, 5); g.font = '900 46px Nunito'; g.textAlign = 'center'; g.lineWidth = 8; g.strokeStyle = INK; g.fillStyle = '#fff'; g.strokeText('корова', 0, 270); g.fillText('корова', 0, 270); });
    item(2, 1230, () => { R(-50, -10, 100, 190, '#fff', 20, 6); R(-26, -50, 52, 52, '#cfd6e0', 6, 5); R(-40, 60, 80, 50, '#8fd8ff', 8, 4); g.font = '900 46px Nunito'; g.textAlign = 'center'; g.lineWidth = 8; g.strokeStyle = INK; g.fillStyle = '#fff'; g.strokeText('молоко', 0, 270); g.fillText('молоко', 0, 270); });
    item(3, 1650, () => { drawChar({ who: 'boy', x: 0, y: 210, s: 0.7, emo: 'flat', t, pose: { L: 'belly', R: 'belly' }, still: true, tilt: 0 }); g.font = '900 46px Nunito'; g.textAlign = 'center'; g.lineWidth = 8; g.strokeStyle = INK; g.fillStyle = '#fff'; g.strokeText('ребёнок', 0, 270); g.fillText('ребёнок', 0, 270); });
    for (const x of [555, 1005, 1440]) { const i = x < 600 ? 1 : x < 1100 ? 2 : 3; const k = ((t % 14) - i * 3.4 + 0.3); if (st.sp.all || k > 0) { P([[x - 50, 520], [x + 10, 520], [x + 10, 490], [x + 60, 540], [x + 10, 590], [x + 10, 560], [x - 50, 560]], '#ff6a3a', 5); } }
    g.restore();
  },
};

// ---------- карточки со статистикой ----------
SCENES.info = {
  bg(st) {
    const sp = st.sp, t = st.pt, items = sp.items || [], n = items.length;
    if (sp.bgPhoto && PHOTOS[sp.bgPhoto]) { drawPhoto(sp.bgPhoto, sp.tone || 'color', 0.5); g.fillStyle = 'rgba(10,10,25,.35)'; g.fillRect(-200, -200, 2400, 1500); } else { g.fillStyle = sp.bg || '#ffd98a'; g.fillRect(-1200, -400, 4400, 1800); for (let i = -2; i < 14; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,0)'; g.fillRect(i * 160 + ((st.t * 20) % 320), -400, 160, 1800); } }
    if (sp.title) { g.save(); g.font = '900 70px Nunito'; g.textAlign = 'center'; g.lineWidth = 14; g.strokeStyle = INK; g.fillStyle = '#fff'; g.strokeText(sp.title, 960, 130); g.fillText(sp.title, 960, 130); g.restore(); }
    const cw = Math.min(440, (1240 - (n - 1) * 34) / n), tw0 = n * cw + (n - 1) * 34, x0 = 960 - tw0 / 2, sc0 = n === 1 ? 1.6 : n === 2 ? 1.5 : 1.3, scl = Math.min(sc0, 1500 / tw0, sp.title ? 1.1 : 9), cy = sp.title ? 590 : 520;
    const atOf = (it, i) => i === 0 ? Math.min(it.at ?? 0, 0.15) : (it.at ?? i * 1.8); const vis = items.reduce((a, it, i) => a + clamp(ease(atOf(it, i) <= t ? (t - atOf(it, i)) / 0.5 : 0)), 0), shift = (n - Math.min(n, Math.max(vis, 1))) / 2 * (cw + 34);
    g.save(); g.translate(960, cy); g.scale(scl, scl); g.translate(-960, -cy); g.translate(shift, 0);
    items.forEach((it, i) => { const at = i === 0 ? Math.min(it.at ?? 0, 0.15) : (it.at ?? i * 1.8), k = ease((t - at) / 0.35); if (k <= 0) return; g.save(); g.translate(x0 + i * (cw + 34) + cw / 2, cy); g.scale(k, k); g.rotate((i % 2 ? 1 : -1) * 0.03);
      R(-cw / 2, -220, cw, 440, it.color || '#fffdf0', 34, 8); g.textAlign = 'center'; g.lineJoin = 'round';
      if (it.icon) { const up = it.icon === 'up'; P(up ? [[0, -170], [90, -50], [30, -50], [30, 30], [-30, 30], [-30, -50], [-90, -50]] : [[0, 30], [90, -90], [30, -90], [30, -170], [-30, -170], [-30, -90], [-90, -90]], up ? '#4aa84a' : '#e0443a', 9); }
      else { let fs = it.big.length > 6 ? 96 : 140; g.font = `900 ${fs}px Nunito`; while (g.measureText(it.big).width > cw - 56 && fs > 26) { fs -= 4; g.font = `900 ${fs}px Nunito`; } g.lineWidth = fs * 0.12; g.strokeStyle = INK; g.fillStyle = it.bigColor || '#e0443a'; const by = it.label ? -50 : 20; g.strokeText(it.big, 0, by); g.fillText(it.big, 0, by); }
      if (it.label) { let fl = 40; const words = it.label.split(' '); const mk = (f) => { g.font = `900 ${f}px Nunito`; const ls = []; let cur = ''; for (const w of words) { const tst = (cur + ' ' + w).trim(); if (g.measureText(tst).width > cw - 64 && cur) { ls.push(cur); cur = w; } else cur = tst; } ls.push(cur); return ls; }; let ls = mk(fl); const bad = (l2) => l2.length > 5 || 50 + (l2.length - 1) * (fl + 12) > 180 || l2.some((l) => g.measureText(l).width > cw - 48); while (bad(ls) && fl > 20) { fl -= 2; ls = mk(fl); } g.fillStyle = INK; ls.forEach((l, j2) => g.fillText(l, 0, 50 + j2 * (fl + 12))); }
      g.restore(); });
    g.restore();
  },
};

// ---------- пауза: собери сумку ----------
SCENES.bag = {
  bg(st) {
    const t = st.pt - st.dur, k = Math.max(0, t); g.fillStyle = '#2a2a4a'; g.fillRect(-1200, -400, 4400, 1800); for (let i = 0; i < 60; i++) { const r = rng(i + 3); g.fillStyle = 'rgba(255,233,168,.6)'; g.fillRect(r() * 3000 - 600, r() * 1000 - 200, 3, 3); }
    g.save(); g.translate(960, 600); R(-210, -170, 420, 360, '#c8603a', 50, 9); R(-170, -240, 340, 100, '#a8452a', 40, 9); R(-150, 20, 300, 110, '#a8452a', 24, 7); line([[-60, -170], [-60, -240]], 7); line([[60, -170], [60, -240]], 7);
    for (let i = 0; i < 3; i++) { const at = 0.8 + i * 1.5, kk = ease((k - at) / 0.35); const cx = (i - 1) * 130, cy = -50; C(cx, cy, 52, '#fffdf0', 8); g.font = '900 80px Nunito'; g.textAlign = 'center'; g.fillStyle = '#e0443a'; g.lineWidth = 12; g.strokeStyle = INK; g.save(); g.translate(cx, cy + 28); g.scale(1 + 0.2 * Math.sin(Math.min(1, kk) * Math.PI), 1 + 0.2 * Math.sin(Math.min(1, kk) * Math.PI)); g.strokeText('?', 0, 0); g.fillText('?', 0, 0); g.restore(); }
    g.restore();
    g.font = '900 72px Nunito'; g.textAlign = 'center'; g.lineWidth = 14; g.strokeStyle = INK; g.fillStyle = '#fff'; g.strokeText('Три вещи', 960, 240); g.fillText('Три вещи', 960, 240);
  },
};

// ---------- небо и самолёт ----------
SCENES.sky = {
  bg(st) {
    const t = st.t; sky('#7cc2e8', '#e8f4fa'); cloud(400 - (t * 20) % 3000, 240, 1.6); cloud(1400 - (t * 14) % 3000, 360, 1.3); cloud(900, 140, 1.1);
    const x = ((t * 160) % 3000) - 500; g.save(); g.translate(x, 400 - ((t * 18) % 80)); R(-120, -22, 240, 44, '#f2f2f8', 22, 6); P([[-20, 0], [-80, -110], [-40, -110], [30, 0]], '#cfd6e0', 5); P([[-20, 0], [-80, 110], [-40, 110], [30, 0]], '#cfd6e0', 5); P([[-110, -10], [-140, -50], [-120, -50], [-90, -10]], '#cfd6e0', 4); R(70, -14, 40, 20, '#bfe6f6', 6, 4); R(-70, -4, 8, 10, '#bfe6f6', 2, 3); R(-40, -4, 8, 10, '#bfe6f6', 2, 3); R(-10, -4, 8, 10, '#bfe6f6', 2, 3); g.restore();
  },
};

// ---------- эмблемы глав ----------
const emTxt = (s, y = 40, sz = 150) => { g.font = `900 ${sz}px Nunito`; g.textAlign = 'center'; g.lineWidth = 24; g.strokeStyle = INK; g.fillStyle = '#fff'; g.strokeText(s, 0, y); g.fillText(s, 0, y); };
EMBLEMS.default = () => { star(0, 0, 130, '#ffe28a'); };
EMBLEMS['ГОРОД ДЛЯ МОЛОДЫХ'] = () => { g.save(); g.translate(0, 30); ferris(0, 0, 170); g.restore(); };
EMBLEMS['ОДИН ЧАС ДВАДЦАТЬ ТРИ МИНУТЫ'] = () => { C(0, 0, 190, '#fffdf0', 12); for (let i = 0; i < 12; i++) { const a = i * TAU / 12; line([[Math.cos(a) * 160, Math.sin(a) * 160], [Math.cos(a) * 178, Math.sin(a) * 178]], 8); } line([[0, 0], [Math.cos(-Math.PI / 2 + 23 / 60 * TAU) * 150, Math.sin(-Math.PI / 2 + 23 / 60 * TAU) * 150]], 10); line([[0, 0], [Math.cos(-Math.PI / 2 + (1 + 23 / 60) / 12 * TAU) * 100, Math.sin(-Math.PI / 2 + (1 + 23 / 60) / 12 * TAU) * 100]], 16); C(0, 0, 14, INK, 4); };
EMBLEMS['ПЯТЬ МИНУТ'] = () => { truck(0, 130, 1.5); };
EMBLEMS['СУББОТА'] = () => { R(-170, -160, 340, 320, '#fffdf0', 24, 10); R(-170, -160, 340, 90, '#e0443a', 24, 10); g.font = '900 150px Nunito'; g.textAlign = 'center'; g.fillStyle = INK; g.fillText('26', 0, 100); };
EMBLEMS['ТРИ ДНЯ'] = () => { R(-150, -130, 300, 260, '#c8603a', 40, 10); R(-110, -190, 220, 80, '#a8452a', 30, 10); g.font = '900 150px Nunito'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.lineWidth = 16; g.strokeStyle = INK; g.strokeText('3', 0, 50); g.fillText('3', 0, 50); };
EMBLEMS['ПОНЕДЕЛЬНИК'] = () => { R(-190, -130, 380, 260, '#3a2a22', 30, 10); R(-160, -100, 320, 200, '#9ab8d8', 18, 8); line([[-90, -140], [-150, -200]], 10); line([[90, -140], [150, -200]], 10); };
EMBLEMS['ЧТО ОСТАЛОСЬ'] = () => { g.save(); g.translate(0, 120); g.beginPath(); g.moveTo(-220, 0); g.bezierCurveTo(-220, -300, 220, -300, 220, 0); g.lineTo(150, 0); g.bezierCurveTo(150, -200, -150, -200, -150, 0); g.closePath(); fillO('#d8dce6', 10); g.restore(); };
EMBLEMS['ЧТО МЫ ЗНАЕМ'] = () => { C(-30, -30, 130, '#bfe6f6', 12); line([[60, 60], [170, 170]], 30); line([[60, 60], [170, 170]], 20, '#7a4a22'); };
EMBLEMS['ПОЧЕМУ ЭТО СЛУЧИЛОСЬ'] = () => { emTxt('?', 90, 380); };

SCENES.facade = {
  bg(st) {
    const t = st.pt; sky('#9ad8f0', '#e8f4fa'); g.fillStyle = '#e8ddc2'; g.fillRect(-1200, -400, 4400, 1800); line([[-1200, 900], [3200, 900]], 6);
    const cols = 7, rows = 4, ww = 200, wh = 190, x0 = 960 - (cols * (ww + 40)) / 2 + 20;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x = x0 + c * (ww + 40), y = 90 + r * (wh + 50), at = 1.0 + (r * cols + c) * 0.45, k = ease((t - at) / 0.35); R(x, y, ww, wh, '#3a4a68', 6, 6); R(x + 10, y + 10, ww / 2 - 14, wh - 20, lerp(0, 1, k) > 0.5 ? '#7a8aa0' : '#ffe28a', 4, 4); R(x + ww / 2 + 4, y + 10, ww / 2 - 14, wh - 20, k > 0.5 ? '#7a8aa0' : '#ffe28a', 4, 4); if (k > 0.5) { line([[x + 10, y + wh / 2], [x + ww - 10, y + wh / 2]], 5); } R(x - 12, y + wh - 8, ww + 24, 16, '#c8b898', 4, 5); }
  },
};
