// "Он выложил вашу ссору в сторис" — rubric «Ответ на вопрос из комментариев» (live scene + 4 answers), hard_cut camera: node stories.js start end out.mp4 | --png=f1,f2
// Their living room: the heroine (arms crossed, steaming) on the left; her boyfriend Will on the right holding up his phone with HER sulky face in his story ("Women...").
// Behind him: a half-built flat-pack wardrobe. hook: "Relax, it's funny! Eighty views already!" + comment plate + phone insert (story, 80 views).
// 1 · ХОЛОДНО: "Delete. Now." -> "Can't. Ninety views. I'm famous." -> insert: the view counter spins like a taxi meter.
// 2 · С ЮМОРОМ: man-flu -> "That was real flu! I nearly died!" (clutches his forehead, staggers) -> insert: the story is still up.
// 3 · КАК НОСИТЕЛЬ: "Take it down, please." -> "...Okay. Taking it down." -> insert: DELETE STORY, poof -> Bella tip.
// 4 · КОРОЛЕВСКИЙ ОТВЕТ: "...building the wardrobe — all four hours of it." -> "...Deleted. Archive too." -> the wardrobe behind him crashes down.
// Twist: his phone pings: MUM replied to the story "She's right. Apologise." -> "My mum says..." -> he hugs her -> moral. End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/stories/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// o4: the chunk "I'll film you building the wardrobe —" starts here (word timings of the line)
const WARD_T = (() => { const s = SP.o4_h, w = (s.words || []).find(q => /^film/i.test(q[0])); return w ? s.t + w[1] - 0.25 : s.t + s.d * 0.45; })();

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'sweater', col: '#EE7FA8' }, bottom: { type: 'jeans', col: '#4A5A80' }, shoes: { col: '#FFFFFF', acc: '#EE5E9A' } };
const BF = { ...BASE.tom, hair: { style: 'quiff', col: '#3A2A1E' }, brow: '#2A1A10', top: { type: 'hoodie', col: '#F2B33D' }, bottom: { type: 'jeans', col: '#33415E' }, shoes: { col: '#2B2F3A', acc: '#FFFFFF' } };
const G = { her: geom(HER), bf: geom(BF) };
const X = { her: -340, bf: 400 }, WX = 960, SOFAX = -1500;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function star(c, x, y, r, a = 1, col = '#FFF6C8') { c.save(); c.globalAlpha *= a; c.translate(x, y); c.fillStyle = col; c.beginPath(); for (let i = 0; i < 8; i++) { const rr_ = i % 2 ? r * 0.28 : r, an = i * Math.PI / 4; c.lineTo(Math.cos(an) * rr_, Math.sin(an) * rr_); } c.closePath(); c.fill(); c.restore(); }
function puff(c, x, y, r, a = 1, col = '#FFFFFF') { c.save(); c.globalAlpha *= a; c.fillStyle = col; for (const [dx, dy, k] of [[0, 0, 1], [-0.7, 0.25, 0.7], [0.7, 0.2, 0.75], [-0.3, -0.5, 0.65], [0.35, -0.45, 0.6]]) { c.beginPath(); c.arc(x + dx * r, y + dy * r, r * k, 0, TAU); c.fill(); } c.restore(); }
// eye icon (views) drawn with paths
function eyeIcon(c, x, y, s, col = '#FFFFFF') { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 5; c.beginPath(); c.moveTo(-30, 0); c.quadraticCurveTo(0, -30, 30, 0); c.quadraticCurveTo(0, 30, -30, 0); c.closePath(); c.stroke(); c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.fill(); c.restore(); }
function heart(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(0, 12); c.bezierCurveTo(-30, -8, -16, -30, 0, -14); c.bezierCurveTo(16, -30, 30, -8, 0, 12); c.fill(); c.restore(); }
function checkMark(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = col; c.lineWidth = 14; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-34, 0); c.lineTo(-10, 26); c.lineTo(36, -26); c.stroke(); c.restore(); }

// ---------------- view counter (his story) over time
function views(t) {
  const L = sceneAt(t).id;
  if (L === 'hook') return 80 + Math.floor(clamp((t - hev('story')) / 3.0) * 4);
  if (L === 'o1') { const a = ev('o1', 'meter'), b = a + 1.75; if (t < a) return 90; return Math.round(lerp(90, 347, eIO(clamp((t - a) / (b - a))))); }
  if (L === 'o2') return 512 + Math.floor(clamp((t - ev('o2', 'still')) / 2) * 9);
  if (L === 'o3') return 640;
  return 347;
}

// ---------------- the story on his screen; (0,0) = top-left of the screen, w x h. mode: 'story' | 'meter' | 'del' | 'mum' | 'tiny'
function herFace(c, t, x, y, s, mood = 'annoyed') { const g = G.her; K.put(c, HER, { t, talk: 0, mood, turn: 0.1, look: 0.2, blink: 0, armL: reach(g, -1, g.sw * 0.55, g.ySh + 250, { planar: true }), armR: reach(g, 1, -g.sw * 0.55, g.ySh + 230, { planar: true }), items: {} }, x, y - g.headY * s, s); }
function storyScreen(c, w, h, t, mode, o = {}) {
  // backdrop of the story (warm gradient) + her sulky face + caption
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#F7A8C8'); g.addColorStop(1, '#B98AE0'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  const gone = o.gone || 0;
  if (gone < 1) { c.save(); c.globalAlpha *= 1 - gone; c.translate(w / 2, h * 0.5); c.scale(1 - gone * 0.6, 1 - gone * 0.6); c.translate(-w / 2, -h * 0.5);
    herFace(c, t, w / 2, h * 0.36, 0.95 * w / 416);
    // caption pill «Women...»
    c.save(); c.translate(w / 2, h * 0.68); c.rotate(-0.05); c.fillStyle = '#1E2030'; rr(c, -150 * w / 416, -42 * w / 416, 300 * w / 416, 84 * w / 416, 20 * w / 416); c.fill(); fitTxt(c, 'Women...', 0, 3, 54 * w / 416, '#FFFFFF', 270 * w / 416, 'Unb9'); c.restore();
    c.restore(); }
  // top: progress bars + avatar + name
  const k = w / 416;
  c.fillStyle = 'rgba(255,255,255,.45)'; for (let i = 0; i < 3; i++) rr(c, (14 + i * 132) * k, 14 * k, 124 * k, 7 * k, 4 * k), c.fill();
  c.fillStyle = '#FFFFFF'; rr(c, 14 * k, 14 * k, 124 * k, 7 * k, 4 * k); c.fill(); rr(c, 146 * k, 14 * k, 124 * k * (mode === 'still' ? 0.62 : clamp(((t * 0.13) % 1) * 0.9 + 0.05)), 7 * k, 4 * k); c.fill();
  c.fillStyle = '#F2B33D'; c.beginPath(); c.arc(40 * k, 54 * k, 20 * k, 0, TAU); c.fill(); c.fillStyle = '#3A2A1E'; c.beginPath(); c.arc(40 * k, 47 * k, 10 * k, 0, TAU); c.fill();
  fitTxt(c, 'will.k', 70 * k, 54 * k, 26 * k, '#FFFFFF', 120 * k, 'Nun9', 'left'); fitTxt(c, '2h', 160 * k, 54 * k, 22 * k, 'rgba(255,255,255,.8)', 50 * k, 'Nun9', 'left');
  // bottom: views counter
  if (gone < 1) { c.save(); c.globalAlpha *= 1 - gone; c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, 14 * k, h - 74 * k, 180 * k, 56 * k, 28 * k); c.fill(); eyeIcon(c, 52 * k, h - 46 * k, 0.8 * k); fitTxt(c, String(views(t)), 84 * k, h - 45 * k, 32 * k, '#FFFFFF', 100 * k, 'Unb9', 'left');
    heart(c, w - 50 * k, h - 46 * k, 1.1 * k, '#FFFFFF'); c.restore(); }
}
// phone in his hand (small, screen to the camera); (0,0) = hand
const phoneItem = (rot = 0) => (ctx, a, side) => { const t = ctx.__t || 0; ctx.save(); ctx.translate(0, -95); ctx.rotate(rot); ctx.scale(1.25, 1.25); paint(ctx, q => { q.m(-62, -120); q.l(62, -120); q.l(62, 120); q.l(-62, 120); q.z(); }, '#2B2F3A', { sd: 5, hd: 3, lw: 4 });
  ctx.save(); ctx.beginPath(); rr(ctx, -54, -110, 108, 220, 12); ctx.clip(); ctx.translate(-54, -110); storyScreen(ctx, 108, 220, PT, 'tiny', { gone: phoneGone(PT) }); ctx.restore(); ctx.restore(); };
let PT = 0;   // current frame time for the hand-held phone screen
const phoneGone = t => { const L = sceneAt(t).id; if (L === 'o3' && t > ev('o3', 'poof')) return 1; if (L === 'o4' || L === 'end') return 1; return 0; };

// ---------------- the flat-pack wardrobe (half built) behind him; (0,0) = floor centre of the wardrobe. fall: 0..1 (topples to the right), then lies flat
function wardrobe(c, t, fall = 0, wob = 0) { const w = 520, h = 1780;
  c.save(); c.fillStyle = 'rgba(0,0,0,.16)'; c.beginPath(); c.ellipse(0, 6, w * 0.6, 26, 0, 0, TAU); c.fill(); c.restore();
  c.save(); c.translate(w / 2, 0); c.rotate(fall * Math.PI / 2 + Math.sin(t * 30) * 0.012 * wob); c.translate(-w / 2, 0);
  // back panel + two sides + top; one door leaning, one shelf crooked
  paint(c, q => { q.m(-w / 2 + 20, -h + 20); q.l(w / 2 - 20, -h + 20); q.l(w / 2 - 20, -20); q.l(-w / 2 + 20, -20); q.z(); }, '#B88A55', { sd: 6, hd: 3, lw: 3 });
  for (const s of [-1, 1]) paint(c, q => { q.m(s * w / 2 - 22, -h); q.l(s * w / 2 + 22, -h); q.l(s * w / 2 + 22, 0); q.l(s * w / 2 - 22, 0); q.z(); }, '#8E5F33', { sd: 8, hd: 4, lw: 4 });
  paint(c, q => { q.m(-w / 2 - 22, -h - 34); q.l(w / 2 + 22, -h - 34); q.l(w / 2 + 22, -h); q.l(-w / 2 - 22, -h); q.z(); }, '#8E5F33', { sd: 8, hd: 4, lw: 4 });
  c.save(); c.translate(0, -h * 0.55); c.rotate(-0.09); paint(c, q => { q.m(-w / 2 + 20, -14); q.l(w / 2 - 20, -14); q.l(w / 2 - 20, 14); q.l(-w / 2 + 20, 14); q.z(); }, '#B8955E', { sd: 4, hd: 2, lw: 3 }); c.restore();
  paint(c, q => { q.m(-w / 2 + 20, -h * 0.28); q.l(w / 2 - 20, -h * 0.28); q.l(w / 2 - 20, -h * 0.28 + 26); q.l(-w / 2 + 20, -h * 0.28 + 26); q.z(); }, '#B8955E', { sd: 4, hd: 2, lw: 3 });
  // screws sticking out
  c.fillStyle = '#8A8F9C'; for (const [x, y] of [[-w / 2, -h * 0.8], [w / 2, -h * 0.6], [-w / 2, -h * 0.3], [w / 2, -h * 0.15]]) { c.beginPath(); c.arc(x, y, 9, 0, TAU); c.fill(); }
  c.restore(); }
// floor clutter: flat-pack box, instruction sheet, screwdriver
function clutter(c) {
  c.save(); c.translate(WX + 420, 0); paint(c, q => { q.m(-160, -260); q.l(160, -260); q.l(160, 0); q.l(-160, 0); q.z(); }, '#C9A06A', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#8A6A3A'; c.fillRect(-160, -150, 320, 24); fitTxt(c, 'FLAT PACK', 0, -205, 36, '#5A3A1A', 280); c.restore();
  c.save(); c.translate(WX - 120, -10); c.rotate(-0.08); c.fillStyle = '#FFFFFF'; c.fillRect(-120, -30, 240, 50); c.strokeStyle = '#9AA3B2'; c.lineWidth = 3; for (let i = 0; i < 3; i++) { c.strokeRect(-110 + i * 76, -24, 66, 38); } c.restore();
  c.save(); c.translate(WX + 160, -14); c.rotate(0.2); c.fillStyle = '#E0474C'; rr(c, -70, -14, 90, 28, 10); c.fill(); c.fillStyle = '#9AA3B2'; c.fillRect(20, -5, 100, 10); c.restore(); }

// ---------------- living room (prerendered, softly blurred)
const BX0 = -3300, BY0 = -3800, BW = 6600, BH = 5400, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#E8EEF4'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(120,150,190,.10)'; for (let x = BX0; x < BX0 + BW; x += 200) c.fillRect(x, BY0, 80, 3800);
  // window with city view
  const g = c.createLinearGradient(0, -2700, 0, -1500); g.addColorStop(0, '#8EC9F0'); g.addColorStop(1, '#D8EEF8');
  c.fillStyle = '#FFFFFF'; rr(c, -1050, -2700, 900, 1200, 18); c.fill(); c.fillStyle = g; rr(c, -1020, -2670, 840, 1140, 10); c.fill();
  c.fillStyle = '#A9C0D6'; for (const [x, w, h] of [[-1010, 140, 360], [-860, 120, 520], [-730, 160, 300], [-560, 130, 460], [-420, 180, 380], [-300, 110, 560]]) c.fillRect(x, -1530 - h, w, h);
  c.fillStyle = '#FFFFFF'; c.fillRect(-610, -2670, 18, 1140); c.fillRect(-1020, -2110, 840, 18);
  c.fillStyle = '#7FA8D0'; rr(c, -1160, -2780, 150, 1340, 30); c.fill(); rr(c, -190, -2780, 150, 1340, 30); c.fill();
  // shelf with plant + picture frame (couple photo shapes)
  c.fillStyle = '#8A6A4A'; c.fillRect(150, -2050, 520, 24); c.fillStyle = '#C98B6A'; rr(c, 220, -2300, 200, 250, 10); c.fill(); c.fillStyle = '#F7D9E6'; rr(c, 238, -2282, 164, 214, 6); c.fill(); c.fillStyle = '#EE7FA8'; c.beginPath(); c.arc(290, -2170, 34, 0, TAU); c.fill(); c.fillStyle = '#F2B33D'; c.beginPath(); c.arc(350, -2165, 36, 0, TAU); c.fill();
  c.fillStyle = '#6A9E5A'; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(560 + (i - 2) * 26, -2150 - Math.abs(i - 2) * -10, 30, 90, (i - 2) * 0.35, 0, TAU); c.fill(); } c.fillStyle = '#E8889E'; rr(c, 510, -2110, 100, 64, 10); c.fill();
  // floor lamp far left, plant far right
  c.fillStyle = '#3A3A44'; c.fillRect(-2420, -1500, 14, 1500); paint(c, q => { q.m(-2540, -1500); q.l(-2290, -1500); q.l(-2350, -1720); q.l(-2480, -1720); q.z(); }, '#F7E6B0', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#6A9E5A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(2500 + i * 30, -700 - i * 60, 60, 170, -0.6 + i * 0.22, 0, TAU); c.fill(); } c.fillStyle = '#C9733A'; rr(c, 2420, -320, 240, 320, 20); c.fill();
  // skirting + floor + rug
  c.fillStyle = '#D2DCE6'; c.fillRect(BX0, -90, BW, 90);
  c.fillStyle = '#B88A5E'; c.fillRect(BX0, 0, BW, 1600); c.fillStyle = 'rgba(0,0,0,.07)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, 0, 8, 1600);
  c.fillStyle = '#C9D8B0'; c.beginPath(); c.ellipse(0, 150, 1100, 110, 0, 0, TAU); c.fill();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);
function sofa(c) { const x0 = SOFAX - 620, x1 = SOFAX + 620;
  paint(c, q => { q.m(x0 + 40, -900); q.q(SOFAX, -940, x1 - 40, -900); q.l(x1 - 40, -420); q.l(x0 + 40, -420); q.z(); }, '#6C8EBF', { sd: 12, hd: 6, lw: 3 });
  paint(c, q => { q.m(x0, -470); q.l(x1, -470); q.l(x1, -110); q.l(x0, -110); q.z(); }, '#7FA0D0', { sd: 10, hd: 5, lw: 3 });
  for (const s of [-1, 1]) paint(c, q => { const x = s < 0 ? x0 - 70 : x1 - 50; q.m(x, -660); q.q(x + 60, -720, x + 120, -660); q.l(x + 120, -110); q.l(x, -110); q.z(); }, '#5A7AAA', { sd: 10, hd: 5, lw: 3 });
  c.fillStyle = '#4A3A2A'; c.fillRect(x0 - 40, -110, 30, 110); c.fillRect(x1 + 10, -110, 30, 110);
  c.fillStyle = '#F7E6B0'; c.save(); c.translate(SOFAX + 330, -560); c.rotate(0.12); rr(c, -110, -90, 220, 180, 30); c.fill(); c.restore(); }

// ---------------- characters (standing)
const down = (g, s) => reach(g, s, s * g.sw * 1.08, g.ySh + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const forehead = (g, s = 1) => reach(g, s, s * g.hw * 0.3, g.headY - g.hh * 0.62, { planar: true });   // palm on the brow (in front, headFirst), eyes stay visible
const crossArms = (g, st) => { st.armL = reach(g, -1, g.sw * 0.55, g.ySh + 250, { planar: true }); st.armR = reach(g, 1, -g.sw * 0.55, g.ySh + 230, { planar: true }); };
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const gest = (st, g, who, t, side, b) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + b + Math.cos(u) * 20, { planar: true }); } };
const steamK = (t, L) => L === 'hook' ? clamp((t - hev('steam')) / 0.3) * (1 - clamp((t - hev('wide')) / 0.3)) : (L === 'o1' ? clamp((t - SP.o1_h.t) / 0.3) * (1 - clamp((t - SP.o1_h.t - SP.o1_h.d - 0.2) / 0.3)) : 0);
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'annoyed', turn: 0.25, look: 0.7 };
  crossArms(g, st);
  if (L === 'hook') { st.mood = t > hev('steam') ? 'angry' : 'annoyed'; st.blink = 0; if (t > hev('wide')) { st.mood = 'annoyed'; } }
  if (L === 'o1') { st.mood = 'annoyed'; if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'angry'; st.turn = 0.3; }
    if (t > SP.o1_b.t + 0.5) { st.mood = 'skeptical'; st.look = 0.9; } if (t > ev('o1', 'meter')) { st.mood = 'tired'; st.blink = 1; } }
  if (L === 'o2') { st.mood = 'smug'; st.turn = 0.25; st.look = 0.7; if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 120); st.armR = reach(g, 1, -g.sw * 0.55, g.ySh + 230, { planar: true }); }
    if (t > SP.o2_b.t) { st.mood = 'skeptical'; } if (t > ev('o2', 'still')) { st.mood = 'tired'; st.blink = 1; } }
  if (L === 'o3') { st.mood = 'neutral'; st.turn = 0.25; st.look = 0.7; st.armL = down(g, -1); st.armR = down(g, 1);
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'neutral'; st.armL = open(g, -1, 1.5, 150 + Math.sin(t * 5) * 10); st.armR = open(g, 1, 1.5, 150 + Math.cos(t * 5) * 10); }
    if (t > SP.o3_b.t) { st.mood = 'happy'; } if (t > e('smile')) { st.mood = 'happy'; st.blink = 1; st.tilt = 0.06; st.look = 0.2; st.turn = 0.05; } }
  if (L === 'o4') { st.mood = 'happy'; st.turn = 0.2; st.look = 0.5; st.armL = down(g, -1); st.armR = down(g, 1);
    if (speaking('o4_h', t, 0.1, 0.1)) { const u = t - SP.o4_h.t; st.mood = u > 2.4 ? 'smug' : 'happy'; if (t > WARD_T && t < WARD_T + 2.0) { st.armL = reach(g, -1, g.sw * 2.4, g.ySh + 110 + Math.sin(u * 3) * 10, { planar: true }); st.turn = 0.35; st.look = 0.9; } else gest(st, g, 'her', t, -1, 120); }
    if (t > endOf('o4_h') + 0.1) { st.mood = 'smug'; st.blink = 1; crossArms(g, st); }
    if (t > e('jump')) { st.mood = 'surprised'; st.blink = 0; } }
  if (L === 'end') { st.mood = 'skeptical'; st.look = 0.8; st.turn = 0.3; crossArms(g, st);
    if (t > e('her')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.look = 0.5; }
    if (t > e('hug')) { st.armL = down(g, -1); st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 150, { planar: true }); st.tilt = 0.08; st.mood = 'happy'; st.laugh = false; st.blink = 1; } }
  return st; }
// he walks over to her for the hug at the end
function bfX(t, L) { if (L === 'end') { const a = ev('end', 'hug'); return lerp(X.bf, X.her + 330, eIO(clamp((t - a) / 0.6))); } return X.bf; }
function bfState(t, L) { const g = G.bf, e = k => ev(L, k), st = { ...base(g, t, 'bf13'), mood: 'happy', turn: -0.25, look: -0.7 };
  const phoneUp = (dy = 60) => { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + dy + Math.sin(t * 5) * 8, { planar: true }); st.items = { L: phoneItem(0.1) }; };
  const phoneChest = (jit = 0) => { st.armL = hold(g, -1, 250 + Math.sin(t * 22) * jit, 0.35); st.armR = hold(g, 1, 260 + Math.cos(t * 22) * jit, 0.25); st.items = { L: phoneItem(0) }; };
  phoneUp();
  if (L === 'hook') { st.mood = 'happy'; st.laugh = !speaking('hook_b', t, 0, 0); st.armR = open(g, 1, 1.4, 200 + Math.sin(t * 6) * 15);
    if (speaking('hook_b', t, 0, 0)) { st.laugh = SP.hook_b.t + 0.9 > t; st.blink = st.laugh ? 1 : undefined; }
    if (t > hev('wide')) { st.mood = 'happy'; st.laugh = false; } }
  if (L === 'o1') { st.mood = 'happy';
    if (speaking('o1_h', t, 0, 0.1)) { st.mood = 'surprised'; }
    if (speaking('o1_b', t, 0.05, 0)) { st.mood = 'smug'; }
    if (t > e('pose')) { st.mood = 'smug'; st.blink = 1; st.armR = reach(g, 1, g.hw * 1.6, g.headY + g.hh * 0.7, { planar: true }); st.tilt = -0.08; st.headFirst = false; } }
  if (L === 'o2') { st.mood = 'happy';
    if (speaking('o2_h', t, 0, 0.1)) { st.mood = t > SP.o2_h.t + 1.6 ? 'shock' : 'happy'; }
    if (t > e('clutch')) { st.mood = 'sad'; st.headFirst = true; st.armR = forehead(g, 1); st.blink = 1; st.lookY = -0.3; const k = eIO(clamp((t - e('stagger')) / 0.4)); st.lean = 0.22 * k * (1 + 0.15 * Math.sin(t * 9)); st.headY = 10 * k; st.tilt = 0.1 * k; }
    if (t > e('still') + 0.6) { st.mood = 'sad'; } }
  if (L === 'o3') { st.mood = 'happy';
    if (speaking('o3_h', t, 0, 0.1)) { st.mood = 'surprised'; st.armL = hold(g, -1, 300, 0.7); st.items = { L: phoneItem(0) }; }
    if (speaking('o3_b', t, 0.05, 0.1)) { st.mood = 'sad'; st.headY = 8; phoneChest(); st.look = -0.2; st.lookY = 0.5; }
    if (t > e('del')) { st.mood = 'sad'; phoneChest(); st.lookY = 0.5; st.look = -0.1; }
    if (t > SP.o3_nar.t + 0.4) { st.mood = 'happy'; st.lookY = 0; st.look = -0.7; } }
  if (L === 'o4') { st.mood = 'happy'; st.look = -0.7; st.armL = hold(g, -1, 300, 0.7); st.items = { L: phoneItem(0) };
    if (speaking('o4_h', t, 0, 0)) { st.mood = t > WARD_T ? 'worried' : 'happy'; if (t > WARD_T + 0.1 && t < WARD_T + 1.6) { st.turn = 0.35; st.look = 1; } }
    if (t > endOf('o4_h')) { st.mood = 'shock'; st.blink = 0; }
    if (t > SP.o4_b.t - 0.1) { st.mood = 'worried'; phoneChest(9); st.lookY = 0.5; st.look = -0.2; }
    if (t > e('wobble')) { st.mood = 'worried'; st.lookY = 0; }
    if (t > e('jump')) { const u = t - e('jump'); st.mood = 'shock'; st.blink = 0; st.headY = -40 * Math.max(0, Math.sin(clamp(u / 0.35) * Math.PI)); st.armL = open(g, -1, 1.7, 40); st.armR = open(g, 1, 1.7, 40); st.items = {}; st.turn = 0.3; st.look = 1; } }
  if (L === 'end') { st.mood = 'worried'; phoneChest(); st.lookY = 0.5; st.look = -0.2;
    if (t > SP.end_b.t - 0.15) { st.mood = 'sad'; phoneUp(90); st.lookY = 0; st.look = -0.8; st.armR = down(g, 1); }
    if (t > ev('end', 'hug')) { st.mood = 'happy'; st.blink = 1; st.items = {}; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh + 150, { planar: true }); st.armR = down(g, 1); st.legPose = clamp((t - ev('end', 'hug')) / 0.6) < 1 ? 'walk' : 'stand'; st.look = -0.6; st.tilt = -0.06; } }
  return st; }
const wardFall = (t, L) => L === 'o4' ? eIn(clamp((t - ev('o4', 'fall')) / 0.35)) : (L === 'end' ? 1 : 0);
const wardWob = (t, L) => L === 'o4' && t > ev('o4', 'wobble') && t < ev('o4', 'fall') ? 1 : 0;

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'bf'], cover: ['her', 'bf'], two: ['her', 'bf'], her: ['her'], bf: ['bf'], ward: ['bf'], endw: ['her', 'bf'] };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {}; PT = t;
  c.drawImage(BGR, BX0, BY0, BW, BH);
  sofa(c);
  // wardrobe (behind him) + clutter
  c.save(); c.translate(WX, 0); wardrobe(c, t, wardFall(t, L), wardWob(t, L)); c.restore(); clutter(c); K.mark(c, 'wardrobe', WX, -900, 300);
  if (L === 'o4' && t > ev('o4', 'jump')) { const u = t - ev('o4', 'jump'), a = 1 - clamp((u - 0.4) / 0.6); for (let i = 0; i < 7; i++) puff(c, WX + 300 + i * 260, 20 - (i % 3) * 30 - u * 40, 50 + u * 40, 0.6 * a, '#EDE4D4'); }
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), X.her, 0);
  if (who.includes('bf')) heads.bf13 = K.put(c, BF, bfState(t, L), bfX(t, L), 0);
  // her steam (angry)
  const sk = steamK(t, L); if (sk > 0 && heads.her) { const hd = heads.her; for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i / 3) % 1); puff(c, hd.x + sg * hd.hh * (0.95 + u * 0.3), hd.y - hd.hh * (0.4 + u * 0.9), 18 + u * 26, sk * (1 - u) * 0.9); } }
  // o1: sparkle round his "famous" pose
  if (L === 'o1' && heads.bf13 && t > ev('o1', 'pose')) { const hd = heads.bf13, k = eBack(clamp((t - ev('o1', 'pose')) / 0.25), 2); star(c, hd.x - hd.hh * 1.3, hd.y - hd.hh * 0.9, 60 * k * (0.8 + 0.2 * Math.sin(t * 8))); star(c, hd.x + hd.hh * 1.4, hd.y - hd.hh * 0.4, 40 * k, 0.9); star(c, hd.x + hd.hh * 1.1, hd.y - hd.hh * 1.4, 28 * k, 0.8); }
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(60, fy(HY('bf'), 0.54, 1060), 0.54, 'cover'), WIDE: S(120, fy(HY('bf'), 0.5, 640), 0.5, 'wide'),
  HER: S(X.her + 20, fy(HY('her'), 1.0), 1.0, 'her'), HER_CU: S(X.her + 10, fy(HY('her'), 1.35, 980), 1.35, 'her'), HER_R: S(X.her + 20, fy(HY('her'), 1.05, 960), 1.05, 'her'),
  BF: S(X.bf + 60, fy(HY('bf'), 0.95, 900), 0.95, 'bf'), BF_CU: S(X.bf + 10, fy(HY('bf'), 1.25, 960), 1.25, 'bf'), BF_LOW: S(X.bf + 60, fy(HY('bf'), 0.95, 1050), 0.95, 'bf'),
  TWO_W: S(330, fy(HY('bf'), 0.55, 700), 0.55, 'two'), WARD: S(WX + 170, fy(HY('bf'), 0.46, 760), 0.46, 'ward'),
  ENDW: S(-120, fy(HY('bf'), 0.62, 700), 0.62, 'endw'),
  STORY: U('story', 1), METER: U('meter', 2), STILL: U('still', 3), DEL: U('del', 4), MUM: U('mum', 5) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('title_out') - 0.15) return SH.COVER; if (t < hev('fight') - 0.05) return f(SH.BF_LOW); if (t < hev('story') - 0.02) return f(SH.HER_CU); if (t < hev('wide') - 0.05) return f(SH.STORY); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_b.t - 0.1) return f(SH.HER); if (t < e('meter') - 0.02) return f(SH.BF); if (t < SP.o1_nar.t + 1.3) return f(SH.METER); return f(SH.HER_R); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_b.t - 0.1) return f(SH.HER); if (t < e('still') - 0.02) return f(SH.BF_CU); return f(SH.STILL); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_b.t - 0.1) return f(SH.HER); if (t < e('del') - 0.02) return f(SH.BF); if (t < e('smile') - 0.02) return f(SH.DEL); return f(SH.HER_R); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < WARD_T - 0.02) return f(SH.HER); if (t < SP.o4_b.t - 0.1) return f(SH.TWO_W); if (t < e('wobble') - 0.02) return f(SH.BF_CU); return f(SH.WARD); }
  if (L === 'end') { if (t < e('insert') - 0.02) return f(SH.BF); if (t < SP.end_b.t - 0.1) return f(SH.MUM); if (t < e('her') - 0.02) return f(SH.BF_CU); if (t < e('hug') - 0.02) return f(SH.HER_R); return f(SH.ENDW); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'crash']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts: his phone on a solid backdrop (story / taxi-meter counter / still up / delete + poof / mum's reply)
function phoneView(c, t, mode) { const L = sceneAt(t).id;
  c.fillStyle = mode === 'mum' ? '#3E4A6C' : '#5B4A8A'; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: mode });
  c.fillStyle = 'rgba(255,255,255,.05)'; for (let k = 0; k < 12; k++) c.fillRect(0, k * 180, W, 70);
  const a0 = { story: hev('story'), meter: ev('o1', 'meter'), still: ev('o2', 'still'), del: ev('o3', 'del'), mum: ev('end', 'insert') }[mode], u = t - a0;
  const pk = eBack(clamp(u / 0.3), 1.6), py = (mode === 'meter' ? 960 : 1090) + (1 - pk) * 400, s = mode === 'meter' ? 0.75 : 0.85;
  K.phone(c, 540, py, s, (q, w, h) => {
    if (mode === 'mum') return mumScreen(q, w, h, t);
    const gone = mode === 'del' ? eIn(clamp((t - ev('o3', 'poof')) / 0.3)) : 0;
    storyScreen(q, w, h, t, mode, { gone });
    if (mode === 'del') { // delete sheet slides up, button pressed, then poof + «Story deleted»
      const sk = eOut(clamp((u - 0.1) / 0.25)) * (1 - clamp((t - ev('o3', 'poof')) / 0.15)); if (sk > 0) { q.save(); q.translate(0, (1 - sk) * 260); q.fillStyle = 'rgba(0,0,0,.35)'; q.fillRect(0, 0, w, h); q.fillStyle = '#FFFFFF'; rr(q, 0, h - 250, w, 270, 26); q.fill();
        const pr = t > ev('o3', 'press'); q.fillStyle = pr ? '#B8343E' : '#E0474C'; rr(q, 30, h - 220, w - 60, 86, 43); q.fill(); fitTxt(q, 'Delete story', w / 2, h - 176, 36, '#FFFFFF', w - 120, 'Unb9');
        fitTxt(q, 'Cancel', w / 2, h - 80, 32, '#6A707A', w - 120, 'Nun9');
        const rp = clamp((t - ev('o3', 'press')) / 0.35); if (rp > 0 && rp < 1) { q.strokeStyle = '#FFFFFF'; q.globalAlpha = 1 - rp; q.lineWidth = 6; q.beginPath(); q.arc(w / 2, h - 177, 20 + 120 * rp, 0, TAU); q.stroke(); q.globalAlpha = 1; } q.restore(); }
      const pf = clamp((t - ev('o3', 'poof')) / 0.7); if (pf > 0 && pf < 1) for (let i = 0; i < 8; i++) { const an = i / 8 * TAU; puff(q, w / 2 + Math.cos(an) * 150 * eOut(pf), h * 0.45 + Math.sin(an) * 200 * eOut(pf), 40 + 30 * pf, 1 - pf); }
      const dk = eBack(clamp((t - ev('o3', 'poof') - 0.35) / 0.3), 2); if (dk > 0) { q.save(); q.translate(w / 2, h * 0.45); q.scale(dk, dk); q.fillStyle = '#4CAF6A'; q.beginPath(); q.arc(0, -40, 70, 0, TAU); q.fill(); checkMark(q, 0, -40, 1.1, '#FFFFFF'); fitTxt(q, 'Story deleted', 0, 80, 40, '#FFFFFF', w - 60, 'Unb9'); q.restore(); } }
  });
  // o1: taxi-meter: the view counter, big, digits rolling
  if (mode === 'meter') { const mk = eBack(clamp((u - 0.15) / 0.3), 1.8); if (mk > 0) { const v = views(t), y = 1335;
    c.save(); c.translate(540, y); c.scale(mk * 0.8, mk * 0.8); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, -300 + 8, -80 + 12, 600, 160, 30); c.fill(); c.fillStyle = '#F2C14E'; rr(c, -300, -80, 600, 160, 30); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 8; c.stroke();
      c.fillStyle = '#1E2030'; rr(c, -170, -58, 440, 116, 16); c.fill(); eyeIcon(c, -235, 0, 1.4, '#1E2030');
      // rolling digits (each digit slides up as it changes)
      const str = String(v).padStart(4, ' '), frac = (lerp(90, 347, eIO(clamp((t - ev('o1', 'meter')) / 1.75))) % 1);
      UI.font(c, 'Unb9', 84); c.textAlign = 'center'; c.textBaseline = 'middle'; c.save(); c.beginPath(); c.rect(-170, -58, 440, 116); c.clip();
      for (let i = 0; i < 4; i++) { const ch = str[i]; if (ch === ' ') continue; const last = i === 3, off = last && t < ev('o1', 'meter') + 1.75 ? frac * 90 : 0; c.fillStyle = '#9FE0B8'; c.fillText(ch, -110 + i * 105, 6 - off); if (off) c.fillText(String((+ch + 1) % 10), -110 + i * 105, 96 - off); }
      c.restore(); c.restore(); } }
}
function mumScreen(q, w, h, t) { const u = t - ev('end', 'insert');
  q.fillStyle = '#F4F1EC'; q.fillRect(0, 0, w, h); q.fillStyle = '#FFFFFF'; q.fillRect(0, 0, w, 110); q.fillStyle = '#E2DDD4'; q.fillRect(0, 108, w, 3);
  q.fillStyle = '#B98AE0'; q.beginPath(); q.arc(60, 62, 34, 0, TAU); q.fill(); q.fillStyle = '#F6D2B6'; q.beginPath(); q.arc(60, 66, 20, 0, TAU); q.fill(); q.fillStyle = '#C9CED6'; q.beginPath(); q.arc(60, 46, 18, Math.PI, 0); q.fill();
  fitTxt(q, 'MUM', 110, 52, 36, '#1E2030', 200, 'Unb9', 'left'); fitTxt(q, 'replied to your story', 110, 86, 22, '#6A707A', 280, 'Nun9', 'left');
  // the story thumbnail she replied to
  q.save(); q.translate(w - 150, 150); q.beginPath(); rr(q, 0, 0, 120, 200, 14); q.clip(); storyScreen(q, 120, 200, t, 'tiny'); q.restore();
  const k = eBack(clamp((t - ev('end', 'comment')) / 0.3), 2); if (k > 0) { q.save(); q.translate(40, 420); q.scale(k, k); q.fillStyle = '#FFFFFF'; rr(q, 0, 0, 330, 150, 30); q.fill(); q.strokeStyle = '#D8D2C8'; q.lineWidth = 3; q.stroke();
    fitTxt(q, "She's right.", 26, 48, 40, '#1E2030', 290, 'Unb9', 'left'); fitTxt(q, 'Apologise.', 26, 104, 40, '#E0474C', 290, 'Unb9', 'left'); q.restore(); }
  q.fillStyle = '#FFFFFF'; rr(q, 20, h - 80, w - 40, 60, 30); q.fill(); fitTxt(q, 'Reply to MUM...', 50, h - 50, 24, '#9AA3B2', 300, 'Nun9', 'left'); }

// ---------------- overlays: title, comment plate, option plates
function title(c, t) { const a = 1 - P(t, hev('title_out') - 0.25, hev('title_out')); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
function commentPlate(c, t) { const a = hev('plate'), k = eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, SC.hook.e - 0.25, SC.hook.e - 0.05)); if (k <= 0) return;
  c.save(); c.translate(540, 380); c.rotate(-0.025); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, -450 + 8, -150 + 12, 900, 300, 34); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -450, -150, 900, 300, 34); c.fill();
  c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(-340, 145); c.lineTo(-300, 193); c.lineTo(-280, 145); c.fill();
  c.fillStyle = '#EE5E9A'; rr(c, -450, -150, 900, 70, [34, 34, 0, 0]); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -410, -133, 46, 34, 10); c.fill(); c.beginPath(); c.moveTo(-402, -103); c.lineTo(-406, -87); c.lineTo(-386, -101); c.fill();
  fitTxt(c, 'Вопрос из комментариев:', -345, -115, 36, '#FFFFFF', 700, 'Nun9', 'left');
  fitTxt(c, 'мы поругались, а он выложил это', 0, -32, 48, '#1E2030', 840, 'Unb9'); fitTxt(c, 'в сторис с подписью «Женщины…».', 0, 30, 48, '#1E2030', 840, 'Unb9'); fitTxt(c, 'Как ему ответить?', 0, 94, 48, C.pinkD, 840, 'Unb9');
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 90, y: 230, w: 900, h: 300, k, id: 'comment' }); }
const PLATES = { o1: ['1', 'ХОЛОДНО', '#E0474C'], o2: ['2', 'С ЮМОРОМ', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD8'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  c.save(); UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, s = k * Math.min(lerp(1, 1.4, big), 900 / w), y = 215;
  c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w * s / 2, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: «КАКОЙ ОТВЕТ ТВОЙ?», 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor (all inside x 60–940)
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, wt = (w, d) => K.wordT('outro', w) ?? (sp.t + d), CX = 500; PT = t;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + boyfriend (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34; 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gb = G.bf;
    K.put(c, BF, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.5, armL: reach(gb, -1, -gb.sw * 1.7, gb.ySh + 150, { planar: true }), armR: down(gb, 1), items: {} }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(t * 8) * 30, { planar: true }), armR: down(g, 1), items: {} }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.15, 0.5), 2.2);
  if (q > 0) { c.save(); c.translate(CX, 290); c.scale(q, q); UI.font(c, 'Unb9', 76); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'КАКОЙ ОТВЕТ', 0, -48, C.oliveD, C.white, 14); UI.strokeText(c, 'ТВОЙ?', 0, 48, C.pink, C.white, 14); c.restore(); }
  const rows = [['1', 'ХОЛОДНО', 'Delete. Now.', '#E0474C', 'один'], ['2', 'С ЮМОРОМ', 'Shall I post your man-flu video?', '#F2B33D', 'два'], ['3', 'КАК НОСИТЕЛЬ', 'Take it down, please.', '#4CAF6A', 'три'], ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', 'Next time you need content, just ask.', '#8E5BD8', 'четыре']];
  rows.forEach(([n, ru, en, col, w], i) => { const a = wt(w, 1.3 + i * 0.35) - 0.1, k = eBack(P(t, a, a + 0.28), 2.0); if (k <= 0) return; const y = 520 + i * 160;
    c.save(); c.translate(CX, y); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.16)'; rr(c, -420 + 8, -66 + 12, 840, 132, 36); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -420, -66, 840, 132, 36); c.fill(); c.stroke();
    c.fillStyle = col; c.beginPath(); c.arc(-340, 0, 50, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); fitTxt(c, n, -340, 4, 70, C.white, 70);
    fitTxt(c, ru, -265, -24, 40, C.oliveD, 650, 'Unb9', 'left'); fitTxt(c, en, -265, 28, 34, C.pinkD, 650, 'Nun9', 'left'); c.restore(); });
  const bt = wt('пиши', 3.55) - 0.2, bk = eBack(P(t, bt, bt + 0.35), 2.2), by = 1185;
  if (bk > 0) { c.save(); c.translate(CX, by); c.scale(bk, bk); c.fillStyle = C.gold; rr(c, -420, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-370, -30); c.lineTo(-330, -30); c.lineTo(-330, 32); c.lineTo(-350, 16); c.lineTo(-370, 32); c.closePath(); c.fill(); fitTxt(c, 'СОХРАНИ', -200, 4, 40, C.oliveD, 250);
    const subT = bt + 0.6, click = P(t, subT + 0.55, subT + 0.7), pressed = t > subT + 0.65, ss = 1 - 0.08 * Math.sin(click * Math.PI);
    c.save(); c.translate(220, 0); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -200, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); fitTxt(c, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4, 40, C.white, 340); c.restore(); c.restore();
    const mv = eIO(P(t, subT, subT + 0.55)); UI.tapCursor(c, lerp(930, CX + 260, mv), lerp(by + 330, by + 10, mv), 1, P(t, subT + 0.6, subT + 1.1)); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads = {}, proj;
  if (tag.startsWith('ui:')) { phoneView(c, t, tag.slice(3)); proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  // bubbles only for characters drawn in this shot (an off-screen speaker never gets a bubble over another shot)
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, hold: { hook_b: -0.2, o1_h: -0.2, o1_b: -0.2, o2_h: -0.2, o2_b: -0.2, o3_h: -0.2, o3_b: -0.2, o4_h: -0.2, o4_b: -0.2, end_b: -0.2 } });
  if (L === 'hook') { title(c, t); commentPlate(c, t); }
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('stories', NF, renderFrame);
