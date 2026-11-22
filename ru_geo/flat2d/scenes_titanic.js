import { W, H, g, INK, TAU, clamp, lerp, ease, SCENES, EMBLEMS, drawChar, poly, rrect, ell, circ, fillO, R, P, E, C, line, rng, windows, building, tree, cloud, star, person_silhouette, LW } from './engine.js';
import './scenes_chernobyl.js';   // общие сцены: info, sky

const sky = (top, bot, y0 = -400, y1 = 1500) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(-1400, y0, 4800, y1 - y0); };
const stars = (n = 90, seed = 3, y1 = 560) => { for (let i = 0; i < n; i++) { const r = rng(i + seed); g.fillStyle = '#ffe9a8'; g.fillRect(r() * 4000 - 1000, r() * (y1 + 300) - 300, 3, 3); } };
const sea = (y, a, b, t = 0, amp = 1) => { g.fillStyle = a; g.fillRect(-1400, y, 4800, 1200); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-1400, y); g.lineTo(3400, y); g.stroke(); g.strokeStyle = b; g.lineWidth = 6; for (let r = 0; r < 6; r++) for (let i = -2; i < 24; i++) { const x = i * 190 + ((t * 24 + r * 70) % 190), yy = y + 40 + r * 56; g.beginPath(); g.arc(x, yy, 46, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); } };
const text = (s, x, y, size = 64, fill = '#fff') => { g.save(); g.font = `900 ${size}px Nunito`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = size * 0.22; g.strokeStyle = INK; g.fillStyle = fill; g.strokeText(s, x, y); g.fillText(s, x, y); g.restore(); };

// ---------- пароход сбоку ----------
export function ship(x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  P([[-640, 0], [640, 0], [700, -150], [-660, -150], [-620, -60]], '#2a2a3a', 7); R(-640, -26, 1280, 18, '#d8362d', 0, 5);
  R(-560, -230, 1120, 84, '#f4f1ea', 4, 7); R(-470, -300, 900, 74, '#f4f1ea', 4, 7); R(-350, -362, 600, 64, '#f4f1ea', 4, 7);
  const r = rng(5); for (let i = 0; i < 40; i++) { g.fillStyle = o.lit === false ? '#8fa3b8' : '#ffe28a'; g.fillRect(-540 + i * 27, -210, 14, 18); } for (let i = 0; i < 30; i++) { g.fillStyle = o.lit === false ? '#8fa3b8' : (r() < 0.8 ? '#ffe28a' : '#8fa3b8'); g.fillRect(-440 + i * 29, -282, 14, 18); }
  for (let i = 0; i < 44; i++) { C(-600 + i * 28, -100, 5, '#ffe28a', 2); }
  for (const fx of [-250, -80, 90, 260]) { R(fx - 34, -520, 68, 170, '#e8a21c', 6, 7); R(fx - 34, -526, 68, 26, '#1a1a22', 4, 6); }
  line([[-560, -230], [-560, -440]], 8); line([[500, -230], [500, -420]], 8);
  g.restore();
}
const seaDay = (st) => { sky('#8fd0ee', '#e8f4fa'); cloud(300 + (st.t * 6) % 100, 160, 1.3); cloud(1400, 120, 1.5); cloud(1800, 240, 1); sea(620, '#3d8fd0', '#8fd0ee', st.t); };

// ---------- тендер у борта ----------
SCENES.tender = {
  bg(st) {
    const t = st.t; sky('#8fd0ee', '#e8f4fa'); cloud(360, 140, 1.2); sea(640, '#3d8fd0', '#8fd0ee', t);
    P([[-1400, 640], [-1400, 420], [-700, 470], [-300, 560], [0, 640]], '#6fae5a', 7); // берег Ирландии
    g.save(); g.translate(0, Math.sin(t * 1.6) * 6); P([[900, -200], [2800, -200], [2800, 640], [840, 640]], '#2a2a3a', 8); R(900, 600, 1900, 30, '#d8362d', 0, 6);
    for (let r = 0; r < 4; r++) for (let i = 0; i < 18; i++) C(1000 + i * 90, 220 + r * 100, 15, '#ffe28a', 4); R(840, -260, 1960, 60, '#f4f1ea', 0, 7); g.restore();
    g.save(); g.translate(0, Math.sin(t * 2.2) * 8); P([[260, 760], [880, 760], [840, 860], [300, 860]], '#8a4a2a', 7); R(280, 740, 580, 26, '#d9b36a', 6, 6); R(520, 640, 200, 100, '#f4f1ea', 8, 6); R(560, 660, 40, 40, '#bfe6f6', 4, 4); R(620, 660, 40, 40, '#bfe6f6', 4, 4); line([[300, 740], [300, 660]], 6); line([[860, 740], [860, 660]], 6); line([[300, 664], [860, 664]], 5); R(450, 560, 24, 90, '#cfcfd6', 4, 5); g.restore();
  },
};

// ---------- каюта третьего класса ----------
SCENES.cabin = {
  bg(st) {
    const sp = st.sp, t = st.t, night = !!sp.night; g.fillStyle = night ? '#7a5a34' : '#c08a4a'; g.fillRect(-1400, -400, 4800, 1800); for (let i = 0; i < 18; i++) { g.strokeStyle = night ? '#5a3e22' : '#9a6a30'; g.lineWidth = 5; g.beginPath(); g.moveTo(-1400, -300 + i * 80); g.lineTo(3400, -300 + i * 80); g.stroke(); }
    g.fillStyle = night ? '#5a4028' : '#8a5a2c'; g.fillRect(-1400, 770, 4800, 400); line([[-1400, 770], [3400, 770]], 7);
    // койки
    R(200, 700, 760, 70, '#6a4a2a', 6); R(220, 650, 720, 50, '#e8e8f0', 12, 6); R(220, 600, 180, 50, '#fffdf0', 14, 6); R(200, 440, 760, 40, '#6a4a2a', 6); R(220, 400, 720, 44, '#d8d8e8', 12, 6); for (const x of [210, 940]) R(x, 440, 18, 340, '#5a3a1e', 4, 5);
    R(280, 830, 150, 70, '#8a5a32', 6, 6); // чемодан под койкой
    if (sp.case !== false) { R(284, 836, 142, 60, '#8a5a32', 8, 6); R(330, 826, 50, 14, '#5a3a1e', 4, 5); }
    C(1280, 300, 90, '#2a3a5c', 9); C(1280, 300, 66, night ? '#1d2a4a' : '#9dd8f0', 6);
    if (night) for (let i = 0; i < 6; i++) { const r = rng(i + 4); g.fillStyle = '#ffe9a8'; g.fillRect(1230 + r() * 100, 260 + r() * 80, 3, 3); }
    const on = sp.bulb === undefined ? 1 : (typeof sp.bulb === 'function' ? sp.bulb(st.pt) : sp.bulb); line([[1100, 130], [1100, 210]], 6); C(1100, 232, 22, on ? '#ffe28a' : '#8a8a96', 6); if (on) { const gr = g.createRadialGradient(1100, 232, 10, 1100, 232, 360); gr.addColorStop(0, 'rgba(255,230,140,.45)'); gr.addColorStop(1, 'rgba(255,230,140,0)'); g.fillStyle = gr; g.fillRect(700, -100, 800, 700); }
    R(1520, 330, 230, 450, '#7a4a22', 6, 7); R(1545, 360, 180, 160, '#9a6a30', 4, 5); R(1545, 540, 180, 200, '#9a6a30', 4, 5); C(1700, 560, 10, '#ffd24a', 4);
    const wat = typeof sp.water === 'function' ? sp.water(st.pt) : (sp.water || 0); if (wat > 0) { g.save(); g.fillStyle = 'rgba(70,140,220,.85)'; g.beginPath(); const w = 80 + wat * 900; g.moveTo(1750 - w, 790); for (let x = 1750 - w; x <= 1750; x += 20) g.lineTo(x, 786 + Math.sin(x * 0.05 + t * 3) * 3 - wat * 14); g.lineTo(1750, 800); g.lineTo(1750 - w, 800); g.closePath(); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.restore(); }
    if (sp.scrape) { const k = Math.floor(t * 6) % 2; text('скр-р-р…', 1050 + k * 8, 560, 80, '#fff'); }
    if (sp.knock) { const k = Math.floor(t * 5) % 2; text('тук-тук', 1650, 250 - k * 6, 64); }
  },
  fg(st) { if (st.sp.night) { g.fillStyle = 'rgba(14,16,50,.32)'; g.fillRect(-1400, -400, 4800, 1800); } },
};

// ---------- столовая ----------
SCENES.dining = {
  bg(st) {
    g.fillStyle = '#d9a24a'; g.fillRect(-1400, -400, 4800, 1800); for (let i = 0; i < 40; i++) { g.fillStyle = i % 2 ? '#d9a24a' : '#cf9840'; g.fillRect(i * 100 - 1400, -400, 100, 1050); }
    g.fillStyle = '#8a5a32'; g.fillRect(-1400, 650, 4800, 600); line([[-1400, 650], [3400, 650]], 7);
    for (const x of [300, 960, 1620]) { C(x, 260, 80, '#2a3a5c', 9); C(x, 260, 58, '#9dd8f0', 6); }
    R(180, 700, 1560, 40, '#f2e8d0', 8, 7); for (const x of [260, 600, 940, 1280, 1620]) { R(x, 740, 24, 140, '#7a4a22', 4, 5); }
    for (let i = 0; i < 6; i++) { E(280 + i * 270, 690, 56, 18, '#fffdf0', 5); E(280 + i * 270, 682, 40, 10, '#e8c870', 3); } R(180, 880, 1560, 20, '#a05a2c', 6, 5); R(180, 930, 1560, 20, '#a05a2c', 6, 5);
  },
};

// ---------- ванные ----------
SCENES.baths = {
  bg(st) {
    const t = st.t; g.fillStyle = '#bfe6e0'; g.fillRect(-1400, -400, 4800, 1800); for (let i = -10; i < 60; i++) { line([[i * 90, -400], [i * 90, 760]], 3, 'rgba(42,34,48,.25)'); } for (let j = 0; j < 12; j++) line([[-1400, j * 90 - 200], [3400, j * 90 - 200]], 3, 'rgba(42,34,48,.25)');
    g.fillStyle = '#e7a85c'; g.fillRect(-1400, 760, 4800, 500); line([[-1400, 760], [3400, 760]], 7);
    for (const [x, lab] of [[1450, 'М'], [1760, 'Ж']]) { R(x - 140, 560, 280, 200, '#fff', 60, 8); R(x - 120, 540, 240, 40, '#cfd6e0', 12, 7); text(lab, x, 440, 110); C(x - 60, 520, 14, '#cfd6e0', 4); }
    R(1480, 90, 40, 300, '#cfd6e0', 8, 6);
    const n = st.sp.crowd ?? 10; for (let i = 0; i < n; i++) { const r = rng(i + 20); person_silhouette(180 + i * 115, 880 + (i % 2) * 10, 1.0, ['#5b5b6a', '#7a5b6a', '#5b6a7a', '#6a7a5b'][i % 4]); }
    text('две ванны', 700, 190, 90); text('на семьсот человек', 700, 300, 76);
  },
};

// ---------- общая комната ----------
SCENES.generalRoom = {
  bg(st) {
    const night = !!st.sp.night, t = st.t; g.fillStyle = night ? '#9a6a3a' : '#c08a4a'; g.fillRect(-1400, -400, 4800, 1800); for (let i = 0; i < 40; i++) { g.fillStyle = i % 2 ? (night ? '#9a6a3a' : '#c08a4a') : (night ? '#8f6234' : '#b8803c'); g.fillRect(i * 100 - 1400, -400, 100, 1160); }
    g.fillStyle = '#7a4a22'; g.fillRect(-1400, 760, 4800, 500); line([[-1400, 760], [3400, 760]], 7);
    for (const x of [420, 1300]) { C(x, 250, 70, '#2a3a5c', 9); C(x, 250, 50, night ? '#1d2a4a' : '#9dd8f0', 6); }
    R(1380, 560, 440, 210, '#3a2a22', 14, 8); R(1360, 520, 480, 60, '#2a1a14', 10, 8); R(1400, 580, 400, 20, '#fffdf0', 4, 5); for (let i = 0; i < 12; i++) R(1405 + i * 33, 580, 18, 70, '#fffdf0', 2, 3); R(1420, 770, 30, 120, '#3a2a22', 6, 6); R(1760, 770, 30, 120, '#3a2a22', 6, 6); R(1500, 800, 200, 30, '#7a4a22', 6, 6);
    R(300, 690, 280, 24, '#7a4a22', 6, 6); R(340, 714, 20, 120, '#5c3618', 4, 5); R(520, 714, 20, 120, '#5c3618', 4, 5);
    for (const x of [760, 1000]) { line([[x, -50], [x, 180]], 6); P([[x - 50, 180], [x + 50, 180], [x + 30, 120], [x - 30, 120]], '#ffe28a', 6); }
    if (night) { g.fillStyle = 'rgba(255,200,120,.1)'; g.fillRect(-1400, -400, 4800, 1800); }
    if (st.sp.notes) for (let i = 0; i < 4; i++) { const k = (t * 0.6 + i * 0.25) % 1; g.save(); g.globalAlpha = 1 - k; text('♪', 1500 + i * 60, 460 - k * 160, 60, '#ffd24a'); g.restore(); }
  },
};

// ---------- прогулочная палуба днём ----------
SCENES.promenade = {
  bg(st) {
    const t = st.t; seaDay(st); g.fillStyle = '#d9b36a'; g.fillRect(-1400, 780, 4800, 500); line([[-1400, 780], [3400, 780]], 7); for (let i = 0; i < 16; i++) line([[-1400, 840 + i * 40], [3400, 840 + i * 40]], 3, 'rgba(42,34,48,.3)');
    line([[-1400, 560], [3400, 560]], 10); line([[-1400, 640], [3400, 640]], 7); for (let i = -4; i < 40; i++) line([[i * 140, 560], [i * 140, 780]], 7);
    R(1600, 330, 40, 260, '#cfcfd6', 6, 6); P([[1640, 340], [1780, 370], [1640, 410]], '#e0443a', 5);
    if (st.sp.people !== false) for (let i = 0; i < 5; i++) person_silhouette(250 + i * 170, 780, 0.9, ['#5b5b6a', '#7a5b6a', '#5b6a7a', '#6a7a5b'][i % 4]);
  },
};

// ---------- ночное море, корабль, айсберг ----------
SCENES.seaNight = {
  bg(st) {
    const sp = st.sp, t = st.t, pt = st.pt; sky('#0f1630', '#3a3a6a'); stars(); sea(640, '#16264a', '#3a4a7a', t);
    if (sp.moon !== false) { C(1600, 160, 70, '#fffdf0', 6); }
    const sink = sp.sink ? clamp((pt - (sp.sink0 ?? 0)) / (sp.sinkLen ?? 8)) : 0;
    const sx = sp.shipX ?? 760, sy = 640 + (sp.shipY ?? 0);
    if (sp.californian) { g.save(); g.translate(1500, 640); g.scale(0.5, 0.5); P([[-300, 0], [300, 0], [340, -80], [-320, -80]], '#3a3a4a', 6); R(-220, -150, 440, 70, '#e8e8f0', 4, 6); R(-40, -260, 60, 110, '#e8a21c', 4, 6); for (let i = 0; i < 12; i++) { g.fillStyle = '#ffe28a'; g.fillRect(-200 + i * 36, -130, 14, 16); } g.restore(); }
    if (sp.far) { g.save(); g.translate(1900, 640); g.scale(0.35, 0.35); g.globalAlpha = 0.9; for (let i = 0; i < 8; i++) { C(-300 + i * 80, -40, 8, '#ffe28a', 3); } g.restore(); }
    if (sp.ship !== false) { g.save(); const ang = sink * 0.6; g.translate(sx, sy + sink * 380); g.rotate(ang * -0.18); ship(0, 0, 0.9, { lit: sink < 0.9 }); g.restore(); g.fillStyle = '#16264a'; g.fillRect(-1400, 640 + 0, 4800, 1200); g.fillStyle = 'rgba(22,38,74,0)'; sea(640, 'rgba(0,0,0,0)', '#3a4a7a', t); if (sink > 0.5) { sea(640, 'rgba(22,38,74,0.9)', '#3a4a7a', t); } }
    if (sp.iceberg) { const k = clamp(pt / (sp.hitAt ?? 3.2)); const ix = lerp(2300, 1500, ease(k)); g.save(); g.translate(ix, 640); P([[-260, 0], [-200, -180], [-120, -120], [-40, -300], [60, -170], [140, -230], [240, -60], [300, 0]], '#e8f4fa', 7); P([[-200, -180], [-120, -120], [-60, 0], [-260, 0]], '#bfd8ea', 5); g.restore(); if (pt > (sp.hitAt ?? 3.2)) { const q = pt - (sp.hitAt ?? 3.2); if (q < 0.6) { g.fillStyle = `rgba(255,255,255,${0.8 * (1 - q / 0.6)})`; g.fillRect(-1400, -400, 4800, 1800); } } }
    if (sp.rockets) { for (let i = 0; i < 5; i++) { const at = i * 1.5, k = (pt - at); if (k > 0 && k < 2.2) { const x = 700 + i * 110, y = 480 - k * 160; if (k < 1.2) { line([[x, 620], [x, y]], 4, '#ffd24a'); } else { const r = (k - 1.2) * 150; for (let j = 0; j < 10; j++) { const a = j * TAU / 10; C(x + Math.cos(a) * r, 480 - 1.2 * 160 + Math.sin(a) * r, 8, '#fffdf0', 3); } } } } }
    if (sp.boats) { for (let i = 0; i < sp.boats; i++) { const x = 300 + i * 360 + Math.sin(t + i) * 10, y = 700 + (i % 2) * 90; g.save(); g.translate(x, y + Math.sin(t * 1.5 + i) * 5); P([[-90, 0], [90, 0], [70, 32], [-70, 32]], '#e8e8f0', 5); for (let k = 0; k < 4; k++) { C(-50 + k * 33, -22, 14, '#2a2a3a', 3); R(-62 + k * 33, -10, 26, 12, '#2a2a3a', 2, 3); } g.restore(); } }
    if (sp.cap) { const k = clamp(pt / 6); g.save(); g.translate(1000 + k * 40, 760 + Math.sin(t * 2) * 6); E(0, 0, 36, 12, '#6a5a46', 5); R(-10, -18, 44, 14, '#4a3e30', 4, 4); g.restore(); }
    if (sp.hud) sp.hud();
  },
};

// ---------- радиорубка ----------
SCENES.radioRoom = {
  bg(st) {
    const sp = st.sp, t = st.t; g.fillStyle = sp.night ? '#5a5a7a' : '#c8b48a'; g.fillRect(-1400, -400, 4800, 1800); for (let i = 0; i < 40; i++) { g.fillStyle = i % 2 ? (sp.night ? '#5a5a7a' : '#c8b48a') : (sp.night ? '#525272' : '#bea87e'); g.fillRect(i * 100 - 1400, -400, 100, 1160); }
    g.fillStyle = '#6a4a2a'; g.fillRect(-1400, 800, 4800, 400); line([[-1400, 800], [3400, 800]], 7);
    R(700, 640, 760, 40, '#7a4a22', 8, 7); R(720, 680, 30, 130, '#5c3618', 4, 5); R(1410, 680, 30, 130, '#5c3618', 4, 5);
    R(820, 530, 220, 110, '#3a3a44', 10, 7); C(870, 585, 26, '#cfcfd6', 5); C(960, 585, 26, '#cfcfd6', 5); line([[1000, 600], [1040, 560]], 5); R(1100, 560, 120, 80, '#8a8a96', 8, 6); line([[1160, 560], [1160, 440], [1300, 440]], 6); const on = sp.on !== false; if (on) { for (let i = 0; i < 3; i++) { g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 5; g.beginPath(); g.arc(1300, 440, 30 + ((t * 40 + i * 24) % 70), -0.9, 0.9); g.stroke(); } }
    line([[1000, 100], [1000, 200]], 6); C(1000, 222, 22, sp.night ? '#ffe28a' : '#ffe28a', 6);
    C(300, 300, 90, '#2a3a5c', 9); C(300, 300, 66, sp.night ? '#1d2a4a' : '#9dd8f0', 6);
    R(120, 700, 420, 60, '#6a4a2a', 6, 7); R(140, 660, 380, 44, '#d8d8e8', 12, 6);
    if (sp.papers) { for (let i = 0; i < 7; i++) { const k = ease((st.pt - i * 1.0 - 0.2) / 0.5); if (k <= 0) continue; g.save(); g.translate(560 + i * 90, 470 + (1 - k) * -120); g.rotate((i % 2 ? 1 : -1) * 0.12); R(-34, -42, 68, 84, '#fffdf0', 4, 5); for (let j = 0; j < 3; j++) line([[-22, -22 + j * 16], [22, -22 + j * 16]], 3); g.restore(); } }
  },
};

// ---------- отсеки ----------
SCENES.compartments = {
  bg(st) {
    const t = st.pt; sky('#0f1630', '#2a3a6a'); stars(); sea(700, '#16264a', '#3a4a7a', st.t);
    P([[100, 500], [1820, 500], [1760, 720], [140, 720]], '#2a2a3a', 8); const n = 16, w = 1620 / n;
    for (let i = 0; i < n; i++) { const x = 140 + i * w; const flood = i < 5 ? ease((t - 5.5 - i * 0.4) / 0.6) : i === 5 ? ease((t - 9) / 0.8) * 0.5 : 0; R(x, 520, w - 6, 180, '#f4f1ea', 4, 5); if (flood > 0) { g.fillStyle = '#4a8ae0'; g.fillRect(x + 3, 700 - 176 * flood, w - 12, 176 * flood); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(x, 520, w - 6, 180); } }
    for (let i = 0; i < 6; i++) { const k = ease((t - 0.6 - i * 0.5) / 0.4); if (k > 0) { g.save(); g.translate(140 + i * 48, 660); g.scale(k, k); R(-22, -10, 44, 8, '#ff4a3a', 3, 4); g.restore(); } }
    text('шесть щелей, всего около 1 м²', 960, 260, 76);
    if (t > 5) text('выдержал бы 4 отсека из 16', 960, 380, 64, '#ffd24a');
    if (t > 8.5) text('затопило 5 и частично 6-й', 960, 460, 64, '#ff8a6a');
  },
};

// ---------- коридор (вид сбоку, движется) ----------
SCENES.corridor = {
  bg(st) {
    const sp = st.sp, t = st.t, speed = sp.speed ?? 120, off = (st.pt * speed) % 400, night = !!sp.night;
    g.fillStyle = night ? '#7a6a52' : '#c8a870'; g.fillRect(-1400, -400, 4800, 1800); g.fillStyle = night ? '#5a4a36' : '#a88850'; g.fillRect(-1400, 640, 4800, 120); line([[-1400, 640], [3400, 640]], 6);
    g.fillStyle = '#6a4a2a'; g.fillRect(-1400, 760, 4800, 500); line([[-1400, 760], [3400, 760]], 7); g.fillStyle = '#d8362d'; g.fillRect(-1400, 770, 4800, 26);
    for (let i = -2; i < 10; i++) { const x = i * 400 - off; R(x + 40, 330, 150, 410, '#8a5a32', 6, 7); R(x + 62, 354, 106, 160, '#a8743c', 4, 5); C(x + 164, 560, 8, '#ffd24a', 4); text(String(300 + ((i + 20) % 60)), x + 115, 300, 40); line([[x + 330, 180], [x + 330, 230]], 5); C(x + 330, 248, 20, night ? '#ffe28a' : '#fff0b0', 5); }
    if (night) { g.fillStyle = 'rgba(30,20,50,.18)'; g.fillRect(-1400, -400, 4800, 1800); }
    if (sp.lines) { for (let i = 0; i < 2; i++) { const k = Math.floor(t * 4) % 2; text('тук-тук', 1500 + i * 150, 420 - k * 6, 56); } }
  },
};

// ---------- лестница ----------
SCENES.stairs = {
  bg(st) {
    const t = st.pt; g.fillStyle = '#c8a870'; g.fillRect(-1400, -400, 4800, 1800); g.fillStyle = '#a88850'; g.fillRect(-1400, 700, 4800, 600); line([[-1400, 700], [3400, 700]], 7);
    for (let i = 0; i < 10; i++) { const x = 300 + i * 120, y = 900 - i * 70; R(x, y, 150, 70 * (i + 1), '#8a5a32', 4, 6); R(x, y, 150, 16, '#d9a24a', 4, 5); }
    line([[280, 800], [1480, -40]], 12); line([[280, 830], [1480, 0]], 5);
    for (let i = 0; i < 4; i++) { line([[1700, 220 + i * 40], [1700, 680]], 5); } g.fillStyle = 'rgba(30,20,50,.2)'; g.fillRect(-1400, -400, 4800, 1800);
  },
};

// ---------- ворота между палубами ----------
SCENES.gate = {
  bg(st) {
    const sp = st.sp; g.fillStyle = '#c8a870'; g.fillRect(-1400, -400, 4800, 1800); g.fillStyle = '#6a4a2a'; g.fillRect(-1400, 760, 4800, 500); line([[-1400, 760], [3400, 760]], 7);
    g.fillStyle = 'rgba(30,20,50,.18)'; g.fillRect(-1400, -400, 4800, 1800);
    R(1000, 220, 40, 540, '#5a5a66', 4, 7); R(1380, 220, 40, 540, '#5a5a66', 4, 7); R(1000, 200, 420, 40, '#5a5a66', 6, 7);
    const open = sp.open || 0; for (let i = 0; i < 7; i++) { const x = 1040 + i * 50; line([[x, 250], [x - open * 20, 740]], 9, '#8a8a96'); line([[x, 250], [x - open * 20, 740]], 4, '#cfcfd6'); }
    R(1090, 250, 250, 90, '#fffdf0', 8, 6); g.font = '900 28px Nunito'; g.textAlign = 'center'; g.fillStyle = INK; g.fillText('ТОЛЬКО ДЛЯ ПАССАЖИРОВ', 1215, 288); g.fillText('2 КЛАССА', 1215, 322);
    for (let i = 0; i < 6; i++) { R(1500 + i * 70, 280 + i * 70, 220, 24, '#8a5a32', 4, 5); }
  },
};

// ---------- шлюпочная палуба ----------
SCENES.boatDeck = {
  bg(st) {
    const sp = st.sp, t = st.t, pt = st.pt, day = !!sp.day; sky(day ? '#8fd0ee' : '#0f1630', day ? '#e8f4fa' : '#3a3a6a'); if (!day) stars(120, 7); sea(560, day ? '#3d8fd0' : '#16264a', day ? '#8fd0ee' : '#3a4a7a', t);
    if (sp.rockets) { for (let i = 0; i < 5; i++) { const at = i * 1.4, k = pt - at; if (k > 0 && k < 2.4) { const x = 500 + i * 260; if (k < 1.2) line([[x, 540], [x, 540 - k * 330]], 5, '#ffd24a'); else { const r = (k - 1.2) * 140; for (let j = 0; j < 12; j++) { const a = j * TAU / 12; C(x + Math.cos(a) * r, 540 - 1.2 * 330 + Math.sin(a) * r, 9, '#fffdf0', 3); } } } } }
    g.fillStyle = '#d9b36a'; g.fillRect(-1400, 780, 4800, 500); line([[-1400, 780], [3400, 780]], 7); for (let i = 0; i < 16; i++) line([[-1400, 840 + i * 40], [3400, 840 + i * 40]], 3, 'rgba(42,34,48,.3)');
    line([[-1400, 600], [3400, 600]], 10); for (let i = -4; i < 40; i++) line([[i * 140, 600], [i * 140, 780]], 7);
    for (let i = 0; i < 4; i++) { const bx = 300 + i * 480, lowered = sp.lowering && i === (sp.boatIdx ?? 1) ? ease((pt - (sp.lowerAt ?? 3)) / 4) * 420 : 0; if (sp.boatsGone && i < sp.boatsGone) continue; g.save(); g.translate(bx, 440 + lowered); P([[-130, 0], [130, 0], [100, 56], [-100, 56]], '#f4f1ea', 7); line([[-130, 0], [-130, -120]], 8); line([[130, 0], [130, -120]], 8); R(-132, -124, 264, 12, '#8a5a32', 4, 5); if (sp.people && i === (sp.boatIdx ?? 1)) { for (let k = 0; k < sp.people; k++) person_silhouette(-70 + k * 35, 30, 0.45, '#5b5b6a'); } g.restore(); }
    for (let i = 0; i < 4; i++) { if (sp.boatsGone && i < sp.boatsGone) continue; const bx = 300 + i * 480; for (const d of [-1, 1]) { const x = bx + d * 160; line([[x, 780], [x, 290]], 12); line([[x, 290], [x - d * 40, 262]], 10); line([[x - d * 40, 262], [bx + d * 130, 316]], 5); } }
    if (sp.ice) { const r = rng(9); for (let i = 0; i < 8; i++) { const x = 200 + r() * 1500, y = 840 + r() * 120; P([[x - 30, y], [x - 10, y - 30], [x + 20, y - 18], [x + 34, y]], '#e8f4fa', 4); } }
    if (sp.sliding) { for (let i = 0; i < 6; i++) { const k = ((pt * 0.5 + i * 0.17) % 1); R(1700 - k * 1500 + i * 30, 800 + i * 30 + k * 60, 60, 40, ['#8a5a32', '#6a8a5a', '#8a6a9a'][i % 3], 6, 5); } }
  },
};

// ---------- «Карпатия» на рассвете ----------
SCENES.carpathia = {
  bg(st) {
    const sp = st.sp, t = st.t, pt = st.pt; sky('#f4a88a', '#ffe8c8'); C(300, 520, 80, '#fff2c8', 6); sea(620, '#4a7fb8', '#9ac8e8', t);
    for (const [x, s] of [[1500, 1.2], [160, 0.8], [1850, 0.6]]) { g.save(); g.translate(x, 640); g.scale(s, s); P([[-200, 0], [-150, -150], [-60, -90], [-10, -250], [90, -120], [160, -190], [240, 0]], '#f4faff', 7); P([[-150, -150], [-60, -90], [-30, 0], [-200, 0]], '#cfe2f0', 5); g.restore(); }
    const k = clamp(pt / (sp.dur ?? 12)); const sx = lerp(-300, 760, ease(k)); g.save(); g.translate(sx, 640); g.scale(0.7, 0.7); P([[-420, 0], [420, 0], [470, -110], [-440, -110]], '#2a2a3a', 7); R(-340, -200, 740, 92, '#f4f1ea', 4, 7); R(-120, -330, 100, 130, '#e8a21c', 4, 7); R(-120, -338, 100, 22, '#1a1a22', 4, 6); for (let i = 0; i < 20; i++) { g.fillStyle = '#9dd8f0'; g.fillRect(-320 + i * 36, -180, 16, 20); } g.restore();
    if (sp.boats) { for (let i = 0; i < sp.boats; i++) { const x = 1100 + i * 230 - k * 80, y = 760 + (i % 2) * 70; g.save(); g.translate(x, y + Math.sin(t * 1.4 + i) * 5); P([[-80, 0], [80, 0], [62, 28], [-62, 28]], '#e8e8f0', 5); for (let q = 0; q < 3; q++) C(-40 + q * 40, -16, 13, '#2a2a3a', 3); g.restore(); } }
  },
};

// ---------- Нью-Йорк, газетный киоск ----------
SCENES.newsstand = {
  bg(st) {
    sky('#8fd0ee', '#e8f4fa'); cloud(400, 160, 1.3); cloud(1400, 120, 1.1);
    const bl = [[-200, 300, 520], [140, 260, 420], [440, 300, 600], [900, 280, 480], [1240, 300, 560], [1580, 280, 440], [1860, 300, 540]]; bl.forEach(([x, w, h], i) => building(x, 780, w, h, i % 2 ? '#c8b8a0' : '#b8a890', { cols: Math.round(w / 48), rows: Math.round(h / 52), seed: i + 3, roof: '#7a7a82' }));
    g.fillStyle = '#8a8a96'; g.fillRect(-1400, 780, 4800, 500); line([[-1400, 780], [3400, 780]], 7);
    R(780, 560, 420, 220, '#c8603a', 8, 8); P([[760, 560], [1220, 560], [1180, 480], [800, 480]], '#e0443a', 8); R(800, 600, 380, 100, '#fffdf0', 6, 6); for (let i = 0; i < 4; i++) R(814 + i * 92, 612, 80, 76, '#e8e0c8', 3, 4); g.font = '900 40px Nunito'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText('ГАЗЕТЫ', 990, 530);
  },
};

// ---------- эмблемы глав ----------
const emTxt = (s, y = 40, sz = 150) => { g.font = `900 ${sz}px Nunito`; g.textAlign = 'center'; g.lineWidth = 24; g.strokeStyle = INK; g.fillStyle = '#fff'; g.strokeText(s, 0, y); g.fillText(s, 0, y); };
EMBLEMS['ОДИННАДЦАТОГО АПРЕЛЯ'] = () => { g.save(); g.translate(0, 80); ship(0, 0, 0.42); g.restore(); };
EMBLEMS['ТРИ ДНЯ НА БОРТУ'] = () => { C(0, 0, 120, '#ffd24a', 10); for (let i = 0; i < 12; i++) { const a = i * TAU / 12; line([[Math.cos(a) * 150, Math.sin(a) * 150], [Math.cos(a) * 200, Math.sin(a) * 200]], 14); } };
EMBLEMS['ЧЕТЫРНАДЦАТОГО АПРЕЛЯ'] = () => { C(0, 0, 130, '#fffdf0', 10); C(50, -20, 110, '#ffd98a', 0); g.save(); g.globalCompositeOperation = 'destination-out'; g.restore(); star(150, -110, 40); star(-180, 80, 30); };
EMBLEMS['ДВАДЦАТЬ МИНУТ ДО ПОЛУНОЧИ'] = () => { C(0, 0, 190, '#fffdf0', 12); for (let i = 0; i < 12; i++) { const a = i * TAU / 12; line([[Math.cos(a) * 160, Math.sin(a) * 160], [Math.cos(a) * 178, Math.sin(a) * 178]], 8); } line([[0, 0], [Math.cos(-Math.PI / 2 + 40 / 60 * TAU) * 150, Math.sin(-Math.PI / 2 + 40 / 60 * TAU) * 150]], 10); line([[0, 0], [Math.cos(-Math.PI / 2 + (11 + 40 / 60) / 12 * TAU) * 100, Math.sin(-Math.PI / 2 + (11 + 40 / 60) / 12 * TAU) * 100]], 16); C(0, 0, 14, INK, 4); };
EMBLEMS['ПУТЬ НАВЕРХ'] = () => { for (let i = 0; i < 5; i++) R(-180 + i * 70, 120 - i * 60, 130, 60 * (i + 1), '#8a5a32', 4, 8); P([[120, -190], [200, -110], [150, -110], [150, -40], [90, -40], [90, -110], [40, -110]], '#e0443a', 8); };
EMBLEMS['ШЛЮПКИ'] = () => { P([[-200, 20], [200, 20], [150, 100], [-150, 100]], '#f4f1ea', 9); line([[-200, 20], [-200, -90]], 10); line([[200, 20], [200, -90]], 10); for (let k = 0; k < 4; k++) C(-90 + k * 60, -10, 30, '#2a2a3a', 5); };
EMBLEMS['ОГНИ НА ГОРИЗОНТЕ'] = () => { for (let i = 0; i < 5; i++) { C(-200 + i * 100, 60 - (i % 2) * 40, 22, '#ffe28a', 8); } line([[-260, 120], [260, 120]], 10); };
EMBLEMS['ТВОИ ШАНСЫ'] = () => { for (let i = 0; i < 4; i++) R(-200 + i * 100, 140 - [220, 160, 110, 60][i], 80, [220, 160, 110, 60][i], ['#4aa84a', '#8ac84a', '#e8c040', '#e0443a'][i], 6, 8); };
EMBLEMS['ПОСЛЕ'] = () => { R(-160, -120, 320, 240, '#2f6fc2', 14, 10); R(-130, -92, 260, 184, '#f6efe0', 8, 7); for (let i = 0; i < 4; i++) line([[-100, -50 + i * 36], [100, -50 + i * 36]], 6); };
