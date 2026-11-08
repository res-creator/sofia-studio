// "Я на аватарке, а бывшая всё ещё в ленте" — rubric «Ответ на вопрос из комментариев» (live scene + 4 answers), hard_cut camera: node exphotos.js start end out.mp4 | --png=f1,f2
// Her living room: the heroine (pink jumper) on the left; her boyfriend Charlie (blue hoodie, grey socks) on the right proudly holds out his phone — their selfie is his new avatar.
// hook: "Look! You're official now. Front page!" — comment plate; inserts: his profile (selfie avatar), then the grid: his ex Kate everywhere; her eye twitches.
// 1 · ХОЛОДНО: "And her? Delete." -> "Who, Kate? She's… part of the archive." -> insert: he scrolls: Kate on the beach, on skis, with a cake... endlessly.
// 2 · С ЮМОРОМ: "...or just a guest star?" -> "Guest star! She's got fans, actually." -> insert: Kate's photo, the likes roll up to 300.
// 3 · КАК НОСИТЕЛЬ: "...clear out the old photos, or shall I?" -> "…Doing it now. Bye, Kate." -> insert: the photos fly into the bin one by one; Bella tip «Clear out.»
// 4 · КОРОЛЕВСКИЙ ОТВЕТ: "Your profile is a museum, darling..." -> "Closing the museum! Everything must go!" -> insert: DELETE hammered, counter races, the phone smokes.
// Twist: ding — a comment under the new avatar from Kate; he reads it out: "Finally someone took him! Good luck with his socks." -> insert: his holey socks -> moral. End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/exphotos/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift };
const BF = { ...BASE.tom, hair: { style: 'quiff', col: '#7A4A2A' }, top: { type: 'hoodie', col: '#3E78C2' }, bottom: { type: 'joggers', col: '#4A5160' }, shoes: { col: '#9AA0AA', acc: null } };
const KATE = { ...BASE.chloe, hair: { style: 'long', col: '#C8502E', len: 1.6 }, hairTie: undefined, top: { type: 'tank', col: '#2FB7A8' }, bottom: { type: 'shorts', col: '#F2D27A' } };
const KATE_SKI = { ...KATE, top: { type: 'coat', col: '#E0474C', col2: '#FFFFFF' } }, KATE_CAKE = { ...KATE, top: { type: 'sweater', col: '#F2B33D' } }, KATE_GLAM = { ...KATE, top: { type: 'tank', col: '#8E2A5A' }, necklace: true };
const G = { her: geom(HER), bf: geom(BF), kate: geom(KATE) };
const X = { her: -300, bf: 300 };
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function star(c, x, y, r, a = 1, col = '#FFF6C8') { c.save(); c.globalAlpha *= a; c.translate(x, y); c.fillStyle = col; c.beginPath(); for (let i = 0; i < 8; i++) { const rr_ = i % 2 ? r * 0.28 : r, an = i * Math.PI / 4; c.lineTo(Math.cos(an) * rr_, Math.sin(an) * rr_); } c.closePath(); c.fill(); c.restore(); }
// heart drawn with paths (fonts have no ♥); (x, y) = centre
function heart(c, x, y, s, col = '#E0474C', stroke) { c.save(); c.translate(x, y); c.scale(s / 100, s / 100); c.beginPath(); c.moveTo(0, 35); c.bezierCurveTo(-60, -5, -55, -60, -25, -60); c.bezierCurveTo(-8, -60, 0, -45, 0, -35); c.bezierCurveTo(0, -45, 8, -60, 25, -60); c.bezierCurveTo(55, -60, 60, -5, 0, 35); c.closePath(); c.fillStyle = col; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = 8; c.stroke(); } c.restore(); }
// trash bin icon; (x, y) = bottom centre; lid = 0..1 open
function bin(c, x, y, s, lid = 0) { c.save(); c.translate(x, y); c.scale(s, s);
  paint(c, q => { q.m(-70, -150); q.l(70, -150); q.l(56, 0); q.l(-56, 0); q.z(); }, '#7E8594', { sd: 6, hd: 3, lw: 4 });
  c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 8; for (const dx of [-28, 0, 28]) { c.beginPath(); c.moveTo(dx, -125); c.lineTo(dx * 0.85, -22); c.stroke(); }
  c.save(); c.translate(-80, -158); c.rotate(-lid * 0.9); paint(c, q => { q.m(0, 0); q.l(160, 0); q.l(160, -20); q.l(0, -20); q.z(); }, '#596070', { sd: 4, hd: 2, lw: 4 }); c.fillStyle = '#596070'; rr(c, 60, -40, 40, 24, 8); c.fill(); c.restore(); c.restore(); }
// smoke puffs rising from (x, y); u = time since start
function smoke(c, x, y, u, s = 1, n = 7) { if (u <= 0) return; c.save(); for (let i = 0; i < n; i++) { const ph = (u * 0.9 + i / n) % 1, a = (1 - ph) * clamp(u / 0.3) * 0.75; c.globalAlpha = a; c.fillStyle = i % 2 ? '#5A5F6A' : '#8A8F9A'; c.beginPath(); c.arc(x + Math.sin(ph * 6 + i) * 40 * s, y - ph * 360 * s, (30 + ph * 70) * s, 0, TAU); c.fill(); } c.restore(); }

// ---------------- photos (small scenes with Kate, drawn with the character rig) — all English, no brands
const KST = (g, t, kind) => { const st = { t, talk: 0, mood: 'happy', laugh: true, blink: 0, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 1.08, g.ySh + 540, { planar: true }), armR: reach(g, 1, g.sw * 1.08, g.ySh + 540, { planar: true }), items: {} };
  if (kind === 'beach') st.armR = reach(g, 1, g.sw * 1.9, g.ySh - 240 + Math.sin(t * 6) * 20, { planar: true });
  if (kind === 'ski') { st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 200, { planar: true }); st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 200, { planar: true }); }
  if (kind === 'cake') { st.armL = reach(g, -1, -g.sw * 0.7, g.ySh + 330, { planar: true }); st.armR = reach(g, 1, g.sw * 0.7, g.ySh + 330, { planar: true }); }
  if (kind === 'glam') { st.mood = 'smug'; st.laugh = false; st.turn = 0.2; st.look = 0.3; st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 300, { planar: true }); }
  return st; };
const PH = {
  beach: { bg: (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5EC0F2'); g.addColorStop(1, '#BDE8FA'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = '#FFE15A'; c.beginPath(); c.arc(w * 0.82, h * 0.17, w * 0.1, 0, TAU); c.fill(); c.fillStyle = '#2E8FD0'; c.fillRect(0, h * 0.55, w, h * 0.17); c.fillStyle = '#F2D9A0'; c.fillRect(0, h * 0.72, w, h); }, cfg: KATE },
  ski: { bg: (c, w, h) => { c.fillStyle = '#A8D4F2'; c.fillRect(0, 0, w, h); c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-10, h * 0.7); c.lineTo(w * 0.3, h * 0.25); c.lineTo(w * 0.55, h * 0.55); c.lineTo(w * 0.78, h * 0.2); c.lineTo(w + 10, h * 0.6); c.lineTo(w + 10, h); c.lineTo(-10, h); c.closePath(); c.fill(); c.fillStyle = '#7FA0BE'; c.beginPath(); c.moveTo(w * 0.3, h * 0.25); c.lineTo(w * 0.38, h * 0.35); c.lineTo(w * 0.26, h * 0.32); c.fill(); }, cfg: KATE_SKI },
  cake: { bg: (c, w, h) => { c.fillStyle = '#F7C6D9'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc((i * 97) % w, (i * 53) % (h * 0.5), w * 0.03, 0, TAU); c.fill(); } }, cfg: KATE_CAKE,
    fg: (c, w, h) => { c.save(); c.translate(w * 0.5, h * 0.98); const s = w / 400; c.scale(s, s); paint(c, q => { q.m(-120, -110); q.l(120, -110); q.l(120, 0); q.l(-120, 0); q.z(); }, '#FFF6EA', { sd: 4, hd: 2, lw: 4 }); c.fillStyle = '#EE5E9A'; c.fillRect(-120, -110, 240, 30); for (let i = 0; i < 5; i++) { c.fillStyle = '#3FA9F5'; c.fillRect(-80 + i * 40, -170, 12, 60); c.fillStyle = '#FFB020'; c.beginPath(); c.ellipse(-74 + i * 40, -184, 9, 15, 0, 0, TAU); c.fill(); } c.restore(); } },
  party: { bg: (c, w, h) => { c.fillStyle = '#5A3E8A'; c.fillRect(0, 0, w, h); for (let i = 0; i < 14; i++) { c.fillStyle = ['#FFE15A', '#EE5E9A', '#5EC27A', '#3FA9F5'][i % 4]; c.fillRect((i * 71) % w, (i * 37) % h, w * 0.025, w * 0.05); } }, cfg: { ...KATE, top: { type: 'tank', col: '#EE5E9A' } } },
  dog: { bg: (c, w, h) => { c.fillStyle = '#9ED39A'; c.fillRect(0, 0, w, h); c.fillStyle = '#6AAE5A'; c.fillRect(0, h * 0.7, w, h); }, cfg: { ...KATE, top: { type: 'tee', col: '#F7F2E8' } } },
  glam: { bg: (c, w, h) => { const g = c.createRadialGradient(w / 2, h * 0.35, 10, w / 2, h * 0.35, w * 0.8); g.addColorStop(0, '#FFE0A8'); g.addColorStop(1, '#C9733A'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = w * 0.01; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.beginPath(); c.moveTo(w / 2, h * 0.35); c.lineTo(w / 2 + Math.cos(a) * w, h * 0.35 + Math.sin(a) * w); c.stroke(); } }, cfg: KATE_GLAM },
};
const GK = {}; for (const k in PH) GK[k] = geom(PH[k].cfg);
function photo(c, x, y, w, h, kind, t) { const p = PH[kind]; c.save(); c.translate(x, y); c.beginPath(); c.rect(0, 0, w, h); c.clip(); p.bg(c, w, h);
  const s = h * 1.15 / 1530; K.put(c, p.cfg, KST(GK[kind], t, kind), w * 0.5, h * 1.42, s); if (p.fg) p.fg(c, w, h); c.restore(); }
// the new avatar: their selfie (heads cheek to cheek)
function selfie(c, x, y, w, h, t) { c.save(); c.translate(x, y); c.beginPath(); c.rect(0, 0, w, h); c.clip(); const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#FFD3E2'); g.addColorStop(1, '#FFB4CC'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  const s = h * 1.25 / 1550, gh = G.her, gb = G.bf;
  K.put(c, BF, { t, talk: 0, mood: 'happy', laugh: true, blink: 1, turn: -0.3, look: -0.3, tilt: -0.1, armL: reach(gb, -1, -gb.sw * 1.08, gb.ySh + 540, { planar: true }), armR: reach(gb, 1, gb.sw * 1.08, gb.ySh + 540, { planar: true }), items: {} }, w * 0.66, h * 1.62, s);
  K.put(c, HER, { t, talk: 0, mood: 'happy', laugh: true, blink: 0, turn: 0.3, look: 0.3, tilt: 0.1, armL: reach(gh, -1, -gh.sw * 1.08, gh.ySh + 540, { planar: true }), armR: reach(gh, 1, gh.sw * 1.08, gh.ySh + 540, { planar: true }), items: {} }, w * 0.36, h * 1.55, s);
  c.restore(); }
// small round avatar of Kate (comment)
function kateAvatar(c, x, y, r, t) { c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip(); photo(c, x - r, y - r, 2 * r, 2 * r, 'glam', t); c.restore(); c.strokeStyle = '#E0474C'; c.lineWidth = 4; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); }

function selfieAv(c, x, y, r, t) { c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip(); selfie(c, x - r, y - r, 2 * r, 2 * r, t); c.restore(); c.strokeStyle = '#EE5E9A'; c.lineWidth = 4; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); }
// ---------------- phone screens (inside K.phone: w 416 x h 740)
function appBar(c, w, title) { c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, 64); c.fillStyle = '#E6E1D8'; c.fillRect(0, 63, w, 2); fitTxt(c, title, 22, 34, 30, '#1E2030', 300, 'Unb9', 'left'); c.strokeStyle = '#1E2030'; c.lineWidth = 4; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(w - 56, 22 + i * 10); c.lineTo(w - 24, 22 + i * 10); c.stroke(); } }
const GRID = ['beach', 'ski', 'cake', 'party', 'dog', 'glam', 'beach', 'ski', 'cake', 'glam', 'party', 'dog'];
function profileScreen(c, w, h, t, scroll = 0, mark = 0) {
  c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h);
  c.save(); c.translate(0, -scroll);
  // avatar = their selfie, pink "new" ring
  c.save(); c.beginPath(); c.arc(100, 165, 72, 0, TAU); c.clip(); selfie(c, 28, 93, 144, 144, t); c.restore();
  c.strokeStyle = '#EE5E9A'; c.lineWidth = 7; c.beginPath(); c.arc(100, 165, 80, 0, TAU); c.stroke();
  fitTxt(c, '48', 235, 140, 32, '#1E2030', 80); fitTxt(c, 'posts', 235, 176, 22, '#6A6F7A', 90, 'Nun9');
  fitTxt(c, '312', 340, 140, 32, '#1E2030', 90); fitTxt(c, 'followers', 340, 176, 22, '#6A6F7A', 110, 'Nun9');
  fitTxt(c, 'Charlie', 30, 278, 28, '#1E2030', 300, 'Unb9', 'left'); fitTxt(c, 'Taken!', 30, 314, 26, '#6A6F7A', 200, 'Nun9', 'left'); heart(c, 132, 314, 26, '#EE5E9A');
  c.fillStyle = '#E6E1D8'; c.fillRect(0, 350, w, 2);
  const cw = (w - 8) / 3; GRID.forEach((k, i) => { const x = (i % 3) * (cw + 4), y = 356 + Math.floor(i / 3) * (cw + 4); photo(c, x, y, cw, cw, k, t);
    if (mark > 0) { c.strokeStyle = '#E0474C'; c.lineWidth = 6; c.globalAlpha = mark * (0.7 + 0.3 * Math.sin(t * 10 + i)); rr(c, x + 4, y + 4, cw - 8, cw - 8, 8); c.stroke(); c.globalAlpha = 1; } });
  c.restore(); appBar(c, w, 'charlie_k'); }
// o1: endless feed of Kate posts
const FEED = [['beach', 'Beach day!'], ['ski', 'Ski trip'], ['cake', 'Her birthday'], ['party', 'NYE'], ['dog', 'Sunday walk'], ['glam', 'Gala night']];
function feedScreen(c, w, h, t, u) { c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h); const ph = w + 110, off = Math.max(0, u) * 520;
  c.save(); c.translate(0, 70 - off % (ph * FEED.length));
  for (let r = 0; r < FEED.length * 2; r++) { const [k, cap] = FEED[r % FEED.length], y = r * ph;
    if (y - (off % (ph * FEED.length)) > h || y + ph - (off % (ph * FEED.length)) < -80) continue;
    selfieAv(c, 36, y + 30, 22, t); fitTxt(c, 'charlie_k', 70, y + 30, 24, '#1E2030', 200, 'Unb9', 'left');
    photo(c, 0, y + 62, w, w * 0.8, k, t); heart(c, 34, y + 62 + w * 0.8 + 26, 34, '#E0474C'); fitTxt(c, cap, 64, y + 62 + w * 0.8 + 26, 24, '#1E2030', 300, 'Nun9', 'left'); }
  c.restore(); appBar(c, w, 'charlie_k');
  // motion streaks while scrolling fast
  c.fillStyle = 'rgba(30,32,48,.08)'; for (let i = 0; i < 5; i++) c.fillRect(w - 14, 120 + i * 120 + (off * 0.6) % 120, 8, 60); }
// o2: one big glam photo, likes roll up to 300, hearts float
function likesScreen(c, w, h, t, u) { c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h); selfieAv(c, 40, 100, 26, t); fitTxt(c, 'charlie_k', 78, 100, 26, '#1E2030', 220, 'Unb9', 'left');
  photo(c, 0, 140, w, w, 'glam', t);
  const n = Math.round(300 * eOut(clamp(u / 1.2))), pk = 1 + 0.25 * Math.sin(clamp((u - 1.2) / 0.3) * Math.PI);
  c.save(); c.translate(48, 140 + w + 50); c.scale(pk, pk); heart(c, 0, 0, 56, '#E0474C'); c.restore();
  fitTxt(c, n + ' likes', 96, 140 + w + 50, 40, '#1E2030', 300, 'Unb9', 'left');
  fitTxt(c, '"Queen!"  "Iconic!"', 28, 140 + w + 112, 26, '#6A6F7A', 360, 'Nun9', 'left');
  for (let i = 0; i < 9; i++) { const a = u - i * 0.13; if (a <= 0) continue; const ph = (a * 0.8) % 1; c.globalAlpha = 1 - ph; heart(c, 60 + (i * 83) % (w - 100), 140 + w - ph * 520, 40 + (i % 3) * 14, i % 2 ? '#EE5E9A' : '#E0474C'); c.globalAlpha = 1; }
  appBar(c, w, 'charlie_k'); }
// o3: Kate photos fly into the bin one by one; the selfie stays
function binScreen(c, w, h, t, u) { c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h); const cw = (w - 12) / 2, by = 690, bx = w / 2;
  const kinds = ['beach', 'ski', 'cake', 'party'];
  c.save(); c.beginPath(); c.rect(0, 0, w, h); c.clip();
  // the selfie stays on top
  selfie(c, 4, 80, w - 8, cw * 0.8, t); c.fillStyle = 'rgba(255,255,255,.85)'; rr(c, 14, 90, 92, 40, 20); c.fill(); fitTxt(c, 'NEW', 60, 110, 24, '#EE5E9A', 80);
  let lid = 0;
  kinds.forEach((k, i) => { const x0 = 4 + (i % 2) * (cw + 4), y0 = 84 + cw * 0.8 + 6 + Math.floor(i / 2) * (cw * 0.78 + 4), a = 0.15 + i * 0.5, f = clamp((u - a) / 0.4);
    if (f >= 1) return; lid = Math.max(lid, Math.sin(f * Math.PI));
    const x = lerp(x0, bx - cw * 0.2, eIn(f)), y = lerp(y0, by - 140, eIn(f)) - Math.sin(f * Math.PI) * 120, s = lerp(1, 0.25, eIn(f));
    c.save(); c.translate(x + cw * s / 2, y + cw * 0.78 * s / 2); c.rotate(f * (i % 2 ? 2.4 : -2.4)); photo(c, -cw * s / 2, -cw * 0.78 * s / 2, cw * s, cw * 0.78 * s, k, t); c.restore(); });
  c.restore();
  bin(c, bx, by + 20, 0.7, lid); const gone = kinds.filter((k, i) => u > 0.15 + i * 0.5 + 0.4).length;
  if (gone) { c.fillStyle = '#E0474C'; rr(c, w - 190, 90, 170, 44, 22); c.fill(); fitTxt(c, 'Deleted: ' + gone, w - 105, 113, 24, '#FFFFFF', 150, 'Unb9'); }
  appBar(c, w, 'charlie_k'); }
// o4: the DELETE button hammered, counter racing, then the screen dies (crack)
function deleteScreen(c, w, h, t, u, fried) {
  if (fried > 0) { c.fillStyle = '#14161E'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(w * 0.62, h * 0.32); c.lineTo(w * 0.3, h * 0.12); c.moveTo(w * 0.62, h * 0.32); c.lineTo(w * 0.9, h * 0.08); c.moveTo(w * 0.62, h * 0.32); c.lineTo(w * 0.2, h * 0.6); c.moveTo(w * 0.62, h * 0.32); c.lineTo(w * 0.95, h * 0.7); c.moveTo(w * 0.4, h * 0.45); c.lineTo(w * 0.1, h * 0.4); c.stroke(); return; }
  c.fillStyle = '#FFF0F0'; c.fillRect(0, 0, w, h); const n = Math.min(48, Math.floor(clamp(u / 1.1) * 48));
  const cw = (w - 8) / 3; for (let i = 0; i < 9; i++) { const gone = i < (n % 10); const x = (i % 3) * (cw + 4), y = 80 + Math.floor(i / 3) * (cw + 4); if (!gone) photo(c, x, y, cw, cw, GRID[(i + n) % GRID.length], t); else { c.fillStyle = '#F2DCDC'; c.fillRect(x, y, cw, cw); } }
  fitTxt(c, 'Deleted: ' + n, w / 2, 520, 40, '#E0474C', 380, 'Unb9');
  const tap = (u * 9) % 1, pr = tap < 0.4, k = pr ? 0.94 : 1; c.save(); c.translate(w / 2, 630); c.scale(k, k); c.fillStyle = pr ? '#B8343E' : '#E0474C'; rr(c, -170, -52, 340, 104, 52); c.fill(); fitTxt(c, 'DELETE', 0, 3, 48, '#FFFFFF', 300); c.restore();
  if (u > 0) { c.strokeStyle = 'rgba(224,71,76,.7)'; c.lineWidth = 6; c.globalAlpha = 1 - tap; c.beginPath(); c.arc(w / 2 + 30, 640, 20 + tap * 90, 0, TAU); c.stroke(); c.globalAlpha = 1; }
  appBar(c, w, 'charlie_k'); }
// twist: the new avatar post + a fresh comment from Kate (screen cracked)
function notifScreen(c, w, h, t, u) { c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h);
  selfie(c, 0, 66, w, w * 0.78, t); heart(c, 34, 66 + w * 0.78 + 30, 34, '#E0474C'); fitTxt(c, '1 like', 64, 66 + w * 0.78 + 30, 24, '#1E2030', 200, 'Unb9', 'left');
  const k = eBack(clamp((u - 0.2) / 0.3), 1.8), y = 66 + w * 0.78 + 70;
  if (k > 0) { c.save(); c.translate(w / 2, y + 95); c.scale(k, k); c.translate(-w / 2, -(y + 95)); c.fillStyle = '#FFF4D6'; rr(c, 10, y, w - 20, 190, 20); c.fill(); c.strokeStyle = '#F2B33D'; c.lineWidth = 4; c.stroke();
    kateAvatar(c, 50, y + 42, 26, t); fitTxt(c, 'kate_m', 88, y + 42, 26, '#1E2030', 200, 'Unb9', 'left'); fitTxt(c, 'just now', w - 30, y + 42, 20, '#9A9FAA', 120, 'Nun9', 'right');
    fitTxt(c, 'Finally someone took him!', 28, y + 98, 30, '#1E2030', w - 56, 'Nun9', 'left'); fitTxt(c, 'Good luck with his socks.', 28, y + 144, 30, '#1E2030', w - 56, 'Nun9', 'left'); c.restore(); }
  c.strokeStyle = 'rgba(30,32,48,.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(w * 0.85, 0); c.lineTo(w * 0.7, h * 0.12); c.lineTo(w * 0.95, h * 0.2); c.moveTo(w * 0.7, h * 0.12); c.lineTo(w * 0.55, h * 0.05); c.stroke();
  appBar(c, w, 'charlie_k'); }
// the phone in his hand (world prop); mode: 'avatar' | 'grid' | 'fried'
function handPhone(c, mode, t, glow = 0) { c.save(); c.translate(0, -150); c.scale(1.3, 1.3);
  c.fillStyle = '#2B2F3A'; rr(c, -62, -112, 124, 224, 18); c.fill();
  c.save(); c.beginPath(); rr(c, -54, -100, 108, 200, 12); c.clip();
  if (mode === 'fried') { c.fillStyle = '#14161E'; c.fillRect(-60, -110, 120, 220); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(10, -20); c.lineTo(-40, -80); c.moveTo(10, -20); c.lineTo(50, 60); c.moveTo(10, -20); c.lineTo(-45, 40); c.stroke(); }
  else { c.fillStyle = '#FFFFFF'; c.fillRect(-60, -110, 120, 220); c.save(); c.beginPath(); c.arc(-14, -54, 30, 0, TAU); c.clip(); selfie(c, -44, -84, 60, 60, t); c.restore(); c.strokeStyle = '#EE5E9A'; c.lineWidth = 4; c.beginPath(); c.arc(-14, -54, 33, 0, TAU); c.stroke();
    for (let i = 0; i < 6; i++) photo(c, -52 + (i % 3) * 36, -10 + Math.floor(i / 3) * 36, 34, 34, GRID[i], t); }
  c.restore();
  if (glow > 0) { c.globalAlpha = glow; c.fillStyle = 'rgba(255,240,180,.35)'; c.beginPath(); c.arc(0, 0, 170, 0, TAU); c.fill(); c.globalAlpha = 1; }
  c.restore(); }

// ---------------- living room (prerendered, softly blurred)
const BX0 = -3300, BY0 = -3800, BW = 6600, BH = 5600, BS = 0.5, SOFAX = 0;
function drawRoom(c) {
  c.fillStyle = '#EAD9F0'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(150,110,180,.08)'; for (let x = BX0; x < BX0 + BW; x += 180) c.fillRect(x, BY0, 70, 3800);
  // window with city view + curtains (left)
  const g = c.createLinearGradient(0, -2600, 0, -1500); g.addColorStop(0, '#8EC9F0'); g.addColorStop(1, '#D8EEF8');
  c.fillStyle = '#FFFDF6'; rr(c, -2350, -2600, 900, 1150, 18); c.fill(); c.fillStyle = g; rr(c, -2320, -2570, 840, 1090, 10); c.fill();
  c.fillStyle = '#B9C8DA'; for (const [x, w_, h_] of [[-2300, 160, 380], [-2120, 120, 520], [-1980, 180, 300], [-1780, 140, 460], [-1620, 130, 340]]) c.fillRect(x, -1480 - h_, w_, h_);
  c.fillStyle = '#FFFDF6'; c.fillRect(-1910, -2570, 18, 1090); c.fillRect(-2320, -2040, 840, 18);
  c.fillStyle = '#7FB8A8'; rr(c, -2480, -2700, 170, 1300, 30); c.fill(); rr(c, -1490, -2700, 170, 1300, 30); c.fill();
  // gallery wall above the sofa: three frames (abstract, no text)
  for (const [x, y, w_, h_, col] of [[-640, -2450, 380, 300, '#F2B33D'], [-160, -2550, 300, 400, '#5EC27A'], [240, -2400, 400, 280, '#3FA9F5']]) { c.fillStyle = '#8A6A4A'; rr(c, x - 18, y - 18, w_ + 36, h_ + 36, 8); c.fill(); c.fillStyle = '#FFF8EC'; c.fillRect(x, y, w_, h_); c.fillStyle = col; c.beginPath(); c.arc(x + w_ * 0.45, y + h_ * 0.55, Math.min(w_, h_) * 0.28, 0, TAU); c.fill(); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(x + w_ * 0.1, y + h_ * 0.75, w_ * 0.8, h_ * 0.08); }
  // floor lamp + bookshelf (right)
  c.fillStyle = '#3A3A44'; c.fillRect(1520, -1500, 14, 1500); paint(c, q => { q.m(1400, -1500); q.l(1660, -1500); q.l(1600, -1720); q.l(1460, -1720); q.z(); }, '#F7E6B0', { sd: 4, hd: 2, lw: 4 });
  c.fillStyle = '#9A7452'; c.fillRect(1900, -2300, 700, 2300); c.fillStyle = '#7A5638'; for (let r = 0; r < 5; r++) c.fillRect(1900, -2300 + r * 460, 700, 26);
  const bc = ['#E0474C', '#3FA9F5', '#F2B33D', '#5EC27A', '#8E5BD8', '#EE5E9A'];
  for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) { c.fillStyle = bc[(r * 3 + i) % 6]; c.fillRect(1930 + i * 70, -2300 + r * 460 + 460 - 300 + (i % 3) * 30, 54, 300 - (i % 3) * 30); }
  // plant (far left)
  c.fillStyle = '#6A9E5A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(-2900 + i * 30, -700 - i * 60, 60, 170, -0.6 + i * 0.22, 0, TAU); c.fill(); } c.fillStyle = '#C9733A'; rr(c, -2980, -320, 240, 320, 20); c.fill();
  // skirting, floor, rug
  c.fillStyle = '#D9C8E2'; c.fillRect(BX0, -90, BW, 90);
  c.fillStyle = '#B07C52'; c.fillRect(BX0, 0, BW, 1800); c.fillStyle = 'rgba(0,0,0,.07)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, 0, 8, 1800);
  c.fillStyle = '#F2C6D6'; c.beginPath(); c.ellipse(0, 150, 1300, 120, 0, 0, TAU); c.fill(); c.strokeStyle = '#E8A0BA'; c.lineWidth = 14; c.beginPath(); c.ellipse(0, 150, 1180, 92, 0, 0, TAU); c.stroke();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);
// sofa behind them (sharp)
function sofa(c) { const x0 = SOFAX - 900, x1 = SOFAX + 900;
  paint(c, q => { q.m(x0 + 40, -980); q.q(SOFAX, -1020, x1 - 40, -980); q.l(x1 - 40, -470); q.l(x0 + 40, -470); q.z(); }, '#5E8FB0', { sd: 12, hd: 6, lw: 3 });
  paint(c, q => { q.m(x0, -520); q.l(x1, -520); q.l(x1, -120); q.l(x0, -120); q.z(); }, '#6E9FC0', { sd: 10, hd: 5, lw: 3 });
  for (const s of [-1, 1]) paint(c, q => { const x = s < 0 ? x0 - 80 : x1 - 40; q.m(x, -720); q.q(x + 60, -780, x + 120, -720); q.l(x + 120, -120); q.l(x, -120); q.z(); }, '#4E7FA0', { sd: 10, hd: 5, lw: 3 });
  c.fillStyle = '#4A3A2A'; c.fillRect(x0 - 40, -120, 30, 120); c.fillRect(x1 + 10, -120, 30, 120);
  for (const [x, col, r] of [[-560, '#F7E6B0', -0.12], [560, '#EE9AB8', 0.1]]) { c.save(); c.translate(x, -620); c.rotate(r); rr(c, -120, -100, 240, 200, 34); c.fillStyle = col; c.fill(); c.restore(); } }

// ---------------- characters (standing)
const down = (g, s) => reach(g, s, s * g.sw * 1.08, g.ySh + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const forehead = (g, s = 1) => reach(g, s, s * g.hw * 0.15, g.headY - g.hh * 0.42, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const gest = (st, g, who, t, side, b, k = 1.5) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * k + Math.sin(u) * 20), g.ySh + b + Math.cos(u) * 20, { planar: true }); } };
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'happy', turn: 0.25, look: 0.7 };
  st.armL = hold(g, -1, 330, 0.8);
  if (L === 'hook') { st.mood = 'happy'; st.laugh = !speaking('hook_b', t, 0, 0); if (t > 1.2) { st.mood = 'surprised'; st.lookY = 0.25; }
    if (t > hev('nar')) { st.mood = 'smug'; st.lookY = 0; } if (t > hev('face')) { st.mood = 'annoyed'; st.blink = 0; st.look = 0.2; st.turn = 0.1; st.armL = hold(g, -1, 300, 0.9); st.armR = hold(g, 1, 300, 0.9); }
    if (t > hev('wide')) { st.mood = 'skeptical'; st.look = 0.8; st.turn = 0.3; } }
  if (L === 'o1') { st.mood = 'annoyed'; st.turn = 0.25; st.look = 0.7;
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'annoyed'; st.armR = open(g, 1, 1.8, 120); }
    if (t > SP.o1_b.t) { st.mood = 'skeptical'; }
    if (t > e('twitch')) { st.mood = 'annoyed'; st.look = 0.1; st.turn = 0.05; st.blink = (t - e('twitch')) % 0.5 < 0.08 ? 1 : 0.35; st.armL = hold(g, -1, 300, 0.9); st.armR = hold(g, 1, 300, 0.9); } }
  if (L === 'o2') { st.mood = 'smug'; st.turn = 0.25; st.look = 0.7; st.armR = reach(g, 1, g.sw * 1.25, g.ySh + 470, { planar: true });
    if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 120); st.tilt = 0.06; }
    if (t > SP.o2_b.t) { st.mood = 'surprised'; st.tilt = 0; }
    if (t > e('deadpan')) { st.mood = 'bored'; st.blink = 0.55; st.look = 0.1; st.turn = 0.05; st.armL = hold(g, -1, 320, 0.95); st.armR = hold(g, 1, 320, 0.95); } }
  if (L === 'o3') { st.mood = 'happy'; st.turn = 0.25; st.look = 0.7; st.tilt = 0.05;
    if (speaking('o3_h', t, 0.1, 0.1)) { const u = t - SP.o3_h.t; st.armL = open(g, -1, 1.5, 150 + Math.sin(t * 5) * 12); if (u > 2.2) { st.armR = open(g, 1, 1.9, 60); st.mood = 'smug'; } }
    if (t > SP.o3_b.t) { st.mood = 'happy'; st.tilt = 0; }
    if (t > e('warm')) { st.mood = 'happy'; st.blink = 1; st.turn = 0.05; st.look = 0.1; st.tilt = 0.06; st.laugh = true; } }
  if (L === 'o4') { st.mood = 'smug'; st.turn = 0.2; st.look = 0.5; st.blink = 0.3;
    if (speaking('o4_h', t, 0.1, 0.1)) { const u = t - SP.o4_h.t; st.mood = u > 5.4 ? 'smug' : 'happy';
      if (u < 2.4) st.armR = open(g, 1, 1.9, 40 + Math.sin(u * 3) * 10);
      else if (u < 5.2) { st.armL = reach(g, -1, -g.sw * 2.3, g.ySh + 60 + Math.sin(u * 2.4) * 30, { planar: true }); st.armR = reach(g, 1, g.sw * 2.3, g.ySh + 60 + Math.cos(u * 2.4) * 30, { planar: true }); st.tilt = -0.05; }
      else { st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 160, { planar: true }); st.armL = hold(g, -1, 300, 0.9); st.tilt = 0.08; st.blink = 1; } }
    if (t > endOf('o4_h') + 0.1) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'end') { st.mood = 'neutral'; st.look = 0.7; st.turn = 0.3;
    if (t > SP.end_b.t + 1.2) { st.mood = 'skeptical'; }
    if (t > e('look')) { st.mood = 'surprised'; st.lookY = 0.75; st.look = 0.6; st.blink = 0; }
    if (t > e('laugh')) { st.mood = 'happy'; st.laugh = true; st.lookY = 0; st.blink = 1; st.armR = hold(g, 1, 360, 0.6); st.headY = Math.abs(Math.sin(t * 9)) * 6; } }
  return st; }
function bfState(t, L) { const g = G.bf, e = k => ev(L, k), st = { ...base(g, t, 'bf7'), mood: 'happy', turn: -0.25, look: -0.7 };
  const phoneOut = (k = 1, mode = 'avatar') => { st.armL = reach(g, -1, -g.sw * lerp(0.9, 1.9, k), g.ySh + lerp(330, 40, k), { planar: true }); st.items = { L: ctx => handPhone(ctx, mode, t) }; };
  const phoneLook = (mode = 'avatar') => { st.armL = reach(g, -1, -g.sw * 0.55, g.ySh + 230, { planar: true }); st.items = { L: ctx => handPhone(ctx, mode, t) }; st.lookY = 0.45; st.look = -0.2; st.turn = -0.1; };
  phoneOut(0.3);
  if (L === 'hook') { phoneOut(1); st.mood = 'happy'; st.laugh = !speaking('hook_b', t, 0, 0); st.headY = -4;
    if (t > hev('nar')) { st.laugh = true; st.blink = 1; } }
  if (L === 'o1') { phoneOut(0.6); st.mood = 'happy';
    if (speaking('o1_h', t, 0, 0.1)) { st.mood = 'surprised'; }
    if (t > SP.o1_b.t - 0.1) { phoneLook('grid'); st.mood = 'happy'; st.armR = speaking('o1_b', t, 0, 0) ? open(g, 1, 1.5, 140 + Math.sin(t * 4) * 15) : down(g, 1); } }
  if (L === 'o2') { phoneOut(0.4); st.mood = 'happy';
    if (speaking('o2_h', t, 0, 0.1)) { st.mood = t > SP.o2_h.t + 2.0 ? 'surprised' : 'happy'; }
    if (t > SP.o2_b.t - 0.1) { phoneOut(1, 'grid'); st.mood = 'smug'; st.laugh = !speaking('o2_b', t, 0, 0); st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 360, { planar: true }); st.headY = -6; } }
  if (L === 'o3') { phoneOut(0.4); st.mood = 'happy';
    if (speaking('o3_h', t, 0, 0.1)) { st.mood = t > SP.o3_h.t + 2.4 ? 'worried' : 'happy'; }
    if (t > SP.o3_b.t - 0.1) { phoneLook('grid'); st.mood = 'worried'; st.armR = reach(g, 1, -g.sw * 0.25, g.ySh + 250 + Math.sin(t * 22) * 8, { planar: true }); } }
  if (L === 'o4') { phoneOut(0.4); st.mood = 'happy';
    if (speaking('o4_h', t, 0, 0)) { const u = t - SP.o4_h.t; st.mood = u > 3.5 ? 'worried' : 'happy'; }
    if (t > endOf('o4_h')) { st.mood = 'shock'; st.blink = 0; }
    if (t > SP.o4_b.t - 0.1) { const u = t - SP.o4_b.t; st.mood = 'shock'; st.blink = 0; st.breathe = 0; phoneOut(0.75 + 0.15 * Math.sin(u * 14)); st.armR = reach(g, 1, -g.sw * 0.4 + Math.sin(u * 30) * 30, g.ySh + 120 + Math.cos(u * 30) * 30, { planar: true }); st.headY = Math.sin(u * 20) * 6; }
    if (t > e('fried')) { st.mood = 'shock'; st.headY = 0; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh + 200, { planar: true }); st.armR = down(g, 1); st.items = { L: ctx => { handPhone(ctx, 'fried', t); smoke(ctx, 0, -260, t - e('fried'), 0.6); } }; st.front = soot; } }
  if (L === 'end') { st.mood = 'worried'; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh + 200, { planar: true }); st.items = { L: ctx => { handPhone(ctx, 'fried', t); smoke(ctx, 0, -260, t - ev('o4', 'fried'), 0.6, 4); } }; st.front = soot;
    if (t > e('ding')) { phoneLook('fried'); st.items = { L: ctx => handPhone(ctx, 'fried', t, Math.max(0, 1 - (t - e('ding')) / 0.6)) }; st.mood = 'surprised'; }
    if (t > SP.end_b.t - 0.1) { phoneLook('fried'); st.mood = speaking('end_b', t, 0, 0) && t > SP.end_b.t + 1.4 ? 'worried' : 'surprised'; st.look = -0.3; }
    if (t > e('look')) { st.mood = 'worried'; st.lookY = 0.6; st.look = -0.1; st.armL = down(g, -1); st.items = {}; }
    if (t > e('laugh')) { st.mood = 'sad'; st.lookY = 0.5; st.headY = 8; st.armR = forehead(g, 1); st.headFirst = true; } }
  return st; }
// soot smudges on his face after the phone blows up
function soot(c, gg) { c.save(); c.translate(gg.head.x, gg.head.y); c.fillStyle = 'rgba(40,40,48,.45)'; for (const [x, y, r] of [[-0.45, 0.2, 0.18], [0.35, 0.35, 0.14], [0.05, -0.55, 0.2]]) { c.beginPath(); c.ellipse(x * G.bf.hw, y * G.bf.hh, r * G.bf.hw, r * G.bf.hh * 0.7, 0.3, 0, TAU); c.fill(); }
  c.strokeStyle = '#7A4A2A'; c.lineWidth = 6; c.lineCap = 'round'; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * G.bf.hw * 0.2, -G.bf.hh * 0.95); c.lineTo(i * G.bf.hw * 0.32, -G.bf.hh * 1.35 - (i % 2) * 14); c.stroke(); } c.restore(); }

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'bf'], cover: ['her', 'bf'], two: ['her', 'bf'], her: ['her'], bf: ['bf'], endw: ['her', 'bf'] };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  sofa(c);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), X.her, 0);
  if (who.includes('bf')) heads.bf7 = K.put(c, BF, bfState(t, L), X.bf, 0);
  // eye twitch (hook face, o1 "Большой архив"): little jitter strokes next to her eye
  const tw = (L === 'hook' && t > hev('face')) || (L === 'o1' && t > ev('o1', 'twitch'));
  if (tw && heads.her) { const hd = heads.her, j = Math.sin(t * 60) * 4; c.save(); c.strokeStyle = '#E0474C'; c.lineWidth = 7; c.lineCap = 'round';
    for (const [a, l] of [[-0.5, 34], [0, 40], [0.5, 34]]) { const x0 = hd.x + G.her.hw * 1.1 + j, y0 = hd.y - G.her.hh * 0.05; c.beginPath(); c.moveTo(x0 + Math.cos(a) * 18, y0 + Math.sin(a) * 18); c.lineTo(x0 + Math.cos(a) * (18 + l), y0 + Math.sin(a) * (18 + l)); c.stroke(); } c.restore(); }
  // o4: sparkles around her while she speaks like a gallery guide
  if (L === 'o4' && heads.her && speaking('o4_h', t, 0, 0)) { const hd = heads.her; for (let i = 0; i < 5; i++) { const a = t * 1.3 + i * 1.26, k = 0.6 + 0.4 * Math.sin(t * 5 + i); star(c, hd.x + Math.cos(a) * hd.hh * 2.4, hd.y + Math.sin(a) * hd.hh * 1.6 - 60, 26 * k, 0.9, '#FFE15A'); } }
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(0, fy(HY('bf'), 0.56, 1050), 0.56, 'cover'), BF_LOW: S(X.bf - 60, fy(HY('bf'), 0.9, 1130), 0.9, 'bf'), WIDE: S(0, fy(HY('bf'), 0.52, 640), 0.52, 'wide'), TWO: S(0, fy(HY('bf'), 0.6, 760), 0.6, 'two'),
  HER: S(X.her + 20, fy(HY('her'), 1.0, 900), 1.0, 'her'), HER_W: S(X.her + 40, fy(HY('her'), 0.72, 760), 0.72, 'her'), HER_R: S(X.her + 20, fy(HY('her'), 1.05, 1000), 1.05, 'her'),
  BF: S(X.bf - 60, fy(HY('bf'), 0.95, 900), 0.95, 'bf'), BF_CU: S(X.bf - 40, fy(HY('bf'), 1.15, 900), 1.15, 'bf'),
  ENDW: S(0, fy(HY('bf'), 0.6, 700), 0.6, 'endw'),
  PROFILE: U('profile', 1), FEED: U('feed', 2), LIKES: U('likes', 3), BIN: U('bin', 4), DEL: U('del', 5), NOTIF: U('notif', 6), SOCKS: U('socks', 7) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('solo')) return SH.COVER; if (t < hev('nar') - 0.02) return f(SH.BF_LOW); if (t < hev('avatar')) return f(SH.TWO); if (t < hev('face')) return f(SH.PROFILE); if (t < hev('wide')) return f(SH.HER_R); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_b.t - 0.1) return f(SH.HER); if (t < e('scroll')) return f(SH.BF); if (t < e('twitch')) return f(SH.FEED); return f(SH.HER_R); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_b.t - 0.1) return f(SH.HER); if (t < e('likes')) return f(SH.BF); if (t < e('deadpan')) return f(SH.LIKES); return f(SH.HER_R); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_b.t - 0.1) return f(SH.HER); if (t < e('bin')) return f(SH.BF); if (t < e('warm')) return f(SH.BIN); return f(SH.HER_R); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('gallery')) return f(SH.HER); if (t < SP.o4_b.t - 0.1) return f(SH.HER_W); if (t < e('delete')) return f(SH.BF_CU); if (t < e('fried')) return f(SH.DEL); return f(SH.BF); }
  if (L === 'end') { if (t < e('notif')) return f(SH.BF); if (t < SP.end_b.t - 0.1) return f(SH.NOTIF); if (t < e('look')) return f(SH.BF); if (t < e('socks')) return f(SH.HER_R); if (t < e('laugh')) return f(SH.SOCKS); return f(SH.ENDW); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'powerdown']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts: the phone on a solid backdrop (and the socks)
function backdrop(c, col) { c.fillStyle = col; c.fillRect(0, 0, W, HH); c.fillStyle = 'rgba(255,255,255,.05)'; for (let k = 0; k < 12; k++) c.fillRect(0, k * 180, W, 70); }
function phoneView(c, t, tag) { const L = sceneAt(t).id;
  if (tag === 'ui:socks') { socksView(c, t); return; }
  const hook = tag === 'ui:profile', s = hook ? 1.02 : 1.28, y = hook ? 945 : 860;
  backdrop(c, ({ 'ui:profile': '#3E4A7A', 'ui:feed': '#3E4A7A', 'ui:likes': '#7A2A4A', 'ui:bin': '#2E6A5A', 'ui:del': '#7A2430', 'ui:notif': '#2B2F3A' })[tag]);
  let shx = 0, shy = 0, rot = 0;
  if (tag === 'ui:del') { const u = t - ev('o4', 'delete'), fr = t > ev('o4', 'smoke'); shx = Math.sin(t * 70) * (fr ? 4 : 10); shy = Math.cos(t * 55) * (fr ? 3 : 8); rot = Math.sin(t * 40) * 0.02; }
  K.phone(c, 540 + shx, y + shy, s, (cc, w, h) => {
    if (tag === 'ui:profile') { const a = hev('grid'), k = eIO(clamp((t - a) / 0.5)); profileScreen(cc, w, h, t, k * 250, clamp((t - a - 0.4) / 0.3)); }
    if (tag === 'ui:feed') feedScreen(cc, w, h, t, t - ev('o1', 'scroll'));
    if (tag === 'ui:likes') likesScreen(cc, w, h, t, t - ev('o2', 'likes'));
    if (tag === 'ui:bin') binScreen(cc, w, h, t, t - ev('o3', 'bin'));
    if (tag === 'ui:del') deleteScreen(cc, w, h, t, t - ev('o4', 'delete'), t > ev('o4', 'smoke') ? 1 : 0);
    if (tag === 'ui:notif') notifScreen(cc, w, h, t, t - ev('end', 'notif'));
  }, rot);
  if (tag === 'ui:del' && t > ev('o4', 'smoke')) { const u = t - ev('o4', 'smoke'); smoke(c, 540, y - 400 * s + 40, u, 1.6, 9); for (let i = 0; i < 6; i++) { const a = (u * 3 + i / 6) % 1; c.globalAlpha = 1 - a; star(c, 540 + Math.cos(i * 1.7) * (120 + a * 260), y - 200 + Math.sin(i * 1.7) * (120 + a * 200), 30 * (1 - a), 1, '#FFB020'); c.globalAlpha = 1; } }
  if (tag === 'ui:notif') smoke(c, 540 + 150, y - 400 * s + 30, t - ev('o4', 'fried'), 0.8, 4);
  if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: tag }); }
// his feet in grey socks: holes, big toe out, stink lines
function socksView(c, t) { backdrop(c, '#B07C52'); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = 0; x < W; x += 140) c.fillRect(x, 0, 6, HH);
  const u = t - ev('end', 'socks');
  for (const [sx, fl] of [[390, -1], [690, 1]]) { c.save(); c.translate(sx, 1000); c.scale(fl * 0.9, 0.9); const wig = Math.sin(u * 9 + fl) * 0.05; c.rotate(wig);
    c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(20, 300, 260, 50, 0, 0, TAU); c.fill();
    paint(c, q => { q.m(-110, -420); q.l(110, -420); q.l(120, 80); q.b(130, 220, 300, 230, 330, 290); q.q(340, 330, 270, 330); q.l(-120, 330); q.q(-170, 330, -170, 260); q.l(-130, 80); q.z(); }, fl < 0 ? '#9AA0AA' : '#8A90A0', { sd: 10, hd: 5, lw: 5, inner: k => { k.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 4; i++) k.fillRect(-120, -400 + i * 40, 240, 16); } });
    // hole on the heel + big toe poking out
    c.fillStyle = '#F2C9A8'; c.beginPath(); c.ellipse(-110, 250, 42, 34, 0.3, 0, TAU); c.fill(); c.strokeStyle = '#5A5F6A'; c.lineWidth = 5; c.stroke();
    paint(c, q => q.e(318, 300, 40, 32), '#F2C9A8', { sd: 4, hd: 2, lw: 4 }); c.fillStyle = '#F8E2D0'; c.beginPath(); c.ellipse(330, 290, 16, 12, 0, 0, TAU); c.fill();
    c.restore(); }
  // stink lines (wavy, green)
  c.strokeStyle = '#7FBF3A'; c.lineWidth = 12; c.lineCap = 'round'; for (let i = 0; i < 5; i++) { const x0 = 300 + i * 120, ph = (u * 0.8 + i * 0.2) % 1; if (i === 2) continue; c.globalAlpha = Math.sin(ph * Math.PI) * 0.85; c.beginPath(); for (let k = 0; k <= 12; k++) { const y = 560 - ph * 220 - k * 24; c.lineTo(x0 + Math.sin(k * 0.9 + t * 6) * 24, y); } c.stroke(); } c.globalAlpha = 1;
  // a fly buzzing around
  const fx = 540 + Math.sin(t * 3.1) * 260, fy_ = 330 + Math.sin(t * 5.3) * 60; c.fillStyle = '#1E2030'; c.beginPath(); c.arc(fx, fy_, 16, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(fx - 14, fy_ - 18, 16, 9, -0.6 + Math.sin(t * 60) * 0.4, 0, TAU); c.ellipse(fx + 14, fy_ - 18, 16, 9, 0.6 - Math.sin(t * 60) * 0.4, 0, TAU); c.fill(); }

// ---------------- overlays: title, comment plate, option plates
function title(c, t) { const a = 1 - P(t, hev('title_out') - 0.25, hev('title_out')); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 290); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 125, w: 980, h: 330, k: a, id: 'title' }); }
function commentPlate(c, t) { const a = hev('plate'), k = eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, SC.hook.e - 0.25, SC.hook.e - 0.05)); if (k <= 0) return;
  c.save(); c.translate(540, 330); c.rotate(-0.025); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, -440 + 8, -130 + 12, 880, 260, 34); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -440, -130, 880, 260, 34); c.fill();
  c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(-330, 125); c.lineTo(-290, 173); c.lineTo(-270, 125); c.fill();
  c.fillStyle = '#EE5E9A'; rr(c, -440, -130, 880, 70, [34, 34, 0, 0]); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -400, -113, 46, 34, 10); c.fill(); c.beginPath(); c.moveTo(-392, -83); c.lineTo(-396, -67); c.lineTo(-376, -81); c.fill();
  fitTxt(c, 'Вопрос из комментариев:', -335, -95, 36, '#FFFFFF', 700, 'Nun9', 'left');
  fitTxt(c, 'наше фото на аватарке, а фото', 0, -4, 50, '#1E2030', 820, 'Unb9'); fitTxt(c, 'с бывшей висят. Как сказать?', 0, 66, 50, '#1E2030', 820, 'Unb9');
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 100, y: 200, w: 880, h: 260, k, id: 'comment' }); }
const PLATES = { o1: ['1', 'ХОЛОДНО', '#E0474C'], o2: ['2', 'С ЮМОРОМ', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD8'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  c.save(); UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, s = k * Math.min(lerp(1, 1.4, big), 900 / w), y = 160;
  c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w * s / 2, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: «КАКОЙ ОТВЕТ ТВОЙ?», 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor (all inside x 60–940)
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, wt = (w, d) => K.wordT('outro', w) ?? (sp.t + d), CX = 500;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + boyfriend (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34; 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gb = G.bf;
    K.put(c, BF, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.5, armL: reach(gb, -1, -gb.sw * 1.6, gb.ySh + 120, { planar: true }), armR: hold(gb, 1, 300, 0.8), items: { L: ctx => handPhone(ctx, 'avatar', t) } }, 640, 60);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(t * 8) * 30, { planar: true }), armR: hold(g, 1, 300, 0.95) }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.15, 0.5), 2.2);
  if (q > 0) { c.save(); c.translate(CX, 290); c.scale(q, q); UI.font(c, 'Unb9', 76); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'КАКОЙ ОТВЕТ', 0, -48, C.oliveD, C.white, 14); UI.strokeText(c, 'ТВОЙ?', 0, 48, C.pink, C.white, 14); c.restore(); }
  const rows = [['1', 'ХОЛОДНО', 'And her? Delete.', '#E0474C', 'один'], ['2', 'С ЮМОРОМ', 'Or just a guest star?', '#F2B33D', 'два'], ['3', 'КАК НОСИТЕЛЬ', 'Clear out the old photos.', '#4CAF6A', 'три'], ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', 'Your profile is a museum.', '#8E5BD8', 'четыре']];
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
  if (tag.startsWith('ui:')) { phoneView(c, t, tag); proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  // bubbles only for characters drawn in this shot (an off-screen speaker never gets a bubble over another shot)
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names: { bf7: ['CHARLIE', '#3E78C2'] }, hold: { hook_b: -0.15, o1_h: -0.15, o1_b: -0.2, o2_h: -0.15, o2_b: -0.2, o3_h: -0.15, o3_b: -0.2, o4_h: -0.15, o4_b: -0.2, end_b: -0.15 } });
  if (L === 'hook') { title(c, t); commentPlate(c, t); }
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('exphotos', NF, renderFrame);
